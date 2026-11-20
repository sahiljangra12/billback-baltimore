// Builds a plain-text dispute letter from the user's details and the findings
// they chose to include. Plain text so it can be pasted into an email, a web form,
// or printed and mailed.

const RECIPIENTS = {
  bge: {
    to: ["Baltimore Gas and Electric Company", "Customer Care"],
    subject: "Billing dispute",
    accountLabel: "BGE account number",
  },
  water: {
    to: ["Baltimore City Department of Public Works", "Customer Support and Services Division", "200 Holliday St., Room 404", "Baltimore, MD 21202", "DPW.Billing@baltimorecity.gov"],
    subject: "Water bill dispute and request for review",
    accountLabel: "Water account number",
  },
  tow: {
    to: ["[Towing company name]", "[Towing company address]"],
    cc: ["Baltimore City Board of Licensing for Towing Services"],
    subject: "Dispute of towing and storage charges",
    accountLabel: "Receipt / invoice number",
  },
};

const CLOSINGS = {
  bge: "Please investigate and send me a corrected bill, or a written explanation of the charges, within 30 days. If we cannot resolve this, I will file a complaint with the Maryland Public Service Commission's Consumer Affairs Division.",
  water: "Please confirm receipt, investigate, and send me your written determination. I understand I may appeal the determination and request assistance from the Office of Water Advocacy & Customer Appeals.",
  tow: "Please refund the overcharges listed above within 14 days. If I do not hear from you, I will file a complaint with the Baltimore City Board of Licensing for Towing Services and the Maryland Attorney General's Consumer Protection Division, and may seek recovery in District Court.",
};

/**
 * @param {"bge"|"water"|"tow"} type
 * @param {object} who   { name, address, phone, email, account, billDate, amount }
 * @param {object[]} findings  findings with letterPoint
 * @param {Date} [today]
 */
export function buildLetter(type, who = {}, findings = [], today = new Date()) {
  const r = RECIPIENTS[type];
  if (!r) throw new Error(`Unknown letter type: ${type}`);
  const points = findings.map((f) => f.letterPoint).filter(Boolean);
  const date = today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const lines = [];
  lines.push(who.name || "[Your name]");
  lines.push(who.address || "[Your street address]");
  lines.push("Baltimore, MD [ZIP]");
  if (who.phone) lines.push(who.phone);
  if (who.email) lines.push(who.email);
  lines.push("", date, "");
  lines.push(...r.to);
  if (r.cc) lines.push(`cc: ${r.cc.join(", ")}`);
  lines.push("");
  lines.push(`RE: ${r.subject}`);
  lines.push(`${r.accountLabel}: ${who.account || "[number]"}`);
  if (who.billDate) lines.push(`Bill / receipt date: ${who.billDate}`);
  if (who.amount) lines.push(`Amount in dispute: ${who.amount}`);
  lines.push("", "To whom it may concern:", "");
  lines.push(intro(type));
  lines.push("");
  if (points.length) {
    points.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
  } else {
    lines.push("1. [Describe what is wrong with the bill.]");
  }
  lines.push("", CLOSINGS[type], "");
  lines.push("I have attached copies of the bill and my supporting records. Please send all replies in writing.", "");
  lines.push("Sincerely,", "", who.name || "[Your name]");
  return lines.join("\n");
}

function intro(type) {
  switch (type) {
    case "bge":
      return "I am writing to dispute charges on my BGE bill. After reviewing it, I found the following problems:";
    case "water":
      return "I am writing to dispute my water and sewer bill and to request a billing review. After reviewing it, I found the following problems:";
    case "tow":
      return "I am writing to dispute the charges for the towing and storage of my vehicle. After reviewing the receipt, I found the following problems:";
    default:
      return "";
  }
}
