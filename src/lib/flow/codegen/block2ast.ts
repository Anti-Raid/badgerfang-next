import {
	CommandArgumentNode,
	CommandArgumentType,
	CommandNode,
	ConditionalLogicTypeEnum,
	ConditionalType,
	ConditionalTypeContinuable,
	ConditionalTypeEnum,
	ConditionalTypeLiteral,
	ConditionalTypeLogic,
	ConditionalTypeParensBlock,
	CustomCodeNode,
	ForLoopNode,
	ForLoopType,
	ForLoopTypeEnum,
	IfConditionNode,
	LibraryNode,
	NodeExtData,
	NodeTypeEnum,
	TypedInput,
	TypedInputEnum,
	VariableSetNode,
	WhileLoopNode
} from '../data';
import { Node, Edge, getOutgoers, getIncomers } from '@xyflow/react';
import {
	CodeGenAST,
	ICommandArgument,
	ICommandArgumentType,
	IConditionalLogicTypeEnum,
	IConditionalType,
	IConditionalTypeContinuable,
	IConditionalTypeContinuableEnum,
	IConditionalTypeEnum,
	IConditionalTypeLiteral,
	IConditionalTypeLogic,
	IConditionalTypeParensBlock,
	IElseIf,
	IForLoopType,
	IForLoopTypeEnum,
	INode,
	INodeTypeEnum,
	IPreludeTypeEnum,
	ITypedInput,
	ITypedInputEnum
} from './ast';
import { baseCommandNodeSchema } from '../validation';
import z from 'zod';
import { startNodeTypes } from '../startnode';

interface Visit<T> {
	/**
	 * The ID of the node being visited.
	 */
	nodeId: string;
	/**
	 * The current AST being built.
	 */
	currentAst: CodeGenAST;
	/**
	 * The data associated with the node being visited.
	 */
	data: T;
}

interface VisitResult {
	/**
	 * The AST representation of the node being visited.
	 */
	ast: INode | null;
	/**
	 * The next node to visit in the flow.
	 */
	nextNode: Node<NodeExtData> | null;
}

/**
 * Given nodes, edges and auxData, creates the CodeGen AST for the flow.
 */
export class CodeGenASTGenerator {
	private nodes: Node<NodeExtData>[];
	private edges: Edge[];

	/**
	 * Creates a new CodeGenASTGenerator instance to convert between the nodes and edges of a flow
	 * into a CodeGenAST (Block2AST)
	 *
	 * The reason this is not a static method on AST directly is to separate the type definition of AST
	 * from the conversion code.
	 *
	 * @param nodes The nodes of the graph
	 * @param edges The edges of the graph
	 * @param auxData The auxiliary data for the nodes, containing additional information about each node.
	 */
	constructor(nodes: Node<NodeExtData>[], edges: Edge[]) {
		this.nodes = nodes;
		this.edges = edges;
	}

	/**
	 * Generates the AST representation of the flow.
	 *
	 * Note that this function is guaranteed to not throw an error, but will instead return a CodeGenAST with a fatalError set if an error occurs.
	 *
	 * @returns The AST representing the flow.
	 */
	public generate(): CodeGenAST {
		let currentAst = new CodeGenAST();

		// Find a start node
		const startNode = this.nodes.filter((node) => startNodeTypes.includes(node.data.type));

		if (startNode.length === 0) {
			currentAst.fatalError = 'No Start Node (Library/Command nodes) found in the flow.';
			return currentAst;
		} else if (startNode.length > 1) {
			currentAst.fatalError = 'Multiple Start Nodes (Library/Command nodes) found in the flow.';
			return currentAst;
		}
		try {
			currentAst.nodes = this.visitNodeAndChildren(currentAst, startNode[0]);
		} catch (error) {
			currentAst.fatalError = `Error generating AST: ${error instanceof Error ? error.message : String(error)}`;
		}
		return currentAst;
	}

	/**
	 * Utility to push a warning to the warnings array.
	 * @param message The warning message to push.
	 */
	private pushWarning(currentAst: CodeGenAST, message: string): void {
		currentAst.warnings.push(message);
	}

	/**
	 * Utility to push an error to the errors array.
	 * @param message The error message to push.
	 */
	private pushError(currentAst: CodeGenAST, message: string): void {
		currentAst.errors.push(message);
	}

