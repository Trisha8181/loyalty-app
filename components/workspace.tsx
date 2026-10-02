import {TierSuggestion,AlertDraft} from "@/components/insights";
import {Dashboard} from "@/components/dashboard";
import {StockAdjustment} from "@/components/stock-adjustment";

import {notFound} from "next/navigation";
import {loadData} from "@/lib/data";
import {money,sections,type Kind} from "@/lib/types";
import {RecordForm,DeleteButton} from "@/components/forms";
export async function Workspace({section,filter=""}:{section:string;filter?:string}){
 if(!sections.includes(section as typeof sections[number]))notFound();
 const data=await loadData();
 const name=(table:Kind,id?:string|null)=>data[table].find(r=>r.id===id)?.name??"—";
 const title=section[0].toUpperCase()+section.slice(1);
 const kind=(section==="members"?"memberships":section) as Kind;
 const labels:Record<string,string>={campaigns:"Plan your next moment of connection.",members:"Know your members. Make every visit count.",receipts:"Every receipt tells a part of your campaign’s story.",gifts:"Thoughtful rewards, with inventory you can trust.",redemptions:"Turn a qualifying purchase into a memorable reward.",dashboard:"A clear view of your loyalty programme."};

 return <><header className="page-header"><div><p className="eyebrow">GATHER / YOUR WORKSPACE</p><h1>{title==="Dashboard"?"Good things, growing.":title}</h1><p>{labels[section]}</p></div><span className="workspace-badge"><span className="status-dot"/> Live workspace</span></header>
 {section==="dashboard"?<Dashboard data={data} campaign={filter}/>:<>
 <div className="section-bar"><h2>{section==="members"?"Member directory":`All ${section}`} <span className="count">{data[kind].length}</span></h2><details className="create-panel"><summary className="button">+ {section==="members"?"Register member":section==="receipts"?"Submit receipt":section==="redemptions"?"Redeem gift":section==="gifts"?"Add gift":"New campaign"}</summary><div className="form-popover"><h3>{section==="members"?"Register member":`New ${section.slice(0,-1)}`}</h3><RecordForm kind={kind} data={data}/></div></details></div>
 {section==="receipts"&&<form className="filter"><label>Campaign<select name="campaign" defaultValue={filter}><option value="">All campaigns</option>{data.campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><button className="secondary">Apply filter</button></form>}
 <section className="panel table-panel"><div className="table-scroll"><table><thead><tr>{columns(section).map(c=><th key={c}>{c}</th>)}<th>Actions</th></tr></thead><tbody>{data[kind].filter(r=>section!=="receipts"||!filter||r.campaign_id===filter).map(r=><tr key={r.id}>
 {section==="campaigns"&&<><td><strong>{r.name}</strong></td><td>{r.start_date} → {r.end_date}</td><td><Badge text={r.status!}/></td></>}
 {section==="members"&&<><td><strong>{r.name}</strong><small>Joined {r.registered_at?.slice(0,10)}</small></td><td>{r.gender}</td><td><Badge text={r.tier!}/><TierSuggestion member={r}/></td><td><Badge text={r.lifecycle_status!}/></td></>}
 {section==="receipts"&&<><td><strong>{name("memberships",r.member_id)}</strong></td><td className="number">{money(Number(r.amount))}</td><td>{r.store}</td><td>{r.transaction_date}</td><td>{name("campaigns",r.campaign_id)}</td></>}
 {section==="gifts"&&<><td><strong>{r.name}</strong><small>{r.description}</small></td><td><Badge text={r.stock===0?"Out of stock":Number(r.stock)<=5?`${r.stock} · Low stock`:`${r.stock} in stock`}/></td><td>{money(Number(r.threshold_amount))}</td><td>{name("campaigns",r.campaign_id)}</td></>}
 {section==="redemptions"&&<><td><strong>{name("memberships",r.member_id)}</strong></td><td>{name("gifts",r.gift_id)}</td><td>{money(Number(data.receipts.find(a=>a.id===r.receipt_id)?.amount??0))}</td><td><Badge text={r.status!}/></td><td>{r.created_at.slice(0,10)}</td></>}
 <td><div className="row-actions">{kind==="gifts"&&<><StockAdjustment id={r.id}/>{Number(r.stock)<=5&&<AlertDraft id={r.id}/>}</>}{(kind!=="redemptions"||r.status==="completed")&&<details><summary>{kind==="redemptions"?"Cancel":"Edit"}</summary><div className="edit-panel"><RecordForm kind={kind} data={data} row={r}/></div></details>}{kind!=="redemptions"&&<DeleteButton kind={kind} id={r.id}/>}</div></td></tr>)}</tbody></table></div>
 {!data[kind].filter(r=>section!=="receipts"||!filter||r.campaign_id===filter).length&&<div className="empty"><h3>No {section} yet</h3><p>{section==="receipts"?"Submit your first receipt.":"Use the button above to add your first record."}</p></div>}
 </section></>}
 <footer className="page-footer">Gather Loyalty CRM <span>Every interaction counts.</span></footer></>;
}
function columns(section:string){return ({campaigns:["Campaign","Dates","Status"],members:["Member","Gender","Tier","Lifecycle"],receipts:["Member","Amount","Store","Date","Campaign"],gifts:["Gift","Available stock","Receipt minimum","Campaign"],redemptions:["Member","Gift","Receipt","Status","Date"]} as Record<string,string[]>)[section]??[];}
export function Metric({label,value}:{label:string;value:string}){return <article className="metric"><p>{label}</p><strong>{value}</strong><span>↗</span></article>;}
export function Badge({text}:{text:string}){return <span className={"badge "+(text.includes("Low")||text==="Out of stock"?"warning":"")}>{text}</span>;}
