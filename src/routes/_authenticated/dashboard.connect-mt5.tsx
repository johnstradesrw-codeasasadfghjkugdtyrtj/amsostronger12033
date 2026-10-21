import { createFileRoute, redirect } from '@tanstack/react-router';
import { pageHead } from '@/lib/metadata';
export const Route = createFileRoute('/_authenticated/dashboard/connect-mt5')({ head: () => pageHead('MT5 connection','Verified subscription access to MT5.'), beforeLoad: () => { throw redirect({ to: '/dashboard/mt5', replace: true }); } });