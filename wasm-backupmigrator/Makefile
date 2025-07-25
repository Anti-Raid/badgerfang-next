GOROOT := $(shell go env GOROOT)
all:
	GOOS=js GOARCH=wasm go build -v -o wasm-backupmigrator.wasm main.go
	cp "$(GOROOT)/lib/wasm/wasm_exec.js" wasm-backupmigrator.js
