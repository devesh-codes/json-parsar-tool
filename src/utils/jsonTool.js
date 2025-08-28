export function validateJson(text) {
  try {
    const parsed = JSON.parse(text);
    return { ok: true, parsed };
  } catch (e) {
    // Try to find error position if available
    const message = e?.message || "Invalid JSON";
    return { ok: false, error: message };
  }
}

export function beautifyJson(text, spacing = 2) {
  const { ok, parsed, error } = validateJson(text);
  if (!ok) return { ok, error };
  return { ok: true, formatted: JSON.stringify(parsed, null, spacing) };
}

export function minifyJson(text) {
  const { ok, parsed, error } = validateJson(text);
  if (!ok) return { ok, error };
  return { ok: true, formatted: JSON.stringify(parsed) };
}

export async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
}

export function downloadFile(filename, text) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename || "data.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function fetchJsonFromUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
  const data = await res.json();
  return JSON.stringify(data, null, 2);
}
