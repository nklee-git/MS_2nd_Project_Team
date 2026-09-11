# 40.PIPELINE

데이터·인프라 롤 실행 폴더. Data Factory 파이프라인 코드, Dataverse 테이블 스키마 정의, Security Role 세팅 스크립트 등을 여기 담습니다.

## 참고 문서
- [[24. 기능명세서 v1]] 1-1·1-2절 — `ReorderRecommendation` 테이블 크로스커팅 계약, Security Role 2종
- [[03. WBS 상세 (기술 레이어별 일정표)]] — 데이터·인프라 작업 목록
- [[21. Appservice Core model]] — 전체 아키텍처에서 이 롤의 위치(Data Factory가 Databricks 오케스트레이션)

## 📋 작업지시서
- [[작업지시서 (최민 — 데이터·인프라)]] (2026-09-10) — 블로킹 결정 2건(백엔드 아키텍처, Dataverse 초대) + 스키마 확장 4개 항목 + Week1~3 작업 목록

## 📌 2026-09-11 전달사항 (최민님 확인 요청)

`실시간모델/최민_realtime_engine_리뷰.py` — 9월 held-out 실시간 데이터 생성 엔진 코드 리뷰. 코드는 한 줄도 안 고쳤고 주석만 추가함.

- **0순위**: 반품/QC 처리 로직 여러 줄에 `[span_N](start_span)` 같은 텍스트 조각이 실행 코드 사이에 섞여 있음 — 실행되면 그 지점에서 에러남. 원본 파일에도 있는지 확인 필요
- `_init_db()`가 PRODUCT/SKU/FACTORY/CHANNEL/STORE를 매번 DROP 후 자체 소형 카탈로그로 재생성 — `db_name`을 `nqnq.db`로 바꾸는 순간 기존 520개 SKU 카탈로그가 삭제됨
- SKU 코드 포맷·카테고리(3종)·원가율(30~35%)·채널/매장 ID가 `generate_v4.py` 공식 카탈로그와 다름
- 반품 사유(R01~R05) 분포와 채널 판정 로직이 공식 규칙과 다름(R05를 오프라인으로 태깅하는 부분은 방향이 반대로 보임)
- `generate_v4.py`의 `TODAY` 상수가 8/9로 돼 있는데, [[16. PPT plan]] 설계 원리는 컷오프를 8/20으로 고정 — 확인 필요
- 파일 맨 위에 라이브 데모용 SKU 사전 시딩 설계(주인공 SKU `NQ-TOP-001-M-BLK`, 강제 트리거 제안)도 같이 적어둠

관련 문서 반영: [[16. PPT plan]] · [[21. Appservice Core model]] · [[23. Alert & Trigger Rules]] · [[71. Entity Definitions & Data Dictionary]] · [[72. Entity Relationship Diagram]] · [[42. Channel & Settlement Terms]] · [[14. 1차 프로젝트 대비 차별화 아이디어]] · [[28. Dataverse 가이드 — 이 프로젝트에서 어떻게 쓰이는가]]
