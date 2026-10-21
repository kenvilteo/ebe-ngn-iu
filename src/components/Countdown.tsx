import { useCountdown } from "../hooks/useCountdown";
import Unit from "./TimeUnit";

export default function Countdown({ date, time }: { date: string; time: string }) {
  const { days, hours, minutes, seconds, isPast } = useCountdown(date, time);

  if (isPast) {
    return (
      <div className="rounded-2xl bg-raspberry-soft px-6 py-5 text-center">
        <p className="font-display text-2xl text-raspberry">buổi hẹn đã diễn ra 💖</p>
        <p className="mt-1 text-sm text-muted">hy vọng nó hoàn hảo. hẹn thêm buổi nữa nhé?</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-center font-display text-xl italic text-ink">còn bao lâu nữa 💗</p>
      <div className="flex items-stretch justify-center gap-2 sm:gap-3" role="timer" aria-live="off">
        <Unit value={days} label="ngày" />
        <Unit value={hours} label="giờ" />
        <Unit value={minutes} label="phút" />
        <Unit value={seconds} label="giây" />
      </div>
    </div>
  );
}