	/**
	 * Helper to return the parents of a node
	 */
	private getParentOfNode(nodeId: string): Node<NodeExtData>[] {
		return getIncomers({ id: nodeId }, this.nodes, this.edges);
	}

	/**
	 * Helper to return the direct children of a node
	 */
	private getChildrenOfNode(nodeId: string): Node<NodeExtData>[] {
		return getOutgoers({ id: nodeId }, this.nodes, this.edges);
	}

	/**
	 * Visits a node and returns its AST representation.
	 */
	private visitNode(currentAst: CodeGenAST, node: Node<NodeExtData>): VisitResult {
		const data = node.data;

		switch (data.type) {
			case NodeTypeEnum.LibraryNode:
				return this.visitLibraryNode({ nodeId: node.id, data, currentAst });
			case NodeTypeEnum.CommandNode:
				return this.visitCommandNode({ nodeId: node.id, data, currentAst });
			case NodeTypeEnum.CommandArgumentNode:
				throw new Error(
					`CommandArgumentNode ${node.id} should not be visited directly, it should be the source of a CommandNode.`
				);
			case NodeTypeEnum.SetVariable:
				return this.visitSetVariable({ nodeId: node.id, data, currentAst });
			case NodeTypeEnum.IfCondition:
				return this.visitIfCondition({ nodeId: node.id, data, currentAst });
			case NodeTypeEnum.ElseIfCondition:
				throw new Error(
					`An ElseIfCondition node must be connected to an IfCondition node or a ForLoop node.`
				);
			case NodeTypeEnum.ElseCondition:
				throw new Error(
					`An ElseCondition node must be connected to an IfCondition node or a ForLoop node.`
				);
			case NodeTypeEnum.EndCondition:
				throw new Error(
					`An EndCondition node must be connected to an IfCondition node or a ForLoop node.`
				);
			case NodeTypeEnum.ForLoop:
				return this.visitForLoop({ nodeId: node.id, data, currentAst });
			case NodeTypeEnum.WhileLoop:
				return this.visitWhileLoop({ nodeId: node.id, data, currentAst });
			case NodeTypeEnum.CustomCode:
				return this.visitCustomCode({ nodeId: node.id, data, currentAst });
			case NodeTypeEnum.UnknownNode:
				throw new Error(`Unknown node type ${data.type} encountered.`);
			case NodeTypeEnum.Group:
				throw new Error('Unreachable node GroupNode: GroupNodes be transparent and unconnected');
		}
	}

	/**
	 * Helper to continuously visit nodes and their children and return their AST representation
	 */
	private visitNodeAndChildren(currentAst: CodeGenAST, node: Node<NodeExtData>): INode[] {
		let currentNode: Node<NodeExtData> | null = node;
		let astNodes: INode[] = [];
		let visited = new Set<string>();
		while (currentNode) {
			if (visited.has(currentNode.id)) {
				throw new Error(
					`Cycle detected in flow starting from node ${node.id} (${node.data.type}) at node ${currentNode.id} (${currentNode.data.type}), have visited nodes: ${Array.from(visited).join(', ')} so far`
				);
			}

			visited.add(currentNode.id);

			const visitResult = this.visitNode(currentAst, currentNode);
			if (visitResult.ast) {
				astNodes.push(visitResult.ast);
			}
			currentNode = visitResult.nextNode;
			//throw new Error(`Visited: ${Array.from(visited).join(', ')}, next=${JSON.stringify(visitResult.nextNode)}`);
			console.debug(`Next node: ${JSON.stringify(currentNode)}`);
		}

		return astNodes;
	}

	/**
	 * Visits a LibraryNode and returns its AST representation.
	 */
	private visitLibraryNode(node: Visit<LibraryNode>): VisitResult {
		// Visit start node data and set the start node type in the AST
		node.currentAst.prelude = { type: IPreludeTypeEnum.Library, data: { name: node.data.data.name } };

		let children = this.getChildrenOfNode(node.nodeId);
		let nextNode: Node<NodeExtData> | null = null;
		if (children.length == 1) {
			nextNode = children[0]; // Take the first child as the next node
		} else if (children.length > 1) {
			this.pushWarning(
				node.currentAst,
				`StartNode ${node.nodeId} has multiple children, only the first will be considered.`
			);
			nextNode = children[0]; // Take the first child
		}

		return {
			ast: null,
			nextNode
		};
	}

