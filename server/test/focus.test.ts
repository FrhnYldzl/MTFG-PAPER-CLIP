import { test } from "node:test";
import assert from "node:assert/strict";
import { Priority } from "@paperclip/shared";
import { buildFocusDraft } from "../src/engine/focus.js";

test("boş hafta → düşük öncelik, 'sistem yeşil' metni", () => {
  const d = buildFocusDraft("2026-W25", [], []);
  assert.equal(d.subject, "2026-W25 — MTFG Odak");
  assert.equal(d.priority, Priority.DUSUK);
  assert.match(d.text, /sistem yeşil/);
});

test("kırmızı varsa yüksek öncelik + acil bölümü", () => {
  const d = buildFocusDraft(
    "2026-W26",
    [
      { triggerId: 13, orgLabel: "Juris", signal: "RED", reason: ">=14g", dashboard: "1_HARITA", suggestedAction: "Tahsilat" },
      { triggerId: 9, orgLabel: "Juris", signal: "YELLOW", reason: "1 görüşme", dashboard: "3_NETWORK" },
    ],
    [{ id: 5, description: "Teklif hazırla", responsibleRole: "İcracı Ortak", dueDate: "2026-06-20" }]
  );
  assert.equal(d.priority, Priority.YUKSEK);
  assert.match(d.text, /🔴 Acil/);
  assert.match(d.text, /🟡 İzle/);
  assert.match(d.text, /Açık Görevler/);
  assert.match(d.text, /#5 Teklif hazırla/);
  assert.match(d.text, /Kırmızı \(1\).*Sarı \(1\).*görev \(1\)/s);
});

test("sadece sarı → orta öncelik", () => {
  const d = buildFocusDraft(
    "2026-W27",
    [{ triggerId: 5, orgLabel: "Fevup", signal: "YELLOW", reason: "+1g", dashboard: "4_DENETIM" }],
    []
  );
  assert.equal(d.priority, Priority.ORTA);
});
