import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react';
import { FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all'
          }}
          className="nodrag nopan"
        >
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="h-6 w-6 rounded-full bg-destructive hover:bg-destructive/90 
                       flex items-center justify-center shadow-lg 
                       border border-destructive-foreground/20
                       transition-colors duration-200"
            onClick={onEdgeClick}
            aria-label="Delete edge"
          >
            <FiX className="text-destructive-foreground w-3.5 h-3.5" />
          </motion.button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}