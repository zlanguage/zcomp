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

const Rational = function (n, d = 1) {
  if (assertBool($eq(typeOf(n), "Rational"))) {
    return n;
  }
  if (assertBool($eq(d, 0))) {
    throw new Error("A Rational cannot have denominator of 0.");
  }
  if (assertBool($eq(typeOf(n), "string"))) {
    if (assertBool(n["includes"]("."))) {
      const [int, dec] = n["split"](".");
      n = BigInt($plus$plus(int, dec));
      d = BigInt($plus$plus("1", "0"["repeat"](dec["length"])));
    }
  }
  n = BigInt(n);
  d = BigInt(d);
  const gcf = gcd(n, d);
  n = JS["/"](n, gcf);
  d = JS["/"](d, gcf);
  return stone({
    ["numer"]: n,
    ["denom"]: d,
    ["type"]: function () {
      return "Rational";
    },
    ["toString"]: function () {
      return $plus$plus($plus$plus($plus$plus("", n), " // "), d);
    },
    ["+"]: function (other) {
      other = Rational(other);
      return Rational(
        JS["+"](JS["*"](other["numer"], d), JS["*"](n, other["denom"])),
        JS["*"](d, other["denom"])
      );
    },
    ["r+"]: function (other) {
      other = Rational(other);
      return other["+"](this);
    },
    ["-"]: function (other) {
      other = Rational(other);
      return this["+"](
        Rational(JS["*"](other["numer"], BigInt(-1)), other["denom"])
      );
    },
    ["r-"]: function (other) {
      other = Rational(other);
      return other["-"](this);
    },
    ["*"]: function (other) {
      other = Rational(other);
      return Rational(JS["*"](n, other["numer"]), JS["*"](d, other["denom"]));
    },
    ["r*"]: function (other) {
      other = Rational(other);
      return other["*"](this);
    },
    ["/"]: function (other) {
      other = Rational(other);
      return Rational(JS["*"](n, other["denom"]), JS["*"](d, other["numer"]));
    },
    ["r/"]: function (other) {
      other = Rational(other);
      return other["/"](this);
    },
    ["="]: function (other) {
      other = Rational(other);
      return and($eq(n, other["numer"]), $eq(d, other["denom"]));
    },
    ["r="]: function (other) {
      other = Rational(other);
      return other["="](this);
    },
    ["<"]: function (other) {
      other = Rational(other);
      return $eq(Rational["sign"](this["-"](other)), -1);
    },
    ["r<"]: function (other) {
      other = Rational(other);
      return other["<"](this);
    },
  });
};
const gcd = function (a, b) {
  if (!$eq(typeOf(a), "bigint")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(b), "bigint")) {
    throw new Error("Enter failed");
  }
  return JS["=="](b, 0) ? a : gcd(b, JS["%"](a, b));
};
const $slash$slash = Rational;
/* operator $slash$slash = 1000 */
Rational["E"] = Rational("2.71828182845904523536");
Rational["LN10"] = Rational("2.30258509299404568401");
Rational["LN2"] = Rational("0.69314718055994530941");
Rational["LOG10E"] = Rational("0.43429448190325182765");
Rational["LOG2E"] = Rational("1.44269504088896340736");
Rational["PI"] = Rational("3.14159265358979323846");
Rational["SQRT1_2"] = Rational("0.70710678118654752440");
Rational["SQRT2"] = Rational("1.41421356237309504880");
Rational["sign"] = function (rat) {
  rat = Rational(rat);
  if (assertBool($eq(rat, 0))) {
    return 0;
  }
  if (assertBool(or(JS["<"](rat["numer"], 0), JS["<"](rat["denom"], 0)))) {
    return -1;
  }
  return 1;
};
Rational["abs"] = function (rat) {
  rat = Rational(rat);
  if (assertBool($lt(rat, 0))) {
    return $star(rat, -1);
  }
  return rat;
};
Rational["random"] = function (rat) {
  const bound = Math["floor"]($star(Math["random"](), 1000000));
  const amt = Math["floor"]($plus($star(Math["random"](), bound), 1));
  return $slash$slash(amt, bound);
};
Rational["$slash$slash"] = $slash$slash;
module.exports = stone(Rational);
