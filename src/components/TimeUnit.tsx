import { motion } from "framer-motion";

/** Ô số dùng chung cho mọi chỗ đếm ngược / đếm xuôi trong app. */
export default function TimeUnit({ value, label }: { value: number; label: string }) {
  const text = String(value).padStart(2, "0");
  return (
    <div className="flex min-w-[68px] flex-col items-center rounded-2xl border border-[#F3E2E9] bg-white px-3 py-3 shadow-card">
      <motion.span
        key={text}
        initial={{ y: 6, opacity: 0.4 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-display text-3xl tabular-nums text-ink"
      >
        {text}
      </motion.span>
      <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
    </div>
  );
}
