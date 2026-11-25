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

// ---- 10: Bilder verkleinern  (und 10b: Bilder umwandeln – eigenes Werkzeug)
async function bildLaden(file, mx){ // → Canvas (längste Seite höchstens mx, sanft verkleinert)
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" }); let w = bmp.width, h = bmp.height;
  if (mx && Math.max(w, h) > mx) { const f = mx / Math.max(w, h); w = Math.max(1, Math.round(w * f)); h = Math.max(1, Math.round(h * f)); }
  let cur = bmp, cw = bmp.width, ch = bmp.height; while (cw * .5 > w && ch * .5 > h) { const nw = Math.round(cw / 2), nh = Math.round(ch / 2); const t = document.createElement("canvas"); t.width = nw; t.height = nh; const tc = t.getContext("2d"); tc.imageSmoothingQuality = "high"; tc.drawImage(cur, 0, 0, nw, nh); cur = t; cw = nw; ch = nh; }
  const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(cur, 0, 0, w, h); return c;
}
function weissUnter(c){ const d = document.createElement("canvas"); d.width = c.width; d.height = c.height; const x = d.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, d.width, d.height); x.drawImage(c, 0, 0); return d; }
const u16 = n => [n & 255, (n >> 8) & 255], u32 = n => [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255];
function bmpBlob(c){ const w = c.width, h = c.height, row = (w * 3 + 3) & ~3, size = 54 + row * h; const buf = new Uint8Array(size);
  buf.set([66, 77, ...u32(size), 0, 0, 0, 0, ...u32(54), ...u32(40), ...u32(w), ...u32(h), ...u16(1), ...u16(24), 0, 0, 0, 0, ...u32(row * h), 19, 11, 0, 0, 19, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const d = weissUnter(c).getContext("2d").getImageData(0, 0, w, h).data; for (let y = 0; y < h; y++) { let o = 54 + (h - 1 - y) * row; for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; buf[o++] = d[i + 2]; buf[o++] = d[i + 1]; buf[o++] = d[i]; } }
  return new Blob([buf], { type: "image/bmp" }); }
function tiffBlob(c){ const w = c.width, h = c.height, n = 9, ifd = 8, bpsOff = ifd + 2 + n * 12 + 4, dat = bpsOff + 6, size = dat + w * h * 3; const buf = new Uint8Array(size), dv = new DataView(buf.buffer);
  buf.set([73, 73, 42, 0, 8, 0, 0, 0]); dv.setUint16(ifd, n, true); let p = ifd + 2;
  const ent = (tag, typ, cnt, val) => { dv.setUint16(p, tag, true); dv.setUint16(p + 2, typ, true); dv.setUint32(p + 4, cnt, true); if (typ === 3 && cnt === 1) dv.setUint16(p + 8, val, true); else dv.setUint32(p + 8, val, true); p += 12; };
  ent(256, 4, 1, w); ent(257, 4, 1, h); ent(258, 3, 3, bpsOff); ent(259, 3, 1, 1); ent(262, 3, 1, 2); ent(273, 4, 1, dat); ent(277, 3, 1, 3); ent(278, 4, 1, h); ent(279, 4, 1, w * h * 3); dv.setUint32(p, 0, true);
  dv.setUint16(bpsOff, 8, true); dv.setUint16(bpsOff + 2, 8, true); dv.setUint16(bpsOff + 4, 8, true);
  const d = weissUnter(c).getContext("2d").getImageData(0, 0, w, h).data; let o = dat; for (let i = 0; i < w * h; i++) { buf[o++] = d[i * 4]; buf[o++] = d[i * 4 + 1]; buf[o++] = d[i * 4 + 2]; }
  return new Blob([buf], { type: "image/tiff" }); }
function gifBlob(c){ const w = c.width, h = c.height, d = weissUnter(c).getContext("2d").getImageData(0, 0, w, h).data;
  const lv = [7, 7, 3], f = new Float32Array(w * h * 3); for (let i = 0; i < w * h; i++) { f[i * 3] = d[i * 4]; f[i * 3 + 1] = d[i * 4 + 1]; f[i * 3 + 2] = d[i * 4 + 2]; }
  const idx = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x, q = [0, 0, 0], r = [0, 0, 0];
    for (let k = 0; k < 3; k++) { const v = Math.max(0, Math.min(255, f[i * 3 + k])); q[k] = Math.round(v / 255 * lv[k]); r[k] = f[i * 3 + k] - q[k] / lv[k] * 255; }
    idx[i] = (q[0] << 5) | (q[1] << 2) | q[2];
    for (let k = 0; k < 3; k++) { if (x + 1 < w) f[(i + 1) * 3 + k] += r[k] * 7 / 16; if (y + 1 < h) { if (x > 0) f[(i + w - 1) * 3 + k] += r[k] * 3 / 16; f[(i + w) * 3 + k] += r[k] * 5 / 16; if (x + 1 < w) f[(i + w + 1) * 3 + k] += r[k] / 16; } } }
  const out = [71, 73, 70, 56, 57, 97, ...u16(w), ...u16(h), 0xF7, 0, 0]; for (let i = 0; i < 256; i++) out.push(Math.round((i >> 5) / 7 * 255), Math.round(((i >> 2) & 7) / 7 * 255), Math.round((i & 3) / 3 * 255));
  out.push(0x2C, 0, 0, 0, 0, ...u16(w), ...u16(h), 0, 8);
  const bytes = []; let dict = new Map(), next = 258, size = 9, cur = 0, nb = 0, blk = [];
  const put = code => { cur |= code << nb; nb += size; while (nb >= 8) { blk.push(cur & 255); cur >>= 8; nb -= 8; if (blk.length === 255) { bytes.push(255, ...blk); blk = []; } } };
  put(256); let pre = idx[0];
  for (let i = 1; i < idx.length; i++) { const k = pre * 256 + idx[i], v = dict.get(k); if (v !== undefined) pre = v; else { put(pre); if (next < 4096) { dict.set(k, next++); if (next > (1 << size) && size < 12) size++; } else { put(256); dict = new Map(); next = 258; size = 9; } pre = idx[i]; } }
  put(pre); put(257); if (nb > 0) { blk.push(cur & 255); } if (blk.length) bytes.push(blk.length, ...blk); bytes.push(0, 0x3B);
  return new Blob([new Uint8Array(out), new Uint8Array(bytes)], { type: "image/gif" }); }
async function icoBlob(c, groessen){ const imgs = []; for (const s of groessen) { const k = document.createElement("canvas"); k.width = k.height = s; const x = k.getContext("2d"); x.imageSmoothingQuality = "high"; const f = Math.min(s / c.width, s / c.height), w = c.width * f, h = c.height * f; x.drawImage(c, (s - w) / 2, (s - h) / 2, w, h); imgs.push(new Uint8Array(await (await toBlob(k, "image/png")).arrayBuffer())); }
  const head = [0, 0, 1, 0, ...u16(groessen.length)]; let off = 6 + 16 * groessen.length; const dir = [];
  groessen.forEach((s, i) => { dir.push(s >= 256 ? 0 : s, s >= 256 ? 0 : s, 0, 0, ...u16(1), ...u16(32), ...u32(imgs[i].length), ...u32(off)); off += imgs[i].length; });
  return new Blob([new Uint8Array([...head, ...dir]), ...imgs], { type: "image/x-icon" }); }

