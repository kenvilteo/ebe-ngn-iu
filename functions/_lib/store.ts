/**
 * Bộ nhớ tạm trong Worker cho rate limit và chống trùng.
 *
 * Mỗi isolate của Cloudflare có bản sao riêng và mất khi isolate bị thu hồi, nên
 * đây chỉ là lớp chặn thứ hai. Lớp thứ nhất nằm ở client: localStorage giới hạn
 * "mỗi ngày một tin" cho từng thiết bị, nên kể cả khi bộ nhớ này reset thì cô ấy
 * cũng không bị spam.
 */

const RATE_WINDOW_MS = 10 * 60 * 1000;
const SEEN_TTL_MS = RATE_WINDOW_MS;
const DAILY_TTL_MS = 36 * 60 * 60 * 1000;
const MAX_ENTRIES = 5000;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Map<string, Bucket>>();

function bucket(name: string): Map<string, Bucket> {
  let found = buckets.get(name);
  if (!found) {
    found = new Map();
    buckets.set(name, found);
  }
  return found;
}

/** true nghĩa là đã vượt hạn mức. Lần gọi đầu tiên luôn được cho qua. */
export function hitRateLimit(name: string, key: string, max: number): boolean {
  const now = Date.now();
  const entries = bucket(name);

  if (entries.size > MAX_ENTRIES) {
    for (const [k, entry] of entries) {
      if (entry.resetAt <= now) entries.delete(k);
    }
    if (entries.size > MAX_ENTRIES) entries.clear();
  }

  const entry = entries.get(key);
  if (!entry || entry.resetAt <= now) {
    entries.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > max;
}

const seenIds = new Map<string, number>();

/** Trả về true nếu id này vừa được xử lý — đồng thời ghi nhận nó. */
export function isDuplicateId(id: string): boolean {
  const now = Date.now();

  if (seenIds.size > MAX_ENTRIES) {
    for (const [key, ts] of seenIds) {
      if (now - ts > SEEN_TTL_MS) seenIds.delete(key);
    }
    if (seenIds.size > MAX_ENTRIES) seenIds.clear();
  }

  if (seenIds.has(id)) return true;
  seenIds.set(id, now);
  return false;
}

const dailySeen = new Map<string, { day: string; ts: number }>();

/**
 * Ngày theo giờ Việt Nam, không phải UTC.
 *
 * Worker chạy ở UTC; nếu dùng UTC thì "một tin mỗi ngày" sẽ reset lúc 7 giờ sáng
 * giờ Việt Nam, đúng lúc cô ấy có thể mở lại trang.
 */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
}

export function seenToday(key: string): boolean {
  return dailySeen.get(key)?.day === todayISO();
}

/**
 * Ghi nhận riêng, gọi SAU khi gửi Telegram thành công — nếu gộp vào lúc kiểm tra
 * thì một lần gửi lỗi sẽ đốt mất suất của cả ngày hôm đó.
 */
export function markSeenToday(key: string): void {
  const now = Date.now();

  if (dailySeen.size > MAX_ENTRIES) {
    for (const [k, entry] of dailySeen) {
      if (now - entry.ts > DAILY_TTL_MS) dailySeen.delete(k);
    }
    if (dailySeen.size > MAX_ENTRIES) dailySeen.clear();
  }

  dailySeen.set(key, { day: todayISO(), ts: now });
}
