import { $, esc } from "../lib/dom.js";
import { SOURCES } from "../data/sources.js";

$("#source-list").innerHTML = Object.values(SOURCES)
  .map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${esc(s.title)} ↗</a> <span class="muted">· checked ${s.checked}</span></li>`)
  .join("");
