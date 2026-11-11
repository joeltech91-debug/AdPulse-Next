import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recordClick } from "@/lib/tracking";
import type { RowDataPacket } from "mysql2/promise";
export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!/^[a-f0-9]{6,32}$/i.test(slug)) return NextResponse.redirect(new URL("/",request.url));
  try {
    const [links] = await db.execute<RowDataPacket[]>("SELECT url,user_id FROM link_Tracker_Link WHERE slug=? LIMIT 1",[slug]);
    const link = links[0];
    if (!link) return NextResponse.redirect(new URL("/",request.url));
    try { await recordClick(request,slug,String(link.user_id)); } catch (e) { console.error("click tracking failed",e); }
    const target = new URL(String(link.url));
    if (!["http:","https:"].includes(target.protocol)) return NextResponse.redirect(new URL("/",request.url));
    return NextResponse.redirect(target,302);
  } catch (e) { console.error("short link lookup failed",e); return NextResponse.redirect(new URL("/",request.url)); }
}
