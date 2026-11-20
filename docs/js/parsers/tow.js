import { clean, findNumber, compact, P } from "./common.js";

/** Extract tow receipt fields from text. */
export function parseTow(rawText) {
  const t = clean(rawText);
  const amt = (label) => findNumber(t, [new RegExp(String.raw`${label}[^$\d\n]{0,30}${P.MONEY}`, "i")]);

  const towFee = amt("(?:tow(?:ing)?|hook[- ]?up)\\s*(?:fee|charge)?");
  const dropFee = amt("drop\\s*(?:fee|charge)");
  const noticeFee = amt("(?:notice|notification|admin(?:istrative)?)\\s*(?:fee|charge)");
  const storagePerDay = findNumber(t, [new RegExp(String.raw`storage[^$\n]{0,30}${P.MONEY}\s*(?:\/|per)\s*day`, "i")]);
  const storageDays = findNumber(t, [/(\d{1,3})\s*days?\s*(?:of\s+)?storage/i, /storage[^\n]{0,20}?(\d{1,3})\s*days?/i]);
  const storageTotal = storagePerDay == null ? amt("storage\\s*(?:fee|charge)?") : null;

  const towType = /pulaski|fallsway|baltimore\s+city\s+(?:dot|department\s+of\s+transportation)|impound/i.test(t) ? "city" : null;

  return compact({ towFee, dropFee, noticeFee, storagePerDay, storageDays, storageTotal, towType });
}
