import { useMemo } from "react";
import DaysCounter from "../components/love/DaysCounter";
import LoveNoteForm from "../components/love/LoveNoteForm";
import NextMilestone from "../components/love/NextMilestone";
import Timeline from "../components/love/Timeline";
import { ANNIVERSARY } from "../config";
import { useNow } from "../hooks/useNow";
import { useVisitNotify } from "../hooks/useVisitNotify";
import { RouteLink } from "../router";
import {
  buildOccurrences,
  buildTimeline,
  elapsedSince,
  nextOccurrence,
  previousOccurrence,
} from "../utils/anniversary";
import { toLocalISO } from "../utils/dateFormat";

export default function LovePage() {
  // Một chiếc đồng hồ duy nhất cho cả trang. Mọi thứ bên dưới suy ra từ `now`,
  // nên con số tự nhảy qua ngày mới lúc nửa đêm mà không cần tải lại trang.
  const now = useNow(1000);
  const elapsed = elapsedSince(ANNIVERSARY.startDate, now);

  // Cố tình phụ thuộc vào `todayISO` chứ không phải `now`: các cột mốc chỉ đổi
  // khi sang ngày mới, nên timeline không phải dựng lại mỗi giây.
  const todayISO = toLocalISO(now);
  const { next, previous, timeline } = useMemo(() => {
    const occurrences = buildOccurrences(now);
    const upcoming = nextOccurrence(occurrences);
    return {
      next: upcoming,
      previous: upcoming ? previousOccurrence(occurrences, upcoming) : null,
      timeline: buildTimeline(occurrences, ANNIVERSARY.timelineFutureLimit),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayISO]);

  useVisitNotify(elapsed.isValid ? elapsed.days : undefined, ANNIVERSARY.enableVisitNotify);

  return (
    <>
      <main className="mx-auto w-full max-w-[680px] flex-1 px-5 pb-10 pt-10 sm:px-8">
        <DaysCounter elapsed={elapsed} />
        <NextMilestone next={next} previous={previous} now={now} />
        <Timeline items={timeline} />
        {ANNIVERSARY.enableReply && <LoveNoteForm />}

        <p className="mt-12 text-center font-display text-base italic text-muted">
          {ANNIVERSARY.copy.closingMessage}
        </p>
      </main>

      <footer className="pb-6 text-center text-xs text-[#C2ADB7]">
        <RouteLink
          to="/meomeo1"
          className="underline decoration-dotted underline-offset-2 transition hover:text-raspberry"
        >
          còn một chỗ nữa nè 💌
        </RouteLink>
        <span className="mx-2 opacity-60">·</span>
        <RouteLink
          to="/date"
          className="underline decoration-dotted underline-offset-2 transition hover:text-raspberry"
        >
          gửi lời mời hẹn hò 💗
        </RouteLink>
      </footer>
    </>
  );
}
