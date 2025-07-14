//export const auditLogReasonSchema = z.string().max(512).optional();

import z from "zod";
import { PermissionIndividual } from "./discordperms";
import { CommandArgumentType } from "./data";

export const sharedNodeDataSchema = z.looseObject({
    comment: z.string().optional(),   
});

export const baseCommandNodeSchema = sharedNodeDataSchema.extend({
  name: z
    .string()
    .max(32)
    .min(1)
    .check(
      (ctx) => {
        let arg = ctx.value;
        if (!arg) {
          ctx.issues.push({
            code: "custom",
            input: arg,
            message: "No arg found"
          })
          return;
        }
        let split = arg.split(" ");
        if (split.length > 3) {
          ctx.issues.push({
            code: "custom",
            input: arg,
            message: "Command name can have at most 3 words (base command, subcommand, subcommand group"
          })
          return;
        }

        for (let word of split) {
          if (!/^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/ug.test(word)) {
            ctx.issues.push({
              code: "custom",
              input: word,
              message: `Each part of a command name must be only lowercase alphanumeric characters and underscores`
            })
          }
        }

        return;
      }
    ),
    description: z.string().max(100).min(1),
});

export const commandArgumentNodeSchema = sharedNodeDataSchema.extend({
    command_argument_type: z.enum(CommandArgumentType),
    command_argument_name: z.string()
    .regex(
      /^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/ug,
      "Must be only lowercase alphanumeric characters and underscores"
    )
    .max(32)
    .min(1),
    command_argument_description: z.string().max(100).optional(),
    command_argument_required: z.boolean(),
});

export const variableSetNodeSchema = sharedNodeDataSchema.extend({
    variable_name: z.string().min(1).optional(),
    variable_value: z.string().min(1).optional(),
});

export const forLoopNodeSchema = sharedNodeDataSchema.extend({
    condition: z.string().min(1),
});

export const ifConditionNodeSchema = sharedNodeDataSchema.extend({
    condition: z.string().min(1),
});