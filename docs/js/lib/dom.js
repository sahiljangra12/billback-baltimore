export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Read a form into a plain object; checkboxes become true/false. */
export function formValues(form) {
  const out = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.type === "checkbox") out[el.name] = el.checked;
    else if (el.type === "radio") { if (el.checked) out[el.name] = el.value; }
    else out[el.name] = el.value;
  }
  return out;
}

/** Fill form fields from an object and mark them so the user can see what was auto-filled. */
export function fillForm(form, values) {
  const filled = [];
  for (const [k, v] of Object.entries(values)) {
    const els = form.querySelectorAll(`[name="${k}"]`);
    if (!els.length) continue;
    for (const el of els) {
      if (el.type === "checkbox") el.checked = Boolean(v);
      else if (el.type === "radio") el.checked = el.value === String(v);
      else { el.value = v; el.classList.add("autofilled"); }
    }
    filled.push(k);
  }
  return filled;
}

export function money(n) {
  return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function download(filename, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  a.download = filename;
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
