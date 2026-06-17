import { test } from "node:test";
import assert from "node:assert/strict";
import { Signal, TriggerType, Dashboard, Actor } from "@paperclip/shared";

test("Signal enum 3 sinyal içerir (yeşil/sarı/kırmızı)", () => {
  assert.deepEqual(Object.values(Signal), ["GREEN", "YELLOW", "RED"]);
});

test("TriggerType 4 tetikleyici tipini içerir", () => {
  assert.equal(Object.values(TriggerType).length, 4);
  assert.ok(TriggerType.ABSENCE && TriggerType.THRESHOLD);
  assert.ok(TriggerType.EVENT && TriggerType.CADENCE);
});

test("Dashboard 5+1 panel içerir", () => {
  assert.equal(Object.values(Dashboard).length, 6);
});

test("Actor COWORK/İNSAN/CODE/SYSTEM içerir", () => {
  assert.deepEqual(Object.values(Actor), ["COWORK", "INSAN", "CODE", "SYSTEM"]);
});
