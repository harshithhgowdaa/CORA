# CORA pre-launch security checklist

## Application checks

- [ ] Publish and review the [CORA Privacy Policy](/privacy) with RVU’s data owner.
- [ ] Confirm Supabase Auth, Postgres, Storage, Vercel, backups, and logs are in the approved region and retention policy.
- [ ] Run `npm run lint`, `npx tsc --noEmit`, and `npm test`.
- [ ] Review Supabase RLS with two organizations and confirm every CRM table is tenant-scoped.
- [ ] Test login, approval, denial, disabled-user access, role changes, sign-out, and session expiry.
- [ ] Check security headers with the deployed response. CORA sets CSP, HSTS, frame protection, MIME sniffing protection, Referrer-Policy, Permissions-Policy, and COOP.
- [ ] Test OWASP basics: broken access control, injection, XSS, CSRF/session handling, insecure direct object references, and excessive data exposure.
- [ ] Confirm exports are permission-checked, tenant-scoped, limited to 10,000 rows, and rate-limited.
- [ ] Confirm search input is bounded and rate-limited; never interpolate untrusted input into SQL.
- [ ] Verify no service-role key, OAuth secret, password, or token is in Git, browser bundles, screenshots, logs, or error responses.

## Operations

- [ ] Rotate any credential that was ever committed or shared. Use Vercel/Supabase secret stores, not source files.
- [ ] Configure Supabase Auth URL allowlists and Google OAuth redirect URLs for only approved environments.
- [ ] Configure distributed rate limiting/WAF at Vercel or the edge. The application guard is process-local and is only a fallback.
- [ ] Enable database backups/PITR, test restore, and assign an audit-log reviewer.
- [ ] Configure private Storage buckets and signed URLs before enabling attachments.
- [ ] Set alerts for repeated 401/403/429 responses, auth failures, export spikes, and database errors.
