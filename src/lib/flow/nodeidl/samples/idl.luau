-- The compiled representation of a flow object file (.flow.json) with all imports
-- inlined / fully self-contained to the representation

export type GroupData = {
	shortname: string,
	id: string,
	description: string,
}

export type FieldData = {
	shortname: string,
	id: string,
	description: string,
	type: string,
}

-- This is a recursive type, which Luau supports.
export type Field ={
		type: "scalar",
		data: FieldData,
		optional: boolean,
	} | {
		type: "array",
		elementType: Field,
		optional: boolean,
	} | {
		type: "group",
		fields: {Field},
		groupData: GroupData,
		optional: boolean,
	}

export type FlowUI = {
	handles: {
		allow: {"top" | "bottom"},
	},
	input: Field,
	output: Field,
}

export type Node = {
	id: string,
	shortname: string,
	description: string,
	flowui: FlowUI,
}

export type Action = {
    type: "generate"
}

return {}