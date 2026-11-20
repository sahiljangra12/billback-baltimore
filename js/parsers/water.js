import { clean, findNumber, daysBetween, parseUsDate, toIso, compact } from "./common.js";

const DATE = String.raw`(\d{1,2}\/\d{1,2}\/\d{2,4})`;

/** Extract Baltimore City water bill fields from PDF text. */
export function parseWater(rawText) {
  const t = clean(rawText);

  const ccf = findNumber(t, [
    /(?:total\s+)?(?:water\s+)?(?:usage|consumption)[^\d]{0,25}([\d,]+(?:\.\d+)?)\s*ccf/i,
    /([\d,]+(?:\.\d+)?)\s*ccf\s+(?:used|usage|billed)/i,
    /([\d,]+(?:\.\d+)?)\s*ccf/i,
  ]);

  let billingDays = findNumber(t, [/(\d{2,3})\s*days/i]);
  let serviceDate = null;
  const period = t.match(new RegExp(String.raw`(?:service\s+period|service\s+from|billing\s+period)?[^\d]{0,15}${DATE}\s*(?:-|to|–|through)\s*${DATE}`, "i"));
  if (period) {
    billingDays = billingDays ?? daysBetween(period[1], period[2]);
    serviceDate = toIso(parseUsDate(period[2]));
  }

  const meterMatch = t.match(/(5\/8|3\/4|1)\s*(?:"|”|in(?:ch)?)?\s*meter/i) || t.match(/meter\s+size\D{0,10}(5\/8|3\/4|1)\b/i);
  const meterSize = meterMatch ? meterMatch[1] : null;

  const readType = /\bestimated\b|\best\.\s*read/i.test(t) ? "estimated" : /\bactual\b/i.test(t) ? "actual" : null;

  // Sum the lines that the checker compares with published rates.
  const lineAmount = (label) =>
    findNumber(t, [new RegExp(String.raw`${label}[^$\n]{0,40}\$\s*([\d,]+\.\d{2})`, "i")]);
  const parts = [
    lineAmount("water\\s+(?:usage|consumption)\\s+charge"),
    lineAmount("sewer\\s+(?:usage|consumption)\\s+charge"),
    lineAmount("water\\s+infrastructure"),
    lineAmount("sewer\\s+infrastructure"),
    lineAmount("account\\s+management"),
  ];
  const found = parts.filter((x) => x != null);
  const waterSewerCharges = found.length >= 3 ? Math.round(found.reduce((a, b) => a + b, 0) * 100) / 100 : null;

  const amountDue = findNumber(t, [/total\s+amount\s+due[^$\d]{0,30}\$?\s*([\d,]+\.\d{2})/i, /amount\s+due[^$\d]{0,30}\$?\s*([\d,]+\.\d{2})/i]);

  return compact({ ccf, billingDays, serviceDate, meterSize, readType, waterSewerCharges, amountDue });
}
