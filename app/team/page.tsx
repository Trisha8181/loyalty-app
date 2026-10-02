import {pendingInvitation} from "@/lib/data/invitation";
import type {Metadata} from "next";
import {teamPageData} from "@/lib/data/teams";
import {TeamWorkspace} from "@/components/team-workspace";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Team · Gather",referrer:"no-referrer",robots:{index:false,follow:false}};
export default async function TeamPage({searchParams}:{searchParams:Promise<{invite?:string}>}){const data=await teamPageData();const {invite}=await searchParams;return <TeamWorkspace key={data.current?.id??"personal"} {...data} invitation={invite&&/^[0-9a-f]{64}$/i.test(invite)?invite:await pendingInvitation()??""}/>;}


