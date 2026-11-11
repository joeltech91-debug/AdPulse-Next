import { destroySession } from "@/lib/session";
import { privateJson } from "@/lib/http";
export async function POST() { await destroySession(); return privateJson({ ok: true }); }
