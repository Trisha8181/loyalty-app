begin;
do $$ declare t text; begin
 foreach t in array array['campaigns','memberships','receipts','gifts','redemptions','audit_logs'] loop
  execute format('drop policy if exists %I on %I',t||'_v1_read',t);
  execute format('drop policy if exists %I on %I',t||'_v1_write',t);
  execute format('create policy owner_read on %I for select to authenticated using (user_id=auth.uid())',t);
  execute format('alter table %I alter column user_id set default auth.uid()',t);
  execute format('create index %I on %I(user_id)',t||'_owner',t);
  if t<>'audit_logs' then
   execute format('create policy owner_insert on %I for insert to authenticated with check (user_id=auth.uid())',t);
   execute format('create policy owner_update on %I for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid())',t);
   execute format('create policy owner_delete on %I for delete to authenticated using (user_id=auth.uid())',t);
  end if;
 end loop;
end $$;
create function public.validate_record_owner() returns trigger language plpgsql set search_path=public as $$ begin
 if new.user_id is distinct from auth.uid() or auth.uid() is null then raise exception 'Sign in to save records.'; end if;
 if TG_TABLE_NAME='receipts' then
  if not exists(select 1 from memberships where id=new.member_id and user_id=auth.uid()) then raise exception 'Member is not in your workspace.'; end if;
 end if;
 if new.campaign_id is not null and not exists(select 1 from campaigns where id=new.campaign_id and user_id=auth.uid()) then raise exception 'Campaign is not in your workspace.'; end if;
 return new;
end $$;
create trigger receipt_owner before insert or update on receipts for each row execute function public.validate_record_owner();
create trigger gift_owner before insert or update on gifts for each row execute function public.validate_record_owner();
revoke execute on function public.draft_stock_alert(uuid) from public,anon;
grant execute on function public.draft_stock_alert(uuid) to authenticated;
revoke execute on function public.adjust_gift_stock(uuid,integer) from public,anon;
grant execute on function public.adjust_gift_stock(uuid,integer) to authenticated;
revoke execute on function public.review_member_tier(uuid,boolean) from public,anon;
grant execute on function public.review_member_tier(uuid,boolean) to authenticated;
create function public.seed_demo_workspace() returns void language plpgsql set search_path=public as $$
declare owner_id uuid:=auth.uid(); c uuid; m1 uuid; m2 uuid; m3 uuid; m4 uuid; m5 uuid; g1 uuid; g2 uuid; r1 uuid; r2 uuid;
begin
 if owner_id is null then raise exception 'Sign in first.'; end if;
 perform pg_advisory_xact_lock(hashtext(owner_id::text));
 if exists(select 1 from campaigns where user_id=owner_id) then return; end if;
 insert into campaigns(name,start_date,end_date,user_id) values('Demo — Festive Rewards',current_date-7,current_date+30,owner_id) returning id into c;
 insert into memberships(name,gender,tier,lifecycle_status,user_id) values('Priya Sharma','female','gold','active',owner_id) returning id into m1;
 insert into memberships(name,gender,tier,lifecycle_status,user_id) values('Rahul Verma','male','silver','active',owner_id) returning id into m2;
 insert into memberships(name,gender,tier,lifecycle_status,user_id) values('Anita Desai','female','bronze','new',owner_id) returning id into m3;
 insert into memberships(name,gender,tier,lifecycle_status,user_id) values('Karthik Iyer','male','bronze','new',owner_id) returning id into m4;
 insert into memberships(name,gender,tier,lifecycle_status,user_id) values('Meera Nair','female','silver','churned',owner_id) returning id into m5;
 insert into receipts(member_id,amount,store,transaction_date,campaign_id,user_id) values(m1,450,'Store A',current_date-5,c,owner_id) returning id into r1;
 insert into receipts(member_id,amount,store,transaction_date,campaign_id,user_id) values(m2,220,'Store A',current_date-4,c,owner_id) returning id into r2;
 insert into receipts(member_id,amount,store,transaction_date,campaign_id,user_id) values(m1,180,'Store B',current_date-4,c,owner_id),(m1,520,'Store D',current_date-1,c,owner_id),(m2,95,'Store C',current_date-3,c,owner_id),(m3,130,'Store B',current_date-2,c,owner_id),(m4,75,'Store A',current_date-2,c,owner_id),(m5,310,'Store C',current_date-1,c,owner_id);
 insert into gifts(name,description,stock,threshold_amount,campaign_id,user_id) values('Festive Tote Bag','Limited edition tote',11,100,c,owner_id) returning id into g1;
 insert into gifts(name,description,stock,threshold_amount,campaign_id,user_id) values('Scented Candle Set','Premium aroma candle duo',9,150,c,owner_id) returning id into g2;
 insert into gifts(name,description,stock,threshold_amount,campaign_id,user_id) values('Decorative Diya Lamp','Handcrafted ceramic diya',5,200,c,owner_id),('Festive Gift Hamper','A seasonal selection',15,300,c,owner_id);
 insert into redemptions(member_id,gift_id,receipt_id,status,user_id) values(m1,g1,r1,'completed',owner_id),(m2,g2,r2,'completed',owner_id);
end $$;
revoke execute on function public.seed_demo_workspace() from public,anon;
grant execute on function public.seed_demo_workspace() to authenticated;
commit;
