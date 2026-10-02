# Security

## Secret Handling
Supabase keys via server-side env only. Never in client bundle. `NEXT_PUBLIC_` prefix only for the anon public key (read-safe). Service-role key stays server-side only — never imported into client components.

## Permission Model
**v1 (demo):** permissive RLS — all reads/writes open, no login required. Seed data visible to anonymous visitors.
**Lock-down sprint:** every table gets `user_id` scoping — `auth.uid() = user_id`. Each tenant/sales row belongs to the manager who created it.

## Approved Tools Rule
No raw `run_any` or `send_any`. Every later agentic action is a named tool with a narrow boundary (one tenant, one period, one email). Structured errors mark retryable vs terminal.

## Audit Principle
Every meaningful write (sales entry, billing finalize, tenant edit) logs: actor, action, target, timestamp. In v1 this is the `created_at` + row data; a formal audit log table is added at lock-down.

## What Could NOT Be Verified (v1)
- No real auth in v1 (demo mode) — injection/XSS surface is minimal but not hardened until lock-down.
- Rate-limiting not in v1.
