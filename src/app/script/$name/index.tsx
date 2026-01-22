import { createFileRoute } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { ScriptLayout } from '@/components/scripts/scriptLayout';
import { getTemplateShop } from '@/lib/api';

import { templateShopItemOptions } from '@/lib/api';

export const Route = createFileRoute('/script/$name/')({
	loader: ({ context: { queryClient }, params }) =>
		queryClient.ensureQueryData(templateShopItemOptions(params.name)),
	component: ScriptPage,
	errorComponent: () => (
		<div className="flex justify-center items-center min-h-screen">
			Script not found or error loading.
		</div>
	),
	head: ({ params }) => ({
		meta: [
			{ name: 'robots', content: 'index, follow' },
			{ property: 'og:type', content: 'article' },
			{ property: 'og:title', content: `Script: ${params.name}` }
		]
	}),
	// Enable SSR for better SEO
	ssr: true
});

function ScriptPage() {
	const { name } = Route.useParams();
	const { data: script } = useSuspenseQuery(templateShopItemOptions(name));

	if (!script) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-center p-8 max-w-md">
					<h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Script</h2>
					<p className="text-muted-foreground">Script not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<ScriptLayout script={script} files={script.content} />
		</div>
	);
}
