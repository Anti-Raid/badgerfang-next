import { IRValidityCheck, IRVState } from "./baseirvalidity";
import { IForLoopNode, IIfConditionNode, INode, INodeTypeEnum, IVariableSetNode } from "./ir";

export class UndefinedVariableCheckState extends IRVState {
    /**
     * Currently known variables in the current scope.
     */
    public knownVariables: Set<string>;

    constructor() {
        super();
        this.knownVariables = new Set<string>();
    }

    public clone() {
        const newState = new UndefinedVariableCheckState();
        newState.knownVariables = new Set(this.knownVariables);
        return newState;
    }
}

/**
 * Check for undefined variables in the IR.
 * 
 * This doesn't do much yet (besides warning about shadowed variables)
 * as using variables in a TypedInput etc is not yet implemented.
 */
export class UndefinedVariableCheck extends IRValidityCheck<UndefinedVariableCheckState> {
    getInitialState(): UndefinedVariableCheckState {
        return new UndefinedVariableCheckState();
    }

    visitNode(inode: INode, state: UndefinedVariableCheckState): void {
        switch (inode.type) {
            case INodeTypeEnum.SetVariable:
                this.visitSetVariable(inode, state);
                break;
            case INodeTypeEnum.IfCondition:
                this.visitIfCondition(inode, state);
                break;
            case INodeTypeEnum.ForLoop:
                this.visitForLoop(inode, state);
                break;
        }
    }

    visitSetVariable(inode: IVariableSetNode, state: UndefinedVariableCheckState): void {
        if (state.knownVariables.has(inode.data.variable_name)) {
            // Push a warning
            this.ir.warnings.push(`Variable "${inode.data.variable_name}" is already defined in the current scope. As such, the previous variable declaration will be shadowed by the new one`);
            return;
        }
        // Add the variable to the known variables set
        state.knownVariables.add(inode.data.variable_name);
    }

    visitIfCondition(inode: IIfConditionNode, state: UndefinedVariableCheckState): void {
        // Descend into the body of the if condition
        this.descend(inode.data.body, state);

        if (inode.data.elseifs) {
            // Descend into each else-if condition
            for (const elseif of inode.data.elseifs) {
                this.descend(elseif.body, state);
            }
        }

        if (inode.data.else) {
            // Descend into the else body
            this.descend(inode.data.else, state);
        }
    }

    visitForLoop(inode: IForLoopNode, state: UndefinedVariableCheckState): void {
        // Descend into the body of the for loop
        this.descend(inode.data.body, state);
    }
}