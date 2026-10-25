// Weihnachtswelt – gemalte Szenen (SVG): Dorf mit Schnee, Lichtern und Schornsteinrauch sowie kleine Themenwelten ("Lands").
(function(){
"use strict";
var XM = window.XM || (window.XM = {});
function rng(seed){ var a = seed >>> 0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function n(v){ return Math.round(v * 10) / 10; }
var BULB = ["#ff4d6d", "#ffb703", "#ffe066", "#5ee38a", "#4cc9f0", "#c77dff", "#ff8fab"];

function star(cx, cy, r, fill){ var p = [], i, a; for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; var rr = i % 2 ? r * .45 : r; p.push(n(cx + Math.cos(a) * rr) + "," + n(cy + Math.sin(a) * rr)); } return '<polygon points="' + p.join(" ") + '" fill="' + fill + '"/>'; }
function pine(x, base, h, col, snow, u){
  var w = h * .46, o = "";
  for (var k = 0; k < 3; k++) { var t = k / 3, y0 = base - h * (.18 + t * .27), y1 = base - h * (.18 + t * .27 + .5 - t * .1), ww = w * (1 - t * .32); o += '<polygon points="' + n(x - ww / 2) + "," + n(y0) + " " + n(x) + "," + n(y1) + " " + n(x + ww / 2) + "," + n(y0) + '" fill="' + col + '"/>'; if (snow) o += '<polygon points="' + n(x - ww * .3) + "," + n(y0 - (y0 - y1) * .42) + " " + n(x) + "," + n(y1) + " " + n(x + ww * .3) + "," + n(y0 - (y0 - y1) * .42) + '" fill="#f4f9ff" opacity=".92"/>'; }
  return o + '<rect x="' + n(x - h * .03) + '" y="' + n(base - h * .2) + '" width="' + n(h * .06) + '" height="' + n(h * .2) + '" fill="#5a3a22"/>';
}
function house(x, base, w, h, wall, roof, u, seed, smoke){
  var R = rng(seed), cx = x + w / 2, rh = w * .56, by = base - h, ay = by - rh, o = "", i;
  // Schornstein
  var chx = x + w * .68; o += '<rect x="' + n(chx) + '" y="' + n(ay + rh * .12) + '" width="' + n(w * .13) + '" height="' + n(rh * .6) + '" fill="#8a4b3a"/><rect x="' + n(chx - 2) + '" y="' + n(ay + rh * .06) + '" width="' + n(w * .13 + 4) + '" height="6" fill="#f4f9ff"/>';
  if (smoke) for (i = 0; i < 3; i++) o += '<circle class="xs-smoke" cx="' + n(chx + w * .065) + '" cy="' + n(ay) + '" r="' + (6 + i * 2) + '" fill="#fff" style="animation-delay:' + (i * 1.3) + 's"/>';
  // Wand
  o += '<rect x="' + n(x) + '" y="' + n(by) + '" width="' + n(w) + '" height="' + n(h) + '" fill="' + wall + '"/>';
  // Fachwerk
  o += '<g stroke="rgba(60,30,10,.35)" stroke-width="3"><line x1="' + n(x + w * .33) + '" y1="' + n(by) + '" x2="' + n(x + w * .33) + '" y2="' + n(base) + '"/><line x1="' + n(x + w * .67) + '" y1="' + n(by) + '" x2="' + n(x + w * .67) + '" y2="' + n(base) + '"/><line x1="' + n(x) + '" y1="' + n(by + h * .38) + '" x2="' + n(x + w) + '" y2="' + n(by + h * .38) + '"/></g>';
  // Dach
  o += '<polygon points="' + n(x - 12) + "," + n(by) + " " + n(cx) + "," + n(ay) + " " + n(x + w + 12) + "," + n(by) + '" fill="' + roof + '"/>';
  // Schnee auf dem Dach
  var lt = .5, lx = cx + (x - 12 - cx) * lt, ly = ay + (by - ay) * lt, rx = cx + (x + w + 12 - cx) * lt;
  o += '<path d="M' + n(cx) + " " + n(ay - 3) + " L" + n(lx - 3) + " " + n(ly) + " Q" + n(lx + (rx - lx) * .12) + " " + n(ly + 12) + " " + n(lx + (rx - lx) * .25) + " " + n(ly + 3) + " Q" + n(lx + (rx - lx) * .4) + " " + n(ly + 14) + " " + n(lx + (rx - lx) * .55) + " " + n(ly + 4) + " Q" + n(lx + (rx - lx) * .75) + " " + n(ly + 13) + " " + n(rx + 3) + " " + n(ly) + ' Z" fill="#f6fbff"/>';
  // Dachfenster (rund) mit Licht
  o += '<circle cx="' + n(cx) + '" cy="' + n(ay + rh * .52) + '" r="' + n(w * .075) + '" fill="url(#' + u + 'gl)"/><circle cx="' + n(cx) + '" cy="' + n(ay + rh * .52) + '" r="' + n(w * .075) + '" fill="none" stroke="#7a4a22" stroke-width="3"/>';
  // Fenster
  var ww = w * .2, wh = h * .3, wy = by + h * .16, wx = [x + w * .1, x + w * .7];
  wx.forEach(function(px){ o += '<circle cx="' + n(px + ww / 2) + '" cy="' + n(wy + wh / 2) + '" r="' + n(ww * .95) + '" fill="url(#' + u + 'halo)"/><rect x="' + n(px) + '" y="' + n(wy) + '" width="' + n(ww) + '" height="' + n(wh) + '" rx="3" fill="url(#' + u + 'gl)" stroke="#7a4a22" stroke-width="3"/><line x1="' + n(px + ww / 2) + '" y1="' + n(wy) + '" x2="' + n(px + ww / 2) + '" y2="' + n(wy + wh) + '" stroke="#7a4a22" stroke-width="2"/><line x1="' + n(px) + '" y1="' + n(wy + wh / 2) + '" x2="' + n(px + ww) + '" y2="' + n(wy + wh / 2) + '" stroke="#7a4a22" stroke-width="2"/><rect x="' + n(px - 3) + '" y="' + n(wy + wh) + '" width="' + n(ww + 6) + '" height="5" fill="#f6fbff"/>'; });
  // Tür mit Kranz
  var dw = w * .22, dh = h * .46, dx = cx - dw / 2;
  o += '<path d="M' + n(dx) + " " + n(base) + " V" + n(base - dh + dw / 2) + " Q" + n(dx) + " " + n(base - dh) + " " + n(cx) + " " + n(base - dh) + " Q" + n(dx + dw) + " " + n(base - dh) + " " + n(dx + dw) + " " + n(base - dh + dw / 2) + " V" + n(base) + ' Z" fill="#6b3a1f"/>';
  o += '<circle cx="' + n(cx) + '" cy="' + n(base - dh * .6) + '" r="' + n(dw * .3) + '" fill="none" stroke="#2f9a4f" stroke-width="5"/>' + '<circle cx="' + n(cx - dw * .2) + '" cy="' + n(base - dh * .62) + '" r="2.4" fill="#ff4d6d"/><circle cx="' + n(cx + dw * .2) + '" cy="' + n(base - dh * .56) + '" r="2.4" fill="#ff4d6d"/><circle cx="' + n(cx) + '" cy="' + n(base - dh * .6 - dw * .3) + '" r="2.8" fill="#ffd23f"/>';
  // Schnee am Boden
  o += '<ellipse cx="' + n(cx) + '" cy="' + n(base + 2) + '" rx="' + n(w * .62) + '" ry="7" fill="#f6fbff"/>';
  return o;
}
function lamp(x, base, u){
  return '<rect x="' + (x - 3) + '" y="' + (base - 78) + '" width="6" height="78" fill="#2a2f3f"/><circle cx="' + x + '" cy="' + (base - 86) + '" r="26" fill="url(#' + u + 'halo)"/><rect x="' + (x - 8) + '" y="' + (base - 96) + '" width="16" height="20" rx="4" fill="url(#' + u + 'gl)" stroke="#2a2f3f" stroke-width="3"/><polygon points="' + (x - 11) + "," + (base - 96) + " " + x + "," + (base - 108) + " " + (x + 11) + "," + (base - 96) + '" fill="#2a2f3f"/><ellipse cx="' + x + '" cy="' + (base - 106) + '" rx="9" ry="3" fill="#f6fbff"/>';
}
function lights(x1, y1, x2, y2, sag, seed, u){
  var R = rng(seed), mx = (x1 + x2) / 2, my = Math.max(y1, y2) + sag, o = '<path d="M' + n(x1) + " " + n(y1) + " Q" + n(mx) + " " + n(my) + " " + n(x2) + " " + n(y2) + '" fill="none" stroke="#2a2f3f" stroke-width="2"/>', cnt = Math.max(6, Math.round(Math.abs(x2 - x1) / 26)), i;
  for (i = 1; i < cnt; i++) { var t = i / cnt, px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2, py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2, c = BULB[Math.floor(R() * BULB.length)]; o += '<circle class="xs-bulb" cx="' + n(px) + '" cy="' + n(py + 5) + '" r="4.2" fill="' + c + '" style="animation-delay:' + n(R() * 2) + 's"/><circle cx="' + n(px) + '" cy="' + n(py + 5) + '" r="9" fill="' + c + '" opacity=".22"/>'; }
  return o;
}
function snowman(x, base){
  return '<ellipse cx="' + x + '" cy="' + (base + 2) + '" rx="30" ry="6" fill="#dfeaf7"/><circle cx="' + x + '" cy="' + (base - 18) + '" r="22" fill="#fff"/><circle cx="' + x + '" cy="' + (base - 50) + '" r="16" fill="#fff"/><circle cx="' + (x - 5) + '" cy="' + (base - 54) + '" r="2.2" fill="#222"/><circle cx="' + (x + 5) + '" cy="' + (base - 54) + '" r="2.2" fill="#222"/><polygon points="' + x + "," + (base - 50) + " " + (x + 15) + "," + (base - 47) + " " + x + "," + (base - 45) + '" fill="#ff8c1a"/><rect x="' + (x - 12) + '" y="' + (base - 74) + '" width="24" height="12" fill="#2a2f3f"/><rect x="' + (x - 17) + '" y="' + (base - 63) + '" width="34" height="4" fill="#2a2f3f"/><rect x="' + (x - 16) + '" y="' + (base - 38) + '" width="32" height="7" rx="3" fill="#e0243f"/><rect x="' + (x + 8) + '" y="' + (base - 36) + '" width="7" height="18" rx="3" fill="#e0243f"/><circle cx="' + x + '" cy="' + (base - 22) + '" r="2.4" fill="#222"/><circle cx="' + x + '" cy="' + (base - 12) + '" r="2.4" fill="#222"/>';
}
function bigTree(x, base, h, u, seed){
  var R = rng(seed), o = "", w = h * .62, k, i;
  o += '<ellipse cx="' + x + '" cy="' + (base + 4) + '" rx="' + n(w * .5) + '" ry="10" fill="#dfeaf7"/>';
  o += '<rect x="' + (x - 9) + '" y="' + (base - 22) + '" width="18" height="26" fill="#5a3a22"/>';
  for (k = 0; k < 4; k++) { var t = k / 4, y0 = base - 14 - h * t * .62, y1 = y0 - h * .42, ww = w * (1 - t * .55); o += '<polygon points="' + n(x - ww / 2) + "," + n(y0) + " " + x + "," + n(y1) + " " + n(x + ww / 2) + "," + n(y0) + '" fill="' + (k % 2 ? "#1f8a4c" : "#17743f") + '"/>'; o += '<path d="M' + n(x - ww * .34) + " " + n(y0 - (y0 - y1) * .3) + " Q" + n(x - ww * .17) + " " + n(y0 - (y0 - y1) * .2) + " " + n(x) + " " + n(y0 - (y0 - y1) * .32) + " Q" + n(x + ww * .17) + " " + n(y0 - (y0 - y1) * .2) + " " + n(x + ww * .34) + " " + n(y0 - (y0 - y1) * .3) + " L" + x + " " + n(y1 + 4) + ' Z" fill="#f6fbff" opacity=".9"/>'; }
  // Kugeln
  for (i = 0; i < 26; i++) { var yy = base - 40 - R() * h * .86, span = w * (1 - (base - yy) / (h * 1.02)) * .46, xx = x + (R() * 2 - 1) * span, c = BULB[Math.floor(R() * BULB.length)]; o += '<circle class="xs-bulb" cx="' + n(xx) + '" cy="' + n(yy) + '" r="' + n(4 + R() * 3) + '" fill="' + c + '" style="animation-delay:' + n(R() * 2) + 's"/><circle cx="' + n(xx - 1) + '" cy="' + n(yy - 1.5) + '" r="1.4" fill="#fff" opacity=".8"/>'; }
  o += '<circle cx="' + x + '" cy="' + n(base - 14 - h * .86) + '" r="46" fill="url(#' + u + 'halo)"/>' + star(x, base - 14 - h * .86 - 4, 22, "#ffd23f") + star(x, base - 14 - h * .86 - 4, 11, "#fff3a8");
  // Geschenke
  var gs = [[-60, 44, 34, "#e0243f", "#ffd23f"], [-22, 52, 28, "#2e86ff", "#fff"], [26, 46, 38, "#2f9a4f", "#ff8fab"], [64, 40, 28, "#c77dff", "#ffe066"]];
  gs.forEach(function(g){ var gx = x + g[0] - g[2] / 2, gy = base + 3 - g[2]; o += '<rect x="' + n(gx) + '" y="' + n(gy) + '" width="' + g[2] + '" height="' + g[2] + '" rx="3" fill="' + g[3] + '"/><rect x="' + n(gx + g[2] / 2 - 3) + '" y="' + n(gy) + '" width="6" height="' + g[2] + '" fill="' + g[4] + '"/><rect x="' + n(gx) + '" y="' + n(gy + g[2] / 2 - 3) + '" width="' + g[2] + '" height="6" fill="' + g[4] + '"/><circle cx="' + n(gx + g[2] / 2 - 5) + '" cy="' + n(gy - 3) + '" r="5" fill="' + g[4] + '"/><circle cx="' + n(gx + g[2] / 2 + 5) + '" cy="' + n(gy - 3) + '" r="5" fill="' + g[4] + '"/>'; });
  return o;
}
function defs(u, sky){
  var s = sky || ["#16225f", "#43358f", "#c8508c", "#ff9d6b", "#ffd9a0"];
  return '<defs><linearGradient id="' + u + 'sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + s[0] + '"/><stop offset=".32" stop-color="' + s[1] + '"/><stop offset=".62" stop-color="' + s[2] + '"/><stop offset=".86" stop-color="' + s[3] + '"/><stop offset="1" stop-color="' + s[4] + '"/></linearGradient>' +
    '<radialGradient id="' + u + 'gl"><stop offset="0" stop-color="#fff6c2"/><stop offset=".6" stop-color="#ffd36b"/><stop offset="1" stop-color="#ffb23a"/></radialGradient>' +
    '<radialGradient id="' + u + 'halo"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".75"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="' + u + 'gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfe0f5"/></linearGradient>' +
    '<linearGradient id="' + u + 'mt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d7cc8"/><stop offset="1" stop-color="#c9a3d8"/></linearGradient></defs>';
}
var STYLE = '<style>.xs-bulb{animation:xsb 2.4s ease-in-out infinite}.xs-star{animation:xsb 3s ease-in-out infinite}.xs-smoke{opacity:0;animation:xss 4s ease-out infinite}.xs-snow{animation:xsf linear infinite}@keyframes xsb{0%,100%{opacity:1}50%{opacity:.4}}@keyframes xss{0%{opacity:0;transform:translate(0,0) scale(.6)}20%{opacity:.8}100%{opacity:0;transform:translate(22px,-70px) scale(2.2)}}@keyframes xsf{from{transform:translate(0,-20px)}to{transform:translate(-30px,460px)}}@media (prefers-reduced-motion:reduce){.xs-bulb,.xs-star,.xs-smoke,.xs-snow{animation:none}}</style>';

// Das große Dorfbild. opt.still = keine Bewegung (für Bildexport)
XM.village = function(uid, opt){
  opt = opt || {};
  var u = uid || "v", R = rng(7), o = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 440" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Weihnachtsdorf im Schnee">' + defs(u) + STYLE;
  if (!opt.nosky) o += '<rect width="1200" height="440" fill="url(#' + u + 'sky)"/>';
  for (var i = 0; i < 46; i++) { var sx = R() * 1200, sy = R() * 190, sr = .8 + R() * 1.8; o += '<circle class="xs-bulb" cx="' + n(sx) + '" cy="' + n(sy) + '" r="' + n(sr) + '" fill="#fff" style="animation-delay:' + n(R() * 3) + 's"/>'; }
  o += '<circle cx="1010" cy="82" r="64" fill="url(#' + u + 'halo)"/><circle cx="1010" cy="82" r="30" fill="#fff6d6"/><circle cx="1022" cy="74" r="26" fill="#43358f" opacity=".0"/>';
  // Berge
  o += '<path d="M0 320 L110 200 L190 262 L320 150 L450 270 L560 208 L690 290 L830 170 L960 262 L1070 196 L1200 280 V340 H0Z" fill="url(#' + u + 'mt)"/>';
  o += '<path d="M320 150 L282 188 L306 182 L322 198 L338 180 L360 190 Z M830 170 L790 210 L814 204 L832 220 L850 202 L872 212 Z M110 200 L80 232 L104 226 L116 238 L134 224 L148 232 Z M1070 196 L1040 228 L1062 222 L1074 236 L1092 222 L1108 230 Z" fill="#f6fbff"/>';
  o += '<path d="M0 330 Q150 290 300 322 T600 318 T900 320 T1200 306 V380 H0Z" fill="#dfeaf9"/>';
  // Wald hinten
  var base = 346; for (i = 0; i < 26; i++) o += pine(20 + i * 47 + R() * 20, base - R() * 8, 62 + R() * 40, i % 2 ? "#1b6b45" : "#14583a", true, u);
  // Häuser
  o += house(40, 372, 150, 96, "#f4a261", "#b5342f", u, 1, true);
  o += house(222, 372, 124, 82, "#7fd1c8", "#2f5da8", u, 2, true);
  o += house(374, 372, 104, 70, "#ffd6e0", "#7a3fa0", u, 3, false);
  o += house(724, 372, 118, 80, "#ffe27a", "#c0392b", u, 4, true);
  o += house(872, 372, 150, 98, "#a9c8f5", "#9a3b32", u, 5, true);
  o += house(1050, 372, 120, 76, "#c8e6b0", "#2d6a4f", u, 6, true);
  // Lichterketten
  o += lights(110, 292, 284, 304, 26, 11, u) + lights(284, 304, 426, 312, 22, 12, u) + lights(426, 312, 600, 214, 40, 13, u) + lights(600, 214, 783, 302, 40, 14, u) + lights(783, 302, 947, 280, 30, 15, u) + lights(947, 280, 1110, 296, 30, 16, u);
  // Boden
  o += '<path d="M0 384 Q140 366 300 384 T620 382 T940 384 T1200 376 V440 H0Z" fill="url(#' + u + 'gr)"/>';
  o += '<path d="M0 418 Q200 398 420 416 T840 414 T1200 408 V440 H0Z" fill="#fff" opacity=".9"/>';
  // Mitte
  o += bigTree(600, 398, 260, u, 21);
  o += lamp(520, 400, u) + lamp(690, 400, u);
  o += snowman(458, 410) + snowman(960, 416).replace(/#e0243f/g, "#2e86ff");
  // Zaun
  for (i = 0; i < 6; i++) o += '<rect x="' + (110 + i * 26) + '" y="' + 392 + '" width="8" height="24" rx="2" fill="#a9733f"/><polygon points="' + (110 + i * 26) + ",392 " + (114 + i * 26) + ",386 " + (118 + i * 26) + ',392" fill="#a9733f"/>';
  o += '<rect x="106" y="400" width="160" height="5" fill="#8a5b30"/>';
  if (!opt.still) for (i = 0; i < 70; i++) { var fx = R() * 1260, fs = 1.4 + R() * 2.6, fd = 5 + R() * 7; o += '<circle class="xs-snow" cx="' + n(fx) + '" cy="0" r="' + n(fs) + '" fill="#fff" opacity=".85" style="animation-duration:' + n(fd) + 's;animation-delay:-' + n(R() * fd) + 's"/>'; }
  else for (i = 0; i < 80; i++) o += '<circle cx="' + n(R() * 1200) + '" cy="' + n(R() * 440) + '" r="' + n(1.2 + R() * 2.4) + '" fill="#fff" opacity=".8"/>';
  return o + "</svg>";
};

/* ---------- kleine Themenwelten ("Lands") ---------- */
function landSky(u, c){ return '<defs><linearGradient id="' + u + 'ls" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[1] + '"/></linearGradient><radialGradient id="' + u + 'gl"><stop offset="0" stop-color="#fff6c2"/><stop offset=".6" stop-color="#ffd36b"/><stop offset="1" stop-color="#ffb23a"/></radialGradient><radialGradient id="' + u + 'halo"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".75"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="150" fill="url(#' + u + 'ls)"/>'; }
function landGround(u){
  var o = '', xs = [60, 150, 250, 340, 430], hs = [86, 70, 96, 66, 80];
  o += '<path d="M0 120 Q150 108 300 120 T600 118 T900 114 T1200 112 V150 H0Z" fill="#f6fbff"/><path d="M0 136 Q300 124 600 136 T1200 130 V150 H0Z" fill="#dfeaf9"/>';
  xs.forEach(function(x, k){ o += pine(x, 128, hs[k], k % 2 ? "#14583a" : "#1b6b45", true, u); });
  o += pine(1160, 128, 84, "#1b6b45", true, u);
  return o + '<g transform="translate(560 0)">';
}
function sparkles(seed, count){ var R = rng(seed), o = "", i; for (i = 0; i < count * 2; i++) o += '<circle class="xs-bulb" cx="' + n(R() * 1200) + '" cy="' + n(R() * 90) + '" r="' + n(.8 + R() * 1.6) + '" fill="#fff" style="animation-delay:' + n(R() * 3) + 's"/>'; return o; }
var LANDS = {
  geben: function(u){ // Postamt & Geschenke
    return landSky(u, ["#6a1233", "#e0546e"]) + sparkles(1, 24) + landGround(u) + house(250, 124, 130, 48, "#ffd6e0", "#b5342f", u, 31, true) +
      '<rect x="420" y="84" width="34" height="40" rx="8" fill="#e0243f"/><rect x="426" y="92" width="22" height="5" rx="2" fill="#2a2f3f"/><rect x="436" y="124" width="4" height="12" fill="#2a2f3f"/>' +
      '<g transform="translate(130 100)"><rect width="40" height="30" rx="3" fill="#2e86ff"/><rect x="17" width="6" height="30" fill="#ffe066"/><rect y="12" width="40" height="6" fill="#ffe066"/></g><g transform="translate(176 108)"><rect width="30" height="22" rx="3" fill="#2f9a4f"/><rect x="12" width="6" height="22" fill="#fff"/></g>' + pine(60, 130, 90, "#17743f", true, u) + pine(540, 130, 80, "#17743f", true, u);
  },
  beruf: function(u){ // Kontor mit Uhr
    return landSky(u, ["#12306b", "#4a7fd0"]) + sparkles(2, 20) + landGround(u) +
      '<rect x="200" y="50" width="200" height="76" fill="#b5654a"/><polygon points="188,50 300,12 412,50" fill="#2f5da8"/><path d="M250 24 L300 6 L350 24 Z" fill="#f6fbff"/><circle cx="300" cy="46" r="17" fill="#fff" stroke="#2a2f3f" stroke-width="3"/><line x1="300" y1="46" x2="300" y2="35" stroke="#2a2f3f" stroke-width="3"/><line x1="300" y1="46" x2="309" y2="50" stroke="#2a2f3f" stroke-width="3"/>' +
      [225, 262, 322, 359].map(function(x){ return '<circle cx="' + (x + 8) + '" cy="82" r="22" fill="url(#' + u + 'halo)"/><rect x="' + x + '" y="70" width="18" height="24" rx="3" fill="url(#' + u + 'gl)" stroke="#5a3a22" stroke-width="2"/>'; }).join("") +
      '<rect x="283" y="96" width="34" height="30" rx="4" fill="#4a2c17"/><circle cx="300" cy="111" r="3" fill="#ffd23f"/>' + '<path d="M0 0" /><polygon points="188,52 412,52 412,56 188,56" fill="#f6fbff"/>' + pine(100, 130, 86, "#1b6b45", true, u) + pine(500, 130, 86, "#1b6b45", true, u);
  },
  plan: function(u){ // Backstube
    return landSky(u, ["#5a2a12", "#e8903a"]) + sparkles(3, 18) + landGround(u) + house(210, 124, 150, 50, "#ffd9a8", "#8a4b2a", u, 33, true) +
      '<g transform="translate(120 96)"><ellipse cx="22" cy="30" rx="26" ry="4" fill="#dfeaf9"/><circle cx="22" cy="12" r="12" fill="#c98a52"/><circle cx="17" cy="9" r="2" fill="#fff"/><circle cx="27" cy="9" r="2" fill="#fff"/><path d="M16 16 Q22 21 28 16" stroke="#fff" fill="none" stroke-width="2"/><rect x="8" y="22" width="28" height="10" rx="5" fill="#c98a52"/></g>' +
      '<g transform="translate(430 98)"><rect x="0" y="12" width="60" height="22" rx="6" fill="#fff"/><rect x="0" y="6" width="60" height="10" rx="5" fill="#c05a2b"/><circle cx="12" cy="3" r="4" fill="#ff4d6d"/><circle cx="32" cy="2" r="4" fill="#ffd23f"/><circle cx="50" cy="3" r="4" fill="#5ee38a"/></g>' + pine(70, 130, 84, "#17743f", true, u) + pine(555, 130, 74, "#17743f", true, u);
  },
  spiel: function(u){ // Eisbahn & Karussell
    return landSky(u, ["#3a1f7a", "#7b5fe0"]) + sparkles(4, 26) + landGround(u) +
      '<ellipse cx="170" cy="128" rx="110" ry="14" fill="#bfe3ff"/><ellipse cx="170" cy="126" rx="96" ry="9" fill="#e8f6ff"/><path d="M110 126 Q150 118 190 124 T240 122" stroke="#9ec9ee" fill="none" stroke-width="2"/>' +
      '<g transform="translate(400 20)"><polygon points="90,0 10,52 170,52" fill="#e0243f"/><polygon points="90,0 50,52 90,52" fill="#fff"/><polygon points="90,0 130,52 170,52" fill="#fff" opacity="0"/><rect x="10" y="52" width="160" height="8" fill="#ffd23f"/><rect x="26" y="60" width="5" height="44" fill="#ffe066"/><rect x="88" y="60" width="5" height="44" fill="#ffe066"/><rect x="148" y="60" width="5" height="44" fill="#ffe066"/><rect x="8" y="104" width="164" height="10" rx="4" fill="#7b5fe0"/><circle cx="58" cy="82" r="10" fill="#fff"/><rect x="52" y="82" width="12" height="20" rx="4" fill="#fff"/><circle cx="120" cy="82" r="10" fill="#ffd23f"/><rect x="114" y="82" width="12" height="20" rx="4" fill="#ffd23f"/>' + star(90, -6, 10, "#ffd23f") + '</g>' + snowman(60, 128) + pine(330, 130, 80, "#17743f", true, u);
  },
  kreativ: function(u){ // Wichtelwerkstatt
    return landSky(u, ["#0d5f58", "#3fc0a8"]) + sparkles(5, 22) + landGround(u) + house(230, 124, 120, 46, "#d7efe5", "#c0392b", u, 35, true) +
      '<g transform="translate(404 70)"><circle cx="30" cy="30" r="22" fill="none" stroke="#6b4a2f" stroke-width="8" stroke-dasharray="7 5"/><circle cx="30" cy="30" r="12" fill="#c98a52"/></g>' +
      '<g transform="translate(130 84)">' + star(24, 20, 20, "#ffd23f") + '<rect x="19" y="36" width="10" height="20" fill="#6b4a2f"/></g>' +
      '<g transform="translate(460 100)"><polygon points="0,30 14,0 28,30" fill="#e0243f"/><circle cx="14" cy="-2" r="4" fill="#fff"/><rect x="2" y="30" width="24" height="12" rx="6" fill="#ffd9a8"/></g>' + pine(70, 130, 88, "#17743f", true, u) + pine(555, 130, 78, "#17743f", true, u);
  },
  wissen: function(u){ // Sternwarte
    return landSky(u, ["#0b1230", "#2c3e8f"]) + sparkles(6, 44) +
      '<circle cx="520" cy="34" r="16" fill="#fff6d6"/>' + landGround(u) +
      '<rect x="255" y="52" width="90" height="74" fill="#8e9ac7"/><path d="M247 52 A53 46 0 0 1 353 52Z" fill="#f6fbff"/><rect x="292" y="14" width="16" height="42" fill="#2a2f3f" transform="rotate(-24 300 52)"/><path d="M300 52 L300 4" stroke="#ffd23f" stroke-width="3" opacity="0"/>' +
      '<rect x="285" y="86" width="30" height="40" rx="4" fill="#2a2f3f"/>' + [268, 322].map(function(x){ return '<circle cx="' + (x + 5) + '" cy="76" r="14" fill="url(#' + u + 'halo)"/><rect x="' + x + '" y="68" width="10" height="16" rx="2" fill="url(#' + u + 'gl)"/>'; }).join("") +
      '<g transform="translate(150 60)">' + star(20, 20, 18, "#ffd23f") + '</g><g transform="translate(430 70)">' + star(14, 14, 12, "#ff8fab") + '</g>' + pine(90, 130, 80, "#1b6b45", true, u) + pine(520, 130, 90, "#1b6b45", true, u);
  }
};
XM.land = function(key, uid){
  var f = LANDS[key]; if (!f) return "";
  var u = (uid || "l") + key;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 150" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">' + STYLE + f(u) + "</g></svg>";
};
})();
