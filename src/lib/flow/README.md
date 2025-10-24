# Flow

## Node types

There are two main types of nodes in the low-level flow:

- Base nodes

These are special nodes provided by flow itself and are base nodes such as while loops, if conditions and start nodes. Base nodes are react components and have a large number of requirements and boilerplate code etc. to render. It is also usually not possible to code a base node without modifying codegen directly as well making it very difficult to directly implement with the benefit being that (much) more complex UI functionality and logic can be coded into a base node as compared to API nodes etc.

Note: Set variable is also a base node but will most likely be moved to being an API Node (see below). 

- API nodes

API nodes are special nodes written in YAML and compiled via dnodec to json. These nodes have a in-luau codegen layer and are much easier to create than base nodes (which have lots of boilerplate such as validation sources etc.). API nodes are also stable in that they have no tight connection to the low-level flow layers itself making them more portable to flow changes. In the futures, users themselves *may* be able to directly make their own API nodes and import them into flow.

Note that API nodes are quite limited with the intent of being general purpose. All API nodes support N inputs and M outputs with handles at top and bottom. Special validation logic is not supported for the two handles at top/bottom.

## Legal

Flow layout code is mostly inspired/taken from Kite: https://github.com/merlinfuchs/kite/blob/main/kite-web/src/lib/flow/data.ts. Licensed under the GPL-3 which is compatible with Badgerfang's AGPL-3.0
