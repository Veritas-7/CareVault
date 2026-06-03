export type CaregiverExportState = {
  profile: {
    name: string;
    age: string;
    sex: string;
    heightCm: string;
    weightKg: string;
  };
  vitals: Array<{
    date: string;
    type: string;
    systolic?: number;
    diastolic?: number;
    glucoseMgDl?: number;
    note: string;
  }>;
  visits: Array<{
    date: string;
    hospital: string;
    reason: string;
    summary: string;
    plan: string;
    nextDate: string;
  }>;
  documents: Array<{
    date: string;
    title: string;
    category: string;
    reviewStatus: string;
    nextAction: string;
    attachmentName?: string;
    attachmentStatus?: string;
  }>;
  symptoms: Array<{
    date: string;
    symptom: string;
    severity: number;
    body: string;
    action: string;
  }>;
  questions: Array<{
    date: string;
    topic: string;
    question: string;
    status: string;
    answer: string;
  }>;
  labResults: Array<{
    date: string;
    name: string;
    value: string;
    unit: string;
    lower: string;
    upper: string;
    note: string;
  }>;
};

function escapeHtml(value: string | number | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function latestByDate<T extends { date: string }>(items: T[], limit: number) {
  return [...items].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

function listItems(items: string[], emptyText: string) {
  if (!items.length) return `<p class="empty">${escapeHtml(emptyText)}</p>`;
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function vitalText(vital: CaregiverExportState["vitals"][number]) {
  if (vital.type === "blood-pressure") {
    return `${escapeHtml(vital.date)} 혈압 ${escapeHtml(vital.systolic)}/${escapeHtml(vital.diastolic)} ${escapeHtml(vital.note)}`;
  }
  return `${escapeHtml(vital.date)} 혈당 ${escapeHtml(vital.glucoseMgDl)} mg/dL ${escapeHtml(vital.note)}`;
}

export function buildCaregiverExportHtml(
  state: CaregiverExportState,
  exportedAt: string,
) {
  const activeQuestions = state.questions.filter((question) => question.status === "open");
  const activeDocuments = state.documents.filter((document) => document.reviewStatus !== "done");
  const upcomingVisits = state.visits
    .filter((visit) => visit.nextDate || visit.date)
    .sort((a, b) => (a.nextDate || a.date).localeCompare(b.nextDate || b.date))
    .slice(0, 5);

  const questionItems = activeQuestions.map(
    (question) =>
      `<strong>${escapeHtml(question.date)} ${escapeHtml(question.topic)}</strong><br>${escapeHtml(question.question)}${question.answer ? `<br><small>${escapeHtml(question.answer)}</small>` : ""}`,
  );
  const visitItems = upcomingVisits.map(
    (visit) =>
      `<strong>${escapeHtml(visit.nextDate || visit.date)} ${escapeHtml(visit.hospital)}</strong><br>${escapeHtml(visit.reason)}${visit.plan ? `<br><small>${escapeHtml(visit.plan)}</small>` : ""}`,
  );
  const documentItems = activeDocuments.map((document) =>
    [
      `<strong>${escapeHtml(document.date)} ${escapeHtml(document.title)}</strong>`,
      escapeHtml(document.nextAction || document.category),
      document.attachmentName
        ? `<small>첨부 파일명: ${escapeHtml(document.attachmentName)} ${escapeHtml(document.attachmentStatus)}</small>`
        : "",
    ]
      .filter(Boolean)
      .join("<br>"),
  );
  const symptomItems = latestByDate(state.symptoms, 5).map(
    (symptom) =>
      `<strong>${escapeHtml(symptom.date)} ${escapeHtml(symptom.symptom)} ${escapeHtml(symptom.severity)}/10</strong><br>${escapeHtml(symptom.body)}${symptom.action ? `<br><small>${escapeHtml(symptom.action)}</small>` : ""}`,
  );
  const labItems = latestByDate(state.labResults, 5).map(
    (lab) =>
      `<strong>${escapeHtml(lab.date)} ${escapeHtml(lab.name)} ${escapeHtml(lab.value)}${lab.unit ? ` ${escapeHtml(lab.unit)}` : ""}</strong><br>기준 ${escapeHtml(lab.lower || "-")}~${escapeHtml(lab.upper || "-")} ${escapeHtml(lab.note)}`,
  );
  const vitalItems = latestByDate(state.vitals, 5).map(vitalText);

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CareVault 보호자 공유본</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #1d2528; background: #f6f8f8; }
    main { max-width: 920px; margin: 0 auto; padding: 28px; }
    header, section { margin-bottom: 16px; border: 1px solid #dce5e4; border-radius: 8px; background: #fff; padding: 18px; }
    h1, h2, p { margin-top: 0; }
    h1 { font-size: 1.8rem; }
    h2 { font-size: 1.05rem; }
    ul { margin: 0; padding-left: 20px; }
    li { margin: 0 0 10px; }
    small, .meta, .empty { color: #5d6a70; }
    .notice { border-color: #f2c8a6; background: #fff8ee; }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="meta">생성 시각: ${escapeHtml(exportedAt)}</p>
      <h1>${escapeHtml(state.profile.name)} 보호자 공유본</h1>
      <p>${escapeHtml(state.profile.age)}세 · ${escapeHtml(state.profile.sex)} · ${escapeHtml(state.profile.heightCm)}cm / ${escapeHtml(state.profile.weightKg)}kg</p>
    </header>
    <section class="notice">
      <h2>주의</h2>
      <p>이 파일은 진료 준비와 보호자 확인을 위한 읽기 전용 요약입니다. 진단, 처방, 치료 지시가 아니며 첨부 파일 내용과 로컬 파일 경로는 포함하지 않습니다.</p>
    </section>
    <section>
      <h2>다가오는 진료</h2>
      ${listItems(visitItems, "다가오는 진료 기록이 없습니다.")}
    </section>
    <section>
      <h2>열린 질문</h2>
      ${listItems(questionItems, "열린 질문이 없습니다.")}
    </section>
    <section>
      <h2>서류 조치</h2>
      ${listItems(documentItems, "진행 중인 서류 조치가 없습니다.")}
    </section>
    <section>
      <h2>최근 증상</h2>
      ${listItems(symptomItems, "증상 기록이 없습니다.")}
    </section>
    <section>
      <h2>최근 검사 수치</h2>
      ${listItems(labItems, "검사 수치 기록이 없습니다.")}
    </section>
    <section>
      <h2>최근 혈압·혈당</h2>
      ${listItems(vitalItems, "활력 기록이 없습니다.")}
    </section>
  </main>
</body>
</html>`;
}
