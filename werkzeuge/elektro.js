// Elektronik-Rechner: Farbcode, Ohm, LED, Teiler, Opamp, Normwerte, Filter, 555, Logik.
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
  host.innerHTML = SAFE() + '<div class="tabs t2" id="tTab"></div><div class="cols2"><div id="tIn"></div><div><div id="tSvg"></div><div id="tOut"></div></div></div>';
  function maske(){
    $("#tTab", host).innerHTML = [["ua", T("Ausgang berechnen", "Calculer la sortie")], ["rb", T("Widerstände finden", "Trouver les résistances")]].map(t => '<button class="btn' + (t[0] === m ? " on" : "") + '" data-m="' + t[0] + '">' + t[1] + '</button>').join("");
    $$("#tTab button", host).forEach(b => b.onclick = () => { m = b.dataset.m; maske(); });
    $("#tIn", host).innerHTML = m === "ua"
      ? eingabe(host, "tU", "Uin (V)", "", "12") + eingabe(host, "tR1", "R1 (Ω)", "", "10k") + eingabe(host, "tR2", "R2 (Ω)", "", "4k7") + eingabe(host, "tRL", T("Last RL (Ω, optional)", "Charge RL (Ω, facultatif)"), T("leer = keine Last", "vide = sans charge"), "")
      : eingabe(host, "tU", "Uin (V)", "", "5") + eingabe(host, "tUo", T("Gewünschtes Uout (V)", "Uout souhaitée (V)"), "", "3,3") + eingabe(host, "tR2", T("R2 fest wählen (Ω)", "R2 fixée (Ω)"), "", "10k") + '<label class="l">' + T("Normreihe", "Série normalisée") + '</label>' + serSel("tS", "E24");
    auf(host, ["tU", "tR1", "tR2", "tRL", "tUo", "tS"], rech); rech();
  }
  function bildT(U, R1, R2, Uo, I, RL){
    const sc = r => 26 + 52 * Math.min(1, Math.max(0.12, Math.log10(r + 1) / 7)), h1 = sc(R1), h2 = sc(R2), y1 = 40, y2 = y1 + h1 + 36, yE = y2 + h2 + 20;
    const col = (Math.abs(I) > 0 ? "#ff7a00" : "currentColor");
    host.querySelector("#tSvg").innerHTML = '<svg viewBox="0 0 300 ' + (yE + 40) + '" style="max-width:300px;width:100%;display:block;margin:0 auto;color:var(--fg,#223)" role="img" aria-label="' + T("Spannungsteiler", "Pont diviseur") + '"><style>.tp{fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}.tt{font:700 12px system-ui,sans-serif;fill:currentColor}.tv{font:800 12.5px system-ui,sans-serif}</style>' +
      '<g class="tp"><path d="M70 14V' + y1 + '"/><rect x="58" y="' + y1 + '" width="24" height="' + h1 + '" rx="3" fill="rgba(46,134,255,.12)"/><path d="M70 ' + (y1 + h1) + 'V' + (y2) + '"/><rect x="58" y="' + y2 + '" width="24" height="' + h2 + '" rx="3" fill="rgba(255,122,0,.14)"/><path d="M70 ' + (y2 + h2) + 'V' + yE + 'M54 ' + yE + 'H86M60 ' + (yE + 6) + 'H80M66 ' + (yE + 12) + 'H74"/><path d="M70 ' + (y1 + h1 + 18) + 'H150" stroke-dasharray="5 4"/><circle cx="154" cy="' + (y1 + h1 + 18) + '" r="3.5"/>' + (isFinite(RL) ? '<path d="M154 ' + (y1 + h1 + 18) + 'H240V' + (y2 + 6) + '"/><rect x="233" y="' + (y2 + 6) + '" width="14" height="26" rx="2"/><path d="M240 ' + (y2 + 32) + 'V' + yE + 'H70"/>' : '') + '</g>' +
      '<circle cx="70" cy="14" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><text class="tt" x="82" y="18">Uin</text><text class="tv" x="104" y="18" fill="#2e86ff">' + esc(fmtSI(U, "V")) + '</text>' +
      '<text class="tt" x="92" y="' + (y1 + h1 / 2 + 4) + '">R1</text><text class="tv" x="116" y="' + (y1 + h1 / 2 + 4) + '" fill="#2e86ff">' + esc(fmtSI(R1, "Ω")) + '</text><text class="tv" x="92" y="' + (y1 + h1 / 2 + 19) + '" fill="#ff7a00">' + esc(fmtSI(U - Uo, "V")) + ' ↓</text>' +
      '<text class="tt" x="92" y="' + (y2 + h2 / 2 + 4) + '">R2</text><text class="tv" x="116" y="' + (y2 + h2 / 2 + 4) + '" fill="#ff7a00">' + esc(fmtSI(R2, "Ω")) + '</text><text class="tv" x="92" y="' + (y2 + h2 / 2 + 19) + '" fill="#ff7a00">' + esc(fmtSI(Uo, "V")) + ' ↓</text>' +
      '<text class="tt" x="164" y="' + (y1 + h1 + 14) + '">Uout</text><text class="tv" x="164" y="' + (y1 + h1 + 36) + '" fill="#ff7a00">' + esc(fmtSI(Uo, "V")) + '</text>' + (isFinite(RL) ? '<text class="tt" x="254" y="' + (y2 + 22) + '">RL</text><text class="tv" x="254" y="' + (y2 + 36) + '" fill="#2e86ff">' + esc(fmtSI(RL, "Ω")) + '</text>' : '') +
      '<text class="tt" x="70" y="' + (yE + 32) + '" text-anchor="middle">I = ' + esc(fmtSI(I, "A")) + '</text></svg>';
  }
  function rech(){
    const o = $("#tOut", host), U = num($("#tU", host).value), R2 = num($("#tR2", host).value);
    if (m === "ua") {
      const R1 = num($("#tR1", host).value), RLs = $("#tRL", host).value.trim(), RL = RLs ? num(RLs) : Infinity;
      if (![U, R1, R2].every(x => isFinite(x) && x > 0) || (RLs && !(RL > 0))) { o.innerHTML = ""; return; }
      const R2e = isFinite(RL) ? R2 * RL / (R2 + RL) : R2, Uo = U * R2e / (R1 + R2e), Uo0 = U * R2 / (R1 + R2), Q = U / (R1 + R2);
      bildT(U, R1, R2, Uo, (U - Uo) / R1, RL);
      o.innerHTML = '<div class="stats"><div><b>' + esc(fmtSI(Uo, "V")) + '</b><small>Uout' + (isFinite(RL) ? " " + T("mit Last", "en charge") : "") + '</small></div>' + (isFinite(RL) ? '<div><b>' + esc(fmtSI(Uo0, "V")) + '</b><small>' + T("ohne Last", "à vide") + '</small></div>' : '') + '<div><b>' + esc(fmtSI(Q, "A")) + '</b><small>' + T("Querstrom", "courant de pont") + '</small></div><div><b>' + esc(fmtSI(U * Q, "W")) + '</b><small>' + T("Leistung gesamt", "puissance totale") + '</small></div></div>' + (isFinite(RL) && Uo < Uo0 * 0.95 ? '<p class="warn">' + T("Die Last zieht den Ausgang um mehr als 5 % herunter. R1/R2 kleiner wählen (RL sollte mindestens 10× größer als R2 sein).", "La charge fait chuter la sortie de plus de 5 %. Choisis R1/R2 plus petites (RL devrait valoir au moins 10× R2).") + '</p>' : '');
    } else {
      const Uo = num($("#tUo", host).value), ser = $("#tS", host).value;
      if (![U, Uo, R2].every(x => isFinite(x) && x > 0)) { o.innerHTML = ""; return; }
      if (Uo >= U) { o.innerHTML = '<p class="warn">' + T("Uout muss kleiner als Uin sein.", "Uout doit être inférieure à Uin.") + '</p>'; return; }
      const R1 = R2 * (U - Uo) / Uo, R1n = nearestE(R1, ser, "near"), Ua = U * R2 / (R1n + R2), f = Math.abs(Ua - Uo) / Uo * 100;
      bildT(U, R1n, R2, Ua, (U - Ua) / R1n, Infinity);
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
  ["hp", "bp"].forEach(k => { const w = OPW[k]; if (!w) return; host.insertAdjacentHTML("beforeend", '<details class="opw2"><summary>📖 ' + (k === "hp" ? T("RC-Hochpass: Erklärung und Hinweise", "Passe-haut RC : explication") : T("RC-Bandpass: Erklärung und Hinweise", "Passe-bande RC : explication")) + '</summary><p>' + esc(T(w.d[0], w.d[1])) + '</p><ul>' + w.forms.map(f => '<li><code>' + esc(f) + '</code></li>').join("") + w.notes.map(n => '<li>' + esc(T(n[0], n[1])) + '</li>').join("") + '</ul></details>'); });
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
    $("#tmTab", host).innerHTML = [["ast", T("Astabil (Blinker)", "Astable (clignotant)")], ["mono", T("Monostabil (Impuls)", "Monostable (impulsion)")], ["cd", "CD4060"]].map(t => '<button class="btn' + (t[0] === m ? " on" : "") + '" data-m="' + t[0] + '">' + t[1] + '</button>').join("");
    $$("#tmTab button", host).forEach(b => b.onclick = () => { m = b.dataset.m; maske(); });
    $("#tmIn", host).innerHTML = m === "cd" ? eingabe(host, "tR", "R (Ω)", "", "100k") + eingabe(host, "tC", "C (F)", "", "1n") : m === "ast" ? eingabe(host, "tR1", "R1 (Ω)", "", "1k") + eingabe(host, "tR2", "R2 (Ω)", "", "47k") + eingabe(host, "tC", "C (F)", "", "10u") : eingabe(host, "tR", "R (Ω)", "", "100k") + eingabe(host, "tC", "C (F)", "", "10u");
    auf(host, ["tR1", "tR2", "tR", "tC"], rech); rech();
  }
  function rech(){
    const o = $("#tmOut", host), C = num($("#tC", host).value);
    if (m === "cd") { const R = num($("#tR", host).value); if (!(R > 0 && C > 0)) { o.innerHTML = ""; return; } const f = 1 / (2.2 * R * C); o.innerHTML = '<div class="stats"><div><b>' + esc(fmtSI(f, "Hz")) + '</b><small>' + T("Oszillator (Pin 9–11)", "oscillateur (broches 9–11)") + '</small></div>' + [4, 5, 6, 7, 8, 9, 10, 12, 13, 14].map(n => '<div><b>' + esc(fmtSI(f / Math.pow(2, n), "Hz")) + '</b><small>Q' + n + ' (÷' + Math.pow(2, n) + ')</small></div>').join("") + '</div><p class="sub">' + T("f ≈ 1 / (2,2 · R · C) mit R = Rt, C = Ct am CD4060 (R2 ≈ 2–10 · R). Mit Quarz 32,768 kHz liefert Q14 genau 2 Hz (÷16384).", "f ≈ 1 / (2,2 · R · C) avec R = Rt, C = Ct sur le CD4060 (R2 ≈ 2–10 · R). Avec quartz 32,768 kHz : Q14 donne exactement 2 Hz.") + '</p>'; return; }
    if (m === "mono") { const R = num($("#tR", host).value); if (!(R > 0 && C > 0)) { o.innerHTML = ""; return; } o.innerHTML = '<div class="stats"><div><b>' + esc(fmtSI(1.1 * R * C, "s")) + '</b><small>' + T("Impulsdauer", "durée d’impulsion") + '</small></div></div><p class="hint">t = 1,1 · R · C ' + T("(ein kurzer Low-Impuls an TRIG startet ihn)", "(une brève impulsion basse sur TRIG le déclenche)") + '</p>'; return; }
    const R1 = num($("#tR1", host).value), R2 = num($("#tR2", host).value);
    if (!(R1 > 0 && R2 > 0 && C > 0)) { o.innerHTML = ""; return; }
    const th = 0.693 * (R1 + R2) * C, tl = 0.693 * R2 * C, f = 1 / (th + tl), d = th / (th + tl) * 100;
    o.innerHTML = '<div class="stats"><div><b>' + esc(fmtSI(f, "Hz")) + '</b><small>' + T("Frequenz", "fréquence") + '</small></div><div><b>' + esc(fmtSI(th + tl, "s")) + '</b><small>' + T("Periode", "période") + '</small></div><div><b>' + d.toLocaleString(loc(), { maximumFractionDigits: 1 }) + ' %</b><small>' + T("Tastgrad", "rapport cyclique") + '</small></div><div><b>' + esc(fmtSI(th, "s")) + ' / ' + esc(fmtSI(tl, "s")) + '</b><small>High / Low</small></div></div><canvas id="tmCv"></canvas><p class="hint">f = 1,44 / ((R1 + 2·R2) · C) ' + T("· der Tastgrad liegt immer über 50 %. Für Blinker mit LED: R1 klein, R2 groß.", "· le rapport cyclique reste toujours au-dessus de 50 %.") + '</p>';
    plot($("#tmCv", host), 420, 110, (c, W, H, k) => { const T3 = 3 * (th + tl), X = t => 10 + t / T3 * (W - 20); c.strokeStyle = k.ac; c.lineWidth = 2.4; c.beginPath(); let t = 0, hi = true; c.moveTo(X(0), 20); for (let i = 0; i < 6; i++) { const dt = hi ? th : tl; c.lineTo(X(t), hi ? 20 : 90); c.lineTo(X(t + dt), hi ? 20 : 90); t += dt; hi = !hi; c.lineTo(X(t), hi ? 20 : 90); } c.stroke(); });
  }
  maske();
}

