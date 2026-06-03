type CsvDocument = {
  date: string;
  title: string;
  category: string;
  body: string;
  tags: string;
  reviewStatus: string;
  nextAction: string;
  attachmentName?: string;
  attachmentStatus?: string;
};

export type CsvExportState = {
  profile: {
    name: string;
    age: string;
    sex: string;
    heightCm: string;
    weightKg: string;
    cancerCareMode: boolean;
    diabetes: boolean;
    hypertension: boolean;
  };
  foodQuery: string;
  vitals: Array<{
    date: string;
    type: string;
    systolic?: number;
    diastolic?: number;
    glucoseMgDl?: number;
    glucoseContext?: string;
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
  documents: CsvDocument[];
  deletedDocuments: CsvDocument[];
  symptoms: Array<{
    date: string;
    symptom: string;
    severity: number;
    medication: string;
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

const headers = ["section", "date", "title", "value", "status", "detail"] as const;

function csvCell(value: string | number | boolean | undefined) {
  const text = value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function row(values: ReadonlyArray<string | number | boolean | undefined>) {
  return values.map(csvCell).join(",");
}

function joinDetail(parts: Array<string | undefined>) {
  return parts.map((part) => part?.trim()).filter(Boolean).join(" | ");
}

export function buildCareVaultCsv(state: CsvExportState, exportedAt: string) {
  const rows = [
    row(headers),
    row(["meta", "", "exportedAt", exportedAt, "", ""]),
    row([
      "profile",
      "",
      state.profile.name,
      `${state.profile.age}세 / ${state.profile.heightCm}cm / ${state.profile.weightKg}kg`,
      state.profile.sex,
      joinDetail([
        state.profile.cancerCareMode ? "암환자 관리" : "일반 관리",
        state.profile.diabetes ? "당뇨 추적" : undefined,
        state.profile.hypertension ? "혈압 추적" : undefined,
      ]),
    ]),
  ];

  state.vitals.forEach((vital) => {
    rows.push(
      row([
        "vital",
        vital.date,
        vital.type === "blood-pressure" ? "혈압" : "혈당",
        vital.type === "blood-pressure"
          ? `${vital.systolic ?? ""}/${vital.diastolic ?? ""}`
          : `${vital.glucoseMgDl ?? ""} mg/dL`,
        vital.glucoseContext,
        vital.note,
      ]),
    );
  });

  state.visits.forEach((visit) => {
    rows.push(
      row([
        "visit",
        visit.date,
        visit.hospital,
        visit.reason,
        visit.nextDate ? `다음 예약 ${visit.nextDate}` : "",
        joinDetail([visit.summary, visit.plan]),
      ]),
    );
  });

  state.labResults.forEach((lab) => {
    rows.push(
      row([
        "lab",
        lab.date,
        lab.name,
        `${lab.value}${lab.unit ? ` ${lab.unit}` : ""}`,
        lab.lower || lab.upper ? `${lab.lower || "-"}~${lab.upper || "-"}` : "",
        lab.note,
      ]),
    );
  });

  state.symptoms.forEach((symptom) => {
    rows.push(
      row([
        "symptom",
        symptom.date,
        symptom.symptom,
        `${symptom.severity}/10`,
        symptom.medication,
        joinDetail([symptom.body, symptom.action]),
      ]),
    );
  });

  state.questions.forEach((question) => {
    rows.push(
      row([
        "question",
        question.date,
        question.topic,
        question.question,
        question.status,
        question.answer,
      ]),
    );
  });

  const pushDocument = (section: "document" | "deleted_document", document: CsvDocument) => {
    rows.push(
      row([
        section,
        document.date,
        document.title,
        document.category,
        document.reviewStatus,
        joinDetail([
          document.nextAction,
          document.tags,
          document.attachmentName ? `첨부: ${document.attachmentName}` : undefined,
          document.attachmentStatus,
          document.body,
        ]),
      ]),
    );
  };

  state.documents.forEach((document) => pushDocument("document", document));
  state.deletedDocuments.forEach((document) => pushDocument("deleted_document", document));

  if (state.foodQuery.trim()) {
    rows.push(row(["food_check", "", "음식 판단 입력", state.foodQuery, "", ""]));
  }

  return `${rows.join("\n")}\n`;
}
