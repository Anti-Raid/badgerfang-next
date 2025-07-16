import { CodeGenAST, INode } from './ast';

/**
 * Stores the state for a AST validity check.
 *
 * A state must be cloneable (so it can be cloned when descending into a different scope)
 */
export abstract class ASTVState {
	/**
	 * Clones the current state.
	 *
	 * This is used to create a new state when descending into a different scope.
	 */
	public abstract clone(): ASTVState;
}

/**
 * A AST validity check
 */
export abstract class ASTValidityCheck<State extends ASTVState> {
	ast: CodeGenAST;

	constructor(ast: CodeGenAST) {
		this.ast = ast;
	}

	/**
	 * Returns the initial state that will be passed to all invocations of visitNode.
	 */
	abstract getInitialState(): State;

	/**
	 * Visits the INode and performs the validity check on said INode
	 */
	abstract visitNode(inode: INode, state: State): void;

	/**
	 * Helper to loop over a list of INodes and perform the validity check on each.
	 */
	public visitNodes(inodes: INode[], state: State): void {
		for (const inode of inodes) {
			this.visitNode(inode, state);
		}
	}

	/**
	 * Helper to clone the current state
	 */
	public cloneState(state: State): State {
		return state.clone() as State;
	}

	/**
	 * Helper to descend into a new scope by cloning the current state and visiting the INodes with the new state.
	 *
	 * This allows each scope to have its own independent state while still being able to access the parent scope's state.
	 */
	public descend(inodes: INode[], state: State): State {
		// Clone the current state to create a new state for the new scope
		const newState = this.cloneState(state);
		this.visitNodes(inodes, newState);
		return newState;
	}
}

/**
 * Base class for performing all validity checks on a CodeGenAST
 */
export abstract class ASTValidator {
	public ast: CodeGenAST;
	public checks: ASTValidityCheck<ASTVState>[];

	constructor(ast: CodeGenAST) {
		this.ast = ast;
		this.checks = [];
	}

	/**
	 * Adds a validity check to the validator.
	 *
	 * @param check The validity check to add.
	 */
	public addCheck(check: ASTValidityCheck<ASTVState>): void {
		this.checks.push(check);
	}

	/**
	 * Adds a validity check to the validator by class.
	 *
	 * @param checkClass The class of the validity check to add.
	 */
	public addCheckClass(checkClass: new (ast: CodeGenAST) => ASTValidityCheck<ASTVState>): void {
		const check = new checkClass(this.ast);
		this.addCheck(check);
	}

	/**
	 * Runs all validity checks on the AST.
	 *
	 * Errors will be added to the AST's errors array.
	 */
	public runChecks(): void {
		for (const check of this.checks) {
			const initialState = check.getInitialState();
			try {
				check.visitNodes(this.ast.nodes, initialState);
			} catch (error) {
				this.ast.fatalError = `AST validity check failed unexpectedly: ${error?.toString()}`;
				return;
			}
		}
	}
}
