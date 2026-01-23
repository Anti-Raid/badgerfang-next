/**
For if statements in flow:

1. a if statement can only have one non-continuing connection but may have an arbitrary number of continuing connections with the exception that an if may only have one connection to a end (a continuing connection is a connection targeting elseif, else or end)

2. A elseif or else block may only be connected to a if source

For loops in flow:

For loops can only have one source connection but may have two targets of which one must be the loop body and the other must be a end condition.
 */

import { Connection, Edge, Node, Position, useReactFlow } from '@xyflow/react';
import FlowNodeBase from '../ui/BaseNode';
import Handle from '../ui/Handle';
import {
	ForLoopType,
	ForLoopTypeEnum,
	NodeData,
	NodeExtData,
	NodeProps,
	NodeTypeEnum,
	registerValidationSource,
	registerValidationTarget,
	TypedInput,
	TypedInputEnum
} from '@/lib/flow/data';
import { useEffect, useState } from 'react';
import { BaseLabelAndDescription, InputField } from '../ui/Inputs';
import { generateTypedInputId, TypedInputField } from '../ui/TypedInput';
import { FlowExpanded } from '../management/FlowExpanded';
import logger from '@/lib/logger';
import React from 'react';
import { Ghost } from '@/components/ui/Buttons';

// Static validation for if_condition: If conditions have rule 1 for source connections, meaning they can only have one source connection
registerValidationSource(
	'if_condition',
	(
		srcCons: string[],
		tgtCons: string[],
		edge: Edge | Connection,
		source: Node<NodeExtData>,
		target: Node<NodeExtData>,
		getNode
	) => {
		let numContinuationConnections = 0;
		let numEnds = 0; // Number of end connections
		let numBlocks = 0; // Non-continuing connections

		const addNode = (nodeId: string): boolean => {
			const node = getNode(nodeId);
			if (!node) {
				// If the node type is not defined, we cannot validate it
				return false;
			}

			//console.log("Adding in node:", { nodeId: nodeId, nodeType: node.type, node, numContinuationConnections, numEnds, numBlocks });

			if (
				node.data.type === NodeTypeEnum.ElseIfCondition ||
				node.data.type === NodeTypeEnum.ElseCondition ||
				node.data.type === NodeTypeEnum.EndCondition
			) {
				numContinuationConnections++;

				if (node.data.type === NodeTypeEnum.EndCondition) {
					numEnds++;
				}
			} else {
				numBlocks++;
			}

			return numBlocks <= 1 && numEnds <= 1;
		};

		if (!addNode(target.id)) {
			return false;
		}

		for (const conn of srcCons) {
			if (!addNode(conn)) {
				return false;
			}
		}

		return true;
	}
);

// Static validation for elseif_condition: ElseIf conditions can only have one source connection and also can only be connected to an IfCondition or ElseIfCondition node.
registerValidationTarget(
	'elseif_condition',
	(
		srcCons: string[],
		tgtCons: string[],
		edge: Edge | Connection,
		source: Node<NodeData>,
		target: Node<NodeData>,
		getNode
	) => {
		if (tgtCons.length >= 1) {
			logger.error('Flow.ElseIfCondition', 'ElseIfCondition can only have one source connection.');
			return false;
		}

		let srcData = getNode(source.id);
		if (!srcData) {
			logger.error('Flow.ElseIfCondition', 'Source node data not found for ElseIfCondition.');
			return false;
		}

		if (srcData.data.type !== NodeTypeEnum.IfCondition) {
			logger.error(
				'Flow.ElseIfCondition',
				'ElseIfCondition can only be connected to an IfCondition node.'
			);
			return false;
		}

		return true;
	}
);

// Static validation for end_condition: ElseIf conditions can only have one source connection and also can only be connected to an IfCondition or ElseIfCondition node.
registerValidationTarget(
	'end_condition',
	(
		srcCons: string[],
		tgtCons: string[],
		edge: Edge | Connection,
		source: Node<NodeData>,
		target: Node<NodeData>,
		getNode
	) => {
		if (tgtCons.length >= 1) {
			logger.error('Flow.EndCondition', 'EndCondition can only have one source connection.');
			return false;
		}

		let srcData = getNode(source.id);
		if (!srcData) {
			logger.error('Flow.EndCondition', 'Source node data not found for EndCondition.');
			return false;
		}

		if (
			![NodeTypeEnum.IfCondition, NodeTypeEnum.ForLoop, NodeTypeEnum.WhileLoop].includes(
				srcData.data.type
			)
		) {
			logger.error(
				'Flow.EndCondition',
				'EndCondition can only be connected to an IfCondition/ForLoop node.'
			);
			return false;
		}

		return true;
	}
);

