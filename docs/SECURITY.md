# Security

## Secret Handling
- Supabase URL + anon key in env vars only (NEXT_PUBLIC_ prefix for anon key; service role key NEVER in frontend).
- No secrets committed to repo.

## Permission Model (v1 → Lock-down)
- v1: All tables open read/write (PERMISSIVE policies) for demo without login.
- Lock-down sprint: Replace with `auth.uid() = user_id` on all tables. Only owner sees their data.
- Agent inherits the logged-in user's permissions — never runs as service role from the client.

## Approved-Tools Rule
- Only named, whitelisted tools (e.g. `submit_receipt`, `redeem_gift`) may run.
- No raw SQL execution from client. No `run_any` / `send_any`.
- All writes go through server actions in `lib/actions/`.

## Audit Principle
- Every meaningful action (receipt submission, redemption, stock change, tier update) writes to `audit_logs`.
- Audit log is append-only; no UPDATE or DELETE on audit rows.
- AI suggestions are stored separately (suggested_* fields) with review_status — never auto-applied to live fields without approval.
