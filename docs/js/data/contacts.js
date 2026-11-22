// Where to send a dispute, in escalation order. Only contact details taken from
// official pages are listed; anything else links to the official page instead.

export const ESCALATION = {
  bge: [
    {
      step: "Contact BGE first",
      detail: "Call or write BGE and ask for a bill review. Keep the date, the rep's name and any reference number. The PSC expects you to give the utility a chance to respond (usually 2–6 weeks) before you escalate.",
      url: "https://www.bge.com/",
      sourceId: "pscDisputes",
    },
    {
      step: "File a complaint with the Maryland PSC (free)",
      detail: "Consumer Affairs Division: file online, or call 410-767-8000 / 1-800-492-0474. BGE must pause shut-offs while a billing-dispute complaint is pending.",
      url: "https://mdpsc.my.site.com/complaints/s/?language=en_US",
      sourceId: "pscTerminations",
    },
    {
      step: "Get free help from the Office of People's Counsel",
      detail: "The state's residential ratepayer advocate can help you work through a utility problem.",
      url: "https://opc.maryland.gov/Get-Help/Filing-a-Complaint",
      sourceId: "opcComplaint",
    },
  ],
  water: [
    {
      step: "Ask DPW for a bill review",
      detail: "Call 410-396-5398 or email DPW.Billing@baltimorecity.gov. Ask for a turn-off (leak) test and, if needed, a meter test.",
      url: "https://www.baltimorecity.gov/publicworks/our-work/water-bill/water-bill-assistance/higher-normal-water-bill",
      sourceId: "dpwHighBill",
    },
    {
      step: "Appeal the DPW decision within 10 days",
      detail: "If you disagree with DPW's determination, appeal in writing to the Bureau Head within 10 calendar days of receiving it.",
      url: "https://publicworks.baltimorecity.gov/node/21682",
      sourceId: "dpwDispute",
    },
    {
      step: "Ask WACA, the City's water customer advocate",
      detail: "Request help within 90 calendar days of the decision you dispute. They can't make you pay anyone, including a plumber, before your appeal is heard.",
      url: "https://www.baltimorecity.gov/publicworks/office-of-water-advocacy-customer-appeals",
      sourceId: "cityCode24_2_19",
    },
    {
      step: "Independent hearing at the Environmental Control Board",
      detail: "Appeal within 30 days of WACA's report, or within 45 days of asking WACA for help. A hearing can't increase your bill.",
      url: "https://codes.baltimorecity.gov/us/md/cities/baltimore/code/24/2-21",
      sourceId: "cityCode24_2_21",
    },
  ],
  tow: [
    {
      step: "Ask for the paperwork",
      detail: "Ask the tow company for an itemized receipt, the lot owner's tow authorization, and the photo of the violation. State law requires the tower to get these before towing.",
      url: "https://law.justia.com/codes/maryland/2018/transportation/title-21/subtitle-10a/section-21-10a-04/",
      sourceId: "mdTow04",
    },
    {
      step: "Private-lot tow: complain to the City towing board",
      detail: "Tow companies working for private lots are licensed by the Baltimore City Board of Licensing for Towing Services. Send your letter and evidence.",
      url: "https://www.baltimorecity.gov/transportation/bcdot-divisions/towing",
      sourceId: "cityTowing",
    },
    {
      step: "City impound tow: request a hearing",
      detail: "You can request a hearing when you pick up your vehicle, or at Parking Fines, 200 Holliday Street. You must attend to contest the tow.",
      url: "https://www.baltimorecity.gov/transportation/bcdot-divisions/towing",
      sourceId: "cityTowing",
    },
    {
      step: "Still stuck? Consumer protection or small claims",
      detail: "File with the Maryland Attorney General's Consumer Protection Division, or sue for the overcharge in District Court small claims.",
      url: "https://oag.maryland.gov/our-office/Pages/consumer-protection-division.aspx",
      sourceId: null,
    },
  ],
};
