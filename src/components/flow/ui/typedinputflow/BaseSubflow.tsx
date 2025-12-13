import {
	Background,
	BackgroundVariant,
	Connection,
	Controls,
	Edge,
	ReactFlow,
	Node,
	EdgeChange,
	useNodesState,
	useEdgesState,
	useReactFlow,
	getOutgoers,
	NodeChange,
	addEdge
} from '@xyflow/react';
import DeleteEdge from '../../management/DeleteEdge';
import { useCallback, useEffect, DragEvent } from 'react';
import { createSNode, SubflowData, SubflowNodeExtData } from '@/lib/flow/subnode';

interface Props {
	initialData?: SubflowData;
	onChange: () => void;
	id: string;
}

const edgeTypes = {
	delete_button: DeleteEdge
};

// TODO: Make some nodes!
const nodeTypes = {};

export const BaseSubflow = ({ initialData, onChange, id }: Props) => {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || []);

	// Trigger onChange when nodes change
	useEffect(() => {
		onChange();
	}, [nodes]);

	const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || []);
	const { getEdge, getNode, getNodes, getEdges, screenToFlowPosition } = useReactFlow();
	const { getIntersectingNodes, updateNode } = useReactFlow();

	const onConnect = useCallback(
		(con: Connection) => setEdges((eds) => addEdge(con, eds)),
		[setEdges]
	);

	// Custom onNodesChange that triggers onChange when nodes change
	const wrappedOnNodesChange = useCallback(
		(changes: NodeChange<Node<SubflowNodeExtData>>[]) => {
			if (changes.length > 0) {
				// Only trigger onChange for non-position changes
				const hasNonPositionChanges = changes.some(
					(change) => change.type !== 'position' && change.type !== 'dimensions'
				);

				onNodesChange(changes);

				if (hasNonPositionChanges) {
					onChange();
				}
			}
		},
		[onNodesChange, onChange]
	);

	// Custom onEdgesChange that triggers onChange when edges change
	const wrappedOnEdgesChange = useCallback(
		(changes: EdgeChange[]) => {
			if (changes.length > 0) {
				onEdgesChange(changes);
				onChange();
			}
		},
		[onEdgesChange, onChange]
	);

	const onNodesDelete = (deletedNodes: Node[]) => {
		console.log('onNodesDelete', deletedNodes);
		for (const node of deletedNodes) {
			setEdges((edges) =>
				edges.filter((edge) => edge.source !== node.id && edge.target !== node.id)
			);
			setNodes((nodes) => nodes.filter((n) => n.id !== node.id));
		}
	};

	// Copyright webkid GmbH, https://reactflow.dev/examples/interaction/drag-and-drop.
	const onDrop = useCallback(
		(event: DragEvent) => {
			event.preventDefault();

			// check if the dropped element is valid
			const type = event.dataTransfer?.getData('application/reactflow');
			if (!type) {
				return;
			}

			const position = screenToFlowPosition(
				{
					x: event.clientX,
					y: event.clientY
				},
				{ snapToGrid: true }
			);
			console.log('onDrop', type, position);

			const newNode = createSNode(type, position);

			setNodes((nds) => nds.concat(newNode));
		},
		[screenToFlowPosition, setNodes]
	);

	const onDragOver = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.dataTransfer!.dropEffect = 'move';
	}, []);

	const isValidConnection = useCallback(
		(con: Connection | Edge) => {
			if (!con.source || !con.target) return false;

			// Block cycles. Copyright webkid GmbH, (https://reactflow.dev/examples/interaction/prevent-cycles)
			const nodes = getNodes();
			const edges = getEdges();

			let source: Node | undefined = undefined;
			let target: Node | undefined = undefined;

			for (const node of nodes) {
				if (node.id === con.source) {
					source = node;
				}
				if (node.id === con.target) {
					target = node;
				}
			}

			const hasCycle = (node: Node, visited = new Set()) => {
				if (visited.has(node.id)) return false;

				visited.add(node.id);

				for (const outgoer of getOutgoers(node, nodes, edges)) {
					if (outgoer.id === con.source) return true;
					if (hasCycle(outgoer, visited)) return true;
				}
			};

			if (!source) return false;
			if (!target) return false;
			if (target.id === con.source) return false;
			if (hasCycle(target)) {
				return false;
			}

			// Lastly, perform static validationn here: TODO

			return true;
		},
		[getNode, getNodes, getEdges, getOutgoers]
	);

	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			onNodesChange={wrappedOnNodesChange}
			onEdgesChange={wrappedOnEdgesChange}
			onNodesDelete={onNodesDelete}
			nodeTypes={nodeTypes}
			edgeTypes={edgeTypes}
			onDrop={onDrop}
			onDragOver={onDragOver}
			onConnect={onConnect}
			isValidConnection={isValidConnection}
			colorMode={'dark'} // Always force dark mode
			defaultEdgeOptions={{ type: 'delete_button' }}
			proOptions={{
				hideAttribution: true
			}}
			id={`subflow-${id}`}
			className="!bg-background flex-auto react-flow"
			defaultViewport={{
				zoom: 1.5,
				x: 0,
				y: 0
			}}
		>
			<Controls showInteractive={true} />
			<Background
				variant={BackgroundVariant.Cross}
				gap={18}
				size={1}
				className="!bg-muted/20"
				color="white"
			/>
		</ReactFlow>
	);
};
