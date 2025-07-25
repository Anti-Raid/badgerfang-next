// This sets window.Go
require("./wasm-backupmigrator")

const go = new Go();

const loadWasm = async () => {
    // For browsers
    if (typeof window !== "undefined") {
        await WebAssembly.instantiateStreaming("./wasm-backupmigrator.wasm", go.importObject).then((result) => {
            go.run(result.instance);
        });
        return window._wasm_parse;
    }

    // For Node.js
    const fs = require("node:fs");
    const wasmBuffer = fs.readFileSync("./wasm-backupmigrator.wasm");
    await WebAssembly.instantiate(wasmBuffer, go.importObject).then((result) => {
        go.run(result.instance);
    });
    return globalThis._wasm_parse;
}

// NodeJS test
loadWasm().then((wasmParse) => {
    const fs = require("node:fs");
    let testFile = fs.readFileSync("./test.iblfile");
    // Convert testFile to a Uint8Array
    let testFileString = new Uint8Array(testFile);
    const res = wasmParse(testFileString, "");

    if (typeof res === "string") {
        console.error("Error parsing file:", res);
        return;
    }

    console.log("Parsed file successfully:", res);
})
