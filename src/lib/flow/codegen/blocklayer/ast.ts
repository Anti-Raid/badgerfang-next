import { FinalRepr, Node } from '../astlayer/finalrepr';
import { applyPrelude, IPreludeData, IPreludeTypeEnum } from './prelude';

/**
 * Internal 
 */
export class CodeGenAST {
	/**
	 * Start node type
	 */
	public prelude: IPreludeData;

	/**
	 * The nodes in the IR.
	 */
	public nodes: Node[];
	/**
	 * Error messages generated during the IR generation.
	 */
	public errors: string[];
	/**
	 * Warnings generated during the IR generation.
	 */
	public warnings: string[];
	/**
	 * Fatal error that occurred during the IR generation.
	 * If this is set, the IR generation failed and should not be used.
	 */
	public fatalError?: string;
	/**
	 * Dependencies that the generated code needs.
	 */
	public dependencies: Map<string, string>;

	constructor(
		prelude: IPreludeData = { type: IPreludeTypeEnum.Library, data: { name: 'Unnamed Library' } },
		nodes: Node[] = [],
		errors: string[] = [],
		warnings: string[] = [],
		fatalError?: string
	) {
		this.prelude = prelude;
		this.nodes = nodes;
		this.errors = errors;
		this.warnings = warnings;
		this.dependencies = new Map();
		this.fatalError = fatalError;
	}

	toJSON(): Record<string, unknown> {
		return {
			nodes: this.nodes,
			prelude: this.prelude,
			warnings: this.warnings,
			errors: this.errors,
			dependencies: this.dependencies,
			fatalError: this.fatalError
		};
	}

	isError(): boolean {
		return this.errors.length > 0 || !!this.fatalError;
	}

	toFinalRepr(): FinalRepr {
		if (this.isError()) {
			throw new Error(`Cannot convert an invalid AST to final repr`)
		}
		let appliedPrelude = applyPrelude(this.prelude, this.nodes)
		for (let [key, value] of Object.entries(appliedPrelude.addDeps)) {
			if (!this.dependencies.has(key)) {
				this.dependencies.set(key, value)
			}
		}

		return new FinalRepr(appliedPrelude.nodes, this.dependencies)
	}
}
