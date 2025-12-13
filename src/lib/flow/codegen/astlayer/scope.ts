/**
 * A scope provides a special 'linked list' style data structure to store data about both the current scope and
 * all prior scopes
 */
export abstract class Scope<ScopeType extends Scope<ScopeType>> {
	private root: ScopeType | null;

	constructor(root: ScopeType | null) {
		this.root = root;
	}

	/**
	 * Returns a new scope whose root will be the current scope
	 */
	abstract nest(): ScopeType;

	protected find<U>(f: (d: ScopeType) => U | undefined): U | undefined {
		let currentScope = this as unknown as ScopeType; // SAFETY: this will refer to ScopeType
		while (true) {
			let v = f(currentScope);
			if (v) return v;
			else if (!currentScope.root) return undefined;
			else currentScope = currentScope.root; // Navivate backwards in scope to previous nesting
		}
	}
}
