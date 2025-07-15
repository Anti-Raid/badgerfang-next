# Flow rules

## If Statements

1. a if statement can only have one non-continuing connection but may have an arbitrary number of continuing connections with the exception that an if may only have one connection to a end (a continuing connection is a connection targeting elseif, else or end)

2. A elseif or else block may only be connected to a if source

## For Loops

For loops can only have one source connection but may have two targets of which one must be the loop body and the other must be a end condition.

## End Condition

An end condition must be connected to either a `If Statement` or a `For Loop`.

## TODO

### CodegenAST Prelude Removal

It would help if there was a intermediate step in which the prelude etc is removed and replaced with a new CodeGenAST function delcaration/function call wrapper instead