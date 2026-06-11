import { buildCaregiverExportHtml, type CaregiverExportState } from "./caregiverExport";
import {
  buildCareActionQueue,
  formatCareActionQueueLabel,
  type CareAction,
} from "./careActionQueue";
import {
  buildClinicalReviewPacket,
  formatClinicalReviewPacketMarkdown,
} from "./clinicalReviewPacket";
import { buildCareVaultCsv, type CsvExportState } from "./csvExport";
import {
  buildDocumentRagContext,
  buildDocumentRagProfileQuery,
  documentRagSourceBoundaryLine,
  type DocumentRagContext,
} from "./documentRagContext";
import { buildVisitPacketMarkdown, type VisitPacketState } from "./visitPacket";

export type ClinicalWorkflowReviewState =
  VisitPacketState & CsvExportState & CaregiverExportState;

export type ClinicalWorkflowReviewSurfaceId =
  | "care-action-queue"
  | "caregiver-html"
  | "clinical-source-review-packet"
  | "csv-export"
  | "document-rag-context"
  | "visit-summary-markdown";

export type ClinicalWorkflowReviewSurface = {
  containsCareBoundary: boolean;
  containsCervicalCancer: boolean;
  containsDiabetes: boolean;
  containsHypertension: boolean;
  containsParsedEvidence: boolean;
  excerpt: string;
  hasLocalPathLeak: boolean;
  id: ClinicalWorkflowReviewSurfaceId;
  label: string;
  status: "fail" | "pass";
  unsafeClinicalInstructionHits: string[];
};

export type ClinicalWorkflowReviewRequirement = {
  detail: string;
  id: string;
  label: string;
  status: "blocked" | "fail" | "pass" | "required";
};

export type ClinicalWorkflowReviewPacket = {
  careActions: CareAction[];
  documentRagContext: DocumentRagContext;
  exportedAt: string;
  query: string;
  requirements: ClinicalWorkflowReviewRequirement[];
  sourceReviewMarkdown: string;
  state: ClinicalWorkflowReviewState;
  status: "needs-external-review" | "pass" | "review-failed";
  surfaces: ClinicalWorkflowReviewSurface[];
  title: string;
  useBoundary: string;
};

export const clinicalWorkflowReviewDefaultExportedAt = "2026-06-11T12:00:00.000Z";

export const clinicalWorkflowReviewUseBoundary =
  "이 workflow review는 CareVault의 기록 정리, 문서 RAG 근거, 진료 준비 큐, export 표면을 "
  + "검토하기 위한 command-only smoke입니다. 진단, 처방, 치료 지시 또는 clinician approval이 아닙니다.";

const unsafeClinicalInstructionPatterns = [
  /진단합니다/g,
  /처방합니다/g,
  /치료합니다/g,
  /혈압약을\s*끊으세요/g,
  /인슐린\s*용량을\s*올리세요/g,
  /약(?:을)?\s*중단하세요/g,
];

const localPathPattern = /\/Users\/|[A-Za-z]:\\/;

