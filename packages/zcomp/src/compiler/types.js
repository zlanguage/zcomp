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
   * @type {AstNode | any[]}
   */
  zeroth;

  /**
   * The wunth.
   *
   * @type {AstNode | any[]}
   */
  wunth;

  /**
   * The twoth.
   *
   * @type {AstNode | any[]}
   */
  twoth;

  /**
   * The species.
   */
  species;

  /**
   * The ID.
   *
   * @type {string?}
   */
  id;

  /**
   * Extra data (only used by errors currently).
   *
   * @type {string?}
   */
  data;

  /**
   * Used in determining operator precedence.
   *
   * @type {boolean?}
   */
  leftToRight;

  /**
   * @type {any[]}
   */
  predicates;

  /**
   * A constructor for an AST node.
   *
   * @param {{ species?: any, type?: any, zeroth?: AstNode | any[], wunth?: AstNode | any[], twoth?: AstNode | any[], id?: string, data?: string, leftToRight?: boolean, predicates: any[] }} properties The node's properties
   */
  constructor(properties) {
    for (let property of [
      "species",
      "type",
      "zeroth",
      "wunth",
      "twoth",
      "id",
      "data",
      "leftToRight",
      "predicates",
    ]) {
      if (properties.hasOwnProperty(property)) {
        this[property] = properties[property];
      }
    }
  }
}
