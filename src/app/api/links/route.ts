import { z } from "zod";
import { getSessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { createLinkForUser, normalizeTarget } from "@/lib/links";
import { jsonError, privateJson } from "@/lib/http";
import type { RowDataPacket } from "mysql2/promise";

const createSchema = z.object({ url: z.string().min(3).max(2048) });
export async function GET(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("unauthorized", 401);
  const params = new URL(request.url).searchParams;
  const limit = Math.min(100, Math.max(1, Number(params.get("limit") || 50)));
  const offset = Math.max(0, Number(params.get("offset") || 0));
  try {
    const [links] = await db.execute<RowDataPacket[]>(`SELECT url AS target,slug,urlGenerate AS shortUrl,click_total AS clicks,click_mobile AS mobileClicks,click_pc AS desktopClicks,created_at AS createdAt
      FROM link_Tracker_Link WHERE user_id=? ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?`, [userId,limit,offset]);
    return privateJson({ links, limit, offset });
  } catch (e) { console.error("links list failed", e); return jsonError("links_unavailable", 500); }
}
export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("unauthorized", 401);
  try {
    const input = createSchema.parse(await request.json());
    const target = normalizeTarget(input.url);
    if (target.length > 250) return jsonError("url_too_long", 400);
    return privateJson(await createLinkForUser(userId,target), 201);
  } catch (e) {
    if (e instanceof z.ZodError) return jsonError("invalid_url", 400);
    const code = e instanceof Error ? e.message : "";
    if (code === "invalid_url") return jsonError(code,400);
    if (code === "link_limit_reached") return jsonError(code, 403);
    console.error("link creation failed",e); return jsonError("link_creation_failed",500);
  }
}
export async function PATCH(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("unauthorized", 401);
  const schema = z.object({ slug: z.string().min(1).max(250), url: z.string().min(3).max(2048) });
  try {
    const input = schema.parse(await request.json()), target = normalizeTarget(input.url);
    if (target.length > 250) return jsonError("url_too_long",400);

    // Capture the generated short URL before changing the destination.
    // The short URL is stable; only the destination column is editable.
    const [existing] = await db.execute<RowDataPacket[]>(
      "SELECT id, urlGenerate FROM link_Tracker_Link WHERE slug=? AND user_id=? LIMIT 1",
      [input.slug,userId]
    );
    if (!existing.length) return jsonError("link_not_found",404);
    const originalShortUrl = String(existing[0].urlGenerate ?? "");

    // Deliberately update only url; never update slug or urlGenerate.
    await db.execute(
      "UPDATE link_Tracker_Link SET url=? WHERE slug=? AND user_id=?",
      [target,input.slug,userId]
    );

    // Verify both the new destination and the unchanged generated short URL.
    const [saved] = await db.execute<RowDataPacket[]>(
      "SELECT url, urlGenerate FROM link_Tracker_Link WHERE slug=? AND user_id=? LIMIT 1",
      [input.slug,userId]
    );
    if (!saved[0] || String(saved[0].url) !== target) {
      console.error("link destination update did not persist", { slug: input.slug, userId });
      return jsonError("link_update_failed",500);
    }
    if (String(saved[0].urlGenerate ?? "") !== originalShortUrl) {
      console.error("generated short URL unexpectedly changed during destination update", { slug: input.slug, userId });
      return jsonError("short_link_changed",500);
    }
    return privateJson({ updated: true, target: String(saved[0].url), shortUrl: originalShortUrl });
  } catch (e) { if (e instanceof z.ZodError) return jsonError("invalid_payload",400); if (e instanceof Error && e.message==="invalid_url") return jsonError("invalid_url",400); console.error(e); return jsonError("link_update_failed",500); }
}
export async function DELETE(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("unauthorized",401);
  const slug = new URL(request.url).searchParams.get("slug") || "";
  if (!slug || slug.length > 250) return jsonError("invalid_slug",400);
  const [result] = await db.execute("DELETE FROM link_Tracker_Link WHERE slug=? AND user_id=?", [slug,userId]);
  if ((result as { affectedRows: number }).affectedRows === 0) return jsonError("link_not_found",404);
  return privateJson({ deleted: true });
}
