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

## Sprint 4 — insights and polish
- Added stored rule-based tier suggestions with source, 80% confidence and review status, refreshed after receipt writes. Existing membership tiers never change without a human approval action.
- Added approve/dismiss controls and auditable low-stock alert drafts; no communications are sent.
- Added top-member AOV rankings and lifecycle/inventory visualizations.
- Applied 0004_insights. Verified Priya's gold suggestion and unreviewed status in the real database.
- Rule boundary tests, strict TypeScript and production build pass.
- Vercel successfully deployed Sprint 3 commit 003c763 from the GitHub integration.

## Sprint 5 — per-user access and authentication
- Replaced all temporary public RLS policies with owner-scoped read/write access. Unowned historical demo rows remain private and unchanged.
- Added login, signup with email confirmation, logout, session refresh, protected routes and the confirmation callback.
- Added idempotent owner-scoped sample-data loading, including tier suggestions and atomic seeded redemptions.
- Applied 0005_owner_access and 0006_validation. Anonymous reads return zero rows; anonymous writes are rejected.
- The rollback-only SQL regression test passed: user A sees five seeded members, $1,980 sales and tote stock 10; user B sees none of A's records or audit data.
- Corrected Supabase Site URL and exact allowed callback to the production domain.
- Private-demo sign-in was explicitly approved and enabled. The button is shown only when the provider is actually enabled.
- Authenticated two-session integration passed: sample loading, $120 receipt/redemption, dashboard totals, stock concurrency, tier review, alert drafts, and cross-user read/write isolation.
- Production commit 274d828 reached Vercel READY. Browser verification on the production domain registered Asha Live Demo, saved a $120 receipt, redeemed the tote, and showed $2,100 sales, $233.33 AOV, three redemptions, and tote stock 9 (previously 10).
- Production build, strict TypeScript, ESLint, metric and eligibility tests pass. Email delivery/confirmation is not end-to-end verified; Supabase default email delivery is still in use.

## Team workspaces and mobile follow-up
- Applied 0007 after a rollback-only combined migration/regression run passed in the provisioned database.
- Team regression covers recipient-bound invitation acceptance and replay rejection, owner/admin/staff permissions, personal and cross-team isolation, shared staff edits, $120 redemption, stock adjustment, tier review, cancellation, immutable workspace/creator, append-only audit, and revoked membership access.
- All test accounts and team fixtures were rolled back. Existing personal records were not shared.
- Re-ran the authenticated personal demo integration after applying 0007; core workflow, concurrency, metrics, and two-user isolation still pass.
- Added team creation, invitation links, joining, switching, role management, removal and leaving. Email delivery is unchanged and still not verified end to end; the team UI requires a confirmed email account.
- Mobile implementation includes labelled record cards below 700px, inline closable forms, touch targets, readable selected receipt/gift details, visible workspace context, and stale-workspace form guards.
- A separate ivory/ink/cobalt interactive design preview is provided for review. Its JavaScript and DOM references were statically checked; browser screenshot verification of that standalone file remains unperformed.

## Supplied Stitch reference
- Replaced the sage palette with the supplied dark charcoal/champagne design across dashboard, navigation, forms, tables, login and team settings.
- Matched the exported Newsreader/Plus Jakarta Sans typography with locally hosted fonts and included their OFL licenses. No third-party font request is required at runtime.
- Added outlined SVG navigation icons, the diamond brand motif, and gold dashboard highlights. Existing CRM actions, workspace guards and role policies are preserved.
- Production build, integrated lint and TypeScript pass. Desktop browser rendering was checked against the supplied screenshot.
- Verified dashboard and member form/card layouts at 390px and 320px viewport widths with no horizontal overflow. A member submitted through the redesigned mobile form persisted after reload.
