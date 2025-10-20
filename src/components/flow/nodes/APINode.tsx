import { Position, useReactFlow } from '@xyflow/react';
import FlowNodeBase from '../ui/BaseNode';
import {
	NodeProps,
	NodeTypeEnum,
	registerValidationSource,
	TypedInput,
	TypedInputEnum
} from '@/lib/flow/data';
import { useEffect, useMemo, useState } from 'react';
import { InputField } from '../ui/Inputs';
import { FlowExpanded } from '../management/FlowExpanded';
import logger from '@/lib/logger';
import Handle from '../ui/Handle';
import { generateTypedInputId, TypedInputField } from '../ui/TypedInput';
import { Field, Node as NodeIDLNode, FieldData } from '@/lib/flow/nodeidl/nodeidl';
import { fieldToIDLInput, idlInputToField } from './NodeFromIDL';
import { createNode, getEdgeId, nodeIdls } from '@/lib/flow/nodes';
import { IDLInput, IDLInputField } from '../ui/IDLInput';

registerValidationSource('api_node', (srcCons: string[], tgtCons: string[]) => {
	// For now, allow any number of connections - this will be refined based on nodeidl schema
	return true;
});

export default function APINode(props: NodeProps) {
	if (props?.data?.type !== NodeTypeEnum.APINode) {
		return <div className="text-red-500">Invalid node type: {props?.data?.type}</div>;
	}

	if (
		!props?.data?.data ||
		props?.data?.data?.inputValues === undefined ||
		typeof props?.data?.data?.inputValues != 'object'
	) {
		return <div className="text-red-500">No node data found</div>;
	}

	// Type assertion after the type check
	const nodeidl = nodeIdls.get(props.data.data.nodeidl);

	if (!nodeidl) {
		return <div className="text-red-500">Invalid nodeidl: {props.data.data.nodeidl}</div>;
	}

	const inpValues = props.data.data.inputValues;
	const inp = useMemo(
		() => fieldToIDLInput(nodeidl.flowui.input, inpValues),
		[props.data.data.inputValues]
	);

	const flow = useReactFlow();
	const [inputValues, setInputValues] = useState<IDLInput>(inp);

	return (
		<FlowNodeBase
			{...props}
			title={nodeidl?.shortname || 'API Node'}
			className="bg-purple-100 hover:bg-purple-200"
		>
			{nodeidl?.flowui?.handles?.allow?.includes('top') && (
				<Handle key="top" type="target" position={Position.Top} />
			)}

			{nodeidl?.flowui?.handles?.allow?.includes('bottom') && (
				<Handle key="bottom" type="source" position={Position.Bottom} />
			)}

			<FlowExpanded
				nodeProps={props}
				onDone={() => {
					flow.updateNodeData(props.id, {
						data: {
							nodeidl: nodeidl.id,
							inputValues: idlInputToField(inputValues)
						}
					});
				}}
			>
				<div className="space-y-4">
					<div className="space-y-4">
						{/* Node IDL Info */}
						<div className="p-3 bg-muted/50 rounded-lg">
							<div className="flex items-center justify-between">
								<div>
									<div className="text-sm font-medium text-foreground">
										{nodeidl?.shortname || 'Unknown Node'}
									</div>
									<div className="text-xs text-muted-foreground">
										{nodeidl?.description || 'No description available'}
									</div>
								</div>
							</div>
						</div>

						{/* Input Fields */}
						<div className="space-y-3">
							<IDLInputField value={inputValues} onChange={setInputValues} />
						</div>
					</div>
				</div>
			</FlowExpanded>
		</FlowNodeBase>
	);
}
