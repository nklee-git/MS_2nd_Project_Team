using Microsoft.AspNetCore.Mvc;
using FashionAiDashboard.Models;

namespace FashionAiDashboard.Controllers;

public class ChangelogController : Controller
{
    // React src/data/changelog.js 이식 + ASP.NET Core 전환 이후 이력 추가
    private static readonly List<ChangelogEntry> Entries = new()
    {
        new ChangelogEntry
        {
            Version = "0.4.0",
            Date = "2026-09-10",
            Changes = new()
            {
                "프론트를 React → ASP.NET Core MVC/Razor Pages로 전환 (팀 결정)",
                "SampleDataService 신규 — 30.DATA/32.nqnq_data 실 카탈로그 CSV 파싱·조인, mulberry32 시드 PRNG로 mockData.js 로직 이식",
                "승인이력: 상태/카테고리/인기도 필터 + SKU 검색 + 페이지네이션 + 상세 드로어(재고·risk_score 근거·14일 스파크라인) + 실제 승인/반려 처리",
                "예측대조: 실측 vs 예측 라인차트, 카테고리별 MAPE 바차트, SKU별 오차 테이블",
                "데이터 조회: 질문 칩 4종(위험 SKU·채널별 매출·티어별 예측수요·반품 사유) + CSV 다운로드",
                "협업 허브: 멘션함/태스크함/알림함 3탭 레이아웃 뼈대",
                "홈: 위젯 6종(베스트셀러·카테고리별 재고위험·트렌드캡슐·반품사유·매출추이) 추가",
                "generate_v4.py 재실행 — 2026.09 체형태그·사이즈 개편판(41상품·520SKU) 데이터로 갱신",
            },
        },
        new ChangelogEntry
        {
            Version = "0.3.0",
            Date = "2026-09-09",
            Changes = new()
            {
                "홈 탭 추가 — 위젯 카드형 모듈형 대시보드(추가/제거/드래그 순서변경, 로컬 저장), 총 17종",
                "위젯 초기 6종: 발주추천 현황, 위험도 상위 SKU, 예측 정확도, 카테고리별 오차율, 인기도 티어별 평균 판매량, 최근 처리 내역",
                "위젯 판매 KPI 10종: 핵심 판매 KPI(44. KPI Definitions 9종), 연간 매출 목표 달성률, 객단가, 매출 성장률, 실수익 예상, 재고 위험 알람, 카테고리별 재고 수량, 베스트셀러 스타일, 트렌드캡슐 현황, 반품 사유 분포",
                "위젯 협업 요약 1종: 오늘의 협업 요약(전 역할 공통)",
                "컬러 팔레트 개편 — 지그재그 브랜드 핑크 계열로 전면 교체",
                "이해관계자 협업 대시보드 확장 Must 티어 — 사이드바 역할 전환 스위처 + 역할별 위젯·메뉴 필터링",
                "협업 허브 신규 탭 — 멘션함/태스크함/알림함 레이아웃 뼈대",
                "해시태그 칩 5종 — 승인이력 반려 사유 입력에 적용",
            },
        },
        new ChangelogEntry
        {
            Version = "0.2.0",
            Date = "2026-09-08",
            Changes = new()
            {
                "레이아웃을 상단 탭에서 좌측 사이드바 구조로 변경",
                "폰트를 시스템 폰트에서 Pretendard로 교체",
                "예측대조 뷰에 커스텀 날짜 범위 선택 추가",
                "SKU별 오차 상세 테이블 행 클릭 시 메인 차트에 해당 SKU 하이라이트",
                "버전 기록 화면 추가",
            },
        },
        new ChangelogEntry
        {
            Version = "0.1.0",
            Date = "2026-09-07",
            Changes = new()
            {
                "초기 스캘레톤 구성",
                "승인이력 뷰: 요약카드·필터·테이블·상세 드로어",
                "예측대조 뷰: 요약카드·기간 프리셋·예측-실측 라인차트·카테고리별 오차율·SKU별 오차 테이블",
                "데이터 조회 뷰(Should): 질문 칩 4종 + CSV 다운로드",
            },
        },
    };

    public IActionResult Index()
    {
        return View(Entries);
    }
}
