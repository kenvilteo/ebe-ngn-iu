import { useEffect, useRef } from "react";
import { postLoveVisit } from "../api/love";
import { ENCOURAGE_STORAGE_KEYS, LOVE_STORAGE_KEYS } from "../config";
import type { VisitPage } from "../types";
import { todayLocalISO } from "../utils/dateFormat";
import { randomId } from "../utils/randomId";

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // chế độ riêng tư / storage bị chặn
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // bỏ qua — cùng lắm là gửi thông báo thừa, rate limit ở server đỡ hộ
  }
}

/** UUID cố định của thiết bị này. Server dùng nó để chặn gửi trùng trong ngày. */
function deviceId(): string {
  const existing = readStorage(LOVE_STORAGE_KEYS.deviceId);
  if (existing) return existing;
  const created = randomId();
  writeStorage(LOVE_STORAGE_KEYS.deviceId, created);
  return created;
}

/**
 * Báo Telegram đúng một lần mỗi ngày cho mỗi thiết bị.
 *
 * Cờ được ghi ĐỒNG BỘ, TRƯỚC khi gọi fetch. React 18 StrictMode gọi effect hai
 * lần ở dev (mount → unmount → mount); nếu ghi cờ trong `.then()` thì cả hai
 * lượt đều đọc giá trị cũ và sẽ bắn hai tin Telegram.
 */
export function useVisitNotify(
  days: number | undefined,
  enabled: boolean,
  page: VisitPage = "love"
): void {
  const fired = useRef(false);

  useEffect(() => {
    if (!enabled || fired.current) return;
    fired.current = true;

    // Mỗi trang một cờ riêng: mở /love rồi mở /meomeo1 trong cùng ngày thì được
    // hai tin, còn mở lại đúng một trang thì không gửi thêm.
    const storageKey =
      page === "encourage" ? ENCOURAGE_STORAGE_KEYS.lastVisit : LOVE_STORAGE_KEYS.lastVisit;

    const today = todayLocalISO();
    if (readStorage(storageKey) === today) return;

    writeStorage(storageKey, today);
    void postLoveVisit(deviceId(), days, page);
  }, [days, enabled, page]);
}
