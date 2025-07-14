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

    return (
        <>
            {createPortal(
                <dialog
                    ref={dialogRef}
                    className="modal"
                    onClose={() => {
                        setExpanded(false);
                    }}
                    open={false}
                >
                    <div 
                        className="modal-box"
                    >
                        <h2 className="text-lg font-bold">{title || `Editting ${nodeProps.id}`}</h2>
                        <div className="py-4">
                            {children}
                        </div>
                        <div className="modal-action">
                            <Ghost Title="Close" onClick={() => {
                                if (dialogRef.current?.open) {
                                    dialogRef.current.close();
                                }
                            }} aria-label="Close Modal" />
                        </div>
                    </div>
                </dialog>, 
                document.body
            )}

            <div className="flex items-center justify-center text-sm">
                <SmallGhost 
                    Title={isExpanded ? "Collapse" : "Expand"}
                    onClick={() => setExpanded(!isExpanded)}
                />
            </div>
        </>
    )
}