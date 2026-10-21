import { useEffect, useState } from "react";

/**
 * Một chiếc đồng hồ duy nhất cho cả trang, tick mỗi `intervalMs`.
 *
 * Có thêm listener `visibilitychange`: Safari và Chrome trên mobile bóp nghẹt
 * hoặc treo timer ở tab nền. Không có nó thì đúng lúc cô ấy quay lại tab — tức
 * là đúng lúc cô ấy nhìn vào — con số sẽ đứng yên ở giá trị cũ.
 */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const timer = window.setInterval(tick, intervalMs);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [intervalMs]);

  return now;
}
