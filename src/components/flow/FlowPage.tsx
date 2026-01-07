// Originated from Kite
// SPDX: GPL-3.0
import { FlowData, NodeType } from '@/lib/flow/data';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import Flow from './Flow';
import FlowExpandedArea from './ui/FlowExpandedArea';
import { FlowHPaneProvider } from './management/FlowHPaneProvider';

interface Props {
	flowData: FlowData;
	onChange: (data: FlowData) => void;
}

function InnerFlowPage({ flowData, onChange }: Props) {
	const { getNodes, getEdges } = useReactFlow<NodeType>();

	const save = () => {
		onChange({
			nodes: getNodes(),
			edges: getEdges()
		});
	};

	return (
		<div className="h-[75dvh] w-[85dvw] flex flex-col">
			<Flow flowData={flowData} onChange={save} />
		</div>
	);
}

/**
 * Render the flow editor page wrapped with layout and React Flow providers.
 *
 * @param props - Component props containing flow data and change handler for the editor
 * @returns The page element composed of FlowHPaneProvider, ReactFlowProvider with InnerFlowPage, and the FlowExpandedArea pane
 */
export default function FlowPage(props: Props) {
	return (
		<FlowHPaneProvider>
			<ReactFlowProvider>
				<InnerFlowPage {...props} />
			</ReactFlowProvider>

			<div className="w-[85dvw]">
				<FlowExpandedArea />
			</div>
		</FlowHPaneProvider>
	);
}