export const IfCondition = (props: NodeProps) => {
	if (props?.data?.type != NodeTypeEnum.IfCondition) {
		return <div className="text-red-500">Invalid node type: {props?.data?.type}</div>;
	}

	const flow = useReactFlow();

	const [value, setValue] = useState<TypedInput>(
		props.data.data.condition || {
			type: TypedInputEnum.ComplexSubflow,
			flow: {
				nodes: [],
				edges: []
			}
		}
	);

	useEffect(() => {
		flow.updateNodeData(props.id, {
			data: {
				condition: value
			}
		});
	}, [value, props.id]);

	return (
		<FlowNodeBase {...props}>
			{/*If statement can accept connections from anywhere*/}
			<Handle type="target" position={Position.Top} />
			{/*If statement have rule 1 for source connections*/}
			<Handle type="source" position={Position.Bottom} />

			<FlowExpanded nodeProps={props}>
				<TypedInputField value={value} onChange={setValue} />
			</FlowExpanded>
		</FlowNodeBase>
	);
};

export const ElseIfCondition = (props: NodeProps) => {
	if (props?.data?.type != NodeTypeEnum.ElseIfCondition) {
		return <div className="text-red-500">Invalid node type: {props?.data?.type}</div>;
	}

	const flow = useReactFlow();

	const [value, setValue] = useState<TypedInput>(
		props.data.data.condition || {
			type: TypedInputEnum.ComplexSubflow,
			flow: {
				nodes: [],
				edges: []
			}
		}
	);
	const [index, setIndex] = useState<number>(props.data.data.index || 0);

	useEffect(() => {
		flow.updateNodeData(props.id, {
			data: {
				condition: value,
				index: index
			}
		});
	}, [value, index, props.id]);

	return (
		<FlowNodeBase {...props}>
			<Handle type="target" position={Position.Top} />
			<Handle type="source" position={Position.Bottom} />

			<FlowExpanded nodeProps={props}>
				<InputField
					id={`${props.id}-index`}
					label="Index"
					value={index?.toString()}
					type="number"
					onChange={(e) => {
						const value = parseInt(e.target.value);
						if (!isNaN(value)) {
							setIndex(value);
						} else {
							setIndex(1); // Reset to 1 if invalid input
						}
					}}
					placeholder="Index in chain"
					className="w-full"
					error={!index ? 'Index is required.' : ''}
				/>

				<TypedInputField value={value} onChange={setValue} />
			</FlowExpanded>
		</FlowNodeBase>
	);
};

export const EndCondition = (props: NodeProps) => {
	if (props?.data?.type != NodeTypeEnum.EndCondition) {
		return <div className="text-red-500">Invalid node type: {props?.data?.type}</div>;
	}

	return (
		<FlowNodeBase {...props}>
			<Handle type="target" position={Position.Top} />
			<Handle type="source" position={Position.Bottom} />
		</FlowNodeBase>
	);
};

// Static validation for ForLoop: ForLoop nodes can only have one source connection and one target connection.
registerValidationSource(
	'for_loop',
	(
		srcCons: string[],
		_tgtCons: string[],
		_edge: Edge | Connection,
		_source: Node<NodeData>,
		target: Node<NodeData>,
		getNode
	) => {
		let numContinuationConnections = 0;
		let numEnds = 0; // Number of end connections
		let numBlocks = 0; // Non-continuing connections

		const addNode = (nodeId: string): boolean => {
			const node = getNode(nodeId);
			if (!node) {
				// If the node type is not defined, we cannot validate it
				return false;
			}

			if (
				node.data.type === NodeTypeEnum.ElseIfCondition ||
				node.data.type === NodeTypeEnum.ElseCondition
			) {
				return false; // ForLoop cannot have ElseIf or Else conditions
			}

			if (node.data.type === NodeTypeEnum.EndCondition) {
				numEnds++;
			} else {
				numBlocks++;
			}

			return numBlocks <= 1 && numEnds <= 1;
		};

		if (!addNode(target.id)) {
			return false;
		}

		for (const conn of srcCons) {
			if (!addNode(conn)) {
				return false;
			}
		}

		return true;
	}
);

