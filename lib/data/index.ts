import { createClient } from "@/lib/supabase/server";
import type { Dataset, Kind, Row } from "@/lib/types";
export async function loadData(): Promise<Dataset> {
 const db=await createClient();
 const names: Kind[]=["campaigns","memberships","receipts","gifts","redemptions"];
 const entries=await Promise.all(names.map(async table=>{
  const rows: Row[]=[];
  for(let offset=0;;offset+=500){
   const {data,error}=await db.from(table).select("*").order("created_at",{ascending:false}).order("id").range(offset,offset+499);
   if(error) throw new Error(`Unable to load ${table}. Please try again.`);
   rows.push(...data as Row[]); if(data.length<500) break;
  }
  return [table,rows] as const;
 }));
 return Object.fromEntries(entries) as Dataset;
}
export async function saveRecord(table: Kind, values: Record<string,unknown>, id?:string){
 const db=await createClient();
 const {data:{user}}=await db.auth.getUser();
 if(!user)throw Error("Sign in to save records.");
 const query=id?db.from(table).update(values).eq("id",id):db.from(table).insert({...values,user_id:user?.id??null});
 const {data,error}=await query.select("id").single();
 if(error) throw new Error(error.message);
 return data.id as string;
}
export async function removeRecord(table:Kind,id:string){
 const db=await createClient(); const {data,error}=await db.from(table).delete().eq("id",id).select("id").single();
 if(error||!data) throw new Error(error?.code==="23503"?"This record is in use. Remove its unredeemed linked records first.":error?.message??"Record not found.");
}
export async function adjustInventory(id:string,delta:number){const db=await createClient();const {error}=await db.rpc("adjust_gift_stock",{p_gift_id:id,p_delta:delta});if(error)throw Error(error.message);}
export async function reviewTier(id:string,accept:boolean){const db=await createClient();const {error}=await db.rpc("review_member_tier",{p_member_id:id,p_accept:accept});if(error)throw Error(error.message);}
export async function draftAlert(id:string){const db=await createClient();const {data,error}=await db.rpc("draft_stock_alert",{p_gift_id:id});if(error)throw Error(error.message);return data as string;}
