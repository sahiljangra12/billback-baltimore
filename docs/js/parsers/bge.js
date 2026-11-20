import { clean, findNumber, findText, daysBetween, compact, P } from "./common.js";

const DATE = String.raw`(\d{1,2}\/\d{1,2}\/\d{2,4})`;

/** Extract BGE bill fields from PDF text. */
export function parseBge(rawText) {
  const t = clean(rawText);

  const amountDue = findNumber(t, [
    new RegExp(String.raw`total\s+amount\s+due[^$\d]{0,40}${P.MONEY}`, "i"),
    new RegExp(String.raw`amount\s+due[^$\d]{0,40}${P.MONEY}`, "i"),
  ]);

  let billingDays = findNumber(t, [/(\d{2,3})\s*(?:billing\s+)?days/i, /days\s+(?:in\s+)?(?:billing\s+)?(?:period|cycle)\D{0,10}(\d{2,3})/i]);
  if (billingDays == null) {
    const m = t.match(new RegExp(String.raw`${DATE}\s*(?:-|to|–|through)\s*${DATE}`, "i"));
    if (m) billingDays = daysBetween(m[1], m[2]);
  }

  const kwh = findNumber(t, [
    /total\s+(?:kwh|electric\s+usage)[^\d]{0,20}([\d,]+)/i,
    /([\d,]+)\s*kwh\s+(?:used|total|usage)/i,
    /usage[^\d]{0,20}([\d,]+)\s*kwh/i,
    /([\d,]{2,})\s*kwh/i,
  ]);

  const therms = findNumber(t, [
    /total\s+therms[^\d]{0,20}([\d,]+(?:\.\d+)?)/i,
    /([\d,]+(?:\.\d+)?)\s*therms\s+(?:used|total|usage)/i,
    /usage[^\d]{0,20}([\d,]+(?:\.\d+)?)\s*therms/i,
    /([\d,]+(?:\.\d+)?)\s*therms/i,
  ]);

  const readType = /\bestimated\b/i.test(t) ? "estimated" : /\bactual\b/i.test(t) ? "actual" : null;

  const lateFee = findNumber(t, [new RegExp(String.raw`late\s+(?:payment\s+)?(?:charge|fee)[^$\d]{0,30}${P.MONEY}`, "i")]);

  // Price to Compare is printed in cents or dollars per kWh depending on the bill version.
  let elecPriceToCompare = findNumber(t, [/price\s+to\s+compare[^\d]{0,30}(\d*\.\d+)/i]);
  if (elecPriceToCompare != null && elecPriceToCompare > 1) elecPriceToCompare = elecPriceToCompare / 100;

  const elecSupplier = findText(t, [
    /electric\s+supplier[ \t]*:?[ \t]*([A-Za-z][A-Za-z0-9&.,' -]{2,40})/i,
    /electricity\s+supplied\s+by[ \t]*:?[ \t]*([A-Za-z][A-Za-z0-9&.,' -]{2,40})/i,
  ]);

  const shutoffNotice = /termination|turn[- ]?off\s+notice|disconnect(?:ion)?\s+notice/i.test(t) ? true : null;

  return compact({ amountDue, billingDays, kwh, therms, readType, lateFee, elecPriceToCompare, elecSupplier, shutoffNotice });
}
