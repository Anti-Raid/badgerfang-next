// The compiled representation of a flow object file (.flow.json) with all imports
// inlined / fully self-contained to the representation

export type Field =
	| {
			type: 'scalar';
			data: FieldData;
			optional: boolean;
	  }
	| {
			type: 'array';
			elementType: Field;
			optional: boolean;
	  }
	| {
			type: 'group';
			fields: Field[];
			groupData: GroupData;
			optional: boolean;
	  };

export interface GroupData {
	shortname: string;
	id: string;
	description: string;
}

export interface FieldData {
	shortname: string;
	id: string;
	description: string;
	type: string;
}

export interface FlowUI {
	handles: {
		allow: ('top' | 'bottom')[];
	};
	input: Field;
	output: Field;
}

export interface Node {
	id: string;
	shortname: string;
	description: string;
	flowui: FlowUI;
	code: string; // the luau code to execute to generate code for this node
}
