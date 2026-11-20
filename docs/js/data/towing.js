// Towing rules for Baltimore City.
// State law (Transportation §§ 21-10A-04, 21-10A-05) applies statewide to tows from
// private parking lots ("trespass tows"). City impound rules come from BCDOT.

export const TOW_RULES = {
  // Trespass tow fee may be at most 2x what the jurisdiction charges for a public-safety
  // impound tow (only the tow fee is doubled — AG Opinion 107 OAG 093 and 2023 SB 599).
  trespassMultiplier: 2,
  // Baltimore City impound tow fee reported by the City in 2023 legislative testimony.
  // UNVERIFIED for 2026: the app uses it only for "worth checking" findings, never "likely error".
  cityImpoundTowFee: 140,
  cityImpoundStorageFee: 50,
  cityImpoundStorageGraceHours: 48,
  cityImpoundAdminFee: 40,
  // State fallback caps when a jurisdiction sets no limit.
  stateDefaultTowCap: 250,
  stateDefaultStorageCap: 30,
  // Drop fee: at most half of a full tow (§ 21-10A-05(b)).
  dropFeeMaxShare: 0.5,
  // Notice costs can't be charged if you retrieve the car within 48 hours of it reaching storage.
  noticeFeeWaiverHours: 48,
  // A car can't be towed only for an expired/missing registration until 72 hours after a notice is posted.
  registrationNoticeHours: 72,
  // Storage lot must let you retrieve your car at least 6 a.m. – midnight, every day.
  retrievalHours: "6 a.m. to midnight, 7 days a week",
};

export function estimatedTrespassCap() {
  return TOW_RULES.cityImpoundTowFee * TOW_RULES.trespassMultiplier;
}
