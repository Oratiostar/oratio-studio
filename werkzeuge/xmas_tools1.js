// Weihnachtswelt – Werkzeuge Teil 1: Karte, Wünsche, Wichteln, Adventskalender, Countdown, Wunschzettel, Gutschein.
(function(){
"use strict";
var XM = window.XM, I = XM.I, L = XM.L, $ = XM.$, $$ = XM.$$, esc = XM.esc, TH = XM.themes, FONT = XM.FONT;
function reg(t){ XM.tools.push(t); }
var D = function(de, fr){ return [de, fr]; };

/* ---------- Wunschtexte erzeugen (gemeinsam genutzt) ---------- */
function nameFix(txt, name){
  var n = name ? ", " + name : "";
  txt = txt.replace(/\{n\}(?= [A-Za-zÀ-ÿ])/g, n ? n + "," : "").replace(/\{n\}/g, n);
  return XM.fr(txt);
}
XM.wish = function(style, name){
  var W = XD.W[style], pick = XM.pick, txt;
  if (style === "kurz") txt = pick(W.K)[I];
  else if (style === "reim") { var a = pick(W.R), b; do { b = pick(W.R); } while (b === a); txt = a[I] + "\n" + b[I] + "\n" + L("Frohe Weihnachten{n}!", "Joyeux Noël{n} !"); }
  else txt = pick(W.A)[I] + " " + pick(W.B)[I] + "\n\n" + pick(W.C)[I];
  return nameFix(txt, XM.norm(name));
};
var STYLES = [["herzlich", D("Herzlich", "Chaleureux")], ["lustig", D("Lustig", "Drôle")], ["feierlich", D("Feierlich", "Solennel")], ["kurz", D("Kurz & knapp", "Court")], ["reim", D("Als Reim", "En rimes")], ["formell", D("Förmlich (Sie)", "Formel (vous)")]];

/* ---------- Karte ---------- */
function cardDraw(p){
  return function(ctx, W, H, t){
    var th = TH[p.h] || TH.schnee, y;
    XM.goldStar(ctx, W / 2, 44 + Math.sin(t * 2) * 2, 15, th.acc);
    ctx.fillStyle = th.text; XM.fit(ctx, (p.t || L("Frohe Weihnachten", "Joyeux Noël")), W / 2, 66, W - 90, 84, { max: 40, min: 20, weight: "800" });
    y = 160;
    if (p.a) { ctx.fillStyle = th.sub; XM.fit(ctx, L("Für ", "Pour ") + p.a, W / 2, y, W - 90, 36, { max: 24, min: 14, weight: "600" }); y += 46; }
    ctx.fillStyle = th.text; XM.fit(ctx, p.m || "", W / 2, y, W - 100, H - y - 120, { max: 30, min: 14, weight: "600", lh: 1.35 });
    if (p.v) { ctx.fillStyle = th.sub; XM.fit(ctx, L("Von ", "De la part de ") + p.v, W / 2, H - 100, W - 90, 36, { max: 22, min: 13, weight: "700" }); }
    if (p.w) XM.watermark(ctx, W, H, th);
  };
}
function karte(host){
  var p = { t: L("Frohe Weihnachten", "Joyeux Noël"), a: "", v: "", m: "", h: "schnee", w: 1 }, W = 540, H = 675, cv;
  try { var pre = sessionStorage.getItem("xm-msg"); if (pre) { p.m = pre; sessionStorage.removeItem("xm-msg"); } } catch(e){}
  host.innerHTML = '<div class="xtwo"><div class="card"><label class="l">' + L("Überschrift", "Titre") + '</label><input class="in" id="kt" maxlength="40">' +
    '<label class="l">' + L("Für (Name)", "Pour (prénom)") + '</label><input class="in" id="ka" maxlength="40">' +
    '<label class="l">' + L("Nachricht", "Message") + '</label><textarea class="in" id="km" rows="5" maxlength="500"></textarea>' +
    '<div class="row" style="margin-top:6px"><button class="btn sm" id="kw">' + L("✨ Wunsch einfügen", "✨ Insérer un vœu") + '</button><button class="btn sm" id="kw2">' + L("Anderer Wunsch", "Autre vœu") + '</button></div>' +
    '<label class="l">' + L("Von (dein Name)", "De la part de (ton prénom)") + '</label><input class="in" id="kv" maxlength="40">' +
    '<label class="l">' + L("Hintergrund", "Fond") + '</label><div id="kh"></div>' +
    '<label class="chk"><input type="checkbox" id="kwm" checked> ' + L("Kleinen Hinweis „oratioplace.com“ auf dem Bild anzeigen", "Afficher la petite mention « oratioplace.com » sur l'image") + '</label></div>' +
    '<div><div class="cvwrap"><canvas id="kc"></canvas></div><div class="row" style="margin:10px 0"><button class="btn go" id="ks">' + L("Als Bild speichern (PNG)", "Enregistrer en image (PNG)") + '</button></div><div id="kshare"></div>' +
    '<p class="hint">' + L("Der Link zeigt dem Empfänger die animierte Karte. Er enthält deinen Text – schicke ihn nur an Menschen, die ihn lesen sollen.", "Le lien montre la carte animée au destinataire. Il contient ton texte – n'envoie-le qu'à des personnes qui doivent le lire.") + '</p></div></div>';
  $("#kt").value = p.t; $("#km").value = p.m;
  cv = XM.animate($("#kc"), W, H, p.h, cardDraw(p));
  $("#kt").oninput = function(){ p.t = this.value; }; $("#ka").oninput = function(){ p.a = XM.norm(this.value); };
  $("#km").oninput = function(){ p.m = this.value; }; $("#kv").oninput = function(){ p.v = XM.norm(this.value); };
  $("#kwm").onchange = function(){ p.w = this.checked ? 1 : 0; };
  function wunsch(){ var st = XM.pick(["herzlich", "kurz", "feierlich", "lustig"]); p.m = XM.wish(st, p.a); $("#km").value = p.m; }
  $("#kw").onclick = wunsch; $("#kw2").onclick = wunsch;
  XM.themeChips($("#kh"), p.h, function(k){ p.h = k; cv.setTheme(k); });
  $("#ks").onclick = function(){ cv.png(2, "weihnachtskarte"); };
  $("#kshare").appendChild(XM.shareBar(function(){ if (!p.m && !p.a) { alert_(L("Schreib zuerst eine Nachricht.", "Écris d'abord un message.")); return null; } return XM.link("k", { t: p.t, a: p.a, v: p.v, m: p.m, h: p.h, w: p.w }); }, L("Eine Weihnachtskarte für dich:", "Une carte de Noël pour toi :")));
}
function alert_(msg){ var d = document.createElement("div"); d.className = "toast"; d.textContent = msg; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); }
XM.toast = alert_;
XM.views.k = function(host, d){
  var p = { t: d.t, a: d.a, v: d.v, m: d.m, h: TH[d.h] ? d.h : "schnee", w: d.w }, W = 540, H = 675;
  host.innerHTML = '<div class="vcard"><p class="vlead">' + (d.v ? esc(L(d.v + " hat dir eine Weihnachtskarte geschickt", d.v + " t'a envoyé une carte de Noël")) : esc(L("Eine Weihnachtskarte für dich", "Une carte de Noël pour toi"))) + '</p><div class="cvwrap"><canvas id="kc"></canvas></div>' +
    '<div class="row" style="justify-content:center;margin:12px 0"><button class="btn go" id="ks">' + L("Karte speichern", "Enregistrer la carte") + '</button><a class="btn" href="#/karte">' + L("Eigene Karte machen", "Faire ma propre carte") + '</a></div></div>';
  var cv = XM.animate($("#kc"), W, H, p.h, cardDraw(p)); $("#ks").onclick = function(){ cv.png(2, "weihnachtskarte"); };
};
reg({ id: "karte", sym: "💌", group: "geben", name: D("Weihnachtskarte", "Carte de Noël"), desc: D("Animierte Karte mit deinem Text – als Link verschicken oder als Bild speichern.", "Carte animée avec ton texte – à envoyer par lien ou à enregistrer en image."), build: karte });

/* ---------- Wunsch-Generator ---------- */
function wunsch(host){
  var style = "herzlich";
  host.innerHTML = '<div class="card"><label class="l">' + L("Stil", "Style") + '</label><div id="wst"></div><label class="l">' + L("Name der Person (optional)", "Prénom de la personne (facultatif)") + '</label><input class="in" id="wn" maxlength="40" placeholder="' + L("z. B. Anna", "p. ex. Anna") + '">' +
    '<div class="row" style="margin-top:10px"><button class="btn go" id="wg">' + L("Neue Wünsche würfeln", "Générer de nouveaux vœux") + '</button></div></div><div id="wl" class="wlist"></div>';
  XM.chips($("#wst"), STYLES.map(function(s){ return [s[0], s[1][I]]; }), style, function(v){ style = v; gen(); });
  function gen(){
    var out = [], seen = {}, tries = 0, name = $("#wn").value;
    while (out.length < 6 && tries++ < 60) { var t = XM.wish(style, name); if (!seen[t]) { seen[t] = 1; out.push(t); } }
    $("#wl").innerHTML = out.map(function(t, i){ return '<div class="card wi"><div class="wt">' + esc(t) + '</div><div class="row"><button class="btn sm" data-c="' + i + '">' + L("Kopieren", "Copier") + '</button><button class="btn sm" data-k="' + i + '">' + L("Als Karte", "En carte") + '</button></div></div>'; }).join("");
    $$("#wl .wi").forEach(function(el, i){ el.querySelector("[data-c]").onclick = function(){ XM.copy(out[i], this); }; el.querySelector("[data-k]").onclick = function(){ try { sessionStorage.setItem("xm-msg", out[i]); } catch(e){} location.hash = "#/karte"; }; });
  }
  $("#wg").onclick = gen; $("#wn").oninput = gen; gen();
}
reg({ id: "wunsch", sym: "✨", group: "geben", name: D("Wunsch-Generator", "Générateur de vœux"), desc: D("Tausende Weihnachtswünsche: herzlich, lustig, feierlich, als Reim oder förmlich – mit Namen.", "Des milliers de vœux de Noël : chaleureux, drôles, solennels, en rimes ou formels – avec prénom."), build: wunsch });

/* ---------- Wichteln ---------- */
function derange(names, forb){
  for (var tries = 0; tries < 8000; tries++) {
    var perm = XM.shuffle(names), ok = true;
    for (var i = 0; i < names.length; i++) if (names[i] === perm[i] || forb[names[i] + "\u0001" + perm[i]]) { ok = false; break; }
    if (ok) return perm;
  }
  return null;
}
function wichteln(host){
  host.innerHTML = '<div class="xtwo"><div class="card"><label class="l">' + L("Mitspieler (ein Name pro Zeile)", "Participants (un prénom par ligne)") + '</label><textarea class="in" id="wiN" rows="7" placeholder="Anna\nBen\nClara\nDavid"></textarea>' +
    '<label class="l">' + L("Wer soll sich NICHT ziehen? (optional, z. B. Paare: Anna:Ben)", "Qui ne doit PAS se tirer ? (facultatif, p. ex. couples : Anna:Ben)") + '</label><textarea class="in" id="wiX" rows="3" placeholder="Anna:Ben"></textarea>' +
    '<label class="l">' + L("Preisrahmen (optional)", "Budget (facultatif)") + '</label><input class="in" id="wiB" maxlength="40" placeholder="' + L("z. B. 15 €", "p. ex. 15 €") + '">' +
    '<label class="l">' + L("Termin oder Ort (optional)", "Date ou lieu (facultatif)") + '</label><input class="in" id="wiD" maxlength="60" placeholder="' + L("z. B. Feier am 22.12. bei Clara", "p. ex. fête le 22/12 chez Clara") + '">' +
    '<div class="row" style="margin-top:12px"><button class="btn go" id="wiG">' + L("Auslosen", "Tirer au sort") + '</button></div><div class="status" id="wiS"></div></div>' +
    '<div><div id="wiR"></div><div class="warn">' + L("Tipp: Öffne die Links nicht selbst, dann bleibt es auch für dich eine Überraschung. Die Namen stecken in den Links in komprimierter Form, nicht im Klartext – man kann sie mit etwas Technik aber entschlüsseln. Zeigt euch also die Links nicht gegenseitig.", "Astuce : n'ouvre pas les liens toi-même, la surprise reste entière. Les prénoms sont compressés dans les liens, pas écrits en clair – avec un peu de technique, on peut toutefois les déchiffrer. Ne vous montrez donc pas les liens entre vous.") + '</div></div></div>';
  $("#wiG").onclick = async function(){
    var names = [], seen = {};
    $("#wiN").value.split(/[\n,;]+/).forEach(function(s){ s = XM.norm(s); if (s && !seen[s.toLowerCase()]) { seen[s.toLowerCase()] = 1; names.push(s); } });
    var S = $("#wiS"); S.className = "status bad";
    if (names.length < 3) { S.textContent = L("Mindestens 3 Namen nötig.", "Il faut au moins 3 prénoms."); return; }
    var forb = {};
    $("#wiX").value.split("\n").forEach(function(l){ var m = l.split(/[:&\-–]/).map(XM.norm).filter(Boolean); if (m.length === 2) { forb[m[0] + "\u0001" + m[1]] = 1; forb[m[1] + "\u0001" + m[0]] = 1; } });
    var perm = derange(names, forb);
    if (!perm) { S.textContent = L("Mit diesen Regeln gibt es keine gültige Auslosung. Streiche eine Regel.", "Avec ces règles, aucun tirage n'est possible. Supprime une règle."); return; }
    S.className = "status ok"; S.textContent = L("Ausgelost! Verteile jetzt die Links – jeder bekommt nur seinen eigenen.", "Tirage effectué ! Distribue maintenant les liens – chacun reçoit uniquement le sien.");
    var b = XM.norm($("#wiB").value), d = XM.norm($("#wiD").value), rows = [], all = [];
    for (var i = 0; i < names.length; i++) { var url = await XM.link("w", { g: names[i], r: perm[i], b: b, d: d }); rows.push([names[i], url]); all.push(names[i] + ": " + url); }
    $("#wiR").innerHTML = '<div class="card"><b>' + L("Links zum Verteilen", "Liens à distribuer") + '</b>' + rows.map(function(r, i){ return '<div class="wrow"><span>' + esc(r[0]) + '</span><span class="row"><button class="btn sm" data-c="' + i + '">' + L("Link kopieren", "Copier le lien") + '</button><a class="btn sm" target="_blank" rel="noopener" data-w="' + i + '" href="#">WhatsApp</a></span></div>'; }).join("") +
      '<div class="row" style="margin-top:10px"><button class="btn" id="wiAll">' + L("Alle Namen + Links als Text kopieren", "Copier tous les prénoms + liens") + '</button></div></div>';
    $$("#wiR [data-c]").forEach(function(btn){ btn.onclick = function(){ XM.copy(rows[+btn.dataset.c][1], btn); }; });
    $$("#wiR [data-w]").forEach(function(a){ a.onclick = function(){ var r = rows[+a.dataset.w]; a.href = "https://wa.me/?text=" + encodeURIComponent(L("Hallo " + r[0] + ", dein Wichtel-Los wartet hier (nicht weitersagen!): ", "Salut " + r[0] + ", ton tirage Secret Santa t'attend ici (ne le dis à personne !) : ") + r[1]); }; });
    $("#wiAll").onclick = function(){ XM.copy(all.join("\n"), this); };
  };
}
XM.views.w = function(host, d){
  host.innerHTML = '<div class="vcard wvw"><p class="vlead">🎅 ' + esc(L("Hallo " + d.g + "!", "Salut " + d.g + " !")) + '</p><h2 style="margin:6px 0">' + L("Du bist Wichtel für …", "Tu es le Secret Santa de …") + '</h2>' +
    '<div class="reveal" id="wvR" tabindex="0" role="button">' + L("Zum Aufdecken tippen", "Touche pour révéler") + '</div>' +
    (d.b ? '<p><b>' + L("Preisrahmen", "Budget") + ':</b> ' + esc(d.b) + '</p>' : '') + (d.d ? '<p><b>' + L("Termin / Ort", "Date / lieu") + ':</b> ' + esc(d.d) + '</p>' : '') +
    '<p class="hint">' + L("Behalte es für dich – es soll eine Überraschung bleiben. Tipp: Frag unauffällig nach Wünschen oder schau in den Wunschzettel.", "Garde ça pour toi – ça doit rester une surprise. Astuce : demande discrètement ses envies ou regarde sa liste de souhaits.") + '</p><p><a class="btn" href="#/wunschzettel">' + L("Eigenen Wunschzettel machen", "Faire ma propre liste de souhaits") + '</a></p></div>';
  var r = $("#wvR"); function show(){ r.textContent = d.r; r.classList.add("open"); } r.onclick = show; r.onkeydown = function(e){ if (e.key === "Enter" || e.key === " ") show(); };
};
reg({ id: "wichteln", sym: "🎁", group: "spiel", name: D("Wichteln (Secret Santa)", "Secret Santa"), desc: D("Auslosen ohne Anmeldung: jeder bekommt einen privaten Link mit seinem Beschenkten.", "Tirage au sort sans inscription : chacun reçoit un lien privé avec sa personne à gâter."), build: wichteln });

/* ---------- Adventskalender ---------- */
function advYear(){ var n = new Date(); return n.getMonth() === 11 && n.getDate() > 24 ? n.getFullYear() + 1 : n.getFullYear(); }
function dayLabel(y, n){ return new Date(y, 11, n).toLocaleDateString(I ? "fr-FR" : "de-DE", { day: "numeric", month: "long" }); }
function adventView(host, d, preview){
  var y = d.y || advYear(), key = "xm-adv-" + XM.hash(JSON.stringify(d)), open = {};
  try { open = JSON.parse(localStorage.getItem(key) || "{}"); } catch(e){}
  var now = new Date(), items = d.i || [];
  host.innerHTML = '<div class="vcard"><p class="vlead">' + esc(d.f ? L(d.f + " hat einen Adventskalender für " + (d.n || "dich") + " gebastelt", d.f + " a préparé un calendrier de l'Avent pour " + (d.n || "toi")) : L("Ein Adventskalender für " + (d.n || "dich"), "Un calendrier de l'Avent pour " + (d.n || "toi"))) + '</p>' +
    (now < new Date(y, 11, 1) && !preview ? '<p class="warn">' + L("Der Kalender beginnt am 1. Dezember. Bis dahin bleiben alle Türchen zu.", "Le calendrier commence le 1er décembre. D'ici là, toutes les portes restent fermées.") + '</p>' : '') +
    '<div class="doors" id="avD"></div><div class="advtxt" id="avT" hidden></div></div>';
  var g = $("#avD");
  for (var n = 1; n <= 24; n++) (function(n){
    var b = document.createElement("button"); b.className = "door" + (open[n] ? " open" : ""); b.innerHTML = '<span>' + n + '</span>';
    b.onclick = function(){
      var can = preview || now >= new Date(y, 11, n);
      if (!can) { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); $("#avT").hidden = false; $("#avT").innerHTML = '<b>' + L("Noch zu!", "Encore fermé !") + '</b> ' + esc(L("Dieses Türchen öffnet sich am " + dayLabel(y, n) + ".", "Cette porte s'ouvre le " + dayLabel(y, n) + ".")); return; }
      open[n] = 1; b.classList.add("open"); try { if (!preview) localStorage.setItem(key, JSON.stringify(open)); } catch(e){}
      $("#avT").hidden = false; $("#avT").innerHTML = '<b>' + L("Türchen ", "Porte ") + n + '</b><div>' + esc(items[n - 1] || L("Heute: eine Umarmung!", "Aujourd'hui : un câlin !")) + '</div>';
    };
    g.appendChild(b);
  })(n);
}
function advent(host){
  var inp = "";
  for (var n = 1; n <= 24; n++) inp += '<div class="advrow"><span>' + n + '</span><input class="in" maxlength="140" data-n="' + n + '" placeholder="' + L("Text für Türchen " + n, "Texte pour la porte " + n) + '"></div>';
  host.innerHTML = '<div class="xtwo"><div class="card"><div class="row" style="gap:10px"><div style="flex:1;min-width:130px"><label class="l">' + L("Für (Name)", "Pour (prénom)") + '</label><input class="in" id="avN" maxlength="40"></div><div style="flex:1;min-width:130px"><label class="l">' + L("Von (dein Name)", "De la part de (ton prénom)") + '</label><input class="in" id="avF" maxlength="40"></div></div>' +
    '<div class="row" style="margin:10px 0"><button class="btn sm" id="avV">' + L("Vorschläge einfügen", "Insérer des idées") + '</button><button class="btn sm" id="avC">' + L("Leeren", "Vider") + '</button></div><div class="advgrid">' + inp + '</div></div>' +
    '<div><div id="avP"></div><div class="row" style="margin:12px 0"><button class="btn" id="avPv">' + L("Vorschau (alle Türchen offen)", "Aperçu (toutes les portes ouvertes)") + '</button></div><div id="avS"></div>' +
    '<p class="hint">' + L("Die Türchen öffnen sich erst am jeweiligen Tag (1. bis 24. Dezember). Der Empfänger kann nicht vorher schummeln – außer er liest den Link. Bis zu 24 Texte passen in einen Link.", "Les portes ne s'ouvrent que le jour correspondant (du 1er au 24 décembre). Le destinataire ne peut pas tricher – sauf en lisant le lien. Jusqu'à 24 textes tiennent dans un lien.") + '</p></div></div>';
  function data(){ return { n: XM.norm($("#avN").value), f: XM.norm($("#avF").value), y: advYear(), i: $$(".advrow input").map(function(x){ return x.value; }) }; }
  $("#avV").onclick = function(){ $$(".advrow input").forEach(function(x, i){ if (!x.value) x.value = XD.AD[i][I]; }); };
  $("#avC").onclick = function(){ $$(".advrow input").forEach(function(x){ x.value = ""; }); };
  $("#avPv").onclick = function(){ adventView($("#avP"), data(), true); };
  $("#avS").appendChild(XM.shareBar(function(){ var d = data(); if (!d.i.some(Boolean)) { XM.toast(L("Fülle mindestens ein Türchen.", "Remplis au moins une porte.")); return null; } return XM.link("a", d); }, L("Ein Adventskalender für dich:", "Un calendrier de l'Avent pour toi :")));
  adventView($("#avP"), { n: "", i: [] }, true);
}
XM.views.a = function(host, d){ adventView(host, d, false); };
reg({ id: "advent", sym: "🕯️", group: "geben", name: D("Adventskalender zum Verschenken", "Calendrier de l'Avent à offrir"), desc: D("24 Türchen mit eigenen Texten – öffnen sich Tag für Tag, per Link verschickt.", "24 portes avec tes textes – elles s'ouvrent jour après jour, envoyées par lien."), build: advent });

