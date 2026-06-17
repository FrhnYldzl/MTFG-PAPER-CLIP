import { test } from "node:test";
import assert from "node:assert/strict";
import { Signal } from "@paperclip/shared";
import { achievementPct, targetSignal } from "../src/engine/targets.js";
import { estimateFrequency, avgIntervalDays } from "../src/engine/routineDiscovery.js";

// E15 — Hedef takibi
test("achievementPct: 300/600 = %50", () => {
  assert.equal(achievementPct(300000, 600000), 50);
});
test("achievementPct: hedef 0 → %100", () => {
  assert.equal(achievementPct(5, 0), 100);
});
test("targetSignal: %50 → KIRMIZI, %85 → SARI, %100 → YEŞİL", () => {
  assert.equal(targetSignal(50), Signal.RED);
  assert.equal(targetSignal(85), Signal.YELLOW);
  assert.equal(targetSignal(100), Signal.GREEN);
});

// E16 — Rutin keşfi
test("estimateFrequency: aralığa göre", () => {
  assert.equal(estimateFrequency(1), "günlük");
  assert.equal(estimateFrequency(7), "haftalık");
  assert.equal(estimateFrequency(30), "aylık");
  assert.equal(estimateFrequency(90), "çeyreklik");
});
test("avgIntervalDays: haftalık desen ~7", () => {
  const d = avgIntervalDays(["2026-06-01", "2026-06-08", "2026-06-15"]);
  assert.ok(d !== null && Math.abs(d - 7) < 0.1);
});
test("avgIntervalDays: tek nokta → null (rutin değil)", () => {
  assert.equal(avgIntervalDays(["2026-06-01"]), null);
});
