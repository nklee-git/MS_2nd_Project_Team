# 50.DATABRICKS

ML·모델링 롤 실행 폴더. Databricks 노트북(피처 엔지니어링~학습), risk_score 계산 로직, 예측-실측 오차율 스크립트를 여기 담습니다.

## 참고 문서 (2026-09-10 보강 — Dataverse 적재 대기 중 자료조사용)

### risk_score / 스코어링 공식 — 제일 먼저 볼 것
- [[23. Alert & Trigger Rules]] — risk_score 산출 공식(재고소진임박도 × 인기도가중치)의 SSOT. "학술적 근거" 절에 안전재고/재주문점 이론 참고문헌도 있음
- ⚠️ [[작업지시서 (최민 — 데이터·인프라)]] 6-2절 — 위 공식과 현재 대시보드 구현이 서로 다르다는 걸 발견해서 적어둔 부분. 실제 구현 시 어느 쪽으로 통일할지 결정 필요

### Databricks 착수 전 필수
- [[22. Cost Plan]] — 클러스터 소형 구성 + 짧은 자동종료(15~30분) 필수, Burn Rate 알림 2단계. 클러스터 켜기 전에 꼭 한 번 볼 것

### 피처 엔지니어링 — 실제 데이터 로직 참고
- `30.DATA/32. nqnq_data/generate_v4.py` — reorder_point/par_level/safety_stock 공식, SKU 선택 가중치(날씨×사이즈×인기도 티어), 카테고리별 반품율 등 원본 로직
- [[71. Entity Definitions & Data Dictionary]] — 전체 테이블 스키마, 재고정책 공식
- [[74. Real-World Data Grounding (Weather & Body)]] — 계절/체형 민감도 계수 근거자료
- `30.DATA/32. nqnq_data/README.md` — 지금 데이터 규모 확인용

### RAG 자동발주 프로토타입 (임현제 제안 아이디어)
- [[01. 1차 화상회의록]] 1부 — 본인이 제안한 원안("과거 최적값 기반 발주, 발주이력 데이터 없어서 임의생성 필요")
- [[14. 1차 프로젝트 대비 차별화 아이디어]] 논의 5(GenAI 활용처)·6(24절기 계절 ML)·8(K3 Ratio Curves)

### GenAI 예측근거 자연어 설명 (2026-09-10 채택)
- [[21. Appservice Core model]] 7절 — ReAct 축소판 파이프라인(탐색→생성→검증) 기술 설계 초안, Structured Output 스키마까지 제안돼있음

### 2026-09-10 새로 결정된 것
- [[02. 9-10 타운홀 회의록]] C·D·F절 — recommended_qty(재발주는 SKU 독립계산·판매현황 기반, 신규출시만 K3 비율배분), 예측대조 데이터 저장방식(미정, 작업하면서 판단), GenAI 예측근거 설명 채택

### 기타
- [[24. 기능명세서 v1]] — Databricks가 기술 핵심, 예측 결과를 Dataverse에 직접 적재
- [[26. 대시보드 기술명세 (프론트)]] 2절·5절 — 예측대조 뷰가 필요로 하는 데이터 형태(예측치 vs held-out 실측치)
- [[28. Dataverse 가이드 — 이 프로젝트에서 어떻게 쓰이는가]] — ML 결과가 어떤 필드 형태로 Dataverse에 적재되는지
