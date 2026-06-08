import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 8787);
const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
const jwtSecret =
  process.env.JWT_SECRET || "focusmate-local-development-secret-change-me";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const usersPath = path.resolve(__dirname, "../data/users.json");

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const readUsers = async () => {
  try {
    return JSON.parse(await fs.readFile(usersPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await fs.mkdir(path.dirname(usersPath), { recursive: true });
    await fs.writeFile(usersPath, "[]");
    return [];
  }
};

const writeUsers = async (users) => {
  await fs.mkdir(path.dirname(usersPath), { recursive: true });
  await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
};

const publicUser = ({ passwordHash: _passwordHash, ...user }) => user;

const createToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: "7d" },
  );

const requireAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    return res.status(401).json({ message: "로그인이 만료되었습니다." });
  }
};

const planSchema = {
  type: "object",
  properties: {
    blocks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          taskId: { type: "string" },
          start: { type: "string" },
          end: { type: "string" },
          note: { type: "string" },
        },
        required: ["taskId", "start", "end", "note"],
        additionalProperties: false,
      },
    },
    coachMessage: { type: "string" },
  },
  required: ["blocks", "coachMessage"],
  additionalProperties: false,
};

const insightSchema = {
  type: "object",
  properties: {
    headline: { type: "string" },
    summary: { type: "string" },
    recommendation: { type: "string" },
  },
  required: ["headline", "summary", "recommendation"],
  additionalProperties: false,
};

