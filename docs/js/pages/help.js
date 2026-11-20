import { $, esc, money } from "../lib/dom.js";
import { PROGRAMS, FPL200_FY27, monthlyLimit } from "../data/assistance.js";
import { icon } from "../ui/icons.js";

// Limits table
const rows = FPL200_FY27.monthly
  .map((m, i) => (m ? `<tr><td>${i}</td><td>${money(m)}</td><td>${money(FPL200_FY27.annual[i])}</td></tr>` : ""))
  .join("");
$("#limits").innerHTML = `
  <thead><tr><th style="text-align:left">People</th><th style="text-align:left">Monthly limit</th><th style="text-align:left">Yearly limit</th></tr></thead>
  <tbody>${rows}<tr><td>Each extra person</td><td>+${money(FPL200_FY27.extraMonthly)}</td><td>+${money(FPL200_FY27.extraAnnual)}</td></tr></tbody>`;
$("#limits").classList.add("data");

// Finder
$("#help-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const size = Number(e.target.householdSize.value);
  const income = Number(e.target.monthlyIncome.value);
  const out = $("#help-results");
  if (!size || e.target.monthlyIncome.value === "") {
    out.hidden = false;
    out.innerHTML = `<div class="panel"><p class="status err">Please enter both numbers.</p></div>`;
    return;
  }
  const limit = monthlyLimit(size);
  const ok = income <= limit;
  out.hidden = false;
  out.innerHTML = `
    <div class="panel">
      <div class="alert ${ok ? "alert-success" : "alert-info"}" style="margin-bottom:18px">${icon(ok ? "checkCircle" : "info")}<div><h3>${ok ? "Good news: you likely qualify on income" : "Your income is above the 200% limit"}</h3>
      <p>Limit for ${size} ${size === 1 ? "person" : "people"}: <b>${money(limit)}</b> a month. You entered ${money(income)}.</p></div></div>
      ${ok ? "" : `<p>You can still ask BGE or DPW for a payment plan. Disputing a wrong bill doesn't depend on income at all: <a href="index.html#tools">check your bill</a>.</p>`}
      <div class="programs">
        ${PROGRAMS.map((p) => `
          <div class="program">
            <div class="verdict ${ok ? "v-likely" : "v-unlikely"}">${ok ? "Likely eligible on income" : "Above income limit"} · ${p.covers.includes("water") ? "Water bill" : "BGE bill"}</div>
            <h3>${esc(p.name)}</h3>
            <p class="muted" style="margin:0 0 6px">${esc(p.what)} ${esc(p.howToApply)}</p>
            <a href="${p.url}" target="_blank" rel="noopener">How to apply ${icon("external")}</a>
          </div>`).join("")}
      </div>
      <p class="small muted" style="margin-top:12px">This is a quick income check, not a decision. Each program reviews your application and documents.</p>
    </div>`;
  out.scrollIntoView({ behavior: "smooth" });
});
