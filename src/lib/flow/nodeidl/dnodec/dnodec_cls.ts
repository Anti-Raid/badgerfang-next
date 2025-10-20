import * as nodeidl from '../nodeidl.ts';

export interface ImportResolver {
	resolve: (modpath: string) => any;
}

/**
 * Stores imported DModels
 */
export class ImportStorage {
	private importResolver: ImportResolver;
	private imports: Map<string, DModel>;

	constructor(importResolver: ImportResolver) {
		this.importResolver = importResolver;
		this.imports = new Map<string, DModel>();
	}

	resolveModelImport(from: string, modpath: string): DModel {
		console.log(`=> Model import request for ${modpath} from ${from}`);

		if (this.imports.has(modpath)) {
			return this.imports.get(modpath)!;
		}

		// Load the imported file
		let importedJson = this.importResolver.resolve(modpath);

		const importedModel = DModel.fromJSON(importedJson, this, modpath);
		this.imports.set(modpath, importedModel);
		return importedModel;
	}
}

/**
 * Stores module imports for a DNode/DModel
 */
export class ModuleImports {
	private imports: Map<string, DModel>;

	constructor() {
		this.imports = new Map<string, DModel>();
	}

	addImport(to: string, model: DModel) {
		if (!/^[A-Z][a-zA-Z0-9_]*$/.test(to)) {
			throw new Error(
				`Import destinations must be alphanumeric or underscore and must start with a uppercase letter. Invalid id: ${to}`
			);
		}
		this.imports.set(to, model);
	}

	getImport(to: string): DModel | undefined {
		return this.imports.get(to);
	}

	hasImport(to: string): boolean {
		return this.imports.has(to);
	}

	toJSON() {
		return Array.from(this.imports.entries()).map(([to, model]) => ({ to, model }));
	}
}

export type DFieldType =
	| {
			type: 'scalar';
			name: string;
			optional: boolean;
	  }
	| {
			type: 'array';
			elementType: DFieldType;
			optional: boolean;
	  };

/**
 * A field in a DModel/DNode
 */
export class DField {
	private imports: ModuleImports;
	private type: DFieldType;
	private shortname: string;
	private id: string;
	private description: string;

	constructor(
		imports: ModuleImports,
		type: DFieldType,
		shortname: string,
		id: string,
		description: string
	) {
		this.imports = imports;
		this.type = this.validateDFieldType(type);
		this.shortname = shortname;
		this.id = id;
		this.description = description;
		this.validate();
	}

	// Convert the DField into a nodeidl.Field
	private gen(): nodeidl.Field {
		if (this.type.type === 'scalar') {
			return {
				type: 'scalar',
				data: {
					shortname: this.shortname,
					id: this.id,
					description: this.description,
					type: this.type.name
				},
				optional: this.type.optional
			};
		} else if (this.type.type === 'array') {
			let innerElem = new DField(
				this.imports,
				this.type.elementType,
				this.shortname,
				this.id,
				this.description
			);
			return {
				type: 'array',
				elementType: innerElem.gen(),
				optional: this.type.optional
			};
		} else {
			throw new Error('Internal Error: Unknown DFieldType in gen().');
		}
	}

	// Validate a DFieldType object
	private validateDFieldType = (obj: any): DFieldType => {
		if (typeof obj !== 'object' || obj === null) {
			throw new Error('DFieldType must be an object.');
		}
		if (obj.type === 'scalar') {
			if (typeof obj.name !== 'string' || obj.name.length === 0) {
				throw new Error(
					`DFieldType of type 'scalar' must have a non-empty string 'name' property. [when processing ${JSON.stringify(obj)}]`
				);
			}
			if (obj.optional && typeof obj.optional !== 'boolean') {
				throw new Error(
					`DFieldType of type 'scalar' must have a boolean 'optional' property if present. [when processing ${JSON.stringify(obj)}]`
				);
			}
			return {
				type: 'scalar',
				name: obj.name,
				optional: obj.optional
			};
		} else if (obj.type === 'array') {
			if (typeof obj.elementType !== 'object' || obj.elementType === null) {
				throw new Error(
					`DFieldType of type 'array' must have an 'elementType' property that is an object. [when processing ${JSON.stringify(obj)}]`
				);
			}
			if (obj.optional && typeof obj.optional !== 'boolean') {
				throw new Error(
					`DFieldType of type 'array' must have a boolean 'optional' property if present. [when processing ${JSON.stringify(obj)}]`
				);
			}
			return {
				type: 'array',
				elementType: this.validateDFieldType(obj.elementType),
				optional: obj.optional
			};
		} else {
			throw new Error("DFieldType must have a 'type' property that is either 'scalar' or 'array'.");
		}
	};

	private validate() {
		if (typeof this.type !== 'object' || this.type === null) {
			throw new Error('DField.type must be a non-empty object.');
		}
		if (typeof this.shortname !== 'string' || this.shortname.length === 0) {
			throw new Error('DField.shortname must be a non-empty string.');
		}
		if (typeof this.id !== 'string' || this.id.length === 0) {
			throw new Error('DField.id must be a non-empty string.');
		}
		if (typeof this.description !== 'string' || this.description.length === 0) {
			throw new Error('DField.description must be a non-empty string.');
		}
	}

