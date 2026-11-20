import { finding, sortFindings, num, money } from "./finding.js";
import { TOW_RULES, estimatedTrespassCap } from "../data/towing.js";

/**
 * Check a tow receipt.
 * @param {object} raw
 *   towType ("private" | "city"), stolen (bool),
 *   towFee, storagePerDay, storageDays, storageTotal, noticeFee, otherFees,
 *   dropFee (paid to get car released before it left the lot),
 *   hoursToRetrieve (hours between the car arriving at storage and you picking it up),
 *   postedMax (max tow charge shown on the lot's sign),
 *   paymentRefused (bool: storage lot refused all cards and had no ATM),
 *   registrationOnly (bool: towed only for registration), registrationNoticeHours
 */
export function checkTow(raw = {}) {
  const v = normalize(raw);
  const out = [];

  if (v.towType === "city") {
    cityChecks(out, v);
  } else {
    privateChecks(out, v);
  }

  out.push(finding({
    id: "tow-evidence",
    severity: "tip",
    title: "Ask for the tow authorization and the violation photo",
    detail: "Before a private-lot tow, the tower must get written authorization from the lot owner, including a photo of the violation. Ask for a copy. A tow without them is improper.",
    sourceIds: ["mdTow04"],
    letterPoint: v.towType === "private" ? "Please provide a copy of the lot owner's written tow authorization and the photographic evidence of the violation, as required by Md. Code, Transportation § 21-10A-04." : null,
  }));

  return sortFindings(out);
}

function cityChecks(out, v) {
  if (v.stolen) {
    const paid = sum(v.towFee, v.storageTotal, v.noticeFee, v.otherFees);
    out.push(finding({
      id: "tow-stolen",
      severity: "error",
      title: "Stolen-car owners don't pay City towing or storage fees",
      detail: `Baltimore City says owners of stolen vehicles are not required to pay towing, storage or any other fees to get them back. That includes tickets issued while the car was stolen.${paid ? ` Request a refund of the ${money(paid)} you were charged.` : ""} Bring your police report number.`,
      savings: paid || null,
      sourceIds: ["cityTowing"],
      letterPoint: `My vehicle was stolen at the time it was towed (police report attached). Under Baltimore City policy, owners of stolen vehicles are not required to pay towing, storage or other fees. I request a full refund of ${money(paid || 0)}.`,
    }));
  }
  if (v.storageTotal && v.hoursToRetrieve != null && v.hoursToRetrieve <= TOW_RULES.cityImpoundStorageGraceHours) {
    out.push(finding({
      id: "tow-city-storage-grace",
      severity: "check",
      title: "You were charged storage, but you picked up the car within 48 hours",
      detail: `The City has said storage is only charged after ${TOW_RULES.cityImpoundStorageGraceHours} hours at its impound lots. You picked up after ${v.hoursToRetrieve} hours and were charged ${money(v.storageTotal)} for storage.`,
      savings: v.storageTotal,
      sourceIds: ["cityTowTestimony", "cityTowing"],
      letterPoint: `I retrieved my vehicle within ${v.hoursToRetrieve} hours, yet was charged ${money(v.storageTotal)} in storage. I understand storage applies only after ${TOW_RULES.cityImpoundStorageGraceHours} hours and request a refund.`,
    }));
  }
}

