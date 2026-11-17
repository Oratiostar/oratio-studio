// Medien-Werkstatt – Kern + Video-Werkzeuge (Video verkleinern, GIF, Einzelbilder). Musik/Ton steht in musik.js.
// Alles läuft im Browser (MediaRecorder + Canvas + WebAudio) – nichts wird hochgeladen.
//
// TÜR FÜR WEITERE PROJEKTE
//  • Neues Werkzeug: eigene Datei nach datei.js laden und mit DateiWerkstatt.tool({ id, titel, sym, farbe, text, build(sec){ … } }) anmelden.
//  • Gemeinsame Bausteine stehen unter window.OratioMedien: formate(), pruefe(file), aufnehmen(opt), aufnehmenBuffer(), wav(buffer), zeit(s), Eingabe() (Dateiliste mit „Smart-Ablage“).
//  • Jedes Werkzeug trägt gruppe:"video" oder "musik" – so sortiert die Medien-Werkstatt ihr Menü.
//  • Französisch: Sätze einfach in WZ_FR eintragen (siehe unten) – sie werden automatisch ersetzt.
(function(){
"use strict";
const DW = window.DateiWerkstatt; if (!DW || !DW.tool) return;
const { Liste, Ausgabe, wrapRun, fehler, esc, G } = DW;
const $ = (s, r) => (r || document).querySelector(s);
const HAT_MR = typeof MediaRecorder !== "undefined";

// ------------------------------------------------------------------ Bausteine
const zeit = s => { s = Math.max(0, s || 0); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const rs = (r < 10 ? "0" : "") + r.toFixed(1).replace(/\.0$/, ""); return h ? h + ":" + (m < 10 ? "0" : "") + m + ":" + rs : m + ":" + rs; };
const gerade = n => Math.max(2, Math.round(n / 2) * 2);

// Welche Ausgabeformate kann dieser Browser aufnehmen?
const VIDEO_FORMATE = [
  { id: "mp4", name: "MP4 (H.264) – läuft überall", ext: "mp4", mimes: ["video/mp4;codecs=avc1.640028,mp4a.40.2", "video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4;codecs=avc1,mp4a.40.2", "video/mp4"] },
  { id: "hevc", name: "MP4 (H.265/HEVC) – klein, nicht überall", ext: "mp4", mimes: ["video/mp4;codecs=hvc1,mp4a.40.2", "video/mp4;codecs=hev1,mp4a.40.2", "video/mp4;codecs=hvc1"] },
  { id: "webm", name: "WebM (VP9) – oft kleiner", ext: "webm", mimes: ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm;codecs=av1,opus", "video/webm"] },
  { id: "av1", name: "WebM (AV1) – sehr klein, modern", ext: "webm", mimes: ["video/webm;codecs=av1,opus", "video/webm;codecs=av01,opus"] },
  { id: "vp8", name: "WebM (VP8) – alt, sehr kompatibel", ext: "webm", mimes: ["video/webm;codecs=vp8,opus"] },
  { id: "mkv", name: "MKV (Matroska)", ext: "mkv", mimes: ["video/x-matroska;codecs=avc1,opus", "video/x-matroska;codecs=avc1", "video/x-matroska"] }
];
const AUDIO_FORMATE = [
  { id: "m4a", name: "M4A (AAC) – klein", ext: "m4a", mimes: ["audio/mp4;codecs=mp4a.40.2", "audio/mp4"] },
  { id: "webm", name: "WebM (Opus) – klein", ext: "webm", mimes: ["audio/webm;codecs=opus", "audio/webm"] },
  { id: "ogg", name: "OGG (Opus) – offen, klein", ext: "ogg", mimes: ["audio/ogg;codecs=opus"] }
];
function formate(liste){
  if (!HAT_MR) return [];
  return liste.map(f => { const m = f.mimes.find(x => { try { return MediaRecorder.isTypeSupported(x); } catch (e) { return false; } }); return m ? Object.assign({}, f, { mime: m }) : null; }).filter(Boolean);
}
const NOPLAY = "Dein Browser kann diese Datei nicht abspielen. iPhone-Videos (HEVC/H.265) gehen am besten in Safari auf iPhone, iPad oder Mac und in Chrome/Edge mit HEVC-Unterstützung.";

// Datei öffnen und Eckdaten lesen
function pruefe(file, nurTon){
  return new Promise((ok, err) => {
    const v = document.createElement(nurTon ? "audio" : "video"); v.preload = "metadata"; v.muted = true; v.playsInline = true;
    const url = URL.createObjectURL(file); v.src = url;
    const t = setTimeout(() => { URL.revokeObjectURL(url); err(new Error(NOPLAY)); }, 20000);
    v.onloadedmetadata = () => { clearTimeout(t); const d = v.duration;
      if (!isFinite(d) || d <= 0) { URL.revokeObjectURL(url); return err(new Error(NOPLAY)); }
      if (!nurTon && !v.videoWidth) { URL.revokeObjectURL(url); return err(new Error("Das Bild dieser Datei kann der Browser nicht lesen (nur Ton). " + NOPLAY)); }
      ok({ url, w: v.videoWidth || 0, h: v.videoHeight || 0, dauer: d }); };
    v.onerror = () => { clearTimeout(t); URL.revokeObjectURL(url); err(new Error(NOPLAY)); };
  });
}
const warteAuf = (el, ev) => new Promise(r => el.addEventListener(ev, r, { once: true }));
async function sperre(){ try { return navigator.wakeLock ? await navigator.wakeLock.request("screen") : null; } catch (e) { return null; } }

// Aufnehmen: das Video wird (in Echtzeit) abgespielt, neu gezeichnet und neu kodiert.
// opt: { url, nurTon, w, h, fps, mime, vbr, abr, ton, start, ende, drehen, spiegeln, fortschritt(f), abbruch:{flag} }
async function aufnehmen(opt){
  const v = document.createElement(opt.nurTon ? "audio" : "video"); v.src = opt.url; v.playsInline = true; v.preload = "auto"; v.muted = false; v.volume = 1;
  v.preservesPitch = true; v.webkitPreservesPitch = true; v.defaultPlaybackRate = v.playbackRate = opt.tempo || 1;
  let ac = null, stream, canvas, cx;
  if (!opt.nurTon){
    canvas = document.createElement("canvas"); canvas.width = opt.w; canvas.height = opt.h; cx = canvas.getContext("2d", { alpha: false });
    stream = canvas.captureStream(opt.fps);
  } else stream = new MediaStream();
  if (opt.ton !== false){
    const AC = window.AudioContext || window.webkitAudioContext; ac = new AC(); try { await ac.resume(); } catch (e) {}
    const quelle = ac.createMediaElementSource(v), ziel = ac.createMediaStreamDestination(); quelle.connect(ziel); // nicht an die Lautsprecher: bleibt still
    ziel.stream.getAudioTracks().forEach(t => stream.addTrack(t));
  }
  const ro = { mimeType: opt.mime }; if (opt.vbr) ro.videoBitsPerSecond = opt.vbr; if (opt.abr) ro.audioBitsPerSecond = opt.abr;
  const rec = new MediaRecorder(stream, ro), teile = []; rec.ondataavailable = e => { if (e.data && e.data.size) teile.push(e.data); };
  const wl = await sperre();
  if (v.readyState < 1) await warteAuf(v, "loadedmetadata");
  const start = opt.start || 0, ende = Math.min(opt.ende || v.duration, v.duration || 1e9);
  if (start > 0.05){ v.currentTime = start; await warteAuf(v, "seeked"); }
  const dw = opt.drehen % 180 ? opt.h : opt.w, dh = opt.drehen % 180 ? opt.w : opt.h;
  function zeichne(){
    if (opt.nurTon) return;
    cx.save(); cx.fillStyle = "#000"; cx.fillRect(0, 0, opt.w, opt.h); cx.translate(opt.w / 2, opt.h / 2); cx.rotate(opt.drehen * Math.PI / 180); if (opt.spiegeln) cx.scale(-1, 1);
    cx.imageSmoothingQuality = "high"; cx.drawImage(v, -dw / 2, -dh / 2, dw, dh); cx.restore();
  }
  zeichne();
  const fertig = new Promise(res => { rec.onstop = res; });
  let aus = false;
  function stopp(){ if (aus) return; aus = true; clearInterval(wach); try { v.pause(); } catch (e) {} try { if (rec.state !== "inactive") rec.stop(); } catch (e) {} }
  const wach = setInterval(() => { // läuft auch, wenn der Tab im Hintergrund steht
    const t = v.currentTime; if (opt.fortschritt) opt.fortschritt(Math.min(1, Math.max(0, (t - start) / Math.max(0.1, ende - start))));
    if (opt.abbruch && opt.abbruch.flag) return stopp();
    if (t >= ende - 0.02 || v.ended) stopp(); }, 250);
  v.onended = stopp;
  function schleife(){ if (aus) return; zeichne(); if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(schleife); else requestAnimationFrame(schleife); }
  rec.start(1000);
  await v.play();
  if (!opt.nurTon) schleife();
  await fertig;
  stopp(); stream.getTracks().forEach(t => t.stop()); if (ac) try { ac.close(); } catch (e) {} if (wl) try { wl.release(); } catch (e) {}
  v.removeAttribute("src"); v.load();
  if (opt.abbruch && opt.abbruch.flag) throw new Error("Abgebrochen.");
  return new Blob(teile, { type: opt.mime.split(";")[0] });
}

// WAV (16 Bit) aus einem AudioBuffer
function wav(buf){
  const kan = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate, daten = n * kan * 2, ab = new ArrayBuffer(44 + daten), dv = new DataView(ab);
  const t = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  t(0, "RIFF"); dv.setUint32(4, 36 + daten, true); t(8, "WAVE"); t(12, "fmt "); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, kan, true);
  dv.setUint32(24, sr, true); dv.setUint32(28, sr * kan * 2, true); dv.setUint16(32, kan * 2, true); dv.setUint16(34, 16, true); t(36, "data"); dv.setUint32(40, daten, true);
  const ch = []; for (let c = 0; c < kan; c++) ch.push(buf.getChannelData(c));
  let o = 44; for (let i = 0; i < n; i++) for (let c = 0; c < kan; c++){ const x = Math.max(-1, Math.min(1, ch[c][i])); dv.setInt16(o, x < 0 ? x * 0x8000 : x * 0x7fff, true); o += 2; }
  return new Blob([ab], { type: "audio/wav" });
}
// Dateiliste mit „Smart-Ablage“: wurde oben auf der Seite schon eine Datei abgelegt, übernimmt jedes passende Werkzeug sie automatisch.
function Eingabe(box, o){ const li = Liste(box, o); const hf = OM.heft && OM.heft.file; if (hf) setTimeout(() => li.add([hf]), 0); return li; }
const OM = window.OratioMedien = window.OratioMedien || {};

// Zwei Regler für Anfang und Ende
function schnittHTML(){
  return '<div class="rg"><span>Anfang</span><input type="range" id="t0" min="0" max="1" step="0.1" value="0"><output id="t0o">0:00</output></div>' +
         '<div class="rg"><span>Ende</span><input type="range" id="t1" min="0" max="1" step="0.1" value="1"><output id="t1o">0:00</output></div>';
}
function schnittSetzen(sec, dauer){
  const a = $("#t0", sec), b = $("#t1", sec); a.max = b.max = dauer.toFixed(1); a.value = 0; b.value = dauer.toFixed(1);
  const zeigen = () => { if (+a.value > +b.value - 0.3) { if (document.activeElement === a) a.value = Math.max(0, +b.value - 0.3); else b.value = Math.min(dauer, +a.value + 0.3); } $("#t0o", sec).textContent = zeit(+a.value); $("#t1o", sec).textContent = zeit(+b.value); };
  a.oninput = b.oninput = () => { zeigen(); sec.dispatchEvent(new Event("input")); }; zeigen();
}
const lesenSchnitt = sec => ({ start: +$("#t0", sec).value, ende: +$("#t1", sec).value });
Object.assign(OM, { formate, pruefe, aufnehmen, wav, zeit, warteAuf, sperre, Eingabe, VIDEO_FORMATE, AUDIO_FORMATE, schnittHTML, schnittSetzen, lesenSchnitt });

// ------------------------------------------------------------------ 1) Video verkleinern & umwandeln
const ZIELE = [["Discord", 8], ["WhatsApp", 16], ["E-Mail", 25], ["50 MB", 50], ["100 MB", 100]];
function videoBau(sec, umw){
    const fm = formate(VIDEO_FORMATE);
    if (!fm.length) { sec.innerHTML = '<p class="status bad">Dieser Browser kann keine Videos aufnehmen. Bitte Chrome, Edge, Firefox oder Safari (neu) benutzen.</p>'; return; }
    sec.innerHTML =
      '<div class="liste"></div><div class="org-bar" id="info" hidden></div><div id="opt" hidden>' +
      '<label class="l">Vorgabe</label><div class="tabs" id="pre"><button class="btn" data-p="klein">Klein (Messenger)</button><button class="btn on" data-p="mittel">Ausgewogen</button><button class="btn" data-p="hoch">Hohe Qualität</button><button class="btn" data-p="ziel">🎯 Zielgröße</button></div>' +
      '<div id="zielbox" hidden class="org-bar"><label class="l" style="margin-top:0">Das Video soll höchstens … MB groß sein</label><div class="row"><input class="in" id="zmb" type="number" min="1" step="1" value="16" style="width:100px;flex:none"> <span class="muted">MB</span>' +
      ZIELE.map(z => '<button class="btn sm" data-z="' + z[1] + '">' + z[0] + ' · ' + z[1] + '</button>').join("") + '</div><p class="muted" style="font-size:13px;margin:6px 0 0">Ich wähle Größe und Qualität selbst so, dass es passt.</p></div>' +
      '<div class="cols2"><div><label class="l">Format</label><select class="in" id="fm">' + fm.map(f => '<option value="' + f.id + '">' + esc(f.name) + '</option>').join("") + '</select></div>' +
      '<div id="grw"><label class="l">Größe (kürzere Seite)</label><select class="in" id="gr"><option value="0">Wie Original</option><option value="1080">1080 p (Full HD)</option><option value="720">720 p (HD)</option><option value="480">480 p</option><option value="360">360 p (sehr klein)</option><option value="240">240 p</option></select></div>' +
      '<div><label class="l">Bilder pro Sekunde</label><select class="in" id="fps"><option value="30">30 (wie Original, max. 30)</option><option value="24">24</option><option value="15">15 (sehr klein)</option></select></div>' +
      '<div><label class="l">Tempo (Ton bleibt gleich hoch)</label><select class="in" id="tp"><option value="0.5">0,5× (Zeitlupe)</option><option value="0.75">0,75×</option><option value="1" selected>1× (normal)</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option><option value="2">2× (Zeitraffer)</option></select></div>' +
      '<div><label class="l">Drehen</label><select class="in" id="dr"><option value="0">Nicht drehen</option><option value="90">90° rechts</option><option value="180">180°</option><option value="270">90° links</option></select></div></div>' +
      '<div class="rg" id="qrg"><span>Qualität</span><input type="range" id="q" min="1" max="10" value="5"><output id="qO"></output></div>' +
      schnittHTML() +
      '<label class="chk"><input type="checkbox" id="ton" checked> Ton behalten</label><label class="chk"><input type="checkbox" id="sp"> Spiegeln (links ↔ rechts)</label>' +
      '<p class="muted" id="schaetz" style="margin:8px 0"></p><p class="muted" id="tipp" style="margin:0 0 8px;font-size:13px"></p>' +
      '<p class="muted" style="font-size:13px;margin:0 0 6px">Das Umwandeln läuft in Echtzeit: es dauert so lange wie das Video. Lass den Tab offen und den Bildschirm an – ich halte ihn wach, wenn dein Gerät das erlaubt.</p>' +
      '<div class="row"><button class="btn go" id="go" disabled>' + (umw ? "Umwandeln" : "Verkleinern") + '</button><button class="btn" id="stop" hidden>Abbrechen</button></div></div><div class="ausgabe"></div>';
    if (umw){ const hide = el => { if (el) { el.hidden = true; el.style.display = "none"; } }; hide($("#pre", sec).previousElementSibling); hide($("#pre", sec)); hide($("#zielbox", sec)); hide($("#grw", sec)); hide($("#fps", sec).parentNode); hide($("#tp", sec).parentNode); hide($("#qrg", sec)); hide($("#t0", sec).parentNode); hide($("#t1", sec).parentNode); }
    const out = Ausgabe($(".ausgabe", sec)); let q = null, abbruch = { flag: false }, modus = "mittel";
    const li = Eingabe($(".liste", sec), { accept: "video/*,.mov,.mp4,.m4v,.webm,.mkv,.3gp", multiple: false, titel: "Video hier ablegen (z. B. iPhone-MOV)", meldung: out.say, sortieren: false,
      onChange: async it => {
        out.leer(); $("#opt", sec).hidden = true; $("#info", sec).hidden = true; $("#go", sec).disabled = true; if (q) { URL.revokeObjectURL(q.url); q = null; } if (!it.length) return;
        try { out.say("Lese Video …"); q = await pruefe(it[0].file); out.say(""); q.bps = it[0].file.size * 8 / q.dauer;
          const inf = $("#info", sec); inf.hidden = false; inf.innerHTML = '<b>' + esc(it[0].file.name) + '</b><br>' + q.w + '×' + q.h + ' · ' + zeit(q.dauer) + ' · ' + G(it[0].file.size) + ' · ca. ' + (q.bps / 1e6).toFixed(1).replace(".", ",") + ' Mbit/s';
          $("#opt", sec).hidden = false; $("#go", sec).disabled = false; schnittSetzen(sec, q.dauer); if (umw){ $("#gr", sec).value = 0; $("#fps", sec).value = 30; $("#q", sec).value = 9; modus = "mittel"; upd(); } else preset("mittel");
        } catch (e) { fehler(out, e); } } });
    const PRE = { klein: { gr: 480, fps: 30, q: 3 }, mittel: { gr: 720, fps: 30, q: 5 }, hoch: { gr: 1080, fps: 30, q: 8 } };
    function preset(p){ modus = p; const o = PRE[p];
      if (o){ $("#gr", sec).value = o.gr; $("#fps", sec).value = o.fps; $("#q", sec).value = o.q; ["gr", "fps"].forEach(i => $("#" + i, sec).dispatchEvent(new Event("change"))); }
      sec.querySelectorAll("#pre .btn").forEach(b => b.classList.toggle("on", b.dataset.p === p));
      $("#zielbox", sec).hidden = p !== "ziel"; $("#grw", sec).hidden = $("#qrg", sec).hidden = p === "ziel"; upd(); }
    $("#pre", sec).onclick = e => { const b = e.target.closest("button"); if (b) preset(b.dataset.p); };
    $("#zielbox", sec).onclick = e => { const b = e.target.closest("[data-z]"); if (b){ $("#zmb", sec).value = b.dataset.z; upd(); } };
    function ziel(){
      const rot = +$("#dr", sec).value, fps = +$("#fps", sec).value, tp = +$("#tp", sec).value, sc = lesenSchnitt(sec), dauerAus = (sc.ende - sc.start) / tp, ton = $("#ton", sec).checked, abr = ton ? 96000 : 0;
      const groesse = kurz => { let w = q.w, h = q.h; if (kurz && Math.min(w, h) > kurz) { const f = kurz / Math.min(w, h); w *= f; h *= f; } w = gerade(w); h = gerade(h); return rot % 180 ? [h, w] : [w, h]; };
      let w, h, vbr, hinweis = "";
      if (modus === "ziel"){
        const mb = Math.max(.5, +$("#zmb", sec).value || 16); vbr = Math.max(60000, Math.floor((mb * 8e6 * .96) / dauerAus - abr));
        for (const k of [1080, 720, 480, 360, 240, 144]){ [w, h] = groesse(k); if (k === 144 || vbr / (w * h * fps) >= 0.06) break; }
        if (vbr / (w * h * fps) < 0.035) hinweis = "Für diese Größe ist das Video lang. Es wird stark komprimiert – das Bild kann unscharf werden.";
        vbr = Math.min(vbr, 40e6);
      } else { [w, h] = groesse(+$("#gr", sec).value); const qq = +$("#q", sec).value, bpp = 0.03 + (qq - 1) * 0.0175; vbr = Math.min(40e6, Math.round(w * h * fps * bpp)); if (umw) vbr = Math.min(vbr, Math.max(2e6, Math.round(q.bps || 4e6))); }
      return { w, h, rot, fps, tp, vbr, abr, sc, dauerAus, hinweis, schaetz: (vbr + abr) * dauerAus / 8 };
    }
    function upd(){ $("#qO", sec).textContent = ["", "sehr klein", "sehr klein", "klein", "klein", "mittel", "gut", "gut", "sehr gut", "sehr gut", "maximal"][+$("#q", sec).value];
      if (!q) return; const z = ziel(), alt = li.items[0] && li.items[0].file.size; $("#schaetz", sec).innerHTML = 'Ergebnis: <b>' + z.w + '×' + z.h + '</b> · ' + zeit(z.dauerAus) + ' · ca. <b>' + G(z.schaetz) + '</b>' + (!umw && alt && z.schaetz >= alt ? ' <span class="muted">(größer als das Original – wähle kleiner oder weniger Qualität)</span>' : "");
      let t = z.hinweis; if (!umw && !t && q.bps < z.vbr * .8) t = "Tipp: Das Video ist schon stärker komprimiert als dein Ziel. Eine höhere Qualität macht es nur größer, nicht besser."; if (!t && q.w * q.h > 3e6 && q.dauer > 600) t = "Tipp: Das Video ist lang – das Umwandeln braucht entsprechend lange."; $("#tipp", sec).textContent = t; }
    sec.addEventListener("input", upd); sec.addEventListener("change", upd);
    $("#stop", sec).onclick = () => { abbruch.flag = true; };
    wrapRun($("#go", sec), async () => {
      if (!q) return; out.leer(); abbruch = { flag: false }; const z = ziel(), f = fm.find(x => x.id === $("#fm", sec).value), file = li.items[0].file;
      $("#stop", sec).hidden = false; out.say("Wandle um … Tab offen lassen."); out.prog(0);
      const vis = () => { if (document.hidden) out.say("Der Tab ist im Hintergrund – das kann stocken. Bitte zurückkehren.", "bad"); }; document.addEventListener("visibilitychange", vis);
      try {
        const blob = await aufnehmen({ url: q.url, w: z.w, h: z.h, fps: z.fps, mime: f.mime, vbr: z.vbr, abr: z.abr, ton: $("#ton", sec).checked, tempo: z.tp, start: z.sc.start, ende: z.sc.ende, drehen: z.rot, spiegeln: $("#sp", sec).checked, fortschritt: p => out.prog(p), abbruch });
        if (!blob.size) throw new Error("Es ist nichts herausgekommen. Probier ein anderes Format.");
        out.prog(null); out.add(WZ.sauber(file.name) + (umw ? "_umgewandelt." : "_klein.") + f.ext, blob, z.w + "×" + z.h + " · " + G(file.size) + " → " + G(blob.size) + (!umw && blob.size < file.size ? " (−" + Math.round((1 - blob.size / file.size) * 100) + " %)" : ""));
        out.say(umw || blob.size < file.size ? "Fertig." : "Fertig – aber größer als das Original. Wähle eine kleinere Größe oder weniger Qualität.", umw || blob.size < file.size ? "ok" : "bad");
      } catch (e) { fehler(out, e); } finally { document.removeEventListener("visibilitychange", vis); $("#stop", sec).hidden = true; } });
}
DW.tool({ id: "video", gruppe: "video", titel: "Video verkleinern", sym: "🎬", farbe: "#d9453b",
  text: "Große Videos (auch iPhone-MOV) kleiner machen – mit Zielgröße (z. B. für WhatsApp), Qualität, Größe, Tempo, Zuschneiden, Drehen und Ton an/aus. Für ein anderes Format: „Video umwandeln“.",
  build(sec){ videoBau(sec, false); } });
DW.tool({ id: "vidformat", gruppe: "video", titel: "Video umwandeln", sym: "🔁", farbe: "#b8372f",
  text: "Das Format wechseln: MOV, MP4, WebM und mehr (je nach Browser: H.265, AV1, MKV) – Größe und Bildrate bleiben, die Qualität wird nicht absichtlich gesenkt.",
  build(sec){ videoBau(sec, true); } });

// ------------------------------------------------------------------ 2) Video → GIF
function medianCut(zaehler, n){ // zaehler: Uint32Array(32768) Häufigkeit je 5-Bit-Farbe → Palette (n Farben)
  let cols = []; for (let k = 0; k < 32768; k++) if (zaehler[k]) cols.push(k);
  if (!cols.length) return [[0, 0, 0]];
  const ch = (k, c) => c === 0 ? (k >> 10) & 31 : c === 1 ? (k >> 5) & 31 : k & 31;
  let boxes = [cols];
  while (boxes.length < n){
    let bi = -1, bs = 1; boxes.forEach((b, i) => { if (b.length > bs) { bs = b.length; bi = i; } }); if (bi < 0) break;
    const b = boxes[bi]; let best = 0, bestR = -1;
    for (let c = 0; c < 3; c++){ let mn = 31, mx = 0; for (const k of b){ const v = ch(k, c); if (v < mn) mn = v; if (v > mx) mx = v; } if (mx - mn > bestR){ bestR = mx - mn; best = c; } }
    b.sort((x, y) => ch(x, best) - ch(y, best)); let tot = 0; for (const k of b) tot += zaehler[k]; let acc = 0, cut = 1;
    for (let i = 0; i < b.length; i++){ acc += zaehler[b[i]]; if (acc >= tot / 2){ cut = Math.min(b.length - 1, Math.max(1, i + 1)); break; } }
    boxes.splice(bi, 1, b.slice(0, cut), b.slice(cut));
  }
  return boxes.map(b => { let r = 0, g = 0, bl = 0, t = 0; for (const k of b){ const w = zaehler[k]; r += ((k >> 10) & 31) * w; g += ((k >> 5) & 31) * w; bl += (k & 31) * w; t += w; } t = t || 1; return [Math.round(r / t * 255 / 31), Math.round(g / t * 255 / 31), Math.round(bl / t * 255 / 31)]; });
}
function lzw(index, minCode){
  const clear = 1 << minCode, eoi = clear + 1, out = []; let bits = 0, nb = 0, size = minCode + 1, next = eoi + 1, dict = new Map();
  const put = c => { bits |= c << nb; nb += size; while (nb >= 8){ out.push(bits & 255); bits >>= 8; nb -= 8; } };
  put(clear); let pre = index[0];
  for (let i = 1; i < index.length; i++){ const c = index[i], key = pre * 4096 + c, hit = dict.get(key);
    if (hit !== undefined) pre = hit;
    else { put(pre); if (next < 4096){ dict.set(key, next++); if (next - 1 === (1 << size) && size < 12) size++; } else { put(clear); dict.clear(); size = minCode + 1; next = eoi + 1; } pre = c; } }
  put(pre); put(eoi); if (nb > 0) out.push(bits & 255);
  const bl = []; for (let i = 0; i < out.length; i += 255){ const part = out.slice(i, i + 255); bl.push(part.length, ...part); } bl.push(0); return bl;
}
function gifBauen(frames, w, h, pal, delayCs, schleife){
  const b = []; const w16 = n => b.push(n & 255, (n >> 8) & 255); const str = s => { for (const ch of s) b.push(ch.charCodeAt(0)); };
  str("GIF89a"); w16(w); w16(h); b.push(0xF7, 0, 0); for (let i = 0; i < 256; i++){ const c = pal[i] || [0, 0, 0]; b.push(c[0], c[1], c[2]); }
  if (schleife) { b.push(0x21, 0xFF, 11); str("NETSCAPE2.0"); b.push(3, 1, 0, 0, 0); }
  for (const f of frames){ b.push(0x21, 0xF9, 4, 0, delayCs & 255, (delayCs >> 8) & 255, 0, 0); b.push(0x2C); w16(0); w16(0); w16(w); w16(h); b.push(0); b.push(8); const d = lzw(f, 8); for (let i = 0; i < d.length; i++) b.push(d[i]); }
  b.push(0x3B); return new Blob([new Uint8Array(b)], { type: "image/gif" });
}
DW.tool({ id: "gif", gruppe: "video", titel: "Video → GIF", sym: "🌀", farbe: "#e8892b",
  text: "Aus einem Video-Ausschnitt ein animiertes GIF machen – mit Breite, Tempo und Schleife. Läuft schnell, ohne Echtzeit.",
  build(sec){
    sec.innerHTML = '<div class="liste"></div><div class="org-bar" id="info" hidden></div><div id="opt" hidden><div class="cols2"><div><label class="l">Breite</label><select class="in" id="bw"><option value="240">240 px (klein)</option><option value="360">360 px</option><option value="480" selected>480 px</option><option value="640">640 px</option><option value="800">800 px (groß)</option></select></div>' +
      '<div><label class="l">Bilder pro Sekunde</label><select class="in" id="gf"><option value="6">6 (sehr klein)</option><option value="10" selected>10</option><option value="15">15</option><option value="20">20 (flüssig)</option></select></div></div>' +
      schnittHTML() + '<label class="chk"><input type="checkbox" id="lp" checked> Endlos wiederholen</label><p class="muted" id="gs" style="margin:8px 0"></p><button class="btn go" id="go" disabled>GIF erstellen</button></div><div class="ausgabe"></div><div id="vorschau"></div>';
    const out = Ausgabe($(".ausgabe", sec)); let q = null;
    const li = Eingabe($(".liste", sec), { accept: "video/*,.mov,.mp4,.m4v,.webm,.3gp", multiple: false, titel: "Video hier ablegen", meldung: out.say, sortieren: false,
      onChange: async it => { out.leer(); $("#vorschau", sec).innerHTML = ""; $("#opt", sec).hidden = true; $("#info", sec).hidden = true; $("#go", sec).disabled = true; if (q) { URL.revokeObjectURL(q.url); q = null; } if (!it.length) return;
        try { out.say("Lese Video …"); q = await pruefe(it[0].file); out.say(""); const inf = $("#info", sec); inf.hidden = false; inf.innerHTML = '<b>' + esc(it[0].file.name) + '</b><br>' + q.w + '×' + q.h + ' · ' + zeit(q.dauer);
          $("#opt", sec).hidden = false; $("#go", sec).disabled = false; schnittSetzen(sec, q.dauer); const e = $("#t1", sec); e.value = Math.min(q.dauer, 5); e.dispatchEvent(new Event("input", { bubbles: true })); upd(); } catch (e) { fehler(out, e); } } });
    function upd(){ if (!q) return; const sc = lesenSchnitt(sec), n = Math.max(1, Math.round((sc.ende - sc.start) * +$("#gf", sec).value)), w = Math.min(+$("#bw", sec).value, q.w), h = Math.round(w * q.h / q.w);
      $("#gs", sec).innerHTML = n + ' Bilder · ' + w + '×' + h + ' · grob geschätzt <b>' + G(n * w * h * .18) + '</b>' + (n > 150 ? ' <span class="muted">(viele Bilder – GIFs werden schnell riesig)</span>' : ""); }
    sec.addEventListener("input", upd); sec.addEventListener("change", upd);
    wrapRun($("#go", sec), async () => {
      if (!q) return; out.leer(); $("#vorschau", sec).innerHTML = ""; const sc = lesenSchnitt(sec), fps = +$("#gf", sec).value, n = Math.max(1, Math.round((sc.ende - sc.start) * fps)), w = Math.min(+$("#bw", sec).value, q.w), h = Math.max(2, Math.round(w * q.h / q.w));
      const v = document.createElement("video"); v.muted = true; v.playsInline = true; v.src = q.url; await warteAuf(v, "loadeddata"); const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d", { willReadFrequently: true }); const bilder = [];
      try {
        for (let i = 0; i < n; i++){ v.currentTime = Math.min(q.dauer - 0.02, sc.start + i / fps); await warteAuf(v, "seeked"); x.drawImage(v, 0, 0, w, h); bilder.push(x.getImageData(0, 0, w, h).data); out.prog(i / n * .6); out.say("Lese Bilder … " + (i + 1) + " / " + n); await WZ.warte(); }
        out.say("Wähle Farben …"); const zaehler = new Uint32Array(32768), schritt = Math.max(1, Math.floor(n / 8));
        for (let i = 0; i < n; i += schritt){ const d = bilder[i]; for (let p = 0; p < d.length; p += 16) zaehler[((d[p] >> 3) << 10) | ((d[p + 1] >> 3) << 5) | (d[p + 2] >> 3)]++; }
        const pal = medianCut(zaehler, 256), cache = new Int16Array(32768).fill(-1);
        const nahe = k => { let r = ((k >> 10) & 31) * 255 / 31, g = ((k >> 5) & 31) * 255 / 31, b = (k & 31) * 255 / 31, best = 0, bd = 1e9; for (let i = 0; i < pal.length; i++){ const dr = pal[i][0] - r, dg = pal[i][1] - g, db = pal[i][2] - b, dd = dr * dr * 3 + dg * dg * 4 + db * db * 2; if (dd < bd){ bd = dd; best = i; } } return best; };
        const idx = []; for (let i = 0; i < n; i++){ const d = bilder[i], o = new Uint8Array(w * h); for (let p = 0, j = 0; j < w * h; p += 4, j++){ const k = ((d[p] >> 3) << 10) | ((d[p + 1] >> 3) << 5) | (d[p + 2] >> 3); let m = cache[k]; if (m < 0) m = cache[k] = nahe(k); o[j] = m; } idx.push(o); out.prog(.6 + i / n * .3); if (i % 5 === 4) { out.say("Rechne Farben … " + (i + 1) + " / " + n); await WZ.warte(); } }
        out.say("Packe GIF …"); await WZ.warte(); const blob = gifBauen(idx, w, h, pal, Math.max(2, Math.round(100 / fps)), $("#lp", sec).checked); out.prog(null);
        out.add(WZ.sauber(li.items[0].file.name) + ".gif", blob, w + "×" + h + " · " + n + " Bilder · " + G(blob.size)); out.say("Fertig.", "ok");
        const u = URL.createObjectURL(blob); $("#vorschau", sec).innerHTML = '<img alt="GIF-Vorschau" src="' + u + '" style="max-width:100%;border-radius:12px;margin-top:10px">';
      } catch (e) { fehler(out, e); } finally { v.removeAttribute("src"); v.load(); } });
  } });

// ------------------------------------------------------------------ 3) Einzelbilder aus Video
DW.tool({ id: "vidbild", gruppe: "video", titel: "Bilder aus Video holen", sym: "📸", farbe: "#1f9d8b",
  text: "Ein Standbild aus einem Video speichern (PNG oder JPG) – oder alle paar Sekunden ein Bild als ZIP.",
  build(sec){
    sec.innerHTML = '<div class="liste"></div><div id="opt" hidden><video id="pv" playsinline muted controls style="width:100%;max-height:50vh;border-radius:12px;background:#000;margin-top:10px"></video>' +
      '<div class="rg"><span>Zeit</span><input type="range" id="tz" min="0" max="1" step="0.01" value="0"><output id="tzo">0:00</output></div>' +
      '<div class="row"><button class="btn sm" id="vz" title="ein Bild zurück">◀ Bild</button><button class="btn sm" id="vv" title="ein Bild vor">Bild ▶</button><span class="sp" style="flex:1"></span>' +
      '<select class="in" id="fm" style="width:auto"><option value="png">PNG</option><option value="jpg">JPG</option></select><button class="btn go" id="one">Dieses Bild speichern</button></div>' +
      '<div class="org-bar"><b>Viele Bilder:</b> alle <input class="in" id="iv" type="number" min="0.1" step="0.5" value="5" style="width:80px;display:inline-block"> Sekunden ein Bild (höchstens 200) <button class="btn" id="mehr" style="margin-left:6px">Als ZIP erstellen</button></div></div><div class="ausgabe"></div>';
    const out = Ausgabe($(".ausgabe", sec)); let q = null; const pv = $("#pv", sec);
    const li = Liste($(".liste", sec), { accept: "video/*,.mov,.mp4,.m4v,.webm,.3gp", multiple: false, titel: "Video hier ablegen", meldung: out.say, sortieren: false,
      onChange: async it => {
        out.leer(); $("#opt", sec).hidden = true; if (q) { URL.revokeObjectURL(q.url); q = null; } pv.removeAttribute("src"); if (!it.length) return;
        try { out.say("Lese Video …"); q = await pruefe(it[0].file); out.say(q.w + "×" + q.h + " · " + zeit(q.dauer)); pv.src = q.url; $("#tz", sec).max = q.dauer.toFixed(2); $("#tz", sec).value = 0; $("#opt", sec).hidden = false; pv.currentTime = Math.min(0.05, q.dauer / 2);
        } catch (e) { fehler(out, e); } } });
    pv.ontimeupdate = () => { $("#tz", sec).value = pv.currentTime; $("#tzo", sec).textContent = zeit(pv.currentTime); };
    $("#tz", sec).oninput = () => { pv.pause(); pv.currentTime = +$("#tz", sec).value; };
    $("#vz", sec).onclick = () => { pv.pause(); pv.currentTime = Math.max(0, pv.currentTime - 1 / 30); };
    $("#vv", sec).onclick = () => { pv.pause(); pv.currentTime = Math.min(q.dauer, pv.currentTime + 1 / 30); };
    const fm = () => $("#fm", sec).value === "jpg" ? ["image/jpeg", "jpg", .92] : ["image/png", "png"];
    async function bild(v){ const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight; const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(v, 0, 0); const f = fm(); return DW.toBlob(c, f[0], f[2]); }
    wrapRun($("#one", sec), async () => { try { const f = fm(), b = await bild(pv); out.add(WZ.sauber(li.items[0].file.name) + "_" + zeit(pv.currentTime).replace(":", "-") + "." + f[1], b, q.w + "×" + q.h + " · " + G(b.size)); out.say("Bild gespeichert – unten zum Herunterladen.", "ok"); } catch (e) { fehler(out, e); } });
    wrapRun($("#mehr", sec), async () => {
      try { out.leer(); const iv = Math.max(.1, +$("#iv", sec).value || 5), n = Math.min(200, Math.floor(q.dauer / iv) + 1), f = fm(), base = WZ.sauber(li.items[0].file.name), z = new JSZip(); const v = document.createElement("video"); v.src = q.url; v.muted = true; v.playsInline = true; await warteAuf(v, "loadeddata"); let k = 0;
        for (let i = 0; i < n; i++){ const t = Math.min(q.dauer - 0.05, i * iv); v.currentTime = t; await warteAuf(v, "seeked"); z.file(base + "_" + String(i + 1).padStart(3, "0") + "_" + zeit(t).replace(":", "-") + "." + f[1], await bild(v)); k++; out.prog(k / n); out.say(k + " / " + n + " Bilder …"); }
        const blob = await z.generateAsync({ type: "blob" }); out.prog(null); out.add(base + "_Bilder.zip", blob, k + " Bilder · " + G(blob.size)); out.say("Fertig – " + k + " Bilder.", "ok"); v.removeAttribute("src"); v.load();
      } catch (e) { fehler(out, e); } });
  } });

// ------------------------------------------------------------------ Französisch
if (window.WZ_FR){
  Object.assign(WZ_FR, {
    "Große Videos (auch iPhone-MOV) kleiner machen und als MP4 oder WebM speichern – mit Zielgröße, Qualität, Tempo, Zuschneiden, Drehen und Ton an/aus.": "Réduire de grosses vidéos (même MOV d’iPhone) et les enregistrer en MP4 ou WebM – avec taille cible, qualité, vitesse, découpe, rotation et son activé/désactivé.",
    "Aus einem Video-Ausschnitt ein animiertes GIF machen – mit Breite, Tempo und Schleife. Läuft schnell, ohne Echtzeit.": "Faire un GIF animé à partir d’un extrait de vidéo – avec largeur, vitesse et boucle. Rapide, sans temps réel.",
    "Video → GIF": "Vidéo → GIF", "🎯 Zielgröße": "🎯 Taille cible", "Das Video soll höchstens … MB groß sein": "La vidéo doit faire … Mo au maximum", "Ich wähle Größe und Qualität selbst so, dass es passt.": "Je choisis moi-même la taille et la qualité pour que ça rentre.",
    "Tempo (Ton bleibt gleich hoch)": "Vitesse (le son garde sa hauteur)", "0,5× (Zeitlupe)": "0,5× (ralenti)", "1× (normal)": "1× (normal)", "2× (Zeitraffer)": "2× (accéléré)",
    "Für diese Größe ist das Video lang. Es wird stark komprimiert – das Bild kann unscharf werden.": "Pour cette taille la vidéo est longue. Elle sera très compressée – l’image peut devenir floue.",
    "Tipp: Das Video ist schon stärker komprimiert als dein Ziel. Eine höhere Qualität macht es nur größer, nicht besser.": "Astuce : la vidéo est déjà plus compressée que ta cible. Plus de qualité la rend seulement plus grosse, pas meilleure.",
    "Tipp: Das Video ist lang – das Umwandeln braucht entsprechend lange.": "Astuce : la vidéo est longue – la conversion prend donc autant de temps.", "Mbit/s": "Mbit/s",
    "Breite": "Largeur", "240 px (klein)": "240 px (petit)", "800 px (groß)": "800 px (grand)", "20 (flüssig)": "20 (fluide)", "6 (sehr klein)": "6 (très petit)", "Endlos wiederholen": "Répéter sans fin", "GIF erstellen": "Créer le GIF",
    "Bilder · ": "images · ", "grob geschätzt": "estimé grossièrement", "(viele Bilder – GIFs werden schnell riesig)": "(beaucoup d’images – les GIF deviennent vite énormes)", "Lese Bilder …": "Lecture des images …", "Wähle Farben …": "Choix des couleurs …", "Rechne Farben …": "Calcul des couleurs …", "Packe GIF …": "Création du GIF …",
    "Den Ton aus einem Video (z. B. iPhone-MOV) oder eine Audio-Datei als WAV, M4A oder WebM speichern – mit Zuschneiden, Mono und kleinerer Abtastrate.": "Enregistrer le son d’une vidéo (p. ex. MOV d’iPhone) ou d’un fichier audio en WAV, M4A ou WebM – avec découpe, mono et fréquence d’échantillonnage réduite.",
    "Ein Standbild aus einem Video speichern (PNG oder JPG) – oder alle paar Sekunden ein Bild als ZIP.": "Enregistrer une image fixe d’une vidéo (PNG ou JPG) – ou une image toutes les quelques secondes dans un ZIP.",
    "Video verkleinern & umwandeln": "Réduire et convertir une vidéo", "Ton aus Video holen & Audio umwandeln": "Extraire le son d’une vidéo et convertir l’audio", "Bilder aus Video holen": "Extraire des images d’une vidéo",
    "Dieser Browser kann keine Videos aufnehmen. Bitte Chrome, Edge, Firefox oder Safari (neu) benutzen.": "Ce navigateur ne peut pas enregistrer de vidéos. Utilise Chrome, Edge, Firefox ou Safari (récents).",
    "Dein Browser kann diese Datei nicht abspielen. iPhone-Videos (HEVC/H.265) gehen am besten in Safari auf iPhone, iPad oder Mac und in Chrome/Edge mit HEVC-Unterstützung.": "Ton navigateur ne peut pas lire ce fichier. Les vidéos d’iPhone (HEVC/H.265) fonctionnent mieux dans Safari sur iPhone, iPad ou Mac et dans Chrome/Edge avec prise en charge HEVC.",
    "Das Bild dieser Datei kann der Browser nicht lesen (nur Ton).": "Le navigateur ne peut pas lire l’image de ce fichier (son seulement).",
    "Video hier ablegen (z. B. iPhone-MOV)": "Dépose la vidéo ici (p. ex. MOV d’iPhone)", "Video oder Audio hier ablegen": "Dépose la vidéo ou l’audio ici", "Video hier ablegen": "Dépose la vidéo ici",
    "Lese Video …": "Lecture de la vidéo …", "Lese Datei …": "Lecture du fichier …", "Vorgabe": "Préréglage",
    "Klein (Messenger)": "Petit (messagerie)", "Ausgewogen": "Équilibré", "Hohe Qualität": "Haute qualité",
    "MP4 (H.264) – läuft überall": "MP4 (H.264) – lisible partout", "WebM (VP9) – oft kleiner": "WebM (VP9) – souvent plus petit",
    "Größe (kürzere Seite)": "Taille (côté le plus court)", "Wie Original": "Comme l’original", "(Full HD)": "(Full HD)", "(HD)": "(HD)", "(sehr klein)": "(très petit)",
    "Bilder pro Sekunde": "Images par seconde", "30 (wie Original, max. 30)": "30 (comme l’original, max. 30)", "15 (sehr klein)": "15 (très petit)",
    "Drehen": "Rotation", "Nicht drehen": "Ne pas pivoter", "90° rechts": "90° à droite", "90° links": "90° à gauche",
    "Qualität": "Qualité", "sehr klein": "très petite", "klein": "petite", "mittel": "moyenne", "sehr gut": "très bonne", "gut": "bonne", "maximal": "maximale",
    "Anfang": "Début", "Ende": "Fin", "Ton behalten": "Garder le son", "Spiegeln (links ↔ rechts)": "Miroir (gauche ↔ droite)",
    "Ergebnis:": "Résultat :", "ca.": "env.", "(größer als das Original – wähle kleiner oder weniger Qualität)": "(plus grand que l’original – choisis plus petit ou moins de qualité)",
    "Das Umwandeln läuft in Echtzeit: es dauert so lange wie das Video. Lass den Tab offen und den Bildschirm an – ich halte ihn wach, wenn dein Gerät das erlaubt.": "La conversion se fait en temps réel : elle dure aussi longtemps que la vidéo. Laisse l’onglet ouvert et l’écran allumé – je le garde éveillé si ton appareil le permet.",
    "Umwandeln": "Convertir", "Wandle um … Tab offen lassen.": "Conversion … laisse l’onglet ouvert.", "Nehme auf … Tab offen lassen.": "Enregistrement … laisse l’onglet ouvert.",
    "Der Tab ist im Hintergrund – das kann stocken. Bitte zurückkehren.": "L’onglet est en arrière-plan – cela peut saccader. Reviens dessus.",
    "Es ist nichts herausgekommen. Probier ein anderes Format.": "Rien n’en est sorti. Essaie un autre format.",
    "Fertig – aber größer als das Original. Wähle eine kleinere Größe oder weniger Qualität.": "Terminé – mais plus grand que l’original. Choisis une taille plus petite ou moins de qualité.",
    "Fertig – ": "Terminé – ", "Fertig.": "Terminé.", "Abgebrochen.": "Annulé.",
    "WAV (verlustfrei, sehr groß)": "WAV (sans perte, très gros)", "M4A (AAC) – klein": "M4A (AAC) – petit", "WebM (Opus) – klein": "WebM (Opus) – petit",
    "Kanäle": "Canaux", "Mono (halb so groß)": "Mono (moitié moins gros)", "Abtastrate (nur WAV)": "Fréquence d’échantillonnage (WAV seulement)", "44,1 kHz (CD)": "44,1 kHz (CD)", "16 kHz (Sprache)": "16 kHz (voix)",
    "Qualität (nur M4A/WebM)": "Qualité (M4A/WebM seulement)", "64 kbit/s (Sprache)": "64 kbit/s (voix)",
    "WAV wird sofort berechnet (schnell).": "Le WAV est calculé tout de suite (rapide).", "M4A/WebM läuft in Echtzeit: es dauert so lange wie die Aufnahme. Tab offen lassen.": "M4A/WebM se fait en temps réel : cela dure aussi longtemps que l’enregistrement. Laisse l’onglet ouvert.",
    "Entschlüssele Ton …": "Décodage du son …", "Rechne um …": "Calcul …", "Der Ton konnte nicht gelesen werden. Probier M4A/WebM (Echtzeit) oder ein anderes Format.": "Le son n’a pas pu être lu. Essaie M4A/WebM (temps réel) ou un autre format.",
    "Video oder Audio": "Vidéo ou audio", "nur Ton": "son seulement",
    "◀ Bild": "◀ image", "Bild ▶": "image ▶", "Dieses Bild speichern": "Enregistrer cette image", "Viele Bilder:": "Beaucoup d’images :", "Sekunden ein Bild (höchstens 200)": "secondes une image (200 au maximum)", "Als ZIP erstellen": "Créer en ZIP",
    "Bild gespeichert – unten zum Herunterladen.": "Image enregistrée – à télécharger ci-dessous.", "Bilder …": "images …", "Bilder – ": "images – ", "Zeit": "Temps"
  });
  if (window.WZ) WZ._re = null;
}
})();
