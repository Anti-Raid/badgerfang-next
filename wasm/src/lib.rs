mod plugins;
mod proxyglobals;

use mluau::prelude::*;
use serde_json::Value;
use std::cell::RefCell;
use std::collections::HashMap;
use std::ffi::c_char;
use std::ffi::{CStr, CString};
use std::sync::OnceLock;

pub struct VmData {
    pub vm: Lua,
    pub envs: RefCell<HashMap<String, LuaTable>>,
}

// While technically not Send/Sync, WASM is single-threaded
unsafe impl Send for VmData {}
unsafe impl Sync for VmData {}

pub static VM: OnceLock<VmData> = OnceLock::new();

#[unsafe(no_mangle)]
pub extern "C" fn test_wasm() -> i32 {
    42
}

// Tiny glue code to collect arguments from JS as a JSON string
// 1 - general error
// 2 - luau error
// 0 - success
//
// Note that the returned value must be freed by the caller using `_free`
#[allow(clippy::not_unsafe_ptr_arg_deref)] // SAFETY: This is a C ABI function, so we can't use Rust's safety checks
/// Execute a Luau code chunk with JSON input and a virtual file system, returning a status-prefixed JSON result as a newly allocated C string.
///
/// The function expects four null-terminated UTF-8 C strings:
/// - `code`: Luau source code to execute.
/// - `json`: JSON value passed as the single argument to the chunk.
/// - `env`: environment key used to select or create a per-env globals table.
/// - `vfs`: JSON object mapping virtual file paths to file contents (string-to-string).
///
/// The returned pointer is a C-allocated string the caller must free with `wasm_free_string`.
/// The string starts with a single status byte followed by payload text:
/// - `'0'` — success; payload is the JSON-serialized result value.
/// - `'1'` — input/serialization/UTF-8 error; payload is an error message.
/// - `'2'` — runtime error while executing Luau; payload is the error message.
///
/// # Examples
///
/// ```
/// use std::ffi::CString;
///
/// let code = CString::new("return 42").unwrap();
/// let json = CString::new("null").unwrap();
/// let env = CString::new("default").unwrap();
/// let vfs = CString::new("{}").unwrap();
///
/// let ptr = unsafe { luau_template(code.as_ptr(), json.as_ptr(), env.as_ptr(), vfs.as_ptr()) };
/// assert!(!ptr.is_null());
///
/// let s = unsafe { std::ffi::CStr::from_ptr(ptr) }.to_str().unwrap();
/// assert!(s.starts_with('0')); // success status
///
/// // free the allocated string
/// unsafe { wasm_free_string(ptr) };
/// ```
#[unsafe(no_mangle)]
pub extern "C" fn luau_template(
    code: *const c_char,
    json: *const c_char,
    env: *const c_char,
    vfs: *const c_char,
) -> *mut c_char {
    if code.is_null() {
        let c_string = CString::new("1got null code").unwrap();
        return c_string.into_raw();
    }

    if json.is_null() {
        let c_string = CString::new("1got null json").unwrap();
        return c_string.into_raw();
    }

    if env.is_null() {
        let c_string = CString::new("1got null env").unwrap();
        return c_string.into_raw();
    }

    if vfs.is_null() {
        let c_string = CString::new("1got null vfs").unwrap();
        return c_string.into_raw();
    }

    let c_str = unsafe { CStr::from_ptr(code) };
    let Ok(code_str) = c_str.to_str() else {
        let c_string = CString::new("1code has utf8 code sequences").unwrap();
        return c_string.into_raw();
    };

    let c_str = unsafe { CStr::from_ptr(json) };
    let Ok(json_str) = c_str.to_str() else {
        let c_string = CString::new("1json has utf8 code sequences").unwrap();
        return c_string.into_raw();
    };

    let c_str = unsafe { CStr::from_ptr(env) };
    let Ok(env_str) = c_str.to_str() else {
        let c_string = CString::new("1env has utf8 code sequences").unwrap();
        return c_string.into_raw();
    };

    let c_str = unsafe { CStr::from_ptr(vfs) };
    let Ok(vfs_str) = c_str.to_str() else {
        let c_string = CString::new("1vfs has utf8 code sequences").unwrap();
        return c_string.into_raw();
    };

    let value = match serde_json::from_str::<Value>(json_str) {
        Ok(value) => value,
        Err(e) => {
            let c_string = CString::new(format!("1json parse error: {e}")).unwrap();
            return c_string.into_raw();
        }
    };

    let vfs = match serde_json::from_str::<HashMap<String, String>>(vfs_str) {
        Ok(value) => value,
        Err(e) => {
            let c_string = CString::new(format!("1vfs parse error: {e}")).unwrap();
            return c_string.into_raw();
        }
    };

    let result = match call_luau(code_str.to_string(), value, vfs, env_str.to_string()) {
        Ok(result) => result,
        Err(e) => {
            let c_string = CString::new(format!("2{e}")).unwrap();
            return c_string.into_raw();
        }
    };

    let json_str = match serde_json::to_string(&result) {
        Ok(json_str) => json_str,
        Err(e) => {
            let c_string = CString::new(format!("1json serialization error: {e}")).unwrap();
            return c_string.into_raw();
        }
    };

    let Ok(c_string) = CString::new(format!("0{json_str}")) else {
        let c_string = CString::new("1json serialization error: contains null bytes").unwrap();
        return c_string.into_raw();
    };

    c_string.into_raw()
}

