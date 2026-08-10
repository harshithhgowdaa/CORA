# CORA production setup

## Local development

1. Copy `.env.local.example` to `.env.local` and fill in the Supabase URL, anon key, and server-only service-role key.
2. Enable Google provider in Supabase Auth and configure the callback URL `/auth/callback` on the deployed origin.
3. Only `@rvu.edu.in` addresses can create access requests. Requests are approved from Profile by the administrator. The administrator can assign officer/manager/admin roles or disable access.
4. Apply migrations with `supabase db push` or run the SQL files in order in the Supabase SQL editor.
5. Start the app with `npm run dev`.
6. Run `npm run lint`, `npx tsc --noEmit`, and `npm test` before deployment.

## Roles

| Role | Read | Write | Assign ownership | Analytics/export | User administration |
| --- | --- | --- | --- | --- | --- |
| Admin | Yes | Yes | Yes | Yes | Yes |
| Manager | Yes | Yes | Yes | Yes | No |
| Officer | Yes | Yes | No | Own exports | No |
| Student Assistant | Yes | Limited CRM | No | No | No |
| Read Only | Yes | No | No | No | No |

RLS is the final tenant boundary. Every action authenticates and checks authorization independently of UI visibility.

## Import and export

Company CSV imports require a `name` header and support `industry`, `status`, `website`, and `notes`. Imports are validated server-side and tenant-scoped. Exports are available at `/api/reports/export?entity=companies` for authorized users; supported entities are `companies`, `contacts`, `interactions`, `follow_ups`, `opportunities`, and `ownership`.

The free-tier implementation emits CSV. XLSX/PDF generation is intentionally not enabled until a dependency can be approved and installed in the deployment environment.

## Operations and security

- Rotate any credentials that were ever present in `.env.local.example` before deployment.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code.
- Set a stable `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` for multi-instance deployments.
- Enable Supabase database backups and review `audit_logs` regularly.
- Configure private Supabase Storage buckets and signed URLs before enabling attachments.
- Configure Google Workspace OAuth in Supabase Auth and restrict CRM access through the `access_requests` approval workflow.

## Phase 1 boundaries

Alumni and semantic search remain isolated legacy functionality. Email/calendar synchronization, mobile applications, AI features, relationship scoring, PDF exports, and external reminder delivery remain outside this free-tier Phase 1 implementation.
