// Medien-Werkstatt – Musik & Ton: Schneiden/Umwandeln mit Wellenform, Songs verbinden, Musik-Analyse (BPM, Tonart, Pegel), Tongenerator.
// Braucht datei.js und medien.js (davor laden). Alles läuft im Browser – nichts wird hochgeladen.
(function(){
"use strict";
const DW = window.DateiWerkstatt, OM = window.OratioMedien; if (!DW || !DW.tool || !OM) return;
const { Ausgabe, wrapRun, fehler, esc, G } = DW; const { Eingabe, zeit, formate, AUDIO_FORMATE, wav } = OM;
const $ = (s, r) => (r || document).querySelector(s);
const AC = window.AudioContext || window.webkitAudioContext;
const AKZEPT = "audio/*,video/*,.mp3,.m4a,.wav,.aac,.flac,.ogg,.opus,.mov,.mp4,.m4v,.webm,.3gp";
const NODECODE = "Der Ton konnte nicht gelesen werden. Das Format wird von diesem Browser nicht entschlüsselt – probier ein anderes Gerät oder eine andere Datei.";

// ------------------------------------------------------------------ Bausteine
// Datei → AudioBuffer (auch aus Video-Dateien)
async function dekodieren(file){
  const ac = new AC(); try {
    const ab = await file.arrayBuffer();
    return await new Promise((ok, err) => { const p = ac.decodeAudioData(ab, ok, err); if (p && p.then) p.then(ok, err); });
  } catch (e) { throw new Error(NODECODE); } finally { try { ac.close(); } catch (e) {} }
}
const dB = x => x > 0 ? 20 * Math.log10(x) : -120;
function spitze(buf, a, b){ let p = 0; const i0 = Math.max(0, Math.floor(a * buf.sampleRate)), i1 = Math.min(buf.length, Math.ceil(b * buf.sampleRate)); for (let c = 0; c < buf.numberOfChannels; c++){ const d = buf.getChannelData(c); for (let i = i0; i < i1; i++){ const v = d[i] < 0 ? -d[i] : d[i]; if (v > p) p = v; } } return p; }
// Stille am Anfang und Ende finden
function stilleGrenzen(buf, schwelleDb){
  const blk = Math.max(1, Math.round(buf.sampleRate * .01)), n = Math.ceil(buf.length / blk), th = Math.pow(10, (schwelleDb || -48) / 20); let ersterB = -1, letzterB = -1;
  for (let k = 0; k < n; k++){ let p = 0; for (let c = 0; c < buf.numberOfChannels; c++){ const d = buf.getChannelData(c), e = Math.min(buf.length, (k + 1) * blk); for (let i = k * blk; i < e; i++){ const v = d[i] < 0 ? -d[i] : d[i]; if (v > p) p = v; } }
    if (p > th){ if (ersterB < 0) ersterB = k; letzterB = k; } }
  if (ersterB < 0) return [0, buf.duration];
  return [Math.max(0, ersterB * .01 - .05), Math.min(buf.duration, (letzterB + 1) * .01 + .15)];
}
// Offline berechnen: Ausschnitt, Lautstärke, Normalisieren, Ein-/Ausblenden, Mono, Abtastrate
async function rendern(buf, o){
  const a = o.start || 0, b = Math.min(o.ende || buf.duration, buf.duration), sr = o.sr || buf.sampleRate, kan = o.mono ? 1 : buf.numberOfChannels, len = Math.max(1, Math.round((b - a) * sr));
  let g = Math.pow(10, (o.db || 0) / 20), warnung = "";
  if (o.norm){ const p = spitze(buf, a, b); if (p > 0) g *= .97 / p; }
  const sp = spitze(buf, a, b) * g; if (sp > 1.0001) warnung = "Achtung: Die Lautstärke ist so hoch, dass der Ton übersteuert (" + dB(sp).toFixed(1).replace(".", ",") + " dB). Nimm sie etwas zurück.";
  const off = new OfflineAudioContext(kan, len, sr), src = off.createBufferSource(), gn = off.createGain(); src.buffer = buf; src.connect(gn); gn.connect(off.destination);
  const dur = b - a, fi = Math.min(o.fadeIn || 0, dur / 2), fo = Math.min(o.fadeOut || 0, dur / 2);
  gn.gain.setValueAtTime(fi > 0 ? 0 : g, 0); if (fi > 0) gn.gain.linearRampToValueAtTime(g, fi); if (fo > 0){ gn.gain.setValueAtTime(g, dur - fo); gn.gain.linearRampToValueAtTime(0, dur); }
  src.start(0, a, dur); const fertig = await off.startRendering(); return { buf: fertig, warnung, db: o.norm ? dB(g) : (o.db || 0) };
}
// Fertigen Puffer komprimiert speichern (läuft in Echtzeit)
async function aufnehmenBuffer(buf, mime, abr, fort, abbruch){
  const ac = new AC(); try { await ac.resume(); } catch (e) {}
  const src = ac.createBufferSource(), ziel = ac.createMediaStreamDestination(); src.buffer = buf; src.connect(ziel);
  const rec = new MediaRecorder(ziel.stream, { mimeType: mime, audioBitsPerSecond: abr }), teile = []; rec.ondataavailable = e => { if (e.data && e.data.size) teile.push(e.data); };
  const fertig = new Promise(r => { rec.onstop = r; }); const t0 = ac.currentTime; let aus = false;
  const stopp = () => { if (aus) return; aus = true; clearInterval(w); try { src.stop(); } catch (e) {} try { if (rec.state !== "inactive") rec.stop(); } catch (e) {} };
  const w = setInterval(() => { if (fort) fort(Math.min(1, (ac.currentTime - t0) / buf.duration)); if (abbruch && abbruch.flag) stopp(); }, 250);
  src.onended = stopp; rec.start(1000); src.start(); await fertig; try { ac.close(); } catch (e) {}
  if (abbruch && abbruch.flag) throw new Error("Abgebrochen."); return new Blob(teile, { type: mime.split(";")[0] });
}
// FFT (Radix-2)
function fft(re, im){
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++){ let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j){ let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
  for (let len = 2; len <= n; len <<= 1){ const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang), h = len >> 1;
    for (let i = 0; i < n; i += len){ let cr = 1, ci = 0; for (let k = 0; k < h; k++){ const a = i + k, b = a + h, tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr; re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti; const nc = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nc; } } }
}
const hann = n => { const w = new Float32Array(n); for (let i = 0; i < n; i++) w[i] = .5 - .5 * Math.cos(2 * Math.PI * i / (n - 1)); return w; };
function mono(buf){ const n = buf.length, m = new Float32Array(n), k = buf.numberOfChannels; for (let c = 0; c < k; c++){ const d = buf.getChannelData(c); for (let i = 0; i < n; i++) m[i] += d[i] / k; } return m; }
function runter(m, f){ if (f <= 1) return m; const n = Math.floor(m.length / f), o = new Float32Array(n); for (let i = 0; i < n; i++){ let s = 0; for (let j = 0; j < f; j++) s += m[i * f + j]; o[i] = s / f; } return o; }

// Tempo (BPM) aus Onset-Verlauf + Autokorrelation
function bpmSchaetzen(m, sr){
  const f = Math.max(1, Math.floor(sr / 11025)), d = runter(m, f), sr2 = sr / f, N = 1024, hop = 256, fenster = hann(N), maxN = Math.floor(sr2 * 100);
  const von = Math.max(0, Math.floor((d.length - maxN) / 2)), bis = Math.min(d.length, von + maxN), frames = Math.floor((bis - von - N) / hop); if (frames < 64) return null;
  const re = new Float32Array(N), im = new Float32Array(N), vorher = new Float32Array(N / 2), env = new Float32Array(frames);
  for (let t = 0; t < frames; t++){ for (let i = 0; i < N; i++){ re[i] = d[von + t * hop + i] * fenster[i]; im[i] = 0; } fft(re, im); let flux = 0;
    for (let k = 1; k < N / 2; k++){ const mg = Math.log(1 + 30 * Math.hypot(re[k], im[k])); const dd = mg - vorher[k]; if (dd > 0) flux += dd; vorher[k] = mg; } env[t] = flux; }
  const w = Math.round(.5 * sr2 / hop) | 1, ne = new Float32Array(frames); // lokalen Mittelwert abziehen
  for (let t = 0; t < frames; t++){ let s = 0, c = 0; for (let j = Math.max(0, t - w); j < Math.min(frames, t + w + 1); j++){ s += env[j]; c++; } ne[t] = Math.max(0, env[t] - s / c); }
  const fps = sr2 / hop, lagMin = Math.floor(fps * 60 / 200), lagMax = Math.ceil(fps * 60 / 60), ac = new Float32Array(lagMax + 2);
  for (let L = lagMin - 1; L <= lagMax + 1; L++){ let s = 0; for (let t = 0; t + L < frames; t++) s += ne[t] * ne[t + L]; ac[L] = s / (frames - L); }
  let best = -1, bs = 0; for (let L = lagMin; L <= lagMax; L++){ const bpm = 60 * fps / L, wgt = Math.exp(-Math.pow(Math.log2(bpm / 120), 2) / (2 * .55 * .55)); const sc = ac[L] * wgt; if (sc > bs && ac[L] >= ac[L - 1] && ac[L] >= ac[L + 1]) { bs = sc; best = L; } }
  if (best < 0) return null; const a1 = ac[best - 1], a2 = ac[best], a3 = ac[best + 1], den = a1 - 2 * a2 + a3, off = den ? .5 * (a1 - a3) / den : 0;
  return 60 * fps / (best + off);
}
// Tonart über Chroma + Krumhansl-Profile
const DUR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88], MOLL = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
const NOTEN = ["C", "Cis", "D", "Es", "E", "F", "Fis", "G", "As", "A", "B", "H"];
const CAM_DUR = ["8B", "3B", "10B", "5B", "12B", "7B", "2B", "9B", "4B", "11B", "6B", "1B"], CAM_MOLL = ["5A", "12A", "7A", "2A", "9A", "4A", "11A", "6A", "1A", "8A", "3A", "10A"];
function tonartSchaetzen(m, sr){
  const f = Math.max(1, Math.floor(sr / 11025)), d = runter(m, f), sr2 = sr / f, N = 8192, fenster = hann(N), frames = Math.floor((d.length - N) / N); if (frames < 4) return null;
  const mitte = Math.max(0, Math.floor(frames / 2 - 7)), ende = Math.min(frames, mitte + 14), re = new Float32Array(N), im = new Float32Array(N), chroma = new Float64Array(12);
  for (let t = mitte; t < ende; t++){ for (let i = 0; i < N; i++){ re[i] = d[t * N + i] * fenster[i]; im[i] = 0; } fft(re, im);
    for (let k = 1; k < N / 2; k++){ const fr = k * sr2 / N; if (fr < 65 || fr > 1700) continue; const pc = ((Math.round(12 * Math.log2(fr / 440) + 69) % 12) + 12) % 12; chroma[pc] += Math.sqrt(Math.hypot(re[k], im[k])); } }
  const korr = (x, y) => { const mx = x.reduce((a, b) => a + b, 0) / 12, my = y.reduce((a, b) => a + b, 0) / 12; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < 12; i++){ sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; } return sxy / Math.sqrt(sxx * syy || 1); };
  let best = null; const c = Array.from(chroma);
  for (let r = 0; r < 12; r++){ const rot = i => c[(i + r) % 12]; for (const [art, prof] of [["dur", DUR], ["moll", MOLL]]){ const v = korr(Array.from({ length: 12 }, (_, i) => rot(i)), prof); if (!best || v > best.v) best = { v, pc: r, art }; } }
  return { name: NOTEN[best.pc] + (best.art === "dur" ? "-Dur" : "-Moll"), camelot: (best.art === "dur" ? CAM_DUR : CAM_MOLL)[best.pc], sicher: best.v };
}
function spektrum(buf, baender){
  const N = 2048, d = buf.getChannelData(0), fenster = hann(N), re = new Float32Array(N), im = new Float32Array(N), acc = new Float64Array(N / 2), anz = Math.min(60, Math.max(1, Math.floor(d.length / N)));
  for (let s = 0; s < anz; s++){ const o = Math.floor(s * (d.length - N) / Math.max(1, anz - 1)); for (let i = 0; i < N; i++){ re[i] = (d[o + i] || 0) * fenster[i]; im[i] = 0; } fft(re, im); for (let k = 0; k < N / 2; k++) acc[k] += Math.hypot(re[k], im[k]); }
  const sr = buf.sampleRate, lo = 40, hi = Math.min(16000, sr / 2), out = [];
  for (let b = 0; b < baender; b++){ const f0 = lo * Math.pow(hi / lo, b / baender), f1 = lo * Math.pow(hi / lo, (b + 1) / baender); let s = 0, n = 0; for (let k = Math.floor(f0 * N / sr); k <= Math.ceil(f1 * N / sr) && k < N / 2; k++){ s += acc[k]; n++; } out.push(n ? s / n / anz : 0); }
  const mx = Math.max(...out) || 1; return out.map(v => Math.max(0, 1 + dB(v / mx) / 60));
}
OM.audio = { dekodieren, rendern, aufnehmenBuffer, stilleGrenzen, spitze, fft, bpmSchaetzen, tonartSchaetzen, spektrum, dB };

