create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  category text,
  unit_location text,
  lease_start date,
  lease_end date,
  gto_rate numeric default 8.0,
  min_monthly_rent numeric default 0,
  created_at timestamptz not null default now()
);
alter table tenants enable row level security;
drop policy if exists "tenants_v1_read" on tenants;
create policy "tenants_v1_read" on tenants for select using (true);
drop policy if exists "tenants_v1_write" on tenants;
create policy "tenants_v1_write" on tenants for all using (true) with check (true);

create table if not exists daily_sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  tenant_id uuid not null references tenants(id) on delete cascade,
  sale_date date not null,
  amount numeric not null default 0,
  source text default 'manual',
  notes text,
  created_at timestamptz not null default now(),
  unique (tenant_id, sale_date)
);
alter table daily_sales enable row level security;
drop policy if exists "daily_sales_v1_read" on daily_sales;
create policy "daily_sales_v1_read" on daily_sales for select using (true);
drop policy if exists "daily_sales_v1_write" on daily_sales;
create policy "daily_sales_v1_write" on daily_sales for all using (true) with check (true);

create table if not exists billing_periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  tenant_id uuid not null references tenants(id) on delete cascade,
  period_month date not null,
  total_sales numeric default 0,
  gto_rent numeric default 0,
  final_rent numeric default 0,
  status text default 'open',
  created_at timestamptz not null default now(),
  unique (tenant_id, period_month)
);
alter table billing_periods enable row level security;
drop policy if exists "billing_periods_v1_read" on billing_periods;
create policy "billing_periods_v1_read" on billing_periods for select using (true);
drop policy if exists "billing_periods_v1_write" on billing_periods;
create policy "billing_periods_v1_write" on billing_periods for all using (true) with check (true);

insert into tenants (name, category, unit_location, lease_start, lease_end, gto_rate, min_monthly_rent)
select 'Cafe Aroma', 'F&B', 'Ground Floor G-12', '2024-01-01', '2026-12-31', 8.0, 15000
where not exists (select 1 from tenants where name = 'Cafe Aroma');

insert into tenants (name, category, unit_location, lease_start, lease_end, gto_rate, min_monthly_rent)
select 'Bloom Boutique', 'Retail', 'First Floor F-05', '2024-03-01', '2027-02-28', 6.5, 12000
where not exists (select 1 from tenants where name = 'Bloom Boutique');

insert into tenants (name, category, unit_location, lease_start, lease_end, gto_rate, min_monthly_rent)
select 'TechRepair Hub', 'Service', 'Second Floor S-08', '2023-06-01', '2025-05-31', 7.0, 8000
where not exists (select 1 from tenants where name = 'TechRepair Hub');

insert into tenants (name, category, unit_location, lease_start, lease_end, gto_rate, min_monthly_rent)
select 'Green Grocer', 'F&B', 'Ground Floor G-03', '2024-06-01', '2027-05-31', 9.0, 18000
where not exists (select 1 from tenants where name = 'Green Grocer');

insert into tenants (name, category, unit_location, lease_start, lease_end, gto_rate, min_monthly_rent)
select 'Urban Threads', 'Retail', 'First Floor F-11', '2024-09-01', '2026-08-31', 5.5, 10000
where not exists (select 1 from tenants where name = 'Urban Threads');

insert into daily_sales (tenant_id, sale_date, amount, source)
select t.id, d::date, (random() * 4000 + 1000)::numeric, 'manual'
from tenants t
cross join generate_series(
  (date_trunc('day', now()) - interval '29 days')::date,
  (date_trunc('day', now())::date),
  '1 day'
) as d
where not exists (select 1 from daily_sales ds where ds.tenant_id = t.id and ds.sale_date = d::date);

insert into billing_periods (tenant_id, period_month, total_sales, gto_rent, final_rent, status)
select t.id,
  date_trunc('month', now())::date,
  coalesce((select sum(amount) from daily_sales ds where ds.tenant_id = t.id and ds.sale_date >= date_trunc('month', now())), 0),
  coalesce((select sum(amount) from daily_sales ds where ds.tenant_id = t.id and ds.sale_date >= date_trunc('month', now())), 0) * t.gto_rate / 100,
  greatest(
    coalesce((select sum(amount) from daily_sales ds where ds.tenant_id = t.id and ds.sale_date >= date_trunc('month', now())), 0) * t.gto_rate / 100,
    t.min_monthly_rent
  ),
  'open'
from tenants t
where not exists (select 1 from billing_periods bp where bp.tenant_id = t.id and bp.period_month = date_trunc('month', now())::date);