import { test } from "node:test";
import assert from "node:assert/strict";
import { weekKey, monthKey } from "../src/jobs/jobs.js";

test("weekKey: ISO hafta formatı YYYY-Www", () => {
  assert.match(weekKey(new Date("2026-06-17T10:00:00Z")), /^2026-W\d{2}$/);
});

test("weekKey: 2026-01-01 → 2026-W01", () => {
  assert.equal(weekKey(new Date("2026-01-01T12:00:00Z")), "2026-W01");
});

test("monthKey: YYYY-MM", () => {
  assert.equal(monthKey(new Date("2026-06-17T10:00:00Z")), "2026-06");
  assert.equal(monthKey(new Date("2026-12-01T10:00:00Z")), "2026-12");
});
