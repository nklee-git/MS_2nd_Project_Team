// 27. 이해관계자 협업 대시보드 UX-UI 기능명세서 2절 — 역할 전환 스위처.
// 데모/프로토타입용 컨트롤(실제 배포 시 MSAL 로그인 계정에 고정된 역할로
// 대체 예정, 문서 2-1절 UX 노트 참고).
export const ROLES = [
  { id: "md", label: "MD" },
  { id: "designer", label: "디자이너" },
  { id: "marketer", label: "마케터" },
  { id: "scm", label: "SCM" },
  { id: "exec", label: "경영진" },
];

export const DEFAULT_ROLE = "md";
