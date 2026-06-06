import {
  exportSourceLabels,
  formatLabReferenceRangeLabel,
  getLabRangeSourceLabel,
} from "./exportSourceLabels";
import {
  assessBloodGlucose,
  assessBloodPressure,
  assessCancerFood,
  assessLabTextValue,
  assessTemperature,
  type FoodMatch,
  type GlucoseContext,
} from "./healthRules";
import {
  cervicalCancerCareAlerts,
  cervicalCancerCareAlertRecordFields,
  cervicalCancerCareChecks,
  cervicalCancerCarePreventionGuides,
  cervicalCancerCarePriorityItems,
  cervicalCancerCarePrompts,
  cervicalCancerCareRecoveryGuides,
  cervicalCancerCareSources,
  buildCervicalCancerScreeningSummary,
  formatCervicalCancerCareAlertRecordFieldEvidence,
  formatCervicalCancerCarePriorityEvidence,
  formatCervicalCancerScreeningSummaryEvidence,
  getCervicalCancerCareSource,
  type CervicalCancerScreeningSummary,
} from "./cervicalCancerCare";
import {
  buildProfileSexStandardNotes,
  buildVitalStandardRangeSections,
  formatHealthStandardSource,
  healthStandardStatusLabel,
  isExternalHealthStandardSource,
  koreanHealthStandardApplicabilitySummary,
  koreanHealthStandardCoverage,
  koreanHealthStandardUseBoundary,
} from "./healthStandards";
import {
  normalizeQuestionPriority,
  questionPriorityLabel,
  type QuestionPriority,
} from "./questionPriority";
import { buildCareActionQueue, formatCareActionQueueLabel } from "./careActionQueue";
import {
  buildImmuneFoodSafetyContext,
  formatImmuneFoodSafetyContextText,
} from "./immuneFoodContext";
import { formatLabNoteWithSourceEvidence } from "./labSourceEvidence";
import { parseSourceEvidence } from "./sourceEvidence";
import { formatSymptomRecordLabel } from "./symptomRecordLabels";
import {
  buildVitalAssessmentEvidence,
  formatVitalAssessmentStandardLabel,
  type VitalAssessmentEvidence,
} from "./vitalAssessmentEvidence";

type DocumentReviewStatus = "needs-review" | "care-question" | "waiting-result" | "done";
type QuestionStatus = "open" | "answered" | "deferred";

