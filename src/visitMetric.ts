import { buildAppointmentReminders, type AppointmentReminderVisit } from "./appointmentReminders";

export type VisitPanelSummarySource = Pick<
  AppointmentReminderVisit,
  "date" | "hospital" | "id" | "nextDate" | "plan" | "reason" | "summary"
>;

export type VisitPanelSummaryItem = {
  id: string;
  label: string;
  value: string;
};

export type VisitPanelSummary = {
  ariaLabel: string;
  items: VisitPanelSummaryItem[];
  planCount: number;
  reminderWindowCount: number;
  totalCount: number;
  upcomingCount: number;
};

export type VisitAddedStatusSource = Pick<
  VisitPanelSummarySource,
  "date" | "hospital" | "nextDate" | "reason"
>;

function dateToUtcDay(dateIso: string) {
  const [year, month, day] = dateIso.split("-").map(Number);
  if (!year || !month || !day) return Number.NaN;
  return Date.UTC(year, month - 1, day);
}

export function formatVisitAddedStatus(visit: VisitAddedStatusSource) {
  const hospital = visit.hospital.trim() || "병원/과 미입력";
  const reason = visit.reason.trim() || "방문 이유 미입력";
  const date = visit.date.trim() || "날짜 미입력";
  const nextDate = visit.nextDate.trim();

  return [
    `${hospital} 방문 기록 추가됨`,
    reason,
    `방문일 ${date}`,
    nextDate ? `다음 일정 ${nextDate}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

export function buildVisitPanelSummary(
  visits: VisitPanelSummarySource[],
  todayIso: string,
  reminderWindowDays = 14,
): VisitPanelSummary {
  const today = dateToUtcDay(todayIso);
  const totalCount = visits.length;
  const upcomingCount = Number.isNaN(today)
    ? 0
    : visits.filter((visit) => {
        const date = visit.nextDate.trim() || visit.date;
        const target = dateToUtcDay(date);
        return Number.isFinite(target) && target >= today;
      }).length;
  const reminderWindowCount = buildAppointmentReminders(
    visits.map((visit) => ({ ...visit, department: undefined })),
    todayIso,
    reminderWindowDays,
  ).length;
  const planCount = visits.filter(
    (visit) => Boolean(visit.plan.trim()) || Boolean(visit.summary.trim()),
  ).length;
  const items = [
    { id: "total", label: "전체", value: `${totalCount}개` },
    {
      id: "upcoming",
      label: "다가오는 일정",
      value: upcomingCount ? `${upcomingCount}개` : "없음",
    },
    {
      id: "soon",
      label: `${reminderWindowDays}일 이내`,
      value: reminderWindowCount ? `${reminderWindowCount}개` : "없음",
    },
    {
      id: "plan",
      label: "요약/계획",
      value: planCount ? `${planCount}개` : "없음",
    },
  ];
  const ariaLabel = items.map((item) => `${item.label} ${item.value}`).join(" · ");

  return {
    ariaLabel,
    items,
    planCount,
    reminderWindowCount,
    totalCount,
    upcomingCount,
  };
}
