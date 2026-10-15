"use strict";
const $ = (id) => document.getElementById(id);

function sortKeys(v) {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]));
  return v;
}

/** Line and column of the error, worked out from the position in V8's message. */
function where(text, err) {
  const m = /position (\d+)/.exec(err.message);
  if (!m) return "";
  const pos = Number(m[1]);
  const before = text.slice(0, pos).split("\n");
  return ` (line ${before.length}, column ${before.at(-1).length + 1})`;
}

function run(minify) {
  const text = $("input").value;
  if (!text.trim()) { $("output").value = ""; $("status").textContent = ""; return; }
  try {
    let v = JSON.parse(text);
    if ($("sort").checked) v = sortKeys(v);
    const indent = $("indent").value === "tab" ? "\t" : Number($("indent").value);
    $("output").value = minify ? JSON.stringify(v) : JSON.stringify(v, null, indent);
    $("status").className = "okmsg";
    $("status").textContent = `Valid JSON · ${$("output").value.length.toLocaleString()} characters`;
  } catch (err) {
    $("status").className = "err";
    $("status").textContent = `Not valid JSON: ${err.message.replace(/^JSON\.parse: /, "")}${where(text, err)}`;
  }
}

$("format").addEventListener("click", () => run(false));
$("minify").addEventListener("click", () => run(true));
$("sort").addEventListener("change", () => run(false));
$("indent").addEventListener("change", () => run(false));
$("copy").addEventListener("click", async () => {
  const t = $("output").value;
  try { await navigator.clipboard.writeText(t); }
  catch { $("output").select(); document.execCommand("copy"); }
  $("status").className = "okmsg";
  $("status").textContent = "Copied.";
});
run(false);
