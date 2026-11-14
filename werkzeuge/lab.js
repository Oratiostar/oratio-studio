/* Oratio Lab – Werkstätten im Browser */
var LAB = (function(){
"use strict";
var fr = (window.WZ && WZ.lang === "fr");
function L(d, f){ return fr ? f : d; }
function $(s, r){ return (r || document).querySelector(s); }
function el(t, c, h){ var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
function sv(k){ try { return JSON.parse(localStorage.getItem("lab_" + k)); } catch(e){ return null; } }
function st(k, v){ try { localStorage.setItem("lab_" + k, JSON.stringify(v)); } catch(e){} }
function copy(txt, ta, done){
  function fb(){ ta.focus(); ta.select(); try { document.execCommand("copy"); } catch(e){} done(); }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fb); else fb();
}
function save(name, blob){ var a = el("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function(){ a.remove(); URL.revokeObjectURL(a.href); }, 500); }

var TABS = [
  ["start", "🏠", L("Start", "Accueil")],
  ["sim", "⚡", L("Schaltungen", "Circuits")],
  ["watch", "⌚", "Oratio Watch"],
  ["disp", "📺", L("Displays", "Écrans")],
  ["matrix", "🟦", L("LED-Matrix", "Matrice LED")],
  ["term", "💻", "Terminal"],
  ["game", "🎮", L("Spiel", "Jeu")]
];
var MODS = {}, cur = "", root, body;

var HERO = {
  start: ["🔬", "Oratio Lab", L("Probieren, bauen, kaputtmachen – ohne Risiko. Alles läuft live in deinem Browser.", "Essayer, construire, casser – sans risque. Tout tourne en direct dans ton navigateur."), "linear-gradient(135deg,#7a3cff,#12c2e9 62%,#2fe38a)"],
  sim: ["⚡", L("Schaltungs-Simulator", "Simulateur de circuits"), L("Bauteile verbinden, Strom und Spannung live sehen.", "Relie des composants, vois courant et tension en direct."), "linear-gradient(135deg,#ff8a00,#ff4f9a)"],
  watch: ["⌚", "Oratio Watch", L("Das Zifferblatt live im Browser gestalten.", "Crée le cadran en direct dans le navigateur."), "linear-gradient(135deg,#12c2e9,#2f7bff)"],
  disp: ["📺", L("Display-Werkstatt", "Atelier d’écrans"), L("Display wählen, darauf schreiben oder zeichnen – der Code entsteht dazu.", "Choisis un écran, écris ou dessine – le code est généré."), "linear-gradient(135deg,#2f7bff,#12c2e9)"],
  matrix: ["🟦", L("LED-Matrix-Maler", "Éditeur de matrice LED"), L("64×32 Pixel malen und als ESP32- oder Pi-Code exportieren.", "Dessine 64×32 pixels et exporte le code ESP32 ou Pi."), "linear-gradient(135deg,#7a3cff,#ff4f9a)"],
  term: ["💻", L("Terminal-Trainer", "Entraîneur de terminal"), L("Linux-Befehle üben – hier kann nichts kaputtgehen.", "Entraîne-toi aux commandes Linux – rien ne peut casser."), "linear-gradient(135deg,#1c2230,#2fe38a)"],
  game: ["🎮", L("Mini-Spiele", "Mini-jeux"), L("Memory, Ohm-Quiz, Farbcode und Reaktionstest.", "Mémoire, quiz d’Ohm, code couleur et test de réaction."), "linear-gradient(135deg,#2fe38a,#ffd400)"]
};
var heroEl, crumbEl, backEl;
function start(){
  root = $("#lab");
  crumbEl = el("div", "crumb"); root.appendChild(crumbEl);
  heroEl = el("div", "lhero"); root.appendChild(heroEl);
  backEl = el("a", "lback", "← " + L("Zurück zu Oratio Lab", "Retour à Oratio Lab")); backEl.href = "#start"; backEl.hidden = true; root.appendChild(backEl);
  body = el("div"); root.appendChild(body);
  window.addEventListener("hashchange", route);
  route();
}
function route(){
  var h = location.hash.replace("#", "") || "start";
  if (!MODS[h]) h = "start";
  if (MODS[cur] && MODS[cur].stop) MODS[cur].stop();
  cur = h; body.innerHTML = "";
  var hd = HERO[h];
  heroEl.style.background = hd[3]; heroEl.className = "lhero" + (h === "start" ? "" : " small");
  heroEl.innerHTML = '<div class="lic">' + hd[0] + '</div><div><h1>' + hd[1] + '</h1><p>' + hd[2] + '</p></div>';
  crumbEl.innerHTML = '<a href="index.html">Oratio Place</a> › ' + (h === "start" ? "Oratio Lab" : '<a href="#start">Oratio Lab</a> › ' + hd[1]);
  backEl.hidden = h === "start";
  document.title = (h === "start" ? "Oratio Lab" : hd[1]) + " – Oratio Place";
  MODS[h].show(body);
  window.scrollTo(0, 0);
}

/* ---------- START ---------- */
MODS.start = { show: function(b){
  var T = [
    ["sim", "⚡", L("Schaltungs-Simulator", "Simulateur de circuits"), "linear-gradient(135deg,#ff8a00,#ff4f9a)", L("Batterie, Widerstand, LED, Schalter, Messgeräte, Kondensator und Transistor per Drag & Drop. Überlast? Dann brennt etwas durch.", "Pile, résistance, LED, interrupteur, instruments, condensateur et transistor par glisser-déposer. Surcharge ? Quelque chose grille."), L("Stufe 1–3 live", "Niveaux 1–3 en direct")],
    ["disp", "📺", L("Display-Werkstatt", "Atelier d’écrans"), "linear-gradient(135deg,#2f7bff,#12c2e9)", L("12 Displays wählen (LCD 16×2, OLED, Nokia, TFT, 7-Segment …), darauf schreiben, zeichnen oder ein Bild laden – fertiger Code für Arduino Uno, ESP32 und Raspberry Pi.", "12 écrans au choix (LCD 16×2, OLED, Nokia, TFT, 7 segments …) : écris, dessine ou charge une image – code prêt pour Arduino Uno, ESP32 et Raspberry Pi."), L("Neu", "Nouveau")],
    ["watch", "⌚", "Oratio Watch", "linear-gradient(135deg,#12c2e9,#2f7bff)", L("Das Zifferblatt live im Browser – Farben, Zeiger und Stil frei wählbar. Gleiche Formen wie auf der echten Uhr.", "Le cadran en direct – couleurs, aiguilles et style au choix. Mêmes formes que sur la vraie montre."), L("Live", "En direct")],
    ["matrix", "🟦", L("LED-Matrix-Maler", "Éditeur de matrice LED"), "linear-gradient(135deg,#7a3cff,#ff4f9a)", L("64×32 Pixel malen und als fertigen ESP32-Code exportieren.", "Dessine 64×32 pixels et exporte le code ESP32 prêt à l’emploi."), L("Export ESP32", "Export ESP32")],
    ["term", "💻", L("Terminal-Trainer", "Entraîneur de terminal"), "linear-gradient(135deg,#1c2230,#2fe38a)", L("Ein Übungs-Terminal mit 10 kleinen Missionen. Nichts kann kaputtgehen.", "Un terminal d’entraînement avec 10 petites missions. Rien ne peut casser."), L("10 Missionen", "10 missions")],
    ["game", "🎮", L("Mini-Spiele", "Mini-jeux"), "linear-gradient(135deg,#2fe38a,#ffd400)", L("LED-Memory, Ohm-Quiz, Farbcode-Trainer und Reaktionstest – alle mit Highscore.", "Mémoire LED, quiz d’Ohm, code couleur et test de réaction – avec records."), "Highscore"]
  ];
  var g = el("div", "lgrid");
  T.forEach(function(t){ var a = el("button", "ltile", '<div class="th" style="background:' + t[3] + '">' + t[1] + ' <b>' + t[2] + '</b></div><div class="tb">' + t[4] + '<br><span class="tag">' + t[5] + '</span></div>'); a.onclick = function(){ location.hash = t[0]; }; g.appendChild(a); });
  b.appendChild(g);
  b.appendChild(el("p", "lmut", L("Alle Werkstätten laufen komplett in deinem Browser – nichts wird hochgeladen.", "Tous les ateliers tournent entièrement dans ton navigateur – rien n’est envoyé.")));
} };

/* ---------- SIMULATOR ---------- */
var RVALS = [10, 22, 47, 100, 150, 220, 330, 470, 680, 1000, 2200, 4700, 10000, 47000, 100000];
var BVALS = [1.5, 3, 5, 9, 12];
var CVALS = [1e-6, 10e-6, 100e-6, 470e-6, 1000e-6, 4700e-6];
function fmtC(c){ return (c * 1e6) + " µF"; }
var LEDS = [["Rot", "Rouge", 1.9, "#ff2a2a"], ["Grün", "Vert", 2.1, "#2cff5a"], ["Gelb", "Jaune", 2.0, "#ffd400"], ["Blau", "Bleu", 3.0, "#2f8bff"], ["Weiß", "Blanc", 3.1, "#f4f7ff"]];
function fmtR(r){ return r >= 1000 ? (r / 1000) + " kΩ" : r + " Ω"; }
function fmtI(i){ i = Math.abs(i); return i < 1 ? (i * 1000).toFixed(i < 0.01 ? 2 : 1) + " mA" : i.toFixed(2) + " A"; }
function fmtU(u){ return u.toFixed(2) + " V"; }
var S = { comps: [], wires: [], sel: null, pend: null, id: 1, res: null, svg: null, drag: null, t: 0, speed: 0.02, pause: false, run: false };

function npins(c){ return c.type === "tr" ? 3 : 2; }
function pinPos(c, k){ if (c.type === "tr") return [c.x + (k === 0 ? -40 : 40), c.y + (k === 1 ? -24 : k === 2 ? 24 : 0)]; return [c.x + (k ? 40 : -40), c.y]; }
function findPin(id, k){ for (var i = 0; i < S.comps.length; i++) if (S.comps[i].id === id) return pinPos(S.comps[i], k); return null; }
function addComp(type, x, y){
  var c = { id: S.id++, type: type, x: x, y: y, val: type === "bat" ? 3 : type === "res" ? 5 : type === "cap" ? 2 : 0, on: true, burn: false, vc: 0 };
  S.comps.push(c); return c;
}
function snap(v){ return Math.round(v / 20) * 20; }
var BETA = 100;
function solve(dt){
  var comps = S.comps, parent = {};
  function key(id, k){ return id + ":" + k; }
  function f(a){ while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; }
  comps.forEach(function(c){ for (var k = 0; k < npins(c); k++) parent[key(c.id, k)] = key(c.id, k); });
  S.wires.forEach(function(w){ if (parent[w.a] && parent[w.b]) { var x = f(w.a), y = f(w.b); if (x !== y) parent[x] = y; } });
  var idx = {}, n = 0;
  var bat = comps.filter(function(c){ return c.type === "bat"; })[0];
  var gnd = bat ? f(key(bat.id, 0)) : null;
  comps.forEach(function(c){ for (var k = 0; k < npins(c); k++) { var r = f(key(c.id, k)); if (r !== gnd && idx[r] === undefined) idx[r] = n++; } });
  var res = { v: {}, i: {}, aux: {} };
  if (!bat) { comps.forEach(function(c){ res.v[c.id] = 0; res.i[c.id] = 0; res.aux[c.id] = { ib: 0 }; }); return res; }
  function ni(c, k){ var r = f(key(c.id, k)); return r === gnd ? -1 : idx[r]; }
  var ledOn = {}, trS = {};
  var V = new Array(n).fill(0), iter, changed;
  function vv(i){ return i < 0 ? 0 : V[i]; }
  for (iter = 0; iter < 60; iter++) {
    var A = [], z = new Array(n).fill(0), r;
    for (r = 0; r < n; r++) { A.push(new Array(n).fill(0)); A[r][r] += 1e-9; }
    var gst = function(a, b, g){ if (a >= 0) A[a][a] += g; if (b >= 0) A[b][b] += g; if (a >= 0 && b >= 0) { A[a][b] -= g; A[b][a] -= g; } };
    var inj = function(a, i){ if (a >= 0) z[a] += i; };
    var ad = function(r2, c2, v){ if (r2 >= 0 && c2 >= 0) A[r2][c2] += v; };
    comps.forEach(function(c){
      var a = ni(c, 0), b = ni(c, 1);
      if (c.type === "bat") { var g = 5, Vb = BVALS[c.val]; gst(a, b, g); inj(b, Vb * g); inj(a, -Vb * g); }
      else if (c.type === "res") gst(a, b, c.burn ? 1e-9 : 1 / RVALS[c.val]);
      else if (c.type === "sw") gst(a, b, c.on ? 1000 : 1e-9);
      else if (c.type === "vm") gst(a, b, 1e-7);
      else if (c.type === "am") gst(a, b, 100);
      else if (c.type === "cap") { var gc = dt > 0 ? CVALS[c.val] / dt : 1e4; gst(a, b, gc); inj(a, gc * c.vc); inj(b, -gc * c.vc); }
      else if (c.type === "led") {
        if (c.burn) gst(a, b, 1e-9);
        else if (ledOn[c.id]) { var gd = 0.1, vf = LEDS[c.val][2]; gst(a, b, gd); inj(a, gd * vf); inj(b, -gd * vf); }
        else gst(a, b, 1e-9);
      }
      else if (c.type === "tr") {
        var B = a, C = b, E = ni(c, 2), s = c.burn ? 0 : (trS[c.id] || 0);
        if (s >= 1) {
          var gbe = 0.1, vbe = 0.7, kk = BETA * gbe;
          gst(B, E, gbe); inj(B, gbe * vbe); inj(E, -gbe * vbe);
          if (s === 1) { ad(C, B, kk); ad(C, E, -kk); ad(E, B, -kk); ad(E, E, kk); inj(C, kk * vbe); inj(E, -kk * vbe); }
          else gst(C, E, 0.2);
        }
      }
    });
    var M = A.map(function(row, i){ return row.concat([z[i]]); }), i, j, k;
    for (i = 0; i < n; i++) {
      var p = i;
      for (j = i + 1; j < n; j++) if (Math.abs(M[j][i]) > Math.abs(M[p][i])) p = j;
      var t = M[i]; M[i] = M[p]; M[p] = t;
      if (Math.abs(M[i][i]) < 1e-18) continue;
      for (j = i + 1; j < n; j++) { var fct = M[j][i] / M[i][i]; if (fct) for (k = i; k <= n; k++) M[j][k] -= fct * M[i][k]; }
    }
    for (i = n - 1; i >= 0; i--) { var sm = M[i][n]; for (j = i + 1; j < n; j++) sm -= M[i][j] * V[j]; V[i] = Math.abs(M[i][i]) < 1e-18 ? 0 : sm / M[i][i]; }
    changed = false;
    comps.forEach(function(c){
      if (c.burn) return;
      if (c.type === "led") {
        var va = vv(ni(c, 0)), vb = vv(ni(c, 1)), vf = LEDS[c.val][2], cu = (va - vb - vf) * 0.1;
        if (ledOn[c.id] && cu < 0) { ledOn[c.id] = false; changed = true; }
        else if (!ledOn[c.id] && va - vb > vf) { ledOn[c.id] = true; changed = true; }
      } else if (c.type === "tr") {
        var vB = vv(ni(c, 0)), vC = vv(ni(c, 1)), vE = vv(ni(c, 2)), s2 = trS[c.id] || 0, ib = 0.1 * (vB - vE - 0.7), ns = s2;
        if (s2 === 0) { if (vB - vE > 0.7) ns = 1; }
        else if (ib < 0) ns = 0;
        else if (s2 === 1 && vC - vE < 0.1) ns = 2;
        else if (s2 === 2 && (vC - vE) / 5 > BETA * ib * 1.0001) ns = 1;
        if (ns !== s2) { trS[c.id] = ns; changed = true; }
      }
    });
    if (!changed) break;
  }
  comps.forEach(function(c){
    var a = ni(c, 0), b = ni(c, 1), va = vv(a), vb = vv(b), u = va - vb, i = 0, ax = { ib: 0 };
    if (c.type === "bat") { u = vb - va; i = (BVALS[c.val] - u) * 5; }
    else if (c.type === "res") i = c.burn ? 0 : u / RVALS[c.val];
    else if (c.type === "sw") i = c.on ? u * 1000 : 0;
    else if (c.type === "vm") i = 0;
    else if (c.type === "am") i = u * 100;
    else if (c.type === "cap") i = (dt > 0 ? CVALS[c.val] / dt : 1e4) * (u - c.vc);
    else if (c.type === "led") i = (!c.burn && ledOn[c.id]) ? (u - LEDS[c.val][2]) * 0.1 : 0;
    else if (c.type === "tr") {
      var vE = vv(ni(c, 2)), s = c.burn ? 0 : (trS[c.id] || 0), ib = s ? Math.max(0, 0.1 * (va - vE - 0.7)) : 0;
      ax = { ib: ib, vbe: va - vE, state: s };
      u = vb - vE; i = s === 1 ? BETA * ib : s === 2 ? (vb - vE) / 5 : 0;
    }
    res.v[c.id] = u; res.i[c.id] = i; res.aux[c.id] = ax;
  });
  return res;
}
function evaluate(dt){
  dt = dt || 0;
  var burned = false, res, tries = 0;
  do {
    burned = false; res = solve(dt);
    S.comps.forEach(function(c){
      if (c.burn) return;
      if (c.type === "led" && res.i[c.id] > 0.04) { c.burn = true; burned = true; S.msg = L("💥 Eine LED ist durchgebrannt (über 40 mA)! Nimm einen größeren Vorwiderstand.", "💥 Une LED a grillé (plus de 40 mA) ! Prends une résistance plus grande."); }
      if (c.type === "res" && res.v[c.id] * res.i[c.id] > 0.25) { c.burn = true; burned = true; S.msg = L("💨 Ein Widerstand ist überhitzt (über 0,25 W) und raucht!", "💨 Une résistance a surchauffé (plus de 0,25 W) et fume !"); }
      if (c.type === "tr" && res.i[c.id] > 0.1) { c.burn = true; burned = true; S.msg = L("💥 Der Transistor ist überlastet (über 100 mA Kollektorstrom)! Nimm einen größeren Kollektorwiderstand.", "💥 Le transistor est surchargé (plus de 100 mA) ! Prends une résistance de collecteur plus grande."); }
    });
  } while (burned && ++tries < 6);
  if (dt > 0) { S.t += dt; S.comps.forEach(function(c){ if (c.type === "cap") c.vc = res.v[c.id]; }); }
  S.res = res;
  var bat = S.comps.filter(function(c){ return c.type === "bat"; });
  res.short = bat.some(function(c){ return res.i[c.id] > 3; });
  return res;
}
function ledCount(minI, maxI){ return S.comps.filter(function(c){ return c.type === "led" && !c.burn && S.res.i[c.id] >= minI && S.res.i[c.id] <= maxI; }).length; }
var MISSIONS = [
  ["① " + L("Bring eine LED zum Leuchten (2–30 mA), ohne dass sie durchbrennt.", "Fais briller une LED (2–30 mA) sans qu’elle grille."), function(){ return ledCount(0.002, 0.03) >= 1; }],
  ["① " + L("Betreibe eine LED an 9 V mit etwa 10 mA (8–12 mA). Rechne: R = (9 V − Uf) ÷ 10 mA.", "Fais fonctionner une LED sur 9 V avec environ 10 mA (8–12 mA). Calcule : R = (9 V − Uf) ÷ 10 mA."), function(){ var b = S.comps.filter(function(c){ return c.type === "bat" && BVALS[c.val] === 9; }).length; return b && ledCount(0.008, 0.012) >= 1; }],
  ["① " + L("Zwei LEDs leuchten gleichzeitig (Reihenschaltung).", "Deux LED brillent en même temps (montage en série)."), function(){ return ledCount(0.002, 0.03) >= 2; }],
  ["② " + L("Baue einen Schalter ein: aus = LED dunkel, an = LED leuchtet.", "Ajoute un interrupteur : ouvert = LED éteinte, fermé = LED allumée."), function(){ return S.comps.some(function(c){ return c.type === "sw"; }) && ledCount(0.002, 0.03) >= 1; }],
  ["② " + L("Miss den Strom mit einem Amperemeter (Anzeige über 1 mA).", "Mesure le courant avec un ampèremètre (affichage > 1 mA)."), function(){ return S.comps.some(function(c){ return c.type === "am" && Math.abs(S.res.i[c.id]) > 0.001; }); }],
  ["③ " + L("Lade einen Kondensator auf über 4 V auf (Schalter zu, kurz warten).", "Charge un condensateur au-dessus de 4 V (ferme l’interrupteur, attends)."), function(){ return S.comps.some(function(c){ return c.type === "cap" && c.vc > 4; }); }],
  ["③ " + L("Ein geladener Kondensator lässt eine LED leuchten, während die Batterie getrennt ist (Strom < 0,1 mA).", "Un condensateur chargé fait briller une LED pendant que la pile est coupée (courant < 0,1 mA)."), function(){ var cap = S.comps.some(function(c){ return c.type === "cap" && c.vc > 0.5; }); var bi = S.comps.filter(function(c){ return c.type === "bat"; }).every(function(c){ return Math.abs(S.res.i[c.id]) < 0.0001; }); return cap && bi && ledCount(0.001, 0.03) >= 1; }],
  ["③ " + L("Transistor als Schalter: Basisstrom unter 1 mA schaltet eine LED mit über 5 mA.", "Transistor en interrupteur : un courant de base < 1 mA commande une LED à plus de 5 mA."), function(){ return S.comps.some(function(c){ var a = S.res.aux[c.id]; return c.type === "tr" && !c.burn && a && a.ib > 0 && a.ib < 0.001; }) && ledCount(0.005, 0.03) >= 1; }]
];
MODS.sim = { show: function(b){
  var wrap = el("div", "lsplit"), left = el("div"), right = el("div");
  wrap.appendChild(left); wrap.appendChild(right); b.appendChild(wrap);
  var pal = el("div", "lrow"); pal.style.marginBottom = "10px";
  [["bat", "🔋", L("Batterie", "Pile")], ["res", "▭", L("Widerstand", "Résistance")], ["led", "💡", "LED"], ["sw", "🎚️", L("Schalter", "Interrupteur")], ["am", "Ⓐ", L("Amperemeter", "Ampèremètre")], ["vm", "Ⓥ", L("Voltmeter", "Voltmètre")], ["cap", "⫴", L("Kondensator", "Condensateur")], ["tr", "🔺", L("Transistor", "Transistor")]].forEach(function(t){
    var x = el("button", "lbtn", t[1] + " " + t[2]); x.onclick = function(){ var n = S.comps.length; addComp(t[0], snap(160 + (n % 5) * 120), snap(100 + Math.floor(n / 5) * 110 + (n % 2) * 30)); S.sel = { k: "c", id: S.id - 1 }; draw(); }; pal.appendChild(x);
  });
  left.appendChild(pal);
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("viewBox", "0 0 900 520"); svg.setAttribute("class", "sboard"); S.svg = svg;
  left.appendChild(svg);
  var stat = el("div", "sstat"); stat.id = "sstat"; left.appendChild(stat);
  var warn = el("div", "swarn"); warn.id = "swarn"; warn.hidden = true; left.appendChild(warn);
  var hint = el("p", "lmut", L("Tipp: Auf einen Anschlusspunkt (Kreis) tippen, dann auf einen zweiten – schon ist ein Draht verlegt. Bauteile lassen sich verschieben. Schalter: antippen.", "Astuce : touche un point de connexion (cercle), puis un second – le fil est posé. Les composants se déplacent. Interrupteur : touche-le."));
  left.appendChild(hint);
  var insp = el("div", "lcard"); insp.id = "sinsp"; right.appendChild(insp);
  var mc = el("div", "lcard"); mc.style.marginTop = "16px"; mc.innerHTML = "<h2>" + L("Missionen", "Missions") + "</h2><ul class='mis' id='smis'></ul>"; right.appendChild(mc);
  var tools = el("div", "lcard"); tools.style.marginTop = "16px";
  tools.innerHTML = "<h2>" + L("Werkzeuge", "Outils") + "</h2>";
  var r = el("div", "lrow");
  function btn(t, fn, c){ var x = el("button", "lbtn " + (c || ""), t); x.onclick = fn; r.appendChild(x); return x; }
  btn("① " + L("Beispiel: LED", "Exemple : LED"), function(){ loadExample(1); }, "pri");
  btn("③ " + L("Beispiel: Kondensator", "Exemple : condensateur"), function(){ loadExample(2); }, "pri");
  btn("③ " + L("Beispiel: Transistor", "Exemple : transistor"), function(){ loadExample(3); }, "pri");
  btn(L("Defekte reparieren", "Réparer"), function(){ S.comps.forEach(function(c){ c.burn = false; }); S.msg = ""; draw(); });
  btn(L("Kondensatoren entladen", "Décharger les condensateurs"), function(){ S.comps.forEach(function(c){ c.vc = 0; }); S.t = 0; draw(); });
  var pz = btn("⏸ " + L("Pause", "Pause"), function(){ S.pause = !S.pause; pz.textContent = S.pause ? "▶ " + L("Weiter", "Reprendre") : "⏸ " + L("Pause", "Pause"); });
  [[0.005, "🐢"], [0.02, "🚶"], [0.1, "🐇"]].forEach(function(sp){ var x = btn(sp[1], function(){ S.speed = sp[0]; r.querySelectorAll(".sp").forEach(function(y){ y.classList.toggle("on", y === x); }); }); x.classList.add("sp"); x.title = L("Zeitablauf", "Vitesse"); if (S.speed === sp[0]) x.classList.add("on"); });
  btn(L("Alles löschen", "Tout effacer"), function(){ S.comps = []; S.wires = []; S.sel = null; S.pend = null; S.msg = ""; S.t = 0; draw(); }, "bad");
  tools.appendChild(r);
  tools.appendChild(el("p", "lmut", L("Faustformel: Vorwiderstand R = (U − Uf) ÷ I. Rote LED: Uf ≈ 1,9 V, blau/weiß ≈ 3 V.", "Formule : résistance R = (U − Uf) ÷ I. LED rouge : Uf ≈ 1,9 V, bleue/blanche ≈ 3 V.")));
  right.appendChild(tools);
  bind(svg);
  if (!S.comps.length) { var d = sv("sim"); if (d && d.comps && d.comps.length) { S.comps = d.comps; S.wires = d.wires; S.id = d.id; } else loadExample(1); }
  draw();
  S.run = true;
  (function loop(){ if (!S.run || !S.svg || !S.svg.isConnected) return; if (!S.pause && S.comps.some(function(c){ return c.type === "cap"; })) { evaluate(S.speed); draw(true, true); } requestAnimationFrame(loop); })();
}, stop: function(){ S.drag = null; S.run = false; } };
function loadExample(k){
  S.comps = []; S.wires = []; S.id = 1; S.sel = null; S.pend = null; S.msg = ""; S.t = 0;
  function W(a, ai, b2, bi){ S.wires.push({ a: a.id + ":" + ai, b: b2.id + ":" + bi }); }
  var bt, rs, ld, sw, cp, vm, tr, rb, rc;
  if (!k || k === 1) {
    bt = addComp("bat", 160, 260); bt.val = 3; rs = addComp("res", 420, 120); rs.val = 6; ld = addComp("led", 700, 260);
    W(bt, 1, rs, 0); W(rs, 1, ld, 0); W(ld, 1, bt, 0);
  } else if (k === 2) {
    bt = addComp("bat", 120, 340); bt.val = 3; sw = addComp("sw", 300, 120); sw.on = false; rs = addComp("res", 500, 120); rs.val = 9; cp = addComp("cap", 700, 260); cp.val = 2; vm = addComp("vm", 440, 340);
    W(bt, 1, sw, 0); W(sw, 1, rs, 0); W(rs, 1, cp, 0); W(cp, 1, bt, 0); W(rs, 1, vm, 0); W(vm, 1, bt, 0);
  } else {
    bt = addComp("bat", 120, 340); bt.val = 3; sw = addComp("sw", 280, 100); sw.on = false; rb = addComp("res", 460, 100); rb.val = 12; tr = addComp("tr", 700, 340);
    rc = addComp("res", 340, 220); rc.val = 7; ld = addComp("led", 540, 220);
    W(bt, 1, sw, 0); W(sw, 1, rb, 0); W(rb, 1, tr, 0); W(bt, 1, rc, 0); W(rc, 1, ld, 0); W(ld, 1, tr, 1); W(tr, 2, bt, 0);
  }
  draw();
}
function pt(e){ var p = S.svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; var m = S.svg.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 }; }
function bind(svg){
  svg.addEventListener("pointerdown", function(e){
    var t = e.target, p = pt(e), cg = t.closest ? t.closest("[data-c]") : null;
    if (t.dataset && t.dataset.pin) {
      if (S.pend && S.pend !== t.dataset.pin) {
        var dup = S.wires.some(function(w){ return (w.a === S.pend && w.b === t.dataset.pin) || (w.b === S.pend && w.a === t.dataset.pin); });
        if (!dup && S.pend.split(":")[0] !== t.dataset.pin.split(":")[0]) S.wires.push({ a: S.pend, b: t.dataset.pin });
        S.pend = null;
      } else S.pend = (S.pend === t.dataset.pin) ? null : t.dataset.pin;
      draw(); return;
    }
    if (t.dataset && t.dataset.w !== undefined) { S.sel = { k: "w", i: +t.dataset.w }; S.pend = null; draw(); return; }
    if (cg) {
      var id = +cg.dataset.c, c = S.comps.filter(function(x){ return x.id === id; })[0];
      S.sel = { k: "c", id: id }; S.pend = null;
      S.drag = { id: id, dx: p.x - c.x, dy: p.y - c.y, moved: false, sx: p.x, sy: p.y };
      try { svg.setPointerCapture(e.pointerId); } catch(er){}
      draw(); return;
    }
    S.sel = null; S.pend = null; draw();
  });
  svg.addEventListener("pointermove", function(e){
    if (!S.drag) return; var p = pt(e), d = S.drag, c = S.comps.filter(function(x){ return x.id === d.id; })[0];
    if (!c) return;
    if (Math.abs(p.x - d.sx) + Math.abs(p.y - d.sy) > 6) d.moved = true;
    if (d.moved) { c.x = Math.max(60, Math.min(840, snap(p.x - d.dx))); c.y = Math.max(40, Math.min(480, snap(p.y - d.dy))); draw(true); }
  });
  function up(){
    if (!S.drag) return; var d = S.drag; S.drag = null;
    var c = S.comps.filter(function(x){ return x.id === d.id; })[0];
    if (c && !d.moved && c.type === "sw") c.on = !c.on;
    draw();
  }
  svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
}
function cmpSvg(c, r){
  var u = r.v[c.id] || 0, i = r.i[c.id] || 0, g = "", cx = c.x, cy = c.y, ink = "var(--lst)";
  var hl = '<rect class="hl" x="' + (cx - 52) + '" y="' + (cy - 34) + '" width="104" height="68" rx="12"/>';
  var lab = "", name = "";
  if (c.type === "bat") {
    name = BVALS[c.val] + " V " + L("Batterie", "Pile");
    g = '<rect x="' + (cx - 34) + '" y="' + (cy - 20) + '" width="68" height="40" rx="8" fill="var(--lfill)" stroke="' + ink + '" stroke-width="3"/><rect x="' + (cx + 14) + '" y="' + (cy - 20) + '" width="20" height="40" fill="#ff8a00" opacity=".85"/><text x="' + (cx - 14) + '" y="' + (cy + 7) + '" font-size="22" font-weight="800" text-anchor="middle" fill="' + ink + '">−</text><text x="' + (cx + 24) + '" y="' + (cy + 7) + '" font-size="22" font-weight="800" text-anchor="middle" fill="#fff">+</text>';
    lab = fmtI(i);
  } else if (c.type === "res") {
    name = fmtR(RVALS[c.val]);
    g = '<rect x="' + (cx - 32) + '" y="' + (cy - 13) + '" width="64" height="26" rx="6" fill="' + (c.burn ? "#3a3a3a" : "#e9d3a2") + '" stroke="' + ink + '" stroke-width="3"/>' + (c.burn ? '<text x="' + cx + '" y="' + (cy - 20) + '" font-size="20" text-anchor="middle">💨</text>' : "");
    lab = fmtU(Math.abs(u)) + " · " + fmtI(i);
  } else if (c.type === "led") {
    var L0 = LEDS[c.val], br = c.burn ? 0 : Math.min(1.3, Math.max(0, i / 0.02));
    name = "LED " + (fr ? L0[1] : L0[0]);
    g = (br > 0.03 ? '<circle cx="' + cx + '" cy="' + cy + '" r="' + (30 + 16 * br) + '" fill="' + L0[3] + '" opacity="' + Math.min(0.55, 0.15 + br * 0.35) + '"/>' : "")
      + '<polygon points="' + (cx - 14) + ',' + (cy - 18) + ' ' + (cx - 14) + ',' + (cy + 18) + ' ' + (cx + 16) + ',' + cy + '" fill="' + (c.burn ? "#444" : L0[3]) + '" fill-opacity="' + (c.burn ? 1 : 0.35 + 0.65 * Math.min(1, br)) + '" stroke="' + ink + '" stroke-width="3" stroke-linejoin="round"/><line x1="' + (cx + 18) + '" y1="' + (cy - 18) + '" x2="' + (cx + 18) + '" y2="' + (cy + 18) + '" stroke="' + ink + '" stroke-width="3.5"/>' + (c.burn ? '<text x="' + cx + '" y="' + (cy - 26) + '" font-size="22" text-anchor="middle">💥</text>' : "");
    lab = c.burn ? L("durchgebrannt", "grillée") : fmtI(i);
  } else if (c.type === "sw") {
    name = L("Schalter ", "Interrupteur ") + (c.on ? L("AN", "ON") : L("AUS", "OFF"));
    g = '<circle cx="' + (cx - 26) + '" cy="' + cy + '" r="5" fill="' + ink + '"/><circle cx="' + (cx + 26) + '" cy="' + cy + '" r="5" fill="' + ink + '"/><line x1="' + (cx - 26) + '" y1="' + cy + '" x2="' + (c.on ? cx + 26 : cx + 18) + '" y2="' + (c.on ? cy : cy - 24) + '" stroke="' + (c.on ? "#2cc46a" : ink) + '" stroke-width="5" stroke-linecap="round"/>';
    lab = c.on ? fmtI(i) : "";
  } else if (c.type === "cap") {
    var cmax = 12, fl = Math.max(0, Math.min(1, Math.abs(c.vc) / cmax));
    name = fmtC(CVALS[c.val]) + " " + L("Kondensator", "Condensateur");
    g = '<rect x="' + (cx - 14) + '" y="' + (cy - 26) + '" width="28" height="52" rx="5" fill="var(--lfill)" stroke="none"/><rect x="' + (cx - 14) + '" y="' + (cy + 26 - 52 * fl) + '" width="28" height="' + (52 * fl) + '" fill="#2f8bff" opacity=".55"/><line x1="' + (cx - 7) + '" y1="' + (cy - 26) + '" x2="' + (cx - 7) + '" y2="' + (cy + 26) + '" stroke="' + ink + '" stroke-width="5"/><line x1="' + (cx + 7) + '" y1="' + (cy - 26) + '" x2="' + (cx + 7) + '" y2="' + (cy + 26) + '" stroke="' + ink + '" stroke-width="5"/>';
    lab = fmtU(c.vc) + " · " + fmtI(i);
  } else if (c.type === "tr") {
    var ax = r.aux[c.id] || {}, ic = i;
    name = "NPN (β=" + BETA + ")";
    g = '<circle cx="' + cx + '" cy="' + cy + '" r="30" fill="' + (ax.state ? "rgba(47,227,138,.18)" : "var(--lfill)") + '" stroke="' + ink + '" stroke-width="3"/><line x1="' + (cx - 10) + '" y1="' + (cy - 16) + '" x2="' + (cx - 10) + '" y2="' + (cy + 16) + '" stroke="' + ink + '" stroke-width="5"/><line x1="' + (cx - 30) + '" y1="' + cy + '" x2="' + (cx - 10) + '" y2="' + cy + '" stroke="' + ink + '" stroke-width="3"/><line x1="' + (cx - 10) + '" y1="' + (cy - 8) + '" x2="' + (cx + 12) + '" y2="' + (cy - 20) + '" stroke="' + ink + '" stroke-width="3"/><line x1="' + (cx - 10) + '" y1="' + (cy + 8) + '" x2="' + (cx + 12) + '" y2="' + (cy + 20) + '" stroke="' + ink + '" stroke-width="3"/><polygon points="' + (cx + 12) + ',' + (cy + 20) + ' ' + (cx + 2) + ',' + (cy + 19) + ' ' + (cx + 8) + ',' + (cy + 10) + '" fill="' + ink + '"/><text x="' + (cx + 38) + '" y="' + (cy - 16) + '" font-size="13" font-weight="700" fill="var(--lmute)">C</text><text x="' + (cx + 38) + '" y="' + (cy + 36) + '" font-size="13" font-weight="700" fill="var(--lmute)">E</text><text x="' + (cx - 44) + '" y="' + (cy - 8) + '" font-size="13" font-weight="700" fill="var(--lmute)">B</text>' + (c.burn ? '<text x="' + cx + '" y="' + (cy - 38) + '" font-size="22" text-anchor="middle">💥</text>' : "");
    lab = c.burn ? L("durchgebrannt", "grillé") : "Ib " + fmtI(ax.ib || 0) + " · Ic " + fmtI(ic);
  } else if (c.type === "am" || c.type === "vm") {
    var isA = c.type === "am";
    name = isA ? L("Amperemeter", "Ampèremètre") : L("Voltmeter", "Voltmètre");
    g = '<circle cx="' + cx + '" cy="' + cy + '" r="26" fill="var(--lfill)" stroke="' + ink + '" stroke-width="3"/><text x="' + cx + '" y="' + (cy + 9) + '" font-size="26" font-weight="800" text-anchor="middle" fill="' + (isA ? "#e0364a" : "#2f7bff") + '">' + (isA ? "A" : "V") + '</text>';
    lab = isA ? fmtI(i) : fmtU(Math.abs(u));
  }
  var pins = [0, 1, 2].slice(0, npins(c)).map(function(k){ var p = pinPos(c, k), ax0 = c.type === "tr" ? (k === 0 ? cx - 30 : cx + 24) : (k ? cx + 30 : cx - 30), ay0 = c.type === "tr" ? (k === 0 ? cy : cy + (k === 1 ? -20 : 20)) : cy; return '<line x1="' + ax0 + '" y1="' + ay0 + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="' + ink + '" stroke-width="3"/><circle class="pin' + (S.pend === c.id + ":" + k ? " pend" : "") + '" data-pin="' + c.id + ":" + k + '" cx="' + p[0] + '" cy="' + p[1] + '" r="9"/>'; }).join("");
  return '<g class="cmp' + (S.sel && S.sel.k === "c" && S.sel.id === c.id ? " sel" : "") + '" data-c="' + c.id + '">' + hl + '<rect x="' + (cx - 52) + '" y="' + (cy - 34) + '" width="104" height="68" rx="12" fill="transparent"/>' + g + '</g>' + pins
    + '<text x="' + cx + '" y="' + (cy + 54) + '" font-size="17" font-weight="700" text-anchor="middle" fill="var(--lmute)" pointer-events="none">' + name + '</text>'
    + '<text x="' + cx + '" y="' + (cy + 72) + '" font-size="17" text-anchor="middle" fill="var(--lst)" pointer-events="none">' + lab + '</text>';
}
function draw(light, frame){
  var svg = S.svg; if (!svg || !svg.isConnected) return;
  var r = frame ? S.res : evaluate(0);
  var h = '<defs><pattern id="gd" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1.4" fill="var(--ldot)"/></pattern></defs><rect width="900" height="520" fill="url(#gd)"/>';
  S.wires.forEach(function(w, i){
    var a = w.a.split(":"), b = w.b.split(":"), pa = findPin(+a[0], +a[1]), pb = findPin(+b[0], +b[1]);
    if (!pa || !pb) return;
    var mx = (pa[0] + pb[0]) / 2, d = "M" + pa[0] + " " + pa[1] + " L" + mx + " " + pa[1] + " L" + mx + " " + pb[1] + " L" + pb[0] + " " + pb[1];
    if (Math.abs(pa[1] - pb[1]) < 10) { var dy = Math.min(500, pa[1] + 90 + (i % 3) * 14); d = "M" + pa[0] + " " + pa[1] + " L" + pa[0] + " " + dy + " L" + pb[0] + " " + dy + " L" + pb[0] + " " + pb[1]; }
    h += '<path class="wire' + (S.sel && S.sel.k === "w" && S.sel.i === i ? " sel" : "") + '" d="' + d + '"/><path class="wh" data-w="' + i + '" d="' + d + '"/>';
  });
  S.comps.forEach(function(c){ h += cmpSvg(c, r); });
  svg.innerHTML = h;
  // Inspector
  var ins = frame ? null : $("#sinsp"); if (ins) {
    ins.innerHTML = "";
    var sel = S.sel, c = sel && sel.k === "c" ? S.comps.filter(function(x){ return x.id === sel.id; })[0] : null;
    if (c) {
      var nm = { bat: L("Batterie", "Pile"), res: L("Widerstand", "Résistance"), led: "LED", sw: L("Schalter", "Interrupteur"), am: L("Amperemeter", "Ampèremètre"), vm: L("Voltmeter", "Voltmètre"), cap: L("Kondensator", "Condensateur"), tr: L("Transistor NPN", "Transistor NPN") }[c.type];
      ins.appendChild(el("h2", "", nm));
      var vals = c.type === "bat" ? BVALS.map(function(v){ return v + " V"; }) : c.type === "res" ? RVALS.map(fmtR) : c.type === "cap" ? CVALS.map(fmtC) : c.type === "led" ? LEDS.map(function(l){ return fr ? l[1] : l[0]; }) : null;
      if (vals) {
        var s = el("div", "step"), m = el("button", "lbtn", "−"), lb = el("b", "", vals[c.val]), p = el("button", "lbtn", "+");
        m.onclick = function(){ c.val = Math.max(0, c.val - 1); draw(); }; p.onclick = function(){ c.val = Math.min(vals.length - 1, c.val + 1); draw(); };
        s.appendChild(m); s.appendChild(lb); s.appendChild(p); ins.appendChild(s);
      }
      if (c.type === "sw") { var tg = el("button", "lbtn pri", c.on ? L("Ausschalten", "Ouvrir") : L("Einschalten", "Fermer")); tg.onclick = function(){ c.on = !c.on; draw(); }; ins.appendChild(tg); ins.appendChild(document.createTextNode(" ")); }
      if (c.burn) { var rp = el("button", "lbtn", L("Reparieren", "Réparer")); rp.onclick = function(){ c.burn = false; S.msg = ""; draw(); }; ins.appendChild(rp); ins.appendChild(document.createTextNode(" ")); }
      var del = el("button", "lbtn bad", L("Entfernen", "Supprimer")); del.onclick = function(){ S.comps = S.comps.filter(function(x){ return x.id !== c.id; }); S.wires = S.wires.filter(function(w){ return +w.a.split(":")[0] !== c.id && +w.b.split(":")[0] !== c.id; }); S.sel = null; draw(); };
      ins.appendChild(del);
      if (c.type === "led") ins.appendChild(el("p", "lmut", L("Durchlassspannung Uf ≈ ", "Tension directe Uf ≈ ") + LEDS[c.val][2] + " V. " + L("Über 40 mA brennt sie durch.", "Au-dessus de 40 mA elle grille.")));
      if (c.type === "tr") ins.appendChild(el("p", "lmut", L("B = Basis (links), C = Kollektor (oben), E = Emitter (unten). Ab 0,7 V zwischen B und E fließt Basisstrom, der Kollektorstrom ist dann 100× größer – bis der Transistor sättigt. Max. 100 mA.", "B = base (gauche), C = collecteur (haut), E = émetteur (bas). Dès 0,7 V entre B et E, le courant de base commande un courant de collecteur 100× plus grand – jusqu’à saturation. Max. 100 mA.")));
      if (c.type === "cap") ins.appendChild(el("p", "lmut", L("Speichert Ladung. Zeitkonstante τ = R × C: nach etwa 5 τ ist er voll. Spannung: ", "Stocke de la charge. Constante de temps τ = R × C : plein après environ 5 τ. Tension : ") + fmtU(c.vc)));
      if (c.type === "res") ins.appendChild(el("p", "lmut", L("Max. 0,25 W – dann raucht er.", "Max. 0,25 W – ensuite elle fume.")));
    } else if (sel && sel.k === "w") {
      ins.appendChild(el("h2", "", L("Draht", "Fil")));
      var dw = el("button", "lbtn bad", L("Draht entfernen", "Supprimer le fil")); dw.onclick = function(){ S.wires.splice(sel.i, 1); S.sel = null; draw(); }; ins.appendChild(dw);
    } else {
      ins.appendChild(el("h2", "", L("Bauteil wählen", "Choisir un composant")));
      ins.appendChild(el("p", "lmut", L("Tippe ein Bauteil an, um Wert, Farbe oder Schalterstellung zu ändern. Neue Bauteile holst du über die Knöpfe oben.", "Touche un composant pour changer valeur, couleur ou position. Les nouveaux composants se prennent avec les boutons du haut.")));
    }
  }
  var stt = $("#sstat"); if (stt) {
    var bats = S.comps.filter(function(c){ return c.type === "bat"; });
    stt.innerHTML = bats.length ? bats.map(function(c){ return "<span>🔋 " + BVALS[c.val] + " V · " + fmtI(r.i[c.id]) + " " + L("Gesamtstrom", "courant total") + "</span>"; }).join("") + "<span>⏱ t = " + S.t.toFixed(2) + " s</span><span>⚡ P = " + (bats.reduce(function(s, c){ return s + BVALS[c.val] * r.i[c.id]; }, 0)).toFixed(2) + " W</span>" : "<span>" + L("Keine Batterie – hol dir eine oben.", "Pas de pile – prends-en une en haut.") + "</span>";
  }
  var wn = $("#swarn"); if (wn) { var msg = r.short ? L("⚠️ Kurzschluss! Die Batterie wird direkt überbrückt – nimm einen Widerstand.", "⚠️ Court-circuit ! La pile est directement shuntée – ajoute une résistance.") : S.msg; wn.hidden = !msg; wn.textContent = msg || ""; }
  var ms = $("#smis"); if (ms) { ms.innerHTML = MISSIONS.map(function(m){ var ok = false; try { ok = m[1](); } catch(e){} return '<li class="' + (ok ? "ok" : "") + '"><i>' + (ok ? "✓" : "·") + "</i><span>" + m[0] + "</span></li>"; }).join(""); }
  if (!light) st("sim", { comps: S.comps, wires: S.wires, id: S.id });
}
document.addEventListener("keydown", function(e){
  if (cur !== "sim" || (e.key !== "Delete" && e.key !== "Backspace") || /INPUT|TEXTAREA/.test((e.target || {}).tagName || "")) return;
  var sel = S.sel; if (!sel) return;
  if (sel.k === "c") { S.comps = S.comps.filter(function(x){ return x.id !== sel.id; }); S.wires = S.wires.filter(function(w){ return +w.a.split(":")[0] !== sel.id && +w.b.split(":")[0] !== sel.id; }); }
  else S.wires.splice(sel.i, 1);
  S.sel = null; draw(); e.preventDefault();
});

/* ---------- WATCH ---------- */
var WO = { face: "klassik", bg: "#0a0e18", acc: "#2fe38a", hand: "#f2f5ff", sec: true, bat: true, lvl: 78, date: true };
MODS.watch = { show: function(b){
  var o = sv("watch"); if (o) for (var k in o) WO[k] = o[k];
  var wrap = el("div", "lsplit"), left = el("div", "lcard"), right = el("div", "lcard");
  wrap.appendChild(left); wrap.appendChild(right); b.appendChild(wrap);
  var cv = el("canvas", "wcv"); cv.width = 932; cv.height = 932; cv.id = "wcv"; left.appendChild(cv);
  left.appendChild(el("p", "lmut", L("466 × 466 Pixel, gezeichnet nur aus Kreisen, Bögen, Linien und Rechtecken – genau wie die Formen im Formen-PDF. Zeigerwinkel: 30° pro Stunde, 6° pro Minute und Sekunde.", "466 × 466 pixels, dessiné uniquement avec des cercles, arcs, lignes et rectangles – comme les formes du PDF. Angles : 30° par heure, 6° par minute et seconde.")));
  right.innerHTML = "<h2>" + L("Zifferblatt gestalten", "Personnaliser le cadran") + "</h2>";
  var ch = el("div", "fchips"); ch.style.marginBottom = "12px";
  [["klassik", L("Klassik", "Classique")], ["neon", "Neon"], ["minimal", "Minimal"], ["digital", "Digital"]].forEach(function(f){ var x = el("button", "lbtn" + (WO.face === f[0] ? " on" : ""), f[1]); x.onclick = function(){ WO.face = f[0]; st("watch", WO); ch.querySelectorAll("button").forEach(function(y){ y.classList.remove("on"); }); x.classList.add("on"); }; ch.appendChild(x); });
  right.appendChild(ch);
  var op = el("div", "wopt");
  function col(lbl, key){ var l = el("label", "", "<span>" + lbl + "</span>"), i = el("input"); i.type = "color"; i.value = WO[key]; i.oninput = function(){ WO[key] = i.value; st("watch", WO); }; l.appendChild(i); op.appendChild(l); }
  function chk(lbl, key){ var l = el("label", "", "<span>" + lbl + "</span>"), i = el("input"); i.type = "checkbox"; i.checked = WO[key]; i.onchange = function(){ WO[key] = i.checked; st("watch", WO); }; l.appendChild(i); op.appendChild(l); }
  col(L("Hintergrund", "Fond"), "bg"); col(L("Akzentfarbe", "Couleur d’accent"), "acc"); col(L("Zeiger", "Aiguilles"), "hand");
  chk(L("Sekundenzeiger", "Trotteuse"), "sec"); chk(L("Batterie-Bogen", "Arc de batterie"), "bat"); chk(L("Datum", "Date"), "date");
  var lv = el("label", "", "<span>" + L("Akku-Stand", "Niveau batterie") + "</span>"), ri = el("input"); ri.type = "range"; ri.min = 0; ri.max = 100; ri.value = WO.lvl; ri.oninput = function(){ WO.lvl = +ri.value; st("watch", WO); }; lv.appendChild(ri); op.appendChild(lv);
  right.appendChild(op);
  var r = el("div", "lrow"); r.style.marginTop = "14px";
  var cd = el("textarea", "code"); cd.readOnly = true; cd.style.height = "130px"; cd.style.marginTop = "14px";
  function mkcode(){ function c565(h){ var n = parseInt(h.slice(1), 16); return "0x" + ("0000" + ((((n >> 19) & 31) << 11) | (((n >> 10) & 63) << 5) | ((n >> 3) & 31)).toString(16)).slice(-4).toUpperCase(); }
    cd.value = "// Oratio Watch – Farben (RGB565) für dein Watchface\n#define WF_STIL      \"" + WO.face + "\"\n#define WF_HINTERGRUND " + c565(WO.bg) + "\n#define WF_AKZENT      " + c565(WO.acc) + "\n#define WF_ZEIGER      " + c565(WO.hand) + "\n#define WF_SEKUNDEN    " + (WO.sec ? 1 : 0) + "\n#define WF_BATTERIEBOGEN " + (WO.bat ? 1 : 0) + "\n// Zeigerwinkel: Stunde = (h%12 + min/60) * 30, Minute = (min + s/60) * 6, Sekunde = s * 6"; }
  setInterval(function(){ if (!cd.isConnected) return; mkcode(); }, 500); mkcode();
  var cpb = el("button", "lbtn", L("Farben als Code kopieren", "Copier les couleurs")); cpb.onclick = function(){ copy(cd.value, cd, function(){ cpb.textContent = L("Kopiert ✓", "Copié ✓"); setTimeout(function(){ cpb.textContent = L("Farben als Code kopieren", "Copier les couleurs"); }, 1500); }); }; r.appendChild(cpb);
  var png = el("button", "lbtn pri", L("Als PNG speichern", "Enregistrer en PNG")); png.onclick = function(){ cv.toBlob(function(bl){ if (bl) save("oratio-watch.png", bl); }); }; r.appendChild(png);
  var rs = el("button", "lbtn", L("Zurücksetzen", "Réinitialiser")); rs.onclick = function(){ WO = { face: "klassik", bg: "#0a0e18", acc: "#2fe38a", hand: "#f2f5ff", sec: true, bat: true, lvl: 78, date: true }; st("watch", WO); route(); }; r.appendChild(rs);
  right.appendChild(r); right.appendChild(cd);
  var ctx = cv.getContext("2d");
  MODS.watch.t = true;
  (function loop(){ if (!MODS.watch.t || !cv.isConnected) return; drawWatch(ctx); requestAnimationFrame(loop); })();
}, stop: function(){ MODS.watch.t = false; } };
function drawWatch(c){
  var C = 233, now = new Date(), ms = now.getMilliseconds(), s = now.getSeconds() + ms / 1000, m = now.getMinutes() + s / 60, h = (now.getHours() % 12) + m / 60;
  c.setTransform(2, 0, 0, 2, 0, 0); c.clearRect(0, 0, 466, 466);
  c.save(); c.beginPath(); c.arc(C, C, C, 0, 7); c.clip();
  c.fillStyle = WO.bg; c.fillRect(0, 0, 466, 466);
  var g = c.createRadialGradient(C, C - 60, 20, C, C, C); g.addColorStop(0, "rgba(255,255,255,.07)"); g.addColorStop(1, "rgba(0,0,0,.35)"); c.fillStyle = g; c.fillRect(0, 0, 466, 466);
  function pol(r, deg){ var a = deg * Math.PI / 180; return [C + Math.sin(a) * r, C - Math.cos(a) * r]; }
  var f = WO.face, i, p, q;
  if (WO.bat) {
    c.lineCap = "round"; c.lineWidth = 7; c.strokeStyle = "rgba(255,255,255,.15)";
    c.beginPath(); c.arc(C, C, 196, (150 - 90) * Math.PI / 180, (210 - 90) * Math.PI / 180); c.stroke();
    c.strokeStyle = WO.lvl > 20 ? WO.acc : "#ff4b4b";
    c.beginPath(); c.arc(C, C, 196, (150 - 90) * Math.PI / 180, (150 + 60 * WO.lvl / 100 - 90) * Math.PI / 180); c.stroke();
  }
  if (f === "digital") {
    var hh = now.getHours(), mm = now.getMinutes(), ss = now.getSeconds(), z = function(n){ return (n < 10 ? "0" : "") + n; };
    c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = WO.hand; c.font = "800 112px Inter,system-ui,sans-serif"; c.fillText(z(hh) + ":" + z(mm), C, C - 10);
    if (WO.sec) { c.fillStyle = WO.acc; c.font = "700 44px Inter,system-ui,sans-serif"; c.fillText(z(ss), C, C + 70); }
    c.strokeStyle = WO.acc; c.lineWidth = 6; c.lineCap = "round"; c.beginPath(); c.arc(C, C, 214, -Math.PI / 2, -Math.PI / 2 + s / 60 * 2 * Math.PI); c.stroke();
    if (WO.date) { var dd = fr ? ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"] : ["SO", "MO", "DI", "MI", "DO", "FR", "SA"]; c.fillStyle = "rgba(255,255,255,.55)"; c.font = "700 26px Inter,system-ui,sans-serif"; c.fillText(dd[now.getDay()] + " " + now.getDate() + "." + (now.getMonth() + 1) + ".", C, C - 94); }
    c.restore(); return;
  }
  if (f === "klassik") {
    for (i = 0; i < 60; i++) { var big = i % 5 === 0; p = pol(214, i * 6); q = pol(214 - (big ? 26 : 10), i * 6); c.strokeStyle = big ? WO.acc : "rgba(255,255,255,.4)"; c.lineWidth = big ? 5 : 2; c.lineCap = "butt"; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); }
    c.fillStyle = WO.hand; c.font = "700 40px Inter,system-ui,sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    [[12, 0], [3, 90], [6, 180], [9, 270]].forEach(function(n){ if (n[0] === 6 && WO.bat) return; var t = pol(166, n[1]); c.fillText(n[0], t[0], t[1] + 2); });
  } else if (f === "neon") {
    c.shadowColor = WO.acc; c.shadowBlur = 16;
    c.strokeStyle = WO.acc; c.lineWidth = 5; c.beginPath(); c.arc(C, C, 214, 0, 7); c.stroke();
    c.fillStyle = WO.acc; for (i = 0; i < 12; i++) { p = pol(184, i * 30); c.beginPath(); c.arc(p[0], p[1], i % 3 === 0 ? 9 : 5, 0, 7); c.fill(); }
    c.shadowBlur = 0;
  } else {
    c.fillStyle = WO.acc; for (i = 0; i < 4; i++) { p = pol(206, i * 90); c.beginPath(); c.arc(p[0], p[1], 6, 0, 7); c.fill(); }
    c.fillStyle = "rgba(255,255,255,.35)"; for (i = 0; i < 12; i++) if (i % 3) { p = pol(206, i * 30); c.beginPath(); c.arc(p[0], p[1], 2.5, 0, 7); c.fill(); }
  }
  if (WO.date) {
    var days = fr ? ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"] : ["SO", "MO", "DI", "MI", "DO", "FR", "SA"], txt = days[now.getDay()] + " " + now.getDate();
    c.fillStyle = "rgba(255,255,255,.55)"; c.font = "700 22px Inter,system-ui,sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(txt, C, C + 92);
  }
  function hand(len, w, deg, col, tail, glow){
    var a = pol(len, deg), t = pol(-tail, deg);
    c.save(); c.lineCap = "round"; c.strokeStyle = col; c.lineWidth = w; if (glow) { c.shadowColor = col; c.shadowBlur = 14; }
    c.shadowOffsetY = glow ? 0 : 3; if (!glow) c.shadowColor = "rgba(0,0,0,.5)", c.shadowBlur = 6;
    c.beginPath(); c.moveTo(t[0], t[1]); c.lineTo(a[0], a[1]); c.stroke(); c.restore();
  }
  var thin = f === "minimal", gl = f === "neon";
  hand(112, thin ? 6 : 12, h * 30, WO.hand, 16, gl);
  hand(170, thin ? 4 : 8, m * 6, WO.hand, 20, gl);
  if (WO.sec) hand(196, 3, s * 6, WO.acc, 36, gl);
  c.fillStyle = WO.acc; c.beginPath(); c.arc(C, C, 11, 0, 7); c.fill(); c.fillStyle = WO.bg; c.beginPath(); c.arc(C, C, 4.5, 0, 7); c.fill();
  c.restore();
}

/* ---------- MATRIX ---------- */
var MW = 64, MH = 32, MX = { px: null, col: "#ff2a2a", tool: "pen", draw: false };
var MPAL = ["#000000", "#ffffff", "#ff2a2a", "#ff8a00", "#ffd400", "#2cff5a", "#12c2e9", "#2f7bff", "#7a3cff", "#ff4fb8", "#8b5a2b", "#7f8a99"];
function hexN(h){ return parseInt(h.slice(1), 16); }
MODS.matrix = { show: function(b){
  if (!MX.px) { var d = sv("matrix"); MX.px = (d && d.length === MW * MH) ? d : new Array(MW * MH).fill("#000000"); }
  var cv = el("canvas", "mcv"); cv.width = MW * 14; cv.height = MH * 14;
  var card = el("div", "lcard"); b.appendChild(card);
  var tl = el("div", "lrow"); tl.style.marginBottom = "10px";
  var tools = [["pen", "✏️ " + L("Stift", "Crayon")], ["erase", "🧽 " + L("Radierer", "Gomme")], ["fill", "🪣 " + L("Füllen", "Remplir")]];
  tools.forEach(function(t){ var x = el("button", "lbtn" + (MX.tool === t[0] ? " on" : ""), t[1]); x.onclick = function(){ MX.tool = t[0]; tl.querySelectorAll("button").forEach(function(y){ y.classList.remove("on"); }); x.classList.add("on"); }; tl.appendChild(x); });
  var ci = el("input"); ci.type = "color"; ci.value = MX.col; ci.style.cssText = "width:46px;height:40px;border:1px solid var(--line);border-radius:10px;padding:2px;background:none"; ci.oninput = function(){ MX.col = ci.value; pal.querySelectorAll("button").forEach(function(y){ y.classList.remove("on"); }); };
  tl.appendChild(ci);
  card.appendChild(tl);
  var pal = el("div", "pal"); pal.style.marginBottom = "10px";
  MPAL.forEach(function(c){ var x = el("button", MX.col === c ? "on" : ""); x.style.background = c; x.onclick = function(){ MX.col = c; ci.value = c; pal.querySelectorAll("button").forEach(function(y){ y.classList.remove("on"); }); x.classList.add("on"); if (MX.tool === "erase") MX.tool = "pen"; tl.querySelectorAll("button").forEach(function(y, i){ y.classList.toggle("on", tools[i] && tools[i][0] === MX.tool); }); }; pal.appendChild(x); });
  card.appendChild(pal); var okEvt = guard(cv, card, null); card.appendChild(cv);
  var ctx = cv.getContext("2d");
  function paint(){
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cv.width, cv.height);
    for (var y = 0; y < MH; y++) for (var x = 0; x < MW; x++) { var c = MX.px[y * MW + x]; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x * 14 + 7, y * 14 + 7, c === "#000000" ? 2 : 5.6, 0, 7); if (c === "#000000") ctx.fillStyle = "#1a1f2b"; ctx.fill(); }
  }
  function cell(e){ var r = cv.getBoundingClientRect(); return [Math.floor((e.clientX - r.left) / r.width * MW), Math.floor((e.clientY - r.top) / r.height * MH)]; }
  var last = null;
  function put(x, y){ if (x < 0 || y < 0 || x >= MW || y >= MH) return; MX.px[y * MW + x] = MX.tool === "erase" ? "#000000" : MX.col; }
  function line(a, c){ var n = Math.max(Math.abs(c[0] - a[0]), Math.abs(c[1] - a[1]), 1); for (var i = 0; i <= n; i++) put(Math.round(a[0] + (c[0] - a[0]) * i / n), Math.round(a[1] + (c[1] - a[1]) * i / n)); }
  function flood(x, y){ var t = MX.px[y * MW + x], n = MX.col; if (t === n) return; var q = [[x, y]]; while (q.length) { var p = q.pop(); if (p[0] < 0 || p[1] < 0 || p[0] >= MW || p[1] >= MH || MX.px[p[1] * MW + p[0]] !== t) continue; MX.px[p[1] * MW + p[0]] = n; q.push([p[0] + 1, p[1]], [p[0] - 1, p[1]], [p[0], p[1] + 1], [p[0], p[1] - 1]); } }
  press(cv, {
    start: function(e){ var c = cell(e); if (MX.tool === "fill") { if (c[0] >= 0 && c[0] < MW && c[1] >= 0 && c[1] < MH) flood(c[0], c[1]); } else { MX.draw = true; last = c; put(c[0], c[1]); } paint(); code(); },
    move: function(e){ if (!MX.draw) return; var c = cell(e); line(last, c); last = c; paint(); },
    end: function(){ if (MX.draw) { MX.draw = false; st("matrix", MX.px); code(); } else st("matrix", MX.px); }
  });
  var r = el("div", "lrow"); r.style.margin = "12px 0";
  function btn(t, fn, c){ var x = el("button", "lbtn " + (c || ""), t); x.onclick = fn; r.appendChild(x); }
  btn(L("Leeren", "Effacer"), function(){ MX.px.fill("#000000"); paint(); code(); st("matrix", MX.px); }, "bad");
  btn("❤️ " + L("Herz", "Cœur"), function(){ example("heart"); });
  btn("🙂 Smiley", function(){ example("smile"); });
  btn("🌈 " + L("Regenbogen", "Arc-en-ciel"), function(){ example("rainbow"); });
  card.appendChild(r);
  var r3 = el("div", "lrow"); r3.style.marginBottom = "12px";
  var ti = el("input", "in"); ti.type = "text"; ti.placeholder = L("Text, z. B. 12:30", "Texte, ex. 12:30"); ti.maxLength = 14; ti.style.cssText = "width:160px;padding:9px;border:1px solid var(--line);border-radius:10px;background:var(--input);color:var(--fg)";
  var tx = el("input"); tx.type = "number"; tx.value = 2; tx.min = 0; tx.max = 63; tx.title = "x"; tx.style.cssText = ti.style.cssText.replace("160px", "64px");
  var ty = el("input"); ty.type = "number"; ty.value = 10; ty.min = 0; ty.max = 31; ty.title = "y"; ty.style.cssText = tx.style.cssText;
  var tb2 = el("button", "lbtn", "🔤 " + L("Text stempeln", "Tamponner le texte"));
  tb2.onclick = function(){ if (!ti.value) return; var o = document.createElement("canvas"); o.width = MW; o.height = MH; var x2 = o.getContext("2d"); x2.fillStyle = MX.col; x2.textBaseline = "top"; x2.font = "bold 12px monospace"; x2.fillText(ti.value, +tx.value, +ty.value - 5); var d2 = x2.getImageData(0, 0, MW, MH).data; for (var q = 0; q < MW * MH; q++) if (d2[q * 4 + 3] > 110) MX.px[q] = MX.col; paint(); code(); st("matrix", MX.px); };
  var fi = el("input"); fi.type = "file"; fi.accept = "image/*"; fi.hidden = true;
  var ib = el("button", "lbtn", "🖼️ " + L("Bild laden (wird auf 64×32 verkleinert)", "Charger une image (réduite à 64×32)")); ib.onclick = function(){ fi.click(); };
  fi.onchange = function(){ var fl = fi.files && fi.files[0]; if (!fl) return; var im = new Image(); im.onload = function(){ var o = document.createElement("canvas"); o.width = MW; o.height = MH; var x2 = o.getContext("2d"); x2.fillStyle = "#000"; x2.fillRect(0, 0, MW, MH); var sc = Math.min(MW / im.width, MH / im.height), w = im.width * sc, h = im.height * sc; x2.imageSmoothingQuality = "high"; x2.drawImage(im, (MW - w) / 2, (MH - h) / 2, w, h); var d2 = x2.getImageData(0, 0, MW, MH).data; for (var q = 0; q < MW * MH; q++) MX.px[q] = "#" + [0, 1, 2].map(function(k){ return ("0" + d2[q * 4 + k].toString(16)).slice(-2); }).join(""); paint(); code(); st("matrix", MX.px); URL.revokeObjectURL(im.src); }; im.src = URL.createObjectURL(fl); fi.value = ""; };
  r3.appendChild(ti); r3.appendChild(document.createTextNode("x")); r3.appendChild(tx); r3.appendChild(document.createTextNode("y")); r3.appendChild(ty); r3.appendChild(tb2); r3.appendChild(ib); r3.appendChild(fi);
  card.appendChild(r3);
  var h2 = el("h2", "", L("Code exportieren", "Exporter le code")); h2.style.marginTop = "6px"; card.appendChild(h2);
  card.appendChild(el("p", "lmut", L("Für ein 64×32-HUB75-Panel. ESP32: Bibliothek „ESP32-HUB75-MatrixPanel-DMA“, Pixel als RGB565-Tabelle im Flash. Raspberry Pi: Python mit der Bibliothek „rpi-rgb-led-matrix“.", "Pour un panneau HUB75 64×32. ESP32 : bibliothèque « ESP32-HUB75-MatrixPanel-DMA », pixels en table RGB565. Raspberry Pi : Python avec la bibliothèque « rpi-rgb-led-matrix ».")));
  var lr = el("div", "lrow"); lr.style.marginBottom = "10px";
  var cl = sv("mxlang") || "cpp";
  [["cpp", "ESP32 · C++"], ["py", "Raspberry Pi · Python"]].forEach(function(o){ var x = el("button", "lbtn" + (cl === o[0] ? " on" : ""), o[1]); x.onclick = function(){ cl = o[0]; st("mxlang", cl); lr.querySelectorAll("button").forEach(function(y){ y.classList.remove("on"); }); x.classList.add("on"); db.textContent = cl === "py" ? L(".py speichern", "Enregistrer .py") : L(".ino speichern", "Enregistrer .ino"); code(); }; lr.appendChild(x); });
  card.appendChild(lr);
  var ta = el("textarea", "code"); ta.readOnly = true; card.appendChild(ta);
  var r2 = el("div", "lrow"); r2.style.marginTop = "10px";
  var cb = el("button", "lbtn pri", L("Code kopieren", "Copier le code")); cb.onclick = function(){ copy(ta.value, ta, function(){ cb.textContent = L("Kopiert ✓", "Copié ✓"); setTimeout(function(){ cb.textContent = L("Code kopieren", "Copier le code"); }, 1600); }); }; r2.appendChild(cb);
  var db = el("button", "lbtn", cl === "py" ? L(".py speichern", "Enregistrer .py") : L(".ino speichern", "Enregistrer .ino")); db.onclick = function(){ save(cl === "py" ? "oratio_matrix.py" : "oratio_matrix.ino", new Blob([ta.value], { type: "text/plain" })); }; r2.appendChild(db);
  var pb = el("button", "lbtn", L("Bild als PNG", "Image en PNG")); pb.onclick = function(){ cv.toBlob(function(bl){ if (bl) save("oratio-matrix.png", bl); }); }; r2.appendChild(pb);
  card.appendChild(r2);
  function codePy(){
    var rows = [], y, x;
    for (y = 0; y < MH; y++) { var row = []; for (x = 0; x < MW; x++) row.push(MX.px[y * MW + x].slice(1)); rows.push('    "' + row.join(" ") + '"'); }
    return "#!/usr/bin/env python3\n# Oratio Lab – LED-Matrix 64x32 für Raspberry Pi (Bibliothek rpi-rgb-led-matrix von hzeller)\n# Start:  sudo python3 oratio_matrix.py\nimport time\nfrom rgbmatrix import RGBMatrix, RGBMatrixOptions\n\n# Ein Pixel = RRGGBB (Hex), eine Zeile = 64 Pixel, 32 Zeilen\nBILD = [\n" + rows.join(",\n") + "\n]\n\nopt = RGBMatrixOptions()\nopt.rows = 32\nopt.cols = 64\nopt.chain_length = 1\nopt.hardware_mapping = \"regular\"   # mit Adafruit-HAT: \"adafruit-hat\"\nopt.brightness = 60\nmatrix = RGBMatrix(options=opt)\ncanvas = matrix.CreateFrameCanvas()\n\nfor y, zeile in enumerate(BILD):\n    for x, farbe in enumerate(zeile.split()):\n        r, g, b = int(farbe[0:2], 16), int(farbe[2:4], 16), int(farbe[4:6], 16)\n        canvas.SetPixel(x, y, r, g, b)\ncanvas = matrix.SwapOnVSync(canvas)\n\ntry:\n    while True:\n        time.sleep(1)\nexcept KeyboardInterrupt:\n    matrix.Clear()\n";
  }
  function code(){
    if (cl === "py") { ta.value = codePy(); return; }
    var rows = [], y, x;
    for (y = 0; y < MH; y++) { var row = []; for (x = 0; x < MW; x++) { var n = hexN(MX.px[y * MW + x]), r5 = (n >> 19) & 31, g6 = (n >> 10) & 63, b5 = (n >> 3) & 31, v = (r5 << 11) | (g6 << 5) | b5; row.push("0x" + ("0000" + v.toString(16)).slice(-4)); } rows.push("  " + row.join(",")); }
    ta.value = "// Oratio Lab – LED-Matrix 64x32 (RGB565)\n#include <ESP32-HUB75-MatrixPanel-I2S-DMA.h>\n\nMatrixPanel_I2S_DMA *dma_display = nullptr;\n\nconst uint16_t bild[32 * 64] PROGMEM = {\n" + rows.join(",\n") + "\n};\n\nvoid setup() {\n  HUB75_I2S_CFG cfg(64, 32, 1);\n  dma_display = new MatrixPanel_I2S_DMA(cfg);\n  dma_display->begin();\n  dma_display->setBrightness8(90);\n  for (int y = 0; y < 32; y++)\n    for (int x = 0; x < 64; x++)\n      dma_display->drawPixel(x, y, pgm_read_word(&bild[y * 64 + x]));\n}\n\nvoid loop() {}\n";
  }
  function example(k){
    MX.px.fill("#000000"); var x, y;
    if (k === "heart") { for (y = 0; y < MH; y++) for (x = 0; x < MW; x++) { var nx = (x - 31.5) / 11, ny = -(y - 14) / 11, v = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny; if (v <= 0) MX.px[y * MW + x] = "#ff2a5a"; } }
    else if (k === "smile") { for (y = 0; y < MH; y++) for (x = 0; x < MW; x++) { var dx = x - 31.5, dy = y - 15.5, d = Math.sqrt(dx * dx + dy * dy); if (d < 14.5) MX.px[y * MW + x] = "#ffd400"; if (d < 14.5 && ((Math.abs(dx + 5) < 2 && Math.abs(dy + 4) < 3) || (Math.abs(dx - 5) < 2 && Math.abs(dy + 4) < 3))) MX.px[y * MW + x] = "#000000"; if (dy > 3 && dy < 8 && d > 8 && d < 11 && Math.abs(dx) < 9) MX.px[y * MW + x] = "#000000"; } }
    else { for (y = 0; y < MH; y++) for (x = 0; x < MW; x++) { var hh = (x / MW * 360 + y * 4) % 360, c = hsl(hh); MX.px[y * MW + x] = c; } }
    paint(); code(); st("matrix", MX.px);
  }
  function hsl(h){ var a = h / 60, i = Math.floor(a) % 6, f = a - Math.floor(a), q = 1 - f, rgb = [[1, f, 0], [q, 1, 0], [0, 1, f], [0, q, 1], [f, 0, 1], [1, 0, q]][i]; return "#" + rgb.map(function(v){ return ("0" + Math.round(v * 255).toString(16)).slice(-2); }).join(""); }
  paint(); code();
} };

/* ---------- TERMINAL ---------- */
var FS, CWD, HIST, HI;
function fsInit(){
  FS = { t: "d", c: { home: { t: "d", c: { oratio: { t: "d", c: { "notizen.txt": { t: "f", s: "Willkommen im Oratio Lab!\nHier kann nichts kaputtgehen.\n" }, bilder: { t: "d", c: { "uhr.png": { t: "f", s: "(Bild)" } } } } } } }, etc: { t: "d", c: { hostname: { t: "f", s: "oratio-lab\n" } } } } };
  CWD = ["home", "oratio"]; HIST = []; HI = 0;
}
function resolve(p, wantParent){
  var parts = p.charAt(0) === "/" ? [] : CWD.slice(), segs = p.split("/").filter(function(x){ return x !== ""; }), last = null;
  for (var i = 0; i < segs.length; i++) { if (segs[i] === ".") continue; if (segs[i] === "..") { parts.pop(); continue; } parts.push(segs[i]); }
  if (wantParent) { last = parts.pop(); }
  var n = FS, ok = true;
  for (var j = 0; j < parts.length; j++) { if (n.t === "d" && n.c[parts[j]]) n = n.c[parts[j]]; else { ok = false; break; } }
  return { node: ok ? n : null, parts: parts, last: last };
}
function termRun(line, out){
  var redirect = null, app = false, m = line.match(/(>>?)\s*(\S+)\s*$/);
  if (m) { redirect = m[2]; app = m[1] === ">>"; line = line.slice(0, m.index); }
  var toks = [], re = /"([^"]*)"|'([^']*)'|(\S+)/g, t;
  while ((t = re.exec(line))) toks.push(t[1] !== undefined ? t[1] : t[2] !== undefined ? t[2] : t[3]);
  var cmd = toks[0], a = toks.slice(1), o = "";
  function err(s){ out(s, "e"); }
  var flags = a.filter(function(x){ return x.charAt(0) === "-"; }).join(""), args = a.filter(function(x){ return x.charAt(0) !== "-"; });
  if (!cmd) return;
  if (cmd === "help") o = L("Befehle: pwd, ls [-l], cd, cat, mkdir, touch, rm [-r], cp, mv, echo (> und >>), grep, head, wc [-l], tree, date, whoami, clear. Tab vervollständigt Namen, Pfeil hoch holt alte Befehle.", "Commandes : pwd, ls [-l], cd, cat, mkdir, touch, rm [-r], cp, mv, echo (> et >>), grep, head, wc [-l], tree, date, whoami, clear. Tab complète les noms, flèche haut rappelle les commandes.");
  else if (cmd === "pwd") o = "/" + CWD.join("/");
  else if (cmd === "whoami") o = "oratio";
  else if (cmd === "date") o = new Date().toString();
  else if (cmd === "clear") { out(null); return; }
  else if (cmd === "echo") o = args.join(" ");
  else if (cmd === "ls") {
    var r = resolve(args[0] || "."); if (!r.node) return err("ls: " + L("Datei oder Verzeichnis nicht gefunden", "fichier ou dossier introuvable"));
    if (r.node.t === "f") o = args[0]; else { var names = Object.keys(r.node.c).sort(); o = flags.indexOf("l") >= 0 ? names.map(function(n){ var x = r.node.c[n]; return (x.t === "d" ? "drwxr-xr-x" : "-rw-r--r--") + " oratio " + String(x.t === "d" ? 4096 : x.s.length).padStart(5) + " " + n; }).join("\n") : names.map(function(n){ return r.node.c[n].t === "d" ? n + "/" : n; }).join("  "); }
  }
  else if (cmd === "cd") { var d = resolve(args[0] || "/home/oratio"); if (!d.node || d.node.t !== "d") return err("cd: " + L("Verzeichnis nicht gefunden: ", "dossier introuvable : ") + (args[0] || "")); CWD = d.parts; }
  else if (cmd === "cat" || cmd === "head") { if (!args[0]) return err(cmd + ": " + L("Dateiname fehlt", "nom de fichier manquant")); var f = resolve(args[0]); if (!f.node || f.node.t !== "f") return err(cmd + ": " + args[0] + ": " + L("keine Datei", "pas un fichier")); o = (cmd === "head" ? f.node.s.split("\n").slice(0, 10).join("\n") : f.node.s).replace(/\n$/, ""); }
  else if (cmd === "mkdir") { if (!args[0]) return err("mkdir: " + L("Name fehlt", "nom manquant")); args.forEach(function(p){ var r = resolve(p, true); if (!r.node || r.node.t !== "d") return err("mkdir: " + p + ": " + L("Pfad nicht gefunden", "chemin introuvable")); if (r.node.c[r.last]) return err("mkdir: " + p + ": " + L("existiert schon", "existe déjà")); r.node.c[r.last] = { t: "d", c: {} }; }); }
  else if (cmd === "touch") { if (!args[0]) return err("touch: " + L("Name fehlt", "nom manquant")); args.forEach(function(p){ var r = resolve(p, true); if (!r.node || r.node.t !== "d") return err("touch: " + p + ": " + L("Pfad nicht gefunden", "chemin introuvable")); if (!r.node.c[r.last]) r.node.c[r.last] = { t: "f", s: "" }; }); }
  else if (cmd === "rm") { if (!args[0]) return err("rm: " + L("Name fehlt", "nom manquant")); args.forEach(function(p){ var r = resolve(p, true); if (!r.node || !r.node.c[r.last]) return err("rm: " + p + ": " + L("nicht gefunden", "introuvable")); if (r.node.c[r.last].t === "d" && flags.indexOf("r") < 0) return err("rm: " + p + ": " + L("ist ein Verzeichnis (nimm rm -r)", "est un dossier (utilise rm -r)")); delete r.node.c[r.last]; }); }
  else if (cmd === "cp" || cmd === "mv") {
    if (args.length < 2) return err(cmd + ": " + L("Quelle und Ziel nötig", "source et destination requises"));
    var src = resolve(args[0]); if (!src.node) return err(cmd + ": " + args[0] + ": " + L("nicht gefunden", "introuvable"));
    var dst = resolve(args[1]), name, dir;
    if (dst.node && dst.node.t === "d") { dir = dst.node; name = args[0].split("/").filter(Boolean).pop(); } else { var dp = resolve(args[1], true); if (!dp.node || dp.node.t !== "d") return err(cmd + ": " + L("Ziel nicht gefunden", "destination introuvable")); dir = dp.node; name = dp.last; }
    dir.c[name] = JSON.parse(JSON.stringify(src.node));
    if (cmd === "mv") { var sp = resolve(args[0], true); if (sp.node && sp.node.c[sp.last] && !(sp.node === dir && sp.last === name)) delete sp.node.c[sp.last]; }
  }
  else if (cmd === "tree") { var tr0 = resolve(args[0] || "."); if (!tr0.node || tr0.node.t !== "d") return err("tree: " + L("Verzeichnis nicht gefunden", "dossier introuvable")); var lines = ["."]; (function walk(n, pre){ var ks = Object.keys(n.c).sort(); ks.forEach(function(k, i){ var last = i === ks.length - 1; lines.push(pre + (last ? "└── " : "├── ") + k + (n.c[k].t === "d" ? "/" : "")); if (n.c[k].t === "d") walk(n.c[k], pre + (last ? "    " : "│   ")); }); })(tr0.node, ""); o = lines.join("\n"); }
  else if (cmd === "wc") { if (!args[0]) return err("wc: " + L("Dateiname fehlt", "nom manquant")); var wf = resolve(args[0]); if (!wf.node || wf.node.t !== "f") return err("wc: " + args[0] + ": " + L("keine Datei", "pas un fichier")); var tx2 = wf.node.s; o = flags.indexOf("l") >= 0 ? String(tx2.split("\n").length - (tx2.slice(-1) === "\n" ? 1 : 0)) : (tx2.split("\n").length - (tx2.slice(-1) === "\n" ? 1 : 0)) + " " + (tx2.trim() ? tx2.trim().split(/\s+/).length : 0) + " " + tx2.length + " " + args[0]; }
  else if (cmd === "grep") { if (args.length < 2) return err("grep: " + L("Suchwort und Datei nötig", "mot et fichier requis")); var gf = resolve(args[1]); if (!gf.node || gf.node.t !== "f") return err("grep: " + args[1] + ": " + L("keine Datei", "pas un fichier")); o = gf.node.s.split("\n").filter(function(l){ return l.indexOf(args[0]) >= 0; }).join("\n"); }
  else return err(cmd + ": " + L("Befehl nicht gefunden. Tippe help.", "commande introuvable. Tape help."));
  if (redirect) { var rr = resolve(redirect, true); if (!rr.node || rr.node.t !== "d") return err(L("Ziel nicht gefunden", "destination introuvable")); var ex = rr.node.c[rr.last]; rr.node.c[rr.last] = { t: "f", s: (app && ex ? ex.s : "") + o + "\n" }; }
  else if (o) out(o);
}
function fileAt(path){ var r = resolve(path); return r.node && r.node.t === "f" ? r.node : null; }
var TMIS = [
  [L("Wo bist du? Tippe pwd.", "Où es-tu ? Tape pwd."), function(){ return used("pwd"); }],
  [L("Zeige den Inhalt mit ls (probiere auch ls -l).", "Affiche le contenu avec ls (essaie aussi ls -l)."), function(){ return used("ls"); }],
  [L("Lege einen Ordner an: mkdir projekt", "Crée un dossier : mkdir projekt"), function(){ return !!resolve("/home/oratio/projekt").node; }],
  [L("Wechsle hinein: cd projekt", "Entre dedans : cd projekt"), function(){ return CWD.join("/") === "home/oratio/projekt"; }],
  [L("Lege eine leere Datei an: touch hallo.txt", "Crée un fichier vide : touch hallo.txt"), function(){ return !!fileAt("/home/oratio/projekt/hallo.txt") || used("rm"); }],
  [L("Schreibe Text hinein: echo Hallo Welt > hallo.txt", "Écris du texte dedans : echo Hallo Welt > hallo.txt"), function(){ return (HIST.some(function(h){ return /^echo .*> *hallo\.txt/.test(h); })); }],
  [L("Lies die Datei: cat hallo.txt", "Lis le fichier : cat hallo.txt"), function(){ return HIST.some(function(h){ return /^cat hallo\.txt/.test(h); }); }],
  [L("Kopiere sie: cp hallo.txt kopie.txt", "Copie-le : cp hallo.txt kopie.txt"), function(){ return !!fileAt("/home/oratio/projekt/kopie.txt") || HIST.some(function(h){ return /^mv kopie\.txt/.test(h); }); }],
  [L("Verschiebe die Kopie eine Ebene höher: mv kopie.txt ../backup.txt", "Déplace la copie d’un niveau : mv kopie.txt ../backup.txt"), function(){ return !!fileAt("/home/oratio/backup.txt"); }],
  [L("Lösche das Original: rm hallo.txt", "Supprime l’original : rm hallo.txt"), function(){ return !fileAt("/home/oratio/projekt/hallo.txt") && HIST.some(function(h){ return /^rm hallo\.txt/.test(h); }); }],
  [L("Hänge Text an eine Datei an (>> statt >): echo Noch eine Zeile >> ../notizen.txt", "Ajoute du texte à un fichier (>> au lieu de >) : echo Encore une ligne >> ../notizen.txt"), function(){ var f = fileAt("/home/oratio/notizen.txt"); return !!f && f.s.indexOf("Hier kann nichts kaputtgehen.") >= 0 && f.s.split("\n").length > 3; }],
  [L("Suche ein Wort in einer Datei: grep Oratio ../notizen.txt", "Cherche un mot dans un fichier : grep Oratio ../notizen.txt"), function(){ return HIST.some(function(h){ return /^grep Oratio/.test(h); }); }],
  [L("Zähle Zeilen: wc -l ../notizen.txt", "Compte les lignes : wc -l ../notizen.txt"), function(){ return HIST.some(function(h){ return /^wc -l/.test(h); }); }],
  [L("Zeige den ganzen Baum: cd .. und dann tree", "Affiche l’arborescence : cd .. puis tree"), function(){ return used("tree"); }]
];
function used(c){ return HIST.some(function(h){ return h.split(" ")[0] === c; }); }
MODS.term = { show: function(b){
  if (!FS) fsInit();
  var wrap = el("div", "lsplit"), left = el("div"), right = el("div", "lcard");
  wrap.appendChild(left); wrap.appendChild(right); b.appendChild(wrap);
  var tm = el("div", "term"); left.appendChild(tm);
  var r = el("div", "lrow"); r.style.marginTop = "10px";
  var rb = el("button", "lbtn bad", L("Alles zurücksetzen", "Tout réinitialiser")); rb.onclick = function(){ fsInit(); route(); }; r.appendChild(rb);
  left.appendChild(r);
  right.innerHTML = "<h2>" + L("Missionen", "Missions") + "</h2><ul class='mis' id='tmis'></ul>";
  function prompt(){ return "/" + CWD.join("/"); }
  function mis(){ var u = $("#tmis"); if (!u) return; var done = 0; u.innerHTML = TMIS.map(function(m){ var ok = false; try { ok = m[1](); } catch(e){} if (ok) done++; return '<li class="' + (ok ? "ok" : "") + '"><i>' + (ok ? "✓" : "·") + "</i><span>" + m[0] + "</span></li>"; }).join("") + (done === TMIS.length ? "<li class='ok'><i>🏆</i><span><b>" + L("Alle Missionen geschafft!", "Toutes les missions réussies !") + "</b></span></li>" : ""); }
  function out(t, c){ if (t === null) { tm.querySelectorAll(".o").forEach(function(x){ x.remove(); }); return; } var d = el("div", "o " + (c || "")); d.textContent = t; tm.insertBefore(d, inl); }
  var inl = el("div", "in"); var pr = el("span", "p"); var inp = el("input"); inp.setAttribute("autocapitalize", "off"); inp.setAttribute("autocomplete", "off"); inp.setAttribute("autocorrect", "off"); inp.spellcheck = false; inp.setAttribute("enterkeyhint", "go");
  inl.appendChild(pr); inl.appendChild(inp); tm.appendChild(inl);
  function pp(){ pr.textContent = "oratio@lab:" + prompt() + "$"; }
  out(L("Willkommen im Übungs-Terminal. Tippe help – oder starte mit Mission 1.", "Bienvenue dans le terminal d’entraînement. Tape help – ou commence par la mission 1."), "d");
  inp.addEventListener("keydown", function(e){
    if (e.key === "Enter") { var v = inp.value.trim(); var p = el("div", "o"); p.innerHTML = '<span class="p">' + "oratio@lab:" + prompt() + "$</span> "; p.appendChild(document.createTextNode(inp.value)); tm.insertBefore(p, inl); inp.value = ""; if (v) { termRun(v, out); HIST.push(v); HI = HIST.length; } pp(); mis(); tm.scrollTop = tm.scrollHeight; }
    else if (e.key === "Tab") { e.preventDefault(); var vv2 = inp.value, sp = vv2.lastIndexOf(" "), word = vv2.slice(sp + 1), first = sp < 0, pool; if (first) pool = ["help", "pwd", "ls", "cd", "cat", "mkdir", "touch", "rm", "cp", "mv", "echo", "grep", "head", "wc", "tree", "date", "whoami", "clear"]; else { var sl = word.lastIndexOf("/"), dirp = sl >= 0 ? word.slice(0, sl + 1) : "", dn = resolve(dirp || "."); pool = dn.node && dn.node.t === "d" ? Object.keys(dn.node.c).map(function(k){ return dirp + k + (dn.node.c[k].t === "d" ? "/" : ""); }) : []; }
      var hit = pool.filter(function(k){ return k.indexOf(word) === 0; }); if (hit.length === 1) inp.value = vv2.slice(0, sp + 1) + hit[0] + (first ? " " : ""); else if (hit.length > 1) { var q2 = el("div", "o d"); q2.textContent = hit.join("  "); tm.insertBefore(q2, inl); tm.scrollTop = tm.scrollHeight; } }
    else if (e.key === "ArrowUp") { if (HI > 0) inp.value = HIST[--HI]; e.preventDefault(); }
    else if (e.key === "ArrowDown") { if (HI < HIST.length - 1) inp.value = HIST[++HI]; else { HI = HIST.length; inp.value = ""; } e.preventDefault(); }
  });
  tm.onclick = function(){ inp.focus(); };
  pp(); mis();
} };

/* ---------- DISPLAYS ---------- */
var FONT57 = "000000000000005f00000007000700147f147f14242a7f2a12231308646236495620500008070300001c2241000041221c002a1c7f1c2a08083e080800807030000808080808000060600020100804023e5149453e00427f400072494949462141494d331814127f1027454545393c4a49493141211109073649494936464949291e0000140000004034000000081422411414141414004122140802015909063e415d594e7c1211127c7f494949363e414141227f4141413e7f494949417f090909013e414151737f0808087f00417f41002040413f017f081422417f404040407f021c027f7f0408107f3e4141413e7f090909063e4151215e7f09192946264949493203017f01033f4040403f1f2040201f3f4038403f631408146303047804036159494d43007f4141410204081020004141417f04020102044040404040000307080020545478407f284444383844444428384444287f385454541800087e090218a4a49c787f0804047800447d40002040403d007f1028440000417f40007c047804787c080404783844444438fc1824241818242418fc7c08040408485454542404043f44243c4040207c1c2040201c3c4030403c44281028444c9090907c4464544c440008364100000077000000413608000201020402";
function glyph(ch){ var c = ch.charCodeAt(0); if (c < 32 || c > 126) c = 63; var o = (c - 32) * 10, g = []; for (var i = 0; i < 5; i++) g.push(parseInt(FONT57.substr(o + i * 2, 2), 16)); return g; }
function glyphRows(ch){ var g = glyph(ch), rows = []; for (var r = 0; r < 8; r++) { var v = 0; for (var c = 0; c < 5; c++) if ((g[c] >> r) & 1) v |= 1 << (4 - c); rows.push(v); } return rows; }
function newB(w, h){ return { w: w, h: h, d: new Uint32Array(w * h) }; }
function bset(B, x, y, v){ if (x >= 0 && y >= 0 && x < B.w && y < B.h) B.d[y * B.w + x] = v; }
function bdot(B, x, y, v, n){ var o = Math.floor((n - 1) / 2); for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) bset(B, x - o + a, y - o + b, v); }
function bline(B, x0, y0, x1, y1, v, bn){ var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy, n = 0; while (n++ < 5000) { (bn > 1 ? bdot(B, x0, y0, v, bn) : bset(B, x0, y0, v)); if (x0 === x1 && y0 === y1) break; var e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } }
function bflood(B, x, y, v){ if (x < 0 || y < 0 || x >= B.w || y >= B.h) return; var t = B.d[y * B.w + x]; if (t === v) return; var q = [[x, y]]; while (q.length) { var p = q.pop(); if (p[0] < 0 || p[1] < 0 || p[0] >= B.w || p[1] >= B.h || B.d[p[1] * B.w + p[0]] !== t) continue; B.d[p[1] * B.w + p[0]] = v; q.push([p[0] + 1, p[1]], [p[0] - 1, p[1]], [p[0], p[1] + 1], [p[0], p[1] - 1]); } }
function btext(B, x, y, t, s, v){ for (var i = 0; i < t.length; i++) { var g = glyph(t.charAt(i)); for (var c = 0; c < 5; c++) for (var r = 0; r < 8; r++) if ((g[c] >> r) & 1) for (var a = 0; a < s; a++) for (var b2 = 0; b2 < s; b2++) bset(B, x + (i * 6 + c) * s + a, y + r * s + b2, v); } }
function bcopy(B){ var n = newB(B.w, B.h); n.d.set(B.d); return n; }
function bcircle(B, x0, y0, r, v){ var f = 1 - r, dx = 1, dy = -2 * r, x = 0, y = r; bset(B, x0, y0 + r, v); bset(B, x0, y0 - r, v); bset(B, x0 + r, y0, v); bset(B, x0 - r, y0, v);
  while (x < y) { if (f >= 0) { y--; dy += 2; f += dy; } x++; dx += 2; f += dx; bset(B, x0 + x, y0 + y, v); bset(B, x0 - x, y0 + y, v); bset(B, x0 + x, y0 - y, v); bset(B, x0 - x, y0 - y, v); bset(B, x0 + y, y0 + x, v); bset(B, x0 - y, y0 + x, v); bset(B, x0 + y, y0 - x, v); bset(B, x0 - y, y0 - x, v); } }
