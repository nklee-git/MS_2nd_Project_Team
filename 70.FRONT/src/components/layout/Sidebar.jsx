import { LayoutGrid, MessageCircle, ClipboardCheck, LineChart, MessageSquareText, History } from "lucide-react";
import { ROLES } from "../../data/roles";

const COMMON_ITEMS = [
  { id: "home", label: "홈", icon: LayoutGrid },
  { id: "collab", label: "협업 허브", icon: MessageCircle, badge: 3 },
];

// roles: 27. 이해관계자 협업 대시보드 UX-UI 기능명세서 2-2절 역할별 화면
// 접근 매트릭스 그대로(● 주 사용자 / ○ 조회— 둘 다 "표시", — 만 숨김).
const NAV_ITEMS = [
  {
    id: "approvals",
    label: "승인이력",
    icon: ClipboardCheck,
    roles: ["md", "designer", "marketer", "scm", "exec"],
  },
  { id: "forecast", label: "예측대조", icon: LineChart, roles: ["md", "scm", "exec"] },
  {
    id: "query",
    label: "데이터 조회",
    icon: MessageSquareText,
    roles: ["md", "designer", "marketer", "scm", "exec"],
  },
];

const SECONDARY_ITEMS = [{ id: "changelog", label: "버전 기록", icon: History }];

// 27. 이해관계자 협업 대시보드 UX-UI 기능명세서 1-1절 매핑 그대로 — 역할
// 전환 시 하단 사용자 카드도 해당 가상 인물로 바뀜(데모용).
const ROLE_PROFILE = {
  md: { name: "이서연", title: "MD", initials: "이서" },
  designer: { name: "박지민", title: "Technical Designer", initials: "박지" },
  marketer: { name: "최유진", title: "Content Marketer", initials: "최유" },
  scm: { name: "임재범", title: "풀필먼트팀장", initials: "임재" },
  exec: { name: "김민준", title: "Brand Lead", initials: "김민" },
};

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
      <span className="flex-1 text-left">{item.label}</span>
      {item.badge > 0 && (
        <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-semibold text-white">
          {item.badge}
        </span>
      )}
    </button>
  );
}

export default function Sidebar({ active, onChange, role, onRoleChange }) {
  const profile = ROLE_PROFILE[role] ?? ROLE_PROFILE.md;

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-bg)] px-3 py-4">
      <div className="mb-4 flex items-center gap-2 px-2">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--color-accent)] text-xs font-semibold text-white">
          FA
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-white">Fashion AI Agent</div>
          <div className="truncate text-[11px] text-[var(--color-sidebar-text-muted)]">재고 리플레니시먼트</div>
        </div>
      </div>

      {/* 역할 전환 스위처 — 데모/프로토타입 전용, 운영 배포 시 제거 대상
          (27. 이해관계자 협업 대시보드 UX-UI 기능명세서 2-1절 UX 노트) */}
      <label className="mb-4 block px-2">
        <span className="mb-1 block text-[10px] font-medium text-[var(--color-sidebar-text-muted)]">
          현재 보기
        </span>
        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          className="w-full rounded-md border border-[var(--color-sidebar-border)] bg-[#1A1A1A] px-2 py-1.5 text-sm font-medium text-white outline-none"
        >
          {ROLES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <nav className="flex flex-col gap-1">
        {COMMON_ITEMS.map((item) => (
          <NavButton key={item.id} item={item} active={active} onChange={onChange} />
        ))}
      </nav>

      {NAV_ITEMS.some((item) => item.roles.includes(role)) && (
        <div className="mt-5 border-t border-[var(--color-sidebar-border)] pt-4">
          <div className="px-2 pb-1.5 text-[11px] font-medium text-[var(--color-sidebar-text-muted)]">업무</div>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.filter((item) => item.roles.includes(role)).map((item) => (
              <NavButton key={item.id} item={item} active={active} onChange={onChange} />
            ))}
          </nav>
        </div>
      )}

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
          {profile.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-white">{profile.name}</div>
          <div className="truncate text-[11px] text-[var(--color-sidebar-text-muted)]">{profile.title}</div>
        </div>
        <span className="shrink-0 rounded-md border border-[var(--color-sidebar-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-sidebar-text-muted)]">
          Dev
        </span>
      </div>
    </aside>
  );
}
