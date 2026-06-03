import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Apple,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartPulse,
  Hospital,
  LineChart as LineChartIcon,
  Plus,
  Save,
  Search,
  ShieldCheck,
  UserRound,
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
  calculateBmi,
  type GlucoseContext,
} from "./healthRules";
import {
  loadPersistedState,
  savePersistedState,
  type PersistenceBackend,
} from "./storage";

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
};

type AppState = {
  profile: Profile;
  vitals: VitalEntry[];
  visits: VisitEntry[];
  documents: CareDocument[];
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

const createId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function App() {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [storageBackend, setStorageBackend] = useState<PersistenceBackend>("memory");
  const [saveLabel, setSaveLabel] = useState("저장소 확인 중");
  const [vitalDraft, setVitalDraft] = useState<VitalEntry>(emptyVital);
  const [visitDraft, setVisitDraft] = useState<VisitEntry>(emptyVisit);
  const [documentDraft, setDocumentDraft] = useState<CareDocument>(emptyDocument);
  const [foodQuery, setFoodQuery] = useState("브로콜리, 현미밥, 베이컨, 자몽 주스");
  const [documentFilter, setDocumentFilter] = useState("");

  useEffect(() => {
    let active = true;

    loadPersistedState(defaultState).then((result) => {
      if (!active) return;
      setState(result.state);
      setStorageBackend(result.backend);
      setSaveLabel(result.backend === "sqlite" ? "SQLite 저장 준비" : "브라우저 저장 준비");
      setHydrated(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const handle = window.setTimeout(() => {
      savePersistedState(state)
        .then((backend) => {
          setStorageBackend(backend);
          setSaveLabel(backend === "sqlite" ? "SQLite 자동 저장됨" : "브라우저 자동 저장됨");
        })
        .catch(() => setSaveLabel("저장 실패"));
    }, 250);

    return () => window.clearTimeout(handle);
  }, [state]);

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
  const foodAssessment = useMemo(() => assessCancerFood(foodQuery), [foodQuery]);

  const chartData = [...state.vitals]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({
      date: entry.date.slice(5),
      systolic: entry.systolic,
      diastolic: entry.diastolic,
      glucose: entry.glucoseMgDl,
    }));

  const filteredDocuments = state.documents.filter((document) => {
    const haystack = `${document.title} ${document.body} ${document.tags}`.toLowerCase();
    return haystack.includes(documentFilter.toLowerCase());
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

  const addDocument = () => {
    if (!documentDraft.title.trim() || !documentDraft.body.trim()) return;
    setState((current) => ({
      ...current,
      documents: [...current.documents, { ...documentDraft, id: createId("doc") }],
    }));
    setDocumentDraft({ ...emptyDocument, date: today });
  };

  const storageText =
    storageBackend === "sqlite"
      ? "현재 데이터는 Tauri SQLite DB에 저장됩니다."
      : storageBackend === "localStorage"
        ? "현재 데이터는 이 기기의 브라우저 저장소에 보관됩니다."
        : "현재 데이터는 임시 메모리에만 있습니다.";

  const saveNow = () => {
    savePersistedState(state)
      .then((backend) => {
        setStorageBackend(backend);
        setSaveLabel(backend === "sqlite" ? "SQLite 저장됨" : "브라우저 저장됨");
      })
      .catch(() => setSaveLabel("저장 실패"));
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
          <a href="#documents">
            <FileText aria-hidden="true" />
            서류 보관
          </a>
        </nav>
        <div className="privacy-note">
          <ShieldCheck aria-hidden="true" />
          <span>{storageText}</span>
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
                detail: item.tags,
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

        <section id="nutrition" className="panel nutrition-panel">
          <div className="section-title">
            <h2>암환자 음식 판단</h2>
            <span>치료가 아니라 근거 기반 주의·기록 도구</span>
          </div>
          <div className="nutrition-layout">
            <label className="wide-label">
              음식 또는 식단 입력
              <textarea
                value={foodQuery}
                onChange={(event) => setFoodQuery(event.currentTarget.value)}
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
              태그
              <input
                value={documentDraft.tags}
                onChange={(event) =>
                  setDocumentDraft({ ...documentDraft, tags: event.currentTarget.value })
                }
                placeholder="예: 혈액검사,항암,부작용"
              />
            </label>
            <button className="primary-button" type="button" onClick={addDocument}>
              <Plus aria-hidden="true" />
              서류 메모 저장
            </button>
          </section>

          <section className="panel document-list-panel">
            <div className="section-title">
              <h2>저장된 서류</h2>
              <span>{state.documents.length}개 기록</span>
            </div>
            <label className="search-field">
              <Search aria-hidden="true" />
              <input
                value={documentFilter}
                onChange={(event) => setDocumentFilter(event.currentTarget.value)}
                placeholder="제목, 내용, 태그 검색"
              />
            </label>
            <div className="document-list">
              {filteredDocuments.map((document) => (
                <article className="document-item" key={document.id}>
                  <div>
                    <span>{document.date}</span>
                    <strong>{document.title}</strong>
                    <p>{document.body}</p>
                  </div>
                  <mark>{documentLabel[document.category]}</mark>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className="next-steps">
          <CalendarDays aria-hidden="true" />
          <p>
            다음 개발 슬라이스: 정규화된 SQLite 테이블, 서류 첨부 파일 보관, 검사 수치 사전,
            병원 방문 전 질문 생성, 가족/보호자 공유용 내보내기.
          </p>
        </section>
      </section>
    </main>
  );
}

export default App;
