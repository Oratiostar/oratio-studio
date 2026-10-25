// Weihnachtswelt – Werkzeuge Teil 2: Namen, Akrostichon, Quiz, Bingo, Baum, Schneeflocke, Mütze, Spruchbild, Budget, Essen, Geschenkideen, Spieluhr, Brief.
(function(){
"use strict";
var XM = window.XM, I = XM.I, L = XM.L, $ = XM.$, $$ = XM.$$, esc = XM.esc, TH = XM.themes, FONT = XM.FONT;
function reg(t){ XM.tools.push(t); }
var D = function(de, fr){ return [de, fr]; };

/* ---------- Weihnachtsname ---------- */
var TYPEN = [["elf", D("Wichtel / Elf", "Lutin / Elfe")], ["rentier", D("Rentier", "Renne")], ["schneemann", D("Schneemann", "Bonhomme de neige")], ["plaetzchen", D("Plätzchen", "Biscuit")]];
function elfData(p){
  var r = XM.rng(XM.hash(XM.norm(p.n).toLowerCase() + "|" + p.t + "|" + (p.s || 0))), N = XD.N;
  var A = XM.pick(N.A, r), B = XM.pick(N.B[p.t] || N.B.elf, r), P = XM.pick(N.P, r), C = XM.pick(N.Plaetzchen, r), M = XM.pick(N.M, r), h = XM.themeKeys[Math.floor(r() * XM.themeKeys.length)];
  return { full: I ? B[1] + "-" + A[1] : A[0] + "-" + B[0], power: P[I], cookie: C[I], motto: M[I], h: h };
}
function elfDraw(p){
  return function(ctx, W, H, t){
    var d = p._d || (p._d = elfData(p)), th = TH[p.h || d.h];
    XM.goldStar(ctx, W / 2, 44 + Math.sin(t * 2) * 2, 14, th.acc);
    ctx.fillStyle = th.sub; XM.fit(ctx, L("Dein Weihnachts-Name", "Ton nom de Noël"), W / 2, 66, W - 80, 30, { max: 20, min: 12, weight: "700" });
    ctx.fillStyle = th.text; XM.fit(ctx, d.full, W / 2, 100, W - 70, 100, { max: 56, min: 22, weight: "800" });
    ctx.fillStyle = th.sub; XM.fit(ctx, L("für ", "pour ") + (p.n || "…"), W / 2, 205, W - 80, 32, { max: 22, min: 12, weight: "600" });
    ctx.fillStyle = th.text; XM.fit(ctx, XM.fr((p.n || L("Diese Person", "Cette personne")) + " " + d.power + "."), W / 2, 245, W - 100, 125, { max: 26, min: 14, weight: "600", lh: 1.35 });
    ctx.fillStyle = th.acc; XM.fit(ctx, L("Lieblingsgebäck: ", "Gâteau préféré : ") + d.cookie, W / 2, 378, W - 90, 36, { max: 22, min: 12, weight: "700" });
    ctx.fillStyle = th.sub; XM.fit(ctx, d.motto, W / 2, 420, W - 100, 80, { max: 22, min: 12, weight: "600", lh: 1.35 });
    XM.watermark(ctx, W, H, th);
  };
}
function elf(host){
  var p = { n: "", t: "elf", s: 0 }, cv;
  host.innerHTML = '<div class="xtwo"><div class="card"><label class="l">' + L("Dein Name", "Ton prénom") + '</label><input class="in" id="elN" maxlength="30"><label class="l">' + L("Was möchtest du sein?", "Que veux-tu être ?") + '</label><div id="elT"></div>' +
    '<div class="row" style="margin-top:12px"><button class="btn go" id="elR">' + L("Neu würfeln", "Relancer") + '</button></div><p class="hint">' + L("Zum gleichen Namen gibt es immer dasselbe Ergebnis – bis du neu würfelst. Perfekt zum Vergleichen mit Freunden.", "Le même prénom donne toujours le même résultat – jusqu'à ce que tu relances. Idéal pour comparer avec des amis.") + '</p></div>' +
    '<div><div class="cvwrap"><canvas id="elC"></canvas></div><div class="row" style="margin:10px 0"><button class="btn" id="elS">' + L("Als Bild speichern", "Enregistrer en image") + '</button></div><div id="elSh"></div></div></div>';
  cv = XM.animate($("#elC"), 540, 675, "sterne", elfDraw(p));
  function upd(){ p._d = null; cv.setTheme(elfData(p).h); }
  $("#elN").oninput = function(){ p.n = XM.norm(this.value); upd(); };
  XM.chips($("#elT"), TYPEN.map(function(x){ return [x[0], x[1][I]]; }), p.t, function(v){ p.t = v; upd(); });
  $("#elR").onclick = function(){ p.s++; upd(); }; $("#elS").onclick = function(){ cv.png(2, "weihnachtsname"); };
  $("#elSh").appendChild(XM.shareBar(function(){ return XM.link("e", { n: p.n, t: p.t, s: p.s }); }, L("Mein Weihnachtsname – und deiner?", "Mon nom de Noël – et le tien ?")));
  upd();
}
XM.views.e = function(host, d){
  var p = { n: d.n, t: XD.N.B[d.t] ? d.t : "elf", s: d.s | 0 }; p.h = elfData(p).h;
  host.innerHTML = '<div class="vcard"><p class="vlead">' + L("Dein Weihnachtsname", "Ton nom de Noël") + '</p><div class="cvwrap"><canvas id="elC"></canvas></div><div class="row" style="justify-content:center;margin:12px 0"><a class="btn go" href="#/namen">' + L("Meinen eigenen herausfinden", "Trouver le mien") + '</a></div></div>';
  XM.animate($("#elC"), 540, 675, p.h, elfDraw(p));
};
reg({ id: "namen", sym: "🧝", group: "spiel", name: D("Weihnachtsname", "Nom de Noël"), desc: D("Welcher Wichtel, welches Rentier, welcher Schneemann bist du? Zum Teilen mit Freunden.", "Quel lutin, quel renne, quel bonhomme de neige es-tu ? À partager avec tes amis."), build: elf });

/* ---------- Akrostichon ---------- */
function letters(name){ return XM.norm(name).toUpperCase().replace(/ß/g, "SS").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Z]/g, "").slice(0, 14).split(""); }
function gedichtDraw(p){
  var ls = letters(p.n);
  return function(ctx, W, H, t){
    var th = TH[p.h] || TH.kerzen, r = XM.rng(XM.hash(ls.join("") + "|" + (p.s || 0)));
    XM.goldStar(ctx, W / 2, 36, 13, th.acc);
    ctx.fillStyle = th.sub; XM.fit(ctx, L("Weihnachtsgedicht für", "Poème de Noël pour"), W / 2, 56, W - 80, 24, { max: 15, min: 11, weight: "700" });
    ctx.fillStyle = th.text; XM.fit(ctx, p.n || "…", W / 2, 80, W - 80, 40, { max: 28, min: 14, weight: "800" });
    ls.forEach(function(c, i){
      var words = XD.A[I ? "fr" : "de"][c], w = words[Math.floor(r() * words.length)], y = 150 + i * 52;
      ctx.fillStyle = th.acc; ctx.font = "800 40px " + FONT; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(c, 72, y);
      ctx.fillStyle = th.text; ctx.textAlign = "left"; var size = 26; ctx.font = "600 " + size + "px " + FONT; while (ctx.measureText(w.slice(1)).width > W - 130 && size > 12) { size--; ctx.font = "600 " + size + "px " + FONT; }
      ctx.fillText(w.slice(1), 100, y + 2);
    });
    XM.watermark(ctx, W, H, th);
  };
}
function gedicht(host){
  var p = { n: "", s: 0, h: "kerzen" }, cv;
  host.innerHTML = '<div class="xtwo"><div class="card"><label class="l">' + L("Name (bis 14 Buchstaben)", "Prénom (jusqu'à 14 lettres)") + '</label><input class="in" id="gdN" maxlength="30"><label class="l">' + L("Hintergrund", "Fond") + '</label><div id="gdH"></div><div class="row" style="margin-top:12px"><button class="btn go" id="gdR">' + L("Neue Wörter würfeln", "Nouveaux mots") + '</button></div>' +
    '<p class="hint">' + L("Jeder Buchstabe deines Namens beginnt ein weihnachtliches Wort – ein Akrostichon.", "Chaque lettre de ton prénom commence un mot de Noël – un acrostiche.") + '</p></div><div><div class="cvwrap"><canvas id="gdC"></canvas></div><div class="row" style="margin:10px 0"><button class="btn" id="gdS">' + L("Als Bild speichern", "Enregistrer en image") + '</button></div><div id="gdSh"></div></div></div>';
  var lastH = 0;
  function make(){ var n = Math.max(letters(p.n).length, 4), H = 150 + n * 52 + 100; if (cv) cv.stop(); cv = XM.animate($("#gdC"), 540, H, p.h, gedichtDraw(p)); }
  make();
  $("#gdN").oninput = function(){ p.n = XM.norm(this.value); make(); }; $("#gdR").onclick = function(){ p.s++; make(); };
  XM.themeChips($("#gdH"), p.h, function(k){ p.h = k; make(); }); $("#gdS").onclick = function(){ cv.png(2, "weihnachtsgedicht"); };
  $("#gdSh").appendChild(XM.shareBar(function(){ return XM.link("p", { n: p.n, s: p.s, h: p.h }); }, L("Ein Weihnachtsgedicht für dich:", "Un poème de Noël pour toi :")));
}
XM.views.p = function(host, d){
  var p = { n: d.n, s: d.s | 0, h: TH[d.h] ? d.h : "kerzen" }, n = Math.max(letters(p.n).length, 4);
  host.innerHTML = '<div class="vcard"><p class="vlead">' + L("Ein Weihnachtsgedicht für dich", "Un poème de Noël pour toi") + '</p><div class="cvwrap"><canvas id="gdC"></canvas></div><div class="row" style="justify-content:center;margin:12px 0"><a class="btn go" href="#/gedicht">' + L("Eigenes Gedicht machen", "Faire mon propre poème") + '</a></div></div>';
  XM.animate($("#gdC"), 540, 150 + n * 52 + 100, p.h, gedichtDraw(p));
};
reg({ id: "gedicht", sym: "📜", group: "geben", name: D("Namensgedicht (Akrostichon)", "Poème acrostiche"), desc: D("Aus den Buchstaben eines Namens entsteht ein Weihnachtsgedicht – zum Verschenken.", "Avec les lettres d'un prénom naît un poème de Noël – à offrir."), build: gedicht });

