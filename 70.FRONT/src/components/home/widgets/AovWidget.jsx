import StatRow from "../StatRow";
import { MONTHLY_REVENUE } from "../../../data/mockData";
import { formatNumber } from "../../../utils/format";

const latest = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1];
const prev = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 2];

const latestAov = Math.round(latest.revenue / latest.order_count);
const prevAov = Math.round(prev.revenue / prev.order_count);
const aovChangePct = Math.round(((latestAov - prevAov) / prevAov) * 1000) / 10;

const last6 = MONTHLY_REVENUE.slice(-6);
const avgAov6 =
  last6.reduce((sum, m) => sum + m.revenue / m.order_count, 0) / last6.length;

export default function AovWidget() {
  return (
    <StatRow
      items={[
        { label: `객단가 (${latest.month})`, value: formatNumber(latestAov), unit: "원" },
        {
          label: "전월 대비",
          value: `${aovChangePct > 0 ? "+" : ""}${aovChangePct}`,
          unit: "%",
          tone: aovChangePct >= 0 ? "good" : "bad",
        },
        { label: "최근 6개월 평균", value: formatNumber(Math.round(avgAov6)), unit: "원" },
      ]}
    />
  );
}
