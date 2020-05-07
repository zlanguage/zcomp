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

const makePatTester = function (type) {
  return function (pat) {
    return $eq(typeOf(pat), "<|"["concat"](type, "|>"));
  };
};
const isWildcard = makePatTester("wildcard");
const isArr = makePatTester("arr");
const isRest = makePatTester("rest");
const isType = makePatTester("type");
const isObj = makePatTester("obj");
const isProp = makePatTester("prop");
const isRange = makePatTester("range");
const isExtractor = makePatTester("extractor");
const isPredicate = makePatTester("predicate");
const pat$eq = function (val, pat) {
  if (assertBool(isWildcard(pat))) {
    return true;
  } else {
    if (assertBool(isArr(pat))) {
      if (assertBool(not(Array["isArray"](val)))) {
        return false;
      }
      return pat["parts"]["every"](function (patpart, index) {
        if (assertBool(isRest(patpart))) {
          return true;
        }
        return pat$eq(val[index], patpart);
      });
    } else {
      if (assertBool(isType(pat))) {
        if (assertBool($eq(typeOf(val), pat["typ"]))) {
          return true;
        }
        return false;
      } else {
        if (assertBool(isObj(pat))) {
          if (assertBool(not(isObject(val)))) {
            return false;
          }
          return pat["props"]["every"](function (prop) {
            if (assertBool(not(isProp(prop)))) {
              return false;
            }
            return pat$eq(val[prop["key"]], prop["value"]);
          });
        } else {
          if (assertBool(isRange(pat))) {
            if (
              assertBool(both($gt$eq(val, pat["from"]), $lt$eq(val, pat["to"])))
            ) {
              return true;
            }
            return false;
          } else {
            if (assertBool(isExtractor(pat))) {
              if (assertBool($eq(pat["extract"](val), undefined))) {
                return false;
              }
              return true;
            } else {
              if (assertBool(isPredicate(pat))) {
                return Boolean(pat["test"](val));
              }
            }
          }
        }
      }
    }
  }
  return $eq(val, pat);
};
const gatherWildcards = function (val, pat) {
  let wildcards = [];
  if (assertBool(isWildcard(pat))) {
    wildcards["push"](val);
  } else {
    if (assertBool(isArr(pat))) {
      pat["parts"]["some"](function (patpart, index) {
        if (assertBool(isRest(patpart))) {
          wildcards["push"](val["slice"](index));
          return true;
        }
        wildcards["push"](...gatherWildcards(val[index], patpart));
        return false;
      });
    } else {
      if (assertBool(isType(pat))) {
        if (assertBool(not($eq(pat["str"], undefined)))) {
          wildcards["push"](val);
        }
      } else {
        if (assertBool(isObj(pat))) {
          pat["props"]["forEach"](function (prop) {
            wildcards["push"](
              ...gatherWildcards(val[prop["key"]], prop["value"])
            );
          });
        } else {
          if (assertBool(isExtractor(pat))) {
            wildcards["push"](
              ...gatherWildcards(pat["extract"](val), pat["pat"])
            );
          }
        }
      }
    }
  }
  return wildcards;
};
const wildcard = function (str) {
  return {
    ["type"]: function () {
      return "<|wildcard|>";
    },
    ["str"]: str,
  };
};
const arr = function (...parts) {
  return {
    ["type"]: function () {
      return "<|arr|>";
    },
    ["parts"]: parts,
  };
};
const rest = function (str) {
  return {
    ["type"]: function () {
      return "<|rest|>";
    },
    ["str"]: str,
  };
};
const type = function (typ, str) {
  return {
    ["type"]: function () {
      return "<|type|>";
    },
    ["typ"]: typ,
    ["str"]: str,
  };
};
const obj = function (...props) {
  return {
    ["type"]: function () {
      return "<|obj|>";
    },
    ["props"]: props,
  };
};
const prop = function (key, value) {
  return {
    ["type"]: function () {
      return "<|prop|>";
    },
    ["key"]: key,
    ["value"]: value,
  };
};
const extractor = function (extract, pat) {
  return {
    ["type"]: function () {
      return "<|extractor|>";
    },
    ["extract"]: extract["extract"],
    ["pat"]: pat,
  };
};
const range = function (from, to) {
  return {
    ["type"]: function () {
      return "<|range|>";
    },
    ["from"]: from,
    ["to"]: to,
  };
};
const predicate = function (pred) {
  return {
    ["type"]: function () {
      return "<|predicate|>";
    },
    ["test"]: pred,
  };
};
let _matcher = function (pats) {
  return function (val) {
    let res = undefined;
    pats["some"](function ([pat, resfunc]) {
      if (assertBool(pat$eq(val, pat))) {
        const wildcards = gatherWildcards(val, pat);
        res = resfunc(...wildcards);
        return true;
      }
      return false;
    });
    return res;
  };
};
_matcher["wildcard"] = wildcard;
_matcher["arr"] = arr;
_matcher["rest"] = rest;
_matcher["prop"] = prop;
_matcher["type"] = type;
_matcher["obj"] = obj;
_matcher["range"] = range;
_matcher["extractor"] = extractor;
_matcher["predicate"] = predicate;
module.exports = stone(_matcher);
