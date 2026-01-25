import { type, scope } from 'arktype';

// Create a recursive type using arktype scope with proper syntax
const $ = scope({
	textInput: {
		type: "'text'",
		id: 'string',
		label: 'string',
		description: 'string?',
		value: 'string',
		readonly: 'boolean?',
		placeholder: 'string?',
		minLength: 'number?',
		maxLength: 'number?',
		suggestions: 'string[]?'
	},
	numberInput: {
		type: "'number'",
		id: 'string',
		label: 'string',
		description: 'string?',
		value: 'number',
		readonly: 'boolean?',
		placeholder: 'string?',
		min: 'number?',
		max: 'number?'
	},
	selectInput: {
		type: "'select'",
		id: 'string',
		label: 'string',
		description: 'string?',
		value: 'string',
		readonly: 'boolean?',
		options: 'string[]'
	},
	checkboxInput: {
		type: "'checkbox'",
		id: 'string',
		label: 'string',
		description: 'string?',
		value: 'boolean',
		readonly: 'boolean?'
	},
	arrayInput: {
		type: "'array'",
		id: 'string',
		label: 'string',
		description: 'string?',
		children: 'input[]'
	},
	input: 'textInput | numberInput | selectInput | checkboxInput | arrayInput'
});

export const InputSchema = $.type('input');

export type Input = typeof InputSchema.infer;

const testInput: Input = {
	type: 'array',
	id: '',
	label: 'Root',
	children: [
		{
			type: 'text',
			id: 'username',
			label: 'Username',
			placeholder: 'Enter your username',
			value: ''
		}
	]
};