function privateChecks(out, v) {
  if (v.postedMax && v.towFee && v.towFee > v.postedMax) {
    out.push(finding({
      id: "tow-over-sign",
      severity: "error",
      title: `You were charged ${money(v.towFee - v.postedMax)} more than the lot's sign allows`,
      detail: `State law requires the lot's signs to show the maximum tow charge. The sign said ${money(v.postedMax)}; you paid ${money(v.towFee)}. Take a photo of the sign.`,
      savings: v.towFee - v.postedMax,
      sourceIds: ["mdTow04"],
      letterPoint: `The posted sign at the lot states a maximum towing charge of ${money(v.postedMax)}, but I was charged ${money(v.towFee)}. I request a refund of ${money(v.towFee - v.postedMax)}.`,
    }));
  }

  const cap = estimatedTrespassCap();
  if (v.towFee && v.towFee > cap && !(v.postedMax && v.towFee > v.postedMax)) {
    out.push(finding({
      id: "tow-over-cap",
      severity: "check",
      title: `The tow fee may be above Baltimore's legal limit (about ${money(cap)})`,
      detail: `A private-lot tow fee can be at most twice what the City charges for its own impound tow. The City reported its impound tow fee as ${money(TOW_RULES.cityImpoundTowFee)} in 2023, which puts the limit near ${money(cap)}. Only the tow fee can be doubled, not storage or other fees. Ask the towing board to confirm the current limit.`,
      savings: v.towFee - cap,
      sourceIds: ["mdTow04", "mdTowAgOpinion", "cityTowTestimony"],
      letterPoint: `The towing fee of ${money(v.towFee)} appears to exceed the maximum allowed under Md. Code, Transportation § 21-10A-04, which limits it to twice the City's public-safety impound tow fee. Please confirm the authorized rate and refund any excess.`,
    }));
  }

  if (v.dropFee && v.towFee) {
    const max = v.towFee * TOW_RULES.dropFeeMaxShare;
    if (v.dropFee > max) {
      out.push(finding({
        id: "tow-drop-fee",
        severity: "error",
        title: "The drop fee is more than half a full tow",
        detail: `If you catch the tow before your car leaves the lot, the tower must release it, and the drop fee can't be more than 50% of a full tow (${money(max)} here). You paid ${money(v.dropFee)}.`,
        savings: v.dropFee - max,
        sourceIds: ["mdTow05"],
        letterPoint: `I was charged a drop fee of ${money(v.dropFee)}. Md. Code, Transportation § 21-10A-05 limits a drop fee to 50% of a full tow (${money(max)}). I request a refund of ${money(v.dropFee - max)}.`,
      }));
    }
  } else if (v.dropFee && !v.towFee) {
    out.push(finding({
      id: "tow-drop-fee-unknown",
      severity: "check",
      title: "Check your drop fee against the full tow price",
      detail: "A drop fee can be at most half the price of a full tow. Enter the full tow price from the posted sign to check.",
      sourceIds: ["mdTow05"],
    }));
  }

  if (v.noticeFee && v.hoursToRetrieve != null && v.hoursToRetrieve <= TOW_RULES.noticeFeeWaiverHours) {
    out.push(finding({
      id: "tow-notice-fee",
      severity: "error",
      title: "You were charged a notice fee you shouldn't owe",
      detail: `Notice costs can't be charged if you retrieve the car within ${TOW_RULES.noticeFeeWaiverHours} hours of it arriving at storage. You picked it up after ${v.hoursToRetrieve} hours.`,
      savings: v.noticeFee,
      sourceIds: ["mdTow04"],
      letterPoint: `I retrieved my vehicle within ${v.hoursToRetrieve} hours of its arrival at the storage facility, so no notice charge may be imposed under § 21-10A-04(b). I request a refund of the ${money(v.noticeFee)} notice fee.`,
    }));
  }

  if (v.storagePerDay && v.storagePerDay > TOW_RULES.cityImpoundStorageFee) {
    const extra = v.storageDays ? (v.storagePerDay - TOW_RULES.cityImpoundStorageFee) * v.storageDays : null;
    out.push(finding({
      id: "tow-storage-rate",
      severity: "check",
      title: `The storage rate (${money(v.storagePerDay)}/day) looks too high`,
      detail: `Private-lot storage can't exceed the daily storage fee the City charges or authorizes. The City reported ${money(TOW_RULES.cityImpoundStorageFee)}/day, and the City code caps licensed towers at $50/day.`,
      savings: extra,
      sourceIds: ["mdTow04", "cityCode31_22_9", "cityTowTestimony"],
      letterPoint: `I was charged ${money(v.storagePerDay)} per day for storage, which exceeds the daily storage fee authorized in Baltimore City. I request a refund of the excess.`,
    }));
  }

  if (v.paymentRefused) {
    out.push(finding({
      id: "tow-payment",
      severity: "error",
      title: "The storage lot must take cards or have an ATM",
      detail: "The lot must accept cash or at least two major credit cards. If it takes only cash, it must have a working ATM on site. If it can't take cards and has no ATM, it must accept a personal check.",
      sourceIds: ["mdTow05"],
      letterPoint: "The storage facility refused to accept credit cards and did not have an operable ATM on the premises, in violation of Md. Code, Transportation § 21-10A-05(c).",
    }));
  }

  if (v.registrationOnly && (v.registrationNoticeHours == null || v.registrationNoticeHours < TOW_RULES.registrationNoticeHours)) {
    out.push(finding({
      id: "tow-registration",
      severity: "error",
      title: "Towed only for registration without 72 hours' notice",
      detail: "A car can't be towed from a lot only for missing or expired registration until 72 hours after a violation notice is placed on it.",
      savings: sum(v.towFee, v.storageTotal, v.noticeFee, v.otherFees) || null,
      sourceIds: ["mdTow04"],
      letterPoint: "My vehicle was towed solely for a registration issue without the 72-hour notice required by Md. Code, Transportation § 21-10A-04(a)(9). I request a full refund.",
    }));
  }

  out.push(finding({
    id: "tow-hours",
    severity: "tip",
    title: "Storage lots must let you get your car 6 a.m. – midnight, every day",
    detail: `You have the right to retrieve your car ${TOW_RULES.retrievalHours}. You can also inspect it and remove loose personal items under supervision.`,
    sourceIds: ["mdTow05"],
  }));
}

function normalize(r) {
  const n = (k) => num(r[k]);
  const bool = (k) => r[k] === true || r[k] === "on" || r[k] === "yes";
  const storagePerDay = n("storagePerDay");
  const storageDays = n("storageDays");
  let storageTotal = n("storageTotal");
  if (storageTotal == null && storagePerDay != null && storageDays != null) storageTotal = storagePerDay * storageDays;
  return {
    towType: r.towType === "city" ? "city" : "private",
    stolen: bool("stolen"),
    towFee: n("towFee"),
    storagePerDay,
    storageDays,
    storageTotal,
    noticeFee: n("noticeFee"),
    otherFees: n("otherFees"),
    dropFee: n("dropFee"),
    hoursToRetrieve: n("hoursToRetrieve"),
    postedMax: n("postedMax"),
    paymentRefused: bool("paymentRefused"),
    registrationOnly: bool("registrationOnly"),
    registrationNoticeHours: n("registrationNoticeHours"),
  };
}

const sum = (...xs) => xs.reduce((a, x) => a + (x || 0), 0);
