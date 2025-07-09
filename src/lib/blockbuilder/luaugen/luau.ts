/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Complete helper functions for generating Lua for
 *     blocks.  This is the entrypoint for lua_compressed.js.
 */

// Former goog.module ID: Blockly.Lua.all

import * as lists from './lists';
import * as logic from './logic';
import * as loops from './loops';
import { LuaGenerator } from './luau_generator';
import * as math from './math';
import * as procedures from './procedures';
import * as text from './text';
import * as variables from './variables';

export * from './luau_generator';

/**
 * Lua code generator instance.
 */
export const luaGenerator = new LuaGenerator();

// Install per-block-type generator functions:
const generators: typeof luaGenerator.forBlock = {
	...lists,
	...logic,
	...loops,
	...math,
	...procedures,
	...text,
	...variables
};
for (const name in generators) {
	luaGenerator.forBlock[name] = generators[name];
}
