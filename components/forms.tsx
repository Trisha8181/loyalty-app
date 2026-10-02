"use client";
import { useActionState, useState } from "react";
import { mutate } from "@/lib/actions/records";
import { money, type Dataset, type Kind, type Row } from "@/lib/types";
export function RecordForm({kind,data,row}:{kind:Kind;data:Dataset;row?:Row}){
 const [state,action,pending]=useActionState(mutate,{ok:false,message:""});
 const [member,setMember]=useState(row?.member_id??"");
 const [gift,setGift]=useState(row?.gift_id??"");
 const [receipt,setReceipt]=useState(row?.receipt_id??"");
 const input=(name:string,label:string,type="text",fallback="")=><label key={name}>{label}<input name={name} type={type} required={name!=="description"} defaultValue={String(row?.[name as keyof Row]??fallback)} min={type==="number"?0:undefined} step={type==="number"?1:undefined} maxLength={type==="text"?200:undefined}/></label>;
 const select=(name:string,label:string,options:{id:string;name:string}[],fallback="",optional=false)=><label key={name}>{label}<select name={name} defaultValue={String(row?.[name as keyof Row]??fallback)} required={!optional}><option value="">{optional?"No campaign":"Choose an option"}</option>{options.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>;
 const enumSelect=(name:string,label:string,values:string[],fallback:string)=>select(name,label,values.map(v=>({id:v,name:v[0].toUpperCase()+v.slice(1)})),fallback);
 const campaigns=data.campaigns.map(c=>({id:c.id,name:c.name!}));
 const selectedGift=data.gifts.find(g=>g.id===gift); const selectedReceipt=data.receipts.find(r=>r.id===receipt);
 const used=new Set(data.redemptions.filter(r=>r.status==="completed").map(r=>r.receipt_id));
 const eligible=selectedGift&&selectedReceipt&&Number(selectedGift.stock)>0&&Number(selectedReceipt.amount)>=Number(selectedGift.threshold_amount)&&(!selectedGift.campaign_id||selectedGift.campaign_id===selectedReceipt.campaign_id)&&!used.has(receipt);
 return <form action={action} className="record-form"><input type="hidden" name="kind" value={kind}/>{row&&<input type="hidden" name="id" value={row.id}/>}
 {kind==="campaigns"&&<>{input("name","Campaign name")}{input("start_date","Start date","date")}{input("end_date","End date","date")}{enumSelect("status","Status",["active","paused","completed"],"active")}</>}
 {kind==="memberships"&&<>{input("name","Member name")}{enumSelect("gender","Gender",["female","male","other","unspecified"],"unspecified")}{enumSelect("tier","Tier",["bronze","silver","gold"],"bronze")}{enumSelect("lifecycle_status","Lifecycle",["new","active","churned"],"new")}</>}
 {kind==="receipts"&&<>{select("member_id","Member",data.memberships.map(m=>({id:m.id,name:m.name!})))}{input("amount","Receipt amount ($)")}{input("store","Store")}{input("transaction_date","Transaction date","date",new Date().toISOString().slice(0,10))}{select("campaign_id","Campaign",campaigns,"",true)}</>}
 {kind==="gifts"&&<>{input("name","Gift name")}{input("description","Description")}{input("stock","Stock","number","0")}{input("threshold_amount","Minimum receipt ($)","text","0")}{select("campaign_id","Campaign",campaigns,"",true)}</>}
 {kind==="redemptions"&&!row&&<>
 <label>Member<select name="member_id" required value={member} onChange={e=>{setMember(e.target.value);setReceipt("");}}><option value="">Choose a member</option>{data.memberships.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
 <label>Gift<select name="gift_id" required value={gift} onChange={e=>setGift(e.target.value)}><option value="">Choose a gift</option>{data.gifts.map(g=><option key={g.id} value={g.id} disabled={!g.stock}>{g.name} · {g.stock} left · {money(Number(g.threshold_amount))} minimum</option>)}</select></label>
 <label>Qualifying receipt<select name="receipt_id" required value={receipt} onChange={e=>setReceipt(e.target.value)}><option value="">Choose this member’s receipt</option>{data.receipts.filter(r=>r.member_id===member).map(r=><option key={r.id} value={r.id} disabled={used.has(r.id)}>{money(Number(r.amount))} · {r.store} · {r.transaction_date}{used.has(r.id)?" · already redeemed":""}</option>)}</select></label>
 {member&&!data.receipts.some(r=>r.member_id===member)&&<p className="notice">Submit a receipt for this member first.</p>}
 {selectedGift&&selectedReceipt&&<p className={eligible?"success":"notice"}>{eligible?"Eligible. Completing this redemption will deduct one gift.":"Not eligible. Check the amount, campaign, and available stock."}</p>}
 </>}
 {kind==="redemptions"&&row&&<p>Cancel this redemption and return one gift to inventory?</p>}
 <button disabled={pending||(kind==="redemptions"&&!row&&!eligible)} type="submit">{pending?"Saving…":row?(kind==="redemptions"?"Confirm cancellation":"Save changes"):(kind==="redemptions"?"Redeem gift":"Save record")}</button>
 {state.message&&<p role="status" className={state.ok?"success":"notice"}>{state.message}</p>}
 </form>;
}
export function DeleteButton({kind,id}:{kind:Kind;id:string}){
 const [state,action,pending]=useActionState(mutate,{ok:false,message:""});
 return <form action={action} onSubmit={e=>{if(!confirm("Delete this record? Linked records may prevent deletion."))e.preventDefault();}}><input type="hidden" name="kind" value={kind}/><input type="hidden" name="id" value={id}/><input type="hidden" name="operation" value="delete"/><button className="danger" disabled={pending}>{pending?"Deleting…":"Delete"}</button>{state.message&&<p role="status" className="notice">{state.message}</p>}</form>;
}
