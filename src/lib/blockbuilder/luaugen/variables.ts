/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Generating Lua for variable blocks.
 */

// Former goog.module ID: Blockly.Lua.variables

import type {Block} from 'blockly/core';
import type {LuaGenerator} from './luau_generator';
import {Order} from './luau_generator';

export function variables_get(
  block: Block,
  generator: LuaGenerator,
): [string, Order] {
  // Variable getter.
  const code = generator.getVariableName(block.getFieldValue('VAR'));
  return [code, Order.ATOMIC];
}

export function variables_set(block: Block, generator: LuaGenerator): string {
  // Variable setter.
  const argument0 = generator.valueToCode(block, 'VALUE', Order.NONE) || '0';
  const varName = generator.getVariableName(block.getFieldValue('VAR'));
  return "local " + varName + ' = ' + argument0 + '\n';
}
