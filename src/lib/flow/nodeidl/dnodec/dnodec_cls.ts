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

export type DFieldType = {
    type: "scalar",
    name: string,
    optional: boolean
} | {
    type: "array",
    elementType: DFieldType,
    optional: boolean
}

/**
 * A field in a DModel/DNode
 */
export class DField {
    private type: DFieldType;
    private shortname: string;
    private id: string;
    private description: string;

    constructor(type: DFieldType, shortname: string, id: string, description: string) {
        this.type = DField.validateDFieldType(type);
        this.shortname = shortname;
        this.id = id;
        this.description = description;
        this.validate();
    }

    // Validate a DFieldType object
    private static validateDFieldType = (obj: any): DFieldType => {
        if (typeof obj !== "object" || obj === null) {
            throw new Error("DFieldType must be an object.");
        }
        if (obj.type === "scalar") {
            if (typeof obj.name !== "string" || obj.name.length === 0) {
                throw new Error(`DFieldType of type 'scalar' must have a non-empty string 'name' property. [when processing ${JSON.stringify(obj)}]`);
            }
            if (obj.optional && typeof obj.optional !== "boolean") {
                throw new Error(`DFieldType of type 'scalar' must have a boolean 'optional' property if present. [when processing ${JSON.stringify(obj)}]`);
            }
            return {
                type: "scalar",
                name: obj.name,
                optional: obj.optional
            };
        } else if (obj.type === "array") {
            if (typeof obj.elementType !== "object" || obj.elementType === null) {
                throw new Error(`DFieldType of type 'array' must have an 'elementType' property that is an object. [when processing ${JSON.stringify(obj)}]`);
            }
            if (obj.optional && typeof obj.optional !== "boolean") {
                throw new Error(`DFieldType of type 'array' must have a boolean 'optional' property if present. [when processing ${JSON.stringify(obj)}]`);
            }
            return {
                type: "array",
                elementType: this.validateDFieldType(obj.elementType),
                optional: obj.optional
            };
        } else {
            throw new Error("DFieldType must have a 'type' property that is either 'scalar' or 'array'.");
        }
    }

    private validate() {
        if (typeof this.type !== "object" || this.type === null) {
            throw new Error("DField.type must be a non-empty object.");
        }
        if (typeof this.shortname !== "string" || this.shortname.length === 0) {
            throw new Error("DField.shortname must be a non-empty string.");
        }
        if (typeof this.id !== "string" || this.id.length === 0) {
            throw new Error("DField.id must be a non-empty string.");
        }
        if (typeof this.description !== "string" || this.description.length === 0) {
            throw new Error("DField.description must be a non-empty string.");
        }
    }

    static fromJSON(id: string, json: any): DField {
        if (typeof json !== "object" || json === null) {
            throw new Error("DField JSON must be an object.");
        }
        
        return new DField(json.type, json.shortname, id, json.description);
    }
}

/**
 * A DModel represents a discord model.
 */
export class DModel {
    private shortname: string;
    private id: string
    private description: string;
    private imports: Map<string, DModel>;
    private fields: DField[];
    private codeSnippets: Map<string, string>;

    private __codegenned: string;

    constructor(shortname: string, id: string, description: string, imports: Map<string, DModel>, fields: DField[], codeSnippets: Map<string, string>) {
        this.shortname = shortname;
        this.id = id;
        this.description = description;
        this.imports = imports;
        this.fields = fields;
        this.codeSnippets = codeSnippets;
        this.validate();
        this.__codegenned = this.codegen();
    }

