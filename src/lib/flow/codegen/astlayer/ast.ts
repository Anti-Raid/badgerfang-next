import { ASTPreludeApply } from './ast_transforms';
import { Node } from './finalrepr';

export interface ICommandArgument {
	type: ICommandArgumentType;
	name: string;
	description?: string;
	required: boolean;
}

export enum IPreludeTypeEnum {
	// No prelude, just start up the flow
	Library = 'ILibrary',
	// Command node that starts the flow for a command
	Command = 'ICommand',
	// Prelude has already been applied
	Applied = 'IApplied'
}

export interface IPreludeApplied {
	type: IPreludeTypeEnum.Applied;
}

export interface IPreludeLibrary {
	type: IPreludeTypeEnum.Library;
	data: {
		name: string;
	};
}

export interface IPreludeCommand {
	type: IPreludeTypeEnum.Command;
	data: {
		name: string;
		description: string;
		arguments: ICommandArgument[];
	};
}

export type IPreludeData = IPreludeLibrary | IPreludeCommand | IPreludeApplied;

/**
 * Command argument types for the command nodes.
 */
export enum ICommandArgumentType {
	String = 'IString',
	Integer = 'IInteger',
	Boolean = 'IBoolean',
	User = 'IUser',
	Channel = 'IChannel',
	Role = 'IRole',
	Member = 'IMember'
}

/**
 * AST class
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
	public dependencies: Record<string, string>;

	constructor(
		prelude: IPreludeData = { type: IPreludeTypeEnum.Library, data: { name: 'Unnamed Library' } },
		nodes: Node[] = [],
		errors: string[] = [],
		warnings: string[] = [],
		dependencies: Record<string, string> = {},
		fatalError?: string
	) {
		this.prelude = prelude;
		this.nodes = nodes;
		this.errors = errors;
		this.warnings = warnings;
		this.dependencies = dependencies;
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

	applyTransform(transform: (ast: CodeGenAST) => void): void {
		if (this.isError()) {
			throw new Error('Cannot apply transforms to an AST with errors or a fatal error');
		}

		try {
			transform(this);
		} catch (error) {
			this.fatalError = `AST transform failed unexpectedly: ${error?.toString()}`;
		}
	}

	applyDefaultTransforms(): void {
		this.applyTransform((ast) => {
			new ASTPreludeApply(ast).transform();
		});
	}
}