// ------------------------------------------------------------------ Wellenform mit ziehbaren Griffen
function Welle(box, buf, o){
  o = o || {}; box.innerHTML = '<canvas class="welle" style="width:100%;height:120px;display:block;border-radius:14px;background:var(--soft);touch-action:none;cursor:ew-resize"></canvas>';
  const c = box.firstChild, x = c.getContext("2d"); let W = 0, H = 0, a = 0, b = buf.duration, pos = null, peaks = null, ziehen = null, ac = null, src = null, raf = 0;
  const farbe = () => (getComputedStyle(document.documentElement).getPropertyValue("--acc") || "#27a3df").trim() || "#27a3df";
  function messen(){ const r = c.getBoundingClientRect(), dpr = window.devicePixelRatio || 1; W = Math.max(40, Math.round(r.width)); H = Math.round(r.height); c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
    peaks = new Float32Array(W * 2); const n = buf.length, per = n / W; for (let px = 0; px < W; px++){ let mn = 0, mx = 0; const i0 = Math.floor(px * per), i1 = Math.min(n, Math.floor((px + 1) * per) + 1), step = Math.max(1, Math.floor((i1 - i0) / 64));
      for (let ch = 0; ch < buf.numberOfChannels; ch++){ const dd = buf.getChannelData(ch); for (let i = i0; i < i1; i += step){ const v = dd[i]; if (v < mn) mn = v; if (v > mx) mx = v; } } peaks[px * 2] = mn; peaks[px * 2 + 1] = mx; } zeichnen(); }
  const xz = t => t / buf.duration * W, tz = px => Math.max(0, Math.min(buf.duration, px / W * buf.duration));
  function zeichnen(){
    x.clearRect(0, 0, W, H); const mid = H / 2, f = farbe(), pa = xz(a), pb = xz(b);
    for (let px = 0; px < W; px++){ const inn = px >= pa && px <= pb; x.fillStyle = inn ? f : "rgba(128,140,160,.55)"; const mn = peaks[px * 2] * mid * .92, mx = peaks[px * 2 + 1] * mid * .92; x.fillRect(px, mid - mx, 1, Math.max(1, mx - mn)); }
    x.fillStyle = "rgba(0,0,0,.25)"; x.fillRect(0, 0, pa, H); x.fillRect(pb, 0, W - pb, H);
    x.fillStyle = f; for (const px of [pa, pb]){ x.fillRect(px - 1.5, 0, 3, H); x.beginPath(); x.arc(px, 10, 7, 0, 7); x.fill(); x.beginPath(); x.arc(px, H - 10, 7, 0, 7); x.fill(); }
    if (pos != null){ x.fillStyle = "#fff"; x.fillRect(xz(pos) - 1, 0, 2, H); }
  }
  function nahe(px){ return Math.abs(px - xz(a)) <= Math.abs(px - xz(b)) ? "a" : "b"; }
  const lokal = e => e.clientX - c.getBoundingClientRect().left;
  c.addEventListener("pointerdown", e => { c.setPointerCapture(e.pointerId); ziehen = nahe(lokal(e)); bewegen(e); });
  c.addEventListener("pointermove", e => { if (ziehen) bewegen(e); }); c.addEventListener("pointerup", () => { ziehen = null; }); c.addEventListener("pointercancel", () => { ziehen = null; });
  function bewegen(e){ const t = tz(lokal(e)); if (ziehen === "a") a = Math.min(t, b - .2); else b = Math.max(t, a + .2); a = Math.max(0, a); b = Math.min(buf.duration, b); stopp(); zeichnen(); if (o.onChange) o.onChange(a, b); }
  function stopp(){ if (src){ try { src.onended = null; src.stop(); } catch (e) {} src = null; } cancelAnimationFrame(raf); pos = null; if (ac){ try { ac.close(); } catch (e) {} ac = null; } zeichnen(); if (o.onStopp) o.onStopp(); }
  function spielen(){ stopp(); ac = new AC(); src = ac.createBufferSource(); src.buffer = buf; src.connect(ac.destination); const t0 = ac.currentTime; src.start(0, a, b - a); src.onended = stopp;
    const lauf = () => { if (!ac) return; pos = a + (ac.currentTime - t0); zeichnen(); raf = requestAnimationFrame(lauf); }; lauf(); if (o.onStart) o.onStart(); }
  messen(); if (window.ResizeObserver) new ResizeObserver(() => { if (c.getBoundingClientRect().width !== W) messen(); }).observe(c);
  return { get: () => ({ start: a, ende: b }), set(s, e){ a = Math.max(0, s); b = Math.min(buf.duration, e); zeichnen(); if (o.onChange) o.onChange(a, b); }, spielen, stopp, spielt: () => !!src, weg(){ stopp(); } };
}

