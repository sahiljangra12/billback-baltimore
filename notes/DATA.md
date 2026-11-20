# Keeping the data accurate

All facts live in `docs/js/data/`. Rules never hard-code a number. When you change a value, update the `checked` date of its source in `docs/js/data/sources.js` and run `npm test`.

## Yearly (every July 1)

| What | File | Where to get it |
|---|---|---|
| Water/sewer volumetric rates, infrastructure charges, account fee | `water-rates.js` (add a new `FYxxxx` block and update `ratesFor`) | DPW Rates & Fees page |
| 200% FPL income limits (EUSP, MEAP, Water4All) | `assistance.js` | Maryland OHEP "FYxx OHEP Income Guidelines" PDF |

## When the law changes

| What | File | Source |
|---|---|---|
| Trespass-tow rules (drop fee, notice fee, payment, hours) | `towing.js` | Md. Code, Transportation §§ 21-10A-04, 21-10A-05 |
| City impound tow/storage/admin fees | `towing.js` (`cityImpoundTowFee`, etc.) | BCDOT Towing Division |
| Water dispute steps & deadlines | `contacts.js` | Baltimore City Code Art. 24 §§ 2-19 – 2-22; DPW dispute process |
| PSC complaint process | `contacts.js` | Maryland PSC / Office of People's Counsel |

## Known gaps to verify

- **Baltimore City trespass-tow cap.** The app estimates it as 2 × $140 = $280, based on the City's 2023 testimony that its impound tow fee is $140. That's why the finding is only "Worth checking". Confirm the current figure with the Board of Licensing for Towing Services, then consider promoting it to "Likely error".
- **BGE bill layout.** The parser was written against typical BGE bill wording, not tested on many real PDFs. Collect anonymized samples to harden `docs/js/parsers/bge.js`.