	/**
	 * Visits a CommandNode and returns its AST representation.
	 */
	private visitCommandNode(node: Visit<CommandNode>): VisitResult {
		let incoming = this.getParentOfNode(node.nodeId);
		let commandArguments: ICommandArgument[] = [];
		for (const parent of incoming) {
			if (parent.data.type !== NodeTypeEnum.CommandArgumentNode) {
				this.pushError(
					node.currentAst,
					`CommandNode ${node.nodeId} has a parent of type ${parent.data.type}, expected CommandArgumentNode. Invalid data?`
				);
				continue;
			}

			commandArguments.push(this.visitCommandArgumentNode(node.currentAst, parent.data));
		}

		// Visit start node data and set the start node type in the AST
		let res = baseCommandNodeSchema.safeParse(node.data.data); // Validate the command node data
		if (res.error) {
			this.pushError(node.currentAst, z.prettifyError(res.error));
		}

		node.currentAst.prelude = {
			type: IPreludeTypeEnum.Command,
			data: {
				name: node.data.data.name,
				description: node.data.data.description,
				arguments: commandArguments
			}
		};

		let children = this.getChildrenOfNode(node.nodeId);
		let nextNode: Node<NodeExtData> | null = null;
		if (children.length == 1) {
			nextNode = children[0]; // Take the first child as the next node
		} else if (children.length > 1) {
			this.pushWarning(
				node.currentAst,
				`StartNode ${node.nodeId} has multiple children, only the first will be considered.`
			);
			nextNode = children[0]; // Take the first child
		}

		return {
			ast: null,
			nextNode
		};
	}

	/**
	 * Visits a VariableSetNode and returns its AST representation.
	 */
	private visitSetVariable(node: Visit<VariableSetNode>): VisitResult {
		let variableName = node.data.data.name;
		let variableValue = node.data.data.value;

		if (!variableName) {
			throw new Error(`VariableSetNode ${node.nodeId} is missing variable name.`);
		}
		if (!variableValue) {
			throw new Error(`VariableSetNode ${node.nodeId} is missing variable value.`);
		}

		let children = this.getChildrenOfNode(node.nodeId);
		let nextNode: Node<NodeExtData> | null = null;
		if (children.length == 1) {
			nextNode = children[0]; // Take the first child as the next node
		} else if (children.length > 1) {
			this.pushWarning(
				node.currentAst,
				`VariableSetNode ${node.nodeId} has multiple children, only the first will be considered.`
			);
			nextNode = children[0]; // Take the first child
		}

		return {
			ast: {
				type: INodeTypeEnum.SetVariable,
				data: {
					name: variableName,
					value: this.visitTypedInput(variableValue)
				}
			},
			nextNode
		};
	}

	/**
	 * Visits a CustomCodeNode and returns its AST representation.
	 */
	private visitCustomCode(node: Visit<CustomCodeNode>): VisitResult {
		let code = node.data.data.code;

		if (code === undefined) {
			throw new Error(`CustomCodeNode ${node.nodeId} is missing code.`);
		}

		let children = this.getChildrenOfNode(node.nodeId);
		let nextNode: Node<NodeExtData> | null = null;
		if (children.length == 1) {
			nextNode = children[0]; // Take the first child as the next node
		} else if (children.length > 1) {
			this.pushWarning(
				node.currentAst,
				`CustomCodeNode ${node.nodeId} has multiple children, only the first will be considered.`
			);
			nextNode = children[0]; // Take the first child
		}

		return {
			ast: {
				type: INodeTypeEnum.CustomCode,
				data: {
					code: code
				}
			},
			nextNode
		};
	}

