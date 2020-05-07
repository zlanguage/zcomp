"use strict";

const $Z = require("@zlanguage/zstdlib");
const matcher = require("@zlanguage/zstdlib/src/js/matcher");

const $eq = $Z.$eq;
const isObject = $Z.isObject;
const typeOf = $Z.typeOf;
const stone = $Z.stone;
const log = $Z.log;
const copy = $Z.copy;
const assertBool = $Z.assertBool;
const $plus = $Z.$plus;
const $minus = $Z.$minus;
const $star = $Z.$star;
const $slash = $Z.$slash;
const $percent = $Z.$percent;
const $carot = $Z.$carot;
const pow = $Z.pow;
const $lt = $Z.$lt;
const $gt$eq = $Z.$gt$eq;
const $gt = $Z.$gt;
const $lt$eq = $Z.$lt$eq;
const not = $Z.not;
const $plus$plus = $Z.$plus$plus;
const m = $Z.m;
const both = $Z.both;
const either = $Z.either;
const and = $Z.and;
const or = $Z.or;
const JS = $Z.JS;
const assertType = $Z.assertType;
const typeGeneric = $Z.typeGeneric;
const chan = $Z.chan;
const send = $Z.send;
const to = $Z.to;
const til = $Z.til;
const by = $Z.by;
const curry = $Z.curry;
const $or$gt = $Z.$or$gt;
const $gt$gt = $Z.$gt$gt;
const $lt$lt = $Z.$lt$lt;

