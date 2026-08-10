# CORA MVP PRD

## Objective
Build CORA MVP: a multi-tenant CRM for university Corporate & Alumni Relations, covering company/alumni/contact management, interaction logging, full-text and semantic search, and a summary dashboard — deployed entirely on free-tier infrastructure, ready for a live pilot demo within 2–3 weeks.

## Global Rules
TypeScript strict mode everywhere; no any without an inline justification comment
Every tenant-scoped table must have RLS enabled before any endpoint using it is considered done — this is a hard gate, not a suggestion. A feature is not "complete" until a two-organization RLS test (see Acceptance Checklist) passes for it.
Never use the Supabase service-role key in client-facing code paths. It may only appear in trusted server-only contexts (e.g., the seed script).
Commit messages: type(scope): description (e.g., feat(alumni): add semantic search endpoint)
Branch strategy: main is always deployable; feature branches merged via PR (even solo, PRs create a review checkpoint and CI gate)
Every PR must pass lint + typecheck (GitHub Actions) before merge
No new paid service may be introduced without flagging it explicitly to the founder first — the free-tier constraint is a hard requirement, not a default
