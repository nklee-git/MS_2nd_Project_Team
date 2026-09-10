namespace FashionAiDashboard.Data;

/// <summary>
/// 최소 RFC4180 대응 CSV 파서. nqnq 카탈로그의 body_tone_code처럼
/// 따옴표로 감싼 콤마 포함 필드(예: "STR,WAV,NAT")가 있어서 단순 split(',')로는
/// 컬럼이 밀림 — 따옴표 안의 콤마는 무시하고 분리한다.
/// </summary>
public static class CsvReader
{
    public static List<Dictionary<string, string>> Read(string path)
    {
        var text = File.ReadAllText(path).TrimStart('﻿').Trim();
        var lines = text.Split('\n').Select(l => l.TrimEnd('\r')).ToArray();
        var headers = SplitLine(lines[0]);

        var rows = new List<Dictionary<string, string>>();
        for (int i = 1; i < lines.Length; i++)
        {
            if (string.IsNullOrWhiteSpace(lines[i])) continue;
            var cells = SplitLine(lines[i]);
            var row = new Dictionary<string, string>();
            for (int h = 0; h < headers.Count; h++)
            {
                row[headers[h]] = h < cells.Count ? cells[h] : "";
            }
            rows.Add(row);
        }
        return rows;
    }

    private static List<string> SplitLine(string line)
    {
        var cells = new List<string>();
        var current = new System.Text.StringBuilder();
        bool inQuotes = false;

        for (int i = 0; i < line.Length; i++)
        {
            char c = line[i];
            if (inQuotes)
            {
                if (c == '"')
                {
                    if (i + 1 < line.Length && line[i + 1] == '"') { current.Append('"'); i++; }
                    else inQuotes = false;
                }
                else current.Append(c);
            }
            else
            {
                if (c == '"') inQuotes = true;
                else if (c == ',') { cells.Add(current.ToString().Trim()); current.Clear(); }
                else current.Append(c);
            }
        }
        cells.Add(current.ToString().Trim());
        return cells;
    }

    public static int ToInt(this Dictionary<string, string> row, string key, int fallback = 0)
        => int.TryParse(row.GetValueOrDefault(key), out var v) ? v : fallback;

    public static double ToDouble(this Dictionary<string, string> row, string key, double fallback = 0)
        => double.TryParse(row.GetValueOrDefault(key), out var v) ? v : fallback;

    public static string ToStr(this Dictionary<string, string> row, string key)
        => row.GetValueOrDefault(key, "");
}
