import { AnimatePresence, motion } from "framer-motion";
import { Check, Dices, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { FOODS } from "../../config";
import { useDatePlanner } from "../../hooks/useDatePlanner";

const MAX_CUSTOM_LEN = 30;

export default function FoodStep() {
  const { plan, updatePlan, next, back } = useDatePlanner();
  const [rolling, setRolling] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  const customs = plan.foods.filter((f) => !FOODS.some((p) => p.name === f));

  const toggle = (name: string) => {
    if (rolling) return;
    const has = plan.foods.includes(name);
    if (has) {
      updatePlan({ foods: plan.foods.filter((f) => f !== name) });
    } else {
      if (plan.foods.length >= 5) return;
      updatePlan({ foods: [...plan.foods, name] });
    }
  };

  const addCustom = () => {
    const name = customText.trim().slice(0, MAX_CUSTOM_LEN);
    if (!name) return;
    if (name.length < 2) {
      setCustomError("give me at least 2 letters 🥺");
      return;
    }
    if (plan.foods.some((f) => f.toLowerCase() === name.toLowerCase())) {
      setCustomError("that's already on the list 😌");
      return;
    }
    if (plan.foods.length >= 5) {
      setCustomError("okay that's a feast, max 5 😌");
      return;
    }
    updatePlan({ foods: [...plan.foods, name] });
    setCustomText("");
    setCustomError(null);
  };

  const doRoulette = () => {
    if (rolling) return;
    setRolling(true);
    const names = FOODS.map((f) => f.name);
    let ticks = 0;
    const total = 14;
    const step = () => {
      const pick = names[Math.floor(Math.random() * names.length)];
      setHighlight(pick);
      ticks++;
      if (ticks < total) {
        const delay = 60 + ticks * 28;
        timers.current.push(window.setTimeout(step, delay));
      } else {
        const winner = names[Math.floor(Math.random() * names.length)];
        setHighlight(winner);
        timers.current.push(
          window.setTimeout(() => {
            updatePlan({ foods: [winner] });
            setRolling(false);
            setHighlight(null);
            setConfirmReplace(false);
          }, 420)
        );
      }
    };
    step();
  };

  const handleLucky = () => {
    if (plan.foods.length > 0 && !confirmReplace) {
      setConfirmReplace(true);
      return;
    }
    doRoulette();
  };

  return (
    <div className="flex min-h-[68dvh] flex-col items-center justify-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">
        step 06 — the important part
      </p>
      <h2 className="mt-2 text-center font-display text-4xl text-ink sm:text-5xl">
        What are we feeling? 🍽️✨
      </h2>
      <p className="mt-2 text-center italic text-muted">(you can pick more than one btw)</p>

      <div className="mt-8 grid w-full grid-cols-2 gap-3 sm:grid-cols-3" role="group" aria-label="Food choices">
        {FOODS.map((f, i) => {
          const active = plan.foods.includes(f.name);
          const lit = highlight === f.name;
          return (
            <motion.button
              key={f.name}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => toggle(f.name)}
              aria-pressed={active}
              className={`relative min-h-[110px] rounded-2xl border-2 bg-white p-4 text-center transition-shadow ${
                active
                  ? "border-blush shadow-soft"
                  : lit
                    ? "border-raspberry shadow-soft"
                    : "border-transparent shadow-card hover:shadow-card-hover"
              }`}
            >
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-raspberry text-white"
                >
                  <Check size={14} strokeWidth={3} />
                </motion.span>
              )}
              <span className="block text-4xl" aria-hidden="true">
                {f.emoji}
              </span>
              <span className="mt-1 block font-bold text-ink">{f.name}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-5 w-full rounded-2xl border border-[#EBD9E1] bg-white px-4 py-4 shadow-card">
        <label htmlFor="custom-food" className="block text-sm font-semibold text-ink">
          craving something else? <span className="font-normal italic text-muted">type it in ✨</span>
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="custom-food"
            type="text"
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value.slice(0, MAX_CUSTOM_LEN));
              setCustomError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="e.g. Bún bò Huế 🍜"
            maxLength={MAX_CUSTOM_LEN}
            disabled={rolling}
            className="min-h-[50px] flex-1 rounded-2xl border border-[#EBD9E1] bg-cream px-4 text-[16px] text-ink placeholder:text-[#C9B6BF] focus:border-raspberry focus:outline-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={rolling || !customText.trim()}
            className="inline-flex min-h-[50px] min-w-[52px] items-center justify-center rounded-2xl bg-raspberry px-4 font-semibold text-white shadow-soft hover:bg-raspberry-dark disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Add your own dish"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
        {customError && (
          <p className="mt-2 text-sm text-raspberry" role="alert">
            {customError}
          </p>
        )}
        {customs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Your custom dishes">
            {customs.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 rounded-full bg-raspberry-soft py-1.5 pl-3 pr-1.5 text-sm font-semibold text-raspberry"
              >
                ✨ {c}
                <button
                  type="button"
                  onClick={() => toggle(c)}
                  className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/70"
                  aria-label={`Remove ${c}`}
                >
                  <X size={13} strokeWidth={3} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 w-full rounded-2xl border border-dashed border-[#E3B9C9] bg-white/70 px-4 py-3 text-center">
        {!confirmReplace ? (
          <button
            type="button"
            onClick={handleLucky}
            disabled={rolling}
            className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-raspberry hover:text-raspberry-dark disabled:opacity-50"
          >
            <Dices size={18} />
            {rolling ? "picking…" : "can't decide? 🎲 pick for me"}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <p className="text-sm text-muted">replace {plan.foods.join(", ")} with a surprise pick?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={doRoulette}
                className="min-h-[44px] rounded-full bg-raspberry px-5 text-sm font-semibold text-white"
              >
                yes, surprise me
              </button>
              <button
                type="button"
                onClick={() => setConfirmReplace(false)}
                className="min-h-[44px] rounded-full border border-[#E5CBD6] px-5 text-sm font-medium text-muted"
              >
                keep mine
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {plan.foods.length >= 5 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-muted"
          >
            okay that&apos;s a feast, max 5 😌
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-6 flex w-full items-center justify-between">
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
          disabled={plan.foods.length === 0}
          className="min-h-[52px] rounded-full bg-raspberry px-8 font-semibold text-white shadow-soft hover:bg-raspberry-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          this one! →
        </button>
      </div>
    </div>
  );
}
