import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ANNIVERSARY } from "../../config";
import type { Elapsed } from "../../utils/anniversary";
import { formatVnDate } from "../../utils/anniversary";
import TimeUnit from "../TimeUnit";

/**
 * Đếm tăng dần khi mới vào trang. Chỉ chạy một lần duy nhất — nếu không, đúng
 * lúc qua nửa đêm con số sẽ nhảy về 0 rồi đếm lại, trông như bị lỗi.
 */
function useCountUp(target: number, animate: boolean): number {
  const [value, setValue] = useState(() => (animate ? 0 : target));
  const finished = useRef(!animate);

  useEffect(() => {
    if (finished.current) {
      setValue(target);
      return;
    }
    finished.current = true;

    const duration = 1100;
    const startedAt = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}

export default function DaysCounter({ elapsed }: { elapsed: Elapsed }) {
  const reducedMotion = useReducedMotion() ?? false;
  const days = useCountUp(elapsed.days, !reducedMotion);
  const { copy } = ANNIVERSARY;

  if (!elapsed.isValid) {
    return (
      <section className="text-center">
        <p className="text-5xl" aria-hidden="true">
          🙈
        </p>
        <p className="mx-auto mt-4 max-w-sm text-sm text-muted">{copy.heroInvalid}</p>
      </section>
    );
  }

  return (
    <section className="text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">
        {formatVnDate(ANNIVERSARY.startDate)}
      </p>

      {elapsed.days === 0 ? (
        <h1 className="mt-4 font-display text-4xl italic text-raspberry">{copy.heroDayOne}</h1>
      ) : (
        <>
          <p className="mt-2 font-display text-[84px] leading-none tabular-nums text-raspberry sm:text-[104px]">
            {days}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            {copy.heroLabel}
          </p>
        </>
      )}

      <p className="mt-5 font-display text-lg italic text-ink/75">{copy.heroSubtitle}</p>

      <div
        className="mt-7 flex items-stretch justify-center gap-2 sm:gap-3"
        role="timer"
        aria-live="off"
      >
        <TimeUnit value={elapsed.days} label="ngày" />
        <TimeUnit value={elapsed.hours} label="giờ" />
        <TimeUnit value={elapsed.minutes} label="phút" />
        <TimeUnit value={elapsed.seconds} label="giây" />
      </div>
    </section>
  );
}
