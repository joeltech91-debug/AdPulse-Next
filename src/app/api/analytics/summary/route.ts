import { getSessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { jsonError, privateJson } from "@/lib/http";
import type { RowDataPacket } from "mysql2/promise";
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("unauthorized",401);
  try {
    const [plan] = await db.execute<RowDataPacket[]>("SELECT analytics_enabled FROM user_subscriptions WHERE user_id=? AND status='active' AND (expires_at IS NULL OR expires_at>NOW())", [userId]);
    if (!plan[0]?.analytics_enabled) return jsonError("analytics_plan_required",403);
    const [totals] = await db.execute<RowDataPacket[]>(`SELECT COALESCE(SUM(click_total),0) AS clicks,COALESCE(SUM(click_mobile),0) AS mobile,COALESCE(SUM(click_pc),0) AS desktop
      FROM link_Tracker_Link WHERE user_id=?`, [userId]);
    const [events] = await db.execute<RowDataPacket[]>(`SELECT
      SUM(event_type='click' AND is_bot=0 AND is_duplicate=0 AND created_at>=NOW()-INTERVAL 30 DAY) AS clicks_30d,
      SUM(event_type='conversion' AND is_bot=0 AND is_duplicate=0 AND created_at>=NOW()-INTERVAL 30 DAY) AS conversions,
      SUM((is_bot=1 OR is_duplicate=1) AND created_at>=NOW()-INTERVAL 30 DAY) AS suspicious
      FROM tracker_events WHERE user_id=?`, [userId]);
    const [daily] = await db.execute<RowDataPacket[]>(`SELECT DATE(created_at) AS date,
      SUM(event_type='click' AND is_bot=0 AND is_duplicate=0) AS clicks,
      SUM(event_type='conversion' AND is_bot=0 AND is_duplicate=0) AS conversions
      FROM tracker_events WHERE user_id=? AND created_at>=NOW()-INTERVAL 14 DAY
      GROUP BY DATE(created_at) ORDER BY DATE(created_at)`, [userId]);
    return privateJson({ ...totals[0], ...events[0], daily });
  } catch (e) { console.error("analytics summary failed",e); return jsonError("analytics_unavailable",500); }
}
