import { z } from "zod";

const TextInputSchema = z.object({
    type: z.literal("text"),
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
    value: z.string(),
    readonly: z.boolean().optional(),
    placeholder: z.string().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    suggestions: z.array(z.string()).optional(),
});

const NumberInputSchema = z.object({
    type: z.literal("number"),
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
    value: z.number(),
    readonly: z.boolean().optional(),
    placeholder: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
});

const SelectInputSchema = z.object({
    type: z.literal("select"),
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
    value: z.string(),
    readonly: z.boolean().optional(),
    options: z.array(z.string()),
});

const CheckboxInputSchema = z.object({
    type: z.literal("checkbox"),
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
    value: z.boolean(),
    readonly: z.boolean().optional(),
});

const InputArraySchema = z.object({
    type: z.literal("array"),
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
    // The children field will be added later using z.lazy()
});

type BaseInput = z.infer<typeof TextInputSchema> | z.infer<typeof NumberInputSchema> | z.infer<typeof SelectInputSchema> | z.infer<typeof CheckboxInputSchema> | (z.infer<typeof InputArraySchema> & {
    children: Input[];
});

export const InputSchema: z.ZodType<BaseInput> = z.lazy(() =>
  z.discriminatedUnion("type", [
    TextInputSchema,
    NumberInputSchema,
    SelectInputSchema,
    CheckboxInputSchema,
    InputArraySchema.extend({
      children: z.array(InputSchema), // Reference the lazy schema
    }),
  ])
);

export type Input = z.infer<typeof InputSchema>;

const testInput: Input = {
    type: "array",
    id: "",
    label: "Root",
    children: [
        {
            type: "text",
            id: "username",
            label: "Username",
            placeholder: "Enter your username",
            value: ""
        }
    ]
}