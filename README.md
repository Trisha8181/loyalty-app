# Gather — Loyalty CRM

Live app: https://loyalty-app-jet-two.vercel.app

Next.js App Router, TypeScript, Supabase Postgres/Auth/RLS, Vercel Git deployments.

## Use the app

Create an email account and confirm its email, or use **Try a private demo** to start an isolated sample workspace. Demo sessions belong to the current browser; use an email account for a recoverable workspace. Sign out before switching accounts.

1. Create a campaign or load sample data in an empty workspace.
2. Register a member with gender, tier and lifecycle status.
3. Submit a receipt with amount, store, date and campaign.
4. Create a gift with inventory and receipt threshold.
5. Redeem a gift against that member's qualifying, unused receipt. Campaigns must match when the gift is campaign-specific.
6. Confirm updated inventory, sales, AOV, redemptions, gender split and lifecycle counts on the dashboard.

Gift stock is deducted in the same Postgres transaction as the redemption. Concurrent claims cannot take the same last unit. A receipt may back only one completed redemption. Cancellation returns one unit once; linked receipts are protected against editing/deletion. Manual stock corrections use an atomic delta. CRM writes and team membership changes are audited. Tier suggestions require explicit approval; stock-alert drafts do not send communications.

## Work with your team

Use a confirmed email account, open **Team**, and create a team workspace. Owners can invite admins or staff; admins can invite and remove staff. Each invitation is for one email, works once, and expires in seven days. Copy the generated link and share it with the named colleague. No invitation email is sent by the app.

Switch between personal and team workspaces from Team. Existing personal records stay private. All team members share the team's campaigns, members, receipts, gifts and redemptions. Workspace names remain visible, and forms opened before switching teams are rejected until refreshed. Removing a teammate immediately revokes their database access. Anonymous demos cannot create or join teams.

## Develop

Use Node 24 and pnpm 11.19.0. Link the existing Vercel project and run `vercel env pull .env.local`, then:

```sh
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

`pnpm test:integration` creates two isolated anonymous test users and labelled sample data in the connected database. It verifies the full workflow, concurrency, and cross-user isolation. Run it against a test project when available. `tests/integration.mjs` records the earlier public-demo engine checks and is not used after lockdown.

## Database

Migrations in `supabase/migrations` were applied in order to project `obgbodsyrguantdxajmk` through its SQL editor. On a new database, apply 0001 through 0007 before exposing the app; 0005 replaces all temporary demo policies and 0007 adds isolated team workspaces. Old unowned demo rows remain inaccessible to app users. New samples are created in personal workspaces by `seed_demo_workspace`. The rollback-only `tests/teams-rls.sql` checks team roles, invitations, shared redemption and cross-workspace isolation without retaining test accounts or records.

Enable email sign-in with email confirmation. Private demos require anonymous sign-ins. Supabase Site URL is `https://loyalty-app-jet-two.vercel.app`, with the exact `/auth/callback` URL allowed. Configure a production SMTP provider before opening email signup broadly if Supabase's default email delivery limits are unsuitable.

## Deploy

Repository: `Trisha8181/loyalty-app`; Vercel project: `trisha8181/loyalty-app`; production branch: `main`. Commit as `Trisha8181 <335933433+Trisha8181@users.noreply.github.com>` and push. Vercel builds from Git. Do not deploy local files with the Vercel deploy command.

No service-role key is used by the application. Supabase reads and writes live in `lib/data`, server actions in `lib/actions`, and rule-based insights in `lib/ai`. All CRM tables, including audit logs, enforce personal ownership or team membership.
