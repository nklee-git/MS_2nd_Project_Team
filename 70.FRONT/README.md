# Fashion AI Agent — 대시보드 프론트엔드

> **📌 최민님 포함 팀원 전원 확인 부탁드립니다 (2026-09-10)**: 대시보드는 이미 **ASP.NET Core MVC/Razor Pages(C#)**로 만들어져 있습니다 — 코드는 `70.FRONT/dashboard/FashionAiDashboard/`. 홈·협업허브·승인이력·예측대조·데이터조회·버전기록 6개 화면 뼈대 + 승인이력 필터/드로어/승인반려 플로우까지 구현·동작 확인 완료된 상태입니다. **새로 만들지 않으셔도 됩니다** — UI/키오스크 관련 아이디어가 있으시면 이 기존 코드베이스에 이어서 붙이는 방향으로 상의해주세요.
>
> 아래 `src/`~"기술 스택" 절까지는 v0.5.0까지 쓰던 **React 구현(2026-09-10 폐기, 레거시 참고용)** 설명입니다. 실제 최신 코드·진행상황은 바로 아래 "현재 상태" 절 참고.

## 🔵 현재 상태 (2026-09-10, ASP.NET Core MVC 기준)

실제 코드: [`70.FRONT/dashboard/FashionAiDashboard/`](dashboard/FashionAiDashboard/)

**구현된 화면** (`Controllers/`·`Views/` 각 6개)
- 홈(Home) — KPI 카드 + 위젯 그리드(베스트셀러·카테고리 재고위험·반품사유·월매출)
- 승인이력(Approvals) — 필터바·테이블·상세 드로어·승인/반려(반려사유 드롭다운+직접입력 병행) — **가장 깊게 구현됨**
- 예측대조(Forecast) — 예측-실측 라인차트, 카테고리별 오차율
- 데이터조회(Query) — 질문 칩 기반 셀프서비스 + CSV 다운로드
- 협업허브(Collab) — 멘션/태스크/알림함, 관련 문서 카드, 답장 UI
- 버전기록(Changelog)

데이터는 `Data/nqnq/*.csv`(실제 NQNQ 생성 데이터)를 `SampleDataService`가 파싱·조인해서 앱 시작 시 한 번 로드 — Dataverse 연동 전까지는 이 서비스가 데이터 소스 역할.

**남은 것 (실제 최신, 아래 "진행 상황" 절의 React 기준 목록은 무시)**
- [ ] Dataverse Web API 연동 (`SampleDataService`를 Dataverse 호출로 교체) — 최민님 1-2절 백엔드 아키텍처 결정 대기
- [ ] AI 리오더 시뮬레이터 — 2026-09-10 채택, 착수 예정
- [ ] GenAI 예측근거 자연어 설명(Teams 카드) — 2026-09-10 채택(시도), 임현제님 Week 2 스트레치
- [ ] 실시간 데이터 생성 모듈 연동 — 최민님 진행 중인 모듈([[작업지시서 (최민 — 데이터·인프라)]] 6절)을 대시보드가 어떻게 반영할지
- [ ] MSAL 인증(Microsoft.Identity.Web 검토)
- [ ] 반응형 — 발표가 노트북 화면 고정이라 우선순위 낮음

---

# (레거시 참고) React 구현 — v0.5.0까지, 2026-09-10 폐기

> 아래는 폐기된 React 구현의 원래 설명입니다. 화면 구조·데이터 계약은 여전히 참고 가치가 있지만, 실행 명령(`npm run dev` 등)·기술 스택·"진행 상황" 체크리스트는 더 이상 최신이 아닙니다 — 위 "현재 상태" 절이 최신입니다.

[26. 대시보드 기술명세 (프론트).md](<26. 대시보드 기술명세 (프론트).md>)에 정의된 화면 구조를 코드로
옮긴 시작점입니다(2026-09-09부로 원래 `20.ARCHITECTURE`에 있던 26·27번 문서를 하나로 합쳐
이 폴더로 옮겨왔습니다 — PART 1=v1 MVP 스펙, PART 2=v2 협업 대시보드 확장). 실제 Dataverse
연동 전까지는 `src/data/mockData.js`가 데이터를
대신하는데, 아무 값이나 지어낸 게 아니라 `src/data/nqnq/*.csv`(products·sku_master·
inventory_snapshot·popularity_tier_performance — 실제 NQNQ 카탈로그 생성 데이터를
그대로 복사해온 것)를 파싱·조인해서 씁니다. 승인/반려 같은 워크플로우 상태와
예측대조 뷰의 held-out 일별 수치만 아직 진짜 시스템이 없어 시뮬레이션입니다(코드
주석에 표시해둠). 변경 이력은 앱 안의 "버전 기록" 탭 또는 `src/data/changelog.js` 참고.

## 진행 상황 (2026-09-09 기준)

**완료**
- [x] Must 전부 — 승인이력 뷰(요약카드·필터·테이블), 예측대조 뷰(요약카드·기간선택·메인차트)
- [x] Should 대부분 — 상세 드로어, 카테고리별 오차율, 데이터 조회 뷰(질문 칩 4개)
- [x] Could 일부 — SKU별 오차 테이블 + 메인 차트 하이라이트, 재고 스파크라인
- [x] 사이드바 레이아웃 · Pretendard 폰트 · 버전 기록 탭
- [x] mockData를 실제 NQNQ 카탈로그(CSV)로 연동 — 이전엔 스타일명을 임의로 지어냈었음(예:
      "H라인 미니스커트" 등 실제 카탈로그에 없는 이름)
- [x] 홈 탭 — 위젯 카드형 모듈형 대시보드 (추가/제거/드래그 순서변경, localStorage에 순서 저장), 총 17종
- [x] 이해관계자 협업 대시보드 Must 티어 (`27. 이해관계자 협업 대시보드 UX-UI 기능명세서`) — 역할 전환
      스위처, 역할별 위젯·메뉴 필터링, 협업 허브 뼈대(멘션/태스크/알림함), 해시태그 칩

**남은 것**
- [ ] 27번 문서 Should/Could 티어 — 승인 워크플로우 스텝퍼, 코멘트 스레드, 디자이너/마케터/SCM/경영진
      전용 신규 화면(트렌드·리뷰, 캠페인성과, RFM, 공급망현황, 재고이관, 통합KPI 등)
- [ ] TASK/MENTION/ALERT_LOG 3개 신규 엔티티 실제 구현 — 현재는 UI 목업까지만(27번 문서 5절)
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
    nqnq/                     # 실제 NQNQ 카탈로그·매출·반품·트렌드캡슐 CSV(30.DATA/32.nqnq_data에서 복사)
    changelog.js              # 버전 기록 데이터
    homeWidgets.js            # 홈 위젯 레지스트리 — 위젯별 span·roles 태그
    roles.js                  # 역할 전환 스위처용 5개 역할 정의 (27번 문서 2-1절)
    collabTags.js             # 해시태그 칩 5종 정적 목록 (27번 문서 3-2절)
  utils/format.js            # 상대시간·숫자 포맷 유틸
  components/
    layout/Sidebar.jsx       # 좌측 사이드바 — 로고 + 역할 스위처 + 역할별 탭 + 사용자 정보
    ui/                       # Badge, SummaryCard, RiskBar — 화면 전반에서 재사용
    home/                     # 홈 뷰 — 위젯 카드형 모듈형 대시보드, 역할별 필터링
      HomeView.jsx            #   위젯 순서/표시 state 관리 + localStorage 저장, 드래그앤드롭
      WidgetShell.jsx         #   위젯 카드 공통 껍데기 — 드래그 핸들 + 제목 + 숨기기 버튼
      StatRow.jsx             #   3~4개 소형 지표를 나열하는 공용 레이아웃
      widgets/                #   위젯 17종 — 각자 mockData에서 직접 데이터를 가져옴
    collab/                   # 협업 레이어 (27번 문서) — 데이터 연동 전 UI 뼈대
      CollabHubView.jsx       #   멘션함/태스크함/알림함 3탭, 예시 1건 + "연동 예정" 안내
      HashtagPicker.jsx       #   고정 해시태그 5종 다중선택 칩 (DetailDrawer 반려 흐름에 적용)
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

- **레이아웃은 좌측 사이드바**입니다 — 5개 탭(홈/승인이력/예측대조/데이터조회/버전기록)을
  아이콘+라벨로 나열, 다크 배경(`--color-sidebar-bg`)으로 메인 콘텐츠(밝은 배경)와 대비.
- **홈 탭은 위젯 카드형**으로 구현 — 사용자가 위젯을 추가/제거하고 드래그로 순서를
  바꿀 수 있음(레이아웃 크기는 위젯별로 고정, 순서만 조정 가능). 상태는 `localStorage`에
  저장되어 새로고침해도 유지됨.
- **폰트는 Pretendard**로 통일(`public/fonts/`에 4개 굵기 로컬 포함, 시스템에 폰트가
  없는 환경에서도 동일하게 렌더링됨).
- **컬러 팔레트 전면 개편 (2026-09-09, 2차 수정으로 확정)** — 사용자가 준 레퍼런스
  6색 그대로만 사용: Poppy Pink `#F33283` / Punchy Pink `#FF80B4` / Pastel Pink
  `#FFADD7` / Regular White `#FFFFFF` / Off-White `#F9F9F9` / Regular Black `#000000`.
  1차 수정 때 임의로 넣었던 웜톤 그레이(#FAF8F6, #656565 등)는 팔레트에 없는 색이라
  전부 제거 — 회색이 필요한 자리(보더·muted 텍스트·차트 그리드라인)는 새 색을 만들지
  않고 `rgba(0,0,0,0.08~0.6)`처럼 Regular Black의 투명도만 낮춰서 씀.
  - 배경(`--color-bg`)은 Off-White `#F9F9F9`, 카드는 Regular White.
  - 사이드바는 Regular Black, active 탭·유저 아바타는 Poppy Pink.
  - accent(`#F33283`)는 버튼·배지·포커스링·차트 강조색 전반에, hover는 팔레트에 없는
    "더 어두운 핑크"를 만드는 대신 Punchy Pink(`#FF80B4`, 더 밝은 톤)로 상태만 구분.
    secondary 강조는 Pastel Pink(`#FFADD7`).
  - 승인(초록)/반려(빨강)/대기(주황) 시맨틱 색상, risk_score 앰버 램프는 이 팔레트와
    무관하게 그대로 유지 — 상태 의미가 있는 색이라 핑크와 안 겹치게 하기 위함.
  - (참고) zigzag.kr 로고 배지 실측 색은 `#FA6EE3`이지만, 흰 글자 대비가 약해서
    (WCAG ~2.5:1) 사용자가 준 팔레트의 Poppy Pink(`#F33283`, 대비 ~3.75:1)를 최종 반영.
- **risk_score 색상**은 초록→빨강이 아니라 단일 색조(연한 amber → 진한 오렌지) 명도
  변화로 처리 — 색맹 접근성 권고 반영.
- **상태 색상**(대기=amber, 승인=green, 반려=red)은 Alert 우선순위 색상과 통일.

> 위 "남은 것" 목록 외 세부 메모: SKU별 일별 시계열(`SKU_DAILY_SERIES`)은 실데이터가 아직
> 없어 카테고리 계절 드리프트 기반 근사치 — 실제 ML 예측이 붙으면 이 목업 로직부터 제거.
