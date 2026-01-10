import { FFlagEditor } from './Editor';

/**
 * Page component that renders the feature-flag (FFlag) editor heading and editor UI.
 *
 * @returns The JSX element for the FFlag editor page.
 */
export default function FFlagPage() {
	return (
		<>
			<h2 className="text-lg">FFlag Editor</h2>
			<FFlagEditor />
		</>
	);
}
