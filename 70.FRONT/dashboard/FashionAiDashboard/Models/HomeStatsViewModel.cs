namespace FashionAiDashboard.Models;

public class StatCard
{
    public string Label { get; set; } = "";
    public string Value { get; set; } = "";
    public string? Unit { get; set; }
    public string? Caption { get; set; }
    public string Tone { get; set; } = "neutral"; // neutral | good | bad
}

public class HomeStatsViewModel
{
    public List<StatCard> KpiCards { get; set; } = new();
}
