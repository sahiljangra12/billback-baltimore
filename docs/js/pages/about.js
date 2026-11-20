import { $, esc } from "../lib/dom.js";
import { SOURCES } from "../data/sources.js";
import { IMAGES } from "../data/images.js";
import { icon } from "../ui/icons.js";

$("#source-list").innerHTML = Object.values(SOURCES)
  .map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${esc(s.title)} ${icon("external")}</a> <span class="muted">· checked ${s.checked}</span></li>`)
  .join("");

$("#photo-list").innerHTML = Object.values(IMAGES)
  .map((m) => `<li><a href="${m.page}" target="_blank" rel="noopener">${esc(m.title)}</a> by ${esc(m.author)}, licensed <a href="${m.licenseUrl}" target="_blank" rel="noopener">${esc(m.license)}</a></li>`)
  .join("");
