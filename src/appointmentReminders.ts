export type AppointmentReminderVisit = {
  id: string;
  date: string;
  hospital: string;
  department?: string;
  reason: string;
  summary: string;
  plan: string;
  nextDate: string;
};

export type AppointmentReminder = {
  id: string;
  date: string;
  daysUntil: number;
  label: string;
  tone: "watch" | "neutral";
  title: string;
  detail: string;
};

const dayMs = 24 * 60 * 60 * 1000;

function dateToUtcDay(dateIso: string) {
  const [year, month, day] = dateIso.split("-").map(Number);
  if (!year || !month || !day) return Number.NaN;
  return Date.UTC(year, month - 1, day);
}

function firstText(...values: Array<string | undefined>) {
  return values.map((value) => value?.trim()).find(Boolean) ?? "진료 전 기록 확인";
}

export function buildAppointmentReminders(
  visits: AppointmentReminderVisit[],
  todayIso: string,
  windowDays = 14,
): AppointmentReminder[] {
  const today = dateToUtcDay(todayIso);
  if (Number.isNaN(today)) return [];

  return visits
    .flatMap<AppointmentReminder>((visit) => {
      const date = visit.nextDate.trim() || visit.date;
      const target = dateToUtcDay(date);
      if (Number.isNaN(target)) return [];

      const daysUntil = Math.round((target - today) / dayMs);
      if (daysUntil < 0 || daysUntil > windowDays) return [];

      const label = daysUntil === 0 ? "오늘" : `${daysUntil}일 후`;
      const department = visit.department?.trim();
      return [
        {
          id: `appointment:${visit.id}:${date}`,
          date,
          daysUntil,
          label,
          tone: daysUntil <= 2 ? "watch" : "neutral",
          title: department ? `${visit.hospital} · ${department}` : visit.hospital,
          detail: firstText(visit.reason, visit.plan, visit.summary),
        },
      ];
    })
    .sort((left, right) => left.daysUntil - right.daysUntil || left.date.localeCompare(right.date));
}
