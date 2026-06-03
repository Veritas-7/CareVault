export type PersistenceBackend = "sqlite" | "localStorage" | "memory";

type PersistedState<T> = {
  state: T;
  backend: PersistenceBackend;
};

export type NormalizedCareVaultMirror = {
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
  vitals: Array<{
    id: string;
    date: string;
    type: string;
    systolic?: number;
    diastolic?: number;
    glucoseMgDl?: number;
    glucoseContext?: string;
    note: string;
  }>;
  visits: Array<{
    id: string;
    date: string;
    hospital: string;
    reason: string;
    summary: string;
    plan: string;
    nextDate: string;
  }>;
  documents: Array<{
    id: string;
    date: string;
    title: string;
    category: string;
    body: string;
    tags: string;
    reviewStatus: string;
    nextAction: string;
    attachmentName?: string;
    attachmentStorage?: string;
    attachmentStatus?: string;
    isDeleted: boolean;
  }>;
  symptoms: Array<{
    id: string;
    date: string;
    symptom: string;
    severity: number;
    medication: string;
    body: string;
    action: string;
  }>;
  questions: Array<{
    id: string;
    date: string;
    topic: string;
    question: string;
    status: string;
    answer: string;
  }>;
  labResults: Array<{
    id: string;
    date: string;
    name: string;
    value: string;
    unit: string;
    lower: string;
    upper: string;
    note: string;
  }>;
  foodCheck?: {
    id: string;
    query: string;
    level: string;
    label: string;
    summary: string;
    matchesJson: string;
  };
};

export type NormalizedMirrorStatus = {
  checkedAt: string;
  profileRows: number;
  vitalRows: number;
  visitRows: number;
  activeDocumentRows: number;
  deletedDocumentRows: number;
  symptomRows: number;
  questionRows: number;
  labResultRows: number;
  foodCheckRows: number;
  latestUpdatedAt?: string;
};

type SaveOptions = {
  normalizedMirror?: NormalizedCareVaultMirror;
};

const STORAGE_KEY = "carevault.v1";
const SQL_CONNECTION = "sqlite:carevault.db";
const SQL_STATE_KEY = "main";

type SqlDatabase = {
  select: (query: string, bindValues?: unknown[]) => Promise<unknown>;
  execute: (query: string, bindValues?: unknown[]) => Promise<unknown>;
};

export type SqlStatement = {
  query: string;
  bindValues?: unknown[];
};

let dbPromise: Promise<SqlDatabase | null> | null = null;

function canUseLocalStorage() {
  try {
    return typeof window !== "undefined" && "localStorage" in window;
  } catch {
    return false;
  }
}

function canUseTauri() {
  return (
    typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI__" in window)
  );
}

async function getDatabase() {
  if (!canUseTauri()) return null;
  if (!dbPromise) {
    dbPromise = import("@tauri-apps/plugin-sql")
      .then(async (module) => module.default.load(SQL_CONNECTION) as Promise<SqlDatabase>)
      .catch(() => null);
  }
  return dbPromise;
}

