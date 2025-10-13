#!/usr/bin/env node --no-warnings

// Program to dynamically load and validate .dnode.json5 files
import JSON5 from 'json5';
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { DModel, ImportStorage, DNode, extractTypeFromFileName, type ImportResolver } from './dnodec_cls.ts';

 
if (typeof process === 'undefined') { 
    throw new Error("dnodevalidator can only be loaded in a Node.js environment.");
}

let fileName = ""
if (process.argv.length < 3) {
    console.error("Usage: ./dnodevalidator <input file>");
    process.exit(1);
}

fileName = process.argv[2];

let nodeFileName = fileName;
if (extractTypeFromFileName(fileName) !== "dnode") {
    throw new Error("Input file must be a .dnode.json5 file.");
}
let nodeFileContent = readFileSync(fileName, { encoding: 'utf-8' });

let dir = dirname(fileName)
let importResolver: ImportResolver = {
    resolve: (modpath: string): any => {
        let file = `${modpath}.json5`;
        if (extractTypeFromFileName(file) !== "dmodel") {
            throw new Error("Imported model files must be a .dmodel.json5 file.");
        }

        let importedFileContent: string;
        try {
            importedFileContent = readFileSync(`${dir}/${file}`, { encoding: 'utf-8' });
        } catch (e) {
            throw new Error(`Failed to read import file ${file}: ${(e as Error).message}`);
        }

        let importedJson: any;
        try {
            importedJson = JSON5.parse(importedFileContent);
        } catch (e) {
            throw new Error(`Failed to parse dmodel ${file}: ${(e as Error).message}`);
        }

        return importedJson;

    }
}

let importStorage = new ImportStorage(importResolver);

let importedJson: any;
try {
    importedJson = JSON5.parse(nodeFileContent);
} catch (e) {
    throw new Error(`Failed to parse dnode ${nodeFileName}: ${(e as Error).message}`);
}

DNode.fromJSON(importedJson, importStorage, nodeFileName);
