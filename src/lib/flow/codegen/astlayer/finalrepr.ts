/**
 * The different types that a value in Luau can be user-initialized to.
 */
export enum LiteralEnum {
	Nil = 'Nil',
	String = 'String',
	Number = 'Number',
	Table = 'Table',
	TableArray = 'TableArray',
	Boolean = 'Boolean',
	Vector = 'Vector',
	Raw = 'Raw',
	Parens = 'Parens',
	Passthrough = 'Passthrough', // Used internally by block2ast to passthrough a value
	LogicExpr = 'LogicExp',
	RelationalExpr = 'RelationalExpr',
	Not = 'Not'
}

export interface LiteralNil {
	type: LiteralEnum.Nil;
}

export interface LiteralString {
	type: LiteralEnum.String;
	value: string;
	interpolated: boolean;
	multiline?: boolean;
}

export interface LiteralNumber {
	type: LiteralEnum.Number;
	value: number;
}

export interface LiteralTableEntry {
	key: LiteralValue;
	value: LiteralValue;
}

export interface LiteralTable {
	type: LiteralEnum.Table;
	value: LiteralTableEntry[]; // Can be an object or an array
	inline: boolean; // Whether to inline the table or not
}

export interface LiteralTableArray {
	type: LiteralEnum.TableArray;
	value: LiteralValue[]; // Array of literal values
	inline: boolean; // Whether to inline the table or not
}

export interface LiteralBoolean {
	type: LiteralEnum.Boolean;
	value: boolean;
}

export interface LiteralVector {
	type: LiteralEnum.Vector;
	x: number;
	y: number;
	z: number;
}

export interface LiteralRaw {
	type: LiteralEnum.Raw;
	value: string; // Raw code or expression
}

export interface LiteralParens {
	type: LiteralEnum.Parens;
	inner: LiteralValue;
}

export enum LiteralLogicType {
	And = 'And',
	Or = 'Or'
}

// Method 1: a and b or c => { type: And, lvalue: a, rvalue: { type: Or, lvalue: b, rvalue: c } }
// Method 2: a and b or c => { operand: a, operations: [ { type: And, value: b }, { type: Or, value: c } ] }
export interface LiteralLogicStmt {
	type: LiteralEnum.LogicExpr;
	condition: LiteralLogicType; // The logic condition
	operands: LiteralValue[]; // The operands involved in the logic expression
}

export enum LiteralRelationalOperatorType {
	Eq = 'Eq',
	Neq = 'Neq',
	Gt = 'Gt',
	Gte = 'Gte',
	Lt = 'Lt',
	Lte = 'Lte'
}

export interface LiteralRelationalExpr {
	type: LiteralEnum.RelationalExpr;
	operator: LiteralRelationalOperatorType; // The relational operator
	lvalue: LiteralValue; // The left-hand side value
	rvalue: LiteralValue; // The right-hand side value
}

export interface LiteralNot {
	type: LiteralEnum.Not;
	value: LiteralValue;
}

export interface LiteralPassthrough {
	type: LiteralEnum.Passthrough;
	value: LiteralValue;
}

export type LiteralValue =
	| LiteralNil
	| LiteralString
	| LiteralNumber
	| LiteralTable
	| LiteralTableArray
	| LiteralBoolean
	| LiteralVector
	| LiteralRaw
	| LiteralParens
	| LiteralLogicStmt
	| LiteralRelationalExpr
	| LiteralNot
	| LiteralPassthrough;

/**
 * A final representation type for code generation.
 */
export enum ReprEnum {
	LocalVariableDeclaration = 'LocalVariableDeclaration',
	GlobalDeclaration = 'GlobalDeclaration',
	Comment = 'Comment',
	Raw = 'Raw',
	Literal = 'Literal',
	IfCondition = 'IfCondition',
	LocalFunctionDeclaration = 'LocalFunctionDeclaration',
	FunctionDeclaration = 'FunctionDeclaration',
	FunctionCall = 'FunctionCall',
	ForLoop = 'ForLoop',
	WhileLoop = 'WhileLoop',
	Return = 'Return'
}

