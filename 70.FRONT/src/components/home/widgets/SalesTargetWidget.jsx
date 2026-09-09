import { SALES_TARGETS } from "../../../data/mockData";

export default function SalesTargetWidget() {
  return (
    <div className="space-y-3">
      {SALES_TARGETS.map((y) => {
        const pct = Math.min(100, y.pct);
        const tone = y.pct >= 100 ? "var(--color-green)" : y.pct >= 80 ? "var(--color-accent)" : "var(--color-amber)";
        return (
          <div key={y.year}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-medium text-[var(--color-text)]">
                {y.year} <span className="text-[var(--color-text-faint)]">({y.range})</span>
              </span>
              <span className="tabular-nums text-[var(--color-text-muted)]">
                {y.actual}억 / {y.target}억 · {y.pct}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#00000014]">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: tone }} />
            </div>
          </div>
        );
      })}
      <p className="pt-1 text-[11px] text-[var(--color-text-faint)]">
        Y3는 진행 중(2026.03~08 실적, 연간 목표 대비) — 01. Master Roadmap 목표치 기준.
      </p>
    </div>
  );
}
