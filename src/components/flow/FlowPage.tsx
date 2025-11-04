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
