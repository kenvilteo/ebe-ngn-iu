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
    secretMessage: "Thôi được rồi, em dễ thương thật 💗",
    secretSubMessage: "Đáng lẽ em không thấy dòng này đâu.",
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
    description: "Em chọn món, anh lo phần trả tiền",
    detailLabel: "Em muốn ăn gì?",
    detailPlaceholder: "Ví dụ: bún bò, sushi, lẩu…",
  },
  {
    key: "movie",
    emoji: "🎬",
    title: "Xem phim",
    description: "Phim gì cũng được, miễn là có em",
    detailLabel: "Mình xem phim gì?",
    detailPlaceholder: "Ví dụ: phim kinh dị, hoạt hình…",
  },
  {
    key: "cafe",
    emoji: "☕",
    title: "Đi cafe",
    description: "Ngồi cả buổi cũng không ai đuổi",
    detailLabel: "Quán nào em muốn đi?",
    detailPlaceholder: "Ví dụ: quán quen, quán mới…",
  },
  {
    key: "walk",
    emoji: "🚶",
    title: "Đi dạo",
    description: "Đi đâu cũng được, miễn đừng về sớm",
  },
  {
    key: "cook",
    emoji: "🍳",
    title: "Tự nấu",
    description: "Anh nấu, em ngồi chờ (và ăn)",
  },
  {
    key: "meet",
    emoji: "💞",
    title: "Chỉ cần gặp anh",
    description: "Không cần làm gì cả, có em là đủ",
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
  { value: "17:00", label: "17:00", note: "Ăn sớm cho kịp đi dạo" },
  { value: "18:00", label: "18:00", note: "Giờ đẹp nhất để hẹn" },
  { value: "19:00", label: "19:00", note: "Chuẩn bữa tối, anh đói rồi" },
  { value: "20:00", label: "20:00", note: "Hơi muộn nhưng vẫn kịp" },
  { value: "21:00", label: "21:00", note: "Ăn khuya cũng là ăn 🌙" },
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
      title: "Ngày đầu tiên",
      description: "Chính thức bắt đầu. Không take-back.",
    },
    // TODO: thêm cột mốc thật của hai đứa vào đây, ví dụ:
    // { id: "first-date", date: "2026-09-20", emoji: "🍜", title: "buổi hẹn đầu tiên", description: "..." },
    // { id: "first-trip", date: "2026-11-02", emoji: "🌿", title: "chuyến đi đầu tiên" },
  ],

  // Số cột mốc tương lai hiện thêm trên timeline (để không thành danh sách dài
  // ngoằng 10 năm).
  timelineFutureLimit: 4,

  copy: {
    heroLabel: "Ngày bên nhau",
    heroSubtitle: "Và vẫn đang đếm, chưa có ý định dừng lại 💗",
    heroDayOne: "Hôm nay là ngày đầu tiên",
    heroInvalid: "Chưa cài được ngày bắt đầu. Vào src/config.ts sửa giúp anh cái 🙈",
    timelineTitle: "Chuyện của hai đứa mình",
    timelineEmpty: "Chưa có cột mốc nào hết. Vào src/config.ts thêm đi 😌",
    noteTitle: "Nhắn cho anh một câu đi",
    notePlaceholder: "Nói gì cũng được, anh đọc hết 💌",
    noteButton: "Gửi",
    closingMessage: "Trang này anh làm lúc rảnh. Em là lý do anh rảnh 🙂",
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
    { emoji: "🐌", text: "Em chăm thế này anh chạy theo không kịp đâu" },
    { emoji: "🍜", text: "Cố thêm chút nữa thôi, xong việc mình đi ăn. Anh bao." },
    { emoji: "😌", text: "Anh yêu em, kể cả lúc em đang deadline" },
    { emoji: "☕", text: "Uống miếng nước đi. Em quên thì anh nhắc." },
    { emoji: "💪", text: "Em giỏi hơn em nghĩ nhiều. Anh nói thật, không phải nịnh." },
    { emoji: "🌙", text: "Hôm nay mệt thì nghỉ. Ngày mai mình làm tiếp." },
    { emoji: "🐱", text: "Em làm việc chăm quá nên anh phải lập cả trang web để nhắc em nghỉ" },
    { emoji: "🍰", text: "Xong việc rồi ăn bánh. Không xong cũng ăn bánh. Nhưng xong thì vui hơn." },
    { emoji: "📚", text: "Em là người giỏi nhất mà anh biết. Top 1. Không có top 2." },
    { emoji: "💗", text: "Yêu em. Hết. Không có nhưng." },
    { emoji: "🔥", text: "Em cứ làm việc của em đi, anh lo phần cổ vũ." },
    { emoji: "🥺", text: "Nghỉ tay 5 phút đi, anh nhớ em rồi" },
    { emoji: "🌤️", text: "Mai mốt em thành công nhớ kể anh nghe. Anh kể lại cho em." },
    { emoji: "🍀", text: "Hôm nay khó thì hôm nay khó. Mai tính. Anh vẫn ở đây." },
    { emoji: "🐣", text: "Em không cần phải hoàn hảo. Em chỉ cần là em thôi." },
    { emoji: "💌", text: "Có người đang đợi em xong việc để đi chơi. Người đó là anh." },
    { emoji: "🎧", text: "Bật nhạc lên, làm tiếp. Anh ngồi đây cổ vũ (không làm gì cả)." },
    { emoji: "🌻", text: "Em mệt thì dựa vào anh. Anh không mệt vì anh có em." },
    { emoji: "🦸", text: "Em là siêu nhân. Siêu nhân cũng cần ngủ trưa." },
    { emoji: "💐", text: "Xong việc rồi nhớ nhắn anh. Anh chờ." },
  ],

  copy: {
    eyebrow: "Một chút động lực",
    title: "Nghỉ tay một chút đi",
    subtitle: "Anh có mấy câu muốn nói",
    buttonLabel: "Cho em thêm động lực",
    empty: "Chưa có câu nào trong config. Vào src/config.ts thêm đi 😌",
    closingMessage: "Trang này anh làm để em đỡ mệt. Yêu em 💗",
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
