import { finding, sortFindings, num, money, pct } from "./finding.js";

/**
 * Check a BGE bill.
 * @param {object} raw  Form values (strings or numbers). All optional.
 *   amountDue, billingDays, kwh, prevKwh, prevBillingDays, lastYearKwh,
 *   therms, prevTherms, lastYearTherms,
 *   readType ("actual" | "estimated" | "unknown"),
 *   elecSupplier, elecSupplyRate, elecPriceToCompare  ($/kWh)
 *   gasSupplier,  gasSupplyRate,  gasPriceToCompare   ($/therm)
 *   lateFee, shutoffNotice (bool)
 * @returns {object[]} findings, most severe first
 */
export function checkBge(raw = {}) {
  const v = normalize(raw);
  const out = [];

  if (v.shutoffNotice) {
    out.push(finding({
      id: "bge-shutoff",
      severity: "urgent",
      title: "You have a shut-off notice: file a PSC complaint now",
      detail: "If you dispute the bill, file a complaint with the Maryland PSC's Consumer Affairs Division right away. BGE must pause shut-offs while a billing-dispute complaint is pending. You can also apply for crisis help through the Office of Home Energy Programs.",
      sourceIds: ["pscTerminations", "ohepApply"],
      letterPoint: "I have received a termination notice. I am disputing this bill and request that service not be terminated while the dispute is pending.",
    }));
  }

  if (v.readType === "estimated") {
    out.push(finding({
      id: "bge-estimated",
      severity: "check",
      title: "This bill uses an estimated meter reading",
      detail: "Estimated bills can run high, and the correction often lands on a later bill as a surprise. Ask BGE for an actual reading and a corrected bill. A photo of your meter with today's date helps.",
      sourceIds: ["pscDisputes"],
      letterPoint: "This bill is based on an estimated meter reading. I request an actual meter reading and a corrected bill.",
    }));
  }

  if (v.billingDays && v.billingDays > 35) {
    out.push(finding({
      id: "bge-long-period",
      severity: "check",
      title: `This bill covers ${v.billingDays} days, longer than a normal month`,
      detail: "A longer billing period alone makes the bill bigger. Compare daily usage (below) rather than the total. Ask BGE why the period was extended.",
      sourceIds: ["opcHighBill"],
      letterPoint: `This bill covers ${v.billingDays} days, which is longer than a normal billing cycle. Please explain why.`,
    }));
  }

  usageJump(out, {
    unit: "kWh", label: "electricity", now: v.kwh, prev: v.prevKwh, days: v.billingDays,
    prevDays: v.prevBillingDays, lastYear: v.lastYearKwh,
  });
  usageJump(out, {
    unit: "therms", label: "gas", now: v.therms, prev: v.prevTherms, days: v.billingDays,
    prevDays: v.prevBillingDays, lastYear: v.lastYearTherms,
  });

  supplierCheck(out, {
    kind: "electric", unit: "kWh", usage: v.kwh, supplier: v.elecSupplier,
    rate: v.elecSupplyRate, ptc: v.elecPriceToCompare,
  });
  supplierCheck(out, {
    kind: "gas", unit: "therm", usage: v.therms, supplier: v.gasSupplier,
    rate: v.gasSupplyRate, ptc: v.gasPriceToCompare,
  });

  if (v.lateFee && v.lateFee > 0) {
    out.push(finding({
      id: "bge-late-fee",
      severity: "tip",
      title: `Ask BGE to waive the ${money(v.lateFee)} late charge`,
      detail: "Utilities often waive a late charge as a one-time courtesy, especially if you set up a payment plan. It costs nothing to ask.",
      savings: v.lateFee,
      letterPoint: `I also request a one-time waiver of the ${money(v.lateFee)} late payment charge.`,
    }));
  }

  if (v.amountDue && v.kwh && v.kwh > 0 && !v.therms) {
    out.push(finding({
      id: "bge-effective-rate",
      severity: "tip",
      title: `You're paying about ${money(v.amountDue / v.kwh)} per kWh, all-in`,
      detail: "This counts every charge on the bill (supply, delivery, taxes, fees) divided by your usage. Delivery charges are now the largest part of most BGE bills, so cutting usage helps less than it used to.",
      sourceIds: ["opcHighBill"],
    }));
  }

  return sortFindings(out);
}

