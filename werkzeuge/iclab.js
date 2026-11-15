/* Oratio IC-Labor – ICs nachschlagen, Schaltungen ausprobieren, Oszilloskop lesen */
var ICLAB = (function(){
"use strict";
var fr = !!(window.WZ && WZ.lang === "fr");
function T(d, f){ return fr && f ? f : d; }
function $(s, r){ return (r || document).querySelector(s); }
function el(t, c, h){ var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
function esc(s){ return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function sv(k){ try { return JSON.parse(localStorage.getItem("iclab_" + k)); } catch(e){ return null; } }
function st(k, v){ try { localStorage.setItem("iclab_" + k, JSON.stringify(v)); } catch(e){} }
var E12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2, 10];
function e12(v){ if (!(v > 0)) return v; var d = Math.floor(Math.log10(v)), m = v / Math.pow(10, d), b = 10, bd = 1e9; E12.forEach(function(x){ var q = Math.abs(Math.log(m / x)); if (q < bd){ bd = q; b = x; } }); return b * Math.pow(10, d); }
function fmt(v, u, dig){
  if (!isFinite(v)) return "–"; if (v === 0) return "0 " + (u || "");
  var Ls = [[1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"]], a = Math.abs(v), s = Ls[Ls.length - 1];
  for (var i = 0; i < Ls.length; i++) if (a >= Ls[i][0] * 0.9995){ s = Ls[i]; break; }
  return String(parseFloat((v / s[0]).toPrecision(dig || 3))).replace(".", fr ? "," : ".") + " " + s[1] + (u || "");
}
var C = { amber: "#ffb000", cyan: "#3de6ff", green: "#6dffb0", pink: "#ff3d9a", lime: "#b6ff3d", violet: "#b58cff", red: "#ff6b6b", white: "#e8fff3" };
var LINK = { ne555: "bt_analog/analog_ne555", hc14: "bt_ic/logik_74hc14", cd4060: "bt_ic/speicher_4060", hc00: "bt_ic/logik_7400", hc74: "bt_ic/speicher_7474", cd4017: "bt_ic/speicher_4017", hc160: "bt_ic/speicher_74160", hc595: "bt_ic/speicher_74595", hc138: "bt_ic/decoder_74138", cd4511: "bt_ic/decoder_4511", lm358: "bt_analog/analog_lm358", lm393: "bt_analog/analog_lm393", lm317: "halbleiter/bauteile_lm317", cd4093: "bt_ic/logik_4093", cd4040: "bt_ic/speicher_4040", hc165: "bt_ic/speicher_74165", lm7805: "halbleiter/bauteile_lm7805", lm386: "bt_analog/analog_lm386", bc337: "halbleiter/bauteile_bc337", uln2003: "halbleiter/bauteile_uln2003", l293d: "halbleiter/bauteile_l293d", pc817: "halbleiter/bauteile_pc817" };

/* ---------- Zeit-Helfer (alles geschlossen berechnet) ---------- */
function cnt(t, f, ph){ return t < ph ? 0 : Math.floor((t - ph) * f) + 1; }       // steigende Flanken bis t
function sq(t, f, ph, duty){ if (t < ph) return 0; var x = ((t - ph) * f) % 1; return x < (duty || .5) ? 1 : 0; }
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function sineAt(t, f, a){ return a * Math.sin(2 * Math.PI * f * t); }
function hash(n){ var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

/* ---------- Oszilloskop ---------- */
function scope(cv, chs, span, cur, tl){
  var dpr = Math.min(2, window.devicePixelRatio || 1), W = cv.parentNode.clientWidth || 600, LH = 62, H = chs.length * LH + 26;
  cv.style.width = W + "px"; cv.style.height = H + "px"; cv.width = W * dpr; cv.height = H * dpr;
  var c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.fillStyle = "#050a0a"; c.fillRect(0, 0, W, H);
  c.strokeStyle = "rgba(109,255,176,.10)"; c.lineWidth = 1; c.beginPath();
  for (var i = 0; i <= 10; i++){ var x = Math.round(i * W / 10) + .5; c.moveTo(x, 0); c.lineTo(x, H - 22); }
  for (var j = 0; j <= chs.length; j++){ var y = j * LH + .5; c.moveTo(0, y); c.lineTo(W, y); }
  c.stroke();
  var N = Math.min(2400, Math.round(W * 2.5));
  chs.forEach(function(ch, k){
    var top = k * LH + 8, h = LH - 16, lo = ch.lo, hi = ch.hi;
    c.strokeStyle = "rgba(109,255,176,.07)"; c.beginPath(); c.moveTo(0, top + h / 2 + .5); c.lineTo(W, top + h / 2 + .5); c.stroke();
    c.save(); c.strokeStyle = ch.c; c.shadowColor = ch.c; c.shadowBlur = 6; c.lineWidth = 2; c.lineJoin = "round"; c.beginPath();
    for (var s = 0; s <= N; s++){
      var v = ch.a ? ch.a[Math.min(ch.a.length - 1, Math.round(s / N * (ch.a.length - 1)))] : ch.v(s / N * span);
      var yy = top + h - clamp((v - lo) / (hi - lo), -.05, 1.05) * h, xx = s / N * W;
      s ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
    } c.stroke(); c.restore();
    c.font = "bold 11px ui-monospace,Menlo,Consolas,monospace"; c.fillStyle = ch.c; c.textAlign = "left"; c.fillText(ch.n, 6, top + 9);
    c.fillStyle = "rgba(200,255,225,.45)"; c.textAlign = "right"; c.fillText(fmt(hi, ch.u != null ? ch.u : "V", 2), W - 5, top + 9); c.fillText(fmt(lo, ch.u != null ? ch.u : "V", 2), W - 5, top + h + 4);
  });
  if (cur != null){ c.strokeStyle = "rgba(255,255,255,.75)"; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(cur * W + .5, 0); c.lineTo(cur * W + .5, H - 22); c.stroke(); c.setLineDash([]); }
  c.fillStyle = "rgba(200,255,225,.7)"; c.textAlign = "right"; c.font = "11px ui-monospace,Menlo,Consolas,monospace";
  c.fillText(tl ? tl(span / 10) : fmt(span / 10, "s", 2) + " / DIV", W - 6, H - 8); c.textAlign = "left"; c.fillText("0", 6, H - 8);
}

/* ---------- Gehäuse-Zeichnung ---------- */
function pinColor(t){ return t === "v" ? "#ff6b6b" : t === "g" ? "#8aa0b8" : t === "o" ? "#3de6ff" : "#ffb000"; }
function dip(ic){
  var P = ic.pins, n = P.length;
  if (ic.pkg === "TO-220"){
    var s = '<svg viewBox="0 0 220 150" class="dipsvg"><rect x="50" y="8" width="120" height="70" rx="6" fill="#262c36" stroke="#59657a"/><circle cx="110" cy="30" r="9" fill="#0e1218"/>';
    P.forEach(function(p, i){ var x = 70 + i * 40, nm = p.split(":")[0], t = p.split(":")[1]; s += '<rect x="' + (x - 4) + '" y="78" width="8" height="38" fill="' + pinColor(t) + '"/><text x="' + x + '" y="134" text-anchor="middle" font-size="12" fill="currentColor">' + (i + 1) + "</text><text x=\"" + x + '" y="148" text-anchor="middle" font-size="11" fill="currentColor" font-weight="700">' + esc(nm) + "</text>"; });
    return s + '<text x="110" y="62" text-anchor="middle" font-size="13" font-weight="800" fill="#e8fff3">' + esc(ic.name) + "</text></svg>";
  }
  var half = n / 2, rowH = 22, H = half * rowH + 20, W = 260, s2 = '<svg viewBox="0 0 ' + W + " " + H + '" class="dipsvg"><rect x="86" y="6" width="88" height="' + (H - 12) + '" rx="8" fill="#262c36" stroke="#59657a"/><path d="M118 6 a12 12 0 0 0 24 0" fill="#0e1218"/>';
  for (var i = 0; i < n; i++){
    var left = i < half, row = left ? i : n - 1 - i, y = 18 + row * rowH, nm = P[i].split(":")[0], t = P[i].split(":")[1];
    s2 += '<rect x="' + (left ? 70 : 174) + '" y="' + (y - 4) + '" width="16" height="8" rx="2" fill="' + pinColor(t) + '"/>';
    s2 += '<text x="' + (left ? 64 : 192) + '" y="' + (y + 4) + '" text-anchor="' + (left ? "end" : "start") + '" font-size="12" font-weight="700" fill="currentColor">' + esc(nm) + "</text>";
    s2 += '<text x="' + (left ? 100 : 160) + '" y="' + (y + 4) + '" text-anchor="' + (left ? "start" : "end") + '" font-size="10" fill="#a9cdbd">' + (i + 1) + "</text>";
  }
  return s2 + '<text x="130" y="' + (H / 2 + 4) + '" text-anchor="middle" font-size="12" font-weight="800" fill="#e8fff3" transform="rotate(-90 130 ' + (H / 2) + ')">' + esc(ic.name) + "</text></svg>";
}

/* ---------- LED-Reihe & 7-Segment ---------- */
function ledRow(host, n, names, col){
  var row = el("div", "iclr"), L = [];
  for (var i = 0; i < n; i++){ var w = el("div", "ic-led"), d = el("i"); d.style.setProperty("--c", col || C.red); w.appendChild(d); w.appendChild(el("span", "", names && names[i] != null ? names[i] : "")); row.appendChild(w); L.push(d); }
  host.appendChild(row);
  return { set: function(a){ for (var i = 0; i < L.length; i++) L[i].classList.toggle("on", !!a[i]); } };
}
var DIG = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F];   // Bits a..g = 0..6
function seg7(host){
  var P = ["M14 6 L20 2 L56 2 L62 6 L56 10 L20 10Z", "M64 8 L68 14 L68 44 L64 50 L58 44 L58 14Z", "M64 56 L68 62 L68 92 L64 98 L58 92 L58 62Z", "M14 100 L20 96 L56 96 L62 100 L56 104 L20 104Z", "M10 56 L16 62 L16 92 L10 98 L4 92 L4 62Z", "M10 8 L16 14 L16 44 L10 50 L4 44 L4 14Z", "M14 53 L20 49 L56 49 L62 53 L56 57 L20 57Z"];
  var s = el("div", "ic-seg"); s.innerHTML = '<svg viewBox="0 0 72 106">' + P.map(function(d){ return '<path d="' + d + '"/>'; }).join("") + "</svg>"; host.appendChild(s);
  var ps = s.querySelectorAll("path");
  return { setBits: function(b){ for (var i = 0; i < 7; i++) ps[i].classList.toggle("on", !!((b >> i) & 1)); }, set: function(d){ this.setBits(d >= 0 && d <= 9 ? DIG[d] : 0); } };
}
function toggleBtn(host, label, init, cb){
  var b = el("button", "ic-tg" + (init ? " on" : ""), label); b.type = "button"; b.onclick = function(){ b.classList.toggle("on"); cb && cb(b.classList.contains("on")); }; host.appendChild(b); return b;
}

/* ---------- 555-Rechenkern ---------- */
function c555(R1, R2, Cc, V){
  var tH = .693 * (R1 + R2) * Cc, tL = .693 * R2 * Cc, Tt = tH + tL;
  return { tH: tH, tL: tL, T: Tt, f: 1 / Tt, duty: tH / Tt,
    vc: function(t, ph){ if (t < ph) return V / 3; var x = (t - ph) % Tt; return x < tH ? V - (V - V / 3) * Math.exp(-x / ((R1 + R2) * Cc)) : 2 * V / 3 * Math.exp(-(x - tH) / (R2 * Cc)); },
    out: function(t, ph){ return t >= ph && ((t - ph) % Tt) < tH ? 1 : 0; },
    n: function(t, ph){ return t < ph ? 0 : Math.floor((t - ph) / Tt) + 1; } };
}
var PR1 = { k: "R1", l: ["R1", "R1"], min: 1e3, max: 1e6, def: 1e3, log: 1, u: "Ω", e12: 1 };
var PR2 = { k: "R2", l: ["R2", "R2"], min: 1e3, max: 2e6, def: 47e3, log: 1, u: "Ω", e12: 1 };
var PC1 = { k: "C", l: ["C", "C"], min: 1e-9, max: 1e-3, def: 10e-6, log: 1, u: "F", e12: 1 };
var PV = function(d){ return { k: "V", l: ["Betriebsspannung", "Tension d’alim."], min: 5, max: 15, def: d || 9, u: "V", int: 1 }; };
var PF = function(d, lo, hi){ return { k: "f", l: ["Takt-Frequenz", "Fréquence d’horloge"], min: lo || .5, max: hi || 5000, def: d || 2, log: 1, u: "Hz" }; };
function led1(on){ return { leds: [on], names: ["LED"] }; }
function digitLive(n){ return n; }

/* ---------- Kombi- und Einzelprojekte ---------- */
var PROJ = {};

PROJ.ne555a = { t: ["555 astabil – Blinker / Rechteck-Oszillator", "555 astable – clignotant / oscillateur"], flow: ["NE555", "LED"],
  d: ["Der Klassiker: Ein Kondensator lädt sich zwischen 1/3 und 2/3 der Betriebsspannung hin und her – der Ausgang kippt im Takt. Ändere R1, R2 und C und sieh am Oszilloskop, was passiert.", "Le classique : le condensateur oscille entre 1/3 et 2/3 de la tension – la sortie bascule en rythme. Change R1, R2 et C et regarde l’oscilloscope."],
  params: [PR1, PR2, PC1, PV(9)],
  build: function(P){ var k = c555(P.R1, P.R2, P.C, P.V), ph = k.T * .25, V = P.V, w = [];
    if (P.R1 < 1e3) w.push(T("R1 sollte mindestens 1 kΩ sein (Entladestrom).", "R1 devrait valoir au moins 1 kΩ."));
    if (k.f > 500e3) w.push(T("Über ca. 500 kHz schafft der NE555 das nicht mehr.", "Au-delà de 500 kHz le NE555 ne suit plus."));
    return { span: ph + 3.1 * k.T, fmain: k.f, warn: w,
      ch: [{ n: "OUT (Pin 3)", c: C.green, lo: 0, hi: V, v: function(t){ return k.out(t, ph) * (V - 1.5); } }, { n: "C (Pin 2/6)", c: C.amber, lo: 0, hi: V, v: function(t){ return k.vc(t, ph); } }],
      info: [[T("Frequenz", "Fréquence"), fmt(k.f, "Hz")], [T("Periodendauer", "Période"), fmt(k.T, "s")], [T("HIGH-Zeit tH = 0,693·(R1+R2)·C", "Temps haut tH"), fmt(k.tH, "s")], [T("LOW-Zeit tL = 0,693·R2·C", "Temps bas tL"), fmt(k.tL, "s")], [T("Tastverhältnis", "Rapport cyclique"), (k.duty * 100).toFixed(1).replace(".", fr ? "," : ".") + " %"], [T("Schwellen", "Seuils"), fmt(V / 3, "V") + " / " + fmt(2 * V / 3, "V")]],
      live: function(ts){ return { leds: [k.out(ts, 0)], names: ["OUT"] }; } }; },
  wire: [["Pin 1 → GND, Pin 8 → +V", "Broche 1 → GND, broche 8 → +V"], ["Pin 4 (RESET) → +V (sonst bleibt der Ausgang aus)", "Broche 4 (RESET) → +V"], ["R1 von +V an Pin 7 (DISCH)", "R1 de +V vers broche 7"], ["R2 von Pin 7 an Pin 6/2 (die beiden zusammen)", "R2 de la broche 7 aux broches 6/2 (reliées)"], ["C von Pin 6/2 nach GND", "C de la broche 6/2 vers GND"], ["Pin 5 (CTRL) über 10 nF nach GND (ruhigere Schwellen)", "Broche 5 via 10 nF vers GND"], ["Pin 3 (OUT) → 330 Ω … 1 kΩ → LED → GND", "Broche 3 → 330 Ω…1 kΩ → LED → GND"]],
  notes: [["Das Tastverhältnis ist immer über 50 % (R1 lädt mit). Für genau 50 %: Diode parallel zu R2 (Anode zum Kondensator) und R1 sehr klein.", "Le rapport cyclique dépasse toujours 50 %."], ["Der bipolare NE555 gibt HIGH nur ca. 1,5 V unter +V aus (CMOS-Typ TLC555/LMC555: fast voll).", "Le NE555 bipolaire sort ≈ +V − 1,5 V."]] };

PROJ.ne555m = { t: ["555 monostabil – Zeitrelais / Impuls", "555 monostable – impulsion"], flow: ["Taster", "NE555", "LED"],
  d: ["Ein kurzer Tastendruck an Pin 2 startet genau einen Impuls der Länge T = 1,1·R·C. Danach fällt der Ausgang von selbst zurück. Drücke den Knopf und sieh die LED.", "Une brève impulsion sur la broche 2 déclenche une impulsion de durée T = 1,1·R·C."],
  params: [{ k: "R", l: ["R", "R"], min: 1e3, max: 2e6, def: 100e3, log: 1, u: "Ω", e12: 1 }, PC1, PV(9)],
  action: { l: ["▶ Taster drücken (Trigger)", "▶ Appuyer (déclencheur)"] },
  build: function(P){ var Tt = 1.1 * P.R * P.C, V = P.V, span = Tt / .7, t0 = span * .12, w = span * .03;
    return { span: span, speed: Tt / clamp(Tt, .8, 6), warn: [],
      ch: [{ n: "TRIG (Pin 2)", c: C.pink, lo: 0, hi: V, v: function(t){ return t >= t0 && t < t0 + w ? 0 : V; } }, { n: "C (Pin 6/7)", c: C.amber, lo: 0, hi: V, v: function(t){ return t < t0 ? 0 : t < t0 + Tt ? V * (1 - Math.exp(-(t - t0) / (P.R * P.C))) : 0; } }, { n: "OUT (Pin 3)", c: C.green, lo: 0, hi: V, v: function(t){ return t >= t0 && t < t0 + Tt ? V - 1.5 : 0; } }],
      info: [[T("Impulsdauer T = 1,1·R·C", "Durée T = 1,1·R·C"), fmt(Tt, "s")], [T("Schwelle (2/3 V)", "Seuil (2/3 V)"), fmt(2 * V / 3, "V")]],
      live: function(ts, ctx){ return { leds: [ctx.fire != null && ts - ctx.fire < Tt && ts >= ctx.fire], names: ["OUT"] }; } }; },
  wire: [["Pin 1 → GND, Pin 8 und Pin 4 → +V", "Broche 1 → GND, 8 et 4 → +V"], ["Pin 2 (TRIG) über 10 kΩ an +V (Ruhe: HIGH), Taster von Pin 2 nach GND", "Broche 2 via 10 kΩ à +V, bouton de la broche 2 à GND"], ["R von +V an Pin 7 und Pin 6 (zusammen)", "R de +V aux broches 7 et 6 (reliées)"], ["C von Pin 6/7 nach GND", "C de la broche 6/7 à GND"], ["Pin 3 → Vorwiderstand → LED → GND", "Broche 3 → résistance → LED → GND"]],
  notes: [["Der Trigger-Impuls muss kürzer sein als T, sonst bleibt der Ausgang so lange an, wie du drückst.", "L’impulsion de déclenchement doit être plus courte que T."], ["Während der Impuls läuft, wird ein neuer Trigger ignoriert (nicht nachtriggerbar).", "Pendant l’impulsion, un nouveau déclenchement est ignoré."]] };

PROJ.hc14 = { t: ["Schmitt-Trigger-Oszillator (74HC14)", "Oscillateur à trigger de Schmitt (74HC14)"], flow: ["74HC14", "R + C", "LED"],
  d: ["Ein einziges Gatter, ein Widerstand, ein Kondensator – fertig ist ein Taktgeber. Der Kondensator wird über den Ausgang geladen und entladen, der Schmitt-Trigger kippt an zwei verschiedenen Schwellen.", "Une porte, une résistance, un condensateur : un oscillateur."],
  params: [{ k: "R", l: ["R", "R"], min: 1e3, max: 1e6, def: 100e3, log: 1, u: "Ω", e12: 1 }, PC1, { k: "V", l: ["Betriebsspannung", "Tension"], min: 3, max: 6, def: 5, u: "V" }],
  build: function(P){ var V = P.V, Vp = .55 * V, Vm = .33 * V, RC = P.R * P.C, th = RC * Math.log((V - Vm) / (V - Vp)), tl = RC * Math.log(Vp / Vm), Tt = th + tl, ph = Tt * .2;
    function vc(t){ if (t < ph) return Vm; var x = (t - ph) % Tt; return x < th ? V - (V - Vm) * Math.exp(-x / RC) : Vp * Math.exp(-(x - th) / RC); }
    function out(t){ return t >= ph && ((t - ph) % Tt) < th ? 1 : 0; }
    return { span: ph + 3.2 * Tt, fmain: 1 / Tt, warn: [],
      ch: [{ n: "Ausgang (Pin 2)", c: C.green, lo: 0, hi: V, v: function(t){ return out(t) * V; } }, { n: "Kondensator / Eingang (Pin 1)", c: C.amber, lo: 0, hi: V, v: vc }],
      info: [[T("Frequenz ≈ 1 / (0,9·R·C)", "Fréquence"), fmt(1 / Tt, "Hz")], [T("Schwellen VT+ / VT− (typisch)", "Seuils VT+ / VT−"), fmt(Vp, "V") + " / " + fmt(Vm, "V")], [T("HIGH / LOW", "Haut / bas"), fmt(th, "s") + " / " + fmt(tl, "s")]],
      live: function(ts){ return { leds: [out(ts)], names: ["OUT"] }; } }; },
  wire: [["Pin 14 → +V, Pin 7 → GND, 100 nF dicht am Chip", "Broche 14 → +V, 7 → GND, 100 nF près de la puce"], ["Pin 2 (Ausgang) → R → Pin 1 (Eingang)", "Broche 2 → R → broche 1"], ["Pin 1 → C → GND", "Broche 1 → C → GND"], ["Pin 2 → Vorwiderstand → LED → GND", "Broche 2 → résistance → LED → GND"], ["Nicht benutzte Gatter: Eingänge an GND legen", "Entrées inutilisées → GND"]],
  notes: [["Die Schwellen streuen von Chip zu Chip stark – die Frequenz ist nur ±20 % genau. Für Blinker egal, für Zeitbasen nicht.", "Les seuils varient beaucoup d’une puce à l’autre."], ["Das Prinzip funktioniert genauso mit 40106 oder 4093.", "Même principe avec 40106 ou 4093."]] };

PROJ.hc00 = { t: ["Gatter-Werkstatt (74HC00 / 02 / 04 / 08 / 32 / 86)", "Atelier des portes logiques"], flow: ["Eingänge A, B", "Gatter", "Ausgang Y"], custom: "gates",
  d: ["Schalte die Eingänge und sieh den Ausgang. Dazu: Wie man mit NAND-Gattern alle anderen Gatter baut – deshalb heißt das NAND „Universal-Gatter“.", "Bascule les entrées et vois la sortie. Et comment construire toutes les portes avec des NAND."],
  wire: [["Pin 14 → +V, Pin 7 → GND, 100 nF dazwischen", "Broche 14 → +V, 7 → GND, 100 nF"], ["Gatter 1: A = Pin 1, B = Pin 2, Y = Pin 3 (bei 7400, 7408, 7432, 7486)", "Porte 1 : A = 1, B = 2, Y = 3"], ["Unbenutzte Eingänge fest an GND oder +V", "Entrées libres → GND ou +V"], ["Achtung: 7402 (NOR) hat eine andere Pinbelegung – Ausgang zuerst!", "Attention : le 7402 (NOR) a un brochage différent."]],
  notes: [["Eingänge dürfen bei HC nie offen bleiben – sie schwingen sonst und ziehen Strom.", "Les entrées HC ne doivent jamais rester en l’air."]] };

PROJ.hc74 = { t: ["Frequenzteiler mit D-Flip-Flops (74HC74)", "Diviseur de fréquence (74HC74)"], flow: ["Takt", "74HC74 ÷2", "÷4", "÷8", "÷16"],
  d: ["Verbindest du /Q mit D, kippt das Flip-Flop bei jeder steigenden Flanke: der Takt wird halbiert. Mehrere hintereinander geben ÷4, ÷8, ÷16 – die Grundidee jedes Zählers.", "En reliant /Q à D, la bascule change d’état à chaque front montant : la fréquence est divisée par 2."],
  params: [PF(4, .5, 2000)], opts: [{ k: "n", l: ["Stufen", "Étages"], o: [[1, "1 (÷2)"], [2, "2 (÷4)"], [3, "3 (÷8)"], [4, "4 (÷16)"]], def: 3 }],
  build: function(P){ var f = P.f, n = +P.n, ph = .25 / f, N = Math.pow(2, n), chs = [{ n: "CLK", c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, f, ph, .5) * 5; } }];
    for (var i = 1; i <= n; i++) (function(i){ chs.push({ n: "Q" + i + "  (÷" + Math.pow(2, i) + ")", c: [C.green, C.cyan, C.pink, C.lime][i - 1], lo: 0, hi: 5, v: function(t){ return (Math.floor(cnt(t, f, ph) / Math.pow(2, i - 1)) % 2) * 5; } }); })(i);
    return { span: ph + (2.2 * N) / f, fmain: f, warn: [], ch: chs, info: [[T("Eingangstakt", "Horloge"), fmt(f, "Hz")], [T("Ausgang letzte Stufe", "Dernier étage"), fmt(f / N, "Hz")]],
      live: function(ts){ var c = cnt(ts, f, ph), a = []; for (var i = 1; i <= n; i++) a.push(Math.floor(c / Math.pow(2, i - 1)) % 2); return { leds: a, names: a.map(function(x, i){ return "Q" + (i + 1); }) }; } }; },
  wire: [["Pin 14 → +V, Pin 7 → GND", "Broche 14 → +V, 7 → GND"], ["Flip-Flop 1: /Q (Pin 6) → D (Pin 2), Takt an CLK (Pin 3)", "Bascule 1 : /Q (6) → D (2), horloge sur CLK (3)"], ["/PR (Pin 4) und /CLR (Pin 1) → +V (nicht aktiv)", "/PR (4) et /CLR (1) → +V"], ["Q (Pin 5) = Ausgang; für die 2. Stufe: Q (Pin 5) → CLK des 2. Flip-Flops (Pin 11), /Q (Pin 8) → D (Pin 12)", "Étage 2 : Q (5) → CLK (11), /Q (8) → D (12)"]],
  notes: [["Das 74HC74 hat nur 2 Flip-Flops im Gehäuse – für 4 Stufen brauchst du 2 ICs.", "Le 74HC74 ne contient que 2 bascules."], ["Asynchron: Jede Stufe hängt am Ausgang der vorherigen – bei vielen Stufen summieren sich die Laufzeiten.", "Asynchrone : les retards s’additionnent."]] };

PROJ.cd4017 = { t: ["Lauflicht mit CD4017", "Chenillard avec CD4017"], flow: ["Takt", "CD4017", "10 × LED"],
  d: ["Mit jeder steigenden Taktflanke wandert das HIGH zum nächsten Ausgang Q0…Q9. Verbindest du Qn mit RESET, läuft das Licht nur n Schritte lang.", "À chaque front montant, le niveau haut passe à la sortie suivante."],
  params: [PF(3, .5, 3000), { k: "n", l: ["Schritte (Qn → RESET)", "Pas (Qn → RESET)"], min: 2, max: 10, def: 10, int: 1, u: "" }],
  build: function(P){ var f = P.f, n = Math.round(P.n), ph = .25 / f, chs = [{ n: "CLK (Pin 14)", c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, f, ph, .5) * 5; } }];
    for (var i = 0; i < 4; i++) (function(i){ chs.push({ n: "Q" + i, c: [C.green, C.cyan, C.pink, C.lime][i], lo: 0, hi: 5, v: function(t){ return (cnt(t, f, ph) % n === i ? 5 : 0); } }); })(i);
    return { span: ph + (Math.min(n, 8) + 1.6) / f, fmain: f, warn: n < 10 ? [] : [], ch: chs, info: [[T("Takt", "Horloge"), fmt(f, "Hz")], [T("Ein Umlauf dauert", "Un tour dure"), fmt(n / f, "s")], [T("RESET-Verbindung", "Liaison RESET"), n === 10 ? T("keine (volle 10 Schritte)", "aucune") : "Q" + n + " → RESET (Pin 15)"]],
      live: function(ts){ var s = cnt(ts, f, ph) % n, a = []; for (var i = 0; i < 10; i++) a.push(i === s ? 1 : 0); return { leds: a, names: a.map(function(x, i){ return "Q" + i; }) }; } }; },
  wire: [["Pin 16 → +V, Pin 8 → GND", "Broche 16 → +V, 8 → GND"], ["Pin 13 (CE) und Pin 15 (RESET) → GND", "Broches 13 et 15 → GND"], ["Takt an Pin 14 (CLK)", "Horloge sur la broche 14"], ["Q0…Q9 jeweils → 1 kΩ → LED → GND", "Q0…Q9 → 1 kΩ → LED → GND"], ["Q(n) → Pin 15 (RESET) für n Schritte, z. B. Q6 → RESET = 6 Schritte", "Q(n) → RESET pour n pas"], ["Q-Anschlüsse sind NICHT der Reihe nach angeordnet: Q0=Pin 3, Q1=2, Q2=4, Q3=7, Q4=10, Q5=1, Q6=5, Q7=6, Q8=9, Q9=11", "Les sorties ne sont pas dans l’ordre !"]],
  notes: [["Ausgänge sind schwach (ca. 1–5 mA bei 5 V): LEDs mit ≥ 1 kΩ oder über Transistor/ULN2003.", "Sorties faibles : LED avec ≥ 1 kΩ."], ["Kaskadieren: Pin 12 (CO) des ersten → CLK des zweiten.", "Cascade : CO → CLK du suivant."]] };

PROJ.cd4060 = { t: ["Teilerkette & Quarzuhr-Baustein (CD4060)", "Chaîne de division (CD4060)"], flow: ["Oszillator", "÷ 2⁴ … 2¹⁴", "Ausgänge"],
  d: ["14 Teilerstufen und ein Oszillator in einem Gehäuse. Mit einem 32,768-kHz-Uhrenquarz kommt an Q14 genau 2 Hz heraus – die Basis jeder Quarzuhr.", "14 étages diviseurs + oscillateur. Avec un quartz 32,768 kHz : Q14 = 2 Hz."],
  opts: [{ k: "o", l: ["Oszillator", "Oscillateur"], o: [["q32", "Quarz 32,768 kHz"], ["q1m", "Quarz 1 MHz"], ["q4", "Quarz 4,194304 MHz"], ["rc", "RC-Oszillator"]], def: "q32" }, { k: "q", l: ["LED an Ausgang", "LED sur sortie"], o: [[4, "Q4"], [6, "Q6"], [8, "Q8"], [10, "Q10"], [12, "Q12"], [13, "Q13"], [14, "Q14"]], def: 14 }],
  params: [{ k: "Rt", l: ["Rt (nur RC)", "Rt (RC)"], min: 1e3, max: 1e6, def: 47e3, log: 1, u: "Ω", e12: 1 }, { k: "Ct", l: ["Ct (nur RC)", "Ct (RC)"], min: 100e-12, max: 1e-6, def: 10e-9, log: 1, u: "F", e12: 1 }],
  build: function(P){ var f = P.o === "q32" ? 32768 : P.o === "q1m" ? 1e6 : P.o === "q4" ? 4194304 : 1 / (2.3 * P.Rt * P.Ct), ph = .25 / f, q = +P.q,
      chs = [{ n: "Oszillator (Pin 10)", c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, f, ph, .5) * 5; } }];
    [4, 5, 6, 7].forEach(function(n, i){ chs.push({ n: "Q" + n + "  (÷" + Math.pow(2, n) + ")", c: [C.green, C.cyan, C.pink, C.lime][i], lo: 0, hi: 5, v: function(t){ return (Math.floor(cnt(t, f, ph) / Math.pow(2, n - 1)) % 2) * 5; } }); });
    var inf = [[T("Oszillator", "Oscillateur"), fmt(f, "Hz")]]; [4, 5, 6, 7, 8, 9, 10, 12, 13, 14].forEach(function(n){ inf.push(["Q" + n + " (÷" + Math.pow(2, n) + ")", fmt(f / Math.pow(2, n), "Hz") + "  ·  " + fmt(Math.pow(2, n) / f, "s")]); });
    return { span: ph + 135 / f, fmain: f / Math.pow(2, q), warn: [], ch: chs, info: inf,
      live: function(ts){ return { leds: [Math.floor(cnt(ts, f, ph) / Math.pow(2, q - 1)) % 2], names: ["Q" + q] }; } }; },
  wire: [["Pin 16 → +V, Pin 8 → GND, Pin 12 (RESET) → GND", "Broche 16 → +V, 8 → GND, 12 → GND"], ["Quarz: zwischen Pin 11 und Pin 10; je 22 pF von Pin 11 und Pin 10 nach GND; 10 MΩ zwischen Pin 11 und Pin 9", "Quartz entre 11 et 10 ; 22 pF vers GND ; 10 MΩ entre 11 et 9"], ["RC statt Quarz: Rt von Pin 10 an Pin 11, Ct von Pin 11 nach GND, R2 ≈ 2·Rt von Pin 11 an Pin 9", "Version RC : Rt (10→11), Ct (11→GND), R2 ≈ 2·Rt (11→9)"], ["Ausgang z. B. Q14 (Pin 3) → Vorwiderstand → LED → GND", "Sortie Q14 (3) → résistance → LED"]],
  notes: [["Q1, Q2, Q3 und Q11 sind nicht herausgeführt. Q4 ist die erste Stufe, die du abgreifen kannst.", "Q1–Q3 et Q11 ne sont pas accessibles."], ["Quarz 32,768 kHz = 2¹⁵ Hz: 15 Teilungen ergeben 1 Hz – Q14 plus ein Flip-Flop (siehe Kombi-Projekt Quarzuhr).", "32,768 kHz = 2¹⁵ Hz."]] };

