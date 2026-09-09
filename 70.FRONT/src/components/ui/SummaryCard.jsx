// One KPI tile. Used for both the 승인이력 (4 cards) and 예측대조 (3 cards) headers.
// `tone` lightly tints the value for cards that are inherently good/bad news
// (e.g. 반려율 높음), default keeps it neutral so most cards stay calm.
export default function SummaryCard({ label, value, unit, caption, tone = "neutral", icon: Icon }) {
  const toneClass =
    tone === "bad"
      ? "text-[var(--color-red)]"
      : tone === "good"
      ? "text-[var(--color-green)]"
      : "text-[var(--color-text)]";

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-[var(--color-text-muted)]">{label}</div>
        {Icon && (
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#F9F9F9] text-[var(--color-text-muted)]">
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      <div className={`mt-2 flex items-baseline gap-1 ${toneClass}`}>
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        {unit && <span className="text-sm font-medium text-[var(--color-text-faint)]">{unit}</span>}
      </div>
      {caption && <div className="mt-1 text-xs text-[var(--color-text-faint)]">{caption}</div>}
    </div>
  );
}
