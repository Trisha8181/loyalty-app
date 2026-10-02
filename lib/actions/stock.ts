"use server";
import {revalidatePath} from "next/cache";
import {adjustInventory} from "@/lib/data";
import type {Result} from "./records";
export async function adjustStock(_:Result,form:FormData):Promise<Result>{try{const delta=Number(form.get("delta"));if(!Number.isInteger(delta)||!delta||Math.abs(delta)>1000000)throw Error("Enter a whole number between -1,000,000 and 1,000,000, excluding zero.");await adjustInventory(String(form.get("id")),delta);revalidatePath("/","layout");return {ok:true,message:"Stock adjusted. The change is recorded in the audit log."};}catch(e){return {ok:false,message:e instanceof Error?e.message:"Unable to adjust stock."};}}
