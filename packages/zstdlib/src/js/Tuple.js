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

const Tuple = function () {
  const fields = stone(Array["from"](arguments));
  if (assertBool($gt(fields["length"], 4))) {
    const err = [
      "You tried to store more than 4 fields in a tuple.",
      "This probably isn't a good idea.",
      "Tuples are an effective way to store immutible and fixed length data.",
      "However, they only make sense for small amounts of data.",
      "A point could be a tuple: (x, y)",
      "So could a color: (r, g, b)",
      "Or even: (r, g, b, a)",
      "However, once you get past small amounts of data, tuples become confusing.",
      "If you want an immutable data structure, look into the stone function and objects.",
    ]["join"]("\n");
    throw new Error(err);
  }
  let res = {};
  fields["forEach"](function (field, index) {
    res["_"["concat"]($plus(index, 1))] = field;
  });
  res["length"] = fields["length"];
  res["type"] = function () {
    return "Tuple";
  };
  res["concat"] = function (tuple) {
    if (assertBool(not($eq(typeOf(tuple), "Tuple")))) {
      throw new Error("Cannot add tuple to non-tuple.");
    }
    if (assertBool(not($eq(res["length"], tuple["length"])))) {
      throw new Error("Cannot add tuples of differing lengths.");
    }
    if (assertBool($eq(tuple["length"], 1))) {
      return Tuple($plus(res["_1"], tuple["_1"]));
    } else {
      if (assertBool($eq(tuple["length"], 2))) {
        return Tuple(
          $plus(res["_1"], tuple["_1"]),
          $plus(res["_2"], tuple["_2"])
        );
      } else {
        if (assertBool($eq(tuple["length"], 3))) {
          return Tuple(
            $plus(res["_1"], tuple["_1"]),
            $plus(res["_2"], tuple["_2"]),
            $plus(res["_3"], tuple["_3"])
          );
        } else {
          return Tuple(
            $plus(res["_1"], tuple["_1"]),
            $plus(res["_2"], tuple["_2"]),
            $plus(res["_3"], tuple["_3"]),
            $plus(res["_4"], tuple["_4"])
          );
        }
      }
    }
  };
  res["toString"] = function () {
    return "Tuple("["concat"](
      Object["entries"](res)
        ["filter"](function ([k, v]) {
          return k["startsWith"]("_");
        })
        ["map"](function ([k, v]) {
          return v;
        })
        ["join"](", "),
      ")"
    );
  };
  stone(res);
  return res;
};
module.exports = stone(Tuple);