/* ---------- Countdown ---------- */
function nextDate(m, d, h, mi){ var n = new Date(), t = new Date(n.getFullYear(), m - 1, d, h, mi, 0); if (t < n) t = new Date(n.getFullYear() + 1, m - 1, d, h, mi, 0); return t; }
function pad(n){ return String(n).padStart(2, "0"); }
function isoLocal(t){ return t.getFullYear() + "-" + pad(t.getMonth() + 1) + "-" + pad(t.getDate()) + "T" + pad(t.getHours()) + ":" + pad(t.getMinutes()); }
function cdDraw(p){
  return function(ctx, W, H, t){
    var th = TH[p.h] || TH.schnee, target = new Date(p.d), left = Math.max(0, target - new Date()), s = Math.floor(left / 1000);
    var v = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60], lab = [L("Tage", "Jours"), L("Std", "Heures"), L("Min", "Min"), L("Sek", "Sec")];
    ctx.fillStyle = th.text; XM.fit(ctx, p.t || L("Bis Weihnachten", "Jusqu'à Noël"), W / 2, 20, W - 60, 56, { max: 30, min: 16, weight: "800" });
    if (left === 0) { ctx.fillStyle = th.acc; XM.fit(ctx, L("Es ist soweit!", "C'est le moment !"), W / 2, 100, W - 60, 120, { max: 48, min: 20, weight: "800" }); }
    else v.forEach(function(x, i){
      var bw = 100, gap = 14, x0 = (W - (4 * bw + 3 * gap)) / 2 + i * (bw + gap), y = 100;
      ctx.fillStyle = th.light ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.14)"; XM.rrect(ctx, x0, y, bw, 120, 16); ctx.fill();
      ctx.fillStyle = th.text; ctx.font = "800 " + (i === 0 && x > 99 ? 40 : 52) + "px " + FONT; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(i === 0 ? String(x) : pad(x), x0 + bw / 2, y + 52);
      ctx.fillStyle = th.sub; ctx.font = "700 14px " + FONT; ctx.fillText(lab[i].toUpperCase(), x0 + bw / 2, y + 98);
    });
    ctx.fillStyle = th.sub; ctx.font = "600 14px " + FONT; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillText(target.toLocaleString(I ? "fr-FR" : "de-DE", { dateStyle: "long", timeStyle: "short" }), W / 2, 270);
    if (p.w !== 0) XM.watermark(ctx, W, H, th);
  };
}
function countdown(host){
  var presets = [["hl", D("Heiligabend (24.12., 18 Uhr)", "Veille de Noël (24/12, 18 h)"), function(){ return nextDate(12, 24, 18, 0); }], ["we", D("Weihnachten (25.12.)", "Noël (25/12)"), function(){ return nextDate(12, 25, 0, 0); }], ["si", D("Silvester (31.12., 24 Uhr)", "Saint-Sylvestre (31/12, minuit)"), function(){ return nextDate(12, 31, 23, 59); }], ["ni", D("Nikolaus (6.12.)", "Saint-Nicolas (6/12)"), function(){ return nextDate(12, 6, 0, 0); }], ["eg", D("Eigener Termin", "Date personnalisée"), null]];
  var p = { t: L("Bis Heiligabend", "Jusqu'à la veille de Noël"), d: isoLocal(nextDate(12, 24, 18, 0)), h: "schnee", w: 1 }, cv;
  host.innerHTML = '<div class="xtwo"><div class="card"><label class="l">' + L("Ziel", "Objectif") + '</label><div id="cdP"></div><div id="cdE" hidden><label class="l">' + L("Eigener Termin", "Date personnalisée") + '</label><input class="in" type="datetime-local" id="cdD"></div>' +
    '<label class="l">' + L("Überschrift", "Titre") + '</label><input class="in" id="cdT" maxlength="50"><label class="l">' + L("Hintergrund", "Fond") + '</label><div id="cdH"></div></div>' +
    '<div><div class="cvwrap"><canvas id="cdC"></canvas></div><div class="row" style="margin:10px 0"><button class="btn" id="cdS">' + L("Als Bild speichern", "Enregistrer en image") + '</button></div><div id="cdSh"></div><p class="hint">' + L("Der Link zeigt immer die aktuelle Restzeit – du kannst ihn als Lesezeichen oder auf einem Zweitbildschirm laufen lassen.", "Le lien affiche toujours le temps restant – tu peux le mettre en favori ou le laisser tourner sur un second écran.") + '</p></div></div>';
  $("#cdT").value = p.t; var W = 540, H = 300;
  cv = XM.animate($("#cdC"), W, H, p.h, cdDraw(p));
  XM.chips($("#cdP"), presets.map(function(x){ return [x[0], x[1][I]]; }), "hl", function(k){
    var pr = presets.filter(function(x){ return x[0] === k; })[0]; $("#cdE").hidden = k !== "eg";
    if (pr[2]) { p.d = isoLocal(pr[2]()); p.t = k === "hl" ? L("Bis Heiligabend", "Jusqu'à la veille de Noël") : k === "we" ? L("Bis Weihnachten", "Jusqu'à Noël") : k === "si" ? L("Bis Silvester", "Jusqu'à la Saint-Sylvestre") : L("Bis Nikolaus", "Jusqu'à la Saint-Nicolas"); $("#cdT").value = p.t; }
    else { var def = new Date(); def.setDate(def.getDate() + 30); def.setHours(18, 0, 0, 0); $("#cdD").value = isoLocal(def); p.d = $("#cdD").value; }
  });
  $("#cdD").oninput = function(){ if (this.value) p.d = this.value; };
  $("#cdT").oninput = function(){ p.t = this.value; };
  XM.themeChips($("#cdH"), p.h, function(k){ p.h = k; cv.setTheme(k); });
  $("#cdS").onclick = function(){ cv.png(2, "countdown"); };
  $("#cdSh").appendChild(XM.shareBar(function(){ return XM.link("c", { t: p.t, d: p.d, h: p.h, w: p.w }); }, L("Der Countdown läuft:", "Le compte à rebours est lancé :")));
}
XM.views.c = function(host, d){
  var p = { t: d.t, d: d.d, h: TH[d.h] ? d.h : "schnee", w: d.w };
  host.innerHTML = '<div class="vcard"><div class="cvwrap"><canvas id="cdC"></canvas></div><div class="row" style="justify-content:center;margin:12px 0"><a class="btn" href="#/countdown">' + L("Eigenen Countdown machen", "Faire mon propre compte à rebours") + '</a></div></div>';
  XM.animate($("#cdC"), 540, 300, p.h, cdDraw(p));
};
reg({ id: "countdown", sym: "⏳", group: "plan", name: D("Weihnachts-Countdown", "Compte à rebours de Noël"), desc: D("Wie lange noch? Mit Wunschdatum, schönem Hintergrund und Link zum Teilen.", "Encore combien de temps ? Avec date au choix, beau fond et lien à partager."), build: countdown });

