import { FlowData } from '@/lib/flow/data';
import FlowEditor from './management/FlowEditor';
import FlowNodeExplorer from './ui/NodeToolbar';

interface Props {
	/**
	 * Flow data to be displayed and edited. This will ultimately compile down to Luau
	 */
	flowData: FlowData;
	/**
	 * On change handler that is called whenever the flow data changes.
	 */
	onChange: () => void;
}

export default function Flow({ flowData, onChange }: Props) {
	return (
		<div className="flex flex-auto overflow-y-hidden relative">
			<div className="flex-none">
				<FlowNodeExplorer />
			</div>
			<div className="flex-auto">
				<FlowEditor initialData={flowData} onChange={onChange} />
			</div>
		</div>
	);
}
