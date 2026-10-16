import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const owner="felipefonsecadesign@gmail.com";
Deno.serve(async req=>{
 const headers={"Content-Type":"application/json","Cache-Control":"no-store"};
 const reply=(status:number,data:unknown)=>new Response(JSON.stringify(data),{status,headers});
 if(req.method!=="POST"||req.headers.has("origin"))return reply(405,{error:"Server-to-server only"});
 const auth=req.headers.get("x-google-authorization");
 if(!auth?.startsWith("Bearer "))return reply(401,{error:"Google authorization required"});
 try{
  const identity=await fetch("https://www.googleapis.com/oauth2/v3/userinfo",{headers:{Authorization:auth}});
  if(!identity.ok)return reply(401,{error:"Google authorization expired"});
  const user=await identity.json();
  if(user.email!==owner||user.email_verified!==true)return reply(403,{error:"Account not authorized"});
  const body=await req.json();
  const base=Deno.env.get("SUPABASE_URL")!+"/rest/v1";
  const secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const dbHeaders={apikey:secret,Authorization:"Bearer "+secret,"Content-Type":"application/json"};
  if(body.action==="pull"){
   const response=await fetch(base+"/sheets_outbox?state=eq.pending&select=lead_id,customer_leads(id,created_at,full_name,phone,email,source,marketing_consent,privacy_version,consent_at)&order=created_at.asc&limit=50",{headers:dbHeaders});
   if(!response.ok)return reply(503,{error:"Database temporarily unavailable"});
   const rows=await response.json();return reply(200,{rows:rows.map((r:Record<string,unknown>)=>r.customer_leads)});
  }
  if(body.action==="ack"&&Array.isArray(body.ids)&&body.ids.length>0&&body.ids.length<=50&&body.ids.every((id:unknown)=>typeof id==="string"&&/^[a-f0-9-]{36}$/.test(id))){
   const response=await fetch(base+"/sheets_outbox?lead_id=in.("+body.ids.join(",")+")",{method:"PATCH",headers:dbHeaders,body:JSON.stringify({state:"synced",synced_at:new Date().toISOString()})});
   return reply(response.ok?200:503,{ok:response.ok});
  }
  return reply(400,{error:"Invalid action"});
 }catch{return reply(503,{error:"Synchronization temporarily unavailable"});}
});
