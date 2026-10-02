"use server";
import {createClient} from "@/lib/supabase/server";
import {clearInvitation} from "@/lib/data/invitation";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {chooseWorkspace,teamRpc} from "@/lib/data/teams";
export interface TeamResult {ok:boolean;message:string;inviteUrl?:string}
export async function teamAction(_:TeamResult,form:FormData):Promise<TeamResult>{
 const op=String(form.get("operation")??"");let joined=false;
 try{
  const workspace=String(form.get("workspace")??"");
  if(op==="create"){const id=await teamRpc("create_team",{p_name:String(form.get("name")??"").trim()});await chooseWorkspace(id);}
  else if(op==="switch"){await chooseWorkspace(workspace||null);}
  else if(op==="invite"){
   const token=await teamRpc("invite_team_member",{p_workspace:workspace,p_email:String(form.get("email")??"").trim(),p_role:String(form.get("role")??"staff")});
   const origin=process.env.NEXT_PUBLIC_APP_URL||"https://loyalty-app-jet-two.vercel.app";
   revalidatePath("/team");return {ok:true,message:"Invitation created. Copy this link and share it with the named recipient. It expires in seven days.",inviteUrl:origin+"/team?invite="+encodeURIComponent(token)};
  }else if(op==="join"){const token=String(form.get("token")??"").trim();if(!/^[0-9a-f]{64}$/i.test(token))throw Error("Paste the 64-character invitation code from your team invitation link.");const id=await teamRpc("join_team",{p_token:token});await chooseWorkspace(id);await clearInvitation();joined=true;}
  else if(op==="role"||op==="remove"){await teamRpc("manage_team_member",{p_workspace:workspace,p_user:String(form.get("user")??""),p_role:op==="remove"?null:String(form.get("role")??"")});if(op==="remove"){const db=await createClient();const {data:{user}}=await db.auth.getUser();if(user?.id===form.get("user"))await chooseWorkspace(null);}}
  else if(op==="revoke"){await teamRpc("revoke_team_invite",{p_workspace:workspace,p_invite:String(form.get("invite")??"")});}
  else throw Error("Unknown team action.");
 }catch(e){return {ok:false,message:e instanceof Error?e.message:"Unable to update your team."};}
 revalidatePath("/","layout");if(joined)redirect("/team");
 return {ok:true,message:op==="create"?"Team created and selected. Your personal records stay private.":op==="switch"?"Workspace switched. All CRM pages now show this workspace.":"Team updated."};
}


