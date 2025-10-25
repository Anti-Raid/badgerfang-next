--!strict
local idl = require"./idl"

local nodeidl: idl.Node = {
    id = "assign",
    shortname = "Bind Value `$value`",
    description = "Binds a value as the nodes output",
    flowui = {
        handles = { allow = {"bottom", "top"}},
        input = {
            type = "scalar",
            optional = false,
            data = {
                id = "input",
                shortname = "Value",
                description = "The value of input is directly passed through to output and can then be bound to a variable etc.",
                type = "typedinput"
            }
        },
        output = {
            type = "scalar",
            optional = false,
            data = {
                id = "output",
                shortname = "Output",
                description = "The value of input is directly passed through to output and can then be bound to a variable etc.",
                type = "typedinput"
            }
        }
    }
}

return nodeidl