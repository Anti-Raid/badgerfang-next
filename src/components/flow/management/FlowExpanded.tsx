import { NodeProps } from '@/lib/flow/data';
	import { Ghost } from '../../ui/Buttons';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface FlowExpandedProps {
  nodeProps: NodeProps;
  children: React.ReactNode;
  title?: string; // Optional title for the modal
}

/**
 * Helper component to expand and collapse a flow node's inner contents.
 */
export const FlowExpanded: React.FC<FlowExpandedProps> = ({ nodeProps, children, title }) => {
  const [isExpanded, setExpanded] = useState(false);

  const modal = (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          tabIndex={-1}
          role="dialog"
          aria-modal={true}
          className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            key="modal-content"
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-gradient-to-br from-background via-muted to-card dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 rounded-xl shadow-2xl w-full max-w-md p-6 border border-muted/50"
          >
            <h2 className="text-xl font-bold text-foreground dark:text-white mb-4">
              {title || `Editing ${nodeProps.data.type}`}
            </h2>
            <div className="py-2 text-foreground dark:text-neutral-200">{children}</div>
            <div className="flex justify-end mt-4 gap-2">
              <Ghost
                Title="Close"
                onClick={() => setExpanded(false)}
                aria-label="Close Modal"
                className="hover:scale-105 transition-transform duration-200"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {createPortal(modal, document.body)}

      <div className="flex justify-center mt-2">
        <Ghost
          size="small"
          Title={isExpanded ? 'Collapse' : 'Expand'}
          onClick={() => setExpanded(!isExpanded)}
          className="hover:scale-105 transition-transform duration-200"
        />
      </div>
    </>
  );
};
