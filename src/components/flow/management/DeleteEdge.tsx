import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, useReactFlow } from '@xyflow/react';
import { FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

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
          stroke: selected ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
          strokeWidth: selected ? 3 : 2,
          transition: 'stroke 0.3s ease',
          ...style
        }}
      />

      <EdgeLabelRenderer>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
            zIndex: 100
          }}
          className="nodrag nopan flex items-center justify-center h-6 w-6 rounded-full bg-accent hover:bg-accent/70 cursor-pointer shadow-lg"
          onClick={onEdgeClick}
        >
          <FiX className="text-foreground w-4 h-4" />
        </motion.div>
      </EdgeLabelRenderer>

      <motion.circle
        r="4"
        fill="hsl(var(--primary))"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
      >
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
      </motion.circle>
    </>
  );
}
