import { getSessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { jsonError, privateJson } from "@/lib/http";
import type { RowDataPacket } from "mysql2/promise";
export async function GET(){
 const userId=await getSessionUserId();if(!userId)return jsonError("unauthorized",401);
 try{
  const [plans]=await db.execute<RowDataPacket[]>("SELECT analytics_enabled FROM user_subscriptions WHERE user_id=? AND status='active' AND (expires_at IS NULL OR expires_at>NOW())",[userId]);
  if(!plans[0]?.analytics_enabled)return jsonError("analytics_plan_required",403);
  const [rows]=await db.execute<RowDataPacket[]>(`SELECT c.id,c.name,c.objective,c.spend,c.impressions,c.slug,
    COALESCE(SUM(e.event_type='click' AND e.is_bot=0 AND e.is_duplicate=0),0) AS clicks,
    COALESCE(SUM(e.event_type='conversion' AND e.is_bot=0 AND e.is_duplicate=0),0) AS conversions,
    COALESCE(SUM(CASE WHEN e.event_type='conversion' AND e.is_bot=0 AND e.is_duplicate=0 THEN e.event_value ELSE 0 END),0) AS revenue
   FROM ad_campaigns c LEFT JOIN tracker_events e ON e.user_id=c.user_id AND e.slug=c.slug AND e.created_at>=c.created_at
   WHERE c.user_id=? GROUP BY c.id,c.name,c.objective,c.spend,c.impressions,c.slug,c.created_at ORDER BY c.created_at DESC,c.id DESC`,[userId]);
  const campaigns=rows.map(x=>{const spend=Number(x.spend||0),impressions=Number(x.impressions||0),clicks=Number(x.clicks||0),conversions=Number(x.conversions||0),revenue=Number(x.revenue||0);return {id:Number(x.id),name:String(x.name),objective:String(x.objective),spend,impressions,slug:String(x.slug),clicks,conversions,revenue,ctr:impressions?clicks/impressions*100:0,cpc:clicks?spend/clicks:0,cpa:conversions?spend/conversions:0,roas:spend>0?revenue/spend:null};});
  return privateJson({campaigns});
 }catch(e){console.error("campaign metrics failed",e);return jsonError("campaign_metrics_unavailable",500);}
}