const getText = (message) =>
  message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const normalized = Math.max(0, Math.min(23 * 60 + 59, minutes));
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(
    normalized % 60,
  ).padStart(2, "0")}`;
};

const fallbackPlan = (tasks, dayStart = "09:00", dayEnd = "22:00") => {
  let cursor = Math.max(timeToMinutes(dayStart), new Date().getHours() * 60);
  const end = timeToMinutes(dayEnd);
  const ordered = [...tasks].sort((a, b) => {
    const weight = { high: 3, medium: 2, low: 1 };
    return weight[b.priority] - weight[a.priority];
  });

  const blocks = ordered
    .map((task) => {
      const start = cursor;
      const taskEnd = Math.min(cursor + task.minutes, end);
      cursor = taskEnd + 10;
      return {
        taskId: task.id,
        start: minutesToTime(start),
        end: minutesToTime(taskEnd),
        note:
          task.priority === "high"
            ? "집중력이 남아 있을 때 먼저 끝내기"
            : "앞 작업 뒤 10분 쉬고 시작하기",
      };
    })
    .filter((block) => timeToMinutes(block.end) > timeToMinutes(block.start));

  return {
    blocks,
    coachMessage:
      "API 키가 없어 우선순위와 예상 시간을 기준으로 로컬 배치했어요. 첫 블록부터 가볍게 시작해봅시다.",
  };
};

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    aiEnabled: Boolean(anthropic),
    provider: "anthropic",
    model,
  });
});

app.post("/api/auth/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (name.length < 2) {
    return res.status(400).json({ message: "이름을 2자 이상 입력해주세요." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "올바른 이메일을 입력해주세요." });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "비밀번호는 8자 이상이어야 합니다." });
  }

  const users = await readUsers();
  if (users.some((user) => user.email === email)) {
    return res.status(409).json({ message: "이미 가입된 이메일입니다." });
  }

  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "student",
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeUsers(users);

  res.status(201).json({ user: publicUser(user), token: createToken(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const users = await readUsers();
  const user = users.find((item) => item.email === email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res
      .status(401)
      .json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }

  res.json({ user: publicUser(user), token: createToken(user) });
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  const users = await readUsers();
  const user = users.find((item) => item.id === req.user.sub);
  if (!user) {
    return res.status(401).json({ message: "사용자를 찾을 수 없습니다." });
  }
  res.json({ user: publicUser(user) });
});

app.post("/api/plan", requireAuth, async (req, res) => {
  const { tasks = [], dayStart = "09:00", dayEnd = "22:00" } = req.body;

  if (!tasks.length) {
    return res.status(400).json({ message: "배치할 할 일이 없습니다." });
  }

  if (!anthropic) {
    return res.json({ ...fallbackPlan(tasks, dayStart, dayEnd), ai: false });
  }

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1600,
      system:
        "너는 학생의 하루를 현실적으로 설계하는 한국어 생산성 코치다. 우선순위가 높은 작업과 어려운 작업을 먼저 두고, 작업 사이에는 5~15분의 여유를 둔다. 주어진 시간 범위를 넘기지 말고 모든 taskId는 입력값을 그대로 사용한다.",
      messages: [
        {
          role: "user",
          content: JSON.stringify({ tasks, dayStart, dayEnd }),
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: planSchema,
        },
      },
    });

    res.json({ ...JSON.parse(getText(response)), ai: true });
  } catch (error) {
    console.error("AI plan failed:", error);
    res.json({
      ...fallbackPlan(tasks, dayStart, dayEnd),
      ai: false,
      warning: "AI 호출에 실패해 로컬 알고리즘으로 배치했습니다.",
    });
  }
});

app.post("/api/coach", requireAuth, async (req, res) => {
  const { message, taskTitle, timerState, recentMessages = [] } = req.body;

  if (!anthropic) {
    const response = timerState === "paused"
      ? "어이쿠, 또 멈췄네? 완벽하게 하려 하지 말고 딱 5분만 다시 해봐. 시작 버튼은 도망 안 간다!"
      : `"${taskTitle || "지금 할 일"}"부터 5분만 해보자. 시작이 반이다—나머지 반은 타이머가 끌고 갈게.`;
    return res.json({ message: response, ai: false });
  }

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 350,
      system:
        "너는 이름이 '조수리'인 한국어 집중 코치다. 사용자가 미루거나 타이머를 멈추면 장난스럽고 살짝 뼈 때리지만 모욕하거나 공격하지 않는다. 답변은 2~3문장으로 짧게 하고, 지금 바로 할 수 있는 아주 작은 행동을 하나 제안한다.",
      messages: [
        {
          role: "user",
          content: `최근 대화: ${JSON.stringify(
            recentMessages.slice(-6),
          )}\n현재 작업: ${taskTitle || "미정"}\n타이머 상태: ${timerState}\n사용자 말: ${message}`,
        },
      ],
    });

    res.json({ message: getText(response), ai: true });
  } catch (error) {
    console.error("AI coach failed:", error);
    res.json({
      message:
        "잠깐, AI 연결이 졸고 있네. 그래도 우리는 안 졸지—지금 5분 타이머부터 다시 켜자.",
      ai: false,
    });
  }
});

app.post("/api/insight", requireAuth, async (req, res) => {
  const { sessions = [], completedTasks = [] } = req.body;

  if (!anthropic) {
    const byHour = sessions.reduce((acc, session) => {
      const hour = new Date(session.completedAt).getHours();
      acc[hour] = (acc[hour] || 0) + session.minutes;
      return acc;
    }, {});
    const bestHour = Object.entries(byHour).sort((a, b) => b[1] - a[1])[0]?.[0];
    return res.json({
      headline: bestHour ? `${bestHour}시 집중력이 가장 높아요` : "첫 집중 기록을 만들어보세요",
      summary: `이번 주 ${completedTasks.length}개 작업을 완료하고 ${sessions.reduce(
        (sum, session) => sum + session.minutes,
        0,
      )}분 집중했어요.`,
      recommendation: bestHour
        ? `${bestHour}시 전후에 가장 어려운 작업을 배치해보세요.`
        : "오늘 25분 집중 한 번을 완료하면 패턴 분석이 시작돼요.",
      ai: false,
    });
  }

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 900,
      system:
        "너는 학생의 일주일 생산성 데이터를 분석하는 한국어 코치다. 과장하지 말고 데이터에서 확인 가능한 패턴만 말한다. 응원하는 말투로 핵심 인사이트와 다음 주 행동 하나를 제안한다.",
      messages: [
        {
          role: "user",
          content: JSON.stringify({ sessions, completedTasks }),
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: insightSchema,
        },
      },
    });

    res.json({ ...JSON.parse(getText(response)), ai: true });
  } catch (error) {
    console.error("AI insight failed:", error);
    res.status(500).json({ message: "인사이트 생성에 실패했습니다." });
  }
});

const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(
    `FocusMate server running on http://localhost:${port} (${anthropic ? model : "local fallback"})`,
  );
});
