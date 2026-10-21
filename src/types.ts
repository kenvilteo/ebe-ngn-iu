/** Buổi hẹn làm gì — quyết định cả bước nhập thêm phía sau. */
export type ActivityKey = "eat" | "movie" | "walk" | "cafe" | "cook" | "meet";

export interface DatePlan {
  accepted: boolean;
  recipientName?: string;
  date: string;
  time: string;
  activity: ActivityKey | null;
  /** Món muốn ăn / phim muốn xem / quán muốn đi. Rỗng với hoạt động không cần. */
  activityDetail?: string;
  completedAt?: string;
}

export type Step = "invite" | "datetime" | "activity" | "activityDetail" | "ticket";

export interface ActivityOption {
  key: ActivityKey;
  emoji: string;
  title: string;
  description: string;
  /** Chỉ có ở hoạt động cần hỏi thêm (ăn / phim / cafe). */
  detailLabel?: string;
  detailPlaceholder?: string;
}

export interface TimeOption {
  value: string;
  label: string;
  note: string;
}

export interface SubmitDateRequest {
  plan: DatePlan;
  clientSubmissionId: string;
}

export interface SubmitDateResponse {
  ok: boolean;
  error?: string;
}

/* ---------- /love : trang kỷ niệm ---------- */

export interface LoveMilestone {
  id: string;
  /** "YYYY-MM-DD" */
  date: string;
  emoji: string;
  title: string;
  description?: string;
}

export type MilestoneSource = "config" | "year" | "day";

export interface MilestoneOccurrence {
  id: string;
  date: string;
  emoji: string;
  title: string;
  description?: string;
  source: MilestoneSource;
  /** Số ngày tính từ hôm nay tới mốc này. Âm = đã qua, 0 = đúng hôm nay. */
  daysUntil: number;
  isPast: boolean;
  isToday: boolean;
}

export interface AnniversaryConfig {
  /** "YYYY-MM-DD" — ngày hai đứa bắt đầu. */
  startDate: string;
  enableVisitNotify: boolean;
  enableReply: boolean;
  /** Số năm kỷ niệm tự sinh ra. */
  yearAnniversaryCount: number;
  /** Các mốc tròn ngày tự sinh ra. */
  roundDayMilestones: number[];
  milestones: LoveMilestone[];
  /** Số cột mốc tương lai hiện thêm trên timeline. */
  timelineFutureLimit: number;
  copy: {
    heroLabel: string;
    heroSubtitle: string;
    heroDayOne: string;
    heroInvalid: string;
    timelineTitle: string;
    timelineEmpty: string;
    noteTitle: string;
    notePlaceholder: string;
    noteButton: string;
    closingMessage: string;
  };
}

/** Trang nào vừa được mở — server dùng để chọn câu thông báo Telegram. */
export type VisitPage = "love" | "encourage";

export interface LoveVisitRequest {
  clientVisitId: string;
  days?: number;
  /** Bỏ trống thì server hiểu là "love" (client cũ chưa gửi field này). */
  page?: VisitPage;
}

export interface LoveVisitResponse {
  ok: boolean;
  sent?: boolean;
  error?: string;
}

export interface LoveMessageRequest {
  message: string;
  clientMessageId: string;
}

/* ---------- /meomeo1 : lời yêu + cổ vũ làm việc ---------- */

export interface EncouragementMessage {
  emoji: string;
  text: string;
}

export interface EncouragementConfig {
  enableVisitNotify: boolean;
  /** Càng nhiều câu càng đỡ lặp. Mỗi lần bấm nút sẽ bốc một câu khác câu vừa hiện. */
  messages: EncouragementMessage[];
  copy: {
    eyebrow: string;
    title: string;
    subtitle: string;
    buttonLabel: string;
    empty: string;
    closingMessage: string;
  };
}

export interface LoveMessageResponse {
  ok: boolean;
  error?: string;
}

export const initialPlan: DatePlan = {
  accepted: false,
  recipientName: "",
  date: "",
  time: "",
  activity: null,
  activityDetail: "",
};
