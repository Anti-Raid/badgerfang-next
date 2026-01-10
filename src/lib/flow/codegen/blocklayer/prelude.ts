import { Node, ReprEnum } from '../astlayer/finalrepr';

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

export type IPreludeData = IPreludeLibrary | IPreludeCommand;

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

interface AppliedPrelude {
	nodes: Node[];
	addDeps: Record<string, string>;
}

export const applyPrelude = (prelude: IPreludeData, bodyNodes: Node[]): AppliedPrelude => {
	switch (prelude.type) {
		case IPreludeTypeEnum.Command:
			const argTypeToDiscord = {
				[ICommandArgumentType.String]: 'String',
				[ICommandArgumentType.Integer]: 'Integer',
				[ICommandArgumentType.Boolean]: 'Boolean',
				[ICommandArgumentType.User]: 'User',
				[ICommandArgumentType.Channel]: 'Channel',
				[ICommandArgumentType.Role]: 'Role',
				[ICommandArgumentType.Member]: 'Member'
			};

			// Assuming flowFramework (WIP/to be released sets integration type to GuildInstall, type to ChatInput/SubCommand/SubCommandGroup automatically and context to Guild)
			let registerFuncStart = [
				`commandBuilder.new({ name = "${prelude.data.name}" })`,
				`:setDescription("${prelude.data.description.replaceAll('"', '\"')}")`
			];

			for (let arg of prelude.data.arguments) {
				// Start a new option
				registerFuncStart.push('\t:option(\n\t\tfunction(opt)\n\t\t\treturn opt');

				// Push type
				registerFuncStart.push(`\t\t\t:setType("${argTypeToDiscord[arg.type]}")`);
				// Push name
				registerFuncStart.push(`\t\t\t:setName("${arg.name.replaceAll('"', '\"')}")`);
				if (arg.description) {
					registerFuncStart.push(
						`\t\t\t:setDescription("${arg.description.replaceAll('"', '\"')}")`
					);
				}
				if (arg.required) {
					registerFuncStart.push('\t\t\t:setRequired(true)');
				}

				// Finish option
				registerFuncStart.push('\t\t\t:build()\n\t\tend\n\t)');
			}

			let registerFnNode: Node = {
				type: ReprEnum.Raw,
				code: registerFuncStart.join('\n')
			};

			let registerFunc: Node[] = [
				{
					type: ReprEnum.LocalFunctionDeclaration,
					funcdecl: {
						type: ReprEnum.FunctionDeclaration,
						name: 'register',
						params: [],
						body: [registerFnNode],
						returnType: {}
					}
				}
			];

			let logicNode: Node = {
				type: ReprEnum.LocalFunctionDeclaration,
				funcdecl: {
					type: ReprEnum.FunctionDeclaration,
					name: 'execute',
					body: bodyNodes,
					params: [
						{
							name: 'data',
							type: 'data.RunData'
						}
					],
					returnType: {
						type: 'nil'
					}
				}
			};

			return {
				nodes: [registerFnNode, logicNode],
				addDeps: {
					framework: '@antiraid-ext/flow/framework',
					commandBuilder: '@discord-types/builders/interaction/interaction',
					data: '@antiraid-ext/framework/coretypes'
				}
			};
		case IPreludeTypeEnum.Library:
			return {
				nodes: bodyNodes,
				addDeps: {}
			};
	}
};
