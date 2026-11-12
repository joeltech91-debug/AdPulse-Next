import { db } from "@/lib/db";

/** Safely initializes legacy accounts without downgrading a still-active paid account. */
export async function ensureUserSubscription(userId: string) {
  await db.execute(`INSERT IGNORE INTO user_subscriptions
    (user_id,plan,status,links_limit,clicks_limit,clicks_used,analytics_enabled,period_started_at,expires_at)
    SELECT id,IF(is_active_date>NOW(),'unlimited','free'),'active',
      IF(is_active_date>NOW(),-1,1),IF(is_active_date>NOW(),-1,30),0,
      IF(is_active_date>NOW(),TRUE,FALSE),NOW(),IF(is_active_date>NOW(),is_active_date,NULL)
    FROM user_Tracker_Link WHERE id=?`,[userId]);
  await db.execute(`UPDATE user_subscriptions SET plan='free',status='active',links_limit=1,
    clicks_limit=30,clicks_used=0,analytics_enabled=FALSE,period_started_at=NOW(),expires_at=NULL
    WHERE user_id=? AND plan<>'free' AND expires_at IS NOT NULL AND expires_at<=NOW()`,[userId]);
  // Each click allowance runs on a rolling 30-day cycle. Free accounts renew
  // automatically; paid accounts renew their quota when a new paid period is activated.
  await db.execute(`UPDATE user_subscriptions
    SET clicks_used=0,period_started_at=NOW()
    WHERE user_id=? AND (period_started_at IS NULL OR period_started_at<=NOW()-INTERVAL 30 DAY)
      AND (expires_at IS NULL OR expires_at>NOW())`,[userId]);
  await db.execute(`UPDATE user_Tracker_Link u JOIN user_subscriptions s ON s.user_id=u.id
    SET u.status=CASE WHEN s.plan='standard' THEN 2 WHEN s.plan='advanced' THEN 3
      WHEN s.plan='unlimited' THEN 4 ELSE 1 END WHERE u.id=?`,[userId]);
}
