namespace FashionAiDashboard.Data;

/// <summary>
/// React mockData.js의 mulberry32 시드 PRNG를 그대로 이식 — 같은 시드(20260820)를
/// 쓰면 두 구현이 같은 값을 내진 않지만(구현 언어가 다르니 굳이 bit-identical일
/// 필요는 없음), reload/재시작해도 값이 안 바뀌는 안정성만 유지하면 됨.
/// </summary>
public sealed class Mulberry32
{
    private uint _state;

    public Mulberry32(uint seed) => _state = seed;

    public double NextDouble()
    {
        unchecked
        {
            _state += 0x6D2B79F5u;
            uint z = _state;
            uint t = (z ^ (z >> 15)) * (1u | z);
            t += (t ^ (t >> 7)) * (61u | t);
            return (t ^ (t >> 14)) / 4294967296.0;
        }
    }

    /// <summary>min~max 양끝 포함 정수 (React의 int(min,max)와 동일)</summary>
    public int NextInt(int min, int max) => (int)Math.Floor(min + NextDouble() * (max - min + 1));
}
