import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI || new URL("/api/auth/facebook/callback", request.url).toString();

  if (!appId || !appSecret) {
    return NextResponse.redirect(new URL("/connexion?error=facebook_not_configured", request.url));
  }

  const state = randomBytes(32).toString("hex");
  (await cookies()).set("adpulse_facebook_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const authorizationUrl = new URL("https://www.facebook.com/dialog/oauth");
  authorizationUrl.searchParams.set("client_id", appId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "email,public_profile");

  return NextResponse.redirect(authorizationUrl);
}
