import { ElseIfCondition, IfCondition } from "@/components/flow/Conditionals"
import DeleteEdge from "@/components/flow/DeleteEdge"
import SetVariable from "@/components/flow/SetVariable"

export const nodeTypes = {
    set_variable: SetVariable,
    if_condition: IfCondition,
    elseif_condition: ElseIfCondition,
}
export const edgeTypes = {
    delete_button: DeleteEdge,
}