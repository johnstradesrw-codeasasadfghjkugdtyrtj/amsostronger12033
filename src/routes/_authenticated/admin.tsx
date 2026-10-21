import { createFileRoute, redirect } from '@tanstack/react-router';
import { Admin } from '@/components/admin-panel';
import { checkAdmin } from '@/lib/entitlement.functions';
import { pageHead } from '@/lib/metadata';
export const Route = createFileRoute('/_authenticated/admin')({
 head: () => pageHead('Admin','Authorized account and payment administration.'),
 loader: async () => { const access = await checkAdmin(); if (!access.allowed) throw redirect({ to: '/dashboard' }); },
 component: Admin,
});