/* ---------- Quiz ---------- */
function quiz(host){
  var qs, idx, score, locked;
  function start(){ qs = XM.shuffle(XD.Q).slice(0, 10); idx = 0; score = 0; show(); }
  function show(){
    if (idx >= qs.length) {
      var tier = score >= 9 ? L("Weihnachts-Profi", "Pro de Noël") : score >= 6 ? L("Wichtel mit Durchblick", "Lutin averti") : score >= 3 ? L("Plätzchen-Lehrling", "Apprenti biscuit") : L("Noch im Winterschlaf", "Encore en hibernation");
      host.innerHTML = '<div class="card qz"><h2>' + score + ' / ' + qs.length + '</h2><p class="vlead">' + tier + '</p><div class="row"><button class="btn go" id="qzA">' + L("Nochmal spielen", "Rejouer") + '</button></div></div>';
      $("#qzA").onclick = start; return;
    }
    var q = qs[idx], order = XM.shuffle(q[1].map(function(o, i){ return i; })); locked = false;
    host.innerHTML = '<div class="card qz"><div class="qn">' + L("Frage ", "Question ") + (idx + 1) + ' / ' + qs.length + '</div><h2>' + esc(q[0][I]) + '</h2><div class="qo">' + order.map(function(i){ return '<button class="btn" data-i="' + i + '">' + esc(q[1][i][I]) + '</button>'; }).join("") + '</div><div class="qf" id="qzF"></div></div>';
    $$(".qo .btn", host).forEach(function(b){ b.onclick = function(){
      if (locked) return; locked = true; var ok = +b.dataset.i === q[2]; if (ok) score++;
      $$(".qo .btn", host).forEach(function(x){ x.disabled = true; if (+x.dataset.i === q[2]) x.classList.add("good"); else if (x === b) x.classList.add("bad"); });
      $("#qzF").innerHTML = '<b>' + (ok ? L("Richtig!", "Exact !") : L("Leider nicht.", "Pas tout à fait.")) + '</b> ' + esc(q[3][I]) + '<div class="row" style="margin-top:10px"><button class="btn go" id="qzN">' + (idx + 1 < qs.length ? L("Weiter", "Suivant") : L("Ergebnis", "Résultat")) + '</button></div>';
      $("#qzN").onclick = function(){ idx++; show(); };
    }; });
  }
  start();
}
reg({ id: "quiz", sym: "🧠", group: "spiel", name: D("Weihnachtsquiz", "Quiz de Noël"), desc: D("10 zufällige Fragen aus Deutschland, Frankreich und der Welt – mit kleinen Hintergrundinfos.", "10 questions aléatoires d'Allemagne, de France et du monde – avec de petites infos en plus."), build: quiz });

/* ---------- Bingo ---------- */
function bingoCells(seed){ var r = XM.rng(seed), c = XM.shuffle(XD.B, r).slice(0, 24).map(function(x){ return x[I]; }); c.splice(12, 0, L("FREI", "LIBRE")); return c; }
function bingoGrid(host, seed, withShare){
  var cells = bingoCells(seed), on = {}; on[12] = 1;
  host.innerHTML = '<div class="bingo" id="bgG">' + cells.map(function(c, i){ return '<button class="bc' + (i === 12 ? " on free" : "") + '" data-i="' + i + '">' + esc(c) + '</button>'; }).join("") + '</div><div class="status ok" id="bgM"></div>';
  function lines(){ var L5 = []; for (var i = 0; i < 5; i++) { L5.push([0, 1, 2, 3, 4].map(function(j){ return i * 5 + j; })); L5.push([0, 1, 2, 3, 4].map(function(j){ return j * 5 + i; })); } L5.push([0, 6, 12, 18, 24]); L5.push([4, 8, 12, 16, 20]); return L5; }
  $$(".bc", host).forEach(function(b){ b.onclick = function(){ var i = +b.dataset.i; if (i === 12) return; on[i] = !on[i]; b.classList.toggle("on", !!on[i]); var win = lines().some(function(l){ return l.every(function(k){ return on[k]; }); }); $("#bgM").textContent = win ? L("BINGO! 🎉", "BINGO ! 🎉") : ""; }; });
}
function bingo(host){
  var seed = Math.floor(Math.random() * 90000) + 10000;
  host.innerHTML = '<div class="card"><div class="row"><span class="muted">' + L("Karten-Nr.", "Carte n°") + '</span><input class="in" id="bgS" type="number" min="1" max="999999" style="width:120px"><button class="btn go" id="bgN">' + L("Neue Karte", "Nouvelle carte") + '</button><button class="btn" id="bgP">' + L("Drucken", "Imprimer") + '</button></div><p class="hint">' + L("Tippe ein Feld an, sobald es bei der Feier passiert. Fünf in einer Reihe – Bingo! Jede Nummer ergibt eine andere Karte; gebt jedem Gast eine eigene.", "Touche une case dès que ça arrive pendant la fête. Cinq à la suite : bingo ! Chaque numéro donne une autre carte ; donnez-en une à chaque invité.") + '</p><div id="bgB"></div><div id="bgSh" style="margin-top:10px"></div></div>';
  function go(){ $("#bgS").value = seed; bingoGrid($("#bgB"), seed); }
  $("#bgN").onclick = function(){ seed = Math.floor(Math.random() * 90000) + 10000; go(); }; $("#bgS").onchange = function(){ seed = Math.max(1, Math.floor(+this.value || 1)); go(); };
  $("#bgP").onclick = function(){ window.print(); };
  $("#bgSh").appendChild(XM.shareBar(function(){ return XM.link("b", { s: seed }); }, L("Unser Weihnachts-Bingo:", "Notre bingo de Noël :"))); go();
}
XM.views.b = function(host, d){ host.innerHTML = '<div class="vcard"><p class="vlead">' + L("Weihnachts-Bingo", "Bingo de Noël") + '</p><div id="bgB"></div><p><a class="btn go" href="#/bingo">' + L("Eigene Karte", "Ma propre carte") + '</a></p></div>'; bingoGrid($("#bgB"), +d.s || 1); };
reg({ id: "bingo", sym: "🎲", group: "spiel", name: D("Weihnachts-Bingo", "Bingo de Noël"), desc: D("Bingo-Karten für die Familienfeier – jede Nummer ergibt eine andere Karte, mit Druckfunktion.", "Cartes de bingo pour la fête de famille – chaque numéro donne une autre carte, avec impression."), build: bingo });

