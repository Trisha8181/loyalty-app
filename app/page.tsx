import {Workspace} from "@/components/workspace";
export const dynamic="force-dynamic";
export default async function Home({searchParams}:{searchParams:Promise<{campaign?:string}>}){const {campaign}=await searchParams;return <Workspace section="dashboard" filter={campaign}/>;}
