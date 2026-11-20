// Income limits and help programs. EUSP, MEAP and Water4All all use 200% of the
// federal poverty level, so one table covers all three.
// Source: Maryland OHEP FY27 Income Guidelines (effective July 1, 2026).

export const FPL200_FY27 = {
  monthly: [null, 2660, 3607, 4553, 5500, 6447, 7393, 8340, 9287, 10233, 11180],
  annual: [null, 31920, 43280, 54640, 66000, 77360, 88720, 100080, 111440, 122800, 134160],
  extraMonthly: 947,
  extraAnnual: 11360,
};

export function monthlyLimit(householdSize) {
  const n = Math.max(1, Math.floor(householdSize || 1));
  if (n <= 10) return FPL200_FY27.monthly[n];
  return FPL200_FY27.monthly[10] + (n - 10) * FPL200_FY27.extraMonthly;
}

export const PROGRAMS = [
  {
    id: "eusp",
    name: "Electric Universal Service Program (EUSP)",
    covers: ["bge"],
    what: "Helps pay electric bills and can retire past-due electric balances.",
    howToApply: "Apply online, by mail, or at a local Office of Home Energy Programs office.",
    url: "https://dhs.maryland.gov/office-of-home-energy-programs/",
    sourceId: "ohepIncome",
    incomeTested: true,
  },
  {
    id: "meap",
    name: "Maryland Energy Assistance Program (MEAP)",
    covers: ["bge"],
    what: "A once-per-season grant toward home heating (gas, oil, electric heat), plus gas arrearage and crisis help.",
    howToApply: "Same application as EUSP: one form covers both.",
    url: "https://dhs.maryland.gov/office-of-home-energy-programs/",
    sourceId: "ohepIncome",
    incomeTested: true,
  },
  {
    id: "water4all",
    name: "Water4All discount",
    covers: ["water"],
    what: "Caps your yearly water and sewer cost based on income. Tenants who don't pay DPW directly can qualify too. Renew every year.",
    howToApply: "Apply online, by mail or in person. If you already get a state benefit with a 200% FPL limit, you can use the shorter application.",
    url: "https://cityservices.baltimorecity.gov/water4all/",
    sourceId: "water4all",
    incomeTested: true,
  },
];

/**
 * Returns programs for a bill type with an eligibility verdict.
 * verdict: "likely" | "unlikely" | "unknown"
 */
export function checkAssistance({ billType, householdSize, monthlyIncome }) {
  const limit = householdSize ? monthlyLimit(householdSize) : null;
  return PROGRAMS.filter((p) => p.covers.includes(billType)).map((p) => {
    let verdict = "unknown";
    if (limit != null && Number.isFinite(monthlyIncome)) {
      verdict = monthlyIncome <= limit ? "likely" : "unlikely";
    }
    return { ...p, limit, verdict };
  });
}
