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
    hinweis:["Der Kurs ist auf Deutsch geschrieben.","Traduction en cours : les chapitres pas encore traduits restent en allemand."],
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
var FRT = {"t": [["FONDAMENTAUX : Linux et le terminal", "Bases Linux"], ["RASPBERRY PI : commandes, disques, démarrage et sauvegarde", "Raspberry Pi"], ["PROJET « Écran, boîtier et connexions »", "Écran et boîtier"], ["PROJET « Microcontrôleurs, écrans et matrice LED »", "MCU, écrans, matrice"], ["PROJET « Cadran AMOLED rond »", "Cadran AMOLED"], ["APPRENDRE À PROGRAMMER et PROJET « Oratio Watch OS »", "Python et Watch OS"], ["PROJET « IA locale sur le Raspberry Pi »", "IA locale"], ["SYSTÈMES D’EXPLOITATION : Windows et Linux comparés", "Windows et Linux"], ["PROJET « Station Batocera »", "Batocera"], ["PROJET « Steam Deck en double démarrage »", "Steam Deck double boot"], ["PROJET « Windows 11 sur le Steam Deck OLED »", "Windows 11 sur le Deck"], ["APERÇU : tous les projets en un coup d’œil", "Carte des projets"], ["CONCEPT : écouter et parler", "Écouter et parler"], ["GRAND PROJET : Oratio Control Center", "Oratio Control Center"], ["Vue d’ensemble : ce que j’ai appris dans tous les projets", "Vue d’ensemble"], ["DÉPANNAGE : résoudre soi-même de nouveaux problèmes", "Dépannage"], ["LEXIQUE DES ERREURS : messages et leur signification", "Lexique des erreurs"], ["BRIQUES DE SAVOIR", "Briques de savoir"], ["ÉLECTRONIQUE : composants, circuits et mesures", "Électronique"]], "k": ["Comprendre le terminal", "Droits, scripts et fichiers exécutables", "Installer des programmes et gérer les paquets", "Chercher, filtrer, modifier", "Processus, services, démarrage automatique et planification", "L’aide-mémoire du Raspberry Pi", "Disques, SSD et NVMe", "Comment le Raspberry Pi démarre – étapes du boot et fichier lu à chaque étape", "Sauvegarde – tout le Pi sauvegardé automatiquement", "Écran, résolution et mise à l’échelle", "Ventilateur, refroidissement et boîtier Freenove", "GPIO, I²C, SPI et UART sur le Raspberry Pi", "Son, microphone et autres périphériques", "Raspberry Pi approfondi", "Quel appareil pour quel projet ?", "Arduino – de zéro au premier programme", "VS Code et PlatformIO", "Les écrans en un coup d’œil", "Matrice LED 64×32 (HUB75)", "Microcontrôleurs approfondis", "Cadran pour l’ESP32-S3-AMOLED", "Apprendre Python avec son propre programme", "Oratio Watch OS – un logiciel de montre connectée maison", "Une IA locale sur le Raspberry Pi", "Console Windows contre console Linux", "Batocera", "Steam Deck, Windows et double démarrage", "Windows 11 sur le Steam Deck OLED – sans PC, avec toutes les erreurs", "La carte des projets", "Écouter et parler – le concept derrière la commande vocale", "Aperçu, noms et chronologie", "Projet A, partie 1 – de la fenêtre Freenove à l’onglet de scripts", "Projet A, partie 2 – Pi Tools, le fichier JSON et l’outil Kanshi", "Projet A, partie 3 – déplacer les tuiles et embellir", "Projet A, partie 4 – pages, tailles et emplacements libres", "Projet B, partie 1 – la nouvelle structure", "Projet B, partie 2 – menu, tuiles, widgets et fenêtres de contrôle", "Projet B, partie 3 – fonctions du menu (roue dentée, loupe, cloche et plus)", "Projet B, partie 4 – boîte à outils, clone de sauvegarde, commande vocale, applis d’électronique et fabrication maison", "Projet A et projet B comparés", "La variante glisser-déposer (déplacement natif de Qt)", "La variante C++", "Le Control Center sur le Steam Deck", "Oratio Place – le Control Center dans le navigateur", "Le vérificateur de hash – le premier script du Control Center", "Les leçons qui reviennent dans chaque projet", "La méthode et les outils", "Dépannage : Linux, terminal et shell", "Dépannage du Raspberry Pi", "Dépannage : Python, PyQt5 et le Control Center", "Dépannage : microcontrôleurs et matériel électronique", "Dépannage : Windows, Steam Deck, Batocera et double démarrage", "Messages d’erreur sous Linux et dans le shell", "Messages d’erreur en Python et PyQt5", "Messages d’erreur en C++, Arduino, PlatformIO et ESP32", "Messages d’erreur sur le Raspberry Pi", "Messages d’erreur : Batocera, Steam Deck et Windows", "Une méthode pour chaque nouvelle erreur", "Briques de savoir : Raspberry Pi et Linux", "Briques de savoir : microcontrôleurs", "Briques de savoir : programmation et Steam Deck", "Bases électriques et mesures", "Diviseur de tension, potentiomètre et diode Zener", "Mesurer le courant, 4–20 mA et niveaux de signal", "Alimentation, accus et tensions dangereuses", "Reconnaître et tester les composants", "Moteurs et pilotes de moteur", "Relais de sécurité et arrêt d’urgence", "L’électronique sur le microcontrôleur", "L’électronique dans mes projets – routine de contrôle et aide-mémoire"], "a": {"A": "Toutes les commandes de A à Z", "B": "Glossaire", "C": "Ordre d’apprentissage", "D": "Index des erreurs : message ou symptôme → où chercher", "E": "Le catalogue de commandes de la Toolbox"}, "s": {"a": "Projet A « Établi »", "b": "Projet B « Verre »", "c": "Comparaison et variantes", "d": "Variante Steam Deck", "e": "Le site web"}, "v": "Préface : comment lire ce livre"};
  function trad(){ if (!FR || !STR) return; Object.keys(STR.teile).forEach(function(i){ var x = FRT.t[i-1]; if (x){ STR.teile[i].title = x[0]; STR.teile[i].kurz = x[1]; } }); Object.keys(STR.kapitel).forEach(function(n){ if (FRT.k[n-1]) STR.kapitel[n].title = FRT.k[n-1]; }); Object.keys(STR.anhang).forEach(function(a){ if (FRT.a[a]) STR.anhang[a].title = FRT.a[a]; }); Object.keys(STR.sub14).forEach(function(a){ if (FRT.s[a]) STR.sub14[a][0] = FRT.s[a]; }); if (STR.vorwort) STR.vorwort.title = FRT.v; var S = FRT.secs || {}; Object.keys(STR.teile).forEach(function(i){ if (FRT.intro && FRT.intro[i]) STR.teile[i].intro = FRT.intro[i]; var sb = STR.teile[i].subs; if (sb) Object.keys(sb).forEach(function(a){ if (FRT.s[a]) { sb[a].name = FRT.s[a]; sb[a].full = FRT.s[a]; } }); }); function ts(o){ (o.secs || []).forEach(function(x){ if (S[x[0]]) x[1] = S[x[0]]; }); } Object.keys(STR.kapitel).forEach(function(n){ ts(STR.kapitel[n]); }); Object.keys(STR.anhang).forEach(function(a){ ts(STR.anhang[a]); }); ts(STR.vorwort); }
  function hx(h){ h = h.replace("#",""); return [parseInt(h.substr(0,2),16), parseInt(h.substr(2,2),16), parseInt(h.substr(4,2),16)]; }
  function mixc(h, o, f){ var a = hx(h), b = hx(o); return "#" + [0,1,2].map(function(i){ var v = Math.round(a[i] + (b[i] - a[i]) * f); return ("0" + v.toString(16)).slice(-2); }).join(""); }
  function mkPal(h){ return [h, mixc(h, "#ffffff", .32), mixc(h, "#000000", .4)]; }
  var SUBC = {a:"#e08a00", b:"#2f6df0", c:"#8b5cf6", d:"#0ea5e9", e:"#22a55a"};
  var PROPS = {1:["⌨️","🌲"],2:["🔌","🌴"],3:["🔆","🌲"],4:["🔧","🌴"],5:["🕰️","🌸"],6:["💻","🌴"],7:["🧠","🌲"],8:["🪟","🐧"],9:["👾","🌴"],10:["🎲","🌲"],11:["💾","🌴"],12:["📍","🌲"],13:["🔊","🌴"],14:["🧰","🌲"],15:["🧭","🌴"],16:["🩺","🌲"],17:["📕","🌴"],18:["✨","🌲"],19:["🔋","🌴"]};
  function palT(tid){ return mkPal(STR.teile[tid].color); }
  function palK(n){ var k = STR.kapitel[n]; return k.sub ? mkPal(SUBC[k.sub]) : palT(k.teil); }
  function pv(p){ return '--rc:' + p[0] + ';--c1:' + p[0] + ';--c2:' + p[1] + ';--c3:' + p[2]; }
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
      + '<radialGradient id="kglow" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#4fb0ff" stop-opacity=".38"/><stop offset=".6" stop-color="#1c5fb0" stop-opacity=".12"/><stop offset="1" stop-color="#021633" stop-opacity=".45"/></radialGradient>'
      + '<rect width="1300" height="960" rx="26" fill="url(#ksea)"/><rect width="1300" height="960" rx="26" fill="url(#kglow)"/>';
    for (var w = 0; w < 26; w++) s += '<path class="kwave" d="M' + (30 + (w * 97) % 1230) + ' ' + (40 + (w * 151) % 880) + ' q 18 -10 36 0 t 36 0 t 36 0" />';
    for (var sp = 0; sp < 40; sp++) s += '<circle cx="' + ((sp * 211 + 37) % 1280) + '" cy="' + ((sp * 127 + 23) % 940) + '" r="' + (1.2 + (sp % 3) * .7) + '" fill="#fff" opacity="' + (.18 + (sp % 4) * .08) + '"/>';
    function boat(x, y, k, c){ return '<g class="kdeco" transform="translate(' + x + ' ' + y + ') scale(' + k + ')"><path d="M-34 0 L34 0 L22 16 L-22 16Z" fill="#6b3f1d"/><path d="M-3 -4 L-3 -58 L30 -8Z" fill="#fff"/><path d="M-6 -4 L-6 -46 L-28 -8Z" fill="' + c + '"/><rect x="-4" y="-62" width="2" height="60" fill="#3a2410"/><path d="M-50 22 q 12 -8 24 0 t 24 0 t 24 0 t 24 0" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/></g>'; }
    function fish(x, y, k, f){ return '<g class="kdeco" transform="translate(' + x + ' ' + y + ') scale(' + (f * k) + ' ' + k + ')"><path d="M-22 0 q 14 -16 32 0 q -18 16 -32 0Z" fill="#ffb347"/><path d="M8 0 l 16 -11 l 0 22Z" fill="#ff8c1a"/><circle cx="-10" cy="-3" r="2.4" fill="#0a1a33"/></g>'; }
    function whale(x, y, k){ return '<g class="kdeco" transform="translate(' + x + ' ' + y + ') scale(' + k + ')"><path d="M-46 4 q 8 -28 46 -26 q 30 2 38 22 l 18 -14 l -4 24 q -8 22 -52 22 q -40 0 -46 -28Z" fill="#7fb5e8"/><path d="M-40 10 q 40 14 80 -2" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/><circle cx="-24" cy="-4" r="3" fill="#0a1a33"/><path d="M-6 -24 q -4 -16 -14 -20 M-6 -24 q 4 -16 14 -20" fill="none" stroke="#bfe3ff" stroke-width="3" stroke-linecap="round"/></g>'; }
    function compass(x, y){ return '<g class="kdeco" transform="translate(' + x + ' ' + y + ')" opacity=".85"><circle r="46" fill="rgba(255,255,255,.1)" stroke="#fff" stroke-opacity=".7" stroke-width="3"/><path d="M0 -42 L9 0 L0 42 L-9 0Z" fill="#fff" opacity=".85"/><path d="M-42 0 L0 -9 L42 0 L0 9Z" fill="#9ed2ff" opacity=".85"/><path d="M0 -42 L9 0 L-9 0Z" fill="#ff5a4d"/><text y="-52" text-anchor="middle" font-size="18" font-weight="800" fill="#fff" font-family="Poppins,Inter,sans-serif">N</text></g>'; }
    s += boat(500, 70, 1, '#ff5a4d') + boat(250, 705, .9, '#ffd23f') + boat(1000, 760, 1, '#ff5a4d') + boat(1250, 345, .8, '#37c97d') + fish(520, 440, 1, 1) + fish(760, 440, .8, -1) + fish(60, 780, .9, 1) + fish(950, 930, .8, -1) + whale(1230, 560, 1) + whale(760, 735, .8) + compass(1236, 880);
    EDGES.forEach(function(e){
      var a = T_[e[0]], b = T_[e[1]], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, k = .14;
      s += '<path class="kroad" d="M' + a.x + ' ' + a.y + ' Q' + (mx - dy * k).toFixed(0) + ' ' + (my + dx * k).toFixed(0) + ' ' + b.x + ' ' + b.y + '"/>';
    });
    Object.keys(T_).forEach(function(id, i){
      var x = T_[id], p = palT(id), c1 = p[0], c2 = p[1], c3 = p[2], st = teilStat(id), done = st[0] === st[1] && st[1] > 0, seed = +id + 2, r = x.r, gid = "kg" + id;
      var deco = "", sd = seed * 13 + 5;
      function rnd(){ sd = (sd * 16807) % 2147483647; return sd / 2147483647; }
      for (var q = 0; q < 7; q++){ var ang = rnd() * 6.283, rad = (.25 + rnd() * .5), px = x.x + Math.cos(ang) * r * .8 * rad, py = x.y - 4 + Math.sin(ang) * r * .56 * rad, sz = 6 + rnd() * 9;
        if (q % 3 === 0) deco += '<path d="M' + (px - sz) + ' ' + (py + sz * .5) + ' L' + px + ' ' + (py - sz * 1.1) + ' L' + (px + sz) + ' ' + (py + sz * .5) + 'Z" fill="' + c1 + '" opacity=".55"/><path d="M' + (px - sz * .32) + ' ' + (py - sz * .45) + ' L' + px + ' ' + (py - sz * 1.1) + ' L' + (px + sz * .32) + ' ' + (py - sz * .45) + 'Z" fill="#fff" opacity=".7"/>';
        else deco += '<circle cx="' + px.toFixed(0) + '" cy="' + py.toFixed(0) + '" r="' + sz.toFixed(0) + '" fill="' + c1 + '" opacity=".38"/><circle cx="' + (px - 2).toFixed(0) + '" cy="' + (py - 2).toFixed(0) + '" r="' + (sz * .55).toFixed(0) + '" fill="#fff" opacity=".22"/>'; }
      var lw = Math.max(150, esc(x.kurz).length * 8.8 + 28), ly = x.y + r * .86 + 4;
      s += '<g class="kreg' + (done ? " done" : "") + '" tabindex="0" role="link" data-h="#/kap/' + x.kaps[0] + '" aria-label="' + esc(x.kurz) + '">'
        + '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c2 + '"/><stop offset="1" stop-color="' + c1 + '"/></linearGradient></defs>'
        + '<path d="' + blob(x.x, x.y + 12, r * 1.08, r * .86, seed, .22) + '" fill="#001a33" opacity=".3" filter="url(#kbl)"/>'
        + '<path class="kfoam" d="' + blob(x.x, x.y + 2, r * 1.22, r * .98, seed, .22) + '" fill="rgba(255,255,255,.22)" stroke="#fff" stroke-opacity=".8" stroke-width="3" stroke-dasharray="26 14"/>'
        + '<path d="' + blob(x.x, x.y, r * 1.1, r * .88, seed, .22) + '" fill="var(--sand)" stroke="rgba(120,80,20,.35)" stroke-width="2"/>'
        + '<g class="kland"><path d="' + blob(x.x, x.y - 3, r * .98, r * .77, seed, .22) + '" fill="url(#' + gid + ')" stroke="rgba(0,0,0,.2)" stroke-width="2"/>'
        + '<path d="' + blob(x.x - r * .08, x.y - r * .22, r * .72, r * .38, seed + 1, .3) + '" fill="#fff" opacity=".2"/>' + deco + '</g>'
        + '<circle class="kemc" cx="' + x.x + '" cy="' + (x.y - 6) + '" r="' + Math.round(r * .4) + '" fill="#fff" stroke="' + c1 + '" stroke-width="4"/>'
        + '<text class="kem" x="' + x.x + '" y="' + (x.y - 6 + r * .15) + '" font-size="' + Math.round(r * .46) + '" text-anchor="middle">' + x.icon + '</text>'
        + '<text class="kprop" x="' + (x.x - r * .62).toFixed(0) + '" y="' + (x.y + r * .22).toFixed(0) + '" font-size="' + Math.round(r * .3) + '" text-anchor="middle">' + PROPS[id][0] + '</text><text class="kprop" x="' + (x.x + r * .62).toFixed(0) + '" y="' + (x.y + r * .22).toFixed(0) + '" font-size="' + Math.round(r * .3) + '" text-anchor="middle">' + PROPS[id][1] + '</text>'
        + '<g class="klab" transform="translate(' + x.x + ' ' + ly + ')"><rect x="' + (-lw / 2) + '" y="0" width="' + lw + '" height="44" rx="12" fill="' + c3 + '" stroke="#fff" stroke-width="3"/>'
        + '<rect x="' + (-lw / 2 + 3) + '" y="3" width="' + (lw - 6) + '" height="19" rx="9" fill="#fff" opacity=".14"/>'
        + '<text text-anchor="middle" y="19" class="kl1">' + esc(x.kurz) + '</text>'
        + '<text text-anchor="middle" y="36" class="kl2">' + (FR ? "Rég. " : "Teil ") + id + ' · ' + st[0] + '/' + st[1] + (done ? ' ✓' : '') + '</text></g></g>';
    });
    return s + '</svg>';
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
      return '<a class="rcard" href="#/kap/' + x.kaps[0] + '" style="' + pv(palT(id)) + '"><span class="rem">' + x.icon + '</span><span class="rt"><small>' + t("teil") + ' ' + id + '</small><b>' + esc(x.kurz) + '</b><em>' + x.kaps.length + ' ' + (x.kaps.length === 1 ? (FR ? "chapitre" : "Kapitel") : (FR ? "chapitres" : "Kapitel")) + ' · ' + words + ' min</em></span><span class="rbar"><i style="width:' + (st[1] ? st[0] / st[1] * 100 : 0) + '%"></i></span></a>';
    }).join("");
    seite(crumb([[t("land")]]) + '<img class="khero" src="bilder/kurs.jpg" alt="' + esc(t("titel")) + '"><h1>🗺️ ' + t("titel") + '</h1><p class="sub">' + t("sub") + (FR ? ' <b>' + t("hinweis") + '</b>' : '') + '</p>'
      + '<div class="ktools"><div class="kpass"><b>🧳 ' + t("pass_") + '</b><span>' + g + ' / ' + n + ' ' + t("gel") + '</span><div class="kpb"><i style="width:' + pc + '%"></i></div></div>'
      + '<div class="kbtns">' + weiterLink() + '<a class="kbtn" href="#/befehle">⌨️ ' + t("bef") + '</a><a class="kbtn" href="#/vorwort">📜 ' + t("vor") + '</a></div></div>'
      + '<form class="ksuch" id="ksf"><input class="in" id="ksq" type="search" autocomplete="off" enterkeyhint="search" placeholder="' + esc(t("such")) + '"></form>'
      + '<div class="kmapw">' + karteSVG() + '</div>'
      + '<h2>' + t("regionen") + '</h2><div class="rgrid">' + cards + '</div>'
      + '<h2>' + t("anh") + '</h2><div class="agrid">' + ["A","B","C","D","E"].map(function(a){ return '<a class="acard" href="#/' + (a === "E" ? "befehle" : "anhang/" + a) + '"><b>' + t("ap") + ' ' + a + '</b><span>' + esc(FR && a === "E" ? t("bef") : T.anhangT[a]) + '</span></a>'; }).join("") + '</div>'
      + '<p class="kfoot"><button class="kbtn s" id="kreset" type="button">' + t("reset") + '</button></p>');
    document.getElementById("ksf").onsubmit = function(e){ e.preventDefault(); var q = document.getElementById("ksq").value.trim(); if (q) location.hash = "#/suche/" + encodeURIComponent(q); };
    W.querySelectorAll(".kreg").forEach(function(g){ g.onclick = function(){ location.hash = g.getAttribute("data-h"); }; g.onkeydown = function(e){ if (e.key === "Enter" || e.key === " "){ e.preventDefault(); location.hash = g.getAttribute("data-h"); } }; });
    document.getElementById("kreset").onclick = function(){ if (confirm(FR ? "Effacer la progression ?" : "Fortschritt wirklich zurücksetzen?")) { GEL = {}; saveG(); home(); } };
  }
  function kapKarte(n){
    var k = STR.kapitel[n], g = GEL[n];
    return '<a class="kcard' + (g ? " ok" : "") + '" style="' + pv(palK(n)) + '" href="#/kap/' + n + '"><span class="kn">' + n + '</span><span class="kt"><b>' + esc(k.title) + '</b><small>' + k.secs.length + ' ' + t("abs") + ' · ' + k.min + ' ' + t("min") + '</small></span>' + (g ? '<span class="kok" title="' + t("gelesen") + '">✓</span>' : '') + '</a>';
  }
  function teilSeite(id){
    var x = STR.teile[id]; if (!x) return home();
    document.title = x.kurz + " – " + t("titel");
    var intro = x.intro.replace(/<table>[\s\S]*?<\/table>/, "");
    var body;
    if (x.subs){
      var rest = x.kaps.filter(function(n){ return !STR.kapitel[n].sub; });
      body = intro + (rest.length ? '<div class="kgrid">' + rest.map(kapKarte).join("") + '</div>' : '') + Object.keys(x.subs).map(function(s){ var u = x.subs[s];
        return '<section class="ksub" style="' + pv(mkPal(SUBC[s])) + '"><h2><span>' + u.icon + '</span> ' + esc(u.full) + '</h2>' + u.intro.replace(/<table>[\s\S]*?<\/table>/, "") + '<div class="kgrid">' + u.kaps.map(kapKarte).join("") + '</div></section>'; }).join("");
    } else body = intro + '<div class="kgrid">' + x.kaps.map(kapKarte).join("") + '</div>';
    var st = teilStat(id), ids = Object.keys(STR.teile), i = ids.indexOf(id);
    var pvt = i > 0 ? STR.teile[ids[i - 1]] : null, nx = i < ids.length - 1 ? STR.teile[ids[i + 1]] : null;
    seite(crumb([[t("land"), "#/"], [(FR ? "Région " : "Teil ") + id]]) + '<div class="rhead" style="' + pv(palT(id)) + '"><span class="rem">' + x.icon + '</span><div><small>' + t("teil") + ' ' + id + '</small><h1>' + esc(x.title) + '</h1><p>' + st[0] + ' / ' + st[1] + ' ' + t("gel") + '</p></div></div>'
      + '<div class="prose" style="' + pv(palT(id)) + '">' + body + '</div>'
      + '<div class="pn">' + (pvt ? '<a href="#/teil/' + pvt.id + '">‹ ' + esc(pvt.kurz) + '</a>' : '<span></span>') + '<a href="#/">🗺️ ' + t("karte") + '</a>' + (nx ? '<a href="#/teil/' + nx.id + '">' + esc(nx.kurz) + ' ›</a>' : '<span></span>') + '</div>');
  }
  function frHead(h){ var S = FRT.secs || {}; return h.replace(/<section id="([^"]+)"><h2>[^<]*/g, function(m, id){ return S[id] ? '<section id="' + id + '"><h2>' + S[id] : m; }); }
  // --- Leseansicht
  function secId(s){ return /^\d/.test(s) ? "s" + s.replace(/\./g, "-") : s; }
  function lesen(kind, key, sec){
    var info, file, titel, teil = null, crumbs;
    if (kind === "vorwort"){ info = STR.vorwort; file = "vorwort.html"; titel = info.title; crumbs = [[t("land"), "#/"], [t("vor")]]; }
    else if (kind === "anhang"){ info = STR.anhang[key]; if (!info || key === "E") return key === "E" ? befehle() : home(); file = "a" + key + ".html"; titel = t("ap") + " " + key + " – " + info.title; crumbs = [[t("land"), "#/"], [t("anh")], [t("ap") + " " + key]]; }
    else { info = STR.kapitel[key]; if (!info) return home(); file = "k" + ("0" + key).slice(-2) + ".html"; teil = STR.teile[info.teil]; titel = (FR ? "Chapitre " : "Kapitel ") + key + ": " + info.title; crumbs = [[t("land"), "#/"], [teil.kurz, "#/teil/" + teil.id], [(FR ? "Chap. " : "Kap. ") + key]]; }
    var pal = kind === "kap" ? palK(+key) : mkPal("#2f6df0");
    document.title = titel + " – " + t("titel");
    var hk = kind + "/" + key; lastSet(kind === "kap" ? "#/kap/" + key : kind === "anhang" ? "#/anhang/" + key : "#/vorwort");
    var base = kind === "kap" ? "kap/" + key : kind === "anhang" ? "anhang/" + key : "vorwort";
    function secLinks(sx){ return sx.map(function(s){ return '<a class="os" href="#/' + base + '/' + s[0] + '" data-s="' + s[0] + '">' + esc(s[1]) + '</a>'; }).join(""); }
    var outline = "";
    if (kind === "kap"){
      var lastSub = null;
      outline = '<a class="oreg" href="#/teil/' + teil.id + '">' + teil.icon + ' ' + esc(teil.kurz) + '</a>' + teil.kaps.map(function(n){
        var kk = STR.kapitel[n], h = "";
        if (teil.subs && kk.sub !== lastSub){ lastSub = kk.sub; h = kk.sub ? '<div class="osub">' + teil.subs[kk.sub].icon + ' ' + esc(teil.subs[kk.sub].name) + '</div>' : ""; }
        var cur = n === +key;
        return h + '<div class="och' + (cur ? " cur" : "") + '" style="' + pv(palK(n)) + '"><a class="ok" href="#/kap/' + n + '"><i>' + n + '</i><span>' + esc(kk.title) + '</span>' + (GEL[n] ? '<em>✓</em>' : '') + '</a>' + (cur ? '<div class="osl">' + secLinks(kk.secs) + '</div>' : '') + '</div>';
      }).join("");
    } else outline = '<div class="osl flat">' + secLinks(info.secs) + '</div>';
    var ids = Object.keys(STR.kapitel).map(Number), pi = ids.indexOf(+key);
    var prev = kind === "kap" && pi > 0 ? ids[pi - 1] : null, next = kind === "kap" && pi < ids.length - 1 ? ids[pi + 1] : null;
    seite(crumb(crumbs) + '<div class="lese" style="' + pv(pal) + '"><aside class="outl"><div class="olist">' + outline + '</div></aside>'
      + '<article><div class="ban"><h1>' + esc(titel) + '</h1></div>' + (info.min ? '<p class="meta">' + info.secs.length + ' ' + t("abs") + ' · ' + info.min + ' ' + t("min") + (FR ? ' · <em>' + t("hinweis") + '</em>' : '') + '</p>' : '')
      + '<div class="prose" id="kbody"><p class="platz">…</p></div><div id="kend"></div>'
      + (kind === "kap" ? '<div class="kdone"><button type="button" class="kbtn pri" id="kmark"></button></div>' : '')
      + '<div class="pn">' + (prev ? '<a href="#/kap/' + prev + '">‹ ' + (FR ? "Chap. " : "Kap. ") + prev + ': ' + esc(STR.kapitel[prev].title) + '</a>' : (kind === "kap" ? '<a href="#/teil/' + info.teil + '">‹ ' + esc(teil.kurz) + '</a>' : '<span></span>')) + '<a href="#/">🗺️</a>' + (next ? '<a href="#/kap/' + next + '">' + (FR ? "Chap. " : "Kap. ") + next + ': ' + esc(STR.kapitel[next].title) + ' ›</a>' : '<span></span>') + '</div></article></div>');
    var pb = document.getElementById("kprog"); pb.classList.add("on");
    var mark = document.getElementById("kmark");
    function mk(){ if (!mark) return; mark.textContent = GEL[key] ? t("entmark") : t("markieren"); mark.classList.toggle("pri", !GEL[key]); }
    if (mark){ mk(); mark.onclick = function(){ if (GEL[key]) delete GEL[key]; else GEL[key] = 1; saveG(); mk(); }; }
    (FR ? get(D + file.replace(".html", ".fr.html")).catch(function(){ return get(D + file).then(function(h){ return frHead(h); }); }) : get(D + file)).then(function(h){
      var b = document.getElementById("kbody"); if (!b) return; b.innerHTML = h;
      b.querySelectorAll("pre").forEach(function(p){
        var c = document.createElement("button"); c.type = "button"; c.className = "cp"; c.textContent = t("kopieren");
        c.onclick = function(){ var tx = p.querySelector("code") ? p.querySelector("code").innerText : p.innerText; (navigator.clipboard ? navigator.clipboard.writeText(tx) : Promise.reject()).then(function(){ c.textContent = t("kopiert"); setTimeout(function(){ c.textContent = t("kopieren"); }, 1400); }, function(){}); };
        p.appendChild(c);
      });
      if (sec){ var el = document.getElementById(secId(sec)); if (el) setTimeout(function(){ setForced(secId(sec)); el.scrollIntoView({block: "start"}); window.scrollBy(0, -70); if (spyF) spyF(); }, 30); }
      spy();
      var end = document.getElementById("kend");
      if (kind === "kap" && "IntersectionObserver" in window && end){ var io = new IntersectionObserver(function(en){ if (en[0].isIntersecting && !GEL[key]){ GEL[key] = 1; saveG(); mk(); io.disconnect(); } }); io.observe(end); }
    }, function(){ var b = document.getElementById("kbody"); if (b) b.innerHTML = '<p class="platz">⚠️ ' + (FR ? "Chargement impossible." : "Das Kapitel konnte nicht geladen werden.") + '</p>'; });
  }
  var spyF = null, forced = null;
  function setForced(id){ forced = {id: id, y: -1}; setTimeout(function(){ if (forced) forced.y = window.pageYOffset; }, 450); }
  function spy(){
    var secs = Array.prototype.slice.call(document.querySelectorAll("#kbody > section")), links = document.querySelectorAll(".olist a.os");
    if (spyF) window.removeEventListener("scroll", spyF);
    spyF = function(){
      var h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      document.querySelector("#kprog i").style.width = Math.min(100, p * 100) + "%";
      var cur = null; secs.forEach(function(s){ if (s.getBoundingClientRect().top < 140) cur = s.id; });
      if (!cur && secs.length) cur = secs[0].id;
      if (forced){ if (forced.y >= 0 && Math.abs(window.pageYOffset - forced.y) > 90) forced = null; else cur = forced.id; }
      links.forEach(function(a){ var on = secId(a.dataset.s) === cur; if (a.classList.contains("on") !== on) a.classList.toggle("on", on); });
    };
    links.forEach(function(a){ a.addEventListener("click", function(){ setForced(secId(a.dataset.s)); spyF(); }); });
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
      var s = h.split("/")[3], el = s && document.getElementById(secId(s)); if (el){ setForced(secId(s)); el.scrollIntoView({block: "start"}); window.scrollBy(0, -70); if (spyF) spyF(); } return;
    }
    lastKey = key; route();
  }
  return { start: function(){
    document.body.classList.add("kursbody");
    var stil = "papier"; try { stil = localStorage.getItem("kurs-stil") || "papier"; } catch(e){}
    function setStil(v){ stil = v; document.body.classList.toggle("kgruen", v === "gruen"); try { localStorage.setItem("kurs-stil", v); } catch(e){} document.querySelectorAll("#kStil button").forEach(function(b){ b.classList.toggle("on", b.dataset.v === v); b.setAttribute("aria-pressed", b.dataset.v === v); }); }
    setTimeout(function(){
      var bar = document.querySelector("header .bar"); if (!bar || document.getElementById("kStil")) return;
      var d = document.createElement("div"); d.className = "seg"; d.id = "kStil"; d.setAttribute("role", "group"); d.setAttribute("aria-label", FR ? "Style de page" : "Seitenstil");
      d.innerHTML = '<button type="button" data-v="papier" aria-label="' + (FR ? "Page" : "Papier") + '" title="' + (FR ? "Fond vert, page claire" : "Papier: Hintergrund grün, Fenster hell") + '"><i class="ksw sp"></i></button><button type="button" data-v="gruen" aria-label="' + (FR ? "Vert" : "Grün") + '" title="' + (FR ? "Tout en vert" : "Grün: alles grün") + '"><i class="ksw sg"></i></button>';
      bar.appendChild(d); d.querySelectorAll("button").forEach(function(b){ b.onclick = function(){ setStil(b.dataset.v); }; }); setStil(stil);
    }, 0); setStil(stil);
    (FR ? get(D + "fr.json", true).catch(function(){ return {}; }) : Promise.resolve({})).then(function(f){ FRT.secs = f.secs; FRT.intro = f.intro; return get(D + "struktur.json", true); }).then(function(s){ STR = s; trad(); window.addEventListener("hashchange", onHash); onHash(); },
      function(){ W.innerHTML = '<p class="platz">⚠️ ' + (FR ? "Les données n’ont pas pu être chargées." : "Die Daten konnten nicht geladen werden. Bitte die Seite über den Webserver öffnen.") + '</p>'; });
  } };
})();
