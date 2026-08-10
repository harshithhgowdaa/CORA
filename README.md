# CORA CRM Core

CORA is a multi-tenant Corporate & Alumni Relations CRM built with Next.js 16 and Supabase. It manages companies, ownership, contacts, interactions, follow-ups, opportunities, dashboards, search, audit history, and CSV reporting.

See [docs/production.md](docs/production.md) for setup, deployment, permissions, imports/exports, and security operations.

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npx tsc --noEmit
npm test
```
