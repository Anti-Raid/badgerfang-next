import { NodeProps } from "@/lib/flow/data"
import { SmallGhost } from "../ui/Buttons";
import { useState } from "react";

interface FlowExpandedProps {
    nodeProps: NodeProps;
    children: React.ReactNode;
}

/**
 * Helper component to expand and collapse a flow node's inner contents.
 */
export const FlowExpanded: React.FC<FlowExpandedProps> = ({ nodeProps, children }) => {
    const [isExpanded, setExpanded] = useState(false);
    return (
        <>
            {isExpanded && children}

            <div className="flex items-center justify-center text-sm">
                <SmallGhost 
                    Title={isExpanded ? "Collapse" : "Expand"}
                    onClick={() => setExpanded(!isExpanded)}
                />
            </div>
        </>
    )
}