// ------------------------------------------------------------------ 1) Audio schneiden & umwandeln
DW.tool({ id: "audio", gruppe: "musik", titel: "Audio schneiden & bearbeiten", sym: "✂️", farbe: "#7a52d6",
  text: "Songs, Sprachmemos oder den Ton eines Videos mit Wellenform schneiden, lauter machen, ein- und ausblenden, Stille abschneiden.",
  build(sec){
    const fm = formate(AUDIO_FORMATE);
    sec.innerHTML = '<div class="liste"></div><div class="org-bar" id="info" hidden></div><div id="opt" hidden>' +
      '<div id="wv"></div><div class="row" style="margin:8px 0"><button class="btn sm" id="pl">▶ Auswahl anhören</button><button class="btn sm" id="sti" title="Stille am Anfang und Ende wegschneiden">🔇 Stille abschneiden</button><button class="btn sm" id="alle">Alles auswählen</button><span class="sp" style="flex:1"></span><b id="sel" class="muted"></b></div>' +
      '<div class="cols2"><div><label class="l">Format</label><select class="in" id="fm"><option value="wav">WAV (verlustfrei, sehr groß)</option>' + fm.map(f => '<option value="' + f.id + '">' + esc(f.name) + '</option>').join("") + (fm.some(f => f.id === "m4a") ? '<option value="m4r">M4R – iPhone-Klingelton (max. 40 s)</option>' : "") + '</select></div>' +
      '<div><label class="l">Kanäle</label><select class="in" id="ka"><option value="0">Wie Original</option><option value="1">Mono (halb so groß)</option></select></div>' +
      '<div id="wsr"><label class="l">Abtastrate (nur WAV)</label><select class="in" id="sr"><option value="0">Wie Original</option><option value="44100">44,1 kHz (CD)</option><option value="22050">22,05 kHz</option><option value="16000">16 kHz (Sprache)</option></select></div>' +
      '<div id="wbr"><label class="l">Qualität (M4A/WebM/M4R)</label><select class="in" id="br"><option value="64000">64 kbit/s (Sprache)</option><option value="96000">96 kbit/s</option><option value="128000" selected>128 kbit/s</option><option value="192000">192 kbit/s</option><option value="256000">256 kbit/s (sehr gut)</option></select></div></div>' +
      '<div class="rg"><span>Lautstärke</span><input type="range" id="db" min="-12" max="12" step="0.5" value="0"><output id="dbO"></output></div>' +
      '<div class="rg"><span>Einblenden</span><input type="range" id="fi" min="0" max="10" step="0.5" value="0"><output id="fiO"></output></div>' +
      '<div class="rg"><span>Ausblenden</span><input type="range" id="fo" min="0" max="10" step="0.5" value="0"><output id="foO"></output></div>' +
      '<label class="chk"><input type="checkbox" id="nm"> Lautstärke angleichen (so laut wie möglich, ohne zu übersteuern)</label>' +
      '<p class="muted" id="hinw" style="font-size:13px;margin:8px 0"></p><div class="row"><button class="btn go" id="go" disabled>Speichern</button><button class="btn" id="stop" hidden>Abbrechen</button></div></div><div class="ausgabe"></div>';
    const out = Ausgabe($(".ausgabe", sec)); let buf = null, w = null, abbruch = { flag: false };
    const li = Eingabe($(".liste", sec), { accept: AKZEPT, multiple: false, titel: "Audio oder Video hier ablegen", meldung: out.say, sortieren: false,
      onChange: async it => { out.leer(); if (w) { w.weg(); w = null; } buf = null; $("#opt", sec).hidden = true; $("#info", sec).hidden = true; $("#go", sec).disabled = true; if (!it.length) return;
        try { out.say("Lese und entschlüssele … (große Dateien dauern etwas)"); buf = await dekodieren(it[0].file); out.say("");
          const inf = $("#info", sec); inf.hidden = false; inf.innerHTML = '<b>' + esc(it[0].file.name) + '</b><br>' + zeit(buf.duration) + ' · ' + (buf.numberOfChannels === 1 ? "Mono" : "Stereo") + ' · ' + Math.round(buf.sampleRate / 100) / 10 + ' kHz · ' + G(it[0].file.size) + ' · Spitzenpegel ' + dB(spitze(buf, 0, buf.duration)).toFixed(1).replace(".", ",") + ' dB';
          $("#opt", sec).hidden = false; $("#go", sec).disabled = false; w = Welle($("#wv", sec), buf, { onChange: () => upd(), onStart: () => $("#pl", sec).textContent = "⏹ Stopp", onStopp: () => $("#pl", sec).textContent = "▶ Auswahl anhören" }); upd();
        } catch (e) { fehler(out, e); } } });
    $("#pl", sec).onclick = () => { if (!w) return; if (w.spielt()) w.stopp(); else w.spielen(); };
    $("#alle", sec).onclick = () => w && w.set(0, buf.duration);
    $("#sti", sec).onclick = () => { if (!buf) return; const g = stilleGrenzen(buf); w.set(g[0], g[1]); out.say(g[0] < .02 && g[1] > buf.duration - .02 ? "Keine Stille am Rand gefunden." : "Stille am Rand abgeschnitten – prüf es mit ▶.", "ok"); };
    function einst(){ const art = $("#fm", sec).value; let { start, ende } = w ? w.get() : { start: 0, ende: 0 }; if (art === "m4r" && ende - start > 40) ende = start + 40;
      return { art, start, ende, mono: $("#ka", sec).value === "1", sr: +$("#sr", sec).value, db: +$("#db", sec).value, fadeIn: +$("#fi", sec).value, fadeOut: +$("#fo", sec).value, norm: $("#nm", sec).checked, abr: +$("#br", sec).value }; }
    function upd(){ if (!buf) return; const e = einst(), wv = e.art === "wav", gesamt = w.get(), kuerzer = e.art === "m4r" && gesamt.ende - gesamt.start > 40;
      $("#wsr", sec).hidden = !wv; $("#wbr", sec).hidden = wv; $("#dbO", sec).textContent = (e.db > 0 ? "+" : "") + String(e.db).replace(".", ",") + " dB"; $("#fiO", sec).textContent = e.fadeIn ? String(e.fadeIn).replace(".", ",") + " s" : "aus"; $("#foO", sec).textContent = e.fadeOut ? String(e.fadeOut).replace(".", ",") + " s" : "aus";
      $("#sel", sec).textContent = zeit(e.start) + " – " + zeit(e.ende) + " · " + zeit(e.ende - e.start);
      const kan = e.mono ? 1 : buf.numberOfChannels, sr = e.sr || buf.sampleRate, geschaetzt = wv ? (e.ende - e.start) * sr * kan * 2 : (e.ende - e.start) * e.abr / 8;
      $("#hinw", sec).textContent = (wv ? "WAV wird sofort berechnet. " : "Dieses Format läuft in Echtzeit: es dauert so lange wie die Auswahl. Tab offen lassen. ") + "Ergebnis ca. " + G(geschaetzt) + "." + (kuerzer ? " Klingelton: nur die ersten 40 s der Auswahl." : "") + (e.art === "m4r" ? " Die Datei in iTunes/Musik auf den Mac ziehen oder in GarageBand als Klingelton öffnen." : ""); }
    sec.addEventListener("input", upd); sec.addEventListener("change", upd);
    $("#stop", sec).onclick = () => { abbruch.flag = true; };
    wrapRun($("#go", sec), async () => {
      if (!buf) return; w.stopp(); out.leer(); abbruch = { flag: false }; const e = einst(), file = li.items[0].file, name = WZ.sauber(file.name);
      try {
        out.say("Rechne …"); await WZ.warte(); const r = await rendern(buf, e);
        if (e.art === "wav"){ const blob = wav(r.buf); out.add(name + ".wav", blob, zeit(e.ende - e.start) + " · " + G(file.size) + " → " + G(blob.size)); }
        else { const f = fm.find(x => x.id === (e.art === "m4r" ? "m4a" : e.art)); $("#stop", sec).hidden = false; out.say("Nehme auf … Tab offen lassen."); out.prog(0);
          const blob = await aufnehmenBuffer(r.buf, f.mime, e.abr, p => out.prog(p), abbruch); out.prog(null); out.add(name + "." + (e.art === "m4r" ? "m4r" : f.ext), blob, zeit(e.ende - e.start) + " · " + G(file.size) + " → " + G(blob.size)); }
        out.say(r.warnung || "Fertig.", r.warnung ? "bad" : "ok");
      } catch (x) { fehler(out, x); } finally { $("#stop", sec).hidden = true; } });
  } });

