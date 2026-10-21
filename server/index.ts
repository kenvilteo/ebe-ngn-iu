import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildEncourageVisitMessage,
  buildLoveMessage,
  buildLoveVisitMessage,
  buildTelegramMessage,
  sendToTelegram,
} from "./telegram";
import {
  isDuplicateId,
  loveRateLimiter,
  markSeenToday,
  rateLimiter,
  seenToday,
} from "./rateLimit";
import {
  clampDays,
  normalizeVisitPage,
  validateLoveMessage,
  validatePlan,
  validSubmissionId,
} from "./validation";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/date-event", (req, res) => {
  const event = (req.body as { event?: unknown })?.event;
  if (event === "accepted" && process.env.DATE_PLANNER_APP_SECRET) {
    // Optional hook point: notifyOnAccept is disabled by default in config.
    // Kept as a no-op receiver so enabling it later is a one-line change.
  }
  res.json({ ok: true });
});

app.post("/api/submit-date", rateLimiter, async (req, res) => {
  const body = (req.body ?? {}) as { plan?: unknown; clientSubmissionId?: unknown };

  if (!validSubmissionId(body.clientSubmissionId)) {
    res.status(400).json({ ok: false, error: "INVALID_PAYLOAD" });
    return;
  }

  if (isDuplicateId(body.clientSubmissionId)) {
    // Lightweight duplicate protection: the plan was already received recently,
    // so acknowledge without sending a second Telegram message.
    res.json({ ok: true });
    return;
  }

  const validated = validatePlan(body.plan);
  if (!validated.ok) {
    res.status(400).json({ ok: false, error: validated.error });
    return;
  }

  const message = buildTelegramMessage(validated.plan);
  const result = await sendToTelegram(message);

  if (!result.ok) {
    if (result.error === "NOT_CONFIGURED") {
      res.status(500).json({ ok: false, error: "NOT_CONFIGURED" });
      return;
    }
    res.status(502).json({ ok: false, error: "SEND_FAILED" });
    return;
  }

  res.json({ ok: true });
});

/**
 * Cô ấy vừa mở trang /love. Tối đa một thông báo mỗi ngày cho mỗi thiết bị.
 *
 * Không gắn rateLimiter: chốt "mỗi ngày một lần" đã mạnh hơn rate limit rồi,
 * và gắn vào chỉ tổ ăn hạn mức của endpoint gửi lời nhắn.
 */
app.post("/api/love-visit", async (req, res) => {
  const body = (req.body ?? {}) as { clientVisitId?: unknown; days?: unknown; page?: unknown };

  if (!validSubmissionId(body.clientVisitId)) {
    res.status(400).json({ ok: false, error: "INVALID_PAYLOAD" });
    return;
  }

  const page = normalizeVisitPage(body.page);

  // Khoá chống trùng tính CẢ trang: mỗi ngày mỗi thiết bị được một tin cho
  // /love và một tin cho /meomeo1, mở lại đúng trang cũ thì không gửi thêm.
  // Đây mới là chốt chặn thật — guard phía client có thể bị vượt qua bằng cách
  // đổi trình duyệt hoặc xoá localStorage.
  const seenKey = `${page}:${body.clientVisitId}`;
  if (seenToday(seenKey)) {
    res.json({ ok: true, sent: false });
    return;
  }

  const days = clampDays(body.days);
  const result = await sendToTelegram(
    page === "encourage" ? buildEncourageVisitMessage(days) : buildLoveVisitMessage(days)
  );
  if (result.ok) markSeenToday(seenKey);

  // Cô ấy không bấm gì cả, nên đừng bao giờ để lỗi gửi hiện ra trước mặt cô ấy.
  res.json({ ok: true, sent: result.ok });
});

app.post("/api/love-message", loveRateLimiter, async (req, res) => {
  const body = (req.body ?? {}) as { message?: unknown; clientMessageId?: unknown };

  if (!validSubmissionId(body.clientMessageId)) {
    res.status(400).json({ ok: false, error: "INVALID_PAYLOAD" });
    return;
  }

  // Validate TRƯỚC khi khử trùng lặp: isDuplicateId vừa kiểm tra vừa ghi nhận,
  // nên nếu chạy trước thì một payload hỏng sẽ đốt luôn id đó.
  const validated = validateLoveMessage(body.message);
  if (!validated.ok) {
    res.status(400).json({ ok: false, error: validated.error });
    return;
  }

  if (isDuplicateId(body.clientMessageId)) {
    res.json({ ok: true });
    return;
  }

  const result = await sendToTelegram(buildLoveMessage(validated.message));

  if (!result.ok) {
    if (result.error === "NOT_CONFIGURED") {
      res.status(500).json({ ok: false, error: "NOT_CONFIGURED" });
      return;
    }
    res.status(502).json({ ok: false, error: "SEND_FAILED" });
    return;
  }

  res.json({ ok: true });
});

if (process.env.NODE_ENV !== "production") {
  app.post("/api/test-telegram", async (_req, res) => {
    const result = await sendToTelegram("✅ Date Planner Telegram connection is working.");
    if (!result.ok) {
      res.status(502).json({ ok: false, error: result.error ?? "SEND_FAILED" });
      return;
    }
    res.json({ ok: true });
  });
}

if (process.env.NODE_ENV === "production") {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const dist = path.resolve(here, "..", "dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`💌 Date Planner server listening on http://localhost:${PORT}`);
});
