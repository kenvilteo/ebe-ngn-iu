import { motion } from "framer-motion";
import type { EncouragementMessage } from "../../types";

/**
 * Thẻ chứa một câu. Tách riêng để `AnimatePresence` có một phần tử duy nhất
 * làm đơn vị vào/ra — đổi `key` ở cha là cả thẻ trượt đi rồi thẻ mới trượt vào.
 */
export default function EncouragementCard({ message }: { message: EncouragementMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.98 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="rounded-3xl border border-[#F3E2E9] bg-white px-6 py-9 text-center shadow-card"
    >
      <p className="text-5xl leading-none" aria-hidden="true">
        {message.emoji}
      </p>
      <p className="mt-5 font-display text-2xl leading-snug text-ink">{message.text}</p>
    </motion.div>
  );
}
