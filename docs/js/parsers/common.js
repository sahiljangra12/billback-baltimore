// Helpers for pulling numbers out of bill text. Bill layouts change, so every parser
// is best-effort: it returns only what it's confident about, and the UI asks the
// user to confirm each auto-filled value.

export function clean(text) {
  return String(text || "")
    .replace(/ /g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\r/g, "");
}

/** First capture group of the first pattern that matches, as a number. */
export function findNumber(text, patterns) {
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1] != null) {
      const n = Number(m[1].replace(/[$,\s]/g, ""));
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

export function findText(text, patterns) {
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return null;
}

/** Days between two US-style dates (MM/DD/YYYY or MM/DD/YY) found in a match. */
export function daysBetween(a, b) {
  const d1 = parseUsDate(a);
  const d2 = parseUsDate(b);
  if (!d1 || !d2) return null;
  const days = Math.round((d2 - d1) / 86400000);
  return days > 0 && days < 120 ? days : null;
}

export function parseUsDate(s) {
  const m = String(s || "").match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!m) return null;
  let y = Number(m[3]);
  if (y < 100) y += 2000;
  const d = new Date(Date.UTC(y, Number(m[1]) - 1, Number(m[2])));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toIso(d) {
  return d ? d.toISOString().slice(0, 10) : null;
}

/** Drop null/undefined values so we never overwrite a field with nothing. */
export function compact(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== ""));
}

const MONEY = String.raw`\$?\s*([\d,]+\.\d{2})`;
const NUMBER = String.raw`([\d,]+(?:\.\d+)?)`;
export const P = { MONEY, NUMBER };
