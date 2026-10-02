# Loyalty CRM — Product Requirements

## Problem
Marketing, Loyalty & CRM teams manually track festive campaign gift redemptions, sales from receipts, gift inventory, and member lifecycle in spreadsheets — slow, error-prone, no live visibility.

## Target User
Internal Marketing, Loyalty & CRM team members (3–10 people). They log redemptions, submit sales receipts, track gift stock, and watch member registrations during festive campaigns.

## Core Objects
- **Campaigns** — festive campaign windows (name, dates, status)
- **Memberships** — registered members (name, gender, tier, status, join date)
- **Receipts** — sales evidence submitted per member (amount, store, date)
- **Gifts** — festive gift inventory (name, stock, eligibility threshold)
- **Redemptions** — a member claims a gift against an eligible receipt

## MVP (v1) — Checklist
- [ ] Submit a receipt for a member (amount, store, date)
- [ ] Register a new member (name, gender, tier)
- [ ] Record a gift redemption (member + gift + linked receipt)
- [ ] Deduct gift stock on redemption
- [ ] Dashboard: total sales, AOV, redemption count, new members, gender split
- [ ] Gift inventory list with current stock levels
- [ ] Member lifecycle list (new, active, churned)
- [ ] All above viewable without login (seeded demo data)

## Non-goals (v1)
- Login/auth wall (later sprint)
- Push notifications / SMS
- Multi-tenant org accounts
- POS integration / auto-receipt OCR
- Rewards points engine

## Success Criteria
**One week in:** A team member registers a new member, submits a $120 receipt, sees AOV update live, redeems a gift (stock drops by 1), and the dashboard shows sales, AOV, redemption count, and gender split — all persisted, no dead buttons.
