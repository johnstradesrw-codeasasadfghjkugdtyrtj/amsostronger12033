import { createFileRoute, redirect } from '@tanstack/react-router';
import { safeReturnPath } from '@/lib/navigation';
import { pageHead } from '@/lib/metadata';
export const Route = createFileRoute('/signup')({ head: () => pageHead('Sign up','Create your free registered account.'), validateSearch: (s: Record<string,unknown>) => ({ redirect: safeReturnPath(s['redirect']) }), beforeLoad: ({ search }) => { throw redirect({ to: '/auth', search: { mode: 'signup', redirect: search.redirect }, replace: true }); } });