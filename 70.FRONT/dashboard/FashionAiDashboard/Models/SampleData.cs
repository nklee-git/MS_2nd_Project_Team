namespace FashionAiDashboard.Models;

/// <summary>products x sku_master x inventory_snapshot x popularity_tier_performance 조인 결과 (React ENRICHED_SKUS 대응)</summary>
public class EnrichedSku
{
    public string SkuCode { get; set; } = "";
    public string ProductId { get; set; } = "";
    public string StyleName { get; set; } = "";
    public string CategoryCode { get; set; } = "";
    public string BodyToneCode { get; set; } = "";
    public string PopularityTier { get; set; } = "";
    public string LineType { get; set; } = "";
    public string Size { get; set; } = "";
    public string ColorCode { get; set; } = "";
    public int Price { get; set; }
    public int Cost { get; set; }
    public int AvailableQty { get; set; }
    public int ReservedQty { get; set; }
    public int SafetyStock { get; set; }
    public int ReorderPoint { get; set; }
    public double AnnualSoldUnits { get; set; }
}

/// <summary>Dataverse ReorderRecommendation 테이블 스키마(21.Appservice Core model 1-1절)를 그대로 따르는 mock 레코드 (React REORDER_RECOMMENDATIONS 대응)</summary>
public class ReorderRecommendation
{
    public string Id { get; set; } = "";
    public string SkuCode { get; set; } = "";
    public string StyleName { get; set; } = "";
    public string CategoryCode { get; set; } = "";
    public string ColorCode { get; set; } = "";
    public string Size { get; set; } = "";
    public string PopularityTier { get; set; } = "";
    public double RiskScore { get; set; }
    public double StockoutUrgency { get; set; }
    public double PopularityWeight { get; set; }
    public int PredictedDemand { get; set; }
    public int RecommendedQty { get; set; }
    public string Status { get; set; } = ""; // Pending | Approved | Rejected
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ApprovedBy { get; set; }
    public string? RejectionReason { get; set; }
    public int AvailableQty { get; set; }
    public int ReservedQty { get; set; }
    public int SafetyStock { get; set; }
    public int ReorderPoint { get; set; }
    public List<int> SalesTrend { get; set; } = new();
}

/// <summary>React CATEGORIES 대응</summary>
public record CategoryInfo(string Code, string Label);

/// <summary>예측대조 뷰의 일별 카테고리 합계 (React FORECAST_SERIES 한 행 대응)</summary>
public class ForecastDay
{
    public string Date { get; set; } = "";
    public Dictionary<string, int> ActualByCategory { get; set; } = new();
    public Dictionary<string, int> PredictedByCategory { get; set; } = new();
    public int ActualTotal { get; set; }
    public int PredictedTotal { get; set; }
}

/// <summary>React CATEGORY_ERROR_RATES 대응</summary>
public class CategoryErrorRate
{
    public string CategoryCode { get; set; } = "";
    public string CategoryLabel { get; set; } = "";
    public double Mape { get; set; }
}

/// <summary>React FORECAST_SUMMARY 대응</summary>
public class ForecastSummary
{
    public string ValidationStart { get; set; } = "";
    public string ValidationEnd { get; set; } = "";
    public double Mape { get; set; }
    public double TargetMape { get; set; }
}

/// <summary>React SKU_ERRORS 대응</summary>
public class SkuError
{
    public string SkuCode { get; set; } = "";
    public string StyleName { get; set; } = "";
    public string CategoryCode { get; set; } = "";
    public int PredictedTotal { get; set; }
    public int ActualTotal { get; set; }
    public double Mape { get; set; }
}

/// <summary>React SKU_DAILY_SERIES 한 시점 대응</summary>
public record SkuDailyPoint(string Date, int SkuActual, int SkuPredicted);

/// <summary>monthly_revenue_summary.csv 한 행 (React MONTHLY_REVENUE 대응)</summary>
public class MonthlyRevenue
{
    public string Month { get; set; } = "";
    public int OrderCount { get; set; }
    public long Revenue { get; set; }
    public double RevenueBillion { get; set; }
}

/// <summary>trend_capsule_performance.csv 한 행 (React TREND_CAPSULES 대응)</summary>
public class TrendCapsule
{
    public string StyleName { get; set; } = "";
    public string Status { get; set; } = "";
    public string LaunchDate { get; set; } = "";
    public int SoldUnits { get; set; }
    public long Revenue { get; set; }
}

/// <summary>popularity_tier_performance.csv 기반 베스트셀러 (React BEST_SELLERS 대응)</summary>
public class BestSeller
{
    public string StyleName { get; set; } = "";
    public string CategoryCode { get; set; } = "";
    public string PopularityTier { get; set; } = "";
    public int SoldUnits { get; set; }
}

/// <summary>returns_sample.csv 기반 반품 사유 분포 (React RETURN_REASON_BREAKDOWN 대응)</summary>
public class ReturnReasonStat
{
    public string Code { get; set; } = "";
    public string Label { get; set; } = "";
    public int Count { get; set; }
    public double Pct { get; set; }
}

/// <summary>orders_sample.csv 기반 채널별 매출 (표본 500건 집계)</summary>
public class ChannelRevenue
{
    public string ChannelId { get; set; } = "";
    public int OrderCount { get; set; }
    public long Revenue { get; set; }
}

/// <summary>데이터조회 뷰의 질문 칩 결과 (React QUERY_CHIPS 대응)</summary>
public class QueryChip
{
    public string Id { get; set; } = "";
    public string Label { get; set; } = "";
    public string Type { get; set; } = ""; // bar | table
    public List<(string Category, double Value)> BarResult { get; set; } = new();
}

/// <summary>버전 기록 한 항목 (React CHANGELOG 대응)</summary>
public class ChangelogEntry
{
    public string Version { get; set; } = "";
    public string Date { get; set; } = "";
    public List<string> Changes { get; set; } = new();
}
