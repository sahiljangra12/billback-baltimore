// Shared banner, header, navigation and footer: identical on every page.
import { icon, hydrateIcons } from "./icons.js";
import { hydrateImages } from "../data/images.js";

const NAV = [
  { href: "index.html", label: "Home", icon: "home" },
  { href: "bge.html", label: "BGE bill", icon: "bolt" },
  { href: "water.html", label: "Water bill", icon: "drop" },
  { href: "tow.html", label: "Tow receipt", icon: "truck" },
  { href: "help.html", label: "Help paying", icon: "hand" },
  { href: "rights.html", label: "Your rights", icon: "scale" },
  { href: "contacts.html", label: "Phone numbers", icon: "phone" },
];

export function mountLayout() {
  const here = location.pathname.split("/").pop() || "index.html";

  const top = document.createElement("div");
  top.innerHTML = `
    <a class="skip" href="#main">Skip to main content</a>
    <section class="gov-banner" aria-label="About this website">
      <div class="wrap">
        <span class="flag" aria-hidden="true">${icon("shield")}</span>
        <span>An independent public-service tool for Baltimore residents. Free, and not a government website.</span>
        <button type="button" aria-expanded="false" aria-controls="banner-panel">Here's how you know ${icon("chevron")}</button>
      </div>
    </section>
    <div class="banner-panel" id="banner-panel" hidden>
      <div class="wrap">
        <div class="item">${icon("shield")}<div><b>Independent and free</b><br>BillBack Baltimore is not run by BGE, the City of Baltimore or the State of Maryland. It never asks for payment.</div></div>
        <div class="item">${icon("lock")}<div><b>Your bill stays on your device</b><br>Bills are read inside your browser. Nothing you upload or type is sent anywhere or stored.</div></div>
        <div class="item">${icon("checkCircle")}<div><b>Every rule has a source</b><br>Each finding links to the official law, rate schedule or agency page it comes from.</div></div>
      </div>
    </div>
    <header class="site-header">
      <div class="wrap header-top">
        <a class="brand" href="index.html">
          <img src="assets/logo.svg" alt="" width="52" height="52">
          <span><span class="brand-name">BillBack Baltimore</span><span class="brand-sub">Check your bill. Know your rights. Get your money back.</span></span>
        </a>
        <div class="header-tools">
          <a class="header-help" href="contacts.html">${icon("phone")} <span>Need a number? <b>Phone directory</b></span></a>
          <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">${icon("menu")} Menu</button>
        </div>
      </div>
      <nav class="site-nav" id="site-nav" aria-label="Primary">
        <ul>${NAV.map((n) => `<li><a href="${n.href}"${n.href === here ? ' aria-current="page"' : ""}>${icon(n.icon)}${n.label}</a></li>`).join("")}</ul>
      </nav>
    </header>`;
  document.body.prepend(...top.children);

  const bannerBtn = document.querySelector(".gov-banner button");
  const panel = document.getElementById("banner-panel");
  bannerBtn.addEventListener("click", () => {
    const open = panel.hidden;
    panel.hidden = !open;
    bannerBtn.setAttribute("aria-expanded", String(open));
  });

  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.getElementById("site-nav");
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.innerHTML = `${icon(open ? "close" : "menu")} ${open ? "Close" : "Menu"}`;
  });

  const foot = document.createElement("div");
  foot.innerHTML = `
    <div class="return-top"><div class="wrap"><a href="#main">Return to top</a></div></div>
    <footer class="footer-main">
      <div class="wrap footer-grid">
        <div>
          <div class="footer-brand"><img src="assets/logo.svg" alt=""><b>BillBack Baltimore</b></div>
          <p class="small">A free tool that checks Baltimore bills against the published rates and the law, then writes your dispute letter. Your bill is read in your browser and never uploaded.</p>
        </div>
        <div>
          <h4>Check a bill</h4>
          <ul>
            <li><a href="bge.html">BGE gas &amp; electric</a></li>
            <li><a href="water.html">City water &amp; sewer</a></li>
            <li><a href="tow.html">Tow &amp; impound</a></li>
          </ul>
        </div>
        <div>
          <h4>Get help</h4>
          <ul>
            <li><a href="help.html">Help paying bills</a></li>
            <li><a href="rights.html">Dispute steps &amp; deadlines</a></li>
            <li><a href="contacts.html">Phone directory</a></li>
          </ul>
        </div>
        <div>
          <h4>About</h4>
          <ul>
            <li><a href="about.html">How it works</a></li>
            <li><a href="about.html#privacy">Privacy</a></li>
            <li><a href="about.html#accessibility">Accessibility</a></li>
            <li><a href="about.html#sources">Sources &amp; photo credits</a></li>
          </ul>
        </div>
      </div>
    </footer>
    <div class="identifier">
      <div class="wrap">
        <span>BillBack Baltimore is an independent project. Not affiliated with BGE, Exelon, the City of Baltimore or the State of Maryland. General information, not legal advice.</span>
        <ul>
          <li><a href="https://github.com/sahiljangra12/billback-baltimore" target="_blank" rel="noopener">Open source on GitHub</a></li>
          <li><a href="about.html#sources">Sources</a></li>
        </ul>
      </div>
    </div>`;
  document.body.append(...foot.children);

  hydrateIcons();
  hydrateImages();
}

mountLayout();
