import KpiWidget from "../components/home/widgets/KpiWidget";
import TopRiskWidget from "../components/home/widgets/TopRiskWidget";
import ForecastMiniWidget from "../components/home/widgets/ForecastMiniWidget";
import CategoryErrorMiniWidget from "../components/home/widgets/CategoryErrorMiniWidget";
import TierSalesWidget from "../components/home/widgets/TierSalesWidget";
import RecentActivityWidget from "../components/home/widgets/RecentActivityWidget";
import AovWidget from "../components/home/widgets/AovWidget";
import GrowthWidget from "../components/home/widgets/GrowthWidget";
import ProfitEstimateWidget from "../components/home/widgets/ProfitEstimateWidget";
import ReturnReasonWidget from "../components/home/widgets/ReturnReasonWidget";
import BestSellerWidget from "../components/home/widgets/BestSellerWidget";
import CapsulePromoWidget from "../components/home/widgets/CapsulePromoWidget";
import StockAlertWidget from "../components/home/widgets/StockAlertWidget";
import CategoryInventoryWidget from "../components/home/widgets/CategoryInventoryWidget";
import SalesKpiTableWidget from "../components/home/widgets/SalesKpiTableWidget";
import SalesTargetWidget from "../components/home/widgets/SalesTargetWidget";
import CollabSummaryWidget from "../components/home/widgets/CollabSummaryWidget";

const ALL_ROLES = ["md", "designer", "marketer", "scm", "exec"];

// Registry for the 홈 탭의 위젯 카드형 대시보드. `span` controls how many of
// the grid's 4 columns (lg breakpoint) a widget occupies; order/visibility
// are user-controlled state, persisted separately in HomeView. `roles`는
// 27. 이해관계자 협업 대시보드 UX-UI 기능명세서 4-1절 태깅 — 문서에 명시된
// 9종은 그대로, 나머지(categoryError/tierSales/recentActivity/bestSeller/
// capsulePromo)는 문서에 없어 주제 유사성으로 판단.
export const WIDGET_REGISTRY = [
  {
    id: "collabSummary",
    title: "오늘의 협업 요약",
    description: "멘션·태스크 미리보기 (데모)",
    span: "lg:col-span-2",
    Component: CollabSummaryWidget,
    roles: ALL_ROLES,
  },
  {
    id: "salesKpi",
    title: "핵심 판매 KPI",
    description: "실무 판매지표 9종 (44. KPI Definitions 기준)",
    span: "lg:col-span-4",
    Component: SalesKpiTableWidget,
    roles: ["md", "exec"],
  },
  {
    id: "salesTarget",
    title: "연간 매출 목표 달성률",
    description: "Y1~Y3 목표 대비 실적",
    span: "lg:col-span-2",
    Component: SalesTargetWidget,
    roles: ["exec", "md"],
  },
  {
    id: "kpi",
    title: "발주추천 현황",
    description: "대기·승인·반려 현황 한눈에 보기",
    span: "lg:col-span-4",
    Component: KpiWidget,
    roles: ["md", "exec"],
  },
  {
    id: "topRisk",
    title: "위험도 상위 SKU",
    description: "risk_score 기준 상위 5개",
    span: "lg:col-span-2",
    Component: TopRiskWidget,
    roles: ["md", "exec"],
  },
  {
    id: "forecastMini",
    title: "예측 정확도",
    description: "held-out 구간 MAPE 요약",
    span: "lg:col-span-2",
    Component: ForecastMiniWidget,
    roles: ["md", "exec"],
  },
  {
    id: "categoryError",
    title: "카테고리별 오차율",
    description: "MAPE, 아우터가 가장 큼",
    span: "lg:col-span-2",
    Component: CategoryErrorMiniWidget,
    roles: ["md", "exec"],
  },
  {
    id: "tierSales",
    title: "인기도 티어별 평균 판매량",
    description: "HERO / STEADY / NICHE",
    span: "lg:col-span-2",
    Component: TierSalesWidget,
    roles: ["md", "exec"],
  },
  {
    id: "recentActivity",
    title: "최근 처리 내역",
    description: "승인·반려 처리된 최근 항목",
    span: "lg:col-span-4",
    Component: RecentActivityWidget,
    roles: ["md"],
  },
  {
    id: "stockAlert",
    title: "재고 위험 알람",
    description: "품절 임박 / 재주문 필요 SKU 건수",
    span: "lg:col-span-4",
    Component: StockAlertWidget,
    roles: ["md", "exec"],
  },
  {
    id: "aov",
    title: "객단가 (AOV)",
    description: "월별 매출 실데이터 기준",
    span: "lg:col-span-2",
    Component: AovWidget,
    roles: ["exec", "marketer"],
  },
  {
    id: "growth",
    title: "매출 성장률",
    description: "최근 12개월 매출 추이",
    span: "lg:col-span-2",
    Component: GrowthWidget,
    roles: ["exec", "marketer"],
  },
  {
    id: "profitEstimate",
    title: "실수익 예상",
    description: "원가·마케팅비·채널수수료 반영 추정치",
    span: "lg:col-span-2",
    Component: ProfitEstimateWidget,
    roles: ["exec", "marketer"],
  },
  {
    id: "categoryInventory",
    title: "카테고리별 재고 수량",
    description: "가용 재고 합계",
    span: "lg:col-span-2",
    Component: CategoryInventoryWidget,
    roles: ["scm", "md"],
  },
  {
    id: "bestSeller",
    title: "베스트셀러 스타일",
    description: "연간 실측 판매량 상위",
    span: "lg:col-span-2",
    Component: BestSellerWidget,
    roles: ["md", "designer", "marketer"],
  },
  {
    id: "capsulePromo",
    title: "트렌드캡슐 현황",
    description: "프로모션성 캡슐 컬렉션 실적",
    span: "lg:col-span-2",
    Component: CapsulePromoWidget,
    roles: ["marketer", "designer"],
  },
  {
    id: "returnReason",
    title: "반품 사유 분포",
    description: "고객 반응 대체 지표 (표본 500건)",
    span: "lg:col-span-2",
    Component: ReturnReasonWidget,
    roles: ["designer", "md"],
  },
];

export const DEFAULT_WIDGET_ORDER = WIDGET_REGISTRY.map((w) => w.id);
