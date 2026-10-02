import assert from 'node:assert/strict';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if(!url||!key)throw Error('Load .env.local first');
const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=representation'};
async function req(table,method='GET',body){const r=await fetch(`${url}/rest/v1/${table}`,{method,headers,body:body?JSON.stringify(body):undefined});const data=await r.json();return {ok:r.ok,data,status:r.status};}
async function add(table,body){const r=await req(table,'POST',body);assert.equal(r.ok,true,JSON.stringify(r.data));return r.data[0];}
const tag=`Verification ${new Date().toISOString()}`;
const member=await add('memberships',{name:tag,gender:'female',tier:'bronze'});
const receipt=await add('receipts',{member_id:member.id,amount:120,store:'Verification Store',transaction_date:new Date().toISOString().slice(0,10)});
const gift=await add('gifts',{name:tag,stock:1,threshold_amount:100});
const redemption=await add('redemptions',{member_id:member.id,gift_id:gift.id,receipt_id:receipt.id,status:'completed'});
let stock=await req(`gifts?id=eq.${gift.id}`);assert.equal(stock.data[0].stock,0);
const duplicate=await req('redemptions','POST',{member_id:member.id,gift_id:gift.id,receipt_id:receipt.id,status:'completed'});assert.equal(duplicate.ok,false);
const cancelled=await req(`redemptions?id=eq.${redemption.id}`,'PATCH',{status:'cancelled'});assert.equal(cancelled.ok,true,JSON.stringify(cancelled.data));
stock=await req(`gifts?id=eq.${gift.id}`);assert.equal(stock.data[0].stock,1);
const repeatCancel=await req(`redemptions?id=eq.${redemption.id}`,'PATCH',{status:'cancelled'});assert.equal(repeatCancel.ok,false);
const low=await add('receipts',{member_id:member.id,amount:50,store:'Verification Store',transaction_date:new Date().toISOString().slice(0,10)});
const rejected=await req('redemptions','POST',{member_id:member.id,gift_id:gift.id,receipt_id:low.id,status:'completed'});assert.equal(rejected.ok,false);assert.match(rejected.data.message,/threshold/);
const r2=await add('receipts',{member_id:member.id,amount:120,store:'Verification Store',transaction_date:new Date().toISOString().slice(0,10)});
const race=await Promise.all([receipt,r2].map(r=>req('redemptions','POST',{member_id:member.id,gift_id:gift.id,receipt_id:r.id,status:'completed'})));
assert.equal(race.filter(r=>r.ok).length,1,'Only one concurrent claim can take the last gift');
stock=await req(`gifts?id=eq.${gift.id}`);assert.equal(stock.data[0].stock,0);
const audit=await req(`audit_logs?entity_id=eq.${member.id}`);assert.ok(audit.data.length>0);
const forged=await req('audit_logs','POST',{action:'forged'});assert.equal(forged.ok,false,'Clients cannot forge audit records');
console.log('PASS: persisted member and $120 receipt; redemption and stock; duplicate/out-of-stock/threshold rejection; cancellation exactly once; concurrent last-stock safety; append-only audit.');
console.log('Verification fixture:',member.id);
