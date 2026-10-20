create or replace function public.handle_auth_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.profiles (id, email, full_name) values (new.id, new.email, new.raw_user_meta_data->>'full_name') on conflict do nothing;
    insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  end if;
  -- Admin is NOT granted automatically: with auto-confirm on, email ownership is unproven.
  return new;
end $$;