namespace FashionAiDashboard.Models;

public class ApprovalsViewModel
{
    public List<ReorderRecommendation> Rows { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);

    // 필터 현재값 (뷰에서 select/input 상태 복원용)
    public string? Status { get; set; }
    public string? Category { get; set; }
    public string? Tier { get; set; }
    public string? Q { get; set; }

    // 요약 카드
    public int PendingCount { get; set; }
    public int ApprovedCount { get; set; }
    public int RejectedCount { get; set; }
}
