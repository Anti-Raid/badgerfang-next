// From https://github.com/Anti-Raid/khronos/blob/master/crates/runtime/src/utils/proxyglobal.rs
use mlua::prelude::*;
use std::cell::Cell;
use std::rc::Rc;

/// Creates a Lua table that proxies global variable access with custom read, write, iteration, and length behavior.
///
/// The returned table acts as a global environment proxy: reads and writes are forwarded to the actual Lua globals table if the key exists there, otherwise they operate on the proxy table itself. Iteration yields all key-value pairs from the proxy table first, then from the Lua globals table. The length operation returns the combined size of both tables. Access to the metatable is disabled.
///
/// # Examples
///
/// ```
/// let proxy = proxy_global(&lua)?; // Returns a LuaTable proxying global access
/// proxy.set("foo", 42)?; // Writes to proxy if "foo" is not in globals, otherwise to globals
/// let val: i32 = proxy.get("foo")?;
/// ```
pub fn proxy_global(lua: &Lua) -> LuaResult<LuaTable> {
    // Setup the global table using a metatable
    //
    // SAFETY: This works because the global table will not change in the VM
    let global_mt = lua.create_table()?;
    let global_tab = lua.create_table()?;

    // Proxy reads to globals if key is in globals, otherwise to the table
    global_mt.set("__index", lua.globals())?;
    global_tab.set("_G", global_tab.clone())?;

    // Provies writes
    // Forward to _G if key is in globals, otherwise to the table
    let globals_ref = lua.globals();
    global_mt.set(
        "__newindex",
        lua.create_function(
            move |_lua, (tab, key, value): (LuaTable, LuaValue, LuaValue)| {
                let v = globals_ref.get::<LuaValue>(key.clone())?;

                if !v.is_nil() {
                    globals_ref.set(key, value)
                } else {
                    tab.raw_set(key, value)
                }
            },
        )?,
    )?;

    lua.gc_collect()?;

    // Used in iterator
    let lua_global_pairs = Rc::new(
        lua.globals()
            .pairs()
            .collect::<LuaResult<Vec<(LuaValue, LuaValue)>>>()?,
    );

    // Provides iteration over first the users globals, then lua.globals()
    //
    // This is done using a Luau script to avoid borrowing issues
    global_mt.set(
        "__iter",
        lua.create_function(move |lua, globals: LuaTable| {
            let global_pairs = globals
                .pairs()
                .collect::<LuaResult<Vec<(LuaValue, LuaValue)>>>()?;

            let lua_global_pairs = lua_global_pairs.clone();

            let i = Cell::new(0);
            let iter = lua.create_function(move |_lua, ()| {
                let curr_i = i.get();

                if curr_i < global_pairs.len() {
                    let Some((key, value)) = global_pairs.get(curr_i).cloned() else {
                        return Ok((LuaValue::Nil, LuaValue::Nil));
                    };
                    i.set(curr_i + 1);
                    return Ok((key, value));
                }

                if curr_i < global_pairs.len() + lua_global_pairs.len() {
                    let Some((key, value)) =
                        lua_global_pairs.get(curr_i - global_pairs.len()).cloned()
                    else {
                        return Ok((LuaValue::Nil, LuaValue::Nil));
                    };
                    i.set(curr_i + 1);
                    return Ok((key, value));
                }

                Ok((LuaValue::Nil, LuaValue::Nil))
            })?;

            Ok(iter)
        })?,
    )?;

    global_mt.set(
        "__len",
        lua.create_function(move |lua, globals: LuaTable| {
            let globals_len = globals.raw_len();
            let len = lua.globals().raw_len();
            Ok(globals_len + len)
        })?,
    )?;

    // Block getmetatable
    global_mt.set("__metatable", false)?;

    global_tab.set_metatable(Some(global_mt));

    Ok(global_tab)
}