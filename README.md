# FocusMate AI

AI가 하루의 할 일을 시간대별로 배치하고, 25분 집중과 5분 휴식을 코칭하는 학교 프로젝트입니다.

## 핵심 기능

- 공개 랜딩 페이지와 회원가입·로그인
- bcrypt 비밀번호 해시 및 JWT 기반 인증
- 로그인한 사용자만 AI와 집중 대시보드 API 접근
- 계정별로 분리되는 할 일과 집중 기록
- 할 일과 예상 소요 시간, 우선순위 입력
- AI 기반 하루 타임블로킹
- 25분 집중 / 5분 휴식 뽀모도로 타이머
- 타이머 실행 중 다른 탭 이동 감지 및 알림
- 타이머 중단 시 장난스럽게 동기를 주는 AI 코치 `조수리`
- 전체화면 방해 금지 모드와 브라우저 생성 백색 소음
- 미완료 작업을 다음 날로 옮기는 Reschedule
- 완료 작업 기반 성취 스탬프
- 집중 기록 기반 주간 생산성 점수와 AI 인사이트
- 브라우저 `localStorage`를 이용한 데이터 유지

## 기술 구성

- Frontend: React 19, TypeScript, Vite
- Backend: Node.js, Express
- AI: Anthropic Claude Messages API, Structured Outputs
- Storage: Browser localStorage
- Auth: bcrypt, JWT, JSON user store

## 웹사이트 구조

- `/`: 서비스 소개 랜딩 페이지
- `/register`: 회원가입
- `/login`: 로그인
- `/dashboard`: 인증 사용자 전용 집중 대시보드

## 실행 방법

```bash
npm install
cp .env.example .env
npm run dev
```

브라우저에서 `http://localhost:5173`을 엽니다.

## Claude API 설정

`.env`에 API 키를 입력하면 실제 AI 일정 배치, 코칭, 주간 분석이 활성화됩니다.

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-sonnet-4-6
JWT_SECRET=replace_with_a_long_random_secret
PORT=8787
```

Anthropic Console에서 발급한 전용 API 키를 사용합니다. Claude Code 또는 Claude 앱의 로그인 토큰을 복사해서 사용하지 않습니다.

API 키가 없어도 우선순위 기반 일정 배치, 규칙 기반 코칭, 로컬 통계 분석으로 모든 화면을 시연할 수 있습니다. API 키는 프런트엔드에 노출하지 않고 Express 서버에서만 사용합니다.

학교 프로젝트용 기본 구현에서는 가입 정보를 `data/users.json`에 저장합니다. 실제 서비스로 배포할 때는 PostgreSQL 같은 데이터베이스와 HTTPS, 로그인 시도 제한을 추가하는 것을 권장합니다.

## 빌드

```bash
npm run build
npm start
```

프로덕션 서버는 기본적으로 `http://localhost:8787`에서 실행됩니다.

## 홈서버 Docker 배포

서버의 `/home/ubuntu/git/focus_mate`에서 실행합니다.

```bash
cp .env.example .env
chmod 600 .env
docker compose up -d --build
docker compose ps
```

새 커밋을 반영할 때는 다음 스크립트를 사용합니다.

```bash
./ops/deploy.sh
```

컨테이너는 서버의 `127.0.0.1:8787`에만 노출되며, 외부 공개 시에는 Cloudflare Tunnel 또는 리버스 프록시를 연결합니다. 가입 사용자 데이터는 Docker 볼륨 `focus_mate_data`에 저장됩니다.

## AI 활용 설명

1. 사용자의 작업명, 예상 시간, 우선순위를 모델에 전달합니다.
2. 모델이 JSON Schema에 맞춰 작업별 시작·종료 시간과 배치 이유를 생성합니다.
3. 타이머 상태와 현재 작업을 바탕으로 짧은 집중 코칭 메시지를 생성합니다.
4. 일주일간의 집중 세션과 완료 기록을 분석해 패턴과 다음 행동을 제안합니다.
5. Claude Structured Outputs로 일정과 분석 결과가 지정한 JSON 구조를 따르도록 합니다.

## 발표 포인트

- 단순 챗봇이 아니라 AI 결과를 실제 시간표 UI와 연결했습니다.
- AI 호출 실패나 API 키 부재 상황에도 서비스가 동작하는 폴백 구조를 구현했습니다.
- 민감한 API 키를 브라우저에 저장하지 않는 서버 프록시 구조를 사용했습니다.
- 알림, 탭 감지, 전체화면, Web Audio 등 웹 API를 생산성 경험에 활용했습니다.
