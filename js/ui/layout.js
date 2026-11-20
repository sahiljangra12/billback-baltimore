// Shared header and footer, injected on every page so they stay identical.

const NAV = [
  { href: "bge.html", label: "BGE bill" },
  { href: "water.html", label: "Water bill" },
  { href: "tow.html", label: "Tow receipt" },
  { href: "help.html", label: "Get help paying" },
  { href: "rights.html", label: "Your rights" },
  { href: "about.html", label: "About" },
];

export function mountLayout() {
  const here = location.pathname.split("/").pop() || "index.html";

  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <a class="skip" href="#main">Skip to content</a>
    <div class="wrap">
      <a class="brand" href="index.html" aria-label="BillBack Baltimore home">
        <span class="brand-mark" aria-hidden="true">B</span>
        <span>BillBack Baltimore<small>Check it. Fight it. Get it back.</small></span>
      </a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button>
      <nav class="nav" id="site-nav" aria-label="Main">
        ${NAV.map((n) => `<a href="${n.href}"${n.href === here ? ' aria-current="page"' : ""}>${n.label}</a>`).join("")}
      </nav>
    </div>`;
  document.body.prepend(header);

  const toggle = header.querySelector(".nav-toggle");
  const nav = header.querySelector(".nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <h4>BillBack Baltimore</h4>
          <p>A free tool that checks Baltimore bills against the published rules and writes your dispute letter. Your bill is read in your browser and is never uploaded.</p>
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
          <h4>More</h4>
          <ul>
            <li><a href="help.html">Bill assistance</a></li>
            <li><a href="rights.html">Your rights</a></li>
            <li><a href="about.html#sources">Sources</a></li>
          </ul>
        </div>
      </div>
      <p class="footer-note">This is general information, not legal advice. Rates and rules change, so every finding links to its official source. Check it before you rely on it. Not affiliated with BGE or the City of Baltimore.</p>
    </div>`;
  document.body.append(footer);
}

mountLayout();
