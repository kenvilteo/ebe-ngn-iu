import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { COMPATIBILITY_RESULTS, THIS_OR_THAT } from "../../config";
import { useDatePlanner } from "../../hooks/useDatePlanner";

export default function ThisOrThatStep() {
  const { plan, updatePlan, next, back } = useDatePlanner();
  const [index, setIndex] = useState(() => {
    if (!plan.answers.drink) return 0;
    if (!plan.answers.timeOfDay) return 1;
    if (!plan.answers.activity) return 2;
    return 3;
  });
  const [burst, setBurst] = useState<{ key: number; opt: string } | null>(null);

  const done = index >= THIS_OR_THAT.length;

  const result = useMemo(() => {
    if (!done) return null;
    if (plan.compatibilityResult) return plan.compatibilityResult;
    const pick = COMPATIBILITY_RESULTS[Math.floor(Math.random() * COMPATIBILITY_RESULTS.length)];
    return pick;
  }, [done, plan.compatibilityResult]);

  const choose = (value: string) => {
    const q = THIS_OR_THAT[index];
    if (!q) return;
    const answers = { ...plan.answers, [q.key]: value };
    let compatibilityResult = plan.compatibilityResult;
    const isLast = index === THIS_OR_THAT.length - 1;
    if (isLast && !compatibilityResult) {
      compatibilityResult =
        COMPATIBILITY_RESULTS[Math.floor(Math.random() * COMPATIBILITY_RESULTS.length)];
    }
    updatePlan({ answers, ...(compatibilityResult ? { compatibilityResult } : {}) });
    setBurst({ key: Date.now(), opt: value });
    window.setTimeout(() => setIndex((i) => i + 1), 380);
  };

  const current = THIS_OR_THAT[index];

  return (
    <div className="flex min-h-[68dvh] flex-col items-center justify-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">
        step 05 — science
      </p>
      <h2 className="mt-2 text-center font-display text-4xl text-ink sm:text-5xl">
        Important research 🧐
      </h2>
      <p className="mt-2 text-center italic text-muted">answer quickly. no overthinking.</p>

      <div className="mt-4 flex items-center gap-2" aria-label={`Question ${Math.min(index + 1, 3)} of 3`}>
        {THIS_OR_THAT.map((q, i) => (
          <span
            key={q.key}
            className={`h-2.5 w-2.5 rounded-full ${i < index || done ? "bg-raspberry" : i === index ? "bg-blush" : "bg-[#E8D9E0]"}`}
          />
        ))}
      </div>

      <div className="mt-6 w-full">
        <AnimatePresence mode="wait">
          {!done && current ? (
            <motion.div
              key={current.key}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {[current.optionA, current.optionB].map((opt) => (
                <motion.button
                  key={opt.value}
                  type="button"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => choose(opt.value)}
                  className="relative min-h-[110px] overflow-visible rounded-2xl border-2 border-transparent bg-white p-6 text-center shadow-card hover:shadow-card-hover"
                >
                  <span className="block text-4xl" aria-hidden="true">
                    {opt.emoji}
                  </span>
                  <span className="mt-2 block text-lg font-bold text-ink">{opt.label}</span>
                  <AnimatePresence>
                    {burst && burst.opt === opt.value && (
                      <motion.span
                        key={burst.key}
                        initial={{ opacity: 1, scale: 0.4, y: 0 }}
                        animate={{ opacity: 0, scale: 1.5, y: -34 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        onAnimationComplete={() => setBurst(null)}
                        className="pointer-events-none absolute left-1/2 top-2 -ml-3 text-2xl"
                        aria-hidden="true"
                      >
                        💗
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-[#F3D9E3] bg-white p-8 text-center shadow-card"
            >
              <motion.p
                key={result}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [0.4, 1.25, 1], opacity: 1 }}
                transition={{ duration: 0.45 }}
                className="text-5xl"
                aria-hidden="true"
              >
                💘
              </motion.p>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.24em] text-blush">
                scientific analysis complete
              </p>
              <p className="mt-2 font-display text-3xl leading-snug text-ink">{result}</p>
              <p className="mt-2 text-sm italic text-muted">
                (peer review pending. reviewer is also me.)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex w-full items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (index > 0 && !done) setIndex((i) => i - 1);
            else back();
          }}
          className="min-h-[48px] rounded-full px-5 font-medium text-muted hover:text-raspberry"
        >
          ← back
        </button>
        {done && (
          <button
            type="button"
            onClick={next}
            className="min-h-[52px] rounded-full bg-raspberry px-8 font-semibold text-white shadow-soft hover:bg-raspberry-dark"
          >
            noted 📝 →
          </button>
        )}
      </div>
    </div>
  );
}
