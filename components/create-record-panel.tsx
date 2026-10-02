"use client";
import {useRef, type ReactNode} from "react";

export function CreateRecordPanel({label,title,children}:{label:string;title:string;children:ReactNode}){
 const panel=useRef<HTMLDetailsElement>(null);
 const close=()=>{if(panel.current){panel.current.open=false;panel.current.querySelector("summary")?.focus();}};
 return <details className="create-panel" ref={panel} onKeyDown={event=>{if(event.key==="Escape")close();}}>
  <summary className="button">+ {label}</summary>
  <div className="form-popover"><div className="form-heading"><h3>{title}</h3><button type="button" className="secondary" onClick={close} aria-label={`Close ${title.toLowerCase()} form`}>Close</button></div>{children}</div>
 </details>;
}