function bdisc(B, x0, y0, r, v){ for (var dy = -r; dy <= r; dy++) { var w = Math.round(Math.sqrt(r * r - dy * dy)); for (var x = -w; x <= w; x++) bset(B, x0 + x, y0 + dy, v); } }
function triPts(o){ return [[o.x + Math.floor((o.w - 1) / 2), o.y], [o.x, o.y + o.h - 1], [o.x + o.w - 1, o.y + o.h - 1]]; }
function btri(B, p, v, fill){ if (!fill) { bline(B, p[0][0], p[0][1], p[1][0], p[1][1], v); bline(B, p[1][0], p[1][1], p[2][0], p[2][1], v); bline(B, p[2][0], p[2][1], p[0][0], p[0][1], v); return; }
  var minx = Math.min(p[0][0], p[1][0], p[2][0]), maxx = Math.max(p[0][0], p[1][0], p[2][0]), miny = Math.min(p[0][1], p[1][1], p[2][1]), maxy = Math.max(p[0][1], p[1][1], p[2][1]);
  function sg(a, b, c){ return (a[0] - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (a[1] - c[1]); }
  for (var y = miny; y <= maxy; y++) for (var x = minx; x <= maxx; x++) { var q = [x, y], d1 = sg(q, p[0], p[1]), d2 = sg(q, p[1], p[2]), d3 = sg(q, p[2], p[0]); if (!((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))) bset(B, x, y, v); }
  btri(B, p, v, false); }

/* Symbole (5 × 8 Punkte, eine Zahl je Zeile) – dieselben wie für eigene LCD-Zeichen */
var ICONS = [
  ["Herz", "Cœur", [0, 10, 31, 31, 31, 14, 4, 0]], ["Glocke", "Cloche", [4, 14, 14, 14, 31, 0, 4, 0]], ["Smiley", "Smiley", [0, 10, 10, 0, 17, 14, 0, 0]],
  ["Pfeil →", "Flèche →", [0, 4, 2, 31, 2, 4, 0, 0]], ["Pfeil ←", "Flèche ←", [0, 4, 8, 31, 8, 4, 0, 0]], ["Pfeil ↑", "Flèche ↑", [4, 14, 21, 4, 4, 4, 4, 0]], ["Pfeil ↓", "Flèche ↓", [4, 4, 4, 4, 21, 14, 4, 0]],
  ["Haken", "Coche", [0, 1, 3, 22, 28, 8, 0, 0]], ["Kreuz", "Croix", [0, 27, 14, 4, 14, 27, 0, 0]], ["Batterie voll", "Pile pleine", [14, 27, 31, 31, 31, 31, 31, 0]], ["Batterie leer", "Pile vide", [14, 27, 17, 17, 17, 17, 31, 0]],
  ["Thermometer", "Thermomètre", [4, 10, 10, 10, 14, 31, 31, 14]], ["Note", "Note", [2, 3, 2, 2, 14, 30, 12, 0]], ["Schloss", "Cadenas", [14, 17, 17, 31, 27, 27, 31, 0]], ["Tropfen", "Goutte", [4, 4, 10, 10, 17, 17, 14, 0]],
  ["Uhr", "Horloge", [0, 14, 21, 23, 17, 14, 0, 0]], ["Grad °", "Degré °", [12, 18, 18, 12, 0, 0, 0, 0]], ["WLAN", "Wi-Fi", [0, 14, 17, 4, 10, 0, 4, 0]], ["Stern", "Étoile", [4, 4, 31, 14, 10, 17, 0, 0]],
  ["Blitz", "Éclair", [2, 4, 8, 31, 2, 4, 8, 0]], ["Mond", "Lune", [12, 14, 7, 7, 7, 14, 12, 0]], ["Sonne", "Soleil", [21, 14, 31, 14, 21, 0, 0, 0]], ["Haus", "Maison", [4, 14, 31, 31, 27, 27, 31, 0]], ["Auge", "Œil", [0, 14, 17, 21, 17, 14, 0, 0]]
];
function iconName(i){ return L(ICONS[i][0], ICONS[i][1]); }
function iconBitmap(o){ var s = o.s, B = newB(5 * s, 8 * s), rows = ICONS[o.n][2]; for (var y = 0; y < 8; y++) for (var x = 0; x < 5; x++) if ((rows[y] >> (4 - x)) & 1) for (var a = 0; a < s; a++) for (var b2 = 0; b2 < s; b2++) bset(B, x * s + a, y * s + b2, 1); return B; }
function LCOL(look){ return look === "green" ? { bg: "#aac43a", on: "#16210a", off: "rgba(70,95,10,.22)" } : { bg: "#1f4fd1", on: "#f2f8ff", off: "rgba(0,20,110,.38)" }; }
function icThumb(rows, px, on, off, bg){ var k = Math.max(2, Math.ceil(window.devicePixelRatio || 1) * 2), cell = px * k, gap = Math.max(1, Math.round(cell * 0.14)), c = document.createElement("canvas"); c.width = 5 * cell; c.height = 8 * cell; c.style.width = 5 * px + "px"; c.style.height = 8 * px + "px"; var x = c.getContext("2d"); x.fillStyle = bg || off; x.fillRect(0, 0, c.width, c.height); for (var y = 0; y < 8; y++) for (var q = 0; q < 5; q++) { var lit = (rows[y] >> (4 - q)) & 1; if (!lit && !bg) continue; x.fillStyle = lit ? on : off; x.fillRect(q * cell, y * cell, cell - gap, cell - gap); } return c; }

/* Objekte auf dem Display */
function oBox(o){
  if (o.k === "text") return [o.x, o.y, o.x + Math.max(1, o.t.length) * 6 * o.s - 1, o.y + 8 * o.s - 1];
  if (o.k === "icon") return [o.x, o.y, o.x + 5 * o.s - 1, o.y + 8 * o.s - 1];
  if (o.k === "circle") return [o.x, o.y, o.x + o.d - 1, o.y + o.d - 1];
  if (o.k === "line") return [Math.min(o.x, o.x2), Math.min(o.y, o.y2), Math.max(o.x, o.x2), Math.max(o.y, o.y2)];
  return [o.x, o.y, o.x + o.w - 1, o.y + o.h - 1];
}
function handlesOf(o){ var b = oBox(o); if (o.k === "line") return [{ id: "p1", x: o.x, y: o.y }, { id: "p2", x: o.x2, y: o.y2 }]; if (o.k === "text" || o.k === "icon") return [{ id: "br", x: b[2] + 1, y: b[3] + 1 }]; return [{ id: "tl", x: b[0], y: b[1] }, { id: "tr", x: b[2] + 1, y: b[1] }, { id: "bl", x: b[0], y: b[3] + 1 }, { id: "br", x: b[2] + 1, y: b[3] + 1 }]; }
function oResize(o, id, p){
  var b = oBox(o), x0 = b[0], y0 = b[1], x1 = b[2], y1 = b[3];
  if (o.k === "line") { if (id === "p1") { o.x = p[0]; o.y = p[1]; } else { o.x2 = p[0]; o.y2 = p[1]; } return; }
  if (o.k === "text") { o.s = Math.max(1, Math.min(8, Math.round((p[0] - o.x + 1) / (6 * Math.max(1, o.t.length))))); return; }
  if (o.k === "icon") { o.s = Math.max(1, Math.min(8, Math.round((p[0] - o.x + 1) / 5))); return; }
  var L1 = id.charAt(1) === "l", T1 = id.charAt(0) === "t";
  if (o.k === "circle") { var fx = L1 ? x1 : x0, fy = T1 ? y1 : y0, dd = Math.max(3, Math.max(Math.abs(p[0] - fx), Math.abs(p[1] - fy)) + 1); o.d = dd; o.x = L1 ? fx - dd + 1 : fx; o.y = T1 ? fy - dd + 1 : fy; return; }
  if (L1) x0 = Math.min(p[0], x1 - 1); else x1 = Math.max(p[0] - 1, x0 + 1);
  if (T1) y0 = Math.min(p[1], y1 - 1); else y1 = Math.max(p[1] - 1, y0 + 1);
  o.x = x0; o.y = y0; o.w = x1 - x0 + 1; o.h = y1 - y0 + 1;
}
function oMove(o, dx, dy){ o.x += dx; o.y += dy; if (o.k === "line") { o.x2 += dx; o.y2 += dy; } }
function oRaster(B, o, v){
  if (o.k === "text") btext(B, o.x, o.y, o.t, o.s, v);
  else if (o.k === "icon") { var ib = iconBitmap(o); for (var y = 0; y < ib.h; y++) for (var x = 0; x < ib.w; x++) if (ib.d[y * ib.w + x]) bset(B, o.x + x, o.y + y, v); }
  else if (o.k === "rect") { if (o.fill) for (var y2 = 0; y2 < o.h; y2++) bline(B, o.x, o.y + y2, o.x + o.w - 1, o.y + y2, v); else { bline(B, o.x, o.y, o.x + o.w - 1, o.y, v); bline(B, o.x + o.w - 1, o.y, o.x + o.w - 1, o.y + o.h - 1, v); bline(B, o.x + o.w - 1, o.y + o.h - 1, o.x, o.y + o.h - 1, v); bline(B, o.x, o.y + o.h - 1, o.x, o.y, v); } }
  else if (o.k === "circle") { var r = Math.floor(o.d / 2); (o.fill ? bdisc : bcircle)(B, o.x + r, o.y + r, r, v); }
  else if (o.k === "tri") btri(B, triPts(o), v, o.fill);
  else if (o.k === "line") bline(B, o.x, o.y, o.x2, o.y2, v);
}
function oName(o){ return o.k === "text" ? "„" + (o.t.length > 10 ? o.t.slice(0, 10) + "…" : o.t) + "“" : o.k === "icon" ? iconName(o.n) : { rect: L("Rechteck", "Rectangle"), circle: L("Kreis", "Cercle"), tri: L("Dreieck", "Triangle"), line: L("Linie", "Ligne") }[o.k]; }
function composite(d, S){ var C = bcopy(S.B), color = d.grp === "color"; if (color) { var bgv = hexc(S.bgc || "#000000"); for (var i = 0; i < C.d.length; i++) if (!C.d[i]) C.d[i] = bgv; } S.objs.forEach(function(o){ oRaster(C, o, color ? hexc(o.c) : 1); }); return C; }
function baseUsed(S){ for (var i = 0; i < S.B.d.length; i++) if (S.B.d[i]) return true; return false; }

var DISPS = [
  { id: "lcd1602", grp: "lcd", n: "LCD 16×2", cols: 16, rows: 2 },
  { id: "lcd2004", grp: "lcd", n: "LCD 20×4", cols: 20, rows: 4 },
  { id: "oled64", grp: "mono", n: "OLED 0,96″ 128×64", w: 128, h: 64, ctrl: "SSD1306", look: "oled" },
  { id: "oled32", grp: "mono", n: "OLED 0,91″ 128×32", w: 128, h: 32, ctrl: "SSD1306", look: "oled" },
  { id: "sh1106", grp: "mono", n: "OLED 1,3″ 128×64", w: 128, h: 64, ctrl: "SH1106", look: "oled" },
  { id: "nokia", grp: "mono", n: "Nokia 5110 84×48", w: 84, h: 48, ctrl: "PCD8544", look: "nokia" },
  { id: "oled48", grp: "mono", n: "OLED 0,66″ 64×48 (D1-mini-Shield)", w: 64, h: 48, ctrl: "SSD1306", look: "oled" },
  { id: "st7735", grp: "color", n: "TFT 1,8″ 128×160", w: 128, h: 160, ctrl: "ST7735" },
  { id: "st7789", grp: "color", n: "TFT 1,3″ 240×240", w: 240, h: 240, ctrl: "ST7789" },
  { id: "ili9341", grp: "color", n: "TFT 2,8″ 240×320", w: 240, h: 320, ctrl: "ILI9341" },
  { id: "st7789b", grp: "color", n: "TFT 1,14″ 135×240 (T-Display)", w: 135, h: 240, ctrl: "ST7789" },
  { id: "ssd1351", grp: "color", n: "OLED-Farbe 1,5″ 128×128", w: 128, h: 128, ctrl: "SSD1351" },
  { id: "gc9a01", grp: "color", n: "Rund-TFT 1,28″ 240×240", w: 240, h: 240, ctrl: "GC9A01", round: true },
  { id: "amoled466", grp: "color", n: "Rund-AMOLED 1,75″ 466×466", w: 466, h: 466, ctrl: "CO5300", round: true },
  { id: "max8", grp: "mono", n: "LED-Matrix 8×8", w: 8, h: 8, ctrl: "MAX7219", look: "led", mods: 1 },
  { id: "max32", grp: "mono", n: "LED-Matrix 32×8 (4 Module)", w: 32, h: 8, ctrl: "MAX7219", look: "led", mods: 4 },
  { id: "tm1637", grp: "seg", n: "7-Segment 4-stellig", ctrl: "TM1637" }
];
var GRPN = { lcd: L("Zeichen-LCD", "LCD à caractères"), mono: L("Pixel · Schwarz-Weiß", "Pixels · monochrome"), color: L("Pixel · Farbe (TFT)", "Pixels · couleur (TFT)"), seg: L("Segmentanzeige", "Afficheur 7 segments") };
var BOARDS = [["uno", "Arduino Uno"], ["nano", "Arduino Nano"], ["mega", "Arduino Mega"], ["esp32", "ESP32"], ["esp8266", "ESP8266 (D1 mini)"], ["pico", "Raspberry Pi Pico"], ["pi", "Raspberry Pi (Python)"]];
var BNAME = {}; BOARDS.forEach(function(x){ BNAME[x[0]] = x[1]; });
var FLASH = { uno: 30720, nano: 30720, mega: 253952, esp32: 1310720, esp8266: 1044464, pico: 1572864, pi: Infinity };
function fam(b){ return b === "uno" || b === "nano" ? "avr" : b; }
function BP(b){
  var f = fam(b);
  var T = {
    avr: { i2c: "SDA = A4, SCL = A5", begin: "", cs: 10, dc: 9, rst: 8, spi: "SCK = 13, MOSI = 11", nokia: "7, 6, 5, 4, 3", max: "12, 11, 10", tm: [2, 3], v5: true },
    mega: { i2c: "SDA = 20, SCL = 21", begin: "", cs: 10, dc: 9, rst: 8, spi: "SCK = 52, MOSI = 51", nokia: "7, 6, 5, 4, 3", max: "12, 11, 10", tm: [2, 3], v5: true },
    esp32: { i2c: "SDA = GPIO 21, SCL = GPIO 22", begin: "  Wire.begin(21, 22);   // SDA, SCL\n", cs: 5, dc: 2, rst: 4, spi: "SCK = GPIO 18, MOSI = GPIO 23", nokia: "18, 23, 19, 5, 4", max: "23, 18, 5", tm: [18, 19] },
    esp8266: { i2c: "SDA = D2 (GPIO 4), SCL = D1 (GPIO 5)", begin: "  Wire.begin(4, 5);   // SDA, SCL\n", cs: 15, dc: 2, rst: 0, spi: "SCK = D5 (GPIO 14), MOSI = D7 (GPIO 13)", nokia: "14, 13, 12, 15, 16", max: "13, 14, 15", tm: [14, 12] },
    pico: { i2c: "SDA = GP4, SCL = GP5", begin: "  Wire.setSDA(4);\n  Wire.setSCL(5);\n  Wire.begin();\n", cs: 17, dc: 20, rst: 21, spi: "SCK = GP18, MOSI = GP19", nokia: "18, 19, 20, 17, 21", max: "19, 18, 17", tm: [2, 3] },
    pi: { i2c: "SDA = GPIO 2 (Pin 3), SCL = GPIO 3 (Pin 5) – I²C mit sudo raspi-config aktivieren", begin: "", cs: 8, dc: 25, rst: 27, spi: "SCLK = GPIO 11, MOSI = GPIO 10, CE0 = GPIO 8 – SPI aktivieren", nokia: "SPI", max: "SPI", tm: [23, 24] }
  }[f];
  T.fam = f; return T;
}
var DD = { sel: "lcd1602", board: "uno", S: {}, loaded: false, draw: null };
function touchMode(){ if (DD.draw === null) DD.draw = !(window.matchMedia && matchMedia("(pointer:coarse)").matches); return DD.draw; }
function cloneS(S){ var o = {}; Object.keys(S).forEach(function(k){ var v = S[k]; if (k === "img") o[k] = v; else if (v && v.d instanceof Uint32Array) o[k] = { w: v.w, h: v.h, d: v.d.slice() }; else if (v && typeof v === "object") o[k] = JSON.parse(JSON.stringify(v)); else o[k] = v; }); return o; }
DD.undo = {};
function pushUndo(){ var id = DD.sel, S = DD.S[id]; if (!S) return; var a = DD.undo[id] = DD.undo[id] || []; a.push(cloneS(S)); if (a.length > 30) a.shift(); if (DD.undoBtn) DD.undoBtn.hidden = false; }
function dget(id){ for (var i = 0; i < DISPS.length; i++) if (DISPS[i].id === id) return DISPS[i]; return DISPS[0]; }
function cellsFromLines(lines, d){ var cells = [];
  for (var r = 0; r < d.rows; r++) { var line = lines[r] || "", row = [], i = 0; while (i < line.length && row.length < d.cols) { var m = line.slice(i).match(/^\{([0-7])\}/); if (m) { row.push(+m[1]); i += 3; } else { row.push(line.charAt(i)); i++; } } while (row.length < d.cols) row.push(" "); cells.push(row); }
  return cells; }
function cellMap(cells, cc){ return cells.map(function(row){ return row.map(function(c){ return typeof c === "number" ? { s: c, g: cc[c].slice() } : c; }); }); }
function lcdBank(S){ var keys = [], bank = [], idx = []; S.cells.forEach(function(row){ row.forEach(function(c){ if (c && typeof c === "object") { var k = c.g.join(","); if (keys.indexOf(k) < 0) { keys.push(k); bank.push(c.g); } } }); }); return { bank: bank, keys: keys }; }
function syncLines(S, d){ S.lines = S.cells.map(function(row){ return row.map(function(c){ return typeof c === "object" ? "§" : c; }).join("").replace(/ +$/, ""); }); }
function dinit(d){
  if (DD.S[d.id]) return DD.S[d.id];
  var S, i;
  if (d.grp === "lcd") { var cc = []; for (i = 0; i < 10; i++) cc.push([0, 0, 0, 0, 0, 0, 0, 0]); cc[0] = ICONS[0][2].slice(); cc[1] = ICONS[1][2].slice();
    S = { look: "blue", cc: cc, slot: 0, sel: { r: 0, c: 0 } }; S.cells = cellsFromLines(d.rows === 2 ? ["Hallo Oratio!", "{0} Oratio Lab {1}"] : ["Hallo Oratio!", "{0} Oratio Lab {1}", "Zeile 3", "Zeile 4"], d); S.cells = cellMap(S.cells, S.cc); syncLines(S, d); }
  else if (d.grp === "seg") S = { t: "12:34" };
  else { var objs = [];
    if (d.w >= 60) objs.push({ k: "text", t: "Hallo!", x: 2, y: 2, s: d.w >= 100 ? 2 : 1, c: "#ffffff" });
    else if (d.w === 32) objs.push({ k: "text", t: "Hi!", x: 1, y: 0, s: 1, c: "#ffffff" });
    else objs.push({ k: "icon", n: 0, x: 1, y: 0, s: 1, c: "#ffffff" });
    S = { B: newB(d.w, d.h), objs: objs, sel: -1, tool: "select", col: "#ff3b3b", inv: false, thr: 128, dith: true, stretch: false, oledc: "white", img: null }; }
  DD.S[d.id] = S; return S;
}
function dsave(){
  var o = { sel: DD.sel, board: DD.board, S: {} };
  DISPS.forEach(function(d){ var S = DD.S[d.id]; if (!S) return;
    if (d.grp === "mono") o.S[d.id] = { objs: S.objs, oledc: S.oledc, px: Array.prototype.join.call(S.B.d, "") };
    else if (d.grp === "color") o.S[d.id] = { objs: S.objs, col: S.col, bgc: S.bgc };
    else if (d.grp === "lcd") o.S[d.id] = { look: S.look, cc: S.cc, cells: S.cells };
    else o.S[d.id] = S; });
  st("disp", o);
}
function dload(){
  if (DD.loaded) return; DD.loaded = true; var o = sv("disp"); if (!o) return;
  DD.sel = o.sel || DD.sel; DD.board = BNAME[o.board] ? o.board : DD.board;
  DISPS.forEach(function(d){ var p = o.S && o.S[d.id]; if (!p) return; var S = dinit(d);
    if (d.grp === "mono") { if (p.objs) S.objs = p.objs; S.oledc = p.oledc || "white"; if (p.px && p.px.length === d.w * d.h) for (var i = 0; i < p.px.length; i++) S.B.d[i] = p.px.charAt(i) === "1" ? 1 : 0; }
    else if (d.grp === "color") { if (p.objs) S.objs = p.objs; S.col = p.col || S.col; S.bgc = p.bgc || "#000000"; }
    else if (d.grp === "lcd") { S.look = p.look || "blue"; if (p.cc) { S.cc = p.cc; while (S.cc.length < 10) S.cc.push([0, 0, 0, 0, 0, 0, 0, 0]); } if (p.cells) { S.cells = p.cells; syncLines(S, d); } else if (p.lines) { S.cells = cellMap(cellsFromLines(p.lines, d), S.cc); syncLines(S, d); } }
    else if (d.grp === "seg") S.t = p.t || S.t; });
}
function hexc(h){ return parseInt(h.slice(1), 16); }
function rgb565(n){ return ((((n >> 16) & 255) >> 3) << 11) | ((((n >> 8) & 255) >> 2) << 5) | ((n & 255) >> 3); }
function hx(n, w){ return "0x" + ("0000000" + n.toString(16)).slice(-w).toUpperCase(); }
function cstr(s){ return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"'); }
function carr(vals, per, w){ var out = []; for (var i = 0; i < vals.length; i += per) out.push("  " + vals.slice(i, i + per).map(function(v){ return "0x" + ("0000000" + v.toString(16)).slice(-w).toUpperCase(); }).join(", ")); return out.join(",\n"); }
function packMono(B, lsb){ var bw = Math.ceil(B.w / 8), out = []; for (var y = 0; y < B.h; y++) for (var bx = 0; bx < bw; bx++) { var by = 0; for (var k = 0; k < 8; k++) { var x = bx * 8 + k, bit = x < B.w && B.d[y * B.w + x] ? 1 : 0; by |= lsb ? bit << k : bit << (7 - k); } out.push(by); } return { bytes: out, bw: bw }; }
function inp(css){ var i = el("input"); i.style.cssText = "padding:9px;border:1px solid var(--line);border-radius:10px;background:var(--input);color:var(--fg);" + (css || ""); return i; }

/* Scroll-Schalter: auf dem Handy wird erst nach Tipp auf „Zeichnen“ gemalt, sonst scrollt die Seite */
function guard(cv, host){
  if (window.matchMedia && matchMedia("(pointer:coarse)").matches) host.appendChild(el("p", "lmut", "☝️ " + L("Tippe aufs Feld = Zeichnen an (Rahmen leuchtet). Tippe daneben = wieder scrollen. Auf dem Feld selbst wischt du nur im Zeichnen-Modus.", "Touche le champ = dessin actif (cadre allumé). Touche à côté = défilement. Sur le champ tu ne glisses que en mode dessin.")));
  return function(){ return true; };
}
var ARMED = [];
document.addEventListener("pointerdown", function(e){ if (e.pointerType === "mouse") return; var t = e.target; ARMED.slice().forEach(function(a){ if (a.cv.contains(t)) return; if (t.closest && t.closest("button,input,select,textarea,label,summary")) return; a.disarm(); }); }, true);
function press(cv, h, opt){
  var s = null, armed = false; opt = opt || {};
  cv.style.touchAction = "pan-y"; cv.style.webkitTouchCallout = "none"; cv.style.webkitUserSelect = "none"; cv.style.userSelect = "none";
  var reg = { cv: cv, disarm: function(){ armed = false; cv.style.touchAction = "pan-y"; cv.style.outline = "none"; var i = ARMED.indexOf(reg); if (i >= 0) ARMED.splice(i, 1); } };
  function arm(){ if (armed) return; armed = true; cv.style.touchAction = "none"; cv.style.outline = "3px solid #12c2e9"; try { navigator.vibrate && navigator.vibrate(15); } catch (x) {} if (ARMED.indexOf(reg) < 0) ARMED.push(reg); }
  cv.addEventListener("touchmove", function(e){ if (armed && e.cancelable) e.preventDefault(); }, { passive: false });
  cv.addEventListener("contextmenu", function(e){ if (armed) e.preventDefault(); });
  cv.addEventListener("pointerdown", function(e){
    if (e.pointerType === "mouse") { s = { go: true }; try { cv.setPointerCapture(e.pointerId); } catch (x) {} h.start(e); return; }
    if (armed) { s = { go: true }; try { cv.setPointerCapture(e.pointerId); } catch (x) {} h.start(e); return; }
    s = { go: false, x: e.clientX, y: e.clientY, t: Date.now() };
  });
  cv.addEventListener("pointermove", function(e){ if (!s) return; if (s.go) { h.move(e); return; } if (Math.abs(e.clientX - s.x) + Math.abs(e.clientY - s.y) > 10) s = null; });
  cv.addEventListener("pointerup", function(e){ if (!s) return; var a = s; s = null; if (a.go) { h.end(e); return; } if (Date.now() - a.t < 500) { if (opt.direct) { h.start(e); h.end(e); return; } arm(); if (h.armTap) h.armTap(e); } });
  cv.addEventListener("pointercancel", function(e){ if (!s) return; var a = s; s = null; if (a.go) h.end(e); });
}
function lcdCells(d, S){
  return S.cells.map(function(row){ return row.map(function(c){ return typeof c === "object" ? { g: c.g } : { ch: c, g: glyphRows(c) }; }); });
}
var LP = 5, LCW = 5 * (LP + 1) + 5, LCH = 8 * (LP + 1) + 6, LPAD = 22;
function paintLCD(cv, d, S){
  cv.width = d.cols * LCW + LPAD * 2; cv.height = d.rows * LCH + LPAD * 2;
  var c = cv.getContext("2d"), green = S.look === "green";
  c.fillStyle = "#1b1f27"; c.fillRect(0, 0, cv.width, cv.height);
  c.fillStyle = green ? "#aac43a" : "#1f4fd1"; c.fillRect(8, 8, cv.width - 16, cv.height - 16);
  var cells = lcdCells(d, S);
  for (var r = 0; r < d.rows; r++) for (var q = 0; q < d.cols; q++) {
    var ce = cells[r][q], ox = LPAD + q * LCW, oy = LPAD + r * LCH;
    for (var y = 0; y < 8; y++) for (var x = 0; x < 5; x++) { var on = (ce.g[y] >> (4 - x)) & 1; c.fillStyle = on ? (green ? "#16210a" : "#f2f8ff") : (green ? "rgba(70,95,10,.22)" : "rgba(0,20,110,.35)"); c.fillRect(ox + x * (LP + 1), oy + y * (LP + 1), LP, LP); }
  }
  if (S.sel && S.active) { c.strokeStyle = "#ffd400"; c.lineWidth = 3; c.strokeRect(LPAD + S.sel.c * LCW - 2, LPAD + S.sel.r * LCH - 2, LCW - 1, LCH - 3); }
}
function viewLCD(area, d, S, upd){
  var card = el("div", "lcard"); card.style.position = "relative"; area.appendChild(card);
  var cv = el("canvas", "mcv"); cv.style.background = "none"; cv.style.border = "0"; cv.style.imageRendering = "auto"; cv.style.maxWidth = d.cols === 16 ? "760px" : "880px"; cv.style.touchAction = "pan-y"; cv.style.cursor = "text"; card.appendChild(cv);
  var hid = el("input"); hid.type = "text"; hid.setAttribute("autocapitalize", "off"); hid.setAttribute("autocomplete", "off"); hid.setAttribute("autocorrect", "off"); hid.spellcheck = false; hid.style.cssText = "position:absolute;left:12px;top:12px;width:2px;height:2px;opacity:0;border:0;padding:0;font-size:16px"; card.appendChild(hid);
  card.appendChild(el("p", "lmut", "👆 " + L("Tippe kurz auf eine Stelle im Display (gelber Rahmen) und schreib los. Wischen scrollt nur die Seite. Mit den Symbolen darunter setzt du Zeichen ein. Umlaute hat der Standard-Zeichensatz nicht („?“).", "Touche brièvement un endroit de l’écran (cadre jaune) et écris. Glisser fait seulement défiler. Les symboles dessous insèrent des caractères. Pas d’accents dans le jeu standard (« ? »).")));
  function advance(){ var s = S.sel; s.c++; if (s.c >= d.cols) { s.c = 0; if (s.r < d.rows - 1) s.r++; else s.c = d.cols - 1; } }
  function put(v){ S.active = true; var stay = typeof v === "number"; S.cells[S.sel.r][S.sel.c] = stay ? { s: v, g: S.cc[v].slice() } : v; syncLines(S, d); if (!stay) advance(); upd(); }
  function syncMark(){ if (!S.active) return; var c = S.cells[S.sel.r][S.sel.c]; if (c && typeof c === "object" && c.s === S.slot) { c.g = S.cc[S.slot].slice(); syncLines(S, d); } }
  var tap0 = null;
  cv.onpointerdown = function(e){ tap0 = { x: e.clientX, y: e.clientY, t: Date.now() }; };
  cv.onpointercancel = function(){ tap0 = null; };
  cv.onpointerup = function(e){ if (!tap0) return; var m = Math.abs(e.clientX - tap0.x) + Math.abs(e.clientY - tap0.y), dt = Date.now() - tap0.t; tap0 = null; if (m > 10 || dt > 600) return;
    var r = cv.getBoundingClientRect(), sc = cv.width / r.width, x = ((e.clientX - r.left) * sc - LPAD) / LCW, y = ((e.clientY - r.top) * sc - LPAD) / LCH; var cc = Math.max(0, Math.min(d.cols - 1, Math.floor(x))), rr = Math.max(0, Math.min(d.rows - 1, Math.floor(y))); S.sel = { r: rr, c: cc }; S.active = true; S.pick = null; hid.focus(); upd(); };
  cv.onclick = function(){ if (S.active) hid.focus(); };
  hid.oninput = function(){ var v = hid.value; hid.value = ""; for (var i = 0; i < v.length; i++) { var ch = v.charAt(i), code = ch.charCodeAt(0); put(code < 32 || code > 126 ? "?" : ch); } };
  hid.onkeydown = function(e){ var s = S.sel, k = e.key;
    if (k === "Backspace") { if (S.cells[s.r][s.c] === " " || S.cells[s.r][s.c] === undefined) { if (s.c > 0) s.c--; else if (s.r > 0) { s.r--; s.c = d.cols - 1; } } S.cells[s.r][s.c] = " "; syncLines(S, d); upd(); e.preventDefault(); }
    else if (k === "Delete") { S.cells[s.r][s.c] = " "; syncLines(S, d); upd(); e.preventDefault(); }
    else if (k === "ArrowLeft") { s.c = Math.max(0, s.c - 1); upd(); e.preventDefault(); }
    else if (k === "ArrowRight") { s.c = Math.min(d.cols - 1, s.c + 1); upd(); e.preventDefault(); }
    else if (k === "ArrowUp") { s.r = Math.max(0, s.r - 1); upd(); e.preventDefault(); }
    else if (k === "ArrowDown") { s.r = Math.min(d.rows - 1, s.r + 1); upd(); e.preventDefault(); }
    else if (k === "Enter") { s.c = 0; s.r = Math.min(d.rows - 1, s.r + 1); upd(); e.preventDefault(); } };
  var look = el("div", "lrow"); look.style.margin = "10px 0";
  [["blue", L("Blau / weiß", "Bleu / blanc")], ["green", L("Grün / schwarz", "Vert / noir")]].forEach(function(o){ var x = el("button", "lbtn" + (S.look === o[0] ? " on" : ""), o[1]); x.onclick = function(){ S.look = o[0]; look.querySelectorAll("button").forEach(function(y){ y.classList.remove("on"); }); x.classList.add("on"); upd(); }; look.appendChild(x); });
  var kb = el("button", "lbtn pri", "⌨ " + L("Text tippen", "Écrire du texte")); kb.onclick = function(){ S.active = true; upd(); hid.focus(); }; look.insertBefore(kb, look.firstChild);
  var clr = el("button", "lbtn", "⌫ " + L("Zelle leeren", "Vider la cellule")); clr.onclick = function(){ pushUndo(); S.cells[S.sel.r][S.sel.c] = " "; syncLines(S, d); upd(); }; look.appendChild(clr);
  var cla = el("button", "lbtn bad", L("Alles leeren", "Tout effacer")); cla.onclick = function(){ pushUndo(); S.cells = cellsFromLines([], d); syncLines(S, d); S.sel = { r: 0, c: 0 }; upd(); }; look.appendChild(cla);
  card.appendChild(look);
  var h1 = el("h2", "", L("Eigene Zeichen", "Mes caractères")); h1.style.fontSize = "17px"; card.appendChild(h1);
  card.appendChild(el("p", "lmut", L("Tipp auf Zeichen 1–10 oder eine Vorlage lädt sie ins große Feld – deine gespeicherten Zeichen bleiben unverändert. Gespeichert wird nur, wenn du unten bei „Speichern in“ eine Nummer wählst. Ist ein Display-Feld markiert (gelb), landet alles dort.", "Un appui sur 1–10 ou un modèle le charge dans la grande zone – tes caractères enregistrés ne changent pas. Seul « Enregistrer dans » les modifie. Si une cellule est marquée (jaune), tout y arrive.")));
  var ins = el("div"); ins.style.cssText = "display:grid;grid-template-columns:repeat(10,1fr);gap:4px"; card.appendChild(ins);
  var thumbs = [];
  for (var k = 0; k < 10; k++) (function(k){ var b = el("button", "lbtn"); b.style.cssText = "padding:5px 0;min-height:0;min-width:0;display:flex;flex-direction:column;align-items:center;gap:1px"; b.onclick = function(){ S.slot = k; S.pick = { t: "slot", i: k }; if (S.active) put(k); else { S.work = S.cc[k].slice(); drawEd(); drawThumbs(); } }; b.appendChild(el("span")); b.appendChild(el("span", "lmut", "" + (k + 1))); ins.appendChild(b); thumbs.push(b); })(k);
  function drawThumbs(){ var Lc = LCOL(S.look); thumbs.forEach(function(b, k){ var c = icThumb(S.cc[k], 4, Lc.on, Lc.off, Lc.bg); c.style.borderRadius = "3px"; b.replaceChild(c, b.firstChild); b.classList.toggle("on", !!S.pick && S.pick.t === "slot" && S.pick.i === k); }); if (typeof tp !== "undefined") Array.prototype.forEach.call(tp.children, function(b, i){ b.classList.toggle("on", !!S.pick && S.pick.t === "tpl" && S.pick.i === i); }); }
  function curCell(){ return S.cells[S.sel.r][S.sel.c]; }
  function edRows(){ if (S.active) { var c = curCell(); return c && typeof c === "object" ? c.g : (c && c !== " " ? glyphRows(c) : [0, 0, 0, 0, 0, 0, 0, 0]); } return S.work; }
  function edSet(rows){ if (S.active) { S.cells[S.sel.r][S.sel.c] = { s: -1, g: rows.slice() }; syncLines(S, d); } else S.work = rows.slice(); }
  var dt = el("div"); dt.style.marginTop = "14px"; card.appendChild(dt);
  var sm = el("div"); sm.style.cssText = "font-weight:700;padding:2px 0"; dt.appendChild(sm);
  function sumTxt(){ sm.textContent = S.active ? "✏️ " + L("Markierte Stelle im Display bearbeiten", "Modifier la cellule marquée") : "✏️ " + L("Arbeitsfeld (noch nicht gespeichert)", "Zone de travail (pas enregistrée)"); }
  var eb = el("div", "lrow"); eb.style.cssText = "align-items:flex-start;gap:14px;margin-top:6px;flex-wrap:nowrap"; dt.appendChild(eb);
  var ed = el("canvas"); ed.width = 5 * 88; ed.height = 8 * 88; ed.style.cssText = "width:130px;flex:0 0 130px;display:block;border-radius:8px;border:3px solid #1b1f27;box-sizing:border-box;touch-action:pan-y;cursor:pointer";
  var side = el("div"); side.style.cssText = "display:flex;flex-direction:column;gap:8px;flex:1;min-width:0"; eb.appendChild(ed); eb.appendChild(side);
  if (!S.work) S.work = S.cc[0].slice();
  var cl = el("button", "lbtn", L("Leeren", "Vider")); cl.onclick = function(){ pushUndo(); if (S.active) { S.cells[S.sel.r][S.sel.c] = " "; syncLines(S, d); } else S.work = [0, 0, 0, 0, 0, 0, 0, 0]; drawEd(); drawThumbs(); upd(); };
  side.appendChild(cl);
  var svl = el("div", "lmut", ""); svl.style.fontWeight = "600"; side.appendChild(svl);
  var svr = el("div", "lrow"); svr.style.gap = "5px"; side.appendChild(svr);
  for (var q = 0; q < 10; q++) (function(q){ var b = el("button", "lbtn", "" + (q + 1)); b.style.cssText = "min-width:34px;min-height:34px;padding:4px 0"; b.onclick = function(){ pushUndo(); S.cc[q] = edRows().slice(); S.slot = q; S.pick = { t: "slot", i: q }; drawThumbs(); upd(); }; svr.appendChild(b); })(q);
  side.appendChild(el("p", "lmut", L("Tippe auf einen Punkt = an/aus. Wischen scrollt die Seite.", "Touche un point = on/off. Glisser fait défiler.")));
  function drawEd(){ sumTxt(); svl.textContent = "💾 " + L("Als eigenes Zeichen speichern in:", "Enregistrer comme caractère dans :"); var rows = edRows(), c = ed.getContext("2d"), Lc = LCOL(S.look), n = 88, g = 6; c.fillStyle = Lc.bg; c.fillRect(0, 0, ed.width, ed.height); for (var y = 0; y < 8; y++) for (var x = 0; x < 5; x++) { c.fillStyle = (rows[y] >> (4 - x)) & 1 ? Lc.on : Lc.off; c.fillRect(x * n, y * n, n - g, n - g); } }
  var paintTo = null;
  function edXY(e){ var r = ed.getBoundingClientRect(); return [Math.floor((e.clientX - r.left) / r.width * 5), Math.floor((e.clientY - r.top) / r.height * 8)]; }
  press(ed, {
    start: function(e){ var q = edXY(e), x = q[0], y = q[1]; if (x < 0 || x > 4 || y < 0 || y > 7) return; pushUndo(); var rows = edRows().slice(), cur = (rows[y] >> (4 - x)) & 1; paintTo = cur ? 0 : 1; rows[y] ^= 1 << (4 - x); edSet(rows); drawEd(); drawThumbs(); upd(); },
    move: function(e){ if (paintTo === null) return; var q = edXY(e), x = q[0], y = q[1]; if (x < 0 || x > 4 || y < 0 || y > 7) return; var rows = edRows().slice(), bit = 1 << (4 - x); if (paintTo) rows[y] |= bit; else rows[y] &= ~bit; edSet(rows); drawEd(); drawThumbs(); upd(true); },
    end: function(){ paintTo = null; }
  }, { direct: true });
  var h3 = el("div", "", L("Vorlagen – Tipp lädt sie in die Bearbeitung", "Modèles – touche pour charger dans l’édition")); h3.style.cssText = "font-weight:700;margin:16px 0 8px"; card.appendChild(h3);
  var tp = el("div"); tp.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(54px,1fr));gap:8px"; card.appendChild(tp);
  var tplLook = null;
  function drawTpl(){ if (tplLook === S.look) return; tplLook = S.look; var Lc = LCOL(S.look); tp.innerHTML = "";
    ICONS.forEach(function(ic, i){ var b = el("button", "lbtn"); b.style.cssText = "padding:6px 0;min-height:0;line-height:0;display:flex;justify-content:center"; b.title = iconName(i); var c = icThumb(ic[2], 5, Lc.on, Lc.off, Lc.bg); c.style.borderRadius = "4px"; c.style.border = "2px solid #1b1f27"; c.style.boxSizing = "content-box"; b.appendChild(c); b.onclick = function(){ pushUndo(); S.pick = { t: "tpl", i: i }; edSet(ic[2]); drawEd(); drawThumbs(); upd(); }; tp.appendChild(b); }); drawThumbs(); }
  drawEd(); drawThumbs(); drawTpl();
  var o0 = null;
  var outDown = function(e){ var t = e.target; o0 = (S.active && t && t.closest && !cv.contains(t) && !t.closest("button,input,select,textarea,label,canvas,summary,a")) ? { x: e.clientX, y: e.clientY, t: Date.now() } : null; };
  var outUp = function(e){ if (!o0 || !S.active) { o0 = null; return; } var m = Math.abs(e.clientX - o0.x) + Math.abs(e.clientY - o0.y), dt2 = Date.now() - o0.t; o0 = null; if (m < 10 && dt2 < 600) { S.active = false; hid.blur(); upd(); } };
  var outCancel = function(){ o0 = null; };
  document.addEventListener("pointerdown", outDown, true); document.addEventListener("pointerup", outUp, true); document.addEventListener("pointercancel", outCancel, true);
  return { paint: function(){ paintLCD(cv, d, S); drawEd(); drawThumbs(); drawTpl(); }, stop: function(){ document.removeEventListener("pointerdown", outDown, true); document.removeEventListener("pointerup", outUp, true); document.removeEventListener("pointercancel", outCancel, true); } };
}

/* ----- Pixel-Displays (schwarz-weiß + Farbe) ----- */
function gfxScale(d){ return Math.max(1, Math.min(60, Math.floor(900 / d.w), Math.floor(700 / d.h))); }
var OLEDC = { white: "#eaf2ff", blue: "#7cc8ff", yellow: "#ffd23a" };
function paintGfx(cv, d, S, B){
  var s = gfxScale(d), c = cv.getContext("2d"); cv.width = d.w * s; cv.height = d.h * s;
  var look = d.look, x, y, v;
  if (d.round) { c.save(); c.beginPath(); c.arc(cv.width / 2, cv.height / 2, cv.width / 2, 0, 7); c.clip(); }
  if (d.grp === "color") {
    var oc = document.createElement("canvas"); oc.width = d.w; oc.height = d.h; var ox = oc.getContext("2d"), im = ox.createImageData(d.w, d.h);
    for (var i = 0; i < B.d.length; i++) { v = B.d[i]; im.data[i * 4] = (v >> 16) & 255; im.data[i * 4 + 1] = (v >> 8) & 255; im.data[i * 4 + 2] = v & 255; im.data[i * 4 + 3] = 255; }
    ox.putImageData(im, 0, 0); c.imageSmoothingEnabled = false; c.drawImage(oc, 0, 0, cv.width, cv.height);
  } else {
    var bg = look === "nokia" ? "#b7c8a0" : look === "led" ? "#190c0c" : "#000", off = look === "nokia" ? "#aebf96" : look === "led" ? "#3b1616" : "#07090d", on = look === "nokia" ? "#222c1b" : look === "led" ? "#ff3030" : OLEDC[S.oledc || "white"];
    c.fillStyle = bg; c.fillRect(0, 0, cv.width, cv.height);
    for (y = 0; y < d.h; y++) for (x = 0; x < d.w; x++) { var lit = B.d[y * d.w + x] ? 1 : 0;
      if (look === "led") { c.fillStyle = lit ? on : off; c.beginPath(); c.arc(x * s + s / 2, y * s + s / 2, s * 0.38, 0, 7); c.fill(); }
      else if (s >= 4) { c.fillStyle = lit ? on : off; c.fillRect(x * s, y * s, s - 1, s - 1); }
      else if (lit) { c.fillStyle = on; c.fillRect(x * s, y * s, s, s); } }
  }
  if (d.round) c.restore();
  var o = S.objs[S.sel];
  if (o) { var hs = Math.max(8, 16 * cv.width / Math.max(1, cv.clientWidth || cv.width)); handlesOf(o).forEach(function(h){ c.fillStyle = "#12c2e9"; c.strokeStyle = "#fff"; c.lineWidth = 2; c.fillRect(h.x * s - hs / 2, h.y * s - hs / 2, hs, hs); c.strokeRect(h.x * s - hs / 2, h.y * s - hs / 2, hs, hs); }); }
  if (o) { var bx = oBox(o); c.strokeStyle = "#12c2e9"; c.lineWidth = 2; c.setLineDash([6, 4]); c.strokeRect(bx[0] * s - 2, bx[1] * s - 2, (bx[2] - bx[0] + 1) * s + 4, (bx[3] - bx[1] + 1) * s + 4); c.setLineDash([]); }
}
function importImg(d, S){
  if (!S.img) return; var o = document.createElement("canvas"); o.width = d.w; o.height = d.h; var c = o.getContext("2d");
  c.fillStyle = "#000"; c.fillRect(0, 0, d.w, d.h); c.imageSmoothingQuality = "high";
  var iw = S.img.naturalWidth || S.img.width, ih = S.img.naturalHeight || S.img.height;
  if (S.stretch) c.drawImage(S.img, 0, 0, d.w, d.h); else { var sc = Math.min(d.w / iw, d.h / ih), w = iw * sc, h = ih * sc; c.drawImage(S.img, (d.w - w) / 2, (d.h - h) / 2, w, h); }
  var px = c.getImageData(0, 0, d.w, d.h).data, B = S.B, i;
  if (d.grp === "color") { for (i = 0; i < d.w * d.h; i++) B.d[i] = (px[i * 4] << 16) | (px[i * 4 + 1] << 8) | px[i * 4 + 2]; return; }
  var g = new Float32Array(d.w * d.h); for (i = 0; i < g.length; i++) { var v = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]; g[i] = S.inv ? 255 - v : v; }
  if (S.dith) { for (var y = 0; y < d.h; y++) for (var x = 0; x < d.w; x++) { var k = y * d.w + x, old = g[k], nw = old < S.thr ? 0 : 255, er = old - nw; B.d[k] = nw ? 1 : 0;
      if (x + 1 < d.w) g[k + 1] += er * 7 / 16; if (y + 1 < d.h) { if (x > 0) g[k + d.w - 1] += er * 3 / 16; g[k + d.w] += er * 5 / 16; if (x + 1 < d.w) g[k + d.w + 1] += er * 1 / 16; } } }
  else for (i = 0; i < g.length; i++) B.d[i] = g[i] >= S.thr ? 1 : 0;
}
function viewGfx(area, d, S, upd){
  var color = d.grp === "color", card = el("div", "lcard"); area.appendChild(card);
  var ref = {}, cv, propEl = el("div");
  function sizeU(){ return Math.max(4, Math.round(Math.min(d.w, d.h) / 4)); }
  function addObj(o){ pushUndo(); S.objs.push(o); S.sel = S.objs.length - 1; S.tool = "select"; syncTools(); props(); upd(); }
  function baseO(){ return { c: color ? S.col : "#ffffff" }; }
  var u;
  // Werkzeuge
  var tb = el("div", "lrow"); tb.style.marginBottom = "8px"; card.appendChild(tb);
  var TOOLS = [["select", "👆", L("Auswählen / Bewegen", "Sélectionner / déplacer")], ["pen", "✏️", L("Stift (freihand)", "Crayon (main levée)")], ["erase", "🧽", L("Radierer (nur Freihand)", "Gomme (main levée)")], ["fill", "🪣", L("Füllen", "Remplir")]];
  function syncTools(){ tb.querySelectorAll(".tl").forEach(function(x){ x.classList.toggle("on", x.dataset.t === S.tool); }); }
  TOOLS.forEach(function(t){ var x = el("button", "lbtn tl", t[1] + " " + t[2]); x.dataset.t = t[0]; x.onclick = function(){ S.tool = t[0]; syncTools(); }; tb.appendChild(x); });
  var bw = el("span", "lmut", L("Strich:", "Trait :")); bw.style.cssText = "display:inline-flex;gap:4px;align-items:center"; tb.appendChild(bw);
  [1, 2, 3, 5].forEach(function(n){ var x = el("button", "lbtn br" + ((S.brush || 1) === n ? " on" : ""), "" + n); x.style.cssText = "min-width:36px;padding:8px 6px"; x.onclick = function(){ S.brush = n; tb.querySelectorAll(".br").forEach(function(y){ y.classList.remove("on"); }); x.classList.add("on"); }; bw.appendChild(x); });
  if (color) { var bgi = inp("width:46px;height:40px;padding:2px;background:none"); bgi.type = "color"; bgi.value = S.bgc || "#000000"; bgi.title = L("Hintergrundfarbe", "Couleur de fond"); bgi.oninput = function(){ S.bgc = bgi.value; upd(); }; var bgl = el("span", "lmut", L("Hintergrund", "Fond")); tb.appendChild(bgl); tb.appendChild(bgi); }
  if (color) { var ci = inp("width:46px;height:40px;padding:2px;background:none"); ci.type = "color"; ci.value = S.col; ci.title = L("Farbe", "Couleur"); ci.oninput = function(){ S.col = ci.value; var o = S.objs[S.sel]; if (o) { o.c = S.col; upd(); props(); } }; tb.appendChild(ci); }
  if (d.look === "oled") [["white", L("weiß", "blanc")], ["blue", L("blau", "bleu")], ["yellow", L("gelb", "jaune")]].forEach(function(o){ var x = el("button", "lbtn oc" + (S.oledc === o[0] ? " on" : ""), o[1]); x.onclick = function(){ S.oledc = o[0]; tb.querySelectorAll(".oc").forEach(function(y){ y.classList.remove("on"); }); x.classList.add("on"); upd(); }; tb.appendChild(x); });
  // Einfügen
  var hi = el("h2", "", L("Einfügen", "Insérer")); hi.style.cssText = "font-size:17px;margin:10px 0 6px"; card.appendChild(hi);
  var pr = el("div", "lrow"); pr.style.gap = "8px"; card.appendChild(pr);
  function pbtn(label, fn, title){ var b = el("button", "lbtn", label); b.title = title || ""; b.onclick = function(){ u = sizeU(); fn(); }; pr.appendChild(b); return b; }
  pbtn("🔤 " + L("Text", "Texte"), function(){ addObj(Object.assign(baseO(), { k: "text", t: "Text", x: 1, y: 1, s: d.w >= 100 ? 2 : 1 })); });
  pbtn("▭ " + L("Rechteck", "Rectangle"), function(){ addObj(Object.assign(baseO(), { k: "rect", x: Math.round(d.w / 2 - u), y: Math.round(d.h / 2 - u / 2), w: u * 2, h: u, fill: false })); });
  pbtn("◯ " + L("Kreis", "Cercle"), function(){ addObj(Object.assign(baseO(), { k: "circle", x: Math.round(d.w / 2 - u / 2), y: Math.round(d.h / 2 - u / 2), d: Math.max(3, u), fill: false })); });
  pbtn("△ " + L("Dreieck", "Triangle"), function(){ addObj(Object.assign(baseO(), { k: "tri", x: Math.round(d.w / 2 - u / 2), y: Math.round(d.h / 2 - u / 2), w: Math.max(3, u), h: Math.max(3, u), fill: false })); });
  pbtn("／ " + L("Linie", "Ligne"), function(){ addObj(Object.assign(baseO(), { k: "line", x: Math.round(d.w / 2 - u), y: Math.round(d.h / 2 - u / 2), x2: Math.round(d.w / 2 + u), y2: Math.round(d.h / 2 + u / 2) })); });
  var ip = el("div", "lrow"); ip.style.cssText = "gap:6px;margin-top:8px"; card.appendChild(ip);
  var isz = Math.max(1, Math.min(6, Math.floor(Math.min(d.w / 10, d.h / 16))));
  ICONS.forEach(function(ic, i){ var b = el("button", "lbtn"); b.style.cssText = "padding:5px;min-height:0;display:flex;flex-direction:column;align-items:center;gap:2px"; b.title = iconName(i); b.appendChild(icThumb(ic[2], 4, "#12c2e9", "rgba(120,140,170,.18)")); var t = el("span", "lmut", iconName(i)); t.style.fontSize = "10px"; b.appendChild(t); b.onclick = function(){ addObj(Object.assign(baseO(), { k: "icon", n: i, x: Math.max(0, Math.round(d.w / 2 - 2.5 * isz)), y: Math.max(0, Math.round(d.h / 2 - 4 * isz)), s: isz })); }; ip.appendChild(b); });
  // Fläche
  var ch = el("h2", "", L("Display", "Écran")); ch.style.cssText = "font-size:17px;margin:14px 0 4px"; card.appendChild(ch);
  var host = el("div"); card.appendChild(host);
  cv = el("canvas", "mcv"); cv.style.maxWidth = (d.w * gfxScale(d)) + "px"; cv.style.imageRendering = "pixelated"; if (d.round) { cv.style.background = "none"; cv.style.border = "0"; } host.appendChild(cv); ref.cv = cv;
  var okEvt = guard(cv, host, null);
  host.insertBefore(host.lastChild, cv);
  function pxAt(e){ var r = cv.getBoundingClientRect(); return [Math.floor((e.clientX - r.left) / r.width * d.w), Math.floor((e.clientY - r.top) / r.height * d.h)]; }
  function hit(p){ for (var i = S.objs.length - 1; i >= 0; i--) { var b = oBox(S.objs[i]), m = S.objs[i].k === "line" ? 2 : 0; if (p[0] >= b[0] - m && p[0] <= b[2] + m && p[1] >= b[1] - m && p[1] <= b[3] + m) return i; } return -1; }
  var drag = null;
  press(cv, {
    start: function(e){
      var p = pxAt(e);
      if (S.tool === "select" && S.objs[S.sel]) { var so = S.objs[S.sel], tol = Math.max(1, Math.ceil(18 / (cv.getBoundingClientRect().width / d.w))), hh = handlesOf(so).filter(function(h){ return Math.abs(p[0] - h.x) <= tol && Math.abs(p[1] - h.y) <= tol; })[0]; if (hh) { pushUndo(); drag = { obj: so, handle: hh.id }; return; } }
      if (S.tool === "select") { var i = hit(p); S.sel = i; if (i >= 0) { pushUndo(); drag = { obj: S.objs[i], last: p }; } props(); upd(); return; }
      pushUndo();
      var val = S.tool === "erase" ? 0 : (color ? hexc(S.col) : 1);
      if (S.tool === "fill") { bflood(S.B, p[0], p[1], val || (color ? hexc(S.col) : 1)); upd(); return; }
      drag = { pen: true, last: p, val: val }; bdot(S.B, p[0], p[1], val, S.brush || 1); upd();
    },
    move: function(e){
      if (!drag) return; var p = pxAt(e);
      if (drag.handle) { oResize(drag.obj, drag.handle, p); props(true); upd(true); return; }
      if (drag.obj) { var dx = p[0] - drag.last[0], dy = p[1] - drag.last[1]; if (dx || dy) { oMove(drag.obj, dx, dy); drag.last = p; props(true); upd(true); } }
      else if (drag.pen) { bline(S.B, drag.last[0], drag.last[1], p[0], p[1], drag.val, S.brush || 1); drag.last = p; upd(true); }
    },
    end: function(){ if (drag) upd(); drag = null; },
    armTap: function(e){ if (S.tool === "select") { var i = hit(pxAt(e)); S.sel = i; props(); upd(); } }
  });
  // Eigenschaften + Ebenen
  card.appendChild(propEl);
  function field(lbl, o, key, min, max){ var w = el("label", "lmut", lbl + " "), n = inp("width:68px"); n.type = "number"; n.inputMode = "numeric"; n.value = o[key]; n.oninput = function(){ var v = parseInt(n.value, 10); if (isNaN(v)) return; o[key] = Math.max(min, Math.min(max, v)); upd(true); }; n.dataset.k = key; w.appendChild(n); return w; }
  function props(onlyNums){
    var o = S.objs[S.sel];
    if (onlyNums && o) { propEl.querySelectorAll("input[data-k]").forEach(function(n){ n.value = o[n.dataset.k]; }); return; }
    propEl.innerHTML = "";
    var h = el("h2", "", L("Objekte auf dem Display", "Objets sur l’écran")); h.style.cssText = "font-size:17px;margin:14px 0 6px"; propEl.appendChild(h);
    var lay = el("div", "lrow"); lay.style.gap = "6px"; propEl.appendChild(lay);
    if (!S.objs.length) lay.appendChild(el("span", "lmut", L("Noch nichts eingefügt. Nimm oben ein Symbol, eine Form oder Text.", "Rien d’inséré. Prends un symbole, une forme ou du texte ci-dessus.")));
    S.objs.forEach(function(ob, i){ var c = el("span"); c.style.cssText = "display:inline-flex;border-radius:999px;overflow:hidden;border:1px solid var(--line)"; var a = el("button", "lbtn" + (i === S.sel ? " on" : ""), oName(ob)); a.style.cssText = "border:0;border-radius:0;min-height:34px;padding:6px 10px"; a.onclick = function(){ S.sel = i; props(); upd(); };
      var x = el("button", "lbtn bad", "✕"); x.style.cssText = "border:0;border-radius:0;min-height:34px;padding:6px 10px"; x.title = L("Dieses Objekt löschen", "Supprimer cet objet"); x.onclick = function(){ pushUndo(); S.objs.splice(i, 1); S.sel = -1; props(); upd(); }; c.appendChild(a); c.appendChild(x); lay.appendChild(c); });
    if (!o) return;
    var f = el("div", "lrow"); f.style.cssText = "margin-top:10px;gap:10px"; propEl.appendChild(f);
    if (o.k === "text") { var t = inp("flex:1;min-width:140px"); t.value = o.t; t.oninput = function(){ o.t = t.value; upd(true); }; f.appendChild(t); f.appendChild(field(L("Größe", "Taille"), o, "s", 1, 8)); }
    f.appendChild(field("x", o, "x", -d.w, d.w)); f.appendChild(field("y", o, "y", -d.h, d.h));
    if (o.k === "rect" || o.k === "tri") { f.appendChild(field(L("Breite", "Largeur"), o, "w", 2, d.w)); f.appendChild(field(L("Höhe", "Hauteur"), o, "h", 2, d.h)); }
    if (o.k === "circle") f.appendChild(field(L("Durchm.", "Diam."), o, "d", 3, Math.max(d.w, d.h)));
    if (o.k === "line") { f.appendChild(field("x2", o, "x2", -d.w, d.w)); f.appendChild(field("y2", o, "y2", -d.h, d.h)); }
    if (o.k === "icon") f.appendChild(field(L("Größe", "Taille"), o, "s", 1, 8));
    if (o.k === "rect" || o.k === "circle" || o.k === "tri") { var lb = el("label", "lmut"), ck = el("input"); ck.type = "checkbox"; ck.checked = !!o.fill; ck.onchange = function(){ o.fill = ck.checked; upd(); }; lb.appendChild(ck); lb.appendChild(document.createTextNode(" " + L("ausgefüllt", "rempli"))); f.appendChild(lb); }
    if (color) { var cc = inp("width:46px;height:38px;padding:2px;background:none"); cc.type = "color"; cc.value = o.c; cc.oninput = function(){ o.c = cc.value; upd(true); }; f.appendChild(cc); }
    var ab = el("div", "lrow"); ab.style.marginTop = "10px"; propEl.appendChild(ab);
    var du = el("button", "lbtn", "⧉ " + L("Duplizieren", "Dupliquer")); du.onclick = function(){ var n = JSON.parse(JSON.stringify(o)); oMove(n, 3, 3); S.objs.push(n); S.sel = S.objs.length - 1; props(); upd(); }; ab.appendChild(du);
    var cx = el("button", "lbtn", "↔ " + L("Mittig", "Centrer")); cx.onclick = function(){ pushUndo(); var b = oBox(o); oMove(o, Math.round((d.w - (b[2] - b[0] + 1)) / 2) - b[0], 0); props(); upd(); }; ab.appendChild(cx);
    var cy = el("button", "lbtn", "↕ " + L("Mittig", "Centrer")); cy.onclick = function(){ pushUndo(); var b = oBox(o); oMove(o, 0, Math.round((d.h - (b[3] - b[1] + 1)) / 2) - b[1]); props(); upd(); }; ab.appendChild(cy);
    var fr = el("button", "lbtn", "⬆ " + L("Nach vorn", "Au premier plan")); fr.onclick = function(){ S.objs.splice(S.sel, 1); S.objs.push(o); S.sel = S.objs.length - 1; props(); upd(); }; ab.appendChild(fr);
    var dl = el("button", "lbtn bad", "🗑 " + L("Löschen", "Supprimer")); dl.onclick = function(){ pushUndo(); S.objs.splice(S.sel, 1); S.sel = -1; props(); upd(); }; ab.appendChild(dl);
  }
  var kd = function(e){ if ((e.key === "Delete") && S.sel >= 0 && !/INPUT|TEXTAREA/.test((e.target || {}).tagName || "") && cur === "disp") { S.objs.splice(S.sel, 1); S.sel = -1; props(); upd(); } };
  document.addEventListener("keydown", kd); ref.kd = kd;
  props();
  // Freihand + Bild
  var fh = el("h2", "", L("Freihand-Ebene und Bild", "Calque main levée et image")); fh.style.cssText = "font-size:17px;margin:16px 0 6px"; card.appendChild(fh);
  var ib = el("div", "lrow"); card.appendChild(ib);
  var fi = el("input"); fi.type = "file"; fi.accept = "image/*"; fi.hidden = true;
  var up = el("button", "lbtn pri", "🖼️ " + L("Bild hochladen (z. B. Mario)", "Importer une image (ex. Mario)")); up.onclick = function(){ fi.click(); };
  var cl = el("button", "lbtn bad", L("Freihand-Ebene leeren", "Vider le calque")); cl.onclick = function(){ pushUndo(); S.B.d.fill(0); S.img = null; sl.hidden = true; upd(); };
  ib.appendChild(up); ib.appendChild(fi); ib.appendChild(cl);
  if (!color) { var iv = el("button", "lbtn", L("Freihand invertieren", "Inverser le calque")); iv.onclick = function(){ pushUndo(); for (var i = 0; i < S.B.d.length; i++) S.B.d[i] = S.B.d[i] ? 0 : 1; upd(); }; ib.appendChild(iv); }
  var sl = el("div", "lrow"); sl.style.marginTop = "8px"; sl.hidden = !S.img; card.appendChild(sl);
  fi.onchange = function(){ var f = fi.files && fi.files[0]; if (!f) return; var im = new Image(); im.onload = function(){ S.img = im; importImg(d, S); upd(); sl.hidden = false; }; im.src = URL.createObjectURL(f); fi.value = ""; };
  function re(){ importImg(d, S); upd(); }
  if (!color) {
    var lb2 = el("label", "lmut", L("Helligkeitsschwelle ", "Seuil de luminosité ")), rg = el("input"); rg.type = "range"; rg.min = 10; rg.max = 245; rg.value = S.thr; rg.oninput = function(){ S.thr = +rg.value; re(); }; lb2.appendChild(rg); sl.appendChild(lb2);
    var dc = el("label", "lmut"), dk = el("input"); dk.type = "checkbox"; dk.checked = S.dith; dk.onchange = function(){ S.dith = dk.checked; re(); }; dc.appendChild(dk); dc.appendChild(document.createTextNode(" " + L("Raster (Dithering) für Grautöne", "Tramage (dithering) pour les gris"))); sl.appendChild(dc);
    var ic2 = el("label", "lmut"), ik = el("input"); ik.type = "checkbox"; ik.checked = S.inv; ik.onchange = function(){ S.inv = ik.checked; re(); }; ic2.appendChild(ik); ic2.appendChild(document.createTextNode(" " + L("Hell/Dunkel tauschen", "Inverser clair/sombre"))); sl.appendChild(ic2);
  }
  var sc = el("label", "lmut"), sk = el("input"); sk.type = "checkbox"; sk.checked = S.stretch; sk.onchange = function(){ S.stretch = sk.checked; re(); }; sc.appendChild(sk); sc.appendChild(document.createTextNode(" " + L("Bild strecken (statt einpassen)", "Étirer l’image (au lieu d’ajuster)"))); sl.appendChild(sc);
  var pb = el("div", "lrow"); pb.style.marginTop = "12px"; card.appendChild(pb);
  var png = el("button", "lbtn", L("Als PNG speichern (1:1)", "Enregistrer en PNG (1:1)")); png.onclick = function(){ var B = composite(d, S), oc = document.createElement("canvas"); oc.width = d.w; oc.height = d.h; var x = oc.getContext("2d"), im = x.createImageData(d.w, d.h); for (var i = 0; i < B.d.length; i++) { var v = B.d[i], r, g, b; if (color) { r = (v >> 16) & 255; g = (v >> 8) & 255; b = v & 255; } else { r = g = b = v ? 255 : 0; } im.data[i * 4] = r; im.data[i * 4 + 1] = g; im.data[i * 4 + 2] = b; im.data[i * 4 + 3] = 255; } x.putImageData(im, 0, 0); oc.toBlob(function(bl){ if (bl) save("bild_" + d.w + "x" + d.h + ".png", bl); }); }; pb.appendChild(png);
  syncTools();
  return { paint: function(){ paintGfx(ref.cv, d, S, composite(d, S)); }, stop: function(){ document.removeEventListener("keydown", ref.kd); } };
}

