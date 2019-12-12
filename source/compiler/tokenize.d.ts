// Type definitions for @zlanguage/zcomp
// Project: @zlanguage/zcomp
// Definitions by: Reece Dunham <https://rdil.rocks>

export interface ReturnableData {
  id: String,
  lineNumber: Number,
  columnNumber: Number,
  string ?: String,
  columnTo ?: Number,
  readonly ?: Boolean,
  alphanumeric ?: Boolean,
  number ?: Number,
  source ?: String
}

export function tokenize(source: String | Array<String>, comment: Boolean = false): () => void | ReturnableData;
