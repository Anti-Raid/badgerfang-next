//go:build js && wasm

package main

import (
	"bytes"
	"fmt"
	"syscall/js"

	iblfile "github.com/anti-raid/iblfile/go"
	aes256 "github.com/anti-raid/iblfile/go/encryptors/aes256"
	noencryption "github.com/anti-raid/iblfile/go/encryptors/noencryption"
)

func parse(data []byte, pass string) ([]byte, error) {
	var encryptor iblfile.AutoEncryptor
	if pass == "" {
		encryptor = noencryption.NoEncryptionSource{}
	} else {
		encryptor = aes256.AES256Source{
			EncryptionKey: pass,
		}
	}

	iblfile, err := iblfile.OpenAutoEncryptedFile_FullFile(bytes.NewReader(data), encryptor)

	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}

	sections, err := iblfile.Sections()

	if err != nil {
		return nil, fmt.Errorf("failed to get sections: %w", err)
	}

	for k := range sections {
		fmt.Println("Found section:", k)
	}

	fmt.Println(iblfile.Size())
	return []byte{0, 1, 2, 3}, nil
}

func main() {
	js.Global().Set("_wasm_parse", js.FuncOf(func(this js.Value, args []js.Value) any {
		// Assuming args[0] is the data as a Uint8Array and args[1] is the password as a string
		if len(args) < 2 {
			return js.ValueOf("ERR: INVALID_ARGUMENTS - Expected 2 arguments: data and password")
		}

		// Convert data to a []byte from a Uint8Array
		if !args[0].InstanceOf(js.Global().Get("Uint8Array")) {
			return js.ValueOf("ERR: INVALID_ARGUMENTS - First argument must be a Uint8Array")
		}
		dataArray := js.Global().Get("Uint8Array").New(args[0])
		data := make([]byte, dataArray.Length())
		js.CopyBytesToGo(data, dataArray)

		pass := args[1].String()
		result, err := parse(data, pass)

		if err != nil {
			return js.ValueOf(fmt.Sprintf("ERR: %s", err.Error()))
		}

		// Convert the result back to a Uint8Array
		resultArray := js.Global().Get("Uint8Array").New(len(result))
		js.CopyBytesToJS(resultArray, result)
		return resultArray
	}))

	// Keep the Go program running to allow JavaScript to call exported functions
	select {}
}
