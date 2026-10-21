import type { NextFunction, Request, Response } from "express";
import { todayLocalISO } from "./validation";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

function unref(timer: ReturnType<typeof setInterval>): void {
  if (typeof timer === "object" && "unref" in timer) {
    (timer as unknown as { unref: () => void }).unref();
  }
}

/**
 * Mỗi limiter giữ Map riêng, để các nhóm endpoint không ăn hạn mức của nhau.
 */
export function createRateLimiter({ windowMs = WINDOW_MS, max = MAX_REQUESTS } = {}) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, 60_000);
  unref(cleanupTimer);

  return function rateLimiter(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || entry.resetAt <= now) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    entry.count += 1;
    if (entry.count > max) {
      res.status(429).json({ ok: false, error: "RATE_LIMITED" });
      return;
    }
    next();
  };
}

export const rateLimiter = createRateLimiter();

/**
 * Bucket riêng cho /love. Nếu dùng chung với /api/submit-date thì một vòng
 * refresh ở trang kỷ niệm có thể khoá luôn nút xác nhận buổi hẹn.
 */
export const loveRateLimiter = createRateLimiter({ max: 12 });

const seenIds = new Map<string, number>();

const dedupeTimer = setInterval(() => {
  const now = Date.now();
  for (const [id, ts] of seenIds) {
    if (now - ts > WINDOW_MS) seenIds.delete(id);
  }
}, 60_000);
unref(dedupeTimer);

/** Trả về true nếu id này vừa được xử lý — đồng thời ghi nhận nó. */
export function isDuplicateId(id: string): boolean {
  if (seenIds.has(id)) return true;
  seenIds.set(id, Date.now());
  return false;
}

const DAILY_TTL_MS = 36 * 60 * 60 * 1000;

const dailySeen = new Map<string, { day: string; ts: number }>();

const dailyTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of dailySeen) {
    if (now - entry.ts > DAILY_TTL_MS) dailySeen.delete(key);
  }
}, 60_000);
unref(dailyTimer);

export function seenToday(key: string): boolean {
  return dailySeen.get(key)?.day === todayLocalISO();
}

/**
 * Ghi nhận riêng, gọi SAU khi gửi Telegram thành công — nếu gộp vào lúc kiểm tra
 * thì một lần gửi lỗi sẽ đốt mất suất của cả ngày hôm đó.
 *
 * Lưu cả chuỗi ngày lẫn timestamp: một lượt lúc 23:00 rồi một lượt lúc 00:30
 * phải gửi hai lần, còn TTL thuần 24 giờ thì không.
 */
export function markSeenToday(key: string): void {
  dailySeen.set(key, { day: todayLocalISO(), ts: Date.now() });
}
