import { test } from "node:test";
import assert from "node:assert/strict";
import { checkBge } from "../js/rules/bge.js";
import { checkWater } from "../js/rules/water.js";
import { checkTow } from "../js/rules/tow.js";
import { summarize } from "../js/rules/finding.js";
import { expectedWaterSewer, ratesFor } from "../js/data/water-rates.js";
import { checkAssistance, monthlyLimit } from "../js/data/assistance.js";
import { SOURCES } from "../js/data/sources.js";

const ids = (fs) => fs.map((f) => f.id);

test("every finding cites only known sources", () => {
  const all = [
    ...checkBge({ shutoffNotice: true, readType: "estimated", billingDays: 40, kwh: 1500, prevKwh: 600, lastYearKwh: 700, elecSupplier: "Acme Energy", elecSupplyRate: 0.17, elecPriceToCompare: 0.12, lateFee: 12.5, amountDue: 300 }),
    ...checkWater({ ccf: 40, prevCcf: 6, householdSize: 2, waterSewerCharges: 900, readType: "estimated", vacant: true }),
    ...checkTow({ towType: "private", towFee: 400, postedMax: 300, dropFee: 250, noticeFee: 40, hoursToRetrieve: 10, storagePerDay: 75, storageDays: 2, paymentRefused: true, registrationOnly: true }),
    ...checkTow({ towType: "city", stolen: true, towFee: 140, storageTotal: 50, hoursToRetrieve: 20 }),
  ];
  for (const f of all) for (const s of f.sourceIds) assert.ok(SOURCES[s], `${f.id} cites unknown source ${s}`);
});

test("BGE: shut-off is urgent and sorted first", () => {
  const f = checkBge({ shutoffNotice: "on", lateFee: "10" });
  assert.equal(f[0].id, "bge-shutoff");
  assert.equal(f[0].severity, "urgent");
});

test("BGE: supplier above Price to Compare computes the overpayment", () => {
  const f = checkBge({ kwh: 1000, elecSupplier: "Some Power LLC", elecSupplyRate: "0.18", elecPriceToCompare: "0.12" });
  const s = f.find((x) => x.id === "bge-supplier-electric");
  assert.ok(s);
  assert.equal(s.severity, "error");
  assert.equal(s.savings, 60);
});

test("BGE: BGE itself is not treated as a third-party supplier", () => {
  const f = checkBge({ kwh: 1000, elecSupplier: "BGE", elecSupplyRate: 0.2, elecPriceToCompare: 0.12 });
  assert.ok(!ids(f).some((i) => i.startsWith("bge-supplier")));
});

test("BGE: usage jump uses per-day comparison when days are known", () => {
  // 900 kWh over 45 days (20/day) vs 600 over 30 days (20/day) → no jump
  assert.ok(!ids(checkBge({ kwh: 900, billingDays: 45, prevKwh: 600, prevBillingDays: 30 })).includes("bge-jump-electricity"));
  // 1200 over 30 days vs 600 over 30 days → 100% jump
  assert.ok(ids(checkBge({ kwh: 1200, billingDays: 30, prevKwh: 600, prevBillingDays: 30 })).includes("bge-jump-electricity"));
});

test("BGE: small absolute changes are ignored", () => {
  assert.ok(!ids(checkBge({ kwh: 120, prevKwh: 60 })).includes("bge-jump-electricity"));
});

test("Water: expected charges match FY2027 published rates", () => {
  const e = expectedWaterSewer({ ccf: 6, meterSize: "5/8", serviceDate: "2026-09-01" });
  // 6 × (4.86 + 14.37) + 17.52 + 16.51 + 5.79
  assert.equal(e.total, 155.2);
  assert.equal(e.year, "FY2027");
  assert.equal(ratesFor("2026-03-01").year, "FY2026");
});

test("Water: overcharge vs rates is flagged with the difference", () => {
  const f = checkWater({ ccf: 6, serviceDate: "2026-09-01", waterSewerCharges: 205.2 });
  const m = f.find((x) => x.id === "water-math");
  assert.ok(m);
  assert.equal(m.savings, 50);
});

test("Water: correct bill is not flagged", () => {
  const f = checkWater({ ccf: 6, serviceDate: "2026-09-01", waterSewerCharges: 155.2, householdSize: 2, prevCcf: 6 });
  assert.deepEqual(ids(f), ["water-rights"]);
});

test("Water: vacant property with usage is an error", () => {
  const f = checkWater({ ccf: 100, vacant: "yes" });
  assert.equal(f[0].id, "water-vacant");
});

test("Water: spike vs average and household norm", () => {
  const f = checkWater({ ccf: 30, avgCcf: 7, householdSize: 2 });
  assert.ok(ids(f).includes("water-spike"));
  assert.ok(ids(f).includes("water-vs-household"));
});

test("Tow: stolen car at City lot → full refund", () => {
  const f = checkTow({ towType: "city", stolen: true, towFee: 140, storageTotal: 100, noticeFee: 40 });
  const s = f.find((x) => x.id === "tow-stolen");
  assert.equal(s.savings, 280);
});

test("Tow: drop fee over 50% is an error", () => {
  const f = checkTow({ towType: "private", towFee: 300, dropFee: 200 });
  assert.equal(f.find((x) => x.id === "tow-drop-fee").savings, 50);
});

test("Tow: charge over posted sign beats the cap estimate", () => {
  const f = checkTow({ towType: "private", towFee: 350, postedMax: 280 });
  assert.ok(ids(f).includes("tow-over-sign"));
  assert.ok(!ids(f).includes("tow-over-cap"));
});

test("Tow: notice fee within 48 h is refundable", () => {
  const f = checkTow({ towType: "private", noticeFee: 35, hoursToRetrieve: 12 });
  assert.ok(ids(f).includes("tow-notice-fee"));
  assert.ok(!ids(checkTow({ towType: "private", noticeFee: 35, hoursToRetrieve: 60 })).includes("tow-notice-fee"));
});

test("Tow: estimated cap is only 'check', never 'error'", () => {
  const f = checkTow({ towType: "private", towFee: 300 });
  assert.equal(f.find((x) => x.id === "tow-over-cap").severity, "check");
});

test("Assistance: FY27 200% FPL limits", () => {
  assert.equal(monthlyLimit(4), 5500);
  assert.equal(monthlyLimit(12), 11180 + 2 * 947);
  const r = checkAssistance({ billType: "water", householdSize: 3, monthlyIncome: 4000 });
  assert.equal(r[0].id, "water4all");
  assert.equal(r[0].verdict, "likely");
  assert.equal(checkAssistance({ billType: "bge", householdSize: 1, monthlyIncome: 5000 })[0].verdict, "unlikely");
  assert.equal(checkAssistance({ billType: "bge" })[0].verdict, "unknown");
});

test("summarize counts severities and adds savings", () => {
  const s = summarize(checkTow({ towType: "private", towFee: 300, dropFee: 200, noticeFee: 30, hoursToRetrieve: 5 }));
  assert.equal(s.counts.error, 2);
  assert.equal(s.savings, 50 + 30 + 20); // drop excess + notice + (300 − 280 cap)
  assert.equal(s.disputable, true);
});
