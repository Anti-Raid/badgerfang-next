import { z } from 'zod';
import { InputSchema } from './input';

const DrawCmdHeaderSchema = z.object({
	type: z.literal('header'),
	title: z.string()
});

const DrawCmdParagraphSchema = z.object({
	type: z.literal('paragraph'),
	text: z.string()
});

const DrawCmdInputSchema = z.object({
	type: z.literal('input'),
	input: InputSchema
});

const DrawCmdFormButton = z.object({
	type: z.literal('submit'),
	label: z.string()
});

const DrawCmdBaseFormSchema = z.object({
	id: z.string(),
	label: z.string(),
	commands: z.array(
		z.discriminatedUnion('type', [
			DrawCmdInputSchema, // inputs can only appear within a form (at least for now)
			DrawCmdHeaderSchema,
			DrawCmdParagraphSchema
		])
	),
	submitButton: DrawCmdFormButton.optional(),
	cancelButton: DrawCmdFormButton.optional(),
	delete: z
		.object({
			ariaLabel: z.string()
		})
		.optional()
});

const DrawCmdFormListSchema = z.object({
	type: z.literal('formlist'),
	id: z.string(),
	title: z.string(),
	forms: z.array(DrawCmdBaseFormSchema), // the forms to chain together to make the list
	createForm: DrawCmdBaseFormSchema.optional(), // the form to use for creating new entries, create is disabled if not present
	description: z.string().optional(),
	reorderable: z.boolean().optional(),
	defaultOpen: z.boolean().optional(),
	icon: z.string().optional() // icon to use for the form list
});

export const DrawCmd = z.discriminatedUnion('type', [
	//DrawCmdFormSchema,
	DrawCmdFormListSchema,
	DrawCmdHeaderSchema,
	DrawCmdParagraphSchema
]);

export type DrawCmd = z.infer<typeof DrawCmd>;
export type DrawCmdInput = z.infer<typeof DrawCmdInputSchema>;
export type DrawCmdForm = z.infer<typeof DrawCmdBaseFormSchema>;
export type DrawCmdFormList = z.infer<typeof DrawCmdFormListSchema>;
export type DrawCmdHeader = z.infer<typeof DrawCmdHeaderSchema>;
export type DrawCmdParagraph = z.infer<typeof DrawCmdParagraphSchema>;
