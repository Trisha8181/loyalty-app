# Test Plan

## v1 Success Scenario (manual)
1. Open app → dashboard renders with seeded data (no login)
2. Go to Members → click Register → enter name, gender=female, tier=bronze → submit → new member appears in list
3. Go to Receipts → click Submit → select new member, amount=$120, store=Store A, date=today → submit → receipt appears in list
4. Go to Gifts → note gift stock (e.g. Tote Bag, stock=10, threshold=$100)
5. Go to Redemptions → select member, select Tote Bag, select the $120 receipt → submit → redemption appears, stock drops to 9
6. Go to Dashboard → verify: total sales includes $120, AOV recalculated, redemption count +1, new member count +1, gender split shows female
7. Refresh page → all data persists

## Empty State
- Delete all receipts → Receipts page shows "No receipts yet. Submit your first receipt."
- Dashboard shows $0 sales, AOV: N/A, 0 redemptions

## Error Cases
- Redeem gift with stock=0 → "This gift is out of stock."
- Redeem gift with receipt below threshold ($50 receipt, $100 threshold) → "Receipt amount ($50) does not meet the gift threshold ($100)."
- Submit receipt with empty amount → validation error, no DB write
- Register member with empty name → validation error

## Stock Deduction Integrity
- Redeem same gift twice → stock drops by 2 total
- Attempt 11th redemption on stock=10 gift → blocked with out-of-stock message
