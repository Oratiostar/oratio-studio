// Datei-Werkstatt: PDF, Bilder, Word, ZIP – alles im Browser. Keine Uploads.
(function(){
"use strict";
const LIB = new URL("lib/", document.currentScript.src).href;
const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const G = WZ.groesse;

// ------------------------------------------------------------------ pdf.js (nur laden, wenn gebraucht)
let pdfjsP = null;
function pdfjs(){ return pdfjsP || (pdfjsP = import(LIB + "pdf.min.mjs").then(m => { m.GlobalWorkerOptions.workerSrc = LIB + "pdf.worker.min.mjs"; return m; })); }
async function oeffnePdf(ab){
  const m = await pdfjs();
  const opts = { data: new Uint8Array(ab.slice(0)), standardFontDataUrl: LIB + "standard_fonts/", wasmUrl: LIB + "wasm/", iccUrl: LIB + "iccs/", isEvalSupported: false };
  for (let versuch = 0; versuch < 3; versuch++) {
    try { return await m.getDocument(opts).promise; }
    catch (e) {
      if (e && e.name === "PasswordException") { const pw = prompt(versuch ? "Falsches Passwort. Nochmal versuchen:" : "Diese PDF ist mit einem Passwort geschützt. Passwort eingeben:"); if (pw == null) throw new Error("Abgebrochen – PDF ist passwortgeschützt."); opts.password = pw; opts.data = new Uint8Array(ab.slice(0)); }
      else throw e;
    }
  }
  throw new Error("Passwort falsch.");
}
async function seiteRendern(page, scale, bgWeiss){
  const vp = page.getViewport({ scale }); const c = document.createElement("canvas"); c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
  const x = c.getContext("2d"); if (bgWeiss !== false) { x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); }
  await page.render({ canvasContext: x, viewport: vp }).promise; return c;
}
const toBlob = (c, type, q) => new Promise(r => c.toBlob(r, type, q));
const readAB = f => f.arrayBuffer();
function frageEndung(name){ return (name.split(".").pop() || "").toLowerCase(); }
function parseBereich(txt, n){
  const out = []; const t = (txt || "").trim(); if (!t) return null;
  for (const teil of t.split(/[,;\s]+/)) { if (!teil) continue; const m = teil.match(/^(\d*)\s*-\s*(\d*)$/);
    if (m) { const a = m[1] ? +m[1] : 1, b = m[2] ? +m[2] : n; if (a < 1 || b > n + 0 && b > n) { if (a > n) throw new Error("Seite " + a + " gibt es nicht (nur " + n + " Seiten)."); } const lo = Math.min(a, b), hi = Math.min(Math.max(a, b), n); for (let i = lo; i <= hi; i++) out.push(i - 1); }
    else if (/^\d+$/.test(teil)) { const v = +teil; if (v < 1 || v > n) throw new Error("Seite " + v + " gibt es nicht (nur " + n + " Seiten)."); out.push(v - 1); }
    else throw new Error("„" + teil + "“ verstehe ich nicht. Beispiel: 1-3, 5, 8-"); }
  return out;
}

// ------------------------------------------------------------------ Bausteine
function dropHTML(titel, hinweis){ return '<div class="drop"><b>' + esc(titel) + '</b>' + esc(hinweis || "oder tippen, um Dateien auszuwählen") + '</div>'; }
// Dateiliste mit Ablegen, Sortieren, Entfernen
function Liste(box, o){
  const st = { items: [], onChange: o.onChange || (() => {}) };
  box.innerHTML = dropHTML(o.titel || "Dateien hier ablegen", o.hinweis) + '<input type="file" hidden ' + (o.multiple === false ? "" : "multiple") + ' accept="' + esc(o.accept || "*") + '"><div class="flist"></div>';
  const drop = $(".drop", box), inp = $("input", box), list = $(".flist", box);
  const accept = (o.accept || "").split(",").map(s => s.trim().toLowerCase()).filter(a => a && a !== "*");
  const ok = f => !accept.length || accept.some(a => a.startsWith(".") ? f.name.toLowerCase().endsWith(a) : a.endsWith("/*") ? f.type.startsWith(a.slice(0, -1)) : f.type === a);
  function add(files){
    const fl = [...files]; const gut = fl.filter(ok); const schlecht = fl.length - gut.length;
    if (o.multiple === false) st.items = [];
    for (const f of (o.multiple === false ? gut.slice(0, 1) : gut)) st.items.push({ file: f, id: Math.random().toString(36).slice(2) });
    if (schlecht && o.meldung) o.meldung(schlecht + " Datei(en) passen hier nicht (erlaubt: " + (o.accept || "alle") + ").", "bad");
    zeige(); st.onChange(st.items);
  }
  function zeige(){
    list.innerHTML = st.items.map((it, i) => '<div class="frow" data-i="' + i + '"><span class="fn" title="' + esc(it.file.name) + '">' + esc(it.file.name) + '</span><span class="muted">' + G(it.file.size) + '</span>' +
      (o.sortieren !== false && st.items.length > 1 ? '<button class="btn sm" data-a="up" title="nach oben">↑</button><button class="btn sm" data-a="dn" title="nach unten">↓</button>' : '') + '<button class="btn sm" data-a="rm" title="entfernen">✕</button></div>').join("");
  }
  list.onclick = e => { const b = e.target.closest("button"); if (!b) return; const i = +b.closest(".frow").dataset.i, a = b.dataset.a;
    if (a === "rm") st.items.splice(i, 1); else if (a === "up" && i > 0) [st.items[i - 1], st.items[i]] = [st.items[i], st.items[i - 1]]; else if (a === "dn" && i < st.items.length - 1) [st.items[i + 1], st.items[i]] = [st.items[i], st.items[i + 1]];
    zeige(); st.onChange(st.items); };
  drop.onclick = () => inp.click();
  const nimm = files => o.nehmen ? o.nehmen([...files]) : add(files);
  inp.onchange = () => { nimm(inp.files); inp.value = ""; };
  ["dragenter", "dragover"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach(t => drop.addEventListener(t, () => drop.classList.remove("over")));
  drop.addEventListener("drop", e => { e.preventDefault(); nimm(e.dataTransfer.files); });
  st.add = add; st.clear = () => { st.items = []; zeige(); st.onChange(st.items); };
  return st;
}
// Status + Fortschritt + Ergebnisliste
function Ausgabe(box){
  box.innerHTML = '<div class="status"></div><div class="prog" hidden><i></i></div><div class="ergebnisse"></div>';
  const s = $(".status", box), p = $(".prog", box), r = $(".ergebnisse", box);
  const a = { blobs: [],
    say(t, k){ s.textContent = t; s.className = "status " + (k || ""); },
    prog(f){ p.hidden = f == null; if (f != null) $("i", p).style.width = Math.round(f * 100) + "%"; },
    leer(){ r.innerHTML = ""; a.blobs = []; s.textContent = ""; s.className = "status"; a.prog(null); },
    add(name, blob, info){
      a.blobs.push({ name, blob }); const row = document.createElement("div"); row.className = "frow res";
      row.innerHTML = '<span class="fn" title="' + esc(name) + '">' + esc(name) + '</span><span class="muted">' + esc(info || G(blob.size)) + '</span><button class="btn sm go">Speichern</button>';
      $("button", row).onclick = () => WZ.speichern(blob, name); r.appendChild(row);
    },
    async zipKnopf(zipname){
      if (a.blobs.length < 2) return; const b = document.createElement("button"); b.className = "btn"; b.style.marginTop = "8px"; b.textContent = "Alle als ZIP speichern";
      b.onclick = async () => { const z = new JSZip(); for (const x of a.blobs) z.file(x.name, x.blob); WZ.speichern(await z.generateAsync({ type: "blob" }), zipname || "ergebnis.zip"); }; r.appendChild(b);
    } };
  return a;
}
function fehler(a, e){ console.error(e); a.say((e && e.message) || String(e), "bad"); a.prog(null); }
function wrapRun(btn, fn){ btn.onclick = async () => { btn.disabled = true; try { await fn(); } finally { btn.disabled = false; } }; }

// ------------------------------------------------------------------ Werkzeuge
const TOOLS = [];
function tool(t){ TOOLS.push(t); }

// ---- 1/2: PDF zusammenfügen, teilen, sortieren (ein gemeinsamer Seiten-Tisch)
function bauOrganizer(sec, modus){
  sec.innerHTML = '<div class="liste"></div><div class="org-bar" hidden></div><div class="thumbs"></div><div class="ausgabe"></div>';
  const srcs = []; let pages = []; let renderToken = 0;
  const out = Ausgabe($(".ausgabe", sec)); const bar = $(".org-bar", sec), th = $(".thumbs", sec);
  async function nehmen(files){
    const fl = files.filter(f => /\.pdf$/i.test(f.name) || f.type === "application/pdf"); if (!fl.length) return out.say("Das sind keine PDF-Dateien.", "bad");
    out.say("Lese …");
    try { for (const f of fl) { const ab = await readAB(f); let doc; try { doc = await oeffnePdf(ab); } catch (e) { throw new Error("„" + f.name + "“ konnte nicht gelesen werden: " + e.message); }
        const si = srcs.length; srcs.push({ ab, name: f.name, doc }); for (let i = 0; i < doc.numPages; i++) pages.push({ s: si, i, rot: 0, del: false, c: null }); }
      out.say(""); zeige(); } catch (e) { fehler(out, e); }
  }
  Liste($(".liste", sec), { accept: ".pdf,application/pdf", titel: modus === "merge" ? "PDFs hier ablegen (mehrere möglich)" : "PDF hier ablegen", hinweis: "oder tippen, um zu wählen", sortieren: false, nehmen });

  function zeige(){
    bar.hidden = !pages.length;
    const aktiv = pages.filter(p => !p.del).length;
    bar.innerHTML = '<div class="row"><b>' + srcs.length + ' Datei(en) · ' + aktiv + ' von ' + pages.length + ' Seiten</b><span class="sp"></span>' +
      '<button class="btn sm" data-a="rev">Reihenfolge umkehren</button><button class="btn sm" data-a="rot">Alle drehen ↻</button><button class="btn sm" data-a="clear">Alles entfernen</button></div>' +
      '<div class="row" style="margin-top:8px"><input class="in" id="bereich" placeholder="Nur diese Seiten behalten, z. B. 1-3, 5, 8-" style="flex:1 1 220px;width:auto"><button class="btn sm" data-a="range">Anwenden</button></div>' +
      '<div class="row" style="margin-top:10px"><button class="btn go" data-a="save"' + (aktiv ? "" : " disabled") + '>' + (modus === "merge" ? "Zusammenfügen und speichern" : "Als PDF speichern") + '</button>' +
      '<button class="btn" data-a="single"' + (aktiv ? "" : " disabled") + '>Jede Seite einzeln (ZIP)</button></div>' +
      '<p class="hint">Seiten per Ziehen umsortieren, ↻ dreht, ✕ entfernt. Du kannst jederzeit weitere PDFs oben ablegen – ihre Seiten werden hinten angefügt.</p>';
    th.innerHTML = pages.map((p, k) => '<div class="th' + (p.del ? " del" : "") + '" draggable="true" data-k="' + k + '"><div class="cv"></div><div class="tn">' + (k + 1) + (srcs.length > 1 ? ' <small>' + esc(srcs[p.s].name.slice(0, 14)) + '</small>' : "") + '</div>' +
      '<div class="tb"><button data-a="r" title="drehen">↻</button><button data-a="x" title="entfernen/zurückholen">' + (p.del ? "↺" : "✕") + '</button></div></div>').join("");
    renderThumbs();
  }
  async function renderThumbs(){
    const tok = ++renderToken;
    for (let k = 0; k < pages.length; k++) {
      if (tok !== renderToken) return; const p = pages[k]; const cell = th.children[k]; if (!cell) continue; const box = $(".cv", cell);
      if (!p.c) { try { const pg = await srcs[p.s].doc.getPage(p.i + 1); const vp = pg.getViewport({ scale: 1 }); p.c = await seiteRendern(pg, 150 / Math.max(vp.width, vp.height) * 1.4); p.nat = ((pg.rotate || 0) % 360); } catch (e) { p.c = document.createElement("canvas"); } }
      const cv = document.createElement("canvas"); cv.width = p.c.width; cv.height = p.c.height; cv.getContext("2d").drawImage(p.c, 0, 0);
      if (p.rot % 180) { const r = p.c.width / p.c.height; cv.style.cssText = "width:" + (100 / r).toFixed(1) + "%;max-width:none;transform:rotate(" + p.rot + "deg)"; } else if (p.rot) cv.style.transform = "rotate(180deg)";
      box.innerHTML = ""; box.appendChild(cv); await WZ.warte();
    }
  }
  bar.onclick = async e => { const b = e.target.closest("button"); if (!b) return; const a = b.dataset.a;
    if (a === "rev") { pages.reverse(); zeige(); }
    else if (a === "rot") { pages.forEach(p => p.rot = (p.rot + 90) % 360); zeige(); }
    else if (a === "clear") { pages = []; srcs.length = 0; renderToken++; zeige(); out.leer(); }
    else if (a === "range") { try { const n = pages.length; const r = parseBereich($("#bereich", bar).value, n); if (r) { const keep = new Set(r); const nw = []; for (const k of r) nw.push(pages[k]); pages.forEach((p, k) => { if (!keep.has(k)) { /* weg */ } }); pages = nw.filter((p, i, ar) => ar.indexOf(p) === i); out.say("Es bleiben " + pages.length + " Seiten.", "ok"); zeige(); } } catch (x) { out.say(x.message, "bad"); } }
    else if (a === "save") exportiere(false); else if (a === "single") exportiere(true);
  };
  th.onclick = e => { const b = e.target.closest("button"); if (!b) return; const k = +b.closest(".th").dataset.k; if (b.dataset.a === "r") pages[k].rot = (pages[k].rot + 90) % 360; else pages[k].del = !pages[k].del; zeige(); };
  let dragK = null;
  th.addEventListener("dragstart", e => { const c = e.target.closest(".th"); if (c) { dragK = +c.dataset.k; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", "seite"); } });
  th.addEventListener("dragover", e => { if (dragK != null) e.preventDefault(); });
  th.addEventListener("drop", e => { if (dragK == null) return; e.preventDefault(); e.stopPropagation(); const c = e.target.closest(".th"); if (!c) return; const to = +c.dataset.k; const [m] = pages.splice(dragK, 1); pages.splice(to, 0, m); dragK = null; zeige(); });
  async function exportiere(einzeln){
    const akt = pages.filter(p => !p.del); if (!akt.length) return;
    out.leer(); out.say("Erzeuge PDF …");
    try {
      const { PDFDocument, degrees } = PDFLib; const libs = {}; const getLib = async s => libs[s] || (libs[s] = await PDFDocument.load(srcs[s].ab, { ignoreEncryption: true }));
      async function baue(liste){ const d = await PDFDocument.create(); for (const p of liste) { const src = await getLib(p.s); const [pg] = await d.copyPages(src, [p.i]); if (p.rot) pg.setRotation(degrees((pg.getRotation().angle + p.rot) % 360)); d.addPage(pg); } d.setProducer("Oratio Studio – Datei-Werkstatt"); return d.save({ useObjectStreams: true }); }
      if (!einzeln) { const bytes = await baue(akt); const name = srcs.length === 1 ? WZ.sauber(srcs[0].name) + (akt.length === pages.length ? "_bearbeitet" : "_auswahl") + ".pdf" : "zusammengefuegt.pdf"; out.add(name, new Blob([bytes], { type: "application/pdf" }), akt.length + " Seiten · " + G(bytes.length)); out.say("Fertig.", "ok"); }
      else { const z = new JSZip(); const w = String(akt.length).length; for (let k = 0; k < akt.length; k++) { z.file(WZ.sauber(srcs[akt[k].s].name) + "_Seite_" + String(k + 1).padStart(w, "0") + ".pdf", await baue([akt[k]])); out.prog((k + 1) / akt.length); await WZ.warte(); }
        const blob = await z.generateAsync({ type: "blob" }); out.add("einzelseiten.zip", blob, akt.length + " Dateien · " + G(blob.size)); out.say("Fertig.", "ok"); out.prog(null); }
    } catch (e) { fehler(out, e); }
  }
}
tool({ id: "merge", titel: "PDF zusammenfügen", sym: "➕", farbe: "#2f66d0", text: "Mehrere PDFs zu einer Datei verbinden, Seiten sortieren, drehen oder löschen.", build: s => bauOrganizer(s, "merge") });
tool({ id: "split", titel: "PDF teilen & sortieren", sym: "✂️", farbe: "#8a5ad8", text: "Seiten auswählen, löschen, drehen, umsortieren – oder jede Seite einzeln speichern.", build: s => bauOrganizer(s, "split") });

// ---- 3: PDF komprimieren
tool({ id: "compress", titel: "PDF komprimieren", sym: "🗜️", farbe: "#e0703a", text: "Große PDFs kleiner machen – in drei Stufen, mit Vorher/Nachher-Größe.", build(sec){
  sec.innerHTML = '<div class="liste"></div><div class="cols2"><div><label class="l">Stufe</label><select class="in" id="stufe"><option value="leicht">Leicht – Text bleibt, spart wenig</option><option value="mittel" selected>Mittel – gut lesbar (150 dpi)</option><option value="stark">Stark – kleinste Datei (100 dpi)</option><option value="eigen">Eigene Einstellung …</option></select></div>' +
    '<div id="eigenBox" hidden><div class="rg"><span>Auflösung</span><input type="range" id="dpi" min="50" max="300" value="130"><output id="dpiO"></output></div><div class="rg"><span>Qualität</span><input type="range" id="qu" min="20" max="95" value="70"><output id="quO"></output></div></div></div>' +
    '<label class="chk"><input type="checkbox" id="grau"> Graustufen (macht noch kleiner)</label>' +
    '<div class="warn" id="stufeHinweis"></div><button class="btn go" id="go" disabled>Komprimieren</button><div class="ausgabe"></div>';
  const out = Ausgabe($(".ausgabe", sec)); const li = Liste($(".liste", sec), { accept: ".pdf,application/pdf", titel: "PDFs hier ablegen", meldung: out.say, sortieren: false, onChange: it => $("#go", sec).disabled = !it.length });
  const hinw = { leicht: "Leicht: Die PDF wird nur neu gepackt. Text, Links und Formulare bleiben unverändert. Bei PDFs, die schon gut gepackt sind, ändert sich kaum etwas.", mittel: "Mittel/Stark: Jede Seite wird als Bild neu gespeichert. Das spart oft 70–95 % – aber der Text ist danach nicht mehr markierbar und Links/Formulare gehen verloren.", stark: "Mittel/Stark: Jede Seite wird als Bild neu gespeichert. Das spart oft 70–95 % – aber der Text ist danach nicht mehr markierbar und Links/Formulare gehen verloren.", eigen: "Eigene Einstellung: Seiten werden als Bilder gespeichert (Text nicht mehr markierbar)." };
  const upd = () => { const v = $("#stufe", sec).value; $("#stufeHinweis", sec).textContent = hinw[v]; $("#eigenBox", sec).hidden = v !== "eigen"; $("#dpiO", sec).textContent = $("#dpi", sec).value + " dpi"; $("#quO", sec).textContent = $("#qu", sec).value + " %"; $("#grau", sec).parentElement.hidden = v === "leicht"; };
  sec.addEventListener("input", upd); upd();
  wrapRun($("#go", sec), async () => {
    out.leer(); const v = $("#stufe", sec).value; const cfg = v === "leicht" ? null : v === "mittel" ? { dpi: 150, q: .72 } : v === "stark" ? { dpi: 100, q: .55 } : { dpi: +$("#dpi", sec).value, q: +$("#qu", sec).value / 100 }; const grau = $("#grau", sec).checked;
    let n = 0; const tot = li.items.length;
    for (const it of li.items) {
      try {
        out.say("(" + (n + 1) + "/" + tot + ") " + it.file.name + " …"); const ab = await readAB(it.file); let bytes;
        if (!cfg) { const d = await PDFLib.PDFDocument.load(ab, { ignoreEncryption: true, updateMetadata: false }); bytes = await d.save({ useObjectStreams: true }); }
        else { const doc = await oeffnePdf(ab); const d = await PDFLib.PDFDocument.create();
          for (let i = 1; i <= doc.numPages; i++) { const pg = await doc.getPage(i); const vp1 = pg.getViewport({ scale: 1 }); const c = await seiteRendern(pg, cfg.dpi / 72);
            if (grau) { const x = c.getContext("2d"), im = x.getImageData(0, 0, c.width, c.height), p = im.data; for (let k = 0; k < p.length; k += 4) { const g = (p[k] * 299 + p[k + 1] * 587 + p[k + 2] * 114) / 1000; p[k] = p[k + 1] = p[k + 2] = g; } x.putImageData(im, 0, 0); }
            const jb = new Uint8Array(await (await toBlob(c, "image/jpeg", cfg.q)).arrayBuffer()); const img = await d.embedJpg(jb); const page = d.addPage([vp1.width, vp1.height]); page.drawImage(img, { x: 0, y: 0, width: vp1.width, height: vp1.height });
            out.prog(((n + (i / doc.numPages)) / tot)); await WZ.warte(); }
          bytes = await d.save({ useObjectStreams: true }); }
        const vorher = it.file.size, nachher = bytes.length;
        if (nachher >= vorher) out.add(it.file.name, it.file, "schon optimal – Original behalten (" + G(vorher) + ")");
        else out.add(WZ.sauber(it.file.name) + "_klein.pdf", new Blob([bytes], { type: "application/pdf" }), G(vorher) + " → " + G(nachher) + " (−" + Math.round((1 - nachher / vorher) * 100) + " %)");
      } catch (e) { out.add(it.file.name + " (Fehler)", new Blob([]), e.message); }
      n++; out.prog(n / tot);
    }
    out.say("Fertig.", "ok"); out.prog(null); out.zipKnopf("komprimiert.zip");
  });
}});

// ---- 4: PDF -> Bilder
tool({ id: "pdf2img", titel: "PDF → Bilder", sym: "🖼️", farbe: "#2fa9c9", text: "Jede Seite als PNG oder JPG speichern – in wählbarer Auflösung.", build(sec){
  sec.innerHTML = '<div class="liste"></div><div class="cols2"><div><label class="l">Format</label><select class="in" id="fm"><option value="png">PNG (scharf, größer)</option><option value="jpg">JPG (kleiner)</option></select></div><div><label class="l">Auflösung</label><select class="in" id="dpi"><option value="72">72 dpi (Bildschirm, klein)</option><option value="150" selected>150 dpi (gut lesbar)</option><option value="200">200 dpi</option><option value="300">300 dpi (Druck)</option></select></div></div>' +
    '<label class="l">Nur diese Seiten (leer = alle)</label><input class="in" id="rg" placeholder="z. B. 1-3, 5"><button class="btn go" id="go" style="margin-top:12px" disabled>Umwandeln</button><div class="ausgabe"></div>';
  const out = Ausgabe($(".ausgabe", sec)); const li = Liste($(".liste", sec), { accept: ".pdf,application/pdf", multiple: false, titel: "PDF hier ablegen", meldung: out.say, onChange: it => $("#go", sec).disabled = !it.length });
  wrapRun($("#go", sec), async () => { out.leer(); try {
    const f = li.items[0].file; const doc = await oeffnePdf(await readAB(f)); const sel = parseBereich($("#rg", sec).value, doc.numPages) || [...Array(doc.numPages).keys()]; const fm = $("#fm", sec).value, dpi = +$("#dpi", sec).value; const w = String(doc.numPages).length;
    for (let k = 0; k < sel.length; k++) { out.say("Seite " + (sel[k] + 1) + " …"); const pg = await doc.getPage(sel[k] + 1); const c = await seiteRendern(pg, dpi / 72, fm === "jpg" || true);
      const b = await toBlob(c, fm === "jpg" ? "image/jpeg" : "image/png", .92); out.add(WZ.sauber(f.name) + "_Seite_" + String(sel[k] + 1).padStart(w, "0") + "." + fm, b, c.width + "×" + c.height + " · " + G(b.size)); out.prog((k + 1) / sel.length); await WZ.warte(); }
    out.say(sel.length + " Seite(n) umgewandelt.", "ok"); out.prog(null); out.zipKnopf(WZ.sauber(f.name) + "_Bilder.zip"); } catch (e) { fehler(out, e); } });
}});

// ---- 5: Bilder -> PDF
tool({ id: "img2pdf", titel: "Bilder → PDF", sym: "📄", farbe: "#e8a02e", text: "Fotos oder Scans in eine PDF-Datei packen – in deiner Reihenfolge.", build(sec){
  sec.innerHTML = '<div class="liste"></div><div class="cols2"><div><label class="l">Seitengröße</label><select class="in" id="sg"><option value="a4">A4 hochkant</option><option value="a4q">A4 quer</option><option value="auto">So groß wie das Bild</option><option value="a4a">A4, passend zur Bildform</option></select></div><div><label class="l">Rand (mm)</label><input class="in" type="number" id="rd" min="0" max="50" value="10"></div></div>' +
    '<label class="chk"><input type="checkbox" id="kl" checked> Große Fotos verkleinern (spart Platz, 2000 px reichen für Druck)</label><button class="btn go" id="go" style="margin-top:12px" disabled>PDF erstellen</button><div class="ausgabe"></div>';
  const out = Ausgabe($(".ausgabe", sec)); const li = Liste($(".liste", sec), { accept: "image/*", titel: "Bilder hier ablegen (mehrere möglich)", meldung: out.say, onChange: it => $("#go", sec).disabled = !it.length });
  wrapRun($("#go", sec), async () => { out.leer(); try {
    const d = await PDFLib.PDFDocument.create(); const mm = 72 / 25.4; const sg = $("#sg", sec).value, rd = Math.max(0, +$("#rd", sec).value || 0) * mm, kl = $("#kl", sec).checked; let n = 0;
    for (const it of li.items) { out.say("Bild " + (n + 1) + "/" + li.items.length + " …"); let bmp; try { bmp = await createImageBitmap(it.file, { imageOrientation: "from-image" }); } catch (e) { throw new Error("„" + it.file.name + "“ ist kein lesbares Bild."); }
      const c = document.createElement("canvas"); let w = bmp.width, h = bmp.height; if (kl && Math.max(w, h) > 2400) { const f = 2400 / Math.max(w, h); w = Math.round(w * f); h = Math.round(h * f); } c.width = w; c.height = h; const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); x.imageSmoothingQuality = "high"; x.drawImage(bmp, 0, 0, w, h);
      const jp = it.file.type === "image/jpeg" && !kl; const bytes = jp ? new Uint8Array(await it.file.arrayBuffer()) : new Uint8Array(await (await toBlob(c, "image/jpeg", .9)).arrayBuffer()); const img = await d.embedJpg(bytes);
      let pw, ph; if (sg === "auto") { pw = bmp.width * .75 + rd * 2; ph = bmp.height * .75 + rd * 2; } else if (sg === "a4q" || (sg === "a4a" && bmp.width > bmp.height)) { pw = 841.89; ph = 595.28; } else { pw = 595.28; ph = 841.89; }
      const page = d.addPage([pw, ph]); const aw = pw - 2 * rd, ah = ph - 2 * rd, sc = Math.min(aw / bmp.width, ah / bmp.height, sg === "auto" ? .75 : 1e9); const dw = bmp.width * sc, dh = bmp.height * sc; page.drawImage(img, { x: (pw - dw) / 2, y: (ph - dh) / 2, width: dw, height: dh }); n++; out.prog(n / li.items.length); await WZ.warte(); }
    d.setProducer("Oratio Studio – Datei-Werkstatt"); const bytes = await d.save({ useObjectStreams: true }); out.add("Bilder.pdf", new Blob([bytes], { type: "application/pdf" }), n + " Seiten · " + G(bytes.length)); out.say("Fertig.", "ok"); out.prog(null); } catch (e) { fehler(out, e); } });
}});

// ---- 6: PDF -> Word
async function pdfZuAbsaetzen(doc, onProg){
  const out = []; let textGefunden = 0;
  for (let pn = 1; pn <= doc.numPages; pn++) {
    const pg = await doc.getPage(pn); const tc = await pg.getTextContent(); const items = tc.items.filter(i => i.str !== undefined);
    const zeilen = []; // gruppiert nach y
    for (const it of items) { if (!it.str.trim() && !it.hasEOL) continue; const y = it.transform[5], h = Math.abs(it.transform[3]) || it.height || 10; let z = zeilen.find(z => Math.abs(z.y - y) < Math.max(2.5, h * .45)); if (!z) { z = { y, h, teile: [] }; zeilen.push(z); } z.teile.push({ x: it.transform[4], t: it.str, w: it.width, h, f: tc.styles[it.fontName] && tc.styles[it.fontName].fontFamily || "" }); z.h = Math.max(z.h, h); }
    zeilen.sort((a, b) => b.y - a.y);
    const hs = zeilen.map(z => Math.round(z.h)).filter(Boolean); const cnt = {}; hs.forEach(h => cnt[h] = (cnt[h] || 0) + 1); const body = +Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0] || 11;
    let cur = null, prev = null;
    for (const z of zeilen) {
      z.teile.sort((a, b) => a.x - b.x); let text = ""; let last = null;
      for (const t of z.teile) { if (last) { const gap = t.x - (last.x + last.w); if (gap > Math.max(1.5, last.h * .2) && !/\s$/.test(text)) text += " "; if (gap > last.h * 3.2) text += "    "; } text += t.t; last = t; }
      text = text.replace(/\s+$/, "").replace(/[\uF000-\uF8FF\u25AA\u25CF\u2022\u00B7\u25A0]/g, "•"); if (!text.trim()) continue; textGefunden += text.length;
      const gapY = prev ? prev.y - z.y : 0; const hr = z.h / body; const kopf = hr >= 1.6 ? 1 : hr >= 1.3 ? 2 : hr >= 1.12 && text.length < 90 ? 3 : 0;
      const neuAbs = !cur || gapY > z.h * 1.75 || kopf || cur.head || /^([•\-–·▪●]|\d+[.)])\s/.test(text);
      if (neuAbs) { cur = { runs: [{ t: text, b: !!kopf && false }], head: kopf, pageBreak: false }; out.push(cur); }
      else { const r = cur.runs[0]; r.t = /[-‐]$/.test(r.t) && !/\s-$/.test(r.t) ? r.t.slice(0, -1) + text : r.t + " " + text; }
      prev = z;
    }
    if (pn < doc.numPages) out.push({ pageBreakMark: true });
    onProg && onProg(pn / doc.numPages); await WZ.warte();
  }
  // Seitenumbruch-Markierungen -> Umbruch vor dem naechsten Absatz
  const fin = []; let umb = false; for (const p of out) { if (p.pageBreakMark) { umb = true; continue; } if (umb) { p.pageBreak = true; umb = false; } fin.push(p); }
  return { absaetze: fin, textGefunden };
}
tool({ id: "pdf2word", titel: "PDF → Word", sym: "📝", farbe: "#2b6cc4", text: "Text und Überschriften aus einer PDF in ein bearbeitbares Word-Dokument (.docx) übernehmen.", build(sec){
  sec.innerHTML = '<div class="liste"></div><div class="warn">Ehrlich gesagt: Eine PDF kennt keine Absätze und Tabellen, nur Text an Positionen. Ich erkenne Zeilen, Absätze und Überschriften (nach Schriftgröße) und übernehme den Text samt Seitenumbrüchen. Bilder, Tabellen-Gitter und Spalten-Layouts werden <b>nicht</b> nachgebaut. Gescannte PDFs (nur Bild) enthalten keinen Text – dafür bräuchte man Texterkennung (OCR).</div><button class="btn go" id="go" disabled>In Word umwandeln</button><div class="ausgabe"></div>';
  const out = Ausgabe($(".ausgabe", sec)); const li = Liste($(".liste", sec), { accept: ".pdf,application/pdf", titel: "PDF hier ablegen", meldung: out.say, sortieren: false, onChange: it => $("#go", sec).disabled = !it.length });
  wrapRun($("#go", sec), async () => { out.leer(); for (const it of li.items) { try { out.say("Lese " + it.file.name + " …"); const doc = await oeffnePdf(await readAB(it.file)); const { absaetze, textGefunden } = await pdfZuAbsaetzen(doc, out.prog);
      if (textGefunden < 5) { out.add(it.file.name + " (kein Text)", new Blob([]), "Diese PDF enthält keinen auslesbaren Text (vermutlich ein Scan)."); continue; }
      const blob = await WordPdf.schreibeDocx(absaetze, WZ.sauber(it.file.name)); out.add(WZ.sauber(it.file.name) + ".docx", blob, doc.numPages + " Seiten · " + absaetze.length + " Absätze · " + G(blob.size)); } catch (e) { out.add(it.file.name + " (Fehler)", new Blob([]), e.message); } }
    out.say("Fertig. Bitte das Ergebnis in Word kurz durchsehen.", "ok"); out.prog(null); out.zipKnopf("Word-Dokumente.zip"); });
}});

// ---- 7: Word/Text -> PDF
tool({ id: "word2pdf", titel: "Word / Text → PDF", sym: "📘", farbe: "#4cae5a", text: "Word-Dokumente (.docx) oder Textdateien (.txt) in PDF umwandeln.", build(sec){
  sec.innerHTML = '<div class="liste"></div><div class="warn">Hinweis: Das Umwandeln passiert ohne Word. Überschriften, Absätze, Listen, Fett/Kursiv, Tabellen und Bilder werden übernommen. Sonderschriften werden durch Standardschriften (Helvetica, Times, Courier) ersetzt, Kopf-/Fußzeilen, Fußnoten und Formen fehlen. Für exakte Layouts am besten direkt in Word „Als PDF speichern“.</div><label class="chk"><input type="checkbox" id="mono"> Textdateien in Schreibmaschinenschrift (Courier)</label><button class="btn go" id="go" style="margin-top:12px" disabled>In PDF umwandeln</button><div class="ausgabe"></div>';
  const out = Ausgabe($(".ausgabe", sec)); const li = Liste($(".liste", sec), { accept: ".docx,.txt,.md,.csv,.log", titel: "Word- oder Textdateien hier ablegen", meldung: out.say, sortieren: false, onChange: it => $("#go", sec).disabled = !it.length });
  wrapRun($("#go", sec), async () => { out.leer(); let n = 0; for (const it of li.items) { try { out.say("Wandle " + it.file.name + " um …"); const ext = frageEndung(it.file.name); let model;
      if (ext === "docx") model = await WordPdf.leseDocx(await readAB(it.file)); else if (ext === "doc") throw new Error("Alte .doc-Dateien kann ich nicht lesen – bitte in Word als .docx speichern."); else model = WordPdf.textModell(await it.file.text(), $("#mono", sec).checked);
      const bytes = await WordPdf.zuPdf(model); out.add(WZ.sauber(it.file.name) + ".pdf", new Blob([bytes], { type: "application/pdf" }), G(bytes.length)); } catch (e) { console.error(e); out.add(it.file.name + " (Fehler)", new Blob([]), e.message); } n++; out.prog(n / li.items.length); await WZ.warte(); }
    out.say("Fertig.", "ok"); out.prog(null); out.zipKnopf("PDFs.zip"); });
}});

// ---- 8: PDF -> Text
tool({ id: "pdf2txt", titel: "PDF → Text", sym: "🔤", farbe: "#7a8fa8", text: "Den Text aus einer PDF herausziehen – zum Kopieren oder als .txt-Datei.", build(sec){
  sec.innerHTML = '<div class="liste"></div><textarea class="in" id="ta" rows="12" placeholder="Hier erscheint der Text …" readonly style="margin-top:12px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px"></textarea><div class="row" style="margin-top:8px"><button class="btn" id="cp" disabled>Kopieren</button><button class="btn go" id="sv" disabled>Als .txt speichern</button></div><div class="ausgabe"></div>';
  const out = Ausgabe($(".ausgabe", sec)); let name = "text"; const ta = $("#ta", sec);
  Liste($(".liste", sec), { accept: ".pdf,application/pdf", multiple: false, titel: "PDF hier ablegen", meldung: out.say, onChange: async it => { ta.value = ""; $("#cp", sec).disabled = $("#sv", sec).disabled = true; if (!it.length) return; try { out.say("Lese Text …"); const f = it[0].file; name = WZ.sauber(f.name); const doc = await oeffnePdf(await readAB(f)); let txt = "";
      for (let i = 1; i <= doc.numPages; i++) { const pg = await doc.getPage(i); const tc = await pg.getTextContent(); let y = null, z = ""; for (const t of tc.items) { if (t.str === undefined) continue; const ny = t.transform[5]; if (y !== null && Math.abs(ny - y) > 3) { txt += z.replace(/\s+$/, "") + "\n"; z = ""; } z += t.str + (t.hasEOL ? "\n" : ""); y = ny; } txt += z + "\n\n"; out.prog(i / doc.numPages); await WZ.warte(); }
      ta.value = txt.trim(); out.prog(null); out.say(txt.trim() ? doc.numPages + " Seite(n) gelesen." : "Kein Text gefunden – vermutlich ein Scan (nur Bild).", txt.trim() ? "ok" : "bad"); $("#cp", sec).disabled = $("#sv", sec).disabled = !txt.trim(); } catch (e) { fehler(out, e); } } });
  $("#cp", sec).onclick = async () => { try { await navigator.clipboard.writeText(ta.value); out.say("Kopiert.", "ok"); } catch (e) { ta.select(); out.say("Bitte mit Strg+C kopieren.", "bad"); } };
  $("#sv", sec).onclick = () => WZ.speichern(new Blob([ta.value], { type: "text/plain;charset=utf-8" }), name + ".txt");
}});

// ---- 9: Seitenzahlen & Wasserzeichen
tool({ id: "stamp", titel: "Seitenzahlen & Wasserzeichen", sym: "🔖", farbe: "#c85ab8", text: "Seitenzahlen einfügen, ein Wasserzeichen aufdrucken oder Dateiinfos entfernen.", build(sec){
  sec.innerHTML = '<div class="liste"></div><div class="cols2"><div><label class="chk"><input type="checkbox" id="sz" checked> Seitenzahlen</label><label class="l">Position</label><select class="in" id="pos"><option value="mitte">unten Mitte</option><option value="rechts">unten rechts</option><option value="links">unten links</option></select><label class="l">Text</label><input class="in" id="fmt" value="Seite {n} von {N}"></div>' +
    '<div><label class="chk"><input type="checkbox" id="wm"> Wasserzeichen</label><label class="l">Wasserzeichen-Text</label><input class="in" id="wt" value="ENTWURF"><div class="rg"><span>Stärke</span><input type="range" id="wo" min="5" max="60" value="18"><output id="woO"></output></div></div></div>' +
    '<label class="chk"><input type="checkbox" id="meta"> Dateiinfos entfernen (Autor, Titel, Programm …)</label><button class="btn go" id="go" style="margin-top:12px" disabled>Anwenden</button><div class="ausgabe"></div>';
  const out = Ausgabe($(".ausgabe", sec)); const li = Liste($(".liste", sec), { accept: ".pdf,application/pdf", titel: "PDFs hier ablegen", meldung: out.say, sortieren: false, onChange: it => $("#go", sec).disabled = !it.length });
  sec.addEventListener("input", () => $("#woO", sec).textContent = $("#wo", sec).value + " %"); $("#woO", sec).textContent = "18 %";
  wrapRun($("#go", sec), async () => { out.leer(); const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib;
    for (const it of li.items) { try { const d = await PDFDocument.load(await readAB(it.file), { ignoreEncryption: true }); const f = await d.embedFont(StandardFonts.Helvetica), fb = await d.embedFont(StandardFonts.HelveticaBold); const pgs = d.getPages(); const N = pgs.length;
        const safe = (fo, t) => { let o = ""; for (const ch of t) { try { fo.encodeText(ch); o += ch; } catch (e) { o += "?"; } } return o; };
        pgs.forEach((pg, k) => { const { width, height } = pg.getSize();
          if ($("#wm", sec).checked && $("#wt", sec).value.trim()) { const t = safe(fb, $("#wt", sec).value.trim()); let size = Math.min(width, height) / Math.max(4, t.length * .62) * 1.35; const tw = fb.widthOfTextAtSize(t, size); const ang = Math.atan2(height, width) * .8; pg.drawText(t, { x: width / 2 - Math.cos(ang) * tw / 2 + Math.sin(ang) * size * .3, y: height / 2 - Math.sin(ang) * tw / 2 - Math.cos(ang) * size * .3, size, font: fb, color: rgb(.5, .5, .5), opacity: +$("#wo", sec).value / 100, rotate: degrees(ang * 180 / Math.PI) }); }
          if ($("#sz", sec).checked) { const t = safe(f, $("#fmt", sec).value.replace(/\{n\}/g, k + 1).replace(/\{N\}/g, N)); const s = 10, tw = f.widthOfTextAtSize(t, s); const p = $("#pos", sec).value; pg.drawText(t, { x: p === "mitte" ? (width - tw) / 2 : p === "rechts" ? width - tw - 36 : 36, y: 24, size: s, font: f, color: rgb(.25, .25, .25) }); } });
        if ($("#meta", sec).checked) { d.setTitle(""); d.setAuthor(""); d.setSubject(""); d.setKeywords([]); d.setProducer(""); d.setCreator(""); } else d.setProducer("Oratio Studio – Datei-Werkstatt");
        const bytes = await d.save({ useObjectStreams: true }); out.add(WZ.sauber(it.file.name) + "_neu.pdf", new Blob([bytes], { type: "application/pdf" }), N + " Seiten · " + G(bytes.length)); } catch (e) { out.add(it.file.name + " (Fehler)", new Blob([]), e.message); } }
    out.say("Fertig.", "ok"); out.zipKnopf("PDFs.zip"); });
}});

// ---- 10: Bilder verkleinern & umwandeln
tool({ id: "bilder", titel: "Bilder verkleinern & umwandeln", sym: "📷", farbe: "#e0527a", text: "Fotos kleiner machen und in JPG, PNG oder WebP umwandeln – viele auf einmal.", build(sec){
  sec.innerHTML = '<div class="liste"></div><div class="cols2"><div><label class="l">Format</label><select class="in" id="fm"><option value="jpg">JPG (Fotos, klein)</option><option value="webp">WebP (noch kleiner)</option><option value="png">PNG (verlustfrei, Transparenz)</option></select></div><div><label class="l">Größe (längste Seite)</label><select class="in" id="mx"><option value="0">Nicht verändern</option><option value="3840">3840 px (4K)</option><option value="2560">2560 px</option><option value="1920" selected>1920 px (Full-HD)</option><option value="1280">1280 px</option><option value="800">800 px (Web/Mail)</option><option value="400">400 px (Vorschau)</option></select></div></div>' +
    '<div class="rg" id="qrow"><span>Qualität</span><input type="range" id="q" min="30" max="100" value="80"><output id="qO"></output></div><button class="btn go" id="go" style="margin-top:8px" disabled>Umwandeln</button><div class="ausgabe"></div>';
  const out = Ausgabe($(".ausgabe", sec)); const li = Liste($(".liste", sec), { accept: "image/*", titel: "Bilder hier ablegen (viele möglich)", meldung: out.say, sortieren: false, onChange: it => $("#go", sec).disabled = !it.length });
  const upd = () => { $("#qO", sec).textContent = $("#q", sec).value + " %"; $("#qrow", sec).hidden = $("#fm", sec).value === "png"; }; sec.addEventListener("input", upd); upd();
  wrapRun($("#go", sec), async () => { out.leer(); const fm = $("#fm", sec).value, mx = +$("#mx", sec).value, q = +$("#q", sec).value / 100; let n = 0, vor = 0, nach = 0;
    for (const it of li.items) { try { const bmp = await createImageBitmap(it.file, { imageOrientation: "from-image" }); let w = bmp.width, h = bmp.height; if (mx && Math.max(w, h) > mx) { const f = mx / Math.max(w, h); w = Math.max(1, Math.round(w * f)); h = Math.max(1, Math.round(h * f)); }
        let cur = bmp, cw = bmp.width, ch = bmp.height; while (cw * .5 > w && ch * .5 > h) { const nw = Math.round(cw / 2), nh = Math.round(ch / 2); const t = document.createElement("canvas"); t.width = nw; t.height = nh; const tc = t.getContext("2d"); tc.imageSmoothingQuality = "high"; tc.drawImage(cur, 0, 0, nw, nh); cur = t; cw = nw; ch = nh; }
        const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); if (fm === "jpg") { x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); } x.imageSmoothingQuality = "high"; x.drawImage(cur, 0, 0, w, h);
        const type = fm === "jpg" ? "image/jpeg" : fm === "webp" ? "image/webp" : "image/png"; const b = await toBlob(c, type, q); if (!b || (fm === "webp" && b.type !== "image/webp")) throw new Error("Dieser Browser kann kein WebP – bitte JPG oder PNG wählen.");
        vor += it.file.size; nach += b.size; out.add(WZ.sauber(it.file.name) + "." + fm, b, w + "×" + h + " · " + G(it.file.size) + " → " + G(b.size)); } catch (e) { out.add(it.file.name + " (Fehler)", new Blob([]), e.message); } n++; out.prog(n / li.items.length); await WZ.warte(); }
    out.say(n + " Bild(er) · gesamt " + G(vor) + " → " + G(nach) + (vor > nach ? " (−" + Math.round((1 - nach / vor) * 100) + " %)" : ""), "ok"); out.prog(null); out.zipKnopf("Bilder.zip"); });
}});

