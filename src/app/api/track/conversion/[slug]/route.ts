import { z } from "zod";
import { recordConversion } from "@/lib/tracking";
import { jsonError, privateJson } from "@/lib/http";
const schema = z.object({ event_name: z.string().max(80).optional(), value: z.number().min(0).max(1_000_000_000).optional(), currency: z.string().max(8).optional() });
export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  try {
    const body = schema.parse(await request.json());
    const result = await recordConversion(request,slug,body);
    if (result === "unknown_link") return jsonError(result,404);
    if (result === "analytics_plan_required") return jsonError(result,403);
    return privateJson({ recorded: true },201);
  } catch (e) { if (e instanceof z.ZodError) return jsonError("invalid_payload",400); console.error("conversion tracking failed",e); return jsonError("conversion_unavailable",500); }
}
