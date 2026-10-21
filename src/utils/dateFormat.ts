const WEEKDAYS = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
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

/** "2026-10-25" → "Thứ Bảy, 25 tháng 10, 2026" */
export function formatReadableDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  if (!date) return dateStr;
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
}

/** "2026-10-25" → "Thứ Bảy, 25/10" */
export function formatShortDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  if (!date) return dateStr;
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}`;
}

/** Giữ nguyên định dạng 24 giờ — người Việt đọc "19:00" tự nhiên hơn "7:00 PM". */
export function formatTime(timeStr: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(timeStr);
  if (!match) return timeStr;
  return `${match[1]}:${match[2]}`;
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
  if (!date) return "HEN-000000";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(2);
  return `HEN-${dd}${mm}${yy}`;
}

export function timeNote(timeStr: string): string {
  switch (timeStr) {
    case "17:00":
      return "ăn sớm xong còn kịp đi dạo một vòng.";
    case "18:00":
      return "giờ này là chuẩn nhất, em chọn đúng rồi.";
    case "19:00":
      return "bữa tối chính thức. anh đói sẵn rồi.";
    case "20:00":
      return "hơi muộn một chút nhưng anh đợi được.";
    case "21:00":
      return "ăn khuya cũng là ăn 🌙";
    default:
      return "chốt rồi nhé, không đổi nữa đâu.";
  }
}
