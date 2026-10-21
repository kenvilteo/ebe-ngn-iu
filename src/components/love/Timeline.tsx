import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ANNIVERSARY } from "../../config";
import type { MilestoneOccurrence } from "../../types";
import { formatVnDate, relativeDayLabel } from "../../utils/anniversary";

function nodeClass(occurrence: MilestoneOccurrence): string {
  if (occurrence.isToday) return "border-raspberry bg-raspberry text-white shadow-soft";
  if (occurrence.isPast) return "border-raspberry/30 bg-white";
  return "border-dashed border-[#E7DCE2] bg-white opacity-70";
}

function Timeline({ items }: { items: MilestoneOccurrence[] }) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <section className="mt-12">
      <h2 className="text-center font-display text-2xl text-ink">{ANNIVERSARY.copy.timelineTitle}</h2>

      {items.length === 0 ? (
        <p className="mt-4 text-center text-sm text-muted">{ANNIVERSARY.copy.timelineEmpty}</p>
      ) : (
        <ol className="relative mt-7 space-y-5">
          <span
            aria-hidden="true"
            className="absolute bottom-4 left-[19px] top-4 w-px bg-gradient-to-b from-raspberry/40 via-raspberry/20 to-transparent"
          />

          {items.map((occurrence, index) => {
            const authored = occurrence.source === "config";
            return (
              <motion.li
                key={occurrence.id}
                className="relative flex gap-4"
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2), ease: "easeOut" }}
              >
                <span
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg ${nodeClass(occurrence)}`}
                  aria-hidden="true"
                >
                  {occurrence.emoji}
                </span>

                <div
                  className={`flex-1 rounded-2xl px-4 py-3 ${
                    authored ? "bg-white shadow-card" : "bg-white/60"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p
                      className={
                        authored
                          ? "font-display text-lg text-ink"
                          : "text-sm font-semibold uppercase tracking-wide text-muted"
                      }
                    >
                      {occurrence.title}
                    </p>
                    <p className="text-xs text-muted">{formatVnDate(occurrence.date)}</p>
                  </div>

                  {occurrence.description && (
                    <p className="mt-1 text-sm leading-relaxed text-ink/70">
                      {occurrence.description}
                    </p>
                  )}

                  <p
                    className={`mt-1.5 text-xs ${
                      occurrence.isToday ? "font-semibold text-raspberry" : "text-[#B9A7B0]"
                    }`}
                  >
                    {relativeDayLabel(occurrence.daysUntil)}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

// items đổi một lần mỗi ngày, không phải mỗi giây — chặn re-render theo nhịp tick.
export default memo(Timeline);
