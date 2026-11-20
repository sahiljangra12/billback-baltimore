// Shared shape for everything the checkers report.
//
// severity:
//   "urgent" – act now (shut-off notice, deadline)
//   "error"  – the bill very likely breaks a rule or contains a mistake
//   "check"  – unusual; worth questioning, but could have an innocent explanation
//   "tip"    – money-saving or process advice
//
// letterPoint: one sentence the dispute letter can use, written in the first person.

export const SEVERITY_ORDER = { urgent: 0, error: 1, check: 2, tip: 3 };

export function finding({ id, severity, title, detail, savings = null, sourceIds = [], letterPoint = null }) {
  if (!SEVERITY_ORDER.hasOwnProperty(severity)) throw new Error(`Bad severity: ${severity}`);
  return { id, severity, title, detail, savings: savings == null ? null : round2(savings), sourceIds, letterPoint };
}

export function sortFindings(list) {
  return [...list].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

export function summarize(findings) {
  const counts = { urgent: 0, error: 0, check: 0, tip: 0 };
  let savings = 0;
  for (const f of findings) {
    counts[f.severity]++;
    if (f.savings && f.savings > 0) savings += f.savings;
  }
  return { counts, savings: round2(savings), disputable: findings.some((f) => f.letterPoint) };
}

export const num = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
};

export const round2 = (n) => Math.round(n * 100) / 100;
export const money = (n) => `$${(Math.round(n * 100) / 100).toFixed(2)}`;
export const pct = (n) => `${Math.round(n * 100)}%`;
