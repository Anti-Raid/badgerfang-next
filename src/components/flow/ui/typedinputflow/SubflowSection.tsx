// Originated from Kite
// SPDX: GPL-3.0
import { SubflowData, SubflowNodeType } from '@/lib/flow/subnode';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import SubFlow from './Subflow';

interface Props {
	flowData: SubflowData;
	onChange: (data: SubflowData) => void;
	id: string;
}

/**
 * Renders a SubFlow and provides a save callback that captures the current React Flow nodes and edges and forwards them via `onChange`.
 *
 * @param flowData - Initial subflow data to render in the SubFlow component
 * @param onChange - Callback invoked with an object containing `nodes` and `edges` when the SubFlow triggers save
 * @param id - Identifier passed to the SubFlow component
 * @returns The rendered SubFlow wrapped in a vertical container
 */
function InnerSubFlow({ flowData, onChange, id }: Props) {
	const { getNodes, getEdges } = useReactFlow<SubflowNodeType>();

	const save = () => {
		onChange({
			nodes: getNodes(),
			edges: getEdges()
		});
	};

	return (
		<div className="flex flex-col">
			<SubFlow flowData={flowData} onChange={save} id={id} />
		</div>
	);
}

/**
 * Render a subflow UI section with React Flow context provided.
 *
 * @param props - Component props containing the subflow data, an `onChange` callback invoked with updated `SubflowData`, and the subflow `id`.
 * @returns A React element that provides React Flow context and renders the subflow UI. 
 */
export default function SubflowSection(props: Props) {
	return (
		<>
			<ReactFlowProvider>
				<InnerSubFlow {...props} />
			</ReactFlowProvider>
		</>
	);
}