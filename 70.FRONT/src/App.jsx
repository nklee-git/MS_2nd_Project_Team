import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import HomeView from "./components/home/HomeView";
import ApprovalsView from "./components/approvals/ApprovalsView";
import ForecastView from "./components/forecast/ForecastView";
import DataQueryView from "./components/query/DataQueryView";
import ChangelogView from "./components/changelog/ChangelogView";

const PAGE_META = {
  home: { title: "홈", desc: "위젯을 추가·삭제·드래그로 배치해 원하는 지표만 모아볼 수 있습니다." },
  approvals: { title: "승인이력", desc: "발주추천 목록을 확인하고 승인/반려 처리합니다." },
  forecast: { title: "예측대조", desc: "9월 held-out 구간 예측치와 실측치를 비교합니다." },
  query: { title: "데이터 조회", desc: "질문 칩으로 자주 찾는 데이터를 바로 조회합니다." },
  changelog: { title: "버전 기록", desc: "이 대시보드의 변경 이력입니다." },
};

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const meta = PAGE_META[activeTab];

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <Sidebar active={activeTab} onChange={setActiveTab} />
      <div className="flex-1 overflow-y-auto">
        <main className="mx-auto max-w-[1400px] px-6 py-6">
          <div className="mb-5">
            <h1 className="text-lg font-semibold text-[var(--color-text)]">{meta.title}</h1>
            <p className="text-sm text-[var(--color-text-muted)]">{meta.desc}</p>
          </div>

          {activeTab === "home" && <HomeView />}
          {activeTab === "approvals" && <ApprovalsView />}
          {activeTab === "forecast" && <ForecastView />}
          {activeTab === "query" && <DataQueryView />}
          {activeTab === "changelog" && <ChangelogView />}
        </main>
      </div>
    </div>
  );
}
