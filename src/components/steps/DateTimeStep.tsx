import { motion } from "framer-motion";
import { TIME_OPTIONS } from "../../config";
import { useDatePlanner } from "../../hooks/useDatePlanner";
import { formatReadableDate, formatTime, todayLocalISO } from "../../utils/dateFormat";

export default function DateTimeStep() {
  const { plan, updatePlan, next, back } = useDatePlanner();
  const today = todayLocalISO();
  const dateValid = !!plan.date && plan.date >= today;
  const timeValid = TIME_OPTIONS.some((t) => t.value === plan.time);
  const ready = dateValid && timeValid;

  return (
    <div className="flex min-h-[68dvh] flex-col items-center justify-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">bước 1 — ngày và giờ</p>
      <h2 className="mt-2 text-center font-display text-4xl text-ink sm:text-5xl">Em rảnh hôm nào?</h2>

      <div className="mt-8 w-full rounded-3xl border border-[#F3E6EC] bg-white p-5 shadow-card sm:p-7">
        <label htmlFor="date-pick" className="font-display text-2xl italic text-ink">
          Chọn ngày ✨
        </label>
        <input
          id="date-pick"
          type="date"
          value={plan.date}
          min={today}
          onChange={(e) => updatePlan({ date: e.target.value })}
          className="mt-3 min-h-[52px] w-full rounded-2xl border border-[#EBD9E1] bg-cream px-4 text-lg text-ink focus:border-raspberry focus:outline-none"
        />
        {plan.date && !dateValid && (
          <p className="mt-2 text-sm text-raspberry" role="alert">
            ngày đó qua rồi — chọn ngày sau đi em 🥺
          </p>
        )}

        <p className="mt-7 font-display text-2xl italic text-ink">Mấy giờ nhỉ? 🥺</p>
        <div className="mt-3 grid grid-cols-1 gap-2" role="radiogroup" aria-label="Giờ hẹn">
          {TIME_OPTIONS.map((t) => {
            const active = plan.time === t.value;
            return (
              <motion.button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={active}
                whileTap={{ scale: 0.98 }}
                onClick={() => updatePlan({ time: t.value })}
                className={`flex min-h-[60px] items-center justify-between gap-3 rounded-2xl border-2 px-5 text-left transition ${
                  active ? "border-raspberry bg-raspberry-soft/40 shadow-soft" : "border-[#F1E4EA] bg-cream hover:border-blush"
                }`}
              >
                <span>
                  <span className="block text-[17px] font-bold text-ink">{t.label}</span>
                  <span className="block text-sm italic text-muted">{t.note}</span>
                </span>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    active ? "border-raspberry bg-raspberry" : "border-[#E3CBD5]"
                  }`}
                  aria-hidden="true"
                >
                  {active && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
              </motion.button>
            );
          })}
        </div>

        {ready && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 rounded-2xl bg-raspberry-soft/60 px-4 py-3 text-center font-medium text-raspberry"
          >
            {formatReadableDate(plan.date)} lúc {formatTime(plan.time)} 💗
          </motion.p>
        )}
      </div>

      <div className="mt-6 flex w-full items-center justify-between">
        <button
          type="button"
          onClick={back}
          className="min-h-[48px] rounded-full px-5 font-medium text-muted hover:text-raspberry"
        >
          ← quay lại
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!ready}
          className="min-h-[52px] rounded-full bg-raspberry px-8 font-semibold text-white shadow-soft hover:bg-raspberry-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          tiếp →
        </button>
      </div>
    </div>
  );
}
