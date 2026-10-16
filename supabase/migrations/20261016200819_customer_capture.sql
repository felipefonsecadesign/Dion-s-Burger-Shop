create table public.customer_leads (
 id uuid primary key default gen_random_uuid(),
 campaign text not null default 'dions-prelaunch-v1',
 full_name text not null check(length(full_name) between 3 and 100),
 phone text not null check(phone ~ '^55[1-9][0-9]{9,10}$'),
 email text check(email is null or length(email) <= 254),
 source text not null default 'site' check(length(source)<=80),
 marketing_consent boolean not null default false,
 privacy_version text not null default '2026-10-16',
 consent_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 unique(campaign,phone)
);
create table public.capture_requests (
 id uuid primary key,
 payload_hash text not null,
 lead_id uuid not null references public.customer_leads(id),
 created_at timestamptz not null default now()
);
create table public.capture_rate_limits (
 client_hash text not null,
 bucket timestamptz not null,
 attempts integer not null default 1,
 primary key(client_hash,bucket)
);
create table public.sheets_outbox (
 lead_id uuid primary key references public.customer_leads(id),
 state text not null default 'pending' check(state in ('pending','synced')),
 attempts integer not null default 0,
 created_at timestamptz not null default now(),
 synced_at timestamptz
);
create index sheets_outbox_pending on public.sheets_outbox(created_at) where state='pending';
alter table public.customer_leads enable row level security;
alter table public.capture_requests enable row level security;
alter table public.capture_rate_limits enable row level security;
alter table public.sheets_outbox enable row level security;
revoke all on public.customer_leads,public.capture_requests,public.capture_rate_limits,public.sheets_outbox from public,anon,authenticated;
grant select,insert,update,delete on public.customer_leads,public.capture_requests,public.capture_rate_limits,public.sheets_outbox to service_role;

-- Invoker only: never callable by the public API roles. One transaction handles
-- rate limiting, idempotency, contact uniqueness and durable Sheets queueing.
create function public.capture_customer(
 p_request_id uuid,p_payload_hash text,p_client_hash text,p_full_name text,
 p_phone text,p_email text,p_source text,p_marketing boolean
) returns uuid language plpgsql security invoker set search_path='' as $$
declare v_id uuid; v_hash text; v_count integer; v_bucket timestamptz;
begin
 if length(p_client_hash)<>64 or length(p_payload_hash)<>64 then raise exception 'invalid_request'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_client_hash,0));
 select lead_id,payload_hash into v_id,v_hash from public.capture_requests where id=p_request_id;
 if found then
  if v_hash<>p_payload_hash then raise exception 'idempotency_conflict'; end if;
  return v_id;
 end if;
 v_bucket:=to_timestamp(floor(extract(epoch from now())/900)*900);
 insert into public.capture_rate_limits(client_hash,bucket) values(p_client_hash,v_bucket)
 on conflict(client_hash,bucket) do update set attempts=public.capture_rate_limits.attempts+1 returning attempts into v_count;
 if v_count>10 then raise exception 'rate_limited'; end if;
 -- Global ceiling also bounds distributed abuse; no public reads are exposed.
 perform pg_advisory_xact_lock(73901361);
 if (select count(*) from public.customer_leads where created_at>now()-interval '1 hour')>=200 then raise exception 'rate_limited';end if;
 insert into public.customer_leads(full_name,phone,email,source,marketing_consent)
 values(p_full_name,p_phone,p_email,p_source,coalesce(p_marketing,false))
 on conflict(campaign,phone) do nothing returning id into v_id;
 if v_id is null then select id into v_id from public.customer_leads where campaign='dions-prelaunch-v1' and phone=p_phone;end if;
 insert into public.capture_requests(id,payload_hash,lead_id) values(p_request_id,p_payload_hash,v_id);
 insert into public.sheets_outbox(lead_id) values(v_id) on conflict do nothing;
 delete from public.capture_rate_limits where bucket<now()-interval '1 day';
 return v_id;
end $$;
revoke all on function public.capture_customer(uuid,text,text,text,text,text,text,boolean) from public,anon,authenticated;
grant execute on function public.capture_customer(uuid,text,text,text,text,text,text,boolean) to service_role;
comment on table public.customer_leads is 'Prelaunch contacts. No prize allocation or vouchers. Browser roles have no access.';
