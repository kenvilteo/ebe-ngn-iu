export interface RawPlan {
  accepted?: unknown;
  recipientName?: unknown;
  vibe?: unknown;
  date?: unknown;
  time?: unknown;
  answers?: unknown;
  compatibilityResult?: unknown;
  foods?: unknown;
  completedAt?: unknown;
}

export interface SanitizedPlan {
  accepted: true;
  recipientName: string;
  vibe: string;
  date: string;
  time: string;
  answers: { drink: string; timeOfDay: string; activity: string };
  compatibilityResult: string;
  foods: string[];
}

const VIBES = new Set(["cozy", "fancy", "adventure", "chaotic", "foodie"]);
const TIMES = new Set(["17:00", "18:00", "19:00", "20:00", "21:00"]);
const FOODS = new Set(["Pizza", "Sushi", "Burgers", "Pasta", "Tacos", "Ramen"]);
const DRINKS = new Set(["coffee", "fancy"]);
const TIMES_OF_DAY = new Set(["sunset", "night"]);
const ACTIVITIES = new Set(["walk", "cozy"]);

const MAX_NAME = 50;
const MAX_GENERIC = 120;
const MAX_FOOD = 30;

function validCustomFood(name: string): boolean {
  if (name.length < 2 || name.length > MAX_FOOD) return false;
  // Letters, numbers, spaces and common food-name punctuation/emoji only.
  return /^[\p{L}\p{N}\p{Emoji_Presentation}\p{Extended_Pictographic} .,'’\-+&()!]+$/u.test(name);
}

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

  const vibe = cleanString(p.vibe, 20);
  if (!VIBES.has(vibe)) return { ok: false, error: "INVALID_VIBE" };

  const date = cleanString(p.date, 10);
  if (!validDate(date)) return { ok: false, error: "INVALID_DATE" };

  const time = cleanString(p.time, 5);
  if (!TIMES.has(time)) return { ok: false, error: "INVALID_TIME" };

  if (!Array.isArray(p.foods) || p.foods.length < 1 || p.foods.length > 5) {
    return { ok: false, error: "INVALID_FOODS" };
  }
  const foods: string[] = [];
  const seenLower = new Set<string>();
  for (const f of p.foods) {
    const name = cleanString(f, MAX_FOOD);
    const lower = name.toLowerCase();
    if (seenLower.has(lower)) return { ok: false, error: "INVALID_FOODS" };
    seenLower.add(lower);
    if (FOODS.has(name)) {
      foods.push(name);
    } else if (validCustomFood(name)) {
      foods.push(name);
    } else {
      return { ok: false, error: "INVALID_FOODS" };
    }
  }

  const answers = (p.answers && typeof p.answers === "object" ? p.answers : {}) as Record<string, unknown>;
  const drink = cleanString(answers.drink, 20);
  const timeOfDay = cleanString(answers.timeOfDay, 20);
  const activity = cleanString(answers.activity, 20);
  if (!DRINKS.has(drink) || !TIMES_OF_DAY.has(timeOfDay) || !ACTIVITIES.has(activity)) {
    return { ok: false, error: "INVALID_ANSWERS" };
  }

  const recipientName = cleanString(p.recipientName, MAX_NAME);
  const compatibilityResult = cleanString(p.compatibilityResult, MAX_GENERIC);

  return {
    ok: true,
    plan: {
      accepted: true,
      recipientName,
      vibe,
      date,
      time,
      answers: { drink, timeOfDay, activity },
      compatibilityResult,
      foods,
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