/* ----- 7-Segment ----- */
var SEG = { "0": 0x3F, "1": 0x06, "2": 0x5B, "3": 0x4F, "4": 0x66, "5": 0x6D, "6": 0x7D, "7": 0x07, "8": 0x7F, "9": 0x6F, "-": 0x40, " ": 0, "_": 0x08, A: 0x77, B: 0x7C, C: 0x39, D: 0x5E, E: 0x79, F: 0x71, H: 0x76, L: 0x38, N: 0x54, O: 0x5C, P: 0x73, R: 0x50, S: 0x6D, T: 0x78, U: 0x3E };
function segData(t){ var out = [0, 0, 0, 0], k = 0, colon = false; for (var i = 0; i < t.length && k < 4; i++) { var ch = t.charAt(i).toUpperCase(); if (ch === ":" || ch === ".") { if (ch === ":") colon = true; else if (k > 0) out[k - 1] |= 0x80; continue; } out[k++] = SEG[ch] || 0; } if (colon) out[1] |= 0x80; return out; }
var SEGC = { red: ["#ff3a2a", L("Rot", "Rouge")], green: ["#34e06b", L("Grün", "Vert")], amber: ["#ffb21e", L("Gelb", "Jaune")], blue: ["#46a8ff", L("Blau", "Bleu")], white: ["#f3f6ff", L("Weiß", "Blanc")] };
function segPaths(ox, oy){
  var xl = 28, xr = 92, yt = 26, ym = 110, yb = 194, h = 9, g = 5, P = [];
  function H(y){ var a = xl + g, b = xr - g; return [[a, y], [a + h, y - h], [b - h, y - h], [b, y], [b - h, y + h], [a + h, y + h]]; }
  function V(x, y0, y1){ var a = y0 + g, b = y1 - g; return [[x, a], [x + h, a + h], [x + h, b - h], [x, b], [x - h, b - h], [x - h, a + h]]; }
  var polys = [H(yt), V(xr, yt, ym), V(xr, ym, yb), H(yb), V(xl, ym, yb), V(xl, yt, ym), H(ym)];
  polys.forEach(function(pl){ var p = new Path2D(); pl.forEach(function(q, i){ i ? p.lineTo(ox + q[0], oy + q[1]) : p.moveTo(ox + q[0], oy + q[1]); }); p.closePath(); P.push(p); });
  return P;
}
function segHit(dgi){ return { ox: 14 + dgi * 124, oy: 8 }; }
function paintSeg(cv, S){
  var data = S.man || segData(S.t); cv.width = 520; cv.height = 230; var c = cv.getContext("2d"), col = (SEGC[S.col] || SEGC.red)[0];
  var lcd = S.style === "lcd"; if (lcd) col = "#1b2414";
  c.fillStyle = lcd ? "#c4d0a8" : "#0d0f12"; c.fillRect(0, 0, 520, 230);
  var offA = lcd ? 0.09 : 0.14;
  function dot(x, y, on){ c.globalAlpha = on ? 1 : offA; c.fillStyle = col; c.beginPath(); c.arc(x, y, 8, 0, 7); c.fill(); c.globalAlpha = 1; }
  for (var dg = 0; dg < 4; dg++) { var o = segHit(dg), P = segPaths(o.ox, o.oy);
    P.forEach(function(p, s){ c.globalAlpha = (data[dg] >> s) & 1 ? 1 : offA; c.fillStyle = col; c.fill(p); c.globalAlpha = 1; });
    if (dg === 1) { dot(o.ox + 120, o.oy + 70, data[1] & 0x80); dot(o.ox + 120, o.oy + 150, data[1] & 0x80); }
    else dot(o.ox + 118, o.oy + 194, data[dg] & 0x80); }
}
function viewSeg(area, d, S, upd){
  var card = el("div", "lcard"); area.appendChild(card);
  if (!S.col) S.col = "red";
  var stw = el("div", "lrow"); stw.style.marginBottom = "8px"; card.appendChild(stw);
  [["led", L("LED-Anzeige (leuchtet)", "Afficheur LED")], ["lcd", L("Klassisch (LCD, grünlich)", "Classique (LCD verdâtre)")]].forEach(function(o){ var x = el("button", "lbtn st" + ((S.style || "led") === o[0] ? " on" : ""), o[1]); x.onclick = function(){ S.style = o[0]; stw.querySelectorAll(".st").forEach(function(y){ y.classList.remove("on"); }); x.classList.add("on"); cr.style.display = o[0] === "led" ? "" : "none"; upd(); }; stw.appendChild(x); });
  var cr = el("div", "lrow"); cr.style.marginBottom = "10px"; cr.style.display = S.style === "lcd" ? "none" : ""; card.appendChild(cr);
  Object.keys(SEGC).forEach(function(k){ var x = el("button", "lbtn sc" + (S.col === k ? " on" : ""), SEGC[k][1]); x.style.borderLeft = "10px solid " + SEGC[k][0]; x.onclick = function(){ S.col = k; cr.querySelectorAll(".sc").forEach(function(y){ y.classList.remove("on"); }); x.classList.add("on"); upd(); }; cr.appendChild(x); });
  var cv = el("canvas", "mcv"); cv.style.maxWidth = "520px"; cv.style.touchAction = "pan-y"; cv.style.cursor = "pointer"; card.appendChild(cv);
  var i = inp("display:block;margin:12px 0;width:220px;font:600 22px/1.2 inherit;font-family:inherit;letter-spacing:.12em;text-transform:uppercase"); i.type = "text"; i.value = S.t; i.maxLength = 8; i.oninput = function(){ S.t = i.value; S.man = null; mb.hidden = true; upd(); };
  card.appendChild(i);
  var mb = el("button", "lbtn", "↺ " + L("Zurück zur Texteingabe", "Retour à la saisie")); mb.hidden = !S.man; mb.onclick = function(){ S.man = null; mb.hidden = true; upd(); }; card.appendChild(mb);
  card.appendChild(el("p", "lmut", L("Tippe Zeichen, z. B. 12:34 (der Doppelpunkt schaltet die Mitte ein), -.5 oder HELP – oder tippe direkt auf einzelne Segmente im Bild, um sie an/aus zu schalten. Möglich: Ziffern, - _ und die Buchstaben A B C D E F H L N O P R S T U.", "Tape des caractères, ex. 12:34 (les deux-points allument le milieu), -.5 ou HELP – ou touche directement des segments pour les allumer/éteindre. Possible : chiffres, - _ et les lettres A B C D E F H L N O P R S T U.")));
  var t0 = null;
  cv.onpointerdown = function(e){ t0 = { x: e.clientX, y: e.clientY, t: Date.now() }; };
  cv.onpointercancel = function(){ t0 = null; };
  cv.onpointerup = function(e){ if (!t0) return; var m = Math.abs(e.clientX - t0.x) + Math.abs(e.clientY - t0.y), dt = Date.now() - t0.t; t0 = null; if (m > 10 || dt > 600) return;
    var r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * cv.width, y = (e.clientY - r.top) / r.height * cv.height, c = cv.getContext("2d");
    for (var dg = 0; dg < 4; dg++) { var o = segHit(dg), P = segPaths(o.ox, o.oy), bit = -1;
      for (var s = 0; s < 7; s++) if (c.isPointInPath(P[s], x, y)) { bit = s; break; }
      if (bit < 0) { var dx = dg === 1 ? o.ox + 120 : o.ox + 118; if ((dg === 1 && (Math.hypot(x - dx, y - (o.oy + 70)) < 16 || Math.hypot(x - dx, y - (o.oy + 150)) < 16)) || (dg !== 1 && Math.hypot(x - dx, y - (o.oy + 194)) < 16)) bit = 7; }
      if (bit >= 0) { S.man = (S.man || segData(S.t)).slice(); S.man[dg] ^= 1 << bit; mb.hidden = false; upd(); return; } } };
  return { paint: function(){ paintSeg(cv, S); } };
}

