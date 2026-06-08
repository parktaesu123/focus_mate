import {
  ArrowRight,
  Award,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  Focus,
  Fullscreen,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  LogOut,
  MessageCircleMore,
  MoonStar,
  Music2,
  Pause,
  Play,
  Plus,
  RefreshCcw,
  RotateCcw,
  Send,
  Sparkles,
  Star,
  Sprout,
  Target,
  Trophy,
  UserPlus,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type {
  ChatMessage,
  FocusSession,
  Insight,
  Priority,
  ScheduleBlock,
  Task,
} from "./types";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

const localDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const today = localDateKey();

const initialTasks: Task[] = [
  {
    id: crypto.randomUUID(),
    title: "수학 수행평가 문제 풀이",
    minutes: 50,
    priority: "high",
    date: today,
    completed: false,
  },
  {
    id: crypto.randomUUID(),
    title: "과학 발표 자료 정리",
    minutes: 40,
    priority: "medium",
    date: today,
    completed: false,
  },
  {
    id: crypto.randomUUID(),
    title: "영어 단어 복습",
    minutes: 25,
    priority: "low",
    date: today,
    completed: false,
  },
];

const initialSessions: FocusSession[] = [35, 80, 45, 105, 60, 90].map(
  (minutes, index) => ({
    id: crypto.randomUUID(),
    minutes,
    completedAt: addDays(new Date(), index - 6).toISOString(),
  }),
);

const initialChat: ChatMessage[] = [
  {
    id: crypto.randomUUID(),
    role: "assistant",
    content:
      "안녕! 나는 집중 코치 조수리야. 오늘 할 일을 넣으면 순서도 잡아주고, 멈칫하면 슬쩍 등도 떠밀어줄게.",
  },
];

const priorityLabel: Record<Priority, string> = {
  high: "긴급",
  medium: "중요",
  low: "가벼움",
};

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

const formatTimer = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60,
  ).padStart(2, "0")}`;

const displayDate = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "long",
}).format(new Date());

const getDayLabel = (date: Date) =>
  new Intl.DateTimeFormat("ko-KR", { weekday: "short" })
    .format(date)
    .replace(".", "");

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AuthResult {
  user: AuthUser;
  token: string;
}

function LandingPage({
  onLogin,
  onRegister,
}: {
  onLogin: () => void;
  onRegister: () => void;
}) {
  return (
    <div className="marketing-site">
      <header className="marketing-nav">
        <button className="marketing-brand" onClick={() => window.scrollTo(0, 0)}>
          <span>
            <BrainCircuit size={23} />
          </span>
          FocusMate
        </button>
        <nav>
          <a href="#features">기능</a>
          <a href="#how-it-works">사용 방법</a>
          <a href="#ai-coach">AI 코치</a>
        </nav>
        <div className="marketing-actions">
          <button className="nav-login" onClick={onLogin}>
            로그인
          </button>
          <button className="nav-start" onClick={onRegister}>
            무료로 시작하기
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="hero-copy">
            <div className="hero-badge">
              <Sparkles size={15} />
              Claude AI가 설계하는 나만의 집중 루틴
            </div>
            <h1>
              계획만 세우다 끝나는 하루,
              <br />
              <span>이제 AI와 끝내세요.</span>
            </h1>
            <p>
              해야 할 일과 예상 시간을 입력하면 AI가 현실적인 하루 시간표를
              만들고, 뽀모도로 타이머와 집중 코치가 끝까지 함께합니다.
            </p>
            <div className="hero-actions">
              <button className="primary-cta" onClick={onRegister}>
                지금 무료로 시작하기
                <ArrowRight size={18} />
              </button>
              <a href="#how-it-works" className="secondary-cta">
                어떻게 작동하나요?
              </a>
            </div>
            <div className="hero-trust">
              <span>
                <CheckCircle2 size={15} /> 카드 등록 없음
              </span>
              <span>
                <CheckCircle2 size={15} /> 1분 만에 시작
              </span>
              <span>
                <CheckCircle2 size={15} /> 개인별 데이터 분리
              </span>
            </div>
          </div>

          <div className="hero-product">
            <div className="product-window">
              <div className="window-bar">
                <i />
                <i />
                <i />
                <span>focusmate.today/dashboard</span>
              </div>
              <div className="product-preview">
                <div className="preview-sidebar">
                  <BrainCircuit size={21} />
                  <i className="active" />
                  <i />
                  <i />
                </div>
                <div className="preview-main">
                  <div className="preview-title">
                    <span>오늘의 집중 계획</span>
                    <small>6월 8일 월요일</small>
                  </div>
                  <div className="preview-stats">
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="preview-grid">
                    <div className="preview-tasks">
                      <strong>오늘 할 일</strong>
                      <span><b /> 수학 수행평가 문제 풀이</span>
                      <span><b /> 과학 발표 자료 정리</span>
                      <span><b /> 영어 단어 복습</span>
                    </div>
                    <div className="preview-timer">
                      <div>
                        <small>FOCUS TIME</small>
                        <strong>25:00</strong>
                      </div>
                      <button><Play size={18} fill="currentColor" /></button>
                    </div>
                  </div>
                  <div className="preview-ai">
                    <span><MessageCircleMore size={17} /></span>
                    <p>
                      어려운 수학부터 오전에 배치했어요.
                      <strong> 딱 25분만 시작해볼까요?</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="floating-card floating-score">
              <Zap size={18} />
              <span><small>생산성 점수</small><strong>87점</strong></span>
            </div>
            <div className="floating-card floating-ai">
              <span><MessageCircleMore size={18} /></span>
              <strong>조수리가 기다려요!</strong>
            </div>
          </div>
        </section>

        <section className="logo-strip">
          <p>미루는 습관을 바꾸는 가장 똑똑한 방법</p>
          <div>
            <span><Target size={18} /> SMART PLAN</span>
            <span><Clock3 size={18} /> POMODORO</span>
            <span><BrainCircuit size={18} /> CLAUDE AI</span>
            <span><BarChart3 size={18} /> WEEKLY INSIGHT</span>
          </div>
        </section>

        <section className="marketing-section features-section" id="features">
          <div className="section-heading">
            <p>하루를 바꾸는 작은 시스템</p>
            <h2>계획부터 회고까지, 한곳에서</h2>
            <span>
              여러 생산성 앱을 오갈 필요 없이 FocusMate가 집중의 전 과정을
              연결합니다.
            </span>
          </div>
          <div className="feature-grid">
            <article className="feature-card featured">
              <span className="feature-icon"><Sparkles size={22} /></span>
              <div>
                <small>AI TIME BLOCKING</small>
                <h3>AI가 만드는 현실적인 하루 계획</h3>
                <p>
                  작업의 우선순위와 예상 시간을 분석해 가장 집중하기 좋은
                  순서로 자동 배치합니다.
                </p>
              </div>
              <div className="mini-schedule">
                <span><b>09:00</b><i />수학 문제 풀이</span>
                <span><b>10:00</b><i />과학 발표 정리</span>
                <span><b>10:50</b><i />영어 단어 복습</span>
              </div>
            </article>
            <article className="feature-card">
              <span className="feature-icon orange"><Clock3 size={22} /></span>
              <small>FOCUS TIMER</small>
              <h3>25분 집중, 5분 휴식</h3>
              <p>다른 탭으로 이동하면 알림을 보내 흐트러진 집중을 되찾아요.</p>
            </article>
            <article className="feature-card" id="ai-coach">
              <span className="feature-icon green"><MessageCircleMore size={22} /></span>
              <small>AI COACH</small>
              <h3>미룰 때 찾아오는 조수리</h3>
              <p>멈춘 순간을 알아채고 지금 할 수 있는 가장 작은 행동을 제안해요.</p>
            </article>
            <article className="feature-card">
              <span className="feature-icon blue"><BarChart3 size={22} /></span>
              <small>WEEKLY REPORT</small>
              <h3>나만의 집중 패턴 발견</h3>
              <p>일주일 기록을 분석해 가장 생산적인 시간과 다음 행동을 알려줘요.</p>
            </article>
            <article className="feature-card">
              <span className="feature-icon pink"><Trophy size={22} /></span>
              <small>ACHIEVEMENTS</small>
              <h3>작은 성공을 눈에 보이게</h3>
              <p>완료한 작업과 집중 시간만큼 스탬프가 쌓이고 성장이 기록됩니다.</p>
            </article>
          </div>
        </section>

        <section className="marketing-section process-section" id="how-it-works">
          <div className="section-heading">
            <p>HOW IT WORKS</p>
            <h2>시작은 단 세 단계면 충분해요</h2>
          </div>
          <div className="process-grid">
            <article><span>01</span><Plus size={25} /><h3>할 일 입력</h3><p>작업과 예상 시간, 중요도를 간단히 적어요.</p></article>
            <article><span>02</span><BrainCircuit size={25} /><h3>AI 자동 배치</h3><p>Claude가 오늘 가능한 최적의 순서를 설계해요.</p></article>
            <article><span>03</span><Focus size={25} /><h3>집중 시작</h3><p>타이머와 조수리의 도움으로 하나씩 끝내요.</p></article>
          </div>
        </section>

        <section className="final-cta">
          <div>
            <span><Clock3 size={34} /></span>
            <h2>내일로 미루기 전에, 오늘 25분부터.</h2>
            <p>가입하고 나만의 AI 집중 코치와 첫 번째 집중 블록을 시작하세요.</p>
            <button onClick={onRegister}>
              무료 계정 만들기 <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <div className="marketing-brand">
          <span><BrainCircuit size={20} /></span>
          FocusMate
        </div>
        <p>AI로 더 나은 집중 습관을 만드는 학생 생산성 서비스</p>
        <small>© 2026 FocusMate. School project.</small>
      </footer>
    </div>
  );
}

function AuthPage({
  mode,
  onBack,
  onSwitch,
  onSuccess,
}: {
  mode: "login" | "register";
  onBack: () => void;
  onSwitch: () => void;
  onSuccess: (result: AuthResult) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      onSuccess(data);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "인증 중 문제가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <button className="auth-brand" onClick={onBack}>
          <span><BrainCircuit size={23} /></span>
          FocusMate
        </button>
        <div className="auth-visual-copy">
          <div className="auth-owl"><Clock3 size={44} /></div>
          <p>“큰 목표도 25분씩 나누면<br />생각보다 금방 끝나.”</p>
          <span>— 집중 코치 조수리</span>
        </div>
        <div className="auth-visual-stats">
          <div><strong>25분</strong><span>집중 블록</span></div>
          <div><strong>AI</strong><span>맞춤 계획</span></div>
          <div><strong>매일</strong><span>성장 기록</span></div>
        </div>
      </div>
      <div className="auth-form-side">
        <button className="back-home" onClick={onBack}>
          ← 홈으로
        </button>
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-form-icon">
            {isRegister ? <UserPlus size={24} /> : <LogIn size={24} />}
          </div>
          <p className="eyebrow">{isRegister ? "CREATE ACCOUNT" : "WELCOME BACK"}</p>
          <h1>{isRegister ? "집중할 준비가 됐나요?" : "다시 만나서 반가워요"}</h1>
          <p className="auth-description">
            {isRegister
              ? "계정을 만들고 AI가 설계하는 첫 집중 계획을 시작하세요."
              : "로그인하고 오늘의 계획과 집중 기록을 이어가세요."}
          </p>

          {isRegister && (
            <label>
              이름
              <div className="auth-input">
                <UserPlus size={17} />
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="홍길동"
                  autoComplete="name"
                  required
                />
              </div>
            </label>
          )}
          <label>
            이메일
            <div className="auth-input">
              <MessageCircleMore size={17} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="student@example.com"
                autoComplete="email"
                required
              />
            </div>
          </label>
          <label>
            비밀번호
            <div className="auth-input">
              <LockKeyhole size={17} />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="8자 이상 입력"
                minLength={8}
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
              />
            </div>
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={18} /> : null}
            {isRegister ? "무료 계정 만들기" : "로그인"}
            {!loading && <ArrowRight size={17} />}
          </button>

          <p className="auth-switch">
            {isRegister ? "이미 계정이 있나요?" : "아직 계정이 없나요?"}
            <button type="button" onClick={onSwitch}>
              {isRegister ? "로그인" : "회원가입"}
            </button>
          </p>
          <div className="auth-security">
            <LockKeyhole size={14} />
            비밀번호는 암호화되어 안전하게 저장됩니다.
          </div>
        </form>
      </div>
    </div>
  );
}

function Dashboard({
  user,
  token,
  onLogout,
}: {
  user: AuthUser;
  token: string;
  onLogout: () => void;
}) {
  const storagePrefix = `focusmate-${user.id}`;
  const [tasks, setTasks] = useLocalStorage<Task[]>(
    `${storagePrefix}-tasks`,
    initialTasks,
  );
  const [schedule, setSchedule] = useLocalStorage<ScheduleBlock[]>(
    `${storagePrefix}-schedule`,
    [],
  );
  const [sessions, setSessions] = useLocalStorage<FocusSession[]>(
    `${storagePrefix}-sessions`,
    initialSessions,
  );
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(
    `${storagePrefix}-chat`,
    initialChat,
  );
  const [taskTitle, setTaskTitle] = useState("");
  const [taskMinutes, setTaskMinutes] = useState(25);
  const [taskPriority, setTaskPriority] = useState<Priority>("medium");
  const [selectedTaskId, setSelectedTaskId] = useState(
    () => tasks.find((task) => !task.completed)?.id || "",
  );
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [insight, setInsight] = useState<Insight | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiModel, setAiModel] = useState("local fallback");
  const [toast, setToast] = useState("");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [whiteNoise, setWhiteNoise] = useState(false);
  const [workspaceView, setWorkspaceView] = useState<
    "today" | "focus" | "report"
  >("today");
  const hiddenAtRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const todayTasks = useMemo(
    () => tasks.filter((task) => task.date === today),
    [tasks],
  );
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const completedToday = todayTasks.filter((task) => task.completed).length;
  const totalFocusMinutes = sessions.reduce(
    (sum, session) => sum + session.minutes,
    0,
  );
  const timerTotal = mode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS;
  const timerProgress = Math.max(0, (timerTotal - secondsLeft) / timerTotal);
  const timerCircumference = 2 * Math.PI * 124;
  const timerOffset = timerCircumference * (1 - timerProgress);

  const weeklyData = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(new Date(), index - 6);
        const key = localDateKey(date);
        const minutes = sessions
          .filter((session) => localDateKey(new Date(session.completedAt)) === key)
          .reduce((sum, session) => sum + session.minutes, 0);
        const completed = tasks.filter(
          (task) =>
            task.completedAt &&
            localDateKey(new Date(task.completedAt)) === key,
        ).length;
        return {
          key,
          label: getDayLabel(date),
          minutes,
          score: Math.min(100, Math.round(minutes * 0.7 + completed * 14)),
        };
      }),
    [sessions, tasks],
  );

  const streak = useMemo(() => {
    let count = 0;
    for (let offset = 0; offset < 30; offset += 1) {
      const key = localDateKey(addDays(new Date(), -offset));
      const active =
        sessions.some(
          (session) => localDateKey(new Date(session.completedAt)) === key,
        ) ||
        tasks.some(
          (task) =>
            task.completedAt &&
            localDateKey(new Date(task.completedAt)) === key,
        );
      if (!active) break;
      count += 1;
    }
    return count;
  }, [sessions, tasks]);

  useEffect(() => {
    fetch("/api/health")
      .then((response) => response.json())
      .then((data) => {
        setAiEnabled(data.aiEnabled);
        setAiModel(data.model);
      })
      .catch(() => {
        setAiEnabled(false);
        setAiModel("local fallback");
      });
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  const notify = useCallback((title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }, []);

  useEffect(() => {
    if (secondsLeft !== 0 || !isRunning) return;

    setIsRunning(false);
    if (mode === "focus") {
      const session: FocusSession = {
        id: crypto.randomUUID(),
        taskId: selectedTaskId || undefined,
        minutes: FOCUS_SECONDS / 60,
        completedAt: new Date().toISOString(),
      };
      setSessions((current) => [...current, session]);
      setMode("break");
      setSecondsLeft(BREAK_SECONDS);
      setToast("집중 25분 완료! 5분은 당당하게 쉬어도 돼요.");
      notify("집중 완료!", "멋져요. 이제 5분 동안 머리를 식혀주세요.");
    } else {
      setMode("focus");
      setSecondsLeft(FOCUS_SECONDS);
      setToast("휴식 끝! 다음 집중 블록을 시작해볼까요?");
      notify("휴식 완료", "다음 25분 집중을 시작할 시간이에요.");
    }
  }, [
    isRunning,
    mode,
    notify,
    secondsLeft,
    selectedTaskId,
    setSessions,
  ]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isRunning) {
        hiddenAtRef.current = Date.now();
        document.title = `⚠️ 돌아와요! ${formatTimer(secondsLeft)}`;
        notify(
          "집중 중 다른 탭으로 이동했어요",
          "조수리가 보고 있습니다. 하던 일로 돌아오세요 👀",
        );
      } else if (!document.hidden) {
        document.title = "FocusMate AI";
        if (hiddenAtRef.current && isRunning) {
          const awaySeconds = Math.round((Date.now() - hiddenAtRef.current) / 1000);
          setToast(`${awaySeconds}초 동안 자리를 비웠군요. 다시 집중 모드!`);
          hiddenAtRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isRunning, notify, secondsLeft]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isCoachLoading]);

  useEffect(
    () => () => {
      noiseSourceRef.current?.stop();
      audioContextRef.current?.close();
    },
    [],
  );

  const addTask = (event: FormEvent) => {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    const task: Task = {
      id: crypto.randomUUID(),
      title: taskTitle.trim(),
      minutes: Math.max(5, taskMinutes),
      priority: taskPriority,
      date: today,
      completed: false,
    };
    setTasks((current) => [...current, task]);
    setSelectedTaskId((current) => current || task.id);
    setTaskTitle("");
    setTaskMinutes(25);
  };

  const toggleTask = (taskId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined,
            }
          : task,
      ),
    );
  };

  const removeTask = (taskId: string) => {
    setTasks((current) => current.filter((task) => task.id !== taskId));
    setSchedule((current) => current.filter((block) => block.taskId !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(
        todayTasks.find((task) => task.id !== taskId && !task.completed)?.id || "",
      );
    }
  };

  const createPlan = async () => {
    const pendingTasks = todayTasks.filter((task) => !task.completed);
    if (!pendingTasks.length) {
      setToast("배치할 미완료 작업이 없어요. 오늘 꽤 멋진데요?");
      return;
    }

    setIsPlanning(true);
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tasks: pendingTasks.map(({ id, title, minutes, priority }) => ({
            id,
            title,
            minutes,
            priority,
          })),
          dayStart: "09:00",
          dayEnd: "22:00",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setSchedule(data.blocks || []);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.coachMessage,
        },
      ]);
      setToast(
        data.ai
          ? "AI가 오늘의 집중 블록을 만들었어요."
          : "로컬 알고리즘으로 오늘 일정을 배치했어요.",
      );
    } catch {
      setToast("일정 배치에 실패했어요. 서버 연결을 확인해주세요.");
    } finally {
      setIsPlanning(false);
    }
  };

  const askCoach = useCallback(
    async (message: string, includeUserMessage = true) => {
      if (!message.trim()) return;
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: message.trim(),
      };
      if (includeUserMessage) {
        setMessages((current) => [...current, userMessage]);
      }
      setIsCoachLoading(true);
      try {
        const response = await fetch("/api/coach", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message,
            taskTitle: selectedTask?.title,
            timerState: isRunning ? "running" : "paused",
            recentMessages: includeUserMessage ? [...messages, userMessage] : messages,
          }),
        });
        const data = await response.json();
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.message,
          },
        ]);
      } catch {
        setToast("조수리가 잠깐 자리를 비웠어요. 다시 시도해주세요.");
      } finally {
        setIsCoachLoading(false);
      }
    },
    [isRunning, messages, selectedTask?.title, setMessages, token],
  );

  const submitChat = (event: FormEvent) => {
    event.preventDefault();
    const value = chatInput;
    setChatInput("");
    void askCoach(value);
  };

  const toggleTimer = () => {
    if (!isRunning) {
      if ("Notification" in window && Notification.permission === "default") {
        void Notification.requestPermission();
      }
      setIsRunning(true);
      setToast(
        selectedTask
          ? `"${selectedTask.title}" 집중 시작!`
          : "집중 타이머를 시작했어요.",
      );
      return;
    }

    setIsRunning(false);
    void askCoach("타이머를 잠깐 멈췄어.", false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(mode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS);
  };

  const changeMode = (nextMode: "focus" | "break") => {
    setMode(nextMode);
    setSecondsLeft(nextMode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS);
    setIsRunning(false);
  };

  const toggleNoise = () => {
    if (whiteNoise) {
      noiseSourceRef.current?.stop();
      noiseSourceRef.current = null;
      setWhiteNoise(false);
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const context = new AudioContextClass();
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = Math.random() * 2 - 1;
    }
    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.value = 0.045;
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain).connect(context.destination);
    source.start();
    audioContextRef.current = context;
    noiseSourceRef.current = source;
    setWhiteNoise(true);
  };

  const enterFocusMode = () => {
    setIsFocusMode(true);
    void document.documentElement.requestFullscreen?.();
  };

  const exitFocusMode = () => {
    setIsFocusMode(false);
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    }
  };

  const rescheduleTasks = () => {
    const tomorrow = localDateKey(addDays(new Date(), 1));
    const unfinishedIds = new Set(
      todayTasks.filter((task) => !task.completed).map((task) => task.id),
    );
    if (!unfinishedIds.size) {
      setToast("미룰 작업이 없어요. 오늘 할 일 완료!");
      return;
    }
    setTasks((current) =>
      current.map((task) =>
        unfinishedIds.has(task.id) ? { ...task, date: tomorrow } : task,
      ),
    );
    setSchedule((current) =>
      current.filter((block) => !unfinishedIds.has(block.taskId)),
    );
    setToast(`${unfinishedIds.size}개 작업을 내일로 옮겼어요.`);
  };

  const generateInsight = async () => {
    setIsInsightLoading(true);
    try {
      const response = await fetch("/api/insight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessions,
          completedTasks: tasks.filter((task) => task.completed),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setInsight(data);
    } catch {
      setToast("분석을 만들지 못했어요. 잠시 뒤 다시 시도해주세요.");
    } finally {
      setIsInsightLoading(false);
    }
  };

  const initials =
    user.name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "FM";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setWorkspaceView("today")}>
          <span className="brand-mark">
            <BrainCircuit size={24} />
          </span>
          <span>
            <strong>FocusMate</strong>
            <small>나만의 집중 도우미</small>
          </span>
        </button>

        <nav className="side-nav">
          <button
            className={workspaceView === "today" ? "active" : ""}
            onClick={() => setWorkspaceView("today")}
          >
            <CalendarDays size={19} />
            오늘
          </button>
          <button
            className={workspaceView === "focus" ? "active" : ""}
            onClick={() => setWorkspaceView("focus")}
          >
            <Focus size={19} />
            집중
          </button>
          <button
            className={workspaceView === "report" ? "active" : ""}
            onClick={() => setWorkspaceView("report")}
          >
            <BarChart3 size={19} />
            리포트
          </button>
        </nav>

        <div className="sidebar-card">
          <div className="owl-mini"><Target size={20} /></div>
          <strong>오늘의 작은 목표</strong>
          <p>할 일 하나를 고르고 25분만 시작해보세요.</p>
        </div>

        <div className="ai-status">
          <span className={aiEnabled ? "status-dot online" : "status-dot"} />
          <span>
            <strong>{aiEnabled ? "집중 코치 사용 가능" : "기본 모드"}</strong>
            <small>{aiEnabled ? "온라인" : aiModel}</small>
          </span>
        </div>
        <button className="logout-button" onClick={onLogout}>
          <LogOut size={16} />
          로그아웃
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar" id="dashboard">
          <div>
            <p className="eyebrow">{displayDate}</p>
            <h1>
              {workspaceView === "today" && <>오늘 할 일을 <span>정리해요</span></>}
              {workspaceView === "focus" && <>한 가지 일에 <span>집중해요</span></>}
              {workspaceView === "report" && <>이번 주를 <span>돌아봐요</span></>}
            </h1>
            <p className="page-description">
              {workspaceView === "today" &&
                "할 일을 추가하고, 준비가 되면 오늘 일정을 만들어보세요."}
              {workspaceView === "focus" &&
                "집중할 일을 선택한 뒤 타이머를 시작하세요."}
              {workspaceView === "report" &&
                "완료한 작업과 집중 기록에서 다음 습관을 찾아보세요."}
            </p>
          </div>
          <div className="header-actions">
            <div className="profile">
              <span>{initials}</span>
              <div>
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </div>
            </div>
          </div>
        </header>

        {workspaceView === "today" && (
        <section className="stat-grid simple-stats">
          <article className="stat-card purple">
            <span className="stat-icon">
              <Flame size={22} />
            </span>
            <div>
              <small>연속 집중</small>
              <strong>{streak}일</strong>
            </div>
            <span className="trend">꾸준해요</span>
          </article>
          <article className="stat-card blue">
            <span className="stat-icon">
              <Clock3 size={22} />
            </span>
            <div>
              <small>누적 집중</small>
              <strong>{totalFocusMinutes}분</strong>
            </div>
            <span className="trend">이번 주</span>
          </article>
          <article className="stat-card orange">
            <span className="stat-icon">
              <Target size={22} />
            </span>
            <div>
              <small>오늘 달성</small>
              <strong>
                {completedToday}/{todayTasks.length}
              </strong>
            </div>
            <span className="trend">작업</span>
          </article>
        </section>
        )}

        <section className={`dashboard-grid ${workspaceView}`} id="today-plan">
          {workspaceView === "today" && (
          <article className="panel task-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">오늘</p>
                <h2>오늘 할 일</h2>
              </div>
              <span className="count-badge">{todayTasks.length}</span>
            </div>

            <form className="task-form" onSubmit={addTask}>
              <div className="task-title-input">
                <Plus size={18} />
                <input
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="해야 할 일을 입력하세요"
                />
              </div>
              <div className="task-form-row">
                <label>
                  <Clock3 size={15} />
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={taskMinutes}
                    onChange={(event) => setTaskMinutes(Number(event.target.value))}
                  />
                  분
                </label>
                <select
                  value={taskPriority}
                  onChange={(event) =>
                    setTaskPriority(event.target.value as Priority)
                  }
                >
                  <option value="high">긴급</option>
                  <option value="medium">중요</option>
                  <option value="low">가벼움</option>
                </select>
                <button className="add-button" type="submit">
                  추가
                </button>
              </div>
            </form>

            <div className="task-list">
              {todayTasks.map((task) => (
                <div
                  className={`task-item ${task.completed ? "completed" : ""} ${
                    selectedTaskId === task.id ? "selected" : ""
                  }`}
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <button
                    className="check-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleTask(task.id);
                    }}
                  >
                    {task.completed && <Check size={15} strokeWidth={3} />}
                  </button>
                  <div className="task-copy">
                    <strong>{task.title}</strong>
                    <span>
                      {task.minutes}분 · {priorityLabel[task.priority]}
                    </span>
                  </div>
                  <span className={`priority-dot ${task.priority}`} />
                  <button
                    className="delete-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeTask(task.id);
                    }}
                    title="삭제"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
              {!todayTasks.length && (
                <div className="empty-state">
                  <MoonStar size={28} />
                  <p>오늘 할 일이 아직 없어요.</p>
                </div>
              )}
            </div>

            <button
              className="ai-plan-button"
              onClick={createPlan}
              disabled={isPlanning}
            >
              {isPlanning ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <CalendarDays size={18} />
              )}
              오늘 일정 만들기
            </button>
          </article>
          )}

          {workspaceView === "focus" && (
          <article className="panel timer-panel">
            <div className="mode-tabs">
              <button
                className={mode === "focus" ? "active" : ""}
                onClick={() => changeMode("focus")}
              >
                집중 25
              </button>
              <button
                className={mode === "break" ? "active" : ""}
                onClick={() => changeMode("break")}
              >
                휴식 5
              </button>
            </div>

            <div className="timer-wrap">
              <svg className="timer-ring" viewBox="0 0 280 280">
                <circle className="timer-track" cx="140" cy="140" r="124" />
                <circle
                  className="timer-progress"
                  cx="140"
                  cy="140"
                  r="124"
                  strokeDasharray={timerCircumference}
                  strokeDashoffset={timerOffset}
                />
              </svg>
              <div className="timer-content">
                <span className="timer-state">
                  {mode === "focus" ? "FOCUS TIME" : "BREAK TIME"}
                </span>
                <strong>{formatTimer(secondsLeft)}</strong>
                <small>{isRunning ? "몰입 중" : "준비되면 시작하세요"}</small>
              </div>
            </div>

            <div className="current-task">
              <span>현재 집중할 일</span>
              <strong>{selectedTask?.title || "할 일을 선택해주세요"}</strong>
            </div>

            <div className="timer-controls">
              <button className="secondary-round" onClick={resetTimer} title="초기화">
                <RotateCcw size={20} />
              </button>
              <button className="play-button" onClick={toggleTimer}>
                {isRunning ? <Pause size={28} /> : <Play size={28} fill="currentColor" />}
              </button>
              <button
                className={`secondary-round ${whiteNoise ? "active" : ""}`}
                onClick={toggleNoise}
                title="백색 소음"
              >
                {whiteNoise ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
            </div>

            <button className="focus-mode-button" onClick={enterFocusMode}>
              <Fullscreen size={17} />
              방해 금지 전체화면
            </button>
          </article>
          )}

          {workspaceView === "focus" && (
          <article className="panel coach-panel">
            <div className="coach-heading">
              <div className="owl-avatar"><MessageCircleMore size={22} /></div>
              <div>
                <span className="online-label">집중 도우미</span>
                <h2>조수리 코치</h2>
              </div>
            </div>

            <div className="chat-messages">
              {messages.slice(-4).map((message) => (
                <div className={`message ${message.role}`} key={message.id}>
                  {message.role === "assistant" && (
                    <span className="message-avatar"><MessageCircleMore size={13} /></span>
                  )}
                  <p>{message.content}</p>
                </div>
              ))}
              {isCoachLoading && (
                <div className="message assistant">
                  <span className="message-avatar"><MessageCircleMore size={13} /></span>
                  <p className="typing">
                    <i />
                    <i />
                    <i />
                  </p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form className="chat-form" onSubmit={submitChat}>
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="조수리에게 말 걸기..."
              />
              <button type="submit" disabled={isCoachLoading}>
                <Send size={17} />
              </button>
            </form>
          </article>
          )}
        </section>

        {(workspaceView === "today" || workspaceView === "report") && (
        <section className={`lower-grid ${workspaceView}`}>
          {workspaceView === "today" && (
          <article className="panel schedule-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">오늘 일정</p>
                <h2>오늘의 집중 시간표</h2>
              </div>
              <button className="text-button" onClick={createPlan}>
                <RefreshCcw size={15} />
                다시 배치
              </button>
            </div>

            <div className="timeline">
              {schedule.map((block, index) => {
                const task = tasks.find((item) => item.id === block.taskId);
                if (!task) return null;
                return (
                  <div className="timeline-item" key={`${block.taskId}-${index}`}>
                    <span className="timeline-time">{block.start}</span>
                    <span className="timeline-line">
                      <i className={task.priority} />
                    </span>
                    <div className="timeline-card">
                      <span>{block.start} — {block.end}</span>
                      <strong>{task.title}</strong>
                      <small>{block.note}</small>
                    </div>
                  </div>
                );
              })}
              {!schedule.length && (
                <div className="schedule-empty">
                  <CalendarDays size={26} />
                  <div>
                    <strong>아직 일정이 없어요</strong>
                    <p>할 일을 입력한 뒤 ‘오늘 일정 만들기’를 눌러보세요.</p>
                  </div>
                </div>
              )}
            </div>

            <button className="reschedule-button" onClick={rescheduleTasks}>
              <CalendarDays size={17} />
              못한 일 내일로 옮기기
              <ChevronRight size={17} />
            </button>
          </article>
          )}

          {workspaceView === "report" && (
          <article className="panel achievement-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">이번 주 목표</p>
                <h2>나의 성취</h2>
              </div>
              <Trophy size={22} className="trophy-icon" />
            </div>
            <div className="stamp-grid">
              <div className={`stamp ${totalFocusMinutes >= 25 ? "earned" : ""}`}>
                <span><Flame size={22} /></span>
                <strong>첫 몰입</strong>
                <small>25분 집중</small>
              </div>
              <div className={`stamp ${completedToday >= 3 ? "earned" : ""}`}>
                <span><Award size={22} /></span>
                <strong>퀘스트 헌터</strong>
                <small>하루 3개 완료</small>
              </div>
              <div className={`stamp ${streak >= 3 ? "earned" : ""}`}>
                <span><Sprout size={22} /></span>
                <strong>꾸준함의 싹</strong>
                <small>3일 연속</small>
              </div>
              <div className={`stamp ${totalFocusMinutes >= 500 ? "earned" : ""}`}>
                <span><Trophy size={22} /></span>
                <strong>집중 마스터</strong>
                <small>누적 500분</small>
              </div>
            </div>
            <div className="next-stamp">
              <Star size={17} />
              <div>
                <span>다음 스탬프까지</span>
                <strong>{Math.max(0, 500 - totalFocusMinutes)}분 남음</strong>
              </div>
              <div className="mini-progress">
                <i style={{ width: `${Math.min(100, (totalFocusMinutes / 500) * 100)}%` }} />
              </div>
            </div>
          </article>
          )}
        </section>
        )}

        {workspaceView === "report" && (
        <section className="panel insight-panel" id="weekly-insight">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">집중 기록</p>
              <h2>이번 주 생산성 리포트</h2>
            </div>
            <button
              className="insight-button"
              onClick={generateInsight}
              disabled={isInsightLoading}
            >
              {isInsightLoading ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <BarChart3 size={17} />
              )}
              기록 분석하기
            </button>
          </div>

          <div className="insight-layout">
            <div className="weekly-chart">
              <div className="chart-grid-lines">
                <span />
                <span />
                <span />
                <span />
              </div>
              {weeklyData.map((day) => (
                <div className="bar-column" key={day.key}>
                  <span className="bar-value">{day.score}</span>
                  <div className="bar-track">
                    <i style={{ height: `${Math.max(4, day.score)}%` }} />
                  </div>
                  <strong>{day.label}</strong>
                </div>
              ))}
            </div>

            <div className="insight-card">
              <span className="insight-icon">
                <BrainCircuit size={24} />
              </span>
              {insight ? (
                <>
                  <p className="eyebrow">분석 결과</p>
                  <h3>{insight.headline}</h3>
                  <p>{insight.summary}</p>
                  <div className="recommendation">
                    <CheckCircle2 size={16} />
                    {insight.recommendation}
                  </div>
                </>
              ) : (
                <>
                  <p className="eyebrow">아직 분석 전</p>
                  <h3>나만의 집중 패턴을 발견해요</h3>
                  <p>
                    완료 시간과 집중 기록을 바탕으로 가장 생산적인 시간대와
                    다음 행동을 알려드려요.
                  </p>
                  <button onClick={generateInsight}>지금 분석하기</button>
                </>
              )}
            </div>
          </div>
        </section>
        )}
      </main>

      {toast && (
        <div className="toast">
          <MessageCircleMore size={18} />
          {toast}
        </div>
      )}

      {isFocusMode && (
        <div className="focus-overlay">
          <button className="focus-close" onClick={exitFocusMode}>
            <X size={22} />
          </button>
          <div className="focus-orb">
            <Focus size={28} />
          </div>
          <span>{mode === "focus" ? "DEEP FOCUS" : "MINDFUL BREAK"}</span>
          <h2>{formatTimer(secondsLeft)}</h2>
          <p>{selectedTask?.title || "지금 이 순간에만 집중하세요"}</p>
          <div className="focus-overlay-controls">
            <button onClick={toggleNoise}>
              {whiteNoise ? <Volume2 size={21} /> : <Music2 size={21} />}
              {whiteNoise ? "백색 소음 끄기" : "백색 소음 켜기"}
            </button>
            <button className="overlay-play" onClick={toggleTimer}>
              {isRunning ? <Pause size={30} /> : <Play size={30} fill="currentColor" />}
            </button>
            <button onClick={resetTimer}>
              <RotateCcw size={21} />
              초기화
            </button>
          </div>
          <small>다른 탭으로 이동하면 조수리가 바로 알려드려요.</small>
        </div>
      )}
    </div>
  );
}

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("focusmate-auth-token") || "",
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [view, setView] = useState<"landing" | "login" | "register">(() => {
    if (window.location.pathname === "/login") return "login";
    if (window.location.pathname === "/register") return "register";
    return "landing";
  });
  const [checkingAuth, setCheckingAuth] = useState(Boolean(token));

  const navigate = useCallback(
    (nextView: "landing" | "login" | "register", replace = false) => {
      const pathname =
        nextView === "landing" ? "/" : nextView === "login" ? "/login" : "/register";
      window.history[replace ? "replaceState" : "pushState"]({}, "", pathname);
      setView(nextView);
    },
    [],
  );

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === "/login") setView("login");
      else if (window.location.pathname === "/register") setView("register");
      else setView("landing");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!token) {
      setCheckingAuth(false);
      if (window.location.pathname === "/dashboard") {
        navigate("login", true);
      }
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setUser(data.user);
        if (window.location.pathname !== "/dashboard") {
          window.history.replaceState({}, "", "/dashboard");
        }
      })
      .catch(() => {
        localStorage.removeItem("focusmate-auth-token");
        setToken("");
        setUser(null);
        if (window.location.pathname === "/dashboard") {
          navigate("login", true);
        }
      })
      .finally(() => setCheckingAuth(false));
  }, [navigate, token]);

  const completeAuth = ({ user: authenticatedUser, token: nextToken }: AuthResult) => {
    localStorage.setItem("focusmate-auth-token", nextToken);
    window.history.replaceState({}, "", "/dashboard");
    setToken(nextToken);
    setUser(authenticatedUser);
    setCheckingAuth(false);
  };

  const logout = () => {
    localStorage.removeItem("focusmate-auth-token");
    setToken("");
    setUser(null);
    navigate("landing", true);
  };

  if (checkingAuth) {
    return (
      <div className="auth-loading">
        <span><BrainCircuit size={28} /></span>
        <strong>FocusMate</strong>
        <LoaderCircle className="spin" size={21} />
      </div>
    );
  }

  if (user && token) {
    return <Dashboard user={user} token={token} onLogout={logout} />;
  }

  if (view === "login" || view === "register") {
    return (
      <AuthPage
        key={view}
        mode={view}
        onBack={() => navigate("landing")}
        onSwitch={() => navigate(view === "login" ? "register" : "login")}
        onSuccess={completeAuth}
      />
    );
  }

  return (
    <LandingPage
      onLogin={() => navigate("login")}
      onRegister={() => navigate("register")}
    />
  );
}

export default App;
