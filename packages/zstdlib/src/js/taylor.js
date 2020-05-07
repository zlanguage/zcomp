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
const sequence = function (biop) {
  return function (start, term) {
    start = Decimal(start);
    return {
      ["approx"]: function (amt, ...prefs) {
        amt = Decimal(amt);
        let result = start;
        $plus$plus(
          [],
          (function () {
            const res = [];
            for (const num of to(start, amt)) {
              if (true) res.push((result = biop(result, term(num, ...prefs))));
            }
            return res;
          })()
        );
        return result;
      },
    };
  };
};
const taylor = {
  ["sum"]: sequence($plus),
  ["prod"]: sequence($star),
  ["seq"]: sequence,
};
const fac = function (num) {
  if (assertBool($eq(num, 0))) {
    return 1;
  }
  return $or$gt(to(Decimal(1), num), function (obj) {
    return obj["reduce"]($star);
  });
};
taylor["E"] = taylor["sum"](0, function (x$exclam, digit$exclam) {
  return Decimal(1)["/"](fac(x$exclam), digit$exclam);
});
taylor["PI"] = taylor["sum"](0, function (x, digit) {
  x = Decimal(x);
  if (assertBool($eq(x, 0))) {
    return 4;
  }
  let sign = 1;
  if (assertBool(not($eq($slash(x, 2), Decimal["floor"]($slash(x, 2)))))) {
    sign = -1;
  }
  return $star(Decimal(4)["/"]($plus($star(x, 2), 1), digit), sign);
});
taylor["sin"] = taylor["sum"](0, function (k, x) {
  x = Decimal(x);
  if (assertBool($eq(k, 0))) {
    return x;
  }
  let sign = 1;
  if (assertBool($eq($percent(k, 2), 1))) {
    sign = -1;
  }
  const amt = $plus($star(k, 2), 1);
  const expResult = Array(
    $or$gt(amt, function (obj) {
      return obj["toNumber"]();
    })
  )
    ["fill"](x)
    ["reduce"]($star);
  return $star($slash(expResult, fac(amt)), sign);
});
taylor["cos"] = taylor["sum"](0, function (k, x) {
  x = Decimal(x);
  if (assertBool($eq(k, 0))) {
    return 1;
  }
  let sign = 1;
  if (assertBool($eq($percent(k, 2), 1))) {
    sign = -1;
  }
  const amt = $star(k, 2);
  const expResult = Array(
    $or$gt(amt, function (obj) {
      return obj["toNumber"]();
    })
  )
    ["fill"](x)
    ["reduce"]($star);
  return $star($slash(expResult, fac(amt)), sign);
});
module.exports = stone(taylor);
