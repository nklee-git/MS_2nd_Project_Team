import KpiWidget from "../components/home/widgets/KpiWidget";
import TopRiskWidget from "../components/home/widgets/TopRiskWidget";
import ForecastMiniWidget from "../components/home/widgets/ForecastMiniWidget";
import CategoryErrorMiniWidget from "../components/home/widgets/CategoryErrorMiniWidget";
import TierSalesWidget from "../components/home/widgets/TierSalesWidget";
import RecentActivityWidget from "../components/home/widgets/RecentActivityWidget";

// Registry for the 홈 탭의 위젯 카드형 대시보드. `span` controls how many of
// the grid's 4 columns (lg breakpoint) a widget occupies; order/visibility
// are user-controlled state, persisted separately in HomeView.
export const WIDGET_REGISTRY = [
  {
    id: "kpi",
    title: "발주추천 현황",
    description: "대기·승인·반려 현황 한눈에 보기",
    span: "lg:col-span-4",
    Component: KpiWidget,
  },
  {
    id: "topRisk",
    title: "위험도 상위 SKU",
    description: "risk_score 기준 상위 5개",
    span: "lg:col-span-2",
    Component: TopRiskWidget,
  },
  {
    id: "forecastMini",
    title: "예측 정확도",
    description: "held-out 구간 MAPE 요약",
    span: "lg:col-span-2",
    Component: ForecastMiniWidget,
  },
  {
    id: "categoryError",
    title: "카테고리별 오차율",
    description: "MAPE, 아우터가 가장 큼",
    span: "lg:col-span-2",
    Component: CategoryErrorMiniWidget,
  },
  {
    id: "tierSales",
    title: "인기도 티어별 평균 판매량",
    description: "HERO / STEADY / NICHE",
    span: "lg:col-span-2",
    Component: TierSalesWidget,
  },
  {
    id: "recentActivity",
    title: "최근 처리 내역",
    description: "승인·반려 처리된 최근 항목",
    span: "lg:col-span-4",
    Component: RecentActivityWidget,
  },
];

export const DEFAULT_WIDGET_ORDER = WIDGET_REGISTRY.map((w) => w.id);
