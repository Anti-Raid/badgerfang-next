import { createFileRoute } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { TemplateShop } from '@/components/scripts/scriptShop';
import { listTemplateShop } from '@/lib/api';
import { generateScriptMetadata } from '@/lib/Metadata';
import { website_url } from '@/components/common';

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
	// Shop data depends on client session token for msyscall auth.
	// Rendering on the client avoids SSR-only fetch failures.
	ssr: false
});

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
