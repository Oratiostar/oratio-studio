// Medien-Werkstatt für die Datei-Werkstatt: Video verkleinern & umwandeln, Audio, Einzelbilder.
// Alles läuft im Browser (MediaRecorder + Canvas + WebAudio) – nichts wird hochgeladen.
//
// TÜR FÜR WEITERE PROJEKTE
//  • Neues Werkzeug: eigene Datei nach datei.js laden und mit DateiWerkstatt.tool({ id, titel, sym, farbe, text, build(sec){ … } }) anmelden.
//  • Gemeinsame Bausteine stehen hier unter window.OratioMedien: formate(), pruefe(file), aufnehmen(opt), wav(buffer), zeit(s).
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
  { id: "webm", name: "WebM (VP9) – oft kleiner", ext: "webm", mimes: ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm;codecs=av1,opus", "video/webm"] }
];
const AUDIO_FORMATE = [
  { id: "m4a", name: "M4A (AAC) – klein", ext: "m4a", mimes: ["audio/mp4;codecs=mp4a.40.2", "audio/mp4"] },
  { id: "webm", name: "WebM (Opus) – klein", ext: "webm", mimes: ["audio/webm;codecs=opus", "audio/webm"] }
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
window.OratioMedien = { formate, pruefe, aufnehmen, wav, zeit, VIDEO_FORMATE, AUDIO_FORMATE };

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

// ------------------------------------------------------------------ 1) Video verkleinern & umwandeln
DW.tool({ id: "video", titel: "Video verkleinern & umwandeln", sym: "🎬", farbe: "#d9453b",
  text: "Große Videos (auch iPhone-MOV) kleiner machen und als MP4 oder WebM speichern – mit Größe, Qualität, Zuschneiden, Drehen und Ton an/aus.",
  build(sec){
    const fm = formate(VIDEO_FORMATE);
    if (!fm.length) { sec.innerHTML = '<p class="status bad">Dieser Browser kann keine Videos aufnehmen. Bitte Chrome, Edge, Firefox oder Safari (neu) benutzen.</p>'; return; }
    sec.innerHTML =
      '<div class="liste"></div><div class="org-bar" id="info" hidden></div><div id="opt" hidden>' +
      '<label class="l">Vorgabe</label><div class="tabs" id="pre"><button class="btn" data-p="klein">Klein (Messenger)</button><button class="btn on" data-p="mittel">Ausgewogen</button><button class="btn" data-p="hoch">Hohe Qualität</button></div>' +
      '<div class="cols2"><div><label class="l">Format</label><select class="in" id="fm">' + fm.map(f => '<option value="' + f.id + '">' + esc(f.name) + '</option>').join("") + '</select></div>' +
      '<div><label class="l">Größe (kürzere Seite)</label><select class="in" id="gr"><option value="0">Wie Original</option><option value="1080">1080 p (Full HD)</option><option value="720">720 p (HD)</option><option value="480">480 p</option><option value="360">360 p (sehr klein)</option><option value="240">240 p</option></select></div>' +
      '<div><label class="l">Bilder pro Sekunde</label><select class="in" id="fps"><option value="30">30 (wie Original, max. 30)</option><option value="24">24</option><option value="15">15 (sehr klein)</option></select></div>' +
      '<div><label class="l">Drehen</label><select class="in" id="dr"><option value="0">Nicht drehen</option><option value="90">90° rechts</option><option value="180">180°</option><option value="270">90° links</option></select></div></div>' +
      '<div class="rg"><span>Qualität</span><input type="range" id="q" min="1" max="10" value="5"><output id="qO"></output></div>' +
      schnittHTML() +
      '<label class="chk"><input type="checkbox" id="ton" checked> Ton behalten</label><label class="chk"><input type="checkbox" id="sp"> Spiegeln (links ↔ rechts)</label>' +
      '<p class="muted" id="schaetz" style="margin:8px 0"></p>' +
      '<p class="muted" style="font-size:13px;margin:0 0 6px">Das Umwandeln läuft in Echtzeit: es dauert so lange wie das Video. Lass den Tab offen und den Bildschirm an – ich halte ihn wach, wenn dein Gerät das erlaubt.</p>' +
      '<div class="row"><button class="btn go" id="go" disabled>Umwandeln</button><button class="btn" id="stop" hidden>Abbrechen</button></div></div><div class="ausgabe"></div>';
    const out = Ausgabe($(".ausgabe", sec)); let q = null, abbruch = { flag: false };
    const li = Liste($(".liste", sec), { accept: "video/*,.mov,.mp4,.m4v,.webm,.mkv,.3gp", multiple: false, titel: "Video hier ablegen (z. B. iPhone-MOV)", meldung: out.say, sortieren: false,
      onChange: async it => {
        out.leer(); $("#opt", sec).hidden = true; $("#info", sec).hidden = true; $("#go", sec).disabled = true; if (q) { URL.revokeObjectURL(q.url); q = null; } if (!it.length) return;
        try { out.say("Lese Video …"); q = await pruefe(it[0].file); out.say("");
          const inf = $("#info", sec); inf.hidden = false; inf.innerHTML = '<b>' + esc(it[0].file.name) + '</b><br>' + q.w + '×' + q.h + ' · ' + zeit(q.dauer) + ' · ' + G(it[0].file.size);
          $("#opt", sec).hidden = false; $("#go", sec).disabled = false; schnittSetzen(sec, q.dauer); preset("mittel"); upd();
        } catch (e) { fehler(out, e); } } });
    const PRE = { klein: { gr: 480, fps: 30, q: 3 }, mittel: { gr: 720, fps: 30, q: 5 }, hoch: { gr: 1080, fps: 30, q: 8 } };
    function preset(p){ const o = PRE[p]; $("#gr", sec).value = o.gr; $("#fps", sec).value = o.fps; $("#q", sec).value = o.q; sec.querySelectorAll("#pre .btn").forEach(b => b.classList.toggle("on", b.dataset.p === p));
      ["gr", "fps"].forEach(i => $("#" + i, sec).dispatchEvent(new Event("change"))); upd(); }
    $("#pre", sec).onclick = e => { const b = e.target.closest("button"); if (b) preset(b.dataset.p); };
    function ziel(){
      const kurz = +$("#gr", sec).value, rot = +$("#dr", sec).value; let w = q.w, h = q.h;
      if (kurz && Math.min(w, h) > kurz) { const f = kurz / Math.min(w, h); w *= f; h *= f; }
      w = gerade(w); h = gerade(h); if (rot % 180) [w, h] = [h, w];
      const fps = +$("#fps", sec).value, qq = +$("#q", sec).value, bpp = 0.03 + (qq - 1) * 0.0175, vbr = Math.min(40e6, Math.round(w * h * fps * bpp)), abr = $("#ton", sec).checked ? 128000 : 0;
      const sc = lesenSchnitt(sec); return { w, h, rot, fps, vbr, abr, sc, schaetz: (vbr + abr) * (sc.ende - sc.start) / 8 };
    }
    function upd(){ $("#qO", sec).textContent = ["", "sehr klein", "sehr klein", "klein", "klein", "mittel", "gut", "gut", "sehr gut", "sehr gut", "maximal"][+$("#q", sec).value];
      if (!q) return; const z = ziel(); $("#schaetz", sec).innerHTML = 'Ergebnis: <b>' + z.w + '×' + z.h + '</b> · ' + zeit(z.sc.ende - z.sc.start) + ' · ca. <b>' + G(z.schaetz) + '</b>' + (li.items[0] && z.schaetz >= li.items[0].file.size ? ' <span class="muted">(größer als das Original – wähle kleiner oder weniger Qualität)</span>' : ""); }
    sec.addEventListener("input", upd); sec.addEventListener("change", upd);
    $("#stop", sec).onclick = () => { abbruch.flag = true; };
    wrapRun($("#go", sec), async () => {
      if (!q) return; out.leer(); abbruch = { flag: false }; const z = ziel(), f = fm.find(x => x.id === $("#fm", sec).value), file = li.items[0].file;
      $("#stop", sec).hidden = false; out.say("Wandle um … Tab offen lassen."); out.prog(0);
      const vis = () => { if (document.hidden) out.say("Der Tab ist im Hintergrund – das kann stocken. Bitte zurückkehren.", "bad"); }; document.addEventListener("visibilitychange", vis);
      try {
        const blob = await aufnehmen({ url: q.url, w: z.w, h: z.h, fps: z.fps, mime: f.mime, vbr: z.vbr, abr: z.abr, ton: $("#ton", sec).checked, start: z.sc.start, ende: z.sc.ende, drehen: z.rot, spiegeln: $("#sp", sec).checked, fortschritt: p => out.prog(p), abbruch });
        if (!blob.size) throw new Error("Es ist nichts herausgekommen. Probier ein anderes Format.");
        out.prog(null); out.add(WZ.sauber(file.name) + "_klein." + f.ext, blob, z.w + "×" + z.h + " · " + G(file.size) + " → " + G(blob.size) + (blob.size < file.size ? " (−" + Math.round((1 - blob.size / file.size) * 100) + " %)" : ""));
        out.say(blob.size < file.size ? "Fertig." : "Fertig – aber größer als das Original. Wähle eine kleinere Größe oder weniger Qualität.", blob.size < file.size ? "ok" : "bad");
      } catch (e) { fehler(out, e); } finally { document.removeEventListener("visibilitychange", vis); $("#stop", sec).hidden = true; } });
  } });

// ------------------------------------------------------------------ 2) Ton: aus Video holen oder Audio umwandeln
DW.tool({ id: "audio", titel: "Ton aus Video holen & Audio umwandeln", sym: "🎧", farbe: "#7a52d6",
  text: "Den Ton aus einem Video (z. B. iPhone-MOV) oder eine Audio-Datei als WAV, M4A oder WebM speichern – mit Zuschneiden, Mono und kleinerer Abtastrate.",
  build(sec){
    const fm = formate(AUDIO_FORMATE);
    sec.innerHTML = '<div class="liste"></div><div class="org-bar" id="info" hidden></div><div id="opt" hidden>' +
      '<div class="cols2"><div><label class="l">Format</label><select class="in" id="fm"><option value="wav">WAV (verlustfrei, sehr groß)</option>' + fm.map(f => '<option value="' + f.id + '">' + esc(f.name) + '</option>').join("") + '</select></div>' +
      '<div><label class="l">Kanäle</label><select class="in" id="ka"><option value="0">Wie Original</option><option value="1">Mono (halb so groß)</option></select></div>' +
      '<div id="wsr"><label class="l">Abtastrate (nur WAV)</label><select class="in" id="sr"><option value="0">Wie Original</option><option value="44100">44,1 kHz (CD)</option><option value="22050">22,05 kHz</option><option value="16000">16 kHz (Sprache)</option></select></div>' +
      '<div id="wbr"><label class="l">Qualität (nur M4A/WebM)</label><select class="in" id="br"><option value="64000">64 kbit/s (Sprache)</option><option value="96000">96 kbit/s</option><option value="128000" selected>128 kbit/s</option><option value="192000">192 kbit/s</option></select></div></div>' +
      schnittHTML() + '<p class="muted" id="hinw" style="font-size:13px;margin:8px 0"></p>' +
      '<div class="row"><button class="btn go" id="go" disabled>Umwandeln</button><button class="btn" id="stop" hidden>Abbrechen</button></div></div><div class="ausgabe"></div>';
    const out = Ausgabe($(".ausgabe", sec)); let q = null, abbruch = { flag: false };
    const li = Liste($(".liste", sec), { accept: "audio/*,video/*,.mov,.mp4,.m4a,.mp3,.wav,.aac,.m4v,.webm,.ogg", multiple: false, titel: "Video oder Audio hier ablegen", meldung: out.say, sortieren: false,
      onChange: async it => {
        out.leer(); $("#opt", sec).hidden = true; $("#info", sec).hidden = true; $("#go", sec).disabled = true; if (q) { URL.revokeObjectURL(q.url); q = null; } if (!it.length) return;
        try { out.say("Lese Datei …"); const f = it[0].file, istVideo = /^video\//.test(f.type) || /\.(mov|mp4|m4v|webm|3gp)$/i.test(f.name);
          try { q = await pruefe(f, !istVideo); } catch (e) { q = await pruefe(f, true); } out.say("");
          const inf = $("#info", sec); inf.hidden = false; inf.innerHTML = '<b>' + esc(f.name) + '</b><br>' + zeit(q.dauer) + ' · ' + G(f.size) + (q.w ? ' · Video ' + q.w + '×' + q.h : " · nur Ton");
          $("#opt", sec).hidden = false; $("#go", sec).disabled = false; schnittSetzen(sec, q.dauer); upd();
        } catch (e) { fehler(out, e); } } });
    function upd(){ const w = $("#fm", sec).value === "wav"; $("#wsr", sec).hidden = !w; $("#wbr", sec).hidden = w;
      $("#hinw", sec).textContent = w ? "WAV wird sofort berechnet (schnell)." : "M4A/WebM läuft in Echtzeit: es dauert so lange wie die Aufnahme. Tab offen lassen."; }
    sec.addEventListener("change", upd); upd();
    $("#stop", sec).onclick = () => { abbruch.flag = true; };
    wrapRun($("#go", sec), async () => {
      if (!q) return; out.leer(); abbruch = { flag: false }; const file = li.items[0].file, sc = lesenSchnitt(sec), art = $("#fm", sec).value, mono = $("#ka", sec).value === "1";
      try {
        if (art === "wav"){
          out.say("Entschlüssele Ton …"); const AC = window.AudioContext || window.webkitAudioContext, ac = new AC();
          let dec; try { const ab = await file.arrayBuffer(); dec = await new Promise((ok, err) => { const p = ac.decodeAudioData(ab, ok, err); if (p && p.then) p.then(ok, err); }); } /* Promise- und Callback-Form (ältere Safari) */
          catch (e) { try { ac.close(); } catch (x) {} throw new Error("Der Ton konnte nicht gelesen werden. Probier M4A/WebM (Echtzeit) oder ein anderes Format."); }
          try { ac.close(); } catch (x) {}
          const sr = +$("#sr", sec).value || dec.sampleRate, kan = mono ? 1 : dec.numberOfChannels, len = Math.max(1, Math.round((sc.ende - sc.start) * sr));
          const off = new OfflineAudioContext(kan, len, sr), src = off.createBufferSource(); src.buffer = dec; src.connect(off.destination); src.start(0, sc.start, sc.ende - sc.start);
          out.say("Rechne um …"); const fertig = await off.startRendering(); const blob = wav(fertig);
          out.add(WZ.sauber(file.name) + ".wav", blob, zeit(sc.ende - sc.start) + " · " + G(file.size) + " → " + G(blob.size)); out.say("Fertig.", "ok");
        } else {
          const f = fm.find(x => x.id === art); $("#stop", sec).hidden = false; out.say("Nehme auf … Tab offen lassen."); out.prog(0);
          const blob = await aufnehmen({ url: q.url, nurTon: true, mime: f.mime, abr: +$("#br", sec).value, ton: true, start: sc.start, ende: sc.ende, fortschritt: p => out.prog(p), abbruch });
          out.prog(null); out.add(WZ.sauber(file.name) + "." + f.ext, blob, zeit(sc.ende - sc.start) + " · " + G(file.size) + " → " + G(blob.size)); out.say("Fertig.", "ok");
        }
      } catch (e) { fehler(out, e); } finally { $("#stop", sec).hidden = true; } });
  } });

// ------------------------------------------------------------------ 3) Einzelbilder aus Video
DW.tool({ id: "vidbild", titel: "Bilder aus Video holen", sym: "📸", farbe: "#1f9d8b",
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
    "Große Videos (auch iPhone-MOV) kleiner machen und als MP4 oder WebM speichern – mit Größe, Qualität, Zuschneiden, Drehen und Ton an/aus.": "Réduire de grosses vidéos (même MOV d’iPhone) et les enregistrer en MP4 ou WebM – avec taille, qualité, découpe, rotation et son activé/désactivé.",
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
