import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { jsonError } from "@/lib/http";
export async function GET(request:Request) {
  if(!await getSessionUserId()) return jsonError("unauthorized",401);
  const appId=process.env.META_APP_ID, redirect=process.env.META_REDIRECT_URI;
  if(!appId||!redirect) return jsonError("meta_not_configured",503);
  const state=randomBytes(24).toString("hex");
  (await cookies()).set("meta_oauth_state",state,{httpOnly:true,secure:true,sameSite:"lax",path:"/api/meta",maxAge:600});
  const url=new URL("https://www.facebook.com/v19.0/dialog/oauth");
  url.searchParams.set("client_id",appId);url.searchParams.set("redirect_uri",redirect);
  url.searchParams.set("state",state);url.searchParams.set("scope","ads_read,read_insights");
  return NextResponse.redirect(url);
}