export type CaregiverExportState = {
  profile: {
    name: string;
    age: string;
    sex: string;
    heightCm: string;
    weightKg: string;
    waistCm?: string;
    cancerCareMode?: boolean;
    diabetes?: boolean;
  };
  vitals: Array<{
    date: string;
    type: string;
    systolic?: number;
    diastolic?: number;
    glucoseMgDl?: number;
    glucoseContext?: GlucoseContext;
    temperatureC?: number;
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
    reviewStatus: DocumentReviewStatus;
    nextAction: string;
    attachmentName?: string;
    attachmentStatus?: string;
  }>;
  symptoms: Array<{
    date: string;
    symptom: string;
    severity: number;
    medication?: string;
    body: string;
    action: string;
  }>;
  questions: Array<{
    date: string;
    topic: string;
    question: string;
    priority?: QuestionPriority;
    status: QuestionStatus;
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
  presetDescription?: string;
  presetLabel?: string;
  redactProfile?: boolean;
  sections?: Partial<CaregiverExportSections>;
};

export type CaregiverExportContentFingerprintOptions = {
  redactProfile?: boolean;
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

export function buildCaregiverExportContentFingerprint(
  state: CaregiverExportState,
  sections: Partial<CaregiverExportSections> = {},
  options: CaregiverExportContentFingerprintOptions = {},
) {
  const enabledSections = {
    ...caregiverExportSectionDefaults,
    ...sections,
  };
  const profile = options.redactProfile
    ? {
        age: state.profile.cancerCareMode ? state.profile.age : "",
        cancerCareMode: state.profile.cancerCareMode === true,
        diabetes: enabledSections.vitals ? state.profile.diabetes === true : false,
        sex: state.profile.sex,
      }
    : state.profile;
  const latestLabResults = latestByDate(state.labResults, 5);
  const latestSymptoms = latestByDate(state.symptoms, 5);
  const latestVitals = latestByDate(state.vitals, 5);

  return JSON.stringify({
    documents: enabledSections.documents
      ? state.documents
          .filter((document) => document.reviewStatus !== "done")
          .map((document) => ({
            attachmentName: document.attachmentName,
            attachmentStatus: document.attachmentName ? document.attachmentStatus : "",
            category: document.nextAction ? "" : document.category,
            date: document.date,
            nextAction: document.nextAction,
            reviewStatus: document.reviewStatus,
            title: document.title,
          }))
      : [],
    foodQuery: enabledSections.food ? state.foodQuery?.trim() ?? "" : "",
    labResults: enabledSections.labs
      ? state.labResults.filter(
          (lab) =>
            latestLabResults.includes(lab) ||
            assessLabTextValue(lab.value, lab.lower, lab.upper).flag !== "normal",
        )
      : [],
    profile,
    questions: enabledSections.questions
      ? state.questions.filter((question) => question.status === "open")
      : [],
    symptoms: enabledSections.symptoms
      ? {
          careQueue: buildCaregiverQueueSymptomFingerprint(state.symptoms),
          recent: latestSymptoms.map(formatRecentSymptomFingerprint),
        }
      : [],
    visits: enabledSections.visits
      ? state.visits
          .filter((visit) => visit.nextDate || visit.date)
          .map((visit) => ({
            date: visit.date,
            hospital: visit.hospital,
            nextDate: visit.nextDate,
            plan: visit.plan,
            reason: visit.reason,
            summary: visit.plan ? "" : visit.summary,
          }))
      : [],
    vitals: enabledSections.vitals
      ? state.vitals.filter(
          (vital) =>
            latestVitals.includes(vital) ||
            isCaregiverQueueVital(vital, { diabetes: state.profile.diabetes }),
        )
      : [],
  });
}

export function isCaregiverExportContentFingerprintStale(
  state: CaregiverExportState,
  previewFingerprint: string | undefined,
  previewSections: Partial<CaregiverExportSections> = {},
  options: CaregiverExportContentFingerprintOptions = {},
) {
  return Boolean(
    previewFingerprint &&
      previewFingerprint !== buildCaregiverExportContentFingerprint(state, previewSections, options),
  );
}

function escapeHtml(value: string | number | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatExternalLinkHtml(url: string, label: string) {
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(
    label,
  )}</a>`;
}

function formatFoodMatchEvidenceHtml(match: FoodMatch) {
  return `${escapeHtml(match.term)} - ${escapeHtml(match.reason)} (${formatExternalLinkHtml(
    match.sourceUrl,
    match.sourceLabel,
  )})`;
}

function formatCervicalCareSourceLink(sourceId: string) {
  const source = getCervicalCancerCareSource(sourceId);
  return source
    ? `출처: ${formatExternalLinkHtml(source.url, source.label)}`
    : "출처: 공식 자궁경부암 케어 자료";
}

function formatCervicalAlertEvidenceHtml(
  item: (typeof cervicalCancerCareAlerts)[number],
) {
  return `${escapeHtml(item.title)}: ${escapeHtml(item.detail)} / 확인: ${escapeHtml(
    item.action,
  )} (${formatCervicalCareSourceLink(item.sourceId)})`;
}

function formatCervicalItemEvidenceHtml(
  item:
    | (typeof cervicalCancerCareChecks)[number]
    | (typeof cervicalCancerCareRecoveryGuides)[number]
    | (typeof cervicalCancerCarePreventionGuides)[number],
) {
  return `${escapeHtml(item.label)}: ${escapeHtml(item.detail)} (${formatCervicalCareSourceLink(
    item.sourceId,
  )})`;
}

function formatCervicalPromptEvidenceHtml(
  item: (typeof cervicalCancerCarePrompts)[number],
) {
  return `${escapeHtml(item.topic)}: ${escapeHtml(item.question)}<br><small>${formatCervicalCareSourceLink(
    item.sourceId,
  )}</small>`;
}

function formatTextWithSourceEvidenceHtml(text: string) {
  const evidence = parseSourceEvidence(text);
  const source = evidence.sourceLabel
    ? evidence.sourceUrl
      ? `근거: ${formatExternalLinkHtml(evidence.sourceUrl, evidence.sourceLabel)}`
      : `근거: ${escapeHtml(evidence.sourceLabel)}`
    : "";
  return [multilineHtml(evidence.body), source].filter(Boolean).join(" / ");
}

const sourceCitationPattern = /([^();]+?)\s*\((https?:\/\/[^\s)]+)\)/g;

function linkSourceCitationListHtml(value: string) {
  let html = "";
  let lastIndex = 0;

  for (const match of value.matchAll(sourceCitationPattern)) {
    const index = match.index ?? 0;
    const label = match[1].trim();
    const url = match[2].trim();
    html += escapeHtml(value.slice(lastIndex, index));
    html += formatExternalLinkHtml(url, label);
    lastIndex = index + match[0].length;
  }

  return html + escapeHtml(value.slice(lastIndex));
}

function formatGroundedTextHtml(text: string) {
  const evidenceIndex = text.indexOf("근거:");
  if (evidenceIndex === -1) return multilineHtml(text);

  return `${multilineHtml(text.slice(0, evidenceIndex))}근거: ${linkSourceCitationListHtml(
    text.slice(evidenceIndex + "근거:".length).trimStart(),
  )}`;
}

function formatCervicalScreeningSummaryHtml(summary: CervicalCancerScreeningSummary) {
  const sourceLinks = summary.sourceIds.map(formatCervicalCareSourceLink).join(" / ");

  return `${escapeHtml(summary.status)}: ${escapeHtml(summary.detail)}<br><small>${escapeHtml(
    summary.action,
  )} (${sourceLinks})</small>`;
}

function latestByDate<T extends { date: string }>(items: T[], limit: number) {
  return [...items].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

function formatRecentSymptomFingerprint(symptom: CaregiverExportState["symptoms"][number]) {
  return {
    action: formatTextWithSourceEvidenceHtml(symptom.action),
    body: formatTextWithSourceEvidenceHtml(symptom.body),
    date: symptom.date,
    label: formatSymptomRecordLabel(symptom),
    severity: symptom.severity,
    symptom: symptom.symptom,
  };
}

function buildCaregiverQueueSymptomFingerprint(
  symptoms: CaregiverExportState["symptoms"],
) {
  return buildCareActionQueue(
    {
      documents: [],
      labResults: [],
      questions: [],
      symptoms,
      visits: [],
      vitals: [],
    },
    "9999-12-31",
    Number.MAX_SAFE_INTEGER,
  )
    .filter((action) => action.source === "symptom")
    .map((action) => ({
      date: action.date,
      detail: action.detail,
      label: action.label,
      sortRank: action.sortRank,
      title: action.title,
      tone: action.tone,
    }));
}

function isCaregiverQueueVital(
  vital: CaregiverExportState["vitals"][number],
  options: { diabetes?: boolean } = {},
) {
  if (vital.type === "blood-pressure" && vital.systolic && vital.diastolic) {
    const level = assessBloodPressure(vital.systolic, vital.diastolic).level;
    return level !== "ok" && level !== "neutral";
  }

  if (vital.type === "glucose" && vital.glucoseMgDl) {
    const context = vital.glucoseContext ?? "random";
    const level = assessBloodGlucose(vital.glucoseMgDl, context, {
      diabetes: options.diabetes,
    }).level;
    return level !== "ok" && level !== "neutral";
  }

  if (vital.type === "temperature" && vital.temperatureC) {
    const level = assessTemperature(vital.temperatureC).level;
    return level !== "ok" && level !== "neutral";
  }

  return false;
}

function listItems(items: string[], emptyText: string) {
  if (!items.length) return `<p class="empty">${escapeHtml(emptyText)}</p>`;
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function multilineHtml(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

const glucoseContextLabel: Record<GlucoseContext, string> = {
  fasting: "공복",
  "before-meal": "식전",
  "after-meal": "식후 2시간",
  bedtime: "취침 전",
  random: "수시",
};

function formatVitalSourceHtml(evidence: VitalAssessmentEvidence) {
  if (!evidence.standard) return "";

  return evidence.standard.sourceUrl.startsWith("https://")
    ? formatExternalLinkHtml(evidence.standard.sourceUrl, evidence.standard.sourceLabel)
    : escapeHtml(evidence.standard.sourceLabel);
}

function vitalText(
  vital: CaregiverExportState["vitals"][number],
  options: { diabetes?: boolean } = {},
) {
  const evidence = buildVitalAssessmentEvidence(vital, { diabetes: options.diabetes });
  const assessment = evidence
    ? `<br><span class="source-label">${escapeHtml(
        formatVitalAssessmentStandardLabel(evidence),
      )}</span> ${escapeHtml(evidence.assessment.label)}`
    : "";
  const note = vital.note ? `<br><small>${escapeHtml(vital.note)}</small>` : "";
  const source = evidence ? formatVitalSourceHtml(evidence) : "";
  const sourceLine = source ? `<br><small>근거: ${source}</small>` : "";

  if (vital.type === "blood-pressure") {
    return `<strong>${escapeHtml(vital.date)} 혈압 ${escapeHtml(vital.systolic)}/${escapeHtml(
      vital.diastolic,
    )} mmHg</strong>${assessment}${note}${sourceLine}`;
  }
  if (vital.type === "temperature") {
    return `<strong>${escapeHtml(vital.date)} 체온 ${escapeHtml(
      vital.temperatureC,
    )}℃</strong>${assessment}${note}${sourceLine}`;
  }
  const context = vital.glucoseContext ?? "random";
  return `<strong>${escapeHtml(vital.date)} 혈당 ${escapeHtml(vital.glucoseMgDl)} mg/dL (${escapeHtml(
    glucoseContextLabel[context],
  )})</strong>${assessment}${note}${sourceLine}`;
}

const profileSexLabels: Record<string, string> = {
  female: "여성",
  male: "남성",
  other: "기타/미지정",
};

function profileSexLabel(sex: string) {
  return profileSexLabels[sex] ?? sex;
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
    : `${escapeHtml(state.profile.age)}세 · ${escapeHtml(profileSexLabel(state.profile.sex))} · ${escapeHtml(state.profile.heightCm)}cm / ${escapeHtml(state.profile.weightKg)}kg${
        state.profile.waistCm ? ` · 허리 ${escapeHtml(state.profile.waistCm)}cm` : ""
      }`;
  const coverMemo = options.coverMemo?.trim() ?? "";
  const presetLabel = options.presetLabel?.trim() ?? "";
  const presetDescription = options.presetDescription?.trim() ?? "";
  const enabledSections = {
    ...caregiverExportSectionDefaults,
    ...options.sections,
  };
  const activeQuestions = state.questions.filter((question) => question.status === "open");
  const activeDocuments = state.documents.filter((document) => document.reviewStatus !== "done");
  const foodQuery = state.foodQuery?.trim() ?? "";
  const foodAssessment = foodQuery ? assessCancerFood(foodQuery) : null;
  const immuneFoodContext =
    enabledSections.food && enabledSections.labs
      ? buildImmuneFoodSafetyContext(state.labResults)
      : null;
  const upcomingVisits = state.visits
    .filter((visit) => visit.nextDate || visit.date)
    .sort((a, b) => (a.nextDate || a.date).localeCompare(b.nextDate || b.date))
    .slice(0, 5);
  const careActions = buildCareActionQueue(
    {
      documents: enabledSections.documents ? state.documents : [],
      labResults: enabledSections.labs ? state.labResults : [],
      profile: state.profile,
      questions: enabledSections.questions ? state.questions : [],
      symptoms: enabledSections.symptoms ? state.symptoms : [],
      vitals: enabledSections.vitals ? state.vitals : [],
      visits: enabledSections.visits ? state.visits : [],
    },
    exportedAt.slice(0, 10),
    8,
  );

  const questionItems = activeQuestions.map(
    (question) => {
      const priority = normalizeQuestionPriority(question.priority);
      return `<strong>${escapeHtml(question.date)} ${escapeHtml(question.topic)}</strong><br><span class="source-label">${escapeHtml(
        questionPriorityLabel[priority],
      )}</span> ${formatTextWithSourceEvidenceHtml(question.question)}${question.answer ? `<br><small>${escapeHtml(question.answer)}</small>` : ""}`;
    },
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
      `<strong>${escapeHtml(symptom.date)} ${escapeHtml(symptom.symptom)} ${escapeHtml(symptom.severity)}/10</strong><br><span class="source-label">${escapeHtml(
        formatSymptomRecordLabel(symptom),
      )}</span> ${formatTextWithSourceEvidenceHtml(symptom.body)}${
        symptom.action ? `<br><small>${formatTextWithSourceEvidenceHtml(symptom.action)}</small>` : ""
      }`,
  );
  const labItems = latestByDate(state.labResults, 5).map(
    (lab) => {
      const assessment = assessLabTextValue(lab.value, lab.lower, lab.upper);
      const rangeSource = getLabRangeSourceLabel(lab.lower, lab.upper);
      const rangeLabel = formatLabReferenceRangeLabel(lab.lower, lab.upper, lab.unit);
      const noteEvidence = formatLabNoteWithSourceEvidence(lab.note, lab.name);
      return `<strong>${escapeHtml(lab.date)} ${escapeHtml(lab.name)} ${escapeHtml(lab.value)}${lab.unit ? ` ${escapeHtml(lab.unit)}` : ""}</strong><br><span class="source-label">${rangeSource}</span> ${escapeHtml(assessment.label)}<br>기준 ${escapeHtml(rangeLabel || "직접 확인")}${noteEvidence ? `<br><small>${formatGroundedTextHtml(noteEvidence)}</small>` : ""}`;
    },
  );
  const vitalItems = latestByDate(state.vitals, 5).map((vital) =>
    vitalText(vital, { diabetes: state.profile.diabetes }),
  );
  const careActionItems = careActions.map(
    (action) =>
      `<strong>${escapeHtml(action.date)} <span class="source-label">${escapeHtml(
        formatCareActionQueueLabel(action),
      )}</span></strong><br>${escapeHtml(action.title)}${
        action.detail ? `<br><small>${formatGroundedTextHtml(action.detail)}</small>` : ""
      }`,
  );
  const foodItems = foodAssessment || immuneFoodContext
    ? [
        `<strong>${escapeHtml(foodQuery || "면역저하 식품 안전 확인")}</strong>${
          foodAssessment
            ? `<br><span class="source-label">${exportSourceLabels.foodLocalRules}</span> ${escapeHtml(foodAssessment.label)}<br>${escapeHtml(foodAssessment.summary)}`
            : ""
        }${
          immuneFoodContext
            ? `<br><small>${formatGroundedTextHtml(formatImmuneFoodSafetyContextText(immuneFoodContext))}</small>`
            : ""
        }${
          foodAssessment?.matches.length
            ? `<br><small>근거: ${foodAssessment.matches
                .map(formatFoodMatchEvidenceHtml)
                .join("; ")}</small>`
            : ""
        }`,
      ]
    : [];
  const standardCoverageItems = koreanHealthStandardCoverage.map(
    (item) => {
      const source = isExternalHealthStandardSource(item)
        ? formatExternalLinkHtml(item.sourceUrl, item.sourceLabel)
        : escapeHtml(formatHealthStandardSource(item));
      return `<strong>${escapeHtml(item.label)}</strong><br><span class="source-label">${escapeHtml(
        healthStandardStatusLabel[item.status],
      )}</span> ${escapeHtml(item.summary)}${item.sexSpecific ? " 남녀 기준 분리." : " 남녀 공통 적용."}<br><small>적용: ${escapeHtml(
        item.sexApplicability,
      )} · 근거: ${source}</small>`;
    },
  );
  const standardRangeItems = buildVitalStandardRangeSections().map((section) => {
    const source = section.sourceUrl.startsWith("https://")
      ? formatExternalLinkHtml(section.sourceUrl, section.sourceLabel)
      : escapeHtml(section.sourceLabel);
    const lines = section.lines
      .map(
        (line) =>
          `<span class="source-label">${escapeHtml(line.label)}</span> ${escapeHtml(line.detail)}`,
      )
      .join("<br>");

    return `<strong>${escapeHtml(section.label)}</strong><br><small>근거: ${source}</small><br>${lines}`;
  });
  const standardApplicabilitySummary = koreanHealthStandardApplicabilitySummary
    .map((item) => `${item.label}: ${item.detail}`)
    .join(" · ");
  const profileSexStandardSummary = buildProfileSexStandardNotes(state.profile.sex)
    .map((item) => `${item.label}: ${item.detail}`)
    .join(" · ");
  const cervicalScreeningSummary = state.profile.cancerCareMode
    ? buildCervicalCancerScreeningSummary(state.profile)
    : null;
  const cervicalCareItems = cervicalScreeningSummary
    ? [
        `<strong>우선 확인 체크리스트</strong><br>${cervicalCancerCarePriorityItems
          .map((item) => formatGroundedTextHtml(formatCervicalCancerCarePriorityEvidence(item)))
          .join(" / ")}`,
        `<strong>검진 기준 빠른 확인</strong><br>${formatCervicalScreeningSummaryHtml(
          cervicalScreeningSummary,
        )}<br><small>${formatGroundedTextHtml(
          formatCervicalCancerScreeningSummaryEvidence(cervicalScreeningSummary),
        )}</small>`,
        `<strong>경고 신호 기록 항목</strong><br>${cervicalCancerCareAlertRecordFields
          .map((item) =>
            formatGroundedTextHtml(formatCervicalCancerCareAlertRecordFieldEvidence(item)),
          )
          .join(" / ")}`,
        `<strong>진료팀에 확인할 신호</strong><br>${cervicalCancerCareAlerts
          .map(formatCervicalAlertEvidenceHtml)
          .join(" / ")}<br><small>증상이 새로 생기거나 악화되면 기록을 진료팀에 공유하기 위한 참고 항목입니다.</small>`,
        `<strong>진료 질문 초안</strong><br>${cervicalCancerCarePrompts
          .map(formatCervicalPromptEvidenceHtml)
          .join(" / ")}`,
        `<strong>기록 체크</strong><br>${cervicalCancerCareChecks
          .map(formatCervicalItemEvidenceHtml)
          .join(" / ")}`,
        `<strong>회복 일정 메모</strong><br>${cervicalCancerCareRecoveryGuides
          .map(formatCervicalItemEvidenceHtml)
          .join(" / ")}`,
        `<strong>검진·예방 메모</strong><br>${cervicalCancerCarePreventionGuides
          .map(formatCervicalItemEvidenceHtml)
          .join(" / ")}`,
        `<strong>공식 출처</strong><br>${Object.values(cervicalCancerCareSources)
          .map((source) => formatExternalLinkHtml(source.url, source.label))
          .join("<br>")}`,
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
    h1, h2, h3, p { margin-top: 0; }
    h1 { font-size: 1.8rem; }
    h2 { font-size: 1.05rem; }
    h3 { margin-bottom: 8px; color: #23494f; font-size: 0.92rem; }
    ul { margin: 0; padding-left: 20px; }
	    li { margin: 0 0 10px; }
	    small, .meta, .empty { color: #5d6a70; }
	    .share-intent { color: #23494f; font-weight: 600; }
	    .notice { border-color: #f2c8a6; background: #fff8ee; }
    .source-label { display: inline-block; max-width: 100%; margin: 2px 6px 2px 0; padding: 2px 7px; border-radius: 999px; background: #e9f3f0; color: #2f675c; font-size: 0.72rem; font-weight: 700; line-height: 1.35; overflow-wrap: anywhere; vertical-align: middle; }
    @media print {
      @page { margin: 14mm; }
      body { background: #fff; color: #111; }
      main { max-width: none; padding: 0; }
      header, section { border-color: #b6c4c2; break-inside: avoid; page-break-inside: avoid; }
      h1 { font-size: 20pt; }
      h2 { font-size: 12pt; }
      h3 { font-size: 10pt; color: #111; }
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
      ${
        presetLabel
          ? `<p class="share-intent"><strong>공유 의도:</strong> ${escapeHtml(presetLabel)}${presetDescription ? ` · ${escapeHtml(presetDescription)}` : ""}</p>`
          : ""
      }
    </header>
    <section class="notice">
      <h2>주의</h2>
      <p>이 파일은 진료 준비와 보호자 확인을 위한 읽기 전용 요약입니다. 진단, 처방, 치료 지시가 아니며 첨부 파일 내용과 로컬 파일 경로는 포함하지 않습니다.</p>
    </section>
    <section>
      <h2>기준 적용 범위</h2>
      <p class="meta">CareVault가 자동 판정하는 항목과 입력 보조 항목을 구분합니다. 검사실 기준은 사용자가 입력한 결과지 기준을 우선합니다.</p>
      <p class="meta"><strong>기준 사용 경계:</strong> ${escapeHtml(koreanHealthStandardUseBoundary)}</p>
      <p class="meta">${escapeHtml(standardApplicabilitySummary)}</p>
      <p class="meta"><strong>현재 성별 적용:</strong> ${escapeHtml(profileSexStandardSummary)}</p>
      <h3>신체계측·혈압·혈당·신기능·전해질·지질·간기능·단백·칼슘·인산·요산·혈액·체온 숫자 범위</h3>
      ${listItems(standardRangeItems, "신체계측·혈압·혈당·신기능·전해질·지질·간기능·단백·칼슘·인산·요산·혈액·체온 숫자 범위 정보가 없습니다.")}
      <h3>적용 범위와 근거</h3>
      ${listItems(standardCoverageItems, "기준 적용 범위 정보가 없습니다.")}
    </section>
    ${
      state.profile.cancerCareMode
        ? `<section>
      <h2>자궁경부암 케어 참고</h2>
      <p class="meta">진단이나 치료 지시가 아니라, 진료 전 기록과 보호자 확인을 돕는 공식 출처 기반 참고입니다.</p>
      ${listItems(cervicalCareItems, "자궁경부암 케어 참고 정보가 없습니다.")}
    </section>`
        : ""
    }
    <section>
      <h2>진료 준비 큐</h2>
      <p class="meta">포함된 공유 섹션의 저장 기록과 프로필 기반 검진 빠른 확인에서 가져온 항목입니다. 새 진단, 처방, 치료 지시가 아닙니다.</p>
      ${listItems(careActionItems, "공유 설정에 포함된 진료 준비 항목이 없습니다.")}
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
