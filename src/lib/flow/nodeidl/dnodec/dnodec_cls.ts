import * as nodeidl from '../nodeidl.ts';
import * as zod from 'zod'

export interface ImportResolver {
	resolve: (modpath: string) => any;
	readFile: (fp: string) => string;
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

	readFile(fp: string, from: string): string {
		console.log(`=> Read file ${fp} from ${from}`);
		return this.importResolver.readFile(fp)
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
		this.type = type;
		this.shortname = shortname;
		this.id = id;
		this.description = description;
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

	static fromJSON(imports: ModuleImports, id: string, obj: any): DField {
		const fieldTypeSchema = zod.discriminatedUnion('type', [
			zod.strictObject({
				type: zod.literal('scalar'),
				name: zod.string(),
				style: zod.string().optional(),
				optional: zod.boolean().default(false),
			}),
			zod.strictObject({
				type: zod.literal("array"),
				elementType: zod.lazy((): zod.ZodType<DFieldType> => fieldTypeSchema),
				optional: zod.boolean().default(false)
			})
		])

		const schema = zod.strictObject({
			shortname: zod.string().min(1),
			description: zod.string().min(1),
			type: fieldTypeSchema
		})

		let validatedJson = schema.parse(obj);

		return new DField(imports, validatedJson.type, validatedJson.shortname, id, validatedJson.description);
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

	constructor(
		shortname: string,
		id: string,
		description: string,
		imports: ModuleImports,
		fields: DField[],
	) {
		this.shortname = shortname;
		this.id = id;
		this.description = description;
		this.imports = imports;
		this.fields = fields;
	}

	// Create a DModel from a JSON object
	static fromJSON(obj: any, importStorage: ImportStorage, filename: string): DModel {
		const schema = zod.strictObject({
			id: zod.string().min(1),
			shortname: zod.string().min(1),
			description: zod.string().min(1),
			imports: zod.array(
				zod.strictObject({
					from: zod.string(),
					to: zod.string()
				})
			),
			fields: zod.record(zod.string(), zod.any())
		})
		let validatedJson;
		try {
			validatedJson = schema.parse(obj)
		} catch (err: any) {
			throw new Error(zod.prettifyError(err))
		}

		// Ensure ID is alphanumeric or underscore
		// and does not start with a number
		if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(validatedJson.id)) {
			throw new Error(
				`DModel.id must be alphanumeric or underscore and cannot start with a number. Invalid id: ${validatedJson.id}`
			);
		}

		const imports = new ModuleImports();
		for (let i = 0; i < validatedJson.imports.length; i++) {
			const imp = validatedJson.imports[i];
			let importedModel = importStorage.resolveModelImport(
				`${validatedJson.id} (model ${filename})`,
				imp.from
			);
			if (imports.hasImport(imp.to)) {
				throw new Error(`DModel.imports has duplicate 'to' value: ${imp.to}`);
			}
			imports.addImport(imp.to, importedModel);
		}
		const fields: DField[] = [];
		for (const key in validatedJson.fields) {
			const fieldJson = validatedJson.fields[key];
			const field = DField.fromJSON(imports, key, fieldJson);
			fields.push(field);
		}

		return new DModel(validatedJson.shortname, validatedJson.id, validatedJson.description, imports, fields);
	}

	toJSON() {
		return {
			shortname: this.shortname,
			id: this.id,
			description: this.description,
			imports: this.imports,
			fields: this.fields.map((field) => field.toJSON()),
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
		obj: any,
		importStorage: ImportStorage,
		imports: ModuleImports,
		filename: string
	): FlowUI {
		const schema = zod.strictObject({
			handles: zod.strictObject({
				allow: zod.array(zod.union([zod.literal("top"), zod.literal("bottom")]))
			}),
			input: zod.object().optional(),
			output: zod.object().optional(),
			inputs: zod.object().optional(),
			outputs: zod.object().optional()
		})
		let validatedJson = schema.parse(obj)

		let inputModel: FlowUI_IO;
		let outputModel: FlowUI_IO;

		if (validatedJson.inputs) {
			inputModel = { typ: 'model', model: DModel.fromJSON(validatedJson.inputs, importStorage, filename) };
		} else if (validatedJson.input !== null) {
			const fieldsMap = new Map<string, DField>();
			for (const key in validatedJson.input) {
				const fieldJson = validatedJson.input[key];
				const field = DField.fromJSON(imports, key, fieldJson);
				fieldsMap.set(key, field);
			}
			inputModel = { typ: 'fields', fields: fieldsMap };
		} else {
			throw new Error('Either flowui.inputs or flowui.input must be provided.');
		}

		if (validatedJson.outputs) {
			outputModel = { typ: 'model', model: DModel.fromJSON(validatedJson.outputs, importStorage, filename) };
		} else if (validatedJson.output !== null) {
			const fieldsMap = new Map<string, DField>();
			for (const key in validatedJson.output) {
				const fieldJson = validatedJson.output[key];
				const field = DField.fromJSON(imports, key, fieldJson);
				fieldsMap.set(key, field);
			}
			outputModel = { typ: 'fields', fields: fieldsMap };
		} else {
			throw new Error('Either flowui.outputs or flowui.output must be provided.');
		}

		return new FlowUI(validatedJson.handles, inputModel, outputModel);
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
	private code: Map<string, string>; // The codegen code for this node
	private flowui: FlowUI;

	constructor(
		shortname: string,
		id: string,
		description: string,
		imports: ModuleImports,
		code: Map<string, string>,
		flowui: FlowUI
	) {
		this.shortname = shortname;
		this.id = id;
		this.description = description;
		this.imports = imports;
		this.code = code;
		this.flowui = flowui;
	}

	static fromJSON(obj: any, importStorage: ImportStorage, file: string): DNode {
		const schema = zod.strictObject({
			id: zod.string(),
			shortname: zod.string(),
			description: zod.string(),
			imports: zod.array(
				zod.strictObject({
					from: zod.string(),
					to: zod.string()
				})
			),
			code: zod.array(zod.string()),
			flowui: zod.any(),
		});
		let validatedJson;
		try {
			validatedJson = schema.parse(obj)
		} catch (err: any) {
			throw new Error(zod.prettifyError(err))
		}

		const imports = new ModuleImports();
		for (let i = 0; i < validatedJson.imports.length; i++) {
			const imp = validatedJson.imports[i];
			let importedModel = importStorage.resolveModelImport(`${validatedJson.id} (node ${file})`, imp.from);
			if (imports.hasImport(imp.to)) {
				throw new Error(`DNode.imports has duplicate 'to' value: ${imp.to}`);
			}
			imports.addImport(imp.to, importedModel);
		}

		const flowui = FlowUI.fromJSON(validatedJson.flowui, importStorage, imports, file);

		let codeFiles = new Map()
		for (let file of validatedJson.code) {
			if (codeFiles.has(file)) throw new Error(`File ${file} has already been included!`)
			let codeData = importStorage.readFile(file, `${validatedJson.id} (node ${file})`)
			codeFiles.set(file, codeData)
		}


		return new DNode(validatedJson.shortname, validatedJson.id, validatedJson.description, imports, codeFiles, flowui);
	}

	toJSON() {
		return {
			shortname: this.shortname,
			id: this.id,
			description: this.description,
			imports: this.imports,
			code: Object.fromEntries(this.code),
			flowui: this.flowui
		};
	}

	gen(): nodeidl.Node {
		return {
			id: this.id,
			shortname: this.shortname,
			description: this.description,
			code: Object.fromEntries(this.code)
			//flowui: this.flowui.gen()
		};
	}
}
