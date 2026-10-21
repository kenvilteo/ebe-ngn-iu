import { memo, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import { postLoveMessage } from "../../api/love";
import { ANNIVERSARY } from "../../config";
import { randomId } from "../../utils/randomId";

const MAX_LENGTH = 300;
const CONFETTI_COLORS = ["#D92E67", "#F17CA2", "#FCE7EF", "#FFD6E4"];

type Status = "idle" | "sending" | "sent" | "error";

function errorCopy(code: string | null): string {
  switch (code) {
    case "RATE_LIMITED":
      return "Từ từ thôi em 😅 vài phút nữa thử lại nhé";
    case "NETWORK_ERROR":
      return "Mất mạng rồi 🥺 kiểm tra wifi giúp anh";
    case "EMPTY_MESSAGE":
      return "Chưa gõ gì mà 🙈";
    case "NOT_CONFIGURED":
      return "Anh chưa cài bot Telegram, nhắn kiểu gì cũng không tới 🙈";
    default:
      return "Telegram đang dỗi. thử lại phát nữa nhé?";
  }
}

function LoveNoteForm() {
  const reducedMotion = useReducedMotion() ?? false;
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  // Giữ nguyên id giữa các lần thử lại để server khử trùng lặp, nhưng đổi sau
  // khi gửi thành công — nếu không, tin thứ hai sẽ bị coi là trùng và bị bỏ.
  const [messageId, setMessageId] = useState(() => randomId());

  const trimmed = message.trim();
  const canSend = trimmed.length > 0 && status !== "sending";

  async function send() {
    if (!canSend) return;
    setStatus("sending");
    setError(null);

    const result = await postLoveMessage(trimmed, messageId);

    if (result.ok) {
      setStatus("sent");
      setMessage("");
      setMessageId(randomId());
      if (!reducedMotion) {
        confetti({ particleCount: 70, spread: 65, origin: { y: 0.75 }, colors: CONFETTI_COLORS });
      }
      return;
    }

    setStatus("error");
    setError(errorCopy(result.error ?? null));
  }

  return (
    <section className="mt-12 rounded-3xl border border-[#F3E2E9] bg-white px-5 py-6 shadow-card">
      <h2 className="font-display text-2xl text-ink">{ANNIVERSARY.copy.noteTitle}</h2>

      <label htmlFor="love-note" className="sr-only">
        {ANNIVERSARY.copy.noteTitle}
      </label>
      <textarea
        id="love-note"
        value={message}
        onChange={(event) => {
          setMessage(event.target.value.slice(0, MAX_LENGTH));
          if (status === "sent" || status === "error") setStatus("idle");
        }}
        maxLength={MAX_LENGTH}
        rows={4}
        placeholder={ANNIVERSARY.copy.notePlaceholder}
        // text-base (16px) là mức tối thiểu để iOS Safari không tự zoom khi focus.
        className="mt-3 w-full resize-none rounded-2xl border border-[#F3E2E9] bg-cream px-4 py-3 text-base leading-relaxed text-ink outline-none transition placeholder:text-[#C2ADB7] focus:border-raspberry/40"
      />

      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs tabular-nums text-muted">
          {message.length}/{MAX_LENGTH}
        </span>

        <button
          type="button"
          onClick={send}
          disabled={!canSend}
          className="inline-flex items-center gap-2 rounded-full bg-raspberry px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-raspberry-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "sending" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Đang gửi...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              {ANNIVERSARY.copy.noteButton}
            </>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {status === "sent" && (
          <motion.p
            key="sent"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm font-semibold text-raspberry"
          >
            Gửi rồi nha. Anh đọc liền 💗
          </motion.p>
        )}
        {status === "error" && error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-muted"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}

export default memo(LoveNoteForm);
