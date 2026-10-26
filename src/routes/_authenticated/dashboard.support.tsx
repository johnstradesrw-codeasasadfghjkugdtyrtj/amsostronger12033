import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle } from 'lucide-react';
import { SUPPORT_EMAIL, SUPPORT_EMAIL_URL, SUPPORT_URL } from '@/lib/site';
import { pageHead } from '@/lib/metadata';
export const Route = createFileRoute('/_authenticated/dashboard/support')({ head: () => pageHead('Technical support','Contact Quantum technical support.'), component: Support });
function Support() { return <section><h1 className="font-display text-2xl font-bold">Technical Support</h1><div className="mt-6 flex flex-wrap gap-3"><Button asChild><a href={SUPPORT_URL} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" />Telegram support</a></Button><Button asChild variant="outline"><a href={SUPPORT_EMAIL_URL}><Mail className="h-4 w-4 text-editorial" />{SUPPORT_EMAIL}</a></Button></div></section>; }