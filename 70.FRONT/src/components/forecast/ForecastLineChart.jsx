import { X } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { CATEGORIES, SKU_DAILY_SERIES } from "../../data/mockData";

export default function ForecastLineChart({
  data,
  categoryFilter,
  onCategoryChange,
  selectedSku,
  onClearSku,
}) {
  const skuMode = Boolean(selectedSku);
  const visibleDates = new Set(data.map((row) => row.date));

  const chartData = skuMode
    ? (SKU_DAILY_SERIES[selectedSku] || []).filter((row) => visibleDates.has(row.date))
    : data;

  const actualKey = skuMode ? "sku_actual" : categoryFilter === "all" ? "actual" : `${categoryFilter}_actual`;
  const predictedKey = skuMode
    ? "sku_predicted"
    : categoryFilter === "all"
    ? "predicted"
    : `${categoryFilter}_predicted`;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">
          {skuMode ? (
            <span className="inline-flex items-center gap-2">
              예측 vs 실측 수요 ·{" "}
              <span className="font-[var(--font-mono)] text-[var(--color-accent)]">{selectedSku}</span>
            </span>
          ) : (
            "예측 vs 실측 수요"
          )}
        </h3>

        {skuMode ? (
          <button
            onClick={onClearSku}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[#F2F4F7]"
          >
            <X className="h-3 w-3" />
            SKU 선택 해제
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F2F4F7] p-1">
            <button
              onClick={() => onCategoryChange("all")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                categoryFilter === "all" ? "bg-white text-[var(--color-text)] shadow-sm" : "text-[var(--color-text-muted)]"
              }`}
            >
              전체
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.code}
                onClick={() => onCategoryChange(c.code)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  categoryFilter === c.code
                    ? "bg-white text-[var(--color-text)] shadow-sm"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                {c.code}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#EEF0F3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#98A2B3" }}
              tickFormatter={(d) => d.slice(5)}
              axisLine={{ stroke: "#E4E7EC" }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: "#98A2B3" }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E4E7EC" }}
              labelFormatter={(d) => d}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              name="실측"
              type="monotone"
              dataKey={actualKey}
              stroke="#14151A"
              strokeWidth={2}
              dot={false}
            />
            <Line
              name="예측"
              type="monotone"
              dataKey={predictedKey}
              stroke="#4338CA"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
