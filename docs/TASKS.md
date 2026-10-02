# Tasks

## Sprint 1 — Core Engine: Receipts, Members, Campaigns
**Goal:** Register members and submit receipts — the data backbone.
- Create Supabase tables (migration SQL)
- Build `lib/data/` for campaigns, memberships, receipts
- Campaigns page (list + create form)
- Members page (list + register form: name, gender, tier)
- Receipts page (submit receipt: member, amount, store, date, campaign)
- Seed 5 members, 8 receipts, 1 campaign
- **DoD:** Register a new member and submit a receipt; both persist to DB and show in list.

## Sprint 2 — Gift Inventory + Redemption Flow
**Goal:** The core engine — redeem a gift with stock deduction.
- Build `lib/data/` for gifts, redemptions
- Gifts page (list + create form: name, stock, threshold)
- Redemptions page (member + gift + receipt → submit)
- Server action: validate eligibility (receipt amount >= threshold, stock > 0), insert redemption, decrement stock
- Seed 4 gifts with stock
- **DoD:** Redeem a gift against a qualifying receipt; stock drops by 1; redemption appears in list. Reject if stock = 0 or receipt below threshold.

## Sprint 3 — Dashboard + Metrics (v1 Functional Milestone)
**Goal:** Live dashboard showing the success scenario end-to-end.
- Dashboard page: total sales, AOV, redemption count, new member count, gender split
- Member lifecycle view (new/active/churned counts)
- Gift inventory summary (low-stock badges)
- Wire all pages with loading/empty/error states
- **DoD:** Full success scenario works — register member, submit $120 receipt, AOV updates, redeem gift (stock drops), dashboard shows all metrics. ← **v1 FUNCTIONAL**

## Sprint 4 — AI Insights + UX Polish
**Goal:** Tier suggestions, AOV rankings, polish.
- `lib/ai/`: tier suggestion (rule-based), AOV ranking
- Show suggested tier on member cards (review_status badge)
- Top members by AOV on dashboard
- Low-stock alert text drafting
- **DoD:** Tier suggestion appears on members with confidence + source; top AOV members ranked on dashboard.

## Sprint 5 — Lock It Down
**Goal:** Auth + per-user RLS.
- Add Supabase Auth (login/signup)
- Replace PERMISSIVE policies with `auth.uid() = user_id`
- Gate all pages behind login
- Seed data scoped to demo user
- **DoD:** Anonymous visitor redirected to login; logged-in user sees only their data.

## Gantt
```
S1: [=====]
S2:   [=====]
S3:     [=====] v1 functional
S4:       [=====]
S5:         [=====]
```
