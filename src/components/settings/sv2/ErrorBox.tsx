import { AlertCircle } from 'lucide-react';

export function ErrorBox({ error }: { error: string | null | undefined }) {
	if (!error) return null;
	return (
		<div
			className="p-4 mb-4 text-sm text-destructive rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3"
			role="alert"
		>
			<AlertCircle className="shrink-0 w-4 h-4 mt-0.5" aria-hidden="true" />
			<span className="sr-only">Error</span>
			<code className="whitespace-pre-wrap font-sans text-sm">{error}</code>
		</div>
	);
}