/**
 * Expressions that can be used in the AST.
 */
export const expressions = [
	ReprEnum.Raw,
	ReprEnum.Literal,
	ReprEnum.FunctionDeclaration,
	ReprEnum.FunctionCall
];

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
	ReprEnum.ForLoop
];

export interface LocalVariableDeclaration {
	type: ReprEnum.LocalVariableDeclaration;
	lvalue: string; // Must not contain a dot (.)
	rvalue: Node;
}

export interface GlobalDeclaration {
	type: ReprEnum.GlobalDeclaration;
	lvalue: string;
	rvalue: Node;
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
		condition: LiteralValue;
		body: Node[];
		elseifs?: ElseIf[];
		else?: Node[];
	};
}

export interface ElseIf {
	condition: LiteralValue;
	body: Node[];
}

export interface LocalFunctionDeclaration {
	type: ReprEnum.LocalFunctionDeclaration;
	name: string; // The name of the function
	params: FunctionParameter[]; // The parameters of the function
	body: Node[]; // The body of the function
	returnType: FunctionReturn; // Optional return type of the function
}

export interface FunctionDeclaration {
	type: ReprEnum.FunctionDeclaration;
	name: string; // The name of the function
	params: FunctionParameter[]; // The parameters of the function
	body: Node[]; // The body of the function
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
		condition: ForLoopType;
		body: Node[];
	};
}

export enum ForLoopEnum {
	GeneralizedIteration = 'GeneralizedIteration',
	Range = 'Range',
	Raw = 'Raw'
}

/**
 * Luau generalized for loop (for varbinds in iterable do ... end)
 */
export interface ForLoopGeneralizedIteration {
	type: ForLoopEnum.GeneralizedIteration;
	varbinds: string[];
	iterable: LiteralValue;
}

/**
 * Luau numeric for loop (for i = start, end [, step] do ... end)
 */
export interface ForLoopRange {
	type: ForLoopEnum.Range;
	varbind: string;
	start: number;
	end: number;
	step?: number; // Optional step value
}

export interface ForLoopRaw {
	type: ForLoopEnum.Raw;
	condition: string; // Raw condition for the loop
}

export type ForLoopType = ForLoopGeneralizedIteration | ForLoopRange | ForLoopRaw;

export interface FunctionCall {
	type: ReprEnum.FunctionCall;
	name: string; // The name of the function to call (may have dots in it if its in a table/class/userdata)
	args: LiteralValue[]; // The arguments to pass to the function
}

export interface WhileLoop {
	type: ReprEnum.WhileLoop;
	condition: LiteralValue; // The condition for the while loop
	body: Node[]; // The body of the while loop
}

export interface Return {
	type: ReprEnum.Return;
	value: LiteralValue;
}

export type Node =
	| LocalVariableDeclaration
	| GlobalDeclaration
	| Comment
	| Raw
	| Literal
	| IfCondition
	| LocalFunctionDeclaration
	| FunctionDeclaration
	| ForLoop
	| FunctionCall
	| WhileLoop
	| Return;

/**
 * Writer class to help handle code generation.
 */
export class Writer {
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
		return this.code.join('');
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
 * The current inline status
 */
type InlineStatus =
	| {
			type: 'NotInline';
			depth: number; // How deep we are
	  }
	| {
			type: 'Inline';
			depth: number; // How deep we are, needed in case a inline context goes to not inline and back
	  };

/**
 * Helper to create a new InlineStatus
 * @param inline Whether we are inline or not
 * @returns A new InlineStatus
 */
const newInlineStatus = (inline: boolean): InlineStatus => {
	if (inline) {
		return {
			type: 'Inline',
			depth: 1
		};
	} else {
		return {
			type: 'NotInline',
			depth: 1
		};
	}
};

/**
 * Helper method to either create a new inline status if the passed
 * inline status is null/undefined, otherwise return a new inline status with the depth of the inline status being one more than current depth
 */
const enterInlineStatus = (status: InlineStatus | undefined, inline: boolean): InlineStatus => {
	if (status) {
		return {
			type: inline ? 'Inline' : 'NotInline',
			depth: status.depth + 1
		};
	}

	return newInlineStatus(inline);
};

/**
 * Helper method to go one level deeper in the inline status
 * @param status The current inline status
 */
const incrInline = (status: InlineStatus): InlineStatus => {
	return {
		type: status.type,
		depth: status.depth + 1
	};
};

/**
 * Helper method to create the \n\t*N table key-value seperator for a given depth
 */
const tableSeperatorFor = (depth: number) => {
	return '\n' + '\t'.repeat(depth);
};

/**
 * Final repr class
 */
export class FinalRepr {
	public repr: Node[];
	public errors: string[];

