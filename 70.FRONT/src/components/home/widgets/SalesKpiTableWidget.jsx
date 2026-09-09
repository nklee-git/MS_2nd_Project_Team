import { SALES_KPI_TABLE } from "../../../data/mockData";

const STATUS_DOT = {
  good: "bg-[var(--color-green)]",
  warn: "bg-[var(--color-amber)]",
  bad: "bg-[var(--color-red)]",
  info: "bg-[var(--color-accent)]",
  unknown: "bg-[var(--color-text-faint)]",
};

const STATUS_LABEL = {
  good: "정상",
  warn: "주의",
  bad: "경고",
  info: "참고",
  unknown: "미수집",
};

export default function SalesKpiTableWidget() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-[var(--color-text-muted)]">
            <th className="pb-2 pr-4 font-medium">지표</th>
            <th className="pb-2 pr-4 font-medium">값</th>
            <th className="pb-2 pr-4 font-medium">기준</th>
            <th className="pb-2 font-medium">상태</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {SALES_KPI_TABLE.map((row) => (
            <tr key={row.key}>
              <td className="py-2 pr-4 font-medium text-[var(--color-text)] whitespace-nowrap">{row.label}</td>
              <td className="py-2 pr-4 tabular-nums text-[var(--color-text)] whitespace-nowrap">{row.value}</td>
              <td className="py-2 pr-4 text-xs text-[var(--color-text-faint)]">{row.caption}</td>
              <td className="py-2">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-[var(--color-text-muted)]">
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[row.status]}`} />
                  {STATUS_LABEL[row.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] text-[var(--color-text-faint)]">
        44. KPI Definitions 기준 실무 판매지표 9종. "미수집"은 방문세션/광고비/고객별 재구매 이력처럼 아직
        추적하는 데이터 자체가 없는 항목 — 숫자를 지어내지 않고 목표치만 표시.
      </p>
    </div>
  );
}
