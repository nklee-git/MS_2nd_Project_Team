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
