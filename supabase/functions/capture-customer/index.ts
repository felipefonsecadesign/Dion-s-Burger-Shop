import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const allowed = new Set(["https://dionsburgershop.vercel.app"]);
const base = Deno.env.get("SUPABASE_URL")!;
const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const encoder = new TextEncoder();
async function digest(text: string) {
 return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(text)))).map(n=>n.toString(16).padStart(2,"0")).join("");
}
async function clientHash(value: string) {
 const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 return Array.from(new Uint8Array(await crypto.subtle.sign("HMAC",key,encoder.encode(value)))).map(n=>n.toString(16).padStart(2,"0")).join("");
}
Deno.serve(async req=>{
 const origin=req.headers.get("origin")??"";
 const headers={"Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin","Access-Control-Allow-Origin":allowed.has(origin)?origin:"https://dionsburgershop.vercel.app","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
 const reply=(status:number,message:string)=>new Response(JSON.stringify({message}),{status,headers});
 if(!allowed.has(origin))return reply(403,"Origem não permitida.");
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return reply(405,"Método não permitido.");
 if(!req.headers.get("content-type")?.startsWith("application/json"))return reply(415,"Envie JSON.");
 if(Number(req.headers.get("content-length")??0)>4096)return reply(413,"Cadastro muito longo.");
 try{
  const reader=req.body?.getReader();let bytes=0;const chunks:Uint8Array[]=[];
  if(!reader)return reply(400,"Cadastro inválido.");
  while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>4096){await reader.cancel();return reply(413,"Cadastro muito longo.");}chunks.push(value);}
  const raw=new Uint8Array(bytes);let pos=0;for(const part of chunks){raw.set(part,pos);pos+=part.length;}
  const b=JSON.parse(new TextDecoder().decode(raw));
  if(typeof b.website!=="string"||b.website!=="")return reply(400,"Cadastro inválido.");
  const name=typeof b.fullName==="string"?b.fullName.trim().replace(/\s+/g," "):"";
  const digits=typeof b.phone==="string"?b.phone.replace(/\D/g,""):"";
  const phone=digits.startsWith("55")&&digits.length>=12?digits:"55"+digits;
  const email=typeof b.email==="string"?b.email.trim().toLowerCase():"";
  const source=typeof b.source==="string"?b.source.trim():"site";
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(b.requestId??""))return reply(400,"Reabra o formulário e tente novamente.");
  if(name.length<3||name.length>100||!name.includes(" ")||/[\u0000-\u001f]/.test(name))return reply(400,"Informe seu nome completo.");
  if(!/^55[1-9]\d{9,10}$/.test(phone))return reply(400,"Informe um WhatsApp com DDD.");
  if(email.length>254||(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))return reply(400,"Confira o e-mail informado.");
  if(source.length>80||b.privacyConsent!==true||typeof b.marketingConsent!=="boolean")return reply(400,"Confira os campos e o aviso de privacidade.");
  const payload=JSON.stringify({name,phone,email,source,marketing:b.marketingConsent,version:"2026-10-16"});
  // Edge ingress owns the forwarded chain; no client-supplied body IP is trusted.
  const ip=(req.headers.get("x-forwarded-for")??req.headers.get("cf-connecting-ip")??"unknown").split(",")[0].trim();
  const result=await fetch(base+"/rest/v1/rpc/capture_customer",{method:"POST",headers:{"Content-Type":"application/json",apikey:secret,Authorization:"Bearer "+secret},body:JSON.stringify({p_request_id:b.requestId,p_payload_hash:await digest(payload),p_client_hash:await clientHash(ip),p_full_name:name,p_phone:phone,p_email:email||null,p_source:source||"site",p_marketing:b.marketingConsent})});
  if(!result.ok){const error=await result.json().catch(()=>({}));if(error.message?.includes("rate_limited"))return reply(429,"Muitas tentativas. Tente novamente em 15 minutos.");if(error.message?.includes("idempotency_conflict"))return reply(409,"Reabra o formulário antes de alterar o cadastro.");return reply(503,"Não foi possível salvar agora. Tente novamente.");}
  // Generic success avoids revealing whether a phone was already registered.
  return reply(200,"Cadastro recebido! Fique de olho nas novidades da Dion’s.");
 }catch{return reply(400,"Não foi possível processar o cadastro.");}
});

