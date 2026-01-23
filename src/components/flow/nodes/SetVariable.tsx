import { Position, useReactFlow } from '@xyflow/react';
import FlowNodeBase from '../ui/BaseNode';
import {
	NodeProps,
	NodeTypeEnum,
	registerValidationSource,
	TypedInput,
	TypedInputEnum
} from '@/lib/flow/data';
import { useEffect, useState } from 'react';
import { InputField } from '../ui/Inputs';
import { FlowExpanded } from '../management/FlowExpanded';
import logger from '@/lib/logger';
import Handle from '../ui/Handle';
import { TypedInputField } from '../ui/TypedInput';

// Static validation for SetVariable: SetVariable nodes can only have one source connection and one target connection.
registerValidationSource('set_variable', (srcCons: string[], tgtCons: string[]) => {
	if (tgtCons.length > 1) {
		logger.error('Flow.SetVariable', 'SetVariable can only have one target connection.');
		return false;
	}

	if (srcCons.length > 1) {
		logger.error('Flow.SetVariable', 'SetVariable can only have one source connection.');
		return false;
	}
	return true;
});

/**
 * Render a "Set Variable" flow node with editable name and typed value, and persist changes to the flow store.
 *
 * Renders a node containing inputs for the variable's name and a typed value, wires top and bottom handles for connections, and updates the flow node's data whenever the name or value changes.
 *
 * @param props - The React Flow node props for a SetVariable node. If `props.data.type` is not `NodeTypeEnum.SetVariable`, a validation error message is rendered.
 * @returns The JSX element for the Set Variable node UI.
 */
export default function SetVariable(props: NodeProps) {
	if (props?.data?.type != NodeTypeEnum.SetVariable) {
		return <div className="text-red-500">Invalid node type: {props?.data?.type}</div>;
	}

	const flow = useReactFlow();
	const [variableName, setVariableName] = useState<string>(props.data.data.name || '');
	const [variableValue, setVariableValue] = useState<TypedInput>(
		props.data.data.value || { type: TypedInputEnum.Nil }
	);

	useEffect(() => {
		flow.updateNodeData(props.id, {
			data: {
				name: variableName,
				value: variableValue
			}
		});
	}, [variableName, variableValue, props.id, flow]);

	return (
		<FlowNodeBase
			{...props}
			title={props.data.data.name ? `Set Variable ${props.data.data.name}` : 'Set Variable'}
			className="bg-blue-100 hover:bg-blue-200"
		>
			<Handle type="target" position={Position.Top} />
			<Handle type="source" position={Position.Bottom} />

			<FlowExpanded nodeProps={props}>
				<InputField
					id={`${props.id}-variable-name`}
					label="Variable Name"
					value={variableName}
					onChange={(e) => {
						setVariableName(e.target.value);
					}}
					placeholder="Enter variable name"
					className="w-full"
					error={!variableName ? 'Variable name is required.' : ''}
				/>

				<TypedInputField
					id={`${props.id}-variable-value`}
					label="Variable Value"
					value={variableValue}
					onChange={(value) => {
						setVariableValue(value);
					}}
					placeholder="Enter variable value"
					className="w-full"
					aria-label="Variable Value"
				/>
			</FlowExpanded>
		</FlowNodeBase>
	);
}