function usageJump(out, { unit, label, now, prev, days, prevDays, lastYear }) {
  if (!now) return;
  if (prev) {
    // Compare per-day usage when both periods are known; otherwise compare totals.
    const a = days && prevDays ? now / days : now;
    const b = days && prevDays ? prev / prevDays : prev;
    const rise = (a - b) / b;
    if (rise >= 0.5 && now - prev >= (unit === "kWh" ? 150 : 15)) {
      out.push(finding({
        id: `bge-jump-${label}`,
        severity: "check",
        title: `Your ${label} use jumped ${pct(rise)} from last bill`,
        detail: `${fmt(now)} ${unit} this bill vs ${fmt(prev)} ${unit} last bill${days && prevDays ? " (compared per day)" : ""}. Weather can explain this. If nothing changed at home, ask BGE to check the meter reading.`,
        sourceIds: ["pscDisputes"],
        letterPoint: `My ${label} usage of ${fmt(now)} ${unit} is ${pct(rise)} higher than my previous bill (${fmt(prev)} ${unit}) with no change in my household. I request that BGE verify the meter reading and test the meter if needed.`,
      }));
    }
  }
  if (lastYear) {
    const rise = (now - lastYear) / lastYear;
    if (rise >= 0.4 && now - lastYear >= (unit === "kWh" ? 150 : 15)) {
      out.push(finding({
        id: `bge-yoy-${label}`,
        severity: "check",
        title: `Your ${label} use is ${pct(rise)} higher than the same month last year`,
        detail: `Same season, different usage: ${fmt(now)} vs ${fmt(lastYear)} ${unit}. This comparison rules out weather better than month-to-month.`,
        sourceIds: ["pscDisputes"],
        letterPoint: `Compared with the same month last year (${fmt(lastYear)} ${unit}), my ${label} usage is ${pct(rise)} higher.`,
      }));
    }
  }
}

function supplierCheck(out, { kind, unit, usage, supplier, rate, ptc }) {
  const third = supplier && !/^\s*(bge|baltimore gas)/i.test(supplier);
  if (!third) return;
  if (rate && ptc && rate > ptc) {
    const extra = usage ? (rate - ptc) * usage : null;
    out.push(finding({
      id: `bge-supplier-${kind}`,
      severity: "error",
      title: `Your ${kind} supplier charges more than BGE's own price`,
      detail: `${supplier} charges ${rate} per ${unit}; BGE's "Price to Compare" is ${ptc}.${extra ? ` That cost you about ${money(extra)} on this bill alone.` : ""} You can switch back to BGE standard service. Call BGE or the supplier, and check for early-cancellation fees first.`,
      savings: extra,
      sourceIds: ["opcHighBill"],
      letterPoint: null, // This is a switch, not a dispute.
    }));
  } else if (!rate || !ptc) {
    out.push(finding({
      id: `bge-supplier-${kind}-unknown`,
      severity: "check",
      title: `You buy ${kind} from a third-party supplier (${supplier})`,
      detail: `Look for the supplier's rate and BGE's "Price to Compare" on your bill and enter both. Third-party suppliers often charge more than BGE's standard rate.`,
      sourceIds: ["opcHighBill"],
    }));
  }
}

function normalize(r) {
  const n = (k) => num(r[k]);
  return {
    amountDue: n("amountDue"),
    billingDays: n("billingDays"),
    prevBillingDays: n("prevBillingDays"),
    kwh: n("kwh"),
    prevKwh: n("prevKwh"),
    lastYearKwh: n("lastYearKwh"),
    therms: n("therms"),
    prevTherms: n("prevTherms"),
    lastYearTherms: n("lastYearTherms"),
    readType: r.readType || "unknown",
    elecSupplier: (r.elecSupplier || "").trim(),
    elecSupplyRate: n("elecSupplyRate"),
    elecPriceToCompare: n("elecPriceToCompare"),
    gasSupplier: (r.gasSupplier || "").trim(),
    gasSupplyRate: n("gasSupplyRate"),
    gasPriceToCompare: n("gasPriceToCompare"),
    lateFee: n("lateFee"),
    shutoffNotice: r.shutoffNotice === true || r.shutoffNotice === "on" || r.shutoffNotice === "yes",
  };
}

const fmt = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 1 });
