import { getSessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { jsonError, privateJson } from "@/lib/http";
import type { RowDataPacket } from "mysql2/promise";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("unauthorized", 401);
  try {
    const [plans] = await db.execute<RowDataPacket[]>(
      "SELECT analytics_enabled FROM user_subscriptions WHERE user_id=? AND status='active' AND (expires_at IS NULL OR expires_at>NOW())",
      [userId]
    );
    if (!plans[0]?.analytics_enabled) return jsonError("analytics_plan_required", 403);

    const [channels] = await db.execute<RowDataPacket[]>(
      `SELECT
        CASE
          WHEN utm_source<>'' THEN utm_source
          WHEN referrer IS NULL OR referrer='' THEN 'Direct / non identifié'
          ELSE SUBSTRING_INDEX(SUBSTRING_INDEX(referrer,'/',3),'/',-1)
        END AS source,
        COALESCE(NULLIF(utm_medium,''),'—') AS medium,
        COALESCE(NULLIF(utm_campaign,''),'—') AS campaign,
        COUNT(*) AS clicks
       FROM tracker_events
       WHERE user_id=? AND event_type='click' AND is_bot=0 AND is_duplicate=0
         AND created_at>=NOW()-INTERVAL 30 DAY
       GROUP BY source,medium,campaign
       ORDER BY clicks DESC LIMIT 20`,
      [userId]
    );

    const [links] = await db.execute<RowDataPacket[]>(
      `SELECT slug,
        SUM(event_type='click' AND is_bot=0 AND is_duplicate=0) AS clicks,
        SUM(event_type='conversion' AND is_bot=0 AND is_duplicate=0) AS conversions,
        COALESCE(SUM(CASE WHEN event_type='conversion' AND is_bot=0 AND is_duplicate=0 THEN event_value ELSE 0 END),0) AS conversionValue,
        MAX(currency) AS currency
       FROM tracker_events
       WHERE user_id=? AND created_at>=NOW()-INTERVAL 30 DAY
         AND (event_type='click' OR event_type='conversion')
       GROUP BY slug
       ORDER BY clicks DESC LIMIT 20`,
      [userId]
    );

    return privateJson({ periodDays: 30, channels, links });
  } catch (error) {
    console.error("analytics acquisition failed", error);
    return jsonError("acquisition_unavailable", 500);
  }
}
