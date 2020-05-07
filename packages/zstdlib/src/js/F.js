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

const constructs = stone(require("./constructs.js"));
const { _raise } = constructs;
const unary = function (f) {
  return function (a) {
    return f(a);
  };
};
const map = curry(function (f, arr) {
  if (!$eq(typeOf(f), "function")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  return (function () {
    const res = [];
    for (const a of arr) {
      if (true) res.push(f(a));
    }
    return res;
  })();
});
const flatMap = curry(function (f, arr) {
  if (!$eq(typeOf(f), "function")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  return (function () {
    const res = [];
    for (const a of arr) {
      if (true)
        for (const b of f(a)) {
          if (true) res.push(b);
        }
    }
    return res;
  })();
});
const filter = curry(function (f, arr) {
  if (!$eq(typeOf(f), "function")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  return (function () {
    const res = [];
    for (const a of arr) {
      if (f(a)) res.push(a);
    }
    return res;
  })();
});
const reject = curry(function (f, arr) {
  if (!$eq(typeOf(f), "function")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  return (function () {
    const res = [];
    for (const a of arr) {
      if (not(f(a))) res.push(a);
    }
    return res;
  })();
});
const prop = curry(function (p, obj) {
  if (!$eq(typeOf(p), "string")) {
    throw new Error("Enter failed");
  }
  return obj[p];
});
const invoke = curry(function (args, f) {
  if (!$eq(typeOf(args), "array")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(f), "function")) {
    throw new Error("Enter failed");
  }
  return f(...args);
});
const reduce = curry(function (f, i, arr) {
  if (!$eq(typeOf(f), "function")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  return arr["reduce"](f, i);
});
const reverse = function (arr) {
  if (assertBool($eq(typeOf(arr), "string"))) {
    return arr["reverse"]();
  }
  return [...arr]["reverse"]();
};
const reduceRight = curry(function (f, i, arr) {
  if (!$eq(typeOf(f), "function")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  return arr["reduceRight"](f, i);
});
const every = curry(function (f, arr) {
  if (!$eq(typeOf(f), "function")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  return arr["every"](unary(f));
});
const some = curry(function (f, arr) {
  if (!$eq(typeOf(f), "function")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  return arr["some"](unary(f));
});
const constant = function (a) {
  return function () {
    return a;
  };
};
const add = curry($plus);
const sub = curry($minus);
const mul = curry($star);
const div = curry($slash);
const mod = curry($percent);
const neg = mul(-1);
const append = curry(function (a, b) {
  return $plus$plus(b, a);
});
const cat = curry(function (a$exclam, b$exclam) {
  return $plus$plus(a$exclam, b$exclam);
});
const inc = add(1);
const dec = add(-1);
const T = constant(true);
const F = constant(false);
const N = constant(null);
const U = constant(undefined);
const I = constant(Infinity);
const NN = constant(NaN);
const id = function (a$exclam) {
  return a$exclam;
};
const predArrayTest = curry(function (method, preds, arr) {
  if (!$eq(typeOf(method), "string")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeGeneric(preds), "array<function>")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  return preds[method](function (pred$exclam) {
    return pred$exclam(arr);
  });
});
const all = predArrayTest("every");
const any = predArrayTest("some");
const bothTwo = curry(function (preds, arr) {
  if (!$eq(typeGeneric(preds), "array<function>")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  if (!$eq(preds["length"], 2)) {
    throw new Error("Enter failed");
  }
  return all(preds, arr);
});
const complement = curry(function (f, v) {
  if (!$eq(typeOf(f), "function")) {
    throw new Error("Enter failed");
  }
  return not(f(v));
});
const contains = curry(function (v, col) {
  return matcher([
    [
      matcher.obj(matcher.prop("includes", matcher.type("function", ""))),
      function () {
        return col["includes"](v);
      },
    ],
    [
      matcher.obj(matcher.prop("contains", matcher.type("function", ""))),
      function () {
        return col["contains"](v);
      },
    ],
    [
      matcher.wildcard("_"),
      function (_) {
        return _raise(
          "Cannot check for element presence with contains or includes method."
        );
      },
    ],
  ])(col);
});
const count = curry(function (f, arr) {
  if (!$eq(typeOf(f), "function")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  let count = 0;
  arr["forEach"](function (elem) {
    if (assertBool(f(elem))) {
      count = $plus(count, 1);
    }
  });
  return count;
});
const zero = curry(function (f, arr) {
  return $eq(count(f, arr), 0);
});
const one = curry(function (f, arr) {
  return $eq(count(f, arr), 1);
});
const allButOne = curry(function (f, arr) {
  return $eq(count(f, arr), $minus(arr["length"], 1));
});
const methodInvoke = curry(function (methodName, arg, context) {
  if (
    assertBool(
      and(context[methodName], $eq(typeOf(context[methodName]), "function"))
    )
  ) {
    return context[methodName](arg);
  }
  _raise(
    $plus$plus(
      $plus$plus(
        $plus$plus(
          $plus$plus("The object ", context),
          " has no method called "
        ),
        methodName
      ),
      "."
    )
  );
});
const startsWith = methodInvoke("startsWith");
const endsWith = methodInvoke("endsWith");
const indexOf = methodInvoke("indexOf");
const find = methodInvoke("find");
const findIndex = methodInvoke("findIndex");
const eitherTwo = curry(function (preds, arr) {
  if (!$eq(typeGeneric(preds), "array<function>")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  if (!$eq(preds["length"], 2)) {
    throw new Error("Enter failed");
  }
  return any(preds, arr);
});
const equals = curry($eq);
const flatten = function (arr) {
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  return arr["reduce"](function (t, v) {
    let toFlatten = undefined;
    if (assertBool(Array["isArray"](v))) {
      toFlatten = flatten(v);
    } else {
      toFlatten = [v];
    }
    t["push"](...toFlatten);
    return t;
  }, []);
};
const forEach = function (f, arr) {
  if (!$eq(typeOf(f), "function")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  arr["forEach"](unary(f));
  return arr;
};
const fromEntries = function (entries) {
  if (!$eq(typeOf(entries), "array")) {
    throw new Error("Enter failed");
  }
  const res = {};
  entries["forEach"](function ([k, v]) {
    res[k] = v;
  });
  return res;
};
const entries = Object["entries"];
const has = methodInvoke("hasOwnProperty");
const head = function (col$exclam) {
  return col$exclam[0];
};
const tail = function (col$exclam) {
  return col$exclam["slice"](1);
};
const double = mul(2);
const triple = mul(3);
const indentical = curry(Object["is"]);
const identity = function (a$exclam) {
  return a$exclam;
};
const ifElse = curry(function (pred, _if, _else) {
  if (!$eq(typeOf(pred), "function")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(_if), "function")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(_else), "function")) {
    throw new Error("Enter failed");
  }
  if (assertBool(pred())) {
    _if();
  } else {
    _else();
  }
});
const $or = curry(function (f, val) {
  if (!$eq(typeOf(f), "function")) {
    throw new Error("Enter failed");
  }
  return f(val);
});
const init = $gt$gt($gt$gt(reverse, tail), reverse);
const isNil = function (x$exclam) {
  return or($eq(x$exclam, undefined), $eq(x$exclam, null));
};
const join = methodInvoke("join");
const keys = Object["keys"];
const last = $gt$gt(head, reverse);
const lastIndexOf = methodInvoke("lastIndexOf");
const length = prop("length");
const max = curry(Math["max"], 2);
const merge = curry(function (a, b) {
  return Object["assign"]([], a, b);
});
const min = curry(Math["min"], 2);
const pipe = function (fns) {
  if (!$eq(typeGeneric(fns), "array<function>")) {
    throw new Error("Enter failed");
  }
  return function (val) {
    return fns["reduce"](function (v, f) {
      return f(v);
    }, val);
  };
};
const compose = $gt$gt(pipe, reverse);
const prepend = methodInvoke("unshift");
const propEq = curry(function (prop, value, obj) {
  return $eq(obj[prop], value);
});
const range = curry(function (from, to) {
  return Array($plus($minus(to, from), 1))
    ["fill"]()
    ["map"](function (_, index) {
      return $plus(index, from);
    });
});
const sort = curry(function (c, arr) {
  if (!$eq(typeOf(c), "function")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  return [...arr]["sort"](c);
});
const sortBy = sort;
const split = methodInvoke("split");
const sum = reduce(function (t$exclam, v$exclam) {
  return $plus(t$exclam, v$exclam);
}, 0);
const take = curry(function (amount, col) {
  if (!$eq(typeOf(amount), "number")) {
    throw new Error("Enter failed");
  }
  return col["slice"](0, amount);
});
const takeLast = curry(function (amount, col) {
  if (!$eq(typeOf(amount), "number")) {
    throw new Error("Enter failed");
  }
  return col["slice"](neg(amount));
});
const test = curry(function (regex, str) {
  if (!$eq(typeOf(str), "string")) {
    throw new Error("Enter failed");
  }
  return regex["test"](str);
});
const toLower = function (str$exclam) {
  return str$exclam["toLowerCase"]();
};
const toUpper = function (str$exclam) {
  return str$exclam["toUpperCase"]();
};
const trim = function (str$exclam) {
  return str$exclam["trim"]();
};
const toPairs = Object["entries"];
const toString = function (any$exclam) {
  return any$exclam["toString"]();
};
const unique = function (arr) {
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  const theSet = JS["new"](Set, arr);
  return [...theSet];
};
const values = Object["values"];
const without = curry(function (exclude, arr) {
  if (!$eq(typeOf(exclude), "array")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  return (function () {
    const res = [];
    for (const a of arr) {
      if (not(exclude["includes"](a))) res.push(a);
    }
    return res;
  })();
});
const takeWhile = curry(function (taker, arr) {
  if (!$eq(typeOf(taker), "function")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  let res = [];
  arr["every"](function (elem) {
    let takerRes = taker(elem);
    if (assertBool(takerRes)) {
      res["push"](elem);
    }
    return takerRes;
  });
  return res;
});
const dropWhile = curry(function (dropper, arr) {
  if (!$eq(typeOf(dropper), "function")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(arr), "array")) {
    throw new Error("Enter failed");
  }
  let res = [];
  let endOfDropReached = false;
  arr["forEach"](function (elem) {
    if (assertBool(not(endOfDropReached))) {
      let dropperRes = $or$gt(dropper(elem), not);
      if (assertBool(dropperRes)) {
        res["push"](elem);
        endOfDropReached = true;
      }
    } else {
      res["push"](elem);
    }
  });
  return res;
});
const zip = curry(function (as, bs) {
  if (!$eq(typeOf(as), "array")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(bs), "array")) {
    throw new Error("Enter failed");
  }
  const entrs = entries(as);
  const trimEnd = dropWhile(function (arr$exclam) {
    return arr$exclam["includes"](undefined);
  });
  return $or$gt(
    $or$gt(
      $or$gt(
        id(
          (function () {
            const res = [];
            for (const [i, a] of entrs) {
              const b = bs[i];
              if (true) res.push([a, b]);
            }
            return res;
          })()
        ),
        reverse
      ),
      trimEnd
    ),
    reverse
  );
});
const zipWith = curry(function (f, as, bs) {
  if (!$eq(typeOf(f), "function")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(as), "array")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(bs), "array")) {
    throw new Error("Enter failed");
  }
  const entrs = entries(as);
  const trimEnd = dropWhile(function (arr$exclam) {
    return arr$exclam["includes"](undefined);
  });
  return id(
    $or$gt(
      $or$gt(
        $or$gt(
          id(
            (function () {
              const res = [];
              for (const [i, a] of entrs) {
                const b = bs[i];
                if (true) res.push([a, b]);
              }
              return res;
            })()
          ),
          reverse
        ),
        trimEnd
      ),
      reverse
    )
  )["map"](function ([a, b]) {
    return f(a, b);
  });
});
module.exports = stone({
  ["unary"]: unary,
  ["map"]: map,
  ["filter"]: filter,
  ["reject"]: reject,
  ["reduce"]: reduce,
  ["flatMap"]: flatMap,
  ["$or"]: $or,
  ["prop"]: prop,
  ["invoke"]: invoke,
  ["reverse"]: reverse,
  ["reduceRight"]: reduceRight,
  ["every"]: every,
  ["some"]: some,
  ["constant"]: constant,
  ["add"]: add,
  ["sub"]: sub,
  ["mul"]: mul,
  ["div"]: div,
  ["mod"]: mod,
  ["neg"]: neg,
  ["append"]: append,
  ["cat"]: cat,
  ["inc"]: inc,
  ["dec"]: dec,
  ["T"]: T,
  ["F"]: F,
  ["N"]: N,
  ["U"]: U,
  ["I"]: I,
  ["NN"]: NN,
  ["id"]: id,
  ["predArrayTest"]: predArrayTest,
  ["all"]: all,
  ["any"]: any,
  ["bothTwo"]: bothTwo,
  ["complement"]: complement,
  ["contains"]: contains,
  ["count"]: count,
  ["zero"]: zero,
  ["one"]: one,
  ["allButOne"]: allButOne,
  ["methodInvoke"]: methodInvoke,
  ["startsWith"]: startsWith,
  ["endsWith"]: endsWith,
  ["indexOf"]: indexOf,
  ["find"]: find,
  ["findIndex"]: findIndex,
  ["eitherTwo"]: eitherTwo,
  ["equals"]: equals,
  ["flatten"]: flatten,
  ["forEach"]: forEach,
  ["fromEntries"]: fromEntries,
  ["entries"]: entries,
  ["has"]: has,
  ["head"]: head,
  ["tail"]: tail,
  ["double"]: double,
  ["triple"]: triple,
  ["indentical"]: indentical,
  ["identity"]: identity,
  ["ifElse"]: ifElse,
  ["init"]: init,
  ["isNil"]: isNil,
  ["join"]: join,
  ["keys"]: keys,
  ["last"]: last,
  ["lastIndexOf"]: lastIndexOf,
  ["length"]: length,
  ["max"]: max,
  ["merge"]: merge,
  ["min"]: min,
  ["pipe"]: pipe,
  ["compose"]: compose,
  ["prepend"]: prepend,
  ["propEq"]: propEq,
  ["range"]: range,
  ["sort"]: sort,
  ["sortBy"]: sortBy,
  ["split"]: split,
  ["sum"]: sum,
  ["take"]: take,
  ["takeLast"]: takeLast,
  ["test"]: test,
  ["toLower"]: toLower,
  ["toUpper"]: toUpper,
  ["trim"]: trim,
  ["toPairs"]: toPairs,
  ["toString"]: toString,
  ["unique"]: unique,
  ["values"]: values,
  ["without"]: without,
  ["takeWhile"]: takeWhile,
  ["dropWhile"]: dropWhile,
  ["zip"]: zip,
  ["zipWith"]: zipWith,
});
