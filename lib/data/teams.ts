import {cookies} from "next/headers";
import {createClient} from "@/lib/supabase/server";
export const WORKSPACE_COOKIE="gather-workspace";
export type TeamRole="owner"|"admin"|"staff";
export interface Team {id:string;name:string;owner_id:string;role:TeamRole}
export interface Teammate {user_id:string;email:string;role:TeamRole}
export interface Invite {id:string;email:string;role:string;expires_at:string;used_at:string|null;revoked_at:string|null}
export async function activeWorkspace(){
 const id=(await cookies()).get(WORKSPACE_COOKIE)?.value;
 if(!id)return null;
 if(!/^[0-9a-f-]{36}$/i.test(id))throw Error("Choose a workspace from the Team page.");
 const db=await createClient();const {data,error}=await db.from("team_workspaces").select("id").eq("id",id).maybeSingle();
 if(error||!data)throw Error("This team is no longer available. Open Team and switch to your personal workspace.");
 return id;
}
export async function chooseWorkspace(id:string|null){
 if(id){const db=await createClient();const {data,error}=await db.from("team_workspaces").select("id").eq("id",id).single();if(error||!data)throw Error("This team is not accessible.");}
 (await cookies()).set(WORKSPACE_COOKIE,id??"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:id?60*60*24*365:0});
}
export async function teamPageData(){
 const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)throw Error("Sign in first.");
 const [{data:teams,error},{data:memberships,error:membershipError}]=await Promise.all([db.from("team_workspaces").select("id,name,owner_id").order("created_at"),db.from("team_members").select("workspace_id,role").eq("user_id",user.id)]);
 if(error||membershipError)throw Error("Team workspaces are unavailable. Please try again.");
 const all=(teams??[]).map(t=>({...t,role:memberships?.find(m=>m.workspace_id===t.id)?.role as TeamRole}));
 const selected=(await cookies()).get(WORKSPACE_COOKIE)?.value??null;
 const current=all.find(t=>t.id===selected)??null;
 let people:Teammate[]=[];let invites:Invite[]=[];
 if(current){const result=await db.from("team_members").select("user_id,email,role").eq("workspace_id",current.id).order("created_at");if(result.error)throw Error(result.error.message);people=result.data??[];if(current.role!=="staff"){const result=await db.rpc("list_team_invites",{p_workspace:current.id});if(result.error)throw Error(result.error.message);invites=result.data??[];}}
 return {teams:all,current,selected,people,invites,userId:user.id,email:user.email??"",canUseTeams:!user.is_anonymous&&Boolean(user.email_confirmed_at)};
}
export async function teamRpc(name:"create_team"|"invite_team_member"|"join_team"|"manage_team_member"|"revoke_team_invite",args:Record<string,unknown>){const db=await createClient();const {data,error}=await db.rpc(name,args);if(error)throw Error(error.message);return data;}
export async function requireRecordInWorkspace(table:string,id:string){const db=await createClient();const workspace=await activeWorkspace();let q=db.from(table).select("id").eq("id",id);q=workspace?q.eq("workspace_id",workspace):q.is("workspace_id",null);const {data,error}=await q.maybeSingle();if(error||!data)throw Error("Record is not in the selected workspace.");}
export async function selectedWorkspaceLabel(){const id=(await cookies()).get(WORKSPACE_COOKIE)?.value;if(!id)return "Personal workspace";const db=await createClient();const {data}=await db.from("team_workspaces").select("name").eq("id",id).maybeSingle();return data?.name??"Unavailable workspace";}
export async function assertWorkspaceForm(form:FormData){if(String(form.get("expectedWorkspace"))!==(await activeWorkspace()??"personal"))throw Error("Your workspace changed in another tab. Refresh this page before saving.");}