	/**
	 * Visits a IfStatement and returns its AST representation.
	 */
	private visitIfCondition(node: Visit<IfConditionNode>): VisitResult {
		// Find the block, continuation statement and end condition nodes from children
		let children = this.getChildrenOfNode(node.nodeId);
		let bodyStart: Node<NodeExtData> | null = null;
		let elseifNodes: Node<NodeExtData>[] = [];
		let elseNode: Node<NodeExtData> | null = null;
		let endNode: Node<NodeExtData> | null = null;

		for (const child of children) {
			switch (child.data.type) {
				case NodeTypeEnum.ElseIfCondition:
					elseifNodes.push(child);
					break;
				case NodeTypeEnum.ElseCondition:
					if (elseNode) {
						this.pushWarning(
							node.currentAst,
							`IfCondition ${node.nodeId} has multiple Else nodes, only the first will be considered.`
						);
					} else {
						elseNode = child;
					}
					break;
				case NodeTypeEnum.EndCondition:
					if (endNode) {
						this.pushWarning(
							node.currentAst,
							`IfCondition ${node.nodeId} has multiple End nodes, only the first will be considered.`
						);
					} else {
						endNode = child;
					}
					break;
				default:
					if (bodyStart) {
						this.pushWarning(
							node.currentAst,
							`IfCondition ${node.nodeId} has multiple Block nodes, only the first will be considered.`
						);
					} else {
						bodyStart = child;
					}
					break;
			}
		}

		// Sort the elseif nodes by their index
		elseifNodes.sort((a, b) => {
			if (
				a.data.type !== NodeTypeEnum.ElseIfCondition ||
				b.data.type !== NodeTypeEnum.ElseIfCondition
			) {
				throw new Error(
					`Expected ElseIfCondition nodes, but got ${a.data.type} and ${b.data.type}`
				);
			}
			return a.data.data.index - b.data.data.index;
		});

		let bodyNodes: INode[] = [];
		if (bodyStart) {
			bodyNodes = this.visitNodeAndChildren(node.currentAst, bodyStart);
		}

		let elseIfs: IElseIf[] = [];
		for (const elseif of elseifNodes) {
			if (elseif.data.type !== NodeTypeEnum.ElseIfCondition) {
				throw new Error(`Expected ElseIfCondition node, but got ${elseif.data.type}`);
			}

			// Get the outgoing nodes from the elseif node
			const elseifChildren = this.getChildrenOfNode(elseif.id);
			if (elseifChildren.length !== 1) {
				this.pushWarning(
					node.currentAst,
					`ElseIfCondition ${elseif.id} has multiple outgoing connections, only the first will be considered.`
				);
			}

			if (elseifChildren.length === 0) {
				throw new Error(`ElseIfCondition ${elseif.id} has no outgoing connections.`);
			}

			elseIfs.push({
				condition: this.visitConditionalType(node.currentAst, elseif.data.data.condition),
				body: this.visitNodeAndChildren(node.currentAst, elseifChildren[0])
			});
		}

		let elseBlock: INode[] | undefined = undefined;
		if (elseNode) {
			if (elseNode.data.type !== NodeTypeEnum.ElseCondition) {
				throw new Error(`Expected ElseCondition node, but got ${elseNode.data.type}`);
			}
			const elseChildren = this.getChildrenOfNode(elseNode.id);
			if (elseChildren.length !== 1) {
				this.pushWarning(
					node.currentAst,
					`ElseCondition ${elseNode.id} has multiple outgoing connections, only the first will be considered.`
				);
			}
			elseBlock = this.visitNodeAndChildren(node.currentAst, elseChildren[0]);
		}

		if (!endNode) {
			throw new Error(`IfCondition ${node.nodeId} is missing a/an matching EndCondition node.`);
		}

		let endChildren = this.getChildrenOfNode(endNode.id);
		if (endChildren.length > 1) {
			this.pushWarning(
				node.currentAst,
				`EndCondition ${endNode.id} has multiple outgoing connections, only the first will be considered.`
			);
		}

		let nextNode: Node<NodeExtData> | null = endChildren.length > 0 ? endChildren[0] : null;

		return {
			ast: {
				type: INodeTypeEnum.IfCondition,
				data: {
					condition: this.visitConditionalType(node.currentAst, node.data.data.condition),
					body: bodyNodes,
					elseifs: elseIfs.length > 0 ? elseIfs : undefined,
					else: elseBlock
				}
			},
			nextNode // The next node is the EndCondition's first child, if any
		};
	}

