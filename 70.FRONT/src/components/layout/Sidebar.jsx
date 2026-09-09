import { LayoutGrid, ClipboardCheck, LineChart, MessageSquareText, History } from "lucide-react";

const NAV_ITEMS = [
  { id: "home", label: "홈", icon: LayoutGrid },
  { id: "approvals", label: "승인이력", icon: ClipboardCheck },
  { id: "forecast", label: "예측대조", icon: LineChart },
  { id: "query", label: "데이터 조회", icon: MessageSquareText },
];

const SECONDARY_ITEMS = [{ id: "changelog", label: "버전 기록", icon: History }];

function NavButton({ item, active, onChange }) {
  const isActive = item.id === active;
  const Icon = item.icon;
  return (
    <button
      onClick={() => onChange(item.id)}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-[var(--color-sidebar-active-bg)] text-white"
          : "text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-active-bg)] hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </button>
  );
}

export default function Sidebar({ active, onChange }) {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-bg)] px-3 py-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--color-accent)] text-xs font-semibold text-white">
          FA
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-white">Fashion AI Agent</div>
          <div className="truncate text-[11px] text-[var(--color-sidebar-text-muted)]">재고 리플레니시먼트</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavButton key={item.id} item={item} active={active} onChange={onChange} />
        ))}
      </nav>

      <div className="mt-5 border-t border-[var(--color-sidebar-border)] pt-4">
        <div className="px-2 pb-1.5 text-[11px] font-medium text-[var(--color-sidebar-text-muted)]">기타</div>
        <nav className="flex flex-col gap-1">
          {SECONDARY_ITEMS.map((item) => (
            <NavButton key={item.id} item={item} active={active} onChange={onChange} />
          ))}
        </nav>
      </div>

      <div className="mt-auto flex items-center gap-2 rounded-lg px-2 py-2">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-sidebar-active-bg)] text-xs font-semibold text-white">
          이서
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-white">이서연</div>
          <div className="truncate text-[11px] text-[var(--color-sidebar-text-muted)]">MD</div>
        </div>
        <span className="shrink-0 rounded-md border border-[var(--color-sidebar-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-sidebar-text-muted)]">
          Dev
        </span>
      </div>
    </aside>
  );
}
