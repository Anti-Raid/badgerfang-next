import { writeLiteral } from "./literals";
import { ParseCommand } from "./parsecommand";

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
	funcdecl: FunctionDeclaration;
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
 * Final repr class
 */
export class FinalRepr {
	public repr: Node[];
	public errors: string[];
	public dependencies: Map<string, string>

	constructor(repr: Node[], dependencies: Map<string, string>) {
		this.repr = repr;
		this.errors = [];
		this.dependencies = dependencies
	}

	/**
	 * Takes the repr and makes a string representation of it.
	 */
	toParseCommand(): ParseCommand[] {
		return this.visitNodes(this.repr, true);
	}

	/**
	 * Mangles dep to depName
	 */
	static mangleDep(dep: string) {
		return "fd_" + dep.replaceAll("@", "__").replaceAll("/", "_")
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
	private visitRepr(inode: Node): ParseCommand[] {
		switch (inode.type) {
			case ReprEnum.LocalVariableDeclaration:
				return this.visitLocalVariableDeclaration(inode);
			case ReprEnum.GlobalDeclaration:
				return this.visitGlobalDeclaration(inode);
			case ReprEnum.Comment:
				return this.visitComment(inode);
			case ReprEnum.Raw:
				return this.visitRaw(inode);
			case ReprEnum.Literal:
				return this.visitLiteral(inode);
			case ReprEnum.IfCondition:
				return this.visitIfCondition(inode);
			case ReprEnum.LocalFunctionDeclaration:
				return this.visitLocalFunctionDeclaration(inode);
			case ReprEnum.FunctionDeclaration:
				return this.visitFunctionDeclaration(inode);
			case ReprEnum.ForLoop:
				return this.visitForLoop(inode);
			case ReprEnum.FunctionCall:
				return this.visitFunctionCall(inode);
			case ReprEnum.WhileLoop:
				return this.visitWhileLoop(inode);
			case ReprEnum.Return:
				return this.visitReturn(inode);
		}
	}

	/**
	 * Helper to first assert that the Node is a expression and then visit it.
	 */
	private visitExpression(inode: Node): ParseCommand[] {
		this.assertExpression(inode);
		return this.visitRepr(inode);
	}

	/**
	 * Visits a statement or comment node and returns the string representation.
	 */
	private visitStatementOrComment(inode: Node): ParseCommand[] {
		if (inode.type === ReprEnum.Comment) {
			return this.visitComment(inode);
		}
		this.assertStatement(inode);
		return this.visitRepr(inode);
	}

	/**
	 * Visits a set of statement/comment nodes and returns the string representation.
	 */
	private visitNodes(inodes: Node[], allowExprs?: boolean): ParseCommand[] {
		let pc: ParseCommand[] = []
		for (let i = 0; i < inodes.length; i++) {
			if (i > 0) pc.push({ type: "line.next" })
			if (allowExprs) {
				pc.push(...this.visitRepr(inodes[i]))
			} else {
				pc.push(...this.visitStatementOrComment(inodes[i]));
			}
		}
		return pc;
	}

	/**
	 * Visits a LocalVariableDeclaration and returns the string representation.
	 */
	private visitLocalVariableDeclaration(inode: LocalVariableDeclaration): ParseCommand[] {
		if (inode.lvalue.includes('.')) {
			this.pushError(`Local variable name "${inode.lvalue}" cannot contain a dot (.)`);
		}

		let exprTok = this.visitExpression(inode.rvalue);

		return [
			{ type: "token.luau", value: "local" },
			{ type: "token", value: inode.lvalue },
			{ type: "token", value: " = " },
			...exprTok,
			{ type: "token", value: ";" },
			//{ type: "line.next" },
		]
	}

	/**
	 * Visits a GlobalDeclaration and returns the string representation.
	 */
	private visitGlobalDeclaration(inode: GlobalDeclaration): ParseCommand[] {
		let exprTok = this.visitExpression(inode.rvalue);

		return [
			{ type: "token", value: inode.lvalue },
			{ type: "token", value: " = " },
			...exprTok,
			{ type: "token", value: ";" },
			//{ type: "line.next" },
		]
	}

	/**
	 * Visits a Comment and returns the string representation.
	 */
	private visitComment(inode: Comment): ParseCommand[] {
		if (inode.comment.includes('\n')) {
			return [
				{ type: "token", value: `--[[ ${inode.comment} ]]` },
			]
		} else {
			return [
				{ type: "token", value: `-- ${inode.comment.replaceAll('--', '\-\-')}` },
			]
		}
	}

	/**
	 * Visits a Raw and returns the string representation.
	 */
	private visitRaw(inode: Raw): ParseCommand[] {
		return [
			{ type: "token", value: inode.code }
		]
	}

	/**
	 * Visits a Literal node and returns the string representation.
	 */
	private visitLiteral(inode: Literal): ParseCommand[] {
		return [{ type: "token.literal", value: inode.value }]
	}

	/**
	 * Visit IfCondition (statement) and return the string representation.
	 */
	private visitIfCondition(inode: IfCondition): ParseCommand[] {
		let bodyStmts = this.visitNodes(inode.data.body);

		let ifCondToks: ParseCommand[] = [
			//{type: "line.next"},
			{ type: "token.luau", value: "if" },
			{ type: "token.literal", value: inode.data.condition },
			{ type: "token.luau", value: "then" },
			{ type: "line.next" },
			{ type: "indent.incr" },
			...bodyStmts,
			{ type: "indent.decr" },
			{ type: "line.next" },
		];

		if (inode.data.elseifs) {
			for (const elseif of inode.data.elseifs) {
				let elseIfToks = this.visitNodes(elseif.body);

				ifCondToks.push(
					{ type: "token.luau", value: "elseif" },
					{ type: "token.literal", value: elseif.condition },
					{ type: "token.luau", value: "then" },
					{ type: "line.next" },
					{ type: "indent.incr" },
					...elseIfToks,
					{ type: "indent.decr" },
					{ type: "line.next" },
				)
			}
		}

		if (inode.data.else) {
			let elseToks = this.visitNodes(inode.data.else);

			ifCondToks.push(
				{ type: "token.luau", value: "else" },
				{ type: "line.next" },
				{ type: "indent.incr" },
				...elseToks,
				{ type: "indent.decr" },
				{ type: "line.next" },
			)
		}

		ifCondToks.push({ type: "token.luau", value: "end" })

		return ifCondToks
	}

	/**
	 * Visits a LocalFunctionDeclaration and returns the string representation.
	 */
	private visitLocalFunctionDeclaration(inode: LocalFunctionDeclaration): ParseCommand[] {
		if (inode.funcdecl.name.includes('.')) {
			this.pushError(`Local function name "${inode.funcdecl.name}" cannot contain a dot (.)`);
		}

		let toks: ParseCommand[] = [
			{ type: "token.luau", value: "local" },
			...this.visitFunctionDeclaration(inode.funcdecl),
		];

		return toks;
	}

	/**
	 * Visits a FunctionDeclaration and returns the string representation.
	 */
	private visitFunctionDeclaration(inode: FunctionDeclaration): ParseCommand[] {
		if (inode.params.some((param) => param.name.includes('.'))) {
			this.pushError(`Function parameter names cannot contain a dot (.)`);
		}

		const params: ParseCommand[] = []
		for (let i = 0; i < inode.params.length; i++) {
			if (i > 0) params.push({ type: "token", value: ", " })
			params.push({ type: "token.luau.funcarg", name: inode.params[i].name, argtype: inode.params[i].type })
		}

		return [
			{ type: "token.luau", value: "function" },
			{ type: "token", value: `${inode.name}` },
			{ type: "token", value: `(` },
			...params,
			{ type: "token", value: `)` },
			{ type: "indent.incr" },
			...this.visitNodes(inode.body),
			{ type: "indent.decr" },
			{ type: "token.luau", value: "end" }
		];
	}

	/**
	 * Visits a ForLoop and returns the string representation.
	 */
	private visitForLoop(inode: ForLoop): ParseCommand[] {
		return [
			{ type: "token.luau", value: "for" },
			...this.visitForLoopType(inode.data.condition),
			{ type: "token.luau", value: "do" },
			{ type: "indent.incr" },
			...this.visitNodes(inode.data.body),
			{ type: "indent.decr" },
			{ type: "token.luau", value: "end" }
		]
	}

	/**
	 * Visits a ForLoopType and returns the string representation.
	 */
	private visitForLoopType(condition: ForLoopType): ParseCommand[] {
		switch (condition.type) {
			case ForLoopEnum.GeneralizedIteration:
				return [
					{ type: "token", value: `${condition.varbinds.join(', ')}` },
					{ type: "token.luau", value: "in" },
					{ type: "token.literal", value: condition.iterable },
				]
			case ForLoopEnum.Range:
				let toks: ParseCommand[] = [
					{ type: "token", value: `${condition.varbind}` },
					{ type: "token", value: " = " },
					{ type: "token", value: `${condition.start}` },
					{ type: "token", value: ", " },
					{ type: "token", value: `${condition.end}` },
				]
				if (condition.step) {
					toks.push({ type: "token", value: condition.step ? `, ${condition.step}` : '' })
				}
				return toks
			case ForLoopEnum.Raw:
				return [
					{ type: "token", value: `${condition.condition}` },
				] // Raw condition for the loop
		}
	}

	/**
	 * Visits a FunctionCall and returns the string representation.
	 */
	private visitFunctionCall(inode: FunctionCall): ParseCommand[] {
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

		let toks: ParseCommand[] = [
			{ type: "token", value: inode.name },
			{ type: "token", value: "(" },
		]
		for (const arg of inode.args) {
			toks.push({ type: "token.literal", value: arg })
		}
		toks.push({ type: "token", value: ")" },)
		return toks
	}

	/**
	 * Visits a WhileLoop and returns the string representation.
	 */
	private visitWhileLoop(inode: WhileLoop): ParseCommand[] {
		return [
			{ type: "token.luau", value: "while" },
			{ type: "token.literal", value: inode.condition },
			{ type: "token.luau", value: "do" },
			{ type: "indent.incr" },
			...this.visitNodes(inode.body),
			{ type: "indent.decr" },
			{ type: "token.luau", value: "end" }
		]
	}

	/**
	 * Visits a Return and returns the string representation.
	 */
	private visitReturn(inode: Return): ParseCommand[] {
		return [
			{ type: "token.luau", value: "return" },
			{ type: "token.literal", value: inode.value }
		]
	}
}