// ------------------------------------------------------------------ 1b) Audio komprimieren  /  1c) Audio umwandeln
function aiff(buf){
  const kan = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate, daten = n * kan * 2, ab = new ArrayBuffer(54 + daten), dv = new DataView(ab);
  const t = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  t(0, "FORM"); dv.setUint32(4, 46 + daten); t(8, "AIFF"); t(12, "COMM"); dv.setUint32(16, 18); dv.setUint16(20, kan); dv.setUint32(22, n); dv.setUint16(26, 16);
  let ex = 0, m = sr; while (m >= 2){ m /= 2; ex++; } // 80-Bit-Extended der Abtastrate
  dv.setUint16(28, 16383 + ex); dv.setUint32(30, Math.floor(sr * Math.pow(2, 31 - ex)) >>> 0); dv.setUint32(34, 0);
  t(38, "SSND"); dv.setUint32(42, 8 + daten); dv.setUint32(46, 0); dv.setUint32(50, 0);
  const ch = []; for (let c = 0; c < kan; c++) ch.push(buf.getChannelData(c));
  let o = 54; for (let i = 0; i < n; i++) for (let c = 0; c < kan; c++){ const x = Math.max(-1, Math.min(1, ch[c][i])); dv.setInt16(o, x < 0 ? x * 0x8000 : x * 0x7fff); o += 2; }
  return new Blob([ab], { type: "audio/aiff" });
}
function audioEinfach(sec, umw){
  const fm = formate(AUDIO_FORMATE);
  const opt = umw
    ? '<option value="wav">WAV (verlustfrei)</option><option value="aiff">AIFF (verlustfrei, Apple/Studio)</option>' + fm.map(f => '<option value="' + f.id + '">' + esc(f.name) + '</option>').join("") + (fm.some(f => f.id === "m4a") ? '<option value="m4r">M4R – iPhone-Klingelton (max. 40 s)</option>' : "")
    : fm.map(f => '<option value="' + f.id + '">' + esc(f.name) + '</option>').join("");
  if (!umw && !fm.length) { sec.innerHTML = '<p class="status bad">Dieser Browser kann keinen komprimierten Ton speichern. Bitte Chrome, Edge, Firefox oder Safari (neu) benutzen.</p>'; return; }
  sec.innerHTML = '<div class="liste"></div><div class="org-bar" id="info" hidden></div><div id="opt" hidden><div class="cols2"><div><label class="l">' + (umw ? "Umwandeln in" : "Speichern als") + '</label><select class="in" id="fm">' + opt + '</select></div>' +
    (umw ? '<div id="wbr"><label class="l">Qualität (M4A, WebM, OGG)</label><select class="in" id="br"><option value="128000">128 kbit/s</option><option value="192000" selected>192 kbit/s</option><option value="256000">256 kbit/s (sehr gut)</option></select></div>'
         : '<div><label class="l">Ziel</label><select class="in" id="br"><option value="32000">Sprache winzig – 32 kbit/s, Mono</option><option value="64000" selected>Sprache/Podcast – 64 kbit/s</option><option value="96000">Klein – 96 kbit/s</option><option value="128000">Musik gut – 128 kbit/s</option><option value="192000">Musik sehr gut – 192 kbit/s</option></select></div><div><label class="l">Kanäle</label><select class="in" id="ka"><option value="auto">Automatisch (Mono bei Sprache)</option><option value="0">Wie Original</option><option value="1">Immer Mono</option></select></div>') + '</div>' +
    '<p class="muted" id="hinw" style="font-size:13px;margin:8px 0"></p><div class="row"><button class="btn go" id="go" disabled>' + (umw ? "Umwandeln" : "Komprimieren") + '</button><button class="btn" id="stop" hidden>Abbrechen</button></div></div><div class="ausgabe"></div>';
  const out = Ausgabe($(".ausgabe", sec)); let buf = null, abbruch = { flag: false };
  const li = Eingabe($(".liste", sec), { accept: AKZEPT, multiple: false, titel: "Audio oder Video hier ablegen", meldung: out.say, sortieren: false,
    onChange: async it => { out.leer(); buf = null; $("#opt", sec).hidden = true; $("#info", sec).hidden = true; $("#go", sec).disabled = true; if (!it.length) return;
      try { out.say("Lese und entschlüssele … (große Dateien dauern etwas)"); buf = await dekodieren(it[0].file); out.say("");
        const inf = $("#info", sec); inf.hidden = false; inf.innerHTML = '<b>' + esc(it[0].file.name) + '</b><br>' + zeit(buf.duration) + ' · ' + (buf.numberOfChannels === 1 ? "Mono" : "Stereo") + ' · ' + Math.round(buf.sampleRate / 100) / 10 + ' kHz · ' + G(it[0].file.size);
        $("#opt", sec).hidden = false; $("#go", sec).disabled = false; upd(); } catch (e) { fehler(out, e); } } });
  function upd(){ if (!buf) return; const art = $("#fm", sec).value, abr = +$("#br", sec).value, lossless = art === "wav" || art === "aiff";
    if (umw){ $("#wbr", sec).hidden = lossless; const m = art === "m4r" ? Math.min(40, buf.duration) : buf.duration;
      $("#hinw", sec).textContent = (lossless ? "Wird sofort berechnet. " : "Dieses Format läuft in Echtzeit: es dauert so lange wie das Stück. Tab offen lassen. ") + "Ergebnis ca. " + G(lossless ? m * buf.sampleRate * buf.numberOfChannels * 2 : m * abr / 8) + "." + (art === "m4r" ? " Klingelton: nur die ersten 40 s. Die Datei in iTunes/Musik auf den Mac ziehen." : ""); }
    else { const f = $("#fm", sec).value; $("#hinw", sec).textContent = "Dieses Format läuft in Echtzeit: es dauert so lange wie das Stück (" + zeit(buf.duration) + "). Tab offen lassen. Ergebnis ca. " + G(buf.duration * abr / 8) + " statt " + G(li.items[0].file.size) + "."; } }
  sec.addEventListener("input", upd); sec.addEventListener("change", upd);
  $("#stop", sec).onclick = () => { abbruch.flag = true; };
  wrapRun($("#go", sec), async () => {
    if (!buf) return; out.leer(); abbruch = { flag: false }; const file = li.items[0].file, name = WZ.sauber(file.name), art = $("#fm", sec).value, abr = +$("#br", sec).value;
    try {
      let mono = false; if (!umw){ const k = $("#ka", sec).value; mono = k === "1" || (k === "auto" && abr <= 64000); }
      let ende = buf.duration; if (art === "m4r") ende = Math.min(40, ende);
      out.say("Rechne …"); await WZ.warte(); const r = await rendern(buf, { start: 0, ende, mono, sr: 0, db: 0 });
      if (art === "wav" || art === "aiff"){ const blob = art === "wav" ? wav(r.buf) : aiff(r.buf); out.add(name + "." + art, blob, zeit(ende) + " · " + G(file.size) + " → " + G(blob.size)); }
      else { const f = fm.find(x => x.id === (art === "m4r" ? "m4a" : art)); $("#stop", sec).hidden = false; out.say("Nehme auf … Tab offen lassen."); out.prog(0);
        const blob = await aufnehmenBuffer(r.buf, f.mime, abr, p => out.prog(p), abbruch); out.prog(null);
        out.add(name + (umw ? "" : "_klein") + "." + (art === "m4r" ? "m4r" : f.ext), blob, zeit(ende) + " · " + G(file.size) + " → " + G(blob.size) + (!umw && blob.size < file.size ? " (−" + Math.round((1 - blob.size / file.size) * 100) + " %)" : "")); }
      out.say("Fertig.", "ok");
    } catch (x) { fehler(out, x); } finally { $("#stop", sec).hidden = true; } });
}
DW.tool({ id: "audiokomp", gruppe: "musik", titel: "Audio komprimieren", sym: "🗜️", farbe: "#8a4fd0",
  text: "Songs, Sprachmemos oder den Ton eines Videos kleiner machen – du wählst die Qualität, ich zeige die erwartete Größe. Für ein anderes Format: „Audio umwandeln“.",
  build(sec){ audioEinfach(sec, false); } });
