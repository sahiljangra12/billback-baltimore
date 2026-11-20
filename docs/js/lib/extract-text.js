// Reads text out of an uploaded bill entirely in the browser.
// PDFs: pdf.js. Photos/screenshots: Tesseract OCR. Both load only when needed.

const PDFJS = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs";
const PDFJS_WORKER = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";
const TESSERACT = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";

export async function extractText(file, onProgress = () => {}) {
  if (!file) throw new Error("No file selected.");
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return pdfText(file, onProgress);
  if (file.type.startsWith("image/")) return imageText(file, onProgress);
  if (file.type.startsWith("text/") || name.endsWith(".txt")) return file.text();
  throw new Error("Please upload a PDF, a photo, or a screenshot of the bill.");
}

async function pdfText(file, onProgress) {
  onProgress("Opening PDF…");
  const pdfjs = await import(PDFJS);
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let i = 1; i <= Math.min(doc.numPages, 8); i++) {
    onProgress(`Reading page ${i} of ${doc.numPages}…`);
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(linesFromItems(content.items));
  }
  const text = pages.join("\n");
  if (text.replace(/\s/g, "").length < 40) {
    throw new Error("This PDF looks like a scan with no text layer. Try uploading a photo of it instead, or type the numbers in below.");
  }
  return text;
}

// Group pdf.js text items into lines by their y position so "Label   $12.34" stays together.
function linesFromItems(items) {
  const rows = new Map();
  for (const it of items) {
    if (!it.str) continue;
    const y = Math.round(it.transform[5]);
    const key = [...rows.keys()].find((k) => Math.abs(k - y) <= 2) ?? y;
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push({ x: it.transform[4], s: it.str });
  }
  return [...rows.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, parts]) => parts.sort((a, b) => a.x - b.x).map((p) => p.s).join(" "))
    .join("\n");
}

async function imageText(file, onProgress) {
  onProgress("Loading text recognition (first time takes a few seconds)…");
  if (!window.Tesseract) await loadScript(TESSERACT);
  const { data } = await window.Tesseract.recognize(file, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text") onProgress(`Reading photo… ${Math.round(m.progress * 100)}%`);
    },
  });
  return data.text;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Couldn't load the text reader. Check your connection, or type the numbers in."));
    document.head.append(s);
  });
}
