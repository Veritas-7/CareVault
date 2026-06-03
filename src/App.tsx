import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Apple,
  CalendarDays,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  HeartPulse,
  Hospital,
  Image as ImageIcon,
  LineChart as LineChartIcon,
  MessageSquare,
  Paperclip,
  Pill,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Unlink,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";
import {
  assessBloodGlucose,
  assessBloodPressure,
  assessCancerFood,
  assessLabValue,
  calculateBmi,
  type FoodAssessment,
  type GlucoseContext,
  type LabFlag,
} from "./healthRules";
import {
  buildLabQuestionPrompt,
  getNextQuestionDate,
  type LabQuestionSource,
} from "./labQuestionPrompts";
import { buildCareActionQueue, type CareActionSource } from "./careActionQueue";
import { isPreviewableImageAttachment } from "./attachmentPreview";
import { clearAttachmentMetadata, hasAttachmentMetadata } from "./attachmentArchive";
import { needsAttachmentRecovery } from "./attachmentRecovery";
import {
  buildSymptomSupportQuestion,
  findSymptomSupportTemplate,
} from "./symptomSupportTemplates";
import { buildAppointmentReminders } from "./appointmentReminders";
import {
  appendDocumentHistory,
  type DocumentHistoryEntry,
  type DocumentHistoryKind,
} from "./documentHistory";
import { labPresets, resolveLabPreset } from "./labPresets";
import {
  loadNormalizedMirrorStatus,
  loadNormalizedSearchSummary,
  loadPersistedState,
  type NormalizedCareVaultMirror,
  type NormalizedMirrorStatus,
  type NormalizedSearchSummary,
  savePersistedState,
  type PersistenceBackend,
} from "./storage";
import {
  buildVisitPacketMarkdown,
  visitPacketRangeLabels,
  type VisitPacketRange,
} from "./visitPacket";
import { buildCareVaultCsv } from "./csvExport";
import { buildCaregiverExportHtml } from "./caregiverExport";

type Sex = "female" | "male" | "other";
type VitalType = "blood-pressure" | "glucose";
type DocumentCategory =
  | "lab"
  | "imaging"
  | "pathology"
  | "prescription"
  | "visit-note"
  | "insurance"
  | "other";
type AttachmentStorage = "tauri-sandbox" | "browser-reference";
type DocumentReviewStatus = "needs-review" | "care-question" | "waiting-result" | "done";
type DocumentCategoryFilter = DocumentCategory | "all";
type DocumentReviewStatusFilter = DocumentReviewStatus | "all";

type Profile = {
  name: string;
  age: string;
  sex: Sex;
  heightCm: string;
  weightKg: string;
  cancerCareMode: boolean;
  diabetes: boolean;
  hypertension: boolean;
};

type VitalEntry = {
  id: string;
  date: string;
  type: VitalType;
  systolic?: number;
  diastolic?: number;
  glucoseMgDl?: number;
  glucoseContext?: GlucoseContext;
  note: string;
};

type VisitEntry = {
  id: string;
  date: string;
  hospital: string;
  reason: string;
  summary: string;
  plan: string;
  nextDate: string;
};

type CareDocument = {
  id: string;
  date: string;
  title: string;
  category: DocumentCategory;
  body: string;
  tags: string;
  reviewStatus: DocumentReviewStatus;
  nextAction: string;
  attachmentName?: string;
  attachmentPath?: string;
  attachmentStorage?: AttachmentStorage;
  attachmentStatus?: string;
  history?: DocumentHistoryEntry[];
};

type AttachmentPreviewState = {
  documentId: string;
  title: string;
  attachmentName: string;
  previewUrl: string;
  sourceLabel: string;
};

type SymptomEntry = {
  id: string;
  date: string;
  symptom: string;
  severity: number;
  medication: string;
  body: string;
  action: string;
};

type QuestionStatus = "open" | "answered" | "deferred";

type CareQuestion = {
  id: string;
  date: string;
  topic: string;
  question: string;
  status: QuestionStatus;
  answer: string;
};

type LabResult = {
  id: string;
  date: string;
  name: string;
  value: string;
  unit: string;
  lower: string;
  upper: string;
  note: string;
};

type AppState = {
  profile: Profile;
  foodQuery: string;
  vitals: VitalEntry[];
  visits: VisitEntry[];
  documents: CareDocument[];
  deletedDocuments: CareDocument[];
  symptoms: SymptomEntry[];
  questions: CareQuestion[];
  labResults: LabResult[];
};

const today = new Date().toISOString().slice(0, 10);

const defaultState: AppState = {
  profile: {
    name: "나의 건강 기록",
    age: "56",
    sex: "female",
    heightCm: "164",
    weightKg: "62",
    cancerCareMode: true,
    diabetes: true,
    hypertension: true,
  },
  foodQuery: "브로콜리, 현미밥, 베이컨, 자몽 주스",
  vitals: [
    {
      id: "bp-1",
      date: "2026-05-29",
      type: "blood-pressure",
      systolic: 132,
      diastolic: 84,
      note: "아침 안정 후 측정",
    },
    {
      id: "glu-1",
      date: "2026-05-30",
      type: "glucose",
      glucoseMgDl: 146,
      glucoseContext: "after-meal",
      note: "점심 식후 2시간",
    },
    {
      id: "bp-2",
      date: "2026-06-01",
      type: "blood-pressure",
      systolic: 126,
      diastolic: 78,
      note: "저녁 산책 후",
    },
  ],
  visits: [
    {
      id: "visit-1",
      date: "2026-06-01",
      hospital: "종양내과",
      reason: "정기 추적",
      summary: "최근 혈액검사 결과 확인. 식사량과 체중 변화를 계속 기록하기로 함.",
      plan: "2주 뒤 검사 결과 재확인",
      nextDate: "2026-06-15",
    },
  ],
  documents: [
    {
      id: "doc-1",
      date: "2026-06-01",
      title: "혈액검사 메모",
      category: "lab",
      body: "백혈구 수치와 간수치 변화를 다음 진료 때 질문할 것.",
      tags: "혈액검사,종양내과",
      reviewStatus: "care-question",
      nextAction: "백혈구 수치가 낮을 때 식사 제한 기준 질문",
      history: [
        {
          id: "history-doc-1-created",
          at: "2026-06-01T09:00:00.000Z",
          kind: "created",
          label: "서류 저장",
          detail: "혈액검사 메모 기록 생성",
        },
      ],
    },
  ],
  deletedDocuments: [],
  symptoms: [
    {
      id: "symptom-1",
      date: "2026-06-02",
      symptom: "오심",
      severity: 4,
      medication: "처방받은 항구토제 복용",
      body: "점심 이후 속이 메스꺼웠고 식사량이 줄었음.",
      action: "다음 진료 때 항구토제 조절 질문",
    },
  ],
  questions: [
    {
      id: "question-1",
      date: "2026-06-15",
      topic: "혈액검사",
      question: "백혈구 수치가 낮을 때 외식이나 날음식을 어느 정도 제한해야 하나?",
      status: "open",
      answer: "",
    },
  ],
  labResults: [
    {
      id: "lab-1",
      date: "2026-06-01",
      name: "WBC",
      value: "3.4",
      unit: "10^3/uL",
      lower: "4.0",
      upper: "10.0",
      note: "면역저하 식품 안전 질문과 연결",
    },
  ],
};

const emptyVital: VitalEntry = {
  id: "",
  date: today,
  type: "blood-pressure",
  systolic: 128,
  diastolic: 78,
  glucoseMgDl: 118,
  glucoseContext: "before-meal",
  note: "",
};

const emptyVisit: VisitEntry = {
  id: "",
  date: today,
  hospital: "",
  reason: "",
  summary: "",
  plan: "",
  nextDate: "",
};

const emptyDocument: CareDocument = {
  id: "",
  date: today,
  title: "",
  category: "lab",
  body: "",
  tags: "",
  reviewStatus: "needs-review",
  nextAction: "",
};

const emptySymptom: SymptomEntry = {
  id: "",
  date: today,
  symptom: "",
  severity: 3,
  medication: "",
  body: "",
  action: "",
};

const emptyQuestion: CareQuestion = {
  id: "",
  date: today,
  topic: "",
  question: "",
  status: "open",
  answer: "",
};

const emptyLabResult: LabResult = {
  id: "",
  date: today,
  name: "",
  value: "",
  unit: "",
  lower: "",
  upper: "",
  note: "",
};

const sexLabel: Record<Sex, string> = {
  female: "여성",
  male: "남성",
  other: "기타/미지정",
};

const documentLabel: Record<DocumentCategory, string> = {
  lab: "검사",
  imaging: "영상",
  pathology: "병리",
  prescription: "처방",
  "visit-note": "진료 메모",
  insurance: "보험/행정",
  other: "기타",
};

const attachmentStorageLabel: Record<AttachmentStorage, string> = {
  "tauri-sandbox": "앱 보관",
  "browser-reference": "파일명 참조",
};

const documentReviewStatusLabel: Record<DocumentReviewStatus, string> = {
  "needs-review": "검토 필요",
  "care-question": "의료진 질문",
  "waiting-result": "결과 대기",
  done: "정리 완료",
};

const questionStatusLabel: Record<QuestionStatus, string> = {
  open: "확인 필요",
  answered: "답변 완료",
  deferred: "보류",
};

const labFlagLabel: Record<LabFlag, string> = {
  low: "낮음",
  normal: "범위 내",
  high: "높음",
  unknown: "기준 없음",
};

const careActionSourceLabel: Record<CareActionSource, string> = {
  question: "질문",
  lab: "검사",
  document: "서류",
  visit: "방문",
};

const createId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function canUseTauriRuntime() {
  return (
    typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI__" in window)
  );
}

function extractFileName(path: string) {
  return path.split(/[\\/]/).filter(Boolean).pop() ?? path;
}

