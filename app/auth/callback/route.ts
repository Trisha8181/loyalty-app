import {authenticationDestination} from "@/lib/data/invitation";
import {NextResponse} from "next/server";
import {exchangeAuthCode} from "@/lib/data/auth";
export async function GET(request:Request){const url=new URL(request.url);const code=url.searchParams.get("code");if(code&&await exchangeAuthCode(code))return NextResponse.redirect(new URL(await authenticationDestination(),url.origin));return NextResponse.redirect(new URL("/login?error=confirmation",url.origin));}
