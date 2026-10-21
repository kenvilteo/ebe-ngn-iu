import type {
  ActivityKey,
  ActivityOption,
  AnniversaryConfig,
  EncouragementConfig,
  Step,
  TimeOption,
} from "./types";

export const CONFIG = {
  senderName: "Anh",
  // Cố định tên người nhận: trang /date là món quà gửi riêng cho em ấy, không
  // phải biểu mẫu chung, nên không hỏi lại tên trên trang đầu.
  recipientName: "ebeNganIu",

  enableNoButtonGame: true,
  enableCountdown: true,
  enableEasterEgg: true,

  notifyOnAccept: false,

  invitation: {
    title: "Em có muốn đi hẹn hò với anh không?",
    secretMessage: "thôi được rồi, em dễ thương thật 💗",
    secretSubMessage: "đáng lẽ em không thấy dòng này đâu.",
  },
};

/** Chỉ còn lời mời → ngày giờ → hoạt động → (chi tiết) → chốt kèo. */
export const STEP_ORDER = [
  "invite",
  "datetime",
  "activity",
  "activityDetail",
  "ticket",
] as const;

export const ACTIVITIES: ActivityOption[] = [
  {
    key: "eat",
    emoji: "🍜",
    title: "Đi ăn",
    description: "em chọn món, anh lo phần trả tiền",
    detailLabel: "Em muốn ăn gì?",
    detailPlaceholder: "ví dụ: bún bò, sushi, lẩu…",
  },
  {
    key: "movie",
    emoji: "🎬",
    title: "Xem phim",
    description: "phim gì cũng được, miễn là có em",
    detailLabel: "Mình xem phim gì?",
    detailPlaceholder: "ví dụ: phim kinh dị, hoạt hình…",
  },
  {
    key: "cafe",
    emoji: "☕",
    title: "Đi cafe",
    description: "ngồi cả buổi cũng không ai đuổi",
    detailLabel: "Quán nào em muốn đi?",
    detailPlaceholder: "ví dụ: quán quen, quán mới…",
  },
  {
    key: "walk",
    emoji: "🚶",
    title: "Đi dạo",
    description: "đi đâu cũng được, miễn đừng về sớm",
  },
  {
    key: "cook",
    emoji: "🍳",
    title: "Tự nấu",
    description: "anh nấu, em ngồi chờ (và ăn)",
  },
  {
    key: "meet",
    emoji: "💞",
    title: "Chỉ cần gặp anh",
    description: "không cần làm gì cả, có em là đủ",
  },
];

export function findActivity(key: ActivityKey | null): ActivityOption | undefined {
  return ACTIVITIES.find((a) => a.key === key);
}

/** Ăn / xem phim / cafe mới cần hỏi thêm một câu. */
export function needsActivityDetail(key: ActivityKey | null): boolean {
  return !!findActivity(key)?.detailLabel;
}

export function getActiveSteps(activity: ActivityKey | null): Step[] {
  const steps: Step[] = ["invite", "datetime", "activity"];
  if (needsActivityDetail(activity)) steps.push("activityDetail");
  steps.push("ticket");
  return steps;
}

export const TIME_OPTIONS: TimeOption[] = [
  { value: "17:00", label: "17:00", note: "ăn sớm cho kịp đi dạo" },
  { value: "18:00", label: "18:00", note: "giờ đẹp nhất để hẹn" },
  { value: "19:00", label: "19:00", note: "chuẩn bữa tối, anh đói rồi" },
  { value: "20:00", label: "20:00", note: "hơi muộn nhưng vẫn kịp" },
  { value: "21:00", label: "21:00", note: "ăn khuya cũng là ăn 🌙" },
];

export const STORAGE_KEYS = {
  state: "datePlannerState.v1",
  submitted: "datePlannerSubmitted",
  submissionId: "datePlannerSubmissionId",
  submittedPlan: "datePlannerSubmittedPlan",
} as const;

/* ------------------------------------------------------------------ *
 *  Trang /love — "chuyện của hai đứa mình"
 *
 *  Đây là chỗ duy nhất cần sửa để cá nhân hoá trang kỷ niệm.
 * ------------------------------------------------------------------ */
