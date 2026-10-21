import type { SanitizedPlan } from "./validation";

export function escapeTelegramHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

function readableDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
}

function readableTime(timeStr: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(timeStr);
  return match ? `${match[1]}:${match[2]}` : timeStr;
}

const ACTIVITY_LABEL: Record<string, string> = {
  eat: "Đi ăn 🍜",
  movie: "Xem phim 🎬",
  walk: "Đi dạo 🚶",
  cafe: "Đi cafe ☕",
  cook: "Tự nấu 🍳",
  meet: "Chỉ cần gặp anh 💞",
};

const DETAIL_LABEL: Record<string, string> = {
  eat: "Món muốn ăn",
  movie: "Phim muốn xem",
  cafe: "Quán muốn đi",
};

function submittedNow(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${now.getDate()} tháng ${now.getMonth() + 1} ${now.getFullYear()}, ${h}:${min}`;
}

export function buildTelegramMessage(plan: SanitizedPlan): string {
  const name = escapeTelegramHtml(plan.recipientName || "em 💖");
  const date = escapeTelegramHtml(readableDate(plan.date));
  const time = escapeTelegramHtml(readableTime(plan.time));
  const activity = escapeTelegramHtml(ACTIVITY_LABEL[plan.activity] ?? plan.activity);

  const lines = [
    `💌 <b>HẸN HÒ ĐÃ CHỐT!</b>`,
    ``,
    `Em vừa chốt buổi hẹn với anh 💖`,
    ``,
    `👤 <b>Dành cho:</b> ${name}`,
    ``,
    `📅 <b>Ngày:</b> ${date}`,
    ``,
    `🕗 <b>Giờ:</b> ${time}`,
    ``,
    `🎯 <b>Hoạt động:</b> ${activity}`,
  ];

  if (plan.activityDetail) {
    const label = DETAIL_LABEL[plan.activity] ?? "Ghi chú";
    lines.push(``, `📝 <b>${escapeTelegramHtml(label)}:</b> ${escapeTelegramHtml(plan.activityDetail)}`);
  }

  lines.push(
    ``,
    `────────────────`,
    `✅ Trạng thái: ĐÃ CHỐT`,
    `⏰ Gửi lúc: ${escapeTelegramHtml(submittedNow())}`
  );

  return lines.join("\n");
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
