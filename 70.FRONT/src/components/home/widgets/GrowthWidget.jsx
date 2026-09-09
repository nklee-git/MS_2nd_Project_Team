import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { MONTHLY_REVENUE } from "../../../data/mockData";

const LAST_12 = MONTHLY_REVENUE.slice(-12).map((m) => ({
  month: m.month.slice(5),
  revenue_billion: m.revenue_billion,
}));

const latest = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1];
const prev = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 2];
const momGrowth = Math.round(((latest.revenue - prev.revenue) / prev.revenue) * 1000) / 10;

export default function GrowthWidget() {
  return (
    <div>
      <div className="mb-3 flex items-baseline gap-1.5">
        <span className="text-xs text-[var(--color-text-muted)]">전월 대비 매출 성장률</span>
        <span
          className={`text-sm font-semibold ${momGrowth >= 0 ? "text-[var(--color-green)]" : "text-[var(--color-red)]"}`}
        >
          {momGrowth > 0 ? "+" : ""}
          {momGrowth}%
        </span>
      </div>
      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={LAST_12} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(0,0,0,0.08)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "rgba(0,0,0,0.45)" }} axisLine={{ stroke: "rgba(0,0,0,0.15)" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "rgba(0,0,0,0.45)" }} axisLine={false} tickLine={false} width={32} unit="억" />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.15)" }}
              formatter={(v) => [`${v}억원`, "매출"]}
            />
            <Bar dataKey="revenue_billion" radius={[4, 4, 0, 0]} fill="#F33283" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
