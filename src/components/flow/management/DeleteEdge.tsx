import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, useReactFlow } from '@xyflow/react';
import { FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

/**
 * Renders a bezier edge with an animated delete button placed at the edge label; clicking the button removes the edge from the current React Flow instance.
 *
 * @param id - The edge identifier used to locate and remove the edge.
 * @param style - Optional style overrides applied to the edge stroke.
 * @param selected - When true, applies selected styling (color and stroke width) to the edge.
 * @returns A JSX element that draws the bezier edge and an animated, positioned delete button that filters out the edge by `id` when clicked.
 */
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
					stroke: selected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
					strokeWidth: selected ? 3 : 2,
					transition: 'all 0.3s ease',
					...style
				}}
			/>

			<EdgeLabelRenderer>
				<motion.button
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					style={{
						position: 'absolute',
						transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
						pointerEvents: 'all'
					}}
					className="nodrag nopan h-6 w-6 rounded-full bg-destructive hover:bg-destructive/80 
                     flex items-center justify-center shadow-lg transition-colors"
					onClick={onEdgeClick}
				>
					<FiX className="text-destructive-foreground w-3 h-3" />
				</motion.button>
			</EdgeLabelRenderer>
		</>
	);
}