/* ---------- Wunschzettel ---------- */
function okUrl(u){ return /^https?:\/\/[^\s]+$/i.test(u || ""); }
function wzView(host, d){
  var key = "xm-wz-" + XM.hash(JSON.stringify(d)), got = {};
  try { got = JSON.parse(localStorage.getItem(key) || "{}"); } catch(e){}
  host.innerHTML = '<div class="vcard wzv"><p class="vlead">' + esc(L("Wunschzettel von " + (d.n || "…"), "Liste de souhaits de " + (d.n || "…"))) + '</p><ul class="wzl">' +
    (d.i || []).map(function(r, i){ return '<li><label><input type="checkbox" data-i="' + i + '"' + (got[i] ? " checked" : "") + '> <span>' + esc(r[0]) + '</span></label>' + (r[2] ? ' <span class="pr">' + esc(r[2]) + '</span>' : '') + (okUrl(r[1]) ? ' <a href="' + esc(r[1]) + '" target="_blank" rel="noopener noreferrer nofollow">' + L("Link", "Lien") + '</a>' : '') + '</li>'; }).join("") + '</ul>' +
    '<p class="hint">' + L("Häkchen speichert nur dein Browser – der Schenkende sieht sie nicht und die Person mit dem Wunschzettel auch nicht. Merk dir also, was du kaufst.", "Les coches ne sont enregistrées que dans ton navigateur – ni la personne qui a fait la liste ni les autres ne les voient. Note donc bien ce que tu achètes.") + '</p><div class="row"><button class="btn" onclick="window.print()">' + L("Drucken", "Imprimer") + '</button></div></div>';
  $$("[data-i]", host).forEach(function(c){ c.onchange = function(){ got[c.dataset.i] = c.checked ? 1 : 0; try { localStorage.setItem(key, JSON.stringify(got)); } catch(e){} }; });
}
function wunschzettel(host){
  host.innerHTML = '<div class="xtwo"><div class="card"><label class="l">' + L("Name", "Prénom") + '</label><input class="in" id="wzN" maxlength="40"><label class="l">' + L("Wünsche (Text · optional Link · optional Preis)", "Souhaits (texte · lien facultatif · prix facultatif)") + '</label><div id="wzR"></div>' +
    '<div class="row" style="margin-top:8px"><button class="btn sm" id="wzA">' + L("+ Wunsch", "+ souhait") + '</button></div></div><div><div id="wzP"></div><div class="row" style="margin:10px 0"><button class="btn" id="wzV">' + L("Vorschau", "Aperçu") + '</button></div><div id="wzS"></div></div></div>';
  function add(v){ if ($$("#wzR .wzrow").length >= 30) return; var r = document.createElement("div"); r.className = "wzrow"; r.innerHTML = '<input class="in" data-f="0" maxlength="80" placeholder="' + L("Wunsch", "Souhait") + '"><input class="in" data-f="1" maxlength="300" placeholder="https://…"><input class="in" data-f="2" maxlength="14" placeholder="€"><button class="btn sm" aria-label="' + L("Entfernen", "Retirer") + '">✕</button>'; r.querySelector("button").onclick = function(){ r.remove(); }; $("#wzR").appendChild(r); }
  for (var i = 0; i < 4; i++) add();
  $("#wzA").onclick = add;
  function data(){ return { n: XM.norm($("#wzN").value), i: $$("#wzR .wzrow").map(function(r){ return $$("input", r).map(function(x){ return x.value.trim(); }); }).filter(function(r){ return r[0]; }) }; }
  $("#wzV").onclick = function(){ wzView($("#wzP"), data()); };
  $("#wzS").appendChild(XM.shareBar(function(){ var d = data(); if (!d.i.length) { XM.toast(L("Trag mindestens einen Wunsch ein.", "Ajoute au moins un souhait.")); return null; } return XM.link("z", d); }, L("Mein Wunschzettel:", "Ma liste de souhaits :")));
}
XM.views.z = wzView;
reg({ id: "wunschzettel", sym: "📝", group: "geben", name: D("Wunschzettel zum Teilen", "Liste de souhaits à partager"), desc: D("Wünsche mit Link und Preis sammeln und der Familie schicken – mit Abhaken und Drucken.", "Rassemble tes souhaits avec lien et prix et envoie-les à ta famille – avec cases à cocher et impression."), build: wunschzettel });

