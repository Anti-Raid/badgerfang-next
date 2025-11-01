import { Scope } from './scope';
import { CodeGenAST } from './ast';
import { ForLoop, IfCondition, LiteralValue, LocalVariableDeclaration, Node, ReprEnum } from './finalrepr';

export class UndefinedVariableCheckScope extends Scope<UndefinedVariableCheckScope> {
	/**
	 * Currently known variables in the current scope.
	 */
	public variables: Map<string, Node>; // TODO: potentially change string to contain other data

	constructor(root: UndefinedVariableCheckScope | null) {
		super(root);
		this.variables = new Map();
	}

	nest(): UndefinedVariableCheckScope {
		return new UndefinedVariableCheckScope(this)
	}

	getVariable(variable: string): Node | undefined {
		return this.find((scope) => scope.variables.get(variable))
	}

	addVariable(variable: string, type: Node) {
		this.variables.set(variable, type)
	}
}

/**
 * Check for undefined variables in the AST.
 *
 * This doesn't do much yet (besides warning about shadowed variables)
 * as using variables in a TypedInput etc is not yet implemented.
 */
export class UndefinedVariableCheck {
	private ast: CodeGenAST

	constructor(ast: CodeGenAST) {
		this.ast = ast;
	}

	/**
	 * Helper to loop over a list of INodes and perform the validity check on each.
	 */
	public visitNodes(inodes: Node[], scope: UndefinedVariableCheckScope): void {
		for (const inode of inodes) {
			this.visitNode(inode, scope);
		}
	}

	/**
	 * Helper to descend into a list of INodes with a scope nested on the given scope.
	 */
	public descend(inodes: Node[], scope: UndefinedVariableCheckScope) {
		const nestedScope = scope.nest();
		this.visitNodes(inodes, nestedScope);
	}

	visitNode(inode: Node, scope: UndefinedVariableCheckScope): void {
		switch (inode.type) {
			case ReprEnum.LocalVariableDeclaration:
				this.visitLocalVariableDeclaration(inode, scope);
				break;
			case ReprEnum.IfCondition:
				this.visitIfCondition(inode, scope);
				break;
			case ReprEnum.ForLoop:
				this.visitForLoop(inode, scope);
				break;
		}
	}

	visitLocalVariableDeclaration(inode: LocalVariableDeclaration, scope: UndefinedVariableCheckScope): void {
		if (scope.getVariable(inode.lvalue)) {
			// Push a warning
			this.ast.warnings.push(
				`Variable "${inode.lvalue}" is already defined in the current scope. As such, the previous variable declaration will be shadowed by the new one`
			);
			return;
		}
		// Add the variable to the known variables set
		scope.addVariable(inode.lvalue, inode.rvalue);
	}

	visitIfCondition(inode: IfCondition, scope: UndefinedVariableCheckScope): void {
		// Descend into the body of the if condition
		this.descend(inode.data.body, scope);

		if (inode.data.elseifs) {
			// Descend into each else-if condition
			for (const elseif of inode.data.elseifs) {
				this.descend(elseif.body, scope);
			}
		}

		if (inode.data.else) {
			// Descend into the else body
			this.descend(inode.data.else, scope);
		}
	}

	visitForLoop(inode: ForLoop, scope: UndefinedVariableCheckScope): void {
		// Descend into the body of the for loop
		this.descend(inode.data.body, scope);
	}
}
