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

const F = stone(require("./F"));
const Show = function (obj) {
  obj["toString"] = function () {
    let r = $plus$plus(obj["constructor"]["name"], "(");
    r = $plus$plus(
      r,
      obj["fields"]
        ["map"](function (field$exclam) {
          return $plus$plus($plus$plus(field$exclam, ": "), obj[field$exclam]);
        })
        ["join"](", ")
    );
    return $plus$plus(r, ")");
  };
  return obj;
};
const Ord = function (obj) {
  obj["<"] = function (other) {
    if (assertBool(not($eq(other["parent"], obj["parent"])))) {
      return false;
    }
    const order = obj["parent"]["order"];
    const objIndex = order["findIndex"](function (con$exclam) {
      return $eq(con$exclam, obj["constructor"]);
    });
    const otherIndex = order["findIndex"](function (con$exclam) {
      return $eq(con$exclam, other["constructor"]);
    });
    if (assertBool($lt(objIndex, otherIndex))) {
      return true;
    } else {
      if (assertBool($eq(objIndex, otherIndex))) {
        let i = 0;
        const fields = obj["fields"];
        while (true) {
          if (assertBool($gt$eq(i, fields["length"]))) {
            break;
          }
          if (assertBool($lt(obj[fields[i]], other[fields[i]]))) {
            return true;
          }
          if (assertBool($gt(obj[fields[i]], other[fields[i]]))) {
            return false;
          }
          i = $plus(i, 1);
        }
      }
    }
    return false;
  };
  return obj;
};
const Read = function (obj) {
  const parse = function (arg) {
    if (assertBool(not(Number["isNaN"](Number(arg))))) {
      return Number(arg);
    } else {
      if (assertBool($eq(arg, "true"))) {
        return true;
      } else {
        if (assertBool($eq(arg, "false"))) {
          return false;
        } else {
          if (assertBool($eq(arg, "null"))) {
            return null;
          } else {
            if (assertBool($eq(arg, "undefined"))) {
              return undefined;
            } else {
              if (assertBool($eq(arg, "NaN"))) {
                return NaN;
              } else {
                if (assertBool($eq(arg, "Infinity"))) {
                  return Infinity;
                }
              }
            }
          }
        }
      }
    }
    return arg;
  };
  obj["read"] = function (str) {
    if (!$eq(typeOf(str), "string")) {
      throw new Error("Enter failed");
    }
    const type = str["split"]("(")[0];
    const constructor = obj["order"]["find"](function (struct$exclam) {
      return $eq(struct$exclam["name"], type);
    });
    let args = undefined;
    try {
      args = str["split"]("(")[1]
        ["slice"](0, -1)
        ["split"](",")
        ["map"](function (str$exclam) {
          return str$exclam["trim"]();
        });
    } catch (err) {
      args = [];
      err["settled"] = true;
      if (assertBool($eq(err["settled"], undefined))) {
        throw new Error("Error err not settled.");
      }
    }
    if (
      assertBool(
        not(
          args["some"](function (arg$exclam) {
            return arg$exclam["includes"](":");
          })
        )
      )
    ) {
      const readArgs = args["map"](parse);
      return constructor(...readArgs);
    } else {
      const params = {};
      args["forEach"](function (arg) {
        const key = arg["split"](":")[0]["trim"]();
        const value = parse(arg["split"](":")[1]["trim"]());
        params[key] = value;
      });
      return constructor(params);
    }
  };
  return obj;
};
const Copy = function (obj) {
  obj["copy"] = function (spec) {
    obj["fields"]["forEach"](function (field) {
      if (assertBool(not(spec["hasOwnProperty"](field)))) {
        spec[field] = obj[field];
      }
    });
    const newSpec = {};
    obj["fields"]["forEach"](function (field) {
      newSpec[field] = spec[field];
    });
    return obj["constructor"](newSpec);
  };
  return obj;
};
const Enum = function (obj) {
  const order = obj["parent"]["order"];
  const index = order["findIndex"](function (con$exclam) {
    return $eq(con$exclam, obj["constructor"]);
  });
  obj["prev"] = function () {
    return order[$minus(index, 1)]();
  };
  obj["succ"] = function () {
    return order[$plus(index, 1)]();
  };
  obj["to"] = function (othercon) {
    othercon = othercon["constructor"];
    const target = order["findIndex"](function (con$exclam) {
      return $eq(con$exclam, othercon);
    });
    if (assertBool($gt$eq(target, index))) {
      const res = [obj["constructor"]()];
      let tracker = obj;
      let tempIndex = index;
      while (true) {
        if (assertBool($gt$eq(tempIndex, target))) {
          break;
        }
        tracker = tracker["succ"]();
        res["push"](tracker);
        tempIndex = $plus(tempIndex, 1);
      }
      return res;
    } else {
      const res = [obj["constructor"]()];
      let tracker = obj;
      let tempIndex = index;
      while (true) {
        if (assertBool($lt$eq(tempIndex, target))) {
          break;
        }
        tracker = tracker["prev"]();
        res["push"](tracker);
        tempIndex = $minus(tempIndex, 1);
      }
      return res;
    }
  };
  return obj;
};
const PlusMinus = function (obj) {
  const order = obj["parent"]["order"];
  const index = order["findIndex"](function (con$exclam) {
    return $eq(con$exclam, obj["constructor"]);
  });
  obj["+"] = function (other) {
    const otherIndex = order["findIndex"](function (con$exclam) {
      return $eq(con$exclam, other["constructor"]);
    });
    if (assertBool(not($eq(index, otherIndex)))) {
      const sum = $plus(index, otherIndex);
      return order[$percent(sum, order["length"])]();
    } else {
      const args = [];
      obj["fields"]["forEach"](function (field) {
        args["push"]($plus(obj[field], other[field]));
      });
      return obj["constructor"](...args);
    }
  };
  obj["-"] = function (other) {
    const otherIndex = order["findIndex"](function (con$exclam) {
      return $eq(con$exclam, other["constructor"]);
    });
    if (assertBool(not($eq(index, otherIndex)))) {
      let dif = $minus(index, otherIndex);
      if (assertBool($lt(dif, 0))) {
        dif = $plus(order["length"], dif);
      }
      return order[$percent(dif, order["length"])]();
    } else {
      const args = [];
      obj["fields"]["forEach"](function (field) {
        args["push"]($minus(obj[field], other[field]));
      });
      return obj["constructor"](...args);
    }
  };
  return obj;
};
const Json = function (obj) {
  obj["toJSON"] = function () {
    const res = {
      ["type"]: obj["constructor"]["name"],
    };
    obj["fields"]["forEach"](function (field) {
      res[field] = obj[field];
    });
    return res;
  };
  return obj;
};
const Curry = function (obj) {
  Object["keys"](obj)["forEach"](function (key) {
    if (assertBool($eq(typeOf(obj[key]), "function"))) {
      obj[key] = curry(obj[key]);
    }
  });
  return obj;
};
module.exports = stone({
  ["Show"]: Show,
  ["Read"]: Read,
  ["Ord"]: Ord,
  ["Copy"]: Copy,
  ["Enum"]: Enum,
  ["PlusMinus"]: PlusMinus,
  ["Json"]: Json,
  ["Curry"]: Curry,
});
