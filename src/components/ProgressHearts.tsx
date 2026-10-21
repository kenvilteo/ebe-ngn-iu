import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useRef, useState } from "react";
import { CONFIG } from "../config";

export default function ProgressHearts({
  activeSteps,
  stepIndex,
}: {
  activeSteps: string[];
  stepIndex: number;
}) {
  const [taps, setTaps] = useState<number[]>([]);
  const [showSecret, setShowSecret] = useState(false);
  const shownRef = useRef(false);

  const progressSteps = activeSteps.filter((s) => s !== "invite");
  const currentProgress = Math.max(stepIndex - 1, 0);

  const handleTap = () => {
    if (!CONFIG.enableEasterEgg || shownRef.current) return;
    const now = Date.now();
    const recent = [...taps, now].filter((t) => now - t < 2500).slice(-5);
    setTaps(recent);
    if (recent.length >= 5) {
      shownRef.current = true;
      setShowSecret(true);
    }
  };

  return (
    <div className="pt-7">
      <button
        type="button"
        onClick={handleTap}
        aria-label="Tiến độ chọn buổi hẹn. Bấm nhanh năm lần để xem điều bí mật."
        className="mx-auto flex min-h-[44px] items-center gap-2 rounded-full px-4"
      >
        {progressSteps.map((s, i) => {
          const done = i < currentProgress;
          const current = i === currentProgress;
          return (
            <span key={s} className="flex items-center gap-2">
              <motion.span
                initial={false}
                animate={
                  current
                    ? { scale: [1, 1.22, 1] }
                    : { scale: 1 }
                }
                transition={current ? { duration: 1.4, repeat: Infinity } : { duration: 0.2 }}
              >
                <Heart
                  size={current ? 21 : 18}
                  className={
                    done
                      ? "fill-raspberry text-raspberry"
                      : current
                        ? "fill-blush text-blush"
                        : "text-[#D9CBD3]"
                  }
                  strokeWidth={2}
                />
              </motion.span>
              {i < progressSteps.length - 1 && (
                <span className={`h-px w-4 sm:w-6 ${i < currentProgress ? "bg-raspberry" : "bg-[#E8D9E0]"}`} />
              )}
            </span>
          );
        })}
      </button>

      <AnimatePresence>
        {showSecret && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-3 max-w-[380px] rounded-2xl border border-raspberry-soft bg-white px-5 py-4 text-center shadow-card"
            role="status"
          >
            <p className="font-display text-lg italic text-raspberry">
              {CONFIG.invitation.secretMessage}
            </p>
            <p className="mt-1 text-sm text-muted">{CONFIG.invitation.secretSubMessage}</p>
            <button
              type="button"
              onClick={() => setShowSecret(false)}
              className="mt-2 min-h-[36px] rounded-full px-4 text-sm font-semibold text-raspberry hover:bg-raspberry-soft"
            >
              Suỵt 🤫
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
