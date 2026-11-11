import { db } from "@/lib/db";
import { createHash } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";

const BOT = /bot|crawler|spider|slurp|archiver|scanner|facebookexternalhit|facebot|meta-external|whatsapp|skypeuripreview|embedly|preview|curl|wget|python-requests|aiohttp|httpx|go-http-client|okhttp|headlesschrome|phantomjs|selenium|puppeteer|postman|insomnia/i;
export function isBot(userAgent: string) { return !userAgent || BOT.test(userAgent); }
function hashes(ip: string, ua: string) {
  return { visitor: createHash("sha256").update(ip + "|" + ua).digest("hex"), ip: createHash("sha256").update(ip).digest("hex") };
}
export async function recordClick(request: Request, slug: string, userId: string) {
  const ua = request.headers.get("user-agent") || "";
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  const bot = isBot(ua), { visitor, ip: ipHash } = hashes(ip, ua);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [subs] = await conn.execute<RowDataPacket[]>("SELECT clicks_limit, clicks_used FROM user_subscriptions WHERE user_id=? FOR UPDATE", [userId]);
    const subscription = subs[0];
    if (!subscription) { await conn.rollback(); return; }
    const [recent] = await conn.execute<RowDataPacket[]>("SELECT id FROM tracker_events WHERE user_id=? AND slug=? AND visitor_hash=? AND event_type='click' AND created_at >= NOW() - INTERVAL 30 MINUTE LIMIT 1", [userId, slug, visitor]);
    const duplicate = recent.length > 0;
    const allowed = !bot && !duplicate && (Number(subscription.clicks_limit) < 0 || Number(subscription.clicks_used) < Number(subscription.clicks_limit));
    const url = new URL(request.url);
    await conn.execute(`INSERT INTO tracker_events (user_id,slug,event_type,event_name,event_value,currency,visitor_hash,ip_hash,user_agent,referrer,utm_source,utm_medium,utm_campaign,is_bot,is_duplicate)
      VALUES (?,?,'click','',0,'',?,?,?,?,?,?,?,?,?)`, [userId, slug, visitor, ipHash, ua.slice(0,512), request.headers.get("referer")?.slice(0,2000) || "", ...["utm_source","utm_medium","utm_campaign"].map(k => url.searchParams.get(k)?.slice(0,160) || ""), bot, duplicate]);
    if (allowed) {
      const mobile = /mobile|android|iphone|ipad/i.test(ua);
      await conn.execute("UPDATE link_Tracker_Link SET click_total=click_total+1, click_mobile=click_mobile+?, click_pc=click_pc+? WHERE slug=? AND user_id=?", [mobile ? 1 : 0, mobile ? 0 : 1, slug, userId]);
      await conn.execute("UPDATE user_subscriptions SET clicks_used=clicks_used+1 WHERE user_id=?", [userId]);
    }
    await conn.commit();
  } catch (error) { await conn.rollback(); throw error; }
  finally { conn.release(); }
}
export async function recordConversion(request: Request, slug: string, body: { event_name?: string; value?: number; currency?: string }) {
  const [links] = await db.execute<RowDataPacket[]>("SELECT l.user_id FROM link_Tracker_Link l WHERE l.slug=? LIMIT 1", [slug]);
  const userId = links[0]?.user_id as string | undefined;
  if (!userId) return "unknown_link" as const;
  const [subs] = await db.execute<RowDataPacket[]>("SELECT analytics_enabled FROM user_subscriptions WHERE user_id=? AND status='active' AND (expires_at IS NULL OR expires_at>NOW())", [userId]);
  if (!subs[0]?.analytics_enabled) return "analytics_plan_required" as const;
  const ua = request.headers.get("user-agent") || "";
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  const { visitor, ip: ipHash } = hashes(ip, ua);
  const [result] = await db.execute(`INSERT INTO tracker_events (user_id,slug,event_type,event_name,event_value,currency,visitor_hash,ip_hash,user_agent,referrer,utm_source,utm_medium,utm_campaign,is_bot,is_duplicate)
    VALUES (?,?,'conversion',?,?,?,?,?,?,?,?,?,?,0,0)`, [userId, slug, (body.event_name || "purchase").slice(0,80), Math.max(0, Number(body.value || 0)), (body.currency || "").toUpperCase().slice(0,8), visitor, ipHash, ua.slice(0,512), request.headers.get("referer")?.slice(0,2000) || "", "", "", ""]);
  return "recorded" as const;
}