	static fromJSON(imports: ModuleImports, id: string, json: any): DField {
		if (typeof json !== 'object' || json === null) {
			throw new Error('DField JSON must be an object.');
		}

		return new DField(imports, json.type, json.shortname, id, json.description);
	}

	toJSON() {
		return {
			type: this.type,
			shortname: this.shortname,
			id: this.id,
			description: this.description
		};
	}
}

/**
 * A DModel represents a discord model.
 */
export class DModel {
	id: string;
	private shortname: string;
	private description: string;
	private imports: ModuleImports;
	private fields: DField[];
	private code: string; // The codegen code for this module

	constructor(
		shortname: string,
		id: string,
		description: string,
		imports: ModuleImports,
		fields: DField[],
		code: string
	) {
		this.shortname = shortname;
		this.id = id;
		this.description = description;
		this.imports = imports;
		this.fields = fields;
		this.code = code;
		this.validate();
	}

	// Helper method to validate the DModel
	//
	// Part of: Import/Parse Pass
	private validate() {
		if (!Array.isArray(this.fields)) {
			throw new Error('Internal Error: DModel.fields must be an array.');
		}
		for (let i = 0; i < this.fields.length; i++) {
			if (!(this.fields[i] instanceof DField)) {
				throw new Error(`Internal Error: DModel.fields[${i}] must be a DField.`);
			}
		}
		if (typeof this.shortname !== 'string' || this.shortname.length === 0) {
			throw new Error('DModel.shortname must be a non-empty string.');
		}
		if (typeof this.id !== 'string' || this.id.length === 0) {
			throw new Error('DModel.id must be a non-empty string.');
		}
		if (typeof this.description !== 'string') {
			throw new Error('DModel.description must be a string.');
		}
		if (typeof this.code !== 'string') {
			throw new Error('DModel.code must be a string.');
		}
	}

	// Create a DModel from a JSON object
	//
	// Part of: Import/Parse Pass
	static fromJSON(json: any, importStorage: ImportStorage, filename: string): DModel {
		if (typeof json !== 'object' || json === null) {
			throw new Error(
				`DModel JSON must be an object when processing file ${filename}. with current obj: ${JSON.stringify(json)}`
			);
		}
		if (typeof json.imports !== 'object' || json.imports === null || !Array.isArray(json.imports)) {
			throw new Error('DModel.imports must be an array.');
		}
		if (typeof json.id !== 'string' || json.id.length === 0) {
			throw new Error('DModel.id must be a non-empty string.');
		}

		// Ensure ID is alphanumeric or underscore
		// and does not start with a number
		if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(json.id)) {
			throw new Error(
				`DModel.id must be alphanumeric or underscore and cannot start with a number. Invalid id: ${json.id}`
			);
		}

		const imports = new ModuleImports();
		for (let i = 0; i < json.imports.length; i++) {
			const imp = json.imports[i];
			if (
				typeof imp !== 'object' ||
				imp === null ||
				typeof imp.from !== 'string' ||
				typeof imp.to !== 'string'
			) {
				throw new Error(
					`DModel.imports[${i}] must be an object with 'from' and 'to' string properties.`
				);
			}
			let importedModel = importStorage.resolveModelImport(
				`${json.id} (model ${filename})`,
				imp.from
			);
			if (imports.hasImport(imp.to)) {
				throw new Error(`DModel.imports has duplicate 'to' value: ${imp.to}`);
			}
			imports.addImport(imp.to, importedModel);
		}
		if (typeof json.fields !== 'object' || json.fields === null) {
			throw new Error('DModel.fields must be an object.');
		}
		const fields: DField[] = [];
		for (const key in json.fields) {
			const fieldJson = json.fields[key];
			const field = DField.fromJSON(imports, key, fieldJson);
			fields.push(field);
		}

		let code = '';
		if (typeof json.code !== 'string' && json.code !== undefined) {
			throw new Error('DModel.code must be a string if present.');
		}
		if (typeof json.code === 'string') {
			code = json.code;
		}

		return new DModel(json.shortname, json.id, json.description, imports, fields, code);
	}

	toJSON() {
		return {
			shortname: this.shortname,
			id: this.id,
			description: this.description,
			imports: this.imports,
			fields: this.fields.map((field) => field.toJSON()),
			code: this.code
		};
	}
}

type FlowUI_IO =
	| {
			typ: 'model';
			model: DModel;
	  }
	| {
			typ: 'fields';
			fields: Map<string, DField>;
	  };

/**
 * FlowUI related things for a node
 */
export class FlowUI {
	private handles: {
		allow: ('top' | 'bottom')[];
	};
	private input: FlowUI_IO;
	private output: FlowUI_IO;

	constructor(handles: { allow: ('top' | 'bottom')[] }, input: FlowUI_IO, output: FlowUI_IO) {
		this.handles = handles;
		this.input = input;
		this.output = output;
	}

