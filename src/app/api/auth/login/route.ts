import { ensureUserSubscription } from "@/lib/subscriptions";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, isSessionConfigured } from "@/lib/session";
import { jsonError, privateJson } from "@/lib/http";
import type { RowDataPacket } from "mysql2/promise";

const schema = z.object({ email: z.email().transform(v => v.toLowerCase()), password: z.string().min(1).max(128) });
export async function POST(request: Request) {
  try {
    if (!isSessionConfigured()) return jsonError("service_not_configured", 503);
    const input = schema.parse(await request.json());
    const [users] = await db.execute<RowDataPacket[]>("SELECT id,password FROM user_Tracker_Link WHERE email=? LIMIT 1", [input.email]);
    const user = users[0];
    if (!user || !user.password || !(await bcrypt.compare(input.password, String(user.password)))) return jsonError("invalid_credentials", 401);
    await ensureUserSubscription(String(user.id));
    await createSession(String(user.id));
    return privateJson({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) return jsonError("invalid_credentials", 400);
    console.error("login failed", e);
    return jsonError("login_unavailable", 500);
  }
}
