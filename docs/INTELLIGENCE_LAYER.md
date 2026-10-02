# Intelligence Layer

## Messy Inputs
- Receipt amounts entered free-form (may include currency symbols, commas)
- Member names may have inconsistent casing
- Store names may be misspelled

## Auto-Structure Schema (receipt example)
```json
{
  "amount": 120.00,
  "normalized_store": "Store A",
  "campaign_id": "uuid",
  "member_id": "uuid",
  "eligible_for_gift": true,
  "aov_contribution": 120.00
}
```

## Events Tracked
- receipt.submitted
- member.registered
- redemption.completed
- gift.stock_low (stock <= 5)
- gift.out_of_stock (stock = 0)

## Scoring Rules (rule-based, v1)
- **AOV per member** = sum(receipt.amount) / count(receipts) for that member
- **Campaign AOV** = sum(all receipts.amount) / count(all receipts) in campaign
- **Tier suggestion**: total spend >= $500 → gold; >= $200 → silver; else bronze. Confidence = 0.8 (rule-based).
- **Redemption eligibility**: receipt.amount >= gift.threshold_amount AND gift.stock > 0

## What Gets Ranked
- Top members by AOV (for campaign spotlighting)
- Gifts by redemption frequency (for restocking priority)

## v1 vs Later
- v1: AOV calculation, tier suggestion (rule-based), eligibility check
- Later: receipt OCR, spend-pattern anomaly detection, predictive churn scoring
