import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ENRICHED_SKUS, CATEGORIES } from "../../../data/mockData";

const DATA = CATEGORIES.map(({ code }) => ({
  category: code,
  qty: ENRICHED_SKUS.filter((s) => s.category_code === code).reduce((sum, s) => sum + s.available_qty, 0),
}));

export default function CategoryInventoryWidget() {
  return (
    <div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(0,0,0,0.08)" vertical={false} />
            <XAxis dataKey="category" tick={{ fontSize: 11, fill: "rgba(0,0,0,0.45)" }} axisLine={{ stroke: "rgba(0,0,0,0.15)" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "rgba(0,0,0,0.45)" }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.15)" }}
              formatter={(v) => [v.toLocaleString("ko-KR"), "가용 재고"]}
            />
            <Bar dataKey="qty" radius={[4, 4, 0, 0]} fill="#F33283" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[11px] text-[var(--color-text-faint)]">
        허브/창고별 재고는 현재 스키마에 없음(SKU 단일 재고 스냅샷) — 카테고리 단위로 대체.
      </p>
    </div>
  );
}
