import { z } from "zod";

const TextInputSchema = z.object({
    type: z.literal("text"),
    label: z.string(),
    placeholder: z.string().optional(),
    defaultValue: z.string().optional(),
    maxLength: z.number().optional(),
    suggestions: z.array(z.string()).optional(),
});

const NumberInputSchema = z.object({
    type: z.literal("number"),
    label: z.string(),
    placeholder: z.string().optional(),
    defaultValue: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
});

const SelectInputSchema = z.object({
    type: z.literal("select"),
    label: z.string(),
    options: z.array(z.string()),
    defaultValue: z.string().optional(),
});

const CheckboxInputSchema = z.object({
    type: z.literal("checkbox"),
    label: z.string(),
    defaultValue: z.boolean().optional(),
});

type BaseInput = z.infer<typeof TextInputSchema> | z.infer<typeof NumberInputSchema> | z.infer<typeof SelectInputSchema> | z.infer<typeof CheckboxInputSchema>;

const InputArraySchema = z.object({
    type: z.literal("array"),
    label: z.string(),
    // The children field will be added later using z.lazy()
});

type InputSchema = BaseInput | {
    type: "array";
    label: string;
    children: Input[];
};

// 3. Create the main schema for a FileSystemItem using z.lazy()
export const InputSchema: z.ZodType<InputSchema> = z.lazy(() =>
  z.discriminatedUnion("type", [
    TextInputSchema,
    NumberInputSchema,
    SelectInputSchema,
    CheckboxInputSchema,
    // Extend the BaseFolderSchema with the recursive 'children' field
    InputArraySchema.extend({
      children: z.array(InputSchema), // Reference the lazy schema
    }),
  ])
);

// Optional: Infer the final TypeScript type
export type Input = z.infer<typeof InputSchema>;

/**
const testInput: Input = {
    type: "array",
    label: "Root",
    children: [
        {
            type: "text",
            label: "Username",
            placeholder: "Enter your username"
        }
    ]
}

 */