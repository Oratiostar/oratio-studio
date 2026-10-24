// Word <-> PDF im Browser: .docx lesen und als PDF zeichnen, Text als .docx schreiben.
// Nutzt nur JSZip und pdf-lib (beide liegen lokal im Ordner lib/). Keine Verbindung zu fremden Servern.
(function(){
  const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  const EMU_PT = 12700;
  const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  // ================================================================ Word-Datei lesen
  async function leseDocx(ab){
    const zip = await JSZip.loadAsync(ab);
    const docF = zip.file("word/document.xml");
    if (!docF) throw new Error("Das ist keine gültige Word-Datei (.docx). Alte .doc-Dateien bitte erst in Word als .docx speichern.");
    const parse = async p => { const f = zip.file(p); return f ? new DOMParser().parseFromString(await f.async("string"), "application/xml") : null; };
    const doc = await parse("word/document.xml");
    const styles = await parse("word/styles.xml");
    const numbering = await parse("word/numbering.xml");
    const rels = await parse("word/_rels/document.xml.rels");
    const relMap = {};
    if (rels) for (const r of rels.getElementsByTagName("Relationship")) relMap[r.getAttribute("Id")] = r.getAttribute("Target");
    const el = (n, ln) => { for (const c of n.children) if (c.localName === ln) return c; return null; };
    const attr = (n, a) => n ? (n.getAttributeNS(W_NS, a) ?? n.getAttribute("w:" + a)) : null;

    // Formatvorlagen: Name, Basis, Absatz-/Zeichen-Eigenschaften
    const stil = {};
    if (styles) for (const s of styles.getElementsByTagNameNS(W_NS, "style")) {
      const id = attr(s, "styleId"); const nm = el(s, "name"), bo = el(s, "basedOn");
      stil[id] = { name: (attr(nm, "val") || "").toLowerCase(), basedOn: bo ? attr(bo, "val") : null, pPr: el(s, "pPr"), rPr: el(s, "rPr") };
    }
    let defaults = null;
    if (styles){ const dd = styles.getElementsByTagNameNS(W_NS, "docDefaults")[0]; if (dd){ const rd = el(dd,"rPrDefault"); defaults = rd ? el(rd,"rPr") : null; } }
    function rprOf(rPr, base){
      const o = Object.assign({}, base);
      if (!rPr) return o;
      const on = n => { const e = el(rPr, n); if (!e) return undefined; const v = attr(e, "val"); return !(v === "0" || v === "false"); };
      const b = on("b"), i = on("i"), u = el(rPr, "u"), st = on("strike"), caps = on("caps");
      if (b !== undefined) o.b = b; if (i !== undefined) o.i = i; if (st !== undefined) o.strike = st; if (caps !== undefined) o.caps = caps;
      if (u) o.u = attr(u, "val") !== "none";
      const sz = el(rPr, "sz"); if (sz) o.sz = (+attr(sz, "val")) / 2;
      const col = el(rPr, "color"); if (col && attr(col, "val") && attr(col, "val") !== "auto") o.color = attr(col, "val");
      const rf = el(rPr, "rFonts"); if (rf) o.font = attr(rf, "ascii") || attr(rf, "hAnsi") || o.font;
      const va = el(rPr, "vertAlign"); if (va) o.va = attr(va, "val");
      return o;
    }
    function stilChain(id){ const out = []; let g = 0; while (id && stil[id] && g++ < 12){ out.unshift(stil[id]); id = stil[id].basedOn; } return out; }
    const baseR = rprOf(defaults, { sz: 11, font: "Calibri" });
    function absatzProps(pPr){
      const o = { jc: "left", before: 0, after: 8, line: 1.15, ind: 0, first: 0, head: 0, num: null, pbb: false, keep: false };
      let rBase = Object.assign({}, baseR);
      let chain = [];
      const sid = pPr && el(pPr, "pStyle") ? attr(el(pPr, "pStyle"), "val") : null;
      chain = stilChain(sid || Object.keys(stil).find(k => stil[k].name === "normal"));
      const apply = pp => {
        if (!pp) return;
        const jc = el(pp, "jc"); if (jc) { const v = attr(jc, "val"); o.jc = v === "both" ? "justify" : v === "center" ? "center" : (v === "right" || v === "end") ? "right" : "left"; }
        const sp = el(pp, "spacing");
        if (sp) { const b = attr(sp, "before"), a = attr(sp, "after"), l = attr(sp, "line"), lr = attr(sp, "lineRule");
          if (b != null) o.before = +b / 20; if (a != null) o.after = +a / 20; if (l != null) o.line = (lr === "exact" || lr === "atLeast") ? Math.max(1, +l / 20 / (rBase.sz || 11)) : +l / 240; }
        const ind = el(pp, "ind");
        if (ind) { const l = attr(ind, "left") ?? attr(ind, "start"), f = attr(ind, "firstLine"), h = attr(ind, "hanging"); if (l != null) o.ind = +l / 20; if (f != null) o.first = +f / 20; if (h != null) o.first = -(+h / 20); }
        const nl = el(pp, "outlineLvl"); if (nl) o.head = +attr(nl, "val") + 1;
        if (el(pp, "pageBreakBefore")) o.pbb = true;
        const np = el(pp, "numPr"); if (np) { const ni = el(np, "numId"), il = el(np, "ilvl"); o.num = { id: ni ? attr(ni, "val") : "0", lvl: il ? +attr(il, "val") : 0 }; if (o.num.id === "0") o.num = null; }
      };
      for (const s of chain) { apply(s.pPr); rBase = rprOf(s.rPr, rBase); if (/^(heading|überschrift)\s*(\d)/.test(s.name)) o.head = +s.name.match(/(\d)/)[1]; if (s.name === "title" || s.name === "titel") o.head = 1; }
      apply(pPr);
      return { o, rBase };
    }
    // Nummerierung
    const nums = {};
    if (numbering) {
      const abs = {};
      for (const a of numbering.getElementsByTagNameNS(W_NS, "abstractNum")) {
        const lv = {}; for (const l of a.getElementsByTagNameNS(W_NS, "lvl")) { const f = el(l, "numFmt"), t = el(l, "lvlText"), s = el(l, "start"); lv[+attr(l, "ilvl")] = { fmt: f ? attr(f, "val") : "decimal", text: t ? attr(t, "val") : "%1.", start: s ? +attr(s, "val") : 1 }; }
        abs[attr(a, "abstractNumId")] = lv;
      }
      for (const n of numbering.getElementsByTagNameNS(W_NS, "num")) { const a = el(n, "abstractNumId"); nums[attr(n, "numId")] = abs[a ? attr(a, "val") : ""] || {}; }
    }
    const zaehler = {};
    function marke(num){
      const lv = (nums[num.id] || {})[num.lvl];
      if (!lv) return "•";
      if (lv.fmt === "bullet") return "•";
      const k = num.id; zaehler[k] = zaehler[k] || [];
      const z = zaehler[k]; while (z.length > num.lvl + 1) z.pop();
      while (z.length < num.lvl + 1) z.push((((nums[num.id] || {})[z.length] || {}).start || 1) - 1);
      z[num.lvl]++;
      const f = (v) => lv.fmt === "lowerLetter" ? String.fromCharCode(96 + ((v - 1) % 26) + 1) : lv.fmt === "upperLetter" ? String.fromCharCode(64 + ((v - 1) % 26) + 1) : lv.fmt === "lowerRoman" ? roemisch(v).toLowerCase() : lv.fmt === "upperRoman" ? roemisch(v) : String(v);
      return (lv.text || "%1.").replace(/%(\d)/g, (_, d) => { const idx = +d - 1; return idx === num.lvl ? f(z[idx]) : String(z[idx] ?? 1); });
    }
    function roemisch(n){ const m = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]]; let s = ""; for (const [v,r] of m) while (n >= v){ s += r; n -= v; } return s; }

    const bilder = {};
    async function bild(rid){
      if (bilder[rid] !== undefined) return bilder[rid];
      const t = relMap[rid]; bilder[rid] = null; if (!t) return null;
      const f = zip.file("word/" + t.replace(/^\//, "").replace(/^word\//, "")) || zip.file(t.replace(/^\//, ""));
      if (!f) return null;
      const bytes = await f.async("uint8array"); const ext = t.split(".").pop().toLowerCase();
      bilder[rid] = { bytes, ext }; return bilder[rid];
    }

    async function absatz(p, rBaseOverride){
      const pPr = el(p, "pPr");
      const { o, rBase } = absatzProps(pPr);
      const abs = { type: "p", props: o, runs: [], marke: o.num ? marke(o.num) : null };
      const base = rBaseOverride || rBase;
      const rStyleMap = id => stilChain(id).reduce((acc, s) => rprOf(s.rPr, acc), {});
      async function laeufe(node, inherit){
        for (const c of node.children) {
          if (c.localName === "r") {
            let rp = rprOf(el(c, "rPr"), inherit);
            const rs = el(c, "rPr") && el(el(c, "rPr"), "rStyle"); if (rs) rp = Object.assign({}, rprOf(null, rp), rStyleMap(attr(rs, "val")), rprOf(el(c, "rPr"), {}));
            if (o.head && rp.sz === baseR.sz && !rp._sz) { /* Standardgroesse der Ueberschrift kommt aus der Vorlage */ }
            for (const x of c.children) {
              if (x.localName === "t") abs.runs.push(Object.assign({ t: x.textContent }, rp));
              else if (x.localName === "tab") abs.runs.push(Object.assign({ t: "    " }, rp));
              else if (x.localName === "br") abs.runs.push({ br: attr(x, "type") === "page" ? "page" : "line" });
              else if (x.localName === "drawing" || x.localName === "pict") {
                const bl = x.getElementsByTagNameNS("http://schemas.openxmlformats.org/drawingml/2006/main", "blip")[0];
                const ex = x.getElementsByTagNameNS("http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing", "extent")[0];
                if (bl) { const rid = bl.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "embed"); const im = rid && await bild(rid);
                  if (im) abs.runs.push({ img: im, w: ex ? +ex.getAttribute("cx") / EMU_PT : 200, h: ex ? +ex.getAttribute("cy") / EMU_PT : 150 }); }
              }
            }
          } else if (c.localName === "hyperlink" || c.localName === "smartTag" || c.localName === "sdt" || c.localName === "sdtContent" || c.localName === "ins") {
            await laeufe(c, Object.assign({}, inherit, c.localName === "hyperlink" ? { color: "0563C1", u: true } : {}));
          }
        }
      }
      await laeufe(p, base);
      abs.base = base;
      return abs;
    }
    async function tabelle(tbl){
      const t = { type: "tbl", cols: [], rows: [] };
      const grid = el(tbl, "tblGrid"); if (grid) for (const g of grid.children) t.cols.push(+attr(g, "w") / 20);
      for (const tr of tbl.children) if (tr.localName === "tr") {
        const row = [];
        for (const tc of tr.children) if (tc.localName === "tc") {
          const cell = { blocks: [], span: 1 };
          const tcPr = el(tc, "tcPr"); const gs = tcPr && el(tcPr, "gridSpan"); if (gs) cell.span = +attr(gs, "val");
          const shd = tcPr && el(tcPr, "shd"); if (shd && attr(shd, "fill") && attr(shd, "fill") !== "auto") cell.fill = attr(shd, "fill");
          for (const b of tc.children) { if (b.localName === "p") cell.blocks.push(await absatz(b)); else if (b.localName === "tbl") cell.blocks.push(await tabelle(b)); }
          row.push(cell);
        }
        t.rows.push(row);
      }
      return t;
    }
    const body = doc.getElementsByTagNameNS(W_NS, "body")[0];
    const bloecke = [];
    for (const b of body.children) { if (b.localName === "p") bloecke.push(await absatz(b)); else if (b.localName === "tbl") bloecke.push(await tabelle(b)); }
    // Seite
    let seite = { w: 595.28, h: 841.89, l: 70.9, r: 70.9, t: 70.9, b: 70.9 };
    const sp = body.getElementsByTagNameNS(W_NS, "sectPr"); const sect = sp.length ? sp[sp.length - 1] : null;
    if (sect) { const ps = el(sect, "pgSz"), pm = el(sect, "pgMar");
      if (ps && attr(ps, "w")) { seite.w = +attr(ps, "w") / 20; seite.h = +attr(ps, "h") / 20; }
      if (pm) { const g = n => attr(pm, n) != null ? +attr(pm, n) / 20 : null; seite.l = g("left") ?? seite.l; seite.r = g("right") ?? seite.r; seite.t = g("top") ?? seite.t; seite.b = g("bottom") ?? seite.b; } }
    return { bloecke, seite, baseR };
  }

  // ================================================================ als PDF zeichnen
  const HEAD_SZ = { 1: 20, 2: 16, 3: 14, 4: 12, 5: 11, 6: 11 };
  async function zuPdf(model, opt){
    opt = opt || {};
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const pdf = await PDFDocument.create();
    const F = {};
    async function font(familie, b, i){
      const fam = /times|georgia|cambria|garamond|serif|minion|palatino|book/i.test(familie || "") && !/sans/i.test(familie || "") ? "T" : /courier|consolas|mono|menlo|code/i.test(familie || "") ? "C" : "H";
      const key = fam + (b ? "b" : "") + (i ? "i" : "");
      if (!F[key]) { const m = { H: ["Helvetica","HelveticaBold","HelveticaOblique","HelveticaBoldOblique"], T: ["TimesRoman","TimesRomanBold","TimesRomanItalic","TimesRomanBoldItalic"], C: ["Courier","CourierBold","CourierOblique","CourierBoldOblique"] }[fam];
        F[key] = await pdf.embedFont(StandardFonts[m[(b ? 1 : 0) + (i ? 2 : 0)]]); }
      return F[key];
    }
    const S = model.seite, innerW = S.w - S.l - S.r;
    let page = null, y = 0;
    const neu = () => { page = pdf.addPage([S.w, S.h]); y = S.h - S.t; };
    neu();
    const safe = (f, t) => { let o = ""; for (const ch of t.replace(/ /g, " ").replace(/[‐‑]/g, "-").replace(/•/g, "•")) { try { f.encodeText(ch); o += ch; } catch (e) { o += ch.charCodeAt(0) > 0x2fff ? "?" : "?"; } } return o; };
    const col = c => { if (!c || c.length !== 6) return rgb(0, 0, 0); return rgb(parseInt(c.slice(0,2),16)/255, parseInt(c.slice(2,4),16)/255, parseInt(c.slice(4,6),16)/255); };
    const imgCache = new Map();
    async function einbetten(im){
      if (imgCache.has(im)) return imgCache.get(im);
      let r = null;
      try {
        if (im.ext === "png") r = await pdf.embedPng(im.bytes); else if (im.ext === "jpg" || im.ext === "jpeg") r = await pdf.embedJpg(im.bytes);
        else { const bmp = await createImageBitmap(new Blob([im.bytes])); const c = document.createElement("canvas"); c.width = bmp.width; c.height = bmp.height; c.getContext("2d").drawImage(bmp, 0, 0); const b = await new Promise(rr => c.toBlob(rr, "image/png")); r = await pdf.embedPng(new Uint8Array(await b.arrayBuffer())); }
      } catch (e) { r = null; }
      imgCache.set(im, r); return r;
    }
    // Absatz -> Zeilen
    async function zeilen(ab, breite, links){
      const base = ab.base || model.baseR, head = ab.props.head;
      const items = []; // {w, text, f, size, color, u, strike, img?, br?}
      for (const r of ab.runs) {
        if (r.br) { items.push({ br: r.br }); continue; }
        if (r.img) { const e = await einbetten(r.img); if (e) { const sc = Math.min(1, breite / r.w); items.push({ img: e, w: r.w * sc, h: r.h * sc, word: false }); } continue; }
        let size = r.sz || base.sz || 11; if (head && (!r.sz || r.sz === baseR_sz())) size = Math.max(size, HEAD_SZ[head] || size);
        const f = await font(r.font || base.font, r.b || (head && head < 4 && r.b !== false), r.i);
        let txt = r.t; if (r.caps) txt = txt.toUpperCase();
        if (r.va) size *= 0.7;
        const parts = txt.split(/(\s+)/).filter(x => x !== "");
        for (const w of parts) { const t = safe(f, w); items.push({ text: t, f, size, color: r.color, u: r.u, strike: r.strike, w: f.widthOfTextAtSize(t, size), space: /^\s+$/.test(w), va: r.va }); }
      }
      const lines = []; let cur = { items: [], w: 0, h: 0, img: 0 }; let maxW = breite;
      const flush = () => { lines.push(cur); cur = { items: [], w: 0, h: 0, img: 0 }; };
      for (const it of items) {
        if (it.br === "line") { cur.forced = true; flush(); continue; }
        if (it.br === "page") { lines.push({ pageBreak: true, items: [], w: 0, h: 0 }); continue; }
        if (it.img) { if (cur.w + it.w > maxW && cur.items.length) flush(); cur.items.push(it); cur.w += it.w; cur.img = Math.max(cur.img, it.h); continue; }
        if (it.space && !cur.items.length) continue;
        if (cur.w + it.w > maxW + 0.01 && cur.items.length && !it.space) {
          while (cur.items.length && cur.items[cur.items.length - 1].space) { cur.w -= cur.items.pop().w; }
          flush();
        }
        cur.items.push(it); cur.w += it.w; cur.h = Math.max(cur.h, it.size || 0);
      }
      if (cur.items.length || !lines.length) flush();
      return lines;
    }
    const baseR_sz = () => model.baseR.sz || 11;
    async function zeichneAbsatz(ab, x0, breite, opt2){
      const p = ab.props; const ind = ab.marke && !p.ind ? 26 : p.ind; const left = x0 + ind, w = breite - ind;
      if (p.pbb && y < S.h - S.t - 1) neu();
      const ls = await zeilen(ab, w - (p.first > 0 ? p.first : 0), left);
      const kopf = ab.base.sz || 11;
      if (!(opt2 && opt2.inCell)) y -= p.before * 0.8;
      let first = true;
      for (const ln of ls) {
        if (ln.pageBreak) { neu(); continue; }
        const lh = Math.max((ln.h || kopf) * p.line * 1.05, ln.img ? ln.img + 2 : 0);
        if (y - lh < S.b) { neu(); }
        y -= lh;
        const indent = first ? p.first : (p.first < 0 ? 0 : 0);
        let xs = left + (first && p.first > 0 ? p.first : 0) + (first || p.first >= 0 ? 0 : 0);
        if (first && p.first < 0) xs = left + p.first;
        if (!first && p.first < 0) xs = left;
        const avail = w - (first && p.first > 0 ? p.first : 0) - (first && p.first < 0 ? 0 : 0);
        let off = 0;
        if (p.jc === "center") off = (avail - ln.w) / 2; else if (p.jc === "right") off = avail - ln.w;
        let spaceExtra = 0;
        if (p.jc === "justify" && !ln.forced && ln !== ls[ls.length - 1]) { const nsp = ln.items.filter(i => i.space).length; if (nsp) spaceExtra = (avail - ln.w) / nsp; }
        let x = xs + Math.max(0, off);
        if (first && ab.marke) { const f = await font(ab.base.font, false, false); const t = safe(f, ab.marke); page.drawText(t, { x: left - Math.min(22, f.widthOfTextAtSize(t, kopf) + 6), y: y + lh * 0.18, size: kopf, font: f, color: rgb(0, 0, 0) }); }
        for (const it of ln.items) {
          if (it.img) { page.drawImage(it.img, { x, y: y - 2, width: it.w, height: it.h }); x += it.w; continue; }
          const wdt = it.w + (it.space ? spaceExtra : 0);
          if (!it.space) { page.drawText(it.text, { x, y: y + (it.va === "superscript" ? it.size * 0.5 : it.va === "subscript" ? -it.size * 0.2 : 0) + lh * 0.18, size: it.size, font: it.f, color: col(it.color) });
            if (it.u) page.drawLine({ start: { x, y: y + lh * 0.1 }, end: { x: x + it.w, y: y + lh * 0.1 }, thickness: Math.max(0.5, it.size / 18), color: col(it.color) });
            if (it.strike) page.drawLine({ start: { x, y: y + lh * 0.38 }, end: { x: x + it.w, y: y + lh * 0.38 }, thickness: Math.max(0.5, it.size / 18), color: col(it.color) }); }
          else if (it.u && ln.items.indexOf(it) < ln.items.length - 1) page.drawLine({ start: { x, y: y + lh * 0.1 }, end: { x: x + wdt, y: y + lh * 0.1 }, thickness: 0.5, color: col(it.color) });
          x += wdt;
        }
        first = false;
      }
      if (!(opt2 && opt2.inCell)) y -= p.after * 0.9;
    }
    async function hoeheAbsatz(ab, breite){ // fuer Tabellen: Hoehe vorab messen
      const p = ab.props; const ls = await zeilen(ab, breite - p.ind); const kopf = ab.base.sz || 11; let h = 0;
      for (const ln of ls) h += Math.max((ln.h || kopf) * p.line * 1.05, ln.img ? ln.img + 2 : 0); return h;
    }
    async function zeichneTabelle(t, x0, breite){
      const ncols = Math.max(1, t.cols.length || Math.max(...t.rows.map(r => r.reduce((a, c) => a + c.span, 0))));
      let cols = t.cols.length ? t.cols.slice() : Array(ncols).fill(breite / ncols);
      const sum = cols.reduce((a, b) => a + b, 0); cols = cols.map(c => c * breite / sum);
      const pad = 4;
      for (const row of t.rows) {
        let ci = 0; const cells = [];
        for (const cell of row) { let w = 0; for (let k = 0; k < cell.span; k++) w += cols[ci + k] || 0; cells.push({ cell, x: x0 + cols.slice(0, ci).reduce((a, b) => a + b, 0), w }); ci += cell.span; }
        let hmax = 14;
        for (const c of cells) { let h = pad * 2; for (const b of c.cell.blocks) h += b.type === "p" ? await hoeheAbsatz(b, c.w - pad * 2) : 20; hmax = Math.max(hmax, h); }
        if (y - hmax < S.b) neu();
        const top = y;
        for (const c of cells) {
          if (c.cell.fill) page.drawRectangle({ x: c.x, y: top - hmax, width: c.w, height: hmax, color: col(c.cell.fill) });
          page.drawRectangle({ x: c.x, y: top - hmax, width: c.w, height: hmax, borderColor: rgb(0.45, 0.45, 0.45), borderWidth: 0.6 });
          let yy = top - pad; const keep = y; y = yy;
          for (const b of c.cell.blocks) if (b.type === "p") await zeichneAbsatz(b, c.x + pad, c.w - pad * 2, { inCell: true });
          y = keep;
        }
        y = top - hmax;
      }
      y -= 8;
    }
    for (const b of model.bloecke) { if (b.type === "p") await zeichneAbsatz(b, S.l, innerW); else await zeichneTabelle(b, S.l, innerW); }
    pdf.setProducer("Oratio Studio – Datei-Werkstatt"); pdf.setCreator("Oratio Studio");
    return pdf.save({ useObjectStreams: true });
  }

  // Reiner Text (.txt) als Modell
  function textModell(text, monospace){
    const base = { sz: 11, font: monospace ? "Courier New" : "Calibri" };
    const bl = text.replace(/\r\n?/g, "\n").split("\n").map(z => ({ type: "p", props: { jc: "left", before: 0, after: 0, line: 1.15, ind: 0, first: 0, head: 0, num: null, pbb: false }, runs: [Object.assign({ t: z }, base)], marke: null, base }));
    return { bloecke: bl, seite: { w: 595.28, h: 841.89, l: 62, r: 62, t: 62, b: 62 }, baseR: base };
  }

  // ================================================================ Absaetze als .docx schreiben
  // paras: [{ text | runs:[{t,b,i}], head:0..3, size, pageBreak, align }]
  async function schreibeDocx(paras, titel){
    const zip = new JSZip();
    zip.file("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>');
    zip.file("_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>');
    zip.file("docProps/core.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>' + esc(titel || "") + '</dc:title></cp:coreProperties>');
    zip.file("word/_rels/document.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
    zip.file("word/styles.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="' + W_NS + '"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:lang w:val="de-DE"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
      '<w:style w:type="paragraph" w:default="1" w:styleId="Standard"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
      [1, 2, 3].map(n => '<w:style w:type="paragraph" w:styleId="berschrift' + n + '"><w:name w:val="heading ' + n + '"/><w:basedOn w:val="Standard"/><w:next w:val="Standard"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="' + (240 - n * 30) + '" w:after="80"/><w:outlineLvl w:val="' + (n - 1) + '"/></w:pPr><w:rPr><w:b/><w:sz w:val="' + [40, 32, 28][n - 1] + '"/></w:rPr></w:style>').join("") + '</w:styles>');
    let b = "";
    for (const p of paras) {
      let ppr = ""; if (p.head) ppr += '<w:pStyle w:val="berschrift' + p.head + '"/>'; if (p.pageBreak) ppr += '<w:pageBreakBefore/>'; if (p.align) ppr += '<w:jc w:val="' + p.align + '"/>';
      const runs = p.runs || [{ t: p.text || "" }];
      b += "<w:p>" + (ppr ? "<w:pPr>" + ppr + "</w:pPr>" : "") + runs.map(r => "<w:r>" + ((r.b || r.i || r.sz) ? "<w:rPr>" + (r.b ? "<w:b/>" : "") + (r.i ? "<w:i/>" : "") + (r.sz ? '<w:sz w:val="' + Math.round(r.sz * 2) + '"/>' : "") + "</w:rPr>" : "") + '<w:t xml:space="preserve">' + esc(r.t.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")) + "</w:t></w:r>").join("") + "</w:p>";
    }
    zip.file("word/document.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="' + W_NS + '"><w:body>' + b + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1417" w:right="1417" w:bottom="1134" w:left="1417" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>');
    return zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", compression: "DEFLATE" });
  }

  window.WordPdf = { leseDocx, zuPdf, textModell, schreibeDocx };
})();