tool({ id: "bilder", titel: "Bilder verkleinern", sym: "📷", farbe: "#e0527a", text: "Fotos kleiner machen (Größe und Qualität) – viele auf einmal, mit Vorher/Nachher-Größe. Zum Wechseln des Formats gibt es „Bilder umwandeln“.", build(sec){
  sec.innerHTML = '<div class="liste"></div><div class="cols2"><div><label class="l">Größe (längste Seite)</label><select class="in" id="mx"><option value="0">Nicht verändern</option><option value="3840">3840 px (4K)</option><option value="2560">2560 px</option><option value="1920" selected>1920 px (Full-HD)</option><option value="1280">1280 px</option><option value="800">800 px (Web/Mail)</option><option value="400">400 px (Vorschau)</option></select></div>' +
    '<div><label class="l">Speichern als</label><select class="in" id="fm"><option value="same">Wie das Original (JPG bleibt JPG, PNG bleibt PNG)</option><option value="webp">WebP (meist am kleinsten)</option><option value="jpg">JPG</option></select></div></div>' +
    '<div class="rg" id="qrow"><span>Qualität</span><input type="range" id="q" min="30" max="100" value="80"><output id="qO"></output></div><p class="muted" style="font-size:13px;margin:4px 0 0">PNG bleibt verlustfrei – dort spart nur eine kleinere Größe Platz. Kleiner machen heißt nicht „Format ändern“: dafür nimm „Bilder umwandeln“.</p><button class="btn go" id="go" style="margin-top:8px" disabled>Verkleinern</button><div class="ausgabe"></div>';
  const out = Ausgabe($(".ausgabe", sec)); const li = Liste($(".liste", sec), { accept: "image/*", titel: "Bilder hier ablegen (viele möglich)", meldung: out.say, sortieren: false, onChange: it => $("#go", sec).disabled = !it.length });
  const upd = () => { $("#qO", sec).textContent = $("#q", sec).value + " %"; }; sec.addEventListener("input", upd); upd();
  wrapRun($("#go", sec), async () => { out.leer(); const fm0 = $("#fm", sec).value, mx = +$("#mx", sec).value, q = +$("#q", sec).value / 100; let n = 0, vor = 0, nach = 0;
    for (const it of li.items) { try { const nm = it.file.name.toLowerCase(), alt = it.file.type;
        const fm = fm0 !== "same" ? fm0 : (/png/.test(alt) || /\.png$/.test(nm)) ? "png" : (/webp/.test(alt) || /\.webp$/.test(nm)) ? "webp" : "jpg";
        let c = await bildLaden(it.file, mx); if (fm === "jpg") c = weissUnter(c);
        const type = fm === "jpg" ? "image/jpeg" : fm === "webp" ? "image/webp" : "image/png"; let b = await toBlob(c, type, q); if (!b || (fm === "webp" && b.type !== "image/webp")) throw new Error("Dieser Browser kann kein WebP – bitte JPG wählen.");
        let hinweis = ""; if (b.size >= it.file.size && !(mx && Math.max(c.width, c.height) < mx)) { hinweis = " · war schon klein – Original behalten"; b = it.file; }
        vor += it.file.size; nach += b.size; out.add(WZ.sauber(it.file.name) + "_klein." + (b === it.file ? (it.file.name.split(".").pop().toLowerCase()) : fm), b, c.width + "×" + c.height + " · " + G(it.file.size) + " → " + G(b.size) + hinweis); } catch (e) { out.add(it.file.name + " (Fehler)", new Blob([]), e.message); } n++; out.prog(n / li.items.length); await WZ.warte(); }
    out.say(n + " Bild(er) · gesamt " + G(vor) + " → " + G(nach) + (vor > nach ? " (−" + Math.round((1 - nach / vor) * 100) + " %)" : ""), "ok"); out.prog(null); out.zipKnopf("Bilder.zip"); });
}});

tool({ id: "bildformat", titel: "Bilder umwandeln", sym: "🔁", farbe: "#c0398c", text: "Das Format wechseln: JPG, PNG, WebP, AVIF, GIF, BMP, TIFF oder Windows-Icon (ICO) – viele Bilder auf einmal, Größe bleibt wie sie ist.", build(sec){
  const avif = (() => { try { const c = document.createElement("canvas"); c.width = c.height = 1; return c.toDataURL("image/avif").indexOf("image/avif") > 4; } catch (e) { return false; } })();
  sec.innerHTML = '<div class="liste"></div><div class="cols2"><div><label class="l">Umwandeln in</label><select class="in" id="fm"><option value="png">PNG (verlustfrei, Transparenz)</option><option value="jpg">JPG (Fotos)</option><option value="webp">WebP (Web, klein)</option>' + (avif ? '<option value="avif">AVIF (sehr klein, modern)</option>' : "") + '<option value="gif">GIF (256 Farben)</option><option value="bmp">BMP (Windows-Bitmap)</option><option value="tiff">TIFF (Druck, groß)</option><option value="ico">ICO (Windows-Icon, 16–256 px)</option></select></div>' +
    '<div id="qw"><label class="l">Qualität</label><div class="rg" style="margin:0"><input type="range" id="q" min="30" max="100" value="90"><output id="qO"></output></div></div></div>' +
    '<p class="muted" id="hn" style="font-size:13px;margin:6px 0 0"></p><button class="btn go" id="go" style="margin-top:8px" disabled>Umwandeln</button><div class="ausgabe"></div>';
  const out = Ausgabe($(".ausgabe", sec)); const li = Liste($(".liste", sec), { accept: "image/*,.bmp,.ico,.gif,.webp,.avif,.svg", titel: "Bilder hier ablegen (viele möglich)", meldung: out.say, sortieren: false, onChange: it => $("#go", sec).disabled = !it.length });
  const HN = { png: "PNG behält Transparenz und ist verlustfrei.", jpg: "JPG hat keine Transparenz – durchsichtige Stellen werden weiß.", webp: "WebP unterstützt Transparenz und ist klein.", avif: "AVIF ist sehr klein; ältere Programme öffnen es noch nicht.", gif: "GIF kennt nur 256 Farben (Fotos sehen gröber aus) und hat hier keine Transparenz. Sehr große Bilder werden auf 2000 px verkleinert.", bmp: "BMP ist unkomprimiert und deshalb groß.", tiff: "TIFF ist unkomprimiert und deshalb sehr groß – gut für Druck und Archiv.", ico: "Es entsteht ein Icon mit den Größen 16, 32, 48, 64, 128 und 256 px. Quadratische Bilder passen am besten." };
  const upd = () => { const f = $("#fm", sec).value; $("#qO", sec).textContent = $("#q", sec).value + " %"; $("#qw", sec).hidden = !/^(jpg|webp|avif)$/.test(f); $("#hn", sec).textContent = HN[f]; }; sec.addEventListener("input", upd); sec.addEventListener("change", upd); upd();
  wrapRun($("#go", sec), async () => { out.leer(); const fm = $("#fm", sec).value, q = +$("#q", sec).value / 100; let n = 0;
    for (const it of li.items) { try { let c = await bildLaden(it.file, fm === "gif" ? 2000 : fm === "ico" ? 512 : 0), b;
        if (fm === "jpg") b = await toBlob(weissUnter(c), "image/jpeg", q); else if (fm === "png") b = await toBlob(c, "image/png"); else if (fm === "webp" || fm === "avif") { b = await toBlob(c, "image/" + fm, q); if (!b || b.type !== "image/" + fm) throw new Error("Dieser Browser kann kein " + fm.toUpperCase() + " – bitte PNG oder JPG wählen."); }
        else if (fm === "bmp") b = bmpBlob(c); else if (fm === "tiff") b = tiffBlob(c); else if (fm === "gif") b = gifBlob(c); else b = await icoBlob(c, [16, 32, 48, 64, 128, 256]);
        out.add(WZ.sauber(it.file.name) + "." + (fm === "jpg" ? "jpg" : fm === "tiff" ? "tif" : fm), b, (fm === "ico" ? "6 Größen" : c.width + "×" + c.height) + " · " + G(it.file.size) + " → " + G(b.size)); } catch (e) { out.add(it.file.name + " (Fehler)", new Blob([]), e.message); } n++; out.prog(n / li.items.length); await WZ.warte(); }
    out.say(n + " Bild(er) umgewandelt.", "ok"); out.prog(null); out.zipKnopf("Bilder.zip"); });
}});