	constructor(repr: Node[]) {
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
	 * Asserts that a Node is a expression.
	 */
	private assertExpression(inode: Node): boolean {
		if (!expressions.includes(inode.type)) {
			this.pushError(`Expected an expression, got ${inode.type}`);
			return false;
		}
		return true;
	}

	/**
	 * Asserts that a Node is a statement.
	 */
	private assertStatement(inode: Node): boolean {
		if (!statements.includes(inode.type)) {
			this.pushError(`Expected a statement, got ${inode.type}`);
			return false;
		}
		return true;
	}

	/**
	 * Visits the Node and performs the validity check on said INode
	 */
	private visitRepr(writer: Writer, inode: Node) {
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
			case ReprEnum.Return:
				return this.visitReturn(writer, inode);
		}
	}

	/**
	 * Helper to first assert that the Node is a expression and then visit it.
	 */
	private visitExpression(writer: Writer, inode: Node) {
		this.assertExpression(inode);
		return this.visitRepr(writer, inode);
	}

	/**
	 * Helper to first assert that the Node is a statement and then visit it.
	 */
	private visitStatement(writer: Writer, inode: Node) {
		this.assertStatement(inode);
		return this.visitRepr(writer, inode);
	}

	/**
	 * Visits a LocalVariableDeclaration and returns the string representation.
	 * It also checks that the lvalue does not contain a dot (.)
	 */
	private visitStatementOrComment(writer: Writer, inode: Node) {
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
	private visitStatementOrCommentNodes(writer: Writer, inodes: Node[]) {
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
			this.pushError(`Local variable name "${inode.lvalue}" cannot contain a dot (.)`);
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
		if (inode.comment.includes('\n')) {
			writer.write(`--[[ ${inode.comment} ]]\n`);
		} else {
			writer.write(`-- ${inode.comment.replaceAll('--', '\-\-')}\n`);
		}
	}

	/**
	 * Visits a Raw and returns the string representation.
	 */
	private visitRaw(writer: Writer, inode: Raw) {
		writer.write(inode.code);
	}

	/**
	 * Visits a Literal node and returns the string representation.
	 */
	private visitLiteral(writer: Writer, inode: Literal) {
		return FinalRepr.visitLiteralValue(writer, inode.value);
	}

	/**
	 * Visit a LiteralValue and return the string representation.
	 */
	static visitLiteralValue(writer: Writer, value: LiteralValue, inlineStatus?: InlineStatus) {
		const _isValidIdentifier = (key: string): boolean => {
			return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key);
		};

		type StackData =
			| {
					type: 'literal';
					value: LiteralValue;
					tableKey?: boolean;
			  }
			| {
					type: 'token';
					str: string;
			  };

		let stack: StackData[] = [{ type: 'literal', value }];

		while (true) {
			let value = stack.pop();
			if (!value) break;
			if (value.type == 'token') {
				writer.write(value.str);
				continue;
			}

			let lvalue = value.value;

			switch (lvalue.type) {
				case LiteralEnum.Nil:
					if (value.tableKey) {
						stack.push({ type: 'token', str: '[nil]' });
					} else {
						stack.push({ type: 'token', str: 'nil' });
					}
					continue;
				case LiteralEnum.String:
					if (value.tableKey) {
						if (lvalue.interpolated) {
							throw new Error('Table key cannot be an interpolated string');
						}

						if (lvalue.multiline) {
							throw new Error('Table key cannot be an multiline string');
						}

						if (_isValidIdentifier(lvalue.value)) {
							// It's a valid identifier, write it directly (e.g., foo)
							stack.push({ type: 'token', str: lvalue.value });
						} else {
							// Not a valid identifier, wrap it (e.g., ["foo bar"])
							stack.push({
								type: 'token',
								str: `["${lvalue.value.replaceAll('"', '\\"').replaceAll('\n', '\\n')}"]`
							});
						}
						continue;
					}

					if (lvalue.interpolated) {
						stack.push({ type: 'token', str: `\`${lvalue.value.replaceAll('`', '\\`')}\`` });
						continue;
					}

					if (lvalue.multiline) {
						// If the string contains a newline, use a multiline string
						stack.push({
							type: 'token',
							str: `[[${lvalue.value.replaceAll('[[', '\[\[').replaceAll("']]", '\]\]')}]]`
						});
						continue;
					}
					stack.push({
						type: 'token',
						str: `"${lvalue.value.replaceAll('"', '\\"').replaceAll('\n', '\\n')}"`
					});
					continue;
				case LiteralEnum.Number:
					const numStr = lvalue.value.toString();
					if (value.tableKey) {
						// Wrap it in brackets: [123]
						stack.push({ type: 'token', str: `[${numStr}]` });
					} else {
						// Just write the number normally
						stack.push({ type: 'token', str: numStr });
					}
					continue;
				case LiteralEnum.Table:
					stack.push({ type: 'token', str: '}' });
					for (let i = lvalue.value.length - 1; i >= 0; i--) {
						stack.push({ type: 'literal', value: lvalue.value[i].value });
						stack.push({ type: 'token', str: ' = ' });
						stack.push({ type: 'literal', value: lvalue.value[i].key, tableKey: true });

						if (i > 0) {
							stack.push({ type: 'token', str: ', ' });
						}
					}
					stack.push({ type: 'token', str: '{' });
					continue;
				case LiteralEnum.TableArray:
					if (lvalue.value.length === 0) {
						// This expands down to setmetatable({}, require'@antiraid/interop'.array_metatable)
						stack.push({
							type: 'token',
							str: "setmetatable({}, require'@antiraid/interop'.array_metatable)"
						});
						continue;
					}

					stack.push({ type: 'token', str: '}' });
					for (let i = lvalue.value.length - 1; i >= 0; i--) {
						stack.push({ type: 'literal', value: lvalue.value[i] });
						if (i > 0) {
							stack.push({ type: 'token', str: ', ' });
						}
					}
					stack.push({ type: 'token', str: '{' });
					continue;
				case LiteralEnum.Boolean:
					const boolStr = lvalue.value ? 'true' : 'false';
					if (value.tableKey) {
						// Wrap it in brackets: [true | false]
						stack.push({ type: 'token', str: `[${boolStr}]` });
					} else {
						// Just write the boolean normally
						stack.push({ type: 'token', str: boolStr });
					}
					continue;
				case LiteralEnum.Vector:
					stack.push({
						type: 'token',
						str: `vector.create(${lvalue.x}, ${lvalue.y}, ${lvalue.z})`
					});
					continue;
				case LiteralEnum.Raw:
					stack.push({ type: 'token', str: lvalue.value }); // Raw code or expression, return as is
					continue;
				case LiteralEnum.Parens:
					stack.push({ type: 'token', str: `)` });
					stack.push({ type: 'literal', value: lvalue.inner });
					stack.push({ type: 'token', str: `(` });
					continue;
				case LiteralEnum.RelationalExpr:
					let symMap = {
						[LiteralRelationalOperatorType.Eq]: '==',
						[LiteralRelationalOperatorType.Gt]: '>',
						[LiteralRelationalOperatorType.Gte]: '>=',
						[LiteralRelationalOperatorType.Lt]: '<',
						[LiteralRelationalOperatorType.Lte]: '<=',
						[LiteralRelationalOperatorType.Neq]: '~='
					};

					let logicOp = symMap[lvalue.operator];

					// LIFO stack
					stack.push({ type: 'literal', value: lvalue.rvalue });
					stack.push({ type: 'token', str: ` ${logicOp} ` });
					stack.push({ type: 'literal', value: lvalue.lvalue });
					continue;
				case LiteralEnum.LogicExpr:
					let logicMap = {
						[LiteralLogicType.And]: 'and',
						[LiteralLogicType.Or]: 'or'
					};

					let logicOperator = logicMap[lvalue.condition];

					// LIFO stack
					for (let i = lvalue.operands.length - 1; i >= 0; i--) {
						stack.push({ type: 'literal', value: lvalue.operands[i] });
						if (i > 0) {
							stack.push({ type: 'token', str: ` ${logicOperator} ` });
						}
					}
					continue;
				case LiteralEnum.Not:
					stack.push({ type: 'literal', value: lvalue.value });
					stack.push({ type: 'token', str: 'not ' });
					continue;
				case LiteralEnum.Passthrough:
					stack.push({ type: 'literal', value: lvalue.value });
					continue;
			}
		}
	}

