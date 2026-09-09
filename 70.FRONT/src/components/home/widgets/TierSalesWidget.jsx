import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { REORDER_RECOMMENDATIONS, POPULARITY_TIERS } from "../../../data/mockData";

const DATA = POPULARITY_TIERS.map((tier) => {
  const rows = REORDER_RECOMMENDATIONS.filter((r) => r.popularity_tier === tier);
  const avg = rows.length === 0 ? 0 : rows.reduce((s, r) => s + r.predicted_demand, 0) / rows.length;
  return { tier, value: Math.round(avg * 10) / 10 };
});

export default function TierSalesWidget() {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(0,0,0,0.08)" vertical={false} />
          <XAxis dataKey="tier" tick={{ fontSize: 11, fill: "rgba(0,0,0,0.45)" }} axisLine={{ stroke: "rgba(0,0,0,0.15)" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "rgba(0,0,0,0.45)" }} axisLine={false} tickLine={false} width={32} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.15)" }}
            formatter={(v) => [v, "4주 예측수요 평균"]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#F33283" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
