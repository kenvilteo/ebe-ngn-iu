import { motion } from "framer-motion";
import { findActivity } from "../../config";
import { useDatePlanner } from "../../hooks/useDatePlanner";

const MAX_DETAIL = 60;

export default function ActivityDetailStep() {
  const { plan, updatePlan, next, back } = useDatePlanner();
  const activity = findActivity(plan.activity);
  const value = plan.activityDetail ?? "";
  const ready = value.trim().length > 0;

  // Bước này chỉ được mở khi hoạt động đã chọn cần hỏi thêm; nếu state cũ
  // không còn khớp thì provider đã tự đưa về bước hoạt động.
  if (!activity) {
    return (
      <div className="flex min-h-[68dvh] flex-col items-center justify-center text-center">
        <p className="text-4xl">🤔</p>
        <p className="mt-3 text-muted">chưa chọn hoạt động. quay lại chọn một cái nhé.</p>
        <button
          type="button"
          onClick={back}
          className="mt-5 min-h-[48px] rounded-full bg-raspberry px-6 font-semibold text-white"
        >
          ← quay lại
        </button>
      </div>
    );
  }

  const submit = () => {
    if (ready) next();
  };

  return (
    <div className="flex min-h-[68dvh] flex-col items-center justify-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">
        bước 3 — nói anh nghe
      </p>
      <h2 className="mt-2 text-center font-display text-4xl text-ink sm:text-5xl">
        {activity.detailLabel}
      </h2>
      <p className="mt-2 text-center italic text-muted">
        ghi gì cũng được, anh chuẩn bị trước 😌
      </p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 w-full rounded-3xl border border-[#F3E6EC] bg-white p-5 shadow-card sm:p-7"
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl" aria-hidden="true">
            {activity.emoji}
          </span>
          <span className="font-display text-2xl italic text-ink">{activity.title}</span>
        </div>

        <label htmlFor="activity-detail" className="mt-5 block text-sm font-medium text-muted">
          {activity.detailLabel}
        </label>
        <input
          id="activity-detail"
          type="text"
          value={value}
          onChange={(e) => updatePlan({ activityDetail: e.target.value.slice(0, MAX_DETAIL) })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={activity.detailPlaceholder}
          maxLength={MAX_DETAIL}
          autoFocus
          className="mt-2 min-h-[56px] w-full rounded-2xl border border-[#EBD9E1] bg-cream px-5 text-lg text-ink placeholder:text-[#C9B6BF] focus:border-raspberry focus:outline-none"
        />
        <p className="mt-2 text-right text-xs text-[#B9A6B0]">
          {value.length}/{MAX_DETAIL}
        </p>
      </motion.div>

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
          onClick={submit}
          disabled={!ready}
          className="min-h-[52px] rounded-full bg-raspberry px-8 font-semibold text-white shadow-soft hover:bg-raspberry-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          tiếp →
        </button>
      </div>
    </div>
  );
}
