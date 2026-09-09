import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { CATEGORY_ERROR_RATES } from "../../data/mockData";

export default function CategoryErrorChart() {
  const maxMape = Math.max(...CATEGORY_ERROR_RATES.map((c) => c.mape));

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h3 className="mb-1 text-sm font-semibold text-[var(--color-text)]">카테고리별 오차율 (MAPE)</h3>
      <p className="mb-4 text-xs text-[var(--color-text-muted)]">
        OUT(아우터)은 계절 전환기 수요 변동이 커 오차가 크게 나타나는 경향이 있습니다.
      </p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={CATEGORY_ERROR_RATES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(0,0,0,0.08)" vertical={false} />
            <XAxis
              dataKey="category_code"
              tick={{ fontSize: 11, fill: "rgba(0,0,0,0.45)" }}
              axisLine={{ stroke: "rgba(0,0,0,0.15)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "rgba(0,0,0,0.45)" }}
              axisLine={false}
              tickLine={false}
              width={36}
              unit="%"
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.15)" }}
              formatter={(v) => [`${v}%`, "MAPE"]}
            />
            <Bar dataKey="mape" radius={[4, 4, 0, 0]}>
              {CATEGORY_ERROR_RATES.map((entry) => (
                <Cell
                  key={entry.category_code}
                  fill={entry.mape === maxMape ? "#F33283" : "#FFADD7"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
