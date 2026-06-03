import { exportSourceLabels, getLabRangeSourceLabel } from "./exportSourceLabels";
import { assessCancerFood, assessLabValue } from "./healthRules";

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
  foodQuery?: string;
};

export type CaregiverExportSectionId =
  | "visits"
  | "questions"
  | "documents"
  | "symptoms"
  | "labs"
  | "food"
  | "vitals";

export type CaregiverExportSections = Record<CaregiverExportSectionId, boolean>;

export type CaregiverExportOptions = {
  coverMemo?: string;
  redactProfile?: boolean;
  sections?: Partial<CaregiverExportSections>;
};

export const caregiverExportSectionDefaults: CaregiverExportSections = {
  visits: true,
  questions: true,
  documents: true,
  symptoms: true,
  labs: true,
  food: true,
  vitals: true,
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

function multilineHtml(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br>");
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
  options: CaregiverExportOptions = {},
) {
  const profileTitle = options.redactProfile
    ? "CareVault 보호자 공유본"
    : `${escapeHtml(state.profile.name)} 보호자 공유본`;
  const profileSummary = options.redactProfile
    ? "프로필 식별정보 가림"
    : `${escapeHtml(state.profile.age)}세 · ${escapeHtml(state.profile.sex)} · ${escapeHtml(state.profile.heightCm)}cm / ${escapeHtml(state.profile.weightKg)}kg`;
  const coverMemo = options.coverMemo?.trim() ?? "";
  const enabledSections = {
    ...caregiverExportSectionDefaults,
    ...options.sections,
  };
  const activeQuestions = state.questions.filter((question) => question.status === "open");
  const activeDocuments = state.documents.filter((document) => document.reviewStatus !== "done");
  const foodQuery = state.foodQuery?.trim() ?? "";
  const foodAssessment = foodQuery ? assessCancerFood(foodQuery) : null;
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
      `<span class="source-label">사용자 입력 서류 조치</span> ${escapeHtml(document.nextAction || document.category)}`,
      document.attachmentName
        ? `<small><span class="source-label">${exportSourceLabels.attachmentFilenameOnly}</span> ${escapeHtml(document.attachmentName)} ${escapeHtml(document.attachmentStatus)}</small>`
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
    (lab) => {
      const assessment = assessLabValue(
        Number.parseFloat(lab.value),
        lab.lower ? Number.parseFloat(lab.lower) : undefined,
        lab.upper ? Number.parseFloat(lab.upper) : undefined,
      );
      const rangeSource = getLabRangeSourceLabel(lab.lower, lab.upper);
      return `<strong>${escapeHtml(lab.date)} ${escapeHtml(lab.name)} ${escapeHtml(lab.value)}${lab.unit ? ` ${escapeHtml(lab.unit)}` : ""}</strong><br><span class="source-label">${rangeSource}</span> ${escapeHtml(assessment.label)}<br>기준 ${escapeHtml(lab.lower || "-")}~${escapeHtml(lab.upper || "-")} ${escapeHtml(lab.note)}`;
    },
  );
  const vitalItems = latestByDate(state.vitals, 5).map(vitalText);
  const foodItems = foodAssessment
    ? [
        `<strong>${escapeHtml(foodQuery)}</strong><br><span class="source-label">${exportSourceLabels.foodLocalRules}</span> ${escapeHtml(foodAssessment.label)}<br>${escapeHtml(foodAssessment.summary)}${
          foodAssessment.matches.length
            ? `<br><small>근거: ${foodAssessment.matches
                .map((match) => `${escapeHtml(match.term)} - ${escapeHtml(match.reason)}`)
                .join("; ")}</small>`
            : ""
        }`,
      ]
    : [];
  const shareSectionItems: Array<{ id: CaregiverExportSectionId; html: string }> = [
    {
      id: "visits",
      html: `<section>
      <h2>다가오는 진료</h2>
      ${listItems(visitItems, "다가오는 진료 기록이 없습니다.")}
    </section>`,
    },
    {
      id: "questions",
      html: `<section>
      <h2>열린 질문</h2>
      ${listItems(questionItems, "열린 질문이 없습니다.")}
    </section>`,
    },
    {
      id: "documents",
      html: `<section>
      <h2>서류 조치</h2>
      ${listItems(documentItems, "진행 중인 서류 조치가 없습니다.")}
    </section>`,
    },
    {
      id: "symptoms",
      html: `<section>
      <h2>최근 증상</h2>
      ${listItems(symptomItems, "증상 기록이 없습니다.")}
    </section>`,
    },
    {
      id: "labs",
      html: `<section>
      <h2>최근 검사 수치</h2>
      ${listItems(labItems, "검사 수치 기록이 없습니다.")}
    </section>`,
    },
    {
      id: "food",
      html: `<section>
      <h2>음식 확인 메모</h2>
      ${listItems(foodItems, "음식 확인 입력이 없습니다.")}
    </section>`,
    },
    {
      id: "vitals",
      html: `<section>
      <h2>최근 혈압·혈당</h2>
      ${listItems(vitalItems, "활력 기록이 없습니다.")}
    </section>`,
    },
  ];
  const shareSections = shareSectionItems
    .filter((section) => enabledSections[section.id])
    .map((section) => section.html)
    .join("\n    ");

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
    .source-label { display: inline-block; margin: 2px 6px 2px 0; padding: 2px 7px; border-radius: 999px; background: #e9f3f0; color: #2f675c; font-size: 0.72rem; font-weight: 700; }
    @media print {
      @page { margin: 14mm; }
      body { background: #fff; color: #111; }
      main { max-width: none; padding: 0; }
      header, section { border-color: #b6c4c2; break-inside: avoid; page-break-inside: avoid; }
      h1 { font-size: 20pt; }
      h2 { font-size: 12pt; }
      .notice { background: #fff; border-color: #555; }
      .source-label { border: 1px solid #8ba19d; background: #fff; color: #111; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="meta">생성 시각: ${escapeHtml(exportedAt)}</p>
      <h1>${profileTitle}</h1>
      <p>${profileSummary}</p>
    </header>
    <section class="notice">
      <h2>주의</h2>
      <p>이 파일은 진료 준비와 보호자 확인을 위한 읽기 전용 요약입니다. 진단, 처방, 치료 지시가 아니며 첨부 파일 내용과 로컬 파일 경로는 포함하지 않습니다.</p>
    </section>
    ${
      coverMemo
        ? `<section>
      <h2>전달 메모</h2>
      <p>${multilineHtml(coverMemo)}</p>
    </section>`
        : ""
    }
    ${shareSections}
  </main>
</body>
</html>`;
}
