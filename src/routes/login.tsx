import { createFileRoute, redirect } from '@tanstack/react-router';
import { safeReturnPath } from '@/lib/navigation';
import { pageHead } from '@/lib/metadata';
export const Route = createFileRoute('/login')({ head: () => pageHead('Login','Sign in to your Quantum dashboard.'), validateSearch: (s: Record<string,unknown>) => ({ redirect: safeReturnPath(s['redirect']) }), beforeLoad: ({ search }) => { throw redirect({ to: '/auth', search: { redirect: search.redirect }, replace: true }); } });