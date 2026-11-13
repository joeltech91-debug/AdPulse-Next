import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CREATE_CAMPAIGNS_TABLE = `CREATE TABLE IF NOT EXISTS ad_campaigns (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  objective VARCHAR(24) NOT NULL,
  spend DECIMAL(12,2) NOT NULL DEFAULT 0,
  impressions BIGINT UNSIGNED NOT NULL DEFAULT 0,
  slug VARCHAR(250) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ad_campaigns_user_date (user_id, created_at),
  UNIQUE KEY uq_ad_campaigns_user_slug (user_id, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

export async function POST(request: Request) {
  const configuredSecret = process.env.ADPULSE_MIGRATION_SECRET;
  const suppliedSecret = request.headers.get("authorization")?.replace(/^Bearer\\s+/i, "") ?? "";

  if (!configuredSecret || configuredSecret.length < 32) {
    return NextResponse.json({ error: "migration_not_configured" }, { status: 503 });
  }

  const expected = Buffer.from(configuredSecret);
  const supplied = Buffer.from(suppliedSecret);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await db.query(CREATE_CAMPAIGNS_TABLE);
    const [rows] = await db.execute(
      "SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'ad_campaigns'"
    );
    const count = Number((rows as Array<{ table_count: number }>)[0]?.table_count ?? 0);
    if (count !== 1) {
      return NextResponse.json({ error: "table_verification_failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      table: "ad_campaigns",
      message: "Table created or already existed. Existing application data was not modified."
    });
  } catch (error) {
    console.error("ad_campaigns migration failed", error);
    return NextResponse.json({ error: "migration_failed" }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: "method_not_allowed" }, { status: 405 });
}
