using Microsoft.AspNetCore.Mvc;
using FashionAiDashboard.Models;
using FashionAiDashboard.Services;

namespace FashionAiDashboard.Controllers;

public class ApprovalsController : Controller
{
    private readonly SampleDataService _data;

    public ApprovalsController(SampleDataService data)
    {
        _data = data;
    }

    public IActionResult Index(string? status, string? category, string? tier, string? q, int page = 1)
    {
        var all = _data.ReorderRecommendations.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(status)) all = all.Where(r => r.Status == status);
        if (!string.IsNullOrWhiteSpace(category)) all = all.Where(r => r.CategoryCode == category);
        if (!string.IsNullOrWhiteSpace(tier)) all = all.Where(r => r.PopularityTier == tier);
        if (!string.IsNullOrWhiteSpace(q)) all = all.Where(r => r.SkuCode.Contains(q, StringComparison.OrdinalIgnoreCase) || r.StyleName.Contains(q, StringComparison.OrdinalIgnoreCase));

        var filtered = all.OrderByDescending(r => r.RiskScore).ToList();

        const int pageSize = 20;
        page = Math.Max(1, page);
        var rows = filtered.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        var model = new ApprovalsViewModel
        {
            Rows = rows,
            TotalCount = filtered.Count,
            Page = page,
            PageSize = pageSize,
            Status = status,
            Category = category,
            Tier = tier,
            Q = q,
            PendingCount = _data.ReorderRecommendations.Count(r => r.Status == "Pending"),
            ApprovedCount = _data.ReorderRecommendations.Count(r => r.Status == "Approved"),
            RejectedCount = _data.ReorderRecommendations.Count(r => r.Status == "Rejected"),
        };
        return View(model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult UpdateStatus(string id, string action, string? rejectionReason, string? rejectionReasonDetail,
        string? status, string? category, string? tier, string? q, int page = 1)
    {
        var newStatus = action == "approve" ? "Approved" : "Rejected";
        var combinedReason = string.IsNullOrWhiteSpace(rejectionReasonDetail)
            ? rejectionReason
            : $"{rejectionReason} — 직접입력: {rejectionReasonDetail.Trim()}";
        _data.UpdateStatus(id, newStatus, approvedBy: "nakyung.l@kakaostyle.com", combinedReason);

        return RedirectToAction(nameof(Index), new { status, category, tier, q, page });
    }
}
