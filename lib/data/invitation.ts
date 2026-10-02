import {cookies} from "next/headers";
export const INVITATION_COOKIE="gather-invitation";
export async function pendingInvitation(){const token=(await cookies()).get(INVITATION_COOKIE)?.value;return token&&/^[0-9a-f]{64}$/i.test(token)?token:null;}
export async function authenticationDestination(){return await pendingInvitation()?"/team":"/";}
export async function clearInvitation(){(await cookies()).delete(INVITATION_COOKIE);}
