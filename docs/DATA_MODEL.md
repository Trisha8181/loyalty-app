# Data Model

## campaigns
| Field | Type |
|-------|------|
| id | uuid pk |
| name | text not null |
| start_date | date not null |
| end_date | date not null |
| status | text default 'active' |
| user_id | uuid (nullable, owner scope later) |
| created_at | timestamptz default now() |

## memberships
| Field | Type |
|-------|------|
| id | uuid pk |
| name | text not null |
| gender | text (male/female/other) |
| tier | text default 'bronze' |
| lifecycle_status | text default 'new' (new/active/churned) |
| registered_at | timestamptz default now() |
| user_id | uuid (nullable) |
| created_at | timestamptz default now() |
| suggested_tier | text (AI) |
| suggested_tier_source | text (AI) |
| suggested_tier_confidence | numeric (AI) |
| suggested_tier_review_status | text default 'unreviewed' (AI) |

## receipts
| Field | Type |
|-------|------|
| id | uuid pk |
| member_id | uuid not null |
| amount | numeric(10,2) not null |
| store | text |
| transaction_date | date not null |
| campaign_id | uuid |
| user_id | uuid (nullable) |
| created_at | timestamptz default now() |

## gifts
| Field | Type |
|-------|------|
| id | uuid pk |
| name | text not null |
| description | text |
| stock | integer default 0 |
| threshold_amount | numeric(10,2) default 0 |
| campaign_id | uuid |
| user_id | uuid (nullable) |
| created_at | timestamptz default now() |

## redemptions
| Field | Type |
|-------|------|
| id | uuid pk |
| member_id | uuid not null |
| gift_id | uuid not null |
| receipt_id | uuid not null |
| status | text default 'completed' (completed/pending/cancelled) |
| user_id | uuid (nullable) |
| created_at | timestamptz default now() |

## audit_logs
| Field | Type |
|-------|------|
| id | uuid pk |
| action | text not null |
| entity | text |
| entity_id | uuid |
| details | jsonb |
| user_id | uuid (nullable) |
| created_at | timestamptz default now() |

## Relationships
- receipts.member_id → memberships.id
- receipts.campaign_id → campaigns.id
- gifts.campaign_id → campaigns.id
- redemptions.member_id → memberships.id
- redemptions.gift_id → gifts.id
- redemptions.receipt_id → receipts.id

## RLS Notes (v1)
- All tables: PERMISSIVE read/write policies for demo (no login required).
- Lock-down sprint: replace with `auth.uid() = user_id` owner-scoped policies.
- AI fields on memberships: suggested_tier + source + confidence + review_status.
