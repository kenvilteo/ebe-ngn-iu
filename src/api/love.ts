import type { LoveMessageResponse, LoveVisitResponse, VisitPage } from "../types";
import { randomId } from "../utils/randomId";

const TIMEOUT_MS = 20000;

interface ApiResult {
  ok: boolean;
  error?: string;
  sent?: boolean;
}

async function post(path: string, body: unknown): Promise<ApiResult> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    window.clearTimeout(timeout);

    const data = (await response.json().catch(() => null)) as ApiResult | null;
    if (!data) return { ok: false, error: "SEND_FAILED" };
    return data;
  } catch {
    return { ok: false, error: "NETWORK_ERROR" };
  }
}

/** Báo cho chủ app biết cô ấy vừa mở trang. Lỗi ở đây không hiện ra UI. */
export function postLoveVisit(
  clientVisitId: string,
  days?: number,
  page: VisitPage = "love"
): Promise<LoveVisitResponse> {
  return post("/api/love-visit", { clientVisitId, days, page });
}

export function postLoveMessage(
  message: string,
  clientMessageId: string = randomId()
): Promise<LoveMessageResponse> {
  return post("/api/love-message", { message, clientMessageId });
}
