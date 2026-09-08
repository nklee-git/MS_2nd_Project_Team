import { useMemo, useState } from "react";
import { CalendarRange, Target, Gauge } from "lucide-react";
import SummaryCard from "../ui/SummaryCard";
import ForecastLineChart from "./ForecastLineChart";
import CategoryErrorChart from "./CategoryErrorChart";
import SkuErrorTable from "./SkuErrorTable";
import { FORECAST_SERIES, FORECAST_SUMMARY } from "../../data/mockData";

const PRESETS = [
  { id: "7d", label: "최근 7일" },
  { id: "all", label: "전체 held-out 기간" },
];

export default function ForecastView() {
  const [preset, setPreset] = useState("all");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedSku, setSelectedSku] = useState(null);

  const data = useMemo(() => {
    if (customRange.start && customRange.end) {
      return FORECAST_SERIES.filter((row) => row.date >= customRange.start && row.date <= customRange.end);
    }
    if (preset === "7d") return FORECAST_SERIES.slice(-7);
    return FORECAST_SERIES;
  }, [preset, customRange]);

  const achievementRate = Math.min(
    100,
    Math.round((FORECAST_SUMMARY.target_mape / FORECAST_SUMMARY.mape) * 1000) / 10
  );

  const handlePreset = (id) => {
    setPreset(id);
    setCustomRange({ start: "", end: "" });
  };

  const handleCustomRange = (patch) => {
    setCustomRange((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="검증 기간"
          value={`${FORECAST_SUMMARY.validation_start.slice(5)} ~ ${FORECAST_SUMMARY.validation_end.slice(5)}`}
          icon={CalendarRange}
        />
        <SummaryCard label="평균 오차율 (MAPE)" value={FORECAST_SUMMARY.mape} unit="%" icon={Gauge} />
        <SummaryCard
          label="목표 정확도 대비 달성률"
          value={achievementRate}
          unit="%"
          tone={achievementRate >= 100 ? "good" : "neutral"}
          caption={`목표 MAPE ${FORECAST_SUMMARY.target_mape}% 기준`}
          icon={Target}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg bg-[#F2F4F7] p-1 w-fit">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePreset(p.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                preset === p.id && !customRange.start
                  ? "bg-white text-[var(--color-text)] shadow-sm"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
          <input
            type="date"
            value={customRange.start}
            min={FORECAST_SUMMARY.validation_start}
            max={FORECAST_SUMMARY.validation_end}
            onChange={(e) => handleCustomRange({ start: e.target.value })}
            className="rounded-md border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm text-[var(--color-text)]"
          />
          <span>~</span>
          <input
            type="date"
            value={customRange.end}
            min={FORECAST_SUMMARY.validation_start}
            max={FORECAST_SUMMARY.validation_end}
            onChange={(e) => handleCustomRange({ end: e.target.value })}
            className="rounded-md border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm text-[var(--color-text)]"
          />
        </div>
      </div>

      <ForecastLineChart
        data={data}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        selectedSku={selectedSku}
        onClearSku={() => setSelectedSku(null)}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CategoryErrorChart />
        <div className="lg:col-span-1">
          <SkuErrorTable selectedSku={selectedSku} onRowClick={setSelectedSku} />
        </div>
      </div>
    </div>
  );
}
