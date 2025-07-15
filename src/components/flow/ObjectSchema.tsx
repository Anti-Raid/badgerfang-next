// To be used in future 

export enum ObjectColType {
    String = "string",
    Number = "number",
    Boolean = "boolean",
    RawJson = "rawjson",
    ObjectSchema = "objectschema",
    TaggedUnion = "taggedUnion"
}

export interface ObjectColSchemaBase {
    type: ObjectColType.String | ObjectColType.Number | ObjectColType.Boolean | ObjectColType.RawJson;
    desc?: string;
    required?: boolean;
    array?: boolean;
    bare?: boolean; // Indicates if the field is bare (not in the table)
}


export interface ObjectColSchemaObjectSchema {
    type: ObjectColType.ObjectSchema;
    schema: ObjectSchema;
    desc?: string;
    required?: boolean;
    bare?: boolean; // Indicates if the field is bare (not in the table)
}

export interface ObjectColSchemaTaggedUnion {
    type: ObjectColType.TaggedUnion;
    tag_col: ObjectCol;
    schemas: ObjectColSchemaTaggedUnionSchema[];
    desc?: string;
    required?: boolean;
    bare?: boolean; // Indicates if the field is bare (not in the table)
}

export interface ObjectColSchemaTaggedUnionSchema {
    tag: unknown; // The tag value
    label: string; // The label for the tag
    schema: ObjectSchema; // The schema for the tagged union
}

export type ObjectCol =
    | ObjectColSchemaBase
    | ObjectColSchemaObjectSchema
    | ObjectColSchemaTaggedUnion;

export interface ObjectSchema {
    name: string;
    description: string;
    properties: Record<string, ObjectCol>;
}

export class SchemaBuilder {
    private schema: ObjectSchema;

    constructor(name: string, description: string) {
        this.schema = {
            name,
            description,
            properties: {}
        };
    }

    addProperty(name: string, col: ObjectCol): SchemaBuilder {
        this.schema.properties[name] = col;
        return this;
    }

    static stringCol(desc?: string, required = false, array = false, bare = false): ObjectCol {
        return {
            type: ObjectColType.String,
            desc,
            required,
            array,
            bare
        };
    }

    static numberCol(desc?: string, required = false, array = false, bare = false): ObjectCol {
        return {
            type: ObjectColType.Number,
            desc,
            required,
            array,
            bare
        };
    }

    static booleanCol(desc?: string, required = false, array = false, bare = false): ObjectCol {
        return {
            type: ObjectColType.Boolean,
            desc,
            required,
            array,
            bare
        };
    }

    static rawJsonCol(desc?: string, required = false, array = false, bare = false): ObjectCol {
        return {
            type: ObjectColType.RawJson,
            desc,
            required,
            array,
            bare
        };
    }

    static objectSchemaCol(schema: ObjectSchema, desc?: string, required = false, bare = false): ObjectCol {
        return {
            type: ObjectColType.ObjectSchema,
            schema,
            desc,
            required,
            bare
        };
    }

    static taggedUnionCol(tag_col: ObjectCol, schemas: ObjectColSchemaTaggedUnionSchema[], desc?: string, required = false, bare = false): ObjectCol {
        return {
            type: ObjectColType.TaggedUnion,
            tag_col,
            schemas,
            desc,
            required,
            bare
        };
    }

    addString(name: string, desc?: string, required = false, array = false, bare = false): SchemaBuilder {
        return this.addProperty(name, SchemaBuilder.stringCol(desc, required, array, bare));
    }

    addNumber(name: string, desc?: string, required = false, array = false, bare = false): SchemaBuilder {
        return this.addProperty(name, SchemaBuilder.numberCol(desc, required, array, bare));
    }

    addBoolean(name: string, desc?: string, required = false, array = false, bare = false): SchemaBuilder {
        return this.addProperty(name, SchemaBuilder.booleanCol(desc, required, array, bare));
    }

    addRawJson(name: string, desc?: string, required = false, array = false, bare = false): SchemaBuilder {
        return this.addProperty(name, SchemaBuilder.rawJsonCol(desc, required, array, bare));
    }

    addObjectSchema(name: string, schema: ObjectSchema, desc = undefined, required = false, bare = false): SchemaBuilder {
        return this.addProperty(name, SchemaBuilder.objectSchemaCol(schema, desc, required, bare));
    }

    addTaggedUnion(name: string, tag_col: ObjectCol, schemas: ObjectColSchemaTaggedUnionSchema[], desc = undefined, required = false, bare = false): SchemaBuilder {
        return this.addProperty(name, SchemaBuilder.taggedUnionCol(tag_col, schemas, desc, required, bare));
    }

    build(): ObjectSchema {
        return this.schema;
    }
}

export class SchemaTaggedUnionBuilder {
    private schemas: ObjectColSchemaTaggedUnionSchema[] = []

    constructor() {
        this.schemas = [];
    }

    addSchema(tag: unknown, label: string, schema: ObjectSchema): SchemaTaggedUnionBuilder {
        this.schemas.push({ tag, label, schema });
        return this;
    }

    build(): ObjectColSchemaTaggedUnionSchema[] {
        return this.schemas;
    }
}

export const discordApiSchemas = {
    create_interaction_response: new SchemaBuilder("Create Interaction Response", "Create a response to an interaction")
        .addString("interaction_id", "The ID of the interaction", true)
        .addString("interaction_token", "The token of the interaction", true)
        .addObjectSchema("data", new SchemaBuilder("Interaction Response Data", "The data for the interaction response")
            .addTaggedUnion(
                "type",
                SchemaBuilder.numberCol("The type of the interaction response", true, false, true),
                new SchemaTaggedUnionBuilder()
                .addSchema(1, "Pong", new SchemaBuilder("Pong Response", "A simple pong response").build())
                .addSchema(4, "Channel Message with Source", new SchemaBuilder("Channel Message with Source", "A message to send in a channel")
                    .addObjectSchema("data",
                        new SchemaBuilder("Message Data", "The data for the message")
                        .addString("content", "The content of the message", false, true)
                        .build())
                .build()
            )
            .build(), undefined, true)
        .build())
        .build()
};