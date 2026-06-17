import { test } from "node:test";
import assert from "node:assert/strict";
import { Signal } from "@paperclip/shared";
import {
  evaluate,
  needsAction,
  isCritical,
} from "../src/engine/signalEngine.js";

// ── Kabul kriteri: Tahsilat 5/9/15 gün → 🟢/🟡/🔴 (eşik 7/14) ──
test("tahsilat 5 gün → YEŞİL", () => {
  assert.equal(
    evaluate({ kind: "dayThreshold", days: 5, yellowAt: 7, redAt: 14 }),
    Signal.GREEN
  );
});
test("tahsilat 9 gün → SARI", () => {
  assert.equal(
    evaluate({ kind: "dayThreshold", days: 9, yellowAt: 7, redAt: 14 }),
    Signal.YELLOW
  );
});
test("tahsilat 15 gün → KIRMIZI", () => {
  assert.equal(
    evaluate({ kind: "dayThreshold", days: 15, yellowAt: 7, redAt: 14 }),
    Signal.RED
  );
});
test("tahsilat tam sınır 14 gün → KIRMIZI (>=)", () => {
  assert.equal(
    evaluate({ kind: "dayThreshold", days: 14, yellowAt: 7, redAt: 14 }),
    Signal.RED
  );
});

// ── Presence (rapor varlığı) ──
test("presence present/late/absent → 🟢/🟡/🔴", () => {
  assert.equal(evaluate({ kind: "presence", state: "present" }), Signal.GREEN);
  assert.equal(evaluate({ kind: "presence", state: "late" }), Signal.YELLOW);
  assert.equal(evaluate({ kind: "presence", state: "absent" }), Signal.RED);
});

// ── Count (haftalık network, hedef 1) ──
test("network count: 2≥1 YEŞİL, 1>0 değil→YEŞİL? hedef mantığı", () => {
  assert.equal(evaluate({ kind: "count", value: 2, target: 1 }), Signal.GREEN);
  assert.equal(evaluate({ kind: "count", value: 1, target: 1 }), Signal.GREEN);
  assert.equal(evaluate({ kind: "count", value: 0, target: 1 }), Signal.RED);
});
test("network count hedef 2: 1 adet → SARI", () => {
  assert.equal(evaluate({ kind: "count", value: 1, target: 2 }), Signal.YELLOW);
});

// ── Ratio (OPEX karşılama: <%80 kırmızı, <%100 sarı) ──
test("OPEX ratio: tam karşılandı → YEŞİL", () => {
  assert.equal(
    evaluate({ kind: "ratio", value: 100, target: 100 }),
    Signal.GREEN
  );
});
test("OPEX ratio: %90 → SARI", () => {
  assert.equal(evaluate({ kind: "ratio", value: 90, target: 100 }), Signal.YELLOW);
});
test("OPEX ratio: %70 → KIRMIZI", () => {
  assert.equal(evaluate({ kind: "ratio", value: 70, target: 100 }), Signal.RED);
});

// ── Yardımcılar ──
test("needsAction: yeşil hariç hepsi aksiyon ister", () => {
  assert.equal(needsAction(Signal.GREEN), false);
  assert.equal(needsAction(Signal.YELLOW), true);
  assert.equal(needsAction(Signal.RED), true);
});
test("isCritical: sadece kırmızı", () => {
  assert.equal(isCritical(Signal.RED), true);
  assert.equal(isCritical(Signal.YELLOW), false);
});
