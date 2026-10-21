import { motion } from "framer-motion";
import { ACTIVITIES } from "../../config";
import { useDatePlanner } from "../../hooks/useDatePlanner";

export default function ActivityStep() {
  const { plan, updatePlan, next, back } = useDatePlanner();
  const selected = plan.activity;

  return (
    <div className="flex min-h-[68dvh] flex-col items-center justify-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">Bước 2 — Mình đi đâu</p>
      <h2 className="mt-2 text-center font-display text-4xl text-ink sm:text-5xl">Em muốn đi đâu?</h2>
      <p className="mt-2 text-center italic text-muted">Chọn một cái thôi, còn lại để anh lo 😌</p>

      <div
        className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
        role="radiogroup"
        aria-label="Chọn hoạt động cho buổi hẹn"
      >
        {ACTIVITIES.map((activity, i) => {
          const active = selected === activity.key;
          return (
            <motion.button
              key={activity.key}
              type="button"
              role="radio"
              aria-checked={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => updatePlan({ activity: activity.key, activityDetail: "" })}
              className={`flex min-h-[96px] items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition ${
                active
                  ? "border-raspberry bg-raspberry-soft/40 shadow-soft"
                  : "border-[#F1E4EA] bg-white hover:border-blush hover:shadow-card"
              }`}
            >
              <span className="text-3xl" aria-hidden="true">
                {activity.emoji}
              </span>
              <span className="min-w-0">
                <span className="block text-[17px] font-bold text-ink">{activity.title}</span>
                <span className="mt-0.5 block text-sm text-muted">{activity.description}</span>
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 flex w-full items-center justify-between">
        <button
          type="button"
          onClick={back}
          className="min-h-[48px] rounded-full px-5 font-medium text-muted hover:text-raspberry"
        >
          ← Quay lại
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!selected}
          className="min-h-[52px] rounded-full bg-raspberry px-8 font-semibold text-white shadow-soft hover:bg-raspberry-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          Tiếp →
        </button>
      </div>
    </div>
  );
}
