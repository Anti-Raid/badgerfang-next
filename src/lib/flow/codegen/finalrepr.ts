const MAX_ELEMENTS_TILL_INDENT = 5; // Max elements in a table before we indent it

/**
 * The different types that a value in Luau can be user-initialized to.
 */
export enum LiteralEnum {
    String = "String",
    Number = "Number",
    Table = "Table",
    Boolean = "Boolean",
    Raw = "Raw",
}

export interface LiteralString {
    type: LiteralEnum.String;
    value: string;
}

export interface LiteralNumber {
    type: LiteralEnum.Number;
    value: number;
}

export interface LiteralTable {
    type: LiteralEnum.Table;
    value: Record<string | number, LiteralValue> | LiteralValue[]; // Can be an object or an array
}

export interface LiteralBoolean {
    type: LiteralEnum.Boolean;
    value: boolean;
}

export interface LiteralRaw {
    type: LiteralEnum.Raw;
    value: string; // Raw code or expression
}   

export type LiteralValue = LiteralString | LiteralNumber | LiteralTable | LiteralBoolean | LiteralRaw;

/**
 * A final representation type for code generation.
 */
export enum ReprEnum {
    LocalVariableDeclaration = "LocalVariableDeclaration",
    GlobalDeclaration = "GlobalDeclaration",
    Comment = "Comment",
    Raw = "Raw",
    Literal = "Literal",
    IfCondition = "IfCondition",
    LocalFunctionDeclaration = "LocalFunctionDeclaration",
    FunctionDeclaration = "FunctionDeclaration",
    FunctionCall = "FunctionCall",
    ForLoop = "ForLoop",
    WhileLoop = "WhileLoop",
}

/**
 * Expressions that can be used in the AST.
 */
export const expressions = [
    ReprEnum.Raw,
    ReprEnum.Literal,
    ReprEnum.FunctionDeclaration,
    ReprEnum.FunctionCall,
]

/**
 * Statements that can be used in the final representation.
 * 
 * Note: comments are not considered statements or expressions but are special
 */
export const statements = [
    ReprEnum.LocalVariableDeclaration,
    ReprEnum.GlobalDeclaration,
    ReprEnum.Raw,
    ReprEnum.LocalFunctionDeclaration,
    ReprEnum.FunctionDeclaration,
    ReprEnum.IfCondition,
    ReprEnum.ForLoop,
];

export interface LocalVariableDeclaration {
    type: ReprEnum.LocalVariableDeclaration;
    lvalue: string; // Must not contain a dot (.)
    rvalue: IRepr;
}

export interface GlobalDeclaration {
    type: ReprEnum.GlobalDeclaration;
    lvalue: string;
    rvalue: IRepr;
}

export interface Comment {
    type: ReprEnum.Comment;
    comment: string; // The comment text
}

export interface Raw {
    type: ReprEnum.Raw;
    code: string; // Custom code to execute
}

export interface Literal {
    type: ReprEnum.Literal;
    value: LiteralValue; // The value of the literal
}

export interface IfCondition {
    type: ReprEnum.IfCondition;
    data: {
        condition: string;
        body: Literal[];
        elseifs?: LiteralElseIf[];
        else?: Literal[];
    };
}

export interface LiteralElseIf {
    condition: string;
    body: Literal[];
}

export interface LocalFunctionDeclaration {
    type: ReprEnum.LocalFunctionDeclaration;
    name: string; // The name of the function
    params: FunctionParameter[]; // The parameters of the function
    body: IRepr[]; // The body of the function
    returnType: FunctionReturn; // Optional return type of the function
}

export interface FunctionDeclaration {
    type: ReprEnum.FunctionDeclaration;
    name: string; // The name of the function
    params: FunctionParameter[]; // The parameters of the function
    body: IRepr[]; // The body of the function
    returnType: FunctionReturn; // Optional return type of the function
}

export interface FunctionParameter {
    name: string; // The name of the parameter
    type?: string; // Optional type of the parameter
}

export interface FunctionReturn {
    type?: string; // The type of the return value
}

export interface ForLoop {
    type: ReprEnum.ForLoop;
    data: {
        condition: LiteralForLoopType;
        body: IRepr[];
    };
}

export enum LiteralForLoopEnum {
    GeneralizedIteration = "GeneralizedIteration",
    Range = "Range",
    Raw = "Raw",
}