/* ----- Anschluss-Infos ----- */
function pinsFor(d, b){
  var P = BP(b), v5 = P.v5, o = { t: [], w: [] }, spiPins = P.fam === "pi" ? ", DC = GPIO 25, RST = GPIO 27" : "";
  if (d.grp === "lcd") { o.t.push("I²C-Backpack (PCF8574): " + P.i2c, "VCC = 5 V, GND = GND, Adresse meist 0x27 (oder 0x3F)"); if (!v5) o.w.push(L("Das LCD braucht 5 V, aber der I²C-Bus von " + BNAME[b] + " ist 3,3 V. Pegelwandler nutzen oder die Pull-ups des Backpacks prüfen, sonst kann der Pin Schaden nehmen.", "Le LCD veut 5 V mais l’I²C de " + BNAME[b] + " est en 3,3 V. Utilise un convertisseur de niveau, sinon risque pour la broche.")); }
  else if (d.ctrl === "SSD1306" || d.ctrl === "SH1106") { o.t.push("I²C: " + P.i2c, "VCC = 3,3 V (oder 5 V je nach Modul), Adresse meist 0x3C"); if (P.fam === "avr" && d.h >= 64) o.w.push(L("128×64 braucht im Uno/Nano 1 KB RAM von nur 2 KB – knapp, aber machbar.", "128×64 utilise 1 Ko des 2 Ko de RAM de l’Uno/Nano – juste, mais possible.")); }
  else if (d.ctrl === "PCD8544") { o.t.push(P.fam === "pi" ? "SPI: " + P.spi + spiPins : "CLK, DIN, DC, CE, RST = " + P.nokia, "VCC = 3,3 V (Display), Hintergrundlicht über 330 Ω"); if (v5) o.w.push(L("Das Nokia-Display verträgt nur 3,3 V an den Datenpins. Am 5-V-Board: Spannungsteiler (z. B. 10 kΩ + 20 kΩ) oder Pegelwandler.", "L’écran Nokia ne supporte que 3,3 V sur les données. Sur une carte 5 V : diviseur de tension ou convertisseur de niveau.")); }
  else if (d.ctrl === "CO5300") { o.t.push("QSPI: CS = GPIO 12, CLK = GPIO 38, D0–D3 = GPIO 4 / 5 / 6 / 7, RESET = GPIO 39", "I²C (Touch): SDA = GPIO 15, SCL = GPIO 14"); o.w.push(L("Das AMOLED gibt es als fertiges Waveshare-Board (ESP32-S3-Touch-AMOLED-1.75). Pins und Treiber (CO5300) stammen aus der Waveshare-/ESPHome-Doku, ich konnte den Code nicht an echter Hardware testen. Falls das Bild verschoben ist, die vier Offset-Zahlen im Code (6, 0, 0, 0) laut Waveshare-Beispiel anpassen.", "Carte Waveshare ESP32-S3-Touch-AMOLED-1.75. Broches et pilote (CO5300) selon la doc Waveshare/ESPHome ; code non testé sur le matériel. Si l’image est décalée, adapte les 4 offsets (6, 0, 0, 0).")); if (b !== "esp32") o.w.push(L("Dieses Display läuft nur auf dem ESP32-S3 (Waveshare-Board) – wähle oben „ESP32“.", "Cet écran ne fonctionne qu’avec l’ESP32-S3 (carte Waveshare) – choisis « ESP32 ».")); }
  else if (d.grp === "color") { o.t.push("CS = " + P.cs + ", DC = " + P.dc + ", RST = " + P.rst + ", " + P.spi, "VCC = 3,3 V, LED/BL = 3,3 V"); if (v5) o.w.push(L("TFTs sind 3,3-V-Geräte. Am 5-V-Board brauchst du Pegelwandler oder Vorwiderstände an den Datenleitungen.", "Les TFT sont en 3,3 V. Sur une carte 5 V il faut un convertisseur ou des résistances sur les lignes de données.")); }
  else if (d.ctrl === "MAX7219") o.t.push(P.fam === "pi" ? "SPI: " + P.spi : "DIN, CLK, CS = " + P.max, "VCC = 5 V, GND = GND");
  else if (d.ctrl === "TM1637") o.t.push("CLK = " + P.tm[0] + ", DIO = " + P.tm[1], "VCC = 5 V (3,3 V geht oft auch)");
  return o;
}
var LIBN = { lcd: ["LiquidCrystal I2C (Frank de Brabander)"], ssd1306: ["Adafruit SSD1306", "Adafruit GFX Library"], sh1106: ["U8g2 (olikraus)"], pcd8544: ["Adafruit PCD8544 Nokia 5110 LCD library", "Adafruit GFX Library"], st7735: ["Adafruit ST7735 and ST7789 Library", "Adafruit GFX Library"], st7789: ["Adafruit ST7735 and ST7789 Library", "Adafruit GFX Library"], ili9341: ["Adafruit ILI9341", "Adafruit GFX Library"], ssd1351: ["Adafruit SSD1351 library", "Adafruit GFX Library"], gc9a01: ["Adafruit GC9A01A", "Adafruit GFX Library"], co5300: ["GFX Library for Arduino (moononournation)"], max7219: ["LedControl (Eberhard Fahle)"], tm1637: ["TM1637 (Avishay Orpaz)"] };
var LIBS = { lcd: "LiquidCrystal_I2C", ssd1306: "Adafruit SSD1306 + Adafruit GFX", sh1106: "U8g2", pcd8544: "Adafruit PCD8544 + Adafruit GFX", st7735: "Adafruit ST7735 + Adafruit GFX", st7789: "Adafruit ST7789 + Adafruit GFX", ili9341: "Adafruit ILI9341 + Adafruit GFX", max7219: "LedControl", tm1637: "TM1637 (avishorp)", ssd1351: "Adafruit SSD1351 + Adafruit GFX", gc9a01: "Adafruit GC9A01A + Adafruit GFX", co5300: "GFX Library for Arduino" };
var PYLIBS = { lcd: "RPLCD smbus2", ssd1306: "luma.oled", sh1106: "luma.oled", pcd8544: "luma.lcd", st7735: "luma.lcd", st7789: "luma.lcd", ili9341: "luma.lcd", max7219: "luma.led_matrix", tm1637: "raspberrypi-tm1637", ssd1351: "luma.oled", ili9488: "luma.lcd" };
function libOf(d){ return d.grp === "lcd" ? "lcd" : d.grp === "seg" ? "tm1637" : d.ctrl.toLowerCase(); }
function sizeBytes(d, S){ if (d.grp === "color") return d.w * d.h * 2; if (d.grp === "mono") return Math.ceil(d.w / 8) * d.h; return 0; }
function coreNote(b){ return b === "esp32" ? "// Board in der Arduino IDE: ESP32 (Boardverwalter „esp32“ von Espressif)\n" : b === "esp8266" ? "// Board in der Arduino IDE: NodeMCU / LOLIN D1 mini (Boardverwalter „esp8266“)\n" : b === "pico" ? "// Board in der Arduino IDE: Raspberry Pi Pico (Boardverwalter „Raspberry Pi Pico/RP2040“ von Earle Philhower)\n" : b === "mega" ? "// Board in der Arduino IDE: Arduino Mega 2560\n" : b === "nano" ? "// Board in der Arduino IDE: Arduino Nano\n" : ""; }

