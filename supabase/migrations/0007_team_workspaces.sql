begin;
create table public.team_workspaces(id uuid primary key default gen_random_uuid(), name text not null check(char_length(trim(name)) between 1 and 100), owner_id uuid not null references auth.users(id), created_at timestamptz not null default now());
create table public.team_members(workspace_id uuid not null references team_workspaces(id), user_id uuid not null references auth.users(id), role text not null check(role in ('owner','admin','staff')), email text not null, created_at timestamptz not null default now(), primary key(workspace_id,user_id));
create unique index team_one_owner on team_members(workspace_id) where role='owner';
create table public.team_invites(id uuid primary key default gen_random_uuid(), workspace_id uuid not null references team_workspaces(id), email text not null, role text not null check(role in ('admin','staff')), token_hash text not null unique, created_by uuid not null references auth.users(id), expires_at timestamptz not null default now()+interval '7 days', used_at timestamptz, revoked_at timestamptz, created_at timestamptz not null default now());
alter table team_workspaces enable row level security;
alter table team_members enable row level security;
alter table team_invites enable row level security;
create function public.team_role(p_workspace uuid) returns text language sql stable security definer set search_path=public as $$ select role from team_members where workspace_id=p_workspace and user_id=auth.uid() $$;
revoke all on function public.team_role(uuid) from public,anon;
grant execute on function public.team_role(uuid) to authenticated;
create policy team_read on team_workspaces for select to authenticated using(team_role(id) is not null);
create policy team_read on team_members for select to authenticated using(team_role(workspace_id) is not null);
-- Management is RPC-only. Invite token hashes are never readable by clients.
grant select on team_workspaces,team_members to authenticated;
revoke all on team_invites from anon,authenticated;
create function public.require_team_account() returns text language plpgsql security definer set search_path=public as $$ declare account_email text; begin
 select lower(email) into account_email from auth.users where id=auth.uid() and email_confirmed_at is not null and not coalesce(is_anonymous,false);
 if account_email is null then raise exception 'Confirm your email account before using team workspaces.'; end if; return account_email;
end $$;
revoke all on function public.require_team_account() from public,anon;
grant execute on function public.require_team_account() to authenticated;
create function public.create_team(p_name text) returns uuid language plpgsql security definer set search_path=public as $$ declare w uuid; e text; begin
 e:=require_team_account(); if char_length(trim(p_name)) not between 1 and 100 then raise exception 'Enter a team name of 1–100 characters.'; end if;
 insert into team_workspaces(name,owner_id) values(trim(p_name),auth.uid()) returning id into w;
 insert into team_members(workspace_id,user_id,role,email) values(w,auth.uid(),'owner',e); return w;
