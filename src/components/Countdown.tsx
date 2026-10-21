import { useCountdown } from "../hooks/useCountdown";
import Unit from "./TimeUnit";

export default function Countdown({ date, time }: { date: string; time: string }) {
  const { days, hours, minutes, seconds, isPast } = useCountdown(date, time);

  if (isPast) {
    return (
      <div className="rounded-2xl bg-raspberry-soft px-6 py-5 text-center">
        <p className="font-display text-2xl text-raspberry">date night happened 💖</p>
        <p className="mt-1 text-sm text-muted">hope it was perfect. make another one?</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-center font-display text-xl italic text-ink">until our date 💗</p>
      <div className="flex items-stretch justify-center gap-2 sm:gap-3" role="timer" aria-live="off">
        <Unit value={days} label="days" />
        <Unit value={hours} label="hours" />
        <Unit value={minutes} label="min" />
        <Unit value={seconds} label="sec" />
      </div>
    </div>
  );
}
