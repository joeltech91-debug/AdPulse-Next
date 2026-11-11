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
    const [links] = await db.execute<RowDataPacket[]>(`SELECT id, url AS destinationUrl, urlGenerate AS generatedUrl, slug, click_total AS clicks, click_mobile AS mobileClicks, click_pc AS desktopClicks, created_at AS createdAt
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

  // The database stores two separate values:
  // - url: the original destination that can be edited
  // - urlGenerate: the public short URL, which must never be edited
  const schema = z.object({
    id: z.number().int().positive(),
    destinationUrl: z.string().min(3).max(2048),
  });

  try {
    const input = schema.parse(await request.json());
    const destination = normalizeTarget(input.destinationUrl);
    if (destination.length > 250) return jsonError("url_too_long", 400);

    // Lock and identify the exact owned row by its immutable primary key.
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [existing] = await conn.execute<RowDataPacket[]>(
        "SELECT id, urlGenerate FROM link_Tracker_Link WHERE id=? AND user_id=? FOR UPDATE",
        [input.id, userId]
      );
      if (!existing[0]) {
        await conn.rollback();
        return jsonError("link_not_found", 404);
      }

      const generatedUrlBefore = String(existing[0].urlGenerate ?? "");

      // Update ONLY the destination column. id, slug and urlGenerate remain untouched.
      await conn.execute(
        "UPDATE link_Tracker_Link SET url=? WHERE id=? AND user_id=?",
        [destination, input.id, userId]
      );

      // Read the row again inside the same transaction before confirming success.
      const [saved] = await conn.execute<RowDataPacket[]>(
        "SELECT id, url, slug, urlGenerate FROM link_Tracker_Link WHERE id=? AND user_id=? LIMIT 1",
        [input.id, userId]
      );
      if (
        !saved[0] ||
        String(saved[0].url) !== destination ||
        String(saved[0].urlGenerate ?? "") !== generatedUrlBefore
      ) {
        await conn.rollback();
        console.error("destination update verification failed", { linkId: input.id, userId });
        return jsonError("link_update_failed", 500);
      }

      await conn.commit();
      return privateJson({
        updated: true,
        id: Number(saved[0].id),
        destinationUrl: String(saved[0].url),
        generatedUrl: String(saved[0].urlGenerate ?? ""),
        slug: String(saved[0].slug),
      });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e instanceof z.ZodError) return jsonError("invalid_payload", 400);
    if (e instanceof Error && e.message === "invalid_url") return jsonError("invalid_url", 400);
    console.error("link destination update failed", e);
    return jsonError("link_update_failed", 500);
  }
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
