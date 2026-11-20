# BillBack Baltimore

**Check it. Fight it. Get it back.**

A free web app for Baltimore residents. It checks a **BGE bill**, a **City water bill** or a **tow receipt** against the published rates and the law, flags what looks wrong, checks eligibility for bill assistance, and writes a ready-to-send dispute letter.

🔗 **Live site:** https://sahiljangra12.github.io/billback-baltimore/

## Why

Baltimore residents are fighting their bills on several fronts at once. About 290,000 BGE customers were behind on payments as of March 2026. Water bills keep producing four- and five-figure errors. Private-lot towing has been a long-running complaint. The rules that protect people already exist (PSC complaint rights, the Water Accountability & Equity Act, Maryland's towing law), but they're scattered across statutes and agency pages. This app puts them in one place and applies them to *your* bill.

## What it checks

| Bill | Checks |
|---|---|
| ⚡ **BGE** | Shut-off notices (PSC complaint pauses termination) · estimated readings · long billing periods · usage spikes vs last bill and the same month last year (per day) · third-party supplier rate vs BGE's *Price to Compare*, with the dollar overpayment · late-fee waiver · EUSP/MEAP eligibility |
| 💧 **Water** | Recalculates water + sewer at DPW's **FY2027** (or FY2026) rates by meter size · usage vs a household's normal (3 CCF/person/month) · spikes vs average · vacant-property usage · estimated reads · Water4All eligibility · DPW → WACA → ECB appeal path and deadlines |
| 🚗 **Tow** | Charge above the lot's posted sign · fee above the estimated City limit (2× impound fee) · drop fee > 50% of a tow · notice fee within 48 h · storage rate · cash-only lots with no ATM · registration-only tows without 72 h notice · stolen cars at the City impound (no fees) |

Each finding is ranked **Act now / Likely error / Worth checking / Tip**, shows the dollar amount at stake, and links to its official source. When a number can't be confirmed from an official 2026 source (for example the City's exact trespass-tow cap), the finding is only ever **Worth checking**.

## Privacy

Everything runs in the browser. PDFs are read with [pdf.js](https://mozilla.github.io/pdf.js/) and photos with [Tesseract.js](https://tesseract.projectnaptha.com/), both on the user's device. There is no server, no database and no analytics.

## Project structure

```
├── docs/                     The website (GitHub Pages publishes this folder)
│   ├── index.html              Home
│   ├── bge.html                BGE checker
│   ├── water.html              Water checker
│   ├── tow.html                Tow checker
│   ├── help.html               Bill-assistance finder (EUSP, MEAP, Water4All)
│   ├── rights.html             Escalation paths & deadlines
│   ├── about.html              How it works, privacy, all sources
│   ├── assets/css/styles.css   Design system (tokens, components, print styles)
│   └── js/
│       ├── data/               Facts only, each tied to a source
│       │   ├── sources.js        Every official source + date checked
│       │   ├── water-rates.js    DPW FY2026/FY2027 rates, expected-bill math
│       │   ├── assistance.js     FY27 200% FPL limits, programs
│       │   ├── towing.js         Md. towing law numbers
│       │   └── contacts.js       Escalation steps per bill type
│       ├── rules/              Pure functions: form values → findings
│       ├── parsers/            Bill text → form fields (best effort)
│       ├── letters/            Dispute-letter builder
│       ├── lib/                DOM helpers, in-browser PDF/OCR text extraction
│       ├── ui/                 Shared header/footer, checker controller
│       └── pages/              Small entry script per page
├── tests/                    node:test suites for rules, parsers, letters
└── notes/                    Data maintenance guide & roadmap
```

The rules, parsers and letters are plain ES modules with no DOM access, so they run unchanged in the browser and in Node tests.

## Run locally

```bash
npm start          # serves docs/ on http://localhost:8080
npm test           # runs the unit tests
```

No build step and no dependencies.

## Keeping it accurate

Rates and limits change every July. See [`notes/DATA.md`](notes/DATA.md) for what to update and where. Every value lives in `docs/js/data/` next to its source.

## Disclaimer

General information, not legal advice. Not affiliated with BGE, Exelon or the City of Baltimore.

## License

MIT