// ---- Foto-Datenschutz: zeigt Standort & Kamera-Daten und entfernt sie
async function exifLesen(file){
  const r = { make: "", model: "", soft: "", date: "", lat: null, lon: null, alt: null, jpg: false };
  try {
    const dv = new DataView(await file.slice(0, 262144).arrayBuffer()); if (dv.getUint16(0) !== 0xFFD8) return r; r.jpg = true;
    let o = 2;
    while (o + 4 < dv.byteLength) {
      const mk = dv.getUint16(o), len = dv.getUint16(o + 2); if (mk === 0xFFDA || mk < 0xFF00) break;
      if (mk === 0xFFE1 && dv.getUint32(o + 4) === 0x45786966) {
        const t = o + 10, le = dv.getUint16(t) === 0x4949, u16 = x => dv.getUint16(x, le), u32 = x => dv.getUint32(x, le);
        const val = (e) => { const ty = u16(e + 2), n = u32(e + 4), sz = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1 }[ty] || 1, tot = sz * n, vo = tot <= 4 ? e + 8 : t + u32(e + 8);
          if (ty === 2) { let s2 = ""; for (let i = 0; i < n - 1; i++) { const c = dv.getUint8(vo + i); if (!c) break; s2 += String.fromCharCode(c); } return s2.trim(); }
          if (ty === 5) { const a = []; for (let i = 0; i < n; i++) { const d = u32(vo + i * 8 + 4); a.push(d ? u32(vo + i * 8) / d : 0); } return a; }
          if (ty === 3) return u16(vo); if (ty === 4) return u32(vo); if (ty === 1) return dv.getUint8(vo); return null; };
        const ifd = (off, fn) => { const p0 = t + off, n = u16(p0); for (let i = 0; i < n; i++) fn(u16(p0 + 2 + i * 12), p0 + 2 + i * 12); };
        let gps = null, exif = null;
        ifd(u32(t + 4), (tag, e) => { if (tag === 0x010F) r.make = val(e); else if (tag === 0x0110) r.model = val(e); else if (tag === 0x0131) r.soft = val(e); else if (tag === 0x0132) r.date = val(e); else if (tag === 0x8825) gps = u32(e + 8); else if (tag === 0x8769) exif = u32(e + 8); });
        if (exif != null) ifd(exif, (tag, e) => { if (tag === 0x9003) r.date = val(e) || r.date; });
        if (gps != null) { let la, lr, lo, lor, al, alr = 0; ifd(gps, (tag, e) => { if (tag === 1) lr = val(e); else if (tag === 2) la = val(e); else if (tag === 3) lor = val(e); else if (tag === 4) lo = val(e); else if (tag === 5) alr = val(e); else if (tag === 6) al = val(e)[0]; });
          const dec = a => a && a.length >= 3 ? a[0] + a[1] / 60 + a[2] / 3600 : null;
          if (dec(la) != null && dec(lo) != null) { r.lat = dec(la) * (lr === "S" ? -1 : 1); r.lon = dec(lo) * (lor === "W" ? -1 : 1); } if (al != null) r.alt = al * (alr === 1 ? -1 : 1); }
        break;
      }
      o += 2 + len;
    }
  } catch (e) {}
  return r;
}
tool({ id: "exif", titel: "Foto-Datenschutz", sym: "🛡️", farbe: "#0e8f6d", text: "Zeigt, was ein Foto über dich verrät (Standort, Kamera, Zeit) – und entfernt es vor dem Teilen.", build(sec){
  sec.innerHTML = '<div class="liste"></div><div class="exinfo"></div><button class="btn go" id="go" disabled>Daten entfernen und speichern</button><p class="muted" style="font-size:13px;margin:8px 0 0">Das Foto wird sauber neu gespeichert (JPG, hohe Qualität): ohne Standort, Kamera- und Zeitangaben. Dein Original bleibt unverändert.</p><div class="ausgabe"></div>';
  const out = Ausgabe($(".ausgabe", sec)), info = $(".exinfo", sec);
  const li = Liste($(".liste", sec), { accept: "image/*", titel: "Fotos hier ablegen (viele möglich)", meldung: out.say, sortieren: false, onChange: async it => {
    $("#go", sec).disabled = !it.length; info.innerHTML = ""; let warn = 0;
    for (const x of it) { const r = await exifLesen(x.file), div = document.createElement("div"); div.className = "res"; div.style.cssText = "display:block;margin:8px 0;padding:10px 12px;border-radius:12px";
      const rows = []; if (r.lat != null) { warn++; rows.push('<b style="color:#d93b3b">⚠ Standort gefunden:</b> ' + r.lat.toFixed(5) + ", " + r.lon.toFixed(5) + ' · <a target="_blank" rel="noopener" href="https://www.openstreetmap.org/?mlat=' + r.lat + "&mlon=" + r.lon + "#map=16/" + r.lat + "/" + r.lon + '">Auf der Karte ansehen</a>'); }
      if (r.make || r.model) rows.push("📷 Kamera: " + esc((r.make + " " + r.model).trim())); if (r.date) rows.push("🕒 Aufnahme: " + esc(r.date.replace(/^(\d{4}):(\d\d):(\d\d)/, "$3.$2.$1"))); if (r.soft) rows.push("🧩 Programm: " + esc(r.soft)); if (r.alt != null) rows.push("⛰️ Höhe: " + Math.round(r.alt) + " m");
      div.innerHTML = '<b>' + esc(x.file.name) + '</b><br>' + (rows.length ? rows.join("<br>") : '<span class="muted">' + (r.jpg ? "Keine Standort- oder Kamera-Daten gefunden – sauber." : "Kein JPG – hier kann ich nichts lesen, beim Speichern wird aber alles entfernt.") + "</span>"); info.appendChild(div); }
    if (warn) out.say(warn + " Foto(s) verraten den Standort.", "bad"); else out.say(""); } });
  wrapRun($("#go", sec), async () => { out.leer(); let n = 0;
    for (const it of li.items) { try { const c = await bildLaden(it.file, 0), b = await toBlob(weissUnter(c), "image/jpeg", .93); out.add(WZ.sauber(it.file.name) + "_sauber.jpg", b, c.width + "×" + c.height + " · " + G(it.file.size) + " → " + G(b.size)); n++; } catch (e) { out.add(it.file.name, null, "Konnte nicht gelesen werden."); } }
    out.say(n + " Foto(s) bereinigt.", "ok"); out.prog(null); out.zipKnopf("Fotos_sauber.zip"); });
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

// ---- 14: Datei-Hash- und Duplikat-Prüfer (Version 6 aus dem Oratio Control Center – dieselben Funktionen, direkt im Browser)
(function(){
const FR = WZ.lang === "fr", T = (d, f) => FR ? f : d;
const PROGRAM = "Datei-Hash- und Duplikat-Prüfer", AUTHOR = "Oratio Koevi", VERSION = "6", RELEASE = "07.10.2026", ALGO = "SHA256";
const C = { red: "#ff4f4f", green: "#30c759", yellow: "#e8a800", cyan: "#28aae6", magenta: "#c85adc" };
// dieselben 30 Regenbogenfarben wie in der .sh / .ps1 / .py (256-Farben-Codes)
const RAINBOW = [196, 202, 208, 214, 220, 226, 190, 154, 118, 82, 46, 47, 48, 49, 50, 51, 45, 39, 33, 27, 21, 57, 93, 129, 165, 201, 200, 199, 198, 197].map(c => { const lv = [0, 95, 135, 175, 215, 255]; c -= 16; return "rgb(" + lv[Math.floor(c / 36)] + "," + lv[Math.floor(c / 6) % 6] + "," + lv[c % 6] + ")"; });
const p2 = n => String(n).padStart(2, "0");
function hSize(n){ n = Math.max(0, Math.floor(n)); const u = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"]; let v = n, i = 0; while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; } if (!i) return n + "B"; const r = Math.round(v * 10) / 10; return (r === Math.floor(r) ? String(r) : r.toFixed(1)) + u[i]; }
function hDur(s){ s = Math.max(0, Math.floor(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? p2(h) + ":" + p2(m) + ":" + p2(x) : p2(m) + ":" + p2(x); }
function hDate(ms){ const d = new Date(ms), off = -d.getTimezoneOffset(), a = Math.abs(off); return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()) + " " + p2(d.getHours()) + ":" + p2(d.getMinutes()) + ":" + p2(d.getSeconds()) + "." + String(((ms % 1000) + 1000) % 1000).padStart(3, "0") + "000000 " + (off < 0 ? "-" : "+") + p2(Math.floor(a / 60)) + p2(a % 60); }
function center(s, w){ const m = w - s.length; if (m <= 0) return s; const l = Math.floor(m / 2) + (m & w & 1); return " ".repeat(l) + s + " ".repeat(m - l); }
function systemText(){ const ua = navigator.userAgent || "", pl = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
  const br = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : T("Browser", "navigateur");
  return (/iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac/.test(pl) ? "macOS" : /Win/.test(pl) ? "Windows" : /Linux/.test(pl) ? "Linux" : pl || T("unbekannt", "inconnu")) + " | " + br; }

// ---- SHA-256, stückweise (für große Dateien, ohne alles in den Speicher zu laden)
const SK = [], SH0 = [];
(function(){ const pr = []; for (let n = 2; pr.length < 64; n++) { let ok = true; for (const q of pr) { if (q * q > n) break; if (n % q === 0) { ok = false; break; } } if (ok) pr.push(n); }
  const fr = x => Math.floor((x - Math.floor(x)) * 4294967296); pr.forEach(p => SK.push(fr(Math.cbrt(p)))); pr.slice(0, 8).forEach(p => SH0.push(fr(Math.sqrt(p)))); })();
function Sha256(){
  const h = Uint32Array.from(SH0), w = new Uint32Array(64), buf = new Uint8Array(64); let blen = 0, total = 0;
  function block(u, o){
    for (let i = 0; i < 16; i++) w[i] = ((u[o + 4 * i] << 24) | (u[o + 4 * i + 1] << 16) | (u[o + 4 * i + 2] << 8) | u[o + 4 * i + 3]) >>> 0;
    for (let i = 16; i < 64; i++) { const a = w[i - 15], c = w[i - 2]; w[i] = (w[i - 16] + (((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3)) + w[i - 7] + (((c >>> 17) | (c << 15)) ^ ((c >>> 19) | (c << 13)) ^ (c >>> 10))) >>> 0; }
    let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], k = h[7];
    for (let i = 0; i < 64; i++) {
      const t1 = (k + (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) + ((e & f) ^ (~e & g)) + SK[i] + w[i]) >>> 0;
      const t2 = ((((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      k = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0; }
    h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0; h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0; h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + k) >>> 0; }
  return {
    update(u){ total += u.length; let i = 0; if (blen) { while (i < u.length && blen < 64) buf[blen++] = u[i++]; if (blen < 64) return; block(buf, 0); blen = 0; }
      for (; i + 64 <= u.length; i += 64) block(u, i); while (i < u.length) buf[blen++] = u[i++]; },
    hex(){ const bits = total * 8, hi = Math.floor(bits / 4294967296) >>> 0, lo = bits >>> 0; buf[blen++] = 0x80;
      if (blen > 56) { while (blen < 64) buf[blen++] = 0; block(buf, 0); blen = 0; } while (blen < 56) buf[blen++] = 0;
      buf[56] = hi >>> 24; buf[57] = hi >>> 16 & 255; buf[58] = hi >>> 8 & 255; buf[59] = hi & 255; buf[60] = lo >>> 24; buf[61] = lo >>> 16 & 255; buf[62] = lo >>> 8 & 255; buf[63] = lo & 255; block(buf, 0);
      return Array.from(h, x => x.toString(16).padStart(8, "0")).join(""); } };
}
const toHex = ab => Array.from(new Uint8Array(ab), x => x.toString(16).padStart(2, "0")).join("");
async function hashFile(f, onBytes, cancelled){
  if (f.size <= 33554432 && window.crypto && crypto.subtle) { const d = await crypto.subtle.digest("SHA-256", await f.arrayBuffer()); onBytes(f.size); return toHex(d); }
  const h = Sha256(), CH = 4 * 1024 * 1024;
  for (let o = 0; o < f.size; o += CH) { if (cancelled()) return null; const ab = await f.slice(o, o + CH).arrayBuffer(); h.update(new Uint8Array(ab)); onBytes(ab.byteLength); await WZ.warte(); }
  return h.hex();
}
window.OratioSha256 = { hashFile, Sha256 };   // zum Testen

// ---- Ordner per Ziehen (Unterordner mitnehmen)
async function entryFiles(entry, base){
  if (entry.isFile) { const f = await new Promise((ok, er) => entry.file(ok, er)); return [{ file: f, path: base + f.name }]; }
  const out = [], rd = entry.createReader(); let batch;
  do { batch = await new Promise((ok, er) => rd.readEntries(ok, er)); for (const e of batch) out.push(...await entryFiles(e, base + entry.name + "/")); } while (batch.length);
  return out;
}
// ---- Regenbogen-Balken "Oratio Oratio …" (wie im Terminal: bunt und fließend)
function Balken(box){
  const cv = document.createElement("canvas"); cv.className = "hc-bar"; box.appendChild(cv); let frac = 0, off = 0, timer = null;
  function draw(){
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth || 300, H = 30; if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = H * dpr; }
    const x = cv.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
    const r = (H - 2) / 2; x.fillStyle = "rgba(128,128,128,.22)"; x.beginPath(); x.moveTo(1 + r, 1); x.lineTo(W - 1 - r, 1); x.arc(W - 1 - r, 1 + r, r, -Math.PI / 2, Math.PI / 2); x.lineTo(1 + r, H - 1); x.arc(1 + r, 1 + r, r, Math.PI / 2, Math.PI * 1.5); x.closePath(); x.fill();
    x.font = "bold " + Math.round((H - 2) * 0.52) + "px ui-monospace,Menlo,Consolas,monospace"; x.textBaseline = "middle"; const cw = Math.max(1, x.measureText("O").width), pad = r * 0.6, cells = Math.max(1, Math.floor((W - 2 - pad * 2) / cw)), filled = Math.round(cells * frac), word = "Oratio "; let ci = off;
    for (let k = 0; k < cells; k++) { const px = 1 + pad + k * cw; if (k < filled) { const ch = word[(k + off) % word.length]; if (ch !== " ") { x.fillStyle = RAINBOW[ci % RAINBOW.length]; ci++; x.fillText(ch, px, H / 2 + 1); } } else { x.fillStyle = "rgba(128,128,128,.55)"; x.fillText("·", px, H / 2 + 1); } }
  }
  return { set(f){ frac = Math.max(0, Math.min(1, f)); draw(); }, lauf(an){ clearInterval(timer); if (an) timer = setInterval(() => { off++; draw(); }, 90); draw(); } };
}

tool({ id: "hash", titel: "Datei-Hash- und Duplikat-Prüfer", sym: "🔐", farbe: "#7a4fd6", text: "Findet identische Dateien über ihren SHA256-Fingerabdruck – mit Oratio-Balken, Duplikatgruppen und Bericht (TXT + CSV).", build(sec){
  const EMPTY = T("Noch keine Dateien oder Ordner ausgewählt.", "Aucun fichier ou dossier sélectionné pour l’instant.") + "<br>" + T("„Dateien +“, „Ordner +“ oder hierher ziehen.", "« Fichiers + », « Dossier + » ou glisse-les ici.");
  sec.innerHTML =
    '<div class="hc hc-p1">' +
      '<p class="hc-soft" data-nt>' + esc(T("Version " + VERSION + "  ·  Entwickelt von " + AUTHOR + "  ·  Stand " + RELEASE, "Version " + VERSION + "  ·  Développé par " + AUTHOR + "  ·  Version du " + RELEASE)) + '<br>' + esc(T("System: ", "Système : ") + systemText()) + '</p>' +
      '<div class="row"><button class="btn" id="hcF" data-nt>' + esc(T("Dateien +", "Fichiers +")) + '</button><button class="btn" id="hcD" data-nt>' + esc(T("Ordner +", "Dossier +")) + '</button></div>' +
      '<div class="drop" id="hcDrop"><b data-nt>' + esc(T("Dateien oder Ordner hierher ziehen", "Glisse des fichiers ou des dossiers ici")) + '</b><span data-nt>' + esc(T("oder tippen, um Dateien zu wählen", "ou touche pour choisir des fichiers")) + '</span></div>' +
      '<input type="file" id="hcIF" multiple hidden><input type="file" id="hcID" webkitdirectory multiple hidden>' +
      '<div class="hc-list" id="hcList"></div><div class="hc-notice" id="hcNote" hidden></div><div class="hc-status" id="hcStat"></div>' +
      '<div class="row" style="margin-top:8px"><button class="btn sm" id="hcRm" data-nt>' + esc(T("Entfernen", "Retirer")) + '</button><button class="btn sm" id="hcClr" data-nt>' + esc(T("Alles leeren", "Tout vider")) + '</button><span class="sp"></span><button class="btn go" id="hcGo" data-nt>' + esc(T("Prüfung starten", "Lancer la vérification")) + '</button></div>' +
      '<p class="hc-soft" data-nt style="margin-top:8px;font-size:12px">' + esc(T("Ordner werden einschließlich aller Unterordner durchsucht. Deine Dateien bleiben auf deinem Gerät.", "Les dossiers sont analysés avec tous leurs sous-dossiers. Tes fichiers restent sur ton appareil.")) + '</p>' +
    '</div>' +
    '<div class="hc hc-p2" hidden><div class="hc-title" id="hcRT" data-nt style="color:' + C.cyan + '"></div><div class="hc-log" id="hcLog"></div><div class="hc-found" id="hcFound" data-nt></div>' +
      '<div class="hc-barrow"><div id="hcBar" style="flex:1;min-width:0"></div><b class="hc-pct" id="hcPct" data-nt style="color:' + C.yellow + '">  0%</b></div>' +
      '<div class="hc-line" id="hcFile" data-nt></div><div class="hc-line hc-soft" id="hcStats" data-nt></div>' +
      '<div class="row" style="margin-top:8px"><span class="sp"></span><button class="btn" id="hcCancel" data-nt>' + esc(T("Abbrechen", "Annuler")) + '</button></div></div>' +
    '<div class="hc hc-p3" hidden><div class="hc-title" id="hcResT" data-nt></div><div class="hc-tree" id="hcTree"></div><div class="hc-sum" id="hcSum"></div>' +
      '<div class="row" style="margin-top:10px"><button class="btn" id="hcAgain" data-nt>' + esc(T("Nochmal prüfen", "Revérifier")) + '</button><button class="btn" id="hcNew" data-nt>' + esc(T("Neue Prüfung", "Nouvelle vérification")) + '</button><span class="sp"></span><button class="btn go" id="hcSave" data-nt>' + esc(T("Bericht speichern (TXT + CSV)", "Enregistrer le rapport (TXT + CSV)")) + '</button></div></div>';
  const q = s => $(s, sec), pages = [q(".hc-p1"), q(".hc-p2"), q(".hc-p3")];
  const showPage = i => pages.forEach((p, k) => p.hidden = k !== i);
  const bar = Balken(q("#hcBar"));
  let sel = [], marked = new Set(), job = null, res = null;

  // ----- Seite 1: Auswahl
  const say = t => { const n = q("#hcNote"); n.textContent = t || ""; n.hidden = !t; };
  function refresh(){
    let nf = 0, nd = 0; const L = q("#hcList");
    L.innerHTML = sel.length ? sel.map((s, i) => { const dir = s.kind === "folder"; dir ? nd++ : nf++;
      return '<div class="hc-item' + (marked.has(i) ? " on" : "") + '" data-i="' + i + '"><span class="hc-kind" style="' + (dir ? "color:" + C.magenta : "") + '" data-nt>' + (dir ? T("ORDNER", "DOSSIER") : T("DATEI", "FICHIER")) + '</span><span class="hc-nm" data-nt><b>' + esc(s.name) + '</b><small>' + esc(s.path) + (dir ? " · " + s.files.length + " " + T("Datei(en)", "fichier(s)") : " · " + hSize(s.files[0].file.size)) + '</small></span></div>'; }).join("")
      : '<div class="hc-empty" style="color:' + C.yellow + '">' + EMPTY + '</div>';
    q("#hcStat").textContent = T("Auswahl: " + sel.length + " Einträge   |   Dateien: " + nf + "   |   Ordner: " + nd, "Sélection : " + sel.length + " entrées   |   Fichiers : " + nf + "   |   Dossiers : " + nd);
    ["#hcRm", "#hcClr", "#hcGo"].forEach(s => q(s).disabled = !sel.length);
  }
  const keyOf = s => s.kind + "|" + s.path + "|" + (s.kind === "file" ? s.files[0].file.size + "|" + s.files[0].file.lastModified : s.files.length);
  function addEntry(s){ if (sel.some(x => keyOf(x) === keyOf(s))) { say(T("Hinweis: Dieser Eintrag ist bereits vorhanden: ", "Remarque : cette entrée existe déjà : ") + s.path); return false; } sel.push(s); return true; }
  function addFiles(files){ say(""); for (const f of files) addEntry({ kind: "file", name: f.name, path: f.name, files: [{ file: f, path: f.name }] }); refresh(); }
  function addFolderFromInput(files){ say(""); const by = {}; for (const f of files) { const rel = f.webkitRelativePath || f.name, root = rel.split("/")[0]; (by[root] = by[root] || []).push({ file: f, path: rel }); }
    for (const root in by) addEntry({ kind: "folder", name: root, path: root, files: by[root] }); refresh(); }
  q("#hcF").onclick = q("#hcDrop").onclick = () => q("#hcIF").click();
  q("#hcD").onclick = () => q("#hcID").click();
  q("#hcIF").onchange = e => { addFiles([...e.target.files]); e.target.value = ""; };
  q("#hcID").onchange = e => { addFolderFromInput([...e.target.files]); e.target.value = ""; };
  const drop = q("#hcDrop");
  ["dragenter", "dragover"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach(t => drop.addEventListener(t, () => drop.classList.remove("over")));
  drop.addEventListener("drop", async e => { e.preventDefault(); e.stopPropagation(); const items = [...(e.dataTransfer.items || [])].map(i => i.webkitGetAsEntry && i.webkitGetAsEntry()).filter(Boolean);
    if (pages[0].hidden) { res = null; showPage(0); }
    say(""); if (!items.length) { addFiles([...e.dataTransfer.files]); return; }
    for (const en of items) { try { if (en.isFile) { const f = await new Promise((ok, er) => en.file(ok, er)); addEntry({ kind: "file", name: f.name, path: f.name, files: [{ file: f, path: f.name }] }); } else { const fl = await entryFiles(en, ""); addEntry({ kind: "folder", name: en.name, path: en.name, files: fl }); } } catch (er) { say(T("Konnte nicht gelesen werden: ", "Lecture impossible : ") + en.name); } }
    refresh(); });
  q("#hcList").onclick = e => { const it = e.target.closest(".hc-item"); if (!it) return; const i = +it.dataset.i; marked.has(i) ? marked.delete(i) : marked.add(i); it.classList.toggle("on", marked.has(i)); };
  q("#hcRm").onclick = () => { sel = sel.filter((_, i) => !marked.has(i)); marked.clear(); say(""); refresh(); };
  q("#hcClr").onclick = () => { if (sel.length && confirm(T("Wirklich alle Einträge löschen?", "Vraiment supprimer toutes les entrées ?"))) { sel = []; marked.clear(); say(""); refresh(); } };
  q("#hcGo").onclick = () => pruefe();

  // ----- Seite 2: Prüfung läuft
  function log(kind, text){ const d = document.createElement("div"); d.style.color = kind === "file" ? C.green : kind === "folder" ? C.cyan : C.yellow; d.textContent = text; d.setAttribute("data-nt", ""); const L = q("#hcLog"); L.appendChild(d); L.scrollTop = L.scrollHeight; }
  q("#hcCancel").onclick = () => { if (job) { job.cancel = true; q("#hcCancel").disabled = true; q("#hcRT").textContent = T("Wird abgebrochen …", "Annulation …"); } };
  async function pruefe(){
    if (!sel.length || (job && !job.done)) return;
    q("#hcLog").innerHTML = ""; ["#hcFound", "#hcFile", "#hcStats"].forEach(s => q(s).textContent = ""); bar.set(0); q("#hcPct").textContent = "  0%";
    q("#hcRT").textContent = T("Dateien und Ordner einlesen …", "Lecture des fichiers et dossiers …"); q("#hcCancel").disabled = false; showPage(1); bar.lauf(true);
    const me = job = { cancel: false, done: false };
    // Dateien sammeln
    const files = [], seen = new Set(); let invalid = 0, folderErr = 0;
    const add = it => { const k = it.path + "|" + it.file.size + "|" + it.file.lastModified; if (!seen.has(k)) { seen.add(k); files.push(it); } };
    for (const s of sel) { if (me.cancel) break; if (s.kind === "file") { log("file", "Datei:  " + s.path); add(s.files[0]); } else { log("folder", "Ordner: " + s.path); s.files.forEach(add); } }
    const total = files.reduce((a, f) => a + f.file.size, 0);
    q("#hcFound").textContent = files.length ? T(files.length + " Datei(en) wurden gefunden.   Gesamtgröße: " + hSize(total) + "  |  Vollständige " + ALGO + "-Prüfung", files.length + " fichier(s) trouvé(s).   Taille totale : " + hSize(total) + "  |  Vérification " + ALGO + " complète") : T("Es wurden keine lesbaren Dateien gefunden.", "Aucun fichier lisible n’a été trouvé.");
    if (files.length) q("#hcRT").textContent = T("Hashes berechnen …", "Calcul des hachages …");
    const groups = new Map(), errors = []; let processed = 0, ok = 0, last = 0; const t0 = performance.now();
    async function emit(i, name, force){ const now = performance.now(); if (!force && now - last < 80) return; last = now;
      const frac = total > 0 ? processed / total : (files.length ? i / files.length : 0), el = (now - t0) / 1000;
      bar.set(frac); q("#hcPct").textContent = String(Math.floor(frac * 100)).padStart(3, " ") + "%";
      q("#hcFile").textContent = T("Datei " + i + " von " + files.length + "   |   " + name, "Fichier " + i + " sur " + files.length + "   |   " + name);
      const speed = el > 0.5 ? processed / el : 0, rest = speed > 0 ? hDur((total - processed) / speed) : "--:--";
      q("#hcStats").textContent = T("Verarbeitet: " + hSize(processed) + " / " + hSize(total) + "   |   Laufzeit: " + hDur(el) + "   |   Restzeit: " + rest, "Traité : " + hSize(processed) + " / " + hSize(total) + "   |   Durée : " + hDur(el) + "   |   Temps restant : " + rest);
      await WZ.warte(); }
    await emit(0, T("Vorbereitung...", "Préparation..."), true);
    for (let i = 0; i < files.length; i++) {
      if (me.cancel) break; const it = files[i], f = it.file, name = f.name; await emit(i, name, true);
      let digest = null, done = 0;
      try { digest = await hashFile(f, n => { processed += n; done += n; emit(i, name); }, () => me.cancel); }
      catch (e) { errors.push([it.path, e && e.name === "NotReadableError" ? T("Datei ist nicht lesbar", "Le fichier est illisible") : T(ALGO + "-Hash konnte nicht berechnet werden", "Le hachage " + ALGO + " n’a pas pu être calculé")]); processed += Math.max(0, f.size - done); continue; }
      if (me.cancel) break; processed += Math.max(0, f.size - done);
      let g = groups.get(digest); if (!g) { g = { hash: digest, size: f.size, paths: [], dates: [] }; groups.set(digest, g); } g.paths.push(it.path); g.dates.push(hDate(f.lastModified)); ok++; await emit(i + 1, name, true);
    }
    const out = { groups: [...groups.values()], errors, file_count: files.length, ok, invalid, folder_errors: folderErr, processed, total, duration: (performance.now() - t0) / 1000, cancelled: me.cancel };
    me.done = true; bar.lauf(false); zeigeErgebnis(out);
  }

  // ----- Seite 3: Ergebnis
  function stat(r){ const dup = r.groups.filter(g => g.paths.length > 1), single = r.groups.filter(g => g.paths.length === 1);
    return { dup_groups: dup.length, dup_files: dup.reduce((a, g) => a + g.paths.length, 0), extra: dup.reduce((a, g) => a + g.paths.length - 1, 0), single: single.length, reclaim: dup.reduce((a, g) => a + (g.paths.length - 1) * g.size, 0) }; }
  function zeigeErgebnis(r){
    res = r; const st = stat(r), t = q("#hcResT"); let txt, col;
    if (r.cancelled) { txt = T("Prüfung abgebrochen – Ergebnis bis zum Abbruch", "Vérification annulée – résultat jusqu’à l’annulation"); col = C.yellow; }
    else if (!r.file_count) { txt = T("Es wurden keine lesbaren Dateien gefunden.", "Aucun fichier lisible n’a été trouvé."); col = C.red; }
    else if (st.dup_groups) { txt = T(st.dup_groups + " Gruppe(n) mit identischen Dateien – " + hSize(st.reclaim) + " möglicherweise freigebbar", st.dup_groups + " groupe(s) de fichiers identiques – " + hSize(st.reclaim) + " potentiellement libérables"); col = C.red; }
    else { txt = T("Keine identischen Dateien gefunden.", "Aucun fichier identique trouvé."); col = C.green; }
    t.textContent = txt; t.style.color = col;
    const dup = r.groups.filter(g => g.paths.length > 1), single = r.groups.filter(g => g.paths.length === 1); let h = "";
    const cp = (label, val) => '<button class="hc-cp" data-c="' + esc(val) + '" data-nt title="' + esc(label) + '">⧉ ' + esc(label) + '</button>';
    const row = (p, size, date, hash) => '<div class="hc-r"><span class="hc-rp" data-nt title="' + esc(p) + '">' + esc(p) + '</span><span class="hc-rs" data-nt>' + hSize(size) + '</span><span class="hc-rd" data-nt>' + esc(date.slice(0, 19)) + '</span><span class="hc-rh" data-nt title="' + hash + '">' + hash.slice(0, 12) + '…</span><span class="hc-ra">' + cp(T("Pfad", "Chemin"), p) + cp("Hash", hash) + '</span></div>';
    const sect = (title, col2, open, inner) => '<details class="hc-sec"' + (open ? " open" : "") + '><summary style="color:' + col2 + '" data-nt>' + esc(title) + '</summary>' + inner + '</details>';
    let inner = ""; if (!dup.length) inner = '<div class="hc-r" style="color:' + C.green + '" data-nt>' + esc(T("Keine identischen Dateien gefunden.", "Aucun fichier identique trouvé.")) + '</div>';
    dup.forEach((g, n) => { inner += '<details class="hc-grp"' + (dup.length <= 30 ? " open" : "") + '><summary data-nt><b style="color:' + C.red + '">' + esc(T("Duplikatgruppe " + (n + 1) + "  ·  " + g.paths.length + "×", "Groupe de doublons " + (n + 1) + "  ·  " + g.paths.length + "×")) + '</b> <span class="hc-rs">' + hSize(g.size) + '</span> <span class="hc-rh" title="' + g.hash + '">' + g.hash.slice(0, 12) + '…</span> ' + cp("Hash", g.hash) + '</summary>' + g.paths.map((p, k) => row(p, g.size, g.dates[k], g.hash)).join("") + '</details>'; });
    h += sect(T("IDENTISCHE DATEIEN  (" + dup.length + " Gruppen)", "FICHIERS IDENTIQUES  (" + dup.length + " groupes)"), C.red, true, inner);
    h += sect(T("DATEIEN OHNE DUPLIKAT  (" + single.length + ")", "FICHIERS SANS DOUBLON  (" + single.length + ")"), C.green, single.length <= 200, single.map(g => row(g.paths[0], g.size, g.dates[0], g.hash)).join(""));
    if (r.errors.length) h += sect(T("FEHLER BEI DER HASH-BERECHNUNG  (" + r.errors.length + ")", "ERREURS DE CALCUL DU HACHAGE  (" + r.errors.length + ")"), C.yellow, true, r.errors.map(e => '<div class="hc-r"><span class="hc-rp" data-nt>' + esc(e[0]) + '</span><span style="color:' + C.yellow + '" data-nt>' + esc(e[1]) + '</span></div>').join(""));
    q("#hcTree").innerHTML = h;
    const rows = [[T("Eingelesene Dateien", "Fichiers lus"), r.file_count, null], [T("Erfolgreich berechnete Hashes", "Hachages calculés avec succès"), r.ok, C.green], [T("Unterschiedliche Hashwerte", "Valeurs de hachage différentes"), r.groups.length, C.cyan],
      [T("Gruppen mit identischen Dateien", "Groupes de fichiers identiques"), st.dup_groups, C.red], [T("Dateien in Duplikatgruppen", "Fichiers dans des groupes de doublons"), st.dup_files, C.red], [T("Zusätzliche Duplikatdateien", "Fichiers en double supplémentaires"), st.extra, C.magenta],
      [T("Dateien ohne Duplikat", "Fichiers sans doublon"), st.single, C.green], [T("Möglicherweise freigebbarer Platz", "Espace potentiellement libérable"), hSize(st.reclaim), C.yellow], [T("Gesamte geprüfte Datenmenge", "Volume total vérifié"), hSize(r.processed), C.cyan],
      [T("Fehler bei Hashberechnung", "Erreurs de calcul du hachage"), r.errors.length, C.yellow], [T("Ungültige oder unlesbare Pfade", "Chemins invalides ou illisibles"), r.invalid, C.yellow], [T("Ordner-Lesefehler", "Erreurs de lecture de dossier"), r.folder_errors, C.yellow], [T("Gesamtdauer", "Durée totale"), hDur(r.duration), C.cyan]];
    q("#hcSum").innerHTML = rows.map(x => '<div class="hc-sr" data-nt><span class="hc-soft">' + esc(x[0]) + ':</span> <b' + (x[2] ? ' style="color:' + x[2] + '"' : "") + '>' + esc(String(x[1])) + '</b></div>').join("");
    q("#hcSave").disabled = !r.groups.length; showPage(2);
  }
  q("#hcTree").onclick = e => { const b = e.target.closest(".hc-cp"); if (!b) return; e.preventDefault(); const v = b.dataset.c; const ok = () => { const o = b.textContent; b.textContent = "✓"; setTimeout(() => b.textContent = o, 900); };
    (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(ok, () => { const ta = document.createElement("textarea"); ta.value = v; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); ok(); } catch (x) {} ta.remove(); }); };
  q("#hcAgain").onclick = () => pruefe();
  q("#hcNew").onclick = () => { sel = []; marked.clear(); res = null; say(""); refresh(); showPage(0); };

  // ----- Bericht (TXT + CSV, im Ordner HashPruefer_<Zeit> als ZIP)
  function csvZelle(x){ return '"' + String(x).replace(/"/g, '""') + '"'; }
  async function bericht(){
    if (!res) return; const r = res, st = stat(r), now = new Date(), stamp = now.getFullYear() + "-" + p2(now.getMonth() + 1) + "-" + p2(now.getDate()) + "_" + p2(now.getHours()) + "-" + p2(now.getMinutes()) + "-" + p2(now.getSeconds()), ordner = "HashPruefer_" + stamp;
    const csv = ["Hash", "Pfad", "Name", "Groesse_Bytes", "Groesse", "Geaendert", "Anzahl_in_Gruppe"].map(csvZelle).join(";") + "\r\n" +
      r.groups.map(g => g.paths.map((p, k) => [g.hash, p, p.split("/").pop(), g.size, hSize(g.size), g.dates[k], g.paths.length].map(csvZelle).join(";") + "\r\n").join("")).join("");
    const line = "=".repeat(60), small = "-".repeat(30), o = [PROGRAM, T("Version: ", "Version : ") + VERSION, T("Stand: ", "Date : ") + RELEASE, T("Entwickelt von: ", "Développé par : ") + AUTHOR,
      T("Bericht erstellt: ", "Rapport créé : ") + p2(now.getDate()) + "." + p2(now.getMonth() + 1) + "." + now.getFullYear() + " " + p2(now.getHours()) + ":" + p2(now.getMinutes()) + ":" + p2(now.getSeconds()), "",
      line, center(" " + T("ZUSAMMENFASSUNG", "RÉSUMÉ") + " ", 60), line,
      T("Eingelesene Dateien: ", "Fichiers lus : ") + r.file_count, T("Erfolgreiche Hashes: ", "Hachages réussis : ") + r.ok, T("Unterschiedliche Hashwerte: ", "Valeurs de hachage différentes : ") + r.groups.length,
      T("Duplikatgruppen: ", "Groupes de doublons : ") + st.dup_groups, T("Einzeldateien: ", "Fichiers uniques : ") + st.single, T("Freigebbarer Platz: ", "Espace libérable : ") + hSize(st.reclaim), T("Dauer: ", "Durée : ") + hDur(r.duration), ""];
    let nd = 0, ns = 0;
    for (const g of r.groups) { let title; if (g.paths.length > 1) { nd++; title = T("DUPLIKATGRUPPE ", "GROUPE DE DOUBLONS ") + nd; } else { ns++; title = T("EINZELDATEI ", "FICHIER UNIQUE ") + ns; }
      o.push(small, center(" " + title + " ", 30), small, "Hash: " + g.hash, T("Anzahl: ", "Nombre : ") + g.paths.length, T("Dateigroesse: ", "Taille : ") + hSize(g.size));
      g.paths.forEach((p, k) => o.push(T("Pfad: ", "Chemin : ") + p, T("Geaendert: ", "Modifié : ") + g.dates[k])); o.push(""); }
    if (r.errors.length) { o.push(line, center(" " + T("FEHLER BEI DER HASH-BERECHNUNG", "ERREURS DE CALCUL DU HACHAGE") + " ", 60), line); for (const e of r.errors) o.push(T("Datei:  ", "Fichier : ") + e[0], T("Fehler: ", "Erreur : ") + e[1], ""); }
    const z = new JSZip(); z.file(ordner + "/HashBericht.txt", o.join("\n") + "\n"); z.file(ordner + "/HashErgebnisse.csv", "﻿" + csv);
    WZ.speichern(await z.generateAsync({ type: "blob" }), ordner + ".zip");
  }
  q("#hcSave").onclick = bericht;
  refresh(); showPage(0);
}});
})();

// ------------------------------------------------------------------ Aufbau der Seite
function start(o){
  o = o || {}; const LIST = TOOLS.filter(o.filter || (t => !t.gruppe));
  const grid = $("#toolgrid"), host = $("#toolhost");
  const secs = {};
  grid.innerHTML = o.gitter ? o.gitter(LIST) : LIST.map(t => '<a class="tcard" href="#' + t.id + '" data-id="' + t.id + '"><span class="ts" style="background:' + t.farbe + '">' + t.sym + '</span><span><b>' + esc(t.titel) + '</b><small>' + esc(t.text) + '</small></span></a>').join("");
  function zeige(id){
    const t = LIST.find(x => x.id === id);
    grid.querySelectorAll(".tcard").forEach(a => a.classList.toggle("on", a.dataset.id === id));
    host.innerHTML = "";
    if (!t) { host.innerHTML = '<p class="muted">Wähle oben ein Werkzeug. Deine Dateien bleiben die ganze Zeit auf deinem Gerät.</p>'; return; }
    const card = document.createElement("div"); card.className = "card toolcard"; card.innerHTML = '<h2 style="margin-top:0"><span class="ts" style="background:' + t.farbe + '">' + t.sym + '</span> ' + esc(t.titel) + '</h2><p class="sub" style="margin-bottom:12px">' + esc(t.text) + '</p><div class="sec"></div>';
    host.appendChild(card); try { t.build($(".sec", card)); } catch (e) { console.error(e); $(".sec", card).textContent = "Fehler beim Aufbau: " + e.message; }
    document.title = t.titel + " – Datei-Werkstatt – Oratio";
    if (history.state !== "x") card.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  window.addEventListener("hashchange", () => zeige(location.hash.slice(1)));
  zeige(location.hash.slice(1));
}
// Tür für weitere Werkzeuge: eigene Datei (z. B. medien.js) nach datei.js laden und mit DateiWerkstatt.tool({ id, titel, sym, farbe, text, build(sec){…} }) anmelden.
window.DateiWerkstatt = { start, TOOLS, tool, Liste, Ausgabe, wrapRun, fehler, esc, G, toBlob, readAB };
})();
