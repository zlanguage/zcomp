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

const Decimal = stone(require("./Decimal"));
const Complex = function (real, imag) {
  if (assertBool($eq(typeOf(real), "Complex"))) {
    return real;
  }
  if (
    assertBool(and($eq(typeOf(imag), "undefined"), $eq(typeOf(real), "string")))
  ) {
    const fmtNums = function (obj) {
      return obj["map"](function (obj) {
        return obj["trim"]()["replace"]("i", "");
      })["map"](function (imag$exclam) {
        return $eq(imag$exclam, "") ? 1 : imag$exclam;
      });
    };
    if (assertBool(real["includes"]("+"))) {
      [real, imag] = fmtNums(real["split"](" + "));
    }
    if (assertBool(real["includes"]("-"))) {
      [real, imag] = fmtNums(real["split"](" - "));
      imag = $plus$plus("-", imag);
    }
  }
  real = Decimal(real);
  imag = Decimal(imag);
  return stone({
    ["real"]: real,
    ["imag"]: imag,
    ["type"]: function () {
      return "Complex";
    },
    ["toString"]: function () {
      return $plus$plus(
        $plus$plus($plus$plus($plus$plus("", real), " + "), imag),
        "i"
      );
    },
    ["+"]: function (other) {
      other = Complex(other);
      return Complex($plus(real, other["real"]), $plus(imag, other["imag"]));
    },
    ["r+"]: function (other) {
      other = Complex(other);
      return other["+"](this);
    },
    ["-"]: function (other) {
      other = Complex(other);
      return Complex($minus(real, other["real"]), $minus(imag, other["imag"]));
    },
    ["r-"]: function (other) {
      other = Complex(other);
      return other["-"](this);
    },
    ["*"]: function (other) {
      other = Complex(other);
      return Complex(
        $minus($star(real, other["real"]), $star(imag, other["imag"])),
        $plus($star(real, other["imag"]), $star(imag, other["real"]))
      );
    },
    ["r*"]: function (other) {
      other = Complex(other);
      return other["*"](this);
    },
    ["/"]: function (other) {
      other = Complex(other);
      const denom = $plus(
        $star(other["real"], other["real"]),
        $star(other["imag"], other["imag"])
      );
      return Complex(
        $slash(
          $plus($star(real, other["real"]), $star(imag, other["imag"])),
          denom
        ),
        $slash(
          $plus(
            $star($star(real, other["imag"]), -1),
            $star(imag, other["real"])
          ),
          denom
        )
      );
    },
    ["r/"]: function (other) {
      other = Complex(other);
      return other["/"](this);
    },
    ["="]: function (other) {
      other = Complex(other);
      return and($eq(real, other["real"]), $eq(imag, other["imag"]));
    },
    ["r="]: function (other) {
      other = Complex(other);
      return other["="](this);
    },
  });
};
Complex["random"] = function () {
  return Complex(Decimal["random"](), Decimal["random"]());
};
module.exports = stone(Complex);
