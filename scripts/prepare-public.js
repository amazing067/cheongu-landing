#!/usr/bin/env node
/**
 * 루트의 원본 폴더를 public/ 으로 복사한다.
 * public/ 안의 assets·data·tools·icons 는 전부 여기서 만들어지는 생성물이라
 * git 추적에서 빼두었다. 직접 고치면 다음 빌드에 덮여 사라진다.
 *
 * 함께 하는 일: 빌드 버전을 만들어 새겨 넣는다.
 * 카카오톡·네이버 인앱 브라우저는 Cache-Control 을 제대로 지키지 않아
 * 배포해도 옛 화면을 계속 보여준다. 페이지가 스스로 낡은 걸 알아채려면
 * 「내가 만들어진 버전」과 「서버의 최신 버전」을 견줄 수 있어야 한다.
 *   - public/data/version.json  → 서버의 최신 버전 (캐시 무시하고 받아감)
 *   - 각 페이지에 새겨진 값      → 그 페이지가 만들어진 버전
 * 둘이 다르면 낡은 화면이다. assets/fresh.js 가 한 번만 새로고침한다.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const dirs = ["assets", "data", "tools", "icons"];
const files = ["manifest.webmanifest", "CNAME"];

if (!fs.existsSync(PUBLIC)) fs.mkdirSync(PUBLIC, { recursive: true });

dirs.forEach((d) => {
  const src = path.join(ROOT, d);
  const dest = path.join(PUBLIC, d);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log("Copied:", d);
  }
});

files.forEach((f) => {
  const src = path.join(ROOT, f);
  const dest = path.join(PUBLIC, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log("Copied:", f);
  }
});

// ── 빌드 버전 ──────────────────────────────────────────────
// Vercel 이면 커밋 해시, 아니면 만든 시각. 배포마다 반드시 달라져야 한다.
const sha = process.env.VERCEL_GIT_COMMIT_SHA;
const V = sha
  ? sha.slice(0, 8)
  : new Date()
      .toISOString()
      .replace(/[-:T]/g, "")
      .slice(0, 14);

// 서버의 최신 버전. Next 도 빌드 때 이 파일을 읽어 페이지에 새긴다.
const versionJson = JSON.stringify({ v: V }) + "\n";
fs.writeFileSync(path.join(ROOT, "data", "version.json"), versionJson);
fs.writeFileSync(path.join(PUBLIC, "data", "version.json"), versionJson);

// 정적 도구 페이지에는 자리표시자를 실제 값으로 바꿔 넣는다.
// 토큰은 %%BUILD_V%% 다. 변수명(window.__BUILD_V__)과 겹치는 이름을 쓰면
// 변수명까지 치환돼 window.20260918... 같은 코드가 만들어진다 (실제로 겪었다).
// 버전이 HTML 안에 있어야 한다 — 따로 있는 파일에 두면 그 파일만 따로
// 캐시돼 「낡은 페이지 + 최신 버전」 같은 엉뚱한 조합이 나온다.
const toolsDir = path.join(PUBLIC, "tools");
let stamped = 0;
if (fs.existsSync(toolsDir)) {
  for (const f of fs.readdirSync(toolsDir)) {
    if (!f.endsWith(".html")) continue;
    const p = path.join(toolsDir, f);
    const before = fs.readFileSync(p, "utf8");
    if (!before.includes("%%BUILD_V%%")) continue;
    fs.writeFileSync(p, before.split("%%BUILD_V%%").join(V));
    stamped++;
  }
}
console.log(`Build version: ${V} (도구 페이지 ${stamped}개에 새김)`);
