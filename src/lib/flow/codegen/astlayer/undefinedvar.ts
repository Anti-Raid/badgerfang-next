import { Scope } from './scope';
import { CodeGenAST, IForLoopNode, IIfConditionNode, INode, INodeTypeEnum, ITypedInputEnum, IVariableSetNode } from './ast';

export class UndefinedVariableCheckScope extends Scope<UndefinedVariableCheckScope> {
	/**
	 * Currently known variables in the current scope.
	 */
	public variables: Map<string, ITypedInputEnum>; // TODO: potentially change string to contain other data

	constructor(root: UndefinedVariableCheckScope | null) {
		super(root);
		this.variables = new Map();
	}

	nest(): UndefinedVariableCheckScope {
		return new UndefinedVariableCheckScope(this)
	}

	getVariable(variable: string): ITypedInputEnum | undefined {
		return this.find((scope) => scope.variables.get(variable))
	}

	addVariable(variable: string, type: ITypedInputEnum) {
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
	public visitNodes(inodes: INode[], scope: UndefinedVariableCheckScope): void {
		for (const inode of inodes) {
			this.visitNode(inode, scope);
		}
	}

	/**
	 * Helper to descend into a list of INodes with a scope nested on the given scope.
	 */
	public descend(inodes: INode[], scope: UndefinedVariableCheckScope) {
		const nestedScope = scope.nest();
		this.visitNodes(inodes, nestedScope);
	}

	visitNode(inode: INode, scope: UndefinedVariableCheckScope): void {
		switch (inode.type) {
			case INodeTypeEnum.SetVariable:
				this.visitSetVariable(inode, scope);
				break;
			case INodeTypeEnum.IfCondition:
				this.visitIfCondition(inode, scope);
				break;
			case INodeTypeEnum.ForLoop:
				this.visitForLoop(inode, scope);
				break;
		}
	}

	visitSetVariable(inode: IVariableSetNode, scope: UndefinedVariableCheckScope): void {
		if (scope.getVariable(inode.data.name)) {
			// Push a warning
			this.ast.warnings.push(
				`Variable "${inode.data.name}" is already defined in the current scope. As such, the previous variable declaration will be shadowed by the new one`
			);
			return;
		}
		// Add the variable to the known variables set
		scope.addVariable(inode.data.name, inode.data.value.type);
	}

	visitIfCondition(inode: IIfConditionNode, scope: UndefinedVariableCheckScope): void {
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

	visitForLoop(inode: IForLoopNode, scope: UndefinedVariableCheckScope): void {
		// Descend into the body of the for loop
		this.descend(inode.data.body, scope);
	}
}
