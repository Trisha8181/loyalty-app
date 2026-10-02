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

## Team workspaces (post-v1)
- Existing personal records remain private. Creating or joining a team does not share those records.
- A confirmed email account is required to create or join teams; anonymous demo sessions remain personal.
- Owners manage roles and can invite admins or staff. Admins invite/remove staff. Staff use the shared CRM workflow. The owner cannot be removed or demoted.
- Invitations are bound to the recipient's email, expire after seven days, and are single-use. Only a hash is stored; the app produces a link for the inviter to share and sends no email.
- All linked CRM records must belong to the same workspace. Record creator and workspace cannot be changed after creation.
- Database RLS checks current membership; revoked users lose access. Application queries additionally select exactly one active workspace.
- Team records and membership changes retain an append-only audit trail.
