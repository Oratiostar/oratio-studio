// Oratio Kursland: der komplette Oratio-Kurs als begehbare Welt. Alles statisch, nichts wird gesendet.
// Daten: daten/kurs/struktur.json, k01..k70.html, vorwort.html, aA..aD.html, befehle.json, suche.json
var Kurs = (function(){
  var FR = WZ.lang === "fr", W = document.getElementById("kw"), D = "daten/kurs/";
  W.setAttribute("data-nt", "");
  var STR = null, SUCHE = null, BEF = null, cache = {};
  var T = {
    place:["Oratio Place","Oratio Place"], land:["Kursland","Pays du cours"],
    titel:["Oratio Kursland","Oratio Kursland"],
    sub:["Alles, was im Kurs steht, als begehbare Welt: 19 Regionen, 70 Kapitel, Befehlskatalog und Fehlersuche. Klicke eine Region auf der Karte.","Tout le contenu du cours sous forme de monde à explorer : 19 régions, 70 chapitres, catalogue de commandes et dépannage. Clique sur une région de la carte."],
    hinweis:["Der Kurs ist auf Deutsch geschrieben.","Le cours est rédigé en allemand."],
    pass_:["Reisepass","Passeport"], gel:["Kapitel gelesen","chapitres lus"],
    weiter:["Weiterlesen","Reprendre"], start:["Hier beginnen","Commencer ici"],
    such:["Im ganzen Kurs suchen …","Rechercher dans tout le cours …"],
    bef:["Befehlskatalog","Catalogue de commandes"], vor:["Vorwort","Préface"], anh:["Anhänge","Annexes"],
    karte:["Karte","Carte"], regionen:["Alle Regionen","Toutes les régions"],
    kap:["Kapitel","Chapitres"], min:["Min. Lesezeit","min de lecture"], abs:["Abschnitte","sections"],
    gelesen:["gelesen","lu"], markieren:["Als gelesen markieren","Marquer comme lu"], entmark:["Gelesen ✓ (zurücksetzen)","Lu ✓ (annuler)"],
    vorher:["Vorheriges Kapitel","Chapitre précédent"], nachher:["Nächstes Kapitel","Chapitre suivant"],
    inhalt:["In diesem Kapitel","Dans ce chapitre"], zurueck:["Zurück zur Karte","Retour à la carte"],
    treffer:["Treffer","résultats"], keine:["Nichts gefunden.","Rien trouvé."], mehr:["Mehr anzeigen","Afficher plus"],
    alle:["Alle","Tous"], art:["Art","Type"], kat:["Kategorie","Catégorie"], kopieren:["Kopieren","Copier"], kopiert:["Kopiert ✓","Copié ✓"],
    befsub:["Alle 2051 Befehle aus der Toolbox mit dem Hinweis, wo sie helfen. Suche nach Name, Befehl oder Problem.","Les 2051 commandes de la Toolbox avec l’indication de leur utilité. Recherche par nom, commande ou problème."],
    befsuch:["Befehl oder Problem, z. B. „Temperatur“ oder „df“","Commande ou problème, p. ex. « température » ou « df »"],
    teil:["Region","Région"], reset:["Fortschritt zurücksetzen","Réinitialiser la progression"],
    anhangT:{A:"Alle Befehle von A bis Z",B:"Glossar",C:"Lernreihenfolge",D:"Fehler-Index",E:"Befehlskatalog der Toolbox"},
    ap:["Anhang","Annexe"], projekt:["Projekt","Projet"]
  };
  function t(k){ var v = T[k]; return v ? v[FR ? 1 : 0] : k; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function nrm(s){ return String(s).toLowerCase().replace(/ä/g,"a").replace(/ö/g,"o").replace(/ü/g,"u").replace(/ß/g,"ss").replace(/[^a-z0-9À-ſ_\-\.\/ ]/g," "); }
  // --- Fortschritt
  var GEL = {}; try { GEL = JSON.parse(localStorage.getItem("kurs-gelesen") || "{}") || {}; } catch(e){}
  function saveG(){ try { localStorage.setItem("kurs-gelesen", JSON.stringify(GEL)); } catch(e){} }
  function lastSet(k){ try { localStorage.setItem("kurs-zuletzt", k); } catch(e){} }
  function lastGet(){ try { return localStorage.getItem("kurs-zuletzt"); } catch(e){ return null; } }
  function anzGel(){ return Object.keys(GEL).filter(function(k){ return /^\d+$/.test(k) && GEL[k]; }).length; }
  function get(url, json){
    if (cache[url]) return cache[url];
    return cache[url] = fetch(url).then(function(r){ if (!r.ok) throw new Error(r.status); return json ? r.json() : r.text(); });
  }
  // --- Karte
  function blob(cx, cy, rx, ry, seed, amp){
    var n = 18, pts = [], sd = seed * 7 + 3;
    function r(){ sd = (sd * 16807) % 2147483647; return sd / 2147483647; }
    for (var i = 0; i < n; i++){ var a = i / n * Math.PI * 2, q = 1 + (r() - .5) * amp; pts.push([cx + Math.cos(a) * rx * q, cy + Math.sin(a) * ry * q]); }
    var d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
    for (i = 0; i < n; i++){ var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += "C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + " " + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1); }
    return d + "Z";
  }
  var EDGES = [[12,1],[1,2],[1,8],[2,3],[2,4],[2,7],[2,9],[4,5],[4,6],[6,5],[6,14],[7,13],[13,14],[3,14],[9,10],[10,11],[8,10],[10,14],[14,15],[14,16],[15,16],[16,17],[17,18],[18,19],[19,9],[14,17]];
  function teilStat(tid){ var k = STR.teile[tid].kaps, g = k.filter(function(n){ return GEL[n]; }).length; return [g, k.length]; }
  function karteSVG(){
    var T_ = STR.teile, s = '<svg class="kmap" viewBox="0 0 1300 960" role="img" aria-label="Karte"><defs>'
      + '<linearGradient id="ksea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sea1)"/><stop offset="1" stop-color="var(--sea2)"/></linearGradient>'
      + '<filter id="kbl"><feGaussianBlur stdDeviation="7"/></filter></defs>'
      + '<rect width="1300" height="960" rx="26" fill="url(#ksea)"/>';
    for (var w = 0; w < 14; w++) s += '<path class="kwave" d="M' + (40 + w * 91) + ' ' + (60 + (w * 137) % 780) + ' q 18 -10 36 0 t 36 0" />';
    EDGES.forEach(function(e){
      var a = T_[e[0]], b = T_[e[1]], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, k = .14;
      s += '<path class="kroad" d="M' + a.x + ' ' + a.y + ' Q' + (mx - dy * k).toFixed(0) + ' ' + (my + dx * k).toFixed(0) + ' ' + b.x + ' ' + b.y + '"/>';
    });
    Object.keys(T_).forEach(function(id, i){
      var x = T_[id], c = x.color, st = teilStat(id), done = st[0] === st[1] && st[1] > 0, seed = +id + 2;
      s += '<a class="kreg' + (done ? " done" : "") + '" href="#/teil/' + id + '" style="--rc:' + c + '" aria-label="' + esc(x.kurz) + '">'
        + '<path d="' + blob(x.x, x.y + 10, x.r * 1.06, x.r * .84, seed, .22) + '" fill="#000" opacity=".28" filter="url(#kbl)"/>'
        + '<path d="' + blob(x.x, x.y, x.r * 1.1, x.r * .88, seed, .22) + '" fill="var(--sand)"/>'
        + '<path class="kland" d="' + blob(x.x, x.y - 2, x.r * .98, x.r * .78, seed, .22) + '" fill="' + c + '"/>'
        + '<path d="' + blob(x.x, x.y - 6, x.r * .8, x.r * .58, seed + 1, .3) + '" fill="#fff" opacity=".16"/>'
        + '<text class="kem" x="' + x.x + '" y="' + (x.y + (x.r > 100 ? 14 : 12)) + '" font-size="' + Math.round(x.r * .66) + '" text-anchor="middle">' + x.icon + '</text>'
        + '<g class="klab" transform="translate(' + x.x + ' ' + (x.y + x.r * .88 + 20) + ')"><text text-anchor="middle" class="kl1">' + esc(x.kurz) + '</text>'
        + '<text text-anchor="middle" y="17" class="kl2">' + (id === "14" ? "Teil 14" : "Teil " + id) + ' · ' + st[0] + '/' + st[1] + (done ? ' ✓' : '') + '</text></g></a>';
    });
    return s + '<text x="650" y="40" text-anchor="middle" class="ktit">Oratio Kursland</text></svg>';
  }
  function seite(h){ W.innerHTML = h; window.scrollTo(0, 0); document.getElementById("kprog").classList.remove("on"); }
  function crumb(parts){ return '<div class="crumb"><a href="index.html">' + t("place") + '</a> › ' + parts.map(function(p, i){ return p[1] ? '<a href="' + p[1] + '">' + p[0] + '</a>' : esc(p[0]); }).join(" › ") + '</div>'; }
  function weiterLink(){
    var l = lastGet(); if (!l) return '<a class="kbtn pri" href="#/vorwort">▶ ' + t("start") + '</a>';
    return '<a class="kbtn pri" href="' + l + '">▶ ' + t("weiter") + '</a>';
  }
  function home(){
    var g = anzGel(), n = Object.keys(STR.kapitel).length, pc = Math.round(g / n * 100);
    document.title = t("titel") + " – Oratio Place";
    var cards = Object.keys(STR.teile).map(function(id){
      var x = STR.teile[id], st = teilStat(id), words = x.kaps.reduce(function(a, k){ return a + STR.kapitel[k].min; }, 0);
      return '<a class="rcard" href="#/teil/' + id + '" style="--rc:' + x.color + '"><span class="rem">' + x.icon + '</span><span class="rt"><small>' + t("teil") + ' ' + id + '</small><b>' + esc(x.kurz) + '</b><em>' + x.kaps.length + ' ' + (x.kaps.length === 1 ? (FR ? "chapitre" : "Kapitel") : (FR ? "chapitres" : "Kapitel")) + ' · ' + words + ' min</em></span><span class="rbar"><i style="width:' + (st[1] ? st[0] / st[1] * 100 : 0) + '%"></i></span></a>';
    }).join("");
    seite(crumb([[t("land")]]) + '<h1>🗺️ ' + t("titel") + '</h1><p class="sub">' + t("sub") + (FR ? ' <b>' + t("hinweis") + '</b>' : '') + '</p>'
      + '<div class="ktools"><div class="kpass"><b>🧳 ' + t("pass_") + '</b><span>' + g + ' / ' + n + ' ' + t("gel") + '</span><div class="kpb"><i style="width:' + pc + '%"></i></div></div>'
      + '<div class="kbtns">' + weiterLink() + '<a class="kbtn" href="#/befehle">⌨️ ' + t("bef") + '</a><a class="kbtn" href="#/vorwort">📜 ' + t("vor") + '</a></div></div>'
      + '<form class="ksuch" id="ksf"><input class="in" id="ksq" type="search" autocomplete="off" enterkeyhint="search" placeholder="' + esc(t("such")) + '"></form>'
      + '<div class="kmapw">' + karteSVG() + '</div>'
      + '<h2>' + t("regionen") + '</h2><div class="rgrid">' + cards + '</div>'
      + '<h2>' + t("anh") + '</h2><div class="agrid">' + ["A","B","C","D","E"].map(function(a){ return '<a class="acard" href="#/' + (a === "E" ? "befehle" : "anhang/" + a) + '"><b>' + t("ap") + ' ' + a + '</b><span>' + esc(FR && a === "E" ? t("bef") : T.anhangT[a]) + '</span></a>'; }).join("") + '</div>'
      + '<p class="kfoot"><button class="kbtn s" id="kreset" type="button">' + t("reset") + '</button></p>');
    document.getElementById("ksf").onsubmit = function(e){ e.preventDefault(); var q = document.getElementById("ksq").value.trim(); if (q) location.hash = "#/suche/" + encodeURIComponent(q); };
    document.getElementById("kreset").onclick = function(){ if (confirm(FR ? "Effacer la progression ?" : "Fortschritt wirklich zurücksetzen?")) { GEL = {}; saveG(); home(); } };
  }
  function kapKarte(n){
    var k = STR.kapitel[n], g = GEL[n];
    return '<a class="kcard' + (g ? " ok" : "") + '" href="#/kap/' + n + '"><span class="kn">' + n + '</span><span class="kt"><b>' + esc(k.title) + '</b><small>' + k.secs.length + ' ' + t("abs") + ' · ' + k.min + ' ' + t("min") + '</small></span>' + (g ? '<span class="kok" title="' + t("gelesen") + '">✓</span>' : '') + '</a>';
  }
  function teilSeite(id){
    var x = STR.teile[id]; if (!x) return home();
    document.title = x.kurz + " – " + t("titel");
    var intro = x.intro.replace(/<table>[\s\S]*?<\/table>/, "");
    var body;
    if (x.subs){
      var rest = x.kaps.filter(function(n){ return !STR.kapitel[n].sub; });
      body = intro + (rest.length ? '<div class="kgrid">' + rest.map(kapKarte).join("") + '</div>' : '') + Object.keys(x.subs).map(function(s){ var u = x.subs[s];
        return '<section class="ksub"><h2><span>' + u.icon + '</span> ' + esc(u.full) + '</h2>' + u.intro.replace(/<table>[\s\S]*?<\/table>/, "") + '<div class="kgrid">' + u.kaps.map(kapKarte).join("") + '</div></section>'; }).join("");
    } else body = intro + '<div class="kgrid">' + x.kaps.map(kapKarte).join("") + '</div>';
    var st = teilStat(id), ids = Object.keys(STR.teile), i = ids.indexOf(id);
    var pv = i > 0 ? STR.teile[ids[i - 1]] : null, nx = i < ids.length - 1 ? STR.teile[ids[i + 1]] : null;
    seite(crumb([[t("land"), "#/"], ["Teil " + id]]) + '<div class="rhead" style="--rc:' + x.color + '"><span class="rem">' + x.icon + '</span><div><small>' + t("teil") + ' ' + id + '</small><h1>' + esc(x.title) + '</h1><p>' + st[0] + ' / ' + st[1] + ' ' + t("gel") + '</p></div></div>'
      + '<div class="prose" style="--rc:' + x.color + '">' + body + '</div>'
      + '<div class="pn">' + (pv ? '<a href="#/teil/' + pv.id + '">‹ ' + esc(pv.kurz) + '</a>' : '<span></span>') + '<a href="#/">🗺️ ' + t("karte") + '</a>' + (nx ? '<a href="#/teil/' + nx.id + '">' + esc(nx.kurz) + ' ›</a>' : '<span></span>') + '</div>');
  }
  // --- Leseansicht
  function secId(s){ return /^\d/.test(s) ? "s" + s.replace(/\./g, "-") : s; }
  function lesen(kind, key, sec){
    var info, file, titel, teil = null, crumbs;
    if (kind === "vorwort"){ info = STR.vorwort; file = "vorwort.html"; titel = info.title; crumbs = [[t("land"), "#/"], [t("vor")]]; }
    else if (kind === "anhang"){ info = STR.anhang[key]; if (!info || key === "E") return key === "E" ? befehle() : home(); file = "a" + key + ".html"; titel = t("ap") + " " + key + " – " + info.title; crumbs = [[t("land"), "#/"], [t("anh")], [t("ap") + " " + key]]; }
    else { info = STR.kapitel[key]; if (!info) return home(); file = "k" + ("0" + key).slice(-2) + ".html"; teil = STR.teile[info.teil]; titel = (FR ? "Chapitre " : "Kapitel ") + key + ": " + info.title; crumbs = [[t("land"), "#/"], [teil.kurz, "#/teil/" + teil.id], [(FR ? "Chap. " : "Kap. ") + key]]; }
    var color = teil ? teil.color : "#3b82f6";
    document.title = titel + " – " + t("titel");
    var hk = kind + "/" + key; lastSet(kind === "kap" ? "#/kap/" + key : kind === "anhang" ? "#/anhang/" + key : "#/vorwort");
    var outline = info.secs.map(function(s){ return '<a href="#/' + (kind === "kap" ? "kap/" + key : kind === "anhang" ? "anhang/" + key : "vorwort") + '/' + s[0] + '" data-s="' + s[0] + '">' + esc(s[1]) + '</a>'; }).join("");
    var ids = Object.keys(STR.kapitel).map(Number), pi = ids.indexOf(+key);
    var prev = kind === "kap" && pi > 0 ? ids[pi - 1] : null, next = kind === "kap" && pi < ids.length - 1 ? ids[pi + 1] : null;
    seite(crumb(crumbs) + '<div class="lese" style="--rc:' + color + '"><aside class="outl"><b>' + t("inhalt") + '</b><div class="olist">' + outline + '</div></aside>'
      + '<article><h1>' + esc(titel) + '</h1>' + (info.min ? '<p class="meta">' + info.secs.length + ' ' + t("abs") + ' · ' + info.min + ' ' + t("min") + (FR ? ' · <em>' + t("hinweis") + '</em>' : '') + '</p>' : '')
      + '<div class="prose" id="kbody"><p class="platz">…</p></div><div id="kend"></div>'
      + (kind === "kap" ? '<div class="kdone"><button type="button" class="kbtn pri" id="kmark"></button></div>' : '')
      + '<div class="pn">' + (prev ? '<a href="#/kap/' + prev + '">‹ ' + (FR ? "Chap. " : "Kap. ") + prev + ': ' + esc(STR.kapitel[prev].title) + '</a>' : (kind === "kap" ? '<a href="#/teil/' + info.teil + '">‹ ' + esc(teil.kurz) + '</a>' : '<span></span>')) + '<a href="#/">🗺️</a>' + (next ? '<a href="#/kap/' + next + '">' + (FR ? "Chap. " : "Kap. ") + next + ': ' + esc(STR.kapitel[next].title) + ' ›</a>' : '<span></span>') + '</div></article></div>');
    var pb = document.getElementById("kprog"); pb.classList.add("on");
    var mark = document.getElementById("kmark");
    function mk(){ if (!mark) return; mark.textContent = GEL[key] ? t("entmark") : t("markieren"); mark.classList.toggle("pri", !GEL[key]); }
    if (mark){ mk(); mark.onclick = function(){ if (GEL[key]) delete GEL[key]; else GEL[key] = 1; saveG(); mk(); }; }
    get(D + file).then(function(h){
      var b = document.getElementById("kbody"); if (!b) return; b.innerHTML = h;
      b.querySelectorAll("pre").forEach(function(p){
        var c = document.createElement("button"); c.type = "button"; c.className = "cp"; c.textContent = t("kopieren");
        c.onclick = function(){ var tx = p.querySelector("code") ? p.querySelector("code").innerText : p.innerText; (navigator.clipboard ? navigator.clipboard.writeText(tx) : Promise.reject()).then(function(){ c.textContent = t("kopiert"); setTimeout(function(){ c.textContent = t("kopieren"); }, 1400); }, function(){}); };
        p.appendChild(c);
      });
      if (sec){ var el = document.getElementById(secId(sec)); if (el) setTimeout(function(){ el.scrollIntoView({block: "start"}); window.scrollBy(0, -70); }, 30); }
      spy();
      var end = document.getElementById("kend");
      if (kind === "kap" && "IntersectionObserver" in window && end){ var io = new IntersectionObserver(function(en){ if (en[0].isIntersecting && !GEL[key]){ GEL[key] = 1; saveG(); mk(); io.disconnect(); } }); io.observe(end); }
    }, function(){ var b = document.getElementById("kbody"); if (b) b.innerHTML = '<p class="platz">⚠️ ' + (FR ? "Chargement impossible." : "Das Kapitel konnte nicht geladen werden.") + '</p>'; });
  }
  var spyF = null;
  function spy(){
    var secs = Array.prototype.slice.call(document.querySelectorAll("#kbody > section")), links = document.querySelectorAll(".olist a");
    if (spyF) window.removeEventListener("scroll", spyF);
    spyF = function(){
      var h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      document.querySelector("#kprog i").style.width = Math.min(100, p * 100) + "%";
      var cur = null; secs.forEach(function(s){ if (s.getBoundingClientRect().top < 120) cur = s.id; });
      links.forEach(function(a){ a.classList.toggle("on", a.dataset.s === cur || secId(a.dataset.s) === cur); });
    };
    window.addEventListener("scroll", spyF, {passive: true}); spyF();
  }
  // --- Suche im Text
  function suche(q){
    seite(crumb([[t("land"), "#/"], [FR ? "Recherche" : "Suche"]]) + '<h1>🔎 ' + (FR ? "Recherche" : "Suche") + '</h1><form class="ksuch" id="ksf"><input class="in" id="ksq" type="search" value="' + esc(q) + '" placeholder="' + esc(t("such")) + '"></form><div id="kres"><p class="platz">…</p></div>');
    var f = document.getElementById("ksf"); f.onsubmit = function(e){ e.preventDefault(); var v = document.getElementById("ksq").value.trim(); if (v) location.hash = "#/suche/" + encodeURIComponent(v); };
    get(D + "suche.json", true).then(function(S){
      var w = nrm(q).split(/\s+/).filter(Boolean), res = [];
      S.forEach(function(r){
        var ti = nrm(r[2]), tx = nrm(r[3]), ok = w.every(function(x){ return ti.indexOf(x) >= 0 || tx.indexOf(x) >= 0; });
        if (!ok) return; var sc = 0; w.forEach(function(x){ if (ti.indexOf(x) >= 0) sc += 10; var c = tx.split(x).length - 1; sc += Math.min(c, 5); });
        res.push([sc, r, tx]);
      });
      res.sort(function(a, b){ return b[0] - a[0]; });
      var el = document.getElementById("kres"); if (!el) return;
      if (!res.length){ el.innerHTML = '<p class="platz">' + t("keine") + '</p>'; return; }
      var show = res.slice(0, 80);
      el.innerHTML = '<p class="sub">' + res.length + ' ' + t("treffer") + '</p>' + show.map(function(x){
        var r = x[1], key = r[0], isA = key.charAt(0) === "A", cap = isA ? t("ap") + " " + key.charAt(1) : (FR ? "Chapitre " : "Kapitel ") + key, href = isA ? "#/anhang/" + key.charAt(1) + "/" + r[1] : "#/kap/" + key + "/" + r[1];
        var tx = r[3], low = nrm(tx), at = Math.max(0, low.indexOf(w[0])), sn = tx.slice(Math.max(0, at - 70), at + 170);
        w.forEach(function(v){ var rg = new RegExp("(" + v.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&") + ")", "ig"); sn = esc(sn).replace(rg, "<mark>$1</mark>"); });
        return '<a class="sres" href="' + href + '"><small>' + esc(cap) + (!isA && STR.kapitel[key] ? ' · ' + esc(STR.kapitel[key].title) : '') + '</small><b>' + esc(r[2]) + '</b><span>…' + sn + '…</span></a>';
      }).join("");
    });
  }
  // --- Befehlskatalog
  var bq = "", bart = "", bkat = "", bn = 100;
  function befehle(){
    document.title = t("bef") + " – " + t("titel");
    seite(crumb([[t("land"), "#/"], [t("bef")]]) + '<h1>⌨️ ' + t("bef") + '</h1><p class="sub">' + t("befsub") + '</p>'
      + '<div class="bfil"><input class="in" id="bq" type="search" autocomplete="off" placeholder="' + esc(t("befsuch")) + '"><select class="in" id="bk"><option value="">' + t("kat") + ': ' + t("alle") + '</option></select></div>'
      + '<div class="bart" id="ba"></div><p class="sub" id="bn"></p><div id="bl"><p class="platz">…</p></div><p class="kfoot"><button class="kbtn" id="bm" type="button" hidden>' + t("mehr") + '</button></p>');
    get(D + "befehle.json", true).then(function(J){
      BEF = J.rows; var cats = {};
      BEF.forEach(function(r){ var k = r[4] + " › " + r[5]; cats[k] = 1; });
      var sel = document.getElementById("bk"); Object.keys(cats).forEach(function(k){ var o = document.createElement("option"); o.value = k; o.textContent = k; sel.appendChild(o); });
      var arts = ["Anzeigen", "Ändert", "Installiert", "Gefährlich"], ba = document.getElementById("ba");
      var AF = {Anzeigen:"Afficher", "Ändert":"Modifie", Installiert:"Installe", "Gefährlich":"Dangereux"};
      function chips(){ ba.innerHTML = '<button type="button" class="chip' + (bart ? "" : " on") + '" data-a="">' + t("alle") + '</button>' + arts.map(function(a){ return '<button type="button" class="chip a-' + a + (bart === a ? " on" : "") + '" data-a="' + a + '">' + (FR ? AF[a] : a) + '</button>'; }).join(""); ba.querySelectorAll("button").forEach(function(b){ b.onclick = function(){ bart = b.dataset.a; bn = 100; chips(); zeige(); }; }); }
      function zeige(){
        var w = nrm(bq).split(/\s+/).filter(Boolean), out = [];
        BEF.forEach(function(r){ if (bart && r[3] !== bart) return; if (bkat && (r[4] + " › " + r[5]) !== bkat) return; var s = nrm(r[0] + " " + r[1] + " " + r[2] + " " + r[5]); if (w.every(function(x){ return s.indexOf(x) >= 0; })) out.push(r); });
        document.getElementById("bn").textContent = out.length + " " + t("treffer");
        document.getElementById("bl").innerHTML = out.slice(0, bn).map(function(r){
          return '<div class="brow"><div class="bh"><b>' + esc(r[0]) + '</b><span class="badge a-' + r[3] + '">' + esc(FR ? AF[r[3]] || r[3] : r[3]) + '</span></div><p>' + esc(r[1]) + '</p>' + (r[2] ? '<div class="bc"><code>' + esc(r[2]) + '</code><button type="button" class="cp2" data-c="' + esc(r[2]) + '">' + t("kopieren") + '</button></div>' : '') + '<small>' + esc(r[4] + " › " + r[5]) + '</small></div>'; }).join("") || '<p class="platz">' + t("keine") + '</p>';
        document.querySelectorAll(".cp2").forEach(function(b){ b.onclick = function(){ if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.c).then(function(){ b.textContent = t("kopiert"); setTimeout(function(){ b.textContent = t("kopieren"); }, 1200); }); }; });
        document.getElementById("bm").hidden = out.length <= bn; document.getElementById("bm").onclick = function(){ bn += 150; zeige(); };
      }
      document.getElementById("bq").value = bq; document.getElementById("bq").oninput = function(e){ bq = e.target.value; bn = 100; zeige(); };
      sel.value = bkat; sel.onchange = function(){ bkat = sel.value; bn = 100; zeige(); };
      chips(); zeige();
    });
  }
  // --- Router
  function route(){
    if (!STR) return;
    var h = decodeURIComponent((location.hash || "#/").slice(2)), p = h.split("/");
    if (p[0] === "teil") teilSeite(p[1]);
    else if (p[0] === "kap") lesen("kap", p[1], p[2] ? (p[2].match(/^\d/) ? p[2] : p[2]) : null);
    else if (p[0] === "anhang") lesen("anhang", p[1], p[2]);
    else if (p[0] === "vorwort") lesen("vorwort", "v", p[1]);
    else if (p[0] === "befehle") befehle();
    else if (p[0] === "suche") suche(p.slice(1).join("/"));
    else home();
  }
  var lastKey = "";
  function onHash(){
    var h = location.hash, key = h.replace(/^(#\/(?:kap|anhang)\/[^\/]+)\/.*$/, "$1");
    // Sprung zu einem Abschnitt im selben Kapitel: nicht neu laden
    if (key === lastKey && /^#\/(kap|anhang)\//.test(h) && h !== key && document.getElementById("kbody")){
      var s = h.split("/")[3], el = s && document.getElementById(secId(s)); if (el){ el.scrollIntoView({block: "start"}); window.scrollBy(0, -70); } return;
    }
    lastKey = key; route();
  }
  return { start: function(){
    get(D + "struktur.json", true).then(function(s){ STR = s; window.addEventListener("hashchange", onHash); onHash(); },
      function(){ W.innerHTML = '<p class="platz">⚠️ ' + (FR ? "Les données n’ont pas pu être chargées." : "Die Daten konnten nicht geladen werden. Bitte die Seite über den Webserver öffnen.") + '</p>'; });
  } };
})();