	/**
	 * Visits a ForLoop and returns its AST representation.
	 */
	private visitForLoop(node: Visit<ForLoopNode>): VisitResult {
		// Find the block, continuation statement and end condition nodes from children
		let children = this.getChildrenOfNode(node.nodeId);
		let bodyStart: Node<NodeExtData> | null = null;
		let endNode: Node<NodeExtData> | null = null;

		for (const child of children) {
			const childData = this.getAuxDataForNode(child.id);
			switch (childData.type) {
				case NodeTypeEnum.EndCondition:
					if (endNode) {
						this.pushWarning(
							node.currentAst,
							`ForLoop ${node.nodeId} has multiple End nodes, only the first will be considered.`
						);
					} else {
						endNode = child;
					}
					break;
				default:
					if (bodyStart) {
						this.pushWarning(
							node.currentAst,
							`ForLoop ${node.nodeId} has multiple Block nodes, only the first will be considered.`
						);
					} else {
						bodyStart = child;
					}
					break;
			}
		}

		let bodyNodes: INode[] = [];
		if (bodyStart) {
			bodyNodes = this.visitNodeAndChildren(node.currentAst, bodyStart);
		}

		if (!endNode) {
			throw new Error(`ForLoop ${node.nodeId} is missing a/an matching EndCondition node.`);
		}

		let endChildren = this.getChildrenOfNode(endNode.id);
		if (endChildren.length > 1) {
			this.pushWarning(
				node.currentAst,
				`EndCondition ${endNode.id} has multiple outgoing connections, only the first will be considered.`
			);
		}

		let nextNode: Node<NodeExtData> | null = endChildren.length > 0 ? endChildren[0] : null;

		return {
			ast: {
				type: INodeTypeEnum.ForLoop,
				data: {
					condition: this.visitForLoopType(node.data.data.condition),
					body: bodyNodes
				}
			},
			nextNode // The next node is the EndCondition's first child, if any
		};
	}

	/**
	 * Visits a WhileLoop and returns its AST representation.
	 */
	private visitWhileLoop(node: Visit<WhileLoopNode>): VisitResult {
		// Find the block, continuation statement and end condition nodes from children
		let children = this.getChildrenOfNode(node.nodeId);
		let bodyStart: Node<NodeExtData> | null = null;
		let endNode: Node<NodeExtData> | null = null;

		for (const child of children) {
			const childData = this.getAuxDataForNode(child.id);
			switch (childData.type) {
				case NodeTypeEnum.EndCondition:
					if (endNode) {
						this.pushWarning(
							node.currentAst,
							`WhileLoop ${node.nodeId} has multiple End nodes, only the first will be considered.`
						);
					} else {
						endNode = child;
					}
					break;
				default:
					if (bodyStart) {
						this.pushWarning(
							node.currentAst,
							`WhileLoop ${node.nodeId} has multiple Block nodes, only the first will be considered.`
						);
					} else {
						bodyStart = child;
					}
					break;
			}
		}

		let bodyNodes: INode[] = [];
		if (bodyStart) {
			bodyNodes = this.visitNodeAndChildren(node.currentAst, bodyStart);
		}

		if (!endNode) {
			throw new Error(`WhileLoop ${node.nodeId} is missing a/an matching EndCondition node.`);
		}

		let endChildren = this.getChildrenOfNode(endNode.id);
		if (endChildren.length > 1) {
			this.pushWarning(
				node.currentAst,
				`EndCondition ${endNode.id} has multiple outgoing connections, only the first will be considered.`
			);
		}

		let nextNode: Node<NodeExtData> | null = endChildren.length > 0 ? endChildren[0] : null;

		return {
			ast: {
				type: INodeTypeEnum.WhileLoop,
				data: {
					condition: this.visitConditionalType(node.currentAst, node.data.data.condition),
					body: bodyNodes
				}
			},
			nextNode // The next node is the EndCondition's first child, if any
		};
	}

