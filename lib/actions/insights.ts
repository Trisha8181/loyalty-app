"use server";
import {revalidatePath} from "next/cache";
import {reviewTier,draftAlert} from "@/lib/data";
import type {Result} from "./records";
export async function insightAction(_:Result,form:FormData):Promise<Result>{try{const id=String(form.get("id"));if(form.get("action")==="draft"){return {ok:true,message:await draftAlert(id)};}const action=String(form.get("action"));if(!["approve","reject"].includes(action))throw Error("Unknown action.");await reviewTier(id,action==="approve");revalidatePath("/","layout");return {ok:true,message:action==="approve"?"Tier suggestion approved.":"Suggestion dismissed. Current tier retained."};}catch(e){return {ok:false,message:e instanceof Error?e.message:"Unable to complete action."};}}
