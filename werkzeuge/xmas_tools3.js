// Weihnachtswelt – Werkzeuge Teil 3: Sprüche, Vorlagen, Checkliste, Papier (Tischkarten, Menü, Anhänger), Rezepte, Weltgrüße, Wissen.
(function(){
"use strict";
var XM = window.XM, I = XM.I, L = XM.L, $ = XM.$, $$ = XM.$$, esc = XM.esc;
function reg(t){ XM.tools.push(t); }
var D = function(de, fr){ return [de, fr]; };
function toTxt(name, text){ WZ.speichern(new Blob([text], { type: "text/plain;charset=utf-8" }), name); }
function goSpruch(txt){ try { sessionStorage.setItem("xm-spruch", txt); } catch(e){} location.hash = "#/spruch"; }
function goKarte(txt){ try { sessionStorage.setItem("xm-msg", txt); } catch(e){} location.hash = "#/karte"; }

/* ---------- Spruchsammlung ---------- */
function sprueche(host){
  var cat = "alle", q = "";
  host.innerHTML = '<div class="card"><label class="l">' + L("Kategorie", "Catégorie") + '</label><div id="spcC"></div><label class="l">' + L("Suchen (optional)", "Rechercher (facultatif)") + '</label><input class="in" id="spcQ" maxlength="40" placeholder="' + L("z. B. Licht, Team, Danke", "p. ex. lumière, équipe, merci") + '">' +
    '<div class="row" style="margin-top:10px"><button class="btn go" id="spcR">' + L("🎲 Zufälliger Spruch", "🎲 Citation au hasard") + '</button></div></div><div id="spcX"></div><div id="spcL" class="wlist"></div>';
  var all = []; XD.SPG.forEach(function(g){ XD.SP[g[0]].forEach(function(s){ all.push([g[0], s]); }); });
  XM.chips($("#spcC"), [["alle", L("Alle (" + all.length + ")", "Tous (" + all.length + ")")]].concat(XD.SPG.map(function(g){ return [g[0], g[1][I]]; })), cat, function(v){ cat = v; list(); });
  function card(s, big){ return '<div class="card wi' + (big ? ' big' : '') + '"><div class="wt">' + esc(XM.fr(s[I])) + '</div><div class="row"><button class="btn sm" data-c>' + L("Kopieren", "Copier") + '</button><button class="btn sm" data-b>' + L("Als Bild", "En image") + '</button><button class="btn sm" data-k>' + L("Auf Karte", "Sur une carte") + '</button></div></div>'; }
  function wire(el, s){ el.querySelector("[data-c]").onclick = function(){ XM.copy(XM.fr(s[I]), this); }; el.querySelector("[data-b]").onclick = function(){ goSpruch(XM.fr(s[I])); }; el.querySelector("[data-k]").onclick = function(){ goKarte(XM.fr(s[I])); }; }
  function list(){
    var f = all.filter(function(x){ return (cat === "alle" || x[0] === cat) && (!q || x[1][I].toLowerCase().indexOf(q) >= 0); });
    $("#spcL").innerHTML = f.length ? f.map(function(x){ return card(x[1]); }).join("") : '<p class="muted">' + L("Nichts gefunden.", "Rien trouvé.") + '</p>';
    $$("#spcL .wi").forEach(function(el, i){ wire(el, f[i][1]); });
  }
  $("#spcQ").oninput = function(){ q = this.value.trim().toLowerCase(); list(); };
  $("#spcR").onclick = function(){ var s = XM.pick(all)[1]; $("#spcX").innerHTML = card(s, true); wire($("#spcX .wi"), s); };
  list();
}
reg({ id: "sprueche", sym: "✍️", group: "geben", name: D("Spruchsammlung", "Recueil de citations"), desc: D("Über 90 eigene Weihnachtssprüche: besinnlich, humorvoll, für den Beruf, für Familie und Liebe – zum Kopieren, als Bild oder auf der Karte.", "Plus de 90 phrases de Noël originales : paisibles, drôles, pour le travail, la famille et l'amour – à copier, en image ou sur une carte."), build: sprueche });

/* ---------- Vorlagen für Mails und Briefe ---------- */
function vorlagen(host){
  var cur = XD.VL[0], tone = "f", vals = {};
  host.innerHTML = '<div class="xtwo"><div class="card"><label class="l">' + L("Vorlage", "Modèle") + '</label><div id="vlT"></div><label class="l">' + L("Ton", "Ton") + '</label><div id="vlN"></div><div id="vlF"></div></div>' +
    '<div class="card"><label class="l" style="margin-top:0">' + L("Betreff", "Objet") + '</label><input class="in" id="vlS"><label class="l">' + L("Text", "Texte") + '</label><textarea class="in" id="vlB" rows="16"></textarea>' +
    '<div class="row" style="margin-top:10px"><button class="btn go" id="vlC">' + L("Text kopieren", "Copier le texte") + '</button><button class="btn" id="vlCs">' + L("Betreff kopieren", "Copier l'objet") + '</button><a class="btn" id="vlM" href="#">' + L("E-Mail öffnen", "Ouvrir l'e-mail") + '</a><button class="btn" id="vlD">' + L("Als Textdatei", "En fichier texte") + '</button></div>' +
    '<p class="hint">' + L("Was noch in [eckigen Klammern] steht, trägst du links ein oder änderst es direkt im Text. Alles bleibt in deinem Browser.", "Ce qui reste entre [crochets] se complète à gauche ou directement dans le texte. Tout reste dans ton navigateur.") + '</p></div></div>';
  function def(){ return XD.VF.anrede[tone === "f" ? 1 : 2][I]; }
  function fields(){
    $("#vlF").innerHTML = cur.felder.map(function(k){ var f = XD.VF[k]; return '<label class="l">' + f[0][I] + '</label><input class="in" data-k="' + k + '" maxlength="' + (k === "vertr" ? 120 : 80) + '" value="' + esc(vals[k] || "") + '"' + (k === "anrede" ? ' placeholder="' + esc(def()) + '"' : '') + '>'; }).join("");
    $$("#vlF input").forEach(function(inp){ inp.oninput = function(){ vals[inp.dataset.k] = inp.value; out(); }; });
  }
  function out(){
    var body = cur.t[tone][I].replace(/\{(\w+)\}/g, function(m, k){
      var v = (vals[k] || "").trim();
      if (k === "anrede") { v = v || def(); if (!/[,!:]$/.test(v)) v += ","; return v; }
      return v || "[" + XD.VF[k][0][I] + "]";
    });
    $("#vlS").value = cur.s[tone][I]; $("#vlB").value = XM.fr(body); mail();
  }
  function mail(){ $("#vlM").href = "mailto:?subject=" + encodeURIComponent($("#vlS").value) + "&body=" + encodeURIComponent($("#vlB").value.replace(/\n/g, "\r\n")); }
  XM.chips($("#vlT"), XD.VL.map(function(v){ return [v.id, v.name[I]]; }), cur.id, function(id){ cur = XD.VL.filter(function(v){ return v.id === id; })[0]; fields(); out(); });
  XM.chips($("#vlN"), [["f", L("Förmlich (Sie)", "Formel (vous)")], ["p", L("Persönlich (du)", "Personnel (tu)")]], tone, function(v){ tone = v; fields(); out(); });
  $("#vlS").oninput = mail; $("#vlB").oninput = mail;
  $("#vlC").onclick = function(){ XM.copy($("#vlB").value, this); }; $("#vlCs").onclick = function(){ XM.copy($("#vlS").value, this); };
  $("#vlD").onclick = function(){ toTxt("weihnachtsgruss.txt", $("#vlS").value + "\n\n" + $("#vlB").value); };
  fields(); out();
}
reg({ id: "vorlagen", sym: "📧", group: "beruf", name: D("Mail- & Briefvorlagen", "Modèles d'e-mails et de lettres"), desc: D("Weihnachtspost für Kunden, Team und Partner, Betriebsferien, Abwesenheitsnotiz, Einladungen und Absagen – förmlich oder persönlich.", "Courrier de Noël pour clients, équipe et partenaires, fermeture, message d'absence, invitations et refus – formel ou personnel."), build: vorlagen });

/* ---------- Checkliste ---------- */
function planer(host){
  var key = "xm-plan", st = { done: {}, extra: [] };
  try { var o = JSON.parse(localStorage.getItem(key) || "null"); if (o && o.done) st = o; } catch(e){}
  var STARTS = [[10, 1], [10, 20], [11, 1], [11, 8], [11, 15], [11, 20], [11, 24], [11, 25], [11, 27]];
  function nowIdx(){
    var d = new Date(), m = d.getMonth(), t = d.getDate(), r = -1;
    if (m < 10 && !(m === 0 && t <= 6)) return -1;
    if (m === 0) return XD.PL.length - 1;
    STARTS.forEach(function(s, i){ if (m > s[0] || (m === s[0] && t >= s[1])) r = i; });
    return r;
  }
  function days(){ var d = new Date(), y = d.getFullYear(), tgt = new Date(y, 11, 24); if (d > new Date(y, 11, 25)) tgt = new Date(y + 1, 11, 24); return Math.ceil((tgt - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5); }
  host.innerHTML = '<div class="card"><div id="plH"></div><div class="bbar"><i id="plB" style="width:0;background:var(--ok)"></i></div><p id="plP" class="muted"></p><div class="row"><select class="in" id="plS" style="max-width:220px"></select><input class="in" id="plX" maxlength="80" placeholder="' + L("Eigene Aufgabe …", "Ma propre tâche …") + '" style="flex:1;min-width:160px"><button class="btn" id="plA">' + L("Hinzufügen", "Ajouter") + '</button></div></div><div id="plL"></div>' +
    '<div class="row" style="margin:12px 0"><button class="btn" id="plPr">' + L("Drucken / als PDF", "Imprimer / en PDF") + '</button><button class="btn" id="plR">' + L("Haken zurücksetzen", "Réinitialiser les coches") + '</button></div><p class="hint">' + L("Die Haken und eigene Aufgaben werden nur in diesem Browser gespeichert.", "Les coches et tes propres tâches ne sont enregistrées que dans ce navigateur.") + '</p>';
  $("#plS").innerHTML = XD.PL.map(function(s, i){ return '<option value="' + i + '">' + esc(s[0][I]) + '</option>'; }).join("");
  function save(){ try { localStorage.setItem(key, JSON.stringify(st)); } catch(e){} }
  function render(){
    var total = 0, done = 0, cur = nowIdx();
    $("#plL").innerHTML = XD.PL.map(function(s, i){
      var items = s[1].map(function(t, j){ return ["a" + i + "_" + j, t[I]]; }).concat(st.extra.filter(function(e){ return e.s === i; }).map(function(e, j){ return ["x" + e.id, e.t, e.id]; }));
      return '<div class="card plsec' + (i === cur ? ' now' : '') + '"><h2>' + esc(s[0][I]) + (i === cur ? ' <span class="badge">' + L("jetzt", "maintenant") + '</span>' : '') + '</h2>' + items.map(function(it){
        total++; var on = !!st.done[it[0]]; if (on) done++;
        return '<label class="chk plrow' + (on ? ' on' : '') + '"><input type="checkbox" data-id="' + it[0] + '"' + (on ? ' checked' : '') + '> <span>' + esc(it[1]) + '</span>' + (it[2] ? ' <button class="btn sm" data-del="' + it[2] + '" type="button" aria-label="x">✕</button>' : '') + '</label>';
      }).join("") + '</div>';
    }).join("");
    $("#plB").style.width = (total ? done / total * 100 : 0) + "%";
    $("#plP").textContent = L(done + " von " + total + " Aufgaben erledigt", done + " tâches sur " + total + " accomplies");
    $("#plH").innerHTML = '<b style="font-size:20px">' + L("Noch " + days() + " Tage bis Heiligabend", days() + " jours avant le réveillon") + '</b>';
    $$("#plL input").forEach(function(c){ c.onchange = function(){ if (c.checked) st.done[c.dataset.id] = 1; else delete st.done[c.dataset.id]; save(); render(); }; });
    $$("#plL [data-del]").forEach(function(b){ b.onclick = function(e){ e.preventDefault(); st.extra = st.extra.filter(function(x){ return String(x.id) !== b.dataset.del; }); save(); render(); }; });
  }
  $("#plA").onclick = function(){ var t = XM.norm($("#plX").value); if (!t) return; st.extra.push({ id: Date.now(), s: +$("#plS").value, t: t }); $("#plX").value = ""; save(); render(); };
  $("#plX").onkeydown = function(e){ if (e.key === "Enter") $("#plA").click(); };
  $("#plR").onclick = function(){ st.done = {}; save(); render(); };
  $("#plPr").onclick = function(){ window.print(); };
  render();
}
reg({ id: "planer", sym: "✅", group: "plan", name: D("Weihnachts-Checkliste", "Liste de tâches de Noël"), desc: D("Von November bis Silvester: rund 50 Aufgaben nach Zeitabschnitten, mit Haken, eigenen Punkten und Fortschritt.", "De novembre à la Saint-Sylvestre : une cinquantaine de tâches par période, avec coches, tâches personnelles et progression."), build: planer });

/* ---------- Papier: Tischkarten, Menükarte, Geschenkanhänger ---------- */
var PAL = { rot: ["#b3202f", "#fff3f0", "#e8b4b8"], gruen: ["#1f6b3d", "#f3fbf4", "#a8d5b5"], gold: ["#9a6b0a", "#fff9e8", "#e8d28c"], blau: ["#1d4e89", "#f1f7ff", "#a9c6ea"] };
function papier(host){
  var tab = "tisch", pal = "rot", names = "Anna\nBen\nClara\nDavid", menu = { t: L("Weihnachtsmenü", "Menu de Noël"), s: "", l: L("Vorspeise: Kürbissuppe mit Kernöl\nHauptgang: Gänsebraten, Rotkohl und Klöße\nDessert: Bratapfel mit Vanillesoße", "Entrée : velouté de potiron\nPlat : oie rôtie, chou rouge et boulettes de pommes de terre\nDessert : pomme au four, sauce vanille") }, tag = { a: "", v: "", t: L("Frohe Weihnachten!", "Joyeux Noël !") };
  host.innerHTML = '<div class="xtwo"><div class="card"><div id="paT"></div><div id="paC"></div><label class="l">' + L("Farbe", "Couleur") + '</label><div id="paP"></div><div class="row" style="margin-top:14px"><button class="btn go" id="paPr">' + L("Drucken / als PDF speichern", "Imprimer / enregistrer en PDF") + '</button></div>' +
    '<p class="hint">' + L("Im Druckdialog „Als PDF speichern“ wählen, wenn du eine Datei möchtest. Papierformat A4, Ränder „Standard“.", "Dans la fenêtre d'impression, choisis « Enregistrer au format PDF » pour obtenir un fichier. Format A4, marges « standard ».") + '</p></div><div><div id="paS" class="sheet"></div></div></div>';
  function ctrl(){
    var c = $("#paC");
    if (tab === "tisch") c.innerHTML = '<label class="l">' + L("Namen (einer pro Zeile)", "Prénoms (un par ligne)") + '</label><textarea class="in" id="paN" rows="7" maxlength="900"></textarea>';
    else if (tab === "menue") c.innerHTML = '<label class="l">' + L("Titel", "Titre") + '</label><input class="in" id="paMt" maxlength="40"><label class="l">' + L("Untertitel (Datum, Ort)", "Sous-titre (date, lieu)") + '</label><input class="in" id="paMs" maxlength="60"><label class="l">' + L("Gänge (eine Zeile pro Gang)", "Plats (une ligne par plat)") + '</label><textarea class="in" id="paMl" rows="8" maxlength="700"></textarea>';
    else c.innerHTML = '<label class="l">' + L("An (einer pro Zeile, leer = Blanko-Anhänger)", "Pour (un par ligne, vide = étiquettes vierges)") + '</label><textarea class="in" id="paTa" rows="5" maxlength="700"></textarea><label class="l">' + L("Von", "De la part de") + '</label><input class="in" id="paTv" maxlength="40"><label class="l">' + L("Text", "Texte") + '</label><input class="in" id="paTt" maxlength="60">';
    if (tab === "tisch") { $("#paN").value = names; $("#paN").oninput = function(){ names = this.value; draw(); }; }
    else if (tab === "menue") { $("#paMt").value = menu.t; $("#paMs").value = menu.s; $("#paMl").value = menu.l; $("#paMt").oninput = function(){ menu.t = this.value; draw(); }; $("#paMs").oninput = function(){ menu.s = this.value; draw(); }; $("#paMl").oninput = function(){ menu.l = this.value; draw(); }; }
    else { $("#paTa").value = tag.a; $("#paTv").value = tag.v; $("#paTt").value = tag.t; $("#paTa").oninput = function(){ tag.a = this.value; draw(); }; $("#paTv").oninput = function(){ tag.v = this.value; draw(); }; $("#paTt").oninput = function(){ tag.t = this.value; draw(); }; }
  }
  function draw(){
    var c = PAL[pal], S = $("#paS"); S.style.setProperty("--pc", c[0]); S.style.setProperty("--pb", c[1]); S.style.setProperty("--pl", c[2]); S.className = "sheet sheet-" + tab;
    if (tab === "tisch") {
      var ns = names.split("\n").map(XM.norm).filter(Boolean).slice(0, 40); if (!ns.length) ns = [""];
      S.innerHTML = ns.map(function(n){ return '<div class="tkarte"><div class="tk-s">✦ ✦ ✦</div><div class="tk-n">' + esc(n) + '</div><div class="tk-s small">' + L("Frohe Weihnachten", "Joyeux Noël") + '</div></div>'; }).join("");
    } else if (tab === "menue") {
      var ls = menu.l.split("\n").map(function(x){ return x.trim(); }).filter(Boolean);
      S.innerHTML = '<div class="mkarte"><div class="mk-o">✦</div><div class="mk-t">' + esc(menu.t) + '</div>' + (menu.s ? '<div class="mk-u">' + esc(menu.s) + '</div>' : '') + '<div class="mk-l"></div>' + ls.map(function(l){ var m = l.match(/^([^:]{1,24}):\s*(.+)$/); return m ? '<div class="mk-g"><small>' + esc(m[1]) + '</small><span>' + esc(m[2]) + '</span></div>' : '<div class="mk-g"><span>' + esc(l) + '</span></div>'; }).join("") + '<div class="mk-o">✦ ✦ ✦</div></div>';
    } else {
      var an = tag.a.split("\n").map(XM.norm).filter(Boolean).slice(0, 40); if (!an.length) an = ["", "", "", "", "", "", "", ""];
      S.innerHTML = an.map(function(n){ return '<div class="anh"><div class="anh-h"></div><div class="anh-t">' + esc(tag.t) + '</div>' + (n ? '<div class="anh-n">' + L("für", "pour") + ' <b>' + esc(n) + '</b></div>' : '<div class="anh-n blank">' + L("für ____________", "pour ____________") + '</div>') + (tag.v ? '<div class="anh-v">' + L("von", "de la part de") + ' ' + esc(tag.v) + '</div>' : '<div class="anh-v blank">' + L("von ____________", "de ____________") + '</div>') + '</div>'; }).join("");
    }
  }
  XM.chips($("#paT"), [["tisch", L("Tischkarten", "Marque-places")], ["menue", L("Menükarte", "Carte de menu")], ["anh", L("Geschenkanhänger", "Étiquettes cadeaux")]], tab, function(v){ tab = v; ctrl(); draw(); });
  XM.chips($("#paP"), [["rot", L("Rot", "Rouge")], ["gruen", L("Grün", "Vert")], ["gold", L("Gold", "Or")], ["blau", L("Blau", "Bleu")]], pal, function(v){ pal = v; draw(); });
  $("#paPr").onclick = function(){ window.print(); };
  ctrl(); draw();
}
reg({ id: "papier", sym: "🍽️", group: "plan", name: D("Tischkarten, Menü & Anhänger", "Marque-places, menu et étiquettes"), desc: D("Zum Ausdrucken: Namenskärtchen für die Festtafel, eine schöne Menükarte und Geschenkanhänger – in vier Farben.", "À imprimer : marque-places pour la table de fête, une belle carte de menu et des étiquettes cadeaux – en quatre couleurs."), build: papier });

/* ---------- Rezepte ---------- */
function zahl(n, einheit){
  if (einheit === "pr" || einheit === "st") { var r = Math.round(n * 2) / 2; if (r < .5) r = .5; var w = Math.floor(r); return (w ? w : "") + (r - w ? "½" : ""); }
  if (n >= 100) return String(Math.round(n / 5) * 5);
  if (n >= 10) return String(Math.round(n));
  return String(Math.round(n * 10) / 10).replace(".", I ? "," : ",");
}
function rezepte(host){
  var cur = null, n = 0, cat = "alle", q = "";
  function byId(id){ return XD.REZ.filter(function(r){ return r.id === id; })[0]; }
  host.innerHTML = '<div class="card"><label class="l" style="margin-top:0">' + L("Kategorie", "Catégorie") + '</label><div id="reC"></div><input id="reQ" class="in" type="search" placeholder="' + L("Rezept suchen …", "Chercher une recette …") + '" style="margin-top:8px"></div><div id="reG" class="rgrid"></div><div id="reO"></div>';
  XM.chips($("#reC"), XD.RCAT.map(function(c){ return [c[0], c[1][I]]; }), cat, function(v){ cat = v; grid(); });
  $("#reQ").oninput = function(){ q = XM.norm(this.value).toLowerCase(); grid(); };
  function pic(r, uid){ return '<div class="rpic">' + XM.dish(r, uid) + '<img src="bilder/rezepte/' + r.id + '.jpg" alt="" loading="lazy" onerror="this.remove()"></div>'; }
  function grid(){
    var list = XD.REZ.filter(function(r){ return (cat === "alle" || r.cat === cat) && (!q || (r.name[I] + " " + r.name[0]).toLowerCase().indexOf(q) >= 0); });
    $("#reG").innerHTML = list.length ? list.map(function(r){ return '<button class="rtile' + (cur && cur.id === r.id ? ' on' : '') + '" data-id="' + r.id + '">' + pic(r, "g" + r.id) + '<span class="rtn">' + esc(r.name[I]) + '</span><span class="rtm">⏱ ' + esc(r.zeit[I]) + (r.level ? ' · ' + XD.RLV[r.level][I] : '') + '</span></button>'; }).join("") : '<p class="muted">' + L("Nichts gefunden.", "Rien trouvé.") + '</p>';
    $$("#reG .rtile").forEach(function(b){ b.onclick = function(){ cur = byId(b.getAttribute("data-id")); n = cur.serv; show(); grid(); var o = $("#reO"); if (o.scrollIntoView) o.scrollIntoView({ behavior: "smooth", block: "start" }); }; });
  }
  function show(){
    if (!cur) { $("#reO").innerHTML = ""; return; }
    var step = cur.serv >= 20 ? 10 : 1, f = n / cur.serv;
    var lines = cur.ing.map(function(g){ var u = XD.REZU[g[1]][I], a = zahl(g[0] * f, g[1]); return [a + (u ? " " + u : ""), g[2][I]]; });
    $("#reO").innerHTML = '<div class="xtwo keep"><div class="card"><div class="rbig">' + pic(cur, "b" + cur.id) + '</div><h2 style="margin-top:10px">' + cur.sym + ' ' + esc(cur.name[I]) + '</h2><p class="muted">⏱ ' + esc(cur.zeit[I]) + (cur.level ? ' · ' + L("Schwierigkeit", "Difficulté") + ': ' + XD.RLV[cur.level][I] : '') + '</p>' +
      '<div class="row" style="margin:6px 0 10px"><b>' + esc(cur.einh[I].charAt(0).toUpperCase() + cur.einh[I].slice(1)) + ':</b><button class="btn sm" id="reM" aria-label="−">−</button><b id="reN" style="min-width:2ch;text-align:center">' + n + '</b><button class="btn sm" id="reP" aria-label="+">+</button></div>' +
      '<table class="et">' + lines.map(function(l){ return '<tr><td>' + esc(l[1]) + '</td><td>' + esc(l[0]) + '</td></tr>'; }).join("") + '</table><div class="row"><button class="btn sm" id="reK">' + L("Einkaufsliste kopieren", "Copier la liste de courses") + '</button><button class="btn sm" id="reD">' + L("Drucken", "Imprimer") + '</button></div></div>' +
      '<div class="card"><h2 style="margin-top:0">' + L("Zubereitung", "Préparation") + '</h2><ol class="resteps">' + cur.st.map(function(s){ return '<li>' + esc(s[I]) + '</li>'; }).join("") + '</ol><p class="hint">' + L("Mengen sind Richtwerte. Backzeiten hängen vom Ofen ab – nach Sicht prüfen. Die Bilder sind gezeichnete Illustrationen.", "Les quantités sont indicatives. Les temps de cuisson dépendent du four : vérifie à vue. Les images sont des illustrations dessinées.") + '</p></div></div>';
    $("#reM").onclick = function(){ n = Math.max(step, n - step); show(); }; $("#reP").onclick = function(){ n = Math.min(cur.serv * 6, n + step); show(); };
    $("#reK").onclick = function(){ XM.copy(cur.name[I] + " (" + n + " " + cur.einh[I] + ")\n" + lines.map(function(l){ return "- " + l[0] + " " + l[1]; }).join("\n"), this); };
    $("#reD").onclick = function(){ window.print(); };
  }
  grid();
}
reg({ id: "rezepte", sym: "👩‍🍳", group: "plan", name: D("Festtagsrezepte", "Recettes de fête"), desc: D("Über 30 Rezepte mit gezeichneten Bildern: Plätzchen, Gans, Rouladen, Lachs, Suppen, Beilagen, Desserts, Glühwein & Punsch – mit Mengenrechner und Einkaufsliste.", "Plus de 30 recettes illustrées : biscuits, oie, paupiettes, saumon, soupes, accompagnements, desserts, vin chaud et punch – avec calculateur et liste de courses."), build: rezepte });

/* ---------- Weltgrüße ---------- */
function welt(host){
  var q = "";
  host.innerHTML = '<div class="card"><label class="l" style="margin-top:0">' + L("Sprache suchen", "Chercher une langue") + '</label><input class="in" id="weQ" maxlength="30" placeholder="' + L("z. B. Japanisch", "p. ex. japonais") + '"><div class="row" style="margin-top:10px"><button class="btn go" id="weR">' + L("🎲 Zufallsgruß", "🎲 Vœu au hasard") + '</button><button class="btn" id="weA">' + L("Alle als Liste kopieren", "Copier la liste complète") + '</button></div></div><div id="weX"></div><div class="xgrid" id="weG"></div>';
  function item(w, i){ return '<div class="card wcard" data-i="' + i + '"><div class="wlang">' + esc(w[I]) + '</div><div class="wgr" lang="x">' + esc(w[2]) + '</div><div class="row"><button class="btn sm" data-c>' + L("Kopieren", "Copier") + '</button><button class="btn sm" data-b>' + L("Als Bild", "En image") + '</button></div></div>'; }
  function wire(root){ $$(".wcard", root).forEach(function(el){ var w = XD.WELT[+el.dataset.i]; el.querySelector("[data-c]").onclick = function(){ XM.copy(w[2], this); }; el.querySelector("[data-b]").onclick = function(){ goSpruch(w[2] + "\n(" + w[I] + ")"); }; }); }
  function list(){ var f = []; XD.WELT.forEach(function(w, i){ if (!q || (w[0] + " " + w[1] + " " + w[2]).toLowerCase().indexOf(q) >= 0) f.push(item(w, i)); }); $("#weG").innerHTML = f.join("") || '<p class="muted">' + L("Nichts gefunden.", "Rien trouvé.") + '</p>'; wire($("#weG")); }
  $("#weQ").oninput = function(){ q = this.value.trim().toLowerCase(); list(); };
  $("#weR").onclick = function(){ var i = Math.floor(Math.random() * XD.WELT.length); $("#weX").innerHTML = '<div class="xgrid" style="grid-template-columns:minmax(0,420px)">' + item(XD.WELT[i], i).replace("wcard", "wcard big") + '</div>'; wire($("#weX")); };
  $("#weA").onclick = function(){ XM.copy(XD.WELT.map(function(w){ return w[I] + ": " + w[2]; }).join("\n"), this); };
  list();
}
reg({ id: "welt", sym: "🌍", group: "wissen", name: D("Frohe Weihnachten weltweit", "Joyeux Noël dans le monde"), desc: D("Der Weihnachtsgruß in " + XD.WELT.length + " Sprachen – zum Kopieren oder als Bild.", "Les vœux de Noël en " + XD.WELT.length + " langues – à copier ou en image."), build: welt });

/* ---------- Weihnachtswissen ---------- */
function wissen(host){
  var cat = "alle";
  host.innerHTML = '<div class="card"><label class="l" style="margin-top:0">' + L("Thema", "Thème") + '</label><div id="wiC"></div><div class="row" style="margin-top:10px"><button class="btn go" id="wiR">' + L("🎲 Zufälliger Fakt", "🎲 Fait au hasard") + '</button></div></div><div id="wiX"></div><div id="wiL" class="wlist"></div>';
  XM.chips($("#wiC"), XD.WG.map(function(g){ return [g[0], g[1][I]]; }), cat, function(v){ cat = v; list(); });
  function card(f, big){ return '<div class="card wi' + (big ? ' big' : '') + '"><div class="wt">' + esc(f[1 + I]) + '</div><div class="row"><button class="btn sm" data-c>' + L("Kopieren", "Copier") + '</button></div></div>'; }
  function wire(root, arr){ $$(".wi", root).forEach(function(el, i){ el.querySelector("[data-c]").onclick = function(){ XM.copy(arr[i][1 + I], this); }; }); }
  function list(){ var f = XD.WISS.filter(function(x){ return cat === "alle" || x[0] === cat; }); $("#wiL").innerHTML = f.map(function(x){ return card(x); }).join(""); wire($("#wiL"), f); }
  $("#wiR").onclick = function(){ var f = XM.pick(XD.WISS); $("#wiX").innerHTML = card(f, true); wire($("#wiX"), [f]); };
  list();
}
reg({ id: "wissen", sym: "💡", group: "wissen", name: D("Wusstest du schon?", "Le savais-tu ?"), desc: D(XD.WISS.length + " Fakten über Bräuche, Geschichte, Essen und Lieder – von Island bis Japan.", XD.WISS.length + " faits sur les traditions, l'histoire, la cuisine et les chansons – de l'Islande au Japon."), build: wissen });
})();
