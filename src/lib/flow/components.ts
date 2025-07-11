import { ElseIfCondition, EndCondition, ForLoop, IfCondition } from "@/components/flow/Conditionals"
import CustomCode from "@/components/flow/CustomCodeNode"
import DeleteEdge from "@/components/flow/DeleteEdge"
import SetVariable from "@/components/flow/SetVariable"

export const nodeTypes = {
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