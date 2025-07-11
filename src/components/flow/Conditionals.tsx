/**
For if statements in flow:

1. a if statement can only have one non-continuing connection but may have an arbitrary number of continuing connections with the exception that an if may only have one connection to a end (a continuing connection is a connection targeting elseif, else or end)

2. A elseif or else block may only be connected to a if source
 */

import { Connection, Edge, Node, NodeConnection, Position } from "@xyflow/react";
import FlowNodeBase from "./BaseNode";
import Handle from "./Handle";
import { NodeData, NodeProps, NodeTypeEnum, registerValidationSource, registerValidationTarget } from "@/lib/flow/data";
import { useContext, useEffect, useMemo, useState } from "react";
import { FlowContext } from "@/lib/flow/context";
import { InputField } from "./Inputs";
import { FlowExpanded } from "./FlowExpanded";
import logger from "@/lib/logger";

// Static validation for if_condition: If conditions have rule 1 for source connections, meaning they can only have one source connection
registerValidationSource("if_condition", (svi: FlowContext, srcCons: string[], tgtCons: string[], edge: Edge | Connection, source: Node<NodeData>, target: Node<NodeData>) => {
    console.log("Validating connection for IfCondition:", { srcCons, target });

    let numContinuationConnections = 0;
    let numEnds = 0; // Number of end connections
    let numBlocks = 0; // Non-continuing connections

    const addNode = (nodeId: string): boolean => {
        const node = svi.getData(nodeId);
        if (!node) {
            // If the node type is not defined, we cannot validate it
            return false;
        }
        
        console.log("Adding in node:", { nodeId: nodeId, nodeType: node.type, node, numContinuationConnections, numEnds, numBlocks });

        if(node.type === NodeTypeEnum.ElseIfCondition || node.type === NodeTypeEnum.ElseCondition || node.type === NodeTypeEnum.EndCondition) {
            numContinuationConnections++;

            if (node.type === NodeTypeEnum.EndCondition) {
                numEnds++;
            }
        } else {
            numBlocks++;
        }

        if (numBlocks > 1) {
            logger.error("Flow.IfCondition", "IfCondition can only have one non-continuing connection.");
        }

        if (numEnds > 1) {
            logger.error("Flow.IfCondition", "IfCondition can only have one end connection.");
        }

        return numBlocks <= 1 && numEnds <= 1;
    }

    if(!addNode(target.id)) {
        return false;
    }

    for (const conn of srcCons) {
        if (!addNode(conn)) {
            return false;
        }
    }

    return true;
})

// Static validation for elseif_condition: ElseIf conditions can only have one source connection and also can only be connected to an IfCondition or ElseIfCondition node.
registerValidationTarget("elseif_condition", (svi: FlowContext, srcCons: string[], tgtCons: string[], edge: Edge | Connection, source: Node<NodeData>, target: Node<NodeData>) => {
    if(tgtCons.length >= 1) {
        logger.error("Flow.ElseIfCondition", "ElseIfCondition can only have one source connection.");
        return false;
    }

    let srcData = svi.getData(source.id);
    if(!srcData) {
        logger.error("Flow.ElseIfCondition", "Source node data not found for ElseIfCondition.");
        return false;
    }

    if(srcData.type !== NodeTypeEnum.IfCondition && srcData.type !== NodeTypeEnum.ElseIfCondition) {
        logger.error("Flow.ElseIfCondition", "ElseIfCondition can only be connected to an IfCondition/ElseIfCondition node.");
        return false;
    }

    return true;
});

export const IfCondition = (props: NodeProps) => {
  const svi = useContext(FlowContext);
  const currentData = useMemo(() => svi.getData(props.id), [svi, props.id]);

  if(currentData.type != NodeTypeEnum.IfCondition) {
    return <div className="text-red-500">Invalid node type: {currentData.type}</div>;
  }

  const [condition, setCondition] = useState<string>(currentData.data.condition || "");

  useEffect(() => {
    console.log("Setting condition to:", condition);
    svi.setData(props.id, {
        ...currentData,
        data: {
            ...currentData.data,
            condition: condition,
        }
    });
  }, [condition, props.id]);

  return (
    <FlowNodeBase {...props}>
        {/*If statement can accept connections from anywhere*/}
        <Handle type="target" position={Position.Top} />
        {/*If statement have rule 1 for source connections*/}
        <Handle type="source" position={Position.Bottom} />

        <FlowExpanded nodeProps={props}>
            <InputField 
                id={`${props.id}-condition`}
                label="Condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="Enter condition"
                className="w-full"
                error={!condition ? "Condition is required." : ""}
            /> 
        </FlowExpanded>
    </FlowNodeBase>
  );
}

export const ElseIfCondition = (props: NodeProps) => {
  const svi = useContext(FlowContext);
  const currentData = useMemo(() => svi.getData(props.id), [svi, props.id]);

  if(currentData.type != NodeTypeEnum.ElseIfCondition) {
    return <div className="text-red-500">Invalid node type: {currentData.type}</div>;
  }

  const [condition, setCondition] = useState<string>(currentData.data.condition || "");

  useEffect(() => {
    console.log("Setting condition to:", condition);
    svi.setData(props.id, {
        ...currentData,
        data: {
            ...currentData.data,
            condition: condition,
        }
    });
  }, [condition, props.id]);

  return (
    <FlowNodeBase {...props}>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />

        <FlowExpanded nodeProps={props}>
            <InputField 
                id={`${props.id}-condition`}
                label="Condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="Enter condition"
                className="w-full"
                error={!condition ? "Condition is required." : ""}
            /> 
        </FlowExpanded>
    </FlowNodeBase>
  );
}