# wedding-rate — Master Plan
*Type: SaaS | Started: 2026-04-22 | Target: 2026-04-22*
*Progress: 1/12 tasks (8%)*

## Phase 1: Bootstrap [done]
- [x] Bootstrap Next.js app + install deps (S)

## Phase 2: Core Infrastructure [in-progress]
- [~] Database layer, auth lib, translations, config files (M)
  - DoD: getDb() works, JWT sign/verify works, both languages defined

## Phase 3: API Routes [pending]
- [ ] Auth API — login, register, logout, me (M)
- [ ] Weddings API — create, fetch by slug (M)
- [ ] Reviews API — submit + fetch aggregated (M)
- [ ] User reviews API (S)

## Phase 4: Pages & Components [pending]
- [ ] Shared components — Header, StarRating, ContractorCard, ReviewCard (M)
- [ ] Landing + Create pages (L)
- [ ] Wedding + Results pages (L)
- [ ] Auth + My-Reviews pages (M)

## Phase 5: Deploy [pending]
- [ ] nixpacks.toml, git commit (S)
