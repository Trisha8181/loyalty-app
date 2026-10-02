import {selectedWorkspaceLabel} from "@/lib/data/teams";
import type {Metadata} from "next";
import {Navigation} from "@/components/navigation";
import "./globals.css";
export const metadata:Metadata={title:"Gather · Loyalty CRM",description:"Manage campaign receipts, members, gifts and redemptions."};
export default async function RootLayout({children}:{children:React.ReactNode}){const workspaceLabel=await selectedWorkspaceLabel();return <html lang="en"><body><Navigation workspaceLabel={workspaceLabel}/><main className="main-content">{children}</main></body></html>;}
