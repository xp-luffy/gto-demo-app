# Agentic Layer

## v1: No agentic actions. All actions are direct user clicks that persist to DB.

## Draftable Actions (later, risk: medium — light approval)
- Draft a monthly billing summary email for a tenant → manager reviews → approve to send
- Draft a "sales declining" alert message → manager approves

## Executable After Approval (later, risk: medium)
- Send approved billing summary email via named `send_billing_email` tool
- Update billing_period status to 'finalized' after email sent

## Human-Only (risk: high/critical)
- Edit or delete a daily_sales row (always manual)
- Finalize a billing period (always manual)
- Adjust GTO rate or min rent on a tenant (always manual)

## Named Tools (later)
| Tool | Boundary | Risk |
|------|----------|------|
| send_billing_email | tenant_id + period → email only | medium |
| generate_trend_summary | tenant_id → text draft | low |

## Audit Log Fields (later)
`action, actor_id, tool_name, target_id, payload, status, created_at`

## v1 vs Later
v1 = pure CRUD + calc. Agentic features arrive after lock-down sprint.
