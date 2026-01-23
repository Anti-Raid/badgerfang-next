import { createFileRoute } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { TemplateShop } from '@/components/scripts/scriptShop';
import { listTemplateShop } from '@/lib/api';
import { generateScriptMetadata } from '@/lib/Metadata';
import { website_url } from '@/components/common';
import { Zap, ArrowRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Primary } from '@/components/ui/Buttons';

const shopQueryOptions = queryOptions({
	queryKey: ['shop'],
	queryFn: listTemplateShop
});

export const Route = createFileRoute('/script/shop/')({
	loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(shopQueryOptions),
	component: TemplateShopPage,
	head: () =>
		generateScriptMetadata({
			canonicalUrl: `${website_url}/script/shop`
		}),
	// Enable SSR for better SEO
	ssr: true,
	errorComponent: ShopErrorComponent
});

function ShopErrorComponent() {
	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden p-4">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
				<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
			</div>

			{/* Content */}
			<div className="relative z-10 max-w-2xl mx-auto text-center">
				<div className="mb-8 inline-flex items-center justify-center">
					<div className="relative">
						<div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse" />
						<div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/50 border border-primary/50">
							<Zap className="w-10 h-10 text-primary-foreground animate-bounce" />
						</div>
					</div>
				</div>

				<h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
					Script Shop
				</h1>

				<p className="text-xl text-muted-foreground mb-4 leading-relaxed">
					Currently disabled as the template shop is being rethought
				</p>

				<p className="text-base text-muted-foreground/80 mb-8 max-w-lg mx-auto">
					We're working on bringing you an even better experience for discovering and managing scripts. Check back soon!
				</p>

				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<Link to="/">
						<Primary Title="Return Home" icon={ArrowRight} onClick={() => {}} />
					</Link>
					<Link to="/commands">
						<Primary Title="View Commands" icon={Zap} onClick={() => {}} />
					</Link>
				</div>

				{/* Stats cards */}
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12 pt-8 border-t border-primary/10">
					<div className="p-4 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/30 transition-colors">
						<div className="text-2xl font-bold text-primary">100+</div>
						<div className="text-sm text-muted-foreground">Templates</div>
					</div>
					<div className="p-4 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/30 transition-colors">
						<div className="text-2xl font-bold text-primary">50k+</div>
						<div className="text-sm text-muted-foreground">Users</div>
					</div>
					<div className="p-4 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/30 transition-colors">
						<div className="text-2xl font-bold text-primary">99%</div>
						<div className="text-sm text-muted-foreground">Uptime</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function TemplateShopPage() {
	const { data: templates } = useSuspenseQuery(shopQueryOptions);

	return (
		<div className="min-h-screen">
			<div className="relative overflow-hidden">
				<TemplateShop data={templates || []} />
			</div>
		</div>
	);
}
