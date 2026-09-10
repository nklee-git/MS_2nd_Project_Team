using Microsoft.AspNetCore.Mvc;
using FashionAiDashboard.Models;
using FashionAiDashboard.Services;

namespace FashionAiDashboard.Controllers;

public record CollabExample(string Entity, string From, string Text, string Time, string? RelatedSkuCode = null);
public record CollabReply(string From, string Text, string Time);

public class CollabController : Controller
{
    // 53. Virtual Team Profiles 3-4절 "Teams ↔ 협업허브 연동 프로세스" 반영 —
    // Teams 메시지가 들어오면 (1) 본문에서 SKU/발주추천을 자동 인식해 "관련 문서" 카드로 첨부하고
    // (2) 대시보드에서 쓴 답장이 다시 Teams 스레드로 나가는 흐름을 목업으로 시각화.
    // MENTION/TASK/ALERT_LOG 엔티티가 아직 없어 인메모리 예시 + 답장만 실제로 쌓이는 수준.
    private static readonly Dictionary<string, CollabExample> Examples = new()
    {
        ["mention"] = new("MENTION", "이나경 (MD)",
            "\"@임현제 AI예측모델리드님, [톤온톤 니트 셋업] 직진배송 창고 입고 2일 지연되는데 메인 노출 일정 미룰까요?\" #생산지연",
            "5분 전", RelatedSkuCode: "TRD-CLR-01-MUT-003-L-CRM"),
        ["task"] = new("TASK", "최민 (데이터·인프라)",
            "샘플수정요청 — 톤온톤 니트 셋업 핏 조정 (SLA 3일)", "대기 · D-2", RelatedSkuCode: "TRD-CLR-01-MUT-003-L-CRM"),
        ["alert"] = new("ALERT_LOG", "재고 리오더 트리거",
            "TRD-CLR-01-COOL-002-S-CRM 재발주점 이하 — 긴급", "1시간 전", RelatedSkuCode: "TRD-CLR-01-COOL-002-S-CRM"),
    };

    // 답장은 탭별로 인메모리에 쌓임(재시작하면 초기화) — 실제로는 3-4절 (3) 아웃바운드
    // 흐름을 타고 Power Automate가 Teams 스레드에 게시하는 자리.
    private static readonly Dictionary<string, List<CollabReply>> Replies = new()
    {
        ["mention"] = new(),
        ["task"] = new(),
        ["alert"] = new(),
    };

    private readonly SampleDataService _data;

    public CollabController(SampleDataService data)
    {
        _data = data;
    }

    public IActionResult Index(string tab = "mention")
    {
        if (!Examples.ContainsKey(tab)) tab = "mention";
        var example = Examples[tab];

        ViewBag.Tab = tab;
        ViewBag.Example = example;
        ViewBag.Replies = Replies[tab];
        ViewBag.RelatedRec = example.RelatedSkuCode != null
            ? _data.ReorderRecommendations.FirstOrDefault(r => r.SkuCode == example.RelatedSkuCode)
            : null;
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Reply(string tab, string text)
    {
        if (!Examples.ContainsKey(tab)) tab = "mention";
        if (!string.IsNullOrWhiteSpace(text))
        {
            Replies[tab].Add(new CollabReply("이나경 (MD)", text.Trim(), "방금"));
        }
        return RedirectToAction(nameof(Index), new { tab });
    }
}
