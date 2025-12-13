/** Block API Node AST
 *
 * API node codegen must have a stable codegen that isn't heavily tied to BlockAST
 * internals (which are unstable and can/do change frequently) while also requiring
 * validation and parsing down to second-stage AST. BlockAPIAST provides this layer
 * to enable a API Node (which can be manually or, in the future, even programatically
 * generated) to generate AST nodes that are directly inserted in AST and can be transformed
 */
