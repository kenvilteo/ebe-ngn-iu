import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { CONFIG, MAX_NO_ATTEMPTS, NO_BUTTON_TEXTS } from "../../config";
import { useDatePlanner } from "../../hooks/useDatePlanner";

function EnvelopeArt() {
  return (
    <svg
      width="120"
      height="104"
      viewBox="0 0 120 104"
      fill="none"
      aria-hidden="true"
      className="mx-auto drop-shadow-[0_10px_20px_rgba(217,46,103,0.18)]"
    >
      <rect x="8" y="26" width="104" height="68" rx="12" fill="#fff" stroke="#F3D9E3" strokeWidth="2" />
      <path d="M12 32 L60 66 L108 32" stroke="#F17CA2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <motion.g
        initial={{ y: 0, scale: 1 }}
        animate={{ y: [0, -6, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "60px 22px" }}
      >
        <path
          d="M60 30 c-4.5-7.5-16-7-16 1.5 C44 39 60 50 60 50 c0 0 16-11 16-18.5 C76 23 64.5 22.5 60 30 Z"
          fill="#D92E67"
        />
      </motion.g>
      <circle cx="26" cy="84" r="2.5" fill="#FCE7EF" />
      <circle cx="94" cy="84" r="2.5" fill="#FCE7EF" />
    </svg>
  );
}

export default function InviteStep() {
  const { plan, updatePlan, next } = useDatePlanner();
  const [name, setName] = useState(plan.recipientName ?? CONFIG.recipientName ?? "");
  const [attempts, setAttempts] = useState(0);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [showDenied, setShowDenied] = useState(false);
  const [hardNo, setHardNo] = useState(false);
  const noBtnRef = useRef<HTMLButtonElement>(null);

  const nameError =
    name.trim().length > 0 && name.trim().length < 2
      ? "give me at least 2 letters 🥺"
      : null;

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const canDodge = CONFIG.enableNoButtonGame && attempts < MAX_NO_ATTEMPTS && !reducedMotion;

  const dodge = () => {
    if (!canDodge) return;
    const spreadX = 110;
    const spreadY = 64;
    const x = Math.round((Math.random() * 2 - 1) * spreadX);
    const y = Math.round((Math.random() * 2 - 1) * spreadY);
    setNoPos({ x, y: Math.max(y, -30) });
    setAttempts((a) => Math.min(a + 1, MAX_NO_ATTEMPTS));
  };

  const handleNoPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (window.innerWidth < 768) return;
    dodge();
  };

  const handleNoClick = (e: React.MouseEvent) => {
    if (canDodge && window.innerWidth >= 768) {
      e.preventDefault();
      dodge();
      return;
    }
    if (canDodge) {
      e.preventDefault();
      dodge();
      if (attempts + 1 < MAX_NO_ATTEMPTS) return;
    }
    setShowDenied(true);
  };

  const handleNoKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && canDodge) {
      // Keyboard users get a fair game: count the attempt but still open the dialog
      // so the prank never blocks access.
      setAttempts((a) => Math.min(a + 1, MAX_NO_ATTEMPTS));
    }
  };

  const yesScale = Math.min(1 + attempts * 0.045, 1.28);

  const accept = () => {
    const clean = name.trim().slice(0, 50);
    updatePlan({ accepted: true, recipientName: clean });
    if (CONFIG.notifyOnAccept) {
      fetch("/api/date-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "accepted" }),
      }).catch(() => {});
    }
    next();
  };

  const headingName = (plan.recipientName || name.trim() || CONFIG.recipientName || "").trim();
  const heading = headingName ? `${headingName}, will you go on a date with me?` : CONFIG.invitation.title;

  if (hardNo) {
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="max-w-[420px]">
          <p className="text-5xl">😭</p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-ink">
            Okay 😭
            <br />I had to try.
          </h1>
          <p className="mt-4 text-muted">this page will self-destruct in never. it&apos;s staying right here.</p>
          <button
            type="button"
            onClick={() => {
              setHardNo(false);
              setShowDenied(false);
              setAttempts(0);
              setNoPos({ x: 0, y: 0 });
            }}
            className="mt-8 min-h-[48px] rounded-full bg-raspberry px-7 font-semibold text-white shadow-soft transition hover:bg-raspberry-dark"
          >
            changed my mind 💗
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[72dvh] flex-col items-center justify-center text-center">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[480px]">
        <EnvelopeArt />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-blush">
          a tiny question
        </p>
        <h1 className="mt-2 font-display text-[2.6rem] leading-[1.08] text-ink sm:text-5xl">
          {heading}
        </h1>

        <div className="mx-auto mt-6 max-w-[320px]">
          <label htmlFor="recipient-name" className="text-sm font-medium text-muted">
            your name <span className="opacity-70">(so the ticket says who it&apos;s for)</span>
          </label>
          <input
            id="recipient-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 50))}
            placeholder="e.g. Emma"
            autoComplete="given-name"
            className="mt-2 min-h-[52px] w-full rounded-2xl border border-[#EBD9E1] bg-white px-5 text-center text-lg text-ink placeholder:text-[#C9B6BF] focus:border-raspberry focus:outline-none"
          />
          {nameError && (
            <p className="mt-1 text-sm text-raspberry" role="alert">
              {nameError}
            </p>
          )}
        </div>

        <div className="relative mx-auto mt-7 flex min-h-[150px] w-full max-w-[340px] flex-col items-center">
          <motion.button
            type="button"
            onClick={accept}
            disabled={!!nameError}
            animate={{ scale: yesScale }}
            whileHover={{ scale: Math.min(yesScale + 0.05, 1.34) }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className="min-h-[60px] rounded-full bg-raspberry px-12 text-xl font-bold text-white shadow-soft transition-colors hover:bg-raspberry-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            Yes 💖
          </motion.button>

          <motion.button
            ref={noBtnRef}
            type="button"
            onClick={handleNoClick}
            onKeyDown={handleNoKeyDown}
            onPointerEnter={handleNoPointerEnter}
            onFocus={() => {}}
            animate={reducedMotion ? undefined : { x: noPos.x, y: noPos.y }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="mt-4 min-h-[44px] min-w-[120px] rounded-full border border-[#E5CBD6] bg-white/80 px-6 text-[15px] font-medium text-muted transition-colors hover:border-blush hover:text-raspberry"
            aria-label={attempts > 0 ? `No. Attempt ${attempts + 1}. This button is being playful.` : "No"}
          >
            {NO_BUTTON_TEXTS[Math.min(attempts, NO_BUTTON_TEXTS.length - 1)]}
          </motion.button>
        </div>

        <p className="mt-2 text-xs text-[#B9A6B0]">choose wisely. one of these is correct.</p>
      </motion.div>

      <AnimatePresence>
        {showDenied && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="denied-title"
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-[400px] rounded-3xl bg-white p-7 text-center shadow-card-hover"
            >
              <p className="text-4xl">😔</p>
              <h2 id="denied-title" className="mt-3 font-display text-3xl text-ink">
                Request denied 😔
              </h2>
              <p className="mt-3 leading-relaxed text-muted">
                Your application to cancel this date has been rejected. Please reconsider within 3–5
                business seconds.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDenied(false);
                    setAttempts(0);
                    setNoPos({ x: 0, y: 0 });
                  }}
                  className="min-h-[52px] rounded-full bg-raspberry font-semibold text-white shadow-soft hover:bg-raspberry-dark"
                >
                  Okay fine 💗
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDenied(false);
                    setHardNo(true);
                  }}
                  className="min-h-[48px] rounded-full border border-[#E5CBD6] font-medium text-muted hover:text-raspberry"
                >
                  I still mean no
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
