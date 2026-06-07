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
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso.trim());
  if (!match) return Number.NaN;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const utcDay = Date.UTC(year, month - 1, day);
  const normalized = new Date(utcDay).toISOString().slice(0, 10);

  return normalized === dateIso.trim() ? utcDay : Number.NaN;
}

function firstText(...values: Array<string | undefined>) {
  return values.map((value) => value?.trim()).find(Boolean) ?? "진료 전 기록 확인";
}

function firstValidIsoDate(...dates: string[]) {
  return dates
    .map((date) => date.trim())
    .find((date) => Number.isFinite(dateToUtcDay(date)));
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
      const date = firstValidIsoDate(visit.nextDate, visit.date);
      if (!date) return [];

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
