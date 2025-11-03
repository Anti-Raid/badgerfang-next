// Originated from Kite
// SPDX: GPL-3.0
import { SubflowData, SubflowNodeType } from '@/lib/flow/subnode';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import SubFlow from './Subflow';

interface Props {
	flowData: SubflowData;
	onChange: (data: SubflowData) => void;
}

function InnerSubFlow({ flowData, onChange }: Props) {
	const { getNodes, getEdges } = useReactFlow<SubflowNodeType>();

	const save = () => {
		onChange({
			nodes: getNodes(),
			edges: getEdges()
		});
	};

	return (
		<div className="flex flex-col">
			<SubFlow flowData={flowData} onChange={save} />
		</div>
	);
}

export default function SubflowSection(props: Props) {
	return (
		<>
			<ReactFlowProvider>
				<InnerSubFlow {...props} />
			</ReactFlowProvider>
		</>
	);
}
