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

const _raise = function (msg) {
  throw new Error(msg);
};
var Actor = function (onMessage, state = {}) {
  if (!$eq(typeOf(onMessage), "function")) {
    throw new Error("Enter failed");
  }
  if (!$eq(onMessage["length"], 3)) {
    throw new Error("Enter failed");
  }
  let mailbox = [];
  let listening = false;
  var recieve = function (message) {
    mailbox["unshift"](message);
  };
  var listen = function (whenDone = function () {}) {
    if (!($eq(typeOf(whenDone), "function") && $eq(whenDone["length"], 1))) {
      throw new Error("Enter failed");
    }
    if (assertBool(not(listening))) {
      let lastActorComplete = true;
      const done = function (itemsLeft) {
        return function (newState = {}) {
          state = newState;
          lastActorComplete = true;
          if (assertBool($eq(itemsLeft, 0))) {
            whenDone(state);
          }
        };
      };
      setInterval(function () {
        if (assertBool(and($gt(mailbox["length"], 0), lastActorComplete))) {
          lastActorComplete = false;
          onMessage(mailbox["pop"](), state, done(mailbox["length"]));
        }
      }, 0);
    }
  };
  return {
    ["type"]: function () {
      return "Actor";
    },
    ["recieve"]: recieve,
    ["listen"]: listen,
  };
};
var send$quote = function (message, actor) {
  if (!$eq(typeOf(message), "string")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(actor), "Actor")) {
    throw new Error("Enter failed");
  }
  actor["recieve"](message);
};
var sendAll = function (messages, actor) {
  if (!$eq(typeOf(messages), "array")) {
    throw new Error("Enter failed");
  }
  if (!$eq(typeOf(actor), "Actor")) {
    throw new Error("Enter failed");
  }
  messages["forEach"](function (message) {
    actor["recieve"](message);
  });
};
var $or$lt$lt = function (actor, listener = function (_) {}) {
  if (!$eq(typeOf(actor), "Actor")) {
    throw new Error("Enter failed");
  }
  if (!($eq(typeOf(listener), "function") && $eq(listener["length"], 1))) {
    throw new Error("Enter failed");
  }
  actor["listen"](listener);
};
var $or$gt$gt = function (messages, actor) {
  return matcher([
    [
      matcher.type("string", ""),
      function () {
        return send(messages, actor);
      },
    ],
    [
      matcher.type("array", ""),
      function () {
        return sendAll(messages, actor);
      },
    ],
    [
      matcher.wildcard("_"),
      function (_) {
        return _raise("Invalid messages passed to send function.");
      },
    ],
  ])(messages);
};
module.exports = stone({
  ["Actor"]: Actor,
  ["send"]: send$quote,
  ["sendAll"]: sendAll,
  ["$or$lt$lt"]: $or$lt$lt,
  ["$or$gt$gt"]: $or$gt$gt,
});
