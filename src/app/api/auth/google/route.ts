import { ensureUserSubscription } from "@/lib/subscriptions";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { createSession, isSessionConfigured } from "@/lib/session";
import { jsonError, privateJson } from "@/lib/http";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";

const schema = z.object({ credential: z.string().min(20).max(10_000) });

export async function POST(request: Request) {
  if (!process.env.GOOGLE_CLIENT_ID || !isSessionConfigured()) {
    return jsonError("service_not_configured", 503);
  }

  try {
    const { credential } = schema.parse(await request.json());
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
      { cache: "no-store", signal: AbortSignal.timeout(5000) },
    );
    if (!response.ok) return jsonError("google_verification_failed", 401);

    const claims = await response.json() as {
      aud?: string;
      iss?: string;
      sub?: string;
      email?: string;
      email_verified?: string;
      name?: string;
      given_name?: string;
      family_name?: string;
      exp?: string;
    };

    const expiresAt = Number(claims.exp);
    if (
      claims.aud !== process.env.GOOGLE_CLIENT_ID
      || !["accounts.google.com", "https://accounts.google.com"].includes(claims.iss || "")
      || !claims.sub
      || !claims.email
      || claims.email_verified !== "true"
      || !Number.isFinite(expiresAt)
      || expiresAt <= Date.now() / 1000
    ) {
      return jsonError("google_verification_failed", 401);
    }

    const email = claims.email.trim().toLowerCase();
    const [found] = await db.execute<RowDataPacket[]>(
      "SELECT id FROM user_Tracker_Link WHERE email=? LIMIT 1",
      [email],
    );
    let userId = String(found[0]?.id || "");

    if (!userId) {
      userId = randomBytes(32).toString("hex");
      const first = (claims.given_name || claims.name || email).trim().slice(0, 250);
      const last = (claims.family_name || "").trim().slice(0, 250);
      const full = [last, first].filter(Boolean).join(" ").slice(0, 501);
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        await conn.execute(
          "INSERT INTO user_Tracker_Link (id,name,first_name,full_name,email,password,is_active_date,status) VALUES (?,?,?,?,?,'',NOW(),1)",
          [userId, last || first, first, full, email],
        );
        await conn.execute(
          "INSERT INTO user_subscriptions (user_id,plan,status,links_limit,clicks_limit,clicks_used,analytics_enabled,period_started_at) VALUES (?,'free','active',1,30,0,FALSE,NOW())",
          [userId],
        );
        await conn.commit();
      } catch (error) {
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
      }
    }

    await ensureUserSubscription(userId);
    await createSession(userId);
    return privateJson({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError("invalid_google_credential", 400);
    console.error("Google auth failed", error);
    return jsonError("google_auth_unavailable", 500);
  }
}