/**
 * Luau generalized for loop (for varbinds in iterable do ... end)
 */
export interface LiteralForLoopGeneralizedIteration {
    type: LiteralForLoopEnum.GeneralizedIteration;
    varbinds: string[]
    iterable: LiteralValue;
}

/**
 * Luau numeric for loop (for i = start, end [, step] do ... end)
 */
export interface LiteralForLoopRange {
    type: LiteralForLoopEnum.Range;
    varbind: string;
    start: number;
    end: number;
    step?: number; // Optional step value
}

export interface LiteralForLoopRaw {
    type: LiteralForLoopEnum.Raw;
    condition: string; // Raw condition for the loop
}

export type LiteralForLoopType = LiteralForLoopGeneralizedIteration | LiteralForLoopRange | LiteralForLoopRaw;

export interface FunctionCall {
    type: ReprEnum.FunctionCall;
    name: string; // The name of the function to call (may have dots in it if its in a table/class/userdata)
    args: LiteralValue[]; // The arguments to pass to the function
}

export interface WhileLoop {
    type: ReprEnum.WhileLoop; 
    condition: string; // The condition for the while loop
    body: IRepr[]; // The body of the while loop
}

export type IRepr = LocalVariableDeclaration | GlobalDeclaration | Comment | Raw | Literal | IfCondition | LocalFunctionDeclaration | FunctionDeclaration | ForLoop | FunctionCall | WhileLoop;

/**
 * Writer class to help handle code generation.
 */
class Writer {
    private code: string[] = [];

    constructor(code: string[] = []) {
        this.code = code;
    }

    /**
     * The code thats been pushed
     * @returns The current code as an array of strings.
     */
    getCode(): string[] {
        return this.code;
    }

    /**
     * Returns the current code as a single string.
     */
    getCodeString(): string {
        return this.code.join("");
    }

    /**
     * Clear the current code.
     */
    clear(): void {
        this.code = [];
    }

    /**
     * Write a piece of code to the current code.
     * @param code The code to write.
     */
    write(code: string): void {
        this.code.push(code);
    }
}

/**
 * Final repr class
 */
export class FinalRepr {
    public repr: IRepr[];
    public errors: string[];

    constructor(repr: IRepr[]) {
        this.repr = repr;
        this.errors = [];
    }

    /**
     * Takes the repr and makes a string representation of it.
     */
    toString(): string {
        let writer = new Writer();
        this.visitReprs(writer, this.repr);
        return writer.getCodeString();
    }

    /**
     * Push an error to the errors array.
     */
    private pushError(error: string): void {
        this.errors.push(error);
    }

    /**
     * Asserts that a IRepr is a expression.
     */
    private assertExpression(inode: IRepr): boolean {
        if (!expressions.includes(inode.type)) {
            this.pushError(`Expected an expression, got ${inode.type}`);
            return false;
        }
        return true;
    }

    /**
     * Asserts that a IRepr is a statement.
     */
    private assertStatement(inode: IRepr): boolean {
        if (!statements.includes(inode.type)) {
            this.pushError(`Expected a statement, got ${inode.type}`);
            return false;
        }
        return true;
    }

    /** 
     * Visits the IRepr and performs the validity check on said INode
    */
    private visitRepr(writer: Writer, inode: IRepr) {
        switch (inode.type) {
            case ReprEnum.LocalVariableDeclaration:
                return this.visitLocalVariableDeclaration(writer, inode);
            case ReprEnum.GlobalDeclaration:
                return this.visitGlobalDeclaration(writer, inode);
            case ReprEnum.Comment:
                return this.visitComment(writer, inode);
            case ReprEnum.Raw:
                return this.visitRaw(writer, inode);
            case ReprEnum.Literal:
                return this.visitLiteral(writer, inode);
            case ReprEnum.IfCondition:
                return this.visitIfCondition(writer, inode);
            case ReprEnum.LocalFunctionDeclaration:
                return this.visitLocalFunctionDeclaration(writer, inode);
            case ReprEnum.FunctionDeclaration:
                return this.visitFunctionDeclaration(writer, inode);
            case ReprEnum.ForLoop:
                return this.visitForLoop(writer, inode);
            case ReprEnum.FunctionCall:
                return this.visitFunctionCall(writer, inode);
            case ReprEnum.WhileLoop:
                return this.visitWhileLoop(writer, inode);
        }
    }

