// Oratio Desk: Taschenrechner (Standard, Wissenschaftlich, Umrechnen) als Widget und als App – nach dem Rechner im Control Center.
(function(){
"use strict";
const U = Desk.u, $ = U.$, $$ = U.$$, T = U.T, esc = U.esc, FR = U.FR;
const C = () => { const D = Desk.data(); if (!D.calc) D.calc = { mode: "std", deg: true, mem: 0, expr: "", res: "0", done: false, second: false, hist: [], conv: { cat: "Länge", from: "km", to: "mi", val: "1" } }; return D.calc; };

/* ---------- Rechenkern ---------- */
const FUNCS = { "sin⁻¹(": "asin", "cos⁻¹(": "acos", "tan⁻¹(": "atan", "sinh⁻¹(": "asinh", "cosh⁻¹(": "acosh", "tanh⁻¹(": "atanh", "sinh(": "sinh", "cosh(": "cosh", "tanh(": "tanh", "sin(": "sin", "cos(": "cos", "tan(": "tan", "log₂(": "log2", "log(": "log", "ln(": "ln", "√(": "sqrt", "∛(": "cbrt", "exp(": "exp", "pow10(": "pow10", "pow2(": "pow2" };
const FN_KEYS = Object.keys(FUNCS).sort((a, b) => b.length - a.length);
function gamma(x){ if (x < 0.5) return Math.PI / (Math.sin(Math.PI * x) * gamma(1 - x)); x -= 1; const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]; let a = c[0]; const t = x + g + .5; for (let i = 1; i < g + 2; i++) a += c[i] / (x + i); return Math.sqrt(2 * Math.PI) * Math.pow(t, x + .5) * Math.exp(-t) * a; }
function fact(n){ if (n < 0 && Number.isInteger(n)) throw 0; if (Number.isInteger(n)) { if (n > 170) return Infinity; let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; } return gamma(n + 1); }
function tokens(s){ const out = []; let i = 0;
  while (i < s.length) { const r = s.slice(i); let m;
    if (/^\s/.test(r)) { i++; continue; }
    if ((m = /^(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:E[+-]?\d+)?/.exec(r))) { out.push({ n: parseFloat(m[0].replace(",", ".")) }); i += m[0].length; continue; }
    const f = FN_KEYS.find(k => r.startsWith(k)); if (f) { out.push({ f: FUNCS[f] }); i += f.length; continue; }
    if (r[0] === "π") { out.push({ n: Math.PI }); i++; continue; } if (r[0] === "e") { out.push({ n: Math.E }); i++; continue; }
    if (r.startsWith("ʸ√")) { out.push({ o: "root" }); i += 2; continue; }
    if ("+−-×*÷/^()!%²³".includes(r[0])) { out.push({ o: { "−": "-", "×": "*", "÷": "/" }[r[0]] || r[0] }); i++; continue; }
    throw 0; }
  return out; }
function evaluate(s, deg){
  const tk = tokens(s); let p = 0; const peek = () => tk[p], isO = o => tk[p] && tk[p].o === o;
  const k = deg ? Math.PI / 180 : 1, rnd = v => Math.abs(v) < 1e-14 ? 0 : v;
  const F = { sin: x => rnd(Math.sin(x * k)), cos: x => rnd(Math.cos(x * k)), tan: x => { const c = Math.cos(x * k); if (Math.abs(c) < 1e-14) throw 0; return rnd(Math.tan(x * k)); }, asin: x => Math.asin(x) / k, acos: x => Math.acos(x) / k, atan: x => Math.atan(x) / k, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, asinh: Math.asinh, acosh: Math.acosh, atanh: Math.atanh, log: Math.log10, log2: Math.log2, ln: Math.log, sqrt: x => { if (x < 0) throw 0; return Math.sqrt(x); }, cbrt: Math.cbrt, exp: Math.exp, pow10: x => Math.pow(10, x), pow2: x => Math.pow(2, x) };
  function prim(){ const t = tk[p++]; if (!t) throw 0; if (t.n !== undefined) return t.n; if (t.f) { const v = expr().v; if (isO(")")) p++; return F[t.f](v); } if (t.o === "(") { const v = expr().v; if (isO(")")) p++; return v; } throw 0; }
  function post(){ let v = prim(), pc = false; while (tk[p] && ["!", "%", "²", "³"].includes(tk[p].o)) { const o = tk[p++].o; pc = false; if (o === "!") v = fact(v); else if (o === "%") { v /= 100; pc = true; } else if (o === "²") v = v * v; else v = v * v * v; } return { v: v, pc: pc }; }
  function pw(){ const b = post(); if (isO("^")) { p++; return { v: Math.pow(b.v, un().v), pc: false }; } if (isO("root")) { p++; const y = un().v; if (y === 0) throw 0; return { v: b.v < 0 && y % 2 !== 0 ? -Math.pow(-b.v, 1 / y) : Math.pow(b.v, 1 / y), pc: false }; } return b; }
  function un(){ if (isO("-")) { p++; const r = un(); return { v: -r.v, pc: false }; } if (isO("+")) { p++; return un(); } return pw(); }
  function term(){ let l = un(); while (isO("*") || isO("/")) { const o = tk[p++].o, r = un(); if (o === "*") l = { v: l.v * r.v, pc: false }; else { if (r.v === 0) throw 1; l = { v: l.v / r.v, pc: false }; } } return l; }
  function expr(){ let l = term(); while (isO("+") || isO("-")) { const o = tk[p++].o, r = term(), rv = r.pc ? l.v * r.v : r.v; l = { v: o === "+" ? l.v + rv : l.v - rv, pc: false }; } return l; }
  const r = expr(); if (p < tk.length) { if (isO(")")) { while (isO(")")) p++; } if (p < tk.length) throw 0; } if (!isFinite(r.v) || isNaN(r.v)) throw 1; return r.v; }
function fmt(v){ if (!isFinite(v)) return T("Fehler", "Erreur"); if (v !== 0 && (Math.abs(v) >= 1e15 || Math.abs(v) < 1e-9)) return v.toExponential(8).replace(/\.?0+e/, "e").replace(".", ","); return String(parseFloat(v.toPrecision(12))).replace(".", ","); }

/* ---------- Umrechnen ---------- */
const CAT = { "Länge": ["Länge", "Longueur", { km: 1000, m: 1, cm: .01, mm: .001, mi: 1609.344, yd: .9144, ft: .3048, in: .0254, sm: 1852 }], "Gewicht": ["Gewicht", "Poids", { t: 1000, kg: 1, g: .001, mg: 1e-6, lb: .45359237, oz: .028349523 }], "Temperatur": ["Temperatur", "Température", null], "Fläche": ["Fläche", "Surface", { "km²": 1e6, ha: 1e4, "m²": 1, "cm²": 1e-4, acre: 4046.8564, "ft²": .09290304 }], "Volumen": ["Volumen", "Volume", { "m³": 1000, L: 1, mL: .001, gal: 3.785411784, qt: .946352946, cup: .2365882365, "fl oz": .0295735296 }], "Tempo": ["Geschwindigkeit", "Vitesse", { "m/s": 1, "km/h": 1 / 3.6, mph: .44704, kn: .514444 }], "Zeit": ["Zeit", "Temps", { Wo: 604800, Tag: 86400, Std: 3600, Min: 60, Sek: 1, ms: .001 }], "Daten": ["Daten", "Données", { TB: 1e12, GB: 1e9, MB: 1e6, kB: 1e3, B: 1, TiB: 2 ** 40, GiB: 2 ** 30, MiB: 2 ** 20 }], "Druck": ["Druck", "Pression", { bar: 1e5, Pa: 1, hPa: 100, kPa: 1000, psi: 6894.757, atm: 101325 }], "Energie": ["Energie", "Énergie", { kWh: 3.6e6, J: 1, kJ: 1000, cal: 4.184, kcal: 4184 }], "Leistung": ["Leistung", "Puissance", { kW: 1000, W: 1, PS: 735.49875, hp: 745.69987 }] };
const TEMP = { "°C": [x => x, x => x], "°F": [x => (x - 32) * 5 / 9, x => x * 9 / 5 + 32], K: [x => x - 273.15, x => x + 273.15] };
const cat = k => CAT[k] || CAT["Länge"], units = k => k === "Temperatur" ? Object.keys(TEMP) : Object.keys(cat(k)[2]);
function convert(v, cname, f, t){ if (cname === "Temperatur") return TEMP[t][1](TEMP[f][0](v)); const u = cat(cname)[2]; return v * u[f] / u[t]; }

/* ---------- Tasten ---------- */
const STD = [["C", "⌫", "%", "÷"], ["7", "8", "9", "×"], ["4", "5", "6", "−"], ["1", "2", "3", "+"], ["±", "0", ",", "="]];
const SCI1 = [["(", ")", "mc", "m+", "m-", "mr"], ["2nd", "x²", "x³", "xʸ", "eˣ", "10ˣ"], ["1/x", "√", "∛", "ʸ√", "ln", "log"], ["x!", "sin", "cos", "tan", "e", "EE"], ["Rand", "sinh", "cosh", "tanh", "π", "DEG"]];
const SEC = { sin: "sin⁻¹", cos: "cos⁻¹", tan: "tan⁻¹", sinh: "sinh⁻¹", cosh: "cosh⁻¹", tanh: "tanh⁻¹", "eˣ": "2ˣ", "10ˣ": "yˣ", log: "log₂" };
const FK = { "sin": "sin(", "cos": "cos(", "tan": "tan(", "sin⁻¹": "sin⁻¹(", "cos⁻¹": "cos⁻¹(", "tan⁻¹": "tan⁻¹(", "sinh": "sinh(", "cosh": "cosh(", "tanh": "tanh(", "sinh⁻¹": "sinh⁻¹(", "cosh⁻¹": "cosh⁻¹(", "tanh⁻¹": "tanh⁻¹(", "√": "√(", "∛": "∛(", "ln": "ln(", "log": "log(", "log₂": "log₂(", "eˣ": "exp(", "10ˣ": "pow10(", "2ˣ": "pow2(" };
const OPS = "÷×−+";
const lastNum = s => /(\d+(?:,\d*)?(?:E[+-]?\d+)?|,\d+)$/.exec(s);
function press(c, k){
  const S = C(), isOp = x => OPS.includes(x);
  if (k === "2nd") { S.second = !S.second; return; } if (k === "DEG") { S.deg = !S.deg; return; }
  const cur = () => { try { return evaluate(S.expr, S.deg); } catch(e){ return NaN; } };
  if (k === "mc") { S.mem = 0; return; } if (k === "m+") { const v = S.expr ? cur() : parseFloat(S.res.replace(",", ".")); if (isFinite(v)) S.mem += v; return; } if (k === "m-") { const v = S.expr ? cur() : parseFloat(S.res.replace(",", ".")); if (isFinite(v)) S.mem -= v; return; }
  if (k === "mr") k = fmt(S.mem);
  if (k === "C") { S.expr = ""; S.res = "0"; S.done = false; return; }
  if (k === "=") { if (!S.expr) return; try { const v = evaluate(S.expr, S.deg), r = fmt(v); S.hist.unshift({ e: S.expr, r: r }); S.hist = S.hist.slice(0, 30); S.expr = r; S.res = r; S.done = true; } catch(e){ S.res = e === 1 ? T("Fehler", "Erreur") : T("Fehler", "Erreur"); S.done = true; S.expr = ""; } return; }
  if (S.res === T("Fehler", "Erreur")) { S.res = "0"; }
  if (k === "⌫") { const f = FN_KEYS.find(x => S.expr.endsWith(x)); S.expr = f ? S.expr.slice(0, -f.length) : S.expr.slice(0, -1); S.done = false; return; }
  if (k === "±") { const m = lastNum(S.expr); if (m) { const b = S.expr.slice(0, -m[0].length); S.expr = b.endsWith("(−") ? b.slice(0, -2) + m[0] : b + "(−" + m[0]; } else if (S.expr.endsWith("(−")) S.expr = S.expr.slice(0, -2); return; }
  const digit = /^[0-9,]$/.test(k), cons = ["π", "e", "Rand"].includes(k);
  let add = k;
  if (k === "Rand") add = fmt(Math.random()); if (k === "EE") add = "E"; if (k === "x²") add = "²"; if (k === "x³") add = "³"; if (k === "xʸ" || k === "yˣ") add = "^"; if (k === "x!") add = "!"; if (k === "ʸ√") add = "ʸ√";
  if (k === "1/x") { const m = lastNum(S.expr); if (m) S.expr = S.expr.slice(0, -m[0].length) + "(1÷" + m[0] + ")"; else if (S.done) S.expr = "(1÷" + S.expr + ")"; return; }
  if (FK[k]) add = FK[k];
  if (S.done) { if (isOp(k) || "²³!^%ʸ√".includes(add[0]) && !FK[k]) { S.done = false; } else { S.expr = ""; S.done = false; } }
  if (isOp(k)) { if (!S.expr) { if (k === "−") { S.expr = "−"; return; } S.expr = S.res === "0" ? "0" : S.res; } if (isOp(S.expr.slice(-1))) S.expr = S.expr.slice(0, -1); S.expr += k; return; }
  if (digit && k === "," && /,\d*$/.test(lastNum(S.expr) ? lastNum(S.expr)[0] : "")) return;
  if ((digit || cons || FK[k] || k === "(") && /[\d)πe²³!%]$/.test(S.expr) && !(digit && /\d|,/.test(S.expr.slice(-1)) )) add = "×" + add;      // 2(3) = 2×3
  S.expr += add;
}
function resText(){ const S = C(); if (S.done) return S.res; const m = lastNum(S.expr); return S.expr ? (m ? m[0] : S.res) : S.res; }

