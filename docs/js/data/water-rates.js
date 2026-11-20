// Baltimore City residential water & sewer rates.
// FY2027 rates took effect July 1, 2026 (Board of Estimates approval, Jan 22, 2025).
// FY2026 is kept so bills for service periods before July 2026 can still be checked.

export const WATER_RATES = {
  FY2027: {
    effective: "2026-07-01",
    waterPerCcf: 4.86,
    sewerPerCcf: 14.37,
    accountFee: 5.79,
    // Monthly infrastructure charges by meter size: [water, sewer]
    infrastructure: {
      "5/8": [17.52, 16.51],
      "3/4": [31.47, 29.69],
      "1": [69.91, 65.97],
    },
  },
  FY2026: {
    effective: "2025-07-01",
    waterPerCcf: 4.46,
    sewerPerCcf: 13.18,
    accountFee: 5.31,
    infrastructure: {
      "5/8": [16.07, 15.15],
      "3/4": [28.87, 27.24],
      "1": [64.14, 60.52],
    },
  },
};

export const GALLONS_PER_CCF = 748;

// DPW: one person uses about 3 CCF per month; DPW's "typical household" uses 6 CCF.
export const CCF_PER_PERSON_MONTH = 3;
export const TYPICAL_HOUSEHOLD_CCF = 6;

/** Pick the rate year for a service date (ISO string or Date). Defaults to the newest. */
export function ratesFor(date) {
  const d = date ? new Date(date) : new Date();
  if (Number.isNaN(d.getTime())) return { year: "FY2027", ...WATER_RATES.FY2027 };
  return d >= new Date(WATER_RATES.FY2027.effective)
    ? { year: "FY2027", ...WATER_RATES.FY2027 }
    : { year: "FY2026", ...WATER_RATES.FY2026 };
}

/**
 * Expected monthly water + sewer charges (excludes stormwater, Bay Restoration Fee,
 * past-due balances and penalties, which vary by property).
 */
export function expectedWaterSewer({ ccf, meterSize = "5/8", serviceDate, months = 1 }) {
  const r = ratesFor(serviceDate);
  const infra = r.infrastructure[meterSize] ?? r.infrastructure["5/8"];
  const usage = ccf * (r.waterPerCcf + r.sewerPerCcf);
  const fixed = (infra[0] + infra[1]) * months + r.accountFee;
  return {
    year: r.year,
    usage: round2(usage),
    fixed: round2(fixed),
    total: round2(usage + fixed),
    perCcf: round2(r.waterPerCcf + r.sewerPerCcf),
  };
}

const round2 = (n) => Math.round(n * 100) / 100;
