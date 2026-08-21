import type { DisplayElement } from '@/lib/settings/events.parse';
import { ErrorBox } from './ErrorBox';

export function DisplayElementView({ el }: { el: DisplayElement }) {
	if (el.type === 'Header') {
		return (
			<div className="flex items-center gap-4 mb-5 mt-8 first:mt-0">
				<h2 className="text-lg font-bold text-foreground tracking-tight whitespace-nowrap">
					{el.text}
				</h2>
				<div className="h-px bg-border flex-1" />
			</div>
		);
	}
	if (el.type === 'Paragraph') {
		return <p className="text-muted-foreground mb-6 text-lg">{el.text}</p>;
	}
	return <ErrorBox error={el.error} />;
}
