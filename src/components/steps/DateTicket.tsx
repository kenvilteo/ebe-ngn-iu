import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Heart, Loader2, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CONFIG, FOODS, STORAGE_KEYS, VIBES } from "../../config";
import { submitDate } from "../../api/submitDate";
import { useDatePlanner } from "../../hooks/useDatePlanner";
import { buildCopiedPlan, copyText } from "../../utils/copyPlan";
import {
  formatReadableDate,
  formatTime,
  generateTicketNumber,
  timeNote,
} from "../../utils/dateFormat";
import Countdown from "../Countdown";

type SubmitState = "idle" | "sending" | "done" | "error";

function readFlag(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeFlag(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function planSignature(plan: {
  recipientName?: string;
  vibe: string | null;
  date: string;
  time: string;
  answers: { drink?: string; timeOfDay?: string; activity?: string };
  compatibilityResult?: string;
  foods: string[];
}): string {
  return JSON.stringify({
    recipientName: plan.recipientName?.trim() ?? "",
    vibe: plan.vibe,
    date: plan.date,
    time: plan.time,
    answers: plan.answers,
    compatibilityResult: plan.compatibilityResult ?? "",
    foods: [...plan.foods].sort(),
  });
}

export default function DateTicket() {
  const { plan, updatePlan, back, reset } = useDatePlanner();
  const [status, setStatus] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const celebrated = useRef(false);

  const alreadySubmitted =
    readFlag(STORAGE_KEYS.submitted) === "true" &&
    readJson<string>(STORAGE_KEYS.submittedPlan) === planSignature(plan);

  useEffect(() => {
    if (alreadySubmitted) {
      setStatus("done");
      return;
    }
    if (celebrated.current) return;
    celebrated.current = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const t = window.setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.35 },
        colors: ["#D92E67", "#F17CA2", "#FCE7EF", "#FFD6E4"],
      });
    }, 450);
    return () => window.clearTimeout(t);
  }, [alreadySubmitted]);

  useEffect(() => {
    if (!plan.completedAt) {
      updatePlan({ completedAt: new Date().toISOString() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vibe = VIBES.find((v) => v.key === plan.vibe);
  const ticketNo = useMemo(() => generateTicketNumber(plan.date), [plan.date]);
  const note = timeNote(plan.time);
  const recipient = plan.recipientName?.trim() || "You";

  const confirm = async () => {
    if (status === "sending" || status === "done") return;
    setStatus("sending");
    setErrorMsg("");
    const withAccepted = { ...plan, accepted: true };
    const res = await submitDate(withAccepted);
    if (res.ok) {
      setStatus("done");
      writeFlag(STORAGE_KEYS.submitted, "true");
      writeFlag(STORAGE_KEYS.submissionId, res.clientSubmissionId);
      writeFlag(STORAGE_KEYS.submittedPlan, planSignature(withAccepted));
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.5 },
        colors: ["#D92E67", "#F17CA2", "#FFD6E4"],
      });
    } else {
      setStatus("error");
      setErrorMsg(
        res.error === "RATE_LIMITED"
          ? "Whoa, slow down lover. Too many tries — wait a few minutes? 💗"
          : res.error === "NETWORK_ERROR"
            ? "You're offline, cutie. Check your connection and try again."
            : "Telegram is being dramatic. Try again?"
      );
    }
  };

  const handleCopy = async () => {
    const ok = await copyText(buildCopiedPlan({ ...plan, accepted: true }));
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex min-h-[68dvh] flex-col items-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">
        step 07 — the payoff
      </p>
      <h2 className="mt-2 text-center font-display text-4xl text-ink sm:text-5xl">
        It&apos;s a date! 💌
      </h2>
      <p className="mt-2 text-center italic text-muted">{note}</p>

      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -1 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        className="paper-texture mt-7 w-full overflow-hidden rounded-[26px] border border-[#F0E2E8] bg-white shadow-card-hover"
      >
        <div className="bg-raspberry px-6 py-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-white/85">
            date night pass
          </p>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">for</p>
              <p className="mt-1 font-display text-2xl text-ink">{recipient}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">vibe</p>
              <p className="mt-1 text-lg font-bold text-ink">
                {vibe ? `${vibe.title} ${vibe.emoji}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">date</p>
              <p className="mt-1 font-semibold text-ink">
                {plan.date ? formatReadableDate(plan.date) : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">time</p>
              <p className="mt-1 font-semibold text-ink">
                {plan.time ? formatTime(plan.time) : "—"}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">food</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {plan.foods.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-raspberry-soft px-3 py-1.5 text-sm font-semibold text-raspberry"
                >
                  {FOODS.find((x) => x.name === f)?.emoji} {f}
                </span>
              ))}
            </div>
          </div>

          <div className="relative my-6 flex items-center">
            <span className="ticket-notch absolute -left-[38px] sm:-left-[44px]" aria-hidden="true" />
            <div className="perforation w-full" aria-hidden="true" />
            <span className="ticket-notch absolute -right-[38px] sm:-right-[44px]" aria-hidden="true" />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">status</p>
              <p className="mt-1 font-bold text-ink">
                {status === "done" ? (
                  <span className="inline-flex items-center gap-1.5 text-raspberry">
                    <Heart size={16} className="fill-raspberry" /> CONFIRMED 💖
                  </span>
                ) : (
                  "READY TO CONFIRM 💖"
                )}
              </p>
            </div>
            <div className="text-right">
              <div
                className="font-mono text-sm tracking-[0.3em] text-muted"
                aria-label="decorative ticket barcode"
              >
                {"▌▌▌ ▌ ▌▌ ▌▌▌ ▌"}
              </div>
              <p className="mt-1 font-mono text-xs text-muted">{ticketNo}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-6 w-full">
        {status === "done" ? (
          <div className="rounded-2xl bg-raspberry-soft/70 px-5 py-4 text-center font-semibold text-raspberry">
            {alreadySubmitted && status === "done" ? "Already confirmed 💖" : "Date confirmed 💖"}
            <span className="mt-1 block text-sm font-normal">your plan was sent ✨</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={confirm}
            disabled={status === "sending"}
            className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-full bg-raspberry text-lg font-bold text-white shadow-soft hover:bg-raspberry-dark disabled:cursor-wait disabled:opacity-80"
          >
            {status === "sending" ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Sending our plan…
              </>
            ) : (
              "Confirm our date 💖"
            )}
          </button>
        )}

        <AnimatePresence>
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 rounded-2xl border border-[#F2C4D4] bg-white px-5 py-4 text-center"
              role="alert"
            >
              <p className="font-medium text-ink">{errorMsg}</p>
              <p className="mt-1 text-sm text-muted">Your choices are still saved.</p>
              <button
                type="button"
                onClick={confirm}
                className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-raspberry px-6 font-semibold text-white"
              >
                <Check size={16} /> Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-full border border-[#E5CBD6] bg-white font-semibold text-ink hover:border-blush hover:text-raspberry"
          >
            <Copy size={17} />
            {copied ? "Copied! 💖" : "Copy our plan"}
          </button>
          <button
            type="button"
            onClick={back}
            className="min-h-[50px] rounded-full border border-[#E5CBD6] bg-white px-5 font-medium text-muted hover:text-raspberry"
          >
            ← edit
          </button>
        </div>
      </div>

      {CONFIG.enableCountdown && (status === "done" || alreadySubmitted) && plan.date && plan.time && (
        <div className="mt-7 w-full">
          <Countdown date={plan.date} time={plan.time} />
        </div>
      )}

      <div className="mt-8 text-center">
        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="inline-flex min-h-[44px] items-center gap-1.5 px-4 text-sm text-[#B9A6B0] hover:text-raspberry"
          >
            <RotateCcw size={14} /> start over
          </button>
        ) : (
          <div className="rounded-2xl border border-[#EDD7DF] bg-white px-5 py-4">
            <p className="text-sm text-muted">
              start over? this only resets this browser — the sent plan stays sent 💌
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmReset(false);
                  reset(true);
                }}
                className="min-h-[44px] rounded-full bg-raspberry px-5 text-sm font-semibold text-white"
              >
                yes, reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="min-h-[44px] rounded-full border border-[#E5CBD6] px-5 text-sm font-medium text-muted"
              >
                keep it
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
