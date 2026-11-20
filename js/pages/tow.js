import { mountChecker } from "../ui/checker.js";
import { checkTow } from "../rules/tow.js";
import { parseTow } from "../parsers/tow.js";
import { $$ } from "../lib/dom.js";

mountChecker({ type: "tow", check: checkTow, parse: parseTow, amountField: "towFee", fileLabel: "tow receipt" });

// Show only the questions that apply to the kind of tow.
const sync = () => {
  const type = document.querySelector('input[name="towType"]:checked')?.value || "private";
  $$("[data-tow]").forEach((el) => { el.hidden = el.dataset.tow !== type; });
};
$$('input[name="towType"]').forEach((r) => r.addEventListener("change", sync));
document.getElementById("bill-form").addEventListener("reset", () => setTimeout(sync));
sync();
