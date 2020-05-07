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

const cheerio = stone(require("cheerio"));
const gr = stone(require("./gr"));
const mkView = function (txts) {
  let sc = undefined;
  txts = stone(txts);
  return {
    ["sentences"]: function () {
      if (assertBool(not($eq(sc, undefined)))) {
        return sc;
      }
      const sentences = [""];
      let idx = 0;
      txts["forEach"](function (txt) {
        if (assertBool(not(txt["includes"](".")))) {
          sentences[idx] = $plus$plus(sentences[idx], txt);
        } else {
          const [end, start] = txt["split"](".");
          sentences[idx] = $plus$plus($plus$plus(sentences[idx], end), ".");
          idx = $plus(idx, 1);
          sentences[idx] = start;
        }
      });
      sc = stone(
        sentences["map"](function (obj) {
          return obj["trim"]();
        })
      );
      return sc;
    },
    ["thingsAbout"]: function (thing) {
      if (!$eq(typeOf(thing), "string")) {
        throw new Error("Enter failed");
      }
      thing = RegExp(thing);
      return this["sentences"]()["filter"](function (string$exclam) {
        return thing["test"](string$exclam);
      });
    },
    ["raw"]: function () {
      return txts;
    },
  };
};
const scrapy = function (url, ch = chan()) {
  const main = async function () {
    const $quote = cheerio["load"](await gr["page"](url)._from());
    const txts = [];
    const findText = function () {
      if (
        assertBool(
          and(
            and(
              $eq(this["nodeType"], 3),
              not($eq(this["parent"]["type"], "script"))
            ),
            not(JS["=="](this["data"], 0))
          )
        )
      ) {
        txts["push"](this["data"]);
      } else {
        $quote(this)["contents"]()["each"](findText);
      }
    };
    $quote(":root")["contents"]()["each"](findText);
    send(mkView(txts), ch);
  };
  main();
  return ch;
};
module.exports = stone(scrapy);
