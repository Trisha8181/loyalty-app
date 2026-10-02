"use client";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
export function LiveRefresh(){const router=useRouter();useEffect(()=>{const timer=setInterval(()=>{if(document.visibilityState==="visible")router.refresh();},30000);return ()=>clearInterval(timer);},[router]);return <span className="refresh-note">Updates every 30 seconds</span>;}
