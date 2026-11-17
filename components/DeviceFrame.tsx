/**
 * 앱 화면 캡처를 끼우는 기기 틀. 이미지 파일만 바꿔 끼우면 된다.
 * - PhoneFrame: 폰 화면 캡처(세로). 다이내믹 아일랜드·측면 버튼까지 CSS 로만 그린다.
 * - BrowserFrame: PC 화면 캡처(가로). 상단 바와 주소칸이 있는 창.
 * 이미지는 위쪽을 기준으로 맞춰 잘라 보여 준다(화면 맨 위가 가장 중요하므로).
 */
export function PhoneFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="dv-phone">
      <i className="dv-btn dv-btn-a" aria-hidden />
      <i className="dv-btn dv-btn-b" aria-hidden />
      <i className="dv-btn dv-btn-c" aria-hidden />
      <div className="dv-phone-screen">
        <span className="dv-island" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" />
      </div>
    </div>
  );
}

export function BrowserFrame({ src, alt, url = "bomate" }: { src: string; alt: string; url?: string }) {
  return (
    <div className="dv-browser">
      <div className="dv-bar">
        <span className="dv-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="dv-url">{url}</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" />
    </div>
  );
}
