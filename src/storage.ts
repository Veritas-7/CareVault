export type PersistenceBackend = "sqlite" | "localStorage" | "memory";

type PersistedState<T> = {
  state: T;
  backend: PersistenceBackend;
};

const STORAGE_KEY = "carevault.v1";
const SQL_CONNECTION = "sqlite:carevault.db";
const SQL_STATE_KEY = "main";

type SqlDatabase = {
  select: (query: string, bindValues?: unknown[]) => Promise<unknown>;
  execute: (query: string, bindValues?: unknown[]) => Promise<unknown>;
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

export async function savePersistedState<T>(state: T): Promise<PersistenceBackend> {
  const db = await getDatabase();
  if (db) {
    await db.execute(
      `INSERT INTO app_state (key, value, updated_at)
       VALUES ($1, $2, $3)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`,
      [SQL_STATE_KEY, JSON.stringify(state), new Date().toISOString()],
    );
    return "sqlite";
  }

  if (canUseLocalStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return "localStorage";
  }

  return "memory";
}
