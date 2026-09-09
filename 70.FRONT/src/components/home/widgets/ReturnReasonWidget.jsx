import { RETURN_REASON_BREAKDOWN } from "../../../data/mockData";

export default function ReturnReasonWidget() {
  return (
    <div>
      <ul className="space-y-2.5">
        {RETURN_REASON_BREAKDOWN.map((r) => (
          <li key={r.code}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-[var(--color-text)]">{r.label}</span>
              <span className="tabular-nums text-[var(--color-text-muted)]">{r.pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#00000014]">
              <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${r.pct}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-[var(--color-text-faint)]">
        반품 500건 표본 기준 사유 비율 — 표본 크기상 전체 반품률(건수/전체주문) 절대값은 아직 대표성 부족.
      </p>
    </div>
  );
}