/* ---------- Weihnachtsbaum schmücken ---------- */
var ORN = [["r", D("Kugel rot", "Boule rouge"), "#e0364a"], ["g", D("Kugel gold", "Boule or"), "#f2b705"], ["b", D("Kugel blau", "Boule bleue"), "#3b82f6"], ["w", D("Kugel silber", "Boule argent"), "#cfd8e6"], ["s", D("Stern", "Étoile"), "#ffd23f"], ["h", D("Herz", "Cœur"), "#ff5d8f"], ["c", D("Zuckerstange", "Sucre d'orge"), "#ffffff"], ["l", D("Lichter", "Lumières"), "#fff3b0"], ["k", D("Geschenk", "Cadeau"), "#2fa66a"]];
function drawOrn(ctx, o, t){
  var tp = o[0], x = o[1], y = o[2];
  if ("rgbw".indexOf(tp) >= 0) { var col = ORN.filter(function(a){ return a[0] === tp; })[0][2], g = ctx.createRadialGradient(x - 4, y - 5, 2, x, y, 15); g.addColorStop(0, "#fff"); g.addColorStop(.25, col); g.addColorStop(1, "rgba(0,0,0,.45)"); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 14, 0, 6.3); ctx.fill(); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 14, 0, 6.3); ctx.fill(); ctx.fillStyle = "#d9b34a"; ctx.fillRect(x - 3, y - 18, 6, 5); }
  else if (tp === "s") { ctx.fillStyle = "#ffd23f"; XM.star(ctx, x, y, 22, 5, .45); ctx.fill(); ctx.strokeStyle = "#e6a800"; ctx.lineWidth = 2; ctx.stroke(); }
  else if (tp === "h") { ctx.fillStyle = "#ff5d8f"; ctx.beginPath(); ctx.moveTo(x, y + 12); ctx.bezierCurveTo(x - 24, y - 4, x - 10, y - 20, x, y - 8); ctx.bezierCurveTo(x + 10, y - 20, x + 24, y - 4, x, y + 12); ctx.fill(); }
  else if (tp === "c") { ctx.lineCap = "round"; ctx.lineWidth = 6; ctx.strokeStyle = "#fff"; ctx.beginPath(); ctx.moveTo(x, y + 18); ctx.lineTo(x, y - 8); ctx.arc(x + 8, y - 8, 8, Math.PI, 0); ctx.stroke(); ctx.strokeStyle = "#e0364a"; ctx.lineWidth = 6; ctx.setLineDash([4, 6]); ctx.stroke(); ctx.setLineDash([]); }
  else if (tp === "l") { var gl = .6 + .4 * Math.sin(t * 3 + x); var g2 = ctx.createRadialGradient(x, y, 1, x, y, 14); g2.addColorStop(0, "rgba(255,243,176," + gl + ")"); g2.addColorStop(1, "rgba(255,243,176,0)"); ctx.fillStyle = g2; ctx.fillRect(x - 16, y - 16, 32, 32); ctx.fillStyle = "#fff8d0"; ctx.beginPath(); ctx.arc(x, y, 4, 0, 6.3); ctx.fill(); }
  else if (tp === "k") { ctx.fillStyle = "#2fa66a"; ctx.fillRect(x - 15, y - 12, 30, 24); ctx.fillStyle = "#e0364a"; ctx.fillRect(x - 3, y - 12, 6, 24); ctx.fillRect(x - 15, y - 3, 30, 6); ctx.beginPath(); ctx.arc(x - 5, y - 15, 5, 0, 6.3); ctx.arc(x + 5, y - 15, 5, 0, 6.3); ctx.fill(); }
}
function baumDraw(items){
  return function(ctx, W, H, t){
    var cx = W / 2;
    ctx.fillStyle = "#f4f8ff"; ctx.beginPath(); ctx.ellipse(cx, H - 30, W * .62, 70, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = "#6b3f1d"; ctx.fillRect(cx - 18, H - 120, 36, 70);
    var layers = [[H - 110, 200, 150], [H - 220, 165, 140], [H - 320, 130, 130], [H - 410, 95, 120]];
    layers.forEach(function(l, i){ var g = ctx.createLinearGradient(0, l[0] - l[2], 0, l[0]); g.addColorStop(0, "#2f9a56"); g.addColorStop(1, "#14633a"); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - l[1], l[0]); ctx.lineTo(cx, l[0] - l[2]); ctx.lineTo(cx + l[1], l[0]); ctx.closePath(); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.beginPath(); ctx.moveTo(cx - l[1], l[0]); for (var k = 0; k <= 6; k++) ctx.lineTo(cx - l[1] + k * l[1] / 3, l[0] - ((k % 2) ? 0 : 12)); ctx.lineTo(cx + l[1], l[0]); ctx.lineTo(cx + l[1] - 8, l[0] - 8); ctx.lineTo(cx - l[1] + 8, l[0] - 8); ctx.closePath(); ctx.fill(); });
    items.forEach(function(o){ drawOrn(ctx, o, t); });
    if (!items.length) { ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.font = "700 16px " + FONT; ctx.textAlign = "center"; ctx.fillText(L("Wähle unten einen Schmuck und tippe auf den Baum", "Choisis une décoration et touche le sapin"), cx, 40); }
  };
}
function baum(host){
  var items = [], cur = "r", W = 540, H = 720, cv;
  host.innerHTML = '<div class="xtwo"><div class="card"><label class="l">' + L("Schmuck", "Décoration") + '</label><div id="baP" class="orns"></div><div class="row" style="margin-top:12px"><button class="btn" id="baU">' + L("Rückgängig", "Annuler") + '</button><button class="btn" id="baC">' + L("Alles löschen", "Tout effacer") + '</button></div><div class="row" style="margin-top:10px"><button class="btn go" id="baS">' + L("Als Bild speichern", "Enregistrer en image") + '</button></div><p class="hint">' + L("Tippe oder klicke auf den Baum, um den gewählten Schmuck dort anzubringen.", "Touche ou clique sur le sapin pour y placer la décoration choisie.") + '</p><div id="baSh" style="margin-top:8px"></div></div><div><div class="cvwrap"><canvas id="baC2" style="cursor:crosshair;touch-action:none"></canvas></div></div></div>';
  var pal = $("#baP");
  ORN.forEach(function(o){ var b = document.createElement("button"); b.className = "orn" + (o[0] === cur ? " on" : ""); b.innerHTML = '<i style="background:' + o[2] + '"></i>' + esc(o[1][I]); b.onclick = function(){ cur = o[0]; $$(".orn", pal).forEach(function(x){ x.classList.toggle("on", x === b); }); }; pal.appendChild(b); });
  cv = XM.animate($("#baC2"), W, H, "schnee", baumDraw(items));
  $("#baC2").addEventListener("pointerdown", function(e){ var r = this.getBoundingClientRect(); if (items.length >= 80) { XM.toast(L("Der Baum ist voll!", "Le sapin est plein !")); return; } items.push([cur, Math.round((e.clientX - r.left) / r.width * W), Math.round((e.clientY - r.top) / r.height * H)]); });
  $("#baU").onclick = function(){ items.pop(); }; $("#baC").onclick = function(){ items.length = 0; }; $("#baS").onclick = function(){ cv.png(2, "weihnachtsbaum"); };
  $("#baSh").appendChild(XM.shareBar(function(){ return XM.link("t", { i: items }); }, L("Mein Weihnachtsbaum:", "Mon sapin de Noël :")));
}
XM.views.t = function(host, d){
  var items = (d.i || []).filter(function(o){ return o && "rgbwshclk".indexOf(o[0]) >= 0 && isFinite(o[1]) && isFinite(o[2]); }).slice(0, 80);
  host.innerHTML = '<div class="vcard"><p class="vlead">' + L("Ein geschmückter Weihnachtsbaum für dich", "Un sapin décoré pour toi") + '</p><div class="cvwrap"><canvas id="baC2"></canvas></div><div class="row" style="justify-content:center;margin:12px 0"><a class="btn go" href="#/baum">' + L("Eigenen Baum schmücken", "Décorer mon propre sapin") + '</a></div></div>';
  XM.animate($("#baC2"), 540, 720, "schnee", baumDraw(items));
};
reg({ id: "baum", sym: "🎄", group: "kreativ", name: D("Baum schmücken", "Décorer le sapin"), desc: D("Hänge Kugeln, Sterne und Lichter an deinen Baum – und schick ihn als Link oder Bild.", "Accroche boules, étoiles et lumières à ton sapin – et envoie-le en lien ou en image."), build: baum });

