import { finding, sortFindings, num, money, pct } from "./finding.js";
import { expectedWaterSewer, CCF_PER_PERSON_MONTH, GALLONS_PER_CCF } from "../data/water-rates.js";

/**
 * Check a Baltimore City water bill.
 * @param {object} raw
 *   ccf, prevCcf, avgCcf, billingDays, householdSize, meterSize ("5/8"|"3/4"|"1"),
 *   serviceDate (ISO), waterSewerCharges (water + sewer + infrastructure + account fee, $),
 *   readType ("actual"|"estimated"|"unknown"), vacant (bool)
 */
export function checkWater(raw = {}) {
  const v = normalize(raw);
  const out = [];
  const months = v.billingDays ? Math.max(1, Math.round(v.billingDays / 30)) : 1;

  if (v.vacant && v.ccf != null && v.ccf > 1) {
    out.push(finding({
      id: "water-vacant",
      severity: "error",
      title: "Water use was billed at an empty property",
      detail: `${fmt(v.ccf)} CCF (${gal(v.ccf)} gallons) at a home where nobody lives points to a leak, a misread or mis-routed meter, or a billing error. Ask DPW for a turn-off test and a meter investigation.`,
      sourceIds: ["dpwReview"],
      letterPoint: `The property was unoccupied during this billing period, yet I was billed for ${fmt(v.ccf)} CCF (${gal(v.ccf)} gallons). I request a meter investigation and a corrected bill.`,
    }));
  }

  if (v.readType === "estimated") {
    out.push(finding({
      id: "water-estimated",
      severity: "check",
      title: "This bill is based on an estimated reading",
      detail: "Ask DPW for an actual reading. Take a dated photo of your meter (usually in the sidewalk box or basement) so you have your own record.",
      sourceIds: ["dpwReview"],
      letterPoint: "This bill is based on an estimated reading. I request an actual meter reading and a corrected bill.",
    }));
  }

  if (v.ccf != null && v.householdSize) {
    const norm = CCF_PER_PERSON_MONTH * v.householdSize * months;
    if (v.ccf >= norm * 2 && v.ccf - norm >= 4) {
      out.push(finding({
        id: "water-vs-household",
        severity: "check",
        title: `That's ${pct(v.ccf / norm - 1)} more water than a ${v.householdSize}-person home normally uses`,
        detail: `DPW estimates about ${CCF_PER_PERSON_MONTH} CCF per person per month, or roughly ${fmt(norm)} CCF for your home. You were billed ${fmt(v.ccf)} CCF. Check for a running toilet or a dripping tap first. If you find none, ask DPW for a turn-off test and a meter test.`,
        sourceIds: ["dpwReview"],
        letterPoint: `My household of ${v.householdSize} would normally use about ${fmt(norm)} CCF for this period, but I was billed for ${fmt(v.ccf)} CCF. I request a turn-off test and a meter accuracy test.`,
      }));
    }
  }

  const baseline = v.avgCcf ?? v.prevCcf;
  if (v.ccf != null && baseline) {
    const ratio = v.ccf / baseline;
    if (ratio >= 2 && v.ccf - baseline >= 4) {
      const exp = expectedWaterSewer({ ccf: v.ccf - baseline, meterSize: v.meterSize, serviceDate: v.serviceDate });
      out.push(finding({
        id: "water-spike",
        severity: "check",
        title: `Usage is ${ratio.toFixed(1)}× your ${v.avgCcf ? "average" : "last bill"}`,
        detail: `${fmt(v.ccf)} CCF vs ${fmt(baseline)} CCF. The extra ${fmt(v.ccf - baseline)} CCF costs about ${money(exp.usage)} at ${exp.year} rates. If a leak caused it and you've fixed it, ask DPW for a leak adjustment.`,
        savings: exp.usage,
        sourceIds: ["dpwReview", "dpwAdjustment"],
        letterPoint: `My usage of ${fmt(v.ccf)} CCF is ${ratio.toFixed(1)} times my ${v.avgCcf ? "average" : "previous bill"} of ${fmt(baseline)} CCF. I request a review of the reading, a meter test, and a leak adjustment if a leak is found.`,
      }));
    }
  }

  if (v.ccf != null && v.waterSewerCharges) {
    const exp = expectedWaterSewer({ ccf: v.ccf, meterSize: v.meterSize, serviceDate: v.serviceDate, months });
    const diff = v.waterSewerCharges - exp.total;
    if (diff > 10 && diff / exp.total > 0.1) {
      out.push(finding({
        id: "water-math",
        severity: "error",
        title: `Charges are ${money(diff)} more than the City's own rates produce`,
        detail: `At ${exp.year} rates, ${fmt(v.ccf)} CCF on a ${v.meterSize}" meter should cost about ${money(exp.total)} for water, sewer, infrastructure and the account fee. Your bill shows ${money(v.waterSewerCharges)} for those lines. (Stormwater, the Bay Restoration Fee and past-due amounts are excluded.)`,
        savings: diff,
        sourceIds: ["dpwRatesFY27"],
        letterPoint: `Using DPW's published ${exp.year} rates, ${fmt(v.ccf)} CCF should cost about ${money(exp.total)} in water, sewer, infrastructure and account charges, but I was billed ${money(v.waterSewerCharges)}. Please explain or correct the difference of ${money(diff)}.`,
      }));
    }
  }

  out.push(finding({
    id: "water-rights",
    severity: "tip",
    title: "You can't be required to pay a plumber before your appeal is heard",
    detail: "City law says DPW, WACA and the Environmental Control Board can't make you pay anyone, a plumber included, as a condition of hearing your appeal. A hearing can't raise your bill.",
    sourceIds: ["cityCode24_2_19", "cityCode24_2_21"],
  }));

  return sortFindings(out);
}

function normalize(r) {
  const n = (k) => num(r[k]);
  return {
    ccf: n("ccf"),
    prevCcf: n("prevCcf"),
    avgCcf: n("avgCcf"),
    billingDays: n("billingDays"),
    householdSize: n("householdSize"),
    meterSize: ["5/8", "3/4", "1"].includes(r.meterSize) ? r.meterSize : "5/8",
    serviceDate: r.serviceDate || null,
    waterSewerCharges: n("waterSewerCharges"),
    readType: r.readType || "unknown",
    vacant: r.vacant === true || r.vacant === "on" || r.vacant === "yes",
  };
}

const fmt = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 1 });
const gal = (ccf) => Math.round(ccf * GALLONS_PER_CCF).toLocaleString("en-US");
