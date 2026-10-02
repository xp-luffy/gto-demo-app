# Tasks & Sprints

## Sprint 1 — Database + Seed
**Goal:** Schema live with demo data.
- [x] Create tenants, daily_sales, billing_periods tables (migration SQL)
- [x] Seed 5 tenants with 30 days of sales history + 1 billing period each
- [x] Verify tables queryable in Supabase studio
**DoD:** `select count(*) from daily_sales` returns ≥ 150 rows.

## Sprint 2 — Tenant CRUD + Sales Entry  ◀ v1 FUNCTIONAL MILESTONE
**Goal:** Core engine works end-to-end.
- [x] Data-access layer: `lib/data/queries.ts`
- [x] Tenants list page + detail page
- [x] Add/edit tenant form (name, category, GTO %, min rent)
- [x] Daily sales entry form on tenant detail page
- [x] Sales history table on tenant detail (last 30 days)
- [x] All pages render without login
**DoD:** Add a tenant → log a sales entry → it appears in the table. App usable by anonymous visitor.

## Sprint 3 — Billing Calculation + Dashboard
**Goal:** Auto-billing + portfolio ranking.
- [x] `lib/billing/calc.ts` — GTO rent vs min rent, pick higher
- [x] Billing page: monthly periods per tenant
- [x] Recalculate on new, edited, or deleted sales entry (server-side function)
- [x] Dashboard: all tenants ranked by performance score
- [x] Trend sparkline per tenant (simple SVG)
**DoD:** Log a new sales entry → billing final_rent updates. Dashboard ranks tenants. ← SUCCESS SCENARIO COMPLETE

## Sprint 4 — Lock It Down
**Goal:** Auth + per-user isolation.
- [ ] Supabase auth (email/password)
- [ ] Add `user_id` population on insert
- [ ] Replace permissive RLS with `auth.uid() = user_id` policies
- [ ] Login/signup pages
- [ ] Redirect unauthenticated users to /login
**DoD:** User A cannot see User B's tenants.

## Sprint 5 — Intelligence (later)
- [ ] AI trend summaries (value + source + confidence + review_status)
- [ ] Declining-tenant alerts
- [ ] Draft billing email (approval flow)

## Text Gantt
```
S1:  DB + Seed         █
S2:  CRUD + Sales      ███
S3:  Billing + Dash    ███
S4:  Lock Down          ██
S5:  Intelligence        ██  (later)
```
