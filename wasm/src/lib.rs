mod proxyglobals;

use serde_json::Value;
use std::ffi::{CStr, CString};
use std::ffi::c_char;
use mlua::prelude::*;
use std::sync::OnceLock;

pub struct VmData {
    pub vm: Lua,
    pub globals: LuaTable,
}

// While technically not Send/Sync, WASM is single-threaded
unsafe impl Send for VmData {}
unsafe impl Sync for VmData {}

pub static VM: OnceLock<VmData> = OnceLock::new();

/// Returns the integer 42 as a test value.
///
/// This function is intended to verify that the WebAssembly module is callable from the host environment.
///
/// # Examples
///
/// ```
/// let result = unsafe { test_wasm() };
/// assert_eq!(result, 42);
/// ```
#[unsafe(no_mangle)]
pub extern "C" fn test_wasm() -> i32 {
    return 42;
}

// Tiny glue code to collect arguments from JS as a JSON string
// 1 - general error
// 2 - luau error
// 0 - success 
//
// Note that the returned value must be freed by the caller using `_free`
/// Executes Lua code with JSON input and returns the result as a JSON string via a C-compatible interface.
///
/// Accepts two C strings: Lua code and a JSON-encoded argument. Executes the Lua code in a sandboxed VM with the provided JSON value as input, then serializes the result to JSON and returns it as a newly allocated C string. The returned string is prefixed with a status code: `"0"` for success, `"1"` for general errors (e.g., null pointers, invalid UTF-8, JSON parse/serialization errors), and `"2"` for Lua execution errors. The caller is responsible for freeing the returned string.
///
/// # Safety
///
/// Both `code` and `json` must be valid, null-terminated C strings. The returned pointer must be freed by the caller using the appropriate deallocation function.
///
/// # Examples
///
/// ```c
/// // Example usage from C (pseudo-code)
/// const char* lua_code = "return arg + 1";
/// const char* json_arg = "41";
/// char* result = luau_template(lua_code, json_arg);
/// // result now points to a string like "042"
/// // ... use result ...
/// free(result);
/// ```
pub extern "C" fn luau_template(code: *const c_char, json: *const c_char) -> *mut c_char {
    if code.is_null() {
        let c_string = CString::new("1got null code").unwrap();
        return c_string.into_raw();
    }

    if json.is_null() {
        let c_string = CString::new("1got null json").unwrap();
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

    let value = match serde_json::from_str::<Value>(json_str) {
        Ok(value) => value, 
        Err(e) => {
            let c_string = CString::new(format!("1json parse error: {}", e)).unwrap();
            return c_string.into_raw();
        }
    };

    let result = match call_luau(code_str.to_string(), value) {
        Ok(result) => result,
        Err(e) => {
            let c_string = CString::new(format!("2{}", e)).unwrap();
            return c_string.into_raw();
        }
    };

    let json_str = match serde_json::to_string(&result) {
        Ok(json_str) => json_str,
        Err(e) => {
            let c_string = CString::new(format!("1json serialization error: {}", e)).unwrap();
            return c_string.into_raw();
        }
    };

    let Ok(c_string) = CString::new(format!("0{}", json_str)) else {
        let c_string = CString::new("1json serialization error: contains null bytes").unwrap();
        return c_string.into_raw();
    };

    return c_string.into_raw();  
}

type Error = Box<dyn std::error::Error + Send + Sync>;

/// Executes Lua code in a sandboxed VM with JSON input and returns the result as JSON.
///
/// Converts the provided JSON value to a Lua value, runs the given Lua code in a persistent, sandboxed Lua VM with a proxy global environment, and collects all returned Lua values. The results are converted back to JSON; if there is a single result, it is returned directly, otherwise an array of results is returned.
///
/// # Parameters
/// - `code`: The Lua code to execute.
/// - `value`: The JSON value to pass as an argument to the Lua code.
///
/// # Returns
/// - `Ok(Value)`: The result of the Lua execution as a JSON value or array of values.
/// - `Err(Error)`: If conversion or execution fails, returns an error with a descriptive message.
///
/// # Examples
///
/// ```
/// use serde_json::json;
/// let code = "return arg * 2".to_string();
/// let input = json!(21);
/// let result = call_luau(code, input).unwrap();
/// assert_eq!(result, json!(42));
/// ```
pub fn call_luau(code: String, value: Value) -> Result<Value, Error> {
    let vm_result = VM.get_or_init(|| {
        let lua = Lua::new_with(LuaStdLib::ALL_SAFE, LuaOptions::new().disable_error_userdata(true)).expect("Failed to create Lua VM");
        let global_tab = proxyglobals::proxy_global(&lua).expect("Failed to create proxy global table");
        lua.sandbox(true).expect("Failed to sandbox Lua VM");

        VmData {
            vm: lua,
            globals: global_tab,
        }
    });

    let lua_value = vm_result.vm.to_value(&value)
        .map_err(|e| format!("Failed to convert JSON value to Lua value: {}", e))?;

    let result = vm_result.vm.load(code)
        .set_environment(vm_result.globals.clone())
        .set_name("luau_template")
        .call::<LuaMultiValue>(lua_value)
        .map_err(|e| format!("Failed to execute Lua code: {}", e))?;

    let mut results = Vec::with_capacity(result.len());
    for val in result {
        let converted = vm_result.vm.from_value(val)
            .map_err(|e| format!("Failed to convert Lua value to JSON value: {}", e))?;
        results.push(converted);
    }

    if results.len() == 1 {
        return Ok(results.remove(0));
    }

    Ok(Value::Array(results))
}