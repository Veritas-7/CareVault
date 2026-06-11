import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  Activity,
  AlertTriangle,
  Apple,
  CalendarDays,
  ClipboardList,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  HeartPulse,
  Hospital,
  Image as ImageIcon,
  LineChart as LineChartIcon,
  MessageSquare,
  Paperclip,
  Pill,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Thermometer,
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
  assessLabTextValue,
  assessTemperature,
  assessWaistCircumference,
  buildFoodMatchSourceLinkLabels,
  calculateBmi,
  cancerFoodGuideCategories,
  foodGuidanceSources,
  koreanHealthStandardSummary,
  parseFiniteNumberText,
  type FoodAssessment,
  type GlucoseContext,
  type LabFlag,
} from "./healthRules";
import { buildFoodPanelSummary, formatFoodJudgmentUpdatedStatusLabel } from "./foodMetric";
import {
  buildDashboardMetricStandardEvidence,
  buildHealthStandardSourceLinkLabels,
  buildHealthStandardSexApplicabilityBadge,
  buildProfileMetricSexStandardChips,
  buildProfileSexStandardNotes,
  buildHealthStandardRangeFilterSummary,
  buildVitalStandardQuestionDraft,
  buildVitalStandardRangeLines,
  buildVitalStandardRangeSections,
  filterVitalStandardRangeSections,
  formatDashboardMetricStandardClipboardText,
  formatDashboardMetricStandardCompactSummary,
  formatDashboardMetricStandardCopyDescription,
  formatDashboardMetricStandardCopyFailedStatus,
  formatDashboardMetricStandardCopyStatus,
  formatDashboardMetricStandardCopyUnsupportedStatus,
  formatDashboardMetricStandardNote,
  feverInfectionStandardQuestionDraftActionLabel,
  feverInfectionStandardSymptomDraftActionLabel,
  formatHealthStandardRangeFilterCopyDescription,
  formatHealthStandardRangeFilterCopyFailedStatus,
  formatHealthStandardRangeFilterCopyPendingStatus,
  formatHealthStandardRangeFilterCopyStatus,
  formatHealthStandardRangeFilterCopyUnsupportedStatus,
  formatHealthStandardsClipboardText,
  formatHealthStandardSource,
  formatProfileMetricSexStandardClipboardText,
  formatProfileMetricSexStandardCopyDescription,
  formatProfileMetricSexStandardCopyFailedStatus,
  formatProfileMetricSexStandardCopyStatus,
  formatProfileMetricSexStandardCopyUnsupportedStatus,
  formatProfileWaistStandardNote,
  formatVitalInputStandardHelp,
  formatVitalSavePreviewLabel,
  formatVitalStandardQuestionDraftActionLabel,
  formatVitalStandardQuestionDraftStatusLabel,
  getHealthStandardCoverage,
  healthStandardStatusLabel,
  healthStandardRangeFilterOptions,
  isExternalHealthStandardSource,
  koreanHealthStandardApplicabilitySummary,
  koreanHealthStandardCoverage,
  koreanHealthStandardUseBoundary,
  type DashboardMetricStandardEvidence,
  type HealthStandardRangeFilterId,
} from "./healthStandards";
import {
  buildLabFollowupQuestionButtonLabels,
  buildLabQuestionPrompt,
  formatLabFollowupQuestionAlreadyAddedStatus,
  formatLabFollowupQuestionAddedStatus,
  getNextQuestionDate,
  hasExistingLabFollowupQuestion,
} from "./labQuestionPrompts";
import {
  buildLabPanelSummary,
  formatLabAddActionLabel,
  formatLabDraftResetStatusLabel,
  formatLabResultSavedStatusLabel,
} from "./labMetric";
import {
  buildFoodQuestionButtonLabels,
  buildFoodQuestionDraft,
  formatFoodQuestionDraftReadyStatus,
  formatFoodQuestionDraftUnavailableStatus,
} from "./foodQuestionPrompts";
import {
  buildCareActionQueue,
  careActionQueueSourceLabel,
  careActionQueueSourceOrder,
  countCareActionQueueSources,
  formatCareActionQueueClipboardText,
  formatCareActionQueueCopyDescription,
  formatCareActionQueueCopyFailedStatus,
  formatCareActionQueueCopyStatus,
  formatCareActionQueueCopyUnsupportedStatus,
} from "./careActionQueue";
import { buildCareActionQueuePanelSummary } from "./careActionQueueMetric";
import {
  careActionQueueEmptyRecoveryLinks,
  formatCareActionQueueEmptyRecoveryLinkLabel,
} from "./careActionQueueEmptyState";
import { buildCareActionVisibleDetailParts } from "./careActionVisibleDetail";
import {
  attachmentPreviewCloseActionLabel,
  attachmentPreviewClosedStatusLabel,
  createAttachmentPreviewUrl,
  isPreviewableImageAttachment,
  revokeAttachmentPreviewUrl,
} from "./attachmentPreview";
import { formatLabReferenceRangeLabel } from "./exportSourceLabels";
import { clearAttachmentMetadata, hasAttachmentMetadata } from "./attachmentArchive";
import {
  buildAttachmentRecoveryUpdate,
  buildFileNameOnlyAttachmentCheckRecovery,
  needsAttachmentRecovery,
  resolveRuntimeAttachmentOpen,
  resolveRuntimeAttachmentPreview,
} from "./attachmentRecovery";
import {
  formatDocumentDraftAttachmentClearedStatusLabel,
  formatDocumentDraftAttachmentRemoveActionLabel,
  formatDocumentDraftAttachmentSelectionFailedStatusLabel,
} from "./documentAttachmentActions";
import {
  formatDocumentAttachmentTextParsedStatus,
  formatDocumentAttachmentTextParseFailedStatus,
  mergeParsedAttachmentTextIntoDocumentBody,
  mergeParsedAttachmentTextIntoSavedDocument,
} from "./documentAttachmentText";
import { parseBrowserDocumentAttachmentText } from "./documentAttachmentParsing";
import {
  parseTauriDocumentAttachmentText,
  type TauriInvoke,
} from "./documentTauriAttachmentParsing";
import {
  buildDocumentParserQuickSearchOptions,
  filterDocumentsBySearchAndReview,
  formatDocumentFilterResetActionLabel,
  formatDocumentFilterResetStatusLabel,
  hasActiveDocumentFilters as hasActiveDocumentFilterState,
} from "./documentFilterActions";
import {
  buildDocumentCareQuestionDraft,
  buildDocumentKnowledgeSnippet,
  buildDocumentKnowledgeSummary,
  buildDocumentParserProvenanceSummary,
} from "./documentKnowledge";
import { buildDocumentParserAudit } from "./documentParserAudit";
import {
  formatDocumentParserAuditClipboardDescription,
  formatDocumentParserAuditClipboardFailedStatus,
  formatDocumentParserAuditClipboardStatus,
  formatDocumentParserAuditClipboardText,
  formatDocumentParserAuditClipboardUnsupportedStatus,
  formatDocumentParserAuditDownloadDescription,
  formatDocumentParserAuditDownloadFallbackLabel,
  formatDocumentParserAuditDownloadStatus,
} from "./documentParserAuditClipboard";
import {
  formatDeletedDocumentAttachmentCleanupCanceledStatusLabel,
  formatDeletedDocumentAttachmentCleanedStatusLabel,
  formatDocumentActionButtonLabel,
  formatDocumentArchiveCanceledStatusLabel,
  formatDocumentArchiveStatusLabel,
  formatDocumentAttachmentCheckedStatusLabel,
  formatDocumentAttachmentFileNameOnlyStatusLabel,
  formatDocumentAttachmentPreviewActionLabel,
  formatDocumentAttachmentPreviewClosedStatusLabel,
  formatDocumentAttachmentPathUpdatedStatusLabel,
  formatDocumentAttachmentPreviewOpenedStatusLabel,
  formatDocumentAttachmentPreviewUnavailableStatusLabel,
  formatDocumentAttachmentReconnectStatusLabel,
  formatDocumentAttachmentReconnectFailedStatusLabel,
  formatDocumentAttachmentReferenceStatusLabel,
  formatDocumentAttachmentRemovedStatusLabel,
  formatDocumentAttachmentRemovalCanceledStatusLabel,
  formatDocumentAttachmentRemovalFailedStatusLabel,
  formatDocumentDraftAddActionLabel,
  formatDocumentDraftAttachmentReadyStatusLabel,
  formatDocumentDraftAttachmentReferenceReadyStatusLabel,
  formatDocumentNextActionHistoryStatusLabel,
  formatDocumentReviewStatusUpdatedLabel,
  formatDocumentRestoreStatusLabel,
  formatDocumentSavedStatusLabel,
} from "./documentActionLabels";
import {
  attachmentStorageLabel,
  defaultState,
  documentLabel,
  documentReviewStatusLabel,
  emptyDocument,
  emptyLabResult,
  emptyQuestion,
  emptySymptom,
  emptyVisit,
  emptyVital,
  normalizeAppState,
  sexLabel,
  today,
  vitalQuestionGlucoseContextLabel,
  vitalTypeLabel,
  type AppState,
  type CareDocument,
  type CareQuestion,
  type DocumentCategory,
  type DocumentCategoryFilter,
  type DocumentReviewStatus,
  type DocumentReviewStatusFilter,
  type LabResult,
  type Profile,
  type Sex,
  type SymptomEntry,
  type VisitEntry,
  type VitalEntry,
  type VitalType,
} from "./appState";
import {
  formatCervicalCarePreventionDisclosureLabel,
  formatCervicalCarePromptDisclosureLabel,
  formatCervicalCareRecoveryDisclosureLabel,
  formatExportPreviewRawHtmlDisclosureLabel,
  healthStandardsCoverageDisclosureLabel,
} from "./disclosureLabels";
import {
  buildSymptomSupportActionNote,
  buildSymptomSupportQuestion,
  buildSymptomSupportQueueHint,
  buildSymptomSupportSourceLinkLabels,
  findSymptomSupportTemplate,
  formatSymptomSupportQuestionDraftActionLabel,
  formatSymptomSupportQuestionDraftReadyStatus,
  formatSymptomSupportSymptomDraftReadyStatus,
} from "./symptomSupportTemplates";
import {
  defaultSidebarSectionId,
  getSidebarHashSectionId,
  normalizeSidebarSectionHash,
  sidebarNavigationItems,
  sidebarSectionIds,
  type SidebarSectionId,
} from "./sidebarNavigation";
import { buildAppointmentReminders } from "./appointmentReminders";
import {
  formatDocumentRequiredFieldMessage,
  formatLabRequiredFieldMessage,
  formatQuestionRequiredFieldMessage,
  formatRecordFormFeedbackAriaLabel,
  formatSymptomRequiredFieldMessage,
  formatVisitRequiredFieldMessage,
  hasRequiredTextValues,
  resolveRecordFormFeedbackClearedSaveLabel,
  shouldClearRecordFormFeedback,
  type RecordFormFeedbackId,
} from "./entryValidation";
import {
  appendDocumentHistory,
  flushPendingDocumentNextActionHistories,
  hasDocumentNextActionChanged,
  type DocumentHistoryEntry,
  type DocumentHistoryKind,
} from "./documentHistory";
import { buildDocumentPanelSummary } from "./documentMetric";
import {
  buildLabPresetPreview,
  formatLabPresetAppliedStatusLabel,
  formatLabPresetNoteWithSource,
  formatLabPresetSexSyncStatusLabel,
  labPresets,
  resolveLabPreset,
  resolveLabPresetSexChangeDraft,
} from "./labPresets";
import { buildLabSourceEvidenceParts, formatLabSourceEvidence } from "./labSourceEvidence";
import { buildImmuneFoodSafetyContext } from "./immuneFoodContext";
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
  formatStorageReadyLabel,
  formatStorageSaveFailedLabel,
  formatStorageSavedWithActionLabel,
} from "./storageStatus";
import { persistedSaveQueue } from "./persistedSaveQueue";
import {
  parseOptionalNumberInput,
  validateVitalDraft,
} from "./vitalValidation";
import {
  formatProfileNumberDisplay,
  isProfileNumberField,
  type ProfileNumberField,
  validateProfileNumberInput,
} from "./profileValidation";
import { formatProfileModeToggleLabel } from "./profileModeToggle";
import { buildVitalPanelSummary } from "./vitalMetric";
import {
  buildVisitPacketExportFingerprint,
  buildVisitPacketMarkdown,
  formatVisitPacketExportDescription,
  formatVisitPacketExportStatus,
  formatVisitPacketPreviewDescription,
  formatVisitPacketPreviewStatus,
  visitPacketRangeLabels,
  type VisitPacketRange,
} from "./visitPacket";
import {
  buildVisitPanelSummary,
  formatVisitAddActionLabel,
  formatVisitAddedStatus,
} from "./visitMetric";
import {
  buildCareVaultCsv,
  buildCsvExportFingerprint,
  formatCsvExportDescription,
  formatCsvExportScopeSummary,
  formatCsvExportStatus,
  formatCsvPreviewDescription,
  formatCsvPreviewStatus,
} from "./csvExport";
import {
  buildExportPreviewSummary,
  formatExportPreviewCompactSummary,
  formatExportPreviewCloseStatus,
  formatExportPreviewCopyDescription,
  formatExportPreviewCopyFailedStatus,
  formatExportPreviewCopyStatus,
  formatExportPreviewCopyUnsupportedStatus,
  formatExportPreviewDisabledActionDescription,
  formatExportPreviewDownloadDescription,
  formatExportPreviewDownloadFallbackLabel,
  formatExportPreviewDownloadStatus,
  formatExportPreviewFreshActionDescription,
  formatExportPreviewFreshActionVisibleLabel,
  formatExportPreviewPrintDescription,
  formatExportPreviewPrintFailedStatus,
  formatExportPreviewPrintUnavailableStatus,
  formatExportPreviewPrintStatus,
  formatExportPreviewStaleStatus,
  type ExportPreviewFreshActionReason,
} from "./exportPreviewSummary";
import { printExportPreviewInFrame } from "./exportPreviewPrint";
import {
  buildCaregiverExportContentFingerprint,
  buildCaregiverExportHtml,
  isCaregiverExportContentFingerprintStale,
  type CaregiverExportSectionId,
} from "./caregiverExport";
import {
  describeCareVaultBackupImportFailure,
  formatCareVaultBackupExportDescription,
  formatCareVaultBackupExportStatus,
  formatCareVaultBackupScopeCompactSummary,
  formatCareVaultBackupImportDescription,
  formatCareVaultBackupImportFailureStatus,
  formatCareVaultBackupImportReadFailureStatus,
  formatCareVaultBackupImportStatus,
  formatCareVaultBackupImportSuccessDetail,
  prepareCareVaultBackupImport,
  sanitizeCareVaultBackupState,
} from "./backupState";
import {
  buildCaregiverShareSettingsDifferences,
  buildCaregiverShareSettingsFingerprint,
  buildCaregiverShareSettingsPanelSummary,
  buildCaregiverShareSettingsPreviewSummary,
  buildCaregiverShareSectionSummary,
  caregiverShareSettingPresets,
  caregiverShareSectionOptions,
  createDefaultCaregiverShareSettings,
  formatCaregiverShareExportDescription,
  formatCaregiverShareExportStatus,
  formatCaregiverShareMemoPresetActionLabel,
  formatCaregiverSharePresetSelectDescription,
  formatCaregiverShareProfileRedactionToggleLabel,
  formatCaregiverSharePreviewDescription,
  formatCaregiverSharePreviewStatus,
  formatCaregiverSharePresetStatus,
  formatCaregiverShareResetDescription,
  formatCaregiverShareResetStatus,
  formatCaregiverShareSectionStatus,
  formatCaregiverShareSectionSummaryAriaLabel,
  formatCaregiverShareSectionToggleLabel,
  formatCaregiverShareSettingsCompactSummary,
  getCaregiverShareSettingsPreset,
  hasCustomCaregiverShareSettings,
  normalizeCaregiverShareSettings,
  type CaregiverShareSettings,
  type CaregiverShareSettingsPreviewSummary,
} from "./caregiverShareSettings";
import {
  downloadTextFile,
  formatTextFileDownloadClipboardFallbackStatus,
  formatTextFileDownloadFailedStatus,
  formatTextFileDownloadUnsupportedStatus,
  type TextFileDownloadResult,
} from "./textFileDownload";
import {
  formatQuestionDraftAddActionLabel,
  formatQuestionDraftAddedStatus,
  formatQuestionPriorityControlDescription,
  formatQuestionPriorityUpdateStatus,
  normalizeQuestionPriority,
  questionPriorityLabel,
  type QuestionPriority,
} from "./questionPriority";
import { mergeGeneratedQuestionDraft } from "./questionDraftMerge";
import {
  buildQuestionStatusButtonLabels,
  formatQuestionStatusUpdateStatus,
  questionStatusLabel,
  type QuestionStatus,
} from "./questionStatus";
import {
  formatQuestionClipboardCopyDescription,
  formatQuestionClipboardCopyFailedStatus,
  formatQuestionClipboardCopyStatus,
  formatQuestionClipboardCopyUnsupportedStatus,
  formatQuestionClipboardText,
} from "./questionClipboard";
import {
  buildQuestionDisplayParts,
  buildQuestionTimelineDisplayParts,
  formatQuestionAnswerMemoLabel,
  formatQuestionAnswerMemoDisplay,
  formatQuestionSourceEvidenceLabel,
  formatQuestionSourceEvidenceOpenLabel,
} from "./questionDisplay";
import { buildQuestionListSummary, buildQuestionMetricSummary } from "./questionMetric";
import {
  formatDatedRecordDisplayDate,
  latestDatedItem,
  latestDatedItemMatching,
  sortDatedItemsNewestFirst,
  sortDatedItemsOldestFirst,
} from "./recordOrdering";
import {
  formatSymptomRecordLabel,
  formatSymptomRecordSavedStatusLabel,
  formatSymptomRecordSaveActionLabel,
  hasSymptomRecordSourceEvidence,
} from "./symptomRecordLabels";
import { buildSymptomDisplayParts } from "./symptomDisplay";
import { buildSymptomPanelSummary } from "./symptomMetric";
import { buildTimelinePanelSummary } from "./timelineMetric";
import {
  formatTimelineSourceEvidenceLabel,
  formatTimelineSourceEvidenceOpenLabel,
} from "./timelineSourceEvidenceLabels";
import {
  assessVitalRecord,
  formatVitalMetricRecordLabel,
  formatVitalMetricValue,
  formatVitalRecordLabel,
  formatVitalRecordSavedStatusLabel,
  formatVitalRecordSaveActionLabel,
  formatVitalTimelineTitle,
} from "./vitalRecordLabels";
import { buildVitalTimelineDisplayParts } from "./vitalTimelineDisplay";
import {
  buildVitalChartAccessibleRows,
  buildVitalChartData,
  buildVitalChartSummary,
  formatVitalChartTooltipValue,
  vitalChartLegendItems,
  type VitalChartPoint,
} from "./vitalChartData";
import {
  buildCervicalCancerAlertSymptomDraft,
  buildCervicalCancerCareItemSymptomDraft,
  buildCervicalCancerCarePromptQuestionDraft,
  buildCervicalCancerCareSourceLinkLabels,
  buildCervicalCancerScreeningQuestion,
  buildCervicalCancerScreeningSummary,
  cervicalCancerCareAlerts,
  cervicalCancerCareAlertRecordFields,
  cervicalCancerCareChecks,
  cervicalCancerCarePreventionGuides,
  cervicalCancerCarePriorityItems,
  cervicalCancerCarePrompts,
  cervicalCancerCareRecoveryGuides,
  cervicalCancerCareSources,
  formatCervicalCancerCareAlertDraftActionLabel,
  formatCervicalCancerCareItemDraftActionLabel,
  formatCervicalCancerCareListItemAriaLabel,
  formatCervicalCancerCarePromptDraftActionLabel,
  formatCervicalCancerCarePromptQuestionDraftReadyStatus,
  formatCervicalCancerCareSourceLinkLabel,
  formatCervicalCancerScreeningQuestionDraftReadyStatus,
  getCervicalCancerCareSource,
  type CervicalCancerCareAlert,
  type CervicalCancerCarePrompt,
  type CervicalCancerCareRecordDraftItem,
} from "./cervicalCancerCare";
import {
  buildCervicalCancerCareClipboardSummary,
  formatCervicalCancerCareClipboardCompactSummary,
  formatCervicalCancerCareClipboardDescription,
  formatCervicalCancerCareClipboardFailedStatus,
  formatCervicalCancerCareClipboardStatus,
  formatCervicalCancerCareClipboardText,
  formatCervicalCancerCareClipboardUnsupportedStatus,
} from "./cervicalCancerCareClipboard";
import { buildCervicalCancerCarePanelSummary } from "./cervicalCancerCareMetric";

type AttachmentPreviewState = {
  documentId: string;
  title: string;
  attachmentName: string;
  previewUrl: string;
  sourceLabel: string;
};

function loadAttachmentPreviewImage(previewUrl: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image();
    let settled = false;
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      reject(error instanceof Error ? error : new Error("attachment preview image load failed"));
    };
    const pass = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    image.onload = () => {
      const decode = typeof image.decode === "function" ? image.decode() : Promise.resolve();
      decode
        .then(() => {
          if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
            fail(new Error("attachment preview image has no decoded dimensions"));
            return;
          }
          pass();
        })
        .catch(fail);
    };
    image.onerror = () => fail(new Error("attachment preview image load failed"));
    image.src = previewUrl;
  });
}

type ExportPreviewState = {
  caregiverShareContentFingerprint?: string;
  caregiverShareSettingsFingerprint?: string;
  caregiverShareSettingsSnapshot?: CaregiverShareSettings;
  caregiverShareSettingsSummary?: CaregiverShareSettingsPreviewSummary;
  content: string;
  csvExportFingerprint?: string;
  filename: string;
  format: string;
  mimeType: string;
  title: string;
  visitPacketExportFingerprint?: string;
  visitPacketRangeSnapshot?: VisitPacketRange;
};

type BackupImportFeedback = {
  detail: string;
  title: string;
  tone: "error" | "success";
};

function isHtmlExportPreview(preview: ExportPreviewState) {
  return preview.mimeType.toLowerCase().startsWith("text/html");
}

type VitalChartTooltipPayloadItem = {
  color?: string;
  dataKey?: string | number;
  payload?: VitalChartPoint;
  value?: unknown;
};

function VitalChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: VitalChartTooltipPayloadItem[];
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload.find((item) => item.payload)?.payload;
  const rows = payload
    .map((item) => ({
      color: item.color,
      label:
        item.dataKey !== undefined
          ? formatVitalChartTooltipValue(item.dataKey, item.value)
          : "",
    }))
    .filter((item) => item.label);

  if (!point || rows.length === 0) {
    return null;
  }

  return (
    <div className="vital-chart-tooltip">
      <strong>{point.dateLabel}</strong>
      {point.glucose !== undefined && point.glucoseContextLabel ? (
        <span>혈당 측정: {point.glucoseContextLabel}</span>
      ) : null}
      <ul>
        {rows.map((row) => (
          <li key={row.label}>
            <mark style={{ backgroundColor: row.color }} />
            {row.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

const labFlagLabel: Record<LabFlag, string> = {
  low: "낮음",
  normal: "범위 내",
  high: "높음",
  unknown: "기준 없음",
};

const caregiverMemoPresets = [
  {
    label: "식사",
    text: "오늘은 식사량, 수분 섭취, 불편했던 음식을 중심으로 봐주세요.",
  },
  {
    label: "증상",
    text: "최근 증상 변화와 약 복용 후 반응을 같이 확인해주세요.",
  },
  {
    label: "서류",
    text: "다음 진료 전에 확인할 서류와 질문만 먼저 정리해주세요.",
  },
];

const formControlDescriptions = {
  backupImportFile: "CareVault 백업 JSON 파일 선택",
  profileName: "기본 정보 이름/대상 · 기록 주체 표시",
  profileAge: "기본 정보 나이 · 한국 성인 기준 해석에 사용",
  profileSex: "기본 정보 성별 · 남녀 기준이 다른 항목에 적용",
  profileHeight: "기본 정보 키(cm) · BMI 계산에 사용",
  profileWeight: "기본 정보 몸무게(kg) · BMI 계산에 사용",
  profileWaist: "기본 정보 허리둘레(cm) · 한국 성인 복부비만 기준 확인",
  vitalDate: "혈압·혈당·체온 입력 날짜",
  vitalType: "혈압·혈당·체온 입력 종류 선택",
  vitalSystolic: "혈압 입력 수축기 혈압(mmHg)",
  vitalDiastolic: "혈압 입력 이완기 혈압(mmHg)",
  vitalGlucose: "혈당 입력 값(mg/dL)",
  vitalGlucoseContext: "혈당 입력 측정 시점",
  vitalTemperature: "체온 입력 값(℃)",
  vitalNote: "혈압·혈당·체온 입력 메모",
  visitDate: "병원 방문 기록 날짜",
  visitHospital: "병원 방문 기록 병원/과",
  visitReason: "병원 방문 기록 방문 이유",
  visitNextDate: "병원 방문 기록 다음 일정",
  visitSummary: "병원 방문 기록 진료 요약",
  visitPlan: "병원 방문 기록 계획/질문",
  symptomDate: "증상·부작용 기록 날짜",
  symptomName: "증상·부작용 기록 증상명",
  symptomMedication: "증상·부작용 기록 약/대응",
  symptomBody: "증상·부작용 기록 몸 상태 메모",
  symptomAction: "증상·부작용 기록 다음 행동",
  questionDate: "진료 전 질문 확인일",
  questionTopic: "진료 전 질문 주제",
  questionPriority: "진료 전 질문 우선순위",
  questionBody: "진료 전 질문 내용",
  questionAnswer: "진료 전 질문 답변 메모",
  labPreset: "검사 수치 입력 프리셋 선택",
  labDate: "검사 수치 입력 날짜",
  labName: "검사 수치 입력 항목",
  labValue: "검사 수치 입력 값",
  labUnit: "검사 수치 입력 단위",
  labLower: "검사 수치 입력 기준 하한",
  labUpper: "검사 수치 입력 기준 상한",
  labNote: "검사 수치 입력 메모",
  foodQuery: "암환자 음식 판단 음식 또는 식단 입력",
  documentDate: "서류 수기 보관 날짜",
  documentCategory: "서류 수기 보관 분류",
  documentReviewStatus: "서류 수기 보관 검토 상태",
  documentTitle: "서류 수기 보관 제목",
  documentBody: "서류 수기 보관 내용",
  documentNextAction: "서류 수기 보관 다음 조치",
  documentTags: "서류 수기 보관 태그",
  documentAttachmentFile: "서류 메모 첨부 파일 선택 입력",
  savedAttachmentFile: "저장된 서류 첨부 파일 재연결 입력",
  documentCategoryFilter: "저장된 서류 분류 필터",
  documentStatusFilter: "저장된 서류 상태 필터",
} as const;

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

function renderMetricStandardEvidence(evidence: DashboardMetricStandardEvidence | null) {
  if (!evidence) return null;

  return (
    <small
      className="metric-standard-note metric-standard-evidence"
      aria-label={`${evidence.note} 근거 ${evidence.sourceLabel}`}
    >
      <span>{evidence.note}</span>
      {evidence.sourceUrl.startsWith("https://") ? (
        <a
          href={evidence.sourceUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={evidence.linkLabels.ariaLabel}
          title={evidence.linkLabels.title}
        >
          <ShieldCheck aria-hidden="true" />
          근거: {evidence.linkLabels.visibleLabel}
        </a>
      ) : (
        <span>근거: {evidence.sourceLabel}</span>
      )}
    </small>
  );
}

type DisplaySourceEvidenceSource = {
  sourceLabel: string;
  sourceUrl: string;
};

function buildSingleDisplaySource(
  sourceLabel: string,
  sourceUrl: string,
): DisplaySourceEvidenceSource[] {
  return sourceLabel ? [{ sourceLabel, sourceUrl }] : [];
}

function formatDisplaySourceLabels(
  sources: DisplaySourceEvidenceSource[],
  fallbackSourceLabel: string,
) {
  return sources
    .map((source) => source.sourceLabel)
    .filter(Boolean)
    .join(", ")
    || fallbackSourceLabel;
}

const sidebarNavigationIcon = {
  dashboard: LineChartIcon,
  records: ClipboardList,
  "care-plan": Pill,
  labs: ClipboardList,
  nutrition: Apple,
  documents: FileText,
} satisfies Record<SidebarSectionId, typeof LineChartIcon>;

function logPersistedSaveError(error: unknown) {
  console.error("CareVault persisted state save failed", error);
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
  const [profileNumberDrafts, setProfileNumberDrafts] = useState<
    Partial<Record<ProfileNumberField, string>>
  >({});
  const [profileFieldFeedback, setProfileFieldFeedback] = useState<{
    field: ProfileNumberField;
    message: string;
  } | null>(null);
  const [recordFormFeedback, setRecordFormFeedback] = useState<
    Partial<Record<RecordFormFeedbackId, string>>
  >({});
  const [vitalDraft, setVitalDraft] = useState<VitalEntry>(emptyVital);
  const [visitDraft, setVisitDraft] = useState<VisitEntry>(emptyVisit);
  const [documentDraft, setDocumentDraft] = useState<CareDocument>(emptyDocument);
  const [symptomDraft, setSymptomDraft] = useState<SymptomEntry>(emptySymptom);
  const [symptomDraftFocusRequest, setSymptomDraftFocusRequest] = useState(0);
  const [questionDraft, setQuestionDraft] = useState<CareQuestion>(emptyQuestion);
  const [questionDraftFocusRequest, setQuestionDraftFocusRequest] = useState(0);
  const [labDraft, setLabDraft] = useState<LabResult>(emptyLabResult);
  const [labQuestionFeedback, setLabQuestionFeedback] = useState<{
    labId: string;
    message: string;
  } | null>(null);
  const [careActionQueueFeedback, setCareActionQueueFeedback] = useState<string | null>(null);
  const [profileMetricCopyFeedback, setProfileMetricCopyFeedback] = useState<string | null>(null);
  const [dashboardMetricCopyFeedback, setDashboardMetricCopyFeedback] = useState<string | null>(
    null,
  );
  const [healthStandardsCopyFeedback, setHealthStandardsCopyFeedback] = useState<string | null>(
    null,
  );
  const [infectionFeverStandardDraftFeedback, setInfectionFeverStandardDraftFeedback] = useState<
    string | null
  >(null);
  const [vitalStandardQuestionFeedback, setVitalStandardQuestionFeedback] = useState<string | null>(
    null,
  );
  const [symptomSupportQuestionFeedback, setSymptomSupportQuestionFeedback] = useState<
    string | null
  >(null);
  const [vitalSaveFeedback, setVitalSaveFeedback] = useState<string | null>(null);
  const [symptomSaveFeedback, setSymptomSaveFeedback] = useState<string | null>(null);
  const [questionSaveFeedback, setQuestionSaveFeedback] = useState<string | null>(null);
  const [visitSaveFeedback, setVisitSaveFeedback] = useState<string | null>(null);
  const [documentSaveFeedback, setDocumentSaveFeedback] = useState<string | null>(null);
  const [foodQuestionDraftFeedback, setFoodQuestionDraftFeedback] = useState<string | null>(null);
  const [labPresetFeedback, setLabPresetFeedback] = useState<string | null>(null);
  const [labSaveFeedback, setLabSaveFeedback] = useState<string | null>(null);
  const [cervicalCancerCareCopyFeedback, setCervicalCancerCareCopyFeedback] = useState<
    string | null
  >(null);
  const [cervicalCancerCareQuestionFeedback, setCervicalCancerCareQuestionFeedback] = useState<
    string | null
  >(null);
  const [cervicalCancerCareSymptomFeedback, setCervicalCancerCareSymptomFeedback] = useState<
    string | null
  >(null);
  const [documentActionFeedback, setDocumentActionFeedback] = useState<{
    documentId: string;
    message: string;
  } | null>(null);
  const [questionActionFeedback, setQuestionActionFeedback] = useState<{
    questionId: string;
    message: string;
  } | null>(null);
  const [documentActionBaselines, setDocumentActionBaselines] = useState<Record<string, string>>(
    {},
  );
  const [labPresetChoice, setLabPresetChoice] = useState("");
  const [standardRangeFilter, setStandardRangeFilter] =
    useState<HealthStandardRangeFilterId>("all");
  const [visitPacketRange, setVisitPacketRange] = useState<VisitPacketRange>("30d");
  const [documentFilter, setDocumentFilter] = useState("");
  const [documentCategoryFilter, setDocumentCategoryFilter] =
    useState<DocumentCategoryFilter>("all");
  const [documentStatusFilter, setDocumentStatusFilter] =
    useState<DocumentReviewStatusFilter>("all");
  const [activeSectionId, setActiveSectionId] =
    useState<SidebarSectionId>(defaultSidebarSectionId);
  const [savedAttachmentTargetId, setSavedAttachmentTargetId] = useState<string | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<AttachmentPreviewState | null>(null);
  const [exportPreview, setExportPreview] = useState<ExportPreviewState | null>(null);
  const [backupImportFeedback, setBackupImportFeedback] =
    useState<BackupImportFeedback | null>(null);
  const [browserAttachmentPreviewUrls, setBrowserAttachmentPreviewUrls] = useState<
    Record<string, string>
  >({});
  const importInputRef = useRef<HTMLInputElement>(null);
  const documentAttachmentInputRef = useRef<HTMLInputElement>(null);
  const savedAttachmentInputRef = useRef<HTMLInputElement>(null);
  const browserAttachmentPreviewUrlsRef = useRef<Record<string, string>>({});
  const documentDraftAttachmentFileRef = useRef<File | null>(null);
  const documentDraftAttachmentPreviewUrlRef = useRef<string | null>(null);
  const documentActionBaselinesRef = useRef<Record<string, string>>({});
  const pendingActionLabelRef = useRef<string | null>(null);
  const transientSaveLabelUntilRef = useRef(0);
  const symptomDraftInputRef = useRef<HTMLInputElement>(null);
  const questionDraftTextareaRef = useRef<HTMLTextAreaElement>(null);
  const exportPreviewPanelRef = useRef<HTMLElement>(null);
  const exportPreviewStaleAlertRef = useRef<HTMLDivElement>(null);

  const setRecordFormValidationFeedback = (
    formId: RecordFormFeedbackId,
    message: string,
  ) => {
    setRecordFormFeedback((current) => ({ ...current, [formId]: message }));
    setSaveLabel(message);
    window.setTimeout(() => {
      document
        .querySelector<HTMLElement>(`[data-record-form-feedback="${formId}"]`)
        ?.scrollIntoView({ behavior: "auto", block: "center" });
    }, 0);
  };

  const clearRecordFormValidationFeedback = (
    formId: RecordFormFeedbackId,
    options: { refreshStaleSaveLabel?: boolean } = {},
  ) => {
    const previousMessage = recordFormFeedback[formId];

    setRecordFormFeedback((current) => {
      if (!current[formId]) return current;
      const { [formId]: _removed, ...rest } = current;
      return rest;
    });

    if (options.refreshStaleSaveLabel) {
      setSaveLabel((current) =>
        resolveRecordFormFeedbackClearedSaveLabel(formId, previousMessage, current),
      );
    }
  };

  const renderRecordFormFeedback = (formId: RecordFormFeedbackId) => {
    const message = recordFormFeedback[formId];
    if (!message) return null;

    return (
      <p
        className="record-form-feedback"
        role="status"
        aria-live="polite"
        data-record-form-feedback={formId}
        aria-label={formatRecordFormFeedbackAriaLabel(formId, message)}
      >
        {message}
      </p>
    );
  };

  useEffect(() => {
    if (
      shouldClearRecordFormFeedback(
        recordFormFeedback.vital,
        validateVitalDraft(vitalDraft).type === "ok",
      )
    ) {
      clearRecordFormValidationFeedback("vital", { refreshStaleSaveLabel: true });
    }
  }, [recordFormFeedback.vital, vitalDraft]);

  useEffect(() => {
    setVitalStandardQuestionFeedback(null);
  }, [vitalDraft]);

  useEffect(() => {
    if (
      shouldClearRecordFormFeedback(
        recordFormFeedback.visit,
        hasRequiredTextValues(visitDraft.hospital, visitDraft.reason),
      )
    ) {
      clearRecordFormValidationFeedback("visit", { refreshStaleSaveLabel: true });
    }
  }, [recordFormFeedback.visit, visitDraft.hospital, visitDraft.reason]);

  useEffect(() => {
    if (
      shouldClearRecordFormFeedback(
        recordFormFeedback.symptom,
        !formatSymptomRequiredFieldMessage(symptomDraft.symptom, symptomDraft.body),
      )
    ) {
      clearRecordFormValidationFeedback("symptom", { refreshStaleSaveLabel: true });
    }
  }, [recordFormFeedback.symptom, symptomDraft.body, symptomDraft.symptom]);

  useEffect(() => {
    setSymptomSupportQuestionFeedback(null);
  }, [symptomDraft.body, symptomDraft.symptom]);

  useEffect(() => {
    if (
      shouldClearRecordFormFeedback(
        recordFormFeedback.question,
        hasRequiredTextValues(questionDraft.topic, questionDraft.question),
      )
    ) {
      clearRecordFormValidationFeedback("question", { refreshStaleSaveLabel: true });
    }
  }, [recordFormFeedback.question, questionDraft.question, questionDraft.topic]);

  useEffect(() => {
    if (
      shouldClearRecordFormFeedback(
        recordFormFeedback.lab,
        hasRequiredTextValues(labDraft.name, labDraft.value),
      )
    ) {
      clearRecordFormValidationFeedback("lab", { refreshStaleSaveLabel: true });
    }
  }, [labDraft.name, labDraft.value, recordFormFeedback.lab]);

  useEffect(() => {
    if (
      shouldClearRecordFormFeedback(
        recordFormFeedback.document,
        hasRequiredTextValues(documentDraft.title, documentDraft.body),
      )
    ) {
      clearRecordFormValidationFeedback("document", { refreshStaleSaveLabel: true });
    }
  }, [documentDraft.body, documentDraft.title, recordFormFeedback.document]);

  useEffect(() => {
    let activeSectionFrame = 0;
    let hashScrollFrame = 0;

    const getActiveSectionFromScroll = () => {
      const anchorY = Math.min(window.innerHeight * 0.35, 220);
      let activeId = defaultSidebarSectionId;

      for (const sectionId of sidebarSectionIds) {
        const section = document.getElementById(sectionId);
        if (!section) continue;

        const rect = section.getBoundingClientRect();
        if (rect.top <= anchorY && rect.bottom > 80) {
          activeId = sectionId;
        }
      }

      return activeId;
    };

    const syncActiveSectionFromScroll = () => {
      if (activeSectionFrame) {
        window.cancelAnimationFrame(activeSectionFrame);
      }

      activeSectionFrame = window.requestAnimationFrame(() => {
        activeSectionFrame = 0;
        setActiveSectionId(getActiveSectionFromScroll());
      });
    };

    const scrollToCurrentHashSection = (behavior: ScrollBehavior) => {
      const sectionId = getSidebarHashSectionId(window.location.hash);
      if (!sectionId) return;

      if (hashScrollFrame) {
        window.cancelAnimationFrame(hashScrollFrame);
      }

      hashScrollFrame = window.requestAnimationFrame(() => {
        hashScrollFrame = 0;
        document.getElementById(sectionId)?.scrollIntoView({
          behavior,
          block: "start",
        });
      });
    };

    const syncActiveSectionFromHash = (behavior: ScrollBehavior = "smooth") => {
      setActiveSectionId(normalizeSidebarSectionHash(window.location.hash));
      scrollToCurrentHashSection(behavior);
    };

    const handleHashChange = () => syncActiveSectionFromHash("smooth");

    syncActiveSectionFromHash("auto");
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("resize", syncActiveSectionFromScroll);
    window.addEventListener("scroll", syncActiveSectionFromScroll, { passive: true });

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("resize", syncActiveSectionFromScroll);
      window.removeEventListener("scroll", syncActiveSectionFromScroll);
      if (activeSectionFrame) {
        window.cancelAnimationFrame(activeSectionFrame);
      }
      if (hashScrollFrame) {
        window.cancelAnimationFrame(hashScrollFrame);
      }
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const sectionId = getSidebarHashSectionId(window.location.hash);
    if (!sectionId) return;

    const handle = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
      setActiveSectionId(sectionId);
    }, 0);

    return () => window.clearTimeout(handle);
  }, [hydrated]);

  useEffect(() => {
    let active = true;

    loadPersistedState(defaultState).then((result) => {
      if (!active) return;
      setState(normalizeAppState(result.state));
      setStorageBackend(result.backend);
      setSaveLabel(formatStorageReadyLabel(result.backend));
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
        revokeAttachmentPreviewUrl(url),
      );
      if (documentDraftAttachmentPreviewUrlRef.current) {
        revokeAttachmentPreviewUrl(documentDraftAttachmentPreviewUrlRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (symptomDraftFocusRequest === 0) return;

    const handle = window.setTimeout(() => {
      const target = symptomDraftInputRef.current;
      if (!target) return;

      target.focus({ preventScroll: true });
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 0);

    return () => window.clearTimeout(handle);
  }, [symptomDraftFocusRequest]);

  useEffect(() => {
    if (questionDraftFocusRequest === 0) return;

    const handle = window.setTimeout(() => {
      const target = questionDraftTextareaRef.current;
      if (!target) return;

      target.focus({ preventScroll: true });
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 0);

    return () => window.clearTimeout(handle);
  }, [questionDraftFocusRequest]);

  useEffect(() => {
    if (!exportPreview) return;

    const handle = window.setTimeout(() => {
      const target = exportPreviewPanelRef.current;
      if (!target) return;

      target.focus({ preventScroll: true });
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);

    return () => window.clearTimeout(handle);
  }, [exportPreview]);

  const foodAssessment = useMemo(
    () => assessCancerFood(state.foodQuery),
    [state.foodQuery],
  );
  const immuneFoodSafetyContext = useMemo(
    () => buildImmuneFoodSafetyContext(state.labResults),
    [state.labResults],
  );
  const foodPanelSummary = useMemo(
    () => buildFoodPanelSummary(foodAssessment.matches, immuneFoodSafetyContext?.sourceLabels),
    [foodAssessment.matches, immuneFoodSafetyContext],
  );
  const foodQuestionDraftInput = useMemo(
    () => ({
      assessment: foodAssessment,
      foodQuery: state.foodQuery,
      immuneContext: immuneFoodSafetyContext,
    }),
    [foodAssessment, immuneFoodSafetyContext, state.foodQuery],
  );
  const foodQuestionDraft = useMemo(
    () => buildFoodQuestionDraft(foodQuestionDraftInput),
    [foodQuestionDraftInput],
  );
  const foodQuestionButtonSourceCount =
    foodQuestionDraft?.sourceCount ?? immuneFoodSafetyContext?.sourceCount ?? 0;
  const foodQuestionButtonLabels = useMemo(
    () => buildFoodQuestionButtonLabels(foodQuestionButtonSourceCount),
    [foodQuestionButtonSourceCount],
  );

  const normalizedMirror = useMemo(
    () => buildNormalizedCareVaultMirror(state, foodAssessment),
    [foodAssessment, state],
  );

  useEffect(() => {
    if (!hydrated) return;

    const handle = window.setTimeout(() => {
      persistedSaveQueue.enqueue({
        run: () => savePersistedState(state, { normalizedMirror }),
        onSuccess: async (backend) => {
          setStorageBackend(backend);
          const actionLabel = pendingActionLabelRef.current;
          pendingActionLabelRef.current = null;
          if (Date.now() >= transientSaveLabelUntilRef.current) {
            setSaveLabel(formatStorageSavedWithActionLabel(backend, actionLabel, true));
          }
          if (backend === "sqlite") {
            try {
              setNormalizedMirrorStatus(await loadNormalizedMirrorStatus());
            } catch {
              setNormalizedMirrorStatus(null);
            }
            return;
          }
          setNormalizedMirrorStatus(null);
        },
        onError: (error) => {
          logPersistedSaveError(error);
          setSaveLabel(formatStorageSaveFailedLabel(storageBackend, true));
        },
      });
    }, 250);

    return () => window.clearTimeout(handle);
  }, [hydrated, normalizedMirror, persistedSaveQueue, state]);

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
        parseFiniteNumberText(state.profile.heightCm) ?? Number.NaN,
        parseFiniteNumberText(state.profile.weightKg) ?? Number.NaN,
      ),
    [state.profile.heightCm, state.profile.weightKg],
  );
  const waistStatus = useMemo(
    () =>
      assessWaistCircumference(
        parseFiniteNumberText(state.profile.waistCm) ?? Number.NaN,
        state.profile.sex,
      ),
    [state.profile.sex, state.profile.waistCm],
  );
  const profileSexStandardNotes = useMemo(
    () => buildProfileSexStandardNotes(state.profile.sex),
    [state.profile.sex],
  );
  const profileMetricSexStandardChips = useMemo(
    () => buildProfileMetricSexStandardChips(state.profile.sex),
    [state.profile.sex],
  );
  const profileMetricSexLabel = sexLabel[state.profile.sex];
  const profileMetricSexStandardCopyDescription = useMemo(
    () =>
      formatProfileMetricSexStandardCopyDescription(
        profileMetricSexLabel,
        profileMetricSexStandardChips,
      ),
    [profileMetricSexLabel, profileMetricSexStandardChips],
  );
  const profileMetricSexStandardCopyStatus = useMemo(
    () =>
      formatProfileMetricSexStandardCopyStatus(
        profileMetricSexLabel,
        profileMetricSexStandardChips,
      ),
    [profileMetricSexLabel, profileMetricSexStandardChips],
  );
  const profileMetricSexStandardClipboardText = useMemo(
    () =>
      formatProfileMetricSexStandardClipboardText(
        profileMetricSexLabel,
        profileMetricSexStandardChips,
      ),
    [profileMetricSexLabel, profileMetricSexStandardChips],
  );

  const latestBp = latestDatedItemMatching(
    state.vitals,
    (item) => item.type === "blood-pressure" && Boolean(item.systolic && item.diastolic),
  );
  const latestGlucose = latestDatedItemMatching(
    state.vitals,
    (item) => item.type === "glucose" && Boolean(item.glucoseMgDl),
  );
  const latestTemperature = latestDatedItemMatching(
    state.vitals,
    (item) => item.type === "temperature" && Boolean(item.temperatureC),
  );
  const vitalPanelSummary = useMemo(
    () => buildVitalPanelSummary(state.vitals, { diabetes: state.profile.diabetes }),
    [state.profile.diabetes, state.vitals],
  );

  const bpStatus = latestBp ? assessVitalRecord(latestBp) : undefined;
  const glucoseStatus = latestGlucose
    ? assessVitalRecord(latestGlucose, {
        diabetes: state.profile.diabetes,
      })
    : undefined;
  const temperatureStatus = latestTemperature ? assessVitalRecord(latestTemperature) : undefined;
  const latestSymptom = latestDatedItem(state.symptoms);
  const latestSymptomDisplay = latestSymptom
    ? buildSymptomDisplayParts(latestSymptom)
    : undefined;
  const latestSymptomRecordLabel = latestSymptom
    ? formatSymptomRecordLabel(latestSymptom)
    : "";
  const latestSymptomHasSourceEvidence = Boolean(latestSymptomDisplay?.sourceEvidence);
  const latestSymptomSourceEvidenceLabels = latestSymptomDisplay
    ? formatDisplaySourceLabels(latestSymptomDisplay.sources, latestSymptomDisplay.sourceLabel)
    : "";
  const symptomDraftHasRecordPreview = Boolean(
    symptomDraft.symptom.trim()
    || symptomDraft.medication.trim()
    || symptomDraft.body.trim()
    || symptomDraft.action.trim(),
  );
  const symptomDraftRecordLabel = symptomDraftHasRecordPreview
    ? formatSymptomRecordLabel(symptomDraft)
    : "";
  const symptomDraftHasSourceEvidence = hasSymptomRecordSourceEvidence(symptomDraft);
  const symptomDraftSaveActionLabel = formatSymptomRecordSaveActionLabel(symptomDraft);
  const symptomDraftSaveActionDescription = symptomDraftHasRecordPreview
    ? `${symptomDraftSaveActionLabel} · ${
      symptomDraft.symptom.trim() ? `증상 ${symptomDraft.symptom.trim()}` : symptomDraftRecordLabel
    }${symptomDraftHasSourceEvidence ? " · 근거 포함" : ""}`
    : `${symptomDraftSaveActionLabel} · 증상명 또는 몸 상태 메모 필요`;
  const symptomPanelSummary = useMemo(
    () => buildSymptomPanelSummary(state.symptoms),
    [state.symptoms],
  );
  const questionMetricSummary = useMemo(
    () => buildQuestionMetricSummary(state.questions),
    [state.questions],
  );
  const questionListSummary = useMemo(
    () => buildQuestionListSummary(state.questions),
    [state.questions],
  );
  const openQuestionCount = questionMetricSummary.openCount;
  const symptomLevel =
    latestSymptom?.severity >= 7 ? "risk" : latestSymptom?.severity >= 4 ? "watch" : "ok";
  const labAssessments = state.labResults.map((result) => ({
    result,
    assessment: assessLabTextValue(result.value, result.lower, result.upper),
  }));
  const timelinePanelSummary = useMemo(
    () =>
      buildTimelinePanelSummary({
        documentCount: state.documents.length,
        labCount: state.labResults.length,
        questionCount: state.questions.length,
        sourceBackedCount:
          state.vitals.filter((vital) =>
            Boolean(
              buildVitalTimelineDisplayParts(vital, {
                diabetes: state.profile.diabetes,
              }).sourceEvidence,
            ),
          ).length
          + state.symptoms.filter(hasSymptomRecordSourceEvidence).length
          + state.questions.filter((question) =>
            Boolean(
              buildQuestionTimelineDisplayParts(
                question.question,
                questionStatusLabel[question.status],
              ).sourceEvidence,
            ),
          ).length
          + state.labResults.filter((result) =>
            Boolean(buildLabSourceEvidenceParts(result).sourceLabel),
          ).length,
        symptomCount: state.symptoms.length,
        visitCount: state.visits.length,
        vitalCount: state.vitals.length,
      }),
    [
      state.documents,
      state.labResults,
      state.profile.diabetes,
      state.questions,
      state.symptoms,
      state.visits,
      state.vitals,
    ],
  );
  const labPanelSummary = useMemo(
    () => buildLabPanelSummary(state.labResults),
    [state.labResults],
  );
  const abnormalLabCount = labAssessments.filter(({ assessment }) =>
    ["low", "high"].includes(assessment.flag),
  ).length;
  const documentPanelSummary = useMemo(
    () => buildDocumentPanelSummary(state.documents, state.deletedDocuments),
    [state.documents, state.deletedDocuments],
  );
  const documentParserQuickSearchOptions = useMemo(
    () =>
      buildDocumentParserQuickSearchOptions({
        desktopParserCount: documentPanelSummary.desktopParserCount,
        parsedAttachmentCount: documentPanelSummary.parsedAttachmentCount,
      }),
    [documentPanelSummary.desktopParserCount, documentPanelSummary.parsedAttachmentCount],
  );
  const documentParserAudit = useMemo(
    () => buildDocumentParserAudit(state.documents),
    [state.documents],
  );
  const documentParserAuditClipboardDescription = useMemo(
    () => formatDocumentParserAuditClipboardDescription(documentParserAudit),
    [documentParserAudit],
  );
  const documentParserAuditClipboardStatus = useMemo(
    () => formatDocumentParserAuditClipboardStatus(documentParserAudit),
    [documentParserAudit],
  );
  const documentParserAuditDownloadDescription = useMemo(
    () => formatDocumentParserAuditDownloadDescription(documentParserAudit),
    [documentParserAudit],
  );
  const documentParserAuditDownloadStatus = useMemo(
    () => formatDocumentParserAuditDownloadStatus(documentParserAudit),
    [documentParserAudit],
  );
  const documentDraftHasRequiredFields = hasRequiredTextValues(
    documentDraft.title,
    documentDraft.body,
  );
  const documentDraftAddActionLabel = formatDocumentDraftAddActionLabel(
    documentDraft,
    documentDraftHasRequiredFields,
  );
  const documentDraftAttachmentRemoveActionLabel = formatDocumentDraftAttachmentRemoveActionLabel(
    documentDraft.attachmentName,
  );
  const activeDocumentActionCount = state.documents.filter(
    (document) => document.reviewStatus !== "done",
  ).length;
  const careActions = useMemo(() => buildCareActionQueue(state, today), [state, today]);
  const careActionSourceCounts = useMemo(
    () => countCareActionQueueSources(careActions),
    [careActions],
  );
  const careActionQueuePanelSummary = useMemo(
    () => buildCareActionQueuePanelSummary(careActions),
    [careActions],
  );
  const careActionQueueCopyDescription = useMemo(
    () => formatCareActionQueueCopyDescription(careActions),
    [careActions],
  );
  const careActionQueueCopyStatus = useMemo(
    () => formatCareActionQueueCopyStatus(careActions),
    [careActions],
  );
  const cervicalCancerCareClipboardSummary = useMemo(
    () => buildCervicalCancerCareClipboardSummary(state.profile),
    [state.profile],
  );
  const cervicalCancerCarePanelSummary = useMemo(
    () => buildCervicalCancerCarePanelSummary(cervicalCancerCareClipboardSummary),
    [cervicalCancerCareClipboardSummary],
  );
  const cervicalCancerCareClipboardCompactSummary = useMemo(
    () => formatCervicalCancerCareClipboardCompactSummary(cervicalCancerCareClipboardSummary),
    [cervicalCancerCareClipboardSummary],
  );
  const cervicalCancerCareClipboardDescription = useMemo(
    () => formatCervicalCancerCareClipboardDescription(cervicalCancerCareClipboardSummary),
    [cervicalCancerCareClipboardSummary],
  );
  const cervicalCancerCareClipboardStatus = useMemo(
    () => formatCervicalCancerCareClipboardStatus(cervicalCancerCareClipboardSummary),
    [cervicalCancerCareClipboardSummary],
  );
  const appointmentReminders = useMemo(
    () => buildAppointmentReminders(state.visits, today),
    [state.visits],
  );
  const visitPanelSummary = useMemo(
    () => buildVisitPanelSummary(state.visits, today),
    [state.visits],
  );
  const profileAgeDisplay = formatProfileNumberDisplay(state.profile.age, "세", "나이 미입력");
  const profileHeightDisplay = formatProfileNumberDisplay(
    state.profile.heightCm,
    "cm",
    "키 미입력",
  );
  const profileWeightDisplay = formatProfileNumberDisplay(
    state.profile.weightKg,
    "kg",
    "몸무게 미입력",
  );
  const profileWaistDisplay = formatProfileNumberDisplay(state.profile.waistCm, "cm", "");
  const profileWaistStandardNote = formatProfileWaistStandardNote(state.profile.sex);
  const healthStandardRangeSections = useMemo(() => buildVitalStandardRangeSections(), []);
  const visibleHealthStandardRangeSections = useMemo(
    () => filterVitalStandardRangeSections(healthStandardRangeSections, standardRangeFilter),
    [healthStandardRangeSections, standardRangeFilter],
  );
  const healthStandardRangeSummary = useMemo(
    () => buildHealthStandardRangeFilterSummary(healthStandardRangeSections, standardRangeFilter),
    [healthStandardRangeSections, standardRangeFilter],
  );
  const selectedHealthStandardRangeFilter = useMemo(
    () =>
      healthStandardRangeFilterOptions.find((option) => option.id === standardRangeFilter) ??
      healthStandardRangeFilterOptions[0],
    [standardRangeFilter],
  );
  const healthStandardsCopyLabel =
    selectedHealthStandardRangeFilter.id === "all"
      ? "전체 기준 복사"
      : `${selectedHealthStandardRangeFilter.label} 기준 복사`;
  const healthStandardsCopyDescription = formatHealthStandardRangeFilterCopyDescription(
    selectedHealthStandardRangeFilter.label,
    healthStandardRangeSummary,
  );
  const healthStandardsCopyStatus = formatHealthStandardRangeFilterCopyStatus(
    selectedHealthStandardRangeFilter.label,
    healthStandardRangeSummary,
  );
  const bmiMetricStandardEvidence = buildDashboardMetricStandardEvidence(
    "bmi",
    "BMI 대시보드 기준",
  );
  const waistMetricStandardEvidence = buildDashboardMetricStandardEvidence(
    "waist",
    "허리둘레 대시보드 기준",
  );
  const bloodPressureMetricStandardId = bpStatus?.standardId ?? "blood-pressure";
  const bloodPressureMetricStandardEvidence = buildDashboardMetricStandardEvidence(
    bloodPressureMetricStandardId,
    "최근 혈압 기준",
  );
  const glucoseMetricStandardEvidence = buildDashboardMetricStandardEvidence(
    state.profile.diabetes ? "glucose-care" : "glucose-screening",
    "최근 혈당 기준",
  );
  const temperatureMetricStandardEvidence = buildDashboardMetricStandardEvidence(
    temperatureStatus?.standardId ?? "infection-fever",
    "최근 체온 기준",
  );
  const dashboardMetricStandardEvidences = [
    bmiMetricStandardEvidence,
    waistMetricStandardEvidence,
    bloodPressureMetricStandardEvidence,
    glucoseMetricStandardEvidence,
    temperatureMetricStandardEvidence,
  ];
  const dashboardMetricStandardCompactSummary = formatDashboardMetricStandardCompactSummary(
    dashboardMetricStandardEvidences,
  );
  const dashboardMetricStandardCopyDescription = formatDashboardMetricStandardCopyDescription(
    dashboardMetricStandardEvidences,
  );
  const dashboardMetricStandardCopyStatus = formatDashboardMetricStandardCopyStatus(
    dashboardMetricStandardEvidences,
  );
  const dashboardMetricStandardClipboardText = formatDashboardMetricStandardClipboardText(
    dashboardMetricStandardEvidences,
  );
  const vitalDraftValidation = validateVitalDraft(vitalDraft);
  const vitalDraftGlucoseContext = vitalDraft.glucoseContext ?? "random";
  const vitalDraftAssessment =
    vitalDraftValidation.type === "ok"
      ? vitalDraft.type === "blood-pressure"
        ? assessBloodPressure(
            vitalDraftValidation.values.systolic ?? 0,
            vitalDraftValidation.values.diastolic ?? 0,
          )
        : vitalDraft.type === "temperature"
          ? assessTemperature(vitalDraftValidation.values.temperatureC ?? 0)
          : assessBloodGlucose(
              vitalDraftValidation.values.glucoseMgDl ?? 0,
              vitalDraftGlucoseContext,
              {
                diabetes: state.profile.diabetes,
              },
            )
      : null;
  const vitalDraftStandardId =
    vitalDraft.type === "blood-pressure"
      ? vitalDraftAssessment?.standardId ?? "blood-pressure"
      : vitalDraft.type === "temperature"
        ? vitalDraftAssessment?.standardId ?? "infection-fever"
        : vitalDraftAssessment?.standardId ?? (state.profile.diabetes ? "glucose-care" : "glucose-screening");
  const vitalDraftStandard = getHealthStandardCoverage(vitalDraftStandardId);
  const vitalDraftStandardNote = formatDashboardMetricStandardNote(vitalDraftStandardId);
  const vitalDraftStandardRangeLines = buildVitalStandardRangeLines(vitalDraftStandardId);
  const vitalDraftSourceLinkLabels = vitalDraftStandard
    ? buildHealthStandardSourceLinkLabels(
        vitalDraftStandard.sourceLabel,
        `${vitalTypeLabel[vitalDraft.type]} 입력 기준`,
        { surfaceLabel: "활력 입력" },
      )
    : null;
  const vitalDraftSourceLink =
    vitalDraftStandard &&
    isExternalHealthStandardSource(vitalDraftStandard) &&
    vitalDraftSourceLinkLabels
      ? {
          href: vitalDraftStandard.sourceUrl,
          labels: vitalDraftSourceLinkLabels,
        }
      : null;
  const vitalDraftHelperText = formatVitalInputStandardHelp(vitalDraftStandardId);
  const vitalDraftMeasurementLabel =
    vitalDraftValidation.type === "ok"
      ? vitalDraft.type === "blood-pressure"
        ? `혈압 ${vitalDraftValidation.values.systolic}/${vitalDraftValidation.values.diastolic} mmHg`
        : vitalDraft.type === "temperature"
          ? `체온 ${vitalDraftValidation.values.temperatureC}℃`
          : `혈당 ${vitalDraftValidation.values.glucoseMgDl} mg/dL (${vitalQuestionGlucoseContextLabel[vitalDraftGlucoseContext]})`
      : "";
  const vitalDraftSavePreviewLabel =
    vitalDraftAssessment && vitalDraftStandard
      ? formatVitalSavePreviewLabel({
          assessmentLabel: vitalDraftAssessment.label,
          measurementLabel: vitalDraftMeasurementLabel,
          standardLabel: vitalDraftStandard.label,
          standardSexApplicability: vitalDraftStandard.sexApplicability,
        })
      : "";
  const vitalDraftSavePreviewAriaLabel =
    vitalDraftAssessment && vitalDraftSavePreviewLabel
      ? `저장 전 기준 확인: ${vitalDraftSavePreviewLabel}. ${vitalDraftAssessment.summary}`
      : undefined;
  const vitalDraftQuestionDraftActionLabel = formatVitalStandardQuestionDraftActionLabel(
    vitalTypeLabel[vitalDraft.type],
  );
  const vitalDraftSaveActionLabel = formatVitalRecordSaveActionLabel(vitalDraft);
  const vitalDraftSaveActionDescription = vitalDraftSavePreviewLabel
    ? `${vitalDraftSaveActionLabel} · ${vitalDraftSavePreviewLabel}`
    : `${vitalDraftSaveActionLabel} · 기준 확인 후 저장`;
  const selectedLabPresetPreview = useMemo(
    () => buildLabPresetPreview(labPresetChoice, state.profile.sex),
    [labPresetChoice, state.profile.sex],
  );
  const symptomSupportTemplate = useMemo(
    () => findSymptomSupportTemplate(`${symptomDraft.symptom} ${symptomDraft.body}`),
    [symptomDraft.body, symptomDraft.symptom],
  );
  const symptomSupportSourceLinkLabels = symptomSupportTemplate
    ? buildSymptomSupportSourceLinkLabels(symptomSupportTemplate)
    : null;
  const symptomSupportQuestionDraftActionLabel = symptomSupportTemplate
    ? formatSymptomSupportQuestionDraftActionLabel(symptomSupportTemplate)
    : "";
  const cervicalCancerScreeningSummary = useMemo(
    () => buildCervicalCancerScreeningSummary(state.profile),
    [state.profile.age, state.profile.sex],
  );

  const chartData = buildVitalChartData(state.vitals, { diabetes: state.profile.diabetes });
  const chartSummary = buildVitalChartSummary(chartData);
  const chartAccessibleRows = buildVitalChartAccessibleRows(chartData);

  const filteredDocuments = filterDocumentsBySearchAndReview(state.documents, {
    categoryFilter: documentCategoryFilter,
    categoryLabels: documentLabel,
    searchText: documentFilter,
    statusFilter: documentStatusFilter,
    statusLabels: documentReviewStatusLabel,
  });
  const documentKnowledgeSearchSnippets = documentFilter.trim()
    ? filteredDocuments
        .map((document) => buildDocumentKnowledgeSnippet(document, documentFilter))
        .filter(Boolean)
        .slice(0, 3)
    : [];
  const hasActiveDocumentFilters = hasActiveDocumentFilterState({
    categoryFilter: documentCategoryFilter,
    searchText: documentFilter,
    statusFilter: documentStatusFilter,
  });
  const documentFilterResetActionLabel = formatDocumentFilterResetActionLabel({
    categoryLabel:
      documentCategoryFilter === "all" ? "전체 분류" : documentLabel[documentCategoryFilter],
    searchText: documentFilter,
    statusLabel:
      documentStatusFilter === "all"
        ? "전체 상태"
        : documentReviewStatusLabel[documentStatusFilter],
  });

  const setActionSaveLabel = (label: string) => {
    transientSaveLabelUntilRef.current = 0;
    pendingActionLabelRef.current = label;
    setSaveLabel(label);
  };

  const setTransientSaveLabel = (label: string) => {
    pendingActionLabelRef.current = null;
    transientSaveLabelUntilRef.current = Date.now() + 2000;
    setSaveLabel(label);
  };

  const resetDocumentFilters = () => {
    const statusLabel = formatDocumentFilterResetStatusLabel({
      categoryLabel:
        documentCategoryFilter === "all" ? "전체 분류" : documentLabel[documentCategoryFilter],
      searchText: documentFilter,
      statusLabel:
        documentStatusFilter === "all"
          ? "전체 상태"
          : documentReviewStatusLabel[documentStatusFilter],
    });
    setDocumentFilter("");
    setDocumentCategoryFilter("all");
    setDocumentStatusFilter("all");
    setSaveLabel(statusLabel);
  };

  const applyDocumentParserQuickSearch = (
    option: (typeof documentParserQuickSearchOptions)[number],
  ) => {
    if (option.disabled) return;

    setDocumentFilter(option.searchText);
    setDocumentCategoryFilter("all");
    setDocumentStatusFilter("all");
    setSaveLabel(option.statusLabel);
  };

  const copyDocumentParserAudit = () => {
    if (!navigator.clipboard?.writeText) {
      setSaveLabel(formatDocumentParserAuditClipboardUnsupportedStatus(documentParserAudit));
      return;
    }

    navigator.clipboard
      .writeText(formatDocumentParserAuditClipboardText(documentParserAudit))
      .then(() => {
        setTransientSaveLabel(documentParserAuditClipboardStatus);
      })
      .catch(() => {
        setSaveLabel(formatDocumentParserAuditClipboardFailedStatus(documentParserAudit));
      });
  };

  const downloadDocumentParserAudit = async () => {
    const result = await downloadTextFile(
      formatDocumentParserAuditClipboardText(documentParserAudit),
      `carevault-document-parser-audit-${today}.md`,
      "text/markdown;charset=utf-8",
    );
    setTextFileDownloadStatus(
      result,
      documentParserAuditDownloadStatus,
      formatDocumentParserAuditDownloadFallbackLabel(),
      documentParserAudit.summary,
    );
  };

  const getCaregiverShareSectionLabel = (id: CaregiverExportSectionId) =>
    caregiverShareSectionOptions.find((option) => option.id === id)?.label ?? id;

  const getProfileActionLabel = (field: keyof Profile, value: Profile[keyof Profile]) => {
    if (field === "cancerCareMode") {
      return value ? "암환자 관리 켜짐" : "암환자 관리 꺼짐";
    }
    if (field === "diabetes") {
      return value ? "당뇨 추적 켜짐" : "당뇨 추적 꺼짐";
    }
    if (field === "hypertension") {
      return value ? "혈압 추적 켜짐" : "혈압 추적 꺼짐";
    }

    const profileFieldLabels: Record<
      Exclude<keyof Profile, "cancerCareMode" | "diabetes" | "hypertension">,
      string
    > = {
      age: "나이",
      heightCm: "키",
      name: "프로필 이름",
      sex: "성별 기준",
      waistCm: "허리둘레",
      weightKg: "몸무게",
    };
    return `${profileFieldLabels[field]} 수정됨`;
  };

  const saveProfile = (field: keyof Profile, value: Profile[keyof Profile]) => {
    if (isProfileNumberField(field) && typeof value === "string") {
      setProfileNumberDrafts((current) => ({ ...current, [field]: value }));
      const validation = validateProfileNumberInput(field, value);
      if (validation.type === "error") {
        setProfileFieldFeedback({ field, message: validation.message });
        setSaveLabel(validation.message);
        return;
      }
      setProfileFieldFeedback((current) => (current?.field === field ? null : current));
      setProfileNumberDrafts((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }

    const nextProfileSex = field === "sex" && typeof value === "string" ? (value as Sex) : null;
    const shouldSyncLabPresetSexRange =
      nextProfileSex !== null && nextProfileSex !== state.profile.sex && labPresetChoice;
    const syncedLabPreset = shouldSyncLabPresetSexRange
      ? resolveLabPresetSexChangeDraft(labPresetChoice, state.profile.sex, nextProfileSex, labDraft)
      : null;

    if (syncedLabPreset) {
      setLabDraft((current) => ({
        ...current,
        name: syncedLabPreset.name,
        unit: syncedLabPreset.unit,
        lower: syncedLabPreset.lower,
        upper: syncedLabPreset.upper,
        note: syncedLabPreset.note,
      }));
      if (nextProfileSex) {
        setLabPresetFeedback(formatLabPresetAppliedStatusLabel(labPresetChoice, nextProfileSex));
      }
    } else if (shouldSyncLabPresetSexRange) {
      setLabPresetFeedback(null);
    }

    setState((current) => ({
      ...current,
      profile: { ...current.profile, [field]: value },
    }));
    const actionLabel = getProfileActionLabel(field, value);
    setActionSaveLabel(
      syncedLabPreset && nextProfileSex
        ? `${actionLabel} · ${formatLabPresetSexSyncStatusLabel(labPresetChoice, nextProfileSex)}`
        : actionLabel,
    );
  };

  const getProfileNumberValue = (field: ProfileNumberField) =>
    profileNumberDrafts[field] ?? state.profile[field];

  const getProfileNumberFeedbackProps = (field: ProfileNumberField) =>
    profileFieldFeedback?.field === field
      ? {
          "aria-describedby": "profile-field-feedback",
          "aria-invalid": true,
        }
      : {};

  const handleProfileNumberInput = (field: ProfileNumberField, value: string) => {
    saveProfile(field, value);
  };

  const updateVitalDraft = (updates: Partial<VitalEntry>) => {
    setVitalDraft((current) => ({ ...current, ...updates }));
    setVitalSaveFeedback(null);
  };

  const addVital = () => {
    const validation = validateVitalDraft(vitalDraft);
    if (validation.type === "error") {
      setVitalSaveFeedback(null);
      setRecordFormValidationFeedback("vital", validation.message);
      return;
    }

    const savedVital: VitalEntry = {
      date: vitalDraft.date,
      id: createId(
        vitalDraft.type === "glucose"
          ? "glu"
          : vitalDraft.type === "temperature"
            ? "temp"
            : "bp",
      ),
      note: vitalDraft.note,
      type: vitalDraft.type,
      systolic: vitalDraft.type === "blood-pressure" ? validation.values.systolic : undefined,
      diastolic: vitalDraft.type === "blood-pressure" ? validation.values.diastolic : undefined,
      glucoseMgDl: vitalDraft.type === "glucose" ? validation.values.glucoseMgDl : undefined,
      glucoseContext: vitalDraft.type === "glucose" ? vitalDraft.glucoseContext : undefined,
      temperatureC: vitalDraft.type === "temperature" ? validation.values.temperatureC : undefined,
    };

    setState((current) => ({
      ...current,
      vitals: [...current.vitals, savedVital],
    }));
    setVitalDraft({ ...emptyVital, date: today });
    clearRecordFormValidationFeedback("vital");
    const feedback = formatVitalRecordSavedStatusLabel(savedVital, {
      diabetes: state.profile.diabetes,
    });
    setVitalSaveFeedback(feedback);
    setActionSaveLabel(feedback);
  };

  const applyVitalStandardQuestion = () => {
    const validation = validateVitalDraft(vitalDraft);
    if (validation.type === "error") {
      setVitalSaveFeedback(null);
      setRecordFormValidationFeedback("vital", validation.message);
      return;
    }

    const glucoseContext = vitalDraft.glucoseContext ?? "random";
    const assessment =
      vitalDraft.type === "blood-pressure"
        ? assessBloodPressure(validation.values.systolic ?? 0, validation.values.diastolic ?? 0)
        : vitalDraft.type === "temperature"
          ? assessTemperature(validation.values.temperatureC ?? 0)
          : assessBloodGlucose(validation.values.glucoseMgDl ?? 0, glucoseContext, {
              diabetes: state.profile.diabetes,
            });
    const measurementLabel =
      vitalDraft.type === "blood-pressure"
        ? `혈압 ${validation.values.systolic}/${validation.values.diastolic} mmHg`
        : vitalDraft.type === "temperature"
          ? `체온 ${validation.values.temperatureC}℃`
          : `혈당 ${validation.values.glucoseMgDl} mg/dL (${vitalQuestionGlucoseContextLabel[glucoseContext]})`;
    const draftInput = {
      assessmentLabel: assessment.label,
      assessmentSummary: assessment.summary,
      measurementLabel,
      note: vitalDraft.note,
      standardId: vitalDraftStandardId,
    };
    const draft = buildVitalStandardQuestionDraft(draftInput);

    if (!draft) {
      const feedback = formatVitalStandardQuestionDraftStatusLabel(draftInput);
      setVitalSaveFeedback(null);
      setVitalStandardQuestionFeedback(feedback);
      setSaveLabel(feedback);
      return;
    }

    setVitalSaveFeedback(null);
    setQuestionSaveFeedback(null);
    setQuestionDraft((current) =>
      mergeGeneratedQuestionDraft(current, {
        date: getNextQuestionDate(state.visits, today),
        priority: "next-visit",
        question: draft.question,
        status: "open",
        topic: draft.topic,
      }),
    );
    clearRecordFormValidationFeedback("vital");
    const feedback = formatVitalStandardQuestionDraftStatusLabel(draftInput);
    setVitalStandardQuestionFeedback(feedback);
    setSaveLabel(feedback);
    setQuestionDraftFocusRequest((request) => request + 1);
  };

  const updateVisitDraft = (updates: Partial<VisitEntry>) => {
    setVisitDraft((current) => ({ ...current, ...updates }));
    setVisitSaveFeedback(null);
  };

  const addVisit = () => {
    const requiredFieldMessage = formatVisitRequiredFieldMessage(
      visitDraft.hospital,
      visitDraft.reason,
    );

    if (requiredFieldMessage) {
      setVisitSaveFeedback(null);
      setRecordFormValidationFeedback("visit", requiredFieldMessage);
      return;
    }

    const feedback = formatVisitAddedStatus(visitDraft);
    setState((current) => ({
      ...current,
      visits: [...current.visits, { ...visitDraft, id: createId("visit") }],
    }));
    setVisitDraft({ ...emptyVisit, date: today });
    clearRecordFormValidationFeedback("visit");
    setVisitSaveFeedback(feedback);
    setActionSaveLabel(feedback);
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

  const captureDocumentActionBaseline = (document: CareDocument) => {
    if (documentActionBaselinesRef.current[document.id] !== undefined) return;
    documentActionBaselinesRef.current = {
      ...documentActionBaselinesRef.current,
      [document.id]: document.nextAction,
    };
    setDocumentActionBaselines((current) => ({
      ...current,
      [document.id]: document.nextAction,
    }));
  };

  const clearDocumentActionBaseline = (documentId: string) => {
    const { [documentId]: _removedRef, ...nextRef } = documentActionBaselinesRef.current;
    documentActionBaselinesRef.current = nextRef;
    setDocumentActionBaselines((current) => {
      const { [documentId]: _removed, ...rest } = current;
      return rest;
    });
  };

  const updateDocumentDraft = (updates: Partial<CareDocument>) => {
    setDocumentDraft((current) => ({ ...current, ...updates }));
    setDocumentSaveFeedback(null);
  };

  const addDocument = () => {
    const requiredFieldMessage = formatDocumentRequiredFieldMessage(
      documentDraft.title,
      documentDraft.body,
    );

    if (requiredFieldMessage) {
      setDocumentSaveFeedback(null);
      setRecordFormValidationFeedback("document", requiredFieldMessage);
      return;
    }

    const documentId = createId("doc");
    const createdEntry = createDocumentHistory(
      "created",
      "서류 저장",
      `${documentDraft.title.trim()} 기록 생성`,
    );
    const savedDocument: CareDocument = {
      ...documentDraft,
      id: documentId,
      history: appendDocumentHistory(documentDraft.history, createdEntry),
    };
    const browserAttachmentFile = documentDraftAttachmentFileRef.current;
    const draftPreviewUrl = documentDraftAttachmentPreviewUrlRef.current;
    let draftPreviewTransferred = false;
    if (
      draftPreviewUrl &&
      documentDraft.attachmentStorage === "browser-reference" &&
      documentDraft.attachmentName &&
      isPreviewableImageAttachment(documentDraft.attachmentName)
    ) {
      setBrowserAttachmentPreviewUrl(documentId, draftPreviewUrl);
      documentDraftAttachmentPreviewUrlRef.current = null;
      draftPreviewTransferred = true;
    } else if (
      browserAttachmentFile &&
      documentDraft.attachmentStorage === "browser-reference" &&
      documentDraft.attachmentName === browserAttachmentFile.name
    ) {
      rememberBrowserAttachmentPreviewUrl(documentId, browserAttachmentFile);
    }
    setState((current) => ({
      ...current,
      documents: [...current.documents, savedDocument],
    }));
    documentDraftAttachmentFileRef.current = null;
    if (!draftPreviewTransferred) {
      clearDocumentDraftAttachmentPreviewUrl();
    }
    setDocumentDraft({ ...emptyDocument, date: today });
    clearRecordFormValidationFeedback("document");
    const feedback = formatDocumentSavedStatusLabel(savedDocument);
    setDocumentSaveFeedback(feedback);
    setActionSaveLabel(feedback);
  };

  const updateDocumentReviewStatus = (
    targetDocument: CareDocument,
    reviewStatus: DocumentReviewStatus,
  ) => {
    setState((current) => ({
      ...current,
      documents: current.documents.map((document) => {
        if (document.id !== targetDocument.id || document.reviewStatus === reviewStatus) {
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
    const feedback = formatDocumentReviewStatusUpdatedLabel(targetDocument, reviewStatus);
    setDocumentActionFeedback({ documentId: targetDocument.id, message: feedback });
    setActionSaveLabel(feedback);
  };

  const updateDocumentNextAction = (targetDocument: CareDocument, nextAction: string) => {
    captureDocumentActionBaseline(targetDocument);
    setState((current) => ({
      ...current,
      documents: current.documents.map((document) =>
        document.id === targetDocument.id ? { ...document, nextAction } : document,
      ),
    }));
  };

  const recordDocumentNextActionBlur = (document: CareDocument, nextAction: string) => {
    const previous =
      documentActionBaselinesRef.current[document.id] ??
      documentActionBaselines[document.id] ??
      document.nextAction;
    if (!hasDocumentNextActionChanged(previous, nextAction)) {
      clearDocumentActionBaseline(document.id);
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
    clearDocumentActionBaseline(document.id);
    const feedback = formatDocumentNextActionHistoryStatusLabel(document, nextAction);
    setDocumentActionFeedback({ documentId: document.id, message: feedback });
    setActionSaveLabel(feedback);
  };

  const applyDocumentKnowledgeQuestionDraft = (document: CareDocument) => {
    const nextAction = buildDocumentCareQuestionDraft(document);
    if (!nextAction) return;

    const historyEntry = createDocumentHistory(
      "next-action",
      "문서 질문 초안",
      nextAction,
    );
    setState((current) => ({
      ...current,
      documents: current.documents.map((item) =>
        item.id === document.id
          ? {
              ...item,
              nextAction,
              reviewStatus: "care-question",
              history: appendDocumentHistory(item.history, historyEntry),
            }
          : item,
      ),
    }));
    clearDocumentActionBaseline(document.id);
    const feedback = formatDocumentNextActionHistoryStatusLabel(document, nextAction);
    setDocumentActionFeedback({ documentId: document.id, message: feedback });
    setActionSaveLabel(feedback);
  };

  const flushPendingDocumentNextActionHistory = () => {
    const baselines = documentActionBaselinesRef.current;
    const result = flushPendingDocumentNextActionHistories(state.documents, baselines, (document) =>
      createDocumentHistory(
        "next-action",
        "다음 조치 변경",
        document.nextAction.trim() || "다음 조치 비움",
      ),
    );

    documentActionBaselinesRef.current = result.baselines;
    setDocumentActionBaselines(result.baselines);
    if (!result.changedDocuments.length) return state;

    const nextState = { ...state, documents: result.documents };
    setState(nextState);
    const changedDocument = result.changedDocuments[result.changedDocuments.length - 1];
    const feedback = {
      documentId: changedDocument.id,
      message: formatDocumentNextActionHistoryStatusLabel(changedDocument, changedDocument.nextAction),
    };
    setDocumentActionFeedback(feedback);
    setActionSaveLabel(feedback.message);
    return nextState;
  };

  const parseTauriSelectedDocumentAttachment = async (
    attachmentPath: string,
    attachmentName: string,
  ) => {
    const { invoke } = await import("@tauri-apps/api/core");
    return parseTauriDocumentAttachmentText(attachmentPath, attachmentName, invoke as TauriInvoke);
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
            extensions: [
              "pdf",
              "png",
              "jpg",
              "jpeg",
              "webp",
              "docx",
              "xlsx",
              "csv",
              "txt",
              "md",
              "hwp",
              "hwpx",
            ],
          },
        ],
      });

      if (typeof selected !== "string") return;

      const attachmentExists = await exists(selected).catch(() => false);
      const attachmentName = extractFileName(selected);
      const attachmentStatus = attachmentExists ? "앱 샌드박스 복사됨" : "앱 샌드박스 경로 저장됨";
      updateDocumentDraft({
        attachmentName,
        attachmentPath: selected,
        attachmentStorage: "tauri-sandbox",
        attachmentStatus,
      });
      documentDraftAttachmentFileRef.current = null;
      const feedback = formatDocumentDraftAttachmentReadyStatusLabel(
        attachmentName,
        attachmentStatus,
      );
      setDocumentSaveFeedback(feedback);
      setSaveLabel(feedback);

      try {
        const parsedAttachment = await parseTauriSelectedDocumentAttachment(
          selected,
          attachmentName,
        );
        if (!parsedAttachment) return;

        setDocumentDraft((current) => ({
          ...current,
          body: mergeParsedAttachmentTextIntoDocumentBody(
            current.body,
            attachmentName,
            parsedAttachment.normalizedText,
            parsedAttachment.sourceLabel,
          ),
        }));
        const parsedFeedback = formatDocumentAttachmentTextParsedStatus(
          attachmentName,
          parsedAttachment.normalizedText.length,
          parsedAttachment.sourceLabel,
        );
        setDocumentSaveFeedback(parsedFeedback);
        setSaveLabel(parsedFeedback);
      } catch {
        const parseFailedFeedback = formatDocumentAttachmentTextParseFailedStatus(attachmentName);
        setDocumentSaveFeedback(parseFailedFeedback);
        setSaveLabel(parseFailedFeedback);
      }
    } catch (error) {
      console.error("Document attachment selection failed", error);
      const feedback = formatDocumentDraftAttachmentSelectionFailedStatusLabel(
        documentDraft.attachmentName,
        documentDraft.attachmentStatus,
      );
      setDocumentSaveFeedback(feedback);
      setSaveLabel(feedback);
      documentAttachmentInputRef.current?.click();
    }
  };

  const attachBrowserReference = async (file?: File) => {
    if (!file) return;
    clearDocumentDraftAttachmentPreviewUrl();
    documentDraftAttachmentFileRef.current = file;
    documentDraftAttachmentPreviewUrlRef.current = createAttachmentPreviewUrl(file);
    updateDocumentDraft({
      attachmentName: file.name,
      attachmentPath: undefined,
      attachmentStorage: "browser-reference",
      attachmentStatus: "브라우저 파일명 참조",
    });
    const feedback = formatDocumentDraftAttachmentReferenceReadyStatusLabel(file.name);
    setDocumentSaveFeedback(feedback);
    setSaveLabel(feedback);

    try {
      const parsedAttachment = await parseBrowserDocumentAttachmentText(file);
      if (!parsedAttachment) return;
      if (documentDraftAttachmentFileRef.current !== file) return;

      setDocumentDraft((current) => ({
        ...current,
        body: mergeParsedAttachmentTextIntoDocumentBody(
          current.body,
          file.name,
          parsedAttachment.normalizedText,
          parsedAttachment.sourceLabel,
        ),
      }));
      const parsedFeedback = formatDocumentAttachmentTextParsedStatus(
        file.name,
        parsedAttachment.normalizedText.length,
        parsedAttachment.sourceLabel,
      );
      setDocumentSaveFeedback(parsedFeedback);
      setSaveLabel(parsedFeedback);
    } catch {
      if (documentDraftAttachmentFileRef.current !== file) return;
      const parseFailedFeedback = formatDocumentAttachmentTextParseFailedStatus(file.name);
      setDocumentSaveFeedback(parseFailedFeedback);
      setSaveLabel(parseFailedFeedback);
    }
  };

  const clearDocumentAttachment = () => {
    const attachmentName = documentDraft.attachmentName;
    const attachmentStatus = documentDraft.attachmentStatus;
    documentDraftAttachmentFileRef.current = null;
    clearDocumentDraftAttachmentPreviewUrl();
    updateDocumentDraft({
      attachmentName: undefined,
      attachmentPath: undefined,
      attachmentStorage: undefined,
      attachmentStatus: undefined,
    });
    const feedback = formatDocumentDraftAttachmentClearedStatusLabel(
      attachmentName,
      attachmentStatus,
    );
    setDocumentSaveFeedback(feedback);
    setSaveLabel(feedback);
  };

  const openDocumentAttachment = async (document: CareDocument) => {
    if (!document.attachmentPath || !canUseTauriRuntime()) {
      const feedback = formatDocumentAttachmentFileNameOnlyStatusLabel(document);
      setDocumentActionFeedback({ documentId: document.id, message: feedback });
      setActionSaveLabel(feedback);
      return;
    }

    try {
      const [{ openPath }, { exists }] = await Promise.all([
        import("@tauri-apps/plugin-opener"),
        import("@tauri-apps/plugin-fs"),
      ]);
      const result = await resolveRuntimeAttachmentOpen(document, { exists, openPath });
      if (result.type === "recovery") {
        const { recovery } = result;
        updateDocumentAttachmentStatus(
          document.id,
          recovery.status,
          recovery.historyDetail,
          recovery.historyLabel,
        );
        setDocumentActionFeedback({ documentId: document.id, message: recovery.status });
        setActionSaveLabel(recovery.status);
        return;
      }

      setDocumentActionFeedback({ documentId: document.id, message: result.statusLabel });
      setActionSaveLabel(result.statusLabel);
    } catch (error) {
      console.error("Document attachment open failed", error);
      const recovery = buildAttachmentRecoveryUpdate("open-failure", document.attachmentName);
      updateDocumentAttachmentStatus(
        document.id,
        recovery.status,
        recovery.historyDetail,
        recovery.historyLabel,
      );
      setDocumentActionFeedback({ documentId: document.id, message: recovery.status });
      setActionSaveLabel(recovery.status);
    }
  };

  const updateDocumentAttachmentStatus = (
    documentId: string,
    attachmentStatus: string,
    historyDetail: string,
    historyLabel = "첨부 확인",
  ) => {
    const historyEntry = createDocumentHistory(
      "attachment-check",
      historyLabel,
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
      const recovery = buildFileNameOnlyAttachmentCheckRecovery(
        document.attachmentName,
        document.attachmentStatus,
      );
      if (recovery) {
        updateDocumentAttachmentStatus(
          document.id,
          recovery.status,
          recovery.historyDetail,
          recovery.historyLabel,
        );
        setDocumentActionFeedback({ documentId: document.id, message: recovery.status });
        setActionSaveLabel(recovery.status);
        return;
      }

      const status = "파일명 참조만 저장됨";
      const feedback = formatDocumentAttachmentFileNameOnlyStatusLabel(document);
      updateDocumentAttachmentStatus(document.id, status, `${document.attachmentName}: ${status}`);
      setDocumentActionFeedback({ documentId: document.id, message: feedback });
      setActionSaveLabel(feedback);
      return;
    }

    try {
      const { exists } = await import("@tauri-apps/plugin-fs");
      const attachmentExists = await exists(document.attachmentPath).catch(() => false);
      if (!attachmentExists) {
        const recovery = buildAttachmentRecoveryUpdate("missing-file", document.attachmentName);
        updateDocumentAttachmentStatus(
          document.id,
          recovery.status,
          recovery.historyDetail,
          recovery.historyLabel,
        );
        setDocumentActionFeedback({ documentId: document.id, message: recovery.status });
        setActionSaveLabel(recovery.status);
        return;
      }

      const status = "파일 확인됨";
      const feedback = formatDocumentAttachmentCheckedStatusLabel(document, status);
      updateDocumentAttachmentStatus(document.id, status, `${document.attachmentName}: ${status}`);
      setDocumentActionFeedback({ documentId: document.id, message: feedback });
      setActionSaveLabel(feedback);
    } catch (error) {
      console.error("Document attachment check failed", error);
      const recovery = buildAttachmentRecoveryUpdate("check-failure", document.attachmentName);
      updateDocumentAttachmentStatus(
        document.id,
        recovery.status,
        recovery.historyDetail,
        recovery.historyLabel,
      );
      setDocumentActionFeedback({ documentId: document.id, message: recovery.status });
      setActionSaveLabel(recovery.status);
    }
  };

  const clearBrowserAttachmentPreviewUrl = (documentId: string) => {
    const currentUrl = browserAttachmentPreviewUrlsRef.current[documentId];
    if (currentUrl) {
      revokeAttachmentPreviewUrl(currentUrl);
    }

    delete browserAttachmentPreviewUrlsRef.current[documentId];
    setBrowserAttachmentPreviewUrls((current) => {
      const next = { ...current };
      delete next[documentId];
      return next;
    });
  };

  const clearDocumentDraftAttachmentPreviewUrl = () => {
    if (!documentDraftAttachmentPreviewUrlRef.current) return;
    revokeAttachmentPreviewUrl(documentDraftAttachmentPreviewUrlRef.current);
    documentDraftAttachmentPreviewUrlRef.current = null;
  };

  const setBrowserAttachmentPreviewUrl = (documentId: string, previewUrl: string) => {
    clearBrowserAttachmentPreviewUrl(documentId);
    browserAttachmentPreviewUrlsRef.current[documentId] = previewUrl;
    setBrowserAttachmentPreviewUrls((current) => ({
      ...current,
      [documentId]: previewUrl,
    }));
  };

  const rememberBrowserAttachmentPreviewUrl = (documentId: string, file: File) => {
    const previewUrl = createAttachmentPreviewUrl(file);
    if (!previewUrl) return;
    setBrowserAttachmentPreviewUrl(documentId, previewUrl);
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

  const mergeParsedTextIntoSavedDocument = (
    documentId: string,
    fileName: string,
    normalizedText: string,
    sourceLabel: Parameters<typeof mergeParsedAttachmentTextIntoDocumentBody>[3],
  ) => {
    const historyEntry = createDocumentHistory(
      "attachment-replaced",
      "첨부 본문 파싱",
      `${fileName}: ${sourceLabel ?? "첨부 텍스트"} ${normalizedText.length}자 반영`,
    );

    setState((current) => ({
      ...current,
      documents: current.documents.map((document) =>
        document.id === documentId
          ? mergeParsedAttachmentTextIntoSavedDocument(
              document,
              fileName,
              normalizedText,
              sourceLabel,
              historyEntry,
            )
          : document,
      ),
    }));
  };

  const attachBrowserReferenceToSavedDocument = async (file?: File) => {
    if (!file || !savedAttachmentTargetId) return;
    const targetDocumentId = savedAttachmentTargetId;
    const targetDocument = state.documents.find((document) => document.id === targetDocumentId);

    rememberBrowserAttachmentPreviewUrl(targetDocumentId, file);
    updateSavedDocumentAttachment(targetDocumentId, {
      attachmentName: file.name,
      attachmentPath: undefined,
      attachmentStorage: "browser-reference",
      attachmentStatus: "브라우저 파일명 참조",
    });
    setSavedAttachmentTargetId(null);
    const feedback = targetDocument
      ? formatDocumentAttachmentReferenceStatusLabel(targetDocument, file.name)
      : "저장된 서류 첨부 파일명 참조 갱신";
    setDocumentActionFeedback({ documentId: targetDocumentId, message: feedback });
    setActionSaveLabel(feedback);

    try {
      const parsedAttachment = await parseBrowserDocumentAttachmentText(file);
      if (!parsedAttachment) return;

      mergeParsedTextIntoSavedDocument(
        targetDocumentId,
        file.name,
        parsedAttachment.normalizedText,
        parsedAttachment.sourceLabel,
      );
      const parsedFeedback = formatDocumentAttachmentTextParsedStatus(
        file.name,
        parsedAttachment.normalizedText.length,
        parsedAttachment.sourceLabel,
      );
      setDocumentActionFeedback({ documentId: targetDocumentId, message: parsedFeedback });
      setActionSaveLabel(parsedFeedback);
    } catch {
      const parseFailedFeedback = formatDocumentAttachmentTextParseFailedStatus(file.name);
      setDocumentActionFeedback({ documentId: targetDocumentId, message: parseFailedFeedback });
      setActionSaveLabel(parseFailedFeedback);
    }
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
            extensions: [
              "pdf",
              "png",
              "jpg",
              "jpeg",
              "webp",
              "docx",
              "xlsx",
              "csv",
              "txt",
              "md",
              "hwp",
              "hwpx",
            ],
          },
        ],
      });

      if (typeof selected !== "string") return;

      const attachmentExists = await exists(selected).catch(() => false);
      const attachmentStatus = attachmentExists ? "파일 확인됨" : "앱 샌드박스 경로 저장됨";
      const attachmentName = extractFileName(selected);
      clearBrowserAttachmentPreviewUrl(document.id);
      updateSavedDocumentAttachment(document.id, {
        attachmentName,
        attachmentPath: selected,
        attachmentStorage: "tauri-sandbox",
        attachmentStatus,
      });
      const feedback = attachmentExists
        ? formatDocumentAttachmentReconnectStatusLabel(document, attachmentName, attachmentStatus)
        : formatDocumentAttachmentPathUpdatedStatusLabel(document, attachmentName, attachmentStatus);
      setDocumentActionFeedback({ documentId: document.id, message: feedback });
      setActionSaveLabel(feedback);

      try {
        const parsedAttachment = await parseTauriSelectedDocumentAttachment(
          selected,
          attachmentName,
        );
        if (!parsedAttachment) return;

        mergeParsedTextIntoSavedDocument(
          document.id,
          attachmentName,
          parsedAttachment.normalizedText,
          parsedAttachment.sourceLabel,
        );
        const parsedFeedback = formatDocumentAttachmentTextParsedStatus(
          attachmentName,
          parsedAttachment.normalizedText.length,
          parsedAttachment.sourceLabel,
        );
        setDocumentActionFeedback({ documentId: document.id, message: parsedFeedback });
        setActionSaveLabel(parsedFeedback);
      } catch {
        const parseFailedFeedback = formatDocumentAttachmentTextParseFailedStatus(attachmentName);
        setDocumentActionFeedback({ documentId: document.id, message: parseFailedFeedback });
        setActionSaveLabel(parseFailedFeedback);
      }
    } catch (error) {
      console.error("Saved document attachment replacement failed", error);
      const feedback = formatDocumentAttachmentReconnectFailedStatusLabel(document);
      setDocumentActionFeedback({ documentId: document.id, message: feedback });
      setActionSaveLabel(feedback);
    }
  };

  const previewDocumentAttachment = async (document: CareDocument) => {
    if (!document.attachmentName || !isPreviewableImageAttachment(document.attachmentName)) {
      const feedback = formatDocumentAttachmentPreviewUnavailableStatusLabel(
        document,
        "이미지 첨부 아님",
      );
      setDocumentActionFeedback({ documentId: document.id, message: feedback });
      setSaveLabel(feedback);
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
      const feedback = formatDocumentAttachmentPreviewOpenedStatusLabel(document);
      setDocumentActionFeedback({ documentId: document.id, message: feedback });
      setSaveLabel(feedback);
      return;
    }

    if (!document.attachmentPath || !canUseTauriRuntime()) {
      const feedback = formatDocumentAttachmentPreviewUnavailableStatusLabel(
        document,
        "저장된 경로 또는 데스크톱 런타임 필요",
      );
      setDocumentActionFeedback({ documentId: document.id, message: feedback });
      setSaveLabel(feedback);
      return;
    }

    try {
      const [{ convertFileSrc }, { exists, readFile }] = await Promise.all([
        import("@tauri-apps/api/core"),
        import("@tauri-apps/plugin-fs"),
      ]);
      const result = await resolveRuntimeAttachmentPreview(document, {
        convertFileSrc,
        exists,
        loadImage: loadAttachmentPreviewImage,
        readFile,
      });
      if (result.type === "recovery") {
        const { recovery } = result;
        updateDocumentAttachmentStatus(
          document.id,
          recovery.status,
          recovery.historyDetail,
          recovery.historyLabel,
        );
        setDocumentActionFeedback({ documentId: document.id, message: recovery.status });
        setActionSaveLabel(recovery.status);
        return;
      }

      setAttachmentPreview({
        documentId: result.documentId,
        title: result.title,
        attachmentName: result.attachmentName,
        previewUrl: result.previewUrl,
        sourceLabel: result.sourceLabel,
      });
      setDocumentActionFeedback({ documentId: document.id, message: result.statusLabel });
      setSaveLabel(result.statusLabel);
    } catch (error) {
      console.error("Document attachment preview failed", error);
      const recovery = buildAttachmentRecoveryUpdate("preview-failure", document.attachmentName);
      updateDocumentAttachmentStatus(
        document.id,
        recovery.status,
        recovery.historyDetail,
        recovery.historyLabel,
      );
      setDocumentActionFeedback({ documentId: document.id, message: recovery.status });
      setActionSaveLabel(recovery.status);
    }
  };

  const handleAttachmentPreviewImageError = (preview: AttachmentPreviewState) => {
    const recovery = buildAttachmentRecoveryUpdate("preview-failure", preview.attachmentName);
    updateDocumentAttachmentStatus(
      preview.documentId,
      recovery.status,
      recovery.historyDetail,
      recovery.historyLabel,
    );
    setAttachmentPreview(null);
    setDocumentActionFeedback({ documentId: preview.documentId, message: recovery.status });
    setActionSaveLabel(recovery.status);
  };

  const closeAttachmentPreview = () => {
    const preview = attachmentPreview;
    setAttachmentPreview(null);
    if (!preview) {
      setSaveLabel(attachmentPreviewClosedStatusLabel);
      return;
    }

    const document = state.documents.find((item) => item.id === preview.documentId);
    if (!document) {
      setSaveLabel(attachmentPreviewClosedStatusLabel);
      return;
    }

    const feedback = formatDocumentAttachmentPreviewClosedStatusLabel(document);
    setDocumentActionFeedback({ documentId: document.id, message: feedback });
    setSaveLabel(feedback);
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
      const feedback = formatDocumentAttachmentRemovalFailedStatusLabel(document);
      setDocumentActionFeedback({ documentId: document.id, message: feedback });
      setActionSaveLabel(feedback);
      return false;
    }
  };

  const removeSavedDocumentAttachment = async (document: CareDocument) => {
    if (!hasAttachmentMetadata(document)) return;
    const confirmed = window.confirm(`"${document.title}" 첨부 파일 연결을 제거할까요?`);
    if (!confirmed) {
      const feedback = formatDocumentAttachmentRemovalCanceledStatusLabel(document);
      setDocumentActionFeedback({ documentId: document.id, message: feedback });
      setActionSaveLabel(feedback);
      return;
    }

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
    const feedback = formatDocumentAttachmentRemovedStatusLabel(document);
    setDocumentActionFeedback({ documentId: document.id, message: feedback });
    setActionSaveLabel(feedback);
  };

  const removeDeletedDocumentAttachment = async (document: CareDocument) => {
    if (!hasAttachmentMetadata(document)) return;
    const confirmed = window.confirm(
      `"${document.title}" 삭제 보관함의 첨부 연결만 정리할까요? 서류 기록은 그대로 복구할 수 있습니다.`,
    );
    if (!confirmed) {
      const feedback = formatDeletedDocumentAttachmentCleanupCanceledStatusLabel(document);
      setDocumentActionFeedback({ documentId: document.id, message: feedback });
      setActionSaveLabel(feedback);
      return;
    }

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
    const feedback = formatDeletedDocumentAttachmentCleanedStatusLabel(document);
    setDocumentActionFeedback({ documentId: document.id, message: feedback });
    setActionSaveLabel(feedback);
  };

  const deleteDocument = async (document: CareDocument) => {
    const confirmed = window.confirm(`"${document.title}" 서류 기록을 삭제 보관함으로 이동할까요?`);
    if (!confirmed) {
      const feedback = formatDocumentArchiveCanceledStatusLabel(document);
      setDocumentActionFeedback({ documentId: document.id, message: feedback });
      setActionSaveLabel(feedback);
      return;
    }

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
    const feedback = formatDocumentArchiveStatusLabel(document);
    setDocumentActionFeedback({ documentId: document.id, message: feedback });
    setActionSaveLabel(feedback);
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
    const feedback = formatDocumentRestoreStatusLabel(document);
    setDocumentActionFeedback({ documentId: document.id, message: feedback });
    setActionSaveLabel(feedback);
  };

  const updateSymptomDraft = (updates: Partial<SymptomEntry>) => {
    setSymptomDraft((current) => ({ ...current, ...updates }));
    setSymptomSaveFeedback(null);
  };

  const updateQuestionDraft = (updates: Partial<CareQuestion>) => {
    setQuestionDraft((current) => ({ ...current, ...updates }));
    setQuestionSaveFeedback(null);
  };

  const addSymptom = () => {
    const requiredFieldMessage = formatSymptomRequiredFieldMessage(
      symptomDraft.symptom,
      symptomDraft.body,
    );

    if (requiredFieldMessage) {
      setSymptomSaveFeedback(null);
      setRecordFormValidationFeedback("symptom", requiredFieldMessage);
      return;
    }

    const feedback = formatSymptomRecordSavedStatusLabel(symptomDraft);
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
    clearRecordFormValidationFeedback("symptom");
    setSymptomSaveFeedback(feedback);
    setActionSaveLabel(feedback);
  };

  const addQuestion = () => {
    const requiredFieldMessage = formatQuestionRequiredFieldMessage(
      questionDraft.topic,
      questionDraft.question,
    );

    if (requiredFieldMessage) {
      setQuestionSaveFeedback(null);
      setRecordFormValidationFeedback("question", requiredFieldMessage);
      return;
    }

    const feedback = formatQuestionDraftAddedStatus(questionDraft.topic, questionDraft.priority);
    setState((current) => ({
      ...current,
      questions: [...current.questions, { ...questionDraft, id: createId("question") }],
    }));
    setQuestionDraft({ ...emptyQuestion, date: today });
    clearRecordFormValidationFeedback("question");
    setQuestionSaveFeedback(feedback);
    setActionSaveLabel(feedback);
  };

  const applySymptomSupportTemplate = () => {
    if (!symptomSupportTemplate) return;
    const feedback = formatSymptomSupportQuestionDraftReadyStatus(symptomSupportTemplate);

    setQuestionSaveFeedback(null);
    setQuestionDraft((current) =>
      mergeGeneratedQuestionDraft(current, {
        date: getNextQuestionDate(state.visits, today),
        topic: `부작용: ${symptomSupportTemplate.label}`,
        question: buildSymptomSupportQuestion(symptomSupportTemplate, symptomDraft.symptom),
        priority: "next-visit",
        status: "open",
      }),
    );
    setSymptomSaveFeedback(null);
    setSymptomDraft((current) => ({
      ...current,
      action: current.action.trim()
        ? current.action
        : buildSymptomSupportActionNote(symptomSupportTemplate),
    }));
    setSymptomSupportQuestionFeedback(feedback);
    setSaveLabel(feedback);
    setQuestionDraftFocusRequest((request) => request + 1);
  };

  const applyInfectionFeverStandardDraft = () => {
    const template = findSymptomSupportTemplate("체온 38℃ 이상 오한 감염");
    if (!template) return;
    const feedback = formatSymptomSupportSymptomDraftReadyStatus(template);

    setSymptomSaveFeedback(null);
    setSymptomDraft((current) => {
      const currentBody = current.body.trim();
      const nextBody = currentBody
        ? current.body.includes(template.mealNote)
          ? current.body
          : `${currentBody}\n${template.mealNote}`
        : template.mealNote;
      const hasExistingSymptomText = current.symptom.trim() || currentBody;

      return {
        ...current,
        action: current.action.trim() ? current.action : buildSymptomSupportActionNote(template),
        body: nextBody,
        date: current.date || today,
        severity: hasExistingSymptomText ? current.severity : 5,
        symptom: current.symptom.trim() ? current.symptom : "발열·오한/감염 의심",
      };
    });
    setInfectionFeverStandardDraftFeedback(feedback);
    setSaveLabel(feedback);
    setSymptomDraftFocusRequest((request) => request + 1);
  };

  const applyInfectionFeverStandardQuestion = () => {
    const template = findSymptomSupportTemplate("체온 38℃ 이상 오한 감염");
    if (!template) return;

    const generatedQuestion = buildSymptomSupportQuestion(template, "체온 38℃ 이상 또는 오한");
    const feedback = formatSymptomSupportQuestionDraftReadyStatus(template);
    setQuestionSaveFeedback(null);
    setQuestionDraft((current) =>
      mergeGeneratedQuestionDraft(current, {
        date: getNextQuestionDate(state.visits, today),
        priority: "next-visit",
        question: generatedQuestion,
        status: "open",
        topic: `부작용: ${template.label}`,
      }),
    );
    setInfectionFeverStandardDraftFeedback(feedback);
    setSaveLabel(feedback);
    setQuestionDraftFocusRequest((request) => request + 1);
  };

  const applyCervicalCancerCarePrompt = (prompt: CervicalCancerCarePrompt) => {
    const feedback = formatCervicalCancerCarePromptQuestionDraftReadyStatus(prompt);

    setQuestionSaveFeedback(null);
    setQuestionDraft((current) =>
      mergeGeneratedQuestionDraft(
        current,
        buildCervicalCancerCarePromptQuestionDraft(
          prompt,
          getNextQuestionDate(state.visits, today),
        ),
      ),
    );
    setCervicalCancerCareQuestionFeedback(feedback);
    setSaveLabel(feedback);
    setQuestionDraftFocusRequest((request) => request + 1);
  };

  const applyCervicalCancerScreeningQuestion = () => {
    const feedback = formatCervicalCancerScreeningQuestionDraftReadyStatus(
      cervicalCancerScreeningSummary,
    );

    setQuestionSaveFeedback(null);
    setQuestionDraft((current) =>
      mergeGeneratedQuestionDraft(current, {
        date: getNextQuestionDate(state.visits, today),
        topic: "자궁경부암 검진",
        question: buildCervicalCancerScreeningQuestion(cervicalCancerScreeningSummary),
        priority: "next-visit",
        status: "open",
      }),
    );
    setCervicalCancerCareQuestionFeedback(feedback);
    setSaveLabel(feedback);
    setQuestionDraftFocusRequest((request) => request + 1);
  };

  const applyFoodQuestionDraft = () => {
    if (!foodQuestionDraft) {
      const feedback = formatFoodQuestionDraftUnavailableStatus(foodQuestionDraftInput);
      setFoodQuestionDraftFeedback(feedback);
      setSaveLabel(feedback);
      return;
    }

    setQuestionSaveFeedback(null);
    setQuestionDraft((current) =>
      mergeGeneratedQuestionDraft(current, {
        date: getNextQuestionDate(state.visits, today),
        priority: foodQuestionDraft.priority,
        question: foodQuestionDraft.question,
        status: "open",
        topic: foodQuestionDraft.topic,
      }),
    );
    const feedback = formatFoodQuestionDraftReadyStatus(foodQuestionDraftInput, foodQuestionDraft);
    setFoodQuestionDraftFeedback(feedback);
    setSaveLabel(feedback);
    setQuestionDraftFocusRequest((request) => request + 1);
  };

  const applyCervicalCancerCareAlert = (alert: CervicalCancerCareAlert) => {
    const draft = buildCervicalCancerAlertSymptomDraft(alert);
    const feedback = `자궁경부암 증상 초안 준비됨: ${alert.title}`;

    setSymptomSaveFeedback(null);
    setSymptomDraft((current) => {
      const currentBody = current.body.trim();
      const nextBody = currentBody
        ? current.body.includes(draft.body)
          ? current.body
          : `${currentBody}\n${draft.body}`
        : draft.body;

      return {
        ...current,
        action: current.action.trim() ? current.action : draft.action,
        body: nextBody,
        date: current.date || today,
        symptom: current.symptom.trim() ? current.symptom : draft.symptom,
      };
    });
    setCervicalCancerCareSymptomFeedback(feedback);
    setSaveLabel(feedback);
    setSymptomDraftFocusRequest((request) => request + 1);
  };

  const applyCervicalCancerCareItemDraft = (item: CervicalCancerCareRecordDraftItem) => {
    const draft = buildCervicalCancerCareItemSymptomDraft(item);
    const feedback = `자궁경부암 기록 메모 초안 준비됨: ${item.label}`;

    setSymptomSaveFeedback(null);
    setSymptomDraft((current) => {
      const currentBody = current.body.trim();
      const hasExistingSymptomText = Boolean(current.symptom.trim() || currentBody);
      const nextBody = currentBody
        ? current.body.includes(draft.body)
          ? current.body
          : `${currentBody}\n${draft.body}`
        : draft.body;

      return {
        ...current,
        action: current.action.trim() ? current.action : draft.action,
        body: nextBody,
        date: current.date || today,
        severity: hasExistingSymptomText ? current.severity : 3,
        symptom: current.symptom.trim() ? current.symptom : draft.symptom,
      };
    });
    setCervicalCancerCareSymptomFeedback(feedback);
    setSaveLabel(feedback);
    setSymptomDraftFocusRequest((request) => request + 1);
  };

  const copyCervicalCancerCareNote = () => {
    if (!navigator.clipboard?.writeText) {
      const feedback = formatCervicalCancerCareClipboardUnsupportedStatus(
        cervicalCancerCareClipboardSummary,
      );
      setCervicalCancerCareCopyFeedback(feedback);
      setSaveLabel(feedback);
      return;
    }

    navigator.clipboard
      .writeText(formatCervicalCancerCareClipboardText(state.profile))
      .then(() => {
        setCervicalCancerCareCopyFeedback(cervicalCancerCareClipboardStatus);
        setTransientSaveLabel(cervicalCancerCareClipboardStatus);
      })
      .catch(() => {
        const feedback = formatCervicalCancerCareClipboardFailedStatus(
          cervicalCancerCareClipboardSummary,
        );
        setCervicalCancerCareCopyFeedback(feedback);
        setSaveLabel(feedback);
      });
  };

  const renderCervicalCareItemSourceLink = (sourceId: string, itemLabel: string) => {
    const source = getCervicalCancerCareSource(sourceId);
    const linkLabels = buildCervicalCancerCareSourceLinkLabels(sourceId, itemLabel);

    return source ? (
      <a
        className="cervical-item-source"
        href={source.url}
        target="_blank"
        rel="noreferrer"
        aria-label={linkLabels.ariaLabel}
        title={linkLabels.title}
      >
        {linkLabels.visibleLabel}
        <ExternalLink aria-hidden="true" />
      </a>
    ) : (
      <small className="cervical-item-source">{linkLabels.visibleLabel}</small>
    );
  };

  const renderCervicalCareItemActions = (item: CervicalCancerCareRecordDraftItem) => (
    <div className="cervical-check-actions">
      <button
        type="button"
        className="secondary-inline-button cervical-check-draft-button"
        onClick={() => applyCervicalCancerCareItemDraft(item)}
        aria-label={formatCervicalCancerCareItemDraftActionLabel(item)}
        title={formatCervicalCancerCareItemDraftActionLabel(item)}
      >
        <ClipboardList aria-hidden="true" />
        기록 초안
      </button>
      {renderCervicalCareItemSourceLink(item.sourceId, item.label)}
    </div>
  );

  const applyLabPreset = (presetId: string) => {
    setLabPresetChoice(presetId);
    setLabSaveFeedback(null);
    const preset = resolveLabPreset(presetId, state.profile.sex);
    if (!preset) {
      setLabPresetFeedback(null);
      return;
    }
    const presetPreview = buildLabPresetPreview(presetId, state.profile.sex);
    const feedback = formatLabPresetAppliedStatusLabel(presetId, state.profile.sex);

    setLabDraft((current) => ({
      ...current,
      name: preset.name,
      unit: preset.unit,
      lower: preset.lower,
      upper: preset.upper,
      note: current.note.trim()
        ? current.note
        : formatLabPresetNoteWithSource(preset, presetPreview?.applicabilityLabel),
    }));
    setLabPresetFeedback(feedback);
    setSaveLabel(feedback);
  };

  const updateLabDraft = (updates: Partial<LabResult>) => {
    setLabDraft((current) => ({ ...current, ...updates }));
    setLabSaveFeedback(null);
  };

  const resetLabDraft = () => {
    const presetLabel = labPresetChoice
      ? labPresets.find((candidate) => candidate.id === labPresetChoice)?.label
      : "";
    const feedback = formatLabDraftResetStatusLabel(labDraft, presetLabel, today);
    setLabDraft({ ...emptyLabResult, date: today });
    setLabPresetChoice("");
    setLabPresetFeedback(feedback);
    setLabSaveFeedback(null);
    clearRecordFormValidationFeedback("lab");
    setSaveLabel(feedback);
  };

  const addLabResult = () => {
    const requiredFieldMessage = formatLabRequiredFieldMessage(labDraft.name, labDraft.value);
    if (requiredFieldMessage) {
      setLabSaveFeedback(null);
      setRecordFormValidationFeedback("lab", requiredFieldMessage);
      return;
    }

    const savedLabResult = { ...labDraft, id: createId("lab") };
    setState((current) => ({
      ...current,
      labResults: [...current.labResults, savedLabResult],
    }));
    setLabDraft({ ...emptyLabResult, date: today });
    setLabPresetChoice("");
    setLabPresetFeedback(null);
    clearRecordFormValidationFeedback("lab");
    const feedback = formatLabResultSavedStatusLabel(savedLabResult);
    setLabSaveFeedback(feedback);
    setActionSaveLabel(feedback);
  };

  const addLabQuestion = (lab: LabResult, assessment: ReturnType<typeof assessLabTextValue>) => {
    const questionPrompt = buildLabQuestionPrompt(lab, assessment);
    const includesSourceEvidence = Boolean(buildLabSourceEvidenceParts(lab).sourceLabel);
    const hasExistingQuestion = hasExistingLabFollowupQuestion(state.questions, questionPrompt);

    if (hasExistingQuestion) {
      const feedback = formatLabFollowupQuestionAlreadyAddedStatus(lab.name, includesSourceEvidence);
      setLabQuestionFeedback({ labId: lab.id, message: feedback });
      setActionSaveLabel(feedback);
      return;
    }

    const feedback = formatLabFollowupQuestionAddedStatus(
      lab.name,
      includesSourceEvidence,
    );

    setState((current) => ({
      ...current,
      questions: [
        ...current.questions,
        {
          id: createId("question"),
          date: getNextQuestionDate(current.visits, today),
          topic: "검사 수치",
          question: questionPrompt,
          priority: "high",
          status: "open",
          answer: "",
        },
      ],
    }));
    setLabQuestionFeedback({ labId: lab.id, message: feedback });
    setActionSaveLabel(feedback);
  };

  const updateQuestionStatus = (id: string, status: QuestionStatus) => {
    const targetQuestion = state.questions.find((question) => question.id === id);
    setState((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === id ? { ...question, status } : question,
      ),
    }));
    const feedback = formatQuestionStatusUpdateStatus(targetQuestion?.topic ?? "", status);
    setQuestionActionFeedback({ questionId: id, message: feedback });
    setActionSaveLabel(feedback);
  };

  const updateQuestionPriority = (id: string, priority: QuestionPriority) => {
    const targetQuestion = state.questions.find((question) => question.id === id);
    setState((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === id ? { ...question, priority } : question,
      ),
    }));
    const feedback = formatQuestionPriorityUpdateStatus(targetQuestion?.topic ?? "", priority);
    setQuestionActionFeedback({ questionId: id, message: feedback });
    setActionSaveLabel(feedback);
  };

  const copyQuestionForVisit = (question: CareQuestion) => {
    if (!navigator.clipboard?.writeText) {
      const feedback = formatQuestionClipboardCopyUnsupportedStatus(question);
      setQuestionActionFeedback({ questionId: question.id, message: feedback });
      setSaveLabel(feedback);
      return;
    }

    navigator.clipboard
      .writeText(formatQuestionClipboardText(question))
      .then(() => {
        const feedback = formatQuestionClipboardCopyStatus(question);
        setQuestionActionFeedback({ questionId: question.id, message: feedback });
        setTransientSaveLabel(feedback);
      })
      .catch(() => {
        const feedback = formatQuestionClipboardCopyFailedStatus(question);
        setQuestionActionFeedback({ questionId: question.id, message: feedback });
        setSaveLabel(feedback);
      });
  };

  const copyCareActionQueue = () => {
    if (!navigator.clipboard?.writeText) {
      const feedback = formatCareActionQueueCopyUnsupportedStatus(careActions);
      setCareActionQueueFeedback(feedback);
      setSaveLabel(feedback);
      return;
    }

    navigator.clipboard
      .writeText(formatCareActionQueueClipboardText(careActions, today))
      .then(() => {
        setCareActionQueueFeedback(careActionQueueCopyStatus);
        setTransientSaveLabel(careActionQueueCopyStatus);
      })
      .catch(() => {
        const feedback = formatCareActionQueueCopyFailedStatus(careActions);
        setCareActionQueueFeedback(feedback);
        setSaveLabel(feedback);
      });
  };

  const copyHealthStandards = () => {
    if (!navigator.clipboard?.writeText) {
      const feedback = formatHealthStandardRangeFilterCopyUnsupportedStatus(
        selectedHealthStandardRangeFilter.label,
        healthStandardRangeSummary,
      );
      setHealthStandardsCopyFeedback(feedback);
      setSaveLabel(feedback);
      return;
    }

    const pendingFeedback = formatHealthStandardRangeFilterCopyPendingStatus(
      selectedHealthStandardRangeFilter.label,
      healthStandardRangeSummary,
    );
    flushSync(() => {
      setHealthStandardsCopyFeedback(pendingFeedback);
      setSaveLabel(pendingFeedback);
    });

    navigator.clipboard
      .writeText(formatHealthStandardsClipboardText(state.profile.sex, standardRangeFilter))
      .then(() => {
        setHealthStandardsCopyFeedback(healthStandardsCopyStatus);
        setTransientSaveLabel(healthStandardsCopyStatus);
      })
      .catch(() => {
        const feedback = formatHealthStandardRangeFilterCopyFailedStatus(
          selectedHealthStandardRangeFilter.label,
          healthStandardRangeSummary,
        );
        setHealthStandardsCopyFeedback(feedback);
        setSaveLabel(feedback);
      });
  };

  const copyProfileMetricSexStandards = () => {
    if (!navigator.clipboard?.writeText) {
      const feedback = formatProfileMetricSexStandardCopyUnsupportedStatus(
        profileMetricSexLabel,
        profileMetricSexStandardChips,
      );
      setProfileMetricCopyFeedback(feedback);
      setSaveLabel(feedback);
      return;
    }

    navigator.clipboard
      .writeText(profileMetricSexStandardClipboardText)
      .then(() => {
        setProfileMetricCopyFeedback(profileMetricSexStandardCopyStatus);
        setTransientSaveLabel(profileMetricSexStandardCopyStatus);
      })
      .catch(() => {
        const feedback = formatProfileMetricSexStandardCopyFailedStatus(
          profileMetricSexLabel,
          profileMetricSexStandardChips,
        );
        setProfileMetricCopyFeedback(feedback);
        setSaveLabel(feedback);
      });
  };

  const copyDashboardMetricStandards = () => {
    if (!navigator.clipboard?.writeText) {
      const feedback = formatDashboardMetricStandardCopyUnsupportedStatus(
        dashboardMetricStandardEvidences,
      );
      setDashboardMetricCopyFeedback(feedback);
      setSaveLabel(feedback);
      return;
    }

    navigator.clipboard
      .writeText(dashboardMetricStandardClipboardText)
      .then(() => {
        setDashboardMetricCopyFeedback(dashboardMetricStandardCopyStatus);
        setTransientSaveLabel(dashboardMetricStandardCopyStatus);
      })
      .catch(() => {
        const feedback = formatDashboardMetricStandardCopyFailedStatus(
          dashboardMetricStandardEvidences,
        );
        setDashboardMetricCopyFeedback(feedback);
        setSaveLabel(feedback);
      });
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
    const stateToSave = flushPendingDocumentNextActionHistory();
    const normalizedMirrorToSave =
      stateToSave === state ? normalizedMirror : buildNormalizedCareVaultMirror(stateToSave, foodAssessment);
    persistedSaveQueue.enqueue({
      run: () => savePersistedState(stateToSave, { normalizedMirror: normalizedMirrorToSave }),
      onSuccess: async (backend) => {
        setStorageBackend(backend);
        const actionLabel = pendingActionLabelRef.current;
        pendingActionLabelRef.current = null;
        if (actionLabel?.trim()) {
          transientSaveLabelUntilRef.current = Date.now() + 2000;
        }
        setSaveLabel(formatStorageSavedWithActionLabel(backend, actionLabel));
        if (backend === "sqlite") {
          try {
            setNormalizedMirrorStatus(await loadNormalizedMirrorStatus());
          } catch {
            setNormalizedMirrorStatus(null);
          }
          return;
        }
        setNormalizedMirrorStatus(null);
      },
      onError: (error) => {
        logPersistedSaveError(error);
        setSaveLabel(formatStorageSaveFailedLabel(storageBackend));
      },
    });
  };

  const setTextFileDownloadStatus = (
    result: TextFileDownloadResult,
    downloadedStatus: string,
    fallbackLabel: string,
    fallbackSummary: string,
  ) => {
    if (result === "download-started") {
      setSaveLabel(downloadedStatus);
      return;
    }
    if (result === "clipboard-fallback") {
      setTransientSaveLabel(
        formatTextFileDownloadClipboardFallbackStatus(fallbackLabel, fallbackSummary),
      );
      return;
    }
    if (result === "unsupported") {
      setSaveLabel(formatTextFileDownloadUnsupportedStatus(fallbackLabel, fallbackSummary));
      return;
    }
    setSaveLabel(formatTextFileDownloadFailedStatus(fallbackLabel, fallbackSummary));
  };

  const buildVisitPacketExport = () =>
    buildVisitPacketMarkdown(state, {
      exportedAt: new Date().toISOString(),
      foodQuery: state.foodQuery,
      range: visitPacketRange,
    });

  const buildVisitPacketExportPreview = (): ExportPreviewState => ({
    content: buildVisitPacketExport(),
    filename: `carevault-visit-summary-${today}.md`,
    format: "진료 요약",
    mimeType: "text/markdown;charset=utf-8",
    title: `진료 요약 미리보기 (${visitPacketRangeLabels[visitPacketRange]})`,
    visitPacketExportFingerprint: buildVisitPacketExportFingerprint(state, state.foodQuery),
    visitPacketRangeSnapshot: visitPacketRange,
  });

  const buildCsvExport = () => buildCareVaultCsv(state, new Date().toISOString());

  const buildCsvExportPreview = (): ExportPreviewState => ({
    content: buildCsvExport(),
    csvExportFingerprint: buildCsvExportFingerprint(state),
    filename: `carevault-records-${today}.csv`,
    format: "CSV",
    mimeType: "text/csv;charset=utf-8",
    title: "CSV 미리보기",
  });

  const buildCaregiverExport = () => {
    const preset = getCaregiverShareSettingsPreset(state.caregiverShareSettings.presetId);
    return buildCaregiverExportHtml(state, new Date().toISOString(), {
      coverMemo: state.caregiverShareSettings.coverMemo,
      presetDescription: preset?.description,
      presetLabel: preset?.label,
      redactProfile: state.caregiverShareSettings.redactProfile,
      sections: state.caregiverShareSettings.sections,
    });
  };

  const buildCaregiverExportPreview = (): ExportPreviewState => ({
    caregiverShareContentFingerprint: buildCaregiverExportContentFingerprint(
      state,
      state.caregiverShareSettings.sections,
      { redactProfile: state.caregiverShareSettings.redactProfile },
    ),
    caregiverShareSettingsFingerprint: buildCaregiverShareSettingsFingerprint(
      state.caregiverShareSettings,
    ),
    caregiverShareSettingsSnapshot: normalizeCaregiverShareSettings(
      state.caregiverShareSettings,
    ),
    caregiverShareSettingsSummary: buildCaregiverShareSettingsPreviewSummary(
      state.caregiverShareSettings,
    ),
    content: buildCaregiverExport(),
    filename: `carevault-caregiver-share-${today}.html`,
    format: "보호자 공유본",
    mimeType: "text/html;charset=utf-8",
    title: "보호자 공유본 미리보기",
  });

  const showExportPreview = (preview: ExportPreviewState) => {
    setExportPreview(preview);
    setSaveLabel(`${preview.format} 미리보기 생성`);
  };

  const updateVisitPacketRange = (range: VisitPacketRange) => {
    setVisitPacketRange(range);
    setSaveLabel(`진료 요약 범위: ${visitPacketRangeLabels[range]}`);
  };

  const showCaregiverExportPreview = () => {
    showExportPreview(buildCaregiverExportPreview());
    setSaveLabel(formatCaregiverSharePreviewStatus(state.caregiverShareSettings));
  };
  const showVisitPacketExportPreview = () => {
    showExportPreview(buildVisitPacketExportPreview());
    setSaveLabel(formatVisitPacketPreviewStatus(visitPacketRange));
  };
  const showCsvExportPreview = () => {
    showExportPreview(buildCsvExportPreview());
    setSaveLabel(formatCsvPreviewStatus(state));
  };

  const isCaregiverExportPreviewStale = (preview: ExportPreviewState | null) =>
    Boolean(
      preview?.caregiverShareSettingsFingerprint &&
        preview.caregiverShareSettingsFingerprint !==
          buildCaregiverShareSettingsFingerprint(state.caregiverShareSettings),
    );

  const isCaregiverExportPreviewContentStale = (preview: ExportPreviewState | null) =>
    isCaregiverExportContentFingerprintStale(
      state,
      preview?.caregiverShareContentFingerprint,
      preview?.caregiverShareSettingsSnapshot?.sections ?? state.caregiverShareSettings.sections,
      {
        redactProfile:
          preview?.caregiverShareSettingsSnapshot?.redactProfile ??
          state.caregiverShareSettings.redactProfile,
      },
    );

  const isVisitPacketExportPreviewRangeStale = (preview: ExportPreviewState | null) =>
    Boolean(
      preview?.visitPacketRangeSnapshot &&
        preview.visitPacketRangeSnapshot !== visitPacketRange,
    );

  const isVisitPacketExportPreviewContentStale = (preview: ExportPreviewState | null) =>
    Boolean(
      preview?.visitPacketExportFingerprint &&
        preview.visitPacketExportFingerprint !==
          buildVisitPacketExportFingerprint(state, state.foodQuery),
    );

  const isCsvExportPreviewStale = (preview: ExportPreviewState | null) =>
    Boolean(
      preview?.csvExportFingerprint &&
        preview.csvExportFingerprint !== buildCsvExportFingerprint(state),
    );

  const setExportPreviewStaleSaveLabel = (reason: ExportPreviewFreshActionReason) => {
    if (!exportPreview) return;
    setSaveLabel(
      formatExportPreviewStaleStatus(
        exportPreview.format,
        buildExportPreviewSummary(exportPreview.content),
        reason,
      ),
    );
  };

  const guardFreshExportPreview = () => {
    if (isCaregiverExportPreviewStale(exportPreview)) {
      setExportPreviewStaleSaveLabel("caregiver-settings");
      return false;
    }
    if (isCaregiverExportPreviewContentStale(exportPreview)) {
      setExportPreviewStaleSaveLabel("caregiver-content");
      return false;
    }
    if (isVisitPacketExportPreviewRangeStale(exportPreview)) {
      setExportPreviewStaleSaveLabel("visit-range");
      return false;
    }
    if (isVisitPacketExportPreviewContentStale(exportPreview)) {
      setExportPreviewStaleSaveLabel("visit-content");
      return false;
    }
    if (isCsvExportPreviewStale(exportPreview)) {
      setExportPreviewStaleSaveLabel("csv-content");
      return false;
    }
    return true;
  };

  const downloadExportPreview = async () => {
    if (!exportPreview) return;
    if (!guardFreshExportPreview()) return;
    const summary = buildExportPreviewSummary(exportPreview.content);
    const result = await downloadTextFile(
      exportPreview.content,
      exportPreview.filename,
      exportPreview.mimeType,
    );
    setTextFileDownloadStatus(
      result,
      exportPreviewDownloadStatus || `${exportPreview.format} 내보냄`,
      formatExportPreviewDownloadFallbackLabel(exportPreview.format),
      formatExportPreviewCompactSummary(summary),
    );
  };

  const copyExportPreview = () => {
    if (!exportPreview) return;
    if (!guardFreshExportPreview()) return;
    const summary = buildExportPreviewSummary(exportPreview.content);

    if (!navigator.clipboard?.writeText) {
      setSaveLabel(formatExportPreviewCopyUnsupportedStatus(exportPreview.format, summary));
      return;
    }

    navigator.clipboard
      .writeText(exportPreview.content)
      .then(() =>
        setTransientSaveLabel(exportPreviewCopyStatus || `${exportPreview.format} 미리보기 복사됨`),
      )
      .catch(() =>
        setSaveLabel(formatExportPreviewCopyFailedStatus(exportPreview.format, summary)),
      );
  };

  const printExportPreview = () => {
    if (!exportPreview) return;
    if (!guardFreshExportPreview()) return;
    const summary = buildExportPreviewSummary(exportPreview.content);
    const printResult = printExportPreviewInFrame({
      content: exportPreview.content,
      filename: exportPreview.filename,
      isHtml: isHtmlExportPreview(exportPreview),
      title: exportPreview.title,
    });

    if (printResult === "frame-unavailable") {
      setSaveLabel(formatExportPreviewPrintUnavailableStatus(exportPreview.format, summary));
      return;
    }
    if (printResult === "print-failed") {
      setSaveLabel(formatExportPreviewPrintFailedStatus(exportPreview.format, summary));
      return;
    }
    setSaveLabel(exportPreviewPrintStatus || `${exportPreview.format} 인쇄 준비`);
  };

  const closeExportPreview = () => {
    if (!exportPreview) return;
    const summary = buildExportPreviewSummary(exportPreview.content);
    setExportPreview(null);
    setSaveLabel(formatExportPreviewCloseStatus(exportPreview.format, summary));
  };

  const exportBackup = async () => {
    const payload = {
      app: "CareVault",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      state: sanitizeCareVaultBackupState(state),
    };
    const result = await downloadTextFile(
      JSON.stringify(payload, null, 2),
      `carevault-backup-${today}.json`,
      "application/json;charset=utf-8",
    );
    setTextFileDownloadStatus(
      result,
      formatCareVaultBackupExportStatus(state),
      "백업",
      formatCareVaultBackupScopeCompactSummary(state),
    );
  };

  const exportVisitPacket = async () => {
    const markdown = buildVisitPacketExport();
    const result = await downloadTextFile(
      markdown,
      `carevault-visit-summary-${today}.md`,
      "text/markdown;charset=utf-8",
    );
    setTextFileDownloadStatus(
      result,
      formatVisitPacketExportStatus(visitPacketRange),
      "진료 요약",
      `범위 ${visitPacketRangeLabels[visitPacketRange]}`,
    );
  };

  const exportCsvCompanion = async () => {
    const csv = buildCsvExport();
    const result = await downloadTextFile(
      csv,
      `carevault-records-${today}.csv`,
      "text/csv;charset=utf-8",
    );
    setTextFileDownloadStatus(
      result,
      formatCsvExportStatus(state),
      "CSV",
      formatCsvExportScopeSummary(state),
    );
  };

  const exportCaregiverHtml = async () => {
    const html = buildCaregiverExport();
    const result = await downloadTextFile(
      html,
      `carevault-caregiver-share-${today}.html`,
      "text/html;charset=utf-8",
    );
    setTextFileDownloadStatus(
      result,
      formatCaregiverShareExportStatus(state.caregiverShareSettings),
      "보호자 공유본",
      formatCaregiverShareSettingsCompactSummary(state.caregiverShareSettings),
    );
  };

  const importBackup = (file: File | undefined) => {
    if (!file) return;

    const showImportFailure = (detail: string) => {
      setBackupImportFeedback({
        detail,
        title: "백업 가져오기 실패",
        tone: "error",
      });
      setSaveLabel(formatCareVaultBackupImportFailureStatus());
    };

    const reader = new FileReader();
    reader.onerror = () => {
      setBackupImportFeedback({
        detail: "파일을 읽지 못했습니다. 기존 건강 기록은 그대로 유지되었습니다.",
        title: "백업 가져오기 실패",
        tone: "error",
      });
      setSaveLabel(formatCareVaultBackupImportReadFailureStatus());
    };
    reader.onload = () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(String(reader.result));
      } catch {
        showImportFailure(
          "JSON 파일 형식을 확인하세요. 기존 건강 기록은 그대로 유지되었습니다.",
        );
        return;
      }

      const imported = prepareCareVaultBackupImport(parsed);
      if (imported.type === "error") {
        showImportFailure(
          `${describeCareVaultBackupImportFailure(imported.reason)} 기존 건강 기록은 그대로 유지되었습니다.`,
        );
        return;
      }

      setState(normalizeAppState(imported.state as Partial<AppState>));
      setExportPreview(null);
      setAttachmentPreview(null);
      setBackupImportFeedback({
        detail: formatCareVaultBackupImportSuccessDetail(imported.state),
        title: "백업 가져오기 완료",
        tone: "success",
      });
      setActionSaveLabel(formatCareVaultBackupImportStatus(imported.state));
    };
    reader.readAsText(file);
  };

  const updateCaregiverShareSettings = (
    updates: Partial<CaregiverShareSettings>,
    actionLabel?: string,
  ) => {
    setState((current) => ({
      ...current,
      caregiverShareSettings: normalizeCaregiverShareSettings({
        ...current.caregiverShareSettings,
        presetId: "",
        ...updates,
      }),
    }));
    if (actionLabel) setActionSaveLabel(actionLabel);
  };

  const updateCaregiverShareSection = (id: CaregiverExportSectionId, checked: boolean) => {
    const currentSettings = normalizeCaregiverShareSettings(state.caregiverShareSettings);
    const nextSettings = normalizeCaregiverShareSettings({
      ...currentSettings,
      presetId: "",
      sections: {
        ...currentSettings.sections,
        [id]: checked,
      },
    });

    setState((current) => ({
      ...current,
      caregiverShareSettings: nextSettings,
    }));
    setActionSaveLabel(
      formatCaregiverShareSectionStatus(getCaregiverShareSectionLabel(id), checked, nextSettings),
    );
  };

  const resetCaregiverShareSettings = () => {
    setState((current) => ({
      ...current,
      caregiverShareSettings: createDefaultCaregiverShareSettings(),
    }));
    setActionSaveLabel(formatCaregiverShareResetStatus());
  };

  const applyCaregiverSharePreset = (presetId: string) => {
    const preset = getCaregiverShareSettingsPreset(presetId);
    if (!preset) return;
    const selectedSettings = normalizeCaregiverShareSettings({
      ...preset.settings,
      presetId: preset.id,
    });

    setState((current) => ({
      ...current,
      caregiverShareSettings: selectedSettings,
    }));
    setActionSaveLabel(formatCaregiverSharePresetStatus(preset.label, selectedSettings));
  };

  const showRenderedExportPreview = exportPreview ? isHtmlExportPreview(exportPreview) : false;
  const exportPreviewHasStaleCaregiverSettings = isCaregiverExportPreviewStale(exportPreview);
  const exportPreviewHasStaleCaregiverContent =
    !exportPreviewHasStaleCaregiverSettings &&
    isCaregiverExportPreviewContentStale(exportPreview);
  const exportPreviewHasStaleVisitPacketRange =
    isVisitPacketExportPreviewRangeStale(exportPreview);
  const exportPreviewHasStaleVisitPacketContent =
    isVisitPacketExportPreviewContentStale(exportPreview);
  const exportPreviewHasStaleCsvState = isCsvExportPreviewStale(exportPreview);
  const exportPreviewHasStaleState =
    exportPreviewHasStaleCaregiverSettings ||
    exportPreviewHasStaleCaregiverContent ||
    exportPreviewHasStaleVisitPacketRange ||
    exportPreviewHasStaleVisitPacketContent ||
    exportPreviewHasStaleCsvState;
  const exportPreviewDisabledReason = exportPreviewHasStaleCaregiverSettings
    ? "공유 설정이 바뀌어 다시 생성이 필요합니다."
    : exportPreviewHasStaleCaregiverContent
      ? "보호자 공유본 기록이 바뀌어 다시 생성이 필요합니다."
      : exportPreviewHasStaleVisitPacketRange
        ? "진료 요약 범위가 바뀌어 다시 생성이 필요합니다."
        : exportPreviewHasStaleVisitPacketContent
          ? "진료 요약 기록이 바뀌어 다시 생성이 필요합니다."
          : exportPreviewHasStaleCsvState
            ? "CSV 기록이 바뀌어 다시 생성이 필요합니다."
            : undefined;
  useEffect(() => {
    if (!exportPreview || !exportPreviewHasStaleState) return;

    const timeoutId = window.setTimeout(() => {
      const target =
        exportPreviewPanelRef.current?.querySelector<HTMLElement>(
          ".export-preview-stale-alert",
        ) ??
        exportPreviewStaleAlertRef.current ??
        exportPreviewPanelRef.current;
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ behavior: "auto", block: "center" });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [exportPreview, exportPreviewDisabledReason, exportPreviewHasStaleState]);

  const activeCaregiverSectionCount = Object.values(
    state.caregiverShareSettings.sections,
  ).filter(Boolean).length;
  const caregiverShareSectionSummary = buildCaregiverShareSectionSummary(
    state.caregiverShareSettings,
  );
  const caregiverShareSectionSummaryAriaLabel =
    formatCaregiverShareSectionSummaryAriaLabel(caregiverShareSectionSummary);
  const caregiverShareSettingsPanelSummary = buildCaregiverShareSettingsPanelSummary(
    state.caregiverShareSettings,
  );
  const selectedCaregiverSharePresetLabel =
    getCaregiverShareSettingsPreset(state.caregiverShareSettings.presetId)?.label ??
    "프리셋 미선택";
  const caregiverSharePresetSelectDescription = formatCaregiverSharePresetSelectDescription(
    selectedCaregiverSharePresetLabel,
  );
  const caregiverShareExportDescription = formatCaregiverShareExportDescription(
    state.caregiverShareSettings,
  );
  const caregiverSharePreviewDescription = formatCaregiverSharePreviewDescription(
    state.caregiverShareSettings,
  );
  const caregiverShareResetDescription = formatCaregiverShareResetDescription(
    state.caregiverShareSettings,
  );
  const backupExportDescription = formatCareVaultBackupExportDescription(state);
  const backupImportDescription = formatCareVaultBackupImportDescription();
  const visitPacketExportDescription = formatVisitPacketExportDescription(visitPacketRange);
  const visitPacketPreviewDescription = formatVisitPacketPreviewDescription(visitPacketRange);
  const csvExportDescription = formatCsvExportDescription(state);
  const csvPreviewDescription = formatCsvPreviewDescription(state);
  const caregiverSettingsFreshPreviewDescription = formatExportPreviewFreshActionDescription(
    "caregiver-settings",
  );
  const caregiverContentFreshPreviewDescription = formatExportPreviewFreshActionDescription(
    "caregiver-content",
  );
  const visitPacketRangeFreshPreviewDescription = formatExportPreviewFreshActionDescription(
    "visit-range",
  );
  const visitPacketContentFreshPreviewDescription = formatExportPreviewFreshActionDescription(
    "visit-content",
  );
  const csvFreshPreviewDescription = formatExportPreviewFreshActionDescription("csv-content");
  const visitDraftHasRequiredFields = hasRequiredTextValues(
    visitDraft.hospital,
    visitDraft.reason,
  );
  const visitAddActionLabel = formatVisitAddActionLabel(
    visitDraft,
    visitDraftHasRequiredFields,
  );
  const questionDraftHasRequiredFields = hasRequiredTextValues(
    questionDraft.topic,
    questionDraft.question,
  );
  const questionDraftAddActionLabel = formatQuestionDraftAddActionLabel(
    questionDraft.priority,
    questionDraftHasRequiredFields,
    questionDraft.topic,
  );
  const labAddActionLabel = formatLabAddActionLabel(labDraft);
  const caregiverPreviewSettingDifferences =
    exportPreviewHasStaleCaregiverSettings && exportPreview?.caregiverShareSettingsSnapshot
      ? buildCaregiverShareSettingsDifferences(
          exportPreview.caregiverShareSettingsSnapshot,
          state.caregiverShareSettings,
        )
      : [];
  const exportPreviewSummary = exportPreview
    ? buildExportPreviewSummary(exportPreview.content)
    : null;
  const exportPreviewCopyDescription =
    exportPreview && exportPreviewSummary
      ? formatExportPreviewCopyDescription(exportPreview.format, exportPreviewSummary)
      : "";
  const exportPreviewCopyStatus =
    exportPreview && exportPreviewSummary
      ? formatExportPreviewCopyStatus(exportPreview.format, exportPreviewSummary)
      : "";
  const exportPreviewPrintDescription =
    exportPreview && exportPreviewSummary
      ? formatExportPreviewPrintDescription(exportPreview.format, exportPreviewSummary)
      : "";
  const exportPreviewPrintStatus =
    exportPreview && exportPreviewSummary
      ? formatExportPreviewPrintStatus(exportPreview.format, exportPreviewSummary)
      : "";
  const exportPreviewDownloadDescription =
    exportPreview && exportPreviewSummary
      ? formatExportPreviewDownloadDescription(exportPreview.format, exportPreviewSummary)
      : "";
  const exportPreviewDownloadStatus =
    exportPreview && exportPreviewSummary
      ? formatExportPreviewDownloadStatus(exportPreview.format, exportPreviewSummary)
      : "";
  const exportPreviewCopyActionDescription = formatExportPreviewDisabledActionDescription(
    exportPreviewCopyDescription,
    exportPreviewDisabledReason,
  );
  const exportPreviewPrintActionDescription = formatExportPreviewDisabledActionDescription(
    exportPreviewPrintDescription,
    exportPreviewDisabledReason,
  );
  const exportPreviewDownloadActionDescription = formatExportPreviewDisabledActionDescription(
    exportPreviewDownloadDescription,
    exportPreviewDisabledReason,
  );
  const hasCustomCaregiverSettings = hasCustomCaregiverShareSettings(state.caregiverShareSettings);

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
          {sidebarNavigationItems.map((item) => {
            const SidebarIcon = sidebarNavigationIcon[item.id];

            return (
              <a
                href={item.href}
                aria-current={activeSectionId === item.id ? "page" : undefined}
                aria-label={item.actionLabel}
                title={item.actionLabel}
                onClick={() => setActiveSectionId(item.id)}
                key={item.id}
              >
                <SidebarIcon aria-hidden="true" />
                {item.visibleLabel}
              </a>
            );
          })}
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
            <span className="mode-chip">
              {state.profile.cancerCareMode ? "암환자 관리 모드" : "일반 관리 모드"}
            </span>
            <span aria-live="polite" className="save-status-chip" role="status">
              {saveLabel}
            </span>
            <button
              type="button"
              className="secondary-button"
              onClick={exportBackup}
              aria-label={backupExportDescription}
              title={backupExportDescription}
            >
              <Download aria-hidden="true" />
              백업 내보내기
            </button>
            <select
              className="summary-range-select"
              aria-label="진료 요약 범위"
              title="진료 요약 범위"
              value={visitPacketRange}
              onChange={(event) =>
                updateVisitPacketRange(event.currentTarget.value as VisitPacketRange)
              }
            >
              <option value="7d">요약 7일</option>
              <option value="30d">요약 30일</option>
              <option value="90d">요약 90일</option>
              <option value="all">요약 전체</option>
            </select>
            <button
              type="button"
              className="secondary-button"
              onClick={exportVisitPacket}
              aria-label={visitPacketExportDescription}
              title={visitPacketExportDescription}
            >
              <FileText aria-hidden="true" />
              요약 내보내기
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={showVisitPacketExportPreview}
              aria-label={visitPacketPreviewDescription}
              title={visitPacketPreviewDescription}
            >
              <Eye aria-hidden="true" />
              요약 미리보기
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={exportCsvCompanion}
              aria-label={csvExportDescription}
              title={csvExportDescription}
            >
              <Download aria-hidden="true" />
              CSV 내보내기
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={showCsvExportPreview}
              aria-label={csvPreviewDescription}
              title={csvPreviewDescription}
            >
              <Eye aria-hidden="true" />
              CSV 미리보기
            </button>
            <label className="caregiver-profile-redaction">
              <input
                type="checkbox"
                checked={state.caregiverShareSettings.redactProfile}
                aria-label={formatCaregiverShareProfileRedactionToggleLabel(
                  state.caregiverShareSettings.redactProfile,
                )}
                title={formatCaregiverShareProfileRedactionToggleLabel(
                  state.caregiverShareSettings.redactProfile,
                )}
                onChange={(event) =>
                  updateCaregiverShareSettings(
                    {
                      redactProfile: event.currentTarget.checked,
                    },
                    event.currentTarget.checked
                      ? "보호자 공유 프로필 가림"
                      : "보호자 공유 프로필 표시",
                  )
                }
              />
              프로필 가리기
            </label>
            <textarea
              className="caregiver-cover-memo"
              aria-label="보호자 공유본 전달 메모"
              title="보호자 공유본 전달 메모"
              rows={2}
              value={state.caregiverShareSettings.coverMemo}
              onChange={(event) =>
                updateCaregiverShareSettings(
                  {
                    coverMemo: event.currentTarget.value,
                  },
                  "보호자 전달 메모 수정됨",
                )
              }
              placeholder="보호자에게 전달할 메모"
            />
            <div className="caregiver-memo-presets" aria-label="보호자 공유본 메모 프리셋">
              {caregiverMemoPresets.map((preset) => {
                const actionLabel = formatCaregiverShareMemoPresetActionLabel(preset.label);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    className="memo-preset-button"
                    aria-label={actionLabel}
                    title={actionLabel}
                    onClick={() =>
                      updateCaregiverShareSettings(
                        { coverMemo: preset.text },
                        `전달 메모 프리셋 적용: ${preset.label}`,
                      )
                    }
                  >
                    <MessageSquare aria-hidden="true" />
                    {preset.label} 적용
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="caregiver-reset-button"
              onClick={resetCaregiverShareSettings}
              disabled={!hasCustomCaregiverSettings}
              aria-label={caregiverShareResetDescription}
              title={caregiverShareResetDescription}
            >
              <RotateCcw aria-hidden="true" />
              공유 설정 초기화
            </button>
            <select
              className="caregiver-share-preset-select"
              aria-label={caregiverSharePresetSelectDescription}
              title={caregiverSharePresetSelectDescription}
              value={state.caregiverShareSettings.presetId}
              onChange={(event) => applyCaregiverSharePreset(event.currentTarget.value)}
            >
              <option value="">공유 프리셋</option>
              {caregiverShareSettingPresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
            <div
              className="caregiver-settings-summary"
              role="status"
              aria-label={caregiverShareSettingsPanelSummary.ariaLabel}
            >
              {caregiverShareSettingsPanelSummary.items.map((item) => (
                <span
                  className={`caregiver-settings-summary-chip summary-${item.id}`}
                  key={item.id}
                  title={item.title}
                >
                  <b>{item.label}</b>
                  <strong>{item.value}</strong>
                </span>
              ))}
            </div>
            <fieldset className="caregiver-section-options" aria-label="보호자 공유본 포함 섹션">
              <legend>공유본 포함</legend>
              {caregiverShareSectionOptions.map((option) => {
                const checked = state.caregiverShareSettings.sections[option.id];
                const isOnlyIncludedSection = checked && activeCaregiverSectionCount === 1;
                const toggleLabel = formatCaregiverShareSectionToggleLabel(
                  option.label,
                  checked,
                  isOnlyIncludedSection,
                );
                return (
                  <label key={option.id}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={isOnlyIncludedSection}
                      aria-label={toggleLabel}
                      title={toggleLabel}
                      onChange={() => updateCaregiverShareSection(option.id, !checked)}
                    />
                    {option.label}
                  </label>
                );
              })}
            </fieldset>
            <div
              className="caregiver-section-summary"
              role="status"
              aria-label={caregiverShareSectionSummaryAriaLabel}
            >
              <strong>공유 섹션</strong>
              <span>{caregiverShareSectionSummary.includedText}</span>
              <small>제외 {caregiverShareSectionSummary.excludedText}</small>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={exportCaregiverHtml}
              aria-label={caregiverShareExportDescription}
              title={caregiverShareExportDescription}
            >
              <FileText aria-hidden="true" />
              공유본 내보내기
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={showCaregiverExportPreview}
              aria-label={caregiverSharePreviewDescription}
              title={caregiverSharePreviewDescription}
            >
              <Eye aria-hidden="true" />
              공유본 미리보기
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => importInputRef.current?.click()}
              aria-label={backupImportDescription}
              title={backupImportDescription}
            >
              <Upload aria-hidden="true" />
              백업 가져오기
            </button>
            <input
              ref={importInputRef}
              className="visually-hidden"
              type="file"
              tabIndex={-1}
              aria-hidden="true"
              accept="application/json"
              aria-label={formControlDescriptions.backupImportFile}
              title={formControlDescriptions.backupImportFile}
              onChange={(event) => {
                importBackup(event.currentTarget.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
            <button
              type="button"
              onClick={saveNow}
              aria-label="현재 CareVault 기록 수동 저장"
              title="현재 CareVault 기록 수동 저장"
            >
              <Save aria-hidden="true" />
              수동 저장
            </button>
          </div>
        </header>
        {backupImportFeedback ? (
          <section
            className={`backup-import-feedback tone-${backupImportFeedback.tone}`}
            role={backupImportFeedback.tone === "error" ? "alert" : "status"}
            aria-label={backupImportFeedback.title}
          >
            {backupImportFeedback.tone === "error" ? (
              <AlertTriangle aria-hidden="true" />
            ) : (
              <ShieldCheck aria-hidden="true" />
            )}
            <div>
              <strong>{backupImportFeedback.title}</strong>
              <span>{backupImportFeedback.detail}</span>
            </div>
          </section>
        ) : null}

        <section id="dashboard" className="metrics-grid" aria-label="핵심 지표">
          <article className="metric-card">
            <UserRound aria-hidden="true" />
            <span>프로필</span>
            <strong>
              {profileAgeDisplay} · {sexLabel[state.profile.sex]}
            </strong>
            <small>
              {profileHeightDisplay} / {profileWeightDisplay}
              {profileWaistDisplay ? ` · 허리 ${profileWaistDisplay}` : ""}
            </small>
            <div
              className="metric-profile-standards"
              aria-label={`프로필 성별 적용 기준 ${sexLabel[state.profile.sex]}`}
            >
              <span className="metric-profile-standard-heading">현재 성별 기준</span>
              {profileMetricSexStandardChips.map((item) => (
                <span
                  key={item.id}
                  className="metric-profile-standard-chip"
                  aria-label={`${item.label}: ${item.detail}. 근거: ${item.sourceLabel}`}
                  title={`${item.label}: ${item.detail}. 근거: ${item.sourceLabel}`}
                >
                  <b>{item.label}</b>
                  <span className="metric-profile-standard-separator" aria-hidden="true">
                    ·
                  </span>
                  <span>{item.detail}</span>
                  <ShieldCheck
                    className="metric-profile-standard-source-icon"
                    aria-hidden="true"
                  />
                </span>
              ))}
              <button
                type="button"
                className="secondary-inline-button metric-profile-copy-button"
                onClick={copyProfileMetricSexStandards}
                aria-label={profileMetricSexStandardCopyDescription}
                title={profileMetricSexStandardCopyDescription}
              >
                <Copy aria-hidden="true" />
                성별 기준 복사
              </button>
              {profileMetricCopyFeedback ? (
                <div className="metric-profile-copy-feedback" role="status">
                  {profileMetricCopyFeedback}
                </div>
              ) : null}
            </div>
            <div
              className="metric-dashboard-standard-actions"
              aria-label={`대시보드 건강 기준 ${dashboardMetricStandardCompactSummary}`}
            >
              <span className="metric-profile-standard-heading">대시보드 기준</span>
              <span className="metric-dashboard-standard-summary">
                {dashboardMetricStandardCompactSummary}
              </span>
              <button
                type="button"
                className="secondary-inline-button metric-profile-copy-button metric-dashboard-standard-copy-button"
                onClick={copyDashboardMetricStandards}
                aria-label={dashboardMetricStandardCopyDescription}
                title={dashboardMetricStandardCopyDescription}
              >
                <Copy aria-hidden="true" />
                대시보드 기준 복사
              </button>
              {dashboardMetricCopyFeedback ? (
                <div className="metric-dashboard-standard-feedback" role="status">
                  {dashboardMetricCopyFeedback}
                </div>
              ) : null}
            </div>
          </article>
          <article className={`metric-card status-${bmi.level}`}>
            <Activity aria-hidden="true" />
            <span>BMI</span>
            <strong>{bmi.value ? bmi.value.toFixed(1) : "-"}</strong>
            <small>{bmi.label}</small>
            {renderMetricStandardEvidence(bmiMetricStandardEvidence)}
          </article>
          <article className={`metric-card status-${waistStatus.level}`}>
            <Activity aria-hidden="true" />
            <span>허리둘레</span>
            <strong>{waistStatus.value ? `${waistStatus.value} cm` : "-"}</strong>
            <small>{waistStatus.label}</small>
            {renderMetricStandardEvidence(waistMetricStandardEvidence)}
          </article>
          <article className={`metric-card status-${bpStatus?.level ?? "neutral"}`}>
            <HeartPulse aria-hidden="true" />
            <span>최근 혈압</span>
            <strong>{latestBp ? formatVitalMetricValue(latestBp) : "-"}</strong>
            {latestBp ? (
              <small
                className={`metric-record-label metric-record-label-${bpStatus?.level ?? "neutral"}`}
              >
                {formatVitalMetricRecordLabel(latestBp)}
              </small>
            ) : (
              <small>입력 대기</small>
            )}
            {renderMetricStandardEvidence(bloodPressureMetricStandardEvidence)}
          </article>
          <article className={`metric-card status-${glucoseStatus?.level ?? "neutral"}`}>
            <ClipboardList aria-hidden="true" />
            <span>최근 혈당</span>
            <strong>{latestGlucose ? formatVitalMetricValue(latestGlucose) : "-"}</strong>
            {latestGlucose ? (
              <small
                className={`metric-record-label metric-record-label-${glucoseStatus?.level ?? "neutral"}`}
              >
                {formatVitalMetricRecordLabel(latestGlucose, {
                  diabetes: state.profile.diabetes,
                })}
              </small>
            ) : (
              <small>입력 대기</small>
            )}
            {renderMetricStandardEvidence(glucoseMetricStandardEvidence)}
          </article>
          <article className={`metric-card status-${temperatureStatus?.level ?? "neutral"}`}>
            <Thermometer aria-hidden="true" />
            <span>최근 체온</span>
            <strong>{latestTemperature ? formatVitalMetricValue(latestTemperature) : "-"}</strong>
            {latestTemperature ? (
              <small
                className={`metric-record-label metric-record-label-${temperatureStatus?.level ?? "neutral"}`}
              >
                {formatVitalMetricRecordLabel(latestTemperature)}
              </small>
            ) : (
              <small>입력 대기</small>
            )}
            {renderMetricStandardEvidence(temperatureMetricStandardEvidence)}
          </article>
          <article className={`metric-card status-${latestSymptom ? symptomLevel : "neutral"}`}>
            <Pill aria-hidden="true" />
            <span>최근 증상</span>
            <strong>{latestSymptom ? `${latestSymptom.severity}/10` : "-"}</strong>
            <small>{latestSymptom?.symptom ?? "입력 대기"}</small>
            {latestSymptom ? (
              <>
                <small className="metric-record-label">{latestSymptomRecordLabel}</small>
                {latestSymptomHasSourceEvidence && latestSymptomDisplay ? (
                  <small
                    className="metric-source-evidence"
                    aria-label={`최근 증상 근거 ${latestSymptomSourceEvidenceLabels}`}
                  >
                    <ShieldCheck aria-hidden="true" />
                    <span>근거:</span>
                    {latestSymptomDisplay.sources.length ? (
                      latestSymptomDisplay.sources.map((source) =>
                        source.sourceUrl ? (
                          <a
                            href={source.sourceUrl}
                            key={`${source.sourceLabel}-${source.sourceUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`최근 증상 근거 ${source.sourceLabel} 열기`}
                            title={`최근 증상 근거 ${source.sourceLabel} 열기`}
                          >
                            {source.sourceLabel}
                          </a>
                        ) : (
                          <span key={source.sourceLabel}>{source.sourceLabel}</span>
                        ),
                      )
                    ) : (
                      <span>{latestSymptomDisplay.compactSourceEvidence}</span>
                    )}
                  </small>
                ) : null}
              </>
            ) : null}
          </article>
          <article className={`metric-card status-${openQuestionCount ? "watch" : "ok"}`}>
            <MessageSquare aria-hidden="true" />
            <span>진료 질문</span>
            <strong>{openQuestionCount}개</strong>
            <small>{questionMetricSummary.statusText}</small>
            {openQuestionCount ? (
              <div
                className="metric-question-summary"
                aria-label={`진료 질문 요약 ${questionMetricSummary.priorityText} · ${questionMetricSummary.sourceText}`}
              >
                <span className="metric-question-chip">{questionMetricSummary.priorityText}</span>
                {questionMetricSummary.sourceBackedOpenCount ? (
                  <span className="metric-question-source-chip">
                    <ShieldCheck aria-hidden="true" />
                    {questionMetricSummary.sourceText}
                  </span>
                ) : null}
              </div>
            ) : null}
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
            <div className="section-title-copy">
              <span>
                {careActions.length}개 확인 항목 · 예약 {appointmentReminders.length}개
              </span>
              <button
                className="secondary-inline-button queue-copy-button"
                type="button"
                onClick={copyCareActionQueue}
                aria-label={careActionQueueCopyDescription}
                title={careActionQueueCopyDescription}
              >
                <Copy aria-hidden="true" />
                진료 큐 복사
              </button>
            </div>
          </div>
          {careActionQueueFeedback ? (
            <div className="action-queue-feedback" role="status">
              {careActionQueueFeedback}
            </div>
          ) : null}
          <div className="action-queue-summary" aria-label={careActionQueuePanelSummary.ariaLabel}>
            {careActionQueuePanelSummary.items.map((item) => (
              <span className={`action-queue-summary-chip summary-${item.id}`} key={item.id}>
                <b>{item.label}</b>
                <strong>{item.value}</strong>
              </span>
            ))}
          </div>
          <div className="action-queue-breakdown" aria-label="진료 준비 큐 항목 분류">
            {careActionQueueSourceOrder.map((source) => (
              <span key={source}>
                <b>{careActionQueueSourceLabel[source]}</b>
                <strong>{careActionSourceCounts[source]}</strong>
              </span>
            ))}
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
              {careActions.map((action) => {
                const visibleDetail = buildCareActionVisibleDetailParts(action.detail);

                return (
                  <article className={`action-row action-${action.tone}`} key={action.id}>
                    <time>{action.date}</time>
                    <div className="action-source">
                      {action.source === "symptom" ? <AlertTriangle aria-hidden="true" /> : null}
                      {action.source === "cervical" ? <ShieldCheck aria-hidden="true" /> : null}
                      {action.source === "question" ? <MessageSquare aria-hidden="true" /> : null}
                      {action.source === "vital" ? <Activity aria-hidden="true" /> : null}
                      {action.source === "lab" ? <ClipboardList aria-hidden="true" /> : null}
                      {action.source === "document" ? <FileText aria-hidden="true" /> : null}
                      {action.source === "visit" ? <Hospital aria-hidden="true" /> : null}
                      <span>{careActionQueueSourceLabel[action.source]}</span>
                    </div>
                    <div className="action-detail">
                      <strong>{action.title}</strong>
                      <p>{visibleDetail.body}</p>
                      {visibleDetail.evidenceLinks.length ? (
                        <small
                          className="action-queue-evidence"
                          aria-label={`${action.title} 근거 ${visibleDetail.evidenceLinks
                            .map((source) => source.sourceLabel)
                            .join(", ")}`}
                        >
                          <ShieldCheck aria-hidden="true" />
                          {visibleDetail.evidenceLinks.map((source) => (
                            <a
                              href={source.sourceUrl}
                              key={`${source.sourceLabel}-${source.sourceUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`${action.title} 근거 ${source.sourceLabel} 열기`}
                              title={`${action.title} 근거 ${source.sourceLabel} 열기`}
                            >
                              근거: {source.sourceLabel}
                            </a>
                          ))}
                        </small>
                      ) : null}
                    </div>
                    <mark>{action.label}</mark>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="action-empty" role="status" aria-label="진료 준비 큐 비어 있음">
              <p>현재 자궁경부암 검진 확인, 증상 경고, 열려 있는 질문, 기준 밖 활력·검사, 서류 조치, 예정 방문이 없습니다.</p>
              <div className="action-empty-links" aria-label="진료 준비 항목 추가 바로가기">
                {careActionQueueEmptyRecoveryLinks.map((link) => (
                  <a
                    href={link.href}
                    key={link.id}
                    aria-label={formatCareActionQueueEmptyRecoveryLinkLabel(link)}
                    title={formatCareActionQueueEmptyRecoveryLinkLabel(link)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        {state.profile.cancerCareMode ? (
          <section className="cervical-care-panel" aria-label="자궁경부암 케어 노트">
            <div className="section-title">
              <div>
                <p className="eyebrow">국가암정보센터·KDCA 기반</p>
                <h2>자궁경부암 케어 노트</h2>
              </div>
              <div className="section-title-copy">
                <span>{cervicalCancerCareClipboardCompactSummary}</span>
                <button
                  className="secondary-inline-button cervical-copy-button"
                  type="button"
                  onClick={copyCervicalCancerCareNote}
                  aria-label={cervicalCancerCareClipboardDescription}
                  title={cervicalCancerCareClipboardDescription}
                >
                  <Copy aria-hidden="true" />
                  노트 복사
                </button>
              </div>
            </div>
            {cervicalCancerCareCopyFeedback ? (
              <div className="cervical-care-copy-feedback" role="status">
                {cervicalCancerCareCopyFeedback}
              </div>
            ) : null}
            {cervicalCancerCareQuestionFeedback ? (
              <div className="cervical-care-question-feedback" role="status">
                {cervicalCancerCareQuestionFeedback}
              </div>
            ) : null}
            {cervicalCancerCareSymptomFeedback ? (
              <div className="cervical-care-symptom-feedback" role="status">
                {cervicalCancerCareSymptomFeedback}
              </div>
            ) : null}
            <div
              className="cervical-care-summary"
              aria-label={`자궁경부암 케어 노트 요약 ${cervicalCancerCarePanelSummary.ariaLabel}`}
            >
              {cervicalCancerCarePanelSummary.items.map((item) => (
                <span className={`cervical-care-summary-chip summary-${item.id}`} key={item.id}>
                  <strong>{item.label}</strong>
                  {item.value}
                </span>
              ))}
            </div>
            <p className="cervical-care-note">
              진단·처방·치료 지시가 아니라 진료 전 기록과 질문 준비를 돕는 공식 출처 기반 메모입니다.
            </p>
            <div
              className="cervical-alert-record-guide"
              aria-label="자궁경부암 경고 신호 기록 항목"
            >
              <div className="cervical-alert-record-heading">
                <strong>경고 신호 기록 항목</strong>
                <span>언제 · 무엇이 · 얼마나 · 같이</span>
              </div>
              {cervicalCancerCareAlertRecordFields.map((field) => (
                <article key={field.label}>
                  <strong>{field.label}</strong>
                  <p>{field.detail}</p>
                  <div aria-label={`${field.label} 기록 항목 공식 출처`}>
                    {field.sourceIds.map((sourceId) => {
                      const source = getCervicalCancerCareSource(sourceId);
                      const sourceLinkLabels = buildCervicalCancerCareSourceLinkLabels(
                        sourceId,
                        `${field.label} 기록 항목`,
                      );
                      return source ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          key={sourceId}
                          aria-label={sourceLinkLabels.ariaLabel}
                          title={sourceLinkLabels.title}
                        >
                          {source.label}
                          <ExternalLink aria-hidden="true" />
                        </a>
                      ) : null;
                    })}
                  </div>
                </article>
              ))}
            </div>
            <div
              className="cervical-priority-strip"
              aria-label="자궁경부암 우선 확인 체크리스트"
            >
              <div className="cervical-priority-heading">
                <strong>우선 확인 체크리스트</strong>
                <span>기록 · 질문 · 회복 상담</span>
              </div>
              {cervicalCancerCarePriorityItems.map((item) => (
                <article className="cervical-priority-card" key={item.label}>
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
                  <div className="cervical-priority-sources" aria-label={`${item.label} 공식 출처`}>
                    {item.sourceIds.map((sourceId) => {
                      const source = getCervicalCancerCareSource(sourceId);
                      const sourceLinkLabels = buildCervicalCancerCareSourceLinkLabels(
                        sourceId,
                        `${item.label} 우선 체크리스트`,
                      );
                      return source ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          key={sourceId}
                          aria-label={sourceLinkLabels.ariaLabel}
                          title={sourceLinkLabels.title}
                        >
                          {source.label}
                          <ExternalLink aria-hidden="true" />
                        </a>
                      ) : null;
                    })}
                  </div>
                </article>
              ))}
            </div>
            <div className="cervical-care-layout">
              <div className="cervical-care-alerts">
                <strong>진료팀에 확인할 신호</strong>
                <div className="cervical-alert-grid">
                  {cervicalCancerCareAlerts.map((item) => {
                    const source = getCervicalCancerCareSource(item.sourceId);
                    const sourceLinkLabels = buildCervicalCancerCareSourceLinkLabels(
                      item.sourceId,
                      item.title,
                    );
                    return (
                      <article className="cervical-alert-card" key={item.title}>
                        <AlertTriangle aria-hidden="true" />
                        <div>
                          <h3>{item.title}</h3>
                          <p>{item.detail}</p>
                          <small>{item.action}</small>
                          <div className="cervical-alert-actions">
                            <button
                              className="secondary-inline-button"
                              type="button"
                              onClick={() => applyCervicalCancerCareAlert(item)}
                              aria-label={formatCervicalCancerCareAlertDraftActionLabel(item)}
                              title={formatCervicalCancerCareAlertDraftActionLabel(item)}
                            >
                              <ClipboardList aria-hidden="true" />
                              기록 초안
                            </button>
                            {source ? (
                              <a
                                className="cervical-alert-source-link"
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={sourceLinkLabels.ariaLabel}
                                title={sourceLinkLabels.title}
                              >
                                {sourceLinkLabels.visibleLabel}
                                <ExternalLink aria-hidden="true" />
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
              <aside className="cervical-care-side">
                <div className="cervical-screening-summary">
                  <div className="cervical-screening-heading">
                    <strong>검진 기준 빠른 확인</strong>
                    <span>{cervicalCancerScreeningSummary.status}</span>
                  </div>
                  <p>{cervicalCancerScreeningSummary.detail}</p>
                  <small>{cervicalCancerScreeningSummary.action}</small>
                  <button
                    type="button"
                    className="secondary-inline-button cervical-screening-question-button"
                    onClick={applyCervicalCancerScreeningQuestion}
                    aria-label="현재 프로필 기준 자궁경부암 검진 질문 초안 만들기"
                    title="현재 프로필 기준 자궁경부암 검진 질문 초안 만들기"
                  >
                    <MessageSquare aria-hidden="true" />
                    질문 초안
                  </button>
                  <div
                    className="cervical-screening-source-list"
                    aria-label="검진 기준 공식 출처"
                  >
                    {cervicalCancerScreeningSummary.sourceIds.map((sourceId) => {
                      const source = getCervicalCancerCareSource(sourceId);
                      const sourceLinkLabels = buildCervicalCancerCareSourceLinkLabels(
                        sourceId,
                        "검진 기준 빠른 확인",
                      );
                      return source ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          key={sourceId}
                          aria-label={sourceLinkLabels.ariaLabel}
                          title={sourceLinkLabels.title}
                        >
                          {source.label}
                          <ExternalLink aria-hidden="true" />
                        </a>
                      ) : null;
                    })}
                  </div>
                </div>
                <details className="cervical-care-disclosure cervical-prompt-disclosure">
                  <summary
                    aria-label={formatCervicalCarePromptDisclosureLabel(
                      cervicalCancerCarePrompts.length,
                    )}
                    title={formatCervicalCarePromptDisclosureLabel(
                      cervicalCancerCarePrompts.length,
                    )}
                  >
                    <strong>다음 진료 질문 초안</strong>
                    <span>{cervicalCancerCarePrompts.length}개 · 출처 포함</span>
                  </summary>
                  <div className="cervical-prompt-list">
                    {cervicalCancerCarePrompts.map((prompt) => {
                      const source = getCervicalCancerCareSource(prompt.sourceId);
                      const sourceLinkLabels = buildCervicalCancerCareSourceLinkLabels(
                        prompt.sourceId,
                        `${prompt.topic} 질문 초안`,
                      );
                      return (
                        <div className="cervical-prompt-row" key={prompt.topic}>
                          <button
                            type="button"
                            className="secondary-inline-button"
                            onClick={() => applyCervicalCancerCarePrompt(prompt)}
                            aria-label={formatCervicalCancerCarePromptDraftActionLabel(prompt)}
                            title={formatCervicalCancerCarePromptDraftActionLabel(prompt)}
                          >
                            <MessageSquare aria-hidden="true" />
                            <span>
                              <strong>{prompt.topic}</strong>
                              <small>질문 초안 만들기</small>
                            </span>
                          </button>
                          {source ? (
                            <a
                              className="cervical-prompt-source-link"
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={sourceLinkLabels.ariaLabel}
                              title={sourceLinkLabels.title}
                            >
                              {sourceLinkLabels.visibleLabel}
                              <ExternalLink aria-hidden="true" />
                            </a>
                          ) : (
                            <small>{formatCervicalCancerCareSourceLinkLabel(prompt.sourceId)}</small>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </details>
                <div>
                  <div className="cervical-list-heading">
                    <strong>기록 체크</strong>
                    <span>{cervicalCancerCareChecks.length}개 항목</span>
                  </div>
                  <ul className="cervical-check-list">
                    {cervicalCancerCareChecks.map((item) => (
                      <li
                        key={item.label}
                        aria-label={formatCervicalCancerCareListItemAriaLabel(item)}
                      >
                        <span>{item.label}</span>
                        <small>{item.detail}</small>
                        {renderCervicalCareItemActions(item)}
                      </li>
                    ))}
                  </ul>
                </div>
                <details className="cervical-care-disclosure">
                  <summary
                    aria-label={formatCervicalCareRecoveryDisclosureLabel(
                      cervicalCancerCareRecoveryGuides.length,
                    )}
                    title={formatCervicalCareRecoveryDisclosureLabel(
                      cervicalCancerCareRecoveryGuides.length,
                    )}
                  >
                    <strong>회복 일정 메모</strong>
                    <span>{cervicalCancerCareRecoveryGuides.length}개 항목</span>
                  </summary>
                  <ul className="cervical-check-list">
                    {cervicalCancerCareRecoveryGuides.map((item) => (
                      <li
                        key={item.label}
                        aria-label={formatCervicalCancerCareListItemAriaLabel(item)}
                      >
                        <span>{item.label}</span>
                        <small>{item.detail}</small>
                        {renderCervicalCareItemActions(item)}
                      </li>
                    ))}
                  </ul>
                </details>
                <details className="cervical-care-disclosure">
                  <summary
                    aria-label={formatCervicalCarePreventionDisclosureLabel(
                      cervicalCancerCarePreventionGuides.length,
                    )}
                    title={formatCervicalCarePreventionDisclosureLabel(
                      cervicalCancerCarePreventionGuides.length,
                    )}
                  >
                    <strong>검진·예방 메모</strong>
                    <span>{cervicalCancerCarePreventionGuides.length}개 항목</span>
                  </summary>
                  <ul className="cervical-check-list">
                    {cervicalCancerCarePreventionGuides.map((item) => (
                      <li
                        key={item.label}
                        aria-label={formatCervicalCancerCareListItemAriaLabel(item)}
                      >
                        <span>{item.label}</span>
                        <small>{item.detail}</small>
                        {renderCervicalCareItemActions(item)}
                      </li>
                    ))}
                  </ul>
                </details>
                <div className="cervical-source-list">
                  <div
                    className="cervical-source-list-heading"
                    aria-label={`자궁경부암 케어 노트 공식 출처 ${cervicalCancerCareClipboardSummary.sourceCount}개`}
                  >
                    <strong>출처</strong>
                    {" "}
                    <span>{cervicalCancerCareClipboardSummary.sourceCount}개</span>
                  </div>
                  {Object.entries(cervicalCancerCareSources).map(([sourceId, source]) => {
                    const sourceLinkLabels = buildCervicalCancerCareSourceLinkLabels(
                      sourceId,
                      "자궁경부암 케어 노트",
                    );
                    return (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        key={source.url}
                        aria-label={sourceLinkLabels.ariaLabel}
                        title={sourceLinkLabels.title}
                      >
                        {source.label}
                        <ExternalLink aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
              </aside>
            </div>
          </section>
        ) : null}

        <section className="content-grid">
          <section id="profile" className="panel profile-panel" aria-label="프로필 입력">
            <div className="section-title">
              <h2>기본 정보</h2>
              <span>위험도 해석의 기준값</span>
            </div>
            <div className="form-grid">
              <label>
                이름/대상
                <input
                  value={state.profile.name}
                  aria-label={formControlDescriptions.profileName}
                  title={formControlDescriptions.profileName}
                  onChange={(event) => saveProfile("name", event.currentTarget.value)}
                />
              </label>
              <label>
                나이
                <input
                  min="1"
                  type="number"
                  value={getProfileNumberValue("age")}
                  aria-label={formControlDescriptions.profileAge}
                  title={formControlDescriptions.profileAge}
                  {...getProfileNumberFeedbackProps("age")}
                  onInput={(event) => handleProfileNumberInput("age", event.currentTarget.value)}
                />
              </label>
              <label>
                성별
                <select
                  value={state.profile.sex}
                  aria-label={formControlDescriptions.profileSex}
                  title={formControlDescriptions.profileSex}
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
                  min="1"
                  type="number"
                  value={getProfileNumberValue("heightCm")}
                  aria-label={formControlDescriptions.profileHeight}
                  title={formControlDescriptions.profileHeight}
                  {...getProfileNumberFeedbackProps("heightCm")}
                  onInput={(event) =>
                    handleProfileNumberInput("heightCm", event.currentTarget.value)
                  }
                />
              </label>
              <label>
                몸무게(kg)
                <input
                  min="1"
                  type="number"
                  value={getProfileNumberValue("weightKg")}
                  aria-label={formControlDescriptions.profileWeight}
                  title={formControlDescriptions.profileWeight}
                  {...getProfileNumberFeedbackProps("weightKg")}
                  onInput={(event) =>
                    handleProfileNumberInput("weightKg", event.currentTarget.value)
                  }
                />
              </label>
              <label>
                허리둘레(cm)
                <input
                  min="1"
                  type="number"
                  value={getProfileNumberValue("waistCm")}
                  aria-label={formControlDescriptions.profileWaist}
                  title={formControlDescriptions.profileWaist}
                  {...getProfileNumberFeedbackProps("waistCm")}
                  onInput={(event) =>
                    handleProfileNumberInput("waistCm", event.currentTarget.value)
                  }
                />
                <small className="profile-field-helper">{profileWaistStandardNote}</small>
              </label>
            </div>
            {profileFieldFeedback ? (
              <p
                className="profile-field-feedback"
                id="profile-field-feedback"
                role="status"
                aria-live="polite"
              >
                {profileFieldFeedback.message}
              </p>
            ) : null}
            <div className="standards-note" aria-label="한국 성인 건강 기준">
              <div className="standards-note-header">
                <strong>한국 성인 기준</strong>
                <button
                  className="secondary-inline-button standards-copy-button"
                  type="button"
                  onClick={copyHealthStandards}
                  aria-label={healthStandardsCopyDescription}
                  title={healthStandardsCopyDescription}
                >
                  <Copy aria-hidden="true" />
                  {healthStandardsCopyLabel}
                </button>
              </div>
              {healthStandardsCopyFeedback ? (
                <div className="health-standards-copy-feedback" role="status">
                  {healthStandardsCopyFeedback}
                </div>
              ) : null}
              <span>{koreanHealthStandardSummary.bmi}</span>
              <span>{koreanHealthStandardSummary.bloodPressure}</span>
              <span>{koreanHealthStandardSummary.glucose}</span>
              <span>{koreanHealthStandardSummary.waist}</span>
              <p className="standards-boundary-note">{koreanHealthStandardUseBoundary}</p>
              <div className="standards-applicability-strip" aria-label="성별 기준 요약">
                {koreanHealthStandardApplicabilitySummary.map((item) => (
                  <span key={item.id}>
                    <strong>{item.label}</strong>
                    <small>{item.detail}</small>
                  </span>
                ))}
              </div>
              <div className="standards-profile-strip" aria-label="현재 프로필 성별 적용 기준">
                <strong>현재 성별 적용</strong>
                {profileSexStandardNotes.map((item) => (
                  <span key={item.id}>
                    <b>{item.label}</b>
                    <small>{item.detail}</small>
                  </span>
                ))}
              </div>
              <div
                className="standards-range-strip"
                aria-label="신체계측 혈압 혈당 신기능 전해질 지질 간기능 단백 칼슘 인산 요산 혈액 체온 숫자 범위 요약"
              >
                <div className="standards-range-filter" aria-label="기준 범위 빠른 필터">
                  <div>
                    <strong>기준 빠른 보기</strong>
                    <small>
                      {selectedHealthStandardRangeFilter.label} ·{" "}
                      {visibleHealthStandardRangeSections.length}/{healthStandardRangeSections.length}개 표시
                    </small>
                  </div>
                  <div role="group" aria-label="기준 범위 카테고리 선택">
                    {healthStandardRangeFilterOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={standardRangeFilter === option.id}
                        aria-label={`${option.label} 기준 보기: ${option.detail}`}
                        title={`${option.label} 기준 보기: ${option.detail}`}
                        onClick={() => setStandardRangeFilter(option.id)}
                      >
                        <span>{option.label}</span>
                        <small>{option.detail}</small>
                      </button>
                    ))}
                  </div>
                  <div className="standards-range-summary" aria-label="선택한 기준 빠른 보기 요약">
                    {healthStandardRangeSummary.map((item) => (
                      <span key={item.id}>
                        <strong>{item.label}</strong>
                        {" "}
                        <small>{item.value}</small>
                      </span>
                    ))}
                  </div>
                </div>
                {visibleHealthStandardRangeSections.map((section) => {
                  const sourceLinkLabels = buildHealthStandardSourceLinkLabels(
                    section.sourceLabel,
                    section.label,
                    { surfaceLabel: "기준 빠른 보기" },
                  );
                  return (
                    <section key={section.id}>
                      <div>
                        <strong>{section.label}</strong>
                        {section.sourceUrl.startsWith("https://") ? (
                          <a
                            href={section.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={sourceLinkLabels.ariaLabel}
                            title={sourceLinkLabels.title}
                          >
                            {sourceLinkLabels.visibleLabel}
                          </a>
                        ) : (
                          <small>{section.sourceLabel}</small>
                        )}
                      </div>
                      <ul>
                        {section.lines.map((line) => (
                          <li
                            key={line.id}
                            className={line.tone === "risk" ? "standard-range-risk-row" : undefined}
                          >
                            <b>{line.label}</b>
                            <span>{line.detail}</span>
                          </li>
                        ))}
                      </ul>
                      {section.standardId === "infection-fever" ? (
                        <div className="standard-range-actions">
                          <button
                            className="secondary-inline-button standard-range-action-button"
                            type="button"
                            onClick={applyInfectionFeverStandardDraft}
                            aria-label={feverInfectionStandardSymptomDraftActionLabel}
                            title={feverInfectionStandardSymptomDraftActionLabel}
                          >
                            <ClipboardList aria-hidden="true" />
                            증상 기록 초안
                          </button>
                          <button
                            className="secondary-inline-button standard-range-action-button"
                            type="button"
                            onClick={applyInfectionFeverStandardQuestion}
                            aria-label={feverInfectionStandardQuestionDraftActionLabel}
                            title={feverInfectionStandardQuestionDraftActionLabel}
                          >
                            <MessageSquare aria-hidden="true" />
                            질문 초안
                          </button>
                          {infectionFeverStandardDraftFeedback ? (
                            <div className="standard-range-draft-feedback" role="status">
                              {infectionFeverStandardDraftFeedback}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </section>
                  );
                })}
              </div>
              <details className="standards-coverage">
                <summary
                  aria-label={healthStandardsCoverageDisclosureLabel}
                  title={healthStandardsCoverageDisclosureLabel}
                >
                  적용 범위
                </summary>
                <ul>
                  {koreanHealthStandardCoverage.map((item) => {
                    const sourceLinkLabels = buildHealthStandardSourceLinkLabels(
                      item.sourceLabel,
                      item.label,
                      { surfaceLabel: "적용 범위" },
                    );
                    const sexBadge = buildHealthStandardSexApplicabilityBadge(item);
                    return (
                      <li key={item.id}>
                        <mark>{healthStandardStatusLabel[item.status]}</mark>
                        <span
                          className={`standard-sex-badge standard-sex-badge-${sexBadge.tone}`}
                        >
                          {sexBadge.label}
                        </span>
                        <span className="standard-coverage-label">{item.label}</span>
                        <small>
                          {item.summary}
                          {item.sexSpecific ? " 남녀 기준 분리." : " 남녀 공통 적용."}
                        </small>
                        <small>성별 적용: {item.sexApplicability}</small>
                        <em>
                          근거:{" "}
                          {isExternalHealthStandardSource(item) ? (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={sourceLinkLabels.ariaLabel}
                              title={sourceLinkLabels.title}
                            >
                              {sourceLinkLabels.visibleLabel}
                            </a>
                          ) : (
                            formatHealthStandardSource(item)
                          )}
                        </em>
                      </li>
                    );
                  })}
                </ul>
              </details>
            </div>
            <div className="toggle-row">
              <label>
                <input
                  type="checkbox"
                  checked={state.profile.cancerCareMode}
                  aria-label={formatProfileModeToggleLabel(
                    "cancerCareMode",
                    state.profile.cancerCareMode,
                  )}
                  title={formatProfileModeToggleLabel(
                    "cancerCareMode",
                    state.profile.cancerCareMode,
                  )}
                  onChange={(event) => saveProfile("cancerCareMode", event.currentTarget.checked)}
                />
                암환자 관리
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={state.profile.diabetes}
                  aria-label={formatProfileModeToggleLabel("diabetes", state.profile.diabetes)}
                  title={formatProfileModeToggleLabel("diabetes", state.profile.diabetes)}
                  onChange={(event) => saveProfile("diabetes", event.currentTarget.checked)}
                />
                당뇨 추적
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={state.profile.hypertension}
                  aria-label={formatProfileModeToggleLabel(
                    "hypertension",
                    state.profile.hypertension,
                  )}
                  title={formatProfileModeToggleLabel(
                    "hypertension",
                    state.profile.hypertension,
                  )}
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
                <LineChart data={chartData} margin={{ left: 2, right: 4, top: 12, bottom: 8 }}>
                  <CartesianGrid stroke="#d9e2e4" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: "#526066", fontSize: 12 }} />
                  <YAxis
                    yAxisId="bloodPressure"
                    width={44}
                    tick={{ fill: "#526066", fontSize: 12 }}
                    label={{
                      angle: -90,
                      fill: "#526066",
                      fontSize: 11,
                      fontWeight: 800,
                      position: "insideLeft",
                      value: "혈압 mmHg",
                    }}
                  />
                  <YAxis
                    yAxisId="glucose"
                    orientation="right"
                    width={46}
                    tick={{ fill: "#8a4a00", fontSize: 12 }}
                    label={{
                      angle: 90,
                      fill: "#8a4a00",
                      fontSize: 11,
                      fontWeight: 800,
                      position: "insideRight",
                      value: "혈당 mg/dL",
                    }}
                  />
                  <Tooltip content={<VitalChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    yAxisId="bloodPressure"
                    stroke={vitalChartLegendItems[0].color}
                    strokeWidth={3}
                    dot={{ r: 3, strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                    name="수축기 혈압"
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    yAxisId="bloodPressure"
                    stroke={vitalChartLegendItems[1].color}
                    strokeWidth={3}
                    dot={{ r: 3, strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                    name="이완기 혈압"
                  />
                  <Line
                    type="monotone"
                    dataKey="glucose"
                    yAxisId="glucose"
                    stroke={vitalChartLegendItems[2].color}
                    strokeWidth={3}
                    dot={{ r: 3, strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                    name="혈당"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="vital-chart-legend" aria-label="혈압 혈당 차트 선 범례">
              {vitalChartLegendItems.map((item) => (
                <span
                  aria-label={`${item.label} 선: ${item.unit}`}
                  key={item.dataKey}
                  title={`${item.label} 선 · ${item.unit}`}
                >
                  <mark style={{ backgroundColor: item.color }} />
                  <strong>{item.label}</strong>
                  <small>{item.unit}</small>
                </span>
              ))}
            </div>
            <div className="vital-chart-summary" aria-label="혈압 혈당 차트 단위와 기간 요약">
              {chartSummary.map((item) => (
                <span key={item.label}>
                  <strong>{item.label}</strong>
                  {" "}
                  {item.value}
                </span>
              ))}
            </div>
            <details className="vital-chart-data">
              <summary
                aria-label={`혈압 혈당 차트 원자료 ${chartAccessibleRows.length}개 보기`}
                title={`혈압 혈당 차트 원자료 ${chartAccessibleRows.length}개 보기`}
              >
                <strong>차트 원자료</strong>
                <span>{chartAccessibleRows.length}개</span>
              </summary>
              {chartAccessibleRows.length ? (
                <ul aria-label="혈압 혈당 차트 원자료 목록">
                  {chartAccessibleRows.map((row, index) => (
                    <li aria-label={row.summary} key={`${row.summary}-${index}`}>
                      <time>{row.date}</time>
                      <span>{row.bloodPressure}</span>
                      <span>{row.glucose}</span>
                      <span>{row.assessment}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>차트 원자료 기록 대기</p>
              )}
            </details>
          </section>
        </section>

        <section id="records" className="content-grid two-columns">
          <section className="panel">
            <div className="section-title">
              <h2>혈압·혈당·체온 입력</h2>
              <span>날짜별 측정값</span>
            </div>
            <div
              className="vital-panel-summary"
              aria-label={`저장 활력 요약 ${vitalPanelSummary.ariaLabel}`}
            >
              {vitalPanelSummary.items.map((item) => (
                <span className={`vital-panel-summary-chip summary-${item.id}`} key={item.id}>
                  <strong>{item.label}</strong>
                  {item.value}
                </span>
              ))}
            </div>
            <div className="form-grid">
              <label>
                날짜
                <input
                  type="date"
                  value={vitalDraft.date}
                  aria-label={formControlDescriptions.vitalDate}
                  title={formControlDescriptions.vitalDate}
                  onChange={(event) => updateVitalDraft({ date: event.currentTarget.value })}
                />
              </label>
              <label>
                종류
                <select
                  value={vitalDraft.type}
                  aria-label={formControlDescriptions.vitalType}
                  title={formControlDescriptions.vitalType}
                  onChange={(event) =>
                    updateVitalDraft({ type: event.currentTarget.value as VitalType })
                  }
                >
                  <option value="blood-pressure">혈압</option>
                  <option value="glucose">혈당</option>
                  <option value="temperature">체온</option>
                </select>
              </label>
              {vitalDraft.type === "blood-pressure" ? (
                <>
                  <label>
                    수축기
                    <input
                      type="number"
                      value={vitalDraft.systolic ?? ""}
                      aria-label={formControlDescriptions.vitalSystolic}
                      title={formControlDescriptions.vitalSystolic}
                      onChange={(event) =>
                        updateVitalDraft({
                          systolic: parseOptionalNumberInput(event.currentTarget.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    이완기
                    <input
                      type="number"
                      value={vitalDraft.diastolic ?? ""}
                      aria-label={formControlDescriptions.vitalDiastolic}
                      title={formControlDescriptions.vitalDiastolic}
                      onChange={(event) =>
                        updateVitalDraft({
                          diastolic: parseOptionalNumberInput(event.currentTarget.value),
                        })
                      }
                    />
                  </label>
                </>
              ) : vitalDraft.type === "temperature" ? (
                <label>
                  체온 ℃
                  <input
                    type="number"
                    step="0.1"
                    value={vitalDraft.temperatureC ?? ""}
                    aria-label={formControlDescriptions.vitalTemperature}
                    title={formControlDescriptions.vitalTemperature}
                    onChange={(event) =>
                      updateVitalDraft({
                        temperatureC: parseOptionalNumberInput(event.currentTarget.value),
                      })
                    }
                  />
                </label>
              ) : (
                <>
                  <label>
                    혈당 mg/dL
                    <input
                      type="number"
                      value={vitalDraft.glucoseMgDl ?? ""}
                      aria-label={formControlDescriptions.vitalGlucose}
                      title={formControlDescriptions.vitalGlucose}
                      onChange={(event) =>
                        updateVitalDraft({
                          glucoseMgDl: parseOptionalNumberInput(event.currentTarget.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    측정 시점
                    <select
                      value={vitalDraft.glucoseContext}
                      aria-label={formControlDescriptions.vitalGlucoseContext}
                      title={formControlDescriptions.vitalGlucoseContext}
                      onChange={(event) =>
                        updateVitalDraft({
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
            <div className="vital-standard-helper" aria-label="혈압 혈당 체온 입력 기준">
              <div className="vital-standard-helper-heading">
                <strong>{vitalTypeLabel[vitalDraft.type]} 기준</strong>
                {vitalDraftSourceLink ? (
                  <a
                    href={vitalDraftSourceLink.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={vitalDraftSourceLink.labels.ariaLabel}
                    title={vitalDraftSourceLink.labels.title}
                  >
                    {vitalDraftSourceLink.labels.visibleLabel}
                  </a>
                ) : null}
              </div>
              <span>{vitalDraftStandardNote}</span>
              <small>{vitalDraftHelperText}</small>
              <ul className="vital-standard-range-list">
                {vitalDraftStandardRangeLines.map((line) => (
                  <li
                    key={line.id}
                    className={line.tone === "risk" ? "standard-range-risk-row" : undefined}
                  >
                    <b>{line.label}</b>
                    <span>{line.detail}</span>
                  </li>
                ))}
              </ul>
              <button
                className="secondary-inline-button vital-standard-question-button"
                type="button"
                onClick={applyVitalStandardQuestion}
                aria-label={vitalDraftQuestionDraftActionLabel}
                title={vitalDraftQuestionDraftActionLabel}
              >
                <MessageSquare aria-hidden="true" />
                질문 초안
              </button>
              {vitalStandardQuestionFeedback ? (
                <div className="vital-standard-question-feedback" role="status">
                  {vitalStandardQuestionFeedback}
                </div>
              ) : null}
            </div>
            <label className="wide-label">
              메모
              <input
                value={vitalDraft.note}
                aria-label={formControlDescriptions.vitalNote}
                title={formControlDescriptions.vitalNote}
                onChange={(event) => updateVitalDraft({ note: event.currentTarget.value })}
                placeholder="예: 운동 후, 약 복용 전, 식후 2시간, 오한 동반"
              />
            </label>
            {vitalDraftAssessment && vitalDraftSavePreviewLabel ? (
              <div
                className={`vital-save-preview vital-save-preview-${vitalDraftAssessment.level}`}
                role="status"
                aria-live="polite"
                aria-label={vitalDraftSavePreviewAriaLabel}
              >
                <span>저장 전 기준 확인</span>
                <strong>{vitalDraftAssessment.label}</strong>
                <small>{vitalDraftSavePreviewLabel}</small>
              </div>
            ) : null}
            <button
              className="primary-button"
              type="button"
              onClick={addVital}
              aria-label={vitalDraftSaveActionDescription}
              title={vitalDraftSaveActionDescription}
            >
              <Plus aria-hidden="true" />
              {vitalDraftSaveActionLabel}
            </button>
            {vitalSaveFeedback ? (
              <div className="vital-save-feedback" role="status">
                {vitalSaveFeedback}
              </div>
            ) : null}
            {renderRecordFormFeedback("vital")}
          </section>

          <section className="panel">
            <div className="section-title">
              <h2>병원 방문 기록</h2>
              <span>진료 흐름과 다음 일정</span>
            </div>
            <div
              className="visit-panel-summary"
              aria-label={`방문 기록 요약 ${visitPanelSummary.ariaLabel}`}
            >
              {visitPanelSummary.items.map((item) => (
                <span className={`visit-panel-summary-chip summary-${item.id}`} key={item.id}>
                  <strong>{item.label}</strong>
                  {item.value}
                </span>
              ))}
            </div>
            <div className="form-grid">
              <label>
                날짜
                <input
                  type="date"
                  value={visitDraft.date}
                  aria-label={formControlDescriptions.visitDate}
                  title={formControlDescriptions.visitDate}
                  onChange={(event) => updateVisitDraft({ date: event.currentTarget.value })}
                />
              </label>
              <label>
                병원/과
                <input
                  value={visitDraft.hospital}
                  aria-label={formControlDescriptions.visitHospital}
                  title={formControlDescriptions.visitHospital}
                  onChange={(event) => updateVisitDraft({ hospital: event.currentTarget.value })}
                />
              </label>
              <label>
                방문 이유
                <input
                  value={visitDraft.reason}
                  aria-label={formControlDescriptions.visitReason}
                  title={formControlDescriptions.visitReason}
                  onChange={(event) => updateVisitDraft({ reason: event.currentTarget.value })}
                />
              </label>
              <label>
                다음 일정
                <input
                  type="date"
                  value={visitDraft.nextDate}
                  aria-label={formControlDescriptions.visitNextDate}
                  title={formControlDescriptions.visitNextDate}
                  onChange={(event) => updateVisitDraft({ nextDate: event.currentTarget.value })}
                />
              </label>
            </div>
            <label className="wide-label">
              진료 요약
              <textarea
                value={visitDraft.summary}
                aria-label={formControlDescriptions.visitSummary}
                title={formControlDescriptions.visitSummary}
                onChange={(event) => updateVisitDraft({ summary: event.currentTarget.value })}
              />
            </label>
            <label className="wide-label">
              계획/질문
              <input
                value={visitDraft.plan}
                aria-label={formControlDescriptions.visitPlan}
                title={formControlDescriptions.visitPlan}
                onChange={(event) => updateVisitDraft({ plan: event.currentTarget.value })}
              />
            </label>
            <button
              className="primary-button"
              type="button"
              onClick={addVisit}
              aria-label={visitAddActionLabel}
              title={visitAddActionLabel}
            >
              <Plus aria-hidden="true" />
              방문 기록 추가
            </button>
            {visitSaveFeedback ? (
              <div className="visit-save-feedback" role="status">
                {visitSaveFeedback}
              </div>
            ) : null}
            {renderRecordFormFeedback("visit")}
          </section>
        </section>

        <section className="timeline-band" aria-label="최근 기록">
          <div className="section-title">
            <h2>최근 타임라인</h2>
            <span>측정·진료·서류가 한 날짜 흐름에 쌓입니다</span>
          </div>
          <div
            className="timeline-panel-summary"
            aria-label={`최근 타임라인 요약 ${timelinePanelSummary.ariaLabel}`}
          >
            {timelinePanelSummary.items.map((item) => (
              <span className={`timeline-panel-summary-chip summary-${item.id}`} key={item.id}>
                <strong>{item.label}</strong>
                {item.value}
              </span>
            ))}
          </div>
          <div className="timeline-list">
            {sortDatedItemsNewestFirst([
              ...state.vitals.map((item, index) => {
                const vitalAssessment = assessVitalRecord(item, {
                  diabetes: state.profile.diabetes,
                });
                const vitalDisplay = buildVitalTimelineDisplayParts(item, {
                  diabetes: state.profile.diabetes,
                });

                return {
                  id: item.id,
                  date: item.date,
                  icon: <Activity aria-hidden="true" />,
                  order: index,
                  recordLabel: formatVitalRecordLabel(item, {
                    diabetes: state.profile.diabetes,
                  }),
                  recordLabelTone: vitalAssessment.level,
                  hasSourceEvidence: Boolean(vitalDisplay.sourceEvidence),
                  title: formatVitalTimelineTitle(item),
                  detail: item.note,
                  sourceEvidence: vitalDisplay.sourceEvidence,
                  sourceEvidenceSources: buildSingleDisplaySource(
                    vitalDisplay.sourceLabel,
                    vitalDisplay.sourceUrl,
                  ),
                  sourceEvidenceTypeLabel: "활력",
                  sourceLabel: vitalDisplay.sourceLabel,
                  sourceUrl: vitalDisplay.sourceUrl,
                };
              }),
              ...state.visits.map((item, index) => ({
                id: item.id,
                date: item.date,
                icon: <Hospital aria-hidden="true" />,
                order: state.vitals.length + index,
                recordLabel: "",
                recordLabelTone: undefined,
                hasSourceEvidence: false,
                title: `${item.hospital} · ${item.reason}`,
                detail: item.summary,
                sourceEvidence: "",
                sourceEvidenceSources: [],
                sourceEvidenceTypeLabel: "",
                sourceLabel: "",
                sourceUrl: "",
              })),
              ...state.documents.map((item, index) => ({
                id: item.id,
                date: item.date,
                icon: <FileText aria-hidden="true" />,
                order: state.vitals.length + state.visits.length + index,
                recordLabel: "",
                recordLabelTone: undefined,
                hasSourceEvidence: false,
                title: `${documentLabel[item.category]} · ${item.title}`,
                detail: `${documentReviewStatusLabel[item.reviewStatus]}${item.nextAction ? ` · ${item.nextAction}` : item.tags ? ` · ${item.tags}` : ""}`,
                sourceEvidence: "",
                sourceEvidenceSources: [],
                sourceEvidenceTypeLabel: "",
                sourceLabel: "",
                sourceUrl: "",
              })),
              ...state.symptoms.map((item, index) => {
                const symptomDisplay = buildSymptomDisplayParts(item);

                return {
                  id: item.id,
                  date: item.date,
                  icon: <Pill aria-hidden="true" />,
                  order: state.vitals.length + state.visits.length + state.documents.length + index,
                  recordLabel: formatSymptomRecordLabel(item),
                  recordLabelTone: undefined,
                  hasSourceEvidence: hasSymptomRecordSourceEvidence(item),
                  title: `${item.symptom} · ${item.severity}/10`,
                  detail: symptomDisplay.body,
                  sourceEvidence: symptomDisplay.sourceEvidence,
                  sourceEvidenceSources: symptomDisplay.sources,
                  sourceEvidenceTypeLabel: "기록",
                  sourceLabel: symptomDisplay.sourceLabel,
                  sourceUrl: symptomDisplay.sourceUrl,
                };
              }),
              ...state.questions.map((item, index) => {
                const questionDisplay = buildQuestionTimelineDisplayParts(
                  item.question,
                  questionStatusLabel[item.status],
                );

                return {
                  id: item.id,
                  date: item.date,
                  icon: <MessageSquare aria-hidden="true" />,
                  order:
                    state.vitals.length
                    + state.visits.length
                    + state.documents.length
                    + state.symptoms.length
                    + index,
                  recordLabel: "",
                  recordLabelTone: undefined,
                  hasSourceEvidence: false,
                  title: `질문 · ${item.topic}`,
                  detail: questionDisplay.detail,
                  sourceEvidence: questionDisplay.sourceEvidence,
                  sourceEvidenceSources: questionDisplay.sources,
                  sourceEvidenceTypeLabel: "질문",
                  sourceLabel: questionDisplay.sourceLabel,
                  sourceUrl: questionDisplay.sourceUrl,
                };
              }),
              ...labAssessments.map(({ result, assessment }, index) => {
                const labSourceEvidence = buildLabSourceEvidenceParts(result);
                return {
                  id: result.id,
                  date: result.date,
                  icon: <ClipboardList aria-hidden="true" />,
                  order:
                    state.vitals.length
                    + state.visits.length
                    + state.documents.length
                    + state.symptoms.length
                    + state.questions.length
                    + index,
                  recordLabel: assessment.label,
                  recordLabelTone: assessment.level,
                  hasSourceEvidence: Boolean(labSourceEvidence.sourceLabel),
                  title: `검사 ${result.name} · ${result.value}${result.unit ? ` ${result.unit}` : ""}`,
                  detail: labSourceEvidence.noteBody
                    ? `${assessment.label}: ${labSourceEvidence.noteBody}`
                    : assessment.summary,
                  sourceEvidence: formatLabSourceEvidence(
                    labSourceEvidence.sourceLabel,
                    labSourceEvidence.sourceUrl,
                  ),
                  sourceEvidenceSources: buildSingleDisplaySource(
                    labSourceEvidence.sourceLabel,
                    labSourceEvidence.sourceUrl,
                  ),
                  sourceEvidenceTypeLabel: "검사",
                  sourceLabel: labSourceEvidence.sourceLabel,
                  sourceUrl: labSourceEvidence.sourceUrl,
                };
              }),
            ])
              .slice(0, 8)
              .map((item, timelineIndex) => {
                const sourceEvidenceLabels = formatDisplaySourceLabels(
                  item.sourceEvidenceSources,
                  item.sourceLabel,
                );
                const sourceEvidenceLabel = formatTimelineSourceEvidenceLabel({
                  date: item.date,
                  position: timelineIndex + 1,
                  title: item.title,
                  sourceEvidenceTypeLabel: item.sourceEvidenceTypeLabel,
                  sourceLabel: sourceEvidenceLabels,
                });

                return (
                  <article className="timeline-item" key={item.id}>
                    <time>{formatDatedRecordDisplayDate(item.date)}</time>
                    {item.icon}
                    <div>
                      {item.recordLabel ? (
                        <div className="timeline-record-badges">
                          <span
                            className={`timeline-record-label ${
                              item.recordLabelTone
                                ? `timeline-record-label-${item.recordLabelTone}`
                                : ""
                            }`}
                          >
                            {item.recordLabel}
                          </span>
                          {item.hasSourceEvidence ? (
                            <span className="timeline-record-evidence-label">근거 포함</span>
                          ) : null}
                        </div>
                      ) : null}
                      <strong>{item.title}</strong>
                      <p>{item.detail || "세부 메모 없음"}</p>
                      {item.sourceEvidence ? (
                        <small
                          className="timeline-source-evidence"
                          aria-label={sourceEvidenceLabel}
                        >
                          <ShieldCheck aria-hidden="true" />
                          <span>근거:</span>
                          {item.sourceEvidenceSources.length ? (
                            item.sourceEvidenceSources.map((source) =>
                              source.sourceUrl ? (
                                <a
                                  href={source.sourceUrl}
                                  key={`${source.sourceLabel}-${source.sourceUrl}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={formatTimelineSourceEvidenceOpenLabel({
                                    date: item.date,
                                    position: timelineIndex + 1,
                                    title: item.title,
                                    sourceEvidenceTypeLabel: item.sourceEvidenceTypeLabel,
                                    sourceLabel: source.sourceLabel,
                                  })}
                                  title={formatTimelineSourceEvidenceOpenLabel({
                                    date: item.date,
                                    position: timelineIndex + 1,
                                    title: item.title,
                                    sourceEvidenceTypeLabel: item.sourceEvidenceTypeLabel,
                                    sourceLabel: source.sourceLabel,
                                  })}
                                >
                                  {source.sourceLabel}
                                </a>
                              ) : (
                                <span key={source.sourceLabel}>{source.sourceLabel}</span>
                              ),
                            )
                          ) : (
                            <span>{item.sourceEvidence.replace(/^근거:\s*/, "")}</span>
                          )}
                        </small>
                      ) : null}
                    </div>
                  </article>
                );
              })}
          </div>
        </section>

        <section id="care-plan" className="content-grid two-columns">
          <section className="panel">
            <div className="section-title">
              <h2>증상·부작용 기록</h2>
              <span>치료 중 몸 상태를 날짜별로 누적</span>
            </div>
            <div
              className="symptom-panel-summary"
              aria-label={`저장 증상 요약 ${symptomPanelSummary.ariaLabel}`}
            >
              {symptomPanelSummary.items.map((item) => (
                <span className={`symptom-panel-summary-chip summary-${item.id}`} key={item.id}>
                  <strong>{item.label}</strong>
                  {item.value}
                </span>
              ))}
            </div>
            <div className="form-grid">
              <label>
                날짜
                <input
                  type="date"
                  value={symptomDraft.date}
                  aria-label={formControlDescriptions.symptomDate}
                  title={formControlDescriptions.symptomDate}
                  onChange={(event) => updateSymptomDraft({ date: event.currentTarget.value })}
                />
              </label>
              <label>
                증상
                <input
                  ref={symptomDraftInputRef}
                  value={symptomDraft.symptom}
                  aria-label={formControlDescriptions.symptomName}
                  title={formControlDescriptions.symptomName}
                  onChange={(event) => updateSymptomDraft({ symptom: event.currentTarget.value })}
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
                aria-label={`증상 심한 정도 ${symptomDraft.severity}/10 · 좌우로 조정합니다`}
                title={`증상 심한 정도 ${symptomDraft.severity}/10 · 좌우로 조정합니다`}
                onChange={(event) =>
                  updateSymptomDraft({ severity: Number(event.currentTarget.value) })
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
                aria-label={formControlDescriptions.symptomMedication}
                title={formControlDescriptions.symptomMedication}
                onChange={(event) => updateSymptomDraft({ medication: event.currentTarget.value })}
                placeholder="예: 진통제 복용, 항구토제 복용, 휴식"
              />
            </label>
            <label className="wide-label">
              몸 상태 메모
              <textarea
                value={symptomDraft.body}
                aria-label={formControlDescriptions.symptomBody}
                title={formControlDescriptions.symptomBody}
                onChange={(event) => updateSymptomDraft({ body: event.currentTarget.value })}
                placeholder="언제 시작됐는지, 식사/수면/활동과 관련이 있는지 입력"
              />
            </label>
            <label className="wide-label">
              다음 행동
              <input
                value={symptomDraft.action}
                aria-label={formControlDescriptions.symptomAction}
                title={formControlDescriptions.symptomAction}
                onChange={(event) => updateSymptomDraft({ action: event.currentTarget.value })}
                placeholder="예: 다음 진료 때 질문, 24시간 지속 시 전화"
              />
            </label>
            {symptomDraftHasRecordPreview ? (
              <div
                className="symptom-record-preview"
                role="status"
                aria-label={`저장될 기록 종류 ${symptomDraftRecordLabel}${symptomDraftHasSourceEvidence ? " 근거 포함" : ""}`}
              >
                <span>저장될 기록 종류</span>
                <strong>{symptomDraftRecordLabel}</strong>
                {symptomDraftHasSourceEvidence ? (
                  <small className="symptom-record-evidence-label">근거 포함</small>
                ) : null}
              </div>
            ) : null}
            {symptomSupportTemplate ? (
              <div className="symptom-template-band" role="status">
                <div>
                  <span>{symptomSupportTemplate.label}</span>
                  <p>{symptomSupportTemplate.mealNote}</p>
                  <small>{symptomSupportTemplate.safetyNote}</small>
                  <small className="symptom-template-queue-hint">
                    {buildSymptomSupportQueueHint(symptomSupportTemplate)}
                  </small>
                  <a
                    href={symptomSupportTemplate.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={symptomSupportSourceLinkLabels?.ariaLabel}
                    title={symptomSupportSourceLinkLabels?.title}
                  >
                    {symptomSupportSourceLinkLabels?.visibleLabel}
                    <ExternalLink aria-hidden="true" />
                  </a>
                </div>
                <button
                  type="button"
                  onClick={applySymptomSupportTemplate}
                  aria-label={symptomSupportQuestionDraftActionLabel}
                  title={symptomSupportQuestionDraftActionLabel}
                >
                  <MessageSquare aria-hidden="true" />
                  질문 초안
                </button>
                {symptomSupportQuestionFeedback ? (
                  <div className="symptom-template-draft-feedback" role="status">
                    {symptomSupportQuestionFeedback}
                  </div>
                ) : null}
              </div>
            ) : null}
            <button
              className="primary-button"
              type="button"
              onClick={addSymptom}
              aria-label={symptomDraftSaveActionDescription}
              title={symptomDraftSaveActionDescription}
            >
              <Plus aria-hidden="true" />
              {symptomDraftSaveActionLabel}
            </button>
            {symptomSaveFeedback ? (
              <div className="symptom-save-feedback" role="status">
                {symptomSaveFeedback}
              </div>
            ) : null}
            {renderRecordFormFeedback("symptom")}
          </section>

          <section className="panel">
            <div className="section-title">
              <h2>진료 전 질문</h2>
              <span>놓치기 쉬운 질문을 상태별로 관리</span>
            </div>
            <div
              className="question-panel-summary"
              aria-label={`저장 질문 요약 ${questionListSummary.ariaLabel}`}
            >
              {questionListSummary.items.map((item) => (
                <span className={`question-panel-summary-chip summary-${item.id}`} key={item.id}>
                  <strong>{item.label}</strong>
                  {item.value}
                </span>
              ))}
            </div>
            <div className="form-grid">
              <label>
                진료/확인일
                <input
                  type="date"
                  value={questionDraft.date}
                  aria-label={formControlDescriptions.questionDate}
                  title={formControlDescriptions.questionDate}
                  onChange={(event) => updateQuestionDraft({ date: event.currentTarget.value })}
                />
              </label>
              <label>
                주제
                <input
                  value={questionDraft.topic}
                  aria-label={formControlDescriptions.questionTopic}
                  title={formControlDescriptions.questionTopic}
                  onChange={(event) => updateQuestionDraft({ topic: event.currentTarget.value })}
                  placeholder="예: 식단, 검사수치, 부작용"
                />
              </label>
              <label>
                우선순위
                <select
                  value={questionDraft.priority}
                  aria-label={formControlDescriptions.questionPriority}
                  title={formControlDescriptions.questionPriority}
                  onChange={(event) =>
                    updateQuestionDraft({
                      priority: normalizeQuestionPriority(event.currentTarget.value),
                    })
                  }
                >
                  {(["high", "next-visit", "routine"] as QuestionPriority[]).map((priority) => (
                    <option value={priority} key={priority}>
                      {questionPriorityLabel[priority]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="wide-label">
              질문
              <textarea
                ref={questionDraftTextareaRef}
                value={questionDraft.question}
                aria-label={formControlDescriptions.questionBody}
                title={formControlDescriptions.questionBody}
                onChange={(event) =>
                  updateQuestionDraft({ question: event.currentTarget.value })
                }
                placeholder="의료진에게 물어볼 내용을 그대로 입력"
              />
            </label>
            <label className="wide-label">
              답변 메모
              <input
                value={questionDraft.answer}
                aria-label={formControlDescriptions.questionAnswer}
                title={formControlDescriptions.questionAnswer}
                onChange={(event) =>
                  updateQuestionDraft({ answer: event.currentTarget.value })
                }
                placeholder="진료 후 답변을 여기에 남김"
              />
            </label>
            <button
              className="primary-button"
              type="button"
              onClick={addQuestion}
              aria-label={questionDraftAddActionLabel}
              title={questionDraftAddActionLabel}
            >
              <Plus aria-hidden="true" />
              질문 추가
            </button>
            {questionSaveFeedback ? (
              <div className="question-save-feedback" role="status">
                {questionSaveFeedback}
              </div>
            ) : null}
            {renderRecordFormFeedback("question")}
            <div className="question-list">
              {sortDatedItemsOldestFirst(
                state.questions.map((question, index) => ({ ...question, order: index })),
              )
                .map((question) => {
                  const questionCopyDescription =
                    formatQuestionClipboardCopyDescription(question);
                  const questionDisplay = buildQuestionDisplayParts(question.question);
                  const answerMemoDisplay = formatQuestionAnswerMemoDisplay(question.answer);
                  const questionSourceEvidenceLabels = formatDisplaySourceLabels(
                    questionDisplay.sources,
                    questionDisplay.sourceLabel,
                  );
                  const questionSourceEvidenceLabel = formatQuestionSourceEvidenceLabel(
                    question.topic,
                    questionSourceEvidenceLabels,
                  );
                  const questionAnswerMemoLabel = formatQuestionAnswerMemoLabel(question.topic);
                  const questionPriorityControlDescription =
                    formatQuestionPriorityControlDescription(question.topic, question.priority);

                  return (
                    <article className="question-item" key={question.id}>
                      <div>
                        <span>
                          {formatDatedRecordDisplayDate(question.date)} ·{" "}
                          {questionPriorityLabel[question.priority]}
                        </span>
                        <strong>{question.topic}</strong>
                        <p>{questionDisplay.body}</p>
                        {questionDisplay.sourceEvidence ? (
                          <small
                            className="question-source-evidence"
                            aria-label={questionSourceEvidenceLabel}
                          >
                            <ShieldCheck aria-hidden="true" />
                            <span>근거:</span>
                            {questionDisplay.sources.length ? (
                              questionDisplay.sources.map((source) =>
                                source.sourceUrl ? (
                                  <a
                                    href={source.sourceUrl}
                                    key={`${source.sourceLabel}-${source.sourceUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={formatQuestionSourceEvidenceOpenLabel(
                                      question.topic,
                                      source.sourceLabel,
                                    )}
                                    title={formatQuestionSourceEvidenceOpenLabel(
                                      question.topic,
                                      source.sourceLabel,
                                    )}
                                  >
                                    {source.sourceLabel}
                                  </a>
                                ) : (
                                  <span key={source.sourceLabel}>{source.sourceLabel}</span>
                                ),
                              )
                            ) : (
                              <span>{questionDisplay.sourceEvidence.replace(/^근거:\s*/, "")}</span>
                            )}
                          </small>
                        ) : null}
                        {answerMemoDisplay ? (
                          <small
                            className="question-answer-memo"
                            aria-label={questionAnswerMemoLabel}
                          >
                            <span>답변 메모</span>
                            <b>{answerMemoDisplay}</b>
                          </small>
                        ) : null}
                      </div>
                      <div className="question-card-controls">
                        <label className="question-priority-control">
                          우선순위
                          <select
                            value={question.priority}
                            aria-label={questionPriorityControlDescription}
                            title={questionPriorityControlDescription}
                            onChange={(event) =>
                              updateQuestionPriority(
                                question.id,
                                normalizeQuestionPriority(event.currentTarget.value),
                              )
                            }
                          >
                            {(["high", "next-visit", "routine"] as QuestionPriority[]).map(
                              (priority) => (
                                <option value={priority} key={priority}>
                                  {questionPriorityLabel[priority]}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        <button
                          type="button"
                          className="secondary-inline-button question-copy-button"
                          aria-label={questionCopyDescription}
                          title={questionCopyDescription}
                          onClick={() => copyQuestionForVisit(question)}
                        >
                          <Copy aria-hidden="true" />
                          질문 복사
                        </button>
                        <div className="inline-actions">
                          {(["open", "answered", "deferred"] as QuestionStatus[]).map((status) => {
                            const isCurrentStatus = question.status === status;
                            const statusButtonLabels = buildQuestionStatusButtonLabels(
                              question.topic,
                              status,
                              isCurrentStatus,
                            );

                            return (
                              <button
                                type="button"
                                className={isCurrentStatus ? "active" : ""}
                                onClick={() => updateQuestionStatus(question.id, status)}
                                aria-label={statusButtonLabels.ariaLabel}
                                title={statusButtonLabels.title}
                                disabled={isCurrentStatus}
                                key={status}
                              >
                                {statusButtonLabels.visibleLabel}
                              </button>
                            );
                          })}
                        </div>
                        {questionActionFeedback?.questionId === question.id ? (
                          <div className="question-action-feedback" role="status">
                            {questionActionFeedback.message}
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        </section>

        <section id="labs" className="content-grid two-columns">
          <section className="panel lab-panel">
            <div className="section-title">
              <h2>검사 수치 입력</h2>
              <span>검사실 기준 범위와 항암·당뇨 추적 항목을 함께 기록</span>
            </div>
            <label className="wide-label lab-preset-control">
              검사 항목 프리셋
              <select
                value={labPresetChoice}
                aria-label={formControlDescriptions.labPreset}
                title={formControlDescriptions.labPreset}
                onChange={(event) => applyLabPreset(event.currentTarget.value)}
              >
                <option value="">직접 입력</option>
                {labPresets.map((preset) => (
                  <option value={preset.id} key={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
              <small>
                프리셋은 입력 보조값입니다. 성별 기준을 바꾸면 Hgb/RBC/Hct/HDL/GGT처럼 성별이 있는
                프리셋 범위와 자동 메모 기준은 사용자가 직접 고치기 전까지만 자동 갱신됩니다.
              </small>
            </label>
            <div
              className="lab-preset-preview"
              aria-live="polite"
              aria-label="선택한 검사 프리셋 범위와 메모 기준"
            >
              {selectedLabPresetPreview ? (
                <>
                  <div className="lab-preset-preview-header">
                    <strong>{selectedLabPresetPreview.label}</strong>
                    <span>{selectedLabPresetPreview.applicabilityLabel}</span>
                  </div>
                  <dl className="lab-preset-preview-grid">
                    <div>
                      <dt>항목</dt>
                      <dd>{selectedLabPresetPreview.name}</dd>
                    </div>
                    <div>
                      <dt>기준 범위</dt>
                      <dd>{selectedLabPresetPreview.rangeLabel}</dd>
                    </div>
                    <div>
                      <dt>단위</dt>
                      <dd>{selectedLabPresetPreview.unit || "직접 입력"}</dd>
                    </div>
                  </dl>
                  <p className="lab-preset-applicability-note">
                    {selectedLabPresetPreview.applicabilityDetail}
                  </p>
                  <p>{selectedLabPresetPreview.note}</p>
                  <small className="lab-preset-source">
                    근거:{" "}
                    {selectedLabPresetPreview.sourceUrl.startsWith("https://") ? (
                      <a
                        href={selectedLabPresetPreview.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${selectedLabPresetPreview.label} 프리셋 근거 ${selectedLabPresetPreview.sourceLabel} 열기`}
                        title={`${selectedLabPresetPreview.label} 프리셋 근거 ${selectedLabPresetPreview.sourceLabel} 열기`}
                      >
                        {selectedLabPresetPreview.sourceLabel}
                        <ExternalLink aria-hidden="true" />
                      </a>
                    ) : (
                      <span>{selectedLabPresetPreview.sourceLabel}</span>
                    )}
                  </small>
                </>
              ) : (
                <p className="lab-preset-empty">
                  직접 입력 모드입니다. 결과지에 적힌 검사실 기준 범위와 단위를 그대로 입력하세요.
                </p>
              )}
            </div>
            {labPresetFeedback ? (
              <div className="lab-preset-feedback" role="status">
                {labPresetFeedback}
              </div>
            ) : null}
            <div className="form-grid">
              <label>
                날짜
                <input
                  type="date"
                  value={labDraft.date}
                  aria-label={formControlDescriptions.labDate}
                  title={formControlDescriptions.labDate}
                  onChange={(event) => updateLabDraft({ date: event.currentTarget.value })}
                />
              </label>
              <label>
                항목
                <input
                  value={labDraft.name}
                  aria-label={formControlDescriptions.labName}
                  title={formControlDescriptions.labName}
                  onChange={(event) => updateLabDraft({ name: event.currentTarget.value })}
                  placeholder="예: WBC, RBC, Hct, PLT, HbA1c, BUN, Cr, eGFR, UACR, Alb, TP, Ca, P, UA, Na, K, AST, ALT"
                />
              </label>
              <label>
                값
                <input
                  type="number"
                  value={labDraft.value}
                  aria-label={formControlDescriptions.labValue}
                  title={formControlDescriptions.labValue}
                  onChange={(event) => updateLabDraft({ value: event.currentTarget.value })}
                />
              </label>
              <label>
                단위
                <input
                  value={labDraft.unit}
                  aria-label={formControlDescriptions.labUnit}
                  title={formControlDescriptions.labUnit}
                  onChange={(event) => updateLabDraft({ unit: event.currentTarget.value })}
                  placeholder="예: mg/dL, 10^3/uL"
                />
              </label>
              <label>
                기준 하한
                <input
                  type="number"
                  value={labDraft.lower}
                  aria-label={formControlDescriptions.labLower}
                  title={formControlDescriptions.labLower}
                  onChange={(event) => updateLabDraft({ lower: event.currentTarget.value })}
                />
              </label>
              <label>
                기준 상한
                <input
                  type="number"
                  value={labDraft.upper}
                  aria-label={formControlDescriptions.labUpper}
                  title={formControlDescriptions.labUpper}
                  onChange={(event) => updateLabDraft({ upper: event.currentTarget.value })}
                />
              </label>
            </div>
            <label className="wide-label">
              메모
              <textarea
                value={labDraft.note}
                aria-label={formControlDescriptions.labNote}
                title={formControlDescriptions.labNote}
                onChange={(event) => updateLabDraft({ note: event.currentTarget.value })}
                placeholder="예: 다음 진료 때 질문, 약 변경 후 추적"
              />
            </label>
            <div className="form-actions">
              <button
                className="primary-button"
                type="button"
                onClick={addLabResult}
                aria-label={labAddActionLabel}
                title={labAddActionLabel}
              >
                <Plus aria-hidden="true" />
                검사 수치 추가
              </button>
              <button
                className="secondary-inline-button"
                type="button"
                onClick={resetLabDraft}
                aria-label="검사 입력 프리셋과 값 초기화"
                title="검사 입력 프리셋과 값 초기화"
              >
                <RotateCcw aria-hidden="true" />
                검사 입력 초기화
              </button>
            </div>
            {labSaveFeedback ? (
              <div className="lab-save-feedback" role="status">
                {labSaveFeedback}
              </div>
            ) : null}
            {renderRecordFormFeedback("lab")}
          </section>

          <section className="panel">
            <div className="section-title">
              <h2>검사 수치 추적</h2>
              <span>{state.labResults.length}개 기록</span>
            </div>
            <div
              className="lab-panel-summary"
              aria-label={`저장 검사 요약 ${labPanelSummary.ariaLabel}`}
            >
              {labPanelSummary.items.map((item) => (
                <span className={`lab-panel-summary-chip summary-${item.id}`} key={item.id}>
                  <strong>{item.label}</strong>
                  {item.value}
                </span>
              ))}
            </div>
            <div className="lab-list">
              {labAssessments.map(({ result, assessment }) => {
                const labSourceEvidence = buildLabSourceEvidenceParts(result);
                const labRangeLabel = formatLabReferenceRangeLabel(
                  result.lower,
                  result.upper,
                  result.unit,
                );
                const labQuestionPrompt = buildLabQuestionPrompt(result, assessment);
                const labQuestionAlreadyAdded = hasExistingLabFollowupQuestion(
                  state.questions,
                  labQuestionPrompt,
                );
                const labQuestionButtonLabels = buildLabFollowupQuestionButtonLabels(
                  result.name,
                  Boolean(labSourceEvidence.sourceLabel),
                  labQuestionAlreadyAdded,
                );

                return (
                  <article className="lab-item" key={result.id}>
                    <div>
                      <span>{result.date}</span>
                      <strong>
                        {result.name} {result.value}
                        {result.unit ? ` ${result.unit}` : ""}
                      </strong>
                      <p>
                        {labRangeLabel ? `기준 ${labRangeLabel}` : "기준 직접 확인"}
                      </p>
                      {labSourceEvidence.noteBody ? (
                        <small className="lab-note-body">{labSourceEvidence.noteBody}</small>
                      ) : null}
                      {labSourceEvidence.sourceLabel ? (
                        <small className="lab-source-evidence">
                          근거:{" "}
                          {labSourceEvidence.sourceUrl.startsWith("https://") ? (
                            <a
                              href={labSourceEvidence.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`${result.name} 검사 근거 ${labSourceEvidence.sourceLabel} 열기`}
                              title={`${result.name} 검사 근거 ${labSourceEvidence.sourceLabel} 열기`}
                            >
                              {labSourceEvidence.sourceLabel}
                              <ExternalLink aria-hidden="true" />
                            </a>
                          ) : (
                            <span>{labSourceEvidence.sourceLabel}</span>
                          )}
                        </small>
                      ) : null}
                      {assessment.flag !== "normal" ? (
                        <div className="lab-followup-actions">
                          <button
                            className="secondary-inline-button"
                            type="button"
                            onClick={() => addLabQuestion(result, assessment)}
                            aria-label={labQuestionButtonLabels.ariaLabel}
                            title={labQuestionButtonLabels.title}
                            disabled={labQuestionAlreadyAdded}
                          >
                            <MessageSquare aria-hidden="true" />
                            {labQuestionAlreadyAdded ? "질문 추가됨" : "질문으로 추가"}
                          </button>
                          {labQuestionFeedback?.labId === result.id ? (
                            <div className="lab-followup-feedback" role="status">
                              {labQuestionFeedback.message}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <mark className={`lab-${assessment.flag}`}>
                      {labFlagLabel[assessment.flag]}
                    </mark>
                  </article>
                );
              })}
            </div>
          </section>
        </section>

        <section id="nutrition" className="panel nutrition-panel">
          <div className="section-title">
            <h2>암환자 음식 판단</h2>
            <span>치료가 아니라 근거 기반 주의·기록 도구</span>
          </div>
          <div
            className="food-panel-summary"
            aria-label={`음식 판단 요약 ${foodPanelSummary.ariaLabel}`}
          >
            {foodPanelSummary.items.map((item) => (
              <span className={`food-panel-summary-chip summary-${item.id}`} key={item.id}>
                <strong>{item.label}</strong>
                {item.value}
              </span>
            ))}
          </div>
          <div
            className="food-guide-grid"
            aria-label="공식 출처 기반 자궁경부암·암환자 음식 가이드"
          >
            {cancerFoodGuideCategories.map((category) => (
              <article
                className={`food-guide-card guide-${category.level}`}
                key={category.id}
              >
                <div className="food-guide-card-heading">
                  <strong>{category.label}</strong>
                  <span>{category.summary}</span>
                </div>
                <ul>
                  {category.items.map((item) => (
                    <li key={item.label}>
                      <b>{item.label}</b>
                      <span>{item.detail}</span>
                      <small>예: {item.examples}</small>
                      <div className="food-guide-source-row">
                        {item.sourceIds.map((sourceId) => {
                          const source = foodGuidanceSources[sourceId];

                          return (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`${item.label} 음식 가이드 공식 근거 ${source.label} 열기`}
                              title={`${item.label} 음식 가이드 공식 근거 ${source.label} 열기`}
                              key={`${item.label}-${sourceId}`}
                            >
                              {source.label}
                              <ExternalLink aria-hidden="true" />
                            </a>
                          );
                        })}
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          {immuneFoodSafetyContext ? (
            <div
              className="immune-food-context"
              aria-label={immuneFoodSafetyContext.ariaLabel}
              data-testid="immune-food-context"
            >
              <div className="immune-food-context-heading">
                <ShieldCheck aria-hidden="true" />
                <strong>{immuneFoodSafetyContext.label}</strong>
                <span>{immuneFoodSafetyContext.labValueLabel}</span>
              </div>
              <p>{immuneFoodSafetyContext.summary}</p>
              <div className="immune-food-source-evidence">
                {immuneFoodSafetyContext.labSourceLabel &&
                immuneFoodSafetyContext.labSourceUrl ? (
                  <a
                    href={immuneFoodSafetyContext.labSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`면역저하 검사 근거 ${immuneFoodSafetyContext.labSourceLabel} 열기`}
                    title={`면역저하 검사 근거 ${immuneFoodSafetyContext.labSourceLabel} 열기`}
                  >
                    {immuneFoodSafetyContext.labSourceLabel}
                    <ExternalLink aria-hidden="true" />
                  </a>
                ) : null}
                <a
                  href={immuneFoodSafetyContext.foodSafetySourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`면역저하 식품 안전 근거 ${immuneFoodSafetyContext.foodSafetySourceLabel} 열기`}
                  title={`면역저하 식품 안전 근거 ${immuneFoodSafetyContext.foodSafetySourceLabel} 열기`}
                >
                  {immuneFoodSafetyContext.foodSafetySourceLabel}
                  <ExternalLink aria-hidden="true" />
                </a>
              </div>
            </div>
          ) : null}
          <div className="nutrition-layout">
            <label className="wide-label">
              음식 또는 식단 입력
              <textarea
                value={state.foodQuery}
                aria-label={formControlDescriptions.foodQuery}
                title={formControlDescriptions.foodQuery}
                onChange={(event) => {
                  const foodQuery = event.currentTarget.value;
                  setState((current) => ({
                    ...current,
                    foodQuery,
                  }));
                  setFoodQuestionDraftFeedback(null);
                  setActionSaveLabel(
                    formatFoodJudgmentUpdatedStatusLabel(
                      foodQuery,
                      assessCancerFood(foodQuery),
                      immuneFoodSafetyContext?.sourceLabels,
                    ),
                  );
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
            {foodAssessment.matches.map((match) => {
              const sourceLinkLabels = buildFoodMatchSourceLinkLabels(match);

              return (
                <span className={`food-chip ${match.level}`} key={`${match.term}-${match.level}`}>
                  <b>
                    {match.term}: {match.reason}
                  </b>
                  <a
                    href={match.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={sourceLinkLabels.ariaLabel}
                    title={sourceLinkLabels.title}
                  >
                    {sourceLinkLabels.visibleLabel}
                    <ExternalLink aria-hidden="true" />
                  </a>
                </span>
              );
            })}
          </div>
          <div className="food-question-actions">
            <button
              className="secondary-inline-button"
              type="button"
              onClick={applyFoodQuestionDraft}
              aria-label={foodQuestionButtonLabels.ariaLabel}
              title={foodQuestionButtonLabels.title}
            >
              <MessageSquare aria-hidden="true" />
              {foodQuestionButtonLabels.visibleLabel}
            </button>
          </div>
          {foodQuestionDraftFeedback ? (
            <div className="food-question-draft-feedback" role="status">
              {foodQuestionDraftFeedback}
            </div>
          ) : null}
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
                  aria-label={formControlDescriptions.documentDate}
                  title={formControlDescriptions.documentDate}
                  onChange={(event) => updateDocumentDraft({ date: event.currentTarget.value })}
                />
              </label>
              <label>
                분류
                <select
                  value={documentDraft.category}
                  aria-label={formControlDescriptions.documentCategory}
                  title={formControlDescriptions.documentCategory}
                  onChange={(event) =>
                    updateDocumentDraft({
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
                  aria-label={formControlDescriptions.documentReviewStatus}
                  title={formControlDescriptions.documentReviewStatus}
                  onChange={(event) =>
                    updateDocumentDraft({
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
                aria-label={formControlDescriptions.documentTitle}
                title={formControlDescriptions.documentTitle}
                onChange={(event) => updateDocumentDraft({ title: event.currentTarget.value })}
                placeholder="예: 6월 혈액검사 결과"
              />
            </label>
            <label className="wide-label">
              내용
              <textarea
                value={documentDraft.body}
                aria-label={formControlDescriptions.documentBody}
                title={formControlDescriptions.documentBody}
                onChange={(event) => updateDocumentDraft({ body: event.currentTarget.value })}
                placeholder="검사 수치, 의사 설명, 다음 질문을 그대로 입력"
              />
            </label>
            <label className="wide-label">
              다음 조치
              <input
                value={documentDraft.nextAction}
                aria-label={formControlDescriptions.documentNextAction}
                title={formControlDescriptions.documentNextAction}
                onChange={(event) => updateDocumentDraft({ nextAction: event.currentTarget.value })}
                placeholder="예: 다음 진료 때 간수치 변화 기준 질문"
              />
            </label>
            <label className="wide-label">
              태그
              <input
                value={documentDraft.tags}
                aria-label={formControlDescriptions.documentTags}
                title={formControlDescriptions.documentTags}
                onChange={(event) => updateDocumentDraft({ tags: event.currentTarget.value })}
                placeholder="예: 혈액검사,항암,부작용"
              />
            </label>
            <div className="attachment-panel">
              <input
                ref={documentAttachmentInputRef}
                className="visually-hidden"
                type="file"
                tabIndex={-1}
                aria-hidden="true"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx,.csv,.txt,.md,.hwp,.hwpx"
                aria-label={formControlDescriptions.documentAttachmentFile}
                title={formControlDescriptions.documentAttachmentFile}
                onChange={(event) => {
                  attachBrowserReference(event.currentTarget.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
              <div className="attachment-actions">
                <button
                  className="secondary-inline-button"
                  type="button"
                  onClick={attachDocumentFile}
                  aria-label="서류 메모 첨부 파일 선택 · 파일명만 내보내기에 포함"
                  title="서류 메모 첨부 파일 선택 · 파일명만 내보내기에 포함"
                >
                  <Paperclip aria-hidden="true" />
                  첨부 파일 선택
                </button>
                {documentDraft.attachmentName ? (
                  <button
                    className="text-icon-button"
                    type="button"
                    onClick={clearDocumentAttachment}
                    aria-label={documentDraftAttachmentRemoveActionLabel}
                    title={documentDraftAttachmentRemoveActionLabel}
                  >
                    <X aria-hidden="true" />
                    첨부 제거
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
            <button
              className="primary-button"
              type="button"
              onClick={addDocument}
              aria-label={documentDraftAddActionLabel}
              title={documentDraftAddActionLabel}
            >
              <Plus aria-hidden="true" />
              서류 메모 저장
            </button>
            {documentSaveFeedback ? (
              <div className="document-save-feedback" role="status">
                {documentSaveFeedback}
              </div>
            ) : null}
            {renderRecordFormFeedback("document")}
          </section>

          <section className="panel document-list-panel">
            <div className="section-title">
              <h2>저장된 서류</h2>
              <span>
                {filteredDocuments.length}/{state.documents.length}개 기록
              </span>
            </div>
            <div
              className="document-panel-summary"
              aria-label={`저장 서류 요약 ${documentPanelSummary.ariaLabel}`}
            >
              {documentPanelSummary.items.map((item) => (
                <span className={`document-panel-summary-chip summary-${item.id}`} key={item.id}>
                  <strong>{item.label}</strong>
                  {item.value}
                </span>
              ))}
            </div>
            <div className="document-parser-quick-search" aria-label="문서 파서 빠른 검색">
              {documentParserQuickSearchOptions.map((option) => (
                <button
                  className={`secondary-inline-button quick-search-${option.id}`}
                  type="button"
                  key={option.id}
                  disabled={option.disabled}
                  onClick={() => applyDocumentParserQuickSearch(option)}
                  aria-label={option.actionLabel}
                  aria-pressed={
                    documentFilter.trim() === option.searchText &&
                    documentCategoryFilter === "all" &&
                    documentStatusFilter === "all"
                  }
                  title={option.actionLabel}
                >
                  {option.id === "desktop-parser" ? (
                    <FileText aria-hidden="true" />
                  ) : (
                    <Search aria-hidden="true" />
                  )}
                  <span>{option.label}</span>
                  <small>{option.value}</small>
                </button>
              ))}
            </div>
            {documentParserAudit.items.length ? (
              <div
                className="document-parser-audit"
                aria-label={`문서 파서 점검 ${documentParserAudit.ariaLabel}`}
              >
                <div className="document-parser-audit-title">
                  <strong>문서 파서 점검</strong>
                  <span>{documentParserAudit.summary}</span>
                  <button
                    className="secondary-inline-button document-parser-audit-copy"
                    type="button"
                    onClick={copyDocumentParserAudit}
                    aria-label={documentParserAuditClipboardDescription}
                    title={documentParserAuditClipboardDescription}
                  >
                    <ClipboardList aria-hidden="true" />
                    점검 복사
                  </button>
                  <button
                    className="secondary-inline-button document-parser-audit-download"
                    type="button"
                    onClick={downloadDocumentParserAudit}
                    aria-label={documentParserAuditDownloadDescription}
                    title={documentParserAuditDownloadDescription}
                  >
                    <Download aria-hidden="true" />
                    점검 다운로드
                  </button>
                </div>
                <ul>
                  {documentParserAudit.items.map((item) => (
                    <li key={item.documentId}>
                      <span>
                        {item.dateLabel} · {item.documentLabel}
                      </span>
                      <small>{item.sourceSummary}</small>
                      <small>{item.clinicalSignalSummary}</small>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <input
              ref={savedAttachmentInputRef}
              className="visually-hidden"
              type="file"
              tabIndex={-1}
              aria-hidden="true"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx,.csv,.txt,.md,.hwp,.hwpx"
              aria-label={formControlDescriptions.savedAttachmentFile}
              title={formControlDescriptions.savedAttachmentFile}
              onChange={(event) => {
                attachBrowserReferenceToSavedDocument(event.currentTarget.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
            <label className="search-field">
              <Search aria-hidden="true" />
              <span className="visually-hidden">저장된 서류 검색</span>
              <input
                value={documentFilter}
                onChange={(event) => setDocumentFilter(event.currentTarget.value)}
                aria-label="저장된 서류 검색어"
                title="저장된 서류 검색어"
                placeholder="날짜, 분류, 제목, 내용, 태그 검색"
              />
            </label>
            {normalizedSearchText ? (
              <p className="normalized-search-note">{normalizedSearchText}</p>
            ) : null}
            {documentKnowledgeSearchSnippets.length ? (
              <div className="document-knowledge-search" aria-label="문서 파싱 검색 단서">
                <strong>문서 파싱 검색 단서</strong>
                <ul>
                  {documentKnowledgeSearchSnippets.map((snippet) => (
                    <li key={snippet}>{snippet}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="document-filter-row">
              <label>
                분류 필터
                <select
                  value={documentCategoryFilter}
                  aria-label={formControlDescriptions.documentCategoryFilter}
                  title={formControlDescriptions.documentCategoryFilter}
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
                  aria-label={formControlDescriptions.documentStatusFilter}
                  title={formControlDescriptions.documentStatusFilter}
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
              {filteredDocuments.length ? (
                filteredDocuments.map((document) => {
                  const isPreviewableDocumentImage =
                    document.attachmentName &&
                    isPreviewableImageAttachment(document.attachmentName);
                  const canPreviewDocumentImage = Boolean(
                    isPreviewableDocumentImage &&
                      (browserAttachmentPreviewUrls[document.id] ||
                        (document.attachmentPath && canUseTauriRuntime())),
                  );
                  const documentPreviewActionLabel = isPreviewableDocumentImage
                    ? formatDocumentAttachmentPreviewActionLabel(
                        document,
                        canPreviewDocumentImage,
                        "저장된 경로 또는 데스크톱 런타임 필요",
                      )
                    : "";
                  const documentKnowledgeSummary = buildDocumentKnowledgeSummary(document);
                  const documentParserProvenanceSummary =
                    buildDocumentParserProvenanceSummary(document);
                  const documentCareQuestionDraft = buildDocumentCareQuestionDraft(document);

                  return (
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
                      {documentKnowledgeSummary ? (
                        <p className="document-knowledge-summary">{documentKnowledgeSummary}</p>
                      ) : null}
                      {documentParserProvenanceSummary ? (
                        <p className="document-parser-provenance">
                          {documentParserProvenanceSummary}
                        </p>
                      ) : null}
                      <div
                        className="document-update-controls"
                        aria-label={`${document.title} 서류 조치 수정`}
                      >
                        <label>
                          상태
                          <select
                            aria-label={`${document.title} 검토 상태`}
                            title={`${document.title} 검토 상태`}
                            value={document.reviewStatus}
                            onChange={(event) =>
                              updateDocumentReviewStatus(
                                document,
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
                          <textarea
                            aria-label={`${document.title} 다음 조치`}
                            title={`${document.title} 다음 조치`}
                            value={document.nextAction}
                            rows={2}
                            onFocus={() => captureDocumentActionBaseline(document)}
                            onChange={(event) =>
                              updateDocumentNextAction(document, event.currentTarget.value)
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
                      <button
                        type="button"
                        onClick={() => replaceSavedDocumentAttachment(document)}
                        aria-label={formatDocumentActionButtonLabel(
                          document,
                          document.attachmentName ? "replace-attachment" : "add-attachment",
                        )}
                        title={formatDocumentActionButtonLabel(
                          document,
                          document.attachmentName ? "replace-attachment" : "add-attachment",
                        )}
                      >
                        <Upload aria-hidden="true" />
                        {document.attachmentName ? "재첨부" : "첨부 추가"}
                      </button>
                      {document.attachmentName ? (
                        <button
                          type="button"
                          onClick={() => checkDocumentAttachment(document)}
                          aria-label={formatDocumentActionButtonLabel(document, "check-attachment")}
                          title={formatDocumentActionButtonLabel(document, "check-attachment")}
                        >
                          <ShieldCheck aria-hidden="true" />
                          첨부 확인
                        </button>
                      ) : null}
                      {isPreviewableDocumentImage ? (
                        <button
                          type="button"
                          onClick={() => previewDocumentAttachment(document)}
                          aria-label={documentPreviewActionLabel}
                          title={documentPreviewActionLabel}
                        >
                          <ImageIcon aria-hidden="true" />
                          {canPreviewDocumentImage ? "미리보기" : "미리보기 불가"}
                        </button>
                      ) : null}
                      {document.attachmentPath ? (
                        <button
                          type="button"
                          onClick={() => openDocumentAttachment(document)}
                          aria-label={formatDocumentActionButtonLabel(document, "open-attachment")}
                          title={formatDocumentActionButtonLabel(document, "open-attachment")}
                        >
                          <ExternalLink aria-hidden="true" />
                          열기
                        </button>
                      ) : null}
                      {document.attachmentName ? (
                        <button
                          type="button"
                          onClick={() => removeSavedDocumentAttachment(document)}
                          aria-label={formatDocumentActionButtonLabel(document, "remove-attachment")}
                          title={formatDocumentActionButtonLabel(document, "remove-attachment")}
                        >
                          <Unlink aria-hidden="true" />
                          첨부 제거
                        </button>
                      ) : null}
                      {documentCareQuestionDraft ? (
                        <button
                          type="button"
                          onClick={() => applyDocumentKnowledgeQuestionDraft(document)}
                          aria-label={`${document.title} 문서 단서로 의료진 질문 초안 만들기`}
                          title={`${document.title} 문서 단서로 의료진 질문 초안 만들기`}
                        >
                          <MessageSquare aria-hidden="true" />
                          질문 초안
                        </button>
                      ) : null}
                      <button
                        className="danger-action"
                        type="button"
                        onClick={() => deleteDocument(document)}
                        aria-label={formatDocumentActionButtonLabel(document, "archive-document")}
                        title={formatDocumentActionButtonLabel(document, "archive-document")}
                      >
                        <Trash2 aria-hidden="true" />
                        삭제 보관
                      </button>
                      {documentActionFeedback?.documentId === document.id ? (
                        <div className="document-action-feedback" role="status">
                          {documentActionFeedback.message}
                        </div>
                      ) : null}
                    </div>
                  </article>
                  );
                })
              ) : (
                <div className="document-empty" role="status" aria-label="저장된 서류 필터 결과 없음">
                  <p>
                    {state.documents.length
                      ? "검색어나 필터 조건에 맞는 저장된 서류가 없습니다."
                      : "아직 저장된 서류가 없습니다. 검사, 영상, 처방, 진료 메모를 먼저 저장하세요."}
                  </p>
                  {state.documents.length && hasActiveDocumentFilters ? (
                    <button
                      className="secondary-inline-button document-empty-reset"
                      type="button"
                      onClick={resetDocumentFilters}
                      aria-label={documentFilterResetActionLabel}
                      title={documentFilterResetActionLabel}
                    >
                      <RotateCcw aria-hidden="true" />
                      서류 필터 초기화
                    </button>
                  ) : null}
                </div>
              )}
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
                        <button
                          type="button"
                          onClick={() => restoreDocument(document)}
                          aria-label={formatDocumentActionButtonLabel(document, "restore-document")}
                          title={formatDocumentActionButtonLabel(document, "restore-document")}
                        >
                          <RotateCcw aria-hidden="true" />
                          복구
                        </button>
                        {hasAttachmentMetadata(document) ? (
                          <button
                            type="button"
                            onClick={() => removeDeletedDocumentAttachment(document)}
                            aria-label={formatDocumentActionButtonLabel(
                              document,
                              "clean-deleted-attachment",
                            )}
                            title={formatDocumentActionButtonLabel(
                              document,
                              "clean-deleted-attachment",
                            )}
                          >
                            <Unlink aria-hidden="true" />
                            첨부 정리
                          </button>
                        ) : null}
                        {documentActionFeedback?.documentId === document.id ? (
                          <div className="document-action-feedback" role="status">
                            {documentActionFeedback.message}
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </section>

        <section className="care-boundary-strip">
          <ShieldCheck aria-hidden="true" />
          <p>
            기록과 내보내기는 로컬 기기 기준으로 준비되며, 진료 판단은 의료진 기준을 우선하세요.
          </p>
        </section>
        {exportPreview ? (
          <section
            ref={exportPreviewPanelRef}
            className="export-preview-panel"
            aria-label="내보내기 미리보기"
            tabIndex={-1}
          >
            <div className="export-preview-header">
              <div>
                <p className="eyebrow">{exportPreview.format}</p>
                <h2>{exportPreview.title}</h2>
                <span>{exportPreview.filename}</span>
              </div>
              <div className="export-preview-actions">
                <button
                  type="button"
                  className="secondary-inline-button"
                  onClick={copyExportPreview}
                  disabled={exportPreviewHasStaleState}
                  aria-label={exportPreviewCopyActionDescription}
                  title={exportPreviewCopyActionDescription}
                >
                  <Copy aria-hidden="true" />
                  미리보기 복사
                </button>
                <button
                  type="button"
                  className="secondary-inline-button"
                  onClick={printExportPreview}
                  disabled={exportPreviewHasStaleState}
                  aria-label={exportPreviewPrintActionDescription}
                  title={exportPreviewPrintActionDescription}
                >
                  <Printer aria-hidden="true" />
                  미리보기 인쇄
                </button>
                <button
                  type="button"
                  className="secondary-inline-button"
                  onClick={downloadExportPreview}
                  disabled={exportPreviewHasStaleState}
                  aria-label={exportPreviewDownloadActionDescription}
                  title={exportPreviewDownloadActionDescription}
                >
                  <Download aria-hidden="true" />
                  미리보기 다운로드
                </button>
                <button
                  type="button"
                  className="text-icon-button"
                  onClick={closeExportPreview}
                  aria-label="내보내기 미리보기 닫기"
                  title="내보내기 미리보기 닫기"
                >
                  <X aria-hidden="true" />
                  미리보기 닫기
                </button>
              </div>
            </div>
            {exportPreviewSummary ? (
              <div className="export-preview-summary" aria-label="내보내기 미리보기 요약">
                <span>
                  <strong>형식</strong>
                  {exportPreview.format}
                </span>
                <span>
                  <strong>분량</strong>
                  {exportPreviewSummary.lineLabel}
                </span>
                <span>
                  <strong>문자</strong>
                  {exportPreviewSummary.characterLabel}
                </span>
                <span>
                  <strong>크기</strong>
                  {exportPreviewSummary.byteLabel}
                </span>
                <span className="export-preview-source-marker">
                  <strong>출처 표식</strong>
                  {exportPreviewSummary.sourceMarkerLabel}
                </span>
              </div>
            ) : null}
            {exportPreviewHasStaleCaregiverSettings ? (
              <div
                ref={exportPreviewStaleAlertRef}
                className="export-preview-stale-alert"
                role="status"
                aria-label="보호자 공유본 미리보기 변경 감지"
                tabIndex={-1}
              >
                <AlertTriangle aria-hidden="true" />
                <div>
                  <strong>공유 설정이 바뀌었습니다</strong>
                  <span>현재 미리보기는 이전 설정으로 생성되었습니다.</span>
                </div>
                <button
                  type="button"
                  className="secondary-inline-button"
                  onClick={showCaregiverExportPreview}
                  aria-label={caregiverSettingsFreshPreviewDescription}
                  title={caregiverSettingsFreshPreviewDescription}
                >
                  <Eye aria-hidden="true" />
                  {formatExportPreviewFreshActionVisibleLabel("caregiver-settings")}
                </button>
              </div>
            ) : null}
            {exportPreviewHasStaleCaregiverContent ? (
              <div
                ref={exportPreviewStaleAlertRef}
                className="export-preview-stale-alert"
                role="status"
                aria-label="보호자 공유본 미리보기 기록 변경 감지"
                tabIndex={-1}
              >
                <AlertTriangle aria-hidden="true" />
                <div>
                  <strong>보호자 공유본 기록이 바뀌었습니다</strong>
                  <span>현재 미리보기는 이전 기록으로 생성되었습니다.</span>
                </div>
                <button
                  type="button"
                  className="secondary-inline-button"
                  onClick={showCaregiverExportPreview}
                  aria-label={caregiverContentFreshPreviewDescription}
                  title={caregiverContentFreshPreviewDescription}
                >
                  <Eye aria-hidden="true" />
                  {formatExportPreviewFreshActionVisibleLabel("caregiver-content")}
                </button>
              </div>
            ) : null}
            {exportPreviewHasStaleVisitPacketRange ? (
              <div
                ref={exportPreviewStaleAlertRef}
                className="export-preview-stale-alert"
                role="status"
                aria-label="진료 요약 미리보기 범위 변경 감지"
                tabIndex={-1}
              >
                <AlertTriangle aria-hidden="true" />
                <div>
                  <strong>진료 요약 범위가 바뀌었습니다</strong>
                  <span>현재 미리보기는 이전 범위로 생성되었습니다.</span>
                </div>
                <button
                  type="button"
                  className="secondary-inline-button"
                  onClick={showVisitPacketExportPreview}
                  aria-label={visitPacketRangeFreshPreviewDescription}
                  title={visitPacketRangeFreshPreviewDescription}
                >
                  <Eye aria-hidden="true" />
                  {formatExportPreviewFreshActionVisibleLabel("visit-range")}
                </button>
              </div>
            ) : null}
            {exportPreviewHasStaleVisitPacketContent ? (
              <div
                ref={exportPreviewStaleAlertRef}
                className="export-preview-stale-alert"
                role="status"
                aria-label="진료 요약 미리보기 기록 변경 감지"
                tabIndex={-1}
              >
                <AlertTriangle aria-hidden="true" />
                <div>
                  <strong>진료 요약 기록이 바뀌었습니다</strong>
                  <span>현재 미리보기는 이전 기록으로 생성되었습니다.</span>
                </div>
                <button
                  type="button"
                  className="secondary-inline-button"
                  onClick={showVisitPacketExportPreview}
                  aria-label={visitPacketContentFreshPreviewDescription}
                  title={visitPacketContentFreshPreviewDescription}
                >
                  <Eye aria-hidden="true" />
                  {formatExportPreviewFreshActionVisibleLabel("visit-content")}
                </button>
              </div>
            ) : null}
            {exportPreviewHasStaleCsvState ? (
              <div
                ref={exportPreviewStaleAlertRef}
                className="export-preview-stale-alert"
                role="status"
                aria-label="CSV 미리보기 기록 변경 감지"
                tabIndex={-1}
              >
                <AlertTriangle aria-hidden="true" />
                <div>
                  <strong>CSV 기록이 바뀌었습니다</strong>
                  <span>현재 미리보기는 이전 기록으로 생성되었습니다.</span>
                </div>
                <button
                  type="button"
                  className="secondary-inline-button"
                  onClick={showCsvExportPreview}
                  aria-label={csvFreshPreviewDescription}
                  title={csvFreshPreviewDescription}
                >
                  <Eye aria-hidden="true" />
                  {formatExportPreviewFreshActionVisibleLabel("csv-content")}
                </button>
              </div>
            ) : null}
            {exportPreviewHasStaleCaregiverSettings &&
            caregiverPreviewSettingDifferences.length ? (
              <div
                className="export-preview-setting-differences"
                aria-label="보호자 공유본 미리보기 설정 변경 차이"
              >
                <strong>바뀐 설정</strong>
                <ul>
                  {caregiverPreviewSettingDifferences.map((difference) => (
                    <li key={difference.id}>
                      <span className="setting-diff-label">{difference.label}</span>
                      <span className="setting-diff-value">
                        <small>생성 시점</small>
                        {difference.previousText}
                      </span>
                      <span className="setting-diff-value">
                        <small>현재</small>
                        {difference.currentText}
                      </span>
                      {difference.detailText ? (
                        <small className="setting-diff-detail">{difference.detailText}</small>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {exportPreview.caregiverShareSettingsSummary ? (
              <div
                className="export-preview-settings-snapshot"
                aria-label="보호자 공유본 미리보기 생성 시점 설정"
              >
                <strong>생성 시점 설정</strong>
                <span>{exportPreview.caregiverShareSettingsSummary.presetText}</span>
                <span>{exportPreview.caregiverShareSettingsSummary.profileText}</span>
                <span>{exportPreview.caregiverShareSettingsSummary.memoText}</span>
                <span>포함 {exportPreview.caregiverShareSettingsSummary.includedText}</span>
                <small>제외 {exportPreview.caregiverShareSettingsSummary.excludedText}</small>
              </div>
            ) : null}
            {showRenderedExportPreview ? (
              <>
                <div className="export-preview-rendered" aria-label="보호자 공유본 렌더 미리보기">
                  <iframe
                    title={exportPreview.title}
                    srcDoc={exportPreview.content}
                    sandbox=""
                  />
                </div>
                <details className="export-preview-source">
                  <summary
                    aria-label={formatExportPreviewRawHtmlDisclosureLabel(exportPreview.title)}
                    title={formatExportPreviewRawHtmlDisclosureLabel(exportPreview.title)}
                  >
                    원본 HTML 보기
                  </summary>
                  <pre>{exportPreview.content}</pre>
                </details>
              </>
            ) : (
              <pre>{exportPreview.content}</pre>
            )}
          </section>
        ) : null}
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
                <span className="attachment-preview-kicker">이미지 미리보기</span>
                <strong>{attachmentPreview.title}</strong>
                <span>{attachmentPreview.attachmentName}</span>
              </div>
              <button
                className="text-icon-button"
                type="button"
                onClick={closeAttachmentPreview}
                aria-label={attachmentPreviewCloseActionLabel}
                title={attachmentPreviewCloseActionLabel}
              >
                <X aria-hidden="true" />
                닫기
              </button>
            </div>
            <figure className="attachment-preview-frame">
              <img
                src={attachmentPreview.previewUrl}
                alt={`${attachmentPreview.title} 첨부 이미지 미리보기`}
                onError={() => handleAttachmentPreviewImageError(attachmentPreview)}
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
