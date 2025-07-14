import { ElseIfCondition, EndCondition, ForLoop, IfCondition } from "@/components/flow/Conditionals"
import CustomCode from "@/components/flow/CustomCodeNode"
import DeleteEdge from "@/components/flow/DeleteEdge"
import SetVariable from "@/components/flow/SetVariable"
import { Command, CommandArgument, Library } from "@/components/flow/StartNode"

export const nodeTypes = {
    library: Library,
    command: Command,
    command_argument: CommandArgument,
    set_variable: SetVariable,
    if_condition: IfCondition,
    elseif_condition: ElseIfCondition,
    end_condition: EndCondition,
    for_loop: ForLoop,
    custom_code: CustomCode
}
export const edgeTypes = {
    delete_button: DeleteEdge,
}