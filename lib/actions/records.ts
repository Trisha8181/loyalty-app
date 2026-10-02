"use server";
import { revalidatePath } from "next/cache";
import { saveRecord, removeRecord } from "@/lib/data";
import type { Kind } from "@/lib/types";
export type Result = {ok:boolean; message:string; id?:string};
const tables:Kind[]=["campaigns","memberships","receipts","gifts","redemptions"];
export async function mutate(_:Result, form:FormData):Promise<Result>{
 try{
  const kind=String(form.get("kind")) as Kind;
  if(!tables.includes(kind)) throw Error("Unknown record type.");
  const get=(key:string)=>String(form.get(key)??"").trim();
  const required=(key:string)=>{const v=get(key);if(!v)throw Error(`${key.replaceAll('_',' ')} is required.`);return v;};
  const choice=(key:string,allowed:string[])=>{const v=required(key);if(!allowed.includes(v))throw Error(`Invalid ${key}.`);return v;};
  const amount=(key:string,positive=false)=>{const raw=required(key).replace(/^\$\s*/,"").replaceAll(",","");if(!/^\d+(\.\d{1,2})?$/.test(raw))throw Error("Enter a valid amount with up to 2 decimal places.");const n=Number(raw);if(!Number.isFinite(n)||n>99999999.99||(positive?n<=0:n<0))throw Error("Amount is out of range.");return n;};
  const date=(key:string)=>{const v=required(key);if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||new Date(v).toISOString().slice(0,10)!==v)throw Error("Enter a valid date.");return v;};
  const id=get("id")||undefined;
  if(get("operation")==="delete") {if(!id)throw Error("Missing record.");await removeRecord(kind,id);revalidatePath("/","layout");return {ok:true,message:"Record deleted."};}
  let values:Record<string,unknown>={};
  if(kind==="campaigns") {values={name:required("name"),start_date:date("start_date"),end_date:date("end_date"),status:choice("status",["active","paused","completed"])};if(String(values.end_date)<String(values.start_date))throw Error("End date must be on or after start date.");}
  if(kind==="memberships") values={name:required("name").replace(/\s+/g," "),gender:choice("gender",["female","male","other","unspecified"]),tier:choice("tier",["bronze","silver","gold"]),lifecycle_status:choice("lifecycle_status",["new","active","churned"])};
  if(kind==="receipts") values={member_id:required("member_id"),amount:amount("amount",true),store:required("store"),transaction_date:date("transaction_date"),campaign_id:get("campaign_id")||null};
  if(kind==="gifts") {const stock=id?undefined:Number(required("stock"));if(stock!==undefined&&(!Number.isInteger(stock)||stock<0||stock>1000000))throw Error("Stock must be a whole number from 0 to 1,000,000.");values={name:required("name"),description:get("description"),...(stock===undefined?{}:{stock}),threshold_amount:amount("threshold_amount"),campaign_id:get("campaign_id")||null};}
  if(kind==="redemptions") values=id?{status:"cancelled"}:{member_id:required("member_id"),gift_id:required("gift_id"),receipt_id:required("receipt_id"),status:"completed"};
  const saved=await saveRecord(kind,values,id);revalidatePath("/","layout");return {ok:true,message:id?(kind==="redemptions"?"Redemption cancelled and stock returned.":"Changes saved."):(kind==="redemptions"?"Gift redeemed. Inventory updated.":"Record created."),id:saved};
 }catch(e){return {ok:false,message:e instanceof Error?e.message:"Unable to save. Please try again."};}
}

