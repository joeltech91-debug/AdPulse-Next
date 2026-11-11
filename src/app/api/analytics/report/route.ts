import { getSessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { jsonError, privateJson } from "@/lib/http";
import type { RowDataPacket } from "mysql2/promise";
export async function GET() {
  const userId=await getSessionUserId(); if(!userId) return jsonError("unauthorized",401);
  try {
    const [plan]=await db.execute<RowDataPacket[]>("SELECT analytics_enabled FROM user_subscriptions WHERE user_id=? AND status='active' AND (expires_at IS NULL OR expires_at>NOW())",[userId]);
    if(!plan[0]?.analytics_enabled) return jsonError("analytics_plan_required",403);
    const [rows]=await db.execute<RowDataPacket[]>(`SELECT DATE(created_at) AS date,
      SUM(event_type='click' AND is_bot=0 AND is_duplicate=0) AS clicks,
      SUM(event_type='conversion' AND is_bot=0 AND is_duplicate=0) AS conversions,
      SUM(is_bot=1) AS bots,SUM(is_duplicate=1) AS duplicates,
      COALESCE(SUM(CASE WHEN event_type='conversion' AND is_bot=0 AND is_duplicate=0 THEN event_value ELSE 0 END),0) AS conversion_value
      FROM tracker_events WHERE user_id=? AND created_at>=NOW()-INTERVAL 30 DAY
      GROUP BY DATE(created_at) ORDER BY DATE(created_at)`,[userId]);
    return privateJson({period_days:30,rows});
  } catch(e) { console.error("analytics report failed",e); return jsonError("report_unavailable",500); }
}
