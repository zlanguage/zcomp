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
const primeStore = [];
const getMercens = async function (ch) {
  const $quote = cheerio["load"](
    await gr["page"]("https://www.mersenne.org/primes/")._from()
  );
  $quote($quote("article")[0])
    ["find"]("table tbody tr")
    ["each"](function () {
      const tr = $quote(this);
      const id = tr["attr"]("id");
      if (assertBool(not($eq(id, undefined)))) {
        if (assertBool(id["startsWith"]("row_m"))) {
          const idx = Number(id["replace"]("row_m", ""));
          tr["find"]("td")["each"](function () {
            const td = $quote(this);
            if (assertBool($gt(td["find"]("a")["length"], 0))) {
              const a = $quote(td["find"]("a")[0]);
              const href = a["attr"]("href");
              if (assertBool(not($eq(href, undefined)))) {
                if (assertBool(href["startsWith"]("digits/"))) {
                  primeStore[idx] = $plus$plus(
                    "https://www.mersenne.org/primes/",
                    href["replace"](".zip", ".txt")
                  );
                }
              }
            }
          });
        }
      }
    });
  send(primeStore, ch);
};
const primes = function (ch = chan()) {
  const main = async function () {
    const primeChan = chan();
    getMercens(primeChan);
    const primeList = await primeChan._from();
    const res = {
      ["number"]: function (num, ch = chan()) {
        if (!$eq(typeOf(num), "number")) {
          throw new Error("Enter failed");
        }
        if (
          assertBool(or($lt(num, 0), $gt(num, $minus(primeList["length"], 1))))
        ) {
          const errStr = $plus$plus(
            $plus$plus("There is no ", num),
            "st mersenne prime."
          );
          throw new Error(errStr);
        }
        const main = async function () {
          if (assertBool(not(primeStore[num]["startsWith"]("http")))) {
            send(primeStore[num], ch);
            return undefined;
          }
          const pg = await gr["page"](primeList[num])._from();
          primeStore[num] = pg;
          send(pg, ch);
        };
        main();
        return ch;
      },
      ["biggest"]: function () {
        return this["number"]($minus(primeList["length"], 1));
      },
      ["count"]: function () {
        return $minus(primeList["length"], 1);
      },
    };
    send(res, ch);
  };
  main();
  return ch;
};
module.exports = stone(primes);
