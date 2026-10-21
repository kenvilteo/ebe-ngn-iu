export function getOrdinal(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function parseLocalDate(dateStr: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (
    date.getFullYear() !== Number(y) ||
    date.getMonth() !== Number(m) - 1 ||
    date.getDate() !== Number(d)
  ) {
    return null;
  }
  return date;
}

export function formatReadableDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  if (!date) return dateStr;
  const weekday = WEEKDAYS[date.getDay()];
  const month = MONTHS[date.getMonth()];
  return `${weekday}, ${month} ${getOrdinal(date.getDate())}, ${date.getFullYear()}`;
}

export function formatShortDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  if (!date) return dateStr;
  const weekday = WEEKDAYS[date.getDay()];
  const month = MONTHS[date.getMonth()];
  return `${weekday}, ${month} ${getOrdinal(date.getDate())}`;
}

export function formatTime(timeStr: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(timeStr);
  if (!match) return timeStr;
  let hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${suffix}`;
}

/**
 * Định dạng một Date thành "YYYY-MM-DD" theo giờ ĐỊA PHƯƠNG.
 * Không dùng toISOString() — hàm đó trả về UTC và sẽ lệch ngày ở GMT+7.
 */
export function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayLocalISO(): string {
  return toLocalISO(new Date());
}

export function combineDateTimeLocal(dateStr: string, timeStr: string): Date | null {
  const date = parseLocalDate(dateStr);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeStr);
  if (!date || !timeMatch) return null;
  date.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);
  return date;
}

export function generateTicketNumber(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  if (!date) return "DATE-000000";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(2);
  return `DATE-${dd}${mm}${yy}`;
}

export function timeNote(timeStr: string): string {
  switch (timeStr) {
    case "17:00":
      return "early dinner energy. respectable behavior detected.";
    case "18:00":
      return "6:00 PM, got it. elite choice.";
    case "19:00":
      return "prime dinner territory. excellent decision.";
    case "20:00":
      return "fashionably late dinner. i respect it.";
    case "21:00":
      return "night mode activated 🌙";
    default:
      return "locked in. no take-backs.";
  }
}
