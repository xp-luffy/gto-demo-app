"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculateRent } from "@/lib/billing/calc";
import { createClient } from "@/lib/supabase/server";

function numberField(formData: FormData, name: string, label: string, minimum = 0) {
  const value = Number(formData.get(name));
  if (!Number.isFinite(value) || value < minimum) throw new Error(`${label} must be at least ${minimum}.`);
  return value;
}

function textField(formData: FormData, name: string, label: string) {
  const value = String(formData.get(name) ?? "").trim();
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

export async function saveTenant(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const tenant = {
    name: textField(formData, "name", "Tenant name"),
    category: String(formData.get("category") ?? "").trim() || null,
    unit_location: String(formData.get("unit_location") ?? "").trim() || null,
    lease_start: String(formData.get("lease_start") ?? "") || null,
    lease_end: String(formData.get("lease_end") ?? "") || null,
    gto_rate: numberField(formData, "gto_rate", "GTO rate"),
    min_monthly_rent: numberField(formData, "min_monthly_rent", "Minimum rent"),
  };
  const result = id
    ? await supabase.from("tenants").update(tenant).eq("id", id).select("id").single()
    : await supabase.from("tenants").insert(tenant).select("id").single();
  if (result.error) throw new Error(result.error.message);
  revalidatePath("/");
  revalidatePath("/tenants");
  redirect(`/tenants/${result.data.id}?saved=1`);
}

export async function deleteTenant(formData: FormData) {
  const id = textField(formData, "id", "Tenant");
  const supabase = await createClient();
  const { error } = await supabase.from("tenants").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/tenants");
  redirect("/tenants?deleted=1");
}

async function recalculateBilling(tenantId: string, date: string) {
  const supabase = await createClient();
  const periodMonth = `${date.slice(0, 7)}-01`;
  const monthStart = periodMonth;
  const nextMonth = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)), 1)).toISOString().slice(0, 10);
  const [{ data: tenant, error: tenantError }, { data: sales, error: salesError }] = await Promise.all([
    supabase.from("tenants").select("gto_rate,min_monthly_rent").eq("id", tenantId).single(),
    supabase.from("daily_sales").select("amount").eq("tenant_id", tenantId).gte("sale_date", monthStart).lt("sale_date", nextMonth),
  ]);
  if (tenantError) throw new Error(tenantError.message);
  if (salesError) throw new Error(salesError.message);
  const totalSales = (sales ?? []).reduce((sum, sale) => sum + Number(sale.amount), 0);
  const rent = calculateRent(totalSales, Number(tenant.gto_rate), Number(tenant.min_monthly_rent));
  const { error } = await supabase.from("billing_periods").upsert({
    tenant_id: tenantId,
    period_month: periodMonth,
    total_sales: rent.totalSales,
    gto_rent: rent.gtoRent,
    final_rent: rent.finalRent,
    status: "open",
  }, { onConflict: "tenant_id,period_month" });
  if (error) throw new Error(error.message);
}

export async function addDailySale(formData: FormData) {
  const tenantId = textField(formData, "tenant_id", "Tenant");
  const saleDate = String(formData.get("sale_date") ?? "");
  const amountValue = String(formData.get("amount") ?? "");
  let amount = 0;
  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(saleDate)) throw new Error("Enter a valid sale date.");
    amount = numberField(formData, "amount", "Sales amount");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Check the sales details and try again.";
    redirect("/tenants/" + tenantId + "?error=" + encodeURIComponent(message) + "&date=" + encodeURIComponent(saleDate) + "&amount=" + encodeURIComponent(amountValue));
  }
  const supabase = await createClient();
  const { error } = await supabase.from("daily_sales").insert({
    tenant_id: tenantId,
    sale_date: saleDate,
    amount,
    source: "manual",
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  if (error) {
    const message = error.code === "23505" ? "Sales have already been logged for this tenant on that date." : error.message;
    redirect("/tenants/" + tenantId + "?error=" + encodeURIComponent(message) + "&date=" + encodeURIComponent(saleDate) + "&amount=" + encodeURIComponent(amountValue));
  }
  try {
    await recalculateBilling(tenantId, saleDate);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sales were saved, but billing could not be refreshed.";
    redirect("/tenants/" + tenantId + "?error=" + encodeURIComponent(message));
  }
  revalidatePath("/");
  revalidatePath("/tenants");
  revalidatePath(`/tenants/${tenantId}`);
  revalidatePath("/billing");
  redirect(`/tenants/${tenantId}?logged=1`);
}

export async function deleteDailySale(formData: FormData) {
  const id = textField(formData, "id", "Sale");
  const tenantId = textField(formData, "tenant_id", "Tenant");
  const saleDate = textField(formData, "sale_date", "Sale date");
  const supabase = await createClient();
  const { error } = await supabase.from("daily_sales").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await recalculateBilling(tenantId, saleDate);
  revalidatePath("/");
  revalidatePath(`/tenants/${tenantId}`);
  revalidatePath("/billing");
  redirect(`/tenants/${tenantId}?deleted=1`);
}

export async function editDailySale(formData: FormData) {
  const id = textField(formData, "id", "Sale");
  const tenantId = textField(formData, "tenant_id", "Tenant");
  const saleDate = textField(formData, "sale_date", "Sale date");
  let amount = 0;
  try {
    amount = numberField(formData, "amount", "Sales amount");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Enter a valid sales amount.";
    redirect("/tenants/" + tenantId + "?error=" + encodeURIComponent(message));
  }
  const supabase = await createClient();
  const { error } = await supabase.from("daily_sales").update({
    amount,
    notes: String(formData.get("notes") ?? "").trim() || null,
  }).eq("id", id);
  if (error) redirect("/tenants/" + tenantId + "?error=" + encodeURIComponent(error.message));
  await recalculateBilling(tenantId, saleDate);
  revalidatePath("/");
  revalidatePath("/tenants");
  revalidatePath("/tenants/" + tenantId);
  revalidatePath("/billing");
  redirect("/tenants/" + tenantId + "?logged=1");
}