/* ---------- Ansicht ---------- */
function calcView(el, mode, big, c){
  const S = C(); const sci = mode === "sci"; const keyHtml = (k, cl) => { let lab = k; if (S.second && SEC[k]) lab = SEC[k]; if (k === "DEG") lab = S.deg ? "DEG" : "RAD"; if (k === "2nd") cl += S.second ? " on" : ""; if (k === "C" && S.expr) lab = "C"; return '<button type="button" class="ck ' + cl + '" data-k="' + esc(S.second && SEC[k] ? SEC[k] : k) + '"' + (k === "m+" || k === "mr" || k === "m-" || k === "mc" ? ' title="' + esc(T("Speicher", "Mémoire")) + '"' : "") + '>' + esc(lab) + '</button>'; };
  el.innerHTML = '<div class="cv' + (sci ? " sci" : "") + (big ? " big" : "") + '"><div class="cdsp"><small class="ce"></small><b class="cr"></b>' + (S.mem ? '<i class="cmem">M</i>' : '') + '</div><div class="ckg">' + (sci ? '<div class="ck6">' + SCI1.map(r => r.map(k => keyHtml(k, ["(", ")", "mc", "m+", "m-", "mr", "2nd", "DEG"].includes(k) ? "f2" : "f")).join("")).join("") + '</div>' : "") + '<div class="ck4">' + STD.map(r => r.map(k => keyHtml(k, /[÷×−+=]/.test(k) ? "op" : /[C⌫%±]/.test(k) ? "f2" : "d")).join("")).join("") + '</div></div></div>';
  const upd = () => { $(".ce", el).textContent = S.done ? "" : S.expr; $(".cr", el).textContent = resText(); const cr = $(".cr", el), L = resText().length; cr.style.fontSize = L > 14 ? "1.2em" : L > 11 ? "1.5em" : L > 8 ? "1.9em" : ""; };
  upd();
  el.onclick = e => { const b = e.target.closest("[data-k]"); if (!b) return; press(c, b.dataset.k); Desk.later(); if (c.rerender) c.rerender(); else calcView(el, mode, big, c); };
}
Desk.reg("calc", { name: () => T("Rechner", "Calculatrice"), sym: "🧮", col: "#ff9f0a", order: 10, sizes: [[2, 2], [4, 2], [4, 3]], info: () => T("Standard und wissenschaftlich – Tasten direkt im Widget.", "Standard et scientifique – touches directement dans le widget."),
  tile(el, c){ const sci = c.size[0] === 4; calcView(el, sci ? "sci" : "std", false, c); },
  app: { title: () => T("Rechner", "Calculatrice"), mount(el, c){ const S = C();
    const draw = () => { el.innerHTML = '<div class="tabs"><button class="btn sm" data-md="std">' + esc(T("Standard", "Standard")) + '</button><button class="btn sm" data-md="sci">' + esc(T("Wissenschaftlich", "Scientifique")) + '</button><button class="btn sm" data-md="conv">' + esc(T("Umrechnen", "Conversion")) + '</button></div><div class="cbody"></div>'; $$("[data-md]", el).forEach(b => b.classList.toggle("on", b.dataset.md === S.mode)); const B = $(".cbody", el);
      if (S.mode === "conv") convView(B); else { const w = document.createElement("div"); w.className = "cw"; B.appendChild(w); c.rerender = () => calcView(w, S.mode, true, c); calcView(w, S.mode, true, c); B.insertAdjacentHTML("beforeend", '<div class="hist"><h3>' + esc(T("Verlauf", "Historique")) + '</h3><div class="hl"></div></div>'); const hl = () => { $(".hl", B).innerHTML = S.hist.length ? S.hist.map((h, i) => '<button class="hr2" data-h="' + i + '"><span>' + esc(h.e) + '</span><b>= ' + esc(h.r) + '</b></button>').join("") + '<button class="btn sm" data-hc>' + esc(T("Verlauf löschen", "Effacer l’historique")) + '</button>' : '<p class="leer" style="text-align:left">' + esc(T("Noch keine Rechnungen.", "Pas encore de calculs.")) + '</p>'; }; hl(); const rr = c.rerender; c.rerender = () => { rr(); hl(); };
        B.addEventListener("click", e => { const h = e.target.closest("[data-h]"), cl = e.target.closest("[data-hc]"); if (h) { S.expr = S.hist[+h.dataset.h].r; S.done = true; S.res = S.expr; Desk.later(); c.rerender(); } if (cl) { S.hist = []; Desk.save(); c.rerender(); } }); } };
    el.onclick = e => { const m = e.target.closest("[data-md]"); if (m) { S.mode = m.dataset.md; Desk.save(); draw(); } };
    const kd = e => { if (!el.isConnected) { document.removeEventListener("keydown", kd); return; } if (S.mode === "conv" || e.target.closest("input,textarea,select")) return; const k = e.key; let m = null;
      if (/^[0-9]$/.test(k)) m = k; else if (k === "," || k === ".") m = ","; else if (k === "+") m = "+"; else if (k === "-") m = "−"; else if (k === "*") m = "×"; else if (k === "/") { m = "÷"; e.preventDefault(); } else if (k === "(" || k === ")") m = k; else if (k === "%") m = "%"; else if (k === "^") m = "^"; else if (k === "!") m = "!"; else if (k === "Enter" || k === "=") { m = "="; e.preventDefault(); } else if (k === "Backspace") m = "⌫"; else if (k === "Delete") m = "C";
      if (m) { press(c, m); Desk.later(); if (c.rerender) c.rerender(); } };
    document.addEventListener("keydown", kd); draw(); } } });
