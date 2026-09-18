/**
 * 보험사 팩스번호·금액 한도 A4 2장 PDF 를 만든다. **내부용이다.**
 *
 * ★ 사이트에 올리지 않는다 (2026-09-18 사장님 지시: "그러면 안들어오니까
 *   pdf는 우리만쓸래"). 내려받게 두면 사람들이 사이트에 다시 안 온다.
 *   그래서 결과물은 git 무시 폴더인 _시안_확인용/ 에만 둔다.
 *   이 스크립트도 scripts/ 라 prepare-public.js 가 public/ 로 복사하지 않는다.
 *
 * 화면용 페이지를 그대로 인쇄하면 헤더·버튼·유도 블록이 다 딸려 나온다.
 * 그래서 인쇄용 HTML 을 따로 만들어 Chromium 으로 PDF 를 뽑는다.
 * 데이터는 links.json 과 lib/fax-limits.ts 를 직접 읽는다 (사이트와 같은 원본).
 * 팩스번호나 한도를 고친 뒤 links.json 의 faxUpdated 를 올리고 다시 돌리면 된다.
 *
 * 쓰는 법:  node scripts/make-fax-pdf.js
 * 필요한 것: playwright-core + 캐시된 Chromium
 *   ($LOCALAPPDATA\ms-playwright\chromium-1217). 없으면 아래 EXE 경로를 고친다.
 */
const fs = require("fs");
const path = require("path");

/**
 * playwright-core 는 이 프로젝트의 의존성이 아니다.
 * 내부용 스크립트 하나 때문에 배포 빌드에 10MB 를 얹을 이유가 없다.
 * 설치돼 있으면 쓰고, 없으면 설치 방법을 알려주고 끝낸다.
 */
function loadChromium() {
  try {
    return require("playwright-core").chromium;
  } catch {
    console.error(
      [
        "playwright-core 가 없습니다. 아무 폴더에나 받아서 쓰면 됩니다.",
        "",
        "  mkdir -p /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright-core",
        "  NODE_PATH=/tmp/pw/node_modules node scripts/make-fax-pdf.js",
        "",
        "브라우저는 이미 받아둔 Chromium 을 씁니다 (LOCALAPPDATA/ms-playwright).",
      ].join(String.fromCharCode(10)),
    );
    process.exit(1);
  }
}
const chromium = loadChromium();

const ROOT = path.join(__dirname, "..");
/** 받아둔 Chromium 을 찾는다. 버전 폴더명이 바뀌어도 돌아가게 훑는다 */
function findChromium() {
  const base = path.join(process.env.LOCALAPPDATA || "", "ms-playwright");
  if (!fs.existsSync(base)) return null;
  const dirs = fs
    .readdirSync(base)
    .filter((d) => d.startsWith("chromium-"))
    .sort()
    .reverse();
  for (const d of dirs) {
    const exe = path.join(base, d, "chrome-win64", "chrome.exe");
    if (fs.existsSync(exe)) return exe;
  }
  return null;
}
const EXE = findChromium();
if (!EXE) {
  console.error("Chromium 을 못 찾았습니다. npx playwright install chromium 으로 받으세요.");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "links.json"), "utf8"));

// fax-limits.ts 에서 값만 뽑는다 (TS 를 실행하지 않고 파싱)
const limitsSrc = fs.readFileSync(path.join(ROOT, "lib", "fax-limits.ts"), "utf8");
const body = limitsSrc.slice(limitsSrc.indexOf("export const FAX_LIMITS"));
const LIMITS = {};
for (const m of body.matchAll(/^\s*"?([^":\n/]+?)"?:\s*"([^"]+)"/gm)) {
  LIMITS[m[1].trim()] = m[2];
}

const esc = (s) =>
  String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const isNum = (f) => /^[0-9]/.test((f || "").trim());
const splitFax = (f) =>
  (f || "")
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((p) => {
      const m = p.match(/^([\d-]+)\(([^)]+)\)$/);
      return m ? { num: m[1].trim(), label: m[2].trim() } : { num: p, label: "" };
    });