export const ANNIVERSARY: AnniversaryConfig = {
  // Ngày hai đứa bắt đầu. Định dạng YYYY-MM-DD, tính theo giờ địa phương.
  startDate: "2026-09-14",

  enableVisitNotify: true,
  enableReply: true,

  yearAnniversaryCount: 10,

  // Mốc tròn ngày tự sinh. Cố tình KHÔNG có 365/730 — mấy mốc đó đã do
  // phần kỷ niệm năm lo, để cả hai sẽ sinh ra hai dòng lệch nhau vài ngày.
  roundDayMilestones: [50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 2500, 3000, 5000],

  // Cột mốc của riêng hai đứa. Ngày sai định dạng sẽ tự bị bỏ qua (không crash).
  milestones: [
    {
      id: "day-one",
      date: "2026-09-14",
      emoji: "💘",
      title: "ngày đầu tiên",
      description: "chính thức bắt đầu. không take-back.",
    },
    // TODO: thêm cột mốc thật của hai đứa vào đây, ví dụ:
    // { id: "first-date", date: "2026-09-20", emoji: "🍜", title: "buổi hẹn đầu tiên", description: "..." },
    // { id: "first-trip", date: "2026-11-02", emoji: "🌿", title: "chuyến đi đầu tiên" },
  ],

  // Số cột mốc tương lai hiện thêm trên timeline (để không thành danh sách dài
  // ngoằng 10 năm).
  timelineFutureLimit: 4,

  copy: {
    heroLabel: "ngày bên nhau",
    heroSubtitle: "và vẫn đang đếm, chưa có ý định dừng lại 💗",
    heroDayOne: "hôm nay là ngày đầu tiên",
    heroInvalid: "chưa cài được ngày bắt đầu. vào src/config.ts sửa giúp anh cái 🙈",
    timelineTitle: "chuyện của hai đứa mình",
    timelineEmpty: "chưa có cột mốc nào hết. vào src/config.ts thêm đi 😌",
    noteTitle: "nhắn cho anh một câu đi",
    notePlaceholder: "nói gì cũng được, anh đọc hết 💌",
    noteButton: "gửi",
    closingMessage: "trang này anh làm lúc rảnh. em là lý do anh rảnh 🙂",
  },
};

export const LOVE_STORAGE_KEYS = {
  /** UUID cố định của từng thiết bị — dùng để chặn spam thông báo phía server. */
  deviceId: "loveDeviceId",
  /** "YYYY-MM-DD" của lần ghé thăm gần nhất — chặn gọi API lặp trong cùng ngày. */
  lastVisit: "loveLastVisitDay",
} as const;

/* ------------------------------------------------------------------ *
 *  Trang /meomeo1 — lời yêu + cổ vũ làm việc
 *
 *  Đây là chỗ duy nhất cần sửa để thêm/bớt câu. Cứ thêm vào mảng
 *  `messages` là xong, không cần động vào component.
 * ------------------------------------------------------------------ */
export const ENCOURAGEMENT: EncouragementConfig = {
  enableVisitNotify: true,

  messages: [
    { emoji: "🐌", text: "em chăm thế này anh chạy theo không kịp đâu" },
    { emoji: "🍜", text: "cố thêm chút nữa thôi, xong việc mình đi ăn. anh bao." },
    { emoji: "😌", text: "anh yêu em, kể cả lúc em đang deadline" },
    { emoji: "☕", text: "uống miếng nước đi. em quên thì anh nhắc." },
    { emoji: "💪", text: "em giỏi hơn em nghĩ nhiều. anh nói thật, không phải nịnh." },
    { emoji: "🌙", text: "hôm nay mệt thì nghỉ. ngày mai mình làm tiếp." },
    { emoji: "🐱", text: "em làm việc chăm quá nên anh phải lập cả trang web để nhắc em nghỉ" },
    { emoji: "🍰", text: "xong việc rồi ăn bánh. không xong cũng ăn bánh. nhưng xong thì vui hơn." },
    { emoji: "📚", text: "em là người giỏi nhất mà anh biết. top 1. không có top 2." },
    { emoji: "💗", text: "yêu em. hết. không có nhưng." },
    { emoji: "🔥", text: "em cứ làm việc của em đi, anh lo phần cổ vũ." },
    { emoji: "🥺", text: "nghỉ tay 5 phút đi, anh nhớ em rồi" },
    { emoji: "🌤️", text: "mai mốt em thành công nhớ kể anh nghe. anh kể lại cho em." },
    { emoji: "🍀", text: "hôm nay khó thì hôm nay khó. mai tính. anh vẫn ở đây." },
    { emoji: "🐣", text: "em không cần phải hoàn hảo. em chỉ cần là em thôi." },
    { emoji: "💌", text: "có người đang đợi em xong việc để đi chơi. người đó là anh." },
    { emoji: "🎧", text: "bật nhạc lên, làm tiếp. anh ngồi đây cổ vũ (không làm gì cả)." },
    { emoji: "🌻", text: "em mệt thì dựa vào anh. anh không mệt vì anh có em." },
    { emoji: "🦸", text: "em là siêu nhân. siêu nhân cũng cần ngủ trưa." },
    { emoji: "💐", text: "xong việc rồi nhớ nhắn anh. anh chờ." },
  ],

  copy: {
    eyebrow: "một chút động lực",
    title: "nghỉ tay một chút đi",
    subtitle: "anh có mấy câu muốn nói",
    buttonLabel: "cho em thêm động lực",
    empty: "chưa có câu nào trong config. vào src/config.ts thêm đi 😌",
    closingMessage: "trang này anh làm để em đỡ mệt. yêu em 💗",
  },
};

export const ENCOURAGE_STORAGE_KEYS = {
  /** Tách riêng khỏi /love: mỗi ngày mỗi trang được một tin, không giành suất của nhau. */
  lastVisit: "encourageLastVisitDay",
} as const;

export const NO_BUTTON_TEXTS = [
  "Không",
  "Chắc chưa? 🥺",
  "Thiệt luôn? 👀",
  "Sai rồi 😭",
  "Nghĩ lại đi...",
  "Thôi, bấm lại đi 😂",
];

export const MAX_NO_ATTEMPTS = 5;
