import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { CATEGORY_ERROR_RATES } from "../../../data/mockData";

export default function CategoryErrorMiniWidget() {
  const maxMape = Math.max(...CATEGORY_ERROR_RATES.map((c) => c.mape));

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={CATEGORY_ERROR_RATES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(0,0,0,0.08)" vertical={false} />
          <XAxis
            dataKey="category_code"
            tick={{ fontSize: 11, fill: "rgba(0,0,0,0.45)" }}
            axisLine={{ stroke: "rgba(0,0,0,0.15)" }}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: "rgba(0,0,0,0.45)" }} axisLine={false} tickLine={false} width={32} unit="%" />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.15)" }}
            formatter={(v) => [`${v}%`, "MAPE"]}
          />
          <Bar dataKey="mape" radius={[4, 4, 0, 0]}>
            {CATEGORY_ERROR_RATES.map((entry) => (
              <Cell key={entry.category_code} fill={entry.mape === maxMape ? "#F33283" : "#FFADD7"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