function normalizeAppState(input: Partial<AppState>): AppState {
  return {
    ...defaultState,
    ...input,
    profile: { ...defaultState.profile, ...input.profile },
    foodQuery: input.foodQuery ?? defaultState.foodQuery,
    vitals: input.vitals ?? [],
    visits: input.visits ?? [],
    documents: (input.documents ?? []).map((document) => ({
      ...document,
      reviewStatus: document.reviewStatus ?? "needs-review",
      nextAction: document.nextAction ?? "",
      history: document.history ?? [],
    })),
    deletedDocuments: (input.deletedDocuments ?? []).map((document) => ({
      ...document,
      reviewStatus: document.reviewStatus ?? "needs-review",
      nextAction: document.nextAction ?? "",
      history: document.history ?? [],
    })),
    symptoms: input.symptoms ?? [],
    questions: input.questions ?? [],
    labResults: input.labResults ?? [],
  };
}

function buildNormalizedCareVaultMirror(
  state: AppState,
  foodAssessment: FoodAssessment,
): NormalizedCareVaultMirror {
  const documents = [
    ...state.documents.map((document) => ({
      ...document,
      isDeleted: false,
    })),
    ...state.deletedDocuments.map((document) => ({
      ...document,
      isDeleted: true,
    })),
  ];

  return {
    profile: state.profile,
    vitals: state.vitals,
    visits: state.visits,
    documents,
    documentAttachments: documents
      .filter((document) => document.attachmentName?.trim())
      .map((document) => ({
        documentId: document.id,
        attachmentName: document.attachmentName ?? "",
        attachmentStorage: document.attachmentStorage,
        attachmentStatus: document.attachmentStatus,
        isDeleted: document.isDeleted,
      })),
    documentHistory: documents.flatMap((document) =>
      (document.history ?? []).map((history) => ({
        ...history,
        documentId: document.id,
        isDeleted: document.isDeleted,
      })),
    ),
    symptoms: state.symptoms,
    questions: state.questions,
    labResults: state.labResults,
    foodCheck: {
      id: "current",
      query: state.foodQuery,
      level: foodAssessment.level,
      label: foodAssessment.label,
      summary: foodAssessment.summary,
      matchesJson: JSON.stringify(foodAssessment.matches),
    },
  };
}

