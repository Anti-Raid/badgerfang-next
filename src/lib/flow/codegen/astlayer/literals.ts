import {
	FinalRepr,
	LiteralEnum,
	LiteralLogicType,
	LiteralRelationalOperatorType,
	LiteralValue
} from './finalrepr';

/**
 * Returns the string representation of a LiteralValue
 */
export const writeLiteral = (value: LiteralValue): string => {
	// todo: support non-inline tables in the future
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
				value: string;
		  };

	const tokToStack = (tok: string): StackData => {
		return { type: 'token', value: tok };
	};

	let stack: StackData[] = [{ type: 'literal', value }];

	let outputToks: string = '';

	while (true) {
		let value = stack.pop();
		if (!value) break;
		if (value.type == 'token') {
			outputToks += value.value;
			continue;
		}

		let lvalue = value.value;

		switch (lvalue.type) {
			case LiteralEnum.Nil:
				stack.push(tokToStack(value.tableKey ? '[nil]' : 'nil'));
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
						stack.push(tokToStack(lvalue.value));
					} else {
						// Not a valid identifier, wrap it (e.g., ["foo bar"])
						stack.push(
							tokToStack(`["${lvalue.value.replaceAll('"', '\\"').replaceAll('\n', '\\n')}"]`)
						);
					}
					continue;
				}

				if (lvalue.interpolated) {
					stack.push(tokToStack(`\`${lvalue.value.replaceAll('`', '\\`')}\``));
					continue;
				}

				if (lvalue.multiline) {
					// If the string contains a newline, use a multiline string
					stack.push(
						tokToStack(`[[${lvalue.value.replaceAll('[[', '\[\[').replaceAll("']]", '\]\]')}]]`)
					);
					continue;
				}
				stack.push(tokToStack(`"${lvalue.value.replaceAll('"', '\\"').replaceAll('\n', '\\n')}"`));
				continue;
			case LiteralEnum.Number:
				const numStr = lvalue.value.toString();
				stack.push(tokToStack(value.tableKey ? `[${numStr}]` : numStr));
				continue;
			case LiteralEnum.Table:
				stack.push(tokToStack('}'));
				for (let i = lvalue.value.length - 1; i >= 0; i--) {
					stack.push({ type: 'literal', value: lvalue.value[i].value });
					stack.push(tokToStack(' = '));
					stack.push({ type: 'literal', value: lvalue.value[i].key, tableKey: true });

					if (i > 0) {
						stack.push(tokToStack(', '));
					}
				}
				stack.push(tokToStack('{'));
				continue;
			case LiteralEnum.TableArray:
				if (lvalue.value.length === 0) {
					// This expands down to setmetatable({}, [require'@antiraid/interop'].array_metatable)
					let interopDep = FinalRepr.mangleDep('@antiraid/interop');
					stack.push(tokToStack(`setmetatable({}, ${interopDep}.array_metatable)`));
					continue;
				}

				stack.push(tokToStack('}'));
				for (let i = lvalue.value.length - 1; i >= 0; i--) {
					stack.push({ type: 'literal', value: lvalue.value[i] });
					if (i > 0) {
						stack.push(tokToStack(', '));
					}
				}
				stack.push(tokToStack('{'));
				continue;
			case LiteralEnum.Boolean:
				const boolStr = lvalue.value ? 'true' : 'false';
				stack.push(tokToStack(value.tableKey ? `[${boolStr}]` : boolStr));
				continue;
			case LiteralEnum.Vector:
				stack.push(tokToStack(`vector.create(${lvalue.x}, ${lvalue.y}, ${lvalue.z})`));
				continue;
			case LiteralEnum.Raw:
				stack.push(tokToStack(lvalue.value)); // Raw code or expression, return as is
				continue;
			case LiteralEnum.Parens:
				stack.push(tokToStack(')'));
				stack.push({ type: 'literal', value: lvalue.inner });
				stack.push(tokToStack('('));
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
				stack.push(tokToStack(` ${logicOp} `));
				stack.push({ type: 'literal', value: lvalue.lvalue });
				continue;
			case LiteralEnum.LogicExpr:
				let logicMap = {
					[LiteralLogicType.And]: 'and',
					[LiteralLogicType.Or]: 'or'
				};

				let logicExprOp = logicMap[lvalue.condition];

				// LIFO stack
				for (let i = lvalue.operands.length - 1; i >= 0; i--) {
					stack.push({ type: 'literal', value: lvalue.operands[i] });
					if (i > 0) {
						stack.push(tokToStack(` ${logicExprOp} `));
					}
				}
				continue;
			case LiteralEnum.Not:
				stack.push({ type: 'literal', value: lvalue.value });
				stack.push(tokToStack('not '));
				continue;
			case LiteralEnum.Passthrough:
				stack.push({ type: 'literal', value: lvalue.value });
				continue;
		}
	}

	return outputToks;
};