export const ForLoop = (props: NodeProps) => {
	if (props?.data?.type != NodeTypeEnum.ForLoop) {
		return <div className="text-red-500">Invalid node type: {props?.data?.type}</div>;
	}

	const flow = useReactFlow();

	const [condition, setCondition] = useState<ForLoopType>(
		props.data.data.condition || {
			type: ForLoopTypeEnum.GeneralizedIteration,
			varbinds: [],
			iterable: {
				type: TypedInputEnum.String,
				value: ''
			}
		}
	);

	useEffect(() => {
		flow.updateNodeData(props.id, {
			data: {
				condition: condition
			}
		});
	}, [condition, props.id]);

	return (
		<FlowNodeBase {...props}>
			<Handle type="target" position={Position.Top} />
			<Handle type="source" position={Position.Bottom} />

			<FlowExpanded nodeProps={props}>
				<ForLoopTypeInputField
					id={`${props.id}-condition`}
					value={condition}
					onChange={setCondition}
				/>
			</FlowExpanded>
		</FlowNodeBase>
	);
};

interface ForLoopTypeProps {
	value: ForLoopType;
	onChange: (data: ForLoopType) => void;
	id: string;
	disabled?: boolean;
}

export const ForLoopTypeInputField: React.FC<ForLoopTypeProps> = ({
	value,
	disabled = false,
	onChange,
	id
}) => {
	return (
		<>
			<InputField
				label="Type"
				description="The type of for loop"
				value={value.type}
				type="select"
				options={[
					{ value: ForLoopTypeEnum.GeneralizedIteration, label: 'Iterate over value' },
					{ value: ForLoopTypeEnum.Range, label: 'Range/Numeric For' },
					{ value: ForLoopTypeEnum.Raw, label: 'Raw Condition' }
				]}
				onChange={(e) => {
					if (disabled) return;
					const newType = e.target.value as ForLoopTypeEnum;
					let newValue: ForLoopType;

					switch (newType) {
						case ForLoopTypeEnum.GeneralizedIteration:
							newValue = {
								type: ForLoopTypeEnum.GeneralizedIteration,
								varbinds: [],
								iterable: {
									type: TypedInputEnum.TableArray,
									value: [],
									inline: true
								}
							};
							break;
						case ForLoopTypeEnum.Range:
							newValue = {
								type: ForLoopTypeEnum.Range,
								varbind: 'i',
								start: 0,
								end: 0
							};
							break;
						case ForLoopTypeEnum.Raw:
							newValue = {
								type: ForLoopTypeEnum.Raw,
								condition: ''
							};
							break;
						default:
							throw new Error('Unknown for loop type');
					}

					onChange(newValue);
				}}
			/>

			{value.type === ForLoopTypeEnum.GeneralizedIteration ? (
				<>
					<TypedInputField
						label="Iterable"
						description="The iterable to loop over"
						value={value.iterable}
						onChange={(data) =>
							onChange({
								...value,
								iterable: data
							})
						}
						id={`${id}-iterable`}
						placeholder="Enter iterable"
						disabled={disabled}
					/>

					{/* Edge case: no inputs in array, so we just show a label and then have the 3 buttons below it */}
					{!value.varbinds ||
						(Array.isArray(value.varbinds) && value.varbinds.length === 0 && (
							<>
								<BaseLabelAndDescription
									id={`${id}-varbinds-label`}
									label={'Variable Binds'}
									description={'Variable binds available in the for loops body.'}
									marginClass="mb-1"
								/>

								<Ghost
									size="smallInline"
									Title="Add Element"
									disabled={disabled}
									onClick={() => {
										let newElement: any = '';
										const newArray = value.varbinds.toSpliced(1, 0, newElement);
										onChange({
											...value,
											varbinds: newArray
										});
									}}
								/>
							</>
						))}

					{value.varbinds.map((item, index) => (
						<React.Fragment key={index}>
							<InputField
								key={`${id}-varbinds-${index}`}
								label={`Variable Bind (${index + 1})`}
								id={`${id}-varbinds-${index}`}
								value={item}
								disabled={disabled}
								onChange={(e) => {
									if (disabled) return;
									const newArray = [...value.varbinds];
									newArray[index] = e.target.value;
									onChange({
										...value,
										varbinds: newArray
									});
								}}
							/>

							{!disabled && (
								<>
									<span className="mr-2">
										<Ghost
											size="smallInline"
											Title="Add Above"
											onClick={() => {
												let newElement: any = '';
												const newArray = value.varbinds.toSpliced(index, 0, newElement);
												onChange({
													...value,
													varbinds: newArray
												});
											}}
										/>
									</span>
									<span className="mr-2">
										<Ghost
											size="smallInline"
											Title="Add Below"
											onClick={() => {
												let newElement: any = '';
												const newArray = value.varbinds.toSpliced(index + 1, 0, newElement);
												onChange({
													...value,
													varbinds: newArray
												});
											}}
										/>
									</span>
									<span className="mr-2">
										<Ghost
											size="smallInline"
											Title="Delete"
											onClick={() => {
												const newArray = value.varbinds.filter((_, idx) => idx !== index);
												onChange({
													...value,
													varbinds: newArray
												});
											}}
										/>
									</span>
								</>
							)}
							{index != value.varbinds.length - 1 && <div className="mt-3"></div>}
						</React.Fragment>
					))}
				</>
			) : value.type == ForLoopTypeEnum.Range ? (
				<>
					<InputField
						label="Start"
						description="The start of the range"
						value={value.start?.toString() || ''}
						type="number"
						onChange={(e) => {
							const newValue = parseInt(e.target.value);
							if (!isNaN(newValue)) {
								onChange({
									...value,
									start: newValue
								});
							}
						}}
						id={`${id}-start`}
						placeholder="Enter start value"
						disabled={disabled}
					/>

					<InputField
						label="End"
						description="The end of the range"
						value={value.end?.toString() || ''}
						type="number"
						onChange={(e) => {
							const newValue = parseInt(e.target.value);
							if (!isNaN(newValue)) {
								onChange({
									...value,
									end: newValue
								});
							}
						}}
						id={`${id}-end`}
						placeholder="Enter end value"
						disabled={disabled}
					/>

					<InputField
						label="Step"
						description="The step value for the range (optional)"
						value={value.step?.toString() || ''}
						type="number"
						onChange={(e) => {
							const newValue = parseInt(e.target.value);
							if (!isNaN(newValue)) {
								onChange({
									...value,
									step: newValue
								});
							}
						}}
						id={`${id}-step`}
						placeholder="Enter step value (optional)"
						disabled={disabled}
					/>

					<Ghost
						Title="Clear Step"
						disabled={disabled}
						size="small"
						onClick={() => {
							if (disabled) return;
							onChange({
								...value,
								step: undefined
							});
						}}
					/>

					<InputField
						label="Variable Bind"
						description="The variable bind for the range loop"
						value={value.varbind || ''}
						onChange={(e) => {
							if (disabled) return;
							onChange({
								...value,
								varbind: e.target.value
							});
						}}
						id={`${id}-varbind`}
						placeholder="Enter variable bind"
						disabled={disabled}
					/>
				</>
			) : (
				<>
					<InputField
						label="Condition"
						description="The raw condition for the loop"
						value={value.condition || ''}
						onChange={(e) => {
							if (disabled) return;
							onChange({
								...value,
								condition: e.target.value
							});
						}}
						id={`${id}-condition`}
						placeholder="Enter raw condition"
						disabled={disabled}
					/>
				</>
			)}
		</>
	);
};

