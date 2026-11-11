import { ensureUserSubscription } from "@/lib/subscriptions";
import { getSessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { jsonError, privateJson } from "@/lib/http";
import type { RowDataPacket } from "mysql2/promise";
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("unauthorized", 401);
  try {
    await ensureUserSubscription(userId);
    const [data] = await db.execute<RowDataPacket[]>(`SELECT u.id,u.name,u.first_name,u.full_name,u.email,u.status AS account_status,
      s.plan,s.status AS subscription_status,s.links_limit,s.clicks_limit,s.clicks_used,s.analytics_enabled,s.expires_at,
      (SELECT COUNT(*) FROM link_Tracker_Link l WHERE l.user_id=u.id) AS links_used
      FROM user_Tracker_Link u JOIN user_subscriptions s ON s.user_id=u.id WHERE u.id=? LIMIT 1`, [userId]);
    if (!data[0]) return jsonError("unauthorized", 401);
    return privateJson({ user: { id: data[0].id, name: data[0].full_name, email: data[0].email }, subscription: data[0] });
  } catch (e) { console.error("me failed", e); return jsonError("account_unavailable", 500); }
}
