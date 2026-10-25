import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '@/components/site-chrome';
import { Marketplace, botCatalogOptions } from '@/components/bot-marketplace';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/get-bot-file/')({head:()=>pageHead('Get Bot File | Forex Trading Bots','Explore Forex trading bot files for MT5 and MT4. One-time purchases and private paid downloads.'),loader:({context})=>context.queryClient.ensureQueryData(botCatalogOptions),component:Catalog});
function Catalog(){const data=Route.useLoaderData();return <PublicLayout><Marketplace data={data} /></PublicLayout>;}
