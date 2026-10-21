# 💌 Date Planner — Will You Go On A Date With Me?

A playful, romantic mini-experience you send to your partner as a private link:

**Invitation → playful Yes/No → scratch card → vibe → date & time → This-or-That game → food → Date Ticket → confirm → Telegram notification → countdown**

Takes about 1–2 minutes. Built to feel like a tiny handmade gift, not a SaaS form.

The **`/love`** page is the main page — a Vietnamese anniversary page (days together, milestone
timeline, countdown to the next milestone, and a box for her to write back). See
[Trang `/love`](#trang-love--trang-kỷ-niệm) below. The Date Planner now lives at **`/date`**.

There is also **`/meomeo1`** — a Vietnamese page of love notes and work encouragement, with a
button that draws a random line each time. See [Trang `/meomeo1`](#trang-meomeo1--lời-yêu--cổ-vũ).

## Tech

- Frontend: React + TypeScript + Vite + Tailwind CSS + Framer Motion + Lucide
- Backend: Node.js + Express + TypeScript (same project, proxied via Vite in dev)
- No database. Browser progress lives in `localStorage` only.
- Final confirmation is sent to your private Telegram chat via a server-side bot call.

## ⚠️ Security rule (important)

**Never put `DATE_PLANNER_TELEGRAM_BOT_TOKEN` in frontend code.** The browser never talks to the Telegram API. The flow is:

```
React app → POST /api/submit-date → Express server → Telegram Bot API → your chat
```

The token only exists in server-side environment variables.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Telegram bot with BotFather

1. Open Telegram and message **@BotFather**.
2. Send `/newbot`, follow the prompts (name + username).
3. BotFather replies with a token like `123456:ABC-DEF...` — that's your `DATE_PLANNER_TELEGRAM_BOT_TOKEN`.

### 3. Send `/start` to your new bot

From the Telegram account that should **receive** the date notifications, open your new bot and press **Start** (or send `/start`). Bots can't message you until you've done this once.

### 4. Find your `DATE_PLANNER_TELEGRAM_CHAT_ID`

Easiest way:

1. Message **@userinfobot** on Telegram.
2. It replies with your numeric id — that's your `DATE_PLANNER_TELEGRAM_CHAT_ID`.

(Alternative: send your bot a message, then open `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a browser and look for `message.chat.id`.)

### 5. Add server environment variables

```bash
cp .env.example .env
```

Then fill in `.env`:

```
DATE_PLANNER_TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
DATE_PLANNER_TELEGRAM_CHAT_ID=123456789
```

`.env` is gitignored. Never commit it.

### 6. Start the dev server

```bash
npm run dev
```

- App: http://localhost:5173
- API: http://localhost:3001 (proxied, so the app just calls `/api/...`)

### 7. Send a test submission

Option A — dev-only test endpoint (disabled in production):

```bash
curl -X POST http://localhost:3001/api/test-telegram
```

You should receive `✅ Date Planner Telegram connection is working.` in your chat.

Option B — the real thing: walk through the app and hit **Confirm our date 💖**.

## Customizing

All the content lives in `src/config.ts`:

- `senderName` / `recipientName` (recipient name also appears in the invite heading)
- Feature flags: scratch card, vibe step, This-or-That, roulette, countdown, easter egg
- Vibes, foods, time options, compatibility results

## Trang `/love` — trang kỷ niệm

Trang thứ hai, độc lập với Date Planner. Mở `/love` là thấy ngay: số ngày hai đứa bên nhau
(đếm thực thời), timeline cột mốc, đếm ngược tới kỷ niệm sắp tới, và một ô để cô ấy nhắn lại.

Mỗi lần cô ấy mở trang, bot gửi bạn **tối đa một tin mỗi ngày cho mỗi thiết bị**.

### Cá nhân hoá

Tất cả nằm trong khối `ANNIVERSARY` ở `src/config.ts` — đây là chỗ duy nhất cần sửa:

| Khoá | Ý nghĩa |
|---|---|
| `startDate` | Ngày hai đứa bắt đầu, `YYYY-MM-DD`. **Sửa cái này trước tiên.** |
| `milestones` | Cột mốc của riêng hai đứa: `{ id, date, emoji, title, description }`. Ngày sai định dạng sẽ tự bị bỏ qua, không làm sập trang. |
| `roundDayMilestones` | Các mốc tròn ngày tự sinh (mặc định 50, 100, 200, …). |
| `yearAnniversaryCount` | Số năm kỷ niệm tự sinh. |
| `enableVisitNotify` | Bật/tắt thông báo Telegram khi cô ấy mở trang. |
| `enableReply` | Bật/tắt ô nhắn lại. |
| `copy` | Toàn bộ câu chữ hiển thị trên trang. |

### Quy ước ngày tháng

`src/utils/anniversary.ts` định nghĩa **một** quy ước duy nhất, dùng ở mọi nơi:

```
days = differenceInCalendarDays(hôm nay, startDate)
```

nên ngày bắt đầu là **0**, và mốc "100 ngày" là `addDays(startDate, 100)` — tức đúng hôm con
số trên trang đọc ra 100. Đổi quy ước thì sửa đúng một hàm.

Không bao giờ dùng `new Date("2026-09-14")`: chuỗi ISO chỉ có ngày bị hiểu là **nửa đêm UTC**,
nên ở múi giờ âm nó rơi sang ngày hôm trước. Dùng `parseLocalDate()` trong
`src/utils/dateFormat.ts` — đã kiểm chứng đúng ở UTC+14 lẫn UTC-11.

## Trang `/meomeo1` — lời yêu + cổ vũ

Trang thứ ba: một câu lời yêu / động viên hiện giữa màn hình, kèm nút
**"cho em thêm động lực"**. Mỗi lần bấm sẽ bốc một câu khác câu vừa hiện (không bao giờ lặp
liền kề), kèm một đợt confetti nhẹ.

Toàn bộ câu chữ nằm trong khối `ENCOURAGEMENT` ở `src/config.ts`:

| Khoá | Ý nghĩa |
|---|---|
| `messages` | Mảng `{ emoji, text }`. Thêm/bớt bao nhiêu câu cũng được, không cần sửa component. |
| `enableVisitNotify` | Bật/tắt thông báo Telegram khi cô ấy mở trang. |
| `copy` | Tiêu đề, phụ đề, nhãn nút, câu kết. |

Mở trang sẽ gửi bạn **tối đa một tin mỗi ngày cho mỗi thiết bị** — cùng cơ chế với `/love`
nhưng khoá chống trùng tính riêng theo trang, nên mở `/love` rồi mở `/meomeo1` trong cùng ngày
thì bạn nhận hai tin, còn mở lại đúng một trang thì không nhận thêm.

## Project structure

```
src/
  api/
    submitDate.ts          # POST /api/submit-date client
    love.ts                # POST /api/love-visit + /api/love-message client
  components/
    ProgressHearts.tsx     # heart progress + 5-tap easter egg
    StepContainer.tsx      # page transitions
    FloatingHearts.tsx     # ambient background hearts
    Countdown.tsx          # post-confirmation countdown
    TimeUnit.tsx           # shared countdown digit box
    steps/                 # Invite, Scratch, Vibe, DateTime, ThisOrThat, Food, DateTicket
    love/                  # DaysCounter, NextMilestone, Timeline, LoveNoteForm
    encourage/             # EncouragementCard
  hooks/                   # useDatePlanner, useCountdown, useNow, useVisitNotify, useLocalStorage
  pages/LovePage.tsx       # the /love and / pages
  pages/EncouragePage.tsx  # the /meomeo1 page
  router.tsx               # ~45-line pathname router (no react-router)
  utils/
    dateFormat.ts          # parsing/formatting (parseLocalDate — local midnight, not UTC)
    anniversary.ts         # all /love date math (the only module importing date-fns)
    randomId.ts            # crypto.randomUUID with fallback
    copyPlan.ts            # clipboard copy plan
  config.ts  types.ts  App.tsx  Root.tsx  main.tsx
server/
  index.ts                 # Express app + routes
  telegram.ts              # message builders (HTML-escaped) + sendMessage via fetch
  validation.ts            # strict input validation + sanitization
  rateLimit.ts             # per-group rate limiters, dedupe cache, once-per-day guard
```

### Routing

There is no router library. `src/router.tsx` reads `window.location.pathname`, and `src/Root.tsx`
picks the page:

| Path | Page |
|---|---|
| `/` | Trang kỷ niệm (trang chính) |
| `/love` | Trang kỷ niệm (giữ lại để link cũ đã gửi vẫn mở được) |
| `/meomeo1` | Lời yêu + cổ vũ làm việc |
| `/date` | Date Planner |
| anything else | a small "nothing here" card |

`DatePlannerProvider` is mounted **only** on `/date`. It calls `persist()` on every mount and stamps
today's date into the plan, so wrapping `/love` or `/meomeo1` in it would silently overwrite the
Date Planner's saved state just because she opened another page.

## Notes

- **Duplicate protection** is lightweight and in-memory (recent id cache + per-IP rate limits). Restarting the server clears it. That's fine for a personal app with one recipient, but it's not database-level deduplication.
- **Rate limits** use separate buckets per group: `/api/submit-date` gets 5 req / 10 min, the `/love` endpoints get 12 req / 10 min. Sharing one bucket would let a refresh loop on `/love` lock the confirm button.
- **Once-per-day visit notice** is enforced server-side per device *per page* (a UUID in `localStorage`; the dedupe key is `"<page>:<deviceId>"`), with a client-side guard that skips the request entirely. A failed Telegram send does **not** burn the day's slot.
- **Timestamps** in the Telegram message use the server clock, never the client.
- **Privacy:** the app only submits the date choices and whatever she types. No location, fingerprinting, analytics, or tracking.
- **Start over** after confirming only resets the browser — it can't unsend the Telegram message.
- `POST /api/test-telegram` only exists when `NODE_ENV !== "production"`.
- **Express must stay on v4.** `app.get("*")` (the SPA fallback) is not a valid path pattern in Express 5 and would throw at startup; it would need `app.get("/*splat", …)`.

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | liveness |
| POST | `/api/date-event` | no-op accept hook (kept for `notifyOnAccept`) |
| POST | `/api/submit-date` | 5 req / 10 min. `400 INVALID_PAYLOAD` / `NOT_ACCEPTED` / `INVALID_*`, `429 RATE_LIMITED`, `500 NOT_CONFIGURED`, `502 SEND_FAILED` |
| POST | `/api/love-visit` | `{ clientVisitId, days?, page? }` → `{ ok, sent }`. `page` is `"love"` (default) or `"encourage"`; the once-a-day guard is keyed per page. Never errors the UI — a failed send still returns `200`. |
| POST | `/api/love-message` | `{ message, clientMessageId }`, message ≤ 300 chars. `400 EMPTY_MESSAGE` / `MESSAGE_TOO_LONG` / `INVALID_PAYLOAD`, `429`, `500`, `502` |
| POST | `/api/test-telegram` | dev only |

## Build

```bash
npm run build   # typecheck + Vite build
npm start       # serve API + built frontend (production)
```

In production the Express server serves `dist/` and falls back to `dist/index.html`, so `/love`
resolves the same way it does in dev.

> **Windows note:** `npm start` runs `NODE_ENV=production tsx …`, which is POSIX inline-env syntax
> and fails under `cmd.exe` / PowerShell with `'NODE_ENV' is not recognized`. Until `cross-env` is
> added, use:
>
> ```powershell
> $env:NODE_ENV = "production"; npx tsx server/index.ts
> ```
