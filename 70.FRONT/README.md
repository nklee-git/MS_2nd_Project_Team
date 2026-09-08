# Fashion AI Agent — 대시보드 프론트엔드 스켈레톤

`20.ARCHITECTURE/26. 대시보드 기술명세 (프론트).md`에 정의된 화면 구조를 코드로
옮긴 시작점입니다. 실제 Dataverse 연동 전까지는 `src/data/mockData.js`가 데이터를
대신하는데, 아무 값이나 지어낸 게 아니라 `src/data/nqnq/*.csv`(products·sku_master·
inventory_snapshot·popularity_tier_performance — 실제 NQNQ 카탈로그 생성 데이터를
그대로 복사해온 것)를 파싱·조인해서 씁니다. 승인/반려 같은 워크플로우 상태와
예측대조 뷰의 held-out 일별 수치만 아직 진짜 시스템이 없어 시뮬레이션입니다(코드
주석에 표시해둠). 변경 이력은 앱 안의 "버전 기록" 탭 또는 `src/data/changelog.js` 참고.

## 진행 상황 (2026-09-08 기준)

**완료**
- [x] Must 전부 — 승인이력 뷰(요약카드·필터·테이블), 예측대조 뷰(요약카드·기간선택·메인차트)
- [x] Should 대부분 — 상세 드로어, 카테고리별 오차율, 데이터 조회 뷰(질문 칩 4개)
- [x] Could 일부 — SKU별 오차 테이블 + 메인 차트 하이라이트, 재고 스파크라인
- [x] 사이드바 레이아웃 · Pretendard 폰트 · 버전 기록 탭
- [x] mockData를 실제 NQNQ 카탈로그(CSV)로 연동 — 이전엔 스타일명을 임의로 지어냈었음(예:
      "H라인 미니스커트" 등 실제 카탈로그에 없는 이름)

**남은 것**
- [ ] Teams 웹사이트 탭 연동 — 프론트 단독으로 불가, RAG 롤 Power Automate 세팅 이후
- [ ] Power BI 연동, 질문 칩 자유입력 확장 (Could, 우선순위 낮음)
- [ ] AI 리오더 시뮬레이터 / 알림 카드형 위젯 — 설계만 있음, 4인 회의에서 채택 여부 결정 대기
- [ ] 실시간 데이터 생성 모듈 연동 방식(sqlite 타이머 vs Dataverse 직결) — 결정 대기
- [ ] 반응형 — 발표가 노트북 화면 고정이라 우선순위 낮음
- [ ] Dataverse OData 연동, MSAL 인증 — 데이터·인프라 롤 Dataverse 세팅 완료 후 시작
- [ ] 페인포인트 구체 에피소드를 실제 UI 문구·시나리오에 반영 — 4인 회의 안건
- [ ] `src/data/nqnq/*.csv`는 체형태그·사이즈(XS~4XL) 개편 **이전** 스냅샷 — 데이터 재생성되면 교체 필요

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
    mockData.js              # 실제 카탈로그(CSV) 파싱·조인 + 워크플로우/예측 시뮬레이션 레이어
    nqnq/                     # 실제 NQNQ 카탈로그 CSV 4종(30.DATA/32.nqnq_data에서 복사)
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

> 위 "남은 것" 목록 외 세부 메모: SKU별 일별 시계열(`SKU_DAILY_SERIES`)은 실데이터가 아직
> 없어 카테고리 계절 드리프트 기반 근사치 — 실제 ML 예측이 붙으면 이 목업 로직부터 제거.
