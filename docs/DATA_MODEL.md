# Data Model

## tenants
| field | type | notes |
|------|------|-------|
| id | uuid | PK |
| user_id | uuid | nullable, owner scoping later |
| name | text | not null |
| category | text | e.g. F&B, Retail, Service |
| unit_location | text | |
| lease_start | date | |
| lease_end | date | |
| gto_rate | numeric | percentage, e.g. 8.0 |
| min_monthly_rent | numeric | |
| created_at | timestamptz | default now() |

## daily_sales
| field | type | notes |
|------|------|-------|
| id | uuid | PK |
| user_id | uuid | nullable |
| tenant_id | uuid | FK → tenants |
| sale_date | date | not null |
| amount | numeric | not null, ≥ 0 |
| source | text | 'manual' default |
| notes | text | nullable |
| created_at | timestamptz | default now() |

Unique constraint: (tenant_id, sale_date) — one entry per tenant per day.

## billing_periods
| field | type | notes |
|------|------|-------|
| id | uuid | PK |
| user_id | uuid | nullable |
| tenant_id | uuid | FK → tenants |
| period_month | date | first of month |
| total_sales | numeric | sum of daily_sales for month |
| gto_rent | numeric | total_sales × gto_rate / 100 |
| final_rent | numeric | greater of gto_rent or min_monthly_rent |
| status | text | 'open' | 'finalized' |
| created_at | timestamptz | default now() |

No AI-generated fields in v1. All values are user-entered or server-calculated.

## Relationships
tenants 1→many daily_sales · tenants 1→many billing_periods

## RLS (v1)
Permissive read/write for demo. Locked to `auth.uid() = user_id` in a later sprint.
