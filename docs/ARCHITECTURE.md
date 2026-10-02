# Architecture

## Stack
Next.js (App Router) + Supabase (Postgres + RLS) + Vercel deploy.

## Responsive Nav Shell
Left sidebar on desktop (Campaigns, Members, Receipts, Gifts, Redemptions, Dashboard); collapses to hamburger on mobile. Current section highlighted.

## Layer Plan
1. **Data layer** (`lib/data/`) — all Supabase reads/writes in one place. UI never calls Supabase directly.
2. **App logic** (`lib/actions/`) — server actions: submit receipt, register member, redeem gift, decrement stock.
3. **Smart features** (`lib/ai/`) — AOV scoring, tier suggestion, redemption eligibility checks. Core works without this; AI enriches.

## Why core runs without AI
Receipt submission, member registration, redemption, and stock deduction are pure DB writes + checks. AI layer only adds AOV insights and tier suggestions on top.

## Key User Action Flow (Redeem a Gift)
1. Team member selects a member from Members list
2. Selects an eligible gift from Gifts list (stock > 0)
3. Links a qualifying receipt (amount >= gift threshold)
4. Submits → server action validates stock + receipt eligibility → inserts redemption row → decrements gift stock → returns updated inventory
5. Dashboard updates: redemption count +1, gift stock -1

## Repo Structure
```
src/
  app/
    (dashboard)/page.tsx
    members/page.tsx
    receipts/page.tsx
    gifts/page.tsx
    redemptions/page.tsx
    campaigns/page.tsx
  components/
    shell/  (sidebar, layout)
    members/  receipts/  gifts/  redemptions/
  lib/
    data/      (members.ts, receipts.ts, gifts.ts, redemptions.ts, campaigns.ts)
    actions/   (submit-receipt.ts, register-member.ts, redeem-gift.ts)
    ai/        (aov-insights.ts, tier-suggestion.ts)
    types/
  __tests__/
```

## Module Map

| Module | Responsibility | Owns | Build Order |
|--------|---------------|------|-------------|
| campaigns | Campaign CRUD + status | campaigns table | 1 |
| memberships | Member register/list/lifecycle | memberships table | 1 |
| receipts | Receipt submission + sales calc | receipts table | 2 |
| gifts | Gift inventory + stock levels | gifts table | 2 |
| redemptions | Redemption flow + stock deduction | redemptions, gifts | 3 |
| dashboard | Aggregated metrics (sales, AOV, counts) | reads across tables | 3 |
| ai-insights | AOV scoring, tier suggestion | no own table, reads only | 4 |
| auth-lockdown | Login + per-user RLS | auth.users integration | 5 |
