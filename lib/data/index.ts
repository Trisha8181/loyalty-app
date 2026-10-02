import {createClient} from "@/lib/supabase/server";
import {activeWorkspace,requireRecordInWorkspace} from "@/lib/data/teams";
import type {Dataset,Kind,Row} from "@/lib/types";
export async function loadData():Promise<Dataset>{
 const db=await createClient();const workspace=await activeWorkspace();
 const names:Kind[]=["campaigns","memberships","receipts","gifts","redemptions"];
 const entries=await Promise.all(names.map(async table=>{
  const rows:Row[]=[];
  for(let offset=0;;offset+=500){
   let query=db.from(table).select("*");query=workspace?query.eq("workspace_id",workspace):query.is("workspace_id",null);
   const {data,error}=await query.order("created_at",{ascending:false}).order("id").range(offset,offset+499);
   if(error)throw Error(`Unable to load ${table}. Please try again.`);rows.push(...data as Row[]);if(data.length<500)break;
  }return [table,rows] as const;
 }));return Object.fromEntries(entries) as Dataset;
}
export async function saveRecord(table:Kind,values:Record<string,unknown>,id?:string){
 const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)throw Error("Sign in to save records.");const workspace=await activeWorkspace();
 let query;
 if(id){let update=db.from(table).update(values).eq("id",id);update=workspace?update.eq("workspace_id",workspace):update.is("workspace_id",null);query=update;}
 else query=db.from(table).insert({...values,user_id:user.id,workspace_id:workspace});
 const {data,error}=await query.select("id").single();if(error)throw Error(error.message);return data.id as string;
}
export async function removeRecord(table:Kind,id:string){const db=await createClient();const workspace=await activeWorkspace();let q=db.from(table).delete().eq("id",id);q=workspace?q.eq("workspace_id",workspace):q.is("workspace_id",null);const {data,error}=await q.select("id").single();if(error||!data)throw Error(error?.code==="23503"?"This record is in use. Remove its unredeemed linked records first.":error?.message??"Record not found.");}
export async function adjustInventory(id:string,delta:number){await requireRecordInWorkspace("gifts",id);const db=await createClient();const {error}=await db.rpc("adjust_gift_stock",{p_gift_id:id,p_delta:delta});if(error)throw Error(error.message);}
export async function reviewTier(id:string,accept:boolean){await requireRecordInWorkspace("memberships",id);const db=await createClient();const {error}=await db.rpc("review_member_tier",{p_member_id:id,p_accept:accept});if(error)throw Error(error.message);}
export async function draftAlert(id:string){await requireRecordInWorkspace("gifts",id);const db=await createClient();const {data,error}=await db.rpc("draft_stock_alert",{p_gift_id:id});if(error)throw Error(error.message);return data as string;}
