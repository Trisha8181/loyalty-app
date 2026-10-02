# Build verification

## Sprint 1 — core database and usable workflow
- Applied repaired 0001 schema and seeds to the provisioned Supabase project.
- Applied 0002 integrity migration: foreign keys, positive amounts, nonnegative stock, one completed redemption per receipt, row locks, atomic stock deduction/cancellation, and append-only audit triggers.
- Built persistent campaign/member/receipt/gift forms and lists, including edits, deletes with relationship protection, and the core redemption form early as required by AGENTS.md.
- Production build and strict TypeScript pass.
- Live integration test passes: $120 receipt, stock deduction, threshold/out-of-stock/duplicate rejection, exactly-once cancellation, simultaneous last-stock claims, and client audit-write rejection.
- Browser: registered Asha Demo and submitted a $120 Store A receipt.
- Temporary public demo access was explicitly approved by the owner. Sprint 5 replaces it with owner-scoped access.

The integration script creates labelled Verification fixtures in the connected database. Run it only against a development/demo project. Authenticated verification is added with the lockdown sprint.
