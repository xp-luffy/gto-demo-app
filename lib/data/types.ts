export type Tenant = {
  id: string;
  name: string;
  category: string | null;
  unit_location: string | null;
  lease_start: string | null;
  lease_end: string | null;
  gto_rate: number;
  min_monthly_rent: number;
};

export type DailySale = {
  id: string;
  tenant_id: string;
  sale_date: string;
  amount: number;
  source: string | null;
  notes: string | null;
};

export type BillingPeriod = {
  id: string;
  tenant_id: string;
  period_month: string;
  total_sales: number;
  gto_rent: number;
  final_rent: number;
  status: string;
};

export type TenantPerformance = Tenant & {
  currentSales: number;
  previousSales: number;
  score: number | null;
  trend: number[];
};
