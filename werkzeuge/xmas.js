// Weihnachtswelt – Kern: Hilfsfunktionen, Themen (animierte Hintergründe), Teilen per Link, Router, Startseite.
// Alles läuft im Browser. Geteilte Links tragen ihre Daten hinter dem # – dieser Teil wird nie an einen Server gesendet.
(function(){
"use strict";
var I = WZ.lang === "fr" ? 1 : 0;
var XM = window.XM = { I: I, tools: [], views: {} };
var L = XM.L = function(de, fr){ return I ? fr : de; };
var $ = XM.$ = function(s, r){ return (r || document).querySelector(s); };
var $$ = XM.$$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var esc = XM.esc = function(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
XM.pair = function(p){ return p[I]; };
XM.fr = function(s){ return I ? s.replace(/ ([!?:;»])/g, " $1").replace(/(«) /g, "$1 ") : s; };
XM.reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Zufall ---------- */
XM.hash = function(str){ var h = 2166136261; str = String(str); for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
XM.rng = function(seed){ var a = seed >>> 0; return function(){ a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
XM.pick = function(arr, r){ return arr[Math.floor((r || Math.random)() * arr.length)]; };
XM.shuffle = function(arr, r){ r = r || Math.random; var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
XM.norm = function(s){ return String(s || "").trim().replace(/\s+/g, " "); };

/* ---------- Teilen: Daten im Link ---------- */
function b64u(u8){ var s = ""; for (var i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function unb64u(t){ t = t.replace(/-/g, "+").replace(/_/g, "/"); while (t.length % 4) t += "="; var s = atob(t), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
async function stream(kind, bytes){ var cs = new (kind === "c" ? CompressionStream : DecompressionStream)("deflate-raw"); var w = cs.writable.getWriter(); w.write(bytes); w.close(); return new Uint8Array(await new Response(cs.readable).arrayBuffer()); }
XM.pack = async function(o){ var b = new TextEncoder().encode(JSON.stringify(o)); if (window.CompressionStream) { try { return "z" + b64u(await stream("c", b)); } catch(e){} } return "p" + b64u(b); };
XM.unpack = async function(t){ try { var b = unb64u(t.slice(1)); if (t[0] === "z") b = await stream("d", b); return JSON.parse(new TextDecoder().decode(b)); } catch(e){ return null; } };
XM.link = async function(kind, obj){ return location.href.split("#")[0] + "#v/" + kind + "/" + await XM.pack(obj); };
XM.copy = async function(text, btn){
  var old = btn && btn.textContent;
  try { await navigator.clipboard.writeText(text); } catch(e){
    var ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch(e2){} ta.remove();
  }
  if (btn) { btn.textContent = L("Kopiert ✓", "Copié ✓"); setTimeout(function(){ btn.textContent = old; }, 1400); }
};
// Leiste zum Teilen: Link kopieren, Teilen, WhatsApp
XM.shareBar = function(getUrl, text){
  var d = document.createElement("div"); d.className = "row sharebar";
  d.innerHTML = '<button class="btn go" data-a="copy">' + L("Link kopieren", "Copier le lien") + '</button>' +
    (navigator.share ? '<button class="btn" data-a="share">' + L("Teilen …", "Partager …") + '</button>' : '') +
    '<a class="btn" data-a="wa" target="_blank" rel="noopener" href="#">WhatsApp</a>' +
    '<a class="btn" data-a="mail" href="#">' + L("E-Mail", "E-mail") + '</a>';
  var msg = text || L("Schau mal, was ich für dich gemacht habe:", "Regarde ce que j'ai fait pour toi :");
  d.addEventListener("click", async function(e){
    var a = e.target.closest("[data-a]"); if (!a) return;
    var url = await getUrl(); if (!url) return;
    if (a.dataset.a === "copy") { e.preventDefault(); XM.copy(url, a); }
    else if (a.dataset.a === "share") { try { await navigator.share({ title: "Oratio Place", text: msg, url: url }); } catch(e2){} }
    else if (a.dataset.a === "wa") { a.href = "https://wa.me/?text=" + encodeURIComponent(msg + " " + url); }
    else if (a.dataset.a === "mail") { a.href = "mailto:?subject=" + encodeURIComponent(L("Weihnachtsgruß", "Vœux de Noël")) + "&body=" + encodeURIComponent(msg + "\n\n" + url); }
  });
  d.addEventListener("pointerdown", async function(e){ var a = e.target.closest("[data-a=wa],[data-a=mail]"); if (!a) return; var url = await getUrl(); if (!url) return; a.href = a.dataset.a === "wa" ? "https://wa.me/?text=" + encodeURIComponent(msg + " " + url) : "mailto:?subject=" + encodeURIComponent(L("Weihnachtsgruß", "Vœux de Noël")) + "&body=" + encodeURIComponent(msg + "\n\n" + url); });
  return d;
};

/* ---------- Zeichenhilfen ---------- */
var FONT = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
XM.FONT = FONT;
XM.wrap = function(ctx, text, maxW){
  var out = [], paras = String(text).split("\n");
  paras.forEach(function(p){
    var words = p.split(" "), line = "";
    words.forEach(function(w){
      var t = line ? line + " " + w : w;
      if (ctx.measureText(t).width <= maxW || !line) line = t; else { out.push(line); line = w; }
    });
    out.push(line);
  });
  return out;
};
// Schreibt Text mittig, verkleinert die Schrift, bis alles in den Kasten passt. Gibt die Höhe zurück.
XM.fit = function(ctx, text, cx, top, maxW, maxH, opt){
  opt = opt || {}; var size = opt.max || 32, min = opt.min || 12, weight = opt.weight || "600", lh = opt.lh || 1.3, lines;
  for (; size >= min; size -= 1) {
    ctx.font = weight + " " + size + "px " + FONT; lines = XM.wrap(ctx, text, maxW);
    if (lines.length * size * lh <= maxH) break;
  }
  var h = lines.length * size * lh, y = top + (opt.center === false ? 0 : (maxH - h) / 2) + size * lh * 0.5;
  ctx.textAlign = opt.align || "center"; ctx.textBaseline = "middle";
  if (opt.fill) ctx.fillStyle = opt.fill;
  lines.forEach(function(l, i){ ctx.fillText(l, cx, y + i * size * lh); });
  return h;
};
function star(ctx, x, y, r, pts, inner){ ctx.beginPath(); for (var i = 0; i < pts * 2; i++) { var a = -Math.PI / 2 + i * Math.PI / pts, rr = i % 2 ? r * inner : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); }
XM.star = star;
function sparkle(ctx, x, y, r){ ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill(); }
XM.sparkle = sparkle;
function rrect(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
XM.rrect = rrect;

/* ---------- Themen (animierte Hintergründe, rein berechnet aus der Zeit t) ---------- */
var TH = XM.themes = {
  schnee:   { n: ["Winternacht", "Nuit d'hiver"], a: "#0b1d3a", b: "#2d5486", text: "#ffffff", sub: "#cfe3ff", acc: "#ffd966" },
  sterne:   { n: ["Sternenhimmel", "Ciel étoilé"], a: "#070b1f", b: "#242a63", text: "#fff6d6", sub: "#c8cdf5", acc: "#ffd966" },
  kerzen:   { n: ["Kerzenlicht", "Lumière des bougies"], a: "#2a0b0b", b: "#6d2412", text: "#ffe9c2", sub: "#ffd49a", acc: "#ffc75a" },
  nordlicht:{ n: ["Nordlicht", "Aurore boréale"], a: "#04121f", b: "#0b3a3f", text: "#e9fff7", sub: "#b4f0dc", acc: "#7dffd0" },
  lichter:  { n: ["Lichterkette", "Guirlande"], a: "#1b0f2e", b: "#3a1c52", text: "#ffffff", sub: "#ffd7f0", acc: "#ff9ad5" },
  gold:     { n: ["Rot & Gold", "Rouge et or"], a: "#7d0f1f", b: "#c4162b", text: "#fff3c8", sub: "#ffe08a", acc: "#ffe08a" },
  wald:     { n: ["Tannenwald", "Forêt de sapins"], a: "#0b3125", b: "#1d6a46", text: "#f1fff5", sub: "#bfe8cf", acc: "#ffe08a" },
  retro:    { n: ["Retro-Papier", "Papier rétro"], a: "#f7e9c9", b: "#f1d9a8", text: "#7a1626", sub: "#3f5a35", acc: "#b3202f", light: true }
};
XM.themeKeys = Object.keys(TH);
function mk(seed, n, f){ var r = XM.rng(seed), a = []; for (var i = 0; i < n; i++) a.push(f(r, i)); return a; }
XM.makeBg = function(theme, W, H){
  var seed = XM.hash(theme), st = { theme: theme };
  st.flakes = mk(seed, 110, function(r){ return { x: r() * W, y: r() * H, v: 14 + r() * 34, s: 1 + r() * 2.8, ph: r() * 6.28, am: 8 + r() * 22, al: .45 + r() * .5 }; });
  st.stars = mk(seed + 1, 150, function(r){ return { x: r() * W, y: r() * H * .8, s: .5 + r() * 1.6, ph: r() * 6.28, sp: .8 + r() * 2.2 }; });
  st.bokeh = mk(seed + 2, 34, function(r){ return { x: r() * W, y: r() * H, v: 10 + r() * 24, s: 3 + r() * 9, ph: r() * 6.28 }; });
  st.bulbs = mk(seed + 3, 22, function(r, i){ return { c: ["#ff4d5e", "#ffd23f", "#45d17a", "#4aa8ff", "#ff8ad8"][i % 5], ph: r() * 6.28 }; });
  st.glit = mk(seed + 4, 70, function(r){ return { x: r() * W, y: r() * H, s: 2 + r() * 5, ph: r() * 6.28, sp: 1 + r() * 2.5 }; });
  st.trees = mk(seed + 5, 9, function(r, i){ return { x: (i + .5) / 9 * W + (r() - .5) * 30, h: 90 + r() * 90, w: 36 + r() * 30, s: r() }; });
  return st;
};
function flakes(ctx, W, H, t, st, n, col){
  ctx.fillStyle = col || "#fff";
  for (var i = 0; i < Math.min(n, st.flakes.length); i++) {
    var f = st.flakes[i], y = (f.y + t * f.v) % (H + 10) - 5, x = f.x + Math.sin(t * .6 + f.ph) * f.am;
    ctx.globalAlpha = f.al; ctx.beginPath(); ctx.arc(((x % W) + W) % W, y, f.s, 0, 6.3); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function grad(ctx, W, H, a, b){ var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
XM.drawBg = function(ctx, W, H, t, st){
  var th = TH[st.theme] || TH.schnee, k = st.theme, i, s;
  grad(ctx, W, H, th.a, th.b);
  if (k === "schnee") {
    ctx.fillStyle = "rgba(255,255,235,.95)"; ctx.beginPath(); ctx.arc(W * .8, H * .12, 20, 0, 6.3); ctx.fill();
    flakes(ctx, W, H, t, st, 100);
    ctx.fillStyle = "#e9f1ff"; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, H * .93); ctx.quadraticCurveTo(W * .3, H * .87, W * .55, H * .93); ctx.quadraticCurveTo(W * .8, H * .98, W, H * .91); ctx.lineTo(W, H); ctx.fill();
  } else if (k === "sterne") {
    for (i = 0; i < st.stars.length; i++) { s = st.stars[i]; ctx.globalAlpha = .35 + .65 * (.5 + .5 * Math.sin(t * s.sp + s.ph)); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, 6.3); ctx.fill(); }
    ctx.globalAlpha = .9; ctx.fillStyle = th.acc;
    [[W * .2, H * .12, 9], [W * .82, H * .2, 12], [W * .65, H * .07, 7]].forEach(function(p, j){ sparkle(ctx, p[0], p[1], p[2] * (1 + .25 * Math.sin(t * 2 + j))); });
    var p = (t % 7) / 7; if (p < .22) { var q = p / .22; ctx.globalAlpha = 1 - q; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W * (.1 + q * .5), H * (.05 + q * .25)); ctx.lineTo(W * (.1 + q * .5) - 50, H * (.05 + q * .25) - 22); ctx.stroke(); }
    ctx.globalAlpha = 1;
  } else if (k === "kerzen") {
    for (i = 0; i < st.bokeh.length; i++) { s = st.bokeh[i]; var yy = H - ((s.y + t * s.v) % H); ctx.globalAlpha = .08 + .12 * (.5 + .5 * Math.sin(t + s.ph)); ctx.fillStyle = "#ffcf7a"; ctx.beginPath(); ctx.arc(s.x, yy, s.s, 0, 6.3); ctx.fill(); }
    ctx.globalAlpha = 1;
    [[.2, 70, .9], [.4, 90, 1], [.62, 60, .85], [.8, 80, .95]].forEach(function(c, j){
      var x = W * c[0], h = c[1], y0 = H - 18, fl = 1 + .08 * Math.sin(t * 7 + j * 2) + .05 * Math.sin(t * 13 + j), fx = Math.sin(t * 3 + j) * 1.6;
      var g = ctx.createRadialGradient(x, y0 - h - 8, 2, x, y0 - h - 8, 70 * c[2]); g.addColorStop(0, "rgba(255,200,90,.55)"); g.addColorStop(1, "rgba(255,160,40,0)"); ctx.fillStyle = g; ctx.fillRect(x - 90, y0 - h - 100, 180, 180);
      ctx.fillStyle = "#fbefd0"; rrect(ctx, x - 12, y0 - h, 24, h + 6, 4); ctx.fill();
      ctx.fillStyle = "#ffb630"; ctx.beginPath(); ctx.ellipse(x + fx, y0 - h - 10 * fl, 6.5, 14 * fl, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = "#fff6c4"; ctx.beginPath(); ctx.ellipse(x + fx, y0 - h - 8 * fl, 3, 8 * fl, 0, 0, 6.3); ctx.fill();
    });
  } else if (k === "nordlicht") {
    for (i = 0; i < 90; i++) { s = st.stars[i]; ctx.globalAlpha = .3 + .5 * (.5 + .5 * Math.sin(t * s.sp + s.ph)); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s.x, s.y * .9, s.s * .7, 0, 6.3); ctx.fill(); }
    ctx.globalCompositeOperation = "lighter";
    [["#2dffa8", .28, 64, .9], ["#5a8dff", .38, 52, .7], ["#c05bff", .22, 40, .55]].forEach(function(b, j){
      var base = H * b[1], th2 = b[2];
      var g = ctx.createLinearGradient(0, base - th2, 0, base + th2 * 1.6); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(.35, b[0]); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = .38 * b[3]; ctx.fillStyle = g; ctx.beginPath();
      for (var x = 0; x <= W; x += 12) { var y = base + Math.sin(x * .011 + t * (.5 + j * .15) + j) * 24 + Math.sin(x * .027 - t * .7) * 9; ctx.lineTo(x, y - th2); }
      for (x = W; x >= 0; x -= 12) { y = base + Math.sin(x * .011 + t * (.5 + j * .15) + j) * 24 + Math.sin(x * .027 - t * .7) * 9; ctx.lineTo(x, y + th2 * 1.6); }
      ctx.fill();
    });
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    ctx.fillStyle = "#06151b"; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, H * .92);
    for (var x2 = 0; x2 <= W; x2 += 30) ctx.lineTo(x2, H * .92 - 14 - ((x2 / 30) % 3) * 8); ctx.lineTo(W, H); ctx.fill();
  } else if (k === "lichter") {
    flakes(ctx, W, H, t, st, 50, "rgba(255,255,255,.8)");
    ctx.strokeStyle = "#0e0618"; ctx.lineWidth = 2; ctx.lineCap = "round";
    var swoops = 3, perS = 7;
    for (var sw = 0; sw < swoops; sw++) {
      var x0 = sw * W / swoops, x1 = (sw + 1) * W / swoops, yb = 16 + sw % 2 * 4, sag = 34;
      ctx.beginPath(); ctx.moveTo(x0, yb); ctx.quadraticCurveTo((x0 + x1) / 2, yb + sag * 2, x1, yb); ctx.stroke();
      for (var b = 1; b <= perS; b++) {
        var u = b / (perS + 1), px = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * (x0 + x1) / 2 + u * u * x1, py = (1 - u) * (1 - u) * yb + 2 * (1 - u) * u * (yb + sag * 2) + u * u * yb;
        var bu = st.bulbs[(sw * perS + b) % st.bulbs.length], gl = .55 + .45 * Math.sin(t * 2.2 + bu.ph);
        var g2 = ctx.createRadialGradient(px, py + 8, 1, px, py + 8, 20); g2.addColorStop(0, bu.c); g2.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = .55 * gl; ctx.fillStyle = g2; ctx.fillRect(px - 24, py - 14, 48, 48);
        ctx.globalAlpha = .6 + .4 * gl; ctx.fillStyle = bu.c; ctx.beginPath(); ctx.ellipse(px, py + 8, 4.5, 7, 0, 0, 6.3); ctx.fill();
        ctx.globalAlpha = 1; ctx.fillStyle = "#2b2338"; ctx.fillRect(px - 2.5, py - 1, 5, 4);
      }
    }
  } else if (k === "gold") {
    for (i = 0; i < st.glit.length; i++) { s = st.glit[i]; ctx.globalAlpha = Math.max(0, Math.sin(t * s.sp + s.ph)) * .95; ctx.fillStyle = "#ffe08a"; sparkle(ctx, s.x, s.y, s.s); }
    ctx.globalAlpha = 1; ctx.strokeStyle = "#ffd86b"; ctx.lineWidth = 3; rrect(ctx, 14, 14, W - 28, H - 28, 14); ctx.stroke();
    ctx.lineWidth = 1; ctx.globalAlpha = .7; rrect(ctx, 24, 24, W - 48, H - 48, 8); ctx.stroke(); ctx.globalAlpha = 1;
  } else if (k === "wald") {
    flakes(ctx, W, H, t, st, 70, "rgba(255,255,255,.9)");
    for (i = 0; i < st.stars.length; i += 12) { s = st.stars[i]; ctx.globalAlpha = .3 + .6 * (.5 + .5 * Math.sin(t * s.sp + s.ph)); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s.x, s.y * .5, s.s, 0, 6.3); ctx.fill(); }
    ctx.globalAlpha = 1;
    st.trees.forEach(function(tr){
      var base = H - 8 - tr.s * 22, hh = tr.h + 40;
      ctx.fillStyle = "#06231a"; for (var l = 0; l < 3; l++) { var ty = base - l * hh * .26, wd = tr.w * (1 - l * .22); ctx.beginPath(); ctx.moveTo(tr.x - wd, ty); ctx.lineTo(tr.x, ty - hh * .42); ctx.lineTo(tr.x + wd, ty); ctx.fill(); }
      ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.beginPath(); ctx.moveTo(tr.x - 6, base - hh * .26 * 2 - hh * .42 + 22); ctx.lineTo(tr.x, base - hh * .26 * 2 - hh * .42); ctx.lineTo(tr.x + 6, base - hh * .26 * 2 - hh * .42 + 22); ctx.fill();
    });
    ctx.fillStyle = "#e9fff3"; ctx.fillRect(0, H - 8, W, 8);
  } else if (k === "retro") {
    ctx.save(); ctx.globalAlpha = .18; ctx.fillStyle = "#b3202f";
    for (var sx = -H; sx < W + H; sx += 38) { ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + 14, 0); ctx.lineTo(sx + 14 + H, H); ctx.lineTo(sx + H, H); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = "#f7e9c9"; rrect(ctx, 22, 22, W - 44, H - 44, 18); ctx.fill();
    ctx.strokeStyle = "#2f6b3d"; ctx.lineWidth = 4; rrect(ctx, 22, 22, W - 44, H - 44, 18); ctx.stroke();
    ctx.strokeStyle = "#b3202f"; ctx.lineWidth = 2; rrect(ctx, 32, 32, W - 64, H - 64, 12); ctx.stroke();
    ctx.fillStyle = "#b3202f"; for (i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(W * (.14 + i * .144), 22, 7 + (i % 2) * 2, 0, 6.3); ctx.fill(); ctx.fillStyle = i % 2 ? "#b3202f" : "#2f6b3d"; }
  }
};
// Animationssteuerung: zeichnet draw(ctx,W,H,t,st) fortlaufend, solange die Zeichenfläche im Dokument ist.
XM.animate = function(canvas, W, H, theme, draw, opt){
  opt = opt || {};
  var dpr = Math.min(window.devicePixelRatio || 1, opt.dpr || 1.5); if (opt.still) stillT = 0;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  var ctx = canvas.getContext("2d"), st = XM.makeBg(theme, W, H), t0 = performance.now(), alive = true, stillT = opt.still || 0, c = { st: st, W: W, H: H, theme: theme };
  c.setTheme = function(t){ c.theme = theme = t; st = c.st = XM.makeBg(t, W, H); };
  c.frame = function(t){ ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); XM.drawBg(ctx, W, H, t, st); draw(ctx, W, H, t, st); };
  c.t = function(){ return (performance.now() - t0) / 1000 + 2; };
  c.draw = function(){ c.frame(XM.reduced ? 3 : c.t()); };
  c.stop = function(){ alive = false; };
  c.png = function(scale, name){
    var cv = document.createElement("canvas"); cv.width = Math.round(W * scale); cv.height = Math.round(H * scale); var x = cv.getContext("2d"); x.setTransform(scale, 0, 0, scale, 0, 0);
    XM.drawBg(x, W, H, XM.reduced ? 3 : c.t(), st); draw(x, W, H, XM.reduced ? 3 : c.t(), st);
    cv.toBlob(function(b){ if (b) WZ.speichern(b, (name || "weihnachten") + ".png"); }, "image/png");
  };
  function loop(){ if (!alive || !canvas.isConnected) return; if (!document.hidden) c.draw(); if (XM.reduced || opt.still) return; requestAnimationFrame(loop); }
  (document.fonts && document.fonts.load ? Promise.all([document.fonts.load("500 20px Inter"), document.fonts.load("600 20px Inter"), document.fonts.load("800 20px Inter")]).catch(function(){}) : Promise.resolve()).then(function(){ c.draw(); if (!XM.reduced && !opt.still) requestAnimationFrame(loop); });
  return c;
};

/* ---------- Karten-Zeichnung (gemeinsam für Karte, Spruchbild, Namen …) ---------- */
XM.watermark = function(ctx, W, H, th){ ctx.font = "600 11px " + FONT; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = th.light ? "rgba(60,40,20,.55)" : "rgba(255,255,255,.6)"; ctx.fillText("oratioplace.com", W / 2, H - 14); };
XM.goldStar = function(ctx, x, y, r, col){ ctx.fillStyle = col; star(ctx, x, y, r, 5, .45); ctx.fill(); };

/* ---------- Gemeinsame Oberfläche ---------- */
XM.chips = function(host, items, cur, onpick){
  host.classList.add("chips"); host.innerHTML = "";
  items.forEach(function(it){ var b = document.createElement("button"); b.type = "button"; b.className = "chip" + (it[0] === cur ? " on" : ""); b.textContent = it[1]; b.onclick = function(){ $$(".chip", host).forEach(function(x){ x.classList.toggle("on", x === b); }); onpick(it[0]); }; host.appendChild(b); });
};
XM.themeChips = function(host, cur, onpick){ XM.chips(host, XM.themeKeys.map(function(k){ return [k, TH[k].n[I]]; }), cur, onpick); };
// Handy: Zeichenflächen fangen sonst jede Wischgeste ab. Dieser Schalter lässt dazwischen wählen: Fläche bedienen oder Seite scrollen.
XM.touchMode = function(cv, startOn, labOn, labOff){
  var st = { on: true }; if (!matchMedia("(pointer:coarse)").matches) return st;
  st.on = !!startOn; cv.style.touchAction = st.on ? "none" : "pan-y";
  var b = document.createElement("button"); b.type = "button"; b.className = "btn sm tmode"; b.style.marginTop = "8px";
  function lab(){ b.textContent = st.on ? labOn : labOff; b.classList.toggle("on", st.on); cv.style.touchAction = st.on ? "none" : "pan-y"; }
  b.onclick = function(){ st.on = !st.on; lab(); }; lab();
  var w = cv.parentNode; w.insertAdjacentElement("afterend", b); return st;
};
XM.field = function(label, html){ return '<label class="l">' + label + '</label>' + html; };

/* ---------- Router ---------- */
var root = null, stopFns = [];
XM.onLeave = function(f){ stopFns.push(f); };
function leave(){ stopFns.forEach(function(f){ try { f(); } catch(e){} }); stopFns = []; }
function count(){
  var W = XD.W, c = { wuensche: 0 };
  for (var k in W) { if (W[k].A) c.wuensche += W[k].A.length * W[k].B.length * W[k].C.length; }
  c.wuensche += W.kurz.K.length + W.reim.R.length * (W.reim.R.length - 1);
  var bt = 0; for (var kk in XD.N.B) bt += XD.N.B[kk].length; c.namen = XD.N.A.length * bt;
  var sp = 0; for (var g in XD.SP) sp += XD.SP[g].length; c.sprueche = sp;
  c.rest = XD.Q.length + XD.B.length + XD.AD.length + XD.WELT.length + XD.WISS.length + XD.REZ.length + XD.VL.length * 4 + XD.PL.reduce(function(a, x){ return a + x[1].length; }, 0);
  var gg = 0; for (var k3 in XD.G) gg += XD.G[k3][1].length; c.geschenke = gg;
  c.total = c.wuensche + c.namen + c.sprueche + c.rest + c.geschenke;
  return c;
}
XM.count = count;
function nf(n){ return n.toLocaleString(I ? "fr-FR" : "de-DE"); }
var GROUPS = [["alle", ["Alle", "Tout"]], ["geben", ["Verschenken", "Offrir"]], ["beruf", ["Beruf & Post", "Travail et courrier"]], ["plan", ["Planen & Essen", "Organiser et cuisiner"]], ["spiel", ["Spiele & Spaß", "Jeux et plaisir"]], ["kreativ", ["Kreativ & Musik", "Créatif et musique"]], ["wissen", ["Wissen & Welt", "Savoir et monde"]]];
var GMETA = { geben: ["💌", ["Postamt & Geschenke", "Poste et cadeaux"], ["Verschenken & Verschicken", "Offrir et envoyer"]], beruf: ["💼", ["Kontor & Kundenpost", "Bureau et courrier pro"], ["Beruf & Post", "Travail et courrier"]], plan: ["🍪", ["Backstube & Festtafel", "Boulangerie et table de fête"], ["Planen, Kochen & Drucken", "Organiser, cuisiner, imprimer"]], spiel: ["🎠", ["Eisbahn & Spielwiese", "Patinoire et jeux"], ["Spiele & Spaß", "Jeux et plaisir"]], kreativ: ["🧝", ["Wichtelwerkstatt", "Atelier des lutins"], ["Kreativ & Musik", "Créatif et musique"]], wissen: ["🔭", ["Sternwarte der Welt", "Observatoire du monde"], ["Wissen & Welt", "Savoir et monde"]] };
// Farbpaare je Werkzeug (kräftig, damit weißer Text gut lesbar bleibt)
XM.COL = { karte: ["#c4162b", "#f0527a"], wunsch: ["#b8590a", "#f0a020"], wichteln: ["#1d7a47", "#4cc36e"], advent: ["#6a2c91", "#b05cd6"], countdown: ["#1f5fb8", "#4aa3f0"], wunschzettel: ["#b8307a", "#f06cb0"], gutschein: ["#c2570c", "#f58a3a"], namen: ["#0f7f86", "#35c4c4"], gedicht: ["#5a3fb8", "#9a7cf0"], quiz: ["#2b4fc4", "#7a8cf5"], bingo: ["#2a8a2a", "#8ad03a"], baum: ["#1b6b3a", "#44b86a"], flocke: ["#1c78b8", "#6cd0f5"], muetze: ["#b81f2a", "#ff6b5a"], spruch: ["#a8700a", "#f2c230"], budget: ["#1d7a5a", "#40c49a"], essen: ["#b8420a", "#f08a3a"], geschenke: ["#b82f6a", "#f58ab0"], musik: ["#3a3fb8", "#7a8af5"], brief: ["#a81f2a", "#e8505a"], sprueche: ["#b0306a", "#e86a9a"], vorlagen: ["#1d4e89", "#4a8fd8"], planer: ["#1a7a6a", "#3fc0a8"], papier: ["#9a6b0a", "#e0b030"], rezepte: ["#b04a0a", "#e8803a"], welt: ["#1f6fa8", "#3fb0d8"], wissen: ["#6a35b0", "#a47ae0"] };
function col(t){ var c = XM.COL[t.id] || ["#c4162b", "#f0527a"]; return c; }
var grp = "alle";
function lights(){ var cs = ["#e63946", "#f4a261", "#ffd23f", "#4cc36e", "#3fb0d8", "#b05cd6", "#f06cb0"], h = ""; for (var i = 0; i < 40; i++) h += '<i style="--c:' + cs[i % cs.length] + ';--d:' + ((i * 137) % 1900) / 1000 + 's"></i>'; return '<div class="lights" aria-hidden="true">' + h + '</div>'; }
function hub(){
  document.title = L("Weihnachten – Oratio Place", "Noël – Oratio Place");
  var c = count();
  root.innerHTML = '<div class="crumb"><a href="index.html">Oratio Place</a> › ' + L("Weihnachtswelt", "Le monde de Noël") + '</div>' +
    '<div class="hero"><div class="hero-bg">' + (XM.village ? XM.village("hv") : "") + '</div><div class="hero-t"><h1>' + L("Weihnachtswelt", "Le monde de Noël") + '</h1>' +
    '<p class="hero-s">' + L("Karten, Wünsche, Post für Kunden und Team, Rezepte, Wichteln, Adventskalender, Spiele und mehr – zum Verschenken, Teilen und Ausdrucken. Läuft im Browser, ohne Anmeldung.", "Cartes, vœux, courrier pour clients et équipe, recettes, Secret Santa, calendrier de l'Avent, jeux et plus – à offrir, partager et imprimer. Fonctionne dans le navigateur, sans inscription.") + '</p></div></div>' +
    '<div class="hero-z"><span><b>' + nf(c.total) + '</b> ' + L("Ideen & Kombinationen", "idées et combinaisons") + '</span><span><b>' + XM.tools.length + '</b> ' + L("Werkzeuge", "outils") + '</span><span><b>' + nf(c.wuensche) + '</b> ' + L("Wunschtexte", "textes de vœux") + '</span><span><b>' + nf(c.namen) + '</b> ' + L("Weihnachtsnamen", "noms de Noël") + '</span></div>' +
    '<div id="xmChips"></div><div id="xmGrid"></div>' +
    '<p class="hint">' + L("Datenschutz: Was du eingibst, bleibt in deinem Browser. Beim Teilen steckt der Inhalt im Link (hinter dem #) – er wird nicht an einen Server gesendet.", "Confidentialité : ce que tu saisis reste dans ton navigateur. Lors du partage, le contenu est dans le lien (après le #) – il n'est pas envoyé à un serveur.") + '</p>';
  XM.chips($("#xmChips"), GROUPS.map(function(g){ return [g[0], g[1][I]]; }), grp, function(v){ grp = v; grid(); });
  grid();
}
function cardHtml(t){ var c = col(t); return '<a class="xcard" href="#/' + t.id + '" style="--c1:' + c[0] + ';--c2:' + c[1] + '"><span class="xs">' + t.sym + '</span><b>' + esc(t.name[I]) + '</b><span class="xd">' + esc(t.desc[I]) + '</span></a>'; }
function grid(){
  var host = $("#xmGrid");
  if (grp !== "alle") { host.innerHTML = '<div class="xgrid">' + XM.tools.filter(function(t){ return t.group === grp; }).map(cardHtml).join("") + '</div>'; return; }
  host.innerHTML = Object.keys(GMETA).map(function(k){
    var ts = XM.tools.filter(function(t){ return t.group === k; }); if (!ts.length) return "";
    return '<section class="gsec g-' + k + '"><div class="gland">' + (XM.land ? XM.land(k, "g") : "") + '<h2 class="gh2"><span>' + GMETA[k][0] + '</span><b>' + esc(GMETA[k][1][I]) + '</b><small>' + esc(GMETA[k][2][I]) + '</small></h2></div><div class="xgrid">' + ts.map(cardHtml).join("") + '</div></section>';
  }).join("");
}
function tool(id){
  var t = XM.tools.filter(function(x){ return x.id === id; })[0];
  if (!t) return hub();
  document.title = t.name[I] + " – " + L("Weihnachten", "Noël") + " – Oratio Place";
  var c = col(t);
  root.innerHTML = lights() + '<div class="crumb"><a href="index.html">Oratio Place</a> › <a href="#/">' + L("Weihnachtswelt", "Le monde de Noël") + '</a> › ' + esc(t.name[I]) + '</div>' +
    '<div class="thead" style="--c1:' + c[0] + ';--c2:' + c[1] + '"><span class="tsym">' + t.sym + '</span><div><h1>' + esc(t.name[I]) + '</h1><p class="sub">' + esc(t.desc[I]) + '</p></div></div><div id="xmBody"></div>' +
    '<p class="backl"><a href="#/">← ' + L("Zurück zur Weihnachtswelt", "Retour au monde de Noël") + '</a></p>';
  t.build($("#xmBody"));
}
async function view(kind, payload){
  var f = XM.views[kind]; document.title = L("Weihnachtsgruß – Oratio Place", "Vœux de Noël – Oratio Place");
  var data = await XM.unpack(payload);
  if (!f || !data) { root.innerHTML = '<h1>' + L("Link nicht lesbar", "Lien illisible") + '</h1><p>' + L("Dieser Link ist unvollständig oder beschädigt. Vielleicht wurde er beim Kopieren abgeschnitten.", "Ce lien est incomplet ou endommagé. Il a peut-être été coupé lors de la copie.") + '</p><p><a class="btn go" href="#/">' + L("Zur Weihnachtswelt", "Au monde de Noël") + '</a></p>'; return; }
  root.innerHTML = '<div id="xmBody"></div><p class="vfoot">' + L("Gemacht mit", "Réalisé avec") + ' <a href="#/">Oratio Place · ' + L("Weihnachtswelt", "Monde de Noël") + '</a> – <a href="#/">' + L("Selbst etwas verschenken →", "Offrir toi aussi quelque chose →") + '</a></p>';
  f($("#xmBody"), data);
}
function route(){
  leave(); window.scrollTo(0, 0);
  var h = location.hash.replace(/^#/, ""), m;
  if ((m = h.match(/^v\/([a-z]+)\/(.+)$/))) return view(m[1], m[2]);
  if ((m = h.match(/^\/([a-z0-9]+)/))) return tool(m[1]);
  hub();
}
XM.start = function(){
  root = $("#xm");
  window.addEventListener("hashchange", route);
  route();
  var f = $("footer"); if (f) f.innerHTML = L("Alles läuft in deinem Browser – nichts wird hochgeladen. · Hobbyprojekt, ohne Gewähr. · ", "Tout fonctionne dans ton navigateur – rien n'est envoyé. · Projet de loisir, sans garantie. · ") + '<a href="impressum.html">' + L("Impressum &amp; Datenschutz", "Mentions légales et confidentialité") + '</a>';
  snow();
};
// leichter Schnee im Hintergrund der Startseite
function snow(){
  if (XM.reduced) return;
  var c = document.createElement("canvas"); c.id = "xmSnow"; document.body.appendChild(c);
  var ctx = c.getContext("2d"), W = 0, H = 0, fl = [];
  function size(){ W = c.width = innerWidth; H = c.height = innerHeight; fl = []; for (var i = 0; i < Math.min(70, W / 14); i++) fl.push({ x: Math.random() * W, y: Math.random() * H, v: 12 + Math.random() * 26, s: 1 + Math.random() * 2.2, ph: Math.random() * 6 }); }
  size(); addEventListener("resize", size);
  var t0 = performance.now();
  (function loop(){
    if (!document.hidden) { var t = (performance.now() - t0) / 1000; ctx.clearRect(0, 0, W, H); var dark = document.documentElement.getAttribute("data-theme") === "dark" || (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches); ctx.fillStyle = dark ? "rgba(255,255,255,.55)" : "rgba(120,170,215,.55)"; fl.forEach(function(f){ var y = (f.y + t * f.v) % (H + 10) - 5, x = f.x + Math.sin(t * .5 + f.ph) * 16; ctx.beginPath(); ctx.arc(x, y, f.s, 0, 6.3); ctx.fill(); }); }
    requestAnimationFrame(loop);
  })();
}
})();
