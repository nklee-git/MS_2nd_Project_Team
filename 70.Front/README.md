# Fashion AI Agent — 대시보드 프론트엔드 스켈레톤

`20.ARCHITECTURE/26. 대시보드 기술명세 (프론트).md`에 정의된 화면 구조를 코드로
옮긴 시작점입니다. 실제 Dataverse 연동 전까지는 모든 데이터가 `src/data/mockData.js`의
목업입니다. 변경 이력은 앱 안의 "버전 기록" 탭 또는 `src/data/changelog.js` 참고.

## 실행

```bash
npm install
npm run dev        # http://localhost:5173
npm run build       # 프로덕션 빌드 (dist/)
npm run lint        # oxlint
```

## 폴더 구조

```
public/fonts/               # Pretendard OTF 4종 (Regular/Medium/SemiBold/Bold)
src/
  App.jsx                   # 사이드바 + 탭별 페이지 라우팅(로컬 state)
  data/
    mockData.js              # 목업 데이터 — 필드명은 기능명세서와 1:1로 맞춰둠
    changelog.js              # 버전 기록 데이터
  utils/format.js            # 상대시간·숫자 포맷 유틸
  components/
    layout/Sidebar.jsx       # 좌측 사이드바 — 로고 + 탭 4개 + 사용자 정보
    ui/                       # Badge, SummaryCard, RiskBar — 화면 전반에서 재사용
    approvals/                # 승인이력 뷰 (Must)
      ApprovalsView.jsx       #   요약카드+필터+테이블+드로어 조합, 상태(승인/반려) 로컬 처리
      FilterBar.jsx           #   상태/카테고리/인기도 필터 + SKU 검색
      ApprovalsTable.jsx      #   발주추천 테이블, 정렬·페이지네이션(20건)
      DetailDrawer.jsx        #   행 클릭 시 우측 드로어 — 위험도 근거, 재고 현황, 승인/반려
    forecast/                 # 예측대조 뷰 (Must)
      ForecastView.jsx        #   요약카드+기간선택(프리셋+커스텀 범위)+차트 조합
      ForecastLineChart.jsx   #   예측 vs 실측 라인차트 (카테고리 토글 / SKU 하이라이트)
      CategoryErrorChart.jsx  #   카테고리별 오차율(MAPE) 바차트 (Should)
      SkuErrorTable.jsx       #   SKU별 오차 테이블 — 행 클릭 시 위 차트에 해당 SKU 하이라이트
    query/
      DataQueryView.jsx       # 데이터 조회 뷰 (Should) — 질문 칩 4개 + CSV 다운로드
    changelog/
      ChangelogView.jsx       # 버전 기록 타임라인
```

## 기술 스택

- React + Vite
- Tailwind CSS v4 (`@tailwindcss/vite` 플러그인 방식, `tailwind.config.js` 불필요)
- Recharts (라인/바 차트)
- lucide-react (아이콘)
- Pretendard (웹폰트, `public/fonts/` 로컬 서빙 — `src/index.css`의 `@font-face` + `--font-sans`)

React Query/SWR, MSAL 인증은 아직 붙이지 않았습니다. `src/data/mockData.js`를
`useQuery` 훅으로 바꿔 끼우는 지점만 명확히 분리해뒀습니다(각 View가 데이터를
import하는 부분만 교체하면 됩니다).

## 디자인 결정 사항 (담당자 재량 영역, 4절)

- **레이아웃은 좌측 사이드바**입니다 — 4개 탭(승인이력/예측대조/데이터조회/버전기록)을
  아이콘+라벨로 나열, 다크 배경(`--color-sidebar-bg`)으로 메인 콘텐츠(밝은 배경)와 대비.
- **폰트는 Pretendard**로 통일(`public/fonts/`에 4개 굵기 로컬 포함, 시스템에 폰트가
  없는 환경에서도 동일하게 렌더링됨).
- **브랜드 액센트는 인디고(`--color-accent: #4338CA`) 유지** — 참고 이미지의 민트그린 대신
  기존 색을 유지한 이유: 이 앱에서 초록은 이미 "승인(Approved)" 상태를 의미하는 시맨틱
  색상이라, 브랜드 액센트로도 초록을 쓰면 "이 버튼이 상태를 나타내는 건지 그냥 강조인지"
  헷갈릴 수 있음.
- **risk_score 색상**은 초록→빨강이 아니라 단일 색조(연한 amber → 진한 오렌지) 명도
  변화로 처리 — 색맹 접근성 권고 반영.
- **상태 색상**(대기=amber, 승인=green, 반려=red)은 Alert 우선순위 색상과 통일.

## 아직 안 된 것 (다음 단계)

- [ ] Dataverse OData 연동 (`5. 데이터 연동` 표 참고) — 지금은 전부 `mockData.js`
- [ ] MSAL(Azure AD) 로그인
- [ ] 예측대조 뷰의 실측 데이터 저장 방식 확정 후 스키마 맞추기 (ML 롤과 협의 필요)
- [ ] SKU별 일별 시계열이 실데이터로 붙으면 `SKU_DAILY_SERIES` 목업 로직 제거
- [ ] Teams 웹사이트 탭 등록은 배포 후 진행