PROJ.hc160 = { t: ["Dekadenzähler 0…9 (74HC160)", "Compteur décimal 0…9 (74HC160)"], flow: ["Takt", "74HC160", "BCD 0…9"],
  d: ["Zählt bei jeder steigenden Flanke weiter: 0, 1, 2 … 9, dann wieder 0. Die vier Ausgänge Q0…Q3 sind der BCD-Wert, TC meldet die 9.", "Compte 0…9 puis recommence. Q0…Q3 = valeur BCD, TC signale le 9."],
  params: [PF(2, .5, 2000)],
  build: function(P){ var f = P.f, ph = .25 / f, chs = [{ n: "CLK (Pin 2)", c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, f, ph, .5) * 5; } }];
    for (var i = 0; i < 4; i++) (function(i){ chs.push({ n: "Q" + i + "  (Wert " + Math.pow(2, i) + ")", c: [C.green, C.cyan, C.pink, C.lime][i], lo: 0, hi: 5, v: function(t){ return ((cnt(t, f, ph) % 10) >> i & 1) * 5; } }); })(i);
    chs.push({ n: "TC (Pin 15) = 9", c: C.red, lo: 0, hi: 5, v: function(t){ return cnt(t, f, ph) % 10 === 9 ? 5 : 0; } });
    return { span: ph + 12.3 / f, fmain: f, warn: [], ch: chs, info: [[T("Takt", "Horloge"), fmt(f, "Hz")], [T("Ein Umlauf (10 Takte)", "Un cycle (10 coups)"), fmt(10 / f, "s")]],
      live: function(ts){ var s = cnt(ts, f, ph) % 10; return { leds: [s & 1, s >> 1 & 1, s >> 2 & 1, s >> 3 & 1], names: ["Q0", "Q1", "Q2", "Q3"], seg: s }; } }; },
  wire: [["Pin 16 → +V, Pin 8 → GND", "Broche 16 → +V, 8 → GND"], ["/MR (Pin 1), /PE (Pin 9), CEP (Pin 7), CET (Pin 10) → +V", "/MR, /PE, CEP, CET → +V"], ["Takt an CLK (Pin 2)", "Horloge sur CLK (2)"], ["Q0 = Pin 14, Q1 = 13, Q2 = 12, Q3 = 11; TC = Pin 15", "Q0 = 14, Q1 = 13, Q2 = 12, Q3 = 11 ; TC = 15"], ["P0…P3 (Pin 3…6) → GND, wenn du nicht laden willst", "P0…P3 → GND"]],
  notes: [["Das 74HC160 zählt dezimal (0–9), das 74HC161 binär (0–15) – gleiche Pinbelegung.", "Le 160 compte en décimal, le 161 en binaire."], ["Synchron: alle Ausgänge ändern sich gleichzeitig mit der Taktflanke.", "Synchrone : toutes les sorties changent ensemble."]] };

PROJ.hc595 = { t: ["Schieberegister (74HC595): 3 Pins → 8 Ausgänge", "Registre à décalage (74HC595)"], flow: ["µC: 3 Pins", "74HC595", "8 Ausgänge"], custom: "shift",
  d: ["Bits werden einzeln eingetaktet (SER + SRCLK) und erst mit RCLK an die Ausgänge übernommen. Stelle ein Byte ein und gehe Takt für Takt durch.", "Les bits sont décalés un par un puis recopiés en sortie par RCLK."],
  wire: [["Pin 16 → +V, Pin 8 → GND", "Broche 16 → +V, 8 → GND"], ["Pin 10 (/SRCLR) → +V, Pin 13 (/OE) → GND", "Broche 10 → +V, 13 → GND"], ["Pin 14 (SER) = Daten, Pin 11 (SRCLK) = Schiebetakt, Pin 12 (RCLK) = Übernahme", "14 = données, 11 = horloge de décalage, 12 = verrou"], ["Ausgänge QA…QH = Pin 15, 1, 2, 3, 4, 5, 6, 7 → je 330 Ω → LED → GND", "QA…QH = 15, 1, 2, 3, 4, 5, 6, 7"], ["Mehrere kaskadieren: QH' (Pin 9) → SER des nächsten", "Cascade : QH’ (9) → SER suivant"]],
  notes: [["Arduino: shiftOut(dataPin, clockPin, MSBFIRST, wert); davor latch LOW, danach latch HIGH.", "Arduino : shiftOut(...)."], ["Pro Ausgang nur ca. 6 mA: für Relais/Motoren einen ULN2003 dahinter.", "≈ 6 mA par sortie."]] };

PROJ.hc138 = { t: ["3-zu-8-Dekoder (74HC138)", "Décodeur 3 vers 8 (74HC138)"], flow: ["A0 A1 A2", "74HC138", "Y0 … Y7"], custom: "dec138",
  d: ["Drei Adress-Eingänge wählen genau einen von acht Ausgängen – der gewählte geht auf LOW. Typisch für Adress-Dekodierung und Chip-Select.", "Trois entrées d’adresse choisissent une des huit sorties (active à l’état bas)."],
  wire: [["Pin 16 → +V, Pin 8 → GND", "Broche 16 → +V, 8 → GND"], ["A0 = Pin 1, A1 = Pin 2, A2 = Pin 3", "A0 = 1, A1 = 2, A2 = 3"], ["Pin 4 (/E1), Pin 5 (/E2) → GND; Pin 6 (E3) → +V (Chip aktiv)", "4 et 5 → GND, 6 → +V"], ["Y0 = Pin 15, Y1 = 14, … Y6 = 9; Y7 = Pin 7", "Y0 = 15 … Y6 = 9 ; Y7 = 7"], ["LED von +V über Vorwiderstand an Yn: leuchtet bei LOW", "LED de +V via résistance à Yn"]],
  notes: [["Die Ausgänge sind active-low: der gewählte Ausgang ist 0, alle anderen 1.", "Sorties actives à l’état bas."]] };

PROJ.cd4511 = { t: ["BCD-zu-7-Segment-Dekoder (CD4511)", "Décodeur BCD → 7 segments (CD4511)"], flow: ["BCD A B C D", "CD4511", "7-Segment"], custom: "bcd7",
  d: ["Vier Bit rein, sieben Segmente raus: der 4511 macht aus dem Zählerstand eine lesbare Ziffer. Werte über 9 bleiben dunkel.", "Quatre bits en entrée, sept segments en sortie."],
  wire: [["Pin 16 → +V, Pin 8 → GND", "Broche 16 → +V, 8 → GND"], ["Eingänge: A = Pin 7, B = Pin 1, C = Pin 2, D = Pin 6", "A = 7, B = 1, C = 2, D = 6"], ["Pin 3 (/LT) und Pin 4 (/BI) → +V, Pin 5 (LE) → GND", "3 et 4 → +V, 5 → GND"], ["Ausgänge a…g = Pin 13, 12, 11, 10, 9, 15, 14 → je 330 Ω → Segmente einer Anzeige mit gemeinsamer KATHODE (→ GND)", "a…g = 13, 12, 11, 10, 9, 15, 14 → 330 Ω → afficheur à cathode commune"]],
  notes: [["Der CD4511 ist für Anzeigen mit gemeinsamer Kathode; für gemeinsame Anode nimm den 7447.", "Le CD4511 est pour cathode commune ; anode commune : 7447."], ["LE (Latch Enable) HIGH friert die angezeigte Ziffer ein.", "LE à l’état haut gèle l’affichage."]] };

PROJ.lm358 = { t: ["Operationsverstärker: invertierend / nicht-invertierend (LM358)", "Amplificateur opérationnel (LM358)"], flow: ["Eingang", "LM358 + R1/R2", "Ausgang"],
  d: ["Die Verstärkung legen allein R1 und R2 fest. Übersteuere ihn absichtlich und sieh, wo der LM358 an die Versorgungsgrenze stößt (nur bis ca. +V − 1,5 V).", "Le gain est fixé par R1 et R2."],
  opts: [{ k: "m", l: ["Schaltung", "Montage"], o: [["inv", "invertierend  (−R2/R1)"], ["non", "nicht-invertierend (1+R2/R1)"]], def: "non" }, { k: "s", l: ["Versorgung", "Alimentation"], o: [["d12", "±12 V"], ["s5", "+5 V (Bias 2,5 V)"], ["s12", "+12 V (Bias 6 V)"]], def: "d12" }],
  params: [{ k: "R1", l: ["R1", "R1"], min: 1e3, max: 1e5, def: 10e3, log: 1, u: "Ω", e12: 1 }, { k: "R2", l: ["R2", "R2"], min: 1e3, max: 1e6, def: 47e3, log: 1, u: "Ω", e12: 1 }, { k: "A", l: ["Eingangsamplitude", "Amplitude d’entrée"], min: .01, max: 5, def: .5, log: 1, u: "V" }, { k: "f", l: ["Frequenz", "Fréquence"], min: 10, max: 200e3, def: 1000, log: 1, u: "Hz" }],
  build: function(P){ var g = P.m === "inv" ? -P.R2 / P.R1 : 1 + P.R2 / P.R1, fc = 1e6 / Math.abs(g), ge = g / Math.sqrt(1 + Math.pow(P.f / fc, 2)),
      dual = P.s === "d12", Vs = P.s === "s5" ? 5 : P.s === "s12" ? 12 : 12, bias = dual ? 0 : Vs / 2, lo = dual ? -12 : 0, hi = dual ? 12 : Vs, vmax = dual ? 10.5 : Vs - 1.5, vmin = dual ? -11.9 : .05, w = [], span = 3 / P.f;
    function vin(t){ return bias + sineAt(t, P.f, P.A); } function vout(t){ return clamp(bias + ge * sineAt(t, P.f, P.A), vmin, vmax); }
    var pk = Math.abs(ge) * P.A; if (bias + pk > vmax || bias - pk < vmin) w.push(T("Ausgang übersteuert – das Signal wird oben/unten abgeschnitten (Clipping).", "Sortie saturée – le signal est écrêté."));
    if (2 * Math.PI * P.f * Math.min(pk, vmax - vmin) / 2 > .3e6) w.push(T("Slew-Rate-Grenze des LM358 (0,3 V/µs): bei dieser Frequenz/Amplitude wird die Sinuskurve zum Dreieck.", "Limite de slew-rate du LM358."));
    return { span: span, speed: 1, warn: w, ch: [{ n: "Eingang", c: C.amber, lo: lo, hi: hi, v: vin }, { n: "Ausgang", c: C.green, lo: lo, hi: hi, v: vout }],
      info: [[T("Verstärkung", "Gain"), g.toFixed(1).replace(".", fr ? "," : ".") + "×  (" + (20 * Math.log10(Math.abs(g))).toFixed(1) + " dB)"], [T("Grenzfrequenz ≈ 1 MHz / |Gain|", "Fréquence de coupure"), fmt(fc, "Hz")], [T("Wirksame Verstärkung bei f", "Gain effectif"), ge.toFixed(1).replace(".", fr ? "," : ".") + "×"], [T("Maximale Ausgangsspannung", "Sortie max."), fmt(vmax, "V")]] }; },
  wire: [["Pin 8 → +V, Pin 4 → GND (oder −V bei ±-Versorgung)", "Broche 8 → +V, 4 → GND"], ["Nicht-invertierend: Signal an Pin 3 (IN+); R2 von Pin 1 (Ausgang) an Pin 2 (IN−); R1 von Pin 2 nach GND", "Non inverseur : signal sur 3 ; R2 de 1 vers 2 ; R1 de 2 vers GND"], ["Invertierend: Signal über R1 an Pin 2; R2 von Pin 1 an Pin 2; Pin 3 → GND (bzw. Bias)", "Inverseur : signal via R1 sur 2 ; R2 de 1 vers 2 ; broche 3 → GND"], ["Bei einfacher Versorgung: Bias Vcc/2 mit zwei gleichen Widerständen, Koppelkondensatoren am Ein- und Ausgang", "Alim. simple : polarisation Vcc/2 + condensateurs de liaison"]],
  notes: [["Der LM358 ist ein Single-Supply-Typ: der Eingang darf bis GND, der Ausgang kommt fast bis GND, aber nur bis ca. +V − 1,5 V.", "Le LM358 fonctionne en alimentation simple."], ["Für Audio oder schnelle Signale: TL072 oder NE5532 (mehr Bandbreite, weniger Rauschen).", "Pour l’audio : TL072 ou NE5532."]] };

PROJ.lm393 = { t: ["Komparator mit Hysterese (LM393)", "Comparateur avec hystérésis (LM393)"], flow: ["Signal + Referenz", "LM393", "Ausgang"],
  d: ["Der Komparator vergleicht zwei Spannungen. Ist das Signal verrauscht, zittert der Ausgang an der Schwelle – mit Hysterese (Mitkopplung) nicht mehr. Schalte sie ein und aus.", "Le comparateur compare deux tensions. Avec du bruit la sortie vibre ; l’hystérésis l’évite."],
  params: [{ k: "ref", l: ["Referenz Vref", "Référence Vref"], min: 0.5, max: 4.5, def: 2.5, u: "V" }, { k: "A", l: ["Signal-Amplitude", "Amplitude du signal"], min: .2, max: 2.4, def: 1.2, u: "V" }, { k: "noise", l: ["Rauschen", "Bruit"], min: 0, max: 1, def: .25, u: "V" }, { k: "h", l: ["Hysterese Δ", "Hystérésis Δ"], min: 0, max: 1.5, def: .5, u: "V" }],
  build: function(P){ var N = 1200, span = 1, vin = [], out = [], sw = 0, o = 0, swNo = 0, o2 = 0, V = 5;
    for (var i = 0; i < N; i++){ var t = i / N, v = 2.5 + P.A * Math.sin(2 * Math.PI * 2 * t) + (hash(i) - .5) * 2 * P.noise; vin.push(v);
      var hi = P.ref + P.h / 2, lo = P.ref - P.h / 2; var n = o; if (v > hi) n = 1; else if (v < lo) n = 0; if (n !== o) sw++; o = n; out.push(o * V);
      var n2 = v > P.ref ? 1 : 0; if (n2 !== o2) swNo++; o2 = n2; }
    return { span: span, speed: 1, warn: [], ch: [{ n: "Eingang IN+ (verrauscht)", c: C.amber, lo: 0, hi: 5, a: vin }, { n: "Vref ± Δ/2", c: C.cyan, lo: 0, hi: 5, v: function(t){ return P.ref; } }, { n: "Ausgang", c: C.green, lo: 0, hi: 5, a: out }],
      info: [[T("Schaltflanken mit Hysterese", "Commutations avec hystérésis"), String(sw)], [T("Schaltflanken ohne Hysterese", "Sans hystérésis"), String(swNo)], [T("Obere / untere Schwelle", "Seuils haut / bas"), fmt(P.ref + P.h / 2, "V") + " / " + fmt(P.ref - P.h / 2, "V")]] }; },
  wire: [["Pin 8 → +V, Pin 4 → GND", "Broche 8 → +V, 4 → GND"], ["Signal an Pin 3 (IN+), Referenz (Poti oder Teiler) an Pin 2 (IN−)", "Signal sur 3, référence sur 2"], ["Ausgang Pin 1 ist ‚open collector‘: Pull-up (z. B. 10 kΩ) von Pin 1 nach +V", "Sortie 1 à collecteur ouvert : pull-up vers +V"], ["Hysterese: Rückkopplungswiderstand (z. B. 1 MΩ) von Pin 1 an Pin 3; Eingang über 10 kΩ", "Hystérésis : résistance de 1 vers 3"]],
  notes: [["Ein Komparator hat keinen Frequenzgang-Ausgleich – nicht als Verstärker mit Rückkopplung betreiben (dafür den LM358).", "Ne pas l’utiliser comme amplificateur."], ["Offener Kollektor: der Ausgang kann nur nach GND ziehen; das HIGH kommt vom Pull-up – so lassen sich auch andere Spannungen als +V schalten.", "Collecteur ouvert."]] };

