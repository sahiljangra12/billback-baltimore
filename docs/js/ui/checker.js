// One controller for all three checkers. Each page supplies its form markup plus:
//   { type, check(values) → findings, parse(text) → fields, amountField, fileLabel }
import { $, $$, esc, formValues, fillForm, money, download } from "../lib/dom.js";
import { extractText } from "../lib/extract-text.js";
import { summarize } from "../rules/finding.js";
import { SOURCES } from "../data/sources.js";
import { checkAssistance } from "../data/assistance.js";
import { ESCALATION } from "../data/contacts.js";
import { buildLetter } from "../letters/letters.js";

const SEV_LABEL = { urgent: "Act now", error: "Likely error", check: "Worth checking", tip: "Tip" };

export function mountChecker(cfg) {
  const form = $("#bill-form");
  const results = $("#results");
  let findings = [];

  setupUpload(form, cfg);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const values = formValues(form);
    findings = cfg.check(values);
    renderResults(results, cfg, values, findings);
    results.hidden = false;
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  form.addEventListener("reset", () => {
    $$(".autofilled", form).forEach((el) => el.classList.remove("autofilled"));
    results.hidden = true;
    $("#upload-status").textContent = "";
  });
}

function setupUpload(form, cfg) {
  const zone = $("#upload");
  const input = $("input[type=file]", zone);
  const status = $("#upload-status");

  const handle = async (file) => {
    status.className = "status";
    try {
      const text = await extractText(file, (msg) => (status.textContent = msg));
      const fields = cfg.parse(text);
      const filled = fillForm(form, fields);
      if (filled.length) {
        status.className = "status ok";
        status.textContent = `Filled in ${filled.length} field${filled.length > 1 ? "s" : ""} from your ${cfg.fileLabel}, highlighted in yellow. Check each one against the bill, then fill in anything that's missing.`;
      } else {
        status.className = "status err";
        status.textContent = `We couldn't read numbers from this ${cfg.fileLabel}. Bill layouts vary, so please type the numbers in below.`;
      }
    } catch (err) {
      status.className = "status err";
      status.textContent = err.message;
    }
  };

  zone.addEventListener("click", (e) => { if (e.target !== input) input.click(); });
  zone.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
  input.addEventListener("change", () => input.files[0] && handle(input.files[0]));
  zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("drag"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("drag"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("drag");
    if (e.dataTransfer.files[0]) handle(e.dataTransfer.files[0]);
  });
}