/* ---------- Schneeflocken-Zeichner ---------- */
function flocke(host){
  var S = 480, strokes = [], cur = null, col = "#ffffff", bgk = "nacht", size = 3, guides = true;
  var BG = { nacht: ["#10264d", "#1b4a8a"], rot: ["#7d0f1f", "#c4162b"], wald: ["#0b3125", "#1d6a46"], leer: null };
  host.innerHTML = '<div class="xtwo"><div class="card"><label class="l">' + L("Farbe", "Couleur") + '</label><div id="flF" class="swatches"></div><label class="l">' + L("Hintergrund", "Fond") + '</label><div id="flB"></div><div class="rg" style="margin-top:10px"><span>' + L("Stift", "Crayon") + '</span><input type="range" id="flS" min="1" max="10" value="3"><output id="flO">3</output></div>' +
    '<label class="chk"><input type="checkbox" id="flG" checked> ' + L("Hilfslinien anzeigen", "Afficher les lignes d'aide") + '</label><div class="row" style="margin-top:10px"><button class="btn" id="flU">' + L("Rückgängig", "Annuler") + '</button><button class="btn" id="flC">' + L("Löschen", "Effacer") + '</button></div><div class="row" style="margin-top:10px"><button class="btn go" id="flP">' + L("Als Bild speichern", "Enregistrer en image") + '</button></div>' +
    '<p class="hint">' + L("Male mit Maus oder Finger auf der Fläche: Dein Strich wird zwölfmal gespiegelt und gedreht – wie bei einer echten Schneeflocke. Beim Speichern mit „ohne Hintergrund“ bleibt der Hintergrund durchsichtig.", "Dessine à la souris ou au doigt : ton trait est répété douze fois, par rotation et symétrie – comme un vrai flocon. En choisissant « sans fond », l'arrière-plan reste transparent.") + '</p></div><div><div class="cvwrap"><canvas id="flC2" width="' + S + '" height="' + S + '" style="touch-action:none;cursor:crosshair"></canvas></div></div></div>';
  var cv = $("#flC2"), ctx = cv.getContext("2d");
  function seg(c, a, b, scale, pt){ c.strokeStyle = pt.c; c.lineWidth = pt.w * scale; c.lineCap = "round"; c.lineJoin = "round";
    for (var k = 0; k < 6; k++) for (var m = 0; m < 2; m++) { c.save(); c.translate(S * scale / 2, S * scale / 2); c.rotate(k * Math.PI / 3); if (m) c.scale(-1, 1); c.beginPath(); c.moveTo(a[0] * scale, a[1] * scale); c.lineTo(b[0] * scale, b[1] * scale); c.stroke(); c.restore(); } }
  function strokesTo(c, scale){ strokes.forEach(function(s){ if (s.p.length === 1) seg(c, s.p[0], [s.p[0][0] + .01, s.p[0][1]], scale, s); for (var i = 1; i < s.p.length; i++) seg(c, s.p[i - 1], s.p[i], scale, s); }); }
  function bg(c, scale, key){ var b = BG[key]; if (!b) return; var g = c.createRadialGradient(S * scale / 2, S * scale / 2, 10, S * scale / 2, S * scale / 2, S * scale * .7); g.addColorStop(0, b[1]); g.addColorStop(1, b[0]); c.fillStyle = g; c.fillRect(0, 0, S * scale, S * scale); }
  function redraw(){ ctx.clearRect(0, 0, S, S); var b = bgk === "leer" ? "nacht" : bgk; bg(ctx, 1, b); if (guides) { ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = 1; for (var k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(S / 2, S / 2); ctx.lineTo(S / 2 + Math.cos(k * Math.PI / 3) * S, S / 2 + Math.sin(k * Math.PI / 3) * S); ctx.stroke(); } } strokesTo(ctx, 1); }
  function pos(e){ var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * S - S / 2, (e.clientY - r.top) / r.height * S - S / 2]; }
  cv.addEventListener("pointerdown", function(e){ cv.setPointerCapture(e.pointerId); cur = { c: col, w: size, p: [pos(e)] }; strokes.push(cur); redraw(); });
  cv.addEventListener("pointermove", function(e){ if (!cur) return; cur.p.push(pos(e)); seg(ctx, cur.p[cur.p.length - 2], cur.p[cur.p.length - 1], 1, cur); });
  cv.addEventListener("pointerup", function(){ cur = null; }); cv.addEventListener("pointercancel", function(){ cur = null; });
  var cols = ["#ffffff", "#bfe6ff", "#ffd966", "#ff9ad5", "#ff6b6b", "#7dffd0"], fw = $("#flF");
  cols.forEach(function(c){ var b = document.createElement("button"); b.className = "sw" + (c === col ? " on" : ""); b.style.background = c; b.setAttribute("aria-label", c); b.onclick = function(){ col = c; $$(".sw", fw).forEach(function(x){ x.classList.toggle("on", x === b); }); }; fw.appendChild(b); });
  XM.chips($("#flB"), [["nacht", L("Nacht", "Nuit")], ["rot", L("Rot", "Rouge")], ["wald", L("Tanne", "Sapin")], ["leer", L("ohne Hintergrund", "sans fond")]], bgk, function(v){ bgk = v; redraw(); });
  $("#flS").oninput = function(){ size = +this.value; $("#flO").textContent = size; }; $("#flG").onchange = function(){ guides = this.checked; redraw(); };
  $("#flU").onclick = function(){ strokes.pop(); redraw(); }; $("#flC").onclick = function(){ strokes = []; redraw(); };
  $("#flP").onclick = function(){ var sc = 2, o = document.createElement("canvas"); o.width = o.height = S * sc; var c = o.getContext("2d"); bg(c, sc, bgk); strokesTo(c, sc); o.toBlob(function(b){ if (b) WZ.speichern(b, "schneeflocke.png"); }); };
  redraw();
}
reg({ id: "flocke", sym: "❄️", group: "kreativ", name: D("Schneeflocken-Zeichner", "Dessinateur de flocons"), desc: D("Zeichne eine sechsfach gespiegelte Schneeflocke – jede ist ein Unikat. Als Bild speichern.", "Dessine un flocon de neige à symétrie sextuple – chacun est unique. À enregistrer en image."), build: flocke });

