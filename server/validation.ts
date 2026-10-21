import type { ActivityKey } from "../src/types";

export interface RawPlan {
  accepted?: unknown;
  recipientName?: unknown;
  date?: unknown;
  time?: unknown;
  activity?: unknown;
  activityDetail?: unknown;
  completedAt?: unknown;
}

export interface SanitizedPlan {
  accepted: true;
  recipientName: string;
  date: string;
  time: string;
  activity: ActivityKey;
  activityDetail: string;
}

const TIMES = new Set(["17:00", "18:00", "19:00", "20:00", "21:00"]);
const ACTIVITIES = new Set<string>(["eat", "movie", "walk", "cafe", "cook", "meet"]);
/** Chỉ ba hoạt động này mới bắt buộc có câu trả lời thêm. */
const DETAIL_REQUIRED = new Set(["eat", "movie", "cafe"]);

const MAX_NAME = 50;
const MAX_DETAIL = 60;

function cleanString(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  let out = "";
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    if (code >= 32 && code !== 127) out += ch;
    if (out.length >= max + 16) break;
  }
  return out.trim().slice(0, max);
}

export function todayLocalISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return false;
  return value >= todayLocalISO();
}

export function validatePlan(raw: unknown): { ok: true; plan: SanitizedPlan } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "INVALID_PAYLOAD" };
  const p = raw as RawPlan;

  if (p.accepted !== true) return { ok: false, error: "NOT_ACCEPTED" };

  const date = cleanString(p.date, 10);
  if (!validDate(date)) return { ok: false, error: "INVALID_DATE" };

  const time = cleanString(p.time, 5);
  if (!TIMES.has(time)) return { ok: false, error: "INVALID_TIME" };

  const activity = cleanString(p.activity, 20);
  if (!ACTIVITIES.has(activity)) return { ok: false, error: "INVALID_ACTIVITY" };

  const activityDetail = cleanString(p.activityDetail, MAX_DETAIL);
  if (DETAIL_REQUIRED.has(activity) && activityDetail.length === 0) {
    return { ok: false, error: "INVALID_DETAIL" };
  }

  const recipientName = cleanString(p.recipientName, MAX_NAME);

  return {
    ok: true,
    plan: {
      accepted: true,
      recipientName,
      date,
      time,
      activity: activity as ActivityKey,
      activityDetail,
    },
  };
}

export function validSubmissionId(value: unknown): value is string {
  return typeof value === "string" && value.length >= 8 && value.length <= 128;
}

export const MAX_LOVE_MESSAGE = 300;

/**
 * Lời nhắn cô ấy gõ ở trang /love. Trả lỗi rõ ràng khi quá dài thay vì cắt âm
 * thầm — cắt mất chữ trong một lời nhắn là kiểu hỏng khó phát hiện.
 */
export function validateLoveMessage(
  raw: unknown
): { ok: true; message: string } | { ok: false; error: string } {
  if (typeof raw !== "string") return { ok: false, error: "EMPTY_MESSAGE" };
  if (raw.trim().length > MAX_LOVE_MESSAGE) return { ok: false, error: "MESSAGE_TOO_LONG" };

  const message = cleanString(raw, MAX_LOVE_MESSAGE);
  if (message.length === 0) return { ok: false, error: "EMPTY_MESSAGE" };

  return { ok: true, message };
}

/** Số ngày kèm theo lượt ghé thăm — chỉ để tin nhắn có ngữ cảnh, sai thì bỏ. */
export function clampDays(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const days = Math.floor(value);
  if (days < 0 || days > 100000) return undefined;
  return days;
}

/** Trang nào vừa được mở. Giá trị lạ → "love", để client cũ chưa gửi field vẫn chạy. */
export type VisitPage = "love" | "encourage";

export function normalizeVisitPage(value: unknown): VisitPage {
  return value === "encourage" ? "encourage" : "love";
}
