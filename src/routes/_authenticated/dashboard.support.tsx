import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { SUPPORT_URL } from '@/lib/site';
import { pageHead } from '@/lib/metadata';
export const Route = createFileRoute('/_authenticated/dashboard/support')({ head: () => pageHead('Technical support','Contact Quantum technical support.'), component: Support });
function Support() { return <section><h1 className="font-display text-2xl font-bold">Technical Support</h1><Button asChild className="mt-6"><a href={SUPPORT_URL} target="_blank" rel="noreferrer">Contact Technical Support</a></Button></section>; }