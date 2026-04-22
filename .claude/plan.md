# wedding-rate — Master Plan
*Type: SaaS | Started: 2026-04-22 | Target: 2026-04-22*
*Progress: 12/20 tasks (60%)*

## Phase 1–4: Core App [done]
- [x] Bootstrap, DB, auth, i18n, API routes, all pages, git commit

## Phase 5: Production Hardening [in-progress]
- [~] Security & reliability fixes for Railway deployment (L)
  - [x] Plan created
  - [ ] lib/rateLimit.ts — in-memory rate limiter (auth: 5/15min, reviews: 20/min)
  - [ ] lib/serverTranslations.ts — getServerT() for Server Component i18n
  - [ ] lib/auth.ts — throw at startup if JWT_SECRET missing in prod
  - [ ] lib/translations.ts — add missing result/myReviews strings
  - [ ] middleware.ts — security headers (X-Frame-Options, CSP, etc.)
  - [ ] .env.example — document required env vars
  - [ ] railway.toml — service config
  - [ ] API routes — rate limiting + input length validation
  - [ ] app/page.tsx — use getServerT() (currently hardcoded EN)
  - [ ] app/wedding/[slug]/results — use getServerT()
  - [ ] app/my-reviews — use getServerT()
  - [ ] app/not-found.tsx — branded 404
  - [ ] app/error.tsx — branded error boundary
  - [ ] npm run build passes ✅

## Phase 6: Railway Deployment [pending]
- [ ] Railway project init + volume for SQLite persistence (M)
  - DoD: app live at a railway.app URL
  - [ ] Install Railway CLI if needed
  - [ ] Create project + set JWT_SECRET + DATABASE_PATH env vars
  - [ ] Add /data volume for SQLite
  - [ ] railway up / railway deploy