/* ---------- Gutschein ---------- */
function gsDraw(p){
  return function(ctx, W, H, t){
    var th = TH[p.h] || TH.gold, c = th.text;
    ctx.strokeStyle = th.acc; ctx.lineWidth = 3; XM.rrect(ctx, 18, 18, W - 36, H - 36, 16); ctx.stroke(); ctx.lineWidth = 1; XM.rrect(ctx, 28, 28, W - 56, H - 56, 10); ctx.stroke();
    XM.goldStar(ctx, W / 2, 62, 14, th.acc);
    ctx.fillStyle = th.acc; ctx.font = "800 16px " + FONT; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText((L("GUTSCHEIN", "BON CADEAU")).split("").join(" "), W / 2, 94);
    ctx.fillStyle = c; var y = 112;
    if (p.a) { ctx.fillStyle = th.sub; XM.fit(ctx, L("für ", "pour ") + p.a, W / 2, y, W - 120, 34, { max: 24, min: 14, weight: "700" }); y += 38; }
    ctx.fillStyle = c; XM.fit(ctx, p.x || L("einen gemeinsamen Abend", "une soirée ensemble"), W / 2, y, W - 120, H - y - 100, { max: 36, min: 16, weight: "800", lh: 1.25 });
    ctx.fillStyle = th.sub; ctx.font = "600 14px " + FONT; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    if (p.g) ctx.fillText(L("gültig bis: ", "valable jusqu'au : ") + p.g, 56, H - 52);
    ctx.textAlign = "right"; if (p.v) ctx.fillText(L("von ", "de la part de ") + p.v, W - 56, H - 52);
    if (p.w) XM.watermark(ctx, W, H, th);
  };
}
function gutschein(host){
  var p = { a: "", v: "", x: "", g: "", h: "gold", w: 1 }, W = 800, H = 500;
  var ideen = [D("einen gemeinsamen Kochabend", "une soirée cuisine ensemble"), D("eine Massage", "un massage"), D("einen Kinoabend deiner Wahl", "une soirée cinéma de ton choix"), D("einen Tag ohne Abwasch", "un jour sans vaisselle"), D("einen Ausflug zu zweit", "une sortie à deux"), D("eine Umarmung, jederzeit einlösbar", "un câlin, valable à tout moment"), D("ein selbst gebackenes Dessert", "un dessert fait maison")];
  host.innerHTML = '<div class="xtwo"><div class="card"><label class="l">' + L("Für (Name)", "Pour (prénom)") + '</label><input class="in" id="gsA" maxlength="40"><label class="l">' + L("Der Gutschein gilt für …", "Le bon est valable pour …") + '</label><textarea class="in" id="gsX" rows="3" maxlength="120"></textarea><div id="gsI" style="margin-top:6px"></div>' +
    '<label class="l">' + L("Gültig bis (optional)", "Valable jusqu'au (facultatif)") + '</label><input class="in" id="gsG" maxlength="30" placeholder="' + L("z. B. 31.12.", "p. ex. 31/12") + '"><label class="l">' + L("Von (dein Name)", "De la part de (ton prénom)") + '</label><input class="in" id="gsV" maxlength="40">' +
    '<label class="l">' + L("Design", "Design") + '</label><div id="gsH"></div><label class="chk"><input type="checkbox" id="gsW" checked> ' + L("Kleinen Hinweis „oratioplace.com“ anzeigen", "Afficher la petite mention « oratioplace.com »") + '</label></div>' +
    '<div><div class="cvwrap wide"><canvas id="gsC"></canvas></div><div class="row" style="margin:10px 0"><button class="btn go" id="gsS">' + L("Als Bild speichern (PNG)", "Enregistrer en image (PNG)") + '</button></div><div id="gsSh"></div></div></div>';
  var cv = XM.animate($("#gsC"), W, H, p.h, gsDraw(p));
  $("#gsA").oninput = function(){ p.a = XM.norm(this.value); }; $("#gsX").oninput = function(){ p.x = this.value; }; $("#gsG").oninput = function(){ p.g = XM.norm(this.value); }; $("#gsV").oninput = function(){ p.v = XM.norm(this.value); }; $("#gsW").onchange = function(){ p.w = this.checked ? 1 : 0; };
  XM.chips($("#gsI"), ideen.map(function(x, i){ return [String(i), x[I]]; }), "", function(i){ p.x = ideen[+i][I]; $("#gsX").value = p.x; });
  XM.themeChips($("#gsH"), p.h, function(k){ p.h = k; cv.setTheme(k); });
  $("#gsS").onclick = function(){ cv.png(2, "gutschein"); };
  $("#gsSh").appendChild(XM.shareBar(function(){ return XM.link("g", p); }, L("Ein Gutschein für dich:", "Un bon cadeau pour toi :")));
}
XM.views.g = function(host, d){
  var p = { a: d.a, v: d.v, x: d.x, g: d.g, h: TH[d.h] ? d.h : "gold", w: d.w };
  host.innerHTML = '<div class="vcard"><p class="vlead">' + L("Ein Gutschein für dich", "Un bon cadeau pour toi") + '</p><div class="cvwrap wide"><canvas id="gsC"></canvas></div><div class="row" style="justify-content:center;margin:12px 0"><button class="btn go" id="gsS">' + L("Speichern", "Enregistrer") + '</button><a class="btn" href="#/gutschein">' + L("Eigenen Gutschein machen", "Faire mon propre bon") + '</a></div></div>';
  var cv = XM.animate($("#gsC"), 800, 500, p.h, gsDraw(p)); $("#gsS").onclick = function(){ cv.png(2, "gutschein"); };
};
reg({ id: "gutschein", sym: "🎟️", group: "geben", name: D("Geschenkgutschein", "Bon cadeau"), desc: D("Persönlicher Gutschein zum Ausdrucken, Speichern oder Verschicken – mit Ideen zum Anklicken.", "Bon cadeau personnel à imprimer, enregistrer ou envoyer – avec des idées à cliquer."), build: gutschein });
})();
