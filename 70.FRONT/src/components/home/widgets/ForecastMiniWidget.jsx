import StatRow from "../StatRow";
import { FORECAST_SUMMARY } from "../../../data/mockData";

export default function ForecastMiniWidget() {
  const achievementRate = Math.min(
    100,
    Math.round((FORECAST_SUMMARY.target_mape / FORECAST_SUMMARY.mape) * 1000) / 10
  );

  return (
    <StatRow
      items={[
        {
          label: "검증 기간",
          value: `${FORECAST_SUMMARY.validation_start.slice(5)} ~ ${FORECAST_SUMMARY.validation_end.slice(5)}`,
        },
        { label: "평균 오차율 (MAPE)", value: FORECAST_SUMMARY.mape, unit: "%" },
        {
          label: "목표 달성률",
          value: achievementRate,
          unit: "%",
          tone: achievementRate >= 100 ? "good" : "neutral",
          caption: `목표 ${FORECAST_SUMMARY.target_mape}%`,
        },
      ]}
    />
  );
}
