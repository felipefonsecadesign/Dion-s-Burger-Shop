import assert from "node:assert/strict";
import { customerEndpoint, customerPublicKey } from "../lib/customer-api.ts";
const origin="https://dionsburgershop.vercel.app";
const headers={"content-type":"application/json",origin,apikey:customerPublicKey,authorization:"Bearer "+customerPublicKey};
const fixture={requestId:"ccf74576-827e-4d23-b042-1c2c28cc26b0",fullName:"TESTE TECNICO AUTOMATIZADO",phone:"11999990000",email:"qa@example.invalid",source:"qa-automated",privacyConsent:true,marketingConsent:false,website:""};
async function post(body){return fetch(customerEndpoint,{method:"POST",headers,body:JSON.stringify(body)});}
assert.equal((await post({...fixture,privacyConsent:false})).status,400,"Reject missing privacy consent");
assert.equal((await post({...fixture,phone:"123"})).status,400,"Reject invalid phone");
assert.equal((await post(fixture)).status,200,"Save valid customer");
assert.equal((await post(fixture)).status,200,"Retry safely");
assert.equal((await post({...fixture,fullName:"OUTRO NOME"})).status,409,"Reject reused key with altered payload");
const database=customerEndpoint.split("/functions/")[0]+"/rest/v1";
assert.equal((await fetch(database+"/customer_leads?select=id",{headers:{apikey:customerPublicKey,authorization:"Bearer "+customerPublicKey}})).status,401,"Anonymous cannot read contacts");
const noAuth=await fetch(customerEndpoint,{method:"POST",headers:{origin,"content-type":"application/json"},body:JSON.stringify(fixture)});
assert.equal(noAuth.status,401,"Gateway requires JWT");
console.log("7 checks passed: validation, consent, storage, retry, key conflict, private contacts, JWT.");
