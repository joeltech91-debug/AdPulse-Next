import { getSessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { jsonError, privateJson } from "@/lib/http";
import type { RowDataPacket } from "mysql2/promise";
export async function GET() {
  const userId=await getSessionUserId(); if(!userId) return jsonError("unauthorized",401);
  try {
    const [plan]=await db.execute<RowDataPacket[]>("SELECT analytics_enabled FROM user_subscriptions WHERE user_id=? AND status='active' AND (expires_at IS NULL OR expires_at>NOW())",[userId]);
    if(!plan[0]?.analytics_enabled) return jsonError("analytics_plan_required",403);
    const [events]=await db.execute<RowDataPacket[]>(`SELECT slug,event_type AS type,event_name AS name,created_at AS at,is_bot AS bot,is_duplicate AS duplicate,utm_source,referrer
      FROM tracker_events WHERE user_id=? AND created_at>=NOW()-INTERVAL 24 HOUR ORDER BY created_at DESC,id DESC LIMIT 50`,[userId]);
    return privateJson({events,updated_at:new Date().toISOString()});
  } catch(e) { console.error("analytics live failed",e); return jsonError("live_unavailable",500); }
}
