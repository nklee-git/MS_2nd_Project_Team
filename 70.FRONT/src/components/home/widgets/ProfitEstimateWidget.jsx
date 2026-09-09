import StatRow from "../StatRow";
import { MONTHLY_REVENUE, PROFIT_MODEL } from "../../../data/mockData";
import { formatNumber } from "../../../utils/format";

const latest = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1];
const costRatio = PROFIT_MODEL.cogs_ratio + PROFIT_MODEL.marketing_ratio + PROFIT_MODEL.channel_commission_ratio;
const estimatedProfit = Math.round(latest.revenue * PROFIT_MODEL.estimated_margin_ratio);

export default function ProfitEstimateWidget() {
  return (
    <div>
      <StatRow
        items={[
          {
            label: `추정 순이익 (${latest.month})`,
            value: `${(estimatedProfit / 100000000).toFixed(1)}`,
            unit: "억원",
          },
          { label: "추정 이익률", value: (PROFIT_MODEL.estimated_margin_ratio * 100).toFixed(0), unit: "%" },
          { label: "매출 원본", value: formatNumber(latest.revenue), unit: "원" },
        ]}
      />
      <p className="mt-3 text-[11px] text-[var(--color-text-faint)]">
        원가 {(PROFIT_MODEL.cogs_ratio * 100).toFixed(0)}% + 마케팅비{" "}
        {(PROFIT_MODEL.marketing_ratio * 100).toFixed(0)}% + 채널수수료{" "}
        {(PROFIT_MODEL.channel_commission_ratio * 100).toFixed(0)}% = 비용 {(costRatio * 100).toFixed(0)}%
        (43. Revenue & Cost Structure 기준)
      </p>
    </div>
  );
}
