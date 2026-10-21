import { FOODS } from "../config";
import type { DatePlan } from "../types";
import { formatReadableDate, formatTime } from "./dateFormat";

function foodEmoji(name: string): string {
  return FOODS.find((f) => f.name === name)?.emoji ?? "";
}

export function buildCopiedPlan(plan: DatePlan): string {
  const name = plan.recipientName?.trim() || "you";
  const date = plan.date ? formatReadableDate(plan.date) : "someday";
  const time = plan.time ? formatTime(plan.time) : "some time";
  const foods =
    plan.foods.length > 0
      ? plan.foods.map((f) => `${f} ${foodEmoji(f)}`.trim()).join(", ")
      : "something delicious";
  const vibe = plan.vibe ? plan.vibe : "perfect";
  return `It's a date! 💖\n\n${date} at ${time}\nFor: ${name}\nVibe: ${vibe}\nFood: ${foods}\n\nSee you then 🥰`;
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
