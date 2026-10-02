"use client";
import {logout} from "@/lib/actions/auth";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import {sections} from "@/lib/types";

export function Navigation({workspaceLabel}:{workspaceLabel:string}){
 const path=usePathname();
 const [open,setOpen]=useState(false);
 const toggle=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  if(!open)return;
  const close=(event:KeyboardEvent)=>{if(event.key==="Escape"){setOpen(false);toggle.current?.focus();}};
  document.addEventListener("keydown",close);
  return ()=>document.removeEventListener("keydown",close);
 },[open]);
 if(path==="/login")return null;
 const links=[...sections,"team"];
 return <>
  <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="workspace-navigation" onClick={()=>setOpen(!open)}><span aria-hidden="true">{open?"×":"☰"}</span><span className="mobile-brand">Gather<small>{workspaceLabel}</small></span><span className="menu-label">{open?"Close menu":"Menu"}</span></button>
  {open&&<button className="menu-backdrop" aria-label="Close navigation" onClick={()=>{setOpen(false);toggle.current?.focus();}}/>}
  <aside id="workspace-navigation" className={open?"sidebar open":"sidebar"}>
   <Link className="brand" href="/" onClick={()=>setOpen(false)}><span aria-hidden="true">◈</span><span>Gather<small>LOYALTY WORKSPACE</small></span></Link>
   <p className="nav-label">WORKSPACE</p>
   <nav aria-label="Workspace">{links.map((section,i)=>{
    const href=section==="dashboard"?"/":"/"+section;
    const active=path===href;
    return <Link key={section} onClick={()=>setOpen(false)} href={href} aria-current={active?"page":undefined} className={active?"active":""}><span className="nav-icon" aria-hidden="true">{["▦","⚑","♧","▤","◇","↗","♧"][i]}</span>{section[0].toUpperCase()+section.slice(1)}</Link>;
   })}</nav>
   <div className="sidebar-note"><span className="status-dot"/> {workspaceLabel}<p>Campaigns, customers, and thoughtful rewards.</p><form action={logout}><button className="secondary">Sign out</button></form></div>
  </aside>
 </>;
}
