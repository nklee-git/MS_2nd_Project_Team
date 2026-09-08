import { Search } from "lucide-react";
import { CATEGORIES, POPULARITY_TIERS } from "../../data/mockData";

const STATUS_CHIPS = [
  { id: "all", label: "전체" },
  { id: "Pending", label: "대기" },
  { id: "Approved", label: "승인" },
  { id: "Rejected", label: "반려" },
];

export default function FilterBar({ filters, onChange }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
      {/* 상태 필터 — 단일 선택 칩 */}
      <div className="flex items-center gap-1 rounded-lg bg-[#F2F4F7] p-1">
        {STATUS_CHIPS.map((chip) => (
          <button
            key={chip.id}
            onClick={() => set({ status: chip.id })}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              filters.status === chip.id
                ? "bg-white text-[var(--color-text)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <select
        value={filters.category}
        onChange={(e) => set({ category: e.target.value })}
        className="rounded-md border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-sm text-[var(--color-text)]"
      >
        <option value="all">전체 카테고리</option>
        {CATEGORIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label} ({c.code})
          </option>
        ))}
      </select>

      <select
        value={filters.tier}
        onChange={(e) => set({ tier: e.target.value })}
        className="rounded-md border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-sm text-[var(--color-text)]"
      >
        <option value="all">전체 인기도</option>
        {POPULARITY_TIERS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <div className="relative ml-auto w-64">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-faint)]" />
        <input
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="SKU 코드로 검색"
          className="w-full rounded-md border border-[var(--color-border)] bg-white py-1.5 pl-8 pr-3 text-sm placeholder:text-[var(--color-text-faint)]"
        />
      </div>
    </div>
  );
}
