# Vercel Web Analytics — 최근 7일 (2026-09-10 ~ 09-17)

| 지표 | 값 |
|---|---|
| 방문자 | **2,550** (-12%) |
| 페이지뷰 | **3,758** (-11%) |
| 이탈률 | **80%** (-1%) |

## ★★ 유입원 — 네이버가 압도적이다
| 출처 | 방문자 |
|---|---:|
| **m.search.naver.com** | **1,200** |
| **search.naver.com** | **774** |
| google.com | 146 |
| bing.com | 41 |
| ntp.msn.com | 9 |
| youtube.com | 8 |
| br.nate.com | 4 |

**네이버 합계 ≈ 1,974 vs 구글 146 — 네이버가 구글의 13배다.**
그동안 SEO 정비(llms.txt·구조화데이터·사이트맵)는 구글 기준으로 해왔는데,
실제 손님은 네이버에서 온다.

## 인기 페이지 (방문자)
| 페이지 | 방문자 |
|---|---:|
| / (홈) | 482 |
| /carrier/메리츠화재 | 159 |
| /carrier/DB손해보험 | 140 |
| /carrier/한화손해보험 | 137 |
| /carrier/한화생명 | 134 |
| /carrier/삼성생명 | 132 |
| /carrier/동양생명 | 103 |

> 구글 서치콘솔 상위(한화손해보험·실손변천사)와 순서가 다르다.
> Vercel 은 네이버 유입까지 포함하기 때문. **네이버에서 인기 있는 페이지가 따로 있다.**

## 기기·지역
- 모바일 52% / 데스크톱 47% — **모바일이 근소 우위**
- OS: Windows 47% / Android 45% / iOS 8%
- 한국 99%

## 요금제 제약 (Hobby)
- **커스텀 이벤트 집계 불가** → `TrackedLink` 의 채용 CTA 클릭 측정이 실제로 안 되고 있다
  (코드 주석에 적어둔 우려가 사실로 확인됨)
- Web Analytics Events 16K / 50K 사용 중

## ⚠️ 계정 경고
**Deployment Storage 10.83 GB / 10 GB — 무료 한도 초과.**
"Exceeded free resources" 표시됨. 배포가 막히기 전에 정리하거나 업그레이드 필요.
- Edge Requests 539K / 1M
- Fast Data Transfer 44.67 GB / 100 GB
