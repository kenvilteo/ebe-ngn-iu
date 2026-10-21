import { addDays, addYears, differenceInCalendarDays, startOfDay } from "date-fns";
import { ANNIVERSARY } from "../config";
import type { MilestoneOccurrence, MilestoneSource } from "../types";
import { parseLocalDate, toLocalISO } from "./dateFormat";

/**
 * Quy ước ngày tháng cho trang /love — chỉ định nghĩa ở đúng một chỗ:
 *
 *   days = differenceInCalendarDays(hôm nay, startDate)
 *
 * nên ngày bắt đầu là 0, và mốc "100 ngày" là addDays(startDate, 100) — tức là
 * đúng hôm con số trên trang đọc ra 100. Không có +1 ở đâu cả.
 *
 * Đây cũng là lý do không dùng `(now - start) / 86400000`: một "ngày" giữa hai
 * nửa đêm địa phương có thể dài 23 hoặc 25 tiếng khi đổi giờ mùa hè.
 */

export interface Elapsed {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** false khi startDate sai định dạng, hoặc đang ở tương lai. */
  isValid: boolean;
}

const INVALID: Elapsed = { days: 0, hours: 0, minutes: 0, seconds: 0, isValid: false };

export function elapsedSince(startDate: string, now: Date): Elapsed {
  const start = parseLocalDate(startDate);
  if (!start) return INVALID;

  const days = differenceInCalendarDays(startOfDay(now), start);
  if (days < 0) return INVALID;

  // Phần dư tính từ nửa đêm địa phương gần nhất, không chia mili-giây.
  const dayStart = addDays(start, days);
  const remainder = now.getTime() - dayStart.getTime();

  return {
    days,
    hours: Math.floor(remainder / 3_600_000),
    minutes: Math.floor((remainder % 3_600_000) / 60_000),
    seconds: Math.floor((remainder % 60_000) / 1000),
    isValid: true,
  };
}

interface Candidate {
  id: string;
  date: Date;
  emoji: string;
  title: string;
  description?: string;
  source: MilestoneSource;
  /** Nhỏ hơn = thắng khi trùng ngày. */
  priority: number;
}

/**
 * Gộp ba nguồn cột mốc: cột mốc tự nhập trong config, kỷ niệm năm, và mốc tròn
 * ngày. Ngày sai định dạng bị bỏ qua im lặng thay vì làm sập trang.
 */
export function buildOccurrences(now: Date): MilestoneOccurrence[] {
  const start = parseLocalDate(ANNIVERSARY.startDate);
  if (!start) return [];

  const today = startOfDay(now);
  const candidates: Candidate[] = [];

  for (const milestone of ANNIVERSARY.milestones) {
    const date = parseLocalDate(milestone.date);
    if (!date) continue;
    candidates.push({
      id: milestone.id,
      date,
      emoji: milestone.emoji,
      title: milestone.title,
      description: milestone.description,
      source: "config",
      priority: 0,
    });
  }

  for (let year = 1; year <= ANNIVERSARY.yearAnniversaryCount; year += 1) {
    candidates.push({
      id: `year-${year}`,
      date: addYears(start, year),
      emoji: "🥂",
      title: `${year} năm`,
      source: "year",
      priority: 1,
    });
  }

  for (const total of ANNIVERSARY.roundDayMilestones) {
    candidates.push({
      id: `day-${total}`,
      date: addDays(start, total),
      emoji: "✨",
      title: `${total} ngày`,
      source: "day",
      priority: 2,
    });
  }

  candidates.sort((a, b) =>
    a.date.getTime() === b.date.getTime() ? a.priority - b.priority : a.date.getTime() - b.date.getTime()
  );

  const seenDates = new Set<string>();
  const occurrences: MilestoneOccurrence[] = [];

  for (const candidate of candidates) {
    const iso = toLocalISO(candidate.date);
    if (seenDates.has(iso)) continue;
    seenDates.add(iso);

    const daysUntil = differenceInCalendarDays(candidate.date, today);
    occurrences.push({
      id: candidate.id,
      date: iso,
      emoji: candidate.emoji,
      title: candidate.title,
      description: candidate.description,
      source: candidate.source,
      daysUntil,
      isPast: daysUntil < 0,
      isToday: daysUntil === 0,
    });
  }

  return occurrences;
}

/** Cột mốc gần nhất chưa qua. Dùng `>= 0` để đúng ngày kỷ niệm vẫn hiện ăn mừng. */
export function nextOccurrence(occurrences: MilestoneOccurrence[]): MilestoneOccurrence | null {
  return occurrences.find((occurrence) => occurrence.daysUntil >= 0) ?? null;
}

/** Cột mốc ngay trước `next` — dùng để vẽ thanh tiến độ của chặng hiện tại. */
export function previousOccurrence(
  occurrences: MilestoneOccurrence[],
  next: MilestoneOccurrence
): MilestoneOccurrence | null {
  const index = occurrences.indexOf(next);
  return index > 0 ? occurrences[index - 1] : null;
}

/** Đã qua + hôm nay + vài mốc tương lai, để timeline không dài ngoằng 10 năm. */
export function buildTimeline(
  occurrences: MilestoneOccurrence[],
  futureLimit: number
): MilestoneOccurrence[] {
  const past = occurrences.filter((occurrence) => occurrence.daysUntil < 0);
  const upcoming = occurrences.filter((occurrence) => occurrence.daysUntil >= 0).slice(0, futureLimit);
  return [...past, ...upcoming];
}

/** "2026-09-14" -> "14.09.2026". Trang này tiếng Việt nên không dùng formatReadableDate. */
export function formatVnDate(iso: string): string {
  const date = parseLocalDate(iso);
  if (!date) return iso;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
}

export function relativeDayLabel(daysUntil: number): string {
  if (daysUntil === 0) return "Hôm nay";
  if (daysUntil === 1) return "Ngày mai";
  if (daysUntil === -1) return "Hôm qua";
  if (daysUntil > 1) return `Còn ${daysUntil} ngày`;

  const ago = -daysUntil;
  if (ago < 14) return `${ago} ngày trước`;
  if (ago < 60) return `${Math.round(ago / 7)} tuần trước`;
  if (ago < 365) return `${Math.round(ago / 30)} tháng trước`;

  const years = Math.floor(ago / 365);
  return years <= 1 ? "1 năm trước" : `${years} năm trước`;
}
