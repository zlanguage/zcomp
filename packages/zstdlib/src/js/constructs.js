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

const _if = function (cond) {
  return {
    ["then"]: function (res) {
      return {
        ["_else"]: function (otherres) {
          if (assertBool(cond)) {
            return res();
          } else {
            return otherres();
          }
        },
      };
    },
  };
};
const _loop = function (body) {
  const cancel = Symbol("cancel");
  while (true) {
    if (assertBool($eq(body(cancel), cancel))) {
      break;
    }
  }
};
const _while = function (cond) {
  return function (body) {
    while (true) {
      if (assertBool(not(cond()))) {
        break;
      }
      body();
    }
  };
};
const _do = function (body) {
  return {
    ["_while"]: function (cond) {
      while (true) {
        body();
        if (assertBool(not(cond()))) {
          break;
        }
      }
    },
  };
};
const _for = function (init, cond, step) {
  return function (body) {
    let state = matcher([
      [
        matcher.type("array", "arr"),
        function (arr) {
          return arr;
        },
      ],
      [
        matcher.wildcard("_"),
        function (_) {
          return [_];
        },
      ],
    ])(init());
    while (true) {
      body(...state);
      state = matcher([
        [
          matcher.type("array", "arr"),
          function (arr) {
            return arr;
          },
        ],
        [
          matcher.wildcard("_"),
          function (_) {
            return [_, ...state["slice"](1)];
          },
        ],
      ])(step(...state));
      if (assertBool(not(cond(...state)))) {
        break;
      }
    }
  };
};
const _unless = function (cond) {
  return {
    ["do"]: function (body) {
      if (assertBool(not(cond))) {
        body();
      }
    },
  };
};
const _until = function (cond) {
  return function (body) {
    while (true) {
      if (assertBool(cond())) {
        break;
      }
      body();
    }
  };
};
const _raise = function (str) {
  throw new Error(str);
};
const _settle = function (err) {
  err["settled"] = true;
};
const _try = function (body) {
  return {
    ["_on"]: function (handler) {
      try {
        body();
      } catch (err) {
        handler(err);
        if (assertBool($eq(err["settled"], undefined))) {
          throw new Error("Error err not settled.");
        }
      }
    },
  };
};
module.exports = stone({
  ["_if"]: _if,
  ["_loop"]: _loop,
  ["_while"]: _while,
  ["_do"]: _do,
  ["_for"]: _for,
  ["_unless"]: _unless,
  ["_until"]: _until,
  ["_raise"]: _raise,
  ["_settle"]: _settle,
  ["_try"]: _try,
});