// Static validation for WhileLoop: WhileLoop nodes can only have one source connection and one target connection.
registerValidationSource(
	'while_loop',
	(
		srcCons: string[],
		_tgtCons: string[],
		_edge: Edge | Connection,
		_source: Node<NodeData>,
		target: Node<NodeData>,
		getNode
	) => {
		let numContinuationConnections = 0;
		let numEnds = 0; // Number of end connections
		let numBlocks = 0; // Non-continuing connections

		const addNode = (nodeId: string): boolean => {
			const node = getNode(nodeId);
			if (!node) {
				// If the node type is not defined, we cannot validate it
				return false;
			}

			if (
				node.data.type === NodeTypeEnum.ElseIfCondition ||
				node.data.type === NodeTypeEnum.ElseCondition
			) {
				return false; // WhileLoop cannot have ElseIf or Else conditions
			}

			if (node.data.type === NodeTypeEnum.EndCondition) {
				numEnds++;
			} else {
				numBlocks++;
			}

			return numBlocks <= 1 && numEnds <= 1;
		};

		if (!addNode(target.id)) {
			return false;
		}

		for (const conn of srcCons) {
			if (!addNode(conn)) {
				return false;
			}
		}

		return true;
	}
);

export const WhileLoop = (props: NodeProps) => {
	if (props?.data?.type != NodeTypeEnum.WhileLoop) {
		return <div className="text-red-500">Invalid node type: {props?.data?.type}</div>;
	}

	const flow = useReactFlow();

	const [value, setValue] = useState<TypedInput>(
		props.data.data.condition || {
			type: TypedInputEnum.ComplexSubflow,
			flow: {
				nodes: [],
				edges: []
			}
		}
	);

	useEffect(() => {
		flow.updateNodeData(props.id, {
			data: {
				condition: value
			}
		});
	}, [value, props.id]);

	return (
		<FlowNodeBase {...props}>
			<Handle type="target" position={Position.Top} />
			<Handle type="source" position={Position.Bottom} />

			<FlowExpanded nodeProps={props}>
				<TypedInputField value={value} onChange={setValue} />
			</FlowExpanded>
		</FlowNodeBase>
	);
};
