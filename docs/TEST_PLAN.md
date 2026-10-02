# Test Plan

## Success Scenario (manual)
1. Open app URL in incognito (no login) → lands on dashboard with 5 seeded tenants.
2. Click a tenant → see sales history (≥ 20 rows) + billing card.
3. Note current `final_rent` value.
4. Click "Log Sales" → enter date = today, amount = 50000 → submit.
5. Sales table shows new row. Billing card `total_sales` increased by 50000. `final_rent` recalculated.
6. Return to dashboard → tenant's performance score updated, ranking may shift.
**Pass:** Billing number changed after new entry saved.

## Empty States
- Delete all sales for a tenant → billing shows `total_sales = 0`, `final_rent = min_monthly_rent`.
- Zero tenants → dashboard shows "No tenants yet. Add your first tenant."
- Tenant with no sales history → sales table shows "No sales logged. Log today's sales."

## Error States
- Submit sales form with empty amount → inline validation error, no DB write.
- Submit sales with duplicate (tenant_id, sale_date) → unique constraint error shown as toast, no silent failure.
- Network disconnect during submit → error toast, form retains input.

## Loading States
- Tenant list skeleton while fetching.
- Sales table skeleton while fetching.
- Billing card shows spinner during recalc.

## Post-Lock-Down Tests (Sprint 4)
- User A logs in → sees only their tenants.
- User B logs in → cannot access User A's tenant URL (404 or empty).
- Unauthenticated → redirect to /login.
