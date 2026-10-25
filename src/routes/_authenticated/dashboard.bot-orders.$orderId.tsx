import { createFileRoute } from '@tanstack/react-router';
import { BotCheckout, botOrderOptions } from '@/components/bot-orders';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/_authenticated/dashboard/bot-orders/$orderId')({head:()=>pageHead('Bot File Checkout','Complete your one-time Forex bot payment and access verified private downloads.'),loader:({context})=>context.queryClient.ensureQueryData(botOrderOptions),component:Checkout});
function Checkout(){const {orderId}=Route.useParams();return <BotCheckout orderId={orderId} />;}