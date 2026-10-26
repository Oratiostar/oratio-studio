// Alltags-Helfer: QR-Code, Passwort, Umrechner, Rechner, Text, Bild, Zufall, Zeit, Farbe.
// Alles läuft im Browser. Es wird nichts hochgeladen, gesendet oder gespeichert.
(function(){
"use strict";
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const FR = () => WZ.lang === "fr";
const T = (de, fr) => FR() ? fr : de;
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const num = (v, d) => { const x = parseFloat(String(v).replace(",", ".")); return isFinite(x) ? x : (d === undefined ? NaN : d); };
const fmt = (x, dig) => isFinite(x) ? x.toLocaleString(FR() ? "fr-FR" : "de-DE", { maximumFractionDigits: dig === undefined ? 6 : dig }) : "–";
const money = x => isFinite(x) ? x.toLocaleString(FR() ? "fr-FR" : "de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "–";
const SAFE = () => '<p class="safe">🔒 ' + T("Alles bleibt auf deinem Gerät. Nichts wird gesendet oder gespeichert.", "Tout reste sur ton appareil. Rien n’est envoyé ni enregistré.") + '</p>';
function save(blob, name){ const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
async function kopiere(text, knopf){
  let ok = false; try { await navigator.clipboard.writeText(text); ok = true; } catch(e){}
  if (!ok) { const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); try { ok = document.execCommand("copy"); } catch(e){} t.remove(); }
  if (knopf) { const o = knopf.dataset.o || knopf.textContent; knopf.dataset.o = o; knopf.textContent = ok ? T("✓ Kopiert", "✓ Copié") : T("Nicht möglich", "Impossible"); setTimeout(() => { knopf.textContent = o; }, 1400); }
}
function zufall(n){ // gleichverteilte Zahl 0..n-1 (kryptografisch, ohne Verzerrung)
  const a = new Uint32Array(1), grenze = Math.floor(4294967296 / n) * n;
  do { crypto.getRandomValues(a); } while (a[0] >= grenze);
  return a[0] % n;
}
const heute = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };

/* ====================================================================== QR-Code */
function qrTool(host){
  host.innerHTML = '<div class="cols2"><div>' + SAFE() +
    '<div class="tabs" id="qTy"></div><div id="qFelder"></div>' +
    '<label class="l">' + T("Fehlerkorrektur", "Correction d’erreur") + '</label><select class="in" id="qEc"><option value="L">L – ' + T("klein (7 %)", "petit (7 %)") + '</option><option value="M" selected>M – ' + T("normal (15 %)", "normal (15 %)") + '</option><option value="Q">Q – ' + T("hoch (25 %)", "élevé (25 %)") + '</option><option value="H">H – ' + T("sehr hoch (30 %)", "très élevé (30 %)") + '</option></select>' +
    '<div class="rg"><span>' + T("Größe", "Taille") + '</span><input type="range" id="qSz" min="200" max="1000" step="50" value="500"><output id="qSzO">500 px</output></div>' +
    '<div class="row"><label class="l" style="margin:8px 0 0">' + T("Vordergrund", "Avant-plan") + ' <input type="color" id="qFg" value="#000000"></label><label class="l" style="margin:8px 0 0">' + T("Hintergrund", "Arrière-plan") + ' <input type="color" id="qBg" value="#ffffff"></label></div>' +
    '<p class="warn" id="qW" hidden>' + T("Vorder- und Hintergrund sind zu ähnlich – so lässt sich der Code schlecht scannen. Am besten dunkel auf hell.", "Les couleurs sont trop proches – le code se scanne mal. Mieux vaut foncé sur clair.") + '</p>' +
    '</div><div style="text-align:center"><canvas id="qCv" style="max-width:100%;height:auto;border:2px solid var(--line);border-radius:12px;background:#fff"></canvas><p class="status" id="qSt"></p>' +
    '<div class="row" style="justify-content:center"><button class="btn go" id="qPng">PNG ' + T("speichern", "enregistrer") + '</button><button class="btn" id="qSvg">SVG ' + T("speichern", "enregistrer") + '</button></div>' +
    '<p class="hint">' + T("Tipp: Probiere den Code mit der Handy-Kamera aus, bevor du ihn druckst.", "Astuce : teste le code avec l’appareil photo du téléphone avant de l’imprimer.") + '</p></div></div>';
  const TY = [["text", T("Text / Link", "Texte / lien")], ["wifi", "WLAN"], ["mail", T("E-Mail", "E-mail")], ["tel", T("Telefon", "Téléphone")], ["kontakt", T("Kontakt", "Contact")]];
  let typ = "text";
  const F = {
    text: () => '<label class="l">' + T("Text oder Link", "Texte ou lien") + '</label><textarea class="in" id="f1" rows="3" placeholder="https://oratioplace.com"></textarea>',
    wifi: () => '<label class="l">' + T("Name des WLANs (SSID)", "Nom du Wi-Fi (SSID)") + '</label><input class="in" id="f1"><label class="l">' + T("Passwort", "Mot de passe") + '</label><input class="in" id="f2" autocomplete="off"><label class="l">' + T("Verschlüsselung", "Chiffrement") + '</label><select class="in" id="f3"><option value="WPA">WPA / WPA2 / WPA3</option><option value="WEP">WEP</option><option value="nopass">' + T("ohne Passwort", "sans mot de passe") + '</option></select>',
    mail: () => '<label class="l">' + T("E-Mail-Adresse", "Adresse e-mail") + '</label><input class="in" id="f1" type="email"><label class="l">' + T("Betreff (optional)", "Objet (facultatif)") + '</label><input class="in" id="f2"><label class="l">' + T("Text (optional)", "Texte (facultatif)") + '</label><textarea class="in" id="f3" rows="2"></textarea>',
    tel: () => '<label class="l">' + T("Telefonnummer", "Numéro de téléphone") + '</label><input class="in" id="f1" type="tel" placeholder="+49 170 1234567">',
    kontakt: () => ["Vorname|Prénom", "Nachname|Nom", "Telefon|Téléphone", "E-Mail|E-mail", "Firma|Entreprise"].map((l, i) => '<label class="l">' + T(l.split("|")[0], l.split("|")[1]) + '</label><input class="in" id="f' + (i + 1) + '">').join("")
  };
  const wesc = s => String(s).replace(/([\\;,:"])/g, "\\$1");
  const DATA = {
    text: v => v[0], wifi: v => v[0] ? "WIFI:T:" + v[2] + ";S:" + wesc(v[0]) + ";" + (v[2] === "nopass" ? "" : "P:" + wesc(v[1]) + ";") + ";" : "",
    mail: v => v[0] ? "mailto:" + v[0] + (v[1] || v[2] ? "?" + [v[1] ? "subject=" + encodeURIComponent(v[1]) : "", v[2] ? "body=" + encodeURIComponent(v[2]) : ""].filter(Boolean).join("&") : "") : "",
    tel: v => v[0] ? "tel:" + v[0].replace(/[^\d+]/g, "") : "",
    kontakt: v => (v[0] || v[1]) ? "BEGIN:VCARD\nVERSION:3.0\nN:" + (v[1] || "") + ";" + (v[0] || "") + "\nFN:" + [v[0], v[1]].filter(Boolean).join(" ") + (v[2] ? "\nTEL:" + v[2] : "") + (v[3] ? "\nEMAIL:" + v[3] : "") + (v[4] ? "\nORG:" + v[4] : "") + "\nEND:VCARD" : ""
  };
  let qr = null;
  const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16) / 255).map(x => x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
  function felder(){ $("#qTy", host).innerHTML = TY.map(t => '<button class="btn sm' + (t[0] === typ ? " on" : "") + '" data-t="' + t[0] + '">' + t[1] + '</button>').join(""); $("#qFelder", host).innerHTML = F[typ](); $$("#qFelder input,#qFelder textarea,#qFelder select", host).forEach(e => e.addEventListener("input", zeichne)); $$("#qTy button", host).forEach(b => b.onclick = () => { typ = b.dataset.t; felder(); zeichne(); }); }
  function zeichne(){
    const v = [1, 2, 3, 4, 5].map(i => { const e = $("#f" + i, host); return e ? e.value.trim() : ""; });
    const txt = DATA[typ](v), cv = $("#qCv", host), st = $("#qSt", host); st.className = "status"; st.textContent = ""; qr = null;
    const fg = $("#qFg", host).value, bg = $("#qBg", host).value, L1 = lum(fg), L2 = lum(bg);
    $("#qW", host).hidden = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05) > 2.5;
    $("#qSzO", host).textContent = $("#qSz", host).value + " px";
    if (!txt) { cv.width = cv.height = 10; cv.getContext("2d").clearRect(0, 0, 10, 10); st.textContent = T("Gib oben etwas ein – der Code erscheint sofort.", "Saisis quelque chose – le code apparaît tout de suite."); $("#qPng", host).disabled = $("#qSvg", host).disabled = true; return; }
    try { qr = QR.make(txt, $("#qEc", host).value); } catch(e){ st.className = "status bad"; st.textContent = T("Der Text ist zu lang für einen QR-Code dieser Art. Bitte kürzen oder die Fehlerkorrektur auf L stellen.", "Le texte est trop long. Raccourcis-le ou mets la correction d’erreur sur L."); $("#qPng", host).disabled = $("#qSvg", host).disabled = true; return; }
    $("#qPng", host).disabled = $("#qSvg", host).disabled = false;
    const n = qr.n, m = Math.max(2, Math.floor(+$("#qSz", host).value / (n + 8))), px = m * (n + 8); cv.width = cv.height = px;
    const x = cv.getContext("2d"); x.fillStyle = bg; x.fillRect(0, 0, px, px); x.fillStyle = fg;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.get(r, c)) x.fillRect((c + 4) * m, (r + 4) * m, m, m);
    cv.style.width = Math.min(px, 360) + "px";
  }
  $("#qPng", host).onclick = () => $("#qCv", host).toBlob(b => save(b, "qr-code.png"), "image/png");
  $("#qSvg", host).onclick = () => { if (!qr) return; const n = qr.n, fg = $("#qFg", host).value, bg = $("#qBg", host).value; let d = ""; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.get(r, c)) d += "M" + (c + 4) + " " + (r + 4) + "h1v1h-1z";
    save(new Blob(['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + (n + 8) + " " + (n + 8) + '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="' + bg + '"/><path fill="' + fg + '" d="' + d + '"/></svg>'], { type: "image/svg+xml" }), "qr-code.svg"); };
  ["qEc", "qSz", "qFg", "qBg"].forEach(i => $("#" + i, host).addEventListener("input", zeichne));
  felder(); zeichne();
}

/* ====================================================================== Passwort */
function passTool(host){
  host.innerHTML = SAFE() + '<div class="cols2"><div>' +
    '<div class="tabs"><button class="btn sm on" data-m="pw">' + T("Passwort", "Mot de passe") + '</button><button class="btn sm" data-m="pin">PIN</button></div>' +
    '<div class="rg"><span>' + T("Länge", "Longueur") + '</span><input type="range" id="pL" min="8" max="64" value="16"><output id="pLO">16</output></div>' +
    '<div id="pOpt"><label class="chk"><input type="checkbox" id="pU" checked> ' + T("Großbuchstaben (A–Z)", "Majuscules (A–Z)") + '</label><label class="chk"><input type="checkbox" id="pLw" checked> ' + T("Kleinbuchstaben (a–z)", "Minuscules (a–z)") + '</label><label class="chk"><input type="checkbox" id="pD" checked> ' + T("Ziffern (0–9)", "Chiffres (0–9)") + '</label><label class="chk"><input type="checkbox" id="pS" checked> ' + T("Sonderzeichen (!?#…)", "Caractères spéciaux (!?#…)") + '</label><label class="chk"><input type="checkbox" id="pA"> ' + T("Ähnliche Zeichen vermeiden (0 O l 1 I)", "Éviter les caractères semblables (0 O l 1 I)") + '</label></div>' +
    '<p class="hint">' + T("Das Tool erfindet nur neue Passwörter, es kennt keine von dir. Tippe deine echten Passwörter nie in fremde „Prüf-Seiten“.", "Cet outil invente seulement de nouveaux mots de passe. Ne saisis jamais tes vrais mots de passe sur des sites de « test » étrangers.") + '</p></div>' +
    '<div><label class="l">' + T("Dein neues Passwort", "Ton nouveau mot de passe") + '</label><input class="in" id="pOut" readonly style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:18px"><div class="prog" style="height:12px"><i id="pBar"></i></div><p class="status" id="pSt"></p>' +
    '<div class="row"><button class="btn go" id="pNew">' + T("Neu erzeugen", "Générer à nouveau") + '</button><button class="btn" id="pCp">' + T("Kopieren", "Copier") + '</button></div></div></div>';
  let modus = "pw";
  function gen(){
    const L = +$("#pL", host).value; $("#pLO", host).textContent = L; let out = "", bits;
    if (modus === "pin") { for (let i = 0; i < L; i++) out += zufall(10); bits = L * Math.log2(10); }
    else {
      const A = $("#pA", host).checked, S = [["pU", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"], ["pLw", "abcdefghijklmnopqrstuvwxyz"], ["pD", "0123456789"], ["pS", "!@#$%&*?+-_=.,:;/()[]{}"]].filter(s => $("#" + s[0], host).checked)
        .map(s => A ? s[1].replace(/[0OIl1o]/g, "") : s[1]);
      if (!S.length) { $("#pOut", host).value = ""; $("#pSt", host).textContent = T("Wähle mindestens eine Zeichenart.", "Choisis au moins un type de caractères."); $("#pBar", host).style.width = "0"; return; }
      const pool = S.join("");
      for (let tries = 0; tries < 200; tries++) { out = ""; for (let i = 0; i < L; i++) out += pool[zufall(pool.length)]; if (S.every(s => out.split("").some(ch => s.includes(ch)))) break; }
      bits = L * Math.log2(pool.length);
    }
    $("#pOut", host).value = out;
    const stufe = modus === "pin" ? (L >= 6 ? T("für PINs ok – nur mit Sperre nach Fehlversuchen sinnvoll", "correct pour un PIN – utile seulement avec blocage après erreurs") : T("kurz – nur mit Sperre nach Fehlversuchen sinnvoll", "court – utile seulement avec blocage après erreurs")) : bits < 40 ? T("schwach", "faible") : bits < 60 ? T("mittel", "moyen") : bits < 80 ? T("gut", "bon") : T("sehr stark", "très fort");
    $("#pSt", host).textContent = T("Stärke: ", "Force : ") + stufe + " (≈ " + Math.round(bits) + " Bit)";
    const b = $("#pBar", host); b.style.width = Math.min(100, bits / 1.2) + "%"; b.style.background = bits < 40 ? "var(--bad)" : bits < 60 ? "#e8a02e" : "var(--ok)";
  }
  $$(".tabs button", host).forEach(b => b.onclick = () => { modus = b.dataset.m; $$(".tabs button", host).forEach(x => x.classList.toggle("on", x === b)); $("#pOpt", host).hidden = modus === "pin"; const r = $("#pL", host); if (modus === "pin") { r.min = 4; r.max = 12; r.value = 6; } else { r.min = 8; r.max = 64; r.value = 16; } gen(); });
  $$("input", host).forEach(e => e.addEventListener("input", gen)); $("#pNew", host).onclick = gen; $("#pCp", host).onclick = e => kopiere($("#pOut", host).value, e.currentTarget);
  gen();
}

/* ====================================================================== Umrechner */
const UN = {
  len: ["Länge", "Longueur", "m", [["mm", .001], ["cm", .01], ["m", 1], ["km", 1000], ["in (Zoll)", .0254], ["ft (Fuß)", .3048], ["yd (Yard)", .9144], ["mi (Meile)", 1609.344], ["sm (Seemeile)", 1852]]],
  mass: ["Gewicht", "Masse", "kg", [["mg", 1e-6], ["g", .001], ["kg", 1], ["t", 1000], ["oz (Unze)", .028349523125], ["lb (Pfund engl.)", .45359237], ["Pfund (500 g)", .5], ["st (Stone)", 6.35029318]]],
  temp: ["Temperatur", "Température", "°C", [["°C", 0], ["°F", 0], ["K", 0]]],
  vol: ["Volumen & Kochmaße", "Volume et cuisine", "l", [["ml", .001], ["cl", .01], ["dl", .1], ["l", 1], ["m³", 1000], ["TL (5 ml)", .005], ["EL (15 ml)", .015], ["Tasse (250 ml)", .25], ["fl oz (US)", .0295735295625], ["Pint (US)", .473176473], ["Gallone (US)", 3.785411784], ["Gallone (UK)", 4.54609]]],
  area: ["Fläche", "Surface", "m²", [["cm²", 1e-4], ["m²", 1], ["ha", 1e4], ["km²", 1e6], ["in²", 6.4516e-4], ["ft²", .09290304], ["Acre", 4046.8564224]]],
  speed: ["Geschwindigkeit", "Vitesse", "m/s", [["m/s", 1], ["km/h", 1 / 3.6], ["mph", .44704], ["Knoten", 1852 / 3600], ["ft/s", .3048]]],
  time: ["Zeit", "Temps", "s", [["ms", .001], ["s", 1], ["min", 60], ["h", 3600], ["Tage", 86400], ["Wochen", 604800], ["Jahre (365 T.)", 31536000]]],
  data: ["Datenmenge", "Données", "B", [["Bit", .125], ["Byte", 1], ["KB", 1e3], ["MB", 1e6], ["GB", 1e9], ["TB", 1e12], ["KiB", 1024], ["MiB", 1048576], ["GiB", 1073741824], ["TiB", 1099511627776]]],
  press: ["Druck", "Pression", "Pa", [["Pa", 1], ["hPa / mbar", 100], ["kPa", 1000], ["bar", 1e5], ["psi", 6894.757293168], ["atm", 101325], ["mmHg", 133.322387415]]],
  energy: ["Energie", "Énergie", "J", [["J", 1], ["kJ", 1000], ["Wh", 3600], ["kWh", 3.6e6], ["cal", 4.184], ["kcal", 4184], ["BTU", 1055.05585262]]],
  power: ["Leistung", "Puissance", "W", [["W", 1], ["kW", 1000], ["PS (metrisch)", 735.49875], ["hp (engl.)", 745.69987158]]]
};
function umrTool(host){
  let kat = "len", von = 2, nach = 3;
  host.innerHTML = '<div class="tabs" id="uK"></div><div class="cols2"><div><label class="l">' + T("Von", "De") + '</label><div class="row" style="flex-wrap:nowrap"><input class="in" id="uA" inputmode="decimal" value="1"><select class="in" id="uAu" style="max-width:190px"></select></div></div>' +
    '<div><label class="l">' + T("Nach", "Vers") + '</label><div class="row" style="flex-wrap:nowrap"><input class="in" id="uB" inputmode="decimal" readonly><select class="in" id="uBu" style="max-width:190px"></select></div></div></div>' +
    '<div class="row" style="margin-top:10px"><button class="btn sm" id="uSw">⇄ ' + T("Tauschen", "Inverser") + '</button></div><div id="uAll" class="uall"></div>';
  const L = k => UN[k][FR() ? 1 : 0];
  const toBase = (k, i, v) => k === "temp" ? (i === 0 ? v : i === 1 ? (v - 32) * 5 / 9 : v - 273.15) : v * UN[k][3][i][1];
  const fromBase = (k, i, v) => k === "temp" ? (i === 0 ? v : i === 1 ? v * 9 / 5 + 32 : v + 273.15) : v / UN[k][3][i][1];
  function baue(){
    $("#uK", host).innerHTML = Object.keys(UN).map(k => '<button class="btn sm' + (k === kat ? " on" : "") + '" data-k="' + k + '">' + L(k) + '</button>').join("");
    $$("#uK button", host).forEach(b => b.onclick = () => { kat = b.dataset.k; von = 0; nach = Math.min(1, UN[kat][3].length - 1); if (kat === "len") { von = 2; nach = 3; } baue(); });
    const opts = UN[kat][3].map((u, i) => '<option value="' + i + '">' + esc(u[0]) + '</option>').join(""); $("#uAu", host).innerHTML = opts; $("#uBu", host).innerHTML = opts; $("#uAu", host).value = von; $("#uBu", host).value = nach; rechne();
  }
  function rechne(){
    von = +$("#uAu", host).value; nach = +$("#uBu", host).value; const v = num($("#uA", host).value), b = toBase(kat, von, v);
    $("#uB", host).value = isFinite(v) ? fmt(fromBase(kat, nach, b), 8) : "";
    $("#uAll", host).innerHTML = isFinite(v) ? '<table class="utab"><tbody>' + UN[kat][3].map((u, i) => '<tr><td>' + esc(u[0]) + '</td><td>' + fmt(fromBase(kat, i, b), 8) + '</td></tr>').join("") + '</tbody></table>' : "";
  }
  $("#uA", host).addEventListener("input", rechne); $("#uAu", host).addEventListener("change", rechne); $("#uBu", host).addEventListener("change", rechne);
  $("#uSw", host).onclick = () => { const a = $("#uAu", host).value; $("#uAu", host).value = $("#uBu", host).value; $("#uBu", host).value = a; const r = $("#uB", host).value; if (r) $("#uA", host).value = r.replace(/\./g, "").replace(",", "."); rechne(); };
  baue();
}

/* ====================================================================== Rechner */
function rechTool(host){
  const TABS = [["proz", T("Prozent", "Pourcentage")], ["mwst", T("Mehrwertsteuer", "TVA")], ["rab", T("Rabatt", "Remise")], ["tip", T("Trinkgeld & Teilen", "Pourboire et partage")], ["drei", T("Dreisatz", "Règle de trois")], ["dat", T("Datum", "Date")], ["alter", T("Alter", "Âge")], ["geld", T("Kredit & Sparen", "Crédit et épargne")]];
  let tab = "proz";
  const inp = (id, lab, val, ph) => '<div><label class="l">' + lab + '</label><input class="in" id="' + id + '" inputmode="decimal" value="' + (val === undefined ? "" : val) + '" placeholder="' + (ph || "") + '"></div>';
  const res = (id) => '<div class="resbox" id="' + id + '"></div>';
  const V = {
    proz: () => '<h3>' + T("x % von y", "x % de y") + '</h3><div class="cols3">' + inp("a1", "%", 19) + inp("a2", T("von", "de"), 250) + '</div>' + res("r1") +
      '<h3>' + T("x ist wie viel Prozent von y?", "x représente quel pourcentage de y ?") + '</h3><div class="cols3">' + inp("b1", "x", 30) + inp("b2", "y", 120) + '</div>' + res("r2") +
      '<h3>' + T("Veränderung in Prozent", "Variation en pourcentage") + '</h3><div class="cols3">' + inp("c1", T("alt", "ancien"), 80) + inp("c2", T("neu", "nouveau"), 100) + '</div>' + res("r3"),
    mwst: () => '<div class="cols3">' + inp("m1", T("Betrag (€)", "Montant (€)"), 100) + inp("m2", T("Steuersatz %", "Taux %"), 19) + '</div><div class="row" style="margin:8px 0"><button class="btn sm" data-s="19">19 %</button><button class="btn sm" data-s="7">7 %</button><button class="btn sm" data-s="20">20 % (FR)</button><button class="btn sm" data-s="10">10 % (FR)</button><button class="btn sm" data-s="5.5">5,5 % (FR)</button></div>' +
      '<div class="tabs t2"><button class="btn sm on" data-m="n2b">' + T("Netto → Brutto", "HT → TTC") + '</button><button class="btn sm" data-m="b2n">' + T("Brutto → Netto", "TTC → HT") + '</button></div>' + res("r1") + '<p class="hint">' + T("In Deutschland gelten 19 % und 7 %, in Frankreich 20 %, 10 % und 5,5 %. Bitte den aktuellen Satz prüfen.", "En Allemagne : 19 % et 7 %, en France : 20 %, 10 % et 5,5 %. Vérifie le taux en vigueur.") + '</p>',
    rab: () => '<div class="cols3">' + inp("d1", T("Preis (€)", "Prix (€)"), 79.9) + inp("d2", T("Rabatt %", "Remise %"), 20) + inp("d3", T("Zweiter Rabatt % (optional)", "Seconde remise % (facultatif)"), "") + '</div>' + res("r1"),
    tip: () => '<div class="cols3">' + inp("t1", T("Rechnung (€)", "Addition (€)"), 86.4) + inp("t2", T("Trinkgeld %", "Pourboire %"), 10) + inp("t3", T("Personen", "Personnes"), 3) + '</div>' + res("r1"),
    drei: () => '<div class="tabs t2"><button class="btn sm on" data-m="p">' + T("Je mehr, desto mehr", "Proportionnel") + '</button><button class="btn sm" data-m="a">' + T("Je mehr, desto weniger", "Inversement proportionnel") + '</button></div><div class="cols3">' + inp("e1", "A", 4) + inp("e2", "B", 10) + inp("e3", "C", 6) + '</div><p class="hint">' + T("Wenn A zu B gehört, was gehört dann zu C?", "Si A correspond à B, que correspond-il à C ?") + '</p>' + res("r1"),
    dat: () => '<h3>' + T("Tage zwischen zwei Daten", "Jours entre deux dates") + '</h3><div class="cols3"><div><label class="l">' + T("Von", "Du") + '</label><input class="in" type="date" id="f1" value="' + heute() + '"></div><div><label class="l">' + T("Bis", "Au") + '</label><input class="in" type="date" id="f2" value="' + heute() + '"></div></div>' + res("r1") +
      '<h3>' + T("Tage addieren oder abziehen", "Ajouter ou retirer des jours") + '</h3><div class="cols3"><div><label class="l">' + T("Startdatum", "Date de départ") + '</label><input class="in" type="date" id="g1" value="' + heute() + '"></div>' + inp("g2", T("Tage (− = zurück)", "Jours (− = en arrière)"), 30) + '</div>' + res("r2"),
    alter: () => '<div class="cols3"><div><label class="l">' + T("Geburtsdatum", "Date de naissance") + '</label><input class="in" type="date" id="h1" value="1990-01-01"></div></div>' + res("r1"),
    geld: () => '<h3>' + T("Kredit: monatliche Rate", "Crédit : mensualité") + '</h3><div class="cols3">' + inp("k1", T("Betrag (€)", "Montant (€)"), 10000) + inp("k2", T("Zins % pro Jahr", "Taux % par an"), 5) + inp("k3", T("Laufzeit (Jahre)", "Durée (années)"), 5) + '</div>' + res("r1") +
      '<h3>' + T("Sparplan: Endbetrag", "Plan d’épargne : capital final") + '</h3><div class="cols3">' + inp("s1", T("Sparrate pro Monat (€)", "Épargne mensuelle (€)"), 100) + inp("s2", T("Zins % pro Jahr", "Taux % par an"), 3) + inp("s3", T("Laufzeit (Jahre)", "Durée (années)"), 10) + '</div>' + res("r2") +
      '<p class="hint">' + T("Vereinfachte Rechnung (gleichbleibender Zins, monatlich). Keine Beratung, keine Steuern oder Gebühren.", "Calcul simplifié (taux constant, mensuel). Pas un conseil, sans impôts ni frais.") + '</p>'
  };
  const g = id => num($("#" + id, host).value);
  const C = {
    proz: () => { const a = g("a1"), b = g("a2"); $("#r1", host).innerHTML = isFinite(a * b) ? '<b>' + fmt(a * b / 100, 4) + '</b>' : "";
      const x = g("b1"), y = g("b2"); $("#r2", host).innerHTML = isFinite(x / y) ? '<b>' + fmt(x / y * 100, 4) + ' %</b>' : "";
      const o = g("c1"), n = g("c2"); $("#r3", host).innerHTML = isFinite((n - o) / o) ? '<b>' + (n >= o ? "+" : "") + fmt((n - o) / Math.abs(o) * 100, 4) + ' %</b>' : ""; },
    mwst: () => { const b = g("m1"), p = g("m2"), m = $("#rB .tabs .on", host).dataset.m; if (!isFinite(b * p)) { $("#r1", host).innerHTML = ""; return; }
      const net = m === "n2b" ? b : b / (1 + p / 100), gross = m === "n2b" ? b * (1 + p / 100) : b;
      $("#r1", host).innerHTML = '<table class="utab"><tr><td>' + T("Netto", "HT") + '</td><td>' + money(net) + ' €</td></tr><tr><td>' + T("Steuer", "TVA") + ' (' + fmt(p) + ' %)</td><td>' + money(gross - net) + ' €</td></tr><tr><td><b>' + T("Brutto", "TTC") + '</b></td><td><b>' + money(gross) + ' €</b></td></tr></table>'; },
    rab: () => { const p = g("d1"), r = g("d2"), r2 = num($("#d3", host).value, 0); if (!isFinite(p * r)) { $("#r1", host).innerHTML = ""; return; }
      const neu = p * (1 - r / 100) * (1 - r2 / 100); $("#r1", host).innerHTML = '<table class="utab"><tr><td>' + T("Neuer Preis", "Nouveau prix") + '</td><td><b>' + money(neu) + ' €</b></td></tr><tr><td>' + T("Du sparst", "Tu économises") + '</td><td>' + money(p - neu) + ' € (' + fmt((1 - neu / p) * 100, 2) + ' %)</td></tr></table>'; },
    tip: () => { const r = g("t1"), t = g("t2"), n = Math.max(1, Math.round(g("t3"))); if (!isFinite(r * t * n)) { $("#r1", host).innerHTML = ""; return; }
      const tip = r * t / 100, tot = r + tip; $("#r1", host).innerHTML = '<table class="utab"><tr><td>' + T("Trinkgeld", "Pourboire") + '</td><td>' + money(tip) + ' €</td></tr><tr><td>' + T("Gesamt", "Total") + '</td><td>' + money(tot) + ' €</td></tr><tr><td><b>' + T("Pro Person", "Par personne") + '</b></td><td><b>' + money(tot / n) + ' €</b></td></tr></table>'; },
    drei: () => { const a = g("e1"), b = g("e2"), c = g("e3"), m = $("#rB .tabs .on", host).dataset.m; const x = m === "p" ? b * c / a : a * b / c; $("#r1", host).innerHTML = isFinite(x) ? '<b>' + fmt(x, 6) + '</b>' : ""; },
    dat: () => { const u = s => { const m = /^(\d+)-(\d+)-(\d+)$/.exec(s || ""); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN; };
      const a = u($("#f1", host).value), b = u($("#f2", host).value), d = Math.round((b - a) / 864e5);
      $("#r1", host).innerHTML = isFinite(d) ? '<b>' + fmt(Math.abs(d)) + ' ' + T("Tage", "jours") + '</b> (≈ ' + fmt(Math.abs(d) / 7, 1) + ' ' + T("Wochen", "semaines") + ', ≈ ' + fmt(Math.abs(d) / 30.4375, 1) + ' ' + T("Monate", "mois") + ')' : "";
      const s = u($("#g1", host).value), n = g("g2"); if (isFinite(s * n)) { const r = new Date(s + Math.round(n) * 864e5); $("#r2", host).innerHTML = '<b>' + r.toLocaleDateString(FR() ? "fr-FR" : "de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }) + '</b>'; } else $("#r2", host).innerHTML = ""; },
    alter: () => { const m = /^(\d+)-(\d+)-(\d+)$/.exec($("#h1", host).value || ""); if (!m) { $("#r1", host).innerHTML = ""; return; }
      const now = new Date(), t0 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()); let y = now.getFullYear() - +m[1], mo = now.getMonth() + 1 - +m[2], d = now.getDate() - +m[3];
      if (d < 0) { mo--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); } if (mo < 0) { y--; mo += 12; }
      const bd = Date.UTC(+m[1], +m[2] - 1, +m[3]); if (bd > t0) { $("#r1", host).innerHTML = T("Das Datum liegt in der Zukunft.", "Cette date est dans le futur."); return; }
      let nb = Date.UTC(now.getFullYear(), +m[2] - 1, +m[3]); if (nb < t0) nb = Date.UTC(now.getFullYear() + 1, +m[2] - 1, +m[3]);
      $("#r1", host).innerHTML = '<b>' + y + ' ' + T("Jahre", "ans") + ', ' + mo + ' ' + T("Monate", "mois") + ', ' + d + ' ' + T("Tage", "jours") + '</b><br>' + T("Das sind insgesamt ", "Soit au total ") + fmt(Math.round((t0 - bd) / 864e5)) + ' ' + T("Tage.", "jours.") + '<br>' + T("Nächster Geburtstag in ", "Prochain anniversaire dans ") + fmt(Math.round((nb - t0) / 864e5)) + ' ' + T("Tagen.", "jours."); },
    geld: () => { const K = g("k1"), z = g("k2"), j = g("k3"); if (isFinite(K * z * j) && j > 0) { const n = Math.round(j * 12), i = z / 100 / 12, rate = i === 0 ? K / n : K * i / (1 - Math.pow(1 + i, -n));
        $("#r1", host).innerHTML = '<table class="utab"><tr><td>' + T("Monatliche Rate", "Mensualité") + '</td><td><b>' + money(rate) + ' €</b></td></tr><tr><td>' + T("Zinsen insgesamt", "Intérêts au total") + '</td><td>' + money(rate * n - K) + ' €</td></tr><tr><td>' + T("Zurückgezahlt insgesamt", "Total remboursé") + '</td><td>' + money(rate * n) + ' €</td></tr></table>'; } else $("#r1", host).innerHTML = "";
      const R = g("s1"), z2 = g("s2"), j2 = g("s3"); if (isFinite(R * z2 * j2) && j2 > 0) { const n = Math.round(j2 * 12), i = z2 / 100 / 12, e = i === 0 ? R * n : R * (Math.pow(1 + i, n) - 1) / i;
        $("#r2", host).innerHTML = '<table class="utab"><tr><td>' + T("Eingezahlt", "Versé") + '</td><td>' + money(R * n) + ' €</td></tr><tr><td>' + T("Zinsen", "Intérêts") + '</td><td>' + money(e - R * n) + ' €</td></tr><tr><td><b>' + T("Endbetrag", "Capital final") + '</b></td><td><b>' + money(e) + ' €</b></td></tr></table>'; } else $("#r2", host).innerHTML = ""; }
  };
  function baue(){
    host.innerHTML = '<div class="tabs" id="rT">' + TABS.map(t => '<button class="btn sm' + (t[0] === tab ? " on" : "") + '" data-t="' + t[0] + '">' + t[1] + '</button>').join("") + '</div><div id="rB">' + V[tab]() + '</div>';
    $$("#rT button", host).forEach(b => b.onclick = () => { tab = b.dataset.t; baue(); });
    $$("#rB input", host).forEach(e => e.addEventListener("input", C[tab]));
    $$("#rB [data-s]", host).forEach(b => b.onclick = () => { $("#m2", host).value = b.dataset.s.replace(".", ","); C[tab](); });
    $$("#rB .tabs [data-m]", host).forEach(b => b.onclick = () => { $$("#rB .tabs [data-m]", host).forEach(x => x.classList.toggle("on", x === b)); C[tab](); });
    C[tab]();
  }
  baue();
}

/* ====================================================================== Text */
function textTool(host){
  host.innerHTML = '<textarea class="in" id="xT" rows="9" placeholder="' + T("Text hier einfügen oder schreiben …", "Colle ou écris ton texte ici …") + '"></textarea><div class="stats" id="xS"></div>' +
    '<h3>' + T("Schreibweise", "Casse") + '</h3><div class="row" id="xB1"></div><h3>' + T("Zeilen", "Lignes") + '</h3><div class="row" id="xB2"></div>' +
    '<div class="row" style="margin-top:12px"><button class="btn go" id="xCp">' + T("Kopieren", "Copier") + '</button><button class="btn" id="xUn" disabled>↶ ' + T("Rückgängig", "Annuler") + '</button><button class="btn" id="xCl">' + T("Leeren", "Vider") + '</button></div>';
  const ta = $("#xT", host); let alt = null;
  const OPS1 = [[T("GROSSBUCHSTABEN", "MAJUSCULES"), s => s.toLocaleUpperCase()], [T("kleinbuchstaben", "minuscules"), s => s.toLocaleLowerCase()], [T("Jedes Wort Groß", "Chaque Mot en Majuscule"), s => s.toLocaleLowerCase().replace(/(^|[\s\-(„"])(\S)/g, (m, a, b) => a + b.toLocaleUpperCase())], [T("Satzanfang groß", "Début de phrase en majuscule"), s => s.toLocaleLowerCase().replace(/(^\s*|[.!?]\s+)(\S)/g, (m, a, b) => a + b.toLocaleUpperCase())]];
  const lines = f => s => f(s.split("\n")).join("\n");
  const col = new Intl.Collator(FR() ? "fr" : "de", { numeric: true, sensitivity: "base" });
  const OPS2 = [["A → Z", lines(a => a.slice().sort(col.compare))], ["Z → A", lines(a => a.slice().sort((x, y) => col.compare(y, x)))], [T("Doppelte entfernen", "Supprimer les doublons"), lines(a => a.filter((x, i) => a.indexOf(x) === i))], [T("Leerzeilen entfernen", "Supprimer les lignes vides"), lines(a => a.filter(x => x.trim()))], [T("Reihenfolge umkehren", "Inverser l’ordre"), lines(a => a.slice().reverse())], [T("Leerzeichen aufräumen", "Nettoyer les espaces"), lines(a => a.map(x => x.replace(/[ \t]+/g, " ").trim()))], [T("Nummerieren", "Numéroter"), lines(a => a.map((x, i) => (i + 1) + ". " + x))]];
  const mk = (id, ops) => { $("#" + id, host).innerHTML = ops.map((o, i) => '<button class="btn sm" data-i="' + i + '">' + o[0] + '</button>').join(""); $$("#" + id + " button", host).forEach(b => b.onclick = () => { alt = ta.value; ta.value = ops[+b.dataset.i][1](ta.value); $("#xUn", host).disabled = false; zaehle(); }); };
  mk("xB1", OPS1); mk("xB2", OPS2);
  function zaehle(){
    const s = ta.value, w = (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’\-]*/gu) || []).length, sat = (s.match(/[^.!?…]+[.!?…]+(\s|$)/g) || (s.trim() ? [1] : [])).length, abs = s.split(/\n\s*\n/).filter(x => x.trim()).length, zl = s ? s.split("\n").length : 0;
    const min = w / 200; const zt = m => m < 1 ? "< 1 min" : Math.round(m) + " min";
    $("#xS", host).innerHTML = [[T("Zeichen", "Caractères"), s.length], [T("ohne Leerzeichen", "sans espaces"), s.replace(/\s/g, "").length], [T("Wörter", "Mots"), w], [T("Sätze", "Phrases"), sat], [T("Absätze", "Paragraphes"), abs], [T("Zeilen", "Lignes"), zl]].map(x => '<div><b>' + fmt(x[1], 0) + '</b><small>' + x[0] + '</small></div>').join("") + '<div><b>' + zt(min) + '</b><small>' + T("Lesezeit", "Lecture") + '</small></div><div><b>' + zt(w / 130) + '</b><small>' + T("Sprechzeit", "Parole") + '</small></div>';
  }
  ta.addEventListener("input", zaehle); $("#xUn", host).onclick = () => { if (alt !== null) { const t = ta.value; ta.value = alt; alt = t; zaehle(); } };
  $("#xCl", host).onclick = () => { alt = ta.value; ta.value = ""; $("#xUn", host).disabled = false; zaehle(); }; $("#xCp", host).onclick = e => kopiere(ta.value, e.currentTarget);
  zaehle();
}

/* ====================================================================== Bild */
function bildTool(host){
  host.innerHTML = SAFE() + '<div class="drop" id="iDrop" tabindex="0" role="button"><b>' + T("Foto auswählen oder hierher ziehen", "Choisis une photo ou glisse-la ici") + '</b>JPG, PNG, WebP, GIF…</div><input type="file" id="iFile" accept="image/*" hidden><div id="iWork" hidden>' +
    '<div class="tabs" id="iTabs"><button class="btn sm on" data-m="crop">' + T("Zuschneiden", "Recadrer") + '</button><button class="btn sm" data-m="pix">' + T("Unkenntlich machen", "Flouter") + '</button></div>' +
    '<div class="row" id="iCropOpt"><select class="in" id="iRat" style="max-width:260px"></select><div class="rg" style="grid-template-columns:70px 1fr;min-width:200px;flex:1;margin:0"><span>Zoom</span><input type="range" id="iZoom" min="10" max="100" value="100"></div><button class="btn go sm" id="iApply">' + T("Zuschnitt anwenden", "Appliquer le recadrage") + '</button></div>' +
    '<div class="row" id="iPixOpt" hidden><span class="muted">' + T("Mit dem Finger oder der Maus einen Bereich markieren.", "Marque une zone au doigt ou à la souris.") + '</span><div class="rg" style="grid-template-columns:70px 1fr;min-width:200px;flex:1;margin:0"><span>' + T("Stärke", "Force") + '</span><input type="range" id="iPx" min="6" max="60" value="22"></div></div>' +
    '<div class="row" style="margin:8px 0"><button class="btn sm" id="iRl">⟲ ' + T("Links drehen", "Pivoter à gauche") + '</button><button class="btn sm" id="iRr">⟳ ' + T("Rechts drehen", "Pivoter à droite") + '</button><button class="btn sm" id="iFh">⇋ ' + T("Spiegeln", "Miroir") + '</button><button class="btn sm" id="iFv">⇅ ' + T("Kopfüber", "Retourner") + '</button><button class="btn sm" id="iUn" disabled>↶ ' + T("Rückgängig", "Annuler") + '</button></div>' +
    '<div style="text-align:center"><canvas id="iCv" style="max-width:100%;height:auto;touch-action:none;border:2px solid var(--line);border-radius:10px;cursor:crosshair"></canvas></div><p class="status" id="iInfo"></p>' +
    '<div class="row"><select class="in" id="iFm" style="max-width:130px"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select><label class="l" style="margin:0">' + T("Breite (px, leer = Original)", "Largeur (px, vide = original)") + '</label><input class="in" id="iW" inputmode="numeric" style="max-width:110px"><button class="btn go" id="iSave">' + T("Speichern", "Enregistrer") + '</button></div><p class="hint">' + T("Beim Speichern werden Zusatzdaten wie Aufnahmeort (GPS) und Kameradaten automatisch entfernt.", "À l’enregistrement, les métadonnées (lieu GPS, données de l’appareil) sont supprimées automatiquement.") + '</p></div>';
  const RAT = [[T("Original-Format", "Format d’origine"), 0], ["1 : 1", 1], ["4 : 3", 4 / 3], ["3 : 4", 3 / 4], ["3 : 2", 3 / 2], ["2 : 3", 2 / 3], ["16 : 9", 16 / 9], [T("Passfoto 35 × 45 mm", "Photo d’identité 35 × 45 mm"), 35 / 45, 827], [T("Frei (Bereich ziehen)", "Libre (tracer une zone)"), -1]];
  $("#iRat", host).innerHTML = RAT.map((r, i) => '<option value="' + i + '">' + r[0] + '</option>').join("");
  let cur = null, hist = [], mode = "crop", rect = null, drag = null;
  const cv = $("#iCv", host), x = cv.getContext("2d");
  function push(){ hist.push(cur); if (hist.length > 12) hist.shift(); $("#iUn", host).disabled = false; }
  function neu(w, h){ const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function ratio(){ const r = RAT[+$("#iRat", host).value][1]; return r === 0 ? cur.width / cur.height : r; }
  function resetRect(){ if (!cur) return; const r = ratio(); if (r < 0) { rect = null; return; } const z = +$("#iZoom", host).value / 100; let w = cur.width, h = w / r; if (h > cur.height) { h = cur.height; w = h * r; } w *= z; h *= z; const cx = rect ? rect.x + rect.w / 2 : cur.width / 2, cy = rect ? rect.y + rect.h / 2 : cur.height / 2; rect = { x: Math.min(Math.max(cx - w / 2, 0), cur.width - w), y: Math.min(Math.max(cy - h / 2, 0), cur.height - h), w, h }; }
  function zeige(){
    if (!cur) return; const s = Math.min(1, 900 / Math.max(cur.width, cur.height)); cv.width = Math.round(cur.width * s); cv.height = Math.round(cur.height * s); cv.style.width = cv.width + "px";
    x.drawImage(cur, 0, 0, cv.width, cv.height);
    if (mode === "crop" && rect) { x.fillStyle = "rgba(0,0,0,.55)"; const a = rect.x * s, b = rect.y * s, w = rect.w * s, h = rect.h * s; x.fillRect(0, 0, cv.width, b); x.fillRect(0, b + h, cv.width, cv.height - b - h); x.fillRect(0, b, a, h); x.fillRect(a + w, b, cv.width - a - w, h); x.strokeStyle = "#fff"; x.lineWidth = 2; x.strokeRect(a, b, w, h); }
    if (drag && drag.sel) { x.strokeStyle = "#ffd34a"; x.lineWidth = 2; x.setLineDash([6, 4]); x.strokeRect(drag.sel.x * s, drag.sel.y * s, drag.sel.w * s, drag.sel.h * s); x.setLineDash([]); }
    $("#iInfo", host).textContent = cur.width + " × " + cur.height + " px" + (mode === "crop" && rect ? "  →  " + Math.round(rect.w) + " × " + Math.round(rect.h) + " px" : "");
  }
  const pos = e => { const b = cv.getBoundingClientRect(), s = cur.width / b.width; return [(e.clientX - b.left) * s, (e.clientY - b.top) * s]; };
  cv.addEventListener("pointerdown", e => { if (!cur) return; cv.setPointerCapture(e.pointerId); const p = pos(e);
    if (mode === "crop" && rect) drag = { move: true, dx: p[0] - rect.x, dy: p[1] - rect.y }; else drag = { sel: { x: p[0], y: p[1], w: 0, h: 0 }, ox: p[0], oy: p[1] }; });
  cv.addEventListener("pointermove", e => { if (!drag) return; const p = pos(e);
    if (drag.move) { rect.x = Math.min(Math.max(p[0] - drag.dx, 0), cur.width - rect.w); rect.y = Math.min(Math.max(p[1] - drag.dy, 0), cur.height - rect.h); }
    else { const px = Math.min(Math.max(p[0], 0), cur.width), py = Math.min(Math.max(p[1], 0), cur.height); drag.sel = { x: Math.min(drag.ox, px), y: Math.min(drag.oy, py), w: Math.abs(px - drag.ox), h: Math.abs(py - drag.oy) }; }
    zeige(); });
  cv.addEventListener("pointerup", () => { if (!drag) return; const d = drag; drag = null;
    if (d.sel && d.sel.w > 4 && d.sel.h > 4) { if (mode === "pix") pixeln(d.sel); else { rect = d.sel; } }
    zeige(); });
  function pixeln(r){ push(); const c = neu(cur.width, cur.height), cx = c.getContext("2d"); cx.drawImage(cur, 0, 0); const b = +$("#iPx", host).value * Math.max(1, cur.width / 900), sw = Math.max(1, Math.round(r.w / b)), sh = Math.max(1, Math.round(r.h / b));
    const t = neu(sw, sh); t.getContext("2d").drawImage(cur, r.x, r.y, r.w, r.h, 0, 0, sw, sh); cx.imageSmoothingEnabled = false; cx.drawImage(t, 0, 0, sw, sh, r.x, r.y, r.w, r.h); cur = c; }
  function transform(fn){ if (!cur) return; push(); cur = fn(cur); rect = null; resetRect(); zeige(); }
  const rot = (c, dir) => { const n = neu(c.height, c.width), t = n.getContext("2d"); t.translate(n.width / 2, n.height / 2); t.rotate(dir * Math.PI / 2); t.drawImage(c, -c.width / 2, -c.height / 2); return n; };
  const flip = (c, h) => { const n = neu(c.width, c.height), t = n.getContext("2d"); if (h) { t.translate(c.width, 0); t.scale(-1, 1); } else { t.translate(0, c.height); t.scale(1, -1); } t.drawImage(c, 0, 0); return n; };
  $("#iRl", host).onclick = () => transform(c => rot(c, -1)); $("#iRr", host).onclick = () => transform(c => rot(c, 1));
  $("#iFh", host).onclick = () => transform(c => flip(c, true)); $("#iFv", host).onclick = () => transform(c => flip(c, false));
  $("#iUn", host).onclick = () => { if (!hist.length) return; cur = hist.pop(); $("#iUn", host).disabled = !hist.length; rect = null; resetRect(); zeige(); };
  $("#iRat", host).onchange = () => { rect = null; $("#iZoom", host).value = 100; resetRect(); const r = RAT[+$("#iRat", host).value]; $("#iW", host).value = r[2] || ""; zeige(); };
  $("#iZoom", host).oninput = () => { resetRect(); zeige(); };
  $("#iApply", host).onclick = () => { if (!rect) return; push(); const c = neu(Math.round(rect.w), Math.round(rect.h)); c.getContext("2d").drawImage(cur, rect.x, rect.y, rect.w, rect.h, 0, 0, c.width, c.height); cur = c; rect = null; $("#iRat", host).value = 0; $("#iZoom", host).value = 100; resetRect(); zeige(); };
  $$("#iTabs button", host).forEach(b => b.onclick = () => { mode = b.dataset.m; $$("#iTabs button", host).forEach(t => t.classList.toggle("on", t === b)); $("#iCropOpt", host).hidden = mode !== "crop"; $("#iPixOpt", host).hidden = mode !== "pix"; zeige(); });
  $("#iSave", host).onclick = () => { if (!cur) return; let c = cur; const w = Math.round(num($("#iW", host).value, 0)); if (w > 0 && w !== cur.width) { c = neu(w, Math.max(1, Math.round(cur.height * w / cur.width))); const t = c.getContext("2d"); t.imageSmoothingQuality = "high"; t.drawImage(cur, 0, 0, c.width, c.height); }
    const type = $("#iFm", host).value; if (type === "image/jpeg") { const n = neu(c.width, c.height), t = n.getContext("2d"); t.fillStyle = "#fff"; t.fillRect(0, 0, n.width, n.height); t.drawImage(c, 0, 0); c = n; }
    c.toBlob(b => save(b, "bild." + (type === "image/jpeg" ? "jpg" : type === "image/png" ? "png" : "webp")), type, .92); };
  async function laden(f){ if (!f) return; try { const bm = await createImageBitmap(f); const c = neu(bm.width, bm.height); c.getContext("2d").drawImage(bm, 0, 0); cur = c; hist = []; rect = null; $("#iUn", host).disabled = true; $("#iWork", host).hidden = false; resetRect(); zeige(); } catch(e){ $("#iDrop", host).querySelector("b").textContent = T("Diese Datei kann ich nicht als Bild öffnen.", "Impossible d’ouvrir ce fichier comme image."); } }
  const dz = $("#iDrop", host), fi = $("#iFile", host); dz.onclick = () => fi.click(); dz.onkeydown = e => { if (e.key === "Enter" || e.key === " ") fi.click(); }; fi.onchange = () => laden(fi.files[0]);
  dz.ondragover = e => { e.preventDefault(); dz.classList.add("over"); }; dz.ondragleave = () => dz.classList.remove("over"); dz.ondrop = e => { e.preventDefault(); dz.classList.remove("over"); laden(e.dataTransfer.files[0]); };
}

/* ====================================================================== Zufall */
function zufTool(host){
  host.innerHTML = '<div class="cols2"><div class="card sub1"><h3>🎲 ' + T("Würfel", "Dés") + '</h3><div class="row"><select class="in" id="wN" style="max-width:110px">' + [1, 2, 3, 4, 5, 6].map(n => '<option value="' + n + '">' + n + ' ×</option>').join("") + '</select><select class="in" id="wS" style="max-width:130px">' + [4, 6, 8, 10, 12, 20, 100].map(n => '<option value="' + n + '"' + (n === 6 ? " selected" : "") + '>W' + n + '</option>').join("") + '</select><button class="btn go" id="wGo">' + T("Würfeln", "Lancer") + '</button></div><div class="big" id="wR">–</div></div>' +
    '<div class="card sub1"><h3>🪙 ' + T("Münzwurf", "Pile ou face") + '</h3><button class="btn go" id="mGo">' + T("Werfen", "Lancer") + '</button><div class="big" id="mR">–</div></div>' +
    '<div class="card sub1"><h3>🔢 ' + T("Zufallszahl", "Nombre aléatoire") + '</h3><div class="row"><input class="in" id="zA" inputmode="numeric" value="1" style="max-width:90px"><span>' + T("bis", "à") + '</span><input class="in" id="zB" inputmode="numeric" value="100" style="max-width:90px"><input class="in" id="zC" inputmode="numeric" value="1" style="max-width:70px" title="' + T("Anzahl", "Nombre") + '"><label class="chk" style="margin:0"><input type="checkbox" id="zU" checked> ' + T("ohne Wiederholung", "sans répétition") + '</label></div><button class="btn go" id="zGo" style="margin-top:8px">' + T("Ziehen", "Tirer") + '</button><div class="big" id="zR">–</div></div>' +
    '<div class="card sub1"><h3>👥 ' + T("Liste: Wer fängt an?", "Liste : qui commence ?") + '</h3><textarea class="in" id="lT" rows="5" placeholder="' + T("Ein Name pro Zeile", "Un nom par ligne") + '"></textarea><div class="row" style="margin-top:8px"><button class="btn go" id="lPick">' + T("Einen auswählen", "En choisir un") + '</button><button class="btn" id="lMix">' + T("Mischen", "Mélanger") + '</button><input class="in" id="lTn" inputmode="numeric" value="2" style="max-width:70px"><button class="btn" id="lTeam">' + T("Teams bilden", "Former des équipes") + '</button></div><div class="big" id="lR" style="font-size:20px">–</div></div></div>';
  const lst = () => $("#lT", host).value.split("\n").map(s => s.trim()).filter(Boolean);
  $("#wGo", host).onclick = () => { const n = +$("#wN", host).value, s = +$("#wS", host).value, r = Array.from({ length: n }, () => zufall(s) + 1); $("#wR", host).innerHTML = r.join(" · ") + (n > 1 ? '<small>' + T("Summe", "Somme") + ': ' + r.reduce((a, b) => a + b, 0) + '</small>' : ""); };
  $("#mGo", host).onclick = () => { $("#mR", host).textContent = zufall(2) ? T("Kopf", "Face") : T("Zahl", "Pile"); };
  $("#zGo", host).onclick = () => { let a = Math.round(num($("#zA", host).value)), b = Math.round(num($("#zB", host).value)), n = Math.max(1, Math.min(500, Math.round(num($("#zC", host).value, 1)))); if (!isFinite(a * b)) return; if (a > b) [a, b] = [b, a]; const span = b - a + 1, out = [];
    if ($("#zU", host).checked) { n = Math.min(n, span); const pool = new Set(); while (pool.size < n) pool.add(a + zufall(span)); out.push(...pool); } else for (let i = 0; i < n; i++) out.push(a + zufall(span)); $("#zR", host).textContent = out.join(", "); };
  const mix = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = zufall(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  $("#lPick", host).onclick = () => { const l = lst(); $("#lR", host).textContent = l.length ? l[zufall(l.length)] : T("Bitte erst Namen eintragen.", "Saisis d’abord des noms."); };
  $("#lMix", host).onclick = () => { const l = lst(); $("#lR", host).innerHTML = l.length ? mix(l).map((s, i) => (i + 1) + ". " + esc(s)).join("<br>") : T("Bitte erst Namen eintragen.", "Saisis d’abord des noms."); };
  $("#lTeam", host).onclick = () => { const l = mix(lst()), k = Math.max(1, Math.min(l.length || 1, Math.round(num($("#lTn", host).value, 2)))); if (!l.length) { $("#lR", host).textContent = T("Bitte erst Namen eintragen.", "Saisis d’abord des noms."); return; } const t = Array.from({ length: k }, () => []); l.forEach((s, i) => t[i % k].push(s)); $("#lR", host).innerHTML = t.map((m, i) => "<b>" + T("Team", "Équipe") + " " + (i + 1) + ":</b> " + m.map(esc).join(", ")).join("<br>"); };
}

/* ====================================================================== Zeit */
function zeitTool(host){
  const ZONEN = [["Europe/Berlin", "Berlin"], ["Europe/Paris", "Paris"], ["Europe/London", "London"], ["Europe/Lisbon", "Lissabon"], ["Europe/Athens", "Athen"], ["Europe/Istanbul", "Istanbul"], ["Europe/Moscow", "Moskau"], ["Africa/Cairo", "Kairo"], ["Africa/Johannesburg", "Johannesburg"], ["Asia/Dubai", "Dubai"], ["Asia/Kolkata", "Mumbai / Delhi"], ["Asia/Bangkok", "Bangkok"], ["Asia/Shanghai", "Peking / Shanghai"], ["Asia/Tokyo", "Tokio"], ["Australia/Sydney", "Sydney"], ["Pacific/Auckland", "Auckland"], ["America/Sao_Paulo", "São Paulo"], ["America/New_York", "New York"], ["America/Chicago", "Chicago"], ["America/Denver", "Denver"], ["America/Los_Angeles", "Los Angeles"], ["America/Mexico_City", "Mexiko-Stadt"]];
  host.innerHTML = '<div class="cols2"><div class="card sub1"><h3>⏱️ ' + T("Stoppuhr", "Chronomètre") + '</h3><div class="big" id="sD">00:00:00.00</div><div class="row"><button class="btn go" id="sGo">' + T("Start", "Démarrer") + '</button><button class="btn" id="sLap" disabled>' + T("Runde", "Tour") + '</button><button class="btn" id="sRs">' + T("Zurücksetzen", "Remettre à zéro") + '</button></div><ol id="sL" class="laps"></ol></div>' +
    '<div class="card sub1"><h3>⏳ Timer</h3><div class="big" id="tD">00:05:00</div><div class="row"><input class="in" id="tM" inputmode="numeric" value="5" style="max-width:70px"><span>min</span><input class="in" id="tS" inputmode="numeric" value="0" style="max-width:70px"><span>s</span></div><div class="row" style="margin:8px 0">' + [1, 3, 5, 10, 15, 30].map(m => '<button class="btn sm" data-m="' + m + '">' + m + ' min</button>').join("") + '</div><div class="row"><button class="btn go" id="tGo">' + T("Start", "Démarrer") + '</button><button class="btn" id="tRs">' + T("Zurücksetzen", "Remettre à zéro") + '</button></div><p class="status" id="tSt"></p></div></div>' +
    '<div class="card sub1" style="margin-top:12px"><h3>🌍 ' + T("Zeitzonen-Rechner", "Fuseaux horaires") + '</h3><div class="row"><select class="in" id="zQ" style="max-width:230px">' + ZONEN.map(z => '<option value="' + z[0] + '">' + z[1] + '</option>').join("") + '</select><input class="in" type="datetime-local" id="zT" style="max-width:240px"><button class="btn sm" id="zNow">' + T("Jetzt", "Maintenant") + '</button></div><div id="zL" class="zl"></div></div>';
  // Stoppuhr
  let t0 = 0, acc = 0, raf = 0, laeuft = false, laps = [];
  const hms = (ms, cs) => { const t = Math.floor(ms / 10), c = t % 100, s = Math.floor(t / 100) % 60, m = Math.floor(t / 6000) % 60, h = Math.floor(t / 360000); return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0") + (cs ? "." + String(c).padStart(2, "0") : ""); };
  const sTick = () => { $("#sD", host).textContent = hms(acc + (laeuft ? performance.now() - t0 : 0), true); if (laeuft) raf = requestAnimationFrame(sTick); };
  $("#sGo", host).onclick = () => { if (laeuft) { acc += performance.now() - t0; laeuft = false; $("#sGo", host).textContent = T("Weiter", "Reprendre"); $("#sLap", host).disabled = true; } else { t0 = performance.now(); laeuft = true; $("#sGo", host).textContent = "Stopp"; $("#sLap", host).disabled = false; sTick(); } };
  $("#sLap", host).onclick = () => { laps.push(hms(acc + performance.now() - t0, true)); $("#sL", host).innerHTML = laps.map(l => "<li>" + l + "</li>").join(""); };
  $("#sRs", host).onclick = () => { laeuft = false; acc = 0; laps = []; cancelAnimationFrame(raf); $("#sD", host).textContent = "00:00:00.00"; $("#sGo", host).textContent = T("Start", "Démarrer"); $("#sLap", host).disabled = true; $("#sL", host).innerHTML = ""; };
  // Timer
  let tEnd = 0, tInt = 0, tAn = false; const origTitle = document.title;
  const setzeT = () => { const s = Math.max(0, Math.round(num($("#tM", host).value, 0) * 60 + num($("#tS", host).value, 0))); if (!tAn) $("#tD", host).textContent = hms(s * 1000, false); return s; };
  function piep(){ try { const A = new (window.AudioContext || window.webkitAudioContext)(); for (let i = 0; i < 4; i++) { const o = A.createOscillator(), g = A.createGain(); o.frequency.value = 880; o.connect(g); g.connect(A.destination); g.gain.setValueAtTime(.25, A.currentTime + i * .4); g.gain.setValueAtTime(0, A.currentTime + i * .4 + .2); o.start(A.currentTime + i * .4); o.stop(A.currentTime + i * .4 + .25); } } catch(e){} try { navigator.vibrate && navigator.vibrate([300, 150, 300, 150, 300]); } catch(e){} }
  function tStop(){ clearInterval(tInt); tAn = false; $("#tGo", host).textContent = T("Start", "Démarrer"); document.title = origTitle; }
  $("#tGo", host).onclick = () => { if (tAn) { tStop(); setzeT(); return; } const s = setzeT(); if (!s) return; tEnd = Date.now() + s * 1000; tAn = true; $("#tGo", host).textContent = "Stopp"; $("#tSt", host).textContent = "";
    tInt = setInterval(() => { const rest = tEnd - Date.now(); if (rest <= 0) { $("#tD", host).textContent = "00:00:00"; tStop(); $("#tSt", host).textContent = T("⏰ Zeit ist um!", "⏰ Temps écoulé !"); $("#tSt", host).className = "status ok"; piep(); return; } $("#tD", host).textContent = hms(Math.ceil(rest / 1000) * 1000, false); document.title = $("#tD", host).textContent + " – Timer"; }, 200); };
  $("#tRs", host).onclick = () => { tStop(); $("#tSt", host).textContent = ""; setzeT(); };
  $$("[data-m]", host).forEach(b => b.onclick = () => { tStop(); $("#tM", host).value = b.dataset.m; $("#tS", host).value = 0; setzeT(); });
  $("#tM", host).addEventListener("input", () => { if (!tAn) setzeT(); }); $("#tS", host).addEventListener("input", () => { if (!tAn) setzeT(); }); setzeT();
  // Zeitzonen
  const off = (zone, ms) => { const p = new Intl.DateTimeFormat("en-US", { timeZone: zone, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" }).formatToParts(new Date(ms)).reduce((o, x) => (o[x.type] = +x.value, o), {}); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000; };
  function zRech(){
    const v = $("#zT", host).value, m = /^(\d+)-(\d+)-(\d+)T(\d+):(\d+)/.exec(v); if (!m) { $("#zL", host).innerHTML = ""; return; }
    const zone = $("#zQ", host).value, naiv = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]); let inst = naiv - off(zone, naiv); inst = naiv - off(zone, inst);
    $("#zL", host).innerHTML = '<table class="utab">' + ZONEN.map(z => { const f = new Intl.DateTimeFormat(FR() ? "fr-FR" : "de-DE", { timeZone: z[0], weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(inst)); return '<tr' + (z[0] === zone ? ' class="me"' : "") + '><td>' + z[1] + '</td><td>' + f + '</td></tr>'; }).join("") + '</table>';
  }
  const jetzt = () => { const d = new Date(), p = n => String(n).padStart(2, "0"), zone = $("#zQ", host).value, ms = d.getTime(), l = new Date(ms + off(zone, ms)); $("#zT", host).value = l.getUTCFullYear() + "-" + p(l.getUTCMonth() + 1) + "-" + p(l.getUTCDate()) + "T" + p(l.getUTCHours()) + ":" + p(l.getUTCMinutes()); zRech(); };
  $("#zNow", host).onclick = jetzt; $("#zT", host).addEventListener("input", zRech); $("#zQ", host).addEventListener("change", zRech);
  $("#zQ", host).value = (Intl.DateTimeFormat().resolvedOptions().timeZone && ZONEN.some(z => z[0] === Intl.DateTimeFormat().resolvedOptions().timeZone)) ? Intl.DateTimeFormat().resolvedOptions().timeZone : "Europe/Berlin"; jetzt();
}

/* ====================================================================== Farbe */
function farbTool(host){
  host.innerHTML = '<div class="cols2"><div><div class="row"><input type="color" id="cP" value="#27a3df" style="width:90px;height:70px;border:0;background:none;padding:0"><div style="flex:1;min-width:140px"><label class="l" style="margin-top:0">HEX</label><input class="in" id="cH" value="#27a3df"></div></div><div class="row" style="margin-top:8px"><button class="btn sm" id="cEye" hidden>🎯 ' + T("Farbe vom Bildschirm wählen", "Choisir une couleur à l’écran") + '</button></div><div id="cV" class="cv"></div></div><div><h3>' + T("Abstufungen", "Nuances") + '</h3><div id="cS" class="sw"></div><h3>' + T("Gegenfarbe", "Couleur complémentaire") + '</h3><div id="cK" class="sw"></div><h3>' + T("Kontrast (Lesbarkeit)", "Contraste (lisibilité)") + '</h3><div id="cT"></div></div></div>';
  const hex2 = h => { h = h.trim().replace(/^#/, ""); if (/^[0-9a-f]{3}$/i.test(h)) h = h.replace(/./g, "$&$&"); return /^[0-9a-f]{6}$/i.test(h) ? "#" + h.toLowerCase() : null; };
  const rgb = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
  const toHex = (r, g, b) => "#" + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  function hsl(r, g, b){ r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; let h = 0, s = 0; if (d) { s = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; } return [h, s * 100, l * 100]; }
  function fromHsl(h, s, l){ s /= 100; l /= 100; const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2; let r, g, b; [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]; return toHex((r + m) * 255, (g + m) * 255, (b + m) * 255); }
  const lum = h => { const c = rgb(h).map(v => v / 255).map(x => x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
  const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  function zeige(h){
    const [r, g, b] = rgb(h), [H, S, L] = hsl(r, g, b), k = 1 - Math.max(r, g, b) / 255, c = k < 1 ? (1 - r / 255 - k) / (1 - k) : 0, m = k < 1 ? (1 - g / 255 - k) / (1 - k) : 0, y = k < 1 ? (1 - b / 255 - k) / (1 - k) : 0;
    const rows = [["HEX", h.toUpperCase()], ["RGB", r + ", " + g + ", " + b], ["HSL", Math.round(H) + "°, " + Math.round(S) + " %, " + Math.round(L) + " %"], ["CMYK", [c, m, y, k].map(v => Math.round(v * 100)).join(" / ") + " %"]];
    $("#cV", host).innerHTML = rows.map(x => '<div class="cvr"><b>' + x[0] + '</b><code>' + esc(x[1]) + '</code><button class="btn sm" data-c="' + esc(x[1]) + '">' + T("Kopieren", "Copier") + '</button></div>').join("");
    $$("#cV [data-c]", host).forEach(b => b.onclick = () => kopiere(b.dataset.c, b));
    const sw = a => a.map(c => '<button class="swc" style="background:' + c + '" data-h="' + c + '" title="' + c + '"><span>' + c + '</span></button>').join("");
    $("#cS", host).innerHTML = sw([90, 75, 60, 45, 30, 15].map(l => fromHsl(H, S, l))); $("#cK", host).innerHTML = sw([fromHsl((H + 180) % 360, S, L)]);
    $("#cT", host).innerHTML = [["#ffffff", T("Weiß", "Blanc")], ["#000000", T("Schwarz", "Noir")]].map(t => { const q = cr(h, t[0]); return '<div class="ctr" style="background:' + h + ';color:' + t[0] + '">' + t[1] + ' · ' + q.toFixed(1) + ' : 1 — ' + (q >= 7 ? T("sehr gut", "très bon") : q >= 4.5 ? T("gut", "bon") : q >= 3 ? T("nur für große Schrift", "seulement gros texte") : T("schlecht", "mauvais")) + '</div>'; }).join("");
    $$("#cS .swc,#cK .swc", host).forEach(b => b.onclick = () => setze(b.dataset.h));
  }
  function setze(h){ $("#cP", host).value = h; $("#cH", host).value = h; zeige(h); }
  $("#cP", host).addEventListener("input", e => setze(e.target.value)); $("#cH", host).addEventListener("input", e => { const h = hex2(e.target.value); if (h) { $("#cP", host).value = h; zeige(h); } });
  if (window.EyeDropper) { const b = $("#cEye", host); b.hidden = false; b.onclick = async () => { try { const r = await new EyeDropper().open(); setze(r.sRGBHex); } catch(e){} }; }
  zeige("#27a3df");
}

/* ====================================================================== Rahmen */
const TOOLS = [
  ["qr", "📱", "#2e86ff", T("QR-Code", "Code QR"), T("Link, WLAN, Kontakt oder Text als QR-Code – zum Speichern und Drucken.", "Lien, Wi-Fi, contact ou texte en code QR – à enregistrer et imprimer."), qrTool],
  ["pass", "🔑", "#8a4dff", T("Passwort-Generator", "Générateur de mots de passe"), T("Starke Passwörter und PINs erzeugen – zufällig und nur auf deinem Gerät.", "Créer des mots de passe et PIN solides – au hasard et seulement sur ton appareil."), passTool],
  ["umrechner", "📐", "#27a3df", T("Einheiten-Umrechner", "Convertisseur d’unités"), T("Länge, Gewicht, Temperatur, Kochmaße, Daten und mehr umrechnen.", "Longueur, poids, température, mesures de cuisine, données, etc."), umrTool],
  ["rechner", "🧮", "#12b8a6", T("Rechner", "Calculatrices"), T("Prozent, Mehrwertsteuer, Rabatt, Trinkgeld, Datum, Alter, Kredit und Sparen.", "Pourcentage, TVA, remise, pourboire, date, âge, crédit et épargne."), rechTool],
  ["text", "📝", "#e0527a", T("Text-Werkzeuge", "Outils de texte"), T("Wörter zählen, Groß-/Kleinschreibung ändern, Zeilen sortieren und aufräumen.", "Compter les mots, changer la casse, trier et nettoyer les lignes."), textTool],
  ["bild", "✂️", "#ff8c1a", T("Bild zuschneiden", "Recadrer une image"), T("Foto zuschneiden (auch Passfoto), drehen, spiegeln, Bereiche unkenntlich machen.", "Recadrer une photo (aussi photo d’identité), pivoter, retourner, flouter des zones."), bildTool],
  ["zufall", "🎲", "#c4452c", T("Zufall & Würfel", "Hasard et dés"), T("Würfeln, Münze werfen, Zahlen ziehen, Namen auslosen, Teams bilden.", "Lancer des dés, pile ou face, tirer des nombres, tirer au sort, former des équipes."), zufTool],
  ["zeit", "⏱️", "#6a4fd8", T("Stoppuhr, Timer & Zeitzonen", "Chrono, minuteur et fuseaux"), T("Stoppuhr, Countdown mit Ton und Uhrzeit in anderen Ländern.", "Chronomètre, minuteur sonore et heure dans d’autres pays."), zeitTool],
  ["farbe", "🎨", "#ee4f7e", T("Farbwähler", "Sélecteur de couleurs"), T("Farbe wählen und als HEX, RGB, HSL oder CMYK kopieren – mit Kontrast-Check.", "Choisir une couleur et la copier en HEX, RGB, HSL ou CMYK – avec contraste."), farbTool]
];
window.Alltag = { start: function(){
  const grid = $("#toolgrid"), hostEl = $("#toolhost");
  grid.innerHTML = TOOLS.map(t => '<a class="tcard" href="#' + t[0] + '" data-id="' + t[0] + '"><span class="ts" style="background:' + t[2] + '">' + t[1] + '</span><span><b>' + esc(t[3]) + '</b><small>' + esc(t[4]) + '</small></span></a>').join("");
  function zeigen(){
    const id = (location.hash || "").slice(1), t = TOOLS.find(x => x[0] === id) || TOOLS[0];
    $$(".tcard", grid).forEach(a => a.classList.toggle("on", a.dataset.id === t[0]));
    hostEl.innerHTML = '<section class="card toolcard" id="' + t[0] + '"><h2><span class="ts" style="background:' + t[2] + '">' + t[1] + '</span> ' + esc(t[3]) + '</h2><div class="tbody"></div></section>';
    try { t[5]($(".tbody", hostEl)); } catch(e){ $(".tbody", hostEl).textContent = e.message; }
    if (id && window.scrollY < 4) { /* bleibt */ }
    document.title = t[3] + " – " + T("Alltags-Helfer", "Assistants du quotidien") + " – Oratio";
  }
  window.addEventListener("hashchange", () => { zeigen(); const el = $(".toolcard"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); });
  zeigen();
} };
})();
