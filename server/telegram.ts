import type { SanitizedPlan } from "./validation";

export function escapeTelegramHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ordinal(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  switch (day % 10) {
    case 1: return `${day}st`;
    case 2: return `${day}nd`;
    case 3: return `${day}rd`;
    default: return `${day}th`;
  }
}

function readableDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${ordinal(date.getDate())}, ${date.getFullYear()}`;
}

function readableTime(timeStr: string): string {
  const [h, min] = timeStr.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(min).padStart(2, "0")} ${suffix}`;
}

const VIBE_LABEL: Record<string, string> = {
  cozy: "Cozy ☕",
  fancy: "Fancy ✨",
  adventure: "Adventure 🌿",
  chaotic: "Chaotic 😈",
  foodie: "Food Coma 🍜",
};

const FOOD_EMOJI: Record<string, string> = {
  Pizza: "🍕",
  Sushi: "🍣",
  Burgers: "🍔",
  Pasta: "🍝",
  Tacos: "🌮",
  Ramen: "🍜",
};

const DRINK_LABEL: Record<string, string> = { coffee: "Coffee ☕", fancy: "Something fancy 🍸" };
const TOD_LABEL: Record<string, string> = { sunset: "Sunset 🌅", night: "Night 🌙" };
const ACT_LABEL: Record<string, string> = { walk: "Walk around 🚶", cozy: "Sit somewhere cozy 🛋️" };

function submittedNow(): string {
  const now = new Date();
  const day = ordinal(now.getDate());
  const month = MONTHS[now.getMonth()];
  let h = now.getHours();
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 === 0 ? 12 : h % 12;
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${now.getFullYear()}, ${h}:${min} ${suffix}`;
}

export function buildTelegramMessage(plan: SanitizedPlan): string {
  const name = escapeTelegramHtml(plan.recipientName || "My date 💖");
  const date = escapeTelegramHtml(readableDate(plan.date));
  const time = escapeTelegramHtml(readableTime(plan.time));
  const vibe = escapeTelegramHtml(VIBE_LABEL[plan.vibe] ?? plan.vibe);
  const foods = plan.foods
    .map((f) => escapeTelegramHtml(`${f} ${FOOD_EMOJI[f] ?? ""}`.trim()))
    .join("\n");
  const drink = escapeTelegramHtml(DRINK_LABEL[plan.answers.drink] ?? plan.answers.drink);
  const tod = escapeTelegramHtml(TOD_LABEL[plan.answers.timeOfDay] ?? plan.answers.timeOfDay);
  const act = escapeTelegramHtml(ACT_LABEL[plan.answers.activity] ?? plan.answers.activity);
  const result = plan.compatibilityResult
    ? escapeTelegramHtml(plan.compatibilityResult)
    : "Compatible enough to try 💗";

  return [
    `💌 <b>DATE CONFIRMED!</b>`,
    ``,
    `Someone just finished the Date Planner 💖`,
    ``,
    `👤 <b>For:</b> ${name}`,
    ``,
    `📅 <b>Date:</b> ${date}`,
    ``,
    `🕕 <b>Time:</b> ${time}`,
    ``,
    `✨ <b>Vibe:</b> ${vibe}`,
    ``,
    `🍽 <b>Food:</b>\n${foods}`,
    ``,
    `🧪 <b>Important research:</b>\nDrink: ${drink}\nTime: ${tod}\nActivity: ${act}`,
    ``,
    `💘 <b>Result:</b> ${result}`,
    ``,
    `────────────────`,
    `✅ Status: CONFIRMED`,
    `⏰ Submitted: ${escapeTelegramHtml(submittedNow())}`,
  ].join("\n");
}

export function buildLoveVisitMessage(days?: number): string {
  const lines = [
    `💌 <b>Cô ấy vừa ghé thăm!</b>`,
    ``,
    `Vừa có người mở trang kỷ niệm của hai đứa mình.`,
  ];

  if (typeof days === "number") {
    lines.push(``, `📆 Đã bên nhau ${days} ngày`);
  }

  lines.push(``, `⏰ ${escapeTelegramHtml(submittedNow())}`);
  return lines.join("\n");
}

export function buildEncourageVisitMessage(days?: number): string {
  const lines = [
    `💌 <b>Cô ấy ghé trang động viên!</b>`,
    ``,
    `Vừa có người mở trang anh làm để cổ vũ em ấy làm việc.`,
  ];

  if (typeof days === "number") {
    lines.push(``, `📆 Đã bên nhau ${days} ngày`);
  }

  lines.push(``, `⏰ ${escapeTelegramHtml(submittedNow())}`);
  return lines.join("\n");
}

/**
 * `message` BẮT BUỘC phải qua escapeTelegramHtml trước khi ghép vào đây.
 * sendToTelegram gửi với parse_mode "HTML", nên chỉ một dấu "<" lạc lõng trong
 * câu cô ấy gõ là Telegram từ chối nguyên tin với lỗi 400 — mà phía client chỉ
 * thấy "SEND_FAILED" chung chung, rất khó lần ra nguyên nhân.
 */
export function buildLoveMessage(message: string): string {
  return [
    `💌 <b>Lời nhắn mới!</b>`,
    ``,
    escapeTelegramHtml(message),
    ``,
    `────────────────`,
    `⏰ ${escapeTelegramHtml(submittedNow())}`,
  ].join("\n");
}

export interface TelegramCredentials {
  token?: string;
  chatId?: string;
}

/**
 * Trên Cloudflare Workers không có `process`; đọc phòng thủ để file này dùng
 * chung được cho cả server Express lẫn Pages Functions.
 */
function envCredentials(): TelegramCredentials {
  if (typeof process === "undefined") return {};
  return {
    token: process.env.DATE_PLANNER_TELEGRAM_BOT_TOKEN,
    chatId: process.env.DATE_PLANNER_TELEGRAM_CHAT_ID,
  };
}

export async function sendToTelegram(
  text: string,
  credentials?: TelegramCredentials
): Promise<{ ok: boolean; error?: string }> {
  const fallback = envCredentials();
  const token = credentials?.token || fallback.token;
  const chatId = credentials?.chatId || fallback.chatId;

  if (!token || !chatId) {
    console.error("[telegram] Missing DATE_PLANNER_TELEGRAM_BOT_TOKEN or DATE_PLANNER_TELEGRAM_CHAT_ID.");
    return { ok: false, error: "NOT_CONFIGURED" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
    if (!res.ok || !data?.ok) {
      console.error("[telegram] sendMessage failed:", data?.description ?? res.status);
      return { ok: false, error: "SEND_FAILED" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[telegram] Network error:", err instanceof Error ? err.message : "unknown");
    return { ok: false, error: "SEND_FAILED" };
  } finally {
    clearTimeout(timeout);
  }
}
