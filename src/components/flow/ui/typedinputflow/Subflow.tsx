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
	/**
	 * Unique identifier for the subflow instance.
	 */
	id: string;
}

const SubFlow = memo(function SubFlow({ flowData, onChange, id }: Props) {
	return (
		<div className="flex flex-auto overflow-y-hidden relative">
			<div className="flex flex-row w-full h-[28vh] pointer-events-auto">
				<BaseSubflow initialData={flowData} onChange={onChange} id={id} />
			</div>
		</div>
	);
});

export default SubFlow;