	/**
	 * Visit IfCondition and return the string representation.
	 */
	private visitIfCondition(writer: Writer, inode: IfCondition) {
		let lvw = new Writer();
		FinalRepr.visitLiteralValue(lvw, inode.data.condition);
		writer.write(`if ${lvw.getCodeString()} then\n`);
		lvw.clear(); // Clear the writer for the body bit

		// First handle body statements
		this.visitStatementOrCommentNodes(lvw, inode.data.body);

		for (const b of lvw.getCode()) {
			writer.write(`\t${b}`);
		}

		if (inode.data.elseifs) {
			lvw.clear(); // Clear the writer for elseif statements
			for (const elseif of inode.data.elseifs) {
				let lvw = new Writer();
				FinalRepr.visitLiteralValue(lvw, elseif.condition);
				writer.write(`elseif ${lvw.getCodeString()} then\n`);
				lvw.clear(); // Clear the writer for the body bit

				this.visitStatementOrCommentNodes(lvw, elseif.body);

				for (const b of lvw.getCode()) {
					writer.write(`\t${b}`);
				}

				lvw.clear(); // Clear the writer for the next elseif
			}
		}

		if (inode.data.else) {
			writer.write('else\n');
			lvw.clear(); // Clear the writer for else statements
			this.visitStatementOrCommentNodes(lvw, inode.data.else);
			for (const b of lvw.getCode()) {
				writer.write(`\t${b}`);
			}
		}

		writer.write('end\n');
		return;
	}

