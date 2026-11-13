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

function start(){
  root = $("#lab");
  var m = el("div", "crumb");
  m.innerHTML = '<a href="index.html">Oratio Place</a> › Oratio Lab';
  root.appendChild(m);
  root.appendChild(el("div", "lhero", '<div class="lic">🔬</div><div><h1>Oratio Lab</h1><p>' + L("Probieren, bauen, kaputtmachen – ohne Risiko. Alles läuft live in deinem Browser.", "Essayer, construire, casser – sans risque. Tout tourne en direct dans ton navigateur.") + '</p></div>'));
  var tb = el("div", "ltabs"); tb.id = "ltabs";
  TABS.forEach(function(t){ var b = el("button", "", t[1] + " " + t[2]); b.dataset.t = t[0]; b.onclick = function(){ location.hash = t[0]; }; tb.appendChild(b); });
  root.appendChild(tb);
  body = el("div"); root.appendChild(body);
  window.addEventListener("hashchange", route);
  route();
}
function route(){
  var h = location.hash.replace("#", "") || "start";
  if (!MODS[h]) h = "start";
  if (MODS[cur] && MODS[cur].stop) MODS[cur].stop();
  cur = h; body.innerHTML = "";
  document.querySelectorAll("#ltabs button").forEach(function(b){ b.classList.toggle("on", b.dataset.t === h); });
  MODS[h].show(body);
  if (h !== "start") { var tb = $("#ltabs"); if (tb) { var on = tb.querySelector(".on"); if (on && on.scrollIntoView) { try { tb.scrollLeft = on.offsetLeft - 16; } catch(e){} } } }
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
  card.appendChild(pal); card.appendChild(cv);
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
  cv.addEventListener("pointerdown", function(e){ cv.setPointerCapture(e.pointerId); var c = cell(e); if (MX.tool === "fill") { if (c[0] >= 0 && c[0] < MW && c[1] >= 0 && c[1] < MH) flood(c[0], c[1]); } else { MX.draw = true; last = c; put(c[0], c[1]); } paint(); code(); });
  cv.addEventListener("pointermove", function(e){ if (!MX.draw) return; var c = cell(e); line(last, c); last = c; paint(); });
  var end = function(){ if (MX.draw) { MX.draw = false; st("matrix", MX.px); code(); } else st("matrix", MX.px); };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
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
function bline(B, x0, y0, x1, y1, v){ var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy, n = 0; while (n++ < 5000) { bset(B, x0, y0, v); if (x0 === x1 && y0 === y1) break; var e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } }
function brect(B, x0, y0, x1, y1, v){ bline(B, x0, y0, x1, y0, v); bline(B, x1, y0, x1, y1, v); bline(B, x1, y1, x0, y1, v); bline(B, x0, y1, x0, y0, v); }
function bflood(B, x, y, v){ if (x < 0 || y < 0 || x >= B.w || y >= B.h) return; var t = B.d[y * B.w + x]; if (t === v) return; var q = [[x, y]]; while (q.length) { var p = q.pop(); if (p[0] < 0 || p[1] < 0 || p[0] >= B.w || p[1] >= B.h || B.d[p[1] * B.w + p[0]] !== t) continue; B.d[p[1] * B.w + p[0]] = v; q.push([p[0] + 1, p[1]], [p[0] - 1, p[1]], [p[0], p[1] + 1], [p[0], p[1] - 1]); } }
function btext(B, x, y, t, s, v){ for (var i = 0; i < t.length; i++) { var g = glyph(t.charAt(i)); for (var c = 0; c < 5; c++) for (var r = 0; r < 8; r++) if ((g[c] >> r) & 1) for (var a = 0; a < s; a++) for (var b2 = 0; b2 < s; b2++) bset(B, x + (i * 6 + c) * s + a, y + r * s + b2, v); } }
function bcopy(B){ var n = newB(B.w, B.h); n.d.set(B.d); return n; }

var DISPS = [
  { id: "lcd1602", grp: "lcd", n: "LCD 16×2", cols: 16, rows: 2 },
  { id: "lcd2004", grp: "lcd", n: "LCD 20×4", cols: 20, rows: 4 },
  { id: "oled64", grp: "mono", n: "OLED 0,96″ 128×64", w: 128, h: 64, ctrl: "SSD1306", look: "oled" },
  { id: "oled32", grp: "mono", n: "OLED 0,91″ 128×32", w: 128, h: 32, ctrl: "SSD1306", look: "oled" },
  { id: "sh1106", grp: "mono", n: "OLED 1,3″ 128×64", w: 128, h: 64, ctrl: "SH1106", look: "oled" },
  { id: "nokia", grp: "mono", n: "Nokia 5110 84×48", w: 84, h: 48, ctrl: "PCD8544", look: "nokia" },
  { id: "st7735", grp: "color", n: "TFT 1,8″ 128×160", w: 128, h: 160, ctrl: "ST7735" },
  { id: "st7789", grp: "color", n: "TFT 1,3″ 240×240", w: 240, h: 240, ctrl: "ST7789" },
  { id: "ili9341", grp: "color", n: "TFT 2,8″ 240×320", w: 240, h: 320, ctrl: "ILI9341" },
  { id: "max8", grp: "mono", n: "LED-Matrix 8×8", w: 8, h: 8, ctrl: "MAX7219", look: "led", mods: 1 },
  { id: "max32", grp: "mono", n: "LED-Matrix 32×8 (4 Module)", w: 32, h: 8, ctrl: "MAX7219", look: "led", mods: 4 },
  { id: "tm1637", grp: "seg", n: "7-Segment 4-stellig", ctrl: "TM1637" }
];
var GRPN = { lcd: L("Zeichen-LCD", "LCD à caractères"), mono: L("Pixel · Schwarz-Weiß", "Pixels · monochrome"), color: L("Pixel · Farbe (TFT)", "Pixels · couleur (TFT)"), seg: L("Segmentanzeige", "Afficheur 7 segments") };
var BOARDS = [["uno", "Arduino Uno"], ["esp32", "ESP32"], ["pi", "Raspberry Pi"]];
var FLASH = { uno: 30720, esp32: 1310720, pi: Infinity };
var DD = { sel: "lcd1602", board: "uno", S: {}, loaded: false };
function dget(id){ for (var i = 0; i < DISPS.length; i++) if (DISPS[i].id === id) return DISPS[i]; return DISPS[0]; }
function dinit(d){
  if (DD.S[d.id]) return DD.S[d.id];
  var S;
  if (d.grp === "lcd") { var cc = []; for (var i = 0; i < 8; i++) cc.push([0, 0, 0, 0, 0, 0, 0, 0]); cc[0] = [0, 10, 31, 31, 31, 14, 4, 0]; cc[1] = [4, 14, 14, 14, 31, 0, 4, 0];
    S = { look: "blue", cc: cc, slot: 0, lines: d.rows === 2 ? ["Hallo Oratio!", "{0} Oratio Lab {1}"] : ["Hallo Oratio!", "{0} Oratio Lab {1}", "Zeile 3", "Zeile 4"] }; }
  else if (d.grp === "seg") S = { t: "12:34" };
  else S = { mode: "draw", B: newB(d.w, d.h), tool: "pen", col: "#ff3b3b", ent: [{ t: "Hallo!", x: 0, y: 0, s: d.w >= 100 ? 2 : 1, c: "#ffffff" }], inv: false, thr: 128, dith: true, stretch: false, oledc: "white", img: null };
  DD.S[d.id] = S; return S;
}
function dsave(){
  var o = { sel: DD.sel, board: DD.board, S: {} };
  DISPS.forEach(function(d){ var S = DD.S[d.id]; if (!S) return;
    if (d.grp === "mono") o.S[d.id] = { mode: S.mode, tool: S.tool, ent: S.ent, px: Array.prototype.join.call(S.B.d, "") , oledc: S.oledc };
    else if (d.grp === "color") o.S[d.id] = { mode: S.mode, ent: S.ent, col: S.col };
    else o.S[d.id] = S; });
  st("disp", o);
}
function dload(){
  if (DD.loaded) return; DD.loaded = true; var o = sv("disp"); if (!o) return;
  DD.sel = o.sel || DD.sel; DD.board = o.board || DD.board;
  DISPS.forEach(function(d){ var p = o.S && o.S[d.id]; if (!p) return; var S = dinit(d);
    if (d.grp === "mono") { S.mode = p.mode || "draw"; S.tool = p.tool || "pen"; S.ent = p.ent || S.ent; S.oledc = p.oledc || "white"; if (p.px && p.px.length === d.w * d.h) for (var i = 0; i < p.px.length; i++) S.B.d[i] = p.px.charAt(i) === "1" ? 1 : 0; }
    else if (d.grp === "color") { S.mode = p.mode || "draw"; S.ent = p.ent || S.ent; S.col = p.col || S.col; }
    else if (d.grp === "lcd") { S.look = p.look || "blue"; S.cc = p.cc || S.cc; S.lines = p.lines || S.lines; }
    else if (d.grp === "seg") S.t = p.t || S.t; });
}
function hexc(h){ return parseInt(h.slice(1), 16); }
function rgb565(n){ return ((((n >> 16) & 255) >> 3) << 11) | ((((n >> 8) & 255) >> 2) << 5) | ((n & 255) >> 3); }
function hx(n, w){ return "0x" + ("0000000" + n.toString(16)).slice(-w).toUpperCase().replace("X", "x"); }
function cstr(s){ return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"'); }
function carr(vals, per, w){ var out = []; for (var i = 0; i < vals.length; i += per) out.push("  " + vals.slice(i, i + per).map(function(v){ return "0x" + ("0000000" + v.toString(16)).slice(-w).toUpperCase(); }).join(", ")); return out.join(",\n"); }
function packMono(B, lsb){ var bw = Math.ceil(B.w / 8), out = []; for (var y = 0; y < B.h; y++) for (var bx = 0; bx < bw; bx++) { var by = 0; for (var k = 0; k < 8; k++) { var x = bx * 8 + k, bit = x < B.w && B.d[y * B.w + x] ? 1 : 0; by |= lsb ? bit << k : bit << (7 - k); } out.push(by); } return { bytes: out, bw: bw }; }
function curB(d, S){
  if (S.mode !== "text") return S.B;
  var T = newB(d.w, d.h); S.ent.forEach(function(e){ btext(T, e.x, e.y, e.t, e.s, d.grp === "color" ? hexc(e.c) : 1); }); return T;
}

/* ----- Zeichen-LCD ----- */
function lcdCells(d, S){
  var rowsOut = [];
  for (var r = 0; r < d.rows; r++) { var line = S.lines[r] || "", cells = [], i = 0;
    while (i < line.length && cells.length < d.cols) {
      var m = line.slice(i).match(/^\{([0-7])\}/);
      if (m) { cells.push({ cc: +m[1], g: S.cc[+m[1]] }); i += 3; } else { cells.push({ ch: line.charAt(i), g: glyphRows(line.charAt(i)) }); i++; }
    }
    while (cells.length < d.cols) cells.push({ ch: " ", g: glyphRows(" ") });
    rowsOut.push(cells); }
  return rowsOut;
}
function paintLCD(cv, d, S){
  var p = 5, cw = 5 * (p + 1) + 5, ch = 8 * (p + 1) + 6, pad = 22;
  cv.width = d.cols * cw + pad * 2; cv.height = d.rows * ch + pad * 2;
  var c = cv.getContext("2d"), green = S.look === "green";
  c.fillStyle = "#1b1f27"; c.fillRect(0, 0, cv.width, cv.height);
  c.fillStyle = green ? "#aac43a" : "#1f4fd1"; c.fillRect(8, 8, cv.width - 16, cv.height - 16);
  var cells = lcdCells(d, S);
  for (var r = 0; r < d.rows; r++) for (var q = 0; q < d.cols; q++) {
    var ce = cells[r][q], ox = pad + q * cw, oy = pad + r * ch;
    for (var y = 0; y < 8; y++) for (var x = 0; x < 5; x++) { var on = (ce.g[y] >> (4 - x)) & 1; c.fillStyle = on ? (green ? "#16210a" : "#f2f8ff") : (green ? "rgba(70,95,10,.22)" : "rgba(0,20,110,.35)"); c.fillRect(ox + x * (p + 1), oy + y * (p + 1), p, p); }
  }
}
function viewLCD(area, d, S, upd){
  var card = el("div", "lcard"); area.appendChild(card);
  var cv = el("canvas", "mcv"); cv.style.background = "none"; cv.style.border = "0"; cv.style.imageRendering = "auto"; cv.style.maxWidth = d.cols === 16 ? "760px" : "880px"; card.appendChild(cv);
  card.appendChild(el("p", "lmut", L("Jedes Zeichen besteht aus 5 × 8 Punkten. Schreib deinen Text in die Zeilen. Mit {0} bis {7} setzt du ein selbst gemaltes Zeichen ein. Umlaute und Sonderzeichen hat der Standard-Zeichensatz nicht (hier als „?“).", "Chaque caractère est fait de 5 × 8 points. Écris ton texte dans les lignes. Avec {0} à {7} tu insères un caractère dessiné par toi. Les accents ne sont pas dans le jeu standard (affichés « ? »).")));
  var last = null;
  for (var r = 0; r < d.rows; r++) (function(r){ var i = el("input"); i.type = "text"; i.value = S.lines[r] || ""; i.placeholder = L("Zeile ", "Ligne ") + (r + 1); i.style.cssText = "width:100%;margin:4px 0;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--input);color:var(--fg);font:15px ui-monospace,Menlo,Consolas,monospace"; i.autocapitalize = "off"; i.spellcheck = false; i.oninput = function(){ S.lines[r] = i.value; upd(); }; i.onfocus = function(){ last = { i: i, r: r }; }; card.appendChild(i); if (r === 0) last = { i: i, r: 0 }; })(r);
  var row = el("div", "lrow"); row.style.margin = "10px 0";
  [["blue", L("Blau / weiß", "Bleu / blanc")], ["green", L("Grün / schwarz", "Vert / noir")]].forEach(function(o){ var x = el("button", "lbtn" + (S.look === o[0] ? " on" : ""), o[1]); x.onclick = function(){ S.look = o[0]; row.querySelectorAll("button").forEach(function(y){ y.classList.remove("on"); }); x.classList.add("on"); upd(); }; row.appendChild(x); });
  card.appendChild(row);
  var h = el("h2", "", L("Eigene Zeichen (8 Plätze)", "Caractères perso (8 emplacements)")); h.style.fontSize = "17px"; card.appendChild(h);
  var grid = el("div", "lrow"); card.appendChild(grid);
  var ed = [];
  function drawCC(k){ var cc = ed[k], c = cc.getContext("2d"); c.fillStyle = "#1b1f27"; c.fillRect(0, 0, cc.width, cc.height); for (var y = 0; y < 8; y++) for (var x = 0; x < 5; x++) { c.fillStyle = (S.cc[k][y] >> (4 - x)) & 1 ? "#f2f8ff" : "#2a4fb0"; c.fillRect(2 + x * 12, 2 + y * 12, 11, 11); } c.strokeStyle = S.slot === k ? "#12c2e9" : "transparent"; c.lineWidth = 3; c.strokeRect(1, 1, cc.width - 2, cc.height - 2); }
  for (var k = 0; k < 8; k++) (function(k){ var w = el("div"); w.style.textAlign = "center"; var cc = el("canvas"); cc.width = 64; cc.height = 100; cc.style.cssText = "border-radius:8px;cursor:pointer;touch-action:none"; ed.push(cc);
    cc.onpointerdown = function(e){ var rc = cc.getBoundingClientRect(), x = Math.floor((e.clientX - rc.left) / rc.width * 64 / 12), y = Math.floor((e.clientY - rc.top) / rc.height * 100 / 12); S.slot = k; if (x >= 0 && x < 5 && y >= 0 && y < 8) S.cc[k][y] ^= 1 << (4 - x); ed.forEach(function(_, j){ drawCC(j); }); upd(); };
    var b = el("button", "lbtn", "{" + k + "}"); b.style.cssText = "margin-top:4px;min-height:32px;padding:6px 10px"; b.title = L("In die Zeile einfügen", "Insérer dans la ligne"); b.onclick = function(){ if (!last) return; last.i.value += "{" + k + "}"; S.lines[last.r] = last.i.value; upd(); };
    w.appendChild(cc); w.appendChild(el("br")); w.appendChild(b); grid.appendChild(w); drawCC(k); })(k);
  var cl = el("button", "lbtn", L("Gewähltes Zeichen leeren", "Vider le caractère choisi")); cl.style.marginTop = "8px"; cl.onclick = function(){ S.cc[S.slot] = [0, 0, 0, 0, 0, 0, 0, 0]; ed.forEach(function(_, j){ drawCC(j); }); upd(); }; card.appendChild(cl);
  return { paint: function(){ paintLCD(cv, d, S); } };
}

/* ----- Pixel-Displays (schwarz-weiß + Farbe) ----- */
function gfxScale(d){ return Math.max(1, Math.min(60, Math.floor(900 / d.w), Math.floor(700 / d.h))); }
var OLEDC = { white: "#eaf2ff", blue: "#7cc8ff", yellow: "#ffd23a" };
function paintGfx(cv, d, S, B){
  var s = gfxScale(d), c = cv.getContext("2d"); cv.width = d.w * s; cv.height = d.h * s;
  var look = d.look, x, y, v;
  if (d.grp === "color") {
    var oc = document.createElement("canvas"); oc.width = d.w; oc.height = d.h; var ox = oc.getContext("2d"), im = ox.createImageData(d.w, d.h);
    for (var i = 0; i < B.d.length; i++) { v = B.d[i]; im.data[i * 4] = (v >> 16) & 255; im.data[i * 4 + 1] = (v >> 8) & 255; im.data[i * 4 + 2] = v & 255; im.data[i * 4 + 3] = 255; }
    ox.putImageData(im, 0, 0); c.imageSmoothingEnabled = false; c.drawImage(oc, 0, 0, cv.width, cv.height); return;
  }
  var bg = look === "nokia" ? "#b7c8a0" : look === "led" ? "#190c0c" : "#000", off = look === "nokia" ? "#aebf96" : look === "led" ? "#3b1616" : "#07090d", on = look === "nokia" ? "#222c1b" : look === "led" ? "#ff3030" : OLEDC[S.oledc || "white"];
  c.fillStyle = bg; c.fillRect(0, 0, cv.width, cv.height);
  for (y = 0; y < d.h; y++) for (x = 0; x < d.w; x++) { var lit = B.d[y * d.w + x] ? 1 : 0;
    if (look === "led") { c.fillStyle = lit ? on : off; c.beginPath(); c.arc(x * s + s / 2, y * s + s / 2, s * 0.38, 0, 7); c.fill(); }
    else if (s >= 4) { c.fillStyle = lit ? on : off; c.fillRect(x * s, y * s, s - 1, s - 1); }
    else if (lit) { c.fillStyle = on; c.fillRect(x * s, y * s, s, s); } }
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
  var mb = el("div", "lrow"); mb.style.marginBottom = "10px"; card.appendChild(mb);
  var body = el("div"); card.appendChild(body);
  [["draw", "✏️ " + L("Zeichnen / Bild", "Dessin / image")], ["text", "🔤 " + L("Text schreiben", "Écrire du texte")]].forEach(function(o){ var x = el("button", "lbtn" + (S.mode === o[0] ? " on" : ""), o[1]); x.onclick = function(){ S.mode = o[0]; mb.querySelectorAll("button").forEach(function(y){ y.classList.remove("on"); }); x.classList.add("on"); build(); upd(); }; mb.appendChild(x); });
  var cv, ref = {};
  function pxAt(e){ var r = cv.getBoundingClientRect(); return [Math.floor((e.clientX - r.left) / r.width * d.w), Math.floor((e.clientY - r.top) / r.height * d.h)]; }
  function build(){
    body.innerHTML = ""; var cur = color ? hexc(S.col) : 1;
    if (S.mode === "draw") {
      var tb = el("div", "lrow"); tb.style.marginBottom = "10px"; body.appendChild(tb);
      [["pen", "✏️"], ["erase", "🧽"], ["fill", "🪣"], ["line", "／"], ["rect", "▭"]].forEach(function(t){ var x = el("button", "lbtn" + (S.tool === t[0] ? " on" : ""), t[1]); x.title = { pen: L("Stift", "Crayon"), erase: L("Radierer", "Gomme"), fill: L("Füllen", "Remplir"), line: L("Linie", "Ligne"), rect: L("Rechteck", "Rectangle") }[t[0]]; x.onclick = function(){ S.tool = t[0]; tb.querySelectorAll(".lbtn").forEach(function(y){ y.classList.remove("on"); }); x.classList.add("on"); }; tb.appendChild(x); });
      if (color) { var ci = el("input"); ci.type = "color"; ci.value = S.col; ci.style.cssText = "width:46px;height:40px;border:1px solid var(--line);border-radius:10px;padding:2px;background:none"; ci.oninput = function(){ S.col = ci.value; }; tb.appendChild(ci); }
      if (d.look === "oled") [["white", L("weiß", "blanc")], ["blue", L("blau", "bleu")], ["yellow", L("gelb", "jaune")]].forEach(function(o){ var x = el("button", "lbtn" + (S.oledc === o[0] ? " on" : ""), o[1]); x.onclick = function(){ S.oledc = o[0]; upd(); tb.querySelectorAll(".oc").forEach(function(y){ y.classList.remove("on"); }); x.classList.add("on"); }; x.classList.add("oc"); tb.appendChild(x); });
      var clr = el("button", "lbtn bad", L("Leeren", "Effacer")); clr.onclick = function(){ S.B.d.fill(0); upd(); }; tb.appendChild(clr);
      if (!color) { var iv = el("button", "lbtn", L("Invertieren", "Inverser")); iv.onclick = function(){ for (var i = 0; i < S.B.d.length; i++) S.B.d[i] = S.B.d[i] ? 0 : 1; upd(); }; tb.appendChild(iv); }
    } else {
      var lst = el("div"); body.appendChild(lst);
      function rows(){ lst.innerHTML = ""; S.ent.forEach(function(e, k){ var r = el("div", "lrow"); r.style.marginBottom = "8px";
        var t = el("input"); t.type = "text"; t.value = e.t; t.style.cssText = "flex:1;min-width:120px;padding:9px;border:1px solid var(--line);border-radius:10px;background:var(--input);color:var(--fg)"; t.oninput = function(){ e.t = t.value; upd(); };
        function num(lbl, key, max){ var w = el("label", "lmut", lbl + " "); var n = el("input"); n.type = "number"; n.min = 0; n.max = max; n.value = e[key]; n.style.cssText = "width:62px;padding:8px;border:1px solid var(--line);border-radius:10px;background:var(--input);color:var(--fg)"; n.oninput = function(){ e[key] = Math.max(key === "s" ? 1 : 0, Math.min(max, +n.value || 0)); upd(); }; w.appendChild(n); return w; }
        r.appendChild(t); r.appendChild(num("x", "x", d.w)); r.appendChild(num("y", "y", d.h)); r.appendChild(num(L("Größe", "Taille"), "s", 6));
        if (color) { var ci = el("input"); ci.type = "color"; ci.value = e.c; ci.style.cssText = "width:42px;height:38px;border:1px solid var(--line);border-radius:8px;padding:2px;background:none"; ci.oninput = function(){ e.c = ci.value; upd(); }; r.appendChild(ci); }
        var dl = el("button", "lbtn bad", "✕"); dl.onclick = function(){ S.ent.splice(k, 1); rows(); upd(); }; r.appendChild(dl); lst.appendChild(r); }); }
      rows();
      var ad = el("button", "lbtn", "+ " + L("Textzeile", "Ligne de texte")); ad.onclick = function(){ var ly = S.ent.length ? S.ent[S.ent.length - 1].y + 8 * S.ent[S.ent.length - 1].s + 2 : 0; S.ent.push({ t: "Text", x: 0, y: Math.min(ly, d.h - 8), s: 1, c: "#ffffff" }); rows(); upd(); }; body.appendChild(ad);
      body.appendChild(el("p", "lmut", L("Die Schrift hat 5 × 7 Punkte (Größe 1). Größe 2 macht jeden Punkt zu 2 × 2 Punkten. x/y ist die linke obere Ecke in Pixeln.", "La police fait 5 × 7 points (taille 1). Taille 2 = chaque point devient 2 × 2. x/y = coin supérieur gauche en pixels.")));
    }
    cv = el("canvas", "mcv"); cv.style.maxWidth = (d.w * gfxScale(d)) + "px"; cv.style.imageRendering = "pixelated"; body.appendChild(cv);
    if (S.mode === "draw") {
      var drag = null, snap = null;
      cv.onpointerdown = function(e){ cv.setPointerCapture(e.pointerId); var p = pxAt(e); cur = color ? hexc(S.col) : 1; var val = S.tool === "erase" ? 0 : cur;
        if (S.tool === "fill") { bflood(S.B, p[0], p[1], cur); upd(); return; }
        drag = { p0: p, last: p, val: val }; snap = bcopy(S.B); if (S.tool === "pen" || S.tool === "erase") { bset(S.B, p[0], p[1], val); } upd(); };
      cv.onpointermove = function(e){ if (!drag) return; var p = pxAt(e);
        if (S.tool === "pen" || S.tool === "erase") { bline(S.B, drag.last[0], drag.last[1], p[0], p[1], drag.val); drag.last = p; }
        else { S.B.d.set(snap.d); if (S.tool === "line") bline(S.B, drag.p0[0], drag.p0[1], p[0], p[1], drag.val); else brect(S.B, drag.p0[0], drag.p0[1], p[0], p[1], drag.val); }
        upd(true); };
      var end = function(){ if (drag) { drag = null; upd(); } };
      cv.onpointerup = end; cv.onpointercancel = end;
      var ib = el("div", "lrow"); ib.style.margin = "12px 0 0"; body.appendChild(ib);
      var fi = el("input"); fi.type = "file"; fi.accept = "image/*"; fi.hidden = true;
      var up = el("button", "lbtn pri", "🖼️ " + L("Bild hochladen (z. B. Mario)", "Importer une image (ex. Mario)")); up.onclick = function(){ fi.click(); };
      fi.onchange = function(){ var f = fi.files && fi.files[0]; if (!f) return; var im = new Image(); im.onload = function(){ S.img = im; importImg(d, S); upd(); sl.hidden = false; }; im.src = URL.createObjectURL(f); fi.value = ""; };
      ib.appendChild(up); ib.appendChild(fi);
      var sl = el("div", "lrow"); sl.style.marginTop = "8px"; sl.hidden = !S.img; body.appendChild(sl);
      function re(){ importImg(d, S); upd(); }
      if (!color) {
        var lb = el("label", "lmut", L("Helligkeitsschwelle ", "Seuil de luminosité ")), rg = el("input"); rg.type = "range"; rg.min = 10; rg.max = 245; rg.value = S.thr; rg.oninput = function(){ S.thr = +rg.value; re(); }; lb.appendChild(rg); sl.appendChild(lb);
        var dc = el("label", "lmut"), dk = el("input"); dk.type = "checkbox"; dk.checked = S.dith; dk.onchange = function(){ S.dith = dk.checked; re(); }; dc.appendChild(dk); dc.appendChild(document.createTextNode(" " + L("Raster (Dithering) für Grautöne", "Tramage (dithering) pour les gris"))); sl.appendChild(dc);
        var ic = el("label", "lmut"), ik = el("input"); ik.type = "checkbox"; ik.checked = S.inv; ik.onchange = function(){ S.inv = ik.checked; re(); }; ic.appendChild(ik); ic.appendChild(document.createTextNode(" " + L("Hell/Dunkel tauschen", "Inverser clair/sombre"))); sl.appendChild(ic);
      }
      var sc = el("label", "lmut"), sk = el("input"); sk.type = "checkbox"; sk.checked = S.stretch; sk.onchange = function(){ S.stretch = sk.checked; re(); }; sc.appendChild(sk); sc.appendChild(document.createTextNode(" " + L("Bild strecken (statt einpassen)", "Étirer l’image (au lieu d’ajuster)"))); sl.appendChild(sc);
    }
    ref.cv = cv;
  }
  build();
  var pb = el("div", "lrow"); pb.style.marginTop = "10px"; card.appendChild(pb);
  var png = el("button", "lbtn", L("Als PNG speichern (1:1)", "Enregistrer en PNG (1:1)")); png.onclick = function(){ var B = curB(d, S), oc = document.createElement("canvas"); oc.width = d.w; oc.height = d.h; var x = oc.getContext("2d"), im = x.createImageData(d.w, d.h); for (var i = 0; i < B.d.length; i++) { var v = B.d[i], r, g, b; if (color) { r = (v >> 16) & 255; g = (v >> 8) & 255; b = v & 255; } else { r = g = b = v ? 255 : 0; } im.data[i * 4] = r; im.data[i * 4 + 1] = g; im.data[i * 4 + 2] = b; im.data[i * 4 + 3] = 255; } x.putImageData(im, 0, 0); oc.toBlob(function(bl){ if (bl) save("bild_" + d.w + "x" + d.h + ".png", bl); }); }; pb.appendChild(png);
  return { paint: function(){ if (ref.cv) paintGfx(ref.cv, d, S, curB(d, S)); } };
}

/* ----- 7-Segment ----- */
var SEG = { "0": 0x3F, "1": 0x06, "2": 0x5B, "3": 0x4F, "4": 0x66, "5": 0x6D, "6": 0x7D, "7": 0x07, "8": 0x7F, "9": 0x6F, "-": 0x40, " ": 0, "_": 0x08, A: 0x77, B: 0x7C, C: 0x39, D: 0x5E, E: 0x79, F: 0x71, H: 0x76, L: 0x38, N: 0x54, O: 0x5C, P: 0x73, R: 0x50, S: 0x6D, T: 0x78, U: 0x3E };
function segData(t){ var out = [0, 0, 0, 0], k = 0, colon = false; for (var i = 0; i < t.length && k < 4; i++) { var ch = t.charAt(i).toUpperCase(); if (ch === ":" || ch === ".") { if (ch === ":") colon = true; else if (k > 0) out[k - 1] |= 0x80; continue; } out[k++] = SEG[ch] || 0; } if (colon) out[1] |= 0x80; return out; }
function paintSeg(cv, S){
  var data = segData(S.t); cv.width = 520; cv.height = 220; var c = cv.getContext("2d");
  c.fillStyle = "#120808"; c.fillRect(0, 0, 520, 220);
  var polys = [[[16, 12], [88, 12], [76, 26], [28, 26]], [[92, 16], [92, 90], [78, 78], [78, 28]], [[92, 100], [92, 174], [78, 162], [78, 112]], [[88, 178], [16, 178], [28, 164], [76, 164]], [[12, 174], [12, 100], [26, 112], [26, 162]], [[12, 90], [12, 16], [26, 28], [26, 78]], [[18, 95], [86, 95], [76, 107], [28, 107]]];
  for (var dg = 0; dg < 4; dg++) { var ox = 20 + dg * 118, oy = 16;
    polys.forEach(function(p, s){ c.fillStyle = (data[dg] >> s) & 1 ? "#ff3a2a" : "#3a1512"; c.beginPath(); p.forEach(function(q, i){ i ? c.lineTo(ox + q[0], oy + q[1]) : c.moveTo(ox + q[0], oy + q[1]); }); c.closePath(); c.fill(); });
    if (dg === 1) { c.fillStyle = data[1] & 0x80 ? "#ff3a2a" : "#3a1512"; c.beginPath(); c.arc(ox + 112, oy + 60, 7, 0, 7); c.fill(); c.beginPath(); c.arc(ox + 112, oy + 130, 7, 0, 7); c.fill(); }
    else { c.fillStyle = (data[dg] & 0x80) ? "#ff3a2a" : "#3a1512"; c.beginPath(); c.arc(ox + 104, oy + 172, 6, 0, 7); c.fill(); } }
}
function viewSeg(area, d, S, upd){
  var card = el("div", "lcard"); area.appendChild(card);
  var cv = el("canvas", "mcv"); cv.style.maxWidth = "520px"; card.appendChild(cv);
  var i = el("input"); i.type = "text"; i.value = S.t; i.maxLength = 8; i.style.cssText = "display:block;margin:12px 0;width:200px;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--input);color:var(--fg);font:20px ui-monospace,Menlo,Consolas,monospace"; i.oninput = function(){ S.t = i.value; upd(); };
  card.appendChild(i);
  card.appendChild(el("p", "lmut", L("Tippe 4 Zeichen, z. B. 12:34 (der Doppelpunkt schaltet die Mitte ein), -.5 oder HELP. Möglich: Ziffern, - _ und die Buchstaben A B C D E F H L N O P R S T U.", "Tape 4 caractères, ex. 12:34 (les deux-points allument le milieu), -.5 ou HELP. Possible : chiffres, - _ et les lettres A B C D E F H L N O P R S T U.")));
  return { paint: function(){ paintSeg(cv, S); } };
}

/* ----- Anschluss-Infos ----- */
function pinsFor(d, b){
  var i2c = b === "uno" ? "SDA = A4, SCL = A5" : b === "esp32" ? "SDA = GPIO 21, SCL = GPIO 22" : "SDA = GPIO 2 (Pin 3), SCL = GPIO 3 (Pin 5), I²C aktivieren: sudo raspi-config";
  var spi = b === "uno" ? "SCK = 13, MOSI = 11" : b === "esp32" ? "SCK = 18, MOSI = 23" : "SCLK = GPIO 11, MOSI = GPIO 10, CE0 = GPIO 8 (SPI aktivieren)";
  var o = { t: [], w: [] };
  if (d.grp === "lcd") { o.t.push("I²C-Backpack (PCF8574): " + i2c, "VCC = 5 V, GND = GND, Adresse meist 0x27 (oder 0x3F)"); if (b !== "uno") o.w.push(L("Das LCD braucht 5 V. Am " + (b === "pi" ? "Raspberry Pi" : "ESP32") + " ist I²C aber 3,3 V: Pegelwandler nutzen oder Pull-ups des Backpacks prüfen, sonst kann der Pin Schaden nehmen.", "Le LCD veut 5 V mais l’I²C du " + (b === "pi" ? "Raspberry Pi" : "ESP32") + " est en 3,3 V : utilise un convertisseur de niveau, sinon risque pour la broche.")); }
  else if (d.ctrl === "SSD1306" || d.ctrl === "SH1106") { o.t.push("I²C: " + i2c, "VCC = 3,3 V (oder 5 V je nach Modul), Adresse meist 0x3C"); if (b === "uno" && d.h >= 64) o.w.push(L("128×64 braucht im Uno 1 KB RAM von nur 2 KB – knapp, aber machbar.", "128×64 utilise 1 Ko des 2 Ko de RAM de l’Uno – juste, mais possible.")); }
  else if (d.ctrl === "PCD8544") { o.t.push(b === "uno" ? "CLK = 7, DIN = 6, DC = 5, CE = 4, RST = 3" : b === "esp32" ? "CLK = 18, DIN = 23, DC = 19, CE = 5, RST = 4" : "SPI: " + spi + ", DC = GPIO 25, RST = GPIO 27", "VCC = 3,3 V (Display), Hintergrundlicht über 330 Ω"); if (b === "uno") o.w.push(L("Das Nokia-Display verträgt nur 3,3 V an den Datenpins. Am Uno 5 V: Widerstände (z. B. 10 kΩ + 20 kΩ Teiler) oder Pegelwandler.", "L’écran Nokia ne supporte que 3,3 V sur les données. Sur l’Uno 5 V : diviseur de tension ou convertisseur de niveau.")); }
  else if (d.grp === "color") { o.t.push(b === "uno" ? "CS = 10, DC = 9, RST = 8, " + spi : b === "esp32" ? "CS = 5, DC = 2, RST = 4, " + spi : "SPI: " + spi + ", DC = GPIO 25, RST = GPIO 27", "VCC = 3,3 V, LED/BL = 3,3 V"); if (b === "uno") o.w.push(L("TFTs sind 3,3-V-Geräte. Am Uno mit 5 V brauchst du Pegelwandler oder Vorwiderstände an den Datenleitungen.", "Les TFT sont en 3,3 V. Sur l’Uno 5 V il faut un convertisseur ou des résistances sur les lignes de données.")); }
  else if (d.ctrl === "MAX7219") o.t.push(b === "uno" ? "DIN = 12, CLK = 11, CS = 10" : b === "esp32" ? "DIN = 23, CLK = 18, CS = 5" : "SPI: " + spi, "VCC = 5 V, GND = GND");
  else if (d.ctrl === "TM1637") o.t.push(b === "uno" ? "CLK = 2, DIO = 3" : b === "esp32" ? "CLK = 18, DIO = 19" : "CLK = GPIO 23, DIO = GPIO 24", "VCC = 5 V (3,3 V geht oft auch)");
  return o;
}
var LIBS = { uno: { lcd: "LiquidCrystal_I2C", ssd1306: "Adafruit SSD1306 + Adafruit GFX", sh1106: "U8g2", pcd8544: "Adafruit PCD8544 + Adafruit GFX", st7735: "Adafruit ST7735 + Adafruit GFX", st7789: "Adafruit ST7789 + Adafruit GFX", ili9341: "Adafruit ILI9341 + Adafruit GFX", max7219: "LedControl", tm1637: "TM1637 (avishorp)" } };
var PYLIBS = { lcd: "RPLCD smbus2", ssd1306: "luma.oled", sh1106: "luma.oled", pcd8544: "luma.lcd", st7735: "luma.lcd", st7789: "luma.lcd", ili9341: "luma.lcd", max7219: "luma.led_matrix", tm1637: "raspberrypi-tm1637" };
function libOf(d){ return d.grp === "lcd" ? "lcd" : d.grp === "seg" ? "tm1637" : d.ctrl.toLowerCase(); }
function sizeBytes(d, S){ if (d.grp === "color") return d.w * d.h * 2; if (d.grp === "mono") return Math.ceil(d.w / 8) * d.h; return 0; }

/* ----- Code-Erzeugung ----- */
function genCode(d, S, b){
  var py = b === "pi", t = "", ext = py ? "py" : "ino";
  var textual = (d.grp === "mono" || d.grp === "color") && S.mode === "text" && d.ctrl !== "MAX7219";
  var cur = d.grp === "mono" || d.grp === "color" ? curB(d, S) : null;
  var head = (py ? "#!/usr/bin/env python3\n# " : "// ") + "Oratio Lab – " + d.n + " · " + (b === "uno" ? "Arduino Uno" : b === "esp32" ? "ESP32" : "Raspberry Pi") + "\n";
  var cm = py ? "# " : "// ";
  if (d.grp === "lcd") {
    var cells = lcdCells(d, S), used = {}, lines = [];
    for (var r = 0; r < d.rows; r++) { var ln = S.lines[r] || "", segs = [], cur2 = "", i = 0;
      while (i < ln.length) { var m = ln.slice(i).match(/^\{([0-7])\}/); if (m) { if (cur2) segs.push({ s: cur2 }); cur2 = ""; segs.push({ c: +m[1] }); used[+m[1]] = 1; i += 3; } else { var chh = ln.charAt(i); cur2 += (chh.charCodeAt(0) < 32 || chh.charCodeAt(0) > 126) ? "?" : chh; i++; } }
      if (cur2) segs.push({ s: cur2 }); lines.push(segs); }
    if (!py) {
      t = head + "// Bibliothek: LiquidCrystal_I2C (Bibliotheksverwalter)\n#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n\nLiquidCrystal_I2C lcd(0x27, " + d.cols + ", " + d.rows + ");   // Adresse 0x27 oder 0x3F\n\n";
      Object.keys(used).forEach(function(k){ t += "byte zeichen" + k + "[8] = { " + S.cc[k].map(function(v){ return "0b" + ("00000" + v.toString(2)).slice(-5); }).join(", ") + " };\n"; });
      t += "\nvoid setup() {\n" + (b === "esp32" ? "  Wire.begin(21, 22);   // SDA, SCL\n" : "") + "  lcd.init();\n  lcd.backlight();\n";
      Object.keys(used).forEach(function(k){ t += "  lcd.createChar(" + k + ", zeichen" + k + ");\n"; });
      lines.forEach(function(sg, r2){ if (!sg.length) return; t += "  lcd.setCursor(0, " + r2 + ");\n"; sg.forEach(function(x){ t += x.s !== undefined ? '  lcd.print("' + cstr(x.s) + '");\n' : "  lcd.write(byte(" + x.c + "));\n"; }); });
      t += "}\n\nvoid loop() {\n}\n";
    } else {
      t = head + "# Installieren: pip install RPLCD smbus2   (I²C aktivieren nicht vergessen)\nfrom RPLCD.i2c import CharLCD\n\nlcd = CharLCD('PCF8574', 0x27, cols=" + d.cols + ", rows=" + d.rows + ")   # Adresse 0x27 oder 0x3F\n\n";
      Object.keys(used).forEach(function(k){ t += "lcd.create_char(" + k + ", (" + S.cc[k].map(function(v){ return "0b" + ("00000" + v.toString(2)).slice(-5); }).join(", ") + "))\n"; });
      lines.forEach(function(sg, r2){ if (!sg.length) return; t += "lcd.cursor_pos = (" + r2 + ", 0)\nlcd.write_string(\"" + sg.map(function(x){ return x.s !== undefined ? cstr(x.s) : "\\x0" + x.c; }).join("") + "\")\n"; });
    }
    return { txt: t, ext: ext };
  }
  if (d.grp === "seg") {
    var dt = segData(S.t), arr = dt.map(function(v){ return hx(v, 2); }).join(", ");
    if (!py) t = head + "// Bibliothek: TM1637 von Avishay Orpaz (Bibliotheksverwalter)\n#include <TM1637Display.h>\n\n#define CLK " + (b === "uno" ? 2 : 18) + "\n#define DIO " + (b === "uno" ? 3 : 19) + "\nTM1637Display display(CLK, DIO);\n\n// Segmente: Bit0 = a (oben) ... Bit6 = g (Mitte), Bit7 = Punkt/Doppelpunkt\nconst uint8_t daten[] = { " + arr + " };\n\nvoid setup() {\n  display.setBrightness(7);   // 0 bis 7\n  display.setSegments(daten);\n}\n\nvoid loop() {\n}\n";
    else t = head + "# Installieren: pip install raspberrypi-tm1637\nimport tm1637\n\ntm = tm1637.TM1637(clk=23, dio=24)\ntm.brightness(7)   # 0 bis 7\n# Segmente: Bit0 = a (oben) ... Bit6 = g (Mitte), Bit7 = Punkt/Doppelpunkt\ndaten = [" + arr + "]\ntm.write(daten)\n";
    return { txt: t, ext: ext };
  }
  var W = d.w, H = d.h, ctrl = d.ctrl, col = d.grp === "color";
  if (py) {
    var dev = { SSD1306: "from luma.core.interface.serial import i2c\nfrom luma.oled.device import ssd1306\nserial = i2c(port=1, address=0x3C)\ndevice = ssd1306(serial, width=" + W + ", height=" + H + ")", SH1106: "from luma.core.interface.serial import i2c\nfrom luma.oled.device import sh1106\nserial = i2c(port=1, address=0x3C)\ndevice = sh1106(serial)", PCD8544: "from luma.core.interface.serial import spi\nfrom luma.lcd.device import pcd8544\nserial = spi(port=0, device=0, gpio_DC=25, gpio_RST=27)\ndevice = pcd8544(serial)", ST7735: "from luma.core.interface.serial import spi\nfrom luma.lcd.device import st7735\nserial = spi(port=0, device=0, gpio_DC=25, gpio_RST=27)\ndevice = st7735(serial, width=128, height=160)", ST7789: "from luma.core.interface.serial import spi\nfrom luma.lcd.device import st7789\nserial = spi(port=0, device=0, gpio_DC=25, gpio_RST=27)\ndevice = st7789(serial, width=240, height=240)", ILI9341: "from luma.core.interface.serial import spi\nfrom luma.lcd.device import ili9341\nserial = spi(port=0, device=0, gpio_DC=25, gpio_RST=27)\ndevice = ili9341(serial, width=240, height=320)", MAX7219: "from luma.core.interface.serial import spi, noop\nfrom luma.led_matrix.device import max7219\nserial = spi(port=0, device=0, gpio=noop())\ndevice = max7219(serial, cascaded=" + (d.mods || 1) + ", block_orientation=0)   # bei gedrehter Anzeige: 90 / -90" }[ctrl];
    t = head + "# Installieren: pip install " + PYLIBS[libOf(d)] + "\nimport time\n" + dev + "\n\n";
    if (textual) { t += "from luma.core.render import canvas\nfrom PIL import ImageFont\n\n" + (col ? "" : "") + "with canvas(device) as draw:\n";
      S.ent.forEach(function(e){ var f = e.s > 1 ? "ImageFont.load_default(size=" + (8 * e.s) + ")" : "ImageFont.load_default()"; t += "    draw.text((" + e.x + ", " + e.y + "), \"" + cstr(e.t) + "\", fill=" + (col ? "(" + ((hexc(e.c) >> 16) & 255) + ", " + ((hexc(e.c) >> 8) & 255) + ", " + (hexc(e.c) & 255) + ")" : "\"white\"") + ", font=" + f + ")\n"; });
      if (!S.ent.length) t += "    pass\n";
      t += "\ntry:\n    while True:\n        time.sleep(1)\nexcept KeyboardInterrupt:\n    pass\n";
    } else if (col) { t += "from PIL import Image\n\n" + cm + "Speichere dein Bild mit \"Als PNG speichern (1:1)\" unter bild.png neben dieses Skript.\nbild = Image.open(\"bild.png\").convert(\"RGB\")\ndevice.display(bild)\n\ntry:\n    while True:\n        time.sleep(1)\nexcept KeyboardInterrupt:\n    pass\n"; }
    else { var rowsP = []; for (var y = 0; y < H; y++) { var s2 = ""; for (var x = 0; x < W; x++) s2 += cur.d[y * W + x] ? "#" : "."; rowsP.push('    "' + s2 + '"'); }
      t += "from PIL import Image\n\n# '#' = Pixel an, '.' = Pixel aus\nBILD = [\n" + rowsP.join(",\n") + "\n]\n\nbild = Image.new(\"1\", (" + W + ", " + H + "))\nfor y, zeile in enumerate(BILD):\n    for x, c in enumerate(zeile):\n        if c == \"#\":\n            bild.putpixel((x, y), 1)\ndevice.display(bild)\n\ntry:\n    while True:\n        time.sleep(1)\nexcept KeyboardInterrupt:\n    pass\n"; }
    return { txt: t, ext: ext };
  }
  var sda = b === "esp32" ? "  Wire.begin(21, 22);   // SDA, SCL\n" : "";
  if (ctrl === "MAX7219") {
    var pk = packMono(cur, false), n = d.mods, pins = b === "uno" ? "12, 11, 10" : "23, 18, 5";
    t = head + "// Bibliothek: LedControl (Bibliotheksverwalter)\n#include <LedControl.h>\n\nLedControl lc = LedControl(" + pins + ", " + n + ");   // DIN, CLK, CS, Anzahl Module\n\n// Pro Zeile ein Byte (Bit7 = linke Spalte). " + (n > 1 ? "Je Zeile " + n + " Bytes: Modul 0 = das am Eingang (DIN).\n" : "\n") + "const byte bild[" + H + "][" + n + "] = {\n" + (function(){ var o = []; for (var y2 = 0; y2 < H; y2++) o.push("  { " + pk.bytes.slice(y2 * pk.bw, y2 * pk.bw + pk.bw).map(function(v){ return hx(v, 2); }).join(", ") + " }"); return o.join(",\n"); })() + "\n};\n\nvoid setup() {\n  for (int m = 0; m < " + n + "; m++) {\n    lc.shutdown(m, false);\n    lc.setIntensity(m, 8);   // 0 bis 15\n    lc.clearDisplay(m);\n  }\n  for (int y = 0; y < 8; y++)\n    for (int m = 0; m < " + n + "; m++)\n      lc.setRow(m, y, bild[y][m]);   // wenn gespiegelt: Module oder Bits tauschen\n}\n\nvoid loop() {\n}\n";
    return { txt: t, ext: ext };
  }
  // Pixel-Displays Arduino
  var inc = { SSD1306: "#include <SPI.h>\n#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>\n\nAdafruit_SSD1306 display(" + W + ", " + H + ", &Wire, -1);\n", SH1106: "#include <U8g2lib.h>\n\nU8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);\n", PCD8544: "#include <SPI.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_PCD8544.h>\n\n// CLK, DIN, DC, CE, RST\nAdafruit_PCD8544 display = Adafruit_PCD8544(" + (b === "uno" ? "7, 6, 5, 4, 3" : "18, 23, 19, 5, 4") + ");\n", ST7735: "#include <SPI.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_ST7735.h>\n\n#define TFT_CS  " + (b === "uno" ? 10 : 5) + "\n#define TFT_DC  " + (b === "uno" ? 9 : 2) + "\n#define TFT_RST " + (b === "uno" ? 8 : 4) + "\nAdafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);\n", ST7789: "#include <SPI.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_ST7789.h>\n\n#define TFT_CS  " + (b === "uno" ? 10 : 5) + "\n#define TFT_DC  " + (b === "uno" ? 9 : 2) + "\n#define TFT_RST " + (b === "uno" ? 8 : 4) + "\nAdafruit_ST7789 tft = Adafruit_ST7789(TFT_CS, TFT_DC, TFT_RST);\n", ILI9341: "#include <SPI.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_ILI9341.h>\n\n#define TFT_CS  " + (b === "uno" ? 10 : 5) + "\n#define TFT_DC  " + (b === "uno" ? 9 : 2) + "\n#define TFT_RST " + (b === "uno" ? 8 : 4) + "\nAdafruit_ILI9341 tft = Adafruit_ILI9341(TFT_CS, TFT_DC, TFT_RST);\n" }[ctrl];
  var libn = { SSD1306: "Adafruit SSD1306 und Adafruit GFX", SH1106: "U8g2", PCD8544: "Adafruit PCD8544 und Adafruit GFX", ST7735: "Adafruit ST7735 und Adafruit GFX", ST7789: "Adafruit ST7789 und Adafruit GFX", ILI9341: "Adafruit ILI9341 und Adafruit GFX" }[ctrl];
  t = head + "// Bibliotheken (Bibliotheksverwalter): " + libn + "\n" + inc + "\n";
  var bmp = "", init = "", body = "", obj = ctrl === "SH1106" ? "u8g2" : col ? "tft" : "display";
  if (!textual) {
    if (col) { var vals = []; for (var q = 0; q < cur.d.length; q++) vals.push(rgb565(cur.d[q])); bmp = "const uint16_t bild[" + (W * H) + "] PROGMEM = {\n" + carr(vals, 16, 4) + "\n};\n\n"; }
    else { var pk2 = packMono(cur, ctrl === "SH1106"); bmp = "const unsigned char bild[] PROGMEM = {   // " + pk2.bytes.length + " Bytes\n" + carr(pk2.bytes, 16, 2) + "\n};\n\n"; }
  }
  t += bmp;
  if (ctrl === "SSD1306") init = "  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {\n    Serial.println(F(\"SSD1306 nicht gefunden\"));\n    for (;;);\n  }\n  display.clearDisplay();\n";
  else if (ctrl === "PCD8544") init = "  display.begin();\n  display.setContrast(50);   // 40 bis 60 ausprobieren\n  display.clearDisplay();\n";
  else if (ctrl === "SH1106") init = "  u8g2.begin();\n  u8g2.clearBuffer();\n";
  else if (ctrl === "ST7735") init = "  tft.initR(INITR_BLACKTAB);   // je nach Display: INITR_GREENTAB / INITR_REDTAB\n  tft.fillScreen(0x0000);\n";
  else if (ctrl === "ST7789") init = "  tft.init(" + W + ", " + H + ");\n  tft.fillScreen(0x0000);\n";
  else init = "  tft.begin();\n  tft.fillScreen(0x0000);\n";
  if (textual) {
    S.ent.forEach(function(e){
      if (ctrl === "SH1106") { var fnt = e.s <= 1 ? "u8g2_font_6x10_tr" : e.s === 2 ? "u8g2_font_10x20_tr" : "u8g2_font_logisoso24_tr", asc = e.s <= 1 ? 8 : e.s === 2 ? 16 : 24; body += "  u8g2.setFont(" + fnt + ");\n  u8g2.drawStr(" + e.x + ", " + (e.y + asc) + ", \"" + cstr(e.t) + "\");\n"; }
      else if (col) body += "  tft.setTextSize(" + e.s + ");\n  tft.setTextColor(" + hx(rgb565(hexc(e.c)), 4) + ");\n  tft.setCursor(" + e.x + ", " + e.y + ");\n  tft.print(\"" + cstr(e.t) + "\");\n";
      else body += "  display.setTextSize(" + e.s + ");\n  display.setTextColor(" + (ctrl === "PCD8544" ? "BLACK" : "SSD1306_WHITE") + ");\n  display.setCursor(" + e.x + ", " + e.y + ");\n  display.println(\"" + cstr(e.t) + "\");\n"; });
  } else {
    if (ctrl === "SH1106") body = "  u8g2.drawXBM(0, 0, " + W + ", " + H + ", bild);\n";
    else if (col) body = "  tft.drawRGBBitmap(0, 0, bild, " + W + ", " + H + ");\n";
    else body = "  display.drawBitmap(0, 0, bild, " + W + ", " + H + ", " + (ctrl === "PCD8544" ? "BLACK" : "SSD1306_WHITE") + ");\n";
  }
  var send = ctrl === "SH1106" ? "  u8g2.sendBuffer();\n" : (!col ? "  display.display();\n" : "");
  t += "void setup() {\n" + (ctrl === "SSD1306" ? "  Serial.begin(115200);\n" : "") + sda + init + body + send + "}\n\nvoid loop() {\n}\n";
  return { txt: t, ext: ext };
}

/* ----- Oberfläche ----- */
MODS.disp = { show: function(b){
  dload();
  var top = el("div", "lcard"); b.appendChild(top);
  var h = el("h2", "", L("Display wählen", "Choisir un écran")); top.appendChild(h);
  var chips = el("div"); top.appendChild(chips);
  var brow = el("div", "lrow"); brow.style.marginTop = "10px"; top.appendChild(el("div", "lmut", L("Dein Board:", "Ta carte :")));
  top.appendChild(brow);
  var area = el("div"); area.style.marginTop = "16px"; b.appendChild(area);
  var info = el("div", "lcard"); info.style.marginTop = "16px"; b.appendChild(info);
  var cc = el("div", "lcard"); cc.style.marginTop = "16px"; b.appendChild(cc);
  var view = null, ta = null, memEl = null;
  ["lcd", "mono", "color", "seg"].forEach(function(g){ var gl = el("div", "lmut", GRPN[g]); gl.style.margin = "8px 0 4px"; chips.appendChild(gl); var r = el("div", "lrow"); chips.appendChild(r);
    DISPS.filter(function(x){ return x.grp === g; }).forEach(function(d){ var x = el("button", "lbtn" + (DD.sel === d.id ? " on" : ""), d.n); x.dataset.id = d.id; x.onclick = function(){ DD.sel = d.id; chips.querySelectorAll("button").forEach(function(y){ y.classList.toggle("on", y.dataset.id === d.id); }); render(); }; r.appendChild(x); }); });
  BOARDS.forEach(function(o){ var x = el("button", "lbtn" + (DD.board === o[0] ? " on" : ""), o[1]); x.dataset.b = o[0]; x.onclick = function(){ DD.board = o[0]; brow.querySelectorAll("button").forEach(function(y){ y.classList.toggle("on", y.dataset.b === o[0]); }); updCode(); infoPanel(); dsave(); }; brow.appendChild(x); });
  function infoPanel(){
    var d = dget(DD.sel), S = dinit(d), p = pinsFor(d, DD.board), bd = BOARDS.filter(function(x){ return x[0] === DD.board; })[0][1], lib = DD.board === "pi" ? "pip install " + PYLIBS[libOf(d)] : LIBS.uno[libOf(d)];
    info.innerHTML = "<h2>" + d.n + "</h2>";
    var rows = [[L("Controller", "Contrôleur"), d.ctrl || "HD44780 (PCF8574 I²C)"], [L("Auflösung", "Résolution"), d.grp === "lcd" ? d.cols + " × " + d.rows + " " + L("Zeichen", "caractères") + " (je 5×8 Punkte)" : d.grp === "seg" ? "4 × 7 Segmente" : d.w + " × " + d.h + " Pixel · " + (d.grp === "color" ? L("65 536 Farben (RGB565)", "65 536 couleurs (RGB565)") : L("2 Farben", "2 couleurs"))], [L("Anschluss", "Branchement") + " " + bd, p.t.join(" · ")], [L("Bibliothek", "Bibliothèque"), lib]];
    var tb = el("div"); rows.forEach(function(r){ tb.appendChild(el("p", "", "<b>" + r[0] + ":</b> " + r[1])); }); info.appendChild(tb);
    var sz = sizeBytes(d, S);
    if (sz) { var fl = FLASH[DD.board], ok = sz <= fl * 0.9, msg = "💾 " + L("Ein ganzes Bild braucht ", "Une image complète utilise ") + (sz >= 1024 ? (sz / 1024).toFixed(1) + " KB" : sz + " Bytes");
      if (fl === Infinity) msg += L(" – auf dem Raspberry Pi kein Problem.", " – aucun souci sur le Raspberry Pi.");
      else if (ok) msg += L(" (von ca. ", " (sur env. ") + Math.round(fl / 1024) + L(" KB Programmspeicher): passt.", " Ko de mémoire programme) : ça passe.");
      else msg += L(" – das passt NICHT in den Programmspeicher (", " – ça ne tient PAS en mémoire programme (") + Math.round(fl / 1024) + " KB). " + L("Nimm ein kleineres Display oder einen ESP32.", "Prends un écran plus petit ou un ESP32.");
      info.appendChild(el("p", ok ? "lmut" : "swarn", msg)); }
    p.w.forEach(function(w){ info.appendChild(el("p", "swarn", "⚠️ " + w)); });
  }
  function render(){
    var d = dget(DD.sel), S = dinit(d); area.innerHTML = ""; var up = function(light){ view.paint(); updCode(light); };
    view = d.grp === "lcd" ? viewLCD(area, d, S, up) : d.grp === "seg" ? viewSeg(area, d, S, up) : viewGfx(area, d, S, up);
    infoPanel(); view.paint(); updCode(); dsave();
  }
  cc.innerHTML = "<h2>" + L("Fertiger Code", "Code prêt") + "</h2>";
  ta = el("textarea", "code"); ta.readOnly = true; ta.style.height = "300px"; cc.appendChild(ta);
  var r2 = el("div", "lrow"); r2.style.marginTop = "10px"; cc.appendChild(r2);
  var cb = el("button", "lbtn pri", L("Code kopieren", "Copier le code")); r2.appendChild(cb);
  var sb = el("button", "lbtn"); r2.appendChild(sb);
  var timer = null, lastExt = "ino";
  function updCode(light){
    var d = dget(DD.sel), S = dinit(d);
    var run = function(){ var o = genCode(d, S, DD.board); ta.value = o.txt; lastExt = o.ext; sb.textContent = L("Als .", "Enregistrer .") + o.ext + L(" speichern", ""); dsave(); infoPanel(); };
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
