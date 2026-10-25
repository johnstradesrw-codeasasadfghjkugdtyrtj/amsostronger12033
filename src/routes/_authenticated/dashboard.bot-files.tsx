import { createFileRoute } from '@tanstack/react-router';
import { BotOrders, botOrderOptions } from '@/components/bot-orders';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/_authenticated/dashboard/bot-files')({head:()=>pageHead('My Bot Files','Download your purchased Forex trading bot files and installation guides.'),loader:({context})=>context.queryClient.ensureQueryData(botOrderOptions),component:()=> <BotOrders files />});