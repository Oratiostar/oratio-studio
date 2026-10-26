// Weihnachtswelt – jedes Gericht einzeln gezeichnet. Überschreibt XM.dish (Fallback: alte Zeichnung).
(function(){
var OLD = XM.dish, W = 400, H = 240, UID = "", gi = 0, DF = [];
function h2(h){ h = h.replace("#", ""); if (h.length === 3) h = h.replace(/(.)/g, "$1$1"); return [parseInt(h.substr(0,2),16), parseInt(h.substr(2,2),16), parseInt(h.substr(4,2),16)]; }
function mix(a, b, t){ var x = h2(a), y = h2(b), r = []; for (var i = 0; i < 3; i++) r.push(Math.round(x[i] + (y[i] - x[i]) * t)); return "#" + r.map(function(v){ return ("0" + v.toString(16)).slice(-2); }).join(""); }
function li(c, t){ return mix(c, "#ffffff", t); }
function da(c, t){ return mix(c, "#000000", t); }
function rg(c, cx, cy){ var id = "q" + UID + "_" + (gi++); DF.push('<radialGradient id="' + id + '" cx="' + (cx || .36) + '" cy="' + (cy || .28) + '" r=".9"><stop offset="0" stop-color="' + li(c, .38) + '"/><stop offset=".55" stop-color="' + c + '"/><stop offset="1" stop-color="' + da(c, .38) + '"/></radialGradient>'); return "url(#" + id + ")"; }
function lg(c1, c2, vert){ var id = "q" + UID + "_" + (gi++); DF.push('<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (vert === false ? 1 : 0) + '" y2="' + (vert === false ? 0 : 1) + '"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient>'); return "url(#" + id + ")"; }
function E(cx, cy, rx, ry, c, ex){ return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + rg(c) + '" ' + (ex || "") + '/>'; }
function EF(cx, cy, rx, ry, f, ex){ return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '" ' + (ex || "") + '/>'; }
function C(cx, cy, r, c, ex){ return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + rg(c) + '" ' + (ex || "") + '/>'; }
function PA(d, c, ex){ return '<path d="' + d + '" fill="' + (c.indexOf("url") === 0 ? c : rg(c)) + '" ' + (ex || "") + '/>'; }
function PL(d, c, ex){ return '<path d="' + d + '" fill="' + c + '" ' + (ex || "") + '/>'; }
function ST(d, c, w, ex){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round" ' + (ex || "") + '/>'; }
function HI(cx, cy, rx, ry, op, rot){ return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity="' + (op || .35) + '"' + (rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"' : '') + '/>'; }
function SH(cx, cy, rx, ry, op){ return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#160800" opacity="' + (op || .4) + '" filter="url(#bl' + UID + ')"/>'; }
function plate(cx, cy, rx, ry, col){
  col = col || "#f4f5f7";
  return SH(cx + 4, cy + ry * .55, rx + 4, ry * .95, .45)
    + '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + lg(li(col, .5), da(col, .22)) + '"/>'
    + '<ellipse cx="' + cx + '" cy="' + (cy + 1) + '" rx="' + (rx * .77) + '" ry="' + (ry * .75) + '" fill="' + lg(da(col, .12), li(col, .25)) + '"/>'
    + '<path d="M' + (cx - rx * .9) + ' ' + (cy - ry * .25) + ' Q' + (cx - rx * .5) + ' ' + (cy - ry * .95) + ' ' + (cx + rx * .2) + ' ' + (cy - ry * .98) + '" stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none" stroke-linecap="round"/>';
}
function steam(x, y, n){ var o = '<g fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-linecap="round" class="xs-smoke">'; for (var i = 0; i < (n || 2); i++) o += '<path d="M' + (x + i * 16) + ' ' + y + 'c-9-10 9-17 0-28"/>'; return o + '</g>'; }
function leaf(x, y, a, c, s){ s = s || 1; return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ') scale(' + s + ')"><path d="M0 0 Q8 -9 22 -4 Q10 6 0 0z" fill="' + c + '"/><path d="M2 -1 L18 -4" stroke="' + da(c, .3) + '" stroke-width="1" fill="none"/></g>'; }
function sprig(x, y, s){ s = s || 1; return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + ST("M0 0 q2 -12 -6 -22 M0 0 q10 -8 18 -18 M0 0 q-12 -4 -20 -2", "#2f7a3a", 3) + C(2, -3, 3, "#d02a38") + C(-3, -1, 2.6, "#d02a38") + '</g>'; }
function dots(n, x0, y0, rx, ry, rmin, rmax, cols, seed){ var o = "", s = seed || 7; function r(){ s = (s * 16807) % 2147483647; return s / 2147483647; } for (var i = 0; i < n; i++){ var a = r() * 6.283, d = Math.sqrt(r()); o += '<circle cx="' + (x0 + Math.cos(a) * rx * d).toFixed(1) + '" cy="' + (y0 + Math.sin(a) * ry * d).toFixed(1) + '" r="' + (rmin + r() * (rmax - rmin)).toFixed(1) + '" fill="' + cols[i % cols.length] + '"/>'; } return o; }

/* ---------- Becher / Gläser ---------- */
function mug(o){
  var cx = 190, top = 100, bot = 188, wT = 70, wB = 56, s = SH(cx + 6, 198, 84, 12, .45);
  var liq = o.liq, glass = o.glass;
  s += EF(cx, 196, 92, 14, lg("#fff", "#cfd5dc"));
  var body = 'M' + (cx - wT) + ' ' + top + ' L' + (cx + wT) + ' ' + top + ' L' + (cx + wB) + ' ' + (bot - 10) + ' Q' + (cx + wB - 2) + ' ' + bot + ' ' + (cx + wB - 18) + ' ' + bot + ' L' + (cx - wB + 18) + ' ' + bot + ' Q' + (cx - wB + 2) + ' ' + bot + ' ' + (cx - wB) + ' ' + (bot - 10) + ' Z';
  // Henkel
  s += ST('M' + (cx + wT - 2) + ' 112 q38 -2 34 34 q-4 30 -' + (wT - wB + 38) + ' 26', glass ? "#e8f0f6" : o.cer, 11, 'opacity="' + (glass ? .8 : 1) + '"');
  s += ST('M' + (cx + wT - 2) + ' 112 q38 -2 34 34 q-4 30 -' + (wT - wB + 38) + ' 26', glass ? "#ffffff" : li(o.cer, .5), 3, 'opacity=".5" transform="translate(-1 -2)"');
  if (glass){
    s += PL(body, lg("rgba(255,255,255,.35)", "rgba(210,225,235,.35)", false), 'stroke="rgba(255,255,255,.7)" stroke-width="2"');
    var lb = 'M' + (cx - wT + 6) + ' 112 L' + (cx + wT - 6) + ' 112 L' + (cx + wB - 5) + ' ' + (bot - 8) + ' Q' + (cx + wB - 8) + ' ' + (bot - 3) + ' ' + (cx + wB - 20) + ' ' + (bot - 3) + ' L' + (cx - wB + 20) + ' ' + (bot - 3) + ' Q' + (cx - wB + 8) + ' ' + (bot - 3) + ' ' + (cx - wB + 5) + ' ' + (bot - 8) + ' Z';
    s += PL(lb, lg(liq[0], liq[1]));
    s += EF(cx, 112, wT - 6, 9, lg(li(liq[0], .25), liq[0]));
    s += PL('M' + (cx - wT + 12) + ' 120 L' + (cx - wB + 12) + ' ' + (bot - 14), 'none', 'stroke="#fff" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"');
    s += EF(cx, top, wT, 10, "none", 'stroke="rgba(255,255,255,.85)" stroke-width="2.5"');
  } else {
    s += PL(body, lg(li(o.cer, .35), da(o.cer, .18), false));
    s += EF(cx, top, wT, 11, lg(li(o.cer, .5), o.cer));
    s += EF(cx, top + 1, wT - 7, 8.5, lg(da(liq[0], .25), liq[0]));
    s += PL('M' + (cx - wT + 12) + ' 114 L' + (cx - wB + 10) + ' ' + (bot - 14), 'none', 'stroke="#fff" stroke-opacity=".45" stroke-width="6" stroke-linecap="round"');
  }
  s += steam(cx - 40, 78, 3);
  return s;
}
function slice(cx, cy, r, c, c2){ var o = C(cx, cy, r, c); o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * .82) + '" fill="' + c2 + '"/>'; for (var i = 0; i < 8; i++){ var a = i * Math.PI / 4; o += '<path d="M' + cx + ' ' + cy + ' L' + (cx + Math.cos(a) * r * .8).toFixed(1) + ' ' + (cy + Math.sin(a) * r * .8).toFixed(1) + '" stroke="' + c + '" stroke-width="1.6"/>'; } return o + HI(cx - r * .3, cy - r * .35, r * .35, r * .18, .4, -30); }
function anise(x, y, s){ var o = '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">'; for (var i = 0; i < 8; i++){ o += '<ellipse cx="0" cy="-9" rx="3.6" ry="9" fill="#6a3a1a" transform="rotate(' + (i * 45) + ')"/>'; } return o + '<circle r="3.4" fill="#8a5028"/></g>'; }
function cinn(x, y, a, L){ return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ')"><rect x="0" y="-4" width="' + (L || 60) + '" height="8" rx="4" fill="' + lg("#b8793c", "#7a4a1e") + '"/><path d="M4 0 H' + ((L || 60) - 4) + '" stroke="#e0a870" stroke-width="1.2" opacity=".7"/></g>'; }
function whip(x, y){ return E(x, y + 6, 40, 14, "#fffdf6") + E(x, y - 4, 32, 12, "#ffffff") + E(x, y - 14, 22, 10, "#ffffff") + E(x + 2, y - 22, 12, 8, "#fffdf6") + HI(x - 10, y - 14, 8, 3, .6, -20); }

/* ---------- Gefäße ---------- */
function bowl(cx, cy, rx, hh, col, fill, fr){
  var s = SH(cx + 5, cy + hh + 4, rx + 8, 12, .45);
  s += PA('M' + (cx - rx) + ' ' + cy + ' Q' + (cx - rx + 8) + ' ' + (cy + hh) + ' ' + cx + ' ' + (cy + hh + 6) + ' Q' + (cx + rx - 8) + ' ' + (cy + hh) + ' ' + (cx + rx) + ' ' + cy + ' Z', lg(li(col, .3), da(col, .22), false));
  s += EF(cx, cy, rx, rx * .26, lg(li(col, .5), col));
  s += EF(cx, cy + 1, rx - 7, rx * .26 - 5, lg(da(fill, .2), li(fill, .1)));
  return s;
}
function pot(cx, cy, rx, hh, col, fill){
  var s = SH(cx + 5, cy + hh + 6, rx + 10, 12, .45);
  s += PA('M' + (cx - rx) + ' ' + cy + ' L' + (cx - rx + 8) + ' ' + (cy + hh) + ' Q' + cx + ' ' + (cy + hh + 8) + ' ' + (cx + rx - 8) + ' ' + (cy + hh) + ' L' + (cx + rx) + ' ' + cy + ' Z', lg(li(col, .3), da(col, .25), false));
  s += ST('M' + (cx - rx) + ' ' + (cy + 8) + ' q-18 0 -20 12', da(col, .2), 6) + ST('M' + (cx + rx) + ' ' + (cy + 8) + ' q18 0 20 12', da(col, .2), 6);
  s += EF(cx, cy, rx, rx * .24, lg(li(col, .5), col));
  s += EF(cx, cy + 1, rx - 6, rx * .24 - 4, lg(da(fill, .2), li(fill, .12)));
  return s;
}
function stand(cx, y){ return PA('M' + (cx - 60) + ' ' + y + ' L' + (cx - 40) + ' ' + (y + 30) + ' L' + (cx + 40) + ' ' + (y + 30) + ' L' + (cx + 60) + ' ' + y + 'Z', "#6a4a3a") + EF(cx, y + 31, 52, 7, "#3a2a22") + C(cx + 20, y + 14, 5, "#ffb44a"); }
function fork(x, y, a, L, tip){ return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ')"><rect x="0" y="-2.5" width="' + L + '" height="5" rx="2.5" fill="' + lg("#f2f2f2", "#a8aeb6") + '"/><rect x="' + (L - 6) + '" y="-3.5" width="7" height="7" rx="3" fill="#7a5a3a"/>' + (tip || "") + '</g>'; }
function bread(x, y, s, a){ return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (a || 0) + ') scale(' + (s || 1) + ')"><path d="M-12 -9 L10 -12 L13 8 L-10 11Z" fill="' + lg("#f4e0b0", "#d8b070") + '"/><path d="M-12 -9 L10 -12 L12 -8 L-11 -5Z" fill="#c08a42"/></g>'; }

/* ---------- Teller-Gerichte ---------- */
var K = {};

K.gluehwein = function(){ return mug({glass:true, liq:["#9e1a34","#4a0814"]}) + slice(150, 108, 19, "#f08a1c", "#ffbc50") + anise(222, 108, 1) + cinn(214, 140, -78, 58) + ST("M182 112 q10 -4 20 0", "#ffe0e0", 2, 'opacity=".5"'); };
K.punsch = function(){ return mug({glass:true, liq:["#e0762c","#a8420e"]}) + slice(158, 109, 17, "#f2c21c", "#fff08a") + C(210, 110, 8, "#d8242c") + C(228, 114, 6, "#7a2a8a") + C(196, 114, 5, "#d8242c") + cinn(214, 144, -80, 50); };
K.schoko = function(){ return mug({glass:false, cer:"#d84a3a", liq:["#5a2f1d","#3a1c10"]}) + whip(190, 92) + dots(8, 190, 84, 24, 6, 1.2, 2.2, ["#4a2418","#6a3a22"], 3) + '<g transform="translate(205 78) rotate(15)"><rect x="-4" y="-2" width="10" height="9" rx="2" fill="#fff"/></g>' + '<g transform="translate(168 80)"><rect x="-5" y="-5" width="10" height="10" rx="2.5" fill="#ffd0e0"/></g>' + ST("M230 74 q4 -18 -10 -22 q-10 -2 -10 6", "#e0243a", 4) + ST("M214 62 l12 8", "#fff", 2.4); };
K.weissglue = function(){ return mug({glass:true, liq:["#f2d870","#c8a42c"]}) + slice(160, 108, 17, "#f4d22c", "#fff6a8") + cinn(212, 142, -80, 52) + C(226, 112, 4, "#6a3a1a") + C(214, 116, 3.4, "#6a3a1a") + anise(186, 111, .8); };
K.apfelingwer = function(){ return mug({glass:true, liq:["#e8b44a","#b27a1c"]}) + '<g transform="translate(156 100)">' + PA("M0 0 Q18 -26 36 0 Q18 -8 0 0z", "#d6402a") + '<path d="M4 -2 Q18 -14 32 -2" stroke="#fff6d0" stroke-width="3" fill="none"/></g>' + '<g transform="translate(200 108)">' + E(0, 0, 14, 8, "#f0d890") + E(14, 6, 12, 7, "#e8c870") + '</g>' + cinn(214, 144, -80, 52); };

K.kipferl = function(){
  var s = plate(200, 160, 150, 44, "#f6efe4");
  function kip(x, y, a, sc){ return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ') scale(' + (sc || 1) + ')">' + PA("M-34 8 Q-30 -22 0 -24 Q30 -22 34 8 Q36 16 28 14 Q22 -4 0 -8 Q-22 -4 -28 14 Q-36 16 -34 8Z", "#e2b668") + PL("M-30 4 Q-26 -16 0 -19 Q26 -16 30 4 Q20 -8 0 -12 Q-20 -8 -30 4Z", "#fff", 'opacity=".9"') + dots(14, 0, -10, 24, 5, .6, 1.4, ["#fff", "#fffaf0"], 5) + '</g>'; }
  return s + kip(150, 168, -8, 1) + kip(240, 170, 10, 1) + kip(196, 150, 0, 1.05) + kip(172, 130, 14, .9) + kip(232, 134, -14, .9) + dots(30, 200, 150, 100, 24, .6, 1.5, ["#fff"], 11);
};
K.bratapfel = function(){
  var s = plate(200, 172, 150, 42, "#f4f5f7") + EF(200, 176, 118, 26, lg("#fff3c8", "#e6c27a"), 'opacity=".95"');
  s += SH(200, 186, 70, 12, .4);
  s += PA("M118 128 Q112 82 170 78 Q200 84 230 78 Q288 82 282 128 Q290 176 238 184 Q200 190 162 184 Q110 176 118 128Z", "#cf3626");
  s += PL("M130 120 Q132 94 168 92", 'none', 'stroke="#ff9a7a" stroke-width="8" stroke-linecap="round" opacity=".5"');
  for (var i = 0; i < 6; i++) s += ST("M" + (150 + i * 20) + " 100 q4 28 -2 56", "#a82414", 2, 'opacity=".5"');
  s += EF(200, 90, 38, 10, lg("#4a2a14", "#8a5a2a")) + E(200, 88, 28, 7, "#d8a85a") + dots(10, 200, 88, 24, 5, 1.4, 2.4, ["#fff0c8", "#e8c068", "#a0501c"], 2);
  s += ST("M200 82 q0 -22 8 -30", "#6a4a1a", 4) + leaf(206, 60, -30, "#4a9a3a", 1.1);
  s += ST("M150 172 q50 12 110 0", "#fff", 3, 'opacity=".5"');
  s += cinn(250, 172, -20, 46) + anise(142, 178, .8) + steam(170, 66, 2);
  return s;
};
K.rotkohl = function(){
  var s = plate(200, 166, 152, 44, "#f4f5f7");
  var o = SH(200, 178, 100, 16, .4) + PA("M96 146 Q90 108 140 100 Q170 82 214 92 Q270 88 296 120 Q316 154 270 178 Q200 192 128 178 Q96 170 96 146Z", "#8a2a72");
  o += dots(46, 200, 140, 92, 34, 5, 11, ["#7a1c68", "#a63c8e", "#6a1458", "#b04a9a"], 4);
  o += dots(14, 200, 130, 80, 24, 2, 4, ["#f0d890"], 9) + HI(160, 108, 34, 7, .35, -12) + HI(250, 118, 20, 5, .25, 15);
  o += ST("M180 100 q30 -14 60 4", "#ffdcf4", 3, 'opacity=".4"') + leaf(238, 98, -20, "#4a8a3a", 1.2) + C(150, 108, 4, "#6a3a1a");
  return s + o + steam(188, 80, 2);
};
K.kartoffelsalat = function(){
  var s = plate(200, 164, 152, 44, "#f4f5f7") + SH(200, 176, 96, 14, .35);
  s += PA("M104 150 Q100 108 150 100 Q200 84 250 100 Q300 108 296 150 Q290 178 200 182 Q110 178 104 150Z", "#f0dc88");
  for (var i = 0; i < 30; i++){ var a = i * 2.4, d = 20 + (i * 17) % 78; s += '<ellipse cx="' + (200 + Math.cos(a) * d).toFixed(1) + '" cy="' + (140 + Math.sin(a) * d * .38).toFixed(1) + '" rx="12" ry="6" fill="' + rg(i % 2 ? "#f6e6a0" : "#ead276") + '" transform="rotate(' + (i * 23 % 60 - 30) + ' ' + (200 + Math.cos(a) * d).toFixed(1) + ' ' + (140 + Math.sin(a) * d * .38).toFixed(1) + ')"/>'; }
  s += dots(34, 200, 134, 90, 28, 1.6, 3.2, ["#3a8a3a", "#4aa84a", "#d8462c"], 8) + dots(10, 200, 130, 80, 22, 3, 5, ["#f4f4ee"], 2);
  s += HI(160, 108, 30, 5, .4, -10);
  // Würstchen
  function wu(x, y, a){ return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ')"><rect x="-44" y="-9" width="88" height="18" rx="9" fill="' + lg("#e8845a", "#a8421e") + '"/><rect x="-38" y="-6" width="76" height="4" rx="2" fill="#fff" opacity=".35"/></g>'; }
  return s + wu(160, 176, -4) + wu(240, 178, 6) + sprig(250, 108, .8);
};
K.buche = function(){
  var s = SH(200, 196, 150, 14, .45) + EF(200, 190, 160, 18, lg("#d8c09a", "#8a6a44"));
  s += PA("M70 150 Q66 108 108 100 L300 98 Q342 102 336 148 Q330 184 296 186 L108 188 Q72 186 70 150Z", "#5a3220");
  for (var i = 0; i < 12; i++) s += ST("M" + (100 + i * 18) + " " + (108 + (i % 2) * 6) + " q8 14 -2 30 q-6 16 4 34", "#2e170c", 3, 'opacity=".55"');
  s += HI(190, 114, 90, 6, .22, -2);
  s += PA("M292 98 Q336 100 338 146 Q336 188 294 188 Q320 150 292 98Z", "#e8c08a") + '<ellipse cx="318" cy="143" rx="30" ry="44" fill="' + rg("#4a2814") + '"/><ellipse cx="318" cy="143" rx="24" ry="37" fill="#f4dca8"/><ellipse cx="318" cy="143" rx="17" ry="27" fill="#4a2814"/><ellipse cx="318" cy="143" rx="11" ry="17" fill="#f4dca8"/><ellipse cx="318" cy="143" rx="5" ry="8" fill="#4a2814"/>';
  s += dots(60, 190, 112, 110, 8, .8, 1.6, ["#fff"], 6);
  s += sprig(150, 104, 1.1) + leaf(176, 100, -20, "#2f7a3a", 1.2) + C(196, 100, 5, "#d02a38") + C(206, 102, 4, "#d02a38");
  s += '<g transform="translate(250 96)"><rect x="-8" y="-10" width="16" height="18" rx="3" fill="#fff" opacity=".92"/></g>';
  return s;
};
K.fondue = function(){
  var s = stand(200, 168) + pot(200, 112, 72, 52, "#c2362a", "#f2c43a");
  s += HI(184, 112, 30, 4, .45, -4) + dots(7, 200, 114, 50, 6, 2, 4, ["#fff0a0", "#e8a820"], 4);
  s += fork(262, 52, 112, 112, bread(0, 0, .9)) + '<g transform="translate(262 52)"><path d="M0 0 L8 26" stroke="none"/></g>';
  s += bread(268, 150, 1.1, 20) + bread(300, 168, 1, -10) + bread(246, 178, 1, 40) + bread(330, 156, 1, 8);
  s += E(120, 190, 28, 8, "#fff") + E(112, 184, 8, 5, "#f0c040");
  s += EF(100, 192, 10, 3, "none") + steam(180, 82, 2);
  return s;
};
K.schokofondue = function(){
  var s = stand(150, 172) + pot(150, 122, 62, 44, "#40404a", "#4a2418");
  s += HI(134, 122, 24, 3.5, .45, -4) + steam(130, 90, 2);
  s += fork(200, 60, 112, 96, C(0, 0, 7, "#d0243a"));
  s += plate(300, 176, 94, 30, "#f4f5f7");
  function berry(x, y){ return PA("M" + x + " " + (y + 12) + " Q" + (x - 14) + " " + (y - 2) + " " + (x - 8) + " " + (y - 10) + " Q" + x + " " + (y - 14) + " " + (x + 8) + " " + (y - 10) + " Q" + (x + 14) + " " + (y - 2) + " " + x + " " + (y + 12) + "Z", "#d4202e") + leaf(x - 2, y - 11, -90, "#2f8a3a", .9) + dots(6, x, y, 5, 6, .7, 1, ["#ffe69a"], x); }
  s += berry(260, 160) + berry(284, 168) + berry(262, 184);
  s += E(310, 166, 12, 7, "#f6dc7a") + E(330, 178, 12, 7, "#f2d062") + E(304, 184, 11, 6, "#f6dc7a");
  for (var i = 0; i < 4; i++) s += C(330 + i * 6, 156 - i * 2, 6, i % 2 ? "#ffd0e0" : "#fff", 'opacity=".95"');
  s += dots(14, 300, 176, 70, 16, 1, 2, ["#6a3a20"], 3);
  return s;
};
K.fleischfondue = function(){
  var s = stand(130, 168) + pot(130, 114, 66, 48, "#2a2d34", "#c88a1c");
  s += HI(114, 114, 26, 4, .4, -4) + '<g fill="rgba(255,255,255,.5)"><circle cx="106" cy="114" r="3"/><circle cx="130" cy="116" r="2.4"/><circle cx="150" cy="113" r="3"/></g>';
  function spiess(x, y, a, c){ return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ')"><rect x="-4" y="-2" width="90" height="4" rx="2" fill="' + lg("#f2f2f2", "#8a9098") + '"/><rect x="82" y="-3" width="12" height="6" rx="3" fill="#7a4a1e"/>' + '<rect x="2" y="-8" width="16" height="16" rx="4" fill="' + rg(c) + '"/><rect x="20" y="-8" width="16" height="16" rx="4" fill="' + rg(c) + '"/></g>'; }
  s += spiess(168, 60, 84, "#c9674a") + spiess(182, 58, 78, "#e0a07a");
  s += plate(290, 170, 100, 34, "#f4f5f7");
  s += PA("M222 168 Q240 150 262 160 Q270 176 244 184 Q222 182 222 168Z", "#c43a3a") + PA("M250 178 Q272 166 292 174 Q296 188 270 192 Q250 190 250 178Z", "#d65a56") + PA("M276 160 Q296 150 312 160 Q316 174 292 174 Q274 172 276 160Z", "#e8a07a");
  s += '<path d="M232 164 Q246 158 256 164" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none"/>';
  function dip(x, c){ return EF(x, 196, 20, 7, lg("#fff", "#cfd5dc")) + EF(x, 194, 15, 5, rg(c)); }
  s += dip(322, "#e0a820") + dip(350, "#c4301e") + dip(336, "#8ab04a").replace("cy=\"196\"", "cy=\"204\"");
  return s + steam(116, 84, 2);
};

K.zimtsterne = function(){
  var s = plate(200, 164, 150, 44, "#f6efe4");
  function st(x, y, R, a){ var p = []; for (var i = 0; i < 10; i++){ var an = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * .5 : R; p.push((x + Math.cos(an) * r).toFixed(1) + "," + (y + Math.sin(an) * r * .86).toFixed(1)); } return '<polygon points="' + p.join(" ") + '" fill="' + rg("#9a6a3c") + '" transform="rotate(' + (a || 0) + ' ' + x + ' ' + y + ')"/>'; }
  function stg(x, y, R, a){ var p = []; for (var i = 0; i < 10; i++){ var an = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * .46 : R * .9; p.push((x + Math.cos(an) * r).toFixed(1) + "," + (y + Math.sin(an) * r * .86 - 1).toFixed(1)); } return '<polygon points="' + p.join(" ") + '" fill="#fffdf6" transform="rotate(' + (a || 0) + ' ' + x + ' ' + y + ')"/>'; }
  var pos = [[130, 168, 40, 8], [262, 172, 40, -6], [196, 154, 44, 0], [160, 136, 34, 14], [240, 136, 34, -12]];
  var o = ""; pos.forEach(function(p){ o += st(p[0], p[1] + 3, p[2], p[3]) + stg(p[0], p[1], p[2], p[3]); });
  return s + o + dots(18, 200, 150, 100, 20, .7, 1.4, ["#fff"], 12);
};
K.lebkuchen = function(){
  var s = plate(200, 164, 152, 44, "#f4f5f7");
  function lk(x, y, r, c){ return SH(x + 3, y + r * .5, r, r * .3, .4) + '<ellipse cx="' + x + '" cy="' + y + '" rx="' + r + '" ry="' + (r * .62) + '" fill="' + rg("#8a4a22") + '"/><ellipse cx="' + x + '" cy="' + (y - 2) + '" rx="' + (r * .86) + '" ry="' + (r * .5) + '" fill="' + rg(c) + '"/>' + dots(6, x, y - 2, r * .6, r * .28, 2.4, 3.4, ["#f4e6c0", "#e8d29a"], x) + '<ellipse cx="' + (x - r * .3) + '" cy="' + (y - r * .28) + '" rx="' + (r * .3) + '" ry="' + (r * .08) + '" fill="#fff" opacity=".35"/>'; }
  var o = lk(138, 168, 52, "#3a1c10") + lk(262, 170, 52, "#fff6e4") + lk(200, 140, 50, "#4a2418");
  o += ST("M246 168 q8 -8 16 0 q8 8 16 0", "#d02a38", 2.5) + ST("M178 140 q10 -8 20 0 q10 8 20 0", "#fff", 2.5) + C(138, 168, 4, "#fff0c8");
  return s + o;
};
K.spritz = function(){
  var s = plate(200, 164, 150, 44, "#f6efe4");
  function ring(x, y, R, ch){ return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + R + '" ry="' + (R * .62) + '" fill="none" stroke="' + lg("#f4d890", "#c8923c") + '" stroke-width="13"/><ellipse cx="' + x + '" cy="' + (y - 2) + '" rx="' + R + '" ry="' + (R * .62) + '" fill="none" stroke="#fff3c8" stroke-width="3" opacity=".6"/>' + (ch ? '<path d="M' + (x - R) + ' ' + y + ' A' + R + ' ' + (R * .62) + ' 0 0 0 ' + (x + R) + ' ' + y + '" fill="none" stroke="#4a2418" stroke-width="13" opacity=".92"/>' : ""); }
  function sform(x, y, ch){ return '<g transform="translate(' + x + ' ' + y + ')">' + ST("M-30 8 C-30 -14 0 -14 0 0 C0 14 30 14 30 -8", "#d8a050", 14) + ST("M-30 8 C-30 -14 0 -14 0 0 C0 14 30 14 30 -8", "#f6dc98", 4, 'transform="translate(-1 -2)" opacity=".7"') + (ch ? ST("M0 0 C0 14 30 14 30 -8", "#4a2418", 14, 'opacity=".9"') : "") + '</g>'; }
  return s + ring(136, 166, 38, true) + ring(262, 168, 36, false) + sform(200, 150, true) + sform(160, 134, false) + C(262, 168, 4, "#d02a38") + dots(20, 200, 150, 100, 20, .8, 1.5, ["#fff", "#d02a38", "#2f8a3a"], 3);
};
K.ausstech = function(){
  var s = plate(200, 164, 152, 44, "#f4f5f7");
  var tree = '<g transform="translate(130 150)">' + PA("M0 -34 L22 -4 L10 -4 L28 20 L-28 20 L-10 -4 L-22 -4Z", "#e2b668") + PL("M0 -28 L16 -6 L6 -6 L20 14 L-20 14 L-6 -6 L-16 -6Z", "#2f8a4a", 'opacity=".95"') + C(-6, 0, 2.4, "#d02a38") + C(6, 8, 2.4, "#ffd34a") + C(-8, 12, 2.4, "#4a8af0") + C(4, -14, 2.4, "#d02a38") + '</g>';
  var star = '<g transform="translate(206 140)">' + PA("M0 -34 L10 -10 L36 -10 L15 6 L23 32 L0 17 L-23 32 L-15 6 L-36 -10 L-10 -10Z", "#e2b668") + PL("M0 -26 L8 -8 L28 -8 L12 4 L18 24 L0 13 L-18 24 L-12 4 L-28 -8 L-8 -8Z", "#fff", 'opacity=".95"') + dots(8, 0, 0, 14, 14, 1.4, 2, ["#d02a38", "#2f8a4a", "#4a8af0"], 6) + '</g>';
  var heart = '<g transform="translate(272 168)">' + PA("M0 22 C-40 -4 -22 -34 0 -14 C22 -34 40 -4 0 22Z", "#e2b668") + PL("M0 16 C-30 -2 -16 -24 0 -9 C16 -24 30 -2 0 16Z", "#d02a4a", 'opacity=".95"') + ST("M-12 -2 q12 -8 24 0", "#fff", 2) + '</g>';
  var moon = '<g transform="translate(160 184)">' + PA("M-24 0 A28 28 0 1 1 20 22 A22 22 0 1 0 -24 0Z", "#e2b668") + '</g>';
  var men = '<g transform="translate(236 196)">' + C(0, -26, 8, "#d8a050") + PA("M-6 -20 L-24 -14 L-22 -8 L-8 -12 L-10 6 L-14 22 L-6 24 L0 8 L6 24 L14 22 L10 6 L8 -12 L22 -8 L24 -14 L6 -20Z", "#d8a050") + C(-3, -27, 1.4, "#4a2418") + C(3, -27, 1.4, "#4a2418") + '</g>';
  return s + tree + star + heart + moon + men;
};
K.stollen = function(){
  var s = SH(200, 196, 150, 14, .45) + EF(200, 190, 160, 20, lg("#f0e4cc", "#a89270"));
  s += PA("M62 160 Q58 108 110 100 Q200 84 290 100 Q342 108 338 160 Q330 188 290 188 L110 188 Q70 188 62 160Z", "#d9a55a");
  s += PL("M62 160 Q58 108 110 100 Q200 84 290 100 Q342 108 338 160 Q330 188 290 188 L110 188 Q70 188 62 160Z", "#fff", 'opacity=".85"');
  s += PL("M110 100 Q200 84 290 100 Q300 108 290 118 Q200 104 110 118 Q100 108 110 100Z", "#fff", 'opacity=".9"');
  s += dots(46, 200, 130, 130, 28, 1.2, 3.2, ["#fff", "#fffaf0", "#f4e8d0"], 3);
  // Anschnitt
  s += PA("M246 100 L286 104 Q292 150 282 190 L240 190 Q250 150 246 100Z", "#f2d8a0");
  s += dots(22, 266, 146, 16, 38, 2.2, 4.2, ["#6a2a3a", "#8a4a2a", "#f0c050", "#4a2a1a"], 5);
  s += PL("M262 124 q8 6 16 0 M258 160 q10 8 20 0", "none", 'stroke="#e8c070" stroke-width="3" stroke-linecap="round"') + sprig(130, 104, 1);
  return s;
};

/* ---------- Braten & Fleisch ---------- */
function drum(x, y, a, c, sc){ return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ') scale(' + (sc || 1) + ')">' + PA("M0 0 Q26 -22 46 -14 Q58 -4 44 10 Q22 20 0 8Z", c) + '<rect x="-14" y="-3" width="20" height="7" rx="3.5" fill="#f4eee0"/><circle cx="-15" cy="0" r="4.4" fill="#f8f4ea"/><circle cx="-15" cy="4" r="4" fill="#f8f4ea"/>' + HI(24, -10, 16, 3.5, .35, -12) + '</g>'; }
function sk(n, x, y, rx, ry, cols, seed){ return dots(n, x, y, rx, ry, 1, 2.6, cols, seed); }
K.gans = function(){
  var s = plate(200, 170, 158, 48, "#f4f5f7") + SH(200, 188, 110, 16, .45);
  s += E(104, 176, 28, 18, "#a32a8a") + dots(10, 104, 172, 20, 10, 3, 5, ["#8a1c70", "#c04aa8"], 3);          // Rotkohl
  s += E(300, 178, 22, 18, "#f4e6b8") + E(330, 168, 18, 15, "#f0dca4") + HI(292, 170, 8, 4, .4);              // Klöße
  s += drum(112, 150, -150, "#c47430", 1.15) + drum(290, 150, -30, "#c47430", 1.15);
  s += PA("M96 138 Q88 90 150 76 Q200 66 252 78 Q316 92 306 140 Q304 182 200 186 Q100 184 96 138Z", "#c9772e");
  s += PA("M140 110 Q150 82 200 80 Q252 82 262 110 Q250 150 200 154 Q150 150 140 110Z", "#e0983e") + HI(190, 96, 44, 9, .38, -6);
  s += sk(46, 200, 120, 100, 44, ["#8a4a14", "#f0b868", "#b8681e"], 5);
  s += PA("M96 130 Q64 124 66 106 Q72 96 100 112Z", "#b86a26") + PA("M306 130 Q338 124 336 106 Q330 96 302 112Z", "#b86a26");
  s += PA("M196 82 Q184 54 168 52 Q158 56 166 66 Q180 70 196 82Z", "#b8721e") + C(160, 56, 7, "#d08a3a") + PL("M154 56 L146 60 L155 61Z", "#e8a020");
  s += E(246, 178, 14, 12, "#d6402a") + E(138, 184, 12, 11, "#d6402a") + leaf(250, 168, -40, "#2f8a3a", 1.1) + sprig(206, 70, .9) + steam(180, 52, 2);
  return s;
};
K.ente = function(){
  var s = plate(200, 168, 158, 48, "#f4f5f7") + SH(200, 186, 110, 16, .45);
  s += PA("M94 160 Q130 176 200 178 Q272 176 306 160 Q300 190 200 196 Q100 190 94 160Z", "#8a2418", 'opacity=".55"');
  // Orangensoße
  s += E(200, 172, 108, 22, "#e08a1c", 'opacity=".9"');
  // Brustscheiben
  for (var i = 0; i < 6; i++){ var x = 120 + i * 28; s += '<g transform="translate(' + x + ' ' + (140 - i % 2 * 4) + ') rotate(' + (-8 + i * 3) + ')">' + PA("M-16 -10 Q0 -22 18 -10 Q22 18 -4 28 Q-22 24 -16 -10Z", "#b0502a") + PA("M-12 -4 Q0 -14 14 -4 Q16 14 -2 22 Q-14 18 -12 -4Z", "#d8805a") + '<path d="M-16 -10 Q0 -22 18 -10" stroke="#5a2410" stroke-width="3" fill="none"/>' + HI(-2, -4, 6, 2, .4) + '</g>'; }
  s += slice(112, 108, 17, "#f08a1c", "#ffbc50") + slice(142, 100, 15, "#f08a1c", "#ffbc50") + slice(290, 112, 17, "#f2a020", "#ffd070");
  s += sk(10, 200, 110, 90, 20, ["#e8c040"], 4) + sprig(300, 142, 1) + leaf(176, 98, -10, "#2f8a3a", 1.2) + leaf(222, 100, -170, "#2f8a3a", 1.2);
  return s;
};
K.entegz = function(){
  var s = plate(200, 172, 158, 48, "#f4f5f7") + SH(200, 190, 110, 16, .45);
  s += E(300, 180, 28, 16, "#a32a8a") + E(100, 182, 24, 16, "#f4e6b8") + E(126, 176, 20, 14, "#f0dca4");
  s += drum(150, 132, -160, "#a8481e", 1.2) + drum(256, 132, -20, "#a8481e", 1.2);
  s += PA("M118 142 Q112 100 168 90 Q200 84 232 90 Q290 100 286 142 Q280 180 200 184 Q124 180 118 142Z", "#b6521c");
  s += PA("M140 118 Q150 98 200 96 Q250 98 260 118 Q250 150 200 154 Q150 150 140 118Z", "#d4743a") + HI(192, 108, 40, 7, .4, -6);
  s += sk(54, 200, 130, 80, 42, ["#5a2410", "#e8a050", "#8a3a14"], 8);
  s += PA("M118 138 Q96 132 98 118 Q104 110 122 122Z", "#9a4018") + PA("M286 138 Q308 132 306 118 Q300 110 282 122Z", "#9a4018");
  s += PA("M200 92 Q196 62 178 56 Q162 56 168 68 Q184 72 200 92Z", "#8a3a18") + C(166, 60, 8, "#a8481e") + PL("M158 62 L146 68 L158 70Z", "#f0b020") + C(167, 58, 1.6, "#1a0a00");
  s += slice(110, 160, 16, "#f2a020", "#ffd070") + sprig(300, 150, 1) + steam(186, 48, 2);
  return s;
};
K.haehnchen = function(){
  var s = plate(200, 170, 160, 48, "#f4f5f7") + SH(200, 188, 110, 16, .45);
  // Rosmarinkartoffeln
  [[96, 178], [124, 190], [290, 186], [316, 174], [268, 196]].forEach(function(p, i){ s += '<g transform="rotate(' + (i * 30) + ' ' + p[0] + ' ' + p[1] + ')">' + E(p[0], p[1], 20, 13, "#e8c070") + dots(5, p[0], p[1], 12, 6, 1.4, 2, ["#b8801c", "#8a5a14"], i + 2) + '</g>'; });
  s += leaf(100, 168, -30, "#3a8a3a", 1) + leaf(300, 182, -150, "#3a8a3a", 1) + leaf(130, 180, 20, "#3a8a3a", .9);
  s += drum(130, 148, -160, "#d28a30", 1) + drum(270, 148, -20, "#d28a30", 1);
  s += PA("M118 140 Q112 98 164 88 Q200 82 236 88 Q288 98 282 140 Q276 178 200 182 Q124 178 118 140Z", "#d88c34");
  s += PA("M140 118 Q150 96 200 94 Q250 96 260 118 Q250 150 200 154 Q150 150 140 118Z", "#eaa646") + HI(190, 106, 40, 8, .45, -6);
  s += sk(40, 200, 124, 82, 40, ["#9a5a14", "#f4c870", "#b87420"], 9);
  s += PA("M118 138 Q94 136 96 122 Q104 112 122 124Z", "#c47c28") + PA("M282 138 Q306 136 304 122 Q296 112 278 124Z", "#c47c28");
  s += '<g transform="translate(200 76)">' + PA("M-12 4 Q0 -10 12 4 Q0 12 -12 4Z", "#e8b040") + '</g>' + C(236, 100, 14, "#f4d22c") + '<circle cx="236" cy="100" r="9" fill="#fff6a8"/>' + sprig(160, 100, 1);
  return s + steam(190, 60, 2);
};
K.pute = function(){
  var s = plate(200, 172, 162, 50, "#f4f5f7") + SH(200, 192, 118, 16, .45);
  s += E(78, 178, 24, 18, "#d6202e") + dots(8, 78, 174, 16, 8, 3, 4.5, ["#a8101e", "#e83a48"], 2);
  s += E(326, 178, 24, 17, "#4a9a4a") + E(310, 190, 18, 12, "#5aaa4a");
  s += drum(118, 156, -155, "#c8862c", 1.3) + drum(284, 156, -25, "#c8862c", 1.3);
  s += PA("M100 146 Q92 94 150 78 Q200 66 250 78 Q312 94 304 146 Q300 186 200 190 Q104 186 100 146Z", "#d89038");
  s += PA("M136 120 Q148 90 200 86 Q252 90 264 120 Q250 158 200 162 Q150 158 136 120Z", "#eeaa48") + HI(190, 100, 50, 9, .42, -6);
  s += sk(60, 200, 124, 100, 46, ["#9a5a14", "#f6cc78", "#b87420"], 6);
  s += PA("M100 136 Q70 132 72 116 Q80 106 104 120Z", "#c47c28") + PA("M304 136 Q334 132 332 116 Q324 106 300 120Z", "#c47c28");
  s += ST("M150 150 Q200 164 250 150", "#e8d8a0", 4) + ST("M156 128 Q200 140 244 128", "#e8d8a0", 3, 'opacity=".8"');
  s += sprig(200, 82, 1.1) + slice(120, 104, 13, "#f08a1c", "#ffbc50") + steam(186, 54, 2);
  return s;
};
K.schweinebraten = function(){
  var s = plate(200, 172, 162, 48, "#f4f5f7") + SH(200, 190, 112, 16, .45);
  s += E(78, 178, 22, 17, "#a32a8a") + dots(6, 78, 174, 14, 8, 3, 4.5, ["#8a1c70"], 3);
  s += E(326, 176, 22, 17, "#f4e6b8") + E(312, 186, 16, 11, "#f0dca4");
  // Soße
  s += EF(200, 176, 104, 22, lg("#7a3a14", "#4a2008"), 'opacity=".9"');
  // Braten mit Kruste
  s += PA("M108 140 Q104 96 156 86 Q200 78 246 86 Q298 96 292 140 Q286 176 200 180 Q114 176 108 140Z", "#b8661e");
  s += PA("M124 104 Q150 84 200 82 Q250 84 276 104 Q262 120 200 122 Q138 120 124 104Z", "#d4903a");
  for (var i = 0; i < 9; i++) s += '<path d="M' + (140 + i * 14) + ' 88 L' + (126 + i * 14) + ' 118" stroke="#6a3410" stroke-width="2.4" opacity=".7"/><path d="M' + (126 + i * 14) + ' 88 L' + (140 + i * 14) + ' 118" stroke="#6a3410" stroke-width="2.4" opacity=".7"/>';
  s += sk(40, 200, 106, 70, 12, ["#f6cc78", "#8a4a14"], 4) + HI(180, 92, 44, 5, .4, -4);
  // Scheiben
  s += '<g transform="translate(204 152) rotate(-4)">' + PA("M-50 -16 Q-30 -26 -4 -22 Q-18 6 -42 14 Q-58 8 -50 -16Z", "#f0cfa8") + PA("M-6 -22 Q20 -26 44 -18 Q52 4 28 16 Q4 12 -6 -22Z", "#eec6a0") + '<path d="M-50 -16 Q-30 -26 -4 -22" stroke="#c88a50" stroke-width="3" fill="none"/><path d="M-6 -22 Q20 -26 44 -18" stroke="#c88a50" stroke-width="3" fill="none"/>' + '</g>';
  s += sprig(290, 120, 1) + steam(190, 62, 2);
  return s;
};
K.rouladen = function(){
  var s = plate(200, 172, 162, 48, "#f4f5f7") + SH(200, 190, 112, 16, .45);
  s += EF(200, 168, 118, 28, lg("#6a3216", "#3a1a08"), 'opacity=".95"');
  s += E(76, 180, 22, 17, "#a32a8a") + E(328, 178, 22, 16, "#f4e6b8");
  function rou(x, y, a, cut){ return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ')">' + PA("M-66 -2 Q-66 -26 -40 -26 L40 -26 Q66 -26 66 -2 Q66 22 40 22 L-40 22 Q-66 22 -66 -2Z", "#8a4a2a") + PL("M-60 -14 Q0 -22 60 -14", 'none', 'stroke="#c88a60" stroke-width="5" opacity=".5" stroke-linecap="round"') + '<rect x="-30" y="-27" width="5" height="50" fill="#e8d8b0"/><rect x="26" y="-27" width="5" height="50" fill="#e8d8b0"/>' + (cut ? '<ellipse cx="66" cy="-2" rx="13" ry="24" fill="' + rg("#6a3216") + '"/><ellipse cx="66" cy="-2" rx="9" ry="19" fill="#d68a64"/><path d="M66 -18 Q58 -2 66 14 M66 -8 Q72 -2 66 8" stroke="#f0dcc0" stroke-width="3" fill="none"/><circle cx="66" cy="0" r="3.4" fill="#8a9a3a"/><rect x="62" y="-14" width="8" height="3" rx="1.5" fill="#d86a5a"/>' : '') + HI(-10, -14, 34, 4, .35, 0) + '</g>'; }
  s += rou(168, 152, -3, false) + rou(220, 128, 4, true);
  s += dots(14, 200, 150, 100, 30, 1.4, 2.6, ["#6a3216", "#c8a060"], 5) + sprig(300, 116, 1) + steam(190, 62, 2);
  return s;
};
K.kassler = function(){
  var s = plate(200, 172, 162, 48, "#f4f5f7") + SH(200, 190, 112, 16, .45);
  s += E(112, 160, 56, 28, "#ecdc9a") + dots(30, 112, 158, 50, 20, 3, 5, ["#e0d088", "#f4eab8", "#d6c478"], 3);
  [[266, 150, -6], [248, 188, 8]].forEach(function(p){ s += '<g transform="translate(' + p[0] + ' ' + p[1] + ') rotate(' + p[2] + ')">' + PA("M-64 -4 Q-64 -26 -34 -28 L34 -28 Q64 -26 64 -4 Q64 20 34 24 L-34 24 Q-64 20 -64 -4Z", "#d27e5a") + PA("M-54 -4 Q-54 -18 -30 -20 L30 -20 Q54 -18 54 -4 Q54 12 30 16 L-30 16 Q-54 12 -54 -4Z", "#e8a07e") + '<path d="M-40 -12 L20 12 M-20 -16 L40 8 M0 -18 L50 0" stroke="#7a3418" stroke-width="3.4" opacity=".7"/>' + '<path d="M-60 -14 Q0 -30 60 -14" stroke="#f4dcc8" stroke-width="5" fill="none" opacity=".7"/>' + HI(-20, -16, 30, 4, .4) + '</g>'; });
  s += E(310, 192, 24, 14, "#f6e8b0") + E(150, 196, 18, 12, "#f4e6b8") + E(176, 198, 16, 11, "#f0dca4");
  s += EF(214, 202, 14, 4, "#d8a020") + sprig(100, 130, 1) + leaf(300, 168, -160, "#3a8a3a", 1);
  return s + steam(200, 72, 2);
};
K.lachs = function(){
  var s = plate(200, 168, 160, 48, "#f4f5f7") + SH(200, 186, 110, 16, .4);
  s += PA("M92 160 Q80 118 140 106 Q200 94 262 106 Q322 118 308 160 Q300 186 200 190 Q100 186 92 160Z", "#f0a07a");
  for (var i = 0; i < 6; i++) s += ST("M" + (116 + i * 30) + " 108 q-8 30 4 70", "#fff0e0", 4, 'opacity=".45"');
  s += PA("M96 150 Q90 124 142 112 Q200 102 258 112 Q308 124 304 150 Q290 138 200 136 Q110 138 96 150Z", "#d8a040", 'opacity=".9"');
  s += dots(40, 200, 124, 90, 12, 1.4, 2.8, ["#8a5a14", "#f0cc60", "#b88a24"], 4) + HI(180, 114, 60, 6, .4, -4);
  s += '<g transform="translate(300 176)">' + PA("M-26 0 Q-18 -24 0 -22 Q22 -20 26 0 Q10 10 -26 0Z", "#f4d22c") + PL("M-18 0 Q-10 -16 0 -15 Q16 -14 18 0 Q6 6 -18 0Z", "#fff0a0") + '</g>';
  for (var j = 0; j < 4; j++) s += ST("M" + (126 + j * 18) + " 170 q8 -14 16 -2 q4 -12 -2 -18", "#2f8a3a", 2.4);
  s += E(112, 176, 10, 8, "#7aa83a") + E(128, 184, 9, 8, "#7aa83a");
  return s + steam(190, 82, 2);
};
K.knoedel = function(){
  var s = plate(200, 166, 160, 48, "#f4f5f7") + SH(200, 184, 110, 16, .4);
  s += EF(200, 170, 112, 26, lg("#7a3a14", "#4a2008"), 'opacity=".95"');
  function kn(x, y, r){ return E(x, y, r, r * .92, "#f2e4b4") + dots(18, x, y, r * .8, r * .7, 1.2, 2.6, ["#d6bb78", "#f8eecc", "#c8a860"], x) + HI(x - r * .3, y - r * .4, r * .36, r * .16, .45, -25); }
  s += kn(150, 150, 38) + kn(244, 152, 36) + kn(198, 122, 36);
  s += '<g>' + E(318, 168, 26, 20, "#f4e8b8") + '<ellipse cx="318" cy="168" rx="18" ry="12" fill="#f0d890"/>' + dots(10, 318, 168, 14, 8, 1.4, 2.4, ["#c8a050", "#f8eed0", "#8a5a2a"], 5) + '</g>';
  s += sprig(100, 132, 1) + dots(14, 200, 138, 90, 24, 1.4, 2.4, ["#3a8a3a"], 6);
  return s + steam(186, 70, 2);
};
K.rosenkohl = function(){
  var s = plate(200, 164, 154, 46, "#f4f5f7") + SH(200, 182, 104, 14, .4);
  for (var i = 0; i < 12; i++){ var a = i * 2.1, d = 20 + (i * 23) % 70, x = 200 + Math.cos(a) * d * 1.3, y = 148 + Math.sin(a) * d * .42; s += C(x.toFixed(1), y.toFixed(1), 17, i % 3 ? "#5aa23a" : "#7ab84a") + '<path d="M' + (x - 8).toFixed(1) + ' ' + y.toFixed(1) + ' q8 -9 16 0 M' + (x - 5).toFixed(1) + ' ' + (y + 6).toFixed(1) + ' q5 -6 10 0" stroke="#2f6a2a" stroke-width="1.6" fill="none" opacity=".7"/>'; }
  for (var j = 0; j < 6; j++){ var xx = 130 + j * 28; s += '<g transform="translate(' + xx + ' ' + (166 - (j % 2) * 40) + ') rotate(' + (j * 40) + ')">' + E(0, 0, 11, 8, "#b8803c") + '<path d="M-8 0 q8 -6 16 0" stroke="#6a4018" stroke-width="1.6" fill="none"/></g>'; }
  for (var k = 0; k < 5; k++) s += '<rect x="' + (140 + k * 24) + '" y="' + (128 + (k % 2) * 36) + '" width="20" height="5" rx="2.4" fill="' + lg("#d86a5a", "#8a2a1a") + '" transform="rotate(' + (k * 25) + ' ' + (150 + k * 24) + ' 140)"/>';
  return s + steam(190, 84, 2);
};
K.gratin = function(){
  var s = SH(200, 198, 150, 14, .45) + PA("M64 130 L336 130 L326 188 Q324 196 312 196 L88 196 Q76 196 74 188Z", lg("#f4f1ea", "#b8b2a4", true));
  s += PA("M64 130 Q200 118 336 130 L336 140 Q200 130 64 140Z", "#fff");
  s += EF(200, 134, 136, 14, lg("#e8b04a", "#a8701c"));
  s += dots(46, 200, 134, 124, 8, 4, 9, ["#f4d070", "#d8982c", "#b87820", "#f8e098"], 7) + dots(18, 200, 134, 116, 7, 2, 3, ["#7a4a14", "#3a8a3a"], 3);
  s += PA("M246 124 Q262 118 292 124 L296 158 Q270 168 246 156Z", "#f4d070") + PL("M252 130 L290 130 M250 142 L292 142", "none", 'stroke="#e8c060" stroke-width="3"');
  s += E(150, 112, 18, 6, "#f8e098") + sprig(112, 128, 1) + steam(176, 106, 3);
  return s;
};
K.raclette = function(){
  var s = SH(200, 200, 170, 16, .45) + PA("M40 170 L360 170 L350 206 L50 206Z", lg("#454a54", "#1e2127", true)) + PA("M40 170 Q200 150 360 170 L360 176 Q200 158 40 176Z", "#7a808c");
  s += '<g>' + C(80, 184, 7, "#d02a38") + C(100, 190, 5, "#2f8a3a") + '</g>';
  function pan(x, y, ch){ return '<g transform="translate(' + x + ' ' + y + ')">' + PA("M-30 0 L30 0 L24 12 L-24 12Z", "#2a2d34") + ST("M30 4 L52 0", "#2a2d34", 5) + EF(0, 0, 30, 6, "#4a4f5a") + EF(0, 0, 25, 4, lg("#f6d062", "#e0a420")) + (ch ? '' : '') + '</g>'; }
  s += pan(100, 150) + pan(200, 148) + pan(300, 150);
  // Kartoffeln & Käse
  s += plate(200, 112, 170, 34, "#f4f5f7").replace(/<\/g>$/, "");
  [[112, 108], [150, 100], [190, 108], [236, 100], [276, 108], [306, 100]].forEach(function(p, i){ s += E(p[0], p[1], 20, 13, "#e8c880") + dots(4, p[0], p[1], 10, 5, 1.2, 2, ["#b8902c"], i + 1); });
  s += PA("M130 118 Q160 112 176 124 Q168 138 146 134Z", "#f6d062") + PA("M222 120 Q252 112 270 124 Q260 140 238 134Z", "#f6d062") + HI(150, 120, 12, 3, .5);
  s += E(100, 120, 12, 7, "#c43a3a") + E(332, 120, 12, 7, "#d65a56") + C(350, 106, 5, "#6a9a2a") + C(60, 108, 5, "#6a9a2a");
  return s + steam(98, 120, 2);
};
K.kuerbissuppe = function(){
  var s = bowl(200, 118, 118, 66, "#f4f5f7", "#f08a1c") + HI(150, 120, 40, 5, .35, -6);
  s += ST("M150 124 Q170 108 200 124 Q230 140 250 122", "#fff", 7, 'opacity=".95"') + ST("M160 126 Q176 116 196 126", "#fff", 3, 'opacity=".9"');
  s += dots(14, 200, 124, 70, 8, 2, 3.2, ["#7aa83a", "#f4eed0"], 5) + sprig(264, 120, .9);
  s += '<g transform="translate(330 176)">' + E(0, 0, 26, 21, "#f08a1c") + '<path d="M-10 -18 Q-14 0 -8 18 M0 -20 Q-2 0 0 20 M10 -18 Q14 0 8 18" stroke="#c0600c" stroke-width="2" fill="none"/>' + PA("M-4 -20 Q0 -32 8 -30 Q6 -22 4 -20Z", "#5a7a2a") + '</g>';
  s += E(80, 184, 22, 5, "#f4e6c0") + '<g transform="translate(70 178) rotate(-30)"><rect width="46" height="9" rx="4" fill="#d6b070"/></g>';
  return s + steam(170, 76, 3);
};
K.maronensuppe = function(){
  var s = bowl(200, 118, 118, 66, "#2a4a6a", "#c8a070") + HI(150, 120, 40, 5, .3, -6);
  s += ST("M146 124 Q170 108 200 126 Q230 142 254 122", "#fff6e8", 6, 'opacity=".95"');
  s += dots(10, 200, 124, 60, 7, 2, 3, ["#a87c44", "#e0c490"], 3);
  [[174, 122], [226, 128], [200, 112]].forEach(function(p){ s += '<g transform="translate(' + p[0] + ' ' + p[1] + ')">' + E(0, 0, 10, 7, "#9a6232") + '<path d="M-6 -1 q6 -4 12 0" stroke="#5a3418" stroke-width="1.4" fill="none"/></g>'; });
  s += sprig(266, 122, .9) + leaf(150, 120, 20, "#3a8a3a", 1);
  [[320, 176], [346, 186], [306, 190]].forEach(function(p){ s += '<g transform="translate(' + p[0] + ' ' + p[1] + ')">' + E(0, 0, 15, 12, "#8a4a22") + PL("M-6 -8 Q0 -14 6 -8 Q0 -3 -6 -8Z", "#d8b070") + '</g>'; });
  return s + steam(170, 76, 3);
};
K.feldsalat = function(){
  var s = plate(200, 166, 160, 48, "#f4f5f7") + SH(200, 184, 112, 14, .35);
  for (var i = 0; i < 22; i++){ var a = i * 0.9, d = 12 + (i * 11) % 70, x = 200 + Math.cos(a) * d * 1.45, y = 148 + Math.sin(a) * d * .46; s += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + ((i * 47) % 360) + ')">' + PA("M0 0 Q10 -14 24 -2 Q12 8 0 0Z", i % 2 ? "#3f8a3a" : "#5aa04a") + '<path d="M2 -1 L20 -3" stroke="#2a6a2a" stroke-width="1.2"/></g>'; }
  s += dots(20, 200, 142, 90, 28, 3.4, 5.2, ["#d6304a", "#a81c34", "#e84a62"], 5);
  [[150, 154], [218, 130], [260, 160], [180, 170]].forEach(function(p){ s += '<g transform="translate(' + p[0] + ' ' + p[1] + ')">' + E(0, 0, 11, 9, "#c8985a") + '<path d="M-6 -2 q6 -4 12 0 M-5 3 q6 -3 11 0" stroke="#7a5018" stroke-width="1.4" fill="none"/></g>'; });
  s += dots(6, 200, 150, 80, 24, 3, 4, ["#f4eed8"], 3) + ST("M120 176 q40 8 80 4", "#e8c040", 3, 'opacity=".6"');
  return s;
};
K.brulee = function(){
  var s = SH(200, 198, 130, 14, .45) + EF(200, 190, 140, 22, lg("#fff", "#cfd5dc"));
  s += PA("M104 138 L296 138 L282 186 Q280 194 266 194 L134 194 Q120 194 118 186Z", lg("#f6f6f4", "#b8bcc4", true));
  s += EF(200, 138, 96, 20, lg("#fff", "#dfe3e8")) + EF(200, 138, 86, 16, lg("#f0b44a", "#a8661c"));
  s += dots(40, 200, 138, 78, 11, 1.4, 3.2, ["#7a3e10", "#e0983a", "#4a2208", "#f4cc70"], 8) + HI(166, 132, 36, 4, .5, -5);
  s += PA("M222 124 Q246 118 268 128 L262 140 Q240 130 222 134Z", "#f4cc70", 'opacity=".95"');
  s += '<g transform="translate(300 160) rotate(-30)"><rect x="-4" y="-3" width="62" height="6" rx="3" fill="' + lg("#f2f2f2", "#a8aeb6") + '"/><ellipse cx="-8" cy="0" rx="12" ry="8" fill="' + lg("#f2f2f2", "#a8aeb6") + '"/></g>';
  s += C(150, 128, 8, "#c01a3a") + C(164, 124, 8, "#d02a4a") + C(236, 126, 8, "#c01a3a") + leaf(194, 124, -30, "#2f8a3a", 1) + leaf(206, 124, -150, "#3a9a4a", 1);
  return s + dots(14, 200, 132, 88, 10, .8, 1.4, ["#fff"], 2);
};
K.strudel = function(){
  var s = plate(200, 164, 164, 50, "#f4f5f7") + SH(200, 184, 112, 14, .4);
  s += EF(200, 180, 108, 18, lg("#f6e4a8", "#e0b860"), 'opacity=".95"');
  s += PA("M70 150 Q70 112 120 108 L290 106 Q338 112 336 150 Q330 176 290 178 L120 180 Q76 178 70 150Z", "#c88a38");
  for (var i = 0; i < 9; i++) s += ST("M" + (96 + i * 26) + " 112 q8 18 -2 36 q-6 14 4 28", "#8a5214", 3, 'opacity=".55"');
  s += PL("M70 150 Q70 112 120 108 L290 106 Q338 112 336 150 Q330 176 290 178 L120 180 Q76 178 70 150Z", "#fff", 'opacity=".3"') + dots(60, 200, 130, 128, 18, .8, 1.8, ["#fff"], 4);
  s += '<g transform="translate(150 190)">' + PA("M-34 0 L34 0 L28 -30 Q0 -40 -28 -30Z", "#d8a050") + PA("M-26 -4 L26 -4 L22 -26 Q0 -32 -22 -26Z", "#c4783a") + dots(16, 0, -16, 18, 8, 2.4, 4, ["#f0e0a0", "#8a4a1a", "#6a2a1a"], 3) + '</g>';
  s += cinn(262, 180, -10, 40) + leaf(300, 112, -40, "#2f8a3a", 1.1) + dots(4, 296, 118, 6, 3, 2.4, 3.4, ["#d02a38"], 2);
  return s;
};
K.kuerbisgefuellt = function(){
  var s = plate(200, 168, 162, 50, "#f4f5f7") + SH(200, 186, 110, 14, .4);
  function half(x, y, rot){ return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">' + PA("M-62 -4 Q-62 -52 0 -52 Q62 -52 62 -4 Q60 34 0 38 Q-60 34 -62 -4Z", "#f08a1c") + '<path d="M-44 -10 Q-40 30 -22 36 M0 -50 Q-6 0 0 38 M44 -10 Q40 30 22 36" stroke="#c4600c" stroke-width="2.4" fill="none" opacity=".7"/>' + E(0, -22, 50, 14, "#f6a840") + E(0, -20, 44, 11, "#d8b050") + dots(40, 0, -20, 40, 8, 2, 3.8, ["#f0d078", "#e0b050", "#c8902c"], 4) + dots(8, 0, -20, 36, 6, 3, 5, ["#d6304a", "#2f8a3a"], 5) + '<g>' + E(-14, -26, 10, 5, "#fff") + E(14, -24, 10, 5, "#fff") + '</g>' + sprig(0, -28, .8) + '</g>'; }
  s += half(140, 138, -3) + half(262, 150, 3);
  return s + steam(150, 78, 2);
};
K.cranberry = function(){
  var s = SH(200, 198, 130, 12, .4) + plate(200, 184, 170, 38, "#f4f5f7");
  s += bowl(190, 132, 84, 56, "#f4f5f7", "#9a0e24");
  for (var i = 0; i < 22; i++){ var a = i * 2.4, d = (i * 13) % 70; s += C((190 + Math.cos(a) * d).toFixed(1), (136 + Math.sin(a) * d * .22).toFixed(1), 6.4, i % 2 ? "#d4203a" : "#b01028"); }
  s += HI(160, 128, 30, 4, .45, -6) + dots(12, 190, 132, 60, 8, 1.2, 2, ["#f0a020"], 4);
  s += '<g transform="translate(180 108)">' + PA("M0 0 Q4 -16 14 -22 Q10 -6 6 0Z", "#f08a1c") + '</g>';
  s += '<g transform="translate(296 176) rotate(-14)">' + E(0, 0, 32, 22, "#f08a1c") + '<ellipse cx="0" cy="-1" rx="26" ry="16" fill="' + rg("#ffbc50") + '"/>' + '<path d="M-20 0 L20 0 M0 -14 L0 14 M-14 -10 L14 10 M14 -10 L-14 10" stroke="#f08a1c" stroke-width="1.6"/></g>';
  s += sprig(110, 168, 1.1) + leaf(120, 176, -10, "#2f8a3a", 1.2) + cinn(260, 196, -16, 40);
  return s + steam(170, 84, 2);
};
K.jakobs = function(){
  var s = plate(200, 164, 166, 50, "#f4f5f7") + SH(200, 184, 112, 14, .4);
  function jak(x, y, rot){ return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">' + PA("M-44 14 Q-48 -34 0 -38 Q48 -34 44 14 Q36 26 0 28 Q-36 26 -44 14Z", "#ead8c0") + '<g stroke="#c8a888" stroke-width="2" opacity=".8">' + [-30, -16, 0, 16, 30].map(function(v){ return '<path d="M' + v * .5 + ' 24 L' + v + ' -30"/>'; }).join("") + '</g>' + E(0, -2, 30, 17, "#f6e8c8") + E(0, -6, 26, 12, "#f9efd8") + PL("M-16 -8 Q0 -16 16 -8", 'none', 'stroke="#d8942a" stroke-width="5" stroke-linecap="round"') + sprig(0, -10, .6) + dots(8, 0, -6, 20, 8, 1.4, 2.4, ["#d8942a", "#3a8a3a", "#f4eed0"], 3) + '</g>'; }
  s += jak(138, 158, -6) + jak(262, 162, 5) + jak(200, 130, 0);
  s += dots(12, 200, 168, 80, 14, 2, 3, ["#e8c040", "#4a8a3a"], 3) + '<g transform="translate(200 188)">' + PA("M-18 0 Q-12 -14 0 -12 Q14 -12 18 0 Q8 6 -18 0Z", "#f4d22c") + '</g>';
  return s;
};

/* ---------- Umgebung (Holztisch, Licht) ---------- */
XM.dish = function(r, uid){
  UID = String(uid).replace(/[^a-zA-Z0-9]/g, ""); gi = 0; DF = [];
  var g = r.bg || ["#2a5a3a", "#8ad08a"], fn = K[r.id] || null;
  var food = fn ? fn(r) : "";
  if (!fn && OLD) return OLD(r, uid);
  var seed = 7; function rnd(){ seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  var cols = ["#ffcf6a", "#ff8a5a", "#ffe9a8", "#ff6a6a", "#9ad8ff", "#ffd98a"], bok = "";
  for (var k = 0; k < 24; k++) bok += '<circle cx="' + (rnd() * 400).toFixed(0) + '" cy="' + (rnd() * 90).toFixed(0) + '" r="' + (5 + rnd() * 12).toFixed(0) + '" fill="' + cols[k % 6] + '" opacity="' + (.18 + rnd() * .32).toFixed(2) + '"/>';
  var o = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (r.name ? r.name[XM.I] : "") + '" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:100%">';
  o += '<defs>' + DF.join("") + '<linearGradient id="tb' + UID + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2c18"/><stop offset=".45" stop-color="#8a5a34"/><stop offset="1" stop-color="#6a4224"/></linearGradient>'
    + '<filter id="wd' + UID + '" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.42" numOctaves="4" seed="11" result="w"/><feColorMatrix in="w" type="matrix" values="0 0 0 0 .18  0 0 0 0 .1  0 0 0 0 .04  0 0 0 1.1 -.3" result="gg"/><feComposite in="gg" in2="SourceGraphic" operator="over"/></filter>'
    + '<filter id="bk' + UID + '"><feGaussianBlur stdDeviation="4.5"/></filter><filter id="bl' + UID + '"><feGaussianBlur stdDeviation="3.2"/></filter>'
    + '<filter id="gr' + UID + '" x="-5%" y="-5%" width="110%" height="115%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .3 0" result="g1"/><feComposite in="g1" in2="SourceAlpha" operator="in" result="g2"/><feBlend in="SourceGraphic" in2="g2" mode="soft-light"/></filter>'
    + '<radialGradient id="lt' + UID + '" cx=".3" cy=".18" r=".9"><stop offset="0" stop-color="#fff3d0" stop-opacity=".4"/><stop offset=".55" stop-color="#fff3d0" stop-opacity="0"/></radialGradient>'
    + '<radialGradient id="vg' + UID + '" cx=".5" cy=".55" r=".78"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1a0a00" stop-opacity=".55"/></radialGradient></defs>';
  o += '<rect width="400" height="240" fill="url(#tb' + UID + ')"/><rect width="400" height="240" fill="url(#tb' + UID + ')" filter="url(#wd' + UID + ')" opacity=".85"/>';
  o += '<rect width="400" height="92" fill="' + g[0] + '" opacity=".5"/><g filter="url(#bk' + UID + ')">' + bok + '</g><rect y="86" width="400" height="12" fill="#2a160a" opacity=".45" filter="url(#bl' + UID + ')"/>';
  o += '<g filter="url(#gr' + UID + ')">' + food + '</g>';
  o += '<rect width="400" height="240" fill="url(#lt' + UID + ')"/><rect width="400" height="240" fill="url(#vg' + UID + ')"/></svg>';
  return o;
};
})();
