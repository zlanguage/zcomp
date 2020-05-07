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

const quote = String["fromCharCode"](34);
let upoints = undefined;
const ustring = function (str) {
  const points = JS["new"](
    Uint32Array,
    [...str]["map"](function (char$exclam) {
      return char$exclam["codePointAt"](0);
    })
  );
  return stone({
    ["type"]: function () {
      return "ustr";
    },
    ["toString"]: function () {
      let i = 0;
      let res = "";
      while (true) {
        if (assertBool($gt$eq(i, points["length"]))) {
          break;
        }
        res = res["concat"](String["fromCodePoint"](points[i]));
        i = $plus(i, 1);
      }
      return "u"["concat"](quote, res, quote);
    },
    ["toJSON"]: function () {
      return this["toString"]()["slice"](1);
    },
    ["at"]: function (index$exclam) {
      return upoints(points[index$exclam]);
    },
    ["codeAt"]: function (index$exclam) {
      return points[index$exclam];
    },
    ["points"]: function () {
      return points;
    },
    ["concat"]: function (other$exclam) {
      return upoints(...points, ...other$exclam["points"]());
    },
    ["length"]: function () {
      return points["length"];
    },
    ["slice"]: function (start$exclam, end$exclam) {
      return upoints(...points["slice"](start$exclam, end$exclam));
    },
    ["="]: function (str) {
      str = matcher([
        [
          matcher.type("array", ""),
          function () {
            return upoints(...str);
          },
        ],
        [
          matcher.type("string", ""),
          function () {
            return ustring(str);
          },
        ],
        [
          matcher.wildcard("_"),
          function (_) {
            return _;
          },
        ],
      ])(str);
      return $eq(points, str["points"]());
    },
  });
};
upoints = function (...points) {
  return ustring(
    points["map"](function (point$exclam) {
      return String["fromCodePoint"](point$exclam);
    })["join"]("")
  );
};
module.exports = stone({
  ["string"]: ustring,
  ["points"]: upoints,
  ["quote"]: quote,
});