	/**
	 * Visits a TypedInput value and returns its AST representation.
	 * @param value The TypedInput value to convert to AST.
	 * @returns The AST representation of the TypedInput value.
	 */
	private visitTypedInput(value: TypedInput): ITypedInput {
		switch (value.type) {
			case TypedInputEnum.String:
				return {
					type: ITypedInputEnum.String,
					value: value.value
				};
			case TypedInputEnum.Number:
				return {
					type: ITypedInputEnum.Number,
					value: value.value
				};
			case TypedInputEnum.Table:
				return {
					type: ITypedInputEnum.Table,
					value: value.value
				};
			case TypedInputEnum.Boolean:
				return {
					type: ITypedInputEnum.Boolean,
					value: value.value
				};
			case TypedInputEnum.Raw:
				return {
					type: ITypedInputEnum.Raw, // Raw is treated as a string in AST
					value: value.value
				};
		}
	}

	/**
	 * Visits a ForLoopType value and returns its AST representation.
	 * @param value The ForLoopType value to convert to AST.
	 * @returns The AST representation of the ForLoopType value.
	 */
	private visitForLoopType(value: ForLoopType): IForLoopType {
		switch (value.type) {
			case ForLoopTypeEnum.GeneralizedIteration:
				return {
					type: IForLoopTypeEnum.GeneralizedIteration,
					varbinds: value.varbinds,
					iterable: this.visitTypedInput(value.iterable)
				};
			case ForLoopTypeEnum.Range:
				return {
					type: IForLoopTypeEnum.Range,
					varbind: value.varbind,
					start: value.start,
					end: value.end,
					step: value.step // Optional step value
				};
			case ForLoopTypeEnum.Raw:
				return {
					type: IForLoopTypeEnum.Raw,
					condition: value.condition // Raw condition for the loop
				};
		}
	}

	/**
	 * Helper to return the auxilliary data for the given node ID.
	 * @param nodeId The ID of the node to get auxiliary data for.
	 * @returns The auxiliary data for the node.
	 */
	private getAuxDataForNode(nodeId: string): NodeExtData {
		for (const node of this.nodes) {
			if (node.id === nodeId) {
				return node.data; // Return the aux data directly from the node
			}
		}

		throw new Error(`Node with ID ${nodeId} not found in the flow.`);
	}

	/**
	 * Returns the AST representation of a CommandArgument.
	 * @param arg The CommandArgument to convert to AST.
	 * @returns The AST representation of the CommandArgument.
	 */
	private visitCommandArgumentNode(
		currentAst: CodeGenAST,
		arg: CommandArgumentNode
	): ICommandArgument {
		let res = baseCommandNodeSchema.safeParse(arg.data); // Validate the argument structure

		if (res.error) {
			this.pushError(currentAst, z.prettifyError(res.error));
		}

		const cmdArgTypeMap = {
			[CommandArgumentType.String]: ICommandArgumentType.String,
			[CommandArgumentType.Integer]: ICommandArgumentType.Integer,
			[CommandArgumentType.Boolean]: ICommandArgumentType.Boolean,
			[CommandArgumentType.User]: ICommandArgumentType.User,
			[CommandArgumentType.Channel]: ICommandArgumentType.Channel,
			[CommandArgumentType.Role]: ICommandArgumentType.Role,
			[CommandArgumentType.Member]: ICommandArgumentType.Member
		};

		let type = cmdArgTypeMap[arg.data.type];
		if (!type) {
			throw new Error(
				`Unknown CommandArgumentType ${arg.data.type} for argument ${arg.data.name} in command argument \`${arg.data.name}\``
			);
		}

		return {
			type,
			name: arg.data.name,
			description: arg.data.description,
			required: arg.data.required
		};
	}

	/** Visits a ConditionalType and returns its AST representation.
	 *
	 * @param data The ConditionalType to convert to AST.
	 * @return The AST representation of the ConditionalType.
	 */
	private visitConditionalType(currentAst: CodeGenAST, data: ConditionalType): IConditionalType {
		switch (data.type) {
			case ConditionalTypeEnum.Unselected:
				this.pushError(currentAst, `Unselected ConditionalLogicType encountered.`);
				return {
					type: IConditionalTypeEnum.Raw,
					condition: ''
				};
			case ConditionalTypeEnum.LogicExpr:
				return this.visitConditionalLogicType(currentAst, data);
			case ConditionalTypeEnum.ParensBlock:
				return {
					type: IConditionalTypeEnum.ParensBlock,
					condition: this.visitConditionalTypeParensBlock(currentAst, data)
				};
			case ConditionalTypeEnum.Raw:
				return {
					type: IConditionalTypeEnum.Raw,
					condition: data.condition // Raw condition for the logic expression
				};
			case ConditionalTypeEnum.Literal:
				return this.visitConditionalTypeLiteral(currentAst, data);
			default:
				this.pushError(currentAst, `Unknown ConditionalType ${JSON.stringify(data)} encountered.`);
				return {
					type: IConditionalTypeEnum.Raw,
					condition: '' // Default to an empty string for raw condition
				};
		}
	}

