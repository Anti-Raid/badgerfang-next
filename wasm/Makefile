debug:
	cargo build --target=wasm32-unknown-emscripten
	emcc \
	 -s EXPORTED_FUNCTIONS=_test_wasm,_luau_template \
     -s EXPORTED_RUNTIME_METHODS=ccall,cwrap \
     -s MODULARIZE=1 \
     -s EXPORT_ES6=1 \
     -s ASSERTIONS \
     -s NO_DISABLE_EXCEPTION_CATCHING \
     -s ALLOW_MEMORY_GROWTH=1 \
	 -O3 --no-entry \
     -L target/wasm32-unknown-emscripten/debug \
     -lwasm \
     -o wasm.js

release:
	cargo build --release --target=wasm32-unknown-emscripten
	emcc \
	 -s EXPORTED_FUNCTIONS=_test_wasm,_luau_template \
     -s EXPORTED_RUNTIME_METHODS=ccall,cwrap \
     -s MODULARIZE=1 \
     -s EXPORT_ES6=1 \
     -s ASSERTIONS \
     -s NO_DISABLE_EXCEPTION_CATCHING \
     -s ALLOW_MEMORY_GROWTH=1 \
	 -O3 --no-entry \
     -L target/wasm32-unknown-emscripten/release \
     -lwasm \
     -o wasm.js