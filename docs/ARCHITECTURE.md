# Architecture

## Stack
Next.js 14 (App Router) · Supabase (Postgres + RLS) · Vercel deploy.

## Build Order
1. **Data layer** — tables, seed data, data-access functions.
2. **App logic** — daily sales entry, billing calculation, dashboard queries.
3. **Smart features (later)** — trend alerts, strategy suggestions.

The core (enter sales → see billing) works entirely with SQL + app logic. AI is additive, never required.

## Key User Flow (one action)
1. Manager opens `/tenants/:id` → sees sales history table + trend.
2. Clicks "Log Sales" → form with date + amount.
3. Submit → writes `daily_sales` row.
4. Page reloads → billing period recalculates (GTO % × total sales vs min rent).
5. Dashboard ranking updates.

## Nav Shell
Persistent left sidebar (desktop): Dashboard · Tenants · Billing. Collapses to hamburger on mobile. Current section highlighted.

## Repo Structure
```
lib/data/          # all DB reads/writes (tenants, sales, billing)
lib/billing/      # GTO calc logic
lib/ai/            # trend analysis (later)
app/
  (dashboard)/     # portfolio overview
  tenants/[id]/    # tenant detail + sales entry
  billing/         # billing periods
components/        # UI primitives
__tests__/         # beside code
```

## Module Map
| Module | Owns | Data | Build Order |
|--------|------|------|-------------|
| tenants | tenant CRUD + list | tenants table | 1 |
| sales | daily sales entry + history | daily_sales table | 2 |
| billing | monthly GTO calc + view | billing_periods (derived) | 3 |
| dashboard | portfolio ranking + trends | joins all tables | 4 |
| auth | login + per-user RLS | (later) | 5 |