function truncateForExcerpt(value: string, maxLength = 220) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}...`;
}

function findUnsafeClinicalInstructionHits(value: string) {
  return unsafeClinicalInstructionPatterns.flatMap((pattern) =>
    [...value.matchAll(pattern)].map((match) => match[0]),
  );
}

function buildWorkflowDocumentBody() {
  return [
    "[첨부 텍스트 파싱: care-oncology-lab.hwpx · hwarang]",
    "병리/진료 메모: 자궁경부암 SCC C53, HPV 양성, 치료 후 추적 진료 예정.",
    "활력/검사: 혈압 149/93 mmHg, HbA1c 7.4%, 공복혈당 166 mg/dL, WBC 2.8 10^3/uL, ANC 1.1 10^3/uL, PLT 128 10^3/uL, Cr 1.2 mg/dL, eGFR 58.",
    "복용 기록: 메트포르민 500mg, amlodipine 5mg. 약 변경 여부는 진료팀 확인 질문으로만 정리.",
    "원본 보관 위치 메모: /Users/wj/private-carevault/care-oncology-lab.hwpx",
  ].join("\n");
}

export function buildClinicalWorkflowReviewState(): ClinicalWorkflowReviewState {
  return {
    deletedDocuments: [],
    documents: [
      {
        attachmentName: "care-oncology-lab.hwpx",
        attachmentPath: "/Users/wj/private-carevault/care-oncology-lab.hwpx",
        attachmentStatus: "앱 sandbox copy 확인 필요",
        body: buildWorkflowDocumentBody(),
        category: "pathology",
        date: "2026-06-10",
        nextAction: "",
        reviewStatus: "care-question",
        tags: "자궁경부암,고혈압,당뇨,HWPX,검사결과",
        title: "자궁경부암 추적 진료 및 대사질환 검사 메모",
      },
    ],
    foodQuery: "훈제연어와 부드러운 치즈 섭취 전 확인",
    labResults: [
      {
        date: "2026-06-10",
        lower: "4.0",
        name: "WBC",
        note: "항암 후 검사 수치 메모. 발열이나 증상 동반 여부를 진료팀에 확인.",
        unit: "10^3/uL",
        upper: "10.0",
        value: "2.8",
      },
    ],
    profile: {
      age: "45",
      cancerCareMode: true,
      diabetes: true,
      heightCm: "162",
      hypertension: true,
      name: "Workflow Review Patient",
      sex: "female",
      waistCm: "86",
      weightKg: "69",
    },
    questions: [
      {
        answer: "",
        date: "2026-06-10",
        priority: "high",
        question:
          "자궁경부암 추적 진료에서 혈압 149/93, HbA1c 7.4%, WBC 2.8, ANC 1.1 기록을 함께 보여드리고 관리 우선순위를 확인하고 싶습니다.",
        status: "open",
        topic: "암 추적 진료와 만성질환 기록 함께 확인",
      },
    ],
    symptoms: [
      {
        action: "증상 변화와 검사 수치를 다음 진료에 공유",
        body: "치료 후 피로감과 식욕 변화가 있어 기록. 새 경고 신호 여부는 진료팀에 확인.",
        date: "2026-06-09",
        medication: "메트포르민 복용 기록만 보관",
        severity: 4,
        symptom: "치료 후 피로감",
      },
    ],
    visits: [
      {
        date: "2026-06-12",
        hospital: "암센터 외래",
        nextDate: "2026-06-26",
        plan: "추적 검사 결과와 혈압/혈당 기록을 함께 검토",
        reason: "자궁경부암 치료 후 추적",
        summary: "병리/검사 문서와 만성질환 기록 지참",
      },
    ],
    vitals: [
      {
        date: "2026-06-10",
        diastolic: 93,
        note: "가정혈압 기록, 약 변경은 진료팀 확인",
        systolic: 149,
        type: "blood-pressure",
      },
      {
        date: "2026-06-10",
        glucoseContext: "fasting",
        glucoseMgDl: 166,
        note: "공복혈당 기록",
        type: "glucose",
      },
    ],
  };
}

function serializeDocumentRagContext(context: DocumentRagContext) {
  return [
    `경계: ${clinicalWorkflowReviewUseBoundary}`,
    `보안 경계: ${documentRagSourceBoundaryLine}`,
    `검색 기준: ${context.queryLabel}`,
    `요약: ${context.summary}`,
    `근거 품질: ${context.evidenceQuality.summary}`,
    `답변 초안: ${context.answerDraft.summary}`,
    ...context.answerDraft.warnings.map((warning) => `답변 경고: ${warning}`),
    ...context.answerDraft.lines.map((line) => `답변 줄: ${line}`),
    ...context.items.flatMap((item) => [
      `문서: ${item.titleLine}`,
      `관련 이유: ${item.reasonSummary}`,
      `임상 단서: ${item.signalSummary}`,
      `문서 상태: ${item.statusSummary}`,
      `다음 조치: ${item.nextActionSummary}`,
      `파싱 원천: ${item.parserSummary}`,
      `근거 스니펫: ${item.snippet}`,
      ...item.evidenceChunks.flatMap((chunk) => [
        `근거 조각: ${chunk.label}`,
        `조각 이유: ${chunk.reasonSummary}`,
        `조각 원천: ${chunk.sourceSummary}`,
        `조각 본문: ${chunk.text}`,
      ]),
    ]),
  ].join("\n");
}

function serializeCareActionQueue(actions: CareAction[]) {
  return [
    `경계: ${clinicalWorkflowReviewUseBoundary}`,
    ...actions.map((action) =>
      [
        `${action.date}: [${formatCareActionQueueLabel(action)}] ${action.title}`,
        `tone=${action.tone}`,
        action.detail,
      ]
        .filter(Boolean)
        .join(" / "),
    ),
  ].join("\n");
}

function buildClinicalWorkflowReviewSurface(
  id: ClinicalWorkflowReviewSurfaceId,
  label: string,
  content: string,
): ClinicalWorkflowReviewSurface {
  const unsafeClinicalInstructionHits = findUnsafeClinicalInstructionHits(content);
  const hasLocalPathLeak = localPathPattern.test(content);

  return {
    containsCareBoundary: /진단[·,\s]*(?:또는\s*)?처방[·,\s]*치료 지시|진단, 처방, 치료 지시|진단·처방·치료 지시/.test(
      content,
    ),
    containsCervicalCancer: /자궁경부암|C53|HPV/i.test(content),
    containsDiabetes: /당뇨|혈당|HbA1c|당화혈색소|메트포르민|metformin/i.test(content),
    containsHypertension: /고혈압|혈압|BP|amlodipine|혈압약/i.test(content),
    containsParsedEvidence: /파싱|HWPX|hwarang|문서 RAG|근거 조각|첨부 텍스트/i.test(content),
    excerpt: truncateForExcerpt(content),
    hasLocalPathLeak,
    id,
    label,
    status: content.trim() && !hasLocalPathLeak && unsafeClinicalInstructionHits.length === 0
      ? "pass"
      : "fail",
    unsafeClinicalInstructionHits,
  };
}

function buildClinicalWorkflowReviewRequirements(
  packet: Pick<
    ClinicalWorkflowReviewPacket,
    "careActions" | "documentRagContext" | "surfaces"
  >,
) {
  const surfacesById = new Map(packet.surfaces.map((surface) => [surface.id, surface]));
  const allSurfacesPass = packet.surfaces.every((surface) => surface.status === "pass");
  const allSurfacesAvoidLocalPaths = packet.surfaces.every((surface) => !surface.hasLocalPathLeak);
  const clinicalSurfaces = [
    surfacesById.get("document-rag-context"),
    surfacesById.get("care-action-queue"),
    surfacesById.get("visit-summary-markdown"),
    surfacesById.get("csv-export"),
    surfacesById.get("caregiver-html"),
  ].filter((surface): surface is ClinicalWorkflowReviewSurface => Boolean(surface));
  const allWorkflowSurfacesCoverComorbidProfile = clinicalSurfaces.every(
    (surface) =>
      surface.containsCervicalCancer && surface.containsHypertension && surface.containsDiabetes,
  );
  const ragHasParsedEvidence = packet.documentRagContext.items.some(
    (item) => item.parsedSourceCount > 0 && item.evidenceChunks.length > 0,
  );
  const queueHasDocumentAction = packet.careActions.some((action) => action.source === "document");

  return [
    {
      detail: "Synthetic workflow profile keeps cervical-cancer, hypertension, and diabetes flags active across export surfaces.",
      id: "comorbid-profile-coverage",
      label: "cervical cancer + hypertension + diabetes workflow coverage",
      status: allWorkflowSurfacesCoverComorbidProfile ? "pass" : "fail",
    },
    {
      detail: "Parsed HWPX-style document body ranks into document RAG context with source chunks.",
      id: "parsed-document-rag",
      label: "parsed document RAG evidence",
      status: ragHasParsedEvidence ? "pass" : "fail",
    },
    {
      detail: "A saved document with no manual nextAction still becomes a care-team question in the clinic-prep queue.",
      id: "document-care-queue",
      label: "document-derived care queue",
      status: queueHasDocumentAction ? "pass" : "fail",
    },
    {
      detail: "RAG, queue, visit Markdown, CSV, caregiver HTML, and source review packet surfaces render without local path leakage or unsafe direct clinical instructions.",
      id: "surface-safety",
      label: "surface safety boundary",
      status: allSurfacesPass && allSurfacesAvoidLocalPaths ? "pass" : "fail",
    },
    {
      detail: "Review packet gives clinicians/source reviewers a deterministic input, but clinician approval is still external.",
      id: "clinician-source-review",
      label: "clinician/source review still required",
      status: "required",
    },
    {
      detail: "The private HWP/HWPX smoke harness still needs a real supplied sample path before full parser readiness can be claimed.",
      id: "private-hwp-hwpx-sample",
      label: "real private HWP/HWPX sample smoke not executed",
      status: "blocked",
    },
  ] satisfies ClinicalWorkflowReviewRequirement[];
}

function getPacketStatus(requirements: ClinicalWorkflowReviewRequirement[]) {
  if (requirements.some((requirement) => requirement.status === "fail")) return "review-failed";
  if (requirements.some((requirement) => requirement.status !== "pass")) {
    return "needs-external-review";
  }
  return "pass";
}

export function buildClinicalWorkflowReviewPacket(
  state: ClinicalWorkflowReviewState = buildClinicalWorkflowReviewState(),
  exportedAt = clinicalWorkflowReviewDefaultExportedAt,
): ClinicalWorkflowReviewPacket {
  const todayIso = exportedAt.slice(0, 10);
  const query = buildDocumentRagProfileQuery(state.profile);
  const documentRagContext = buildDocumentRagContext(state.documents, query, { maxItems: 4 });
  const careActions = buildCareActionQueue(state, todayIso, 8);
  const sourceReviewMarkdown = formatClinicalReviewPacketMarkdown(buildClinicalReviewPacket());
  const surfaces = [
    buildClinicalWorkflowReviewSurface(
      "document-rag-context",
      "Document RAG context",
      serializeDocumentRagContext(documentRagContext),
    ),
    buildClinicalWorkflowReviewSurface(
      "care-action-queue",
      "Clinic-prep care action queue",
      serializeCareActionQueue(careActions),
    ),
    buildClinicalWorkflowReviewSurface(
      "visit-summary-markdown",
      "Visit summary Markdown",
      buildVisitPacketMarkdown(state, {
        exportedAt,
        foodQuery: state.foodQuery,
        maxItems: 8,
        range: "all",
      }),
    ),
    buildClinicalWorkflowReviewSurface(
      "csv-export",
      "CSV export",
      buildCareVaultCsv(state, exportedAt),
    ),
    buildClinicalWorkflowReviewSurface(
      "caregiver-html",
      "Caregiver HTML export",
      buildCaregiverExportHtml(state, exportedAt, {
        coverMemo: "진료 전 기록 공유용 synthetic workflow review",
        redactProfile: true,
      }),
    ),
    buildClinicalWorkflowReviewSurface(
      "clinical-source-review-packet",
      "Clinical source review packet",
      sourceReviewMarkdown,
    ),
  ];
  const requirements = buildClinicalWorkflowReviewRequirements({
    careActions,
    documentRagContext,
    surfaces,
  });

  return {
    careActions,
    documentRagContext,
    exportedAt,
    query,
    requirements,
    sourceReviewMarkdown,
    state,
    status: getPacketStatus(requirements),
    surfaces,
    title: "CareVault Clinical Workflow Review Packet",
    useBoundary: clinicalWorkflowReviewUseBoundary,
  };
}

export function formatClinicalWorkflowReviewPacketMarkdown(
  packet: ClinicalWorkflowReviewPacket = buildClinicalWorkflowReviewPacket(),
) {
  return [
    `# ${packet.title}`,
    "",
    `Generated at: ${packet.exportedAt}`,
    `Status: ${packet.status}`,
    "",
    "## Use Boundary",
    packet.useBoundary,
    "",
    "## Query",
    `- ${packet.query}`,
    "",
    "## Requirements",
    ...packet.requirements.map(
      (requirement) =>
        `- ${requirement.status.toUpperCase()}: ${requirement.label} (${requirement.id}) - ${requirement.detail}`,
    ),
    "",
    "## Surface Checks",
    ...packet.surfaces.map(
      (surface) =>
        `- ${surface.status.toUpperCase()}: ${surface.label} (${surface.id}) - parsed=${surface.containsParsedEvidence}, cervical=${surface.containsCervicalCancer}, hypertension=${surface.containsHypertension}, diabetes=${surface.containsDiabetes}, boundary=${surface.containsCareBoundary}, localPathLeak=${surface.hasLocalPathLeak}, unsafeHits=${surface.unsafeClinicalInstructionHits.length}`,
    ),
    "",
    "## RAG Summary",
    `- ${packet.documentRagContext.summary}`,
    `- ${packet.documentRagContext.answerDraft.summary}`,
    "",
    "## Care Queue Summary",
    ...packet.careActions.map(
      (action) =>
        `- ${action.date}: [${formatCareActionQueueLabel(action)}] ${action.title}`,
    ),
  ].join("\n");
}
