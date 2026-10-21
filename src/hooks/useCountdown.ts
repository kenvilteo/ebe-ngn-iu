import { useEffect, useState } from "react";
import { combineDateTimeLocal } from "../utils/dateFormat";

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function compute(dateStr: string, timeStr: string): Countdown {
  const target = combineDateTimeLocal(dateStr, timeStr);
  if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false };
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isPast: false,
  };
}

export function useCountdown(dateStr: string, timeStr: string): Countdown {
  const [value, setValue] = useState<Countdown>(() => compute(dateStr, timeStr));

  useEffect(() => {
    setValue(compute(dateStr, timeStr));
    const timer = window.setInterval(() => {
      setValue(compute(dateStr, timeStr));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [dateStr, timeStr]);

  return value;
}