/* ----- Code-Erzeugung ----- */
function genCode(d, S, b){
  var py = b === "pi", P = BP(b), t = "", ext = py ? "py" : "ino";
  var head = (py ? "#!/usr/bin/env python3\n# " : "// ") + "Oratio Lab – " + d.n + " · " + BNAME[b] + "\n" + (py ? "" : coreNote(b));
  var cm = py ? "# " : "// ";
  if (d.grp === "lcd") {
    var used = {}, lines = [], bk = lcdBank(S);
    for (var r = 0; r < d.rows; r++) { var segs = [], cur = ""; S.cells[r].join("|"); var rowCells = S.cells[r].slice(), last = rowCells.length; while (last > 0 && rowCells[last - 1] === " ") last--; rowCells = rowCells.slice(0, last);
      rowCells.forEach(function(c){ if (typeof c === "object") { if (cur) segs.push({ s: cur }); cur = ""; var ix = Math.min(7, bk.keys.indexOf(c.g.join(","))); segs.push({ c: ix }); used[ix] = bk.bank[ix]; } else cur += c; }); if (cur) segs.push({ s: cur }); lines.push(segs); }
    if (!py) {
      t = head + "// Bibliothek: LiquidCrystal_I2C (Bibliotheksverwalter)\n#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n\nLiquidCrystal_I2C lcd(0x27, " + d.cols + ", " + d.rows + ");   // Adresse 0x27 oder 0x3F\n\n";
      Object.keys(used).forEach(function(k){ t += "byte zeichen" + k + "[8] = { " + used[k].map(function(v){ return "0b" + ("00000" + v.toString(2)).slice(-5); }).join(", ") + " };\n"; });
      t += "\nvoid setup() {\n" + P.begin + "  lcd.init();\n  lcd.backlight();\n";
      Object.keys(used).forEach(function(k){ t += "  lcd.createChar(" + k + ", zeichen" + k + ");\n"; });
      lines.forEach(function(sg, r2){ if (!sg.length) return; t += "  lcd.setCursor(0, " + r2 + ");\n"; sg.forEach(function(x){ t += x.s !== undefined ? '  lcd.print("' + cstr(x.s) + '");\n' : "  lcd.write(byte(" + x.c + "));\n"; }); });
      t += "}\n\nvoid loop() {\n}\n";
    } else {
      t = head + "# Installieren: pip install RPLCD smbus2   (I²C aktivieren nicht vergessen)\nfrom RPLCD.i2c import CharLCD\n\nlcd = CharLCD('PCF8574', 0x27, cols=" + d.cols + ", rows=" + d.rows + ")   # Adresse 0x27 oder 0x3F\n\n";
      Object.keys(used).forEach(function(k){ t += "lcd.create_char(" + k + ", (" + used[k].map(function(v){ return "0b" + ("00000" + v.toString(2)).slice(-5); }).join(", ") + "))\n"; });
      lines.forEach(function(sg, r2){ if (!sg.length) return; t += "lcd.cursor_pos = (" + r2 + ", 0)\nlcd.write_string(\"" + sg.map(function(x){ return x.s !== undefined ? cstr(x.s) : "\\x0" + x.c; }).join("") + "\")\n"; });
    }
    return { txt: t, ext: ext };
  }
  if (d.grp === "seg") {
    var dt = (S.man || segData(S.t)), arr = dt.map(function(v){ return hx(v, 2); }).join(", ");
    if (!py) t = head + "// Bibliothek: TM1637 von Avishay Orpaz (Bibliotheksverwalter)\n#include <TM1637Display.h>\n\n#define CLK " + P.tm[0] + "\n#define DIO " + P.tm[1] + "\nTM1637Display display(CLK, DIO);\n\n// Segmente: Bit0 = a (oben) ... Bit6 = g (Mitte), Bit7 = Punkt/Doppelpunkt\nconst uint8_t daten[] = { " + arr + " };\n\nvoid setup() {\n  display.setBrightness(7);   // 0 bis 7\n  display.setSegments(daten);\n}\n\nvoid loop() {\n}\n";
    else t = head + "# Installieren: pip install raspberrypi-tm1637\nimport tm1637\n\ntm = tm1637.TM1637(clk=" + P.tm[0] + ", dio=" + P.tm[1] + ")\ntm.brightness(7)   # 0 bis 7\n# Segmente: Bit0 = a (oben) ... Bit6 = g (Mitte), Bit7 = Punkt/Doppelpunkt\ndaten = [" + arr + "]\ntm.write(daten)\n";
    return { txt: t, ext: ext };
  }
  var W = d.w, H = d.h, ctrl = d.ctrl, col = d.grp === "color", objs = S.objs, bu = baseUsed(S), comp = composite(d, S);
  function pyc(o){ if (!col) return "\"white\""; var n = hexc(o.c); return "(" + ((n >> 16) & 255) + ", " + ((n >> 8) & 255) + ", " + (n & 255) + ")"; }
  if (py) {
    var dev = { SSD1306: "from luma.core.interface.serial import i2c\nfrom luma.oled.device import ssd1306\nserial = i2c(port=1, address=0x3C)\ndevice = ssd1306(serial, width=" + W + ", height=" + H + ")", SH1106: "from luma.core.interface.serial import i2c\nfrom luma.oled.device import sh1106\nserial = i2c(port=1, address=0x3C)\ndevice = sh1106(serial)", PCD8544: "from luma.core.interface.serial import spi\nfrom luma.lcd.device import pcd8544\nserial = spi(port=0, device=0, gpio_DC=25, gpio_RST=27)\ndevice = pcd8544(serial)", ST7735: "from luma.core.interface.serial import spi\nfrom luma.lcd.device import st7735\nserial = spi(port=0, device=0, gpio_DC=25, gpio_RST=27)\ndevice = st7735(serial, width=128, height=160)", ST7789: "from luma.core.interface.serial import spi\nfrom luma.lcd.device import st7789\nserial = spi(port=0, device=0, gpio_DC=25, gpio_RST=27)\ndevice = st7789(serial, width=" + W + ", height=" + H + (W === 135 ? ", h_offset=52, v_offset=40" : "") + ")   # 135×240: Offsets je nach Modul ändern", SSD1351: "from luma.core.interface.serial import spi\nfrom luma.oled.device import ssd1351\nserial = spi(port=0, device=0, gpio_DC=25, gpio_RST=27)\ndevice = ssd1351(serial)", ILI9341: "from luma.core.interface.serial import spi\nfrom luma.lcd.device import ili9341\nserial = spi(port=0, device=0, gpio_DC=25, gpio_RST=27)\ndevice = ili9341(serial, width=240, height=320)", MAX7219: "from luma.core.interface.serial import spi, noop\nfrom luma.led_matrix.device import max7219\nserial = spi(port=0, device=0, gpio=noop())\ndevice = max7219(serial, cascaded=" + (d.mods || 1) + ", block_orientation=0)   # bei gedrehter Anzeige: 90 / -90" }[ctrl];
    if (!dev) return { txt: head + "# Für dieses Display gibt es keine passende Python-Bibliothek für den Raspberry Pi.\n# Nimm ein Arduino-Board (z. B. ESP32) – wähle oben ein anderes Board.\n", ext: ext };
    t = head + "# Installieren: pip install " + PYLIBS[libOf(d)] + "\nimport time\nfrom PIL import Image, ImageDraw, ImageFont\n" + dev + "\n\n";
    function rowsOf(B){ var rs = []; for (var y = 0; y < B.h; y++) { var s2 = ""; for (var x = 0; x < B.w; x++) s2 += B.d[y * B.w + x] ? "#" : "."; rs.push('    "' + s2 + '"'); } return rs.join(",\n"); }
    if (ctrl === "MAX7219") {
      t += "# '#' = Pixel an, '.' = Pixel aus\nBILD = [\n" + rowsOf(comp) + "\n]\n\nimg = Image.new(\"1\", (" + W + ", " + H + "))\nfor y, zeile in enumerate(BILD):\n    for x, c in enumerate(zeile):\n        if c == \"#\":\n            img.putpixel((x, y), 1)\n";
    } else {
      if (col) t += (bu ? cm + "Speichere dein Bild mit \"Als PNG speichern (1:1)\" unter bild.png neben dieses Skript.\nimg = Image.open(\"bild.png\").convert(\"RGB\")\n" : "img = Image.new(\"RGB\", (" + W + ", " + H + "), (" + ((hexc(S.bgc || "#000000") >> 16) & 255) + ", " + ((hexc(S.bgc || "#000000") >> 8) & 255) + ", " + (hexc(S.bgc || "#000000") & 255) + "))\n");
      else if (bu) t += "# '#' = Pixel an, '.' = Pixel aus (Freihand-Ebene / Bild)\nBILD = [\n" + rowsOf(S.B) + "\n]\n\nimg = Image.new(\"1\", (" + W + ", " + H + "))\nfor y, zeile in enumerate(BILD):\n    for x, c in enumerate(zeile):\n        if c == \"#\":\n            img.putpixel((x, y), 1)\n";
      else t += "img = Image.new(\"1\", (" + W + ", " + H + "))\n";
      t += "draw = ImageDraw.Draw(img)\n";
      if (objs.some(function(o){ return o.k === "icon"; })) t += "\ndef symbol(x0, y0, zeilen, s, farbe):   # zeichnet ein Punktmuster, jeder Punkt s × s Pixel\n    for y, z in enumerate(zeilen):\n        for x, c in enumerate(z):\n            if c == \"#\":\n                draw.rectangle((x0 + x * s, y0 + y * s, x0 + x * s + s - 1, y0 + y * s + s - 1), fill=farbe)\n";
      t += "\n";
      objs.forEach(function(o){ var c = pyc(o), f = o.fill ? c : "None";
        if (o.k === "text") t += "draw.text((" + o.x + ", " + o.y + "), \"" + cstr(o.t) + "\", fill=" + c + ", font=" + (o.s > 1 ? "ImageFont.load_default(size=" + (8 * o.s) + ")" : "ImageFont.load_default()") + ")\n";
        else if (o.k === "rect") t += "draw.rectangle((" + o.x + ", " + o.y + ", " + (o.x + o.w - 1) + ", " + (o.y + o.h - 1) + "), outline=" + c + ", fill=" + f + ")\n";
        else if (o.k === "circle") t += "draw.ellipse((" + o.x + ", " + o.y + ", " + (o.x + o.d - 1) + ", " + (o.y + o.d - 1) + "), outline=" + c + ", fill=" + f + ")\n";
        else if (o.k === "tri") { var p = triPts(o); t += "draw.polygon([(" + p[0][0] + ", " + p[0][1] + "), (" + p[1][0] + ", " + p[1][1] + "), (" + p[2][0] + ", " + p[2][1] + ")], outline=" + c + ", fill=" + f + ")\n"; }
        else if (o.k === "line") t += "draw.line((" + o.x + ", " + o.y + ", " + o.x2 + ", " + o.y2 + "), fill=" + c + ")\n";
        else if (o.k === "icon") t += "symbol(" + o.x + ", " + o.y + ", [" + ICONS[o.n][2].map(function(v){ return "\"" + ("00000" + v.toString(2)).slice(-5).replace(/1/g, "#").replace(/0/g, ".") + "\""; }).join(", ") + "], " + o.s + ", " + c + ")   # " + ICONS[o.n][0] + "\n"; });
    }
    t += "\ndevice.display(img)\n\ntry:\n    while True:\n        time.sleep(1)\nexcept KeyboardInterrupt:\n    pass\n";
    return { txt: t, ext: ext };
  }
  var pins = P.cs;
  if (ctrl === "MAX7219") {
    var pk = packMono(comp, false), n = d.mods;
    t = head + "// Bibliothek: LedControl (Bibliotheksverwalter)\n#include <LedControl.h>\n\nLedControl lc = LedControl(" + P.max + ", " + n + ");   // DIN, CLK, CS, Anzahl Module\n\n// Pro Zeile ein Byte (Bit7 = linke Spalte). " + (n > 1 ? "Je Zeile " + n + " Bytes: Modul 0 = das am Eingang (DIN).\n" : "\n") + "const byte bild[" + H + "][" + n + "] = {\n" + (function(){ var o = []; for (var y2 = 0; y2 < H; y2++) o.push("  { " + pk.bytes.slice(y2 * pk.bw, y2 * pk.bw + pk.bw).map(function(v){ return hx(v, 2); }).join(", ") + " }"); return o.join(",\n"); })() + "\n};\n\nvoid setup() {\n  for (int m = 0; m < " + n + "; m++) {\n    lc.shutdown(m, false);\n    lc.setIntensity(m, 8);   // 0 bis 15\n    lc.clearDisplay(m);\n  }\n  for (int y = 0; y < 8; y++)\n    for (int m = 0; m < " + n + "; m++)\n      lc.setRow(m, y, bild[y][m]);   // wenn gespiegelt: Module oder Bits tauschen\n}\n\nvoid loop() {\n}\n";
    return { txt: t, ext: ext };
  }
  var tftpins = "#define TFT_CS  " + P.cs + "\n#define TFT_DC  " + P.dc + "\n#define TFT_RST " + P.rst + "\n";
  var inc = { SSD1351: "#include <SPI.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1351.h>\n\n" + tftpins + "Adafruit_SSD1351 tft = Adafruit_SSD1351(128, 128, &SPI, TFT_CS, TFT_DC, TFT_RST);\n", GC9A01: "#include <SPI.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_GC9A01A.h>\n\n" + tftpins + "Adafruit_GC9A01A tft(TFT_CS, TFT_DC, TFT_RST);\n", CO5300: "#include <Arduino_GFX_Library.h>\n\n// QSPI-Anschluss laut Waveshare ESP32-S3-Touch-AMOLED-1.75\nArduino_DataBus *bus = new Arduino_ESP32QSPI(12 /* CS */, 38 /* SCK */, 4 /* D0 */, 5 /* D1 */, 6 /* D2 */, 7 /* D3 */);\n// Treiber CO5300, 466 x 466 Pixel; die vier letzten Zahlen sind Bild-Offsets (laut Waveshare-Beispiel)\nArduino_GFX *gfx = new Arduino_CO5300(bus, 39 /* RESET */, 0 /* Drehung */, 466, 466, 6, 0, 0, 0);\n", SSD1306: "#include <SPI.h>\n#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>\n\nAdafruit_SSD1306 display(" + W + ", " + H + ", &Wire, -1);\n", SH1106: "#include <U8g2lib.h>\n\nU8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);\n", PCD8544: "#include <SPI.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_PCD8544.h>\n\n// CLK, DIN, DC, CE, RST\nAdafruit_PCD8544 display = Adafruit_PCD8544(" + P.nokia + ");\n", ST7735: "#include <SPI.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_ST7735.h>\n\n" + tftpins + "Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);\n", ST7789: "#include <SPI.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_ST7789.h>\n\n" + tftpins + "Adafruit_ST7789 tft = Adafruit_ST7789(TFT_CS, TFT_DC, TFT_RST);\n", ILI9341: "#include <SPI.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_ILI9341.h>\n\n" + tftpins + "Adafruit_ILI9341 tft = Adafruit_ILI9341(TFT_CS, TFT_DC, TFT_RST);\n" }[ctrl];
  var libn = { SSD1351: "Adafruit SSD1351 library und Adafruit GFX Library", GC9A01: "Adafruit GC9A01A und Adafruit GFX Library", CO5300: "GFX Library for Arduino", SSD1306: "Adafruit SSD1306 und Adafruit GFX", SH1106: "U8g2", PCD8544: "Adafruit PCD8544 und Adafruit GFX", ST7735: "Adafruit ST7735 und Adafruit GFX", ST7789: "Adafruit ST7789 und Adafruit GFX", ILI9341: "Adafruit ILI9341 und Adafruit GFX" }[ctrl];
  libn = (LIBN[ctrl.toLowerCase()] || []).join(" + ") || libn;
  var u8 = ctrl === "SH1106", g = u8 ? "u8g2" : ctrl === "CO5300" ? "gfx" : col ? "tft" : "display", dot = ctrl === "CO5300" ? "->" : ".", white = ctrl === "PCD8544" ? "BLACK" : "SSD1306_WHITE";
  function C(o){ return col ? hx(rgb565(hexc(o.c)), 4) : white; }
  t = head + "// Bibliotheken (Bibliotheksverwalter): " + libn + "\n" + inc + "\n";
  // Bitmaps
  if (bu) { if (col) { var vals = []; for (var q = 0; q < S.B.d.length; q++) vals.push(rgb565(S.B.d[q] || hexc(S.bgc || "#000000"))); t += "const uint16_t bild[" + (W * H) + "] PROGMEM = {   // Freihand-Ebene / Bild\n" + carr(vals, 16, 4) + "\n};\n\n"; } else { var pk2 = packMono(S.B, u8); t += "const unsigned char bild[] PROGMEM = {   // Freihand-Ebene / Bild, " + pk2.bytes.length + " Bytes\n" + carr(pk2.bytes, 16, 2) + "\n};\n\n"; } }
  objs.forEach(function(o, i){ if (o.k === "icon") { var ib = iconBitmap(o), pk3 = packMono(ib, u8); t += "const unsigned char symbol" + i + "[] PROGMEM = {   // " + ICONS[o.n][0] + ", " + ib.w + " × " + ib.h + "\n" + carr(pk3.bytes, 16, 2) + "\n};\n\n"; } });
  var init = "";
  if (ctrl === "SSD1306") init = "  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {\n    Serial.println(F(\"SSD1306 nicht gefunden\"));\n    for (;;);\n  }\n  display.clearDisplay();\n";
  else if (ctrl === "PCD8544") init = "  display.begin();\n  display.setContrast(50);   // 40 bis 60 ausprobieren\n  display.clearDisplay();\n";
  else if (u8) init = "  u8g2.begin();\n  u8g2.clearBuffer();\n";
  else if (ctrl === "ST7735") init = "  tft.initR(INITR_BLACKTAB);   // je nach Display: INITR_GREENTAB / INITR_REDTAB\n  tft.fillScreen(" + hx(rgb565(hexc(S.bgc || "#000000")), 4) + ");\n";
  else if (ctrl === "ST7789") init = "  tft.init(" + W + ", " + H + ");\n  tft.fillScreen(" + hx(rgb565(hexc(S.bgc || "#000000")), 4) + ");\n";
  else if (ctrl === "CO5300") init = "  gfx->begin();\n  gfx->fillScreen(" + hx(rgb565(hexc(S.bgc || "#000000")), 4) + ");\n";
  else init = "  tft.begin();\n  tft.fillScreen(" + hx(rgb565(hexc(S.bgc || "#000000")), 4) + ");\n";
  var body = "";
  if (bu) body += u8 ? "  u8g2.drawXBM(0, 0, " + W + ", " + H + ", bild);\n" : col ? "  " + g + dot + (ctrl === "CO5300" ? "draw16bitRGBBitmap" : "drawRGBBitmap") + "(0, 0, bild, " + W + ", " + H + ");\n" : "  display.drawBitmap(0, 0, bild, " + W + ", " + H + ", " + white + ");\n";
  objs.forEach(function(o, i){
    var cc = C(o);
    if (o.k === "text") {
      if (u8) { var fnt = o.s <= 1 ? "u8g2_font_6x10_tr" : o.s === 2 ? "u8g2_font_10x20_tr" : "u8g2_font_logisoso24_tr", asc = o.s <= 1 ? 8 : o.s === 2 ? 16 : 24; body += "  u8g2.setFont(" + fnt + ");\n  u8g2.drawStr(" + o.x + ", " + (o.y + asc) + ", \"" + cstr(o.t) + "\");\n"; }
      else body += "  " + g + dot + "setTextSize(" + o.s + ");\n  " + g + dot + "setTextColor(" + cc + ");\n  " + g + dot + "setCursor(" + o.x + ", " + o.y + ");\n  " + g + dot + "print(\"" + cstr(o.t) + "\");\n";
    } else if (o.k === "icon") body += u8 ? "  u8g2.drawXBM(" + o.x + ", " + o.y + ", " + (5 * o.s) + ", " + (8 * o.s) + ", symbol" + i + ");   // " + ICONS[o.n][0] + "\n" : "  " + g + dot + "drawBitmap(" + o.x + ", " + o.y + ", symbol" + i + ", " + (5 * o.s) + ", " + (8 * o.s) + ", " + cc + ");   // " + ICONS[o.n][0] + "\n";
    else if (o.k === "rect") body += u8 ? "  u8g2." + (o.fill ? "drawBox" : "drawFrame") + "(" + o.x + ", " + o.y + ", " + o.w + ", " + o.h + ");\n" : "  " + g + dot + "" + (o.fill ? "fillRect" : "drawRect") + "(" + o.x + ", " + o.y + ", " + o.w + ", " + o.h + ", " + cc + ");\n";
    else if (o.k === "circle") { var rr = Math.floor(o.d / 2); body += u8 ? "  u8g2." + (o.fill ? "drawDisc" : "drawCircle") + "(" + (o.x + rr) + ", " + (o.y + rr) + ", " + rr + ");\n" : "  " + g + dot + "" + (o.fill ? "fillCircle" : "drawCircle") + "(" + (o.x + rr) + ", " + (o.y + rr) + ", " + rr + ", " + cc + ");\n"; }
    else if (o.k === "tri") { var p = triPts(o), a = p[0][0] + ", " + p[0][1] + ", " + p[1][0] + ", " + p[1][1] + ", " + p[2][0] + ", " + p[2][1];
      if (u8) body += o.fill ? "  u8g2.drawTriangle(" + a + ");\n" : "  u8g2.drawLine(" + p[0][0] + ", " + p[0][1] + ", " + p[1][0] + ", " + p[1][1] + ");\n  u8g2.drawLine(" + p[1][0] + ", " + p[1][1] + ", " + p[2][0] + ", " + p[2][1] + ");\n  u8g2.drawLine(" + p[2][0] + ", " + p[2][1] + ", " + p[0][0] + ", " + p[0][1] + ");\n";
      else body += "  " + g + dot + "" + (o.fill ? "fillTriangle" : "drawTriangle") + "(" + a + ", " + cc + ");\n"; }
    else if (o.k === "line") body += u8 ? "  u8g2.drawLine(" + o.x + ", " + o.y + ", " + o.x2 + ", " + o.y2 + ");\n" : "  " + g + dot + "drawLine(" + o.x + ", " + o.y + ", " + o.x2 + ", " + o.y2 + ", " + cc + ");\n";
  });
  var send = u8 ? "  u8g2.sendBuffer();\n" : (!col ? "  display.display();\n" : "");
  t += "void setup() {\n" + (ctrl === "SSD1306" ? "  Serial.begin(115200);\n" : "") + (ctrl === "SSD1306" || u8 ? P.begin : "") + init + body + send + "}\n\nvoid loop() {\n}\n";
  return { txt: t, ext: ext };
}


