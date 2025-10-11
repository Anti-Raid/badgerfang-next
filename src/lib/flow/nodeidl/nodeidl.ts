export interface Node {
    type: string;
    fields: NodeField[];
}

export type NodeField = {
    type: "string" | "number" | "boolean" | "raw" | "typedinput" | "embed";
    label: string;
    id: string;
    description?: string;
}