	/**
	 * Visits a LocalFunctionDeclaration and returns the string representation.
	 */
	private visitLocalFunctionDeclaration(writer: Writer, inode: LocalFunctionDeclaration) {
		if (inode.name.includes('.')) {
			this.pushError(`Local function name "${inode.name}" cannot contain a dot (.)`);
		}
		if (inode.params.some((param) => param.name.includes('.'))) {
			this.pushError(`Function parameter names cannot contain a dot (.)`);
		}
		const params = inode.params
			.map((param) => param.name + (param.type ? `: ${param.type}` : ''))
			.join(', ');
		writer.write(
			`local function ${inode.name}(${params})${inode.returnType.type ? ': ' + inode.returnType.type : ''}\n`
		);

		let lvw = new Writer();
		this.visitStatementOrCommentNodes(lvw, inode.body);

		for (const b of lvw.getCode()) {
			writer.write(`\t${b}`);
		}
		writer.write('\nend\n');
		return;
	}

	/**
	 * Visits a FunctionDeclaration and returns the string representation.
	 */
	private visitFunctionDeclaration(writer: Writer, inode: FunctionDeclaration) {
		if (inode.params.some((param) => param.name.includes('.'))) {
			this.pushError(`Function parameter names cannot contain a dot (.)`);
		}
		if (inode.params.some((param) => param.name.includes('.'))) {
			this.pushError(`Function parameter names cannot contain a dot (.)`);
		}
		const params = inode.params
			.map((param) => param.name + (param.type ? `: ${param.type}` : ''))
			.join(', ');
		writer.write(
			`function ${inode.name}(${params})${inode.returnType.type ? ': ' + inode.returnType.type : ''}\n`
		);

		let lvw = new Writer();
		this.visitStatementOrCommentNodes(lvw, inode.body);

		for (const b of lvw.getCode()) {
			writer.write(`\t${b}`);
		}
		writer.write('\nend\n');
		return;
	}

