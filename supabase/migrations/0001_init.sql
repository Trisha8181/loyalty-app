create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  status text default 'active',
  user_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gender text,
  tier text default 'bronze',
  lifecycle_status text default 'new',
  registered_at timestamptz default now(),
  suggested_tier text,
  suggested_tier_source text,
  suggested_tier_confidence numeric,
  suggested_tier_review_status text default 'unreviewed',
  user_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null,
  amount numeric(10,2) not null,
  store text,
  transaction_date date not null,
  campaign_id uuid,
  user_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists gifts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  stock integer default 0,
  threshold_amount numeric(10,2) default 0,
  campaign_id uuid,
  user_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists redemptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null,
  gift_id uuid not null,
  receipt_id uuid not null,
  status text default 'completed',
  user_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity text,
  entity_id uuid,
  details jsonb,
  user_id uuid,
  created_at timestamptz not null default now()
);

alter table campaigns enable row level security;
alter table memberships enable row level security;
alter table receipts enable row level security;
alter table gifts enable row level security;
alter table redemptions enable row level security;
alter table audit_logs enable row level security;

drop policy if exists "campaigns_v1_read" on campaigns;
create policy "campaigns_v1_read" on campaigns for select using (true);
drop policy if exists "campaigns_v1_write" on campaigns;
create policy "campaigns_v1_write" on campaigns for all using (true) with check (true);

drop policy if exists "memberships_v1_read" on memberships;
create policy "memberships_v1_read" on memberships for select using (true);
drop policy if exists "memberships_v1_write" on memberships;
create policy "memberships_v1_write" on memberships for all using (true) with check (true);

drop policy if exists "receipts_v1_read" on receipts;
create policy "receipts_v1_read" on receipts for select using (true);
drop policy if exists "receipts_v1_write" on receipts;
create policy "receipts_v1_write" on receipts for all using (true) with check (true);

drop policy if exists "gifts_v1_read" on gifts;
create policy "gifts_v1_read" on gifts for select using (true);
drop policy if exists "gifts_v1_write" on gifts;
create policy "gifts_v1_write" on gifts for all using (true) with check (true);

drop policy if exists "redemptions_v1_read" on redemptions;
create policy "redemptions_v1_read" on redemptions for select using (true);
drop policy if exists "redemptions_v1_write" on redemptions;
create policy "redemptions_v1_write" on redemptions for all using (true) with check (true);

drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into campaigns (id, name, start_date, end_date, status) values
  ('a1000000-0000-0000-0000-000000000001', 'Diwali 2025', '2025-10-20', '2025-11-05', 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'Christmas 2025', '2025-12-01', '2025-12-31', 'active')
on conflict (id) do nothing;

insert into memberships (id, name, gender, tier, lifecycle_status) values
  ('b1000000-0000-0000-0000-000000000001', 'Priya Sharma', 'female', 'gold', 'active'),
  ('b1000000-0000-0000-0000-000000000002', 'Rahul Verma', 'male', 'silver', 'active'),
  ('b1000000-0000-0000-0000-000000000003', 'Anita Desai', 'female', 'bronze', 'new'),
  ('b1000000-0000-0000-0000-000000000004', 'Karthik Iyer', 'male', 'bronze', 'new'),
  ('b1000000-0000-0000-0000-000000000005', 'Meera Nair', 'female', 'silver', 'churned')
on conflict (id) do nothing;

insert into receipts (id, member_id, amount, store, transaction_date, campaign_id) values
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 450.00, 'Store A', '2025-10-22', 'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 180.00, 'Store B', '2025-10-25', 'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 220.00, 'Store A', '2025-10-23', 'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 95.00, 'Store C', '2025-10-27', 'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000003', 130.00, 'Store B', '2025-10-28', 'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000004', 75.00, 'Store A', '2025-10-29', 'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000005', 310.00, 'Store C', '2025-11-01', 'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000001', 520.00, 'Store D', '2025-12-05', 'a1000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into gifts (id, name, description, stock, threshold_amount, campaign_id) values
  ('d1000000-0000-0000-0000-000000000001', 'Festive Tote Bag', 'Limited edition Diwali tote', 10, 100.00, 'a1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000002', 'Scented Candle Set', 'Premium aroma candle duo', 8, 150.00, 'a1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000003', 'Decorative Diya Lamp', 'Handcrafted ceramic diya', 5, 200.00, 'a1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000004', 'Christmas Gift Hamper', 'Festive hamper with goodies', 15, 300.00, 'a1000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into redemptions (id, member_id, gift_id, receipt_id, status) values
  ('e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'completed'),
  ('e1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003', 'completed')
on conflict (id) do nothing;
