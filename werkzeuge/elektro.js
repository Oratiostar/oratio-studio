// Elektronik-Labor: Farbcode, Ohm, LED, Teiler, Normwerte, Filter, 555, Logik, Pi-Pinout.
// Alles läuft im Browser. Es wird nichts hochgeladen, gesendet oder gespeichert.
(function(){
"use strict";
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const FR = () => WZ.lang === "fr";
const T = (de, fr) => FR() ? fr : de;
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const SAFE = () => '<p class="safe">🔒 ' + T("Alles wird direkt im Browser gerechnet. Nichts wird gesendet oder gespeichert.", "Tout est calculé dans le navigateur. Rien n’est envoyé ni enregistré.") + '</p>';
const loc = () => FR() ? "fr-FR" : "de-DE";

/* ---------- SI-Werte lesen und schreiben ---------- */
const PRE = { p: 1e-12, n: 1e-9, u: 1e-6, "µ": 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 };
function parseSI(s){
  s = String(s == null ? "" : s).trim().replace(/\s+/g, "").replace(/,/g, ".");
  if (!s) return NaN;
  s = s.replace(/(ohm|Ω|Hz|V|A|W|F|H|s)$/i, "");
  let m = /^([+-]?\d+)([pnuµmkKMGR])(\d+)$/.exec(s);                     // 4k7, 2u2, 4R7
  if (m) return parseFloat(m[1] + "." + m[3]) * (m[2] === "R" ? 1 : PRE[m[2]]);
  m = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)([pnuµmkKMG]?)$/i.exec(s);
  if (!m) return NaN;
  const pf = m[2];
  return parseFloat(m[1]) * (pf ? (PRE[pf] !== undefined ? PRE[pf] : PRE[pf.toLowerCase()] || 1) : 1);
}
function fmtSI(v, unit, dig){
  if (!isFinite(v)) return "–";
  if (v === 0) return "0 " + (unit || "");
  const L = [[1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"]], a = Math.abs(v);
  let e = L[L.length - 1];
  if (unit === "Ω" && a >= 0.1 && a < 1) return v.toLocaleString(loc(), { maximumSignificantDigits: dig || 4 }) + " Ω";
  for (const x of L) if (a >= x[0] * 0.9995) { e = x; break; }
  return (v / e[0]).toLocaleString(loc(), { maximumSignificantDigits: dig || 4 }) + " " + e[1] + (unit || "");
}
const num = (v) => { const x = parseSI(v); return x; };

/* ---------- Normreihen ---------- */
const E = {
  E6: [1.0, 1.5, 2.2, 3.3, 4.7, 6.8],
  E12: [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2],
  E24: [1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1],
  E96: "100 102 105 107 110 113 115 118 121 124 127 130 133 137 140 143 147 150 154 158 162 165 169 174 178 182 187 191 196 200 205 210 215 221 226 232 237 243 249 255 261 267 274 280 287 294 301 309 316 324 332 340 348 357 365 374 383 392 402 412 422 432 442 453 464 475 487 499 511 523 536 549 562 576 590 604 619 634 649 665 681 698 715 732 750 768 787 806 825 845 866 887 909 931 953 976".split(" ").map(x => x / 100)
};
function nearestE(v, ser, mode){ // mode: "up" | "down" | "near"
  if (!(v > 0)) return NaN;
  const base = E[ser]; let best = NaN, bd = Infinity;
  const dec = Math.floor(Math.log10(v));
  for (let d = dec - 1; d <= dec + 1; d++) for (const m of base) {
    const c = m * Math.pow(10, d), cc = Math.round(c * 1e9) / 1e9;
    if (mode === "up" && cc < v * (1 - 1e-9)) continue;
    if (mode === "down" && cc > v * (1 + 1e-9)) continue;
    const dist = Math.abs(Math.log(cc / v));
    if (dist < bd) { bd = dist; best = cc; }
  }
  return best;
}
const serSel = (id, cur) => '<select class="in" id="' + id + '">' + ["E6", "E12", "E24", "E96"].map(s => '<option value="' + s + '"' + (s === (cur || "E24") ? " selected" : "") + '>' + s + '</option>').join("") + '</select>';

/* ---------- Mini-Zeichnen ---------- */
function farbe(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#888"; }
function plot(cv, W, H, f){ // f(ctx,w,h,c)
  const dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = W * dpr; cv.height = H * dpr; cv.style.width = "100%"; cv.style.maxWidth = W + "px"; cv.style.height = "auto";
  const c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
  f(c, W, H, { fg: farbe("--fg") || "#222", mu: farbe("--muted") || "#777", ln: farbe("--line") || "#ccc", ac: farbe("--acc") || "#2e86ff" });
}
function eingabe(host, id, label, ph, val, extra){ return '<label class="l" for="' + id + '">' + label + '</label><input class="in" id="' + id + '" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="' + (ph || "") + '" value="' + (val === undefined ? "" : esc(val)) + '"' + (extra || "") + '>'; }
function auf(host, ids, fn){ ids.forEach(i => { const e = $("#" + i, host); if (e) { e.addEventListener("input", fn); e.addEventListener("change", fn); } }); }

/* ====================================================================== 1. Widerstands-Farbcode */
const RC = [ // name, hex, ziffer, mult-exp, toleranz %, tk ppm
  ["schwarz|noir", "#111111", 0, 0, null, 250], ["braun|marron", "#7a4a21", 1, 1, 1, 100], ["rot|rouge", "#d62828", 2, 2, 2, 50], ["orange|orange", "#f77f00", 3, 3, null, 15],
  ["gelb|jaune", "#f4d21f", 4, 4, null, 25], ["grün|vert", "#2a9d3f", 5, 5, 0.5, 20], ["blau|bleu", "#1e63d6", 6, 6, 0.25, 10], ["violett|violet", "#8a3fd1", 7, 7, 0.1, 5],
  ["grau|gris", "#8d8d8d", 8, 8, 0.05, 1], ["weiß|blanc", "#f4f4f4", 9, 9, null, null], ["gold|or", "#c9a227", null, -1, 5, null], ["silber|argent", "#c0c0c0", null, -2, 10, null]
];
const cn = i => RC[i][0].split("|")[FR() ? 1 : 0];
function resTool(host){
  let modus = "f2w", nb = 4, sel = [1, 0, 2, 10, 0, 1];  // bandindex je Position
  host.innerHTML = SAFE() + '<div class="tabs t2" id="rTab"></div><div id="rBody"></div>';
  const digits = [0,1,2,3,4,5,6,7,8,9], mults = [0,1,2,3,4,5,6,7,8,9,10,11], tols = [1,2,5,6,7,8,10,11], tks = [1,2,3,4,6,7];
  function roles(){ return nb === 4 ? ["d","d","m","t"] : nb === 5 ? ["d","d","d","m","t"] : ["d","d","d","m","t","k"]; }
  function opts(r){ return r === "d" ? digits : r === "m" ? mults : r === "t" ? tols : tks; }
  function wert(){ const R = roles(); let d = 0, k = 0, m = 0, t = null, tk = null;
    R.forEach((r, i) => { const c = RC[sel[i]]; if (r === "d") { d = d * 10 + (c[2] == null ? 0 : c[2]); } else if (r === "m") m = c[3]; else if (r === "t") t = c[4]; else tk = c[5]; });
    return { v: d * Math.pow(10, m), tol: t, tk: tk }; }
  function svg(){ const R = roles(), n = R.length, W = 360, H = 90; let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="max-width:420px;width:100%;display:block;margin:6px auto" role="img" aria-label="' + T("Widerstand mit Farbringen", "Résistance avec anneaux de couleur") + '"><line x1="4" y1="45" x2="356" y2="45" stroke="#9aa2ad" stroke-width="5" stroke-linecap="round"/><rect x="62" y="16" width="236" height="58" rx="26" fill="#e3c9a0" stroke="#b79a69" stroke-width="2"/>';
    const gap = 200 / n; R.forEach((r, i) => { const x = 82 + i * gap + (r === "t" || r === "k" ? 14 : 0); s += '<rect x="' + x + '" y="16.5" width="14" height="57" fill="' + RC[sel[i]][1] + '" stroke="rgba(0,0,0,.35)" stroke-width=".8"/>'; });
    return s + '</svg>'; }
  function farbBand(i, r){ const lbl = r === "d" ? T("Ziffer", "Chiffre") : r === "m" ? T("Multiplikator", "Multiplicateur") : r === "t" ? T("Toleranz", "Tolérance") : T("Temperaturkoeffizient", "Coeff. de température");
    return '<div class="rc"><b>' + (i + 1) + '. ' + lbl + '</b><div class="sw">' + opts(r).map(ci => { const c = RC[ci]; let txt = r === "d" ? c[2] : r === "m" ? (c[3] >= 0 ? "×" + fmtSI(Math.pow(10, c[3])).replace(/ /g, "") : "×" + Math.pow(10, c[3])) : r === "t" ? "±" + c[4] + "%" : c[5] + "ppm";
      const light = ["#f4f4f4", "#f4d21f", "#c0c0c0", "#c9a227"].includes(c[1]);
      return '<button type="button" class="swc' + (sel[i] === ci ? " on" : "") + '" data-i="' + i + '" data-c="' + ci + '" title="' + esc(cn(ci)) + '" style="background:' + c[1] + ';color:' + (light ? "#111" : "#fff") + ';text-shadow:none"><span>' + esc(txt) + '</span></button>'; }).join("") + '</div></div>'; }
  function zeichne(){
    $("#rTab", host).innerHTML = [["f2w", T("Farbe → Wert", "Couleur → valeur")], ["w2f", T("Wert → Farbe", "Valeur → couleur")]].map(t => '<button class="btn' + (t[0] === modus ? " on" : "") + '" data-m="' + t[0] + '">' + t[1] + '</button>').join("");
    $$("#rTab button", host).forEach(b => b.onclick = () => { modus = b.dataset.m; zeichne(); });
    const nbar = '<div class="row" style="margin:4px 0 8px"><span class="muted">' + T("Ringe:", "Anneaux :") + '</span>' + [4, 5, 6].map(n => '<button class="btn sm' + (n === nb ? " on" : "") + '" data-n="' + n + '">' + n + '</button>').join("") + '</div>';
    const B = $("#rBody", host);
    if (modus === "f2w") {
      B.innerHTML = nbar + '<div id="rSvg"></div><div class="big" id="rOut"></div><div id="rBands"></div>';
      const upd = () => { $("#rSvg", host).innerHTML = svg(); const w = wert(); $("#rOut", host).innerHTML = fmtSI(w.v, "Ω") + (w.tol != null ? ' <small>± ' + w.tol + ' %  ·  ' + fmtSI(w.v * (1 - w.tol / 100), "Ω") + ' … ' + fmtSI(w.v * (1 + w.tol / 100), "Ω") + (w.tk ? '  ·  ' + w.tk + ' ppm/K' : '') + '</small>' : '');
        $("#rBands", host).innerHTML = roles().map((r, i) => farbBand(i, r)).join(""); $$(".swc", host).forEach(b => b.onclick = () => { sel[+b.dataset.i] = +b.dataset.c; upd(); }); };
      $$("[data-n]", host).forEach(b => b.onclick = () => { nb = +b.dataset.n; fixSel(); zeichne(); }); upd();
    } else {
      B.innerHTML = nbar + eingabe(host, "rV", T("Widerstandswert", "Valeur de la résistance"), "4k7  ·  330  ·  1M2", "4k7") + '<div class="row" style="margin-top:8px"><span class="muted">' + T("Toleranz:", "Tolérance :") + '</span><span id="rTol"></span></div><div id="rSvg"></div><div class="big" id="rOut"></div><p class="hint">' + T("Schreibweisen: 4700, 4,7k, 4k7, 2M2 (k = Kilo, M = Mega, R = Komma bei kleinen Werten, z. B. 4R7).", "Écritures : 4700, 4,7k, 4k7, 2M2 (k = kilo, M = méga, R = virgule, p. ex. 4R7).") + '</p>';
      let tolI = 10; // gold
      const tsel = () => { $("#rTol", host).innerHTML = [1, 2, 5, 10].map(p => { const ci = RC.findIndex(c => c[4] === p); return '<button class="btn sm' + (ci === tolI ? " on" : "") + '" data-t="' + ci + '">± ' + p + ' %</button>'; }).join(""); $$("[data-t]", host).forEach(b => b.onclick = () => { tolI = +b.dataset.t; tsel(); upd(); }); };
      const upd = () => { const v = num($("#rV", host).value), out = $("#rOut", host);
        if (!(v > 0)) { out.innerHTML = '<small>' + T("Bitte einen Wert eingeben.", "Saisis une valeur.") + '</small>'; $("#rSvg", host).innerHTML = ""; return; }
        const nd = nb === 4 ? 2 : 3; let exp = Math.floor(Math.log10(v)) - (nd - 1), mant = Math.round(v / Math.pow(10, exp));
        if (mant >= Math.pow(10, nd)) { mant = Math.round(mant / 10); exp++; }
        if (exp < -2) { mant = Math.round(v / 0.01); exp = -2; }
        const exact = Math.abs(mant * Math.pow(10, exp) - v) / v < 1e-9;
        if (exp > 9 || exp < -2 || mant >= Math.pow(10, nd) + 0.5 || mant < 0) { out.innerHTML = '<small>' + T("Dieser Wert ist als Farbcode nicht darstellbar.", "Cette valeur n’est pas représentable en code couleur.") + '</small>'; return; }
        const ds = String(mant).padStart(nd, "0").split("").map(Number), R = roles();
        const mi = RC.findIndex(c => c[3] === exp && (c[2] != null || exp < 0)), mIdx = exp >= 0 ? RC.findIndex(c => c[2] === exp) : RC.findIndex(c => c[3] === exp);
        let k = 0; R.forEach((r, i) => { if (r === "d") { const dv = ds[k++]; sel[i] = RC.findIndex(c => c[2] === dv); } else if (r === "m") sel[i] = mIdx; else if (r === "t") sel[i] = tolI; else sel[i] = 1; });
        $("#rSvg", host).innerHTML = svg();
        out.innerHTML = fmtSI(mant * Math.pow(10, exp), "Ω") + '<small>' + R.map((r, i) => cn(sel[i])).join(" – ") + (exact ? "" : "  ·  " + T("auf diesen Wert gerundet", "arrondi à cette valeur")) + '</small>'; };
      $$("[data-n]", host).forEach(b => b.onclick = () => { nb = +b.dataset.n; fixSel(); zeichne(); });
      tsel(); auf(host, ["rV"], upd); upd();
    }
  }
  function fixSel(){ const R = roles(); R.forEach((r, i) => { if (!opts(r).includes(sel[i])) sel[i] = r === "t" ? 10 : r === "k" ? 1 : 0; }); }
  zeichne();
}

/* ====================================================================== 2. Ohm & Leistung */
function ohmTool(host){
  const F = [["U", "V", T("Spannung U", "Tension U")], ["I", "A", T("Strom I", "Courant I")], ["R", "Ω", T("Widerstand R", "Résistance R")], ["P", "W", T("Leistung P", "Puissance P")]];
  host.innerHTML = SAFE() + '<p class="hint" style="margin-top:0">' + T("Trage zwei beliebige Werte ein – die anderen beiden werden berechnet. Mit Vorsilben: 4k7, 20m, 2u2.", "Saisis deux valeurs au choix – les deux autres sont calculées. Avec préfixes : 4k7, 20m, 2u2.") + '</p><div class="cols2" id="oF">' +
    F.map(f => '<div>' + eingabe(host, "o" + f[0], f[2] + " (" + f[1] + ")", "", "") + '</div>').join("") + '</div><div class="row" style="margin-top:10px"><button class="btn" id="oClr">' + T("Zurücksetzen", "Réinitialiser") + '</button></div><div id="oOut"></div>';
  let order = [];
  function rechne(){
    const given = order.slice(-2); if (given.length < 2) { $("#oOut", host).innerHTML = ""; return; }
    const v = {}; given.forEach(k => v[k] = num($("#o" + k, host).value));
    if (given.some(k => !isFinite(v[k]))) { $("#oOut", host).innerHTML = '<p class="warn">' + T("Eingabe nicht lesbar.", "Saisie illisible.") + '</p>'; return; }
    let U = v.U, I = v.I, R = v.R, P = v.P;
    const has = k => given.includes(k);
    if (has("U") && has("I")) { R = U / I; P = U * I; } else if (has("U") && has("R")) { I = U / R; P = U * U / R; } else if (has("U") && has("P")) { I = P / U; R = U * U / P; }
    else if (has("I") && has("R")) { U = I * R; P = I * I * R; } else if (has("I") && has("P")) { U = P / I; R = P / (I * I); } else { U = Math.sqrt(P * R); I = Math.sqrt(P / R); }
    const all = { U, I, R, P };
    F.forEach(f => { if (!given.includes(f[0])) { const e = $("#o" + f[0], host); e.value = isFinite(all[f[0]]) ? fmtSI(all[f[0]], "").trim().replace(".", FR() || true ? "," : ".") : ""; e.classList.add("calc"); } else $("#o" + f[0], host).classList.remove("calc"); });
    $("#oOut", host).innerHTML = isFinite(U + I + R + P) ? '<div class="stats">' + F.map(f => '<div><b>' + esc(fmtSI(all[f[0]], f[1])) + '</b><small>' + f[2].split(" ")[0] + '</small></div>').join("") + '</div><p class="hint">' + T("Formeln: U = R · I  ·  P = U · I  ·  P = I² · R  ·  P = U² / R", "Formules : U = R · I  ·  P = U · I  ·  P = I² · R  ·  P = U² / R") + '</p>' : '<p class="warn">' + T("Mit diesen Werten ist keine Berechnung möglich (Division durch 0?).", "Calcul impossible avec ces valeurs (division par 0 ?).") + '</p>';
  }
  F.forEach(f => { const e = $("#o" + f[0], host); e.addEventListener("input", () => { order = order.filter(k => k !== f[0]); if (e.value.trim()) order.push(f[0]); e.classList.remove("calc"); rechne(); }); });
  $("#oClr", host).onclick = () => { F.forEach(f => { const e = $("#o" + f[0], host); e.value = ""; e.classList.remove("calc"); }); order = []; $("#oOut", host).innerHTML = ""; };
}

/* ====================================================================== 3. LED-Vorwiderstand */
function ledTool(host){
  const COL = [["rot", "rouge", 2.0, "#ff2a2a"], ["orange", "orange", 2.0, "#ff8c1a"], ["gelb", "jaune", 2.1, "#ffd21a"], ["grün", "vert", 2.2, "#2ee86b"], ["blau", "bleu", 3.0, "#2e86ff"], ["weiß", "blanc", 3.0, "#e8e8f0"], ["IR", "IR", 1.3, "#a33"]];
  host.innerHTML = SAFE() + '<div class="cols2"><div><label class="l">' + T("LED-Farbe (typische Flussspannung)", "Couleur de la LED (tension directe typique)") + '</label><div class="sw" id="lCol">' +
    COL.map((c, i) => '<button type="button" class="swc" data-i="' + i + '" style="background:' + c[3] + ';color:#111;text-shadow:none;width:auto;padding:0 8px;height:36px;align-items:center"><span>' + (FR() ? c[1] : c[0]) + ' ' + c[2] + ' V</span></button>').join("") + '</div>' +
    eingabe(host, "lU", T("Versorgungsspannung (V)", "Tension d’alimentation (V)"), "", "5") + eingabe(host, "lF", T("Flussspannung der LED (V)", "Tension directe de la LED (V)"), "", "2") + eingabe(host, "lI", T("Gewünschter Strom (mA)", "Courant souhaité (mA)"), "", "15") + eingabe(host, "lN", T("Anzahl LEDs in Reihe", "Nombre de LED en série"), "", "1") +
    '<label class="l">' + T("Normreihe", "Série normalisée") + '</label>' + serSel("lS", "E12") + '</div><div><div id="lOut"></div></div></div>';
  function rech(){
    const U = num($("#lU", host).value), Uf = num($("#lF", host).value), I = num($("#lI", host).value) / 1000, n = Math.max(1, Math.round(num($("#lN", host).value) || 1)), ser = $("#lS", host).value, o = $("#lOut", host);
    if (![U, Uf, I].every(isFinite) || I <= 0) { o.innerHTML = ""; return; }
    const Ur = U - n * Uf;
    if (Ur <= 0) { o.innerHTML = '<p class="warn">' + T("Die Versorgung ist zu klein: Sie muss größer sein als " + (n * Uf).toLocaleString(loc()) + " V (Summe der Flussspannungen).", "L’alimentation est trop faible : elle doit dépasser " + (n * Uf).toLocaleString(loc()) + " V (somme des tensions directes).") + '</p>'; return; }
    const R = Ur / I, Rn = nearestE(R, ser, "up"), Ir = Ur / Rn, Pr = Ur * Ir;
    const W = [0.125, 0.25, 0.5, 1, 2, 5].find(w => w >= Pr * 2) || 5;
    o.innerHTML = '<div class="stats"><div><b>' + esc(fmtSI(R, "Ω")) + '</b><small>' + T("berechnet", "calculé") + '</small></div><div><b>' + esc(fmtSI(Rn, "Ω")) + '</b><small>' + T("nimm aus " + ser, "prends dans " + ser) + '</small></div><div><b>' + esc((Ir * 1000).toLocaleString(loc(), { maximumFractionDigits: 1 })) + ' mA</b><small>' + T("echter Strom", "courant réel") + '</small></div><div><b>' + esc(fmtSI(Pr, "W")) + '</b><small>' + T("Verlust im Widerstand", "perte dans la résistance") + '</small></div></div>' +
      '<p class="resbox">' + T("Nimm einen <b>" + esc(fmtSI(Rn, "Ω")) + "</b>-Widerstand mit mindestens <b>" + W.toLocaleString(loc()) + " W</b> (Sicherheit ×2).", "Prends une résistance de <b>" + esc(fmtSI(Rn, "Ω")) + "</b> d’au moins <b>" + W.toLocaleString(loc()) + " W</b> (marge ×2).") + '</p>' +
      (I > 0.03 ? '<p class="warn">' + T("Achtung: Über 20–30 mA vertragen die meisten Standard-LEDs nicht dauerhaft.", "Attention : au-delà de 20–30 mA, la plupart des LED standard souffrent.") + '</p>' : '') +
      '<p class="hint">' + T("Raspberry-Pi-Pins: höchstens ca. 16 mA pro Pin, 3,3 V Pegel. Für mehr Strom einen Transistor benutzen.", "Broches du Raspberry Pi : environ 16 mA max. par broche, niveau 3,3 V. Pour plus de courant, utilise un transistor.") + '</p>';
  }
  $$("#lCol button", host).forEach(b => b.onclick = () => { $("#lF", host).value = String(COL[+b.dataset.i][2]).replace(".", FR() ? "," : "."); rech(); });
  auf(host, ["lU", "lF", "lI", "lN", "lS"], rech); rech();
}

/* ====================================================================== 4. Spannungsteiler */
function teilerTool(host){
  let m = "ua";
  host.innerHTML = SAFE() + '<div class="tabs t2" id="tTab"></div><div class="cols2"><div id="tIn"></div><div><svg viewBox="0 0 120 190" style="max-width:170px;width:100%;display:block;margin:0 auto" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.4"><path d="M60 8V28"/><rect x="48" y="28" width="24" height="48" rx="3"/><path d="M60 76V112"/><rect x="48" y="112" width="24" height="48" rx="3"/><path d="M60 160V176M44 176h32M50 182h20"/><path d="M60 94H108" stroke-dasharray="4 3"/></g><g fill="currentColor" font-size="12" font-weight="700"><text x="64" y="14">Uin</text><text x="78" y="56">R1</text><text x="78" y="140">R2</text><text x="82" y="88">Uout</text></g></svg><div id="tOut"></div></div></div>';
  function maske(){
    $("#tTab", host).innerHTML = [["ua", T("Ausgang berechnen", "Calculer la sortie")], ["rb", T("Widerstände finden", "Trouver les résistances")]].map(t => '<button class="btn' + (t[0] === m ? " on" : "") + '" data-m="' + t[0] + '">' + t[1] + '</button>').join("");
    $$("#tTab button", host).forEach(b => b.onclick = () => { m = b.dataset.m; maske(); });
    $("#tIn", host).innerHTML = m === "ua"
      ? eingabe(host, "tU", "Uin (V)", "", "12") + eingabe(host, "tR1", "R1 (Ω)", "", "10k") + eingabe(host, "tR2", "R2 (Ω)", "", "4k7") + eingabe(host, "tRL", T("Last RL (Ω, optional)", "Charge RL (Ω, facultatif)"), T("leer = keine Last", "vide = sans charge"), "")
      : eingabe(host, "tU", "Uin (V)", "", "5") + eingabe(host, "tUo", T("Gewünschtes Uout (V)", "Uout souhaitée (V)"), "", "3,3") + eingabe(host, "tR2", T("R2 fest wählen (Ω)", "R2 fixée (Ω)"), "", "10k") + '<label class="l">' + T("Normreihe", "Série normalisée") + '</label>' + serSel("tS", "E24");
    auf(host, ["tU", "tR1", "tR2", "tRL", "tUo", "tS"], rech); rech();
  }
  function rech(){
    const o = $("#tOut", host), U = num($("#tU", host).value), R2 = num($("#tR2", host).value);
    if (m === "ua") {
      const R1 = num($("#tR1", host).value), RLs = $("#tRL", host).value.trim(), RL = RLs ? num(RLs) : Infinity;
      if (![U, R1, R2].every(x => isFinite(x) && x > 0) || (RLs && !(RL > 0))) { o.innerHTML = ""; return; }
      const R2e = isFinite(RL) ? R2 * RL / (R2 + RL) : R2, Uo = U * R2e / (R1 + R2e), Uo0 = U * R2 / (R1 + R2), Q = U / (R1 + R2);
      o.innerHTML = '<div class="stats"><div><b>' + esc(fmtSI(Uo, "V")) + '</b><small>Uout' + (isFinite(RL) ? " " + T("mit Last", "en charge") : "") + '</small></div>' + (isFinite(RL) ? '<div><b>' + esc(fmtSI(Uo0, "V")) + '</b><small>' + T("ohne Last", "à vide") + '</small></div>' : '') + '<div><b>' + esc(fmtSI(Q, "A")) + '</b><small>' + T("Querstrom", "courant de pont") + '</small></div><div><b>' + esc(fmtSI(U * Q, "W")) + '</b><small>' + T("Leistung gesamt", "puissance totale") + '</small></div></div>' + (isFinite(RL) && Uo < Uo0 * 0.95 ? '<p class="warn">' + T("Die Last zieht den Ausgang um mehr als 5 % herunter. R1/R2 kleiner wählen (RL sollte mindestens 10× größer als R2 sein).", "La charge fait chuter la sortie de plus de 5 %. Choisis R1/R2 plus petites (RL devrait valoir au moins 10× R2).") + '</p>' : '');
    } else {
      const Uo = num($("#tUo", host).value), ser = $("#tS", host).value;
      if (![U, Uo, R2].every(x => isFinite(x) && x > 0)) { o.innerHTML = ""; return; }
      if (Uo >= U) { o.innerHTML = '<p class="warn">' + T("Uout muss kleiner als Uin sein.", "Uout doit être inférieure à Uin.") + '</p>'; return; }
      const R1 = R2 * (U - Uo) / Uo, R1n = nearestE(R1, ser, "near"), Ua = U * R2 / (R1n + R2), f = Math.abs(Ua - Uo) / Uo * 100;
      o.innerHTML = '<div class="stats"><div><b>' + esc(fmtSI(R1, "Ω")) + '</b><small>R1 ' + T("ideal", "idéale") + '</small></div><div><b>' + esc(fmtSI(R1n, "Ω")) + '</b><small>R1 ' + ser + '</small></div><div><b>' + esc(fmtSI(Ua, "V")) + '</b><small>' + T("echtes Uout", "Uout réelle") + '</small></div><div><b>' + f.toLocaleString(loc(), { maximumFractionDigits: 2 }) + ' %</b><small>' + T("Abweichung", "écart") + '</small></div></div><p class="hint">' + T("Tipp: Für Pegelwandler 5 V → 3,3 V passen z. B. R1 = 1 kΩ und R2 = 2 kΩ.", "Astuce : pour passer de 5 V à 3,3 V, p. ex. R1 = 1 kΩ et R2 = 2 kΩ.") + '</p>';
    }
  }
  maske();
}

/* ====================================================================== 5. Normwerte bauen & Reihen/Parallel */
function kombiTool(host){
  host.innerHTML = SAFE() + '<div class="cols2"><div><h3 style="margin-top:0">' + T("Reihen- und Parallelschaltung", "Montage série et parallèle") + '</h3><label class="l" for="kL">' + T("Werte (durch Leerzeichen oder Zeilen getrennt)", "Valeurs (séparées par des espaces ou des lignes)") + '</label><textarea class="in" id="kL" rows="3">1k 2k2 470</textarea><div id="kOut"></div></div><div><h3 style="margin-top:0">' + T("Wunschwert aus Normwerten bauen", "Fabriquer une valeur à partir de la série") + '</h3>' + eingabe(host, "kT", T("Gewünschter Wert", "Valeur souhaitée"), "z. B. 3k1", "3k1") + '<label class="l">' + T("Normreihe", "Série normalisée") + '</label>' + serSel("kS", "E12") + '<div id="kRes"></div></div></div>';
  function a(){
    const w = $("#kL", host).value.split(/[\s;]+/).filter(Boolean).map(num), o = $("#kOut", host);
    if (w.length < 1 || w.some(x => !(x > 0) || !isFinite(x))) { o.innerHTML = w.length ? '<p class="warn">' + T("Mindestens ein Wert ist nicht lesbar.", "Au moins une valeur est illisible.") + '</p>' : ""; return; }
    const s = w.reduce((p, c) => p + c, 0), p = 1 / w.reduce((q, c) => q + 1 / c, 0);
    o.innerHTML = '<div class="stats"><div><b>' + esc(fmtSI(s)) + '</b><small>' + T("in Reihe (R, L) · parallel (C)", "série (R, L) · parallèle (C)") + '</small></div><div><b>' + esc(fmtSI(p)) + '</b><small>' + T("parallel (R, L) · in Reihe (C)", "parallèle (R, L) · série (C)") + '</small></div></div><p class="hint">' + T("Für Widerstände und Spulen gilt die linke Zahl in Reihe, die rechte parallel. Bei Kondensatoren ist es genau umgekehrt.", "Pour les résistances et les bobines, le premier nombre vaut pour la série, le second pour le parallèle. Pour les condensateurs, c’est l’inverse.") + '</p>';
  }
  function b(){
    const t = num($("#kT", host).value), ser = $("#kS", host).value, o = $("#kRes", host);
    if (!(t > 0)) { o.innerHTML = ""; return; }
    const base = []; const dec = Math.floor(Math.log10(t));
    for (let d = dec - 3; d <= dec + 3; d++) E[ser].forEach(m => base.push(Math.round(m * Math.pow(10, d) * 1e9) / 1e9));
    const res = [], single = nearestE(t, ser, "near"); res.push({ txt: fmtSI(single, "Ω"), v: single, n: 1 });
    for (let i = 0; i < base.length; i++) for (let j = i; j < base.length; j++) { const x = base[i], y = base[j]; const sv = x + y, pv = x * y / (x + y);
      if (Math.abs(sv - t) / t < 0.05) res.push({ txt: fmtSI(x, "Ω") + " + " + fmtSI(y, "Ω"), v: sv, n: 2 });
      if (Math.abs(pv - t) / t < 0.05) res.push({ txt: fmtSI(x, "Ω") + " ‖ " + fmtSI(y, "Ω"), v: pv, n: 2 }); }
    res.forEach(r => r.f = Math.abs(r.v - t) / t); res.sort((p, q) => p.f - q.f || p.n - q.n);
    const seen = new Set(), top = res.filter(r => !seen.has(r.txt) && seen.add(r.txt)).slice(0, 6);
    o.innerHTML = '<table class="utab">' + top.map(r => '<tr' + (r.f < 1e-4 ? ' class="me"' : "") + '><td>' + esc(r.txt) + '</td><td>= ' + esc(fmtSI(r.v, "Ω")) + '</td><td>' + (r.f < 1e-6 ? T("exakt", "exact") : (r.f * 100).toLocaleString(loc(), { maximumFractionDigits: 2 }) + " %") + '</td></tr>').join("") + '</table><p class="hint">+ = ' + T("in Reihe", "en série") + ' · ‖ = ' + T("parallel", "en parallèle") + '</p>';
  }
  auf(host, ["kL"], a); auf(host, ["kT", "kS"], b); a(); b();
}

/* ====================================================================== 6. Filter, Laden, Schwingkreis */
function filterTool(host){
  let m = "rc";
  host.innerHTML = SAFE() + '<div class="tabs" id="fTab"></div><div class="cols2"><div id="fIn"></div><div id="fOut"></div></div>';
  function maske(){
    $("#fTab", host).innerHTML = [["rc", T("RC-Filter (Bode)", "Filtre RC (Bode)")], ["lade", T("Kondensator laden", "Charge du condensateur")], ["lc", T("LC-Schwingkreis", "Circuit LC")]].map(t => '<button class="btn sm' + (t[0] === m ? " on" : "") + '" data-m="' + t[0] + '">' + t[1] + '</button>').join("");
    $$("#fTab button", host).forEach(b => b.onclick = () => { m = b.dataset.m; maske(); });
    $("#fIn", host).innerHTML = m === "lc" ? eingabe(host, "fL", T("Spule L (H)", "Bobine L (H)"), "", "10m") + eingabe(host, "fC", T("Kondensator C (F)", "Condensateur C (F)"), "", "100n")
      : eingabe(host, "fR", "R (Ω)", "", "10k") + eingabe(host, "fC", "C (F)", "", "100n") + (m === "rc" ? '<div class="row" style="margin-top:10px"><button class="btn sm on" data-p="tp">' + T("Tiefpass", "Passe-bas") + '</button><button class="btn sm" data-p="hp">' + T("Hochpass", "Passe-haut") + '</button></div>' : eingabe(host, "fUs", T("Spannung (V)", "Tension (V)"), "", "5"));
    $$("[data-p]", host).forEach(b => b.onclick = () => { $$("[data-p]", host).forEach(x => x.classList.toggle("on", x === b)); rech(); });
    auf(host, ["fR", "fC", "fL", "fUs"], rech); rech();
  }
  function rech(){
    const o = $("#fOut", host); o.innerHTML = "";
    const R = $("#fR", host) ? num($("#fR", host).value) : 0, C = num($("#fC", host).value);
    if (m === "lc") { const L = num($("#fL", host).value); if (!(L > 0 && C > 0)) return; const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C)), Z = Math.sqrt(L / C);
      o.innerHTML = '<div class="stats"><div><b>' + esc(fmtSI(f0, "Hz")) + '</b><small>' + T("Resonanzfrequenz", "fréquence de résonance") + '</small></div><div><b>' + esc(fmtSI(Z, "Ω")) + '</b><small>' + T("Kennwiderstand", "impédance caractéristique") + '</small></div></div><p class="hint">f₀ = 1 / (2π · √(L·C))</p>'; return; }
    if (!(R > 0 && C > 0)) return;
    const tau = R * C, fg = 1 / (2 * Math.PI * tau);
    if (m === "rc") {
      const hp = !!$("[data-p=hp].on", host);
      o.innerHTML = '<div class="stats"><div><b>' + esc(fmtSI(fg, "Hz")) + '</b><small>' + T("Grenzfrequenz (−3 dB)", "fréquence de coupure (−3 dB)") + '</small></div><div><b>' + esc(fmtSI(tau, "s")) + '</b><small>τ = R·C</small></div></div><canvas id="fCv"></canvas><p class="hint">' + (hp ? T("Hochpass: lässt hohe Frequenzen durch, bremst tiefe (−20 dB pro Dekade).", "Passe-haut : laisse passer les hautes fréquences (−20 dB par décade).") : T("Tiefpass: lässt tiefe Frequenzen durch, bremst hohe (−20 dB pro Dekade).", "Passe-bas : laisse passer les basses fréquences (−20 dB par décade).")) + '</p>';
      plot($("#fCv", host), 420, 230, (c, W, H, k) => {
        const l = 44, r = 10, t = 12, b = 30, f0 = Math.log10(fg) - 2, f1 = Math.log10(fg) + 2, dbMin = -60, dbMax = 5;
        const X = lf => l + (lf - f0) / (f1 - f0) * (W - l - r), Y = db => t + (dbMax - db) / (dbMax - dbMin) * (H - t - b);
        c.strokeStyle = k.ln; c.fillStyle = k.mu; c.font = "11px system-ui"; c.lineWidth = 1;
        for (let db = -60; db <= 0; db += 20) { c.beginPath(); c.moveTo(l, Y(db)); c.lineTo(W - r, Y(db)); c.stroke(); c.fillText(db + " dB", 4, Y(db) + 4); }
        for (let d = Math.ceil(f0); d <= f1; d++) { c.beginPath(); c.moveTo(X(d), t); c.lineTo(X(d), H - b); c.stroke(); c.fillText(fmtSI(Math.pow(10, d), "Hz", 2), X(d) - 16, H - 12); }
        c.strokeStyle = k.ac; c.lineWidth = 2.4; c.beginPath();
        for (let i = 0; i <= 160; i++) { const lf = f0 + (f1 - f0) * i / 160, x = Math.pow(10, lf) / fg, g = hp ? x / Math.sqrt(1 + x * x) : 1 / Math.sqrt(1 + x * x), db = Math.max(dbMin, 20 * Math.log10(g)); i ? c.lineTo(X(lf), Y(db)) : c.moveTo(X(lf), Y(db)); } c.stroke();
        c.setLineDash([4, 4]); c.strokeStyle = k.fg; c.lineWidth = 1; c.beginPath(); c.moveTo(X(Math.log10(fg)), t); c.lineTo(X(Math.log10(fg)), H - b); c.stroke(); c.setLineDash([]); c.fillStyle = k.fg; c.fillText("fg", X(Math.log10(fg)) + 4, t + 10);
      });
    } else {
      const Us = num($("#fUs", host).value); if (!(Us > 0)) return;
      o.innerHTML = '<div class="stats"><div><b>' + esc(fmtSI(tau, "s")) + '</b><small>τ = R·C</small></div><div><b>' + esc(fmtSI(5 * tau, "s")) + '</b><small>' + T("fast voll (5τ = 99,3 %)", "presque pleine (5τ = 99,3 %)") + '</small></div><div><b>' + esc(fmtSI(Us * 0.632, "V")) + '</b><small>' + T("nach 1τ (63,2 %)", "après 1τ (63,2 %)") + '</small></div></div><canvas id="fCv"></canvas>';
      plot($("#fCv", host), 420, 220, (c, W, H, k) => {
        const l = 44, r = 10, t = 12, b = 28, tm = 5 * tau, X = x => l + x / tm * (W - l - r), Y = u => t + (1 - u / Us) * (H - t - b);
        c.strokeStyle = k.ln; c.fillStyle = k.mu; c.font = "11px system-ui"; c.lineWidth = 1;
        for (let i = 0; i <= 5; i++) { c.beginPath(); c.moveTo(X(i * tau), t); c.lineTo(X(i * tau), H - b); c.stroke(); c.fillText(i + "τ", X(i * tau) - 6, H - 10); }
        [0, .5, 1].forEach(q => { c.beginPath(); c.moveTo(l, Y(q * Us)); c.lineTo(W - r, Y(q * Us)); c.stroke(); c.fillText((q * Us).toLocaleString(loc(), { maximumFractionDigits: 1 }) + " V", 2, Y(q * Us) + 4); });
        c.strokeStyle = k.ac; c.lineWidth = 2.4; c.beginPath(); for (let i = 0; i <= 120; i++) { const x = tm * i / 120, u = Us * (1 - Math.exp(-x / tau)); i ? c.lineTo(X(x), Y(u)) : c.moveTo(X(x), Y(u)); } c.stroke();
      });
    }
  }
  maske();
}

/* ====================================================================== 7. 555-Timer */
function timerTool(host){
  let m = "ast";
  host.innerHTML = SAFE() + '<div class="tabs t2" id="tmTab"></div><div class="cols2"><div id="tmIn"></div><div id="tmOut"></div></div><h3>' + T("Anschlüsse NE555", "Broches du NE555") + '</h3><div id="tmPins"></div>';
  const P = [["1", "GND"], ["2", "TRIG"], ["3", "OUT"], ["4", "RESET"], ["5", "CTRL"], ["6", "THRES"], ["7", "DISCH"], ["8", "VCC"]];
  $("#tmPins", host).innerHTML = '<svg viewBox="0 0 300 150" style="max-width:340px;width:100%" aria-hidden="true"><rect x="90" y="10" width="120" height="130" rx="10" fill="var(--soft)" stroke="currentColor" stroke-width="2"/><path d="M135 10a15 15 0 0 0 30 0" fill="none" stroke="currentColor" stroke-width="2"/>' +
    P.map((p, i) => { const L = i < 4, y = 30 + (L ? i : 7 - i) * 28; return '<line x1="' + (L ? 60 : 210) + '" y1="' + y + '" x2="' + (L ? 90 : 240) + '" y2="' + y + '" stroke="currentColor" stroke-width="3"/><text x="' + (L ? 100 : 200) + '" y="' + (y + 4) + '" font-size="11" fill="currentColor" text-anchor="' + (L ? "start" : "end") + '">' + p[0] + '</text><text x="' + (L ? 54 : 246) + '" y="' + (y + 4) + '" font-size="12" font-weight="700" fill="currentColor" text-anchor="' + (L ? "end" : "start") + '">' + p[1] + '</text>'; }).join("") + '</svg>';
  function maske(){
    $("#tmTab", host).innerHTML = [["ast", T("Astabil (Blinker)", "Astable (clignotant)")], ["mono", T("Monostabil (Impuls)", "Monostable (impulsion)")]].map(t => '<button class="btn' + (t[0] === m ? " on" : "") + '" data-m="' + t[0] + '">' + t[1] + '</button>').join("");
    $$("#tmTab button", host).forEach(b => b.onclick = () => { m = b.dataset.m; maske(); });
    $("#tmIn", host).innerHTML = m === "ast" ? eingabe(host, "tR1", "R1 (Ω)", "", "1k") + eingabe(host, "tR2", "R2 (Ω)", "", "47k") + eingabe(host, "tC", "C (F)", "", "10u") : eingabe(host, "tR", "R (Ω)", "", "100k") + eingabe(host, "tC", "C (F)", "", "10u");
    auf(host, ["tR1", "tR2", "tR", "tC"], rech); rech();
  }
  function rech(){
    const o = $("#tmOut", host), C = num($("#tC", host).value);
    if (m === "mono") { const R = num($("#tR", host).value); if (!(R > 0 && C > 0)) { o.innerHTML = ""; return; } o.innerHTML = '<div class="stats"><div><b>' + esc(fmtSI(1.1 * R * C, "s")) + '</b><small>' + T("Impulsdauer", "durée d’impulsion") + '</small></div></div><p class="hint">t = 1,1 · R · C ' + T("(ein kurzer Low-Impuls an TRIG startet ihn)", "(une brève impulsion basse sur TRIG le déclenche)") + '</p>'; return; }
    const R1 = num($("#tR1", host).value), R2 = num($("#tR2", host).value);
    if (!(R1 > 0 && R2 > 0 && C > 0)) { o.innerHTML = ""; return; }
    const th = 0.693 * (R1 + R2) * C, tl = 0.693 * R2 * C, f = 1 / (th + tl), d = th / (th + tl) * 100;
    o.innerHTML = '<div class="stats"><div><b>' + esc(fmtSI(f, "Hz")) + '</b><small>' + T("Frequenz", "fréquence") + '</small></div><div><b>' + esc(fmtSI(th + tl, "s")) + '</b><small>' + T("Periode", "période") + '</small></div><div><b>' + d.toLocaleString(loc(), { maximumFractionDigits: 1 }) + ' %</b><small>' + T("Tastgrad", "rapport cyclique") + '</small></div><div><b>' + esc(fmtSI(th, "s")) + ' / ' + esc(fmtSI(tl, "s")) + '</b><small>High / Low</small></div></div><canvas id="tmCv"></canvas><p class="hint">f = 1,44 / ((R1 + 2·R2) · C) ' + T("· der Tastgrad liegt immer über 50 %. Für Blinker mit LED: R1 klein, R2 groß.", "· le rapport cyclique reste toujours au-dessus de 50 %.") + '</p>';
    plot($("#tmCv", host), 420, 110, (c, W, H, k) => { const T3 = 3 * (th + tl), X = t => 10 + t / T3 * (W - 20); c.strokeStyle = k.ac; c.lineWidth = 2.4; c.beginPath(); let t = 0, hi = true; c.moveTo(X(0), 20); for (let i = 0; i < 6; i++) { const dt = hi ? th : tl; c.lineTo(X(t), hi ? 20 : 90); c.lineTo(X(t + dt), hi ? 20 : 90); t += dt; hi = !hi; c.lineTo(X(t), hi ? 20 : 90); } c.stroke(); });
  }
  maske();
}

/* ====================================================================== 8. Logik & Zahlen */
function logikTool(host){
  let m = "tab";
  host.innerHTML = SAFE() + '<div class="tabs" id="gTab"></div><div id="gBody"></div>';
  function lex(s){
    const out = []; let i = 0; s = s.replace(/\s+/g, " ");
    const W = { AND: "&", UND: "&", OR: "|", ODER: "|", NOT: "!", NICHT: "!", XOR: "^", NAND: "n&", NOR: "n|", XNOR: "n^", ET: "&", OU: "|", NON: "!" };
    while (i < s.length) { const ch = s[i];
      if (ch === " ") { i++; continue; }
      if ("()".includes(ch)) { out.push(ch); i++; continue; }
      if ("&*∧·".includes(ch)) { out.push("&"); i++; continue; } if ("|+∨".includes(ch)) { out.push("|"); i++; continue; } if ("!~¬".includes(ch)) { out.push("!"); i++; continue; } if ("^⊕".includes(ch)) { out.push("^"); i++; continue; }
      if (ch === "'") { out.push("'"); i++; continue; }
      const mm = /^[A-Za-zÄÖÜ]+/.exec(s.slice(i));
      if (!mm) throw new Error(T("Unbekanntes Zeichen: ", "Caractère inconnu : ") + ch);
      const w = mm[0].toUpperCase();
      if (W[w]) out.push(W[w]); else if (w.length === 1) out.push({ v: w }); else throw new Error(T("Unbekanntes Wort: ", "Mot inconnu : ") + mm[0] + T(" (Variablen sind einzelne Buchstaben)", " (les variables sont des lettres seules)"));
      i += mm[0].length; }
    return out;
  }
  function parse(tok){
    let p = 0; const vars = new Set();
    const peek = () => tok[p];
    function prim(){ const t = tok[p++]; if (t === undefined) throw new Error(T("Ausdruck endet zu früh", "Expression incomplète")); if (t === "(") { const e = or(); if (tok[p++] !== ")") throw new Error(T("Klammer fehlt", "Parenthèse manquante")); return post(e); } if (t === "!") { const e = prim(); return e0 => !e(e0); } if (t && t.v) { vars.add(t.v); return post(e0 => !!e0[t.v]); } throw new Error(T("Unerwartet: ", "Inattendu : ") + (t.v || t)); }
    function post(e){ while (tok[p] === "'") { p++; const q = e; e = x => !q(x); } return e; }
    function and(){ let l = un(); while (peek() === "&" || peek() === "n&" || (peek() && (peek().v || peek() === "(" || peek() === "!") && false)) { const op = tok[p++], r = un(), a = l; l = op === "&" ? (e => a(e) && r(e)) : (e => !(a(e) && r(e))); } return l; }
    function un(){ return prim(); }
    function xor(){ let l = and(); while (peek() === "^" || peek() === "n^") { const op = tok[p++], r = and(), a = l; l = op === "^" ? (e => a(e) !== r(e)) : (e => a(e) === r(e)); } return l; }
    function or(){ let l = xor(); while (peek() === "|" || peek() === "n|") { const op = tok[p++], r = xor(), a = l; l = op === "|" ? (e => a(e) || r(e)) : (e => !(a(e) || r(e))); } return l; }
    const f = or(); if (p < tok.length) throw new Error(T("Unerwartet: ", "Inattendu : ") + (tok[p].v || tok[p])); return { f: f, vars: Array.from(vars).sort() };
  }
  function tabelle(){
    const B = $("#gBody", host); B.innerHTML = '<label class="l" for="gE">' + T("Ausdruck – z. B. A AND (B OR NOT C)  oder  A XOR B  oder  (A+B)·C'", "Expression – p. ex. A AND (B OR NOT C)  ou  A XOR B  ou  (A+B)·C'") + '</label><input class="in" id="gE" value="(A AND B) OR (NOT C)" spellcheck="false" autocomplete="off"><p class="hint">' + T("Operatoren: AND/UND/&amp;/·, OR/ODER/|/+, NOT/NICHT/!/~ oder Apostroph (A\'), XOR/^, NAND, NOR, XNOR. Bis zu 6 Variablen (einzelne Buchstaben).", "Opérateurs : AND/ET/&amp;/·, OR/OU/|/+, NOT/NON/!/~ ou apostrophe (A\'), XOR/^, NAND, NOR, XNOR. Jusqu’à 6 variables (lettres seules).") + '</p><div id="gO"></div>';
    const run = () => { const o = $("#gO", host);
      try { const r = parse(lex($("#gE", host).value)); if (!r.vars.length) { o.innerHTML = ""; return; } if (r.vars.length > 6) throw new Error(T("Maximal 6 Variablen.", "6 variables maximum."));
        const n = r.vars.length, rows = []; let ones = [];
        for (let i = 0; i < (1 << n); i++) { const e = {}; r.vars.forEach((v, j) => e[v] = !!(i >> (n - 1 - j) & 1)); const q = r.f(e); rows.push([r.vars.map(v => e[v] ? 1 : 0), q ? 1 : 0]); if (q) ones.push(r.vars.map((v, j) => e[v] ? v : v + "'").join("·")); }
        o.innerHTML = '<div class="uall"><table class="utab" style="max-width:' + (60 + n * 50) + 'px"><tr>' + r.vars.map(v => '<td><b>' + v + '</b></td>').join("") + '<td><b>Q</b></td></tr>' + rows.map(x => '<tr' + (x[1] ? ' class="me"' : "") + '>' + x[0].map(b => '<td style="text-align:center">' + b + '</td>').join("") + '<td style="text-align:center"><b>' + x[1] + '</b></td></tr>').join("") + '</table></div><p class="resbox"><b>' + T("Normalform (DNF):", "Forme normale (DNF) :") + '</b> ' + (ones.length ? esc(ones.join(" + ")) : T("immer 0", "toujours 0")) + '</p>';
      } catch (e) { o.innerHTML = '<p class="warn">' + esc(e.message) + '</p>'; } };
    $("#gE", host).addEventListener("input", run); run();
  }
  function gatter(){
    const G = [["AND (UND)", "7408", (a, b) => a & b], ["OR (ODER)", "7432", (a, b) => a | b], ["NAND", "7400", (a, b) => 1 - (a & b)], ["NOR", "7402", (a, b) => 1 - (a | b)], ["XOR", "7486", (a, b) => a ^ b], ["XNOR", "74266", (a, b) => 1 - (a ^ b)]];
    $("#gBody", host).innerHTML = '<div class="cols3">' + G.map(g => '<div class="card" style="margin:0"><b>' + g[0] + '</b> <span class="muted">· 74' + g[1].slice(2) + '</span><table class="utab"><tr><td>A</td><td>B</td><td>Q</td></tr>' + [[0, 0], [0, 1], [1, 0], [1, 1]].map(r => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td><b>' + g[2](r[0], r[1]) + '</b></td></tr>').join("") + '</table></div>').join("") +
      '<div class="card" style="margin:0"><b>NOT (NICHT)</b> <span class="muted">· 7404</span><table class="utab"><tr><td>A</td><td>Q</td></tr><tr><td>0</td><td><b>1</b></td></tr><tr><td>1</td><td><b>0</b></td></tr></table></div></div><p class="hint">' + T("Die TTL-ICs der 74er-Reihe brauchen 5 V (74HC: 2–6 V). Pin 14 = VCC, Pin 7 = GND; vier Gatter pro Gehäuse (7404: sechs Inverter).", "Les circuits TTL de la série 74 demandent 5 V (74HC : 2–6 V). Broche 14 = VCC, broche 7 = GND ; quatre portes par boîtier (7404 : six inverseurs).") + '</p>';
  }
  function zahlen(){
    $("#gBody", host).innerHTML = '<div class="cols2"><div>' + eingabe(host, "zD", T("Dezimal", "Décimal"), "", "202") + eingabe(host, "zB", T("Binär", "Binaire"), "", "") + eingabe(host, "zH", "Hex", "", "") + eingabe(host, "zO", T("Oktal", "Octal"), "", "") + '</div><div id="zX"></div></div>';
    const bases = { zD: 10, zB: 2, zH: 16, zO: 8 };
    function setze(from){ let val; const raw = $("#" + from, host).value.trim().replace(/\s|_/g, "").replace(/^0x/i, "").replace(/^0b/i, "");
      const ok = { 10: /^-?\d+$/, 2: /^[01]+$/, 16: /^[0-9a-f]+$/i, 8: /^[0-7]+$/ }[bases[from]];
      if (!raw || !ok.test(raw)) { if (raw) $("#zX", host).innerHTML = '<p class="warn">' + T("Ungültige Zeichen.", "Caractères invalides.") + '</p>'; else $("#zX", host).innerHTML = ""; return; }
      try { val = bases[from] === 10 ? BigInt(raw) : BigInt((bases[from] === 2 ? "0b" : bases[from] === 16 ? "0x" : "0o") + raw); } catch (e) { return; }
      const neg = val < 0n, a = neg ? -val : val;
      Object.keys(bases).forEach(k => { if (k !== from) $("#" + k, host).value = (neg ? "-" : "") + a.toString(bases[k]).toUpperCase(); });
      const x = $("#zX", host); let h = '<div class="stats"><div><b>' + a.toString(2).length + '</b><small>Bit</small></div><div><b>' + Math.ceil(a.toString(2).length / 8 || 1) + '</b><small>Byte</small></div></div>';
      if (!neg && a < 256n) { const n = Number(a); h += '<div class="stats"><div><b>' + (n >= 32 && n < 127 ? esc(String.fromCharCode(n)) : "–") + '</b><small>ASCII</small></div><div><b>' + (256 - n) % 256 + '</b><small>' + T("Zweierkompl. (8 Bit)", "compl. à 2 (8 bits)") + '</small></div></div>'; }
      if (!neg && a < 4294967296n) h += '<p class="hint">' + T("Als 8-Bit-Zahl: ", "Sur 8 bits : ") + Number(a & 255n).toString(2).padStart(8, "0") + (a > 127n && a < 256n ? T(" (mit Vorzeichen: ", " (signé : ") + (Number(a) - 256) + ")" : "") + '</p>';
      x.innerHTML = h; }
    Object.keys(bases).forEach(k => $("#" + k, host).addEventListener("input", () => setze(k))); setze("zD");
  }
  function maske(){
    $("#gTab", host).innerHTML = [["tab", T("Wahrheitstabelle", "Table de vérité")], ["gat", T("Gatter & 74xx", "Portes & 74xx")], ["zah", T("Zahlensysteme", "Systèmes de numération")]].map(t => '<button class="btn sm' + (t[0] === m ? " on" : "") + '" data-m="' + t[0] + '">' + t[1] + '</button>').join("");
    $$("#gTab button", host).forEach(b => b.onclick = () => { m = b.dataset.m; maske(); });
    ({ tab: tabelle, gat: gatter, zah: zahlen })[m]();
  }
  maske();
}

/* ====================================================================== 9. Raspberry-Pi-Pinout */
function pinTool(host){
  const PIN = {1:["3V3","3V3"],2:["5V","5V"],3:["GPIO2","I²C1 SDA"],4:["5V","5V"],5:["GPIO3","I²C1 SCL"],6:["GND","GND"],7:["GPIO4","GPCLK0"],8:["GPIO14","UART TXD"],9:["GND","GND"],10:["GPIO15","UART RXD"],11:["GPIO17",""],12:["GPIO18","PWM0 · PCM CLK · SPI1 CE0"],13:["GPIO27",""],14:["GND","GND"],15:["GPIO22",""],16:["GPIO23",""],17:["3V3","3V3"],18:["GPIO24",""],19:["GPIO10","SPI0 MOSI"],20:["GND","GND"],21:["GPIO9","SPI0 MISO"],22:["GPIO25",""],23:["GPIO11","SPI0 SCLK"],24:["GPIO8","SPI0 CE0"],25:["GND","GND"],26:["GPIO7","SPI0 CE1"],27:["GPIO0","ID_SD (I²C0)"],28:["GPIO1","ID_SC (I²C0)"],29:["GPIO5",""],30:["GND","GND"],31:["GPIO6",""],32:["GPIO12","PWM0"],33:["GPIO13","PWM1"],34:["GND","GND"],35:["GPIO19","PWM1 · PCM FS · SPI1 MISO"],36:["GPIO16","SPI1 CE2"],37:["GPIO26",""],38:["GPIO20","PCM DIN · SPI1 MOSI"],39:["GND","GND"],40:["GPIO21","PCM DOUT · SPI1 SCLK"]};
  const FILT = [["alle", T("Alle", "Toutes")], ["strom", T("Strom", "Alim.")], ["gnd", "GND"], ["i2c", "I²C"], ["spi", "SPI"], ["uart", "UART"], ["pwm", "PWM"], ["pcm", "PCM/I²S"]];
  const kind = p => { const n = PIN[p][0]; return n === "GND" ? "gnd" : n === "3V3" || n === "5V" ? "strom" : "gpio"; };
  const tags = p => { const f = PIN[p][1].toLowerCase(); const t = []; if (/i²c/.test(f)) t.push("i2c"); if (/spi/.test(f)) t.push("spi"); if (/uart/.test(f)) t.push("uart"); if (/pwm/.test(f)) t.push("pwm"); if (/pcm/.test(f)) t.push("pcm"); const k = kind(p); if (k !== "gpio") t.push(k); return t; };
  const col = p => { const n = PIN[p][0]; return n === "3V3" ? "#ff9f1a" : n === "5V" ? "#e63946" : n === "GND" ? "#4b5160" : PIN[p][1] ? "#2e86ff" : "#2a9d3f"; };
  let sel = 3, fl = "alle";
  host.innerHTML = SAFE() + '<div class="tabs" id="pF"></div><div class="cols2"><div><div id="pGrid" class="pgrid"></div><p class="hint">' + T("So hältst du den Pi: USB-Anschlüsse unten, Header oben rechts. Pin 1 ist oben links (Viereck-Pad).", "Position : ports USB en bas, connecteur en haut à droite. La broche 1 est en haut à gauche (pastille carrée).") + '</p></div><div id="pInfo"></div></div>';
  const st = document.createElement("style"); st.textContent = ".pgrid{display:grid;grid-template-columns:1fr 34px 34px 1fr;gap:5px 6px;align-items:center;max-width:380px;margin:0 auto;padding:10px;border-radius:14px;background:#1c5a3a;color:#fff}.pgrid .pl{font:600 12.5px/1.2 ui-monospace,Menlo,monospace;padding:0 2px}.pgrid .pl.r{text-align:left}.pgrid .pl.l{text-align:right}.pg{width:30px;height:30px;border-radius:50%;border:2px solid #f5e4a4;color:#fff;font:700 11px system-ui;display:grid;place-items:center;cursor:pointer;padding:0;opacity:1}.pg.sq{border-radius:6px}.pg.dim{opacity:.18}.pg.on{outline:3px solid #fff;outline-offset:2px;transform:scale(1.12)}#pInfo .stats{grid-template-columns:repeat(2,1fr)}";
  host.appendChild(st);
  function zeichne(){
    $("#pF", host).innerHTML = FILT.map(f => '<button class="btn sm' + (f[0] === fl ? " on" : "") + '" data-f="' + f[0] + '">' + f[1] + '</button>').join("");
    $$("#pF button", host).forEach(b => b.onclick = () => { fl = b.dataset.f; zeichne(); });
    let g = ""; for (let i = 0; i < 20; i++) { const a = 2 * i + 1, b = 2 * i + 2;
      const cell = p => { const dim = fl !== "alle" && !tags(p).includes(fl); return '<button type="button" class="pg' + (p === 1 ? " sq" : "") + (dim ? " dim" : "") + (p === sel ? " on" : "") + '" data-p="' + p + '" style="background:' + col(p) + '" aria-label="Pin ' + p + ' ' + PIN[p][0] + '">' + p + '</button>'; };
      g += '<div class="pl l">' + PIN[a][0] + (PIN[a][1] && !/^(3V3|5V|GND)$/.test(PIN[a][1]) ? '<br><span style="opacity:.7;font-weight:500">' + esc(PIN[a][1].split(" · ")[0]) + '</span>' : '') + '</div>' + cell(a) + cell(b) + '<div class="pl r">' + PIN[b][0] + (PIN[b][1] && !/^(3V3|5V|GND)$/.test(PIN[b][1]) ? '<br><span style="opacity:.7;font-weight:500">' + esc(PIN[b][1].split(" · ")[0]) + '</span>' : '') + '</div>'; }
    $("#pGrid", host).innerHTML = g; $$(".pg", host).forEach(b => b.onclick = () => { sel = +b.dataset.p; zeichne(); });
    info();
  }
  function info(){
    const [n, f] = PIN[sel], k = kind(sel), gp = /^GPIO(\d+)$/.exec(n);
    const L = { "3V3": T("3,3-V-Versorgung (max. ca. 0,5 A gesamt über alle 3V3-Pins).", "Alimentation 3,3 V (environ 0,5 A max. au total)."), "5V": T("5 V direkt vom Netzteil. Niemals an einen GPIO-Pin anschließen!", "5 V directement du bloc secteur. Ne jamais relier à une broche GPIO !"), "GND": T("Masse (0 V). Alle GND-Pins sind miteinander verbunden.", "Masse (0 V). Toutes les broches GND sont reliées entre elles.") };
    let h = '<div class="card" style="margin:0"><h3 style="margin-top:0"><span class="ts" style="background:' + col(sel) + ';width:34px;height:34px;font-size:15px">' + sel + '</span> ' + esc(n) + (f && k === "gpio" ? ' · ' + esc(f.split(" · ")[0]) : "") + '</h3>';
    if (k !== "gpio") h += '<p>' + L[n] + '</p>';
    else { h += '<div class="stats"><div><b>BCM ' + gp[1] + '</b><small>' + T("GPIO-Nummer (Software)", "numéro GPIO (logiciel)") + '</small></div><div><b>Pin ' + sel + '</b><small>' + T("Platz am Header", "position sur le connecteur") + '</small></div></div>';
      h += '<p>' + (f ? T("Zusatzfunktionen: ", "Fonctions alternatives : ") + '<b>' + esc(f) + '</b>' : T("Normaler Ein-/Ausgang ohne feste Zusatzfunktion.", "Entrée/sortie simple, sans fonction alternative fixe.")) + '</p>';
      h += '<p class="hint">' + T("3,3-V-Pegel, höchstens ca. 16 mA pro Pin. Nicht 5-V-tolerant. Einfacher Test in Python: ", "Niveau 3,3 V, environ 16 mA max. par broche. Non tolérant 5 V. Test simple en Python : ") + '<code>from gpiozero import LED; LED(' + gp[1] + ').on()</code></p>'; }
    $("#pInfo", host).innerHTML = h + '</div><p class="hint">' + T("Gilt für Raspberry Pi 2, 3, 4, 5, Zero und Pico-kompatible 40-Pin-Header.", "Valable pour les Raspberry Pi 2, 3, 4, 5 et Zero (connecteur à 40 broches).") + '</p>';
  }
  zeichne();
}

/* ====================================================================== Rahmen */
const TOOLS = [
  ["farbcode", "🌈", "#e0527a", T("Widerstands-Farbcode", "Code couleur des résistances"), T("Ringe antippen oder Wert eingeben – 4, 5 und 6 Ringe, mit Toleranz.", "Touche les anneaux ou saisis une valeur – 4, 5 et 6 anneaux, avec tolérance."), resTool],
  ["ohm", "⚡", "#ff8c1a", T("Ohm & Leistung", "Ohm et puissance"), T("Zwei Werte eingeben, U, I, R und P werden berechnet.", "Saisis deux valeurs : U, I, R et P sont calculés."), ohmTool],
  ["led", "💡", "#f2b100", T("LED-Vorwiderstand", "Résistance pour LED"), T("Welchen Widerstand braucht deine LED? Mit Normwert und Watt-Angabe.", "Quelle résistance pour ta LED ? Avec valeur normalisée et puissance."), ledTool],
  ["teiler", "➗", "#2e86ff", T("Spannungsteiler", "Pont diviseur"), T("Ausgang berechnen oder passende Widerstände finden (auch mit Last).", "Calculer la sortie ou trouver les résistances (avec charge)."), teilerTool],
  ["normwerte", "🧩", "#12b8a6", T("Reihe, Parallel & Normwerte", "Série, parallèle et valeurs"), T("Widerstände kombinieren oder einen Wunschwert aus E12/E24 bauen.", "Combiner des résistances ou fabriquer une valeur avec E12/E24."), kombiTool],
  ["filter", "〰️", "#8a4dff", T("Filter & Schwingkreis", "Filtres et circuit LC"), T("RC-Filter mit Bode-Diagramm, Kondensator laden, LC-Resonanz.", "Filtre RC avec diagramme de Bode, charge de condensateur, résonance LC."), filterTool],
  ["timer555", "⏲️", "#c4452c", T("555-Timer", "Timer 555"), T("Blinker (astabil) und Impuls (monostabil) berechnen, mit Pinbelegung.", "Calculer clignotant (astable) et impulsion (monostable), avec brochage."), timerTool],
  ["logik", "🔢", "#6a4fd8", T("Logik & Zahlensysteme", "Logique et numération"), T("Wahrheitstabelle für jeden Ausdruck, 74xx-Gatter, Binär/Hex/Dezimal.", "Table de vérité pour toute expression, portes 74xx, binaire/hexa/décimal."), logikTool],
  ["pinout", "🍓", "#d6336c", T("Raspberry-Pi-Pinout", "Brochage Raspberry Pi"), T("Alle 40 Pins antippen: Funktion, Nummer, Hinweise. Mit Filter für I²C, SPI, UART, PWM.", "Touche les 40 broches : fonction, numéro, conseils. Filtre I²C, SPI, UART, PWM."), pinTool]
];
window.Elektro = { start: function(){
  const grid = $("#toolgrid"), hostEl = $("#toolhost");
  grid.innerHTML = TOOLS.map(t => '<a class="tcard" href="#' + t[0] + '" data-id="' + t[0] + '"><span class="ts" style="background:' + t[2] + '">' + t[1] + '</span><span><b>' + esc(t[3]) + '</b><small>' + esc(t[4]) + '</small></span></a>').join("");
  function zeigen(){
    const id = (location.hash || "").slice(1), t = TOOLS.find(x => x[0] === id) || TOOLS[0];
    $$(".tcard", grid).forEach(a => a.classList.toggle("on", a.dataset.id === t[0]));
    hostEl.innerHTML = '<section class="card toolcard" id="' + t[0] + '"><h2><span class="ts" style="background:' + t[2] + '">' + t[1] + '</span> ' + esc(t[3]) + '</h2><div class="tbody"></div></section>';
    try { t[5]($(".tbody", hostEl)); } catch(e){ $(".tbody", hostEl).textContent = e.message; }
    if (window.WZ && WZ.selects) WZ.selects();
    document.title = t[3] + " – " + T("Elektronik-Labor", "Labo d’électronique") + " – Oratio";
  }
  window.addEventListener("hashchange", () => { zeigen(); const el = $(".toolcard"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); });
  zeigen();
} };
})();