end $$;
create function public.invite_team_member(p_workspace uuid,p_email text,p_role text) returns text language plpgsql security definer set search_path=public,extensions as $$ declare token text; caller text; begin
 perform require_team_account(); perform 1 from team_workspaces where id=p_workspace for update; caller:=team_role(p_workspace);
 if caller is null or caller not in ('owner','admin') or (p_role='admin' and caller<>'owner') then raise exception 'Only the owner can invite admins; owners and admins can invite staff.'; end if;
 if p_role not in ('admin','staff') or p_role is null then raise exception 'Choose admin or staff.'; end if;
 if p_email is null or length(p_email)>254 or trim(p_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Enter a valid recipient email.'; end if;
 if exists(select 1 from team_members where workspace_id=p_workspace and email=lower(trim(p_email))) then raise exception 'This email is already a team member.'; end if;
 token:=encode(gen_random_bytes(32),'hex');
 insert into team_invites(workspace_id,email,role,token_hash,created_by) values(p_workspace,lower(trim(p_email)),p_role,encode(digest(token,'sha256'),'hex'),auth.uid());
 return token;
end $$;
create function public.join_team(p_token text) returns uuid language plpgsql security definer set search_path=public,extensions as $$ declare invitation team_invites; e text; begin
 e:=require_team_account();
 select * into invitation from team_invites where token_hash=encode(digest(p_token,'sha256'),'hex');
 if not found then raise exception 'This invitation is invalid or unavailable.'; end if;
 perform 1 from team_workspaces where id=invitation.workspace_id for update;
 select * into invitation from team_invites where id=invitation.id for update;
 if invitation.used_at is not null or invitation.revoked_at is not null or invitation.expires_at<=now() or invitation.email<>e then raise exception 'This invitation is expired, used, revoked, or belongs to a different email.'; end if;
 -- An inviter who lost their authority cannot grant access through an old invitation.
 if not exists(select 1 from team_members where workspace_id=invitation.workspace_id and user_id=invitation.created_by and (role='owner' or (role='admin' and invitation.role='staff'))) then raise exception 'The inviter no longer has permission. Request a new invitation.'; end if;
 insert into team_members(workspace_id,user_id,role,email) values(invitation.workspace_id,auth.uid(),invitation.role,e) on conflict(workspace_id,user_id) do nothing;
 update team_invites set used_at=now() where id=invitation.id; return invitation.workspace_id;
end $$;
create function public.manage_team_member(p_workspace uuid,p_user uuid,p_role text default null) returns void language plpgsql security definer set search_path=public as $$ declare caller text; target text; begin
 perform 1 from team_workspaces where id=p_workspace for update; caller:=team_role(p_workspace);
 select role into target from team_members where workspace_id=p_workspace and user_id=p_user;
 if caller is null or target is null then raise exception 'Team member not found.'; end if;
 if target='owner' then raise exception 'The owner cannot be removed or demoted.'; end if;
 if p_role is null then
  if p_user<>auth.uid() and caller<>'owner' and not(caller='admin' and target='staff') then raise exception 'You cannot remove this team member.'; end if;
  delete from team_members where workspace_id=p_workspace and user_id=p_user;
 else
  if caller<>'owner' or p_role not in ('admin','staff') then raise exception 'Only the owner can change roles.'; end if;
  update team_members set role=p_role where workspace_id=p_workspace and user_id=p_user;
 end if;
 -- Removal or role change invalidates the person's outstanding invitations.
 update team_invites set revoked_at=now() where workspace_id=p_workspace and created_by=p_user and used_at is null;
end $$;
create function public.list_team_invites(p_workspace uuid) returns table(id uuid,email text,role text,expires_at timestamptz,used_at timestamptz,revoked_at timestamptz) language plpgsql security definer set search_path=public as $$ begin
 if coalesce(team_role(p_workspace),'') not in ('owner','admin') then raise exception 'Only team managers can view invitations.'; end if;
 return query select i.id,i.email,i.role,i.expires_at,i.used_at,i.revoked_at from team_invites i where i.workspace_id=p_workspace order by i.created_at desc;
end $$;
create function public.revoke_team_invite(p_workspace uuid,p_invite uuid) returns void language plpgsql security definer set search_path=public as $$ begin
 perform 1 from team_workspaces where id=p_workspace for update;
 if coalesce(team_role(p_workspace),'') not in ('owner','admin') then raise exception 'Only team managers can revoke invitations.'; end if;
 update team_invites set revoked_at=now() where id=p_invite and workspace_id=p_workspace and used_at is null and (team_role(p_workspace)='owner' or role='staff');
 if not found then raise exception 'Invitation unavailable or outside your permissions.'; end if;
end $$;
do $$ declare f text; begin foreach f in array array['create_team(text)','invite_team_member(uuid,text,text)','join_team(text)','manage_team_member(uuid,uuid,text)','list_team_invites(uuid)','revoke_team_invite(uuid,uuid)'] loop execute 'revoke all on function public.'||f||' from public,anon'; execute 'grant execute on function public.'||f||' to authenticated'; end loop; end $$;
-- NULL remains a personal workspace: no existing personal data is shared.
do $$ declare t text; begin foreach t in array array['campaigns','memberships','receipts','gifts','redemptions','audit_logs'] loop
 execute format('alter table %I add column workspace_id uuid references team_workspaces(id)',t);
 execute format('create index %I on %I(workspace_id)',t||'_workspace',t);
 execute format('drop policy owner_read on %I',t);
 execute format('create policy scoped_read on %I for select to authenticated using ((workspace_id is null and user_id=auth.uid()) or team_role(workspace_id) is not null)',t);
 if t<>'audit_logs' then
  execute format('drop policy owner_insert on %I',t); execute format('drop policy owner_update on %I',t); execute format('drop policy owner_delete on %I',t);
  execute format('create policy scoped_insert on %I for insert to authenticated with check (user_id=auth.uid() and (workspace_id is null or team_role(workspace_id) is not null))',t);
  execute format('create policy scoped_update on %I for update to authenticated using ((workspace_id is null and user_id=auth.uid()) or team_role(workspace_id) is not null) with check ((workspace_id is null and user_id=auth.uid()) or team_role(workspace_id) is not null)',t);
  execute format('create policy scoped_delete on %I for delete to authenticated using ((workspace_id is null and user_id=auth.uid()) or team_role(workspace_id) is not null)',t);
 end if;
end loop; end $$;
create or replace function public.record_audit() returns trigger language plpgsql security definer set search_path=public as $$ begin
 insert into audit_logs(action,entity,entity_id,details,user_id,workspace_id) values(lower(TG_OP),TG_TABLE_NAME,coalesce(new.id,old.id),jsonb_build_object('before',case when TG_OP<>'INSERT' then to_jsonb(old) end,'after',case when TG_OP<>'DELETE' then to_jsonb(new) end),auth.uid(),coalesce(new.workspace_id,old.workspace_id)); return coalesce(new,old);
end $$;
create function public.validate_workspace_scope() returns trigger language plpgsql set search_path=public as $$ begin
 if TG_OP='UPDATE' and (new.workspace_id is distinct from old.workspace_id or new.user_id is distinct from old.user_id) then raise exception 'Record workspace and creator cannot be changed.'; end if;
 if auth.uid() is null or (new.workspace_id is null and new.user_id is distinct from auth.uid()) or (new.workspace_id is not null and team_role(new.workspace_id) is null) then raise exception 'This workspace is not accessible.'; end if;
 if TG_OP='INSERT' and new.user_id is distinct from auth.uid() then raise exception 'Record creator must be the signed-in user.'; end if;
 return new;
end $$;
do $$ declare t text; begin foreach t in array array['campaigns','memberships','receipts','gifts','redemptions'] loop execute format('create trigger a_workspace_scope before insert or update on %I for each row execute function validate_workspace_scope()',t); end loop; end $$;
create or replace function public.validate_record_owner() returns trigger language plpgsql set search_path=public as $$ begin
 if TG_TABLE_NAME='receipts' then
  if not exists(select 1 from memberships where id=new.member_id and workspace_id is not distinct from new.workspace_id and (new.workspace_id is not null or user_id=new.user_id)) then raise exception 'Member is not in this workspace.'; end if;
 end if;
 if new.campaign_id is not null and not exists(select 1 from campaigns where id=new.campaign_id and workspace_id is not distinct from new.workspace_id and (new.workspace_id is not null or user_id=new.user_id)) then raise exception 'Campaign is not in this workspace.'; end if; return new;
end $$;
create or replace function public.validate_redemption() returns trigger language plpgsql set search_path=public as $$ declare r receipts; g gifts; begin
 if TG_OP='DELETE' then raise exception 'Redemptions cannot be deleted. Cancel to return stock.'; end if;
 if TG_OP='UPDATE' then
  if new.member_id<>old.member_id or new.receipt_id<>old.receipt_id or new.gift_id<>old.gift_id or new.user_id is distinct from old.user_id or new.workspace_id is distinct from old.workspace_id then raise exception 'Redemption links cannot be changed.'; end if;
  if old.status='completed' and new.status='cancelled' then update gifts set stock=stock+1 where id=old.gift_id; return new; end if;
  raise exception 'Only a completed redemption can be cancelled.';
 end if;
 if new.status<>'completed' then raise exception 'New redemptions must be completed.'; end if;
 select * into r from receipts where id=new.receipt_id for update;
 if not found or r.member_id<>new.member_id then raise exception 'Choose a receipt belonging to this member.'; end if;
 select * into g from gifts where id=new.gift_id for update;
 if not found then raise exception 'Gift not found.'; end if;
 if r.workspace_id is distinct from new.workspace_id or g.workspace_id is distinct from new.workspace_id or (new.workspace_id is null and (r.user_id is distinct from new.user_id or g.user_id is distinct from new.user_id)) then raise exception 'All redemption records must belong to this workspace.'; end if;
 if g.stock<=0 then raise exception 'This gift is out of stock.'; end if;
 if r.amount<g.threshold_amount then raise exception 'Receipt amount (%) does not meet the gift threshold (%).',r.amount,g.threshold_amount; end if;
 if g.campaign_id is not null and r.campaign_id is distinct from g.campaign_id then raise exception 'Receipt and gift must belong to the same campaign.'; end if;
 if exists(select 1 from redemptions where receipt_id=r.id and status='completed') then raise exception 'This receipt has already been redeemed.'; end if;
 update gifts set stock=stock-1 where id=g.id; return new;
end $$;
create or replace function public.draft_stock_alert(p_gift_id uuid) returns text language plpgsql security definer set search_path=public as $$ declare gift gifts; draft text; begin
 select * into gift from gifts where id=p_gift_id and ((workspace_id is null and user_id=auth.uid()) or team_role(workspace_id) is not null);
 if not found or gift.stock>5 then raise exception 'Choose an accessible low-stock gift.'; end if;
 draft:=format('Restock review: %s has %s units remaining. Please review expected campaign demand and arrange replenishment.',gift.name,gift.stock);
 insert into audit_logs(action,entity,entity_id,details,user_id,workspace_id) values('draft_stock_alert','gifts',gift.id,jsonb_build_object('draft',draft,'review_status','unreviewed'),auth.uid(),gift.workspace_id); return draft;
end $$;
-- Record team administration in the existing append-only audit stream.
create function public.audit_team_change() returns trigger language plpgsql security definer set search_path=public as $$ begin
 insert into audit_logs(action,entity,entity_id,details,user_id,workspace_id) values(lower(TG_OP),TG_TABLE_NAME,coalesce(new.user_id,old.user_id),jsonb_build_object('user_id',coalesce(new.user_id,old.user_id),'role',coalesce(new.role,old.role)),auth.uid(),coalesce(new.workspace_id,old.workspace_id)); return coalesce(new,old);
end $$;
create trigger audit_team_members after insert or update or delete on team_members for each row execute function audit_team_change();
create or replace function public.seed_demo_workspace() returns void language plpgsql set search_path=public as $$
declare owner_id uuid:=auth.uid(); c uuid; m1 uuid; m2 uuid; m3 uuid; m4 uuid; m5 uuid; g1 uuid; g2 uuid; r1 uuid; r2 uuid;
begin
 if owner_id is null then raise exception 'Sign in first.'; end if;
 perform pg_advisory_xact_lock(hashtext(owner_id::text));
 if exists(select 1 from campaigns where user_id=owner_id and workspace_id is null) then return; end if;
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

commit;

