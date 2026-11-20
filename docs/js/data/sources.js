// Every fact the app relies on points to one of these sources.
// When a rule cites a source, the UI shows a link so users can check it themselves.
// Keep `checked` current whenever a number is re-verified.

export const SOURCES = {
  dpwRatesFY27: {
    title: "Baltimore City DPW water, sewer & stormwater rates (FY2027, effective July 1, 2026)",
    url: "https://www.baltimorecity.gov/publicworks/our-work/water-bill/understanding-your-water-bill",
    checked: "2026-11-20",
  },
  dpwHighBill: {
    title: "DPW: Higher than normal water bill & bill review",
    url: "https://www.baltimorecity.gov/publicworks/our-work/water-bill/water-bill-assistance/higher-normal-water-bill",
    checked: "2026-11-20",
  },
  dpwReview: {
    title: "DPW: Reviewing your water bill (turn-off test, meter test)",
    url: "https://www.baltimorecity.gov/publicworks/our-work/customer-service/water-billing/higher-normal-water-bill/water-bill-review-process",
    checked: "2026-11-20",
  },
  dpwDispute: {
    title: "DPW: Water billing dispute process",
    url: "https://publicworks.baltimorecity.gov/node/21682",
    checked: "2026-11-20",
  },
  dpwAdjustment: {
    title: "DPW: Water and sewer adjustment request (leak adjustments)",
    url: "https://www.baltimorecity.gov/publicworks/our-work/water-bill/water-bill-assistance/water-and-sewer-adjustment-request",
    checked: "2026-11-20",
  },
  waca: {
    title: "Office of Water Advocacy & Customer Appeals (WACA)",
    url: "https://www.baltimorecity.gov/publicworks/office-of-water-advocacy-customer-appeals",
    checked: "2026-11-20",
  },
  cityCode24_2_19: {
    title: "Baltimore City Code Art. 24 § 2-19 (request for assistance; no pre-payment required)",
    url: "https://codes.baltimorecity.gov/us/md/cities/baltimore/code/24/2-19",
    checked: "2026-11-20",
  },
  cityCode24_2_21: {
    title: "Baltimore City Code Art. 24 § 2-21 (appeal to Environmental Control Board)",
    url: "https://codes.baltimorecity.gov/us/md/cities/baltimore/code/24/2-21",
    checked: "2026-11-20",
  },
  water4all: {
    title: "Water4All discount program",
    url: "https://www.baltimorecity.gov/publicworks/water-bill/water-bill-assistance/water4all",
    checked: "2026-11-20",
  },
  ohepIncome: {
    title: "Maryland OHEP FY27 income guidelines (EUSP / MEAP, 200% FPL)",
    url: "https://dhs.maryland.gov/documents/OHEP/FY27-OHEP-Income-Guidelines.pdf",
    checked: "2026-11-20",
  },
  ohepApply: {
    title: "Maryland Office of Home Energy Programs – how to apply",
    url: "https://dhs.maryland.gov/office-of-home-energy-programs/frequently-asked-questions/",
    checked: "2026-11-20",
  },
  pscDisputes: {
    title: "Maryland PSC: Utility billing disputes",
    url: "https://www.psc.state.md.us/utility-billing-disputes",
    checked: "2026-11-20",
  },
  pscTerminations: {
    title: "Maryland PSC: BGE must halt terminations while a billing-dispute complaint is pending (2023)",
    url: "https://www.psc.state.md.us/wp-content/uploads/Press-release_Complaints-on-Service-Terminations.pdf",
    checked: "2026-11-20",
  },
  opcComplaint: {
    title: "Maryland Office of People's Counsel: how to file a utility complaint",
    url: "https://opc.maryland.gov/Get-Help/Filing-a-Complaint",
    checked: "2026-11-20",
  },
  opcHighBill: {
    title: "Maryland Office of People's Counsel: Why is my BGE bill so high?",
    url: "https://opc.maryland.gov/Why-is-my-BGE-bill-so-high",
    checked: "2026-11-20",
  },
  mdTow04: {
    title: "Md. Code, Transportation § 21-10A-04 (trespass tow fees, notices, photos)",
    url: "https://law.justia.com/codes/maryland/2018/transportation/title-21/subtitle-10a/section-21-10a-04/",
    checked: "2026-11-20",
  },
  mdTow05: {
    title: "Md. Code, Transportation § 21-10A-05 (drop fee, payment, release hours)",
    url: "https://law.justia.com/codes/maryland/transportation/title-21/subtitle-10a/section-21-10a-05/",
    checked: "2026-11-20",
  },
  mdTowAgOpinion: {
    title: "Md. Attorney General Opinion 107 OAG 093 (2022): only the tow fee may be doubled",
    url: "https://www.marylandattorneygeneral.gov/Opinions%20Documents/2022/107oag093.pdf",
    checked: "2026-11-20",
  },
  cityTowTestimony: {
    title: "Baltimore City testimony (2023): City impound max $140 tow, $50 storage after 48 hrs, $40 admin",
    url: "https://mgaleg.maryland.gov/cmte_testimony/2023/ent/15583_03172023_92149-670.pdf",
    checked: "2026-11-20",
  },
  cityTowing: {
    title: "Baltimore City DOT Towing Division (impound lot, stolen vehicles, hearings)",
    url: "https://www.baltimorecity.gov/transportation/bcdot-divisions/towing",
    checked: "2026-11-20",
  },
  cityCode31_22_9: {
    title: "Baltimore City Code Art. 31 § 22-9 (licensed tow charges: $150 tow / $50 per day storage caps)",
    url: "https://codes.baltimorecity.gov/us/md/cities/baltimore/code/31/22-9",
    checked: "2026-11-20",
  },
};

export function source(id) {
  const s = SOURCES[id];
  if (!s) throw new Error(`Unknown source id: ${id}`);
  return { id, ...s };
}