DW.tool({ id: "audioformat", gruppe: "musik", titel: "Audio umwandeln", sym: "🔁", farbe: "#5b3fc4",
  text: "Das Format wechseln: WAV, AIFF, M4A, WebM, OGG oder iPhone-Klingelton (M4R) – aus Musik, Sprachmemos oder dem Ton eines Videos.",
  build(sec){ audioEinfach(sec, true); } });

// ------------------------------------------------------------------ 2) Songs verbinden mit Überblendung
DW.tool({ id: "join", gruppe: "musik", titel: "Songs verbinden & überblenden", sym: "🔗", farbe: "#c0398c",
  text: "Mehrere Lieder oder Aufnahmen hintereinander setzen – mit weicher Überblendung, gleicher Lautstärke und Reihenfolge nach Wunsch.",
  build(sec){
    const fm = formate(AUDIO_FORMATE);
    sec.innerHTML = '<div class="liste"></div><div id="opt" hidden><div class="rg"><span>Überblenden</span><input type="range" id="cf" min="0" max="12" step="0.5" value="3"><output id="cfO"></output></div>' +
      '<div class="cols2"><div><label class="l">Format</label><select class="in" id="fm"><option value="wav">WAV (verlustfrei, sehr groß)</option>' + fm.map(f => '<option value="' + f.id + '">' + esc(f.name) + '</option>').join("") + '</select></div>' +
      '<div><label class="l">Qualität (M4A/WebM)</label><select class="in" id="br"><option value="96000">96 kbit/s</option><option value="128000" selected>128 kbit/s</option><option value="192000">192 kbit/s</option><option value="256000">256 kbit/s</option></select></div></div>' +
      '<label class="chk"><input type="checkbox" id="nm" checked> Lautstärke aller Lieder angleichen</label><p class="muted" id="hinw" style="font-size:13px;margin:8px 0"></p>' +
      '<div class="row"><button class="btn go" id="go" disabled>Verbinden</button><button class="btn" id="stop" hidden>Abbrechen</button></div></div><div class="ausgabe"></div>';
    const out = Ausgabe($(".ausgabe", sec)); let abbruch = { flag: false }, daten = {};
    const li = Eingabe($(".liste", sec), { accept: AKZEPT, titel: "Lieder hier ablegen (mehrere, Reihenfolge mit ↑ ↓)", meldung: out.say, onChange: async it => { $("#opt", sec).hidden = !it.length; $("#go", sec).disabled = it.length < 2;
      for (const i of it) if (!daten[i.id]) { try { const f = i.file, a = new AC(); try { const ab = await f.arrayBuffer(); daten[i.id] = await new Promise((ok, err) => { const p = a.decodeAudioData(ab, ok, err); if (p && p.then) p.then(ok, err); }); } finally { try { a.close(); } catch (e) {} } } catch (e) { daten[i.id] = null; out.say("„" + i.file.name + "“: " + NODECODE, "bad"); } }
      upd(); } });
    function liste(){ return li.items.map(i => daten[i.id]).filter(Boolean); }
    function upd(){ const l = liste(), cf = Math.min(+$("#cf", sec).value, l.length ? Math.min(...l.map(b => b.duration)) / 2 : 0), tot = l.reduce((s, b) => s + b.duration, 0) - cf * Math.max(0, l.length - 1);
      $("#cfO", sec).textContent = cf ? String(cf).replace(".", ",") + " s" : "ohne"; $("#go", sec).disabled = l.length < 2; $("#hinw", sec).textContent = l.length < 2 ? "Lege mindestens zwei Lieder ab." : l.length + " Lieder · Gesamtlänge " + zeit(tot) + (tot > 3600 ? " – das ist lang und braucht viel Speicher." : ""); }
    sec.addEventListener("input", upd); sec.addEventListener("change", upd); $("#stop", sec).onclick = () => { abbruch.flag = true; };
    wrapRun($("#go", sec), async () => {
      const l = liste(); if (l.length < 2) return; out.leer(); abbruch = { flag: false }; const sr = 44100, cf = Math.min(+$("#cf", sec).value, Math.min(...l.map(b => b.duration)) / 2), norm = $("#nm", sec).checked, art = $("#fm", sec).value;
      try { out.say("Rechne …"); await WZ.warte(); const tot = l.reduce((s, b) => s + b.duration, 0) - cf * (l.length - 1), off = new OfflineAudioContext(2, Math.ceil(tot * sr), sr); let t = 0;
        l.forEach((b, i) => { const s = off.createBufferSource(), g = off.createGain(); s.buffer = b; s.connect(g); g.connect(off.destination); const p = spitze(b, 0, b.duration), basis = norm && p > 0 ? .8 / p : 1;
          if (i > 0 && cf){ g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(basis, t + cf); } else g.gain.setValueAtTime(basis, t);
          if (i < l.length - 1 && cf){ g.gain.setValueAtTime(basis, t + b.duration - cf); g.gain.linearRampToValueAtTime(0, t + b.duration); }
          s.start(t); t += b.duration - cf; });
        const buf = await off.startRendering(); let blob, ext;
        if (art === "wav"){ blob = wav(buf); ext = "wav"; } else { const f = fm.find(x => x.id === art); $("#stop", sec).hidden = false; out.say("Nehme auf … Tab offen lassen."); out.prog(0); blob = await aufnehmenBuffer(buf, f.mime, +$("#br", sec).value, p => out.prog(p), abbruch); ext = f.ext; out.prog(null); }
        out.add("Mix." + ext, blob, l.length + " Lieder · " + zeit(tot) + " · " + G(blob.size)); out.say("Fertig.", "ok");
      } catch (e) { fehler(out, e); } finally { $("#stop", sec).hidden = true; } });
  } });

