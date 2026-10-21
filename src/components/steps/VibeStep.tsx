import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { VIBES } from "../../config";
import { useDatePlanner } from "../../hooks/useDatePlanner";
import type { VibeKey } from "../../types";

export default function VibeStep() {
  const { plan, updatePlan, next, back } = useDatePlanner();
  const selected: VibeKey | null = plan.vibe;

  return (
    <div className="flex min-h-[68dvh] flex-col items-center justify-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">step 03 — set the mood</p>
      <h2 className="mt-2 text-center font-display text-4xl text-ink sm:text-5xl">
        What&apos;s the vibe? ✨
      </h2>
      <p className="mt-2 text-center italic text-muted">pick our personality for the night</p>

      <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Date vibe">
        {VIBES.map((v, i) => {
          const active = selected === v.key;
          return (
            <motion.button
              key={v.key}
              type="button"
              role="radio"
              aria-checked={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => updatePlan({ vibe: v.key })}
              className={`relative min-h-[88px] rounded-2xl border-2 bg-white p-4 text-left shadow-card transition-shadow hover:shadow-card-hover ${
                active ? "border-raspberry shadow-soft" : "border-transparent"
              }`}
            >
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-raspberry text-white"
                >
                  <Check size={14} strokeWidth={3} />
                </motion.span>
              )}
              <span className="text-2xl" aria-hidden="true">
                {v.emoji}
              </span>
              <span className="mt-1 block text-[15px] font-bold tracking-wide text-ink">{v.title}</span>
              <span className="mt-0.5 block text-sm italic leading-snug text-muted">{v.description}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-8 flex w-full items-center justify-between">
        <button
          type="button"
          onClick={back}
          className="min-h-[48px] rounded-full px-5 font-medium text-muted hover:text-raspberry"
        >
          ← back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!selected}
          className="min-h-[52px] rounded-full bg-raspberry px-8 font-semibold text-white shadow-soft hover:bg-raspberry-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          that&apos;s the vibe →
        </button>
      </div>
    </div>
  );
}