    /**
     * Helper to first assert that the IRepr is a expression and then visit it.
     */
    private visitExpression(writer: Writer, inode: IRepr) {
        this.assertExpression(inode);
        return this.visitRepr(writer, inode);
    }

    /**
     * Helper to first assert that the IRepr is a statement and then visit it.
     */
    private visitStatement(writer: Writer, inode: IRepr) {
        this.assertStatement(inode);
        return this.visitRepr(writer, inode);
    }

    /**
     * Visits a LocalVariableDeclaration and returns the string representation.
     * It also checks that the lvalue does not contain a dot (.)
     */
    private visitStatementOrComment(writer: Writer, inode: IRepr) {
        if (inode.type === ReprEnum.Comment) {
            return this.visitComment(writer, inode);
        }
        this.assertStatement(inode);
        return this.visitRepr(writer, inode);
    }

    /**
     * Visits a LocalVariableDeclaration and returns the string representation.
     * It also checks that the lvalue does not contain a dot (.)
     */
    private visitStatementOrCommentNodes(writer: Writer, inodes: IRepr[]) {
        for (const inode of inodes) {
            this.visitStatementOrComment(writer, inode);
        }
        return;
    }

    /**
     * Visits a LocalVariableDeclaration and returns the string representation.
     */
    private visitLocalVariableDeclaration(writer: Writer, inode: LocalVariableDeclaration) {
        this.assertExpression(inode.rvalue);
        if (inode.lvalue.includes('.')) {
            this.pushError(`Local variable name "${inode.lvalue}" cannot contain a dot (.)`)
        }

        let rvalue = new Writer();
        this.visitExpression(rvalue, inode.rvalue);

        return writer.write(`local ${inode.lvalue} = ${rvalue.getCodeString()};\n`);
    }

    /**
     * Visits a GlobalDeclaration and returns the string representation.
     */
    private visitGlobalDeclaration(writer: Writer, inode: GlobalDeclaration) {
        this.assertExpression(inode.rvalue);

        let rvalue = new Writer();
        this.visitExpression(rvalue, inode.rvalue);

        writer.write(`${inode.lvalue} = ${rvalue.getCodeString()};\n`);
    }

    /**
     * Visits a Comment and returns the string representation.
     */
    private visitComment(writer: Writer, inode: Comment) {
        if (inode.comment.includes("\n")) {
            writer.write(`--[[ ${inode.comment} ]]\n`);
        }
        writer.write(`-- ${inode.comment.replaceAll("--", "\-\-")}\n`);
    }

    /**
     * Visits a Raw and returns the string representation.
     */
    private visitRaw(writer: Writer, inode: Raw) {
        writer.write(inode.code);
    }

    /**
     * Visits a Literal and returns the string representation.
     */
    private visitLiteral(writer: Writer, inode: Literal) {
        return this.visitLiteralValue(writer, inode.value);
    }

    /**
     * Visit a LiteralValue and return the string representation.
     */
    private visitLiteralValue(writer: Writer, value: LiteralValue, onlyNewline: boolean = false) {
        switch (value.type) {
            case LiteralEnum.String:
                if (value.value.includes("\n")) {
                    // If the string contains a newline, use a multiline string
                    writer.write(`[[${value.value.replaceAll("]]", "]]]]")}]`);
                    return;
                }
                return writer.write(`"${value.value.replaceAll('"', '\\"')}"`);
            case LiteralEnum.Number:
                return writer.write(value.value.toString());
            case LiteralEnum.Table:
                if (Array.isArray(value.value)) {
                    return this.visitLiteralValueTable(writer, value.value, onlyNewline);
                }

                return this.visitLiteralValueTableMap(writer, value.value, onlyNewline);
            case LiteralEnum.Boolean:
                return writer.write(value.value ? "true" : "false"); // Convert boolean to string
            case LiteralEnum.Raw:
                return writer.write(value.value); // Raw code or expression, return as is
            default:
                this.pushError(`Unknown LiteralValue type: ${JSON.stringify(value)}`);
                return;
        }
    }

