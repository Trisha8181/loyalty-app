import type {Dataset} from "./types";
export function metrics(data:Dataset,campaign=""){
 const receipts=data.receipts.filter(r=>!campaign||r.campaign_id===campaign);
 const receiptIds=new Set(receipts.map(r=>r.id)); const memberIds=new Set(receipts.map(r=>r.member_id));
 const members=data.memberships.filter(m=>!campaign||memberIds.has(m.id));
 const sales=receipts.reduce((sum,r)=>sum+Math.round(Number(r.amount)*100),0)/100;
 const completed=data.redemptions.filter(r=>r.status==="completed"&&(!campaign||receiptIds.has(r.receipt_id!)));
 const genders=["female","male","other","unspecified"].map(g=>({name:g,count:members.filter(m=>(m.gender??"unspecified")===g).length}));
 const lifecycle=["new","active","churned"].map(s=>({name:s,count:members.filter(m=>m.lifecycle_status===s).length}));
 const gifts=data.gifts.filter(g=>!campaign||g.campaign_id===campaign);
 const rankings=members.map(m=>{const purchases=receipts.filter(r=>r.member_id===m.id);const total=purchases.reduce((sum,r)=>sum+Math.round(Number(r.amount)*100),0)/100;return {...m,total,orders:purchases.length,aov:purchases.length?total/purchases.length:0};}).filter(m=>m.orders>0).sort((a,b)=>b.aov-a.aov);
 return {sales,aov:receipts.length?sales/receipts.length:null,receiptCount:receipts.length,completed,members,genders,lifecycle,gifts,rankings,newMembers:members.filter(m=>m.lifecycle_status==="new").length};
}
