import { createFileRoute } from '@tanstack/react-router';
import { FFlagEditor } from './-Editor';

export const Route = createFileRoute('/debug/fflag/')({
	component: FFlagPage
});

function FFlagPage() {
	return (
		<>
			<h2 className="text-lg">FFlag Editor</h2>
			<FFlagEditor />
		</>
	);
}
