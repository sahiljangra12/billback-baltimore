import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBge } from "../js/parsers/bge.js";
import { parseWater } from "../js/parsers/water.js";
import { parseTow } from "../js/parsers/tow.js";
import { buildLetter } from "../js/letters/letters.js";
import { checkTow } from "../js/rules/tow.js";

// Synthetic text shaped like real bills. Real layouts vary; the parsers only fill what they find.
const BGE_TEXT = `Baltimore Gas and Electric
Billing Period 10/01/2026 - 10/31/2026
Meter Reading: Estimated
Electric Supplier: Bright Path Energy
Your Price to Compare: 11.52 cents per kWh
Total kWh 1,240 kWh
Total Therms 48.5 therms
Late Payment Charge $9.87
Total Amount Due $312.45`;

const WATER_TEXT = `Baltimore City Department of Public Works
Service Period 08/02/2026 - 09/01/2026
5/8" Meter   Actual
Water Usage 14 CCF
Water Usage Charge $68.04
Sewer Usage Charge $201.18
Water Infrastructure Charge $17.52
Sewer Infrastructure Charge $16.51
Account Management Fee $5.79
Total Amount Due $330.11`;

const TOW_TEXT = `ABC Towing LLC
Towing Fee $320.00
Storage $50.00 per day
2 days storage
Notice Fee $40.00`;

test("parseBge extracts the main fields", () => {
  const r = parseBge(BGE_TEXT);
  assert.equal(r.amountDue, 312.45);
  assert.equal(r.billingDays, 30);
  assert.equal(r.kwh, 1240);
  assert.equal(r.therms, 48.5);
  assert.equal(r.readType, "estimated");
  assert.equal(r.lateFee, 9.87);
  assert.equal(r.elecPriceToCompare, 0.1152);
  assert.equal(r.elecSupplier, "Bright Path Energy");
});

test("parseWater extracts usage, period and charge lines", () => {
  const r = parseWater(WATER_TEXT);
  assert.equal(r.ccf, 14);
  assert.equal(r.billingDays, 30);
  assert.equal(r.serviceDate, "2026-09-01");
  assert.equal(r.meterSize, "5/8");
  assert.equal(r.readType, "actual");
  assert.equal(r.waterSewerCharges, 309.04);
  assert.equal(r.amountDue, 330.11);
});

test("parseTow extracts fees", () => {
  const r = parseTow(TOW_TEXT);
  assert.equal(r.towFee, 320);
  assert.equal(r.storagePerDay, 50);
  assert.equal(r.storageDays, 2);
  assert.equal(r.noticeFee, 40);
});

test("parsers return nothing for unrelated text", () => {
  assert.deepEqual(parseBge("hello world"), {});
  assert.deepEqual(parseWater("hello world"), {});
  assert.deepEqual(parseTow("hello world"), {});
});

test("letter includes details and numbered points", () => {
  const findings = checkTow({ towType: "private", towFee: 300, dropFee: 200 });
  const text = buildLetter("tow", { name: "Jordan Lee", account: "INV-77" }, findings, new Date("2026-11-20T12:00:00"));
  assert.match(text, /Jordan Lee/);
  assert.match(text, /Receipt \/ invoice number: INV-77/);
  assert.match(text, /November 20, 2026/);
  assert.match(text, /^1\. .*drop fee/im);
  assert.match(text, /Board of Licensing for Towing Services/);
});

test("letter falls back to a placeholder when nothing is selected", () => {
  const text = buildLetter("bge", {}, []);
  assert.match(text, /\[Describe what is wrong with the bill\.\]/);
  assert.match(text, /\[Your name\]/);
});