// ------------------------------------------------------------------ 3) Musik-Analyse
DW.tool({ id: "analyse", gruppe: "musik", titel: "Musik-Analyse (BPM & Tonart)", sym: "📊", farbe: "#1d9bd1",
  text: "Tempo (BPM), Tonart (mit Camelot-Code für DJs), Pegel und Frequenzbild eines Songs berechnen – direkt im Browser.",
  build(sec){
    sec.innerHTML = '<div class="liste"></div><div id="erg" hidden></div><div class="ausgabe"></div>';
    const out = Ausgabe($(".ausgabe", sec)), erg = $("#erg", sec);
    Eingabe($(".liste", sec), { accept: AKZEPT, multiple: false, titel: "Song hier ablegen", meldung: out.say, sortieren: false,
      onChange: async it => { out.leer(); erg.hidden = true; erg.innerHTML = ""; if (!it.length) return;
        try { out.say("Lese Datei …"); const buf = await dekodieren(it[0].file); out.say("Analysiere …"); await WZ.warte(); const m = mono(buf);
          const bpm = bpmSchaetzen(m, buf.sampleRate); await WZ.warte(); const ton = tonartSchaetzen(m, buf.sampleRate); await WZ.warte();
          const p = spitze(buf, 0, buf.duration); let s2 = 0; for (let i = 0; i < m.length; i += 2) s2 += m[i] * m[i]; const rms = Math.sqrt(s2 / (m.length / 2)), sp = spektrum(buf, 32); out.say("");
          const kachel = (z, t, k) => '<div class="glass" style="padding:12px 10px;text-align:center;min-width:0"><div style="font-size:26px;font-weight:800;line-height:1.1">' + z + '</div><div class="muted" style="font-size:13px;margin-top:3px">' + t + '</div>' + (k ? '<div class="muted" style="font-size:12px;margin-top:2px">' + k + '</div>' : "") + '</div>';
          const fz = n => String(Math.round(n * 10) / 10).replace(".", ",");
          erg.hidden = false; erg.innerHTML = '<div class="cols2" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr));margin:10px 0">' +
            kachel(bpm ? "≈ " + Math.round(bpm) : "–", "BPM (Tempo)", bpm ? "auch möglich: " + fz(bpm / 2) + " oder " + fz(bpm * 2) : "nicht erkennbar") +
            kachel(ton ? esc(ton.name) : "–", "Tonart", ton ? "Camelot " + ton.camelot + (ton.sicher < .55 ? " · unsicher" : "") : "") +
            kachel(fz(dB(p)) + " dB", "Spitzenpegel", p >= .999 ? "an der Grenze (übersteuert?)" : "bis 0 dB ist Luft") +
            kachel(fz(dB(rms)) + " dB", "Durchschnittspegel", "Dynamik " + fz(dB(p) - dB(rms)) + " dB") +
            kachel(zeit(buf.duration), "Länge", (buf.numberOfChannels === 1 ? "Mono" : "Stereo") + " · " + Math.round(buf.sampleRate / 100) / 10 + " kHz") + '</div>' +
            '<div id="wv"></div><p class="muted" style="font-size:13px;margin:10px 0 4px">Frequenzbild (tief links → hoch rechts)</p><canvas id="sp" style="width:100%;height:110px;display:block;border-radius:14px;background:var(--soft)"></canvas>' +
            '<div class="row" style="margin-top:10px"><button class="btn sm" id="kop">Ergebnis kopieren</button></div><p class="muted" style="font-size:12.5px;margin-top:8px">Die Werte sind Schätzungen. Bei Tempo und Tonart kann es Halb-/Doppeltempo oder die Paralleltonart sein – höre kurz nach. Camelot-Codes passen zusammen, wenn die Zahl höchstens um 1 abweicht (8A → 7A, 9A, 8B).</p>';
          Welle($("#wv", erg), buf, {}); const cv = $("#sp", erg), r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1; cv.width = r.width * dpr; cv.height = r.height * dpr; const x = cv.getContext("2d"); x.scale(dpr, dpr);
          const f = (getComputedStyle(document.documentElement).getPropertyValue("--acc") || "#27a3df").trim(), bw = r.width / sp.length; sp.forEach((v, i) => { const h = v * (r.height - 8); x.fillStyle = f; x.globalAlpha = .45 + v * .55; x.fillRect(i * bw + 1.5, r.height - h - 2, bw - 3, h); });
          $("#kop", erg).onclick = () => { const t = it[0].file.name + "\nBPM ≈ " + (bpm ? Math.round(bpm) : "?") + "\nTonart " + (ton ? ton.name + " (Camelot " + ton.camelot + ")" : "?") + "\nSpitze " + fz(dB(p)) + " dB · Ø " + fz(dB(rms)) + " dB"; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => out.say("Kopiert.", "ok"), () => out.say(t)); };
        } catch (e) { fehler(out, e); } } });
  } });