const Decimal = function (c, e, pure = false) {
  if (assertBool($eq(typeOf(c), "Decimal"))) {
    if (assertBool(pure)) {
      return c;
    }
    let newC = c["c"];
    let newE = c["e"];
    [newC, newE] = normalize(newC, newE);
    return Decimal(newC, newE);
  }
  if (assertBool($eq(e, undefined))) {
    matcher([
      [
        matcher.type("number", ""),
        function () {
          e = 0;
          while (true) {
            if (assertBool($eq($percent(c, 1), 0))) {
              break;
            }
            c = $star(c, 10);
            e = $minus(e, 1);
          }
          c = BigInt(c);
        },
      ],
      [
        matcher.type("string", ""),
        function () {
          [c, e] = strToDec(c);
        },
      ],
      [
        matcher.wildcard("_"),
        function (_) {
          const toThrow = $plus$plus(
            $plus$plus("", _),
            " cannot be coerced into a Decimal."
          );
          throw new Error(toThrow);
        },
      ],
    ])(c);
  }
  if (assertBool(not(pure))) {
    [c, e] = normalize(c, e);
  }
  return stone({
    ["c"]: c,
    ["e"]: e,
    ["type"]: function () {
      return "Decimal";
    },
    ["+"]: function (other) {
      if (assertBool($eq(other, 0))) {
        return this;
      }
      if (assertBool($eq(this, 0))) {
        return Decimal(other);
      }
      other = Decimal(other);
      let newC = c;
      let newE = e;
      if (assertBool(not($eq(other["e"], e)))) {
        if (assertBool($lt(other["e"], e))) {
          while (true) {
            if (assertBool($eq(other["e"], newE))) {
              break;
            }
            newE = $minus(newE, 1);
            newC = JS["*"](newC, BigInt(10));
          }
        } else {
          while (true) {
            if (assertBool($eq(other["e"], e))) {
              break;
            }
            other = Decimal(
              JS["*"](other["c"], BigInt(10)),
              $minus(other["e"], 1),
              true
            );
          }
        }
      }
      return Decimal(JS["+"](newC, other["c"]), newE);
    },
    ["r+"]: function (other) {
      other = Decimal(other);
      return other["+"](this);
    },
    ["-"]: function (other) {
      other = Decimal(other);
      return this["+"](Decimal(JS["-"](other["c"]), other["e"]));
    },
    ["r-"]: function (other) {
      other = Decimal(other);
      return other["-"](this);
    },
    ["*"]: function (other) {
      other = Decimal(other);
      return Decimal(JS["*"](c, other["c"]), $plus(e, other["e"]));
    },
    ["r*"]: function (other) {
      other = Decimal(other);
      return other["*"](this);
    },
    ["/"]: function (other, precision = -20) {
      other = Decimal(other);
      let newC = c;
      let newE = e;
      if (assertBool($eq(newC, 0))) {
        return this;
      }
      if (assertBool($eq(other["c"], 0))) {
        return undefined;
      }
      newE = $minus(newE, other["e"]);
      if (assertBool($gt(newE, precision))) {
        newC = JS["*"](
          c,
          JS["**"](BigInt(10), BigInt($minus(newE, precision)))
        );
        newE = precision;
      }
      newC = JS["/"](newC, other["c"]);
      return Decimal(newC, newE);
    },
    ["r/"]: function (other) {
      other = Decimal(other);
      return other["/"](this);
    },
    ["<"]: function (other) {
      other = Decimal(other);
      return isNegative(this["-"](other));
    },
    ["r<"]: function (other) {
      other = Decimal(other);
      return other["<"](this);
    },
    ["="]: function (other) {
      other = Decimal(other);
      return and($eq(c, other["c"]), $eq(e, other["e"]));
    },
    ["r="]: function (other) {
      other = Decimal(other);
      return other["="](this);
    },
    ["toString"]: function () {
      const pc = JS["<"](c, 0) ? JS["-"](c) : c;
      const str = pc["toString"]();
      const prefix = JS["<"](c, 0) ? "-" : "";
      if (assertBool($gt(e, 0))) {
        return $plus$plus($plus$plus(prefix, str), "0"["repeat"]($minus(e, 1)));
      } else {
        if (assertBool($eq(e, 0))) {
          return $plus$plus(prefix, str);
        } else {
          const insertPlace = $plus(str["length"], e);
          const zeros = $gt(Math["abs"](e), str["length"])
            ? "0"["repeat"](Math["abs"]($plus(str["length"], e)))
            : "";
          return $plus$plus(
            prefix,
            numfmt(
              $plus$plus(
                $plus$plus(
                  $plus$plus(str["slice"](0, insertPlace), "."),
                  zeros
                ),
                str["slice"](insertPlace)
              )
            )
          );
        }
      }
    },
    ["toNumber"]: function () {
      return Number(this["toString"]());
    },
    ["prev"]: function () {
      return $minus(this, 1);
    },
    ["succ"]: function () {
      return $plus(this, 1);
    },
  });
};
var numfmt = function (numstr) {
  if (!$eq(typeOf(numstr), "string")) {
    throw new Error("Enter failed");
  }
  return numstr["replace"](RegExp("^0+"), "")
    ["replace"](RegExp("(\\.\\d+?)0+$"), "$1")
    ["replace"](RegExp("^\\."), "0.")
    ["replace"](RegExp("\\.0$"), "");
};
var absBig = function (big) {
  if (!$eq(typeOf(big), "bigint")) {
    throw new Error("Enter failed");
  }
  if (assertBool(JS["<"](big, 0))) {
    return JS["*"](big, BigInt(-1));
  }
  return big;
};
var signBig = function (big) {
  if (!$eq(typeOf(big), "bigint")) {
    throw new Error("Enter failed");
  }
  if (assertBool(JS[">"](big, 0))) {
    return 1;
  } else {
    if (assertBool(JS["=="](big, 0))) {
      return 0;
    } else {
      return -1;
    }
  }
};
var sign = function (d) {
  d = Decimal(d);
  if (assertBool(JS[">"](d["c"], 0))) {
    return 1;
  } else {
    if (assertBool(JS["=="](d["c"], 0))) {
      return 0;
    } else {
      return -1;
    }
  }
};
var normalize = function (c, e) {
  if (!$eq(typeOf(c), "bigint")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(e), "number")) {
    throw new Error("Enter failed");
  }
  if (assertBool($gt(e, 0))) {
    c = JS["*"](c, JS["**"](BigInt(10), BigInt(e)));
    e = 0;
  } else {
    if (assertBool($lt(e, 0))) {
      while (true) {
        if (
          assertBool(or($gt(e, 0), not(JS["=="](JS["%"](c, BigInt(10)), 0))))
        ) {
          break;
        }
        c = JS["/"](c, BigInt(10));
        e = $plus(e, 1);
      }
    } else {
      if (assertBool(JS["=="](c, 0))) {
        return [BigInt(0), 0];
      }
    }
  }
  return [c, e];
};
var strToDec = function (str) {
  if (!$eq(typeOf(str), "string")) {
    throw new Error("Enter failed");
  }
  if (assertBool(not(or(str["includes"]("."), str["includes"]("e"))))) {
    return [BigInt(str), 0];
  } else {
    if (assertBool(str["includes"]("e"))) {
      let [c, e] = str["split"]("e");
      e = Number(e);
      if (assertBool(c["includes"]("."))) {
        const [int, dec] = c["split"](".");
        c = $plus$plus(int, dec);
        e = $minus(e, dec["length"]);
      }
      return [BigInt(c), e];
    } else {
      const [int, dec] = str["split"](".");
      return [BigInt($plus$plus(int, dec)), $star(dec["length"], -1)];
    }
  }
};
var isNegative = function (dec) {
  dec = Decimal(dec);
  return JS["<"](dec["c"], 0);
};
Decimal["E"] = Decimal("2.71828182845904523536");
Decimal["LN10"] = Decimal("2.30258509299404568401");
Decimal["LN2"] = Decimal("0.69314718055994530941");
Decimal["LOG10E"] = Decimal("0.43429448190325182765");
Decimal["LOG2E"] = Decimal("1.44269504088896340736");
Decimal["PI"] = Decimal("3.14159265358979323846");
Decimal["SQRT1_2"] = Decimal("0.70710678118654752440");
Decimal["SQRT2"] = Decimal("1.41421356237309504880");
Decimal["abs"] = function (dec) {
  dec = Decimal(dec);
  if (assertBool($lt(dec, 0))) {
    return $star(dec, -1);
  }
  return dec;
};
Decimal["ceil"] = function (num) {
  return $plus(Decimal["floor"](num), 1);
};
Decimal["floor"] = function (num) {
  return Decimal(Decimal(num)["toString"]()["split"](".")[0]);
};
Decimal["round"] = function (num) {
  num = Decimal(num);
  if (assertBool($lt(num, $plus(Decimal["floor"](num), 0.5)))) {
    return Decimal["floor"](num);
  }
  return Decimal["ceil"](num);
};
Decimal["sign"] = sign;
Decimal["random"] = function () {
  let str = "";
  $plus$plus(
    [],
    (function () {
      const res = [];
      for (const _ of to(1, 20)) {
        if (true)
          res.push((str = $plus$plus(str, Math["random"]()["toString"]()[2])));
      }
      return res;
    })()
  );
  return Decimal($plus$plus("0.", str));
};
module.exports = stone(Decimal);
