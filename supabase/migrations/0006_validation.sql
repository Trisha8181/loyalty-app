begin;
alter table campaigns alter column status set not null, add constraint campaign_status check(status in ('active','paused','completed')), add constraint campaign_name check(length(trim(name)) between 1 and 200);
alter table memberships alter column tier set not null, alter column lifecycle_status set not null, add constraint member_tier check(tier in ('bronze','silver','gold')), add constraint member_lifecycle check(lifecycle_status in ('new','active','churned')), add constraint member_gender check(gender in ('female','male','other','unspecified')), add constraint member_name check(length(trim(name)) between 1 and 200);
alter table gifts alter column stock set not null, alter column threshold_amount set not null, add constraint gift_name check(length(trim(name)) between 1 and 200);
alter table redemptions alter column status set not null, add constraint redemption_status check(status in ('completed','cancelled'));
commit;
