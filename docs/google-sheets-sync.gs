const DIONS_ENDPOINT="https://zvndirwhvuiyebulmkfi.supabase.co/functions/v1/sheets-sync";
const DIONS_PUBLIC_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bmRpcndodnVpeWVidWxta2ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNzkxNTQsImV4cCI6MjEwNzc1NTE1NH0.Gk3ui0Bgrp3BBlE2fE4OVeHSsuhhhB7IrUrIXT0wt3k";
function dionsCall_(payload){
 const response=UrlFetchApp.fetch(DIONS_ENDPOINT,{method:"post",contentType:"application/json",headers:{Authorization:"Bearer "+DIONS_PUBLIC_KEY,apikey:DIONS_PUBLIC_KEY,"x-google-authorization":"Bearer "+ScriptApp.getOAuthToken()},payload:JSON.stringify(payload),muteHttpExceptions:true});
 if(response.getResponseCode()!==200)throw new Error("Sincronização recusada: HTTP "+response.getResponseCode());
 return JSON.parse(response.getContentText());
}
function dionsSafeCell_(value){
 const text=String(value==null?"":value);
 return [61,43,45,64,9,13,10].includes(text.charCodeAt(0))?"'"+text:text;
}
function sincronizarDions(){
 const lock=LockService.getScriptLock();if(!lock.tryLock(1000))return;
 try{
  const sheet=SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Página1");
  if(!sheet)throw new Error("A aba Página1 não foi encontrada.");
  const rows=dionsCall_({action:"pull"}).rows;
  if(!rows.length)return;
  const count=sheet.getLastRow();
  const known=new Set(count>1?sheet.getRange(2,1,count-1,1).getDisplayValues().flat():[]);
  const fresh=rows.filter(row=>!known.has(row.id));
  if(fresh.length){
   const values=fresh.map(r=>[r.id,r.created_at,r.full_name,r.phone,r.email,r.source,r.marketing_consent?"Sim":"Não",r.privacy_version,r.consent_at,"Interesse no lançamento"].map(dionsSafeCell_));
   const range=sheet.getRange(count+1,1,values.length,10);range.setNumberFormat("@");range.setValues(values);SpreadsheetApp.flush();
  }
  dionsCall_({action:"ack",ids:rows.map(row=>row.id)});
 }finally{lock.releaseLock();}
}
function ativarSincronizacaoDions(){
 sincronizarDions();
 if(!ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==="sincronizarDions"))ScriptApp.newTrigger("sincronizarDions").timeBased().everyMinutes(5).create();
}

