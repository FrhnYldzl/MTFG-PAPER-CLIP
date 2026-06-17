import { test } from "node:test";
import assert from "node:assert/strict";
import { Signal } from "@paperclip/shared";
import { auditSignal, opexSignal } from "../src/engine/motorC.js";

// Kabul kriteri: Fevup haftalık özet gelmedi → KIRMIZI
test("rapor gelmedi (absent) → KIRMIZI", () => {
  assert.equal(auditSignal("absent"), Signal.RED);
});
test("rapor gecikti (late) → SARI", () => {
  assert.equal(auditSignal("late"), Signal.YELLOW);
});
test("rapor geldi (present) → YEŞİL", () => {
  assert.equal(auditSignal("present"), Signal.GREEN);
});

// OPEX karşılama eşiği
test("OPEX %100 karşılandı → YEŞİL", () => {
  assert.equal(opexSignal(100), Signal.GREEN);
});
test("OPEX %90 → SARI", () => {
  assert.equal(opexSignal(90), Signal.YELLOW);
});
test("OPEX %75 → KIRMIZI", () => {
  assert.equal(opexSignal(75), Signal.RED);
});
test("OPEX %80 tam sınır → SARI (>=80 kırmızı değil)", () => {
  assert.equal(opexSignal(80), Signal.YELLOW);
});
