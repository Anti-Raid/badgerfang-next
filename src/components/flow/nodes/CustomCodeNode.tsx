import { Position, useReactFlow } from '@xyflow/react';
import FlowNodeBase from './BaseNode';
import { NodeProps, NodeTypeEnum, registerValidationSource } from '@/lib/flow/data';
import { useEffect, useState } from 'react';
import { InputField } from '../utils/Inputs';
import { FlowExpanded } from '../management/FlowExpanded';
import logger from '@/lib/logger';
import Handle from '../ui/Handle';

// Static validation for CustomCode: CustomCode nodes can only have one source connection and one target connection.
registerValidationSource('custom_code', (srcCons: string[], tgtCons: string[]) => {
	if (tgtCons.length > 1) {
		logger.error('Flow.CustomCode', 'CustomCode can only have one target connection.');
		return false;
	}

	if (srcCons.length > 1) {
		logger.error('Flow.CustomCode', 'CustomCode can only have one source connection.');
		return false;
	}
	return true;
});

export default function CustomCode(props: NodeProps) {
	if (props?.data?.type != NodeTypeEnum.CustomCode) {
		return <div className="text-red-500">Invalid node type: {props?.data?.type}</div>;
	}

	const flow = useReactFlow();
	const [code, setCode] = useState<string>(props.data.data.code || '');

	useEffect(() => {
		flow.updateNodeData(props.id, {
			data: {
				code
			}
		});
	}, [code, props.id]);

	return (
		<FlowNodeBase {...props}>
			<Handle type="target" position={Position.Top} />
			<Handle type="source" position={Position.Bottom} />

			<FlowExpanded nodeProps={props}>
				<InputField
					id={`${props.id}-code`}
					label="Code"
					type="textarea"
					value={code}
					onChange={(e) => setCode(e.target.value)}
					placeholder="Enter variable name"
					className="w-full"
				/>
			</FlowExpanded>
		</FlowNodeBase>
	);
}
