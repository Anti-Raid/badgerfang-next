import React, { DragEvent, useCallback, useContext, useEffect } from "react";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  getOutgoers,
  Node,
  NodeChange,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/base.css";
import { FlowData, getValidationSource, getValidationTarget, NodeExtData } from "@/lib/flow/data";
import { createNode } from "@/lib/flow/nodes";
import { edgeTypes, nodeTypes, subflowComps } from "@/lib/flow/components";

interface Props {
  initialData?: FlowData;
  onChange: () => void;
}

export default function FlowEditor({
  initialData,
  onChange,
}: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialData?.nodes || []
  );

  // Trigger onChange when nodes change
  useEffect(() => {
    onChange();
  }, [nodes])

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialData?.edges || []
  );
  const { getEdge, getNode, getNodes, getEdges, screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (con: Connection) => setEdges((eds) => addEdge(con, eds)),
    [setEdges]
  );

  // Custom onNodesChange that triggers onChange when nodes change
  const wrappedOnNodesChange = useCallback(
    (changes: NodeChange<Node<NodeExtData>>[]) => {
      if (changes.length > 0) {
        onNodesChange(changes);
        onChange();
      }      
    },
    [onNodesChange, onChange, getNode]
  );

  // Custom onEdgesChange that triggers onChange when edges change
  const wrappedOnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (changes.length > 0) {
        onEdgesChange(changes);
        onChange();
      }
    },
    [getEdge, onEdgesChange, onChange]
  );

  const onNodesDelete = 
    (deletedNodes: Node[]) => {
      console.log("onNodesDelete", deletedNodes);
      for (const node of deletedNodes) {
        setEdges((edges) => edges.filter((edge) => edge.source !== node.id && edge.target !== node.id));
        setNodes((nodes) => nodes.filter((n) => n.id !== node.id));
      }
    };

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = "move";
  }, []);

  // Copyright webkid GmbH, https://reactflow.dev/examples/interaction/drag-and-drop.
  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
 
      // check if the dropped element is valid
      const type = event.dataTransfer?.getData("application/reactflow");
      if (!type) {
        return;
      }
 
      const position = screenToFlowPosition({
        x: event.clientX - 20, // Offset to center the node under the cursor
        y: event.clientY - 20, // Offset to center the node under the cursor
      });

      // Check if the X/Y intersects with an existing node
      const existingNode = getNodes().filter((node) => {
        if (!subflowComps.includes(node.type || "")) {
          return false;
        }

        return (
          position.x >= node.position.x &&
          position.x <= node.position.x + (node.width || 0) &&
          position.y >= node.position.y &&
          position.y <= node.position.y + (node.height || 0)
        );
      });

      let parent = undefined;
      if (existingNode.length > 0) {
        parent = existingNode[existingNode.length - 1].id;
      }
      
      const newNode = createNode(type, position, undefined, parent);
 
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  const isValidConnection = useCallback(
    (con: Connection | Edge) => {
      if (!con.source || !con.target) return false;

      // Block cycles. Copyright webkid GmbH, (https://reactflow.dev/examples/interaction/prevent-cycles)
      const nodes = getNodes();
      const edges = getEdges();

      let source: Node | undefined = undefined;
      let target: Node | undefined = undefined;

      for(const node of nodes) {
        if(node.id === con.source) {
          source = node;
        }
        if(node.id === con.target) {
          target = node;
        }
      }

      const hasCycle = (node: Node, visited = new Set()) => {
        if (visited.has(node.id)) return false;
 
        visited.add(node.id);
 
        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === con.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
      };
      
      if(!source) return false;
      if(!target) return false;
      if (target.id === con.source) return false;
      if (hasCycle(target)) {
        return false;
      }

      // Lastly, perform static validations
      const validationSource = getValidationSource(source.type!);
      const validationTarget = getValidationTarget(target.type!);
      if(validationSource || validationTarget) {
        const srcNodeIds = getOutgoers(source, nodes, edges).map((n) => n.id);
        const tgtNodeIds = getOutgoers(target, nodes, edges).map((n) => n.id);

        if (validationSource && !validationSource(srcNodeIds, tgtNodeIds, con, source as Node<NodeExtData>, target as Node<NodeExtData>, getNode as (id: string) => Node<NodeExtData> | undefined)) {
          return false;
        }

        if (validationTarget && !validationTarget(srcNodeIds, tgtNodeIds, con, source as Node<NodeExtData>, target as Node<NodeExtData>, getNode as (id: string) => Node<NodeExtData> | undefined)) {
          return false;
        }
      }

      return true;
    },
    [getNode, getNodes, getEdges, getOutgoers]
  );


  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={wrappedOnNodesChange}
      onEdgesChange={wrappedOnEdgesChange}
      onNodesDelete={onNodesDelete}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onConnect={onConnect}
      isValidConnection={isValidConnection}
      colorMode={"dark"} // Always force dark mode
      defaultEdgeOptions={{ type: "delete_button" }}
      proOptions={{
        hideAttribution: true,
      }}
      className="!bg-background flex-auto react-flow"
      defaultViewport={{
        zoom: 1.5,
        x: 0,
        y: 0,
      }}
    >
      <Controls showInteractive={true} />
      <Background
        variant={BackgroundVariant.Cross}
        gap={18}
        size={1}
        className="!bg-muted/20"
        color="white"
      />
    </ReactFlow>
  );
}