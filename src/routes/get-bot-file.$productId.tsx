import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '@/components/site-chrome';
import { BotProduct, botCatalogOptions } from '@/components/bot-marketplace';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/get-bot-file/$productId')({loader:({context})=>context.queryClient.ensureQueryData(botCatalogOptions),head:({loaderData,params})=>{const p=loaderData?.products.find(p=>p.id===params.productId);return pageHead(p?`${p.name} | Forex Trading Bot`:'Forex Bot File Details',p?.short_description||'View Forex trading bot details, installation instructions and one-time price.');},component:Product});
function Product(){const {productId}=Route.useParams();return <PublicLayout><BotProduct productId={productId} /></PublicLayout>;}