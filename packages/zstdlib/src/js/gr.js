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

const fs = stone(require("fs"));
const https = stone(require("https"));
const readline = stone(require("readline"));
const F = stone(require("./F"));
const gerror = function (err, ch) {
  send(
    {
      ["__err__"]: true,
      ["error"]: err,
    },
    ch
  );
};
const wrapNodeCB = function (context, f) {
  return function (...args) {
    let spec = undefined;
    let ch = undefined;
    if (assertBool($gt(args["length"], 1))) {
      spec = F["init"](args);
      ch = F["last"](args);
    } else {
      spec = [args[0]];
      ch = chan();
    }
    f["apply"](context, [
      ...spec,
      function (err, data) {
        if (assertBool(Boolean(err))) {
          gerror(err, ch);
        } else {
          send(data, ch);
        }
      },
    ]);
    return ch;
  };
};
const readfile = wrapNodeCB(fs, fs["readFile"]);
const writefile = wrapNodeCB(fs, fs["writeFile"]);
const json = function (url, ch = chan()) {
  https["get"](url, function (resp) {
    let data = "";
    resp["on"]("data", function (chunk) {
      data = $plus$plus(data, chunk);
    });
    resp["on"]("end", function () {
      try {
        JSON["parse"](data);
      } catch (err) {
        gerror(err, ch);
        err["settled"] = true;
        return undefined;
        if (assertBool($eq(err["settled"], undefined))) {
          throw new Error("Error err not settled.");
        }
      }
      send(JSON["parse"](data), ch);
    });
  })["on"]("error", function (err) {
    gerror(err, ch);
  });
  return ch;
};
const page = function (url, ch = chan()) {
  https["get"](url, function (resp) {
    let data = "";
    resp["on"]("data", function (chunk) {
      data = $plus$plus(data, chunk);
    });
    resp["on"]("end", function () {
      send(data, ch);
    });
  })["on"]("error", function (err) {
    gerror(err, ch);
  });
  return ch;
};
const line = function (prompt = "", ch = chan()) {
  const rl = readline["createInterface"]({
    ["input"]: process["stdin"],
    ["output"]: process["stdout"],
  });
  rl["question"](prompt, function (line) {
    rl["close"]();
    send(line, ch);
  });
  return ch;
};
line["_from"] = function () {
  return JS["new"](Promise, function (resolve) {
    const rl = readline["createInterface"]({
      ["input"]: process["stdin"],
      ["output"]: process["stdout"],
    });
    rl["question"]("", function (line) {
      rl["close"]();
      resolve(line);
    });
  });
};
const wrapPromise = function (prom, ch = chan()) {
  prom["then"](
    function (res) {
      send(res, ch);
    },
    function (err) {
      gerror(err, ch);
    }
  );
  return ch;
};
const all = function (chs, ch = chan()) {
  Promise["all"](
    chs["map"](function (ch$exclam) {
      return ch$exclam["_from"]();
    })
  )["then"](function (reses) {
    send(reses, ch);
  });
  return ch;
};
const race = function (chs, ch = chan()) {
  Promise["race"](
    chs["map"](function (ch$exclam) {
      return ch$exclam["_from"]();
    })
  )["then"](function (reses) {
    send(reses, ch);
  });
  return ch;
};
const status = function (chs, ch = chan()) {
  Promise["all"](
    chs["map"](function (ch$exclam) {
      return ch$exclam["_from"]()["then"](function (value) {
        if (assertBool($eq(value["__err__"], true))) {
          return {
            ["state"]: "failed",
            ["error"]: value["error"],
          };
        }
        return {
          ["state"]: "succeeded",
          ["result"]: value,
        };
      });
    })
  )["then"](function (reses) {
    send(reses, ch);
  });
  return ch;
};
const any = function (chs, ch = chan()) {
  const fails = [];
  let valueSent = false;
  chs["forEach"](function (c, index) {
    c["_from"]()["then"](function (value) {
      if (assertBool($eq(value["__err__"], true))) {
        fails[index] = value["error"];
      } else {
        if (assertBool(not(valueSent))) {
          send(value, ch);
          valueSent = true;
        }
      }
      if (
        assertBool(
          $eq(
            fails["reduce"](function (t$exclam) {
              return $plus(t$exclam, 1);
            }, 0),
            chs["length"]
          )
        )
      ) {
        send(fails, ch);
      }
    });
  });
  return ch;
};
const wait = function (ms, ch = chan()) {
  setTimeout(function () {
    send(Symbol(), ch);
  }, ms);
  return ch;
};
const waitUntil = function (cond, ch = chan()) {
  const conditionInterval = setInterval(function () {
    if (assertBool(cond())) {
      clearInterval(conditionInterval);
      send(Symbol(), ch);
    }
  }, 100);
  return ch;
};
const give = function (ch = chan()) {
  wait(10, ch);
  return ch;
};
const listen = async function (cb, ch) {
  while (true) {
    const val = await ch._from();
    cb(val);
  }
};
const select = function (chs, ch = chan()) {
  let valueSent = false;
  chs["forEach"](function ([c, cb]) {
    c["_from"]()["then"](function (res) {
      if (assertBool(not(valueSent))) {
        valueSent = true;
        send(cb(res), ch);
      }
    });
  });
  return ch;
};
module.exports = stone({
  ["gerror"]: gerror,
  ["wrapNodeCB"]: wrapNodeCB,
  ["readfile"]: readfile,
  ["writefile"]: writefile,
  ["json"]: json,
  ["page"]: page,
  ["line"]: line,
  ["wrapPromise"]: wrapPromise,
  ["all"]: all,
  ["race"]: race,
  ["status"]: status,
  ["any"]: any,
  ["wait"]: wait,
  ["waitUntil"]: waitUntil,
  ["give"]: give,
  ["listen"]: listen,
  ["select"]: select,
});
