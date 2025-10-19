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
import { generateTypedInputId, TypedInputField } from '../ui/TypedInput';
import { Field, Node as NodeIDLNode, FieldData } from '@/lib/flow/nodeidl/nodeidl';
import NodeFromIDL from './NodeFromIDL';
import { Primary } from '@/components/ui/Buttons';
import * as yaml from 'yaml';
import { createNode, getEdgeId } from '@/lib/flow/nodes';

// Static validation for APINode: APINode nodes can have multiple connections based on nodeidl schema
registerValidationSource('api_node', (srcCons: string[], tgtCons: string[]) => {
	// For now, allow any number of connections - this will be refined based on nodeidl schema
	return true;
});

interface APINodeData {
	nodeidl: NodeIDLNode;
	inputValues: Record<string, TypedInput>;
}

export default function APINode(props: NodeProps) {
	if (props?.data?.type !== NodeTypeEnum.APINode) {
		return <div className="text-red-500">Invalid node type: {props?.data?.type}</div>;
	}

	// Type assertion after the type check
	const apiNodeData = props.data as any;
	
	const flow = useReactFlow();
	const [nodeidl, setNodeidl] = useState<NodeIDLNode | null>(apiNodeData.data?.nodeidl || null);
	const [inputValues, setInputValues] = useState<Record<string, TypedInput>>(
		apiNodeData.data?.inputValues || {}
	);
	const [isConfiguring, setIsConfiguring] = useState<boolean>(!nodeidl);
	const [configMode, setConfigMode] = useState<'basic' | 'advanced'>('basic');
	const [configFormat, setConfigFormat] = useState<'json' | 'yaml'>('yaml');
	
	// Basic configuration state
	const [nodeName, setNodeName] = useState<string>(nodeidl?.shortname || '');
	const [nodeDescription, setNodeDescription] = useState<string>(nodeidl?.description || '');
	const [nodeId, setNodeId] = useState<string>(nodeidl?.id || '');
	const [supportsTop, setSupportsTop] = useState<boolean>(nodeidl?.flowui?.handles?.allow?.includes('top') || false);
	const [supportsBottom, setSupportsBottom] = useState<boolean>(nodeidl?.flowui?.handles?.allow?.includes('bottom') || true);
	
	// Advanced configuration state
	const [advancedConfig, setAdvancedConfig] = useState<string>(
		nodeidl ? (configFormat === 'yaml' ? yaml.stringify(nodeidl) : JSON.stringify(nodeidl, null, 2)) : ''
	);

	// Create nodeidl from basic configuration
	const createNodeidlFromBasic = (): NodeIDLNode => {
		const inputField: Field = {
			type: 'scalar',
			data: {
				shortname: 'Input Data',
				id: 'input_data',
				description: 'Input data for this node',
				type: 'string'
			},
			optional: false
		};

		const outputField: Field = {
			type: 'scalar',
			data: {
				shortname: 'Output Data',
				id: 'output_data',
				description: 'Output data from this node',
				type: 'string'
			},
			optional: false
		};

		return {
			id: nodeId || 'custom_node',
			shortname: nodeName || 'Custom Node',
			description: nodeDescription || 'A custom API node',
			flowui: {
				handles: {
					allow: [
						...(supportsTop ? ['top' as const] : []),
						...(supportsBottom ? ['bottom' as const] : [])
					]
				},
				input: inputField,
				output: outputField
			},
			code: '-- Custom node code will be generated here'
		};
	};

	// Create a new node with the configured schema
	const createNewNode = () => {
		if (!nodeidl) {
			alert('Please configure the node first');
			return;
		}

		// Get current node position and compute positions for two created nodes
		const currentNode = flow.getNode(props.id);
		const baseX = (currentNode?.position.x || 0) + 300; // Place new nodes to the right
		const baseY = currentNode?.position.y || 0;

		// Main node (API-like node that holds nodeidl and renders inputs)
		const mainNode = createNode('api_node', { x: baseX, y: baseY }, {
			type: NodeTypeEnum.APINode,
			data: {
				nodeidl: nodeidl,
				inputValues: {}
			}
		} as any);

		// Code node (CustomCode) that houses the code portion of the NodeIDL
		const codeNode = createNode('custom_code', { x: baseX + 220, y: baseY }, {
			type: NodeTypeEnum.CustomCode,
			data: ({
				code: nodeidl?.code || ''
			} as any)
		} as any);

		// Create an edge from the main node (source) to the code node (target)
		const newEdge = {
			id: getEdgeId(),
			source: mainNode.id,
			target: codeNode.id
		} as any;

		// Add both nodes and the edge to the flow
		flow.addNodes([mainNode, codeNode]);
		// Some reactflow wrappers expose addEdges; try to call it. If unavailable, adding the
		// edge may be handled elsewhere; this is the straightforward approach.
		try {
			// @ts-ignore - flow.addEdges may not be strictly typed here
			flow.addEdges([newEdge]);
		} catch (err) {
			// Fallback: attempt to add an edge via updateNodeData on source to create a connection
			console.warn('flow.addEdges not available, edge may need to be added from FlowEditor context', err);
		}
		
		// Close configuration mode
		setIsConfiguring(false);
		
		alert(`Created new node: ${nodeidl.shortname}`);
	};

	// Apply configuration
	const applyConfiguration = () => {
		let newNodeidl: NodeIDLNode;
		
		if (configMode === 'basic') {
			newNodeidl = createNodeidlFromBasic();
		} else {
			try {
				if (configFormat === 'yaml') {
					newNodeidl = yaml.parse(advancedConfig) as NodeIDLNode;
				} else {
					newNodeidl = JSON.parse(advancedConfig);
				}
				
				// Validate the nodeidl structure
				if (!newNodeidl.flowui) {
					throw new Error('Missing required "flowui" property. This looks like a dmodel format. APINode requires a dnode format with flowui.input and flowui.output.');
				}
				
				if (!newNodeidl.flowui.input) {
					throw new Error('Missing required "flowui.input" property.');
				}
				
				if (!newNodeidl.flowui.output) {
					throw new Error('Missing required "flowui.output" property.');
				}
				
			} catch (error) {
				alert(`Invalid ${configFormat.toUpperCase()} configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
				return;
			}
		}
		
		setNodeidl(newNodeidl);
		setIsConfiguring(false);
		
		// Initialize input values
		const initialValues: Record<string, TypedInput> = {};
		if (newNodeidl.flowui.input) {
			processField(newNodeidl.flowui.input, initialValues, 'input');
		}
		setInputValues(initialValues);
	};

	// Update advanced config when format changes
	useEffect(() => {
		if (nodeidl && advancedConfig) {
			try {
				// Parse current config
				const parsed = configFormat === 'yaml' ? yaml.parse(advancedConfig) : JSON.parse(advancedConfig);
				// Convert to new format
				const converted = configFormat === 'yaml' ? yaml.stringify(parsed) : JSON.stringify(parsed, null, 2);
				setAdvancedConfig(converted);
			} catch (error) {
				// If parsing fails, just update the format without converting
				console.warn('Could not convert config format:', error);
			}
		}
	}, [configFormat]);

	// Initialize input values based on nodeidl schema
	useEffect(() => {
		if (nodeidl && Object.keys(inputValues).length === 0) {
			const initialValues: Record<string, TypedInput> = {};
			
			// Process input fields from nodeidl
			if (nodeidl.flowui.input) {
				processField(nodeidl.flowui.input, initialValues, 'input');
			}
			
			setInputValues(initialValues);
		}
	}, [nodeidl]);

	useEffect(() => {
		flow.updateNodeData(props.id, {
			data: {
				nodeidl,
				inputValues
			}
		});
	}, [nodeidl, inputValues, props.id, flow]);

	// Helper function to process fields recursively
	const processField = (field: Field, values: Record<string, TypedInput>, prefix: string) => {
		let fieldKey: string;
		
		if (field.type === 'scalar') {
			fieldKey = `${prefix}_${field.data.id}`;
		} else if (field.type === 'array') {
			fieldKey = `${prefix}_array`;
		} else if (field.type === 'group') {
			fieldKey = `${prefix}_group`;
		} else {
			fieldKey = `${prefix}_unknown`;
		}
		
		if (!values[fieldKey]) {
			values[fieldKey] = createDefaultTypedInput(field);
		}

		if (field.type === 'group') {
			// Process group fields with proper field names
			field.fields.forEach((subField, index) => {
				let subFieldKey: string;
				if (subField.type === 'scalar') {
					subFieldKey = `${prefix}_${subField.data.id}`;
				} else if (subField.type === 'array') {
					subFieldKey = `${prefix}_array_${index}`;
				} else {
					subFieldKey = `${prefix}_field_${index}`;
				}
				processField(subField, values, subFieldKey);
			});
		} else if (field.type === 'array') {
			// For arrays, we'll create a TableArray input
			if (!values[fieldKey]) {
				values[fieldKey] = {
					type: TypedInputEnum.TableArray,
					value: [],
					inline: true,
					id: generateTypedInputId()
				};
			}
		}
	};

	// Helper function to create default TypedInput based on field type
	const createDefaultTypedInput = (field: Field): TypedInput => {
		if (field.type === 'scalar') {
			const scalarType = field.data.type || 'string';
			switch (scalarType.toLowerCase()) {
				case 'string':
					return {
						type: TypedInputEnum.String,
						value: '',
						interpolated: false,
						id: generateTypedInputId()
					};
				case 'number':
					return {
						type: TypedInputEnum.Number,
						value: 0,
						id: generateTypedInputId()
					};
				case 'boolean':
					return {
						type: TypedInputEnum.Boolean,
						value: false,
						id: generateTypedInputId()
					};
				default:
					return {
						type: TypedInputEnum.String,
						value: '',
						interpolated: false,
						id: generateTypedInputId()
					};
			}
		} else if (field.type === 'array') {
			return {
				type: TypedInputEnum.TableArray,
				value: [],
				inline: true,
				id: generateTypedInputId()
			};
		} else if (field.type === 'group') {
			return {
				type: TypedInputEnum.Table,
				value: [],
				inline: true,
				id: generateTypedInputId()
			};
		}
		
		return {
			type: TypedInputEnum.Nil,
			id: generateTypedInputId()
		};
	};

	// Render field input based on field type
	const renderFieldInput = (field: Field, fieldKey: string, prefix: string = '') => {
		const value = inputValues[fieldKey];
		if (!value) return null;

		let label: string;
		let description: string;

		if (field.type === 'scalar') {
			label = field.data.shortname || field.data.id || 'Unknown Field';
			description = field.data.description || '';
		} else if (field.type === 'array') {
			label = 'Array Field';
			description = 'An array field';
		} else if (field.type === 'group') {
			label = 'Group Field';
			description = 'A group of fields';
		} else {
			label = 'Unknown Field';
			description = '';
		}

		return (
			<TypedInputField
				key={fieldKey}
				id={`${props.id}-${fieldKey}`}
				label={label}
				description={description}
				value={value}
				onChange={(newValue) => {
					setInputValues(prev => ({
						...prev,
						[fieldKey]: newValue
					}));
				}}
				placeholder={`Enter ${label.toLowerCase()}`}
				className="w-full"
			/>
		);
	};

	// Render all input fields
	const renderInputFields = () => {
		if (!nodeidl || !nodeidl.flowui.input) {
			return <div className="text-muted-foreground">No input schema defined</div>;
		}

		const fields: JSX.Element[] = [];
		processFieldForRender(nodeidl.flowui.input, fields, 'input');
		return fields;
	};

	// Helper to process fields for rendering
	const processFieldForRender = (field: Field, fields: JSX.Element[], prefix: string) => {
		let fieldKey: string;
		
		if (field.type === 'scalar') {
			fieldKey = `${prefix}_${field.data.id}`;
		} else if (field.type === 'array') {
			fieldKey = `${prefix}_array`;
		} else if (field.type === 'group') {
			fieldKey = `${prefix}_group`;
		} else {
			fieldKey = `${prefix}_unknown`;
		}
		
		if (field.type === 'group') {
			// Render group fields with proper field names
			field.fields.forEach((subField, index) => {
				let subFieldKey: string;
				if (subField.type === 'scalar') {
					subFieldKey = `${prefix}_${subField.data.id}`;
				} else if (subField.type === 'array') {
					subFieldKey = `${prefix}_array_${index}`;
				} else {
					subFieldKey = `${prefix}_field_${index}`;
				}
				processFieldForRender(subField, fields, subFieldKey);
			});
		} else {
			// Render individual field
			const fieldElement = renderFieldInput(field, fieldKey, prefix);
			if (fieldElement) {
				fields.push(fieldElement);
			}
		}
	};

	// Determine handle positions based on nodeidl schema
	const getHandlePositions = () => {
		const handles: JSX.Element[] = [];
		
		if (nodeidl?.flowui?.handles?.allow?.includes('top')) {
			handles.push(<Handle key="top" type="target" position={Position.Top} />);
		}
		
		if (nodeidl?.flowui?.handles?.allow?.includes('bottom')) {
			handles.push(<Handle key="bottom" type="source" position={Position.Bottom} />);
		}

		return handles;
	};

	return (
		<FlowNodeBase
			{...props}
			title={nodeidl?.shortname || 'API Node'}
			className="bg-purple-100 hover:bg-purple-200"
		>
			{getHandlePositions()}

			<FlowExpanded nodeProps={props}>
				<div className="space-y-4">
					{isConfiguring ? (
						/* Configuration Interface */
						<div className="space-y-4">
							<div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
								<h3 className="text-sm font-semibold text-blue-900 mb-2">APINode Configuration</h3>
								<p className="text-xs text-blue-700">Configure your node settings and properties</p>
							</div>

							{/* Configuration Mode Toggle */}
							<div className="flex gap-2">
								<button
									onClick={() => setConfigMode('basic')}
									className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
										configMode === 'basic'
											? 'bg-primary text-primary-foreground'
											: 'bg-muted text-muted-foreground hover:bg-muted/80'
									}`}
								>
									Basic
								</button>
								<button
									onClick={() => setConfigMode('advanced')}
									className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
										configMode === 'advanced'
											? 'bg-primary text-primary-foreground'
											: 'bg-muted text-muted-foreground hover:bg-muted/80'
									}`}
								>
									Advanced
								</button>
							</div>

							{configMode === 'basic' ? (
								/* Basic Configuration */
								<div className="space-y-3">
									<InputField
										id={`${props.id}-node-name`}
										label="Node Name"
										value={nodeName}
										onChange={(e) => setNodeName(e.target.value)}
										placeholder="Enter node name"
										className="w-full"
									/>

									<InputField
										id={`${props.id}-node-description`}
										label="Description"
										value={nodeDescription}
										onChange={(e) => setNodeDescription(e.target.value)}
										placeholder="Enter node description"
										className="w-full"
									/>

									<InputField
										id={`${props.id}-node-id`}
										label="Node ID"
										value={nodeId}
										onChange={(e) => setNodeId(e.target.value)}
										placeholder="Enter unique node ID"
										className="w-full"
									/>

									<div className="space-y-2">
										<label className="text-sm font-medium text-foreground">Handle Configuration</label>
										<div className="space-y-2">
											<label className="flex items-center gap-2">
												<input
													type="checkbox"
													checked={supportsTop}
													onChange={(e) => setSupportsTop(e.target.checked)}
													className="rounded"
												/>
												<span className="text-sm text-foreground">Support Top Handle (Input)</span>
											</label>
											<label className="flex items-center gap-2">
												<input
													type="checkbox"
													checked={supportsBottom}
													onChange={(e) => setSupportsBottom(e.target.checked)}
													className="rounded"
												/>
												<span className="text-sm text-foreground">Support Bottom Handle (Output)</span>
											</label>
										</div>
									</div>
								</div>
							) : (
								/* Advanced Configuration */
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<label className="text-sm font-medium text-foreground">NodeIDL Configuration</label>
										<div className="flex gap-2">
											<button
												onClick={() => setConfigFormat('yaml')}
												className={`px-2 py-1 text-xs rounded transition-colors ${
													configFormat === 'yaml'
														? 'bg-primary text-primary-foreground'
														: 'bg-muted text-muted-foreground hover:bg-muted/80'
												}`}
											>
												YAML
											</button>
											<button
												onClick={() => setConfigFormat('json')}
												className={`px-2 py-1 text-xs rounded transition-colors ${
													configFormat === 'json'
														? 'bg-primary text-primary-foreground'
														: 'bg-muted text-muted-foreground hover:bg-muted/80'
												}`}
											>
												JSON
											</button>
										</div>
									</div>
									
									<div className="flex gap-2 mb-2 flex-wrap">
										<button
											onClick={() => {
												const template = {
													id: "createMessage",
													shortname: "Create Message",
													description: "Creates a Discord message",
													flowui: {
														handles: { allow: ["top", "bottom"] },
														input: {
															type: "scalar",
															data: {
																shortname: "Message Content",
																id: "content",
																description: "The content of the message",
																type: "string"
															},
															optional: false
														},
														output: {
															type: "scalar",
															data: {
																shortname: "Created Message",
																id: "message",
																description: "The created message object",
																type: "Message"
															},
															optional: false
														}
													},
													code: "-- Create message code here"
												};
												setAdvancedConfig(configFormat === 'yaml' ? yaml.stringify(template) : JSON.stringify(template, null, 2));
											}}
											className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
										>
											Message Template
										</button>
										<button
											onClick={() => {
												const template = {
													id: "sendEmbed",
													shortname: "Send Embed",
													description: "Sends a rich embed message",
													flowui: {
														handles: { allow: ["top", "bottom"] },
														input: {
															type: "group",
															fields: [
																{
																	type: "scalar",
																	data: {
																		shortname: "Title",
																		id: "title",
																		description: "Embed title",
																		type: "string"
																	},
																	optional: true
																},
																{
																	type: "scalar",
																	data: {
																		shortname: "Description",
																		id: "description",
																		description: "Embed description",
																		type: "string"
																	},
																	optional: true
																}
															],
															optional: false
														},
														output: {
															type: "scalar",
															data: {
																shortname: "Sent Embed",
																id: "embed",
																description: "The sent embed",
																type: "Embed"
															},
															optional: false
														}
													},
													code: "-- Send embed code here"
												};
												setAdvancedConfig(configFormat === 'yaml' ? yaml.stringify(template) : JSON.stringify(template, null, 2));
											}}
											className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
										>
											Embed Template
										</button>
										<button
											onClick={() => {
												// Convert the dmodel format you provided to a proper dnode format
												const template = {
													id: "messageNode",
													shortname: "Message Node",
													description: "A node that works with message data",
													flowui: {
														handles: { allow: ["top", "bottom"] },
														input: {
															type: "group",
															fields: [
																{
																	type: "scalar",
																	data: {
																		shortname: "Content",
																		id: "content",
																		description: "The content of the message",
																		type: "string"
																	},
																	optional: true
																},
																{
																	type: "array",
																	elementType: {
																		type: "scalar",
																		data: {
																			shortname: "Embed",
																			id: "embed",
																			description: "An embed object",
																			type: "Embed"
																		},
																		optional: false
																	},
																	optional: true
																}
															],
															optional: false
														},
														output: {
															type: "scalar",
															data: {
																shortname: "Processed Message",
																id: "message",
																description: "The processed message",
																type: "Message"
															},
															optional: false
														}
													},
													code: "-- Process message code here"
												};
												setAdvancedConfig(configFormat === 'yaml' ? yaml.stringify(template) : JSON.stringify(template, null, 2));
											}}
											className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
										>
											From Your DModel
										</button>
									</div>
									<textarea
										value={advancedConfig}
										onChange={(e) => setAdvancedConfig(e.target.value)}
										placeholder={`Enter nodeidl ${configFormat.toUpperCase()} configuration...`}
										className="w-full h-40 p-3 border border-border rounded-lg bg-background text-foreground font-mono text-xs resize-none"
									/>
									<div className="text-xs text-muted-foreground space-y-1">
										<div>Enter a valid nodeidl {configFormat.toUpperCase()} configuration. This will override the basic configuration.</div>
										<div className="text-orange-600">
											<strong>Note:</strong> APINode requires a <strong>dnode</strong> format (with flowui.input/output), not a dmodel format (with fields).
										</div>
									</div>
								</div>
							)}

							<div className="flex gap-2">
								<Primary
									Title="Apply Configuration"
									onClick={applyConfiguration}
									className="flex-1"
								/>
								<button
									onClick={createNewNode}
									className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
									disabled={!nodeidl}
								>
									Create New Node
								</button>
								<button
									onClick={() => setIsConfiguring(false)}
									className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Cancel
								</button>
							</div>
						</div>
					) : (
						/* Normal Node Display */
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
									<button
										onClick={() => setIsConfiguring(true)}
										className="px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
									>
										Configure
									</button>
								</div>
							</div>

														{/* Input Fields */}
														<div className="space-y-3">
																<NodeFromIDL
																	nodeidl={nodeidl}
																	inputValues={inputValues}
																	onChange={(key, value) => setInputValues(prev => ({ ...prev, [key]: value }))}
																/>
														</div>
						</div>
					)}
				</div>
			</FlowExpanded>
		</FlowNodeBase>
	);
}
