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
    waistCm?: string;
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
    temperatureC?: number;
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
  documentAttachments: Array<{
    documentId: string;
    attachmentName: string;
    attachmentStorage?: string;
    attachmentStatus?: string;
    isDeleted: boolean;
  }>;
  documentHistory: Array<{
    id: string;
    documentId: string;
    at: string;
    kind: string;
    label: string;
    detail: string;
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
    priority?: string;
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
  documentAttachmentRows: number;
  documentHistoryRows: number;
  symptomRows: number;
  questionRows: number;
  labResultRows: number;
  foodCheckRows: number;
  latestUpdatedAt?: string;
};

export type NormalizedSearchSummary = {
  query: string;
  searchedAt: string;
  vitalRows: number;
  visitRows: number;
  documentRows: number;
  documentAttachmentRows: number;
  documentHistoryRows: number;
  symptomRows: number;
  questionRows: number;
  labResultRows: number;
  foodCheckRows: number;
  totalRows: number;
};

type NormalizedSearchCountKey =
  | "vitalRows"
  | "visitRows"
  | "documentRows"
  | "documentAttachmentRows"
  | "documentHistoryRows"
  | "symptomRows"
  | "questionRows"
  | "labResultRows"
  | "foodCheckRows";

type SaveOptions = {
  normalizedMirror?: NormalizedCareVaultMirror;
};

const STORAGE_KEY = "carevault.v1";
const SQL_CONNECTION = "sqlite:carevault.db";
const SQL_STATE_KEY = "main";
const SQLITE_BUSY_RETRY_DELAYS_MS = [75, 150, 300, 600] as const;

type SqlDatabase = {
  select: (query: string, bindValues?: unknown[]) => Promise<unknown>;
  execute: (query: string, bindValues?: unknown[]) => Promise<unknown>;
};

export type SqlStatement = {
  query: string;
  bindValues?: unknown[];
};

export type NormalizedSearchStatement = SqlStatement & {
  key: NormalizedSearchCountKey;
};

let dbPromise: Promise<SqlDatabase | null> | null = null;

const sqliteBusyTimeoutStatement: SqlStatement = {
  query: "PRAGMA busy_timeout = 5000",
};

