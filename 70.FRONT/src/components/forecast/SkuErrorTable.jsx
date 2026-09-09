import { SKU_ERRORS } from "../../data/mockData";
import { formatNumber } from "../../utils/format";

export default function SkuErrorTable({ selectedSku, onRowClick }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">SKU별 오차 상세</h3>
        <span className="text-xs text-[var(--color-text-faint)]">행을 클릭하면 위 차트에 하이라이트됩니다</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
            <th className="px-5 py-2 font-medium">SKU</th>
            <th className="px-5 py-2 font-medium">스타일명</th>
            <th className="px-5 py-2 font-medium text-right">예측 합계</th>
            <th className="px-5 py-2 font-medium text-right">실측 합계</th>
            <th className="px-5 py-2 font-medium text-right">오차율</th>
          </tr>
        </thead>
        <tbody>
          {SKU_ERRORS.map((row) => {
            const isActive = row.sku_code === selectedSku;
            return (
              <tr
                key={row.sku_code}
                onClick={() => onRowClick(isActive ? null : row.sku_code)}
                className={`cursor-pointer border-b border-[var(--color-border)] last:border-0 ${
                  isActive ? "bg-[var(--color-accent-soft)]" : "hover:bg-[#F9F9F9]"
                }`}
              >
                <td className="whitespace-nowrap px-5 py-2 font-[var(--font-mono)] text-[13px]">
                  {row.sku_code}
                </td>
                <td className="whitespace-nowrap px-5 py-2">{row.style_name}</td>
                <td className="whitespace-nowrap px-5 py-2 text-right tabular-nums">
                  {formatNumber(row.predicted_total)}
                </td>
                <td className="whitespace-nowrap px-5 py-2 text-right tabular-nums">
                  {formatNumber(row.actual_total)}
                </td>
                <td className="whitespace-nowrap px-5 py-2 text-right font-medium tabular-nums text-[var(--color-text)]">
                  {row.mape}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
