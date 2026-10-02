import {Workspace} from "@/components/workspace";
export const dynamic="force-dynamic";
export default async function Page({params,searchParams}:{params:Promise<{section:string}>;searchParams:Promise<{campaign?:string}>}){const {section}=await params;const {campaign}=await searchParams;return <Workspace section={section} filter={campaign}/>;}
