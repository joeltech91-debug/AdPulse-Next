import { getSessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { jsonError, privateJson } from "@/lib/http";
import type { RowDataPacket } from "mysql2/promise";
export async function GET() {
  const userId=await getSessionUserId();if(!userId)return jsonError("unauthorized",401);
  try {
    const [tokens]=await db.execute<RowDataPacket[]>("SELECT access_token,expires_at FROM user_meta_ad_connect WHERE user_id=? LIMIT 1",[userId]);
    if(!tokens[0]||new Date(tokens[0].expires_at).getTime()<=Date.now())return jsonError("meta_not_connected",404);
    const token=String(tokens[0].access_token);
    const accountUrl=new URL("https://graph.facebook.com/v19.0/me/adaccounts");
    accountUrl.searchParams.set("fields","id,name");accountUrl.searchParams.set("access_token",token);
    const accountRes=await fetch(accountUrl,{cache:"no-store",signal:AbortSignal.timeout(15000)});
    if(!accountRes.ok)return jsonError("meta_accounts_unavailable",502);
    const accounts=await accountRes.json() as {data?:{id:string;name:string}[]};
    const account=accounts.data?.[0];if(!account)return privateJson({ads:[],accounts:[]});
    const adsUrl=new URL(`https://graph.facebook.com/v19.0/${account.id}/ads`);
    adsUrl.searchParams.set("fields","id,name,status,insights.date_preset(last_1d){spend,impressions,clicks,cpc,ctr}");
    adsUrl.searchParams.set("limit","25");adsUrl.searchParams.set("access_token",token);
    const adsRes=await fetch(adsUrl,{cache:"no-store",signal:AbortSignal.timeout(15000)});
    if(!adsRes.ok)return jsonError("meta_ads_unavailable",502);
    const ads=await adsRes.json() as {data?:unknown[]};
    return privateJson({account,ads:ads.data||[]});
  } catch(e) { console.error("Meta ads fetch failed",e);return jsonError("meta_ads_unavailable",502); }
}
