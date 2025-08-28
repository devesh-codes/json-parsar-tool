import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  beautifyJson,
  copyToClipboard,
  downloadFile,
  fetchJsonFromUrl,
  minifyJson,
  validateJson,
} from "./utils/jsonTool";

const EXAMPLES = [
  { label: "Piksbazaar API:", url: "https://api.piksbazaar.com/publisher/api/v1/product/getProducts" },
  { label: "RandomUser: 1 user", url: "https://randomuser.me/api/?results=1" },
  { label: "GitHub API: React releases", url: "https://api.github.com/repos/facebook/react/releases?per_page=1" },
];

export default function App() {
  const [input, setInput] = useState('{\n  "hello": "world",\n  "numbers": [1,2,3],\n  "nested": {"ok": true}\n}');
  const [output, setOutput] = useState("");
  const [url, setUrl] = useState(EXAMPLES[0].url);
  const [filename, setFilename] = useState("data.json");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();

  const status = useMemo(() => validateJson(input), [input]);

  useEffect(() => {
    const pretty = beautifyJson(input);
    if (pretty.ok) setOutput(pretty.formatted);
  }, []);

  function handleBeautify() {
    const res = beautifyJson(input);
    if (res.ok) {
      setInput(res.formatted);
      setOutput(res.formatted);
    } else alert(`Invalid JSON:\n\n${res.error}`);
  }

  function handleMinify() {
    const res = minifyJson(input);
    if (res.ok) setOutput(res.formatted);
    else alert(`Invalid JSON:\n\n${res.error}`);
  }

  function handleDownload() {
    if (!output.trim()) return;
    downloadFile(filename || "data.json", output);
  }

  async function handleCopy() {
    if (!output.trim()) return;
    await copyToClipboard(output);
  }

  async function handleFetchUrl() {
    try {
      setBusy(true);
      const jsonText = await fetchJsonFromUrl(url);
      setInput(jsonText);
      setOutput(jsonText);
    } catch (e) {
      alert(`Fetch failed:\n\n${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name.endsWith(".json") ? file.name : `${file.name}.json`);
    const text = await file.text();
    setInput(text);
    const res = beautifyJson(text);
    setOutput(res.ok ? res.formatted : text);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/60 backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-xl">
          <span className="px-2 py-1 rounded-lg bg-indigo-500 text-white">JSON</span>
          Parsar <span className="text-slate-400 text-sm">Beautify • Validate • Download</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleBeautify} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium">Beautify</button>
          <button onClick={handleMinify} className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-sm font-medium">Minify</button>
          <button onClick={handleCopy} disabled={!output.trim()} className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium disabled:opacity-50">Copy</button>
          <button onClick={handleDownload} disabled={!output.trim()} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium disabled:opacity-50">Download</button>
        </div>
      </header>

      {/* Main */}
      <main className="grid md:grid-cols-2 gap-4 p-4 flex-1 overflow-hidden">
        {/* Input Panel */}
        <section className="flex flex-col bg-slate-800/70 rounded-xl border border-slate-700 p-3 overflow-hidden">
          <h3 className="text-slate-400 text-sm mb-2 font-medium">Input JSON</h3>
          <textarea
            className="flex-1 w-full resize-none bg-slate-900/70 rounded-lg border border-slate-700 p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
            <div>
              {status.ok ? (
                <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400">Valid JSON</span>
              ) : (
                <span className="px-2 py-1 rounded-md bg-rose-500/20 text-rose-400">Invalid JSON</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
              />
              <input ref={fileRef} type="file" accept=".json,application/json,.txt" onChange={handleFileChange} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="px-2 py-1 rounded-md bg-slate-700 hover:bg-slate-600">Upload</button>
            </div>
          </div>
        </section>

        {/* Output Panel */}
        <section className="flex flex-col bg-slate-800/70 rounded-xl border border-slate-700 p-3 overflow-hidden">
          <h3 className="text-slate-400 text-sm mb-2 font-medium">Output</h3>
          <pre className="flex-1 overflow-auto bg-slate-900/70 rounded-lg border border-slate-700 p-3 font-mono text-sm whitespace-pre-wrap">
            {output}
          </pre>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                onClick={handleFetchUrl}
                disabled={busy}
                className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm"
              >
                {busy ? "Fetching..." : "Fetch"}
              </button>
            </div>
            <select
              className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-slate-200 text-xs"
              onChange={(e) => setUrl(e.target.value)}
              value={url}
            >
              {EXAMPLES.map((e) => (
                <option key={e.url} value={e.url}>{e.label}</option>
              ))}
            </select>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-3 border-t border-slate-700 bg-slate-800/60 text-slate-400 text-xs flex justify-between">
        <span>Free API examples: JSONPlaceholder • RandomUser • GitHub</span>
        <span className="space-x-2">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-700">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-slate-700">B</kbd>
          <span>Beautify</span>
        </span>
      </footer>
    </div>
  );
}
