'use client';

import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ScriptLayout } from '@/components/scripts/scriptLayout';
import { templateShopItemOptions } from '@/lib/api';

export default function ScriptPage() {
	const params = useParams({ strict: false });
	const scriptName = params.name as string;

	const { data: script, isLoading, error } = useQuery(templateShopItemOptions(scriptName));

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
			</div>
		);
	}

	if (error || !script) {
		const errorMessage = error instanceof Error ? error.message : 'Script not found';
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-center p-8 max-w-md">
					<h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Script</h2>
					<p className="text-muted-foreground">{errorMessage}</p>
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