    /**
     * Write an table of literal values to the writer.
     */
    private visitLiteralValueTable(writer: Writer, values: LiteralValue[], onlyNewline: boolean) {
        let lvw = new Writer();
        for(const val of values) {
            this.visitLiteralValue(lvw, val)
        };

        let tabStart = "{"
        if (onlyNewline || lvw.getCode().length > MAX_ELEMENTS_TILL_INDENT) {
            for (let i = 0; i < writer.getCode().length; i++) {
                if (i === 0) {
                    tabStart += `\n\t${lvw.getCode()[i]}`;
                } else {
                    tabStart += `,\n\t${lvw.getCode()[i]}`;
                }
            }

            tabStart += "\n}";
        } else {
            tabStart += ` ${lvw.getCode().join(", ")} }`;
        }

        return writer.write(tabStart);
    }

    /**
     * Writes a key-value'd literal value to the writer.
     * @param writer The writer to write to.
     * @param value The value to write.
     */
    private visitLiteralValueTableMap(writer: Writer, value: Record<string | number, LiteralValue>, onlyNewline: boolean) {
        let tabStart = "{";
        if (onlyNewline || Object.keys(value).length > MAX_ELEMENTS_TILL_INDENT) {
            let entries = Object.entries(value)
            for (let i = 0; i < entries.length; i++) {
                const [key, val] = entries[i];
                let lvw = new Writer();
                this.visitLiteralValue(lvw, val);
                if (typeof key === "number") {
                    if (i == 0) {
                        tabStart += `\n\t[${key}] = ${lvw.getCodeString()}`;
                    } else {
                        tabStart += `,\n\t[${key}] = ${lvw.getCodeString()}`;
                    }
                } else {
                    if (i == 0) {
                        tabStart += `\n\t${key} = ${lvw.getCodeString()}`;
                    } else {
                        tabStart += `,\n\t${key} = ${lvw.getCodeString()}`;
                    }
                }
            }
            tabStart += "\n}";
        } else {
            let entries = Object.entries(value)
            for (let i = 0; i < entries.length; i++) {
                const [key, val] = entries[i];
                let lvw = new Writer();
                this.visitLiteralValue(lvw, val);
                if (typeof key === "number") {
                    if (i == 0) {
                        tabStart += ` [${key}] = ${lvw.getCodeString()}`;
                    } else {
                        tabStart += `, [${key}] = ${lvw.getCodeString()}`;
                    }
                } else {
                    if (i == 0) {
                        tabStart += ` ${key} = ${lvw.getCodeString()}`;
                    } else {
                        tabStart += `, ${key} = ${lvw.getCodeString()}`;
                    }
                }
            }
            tabStart += "}";
        }

        return writer.write(tabStart);
    }

    /**
     * Visit IfCondition and return the string representation.
     */
    private visitIfCondition(writer: Writer, inode: IfCondition) {
        writer.write(`if ${inode.data.condition} then\n`);
        let lvw = new Writer();
        
        // First handle body statements
        this.visitStatementOrCommentNodes(lvw, inode.data.body);

        for (const b of lvw.getCode()) {
            writer.write(`\t${b}`);
        }

        if (inode.data.elseifs) {
            lvw.clear(); // Clear the writer for elseif statements
            for (const elseif of inode.data.elseifs) {
                writer.write(`elseif ${elseif.condition} then\n`);

                this.visitStatementOrCommentNodes(lvw, elseif.body);
                
                for (const b of lvw.getCode()) {
                    writer.write(`\t${b}`);
                }

                lvw.clear(); // Clear the writer for the next elseif
            }
        }

        if (inode.data.else) {
            writer.write("else\n");
            lvw.clear(); // Clear the writer for else statements
            this.visitStatementOrCommentNodes(lvw, inode.data.else);
            for (const b of lvw.getCode()) {
                writer.write(`\t${b}`);
            }
        }

        writer.write("end\n");
        return;
    }

    /**
     * Visits a LocalFunctionDeclaration and returns the string representation.
     */
    private visitLocalFunctionDeclaration(writer: Writer, inode: LocalFunctionDeclaration) {
        if (inode.name.includes('.')) {
            this.pushError(`Local function name "${inode.name}" cannot contain a dot (.)`);
        }
        if (inode.params.some(param => param.name.includes('.'))) {
            this.pushError(`Function parameter names cannot contain a dot (.)`);
        }
        const params = inode.params.map(param => param.name + (param.type ? `: ${param.type}` : "")).join(", ");
        writer.write(`local function ${inode.name}(${params})${inode.returnType.type ? ": " + inode.returnType.type : ""}\n`);
        
        let lvw = new Writer();
        this.visitStatementOrCommentNodes(lvw, inode.body);

        for (const b of lvw.getCode()) {
            writer.write(`\t${b}`);
        }
        writer.write("\nend\n");
        return;
    }