const appStateTableStatement: SqlStatement = {
  query: `CREATE TABLE IF NOT EXISTS app_state (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
};

function canUseLocalStorage() {
  try {
    return typeof window !== "undefined" && "localStorage" in window;
  } catch {
    return false;
  }
}

function readLocalStorageValue(key: string): { ok: true; value: string | null } | { ok: false } {
  try {
    return { ok: true, value: localStorage.getItem(key) };
  } catch {
    return { ok: false };
  }
}

function writeLocalStorageState<T>(key: string, state: T) {
  try {
    localStorage.setItem(key, JSON.stringify(state));
    return true;
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
      .then(async (module) => {
        const db = (await module.default.load(SQL_CONNECTION)) as SqlDatabase;
        await db.execute(sqliteBusyTimeoutStatement.query).catch(() => undefined);
        return db;
      })
      .catch(() => null);
  }
  return dbPromise;
}

export function buildAppStateTableStatement(): SqlStatement {
  return appStateTableStatement;
}

export function buildSqliteBusyTimeoutStatement(): SqlStatement {
  return sqliteBusyTimeoutStatement;
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
      waist_cm TEXT NOT NULL DEFAULT '',
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
      temperature_c REAL,
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
    query: `CREATE TABLE IF NOT EXISTS document_attachments (
      document_id TEXT PRIMARY KEY NOT NULL,
      attachment_name TEXT NOT NULL,
      attachment_storage TEXT,
      attachment_status TEXT,
      is_deleted INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  },
  {
    query: `CREATE TABLE IF NOT EXISTS document_history (
      id TEXT PRIMARY KEY NOT NULL,
      document_id TEXT NOT NULL,
      at TEXT NOT NULL,
      kind TEXT NOT NULL,
      label TEXT NOT NULL,
      detail TEXT NOT NULL,
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
      priority TEXT NOT NULL DEFAULT 'next-visit',
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

function normalizeSqlCountNumber(value: number) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function parseSqlCount(value: unknown) {
  if (typeof value === "number") return normalizeSqlCountNumber(value);
  if (typeof value === "bigint") {
    if (value < BigInt(0) || value > BigInt(Number.MAX_SAFE_INTEGER)) return 0;
    return Number(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) return 0;
    return normalizeSqlCountNumber(Number(trimmed));
  }
  return 0;
}

function readSqlRows(rows: unknown) {
  if (!Array.isArray(rows)) return undefined;
  return rows.filter(
    (row): row is Record<string, unknown> =>
      Boolean(row) && typeof row === "object" && !Array.isArray(row),
  );
}

function readFirstSqlRow(rows: unknown) {
  return readSqlRows(rows)?.[0];
}

export function parseSqlCountRow(rows: unknown) {
  return parseSqlCount(readFirstSqlRow(rows)?.count);
}

export function sqlColumnExists(rows: unknown, columnName: string) {
  return readSqlRows(rows)?.some((row) => row.name === columnName) ?? false;
}

export function isSqliteBusyError(error: unknown) {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : String(error);
  return (
    message.includes("database is locked") ||
    message.includes("SQLITE_BUSY") ||
    message.includes("code: 5")
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retrySqliteBusy<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= SQLITE_BUSY_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const retryDelay = SQLITE_BUSY_RETRY_DELAYS_MS[attempt];
      if (!isSqliteBusyError(error) || retryDelay === undefined) {
        throw error;
      }
      await sleep(retryDelay);
    }
  }

  throw lastError;
}

export function buildSqlLikePattern(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  return `%${trimmed.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;
}

function parseOptionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function buildNormalizedSearchStatements(input: string): NormalizedSearchStatement[] {
  const likePattern = buildSqlLikePattern(input);
  if (!likePattern) return [];

  const bindValues = [likePattern];
  const like = "LIKE $1 ESCAPE '\\'";

  return [
    {
      key: "vitalRows",
      query: `SELECT COUNT(*) AS count FROM vitals
        WHERE date ${like}
          OR type ${like}
          OR COALESCE(CAST(temperature_c AS TEXT), '') ${like}
          OR COALESCE(glucose_context, '') ${like}
          OR note ${like}`,
      bindValues,
    },
    {
      key: "visitRows",
      query: `SELECT COUNT(*) AS count FROM visits
        WHERE date ${like}
          OR hospital ${like}
          OR reason ${like}
          OR summary ${like}
          OR plan ${like}
          OR next_date ${like}`,
      bindValues,
    },
    {
      key: "documentRows",
      query: `SELECT COUNT(*) AS count FROM care_documents
        WHERE is_deleted = 0
          AND (
            date ${like}
            OR title ${like}
            OR category ${like}
            OR body ${like}
            OR tags ${like}
            OR review_status ${like}
            OR next_action ${like}
            OR COALESCE(attachment_name, '') ${like}
            OR COALESCE(attachment_status, '') ${like}
          )`,
      bindValues,
    },
    {
      key: "documentAttachmentRows",
      query: `SELECT COUNT(*) AS count FROM document_attachments
        WHERE attachment_name ${like}
          OR COALESCE(attachment_storage, '') ${like}
          OR COALESCE(attachment_status, '') ${like}`,
      bindValues,
    },
    {
      key: "documentHistoryRows",
      query: `SELECT COUNT(*) AS count FROM document_history
        WHERE document_id ${like}
          OR at ${like}
          OR kind ${like}
          OR label ${like}
          OR detail ${like}`,
      bindValues,
    },
    {
      key: "symptomRows",
      query: `SELECT COUNT(*) AS count FROM symptoms
        WHERE date ${like}
          OR symptom ${like}
          OR medication ${like}
          OR body ${like}
          OR action ${like}`,
      bindValues,
    },
    {
      key: "questionRows",
      query: `SELECT COUNT(*) AS count FROM questions
        WHERE date ${like}
          OR topic ${like}
          OR question ${like}
          OR priority ${like}
          OR status ${like}
          OR answer ${like}`,
      bindValues,
    },
    {
      key: "labResultRows",
      query: `SELECT COUNT(*) AS count FROM lab_results
        WHERE date ${like}
          OR name ${like}
          OR value ${like}
          OR unit ${like}
          OR lower_bound ${like}
          OR upper_bound ${like}
          OR note ${like}`,
      bindValues,
    },
    {
      key: "foodCheckRows",
      query: `SELECT COUNT(*) AS count FROM food_checks
        WHERE query ${like}
          OR level ${like}
          OR label ${like}
          OR summary ${like}
          OR matches_json ${like}`,
      bindValues,
    },
  ];
}

export function buildNormalizedMirrorStatements(
  mirror: NormalizedCareVaultMirror,
  updatedAt: string,
): SqlStatement[] {
  return [...normalizedTableStatements, ...buildNormalizedMirrorDataStatements(mirror, updatedAt)];
}

export function buildNormalizedMirrorDataStatements(
  mirror: NormalizedCareVaultMirror,
  updatedAt: string,
): SqlStatement[] {
  const statements: SqlStatement[] = [
    {
      query: `INSERT INTO profile_snapshot (
        id,
        name,
        age,
        sex,
        height_cm,
        weight_kg,
        waist_cm,
        cancer_care_mode,
        diabetes,
        hypertension,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        age = excluded.age,
        sex = excluded.sex,
        height_cm = excluded.height_cm,
        weight_kg = excluded.weight_kg,
        waist_cm = excluded.waist_cm,
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
        mirror.profile.waistCm ?? "",
        boolToSql(mirror.profile.cancerCareMode),
        boolToSql(mirror.profile.diabetes),
        boolToSql(mirror.profile.hypertension),
        updatedAt,
      ],
    },
    { query: "DELETE FROM vitals" },
    { query: "DELETE FROM visits" },
    { query: "DELETE FROM care_documents" },
    { query: "DELETE FROM document_attachments" },
    { query: "DELETE FROM document_history" },
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
        temperature_c,
        glucose_context,
        note,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      bindValues: [
        vital.id,
        vital.date,
        vital.type,
        optionalNumber(vital.systolic),
        optionalNumber(vital.diastolic),
        optionalNumber(vital.glucoseMgDl),
        optionalNumber(vital.temperatureC),
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

  mirror.documentAttachments.forEach((attachment) => {
    statements.push({
      query: `INSERT INTO document_attachments (
        document_id,
        attachment_name,
        attachment_storage,
        attachment_status,
        is_deleted,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)`,
      bindValues: [
        attachment.documentId,
        attachment.attachmentName,
        optionalText(attachment.attachmentStorage),
        optionalText(attachment.attachmentStatus),
        boolToSql(attachment.isDeleted),
        updatedAt,
      ],
    });
  });

  mirror.documentHistory.forEach((history) => {
    statements.push({
      query: `INSERT INTO document_history (
        id,
        document_id,
        at,
        kind,
        label,
        detail,
        is_deleted,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      bindValues: [
        history.id,
        history.documentId,
        history.at,
        history.kind,
        history.label,
        history.detail,
        boolToSql(history.isDeleted),
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
        priority,
        status,
        answer,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      bindValues: [
        question.id,
        question.date,
        question.topic,
        question.question,
        question.priority ?? "next-visit",
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

export function buildAppStateUpsertStatement<T>(state: T, updatedAt: string): SqlStatement {
  return {
    query: `INSERT INTO app_state (key, value, updated_at)
       VALUES ($1, $2, $3)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`,
    bindValues: [SQL_STATE_KEY, JSON.stringify(state), updatedAt],
  };
}

async function ensureNormalizedTables(db: SqlDatabase) {
  for (const statement of normalizedTableStatements) {
    await db.execute(statement.query, statement.bindValues);
  }
  await ensureProfileSnapshotColumns(db);
  await ensureVitalColumns(db);
  await ensureQuestionColumns(db);
}

async function ensureProfileSnapshotColumns(db: SqlDatabase) {
  const hasWaistColumn = sqlColumnExists(
    await db.select("PRAGMA table_info(profile_snapshot)"),
    "waist_cm",
  );
  if (!hasWaistColumn) {
    await db.execute("ALTER TABLE profile_snapshot ADD COLUMN waist_cm TEXT NOT NULL DEFAULT ''");
  }
}

async function ensureVitalColumns(db: SqlDatabase) {
  const hasTemperatureColumn = sqlColumnExists(
    await db.select("PRAGMA table_info(vitals)"),
    "temperature_c",
  );
  if (!hasTemperatureColumn) {
    await db.execute("ALTER TABLE vitals ADD COLUMN temperature_c REAL");
  }
}

async function ensureQuestionColumns(db: SqlDatabase) {
  const hasPriorityColumn = sqlColumnExists(
    await db.select("PRAGMA table_info(questions)"),
    "priority",
  );
  if (!hasPriorityColumn) {
    await db.execute(
      "ALTER TABLE questions ADD COLUMN priority TEXT NOT NULL DEFAULT 'next-visit'",
    );
  }
}

async function ensureAppStateTable(db: SqlDatabase) {
  await db.execute(appStateTableStatement.query, appStateTableStatement.bindValues);
}

async function writeSqliteState<T>(
  db: SqlDatabase,
  state: T,
  updatedAt: string,
  mirror?: NormalizedCareVaultMirror,
) {
  await ensureAppStateTable(db);
  const appStateStatement = buildAppStateUpsertStatement(state, updatedAt);

  if (!mirror) {
    await db.execute(appStateStatement.query, appStateStatement.bindValues);
    return;
  }

  await ensureNormalizedTables(db);
  for (const statement of buildNormalizedMirrorDataStatements(mirror, updatedAt)) {
    await db.execute(statement.query, statement.bindValues);
  }
  await db.execute(appStateStatement.query, appStateStatement.bindValues);
}

async function selectCount(db: SqlDatabase, query: string, bindValues?: unknown[]) {
  return parseSqlCountRow(await db.select(query, bindValues));
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
  const documentAttachmentRows = await selectCount(
    db,
    "SELECT COUNT(*) AS count FROM document_attachments",
  );
  const documentHistoryRows = await selectCount(
    db,
    "SELECT COUNT(*) AS count FROM document_history",
  );
  const symptomRows = await selectCount(db, "SELECT COUNT(*) AS count FROM symptoms");
  const questionRows = await selectCount(db, "SELECT COUNT(*) AS count FROM questions");
  const labResultRows = await selectCount(db, "SELECT COUNT(*) AS count FROM lab_results");
  const foodCheckRows = await selectCount(db, "SELECT COUNT(*) AS count FROM food_checks");
  const latestRows = await db.select(`SELECT MAX(mirror_updated_at) AS latestUpdatedAt
    FROM (
      SELECT updated_at AS mirror_updated_at FROM profile_snapshot
      UNION ALL SELECT updated_at FROM vitals
      UNION ALL SELECT updated_at FROM visits
      UNION ALL SELECT updated_at FROM care_documents
      UNION ALL SELECT updated_at FROM document_attachments
      UNION ALL SELECT updated_at FROM document_history
      UNION ALL SELECT updated_at FROM symptoms
      UNION ALL SELECT updated_at FROM questions
      UNION ALL SELECT updated_at FROM lab_results
      UNION ALL SELECT checked_at FROM food_checks
    )`);

  return {
    checkedAt: new Date().toISOString(),
    profileRows,
    vitalRows,
    visitRows,
    activeDocumentRows,
    deletedDocumentRows,
    documentAttachmentRows,
    documentHistoryRows,
    symptomRows,
    questionRows,
    labResultRows,
    foodCheckRows,
    latestUpdatedAt: parseOptionalText(readFirstSqlRow(latestRows)?.latestUpdatedAt),
  };
}

export async function loadNormalizedSearchSummary(
  query: string,
): Promise<NormalizedSearchSummary | null> {
  const db = await getDatabase();
  const trimmedQuery = query.trim();
  if (!db || !trimmedQuery) return null;

  await ensureNormalizedTables(db);

  const statements = buildNormalizedSearchStatements(trimmedQuery);
  if (!statements.length) return null;

  const counts = await Promise.all(
    statements.map(async (statement) => ({
      key: statement.key,
      count: await selectCount(db, statement.query, statement.bindValues),
    })),
  );
  const summary = counts.reduce(
    (current, item) => ({
      ...current,
      [item.key]: item.count,
      totalRows: current.totalRows + item.count,
    }),
    {
      query: trimmedQuery,
      searchedAt: new Date().toISOString(),
      vitalRows: 0,
      visitRows: 0,
      documentRows: 0,
      documentAttachmentRows: 0,
      documentHistoryRows: 0,
      symptomRows: 0,
      questionRows: 0,
      labResultRows: 0,
      foodCheckRows: 0,
      totalRows: 0,
    } satisfies NormalizedSearchSummary,
  );

  return summary;
}

function loadFromLocalStorage<T>(fallback: T): PersistedState<T> {
  if (!canUseLocalStorage()) {
    return { state: fallback, backend: "memory" };
  }

  const raw = readLocalStorageValue(STORAGE_KEY);
  if (!raw.ok) {
    return { state: fallback, backend: "memory" };
  }
  if (!raw.value) {
    return {
      state: fallback,
      backend: writeLocalStorageState(STORAGE_KEY, fallback) ? "localStorage" : "memory",
    };
  }

  try {
    return { state: JSON.parse(raw.value) as T, backend: "localStorage" };
  } catch {
    return {
      state: fallback,
      backend: writeLocalStorageState(STORAGE_KEY, fallback) ? "localStorage" : "memory",
    };
  }
}

export async function loadPersistedState<T>(fallback: T): Promise<PersistedState<T>> {
  const db = await getDatabase();
  if (!db) return loadFromLocalStorage(fallback);

  await ensureAppStateTable(db);
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
    await retrySqliteBusy(() => writeSqliteState(db, state, updatedAt, options.normalizedMirror));
    return "sqlite";
  }

  if (canUseLocalStorage() && writeLocalStorageState(STORAGE_KEY, state)) {
    return "localStorage";
  }

  return "memory";
}
