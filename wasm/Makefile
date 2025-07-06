#      #-s ENVIRONMENT=web
release:
	cargo build --release --target=wasm32-unknown-emscripten
	emcc \
     -s EXPORT_ALL=1 \
	 -s EXPORTED_FUNCTIONS=_test_wasm,_luau_template \
     -s EXPORTED_RUNTIME_METHODS=ccall,cwrap,stackSave,stackRestore,UTF8ToString \
     -s MODULARIZE=1 \
     -s EXPORT_ES6=1 \
     -s ASSERTIONS \
     -s ENVIRONMENT=web \
     -s NO_DISABLE_EXCEPTION_CATCHING \
     -s DISABLE_EXCEPTION_CATCHING=0 \
     -s ALLOW_MEMORY_GROWTH=1 \
     -fexceptions \
     -flto \
     -O3 --no-entry \
     -L target/wasm32-unknown-emscripten/release \
     -lwasm \
     -o wasm.js

copy:
	cp wasm.js ../public/wasm/wasm.js
	cp wasm.wasm ../public/wasm/wasm.wasm