// ------------------------------------------------------------------ 4) Tongenerator
DW.tool({ id: "tongen", gruppe: "musik", titel: "Tongenerator", sym: "〰️", farbe: "#e0a020",
  text: "Sinus, Rechteck, Dreieck, Sägezahn und Rauschen live abspielen, als Sweep durchfahren und als WAV speichern – mit Notenanzeige.",
  build(sec){
    sec.innerHTML = '<div class="cols2"><div><label class="l">Signalform</label><select class="in" id="wf"><option value="sine">Sinus</option><option value="square">Rechteck</option><option value="triangle">Dreieck</option><option value="sawtooth">Sägezahn</option><option value="white">Weißes Rauschen</option><option value="pink">Rosa Rauschen</option></select></div>' +
      '<div id="fq"><label class="l">Frequenz (Hz)</label><input class="in" id="hz" type="number" min="1" max="20000" step="any" value="440"></div></div>' +
      '<div class="rg" id="fqr"><span>Frequenz</span><input type="range" id="hzr" min="0" max="1000" value="500"><output id="note"></output></div>' +
      '<div class="rg"><span>Lautstärke</span><input type="range" id="vol" min="0" max="100" value="20"><output id="volO"></output></div>' +
      '<label class="chk"><input type="checkbox" id="sw"> Sweep: von … bis … Hz durchfahren</label><div class="cols2" id="swb" hidden><div><label class="l">Bis (Hz)</label><input class="in" id="hz2" type="number" min="1" max="20000" value="2000"></div><div><label class="l">Dauer (Sekunden)</label><input class="in" id="du" type="number" min="1" max="60" value="10"></div></div>' +
      '<canvas id="osz" style="width:100%;height:90px;display:block;border-radius:14px;background:#0b1220;margin-top:10px"></canvas>' +
      '<p class="muted" style="font-size:13px;margin:8px 0">Fang leise an – hohe und laute Töne können Ohren und Lautsprecher schädigen.</p>' +
      '<div class="row"><button class="btn go" id="pl">▶ Abspielen</button><button class="btn" id="wv">Als WAV speichern (10 s)</button></div><div class="ausgabe"></div>';
    const out = Ausgabe($(".ausgabe", sec)); let ac = null, osc = null, gn = null, an = null, raf = 0, rausch = null;
    const NN = ["C", "Cis", "D", "Es", "E", "F", "Fis", "G", "As", "A", "B", "H"];
    const hz = () => Math.max(1, Math.min(20000, +$("#hz", sec).value || 440)), vol = () => Math.pow(+$("#vol", sec).value / 100, 2) * .8, sweep = () => $("#sw", sec).checked;
    const l2h = v => 20 * Math.pow(1000, v / 1000), h2l = h => 1000 * Math.log(h / 20) / Math.log(1000);
    function noteTxt(){ const f = hz(), n = 69 + 12 * Math.log2(f / 440), r = Math.round(n), cents = Math.round((n - r) * 100); return f.toFixed(f < 100 ? 1 : 0).replace(".", ",") + " Hz · " + NN[((r % 12) + 12) % 12] + (Math.floor(r / 12) - 1) + (cents ? " " + (cents > 0 ? "+" : "") + cents + "¢" : ""); }
    function upd(){ $("#volO", sec).textContent = Math.round(+$("#vol", sec).value) + " %"; $("#note", sec).textContent = ["white", "pink"].includes($("#wf", sec).value) ? "Rauschen" : noteTxt(); $("#fq", sec).hidden = $("#fqr", sec).hidden = ["white", "pink"].includes($("#wf", sec).value); $("#swb", sec).hidden = !sweep(); if (gn) gn.gain.setTargetAtTime(vol(), ac.currentTime, .02); if (osc && !sweep()) osc.frequency.setTargetAtTime(hz(), ac.currentTime, .02); }
    $("#hzr", sec).oninput = () => { $("#hz", sec).value = Math.round(l2h(+$("#hzr", sec).value) * 10) / 10; upd(); }; $("#hz", sec).oninput = () => { $("#hzr", sec).value = h2l(hz()); upd(); };
    sec.addEventListener("input", upd); sec.addEventListener("change", () => { if (osc || rausch){ stopp(); starte(); } upd(); }); $("#hzr", sec).value = h2l(440); upd();
    function rauschBuf(a, art, sek){ const n = Math.round(a.sampleRate * sek), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0; for (let i = 0; i < n; i++){ const w = Math.random() * 2 - 1; if (art === "white") d[i] = w; else { b0 = .99765 * b0 + w * .099046; b1 = .963 * b1 + w * .2965164; b2 = .57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * .1848) * .3; } } return b; }
    function starte(){ ac = new AC(); gn = ac.createGain(); gn.gain.value = 0; gn.gain.setTargetAtTime(vol(), ac.currentTime, .05); an = ac.createAnalyser(); an.fftSize = 1024; gn.connect(an); an.connect(ac.destination); const wf = $("#wf", sec).value;
      if (wf === "white" || wf === "pink"){ rausch = ac.createBufferSource(); rausch.buffer = rauschBuf(ac, wf, 4); rausch.loop = true; rausch.connect(gn); rausch.start(); }
      else { osc = ac.createOscillator(); osc.type = wf; osc.frequency.value = hz(); if (sweep()){ const d = Math.max(1, +$("#du", sec).value || 10), t = ac.currentTime; osc.frequency.setValueAtTime(hz(), t); osc.frequency.exponentialRampToValueAtTime(Math.max(1, +$("#hz2", sec).value || 2000), t + d); osc.onended = stopp; osc.stop(t + d + .1); } osc.connect(gn); osc.start(); }
      $("#pl", sec).textContent = "⏹ Stopp"; zeichne(); }
    function stopp(){ cancelAnimationFrame(raf); try { osc && osc.stop(); } catch (e) {} try { rausch && rausch.stop(); } catch (e) {} osc = rausch = gn = an = null; if (ac){ try { ac.close(); } catch (e) {} ac = null; } $("#pl", sec).textContent = "▶ Abspielen"; zeichne(true); }
    function zeichne(leer){ const cv = $("#osz", sec), r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1; if (cv.width !== Math.round(r.width * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); } const x = cv.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, r.width, r.height); x.strokeStyle = "#1c3a2b"; x.beginPath(); x.moveTo(0, r.height / 2); x.lineTo(r.width, r.height / 2); x.stroke();
      if (leer || !an) return; const d = new Uint8Array(an.fftSize); an.getByteTimeDomainData(d); let s = 0; for (let i = 1; i < d.length / 2; i++) if (d[i - 1] < 128 && d[i] >= 128) { s = i; break; } x.strokeStyle = "#4dff9a"; x.lineWidth = 2; x.beginPath(); for (let i = 0; i < r.width; i++){ const v = (d[s + Math.floor(i / r.width * 400)] - 128) / 128; const y = r.height / 2 - v * r.height * .45; i ? x.lineTo(i, y) : x.moveTo(i, y); } x.stroke(); raf = requestAnimationFrame(() => zeichne()); }
    $("#pl", sec).onclick = () => { if (ac) stopp(); else starte(); }; zeichne(true);
    wrapRun($("#wv", sec), async () => { try { out.leer(); const sr = 44100, sek = sweep() ? Math.max(1, +$("#du", sec).value || 10) : 10, off = new OfflineAudioContext(1, sr * sek, sr), g = off.createGain(); g.gain.value = vol(); g.connect(off.destination); const wf = $("#wf", sec).value;
        if (wf === "white" || wf === "pink"){ const s = off.createBufferSource(); s.buffer = rauschBuf(off, wf, sek); s.connect(g); s.start(); } else { const o = off.createOscillator(); o.type = wf; o.frequency.setValueAtTime(hz(), 0); if (sweep()) o.frequency.exponentialRampToValueAtTime(Math.max(1, +$("#hz2", sec).value || 2000), sek); o.connect(g); o.start(); }
        const b = await off.startRendering(), blob = wav(b), nm = ["white", "pink"].includes(wf) ? wf : wf + "_" + Math.round(hz()) + "Hz" + (sweep() ? "_sweep" : ""); out.add("Ton_" + nm + ".wav", blob, sek + " s · " + G(blob.size)); out.say("Fertig.", "ok"); } catch (e) { fehler(out, e); } });
  } });