// ---- 11: ZIP
tool({ id: "zip", titel: "ZIP packen & entpacken", sym: "📦", farbe: "#5b7fe0", text: "Dateien zu einem ZIP bündeln oder ein ZIP öffnen und einzelne Dateien herausholen.", build(sec){
  sec.innerHTML = '<div class="tabs"><button class="btn on" data-m="pack">Packen</button><button class="btn" data-m="unpack">Entpacken</button></div>' +
    '<div data-m="pack"><div class="liste1"></div><div class="rg"><span>Stärke</span><input type="range" id="lv" min="0" max="9" value="6"><output id="lvO"></output></div><label class="l">Name</label><input class="in" id="nm" value="Archiv"><button class="btn go" id="go1" style="margin-top:12px" disabled>ZIP erstellen</button><div class="aus1"></div></div>' +
    '<div data-m="unpack" hidden><div class="liste2"></div><div class="aus2"></div></div>';
  sec.querySelectorAll(".tabs .btn").forEach(b => b.onclick = () => { sec.querySelectorAll(".tabs .btn").forEach(x => x.classList.toggle("on", x === b)); sec.querySelectorAll("[data-m]:not(.btn)").forEach(d => d.hidden = d.dataset.m !== b.dataset.m); });
  const out1 = Ausgabe($(".aus1", sec)), out2 = Ausgabe($(".aus2", sec));
  const li1 = Liste($(".liste1", sec), { accept: "*", titel: "Dateien hier ablegen", meldung: out1.say, sortieren: false, onChange: it => $("#go1", sec).disabled = !it.length });
  $("#lv", sec).oninput = () => $("#lvO", sec).textContent = $("#lv", sec).value; $("#lvO", sec).textContent = "6";
  wrapRun($("#go1", sec), async () => { out1.leer(); try { const z = new JSZip(); let k = 0; const seen = {}; for (const it of li1.items) { let n = it.file.name; if (seen[n]) n = (seen[n]++) + "_" + n; else seen[n] = 1; z.file(n, it.file); }
      const blob = await z.generateAsync({ type: "blob", compression: +$("#lv", sec).value ? "DEFLATE" : "STORE", compressionOptions: { level: +$("#lv", sec).value } }, m => out1.prog(m.percent / 100)); out1.prog(null); out1.add(WZ.sauber($("#nm", sec).value || "Archiv") + ".zip", blob, li1.items.length + " Dateien · " + G(blob.size)); out1.say("Fertig.", "ok"); } catch (e) { fehler(out1, e); } });
  Liste($(".liste2", sec), { accept: ".zip,application/zip", multiple: false, titel: "ZIP-Datei hier ablegen", meldung: out2.say, onChange: async it => { out2.leer(); if (!it.length) return; try { out2.say("Öffne …"); const z = await JSZip.loadAsync(await readAB(it[0].file)); const files = Object.values(z.files).filter(f => !f.dir); if (!files.length) return out2.say("Das ZIP ist leer.", "bad");
      out2.say(files.length + " Datei(en) im ZIP:"); for (const f of files) { const row = document.createElement("div"); row.className = "frow res"; row.innerHTML = '<span class="fn" title="' + esc(f.name) + '">' + esc(f.name) + '</span><span class="muted">' + G(f._data && f._data.uncompressedSize || 0) + '</span><button class="btn sm go">Speichern</button>'; $("button", row).onclick = async () => WZ.speichern(await f.async("blob"), f.name.split("/").pop()); $(".ergebnisse", $(".aus2", sec)).appendChild(row); } } catch (e) { fehler(out2, e); } } });
}});