PROJ.lm317 = { t: ["Einstellbares Netzteil (LM317)", "Alimentation réglable (LM317)"], flow: ["Vin", "LM317 + R1/R2", "Vout"], custom: "reg317",
  d: ["Zwischen OUT und ADJ hält der LM317 immer 1,25 V. Mit R1 und R2 stellst du die Ausgangsspannung ein: Vout = 1,25 · (1 + R2/R1). Sieh auch, wie viel Wärme der Regler dabei verbrät.", "Entre OUT et ADJ le LM317 maintient 1,25 V. Vout = 1,25 · (1 + R2/R1)."],
  wire: [["Pin 3 (IN) ← Vin; 330 nF nach GND dicht am Chip", "Broche 3 (IN) ← Vin ; 330 nF vers GND"], ["Pin 2 (OUT) → Ausgang; 1 µF nach GND", "Broche 2 (OUT) → sortie ; 1 µF vers GND"], ["R1 (240 Ω) zwischen OUT und ADJ (Pin 1)", "R1 (240 Ω) entre OUT et ADJ"], ["R2 von ADJ (Pin 1) nach GND (Poti = einstellbar)", "R2 de ADJ vers GND"], ["Diode 1N4007 von OUT nach IN (Schutz bei Kurzschluss am Eingang)", "Diode 1N4007 de OUT vers IN"]],
  notes: [["Der LM317 braucht ca. 2–3 V Reserve (Dropout): Vin ≥ Vout + 3 V.", "Il faut ≈ 3 V de marge."], ["Die Verlustleistung (Vin − Vout)·I wird zu Wärme – ab ca. 1–2 W ein Kühlkörper.", "La puissance dissipée chauffe : radiateur."], ["Kleine Lasten: mindestens 10 mA Mindestlast (R1 liefert 5 mA selbst).", "Charge minimale ≈ 10 mA."]] };

/* ---- Kombi-Projekte ---- */
PROJ.k_lauf = { t: ["Lauflicht: 555 → CD4017 → 10 LEDs", "Chenillard : 555 → CD4017 → 10 LED"], flow: ["NE555", "CD4017", "10 × LED"], ics: ["ne555", "cd4017"],
  d: ["Der 555 liefert den Takt, der 4017 verteilt ihn auf zehn Ausgänge. Mit R2 stellst du die Geschwindigkeit ein, mit „Schritte“ die Länge der Kette.", "Le 555 donne l’horloge, le 4017 la distribue sur dix sorties."],
  params: [PR1, { k: "R2", l: ["R2 (Tempo)", "R2 (vitesse)"], min: 1e3, max: 2e6, def: 100e3, log: 1, u: "Ω", e12: 1 }, { k: "C", l: ["C", "C"], min: 1e-9, max: 1e-3, def: 1e-6, log: 1, u: "F", e12: 1 }, { k: "n", l: ["Schritte (Qn → RESET)", "Pas"], min: 2, max: 10, def: 10, int: 1, u: "" }],
  build: function(P){ var k = c555(P.R1, P.R2, P.C, 5), n = Math.round(P.n), ph = k.T * .25, chs = [{ n: "555 OUT = CLK", c: C.amber, lo: 0, hi: 5, v: function(t){ return k.out(t, ph) * 5; } }];
    for (var i = 0; i < 4; i++) (function(i){ chs.push({ n: "Q" + i, c: [C.green, C.cyan, C.pink, C.lime][i], lo: 0, hi: 5, v: function(t){ return k.n(t, ph) % n === i ? 5 : 0; } }); })(i);
    return { span: ph + (Math.min(n, 7) + 1.4) * k.T, fmain: k.f, warn: [], ch: chs, info: [[T("Takt (555)", "Horloge"), fmt(k.f, "Hz")], [T("Ein Umlauf", "Un tour"), fmt(n * k.T, "s")]],
      live: function(ts){ var s = k.n(ts, ph) % n, a = []; for (var i = 0; i < 10; i++) a.push(i === s ? 1 : 0); return { leds: a, names: a.map(function(x, i){ return "Q" + i; }) }; } }; },
  wire: [["NE555 wie im Blinker-Projekt aufbauen (R1, R2, C, Pin 5 → 10 nF)", "NE555 comme dans le clignotant"], ["555 Pin 3 (OUT) → CD4017 Pin 14 (CLK)", "555 broche 3 → 4017 broche 14"], ["CD4017: Pin 16 → +V, Pin 8 → GND, Pin 13 (CE) → GND, Pin 15 (RESET) → GND", "4017 : 16 → +V, 8 → GND, 13 → GND, 15 → GND"], ["Q0…Q9 → 1 kΩ → LED → GND (beide ICs an derselben Versorgung, 5…12 V)", "Q0…Q9 → 1 kΩ → LED → GND"]],
  notes: [["Das Tastverhältnis des 555 stört nicht: der 4017 reagiert nur auf die steigende Flanke.", "Le rapport cyclique n’a pas d’importance."]] };

PROJ.k_uhr = { t: ["Quarzuhr-Baustein: 32,768 kHz → CD4060 → 74HC74 → 1 Hz", "Base de temps à quartz : 32,768 kHz → 1 Hz"], flow: ["Quarz 32,768 kHz", "CD4060 ÷16384", "74HC74 ÷2", "1 Hz"], ics: ["cd4060", "hc74"],
  d: ["So tickt fast jede Digitaluhr: Der Uhrenquarz schwingt mit 32 768 Hz = 2¹⁵. Der CD4060 teilt durch 2¹⁴ = 2 Hz, ein Flip-Flop halbiert noch einmal – genau 1 Hz. Wie genau, entscheidet die Quarz-Abweichung.", "Presque toutes les horloges numériques : 32 768 Hz = 2¹⁵."],
  params: [{ k: "ppm", l: ["Quarz-Abweichung", "Écart du quartz"], min: -100, max: 100, def: 20, u: "ppm", int: 1 }],
  build: function(P){ var f0 = 32768 * (1 + P.ppm * 1e-6), f2 = f0 / 16384, f1 = f2 / 2, ph = .15 / f2, span = 4;
    return { span: span, speed: 1, warn: [], ch: [{ n: "CD4060 Q14  (2 Hz)", c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, 2, .06, .5) * 5; } }, { n: "74HC74 Q  (1 Hz)", c: C.green, lo: 0, hi: 5, v: function(t){ return (cnt(t, 2, .06) % 2) * 5; } }],
      info: [[T("Quarz", "Quartz"), fmt(f0, "Hz", 6)], [T("÷ 2¹⁴ = Q14", "÷ 2¹⁴ = Q14"), fmt(f2, "Hz", 6)], [T("÷ 2 = Sekundentakt", "÷ 2 = seconde"), fmt(f1, "Hz", 6)], [T("Ganggenauigkeit", "Précision"), (P.ppm * .0864).toFixed(2).replace(".", fr ? "," : ".") + " s / " + T("Tag", "jour")], [T("pro Monat", "par mois"), (P.ppm * .0864 * 30).toFixed(1).replace(".", fr ? "," : ".") + " s"]],
      live: function(ts){ return { leds: [cnt(ts, 2, .06) % 2], names: ["1 Hz"] }; } }; },
  wire: [["CD4060: Pin 16 → +V, Pin 8 → GND, Pin 12 (RESET) → GND", "CD4060 : 16 → +V, 8 → GND, 12 → GND"], ["Quarz zwischen Pin 11 und Pin 10; 22 pF von Pin 11 und Pin 10 nach GND; 10 MΩ zwischen Pin 11 und Pin 9", "Quartz entre 11 et 10 ; 22 pF ; 10 MΩ entre 11 et 9"], ["Q14 (Pin 3) → CLK (Pin 3) des 74HC74", "Q14 (3) → CLK du 74HC74"], ["74HC74: /Q (Pin 6) → D (Pin 2); /PR (4) und /CLR (1) → +V; Q (Pin 5) = 1 Hz → LED", "74HC74 : /Q → D ; Q = 1 Hz"]],
  notes: [["Ein 20-ppm-Quarz geht rund 1,7 s pro Tag falsch. Genauer: temperaturkompensierte Module (DS3231, ±2 ppm).", "Un quartz à 20 ppm dérive d’environ 1,7 s par jour."]] };

PROJ.k_zaehl = { t: ["Digitaler Zähler: 555 → 74HC160 → CD4511 → 7-Segment", "Compteur numérique : 555 → 160 → 4511 → 7 seg."], flow: ["NE555", "74HC160", "CD4511", "7-Segment"], ics: ["ne555", "hc160", "cd4511"],
  d: ["Drei ICs, eine Ziffer: der 555 gibt den Takt, der 160 zählt 0…9, der 4511 macht daraus die Segmente. Die Grundschaltung jeder Anzeige.", "Trois CI, un chiffre."],
  params: [PR1, { k: "R2", l: ["R2", "R2"], min: 1e3, max: 2e6, def: 100e3, log: 1, u: "Ω", e12: 1 }, { k: "C", l: ["C", "C"], min: 1e-9, max: 1e-3, def: 4.7e-6, log: 1, u: "F", e12: 1 }],
  build: function(P){ var k = c555(P.R1, P.R2, P.C, 5), ph = k.T * .25, chs = [{ n: "555 OUT = CLK", c: C.amber, lo: 0, hi: 5, v: function(t){ return k.out(t, ph) * 5; } }];
    for (var i = 0; i < 4; i++) (function(i){ chs.push({ n: "BCD " + "ABCD"[i], c: [C.green, C.cyan, C.pink, C.lime][i], lo: 0, hi: 5, v: function(t){ return ((k.n(t, ph) % 10) >> i & 1) * 5; } }); })(i);
    return { span: ph + 12.3 * k.T, fmain: k.f, warn: [], ch: chs, info: [[T("Takt", "Horloge"), fmt(k.f, "Hz")], [T("Ein Durchlauf 0…9", "Un cycle 0…9"), fmt(10 * k.T, "s")]],
      live: function(ts){ var s = k.n(ts, ph) % 10; return { leds: [], seg: s }; } }; },
  wire: [["555 als Taktgeber (siehe Blinker), Pin 3 → 74HC160 Pin 2 (CLK)", "555 en horloge → CLK du 160"], ["74HC160: Pin 16 → +V, 8 → GND; Pin 1, 7, 9, 10 → +V; P0…P3 → GND", "74HC160 : 16 → +V, 8 → GND ; 1, 7, 9, 10 → +V"], ["Q0 (14) → A (CD4511 Pin 7), Q1 (13) → B (Pin 1), Q2 (12) → C (Pin 2), Q3 (11) → D (Pin 6)", "Q0 → A (7), Q1 → B (1), Q2 → C (2), Q3 → D (6)"], ["CD4511: Pin 16 → +V, 8 → GND; Pin 3, 4 → +V; Pin 5 → GND", "CD4511 : 16 → +V, 8 → GND"], ["a…g (Pin 13, 12, 11, 10, 9, 15, 14) → 330 Ω → Anzeige (gemeinsame Kathode an GND)", "a…g → 330 Ω → afficheur (cathode commune)"]],
  notes: [["Versorgung für alle drei ICs gemeinsam: 5 V (der 74HC160 verträgt max. 6 V, der CD4511 bis 15 V).", "Alimentation commune : 5 V."]] };

PROJ.k_daemm = { t: ["Dämmerungsschalter: LDR → LM393 → Lampe", "Interrupteur crépusculaire : LDR → LM393"], flow: ["LDR + R", "LM393 (Hysterese)", "Transistor", "Lampe"], ics: ["lm393"], custom: "dusk",
  d: ["Ein Tag in 24 Stunden: Der lichtempfindliche Widerstand (LDR) bildet mit einem Festwiderstand einen Spannungsteiler, der Komparator schaltet bei der eingestellten Schwelle die Lampe. Ohne Hysterese flackert sie bei Wolken – ziehe den Zeitregler!", "Un jour en 24 h : le LDR forme un diviseur, le comparateur allume la lampe."],
  wire: [["LDR von +5 V an Knoten X; 10 kΩ von X nach GND", "LDR de +5 V au nœud X ; 10 kΩ vers GND"], ["Knoten X → LM393 Pin 2 (IN−); Referenz (Poti) → Pin 3 (IN+)", "X → broche 2 ; référence → broche 3"], ["Pull-up 10 kΩ von Pin 1 nach +5 V; Pin 1 → 1 kΩ → Basis NPN (BC337) → Kollektor an Lampe/Relais, Emitter GND", "Pull-up 10 kΩ ; broche 1 → 1 kΩ → base NPN"], ["Hysterese: 1 MΩ von Pin 1 an Pin 3", "Hystérésis : 1 MΩ de 1 à 3"], ["Bei Relais: Freilaufdiode (1N4148) parallel zur Spule", "Relais : diode de roue libre"]],
  notes: [["Bei Dämmerung verändert sich das Licht langsam – ohne Hysterese schaltet der Komparator in dieser Zone hin und her.", "Sans hystérésis la lampe vacille."], ["Der LDR hat Reaktionszeit (ca. 20–100 ms) – das wirkt als natürlicher Filter.", "Le LDR réagit lentement."]] };

PROJ.k_prell = { t: ["Taster entprellen: RC + 74HC14 → Zähler", "Anti-rebond : RC + 74HC14"], flow: ["Taster", "R + C", "74HC14", "Zähler"], ics: ["hc14", "hc160"], custom: "bounce",
  d: ["Ein mechanischer Taster prellt: ein Druck ergibt mehrere Flanken innerhalb weniger Millisekunden. Ein Zähler zählt sie alle mit! RC-Glied plus Schmitt-Trigger macht daraus genau eine saubere Flanke. Wähle R und C – und drücke.", "Un bouton rebondit : plusieurs fronts en quelques ms."],
  wire: [["Taster zwischen Eingangsknoten und GND, 10 kΩ Pull-up nach +V", "Bouton entre le nœud et GND, pull-up 10 kΩ"], ["Von dort R in Reihe zu Pin 1 (74HC14), C von Pin 1 nach GND", "R en série vers la broche 1, C de 1 vers GND"], ["Pin 2 (Ausgang, invertiert) → CLK des Zählers (74HC160 Pin 2)", "Broche 2 → CLK du compteur"], ["74HC14: Pin 14 → +V, Pin 7 → GND; unbenutzte Eingänge → GND", "74HC14 : 14 → +V, 7 → GND"]],
  notes: [["Faustregel: RC-Zeit ≥ 5 ms (z. B. 10 kΩ · 1 µF = 10 ms) filtert fast jeden Taster.", "Règle : RC ≥ 5 ms."], ["In Software geht es auch (Wartezeit ~20 ms) – Hardware spart dem Mikrocontroller die Arbeit und funktioniert mit Interrupts.", "En logiciel aussi."]] };

PROJ.k_sirene = { t: ["Sirene: zwei 555 (LFO moduliert VCO)", "Sirène : deux 555 (LFO module VCO)"], flow: ["555 #1 (langsam)", "Pin 5 (CTRL)", "555 #2 (Ton)", "Lautsprecher"], ics: ["ne555"], custom: "siren",
  d: ["Der erste 555 schwingt langsam und verschiebt über Pin 5 die Schwellen des zweiten. So wandert die Tonhöhe auf und ab: eine Sirene. Drücke „Ton hören“ – die Frequenz folgt genau dieser Rechnung.", "Le premier 555 module via la broche 5 les seuils du second."],
  wire: [["555 #1: als langsamer Blinker (z. B. R1 = 10 kΩ, R2 = 100 kΩ, C = 4,7 µF ≈ 1,4 Hz)", "555 n°1 : clignotant lent"], ["Spannung an C1 (Pin 6/2) über 10 kΩ an Pin 5 von 555 #2", "Tension de C1 via 10 kΩ à la broche 5 du n°2"], ["555 #2: R1 = 1 kΩ, R2 = 10 kΩ, C = 10 nF (ca. 5 kHz)", "555 n°2 : R1 = 1 kΩ, R2 = 10 kΩ, C = 10 nF"], ["Pin 3 von 555 #2 → 100 µF → 8-Ω-Lautsprecher → GND (oder Piezo)", "Broche 3 → 100 µF → haut-parleur 8 Ω"], ["Beide 555: Pin 1 → GND, Pin 4 und 8 → +V", "Les deux : 1 → GND, 4 et 8 → +V"]],
  notes: [["Mit offenem Pin 5 sind die Schwellen 1/3 und 2/3. Legst du eine Spannung Vc an Pin 5, werden sie Vc/2 und Vc – die Frequenz ändert sich.", "Avec la broche 5 libre : 1/3 et 2/3."]] };

/* ---- Projekte, die erst hier ihre Rechnung bekommen ---- */
PROJ.k_daemm.params = [{ k: "t", l: ["Uhrzeit (zum Scrubben)", "Heure"], min: 0, max: 24, def: 19, u: "h" }, { k: "ref", l: ["Schwelle Vref (Poti)", "Seuil Vref"], min: .5, max: 4.5, def: 1.6, u: "V" }, { k: "h", l: ["Hysterese Δ", "Hystérésis Δ"], min: 0, max: 1.5, def: .5, u: "V" }, { k: "cl", l: ["Wolken", "Nuages"], min: 0, max: 1, def: .6, u: "" }];
PROJ.k_daemm.build = function(P){
  var N = 960, lux = [], vx = [], lamp = [], on = null, sw = 0, ll = [];
  for (var i = 0; i < N; i++){ var h = i / (N - 1) * 24, day = Math.max(0, Math.sin(Math.PI * (h - 5.5) / 13)), cl = Math.abs(Math.sin(h * 2.1) * Math.sin(h * 5.3 + 1)) * (day > 0 && day < .5 ? 1.6 : 1);
    var lx = .3 + 900 * Math.pow(day, 1.5) * (1 - P.cl * .9 * Math.min(1, cl)); lux.push(lx); ll.push(Math.log10(lx));
    var R = 10e3 * Math.pow(10 / lx, .8), v = 5 * 10e3 / (10e3 + R); vx.push(v);
    if (on === null) on = v < P.ref ? 1 : 0; var n = on; if (v < P.ref - P.h / 2) n = 1; else if (v > P.ref + P.h / 2) n = 0; if (n !== on) sw++; on = n; lamp.push(on * 5); }
  var k = Math.round(P.t / 24 * (N - 1)), hh = Math.floor(P.t), mm = Math.round((P.t - hh) * 60);
  return { span: 24, cur: P.t / 24, tl: function(d){ return d.toFixed(1).replace(".", fr ? "," : ".") + " h / DIV"; }, speed: 1, warn: [],
    ch: [{ n: "Helligkeit (lg Lux)", c: C.amber, lo: -1, hi: 3, u: "", a: ll }, { n: "Knoten X (LDR-Teiler)", c: C.cyan, lo: 0, hi: 5, a: vx }, { n: "Vref = " + fmt(P.ref, "V") + "  ± Δ/2", c: C.violet, lo: 0, hi: 5, v: function(t){ return P.ref; } }, { n: "Lampe", c: C.green, lo: 0, hi: 5, a: lamp }],
    info: [[T("Uhrzeit", "Heure"), (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm + (lux[k] > 100 ? "  ☀️" : lux[k] > 8 ? "  ⛅" : "  🌙")], [T("Helligkeit", "Luminosité"), (lux[k] < 10 ? lux[k].toFixed(1) : Math.round(lux[k])) + " lx"], [T("Spannung am Knoten X", "Tension nœud X"), fmt(vx[k], "V")], [T("Lampe", "Lampe"), lamp[k] > 0 ? "💡 AN" : "aus"], [T("Schaltvorgänge pro Tag", "Commutations par jour"), String(sw) + (sw > 4 ? T("  (zu viele – mehr Hysterese!)", "  (trop – plus d’hystérésis)") : "")]],
    live: function(){ return { leds: [lamp[k] > 0], names: ["Lampe"] }; } }; };
delete PROJ.k_daemm.custom;

PROJ.k_prell.params = [{ k: "R", l: ["R", "R"], min: 100, max: 1e6, def: 10e3, log: 1, u: "Ω", e12: 1 }, { k: "C", l: ["C", "C"], min: 1e-9, max: 10e-6, def: 1e-6, log: 1, u: "F", e12: 1 }];
PROJ.k_prell.action = { l: ["▶ Taster drücken (neues Prellen)", "▶ Appuyer (nouveau rebond)"] };
PROJ.k_prell.onAction = function(ctx){ ctx.seed = (ctx.seed || 1) + 1; ctx.presses = (ctx.presses || 0) + 1; ctx.count = true; };
PROJ.k_prell.build = function(P, ctx){
  var seed = ctx.seed || 1, V = 5, Tt = 20e-3, dt = 4e-6, steps = Math.round(Tt / dt), t0 = 1e-3, segs = [], m = 2 + 2 * Math.floor(hash(seed) * 3), t = t0;
  for (var j = 0; j < m; j++){ var d = 50e-6 + hash(seed * 7 + j) * 650e-6; segs.push([t, t + d, j % 2 === 0 ? 0 : 1]); t += d; }
  function raw(x){ if (x < t0) return 1; for (var j = 0; j < segs.length; j++) if (x < segs[j][1]) return segs[j][2]; return 0; }
  var RC = P.R * P.C, a = Math.exp(-dt / RC), v = V, o = 0, rw = [], cv = [], ou = [], rawFalls = 0, rises = 0, pr = 1, po = 0;
  for (var i = 0; i < steps; i++){ var x = i * dt, r = raw(x); v = r * V + (v - r * V) * a; if (v > .55 * V) o = 0; else if (v < .33 * V) o = 1; if (pr === 1 && r === 0) rawFalls++; pr = r; if (po === 0 && o === 1) rises++; po = o;
    if (i % 20 === 0){ rw.push(r * V); cv.push(v); ou.push(o * V); } }
  if (ctx.count){ ctx.tot = ctx.tot || { raw: 0, clean: 0 }; ctx.tot.raw += rawFalls; ctx.tot.clean += rises; ctx.count = false; }
  var tot = ctx.tot || { raw: 0, clean: 0 };
  return { span: Tt, speed: 1, warn: rises > 1 ? [T("RC-Zeit zu kurz: der Schmitt-Trigger sieht noch mehrere Flanken – der Zähler zählt mehrfach.", "RC trop court : plusieurs fronts passent.")] : rises === 0 ? [T("RC-Zeit zu lang: der Kondensator erreicht die Schwelle in diesem Fenster nicht.", "RC trop long.")] : [],
    ch: [{ n: "Taster (roh, prellt)", c: C.red, lo: 0, hi: 5, a: rw }, { n: "C-Spannung (Pin 1)", c: C.amber, lo: 0, hi: 5, a: cv }, { n: "74HC14 Ausgang → Zähler", c: C.green, lo: 0, hi: 5, a: ou }],
    info: [[T("RC-Zeit", "Constante RC"), fmt(RC, "s")], [T("Flanken am Taster (dieser Druck)", "Fronts bouton"), String(rawFalls)], [T("Flanken am Zähler-Eingang", "Fronts vers le compteur"), String(rises)], [T("Drücke bisher", "Appuis"), String(ctx.presses || 0)], [T("Zählt ohne Entprellung", "Compte sans anti-rebond"), String(tot.raw)], [T("Zählt mit Entprellung", "Compte avec anti-rebond"), String(tot.clean)]] }; };
delete PROJ.k_prell.custom;

PROJ.k_sirene.params = [{ k: "lr1", l: ["LFO R1", "LFO R1"], min: 1e3, max: 1e6, def: 10e3, log: 1, u: "Ω", e12: 1 }, { k: "lr2", l: ["LFO R2", "LFO R2"], min: 1e3, max: 2e6, def: 100e3, log: 1, u: "Ω", e12: 1 }, { k: "lc", l: ["LFO C", "LFO C"], min: 1e-7, max: 1e-4, def: 4.7e-6, log: 1, u: "F", e12: 1 }, { k: "vr1", l: ["Ton R1", "Ton R1"], min: 1e3, max: 1e5, def: 1e3, log: 1, u: "Ω", e12: 1 }, { k: "vr2", l: ["Ton R2", "Ton R2"], min: 1e3, max: 1e6, def: 10e3, log: 1, u: "Ω", e12: 1 }, { k: "vc", l: ["Ton C", "Ton C"], min: 1e-9, max: 1e-6, def: 10e-9, log: 1, u: "F", e12: 1 }, { k: "dep", l: ["Hub (Tiefe)", "Profondeur"], min: 0, max: 1, def: .8, u: "" }];
PROJ.k_sirene.action = { l: ["🔊 Ton hören / stoppen", "🔊 Écouter / arrêter"] };
PROJ.k_sirene.build = function(P){
  var V = 9, k = c555(P.lr1, P.lr2, P.lc, V), ph = k.T * .1, span = ph + 2.2 * k.T, N = 900, fa = [], vctl = [], mn = 1e12, mx = 0;
  function ctl(t){ var nrm = (k.vc(t, ph) - V / 3) / (V / 3); return V * (.667 + P.dep * .25 * (nrm * 2 - 1)); }
  function fv(t){ var Vc = ctl(t), tH = (P.vr1 + P.vr2) * P.vc * Math.log((V - Vc / 2) / (V - Vc)), tL = P.vr2 * P.vc * Math.LN2; return 1 / (tH + tL); }
  for (var i = 0; i < N; i++){ var t = i / (N - 1) * span, f = fv(t); fa.push(f); vctl.push(ctl(t)); mn = Math.min(mn, f); mx = Math.max(mx, f); }
  return { span: span, speed: 1, warn: mx > 15000 ? [T("Töne über ca. 15 kHz hörst du kaum noch.", "Au-dessus de 15 kHz on n’entend presque plus.")] : [],
    ch: [{ n: "LFO: C-Spannung", c: C.amber, lo: 0, hi: V, v: function(t){ return k.vc(t, ph); } }, { n: "Pin 5 (Steuerspannung)", c: C.cyan, lo: 0, hi: V, a: vctl }, { n: "Tonfrequenz", c: C.green, lo: Math.max(0, mn * .9), hi: mx * 1.1 + 1, u: "Hz", a: fa }],
    info: [[T("LFO-Frequenz", "Fréquence LFO"), fmt(k.f, "Hz")], [T("Tonhöhe tiefste", "Plus grave"), fmt(mn, "Hz")], [T("Tonhöhe höchste", "Plus aiguë"), fmt(mx, "Hz")], [T("Ein Sirenen-Umlauf", "Un cycle")], ].map(function(r, i){ return i === 3 ? [r[0], fmt(k.T, "s")] : r; }),
    fAt: function(t){ return fv(ph + (t % k.T)); } }; };
delete PROJ.k_sirene.custom;

/* ---- Erweiterung: weitere ICs, Treiber und Kombi-Projekte ---- */
var PRx = function(k, lab, lo, hi, def){ return { k: k, l: [lab, lab], min: lo, max: hi, def: def, log: 1, u: "Ω", e12: 1 }; };
PROJ.cd4093 = { t: ["Tor-Oszillator mit Schmitt-NAND (CD4093)", "Oscillateur commandé (CD4093)"], flow: ["Freigabe", "CD4093 + R, C", "LED"],
  d: ["Ein NAND mit Schmitt-Trigger wird mit R und C zum Oszillator. Der zweite Eingang ist die Freigabe: HIGH lässt ihn schwingen, LOW hält ihn an. So schaltet man einen Ton oder Blinker ein und aus.", "Une porte NAND à trigger de Schmitt devient oscillateur avec R et C. La seconde entrée valide ou bloque l’oscillation."],
  opts: [{ k: "en", l: ["Freigabe (Pin 1)", "Validation (broche 1)"], o: [["1", "HIGH – schwingt"], ["0", "LOW – steht still"]], def: "1" }],
  params: [PRx("R", "R", 1e3, 2e6, 100e3), { k: "C", l: ["C", "C"], min: 1e-9, max: 1e-4, def: 1e-6, log: 1, u: "F", e12: 1 }, PV(9)],
  build: function(P){ var V = P.V, vp = .58 * V, vn = .38 * V, rc = P.R * P.C, tH = rc * Math.log((V - vn) / (V - vp)), tL = rc * Math.log(vp / vn), Tt = tH + tL, on = P.en === "1";
    function ph(t){ return ((t % Tt) + Tt) % Tt; }
    return { span: 3.2 * Tt, fmain: on ? 1 / Tt : 0, warn: on ? [] : [T("Freigabe ist LOW: Der Ausgang bleibt HIGH, der Kondensator lädt sich voll auf.", "Validation à LOW : la sortie reste haute.")],
      ch: [{ n: "Freigabe (Pin 1)", c: C.pink, lo: 0, hi: V, v: function(){ return on ? V : 0; } }, { n: "C (Pin 2)", c: C.amber, lo: 0, hi: V, v: function(t){ if (!on) return V; var x = ph(t); return x < tH ? V - (V - vn) * Math.exp(-x / rc) : vp * Math.exp(-(x - tH) / rc); } }, { n: "OUT (Pin 3)", c: C.green, lo: 0, hi: V, v: function(t){ return !on || ph(t) < tH ? V : 0; } }],
      info: [[T("Frequenz", "Fréquence"), on ? fmt(1 / Tt, "Hz") : "–"], [T("Schwellen (Hysterese)", "Seuils (hystérésis)"), fmt(vn, "V") + " / " + fmt(vp, "V")], [T("Periodendauer ≈ 0,8·R·C", "Période ≈ 0,8·R·C"), fmt(Tt, "s")]],
      live: function(ts){ return { leds: [!on || ph(ts) < tH ? 1 : 0], names: ["OUT"] }; } }; },
  wire: [["Pin 14 → +V, Pin 7 → GND", "Broche 14 → +V, 7 → GND"], ["Pin 1 = Freigabe: Schalter nach +V, 10 kΩ nach GND", "Broche 1 = validation : interrupteur vers +V, 10 kΩ vers GND"], ["R von Pin 3 (Ausgang) zurück an Pin 2", "R de la broche 3 vers la broche 2"], ["C von Pin 2 nach GND", "C de la broche 2 vers GND"], ["Pin 3 → 330 Ω → LED → GND", "Broche 3 → 330 Ω → LED → GND"], ["Unbenutzte Eingänge (Pin 5, 6, 8, 9, 12, 13) an GND", "Entrées libres à GND"]],
  notes: [["Die Schwellen streuen von Chip zu Chip stark – die Frequenz stimmt nur auf etwa ±30 %.", "Les seuils varient d’une puce à l’autre : fréquence à ±30 %."], ["Ohne Schmitt-Trigger (CD4011) schwingt diese Schaltung nicht sauber.", "Sans trigger de Schmitt (CD4011) le montage n’oscille pas proprement."]] };

PROJ.cd4040 = { t: ["Binärzähler mit 12 Stufen (CD4040)", "Compteur binaire 12 étages (CD4040)"], flow: ["Takt", "CD4040", "8 × LED"],
  d: ["Jede Stufe halbiert den Takt der vorigen. An den LEDs zählt der Baustein sichtbar binär hoch – Q1 ist das schnellste Bit.", "Chaque étage divise l’horloge par deux : les LED comptent en binaire."],
  params: [PF(4, .5, 2000)],
  build: function(P){ var f = P.f, ph = .75 / f, chs = [{ n: "CLK", c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, f, .25 / f, .5) * 5; } }];
    for (var i = 1; i <= 4; i++) (function(i){ chs.push({ n: "Q" + i + "  (÷" + Math.pow(2, i) + ")", c: [C.green, C.cyan, C.pink, C.lime][i - 1], lo: 0, hi: 5, v: function(t){ return (Math.floor(cnt(t, f, ph) / Math.pow(2, i - 1)) % 2) * 5; } }); })(i);
    return { span: 17 / f, fmain: f, warn: [], ch: chs, info: [[T("Takt", "Horloge"), fmt(f, "Hz")], ["Q8 (÷256)", fmt(f / 256, "Hz")], ["Q12 (÷4096)", fmt(f / 4096, "Hz")]],
      live: function(ts){ var c = cnt(ts, f, ph), a = []; for (var i = 0; i < 8; i++) a.push(Math.floor(c / Math.pow(2, i)) % 2); return { leds: a, names: a.map(function(x, i){ return "Q" + (i + 1); }) }; } }; },
  wire: [["Pin 16 → +V, Pin 8 → GND", "Broche 16 → +V, 8 → GND"], ["Takt an Pin 10 (CLK) – gezählt wird bei der FALLENDEN Flanke", "Horloge sur la broche 10 – comptage sur front descendant"], ["Pin 11 (RESET) → GND; HIGH setzt alle Ausgänge auf 0", "Broche 11 (RESET) → GND"], ["Q1…Q8 (Pin 9, 7, 6, 5, 3, 2, 4, 13) → 330 Ω → LED → GND", "Q1…Q8 → 330 Ω → LED → GND"]],
  notes: [["Die Stufen schalten nacheinander (Ripple-Zähler): kurze Zwischenwerte sind normal, zum Dekodieren besser einen synchronen Zähler nehmen.", "Compteur asynchrone : des états transitoires sont normaux."]] };

