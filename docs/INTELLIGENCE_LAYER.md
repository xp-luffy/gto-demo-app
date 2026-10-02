# Intelligence Layer

## v1: Rule-based only (no AI)
All scoring is SQL/math — no model calls needed.

## Messy Inputs
Sales may arrive as free text ("made 3400 today"). v1 uses a structured form; later: natural-language parsing.

## Auto-Structure Schema (later)
```json
{"tenant_name": "Cafe Aroma", "sale_date": "2025-01-15", "amount": 3400, "source": "whatsapp", "confidence": 0.95, "review_status": "unreviewed"}
```

## Events to Track
- Daily sales logged per tenant
- Billing period finalized
- Tenant drops below 70% of prior-period sales (alert)

## Scoring Rules (v1, numbers)
- **Performance score** = current_month_sales / previous_month_sales × 100
- **Ranking** = sort tenants by performance score descending
- **Alert flag** = score < 70 → "declining"; 70–100 → "stable"; >100 → "growing"

## What Gets Ranked
Portfolio dashboard ranks tenants by performance score. Billing page ranks by final_rent descending.

## Later
- AI trend summary per tenant (source + confidence + review_status fields)
- Strategy suggestions for declining tenants
- Anomaly detection on unusual sales days