// ------------------------------------------------------------------ Französisch
if (window.WZ_FR){
  Object.assign(WZ_FR, {
    "Songs, Sprachmemos oder den Ton eines Videos mit Wellenform schneiden, lauter machen, ein- und ausblenden – als WAV, M4A, WebM oder iPhone-Klingelton.": "Couper des chansons, mémos vocaux ou le son d’une vidéo avec la forme d’onde, augmenter le volume, fondu entrant et sortant – en WAV, M4A, WebM ou sonnerie iPhone.",
    "Mehrere Lieder oder Aufnahmen hintereinander setzen – mit weicher Überblendung, gleicher Lautstärke und Reihenfolge nach Wunsch.": "Enchaîner plusieurs chansons ou enregistrements – avec fondu enchaîné doux, volume égalisé et ordre au choix.",
    "Tempo (BPM), Tonart (mit Camelot-Code für DJs), Pegel und Frequenzbild eines Songs berechnen – direkt im Browser.": "Calculer le tempo (BPM), la tonalité (avec code Camelot pour DJ), le niveau et le spectre d’un morceau – directement dans le navigateur.",
    "Sinus, Rechteck, Dreieck, Sägezahn und Rauschen live abspielen, als Sweep durchfahren und als WAV speichern – mit Notenanzeige.": "Jouer en direct sinus, carré, triangle, dent de scie et bruit, balayer en sweep et enregistrer en WAV – avec affichage de la note.",
    "Audio schneiden & umwandeln": "Couper et convertir de l’audio", "Songs verbinden & überblenden": "Enchaîner des chansons avec fondu", "Musik-Analyse (BPM & Tonart)": "Analyse musicale (BPM et tonalité)", "Tongenerator": "Générateur de sons",
    "Der Ton konnte nicht gelesen werden. Das Format wird von diesem Browser nicht entschlüsselt – probier ein anderes Gerät oder eine andere Datei.": "Le son n’a pas pu être lu. Ce format n’est pas décodé par ce navigateur – essaie un autre appareil ou un autre fichier.",
    "Audio oder Video hier ablegen": "Dépose l’audio ou la vidéo ici", "Song hier ablegen": "Dépose la chanson ici", "Lieder hier ablegen (mehrere, Reihenfolge mit ↑ ↓)": "Dépose les chansons ici (plusieurs, ordre avec ↑ ↓)",
    "Lese und entschlüssele … (große Dateien dauern etwas)": "Lecture et décodage … (les gros fichiers prennent un peu de temps)", "Spitzenpegel": "Niveau de crête", "Durchschnittspegel": "Niveau moyen",
    "▶ Auswahl anhören": "▶ Écouter la sélection", "⏹ Stopp": "⏹ Stop", "🔇 Stille abschneiden": "🔇 Couper le silence", "Stille am Anfang und Ende wegschneiden": "Couper le silence au début et à la fin", "Alles auswählen": "Tout sélectionner",
    "Keine Stille am Rand gefunden.": "Pas de silence trouvé aux extrémités.", "Stille am Rand abgeschnitten – prüf es mit ▶.": "Silence coupé aux extrémités – vérifie avec ▶.",
    "WAV (verlustfrei, sehr groß)": "WAV (sans perte, très gros)", "M4A (AAC) – klein": "M4A (AAC) – petit", "WebM (Opus) – klein": "WebM (Opus) – petit", "M4R – iPhone-Klingelton (max. 40 s)": "M4R – sonnerie iPhone (40 s max.)",
    "Kanäle": "Canaux", "Mono (halb so groß)": "Mono (moitié moins gros)", "Abtastrate (nur WAV)": "Fréquence d’échantillonnage (WAV seulement)", "44,1 kHz (CD)": "44,1 kHz (CD)", "16 kHz (Sprache)": "16 kHz (voix)",
    "Qualität (M4A/WebM/M4R)": "Qualité (M4A/WebM/M4R)", "Qualität (M4A/WebM)": "Qualité (M4A/WebM)", "64 kbit/s (Sprache)": "64 kbit/s (voix)", "256 kbit/s (sehr gut)": "256 kbit/s (très bonne)",
    "Lautstärke": "Volume", "Einblenden": "Fondu entrant", "Ausblenden": "Fondu sortant", "Überblenden": "Fondu enchaîné", "aus": "désactivé", "ohne": "sans",
    "Lautstärke angleichen (so laut wie möglich, ohne zu übersteuern)": "Égaliser le volume (aussi fort que possible sans saturer)", "Lautstärke aller Lieder angleichen": "Égaliser le volume de toutes les chansons",
    "WAV wird sofort berechnet. ": "Le WAV est calculé tout de suite. ", "Dieses Format läuft in Echtzeit: es dauert so lange wie die Auswahl. Tab offen lassen. ": "Ce format se fait en temps réel : cela dure aussi longtemps que la sélection. Laisse l’onglet ouvert. ",
    "Ergebnis ca.": "Résultat env.", "Klingelton: nur die ersten 40 s der Auswahl.": "Sonnerie : seulement les 40 premières secondes de la sélection.", "Die Datei in iTunes/Musik auf den Mac ziehen oder in GarageBand als Klingelton öffnen.": "Glisse le fichier dans Musique/iTunes sur le Mac ou ouvre-le comme sonnerie dans GarageBand.",
    "Speichern": "Enregistrer", "Verbinden": "Assembler", "Lege mindestens zwei Lieder ab.": "Dépose au moins deux chansons.", "Lieder · Gesamtlänge": "chansons · durée totale", "– das ist lang und braucht viel Speicher.": "– c’est long et demande beaucoup de mémoire.",
    "Achtung: Die Lautstärke ist so hoch, dass der Ton übersteuert (": "Attention : le volume est si élevé que le son sature (", " dB). Nimm sie etwas zurück.": " dB). Baisse-le un peu.",
    "Lese Datei …": "Lecture du fichier …", "Analysiere …": "Analyse …", "BPM (Tempo)": "BPM (tempo)", "auch möglich:": "aussi possible :", "oder": "ou", "nicht erkennbar": "non détectable", "Tonart": "Tonalité", "unsicher": "incertain",
    "an der Grenze (übersteuert?)": "à la limite (saturé ?)", "bis 0 dB ist Luft": "de la marge jusqu’à 0 dB", "Dynamik": "Dynamique", "Länge": "Durée", "Stereo": "Stéréo",
    "Frequenzbild (tief links → hoch rechts)": "Spectre (graves à gauche → aigus à droite)", "Ergebnis kopieren": "Copier le résultat", "Kopiert.": "Copié.",
    "Die Werte sind Schätzungen. Bei Tempo und Tonart kann es Halb-/Doppeltempo oder die Paralleltonart sein – höre kurz nach. Camelot-Codes passen zusammen, wenn die Zahl höchstens um 1 abweicht (8A → 7A, 9A, 8B).": "Les valeurs sont des estimations. Pour le tempo et la tonalité, il peut s’agir du demi-/double tempo ou de la tonalité relative – écoute pour vérifier. Les codes Camelot vont ensemble si le nombre diffère d’au plus 1 (8A → 7A, 9A, 8B).",
    "-Dur": " majeur", "-Moll": " mineur",
    "Signalform": "Forme du signal", "Sinus": "Sinus", "Rechteck": "Carré", "Dreieck": "Triangle", "Sägezahn": "Dent de scie", "Weißes Rauschen": "Bruit blanc", "Rosa Rauschen": "Bruit rose", "Rauschen": "Bruit", "Frequenz (Hz)": "Fréquence (Hz)", "Frequenz": "Fréquence",
    "Sweep: von … bis … Hz durchfahren": "Sweep : balayer de … à … Hz", "Bis (Hz)": "Jusqu’à (Hz)", "Dauer (Sekunden)": "Durée (secondes)",
    "Fang leise an – hohe und laute Töne können Ohren und Lautsprecher schädigen.": "Commence doucement – les sons aigus et forts peuvent abîmer les oreilles et les haut-parleurs.", "▶ Abspielen": "▶ Lire", "Als WAV speichern (10 s)": "Enregistrer en WAV (10 s)"
  });
  if (window.WZ) WZ._re = null;
}
})();
