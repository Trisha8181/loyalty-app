begin;
alter table campaigns add constraint campaign_dates check(end_date >= start_date);
alter table receipts add constraint receipt_amount check(amount > 0);
alter table gifts add constraint gift_stock check(stock >= 0), add constraint gift_threshold check(threshold_amount >= 0);
alter table receipts add foreign key(member_id) references memberships(id), add foreign key(campaign_id) references campaigns(id);
alter table gifts add foreign key(campaign_id) references campaigns(id);
alter table redemptions add foreign key(member_id) references memberships(id), add foreign key(gift_id) references gifts(id), add foreign key(receipt_id) references receipts(id);
create unique index redemption_receipt_once on redemptions(receipt_id) where status='completed';
create index receipts_member on receipts(member_id);
create index receipts_campaign on receipts(campaign_id);
create function public.record_audit() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into audit_logs(action,entity,entity_id,details,user_id) values(lower(TG_OP),TG_TABLE_NAME,coalesce(new.id,old.id),jsonb_build_object('before',case when TG_OP <> 'INSERT' then to_jsonb(old) end,'after',case when TG_OP <> 'DELETE' then to_jsonb(new) end),auth.uid());
 return coalesce(new,old);
end $$;
do $$ declare t text; begin foreach t in array array['campaigns','memberships','receipts','gifts','redemptions'] loop execute format('create trigger audit_changes after insert or update or delete on %I for each row execute function public.record_audit()',t); end loop; end $$;
drop policy audit_logs_v1_write on audit_logs;
create function public.validate_redemption() returns trigger language plpgsql set search_path=public as $$
declare r receipts; g gifts;
begin
 if TG_OP='DELETE' then raise exception 'Redemptions cannot be deleted. Cancel to return stock.'; end if;
 if TG_OP='UPDATE' then
   if new.member_id<>old.member_id or new.receipt_id<>old.receipt_id or new.gift_id<>old.gift_id or new.user_id is distinct from old.user_id then raise exception 'Redemption links cannot be changed.'; end if;
   if old.status='completed' and new.status='cancelled' then update gifts set stock=stock+1 where id=old.gift_id; return new; end if;
   raise exception 'Only a completed redemption can be cancelled.';
 end if;
 if new.status<>'completed' then raise exception 'New redemptions must be completed.'; end if;
 select * into r from receipts where id=new.receipt_id for update;
 if not found or r.member_id<>new.member_id then raise exception 'Choose a receipt belonging to this member.'; end if;
 select * into g from gifts where id=new.gift_id for update;
 if not found then raise exception 'Gift not found.'; end if;
 if g.stock<=0 then raise exception 'This gift is out of stock.'; end if;
 if r.amount<g.threshold_amount then raise exception 'Receipt amount (%) does not meet the gift threshold (%).',r.amount,g.threshold_amount; end if;
 if g.campaign_id is not null and r.campaign_id is distinct from g.campaign_id then raise exception 'Receipt and gift must belong to the same campaign.'; end if;
 if exists(select 1 from redemptions where receipt_id=r.id and status='completed') then raise exception 'This receipt has already been redeemed.'; end if;
 if r.user_id is distinct from new.user_id or g.user_id is distinct from new.user_id then raise exception 'All redemption records must have the same owner.'; end if;
 update gifts set stock=stock-1 where id=g.id;
 return new;
end $$;
create trigger redemption_transaction before insert or update or delete on redemptions for each row execute function public.validate_redemption();
create function public.protect_used_receipt() returns trigger language plpgsql set search_path=public as $$ begin
 if exists(select 1 from redemptions where receipt_id=old.id) then raise exception 'Receipts linked to redemptions cannot be edited or deleted.'; end if; return coalesce(new,old);
end $$;
create trigger protect_receipt before update or delete on receipts for each row execute function public.protect_used_receipt();
commit;
