-- Transactional RLS regression test: no records are retained.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select public.seed_demo_workspace();
do $$ begin
 if (select count(*) from memberships)<>5 then raise exception 'Seeded membership count is wrong'; end if;
 if (select sum(amount) from receipts)<>1980 then raise exception 'Seeded sales total is wrong'; end if;
 if (select stock from gifts where name='Festive Tote Bag')<>10 then raise exception 'Seeded stock is wrong'; end if;
end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin
 if exists(select 1 from memberships) or exists(select 1 from receipts) or exists(select 1 from gifts) or exists(select 1 from redemptions) or exists(select 1 from audit_logs) then raise exception 'Another user can read data'; end if;
end $$;
rollback;
