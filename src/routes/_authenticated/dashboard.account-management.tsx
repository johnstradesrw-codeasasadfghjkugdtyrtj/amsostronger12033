import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ACCOUNT_MGMT_URL } from '@/lib/site';
import { pageHead } from '@/lib/metadata';
export const Route = createFileRoute('/_authenticated/dashboard/account-management')({ head: () => pageHead('Account management','Contact the account management team.'), component: AccountManagement });
function AccountManagement() { return <section><h1 className="font-display text-2xl font-bold">Account Management</h1><Button asChild className="mt-6"><a href={ACCOUNT_MGMT_URL} target="_blank" rel="noreferrer">Account Management — Telegram</a></Button></section>; }