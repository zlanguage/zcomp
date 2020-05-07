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
const handleErr = $Z.handleErr;

const constant = function (value) {
  return function () {
    return value;
  };
};
const integer = function (from = 0, to = Number["MAX_SAFE_INTEGER"], step = 1) {
  return function () {
    if (assertBool($lt(from, to))) {
      const result = from;
      from = $plus(from, step);
      return result;
    }
  };
};
const element = function (array, gen = integer(0, array["length"])) {
  return function (...args) {
    const elementNumber = gen(...args);
    if (assertBool(not($eq(elementNumber, undefined)))) {
      return array[elementNumber];
    }
  };
};
const property = function (object, gen = element(Object["keys"](object))) {
  return function (...args) {
    const key = gen(...args);
    if (assertBool(not($eq(key, undefined)))) {
      return [key, object[key]];
    }
  };
};
const collect = function (gen, arr) {
  return function (...args) {
    const val = gen(...args);
    if (assertBool(not($eq(val, undefined)))) {
      arr["push"](val);
    }
    return val;
  };
};
const repeat = function (gen) {
  while (true) {
    if (assertBool($eq(gen(), undefined))) {
      break;
    }
  }
};
const harvest = function (gen) {
  const arr = [];
  repeat(collect(gen, arr));
  return arr;
};
const limit = function (gen, count = 1) {
  return function (...args) {
    if (assertBool($gt$eq(count, 1))) {
      $minus$eq(count, 1);
      return gen(...args);
    }
  };
};
const filter = function (gen, pred) {
  const filterGen = function (...args) {
    const val = generator(...args);
    if (assertBool(and(not($eq(val, undefined)), not(pred(val))))) {
      return filterGen(...args);
    }
    return val;
  };
  return filterGen;
};
const concat = function (...gens) {
  const next = element(gens);
  const gen = next();
  const concatGen = function (...args) {
    if (assertBool(not($eq(gen, undefined)))) {
      const val = gen(...args);
      if (assertBool($eq(val, undefined))) {
        gen = next();
        return concatGen(...args);
      }
      return val;
    }
  };
};
const join = function (f, ...gens) {
  return function () {
    const results = gens["map"](function (gen$exclam) {
      return gen$exclam();
    });
    if (
      assertBool(
        not(
          results["every"](function (result$exclam) {
            return $eq(result$exclam, undefined);
          })
        )
      )
    ) {
      return f(...results);
    }
    return undefined;
  };
};
const map = function (f, arr) {
  return join(f, element(arr));
};
const struct = function (...names) {
  return function (...vals) {
    const obj = Object["create"](null);
    names["forEach"](function (name, index) {
      obj[name] = vals[index];
    });
    return obj;
  };
};
module.exports = stone({
  ["constant"]: constant,
  ["integer"]: integer,
  ["element"]: element,
  ["property"]: property,
  ["collect"]: collect,
  ["repeat"]: repeat,
  ["harvest"]: harvest,
  ["limit"]: limit,
  ["filter"]: filter,
  ["concat"]: concat,
  ["join"]: join,
  ["map"]: map,
  ["struct"]: struct,
});
