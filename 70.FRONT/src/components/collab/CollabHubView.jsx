import { useState } from "react";
import { AtSign, ListTodo, Bell } from "lucide-react";
import Badge from "../ui/Badge";

// 27. 이해관계자 협업 대시보드 UX-UI 기능명세서 3-3절 — 협업 허브 UI 뼈대.
// MENTION/TASK/ALERT_LOG 3개 엔티티가 아직 없어(🔴) 데이터 연동 전 상태 —
// 레이아웃과 예시 1건만 보여주고, 나머지는 "연동 예정" 안내로 대체.
const TABS = [
  { id: "mention", label: "멘션함", icon: AtSign },
  { id: "task", label: "태스크함", icon: ListTodo },
  { id: "alert", label: "알림함", icon: Bell },
];

const EXAMPLES = {
  mention: {
    entity: "MENTION",
    row: {
      from: "이서연 (MD)",
      text: '"@임재범 팀장님, [인생 슬랙스 Short-M] 직진배송 창고 입고 2일 지연되는데 메인 노출 일정 미룰까요?" #생산지연',
      time: "5분 전",
    },
  },
  task: {
    entity: "TASK",
    row: {
      from: "박지민 (Technical Designer)",
      text: "샘플수정요청 — 인생 슬랙스 Short 핏 조정 (SLA 3일)",
      time: "대기 · D-2",
    },
  },
  alert: {
    entity: "ALERT_LOG",
    row: {
      from: "재고 리오더 트리거",
      text: "TRD-CLR-01-COOL-002-S-CRM 재발주점 이하 — 긴급",
      time: "1시간 전",
    },
  },
};

export default function CollabHubView() {
  const [tab, setTab] = useState("mention");
  const example = EXAMPLES[tab];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 rounded-lg bg-[#F9F9F9] p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.id ? "bg-white text-[var(--color-text)] shadow-sm" : "text-[var(--color-text-muted)]"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="accent">예시 1건</Badge>
          <span className="text-xs text-[var(--color-text-faint)]">실제 데이터 연동 전 — 화면 레이아웃 참고용</span>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] p-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-text)]">{example.row.from}</span>
            <span className="text-xs text-[var(--color-text-faint)]">{example.row.time}</span>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">{example.row.text}</p>
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border-strong)] p-4 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">연동 예정</p>
          <p className="mt-1 text-xs text-[var(--color-text-faint)]">
            `{example.entity}` 엔티티 확장 후 실제 목록으로 교체 — [[71. Entity Definitions & Data Dictionary]] 5절
            참고
          </p>
        </div>
      </div>
    </div>
  );
}
