# Flow rules

## If Statements

1. a if statement can only have one non-continuing connection but may have an arbitrary number of continuing connections with the exception that an if may only have one connection to a end (a continuing connection is a connection targeting elseif, else or end)

2. A elseif or else block may only be connected to a if source

## For Loops

For loops can only have one source connection but may have two targets of which one must be the loop body and the other must be a end condition.

## While Loops

While loops can only have one source connection but may have two targets of which one must be the loop body and the other must be a end condition. While loops must also have a full condition (no ``Unselected`` options)

## End Condition

An end condition must be connected to either a `If Statement`, a `For Loop` or a ``While Loop``

## TODO

### CodegenAST Prelude Removal

It would help if there was a intermediate step in which the prelude etc is removed and replaced with a new CodeGenAST function delcaration/function call wrapper instead

# Scope limits

To ensure Flow remains high quality, the scope of Flow UI will be limited (currently) to:

- sending/deferring/editting/deleting interaction responses
- sending/editting/deleting normal messages
- basic member moderation (ban/kick/timeout) 
- stinging members

In either case, the Custom Code node can be used as a escape hatch to run raw Luau code within a flow