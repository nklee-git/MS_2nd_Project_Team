using Microsoft.AspNetCore.Mvc;

namespace FashionAiDashboard.Controllers;

public record CollabExample(string Entity, string From, string Text, string Time);

public class CollabController : Controller
{
    // 27. 이해관계자 협업 대시보드 UX-UI 기능명세서 3-3절 — MENTION/TASK/ALERT_LOG 엔티티가
    // 아직 없어 레이아웃 + 예시 1건만 제공 (React CollabHubView.jsx 그대로 이식)
    private static readonly Dictionary<string, CollabExample> Examples = new()
    {
        ["mention"] = new("MENTION", "이서연 (MD)",
            "\"@임재범 팀장님, [인생 슬랙스 Short-M] 직진배송 창고 입고 2일 지연되는데 메인 노출 일정 미룰까요?\" #생산지연",
            "5분 전"),
        ["task"] = new("TASK", "박지민 (Technical Designer)",
            "샘플수정요청 — 인생 슬랙스 Short 핏 조정 (SLA 3일)", "대기 · D-2"),
        ["alert"] = new("ALERT_LOG", "재고 리오더 트리거",
            "TRD-CLR-01-COOL-002-S-CRM 재발주점 이하 — 긴급", "1시간 전"),
    };

    public IActionResult Index(string tab = "mention")
    {
        if (!Examples.ContainsKey(tab)) tab = "mention";
        ViewBag.Tab = tab;
        ViewBag.Example = Examples[tab];
        return View();
    }
}
