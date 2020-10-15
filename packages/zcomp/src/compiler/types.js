/**
 * An AST node.
 */
export class AstNode {
  /**
   * The node type.
   *
   * @type {"subscript" | "refinement" | "condrefinement" | "invocation" | "assignment" | "goroutine" | "function" | "spread" | "match" | "range" | "loopexpr" | "ifexpr" | "if"}
   */
  type;

  /**
   * The zeroth.
   *
   * @type {AstNode | AstNode[]}
   */
  zeroth;

  /**
   * The wunth.
   *
   * @type {AstNode | AstNode[]}
   */
  wunth;

  /**
   * The twoth.
   *
   * @type {AstNode | AstNode[]}
   */
  twoth;

  /**
   * The species.
   */
  species;

  /**
   * A constructor for an AST node.
   *
   * @param {{ species: any, type: any, zeroth: AstNode | AstNode[], wunth: AstNode | AstNode[], twoth: AstNode | AstNode[] }} properties The node's properties
   */
  constructor(properties) {
    for (property in ["species", "type", "zeroth", "wunth", "twoth"]) {
      if (properties.hasOwnProperty(property)) {
        this[property] = properties[property];
      }
    }
  }
}

/**
 * Valid options for the "type" field.
 */
export const validTypes = [
  "subscript",
  "refinement",
  "condrefinement",
  "invocation",
  "assignment",
  "goroutine",
  "function",
  "spread",
  "match",
  "range",
  "loopexpr",
  "ifexpr",
  "if",
];
