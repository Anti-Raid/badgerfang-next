import React from "react";
import { NodeExtData } from "./data";
import { Edge, Node } from "@xyflow/react";

export interface FlowContext {
    getData: (id: string) => NodeExtData;
    setData: (id: string, data: NodeExtData) => void;
    removeData: (id: string) => void;
    onChange: (nodes: Node[], edges: Edge[]) => void;
}

export const FlowContext = React.createContext<FlowContext>({
    getData: (id: string) => {
        throw new Error("getData not implemented in FlowContext");
    },
    setData: (id: string, data: NodeExtData) => {
        throw new Error("onDataChange not implemented in FlowContext"); 
    },
    removeData: (id: string) => {
        throw new Error("removeData not implemented in FlowContext");
    },
    onChange: (nodes: Node[], edges: Edge[]) => {
        throw new Error("onChange not implemented in FlowContext");
    }
});