PROJ.hc165 = { t: ["Schalter seriell einlesen (74HC165)", "Lire des interrupteurs en série (74HC165)"], flow: ["8 Eingänge", "74HC165", "1 Datenleitung"],
  d: ["Das Gegenstück zum 74HC595: Acht Eingänge werden mit einem kurzen LOW an SH/LD übernommen und dann Bit für Bit herausgeschoben. So liest ein Mikrocontroller mit 3 Pins beliebig viele Taster.", "L’inverse du 74HC595 : huit entrées sont chargées puis décalées bit par bit."],
  params: [{ k: "b", l: ["Wert an den Eingängen H…A (0…255)", "Valeur aux entrées (0…255)"], min: 0, max: 255, def: 178, int: 1, u: "" }, PF(8, 1, 2000)],
  build: function(P){ var f = P.f, b = Math.round(P.b), per = 10 / f;
    function slot(t){ return Math.floor((((t % per) + per) % per) * f); } function fr1(t){ var x = (((t % per) + per) % per) * f; return x - Math.floor(x); }
    function bit(t){ var s = slot(t); return s < 1 || s > 8 ? 0 : (b >> (8 - s)) & 1; }
    var bin = ("00000000" + b.toString(2)).slice(-8);
    return { span: per * 1.05, fmain: f, warn: [], ch: [{ n: "SH/LD (Pin 1)", c: C.pink, lo: 0, hi: 5, v: function(t){ return slot(t) === 0 ? 0 : 5; } }, { n: "CLK (Pin 2)", c: C.amber, lo: 0, hi: 5, v: function(t){ var s = slot(t); return s >= 2 && s <= 8 && fr1(t) < .5 ? 5 : 0; } }, { n: "QH (Pin 9)", c: C.green, lo: 0, hi: 5, v: function(t){ return bit(t) * 5; } }],
      info: [[T("Wert binär (H…A)", "Valeur binaire (H…A)"), bin], [T("Wert hex", "Valeur hexa"), "0x" + ("0" + b.toString(16).toUpperCase()).slice(-2)], [T("Zeit für 8 Bit", "Durée pour 8 bits"), fmt(8 / f, "s")]],
      live: function(){ var a = []; for (var i = 7; i >= 0; i--) a.push((b >> i) & 1); return { leds: a, names: ["H", "G", "F", "E", "D", "C", "B", "A"] }; } }; },
  wire: [["Pin 16 → +V, Pin 8 → GND, Pin 15 (CLK INH) → GND", "Broche 16 → +V, 8 → GND, 15 → GND"], ["Eingänge A…H (Pin 11, 12, 13, 14, 3, 4, 5, 6): je ein Taster nach +V und 10 kΩ nach GND", "Entrées A…H : bouton vers +V et 10 kΩ vers GND"], ["Pin 1 (SH/LD): kurzer LOW-Impuls übernimmt alle acht Eingänge", "Broche 1 : impulsion LOW = chargement"], ["Pin 2 (CLK): jede steigende Flanke schiebt das nächste Bit an Pin 9 (QH)", "Broche 2 : chaque front montant décale un bit vers QH"], ["Pin 10 (SER) → GND oder an QH des nächsten 74HC165 (Kette)", "Broche 10 → GND ou QH du suivant"]],
  notes: [["Zuerst erscheint Eingang H, zuletzt A – beim Einlesen also höchstes Bit zuerst.", "L’entrée H sort en premier."]] };

PROJ.lm7805 = { t: ["Festspannungsregler 5 V (LM7805)", "Régulateur fixe 5 V (LM7805)"], flow: ["Trafo + Gleichrichter", "LM7805", "5 V"],
  d: ["Der 7805 macht aus einer welligen Eingangsspannung saubere 5 V – solange der Eingang nie unter etwa 7 V fällt. Was zu viel ist, wird Wärme. Erhöhe den Strom und sieh, wie Brumm und Hitze steigen.", "Le 7805 fournit 5 V propres tant que l’entrée reste au-dessus de 7 V. Le surplus devient chaleur."],
  opts: [{ k: "kk", l: ["Kühlung", "Refroidissement"], o: [["65", "ohne Kühlkörper (65 K/W)"], ["15", "mit Kühlkörper (15 K/W)"]], def: "65" }],
  params: [{ k: "Vin", l: ["Eingangsspannung (Spitze)", "Tension d’entrée (crête)"], min: 5, max: 30, def: 10, u: "V" }, { k: "I", l: ["Laststrom", "Courant de charge"], min: .01, max: 1.5, def: .3, log: 1, u: "A" }],
  build: function(P){ var dU = P.I / (2 * 50 * 2200e-6), w = [], Rth = +P.kk;
    function vin(t){ var x = (t * 100) % 1; return Math.max(0, P.Vin - dU * x); } function vout(t){ return clamp(vin(t) - 2, 0, 5); }
    var vmin = Math.max(0, P.Vin - dU), Pv = Math.max(0, (P.Vin - dU / 2 - 5)) * P.I, Tj = 25 + Pv * Rth;
    if (vmin < 7) w.push(T("Der Eingang fällt unter 7 V: Die 5 V brechen ein, der Brumm kommt durch.", "L’entrée passe sous 7 V : les 5 V s’effondrent."));
    if (Tj > 125) w.push(T("Sperrschicht über 125 °C: Der Regler schaltet thermisch ab – Kühlkörper oder weniger Eingangsspannung.", "Jonction au-delà de 125 °C : coupure thermique."));
    return { span: .035, warn: w, ch: [{ n: "Eingang", c: C.amber, lo: 0, hi: 32, v: vin }, { n: "Ausgang", c: C.green, lo: 0, hi: 32, v: vout }],
      info: [[T("Brummspannung am Eingang (2200 µF)", "Ondulation à l’entrée (2200 µF)"), fmt(dU, "V")], [T("Kleinste Eingangsspannung", "Tension d’entrée minimale"), fmt(vmin, "V")], [T("Verlustleistung", "Puissance dissipée"), fmt(Pv, "W")], [T("Sperrschichttemperatur", "Température de jonction"), Math.round(Tj) + " °C"]],
      live: function(){ return { leds: [vmin >= 7 && Tj <= 125 ? 1 : 0], names: ["5 V ok"] }; } }; },
  wire: [["Pin 1 (IN) an die gleichgerichtete, gesiebte Spannung", "Broche 1 (IN) sur la tension redressée et filtrée"], ["Pin 2 (GND) an Masse – auch die Kühlfahne ist Masse", "Broche 2 (GND) à la masse"], ["Pin 3 (OUT) = 5 V", "Broche 3 (OUT) = 5 V"], ["330 nF direkt am Eingang, 100 nF direkt am Ausgang (gegen Schwingen)", "330 nF à l’entrée, 100 nF à la sortie"]],
  notes: [["Faustregel: Über 1 W Verlust braucht der 7805 einen Kühlkörper. Bei großem Spannungsunterschied ist ein Schaltregler sparsamer.", "Au-delà de 1 W de pertes, dissipateur obligatoire."]] };

PROJ.lm386 = { t: ["Kleiner Audio-Verstärker (LM386)", "Petit amplificateur audio (LM386)"], flow: ["Audio-Signal", "LM386", "Lautsprecher"],
  d: ["Ein IC, ein paar Kondensatoren – fertig ist der Verstärker. Ohne Zusatz verstärkt er 20-fach, mit 10 µF zwischen Pin 1 und 8 sogar 200-fach. Dreh das Eingangssignal auf, bis er übersteuert.", "Un CI et quelques condensateurs : gain 20, ou 200 avec 10 µF entre les broches 1 et 8."],
  opts: [{ k: "g", l: ["Verstärkung", "Gain"], o: [["20", "20× (Pin 1 und 8 offen)"], ["200", "200× (10 µF zwischen Pin 1 und 8)"]], def: "20" }],
  params: [{ k: "A", l: ["Eingangsamplitude", "Amplitude d’entrée"], min: .001, max: .5, def: .05, log: 1, u: "V" }, { k: "f", l: ["Frequenz", "Fréquence"], min: 50, max: 10000, def: 440, log: 1, u: "Hz" }, PV(9)],
  build: function(P){ var g = +P.g, V = P.V, mx = V / 2 - 1, pk = Math.min(g * P.A, mx), w = [];
    if (g * P.A > mx) w.push(T("Übersteuert: Die Spitzen werden abgeschnitten, es klingt verzerrt.", "Saturation : les crêtes sont écrêtées."));
    return { span: 3 / P.f, speed: 1, warn: w, ch: [{ n: "Eingang (Pin 3)", c: C.amber, lo: -.5, hi: .5, v: function(t){ return sineAt(t, P.f, P.A); } }, { n: "Ausgang (Pin 5)", c: C.green, lo: 0, hi: V, v: function(t){ return V / 2 + clamp(g * sineAt(t, P.f, P.A), -mx, mx); } }],
      info: [[T("Verstärkung", "Gain"), g + "×  (" + (20 * Math.log10(g)).toFixed(0) + " dB)"], [T("Ruhespannung am Ausgang", "Tension de repos"), fmt(V / 2, "V")], [T("Leistung an 8 Ω", "Puissance sur 8 Ω"), fmt(pk * pk / 16, "W")]] }; },
  wire: [["Pin 6 → +V (4…12 V), Pin 4 → GND", "Broche 6 → +V, 4 → GND"], ["Signal an Pin 3 (IN+), Pin 2 (IN−) → GND", "Signal sur 3, broche 2 → GND"], ["Pin 5 (Ausgang) → 220 µF → Lautsprecher → GND", "Broche 5 → 220 µF → haut-parleur → GND"], ["100 nF + 10 Ω von Pin 5 nach GND (verhindert Schwingen)", "100 nF + 10 Ω de 5 vers GND"], ["Für 200-fach: 10 µF zwischen Pin 1 (+) und Pin 8", "Gain 200 : 10 µF entre 1 (+) et 8"]],
  notes: [["Der Ausgang liegt in Ruhe auf halber Versorgung – deshalb der Koppelkondensator vor dem Lautsprecher.", "La sortie est à Vcc/2 au repos, d’où le condensateur de liaison."]] };

PROJ.npn = { t: ["Transistor als Schalter (BC337)", "Transistor en commutation (BC337)"], flow: ["Mikrocontroller-Pin", "Basiswiderstand", "BC337", "Last"],
  d: ["Ein Pin liefert nur wenige Milliampere. Der Transistor schaltet damit eine viel größere Last. Entscheidend ist der Basiswiderstand: Ist er zu groß, schaltet der Transistor nicht voll durch und wird heiß.", "Une broche fournit peu de courant ; le transistor commute une charge bien plus grande. La résistance de base est décisive."],
  opts: [{ k: "vin", l: ["Pegel am Eingang", "Niveau d’entrée"], o: [["3.3", "3,3 V (Pi, ESP32)"], ["5", "5 V (Arduino)"]], def: "3.3" }],
  params: [PRx("Rb", "Basiswiderstand", 100, 100e3, 1e3), PRx("RL", "Last (an 12 V)", 15, 2e3, 120), PF(2, .5, 2000)],
  build: function(P){ var Vi = +P.vin, Ib = (Vi - .7) / P.Rb, Is = 11.8 / P.RL, Ic = Math.min(100 * Ib, Is), Vce = Math.max(.2, 12 - Ic * P.RL), sat = 100 * Ib >= Is, w = [], f = P.f;
    if (!sat) w.push(T("Nicht voll durchgeschaltet: Am Transistor bleiben " + fmt(Vce, "V") + " stehen, er wird heiß. Basiswiderstand kleiner wählen.", "Pas saturé : le transistor chauffe. Diminuer la résistance de base."));
    if (Ib > .016) w.push(T("Basisstrom über 16 mA – zu viel für einen Pi-Pin.", "Courant de base au-delà de 16 mA – trop pour une broche de Pi."));
    if (Is > .8) w.push(T("Über 800 mA: zu viel für den BC337, nimm einen MOSFET (z. B. IRLZ44N).", "Au-delà de 800 mA : prendre un MOSFET."));
    return { span: 3.2 / f, fmain: f, warn: w, ch: [{ n: "Eingang", c: C.amber, lo: 0, hi: 12, v: function(t){ return sq(t, f, .25 / f, .5) * Vi; } }, { n: "Kollektor", c: C.green, lo: 0, hi: 12, v: function(t){ return sq(t, f, .25 / f, .5) ? Vce : 12; } }],
      info: [[T("Basisstrom", "Courant de base"), fmt(Ib, "A")], [T("Laststrom", "Courant de charge"), fmt(Ic, "A")], [T("Reserve (hFE·Ib / Laststrom)", "Marge (hFE·Ib / charge)"), (100 * Ib / Is).toFixed(1).replace(".", fr ? "," : ".") + "×"], [T("Verlust im Transistor (ein)", "Pertes dans le transistor"), fmt(Vce * Ic, "W")]],
      live: function(ts){ return { leds: [sq(ts, f, 0, .5)], names: [T("Last", "Charge")] }; } }; },
  wire: [["Emitter → GND (gemeinsame Masse mit dem Mikrocontroller)", "Émetteur → GND (masse commune)"], ["Pin → Basiswiderstand → Basis", "Broche → résistance de base → base"], ["Last zwischen +12 V und Kollektor", "Charge entre +12 V et collecteur"], ["Bei Relais oder Motor: Freilaufdiode 1N4007 parallel zur Last, Kathode an +12 V", "Relais ou moteur : diode de roue libre 1N4007, cathode au +12 V"]],
  notes: [["Faustregel: Basisstrom = Laststrom / 10 … 20, dann schaltet er sicher durch.", "Règle : courant de base = courant de charge / 10 … 20."]] };

PROJ.uln2003 = { t: ["7 Lasten schalten mit dem ULN2003", "Commuter 7 charges avec l’ULN2003"], flow: ["Logik-Pin", "ULN2003", "Relais / Lampe / Motor"],
  d: ["Sieben Darlington-Schalter in einem Gehäuse, die Freilaufdioden sind schon eingebaut. Ein HIGH am Eingang zieht den Ausgang nach Masse – die Last hängt zwischen Versorgung und Ausgang.", "Sept commutateurs Darlington avec diodes de roue libre intégrées. Un HIGH tire la sortie à la masse."],
  params: [{ k: "Vl", l: ["Last-Versorgung", "Alimentation de la charge"], min: 5, max: 30, def: 12, u: "V", int: 1 }, { k: "I", l: ["Laststrom", "Courant de charge"], min: .01, max: .5, def: .1, log: 1, u: "A" }, PF(1, .5, 200)],
  build: function(P){ var f = P.f, vs = .9 + .6 * P.I, w = [];
    if (P.I > .35) w.push(T("Viel Strom für einen Kanal: Mehrere Kanäle parallel schalten oder kühlen.", "Courant élevé pour un canal."));
    return { span: 3.2 / f, fmain: f, warn: w, ch: [{ n: "Eingang 1B", c: C.amber, lo: 0, hi: 30, v: function(t){ return sq(t, f, .25 / f, .5) * 5; } }, { n: "Ausgang 1C", c: C.green, lo: 0, hi: 30, v: function(t){ return sq(t, f, .25 / f, .5) ? vs : P.Vl; } }],
      info: [[T("Restspannung am Ausgang (ein)", "Tension résiduelle (actif)"), fmt(vs, "V")], [T("Spannung an der Last", "Tension sur la charge"), fmt(P.Vl - vs, "V")], [T("Verlust im Kanal (ein)", "Pertes par canal"), fmt(vs * P.I, "W")]],
      live: function(ts){ return { leds: [sq(ts, f, 0, .5)], names: [T("Last", "Charge")] }; } }; },
  wire: [["Pin 8 → GND (gemeinsame Masse mit der Logik)", "Broche 8 → GND"], ["Pin 9 (COM) → Plus der Last-Versorgung (für die Freilaufdioden)", "Broche 9 (COM) → + de la charge"], ["Eingänge Pin 1…7 direkt an die Logik-Pins (3,3 V oder 5 V)", "Entrées 1…7 directement sur les broches logiques"], ["Last zwischen Plus und Ausgang (Pin 16…10)", "Charge entre + et la sortie (16…10)"]],
  notes: [["Der ULN2003 kann nur nach Masse schalten. Er liefert selbst keinen Strom.", "L’ULN2003 commute uniquement vers la masse."], ["Gesamtstrom aller Kanäle: höchstens etwa 2,5 A, je Kanal 500 mA.", "Total ≈ 2,5 A, 500 mA par canal."]] };

