import { NodeProps } from "@/lib/flow/data"
import { Ghost, SmallGhost } from "../ui/Buttons";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface FlowExpandedProps {
    nodeProps: NodeProps;
    children: React.ReactNode;
    title?: string; // Optional title for the modal
}

/**
 * Helper component to expand and collapse a flow node's inner contents.
 */
export const FlowExpanded: React.FC<FlowExpandedProps> = ({ nodeProps, children, title}) => {
    const [isExpanded, setExpanded] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null); // Keep a ref to the dialogRef

    // Call showModal on the dialog when it is expanded
    // to ensure the dialog is a modal element and not a non-modal dialog.
    //
    // This is needed for working modals with React Flow
    useEffect(() => {
        if(!dialogRef || !dialogRef.current || !isExpanded) return;
        dialogRef.current.showModal();

        return () => {
            if (dialogRef?.current?.open) {
                dialogRef.current.close();
            }
        }
    }, [dialogRef, isExpanded])

    /* 
TODO: Refactor this to use a div 

  const modal = (
    <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-black dark:text-white">
          {title || Editing ${nodeProps.id}}
        </h2>
        <div className="py-4 text-black dark:text-white">{children}</div>
        <div className="flex justify-end mt-4">
          <Ghost
            Title="Close"
            onClick={() => setExpanded(false)}
            aria-label="Close Modal"
          />
        </div>
      </div>
    </div>
  );
    */
    const modal = (
    <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-black dark:text-white">
          {title || `Editing ${nodeProps.id}`}
        </h2>
        <div className="py-4 text-black dark:text-white">{children}</div>
        <div className="flex justify-end mt-4">
          <Ghost
            Title="Close"
            onClick={() => setExpanded(false)}
            aria-label="Close Modal"
          />
        </div>
      </div>
    </div>
    );

    return (
        <>
            {isExpanded && createPortal(modal, document.body)}

            <div className="flex items-center justify-center text-sm">
                <SmallGhost 
                    Title={isExpanded ? "Collapse" : "Expand"}
                    onClick={() => setExpanded(!isExpanded)}
                />
            </div>
        </>
    )
}