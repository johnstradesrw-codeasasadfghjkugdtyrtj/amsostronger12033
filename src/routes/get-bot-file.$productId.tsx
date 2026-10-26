import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '@/components/site-chrome';
import { BotProduct, botCatalogOptions } from '@/components/bot-marketplace';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/get-bot-file/$productId')({loader:({context})=>context.queryClient.ensureQueryData(botCatalogOptions),head:({loaderData,params})=>{const p=loaderData?.products.find(p=>p.id===params.productId);return pageHead(p?`${p.name} | Forex Trading Bot`:'Forex Bot File Details',p?`${p.name} on Quantum Multi Assets Matrix. ${p.short_description || 'View installation instructions and the one-time purchase price.'}`:'View Forex trading bot details, installation instructions and one-time prices on Quantum Multi Assets Matrix.');},component:Product});
function Product(){const {productId}=Route.useParams();return <PublicLayout><BotProduct productId={productId} data={Route.useLoaderData()} /></PublicLayout>;}