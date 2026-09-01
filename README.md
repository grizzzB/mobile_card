# 모바일 청첩장 — 이도명 ♥ 변현진

2026년 11월 21일 토요일 오후 12시 · 세곡동 성당 대성전 3층

인쇄 청첩장(코발트블루 별색 레터프레스) 시안을 그대로 옮긴 한 장짜리 정적 페이지입니다.
GitHub Pages 로 배포되며, 인쇄물의 QR 코드가 이 주소를 가리킵니다.

## 구성

```
index.html              앞면 / 뒷면 마크업
assets/css/style.css    레이아웃 · 타이포 · 새 애니메이션
assets/js/app.js        앞뒤 전환, 나는 새, 계좌번호 복사
assets/img/
  frame.webp / .png     아치 프레임 + 꽃·새 판화 (시안에서 추출, 글자 제거)
  bouquet.webp / .png   작은 부케 장식
  divider.webp / .png   이름 아래 구분 장식
  share.jpg             카카오톡·OG 미리보기 이미지 (1200×630)
  favicon.svg           탭 아이콘
  apple-touch-icon.png  홈 화면 아이콘
```

## 동작

- **앞뒤 전환** — 하단 버튼, 좌우 스와이프, 좌우 방향키. 3D 카드 플립이며
  보이지 않는 면은 `inert` 로 탭 이동·클릭에서 빠집니다.
- **나는 새** — 앞면 하늘에 갈매기 실루엣 8마리. 본문과 겹치지 않도록
  화면 위·아래 띠에만 배치하고, 뒷면에서는 옅어집니다.
- **계좌번호 복사** — `navigator.clipboard` 우선, 실패 시 `execCommand` 대체 경로
  (구형 iOS 대응). 숫자만 복사되어 은행 앱에 바로 붙습니다.
- `prefers-reduced-motion` 을 켠 기기에서는 새와 플립 애니메이션이 멈춥니다.
- JS 가 없으면 앞면·뒷면이 위아래로 펼쳐져 모든 정보를 그대로 읽을 수 있습니다.

## 타이포그래피

시안 이미지(카드 한 변 1176px)에서 각 줄의 잉크 폭과 대문자 높이를 실측해,
`--u`(카드 폭의 1%) 기준으로 `font-size` 와 `letter-spacing` 을 역산했습니다.
`style.css` 의 `.eyebrow` ~ `.venue-2` 주석 참고.

- 세리프: PT Serif 700 (시안의 전환기 세리프에 가장 근접)
- 이름: Pinyon Script (카퍼플레이트 인그레이빙 스크립트)
- 한글: Noto Sans KR

## 로컬에서 보기

```bash
python3 -m http.server 4173
```

`http://localhost:4173` 접속.
