# Dev Notes

## Tokenization regex capturing groups

[1] Whitespace
[2] Comment
[3] String
[4] Keyword
[5] Name
[6] Number
[7] Punctuator
[8] RegExp

## Reference to how Z mangles identifiers for debugging

```javascript
const symbolMap = {
  "+": "$plus",
  "-": "$minus",
  "*": "$star",
  "/": "$slash",
  "^": "$carot",
  "?": "$question",
  "=": "$eq",
  "<": "$lt",
  ">": "$gt",
  "\\": "$backslash",
  "&": "$and",
  "|": "$or",
  "%": "$percent",
  "'": "$quote",
  "!": "$exclam",
};
```
