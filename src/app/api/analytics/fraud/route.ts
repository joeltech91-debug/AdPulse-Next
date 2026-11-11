import { getSessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { jsonError, privateJson } from "@/lib/http";
import type { RowDataPacket } from "mysql2/promise";
export async function GET() {
 const userId=await getSessionUserId(); if(!userId)return jsonError("unauthorized",401);
 try {
  const [plan]=await db.execute<RowDataPacket[]>("SELECT analytics_enabled FROM user_subscriptions WHERE user_id=? AND status='active' AND (expires_at IS NULL OR expires_at>NOW())",[userId]);
  if(!plan[0]?.analytics_enabled)return jsonError("analytics_plan_required",403);
  const [rows]=await db.execute<RowDataPacket[]>(`SELECT slug,COUNT(*) AS total,SUM(is_bot=1) AS bots,SUM(is_duplicate=1) AS repeated,MAX(created_at) AS last_seen
   FROM tracker_events WHERE user_id=? AND created_at>=NOW()-INTERVAL 30 DAY AND (is_bot=1 OR is_duplicate=1)
   GROUP BY slug ORDER BY total DESC LIMIT 20`,[userId]);
  return privateJson({alerts:rows});
 } catch(e){console.error("analytics fraud failed",e);return jsonError("fraud_unavailable",500);}
}
