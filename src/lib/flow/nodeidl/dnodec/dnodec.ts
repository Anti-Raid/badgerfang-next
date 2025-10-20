#!/usr/bin/env node --no-warnings

// Program to dynamically load and validate .dnode.yaml files
import { parse as parseYaml } from 'yaml';
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { DModel, ImportStorage, DNode, type ImportResolver } from './dnodec_cls.ts';

/**
 * Given a DNode file name, extract the DNode type.
 * @param fileName The file name
 * @returns The extracted DNode type from the file name
 */
export const extractTypeFromFileName = (fileName: string): string => {
	if (!fileName.endsWith('.yaml')) {
		throw new Error('Input file must be a .yaml file.');
	}
	const parts = fileName.split('.');
	return parts[parts.length - 2];
};

if (typeof process === 'undefined') {
	throw new Error('dnodevalidator can only be loaded in a Node.js environment.');
}

let fileName = '';
if (process.argv.length < 3) {
	console.error('Usage: ./dnodevalidator <input file>');
	process.exit(1);
}

fileName = process.argv[2];

let nodeFileName = fileName;
if (extractTypeFromFileName(fileName) !== 'dnode') {
	throw new Error('Input file must be a .dnode.yaml file.');
}
let nodeFileContent = readFileSync(fileName, { encoding: 'utf-8' });

let dir = dirname(fileName);
let importResolver: ImportResolver = {
	resolve: (modpath: string): any => {
		let file = `${modpath}.yaml`;
		if (extractTypeFromFileName(file) !== 'dmodel') {
			throw new Error('Imported model files must be a .dmodel.yaml file.');
		}

		let importedFileContent: string;
		try {
			importedFileContent = readFileSync(`${dir}/${file}`, { encoding: 'utf-8' });
		} catch (e) {
			throw new Error(`Failed to read import file ${file}: ${(e as Error).message}`);
		}

		let importedJson: any;
		try {
			importedJson = parseYaml(importedFileContent);
		} catch (e) {
			throw new Error(`Failed to parse dmodel ${file}: ${(e as Error).message}`);
		}

		return importedJson;
	}
};

let importStorage = new ImportStorage(importResolver);

let importedJson: any;
try {
	importedJson = parseYaml(nodeFileContent);
} catch (e) {
	throw new Error(`Failed to parse dnode ${nodeFileName}: ${(e as Error).message}`);
}

let dnode = DNode.fromJSON(importedJson, importStorage, nodeFileName);

console.log(JSON.stringify(dnode));
