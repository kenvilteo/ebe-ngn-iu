import { useEffect } from "react";
import App from "./App";
import FloatingHearts from "./components/FloatingHearts";
import { DatePlannerProvider } from "./hooks/useDatePlanner";
import EncouragePage from "./pages/EncouragePage";
import LovePage from "./pages/LovePage";
import { RouteLink, useRoute } from "./router";

const LOVE_TITLE = "chuyện của hai đứa mình 💗";

const TITLES: Record<string, string> = {
  "/": LOVE_TITLE,
  "/love": LOVE_TITLE,
  "/meomeo1": "nghỉ tay một chút đi 💌",
  "/date": "Will You Go On A Date With Me? 💖",
};

function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[680px] flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <p className="text-5xl" aria-hidden="true">
        🫥
      </p>
      <h1 className="mt-4 font-display text-3xl text-ink">không có gì ở đây hết</h1>
      <p className="mt-2 text-sm text-muted">chắc gõ nhầm đường dẫn rồi.</p>
      <RouteLink
        to="/"
        className="mt-6 rounded-full bg-raspberry px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-raspberry-dark"
      >
        về trang chính
      </RouteLink>
    </main>
  );
}

export default function Root() {
  const path = useRoute();

  useEffect(() => {
    document.title = TITLES[path] ?? "hmm... 🤔";
    // Chỉ Date Planner là tiếng Anh. Khai báo đúng để trình duyệt chọn font dự
    // phòng hợp lý và screen reader phát âm chuẩn.
    document.documentElement.lang = path === "/date" ? "en" : "vi";
  }, [path]);

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-x-clip">
      {/* Nền tim nằm ở đây để không bị remount (và chạy lại animation) khi đổi trang. */}
      <FloatingHearts />
      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        {/*
          DatePlannerProvider chỉ được mount ở /date — nó gọi persist() mỗi lần
          mount và stamp ngày hôm nay vào plan, nên nếu bọc quanh /love hay
          /meomeo1 sẽ ghi đè state của Date Planner ngay khi cô ấy mở trang khác.

          "/" và "/love" cùng là trang kỷ niệm: "/" là trang chính, còn "/love"
          giữ lại để link cũ đã gửi cho cô ấy vẫn mở được.
        */}
        {path === "/date" ? (
          <DatePlannerProvider>
            <App />
          </DatePlannerProvider>
        ) : path === "/" || path === "/love" ? (
          <LovePage />
        ) : path === "/meomeo1" ? (
          <EncouragePage />
        ) : (
          <NotFound />
        )}
      </div>
    </div>
  );
}
