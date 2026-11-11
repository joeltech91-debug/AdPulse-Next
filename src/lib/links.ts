import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export function normalizeTarget(input: string): string {
  const value = input.trim();
  const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`);
  if (!["http:", "https:"].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error("invalid_url");
  if (url.hostname === "localhost" || url.hostname.endsWith(".localhost")) throw new Error("invalid_url");
  return url.toString();
}
export function makeSlug() { return randomBytes(5).toString("hex"); }
export async function createLinkForUser(userId: string, target: string, publicBaseUrl?: string) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute("INSERT IGNORE INTO user_subscriptions (user_id) VALUES (?)", [userId]);
    const [subs] = await conn.execute<RowDataPacket[]>("SELECT links_limit FROM user_subscriptions WHERE user_id=? FOR UPDATE", [userId]);
    if (!subs[0]) throw new Error("subscription_unavailable");
    const limit = Number(subs[0].links_limit);
    const [counts] = await conn.execute<RowDataPacket[]>("SELECT COUNT(*) AS total FROM link_Tracker_Link WHERE user_id=?", [userId]);
    if (limit >= 0 && Number(counts[0].total) >= limit) throw new Error("link_limit_reached");
    let slug = "";
    for (let i = 0; i < 4; i++) {
      slug = makeSlug();
      const [exists] = await conn.execute<RowDataPacket[]>("SELECT id FROM link_Tracker_Link WHERE slug=? LIMIT 1", [slug]);
      if (!exists.length) break;
      slug = "";
    }
    if (!slug) throw new Error("slug_generation_failed");
    // Generated short links must resolve through this Next.js app, whose redirect handler reads the latest MySQL destination. MY_URL may still point to the legacy Go redirect service, so it is only a fallback.
    const base = (publicBaseUrl || process.env.NEXT_PUBLIC_APP_URL || process.env.FRONT || process.env.MY_URL || "http://localhost:3000").replace(/\/$/, "");
    await conn.execute("INSERT INTO link_Tracker_Link (user_id,url,slug,urlGenerate,click_total,click_mobile,click_pc) VALUES (?,?,?,?,0,0,0)", [userId, target, slug, `${base}/link/${slug}`]);
    await conn.commit();
    return { slug, shortUrl: `${base}/link/${slug}`, target };
  } catch (error) { await conn.rollback(); throw error; }
  finally { conn.release(); }
}
