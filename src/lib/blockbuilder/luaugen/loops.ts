/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Generating Lua for loop blocks.
 */

// Former goog.module ID: Blockly.Lua.loops

import type { Block } from 'blockly/core';

import type { LuaGenerator } from './luau_generator';
import { Order } from './luau_generator';
import * as Blockly from 'blockly/core';

const NameType = Blockly.Names.NameType;
const stringUtils = Blockly.utils.string;

export function controls_repeat_ext(block: Block, generator: LuaGenerator): string {
	// Repeat n times.
	let repeats;
	if (block.getField('TIMES')) {
		// Internal number.
		repeats = String(Number(block.getFieldValue('TIMES')));
	} else {
		// External number.
		repeats = generator.valueToCode(block, 'TIMES', Order.NONE) || '0';
	}
	if (stringUtils.isNumber(repeats)) {
		repeats = parseInt(repeats, 10);
	} else {
		repeats = 'math.floor(' + repeats + ')';
	}
	let branch = generator.statementToCode(block, 'DO');
	branch = generator.addLoopTrap(branch, block);
	const loopVar = generator.nameDB_!.getDistinctName('count', NameType.VARIABLE);
	const code = 'for ' + loopVar + ' = 1, ' + repeats + ' do\n' + branch + 'end\n';
	return code;
}

export const controls_repeat = controls_repeat_ext;

export function controls_whileUntil(block: Block, generator: LuaGenerator): string {
	// Do while/until loop.
	const until = block.getFieldValue('MODE') === 'UNTIL';
	let argument0 = generator.valueToCode(block, 'BOOL', until ? Order.UNARY : Order.NONE) || 'false';
	let branch = generator.statementToCode(block, 'DO');
	branch = generator.addLoopTrap(branch, block);
	if (until) {
		argument0 = 'not ' + argument0;
	}
	return 'while ' + argument0 + ' do\n' + branch + 'end\n';
}

export function controls_for(block: Block, generator: LuaGenerator): string {
	// For loop.
	const variable0 = generator.getVariableName(block.getFieldValue('VAR'));
	const startVar = generator.valueToCode(block, 'FROM', Order.NONE) || '0';
	const endVar = generator.valueToCode(block, 'TO', Order.NONE) || '0';
	const increment = generator.valueToCode(block, 'BY', Order.NONE) || '1';
	let branch = generator.statementToCode(block, 'DO');
	branch = generator.addLoopTrap(branch, block);
	let code = '';
	let incValue;
	if (
		stringUtils.isNumber(startVar) &&
		stringUtils.isNumber(endVar) &&
		stringUtils.isNumber(increment)
	) {
		// All arguments are simple numbers.
		const up = Number(startVar) <= Number(endVar);
		const step = Math.abs(Number(increment));
		incValue = (up ? '' : '-') + step;
	} else {
		code = '';
		// Determine loop direction at start, in case one of the bounds
		// changes during loop execution.
		incValue = generator.nameDB_!.getDistinctName(variable0 + '_inc', NameType.VARIABLE);
		code += incValue + ' = ';
		if (stringUtils.isNumber(increment)) {
			code += Math.abs(increment as unknown as number) + '\n';
		} else {
			code += 'math.abs(' + increment + ')\n';
		}
		code += 'if (' + startVar + ') > (' + endVar + ') then\n';
		code += generator.INDENT + incValue + ' = -' + incValue + '\n';
		code += 'end\n';
	}
	code += 'for ' + variable0 + ' = ' + startVar + ', ' + endVar + ', ' + incValue;
	code += ' do\n' + branch + 'end\n';
	return code;
}

export function controls_forEach(block: Block, generator: LuaGenerator): string {
	// For each loop.
	const variable0 = generator.getVariableName(block.getFieldValue('VAR'));
	const argument0 = generator.valueToCode(block, 'LIST', Order.NONE) || '{}';
	let branch = generator.statementToCode(block, 'DO');
	branch = generator.addLoopTrap(branch, block);
	const code = 'for _, ' + variable0 + ' in ' + argument0 + ' do \n' + branch + 'end\n';
	return code;
}

export function controls_flow_statements(block: Block, generator: LuaGenerator): string {
	// Flow statements: continue, break.
	let xfix = '';
	if (generator.STATEMENT_PREFIX) {
		// Automatic prefix insertion is switched off for this block.  Add manually.
		xfix += generator.injectId(generator.STATEMENT_PREFIX, block);
	}
	if (generator.STATEMENT_SUFFIX) {
		// Inject any statement suffix here since the regular one at the end
		// will not get executed if the break/continue is triggered.
		xfix += generator.injectId(generator.STATEMENT_SUFFIX, block);
	}
	if (generator.STATEMENT_PREFIX) {
		const loop = (block as any).getSurroundLoop();
		if (loop && !loop.suppressPrefixSuffix) {
			// Inject loop's statement prefix here since the regular one at the end
			// of the loop will not get executed if 'continue' is triggered.
			// In the case of 'break', a prefix is needed due to the loop's suffix.
			xfix += generator.injectId(generator.STATEMENT_PREFIX, loop);
		}
	}
	switch (block.getFieldValue('FLOW')) {
		case 'BREAK':
			return xfix + 'break\n';
		case 'CONTINUE':
			return xfix + 'continue\n';
	}
	throw Error('Unknown flow statement.');
}
