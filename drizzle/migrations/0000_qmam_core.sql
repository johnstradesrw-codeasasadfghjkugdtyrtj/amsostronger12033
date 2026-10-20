create type public.app_role as enum ('admin','customer');
create type public.payment_status as enum ('draft','pending_review','under_verification','approved','rejected','cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text, created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null, price numeric, currency text not null default 'USD',
  duration_days int, description text, features text[] not null default '{}',
  mt5_limit int not null default 1, support_level text, featured boolean not null default false,
  active boolean not null default true, visible boolean not null default true,
  custom_quote boolean not null default false, sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.plans to anon, authenticated;
grant insert, update, delete on public.plans to authenticated;
grant all on public.plans to service_role;
alter table public.plans enable row level security;
create policy "public plans" on public.plans for select to anon, authenticated using ((visible and active) or public.has_role(auth.uid(),'admin'));
create policy "admin plans write" on public.plans for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.plans (name, price, duration_days, description, features, featured, custom_quote, sort_order) values
('Quantum Trial',29,3,'Short-term access for testing the platform''s available features.',array['1 MT5 account','Client dashboard','Telegram support'],false,false,1),
('Quantum Weekly',59,7,'Short-term subscription access.',array['1 MT5 account','Client dashboard','Telegram support'],false,false,2),
('Quantum Monthly',149,30,'Monthly access to the platform''s included features.',array['1 MT5 account','Client dashboard','Priority support'],true,false,3),
('Quantum Quarterly',349,90,'Longer-term subscription access.',array['1 MT5 account','Client dashboard','Priority support'],false,false,4),
('Quantum Elite Annual',999,365,'Annual subscription access with features configured by the administrator.',array['1 MT5 account','Client dashboard','Premium support'],false,false,5),
('Quantum Source Code',null,null,'Enquire about source-code licensing, availability, scope, terms, and pricing.',array['Custom quotation','Terms agreed privately'],false,true,6);

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null, asset text not null, network text,
  address text, instructions text, network_warning text,
  enabled boolean not null default false, sort_order int not null default 0,
  updated_at timestamptz not null default now()
);
grant select on public.payment_methods to authenticated;
grant insert, update, delete on public.payment_methods to authenticated;
grant all on public.payment_methods to service_role;
alter table public.payment_methods enable row level security;
create policy "read methods" on public.payment_methods for select to authenticated using (true);
create policy "admin methods" on public.payment_methods for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.payment_methods (name, asset, network, network_warning, sort_order) values
('USDT — TRON (TRC20)','USDT','TRC20','Send USDT on the TRON (TRC20) network only. Do NOT use ERC20 or BEP20.',1),
('Bitcoin','BTC','Bitcoin','Send BTC on the Bitcoin network only.',2),
('Binance Pay','USDT','Binance Pay',null,3);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('QM-' || upper(substr(md5(random()::text),1,8))),
  user_id uuid not null, plan_id uuid not null references public.plans(id),
  plan_name text not null, amount numeric not null, currency text not null default 'USD',
  duration_days int not null, method_id uuid references public.payment_methods(id),
  method_name text, tx_id text, sender text, paid_at timestamptz, screenshot_path text not null,
  notes text, status public.payment_status not null default 'pending_review',
  rejection_reason text, reviewed_at timestamptz, created_at timestamptz not null default now()
);
create unique index payments_tx_unique on public.payments (lower(tx_id)) where tx_id is not null and tx_id <> '' and status in ('pending_review','under_verification','approved');
grant select, insert on public.payments to authenticated;
grant update on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
create policy "own payments read" on public.payments for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own payments insert" on public.payments for insert to authenticated with check (user_id = auth.uid() and status = 'pending_review');
create policy "admin payments update" on public.payments for update to authenticated using (public.has_role(auth.uid(),'admin'));

-- server-side price lock: copy plan values on insert
create or replace function public.payments_lock_plan() returns trigger language plpgsql security definer set search_path=public as $$
declare p public.plans;
begin
  select * into p from public.plans where id = new.plan_id and active and not custom_quote;
  if p.id is null then raise exception 'Plan not available'; end if;
  new.plan_name := p.name; new.amount := p.price; new.currency := p.currency; new.duration_days := p.duration_days;
  new.status := 'pending_review'; new.rejection_reason := null; new.reviewed_at := null;
  return new;
end $$;
create trigger payments_lock before insert on public.payments for each row execute function public.payments_lock_plan();

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, payment_id uuid references public.payments(id),
  plan_name text not null, price numeric, starts_at timestamptz not null default now(),
  expires_at timestamptz not null, revoked boolean not null default false, revoke_reason text,
  created_at timestamptz not null default now()
);
grant select on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;
alter table public.subscriptions enable row level security;
create policy "own subs read" on public.subscriptions for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin subs update" on public.subscriptions for update to authenticated using (public.has_role(auth.uid(),'admin'));
grant update on public.subscriptions to authenticated;

create or replace function public.has_active_subscription(_user_id uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists (select 1 from public.subscriptions where user_id=_user_id and not revoked and expires_at > now())
$$;

create or replace function public.review_payment(_payment_id uuid, _approve boolean, _reason text default null)
returns void language plpgsql security definer set search_path=public as $$
declare pay public.payments; last_exp timestamptz;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Forbidden'; end if;
  select * into pay from public.payments where id=_payment_id for update;
  if pay.id is null then raise exception 'Not found'; end if;
  if pay.status not in ('pending_review','under_verification') then raise exception 'Already reviewed'; end if;
  if _approve then
    update public.payments set status='approved', reviewed_at=now() where id=_payment_id;
    select max(expires_at) into last_exp from public.subscriptions where user_id=pay.user_id and not revoked and expires_at>now();
    insert into public.subscriptions (user_id, payment_id, plan_name, price, starts_at, expires_at)
    values (pay.user_id, pay.id, pay.plan_name, pay.amount, coalesce(last_exp, now()), coalesce(last_exp, now()) + make_interval(days => pay.duration_days));
  else
    update public.payments set status='rejected', rejection_reason=coalesce(_reason,'Rejected'), reviewed_at=now() where id=_payment_id;
  end if;
end $$;

-- new user: profile, customer role, admin for verified allow-listed emails
create or replace function public.handle_auth_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.profiles (id, email, full_name) values (new.id, new.email, new.raw_user_meta_data->>'full_name') on conflict do nothing;
    insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  end if;
  if new.email_confirmed_at is not null and lower(new.email) in ('dufashwenayo@gmail.com','eclifunded@gmail.com') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_auth_user();
create trigger on_auth_user_confirmed after update of email_confirmed_at on auth.users for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null) execute function public.handle_auth_user();

-- idempotent provisioning for already-existing verified admin accounts
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email_confirmed_at is not null and lower(email) in ('dufashwenayo@gmail.com','eclifunded@gmail.com')
on conflict do nothing;

create table public.admin_audit (
  id uuid primary key default gen_random_uuid(), actor uuid, action text not null, details jsonb, created_at timestamptz not null default now()
);
grant select, insert on public.admin_audit to authenticated;
grant all on public.admin_audit to service_role;
alter table public.admin_audit enable row level security;
create policy "admin audit" on public.admin_audit for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin') and actor = auth.uid());