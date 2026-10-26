// Eigener QR-Code-Encoder (Byte-Modus, UTF-8, Version 1-10, Fehlerkorrektur L/M/Q/H). Läuft komplett lokal.
(function(){
"use strict";
var EXP = new Array(512), LOG = new Array(256);
(function(){ var x = 1; for (var i = 0; i < 255; i++){ EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; } for (i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
function mul(a, b){ return a && b ? EXP[LOG[a] + LOG[b]] : 0; }
function gen(n){ var p = [1]; for (var i = 0; i < n; i++){ var q = new Array(p.length + 1).fill(0); for (var j = 0; j < p.length; j++){ q[j] ^= p[j]; q[j + 1] ^= mul(p[j], EXP[i]); } p = q; } return p; }
function rs(data, n){ var g = gen(n), r = new Array(n).fill(0); data.forEach(function(d){ var f = d ^ r[0]; r.shift(); r.push(0); for (var i = 0; i < n; i++) r[i] ^= mul(g[i + 1], f); }); return r; }
// [Anzahl, Gesamt, Daten, (Anzahl, Gesamt, Daten)]  je Version 1..10 für L, M, Q, H
var RB = {
 L:[[1,26,19],[1,44,34],[1,70,55],[1,100,80],[1,134,108],[2,86,68],[2,98,78],[2,121,97],[2,146,116],[2,86,68,2,87,69]],
 M:[[1,26,16],[1,44,28],[1,70,44],[2,50,32],[2,67,43],[4,43,27],[4,49,31],[2,60,38,2,61,39],[3,58,36,2,59,37],[4,69,43,1,70,44]],
 Q:[[1,26,13],[1,44,22],[2,35,17],[2,50,24],[2,33,15,2,34,16],[4,43,19],[2,32,14,4,33,15],[4,40,18,2,41,19],[4,36,16,4,37,17],[6,43,19,2,44,20]],
 H:[[1,26,9],[1,44,16],[2,35,13],[4,25,9],[2,33,11,2,34,12],[4,43,15],[4,39,13,1,40,14],[4,40,14,2,41,15],[4,36,12,4,37,13],[6,43,15,2,44,16]]
};
var ALIGN = [[], [6,18], [6,22], [6,26], [6,30], [6,34], [6,22,38], [6,24,42], [6,26,46], [6,28,50]];
var FMT = { L: 1, M: 0, Q: 3, H: 2 };
function utf8(s){ return Array.prototype.slice.call(new TextEncoder().encode(s)); }
function blocks(v, e){ var t = RB[e][v - 1], out = []; for (var i = 0; i < t.length; i += 3) for (var k = 0; k < t[i]; k++) out.push([t[i + 1], t[i + 2]]); return out; }
function make(text, ecl){
  ecl = RB[ecl] ? ecl : "M"; var bytes = utf8(text), v, bl, cap;
  for (v = 1; v <= 10; v++){ bl = blocks(v, ecl); cap = bl.reduce(function(a, b){ return a + b[1]; }, 0); if (4 + (v < 10 ? 8 : 16) + bytes.length * 8 <= cap * 8) break; }
  if (v > 10) throw new Error("toolong");
  var bits = []; function put(val, n){ for (var i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
  put(4, 4); put(bytes.length, v < 10 ? 8 : 16); bytes.forEach(function(b){ put(b, 8); });
  for (var t = 0; t < 4 && bits.length < cap * 8; t++) bits.push(0);
  while (bits.length % 8) bits.push(0);
  var cw = []; for (var i = 0; i < bits.length; i += 8) cw.push(parseInt(bits.slice(i, i + 8).join(""), 2));
  for (var pad = 0xEC; cw.length < cap; pad ^= 0xEC ^ 0x11) cw.push(pad);
  var dBlocks = [], eBlocks = [], pos = 0;
  bl.forEach(function(b){ var d = cw.slice(pos, pos + b[1]); pos += b[1]; dBlocks.push(d); eBlocks.push(rs(d, b[0] - b[1])); });
  var maxD = Math.max.apply(null, dBlocks.map(function(d){ return d.length; })), all = [];
  for (i = 0; i < maxD; i++) dBlocks.forEach(function(d){ if (i < d.length) all.push(d[i]); });
  for (i = 0; i < eBlocks[0].length; i++) eBlocks.forEach(function(d){ all.push(d[i]); });
  var n = 17 + 4 * v, M = [], F = [];
  for (i = 0; i < n; i++){ M.push(new Array(n).fill(false)); F.push(new Array(n).fill(false)); }
  function setF(x, y, d){ M[y][x] = d; F[y][x] = true; }
  function finder(cx, cy){ for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++){ var x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= n || y >= n) continue; var d = Math.max(Math.abs(dx), Math.abs(dy)); setF(x, y, d !== 2 && d !== 4); } }
  for (i = 0; i < n; i++){ setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
  finder(3, 3); finder(n - 4, 3); finder(3, n - 4);
  var ap = ALIGN[v - 1];
  ap.forEach(function(r){ ap.forEach(function(c){ if ((r === 6 && c === 6) || (r === 6 && c === ap[ap.length - 1]) || (c === 6 && r === ap[ap.length - 1])) return; for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) setF(c + dx, r + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); }); });
  function fmt(mask){ var d = (FMT[ecl] << 3) | mask, r = d; for (var k = 0; k < 10; k++) r = (r << 1) ^ ((r >>> 9) * 0x537); var b = ((d << 10) | r) ^ 0x5412; function bit(k){ return ((b >>> k) & 1) !== 0; }
    for (k = 0; k <= 5; k++) setF(8, k, bit(k)); setF(8, 7, bit(6)); setF(8, 8, bit(7)); setF(7, 8, bit(8)); for (k = 9; k < 15; k++) setF(14 - k, 8, bit(k));
    for (k = 0; k < 8; k++) setF(n - 1 - k, 8, bit(k)); for (k = 8; k < 15; k++) setF(8, n - 15 + k, bit(k)); setF(8, n - 8, true); }
  fmt(0);
  if (v >= 7){ var r2 = v; for (i = 0; i < 12; i++) r2 = (r2 << 1) ^ ((r2 >>> 11) * 0x1F25); var vb = (v << 12) | r2; for (i = 0; i < 18; i++){ var bt = ((vb >>> i) & 1) !== 0, a = n - 11 + i % 3, b2 = Math.floor(i / 3); setF(a, b2, bt); setF(b2, a, bt); } }
  var k2 = 0; for (var right = n - 1; right >= 1; right -= 2){ if (right === 6) right = 5; for (var vert = 0; vert < n; vert++) for (var j = 0; j < 2; j++){ var x = right - j, up = ((right + 1) & 2) === 0, y = up ? n - 1 - vert : vert; if (!F[y][x] && k2 < all.length * 8){ M[y][x] = ((all[k2 >>> 3] >>> (7 - (k2 & 7))) & 1) !== 0; k2++; } } }
  var MASK = [function(x, y){ return (x + y) % 2 === 0; }, function(x, y){ return y % 2 === 0; }, function(x, y){ return x % 3 === 0; }, function(x, y){ return (x + y) % 3 === 0; },
    function(x, y){ return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; }, function(x, y){ return x * y % 2 + x * y % 3 === 0; }, function(x, y){ return (x * y % 2 + x * y % 3) % 2 === 0; }, function(x, y){ return ((x + y) % 2 + x * y % 3) % 2 === 0; }];
  function penalty(G){ var p = 0, x, y, run, c;
    for (var pass = 0; pass < 2; pass++) for (y = 0; y < n; y++){ run = 1; for (x = 1; x < n; x++){ var a = pass ? G[x][y] : G[y][x], b = pass ? G[x - 1][y] : G[y][x - 1]; if (a === b){ run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
    for (y = 0; y < n - 1; y++) for (x = 0; x < n - 1; x++){ c = G[y][x]; if (c === G[y][x + 1] && c === G[y + 1][x] && c === G[y + 1][x + 1]) p += 3; }
    var pat = [1,0,1,1,1,0,1]; function chk(get){ for (var s = 0; s + 7 <= n; s++){ var ok = true; for (var q = 0; q < 7; q++) if ((get(s + q) ? 1 : 0) !== pat[q]){ ok = false; break; } if (ok){ var l = true, r = true; for (q = 1; q <= 4; q++){ if (s - q >= 0 && get(s - q)) l = false; if (s + 6 + q < n && get(s + 6 + q)) r = false; } if (l || r) p += 40; } } }
    for (y = 0; y < n; y++){ (function(yy){ chk(function(i){ return G[yy][i]; }); chk(function(i){ return G[i][yy]; }); })(y); }
    var dark = 0; for (y = 0; y < n; y++) for (x = 0; x < n; x++) if (G[y][x]) dark++; p += Math.floor(Math.abs(dark * 20 - n * n * 10) / (n * n)) * 10; return p; }
  var best = -1, bp = 1e9, bg = null;
  for (var m = 0; m < 8; m++){ var G = M.map(function(row){ return row.slice(); }); for (var yy = 0; yy < n; yy++) for (var xx = 0; xx < n; xx++) if (!F[yy][xx] && MASK[m](xx, yy)) G[yy][xx] = !G[yy][xx];
    var save = M; M = G; fmt(m); M = save; var pe = penalty(G); if (pe < bp){ bp = pe; best = m; bg = G; } }
  return { n: n, version: v, get: function(r, c){ return bg[r][c]; } };
}
window.QR = { make: make };
})();
