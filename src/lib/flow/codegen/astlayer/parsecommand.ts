import { LiteralValue } from "./finalrepr"
import { writeLiteral } from "./literals"

// FinalRepr parsing 'compiles' down statements into ParseCommands
export type ParseCommand = {
    type: "token", // A raw token
    value: string
} | {
    type: "token.luau",
    value: "if" | "elseif" | "else" | "for" | "in" | "while" | "do" | "then" | "end" | "return" | "local" | "function" // a luau special token
} | {
    type: "token.luau.funcarg",
    name: string,
    argtype?: string,
} | {
    type: "token.literal",
    value: LiteralValue,
} | {
    type: "line.next" // denotes the start of a new line (which will include the desired indent) by incrementing currentIndex
} | {
    type: "indent.incr"
} | {
    type: "indent.decr"
}

export const stringifyParseCommands = (pc: ParseCommand[]): string => {
    let indent = 0;
    let output = "";
    // We start at the beginning of a line
    let isStartOfLine = true;

    const tokenOps = ["token", "token.luau", "token.luau.funcarg", "token.literal"]

    for (const cmd of pc) {
        if (tokenOps.includes(cmd.type)) {
            // Only apply indentation if we are currently at the start of a line
            if (isStartOfLine) {
                output += "\t".repeat(indent);
                isStartOfLine = false;
            }
        }

        switch (cmd.type) {
            case "token":
                output += cmd.value;
                break;
            case "token.luau":
                switch (cmd.value) {
                    case "if":
                        output += "if "
                        break;
                    case "elseif":
                        output += "elseif "
                        break;
                    case "else":
                        output += "else "
                        break;
                    case "for":
                        output += "for "
                        break;
                    case "in":
                        output += " in "
                        break;
                    case "do":
                        output += " do"
                        break;
                    case "end":
                        output += "end"
                        break;
                    case "then":
                        output += " then"
                        break;
                    case "while":
                        output += "while "
                        break;
                    case "return":
                        output += "return "
                        break;
                    case "local":
                        output += "local "
                        break;
                    case "function":
                        output += "function "
                        break;
                }
                break;
            case "token.luau.funcarg":
                output += cmd.name + (cmd.argtype ? `: ${cmd.argtype}` : '');
                break;
            case "token.literal":
                output += writeLiteral(cmd.value)
                break;
            case "line.next":
                output += "\n";
                isStartOfLine = true;
                break;
            case "indent.incr":
                indent++;
                break;
            case "indent.decr":
                indent--;
                if (indent < 0) {
                    throw new Error(`internal error: indent.decr without indent.incr`);
                }
                break;
        }
    }

    return output;
}