function renderResults(root, cfg, values, findings) {
  const s = summarize(findings);
  const problems = s.counts.urgent + s.counts.error + s.counts.check;

  root.innerHTML = `
    <div class="panel">
      <h2>Your results</h2>
      <div class="summary">
        <div class="sum-box"><b>${s.counts.urgent + s.counts.error}</b>Likely errors / urgent</div>
        <div class="sum-box"><b>${s.counts.check}</b>Worth checking</div>
        <div class="sum-box"><b>${s.counts.tip}</b>Tips</div>
        <div class="sum-box save"><b>${s.savings ? money(s.savings) : "—"}</b>Possible savings</div>
      </div>
      ${problems === 0 ? `<div class="empty"><h3>Nothing looks wrong with the numbers you entered.</h3><p class="muted">That's good news. If the bill still feels too high, add your past usage or more line items and check again, or see if you qualify for help paying.</p></div>` : ""}
      <div id="findings">${findings.map(renderFinding).join("")}</div>
    </div>

    ${cfg.type !== "tow" ? `<div class="panel" id="programs-panel"><h2>Help paying this bill</h2><div class="programs" id="programs"></div></div>` : ""}

    <div class="panel">
      <h2>What to do next</h2>
      <ol class="timeline">
        ${ESCALATION[cfg.type].map((st) => `<li><b>${esc(st.step)}</b><span class="muted">${esc(st.detail)}</span> <a href="${st.url}" target="_blank" rel="noopener">Official page ↗</a></li>`).join("")}
      </ol>
    </div>

    <div class="panel letter-box" id="letter-section">
      <h2>Your dispute letter</h2>
      <p class="muted">Tick the findings to include, add your details, then copy, download or print. Edit anything you like. It's your letter.</p>
      <form id="who" class="grid-2" autocomplete="on">
        <div class="field"><label for="w-name">Your name</label><input id="w-name" name="name" type="text" autocomplete="name"></div>
        <div class="field"><label for="w-account">${cfg.type === "tow" ? "Receipt / invoice #" : "Account number"}</label><input id="w-account" name="account" type="text"></div>
        <div class="field"><label for="w-address">Street address</label><input id="w-address" name="address" type="text" autocomplete="street-address"></div>
        <div class="field"><label for="w-date">Bill / receipt date</label><input id="w-date" name="billDate" type="text" placeholder="e.g. Nov 3, 2026"></div>
        <div class="field"><label for="w-phone">Phone</label><input id="w-phone" name="phone" type="tel" autocomplete="tel"></div>
        <div class="field"><label for="w-email">Email</label><input id="w-email" name="email" type="email" autocomplete="email"></div>
      </form>
      <div class="field" style="margin-top:16px"><label for="letter">Letter</label><textarea id="letter" spellcheck="true"></textarea></div>
      <div class="btn-row" style="margin-top:12px">
        <button class="btn btn-dark btn-sm" id="copy-letter" type="button">Copy letter</button>
        <button class="btn btn-ghost btn-sm" id="download-letter" type="button">Download .txt</button>
        <button class="btn btn-ghost btn-sm" id="print-letter" type="button">Print</button>
        <span class="status" id="letter-status" role="status"></span>
      </div>
    </div>`;

  if (cfg.type !== "tow") renderPrograms($("#programs", root), cfg.type, values);
  wireLetter(root, cfg, values, findings);
}

function renderFinding(f, i) {
  const sources = f.sourceIds
    .map((id) => SOURCES[id])
    .filter(Boolean)
    .map((s) => `<a href="${s.url}" target="_blank" rel="noopener" title="${esc(s.title)}">Source ↗</a>`)
    .slice(0, 2)
    .join(" ");
  return `
    <article class="finding sev-${f.severity}">
      <span class="tag">${SEV_LABEL[f.severity]}</span>
      <h3>${esc(f.title)}</h3>
      <p>${esc(f.detail)}</p>
      <div class="meta">
        ${f.savings > 0 ? `<span class="saving-pill">Up to ${money(f.savings)}</span>` : ""}
        ${sources}
        ${f.letterPoint ? `<label class="include"><input type="checkbox" data-include="${i}" ${f.severity !== "tip" ? "checked" : ""}> Include in letter</label>` : ""}
      </div>
    </article>`;
}

function renderPrograms(el, type, values) {
  const size = Number(values.householdSize) || null;
  const income = values.monthlyIncome === "" || values.monthlyIncome == null ? NaN : Number(values.monthlyIncome);
  const list = checkAssistance({ billType: type, householdSize: size, monthlyIncome: income });
  const text = {
    likely: "You likely qualify on income",
    unlikely: "Your income is above the limit",
    unknown: "Add household size and income above to check",
  };
  el.innerHTML = list
    .map((p) => `
      <div class="program">
        <div class="verdict v-${p.verdict}">${text[p.verdict]}${p.limit ? ` (limit ${money(p.limit)}/month for ${size} ${size === 1 ? "person" : "people"})` : ""}</div>
        <h3>${esc(p.name)}</h3>
        <p class="muted" style="margin:0 0 6px">${esc(p.what)} ${esc(p.howToApply)}</p>
        <a href="${p.url}" target="_blank" rel="noopener">How to apply ↗</a>
      </div>`)
    .join("") + `<p class="small muted" style="margin:6px 0 0">Income limits: Maryland OHEP FY27 guidelines (200% of the federal poverty level). Final eligibility is decided by the program. <a href="help.html">More help options →</a></p>`;
}

function wireLetter(root, cfg, values, findings) {
  const who = $("#who", root);
  const box = $("#letter", root);
  const status = $("#letter-status", root);
  let edited = false;

  const render = () => {
    if (edited) return;
    const chosen = $$("[data-include]", root).filter((c) => c.checked).map((c) => findings[Number(c.dataset.include)]);
    const w = formValues(who);
    const amount = values[cfg.amountField];
    if (amount) w.amount = money(Number(String(amount).replace(/[$,]/g, "")));
    box.value = buildLetter(cfg.type, w, chosen);
  };

  render();
  who.addEventListener("input", render);
  root.addEventListener("change", (e) => { if (e.target.matches("[data-include]")) { edited = false; render(); } });
  box.addEventListener("input", () => { edited = true; });

  $("#copy-letter", root).addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(box.value);
      status.textContent = "Copied.";
    } catch {
      box.select();
      status.textContent = "Press Ctrl/Cmd + C to copy.";
    }
  });
  $("#download-letter", root).addEventListener("click", () => download(`billback-${cfg.type}-dispute-letter.txt`, box.value));
  $("#print-letter", root).addEventListener("click", () => {
    let t = $(".print-target");
    if (!t) { t = document.createElement("div"); t.className = "print-target"; $("main").append(t); }
    t.textContent = box.value;
    document.body.classList.add("printing-letter");
    window.print();
    document.body.classList.remove("printing-letter");
  });
}
