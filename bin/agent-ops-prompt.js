#!/usr/bin/env node

const templates = {
  incident: {
    label: "장애 대응",
    goal: "장애 원인을 증거 기반으로 좁히고, 사용자 영향과 복구 경로를 분리해서 정리해줘.",
    steps: [
      "먼저 현재 재현 경로와 최근 변경 내역을 확인해줘.",
      "프론트엔드, API, 데이터베이스, 외부 서비스 중 어느 구간에서 실패하는지 분리해줘.",
      "추측은 [가정]으로 표시하고, 확인된 사실만 결론으로 써줘.",
      "수정이 필요하면 가장 작은 변경으로 고치고 검증 명령을 실행해줘."
    ]
  },
  deploy: {
    label: "배포 검증",
    goal: "배포 전후 상태를 비교하고, 실제 사용자 경로가 정상인지 확인해줘.",
    steps: [
      "로컬 변경 파일과 배포 대상 브랜치를 확인해줘.",
      "빌드, 타입 검사, 핵심 테스트를 실행해줘.",
      "배포 후 health endpoint와 주요 화면/API를 직접 확인해줘.",
      "실패하면 원인, 영향 범위, 롤백 또는 재배포 선택지를 짧게 정리해줘."
    ]
  },
  review: {
    label: "코드 리뷰",
    goal: "버그, 회귀 위험, 빠진 테스트를 우선순위대로 찾아줘.",
    steps: [
      "변경 의도와 실제 diff가 맞는지 먼저 확인해줘.",
      "데이터 계약, 권한, 상태 전이, 에러 처리, 동시성 위험을 봐줘.",
      "문제는 파일/라인 근거와 함께 심각도순으로 써줘.",
      "문제가 없으면 남은 테스트 공백과 잔여 위험만 짧게 알려줘."
    ]
  },
  data: {
    label: "데이터 수정",
    goal: "운영 데이터 변경 전 읽기 전용 증거를 먼저 만들고, 최소 변경 후 감사 흔적을 남겨줘.",
    steps: [
      "대상 레코드를 고유 식별자로 확인하고, 변경 전 값을 기록해줘.",
      "금액, 권한, 상태값처럼 위험한 필드는 계산 출처를 분리해서 검증해줘.",
      "변경은 하나의 명확한 쿼리나 마이그레이션으로 제한해줘.",
      "변경 후 재조회와 감사 로그 확인까지 끝내줘."
    ]
  },
  handoff: {
    label: "작업 인수인계",
    goal: "다음 사람이 바로 이어갈 수 있게 현재 상태, 완료 증거, 남은 리스크를 정리해줘.",
    steps: [
      "완료한 변경과 건드리지 않은 범위를 분리해줘.",
      "실행한 명령과 결과를 핵심만 남겨줘.",
      "아직 결정되지 않은 질문과 기본 선택지를 적어줘.",
      "다음 행동을 순서대로 정리하되, 완료로 오해될 표현은 피해주세요."
    ]
  }
};

function printHelp() {
  console.log(`Agent Ops Prompt Generator

Usage:
  agent-ops-prompt <scenario> [options]

Scenarios:
  incident   장애 대응
  deploy     배포 검증
  review     코드 리뷰
  data       데이터 수정
  handoff    작업 인수인계

Options:
  --target <text>       저장소/서비스 이름
  --risk <low|mid|high> 위험도
  --context <text>      현재 상황
  --constraints <text>  제약/주의사항
  --buy                 유료 템플릿팩 구매 요청 링크 출력
  --help                도움말 출력

Example:
  agent-ops-prompt incident --target admin-api --risk high --context "500 errors after deploy"
`);
}

function readOption(args, name, fallback) {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) return fallback;
  return value;
}

function riskLabel(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "low" || normalized === "낮음") return "낮음";
  if (normalized === "mid" || normalized === "medium" || normalized === "중간") return "중간";
  return "높음";
}

function buildPrompt(template, args) {
  const target = readOption(args, "--target", "아직 지정하지 않음");
  const risk = riskLabel(readOption(args, "--risk", "high"));
  const context = readOption(args, "--context", "현재 상황을 먼저 파악해줘.");
  const constraints = readOption(args, "--constraints", "비밀값을 출력하지 말고, 기존 사용자 변경분은 보존해줘.");

  return `목표: ${template.label} 작업을 도와줘.

대상: ${target}
위험도: ${risk}

현재 상황:
${context}

제약/주의사항:
${constraints}

해야 할 일:
${template.goal}

진행 방식:
${template.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}

응답 형식:
- 확인한 증거
- 판단
- 실행한 변경 또는 제안
- 검증 결과
- 남은 리스크`;
}

const args = process.argv.slice(2);

if (args.includes("--help") || args.length === 0) {
  printHelp();
  process.exit(0);
}

if (args.includes("--buy")) {
  console.log("https://github.com/mysubb01/agent-ops-command-pack-teaser/issues/new?template=purchase-interest.yml");
  process.exit(0);
}

const scenario = args.find(arg => !arg.startsWith("--"));
const template = templates[scenario];

if (!template) {
  console.error(`Unknown scenario: ${scenario}`);
  console.error(`Valid scenarios: ${Object.keys(templates).join(", ")}`);
  process.exit(1);
}

console.log(buildPrompt(template, args));
