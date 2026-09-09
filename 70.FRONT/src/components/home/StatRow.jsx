// Compact inline stat row shared by widgets that show 3~4 small numbers
// (KpiWidget, ForecastMiniWidget) instead of full SummaryCard tiles.
export default function StatRow({ items }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const toneClass =
          item.tone === "bad"
            ? "text-[var(--color-red)]"
            : item.tone === "good"
            ? "text-[var(--color-green)]"
            : "text-[var(--color-text)]";
        return (
          <div key={item.label}>
            <div className="text-xs text-[var(--color-text-muted)]">{item.label}</div>
            <div className={`mt-1 flex items-baseline gap-1 ${toneClass}`}>
              <span className="text-xl font-semibold tracking-tight">{item.value}</span>
              {item.unit && <span className="text-xs font-medium text-[var(--color-text-faint)]">{item.unit}</span>}
            </div>
            {item.caption && <div className="mt-0.5 text-[11px] text-[var(--color-text-faint)]">{item.caption}</div>}
          </div>
        );
      })}
    </div>
  );
}
