-- Run after 0007. Every fixture is rolled back, including test accounts.
begin;
insert into auth.users(id,email,email_confirmed_at,is_anonymous) values
 ('11111111-eeee-4111-8111-111111111111','team-owner@example.invalid',now(),false),
 ('22222222-eeee-4222-8222-222222222222','team-staff@example.invalid',now(),false),
 ('33333333-eeee-4333-8333-333333333333','team-outsider@example.invalid',now(),false);
create function pg_temp.must_fail(statement text) returns void language plpgsql as $$ begin
 begin execute statement; exception when others then return; end;
 raise exception 'Expected operation to fail: %',statement;
end $$;
set local role authenticated;
do $$
declare a uuid:='11111111-eeee-4111-8111-111111111111'; b uuid:='22222222-eeee-4222-8222-222222222222'; outsider uuid:='33333333-eeee-4333-8333-333333333333'; w uuid; other_team uuid; token text; second_token text; c uuid; m uuid; g uuid; r uuid; redemption uuid; personal uuid; invite_id uuid;
begin
 perform set_config('request.jwt.claim.sub',a::text,true);
 w:=create_team('Team regression');other_team:=create_team('Separate team');
 insert into memberships(name,user_id) values('Private member',a) returning id into personal;
 insert into campaigns(name,start_date,end_date,user_id,workspace_id) values('Team campaign',current_date,current_date+7,a,w) returning id into c;
 insert into memberships(name,gender,user_id,workspace_id) values('Shared member','female',a,w) returning id into m;
 insert into gifts(name,stock,threshold_amount,campaign_id,user_id,workspace_id) values('Team tote',10,100,c,a,w) returning id into g;
 token:=invite_team_member(w,'team-staff@example.invalid','staff');
 perform set_config('request.jwt.claim.sub',outsider::text,true);
 if exists(select 1 from campaigns where workspace_id=w) or exists(select 1 from team_workspaces where id=w) or exists(select 1 from audit_logs where workspace_id=w) then raise exception 'Nonmember read leak'; end if;
 perform pg_temp.must_fail(format('select join_team(%L)',token));
 perform pg_temp.must_fail(format('insert into memberships(name,user_id,workspace_id) values(''Forged'',%L,%L)',outsider,w));
 perform set_config('request.jwt.claim.sub',b::text,true);
 if join_team(token)<>w then raise exception 'Invitation joined wrong team'; end if;
 perform pg_temp.must_fail(format('select join_team(%L)',token));
 if not exists(select 1 from memberships where id=m) or exists(select 1 from memberships where id=personal) or exists(select 1 from team_workspaces where id=other_team) then raise exception 'Team or personal isolation failed'; end if;
 perform pg_temp.must_fail(format('select invite_team_member(%L,''team-outsider@example.invalid'',''staff'')',w));
 perform pg_temp.must_fail(format('select manage_team_member(%L,%L,''admin'')',w,b));
 update memberships set name='Shared member edited by staff' where id=m;
 insert into receipts(member_id,amount,store,transaction_date,campaign_id,user_id,workspace_id) values(m,120,'Store A',current_date,c,b,w) returning id into r;
 insert into redemptions(member_id,gift_id,receipt_id,user_id,workspace_id) values(m,g,r,b,w) returning id into redemption;
 if (select stock from gifts where id=g)<>9 then raise exception 'Shared redemption did not deduct stock'; end if;
 perform adjust_gift_stock(g,1);
 perform review_member_tier(m,true);
 update redemptions set status='cancelled' where id=redemption;
 if (select stock from gifts where id=g)<>11 then raise exception 'Cancellation did not return stock exactly once'; end if;
 perform pg_temp.must_fail(format('update redemptions set status=''cancelled'' where id=%L',redemption));
 if not exists(select 1 from audit_logs where workspace_id=w and user_id=b and entity='redemptions') then raise exception 'Team audit missing staff actor'; end if;
 perform pg_temp.must_fail(format('insert into audit_logs(action,user_id,workspace_id) values(''fake'',%L,%L)',b,w));
 perform set_config('request.jwt.claim.sub',a::text,true);
 -- A belongs to both teams; RLS alone would allow these references, so scope triggers must reject them.
 perform pg_temp.must_fail(format('insert into receipts(member_id,amount,transaction_date,user_id,workspace_id) values(%L,120,current_date,%L,%L)',m,a,other_team));
 perform pg_temp.must_fail(format('update memberships set workspace_id=%L where id=%L',other_team,m));
 perform pg_temp.must_fail(format('update memberships set user_id=%L where id=%L',b,m));
 perform manage_team_member(w,b,'admin');
 perform set_config('request.jwt.claim.sub',b::text,true);
 perform pg_temp.must_fail(format('select invite_team_member(%L,''team-outsider@example.invalid'',''admin'')',w));
 perform pg_temp.must_fail(format('select manage_team_member(%L,%L,null)',w,a));
 second_token:=invite_team_member(w,'team-outsider@example.invalid','staff');
 select id into invite_id from list_team_invites(w) where email='team-outsider@example.invalid';
 perform revoke_team_invite(w,invite_id);
 perform set_config('request.jwt.claim.sub',outsider::text,true);
 perform pg_temp.must_fail(format('select join_team(%L)',second_token));
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform manage_team_member(w,b,null);
 perform set_config('request.jwt.claim.sub',b::text,true);
 if exists(select 1 from memberships where id=m) or exists(select 1 from audit_logs where workspace_id=w) then raise exception 'Removed member retained access'; end if;
 perform pg_temp.must_fail(format('select adjust_gift_stock(%L,1)',g));
 raise notice 'PASS: team invitation/roles, personal and team isolation, cross-creator redemption/stock/tier/cancellation, audit and revoked access';
end $$;
rollback;
