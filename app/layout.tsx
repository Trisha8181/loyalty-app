import type {Metadata} from "next";
import {Navigation} from "@/components/navigation";
import "./globals.css";
export const metadata:Metadata={title:"Gather · Loyalty CRM",description:"Manage campaign receipts, members, gifts and redemptions."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Navigation/><main className="main-content">{children}</main></body></html>;}
