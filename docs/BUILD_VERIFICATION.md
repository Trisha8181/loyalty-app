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

## Sprint 2 — inventory and redemption validation
- Browser success scenario: Asha Demo registered, $120 Store A receipt saved, Festive Tote Bag redeemed, inventory decreased from 10 to 9 and redemption persisted.
- Added atomic incremental stock adjustment, preventing stale gift-edit forms from resetting inventory after a simultaneous redemption.
- Applied 0003_stock_adjustment and verified invalid adjustments are rejected.
- Reset redemption selections after success. Production build and strict TypeScript pass.
- Diagnosed missing Vercel Git connection; repository access is being connected by the owner.

## Sprint 3 — functional dashboard
- Added sales, cent-safe AOV, completed redemption count, new-member count, gender split, lifecycle counts, inventory summary and recent activity.
- Campaign filter scopes sales, receipts, redemptions, inventory and member participants consistently.
- Dashboard refreshes every 30 seconds; form writes invalidate all workspace routes.
- Added loading/error/empty and filtered-empty states.
- Metric tests cover the $120 success scenario, no receipts, cancelled redemptions, campaign isolation, and decimal totals. TypeScript and production build pass.
- Vercel Git connection repaired and verified against Trisha8181/loyalty-app, production branch main.