	static fromJSON(
		json: any,
		importStorage: ImportStorage,
		imports: ModuleImports,
		filename: string
	): FlowUI {
		if (typeof json !== 'object' || json === null) {
			throw new Error('FlowUI JSON must be an object.');
		}

		if (
			typeof json.handles !== 'object' ||
			json.handles === null ||
			!Array.isArray(json.handles.allow)
		) {
			throw new Error("FlowUI.handles must be an object with an 'allow' array property.");
		}

		for (let i = 0; i < json.handles.allow.length; i++) {
			if (json.handles.allow[i] !== 'top' && json.handles.allow[i] !== 'bottom') {
				throw new Error(`FlowUI.handles.allow[${i}] must be either 'top' or 'bottom'.`);
			}
		}

		let inputModel: FlowUI_IO;
		let outputModel: FlowUI_IO;

		if (json.inputs) {
			inputModel = { typ: 'model', model: DModel.fromJSON(json.inputs, importStorage, filename) };
		} else if (typeof json.input === 'object' && json.input !== null) {
			const fieldsMap = new Map<string, DField>();
			for (const key in json.input) {
				const fieldJson = json.input[key];
				const field = DField.fromJSON(imports, key, fieldJson);
				fieldsMap.set(key, field);
			}
			inputModel = { typ: 'fields', fields: fieldsMap };
		} else {
			throw new Error('Either flowui.inputs or flowui.input must be provided.');
		}

		if (json.outputs) {
			outputModel = { typ: 'model', model: DModel.fromJSON(json.outputs, importStorage, filename) };
		} else if (typeof json.output === 'object' && json.output !== null) {
			const fieldsMap = new Map<string, DField>();
			for (const key in json.output) {
				const fieldJson = json.output[key];
				const field = DField.fromJSON(imports, key, fieldJson);
				fieldsMap.set(key, field);
			}
			outputModel = { typ: 'fields', fields: fieldsMap };
		} else {
			throw new Error('Either flowui.outputs or flowui.output must be provided.');
		}

		return new FlowUI({ allow: json.handles.allow }, inputModel, outputModel);
	}

	toJSON() {
		return {
			handles: this.handles,
			input: this.input,
			output: this.output
		};
	}
}

/**
 * A DNode represents a discord node
 */
export class DNode {
	private shortname: string;
	private id: string;
	private description: string;
	private imports: ModuleImports;
	private code: string; // The codegen code for this node
	private flowui: FlowUI;

	constructor(
		shortname: string,
		id: string,
		description: string,
		imports: ModuleImports,
		code: string,
		flowui: FlowUI
	) {
		this.shortname = shortname;
		this.id = id;
		this.description = description;
		this.imports = imports;
		this.code = code;
		this.flowui = flowui;
		this.validate();
	}

	private validate() {
		if (typeof this.shortname !== 'string' || this.shortname.length === 0) {
			throw new Error('DNode.shortname must be a non-empty string.');
		}
		if (typeof this.id !== 'string' || this.id.length === 0) {
			throw new Error('DNode.id must be a non-empty string.');
		}
		if (typeof this.description !== 'string') {
			throw new Error('DNode.description must be a string.');
		}
	}

	static fromJSON(json: any, importStorage: ImportStorage, file: string): DNode {
		if (typeof json !== 'object' || json === null) {
			throw new Error('DNode JSON must be an object.');
		}
		if (typeof json.imports !== 'object' || json.imports === null || !Array.isArray(json.imports)) {
			throw new Error('DNode.imports must be an array.');
		}
		if (typeof json.id !== 'string' || json.id.length === 0) {
			throw new Error('DNode.id must be a non-empty string.');
		}
		const imports = new ModuleImports();
		for (let i = 0; i < json.imports.length; i++) {
			const imp = json.imports[i];
			if (
				typeof imp !== 'object' ||
				imp === null ||
				typeof imp.from !== 'string' ||
				typeof imp.to !== 'string'
			) {
				throw new Error(
					`DNode.imports[${i}] must be an object with 'from' and 'to' string properties.`
				);
			}
			let importedModel = importStorage.resolveModelImport(`${json.id} (node ${file})`, imp.from);
			if (imports.hasImport(imp.to)) {
				throw new Error(`DNode.imports has duplicate 'to' value: ${imp.to}`);
			}
			imports.addImport(imp.to, importedModel);
		}

		let code = '';
		if (typeof json.code !== 'string' && json.code !== undefined) {
			throw new Error('DNode.code must be a string if present.');
		}
		if (typeof json.code === 'string') {
			code = json.code;
		}

		if (typeof json.flowui !== 'object' || json.flowui === null) {
			throw new Error('DNode.flowui must be an object.');
		}

		const flowui = FlowUI.fromJSON(json.flowui, importStorage, imports, file);

		return new DNode(json.shortname, json.id, json.description, imports, code, flowui);
	}

	toJSON() {
		return {
			shortname: this.shortname,
			id: this.id,
			description: this.description,
			imports: this.imports,
			code: this.code,
			flowui: this.flowui
		};
	}

	gen(): nodeidl.Node {
		return {
			id: this.id,
			shortname: this.shortname,
			description: this.description,
			code: this.code
			//flowui: this.flowui.gen()
		};
	}
}