/* ----- Erklärung zum Code (Zeile für Zeile) ----- */
var XR_CPP = [
  [/^#include <Wire\.h>/, "Bibliothek für I²C – die Zwei-Draht-Verbindung (SDA/SCL) zum Display.", "Bibliothèque I²C – liaison à deux fils (SDA/SCL) avec l’écran."],
  [/^#include <SPI\.h>/, "Bibliothek für SPI – die schnelle Verbindung (Takt, Daten, Chip-Select).", "Bibliothèque SPI – liaison rapide (horloge, données, chip-select)."],
  [/^#include <Adafruit_GFX\.h>/, "Adafruit GFX: die Zeichen-Grundlagen – Linien, Kreise, Text, Bitmaps.", "Adafruit GFX : les bases du dessin – lignes, cercles, texte, bitmaps."],
  [/^#include </, "Treiber-Bibliothek für dein Display (vorher im Bibliotheksverwalter installieren).", "Bibliothèque pilote de ton écran (à installer avant dans le gestionnaire de bibliothèques)."],
  [/^#define\s+\w+\s+\d+/, "Pin-Nummer festlegen – hier muss deine Verkabelung stehen.", "Définit un numéro de broche – doit correspondre à ton câblage."],
  [/^LiquidCrystal_I2C lcd/, "Legt das LCD-Objekt an: I²C-Adresse, Spalten, Zeilen.", "Crée l’objet LCD : adresse I²C, colonnes, lignes."],
  [/^(Adafruit_\w+ \w+\s*[(=]|U8G2_|LedControl |TM1637Display |Arduino_DataBus|Arduino_GFX \*)/, "Legt das Display-Objekt an (Größe, Pins, Bus) – damit steuerst du es später.", "Crée l’objet écran (taille, broches, bus) – tu le pilotes ensuite avec lui."],
  [/^byte zeichen\d+/, "Eigenes Zeichen: 8 Zeilen à 5 Punkte, 1 = Punkt an, 0 = aus.", "Caractère perso : 8 lignes de 5 points, 1 = allumé, 0 = éteint."],
  [/^const\s+(unsigned char|uint16_t|uint8_t|byte)\s+\w+/, "Daten im Programmspeicher: die Zahlen sind Punktmuster oder Farben (Symbole, Bild, Segmente).", "Données en mémoire programme : les nombres sont des motifs de points ou des couleurs."],
  [/^void setup\(\)/, "setup() läuft genau einmal beim Einschalten.", "setup() s’exécute une seule fois au démarrage."],
  [/^void loop\(\)/, "loop() läuft danach endlos. Hier leer – das Bild bleibt einfach stehen (statisch). Für Animationen kommt der Code hierhin.", "loop() tourne ensuite sans fin. Vide ici – l’image reste fixe. Pour animer, le code irait ici."],
  [/Serial\.begin/, "Serielle Schnittstelle für Meldungen am PC.", "Port série pour les messages sur le PC."],
  [/Serial\.println/, "Meldung im Seriellen Monitor.", "Message dans le moniteur série."],
  [/Wire\.(begin|setSDA|setSCL)/, "I²C-Pins festlegen und den Bus starten.", "Définit les broches I²C et démarre le bus."],
  [/lcd\.init\(\)/, "LCD starten.", "Démarre le LCD."],
  [/lcd\.backlight/, "Hintergrundbeleuchtung einschalten.", "Allume le rétroéclairage."],
  [/lcd\.createChar/, "Legt das eigene Zeichen im LCD-Speicher ab (Platz 0–7).", "Enregistre le caractère perso dans la mémoire du LCD (emplacement 0–7)."],
  [/lcd\.setCursor/, "Schreibposition: Spalte, Zeile (0 = erste).", "Position d’écriture : colonne, ligne (0 = première)."],
  [/lcd\.write\(byte/, "Zeigt das eigene Zeichen mit dieser Nummer an.", "Affiche le caractère perso portant ce numéro."],
  [/lcd\.print/, "Schreibt den Text ab der Schreibposition.", "Écrit le texte à partir de la position."],
  [/display\.begin\(SSD1306|display\.begin\(\)|\.initR\(|\.init\(|(tft|gfx)(\.|->)begin\(|u8g2\.begin/, "Display starten – ab hier ist es bereit.", "Démarre l’écran – il est prêt à partir d’ici."],
  [/setContrast/, "Kontrast einstellen (je nach Modul 40–60 ausprobieren).", "Règle le contraste (essaie 40–60 selon le module)."],
  [/clearDisplay|clearBuffer|fillScreen/, "Bild löschen bzw. Hintergrund füllen.", "Efface l’image ou remplit le fond."],
  [/setTextSize/, "Schriftgröße (1 = klein, 2 = doppelt …).", "Taille du texte (1 = petit, 2 = double …)."],
  [/setTextColor/, "Schriftfarbe.", "Couleur du texte."],
  [/\.setCursor/, "Position, an der der Text beginnt (x, y in Pixeln).", "Position où le texte commence (x, y en pixels)."],
  [/\.print\(/, "Schreibt den Text.", "Écrit le texte."],
  [/setFont/, "Schriftart für den folgenden Text.", "Police pour le texte suivant."],
  [/drawStr/, "Schreibt Text (y = Grundlinie der Buchstaben).", "Écrit du texte (y = ligne de base)."],
  [/drawXBM|drawBitmap|drawRGBBitmap|draw16bitRGBBitmap/, "Zeichnet ein Bitmap (Symbol/Bild) aus den Daten oben an diese Position.", "Dessine un bitmap (symbole/image) des données ci-dessus à cette position."],
  [/drawBox|fillRect|drawFrame|drawRect/, "Rechteck: x, y, Breite, Höhe.", "Rectangle : x, y, largeur, hauteur."],
  [/drawDisc|fillCircle|drawCircle/, "Kreis: Mittelpunkt x, y und Radius.", "Cercle : centre x, y et rayon."],
  [/drawTriangle|fillTriangle|drawLine/, "Dreieck bzw. Linie zwischen den angegebenen Punkten.", "Triangle ou ligne entre les points donnés."],
  [/display\.display\(\)|sendBuffer/, "Schickt das gemalte Bild an den Bildschirm – erst jetzt wird es sichtbar.", "Envoie l’image dessinée à l’écran – elle n’apparaît qu’ici."],
  [/lc\.shutdown/, "Chip aus dem Schlafmodus holen.", "Sort la puce du mode veille."],
  [/lc\.setIntensity/, "Helligkeit 0–15.", "Luminosité 0–15."],
  [/lc\.clearDisplay/, "Modul löschen.", "Efface le module."],
  [/lc\.setRow/, "Schreibt eine ganze Zeile (ein Byte = 8 Punkte).", "Écrit une ligne entière (un octet = 8 points)."],
  [/display\.setBrightness/, "Helligkeit 0–7.", "Luminosité 0–7."],
  [/display\.setSegments/, "Schaltet die vier Ziffern laut Tabelle oben.", "Allume les quatre chiffres selon le tableau ci-dessus."],
  [/^\s*for \(/, "Schleife: wiederholt den Block für jede Zeile/Modul.", "Boucle : répète le bloc pour chaque ligne/module."]
];
var XR_PY = [
  [/^import time/, "Zeit-Funktionen (für die Warteschleife am Ende).", "Fonctions de temps (pour la boucle d’attente finale)."],
  [/^from PIL import/, "Pillow: damit malst du das Bild im Speicher.", "Pillow : pour dessiner l’image en mémoire."],
  [/^from (luma|RPLCD)/, "Treiber-Bibliothek für dein Display (vorher per pip installieren).", "Bibliothèque pilote de ton écran (à installer avant avec pip)."],
  [/^import tm1637/, "Treiber für die 4-stellige Anzeige.", "Pilote de l’afficheur à 4 chiffres."],
  [/^serial = /, "Verbindung zum Display (I²C bzw. SPI inkl. Steuer-Pins).", "Liaison avec l’écran (I²C ou SPI avec broches de commande)."],
  [/^device = /, "Das Display-Objekt – damit sendest du Bilder.", "L’objet écran – tu lui envoies les images."],
  [/^lcd = CharLCD/, "Legt das LCD an: Chip, I²C-Adresse, Spalten, Zeilen.", "Crée le LCD : puce, adresse I²C, colonnes, lignes."],
  [/^lcd\.create_char/, "Speichert das eigene Zeichen (Platz 0–7).", "Enregistre le caractère perso (emplacement 0–7)."],
  [/^lcd\.cursor_pos/, "Schreibposition: (Zeile, Spalte).", "Position d’écriture : (ligne, colonne)."],
  [/^lcd\.write_string/, "Schreibt den Text; \\x00 … \\x07 sind die eigenen Zeichen.", "Écrit le texte ; \\x00 … \\x07 sont les caractères perso."],
  [/^tm = tm1637/, "Legt die Anzeige an (CLK- und DIO-Pin).", "Crée l’afficheur (broches CLK et DIO)."],
  [/^tm\.brightness/, "Helligkeit 0–7.", "Luminosité 0–7."],
  [/^daten = \[/, "Die vier Ziffern als Segment-Bytes.", "Les quatre chiffres en octets de segments."],
  [/^tm\.write/, "Schaltet die Segmente.", "Allume les segments."],
  [/^BILD = \[/, "Das Bild als Textraster: # = Pixel an, . = aus.", "L’image en grille de texte : # = allumé, . = éteint."],
  [/^for y, zeile/, "Übertrage das Textraster Pixel für Pixel ins Bild.", "Copie la grille de texte pixel par pixel dans l’image."],
  [/^img = Image\.(new|open)/, "Das Bild, in das gemalt wird.", "L’image dans laquelle on dessine."],
  [/^draw = ImageDraw/, "Zeichenwerkzeug für dieses Bild.", "Outil de dessin pour cette image."],
  [/^def symbol/, "Hilfsfunktion: malt ein Symbol aus einem Punktmuster.", "Fonction d’aide : dessine un symbole à partir d’un motif."],
  [/^symbol\(/, "Malt das Symbol an diese Position (x, y, Muster, Größe, Farbe).", "Dessine le symbole à cette position (x, y, motif, taille, couleur)."],
  [/^draw\.text/, "Text an Position (x, y).", "Texte à la position (x, y)."],
  [/^draw\.rectangle/, "Rechteck von links-oben bis rechts-unten.", "Rectangle de haut-gauche à bas-droite."],
  [/^draw\.ellipse/, "Kreis/Ellipse im angegebenen Rahmen.", "Cercle/ellipse dans le cadre indiqué."],
  [/^draw\.polygon/, "Dreieck aus drei Eckpunkten.", "Triangle à partir de trois sommets."],
  [/^draw\.line/, "Linie von Punkt zu Punkt.", "Ligne d’un point à l’autre."],
  [/^device\.display\(img\)/, "Schickt das fertige Bild auf das Display.", "Envoie l’image terminée à l’écran."],
  [/^try:/, "Programm läuft, bis du Strg+C drückst (Bild bleibt solange stehen).", "Le programme tourne jusqu’à Ctrl+C (l’image reste affichée)."]
];
function addExplain(txt, py){
  var rules = py ? XR_PY : XR_CPP, cm = py ? "# " : "// ", out = [];
  txt.split("\n").forEach(function(line){
    var t = line.trim();
    if (!t || (!py && t.indexOf("//") === 0) || (py && t.charAt(0) === "#") || /^(0x|\{ 0x|"[.#]+"|\}|\);|\];|\};)/.test(t)) { out.push(line); return; }
    for (var i = 0; i < rules.length; i++) if (rules[i][0].test(t)) { out.push(line.match(/^\s*/)[0] + cm + "▸ " + L(rules[i][1], rules[i][2])); break; }
    out.push(line);
  });
  return out.join("\n");
}
function startSteps(d, b){
  var fam2 = fam(b), pi = b === "pi", P = pinsFor(d, b), k = libOf(d), st = [];
  if (!pi) {
    var board = { uno: ["", ""], nano: ["", ""], mega: ["", ""], esp32: [L("Werkzeuge → Board → Boardverwalter: „esp32“ (Espressif) installieren, dann Board ", "Outils → Type de carte → Gestionnaire : installer « esp32 » (Espressif), puis choisir "), d.ctrl === "CO5300" ? "„ESP32S3 Dev Module“" : "„ESP32 Dev Module“"], esp8266: [L("Boardverwalter: „esp8266“ installieren, dann Board ", "Gestionnaire de cartes : installer « esp8266 », puis choisir "), "„LOLIN(WEMOS) D1 mini“"], pico: [L("Datei → Voreinstellungen → „Zusätzliche Boardverwalter-URLs“: https://github.com/earlephilhower/arduino-pico/releases/download/global/package_rp2040_index.json eintragen; dann Boardverwalter: „Raspberry Pi Pico/RP2040“ installieren und Board ", "Fichier → Préférences → « URL de gestionnaire de cartes » : ajouter https://github.com/earlephilhower/arduino-pico/releases/download/global/package_rp2040_index.json ; puis installer « Raspberry Pi Pico/RP2040 » et choisir "), "„Raspberry Pi Pico“"] }[b];
    st.push(L("Arduino IDE öffnen. ", "Ouvre l’IDE Arduino. ") + (board && board[0] ? board[0] + board[1] + L(" wählen.", ".") : L("Das Board „", "La carte « ") + BNAME[b] + L("“ ist schon dabei – unter Werkzeuge → Board auswählen.", " » est déjà incluse – choisis-la dans Outils → Type de carte.")));
    st.push(L("Bibliotheken: Werkzeuge → Bibliotheken verwalten → suchen und installieren: ", "Bibliothèques : Outils → Gérer les bibliothèques → chercher et installer : ") + "<b>" + (LIBN[k] || []).join("</b>, <b>") + "</b>.");
  } else {
    st.push(L("Auf dem Raspberry Pi im Terminal: ", "Sur le Raspberry Pi, dans le terminal : ") + "<code>sudo raspi-config</code> → Interface Options → " + (d.grp === "lcd" || d.ctrl === "SSD1306" || d.ctrl === "SH1106" ? "I2C" : d.ctrl === "TM1637" ? "—" : "SPI") + L(" einschalten, danach neu starten.", " activer, puis redémarrer."));
    st.push(L("Pakete installieren: ", "Installer les paquets : ") + "<code>pip install " + (PYLIBS[k] || "") + " pillow</code> " + L("(bei der Meldung „externally managed“ zusätzlich <code>--break-system-packages</code> anhängen).", "(en cas de « externally managed », ajouter <code>--break-system-packages</code>)."));
  }
  st.push(L("Verkabeln: ", "Câbler : ") + P.t.join(" · "));
  st.push(pi ? L("Code als Datei speichern (Knopf unten) und starten: <code>python3 oratio_" + d.id + ".py</code>. Strg+C beendet.", "Enregistre le code (bouton en bas) et lance : <code>python3 oratio_" + d.id + ".py</code>. Ctrl+C arrête.") : L("Code kopieren, in eine neue Skizze einfügen, oben Board und Port wählen, dann auf den Pfeil (Hochladen) tippen.", "Copie le code, colle-le dans un nouveau croquis, choisis carte et port, puis clique sur la flèche (Téléverser)."));
  if (pi && d.grp === "color" && baseUsed(dinit(d))) st.push(L("Für Bild/Freihand: oben „Als PNG speichern (1:1)“, die Datei als bild.png neben das Skript legen.", "Pour image/dessin : « Enregistrer en PNG (1:1) » en haut, place bild.png à côté du script."));
  if (d.grp === "lcd" || d.ctrl === "SSD1306" || d.ctrl === "SH1106") st.push(L("Bleibt das Display leer? " + (d.grp === "lcd" ? "Kontrast-Poti hinten am Backpack drehen und " : "") + (pi ? "Adresse prüfen: <code>i2cdetect -y 1</code>." : "Adresse mit dem Beispiel „Datei → Beispiele → Wire → i2c_scanner“ prüfen (0x27, 0x3F oder 0x3C)."), "Écran vide ? " + (d.grp === "lcd" ? "Tourne le potentiomètre de contraste et " : "") + (pi ? "vérifie l’adresse : <code>i2cdetect -y 1</code>." : "vérifie l’adresse avec l’exemple « Wire → i2c_scanner » (0x27, 0x3F ou 0x3C).")));
  return st;
}

/* ----- Oberfläche ----- */
MODS.disp = { show: function(b){
  dload();
  var top = el("div", "lcard"); b.appendChild(top);
  top.appendChild(el("h2", "", L("Display wählen", "Choisir un écran")));
  var chips = el("div"); top.appendChild(chips);
  var brow = el("div", "lrow"); brow.style.marginTop = "6px"; top.appendChild(el("div", "lmut", L("Dein Board:", "Ta carte :")));
  top.appendChild(brow);
  var rs = el("div", "lrow"); rs.style.marginTop = "12px"; top.appendChild(rs);
  var undoB = el("button", "lbtn", "↶ " + L("Rückgängig", "Annuler")); DD.undoBtn = undoB; rs.appendChild(undoB);
  var resB = el("button", "lbtn bad", "↺ " + L("Dieses Display zurücksetzen", "Réinitialiser cet écran")); rs.appendChild(resB);
  var resMsg = el("span", "lmut"); rs.appendChild(resMsg);
  undoB.onclick = function(){ var a = DD.undo[DD.sel]; if (!a || !a.length) return; DD.S[DD.sel] = a.pop(); undoB.hidden = !a.length; render(); };
  resB.onclick = function(){ pushUndo(); delete DD.S[DD.sel]; render(); resMsg.textContent = L("Zurückgesetzt – mit „Rückgängig“ holst du alles zurück.", "Réinitialisé – « Annuler » rend tout."); setTimeout(function(){ resMsg.textContent = ""; }, 5000); };
  var area = el("div"); area.style.marginTop = "16px"; b.appendChild(area);
  var info = el("div", "lcard"); info.style.marginTop = "16px"; b.appendChild(info);
  var cc = el("div", "lcard"); cc.style.marginTop = "16px"; b.appendChild(cc);
  var view = null, ta = null;
  ["lcd", "mono", "color", "seg"].forEach(function(g){ var gl = el("div", "lmut", GRPN[g]); gl.style.margin = "8px 0 4px"; chips.appendChild(gl); var r = el("div", "lrow"); chips.appendChild(r);
    DISPS.filter(function(x){ return x.grp === g; }).forEach(function(d){ var x = el("button", "lbtn" + (DD.sel === d.id ? " on" : ""), d.n); x.dataset.id = d.id; x.onclick = function(){ DD.sel = d.id; chips.querySelectorAll("button").forEach(function(y){ y.classList.toggle("on", y.dataset.id === d.id); }); render(); }; r.appendChild(x); }); });
  BOARDS.forEach(function(o){ var x = el("button", "lbtn" + (DD.board === o[0] ? " on" : ""), o[1]); x.dataset.b = o[0]; x.onclick = function(){ DD.board = o[0]; brow.querySelectorAll("button").forEach(function(y){ y.classList.toggle("on", y.dataset.b === o[0]); }); updCode(); dsave(); }; brow.appendChild(x); });
  function infoPanel(){
    var d = dget(DD.sel), S = dinit(d), p = pinsFor(d, DD.board), bd = BNAME[DD.board], lib = DD.board === "pi" ? "pip install " + PYLIBS[libOf(d)] : LIBS[libOf(d)];
    info.innerHTML = "<h2>" + d.n + "</h2>";
    var rows = [[L("Controller", "Contrôleur"), d.ctrl || "HD44780 (PCF8574 I²C)"], [L("Auflösung", "Résolution"), d.grp === "lcd" ? d.cols + " × " + d.rows + " " + L("Zeichen", "caractères") + " (je 5×8 Punkte)" : d.grp === "seg" ? "4 × 7 Segmente" : d.w + " × " + d.h + " Pixel · " + (d.grp === "color" ? L("65 536 Farben (RGB565)", "65 536 couleurs (RGB565)") : L("2 Farben", "2 couleurs"))], [L("Anschluss", "Branchement") + " " + bd, p.t.join(" · ")], [L("Bibliothek", "Bibliothèque"), lib]];
    var tb = el("div"); rows.forEach(function(r){ tb.appendChild(el("p", "", "<b>" + r[0] + ":</b> " + r[1])); }); info.appendChild(tb);
    var sz = sizeBytes(d, S);
    if (sz && (d.grp === "color" || d.grp === "mono") && baseUsed(S)) { var fl = FLASH[DD.board], ok = sz <= fl * 0.9, msg = "💾 " + L("Ein ganzes Bild braucht ", "Une image complète utilise ") + (sz >= 1024 ? (sz / 1024).toFixed(1) + " KB" : sz + " Bytes");
      if (fl === Infinity) msg += L(" – auf dem Raspberry Pi kein Problem.", " – aucun souci sur le Raspberry Pi.");
      else if (ok) msg += L(" (von ca. ", " (sur env. ") + Math.round(fl / 1024) + L(" KB Programmspeicher): passt.", " Ko de mémoire programme) : ça passe.");
      else msg += L(" – das passt NICHT in den Programmspeicher (", " – ça ne tient PAS en mémoire programme (") + Math.round(fl / 1024) + " KB). " + L("Nimm ein kleineres Display oder ein größeres Board.", "Prends un écran plus petit ou une carte plus grande.");
      info.appendChild(el("p", ok ? "lmut" : "swarn", msg)); }
    else if (sz && d.grp === "color") info.appendChild(el("p", "lmut", "💾 " + L("Nur Formen und Text brauchen fast keinen Speicher. Ein ganzes Bild (Freihand/Upload) würde ", "Formes et texte n’utilisent presque pas de mémoire. Une image complète (main levée/import) utiliserait ") + (sz / 1024).toFixed(1) + " KB."));
    if (d.grp === "lcd" && lcdBank(S).bank.length > 8) info.appendChild(el("p", "swarn", "⚠️ " + L("Du nutzt mehr als 8 verschiedene eigene Zeichen – das LCD kann nur 8 gleichzeitig. Die überzähligen werden im Code durch das 8. ersetzt.", "Plus de 8 caractères différents – le LCD n’en gère que 8. Les surplus sont remplacés par le 8e dans le code.")));
    p.w.forEach(function(w){ info.appendChild(el("p", "swarn", "⚠️ " + w)); });
    var sh = el("h3", "", "🚀 " + L("So kommst du ans Ziel", "Pour y arriver")); sh.style.cssText = "margin:14px 0 6px;font-size:16px"; info.appendChild(sh);
    var ol = el("ol"); ol.style.cssText = "margin:0;padding-left:20px;display:grid;gap:6px;font-size:14px"; startSteps(d, DD.board).forEach(function(x){ ol.appendChild(el("li", "", x)); }); info.appendChild(ol);
  }
  function render(){
    if (view && view.stop) view.stop();
    var d = dget(DD.sel), S = dinit(d); undoB.hidden = !(DD.undo[DD.sel] && DD.undo[DD.sel].length); area.innerHTML = ""; var up = function(light){ view.paint(); updCode(light); };
    view = d.grp === "lcd" ? viewLCD(area, d, S, up) : d.grp === "seg" ? viewSeg(area, d, S, up) : viewGfx(area, d, S, up);
    view.paint(); updCode(); dsave();
  }
  MODS.disp.stop = function(){ if (view && view.stop) view.stop(); };
  cc.innerHTML = "<h2>" + L("Fertiger Code", "Code prêt") + "</h2>";
  ta = el("textarea", "code"); ta.readOnly = true; ta.style.height = "300px"; cc.appendChild(ta);
  var r2 = el("div", "lrow"); r2.style.marginTop = "10px"; cc.appendChild(r2);
  var cb = el("button", "lbtn pri", L("Code kopieren", "Copier le code")); r2.appendChild(cb);
  var sb = el("button", "lbtn"); r2.appendChild(sb);
  var xb = el("button", "lbtn", "📖 " + L("Erklärung einblenden", "Afficher l’explication")); r2.appendChild(xb); var xOn = false;
  xb.onclick = function(){ xOn = !xOn; xb.textContent = xOn ? "📖 " + L("Erklärung ausblenden", "Masquer l’explication") : "📖 " + L("Erklärung einblenden", "Afficher l’explication"); xb.classList.toggle("on", xOn); updCode(); };
  var timer = null, lastExt = "ino";
  function updCode(light){
    var d = dget(DD.sel), S = dinit(d);
    var run = function(){ var o = genCode(d, S, DD.board); ta.value = xOn ? addExplain(o.txt, o.ext === "py") : o.txt; lastExt = o.ext; sb.textContent = L("Als .", "Enregistrer .") + o.ext + L(" speichern", ""); dsave(); infoPanel(); };
    if (light) { clearTimeout(timer); timer = setTimeout(run, 250); } else run();
  }
  cb.onclick = function(){ copy(ta.value, ta, function(){ cb.textContent = L("Kopiert ✓", "Copié ✓"); setTimeout(function(){ cb.textContent = L("Code kopieren", "Copier le code"); }, 1500); }); };
  sb.onclick = function(){ var d = dget(DD.sel); save("oratio_" + d.id + "." + lastExt, new Blob([ta.value], { type: "text/plain" })); };
  render();
} };


/* ---------- GAME ---------- */
var G = { seq: [], pos: 0, busy: false, run: false, ac: null, sub: "mem", alive: false };
var GC = ["#ff3b4f", "#2cd86a", "#ffc21a", "#2f8bff"];
function beep(i){ try { G.ac = G.ac || new (window.AudioContext || window.webkitAudioContext)(); var o = G.ac.createOscillator(), g = G.ac.createGain(); o.frequency.value = [330, 392, 494, 587][i]; o.type = "sine"; g.gain.value = 0.12; o.connect(g); g.connect(G.ac.destination); o.start(); setTimeout(function(){ o.stop(); }, 180); } catch(e){} }
function best(k){ return sv(k) || 0; }
MODS.game = { show: function(b){
  G.alive = true;
  var tabs = el("div", "lrow"); tabs.style.marginBottom = "12px";
  var area = el("div"); b.appendChild(tabs); b.appendChild(area);
  var subs = [["mem", "💡 " + L("LED-Memory", "Mémoire LED"), memGame], ["ohm", "🧮 " + L("Ohm-Quiz", "Quiz d’Ohm"), ohmGame], ["col", "🎨 " + L("Farbcode", "Code couleur"), colGame], ["rea", "⚡ " + L("Reaktion", "Réaction"), reaGame]];
  function go(k){ G.run = false; G.alive = true; G.sub = k; tabs.querySelectorAll("button").forEach(function(x){ x.classList.toggle("on", x.dataset.k === k); }); area.innerHTML = ""; subs.filter(function(s){ return s[0] === k; })[0][2](area); }
  subs.forEach(function(s){ var x = el("button", "lbtn", s[1]); x.dataset.k = s[0]; x.onclick = function(){ go(s[0]); }; tabs.appendChild(x); });
  go(G.sub);
}, stop: function(){ G.run = false; G.alive = false; } };
function card(a, title, text){ var c = el("div", "lcard"); c.innerHTML = "<h2>" + title + "</h2><p class='lmut'>" + text + "</p>"; a.appendChild(c); return c; }
function memGame(a){
  var c = card(a, "💡 " + L("LED-Memory", "Mémoire LED"), L("Die LEDs leuchten in einer Reihenfolge auf. Tippe sie danach in derselben Reihenfolge nach – jede Runde wird um einen Schritt länger.", "Les LED s’allument dans un ordre. Retouche-les ensuite dans le même ordre – chaque manche ajoute une étape."));
  var info = el("div", "big"); c.appendChild(info);
  var hs = el("p", "lmut"); hs.style.textAlign = "center"; c.appendChild(hs);
  var pads = el("div", "simon"); c.appendChild(pads);
  var bt = GC.map(function(col, i){ var x = el("button"); x.style.background = col; x.style.color = col; x.setAttribute("aria-label", "LED " + (i + 1)); x.onclick = function(){ press(i); }; pads.appendChild(x); return x; });
  var st0 = el("button", "lbtn pri", L("Spiel starten", "Démarrer")); st0.style.cssText = "display:block;margin:0 auto"; st0.onclick = newGame; c.appendChild(st0);
  function head(){ hs.textContent = "🏆 Highscore: " + best("simon"); }
  function flash(i, ms){ return new Promise(function(res){ bt[i].classList.add("lit"); beep(i); setTimeout(function(){ bt[i].classList.remove("lit"); setTimeout(res, 140); }, ms); }); }
  async function play(){ G.busy = true; info.textContent = L("Schau zu …", "Regarde …"); await new Promise(function(r){ setTimeout(r, 500); }); for (var k = 0; k < G.seq.length; k++) { if (!G.run) return; await flash(G.seq[k], Math.max(220, 480 - G.seq.length * 14)); } G.pos = 0; G.busy = false; info.textContent = L("Du bist dran!", "À toi !"); }
  function newGame(){ G.seq = [Math.floor(Math.random() * 4)]; G.run = true; play(); }
  function press(i){
    if (!G.run || G.busy) { flash(i, 160); return; }
    flash(i, 160);
    if (G.seq[G.pos] !== i) { G.run = false; var sc = G.seq.length - 1; if (sc > best("simon")) { st("simon", sc); info.textContent = L("🎉 Neuer Rekord: ", "🎉 Nouveau record : ") + sc; } else info.textContent = L("Falsch! Runden: ", "Raté ! Manches : ") + sc; head(); return; }
    G.pos++;
    if (G.pos === G.seq.length) { G.seq.push(Math.floor(Math.random() * 4)); G.busy = true; info.textContent = "✓ " + L("Richtig! Runde ", "Bien ! Manche ") + G.seq.length; setTimeout(play, 700); }
  }
  info.textContent = L("Bereit?", "Prêt ?"); head();
}
function rnd(n){ return Math.floor(Math.random() * n); }
function shuffle(a){ for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function quiz(a, key, title, text, make){
  var c = card(a, title, text), info = el("div", "big"), q = el("div"), opts = el("div", "lrow"), fb = el("p", "lmut"), hs = el("p", "lmut");
  q.style.cssText = "margin:12px 0;text-align:center"; opts.style.justifyContent = "center"; fb.style.textAlign = "center"; hs.style.textAlign = "center";
  var go = el("button", "lbtn pri", L("Runde starten", "Démarrer")); go.style.cssText = "display:block;margin:10px auto 0";
  c.appendChild(info); c.appendChild(q); c.appendChild(opts); c.appendChild(fb); c.appendChild(hs); c.appendChild(go);
  var n = 0, ok = 0;
  function head(){ hs.textContent = "🏆 Highscore: " + best(key) + " / 10"; }
  function next(){
    if (n >= 10) { var nr = ok > best(key); if (nr) st(key, ok); info.textContent = (nr ? "🎉 " : "") + ok + " / 10"; q.innerHTML = ""; opts.innerHTML = ""; fb.textContent = ""; head(); go.style.display = "block"; return; }
    var m = make(); n++; info.textContent = n + " / 10 · ✓ " + ok; q.innerHTML = m.q; opts.innerHTML = ""; fb.textContent = "";
    m.o.forEach(function(o){ var x = el("button", "lbtn", o); x.onclick = function(){ opts.querySelectorAll("button").forEach(function(y){ y.disabled = true; if (y.textContent === m.a) y.classList.add("pri"); }); if (o === m.a) { ok++; fb.textContent = "✓ " + L("Richtig!", "Bien !"); } else fb.textContent = "✗ " + m.a + (m.e ? " – " + m.e : ""); info.textContent = n + " / 10 · ✓ " + ok; setTimeout(next, 1100); }; opts.appendChild(x); });
  }
  go.onclick = function(){ n = 0; ok = 0; go.style.display = "none"; next(); };
  head();
}
function ohmGame(a){
  quiz(a, "ohmq", "🧮 " + L("Ohm-Quiz", "Quiz d’Ohm"), L("Rechne mit U = R × I. 10 Fragen, vier Antworten.", "Calcule avec U = R × I. 10 questions, quatre réponses."), function(){
    var R = [100, 220, 330, 470, 1000, 2200, 4700][rnd(7)], I = [2, 5, 10, 20, 50][rnd(5)], U = R * I / 1000, kind = rnd(3), ans, unit, txt, ex;
    function fmt(v, u){ return (Math.round(v * 100) / 100) + " " + u; }
    if (kind === 0) { ans = U; unit = "V"; txt = L("Ein Widerstand mit ", "Une résistance de ") + fmtR(R) + L(" wird von ", " est traversée par ") + I + " mA" + L(" durchflossen. Welche Spannung fällt ab?", ". Quelle tension chute ?"); ex = "U = R × I"; }
    else if (kind === 1) { ans = I; unit = "mA"; txt = fmt(U, "V") + L(" liegen an ", " sur ") + fmtR(R) + L(". Welcher Strom fließt?", ". Quel courant ?"); ex = "I = U ÷ R"; }
    else { ans = R; unit = "Ω"; txt = fmt(U, "V") + L(" und ", " et ") + I + " mA" + L(". Wie groß ist der Widerstand?", ". Quelle résistance ?"); ex = "R = U ÷ I"; }
    var good = fmt(ans, unit), set = {}; set[good] = 1;
    var fac = [0.5, 2, 10, 0.1, 1.5, 4], o = [good], t = 0;
    while (o.length < 4 && t++ < 30) { var w = fmt(ans * fac[rnd(6)], unit); if (!set[w]) { set[w] = 1; o.push(w); } }
    return { q: "<div style='font-size:18px'>" + txt + "</div>", o: shuffle(o), a: good, e: ex };
  });
}
var BANDS = [["#111", L("schwarz", "noir")], ["#7a4a21", L("braun", "marron")], ["#e0242e", L("rot", "rouge")], ["#ff8a00", L("orange", "orange")], ["#ffd400", L("gelb", "jaune")], ["#2cb04a", L("grün", "vert")], ["#2f6bff", L("blau", "bleu")], ["#8a3cff", L("violett", "violet")], ["#8a8f99", L("grau", "gris")], ["#f4f4f4", L("weiß", "blanc")]];
function colGame(a){
  var E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
  quiz(a, "colq", "🎨 " + L("Widerstands-Farbcode", "Code couleur des résistances"), L("Lies den Wert vom Widerstand ab: 1. Ring, 2. Ring = Ziffern, 3. Ring = Multiplikator, goldener Ring = ±5 %.", "Lis la valeur : 1er et 2e anneau = chiffres, 3e = multiplicateur, anneau or = ±5 %."), function(){
    var e = E12[rnd(12)], m = rnd(5) + 0, d1 = Math.floor(e / 10), d2 = e % 10, val = e * Math.pow(10, m);
    function f(v){ return v >= 1e6 ? v / 1e6 + " MΩ" : v >= 1000 ? Math.round(v / 10) / 100 + " kΩ" : v + " Ω"; }
    var good = f(val), set = {}; set[good] = 1; var o = [good], t = 0;
    while (o.length < 4 && t++ < 40) { var w = f(E12[rnd(12)] * Math.pow(10, rnd(5))); if (!set[w]) { set[w] = 1; o.push(w); } }
    var cs = [BANDS[d1][0], BANDS[d2][0], BANDS[m][0], "#d4af37"], xs = [58, 82, 106, 142];
    var svg = '<svg viewBox="0 0 200 60" width="260" style="max-width:100%"><line x1="4" y1="30" x2="40" y2="30" stroke="#999" stroke-width="4"/><line x1="160" y1="30" x2="196" y2="30" stroke="#999" stroke-width="4"/><rect x="36" y="10" width="128" height="40" rx="14" fill="#e9d3a2" stroke="#8a7648" stroke-width="2"/>' + cs.map(function(c, i){ return '<rect x="' + xs[i] + '" y="10" width="10" height="40" fill="' + c + '" stroke="#0003"/>'; }).join("") + '</svg>';
    return { q: svg, o: shuffle(o), a: good, e: BANDS[d1][1] + " · " + BANDS[d2][1] + " · " + BANDS[m][1] };
  });
}
function reaGame(a){
  var c = card(a, "⚡ " + L("Reaktionstest", "Test de réaction"), L("Tippe auf die Fläche, sobald sie grün wird – nicht vorher!", "Touche la zone dès qu’elle devient verte – pas avant !"));
  var pad = el("button", "lbtn"); pad.style.cssText = "display:block;width:100%;height:200px;border-radius:20px;font-size:22px;font-weight:800;background:#2f6bff;color:#fff"; pad.textContent = L("Start", "Début"); c.appendChild(pad);
  var hs = el("p", "lmut"); hs.style.textAlign = "center"; c.appendChild(hs);
  var state = 0, t0 = 0, to = null;
  function head(){ var b2 = best("reak"); hs.textContent = "🏆 " + L("Bestzeit: ", "Meilleur : ") + (b2 ? b2 + " ms" : "–"); }
  pad.onclick = function(){
    if (state === 0) { state = 1; pad.style.background = "#e0364a"; pad.textContent = L("Warte …", "Attends …"); to = setTimeout(function(){ if (!G.alive || !pad.isConnected) return; state = 2; t0 = performance.now(); pad.style.background = "#1fb45a"; pad.textContent = L("JETZT!", "MAINTENANT !"); }, 1500 + Math.random() * 2500); }
    else if (state === 1) { clearTimeout(to); state = 0; pad.style.background = "#2f6bff"; pad.textContent = L("Zu früh! Nochmal tippen.", "Trop tôt ! Touche pour recommencer."); }
    else { var ms = Math.round(performance.now() - t0); state = 0; pad.style.background = "#2f6bff"; pad.textContent = ms + " ms – " + L("nochmal?", "encore ?"); var bb = best("reak"); if (!bb || ms < bb) st("reak", ms); head(); }
  };
  head();
}

return { start: start };
})();