    // Helper method to validate the DModel
    //
    // Part of: Import/Parse Pass
    private validate() {
        for (let key of this.imports.keys()) {
            const props = this.imports.get(key);
            if (!(props instanceof DModel)) {
                throw new Error(`Internal Error: ${key} must be a DModel.`);
            }
        }
        if (!Array.isArray(this.fields)) {
            throw new Error("Internal Error: DModel.fields must be an array.");
        }
        for (let i = 0; i < this.fields.length; i++) {
            if (!(this.fields[i] instanceof DField)) {
                throw new Error(`Internal Error: DModel.fields[${i}] must be a DField.`);
            }
        }
        if (typeof this.shortname !== "string" || this.shortname.length === 0) {
            throw new Error("DModel.shortname must be a non-empty string.");
        }
        if (typeof this.id !== "string" || this.id.length === 0) {
            throw new Error("DModel.id must be a non-empty string.");
        }
        if (typeof this.description !== "string") {
            throw new Error("DModel.description must be a string.");
        }
        for(let key of this.codeSnippets.keys()) {
            if (!(typeof key === "string" && key.length > 0)) {
                throw new Error("Internal Error: DModel.codeSnippets keys must be non-empty strings.");
            }
            if (typeof this.codeSnippets.get(key) !== "string") {
                throw new Error(`Internal Error: DModel.codeSnippets[${key}] must be a string.`);
            }

            // Make sure key is alphanumeric or underscore
            // and does not start with a number
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
                throw new Error(`DModel.codeSnippets keys must be alphanumeric or underscore and cannot start with a number. Invalid key: ${key}`);
            }
        }
    }

    // Create a DModel from a JSON object
    //
    // Part of: Import/Parse Pass
    static fromJSON(json: any, importStorage: ImportStorage, filename: string): DModel {
        if (typeof json !== "object" || json === null) {
            throw new Error("DModel JSON must be an object.");
        }
        if (typeof json.imports !== "object" || json.imports === null || !Array.isArray(json.imports)) {
            throw new Error("DModel.imports must be an array.");
        }
        if (typeof json.id !== "string" || json.id.length === 0) {
            throw new Error("DModel.id must be a non-empty string.");
        }

        // Ensure ID is alphanumeric or underscore
        // and does not start with a number
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(json.id)) {
            throw new Error(`DModel.id must be alphanumeric or underscore and cannot start with a number. Invalid id: ${json.id}`);
        }

        const imports = new Map<string, DModel>();
        for (let i = 0; i < json.imports.length; i++) {
            const imp = json.imports[i];
            if (typeof imp !== "object" || imp === null || typeof imp.from !== "string" || typeof imp.to !== "string") {
                throw new Error(`DModel.imports[${i}] must be an object with 'from' and 'to' string properties.`);
            }
            let importedModel = importStorage.resolveModelImport(`${json.id} (model ${filename})`, imp.from);
            if (imports.has(imp.to)) {
                throw new Error(`DModel.imports has duplicate 'to' value: ${imp.to}`);
            }
            imports.set(imp.to, importedModel);
        }
        if (typeof json.fields !== "object" || json.fields === null) {
            throw new Error("DModel.fields must be an object.");
        }
        const fields: DField[] = [];
        for (const key in json.fields) {
            const fieldJson = json.fields[key];
            const field = DField.fromJSON(key, fieldJson);
            fields.push(field);
        }

        const codeSnippets = new Map<string, string>();
        if (json.codeSnippets !== undefined) {
            if (typeof json.codeSnippets !== "object" || json.codeSnippets === null) {
                throw new Error("DModel.codeSnippets must be an object if present.");
            }

            for (const key in json.codeSnippets) {
                const snippet = json.codeSnippets[key];
                if (typeof snippet !== "string") {
                    throw new Error(`DModel.codeSnippets[${key}] must be a string.`);
                }
                if (codeSnippets.has(key)) {
                    throw new Error(`DModel.codeSnippets has duplicate key: ${key}`);
                }
                codeSnippets.set(key, snippet);
            }
        }

        return new DModel(json.shortname, json.id, json.description, imports, fields, codeSnippets);
    }

    // Generates Luau code for the model
    //
    // Part of: Code Gen Pass (but executed in Import/Parse Pass)
    codegen(): string {
        // Debugging
        let code = `-- Model: ${this.shortname} (${this.id})\n`;
        code += `-- Description: ${this.description}\n\n`;
        code += `local ${this.id} = table.freeze({\n`

        // Generate functions for each code snippet
        for (let [name, snippet] of this.codeSnippets.entries()) {
            code += `\t${name} = function()\n`;
            code += "\t" + snippet.split('\n').map(line => `    ${line}`).join('\n') + '\n';
            code += `\tend,\n`;
        }

        code += "})\n\n";
        code += `-- End of model ${this.shortname}\n\n`;

        console.log(`Generated code for model ${this.id}:\n${code}`);
        return code;
    }
}

/**
 * A DNode represents a discord node
 */
export class DNode {
    private shortname: string;
    private id: string
    private description: string;
    private imports: Map<string, DModel>;

    constructor(shortname: string, id: string, description: string, imports: Map<string, DModel>) {
        this.shortname = shortname;
        this.id = id;
        this.description = description;
        this.imports = imports;
        this.validate();
    }

    private validate() {
        for (let key of this.imports.keys()) {
            const props = this.imports.get(key);
            if (!(props instanceof DModel)) {
                throw new Error(`Internal Error: ${key} must be a DModel.`);
            }
        }
        if (typeof this.shortname !== "string" || this.shortname.length === 0) {
            throw new Error("DNode.shortname must be a non-empty string.");
        }
        if (typeof this.id !== "string" || this.id.length === 0) {
            throw new Error("DNode.id must be a non-empty string.");
        }
        if (typeof this.description !== "string") {
            throw new Error("DNode.description must be a string.");
        }
    }

    static fromJSON(json: any, importStorage: ImportStorage, file: string): DNode {
        if (typeof json !== "object" || json === null) {
            throw new Error("DNode JSON must be an object.");
        }
        if (typeof json.imports !== "object" || json.imports === null || !Array.isArray(json.imports)) {
            throw new Error("DNode.imports must be an array.");
        }
        if (typeof json.id !== "string" || json.id.length === 0) {
            throw new Error("DNode.id must be a non-empty string.");
        }
        const imports = new Map<string, DModel>();
        for (let i = 0; i < json.imports.length; i++) {
            const imp = json.imports[i];
            if (typeof imp !== "object" || imp === null || typeof imp.from !== "string" || typeof imp.to !== "string") {
                throw new Error(`DNode.imports[${i}] must be an object with 'from' and 'to' string properties.`);
            }
            let importedModel = importStorage.resolveModelImport(`${json.id} (node ${file})`, imp.from);
            if (imports.has(imp.to)) {
                throw new Error(`DNode.imports has duplicate 'to' value: ${imp.to}`);
            }
            imports.set(imp.to, importedModel);
        }

        return new DNode(json.shortname, json.id, json.description, imports);
    }
}

/**
 * Given a DNode file name, extract the DNode type.
 * @param fileName The file name
 * @returns The extracted DNode type from the file name
 */
export const extractTypeFromFileName = (fileName: string): string => {
    if (!fileName.endsWith(".json5")) {
        throw new Error("Input file must be a .json5 file.");
    }
    const parts = fileName.split('.');
    return parts[parts.length - 2];
}
