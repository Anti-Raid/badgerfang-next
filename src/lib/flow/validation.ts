import { type } from 'arktype';
import { CommandArgumentType } from './data';

const commandNameRegex = /^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/gu;
const commandArgNameRegex = /^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/gu;

export const sharedNodeDataSchema = type({
	'comment?': 'string'
});

export const baseCommandNodeSchema = type({
	'comment?': 'string',
	name: 'string',
	description: 'string'
}).pipe((data) => {
	// Validate name length
	if (!data.name || data.name.length < 1 || data.name.length > 32) {
		throw new Error('Command name must be between 1 and 32 characters');
	}

	// Validate description length
	if (!data.description || data.description.length < 1 || data.description.length > 100) {
		throw new Error('Description must be between 1 and 100 characters');
	}

	// Validate command name format
	if (data.name) {
		const split = data.name.split(' ');
		if (split.length > 3) {
			throw new Error(
				'Command name can have at most 3 words (base command, subcommand, subcommand group)'
			);
		}

		for (const word of split) {
			commandNameRegex.lastIndex = 0; // Reset regex
			if (!commandNameRegex.test(word)) {
				throw new Error(
					`Each part of a command name must be only lowercase alphanumeric characters and underscores: ${word}`
				);
			}
		}
	}

	return data;
});

const commandArgTypeUnion = `"${Object.values(CommandArgumentType).join('" | "')}"` as const;

export const commandArgumentNodeSchema = type({
	'comment?': 'string',
	command_argument_type: commandArgTypeUnion,
	command_argument_name: 'string',
	'command_argument_description?': 'string',
	command_argument_required: 'boolean'
}).pipe((data) => {
	// Validate argument name length
	if (
		!data.command_argument_name ||
		data.command_argument_name.length < 1 ||
		data.command_argument_name.length > 32
	) {
		throw new Error('Argument name must be between 1 and 32 characters');
	}

	// Validate argument name format
	if (data.command_argument_name) {
		commandArgNameRegex.lastIndex = 0; // Reset regex
		if (!commandArgNameRegex.test(data.command_argument_name)) {
			throw new Error('Must be only lowercase alphanumeric characters and underscores');
		}
	}

	// Validate description length
	if (data.command_argument_description && data.command_argument_description.length > 100) {
		throw new Error('Argument description must be at most 100 characters');
	}

	return data;
});

export const variableSetNodeSchema = type({
	'comment?': 'string',
	'name?': 'string',
	'value?': 'string'
}).pipe((data) => {
	if (data.name && data.name.length < 1) {
		throw new Error('Name must be at least 1 character');
	}
	if (data.value && data.value.length < 1) {
		throw new Error('Value must be at least 1 character');
	}
	return data;
});

export const forLoopNodeSchema = type({
	'comment?': 'string',
	condition: 'string'
}).pipe((data) => {
	if (!data.condition || data.condition.length < 1) {
		throw new Error('Condition must be at least 1 character');
	}
	return data;
});

export const ifConditionNodeSchema = type({
	'comment?': 'string',
	condition: 'string'
}).pipe((data) => {
	if (!data.condition || data.condition.length < 1) {
		throw new Error('Condition must be at least 1 character');
	}
	return data;
});
