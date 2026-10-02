"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {headers} from "next/headers";
import {signIn,signUp,demoSignIn,endSession,seedWorkspace} from "@/lib/data/auth";
import type {Result} from "./records";
export async function authenticate(_:Result,form:FormData):Promise<Result>{
 try{const mode=String(form.get("mode"));if(mode==="demo")await demoSignIn();else{const email=String(form.get("email")??"").trim();const password=String(form.get("password")??"");if(!email||password.length<8)throw Error("Enter your email and a password of at least 8 characters.");if(mode==="signup"){const h=await headers();const origin=process.env.NEXT_PUBLIC_APP_URL||h.get("origin")||"https://loyalty-app-jet-two.vercel.app";const ready=await signUp(email,password,origin);if(!ready)return {ok:true,message:"Check your email to confirm your account, then sign in."};}else if(mode==="login")await signIn(email,password);else throw Error("Invalid sign-in option.");}}catch(e){return {ok:false,message:e instanceof Error?e.message:"Sign-in failed. Please try again."};}
 revalidatePath("/","layout");redirect("/");
}
export async function logout(){await endSession();revalidatePath("/","layout");redirect("/login");}
export async function loadSamples(){await seedWorkspace();revalidatePath("/","layout");redirect("/");}