	/**
	 * Visits a ForLoop and returns the string representation.
	 */
	private visitForLoop(writer: Writer, inode: ForLoop) {
		this.visitForLoopType(writer, inode.data.condition);
		let lvw = new Writer();
		this.visitStatementOrCommentNodes(lvw, inode.data.body);

		for (const b of lvw.getCode()) {
			writer.write(`\t${b}`);
		}

		writer.write('end\n');
		return;
	}

	/**
	 * Visits a ForLoopType and returns the string representation.
	 */

	/**
	 * Visits a ForLoopType and returns the string representation.
	 */
	private visitForLoopType(writer: Writer, condition: ForLoopType): void {
		switch (condition.type) {
			case ForLoopEnum.GeneralizedIteration:
				let lvw = new Writer();
				FinalRepr.visitLiteralValue(lvw, condition.iterable);
				if (lvw.getCode().length === 0) {
					this.pushError('Iterable in generalized for loop cannot be empty');
				}
				return writer.write(`for ${condition.varbinds.join(', ')} in ${lvw.getCodeString()} do\n`);
			case ForLoopEnum.Range:
				return writer.write(
					`for ${condition.varbind} = ${condition.start}, ${condition.end}${condition.step ? `, ${condition.step}` : ''} do\n`
				);
			case ForLoopEnum.Raw:
				return writer.write(`for ${condition.condition} do\n`); // Raw condition for the loop
		}
	}

	/**
	 * Visits a FunctionCall and returns the string representation.
	 */
	private visitFunctionCall(writer: Writer, inode: FunctionCall) {
		let args = inode.args
			.map((arg) => {
				let argWriter = new Writer();
				FinalRepr.visitLiteralValue(argWriter, arg);
				return argWriter.getCodeString();
			})
			.join(',\n\t');

		// Ensure name is valid (contains only letters, numbers, underscores, dots and one colon at the end if a method call)
		if (
			!(
				/^[a-zA-Z0-9_.]+(:[a-zA-Z0-9_]*)?$/.test(inode.name) ||
				inode.name.endsWith(':') ||
				inode.name.endsWith('.')
			)
		) {
			this.pushError(
				`Function name "${inode.name}" is not valid. It can only contain letters, numbers, underscores, dots and one colon at the final indexing if a method call. If this is incorrect, please report this as a bug.`
			);
		}

		writer.write(`${inode.name}(${args})\n`);
	}

	/**
	 * Visits a WhileLoop and returns the string representation.
	 */
	private visitWhileLoop(writer: Writer, inode: WhileLoop) {
		let lvw = new Writer();
		FinalRepr.visitLiteralValue(lvw, inode.condition);
		writer.write(`while ${lvw.getCodeString()} do\n`);
		lvw.clear(); // Clear the lvw for the visit stmt
		this.visitStatementOrCommentNodes(lvw, inode.body);

		for (const b of lvw.getCode()) {
			writer.write(`\t${b}`);
		}
		writer.write('end\n');

		return;
	}

	/**
	 * Visits a Return and returns the string representation.
	 */
	private visitReturn(writer: Writer, inode: Return) {
		let rvw = new Writer();
		FinalRepr.visitLiteralValue(rvw, inode.value);
		writer.write(`return ${rvw.getCodeString()}\n`);
	}

	/**
	 * Helper to loop over a list of INodes and perform the validity check on each.
	 */
	private visitReprs(writer: Writer, inodes: Node[]) {
		for (const inode of inodes) {
			this.visitRepr(writer, inode);
		}
	}
}
