begin;
create function public.refresh_member_tier(p_member_id uuid) returns void language plpgsql set search_path=public as $$
declare spend numeric; suggested text;
begin
 select coalesce(sum(amount),0) into spend from receipts where member_id=p_member_id;
 suggested:=case when spend>=500 then 'gold' when spend>=200 then 'silver' else 'bronze' end;
 update memberships set suggested_tier_review_status=case when suggested_tier=suggested then suggested_tier_review_status else 'unreviewed' end,suggested_tier=suggested,suggested_tier_source='Lifetime receipt spend: gold >= $500, silver >= $200',suggested_tier_confidence=0.8 where id=p_member_id;
end $$;
create function public.receipt_tier_suggestion() returns trigger language plpgsql set search_path=public as $$ begin
 if TG_OP<>'INSERT' then perform refresh_member_tier(old.member_id); end if;
 if TG_OP<>'DELETE' then perform refresh_member_tier(new.member_id); end if;
 return coalesce(new,old);
end $$;
create trigger receipt_tier after insert or update or delete on receipts for each row execute function public.receipt_tier_suggestion();
create function public.review_member_tier(p_member_id uuid,p_accept boolean) returns void language plpgsql set search_path=public as $$ begin
 update memberships set tier=case when p_accept then suggested_tier else tier end,suggested_tier_review_status=case when p_accept then 'approved' else 'rejected' end where id=p_member_id and suggested_tier is not null;
 if not found then raise exception 'No tier suggestion available.'; end if;
end $$;
create function public.draft_stock_alert(p_gift_id uuid) returns text language plpgsql security definer set search_path=public as $$
declare gift gifts; draft text;
begin
 select * into gift from gifts where id=p_gift_id and user_id is not distinct from auth.uid();
 if not found or gift.stock>5 then raise exception 'Choose an accessible low-stock gift.'; end if;
 draft:=format('Restock review: %s has %s units remaining. Please review expected campaign demand and arrange replenishment.',gift.name,gift.stock);
 insert into audit_logs(action,entity,entity_id,details,user_id) values('draft_stock_alert','gifts',gift.id,jsonb_build_object('draft',draft,'review_status','unreviewed'),auth.uid());
 return draft;
end $$;
do $$ declare m record; begin for m in select id from memberships loop perform refresh_member_tier(m.id); end loop; end $$;
commit;
