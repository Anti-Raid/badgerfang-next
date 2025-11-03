import React, { memo } from 'react';
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

const Flow = memo(function Flow({ flowData, onChange }: Props) {
	return (
		<div className="flex flex-auto overflow-y-hidden relative">
			<div className="flex flex-row h-full">
				<FlowNodeExplorer />
			</div>
			<div className="flex flex-row w-full h-full">
				<FlowEditor initialData={flowData} onChange={onChange} />
			</div>
		</div>
	);
});

export default Flow;
