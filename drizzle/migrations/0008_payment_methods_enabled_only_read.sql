drop policy "read methods" on public.payment_methods;

create policy "read enabled methods"
on public.payment_methods
for select
to authenticated
using (enabled = true);