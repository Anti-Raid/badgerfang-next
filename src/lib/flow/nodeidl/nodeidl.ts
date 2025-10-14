// The compiled representation of a flow object file (.flow.json) with all imports
// inlined / fully self-contained to the representation

export type Field = {
    type: "scalar",
    data: FieldData,
    optional: boolean
} | {
    type: "array",
    elementType: Field,
    optional: boolean
} | {
    type: "group",
    fields: Field[],
    optional: boolean
}

export interface FieldData {
    shortname: string;
    id: string;
    description: string;
    type: string;
}

export interface Model {
    shortname: string;
    id: string;
    description: string;
    typename: string;
    fields: Field;
}

export interface FlowUI {
    handles: {
        allow: ("top" | "bottom")[]
    },
    input: Model,
    output: Model
}

export interface Node {
    id: string;
    shortname: string;
    description: string;
    flowui: FlowUI;
    code: string; // the luau code to execute to generate code for this node
}