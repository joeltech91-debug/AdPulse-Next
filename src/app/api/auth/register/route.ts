import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, isSessionConfigured } from "@/lib/session";
import { jsonError, privateJson } from "@/lib/http";

const schema = z.object({ name: z.string().trim().min(1).max(250), firstName: z.string().trim().min(1).max(250), email: z.email().transform(v => v.toLowerCase()), password: z.string().min(10).max(128), passwordConfirm: z.string() }).refine(v => v.password === v.passwordConfirm, { path: ["passwordConfirm"] });
export async function POST(request: Request) {
  try {
    if (!isSessionConfigured()) return jsonError("service_not_configured", 503);
    const input = schema.parse(await request.json());
    const id = randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(input.password, 12);
    const fullName = `${input.name} ${input.firstName}`;
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute("INSERT INTO user_Tracker_Link (id,name,first_name,full_name,email,password,is_active_date,status) VALUES (?,?,?,?,?,?,NOW(),1)", [id,input.name,input.firstName,fullName,input.email,hash]);
      await conn.execute("INSERT INTO user_subscriptions (user_id,plan,status,links_limit,clicks_limit,clicks_used,analytics_enabled,period_started_at) VALUES (?,'free','active',1,30,0,FALSE,NOW())", [id]);
      await conn.commit();
    } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
    await createSession(id);
    return privateJson({ ok: true }, 201);
  } catch (e) {
    if (e instanceof z.ZodError) return jsonError("invalid_registration", 400);
    if (typeof e === "object" && e && "code" in e && e.code === "ER_DUP_ENTRY") return jsonError("email_already_exists", 409);
    console.error("register failed", e);
    return jsonError("registration_unavailable", 500);
  }
}
