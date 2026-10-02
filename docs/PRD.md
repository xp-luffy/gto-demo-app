# GTO Tenancy Manager — PRD

## Problem
Management teams running performance-based (Gross Turnover) leases track tenant sales in Excel and email updates manually. Data is stale, billing is error-prone, and there's no trend visibility to help tenants grow revenue.

## Target User
Property/asset management team responsible for a portfolio of tenants on GTO leases.

## Core Objects
- **Tenant** — name, category, unit/location, lease start/end, GTO %, minimum monthly rent.
- **Daily Sales** — one row per tenant per day: amount, source, notes. The core engine.
- **Billing Period** — monthly roll-up per tenant: total GTO sales, computed GTO rent, minimum rent, final charge.

## MVP (v1) — must-haves
- [ ] Tenant CRUD (add/edit/delete tenants with lease terms)
- [ ] Daily sales entry form — log today's sales for any tenant
- [ ] Daily sales table per tenant with simple trend sparkline
- [ ] Auto-compute monthly billing: GTO rent vs min rent, pick higher, show final charge
- [ ] Portfolio dashboard: all tenants ranked by sales performance (vs last period)
- [ ] All screens viewable without login (seed demo data)

## Non-goals (v1)
- Tenant customer data, CRM, loyalty
- Multi-user login / per-user isolation (later sprint)
- Automated email/WhatsApp sends
- Payment processing
- Multi-property portfolio split

## Success Criteria
A manager opens the app, sees 5 seeded tenants with sales history, logs a new day's sales for one tenant, views that tenant's monthly billing auto-update to reflect the new total, and checks the portfolio dashboard ranking — all without logging in. **Pass/fail: the billing number changes after a new sales entry is saved.**
