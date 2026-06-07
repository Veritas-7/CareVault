import { describe, expect, it } from "vitest";
import { buildAppointmentReminders, type AppointmentReminderVisit } from "./appointmentReminders";

const visits: AppointmentReminderVisit[] = [
  {
    id: "visit-1",
    date: "2026-06-01",
    hospital: "서울암센터",
    reason: "항암 후 추적",
    summary: "혈액검사 예정",
    plan: "질문 정리",
    nextDate: "2026-06-05",
  },
  {
    id: "visit-2",
    date: "2026-06-02",
    hospital: "내분비내과",
    reason: "당뇨 상담",
    summary: "",
    plan: "",
    nextDate: "2026-06-20",
  },
  {
    id: "visit-3",
    date: "2026-05-20",
    hospital: "지난 진료",
    reason: "과거",
    summary: "",
    plan: "",
    nextDate: "2026-05-25",
  },
];

describe("appointmentReminders", () => {
  it("returns upcoming appointments inside the reminder window", () => {
    const reminders = buildAppointmentReminders(visits, "2026-06-03", 14);

    expect(reminders).toHaveLength(1);
    expect(reminders[0]).toMatchObject({
      id: "appointment:visit-1:2026-06-05",
      label: "2일 후",
      tone: "watch",
      title: "서울암센터",
      detail: "항암 후 추적",
    });
  });

  it("uses future visit dates when no next appointment is recorded", () => {
    const reminders = buildAppointmentReminders(
      [{ ...visits[0], id: "visit-future", date: "2026-06-10", nextDate: "" }],
      "2026-06-03",
      14,
    );

    expect(reminders[0]).toMatchObject({
      date: "2026-06-10",
      label: "7일 후",
      tone: "neutral",
    });
  });

  it("falls back to the visit date when a restored next appointment date is malformed", () => {
    const reminders = buildAppointmentReminders(
      [{ ...visits[0], id: "visit-restored-next-date", date: "2026-06-07", nextDate: "2026-13-01" }],
      "2026-06-03",
      14,
    );

    expect(reminders).toHaveLength(1);
    expect(reminders[0]).toMatchObject({
      date: "2026-06-07",
      id: "appointment:visit-restored-next-date:2026-06-07",
      label: "4일 후",
      tone: "neutral",
    });
  });

  it("returns no reminders for invalid today values", () => {
    expect(buildAppointmentReminders(visits, "not-a-date")).toEqual([]);
  });

  it("ignores calendar-rollover appointment dates", () => {
    expect(
      buildAppointmentReminders(
        [
          {
            ...visits[0],
            id: "visit-invalid-date",
            date: "2026-02-31",
            nextDate: "",
          },
        ],
        "2026-02-27",
        14,
      ),
    ).toEqual([]);
  });
});
