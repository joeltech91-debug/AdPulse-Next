import { getSessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";
import type { RowDataPacket } from "mysql2/promise";
export async function GET(){const userId=await getSessionUserId();if(!userId)return jsonError("unauthorized",401);try{
 const [plan]=await db.execute<RowDataPacket[]>("SELECT analytics_enabled FROM user_subscriptions WHERE user_id=? AND status='active' AND (expires_at IS NULL OR expires_at>NOW())",[userId]);if(!plan[0]?.analytics_enabled)return jsonError("analytics_plan_required",403);
 const [rows]=await db.execute<RowDataPacket[]>(`SELECT slug,event_type,event_name,event_value,currency,utm_source,utm_medium,utm_campaign,created_at,is_bot,is_duplicate
 FROM tracker_events WHERE user_id=? AND created_at>=NOW()-INTERVAL 30 DAY ORDER BY created_at DESC,id DESC`,[userId]);
 const quote=(v:unknown)=>'"'+String(v??"").replace(/"/g,'""')+'"';
 const lines=[["Lien","Type","Evenement","Valeur","Devise","UTM source","UTM medium","UTM campagne","Date UTC","Bot","Repetition"].map(quote).join(",")];
 for(const row of rows)lines.push([row.slug,row.event_type,row.event_name,Number(row.event_value||0).toFixed(2),row.currency,row.utm_source,row.utm_medium,row.utm_campaign,new Date(row.created_at).toISOString(),row.is_bot? "oui":"non",row.is_duplicate?"oui":"non"].map(quote).join(","));
 return new Response("\uFEFF"+lines.join("\r\n"),{status:200,headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":'attachment; filename="adpulse-rapport-30-jours.csv"',"Cache-Control":"private, no-store"}});
 }catch(e){console.error("analytics report failed",e);return jsonError("report_unavailable",500);}}
