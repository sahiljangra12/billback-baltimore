import { $, esc } from "../lib/dom.js";
import { ESCALATION } from "../data/contacts.js";
import { icon } from "../ui/icons.js";

const SECTIONS = [
  { id: "bge", icon: "bolt", title: "BGE bill", link: "bge.html" },
  { id: "water", icon: "drop", title: "City water bill", link: "water.html" },
  { id: "tow", icon: "truck", title: "Tow or impound", link: "tow.html" },
];

$("#rights").innerHTML = SECTIONS.map((s) => `
  <section class="panel" id="${s.id}">
    <h2>${icon(s.icon)} ${s.title}</h2>
    <ol class="timeline">
      ${ESCALATION[s.id].map((st) => `<li><b>${esc(st.step)}</b><span class="muted">${esc(st.detail)}</span> <a href="${st.url}" target="_blank" rel="noopener">Official page ${icon("external")}</a></li>`).join("")}
    </ol>
    <a class="btn btn-primary btn-sm" href="${s.link}">Check a ${s.title.toLowerCase()} →</a>
  </section>`).join("");

if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
