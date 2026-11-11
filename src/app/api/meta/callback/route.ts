import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
export async function GET(request:Request) {
  const front=(process.env.FRONT||process.env.NEXT_PUBLIC_APP_URL||new URL(request.url).origin).replace(/\/$/,"");
  const fail=(code:string)=>NextResponse.redirect(`${front}/dashboard?meta=${code}`);
  const userId=await getSessionUserId(), url=new URL(request.url), code=url.searchParams.get("code"), state=url.searchParams.get("state");
  const jar=await cookies(), saved=jar.get("meta_oauth_state")?.value;
  if(!userId||!code||!state||!saved||state!==saved) return fail("unauthorized");
  const appId=process.env.META_APP_ID, secret=process.env.META_APP_SECRET, redirect=process.env.META_REDIRECT_URI;
  if(!appId||!secret||!redirect) return fail("not_configured");
  try {
    const shortUrl=new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    for(const [k,v] of Object.entries({client_id:appId,client_secret:secret,redirect_uri:redirect,code})) shortUrl.searchParams.set(k,v);
    const shortRes=await fetch(shortUrl,{cache:"no-store",signal:AbortSignal.timeout(15000)});
    if(!shortRes.ok) return fail("oauth_failed");
    const short=await shortRes.json() as {access_token?:string};
    if(!short.access_token) return fail("oauth_failed");
    const longUrl=new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    for(const [k,v] of Object.entries({grant_type:"fb_exchange_token",client_id:appId,client_secret:secret,fb_exchange_token:short.access_token})) longUrl.searchParams.set(k,v);
    const longRes=await fetch(longUrl,{cache:"no-store",signal:AbortSignal.timeout(15000)});
    if(!longRes.ok) return fail("token_exchange_failed");
    const token=await longRes.json() as {access_token?:string;expires_in?:number};
    if(!token.access_token) return fail("token_exchange_failed");
    const expires=new Date(Date.now()+Number(token.expires_in||5184000)*1000);
    await db.execute(`INSERT INTO user_meta_ad_connect (user_id,access_token,expires_at) VALUES (?,?,?)
      ON DUPLICATE KEY UPDATE access_token=VALUES(access_token),expires_at=VALUES(expires_at)`,[userId,token.access_token,expires]);
    const result=NextResponse.redirect(`${front}/dashboard?meta_connected=true`);
    result.cookies.set("meta_oauth_state","",{httpOnly:true,secure:true,sameSite:"lax",path:"/api/meta",maxAge:0});
    return result;
  } catch(e) { console.error("Meta OAuth callback failed",e); return fail("oauth_failed"); }
}