/* ---------- Foto mit Weihnachtsmütze ---------- */
function drawHat(c, x, y, s, rot, flip){
  c.save(); c.translate(x, y); c.rotate(rot * Math.PI / 180); c.scale(flip ? -1 : 1, 1);
  c.fillStyle = "#d62839"; c.beginPath(); c.moveTo(-.46 * s, -.04 * s); c.bezierCurveTo(-.44 * s, -.62 * s, -.12 * s, -.98 * s, .3 * s, -.84 * s); c.bezierCurveTo(.52 * s, -.76 * s, .62 * s, -.5 * s, .56 * s, -.36 * s); c.bezierCurveTo(.46 * s, -.5 * s, .42 * s, -.2 * s, .46 * s, -.04 * s); c.closePath(); c.fill();
  c.fillStyle = "rgba(0,0,0,.12)"; c.beginPath(); c.moveTo(.1 * s, -.8 * s); c.bezierCurveTo(.3 * s, -.78 * s, .5 * s, -.6 * s, .46 * s, -.04 * s); c.lineTo(.2 * s, -.04 * s); c.bezierCurveTo(.3 * s, -.4 * s, .22 * s, -.65 * s, .1 * s, -.8 * s); c.fill();
  c.fillStyle = "#fff"; XM.rrect(c, -.52 * s, -.12 * s, 1.04 * s, .2 * s, .1 * s); c.fill();
  c.beginPath(); c.arc(.56 * s, -.34 * s, .1 * s, 0, 6.3); c.fill(); c.strokeStyle = "rgba(0,0,0,.12)"; c.lineWidth = 1; c.stroke();
  c.restore();
}
function muetze(host){
  var img = null, hat = { x: .5, y: .42, s: .3, r: -8, f: 0 }, opt = { snow: 0, frame: "none", text: "" }, S = { w: 800, h: 600 }, snowPts = [];
  var r0 = XM.rng(7); for (var i = 0; i < 90; i++) snowPts.push([r0(), r0(), 1.5 + r0() * 3.5]);
  host.innerHTML = '<div class="xtwo"><div class="card"><div class="drop" id="muD"><b>' + L("Foto auswählen", "Choisir une photo") + '</b>' + L("oder hierher ziehen. Das Foto bleibt auf deinem Gerät.", "ou la déposer ici. La photo reste sur ton appareil.") + '<input type="file" id="muF" accept="image/*" hidden></div>' +
    '<div class="rg"><span>' + L("Größe", "Taille") + '</span><input type="range" id="muS" min="10" max="90" value="30"><output id="muSo"></output></div><div class="rg"><span>' + L("Drehen", "Rotation") + '</span><input type="range" id="muR" min="-60" max="60" value="-8"><output id="muRo"></output></div>' +
    '<div class="row" style="margin-top:6px"><button class="btn sm" id="muFl">' + L("Spiegeln", "Retourner") + '</button></div><label class="l">' + L("Rahmen", "Cadre") + '</label><div id="muFr"></div><label class="chk"><input type="checkbox" id="muSn"> ' + L("Schneeflocken im Bild", "Flocons de neige sur l'image") + '</label>' +
    '<label class="l">' + L("Text unten (optional)", "Texte en bas (facultatif)") + '</label><input class="in" id="muT" maxlength="40"><div class="row" style="margin-top:12px"><button class="btn go" id="muP" disabled>' + L("Als Bild speichern", "Enregistrer en image") + '</button></div></div>' +
    '<div><div class="cvwrap" style="max-width:640px"><canvas id="muC" width="800" height="600" style="touch-action:none;cursor:grab"></canvas></div><p class="hint">' + L("Zieh die Mütze mit Maus oder Finger an die richtige Stelle.", "Fais glisser le bonnet avec la souris ou le doigt à la bonne place.") + '</p></div></div>';
  var cv = $("#muC"), ctx = cv.getContext("2d");
  function render(c, w, h){
    c.clearRect(0, 0, w, h);
    if (img) c.drawImage(img, 0, 0, w, h); else { var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#1c2a50"); g.addColorStop(1, "#2d5486"); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = "#ffffffcc"; c.font = "700 " + Math.round(w / 28) + "px " + FONT; c.textAlign = "center"; c.fillText(L("Wähle ein Foto aus", "Choisis une photo"), w / 2, h / 2); }
    if (opt.snow) { c.fillStyle = "rgba(255,255,255,.85)"; snowPts.forEach(function(p){ c.beginPath(); c.arc(p[0] * w, p[1] * h, p[2] * w / 800, 0, 6.3); c.fill(); }); }
    drawHat(c, hat.x * w, hat.y * h, hat.s * w, hat.r, hat.f);
    if (opt.frame !== "none") { var fw = w * .035; c.lineWidth = fw; c.strokeStyle = opt.frame === "rot" ? "#c4162b" : opt.frame === "gruen" ? "#1d6a46" : "#f2b705"; c.strokeRect(fw / 2, fw / 2, w - fw, h - fw); c.lineWidth = fw / 4; c.strokeStyle = "#fff"; c.strokeRect(fw * 1.2, fw * 1.2, w - fw * 2.4, h - fw * 2.4); }
    if (opt.text) { c.font = "800 " + Math.round(w / 16) + "px " + FONT; c.textAlign = "center"; c.textBaseline = "alphabetic"; var ty = h - w * .05; c.lineWidth = w / 80; c.strokeStyle = "rgba(0,0,0,.65)"; c.lineJoin = "round"; c.strokeText(opt.text, w / 2, ty); c.fillStyle = "#fff"; c.fillText(opt.text, w / 2, ty); }
  }
  function draw(){ render(ctx, cv.width, cv.height); }
  function load(file){ if (!file || !/^image\//.test(file.type)) return; var u = URL.createObjectURL(file), im = new Image(); im.onload = function(){ var k = Math.min(1, 1000 / Math.max(im.width, im.height)); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k); img = im; $("#muP").disabled = false; draw(); setTimeout(function(){ URL.revokeObjectURL(u); }, 3000); }; im.src = u; }
  var drop = $("#muD"); drop.onclick = function(){ $("#muF").click(); }; $("#muF").onchange = function(){ load(this.files[0]); };
  drop.ondragover = function(e){ e.preventDefault(); drop.classList.add("over"); }; drop.ondragleave = function(){ drop.classList.remove("over"); }; drop.ondrop = function(e){ e.preventDefault(); drop.classList.remove("over"); load(e.dataTransfer.files[0]); };
  var drag = null; cv.addEventListener("pointerdown", function(e){ cv.setPointerCapture(e.pointerId); drag = true; mv(e); }); cv.addEventListener("pointermove", function(e){ if (drag) mv(e); }); cv.addEventListener("pointerup", function(){ drag = null; });
  function mv(e){ var r = cv.getBoundingClientRect(); hat.x = (e.clientX - r.left) / r.width; hat.y = (e.clientY - r.top) / r.height + hat.s * .1; draw(); }
  function lab(){ $("#muSo").textContent = Math.round(hat.s * 100); $("#muRo").textContent = hat.r + "°"; } lab();
  $("#muS").oninput = function(){ hat.s = this.value / 100; lab(); draw(); }; $("#muR").oninput = function(){ hat.r = +this.value; lab(); draw(); }; $("#muFl").onclick = function(){ hat.f ^= 1; draw(); };
  XM.chips($("#muFr"), [["none", L("keiner", "aucun")], ["rot", L("Rot", "Rouge")], ["gruen", L("Grün", "Vert")], ["gold", L("Gold", "Or")]], "none", function(v){ opt.frame = v; draw(); });
  $("#muSn").onchange = function(){ opt.snow = this.checked ? 1 : 0; draw(); }; $("#muT").oninput = function(){ opt.text = this.value; draw(); };
  $("#muP").onclick = function(){ var o = document.createElement("canvas"); o.width = cv.width; o.height = cv.height; render(o.getContext("2d"), o.width, o.height); o.toBlob(function(b){ if (b) WZ.speichern(b, "weihnachtsfoto.png"); }, "image/png"); };
  draw();
}
reg({ id: "muetze", sym: "🎅", group: "kreativ", name: D("Foto mit Weihnachtsmütze", "Photo avec bonnet de Noël"), desc: D("Setz dir oder deinen Freunden eine Mütze auf – dazu Schnee, Rahmen und Text. Das Foto bleibt bei dir.", "Mets un bonnet de Noël à toi ou à tes amis – avec neige, cadre et texte. La photo reste chez toi."), build: muetze });

/* ---------- Spruchbild ---------- */
var FORM = { quad: [540, 540], story: [540, 960], wide: [960, 540] };
function spruchDraw(p){
  return function(ctx, W, H, t){
    var th = TH[p.h] || TH.gold;
    ctx.fillStyle = th.acc; XM.sparkle(ctx, W / 2, H * .13 + Math.sin(t * 2) * 2, 14);
    ctx.fillStyle = th.text; XM.fit(ctx, p.m || L("Dein Text erscheint hier", "Ton texte apparaît ici"), W / 2, H * .2, W - 110, H * .5, { max: W > H ? 54 : 46, min: 16, weight: "800", lh: 1.25 });
    if (p.a) { ctx.fillStyle = th.sub; XM.fit(ctx, "– " + p.a, W / 2, H * .74, W - 110, 40, { max: 24, min: 12, weight: "600" }); }
    XM.watermark(ctx, W, H, th);
  };
}
function spruch(host){
  var p = { m: "", a: "", h: "gold", f: "quad" }, cv;
  host.innerHTML = '<div class="xtwo"><div class="card"><label class="l">' + L("Text", "Texte") + '</label><textarea class="in" id="spM" rows="4" maxlength="240"></textarea><div id="spV" style="margin-top:6px"></div><label class="l">' + L("Absender (optional)", "Auteur (facultatif)") + '</label><input class="in" id="spA" maxlength="40">' +
    '<label class="l">' + L("Format", "Format") + '</label><div id="spF"></div><label class="l">' + L("Hintergrund", "Fond") + '</label><div id="spH"></div><div class="row" style="margin-top:12px"><button class="btn go" id="spS">' + L("Als Bild speichern", "Enregistrer en image") + '</button></div><div id="spSh" style="margin-top:8px"></div></div><div><div class="cvwrap" id="spW"><canvas id="spC"></canvas></div></div></div>';
  function make(){ if (cv) cv.stop(); var f = FORM[p.f]; $("#spW").className = "cvwrap" + (p.f === "wide" ? " wide" : p.f === "story" ? " tall" : ""); cv = XM.animate($("#spC"), f[0], f[1], p.h, spruchDraw(p)); }
  make();
  $("#spM").oninput = function(){ p.m = this.value; }; $("#spA").oninput = function(){ p.a = XM.norm(this.value); };
  XM.chips($("#spV"), XD.S.map(function(s, i){ return [String(i), s[I]]; }), "", function(i){ p.m = XD.S[+i][I]; $("#spM").value = p.m; });
  XM.chips($("#spF"), [["quad", L("Quadrat", "Carré")], ["story", L("Story (hoch)", "Story (vertical)")], ["wide", L("Querformat", "Paysage")]], p.f, function(v){ p.f = v; make(); });
  XM.themeChips($("#spH"), p.h, function(k){ p.h = k; cv.setTheme(k); }); $("#spS").onclick = function(){ cv.png(2, "weihnachtsspruch"); };
  $("#spSh").appendChild(XM.shareBar(function(){ return XM.link("s", p); }, L("Ein Weihnachtsgruß für dich:", "Un message de Noël pour toi :")));
}
XM.views.s = function(host, d){
  var p = { m: d.m, a: d.a, h: TH[d.h] ? d.h : "gold", f: FORM[d.f] ? d.f : "quad" }, f = FORM[p.f];
  host.innerHTML = '<div class="vcard"><div class="cvwrap' + (p.f === "wide" ? " wide" : p.f === "story" ? " tall" : "") + '"><canvas id="spC"></canvas></div><div class="row" style="justify-content:center;margin:12px 0"><button class="btn go" id="spS">' + L("Speichern", "Enregistrer") + '</button><a class="btn" href="#/spruch">' + L("Eigenes Bild machen", "Faire mon image") + '</a></div></div>';
  var cv = XM.animate($("#spC"), f[0], f[1], p.h, spruchDraw(p)); $("#spS").onclick = function(){ cv.png(2, "weihnachtsspruch"); };
};
reg({ id: "spruch", sym: "🖼️", group: "geben", name: D("Spruchbild", "Image avec message"), desc: D("Deinen Weihnachtsgruß als schönes Bild – quadratisch, hoch für Stories oder quer.", "Ton message de Noël en belle image – carré, vertical pour les stories ou paysage."), build: spruch });

/* ---------- Geschenkbudget ---------- */
function budget(host){
  var key = "xm-budget", st = { total: 300, rows: [] };
  try { var o = JSON.parse(localStorage.getItem(key) || "null"); if (o && o.rows) st = o; } catch(e){}
  if (!st.rows.length) st.rows = [["", ""], ["", ""], ["", ""]];
  host.innerHTML = '<div class="xtwo"><div class="card"><label class="l">' + L("Gesamtbudget (€)", "Budget total (€)") + '</label><input class="in" id="buT" type="number" min="0" step="10"><label class="l">' + L("Wer bekommt was? (Name · Betrag in €)", "Qui reçoit quoi ? (prénom · montant en €)") + '</label><div id="buR"></div><div class="row" style="margin-top:8px"><button class="btn sm" id="buA">' + L("+ Person", "+ personne") + '</button><button class="btn sm" id="buC">' + L("Alles leeren", "Tout vider") + '</button></div>' +
    '<p class="hint">' + L("Die Liste wird nur in diesem Browser gespeichert.", "La liste n'est enregistrée que dans ce navigateur.") + '</p></div><div class="card" id="buO"></div></div>';
  function save(){ try { localStorage.setItem(key, JSON.stringify(st)); } catch(e){} }
  function sum(){ return st.rows.reduce(function(a, r){ return a + (parseFloat(String(r[1]).replace(",", ".")) || 0); }, 0); }
  function out(){
    var s = sum(), left = st.total - s, pct = st.total > 0 ? Math.min(100, s / st.total * 100) : 0, n = st.rows.filter(function(r){ return r[0] || r[1]; }).length, fm = function(x){ return x.toLocaleString(I ? "fr-FR" : "de-DE", { style: "currency", currency: "EUR" }); };
    $("#buO").innerHTML = '<h2 style="margin-top:0">' + L("Übersicht", "Aperçu") + '</h2><div class="bbar"><i style="width:' + pct + '%;background:' + (left < 0 ? "var(--bad)" : "var(--ok)") + '"></i></div><p><b>' + fm(s) + '</b> ' + L("von", "sur") + ' ' + fm(st.total) + '</p><p class="' + (left < 0 ? "bad" : "ok") + '">' + (left >= 0 ? L("Noch frei: ", "Encore disponible : ") + fm(left) : L("Über dem Budget um ", "Au-dessus du budget de ") + fm(-left)) + '</p>' +
      (n ? '<p class="muted">' + L("Durchschnitt pro Person: ", "Moyenne par personne : ") + fm(s / n) + '</p>' : '') + (st.total > 0 && n ? '<p class="muted">' + L("Gleichmäßig verteilt wären das ", "Réparti équitablement, cela ferait ") + fm(st.total / n) + L(" pro Person.", " par personne.") + '</p>' : '');
  }
  function rows(){ var h = $("#buR"); h.innerHTML = ""; st.rows.forEach(function(r, i){ var d = document.createElement("div"); d.className = "burow"; d.innerHTML = '<input class="in" maxlength="40" placeholder="' + L("Name", "Prénom") + '" value="' + esc(r[0]) + '"><input class="in" type="text" inputmode="decimal" maxlength="9" placeholder="€" value="' + esc(r[1]) + '"><button class="btn sm" aria-label="' + L("Entfernen", "Retirer") + '">✕</button>'; var ins = d.querySelectorAll("input"); ins[0].oninput = function(){ r[0] = this.value; save(); out(); }; ins[1].oninput = function(){ r[1] = this.value; save(); out(); }; d.querySelector("button").onclick = function(){ st.rows.splice(i, 1); save(); rows(); out(); }; h.appendChild(d); }); }
  $("#buT").value = st.total; $("#buT").oninput = function(){ st.total = parseFloat(this.value) || 0; save(); out(); };
  $("#buA").onclick = function(){ if (st.rows.length < 40) { st.rows.push(["", ""]); save(); rows(); } }; $("#buC").onclick = function(){ st.rows = [["", ""], ["", ""], ["", ""]]; save(); rows(); out(); };
  rows(); out();
}
reg({ id: "budget", sym: "💶", group: "plan", name: D("Geschenkbudget", "Budget cadeaux"), desc: D("Wer bekommt was, was kostet es, was bleibt übrig? Mit Fortschrittsbalken.", "Qui reçoit quoi, combien ça coûte, que reste-t-il ? Avec barre de progression."), build: budget });

/* ---------- Essen & Plätzchen ---------- */
var DISH = {
  gans: [D("Gänsebraten", "Oie rôtie"), [["Gans (mit Knochen, roh)", "Oie (avec os, crue)", 550, "g"], ["Kartoffeln / Klöße", "Pommes de terre / quenelles", 250, "g"], ["Rotkohl", "Chou rouge", 200, "g"], ["Soße", "Sauce", 100, "ml"]]],
  braten: [D("Braten (Schwein/Rind)", "Rôti (porc/bœuf)"), [["Braten ohne Knochen", "Rôti sans os", 200, "g"], ["Kartoffeln / Klöße", "Pommes de terre / quenelles", 250, "g"], ["Gemüse / Rotkohl", "Légumes / chou rouge", 200, "g"], ["Soße", "Sauce", 100, "ml"]]],
  pute: [D("Pute / Truthahn", "Dinde"), [["Pute (mit Knochen, roh)", "Dinde (avec os, crue)", 450, "g"], ["Kartoffeln", "Pommes de terre", 250, "g"], ["Gemüse", "Légumes", 200, "g"], ["Soße", "Sauce", 100, "ml"]]],
  raclette: [D("Raclette", "Raclette"), [["Raclette-Käse", "Fromage à raclette", 200, "g"], ["Kartoffeln", "Pommes de terre", 300, "g"], ["Fleisch / Aufschnitt", "Viande / charcuterie", 150, "g"], ["Gemüse zum Überbacken", "Légumes à gratiner", 150, "g"]]],
  fondue: [D("Fondue (Fleisch)", "Fondue (viande)"), [["Fleisch", "Viande", 200, "g"], ["Brot / Beilagen", "Pain / accompagnements", 120, "g"], ["Soßen & Dips (zusammen)", "Sauces et dips (au total)", 80, "ml"], ["Salat", "Salade", 100, "g"]]],
  kartoffelsalat: [D("Kartoffelsalat mit Würstchen", "Salade de pommes de terre et saucisses"), [["Kartoffeln", "Pommes de terre", 250, "g"], ["Würstchen", "Saucisses", 2, "Stück"], ["Gurke / Beilage", "Concombre / accompagnement", 60, "g"], ["Senf", "Moutarde", 10, "g"]]]
};
function essen(host){
  var dish = "gans", pers = 6, hunger = 1;
  host.innerHTML = '<div class="xtwo"><div class="card"><div class="tabs"><button class="btn on" data-t="e">' + L("Festessen", "Repas de fête") + '</button><button class="btn" data-t="p">' + L("Plätzchenteig", "Pâte à biscuits") + '</button></div><div id="esE"><label class="l">' + L("Gericht", "Plat") + '</label><div id="esD"></div><div class="rg" style="margin-top:10px"><span>' + L("Personen", "Personnes") + '</span><input type="range" id="esP" min="1" max="30" value="6"><output id="esPo"></output></div><label class="l">' + L("Appetit", "Appétit") + '</label><div id="esH"></div></div>' +
    '<div id="esP2" hidden><div class="rg"><span>' + L("Mehl", "Farine") + '</span><input type="range" id="plM" min="100" max="1000" step="50" value="300"><output id="plMo"></output></div></div></div><div class="card" id="esO"></div></div>';
  var tab = "e";
  function ger(n){ return n.toLocaleString(I ? "fr-FR" : "de-DE", { maximumFractionDigits: 0 }); }
  function out(){
    if (tab === "e") {
      $("#esPo").textContent = pers; var rows = DISH[dish][1].map(function(r){ var v = r[2] * pers * hunger, u = r[3]; if (u === "Stück") return '<tr><td>' + esc(r[I]) + '</td><td>' + Math.ceil(v) + ' ' + L("Stück", "pièces") + '</td></tr>'; if (v >= 1000) return '<tr><td>' + esc(r[I]) + '</td><td>' + (v / 1000).toLocaleString(I ? "fr-FR" : "de-DE", { maximumFractionDigits: 1 }) + ' ' + (u === "g" ? "kg" : "l") + '</td></tr>'; return '<tr><td>' + esc(r[I]) + '</td><td>' + ger(Math.round(v / 10) * 10) + ' ' + u + '</td></tr>'; }).join("");
      $("#esO").innerHTML = '<h2 style="margin-top:0">' + esc(DISH[dish][0][I]) + ' – ' + pers + ' ' + L("Personen", "personnes") + '</h2><table class="et">' + rows + '</table><p class="hint">' + L("Richtwerte aus der Alltagspraxis, keine Garantie. Bei Gästen mit großem Hunger oder Resten für den nächsten Tag lieber etwas mehr einplanen. Garzeiten stehen auf der Verpackung oder im Rezept.", "Valeurs indicatives de la pratique courante, sans garantie. Pour de gros appétits ou des restes pour le lendemain, prévois un peu plus. Les temps de cuisson figurent sur l'emballage ou dans la recette.") + '</p>';
    } else {
      var m = +$("#plM").value; $("#plMo").textContent = m + " g"; var f = m / 300;
      $("#esO").innerHTML = '<h2 style="margin-top:0">' + L("Mürbeteig 3-2-1", "Pâte sablée 3-2-1") + '</h2><table class="et"><tr><td>' + L("Mehl", "Farine") + '</td><td>' + m + ' g</td></tr><tr><td>' + L("Butter (kalt, in Stücken)", "Beurre (froid, en morceaux)") + '</td><td>' + Math.round(m * 2 / 3) + ' g</td></tr><tr><td>' + L("Zucker", "Sucre") + '</td><td>' + Math.round(m / 3) + ' g</td></tr><tr><td>' + L("Eier", "Œufs") + '</td><td>' + (f < 1.3 ? "1" : (Math.round(f * 2) / 2).toString().replace(".", I ? "," : ",")) + '</td></tr><tr><td>' + L("Salz", "Sel") + '</td><td>' + L("1 Prise", "1 pincée") + '</td></tr></table>' +
        '<p>' + L("Etwa ", "Environ ") + Math.round(f * 40) + ' ' + L("Plätzchen (je nach Größe).", "biscuits (selon la taille).") + '</p><p class="hint">' + L("Alles rasch zu einem Teig kneten, mindestens 30 Minuten kalt stellen, ausrollen, ausstechen und bei etwa 180 °C (Ober-/Unterhitze) ca. 8–12 Minuten backen, bis die Ränder goldgelb sind. Ofen und Teigdicke unterscheiden sich – zwischendurch schauen.", "Pétris rapidement le tout en une pâte, laisse reposer au moins 30 minutes au frais, abaisse, découpe et fais cuire à environ 180 °C (chaleur haut/bas) pendant 8 à 12 minutes, jusqu'à ce que les bords soient dorés. Les fours et l'épaisseur varient – surveille la cuisson.") + '</p>';
    }
  }
  XM.chips($("#esD"), Object.keys(DISH).map(function(k){ return [k, DISH[k][0][I]]; }), dish, function(v){ dish = v; out(); });
  XM.chips($("#esH"), [["0.8", L("klein", "petit")], ["1", L("normal", "normal")], ["1.25", L("groß", "grand")]], "1", function(v){ hunger = +v; out(); });
  $("#esP").oninput = function(){ pers = +this.value; out(); }; $("#plM").oninput = out;
  $$(".tabs .btn", host).forEach(function(b){ b.onclick = function(){ tab = b.dataset.t; $$(".tabs .btn", host).forEach(function(x){ x.classList.toggle("on", x === b); }); $("#esE").hidden = tab !== "e"; $("#esP2").hidden = tab !== "p"; out(); }; });
  out();
}
reg({ id: "essen", sym: "🍽️", group: "plan", name: D("Festessen & Plätzchenteig", "Repas de fête et pâte à biscuits"), desc: D("Wie viel Gans, Raclette oder Kartoffeln für wie viele Personen? Dazu ein Mürbeteig zum Skalieren.", "Combien d'oie, de raclette ou de pommes de terre pour combien de personnes ? Avec une pâte sablée à adapter."), build: essen });

/* ---------- Geschenkideen ---------- */
function geschenke(host){
  var cat = "eltern";
  host.innerHTML = '<div class="card"><label class="l">' + L("Für wen?", "Pour qui ?") + '</label><div id="geC"></div><div class="row" style="margin:12px 0"><button class="btn go" id="geR">' + L("Ideen würfeln", "Tirer des idées") + '</button></div><div id="geL" class="wlist"></div><p class="hint">' + L("Das sind Anregungen, keine Kaufempfehlungen für bestimmte Marken. Selbstgemachtes und gemeinsame Zeit sind oft das Schönste.", "Ce sont des pistes, pas des recommandations d'achat pour des marques précises. Le fait maison et le temps partagé sont souvent ce qu'il y a de plus beau.") + '</p></div>';
  XM.chips($("#geC"), Object.keys(XD.G).map(function(k){ return [k, XD.G[k][0][I]]; }), cat, function(v){ cat = v; go(); });
  function go(){ var ideas = XM.shuffle(XD.G[cat][1]).slice(0, 4); $("#geL").innerHTML = ideas.map(function(x){ return '<div class="card wi"><div class="wt">' + esc(x[I]) + '</div><div class="row"><button class="btn sm">' + L("Kopieren", "Copier") + '</button></div></div>'; }).join(""); $$("#geL .wi").forEach(function(el, i){ el.querySelector("button").onclick = function(){ XM.copy(ideas[i][I], this); }; }); }
  $("#geR").onclick = go; go();
}
reg({ id: "geschenke", sym: "🛍️", group: "plan", name: D("Geschenkideen", "Idées de cadeaux"), desc: D("Ideen für Eltern, Kinder, Partner, Technikfans und mehr – oft selbst gemacht oder gemeinsam erlebt.", "Des idées pour parents, enfants, partenaire, passionnés de technique et plus – souvent faites maison ou vécues ensemble."), build: geschenke });

/* ---------- Spieluhr / Klavier ---------- */
var SONGS = {
  jingle: [D("Jingle Bells (Refrain)", "Jingle Bells (refrain)"), 120, "E4 1,E4 1,E4 2,E4 1,E4 1,E4 2,E4 1,G4 1,C4 1.5,D4 .5,E4 4,F4 1,F4 1,F4 1.5,F4 .5,F4 1,E4 1,E4 1,E4 .5,E4 .5,E4 1,D4 1,D4 1,E4 1,D4 2,G4 2"],
  wish: [D("We Wish You a Merry Christmas", "We Wish You a Merry Christmas"), 128, "D4 1,G4 1,G4 .5,A4 .5,G4 .5,F#4 .5,E4 1,E4 1,E4 1,A4 1,A4 .5,B4 .5,A4 .5,G4 .5,F#4 1,D4 1,D4 1,B4 1,B4 .5,C5 .5,B4 .5,A4 .5,G4 1,E4 1,D4 .5,D4 .5,E4 1,A4 1,F#4 1,G4 3"]
};
function freq(n){ var m = n.match(/^([A-G])(#?)(\d)$/); var base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0) + (+m[3] + 1) * 12; return 440 * Math.pow(2, (base - 69) / 12); }
function musik(host){
  var ac = null, token = 0, tempo = 120;
  var KEYS = ["C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5"];
  host.innerHTML = '<div class="card"><div class="piano" id="piano"></div><div class="row" style="margin-top:14px" id="muS2"></div><div class="rg" style="margin-top:10px"><span>' + L("Tempo", "Tempo") + '</span><input type="range" id="muTe" min="60" max="200" value="120"><output id="muTo"></output></div><div class="row"><button class="btn" id="muX">' + L("Stopp", "Stop") + '</button></div>' +
    '<p class="hint">' + L("Klicke oder tippe auf die Tasten. Die beiden Lieder sind einfache, gemeinfreie Melodien in vereinfachter Fassung. Der Ton kommt direkt aus deinem Browser.", "Clique ou touche les touches. Les deux chansons sont des mélodies simples du domaine public, en version simplifiée. Le son est produit directement par ton navigateur.") + '</p></div>';
  var piano = $("#piano"), keyEl = {};
  KEYS.forEach(function(k, i){ var b = document.createElement("button"); var black = k.indexOf("#") > 0; b.className = "pk" + (black ? " blk" : ""); b.dataset.k = k; b.setAttribute("aria-label", k); piano.appendChild(b); keyEl[k] = b; b.addEventListener("pointerdown", function(){ tone(k, .5); }); });
  var wi = 0; KEYS.forEach(function(k){ var b = keyEl[k]; if (k.indexOf("#") < 0) { b.style.left = (wi * 12.5) + "%"; wi++; } });
  KEYS.forEach(function(k, i){ if (k.indexOf("#") > 0) { var prevWhite = keyEl[KEYS[i - 1]]; keyEl[k].style.left = (parseFloat(prevWhite.style.left) + 8.4) + "%"; } });
  function tone(n, dur){
    if (!ac) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return; ac = new C(); } if (ac.state === "suspended") ac.resume();
    var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = "triangle"; o.frequency.value = freq(n);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.35, t + .01); g.gain.exponentialRampToValueAtTime(.0008, t + Math.max(.2, dur)); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + Math.max(.25, dur) + .05);
    var el = keyEl[n]; if (el) { el.classList.add("hit"); setTimeout(function(){ el.classList.remove("hit"); }, Math.min(300, dur * 1000)); }
  }
  function play(id){
    var tk = ++token, notes = SONGS[id][2].split(","), i = 0, spb = 60 / tempo;
    (function next(){ if (tk !== token || i >= notes.length) return; var p = notes[i++].split(" "), n = p[0], b = parseFloat(p[1]); tone(n, b * spb * .95); setTimeout(next, b * spb * 1000); })();
  }
  var h = $("#muS2"); Object.keys(SONGS).forEach(function(k){ var b = document.createElement("button"); b.className = "btn"; b.textContent = "▶ " + SONGS[k][0][I]; b.onclick = function(){ tempo = +$("#muTe").value; play(k); }; h.appendChild(b); });
  $("#muTe").oninput = function(){ tempo = +this.value; $("#muTo").textContent = tempo; }; $("#muTo").textContent = 120; $("#muX").onclick = function(){ token++; };
  XM.onLeave(function(){ token++; if (ac) { try { ac.close(); } catch(e){} } });
}
reg({ id: "musik", sym: "🎹", group: "kreativ", name: D("Weihnachts-Klavier", "Piano de Noël"), desc: D("Spiele auf der Klaviatur im Browser – oder lass „Jingle Bells“ und ein zweites Lied vorspielen.", "Joue sur le clavier dans le navigateur – ou écoute « Jingle Bells » et une seconde chanson."), build: musik });

/* ---------- Brief vom Weihnachtsmann ---------- */
function briefText(p){
  var LL = XD.L, r = XM.rng(XM.hash(p.n + "|" + p.s)), pk = function(a){ return a[Math.floor(r() * a.length)][I]; }, name = p.n || L("Freund", "mon ami");
  var paras = [pk(LL.gruss).replace("{name}", name), pk(LL.intro)];
  var sel = p.d.map(function(i){ return LL.deeds[i][I]; });
  if (sel.length) paras.push(pk(LL.lob) + "\n" + sel.map(function(s){ return "• " + s; }).join("\n"));
  paras.push((p.w ? pk(LL.wunsch).replace("{w}", p.w) : pk(LL.wunschleer)), pk(LL.rat), pk(LL.schluss));
  paras.push(L("Dein ", "Ton ") + p.o); paras.push(pk(LL.ps));
  return paras.map(function(x){ return XM.fr(x); });
}
function briefDraw(p){
  return function(ctx, W, H){
    var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#fbf0d3"); g.addColorStop(1, "#f1dfb0"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#b3202f"; ctx.lineWidth = 4; XM.rrect(ctx, 20, 20, W - 40, H - 40, 10); ctx.stroke(); ctx.strokeStyle = "#2f6b3d"; ctx.lineWidth = 2; XM.rrect(ctx, 30, 30, W - 60, H - 60, 6); ctx.stroke();
    ctx.fillStyle = "#b3202f"; XM.star(ctx, W / 2, 66, 16, 5, .45); ctx.fill();
    var paras = briefText(p), text = paras.join("\n\n"), size = 22, lines;
    ctx.fillStyle = "#3a2a1a"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    for (; size >= 11; size--) { ctx.font = "500 " + size + "px " + FONT; lines = XM.wrap(ctx, text, W - 120); if (lines.length * size * 1.4 <= H - 170) break; }
    lines.forEach(function(l, i){ ctx.fillText(l, 60, 120 + i * size * 1.4); });
    XM.watermark(ctx, W, H, { light: true });
  };
}
function brief(host){
  var p = { n: "", d: [], w: "", o: L("Weihnachtsmann", "Père Noël"), s: 0 }, W = 600, H = 850, cv;
  host.innerHTML = '<div class="xtwo"><div class="card"><label class="l">' + L("Name des Kindes (oder der Person)", "Prénom de l'enfant (ou de la personne)") + '</label><input class="in" id="brN" maxlength="30"><label class="l">' + L("Absender", "Expéditeur") + '</label><div id="brO"></div><label class="l">' + L("Was war dieses Jahr besonders gut?", "Qu'est-ce qui s'est particulièrement bien passé cette année ?") + '</label><div id="brD" class="checks"></div>' +
    '<label class="l">' + L("Wunsch (optional)", "Souhait (facultatif)") + '</label><input class="in" id="brW" maxlength="60" placeholder="' + L("z. B. ein Fahrrad", "p. ex. un vélo") + '"><div class="row" style="margin-top:12px"><button class="btn" id="brR">' + L("Anderer Text", "Autre texte") + '</button></div></div>' +
    '<div><div class="cvwrap" style="max-width:520px"><canvas id="brC"></canvas></div><div class="row" style="margin:10px 0"><button class="btn go" id="brS">' + L("Als Bild speichern", "Enregistrer en image") + '</button><button class="btn" id="brP">' + L("Drucken", "Imprimer") + '</button></div><p class="hint">' + L("Der Brief wird nur auf deinem Gerät erstellt. Es gibt bewusst keinen Link, damit der Name des Kindes nirgends im Netz auftaucht.", "La lettre est créée uniquement sur ton appareil. Il n'y a volontairement pas de lien, pour que le prénom de l'enfant n'apparaisse nulle part sur le web.") + '</p></div></div>';
  function redraw(){ if (cv) cv.stop(); cv = XM.animate($("#brC"), W, H, "retro", briefDraw(p), { still: 1 }); cv.draw(); }
  XM.chips($("#brO"), [["Weihnachtsmann", L("Weihnachtsmann", "Père Noël")], ["Christkind", L("Christkind", "Enfant Jésus")]], "Weihnachtsmann", function(v){ p.o = v === "Christkind" ? L("Christkind", "Enfant Jésus") : L("Weihnachtsmann", "Père Noël"); redraw(); });
  XD.L.deeds.forEach(function(d, i){ var l = document.createElement("label"); l.className = "chk"; l.innerHTML = '<input type="checkbox" data-i="' + i + '"> ' + esc(d[I]); l.querySelector("input").onchange = function(){ p.d = $$("#brD input:checked").map(function(x){ return +x.dataset.i; }); redraw(); }; $("#brD").appendChild(l); });
  $("#brN").oninput = function(){ p.n = XM.norm(this.value); redraw(); }; $("#brW").oninput = function(){ p.w = XM.norm(this.value); redraw(); }; $("#brR").onclick = function(){ p.s++; redraw(); };
  $("#brS").onclick = function(){ cv.png(2, "brief-weihnachtsmann"); };
  $("#brP").onclick = function(){ document.body.classList.add("print-brief"); window.print(); setTimeout(function(){ document.body.classList.remove("print-brief"); }, 500); };
  redraw();
}
reg({ id: "brief", sym: "✉️", group: "geben", name: D("Brief vom Weihnachtsmann", "Lettre du Père Noël"), desc: D("Ein persönlicher Antwortbrief mit Lob und Wunsch – zum Ausdrucken für Kinder.", "Une lettre de réponse personnelle avec félicitations et souhait – à imprimer pour les enfants."), build: brief });
})();
