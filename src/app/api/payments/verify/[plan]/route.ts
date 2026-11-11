import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isPlanCode, PLANS } from "@/lib/plans";
import type { RowDataPacket } from "mysql2/promise";

export async function GET(request: Request, context: { params: Promise<{ plan: string }> }) {
  const { plan } = await context.params;
  const front = (process.env.FRONT || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/,"");
  const fail = (status: string) => NextResponse.redirect(`${front}/dashboard?payment=${status}`,303);
  if (!isPlanCode(plan) || plan === "free") return fail("unauthorized");
  const cartId = (await cookies()).get("panier_id")?.value;
  const api = process.env.API_URL?.replace(/\/$/,""), key = process.env.API_KEY;
  if (!cartId || !api || !key) return fail("unauthorized");
  try {
    const [pending] = await db.execute<RowDataPacket[]>("SELECT user_id,plan FROM pending_subscription_payments WHERE cart_id=? AND expires_at>NOW() LIMIT 1",[cartId]);
    if (!pending[0] || pending[0].plan !== plan) return fail("unauthorized");
    const response = await fetch(`${api}/${encodeURIComponent(cartId)}`,{headers:{Authorization:`Bearer ${key}`},cache:"no-store",signal:AbortSignal.timeout(10_000)});
    if (!response.ok) return fail("error");
    const payment = await response.json() as {status?:string;meta?:{userId?:string}};
    if (payment.status !== "completed" || payment.meta?.userId !== String(pending[0].user_id)) return fail("failed");
    const config = PLANS[plan];
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute(`INSERT INTO user_subscriptions (user_id,plan,status,links_limit,clicks_limit,clicks_used,analytics_enabled,period_started_at,expires_at)
        VALUES (?,?,'active',?,?,0,?,NOW(),DATE_ADD(NOW(),INTERVAL 30 DAY))
        ON DUPLICATE KEY UPDATE plan=VALUES(plan),status='active',links_limit=VALUES(links_limit),clicks_limit=VALUES(clicks_limit),clicks_used=0,analytics_enabled=VALUES(analytics_enabled),period_started_at=NOW(),expires_at=VALUES(expires_at)`,[pending[0].user_id,plan,config.linksLimit,config.clicksLimit,config.analytics]);
      await conn.execute("UPDATE user_Tracker_Link SET status=?,is_active_date=DATE_ADD(NOW(),INTERVAL 30 DAY) WHERE id=?",[config.status,pending[0].user_id]);
      await conn.execute("DELETE FROM pending_subscription_payments WHERE cart_id=?",[cartId]);
      await conn.commit();
    } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
    const result = NextResponse.redirect(`${front}/dashboard?payment=success`,303);
    result.cookies.set("panier_id","",{httpOnly:true,secure:true,sameSite:"none",path:"/api/payments",maxAge:0});
    return result;
  } catch (e) { console.error("payment verification failed",e); return fail("error"); }
}
