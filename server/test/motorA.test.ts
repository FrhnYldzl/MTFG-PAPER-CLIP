import { test } from "node:test";
import assert from "node:assert/strict";
import { Signal } from "@paperclip/shared";
import { meetingSignal } from "../src/engine/motorA.js";

// Kabul kriteri: toplantı + 73s follow-up yok → Motor A KIRMIZI
test("73 saat follow-up yok (lead var) → KIRMIZI", () => {
  assert.equal(
    meetingSignal({ hoursSinceEnd: 73, followUpEntered: false, hasLead: true }),
    Signal.RED
  );
});

// Kabul kriteri: 48s içinde kapanmazsa SARI
test("50 saat follow-up yok (lead var) → SARI", () => {
  assert.equal(
    meetingSignal({ hoursSinceEnd: 50, followUpEntered: false, hasLead: true }),
    Signal.YELLOW
  );
});

test("10 saat, follow-up yok, lead var → YEŞİL (henüz erken)", () => {
  assert.equal(
    meetingSignal({ hoursSinceEnd: 10, followUpEntered: false, hasLead: true }),
    Signal.GREEN
  );
});

test("leadsiz toplantı → KIRMIZI (saatten bağımsız)", () => {
  assert.equal(
    meetingSignal({ hoursSinceEnd: 5, followUpEntered: true, hasLead: false }),
    Signal.RED
  );
});

test("follow-up girildi + lead var → YEŞİL (saat çok geç olsa bile)", () => {
  assert.equal(
    meetingSignal({ hoursSinceEnd: 200, followUpEntered: true, hasLead: true }),
    Signal.GREEN
  );
});