/* ====================================================================== Regler (LM317, Linearregler) */
function reglerTool(host){
  let m = "lm";
  const fm = (v, d) => v.toLocaleString(loc(), { maximumFractionDigits: d === undefined ? 2 : d });
  host.innerHTML = SAFE() + '<div class="tabs t2" id="rgTab"></div><div class="cols2"><div id="rgIn"></div><div id="rgOut"></div></div><p class="sub" id="rgInfo"></p>';
  function maske(){
    $("#rgTab", host).innerHTML = [["lm", "LM317"], ["pv", T("Verlust & Wärme", "Pertes et chaleur")]].map(t => '<button class="btn' + (t[0] === m ? " on" : "") + '" data-m="' + t[0] + '">' + t[1] + '</button>').join("");
    $$("#rgTab button", host).forEach(b => b.onclick = () => { m = b.dataset.m; maske(); });
    $("#rgIn", host).innerHTML = m === "lm"
      ? eingabe(host, "gR1", "R1 (Ω)", "", "240") + eingabe(host, "gR2", T("R2 (Ω) – leer lassen = berechnen", "R2 (Ω) – vide = calculer"), "", "720") + eingabe(host, "gUo", T("Wunsch-Uout (V)", "Uout voulue (V)"), "", "") + eingabe(host, "gI", T("Laststrom (A)", "Courant de charge (A)"), "", "0,5")
      : eingabe(host, "gUi", "Uin (V)", "", "12") + eingabe(host, "gUa", "Uout (V)", "", "5") + eingabe(host, "gI", T("Strom (A)", "Courant (A)"), "", "0,5") + eingabe(host, "gRth", T("Wärmewiderstand Rth (K/W)", "Résistance thermique (K/W)"), "", "50");
    auf(host, ["gR1", "gR2", "gUo", "gI", "gUi", "gUa", "gRth"], rech); rech();
  }
  function rech(){
    const o = $("#rgOut", host), inf = $("#rgInfo", host), I = num($("#gI", host).value) || 0;
    if (m === "lm"){
      const R1 = num($("#gR1", host).value), R2t = num($("#gR2", host).value), Uw = num($("#gUo", host).value);
      if (!(R1 > 0)) { o.innerHTML = ""; return; }
      let R2 = R2t, extra = "";
      if (Uw > 1.25) { R2 = (Uw / 1.25 - 1) * R1; const Rn = nearestE(R2, "E24", "near"); const Un = 1.25 * (1 + Rn / R1) + 50e-6 * Rn; extra = '<div><b>' + esc(fmtSI(R2, "Ω")) + '</b><small>' + T("R2 ideal", "R2 idéale") + '</small></div><div><b>' + esc(fmtSI(Rn, "Ω")) + '</b><small>R2 E24</small></div><div><b>' + fm(Un) + ' V</b><small>' + T("Uout mit E24", "Uout avec E24") + '</small></div>'; R2 = Rn; }
      if (!(R2 >= 0)) { o.innerHTML = ""; return; }
      const U = 1.25 * (1 + R2 / R1) + 50e-6 * R2, Umin = U + 2, P = (Umin - U) * I;
      o.innerHTML = '<div class="stats"><div><b>' + fm(U) + ' V</b><small>Uout</small></div>' + extra + '<div><b>' + fm(Umin, 1) + ' V</b><small>' + T("Uin mindestens (Dropout ≈ 2 V)", "Uin minimale (dropout ≈ 2 V)") + '</small></div><div><b>' + fm(P) + ' W</b><small>' + T("Verlust bei Uin min", "pertes à Uin min") + '</small></div></div>';
      inf.textContent = T("Uout = 1,25 V · (1 + R2/R1) + 50 µA · R2. R1 liegt zwischen OUT und ADJ (typisch 240 Ω), R2 zwischen ADJ und GND. Maximal 1,5 A, ab etwa 0,5 A Kühlkörper.", "Uout = 1,25 V · (1 + R2/R1) + 50 µA · R2. R1 entre OUT et ADJ (typ. 240 Ω), R2 entre ADJ et GND. 1,5 A max., dissipateur dès 0,5 A environ.");
    } else {
      const Ui = num($("#gUi", host).value), Ua = num($("#gUa", host).value), R = num($("#gRth", host).value) || 50;
      if (!(Ui > 0 && Ua >= 0)) { o.innerHTML = ""; return; }
      const P = (Ui - Ua) * I, eta = Ua / Ui * 100;
      o.innerHTML = '<div class="stats"><div><b>' + fm(P) + ' W</b><small>' + T("Verlustleistung", "puissance perdue") + '</small></div><div><b>' + fm(eta, 0) + ' %</b><small>' + T("Wirkungsgrad", "rendement") + '</small></div><div><b>+' + fm(P * R, 0) + ' K</b><small>' + T("Erwärmung (P · Rth)", "échauffement (P · Rth)") + '</small></div></div>';
      inf.textContent = T("P = (Uin − Uout) · I. Ein TO-220 ohne Kühlkörper hat etwa 50 K/W; mit Kühlkörper 5–15 K/W. Mehr als etwa 1 W: Kühlkörper oder Schaltregler nehmen.", "P = (Uin − Uout) · I. Un TO-220 sans dissipateur ≈ 50 K/W ; avec dissipateur 5–15 K/W. Au-delà de 1 W environ : dissipateur ou convertisseur à découpage.");
    }
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

/* ====================================================================== Operationsverstärker (live) */
const OPW = {"inv":{"d":["Das Eingangssignal geht über R1 an den −Eingang, R2 koppelt vom Ausgang zurück. Der +Eingang liegt auf Masse. Die Verstärkung wird nur von den beiden Widerständen bestimmt.","Le signal d'entrée va par R1 à l'entrée −, R2 reboucle depuis la sortie. L'entrée + est à la masse. Le gain n'est déterminé que par les deux résistances."],"forms":["V = − Rf / R1","Uaus = − Uein · Rf / R1","Eingangswiderstand ≈ R1"],"notes":[["Der −Eingang ist eine „virtuelle Masse“: er bleibt (fast) auf 0 V, solange der Opamp nicht übersteuert.","L'entrée − est une « masse virtuelle » : elle reste (presque) à 0 V tant que l'ampli-op n'est pas saturé."],["Der Eingangswiderstand ist R1, die Signalquelle wird also belastet.","La résistance d'entrée est R1 : la source du signal est donc chargée."],["Schaltungen mit Opamp: Versorgung nicht eingezeichnet. Bei einer einzigen Versorgung (z. B. 5 V) muss der Eingang auf eine Hilfsspannung (halbe Versorgung) statt auf GND gelegt werden, wenn auch negative Signale vorkommen.","Montages à ampli-op : alimentation non dessinée. Avec une alimentation unique (p. ex. 5 V), l'entrée doit être portée à une tension auxiliaire (demi-alimentation) au lieu de GND si des signaux négatifs existent aussi."],["Ausgang kann höchstens bis kurz vor die Versorgung gehen; bei zu großer Verstärkung wird das Signal abgeschnitten.","La sortie ne peut aller que presque jusqu'à l'alimentation ; avec un gain trop grand, le signal est écrêté."]]},"nin":{"d":["Das Signal liegt direkt am +Eingang. Ein Spannungsteiler (Rf und Rg) vom Ausgang an den −Eingang bestimmt die Verstärkung. Sehr hoher Eingangswiderstand.","Le signal est directement sur l'entrée +. Un diviseur de tension (Rf et Rg) de la sortie vers l'entrée − fixe le gain. Résistance d'entrée très élevée."],"forms":["V = 1 + Rf / Rg","Uaus = Uein · (1 + Rf / Rg)","Die Verstärkung ist immer ≥ 1."],"notes":[["Eingangswiderstand ist sehr groß (nur der Opamp-Eingang): belastet die Quelle kaum.","La résistance d'entrée est très grande (seulement l'entrée de l'ampli-op) : charge à peine la source."],["Für V = 1 genügt der Spannungsfolger (Rf = 0, Rg weglassen).","Pour V = 1, le suiveur de tension suffit (Rf = 0, omettre Rg)."],["Schaltungen mit Opamp: Versorgung nicht eingezeichnet. Bei einer einzigen Versorgung (z. B. 5 V) muss der Eingang auf eine Hilfsspannung (halbe Versorgung) statt auf GND gelegt werden, wenn auch negative Signale vorkommen.","Montages à ampli-op : alimentation non dessinée. Avec une alimentation unique (p. ex. 5 V), l'entrée doit être portée à une tension auxiliaire (demi-alimentation) au lieu de GND si des signaux négatifs existent aussi."]]},"fol":{"d":["Der Ausgang ist direkt mit dem −Eingang verbunden. Die Ausgangsspannung folgt der Eingangsspannung, kann aber Strom liefern. Zum Entkoppeln hochohmiger Quellen (Sensoren, Potentiometer, Filter).","La sortie est directement reliée à l'entrée −. La tension de sortie suit la tension d'entrée, mais peut fournir du courant. Pour découpler des sources à haute impédance (capteurs, potentiomètres, filtres)."],"forms":["Uaus = Uein","V = 1"],"notes":[["Typische Anwendung: Sensor mit hochohmigem Ausgang vor einen ADC schalten.","Application typique : placer un capteur à sortie haute impédance devant un CAN."],["Opamp muss für Verstärkung 1 stabil sein (die meisten sind es: LM358, TL072, NE5532).","L'ampli-op doit être stable pour un gain de 1 (la plupart le sont : LM358, TL072, NE5532)."],["Schaltungen mit Opamp: Versorgung nicht eingezeichnet. Bei einer einzigen Versorgung (z. B. 5 V) muss der Eingang auf eine Hilfsspannung (halbe Versorgung) statt auf GND gelegt werden, wenn auch negative Signale vorkommen.","Montages à ampli-op : alimentation non dessinée. Avec une alimentation unique (p. ex. 5 V), l'entrée doit être portée à une tension auxiliaire (demi-alimentation) au lieu de GND si des signaux négatifs existent aussi."]]},"sum":{"d":["Mehrere Eingangsspannungen gehen über je einen Widerstand an den −Eingang. Der Ausgang ist die (negative) gewichtete Summe. Basis eines einfachen Mischpults oder DA-Wandlers.","Plusieurs tensions d'entrée vont chacune par une résistance à l'entrée −. La sortie est la somme pondérée (négative). Base d'une petite table de mixage ou d'un CNA."],"forms":["Uaus = − Rf · (U1/R1 + U2/R2)","Bei R1 = R2 = Rf: Uaus = −(U1 + U2)"],"notes":[["Mit einem zweiten invertierenden Verstärker lässt sich das Vorzeichen wieder umkehren.","Avec un second amplificateur inverseur, on peut de nouveau inverser le signe."],["Mit binär gestaffelten Widerständen (R, 2R, 4R, 8R …) entsteht ein einfacher DA-Wandler.","Avec des résistances à échelonnement binaire (R, 2R, 4R, 8R …), on obtient un CNA simple."],["Schaltungen mit Opamp: Versorgung nicht eingezeichnet. Bei einer einzigen Versorgung (z. B. 5 V) muss der Eingang auf eine Hilfsspannung (halbe Versorgung) statt auf GND gelegt werden, wenn auch negative Signale vorkommen.","Montages à ampli-op : alimentation non dessinée. Avec une alimentation unique (p. ex. 5 V), l'entrée doit être portée à une tension auxiliaire (demi-alimentation) au lieu de GND si des signaux négatifs existent aussi."]]},"sub":{"d":["Subtrahiert zwei Eingangsspannungen. Wichtig, um kleine Signale vor großem Gleichtaktrauschen zu messen. Bei gleichen Widerstandspaaren (R1 = R2, Rf = R3) gilt die Formel unten.","Soustrait deux tensions d'entrée. Important pour mesurer de petits signaux malgré un fort bruit de mode commun. Avec des paires de résistances égales (R1 = R2, Rf = R3), la formule ci-dessous s'applique."],"forms":["Uaus = (Rf / R1) · (U2 − U1)","Bedingung: Rf/R1 = R3/R2 (Widerstände genau abgleichen)."],"notes":[["Die Widerstände müssen gut übereinstimmen (1 % oder besser), sonst wird die Gleichtaktunterdrückung schlecht.","Les résistances doivent bien correspondre (1 % ou mieux), sinon le rejet de mode commun est mauvais."],["Für präzise Messungen nimmt man einen Instrumentenverstärker (z. B. INA126, AD620).","Pour des mesures précises, on prend un amplificateur d'instrumentation (p. ex. INA126, AD620)."],["Schaltungen mit Opamp: Versorgung nicht eingezeichnet. Bei einer einzigen Versorgung (z. B. 5 V) muss der Eingang auf eine Hilfsspannung (halbe Versorgung) statt auf GND gelegt werden, wenn auch negative Signale vorkommen.","Montages à ampli-op : alimentation non dessinée. Avec une alimentation unique (p. ex. 5 V), l'entrée doit être portée à une tension auxiliaire (demi-alimentation) au lieu de GND si des signaux négatifs existent aussi."]]},"int":{"d":["Wie der invertierende Verstärker, aber mit Kondensator statt Rückkopplungswiderstand. Ausgang steigt oder fällt gleichmäßig, solange am Eingang eine Gleichspannung liegt. Rechteck am Eingang wird zum Dreieck am Ausgang.","Comme l'amplificateur inverseur, mais avec un condensateur à la place de la résistance de contre-réaction. La sortie monte ou descend régulièrement tant qu'une tension continue est à l'entrée. Un signal rectangulaire à l'entrée devient triangulaire à la sortie."],"forms":["Uaus(t) = − (1 / R·C) · ∫ Uein dt","Bei konstantem Uein: Steigung = − Uein / (R · C)"],"notes":[["Ohne Gegenmaßnahme driftet der Ausgang wegen kleiner Offsetspannungen in die Sättigung: einen großen Widerstand (z. B. 10 · R) parallel zum Kondensator schalten.","Sans contre-mesure, la sortie dérive vers la saturation à cause de petites tensions d'offset : monter une grande résistance (p. ex. 10 · R) en parallèle avec le condensateur."],["Mit einem Reset-Schalter (z. B. CD4066) parallel zu C lässt sich der Wert nullen.","Avec un interrupteur de reset (p. ex. CD4066) en parallèle avec C, on peut remettre la valeur à zéro."],["Schaltungen mit Opamp: Versorgung nicht eingezeichnet. Bei einer einzigen Versorgung (z. B. 5 V) muss der Eingang auf eine Hilfsspannung (halbe Versorgung) statt auf GND gelegt werden, wenn auch negative Signale vorkommen.","Montages à ampli-op : alimentation non dessinée. Avec une alimentation unique (p. ex. 5 V), l'entrée doit être portée à une tension auxiliaire (demi-alimentation) au lieu de GND si des signaux négatifs existent aussi."]]},"dif":{"d":["Kondensator am Eingang, Widerstand in der Rückkopplung. Dreieck am Eingang wird zum Rechteck am Ausgang. In der Praxis rauschempfindlich und neigt zum Schwingen.","Condensateur à l'entrée, résistance dans la contre-réaction. Un triangle à l'entrée devient un rectangle à la sortie. En pratique sensible au bruit et enclin à osciller."],"forms":["Uaus(t) = − R · C · dUein/dt"],"notes":[["Reine Differenzierer schwingen gerne und verstärken Rauschen: einen kleinen Widerstand in Reihe zu C und einen kleinen Kondensator parallel zu Rf einfügen.","Les dérivateurs purs oscillent volontiers et amplifient le bruit : insérer une petite résistance en série avec C et un petit condensateur en parallèle avec Rf."],["Schaltungen mit Opamp: Versorgung nicht eingezeichnet. Bei einer einzigen Versorgung (z. B. 5 V) muss der Eingang auf eine Hilfsspannung (halbe Versorgung) statt auf GND gelegt werden, wenn auch negative Signale vorkommen.","Montages à ampli-op : alimentation non dessinée. Avec une alimentation unique (p. ex. 5 V), l'entrée doit être portée à une tension auxiliaire (demi-alimentation) au lieu de GND si des signaux négatifs existent aussi."]]},"cmp":{"d":["Ohne Rückkopplung springt der Ausgang auf (nahezu) die positive oder negative Versorgung, je nachdem, ob der +Eingang höher oder niedriger als der −Eingang ist. Ein Schwellwert-Schalter.","Sans contre-réaction, la sortie saute à (presque) l'alimentation positive ou négative, selon que l'entrée + est plus haute ou plus basse que l'entrée −. Un interrupteur à seuil."],"forms":["Uein > Uref → Uaus ≈ positive Sättigung","Uein < Uref → Uaus ≈ negative Sättigung (bzw. GND)"],"notes":[["Langsame oder verrauschte Eingangssignale lassen den Ausgang flattern: Hysterese mit Schmitt-Trigger.","Des signaux d'entrée lents ou bruités font battre la sortie : hystérésis avec trigger de Schmitt."],["Für saubere Digitalpegel besser einen echten Komparator (LM393, LM311) als einen Opamp nehmen.","Pour des niveaux numériques propres, prendre plutôt un vrai comparateur (LM393, LM311) qu'un ampli-op."],["Bei LM393 braucht der Ausgang einen Pull-up-Widerstand.","Avec le LM393, la sortie a besoin d'une résistance pull-up."]]},"tia":{"d":["Wandelt den kleinen Strom einer Fotodiode in eine Spannung: Uaus = −I · Rf. Ein Kondensator Cf parallel zu Rf sorgt für Stabilität.","Convertit le petit courant d'une photodiode en tension : Usortie = −I · Rf. Un condensateur Cf en parallèle avec Rf assure la stabilité."],"forms":["Uaus = −Iph · Rf"],"notes":[["Fotodiode: Anode am invertierenden Eingang, Kathode an GND (spannungslos, rauscharm). Für schnellere Signale Kathode an eine positive Spannung legen (Sperrrichtung).","Photodiode : anode à l'entrée inverseuse, cathode à GND (sans tension, faible bruit). Pour des signaux plus rapides, mettre la cathode à une tension positive (sens bloqué)."],["Cf einige pF: begrenzt die Bandbreite und stabilisiert.","Cf quelques pF : limite la bande passante et stabilise."],["Opamp mit niedrigem Eingangsstrom (JFET: TL072) verwenden.","Utiliser un ampli-op à faible courant d'entrée (JFET : TL072)."]]},"hp":{"d":["Ein Kondensator in Reihe, ein Widerstand nach Masse. Gleichanteil wird gesperrt, hohe Frequenzen kommen durch. Typisch: Kopplung von Audiosignalen (Gleichspannung entfernen).","Un condensateur en série, une résistance vers la masse. La composante continue est bloquée, les hautes fréquences passent. Typique : couplage de signaux audio (supprimer le continu)."],"forms":["fg = 1 / (2 · π · R · C)","Dämpfung bei fg: −3 dB","Phase bei fg: +45°","Zeitkonstante τ = R · C"],"notes":[["Als Koppelkondensator: fg deutlich unter der tiefsten Signalfrequenz wählen.","En condensateur de liaison : choisir fc nettement sous la fréquence la plus basse du signal."],["Der Widerstand bestimmt auch den Eingangswiderstand der Stufe.","La résistance fixe aussi la résistance d'entrée de l'étage."]]},"bp":{"d":["Ein Hochpass (C1, R1) legt die untere Grenze fest, ein Tiefpass (R2, C2) die obere. Dazwischen liegt das Durchlassband. Einfach, aber flach (geringe Güte).","Un passe-haut (C1, R1) fixe la limite basse, un passe-bas (R2, C2) la limite haute. Entre les deux se trouve la bande passante. Simple, mais plat (faible facteur de qualité)."],"forms":["f unten = 1 / (2 · π · R1 · C1)","f oben = 1 / (2 · π · R2 · C2)","Die Stufen belasten sich: R2 mindestens 10 × R1 wählen."],"notes":[["Für ein schmales Band: aktive Filter oder LC-Schwingkreise.","Pour une bande étroite : filtres actifs ou circuits oscillants LC."],["Im Durchlassband ist die Verstärkung wegen der Belastung kleiner als 1.","Dans la bande passante, le gain est inférieur à 1 à cause de la charge."]]},"lp":{"d":["Zwei Widerstände und zwei Kondensatoren bilden einen Tiefpass 2. Ordnung (−40 dB pro Dekade) mit einem Opamp als Pufferverstärker.","Deux résistances et deux condensateurs forment un passe-bas du 2e ordre (−40 dB par décade) avec un ampli-op en amplificateur tampon."],"forms":["f₀ = 1 / (2π · √(R1·R2·C1·C2))","Q = √(R1·R2·C1·C2) / (C2 · (R1 + R2))"],"notes":[["f₀ = 1 / (2π · √(R1·R2·C1·C2)). Für Q = 0,707 (Butterworth): C1 = 2 · C2 bei R1 = R2.","f₀ = 1 / (2π · √(R1·R2·C1·C2)). Pour Q = 0,707 (Butterworth) : C1 = 2 · C2 avec R1 = R2."],["Opamp mit ausreichender Bandbreite (GBW ≥ 100 · f₀) wählen.","Choisir un ampli-op de bande passante suffisante (GBW ≥ 100 · f₀)."],["Single-Supply: Eingang und Mitte auf halbe Betriebsspannung legen.","Alimentation simple : mettre l'entrée et le point milieu à la demi-tension de service."]]}};
const WIKI = { sch: "digital/wissen_schmitt" };

function opampTool(host, t0){
  /* ---- Zeichen-Bausteine ---- */
  const P_ = d => '<path d="' + d + '"/>';
  const Rh = (x, y, w, lab, key) => { const a = x + (w - 34) / 2; return P_("M" + x + " " + y + "H" + a) + '<rect x="' + a + '" y="' + (y - 7) + '" width="34" height="14" rx="2"/>' + P_("M" + (a + 34) + " " + y + "H" + (x + w)) + '<text class="lb" x="' + (x + w / 2) + '" y="' + (y - 12) + '" text-anchor="middle">' + lab + '</text>' + (key ? '<text class="iv" data-k="' + key + '" x="' + (x + w / 2) + '" y="' + (y + 25) + '" text-anchor="middle"></text>' : ""); };
  const Rv = (x, y, h, lab, key, lf) => { const a = y + (h - 34) / 2, lx = lf ? x - 12 : x + 12, an = lf ? ' text-anchor="end"' : ""; return P_("M" + x + " " + y + "V" + a) + '<rect x="' + (x - 7) + '" y="' + a + '" width="14" height="34" rx="2"/>' + P_("M" + x + " " + (a + 34) + "V" + (y + h)) + '<text class="lb" x="' + lx + '" y="' + (y + h / 2 - 2) + '"' + an + '>' + lab + '</text>' + (key ? '<text class="iv" data-k="' + key + '" x="' + lx + '" y="' + (y + h / 2 + 12) + '"' + an + '></text>' : ""); };
  const Ch = (x, y, w, lab, key) => { const m = x + w / 2; return P_("M" + x + " " + y + "H" + (m - 4) + "M" + (m + 4) + " " + y + "H" + (x + w)) + P_("M" + (m - 4) + " " + (y - 13) + "V" + (y + 13) + "M" + (m + 4) + " " + (y - 13) + "V" + (y + 13)) + '<text class="lb" x="' + m + '" y="' + (y - 18) + '" text-anchor="middle">' + lab + '</text>' + (key ? '<text class="iv" data-k="' + key + '" x="' + m + '" y="' + (y + 29) + '" text-anchor="middle"></text>' : ""); };
  const GND = (x, y) => P_("M" + x + " " + y + "V" + (y + 8) + "M" + (x - 10) + " " + (y + 8) + "H" + (x + 10) + "M" + (x - 6) + " " + (y + 13) + "H" + (x + 6) + "M" + (x - 2) + " " + (y + 18) + "H" + (x + 2));
  const dot = (x, y) => '<circle class="dt" cx="' + x + '" cy="' + y + '" r="3.2"/>';
  const OA = (x, y) => '<path d="M' + x + ' ' + (y - 40) + 'V' + (y + 40) + 'L' + (x + 70) + ' ' + y + 'Z" class="oa"/><text class="pm" x="' + (x + 7) + '" y="' + (y - 16) + '">−</text><text class="pm" x="' + (x + 7) + '" y="' + (y + 25) + '">+</text>';
  const OAf = (x, y) => '<path d="M' + x + ' ' + (y - 40) + 'V' + (y + 40) + 'L' + (x + 70) + ' ' + y + 'Z" class="oa"/><text class="pm" x="' + (x + 7) + '" y="' + (y - 16) + '">+</text><text class="pm" x="' + (x + 7) + '" y="' + (y + 25) + '">−</text>';
  const term = (x, y, name, key, left) => '<circle class="tm" cx="' + x + '" cy="' + y + '" r="4"/><text class="nm" x="' + x + '" y="' + (y - 14) + '" text-anchor="middle">' + name + '</text><text class="nv" data-k="' + key + '" x="' + (x < 200 && x > 45 ? x - 10 : x) + '" y="' + (x < 200 && x > 45 ? y + 5 : y + 22) + '" text-anchor="' + (x < 200 && x > 45 ? "end" : "middle") + '"></text>';
  const SRC = (x, y, name, key) => '<circle class="oa" cx="' + x + '" cy="' + y + '" r="13"/><path d="M' + (x - 6) + ' ' + y + 'h12M' + x + ' ' + (y - 6) + 'v12" stroke-width="1.4"/><text class="nm" x="' + x + '" y="' + (y - 32) + '" text-anchor="middle">' + name + '</text><text class="nv" data-k="' + key + '" x="' + x + '" y="' + (y - 19) + '" text-anchor="middle"></text>';
  const rails = '';
  /* gemeinsam: Opamp bei (190,110), Ausgang (260,110) → Klemme (340,110) */
  const OUT = (y, dx) => P_("M260 " + y + "H" + (338 + (dx || 0))) + term(344 + (dx || 0), y, "Uout", "uout");
  const fmtV = v => fmtSI(v, "V", 3), fmtI = v => fmtSI(v, "A", 3);

  const TYPES = [
    { id: "inv", ic: "−", name: T("Invertierend", "Inverseur"), sig: ["V", "Uin"],
      info: T("Das Signal wird um das Verhältnis Rf/Rin verstärkt und gedreht (Phase 180°). Der −Eingang liegt durch die Gegenkopplung auf 0 V („virtuelle Masse“); der Eingangswiderstand ist Rin.", "Le signal est amplifié du rapport Rf/Rin et inversé (180°). L’entrée − est à 0 V (masse virtuelle) ; l’impédance d’entrée vaut Rin."),
      formel: "Uout = −Rf/Rin · Uin",
      p: [["Rin", "10k", "Rin (Ω)"], ["Rf", "47k", "Rf (Ω)"]],
      draw: () => term(58, 90, "Uin", "uin") + P_("M58 90H70") + Rh(70, 90, 70, "Rin", "iRin") + P_("M140 90H190") + dot(160, 90) + P_("M160 90V40") + Rh(160, 40, 100, "Rf", "iRf") + P_("M260 40V110") + dot(260, 110) + OA(190, 110) + P_("M190 130H170V160") + GND(170, 160) + '<text class="vm" x="186" y="112" text-anchor="end">≈ 0 V</text>' + OUT(110) + rails,
      sim: (q, u) => ({ y: -q.Rf / q.Rin * u }), cur: (q, u) => ({ iRin: u / q.Rin, iRf: u / q.Rin }),
      stats: q => ({ G: -q.Rf / q.Rin, zin: q.Rin, note: T("Phase um 180° gedreht", "phase inversée de 180°") }) },
    { id: "nin", ic: "+", name: T("Nicht-invertierend", "Non-inverseur"), sig: ["V", "Uin"],
      info: T("Das Signal wird verstärkt und bleibt in Phase. Die Verstärkung ist immer mindestens 1. Der Eingangswiderstand ist sehr hoch (Eingang des Opamps).", "Le signal est amplifié sans inversion. Le gain est toujours ≥ 1. L’impédance d’entrée est très élevée."),
      formel: "Uout = (1 + Rf/R1) · Uin",
      p: [["R1", "10k", "R1 gegen Masse (Ω)"], ["Rf", "47k", "Rf (Ω)"]],
      draw: () => term(58, 90, "Uin", "uin") + P_("M58 90H190") + OAf(190, 110) + P_("M190 130H160V170") + dot(160, 130) + Rh(160, 170, 100, "Rf", "iRf") + P_("M260 170V110") + dot(260, 110) + P_("M160 130H112") + Rh(60, 130, 52, "R1", "iR1").replace(/<text class="iv"[^>]*><\/text>/, "") + GND(60, 130) + OUT(110) + rails,
      sim: (q, u) => ({ y: (1 + q.Rf / q.R1) * u }), cur: (q, u, y) => ({ iR1: u / q.R1, iRf: u / q.R1 }),
      stats: q => ({ G: 1 + q.Rf / q.R1, zin: Infinity, note: T("gleiche Phase", "même phase") }) },
    { id: "fol", ic: "1", name: T("Spannungsfolger", "Suiveur"), sig: ["V", "Uin"],
      info: T("Verstärkung genau 1, aber sehr hoher Eingangs- und kleiner Ausgangswiderstand: ein Impedanzwandler, der eine schwache Quelle ohne Belastung puffert.", "Gain exactement 1, impédance d’entrée très élevée et sortie faible : un adaptateur d’impédance."),
      formel: "Uout = Uin",
      p: [],
      draw: () => term(58, 130, "Uin", "uin") + P_("M58 130H190") + OA(190, 110) + P_("M190 90H160V50H300V110") + dot(260, 110) + dot(300, 110) + P_("M260 110H338") + term(344, 110, "Uout", "uout") + rails,
      sim: (q, u) => ({ y: u }), cur: () => ({}), stats: () => ({ G: 1, zin: Infinity, note: T("Impedanzwandler", "adaptateur d’impédance") }) },
    { id: "sum", ic: "Σ", name: T("Addierer", "Sommateur"), sig: ["V", "U1"],
      info: T("Jede Eingangsspannung wird einzeln mit Rf/Rn verstärkt und gedreht, am −Eingang addieren sich die Ströme. Der Mischer in der Audiotechnik.", "Chaque entrée est amplifiée par Rf/Rn et inversée ; les courants s’additionnent. Le mélangeur de l’audio."),
      formel: "Uout = −Rf · (U1/R1 + U2/R2 + U3/R3)",
      p: [["R1", "10k", "R1 (Ω)"], ["R2", "10k", "R2 (Ω)"], ["R3", "10k", "R3 (Ω)"], ["Rf", "10k", "Rf (Ω)"], ["U2", "0,5", "U2 (V, fest)"], ["U3", "-0,2", "U3 (V, fest)"]],
      vb: "-40 -8 440 255",
      draw: () => term(36, 60, "U1", "uin") + P_("M36 60 H64") + Rh(64, 60, 86, "R1", "iR1") + term(36, 110, "U2", "u2") + P_("M36 110 H64") + Rh(64, 110, 86, "R2", "iR2") + term(36, 160, "U3", "u3") + P_("M36 160 H64") + Rh(64, 160, 86, "R3", "iR3") + P_("M150 60V160H190") + dot(150, 110) + dot(150, 60) + dot(150, 160) + P_("M150 60V20H165") + Rh(165, 20, 90, "Rf", "iRf") + P_("M255 20H260V180") + OA(190, 180) + P_("M190 200H170V218") + GND(170, 218) + P_("M260 180H338") + dot(260, 180) + term(344, 180, "Uout", "uout"),
      sim: (q, u) => ({ y: -q.Rf * (u / q.R1 + q.U2 / q.R2 + q.U3 / q.R3) }), cur: (q, u) => ({ iR1: u / q.R1, iR2: q.U2 / q.R2, iR3: q.U3 / q.R3 }),
      stats: q => ({ G: -q.Rf / q.R1, zin: q.R1, note: T("Verstärkung gilt für U1; U2/U3 haben −Rf/R2 bzw. −Rf/R3", "le gain vaut pour U1 ; U2/U3 : −Rf/R2 et −Rf/R3") }), rfKey: 1 },
    { id: "sub", ic: "Δ", name: T("Subtrahierer", "Soustracteur"), sig: ["V", "U1"],
      info: T("Der Differenzverstärker bildet die Differenz zweier Spannungen und unterdrückt, was beide gemeinsam haben (Gleichtakt). Mit R1 = R3 und R2 = Rf ist Uout = Rf/R1 · (U2 − U1).", "L’amplificateur différentiel forme la différence de deux tensions et rejette le mode commun."),
      formel: "Uout = Rf/R1 · (U2 − U1)",
      p: [["R1", "10k", "R1 (Ω, beide Eingänge)"], ["Rf", "10k", "Rf = R2 (Ω, Rückkopplung und gegen Masse)"], ["U2", "1", "U2 (V, fest)"]],
      draw: () => term(36, 70, "U1", "uin") + P_("M36 70 H64") + Rh(64, 70, 86, "R1", "iR1") + P_("M150 70H160V20H165") + dot(160, 70) + P_("M160 70V90H190") + Rh(165, 20, 95, "Rf", "iRf") + P_("M260 20V110") + dot(260, 110) + term(36, 150, "U2", "u2") + P_("M36 150 H64") + Rh(64, 150, 86, "R1", "iR2") + P_("M150 150H160V130H190") + dot(160, 150) + Rv(160, 150, 40, "Rf", "") + GND(160, 190) + OA(190, 110) + OUT(110) + rails,
      sim: (q, u) => ({ y: q.Rf / q.R1 * (q.U2 - u) }), cur: (q, u) => ({ iR1: u / q.R1 }),
      stats: q => ({ G: q.Rf / q.R1, zin: q.R1, note: T("Verstärkung der Differenz (U2 − U1)", "gain de la différence (U2 − U1)") }) },
    { id: "int", ic: "∫", name: T("Integrierer", "Intégrateur"), sig: ["V", "Uin"],
      info: T("Der Kondensator in der Rückkopplung summiert den Eingangsstrom auf: Die Ausgangsspannung ist das Zeitintegral der Eingangsspannung. Ein Rechteck wird zum Dreieck, eine Gleichspannung zur Rampe, bis der Ausgang an die Versorgung stößt.", "Le condensateur en contre-réaction intègre le courant : une sortie en rampe pour une tension continue, un triangle pour un signal carré."),
      formel: "Uout(t) = −1/(R·C) · ∫ Uin dt",
      p: [["R", "10k", "R (Ω)"], ["C", "10n", "C (F)"]],
      draw: () => term(58, 90, "Uin", "uin") + P_("M58 90H70") + Rh(70, 90, 70, "R", "iR") + P_("M140 90H190") + dot(160, 90) + P_("M160 90V40") + Ch(160, 40, 100, "C", "") + P_("M260 40V110") + dot(260, 110) + OA(190, 110) + P_("M190 130H170V160") + GND(170, 160) + OUT(110) + rails,
      dyn: true, sim: (q, u, st, dt) => { st.v = (st.v || 0) - u / (q.R * q.C) * dt; return { y: st.v, clipState: true }; }, cur: (q, u) => ({ iR: u / q.R }),
      stats: q => ({ G: null, zin: q.R, note: T("Steigung = −Uin/(R·C)", "pente = −Uin/(R·C)"), tau: q.R * q.C }) },
    { id: "dif", ic: "d/dt", name: T("Differenzierer", "Dérivateur"), sig: ["V", "Uin"],
      info: T("Der Kondensator am Eingang lässt nur Änderungen durch: Der Ausgang zeigt die Steilheit des Eingangssignals. Ein Dreieck wird zum Rechteck, ein Rechteck zu Nadelimpulsen. Rauschempfindlich, in der Praxis mit kleinem Serienwiderstand.", "Le condensateur d’entrée ne laisse passer que les variations : la sortie reflète la pente du signal."),
      formel: "Uout(t) = −R·C · dUin/dt",
      p: [["R", "10k", "R (Ω)"], ["C", "10n", "C (F)"]],
      draw: () => term(58, 90, "Uin", "uin") + P_("M58 90H70") + Ch(70, 90, 70, "C", "iC") + P_("M140 90H190") + dot(160, 90) + P_("M160 90V40") + Rh(160, 40, 100, "R", "iR") + P_("M260 40V110") + dot(260, 110) + OA(190, 110) + P_("M190 130H170V160") + GND(170, 160) + OUT(110) + rails,
      dyn: true, sim: (q, u, st, dt) => { const d = st.u0 === undefined ? 0 : (u - st.u0) / dt; st.u0 = u; return { y: -q.R * q.C * d }; }, cur: (q, u, y) => ({ iC: -y / q.R, iR: -y / q.R }),
      stats: q => ({ G: null, zin: null, note: T("Verstärkung steigt mit der Frequenz: |G| = 2π·f·R·C", "gain croissant avec la fréquence : |G| = 2π·f·R·C"), tau: q.R * q.C }) },
    { id: "lp", ic: "〰", name: T("Aktiver Tiefpass", "Passe-bas actif"), sig: ["V", "Uin"],
      info: T("Ein invertierender Verstärker mit Kondensator parallel zu Rf: Tiefe Frequenzen werden mit Rf/Rin verstärkt, hohe fallen oberhalb der Grenzfrequenz mit 20 dB je Dekade ab.", "Un inverseur avec un condensateur en parallèle de Rf : filtre passe-bas actif du 1er ordre."),
      formel: "G = −Rf/Rin ; fg = 1/(2π·Rf·Cf)",
      p: [["Rin", "10k", "Rin (Ω)"], ["Rf", "47k", "Rf (Ω)"], ["Cf", "1n", "Cf (F)"]],
      vb: "-40 -14 440 220",
      draw: () => term(58, 90, "Uin", "uin") + P_("M58 90H70") + Rh(70, 90, 70, "Rin", "iRin") + P_("M140 90H190") + dot(160, 90) + P_("M160 90V14H185M235 14H260V110M160 56H185M235 56H260") + Ch(185, 14, 50, "Cf", "") + Rh(185, 56, 50, "Rf", "") + dot(160, 56) + dot(260, 56) + dot(260, 110) + OA(190, 110) + P_("M190 130H170V160") + GND(170, 160) + OUT(110) + rails,
      dyn: true, sim: (q, u, st, dt) => { const tau = q.Rf * q.Cf, n = Math.max(1, Math.ceil(dt / (tau / 20))), h = dt / n; let y = st.y || 0; for (let k = 0; k < n; k++) y += (-q.Rf / q.Rin * u - y) / tau * h; st.y = y; return { y, clipState: true }; }, cur: (q, u) => ({ iRin: u / q.Rin }),
      stats: q => ({ G: -q.Rf / q.Rin, zin: q.Rin, note: T("Grenzfrequenz fg = ", "fréquence de coupure fg = ") + fmtSI(1 / (2 * Math.PI * q.Rf * q.Cf), "Hz"), tau: q.Rf * q.Cf }) },
    { id: "cmp", ic: "⏚", name: T("Komparator", "Comparateur"), sig: ["V", "Uin"],
      info: T("Ohne Rückkopplung vergleicht der Opamp nur: Ist Uin größer als Uref, springt der Ausgang an die positive Versorgung, sonst an die negative. Kein Verstärker, sondern ein Schalter.", "Sans contre-réaction l’ampli compare seulement : la sortie bascule vers l’alimentation positive ou négative."),
      formel: "Uout = +Usat wenn Uin > Uref, sonst −Usat",
      p: [["Uref", "0", "Uref (V)"]],
      draw: () => term(58, 130, "Uin", "uin") + P_("M58 130H190") + SRC(130, 66, "Uref", "uref") + P_("M143 66H165V90H190") + P_("M130 79V92") + GND(130, 92) + OA(190, 110) + OUT(110) + rails,
      sim: (q, u, st, dt, S) => ({ y: u > q.Uref ? S.lim : -S.lim }), cur: () => ({}), stats: () => ({ G: null, zin: Infinity, note: T("Ausgang springt an die Versorgungsgrenzen", "la sortie bascule aux limites d’alimentation") }) },
    { id: "sch", ic: "⎍", name: T("Schmitt-Trigger", "Trigger de Schmitt"), sig: ["V", "Uin"],
      info: T("Mitkopplung über R2 erzeugt zwei Schaltschwellen (Hysterese): Das Signal muss erst über die obere Schwelle steigen und dann unter die untere fallen, bevor der Ausgang kippt. Rauschen und Prellen stören nicht mehr.", "La réaction positive crée deux seuils (hystérésis) : le bruit ne fait plus basculer la sortie."),
      formel: "U_H/U_L = Uref·(1 + R1/R2) ± Usat · R1/R2",
      p: [["R1", "10k", "R1 (Ω)"], ["R2", "47k", "R2 (Ω)"], ["Uref", "0", "Uref (V)"]],
      draw: () => term(58, 130, "Uin", "uin") + P_("M58 130H70") + Rh(70, 130, 80, "R1", "iR1") + P_("M150 130H190") + dot(165, 130) + Rv(165, 130, 60, "R2", "iR2", 1) + P_("M165 190H300V110") + SRC(110, 52, "Uref", "uref") + P_("M123 52H165V90H190") + P_("M110 65V77") + GND(110, 77) + OA(190, 110) + P_("M260 110H338") + dot(260, 110) + dot(300, 110) + term(344, 110, "Uout", "uout") + rails,
      sim: (q, u, st, dt, S) => { const k = q.R1 / q.R2, hi = q.Uref * (1 + k) + S.lim * k, lo = q.Uref * (1 + k) - S.lim * k; if (st.s === undefined) st.s = -1; if (u > hi) st.s = 1; else if (u < lo) st.s = -1; return { y: st.s * S.lim }; }, cur: () => ({}),
      stats: (q, S) => { const k = q.R1 / q.R2; return { G: null, zin: q.R1 + q.R2, note: T("Schwellen: ", "seuils : ") + fmtSI(q.Uref * (1 + k) - S.lim * k, "V") + " / " + fmtSI(q.Uref * (1 + k) + S.lim * k, "V") + " (" + T("Hysterese ", "hystérésis ") + fmtSI(2 * S.lim * k, "V") + ")" }; } },
    { id: "tia", ic: "I→U", name: T("Transimpedanz", "Transimpédance"), sig: ["µA", "Iin"],
      info: T("Wandelt einen kleinen Strom (z. B. Fotodiode) in eine Spannung. Die Quelle sieht eine virtuelle Masse, Uout = −Iin · Rf. Für schnelle Fotodioden kommt ein kleiner Kondensator parallel zu Rf.", "Convertit un courant (photodiode) en tension : Uout = −Iin · Rf."),
      formel: "Uout = −Iin · Rf",
      p: [["Rf", "100k", "Rf (Ω)"]],
      draw: () => '<circle class="oa" cx="80" cy="90" r="16"/><path d="M80 98V82M75 87l5-6 5 6" stroke-width="1.4"/><text class="nm" x="80" y="63" text-anchor="middle">Iin</text><text class="nv" data-k="uin" x="58" y="95" text-anchor="end"></text>' + P_("M96 90H190") + dot(160, 90) + P_("M160 90V40") + Rh(160, 40, 100, "Rf", "iRf") + P_("M260 40V110") + dot(260, 110) + P_("M80 106V150") + GND(80, 150) + OA(190, 110) + P_("M190 130H170V160") + GND(170, 160) + OUT(110) + rails,
      sim: (q, u) => ({ y: -q.Rf * u * 1e-6 }), cur: (q, u) => ({ iRf: u * 1e-6 }), stats: q => ({ G: null, zin: 0, note: T("Transimpedanz = −Rf = ", "transimpédance = −Rf = ") + fmtSI(q.Rf, "V/A") }), uscale: 1e-6 }
  ];
  const lc = (k, f) => '<option value="' + k + '"' + '>' + f + '</option>';
  let typ = t0 || (/^#opamp\/(\w+)/.exec(location.hash) || [0, "inv"])[1], sg = { k: "sin", A: "0,5", f: "1k", off: "0" }, vs = "12", sel = null, tAnim = 0, raf = 0, play = true, SIM = null;
  const tdef = () => TYPES.find(x => x.id === typ);
  let vals = {}; // je Typ gemerkte Parameter
  host.innerHTML = SAFE() + '<div class="opw"><div class="opl"><div class="tabs" id="opTab"></div><div id="opIn"></div></div><div class="opr"><div id="opSvg"></div><div id="opStats"></div></div></div><div id="opPlot"></div><p class="hint" id="opInfo"></p>' +
    '<style>.opw{display:grid;grid-template-columns:minmax(240px,300px) 1fr;gap:16px;align-items:start}@media(max-width:760px){.opw{grid-template-columns:1fr}}#opTab{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}#opTab .btn{padding:8px 6px;font-size:13px;display:flex;gap:6px;align-items:center;justify-content:flex-start;text-align:left}#opTab .btn i{font-style:normal;font-weight:800;min-width:1.7em;text-align:center;border-radius:8px;background:rgba(0,0,0,.08);padding:1px 4px;font-size:12px}.opsvg{width:100%;height:auto;display:block;background:var(--card,#fff);border:2px solid var(--line,#ccd);border-radius:14px;color:var(--fg,#223)}.opsvg path,.opsvg rect,.opsvg circle.oa{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.opsvg path.oa{fill:rgba(46,134,255,.10)}.opsvg .dt{fill:currentColor;stroke:none}.opsvg .tm{fill:var(--card,#fff);stroke:currentColor;stroke-width:2}.opsvg text{font:600 11.5px system-ui,sans-serif;fill:currentColor}.opsvg .pm{font-size:15px;font-weight:800}.opsvg .iv{fill:#e8590c;font-size:11px;font-weight:700}.opsvg .nv{fill:#2e86ff;font-size:12px;font-weight:800}.opsvg .nm{font-size:12px;font-weight:800}.opsvg .vm{font-size:10.5px;fill:#2b8a3e;font-style:italic}.opsvg .sp{font-size:10px;opacity:.6}.opplot{width:100%;height:auto;display:block;margin-top:10px;background:var(--card,#fff);border:2px solid var(--line,#ccd);border-radius:14px;color:var(--fg,#223)}.opplot text{font:600 11px system-ui,sans-serif;fill:currentColor}.opplot .g{stroke:currentColor;opacity:.15;fill:none}.opplot .ax{stroke:currentColor;opacity:.5;fill:none}.opw2{margin-top:10px;font-size:14px;line-height:1.5}.opw2 summary{cursor:pointer;font-weight:700}.opw2 code{font-weight:700}.opw2 ul{margin:6px 0;padding-left:20px}</style>';
  function readP(){ const q = {}; (tdef().p || []).forEach(p => { q[p[0]] = num($("#op_" + p[0], host).value); }); return q; }
  function maske(){
    $("#opTab", host).innerHTML = TYPES.map(t => '<button class="btn' + (t.id === typ ? " on" : "") + '" data-t="' + t.id + '"><i>' + esc(t.ic) + '</i>' + esc(t.name) + '</button>').join("");
    $$("#opTab button", host).forEach(b => b.onclick = () => { vals[typ] = readSave(); typ = b.dataset.t; maske(); });
    const t = tdef(), sv = vals[typ] || {};
    const unit = t.sig[0], nm = t.sig[1];
    $("#opIn", host).innerHTML = '<h3 style="margin:12px 0 4px">' + T("Bauteile", "Composants") + '</h3>' + (t.p.length ? t.p.map(p => eingabe(host, "op_" + p[0], p[2], "", sv[p[0]] !== undefined ? sv[p[0]] : p[1])).join("") : '<p class="hint">' + T("Keine Bauteile – nur der Opamp.", "Aucun composant – seulement l’ampli.") + '</p>') +
      '<h3 style="margin:14px 0 4px">' + T("Eingangssignal ", "Signal d’entrée ") + esc(nm) + '</h3><label class="l" for="op_k">' + T("Signalform", "Forme") + '</label><select class="in" id="op_k"><option value="sin">' + T("Sinus", "Sinus") + '</option><option value="rect">' + T("Rechteck", "Carré") + '</option><option value="dc">' + T("Gleichspannung", "Continu") + '</option></select>' +
      eingabe(host, "op_A", (unit === "V" ? T("Amplitude (V)", "Amplitude (V)") : T("Amplitude (µA)", "Amplitude (µA)")), "", sg.A) + eingabe(host, "op_f", T("Frequenz (Hz)", "Fréquence (Hz)"), "", sg.f) + eingabe(host, "op_off", T("Offset (V)", "Offset (V)"), "", sg.off) +
      '<h3 style="margin:14px 0 4px">' + T("Versorgung", "Alimentation") + '</h3>' + eingabe(host, "op_vs", "± Vs (V)", "", vs) + '<button class="btn" id="opPlay" style="margin-top:10px;width:100%">' + (play ? "⏸ " + T("Anhalten", "Pause") : "▶ " + T("Abspielen", "Lecture")) + '</button>';
    $("#op_k", host).value = sg.k;
    auf(host, t.p.map(p => "op_" + p[0]).concat(["op_k", "op_A", "op_f", "op_off", "op_vs"]), neu);
    $("#opPlay", host).onclick = () => { play = !play; $("#opPlay", host).textContent = (play ? "⏸ " + T("Anhalten", "Pause") : "▶ " + T("Abspielen", "Lecture")); };
    $("#opInfo", host).innerHTML = '<b>' + esc(t.name) + ':</b> ' + esc(t.info) + '<br><code style="font-size:15px">' + esc(t.formel) + '</code>' + (OPW[t.id] ? '<details class="opw2" open><summary>📖 ' + T("Erklärung, Formeln und Hinweise", "Explication, formules et conseils") + '</summary><p>' + esc(T(OPW[t.id].d[0], OPW[t.id].d[1])) + '</p>' + (OPW[t.id].forms.length ? '<ul>' + OPW[t.id].forms.map(f => '<li><code>' + esc(f) + '</code></li>').join("") + '</ul>' : '') + (OPW[t.id].notes.length ? '<ul>' + OPW[t.id].notes.map(n => '<li>' + esc(T(n[0], n[1])) + '</li>').join("") + '</ul>' : '') + '</details>' : '') + (WIKI[t.id] ? '<br><a href="index.html#/s/' + WIKI[t.id] + '">📖 ' + T("Hintergrund, Anwendungen und Hinweise", "Contexte, applications et conseils") + '</a>' : '') + '<br><a href="index.html#/s/bt_analog/opamp">🔧 ' + T("Grundwissen und Opamp-Typen (Bauteile)", "Bases et types d’ampli op (composants)") + '</a>';
    const dr = t.draw(), tms = dr.match(/<circle class="tm"[^>]*\/>/g) || [];
    $("#opSvg", host).innerHTML = '<svg class="opsvg" viewBox="' + (t.vb || "-40 -8 440 212") + '" role="img" aria-label="' + esc(t.name) + '">' + dr.replace(/<circle class="tm"[^>]*\/>/g, "") + tms.join("") + '</svg>';
    neu();
  }
  function readSave(){ const o = {}; tdef().p.forEach(p => { const e = $("#op_" + p[0], host); if (e) o[p[0]] = e.value; }); const k = $("#op_k", host); if (k) { sg = { k: k.value, A: $("#op_A", host).value, f: $("#op_f", host).value, off: $("#op_off", host).value }; vs = $("#op_vs", host).value; } return o; }
  function neu(){
    const t = tdef(), q = readP(); readSave();
    const A = num(sg.A), f = Math.max(num(sg.f), 1e-3), off = num(sg.off) || 0, Vs = num(vs);
    const bad = t.p.some(p => !(q[p[0]] > 0) && !(p[0].charAt(0) === "U" && isFinite(q[p[0]]))) || !isFinite(A) || !isFinite(Vs) || Vs <= 0;
    if (bad) { $("#opStats", host).innerHTML = '<p class="warn">' + T("Bitte gültige Werte eingeben (Widerstände > 0).", "Saisis des valeurs valides (résistances > 0).") + '</p>'; SIM = null; return; }
    const lim = Math.max(0.5, Vs - 1.5), S = { lim }, N = 480, st = {};
    const tau = (t.stats(q, S).tau) || 0;
    const win = sg.k === "dc" ? (t.dyn ? Math.max(5 * tau, 1e-6) : 1) : 3 / f;
    const dt = win / N, U = new Array(N), Y = new Array(N), C = new Array(N), Ysat = new Array(N);
    for (let i = 0; i < N; i++) {
      const tt = i * dt, ph = (tt * f) % 1;
      let u = sg.k === "dc" ? A : sg.k === "sin" ? A * Math.sin(2 * Math.PI * tt * f) : (ph < 0.5 ? A : -A);
      u += off; U[i] = u;
      const r = t.sim(q, u * (t.uscale ? 1 : 1), st, dt, S); let y = r.y;
      if (y > lim) y = lim; if (y < -lim) y = -lim;
      if (r.clipState) { st.v = y; st.y = y; }
      Y[i] = y; C[i] = t.cur(q, u, y, S);
    }
    SIM = { U, Y, C, N, win, lim, t, q, unit: t.sig[0], tdt: dt };
    // Kennwerte
    const st2 = t.stats(q, S), ymax = Math.max.apply(null, Y.map(Math.abs)), clipped = Y.some(y => Math.abs(y) >= lim - 1e-9) && t.id !== "cmp" && t.id !== "sch";
    const row = (b, s) => '<div><b>' + b + '</b><small>' + s + '</small></div>';
    $("#opStats", host).innerHTML = '<div class="stats">' + (st2.G != null ? row(esc(st2.G.toLocaleString(loc(), { maximumSignificantDigits: 4 })) + "×", T("Verstärkung", "Gain")) + row(esc((20 * Math.log10(Math.abs(st2.G))).toLocaleString(loc(), { maximumSignificantDigits: 3 })) + " dB", "20·log |G|") : "") + (st2.zin != null ? row(st2.zin === Infinity ? "≈ ∞" : esc(fmtSI(st2.zin, "Ω")), T("Eingangswiderstand", "Impédance d’entrée")) : "") + row(esc(fmtSI(ymax, "V")), T("Ausgang max.", "Sortie max.")) + (tau ? row(esc(fmtSI(tau, "s")), "τ") : "") + '</div><p class="hint" style="margin:6px 0 0">' + esc(st2.note || "") + '</p>' + (clipped ? '<p class="warn">⚠ ' + T("Der Ausgang stößt an die Versorgung (±" + fmtSI(lim, "V") + ") und wird abgeschnitten – Verstärkung oder Eingang verkleinern, oder höhere Versorgung wählen.", "La sortie atteint l’alimentation (±" + fmtSI(lim, "V") + ") et est écrêtée.") + '</p>' : '');
    plot(); bild(0);
  }
  function plot(){
    const s = SIM; if (!s) { $("#opPlot", host).innerHTML = ""; return; }
    const W = 760, H = 250, x0 = 52, x1 = W - 12, y0 = 34, y1 = H - 34, N = s.N;
    const um0 = Math.max.apply(null, s.U.map(Math.abs)), ym = Math.max.apply(null, s.Y.map(Math.abs)), fk = s.unit === "V" ? 1 : Math.max(ym, 0.1) / Math.max(um0, 1e-9), um = um0 * fk;
    let m = Math.max(um, Math.min(ym, s.lim * 1.05), 0.2) * 1.15; if (!isFinite(m) || m <= 0) m = 1;
    const X = i => x0 + (x1 - x0) * i / (N - 1), Yp = v => (y0 + y1) / 2 - (v / m) * (y1 - y0) / 2;
    const pl = (A, cl) => '<polyline fill="none" stroke="' + cl + '" stroke-width="2.2" stroke-linejoin="round" points="' + A.map((v, i) => X(i).toFixed(1) + "," + Yp(Math.max(-m, Math.min(m, v))).toFixed(1)).join(" ") + '"/>';
    let g = ""; for (let k = -2; k <= 2; k++) g += '<line class="g" x1="' + x0 + '" x2="' + x1 + '" y1="' + Yp(k * m / 2.3).toFixed(1) + '" y2="' + Yp(k * m / 2.3).toFixed(1) + '"/><text x="' + (x0 - 6) + '" y="' + (Yp(k * m / 2.3) + 4).toFixed(1) + '" text-anchor="end">' + fmtSI(k * m / 2.3, "").trim() + '</text>';
    for (let k = 0; k <= 3; k++) g += '<line class="g" y1="' + y0 + '" y2="' + y1 + '" x1="' + (x0 + (x1 - x0) * k / 3) + '" x2="' + (x0 + (x1 - x0) * k / 3) + '"/><text x="' + (x0 + (x1 - x0) * k / 3) + '" y="' + (H - 16) + '" text-anchor="middle">' + fmtSI(s.win * k / 3, "s") + '</text>';
    const rl = (v) => Math.abs(v) < m ? '<line stroke="#c92a2a" stroke-dasharray="5 4" opacity=".6" x1="' + x0 + '" x2="' + x1 + '" y1="' + Yp(v) + '" y2="' + Yp(v) + '"/>' : "";
    $("#opPlot", host).innerHTML = '<svg class="opplot" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + T("Eingang und Ausgang über der Zeit", "Entrée et sortie dans le temps") + '"><line class="ax" x1="' + x0 + '" x2="' + x0 + '" y1="' + y0 + '" y2="' + y1 + '"/><line class="ax" x1="' + x0 + '" x2="' + x1 + '" y1="' + Yp(0) + '" y2="' + Yp(0) + '"/>' + g + rl(s.lim) + rl(-s.lim) + pl(s.U.map(v => v * fk), "#2e86ff") + pl(s.Y, "#ff7a00") + '<line id="opCur" stroke="currentColor" stroke-width="1.5" opacity=".7" y1="' + y0 + '" y2="' + y1 + '" x1="' + x0 + '" x2="' + x0 + '"/><text x="' + (x0 + 6) + '" y="18" fill="#2e86ff" style="fill:#2e86ff;font-weight:800">— ' + (s.unit === "V" ? "Uin" : "Iin (" + T("skaliert", "à l’échelle") + ")") + '</text><text x="' + (x0 + 190) + '" y="18" style="fill:#ff7a00;font-weight:800">— Uout</text><text x="' + (x1 - 4) + '" y="18" text-anchor="end" style="fill:#c92a2a;font-weight:700">- - ±' + fmtSI(s.lim, "V") + '</text></svg>';
  }
  function bild(i){
    const s = SIM; if (!s) return;
    const set = (k, v) => { $$('[data-k="' + k + '"]', host).forEach(e => { e.textContent = v; }); };
    const u = s.U[i], y = s.Y[i], c = s.C[i] || {}, q = s.q;
    set("uin", s.unit === "V" ? fmtV(u) : fmtSI(u * 1e-6, "A", 3)); set("uout", fmtV(y));
    set("u2", fmtV(q.U2)); set("u3", fmtV(q.U3)); set("uref", fmtV(q.Uref));
    Object.keys(c).forEach(k => set(k, fmtI(c[k])));
    const cur = $("#opCur", host); if (cur) { const W = 760, x0 = 52, x1 = W - 12, X = x0 + (x1 - x0) * i / (s.N - 1); cur.setAttribute("x1", X); cur.setAttribute("x2", X); }
  }
  function loop(ts){
    if (!document.body.contains(host)) return;
    if (SIM && play) { const T0 = 7000, i = Math.floor((ts % T0) / T0 * SIM.N); if (i !== tAnim) { tAnim = i; bild(i); } }
    raf = requestAnimationFrame(loop);
  }
  maske(); raf = requestAnimationFrame(loop);
}

/* ====================================================================== Rahmen */
const TOOLS = [
  ["farbcode", "🌈", "#e0527a", T("Widerstands-Farbcode", "Code couleur des résistances"), T("Ringe antippen oder Wert eingeben – 4, 5 und 6 Ringe, mit Toleranz.", "Touche les anneaux ou saisis une valeur – 4, 5 et 6 anneaux, avec tolérance."), resTool],
  ["ohm", "⚡", "#ff8c1a", T("Ohm & Leistung", "Ohm et puissance"), T("Zwei Werte eingeben, U, I, R und P werden berechnet.", "Saisis deux valeurs : U, I, R et P sont calculés."), ohmTool],
  ["led", "💡", "#f2b100", T("LED-Vorwiderstand", "Résistance pour LED"), T("Welchen Widerstand braucht deine LED? Mit Normwert und Watt-Angabe.", "Quelle résistance pour ta LED ? Avec valeur normalisée et puissance."), ledTool],
  ["teiler", "➗", "#2e86ff", T("Spannungsteiler", "Pont diviseur"), T("Ausgang berechnen oder passende Widerstände finden (auch mit Last).", "Calculer la sortie ou trouver les résistances (avec charge)."), teilerTool],
  ["opamp", "🔺", "#1c7ed6", T("Operationsverstärker", "Amplificateur opérationnel"), T("Invertierend, nicht-invertierend, Addierer, Subtrahierer, Integrierer, Komparator, Schmitt-Trigger … mit lebendiger Schaltung und Oszilloskop-Bild.", "Inverseur, non-inverseur, sommateur, soustracteur, intégrateur, comparateur, trigger de Schmitt … avec schéma vivant et oscilloscope."), opampTool],
  ["normwerte", "🧩", "#12b8a6", T("Reihe, Parallel & Normwerte", "Série, parallèle et valeurs"), T("Widerstände kombinieren oder einen Wunschwert aus E12/E24 bauen.", "Combiner des résistances ou fabriquer une valeur avec E12/E24."), kombiTool],
  ["filter", "〰️", "#8a4dff", T("Filter & Schwingkreis", "Filtres et circuit LC"), T("RC-Filter mit Bode-Diagramm, Kondensator laden, LC-Resonanz.", "Filtre RC avec diagramme de Bode, charge de condensateur, résonance LC."), filterTool],
  ["timer555", "⏲️", "#c4452c", T("555-Timer", "Timer 555"), T("Blinker (astabil) und Impuls (monostabil) berechnen, mit Pinbelegung.", "Calculer clignotant (astable) et impulsion (monostable), avec brochage."), timerTool],
  ["regler", "🔋", "#2f9e44", T("Spannungsregler", "Régulateurs de tension"), T("LM317 einstellen (R1/R2, E24) und Verlustleistung eines Linearreglers samt Erwärmung.", "Régler le LM317 (R1/R2, E24) et calculer pertes et échauffement d’un régulateur linéaire."), reglerTool],
  ["logik", "🔢", "#6a4fd8", T("Logik & Zahlensysteme", "Logique et numération"), T("Wahrheitstabelle für jeden Ausdruck, 74xx-Gatter, Binär/Hex/Dezimal.", "Table de vérité pour toute expression, portes 74xx, binaire/hexa/décimal."), logikTool],
];
window.Elektro = { opamp: function(h, t){ opampTool(h, t); }, start: function(){
  const grid = $("#toolgrid"), hostEl = $("#toolhost");
  grid.innerHTML = TOOLS.map(t => '<a class="tcard" style="--wc:' + t[2] + '" href="#' + t[0] + '" data-id="' + t[0] + '"><span class="ts" style="background:' + t[2] + '">' + t[1] + '</span><span><b>' + esc(t[3]) + '</b><small>' + esc(t[4]) + '</small></span></a>').join("");
  const crumb = document.querySelector("main .crumb"), crumb0 = crumb ? crumb.innerHTML : "", sub = document.querySelector("main > .sub"), titel0 = T("Elektronik-Rechner", "Calculateurs d’électronique");
  function zeigen(){
    if ((location.hash || "") === "#pinout"){ location.replace("pinout.html"); return; }
    const id = (location.hash || "").slice(1).split("/")[0], t = TOOLS.find(x => x[0] === id);
    if (!t){
      grid.style.display = ""; if (sub) sub.style.display = ""; hostEl.innerHTML = "";
      if (crumb) crumb.innerHTML = crumb0;
      document.title = titel0 + " – Oratio"; return;
    }
    grid.style.display = "none"; if (sub) sub.style.display = "none";
    if (crumb) crumb.innerHTML = crumb0.replace(/ › [^›]*$/, ' › <a href="#">' + titel0 + '</a> › ' + esc(t[3]));
    hostEl.innerHTML = '<section class="card toolcard" id="' + t[0] + '"><h2><span class="ts" style="background:' + t[2] + '">' + t[1] + '</span> ' + esc(t[3]) + '</h2><div class="tbody"></div></section>';
    try { t[5]($(".tbody", hostEl)); } catch(err){ $(".tbody", hostEl).textContent = err.message; }
    if (window.WZ && WZ.selects) WZ.selects();
    document.title = t[3] + " – " + titel0 + " – Oratio";
  }
  window.addEventListener("hashchange", () => { zeigen(); window.scrollTo(0, 0); });
  zeigen();
} };
})();