function App() {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [storageBackend, setStorageBackend] = useState<PersistenceBackend>("memory");
  const [normalizedMirrorStatus, setNormalizedMirrorStatus] =
    useState<NormalizedMirrorStatus | null>(null);
  const [normalizedSearchSummary, setNormalizedSearchSummary] =
    useState<NormalizedSearchSummary | null>(null);
  const [saveLabel, setSaveLabel] = useState("저장소 확인 중");
  const [vitalDraft, setVitalDraft] = useState<VitalEntry>(emptyVital);
  const [visitDraft, setVisitDraft] = useState<VisitEntry>(emptyVisit);
  const [documentDraft, setDocumentDraft] = useState<CareDocument>(emptyDocument);
  const [symptomDraft, setSymptomDraft] = useState<SymptomEntry>(emptySymptom);
  const [questionDraft, setQuestionDraft] = useState<CareQuestion>(emptyQuestion);
  const [labDraft, setLabDraft] = useState<LabResult>(emptyLabResult);
  const [documentActionBaselines, setDocumentActionBaselines] = useState<Record<string, string>>(
    {},
  );
  const [labPresetChoice, setLabPresetChoice] = useState("");
  const [visitPacketRange, setVisitPacketRange] = useState<VisitPacketRange>("30d");
  const [documentFilter, setDocumentFilter] = useState("");
  const [documentCategoryFilter, setDocumentCategoryFilter] =
    useState<DocumentCategoryFilter>("all");
  const [documentStatusFilter, setDocumentStatusFilter] =
    useState<DocumentReviewStatusFilter>("all");
  const [savedAttachmentTargetId, setSavedAttachmentTargetId] = useState<string | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<AttachmentPreviewState | null>(null);
  const [browserAttachmentPreviewUrls, setBrowserAttachmentPreviewUrls] = useState<
    Record<string, string>
  >({});
  const importInputRef = useRef<HTMLInputElement>(null);
  const documentAttachmentInputRef = useRef<HTMLInputElement>(null);
  const savedAttachmentInputRef = useRef<HTMLInputElement>(null);
  const browserAttachmentPreviewUrlsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    loadPersistedState(defaultState).then((result) => {
      if (!active) return;
      setState(normalizeAppState(result.state));
      setStorageBackend(result.backend);
      setSaveLabel(result.backend === "sqlite" ? "SQLite 저장 준비" : "브라우저 저장 준비");
      if (result.backend === "sqlite") {
        loadNormalizedMirrorStatus()
          .then(setNormalizedMirrorStatus)
          .catch(() => setNormalizedMirrorStatus(null));
      } else {
        setNormalizedMirrorStatus(null);
      }
      setHydrated(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () => () => {
      Object.values(browserAttachmentPreviewUrlsRef.current).forEach((url) =>
        URL.revokeObjectURL(url),
      );
    },
    [],
  );

  const foodAssessment = useMemo(
    () => assessCancerFood(state.foodQuery),
    [state.foodQuery],
  );

  const normalizedMirror = useMemo(
    () => buildNormalizedCareVaultMirror(state, foodAssessment),
    [foodAssessment, state],
  );

  useEffect(() => {
    if (!hydrated) return;

    const handle = window.setTimeout(() => {
      savePersistedState(state, { normalizedMirror })
        .then((backend) => {
          setStorageBackend(backend);
          setSaveLabel(backend === "sqlite" ? "SQLite 자동 저장됨" : "브라우저 자동 저장됨");
          if (backend === "sqlite") {
            return loadNormalizedMirrorStatus()
              .then(setNormalizedMirrorStatus)
              .catch(() => setNormalizedMirrorStatus(null));
          }
          setNormalizedMirrorStatus(null);
          return undefined;
        })
        .catch(() => setSaveLabel("저장 실패"));
    }, 250);

    return () => window.clearTimeout(handle);
  }, [hydrated, normalizedMirror, state]);

  useEffect(() => {
    if (!hydrated || storageBackend !== "sqlite" || !documentFilter.trim()) {
      setNormalizedSearchSummary(null);
      return;
    }

    let active = true;
    const handle = window.setTimeout(() => {
      loadNormalizedSearchSummary(documentFilter)
        .then((summary) => {
          if (active) setNormalizedSearchSummary(summary);
        })
        .catch(() => {
          if (active) setNormalizedSearchSummary(null);
        });
    }, 200);

    return () => {
      active = false;
      window.clearTimeout(handle);
    };
  }, [documentFilter, hydrated, normalizedMirrorStatus?.checkedAt, storageBackend]);

  const bmi = useMemo(
    () =>
      calculateBmi(
        Number.parseFloat(state.profile.heightCm),
        Number.parseFloat(state.profile.weightKg),
      ),
    [state.profile.heightCm, state.profile.weightKg],
  );

  const latestBp = [...state.vitals]
    .reverse()
    .find((item) => item.type === "blood-pressure" && item.systolic && item.diastolic);
  const latestGlucose = [...state.vitals]
    .reverse()
    .find((item) => item.type === "glucose" && item.glucoseMgDl);

  const bpStatus = latestBp?.systolic && latestBp?.diastolic
    ? assessBloodPressure(latestBp.systolic, latestBp.diastolic)
    : undefined;
  const glucoseStatus = latestGlucose?.glucoseMgDl
    ? assessBloodGlucose(latestGlucose.glucoseMgDl, latestGlucose.glucoseContext ?? "random")
    : undefined;
  const latestSymptom = [...state.symptoms].sort((a, b) => b.date.localeCompare(a.date))[0];
  const openQuestionCount = state.questions.filter((question) => question.status === "open").length;
  const symptomLevel =
    latestSymptom?.severity >= 7 ? "risk" : latestSymptom?.severity >= 4 ? "watch" : "ok";
  const labAssessments = state.labResults.map((result) => ({
    result,
    assessment: assessLabValue(
      Number.parseFloat(result.value),
      result.lower ? Number.parseFloat(result.lower) : undefined,
      result.upper ? Number.parseFloat(result.upper) : undefined,
    ),
  }));
  const abnormalLabCount = labAssessments.filter(({ assessment }) =>
    ["low", "high"].includes(assessment.flag),
  ).length;
  const activeDocumentActionCount = state.documents.filter(
    (document) => document.reviewStatus !== "done",
  ).length;
  const careActions = useMemo(() => buildCareActionQueue(state, today), [state, today]);
  const appointmentReminders = useMemo(
    () => buildAppointmentReminders(state.visits, today),
    [state.visits],
  );
  const symptomSupportTemplate = useMemo(
    () => findSymptomSupportTemplate(`${symptomDraft.symptom} ${symptomDraft.body}`),
    [symptomDraft.body, symptomDraft.symptom],
  );

  const chartData = [...state.vitals]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({
      date: entry.date.slice(5),
      systolic: entry.systolic,
      diastolic: entry.diastolic,
      glucose: entry.glucoseMgDl,
    }));

  const filteredDocuments = state.documents.filter((document) => {
    const categoryMatches =
      documentCategoryFilter === "all" || document.category === documentCategoryFilter;
    const statusMatches =
      documentStatusFilter === "all" || document.reviewStatus === documentStatusFilter;
    const haystack =
      `${document.date} ${documentLabel[document.category]} ${document.title} ${document.body} ${document.tags} ${document.nextAction} ${documentReviewStatusLabel[document.reviewStatus]} ${document.attachmentName ?? ""} ${document.attachmentStatus ?? ""}`.toLowerCase();
    return categoryMatches && statusMatches && haystack.includes(documentFilter.toLowerCase());
  });

  const saveProfile = (field: keyof Profile, value: Profile[keyof Profile]) => {
    setState((current) => ({
      ...current,
      profile: { ...current.profile, [field]: value },
    }));
  };

  const addVital = () => {
    setState((current) => ({
      ...current,
      vitals: [
        ...current.vitals,
        {
          ...vitalDraft,
          id: createId(vitalDraft.type === "glucose" ? "glu" : "bp"),
          systolic: vitalDraft.type === "blood-pressure" ? Number(vitalDraft.systolic) : undefined,
          diastolic: vitalDraft.type === "blood-pressure" ? Number(vitalDraft.diastolic) : undefined,
          glucoseMgDl: vitalDraft.type === "glucose" ? Number(vitalDraft.glucoseMgDl) : undefined,
        },
      ],
    }));
    setVitalDraft({ ...emptyVital, date: today });
  };

  const addVisit = () => {
    if (!visitDraft.hospital.trim() || !visitDraft.reason.trim()) return;
    setState((current) => ({
      ...current,
      visits: [...current.visits, { ...visitDraft, id: createId("visit") }],
    }));
    setVisitDraft({ ...emptyVisit, date: today });
  };

  const createDocumentHistory = (
    kind: DocumentHistoryKind,
    label: string,
    detail: string,
  ): DocumentHistoryEntry => ({
    id: createId("history"),
    at: new Date().toISOString(),
    kind,
    label,
    detail,
  });

  const addDocument = () => {
    if (!documentDraft.title.trim() || !documentDraft.body.trim()) return;
    const documentId = createId("doc");
    const createdEntry = createDocumentHistory(
      "created",
      "서류 저장",
      `${documentDraft.title.trim()} 기록 생성`,
    );
    setState((current) => ({
      ...current,
      documents: [
        ...current.documents,
        {
          ...documentDraft,
          id: documentId,
          history: appendDocumentHistory(documentDraft.history, createdEntry),
        },
      ],
    }));
    setDocumentDraft({ ...emptyDocument, date: today });
  };

  const updateDocumentReviewStatus = (
    documentId: string,
    reviewStatus: DocumentReviewStatus,
  ) => {
    setState((current) => ({
      ...current,
      documents: current.documents.map((document) => {
        if (document.id !== documentId || document.reviewStatus === reviewStatus) {
          return document;
        }

        const historyEntry = createDocumentHistory(
          "review-status",
          "상태 변경",
          `${documentReviewStatusLabel[document.reviewStatus]} → ${documentReviewStatusLabel[reviewStatus]}`,
        );
        return {
          ...document,
          reviewStatus,
          history: appendDocumentHistory(document.history, historyEntry),
        };
      }),
    }));
    setSaveLabel("서류 조치 업데이트됨");
  };

  const updateDocumentNextAction = (documentId: string, nextAction: string) => {
    setState((current) => ({
      ...current,
      documents: current.documents.map((document) =>
        document.id === documentId ? { ...document, nextAction } : document,
      ),
    }));
  };

  const recordDocumentNextActionBlur = (document: CareDocument, nextAction: string) => {
    const previous = documentActionBaselines[document.id] ?? document.nextAction;
    if (previous.trim() === nextAction.trim()) {
      setDocumentActionBaselines((current) => {
        const { [document.id]: _removed, ...rest } = current;
        return rest;
      });
      return;
    }

    const historyEntry = createDocumentHistory(
      "next-action",
      "다음 조치 변경",
      nextAction.trim() || "다음 조치 비움",
    );
    setState((current) => ({
      ...current,
      documents: current.documents.map((item) =>
        item.id === document.id
          ? { ...item, history: appendDocumentHistory(item.history, historyEntry) }
          : item,
      ),
    }));
    setDocumentActionBaselines((current) => {
      const { [document.id]: _removed, ...rest } = current;
      return rest;
    });
    setSaveLabel("서류 조치 이력 기록됨");
  };

  const attachDocumentFile = async () => {
    if (!canUseTauriRuntime()) {
      documentAttachmentInputRef.current?.click();
      return;
    }

    try {
      const [{ open }, { exists }] = await Promise.all([
        import("@tauri-apps/plugin-dialog"),
        import("@tauri-apps/plugin-fs"),
      ]);
      const selected = await open({
        multiple: false,
        directory: false,
        fileAccessMode: "copy",
        filters: [
          {
            name: "Medical documents",
            extensions: ["pdf", "png", "jpg", "jpeg", "webp", "docx", "xlsx", "csv", "txt", "md"],
          },
        ],
      });

      if (typeof selected !== "string") return;

      const attachmentExists = await exists(selected).catch(() => false);
      setDocumentDraft((current) => ({
        ...current,
        attachmentName: extractFileName(selected),
        attachmentPath: selected,
        attachmentStorage: "tauri-sandbox",
        attachmentStatus: attachmentExists ? "앱 샌드박스 복사됨" : "앱 샌드박스 경로 저장됨",
      }));
      setSaveLabel(attachmentExists ? "첨부 파일 앱 보관 준비" : "첨부 경로 저장 준비");
    } catch (error) {
      console.error("Document attachment selection failed", error);
      setSaveLabel("첨부 선택 실패. 파일명 참조 가능");
      documentAttachmentInputRef.current?.click();
    }
  };

  const attachBrowserReference = (file?: File) => {
    if (!file) return;
    setDocumentDraft((current) => ({
      ...current,
      attachmentName: file.name,
      attachmentPath: undefined,
      attachmentStorage: "browser-reference",
      attachmentStatus: "브라우저 파일명 참조",
    }));
    setSaveLabel("첨부 파일명 참조 준비");
  };

  const clearDocumentAttachment = () => {
    setDocumentDraft((current) => ({
      ...current,
      attachmentName: undefined,
      attachmentPath: undefined,
      attachmentStorage: undefined,
      attachmentStatus: undefined,
    }));
  };

  const openDocumentAttachment = async (document: CareDocument) => {
    if (!document.attachmentPath || !canUseTauriRuntime()) {
      setSaveLabel("이 첨부는 파일명 참조만 저장됨");
      return;
    }

    try {
      const [{ openPath }, { exists }] = await Promise.all([
        import("@tauri-apps/plugin-opener"),
        import("@tauri-apps/plugin-fs"),
      ]);
      const attachmentExists = await exists(document.attachmentPath).catch(() => false);
      if (!attachmentExists) {
        const status = "파일 없음 - 재첨부 필요";
        updateDocumentAttachmentStatus(document.id, status, `${document.attachmentName}: ${status}`);
        setSaveLabel(status);
        return;
      }

      await openPath(document.attachmentPath);
      setSaveLabel("첨부 파일 열기 요청됨");
    } catch (error) {
      console.error("Document attachment open failed", error);
      const status = "첨부 열기 실패 - 재첨부 필요";
      updateDocumentAttachmentStatus(document.id, status, `${document.attachmentName}: ${status}`);
      setSaveLabel(status);
    }
  };

  const updateDocumentAttachmentStatus = (
    documentId: string,
    attachmentStatus: string,
    historyDetail: string,
  ) => {
    const historyEntry = createDocumentHistory(
      "attachment-check",
      "첨부 확인",
      historyDetail,
    );
    setState((current) => ({
      ...current,
      documents: current.documents.map((document) =>
        document.id === documentId
          ? {
              ...document,
              attachmentStatus,
              history: appendDocumentHistory(document.history, historyEntry),
            }
          : document,
      ),
    }));
  };

  const checkDocumentAttachment = async (document: CareDocument) => {
    if (!document.attachmentName) return;

    if (!document.attachmentPath || !canUseTauriRuntime()) {
      const status = "파일명 참조만 저장됨";
      updateDocumentAttachmentStatus(document.id, status, `${document.attachmentName}: ${status}`);
      setSaveLabel(status);
      return;
    }

    try {
      const { exists } = await import("@tauri-apps/plugin-fs");
      const attachmentExists = await exists(document.attachmentPath).catch(() => false);
      const status = attachmentExists ? "파일 확인됨" : "파일 없음 - 재첨부 필요";
      updateDocumentAttachmentStatus(document.id, status, `${document.attachmentName}: ${status}`);
      setSaveLabel(status);
    } catch (error) {
      console.error("Document attachment check failed", error);
      const status = "첨부 확인 실패";
      updateDocumentAttachmentStatus(document.id, status, `${document.attachmentName}: ${status}`);
      setSaveLabel(status);
    }
  };

  const clearBrowserAttachmentPreviewUrl = (documentId: string) => {
    const currentUrl = browserAttachmentPreviewUrlsRef.current[documentId];
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }

    delete browserAttachmentPreviewUrlsRef.current[documentId];
    setBrowserAttachmentPreviewUrls((current) => {
      const next = { ...current };
      delete next[documentId];
      return next;
    });
  };

  const rememberBrowserAttachmentPreviewUrl = (documentId: string, file: File) => {
    clearBrowserAttachmentPreviewUrl(documentId);

    if (!isPreviewableImageAttachment(file.name)) return;

    const previewUrl = URL.createObjectURL(file);
    browserAttachmentPreviewUrlsRef.current[documentId] = previewUrl;
    setBrowserAttachmentPreviewUrls((current) => ({
      ...current,
      [documentId]: previewUrl,
    }));
  };

  const updateSavedDocumentAttachment = (
    documentId: string,
    attachment: Pick<
      CareDocument,
      "attachmentName" | "attachmentPath" | "attachmentStorage" | "attachmentStatus"
    >,
  ) => {
    const historyEntry = createDocumentHistory(
      "attachment-replaced",
      "첨부 재연결",
      `${attachment.attachmentName ?? "첨부"}: ${attachment.attachmentStatus ?? "첨부 갱신"}`,
    );

    setState((current) => ({
      ...current,
      documents: current.documents.map((document) =>
        document.id === documentId
          ? {
              ...document,
              ...attachment,
              history: appendDocumentHistory(document.history, historyEntry),
            }
          : document,
      ),
    }));
  };

  const attachBrowserReferenceToSavedDocument = (file?: File) => {
    if (!file || !savedAttachmentTargetId) return;

    rememberBrowserAttachmentPreviewUrl(savedAttachmentTargetId, file);
    updateSavedDocumentAttachment(savedAttachmentTargetId, {
      attachmentName: file.name,
      attachmentPath: undefined,
      attachmentStorage: "browser-reference",
      attachmentStatus: "브라우저 파일명 참조",
    });
    setSavedAttachmentTargetId(null);
    setSaveLabel("저장된 서류 첨부 파일명 참조 갱신");
  };

  const replaceSavedDocumentAttachment = async (document: CareDocument) => {
    if (!canUseTauriRuntime()) {
      setSavedAttachmentTargetId(document.id);
      savedAttachmentInputRef.current?.click();
      return;
    }

    try {
      const [{ open }, { exists }] = await Promise.all([
        import("@tauri-apps/plugin-dialog"),
        import("@tauri-apps/plugin-fs"),
      ]);
      const selected = await open({
        multiple: false,
        directory: false,
        fileAccessMode: "copy",
        filters: [
          {
            name: "Medical documents",
            extensions: ["pdf", "png", "jpg", "jpeg", "webp", "docx", "xlsx", "csv", "txt", "md"],
          },
        ],
      });

      if (typeof selected !== "string") return;

      const attachmentExists = await exists(selected).catch(() => false);
      const attachmentStatus = attachmentExists ? "파일 확인됨" : "앱 샌드박스 경로 저장됨";
      clearBrowserAttachmentPreviewUrl(document.id);
      updateSavedDocumentAttachment(document.id, {
        attachmentName: extractFileName(selected),
        attachmentPath: selected,
        attachmentStorage: "tauri-sandbox",
        attachmentStatus,
      });
      setSaveLabel(attachmentExists ? "저장된 서류 첨부 재연결됨" : "첨부 경로 갱신됨");
    } catch (error) {
      console.error("Saved document attachment replacement failed", error);
      setSaveLabel("저장된 서류 첨부 재연결 실패");
    }
  };

  const previewDocumentAttachment = async (document: CareDocument) => {
    if (!document.attachmentName || !isPreviewableImageAttachment(document.attachmentName)) {
      setSaveLabel("이미지 첨부만 미리보기 가능");
      return;
    }

    const browserPreviewUrl = browserAttachmentPreviewUrls[document.id];
    if (browserPreviewUrl) {
      setAttachmentPreview({
        documentId: document.id,
        title: document.title,
        attachmentName: document.attachmentName,
        previewUrl: browserPreviewUrl,
        sourceLabel: "브라우저 세션 미리보기",
      });
      setSaveLabel("이미지 미리보기 열림");
      return;
    }

    if (!document.attachmentPath || !canUseTauriRuntime()) {
      setSaveLabel("저장된 경로가 있는 이미지 첨부만 미리보기 가능");
      return;
    }

    try {
      const [{ convertFileSrc }, { exists }] = await Promise.all([
        import("@tauri-apps/api/core"),
        import("@tauri-apps/plugin-fs"),
      ]);
      const attachmentExists = await exists(document.attachmentPath).catch(() => false);
      if (!attachmentExists) {
        const status = "파일 없음 - 재첨부 필요";
        updateDocumentAttachmentStatus(document.id, status, `${document.attachmentName}: ${status}`);
        setSaveLabel(status);
        return;
      }

      setAttachmentPreview({
        documentId: document.id,
        title: document.title,
        attachmentName: document.attachmentName,
        previewUrl: convertFileSrc(document.attachmentPath),
        sourceLabel: "앱 샌드박스 이미지 미리보기",
      });
      setSaveLabel("이미지 미리보기 열림");
    } catch (error) {
      console.error("Document attachment preview failed", error);
      setSaveLabel("이미지 미리보기 실패");
    }
  };

  const removeSandboxAttachment = async (document: CareDocument) => {
    if (
      document.attachmentStorage !== "tauri-sandbox" ||
      !document.attachmentPath ||
      !canUseTauriRuntime()
    ) {
      return true;
    }

    try {
      const { exists, remove } = await import("@tauri-apps/plugin-fs");
      const attachmentExists = await exists(document.attachmentPath).catch(() => false);
      if (attachmentExists) {
        await remove(document.attachmentPath);
      }
      return true;
    } catch (error) {
      console.error("Document attachment removal failed", error);
      setSaveLabel("첨부 파일 삭제 실패");
      return false;
    }
  };

  const removeSavedDocumentAttachment = async (document: CareDocument) => {
    if (!hasAttachmentMetadata(document)) return;
    const confirmed = window.confirm(`"${document.title}" 첨부 파일 연결을 제거할까요?`);
    if (!confirmed) return;

    const removed = await removeSandboxAttachment(document);
    if (!removed) return;

    clearBrowserAttachmentPreviewUrl(document.id);
    if (attachmentPreview?.documentId === document.id) {
      setAttachmentPreview(null);
    }

    const historyEntry = createDocumentHistory(
      "attachment-removed",
      "첨부 제거",
      `${document.attachmentName} 연결 제거`,
    );
    setState((current) => ({
      ...current,
      documents: current.documents.map((item) =>
        item.id === document.id
          ? {
              ...clearAttachmentMetadata(item),
              history: appendDocumentHistory(item.history, historyEntry),
            }
          : item,
      ),
    }));
    setSaveLabel("첨부 제거됨");
  };

  const removeDeletedDocumentAttachment = async (document: CareDocument) => {
    if (!hasAttachmentMetadata(document)) return;
    const confirmed = window.confirm(
      `"${document.title}" 삭제 보관함의 첨부 연결만 정리할까요? 서류 기록은 그대로 복구할 수 있습니다.`,
    );
    if (!confirmed) return;

    const removed = await removeSandboxAttachment(document);
    if (!removed) return;

    clearBrowserAttachmentPreviewUrl(document.id);
    if (attachmentPreview?.documentId === document.id) {
      setAttachmentPreview(null);
    }

    const historyEntry = createDocumentHistory(
      "attachment-removed",
      "보관 첨부 정리",
      `${document.attachmentName} 연결 제거`,
    );
    setState((current) => ({
      ...current,
      deletedDocuments: current.deletedDocuments.map((item) =>
        item.id === document.id
          ? {
              ...clearAttachmentMetadata(item),
              history: appendDocumentHistory(item.history, historyEntry),
            }
          : item,
      ),
    }));
    setSaveLabel("삭제 보관함 첨부 정리됨");
  };

  const deleteDocument = async (document: CareDocument) => {
    const confirmed = window.confirm(`"${document.title}" 서류 기록을 삭제 보관함으로 이동할까요?`);
    if (!confirmed) return;

    clearBrowserAttachmentPreviewUrl(document.id);
    if (attachmentPreview?.documentId === document.id) {
      setAttachmentPreview(null);
    }

    const historyEntry = createDocumentHistory(
      "archived",
      "삭제 보관",
      `${document.title} 기록을 삭제 보관함으로 이동`,
    );

    setState((current) => ({
      ...current,
      documents: current.documents.filter((item) => item.id !== document.id),
      deletedDocuments: [
        {
          ...document,
          history: appendDocumentHistory(document.history, historyEntry),
        },
        ...current.deletedDocuments.filter((item) => item.id !== document.id),
      ],
    }));
    setSaveLabel("서류 기록이 삭제 보관함으로 이동됨");
  };

  const restoreDocument = (document: CareDocument) => {
    const historyEntry = createDocumentHistory(
      "restored",
      "서류 복구",
      `${document.title} 기록을 저장된 서류로 복구`,
    );

    setState((current) => ({
      ...current,
      documents: [
        {
          ...document,
          history: appendDocumentHistory(document.history, historyEntry),
        },
        ...current.documents.filter((item) => item.id !== document.id),
      ],
      deletedDocuments: current.deletedDocuments.filter((item) => item.id !== document.id),
    }));
    setSaveLabel("서류 기록 복구됨");
  };

  const addSymptom = () => {
    if (!symptomDraft.symptom.trim()) return;
    setState((current) => ({
      ...current,
      symptoms: [
        ...current.symptoms,
        {
          ...symptomDraft,
          id: createId("symptom"),
          severity: Number(symptomDraft.severity),
        },
      ],
    }));
    setSymptomDraft({ ...emptySymptom, date: today });
  };

  const addQuestion = () => {
    if (!questionDraft.topic.trim() || !questionDraft.question.trim()) return;
    setState((current) => ({
      ...current,
      questions: [...current.questions, { ...questionDraft, id: createId("question") }],
    }));
    setQuestionDraft({ ...emptyQuestion, date: today });
  };

  const applySymptomSupportTemplate = () => {
    if (!symptomSupportTemplate) return;

    setQuestionDraft((current) => ({
      ...current,
      date: getNextQuestionDate(state.visits, today),
      topic: `부작용: ${symptomSupportTemplate.label}`,
      question: buildSymptomSupportQuestion(symptomSupportTemplate, symptomDraft.symptom),
      status: "open",
    }));
    setSymptomDraft((current) => ({
      ...current,
      action: current.action.trim()
        ? current.action
        : `${symptomSupportTemplate.mealNote} ${symptomSupportTemplate.safetyNote}`,
    }));
    setSaveLabel("부작용 질문 초안 준비됨");
  };

  const applyLabPreset = (presetId: string) => {
    setLabPresetChoice(presetId);
    const preset = resolveLabPreset(presetId, state.profile.sex);
    if (!preset) return;

    setLabDraft((current) => ({
      ...current,
      name: preset.name,
      unit: preset.unit,
      lower: preset.lower,
      upper: preset.upper,
      note: current.note.trim() ? current.note : preset.note,
    }));
  };

  const addLabResult = () => {
    if (!labDraft.name.trim() || !labDraft.value.trim()) return;
    setState((current) => ({
      ...current,
      labResults: [...current.labResults, { ...labDraft, id: createId("lab") }],
    }));
    setLabDraft({ ...emptyLabResult, date: today });
    setLabPresetChoice("");
  };

  const addLabQuestion = (lab: LabQuestionSource, assessment: ReturnType<typeof assessLabValue>) => {
    setState((current) => ({
      ...current,
      questions: [
        ...current.questions,
        {
          id: createId("question"),
          date: getNextQuestionDate(current.visits, today),
          topic: "검사 수치",
          question: buildLabQuestionPrompt(lab, assessment),
          status: "open",
          answer: "",
        },
      ],
    }));
    setSaveLabel("검사 질문 추가됨");
  };

  const updateQuestionStatus = (id: string, status: QuestionStatus) => {
    setState((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === id ? { ...question, status } : question,
      ),
    }));
  };

  const storageText =
    storageBackend === "sqlite"
      ? "현재 데이터는 Tauri SQLite DB에 저장됩니다."
      : storageBackend === "localStorage"
        ? "현재 데이터는 이 기기의 브라우저 저장소에 보관됩니다."
        : "현재 데이터는 임시 메모리에만 있습니다.";

  const normalizedMirrorText =
    storageBackend === "sqlite" && normalizedMirrorStatus
      ? `정규화 mirror: 활력 ${normalizedMirrorStatus.vitalRows}개, 검사 ${normalizedMirrorStatus.labResultRows}개, 질문 ${normalizedMirrorStatus.questionRows}개, 서류 ${
          normalizedMirrorStatus.activeDocumentRows + normalizedMirrorStatus.deletedDocumentRows
        }개, 이력 ${normalizedMirrorStatus.documentHistoryRows}개, 첨부 ${normalizedMirrorStatus.documentAttachmentRows}개, 증상 ${normalizedMirrorStatus.symptomRows}개, 음식 ${normalizedMirrorStatus.foodCheckRows}개.`
      : null;

  const normalizedSearchText =
    storageBackend === "sqlite" && normalizedSearchSummary
      ? `SQLite 전체 검색: ${normalizedSearchSummary.totalRows}개 - 서류 ${normalizedSearchSummary.documentRows}, 이력 ${normalizedSearchSummary.documentHistoryRows}, 첨부 ${normalizedSearchSummary.documentAttachmentRows}, 검사 ${normalizedSearchSummary.labResultRows}, 질문 ${normalizedSearchSummary.questionRows}, 증상 ${normalizedSearchSummary.symptomRows}, 진료 ${normalizedSearchSummary.visitRows}, 활력 ${normalizedSearchSummary.vitalRows}, 음식 ${normalizedSearchSummary.foodCheckRows}`
      : null;

  const saveNow = () => {
    savePersistedState(state, { normalizedMirror })
      .then((backend) => {
        setStorageBackend(backend);
        setSaveLabel(backend === "sqlite" ? "SQLite 저장됨" : "브라우저 저장됨");
        if (backend === "sqlite") {
          return loadNormalizedMirrorStatus()
            .then(setNormalizedMirrorStatus)
            .catch(() => setNormalizedMirrorStatus(null));
        }
        setNormalizedMirrorStatus(null);
        return undefined;
      })
      .catch(() => setSaveLabel("저장 실패"));
  };

  const exportBackup = () => {
    const payload = {
      app: "CareVault",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      state,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carevault-backup-${today}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportVisitPacket = () => {
    const markdown = buildVisitPacketMarkdown(state, {
      exportedAt: new Date().toISOString(),
      foodQuery: state.foodQuery,
      range: visitPacketRange,
    });
    const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carevault-visit-summary-${today}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSaveLabel(`진료 요약 내보냄 (${visitPacketRangeLabels[visitPacketRange]})`);
  };

  const exportCsvCompanion = () => {
    const csv = buildCareVaultCsv(state, new Date().toISOString());
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carevault-records-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSaveLabel("CSV 내보냄");
  };

  const exportCaregiverHtml = () => {
    const html = buildCaregiverExportHtml(state, new Date().toISOString());
    const blob = new Blob([html], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carevault-caregiver-share-${today}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSaveLabel("보호자 공유본 내보냄");
  };

  const importBackup = (file: File | undefined) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const importedState =
          parsed && typeof parsed === "object" && "state" in parsed ? parsed.state : parsed;
        if (!importedState?.profile || !Array.isArray(importedState?.vitals)) {
          setSaveLabel("가져오기 실패");
          return;
        }
        setState(normalizeAppState(importedState));
        setSaveLabel("백업 가져옴");
      } catch {
        setSaveLabel("가져오기 실패");
      }
    };
    reader.readAsText(file);
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <HeartPulse aria-hidden="true" />
          <div>
            <strong>CareVault</strong>
            <span>로컬 건강 관리</span>
          </div>
        </div>
        <nav className="nav-stack" aria-label="앱 섹션">
          <a href="#dashboard">
            <LineChartIcon aria-hidden="true" />
            대시보드
          </a>
          <a href="#records">
            <ClipboardList aria-hidden="true" />
            입력 기록
          </a>
          <a href="#nutrition">
            <Apple aria-hidden="true" />
            음식 판단
          </a>
          <a href="#care-plan">
            <Pill aria-hidden="true" />
            증상·질문
          </a>
          <a href="#labs">
            <ClipboardList aria-hidden="true" />
            검사 수치
          </a>
          <a href="#documents">
            <FileText aria-hidden="true" />
            서류 보관
          </a>
        </nav>
        <div className="privacy-note">
          <ShieldCheck aria-hidden="true" />
          <span>
            {storageText}
            {normalizedMirrorText ? (
              <>
                <br />
                {normalizedMirrorText}
              </>
            ) : null}
          </span>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">암환자·당뇨·혈압 추적용 개인 건강 금고</p>
            <h1>{state.profile.name}</h1>
          </div>
          <div className="top-actions">
            <span>{state.profile.cancerCareMode ? "암환자 관리 모드" : "일반 관리 모드"}</span>
            <span>{saveLabel}</span>
            <button type="button" className="secondary-button" onClick={exportBackup}>
              <Download aria-hidden="true" />
              내보내기
            </button>
            <select
              className="summary-range-select"
              aria-label="진료 요약 범위"
              value={visitPacketRange}
              onChange={(event) =>
                setVisitPacketRange(event.currentTarget.value as VisitPacketRange)
              }
            >
              <option value="7d">요약 7일</option>
              <option value="30d">요약 30일</option>
              <option value="90d">요약 90일</option>
              <option value="all">요약 전체</option>
            </select>
            <button type="button" className="secondary-button" onClick={exportVisitPacket}>
              <FileText aria-hidden="true" />
              진료 요약
            </button>
            <button type="button" className="secondary-button" onClick={exportCsvCompanion}>
              <Download aria-hidden="true" />
              CSV
            </button>
            <button type="button" className="secondary-button" onClick={exportCaregiverHtml}>
              <FileText aria-hidden="true" />
              공유본
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => importInputRef.current?.click()}
            >
              <Upload aria-hidden="true" />
              가져오기
            </button>
            <input
              ref={importInputRef}
              className="visually-hidden"
              type="file"
              accept="application/json"
              onChange={(event) => importBackup(event.currentTarget.files?.[0])}
            />
            <button type="button" onClick={saveNow}>
              <Save aria-hidden="true" />
              저장
            </button>
          </div>
        </header>

        <section id="dashboard" className="metrics-grid" aria-label="핵심 지표">
          <article className="metric-card">
            <UserRound aria-hidden="true" />
            <span>프로필</span>
            <strong>
              {state.profile.age}세 · {sexLabel[state.profile.sex]}
            </strong>
            <small>
              {state.profile.heightCm}cm / {state.profile.weightKg}kg
            </small>
          </article>
          <article className={`metric-card status-${bmi.level}`}>
            <Activity aria-hidden="true" />
            <span>BMI</span>
            <strong>{bmi.value ? bmi.value.toFixed(1) : "-"}</strong>
            <small>{bmi.label}</small>
          </article>
          <article className={`metric-card status-${bpStatus?.level ?? "neutral"}`}>
            <HeartPulse aria-hidden="true" />
            <span>최근 혈압</span>
            <strong>
              {latestBp ? `${latestBp.systolic}/${latestBp.diastolic}` : "-"}
            </strong>
            <small>{bpStatus?.label ?? "입력 대기"}</small>
          </article>
          <article className={`metric-card status-${glucoseStatus?.level ?? "neutral"}`}>
            <ClipboardList aria-hidden="true" />
            <span>최근 혈당</span>
            <strong>{latestGlucose ? `${latestGlucose.glucoseMgDl} mg/dL` : "-"}</strong>
            <small>{glucoseStatus?.label ?? "입력 대기"}</small>
          </article>
          <article className={`metric-card status-${latestSymptom ? symptomLevel : "neutral"}`}>
            <Pill aria-hidden="true" />
            <span>최근 증상</span>
            <strong>{latestSymptom ? `${latestSymptom.severity}/10` : "-"}</strong>
            <small>{latestSymptom?.symptom ?? "입력 대기"}</small>
          </article>
          <article className={`metric-card status-${openQuestionCount ? "watch" : "ok"}`}>
            <MessageSquare aria-hidden="true" />
            <span>진료 질문</span>
            <strong>{openQuestionCount}개</strong>
            <small>{openQuestionCount ? "다음 진료 전 확인" : "열린 질문 없음"}</small>
          </article>
          <article className={`metric-card status-${abnormalLabCount ? "watch" : "ok"}`}>
            <ClipboardList aria-hidden="true" />
            <span>검사 추적</span>
            <strong>{abnormalLabCount}개</strong>
            <small>{abnormalLabCount ? "기준 밖 수치" : "기준 밖 수치 없음"}</small>
          </article>
          <article className={`metric-card status-${activeDocumentActionCount ? "watch" : "ok"}`}>
            <FileText aria-hidden="true" />
            <span>서류 조치</span>
            <strong>{activeDocumentActionCount}개</strong>
            <small>{activeDocumentActionCount ? "검토/질문/대기" : "정리 완료"}</small>
          </article>
        </section>

        <section className="action-queue-panel" aria-label="진료 준비 큐">
          <div className="section-title">
            <h2>진료 준비 큐</h2>
            <span>
              {careActions.length}개 확인 항목 · 예약 {appointmentReminders.length}개
            </span>
          </div>
          {appointmentReminders.length ? (
            <div className="appointment-reminder-list" aria-label="다음 예약 알림">
              {appointmentReminders.slice(0, 3).map((reminder) => (
                <article
                  className={`appointment-reminder reminder-${reminder.tone}`}
                  key={reminder.id}
                >
                  <CalendarDays aria-hidden="true" />
                  <div>
                    <span>{reminder.label}</span>
                    <strong>{reminder.title}</strong>
                    <p>{reminder.detail}</p>
                  </div>
                  <time>{reminder.date}</time>
                </article>
              ))}
            </div>
          ) : null}
          {careActions.length ? (
            <div className="action-queue-list">
              {careActions.map((action) => (
                <article className={`action-row action-${action.tone}`} key={action.id}>
                  <time>{action.date}</time>
                  <div className="action-source">
                    {action.source === "question" ? <MessageSquare aria-hidden="true" /> : null}
                    {action.source === "lab" ? <ClipboardList aria-hidden="true" /> : null}
                    {action.source === "document" ? <FileText aria-hidden="true" /> : null}
                    {action.source === "visit" ? <Hospital aria-hidden="true" /> : null}
                    <span>{careActionSourceLabel[action.source]}</span>
                  </div>
                  <div>
                    <strong>{action.title}</strong>
                    <p>{action.detail}</p>
                  </div>
                  <mark>{action.label}</mark>
                </article>
              ))}
            </div>
          ) : (
            <p className="action-empty">
              현재 열려 있는 질문, 기준 밖 검사, 서류 조치, 예정 방문이 없습니다.
            </p>
          )}
        </section>

        <section className="content-grid">
          <section className="panel profile-panel" aria-label="프로필 입력">
            <div className="section-title">
              <h2>기본 정보</h2>
              <span>위험도 해석의 기준값</span>
            </div>
            <div className="form-grid">
              <label>
                이름/대상
                <input
                  value={state.profile.name}
                  onChange={(event) => saveProfile("name", event.currentTarget.value)}
                />
              </label>
              <label>
                나이
                <input
                  type="number"
                  value={state.profile.age}
                  onChange={(event) => saveProfile("age", event.currentTarget.value)}
                />
              </label>
              <label>
                성별
                <select
                  value={state.profile.sex}
                  onChange={(event) => saveProfile("sex", event.currentTarget.value as Sex)}
                >
                  <option value="female">여성</option>
                  <option value="male">남성</option>
                  <option value="other">기타/미지정</option>
                </select>
              </label>
              <label>
                키(cm)
                <input
                  type="number"
                  value={state.profile.heightCm}
                  onChange={(event) => saveProfile("heightCm", event.currentTarget.value)}
                />
              </label>
              <label>
                몸무게(kg)
                <input
                  type="number"
                  value={state.profile.weightKg}
                  onChange={(event) => saveProfile("weightKg", event.currentTarget.value)}
                />
              </label>
            </div>
            <div className="toggle-row">
              <label>
                <input
                  type="checkbox"
                  checked={state.profile.cancerCareMode}
                  onChange={(event) => saveProfile("cancerCareMode", event.currentTarget.checked)}
                />
                암환자 관리
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={state.profile.diabetes}
                  onChange={(event) => saveProfile("diabetes", event.currentTarget.checked)}
                />
                당뇨 추적
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={state.profile.hypertension}
                  onChange={(event) => saveProfile("hypertension", event.currentTarget.checked)}
                />
                혈압 추적
              </label>
            </div>
          </section>

          <section className="panel chart-panel" aria-label="건강 추세 그래프">
            <div className="section-title">
              <h2>추세</h2>
              <span>혈압과 혈당을 날짜순으로 확인</span>
            </div>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={270}>
                <LineChart data={chartData} margin={{ left: -20, right: 18, top: 12, bottom: 8 }}>
                  <CartesianGrid stroke="#d9e2e4" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: "#526066", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#526066", fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="systolic" stroke="#1f7a8c" strokeWidth={3} dot={false} name="수축기" />
                  <Line type="monotone" dataKey="diastolic" stroke="#6d5dfc" strokeWidth={3} dot={false} name="이완기" />
                  <Line type="monotone" dataKey="glucose" stroke="#d97706" strokeWidth={3} dot={false} name="혈당" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </section>

        <section id="records" className="content-grid two-columns">
          <section className="panel">
            <div className="section-title">
              <h2>혈압·혈당 입력</h2>
              <span>날짜별 측정값</span>
            </div>
            <div className="form-grid">
              <label>
                날짜
                <input
                  type="date"
                  value={vitalDraft.date}
                  onChange={(event) => setVitalDraft({ ...vitalDraft, date: event.currentTarget.value })}
                />
              </label>
              <label>
                종류
                <select
                  value={vitalDraft.type}
                  onChange={(event) =>
                    setVitalDraft({ ...vitalDraft, type: event.currentTarget.value as VitalType })
                  }
                >
                  <option value="blood-pressure">혈압</option>
                  <option value="glucose">혈당</option>
                </select>
              </label>
              {vitalDraft.type === "blood-pressure" ? (
                <>
                  <label>
                    수축기
                    <input
                      type="number"
                      value={vitalDraft.systolic ?? ""}
                      onChange={(event) =>
                        setVitalDraft({ ...vitalDraft, systolic: Number(event.currentTarget.value) })
                      }
                    />
                  </label>
                  <label>
                    이완기
                    <input
                      type="number"
                      value={vitalDraft.diastolic ?? ""}
                      onChange={(event) =>
                        setVitalDraft({ ...vitalDraft, diastolic: Number(event.currentTarget.value) })
                      }
                    />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    혈당 mg/dL
                    <input
                      type="number"
                      value={vitalDraft.glucoseMgDl ?? ""}
                      onChange={(event) =>
                        setVitalDraft({ ...vitalDraft, glucoseMgDl: Number(event.currentTarget.value) })
                      }
                    />
                  </label>
                  <label>
                    측정 시점
                    <select
                      value={vitalDraft.glucoseContext}
                      onChange={(event) =>
                        setVitalDraft({
                          ...vitalDraft,
                          glucoseContext: event.currentTarget.value as GlucoseContext,
                        })
                      }
                    >
                      <option value="fasting">공복</option>
                      <option value="before-meal">식전</option>
                      <option value="after-meal">식후 2시간</option>
                      <option value="bedtime">취침 전</option>
                      <option value="random">무작위</option>
                    </select>
                  </label>
                </>
              )}
            </div>
            <label className="wide-label">
              메모
              <input
                value={vitalDraft.note}
                onChange={(event) => setVitalDraft({ ...vitalDraft, note: event.currentTarget.value })}
                placeholder="예: 운동 후, 약 복용 전, 식후 2시간"
              />
            </label>
            <button className="primary-button" type="button" onClick={addVital}>
              <Plus aria-hidden="true" />
              측정값 추가
            </button>
          </section>

          <section className="panel">
            <div className="section-title">
              <h2>병원 방문 기록</h2>
              <span>진료 흐름과 다음 일정</span>
            </div>
            <div className="form-grid">
              <label>
                날짜
                <input
                  type="date"
                  value={visitDraft.date}
                  onChange={(event) => setVisitDraft({ ...visitDraft, date: event.currentTarget.value })}
                />
              </label>
              <label>
                병원/과
                <input
                  value={visitDraft.hospital}
                  onChange={(event) => setVisitDraft({ ...visitDraft, hospital: event.currentTarget.value })}
                />
              </label>
              <label>
                방문 이유
                <input
                  value={visitDraft.reason}
                  onChange={(event) => setVisitDraft({ ...visitDraft, reason: event.currentTarget.value })}
                />
              </label>
              <label>
                다음 일정
                <input
                  type="date"
                  value={visitDraft.nextDate}
                  onChange={(event) => setVisitDraft({ ...visitDraft, nextDate: event.currentTarget.value })}
                />
              </label>
            </div>
            <label className="wide-label">
              진료 요약
              <textarea
                value={visitDraft.summary}
                onChange={(event) => setVisitDraft({ ...visitDraft, summary: event.currentTarget.value })}
              />
            </label>
            <label className="wide-label">
              계획/질문
              <input
                value={visitDraft.plan}
                onChange={(event) => setVisitDraft({ ...visitDraft, plan: event.currentTarget.value })}
              />
            </label>
            <button className="primary-button" type="button" onClick={addVisit}>
              <Plus aria-hidden="true" />
              방문 기록 추가
            </button>
          </section>
        </section>

        <section className="timeline-band" aria-label="최근 기록">
          <div className="section-title">
            <h2>최근 타임라인</h2>
            <span>측정·진료·서류가 한 날짜 흐름에 쌓입니다</span>
          </div>
          <div className="timeline-list">
            {[
              ...state.vitals.map((item) => ({
                id: item.id,
                date: item.date,
                icon: <Activity aria-hidden="true" />,
                title:
                  item.type === "blood-pressure"
                    ? `혈압 ${item.systolic}/${item.diastolic}`
                    : `혈당 ${item.glucoseMgDl} mg/dL`,
                detail: item.note,
              })),
              ...state.visits.map((item) => ({
                id: item.id,
                date: item.date,
                icon: <Hospital aria-hidden="true" />,
                title: `${item.hospital} · ${item.reason}`,
                detail: item.summary,
              })),
              ...state.documents.map((item) => ({
                id: item.id,
                date: item.date,
                icon: <FileText aria-hidden="true" />,
                title: `${documentLabel[item.category]} · ${item.title}`,
                detail: `${documentReviewStatusLabel[item.reviewStatus]}${item.nextAction ? ` · ${item.nextAction}` : item.tags ? ` · ${item.tags}` : ""}`,
              })),
              ...state.symptoms.map((item) => ({
                id: item.id,
                date: item.date,
                icon: <Pill aria-hidden="true" />,
                title: `증상 ${item.symptom} · ${item.severity}/10`,
                detail: item.action || item.body,
              })),
              ...state.questions.map((item) => ({
                id: item.id,
                date: item.date,
                icon: <MessageSquare aria-hidden="true" />,
                title: `질문 · ${item.topic}`,
                detail: `${questionStatusLabel[item.status]}: ${item.question}`,
              })),
              ...labAssessments.map(({ result, assessment }) => ({
                id: result.id,
                date: result.date,
                icon: <ClipboardList aria-hidden="true" />,
                title: `검사 ${result.name} · ${result.value}${result.unit ? ` ${result.unit}` : ""}`,
                detail: `${assessment.label}: ${result.note}`,
              })),
            ]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 8)
              .map((item) => (
                <article className="timeline-item" key={item.id}>
                  <time>{item.date}</time>
                  {item.icon}
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.detail || "세부 메모 없음"}</p>
                  </div>
                </article>
              ))}
          </div>
        </section>

        <section id="care-plan" className="content-grid two-columns">
          <section className="panel">
            <div className="section-title">
              <h2>증상·부작용 기록</h2>
              <span>치료 중 몸 상태를 날짜별로 누적</span>
            </div>
            <div className="form-grid">
              <label>
                날짜
                <input
                  type="date"
                  value={symptomDraft.date}
                  onChange={(event) =>
                    setSymptomDraft({ ...symptomDraft, date: event.currentTarget.value })
                  }
                />
              </label>
              <label>
                증상
                <input
                  value={symptomDraft.symptom}
                  onChange={(event) =>
                    setSymptomDraft({ ...symptomDraft, symptom: event.currentTarget.value })
                  }
                  placeholder="예: 오심, 통증, 피로, 손발저림"
                />
              </label>
            </div>
            <label className="severity-control">
              심한 정도
              <input
                type="range"
                min="0"
                max="10"
                value={symptomDraft.severity}
                onChange={(event) =>
                  setSymptomDraft({ ...symptomDraft, severity: Number(event.currentTarget.value) })
                }
              />
              <span className={`severity-value severity-${symptomDraft.severity >= 7 ? "risk" : symptomDraft.severity >= 4 ? "watch" : "ok"}`}>
                {symptomDraft.severity}/10
              </span>
            </label>
            <label className="wide-label">
              약/대응
              <input
                value={symptomDraft.medication}
                onChange={(event) =>
                  setSymptomDraft({ ...symptomDraft, medication: event.currentTarget.value })
                }
                placeholder="예: 진통제 복용, 항구토제 복용, 휴식"
              />
            </label>
            <label className="wide-label">
              몸 상태 메모
              <textarea
                value={symptomDraft.body}
                onChange={(event) =>
                  setSymptomDraft({ ...symptomDraft, body: event.currentTarget.value })
                }
                placeholder="언제 시작됐는지, 식사/수면/활동과 관련이 있는지 입력"
              />
            </label>
            <label className="wide-label">
              다음 행동
              <input
                value={symptomDraft.action}
                onChange={(event) =>
                  setSymptomDraft({ ...symptomDraft, action: event.currentTarget.value })
                }
                placeholder="예: 다음 진료 때 질문, 24시간 지속 시 전화"
              />
            </label>
            {symptomSupportTemplate ? (
              <div className="symptom-template-band" role="status">
                <div>
                  <span>{symptomSupportTemplate.label}</span>
                  <p>{symptomSupportTemplate.mealNote}</p>
                  <small>{symptomSupportTemplate.safetyNote}</small>
                </div>
                <button type="button" onClick={applySymptomSupportTemplate}>
                  <MessageSquare aria-hidden="true" />
                  질문 초안
                </button>
              </div>
            ) : null}
            <button className="primary-button" type="button" onClick={addSymptom}>
              <Plus aria-hidden="true" />
              증상 기록 추가
            </button>
          </section>

          <section className="panel">
            <div className="section-title">
              <h2>진료 전 질문</h2>
              <span>놓치기 쉬운 질문을 상태별로 관리</span>
            </div>
            <div className="form-grid">
              <label>
                진료/확인일
                <input
                  type="date"
                  value={questionDraft.date}
                  onChange={(event) =>
                    setQuestionDraft({ ...questionDraft, date: event.currentTarget.value })
                  }
                />
              </label>
              <label>
                주제
                <input
                  value={questionDraft.topic}
                  onChange={(event) =>
                    setQuestionDraft({ ...questionDraft, topic: event.currentTarget.value })
                  }
                  placeholder="예: 식단, 검사수치, 부작용"
                />
              </label>
            </div>
            <label className="wide-label">
              질문
              <textarea
                value={questionDraft.question}
                onChange={(event) =>
                  setQuestionDraft({ ...questionDraft, question: event.currentTarget.value })
                }
                placeholder="의료진에게 물어볼 내용을 그대로 입력"
              />
            </label>
            <label className="wide-label">
              답변 메모
              <input
                value={questionDraft.answer}
                onChange={(event) =>
                  setQuestionDraft({ ...questionDraft, answer: event.currentTarget.value })
                }
                placeholder="진료 후 답변을 여기에 남김"
              />
            </label>
            <button className="primary-button" type="button" onClick={addQuestion}>
              <Plus aria-hidden="true" />
              질문 추가
            </button>
            <div className="question-list">
              {[...state.questions]
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((question) => (
                  <article className="question-item" key={question.id}>
                    <div>
                      <span>{question.date}</span>
                      <strong>{question.topic}</strong>
                      <p>{question.question}</p>
                      {question.answer ? <small>{question.answer}</small> : null}
                    </div>
                    <div className="inline-actions">
                      {(["open", "answered", "deferred"] as QuestionStatus[]).map((status) => (
                        <button
                          type="button"
                          className={question.status === status ? "active" : ""}
                          onClick={() => updateQuestionStatus(question.id, status)}
                          key={status}
                        >
                          {questionStatusLabel[status]}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
            </div>
          </section>
        </section>

        <section id="labs" className="content-grid two-columns">
          <section className="panel">
            <div className="section-title">
              <h2>검사 수치 입력</h2>
              <span>검사실 기준 범위와 항암·당뇨 추적 항목을 함께 기록</span>
            </div>
            <label className="wide-label lab-preset-control">
              검사 항목 프리셋
              <select
                value={labPresetChoice}
                onChange={(event) => applyLabPreset(event.currentTarget.value)}
              >
                <option value="">직접 입력</option>
                {labPresets.map((preset) => (
                  <option value={preset.id} key={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
              <small>프리셋은 입력 보조값입니다. 실제 결과지의 검사실 기준을 우선하세요.</small>
            </label>
            <div className="form-grid">
              <label>
                날짜
                <input
                  type="date"
                  value={labDraft.date}
                  onChange={(event) => setLabDraft({ ...labDraft, date: event.currentTarget.value })}
                />
              </label>
              <label>
                항목
                <input
                  value={labDraft.name}
                  onChange={(event) => setLabDraft({ ...labDraft, name: event.currentTarget.value })}
                  placeholder="예: WBC, HbA1c, AST, ALT"
                />
              </label>
              <label>
                값
                <input
                  type="number"
                  value={labDraft.value}
                  onChange={(event) => setLabDraft({ ...labDraft, value: event.currentTarget.value })}
                />
              </label>
              <label>
                단위
                <input
                  value={labDraft.unit}
                  onChange={(event) => setLabDraft({ ...labDraft, unit: event.currentTarget.value })}
                  placeholder="예: mg/dL, 10^3/uL"
                />
              </label>
              <label>
                기준 하한
                <input
                  type="number"
                  value={labDraft.lower}
                  onChange={(event) => setLabDraft({ ...labDraft, lower: event.currentTarget.value })}
                />
              </label>
              <label>
                기준 상한
                <input
                  type="number"
                  value={labDraft.upper}
                  onChange={(event) => setLabDraft({ ...labDraft, upper: event.currentTarget.value })}
                />
              </label>
            </div>
            <label className="wide-label">
              메모
              <input
                value={labDraft.note}
                onChange={(event) => setLabDraft({ ...labDraft, note: event.currentTarget.value })}
                placeholder="예: 다음 진료 때 질문, 약 변경 후 추적"
              />
            </label>
            <button className="primary-button" type="button" onClick={addLabResult}>
              <Plus aria-hidden="true" />
              검사 수치 추가
            </button>
          </section>

          <section className="panel">
            <div className="section-title">
              <h2>검사 수치 추적</h2>
              <span>{state.labResults.length}개 기록</span>
            </div>
            <div className="lab-list">
              {labAssessments.map(({ result, assessment }) => (
                <article className="lab-item" key={result.id}>
                  <div>
                    <span>{result.date}</span>
                    <strong>
                      {result.name} {result.value}
                      {result.unit ? ` ${result.unit}` : ""}
                    </strong>
                    <p>
                      기준 {result.lower || "-"} - {result.upper || "-"} {result.unit}
                    </p>
                    {result.note ? <small>{result.note}</small> : null}
                    {assessment.flag !== "normal" ? (
                      <div className="lab-followup-actions">
                        <button
                          className="secondary-inline-button"
                          type="button"
                          onClick={() => addLabQuestion(result, assessment)}
                        >
                          <MessageSquare aria-hidden="true" />
                          질문으로 추가
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <mark className={`lab-${assessment.flag}`}>
                    {labFlagLabel[assessment.flag]}
                  </mark>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section id="nutrition" className="panel nutrition-panel">
          <div className="section-title">
            <h2>암환자 음식 판단</h2>
            <span>치료가 아니라 근거 기반 주의·기록 도구</span>
          </div>
          <div className="nutrition-layout">
            <label className="wide-label">
              음식 또는 식단 입력
              <textarea
                value={state.foodQuery}
                onChange={(event) => {
                  const foodQuery = event.currentTarget.value;
                  setState((current) => ({
                    ...current,
                    foodQuery,
                  }));
                }}
                placeholder="예: 두부, 블루베리, 소시지, 술, 생굴"
              />
            </label>
            <div className={`food-verdict verdict-${foodAssessment.level}`}>
              <Apple aria-hidden="true" />
              <strong>{foodAssessment.label}</strong>
              <p>{foodAssessment.summary}</p>
            </div>
          </div>
          <div className="food-chip-row">
            {foodAssessment.matches.map((match) => (
              <span className={`food-chip ${match.level}`} key={`${match.term}-${match.level}`}>
                {match.term}: {match.reason}
              </span>
            ))}
          </div>
          <p className="medical-disclaimer">
            <AlertTriangle aria-hidden="true" />
            항암·수술·면역저하 상태에서는 음식 안전 기준이 달라질 수 있습니다. 보충제, 극단 식단,
            자몽/약물 상호작용이 의심되는 음식은 의료진에게 확인해야 합니다.
          </p>
        </section>

        <section id="documents" className="content-grid two-columns">
          <section className="panel">
            <div className="section-title">
              <h2>일자별 서류 수기 보관</h2>
              <span>검사·영상·병리·처방 내용을 텍스트로 누적</span>
            </div>
            <div className="form-grid">
              <label>
                날짜
                <input
                  type="date"
                  value={documentDraft.date}
                  onChange={(event) =>
                    setDocumentDraft({ ...documentDraft, date: event.currentTarget.value })
                  }
                />
              </label>
              <label>
                분류
                <select
                  value={documentDraft.category}
                  onChange={(event) =>
                    setDocumentDraft({
                      ...documentDraft,
                      category: event.currentTarget.value as DocumentCategory,
                    })
                  }
                >
                  {Object.entries(documentLabel).map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                서류 검토 상태
                <select
                  value={documentDraft.reviewStatus}
                  onChange={(event) =>
                    setDocumentDraft({
                      ...documentDraft,
                      reviewStatus: event.currentTarget.value as DocumentReviewStatus,
                    })
                  }
                >
                  {Object.entries(documentReviewStatusLabel).map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="wide-label">
              제목
              <input
                value={documentDraft.title}
                onChange={(event) =>
                  setDocumentDraft({ ...documentDraft, title: event.currentTarget.value })
                }
                placeholder="예: 6월 혈액검사 결과"
              />
            </label>
            <label className="wide-label">
              내용
              <textarea
                value={documentDraft.body}
                onChange={(event) =>
                  setDocumentDraft({ ...documentDraft, body: event.currentTarget.value })
                }
                placeholder="검사 수치, 의사 설명, 다음 질문을 그대로 입력"
              />
            </label>
            <label className="wide-label">
              다음 조치
              <input
                value={documentDraft.nextAction}
                onChange={(event) =>
                  setDocumentDraft({ ...documentDraft, nextAction: event.currentTarget.value })
                }
                placeholder="예: 다음 진료 때 간수치 변화 기준 질문"
              />
            </label>
            <label className="wide-label">
              태그
              <input
                value={documentDraft.tags}
                onChange={(event) =>
                  setDocumentDraft({ ...documentDraft, tags: event.currentTarget.value })
                }
                placeholder="예: 혈액검사,항암,부작용"
              />
            </label>
            <div className="attachment-panel">
              <input
                ref={documentAttachmentInputRef}
                className="visually-hidden"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx,.csv,.txt,.md"
                onChange={(event) => {
                  attachBrowserReference(event.currentTarget.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
              <div className="attachment-actions">
                <button className="secondary-inline-button" type="button" onClick={attachDocumentFile}>
                  <Paperclip aria-hidden="true" />
                  첨부 파일 선택
                </button>
                {documentDraft.attachmentName ? (
                  <button className="text-icon-button" type="button" onClick={clearDocumentAttachment}>
                    <X aria-hidden="true" />
                    제거
                  </button>
                ) : null}
              </div>
              {documentDraft.attachmentName ? (
                <div className="attachment-summary">
                  <FileText aria-hidden="true" />
                  <span>{documentDraft.attachmentName}</span>
                  <small>
                    {documentDraft.attachmentStorage
                      ? attachmentStorageLabel[documentDraft.attachmentStorage]
                      : "첨부"}
                  </small>
                </div>
              ) : (
                <p className="attachment-empty">첨부 없음</p>
              )}
            </div>
            <button className="primary-button" type="button" onClick={addDocument}>
              <Plus aria-hidden="true" />
              서류 메모 저장
            </button>
          </section>

          <section className="panel document-list-panel">
            <div className="section-title">
              <h2>저장된 서류</h2>
              <span>
                {filteredDocuments.length}/{state.documents.length}개 기록
              </span>
            </div>
            <input
              ref={savedAttachmentInputRef}
              className="visually-hidden"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx,.csv,.txt,.md"
              onChange={(event) => {
                attachBrowserReferenceToSavedDocument(event.currentTarget.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
            <label className="search-field">
              <Search aria-hidden="true" />
              <input
                value={documentFilter}
                onChange={(event) => setDocumentFilter(event.currentTarget.value)}
                placeholder="날짜, 분류, 제목, 내용, 태그 검색"
              />
            </label>
            {normalizedSearchText ? (
              <p className="normalized-search-note">{normalizedSearchText}</p>
            ) : null}
            <div className="document-filter-row">
              <label>
                분류 필터
                <select
                  value={documentCategoryFilter}
                  onChange={(event) =>
                    setDocumentCategoryFilter(event.currentTarget.value as DocumentCategoryFilter)
                  }
                >
                  <option value="all">전체 분류</option>
                  {Object.entries(documentLabel).map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                상태 필터
                <select
                  value={documentStatusFilter}
                  onChange={(event) =>
                    setDocumentStatusFilter(
                      event.currentTarget.value as DocumentReviewStatusFilter,
                    )
                  }
                >
                  <option value="all">전체 상태</option>
                  {Object.entries(documentReviewStatusLabel).map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="document-list">
              {filteredDocuments.map((document) => (
                <article className="document-item" key={document.id}>
                  <div>
                    <span>{document.date}</span>
                    <div className="document-status-row">
                      <mark>{documentLabel[document.category]}</mark>
                      <small className={`status-chip review-${document.reviewStatus}`}>
                        {documentReviewStatusLabel[document.reviewStatus]}
                      </small>
                    </div>
                    <strong>{document.title}</strong>
                    <p>{document.body}</p>
                    <div
                      className="document-update-controls"
                      aria-label={`${document.title} 서류 조치 수정`}
                    >
                      <label>
                        상태
                        <select
                          aria-label={`${document.title} 검토 상태`}
                          value={document.reviewStatus}
                          onChange={(event) =>
                            updateDocumentReviewStatus(
                              document.id,
                              event.currentTarget.value as DocumentReviewStatus,
                            )
                          }
                        >
                          {Object.entries(documentReviewStatusLabel).map(([value, label]) => (
                            <option value={value} key={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        다음 조치
                        <input
                          aria-label={`${document.title} 다음 조치`}
                          value={document.nextAction}
                          onFocus={() =>
                            setDocumentActionBaselines((current) => ({
                              ...current,
                              [document.id]: document.nextAction,
                            }))
                          }
                          onChange={(event) =>
                            updateDocumentNextAction(document.id, event.currentTarget.value)
                          }
                          onBlur={(event) =>
                            recordDocumentNextActionBlur(document, event.currentTarget.value)
                          }
                          placeholder="다음 진료 때 확인할 내용"
                        />
                      </label>
                    </div>
                    {document.history?.length ? (
                      <div className="document-history" aria-label={`${document.title} 변경 이력`}>
                        <span>변경 이력</span>
                        <ol>
                          {[...document.history]
                            .slice(-3)
                            .reverse()
                            .map((entry) => (
                              <li key={entry.id}>
                                <time>{entry.at.slice(0, 10)}</time>
                                <strong>{entry.label}</strong>
                                <small>{entry.detail}</small>
                              </li>
                            ))}
                        </ol>
                      </div>
                    ) : null}
                    {document.attachmentName ? (
                      <div className="document-attachment">
                        <Paperclip aria-hidden="true" />
                        <span>{document.attachmentName}</span>
                        <small>
                          {document.attachmentStorage
                            ? attachmentStorageLabel[document.attachmentStorage]
                            : "첨부"}
                        </small>
                        {document.attachmentStatus ? (
                          <small className="attachment-status">{document.attachmentStatus}</small>
                        ) : null}
                      </div>
                    ) : null}
                    {needsAttachmentRecovery(document.attachmentStatus) ? (
                      <div className="attachment-recovery" role="status">
                        <AlertTriangle aria-hidden="true" />
                        <span>첨부 원본을 찾거나 열 수 없습니다. 재첨부로 새 복사본을 연결하세요.</span>
                      </div>
                    ) : null}
                  </div>
                  <div className="document-actions">
                    <button type="button" onClick={() => replaceSavedDocumentAttachment(document)}>
                      <Upload aria-hidden="true" />
                      {document.attachmentName ? "재첨부" : "첨부"}
                    </button>
                    {document.attachmentName ? (
                      <button type="button" onClick={() => checkDocumentAttachment(document)}>
                        <ShieldCheck aria-hidden="true" />
                        첨부 확인
                      </button>
                    ) : null}
                    {document.attachmentName &&
                    isPreviewableImageAttachment(document.attachmentName) ? (
                      <button type="button" onClick={() => previewDocumentAttachment(document)}>
                        <ImageIcon aria-hidden="true" />
                        미리보기
                      </button>
                    ) : null}
                    {document.attachmentPath ? (
                      <button type="button" onClick={() => openDocumentAttachment(document)}>
                        <ExternalLink aria-hidden="true" />
                        열기
                      </button>
                    ) : null}
                    {document.attachmentName ? (
                      <button type="button" onClick={() => removeSavedDocumentAttachment(document)}>
                        <Unlink aria-hidden="true" />
                        첨부 제거
                      </button>
                    ) : null}
                    <button
                      className="danger-action"
                      type="button"
                      onClick={() => deleteDocument(document)}
                    >
                      <Trash2 aria-hidden="true" />
                      삭제
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {state.deletedDocuments.length ? (
              <div className="deleted-document-panel" aria-label="삭제 보관함">
                <div className="deleted-document-title">
                  <strong>삭제 보관함</strong>
                  <span>{state.deletedDocuments.length}개 복구 가능</span>
                </div>
                <div className="deleted-document-list">
                  {state.deletedDocuments.slice(0, 5).map((document) => (
                    <article className="deleted-document-item" key={document.id}>
                      <div>
                        <span>{document.date}</span>
                        <strong>{document.title}</strong>
                        <small>{documentLabel[document.category]}</small>
                        {hasAttachmentMetadata(document) ? (
                          <small>첨부 보관: {document.attachmentName}</small>
                        ) : null}
                      </div>
                      <div className="deleted-document-actions">
                        <button type="button" onClick={() => restoreDocument(document)}>
                          <RotateCcw aria-hidden="true" />
                          복구
                        </button>
                        {hasAttachmentMetadata(document) ? (
                          <button type="button" onClick={() => removeDeletedDocumentAttachment(document)}>
                            <Unlink aria-hidden="true" />
                            첨부 정리
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </section>

        <section className="next-steps">
          <CalendarDays aria-hidden="true" />
          <p>
            다음 개발 슬라이스: 내보내기 print 스타일, 검사·음식 근거 라벨.
          </p>
        </section>
      </section>
      {attachmentPreview ? (
        <div className="attachment-preview-backdrop" role="presentation">
          <section
            className="attachment-preview-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${attachmentPreview.title} 첨부 미리보기`}
          >
            <div className="attachment-preview-header">
              <div>
                <strong>{attachmentPreview.title}</strong>
                <span>{attachmentPreview.attachmentName}</span>
              </div>
              <button
                className="text-icon-button"
                type="button"
                onClick={() => setAttachmentPreview(null)}
                aria-label="첨부 미리보기 닫기"
              >
                <X aria-hidden="true" />
                닫기
              </button>
            </div>
            <figure className="attachment-preview-frame">
              <img
                src={attachmentPreview.previewUrl}
                alt={`${attachmentPreview.title} 첨부 이미지 미리보기`}
                onError={() => {
                  setAttachmentPreview(null);
                  setSaveLabel("이미지 미리보기 실패");
                }}
              />
              <figcaption>{attachmentPreview.sourceLabel}</figcaption>
            </figure>
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default App;
