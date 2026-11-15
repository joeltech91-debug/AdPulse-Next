import { randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";
import { ensureUserSubscription } from "@/lib/subscriptions";
import { createSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FacebookProfile = { id?: string; name?: string; email?: string };

function getFacebookRedirectUri(request: Request) {
  return process.env.FACEBOOK_REDIRECT_URI
    || (process.env.NODE_ENV === "production"
      ? "https://getadpulse.site/api/auth/facebook/callback"
      : new URL("/api/auth/facebook/callback", request.url).toString());
}

function loginError(origin: string, code: string) {
  return NextResponse.redirect(new URL(`/connexion?error=${encodeURIComponent(code)}`, origin));
}

export async function GET(request: Request) {
  const redirectUri = getFacebookRedirectUri(request);
  const appOrigin = new URL(redirectUri).origin;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const jar = await cookies();
  const expectedState = jar.get("adpulse_facebook_oauth_state")?.value;
  jar.delete("adpulse_facebook_oauth_state");

  if (url.searchParams.has("error")) return loginError(appOrigin, "facebook_cancelled");
  if (!code || !returnedState || !expectedState) return loginError(appOrigin, "facebook_invalid_response");
  const a = Buffer.from(returnedState);
  const b = Buffer.from(expectedState);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return loginError(appOrigin, "facebook_invalid_state");

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) return loginError(appOrigin, "facebook_not_configured");

  try {
    const tokenUrl = new URL("https://graph.facebook.com/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!tokenResponse.ok) return loginError(appOrigin, "facebook_token_failed");
    const tokenData = await tokenResponse.json() as { access_token?: string };
    if (!tokenData.access_token) return loginError(appOrigin, "facebook_token_failed");

    const profileUrl = new URL("https://graph.facebook.com/me");
    profileUrl.searchParams.set("fields", "id,name,email");
    profileUrl.searchParams.set("access_token", tokenData.access_token);
    const profileResponse = await fetch(profileUrl, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!profileResponse.ok) return loginError(appOrigin, "facebook_profile_failed");
    const profile = await profileResponse.json() as FacebookProfile;
    if (!profile.id || !profile.email) return loginError(appOrigin, "facebook_email_required");

    const email = profile.email.trim().toLowerCase();
    const [users] = await db.execute<RowDataPacket[]>(
      "SELECT id FROM user_Tracker_Link WHERE email=? LIMIT 1",
      [email],
    );
    let userId = String(users[0]?.id || "");

    if (!userId) {
      userId = randomBytes(32).toString("hex");
      const fullName = (profile.name || email).trim().slice(0, 501);
      const parts = fullName.split(/\\s+/);
      const firstName = parts.pop() || email;
      const lastName = parts.join(" ") || firstName;
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        await connection.execute(
          "INSERT INTO user_Tracker_Link (id,name,first_name,full_name,email,password,is_active_date,status) VALUES (?,?,?,?,?,'',NOW(),1)",
          [userId, lastName, firstName, fullName, email],
        );
        await connection.execute(
          "INSERT INTO user_subscriptions (user_id,plan,status,links_limit,clicks_limit,clicks_used,analytics_enabled,period_started_at) VALUES (?,'free','active',1,30,0,FALSE,NOW())",
          [userId],
        );
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }

    await ensureUserSubscription(userId);
    await createSession(userId);
    return NextResponse.redirect(new URL("/dashboard", appOrigin));
  } catch (error) {
    console.error("Facebook authentication failed", error);
    return loginError(appOrigin, "facebook_login_failed");
  }
}
