create policy "users read own mt5 setup"
on public.mt5_setup_requests
for select
to authenticated
using (user_id = auth.uid());

create policy "subscribers insert own mt5 setup"
on public.mt5_setup_requests
for insert
to authenticated
with check (user_id = auth.uid() and public.has_active_subscription(auth.uid()));

create policy "users delete own mt5 setup"
on public.mt5_setup_requests
for delete
to authenticated
using (user_id = auth.uid());