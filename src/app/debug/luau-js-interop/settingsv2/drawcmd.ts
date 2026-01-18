import { z } from "zod";
import { InputSchema } from "./input";

const DrawCmdHeaderSchema = z.object({
    type: z.literal("header"),
    title: z.string(),
})

const DrawCmdParagraphSchema = z.object({
    type: z.literal("paragraph"),
    text: z.string(),
})

const DrawCmdInputSchema = z.object({
    type: z.literal("input"),
    input: InputSchema,
})

const DrawCmdLabelledBoxSchema = z.object({
    type: z.literal("labelledbox"),
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
    commands: z.array(z.discriminatedUnion("type", [
        DrawCmdInputSchema,
        DrawCmdHeaderSchema,
        DrawCmdParagraphSchema
    ])),
})

export const DrawCmd = z.discriminatedUnion("type", [
    DrawCmdInputSchema,
    DrawCmdLabelledBoxSchema,
    DrawCmdHeaderSchema,
    DrawCmdParagraphSchema
]);

export type DrawCmd = z.infer<typeof DrawCmd>;