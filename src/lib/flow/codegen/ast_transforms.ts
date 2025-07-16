import { CodeGenAST, ICommandArgumentType, INode, INodeTypeEnum, IPreludeTypeEnum } from './ast';

export abstract class BaseTransform {
	protected ast: CodeGenAST;

	constructor(ast: CodeGenAST) {
		this.ast = ast;
	}

	/**
	 * Applies the transformation on the AST
	 */
	abstract transform(): void;
}

/**
 * Given the AST, applies the details/structure within the prelude to the AST
 */
export class ASTPreludeApply extends BaseTransform {
	transform() {
		switch (this.ast.prelude.type) {
			case IPreludeTypeEnum.Command:
				/*
                String = 'IString',
                Integer = 'IInteger',
                Boolean = 'IBoolean',
                User = 'IUser',
                Channel = 'IChannel',
                Role = 'IRole',
                Member = 'IMember'
                */
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
					'local function register()',
					`\tframework.register("${this.ast.prelude.data.name.replaceAll('"', '\"')}")`,
					`\t:setDescription("${this.ast.prelude.data.description.replaceAll('"', '\"')}")`
				];

				for (let arg of this.ast.prelude.data.arguments) {
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

				registerFuncStart.push('end');

				let registerFnNode: INode = {
					type: INodeTypeEnum.CustomCode,
					data: {
						code: registerFuncStart.join('\n')
					}
				};

				console.log(registerFuncStart.join('\n'));

				let logicNode: INode = {
					type: INodeTypeEnum.LocalFunctionDeclaration,
					body: this.ast.nodes,
					name: 'execute',
					params: [
						{
							name: 'data',
							type: 'framework.RunData'
						}
					],
					returnType: {
						type: 'nil'
					}
				};

				this.ast.nodes = [registerFnNode, logicNode];
				this.ast.prelude = { type: IPreludeTypeEnum.Applied };

				if (this.ast.dependencies['framework']) {
					this.ast.warnings.push(
						'framework is defined in dependencies but is also used by prelude'
					);
				}

				this.ast.dependencies['framework'] = '@antiraid-ext/flow/framework';
				break;
			case IPreludeTypeEnum.Library:
				// No changes needed for library prelude
				this.ast.prelude = { type: IPreludeTypeEnum.Applied };
				break;
		}

		if (this.ast.prelude.type !== IPreludeTypeEnum.Applied) {
			this.ast.errors.push(
				'Internal error: Prelude was not applied correctly, please report this issue'
			);
		}
	}
}
