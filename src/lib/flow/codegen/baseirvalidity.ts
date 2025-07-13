import { CodeGenIR, INode } from "./ir";

/**
 * Stores the state for a IR validity check.
 * 
 * A state must be cloneable (so it can be cloned when descending into a different scope)
 */
export abstract class IRVState {
    /**
     * Clones the current state.
     * 
     * This is used to create a new state when descending into a different scope.
     */
    public abstract clone(): IRVState;
}

/**
 * A IR validity check
 */
export abstract class IRValidityCheck<State extends IRVState> {
    ir: CodeGenIR;

    constructor(ir: CodeGenIR) {
        this.ir = ir;
    }

    /**
     * Returns the initial state that will be passed to all invocations of visitNode.
     */
    abstract getInitialState(): State;

    /** 
     * Visits the INode and performs the validity check on said INode
    */
    abstract visitNode(inode: INode, state: State): void;

    /**
     * Helper to loop over a list of INodes and perform the validity check on each.
     */
    public visitNodes(inodes: INode[], state: State): void {
        for (const inode of inodes) {
            this.visitNode(inode, state);
        }
    }

    /**
     * Helper to clone the current state
     */
    public cloneState(state: State): State {
        return state.clone() as State;
    }

    /**
     * Helper to descend into a new scope by cloning the current state and visiting the INodes with the new state.
     * 
     * This allows each scope to have its own independent state while still being able to access the parent scope's state.
     */
    public descend(inodes: INode[], state: State): State {
        // Clone the current state to create a new state for the new scope
        const newState = this.cloneState(state);
        this.visitNodes(inodes, newState);
        return newState;
    }
}

/**
 * Base class for performing all IR validity checks on a CodeGenIR
 */
export abstract class IRValidator {
    public ir: CodeGenIR;
    public checks: IRValidityCheck<IRVState>[];

    constructor(ir: CodeGenIR) {
        this.ir = ir;
        this.checks = [];
    }

    /**
     * Adds a validity check to the validator.
     * 
     * @param check The validity check to add.
     */
    public addCheck(check: IRValidityCheck<IRVState>): void {
        this.checks.push(check);
    } 

    /**
     * Adds a validity check to the validator by class.
     * 
     * @param checkClass The class of the validity check to add.
     */
    public addCheckClass(checkClass: new (ir: CodeGenIR) => IRValidityCheck<IRVState>): void {
        const check = new checkClass(this.ir);
        this.addCheck(check);
    }

    /**
     * Runs all validity checks on the IR.
     * 
     * Errors will be added to the IR's errors array.
     */
    public runChecks(): void {
        for (const check of this.checks) {
            const initialState = check.getInitialState();
            try {
                check.visitNodes(this.ir.nodes, initialState);
            } catch (error) {
                this.ir.fatalError = `IR validity check failed unexpectedly: ${error?.toString()}`;
                return;
            }
        }
    }
}