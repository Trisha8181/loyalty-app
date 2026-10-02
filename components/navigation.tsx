"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useState} from "react";
import {sections} from "@/lib/types";
export function Navigation(){const path=usePathname();const [open,setOpen]=useState(false);return <><button className="menu-toggle" aria-expanded={open} onClick={()=>setOpen(!open)}>☰ Menu</button><aside className={open?"sidebar open":"sidebar"}><Link className="brand" href="/">◈ <span>Gather<small>LOYALTY WORKSPACE</small></span></Link><p className="nav-label">WORKSPACE</p><nav>{sections.map((s,i)=><Link key={s} onClick={()=>setOpen(false)} href={s==="dashboard"?"/":"/"+s} className={(path==="/"?s==="dashboard":path==="/"+s)?"active":""}><span className="nav-icon">{["▦","⚑","♧","▤","◇","↗"][i]}</span>{s[0].toUpperCase()+s.slice(1)}</Link>)}</nav><div className="sidebar-note"><span className="status-dot"/> Demo workspace<p>Campaigns, customers, and thoughtful rewards.</p></div></aside></>;}
