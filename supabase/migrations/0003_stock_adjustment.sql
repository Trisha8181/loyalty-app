begin;
create function public.adjust_gift_stock(p_gift_id uuid,p_delta integer) returns uuid language plpgsql set search_path=public as $$
declare result uuid;
begin
 if p_delta=0 or abs(p_delta::bigint)>1000000 then raise exception 'Enter a non-zero stock adjustment up to 1,000,000.'; end if;
 update gifts set stock=stock+p_delta where id=p_gift_id and stock+p_delta>=0 returning id into result;
 if result is null then raise exception 'Gift unavailable or adjustment would make stock negative.'; end if;
 return result;
end $$;
commit;
