# Agentic Layer

## Draftable Actions (low risk — auto)
- Suggest member tier based on spend (stores in suggested_tier fields, review_status='unreviewed')
- Tag receipts by campaign (auto-assign campaign_id if dates match)
- Draft low-stock alert text for gift inventory

## Executable After Approval (medium risk)
- Update member lifecycle_status from 'new' → 'active' (after first redemption)
- Update member tier (confirmed tier from suggestion)
- Create restock task when gift stock <= 5

## Human-Only Actions (high/critical)
- Delete a member or receipt
- Cancel a completed redemption (refund gift stock requires manual decision)
- Adjust gift stock manually (inventory correction)
- Send campaign communication to members

## Named Tools
- `suggest_member_tier` — reads receipts, writes suggestion fields
- `check_redemption_eligibility` — validates receipt + gift stock, returns boolean
- `create_restock_task` — drafts task for low-stock gift (needs approval)

## Audit Log Fields
Every agentic action logs: action, entity, entity_id, details (jsonb), user_id, created_at.

## v1 vs Later
- v1: Tier suggestion (draft only), eligibility check (auto, read-only)
- Later: Auto lifecycle updates, restock task creation, campaign comms
