import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// nodemailer는 Node 런타임 필요 (Edge 불가)
export const runtime = "nodejs";

function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청" }, { status: 400 });
  }

  // 스팸 허니팟
  if (body._gotcha) return NextResponse.json({ ok: true });

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const email = String(body.email ?? "").trim();
  const career = String(body.career ?? "").trim();
  const motive = String(body.motive ?? "").trim();
  const source = String(body.source ?? "").trim();

  if (!name || !phone) {
    return NextResponse.json({ ok: false, error: "이름과 연락처는 필수입니다." }, { status: 400 });
  }

  // 메일 설정(amazing-biz-server와 동일한 EMAIL_* 재사용)
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    // 설정 없음 → 클라이언트가 카카오 상담으로 폴백
    return NextResponse.json(
      { ok: false, error: "메일 설정이 없어 접수할 수 없습니다.", fallback: true },
      { status: 503 }
    );
  }

  const to = process.env.APPLY_TO || "induo@naver.com";

  const html = `
    <div style="font-family:sans-serif;max-width:560px">
      <h2 style="margin:0 0 12px">[청구닷컴] 설계사 지원서</h2>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        <tr><td style="padding:8px;background:#f5f5f5;width:110px"><b>이름</b></td><td style="padding:8px">${esc(name)}</td></tr>
        <tr><td style="padding:8px;background:#f5f5f5"><b>연락처</b></td><td style="padding:8px">${esc(phone)}</td></tr>
        <tr><td style="padding:8px;background:#f5f5f5"><b>이메일</b></td><td style="padding:8px">${esc(email) || "-"}</td></tr>
        <tr><td style="padding:8px;background:#f5f5f5"><b>경력</b></td><td style="padding:8px">${esc(career) || "-"}</td></tr>
        <tr><td style="padding:8px;background:#f5f5f5"><b>남기실 말</b></td><td style="padding:8px;white-space:pre-wrap">${esc(motive) || "-"}</td></tr>
        <tr><td style="padding:8px;background:#f5f5f5"><b>유입</b></td><td style="padding:8px">${esc(source) || "-"}</td></tr>
      </table>
      <p style="color:#888;font-size:12px;margin-top:14px">청구닷컴 채용 페이지(/join)에서 접수된 지원입니다.</p>
    </div>`;

  try {
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT || "587", 10),
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      tls: { rejectUnauthorized: false },
    });
    await transporter.sendMail({
      from: `"청구닷컴 채용" <${EMAIL_USER}>`,
      to,
      replyTo: email || undefined,
      subject: `[청구닷컴·설계사 지원] ${name}님`,
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[apply] mail error", e);
    return NextResponse.json(
      { ok: false, error: "전송에 실패했습니다.", fallback: true },
      { status: 502 }
    );
  }
}
