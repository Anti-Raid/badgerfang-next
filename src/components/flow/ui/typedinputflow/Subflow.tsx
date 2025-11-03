import React, { memo } from 'react';
import { SubflowData } from '@/lib/flow/subnode';
import { BaseSubflow } from './BaseSubflow';

interface Props {
	/**
	 * Subflow data to be displayed and edited.
	 */
	flowData: SubflowData;
	/**
	 * On change handler that is called whenever the subflow data changes.
	 */
	onChange: () => void;
}

const SubFlow = memo(function SubFlow({ flowData, onChange }: Props) {
	return (
		<div className="flex flex-auto overflow-y-hidden relative">
			{/*<div className="flex flex-row w-full h-full">
                <FlowNodeExplorer />
            </div>*/}
			<div className="flex flex-row w-full h-full">
				<BaseSubflow initialData={flowData} onChange={onChange} />
			</div>
		</div>
	);
});

export default SubFlow;