/// Currently unused function to free a output string allocated by Rust.
/// # Safety
/// This function is explicitly only for internal use by the WASM module.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn wasm_free_string(ptr: *mut c_char) {
    if ptr.is_null() {
        return;
    }
    unsafe {
        let _ = CString::from_raw(ptr);
    }
    // The CString will be dropped here, freeing the memory
}

type Error = Box<dyn std::error::Error + Send + Sync>;

/// Execute Luau code inside the persistent, sandboxed VM and return its result as JSON.
///
/// The provided `value` is converted to a Lua value and passed as the chunk's single argument.
/// The chunk is executed with a per-`env` global table (created on first use) and has access to
/// files provided via `vfs` (a mapping of virtual paths to file contents).
///
/// # Parameters
///
/// - `code`: Luau source code to load and execute.
/// - `value`: Input JSON value that will be passed to the chunk as its argument.
/// - `vfs`: Virtual file system map accessible to the execution environment.
/// - `env`: Identifier for the environment whose globals will back the chunk's global table.
///
/// # Returns
///
/// The JSON representation of the Lua return values: the single value if the chunk returned one
/// value, otherwise an array containing all returned values.
///
/// # Examples
///
/// ```
/// use serde_json::json;
/// use std::collections::HashMap;
///
/// // Execute a chunk that returns the passed-in value doubled.
/// let code = "local x = ...; return x * 2".to_string();
/// let input = json!(21);
/// let vfs = HashMap::new();
/// let env = "default".to_string();
///
/// let result = call_luau(code, input, vfs, env).expect("execution failed");
/// assert_eq!(result, json!(42));
/// ```
pub fn call_luau(code: String, value: Value, vfs: HashMap<String, String>, env: String) -> Result<Value, Error> {
    let vm_result = VM.get_or_init(|| {
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

        lua.sandbox(true).expect("Failed to sandbox Lua VM");

        VmData {
            vm: lua,
            envs: RefCell::new(HashMap::new()),
        }
    });

    let global_tab = {
        let mut envs = vm_result.envs.borrow_mut();
        match envs.get(&env) {
            Some(tab) => tab.clone(),
            None => {
                let tab = proxyglobals::proxy_global(&vm_result.vm)
                    .map_err(|e| format!("Failed to create global table: {e}"))?;
                envs.insert(env, tab.clone());
                tab
            }
        }
    };

    let lua_value = vm_result
        .vm
        .to_value(&value)
        .map_err(|e| format!("Failed to convert JSON value to Lua value: {e}"))?;

    let result = vm_result
        .vm
        .load(code)
        .set_environment(global_tab)
        .set_name("luau_template")
        .call::<LuaMultiValue>(lua_value)
        .map_err(|e| format!("Failed to execute Lua code: {e}"))?;

    let mut results = Vec::with_capacity(result.len());
    for val in result {
        let converted = vm_result
            .vm
            .from_value(val)
            .map_err(|e| format!("Failed to convert Lua value to JSON value: {e}"))?;
        results.push(converted);
    }

    if results.len() == 1 {
        return Ok(results.remove(0));
    }

    Ok(Value::Array(results))
}