const carriers = data.carriers;
const withFax = carriers.filter((c) => isNum(c.links?.fax));
const without = carriers.filter((c) => c.links?.fax && !isNum(c.links.fax));
const faxDate = (data.faxUpdated || "").replace(/-/g, ".");

const row = (c) => {
  const parts = splitFax(c.links.fax);
  const nums = parts
    .map((p) => `<b>${esc(p.num)}</b>${p.label ? `<i>${esc(p.label)}</i>` : ""}`)
    .join("<br>");
  const lim = LIMITS[c.name];
  return `<tr>
    <td class="nm">${esc(c.name)}</td>
    <td class="fx">${nums}</td>
    <td class="lm${lim ? "" : " none"}">${esc(lim || "확인 안 됨")}</td>
    <td class="cs">${esc(c.links.cs || "—")}</td>
  </tr>`;
};

// 번호가 없어도 한도가 있는 곳이 있다 (우체국보험 = 콜센터 발급 + 100만원 이하)
const rowNo = (c) => {
  const lim = LIMITS[c.name];
  return `<tr>
    <td class="nm">${esc(c.name)}</td>
    <td class="fx no">${esc(c.links.fax)}</td>
    <td class="lm${lim ? "" : " none"}">${esc(lim || "—")}</td>
    <td class="cs">${esc(c.links.cs || "—")}</td>
  </tr>`;
};

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>보험사 보험금청구 팩스번호·금액 한도</title>
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm 10mm 14mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0; font-family: "Pretendard Variable", Pretendard, -apple-system, sans-serif;
    color: #1c1917; font-weight: 450; letter-spacing: 0.01em; -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  header { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px;
    padding-bottom: 8px; border-bottom: 3px solid #e0342a; margin-bottom: 4px; }
  h1 { margin: 0; font-size: 19px; font-weight: 900; letter-spacing: -0.01em; }
  .sub { margin: 3px 0 0; font-size: 10.5px; color: #57534e; }
  .brand { text-align: right; font-size: 10px; color: #78716c; line-height: 1.5; white-space: nowrap; }
  .brand b { display: block; font-size: 12px; color: #1c1917; font-weight: 900; }
  .stamp { margin: 9px 0 10px; padding: 7px 11px; background: #fff7ec;
    border-left: 3px solid #f09018; border-radius: 0 7px 7px 0; font-size: 11px; color: #57534e; }
  .stamp b { font-size: 12.5px; color: #1c1917; font-weight: 900;
    border-bottom: 2px solid #f09018; padding-bottom: 1px; }
  h2 { margin: 13px 0 5px; font-size: 13px; font-weight: 900; display: flex; align-items: baseline; gap: 7px;
    break-after: avoid; page-break-after: avoid; }
  section { break-inside: auto; }
  /* 「팩스번호가 따로 없는 보험사」 는 제목만 1페이지 끝에 걸리던 것을 통째로 넘긴다 */
  section.next-page { break-before: page; page-break-before: always; }
  thead { display: table-header-group; }
  h2 span { font-size: 10.5px; font-weight: 700; color: #f09018; }
  table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
  thead th { background: #f5f5f4; border-top: 1.5px solid #1c1917; border-bottom: 1px solid #d6d3d1;
    padding: 6px 7px; text-align: left; font-size: 10px; font-weight: 800; color: #44403c; }
  td { border-bottom: 1px solid #ebe9e7; padding: 5px 7px; vertical-align: top; line-height: 1.45; }
  tr { break-inside: avoid; }
  .nm { font-weight: 800; width: 21%; }
  .fx { width: 27%; }
  .fx b { font-weight: 800; font-variant-numeric: tabular-nums; }
  .fx i { font-style: normal; font-size: 9px; color: #78716c; margin-left: 4px; }
  .fx.no { font-weight: 600; color: #78716c; }
  .lm { width: 34%; font-weight: 700; color: #b45309; }
  .lm.none { font-weight: 500; color: #a8a29e; }
  .cs { width: 18%; color: #57534e; font-variant-numeric: tabular-nums; }
  .note { margin: 0 0 7px; font-size: 10px; color: #78716c; line-height: 1.6; }
  footer { margin-top: 12px; padding-top: 7px; border-top: 1px solid #e7e5e4;
    font-size: 9.5px; color: #78716c; line-height: 1.6; }
  footer b { color: #44403c; }
</style></head><body>
<header>
  <div>
    <h1>보험사 보험금청구 팩스번호 · 금액 한도</h1>
    <p class="sub">개인 장기보험 질병·상해 청구 기준 · 보험사 ${carriers.length}곳</p>
  </div>
  <div class="brand"><b>청구닷컴</b>프라임에셋 어메이징사업부<br>www.청구.com</div>
</header>

<p class="stamp"><b>${faxDate} 확인</b> &nbsp;각 사 콜센터와 공식 안내에서 직접 확인한 값입니다. 팩스번호는 예고 없이 바뀌니 보내신 뒤 고객센터로 접수 여부를 확인하세요.</p>

<section>
  <h2>팩스번호가 있는 보험사 <span>${withFax.length}곳</span></h2>
  <table>
    <thead><tr><th>보험사</th><th>보험금청구 팩스</th><th>금액 한도</th><th>고객센터</th></tr></thead>
    <tbody>${withFax.map(row).join("")}</tbody>
  </table>
</section>

<section class="next-page">
  <h2 style="margin-top:0">팩스번호가 따로 없는 보험사 <span>${without.length}곳</span></h2>
  <p class="note">아래 보험사는 고정된 팩스번호를 공개하지 않습니다. 고객센터로 전화해 접수 방법을 안내받으시거나, 본인 확인 후 발급되는 가상 팩스번호로 보내시면 됩니다.</p>
  <table>
    <thead><tr><th>보험사</th><th>접수 방법</th><th>금액 한도</th><th>고객센터</th></tr></thead>
    <tbody>${without.map(rowNo).join("")}</tbody>
  </table>
</section>

<footer>
  <b>금액 한도는 팩스 접수 기준입니다.</b> 온라인·모바일 한도와 다릅니다. 상한을 넘는 청구는 원본 서류를 등기우편이나 방문으로 제출하셔야 합니다.<br>
  보장 여부와 필요 서류는 가입하신 상품의 약관에 따라 다릅니다. 정확한 내용은 해당 보험사 또는 담당 설계사에게 확인하세요.<br>
  최신 정보는 <b>www.청구.com/guide/보험금청구-팩스번호</b> 에서 확인하실 수 있습니다.
</footer>
</body></html>`;

(async () => {
  const tmp = path.join(ROOT, "_시안_확인용", "_fax-print.html");
  fs.writeFileSync(tmp, html, "utf8");
  const b = await chromium.launch({ executablePath: EXE, headless: true });
  const p = await b.newPage();
  await p.goto("file:///" + tmp.replace(/\\/g, "/"), { waitUntil: "networkidle" });
  await p.waitForTimeout(2500); // 웹폰트
  const out = path.join(ROOT, "_시안_확인용", `보험사_팩스번호_금액한도_${faxDate.replace(/\./g, "")}.pdf`);
  await p.pdf({
    path: out,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate:
      '<div style="width:100%;font-size:8px;color:#a8a29e;padding:0 10mm;text-align:right;font-family:sans-serif;">청구닷컴 · www.xn--2e0br60d.com &nbsp; <span class="pageNumber"></span>/<span class="totalPages"></span></div>',
    margin: { top: "12mm", bottom: "14mm", left: "10mm", right: "10mm" },
  });
  await b.close();
  console.log("saved:", out);
  console.log("크기:", (fs.statSync(out).size / 1024).toFixed(0) + "KB");
  console.log(`팩스번호 있는 곳 ${withFax.length} / 없는 곳 ${without.length} / 한도 등재 ${Object.keys(LIMITS).length}`);
})();
