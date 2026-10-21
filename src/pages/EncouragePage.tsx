import { useCallback, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import EncouragementCard from "../components/encourage/EncouragementCard";
import { ANNIVERSARY, ENCOURAGEMENT } from "../config";
import { useVisitNotify } from "../hooks/useVisitNotify";
import { RouteLink } from "../router";
import { elapsedSince } from "../utils/anniversary";

const CONFETTI_COLORS = ["#D92E67", "#F17CA2", "#FCE7EF", "#FFD6E4"];

/**
 * Bốc một index khác `avoid`.
 *
 * Lấy đều trên `total - 1` phần tử rồi ánh xạ vòng qua `avoid`, thay vì bốc bừa
 * rồi bốc lại khi trúng — cách kia sẽ lặp vô hạn nếu mảng chỉ có 1 câu.
 */
function pickOther(total: number, avoid: number): number {
  if (total <= 1) return 0;
  const offset = Math.floor(Math.random() * (total - 1));
  return offset >= avoid ? offset + 1 : offset;
}

export default function EncouragePage() {
  const { messages, copy } = ENCOURAGEMENT;
  const reducedMotion = useReducedMotion() ?? false;

  const [index, setIndex] = useState(() =>
    messages.length ? Math.floor(Math.random() * messages.length) : -1
  );

  // Chỉ để tin Telegram có thêm ngữ cảnh — trang này không tự hiện số ngày.
  const days = useMemo(() => {
    const elapsed = elapsedSince(ANNIVERSARY.startDate, new Date());
    return elapsed.isValid ? elapsed.days : undefined;
  }, []);

  useVisitNotify(days, ENCOURAGEMENT.enableVisitNotify, "encourage");

  const draw = useCallback(() => {
    if (messages.length === 0) return;
    setIndex((current) => pickOther(messages.length, current));
    if (!reducedMotion) {
      confetti({
        particleCount: 18,
        spread: 55,
        startVelocity: 24,
        scalar: 0.8,
        origin: { y: 0.65 },
        colors: CONFETTI_COLORS,
      });
    }
  }, [messages.length, reducedMotion]);

  const current = messages[index];

  return (
    <>
      <main className="mx-auto w-full max-w-[620px] flex-1 px-5 pb-10 pt-16 sm:px-8">
        <header className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink">{copy.title}</h1>
          <p className="mt-2 font-display text-lg italic text-ink/70">{copy.subtitle}</p>
        </header>

        {/* min-h giữ chỗ để đổi câu không làm cả trang nhảy lên nhảy xuống. */}
        <div className="mt-8 min-h-[248px]">
          {current ? (
            <AnimatePresence mode="wait">
              <EncouragementCard key={index} message={current} />
            </AnimatePresence>
          ) : (
            <p className="text-center text-sm text-muted">{copy.empty}</p>
          )}
        </div>

        {messages.length > 0 && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={draw}
              className="inline-flex items-center gap-2 rounded-full bg-raspberry px-7 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-raspberry-dark active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {copy.buttonLabel}
            </button>
          </div>
        )}

        <p className="mt-12 text-center font-display text-base italic text-muted">
          {copy.closingMessage}
        </p>
      </main>

      <footer className="pb-6 text-center text-xs text-[#C2ADB7]">
        <RouteLink
          to="/love"
          className="underline decoration-dotted underline-offset-2 transition hover:text-raspberry"
        >
          Chuyện của hai đứa mình 💗
        </RouteLink>
      </footer>
    </>
  );
}
