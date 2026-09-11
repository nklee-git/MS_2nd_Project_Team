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
- ~~`generate_v4.py`의 `TODAY` 상수가 8/9로 돼 있는데, [[16. PPT plan]] 설계 원리는 컷오프를 8/20으로 고정~~ → **해결됨(아래 참고)**
- 파일 맨 위에 라이브 데모용 SKU 사전 시딩 설계(주인공 SKU `NQ-TOP-001-M-BLK`, 강제 트리거 제안)도 같이 적어둠

## 📌 2026-09-11 추가 — Dataverse 적재용 CSV 및 최민님이 별도로 만드신 CSV/다이어그램 검토

최민님이 공유해주신 CSV 17개 + `정규화(1) 다이어그램.html`을 점검한 결과, 위 실시간 엔진 리뷰와 별개로:
- 그 다이어그램이 이번 세션 초반에 검토했던 "최종 정규화 버전" ERD와 동일 — `PRODUCT.body_tone_code`, `INVENTORY.safety_stock`/`reorder_point`가 스키마에 없어서, **재고 리오더포인트 알림(코어 MVP)의 판단 근거를 어디서 계산할지가 아직 안 정해짐**. `velocity`(SKU당 판매속도)는 `인기도등급실적v1.csv`에서, `lead_time_days`는 `제조공장v1.csv`에서 유도 가능 — 최민/임현제 중 누가 이 계산을 맡을지 확인 필요
- 판매채널 모델(ZIGZAG 21%/에이블리 24%/무신사 30%/자사몰 3.5%/스마트스토어 5.8%)이 팀 문서([[42. Channel & Settlement Terms]])와 다름 — 최민님이 재작업 예정이라고 확인됨

**대신 `nqnq.db`(공식 전체 버전)를 재생성해서 CSV로 뽑아뒀습니다** — 이쪽이 스키마상 더 완전합니다(`body_tone_code`/`safety_stock`/`reorder_point` 전부 포함):
- `generate_v4.py`/`generate_v4_miss.py`의 `TODAY` 상수를 8/9 → **8/20**으로 수정([[16. PPT plan]] 설계 원리와 일치), `nqnq.db` 재생성 완료
- `add_wholesale.py` 재실행 — `channel` 테이블에 WHOLESALE 행 정상 반영, 홀세일 파트너 8곳 주문 40건 추가
- **`dataverse_import/`** 폴더에 14개 엔터티 전체 CSV 생성(신규 `export_for_dataverse.py`) — category/product/sku/factory/channel/store/inventory/purchase_order/po_item은 전체, orders(2000건 샘플)·order_item(그 주문에 속한 품목 전부)·customer(그 주문의 고객만)는 서로 참조무결성 맞춰서 추출, return_request/inventory_ledger는 독립 500/2000건 샘플(다른 테이블과 참조무결성 안 맞을 수 있음)
- ⚠️ 이 재생성으로 **컷오프가 8/9→8/20으로, 전체 주문 수가 ~120만→~124만 건으로 바뀌었습니다** — 임현제님 ML 학습 데이터 범위에 영향 있을 수 있어 공유 필요

관련 문서 반영: [[16. PPT plan]] · [[21. Appservice Core model]] · [[23. Alert & Trigger Rules]] · [[71. Entity Definitions & Data Dictionary]] · [[72. Entity Relationship Diagram]] · [[42. Channel & Settlement Terms]] · [[14. 1차 프로젝트 대비 차별화 아이디어]] · [[28. Dataverse 가이드 — 이 프로젝트에서 어떻게 쓰이는가]]