function convView(B){ const S = C(), cv = S.conv; if (!CAT[cv.cat]) cv.cat = "Länge"; const us = units(cv.cat); if (!us.includes(cv.from)) cv.from = us[0]; if (!us.includes(cv.to)) cv.to = us[1] || us[0];
  B.innerHTML = '<div class="row cats">' + Object.keys(CAT).map(k => '<button class="btn sm' + (k === cv.cat ? " on" : "") + '" data-c="' + k + '">' + esc(cat(k)[FR() ? 1 : 0]) + '</button>').join("") + '</div><div class="cvr"><div><input class="in cvi" id="cV" inputmode="decimal" value="' + esc(cv.val) + '"><select class="in" id="cF">' + us.map(u => '<option' + (u === cv.from ? " selected" : "") + '>' + esc(u) + '</option>').join("") + '</select></div><button class="btn" id="cX" aria-label="' + esc(T("Tauschen", "Inverser")) + '">⇅</button><div><output class="in cvi" id="cO"></output><select class="in" id="cT">' + us.map(u => '<option' + (u === cv.to ? " selected" : "") + '>' + esc(u) + '</option>').join("") + '</select></div></div><div class="cvall"></div>';
  const z = () => { const v = parseFloat(String(cv.val).replace(",", ".")); $("#cO", B).textContent = isFinite(v) ? fmt(convert(v, cv.cat, cv.from, cv.to)) : "–"; $(".cvall", B).innerHTML = isFinite(v) ? '<table class="utab">' + units(cv.cat).filter(u => u !== cv.from).map(u => '<tr' + (u === cv.to ? ' class="me"' : "") + '><td>' + esc(u) + '</td><td>' + esc(fmt(convert(v, cv.cat, cv.from, u))) + '</td></tr>').join("") + '</table>' : ""; };
  B.addEventListener("click", e => { const k = e.target.closest("[data-c]"); if (k) { cv.cat = k.dataset.c; const u = units(cv.cat); cv.from = u[0]; cv.to = u[1] || u[0]; Desk.save(); convView(B); } if (e.target.closest("#cX")) { const t = cv.from; cv.from = cv.to; cv.to = t; Desk.save(); convView(B); } });
  $("#cV", B).oninput = e => { cv.val = e.target.value; Desk.later(); z(); }; $("#cF", B).onchange = e => { cv.from = e.target.value; Desk.save(); z(); }; $("#cT", B).onchange = e => { cv.to = e.target.value; Desk.save(); z(); }; z(); if (window.WZ && WZ.selects) WZ.selects(); }
})();