const normalizedTableStatements: SqlStatement[] = [
  {
    query: `CREATE TABLE IF NOT EXISTS profile_snapshot (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      age TEXT NOT NULL,
      sex TEXT NOT NULL,
      height_cm TEXT NOT NULL,
      weight_kg TEXT NOT NULL,
      cancer_care_mode INTEGER NOT NULL,
      diabetes INTEGER NOT NULL,
      hypertension INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  },
  {
    query: `CREATE TABLE IF NOT EXISTS vitals (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      systolic REAL,
      diastolic REAL,
      glucose_mg_dl REAL,
      glucose_context TEXT,
      note TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  },
  {
    query: `CREATE TABLE IF NOT EXISTS visits (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      hospital TEXT NOT NULL,
      reason TEXT NOT NULL,
      summary TEXT NOT NULL,
      plan TEXT NOT NULL,
      next_date TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  },
  {
    query: `CREATE TABLE IF NOT EXISTS care_documents (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      body TEXT NOT NULL,
      tags TEXT NOT NULL,
      review_status TEXT NOT NULL,
      next_action TEXT NOT NULL,
      attachment_name TEXT,
      attachment_storage TEXT,
      attachment_status TEXT,
      is_deleted INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  },
  {
    query: `CREATE TABLE IF NOT EXISTS food_checks (
      id TEXT PRIMARY KEY NOT NULL,
      query TEXT NOT NULL,
      level TEXT NOT NULL,
      label TEXT NOT NULL,
      summary TEXT NOT NULL,
      matches_json TEXT NOT NULL,
      checked_at TEXT NOT NULL
    )`,
  },
  {
    query: `CREATE TABLE IF NOT EXISTS symptoms (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      symptom TEXT NOT NULL,
      severity INTEGER NOT NULL,
      medication TEXT NOT NULL,
      body TEXT NOT NULL,
      action TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  },
  {
    query: `CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      topic TEXT NOT NULL,
      question TEXT NOT NULL,
      status TEXT NOT NULL,
      answer TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  },
  {
    query: `CREATE TABLE IF NOT EXISTS lab_results (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      name TEXT NOT NULL,
      value TEXT NOT NULL,
      unit TEXT NOT NULL,
      lower_bound TEXT NOT NULL,
      upper_bound TEXT NOT NULL,
      note TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  },
];

function boolToSql(value: boolean) {
  return value ? 1 : 0;
}

function optionalNumber(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function requiredNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function optionalText(value: string | undefined) {
  return value ?? null;
}

export function parseSqlCount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function parseOptionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function buildNormalizedMirrorStatements(
  mirror: NormalizedCareVaultMirror,
  updatedAt: string,
): SqlStatement[] {
  const statements: SqlStatement[] = [
    ...normalizedTableStatements,
    {
      query: `INSERT INTO profile_snapshot (
        id,
        name,
        age,
        sex,
        height_cm,
        weight_kg,
        cancer_care_mode,
        diabetes,
        hypertension,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        age = excluded.age,
        sex = excluded.sex,
        height_cm = excluded.height_cm,
        weight_kg = excluded.weight_kg,
        cancer_care_mode = excluded.cancer_care_mode,
        diabetes = excluded.diabetes,
        hypertension = excluded.hypertension,
        updated_at = excluded.updated_at`,
      bindValues: [
        "main",
        mirror.profile.name,
        mirror.profile.age,
        mirror.profile.sex,
        mirror.profile.heightCm,
        mirror.profile.weightKg,
        boolToSql(mirror.profile.cancerCareMode),
        boolToSql(mirror.profile.diabetes),
        boolToSql(mirror.profile.hypertension),
        updatedAt,
      ],
    },
    { query: "DELETE FROM vitals" },
    { query: "DELETE FROM visits" },
    { query: "DELETE FROM care_documents" },
    { query: "DELETE FROM food_checks" },
    { query: "DELETE FROM symptoms" },
    { query: "DELETE FROM questions" },
    { query: "DELETE FROM lab_results" },
  ];

  mirror.vitals.forEach((vital) => {
    statements.push({
      query: `INSERT INTO vitals (
        id,
        date,
        type,
        systolic,
        diastolic,
        glucose_mg_dl,
        glucose_context,
        note,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      bindValues: [
        vital.id,
        vital.date,
        vital.type,
        optionalNumber(vital.systolic),
        optionalNumber(vital.diastolic),
        optionalNumber(vital.glucoseMgDl),
        optionalText(vital.glucoseContext),
        vital.note,
        updatedAt,
      ],
    });
  });

  mirror.visits.forEach((visit) => {
    statements.push({
      query: `INSERT INTO visits (
        id,
        date,
        hospital,
        reason,
        summary,
        plan,
        next_date,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      bindValues: [
        visit.id,
        visit.date,
        visit.hospital,
        visit.reason,
        visit.summary,
        visit.plan,
        visit.nextDate,
        updatedAt,
      ],
    });
  });

  mirror.documents.forEach((document) => {
    statements.push({
      query: `INSERT INTO care_documents (
        id,
        date,
        title,
        category,
        body,
        tags,
        review_status,
        next_action,
        attachment_name,
        attachment_storage,
        attachment_status,
        is_deleted,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      bindValues: [
        document.id,
        document.date,
        document.title,
        document.category,
        document.body,
        document.tags,
        document.reviewStatus,
        document.nextAction,
        optionalText(document.attachmentName),
        optionalText(document.attachmentStorage),
        optionalText(document.attachmentStatus),
        boolToSql(document.isDeleted),
        updatedAt,
      ],
    });
  });

  if (mirror.foodCheck?.query.trim()) {
    statements.push({
      query: `INSERT INTO food_checks (
        id,
        query,
        level,
        label,
        summary,
        matches_json,
        checked_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      bindValues: [
        mirror.foodCheck.id,
        mirror.foodCheck.query,
        mirror.foodCheck.level,
        mirror.foodCheck.label,
        mirror.foodCheck.summary,
        mirror.foodCheck.matchesJson,
        updatedAt,
      ],
    });
  }

  mirror.symptoms.forEach((symptom) => {
    statements.push({
      query: `INSERT INTO symptoms (
        id,
        date,
        symptom,
        severity,
        medication,
        body,
        action,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      bindValues: [
        symptom.id,
        symptom.date,
        symptom.symptom,
        requiredNumber(symptom.severity),
        symptom.medication,
        symptom.body,
        symptom.action,
        updatedAt,
      ],
    });
  });

  mirror.questions.forEach((question) => {
    statements.push({
      query: `INSERT INTO questions (
        id,
        date,
        topic,
        question,
        status,
        answer,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      bindValues: [
        question.id,
        question.date,
        question.topic,
        question.question,
        question.status,
        question.answer,
        updatedAt,
      ],
    });
  });

  mirror.labResults.forEach((labResult) => {
    statements.push({
      query: `INSERT INTO lab_results (
        id,
        date,
        name,
        value,
        unit,
        lower_bound,
        upper_bound,
        note,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      bindValues: [
        labResult.id,
        labResult.date,
        labResult.name,
        labResult.value,
        labResult.unit,
        labResult.lower,
        labResult.upper,
        labResult.note,
        updatedAt,
      ],
    });
  });

  return statements;
}

async function ensureNormalizedTables(db: SqlDatabase) {
  for (const statement of normalizedTableStatements) {
    await db.execute(statement.query, statement.bindValues);
  }
}

async function mirrorNormalizedState(
  db: SqlDatabase,
  mirror: NormalizedCareVaultMirror,
  updatedAt: string,
) {
  const statements = buildNormalizedMirrorStatements(mirror, updatedAt);
  await db.execute("BEGIN");
  try {
    for (const statement of statements) {
      await db.execute(statement.query, statement.bindValues);
    }
    await db.execute("COMMIT");
  } catch (error) {
    await db.execute("ROLLBACK").catch(() => undefined);
    throw error;
  }
}

async function selectCount(db: SqlDatabase, query: string) {
  const rows = (await db.select(query)) as Array<{ count?: unknown }>;
  return parseSqlCount(rows[0]?.count);
}

export async function loadNormalizedMirrorStatus(): Promise<NormalizedMirrorStatus | null> {
  const db = await getDatabase();
  if (!db) return null;

  await ensureNormalizedTables(db);

  const profileRows = await selectCount(db, "SELECT COUNT(*) AS count FROM profile_snapshot");
  const vitalRows = await selectCount(db, "SELECT COUNT(*) AS count FROM vitals");
  const visitRows = await selectCount(db, "SELECT COUNT(*) AS count FROM visits");
  const activeDocumentRows = await selectCount(
    db,
    "SELECT COUNT(*) AS count FROM care_documents WHERE is_deleted = 0",
  );
  const deletedDocumentRows = await selectCount(
    db,
    "SELECT COUNT(*) AS count FROM care_documents WHERE is_deleted = 1",
  );
  const symptomRows = await selectCount(db, "SELECT COUNT(*) AS count FROM symptoms");
  const questionRows = await selectCount(db, "SELECT COUNT(*) AS count FROM questions");
  const labResultRows = await selectCount(db, "SELECT COUNT(*) AS count FROM lab_results");
  const foodCheckRows = await selectCount(db, "SELECT COUNT(*) AS count FROM food_checks");
  const latestRows = (await db.select(`SELECT MAX(mirror_updated_at) AS latestUpdatedAt
    FROM (
      SELECT updated_at AS mirror_updated_at FROM profile_snapshot
      UNION ALL SELECT updated_at FROM vitals
      UNION ALL SELECT updated_at FROM visits
      UNION ALL SELECT updated_at FROM care_documents
      UNION ALL SELECT updated_at FROM symptoms
      UNION ALL SELECT updated_at FROM questions
      UNION ALL SELECT updated_at FROM lab_results
      UNION ALL SELECT checked_at FROM food_checks
    )`)) as Array<{ latestUpdatedAt?: unknown }>;

  return {
    checkedAt: new Date().toISOString(),
    profileRows,
    vitalRows,
    visitRows,
    activeDocumentRows,
    deletedDocumentRows,
    symptomRows,
    questionRows,
    labResultRows,
    foodCheckRows,
    latestUpdatedAt: parseOptionalText(latestRows[0]?.latestUpdatedAt),
  };
}

function loadFromLocalStorage<T>(fallback: T): PersistedState<T> {
  if (!canUseLocalStorage()) {
    return { state: fallback, backend: "memory" };
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return { state: fallback, backend: "localStorage" };
  }

  try {
    return { state: JSON.parse(raw) as T, backend: "localStorage" };
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return { state: fallback, backend: "localStorage" };
  }
}

export async function loadPersistedState<T>(fallback: T): Promise<PersistedState<T>> {
  const db = await getDatabase();
  if (!db) return loadFromLocalStorage(fallback);

  const rows = (await db.select("SELECT value FROM app_state WHERE key = $1 LIMIT 1", [
    SQL_STATE_KEY,
  ])) as Array<{ value: string }>;

  if (!rows.length) {
    await savePersistedState(fallback);
    return { state: fallback, backend: "sqlite" };
  }

  try {
    return { state: JSON.parse(rows[0].value) as T, backend: "sqlite" };
  } catch {
    await savePersistedState(fallback);
    return { state: fallback, backend: "sqlite" };
  }
}

export async function savePersistedState<T>(
  state: T,
  options: SaveOptions = {},
): Promise<PersistenceBackend> {
  const db = await getDatabase();
  if (db) {
    const updatedAt = new Date().toISOString();
    await db.execute(
      `INSERT INTO app_state (key, value, updated_at)
       VALUES ($1, $2, $3)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`,
      [SQL_STATE_KEY, JSON.stringify(state), updatedAt],
    );
    if (options.normalizedMirror) {
      await mirrorNormalizedState(db, options.normalizedMirror, updatedAt);
    }
    return "sqlite";
  }

  if (canUseLocalStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return "localStorage";
  }

  return "memory";
}
