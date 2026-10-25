import { createFileRoute } from '@tanstack/react-router';
import { BotOrders, botOrderOptions } from '@/components/bot-orders';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/_authenticated/dashboard/bot-orders/')({head:()=>pageHead('My Bot File Orders','Track your one-time Forex trading bot purchases and payment verification.'),loader:({context})=>context.queryClient.ensureQueryData(botOrderOptions),component:()=> <BotOrders />});