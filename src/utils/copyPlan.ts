import { findActivity } from "../config";
import type { DatePlan } from "../types";
import { formatReadableDate, formatTime } from "./dateFormat";

export function buildCopiedPlan(plan: DatePlan): string {
  const name = plan.recipientName?.trim() || "em";
  const date = plan.date ? formatReadableDate(plan.date) : "một ngày nào đó";
  const time = plan.time ? formatTime(plan.time) : "giờ nào cũng được";
  const activity = findActivity(plan.activity);
  const activityLine = activity ? `${activity.emoji} ${activity.title}` : "—";
  const detail = plan.activityDetail?.trim();

  const lines = [`Hẹn hò chốt kèo 💖`, ``, `${date} lúc ${time}`, `Dành cho: ${name}`, `Mình sẽ: ${activityLine}`];
  if (detail) lines.push(`${activity?.detailLabel ?? "Ghi chú"}: ${detail}`);
  lines.push(``, `Hẹn gặp em hôm đó 🥰`);
  return lines.join("\n");
}

async function fallbackCopy(text: string): Promise<boolean> {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  return fallbackCopy(text);
}
