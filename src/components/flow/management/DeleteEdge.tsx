<<<<<<< HEAD
import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react';
import { FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
=======
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, useReactFlow } from '@xyflow/react';
import { XIcon } from 'lucide-react';
>>>>>>> 69c9267d012b3eddc0ccdddaf124d8ea78b21421

interface EdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: any;
  targetPosition: any;
  style?: React.CSSProperties;
  markerEnd?: string;
  selected?: boolean;
}

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

  const onEdgeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('Deleting edge with id:', id);
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

<<<<<<< HEAD
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

=======
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
>>>>>>> 69c9267d012b3eddc0ccdddaf124d8ea78b21421
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