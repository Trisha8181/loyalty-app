import {activeWorkspace, selectedWorkspaceLabel} from "@/lib/data/teams";
import {CreateRecordPanel} from "@/components/create-record-panel";
import {TierSuggestion,AlertDraft} from "@/components/insights";
import {Dashboard} from "@/components/dashboard";
import {StockAdjustment} from "@/components/stock-adjustment";

import {notFound} from "next/navigation";
import {loadData} from "@/lib/data";
import {money,sections,type Kind} from "@/lib/types";
import {RecordForm,DeleteButton} from "@/components/forms";
export async function Workspace({section,filter=""}:{section:string;filter?:string}){
 if(!sections.includes(section as typeof sections[number]))notFound();
 const [data,workspaceId,workspaceLabel]=await Promise.all([loadData(),activeWorkspace(),selectedWorkspaceLabel()]);
 const expectedWorkspace=workspaceId??"personal";
 const name=(table:Kind,id?:string|null)=>data[table].find(r=>r.id===id)?.name??"—";
 const title=section[0].toUpperCase()+section.slice(1);
 const kind=(section==="members"?"memberships":section) as Kind;
 const labels:Record<string,string>={campaigns:"Plan your next moment of connection.",members:"Know your members. Make every visit count.",receipts:"Every receipt tells a part of your campaign’s story.",gifts:"Thoughtful rewards, with inventory you can trust.",redemptions:"Turn a qualifying purchase into a memorable reward.",dashboard:"A clear view of your loyalty programme."};

 return <><header className="page-header"><div><p className="eyebrow">GATHER / YOUR WORKSPACE</p><h1>{title==="Dashboard"?"Good things, growing.":title}</h1><p>{labels[section]}</p></div><span className="workspace-badge"><span className="status-dot"/> {workspaceLabel}</span></header>
 {section==="dashboard"?<Dashboard data={data} campaign={filter}/>:<>
 <div className="section-bar"><h2>{section==="members"?"Member directory":`All ${section}`} <span className="count">{data[kind].length}</span></h2><CreateRecordPanel label={section==="members"?"Register member":section==="receipts"?"Submit receipt":section==="redemptions"?"Redeem gift":section==="gifts"?"Add gift":"New campaign"} title={section==="members"?"Register member":section==="redemptions"?"Redeem gift":`New ${section.slice(0,-1)}`}><RecordForm expectedWorkspace={expectedWorkspace} kind={kind} data={data}/></CreateRecordPanel></div>
 {section==="receipts"&&<form className="filter"><label>Campaign<select name="campaign" defaultValue={filter}><option value="">All campaigns</option>{data.campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><button className="secondary">Apply filter</button></form>}
 <section className="panel table-panel"><div className="table-scroll"><table className="record-table"><caption className="visually-hidden">{title} and available actions</caption><thead><tr>{columns(section).map(c=><th scope="col" key={c}>{c}</th>)}<th scope="col">Actions</th></tr></thead><tbody>{data[kind].filter(r=>section!=="receipts"||!filter||r.campaign_id===filter).map(r=><tr key={r.id}>
 {section==="campaigns"&&<><td data-label="Campaign"><div className="cell-content"><strong>{r.name}</strong></div></td><td data-label="Dates"><div className="cell-content">{r.start_date} → {r.end_date}</div></td><td data-label="Status"><div className="cell-content"><Badge text={r.status!}/></div></td></>}
 {section==="members"&&<><td data-label="Member"><div className="cell-content"><strong>{r.name}</strong><small>Joined {r.registered_at?.slice(0,10)}</small></div></td><td data-label="Gender"><div className="cell-content">{r.gender}</div></td><td data-label="Tier"><div className="cell-content"><Badge text={r.tier!}/><TierSuggestion expectedWorkspace={expectedWorkspace} member={r}/></div></td><td data-label="Lifecycle"><div className="cell-content"><Badge text={r.lifecycle_status!}/></div></td></>}
 {section==="receipts"&&<><td data-label="Member"><div className="cell-content"><strong>{name("memberships",r.member_id)}</strong></div></td><td data-label="Amount" className="number"><div className="cell-content">{money(Number(r.amount))}</div></td><td data-label="Store"><div className="cell-content">{r.store}</div></td><td data-label="Date"><div className="cell-content">{r.transaction_date}</div></td><td data-label="Campaign"><div className="cell-content">{name("campaigns",r.campaign_id)}</div></td></>}
 {section==="gifts"&&<><td data-label="Gift"><div className="cell-content"><strong>{r.name}</strong><small>{r.description}</small></div></td><td data-label="Available stock"><div className="cell-content"><Badge text={r.stock===0?"Out of stock":Number(r.stock)<=5?`${r.stock} · Low stock`:`${r.stock} in stock`}/></div></td><td data-label="Receipt minimum"><div className="cell-content">{money(Number(r.threshold_amount))}</div></td><td data-label="Campaign"><div className="cell-content">{name("campaigns",r.campaign_id)}</div></td></>}
 {section==="redemptions"&&<><td data-label="Member"><div className="cell-content"><strong>{name("memberships",r.member_id)}</strong></div></td><td data-label="Gift"><div className="cell-content">{name("gifts",r.gift_id)}</div></td><td data-label="Receipt"><div className="cell-content">{money(Number(data.receipts.find(a=>a.id===r.receipt_id)?.amount??0))}</div></td><td data-label="Status"><div className="cell-content"><Badge text={r.status!}/></div></td><td data-label="Date"><div className="cell-content">{r.created_at.slice(0,10)}</div></td></>}
 <td data-label="Actions" className="actions-cell"><div className="row-actions">{kind==="gifts"&&<><StockAdjustment expectedWorkspace={expectedWorkspace} id={r.id}/>{Number(r.stock)<=5&&<AlertDraft expectedWorkspace={expectedWorkspace} id={r.id}/>}</>}{(kind!=="redemptions"||r.status==="completed")&&<details><summary>{kind==="redemptions"?"Cancel":"Edit"}</summary><div className="edit-panel"><RecordForm expectedWorkspace={expectedWorkspace} kind={kind} data={data} row={r}/></div></details>}{kind!=="redemptions"&&<DeleteButton expectedWorkspace={expectedWorkspace} kind={kind} id={r.id}/>}</div></td></tr>)}</tbody></table></div>
 {!data[kind].filter(r=>section!=="receipts"||!filter||r.campaign_id===filter).length&&<div className="empty"><h3>No {section} yet</h3><p>{section==="receipts"?"Submit your first receipt.":"Use the button above to add your first record."}</p></div>}
 </section></>}
 <footer className="page-footer">Gather Loyalty CRM <span>Every interaction counts.</span></footer></>;
}
function columns(section:string){return ({campaigns:["Campaign","Dates","Status"],members:["Member","Gender","Tier","Lifecycle"],receipts:["Member","Amount","Store","Date","Campaign"],gifts:["Gift","Available stock","Receipt minimum","Campaign"],redemptions:["Member","Gift","Receipt","Status","Date"]} as Record<string,string[]>)[section]??[];}
export function Metric({label,value}:{label:string;value:string}){return <article className="metric"><p>{label}</p><strong>{value}</strong><span>↗</span></article>;}
export function Badge({text}:{text:string}){return <span className={"badge "+(text.includes("Low")||text==="Out of stock"?"warning":"")}>{text}</span>;}
