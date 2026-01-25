mod plugins;
mod proxyglobals;
mod lazy;

use mluau::prelude::*;
use mluau_require::AssetRequirer;
use mluau_require::FilesystemWrapper;
use std::cell::RefCell;
use std::collections::HashMap;
use std::ffi::c_char;
use std::ffi::CStr;
use std::panic::catch_unwind;
use std::sync::LazyLock;

#[derive(Clone)]
pub struct VmData { 
    pub vm: Lua,
    pub global_tab: LuaTable,
    pub proxy_require: LuaFunction,
}

pub struct VmRefs {
    pub refs: RefCell<(HashMap<i32, VmData>, i32)>,
}

// While technically not Send/Sync, WASM is single-threaded
unsafe impl Send for VmRefs {}
unsafe impl Sync for VmRefs {}

pub static VM: LazyLock<VmRefs> = LazyLock::new(|| VmRefs {
    refs: RefCell::new((HashMap::new(), 1)),
});

#[unsafe(no_mangle)]
pub extern "C" fn test_wasm() -> i32 {
    42
}

#[unsafe(no_mangle)]
pub extern "C" fn luau_template_v2(vm_id: i32, ctx: emscripten_val::EM_VAL) -> emscripten_val::EM_VAL {
    let res = catch_unwind(|| {
        let ctx = emscripten_val::Val::take_ownership(ctx);
        let vm_data = {
            let refs_borrow = VM.refs.borrow();
            let vm_map = &refs_borrow.0;
            vm_map.get(&vm_id).cloned().expect("invalid vm_id")
        };
        call_luau(vm_data, ctx)
    });

    match res {
        Ok(s) => {
            let mut v = emscripten_val::Val::object();
            v.set(&"returnJson".to_string(), &s);
            v.release_ownership()
        },
        Err(e) => {
            // Return error to JS as object with "error" property
            let mut obj = emscripten_val::Val::object();
            let error_msg = if let Some(s) = e.downcast_ref::<&str>() {
                s.to_string()
            } else if let Some(s) = e.downcast_ref::<String>() {
                s.clone()
            } else {
                "unknown panic".to_string()
            };
            obj.set(&"error".to_string(), &error_msg);
            obj.release_ownership()
        }
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn setup_luau_vm(vfs: *const c_char) -> emscripten_val::EM_VAL {
    let res = catch_unwind(|| {
        let c_str = unsafe { CStr::from_ptr(vfs) };
        let Ok(vfs_str) = c_str.to_str() else {
            panic!("internal error: vfs has utf8 code sequences");
        };

        let vfs = match serde_json::from_str::<HashMap<String, String>>(vfs_str) {
            Ok(value) => value,
            Err(e) => {
                panic!("internal error: vfs parse error: {e}");
            }
        };

        let vm_data = setup_luau(vfs);
        let mut refs_borrow = VM.refs.borrow_mut();
        let vm_id = refs_borrow.1;
        refs_borrow.0.insert(vm_id, vm_data);
        refs_borrow.1 += 1;
        println!("Created Luau VM with id {}", vm_id);
        vm_id
    });

    match res {
        Ok(vm_id) => {
            let mut val = emscripten_val::Val::object();
            val.set(&"vm_id".to_string(), &vm_id);
            val.release_ownership()
        },
        Err(e) => {
            // Return error to JS as object with "error" property
            let mut obj = emscripten_val::Val::object();
            let error_msg = if let Some(s) = e.downcast_ref::<&str>() {
                s.to_string()
            } else if let Some(s) = e.downcast_ref::<String>() {
                s.clone()
            } else {
                "unknown panic".to_string()
            };
            obj.set(&"error".to_string(), &error_msg);
            obj.release_ownership()
        }
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn drop_luau_vm(vm_id: i32) -> emscripten_val::EM_VAL {
    let res = catch_unwind(|| {
        let mut refs_borrow = VM.refs.borrow_mut();
        if refs_borrow.0.remove(&vm_id).is_some() {
            println!("Dropped Luau VM with id {}", vm_id);
        } else {
            panic!("invalid vm_id");
        }
    });

    match res {
        Ok(_) => emscripten_val::Val::object().release_ownership(),
        Err(e) => {
            // Return error to JS as object with "error" property
            let mut obj = emscripten_val::Val::object();
            let error_msg = if let Some(s) = e.downcast_ref::<&str>() {
                s.to_string()
            } else if let Some(s) = e.downcast_ref::<String>() {
                s.clone()
            } else {
                "unknown panic".to_string()
            };
            obj.set(&"error".to_string(), &error_msg);
            obj.release_ownership()
        }
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn free_js_handle(handle: emscripten_val::EM_VAL) {
    emscripten_val::Val::take_ownership(handle);
}

/// Internal API to setup luau with a vfs
pub fn setup_luau(vfs: HashMap<String, String>) -> VmData {
    let lua = Lua::new_with(
        LuaStdLib::ALL_SAFE,
        LuaOptions::new().disable_error_userdata(true),
    )
    .expect("Failed to create Lua VM");

    // Register WASM-available plugins
    lua.register_module(
        "@antiraid/typesext",
        plugins::typesext::init_plugin(&lua).expect("Failed to init typesext plugin"),
    )
    .expect("Failed to register typesext plugin");
    lua.register_module(
        "@antiraid/interop",
        plugins::interop::init_plugin(&lua).expect("Failed to init interop plugin"),
    )
    .expect("Failed to register interop plugin");
    lua.register_module(
        "@antiraid/luau",
        plugins::luau::init_plugin(&lua).expect("Failed to init luau plugin"),
    )
    .expect("Failed to register luau plugin");
    lua.register_module(
        "@antiraid/datetime",
        plugins::datetime::init_plugin(&lua).expect("Failed to init datetime plugin"),
    )
    .expect("Failed to register datetime plugin");

    // Ensure require is removed from main global environment
    lua.globals()
        .set("require", LuaValue::Nil)
        .expect("Failed to remove require from globals");
    lua.sandbox(true).expect("Failed to sandbox Lua VM");

    let tab = proxyglobals::proxy_global(&lua)
        .expect("Failed to create global table");   
    let vfs = mluau_require::create_memory_vfs_from_map(&vfs).expect("Failed to create VFS from map");
    let controller = AssetRequirer::new(FilesystemWrapper::new(vfs), "main".to_string(), tab.clone());
    let require = lua.create_require_function(controller)
        .expect("Failed to create require function");
    tab
        .set("require", require.clone())
        .expect("Failed to set require function in global table");

    let proxy_require = lua.load("return require(...)")
        .set_environment(tab.clone())
        .set_name("/init.luau")
        .set_mode(mluau::ChunkMode::Text)
        .try_cache()
        .into_function()
        .expect("Failed to create init.luau function");

    VmData {
        vm: lua,
        global_tab: tab,
        proxy_require,
    }
}

/// Internal API to call Luau code with given VFS and ctx object
pub fn call_luau(vm_data: VmData, ctx: emscripten_val::Val) -> String {
    let init = vm_data.proxy_require.call::<LuaFunction>("./client")
        .expect("Failed to require ./client module");
    
    let value = init.call::<LuaMultiValue>(ContextObj { ctx })
    .expect("Failed to call ./client init function");

    let value_single = if value.len() == 0 {
        LuaValue::Nil
    } else if value.len() == 1 {
        value.into_iter().next().unwrap()
    } else {
        // only take out the first return value
        value.into_iter().next().unwrap()
    };

    vm_data.vm.from_value(value_single)
        .expect("Failed to convert return value to string")
}

pub struct ContextObj {
    pub ctx: emscripten_val::Val,
}

impl LuaUserData for ContextObj {
    fn add_methods<M: LuaUserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("call", |lua, this, (func_name, args): (String, LuaMultiValue)| {
            let vals = parse_lua_args(lua, args);
            let val_real = if vals.len() == 1 {
                vals
            } else {
                let arr = emscripten_val::Val::array();
                for val in vals {
                    arr.call("push", &[&val]);
                }
                vec![arr]
            };
            let vals_ref: Vec<&emscripten_val::Val> = val_real.iter().collect();
            this.ctx.call(&func_name, &vals_ref);
            Ok(())
        });
    }
}

fn parse_lua_args(lua: &Lua, args: LuaMultiValue) -> Vec<emscripten_val::Val> {
    let mut result = Vec::new();
    for arg in args.into_iter() {
        let parsed_vals = parse_lua_arg(lua, arg);
        result.push(parsed_vals);
    }
    result
}

fn parse_lua_arg(lua: &Lua, arg: LuaValue) -> emscripten_val::Val {
    match arg {
        LuaValue::Nil => emscripten_val::Val::null(),
        LuaValue::Boolean(b) => b.into(),
        LuaValue::Integer(i) => (i as f64).into(),
        LuaValue::Number(n) => n.into(),
        LuaValue::String(s) => {
            let str_val = s.to_str().expect("Failed to convert Lua string to Rust string");
            (str_val.to_string()).into()
        },
        LuaValue::Table(tab) => {
            if tab.metatable() == Some(lua.array_metatable()) {
                let arr = emscripten_val::Val::array();
                for pair in tab.sequence_values::<LuaValue>() {
                    if let Ok(value) = pair {
                        let parsed_val = parse_lua_arg(lua, value);
                        arr.call("push", &[&parsed_val]);
                    }
                }
                return arr;
            } else {
                let obj = emscripten_val::Val::object();
                for pair in tab.pairs::<LuaValue, LuaValue>() {
                    if let Ok((key, value)) = pair {
                        let key_str = match key {
                            LuaValue::String(s) => s.to_str().expect("Failed to convert Lua string to Rust string").to_string(),
                            LuaValue::Integer(i) => i.to_string(),
                            LuaValue::Number(n) => n.to_string(),
                            LuaValue::Boolean(b) => b.to_string(),
                            _ => panic!("Unsupported Lua table key type"),
                        };
                        let parsed_val = parse_lua_arg(lua, value);
                        obj.set(&key_str, &parsed_val);
                    }
                }
                return obj;
            }
        }
        _ => {
            panic!("Unsupported Lua argument type");
        }
    }
}