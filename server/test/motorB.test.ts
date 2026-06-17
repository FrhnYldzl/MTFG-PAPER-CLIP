import { test } from "node:test";
import assert from "node:assert/strict";
import { Signal } from "@paperclip/shared";
import { networkSignal } from "../src/engine/motorB.js";

// Kabul kriteri: network 0 → KIRMIZI (network'süz hafta)
test("0 görüşme (hedef 1) → KIRMIZI", () => {
  assert.equal(networkSignal(0, 1), Signal.RED);
});

test("1 görüşme (hedef 1) → YEŞİL (hedefe ulaşıldı)", () => {
  assert.equal(networkSignal(1, 1), Signal.GREEN);
});

test("2 görüşme (hedef 1) → YEŞİL", () => {
  assert.equal(networkSignal(2, 1), Signal.GREEN);
});

test("1 görüşme (hedef 2) → SARI (hedefin altında)", () => {
  assert.equal(networkSignal(1, 2), Signal.YELLOW);
});

test("0 görüşme (hedef 2) → KIRMIZI", () => {
  assert.equal(networkSignal(0, 2), Signal.RED);
});
