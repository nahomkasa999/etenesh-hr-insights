import config from "@payload-config";
import { getPayload } from "payload";

import { isAuthorizedCronRequest } from "@/lib/cron/authorize";
import { runAutoApplyForAll } from "@/lib/etenesh/auto-apply";

export const runtime = "nodejs";
export const maxDuration = 300;

// Daily: applies for new matching jobs for everyone with auto apply on.
export async function GET(request: Request): Promise<Response> {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const payload = await getPayload({ config });
    const result = await runAutoApplyForAll(payload);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    console.error("auto apply cron failed", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
