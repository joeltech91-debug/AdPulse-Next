import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recordClick } from "@/lib/tracking";
import type { RowDataPacket } from "mysql2/promise";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!/^[a-f0-9]{6,32}$/i.test(slug)) return NextResponse.redirect(new URL("/",request.url));
  try {
    const [links] = await db.execute<RowDataPacket[]>("SELECT url,user_id FROM link_Tracker_Link WHERE slug=? LIMIT 1",[slug]);
    const link = links[0];
    if (!link) return NextResponse.redirect(new URL("/",request.url));
    // Browser and framework prefetches are not intentional visits and must
    // never consume a click or subscription quota.
    const purpose = request.headers.get("purpose") || request.headers.get("sec-purpose") || "";
    const isPrefetch = /prefetch/i.test(purpose) || request.headers.get("next-router-prefetch") === "1";
    if (!isPrefetch) {
      try { await recordClick(request,slug,String(link.user_id)); }
      catch (e) { console.error("click tracking failed",e); }
    }
    const target = new URL(String(link.url));
    if (!["http:","https:"].includes(target.protocol)) return NextResponse.redirect(new URL("/",request.url));
    // A short-link redirect must always use the latest destination saved by
    // the owner; prevent browsers and intermediary caches from reusing an old 302.
    return NextResponse.redirect(target, {
      status: 302,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, private", "Pragma": "no-cache", "Expires": "0", "Vary": "*" }
    });
  } catch (e) { console.error("short link lookup failed",e); return NextResponse.redirect(new URL("/",request.url)); }
}
