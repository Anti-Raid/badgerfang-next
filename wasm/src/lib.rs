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

#[unsafe(no_mangle)]
pub extern "C" fn test_wasm() -> i32 {
    return 42;
}

// Tiny glue code to collect arguments from JS as a JSON string
// 1 - general error
// 2 - luau error
// 0 - success 
#[unsafe(no_mangle)]
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
        .call::<LuaValue>(lua_value)
        .map_err(|e| format!("Failed to execute Lua code: {}", e))?;

    let result_value = vm_result.vm.from_value(result)
        .map_err(|e| format!("Failed to convert Lua value to JSON value: {}", e))?;

    Ok(result_value)
}