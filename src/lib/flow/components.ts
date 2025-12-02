import {
	ElseIfCondition,
	EndCondition,
	ForLoop,
	IfCondition,
	WhileLoop
} from '@/components/flow/nodes/Conditionals';
import CustomCode from '@/components/flow/nodes/CustomCodeNode';
import DeleteEdge from '@/components/flow/management/DeleteEdge';
import Group from '@/components/flow/ui/Group';
import SetVariable from '@/components/flow/nodes/SetVariable';
import { Command, CommandArgument, Library } from '@/components/flow/nodes/StartNode';

export const nodeTypes = {
	library: Library,
	command: Command,
	command_argument: CommandArgument,
	set_variable: SetVariable,
	if_condition: IfCondition,
	elseif_condition: ElseIfCondition,
	end_condition: EndCondition,
	for_loop: ForLoop,
	while_loop: WhileLoop,
	custom_code: CustomCode,
	group_x: Group
};
export const edgeTypes = {
	delete_button: DeleteEdge
};

export const subflowComps = ['group_x'];
