import { motion } from "framer-motion";
import type { MilestoneOccurrence } from "../../types";
import { parseLocalDate } from "../../utils/dateFormat";
import TimeUnit from "../TimeUnit";

interface Props {
  next: MilestoneOccurrence | null;
  previous: MilestoneOccurrence | null;
  now: Date;
}

export default function NextMilestone({ next, previous, now }: Props) {
  if (!next) {
    return (
      <section className="mt-8 rounded-3xl bg-raspberry-soft px-5 py-6 text-center shadow-soft">
        <p className="text-sm text-muted">Hết mốc để đếm rồi. Vào config thêm nữa đi 😌</p>
      </section>
    );
  }

  const target = parseLocalDate(next.date);
  const remainder = target ? Math.max(target.getTime() - now.getTime(), 0) : 0;
  const hours = Math.floor(remainder / 3_600_000);
  const minutes = Math.floor((remainder % 3_600_000) / 60_000);
  const seconds = Math.floor((remainder % 60_000) / 1000);

  const previousDate = previous ? parseLocalDate(previous.date) : null;
  const span = target && previousDate ? target.getTime() - previousDate.getTime() : 0;
  const covered = target && previousDate ? now.getTime() - previousDate.getTime() : 0;
  const percent = span > 0 ? Math.min(Math.max(covered / span, 0), 1) * 100 : 0;

  return (
    <section className="mt-8 rounded-3xl bg-raspberry-soft px-5 py-6 shadow-soft">
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-raspberry">
        Kỷ niệm sắp tới
      </p>

      {next.isToday ? (
        <p className="mt-3 text-center font-display text-3xl text-raspberry">
          {next.emoji} Hôm nay là {next.title} đấy 🎉
        </p>
      ) : (
        <>
          <p className="mt-3 text-center font-display text-2xl text-ink">
            {next.emoji} {next.title}
          </p>
          <div
            className="mt-4 flex items-stretch justify-center gap-2 sm:gap-3"
            role="timer"
            aria-live="off"
          >
            <TimeUnit value={next.daysUntil} label="ngày" />
            <TimeUnit value={hours} label="giờ" />
            <TimeUnit value={minutes} label="phút" />
            <TimeUnit value={seconds} label="giây" />
          </div>
        </>
      )}

      {previous && (
        <div className="mt-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/70">
            <motion.div
              className="h-full rounded-full bg-raspberry"
              initial={false}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-muted">
            Từ {previous.title} tới {next.title} — đi được {Math.round(percent)}% rồi
          </p>
        </div>
      )}
    </section>
  );
}