PROJ.l293d = { t: ["Motor vor und zurück (L293D)", "Moteur en avant et en arrière (L293D)"], flow: ["2 Richtungs-Pins + PWM", "L293D", "Motor"],
  d: ["Eine H-Brücke polt den Motor um. Die beiden Eingänge bestimmen die Richtung, das PWM-Signal am Enable-Pin die Drehzahl. Stell Richtung und Tastgrad ein und sieh die beiden Motorklemmen.", "Un pont en H inverse le moteur : deux entrées pour le sens, le PWM sur Enable pour la vitesse."],
  opts: [{ k: "dir", l: ["Richtung", "Sens"], o: [["v", "vorwärts (1A = H, 2A = L)"], ["r", "rückwärts (1A = L, 2A = H)"], ["b", "bremsen (1A = 2A)"], ["f", "frei laufen (EN = LOW)"]], def: "v" }],
  params: [{ k: "d", l: ["Tastgrad (PWM)", "Rapport cyclique (PWM)"], min: 0, max: 100, def: 60, int: 1, u: "%" }, { k: "Vm", l: ["Motor-Versorgung", "Alimentation moteur"], min: 5, max: 24, def: 9, int: 1, u: "V" }],
  build: function(P){ var f = 1000, d = P.d / 100, Vm = P.Vm, hi = Vm - 1.4, lo = 1.2, m = P.dir, w = [];
    function en(t){ return m === "f" ? 0 : sq(t, f, .0002, d); }
    function o(t, a){ if (!en(t)) return Vm / 2; if (m === "b") return lo; return (m === "v") === a ? hi : lo; }
    if (Vm < 6) w.push(T("Im L293D gehen etwa 2,6 V verloren – bei kleiner Versorgung bleibt wenig für den Motor.", "Environ 2,6 V sont perdus dans le L293D."));
    var um = m === "v" || m === "r" ? d * (hi - lo) : 0;
    return { span: .0042, warn: w, ch: [{ n: "EN (PWM)", c: C.amber, lo: 0, hi: 24, v: function(t){ return en(t) * 5; } }, { n: "Klemme 1Y", c: C.green, lo: 0, hi: 24, v: function(t){ return o(t, true); } }, { n: "Klemme 2Y", c: C.cyan, lo: 0, hi: 24, v: function(t){ return o(t, false); } }],
      info: [[T("Mittlere Motorspannung", "Tension moyenne du moteur"), fmt(um, "V")], [T("Drehrichtung", "Sens de rotation"), m === "v" ? T("vorwärts", "avant") : m === "r" ? T("rückwärts", "arrière") : m === "b" ? T("gebremst", "freiné") : T("frei", "libre")], [T("Verlust im IC (bei 0,3 A)", "Pertes dans le CI (0,3 A)"), fmt(2.6 * .3 * (um ? d : 0), "W")]],
      live: function(){ return { leds: [m === "v" && d > 0 ? 1 : 0, m === "r" && d > 0 ? 1 : 0], names: [T("vorwärts", "avant"), T("rückwärts", "arrière")] }; } }; },
  wire: [["Pin 16 → +5 V (Logik), Pin 8 → Motor-Versorgung", "Broche 16 → +5 V, 8 → alimentation moteur"], ["Pin 4, 5, 12, 13 → GND (führen auch die Wärme ab)", "Broches 4, 5, 12, 13 → GND"], ["Pin 1 (EN) = PWM vom Mikrocontroller", "Broche 1 (EN) = PWM"], ["Pin 2 (1A) und Pin 7 (2A) = Richtung", "Broches 2 et 7 = sens"], ["Motor zwischen Pin 3 (1Y) und Pin 6 (2Y), 100 nF direkt am Motor", "Moteur entre 3 et 6, 100 nF sur le moteur"]],
  notes: [["Die Freilaufdioden stecken im L293D schon drin (das „D“). Beim L293 ohne D müssen vier Dioden außen dran.", "Les diodes sont intégrées au L293D."], ["Höchstens 600 mA je Kanal. Für größere Motoren: L298N oder ein MOSFET-Treiber.", "600 mA max. par canal."]] };

PROJ.pc817 = { t: ["Galvanisch trennen mit dem Optokoppler (PC817)", "Isolation galvanique par optocoupleur (PC817)"], flow: ["Signal A", "LED → Fototransistor", "Signal B"],
  d: ["Innen leuchtet eine LED auf einen Fototransistor – es gibt keine elektrische Verbindung zwischen Ein- und Ausgang. So bleiben zwei Stromkreise getrennt. Der Ausgang ist invertiert.", "Une LED éclaire un phototransistor : aucune liaison électrique entre entrée et sortie. La sortie est inversée."],
  opts: [{ k: "vin", l: ["Pegel am Eingang", "Niveau d’entrée"], o: [["3.3", "3,3 V"], ["5", "5 V"], ["12", "12 V"], ["24", "24 V"]], def: "5" }],
  params: [PRx("R", "Vorwiderstand der LED", 100, 22e3, 330), PRx("Rp", "Pull-up am Ausgang", 1e3, 100e3, 10e3), PF(2, .5, 2000)],
  build: function(P){ var Vi = +P.vin, If = Math.max(0, (Vi - 1.2) / P.R), Ic = Math.min(If, 5 / P.Rp), vl = Math.max(.2, 5 - Ic * P.Rp), w = [], f = P.f;
    if (vl > 1.2) w.push(T("Der Ausgang wird nicht sauber LOW (" + fmt(vl, "V") + "): Vorwiderstand kleiner oder Pull-up größer wählen.", "La sortie n’atteint pas un LOW franc."));
    if (If > .05) w.push(T("Über 50 mA durch die LED – Vorwiderstand größer wählen.", "Plus de 50 mA dans la LED."));
    return { span: 3.2 / f, fmain: f, warn: w, ch: [{ n: "Eingang", c: C.amber, lo: 0, hi: Math.max(5, Vi), v: function(t){ return sq(t, f, .25 / f, .5) * Vi; } }, { n: "Ausgang", c: C.green, lo: 0, hi: Math.max(5, Vi), v: function(t){ return sq(t, f, .25 / f, .5) ? vl : 5; } }],
      info: [[T("LED-Strom", "Courant de LED"), fmt(If, "A")], [T("Ausgangsstrom (CTR 100 %)", "Courant de sortie (CTR 100 %)"), fmt(Ic, "A")], [T("LOW-Pegel am Ausgang", "Niveau LOW en sortie"), fmt(vl, "V")]],
      live: function(ts){ return { leds: [sq(ts, f, 0, .5) ? 0 : 1], names: [T("Ausgang", "Sortie")] }; } }; },
  wire: [["Eingang → Vorwiderstand → Pin 1 (Anode); Pin 2 (Kathode) → Masse der Eingangsseite", "Entrée → résistance → broche 1 ; broche 2 → masse côté entrée"], ["Pin 4 (Kollektor) → Pull-up nach +5 V der Ausgangsseite = Ausgang", "Broche 4 → pull-up vers +5 V = sortie"], ["Pin 3 (Emitter) → Masse der Ausgangsseite", "Broche 3 → masse côté sortie"], ["Die beiden Massen NICHT verbinden – sonst ist die Trennung weg", "Ne PAS relier les deux masses"]],
  notes: [["Im Schaltplan sind beide Massen der Einfachheit halber gleich gezeichnet. In echt sind es zwei getrennte Stromkreise.", "Sur le schéma les deux masses sont dessinées identiques ; en réalité elles sont séparées."], ["Der PC817 ist langsam (einige kHz). Für schnelle Signale: 6N137.", "Le PC817 est lent ; pour des signaux rapides : 6N137."]] };

PROJ.k_motor = { t: ["Drehzahl-Steller: 555-PWM → L293D → Motor", "Variateur : PWM 555 → L293D → moteur"], flow: ["NE555 (PWM)", "L293D", "Motor"], ics: ["ne555", "l293d"],
  d: ["Der 555 erzeugt ein Rechteck mit fester Frequenz, das Poti verschiebt nur das Tastverhältnis. Der L293D schaltet damit den Motor – je länger der Impuls, desto schneller dreht er.", "Le 555 produit un signal à fréquence fixe ; le potentiomètre règle le rapport cyclique, le L293D commute le moteur."],
  params: [{ k: "pos", l: ["Poti-Stellung", "Position du potentiomètre"], min: 5, max: 95, def: 50, int: 1, u: "%" }, { k: "Vm", l: ["Motor-Versorgung", "Alimentation moteur"], min: 5, max: 24, def: 9, int: 1, u: "V" }],
  build: function(P){ var f = 1 / (.693 * 101e3 * 10e-9), d = P.pos / 100, Vm = P.Vm, hi = Vm - 1.4, lo = 1.2;
    return { span: 3.2 / f, fmain: f, warn: [], ch: [{ n: "555 OUT = EN", c: C.amber, lo: 0, hi: 24, v: function(t){ return sq(t, f, .1 / f, d) * 5; } }, { n: "Motor 1Y", c: C.green, lo: 0, hi: 24, v: function(t){ return sq(t, f, .1 / f, d) ? hi : Vm / 2; } }, { n: "Motor 2Y", c: C.cyan, lo: 0, hi: 24, v: function(t){ return sq(t, f, .1 / f, d) ? lo : Vm / 2; } }],
      info: [[T("PWM-Frequenz", "Fréquence PWM"), fmt(f, "Hz")], [T("Tastgrad", "Rapport cyclique"), P.pos + " %"], [T("Mittlere Motorspannung", "Tension moyenne du moteur"), fmt(d * (hi - lo), "V")]],
      live: function(){ return { leds: [d > .15 ? 1 : 0], names: [T("Motor dreht", "Moteur tourne")] }; } }; },
  wire: [["NE555: Pin 8 und 4 → +5 V, Pin 1 → GND, Pin 5 → 10 nF → GND", "NE555 : 8 et 4 → +5 V, 1 → GND, 5 → 10 nF → GND"], ["1 kΩ von +5 V an Pin 7; von Pin 7 über zwei Dioden (gegensinnig) an die beiden Enden des 100-kΩ-Potis", "1 kΩ de +5 V à 7 ; de 7 par deux diodes opposées aux extrémités du potentiomètre 100 kΩ"], ["Poti-Schleifer an Pin 2 und 6, von dort 10 nF nach GND", "Curseur sur 2 et 6, puis 10 nF vers GND"], ["555 Pin 3 → L293D Pin 1 (EN)", "555 broche 3 → L293D broche 1 (EN)"], ["L293D: Pin 2 (1A) → +5 V, Pin 7 (2A) → GND, Motor an Pin 3 und 6", "L293D : 2 → +5 V, 7 → GND, moteur sur 3 et 6"]],
  notes: [["Die beiden Dioden trennen Lade- und Entladeweg – deshalb bleibt die Frequenz gleich, wenn du am Poti drehst.", "Les deux diodes séparent charge et décharge : la fréquence reste constante."]] };

PROJ.k_relais = { t: ["Lauflicht mit Last: 555 → CD4017 → ULN2003 → Lampen", "Chenillard de puissance : 555 → CD4017 → ULN2003"], flow: ["NE555", "CD4017", "ULN2003", "4 × Lampe 12 V"], ics: ["ne555", "cd4017", "uln2003"],
  d: ["Der 4017 kann nur LEDs treiben. Mit dem ULN2003 dahinter schaltet dasselbe Lauflicht 12-V-Lampen, Relais oder Magnetventile. Q4 setzt den Zähler zurück – so laufen genau vier Schritte.", "Avec un ULN2003 derrière le 4017, le chenillard commute des lampes 12 V ou des relais."],
  params: [PR1, { k: "R2", l: ["R2 (Tempo)", "R2 (vitesse)"], min: 1e3, max: 2e6, def: 220e3, log: 1, u: "Ω", e12: 1 }, { k: "C", l: ["C", "C"], min: 1e-9, max: 1e-3, def: 1e-6, log: 1, u: "F", e12: 1 }],
  build: function(P){ var k = c555(P.R1, P.R2, P.C, 5), ph = k.T * .25;
    return { span: ph + 5.4 * k.T, fmain: k.f, warn: [], ch: [{ n: "555 OUT = CLK", c: C.amber, lo: 0, hi: 12, v: function(t){ return k.out(t, ph) * 5; } }, { n: "4017 Q0", c: C.green, lo: 0, hi: 12, v: function(t){ return k.n(t, ph) % 4 === 0 ? 5 : 0; } }, { n: "ULN Ausgang 1 (Lampe 1)", c: C.cyan, lo: 0, hi: 12, v: function(t){ return k.n(t, ph) % 4 === 0 ? .9 : 12; } }],
      info: [[T("Takt (555)", "Horloge"), fmt(k.f, "Hz")], [T("Ein Umlauf (4 Schritte)", "Un tour (4 pas)"), fmt(4 * k.T, "s")]],
      live: function(ts){ var s = k.n(ts, ph) % 4, a = []; for (var i = 0; i < 4; i++) a.push(i === s ? 1 : 0); return { leds: a, names: a.map(function(x, i){ return T("Lampe ", "Lampe ") + (i + 1); }) }; } }; },
  wire: [["NE555 wie im Blinker aufbauen, Pin 3 → CD4017 Pin 14 (CLK)", "NE555 comme le clignotant, broche 3 → 4017 broche 14"], ["CD4017: Pin 16 → +5 V, Pin 8 und 13 → GND; Q4 (Pin 10) → RESET (Pin 15)", "4017 : 16 → +5 V, 8 et 13 → GND ; Q4 (10) → RESET (15)"], ["Q0…Q3 (Pin 3, 2, 4, 7) → ULN2003 Eingänge Pin 1…4", "Q0…Q3 → entrées 1…4 de l’ULN2003"], ["ULN2003: Pin 8 → GND, Pin 9 → +12 V", "ULN2003 : 8 → GND, 9 → +12 V"], ["Lampen zwischen +12 V und den Ausgängen Pin 16…13", "Lampes entre +12 V et les sorties 16…13"]],
  notes: [["Logik (5 V) und Last (12 V) haben getrennte Versorgungen, aber eine gemeinsame Masse.", "Logique (5 V) et charge (12 V) : alimentations séparées, masse commune."]] };

/* ---------- Bausteine der individuellen Projekte ---------- */
var CUST = {};
CUST.gates = function(box){
  var G = [["NAND", "7400", function(a, b){ return !(a && b); }], ["NOR", "7402", function(a, b){ return !(a || b); }], ["AND", "7408", function(a, b){ return a && b; }], ["OR", "7432", function(a, b){ return a || b; }], ["XOR", "7486", function(a, b){ return a !== b; }], ["NOT", "7404", function(a){ return !a; }]];
  var sel = 0, A = false, B = false, w = el("div", "ic-cust"); box.appendChild(w);
  var cr = el("div", "ic-chips"); w.appendChild(cr); var ctl = el("div", "ic-chips"); w.appendChild(ctl);
  var ta = toggleBtn(ctl, "A", false, function(v){ A = v; upd(); }), tb = toggleBtn(ctl, "B", false, function(v){ B = v; upd(); });
  var out = el("div", "ic-out"); ctl.appendChild(out); var tab = el("div", "ic-tt"); w.appendChild(tab); var nd = el("div", "ic-nand"); w.appendChild(nd);
  G.forEach(function(g, i){ var b = el("button", "ic-ch" + (i === sel ? " on" : ""), g[0] + " <small>" + g[1] + "</small>"); b.type = "button"; b.onclick = function(){ sel = i; cr.querySelectorAll("button").forEach(function(x, j){ x.classList.toggle("on", j === i); }); upd(); }; cr.appendChild(b); });
  function b01(x){ return x ? 1 : 0; }
  function nand(a, b){ return !(a && b); }
  function upd(){ var g = G[sel], one = g[0] === "NOT"; tb.hidden = one; var y = g[2](A, B);
    out.innerHTML = '<span class="ic-big ' + (y ? "hi" : "lo") + '">Y = ' + b01(y) + "</span>";
    var rows = one ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]], h = "<table><tr>" + (one ? "<th>A</th>" : "<th>A</th><th>B</th>") + "<th>Y</th></tr>";
    rows.forEach(function(r){ var cur = one ? r[0] === b01(A) : r[0] === b01(A) && r[1] === b01(B); h += "<tr" + (cur ? ' class="cur"' : "") + "><td>" + r[0] + "</td>" + (one ? "" : "<td>" + r[1] + "</td>") + "<td>" + b01(g[2](!!r[0], !!r[1])) + "</td></tr>"; });
    tab.innerHTML = h + "</table>";
    var nt = nand(A, A), an = nand(nand(A, B), nand(A, B)), or = nand(nand(A, A), nand(B, B));
    nd.innerHTML = "<h4>" + T("Alles aus NAND (das „Universal-Gatter“)", "Tout avec des NAND") + "</h4><ul><li>NOT = 1 × NAND <span>(A an beide Eingänge)</span> → <b>" + b01(nt) + "</b></li><li>AND = 2 × NAND <span>(NAND, dann als NOT)</span> → <b>" + b01(an) + "</b></li><li>OR = 3 × NAND <span>(erst A und B negieren, dann NAND)</span> → <b>" + b01(or) + "</b></li></ul>"; }
  upd(); return {};
};
CUST.shift = function(box){
  var byte = 0xB2, step = 0, w = el("div", "ic-cust"); box.appendChild(w);
  var rb = el("div", "ic-chips"); w.appendChild(rb); rb.appendChild(el("span", "ic-lb", T("Byte (MSB zuerst gesendet):", "Octet (MSB d’abord) :")));
  var tgs = []; for (var i = 7; i >= 0; i--) (function(i){ tgs.push(toggleBtn(rb, "D" + i, (byte >> i) & 1, function(v){ byte = v ? byte | (1 << i) : byte & ~(1 << i); upd(); })); })(i);
  var val = el("div", "ic-lb"); w.appendChild(val);
  var sr = el("div", "ic-chips"); w.appendChild(sr); var sl = el("input"); sl.type = "range"; sl.min = 0; sl.max = 9; sl.value = 0; sl.className = "ic-range"; sr.appendChild(el("span", "ic-lb", T("Takt:", "Coup :"))); sr.appendChild(sl); var sv2 = el("b", "ic-lb"); sr.appendChild(sv2);
  w.appendChild(el("div", "ic-lb", T("Schieberegister (intern)", "Registre à décalage (interne)"))); var r1 = ledRow(w, 8, ["QA", "QB", "QC", "QD", "QE", "QF", "QG", "QH"], C.cyan);
  w.appendChild(el("div", "ic-lb", T("Ausgänge nach RCLK-Impuls", "Sorties après RCLK"))); var r2 = ledRow(w, 8, ["QA", "QB", "QC", "QD", "QE", "QF", "QG", "QH"], C.red);
  var cv = el("div", "ic-scopebox"), cnv = el("canvas"); cv.appendChild(cnv); w.appendChild(cv);
  function upd(){ step = +sl.value; var bits = []; for (var k = 0; k < 8; k++) bits.push((byte >> (7 - k)) & 1);
    var j = Math.min(step, 8), reg = []; for (var i = 0; i < 8; i++) reg.push(j - 1 - i >= 0 ? bits[j - 1 - i] : 0);
    r1.set(reg); r2.set(step === 9 ? reg : [0, 0, 0, 0, 0, 0, 0, 0]);
    val.textContent = T("Wert: ", "Valeur : ") + byte + "  =  0b" + ("00000000" + byte.toString(2)).slice(-8) + "  =  0x" + ("0" + byte.toString(16)).slice(-2).toUpperCase();
    sv2.textContent = step === 0 ? T("Start", "Départ") : step < 9 ? T("Bit ", "Bit ") + step + "/8 " + T("eingetaktet", "décalé") : "RCLK ✓";
    var U = 1e-6, span = 20 * U;
    scope(cnv, [{ n: "SER (Pin 14)", c: C.amber, lo: 0, hi: 5, v: function(t){ var u = t / U, k = Math.floor(u / 2); return (k < 8 ? bits[k] : bits[7]) * 5; } }, { n: "SRCLK (Pin 11)", c: C.cyan, lo: 0, hi: 5, v: function(t){ var u = t / U; return u < 16 && (u % 2) >= 1 ? 5 : 0; } }, { n: "RCLK (Pin 12)", c: C.pink, lo: 0, hi: 5, v: function(t){ var u = t / U; return u >= 17 && u < 18 ? 5 : 0; } }, { n: "QH (erstes Bit)", c: C.green, lo: 0, hi: 5, v: function(t){ var u = t / U; return u >= 18 ? bits[0] * 5 : 0; } }, { n: "QA (letztes Bit)", c: C.lime, lo: 0, hi: 5, v: function(t){ var u = t / U; return u >= 18 ? bits[7] * 5 : 0; } }], span); }
  sl.oninput = upd; upd(); return { after: upd };
};
CUST.dec138 = function(box){
  var w = el("div", "ic-cust"); box.appendChild(w); var s = { a0: 0, a1: 0, a2: 0, e1: 0, e2: 0, e3: 1 }, tb = el("div", "ic-chips"); w.appendChild(tb);
  [["A0", "a0"], ["A1", "a1"], ["A2", "a2"], ["/E1", "e1"], ["/E2", "e2"], ["E3", "e3"]].forEach(function(x){ toggleBtn(tb, x[0], s[x[1]], function(v){ s[x[1]] = v ? 1 : 0; upd(); }); });
  var txt = el("div", "ic-lb"); w.appendChild(txt); var names = []; for (var i = 0; i < 8; i++) names.push("Y" + i); var lr = ledRow(w, 8, names, C.red); var lv = el("div", "ic-lb"); w.appendChild(lv);
  function upd(){ var en = !s.e1 && !s.e2 && s.e3, idx = s.a2 * 4 + s.a1 * 2 + s.a0, a = [], p = []; for (var i = 0; i < 8; i++){ a.push(en && i === idx ? 1 : 0); p.push(en && i === idx ? 0 : 1); }
    txt.textContent = T("Adresse = ", "Adresse = ") + idx + (en ? "  →  Y" + idx + " = LOW" : T("   (Chip gesperrt: alle Ausgänge HIGH)", "   (puce inactive : toutes les sorties à 1)")); lr.set(a); lv.textContent = T("Pegel Y0…Y7: ", "Niveaux Y0…Y7 : ") + p.join(" ") + T("   – LED leuchtet, wenn der Ausgang LOW ist (LED an +V).", "   – la LED s’allume à l’état bas."); }
  upd(); return {};
};
CUST.bcd7 = function(box){
  var w = el("div", "ic-cust"); box.appendChild(w); var s = { A: 1, B: 0, C: 1, D: 0, lt: 1, bi: 1 }, tb = el("div", "ic-chips"); w.appendChild(tb);
  [["D", "D"], ["C", "C"], ["B", "B"], ["A", "A"], ["/LT", "lt"], ["/BI", "bi"]].forEach(function(x){ toggleBtn(tb, x[0], s[x[1]], function(v){ s[x[1]] = v ? 1 : 0; upd(); }); });
  var row = el("div", "ic-row2"); w.appendChild(row); var sg = seg7(row), tx = el("div", "ic-lb"); row.appendChild(tx);
  function upd(){ var d = s.D * 8 + s.C * 4 + s.B * 2 + s.A, bits = d <= 9 ? DIG[d] : 0; if (!s.bi) bits = 0; if (!s.lt) bits = 0x7F; sg.setBits(bits);
    tx.innerHTML = T("Eingang", "Entrée") + " DCBA = <b>" + ("0000" + d.toString(2)).slice(-4) + "</b> (" + d + ")<br>" + T("Segmente a…g:", "Segments a…g :") + " <b>" + "abcdefg".split("").map(function(l, i){ return (bits >> i) & 1 ? l : "·"; }).join(" ") + "</b>" + (!s.lt ? "<br>" + T("Lampentest: /LT = 0 schaltet alle Segmente ein", "Test : /LT = 0 allume tout") : !s.bi ? "<br>" + T("Dunkeltastung: /BI = 0", "Extinction : /BI = 0") : d > 9 ? "<br>" + T("Werte 10…15 zeigt der CD4511 dunkel", "10…15 : afficheur éteint") : ""); }
  upd(); return {};
};
CUST.reg317 = function(box, P, ctx, redraw){
  var w = el("div", "ic-cust"); box.appendChild(w); w.appendChild(el("div", "ic-lb", T("Vorgaben für R2 (mit dem gewählten R1):", "Préréglages R2 :")));
  var pr = el("div", "ic-chips"); w.appendChild(pr);
  [3.3, 5, 9, 12, 15].forEach(function(v){ var b = el("button", "ic-ch", v + " V"); b.type = "button"; b.onclick = function(){ var r2 = (v / 1.25 - 1) * P.R1; if (P.Vin < v + 3.5) ctx.setP("Vin", Math.min(35, Math.ceil(v + 4))); ctx.setP("R2", clamp(r2, 10, 5000)); }; pr.appendChild(b); });
  var g = el("div", "ic-gauge"); g.innerHTML = '<div class="ic-gv"></div><span></span>'; w.appendChild(g);
  return { after: function(res){ var gv = g.firstChild; gv.style.width = Math.min(100, res.vout / res.vin * 100) + "%"; gv.className = "ic-gv" + (res.vin - res.vout < 3 ? " bad" : ""); g.lastChild.textContent = fmt(res.vout, "V") + " / " + fmt(res.vin, "V"); } };
};
PROJ.lm317.opts = [{ k: "R1", l: ["R1", "R1"], o: [[120, "120 Ω"], [240, "240 Ω"], [330, "330 Ω"]], def: 240 }];
PROJ.lm317.params = [{ k: "Vin", l: ["Eingangsspannung", "Tension d’entrée"], min: 5, max: 35, def: 12, u: "V" }, { k: "R2", l: ["R2", "R2"], min: 10, max: 5000, def: 720, log: 1, u: "Ω" }, { k: "I", l: ["Laststrom", "Courant de charge"], min: .01, max: 1.5, def: .3, log: 1, u: "A" }];
PROJ.lm317.build = function(P){ var vout = 1.25 * (1 + P.R2 / P.R1) + 50e-6 * P.R2, pd = Math.max(0, (P.Vin - vout) * P.I), dT = pd * 50, w = [];
  if (P.Vin - vout < 3) w.push(T("Zu wenig Spannungsreserve: der LM317 braucht Vin ≥ Vout + ca. 3 V, sonst bricht die Ausgangsspannung ein.", "Marge insuffisante : il faut Vin ≥ Vout + 3 V."));
  if (pd > 2) w.push(T("Verlustleistung über 2 W – ohne Kühlkörper wird der Regler zu heiß.", "Plus de 2 W : radiateur nécessaire."));
  if (P.I < .01) w.push(T("Mindestlast ca. 10 mA beachten.", "Charge minimale ≈ 10 mA."));
  return { vout: vout, vin: P.Vin, warn: w, info: [[T("Ausgangsspannung = 1,25·(1 + R2/R1)", "Tension de sortie"), fmt(vout, "V")], [T("Spannung über dem Regler", "Chute dans le régulateur"), fmt(P.Vin - vout, "V")], [T("Verlustleistung", "Puissance dissipée"), fmt(pd, "W")], [T("Erwärmung ohne Kühlkörper (≈ 50 K/W)", "Échauffement sans radiateur"), "≈ " + Math.round(dT) + " K"], [T("Ausgangsleistung", "Puissance utile"), fmt(vout * P.I, "W")]] }; };
