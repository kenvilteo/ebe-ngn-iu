export type VibeKey = "cozy" | "fancy" | "adventure" | "chaotic" | "foodie";

export interface DatePlan {
  accepted: boolean;
  recipientName?: string;
  vibe: VibeKey | null;
  date: string;
  time: string;
  answers: {
    drink?: string;
    timeOfDay?: string;
    activity?: string;
  };
  compatibilityResult?: string;
  foods: string[];
  completedAt?: string;
}

export type Step =
  | "invite"
  | "scratch"
  | "vibe"
  | "datetime"
  | "thisOrThat"
  | "food"
  | "ticket";

export interface VibeOption {
  key: VibeKey;
  emoji: string;
  title: string;
  description: string;
}

export interface FoodOption {
  name: string;
  emoji: string;
}

export interface TimeOption {
  value: string;
  label: string;
  note: string;
}

export interface ThisOrThatOption {
  value: string;
  label: string;
  emoji: string;
}

export interface ThisOrThatQuestion {
  key: "drink" | "timeOfDay" | "activity";
  optionA: ThisOrThatOption;
  optionB: ThisOrThatOption;
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
  vibe: null,
  date: "",
  time: "",
  answers: {},
  foods: [],
};
