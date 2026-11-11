import { getSessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { isPlanCode, PLANS } from "@/lib/plans";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { NextResponse } from "next/server";

const products: Record<string,string | undefined> = {
  standard: process.env.ID_PRODUIT,
  advanced: process.env.ID_PRODUIT_19 || "c8dec53d-aac0-4d40-bd94-0574dcf99cbf",
  unlimited: process.env.ID_PRODUIT_59 || "87b79ab6-ad20-4d6d-b219-6d8ab831ef6e",
};
export async function POST(request: Request, context: { params: Promise<{ plan: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("unauthorized",401);
  const { plan } = await context.params;
  if (!isPlanCode(plan) || plan === "free") return jsonError("invalid_plan",400);
  const productId = products[plan];
  const api = process.env.API_URL?.replace(/\/$/,""), apiKey = process.env.API_KEY;
  if (!productId || !api || !apiKey) return jsonError("payment_not_configured",503);
  try {
    const [users] = await db.execute<RowDataPacket[]>("SELECT name,first_name,email FROM user_Tracker_Link WHERE id=? LIMIT 1",[userId]);
    if (!users[0]) return jsonError("user_not_found",404);
    const appUrl = (process.env.MY_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/,"");
    const response = await fetch(`${api}/checkout`, { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${apiKey}`}, body:JSON.stringify({ productDocumentId:productId,email:users[0].email,firstName:users[0].first_name,lastName:users[0].name,redirectUrl:`${appUrl}/api/payments/verify/${plan}`,meta:{userId} }), signal:AbortSignal.timeout(25_000), cache:"no-store" });
    if (!response.ok) return jsonError("payment_provider_error",502);
    const data = z.object({ redirectUrl:z.url(),cart:z.object({id:z.string().min(1)}) }).parse(await response.json());
    const checkout = new URL(data.redirectUrl);
    if (checkout.protocol !== "https:") return jsonError("invalid_checkout_url",502);
    await db.execute(`INSERT INTO pending_subscription_payments (cart_id,user_id,plan,expires_at) VALUES (?,?,?,DATE_ADD(NOW(),INTERVAL 2 HOUR))
      ON DUPLICATE KEY UPDATE user_id=VALUES(user_id),plan=VALUES(plan),expires_at=VALUES(expires_at)`,[data.cart.id,userId,plan]);
    const result = NextResponse.redirect(checkout,303);
    result.cookies.set("panier_id",data.cart.id,{httpOnly:true,secure:true,sameSite:"none",path:"/api/payments",maxAge:1200});
    return result;
  } catch (e) { console.error("checkout initialization failed",e); return jsonError("checkout_unavailable",502); }
}