// ------------------------------------------------------------------ Aufbau der Seite
function start(){
  const grid = $("#toolgrid"), host = $("#toolhost");
  const secs = {};
  grid.innerHTML = TOOLS.map(t => '<a class="tcard" href="#' + t.id + '" data-id="' + t.id + '"><span class="ts" style="background:' + t.farbe + '">' + t.sym + '</span><span><b>' + esc(t.titel) + '</b><small>' + esc(t.text) + '</small></span></a>').join("");
  function zeige(id){
    const t = TOOLS.find(x => x.id === id);
    grid.querySelectorAll(".tcard").forEach(a => a.classList.toggle("on", a.dataset.id === id));
    host.innerHTML = "";
    if (!t) { host.innerHTML = '<p class="muted">Wähle oben ein Werkzeug. Deine Dateien bleiben die ganze Zeit auf deinem Gerät.</p>'; return; }
    const card = document.createElement("div"); card.className = "card toolcard"; card.innerHTML = '<h2 style="margin-top:0"><span class="ts" style="background:' + t.farbe + '">' + t.sym + '</span> ' + esc(t.titel) + '</h2><p class="sub" style="margin-bottom:12px">' + esc(t.text) + '</p><div class="sec"></div>';
    host.appendChild(card); try { t.build($(".sec", card)); } catch (e) { console.error(e); $(".sec", card).textContent = "Fehler beim Aufbau: " + e.message; }
    document.title = t.titel + " – Datei-Werkstatt – Oratio Studio";
    if (history.state !== "x") card.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  window.addEventListener("hashchange", () => zeige(location.hash.slice(1)));
  zeige(location.hash.slice(1));
}
window.DateiWerkstatt = { start, TOOLS };
})();