	/**
	 * Visits a ConditionalTypeContinuable and returns its AST representation.
	 * @param data The ConditionalTypeContinuable to convert to AST.
	 * @return The AST representation of the ConditionalTypeContinuable.
	 */
	private visitConditionalTypeContinuable(
		currentAst: CodeGenAST,
		data: ConditionalTypeContinuable
	): IConditionalTypeContinuable {
		let op = IConditionalTypeContinuableEnum.And;
		if (data.op === 'or') {
			op = IConditionalTypeContinuableEnum.Or;
		}

		return {
			op: op,
			condition: this.visitConditionalType(currentAst, data.condition)
		};
	}

	/**
	 * Visits a ConditionalLogicType and returns its AST representation.
	 * @param data The ConditionalLogicType to convert to AST.
	 * @returns The AST representation of the ConditionalLogicType.
	 */
	private visitConditionalLogicType(
		currentAst: CodeGenAST,
		data: ConditionalTypeLogic
	): IConditionalTypeLogic {
		if (data.condition.type === ConditionalLogicTypeEnum.Unselected) {
			this.pushError(currentAst, `Unselected ConditionalLogicType encountered.`);
			return {
				type: IConditionalTypeEnum.LogicExpr,
				condition: {
					type: IConditionalLogicTypeEnum.IfEq,
					left: {
						type: ITypedInputEnum.String,
						value: ''
					},
					right: {
						type: ITypedInputEnum.String,
						value: ''
					}
				}
			};
		}

		const typeMap = {
			[ConditionalLogicTypeEnum.IfEq]: IConditionalLogicTypeEnum.IfEq,
			[ConditionalLogicTypeEnum.IfNeq]: IConditionalLogicTypeEnum.IfNeq,
			[ConditionalLogicTypeEnum.IfGt]: IConditionalLogicTypeEnum.IfGt,
			[ConditionalLogicTypeEnum.IfGte]: IConditionalLogicTypeEnum.IfGte,
			[ConditionalLogicTypeEnum.IfLt]: IConditionalLogicTypeEnum.IfLt,
			[ConditionalLogicTypeEnum.IfLte]: IConditionalLogicTypeEnum.IfLte
		};

		return {
			type: IConditionalTypeEnum.LogicExpr,
			condition: {
				type: typeMap[data.condition.type],
				left: this.visitTypedInput(data.condition.left),
				right: this.visitTypedInput(data.condition.right)
			},
			next: data.next ? this.visitConditionalTypeContinuable(currentAst, data.next) : undefined
		};
	}

	/**
	 * Visits a ConditionalTypeParensBlock and returns its AST representation.
	 * @param data The ConditionalTypeParensBlock to convert to AST.
	 * @returns The AST representation of the ConditionalTypeParensBlock.
	 */
	private visitConditionalTypeParensBlock(
		currentAst: CodeGenAST,
		data: ConditionalTypeParensBlock
	): IConditionalTypeParensBlock {
		return {
			type: IConditionalTypeEnum.ParensBlock,
			condition: this.visitConditionalType(currentAst, data.condition),
			next: data.next ? this.visitConditionalTypeContinuable(currentAst, data.next) : undefined
		};
	}

	/**
	 * Visits a ConditionalTypeLiteral and returns its AST representation.
	 * @param data The ConditionalTypeLiteral to convert to AST.
	 * @returns The AST representation of the ConditionalTypeLiteral.
	 */
	private visitConditionalTypeLiteral(
		currentAst: CodeGenAST,
		data: ConditionalTypeLiteral
	): IConditionalTypeLiteral {
		return {
			type: IConditionalTypeEnum.Literal,
			value: this.visitTypedInput(data.value),
			next: data.next ? this.visitConditionalTypeContinuable(currentAst, data.next) : undefined
		};
	}
}
