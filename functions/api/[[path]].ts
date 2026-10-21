/**
 * Toàn bộ API của app, chạy trên Cloudflare Pages Functions.
 *
 * Giữ nguyên hành vi của server Express cũ (server/index.ts) để cả hai môi
 * trường dùng chung phần validate và soạn tin nhắn Telegram.
 */

import {
  buildEncourageVisitMessage,
  buildLoveMessage,
  buildLoveVisitMessage,
  buildTelegramMessage,
  sendToTelegram,
} from "../../server/telegram";
import {
  clampDays,
  normalizeVisitPage,
  validateLoveMessage,
  validatePlan,
  validSubmissionId,
} from "../../server/validation";
import { hitRateLimit, isDuplicateId, markSeenToday, seenToday } from "../_lib/store";

export interface Env {
  DATE_PLANNER_TELEGRAM_BOT_TOKEN?: string;
  DATE_PLANNER_TELEGRAM_CHAT_ID?: string;
  DATE_PLANNER_APP_SECRET?: string;
}

interface EventContext {
  request: Request;
  env: Env;
}

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.length > 32 * 1024) return {};
  try {
    const parsed = JSON.parse(text) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function clientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}

function credentials(env: Env) {
  return {
    token: env.DATE_PLANNER_TELEGRAM_BOT_TOKEN,
    chatId: env.DATE_PLANNER_TELEGRAM_CHAT_ID,
  };
}

async function handleSubmitDate(request: Request, env: Env): Promise<Response> {
  if (hitRateLimit("submit-date", clientIp(request), 5)) {
    return json({ ok: false, error: "RATE_LIMITED" }, 429);
  }

  const body = await readBody(request);

  if (!validSubmissionId(body.clientSubmissionId)) {
    return json({ ok: false, error: "INVALID_PAYLOAD" }, 400);
  }

  // Lớp chặn trùng nhẹ: kế hoạch đã nhận rồi thì xác nhận lại mà không gửi tin thứ hai.
  if (isDuplicateId(body.clientSubmissionId)) {
    return json({ ok: true });
  }

  const validated = validatePlan(body.plan);
  if (!validated.ok) {
    return json({ ok: false, error: validated.error }, 400);
  }

  const result = await sendToTelegram(buildTelegramMessage(validated.plan), credentials(env));

  if (!result.ok) {
    if (result.error === "NOT_CONFIGURED") {
      return json({ ok: false, error: "NOT_CONFIGURED" }, 500);
    }
    return json({ ok: false, error: "SEND_FAILED" }, 502);
  }

  return json({ ok: true });
}

/**
 * Cô ấy vừa mở trang /love hoặc /meomeo1. Tối đa một thông báo mỗi ngày cho mỗi
 * thiết bị. Không gắn rate limit: chốt "mỗi ngày một lần" đã mạnh hơn rồi.
 */
async function handleLoveVisit(request: Request, env: Env): Promise<Response> {
  const body = await readBody(request);

  if (!validSubmissionId(body.clientVisitId)) {
    return json({ ok: false, error: "INVALID_PAYLOAD" }, 400);
  }

  const page = normalizeVisitPage(body.page);

  // Khoá chống trùng tính cả trang: mỗi ngày mỗi thiết bị được một tin cho
  // /love và một tin cho /meomeo1, mở lại đúng trang cũ thì không gửi thêm.
  const seenKey = `${page}:${body.clientVisitId}`;
  if (seenToday(seenKey)) {
    return json({ ok: true, sent: false });
  }

  const days = clampDays(body.days);
  const result = await sendToTelegram(
    page === "encourage" ? buildEncourageVisitMessage(days) : buildLoveVisitMessage(days),
    credentials(env)
  );
  if (result.ok) markSeenToday(seenKey);

  // Cô ấy không bấm gì cả, nên đừng bao giờ để lỗi gửi hiện ra trước mặt cô ấy.
  return json({ ok: true, sent: result.ok });
}

async function handleLoveMessage(request: Request, env: Env): Promise<Response> {
  if (hitRateLimit("love-message", clientIp(request), 12)) {
    return json({ ok: false, error: "RATE_LIMITED" }, 429);
  }

  const body = await readBody(request);

  if (!validSubmissionId(body.clientMessageId)) {
    return json({ ok: false, error: "INVALID_PAYLOAD" }, 400);
  }

  // Validate TRƯỚC khi khử trùng lặp: isDuplicateId vừa kiểm tra vừa ghi nhận,
  // nên nếu chạy trước thì một payload hỏng sẽ đốt luôn id đó.
  const validated = validateLoveMessage(body.message);
  if (!validated.ok) {
    return json({ ok: false, error: validated.error }, 400);
  }

  if (isDuplicateId(body.clientMessageId)) {
    return json({ ok: true });
  }

  const result = await sendToTelegram(buildLoveMessage(validated.message), credentials(env));

  if (!result.ok) {
    if (result.error === "NOT_CONFIGURED") {
      return json({ ok: false, error: "NOT_CONFIGURED" }, 500);
    }
    return json({ ok: false, error: "SEND_FAILED" }, 502);
  }

  return json({ ok: true });
}

export async function onRequest(context: EventContext): Promise<Response> {
  const { request, env } = context;
  const path = new URL(request.url).pathname.replace(/\/+$/, "");
  const method = request.method;

  if (path === "/api/health") {
    if (method !== "GET") return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);
    return json({ ok: true });
  }

  if (path === "/api/date-event") {
    if (method !== "POST") return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);
    await readBody(request);
    // Optional hook point — notifyOnAccept is disabled by default in config.
    return json({ ok: true });
  }

  if (path === "/api/submit-date") {
    if (method !== "POST") return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);
    return handleSubmitDate(request, env);
  }

  if (path === "/api/love-visit") {
    if (method !== "POST") return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);
    return handleLoveVisit(request, env);
  }

  if (path === "/api/love-message") {
    if (method !== "POST") return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);
    return handleLoveMessage(request, env);
  }

  return json({ ok: false, error: "NOT_FOUND" }, 404);
}