/* ---------- Verbindungslisten (Netlisten) + Schaltplan ---------- */
var PARTIC = {
  seg7: { id: "seg7", name: "7-Segment (gem. Kathode)", pkg: "DIP-10", pins: ["e:o", "d:o", "K:g", "c:o", "DP:o", "b:o", "a:o", "K:g", "f:o", "g:o"] },
  bc337: { id: "bc337", name: "BC337 (NPN)", pkg: "TO-92", pins: ["C:o", "B:i", "E:g"], sip: 1 },
  lm317t: { id: "lm317t", name: "LM317", pkg: "TO-220", pins: ["ADJ:i", "OUT:o", "IN:v"], sip: 1 }
};
var NL = {};
function ledsOn(nl, pins, rv, col, pre, hi){
  pins.forEach(function(p, i){ var r = pre + "R" + (i + 1), d = pre + "D" + (i + 1); nl.parts[r] = ["R", rv]; nl.parts[d] = ["LED", col];
    if (hi){ nl.nets[pre + "Q" + (i + 1)] = [r + ".1"]; (nl.nets.VCC = nl.nets.VCC || []).push(r + ".1"); delete nl.nets[pre + "Q" + (i + 1)]; nl.nets[pre + "L" + (i + 1)] = [r + ".2", d + ".1"]; nl.nets[pre + "Y" + (i + 1)] = [d + ".2", p]; }
    else { nl.nets[pre + "Q" + (i + 1)] = [p, r + ".1"]; nl.nets[pre + "L" + (i + 1)] = [r + ".2", d + ".1"]; (nl.nets.GND = nl.nets.GND || []).push(d + ".2"); } });
}
function nmk(parts, nets){ return { parts: parts, nets: nets }; }
NL.ne555a = nmk({ U1: "ne555", R1: ["R", "$R1"], R2: ["R", "$R2"], C1: ["C", "$C"], C2: ["C", 10e-9], R3: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.8", "U1.4", "R1.1"], GND: ["U1.1", "C1.2", "C2.2", "D1.2"], ENTLADEN: ["R1.2", "U1.7", "R2.1"], KONDENSATOR: ["R2.2", "U1.6", "U1.2", "C1.1"], CTRL: ["U1.5", "C2.1"], OUT: ["U1.3", "R3.1"], LED: ["R3.2", "D1.1"] });
NL.ne555m = nmk({ U1: "ne555", R1: ["R", "$R"], C1: ["C", "$C"], R2: ["R", 10e3], SW1: ["SW", "Taster"], C2: ["C", 10e-9], R3: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.8", "U1.4", "R1.1", "R2.1"], GND: ["U1.1", "C1.2", "SW1.2", "C2.2", "D1.2"], ZEIT: ["R1.2", "U1.7", "U1.6", "C1.1"], TRIG: ["U1.2", "R2.2", "SW1.1"], CTRL: ["U1.5", "C2.1"], OUT: ["U1.3", "R3.1"], LED: ["R3.2", "D1.1"] });
NL.hc14 = nmk({ U1: "hc14", R1: ["R", "$R"], C1: ["C", "$C"], C2: ["C", 100e-9], R2: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.14", "C2.1"], GND: ["U1.7", "C2.2", "C1.2", "D1.2", "U1.3", "U1.5", "U1.9", "U1.11", "U1.13"], OUT: ["U1.2", "R1.1", "R2.1"], IN: ["R1.2", "U1.1", "C1.1"], LED: ["R2.2", "D1.1"] });
NL.hc00 = nmk({ U1: "hc00", SW1: ["SW", "A"], SW2: ["SW", "B"], R1: ["R", 10e3], R2: ["R", 10e3], R3: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.14", "SW1.1", "SW2.1"], GND: ["U1.7", "R1.2", "R2.2", "D1.2", "U1.4", "U1.5", "U1.9", "U1.10", "U1.12", "U1.13"], A: ["SW1.2", "R1.1", "U1.1"], B: ["SW2.2", "R2.1", "U1.2"], Y: ["U1.3", "R3.1"], LED: ["R3.2", "D1.1"] });
NL.hc74 = nmk({ U1: "hc74", G1: ["G", "Takt"], R1: ["R", 330], D1: ["LED", "#6dffb0"], R2: ["R", 330], D2: ["LED", "#ffb000"] },
  { VCC: ["U1.14", "U1.4", "U1.1", "U1.10", "U1.13"], GND: ["U1.7", "D1.2", "D2.2"], RUECK1: ["U1.6", "U1.2"], TAKT: ["G1.1", "U1.3"], Q1: ["U1.5", "U1.11", "R1.1"], RUECK2: ["U1.8", "U1.12"], Q2: ["U1.9", "R2.1"], L1: ["R1.2", "D1.1"], L2: ["R2.2", "D2.1"] });
(function(){ var n = nmk({ U1: "cd4017", G1: ["G", "Takt"] }, { VCC: ["U1.16"], GND: ["U1.8", "U1.13", "U1.15"], TAKT: ["G1.1", "U1.14"] }); ledsOn(n, ["U1.3", "U1.2", "U1.4", "U1.7", "U1.10", "U1.1", "U1.5", "U1.6", "U1.9", "U1.11"], 1000, "#ff4d4d", "", 0); NL.cd4017 = n; })();
NL.cd4060 = nmk({ U1: "cd4060", X1: ["XTAL", "32,768 kHz"], C1: ["C", 22e-12], C2: ["C", 22e-12], R1: ["R", 10e6], R2: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.16"], GND: ["U1.8", "U1.12", "C1.2", "C2.2", "D1.2"], XEIN: ["U1.11", "X1.1", "C1.1", "R1.1"], XAUS: ["U1.10", "X1.2", "C2.1"], RF: ["U1.9", "R1.2"], Q14: ["U1.3", "R2.1"], LED: ["R2.2", "D1.1"] });
(function(){ var n = nmk({ U1: "hc160", G1: ["G", "Takt"] }, { VCC: ["U1.16", "U1.1", "U1.7", "U1.9", "U1.10"], GND: ["U1.8", "U1.3", "U1.4", "U1.5", "U1.6"], TAKT: ["G1.1", "U1.2"] }); ledsOn(n, ["U1.14", "U1.13", "U1.12", "U1.11"], 330, "#6dffb0", "", 0); NL.hc160 = n; })();
(function(){ var n = nmk({ U1: "hc595", G1: ["G", "Daten"], G2: ["G", "Schiebetakt"], G3: ["G", "Übernahme"] }, { VCC: ["U1.16", "U1.10"], GND: ["U1.8", "U1.13"], SER: ["G1.1", "U1.14"], SRCLK: ["G2.1", "U1.11"], RCLK: ["G3.1", "U1.12"] }); ledsOn(n, ["U1.15", "U1.1", "U1.2", "U1.3", "U1.4", "U1.5", "U1.6", "U1.7"], 330, "#ffb000", "", 0); NL.hc595 = n; })();
(function(){ var n = nmk({ U1: "hc138", G1: ["G", "A0"], G2: ["G", "A1"], G3: ["G", "A2"] }, { VCC: ["U1.16", "U1.6"], GND: ["U1.8", "U1.4", "U1.5"], A0: ["G1.1", "U1.1"], A1: ["G2.1", "U1.2"], A2: ["G3.1", "U1.3"] }); ledsOn(n, ["U1.15", "U1.14", "U1.13", "U1.12", "U1.11", "U1.10", "U1.9", "U1.7"], 330, "#ff4d4d", "", 1); NL.hc138 = n; })();
(function(){ var n = nmk({ U1: "cd4511", G1: ["G", "A"], G2: ["G", "B"], G3: ["G", "C"], G4: ["G", "D"], S1: "seg7" }, { VCC: ["U1.16", "U1.3", "U1.4"], GND: ["U1.8", "U1.5", "S1.3", "S1.8"], A: ["G1.1", "U1.7"], B: ["G2.1", "U1.1"], C: ["G3.1", "U1.2"], D: ["G4.1", "U1.6"] });
  [[13, 7], [12, 6], [11, 4], [10, 2], [9, 1], [15, 9], [14, 10]].forEach(function(x, i){ var r = "R" + (i + 1); n.parts[r] = ["R", 330]; n.nets["seg" + "abcdefg".charAt(i)] = ["U1." + x[0], r + ".1"]; n.nets["S" + "abcdefg".charAt(i)] = [r + ".2", "S1." + x[1]]; }); NL.cd4511 = n; })();
NL.lm358 = nmk({ U1: "lm358", G1: ["G", "Uin"], R1: ["R", "$R1"], R2: ["R", "$R2"], P1: ["G", "Uout"] },
  { VCC: ["U1.8"], GND: ["U1.4", "R1.2"], IN: ["G1.1", "U1.3"], FB: ["U1.2", "R1.1", "R2.2"], OUT: ["U1.1", "R2.1", "P1.1"] });
NL.lm393 = nmk({ U1: "lm393", G1: ["G", "Uin"], R1: ["R", 10e3], Rh: ["R", 1e6], R2: ["R", 10e3], R3: ["R", 10e3], Rp: ["R", 10e3], R4: ["R", 330], D1: ["LED", "#ff4d4d"] },
  { VCC: ["U1.8", "R2.1", "Rp.1", "R4.1"], GND: ["U1.4", "R3.2"], REF: ["R2.2", "R3.1", "U1.2"], SIG: ["G1.1", "R1.1"], PLUS: ["R1.2", "U1.3", "Rh.1"], OUT: ["U1.1", "Rp.2", "Rh.2", "D1.2"], LED: ["R4.2", "D1.1"] });
NL.lm317 = nmk({ U1: "lm317t", C1: ["C", 330e-9], C2: ["C", 1e-6], R1: ["R", 240], R2: ["R", 2e3], D1: ["D", "1N4007"], G1: ["G", "Vin"], P1: ["G", "Vout"] },
  { IN: ["G1.1", "U1.IN", "C1.1", "D1.2"], OUT: ["U1.OUT", "C2.1", "R1.1", "D1.1", "P1.1"], ADJ: ["U1.ADJ", "R1.2", "R2.1"], GND: ["C1.2", "C2.2", "R2.2"] });
(function(){ var n = nmk({ U1: "ne555", U2: "cd4017", R1: ["R", "$R1"], R2: ["R", "$R2"], C1: ["C", "$C"], C2: ["C", 10e-9] },
  { VCC: ["U1.8", "U1.4", "R1.1", "U2.16"], GND: ["U1.1", "C1.2", "C2.2", "U2.8", "U2.13", "U2.15"], ENTLADEN: ["R1.2", "U1.7", "R2.1"], KONDENSATOR: ["R2.2", "U1.6", "U1.2", "C1.1"], CTRL: ["U1.5", "C2.1"], TAKT: ["U1.3", "U2.14"] });
  ledsOn(n, ["U2.3", "U2.2", "U2.4", "U2.7", "U2.10", "U2.1", "U2.5", "U2.6", "U2.9", "U2.11"], 1000, "#ff4d4d", "", 0); NL.k_lauf = n; })();
NL.k_uhr = nmk({ U1: "cd4060", U2: "hc74", X1: ["XTAL", "32,768 kHz"], C1: ["C", 22e-12], C2: ["C", 22e-12], R1: ["R", 10e6], R2: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.16", "U2.14", "U2.4", "U2.1"], GND: ["U1.8", "U1.12", "C1.2", "C2.2", "U2.7", "D1.2"], XEIN: ["U1.11", "X1.1", "C1.1", "R1.1"], XAUS: ["U1.10", "X1.2", "C2.1"], RF: ["U1.9", "R1.2"], TAKT: ["U1.3", "U2.3"], RUECK: ["U2.6", "U2.2"], Q: ["U2.5", "R2.1"], LED: ["R2.2", "D1.1"] });
(function(){ var n = nmk({ U1: "ne555", U2: "hc160", U3: "cd4511", S1: "seg7", R1: ["R", "$R1"], R2: ["R", "$R2"], C1: ["C", "$C"], C2: ["C", 10e-9] },
  { VCC: ["U1.8", "U1.4", "R1.1", "U2.16", "U2.1", "U2.7", "U2.9", "U2.10", "U3.16", "U3.3", "U3.4"], GND: ["U1.1", "C1.2", "C2.2", "U2.8", "U2.3", "U2.4", "U2.5", "U2.6", "U3.8", "U3.5", "S1.3", "S1.8"], ENTLADEN: ["R1.2", "U1.7", "R2.1"], KONDENSATOR: ["R2.2", "U1.6", "U1.2", "C1.1"], CTRL: ["U1.5", "C2.1"], TAKT: ["U1.3", "U2.2"], A: ["U2.14", "U3.7"], B: ["U2.13", "U3.1"], C: ["U2.12", "U3.2"], D: ["U2.11", "U3.6"] });
  [[13, 7], [12, 6], [11, 4], [10, 2], [9, 1], [15, 9], [14, 10]].forEach(function(x, i){ var r = "R" + (i + 3); n.parts[r] = ["R", 330]; n.nets["seg" + "abcdefg".charAt(i)] = ["U3." + x[0], r + ".1"]; n.nets["S" + "abcdefg".charAt(i)] = [r + ".2", "S1." + x[1]]; }); NL.k_zaehl = n; })();
NL.k_daemm = nmk({ LDR1: ["LDR", "LDR"], R1: ["R", 10e3], U1: "lm393", R2: ["R", 10e3], R3: ["R", 10e3], Rp: ["R", 10e3], Rh: ["R", 1e6], Rb: ["R", 1e3], Q1: "bc337", LP1: ["LAMP", "Lampe"] },
  { VCC: ["LDR1.1", "R2.1", "Rp.1", "LP1.1", "U1.8"], GND: ["R1.2", "R3.2", "U1.4", "Q1.E"], X: ["LDR1.2", "R1.1", "U1.2"], REF: ["R2.2", "R3.1", "U1.3", "Rh.1"], OUT: ["U1.1", "Rp.2", "Rh.2", "Rb.1"], BASIS: ["Rb.2", "Q1.B"], LAMPE: ["LP1.2", "Q1.C"] });
(function(){ var n = nmk({ SW1: ["SW", "Taster"], Rp: ["R", 10e3], R1: ["R", 10e3], C1: ["C", 100e-9], U1: "hc14", U2: "hc160" },
  { VCC: ["Rp.1", "U1.14", "U2.16", "U2.1", "U2.7", "U2.9", "U2.10"], GND: ["SW1.2", "C1.2", "U1.7", "U2.8", "U2.3", "U2.4", "U2.5", "U2.6", "U1.3", "U1.5", "U1.9", "U1.11", "U1.13"], TASTER: ["SW1.1", "Rp.2", "R1.1"], GLATT: ["R1.2", "U1.1", "C1.1"], TAKT: ["U1.2", "U2.2"] });
  ledsOn(n, ["U2.14", "U2.13", "U2.12", "U2.11"], 330, "#6dffb0", "", 0); NL.k_prell = n; })();
NL.k_sirene = nmk({ U1: "ne555", U2: "ne555", R1: ["R", 10e3], R2: ["R", 100e3], C1: ["C", 4.7e-6], C2: ["C", 10e-9], R3: ["R", 1e3], R4: ["R", 10e3], C3: ["C", 10e-9], R5: ["R", 10e3], C4: ["C", 100e-6, "pol"], SP1: ["SPK", "Lautsprecher 8 Ω"] },
  { VCC: ["U1.8", "U1.4", "R1.1", "U2.8", "U2.4", "R3.1"], GND: ["U1.1", "C1.2", "C2.2", "U2.1", "C3.2", "SP1.2"], ENTL1: ["R1.2", "U1.7", "R2.1"], LFO: ["R2.2", "U1.6", "U1.2", "C1.1", "R5.1"], CTRL1: ["U1.5", "C2.1"], MOD: ["R5.2", "U2.5"], ENTL2: ["R3.2", "U2.7", "R4.1"], VCO: ["R4.2", "U2.6", "U2.2", "C3.1"], AUDIO: ["U2.3", "C4.1"], LS: ["C4.2", "SP1.1"] });

/* --- Netzlisten der Erweiterung --- */
PARTIC.lm7805t = { id: "lm7805t", name: "LM7805", pkg: "TO-220", pins: ["IN:v", "GND:g", "OUT:o"], sip: 1 };
NL.cd4093 = nmk({ U1: "cd4093", SW1: ["SW", "Freigabe"], Rp: ["R", 10e3], R1: ["R", "$R"], C1: ["C", "$C"], R2: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.14", "SW1.1"], GND: ["U1.7", "Rp.2", "C1.2", "D1.2", "U1.5", "U1.6", "U1.8", "U1.9", "U1.12", "U1.13"], FREIGABE: ["SW1.2", "Rp.1", "U1.1"], RC: ["U1.2", "R1.2", "C1.1"], OUT: ["U1.3", "R1.1", "R2.1"], LED: ["R2.2", "D1.1"] });
(function(){ var n = nmk({ U1: "cd4040", G1: ["G", "Takt"] }, { VCC: ["U1.16"], GND: ["U1.8", "U1.11"], TAKT: ["G1.1", "U1.10"] }); ledsOn(n, ["U1.9", "U1.7", "U1.6", "U1.5", "U1.3", "U1.2", "U1.4", "U1.13"], 330, "#6dffb0", "", 0); NL.cd4040 = n; })();
NL.hc165 = nmk({ U1: "hc165", G1: ["G", "Laden"], G2: ["G", "Takt"], P1: ["G", "Daten"], SW1: ["SW", "Taster A"], R1: ["R", 10e3] },
  { VCC: ["U1.16", "SW1.1"], GND: ["U1.8", "U1.15", "U1.10", "R1.2"], LADEN: ["G1.1", "U1.1"], TAKT: ["G2.1", "U1.2"], DATEN: ["U1.9", "P1.1"], A: ["SW1.2", "R1.1", "U1.11"] });
NL.lm7805 = nmk({ U1: "lm7805t", G1: ["G", "Vin"], C1: ["C", 330e-9], C2: ["C", 100e-9], P1: ["G", "5 V"] },
  { IN: ["G1.1", "U1.IN", "C1.1"], OUT: ["U1.OUT", "C2.1", "P1.1"], GND: ["U1.GND", "C1.2", "C2.2"] });
NL.lm386 = nmk({ U1: "lm386", G1: ["G", "Audio"], C1: ["C", 220e-6, "pol"], C2: ["C", 100e-9], R1: ["R", 10], SP1: ["SPK", "Lautsprecher 8 Ω"] },
  { VCC: ["U1.6"], GND: ["U1.2", "U1.4", "R1.2", "SP1.2"], IN: ["G1.1", "U1.3"], OUT: ["U1.5", "C1.1", "C2.1"], ZOBEL: ["C2.2", "R1.1"], LS: ["C1.2", "SP1.1"] });
NL.npn = nmk({ G1: ["G", "Pin"], Rb: ["R", "$Rb"], Q1: "bc337", LP1: ["LAMP", "Last"], D1: ["D", "1N4007"] },
  { VCC: ["LP1.1", "D1.2"], GND: ["Q1.E"], EIN: ["G1.1", "Rb.1"], BASIS: ["Rb.2", "Q1.B"], KOLLEKTOR: ["LP1.2", "Q1.C", "D1.1"] });
NL.uln2003 = nmk({ U1: "uln2003", G1: ["G", "Pin"], LP1: ["LAMP", "Last"] },
  { VCC: ["U1.9", "LP1.1"], GND: ["U1.8"], EIN: ["G1.1", "U1.1"], AUS: ["U1.16", "LP1.2"] });
NL.l293d = nmk({ U1: "l293d", G1: ["G", "PWM"], G2: ["G", "1A"], G3: ["G", "2A"], G4: ["G", "Motor +V"], C1: ["C", 100e-9], LP1: ["LAMP", "Motor"] },
  { VCC: ["U1.16"], GND: ["U1.4", "U1.5", "U1.12", "U1.13"], VMOTOR: ["G4.1", "U1.8"], EN: ["G1.1", "U1.1"], A1: ["G2.1", "U1.2"], A2: ["G3.1", "U1.7"], M1: ["U1.3", "LP1.1", "C1.1"], M2: ["U1.6", "LP1.2", "C1.2"] });
NL.pc817 = nmk({ G1: ["G", "Eingang"], R1: ["R", "$R"], U1: "pc817", Rp: ["R", "$Rp"], P1: ["G", "Ausgang"] },
  { VCC: ["Rp.1"], GND: ["U1.2", "U1.3"], EIN: ["G1.1", "R1.1"], LED: ["R1.2", "U1.1"], AUS: ["Rp.2", "U1.4", "P1.1"] });
NL.k_motor = nmk({ U1: "ne555", U2: "l293d", R1: ["R", 1e3], Ra: ["R", "Poti-Hälfte A"], Rb: ["R", "Poti-Hälfte B"], D1: ["D", "1N4148"], D2: ["D", "1N4148"], C1: ["C", 10e-9], C2: ["C", 10e-9], G1: ["G", "Motor +V"], LP1: ["LAMP", "Motor"] },
  { VCC: ["U1.8", "U1.4", "R1.1", "U2.16", "U2.2"], GND: ["U1.1", "C1.2", "C2.2", "U2.4", "U2.5", "U2.12", "U2.13", "U2.7"], ENTLADEN: ["R1.2", "U1.7", "D1.1", "D2.2"], LADEN: ["D1.2", "Ra.1"], ZURUECK: ["D2.1", "Rb.1"], KONDENSATOR: ["Ra.2", "Rb.2", "U1.6", "U1.2", "C1.1"], CTRL: ["U1.5", "C2.1"], PWM: ["U1.3", "U2.1"], VMOTOR: ["G1.1", "U2.8"], M1: ["U2.3", "LP1.1"], M2: ["U2.6", "LP1.2"] });
NL.k_relais = nmk({ U1: "ne555", U2: "cd4017", U3: "uln2003", R1: ["R", "$R1"], R2: ["R", "$R2"], C1: ["C", "$C"], C2: ["C", 10e-9], G1: ["G", "+12 V"], LP1: ["LAMP", "Lampe 1"], LP2: ["LAMP", "Lampe 2"], LP3: ["LAMP", "Lampe 3"], LP4: ["LAMP", "Lampe 4"] },
  { VCC: ["U1.8", "U1.4", "R1.1", "U2.16"], GND: ["U1.1", "C1.2", "C2.2", "U2.8", "U2.13", "U3.8"], ENTLADEN: ["R1.2", "U1.7", "R2.1"], KONDENSATOR: ["R2.2", "U1.6", "U1.2", "C1.1"], CTRL: ["U1.5", "C2.1"], TAKT: ["U1.3", "U2.14"], Q0: ["U2.3", "U3.1"], Q1: ["U2.2", "U3.2"], Q2: ["U2.4", "U3.3"], Q3: ["U2.7", "U3.4"], RESET: ["U2.10", "U2.15"], LAST12V: ["G1.1", "U3.9", "LP1.1", "LP2.1", "LP3.1", "LP4.1"], L1: ["U3.16", "LP1.2"], L2: ["U3.15", "LP2.2"], L3: ["U3.14", "LP3.2"], L4: ["U3.13", "LP4.2"] });
/* --- Netz-Auswertung --- */
function icDef(spec){ return PARTIC[spec] || icById(spec); }
function netAnalyse(pid, P){
  var nl = NL[pid]; if (!nl) return null;
  var parts = {}, order = Object.keys(nl.parts);
  order.forEach(function(id){ var s = nl.parts[id], p = { id: id };
    if (typeof s === "string"){ p.kind = "ic"; p.def = icDef(s); p.n = p.def.pins.length; p.names = p.def.pins.map(function(x){ return x.split(":")[0]; }); }
    else { p.kind = s[0]; p.val = s[1]; p.extra = s[2]; p.n = p.kind === "G" ? 1 : 2;
      if (typeof p.val === "string" && p.val.charAt(0) === "$") p.val = P[p.val.slice(1)]; }
    parts[id] = p; });
  function term(ref){ var a = ref.split("."), p = parts[a[0]], t = a[1]; if (!p) throw new Error("Bauteil " + a[0] + " fehlt"); var n = parseInt(t, 10);
    if (isNaN(n)){ n = p.names ? p.names.indexOf(t) + 1 : 0; if (n < 1) throw new Error(ref + "?"); } return a[0] + "." + n; }
  var nets = [], by = {}, k = 0;
  Object.keys(nl.nets).forEach(function(name){ var m = nl.nets[name].map(term), rail = name === "VCC" ? "vcc" : name === "GND" ? "gnd" : null; var n = { name: name, members: [], rail: rail, id: k++ }; m.forEach(function(t){ if (!by[t]){ by[t] = n; n.members.push(t); } }); nets.push(n); });
  // alle Anschlüsse ohne Netz bekommen ein eigenes
  order.forEach(function(id){ var p = parts[id]; for (var i = 1; i <= p.n; i++){ var t = id + "." + i; if (!by[t]){ var n = { name: "N" + k, members: [t], rail: null, id: k++, anon: 1 }; by[t] = n; nets.push(n); } } });
  return { parts: parts, order: order, nets: nets, by: by, P: P };
}
function pv(p){ if (p.val == null || typeof p.val === "string") return p.val || ""; return p.kind === "C" ? fmt(p.val, "F") : p.kind === "R" ? fmt(p.val, "Ω") : p.kind === "POT" ? fmt(p.val, "Ω") : String(p.val); }

/* --- Schaltplan --- */
function renderSchem(A){
  var NS = "http://www.w3.org/2000/svg", out = [], drawn = {}, S = 40;
  function esc2(s){ return esc(String(s)); }
  function two(p){ return p.kind === "R" || p.kind === "C" || p.kind === "LED" || p.kind === "D" || p.kind === "SW" || p.kind === "XTAL" || p.kind === "LAMP" || p.kind === "SPK" || p.kind === "LDR"; }
  function symb(p, dx, entry){ // horizontales Bauteil von (0,0) nach (dx*46,0)
    var L = 46, s = "", lab = '<text class="sl" x="' + (dx * L / 2) + '" y="-11" text-anchor="middle">' + esc2(p.id) + '</text><text class="sv" x="' + (dx * L / 2) + '" y="20" text-anchor="middle">' + esc2(p.kind === "LED" ? "" : p.kind === "D" ? (p.val || "") : (p.kind === "SW" || p.kind === "LDR" || p.kind === "LAMP" || p.kind === "SPK" || p.kind === "XTAL" ? p.val : pv(p))) + "</text>";
    function X(v){ return dx * v; }
    if (p.kind === "R") s = '<path d="M0 0H' + X(8) + 'M' + X(38) + ' 0H' + X(46) + '"/><rect x="' + Math.min(X(8), X(38)) + '" y="-6" width="30" height="12"/>';
    else if (p.kind === "C") s = '<path d="M0 0H' + X(20) + 'M' + X(26) + ' 0H' + X(46) + 'M' + X(20) + ' -11V11M' + X(26) + ' -11V11"/>' + (p.extra === "pol" ? '<text class="sl" x="' + X(14) + '" y="-12" text-anchor="middle">+</text>' : "");
    else if (p.kind === "LED" || p.kind === "D"){ var fw = (entry === 1) ? dx : -dx; // Richtung Anode→Kathode
      s = '<path d="M0 0H' + X(14) + 'M' + X(32) + ' 0H' + X(46) + '"/><path d="M' + (fw > 0 ? X(14) : X(32)) + ' -9V9L' + (fw > 0 ? X(32) : X(14)) + ' 0Z"/><path d="M' + (fw > 0 ? X(32) : X(14)) + ' -9V9"/>' + (p.kind === "LED" ? '<path d="M' + X(22) + ' -11l6 -6M' + X(28) + ' -9l6 -6" stroke-width="1.4"/>' : ""); }
    else if (p.kind === "SW") s = '<path d="M0 0H' + X(14) + 'M' + X(32) + ' 0H' + X(46) + 'M' + X(14) + ' 0L' + X(30) + ' -11"/><circle cx="' + X(14) + '" cy="0" r="2.3"/><circle cx="' + X(32) + '" cy="0" r="2.3"/>';
    else if (p.kind === "XTAL") s = '<path d="M0 0H' + X(14) + 'M' + X(32) + ' 0H' + X(46) + 'M' + X(14) + ' -10V10M' + X(32) + ' -10V10"/><rect x="' + Math.min(X(19), X(27)) + '" y="-7" width="8" height="14"/>';
    else if (p.kind === "LAMP") s = '<path d="M0 0H' + X(12) + 'M' + X(34) + ' 0H' + X(46) + '"/><circle cx="' + X(23) + '" cy="0" r="11"/><path d="M' + X(15) + ' -8L' + X(31) + ' 8M' + X(15) + ' 8L' + X(31) + ' -8"/>';
    else if (p.kind === "SPK") s = '<path d="M0 0H' + X(14) + 'M' + X(36) + ' 0H' + X(46) + '"/><rect x="' + Math.min(X(14), X(24)) + '" y="-7" width="10" height="14"/><path d="M' + X(24) + ' -7L' + X(36) + ' -13V13L' + X(24) + ' 7"/>';
    else if (p.kind === "LDR") s = '<path d="M0 0H' + X(8) + 'M' + X(38) + ' 0H' + X(46) + '"/><rect x="' + Math.min(X(8), X(38)) + '" y="-6" width="30" height="12"/><path d="M' + X(12) + ' -17l7 6M' + X(20) + ' -19l7 6" stroke-width="1.4"/>';
    return '<g>' + s + lab + "</g>";
  }
  function rail(kind, dx){ var s = '<path d="M0 0H12"/><g transform="translate(' + (dx * 12) + ',0)">'; if (kind === "gnd") s += '<path d="M0 0V10M-9 10H9M-6 14H6M-3 18H3"/>'; else s += '<path d="M0 0V-10M-8 -10H8"/><text class="sl" x="0" y="-14" text-anchor="middle">+V</text>'; return s + "</g>"; }
  function flag(net, dx, hl){ var w = 12 + 6.3 * net.name.length; return '<path d="M0 0H8"/><g transform="translate(' + (dx * 8) + ',0)" class="fl" data-net="' + net.id + '"><path d="M0 0L' + (dx * 6) + ' -9H' + (dx * w) + 'V9H' + (dx * 6) + 'Z"/><text class="sf" x="' + (dx * (w / 2 + 3)) + '" y="4" text-anchor="middle">' + esc2(net.name) + "</text></g>"; }
  // Kette von einem Anschluss aus; liefert {svg, len}
  function chain(ref, dx, depth){
    var cur = ref, x = 0, s = "", len = 0;
    for (var guard = 0; guard < 5; guard++){
      var net = A.by[cur], others = net.members.filter(function(m){ return m !== cur; });
      if (net.rail){ s += '<g transform="translate(' + x + ',0)" class="nt" data-net="' + net.id + '">' + rail(net.rail, dx) + "</g>"; len = Math.abs(x) + 28; break; }
      if (!others.length){ s += '<g transform="translate(' + x + ',0)"><path d="M0 0H8"/><path d="M8 -4l8 8M16 -4l-8 8" transform="scale(' + dx + ',1)"/></g>'; len = Math.abs(x) + 20; break; }
      var o = others[0], po = A.parts[o.split(".")[0]], ti = +o.split(".")[1];
      if (others.length === 1 && po.kind === "G"){ drawn[po.id] = 1; s += '<g transform="translate(' + x + ',0)"><path d="M0 0H12"/><g transform="translate(' + (dx * 12) + ',0)"><circle cx="' + (dx * 11) + '" cy="0" r="11" class="src"/><path d="M' + (dx * 5) + ' 0q3 -7 6 0t6 0" fill="none"/><text class="sl" x="' + (dx * 11) + '" y="-16" text-anchor="middle">' + esc2(po.val) + "</text></g></g>"; len = Math.abs(x) + 38; break; }
      if (others.length === 1 && two(po) && !drawn[po.id]){ drawn[po.id] = 1; s += '<g transform="translate(' + x + ',0)" class="pt"><path d="M0 0H10"/><g transform="translate(' + (dx * 10) + ',0)">' + symb(po, dx, ti) + "</g></g>"; x += dx * 56; cur = po.id + "." + (ti === 1 ? 2 : 1); continue; }
      s += '<g transform="translate(' + x + ',0)">' + flag(net, dx) + "</g>"; len = Math.abs(x) + 16 + 6.3 * net.name.length + 8; break;
    }
    return { svg: s, len: len };
  }
  var boxes = A.order.filter(function(id){ return A.parts[id].kind === "ic"; }), W = 1180, curX = 20, curY = 20, rowH = 0, items = [];
  boxes.forEach(function(id){
    var p = A.parts[id], n = p.n, half = p.def.sip ? n : n / 2, rows = half, bh = rows * S + 40, bw = 104, L = [], Rr = [];
    for (var i = 1; i <= n; i++){ var left = p.def.sip ? true : i <= half, idx = p.def.sip ? i - 1 : (left ? i - 1 : n - i), c = chain(id + "." + i, left ? -1 : 1); (left ? L : Rr).push({ i: i, idx: idx, c: c }); }
    var lw = Math.max.apply(null, [0].concat(L.map(function(z){ return z.c.len; }))), rw = Math.max.apply(null, [0].concat(Rr.map(function(z){ return z.c.len; })));
    items.push({ id: id, p: p, L: L, R: Rr, bh: bh, bw: bw, lw: lw + 22, rw: rw + 22 });
  });
  // Platzieren
  var svg = "", maxX = 0;
  items.forEach(function(it){
    var tot = it.lw + it.bw + it.rw + 24;
    if (curX + tot > W && curX > 20){ curX = 20; curY += rowH + 30; rowH = 0; }
    maxX = Math.max(maxX, curX + it.lw + it.bw + it.rw); var bx = curX + it.lw, by = curY + 14, p = it.p; rowH = Math.max(rowH, it.bh + 14);
    svg += '<g class="ic" data-part="' + it.id + '"><rect class="box" x="' + bx + '" y="' + by + '" width="' + it.bw + '" height="' + it.bh + '" rx="6"/><text class="tt" x="' + (bx + it.bw / 2) + '" y="' + (by + 18) + '" text-anchor="middle">' + esc2(it.id) + '</text><text class="tn" x="' + (bx + it.bw / 2) + '" y="' + (by + it.bh / 2 + 4) + '" text-anchor="middle">' + esc2(p.def.name.split(" / ")[0].split(" (")[0]) + "</text>";
    it.L.concat(it.R).forEach(function(z){ var left = it.L.indexOf(z) >= 0, y = by + 32 + z.idx * S, x0 = left ? bx : bx + it.bw, nm = p.names[z.i - 1], dx = left ? -1 : 1, net = A.by[it.id + "." + z.i];
      svg += '<g transform="translate(' + x0 + ',' + y + ')" data-net="' + net.id + '" class="pn"><path d="M0 0H' + (dx * 0.1) + '"/><g>' + z.c.svg + '</g><text class="pi" x="' + (dx * 8 + (left ? -2 : 2)) + '" y="-4" text-anchor="' + (left ? "end" : "start") + '">' + z.i + '</text></g><text class="pnm" x="' + (left ? bx + 6 : bx + it.bw - 6) + '" y="' + (y + 4) + '" text-anchor="' + (left ? "start" : "end") + '">' + esc2(nm) + "</text>"; });
    svg += "</g>"; curX += tot + 20;
  });
  var bottom = curY + rowH + 40;
  // Satelliten
  var sats = A.order.filter(function(id){ return two(A.parts[id]) && !drawn[id]; }), sy = bottom + 10, sx = 30, sh = 0;
  if (sats.length) { svg += '<text class="sec" x="20" y="' + (sy) + '">' + T("Weitere Bauteile (über die Netzfähnchen mit dem Rest verbunden)", "Autres composants (reliés par les repères de réseau)") + "</text>"; sy += 40; }
  sats.forEach(function(id){
    if (drawn[id]) return; var p = A.parts[id]; drawn[id] = 1;
    var l = chain(id + ".1", -1), r = chain(id + ".2", 1), wdt = l.len + 56 + r.len + 20;
    if (sx + wdt > W && sx > 30){ sx = 30; sy += 66; }
    svg += '<g transform="translate(' + (sx + l.len) + ',' + sy + ')"><g class="pt">' + '<g transform="translate(0,0)">' + symb(p, 1, 1) + "</g></g><g>" + l.svg + '</g><g transform="translate(46,0)">' + r.svg + "</g></g>"; maxX = Math.max(maxX, sx + wdt); sx += wdt + 24;
  });
  var H = (sats.length ? sy + 50 : bottom + 10), W2 = Math.max(400, Math.min(W, maxX + 30)); W = W2;
  return '<svg class="ic-sch" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + T("Schaltplan", "Schéma") + '" style="min-width:' + Math.min(W, 760) + 'px;max-width:' + W + 'px">' + svg + "</svg>";
}
function wireHL(root){ var svgs = root.querySelectorAll("svg"); function clr(){ root.querySelectorAll(".hl").forEach(function(e){ e.classList.remove("hl"); }); } root.addEventListener("mouseover", function(ev){ var t = ev.target.closest ? ev.target.closest("[data-net]") : null; clr(); if (t){ var id = t.getAttribute("data-net"); root.querySelectorAll('[data-net="' + id + '"]').forEach(function(e){ e.classList.add("hl"); }); } }); root.addEventListener("mouseleave", clr); }

function netText(A){ var h = '<table class="ic-nt"><tr><th>' + T("Netz", "Réseau") + "</th><th>" + T("verbindet", "relie") + "</th></tr>"; A.nets.filter(function(n){ return n.members.length > 1; }).forEach(function(n){ h += "<tr><th>" + esc(n.name) + "</th><td>" + n.members.map(function(m){ var a = m.split("."), p = A.parts[a[0]]; return esc(a[0] + (p.names ? " " + a[1] + " (" + p.names[a[1] - 1] + ")" : p.kind === "G" ? "" : " ." + a[1])); }).join(" · ") + "</td></tr>"; }); return h + "</table>"; }

/* ---------- IC-Katalog ---------- */
var CATS = [["timer", T("Timer & Oszillator", "Timer & oscillateur"), "#ffb000"], ["logic", T("Logik-Gatter", "Portes logiques"), "#3de6ff"], ["count", T("Zähler, Teiler & Register", "Compteurs & registres"), "#6dffb0"], ["dec", T("Dekoder & Anzeige", "Décodeurs & affichage"), "#b6ff3d"], ["analog", T("Analog & Spannung", "Analogique & tension"), "#ff3d9a"], ["drive", T("Schalten & Treiben", "Commuter & piloter"), "#b58cff"]];
var ICS = [
  { id: "ne555", name: "NE555", pkg: "DIP-8", cat: "timer", k: ["Der Timer-Klassiker: Blinker, Impulse, Zeitrelais, Sirenen", "Le timer classique"], pins: ["GND:g", "TRIG:i", "OUT:o", "RESET:i", "CTRL:i", "THR:i", "DISCH:o", "VCC:v"], facts: [["Versorgung", "Alimentation", "4,5…16 V (NE555), 2…15 V (CMOS-Typen)"], ["Ausgangsstrom", "Courant de sortie", "bis ca. 200 mA (ziehen und liefern)"], ["Innen", "Intérieur", "2 Komparatoren, Flip-Flop, Entladetransistor, Spannungsteiler 3 × 5 kΩ (daher der Name)"], ["Verwandt", "Voisins", "NE556 = 2 × 555, TLC555/LMC555 = CMOS"]], proj: ["ne555a", "ne555m"] },
  { id: "hc14", name: "74HC14", pkg: "DIP-14", cat: "timer", k: ["6 × Inverter mit Schmitt-Trigger-Eingang", "6 inverseurs à trigger de Schmitt"], pins: ["1A:i", "1Y:o", "2A:i", "2Y:o", "3A:i", "3Y:o", "GND:g", "4Y:o", "4A:i", "5Y:o", "5A:i", "6Y:o", "6A:i", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…6 V"], ["Besonderheit", "Particularité", "zwei Schwellen (Hysterese) – aus langsamen oder verrauschten Signalen werden saubere Flanken"], ["Typische Jobs", "Usages", "Taster entprellen, RC-Oszillator, Signale aufbereiten"]], proj: ["hc14"] },
  { id: "cd4060", name: "CD4060", pkg: "DIP-16", cat: "count", k: ["14-stufiger Teiler mit Oszillator – Quarzuhr-Baustein", "Diviseur à 14 étages avec oscillateur"], pins: ["Q12:o", "Q13:o", "Q14:o", "Q6:o", "Q5:o", "Q7:o", "Q4:o", "VSS:g", "/Φ0:o", "Φ0:o", "Φ1:i", "RESET:i", "Q9:o", "Q8:o", "Q10:o", "VDD:v"], facts: [["Versorgung", "Alimentation", "3…15 V (CMOS)"], ["Teilerstufen", "Étages", "÷16 (Q4) bis ÷16384 (Q14)"], ["Quarzuhr", "Horloge à quartz", "32,768 kHz ÷ 2¹⁴ = 2 Hz"]], proj: ["cd4060"] },
  { id: "hc00", name: "74HC00 / 02 / 04 / 08 / 32 / 86", pkg: "DIP-14", cat: "logic", k: ["Die Grund-Gatter: NAND, NOR, NOT, AND, OR, XOR", "Les portes de base"], pins: ["1A:i", "1B:i", "1Y:o", "2A:i", "2B:i", "2Y:o", "GND:g", "3Y:o", "3A:i", "3B:i", "4Y:o", "4A:i", "4B:i", "VCC:v"], facts: [["Familien", "Familles", "74LS (5 V, TTL), 74HC (2…6 V, CMOS), 74HCT (CMOS mit TTL-Pegeln)"], ["Pinbelegung", "Brochage", "7400, 7408, 7432, 7486 gleich (hier gezeigt); 7402 (NOR) und 7404 (NOT) weichen ab"], ["Regel", "Règle", "Unbenutzte Eingänge nie offen lassen"]], proj: ["hc00"] },
  { id: "hc74", name: "74HC74", pkg: "DIP-14", cat: "count", k: ["2 × D-Flip-Flop mit Set und Reset", "2 bascules D"], pins: ["1/CLR:i", "1D:i", "1CLK:i", "1/PR:i", "1Q:o", "1/Q:o", "GND:g", "2/Q:o", "2Q:o", "2/PR:i", "2CLK:i", "2D:i", "2/CLR:i", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…6 V"], ["Flanke", "Front", "übernimmt D bei der STEIGENDEN Taktflanke"], ["Typische Jobs", "Usages", "Frequenz halbieren (÷2), Speicher für 1 Bit, Toggle-Schalter"]], proj: ["hc74"] },
  { id: "cd4017", name: "CD4017", pkg: "DIP-16", cat: "count", k: ["Dekadenzähler mit 10 Ausgängen – Lauflicht", "Compteur décimal à 10 sorties"], pins: ["Q5:o", "Q1:o", "Q0:o", "Q2:o", "Q6:o", "Q7:o", "Q3:o", "VSS:g", "Q8:o", "Q4:o", "Q9:o", "CO:o", "CE:i", "CLK:i", "RESET:i", "VDD:v"], facts: [["Versorgung", "Alimentation", "3…15 V"], ["Ausgänge", "Sorties", "immer genau EIN Ausgang HIGH (1-aus-10-Code)"], ["Kaskadieren", "Cascade", "CO (Pin 12) → CLK des nächsten"]], proj: ["cd4017"] },
  { id: "hc160", name: "74HC160", pkg: "DIP-16", cat: "count", k: ["Synchroner Dekadenzähler (BCD) 0…9", "Compteur décimal synchrone"], pins: ["/MR:i", "CLK:i", "P0:i", "P1:i", "P2:i", "P3:i", "CEP:i", "GND:g", "/PE:i", "CET:i", "Q3:o", "Q2:o", "Q1:o", "Q0:o", "TC:o", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…6 V"], ["Varianten", "Variantes", "160 = dezimal, 161 = binär (0…15), 162/163 synchron löschbar"], ["Laden", "Chargement", "/PE = LOW übernimmt P0…P3 beim nächsten Takt"]], proj: ["hc160"] },
  { id: "hc595", name: "74HC595", pkg: "DIP-16", cat: "count", k: ["8-Bit-Schieberegister mit Ausgangsspeicher", "Registre à décalage 8 bits"], pins: ["QB:o", "QC:o", "QD:o", "QE:o", "QF:o", "QG:o", "QH:o", "GND:g", "QH':o", "/SRCLR:i", "SRCLK:i", "RCLK:i", "/OE:i", "SER:i", "QA:o", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…6 V"], ["Idee", "Idée", "3 Mikrocontroller-Pins → beliebig viele Ausgänge (kaskadierbar)"], ["Strom", "Courant", "ca. 6 mA je Ausgang, max. 70 mA gesamt"]], proj: ["hc595"] },
  { id: "hc138", name: "74HC138", pkg: "DIP-16", cat: "dec", k: ["3-zu-8-Dekoder / Demultiplexer", "Décodeur 3 vers 8"], pins: ["A0:i", "A1:i", "A2:i", "/E1:i", "/E2:i", "E3:i", "/Y7:o", "GND:g", "/Y6:o", "/Y5:o", "/Y4:o", "/Y3:o", "/Y2:o", "/Y1:o", "/Y0:o", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…6 V"], ["Ausgänge", "Sorties", "active-low: der gewählte geht auf LOW"], ["Typische Jobs", "Usages", "Adressdekodierung, Chip-Select, Multiplexing"]], proj: ["hc138"] },
  { id: "cd4511", name: "CD4511", pkg: "DIP-16", cat: "dec", k: ["BCD → 7-Segment-Dekoder (gemeinsame Kathode)", "Décodeur BCD → 7 segments"], pins: ["B:i", "C:i", "/LT:i", "/BI:i", "LE:i", "D:i", "A:i", "VSS:g", "e:o", "d:o", "c:o", "b:o", "a:o", "g:o", "f:o", "VDD:v"], facts: [["Versorgung", "Alimentation", "3…18 V"], ["Ausgangsstrom", "Courant", "bis ca. 25 mA je Segment (Vorwiderstand nötig)"], ["Gegenstück", "Équivalent", "7447 für Anzeigen mit gemeinsamer Anode"]], proj: ["cd4511"] },
  { id: "lm358", name: "LM358", pkg: "DIP-8", cat: "analog", k: ["Doppel-Operationsverstärker für einfache Versorgung", "Double amplificateur opérationnel"], pins: ["OUT1:o", "IN1−:i", "IN1+:i", "V−/GND:g", "IN2+:i", "IN2−:i", "OUT2:o", "V+:v"], facts: [["Versorgung", "Alimentation", "3…32 V, einfach oder ±1,5…±16 V"], ["Bandbreite", "Bande passante", "ca. 1 MHz (GBW), Slew-Rate 0,3 V/µs"], ["Ausgang", "Sortie", "bis nahe GND, nach oben +V − 1,5 V"]], proj: ["lm358"] },
  { id: "lm393", name: "LM393", pkg: "DIP-8", cat: "analog", k: ["Doppel-Komparator mit offenem Kollektor", "Double comparateur à collecteur ouvert"], pins: ["OUT1:o", "IN1−:i", "IN1+:i", "GND:g", "IN2+:i", "IN2−:i", "OUT2:o", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…36 V"], ["Ausgang", "Sortie", "open collector – Pull-up nötig"], ["Typische Jobs", "Usages", "Schwellenschalter, Dämmerung, Nulldurchgang, Spannungswächter"]], proj: ["lm393"] },
  { id: "lm317", name: "LM317", pkg: "TO-220", cat: "analog", k: ["Einstellbarer Spannungsregler 1,25…37 V, 1,5 A", "Régulateur réglable 1,25…37 V, 1,5 A"], pins: ["ADJ:i", "OUT:o", "IN:v"], facts: [["Referenz", "Référence", "1,25 V zwischen OUT und ADJ"], ["Reserve", "Marge", "Vin ≥ Vout + ca. 3 V"], ["Strom", "Courant", "bis 1,5 A, mit Kühlkörper"]], proj: ["lm317"] },
  { id: "cd4093", name: "CD4093", pkg: "DIP-14", cat: "timer", k: ["4 × NAND mit Schmitt-Trigger – Oszillator mit Freigabe", "4 NAND à trigger de Schmitt"], pins: ["1A:i", "1B:i", "1Y:o", "2Y:o", "2A:i", "2B:i", "VSS:g", "3A:i", "3B:i", "3Y:o", "4Y:o", "4A:i", "4B:i", "VDD:v"], facts: [["Versorgung", "Alimentation", "3…15 V (CMOS)"], ["Besonderheit", "Particularité", "jeder Eingang hat Hysterese – ideal für R-C-Oszillatoren und Entprellen"], ["Typische Jobs", "Usages", "Tor-Oszillator, Tongeber, Einschaltverzögerung"]], proj: ["cd4093"] },
  { id: "cd4040", name: "CD4040", pkg: "DIP-16", cat: "count", k: ["12-stufiger Binärzähler", "Compteur binaire 12 étages"], pins: ["Q12:o", "Q6:o", "Q5:o", "Q7:o", "Q4:o", "Q3:o", "Q2:o", "VSS:g", "Q1:o", "CLK:i", "RESET:i", "Q9:o", "Q8:o", "Q10:o", "Q11:o", "VDD:v"], facts: [["Versorgung", "Alimentation", "3…15 V (CMOS)"], ["Teiler", "Division", "÷2 (Q1) bis ÷4096 (Q12)"], ["Flanke", "Front", "zählt bei der FALLENDEN Flanke"]], proj: ["cd4040"] },
  { id: "hc165", name: "74HC165", pkg: "DIP-16", cat: "count", k: ["8-Bit-Schieberegister: parallel rein, seriell raus", "Registre 8 bits : entrée parallèle, sortie série"], pins: ["SH/LD:i", "CLK:i", "E:i", "F:i", "G:i", "H:i", "/QH:o", "GND:g", "QH:o", "SER:i", "A:i", "B:i", "C:i", "D:i", "CLK INH:i", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…6 V"], ["Idee", "Idée", "viele Taster mit 3 Mikrocontroller-Pins lesen (kaskadierbar)"], ["Gegenstück", "Pendant", "74HC595 für Ausgänge"]], proj: ["hc165"] },
  { id: "lm7805", name: "LM7805", pkg: "TO-220", cat: "analog", k: ["Festspannungsregler 5 V, 1 A", "Régulateur fixe 5 V, 1 A"], pins: ["IN:v", "GND:g", "OUT:o"], facts: [["Eingang", "Entrée", "7…35 V (mindestens 2 V über dem Ausgang)"], ["Strom", "Courant", "bis 1 A, mit Kühlkörper"], ["Familie", "Famille", "7809, 7812, 7815 für andere Spannungen; 79xx für negative"]], proj: ["lm7805"] },
  { id: "lm386", name: "LM386", pkg: "DIP-8", cat: "analog", k: ["Kleiner Audio-Verstärker bis ca. 0,5 W", "Petit ampli audio jusqu’à 0,5 W"], pins: ["GAIN:i", "IN−:i", "IN+:i", "GND:g", "OUT:o", "VS:v", "BYPASS:i", "GAIN:i"], facts: [["Versorgung", "Alimentation", "4…12 V"], ["Verstärkung", "Gain", "20-fach, mit 10 µF an Pin 1/8 bis 200-fach"], ["Ausgang", "Sortie", "liegt in Ruhe auf halber Versorgung"]], proj: ["lm386"] },
  { id: "bc337", name: "BC337", pkg: "TO-92", cat: "drive", k: ["NPN-Transistor als Schalter bis 800 mA", "Transistor NPN en commutation jusqu’à 800 mA"], pins: ["C:o", "B:i", "E:g"], facts: [["Grenzwerte", "Limites", "45 V, 800 mA, 625 mW"], ["Stromverstärkung", "Gain en courant", "100…600, als Schalter mit 10…20 rechnen"], ["Ähnlich", "Similaires", "BC547 (100 mA), 2N2222 (600 mA)"]], proj: ["npn"] },
  { id: "uln2003", name: "ULN2003A", pkg: "DIP-16", cat: "drive", k: ["7 × Darlington-Treiber mit Freilaufdioden", "7 drivers Darlington avec diodes"], pins: ["1B:i", "2B:i", "3B:i", "4B:i", "5B:i", "6B:i", "7B:i", "GND:g", "COM:v", "7C:o", "6C:o", "5C:o", "4C:o", "3C:o", "2C:o", "1C:o"], facts: [["Last", "Charge", "bis 50 V, 500 mA je Kanal"], ["Eingang", "Entrée", "direkt an 3,3-V- oder 5-V-Logik"], ["Typische Jobs", "Usages", "Relais, Lampen, Schrittmotor 28BYJ-48"]], proj: ["uln2003"] },
  { id: "l293d", name: "L293D", pkg: "DIP-16", cat: "drive", k: ["Doppelte H-Brücke für zwei Motoren", "Double pont en H pour deux moteurs"], pins: ["EN1,2:i", "1A:i", "1Y:o", "GND:g", "GND:g", "2Y:o", "2A:i", "VCC2:v", "EN3,4:i", "3A:i", "3Y:o", "GND:g", "GND:g", "4Y:o", "4A:i", "VCC1:v"], facts: [["Motor-Versorgung", "Alimentation moteur", "4,5…36 V an Pin 8"], ["Strom", "Courant", "600 mA je Kanal, Spitze 1,2 A"], ["Verlust", "Pertes", "etwa 2,6 V bleiben im IC"]], proj: ["l293d"] },
  { id: "pc817", name: "PC817", pkg: "DIP-4", cat: "drive", k: ["Optokoppler: trennt zwei Stromkreise", "Optocoupleur : sépare deux circuits"], pins: ["Anode:i", "Kathode:g", "Emitter:g", "Kollektor:o"], facts: [["Isolation", "Isolation", "5000 V zwischen Ein- und Ausgang"], ["LED", "LED", "ca. 1,2 V, 5…20 mA"], ["CTR", "CTR", "50…600 % (Ausgangsstrom / LED-Strom)"]], proj: ["pc817"] }
];
var KOMBI = ["k_lauf", "k_uhr", "k_zaehl", "k_daemm", "k_prell", "k_sirene", "k_motor", "k_relais"];
var KICON = { k_lauf: "💡", k_uhr: "🕒", k_zaehl: "🔢", k_daemm: "🌗", k_prell: "🔘", k_sirene: "🚨", k_motor: "⚙️", k_relais: "🔌" };
function icById(id){ for (var i = 0; i < ICS.length; i++) if (ICS[i].id === id) return ICS[i]; return null; }
function icOfProj(pid){ for (var i = 0; i < ICS.length; i++) if (ICS[i].proj.indexOf(pid) >= 0) return ICS[i]; return null; }

/* ---------- Projekt anzeigen ---------- */
var LIVE = { tok: 0, raf: 0 }, AUD = null;
function stopAudio(){ if (AUD){ try { AUD.o.stop(); AUD.ac.close(); } catch(e){} AUD = null; } }
function stopLive(){ LIVE.tok++; cancelAnimationFrame(LIVE.raf); stopAudio(); }
function sliderRow(p, P, onchg){
  var row = el("label", "ic-sl"), nm = el("span", "ic-sn", T(p.l[0], p.l[1])), inp = el("input"), out = el("output", "ic-so"); inp.type = "range"; inp.min = 0; inp.max = 1000; inp.step = 1;
  function toX(v){ var t = p.log ? Math.log(v / p.min) / Math.log(p.max / p.min) : (v - p.min) / (p.max - p.min); return Math.round(clamp(t, 0, 1) * 1000); }
  function toV(x){ var t = x / 1000, v = p.log ? p.min * Math.pow(p.max / p.min, t) : p.min + (p.max - p.min) * t; if (p.e12) v = e12(v); if (p.int) v = Math.round(v); return v; }
  function show(){ out.textContent = p.u ? fmt(P[p.k], p.u) : (+P[p.k].toFixed(2)).toString().replace(".", fr ? "," : "."); }
  inp.value = toX(P[p.k]); show(); inp.oninput = function(){ P[p.k] = toV(+inp.value); show(); onchg(); };
  row.appendChild(nm); row.appendChild(inp); row.appendChild(out); row.setV = function(v){ P[p.k] = v; inp.value = toX(v); show(); onchg(); }; return row;
}
function renderProject(host, pid){
  stopLive(); host.innerHTML = "";
  var pr = PROJ[pid], P = {}, saved = sv("p_" + pid) || {}, ctx = { ts: 0, fire: null, res: null, pid: pid }, rows = {};
  (pr.params || []).forEach(function(p){ P[p.k] = saved[p.k] != null ? clamp(saved[p.k], p.min, p.max) : p.def; });
  (pr.opts || []).forEach(function(o){ var sv0 = saved[o.k]; P[o.k] = sv0 != null && o.o.some(function(x){ return x[0] === sv0; }) ? sv0 : o.def; });
  ctx.setP = function(k, v){ if (rows[k]) rows[k].setV(v); };
  host.appendChild(el("h2", "ic-pt", esc(T(pr.t[0], pr.t[1]))));
  host.appendChild(el("p", "ic-pd", esc(T(pr.d[0], pr.d[1]))));
  var fl = el("div", "ic-flow"); pr.flow.forEach(function(x, i){ if (i) fl.appendChild(el("span", "ic-ar", "→")); fl.appendChild(el("span", "ic-fb", esc(x))); }); host.appendChild(fl);
  if (pr.ics){ var lk = el("div", "ic-chips"); lk.appendChild(el("span", "ic-lb", T("Daten zu den ICs:", "Données des CI :"))); pr.ics.forEach(function(i){ var a = el("a", "ic-ch", esc(icById(i).name)); a.href = "index.html#/s/" + LINK[i]; lk.appendChild(a); }); host.appendChild(lk); }
  var ctl = el("div", "ic-ctl"); host.appendChild(ctl);
  var vwBox = null, vwMode = sv("vw") === "t" ? "t" : "s", vwTabs = null;
  if (NL[pid]){ vwTabs = el("div", "ic-chips ic-vt"); vwBox = el("div", "ic-vw");
    [["s", T("Schaltplan", "Schéma")], ["t", T("Anschlüsse", "Connexions")]].forEach(function(x){ var b = el("button", "ic-ch" + (vwMode === x[0] ? " on" : ""), esc(x[1])); b.type = "button"; b.onclick = function(){ vwMode = x[0]; st("vw", vwMode); vwTabs.querySelectorAll("button").forEach(function(y){ y.classList.remove("on"); }); b.classList.add("on"); drawView(); }; vwTabs.appendChild(b); });
    host.appendChild(vwTabs); host.appendChild(vwBox); }
  function drawView(){ if (!vwBox) return; var A; try { A = netAnalyse(pid, P); vwBox.innerHTML = vwMode === "s" ? '<div class="ic-sw">' + renderSchem(A) + "</div>" : netText(A); wireHL(vwBox); } catch(e){ vwBox.innerHTML = '<p class="ic-warn">' + esc(String(e && e.message || e)) + "</p>"; if (window.console) console.error(e); } }
  var cust = null, area = el("div"), scBox = el("div", "ic-scopebox"), cnv = el("canvas"), liveBox = el("div", "ic-live"), warnBox = el("div"), infoBox = el("div", "ic-info");
  function save(){ st("p_" + pid, P); }
  function redraw(){ save();
    var res = pr.build ? pr.build(P, ctx) : {}; ctx.res = res;
    if (res.ch){ scBox.hidden = false; scope(cnv, res.ch, res.span, res.cur, res.tl); } else scBox.hidden = true;
    warnBox.innerHTML = (res.warn || []).map(function(w){ return '<p class="ic-warn">⚠️ ' + esc(w) + "</p>"; }).join("");
    infoBox.innerHTML = res.info ? "<table>" + res.info.map(function(r){ return "<tr><th>" + esc(r[0]) + "</th><td>" + esc(r[1] || "") + "</td></tr>"; }).join("") + "</table>" : "";
    liveBox.innerHTML = ""; ctx.led = null; ctx.seg = null; ctx.sig = null; ctx.note = null;
    if (res.live) liveBox.hidden = false; else liveBox.hidden = true;
    if (cust && cust.after) cust.after(res);
    drawView();
  }
  (pr.params || []).forEach(function(p){ var r = sliderRow(p, P, redraw); rows[p.k] = r; ctl.appendChild(r); });
  (pr.opts || []).forEach(function(o){ var w = el("div", "ic-chips"); w.appendChild(el("span", "ic-lb", esc(T(o.l[0], o.l[1])))); o.o.forEach(function(x){ var b = el("button", "ic-ch" + (P[o.k] === x[0] ? " on" : ""), esc(typeof x[1] === "string" ? x[1] : T(x[1][0], x[1][1]))); b.type = "button"; b.onclick = function(){ P[o.k] = x[0]; w.querySelectorAll("button").forEach(function(y){ y.classList.remove("on"); }); b.classList.add("on"); redraw(); }; w.appendChild(b); }); ctl.appendChild(w); });
  if (pr.action){ var ab = el("button", "ic-act", esc(T(pr.action.l[0], pr.action.l[1]))); ab.type = "button";
    ab.onclick = function(){ ctx.fire = ctx.ts; if (pr.onAction) pr.onAction(ctx);
      if (pid === "k_sirene"){ if (AUD) stopAudio(); else { try { var ac = new (window.AudioContext || window.webkitAudioContext)(), o = ac.createOscillator(), g = ac.createGain(); o.type = "square"; g.gain.value = .05; o.connect(g); g.connect(ac.destination); o.start(); AUD = { ac: ac, o: o }; } catch(e){} } ab.classList.toggle("on", !!AUD); }
      redraw(); }; host.appendChild(ab); }
  host.appendChild(area);
  if (pr.custom) cust = CUST[pr.custom](area, P, ctx, redraw);
  host.appendChild(scBox); scBox.appendChild(cnv); host.appendChild(liveBox); host.appendChild(warnBox); host.appendChild(infoBox);
  redraw();
  if (pr.wire){ host.appendChild(el("h3", "ic-h3", "🔌 " + T("Verdrahtung", "Câblage"))); var ul = el("ol", "ic-wire"); pr.wire.forEach(function(w){ ul.appendChild(el("li", "", esc(T(w[0], w[1])))); }); host.appendChild(ul); }
  if (pr.notes){ host.appendChild(el("h3", "ic-h3", "💡 " + T("Gut zu wissen", "Bon à savoir"))); var u2 = el("ul", "ic-wire"); pr.notes.forEach(function(w){ u2.appendChild(el("li", "", esc(T(w[0], w[1])))); }); host.appendChild(u2); }
  // Live-Schleife
  var tok = ++LIVE.tok, last = performance.now(), noteEl = null;
  function frame(now){
    if (tok !== LIVE.tok) return;
    var dt = Math.min(.1, (now - last) / 1000); last = now; var res = ctx.res;
    if (res && res.live){
      var sp = res.speed != null ? res.speed : res.fmain > 3 ? 2 / res.fmain : res.fmain < .3 ? .5 / res.fmain : 1;
      ctx.ts += dt * sp; var o = res.live(ctx.ts, ctx);
      if (!ctx.sig || ctx.sig !== (o.leds.length + "|" + (o.seg != null))){ liveBox.innerHTML = ""; ctx.sig = o.leds.length + "|" + (o.seg != null); var rw = el("div", "ic-row2"); liveBox.appendChild(rw); ctx.seg = o.seg != null ? seg7(rw) : null; var lw = el("div"); rw.appendChild(lw); ctx.led = o.leds.length ? ledRow(lw, o.leds.length, o.names, C.red) : null; ctx.note = el("div", "ic-note"); liveBox.appendChild(ctx.note); }
      if (ctx.led) ctx.led.set(o.leds); if (ctx.seg) ctx.seg.set(o.seg);
      ctx.note.textContent = Math.abs(sp - 1) < .05 ? T("⏱ echte Zeit", "⏱ temps réel") : sp < 1 ? T("⏱ Zeitlupe ×", "⏱ ralenti ×") + (+sp.toPrecision(2)).toString() : T("⏱ Zeitraffer ×", "⏱ accéléré ×") + Math.round(sp);
    }
    if (AUD && res && res.fAt){ try { AUD.o.frequency.setTargetAtTime(clamp(res.fAt(ctx.ts), 60, 12000), AUD.ac.currentTime, .012); } catch(e){} }
    LIVE.raf = requestAnimationFrame(frame);
  }
  LIVE.raf = requestAnimationFrame(frame);
  if (window.ResizeObserver){ var ro = new ResizeObserver(function(){ if (tok === LIVE.tok && ctx.res && ctx.res.ch){ var w0 = cnv.parentNode.clientWidth; if (w0 && Math.abs(w0 - (parseFloat(cnv.style.width) || 0)) > 2) scope(cnv, ctx.res.ch, ctx.res.span, ctx.res.cur, ctx.res.tl); } }); ro.observe(scBox); }
}

/* ---------- Seiten: eine Sammlung aller Schaltungen ---------- */
var root, FILTER = "alle", QUERY = "";
var GRP = [["takt", T("Takt & Zeit", "Horloge & temps"), "#ffb000", ["ne555a", "ne555m", "hc14", "cd4093", "cd4060", "k_uhr", "k_sirene"]], ["zaehl", T("Zählen & Lauflicht", "Compter & chenillard"), "#6dffb0", ["hc74", "cd4017", "cd4040", "hc160", "k_lauf", "k_zaehl"]], ["logik", T("Logik & Daten", "Logique & données"), "#3de6ff", ["hc00", "hc595", "hc165", "hc138", "cd4511", "k_prell"]], ["analog", T("Verstärken, Messen & Versorgen", "Amplifier, mesurer & alimenter"), "#ff3d9a", ["lm358", "lm393", "lm386", "lm317", "lm7805", "k_daemm"]], ["treiber", T("Schalten, Treiben & Motor", "Commuter, piloter & moteur"), "#b58cff", ["npn", "uln2003", "l293d", "pc817", "k_motor", "k_relais"]]];
function icsOf(pid){ var pr = PROJ[pid]; if (pr.ics) return pr.ics.slice(); var ic = icOfProj(pid); return ic ? [ic.id] : []; }
function shortT(pid){ var t = T(PROJ[pid].t[0], PROJ[pid].t[1]); return t.split(/ – |: /)[0]; }
function subT(pid){ var t = T(PROJ[pid].t[0], PROJ[pid].t[1]), m = t.split(/ – |: /); return m.slice(1).join(" – "); }
function cardP(pid, col){
  var a = el("a", "ic-card" + (icsOf(pid).length > 1 ? " kb" : ""), ""), ics = icsOf(pid).map(function(i){ return icById(i).name.split(" / ")[0]; });
  a.href = "#p/" + pid; a.style.setProperty("--c", col);
  a.innerHTML = '<span class="ic-pkg">' + ics.map(esc).join(" + ") + '</span><b>' + (KICON[pid] ? KICON[pid] + " " : "") + esc(shortT(pid)) + "</b><p>" + esc(subT(pid) || T(PROJ[pid].d[0], PROJ[pid].d[1]).slice(0, 90) + "…") + "</p><i>" + (ics.length > 1 ? ics.length + " ICs" : T("1 IC", "1 CI")) + "</i>";
  a.dataset.s = (PROJ[pid].t[0] + " " + PROJ[pid].t[1] + " " + PROJ[pid].d[0] + " " + ics.join(" ")).toLowerCase(); return a;
}
function listPage(){
  stopLive(); document.title = "Schaltungen – Oratio Tech Studio"; root.innerHTML = "";
  root.appendChild(el("div", "crumb", '<a href="index.html">Oratio Place</a> › <a href="index.html#/studio">Oratio Tech Studio</a> › ' + T("Schaltungen", "Circuits")));
  root.appendChild(el("div", "ic-hero", '<div class="ic-k">' + T("LIVE-LABOR", "LABO EN DIRECT") + "</div><h1>" + T("Alle Schaltungen zum Ausprobieren", "Tous les circuits à essayer") + "</h1><p>" + T("Wähle eine Schaltung, drehe an R und C und sieh am Oszilloskop, was passiert – mit Verdrahtung Pin für Pin. Einzelne ICs und Projekte mit mehreren ICs stehen hier zusammen. Die Daten zu jedem IC findest du im Tech Studio.", "Choisis un circuit, change R et C et regarde l’oscilloscope. Les données de chaque CI sont dans le Studio.") + '</p><p style="margin-top:10px;font-size:14px">' + T('Eigene Schaltung frei verdrahten: <a href="lab.html#sim" style="color:#6dffb0">Schaltungs-Simulator im Oratio Lab</a> · IC nachschlagen: <a href="index.html#/w/bt_ic" style="color:#6dffb0">ICs: Logik &amp; Speicher</a>, <a href="index.html#/w/bt_analog" style="color:#6dffb0">Analog-ICs</a>', 'Câbler librement : <a href="lab.html#sim" style="color:#6dffb0">simulateur d’Oratio Lab</a>') + "</p>"));
  var s = el("input", "ic-search"); s.type = "search"; s.placeholder = T("Schaltung oder IC suchen, z. B. 555, Lauflicht, 4017 …", "Chercher un circuit ou un CI …"); s.value = QUERY; var tools = el("div", "ic-chips"); tools.appendChild(s); root.appendChild(tools);
  var cr = el("div", "ic-chips"); root.appendChild(cr);
  [["alle", T("Alle", "Tous")]].concat(GRP.map(function(g){ return [g[0], g[1]]; })).forEach(function(c){ var b = el("button", "ic-ch" + (FILTER === c[0] ? " on" : ""), esc(c[1])); b.type = "button"; b.onclick = function(){ FILTER = c[0]; cr.querySelectorAll("button").forEach(function(y){ y.classList.remove("on"); }); b.classList.add("on"); filt(); }; cr.appendChild(b); });
  var secs = [];
  GRP.forEach(function(g){ var h = el("h2", "ic-h2", esc(g[1]) + ' <small style="font-weight:500;color:var(--muted)">' + g[3].length + "</small>"), gr = el("div", "ic-grid"); g[3].forEach(function(p){ gr.appendChild(cardP(p, g[2])); }); root.appendChild(h); root.appendChild(gr); secs.push([g[0], h, gr]); });
  var emp = el("p", "ic-lb", T("Nichts gefunden – versuche z. B. 555 oder Zähler.", "Rien trouvé.")); emp.hidden = true; root.appendChild(emp);
  function filt(){ var q = s.value.trim().toLowerCase(), tot = 0; QUERY = s.value;
    secs.forEach(function(x){ var n = 0; x[2].childNodes.forEach(function(a){ var ok = (FILTER === "alle" || FILTER === x[0]) && (!q || a.dataset.s.indexOf(q) >= 0); a.hidden = !ok; if (ok) n++; }); x[1].hidden = x[2].hidden = !n; tot += n; });
    emp.hidden = !!tot; }
  s.oninput = filt; filt();
}
function circuitPage(pid){
  var pr = PROJ[pid]; if (!pr) return listPage(); var ics = icsOf(pid).map(icById).filter(Boolean);
  document.title = shortT(pid) + " – Schaltungen"; root.innerHTML = "";
  root.appendChild(el("div", "crumb", '<a href="index.html">Oratio Place</a> › <a href="index.html#/studio">Oratio Tech Studio</a> › <a href="#">' + T("Schaltungen", "Circuits") + "</a> › " + esc(shortT(pid))));
  var wrap = el("div", "ic-two"); root.appendChild(wrap);
  var side = el("aside", "ic-side"); wrap.appendChild(side); var main = el("section", "ic-main"); wrap.appendChild(main);
  side.appendChild(el("h1", "ic-h1", T("Verdrahtung", "Câblage")));
  ics.forEach(function(ic){ side.appendChild(el("p", "ic-lb", "<b>" + esc(ic.name) + "</b> – " + esc(T(ic.k[0], ic.k[1])))); var pn = el("div", "ic-pin"); pn.innerHTML = dip(ic); side.appendChild(pn); var dl = el("a", "ic-act2", "📖 " + T("Alle Daten zu ", "Toutes les données : ") + esc(ic.name.split(" / ")[0])); dl.href = "index.html#/s/" + LINK[ic.id]; side.appendChild(dl); });
  side.appendChild(el("div", "ic-leg", '<span style="--c:#ff6b6b">+V</span><span style="--c:#8aa0b8">GND</span><span style="--c:#ffb000">' + T("Eingang", "Entrée") + '</span><span style="--c:#3de6ff">' + T("Ausgang", "Sortie") + "</span>"));
  side.appendChild(el("p", "ic-lb", T("Ansicht von oben, Kerbe oben: Pin 1 links oben, dann gegen den Uhrzeigersinn.", "Vue de dessus, encoche en haut : broche 1 en haut à gauche.")));
  var host = el("div"); main.appendChild(host); renderProject(host, pid);
  var ids = {}; ics.forEach(function(i){ ids[i.id] = 1; }); var more = []; Object.keys(PROJ).forEach(function(p){ if (p !== pid && icsOf(p).some(function(i){ return ids[i]; })) more.push(p); });
  if (more.length){ main.appendChild(el("h3", "ic-h3", "➕ " + T("Weitere Schaltungen mit diesen ICs", "Autres circuits avec ces CI"))); var mc = el("div", "ic-chips"); more.forEach(function(p){ var a = el("a", "ic-ch", esc(shortT(p))); a.href = "#p/" + p; mc.appendChild(a); }); main.appendChild(mc); }
}
function route(){
  var h = decodeURIComponent(location.hash.replace(/^#/, "")), p = h.split("/");
  if (!h) listPage(); else if (p[0] === "p" || p[0] === "k") circuitPage(p[1]); else if (icById(p[0])) circuitPage(p[1] && PROJ[p[1]] ? p[1] : icById(p[0]).proj[0]); else listPage();
  window.scrollTo(0, 0);
}
function start(){ root = $("#iclab"); window.addEventListener("hashchange", route); route(); }
return { start: start };
})();
