import { test } from "node:test";
import assert from "node:assert/strict";
import { Signal } from "@paperclip/shared";
import { parseSender } from "../src/google/gmail.js";
import { mailSignal, mailToTaskDescription } from "../src/engine/intake.js";

test("parseSender: açılı parantezli adresi ayıklar", () => {
  assert.equal(parseSender("Ahmet K. <ahmet@example.com>"), "ahmet@example.com");
  assert.equal(parseSender("plain@example.com"), "plain@example.com");
});

test("mailSignal: atanmışsa YEŞİL", () => {
  assert.equal(mailSignal(100, true), Signal.GREEN);
});
test("mailSignal: atanmamış <24s → YEŞİL", () => {
  assert.equal(mailSignal(10, false), Signal.GREEN);
});
test("mailSignal: atanmamış 24-48s → SARI", () => {
  assert.equal(mailSignal(30, false), Signal.YELLOW);
});
test("mailSignal: atanmamış >=48s → KIRMIZI", () => {
  assert.equal(mailSignal(50, false), Signal.RED);
});

test("mailToTaskDescription: konu ve göndereni içerir", () => {
  const d = mailToTaskDescription({ id: "1", from: "x@y.com", subject: "Sözleşme", snippet: "", date: "" });
  assert.match(d, /Sözleşme/);
  assert.match(d, /x@y\.com/);
});
