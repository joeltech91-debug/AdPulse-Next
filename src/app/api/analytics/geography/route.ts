import { getSessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { jsonError, privateJson } from "@/lib/http";
import type { RowDataPacket } from "mysql2/promise";

const CONTINENTS: Record<string, string> = {
  AF: "Afrique", EU: "Europe", AS: "Asie", NA: "Amérique du Nord",
  SA: "Amérique du Sud", OC: "Océanie", AN: "Antarctique",
};

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("unauthorized", 401);
  try {
    const [plan] = await db.execute<RowDataPacket[]>(
      "SELECT analytics_enabled FROM user_subscriptions WHERE user_id=? AND status='active' AND (expires_at IS NULL OR expires_at>NOW())",
      [userId]
    );
    if (!plan[0]?.analytics_enabled) return jsonError("analytics_plan_required", 403);

    const [totals] = await db.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM tracker_events WHERE user_id=? AND event_type='click' AND is_bot=0 AND is_duplicate=0",
      [userId]
    );
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT geo_country_code AS countryCode, geo_country_name AS countryName, geo_continent_code AS continentCode, COUNT(*) AS clicks FROM tracker_events WHERE user_id=? AND event_type='click' AND is_bot=0 AND is_duplicate=0 GROUP BY geo_country_code, geo_country_name, geo_continent_code ORDER BY clicks DESC",
      [userId]
    );

    const total = Number(totals[0]?.total || 0);
    const countries = rows.filter(row => row.countryCode).map(row => ({
      code: String(row.countryCode),
      name: String(row.countryName || row.countryCode),
      clicks: Number(row.clicks || 0),
      percent: total ? Number(((Number(row.clicks || 0) / total) * 100).toFixed(1)) : 0,
    }));
    const continentCounts = new Map<string, number>();
    for (const row of rows) {
      if (!row.continentCode) continue;
      const code = String(row.continentCode);
      continentCounts.set(code, (continentCounts.get(code) || 0) + Number(row.clicks || 0));
    }
    const continents = [...continentCounts.entries()].map(([code, clicks]) => ({
      code, name: CONTINENTS[code] || code, clicks,
      percent: total ? Number(((clicks / total) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.clicks - a.clicks);
    const known = countries.reduce((sum, item) => sum + item.clicks, 0);
    const continentKnown = continents.reduce((sum, item) => sum + item.clicks, 0);

    return privateJson({
      total, countries, continents,
      unknown: Math.max(0, total - known),
      unknownPercent: total ? Number((((total - known) / total) * 100).toFixed(1)) : 0,
      continentUnknown: Math.max(0, total - continentKnown),
      continentUnknownPercent: total ? Number((((total - continentKnown) / total) * 100).toFixed(1)) : 0,
    });
  } catch (error) {
    console.error("analytics geography failed", error);
    return jsonError("geography_unavailable", 500);
  }
}