    /**
     * Visits a FunctionDeclaration and returns the string representation.
     */
    private visitFunctionDeclaration(writer: Writer, inode: FunctionDeclaration) {
        if (inode.params.some(param => param.name.includes('.'))) {
            this.pushError(`Function parameter names cannot contain a dot (.)`);
        }
        if (inode.params.some(param => param.name.includes('.'))) {
            this.pushError(`Function parameter names cannot contain a dot (.)`);
        }
        const params = inode.params.map(param => param.name + (param.type ? `: ${param.type}` : "")).join(", ");
        writer.write(`function ${inode.name}(${params})${inode.returnType.type ? ": " + inode.returnType.type : ""}\n`);
        
        let lvw = new Writer();
        this.visitStatementOrCommentNodes(lvw, inode.body);

        for (const b of lvw.getCode()) {
            writer.write(`\t${b}`);
        }
        writer.write("\nend\n");
        return;
    }

    /**
     * Visits a ForLoop and returns the string representation.
     */
    private visitForLoop(writer: Writer, inode: ForLoop) {
        this.visitLiteralForLoopType(writer, inode.data.condition);
        let lvw = new Writer();
        this.visitStatementOrCommentNodes(lvw, inode.data.body);

        for (const b of lvw.getCode()) {
            writer.write(`\t${b}`);
        }

        writer.write("end\n");
        return;
    }

    /**
     * Visits a LiteralForLoopType and returns the string representation.
     */

    /**
     * Visits a LiteralForLoopType and returns the string representation.
     */
    private visitLiteralForLoopType(writer: Writer, condition: LiteralForLoopType): void {
        switch (condition.type) {
            case LiteralForLoopEnum.GeneralizedIteration:
                let lvw = new Writer();
                this.visitLiteralValue(lvw, condition.iterable);
                if (lvw.getCode().length === 0) {
                    this.pushError("Iterable in generalized for loop cannot be empty");
                }
                return writer.write(`for ${condition.varbinds.join(", ")} in ${lvw.getCodeString()} do\n`);
            case LiteralForLoopEnum.Range:
                return writer.write(`for ${condition.varbind} = ${condition.start}, ${condition.end}${condition.step ? `, ${condition.step}` : ""} do\n`);
            case LiteralForLoopEnum.Raw:
                return writer.write(`for ${condition.condition} do\n`); // Raw condition for the loop
        }
    }

    /**
     * Visits a FunctionCall and returns the string representation.
     */
    private visitFunctionCall(writer: Writer, inode: FunctionCall) {
        let args = inode.args.map(arg => {
            let argWriter = new Writer();
            this.visitLiteralValue(argWriter, arg, true);
            return argWriter.getCodeString();
        }).join(",\n\t");
        
        // Ensure name is valid (contains only letters, numbers, underscores, dots and one colon at the end if a method call)
        if (!(/^[a-zA-Z0-9_.]+(:[a-zA-Z0-9_]*)?$/.test(inode.name) || inode.name.endsWith(":") || inode.name.endsWith("."))) {
            this.pushError(`Function name "${inode.name}" is not valid. It can only contain letters, numbers, underscores, dots and one colon at the final indexing if a method call. If this is incorrect, please report this as a bug.`);
        }
        
        writer.write(`${inode.name}(${args})\n`);
    }

    /**
     * Visits a WhileLoop and returns the string representation.
     */
    private visitWhileLoop(writer: Writer, inode: WhileLoop) {
        writer.write(`while ${inode.condition} do\n`);
        let lvw = new Writer();
        this.visitStatementOrCommentNodes(lvw, inode.body);

        for (const b of lvw.getCode()) {
            writer.write(`\t${b}`);
        }
        writer.write("end\n");
        
        return;
    }

    /**
     * Helper to loop over a list of INodes and perform the validity check on each.
     */
    private visitReprs(writer: Writer, inodes: IRepr[]) {
        for (const inode of inodes) {
            this.visitRepr(writer, inode);
        }
    }
}