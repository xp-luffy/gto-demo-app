import { createClient } from "@/lib/supabase/server";
import type { BillingPeriod, DailySale, Tenant, TenantPerformance } from "./types";

const tenantFields = "id,name,category,unit_location,lease_start,lease_end,gto_rate,min_monthly_rent";

export async function getTenants(): Promise<Tenant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tenants").select(tenantFields).order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as Tenant[];
}

export async function getTenant(id: string): Promise<Tenant | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tenants").select(tenantFields).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Tenant | null;
}

export async function getTenantSales(tenantId: string, limit = 90): Promise<DailySale[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_sales")
    .select("id,tenant_id,sale_date,amount,source,notes")
    .eq("tenant_id", tenantId)
    .order("sale_date", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as DailySale[];
}

export async function getTenantBilling(tenantId: string): Promise<BillingPeriod[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("billing_periods")
    .select("id,tenant_id,period_month,total_sales,gto_rent,final_rent,status")
    .eq("tenant_id", tenantId)
    .order("period_month", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as BillingPeriod[];
}

export async function getPortfolioPerformance(): Promise<TenantPerformance[]> {
  const supabase = await createClient();
  const tenants = await getTenants();
  if (!tenants.length) return [];

  const today = new Date();
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)).toISOString().slice(0, 10);
  const previousStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1)).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("daily_sales")
    .select("tenant_id,sale_date,amount")
    .gte("sale_date", previousStart)
    .order("sale_date", { ascending: true });
  if (error) throw new Error(error.message);

  return tenants.map((tenant) => {
    const sales = (data ?? []).filter((row) => row.tenant_id === tenant.id);
    const currentSales = sales.filter((row) => row.sale_date >= monthStart).reduce((sum, row) => sum + Number(row.amount), 0);
    const previousSales = sales.filter((row) => row.sale_date < monthStart).reduce((sum, row) => sum + Number(row.amount), 0);
    const trend = sales.slice(-12).map((row) => Number(row.amount));
    return {
      ...tenant,
      currentSales,
      previousSales,
      score: previousSales > 0 ? (currentSales / previousSales) * 100 : null,
      trend,
    };
  }).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
}

export async function getBillingOverview(): Promise<Array<{ tenant: Tenant; period: BillingPeriod | null }>> {
  const [tenants, periods] = await Promise.all([
    getTenants(),
    (async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("billing_periods")
        .select("id,tenant_id,period_month,total_sales,gto_rent,final_rent,status")
        .order("period_month", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as BillingPeriod[];
    })(),
  ]);
  return tenants
    .map((tenant) => ({ tenant, period: periods.find((period) => period.tenant_id === tenant.id) ?? null }))
    .sort((a, b) => Number(b.period?.final_rent ?? 0) - Number(a.period?.final_rent ?? 0));
}
