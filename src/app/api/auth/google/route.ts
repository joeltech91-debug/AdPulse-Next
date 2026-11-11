import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";
import { jsonError, privateJson } from "@/lib/http";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";

const schema=z.object({credential:z.string().min(20).max(10_000)});
export async function POST(request:Request) {
  if(!process.env.GOOGLE_CLIENT_ID) return jsonError("google_not_configured",503);
  try {
    const {credential}=schema.parse(await request.json());
    const response=await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,{cache:"no-store",signal:AbortSignal.timeout(5000)});
    if(!response.ok) return jsonError("google_verification_failed",401);
    const claims=await response.json() as {aud?:string;iss?:string;sub?:string;email?:string;email_verified?:string;name?:string;given_name?:string;family_name?:string;exp?:string};
    if(claims.aud!==process.env.GOOGLE_CLIENT_ID || !["accounts.google.com","https://accounts.google.com"].includes(claims.iss||"") || !claims.sub || !claims.email || claims.email_verified!=="true" || Number(claims.exp)<=Date.now()/1000) return jsonError("google_verification_failed",401);
    const email=claims.email.trim().toLowerCase();
    const [found]=await db.execute<RowDataPacket[]>("SELECT id FROM user_Tracker_Link WHERE email=? LIMIT 1",[email]);
    let userId=String(found[0]?.id||"");
    if(!userId) {
      userId=randomBytes(32).toString("hex");
      const first=claims.given_name||claims.name||email, last=claims.family_name||"";
      const full=[last,first].filter(Boolean).join(" ");
      const conn=await db.getConnection();
      try {
        await conn.beginTransaction();
        await conn.execute("INSERT INTO user_Tracker_Link (id,name,first_name,full_name,email,password,is_active_date,status) VALUES (?,?,?,?,?,'',NOW(),1)",[userId,last,first,full,email]);
        await conn.execute("INSERT INTO user_subscriptions (user_id,plan,status,links_limit,clicks_limit,clicks_used,analytics_enabled,period_started_at) VALUES (?,'free','active',1,30,0,FALSE,NOW())",[userId]);
        await conn.commit();
      } catch(e) { await conn.rollback(); throw e; } finally { conn.release(); }
    }
    await createSession(userId);
    return privateJson({ok:true});
  } catch(e) { if(e instanceof z.ZodError) return jsonError("invalid_google_credential",400); console.error("Google auth failed",e); return jsonError("google_auth_unavailable",500); }
}
