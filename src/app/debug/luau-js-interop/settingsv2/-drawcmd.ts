import { type, scope } from 'arktype';
import { InputSchema } from './-input';

// Create a scope for handling all the draw command types
const $ = scope({
	header: {
		type: "'header'",
		title: 'string'
	},
	paragraph: {
		type: "'paragraph'",
		text: 'string'
	},
	button: {
		type: "'submit'",
		label: 'string'
	},
	input: {
		type: "'input'",
		input: InputSchema
	},
	command: 'input | header | paragraph',
	deleteButton: {
		ariaLabel: 'string'
	},
	form: {
		id: 'string',
		label: 'string',
		commands: 'command[]',
		submitButton: 'button?',
		cancelButton: 'button?',
		delete: 'deleteButton?'
	},
	formlist: {
		type: "'formlist'",
		id: 'string',
		title: 'string',
		forms: 'form[]',
		createForm: 'form?',
		description: 'string?',
		reorderable: 'boolean?',
		defaultOpen: 'boolean?',
		icon: 'string?'
	},
	drawCmd: 'formlist | header | paragraph'
});

const DrawCmdHeaderSchema = $.type('header');
const DrawCmdParagraphSchema = $.type('paragraph');
const DrawCmdInputSchema = $.type('input');
const DrawCmdFormButton = $.type('button');
const DrawCmdBaseFormSchema = $.type('form');
const DrawCmdFormListSchema = $.type('formlist');

export const DrawCmd = $.type('drawCmd');
export const DrawCmdList = $.type('drawCmd[]');

export type DrawCmd = typeof DrawCmd.infer;
export type DrawCmdInput = typeof DrawCmdInputSchema.infer;
export type DrawCmdForm = typeof DrawCmdBaseFormSchema.infer;
export type DrawCmdFormList = typeof DrawCmdFormListSchema.infer;
export type DrawCmdHeader = typeof DrawCmdHeaderSchema.infer;
export type DrawCmdParagraph = typeof DrawCmdParagraphSchema.infer;
