import {
	APINode,
	CommandArgumentNode,
	CommandArgumentType,
	CommandNode,
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
	TypedInputLogicType,
	VariableSetNode,
	WhileLoopNode
} from '../../data';
import { Node, Edge, getOutgoers, getIncomers } from '@xyflow/react';
import {
	CodeGenAST,
	ICommandArgument,
	ICommandArgumentType,
	IElseIf,
	IForLoopType,
	IForLoopTypeEnum,
	INode,
	INodeTypeEnum,
	IPreludeTypeEnum,
} from '../astlayer/ast';
import { baseCommandNodeSchema } from '../../validation';
import z from 'zod';
import { startNodeTypes } from '../../startnode';
import { LiteralEnum, LiteralLogicType, LiteralTableEntry, LiteralValue } from '../astlayer/finalrepr';

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
	public async generate(): Promise<CodeGenAST> {
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
			currentAst.nodes = await this.visitNodeAndChildren(currentAst, startNode[0]);
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
	private async visitNode(currentAst: CodeGenAST, node: Node<NodeExtData>): Promise<VisitResult> {
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
				return await this.visitIfCondition({ nodeId: node.id, data, currentAst });
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
				return await this.visitForLoop({ nodeId: node.id, data, currentAst });
			case NodeTypeEnum.WhileLoop:
				return await this.visitWhileLoop({ nodeId: node.id, data, currentAst });
			case NodeTypeEnum.CustomCode:
				return this.visitCustomCode({ nodeId: node.id, data, currentAst });
			case NodeTypeEnum.UnknownNode:
				throw new Error(`Unknown node type ${data.type} encountered.`);
			case NodeTypeEnum.Group:
				throw new Error('Unreachable node GroupNode: GroupNodes must be transparent and unconnected');
			case NodeTypeEnum.APINode:
				return await this.visitAPINode({ nodeId: node.id, data, currentAst })
		}
	}

	/**
	 * Helper to continuously visit nodes and their children and return their AST representation
	 */
	private async visitNodeAndChildren(currentAst: CodeGenAST, node: Node<NodeExtData>): Promise<INode[]> {
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

			const visitResult = await this.visitNode(currentAst, currentNode);
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
		node.currentAst.prelude = {
			type: IPreludeTypeEnum.Library,
			data: { name: node.data.data.name }
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
	private async visitIfCondition(node: Visit<IfConditionNode>): Promise<VisitResult> {
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
			bodyNodes = await this.visitNodeAndChildren(node.currentAst, bodyStart);
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
				condition: this.visitTypedInput(elseif.data.data.condition),
				body: await this.visitNodeAndChildren(node.currentAst, elseifChildren[0])
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
			elseBlock = await this.visitNodeAndChildren(node.currentAst, elseChildren[0]);
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
					condition: this.visitTypedInput(node.data.data.condition),
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
	private async visitForLoop(node: Visit<ForLoopNode>): Promise<VisitResult> {
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
			bodyNodes = await this.visitNodeAndChildren(node.currentAst, bodyStart);
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
	private async visitWhileLoop(node: Visit<WhileLoopNode>): Promise<VisitResult> {
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
			bodyNodes = await this.visitNodeAndChildren(node.currentAst, bodyStart);
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
					condition: this.visitTypedInput(node.data.data.condition),
					body: bodyNodes
				}
			},
			nextNode // The next node is the EndCondition's first child, if any
		};
	}

	/**
	 * Visits an 'API node' (from dnodec) and runs its custom codegen
	 */
	private async visitAPINode(node: Visit<APINode>): Promise<VisitResult> {
		throw new Error("[visitAPINode] Not yet implemented fully yet") // TODO: Implement visiting API nodes
	}

	/**
	 * Visits a TypedInput value and returns its AST representation.
	 * @param value The TypedInput value to convert to AST.
	 * @returns The AST representation of the TypedInput value.
	 */
	private visitTypedInput(value: TypedInput): LiteralValue {
		// An VisitTask to be pushed/pop from the stack
		interface VisitTask {
			/** The source node to process. */
			source: TypedInput;
			/**
			 * A callback function to set the processed AST node
			 * in its correct parent location.
			 */
			setResult: (result: LiteralValue) => void;
		}

		let rootResult: LiteralValue | null = null;
		const stack: VisitTask[] = [];
		stack.push({
            source: value,
            setResult: (result) => {
                rootResult = result;
            },
        });
		while(true) {
			const task = stack.pop();
			if(!task) break
			const source = task.source;
			switch (source.type) {
				case TypedInputEnum.Nil:
                    task.setResult({
                        type: LiteralEnum.Nil
                    });
                    continue;

                case TypedInputEnum.String:
                    task.setResult({
                        type: LiteralEnum.String,
                        value: source.value,
                        interpolated: source.interpolated
                    });
                    continue;

                case TypedInputEnum.Number:
                    task.setResult({
                        type: LiteralEnum.Number,
                        value: source.value
                    });
                    continue;
                    
                case TypedInputEnum.Boolean:
                    task.setResult({
                        type: LiteralEnum.Boolean,
                        value: source.value
                    });
                    continue;

                case TypedInputEnum.Vector:
                    task.setResult({
                        type: LiteralEnum.Vector,
                        x: source.x,
                        y: source.y,
                        z: source.z
                    });
                    continue;

                case TypedInputEnum.Raw:
                    task.setResult({
                        type: LiteralEnum.Raw,
                        value: source.value
                    });
                    continue;
				case TypedInputEnum.Table:
                    const tableResult: LiteralValue = {
                        type: LiteralEnum.Table,
                        value: new Array(source.value.length), // Pre-allocate array
                        inline: source.inline
                    };
					// Link to parent
					task.setResult(tableResult);
					for (let i = source.value.length - 1; i >= 0; i--) {
						const sourceEntry = source.value[i];
						const destEntry: LiteralTableEntry = { key: { type: LiteralEnum.Nil }, value: { type: LiteralEnum.Nil } }; // initially nil = nil
						tableResult.value[i] = destEntry;
						stack.push({
                            source: sourceEntry.value,
                            setResult: (result) => {
                                destEntry.value = result;
                            }
                        }); // value link
						stack.push({
                            source: sourceEntry.key,
                            setResult: (result) => {
                                destEntry.key = result;
                            }
                        }); // key link
					}
                    continue;
				case TypedInputEnum.TableArray:
                    const arrayResult: LiteralValue = {
                        type: LiteralEnum.TableArray,
                        value: new Array(source.value.length), // Pre-allocate array
                        inline: source.inline
                    };
					// Link to parent
					task.setResult(arrayResult);
					for (let i = source.value.length - 1; i >= 0; i--) {
						const sourceItem = source.value[i];
						const currentIdx = i;
						stack.push({
                            source: sourceItem,
                            setResult: (result) => {
                                arrayResult.value[currentIdx] = result;
                            }
                        }); // table value link
					}
					continue;
				case TypedInputEnum.Parens:
					const parensResult: LiteralValue = {
                        type: LiteralEnum.Parens,
                        inner: {
							type: LiteralEnum.Nil // to be filled in
						}
                    };
					// Link to parent
					task.setResult(parensResult);
					// Set inner
					stack.push({
                        source: source.inner,
                        setResult: (result) => {
                            parensResult.inner = result;
                        }
                    });
					continue;
				case TypedInputEnum.LogicExpr:
					const condMap = {
						[TypedInputLogicType.And]: LiteralLogicType.And,
						[TypedInputLogicType.Eq]: LiteralLogicType.Eq,
						[TypedInputLogicType.Gt]: LiteralLogicType.Gt,
						[TypedInputLogicType.Gte]: LiteralLogicType.Gte,
						[TypedInputLogicType.Lt]: LiteralLogicType.Lt,
						[TypedInputLogicType.Lte]: LiteralLogicType.Lte,
						[TypedInputLogicType.Neq]: LiteralLogicType.Neq,
						[TypedInputLogicType.Or]: LiteralLogicType.Or
					}
					let cond = condMap[source.condition];
					const logicResult: LiteralValue = {
                        type: LiteralEnum.LogicExpr,
                        condition: cond, // Copy the primitive condition
                        lvalue: { type: LiteralEnum.Nil }, // to be filled in
                        rvalue: { type: LiteralEnum.Nil } // to be filled in
                    };
					// Link to parent
					task.setResult(logicResult);
					stack.push({
                        source: source.rvalue,
                        setResult: (result) => {
                            logicResult.rvalue = result;
                        }
                    });
					stack.push({
                        source: source.lvalue,
                        setResult: (result) => {
                            logicResult.lvalue = result;
                        }
                    });
					continue;
				default:
					throw new Error("unexpected typed input found")
			}
		}
		return rootResult!;
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
}
