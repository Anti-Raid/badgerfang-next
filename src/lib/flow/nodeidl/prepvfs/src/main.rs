use mluau::prelude::*;
use std::fs::{read, read_dir};
use std::ffi::OsStr;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use std::rc::Rc;
use std::path::PathBuf;

fn main() {
    let dirname = &std::env::args().into_iter().nth(1).expect("Dirname not provided as arg #1");

    let lua = Lua::new_with(
        LuaStdLib::ALL_SAFE,
        LuaOptions::new().disable_error_userdata(true),
    )
    .expect("Failed to create Lua VM");

    let mut vfs = HashMap::new();
    let mut nodes = HashMap::new();

    for file in read_dir(dirname).expect("Failed to read dir") {
        let file = file.expect("Failed to extract file from dir");
        if file.file_type().expect("Failed to get file type").is_dir() {
            continue;
        }
        if file.path().extension() != Some(OsStr::new("luau")) {
            continue;
        }

        let file_contents = read(file.path()).expect("Failed to read file");
        
        println!("[DEBUG] Adding luau file to tvfs: {fp}", fp=file.path().display());
        vfs.insert(file.file_name(), file_contents);
    }

    let vfs = Rc::new(vfs);
    let vfs_ref = vfs.clone();
    lua.globals()
    .set(
        "require", 
        lua.create_function(move |_lua, filename: String| {
            let mut pb = PathBuf::from(filename.trim_start_matches("./"));
            pb.set_extension("luau");

            let Some(data) = vfs_ref.get(&pb.into_os_string()) else {
                return Err(LuaError::external(format!("could not find `{filename}` in VFS.")));
            };
            
            let pb_str = String::from_utf8_lossy(&data);
            Ok(pb_str.into_owned())
        }).expect("Failed to set custom require api")
    )
    .expect("Failed to set custom require function to globals");

    for (file_name, file_contents) in vfs.iter() {
        if file_name.display().to_string().ends_with(".node.luau") {
            println!("Generating node from file {fp}", fp=file_name.display());

            let result = lua
            .load(file_contents)
            .set_name("luau_template")
            .call::<LuaValue>(())
            .expect("Failed to execute Lua code");

            if result.is_nil() {
                panic!("node did not return anything");
            }

            let result = lua.from_value::<Node>(result).expect("Failed to parse luau result to a nodeidl node");
            nodes.insert(result.id.clone(), result);
        }
    }
}

// NodeIDL

#[derive(Debug, Serialize, Deserialize)]
pub struct GroupData {
    #[serde(rename = "shortname")]
    pub short_name: String,
    pub id: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FieldData {
    #[serde(rename = "shortname")]
    pub short_name: String,
    pub id: String,
    pub description: String,
    #[serde(rename = "type")]
    pub type_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Field {
    Scalar {
        data: FieldData,
        optional: bool,
    },
    Array {
        #[serde(rename = "elementType")]
        element_type: Box<Field>,
        optional: bool,
    },
    Group {
        fields: Vec<Field>,
        #[serde(rename = "groupData")]
        group_data: GroupData,
        optional: bool,
    },
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")] 
pub enum HandlePosition {
    Top, // top handle
    Bottom, // bottom handle
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Handles {
    pub allow: Vec<HandlePosition>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FlowUI {
    pub handles: Handles,
    pub input: Field,
    pub output: Field,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Node {
    pub id: String,
    #[serde(rename = "shortname")]
    pub short_name: String,
    pub description: String,
    #[serde(rename = "flowui")]
    pub flow_ui: FlowUI,
}