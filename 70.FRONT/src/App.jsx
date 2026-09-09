import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import HomeView from "./components/home/HomeView";
import CollabHubView from "./components/collab/CollabHubView";
import ApprovalsView from "./components/approvals/ApprovalsView";
import ForecastView from "./components/forecast/ForecastView";
import DataQueryView from "./components/query/DataQueryView";
import ChangelogView from "./components/changelog/ChangelogView";
import { DEFAULT_ROLE } from "./data/roles";

const PAGE_META = {
  home: { title: "홈", desc: "위젯을 추가·삭제·드래그로 배치해 원하는 지표만 모아볼 수 있습니다." },
  collab: { title: "협업 허브", desc: "멘션·태스크·알림을 한곳에서 확인합니다. (레이아웃 뼈대, 데이터 연동 전)" },
  approvals: { title: "승인이력", desc: "발주추천 목록을 확인하고 승인/반려 처리합니다." },
  forecast: { title: "예측대조", desc: "9월 held-out 구간 예측치와 실측치를 비교합니다." },
  query: { title: "데이터 조회", desc: "질문 칩으로 자주 찾는 데이터를 바로 조회합니다." },
  changelog: { title: "버전 기록", desc: "이 대시보드의 변경 이력입니다." },
};

// 27. 이해관계자 협업 대시보드 UX-UI 기능명세서 2-2절 매트릭스 — 역할 전환
// 시 지금 보던 탭에 접근권이 없으면(예: 디자이너로 바꿨는데 예측대조를 보던 중)
// 홈으로 되돌린다.
const TAB_ROLES = {
  approvals: ["md", "designer", "marketer", "scm", "exec"],
  forecast: ["md", "scm", "exec"],
};

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [role, setRole] = useState(DEFAULT_ROLE);
  const meta = PAGE_META[activeTab];

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    const allowed = TAB_ROLES[activeTab];
    if (allowed && !allowed.includes(nextRole)) {
      setActiveTab("home");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <Sidebar active={activeTab} onChange={setActiveTab} role={role} onRoleChange={handleRoleChange} />
      <div className="flex-1 overflow-y-auto">
        <main className="mx-auto max-w-[1400px] px-6 py-6">
          <div className="mb-5">
            <h1 className="text-lg font-semibold text-[var(--color-text)]">{meta.title}</h1>
            <p className="text-sm text-[var(--color-text-muted)]">{meta.desc}</p>
          </div>

          {activeTab === "home" && <HomeView role={role} onNavigateTab={setActiveTab} />}
          {activeTab === "collab" && <CollabHubView />}
          {activeTab === "approvals" && <ApprovalsView />}
          {activeTab === "forecast" && <ForecastView />}
          {activeTab === "query" && <DataQueryView />}
          {activeTab === "changelog" && <ChangelogView />}
        </main>
      </div>
    </div>
  );
}
