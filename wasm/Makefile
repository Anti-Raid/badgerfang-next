#      #-s ENVIRONMENT=web
# We use a stack size of 16MB as 10MB is the limit in the antiraid API itself and we want 
# a buffer
release:
	cargo build --release --target=wasm32-unknown-emscripten
	emcc \
     -s EXPORT_ALL=1 \
	 -s EXPORTED_FUNCTIONS=_test_wasm,_luau_template,_wasm_free_string \
     -s EXPORTED_RUNTIME_METHODS=ccall,cwrap,stackSave,stackRestore,UTF8ToString \
     -s MODULARIZE=1 \
     -s EXPORT_ES6=1 \
     -s ASSERTIONS \
     -s ENVIRONMENT=web \
     -s NO_DISABLE_EXCEPTION_CATCHING \
     -s DISABLE_EXCEPTION_CATCHING=0 \
     -s ALLOW_MEMORY_GROWTH=1 \
     -s STACK_SIZE=20MB \
     -fexceptions \
     -flto \
     -Oz --no-entry \
     -L target/wasm32-unknown-emscripten/release \
     -lwasm \
     -o wasm.js

copy:
	cp wasm.js ../public/wasm/wasm.js
	cp wasm.wasm ../public/wasm/wasm.wasm
