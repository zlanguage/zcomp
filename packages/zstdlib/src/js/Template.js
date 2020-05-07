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

const templateRegExp = RegExp("{{(.+?)(:(.+))?}}", "g");
const fetchProp = function (propList, obj) {
  if (assertBool($eq(propList["length"], 1))) {
    return obj[propList[0]];
  }
  return fetchProp(propList["slice"](1), obj[propList[0]]);
};
const stdFuncs = {};
const template = function (string, funcs) {
  if (assertBool(not(funcs))) {
    funcs = stdFuncs;
  }
  return {
    ["resolve"]: function (data) {
      return string["replace"](templateRegExp, function (
        ignore,
        prop,
        funcstr
      ) {
        if (assertBool(not(funcstr))) {
          funcstr = "";
        }
        let res = undefined;
        if (assertBool(not(prop["includes"](".")))) {
          res = data[prop];
        } else {
          const propList = prop["split"](".");
          res = fetchProp(propList, data);
        }
        const transformer = funcs[funcstr["slice"](1)];
        if (assertBool($eq(typeOf(transformer), "function"))) {
          res = transformer(res);
        }
        return res;
      });
    },
  };
};
module.exports = stone(template);
