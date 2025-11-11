import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, useReactFlow } from '@xyflow/react';
import { XIcon } from 'lucide-react';

export default function FlowEdgeDeleteButton({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
	markerEnd,
	selected
}: EdgeProps) {
	const { setEdges } = useReactFlow();
	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition
	});

	const onEdgeClick = () => {
		console.log('Deleting edge with id:', id);
		setEdges((edges) => edges.filter((edge) => edge.id !== id));
	};

	return (
		<>
			<BaseEdge
				path={edgePath}
				markerEnd={markerEnd}
				style={{
					stroke: selected ? '#6e6a95' : '#908dae',
					...style
				}}
			/>
			<EdgeLabelRenderer>
				<div
					style={{
						position: 'absolute',
						transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
						// everything inside EdgeLabelRenderer has no pointer events by default
						// if you have an interactive element, set pointer-events: all
						pointerEvents: 'all',
						zIndex: 100
					}}
					className="nodrag nopan cursor-pointer h-4 w-4 rounded-full flex items-center justify-center bg-muted cursor-pointer hover:cursor-pointer hover:bg-muted/50"
					onClick={onEdgeClick}
				>
					<XIcon className="h-3 w-3 text-foreground" />
				</div>
			</EdgeLabelRenderer>

			<circle r="4" fill="#ff0073">
				<animateMotion dur="1s" repeatCount="indefinite" path={edgePath} />
			</circle>
		</>
	);
}