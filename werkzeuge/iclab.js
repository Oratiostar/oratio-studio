/* Oratio IC-Labor – ICs nachschlagen, Schaltungen ausprobieren, Oszilloskop lesen */
var ICLAB = (function(){
"use strict";
var fr = !!(window.WZ && WZ.lang === "fr");
function T(d, f){ return fr && f ? f : d; }
function $(s, r){ return (r || document).querySelector(s); }
function el(t, c, h){ var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
function esc(s){ return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function sv(k){ try { return JSON.parse(localStorage.getItem("iclab_" + k)); } catch(e){ return null; } }
function st(k, v){ try { localStorage.setItem("iclab_" + k, JSON.stringify(v)); } catch(e){} }
var E12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2, 10];
function e12(v){ if (!(v > 0)) return v; var d = Math.floor(Math.log10(v)), m = v / Math.pow(10, d), b = 10, bd = 1e9; E12.forEach(function(x){ var q = Math.abs(Math.log(m / x)); if (q < bd){ bd = q; b = x; } }); return b * Math.pow(10, d); }
function fmt(v, u, dig){
  if (!isFinite(v)) return "–"; if (v === 0) return "0 " + (u || "");
  var Ls = [[1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"]], a = Math.abs(v), s = Ls[Ls.length - 1];
  for (var i = 0; i < Ls.length; i++) if (a >= Ls[i][0] * 0.9995){ s = Ls[i]; break; }
  return String(parseFloat((v / s[0]).toPrecision(dig || 3))).replace(".", ",") + " " + s[1] + (u || "");
}
var C = { amber: "#ffb000", cyan: "#3de6ff", green: "#6dffb0", pink: "#ff3d9a", lime: "#b6ff3d", violet: "#b58cff", red: "#ff6b6b", white: "#e8fff3" };
var LINK = { ne5532: "bt_analog/analog_ne5532", mcp6002: "bt_analog/analog_mcp6002", lm741: "bt_analog/analog_lm741", tl071: "bt_analog/analog_tl071", tl074: "bt_analog/analog_tl074", ne555: "bt_analog/analog_ne555", hc14: "bt_ic/logik_74hc14", cd4060: "bt_ic/speicher_4060", hc00: "bt_ic/logik_7400", hc74: "bt_ic/speicher_7474", cd4017: "bt_ic/speicher_4017", hc160: "bt_ic/speicher_74160", hc595: "bt_ic/speicher_74595", hc138: "bt_ic/decoder_74138", cd4511: "bt_ic/decoder_4511", lm358: "bt_analog/analog_lm358", lm393: "bt_analog/analog_lm393", lm317: "halbleiter/bauteile_lm317", cd4093: "bt_ic/logik_4093", cd4040: "bt_ic/speicher_4040", hc165: "bt_ic/speicher_74165", lm7805: "halbleiter/bauteile_lm7805", lm386: "bt_analog/analog_lm386", bc337: "halbleiter/bauteile_bc337", uln2003: "halbleiter/bauteile_uln2003", l293d: "halbleiter/bauteile_l293d", pc817: "halbleiter/bauteile_pc817", lm324: "bt_analog/analog_lm324", cd4051: "bt_ic/decoder_4051", cd4066: "bt_ic/decoder_4066", hc193: "bt_ic/speicher_74193", cd4013: "bt_ic/speicher_4013", hc164: "bt_ic/speicher_74164", max232: "bt_ic/decoder_max232", mcp3008: "bt_ic/decoder_mcp3008", tl431: "halbleiter/bauteile_tl431", icl7660: "halbleiter/analog_icl7660", lm35: "bt_analog/analog_lm35", irlz44n: "halbleiter/bauteile_irlz44n", d1n4007: "halbleiter/bauteile_1n4007", zd: "halbleiter/bauteile_zener", hc245: "bt_ic/decoder_74245", hc573: "bt_ic/speicher_74573", cd4094: "bt_ic/speicher_4094", cd4020: "bt_ic/speicher_4020", cd4046: "bt_ic/decoder_4046", lm339: "bt_analog/analog_lm339", tl072: "bt_analog/analog_tl072", ne556: "bt_analog/analog_ne556", lm337: "halbleiter/bauteile_lm337", lm1117: "halbleiter/bauteile_lm1117", bc557: "halbleiter/bauteile_bc557", irf9540: "halbleiter/bauteile_irf9540", led5: "halbleiter/led", ad620: "bt_analog/analog_ad620", dac0808: "bt_ic/decoder_dac0808", hc283: "bt_ic/decoder_74283", ds1307: "bt_ic/module_ds1307", eeprom24: "bt_ic/module_24lc256", max485: "bt_ic/module_max485", moc3021: "halbleiter/bauteile_moc3021", tsop: "halbleiter/bauteile_tsop4838", a4988: "halbleiter/bauteile_a4988" };

/* ---------- Zeit-Helfer (alles geschlossen berechnet) ---------- */
function cnt(t, f, ph){ return t < ph ? 0 : Math.floor((t - ph) * f) + 1; }       // steigende Flanken bis t
function sq(t, f, ph, duty){ if (t < ph) return 0; var x = ((t - ph) * f) % 1; return x < (duty || .5) ? 1 : 0; }
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function sineAt(t, f, a){ return a * Math.sin(2 * Math.PI * f * t); }
function hash(n){ var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

/* ---------- Oszilloskop ---------- */
function scope(cv, chs, span, cur, tl){
  var dpr = Math.min(2, window.devicePixelRatio || 1), W = cv.parentNode.clientWidth || 600, LH = 70, H = chs.length * LH + 26;
  cv.style.width = W + "px"; cv.style.height = H + "px"; cv.width = W * dpr; cv.height = H * dpr;
  var c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.fillStyle = "#050a0a"; c.fillRect(0, 0, W, H);
  c.strokeStyle = "rgba(109,255,176,.10)"; c.lineWidth = 1; c.beginPath();
  for (var i = 0; i <= 10; i++){ var x = Math.round(i * (W - 46) / 10) + .5; c.moveTo(x, 0); c.lineTo(x, H - 22); }
  for (var j = 0; j <= chs.length; j++){ var y = j * LH + .5; c.moveTo(0, y); c.lineTo(W, y); }
  c.stroke();
  var N = Math.min(2400, Math.round(W * 2.5));
  chs.forEach(function(ch, k){
    var top = k * LH + 26, h = LH - 32, lo = ch.lo, hi = ch.hi;
    c.strokeStyle = "rgba(109,255,176,.07)"; c.beginPath(); c.moveTo(0, top + h / 2 + .5); c.lineTo(W, top + h / 2 + .5); c.stroke();
    c.save(); c.strokeStyle = ch.c; c.shadowColor = ch.c; c.shadowBlur = 6; c.lineWidth = 2; c.lineJoin = "round"; c.beginPath();
    for (var s = 0; s <= N; s++){
      var v = ch.a ? ch.a[Math.min(ch.a.length - 1, Math.round(s / N * (ch.a.length - 1)))] : ch.v(s / N * span);
      var yy = top + h - clamp((v - lo) / (hi - lo), -.05, 1.05) * h, xx = s / N * (W - 46);
      s ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
    } c.stroke(); c.restore();
    c.font = "700 12px Inter,system-ui,sans-serif"; c.textAlign = "left"; var tw = c.measureText(ch.n).width;
    c.fillStyle = "rgba(5,10,10,.92)"; c.fillRect(2, top - 23, tw + 14, 19); c.fillStyle = ch.c; c.fillRect(2, top - 23, 3, 19);
    c.lineWidth = 3; c.strokeStyle = "#050a0a"; c.strokeText(ch.n, 9, top - 9); c.fillText(ch.n, 9, top - 9); c.lineWidth = 2;
    c.font = "600 11px Inter,system-ui,sans-serif"; c.fillStyle = "rgba(200,255,225,.6)"; c.textAlign = "right"; c.fillText(fmt(hi, ch.u != null ? ch.u : "V", 2), W - 5, top + 4); c.fillText(fmt(lo, ch.u != null ? ch.u : "V", 2), W - 5, top + h + 4);
  });
  if (cur != null){ c.strokeStyle = "rgba(255,255,255,.75)"; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(cur * (W - 46) + .5, 0); c.lineTo(cur * (W - 46) + .5, H - 22); c.stroke(); c.setLineDash([]); }
  c.fillStyle = "rgba(200,255,225,.75)"; c.textAlign = "right"; c.font = "600 11px Inter,system-ui,sans-serif";
  c.fillText(tl ? tl(span / 10) : fmt(span / 10, "s", 2) + " / DIV", W - 6, H - 8); c.textAlign = "left"; c.fillText("0", 6, H - 8);
  oszMess(cv, chs, span, cur, tl, W, H, c);
}

/* ---------- Oszilloskop: automatische Messwerte, Messlinien A/B, PNG ---------- */
function oszWert(ch, span, u){ return ch.a ? ch.a[Math.min(ch.a.length - 1, Math.round(u * (ch.a.length - 1)))] : ch.v(u * span); }
function oszStat(a, span){
  var n = a.length - 1, mn = 1e99, mx = -1e99, sum = 0, sq2 = 0, i;
  for (i = 0; i <= n; i++){ var v = a[i]; if (v < mn) mn = v; if (v > mx) mx = v; sum += v; sq2 += v * v; }
  var vpp = mx - mn, mid = (mn + mx) / 2, ed = [];
  if (vpp > 1e-6 * Math.max(1, Math.abs(mx), Math.abs(mn)) && vpp > 1e-9) for (i = 1; i <= n; i++) if (a[i - 1] < mid && a[i] >= mid) ed.push((i - 1 + (mid - a[i - 1]) / (a[i] - a[i - 1])) / n * span);
  var r = { mn: mn, mx: mx, vpp: vpp, avg: sum / (n + 1), rms: Math.sqrt(sq2 / (n + 1)), f: null, T: null, duty: null };
  if (ed.length >= 2){
    r.T = (ed[ed.length - 1] - ed[0]) / (ed.length - 1); r.f = 1 / r.T;
    var i0 = Math.round(ed[0] / span * n), i1 = Math.round(ed[ed.length - 1] / span * n), hi = 0;
    for (i = i0; i < i1; i++) if (a[i] >= mid) hi++;
    r.duty = i1 > i0 ? hi / (i1 - i0) : null;
  }
  return r;
}
function oszMess(cv, chs, span, cur, tl, W, H, c){
  var os = cv._osz || (cv._osz = { a: null, b: null, act: null });
  cv._oszArgs = [chs, span, cur, tl];
  var Wp = W - 46;
  [["a", "A", "#ffffff"], ["b", "B", "#ffd24a"]].forEach(function(q){
    var x = os[q[0]]; if (x == null) return;
    c.save(); c.strokeStyle = q[2]; c.fillStyle = q[2]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(Math.round(x * Wp) + .5, 0); c.lineTo(Math.round(x * Wp) + .5, H - 22); c.stroke();
    c.font = "800 12px Inter,system-ui,sans-serif"; c.textAlign = "center"; c.fillStyle = "#050a0a"; c.fillRect(x * Wp - 8, H - 22, 16, 16); c.fillStyle = q[2]; c.fillText(q[1], x * Wp, H - 9); c.restore();
  });
  if (!cv._oszInit){
    cv._oszInit = true; cv.style.touchAction = "pan-y"; cv.style.cursor = "crosshair";
    var pos = function(e){ var r = cv.getBoundingClientRect(), w = (cv.clientWidth || r.width) - 46; return Math.max(0, Math.min(1, (e.clientX - r.left) / w)); };
    var redo = function(){ var A = cv._oszArgs; scope(cv, A[0], A[1], A[2], A[3]); };
    cv.addEventListener("pointerdown", function(e){
      var o = cv._osz, x = pos(e);
      if (o.a == null) o.act = "a"; else if (o.b == null) o.act = "b"; else o.act = Math.abs(x - o.a) <= Math.abs(x - o.b) ? "a" : "b";
      o[o.act] = x; try { cv.setPointerCapture(e.pointerId); } catch(er){} cv._oszDrag = true; redo();
    });
    cv.addEventListener("pointermove", function(e){ if (!cv._oszDrag) return; cv._osz[cv._osz.act] = pos(e); redo(); });
    var up = function(){ cv._oszDrag = false; };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  }
  var box = cv.parentNode, pn = cv._oszPanel;
  if (!pn){
    pn = cv._oszPanel = el("div", "ic-meas"); box.appendChild(pn);
    pn.innerHTML = '<div class="ic-mh"><b>📐 ' + T("Messwerte", "Mesures") + '</b><span class="ic-mt">' + T("Tippe ins Bild: Messlinie A, dann B", "Touche l’écran : curseur A, puis B") + '</span><button type="button" class="ic-mb" data-a="clr">' + T("Linien löschen", "Effacer") + '</button><button type="button" class="ic-mb" data-a="png">📷 PNG</button></div><div class="ic-mc"></div><div class="ic-mk"></div>';
    pn.addEventListener("click", function(e){
      var b = e.target.closest && e.target.closest("button"); if (!b) return;
      if (b.dataset.a === "clr"){ cv._osz.a = cv._osz.b = null; var A = cv._oszArgs; scope(cv, A[0], A[1], A[2], A[3]); }
      else { cv.toBlob(function(bl){ if (!bl) return; var u = URL.createObjectURL(bl), a = document.createElement("a"); a.href = u; a.download = "oratio-oszilloskop.png"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(u); }, 4000); }); }
    });
  }
  var rows = "", ST = chs.map(function(ch){
    var n = 800, a = []; for (var i = 0; i <= n; i++) a.push(oszWert(ch, span, i / n));
    return oszStat(a, span);
  });
  chs.forEach(function(ch, k){
    var m = ST[k], u = ch.u != null ? ch.u : "V", ch2 = function(l, v){ return '<span class="ic-mv"><i>' + l + "</i>" + v + "</span>"; };
    var dc = m.f == null;
    rows += '<div class="ic-mr" style="--mc:' + ch.c + '"><b>' + esc(ch.n) + "</b>" + ch2("Vpp", fmt(m.vpp, u, 3)) + ch2("max", fmt(m.mx, u, 3)) + ch2("min", fmt(m.mn, u, 3)) + ch2("Ø", fmt(m.avg, u, 3)) + ch2("eff", fmt(m.rms, u, 3)) +
      (dc ? ch2("f", m.vpp > 0 ? T("einmalig", "unique") : "DC") : ch2("f", fmt(m.f, "Hz", 3)) + ch2("T", fmt(m.T, "s", 3)) + (m.duty != null ? ch2(T("Tastgrad", "Rapport"), Math.round(m.duty * 100) + " %") : "")) + "</div>";
  });
  pn.querySelector(".ic-mc").innerHTML = rows;
  var os2 = cv._osz, ck = "";
  if (os2.a != null){
    ck += '<div class="ic-mr ic-cr"><b style="color:#fff">A</b><span class="ic-mv"><i>t</i>' + fmt(os2.a * span, "s", 3) + "</span>";
    chs.forEach(function(ch){ ck += '<span class="ic-mv" style="color:' + ch.c + '"><i>' + esc(String(ch.n).split(" ")[0]) + "</i>" + fmt(oszWert(ch, span, os2.a), ch.u != null ? ch.u : "V", 3) + "</span>"; }); ck += "</div>";
  }
  if (os2.b != null){
    ck += '<div class="ic-mr ic-cr"><b style="color:#ffd24a">B</b><span class="ic-mv"><i>t</i>' + fmt(os2.b * span, "s", 3) + "</span>";
    chs.forEach(function(ch){ ck += '<span class="ic-mv" style="color:' + ch.c + '"><i>' + esc(String(ch.n).split(" ")[0]) + "</i>" + fmt(oszWert(ch, span, os2.b), ch.u != null ? ch.u : "V", 3) + "</span>"; }); ck += "</div>";
  }
  if (os2.a != null && os2.b != null){
    var dt = Math.abs(os2.b - os2.a) * span;
    ck += '<div class="ic-mr ic-cr"><b>Δ</b><span class="ic-mv"><i>Δt</i>' + fmt(dt, "s", 3) + '</span><span class="ic-mv"><i>1/Δt</i>' + (dt > 0 ? fmt(1 / dt, "Hz", 3) : "–") + "</span>";
    chs.forEach(function(ch){ var d = oszWert(ch, span, os2.b) - oszWert(ch, span, os2.a); ck += '<span class="ic-mv" style="color:' + ch.c + '"><i>Δ' + esc(String(ch.n).split(" ")[0]) + "</i>" + fmt(d, ch.u != null ? ch.u : "V", 3) + "</span>"; }); ck += "</div>";
  }
  pn.querySelector(".ic-mk").innerHTML = ck;
}

/* ---------- Gehäuse-Zeichnung ---------- */
function pinColor(t){ return t === "v" ? "#ff6b6b" : t === "g" ? "#8aa0b8" : t === "o" ? "#3de6ff" : "#ffb000"; }
function dip(ic){
  var P = ic.pins, n = P.length;
  if (ic.pkg === "TO-220"){
    var s = '<svg viewBox="0 0 220 150" class="dipsvg"><rect x="50" y="8" width="120" height="70" rx="6" fill="#262c36" stroke="#59657a"/><circle cx="110" cy="30" r="9" fill="#0e1218"/>';
    P.forEach(function(p, i){ var x = 70 + i * 40, nm = p.split(":")[0], t = p.split(":")[1]; s += '<rect x="' + (x - 4) + '" y="78" width="8" height="38" fill="' + pinColor(t) + '"/><text x="' + x + '" y="134" text-anchor="middle" font-size="12" fill="currentColor">' + (i + 1) + "</text><text x=\"" + x + '" y="148" text-anchor="middle" font-size="11" fill="currentColor" font-weight="700">' + esc(nm) + "</text>"; });
    return s + '<text x="110" y="62" text-anchor="middle" font-size="13" font-weight="800" fill="#e8fff3">' + esc(ic.name) + "</text></svg>";
  }
  if (/TO-92/.test(ic.pkg || "") || (n <= 3 && ic.pkg !== "TO-220" && !/DIP|SOIC/.test(ic.pkg || ""))){
    var s3 = '<svg viewBox="0 0 220 150" class="dipsvg"><path d="M70 74V46a40 40 0 0 1 80 0V74Z" fill="#262c36" stroke="#59657a" stroke-width="1.5"/><path d="M78 74V48a32 32 0 0 1 64 0V74" fill="none" stroke="#3a4352"/>';
    P.forEach(function(p, i){ var x = 85 + i * 25, nm = p.split(":")[0], t = p.split(":")[1]; s3 += '<rect x="' + (x - 3) + '" y="74" width="6" height="44" fill="' + pinColor(t) + '"/><text x="' + x + '" y="132" text-anchor="middle" font-size="12" fill="currentColor">' + (i + 1) + "</text><text x=\"" + x + '" y="147" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor">' + esc(nm) + "</text>"; });
    return s3 + '<text x="110" y="62" text-anchor="middle" font-size="13" font-weight="800" fill="#e8fff3">' + esc(shn(ic.name)) + "</text></svg>";
  }
  var half = n / 2, rowH = 22, H = half * rowH + 20, W = 260, s2 = '<svg viewBox="0 0 ' + W + " " + H + '" class="dipsvg"><rect x="86" y="6" width="88" height="' + (H - 12) + '" rx="8" fill="#262c36" stroke="#59657a"/><path d="M118 6 a12 12 0 0 0 24 0" fill="#0e1218"/>';
  for (var i = 0; i < n; i++){
    var left = i < half, row = left ? i : n - 1 - i, y = 18 + row * rowH, nm = P[i].split(":")[0], t = P[i].split(":")[1];
    s2 += '<rect x="' + (left ? 70 : 174) + '" y="' + (y - 4) + '" width="16" height="8" rx="2" fill="' + pinColor(t) + '"/>';
    s2 += '<text x="' + (left ? 64 : 192) + '" y="' + (y + 4) + '" text-anchor="' + (left ? "end" : "start") + '" font-size="12" font-weight="700" fill="currentColor">' + esc(nm) + "</text>";
    s2 += '<text x="' + (left ? 100 : 160) + '" y="' + (y + 4) + '" text-anchor="' + (left ? "start" : "end") + '" font-size="10" fill="#a9cdbd">' + (i + 1) + "</text>";
  }
  return s2 + '<text x="130" y="' + (H / 2 + 4) + '" text-anchor="middle" font-size="12" font-weight="800" fill="#e8fff3" transform="rotate(-90 130 ' + (H / 2) + ')">' + esc(shn(ic.name)) + "</text></svg>";
}

/* ---------- LED-Reihe & 7-Segment ---------- */
function ledRow(host, n, names, col){
  var row = el("div", "iclr"), L = [];
  for (var i = 0; i < n; i++){ var w = el("div", "ic-led"), d = el("i"), nm0 = names && names[i] != null ? String(names[i]) : "", cc = Array.isArray(col) ? col[i] : /^(rot|rouge|red)/i.test(nm0) ? C.red : /^(gelb|jaune|orange)/i.test(nm0) ? C.amber : /^(grün|vert|green)/i.test(nm0) ? C.green : /^(blau|bleu)/i.test(nm0) ? "#4dabf7" : col; d.style.setProperty("--c", cc || C.red); w.appendChild(d); w.appendChild(el("span", "", names && names[i] != null ? names[i] : "")); row.appendChild(w); L.push(d); }
  host.appendChild(row);
  return { set: function(a){ for (var i = 0; i < L.length; i++) L[i].classList.toggle("on", !!a[i]); } };
}
var DIG = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F];   // Bits a..g = 0..6
function seg7(host){
  var P = ["M14 6 L20 2 L56 2 L62 6 L56 10 L20 10Z", "M64 8 L68 14 L68 44 L64 50 L58 44 L58 14Z", "M64 56 L68 62 L68 92 L64 98 L58 92 L58 62Z", "M14 100 L20 96 L56 96 L62 100 L56 104 L20 104Z", "M10 56 L16 62 L16 92 L10 98 L4 92 L4 62Z", "M10 8 L16 14 L16 44 L10 50 L4 44 L4 14Z", "M14 53 L20 49 L56 49 L62 53 L56 57 L20 57Z"];
  var s = el("div", "ic-seg"); s.innerHTML = '<svg viewBox="0 0 72 106">' + P.map(function(d){ return '<path d="' + d + '"/>'; }).join("") + "</svg>"; host.appendChild(s);
  var ps = s.querySelectorAll("path");
  return { setBits: function(b){ for (var i = 0; i < 7; i++) ps[i].classList.toggle("on", !!((b >> i) & 1)); }, set: function(d){ this.setBits(d >= 0 && d <= 9 ? DIG[d] : 0); } };
}
function toggleBtn(host, label, init, cb){
  var b = el("button", "ic-tg" + (init ? " on" : ""), label); b.type = "button"; b.onclick = function(){ b.classList.toggle("on"); cb && cb(b.classList.contains("on")); }; host.appendChild(b); return b;
}

/* ---------- 555-Rechenkern ---------- */
function c555(R1, R2, Cc, V){
  var tH = .693 * (R1 + R2) * Cc, tL = .693 * R2 * Cc, Tt = tH + tL;
  return { tH: tH, tL: tL, T: Tt, f: 1 / Tt, duty: tH / Tt,
    vc: function(t, ph){ if (t < ph) return V / 3; var x = (t - ph) % Tt; return x < tH ? V - (V - V / 3) * Math.exp(-x / ((R1 + R2) * Cc)) : 2 * V / 3 * Math.exp(-(x - tH) / (R2 * Cc)); },
    out: function(t, ph){ return t >= ph && ((t - ph) % Tt) < tH ? 1 : 0; },
    n: function(t, ph){ return t < ph ? 0 : Math.floor((t - ph) / Tt) + 1; } };
}
var PR1 = { k: "R1", l: ["R1", "R1"], min: 1e3, max: 1e6, def: 1e3, log: 1, u: "Ω", e12: 1 };
var PR2 = { k: "R2", l: ["R2", "R2"], min: 1e3, max: 2e6, def: 47e3, log: 1, u: "Ω", e12: 1 };
var PC1 = { k: "C", l: ["C", "C"], min: 1e-9, max: 1e-3, def: 10e-6, log: 1, u: "F", e12: 1 };
var PV = function(d){ return { k: "V", l: ["Betriebsspannung", "Tension d’alim."], min: 5, max: 15, def: d || 9, u: "V", int: 1 }; };
var PF = function(d, lo, hi){ return { k: "f", l: ["Takt-Frequenz", "Fréquence d’horloge"], min: lo || .5, max: hi || 5000, def: d || 2, log: 1, u: "Hz" }; };
function led1(on){ return { leds: [on], names: ["LED"] }; }
function digitLive(n){ return n; }

/* ---------- Kombi- und Einzelprojekte ---------- */
var PROJ = {};

PROJ.ne555a = { t: ["555 astabil – Blinker / Rechteck-Oszillator", "555 astable – clignotant / oscillateur"], flow: ["NE555", "LED"],
  d: ["Der Klassiker: Ein Kondensator lädt sich zwischen 1/3 und 2/3 der Betriebsspannung hin und her – der Ausgang kippt im Takt. Ändere R1, R2 und C und sieh am Oszilloskop, was passiert.", "Le classique : le condensateur oscille entre 1/3 et 2/3 de la tension – la sortie bascule en rythme. Change R1, R2 et C et regarde l’oscilloscope."],
  params: [PR1, PR2, PC1, PV(9)],
  build: function(P){ var k = c555(P.R1, P.R2, P.C, P.V), ph = k.T * .25, V = P.V, w = [];
    if (P.R1 < 1e3) w.push(T("R1 sollte mindestens 1 kΩ sein (Entladestrom).", "R1 devrait valoir au moins 1 kΩ."));
    if (k.f > 500e3) w.push(T("Über ca. 500 kHz schafft der NE555 das nicht mehr.", "Au-delà de 500 kHz le NE555 ne suit plus."));
    return { span: ph + 3.1 * k.T, fmain: k.f, warn: w,
      ch: [{ n: "OUT (Pin 3)", c: C.green, lo: 0, hi: V, v: function(t){ return k.out(t, ph) * (V - 1.5); } }, { n: "C (Pin 2/6)", c: C.amber, lo: 0, hi: V, v: function(t){ return k.vc(t, ph); } }],
      info: [[T("Frequenz", "Fréquence"), fmt(k.f, "Hz")], [T("Periodendauer", "Période"), fmt(k.T, "s")], [T("HIGH-Zeit tH = 0,693·(R1+R2)·C", "Temps haut tH"), fmt(k.tH, "s")], [T("LOW-Zeit tL = 0,693·R2·C", "Temps bas tL"), fmt(k.tL, "s")], [T("Tastverhältnis", "Rapport cyclique"), (k.duty * 100).toFixed(1).replace(".", ",") + " %"], [T("Schwellen", "Seuils"), fmt(V / 3, "V") + " / " + fmt(2 * V / 3, "V")]],
      live: function(ts){ return { leds: [k.out(ts, 0)], names: ["OUT"] }; } }; },
  wire: [["Pin 1 → GND, Pin 8 → +V", "Broche 1 → GND, broche 8 → +V"], ["Pin 4 (RESET) → +V (sonst bleibt der Ausgang aus)", "Broche 4 (RESET) → +V"], ["R1 von +V an Pin 7 (DISCH)", "R1 de +V vers broche 7"], ["R2 von Pin 7 an Pin 6/2 (die beiden zusammen)", "R2 de la broche 7 aux broches 6/2 (reliées)"], ["C von Pin 6/2 nach GND", "C de la broche 6/2 vers GND"], ["Pin 5 (CTRL) über 10 nF nach GND (ruhigere Schwellen)", "Broche 5 via 10 nF vers GND"], ["Pin 3 (OUT) → 330 Ω … 1 kΩ → LED → GND", "Broche 3 → 330 Ω…1 kΩ → LED → GND"]],
  notes: [["Das Tastverhältnis ist immer über 50 % (R1 lädt mit). Für genau 50 %: Diode parallel zu R2 (Anode zum Kondensator) und R1 sehr klein.", "Le rapport cyclique dépasse toujours 50 %."], ["Der bipolare NE555 gibt HIGH nur ca. 1,5 V unter +V aus (CMOS-Typ TLC555/LMC555: fast voll).", "Le NE555 bipolaire sort ≈ +V − 1,5 V."]] };

PROJ.ne555m = { t: ["555 monostabil – Zeitrelais / Impuls", "555 monostable – impulsion"], flow: ["Taster", "NE555", "LED"],
  d: ["Ein kurzer Tastendruck an Pin 2 startet genau einen Impuls der Länge T = 1,1·R·C. Danach fällt der Ausgang von selbst zurück. Drücke den Knopf und sieh die LED.", "Une brève impulsion sur la broche 2 déclenche une impulsion de durée T = 1,1·R·C."],
  params: [{ k: "R", l: ["R", "R"], min: 1e3, max: 2e6, def: 100e3, log: 1, u: "Ω", e12: 1 }, PC1, PV(9)],
  action: { l: ["▶ Taster drücken (Trigger)", "▶ Appuyer (déclencheur)"] },
  build: function(P){ var Tt = 1.1 * P.R * P.C, V = P.V, span = Tt / .7, t0 = span * .12, w = span * .03;
    return { span: span, speed: Tt / clamp(Tt, .8, 6), warn: [],
      ch: [{ n: "TRIG (Pin 2)", c: C.pink, lo: 0, hi: V, v: function(t){ return t >= t0 && t < t0 + w ? 0 : V; } }, { n: "C (Pin 6/7)", c: C.amber, lo: 0, hi: V, v: function(t){ return t < t0 ? 0 : t < t0 + Tt ? V * (1 - Math.exp(-(t - t0) / (P.R * P.C))) : 0; } }, { n: "OUT (Pin 3)", c: C.green, lo: 0, hi: V, v: function(t){ return t >= t0 && t < t0 + Tt ? V - 1.5 : 0; } }],
      info: [[T("Impulsdauer T = 1,1·R·C", "Durée T = 1,1·R·C"), fmt(Tt, "s")], [T("Schwelle (2/3 V)", "Seuil (2/3 V)"), fmt(2 * V / 3, "V")]],
      live: function(ts, ctx){ return { leds: [ctx.fire != null && ts - ctx.fire < Tt && ts >= ctx.fire], names: ["OUT"] }; } }; },
  wire: [["Pin 1 → GND, Pin 8 und Pin 4 → +V", "Broche 1 → GND, 8 et 4 → +V"], ["Pin 2 (TRIG) über 10 kΩ an +V (Ruhe: HIGH), Taster von Pin 2 nach GND", "Broche 2 via 10 kΩ à +V, bouton de la broche 2 à GND"], ["R von +V an Pin 7 und Pin 6 (zusammen)", "R de +V aux broches 7 et 6 (reliées)"], ["C von Pin 6/7 nach GND", "C de la broche 6/7 à GND"], ["Pin 3 → Vorwiderstand → LED → GND", "Broche 3 → résistance → LED → GND"]],
  notes: [["Der Trigger-Impuls muss kürzer sein als T, sonst bleibt der Ausgang so lange an, wie du drückst.", "L’impulsion de déclenchement doit être plus courte que T."], ["Während der Impuls läuft, wird ein neuer Trigger ignoriert (nicht nachtriggerbar).", "Pendant l’impulsion, un nouveau déclenchement est ignoré."]] };

PROJ.hc14 = { t: ["Schmitt-Trigger-Oszillator (74HC14)", "Oscillateur à trigger de Schmitt (74HC14)"], flow: ["74HC14", "R + C", "LED"],
  d: ["Ein einziges Gatter, ein Widerstand, ein Kondensator – fertig ist ein Taktgeber. Der Kondensator wird über den Ausgang geladen und entladen, der Schmitt-Trigger kippt an zwei verschiedenen Schwellen.", "Une porte, une résistance, un condensateur : un oscillateur."],
  params: [{ k: "R", l: ["R", "R"], min: 1e3, max: 1e6, def: 100e3, log: 1, u: "Ω", e12: 1 }, PC1, { k: "V", l: ["Betriebsspannung", "Tension"], min: 3, max: 6, def: 5, u: "V" }],
  build: function(P){ var V = P.V, Vp = .55 * V, Vm = .33 * V, RC = P.R * P.C, th = RC * Math.log((V - Vm) / (V - Vp)), tl = RC * Math.log(Vp / Vm), Tt = th + tl, ph = Tt * .2;
    function vc(t){ if (t < ph) return Vm; var x = (t - ph) % Tt; return x < th ? V - (V - Vm) * Math.exp(-x / RC) : Vp * Math.exp(-(x - th) / RC); }
    function out(t){ return t >= ph && ((t - ph) % Tt) < th ? 1 : 0; }
    return { span: ph + 3.2 * Tt, fmain: 1 / Tt, warn: [],
      ch: [{ n: "Ausgang (Pin 2)", c: C.green, lo: 0, hi: V, v: function(t){ return out(t) * V; } }, { n: "Kondensator / Eingang (Pin 1)", c: C.amber, lo: 0, hi: V, v: vc }],
      info: [[T("Frequenz ≈ 1 / (0,9·R·C)", "Fréquence"), fmt(1 / Tt, "Hz")], [T("Schwellen VT+ / VT− (typisch)", "Seuils VT+ / VT−"), fmt(Vp, "V") + " / " + fmt(Vm, "V")], [T("HIGH / LOW", "Haut / bas"), fmt(th, "s") + " / " + fmt(tl, "s")]],
      live: function(ts){ return { leds: [out(ts)], names: ["OUT"] }; } }; },
  wire: [["Pin 14 → +V, Pin 7 → GND, 100 nF dicht am Chip", "Broche 14 → +V, 7 → GND, 100 nF près de la puce"], ["Pin 2 (Ausgang) → R → Pin 1 (Eingang)", "Broche 2 → R → broche 1"], ["Pin 1 → C → GND", "Broche 1 → C → GND"], ["Pin 2 → Vorwiderstand → LED → GND", "Broche 2 → résistance → LED → GND"], ["Nicht benutzte Gatter: Eingänge an GND legen", "Entrées inutilisées → GND"]],
  notes: [["Die Schwellen streuen von Chip zu Chip stark – die Frequenz ist nur ±20 % genau. Für Blinker egal, für Zeitbasen nicht.", "Les seuils varient beaucoup d’une puce à l’autre."], ["Das Prinzip funktioniert genauso mit 40106 oder 4093.", "Même principe avec 40106 ou 4093."]] };

PROJ.hc00 = { t: ["Gatter-Werkstatt: alle Logikgatter (74xx, 74HC, CD4000)", "Atelier des portes logiques (74xx, 74HC, CD4000)"], flow: ["Eingänge A, B", "Gatter", "Ausgang Y"], custom: "gates",
  d: ["Schalte die Eingänge und sieh den Ausgang. Dazu: Wie man mit NAND-Gattern alle anderen Gatter baut – deshalb heißt das NAND „Universal-Gatter“.", "Bascule les entrées et vois la sortie. Et comment construire toutes les portes avec des NAND."],
  wire: [["Pin 14 → +V, Pin 7 → GND, 100 nF dazwischen", "Broche 14 → +V, 7 → GND, 100 nF"], ["Gatter 1: A = Pin 1, B = Pin 2, Y = Pin 3 (bei 7400, 7408, 7432, 7486)", "Porte 1 : A = 1, B = 2, Y = 3"], ["Unbenutzte Eingänge fest an GND oder +V", "Entrées libres → GND ou +V"], ["Achtung: 7402 (NOR) hat eine andere Pinbelegung – Ausgang zuerst!", "Attention : le 7402 (NOR) a un brochage différent."]],
  notes: [["Eingänge dürfen bei HC nie offen bleiben – sie schwingen sonst und ziehen Strom.", "Les entrées HC ne doivent jamais rester en l’air."]] };

PROJ.hc74 = { t: ["Frequenzteiler mit D-Flip-Flops (74HC74)", "Diviseur de fréquence (74HC74)"], flow: ["Takt", "74HC74 ÷2", "÷4", "÷8", "÷16"],
  d: ["Verbindest du /Q mit D, kippt das Flip-Flop bei jeder steigenden Flanke: der Takt wird halbiert. Mehrere hintereinander geben ÷4, ÷8, ÷16 – die Grundidee jedes Zählers.", "En reliant /Q à D, la bascule change d’état à chaque front montant : la fréquence est divisée par 2."],
  params: [PF(4, .5, 2000)], opts: [{ k: "n", l: ["Stufen", "Étages"], o: [[1, "1 (÷2)"], [2, "2 (÷4)"], [3, "3 (÷8)"], [4, "4 (÷16)"]], def: 3 }],
  build: function(P){ var f = P.f, n = +P.n, ph = .25 / f, N = Math.pow(2, n), chs = [{ n: "CLK", c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, f, ph, .5) * 5; } }];
    for (var i = 1; i <= n; i++) (function(i){ chs.push({ n: "Q" + i + "  (÷" + Math.pow(2, i) + ")", c: [C.green, C.cyan, C.pink, C.lime][i - 1], lo: 0, hi: 5, v: function(t){ return (Math.floor(cnt(t, f, ph) / Math.pow(2, i - 1)) % 2) * 5; } }); })(i);
    return { span: ph + (2.2 * N) / f, fmain: f, warn: [], ch: chs, info: [[T("Eingangstakt", "Horloge"), fmt(f, "Hz")], [T("Ausgang letzte Stufe", "Dernier étage"), fmt(f / N, "Hz")]],
      live: function(ts){ var c = cnt(ts, f, ph), a = []; for (var i = 1; i <= n; i++) a.push(Math.floor(c / Math.pow(2, i - 1)) % 2); return { leds: a, names: a.map(function(x, i){ return "Q" + (i + 1); }) }; } }; },
  wire: [["Pin 14 → +V, Pin 7 → GND", "Broche 14 → +V, 7 → GND"], ["Flip-Flop 1: /Q (Pin 6) → D (Pin 2), Takt an CLK (Pin 3)", "Bascule 1 : /Q (6) → D (2), horloge sur CLK (3)"], ["/PR (Pin 4) und /CLR (Pin 1) → +V (nicht aktiv)", "/PR (4) et /CLR (1) → +V"], ["Q (Pin 5) = Ausgang; für die 2. Stufe: Q (Pin 5) → CLK des 2. Flip-Flops (Pin 11), /Q (Pin 8) → D (Pin 12)", "Étage 2 : Q (5) → CLK (11), /Q (8) → D (12)"]],
  notes: [["Das 74HC74 hat nur 2 Flip-Flops im Gehäuse – für 4 Stufen brauchst du 2 ICs.", "Le 74HC74 ne contient que 2 bascules."], ["Asynchron: Jede Stufe hängt am Ausgang der vorherigen – bei vielen Stufen summieren sich die Laufzeiten.", "Asynchrone : les retards s’additionnent."]] };

PROJ.cd4017 = { t: ["Lauflicht mit CD4017", "Chenillard avec CD4017"], flow: ["Takt", "CD4017", "10 × LED"],
  d: ["Mit jeder steigenden Taktflanke wandert das HIGH zum nächsten Ausgang Q0…Q9. Verbindest du Qn mit RESET, läuft das Licht nur n Schritte lang.", "À chaque front montant, le niveau haut passe à la sortie suivante."],
  params: [PF(3, .5, 3000), { k: "n", l: ["Schritte (Qn → RESET)", "Pas (Qn → RESET)"], min: 2, max: 10, def: 10, int: 1, u: "" }],
  build: function(P){ var f = P.f, n = Math.round(P.n), ph = .25 / f, chs = [{ n: "CLK (Pin 14)", c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, f, ph, .5) * 5; } }];
    for (var i = 0; i < 4; i++) (function(i){ chs.push({ n: "Q" + i, c: [C.green, C.cyan, C.pink, C.lime][i], lo: 0, hi: 5, v: function(t){ return (cnt(t, f, ph) % n === i ? 5 : 0); } }); })(i);
    return { span: ph + (Math.min(n, 8) + 1.6) / f, fmain: f, warn: n < 10 ? [] : [], ch: chs, info: [[T("Takt", "Horloge"), fmt(f, "Hz")], [T("Ein Umlauf dauert", "Un tour dure"), fmt(n / f, "s")], [T("RESET-Verbindung", "Liaison RESET"), n === 10 ? T("keine (volle 10 Schritte)", "aucune") : "Q" + n + " → RESET (Pin 15)"]],
      live: function(ts){ var s = cnt(ts, f, ph) % n, a = []; for (var i = 0; i < 10; i++) a.push(i === s ? 1 : 0); return { leds: a, names: a.map(function(x, i){ return "Q" + i; }) }; } }; },
  wire: [["Pin 16 → +V, Pin 8 → GND", "Broche 16 → +V, 8 → GND"], ["Pin 13 (CE) und Pin 15 (RESET) → GND", "Broches 13 et 15 → GND"], ["Takt an Pin 14 (CLK)", "Horloge sur la broche 14"], ["Q0…Q9 jeweils → 1 kΩ → LED → GND", "Q0…Q9 → 1 kΩ → LED → GND"], ["Q(n) → Pin 15 (RESET) für n Schritte, z. B. Q6 → RESET = 6 Schritte", "Q(n) → RESET pour n pas"], ["Q-Anschlüsse sind NICHT der Reihe nach angeordnet: Q0=Pin 3, Q1=2, Q2=4, Q3=7, Q4=10, Q5=1, Q6=5, Q7=6, Q8=9, Q9=11", "Les sorties ne sont pas dans l’ordre !"]],
  notes: [["Ausgänge sind schwach (ca. 1–5 mA bei 5 V): LEDs mit ≥ 1 kΩ oder über Transistor/ULN2003.", "Sorties faibles : LED avec ≥ 1 kΩ."], ["Kaskadieren: Pin 12 (CO) des ersten → CLK des zweiten.", "Cascade : CO → CLK du suivant."]] };

PROJ.cd4060 = { t: ["Teilerkette & Quarzuhr-Baustein (CD4060)", "Chaîne de division (CD4060)"], flow: ["Oszillator", "÷ 2⁴ … 2¹⁴", "Ausgänge"],
  d: ["14 Teilerstufen und ein Oszillator in einem Gehäuse. Mit einem 32,768-kHz-Uhrenquarz kommt an Q14 genau 2 Hz heraus – die Basis jeder Quarzuhr.", "14 étages diviseurs + oscillateur. Avec un quartz 32,768 kHz : Q14 = 2 Hz."],
  opts: [{ k: "o", l: ["Oszillator", "Oscillateur"], o: [["q32", "Quarz 32,768 kHz"], ["q1m", "Quarz 1 MHz"], ["q4", "Quarz 4,194304 MHz"], ["rc", "RC-Oszillator"]], def: "q32" }, { k: "q", l: ["LED an Ausgang", "LED sur sortie"], o: [[4, "Q4"], [6, "Q6"], [8, "Q8"], [10, "Q10"], [12, "Q12"], [13, "Q13"], [14, "Q14"]], def: 14 }],
  params: [{ k: "Rt", l: ["Rt (nur RC)", "Rt (RC)"], min: 1e3, max: 1e6, def: 47e3, log: 1, u: "Ω", e12: 1 }, { k: "Ct", l: ["Ct (nur RC)", "Ct (RC)"], min: 100e-12, max: 1e-6, def: 10e-9, log: 1, u: "F", e12: 1 }],
  build: function(P){ var f = P.o === "q32" ? 32768 : P.o === "q1m" ? 1e6 : P.o === "q4" ? 4194304 : 1 / (2.3 * P.Rt * P.Ct), ph = .25 / f, q = +P.q,
      chs = [{ n: "Oszillator (Pin 10)", c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, f, ph, .5) * 5; } }];
    [4, 5, 6, 7].forEach(function(n, i){ chs.push({ n: "Q" + n + "  (÷" + Math.pow(2, n) + ")", c: [C.green, C.cyan, C.pink, C.lime][i], lo: 0, hi: 5, v: function(t){ return (Math.floor(cnt(t, f, ph) / Math.pow(2, n - 1)) % 2) * 5; } }); });
    var inf = [[T("Oszillator", "Oscillateur"), fmt(f, "Hz")]]; [4, 5, 6, 7, 8, 9, 10, 12, 13, 14].forEach(function(n){ inf.push(["Q" + n + " (÷" + Math.pow(2, n) + ")", fmt(f / Math.pow(2, n), "Hz") + "  ·  " + fmt(Math.pow(2, n) / f, "s")]); });
    return { span: ph + 135 / f, fmain: f / Math.pow(2, q), warn: [], ch: chs, info: inf,
      live: function(ts){ return { leds: [Math.floor(cnt(ts, f, ph) / Math.pow(2, q - 1)) % 2], names: ["Q" + q] }; } }; },
  wire: [["Pin 16 → +V, Pin 8 → GND, Pin 12 (RESET) → GND", "Broche 16 → +V, 8 → GND, 12 → GND"], ["Quarz: zwischen Pin 11 und Pin 10; je 22 pF von Pin 11 und Pin 10 nach GND; 10 MΩ zwischen Pin 11 und Pin 9", "Quartz entre 11 et 10 ; 22 pF vers GND ; 10 MΩ entre 11 et 9"], ["RC statt Quarz: Rt von Pin 10 an Pin 11, Ct von Pin 11 nach GND, R2 ≈ 2·Rt von Pin 11 an Pin 9", "Version RC : Rt (10→11), Ct (11→GND), R2 ≈ 2·Rt (11→9)"], ["Ausgang z. B. Q14 (Pin 3) → Vorwiderstand → LED → GND", "Sortie Q14 (3) → résistance → LED"]],
  notes: [["Q1, Q2, Q3 und Q11 sind nicht herausgeführt. Q4 ist die erste Stufe, die du abgreifen kannst.", "Q1–Q3 et Q11 ne sont pas accessibles."], ["Quarz 32,768 kHz = 2¹⁵ Hz: 15 Teilungen ergeben 1 Hz – Q14 plus ein Flip-Flop (siehe Kombi-Projekt Quarzuhr).", "32,768 kHz = 2¹⁵ Hz."]] };

PROJ.hc160 = { t: ["Dekadenzähler 0…9 (74HC160)", "Compteur décimal 0…9 (74HC160)"], flow: ["Takt", "74HC160", "BCD 0…9"],
  d: ["Zählt bei jeder steigenden Flanke weiter: 0, 1, 2 … 9, dann wieder 0. Die vier Ausgänge Q0…Q3 sind der BCD-Wert, TC meldet die 9.", "Compte 0…9 puis recommence. Q0…Q3 = valeur BCD, TC signale le 9."],
  params: [PF(2, .5, 2000)],
  build: function(P){ var f = P.f, ph = .25 / f, chs = [{ n: "CLK (Pin 2)", c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, f, ph, .5) * 5; } }];
    for (var i = 0; i < 4; i++) (function(i){ chs.push({ n: "Q" + i + "  (Wert " + Math.pow(2, i) + ")", c: [C.green, C.cyan, C.pink, C.lime][i], lo: 0, hi: 5, v: function(t){ return ((cnt(t, f, ph) % 10) >> i & 1) * 5; } }); })(i);
    chs.push({ n: "TC (Pin 15) = 9", c: C.red, lo: 0, hi: 5, v: function(t){ return cnt(t, f, ph) % 10 === 9 ? 5 : 0; } });
    return { span: ph + 12.3 / f, fmain: f, warn: [], ch: chs, info: [[T("Takt", "Horloge"), fmt(f, "Hz")], [T("Ein Umlauf (10 Takte)", "Un cycle (10 coups)"), fmt(10 / f, "s")]],
      live: function(ts){ var s = cnt(ts, f, ph) % 10; return { leds: [s & 1, s >> 1 & 1, s >> 2 & 1, s >> 3 & 1], names: ["Q0", "Q1", "Q2", "Q3"], seg: s }; } }; },
  wire: [["Pin 16 → +V, Pin 8 → GND", "Broche 16 → +V, 8 → GND"], ["/MR (Pin 1), /PE (Pin 9), CEP (Pin 7), CET (Pin 10) → +V", "/MR, /PE, CEP, CET → +V"], ["Takt an CLK (Pin 2)", "Horloge sur CLK (2)"], ["Q0 = Pin 14, Q1 = 13, Q2 = 12, Q3 = 11; TC = Pin 15", "Q0 = 14, Q1 = 13, Q2 = 12, Q3 = 11 ; TC = 15"], ["P0…P3 (Pin 3…6) → GND, wenn du nicht laden willst", "P0…P3 → GND"]],
  notes: [["Das 74HC160 zählt dezimal (0–9), das 74HC161 binär (0–15) – gleiche Pinbelegung.", "Le 160 compte en décimal, le 161 en binaire."], ["Synchron: alle Ausgänge ändern sich gleichzeitig mit der Taktflanke.", "Synchrone : toutes les sorties changent ensemble."]] };

PROJ.hc595 = { t: ["Schieberegister (74HC595): 3 Pins → 8 Ausgänge", "Registre à décalage (74HC595)"], flow: ["µC: 3 Pins", "74HC595", "8 Ausgänge"], custom: "shift",
  d: ["Bits werden einzeln eingetaktet (SER + SRCLK) und erst mit RCLK an die Ausgänge übernommen. Stelle ein Byte ein und gehe Takt für Takt durch.", "Les bits sont décalés un par un puis recopiés en sortie par RCLK."],
  wire: [["Pin 16 → +V, Pin 8 → GND", "Broche 16 → +V, 8 → GND"], ["Pin 10 (/SRCLR) → +V, Pin 13 (/OE) → GND", "Broche 10 → +V, 13 → GND"], ["Pin 14 (SER) = Daten, Pin 11 (SRCLK) = Schiebetakt, Pin 12 (RCLK) = Übernahme", "14 = données, 11 = horloge de décalage, 12 = verrou"], ["Ausgänge QA…QH = Pin 15, 1, 2, 3, 4, 5, 6, 7 → je 330 Ω → LED → GND", "QA…QH = 15, 1, 2, 3, 4, 5, 6, 7"], ["Mehrere kaskadieren: QH' (Pin 9) → SER des nächsten", "Cascade : QH’ (9) → SER suivant"]],
  notes: [["Arduino: shiftOut(dataPin, clockPin, MSBFIRST, wert); davor latch LOW, danach latch HIGH.", "Arduino : shiftOut(...)."], ["Pro Ausgang nur ca. 6 mA: für Relais/Motoren einen ULN2003 dahinter.", "≈ 6 mA par sortie."]] };

PROJ.hc138 = { t: ["3-zu-8-Dekoder (74HC138)", "Décodeur 3 vers 8 (74HC138)"], flow: ["A0 A1 A2", "74HC138", "Y0 … Y7"], custom: "dec138",
  d: ["Drei Adress-Eingänge wählen genau einen von acht Ausgängen – der gewählte geht auf LOW. Typisch für Adress-Dekodierung und Chip-Select.", "Trois entrées d’adresse choisissent une des huit sorties (active à l’état bas)."],
  wire: [["Pin 16 → +V, Pin 8 → GND", "Broche 16 → +V, 8 → GND"], ["A0 = Pin 1, A1 = Pin 2, A2 = Pin 3", "A0 = 1, A1 = 2, A2 = 3"], ["Pin 4 (/E1), Pin 5 (/E2) → GND; Pin 6 (E3) → +V (Chip aktiv)", "4 et 5 → GND, 6 → +V"], ["Y0 = Pin 15, Y1 = 14, … Y6 = 9; Y7 = Pin 7", "Y0 = 15 … Y6 = 9 ; Y7 = 7"], ["LED von +V über Vorwiderstand an Yn: leuchtet bei LOW", "LED de +V via résistance à Yn"]],
  notes: [["Die Ausgänge sind active-low: der gewählte Ausgang ist 0, alle anderen 1.", "Sorties actives à l’état bas."]] };

PROJ.cd4511 = { t: ["BCD-zu-7-Segment-Dekoder (CD4511)", "Décodeur BCD → 7 segments (CD4511)"], flow: ["BCD A B C D", "CD4511", "7-Segment"], custom: "bcd7",
  d: ["Vier Bit rein, sieben Segmente raus: der 4511 macht aus dem Zählerstand eine lesbare Ziffer. Werte über 9 bleiben dunkel.", "Quatre bits en entrée, sept segments en sortie."],
  wire: [["Pin 16 → +V, Pin 8 → GND", "Broche 16 → +V, 8 → GND"], ["Eingänge: A = Pin 7, B = Pin 1, C = Pin 2, D = Pin 6", "A = 7, B = 1, C = 2, D = 6"], ["Pin 3 (/LT) und Pin 4 (/BI) → +V, Pin 5 (LE) → GND", "3 et 4 → +V, 5 → GND"], ["Ausgänge a…g = Pin 13, 12, 11, 10, 9, 15, 14 → je 330 Ω → Segmente einer Anzeige mit gemeinsamer KATHODE (→ GND)", "a…g = 13, 12, 11, 10, 9, 15, 14 → 330 Ω → afficheur à cathode commune"]],
  notes: [["Der CD4511 ist für Anzeigen mit gemeinsamer Kathode; für gemeinsame Anode nimm den 7447.", "Le CD4511 est pour cathode commune ; anode commune : 7447."], ["LE (Latch Enable) HIGH friert die angezeigte Ziffer ein.", "LE à l’état haut gèle l’affichage."]] };

PROJ.lm358 = { t: ["Operationsverstärker: invertierend / nicht-invertierend (LM358)", "Amplificateur opérationnel (LM358)"], flow: ["Eingang", "LM358 + R1/R2", "Ausgang"],
  d: ["Die Verstärkung legen allein R1 und R2 fest. Übersteuere ihn absichtlich und sieh, wo der LM358 an die Versorgungsgrenze stößt (nur bis ca. +V − 1,5 V).", "Le gain est fixé par R1 et R2."],
  opts: [{ k: "m", l: ["Schaltung", "Montage"], o: [["inv", "invertierend  (−R2/R1)"], ["non", "nicht-invertierend (1+R2/R1)"]], def: "non" }, { k: "s", l: ["Versorgung", "Alimentation"], o: [["d12", "±12 V"], ["s5", "+5 V (Bias 2,5 V)"], ["s12", "+12 V (Bias 6 V)"]], def: "d12" }],
  params: [{ k: "R1", l: ["R1", "R1"], min: 1e3, max: 1e5, def: 10e3, log: 1, u: "Ω", e12: 1 }, { k: "R2", l: ["R2", "R2"], min: 1e3, max: 1e6, def: 47e3, log: 1, u: "Ω", e12: 1 }, { k: "A", l: ["Eingangsamplitude", "Amplitude d’entrée"], min: .01, max: 5, def: .5, log: 1, u: "V" }, { k: "f", l: ["Frequenz", "Fréquence"], min: 10, max: 200e3, def: 1000, log: 1, u: "Hz" }],
  build: function(P){ var g = P.m === "inv" ? -P.R2 / P.R1 : 1 + P.R2 / P.R1, fc = 1e6 / Math.abs(g), ge = g / Math.sqrt(1 + Math.pow(P.f / fc, 2)),
      dual = P.s === "d12", Vs = P.s === "s5" ? 5 : P.s === "s12" ? 12 : 12, bias = dual ? 0 : Vs / 2, lo = dual ? -12 : 0, hi = dual ? 12 : Vs, vmax = dual ? 10.5 : Vs - 1.5, vmin = dual ? -11.9 : .05, w = [], span = 3 / P.f;
    function vin(t){ return bias + sineAt(t, P.f, P.A); } function vout(t){ return clamp(bias + ge * sineAt(t, P.f, P.A), vmin, vmax); }
    var pk = Math.abs(ge) * P.A; if (bias + pk > vmax || bias - pk < vmin) w.push(T("Ausgang übersteuert – das Signal wird oben/unten abgeschnitten (Clipping).", "Sortie saturée – le signal est écrêté."));
    if (2 * Math.PI * P.f * Math.min(pk, vmax - vmin) / 2 > .3e6) w.push(T("Slew-Rate-Grenze des LM358 (0,3 V/µs): bei dieser Frequenz/Amplitude wird die Sinuskurve zum Dreieck.", "Limite de slew-rate du LM358."));
    return { span: span, speed: 1, warn: w, ch: [{ n: "Eingang", c: C.amber, lo: lo, hi: hi, v: vin }, { n: "Ausgang", c: C.green, lo: lo, hi: hi, v: vout }],
      info: [[T("Verstärkung", "Gain"), g.toFixed(1).replace(".", ",") + "×  (" + (20 * Math.log10(Math.abs(g))).toFixed(1) + " dB)"], [T("Grenzfrequenz ≈ 1 MHz / |Gain|", "Fréquence de coupure"), fmt(fc, "Hz")], [T("Wirksame Verstärkung bei f", "Gain effectif"), ge.toFixed(1).replace(".", ",") + "×"], [T("Maximale Ausgangsspannung", "Sortie max."), fmt(vmax, "V")]] }; },
  wire: [["Pin 8 → +V, Pin 4 → GND (oder −V bei ±-Versorgung)", "Broche 8 → +V, 4 → GND"], ["Nicht-invertierend: Signal an Pin 3 (IN+); R2 von Pin 1 (Ausgang) an Pin 2 (IN−); R1 von Pin 2 nach GND", "Non inverseur : signal sur 3 ; R2 de 1 vers 2 ; R1 de 2 vers GND"], ["Invertierend: Signal über R1 an Pin 2; R2 von Pin 1 an Pin 2; Pin 3 → GND (bzw. Bias)", "Inverseur : signal via R1 sur 2 ; R2 de 1 vers 2 ; broche 3 → GND"], ["Bei einfacher Versorgung: Bias Vcc/2 mit zwei gleichen Widerständen, Koppelkondensatoren am Ein- und Ausgang", "Alim. simple : polarisation Vcc/2 + condensateurs de liaison"]],
  notes: [["Der LM358 ist ein Single-Supply-Typ: der Eingang darf bis GND, der Ausgang kommt fast bis GND, aber nur bis ca. +V − 1,5 V.", "Le LM358 fonctionne en alimentation simple."], ["Für Audio oder schnelle Signale: TL072 oder NE5532 (mehr Bandbreite, weniger Rauschen).", "Pour l’audio : TL072 ou NE5532."]] };

PROJ.lm393 = { t: ["Komparator mit Hysterese (LM393)", "Comparateur avec hystérésis (LM393)"], flow: ["Signal + Referenz", "LM393", "Ausgang"],
  d: ["Der Komparator vergleicht zwei Spannungen. Ist das Signal verrauscht, zittert der Ausgang an der Schwelle – mit Hysterese (Mitkopplung) nicht mehr. Schalte sie ein und aus.", "Le comparateur compare deux tensions. Avec du bruit la sortie vibre ; l’hystérésis l’évite."],
  params: [{ k: "ref", l: ["Referenz Vref", "Référence Vref"], min: 0.5, max: 4.5, def: 2.5, u: "V" }, { k: "A", l: ["Signal-Amplitude", "Amplitude du signal"], min: .2, max: 2.4, def: 1.2, u: "V" }, { k: "noise", l: ["Rauschen", "Bruit"], min: 0, max: 1, def: .25, u: "V" }, { k: "h", l: ["Hysterese Δ", "Hystérésis Δ"], min: 0, max: 1.5, def: .5, u: "V" }],
  build: function(P){ var N = 1200, span = 1, vin = [], out = [], sw = 0, o = 0, swNo = 0, o2 = 0, V = 5;
    for (var i = 0; i < N; i++){ var t = i / N, v = 2.5 + P.A * Math.sin(2 * Math.PI * 2 * t) + (hash(i) - .5) * 2 * P.noise; vin.push(v);
      var hi = P.ref + P.h / 2, lo = P.ref - P.h / 2; var n = o; if (v > hi) n = 1; else if (v < lo) n = 0; if (n !== o) sw++; o = n; out.push(o * V);
      var n2 = v > P.ref ? 1 : 0; if (n2 !== o2) swNo++; o2 = n2; }
    return { span: span, speed: 1, warn: [], ch: [{ n: "Eingang IN+ (verrauscht)", c: C.amber, lo: 0, hi: 5, a: vin }, { n: "Vref ± Δ/2", c: C.cyan, lo: 0, hi: 5, v: function(t){ return P.ref; } }, { n: "Ausgang", c: C.green, lo: 0, hi: 5, a: out }],
      info: [[T("Schaltflanken mit Hysterese", "Commutations avec hystérésis"), String(sw)], [T("Schaltflanken ohne Hysterese", "Sans hystérésis"), String(swNo)], [T("Obere / untere Schwelle", "Seuils haut / bas"), fmt(P.ref + P.h / 2, "V") + " / " + fmt(P.ref - P.h / 2, "V")]] }; },
  wire: [["Pin 8 → +V, Pin 4 → GND", "Broche 8 → +V, 4 → GND"], ["Signal an Pin 3 (IN+), Referenz (Poti oder Teiler) an Pin 2 (IN−)", "Signal sur 3, référence sur 2"], ["Ausgang Pin 1 ist ‚open collector‘: Pull-up (z. B. 10 kΩ) von Pin 1 nach +V", "Sortie 1 à collecteur ouvert : pull-up vers +V"], ["Hysterese: Rückkopplungswiderstand (z. B. 1 MΩ) von Pin 1 an Pin 3; Eingang über 10 kΩ", "Hystérésis : résistance de 1 vers 3"]],
  notes: [["Ein Komparator hat keinen Frequenzgang-Ausgleich – nicht als Verstärker mit Rückkopplung betreiben (dafür den LM358).", "Ne pas l’utiliser comme amplificateur."], ["Offener Kollektor: der Ausgang kann nur nach GND ziehen; das HIGH kommt vom Pull-up – so lassen sich auch andere Spannungen als +V schalten.", "Collecteur ouvert."]] };

PROJ.lm317 = { t: ["Einstellbares Netzteil (LM317)", "Alimentation réglable (LM317)"], flow: ["Vin", "LM317 + R1/R2", "Vout"], custom: "reg317",
  d: ["Zwischen OUT und ADJ hält der LM317 immer 1,25 V. Mit R1 und R2 stellst du die Ausgangsspannung ein: Vout = 1,25 · (1 + R2/R1). Sieh auch, wie viel Wärme der Regler dabei verbrät.", "Entre OUT et ADJ le LM317 maintient 1,25 V. Vout = 1,25 · (1 + R2/R1)."],
  wire: [["Pin 3 (IN) ← Vin; 330 nF nach GND dicht am Chip", "Broche 3 (IN) ← Vin ; 330 nF vers GND"], ["Pin 2 (OUT) → Ausgang; 1 µF nach GND", "Broche 2 (OUT) → sortie ; 1 µF vers GND"], ["R1 (240 Ω) zwischen OUT und ADJ (Pin 1)", "R1 (240 Ω) entre OUT et ADJ"], ["R2 von ADJ (Pin 1) nach GND (Poti = einstellbar)", "R2 de ADJ vers GND"], ["Diode 1N4007 von OUT nach IN (Schutz bei Kurzschluss am Eingang)", "Diode 1N4007 de OUT vers IN"]],
  notes: [["Der LM317 braucht ca. 2–3 V Reserve (Dropout): Vin ≥ Vout + 3 V.", "Il faut ≈ 3 V de marge."], ["Die Verlustleistung (Vin − Vout)·I wird zu Wärme – ab ca. 1–2 W ein Kühlkörper.", "La puissance dissipée chauffe : radiateur."], ["Kleine Lasten: mindestens 10 mA Mindestlast (R1 liefert 5 mA selbst).", "Charge minimale ≈ 10 mA."]] };

/* ---- Kombi-Projekte ---- */
PROJ.k_lauf = { t: ["Lauflicht: 555 → CD4017 → 10 LEDs", "Chenillard : 555 → CD4017 → 10 LED"], flow: ["NE555", "CD4017", "10 × LED"], ics: ["ne555", "cd4017"],
  d: ["Der 555 liefert den Takt, der 4017 verteilt ihn auf zehn Ausgänge. Mit R2 stellst du die Geschwindigkeit ein, mit „Schritte“ die Länge der Kette.", "Le 555 donne l’horloge, le 4017 la distribue sur dix sorties."],
  params: [PR1, { k: "R2", l: ["R2 (Tempo)", "R2 (vitesse)"], min: 1e3, max: 2e6, def: 100e3, log: 1, u: "Ω", e12: 1 }, { k: "C", l: ["C", "C"], min: 1e-9, max: 1e-3, def: 1e-6, log: 1, u: "F", e12: 1 }, { k: "n", l: ["Schritte (Qn → RESET)", "Pas"], min: 2, max: 10, def: 10, int: 1, u: "" }],
  build: function(P){ var k = c555(P.R1, P.R2, P.C, 5), n = Math.round(P.n), ph = k.T * .25, chs = [{ n: "555 OUT = CLK", c: C.amber, lo: 0, hi: 5, v: function(t){ return k.out(t, ph) * 5; } }];
    for (var i = 0; i < 4; i++) (function(i){ chs.push({ n: "Q" + i, c: [C.green, C.cyan, C.pink, C.lime][i], lo: 0, hi: 5, v: function(t){ return k.n(t, ph) % n === i ? 5 : 0; } }); })(i);
    return { span: ph + (Math.min(n, 7) + 1.4) * k.T, fmain: k.f, warn: [], ch: chs, info: [[T("Takt (555)", "Horloge"), fmt(k.f, "Hz")], [T("Ein Umlauf", "Un tour"), fmt(n * k.T, "s")]],
      live: function(ts){ var s = k.n(ts, ph) % n, a = []; for (var i = 0; i < 10; i++) a.push(i === s ? 1 : 0); return { leds: a, names: a.map(function(x, i){ return "Q" + i; }) }; } }; },
  wire: [["NE555 wie im Blinker-Projekt aufbauen (R1, R2, C, Pin 5 → 10 nF)", "NE555 comme dans le clignotant"], ["555 Pin 3 (OUT) → CD4017 Pin 14 (CLK)", "555 broche 3 → 4017 broche 14"], ["CD4017: Pin 16 → +V, Pin 8 → GND, Pin 13 (CE) → GND, Pin 15 (RESET) → GND", "4017 : 16 → +V, 8 → GND, 13 → GND, 15 → GND"], ["Q0…Q9 → 1 kΩ → LED → GND (beide ICs an derselben Versorgung, 5…12 V)", "Q0…Q9 → 1 kΩ → LED → GND"]],
  notes: [["Das Tastverhältnis des 555 stört nicht: der 4017 reagiert nur auf die steigende Flanke.", "Le rapport cyclique n’a pas d’importance."]] };

PROJ.k_uhr = { t: ["Quarzuhr-Baustein: 32,768 kHz → CD4060 → 74HC74 → 1 Hz", "Base de temps à quartz : 32,768 kHz → 1 Hz"], flow: ["Quarz 32,768 kHz", "CD4060 ÷16384", "74HC74 ÷2", "1 Hz"], ics: ["cd4060", "hc74"],
  d: ["So tickt fast jede Digitaluhr: Der Uhrenquarz schwingt mit 32 768 Hz = 2¹⁵. Der CD4060 teilt durch 2¹⁴ = 2 Hz, ein Flip-Flop halbiert noch einmal – genau 1 Hz. Wie genau, entscheidet die Quarz-Abweichung.", "Presque toutes les horloges numériques : 32 768 Hz = 2¹⁵."],
  params: [{ k: "ppm", l: ["Quarz-Abweichung", "Écart du quartz"], min: -100, max: 100, def: 20, u: "ppm", int: 1 }],
  build: function(P){ var f0 = 32768 * (1 + P.ppm * 1e-6), f2 = f0 / 16384, f1 = f2 / 2, ph = .15 / f2, span = 4;
    return { span: span, speed: 1, warn: [], ch: [{ n: "CD4060 Q14  (2 Hz)", c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, 2, .06, .5) * 5; } }, { n: "74HC74 Q  (1 Hz)", c: C.green, lo: 0, hi: 5, v: function(t){ return (cnt(t, 2, .06) % 2) * 5; } }],
      info: [[T("Quarz", "Quartz"), fmt(f0, "Hz", 6)], [T("÷ 2¹⁴ = Q14", "÷ 2¹⁴ = Q14"), fmt(f2, "Hz", 6)], [T("÷ 2 = Sekundentakt", "÷ 2 = seconde"), fmt(f1, "Hz", 6)], [T("Ganggenauigkeit", "Précision"), (P.ppm * .0864).toFixed(2).replace(".", ",") + " s / " + T("Tag", "jour")], [T("pro Monat", "par mois"), (P.ppm * .0864 * 30).toFixed(1).replace(".", ",") + " s"]],
      live: function(ts){ return { leds: [cnt(ts, 2, .06) % 2], names: ["1 Hz"] }; } }; },
  wire: [["CD4060: Pin 16 → +V, Pin 8 → GND, Pin 12 (RESET) → GND", "CD4060 : 16 → +V, 8 → GND, 12 → GND"], ["Quarz zwischen Pin 11 und Pin 10; 22 pF von Pin 11 und Pin 10 nach GND; 10 MΩ zwischen Pin 11 und Pin 9", "Quartz entre 11 et 10 ; 22 pF ; 10 MΩ entre 11 et 9"], ["Q14 (Pin 3) → CLK (Pin 3) des 74HC74", "Q14 (3) → CLK du 74HC74"], ["74HC74: /Q (Pin 6) → D (Pin 2); /PR (4) und /CLR (1) → +V; Q (Pin 5) = 1 Hz → LED", "74HC74 : /Q → D ; Q = 1 Hz"]],
  notes: [["Ein 20-ppm-Quarz geht rund 1,7 s pro Tag falsch. Genauer: temperaturkompensierte Module (DS3231, ±2 ppm).", "Un quartz à 20 ppm dérive d’environ 1,7 s par jour."]] };

PROJ.k_zaehl = { t: ["Digitaler Zähler: 555 → 74HC160 → CD4511 → 7-Segment", "Compteur numérique : 555 → 160 → 4511 → 7 seg."], flow: ["NE555", "74HC160", "CD4511", "7-Segment"], ics: ["ne555", "hc160", "cd4511"],
  d: ["Drei ICs, eine Ziffer: der 555 gibt den Takt, der 160 zählt 0…9, der 4511 macht daraus die Segmente. Die Grundschaltung jeder Anzeige.", "Trois CI, un chiffre."],
  params: [PR1, { k: "R2", l: ["R2", "R2"], min: 1e3, max: 2e6, def: 100e3, log: 1, u: "Ω", e12: 1 }, { k: "C", l: ["C", "C"], min: 1e-9, max: 1e-3, def: 4.7e-6, log: 1, u: "F", e12: 1 }],
  build: function(P){ var k = c555(P.R1, P.R2, P.C, 5), ph = k.T * .25, chs = [{ n: "555 OUT = CLK", c: C.amber, lo: 0, hi: 5, v: function(t){ return k.out(t, ph) * 5; } }];
    for (var i = 0; i < 4; i++) (function(i){ chs.push({ n: "BCD " + "ABCD"[i], c: [C.green, C.cyan, C.pink, C.lime][i], lo: 0, hi: 5, v: function(t){ return ((k.n(t, ph) % 10) >> i & 1) * 5; } }); })(i);
    return { span: ph + 12.3 * k.T, fmain: k.f, warn: [], ch: chs, info: [[T("Takt", "Horloge"), fmt(k.f, "Hz")], [T("Ein Durchlauf 0…9", "Un cycle 0…9"), fmt(10 * k.T, "s")]],
      live: function(ts){ var s = k.n(ts, ph) % 10; return { leds: [], seg: s }; } }; },
  wire: [["555 als Taktgeber (siehe Blinker), Pin 3 → 74HC160 Pin 2 (CLK)", "555 en horloge → CLK du 160"], ["74HC160: Pin 16 → +V, 8 → GND; Pin 1, 7, 9, 10 → +V; P0…P3 → GND", "74HC160 : 16 → +V, 8 → GND ; 1, 7, 9, 10 → +V"], ["Q0 (14) → A (CD4511 Pin 7), Q1 (13) → B (Pin 1), Q2 (12) → C (Pin 2), Q3 (11) → D (Pin 6)", "Q0 → A (7), Q1 → B (1), Q2 → C (2), Q3 → D (6)"], ["CD4511: Pin 16 → +V, 8 → GND; Pin 3, 4 → +V; Pin 5 → GND", "CD4511 : 16 → +V, 8 → GND"], ["a…g (Pin 13, 12, 11, 10, 9, 15, 14) → 330 Ω → Anzeige (gemeinsame Kathode an GND)", "a…g → 330 Ω → afficheur (cathode commune)"]],
  notes: [["Versorgung für alle drei ICs gemeinsam: 5 V (der 74HC160 verträgt max. 6 V, der CD4511 bis 15 V).", "Alimentation commune : 5 V."]] };

PROJ.k_daemm = { t: ["Dämmerungsschalter: LDR → LM393 → Lampe", "Interrupteur crépusculaire : LDR → LM393"], flow: ["LDR + R", "LM393 (Hysterese)", "Transistor", "Lampe"], ics: ["lm393"], custom: "dusk",
  d: ["Ein Tag in 24 Stunden: Der lichtempfindliche Widerstand (LDR) bildet mit einem Festwiderstand einen Spannungsteiler, der Komparator schaltet bei der eingestellten Schwelle die Lampe. Ohne Hysterese flackert sie bei Wolken – ziehe den Zeitregler!", "Un jour en 24 h : le LDR forme un diviseur, le comparateur allume la lampe."],
  wire: [["LDR von +5 V an Knoten X; 10 kΩ von X nach GND", "LDR de +5 V au nœud X ; 10 kΩ vers GND"], ["Knoten X → LM393 Pin 2 (IN−); Referenz (Poti) → Pin 3 (IN+)", "X → broche 2 ; référence → broche 3"], ["Pull-up 10 kΩ von Pin 1 nach +5 V; Pin 1 → 1 kΩ → Basis NPN (BC337) → Kollektor an Lampe/Relais, Emitter GND", "Pull-up 10 kΩ ; broche 1 → 1 kΩ → base NPN"], ["Hysterese: 1 MΩ von Pin 1 an Pin 3", "Hystérésis : 1 MΩ de 1 à 3"], ["Bei Relais: Freilaufdiode (1N4148) parallel zur Spule", "Relais : diode de roue libre"]],
  notes: [["Bei Dämmerung verändert sich das Licht langsam – ohne Hysterese schaltet der Komparator in dieser Zone hin und her.", "Sans hystérésis la lampe vacille."], ["Der LDR hat Reaktionszeit (ca. 20–100 ms) – das wirkt als natürlicher Filter.", "Le LDR réagit lentement."]] };

PROJ.k_prell = { t: ["Taster entprellen: RC + 74HC14 → Zähler", "Anti-rebond : RC + 74HC14"], flow: ["Taster", "R + C", "74HC14", "Zähler"], ics: ["hc14", "hc160"], custom: "bounce",
  d: ["Ein mechanischer Taster prellt: ein Druck ergibt mehrere Flanken innerhalb weniger Millisekunden. Ein Zähler zählt sie alle mit! RC-Glied plus Schmitt-Trigger macht daraus genau eine saubere Flanke. Wähle R und C – und drücke.", "Un bouton rebondit : plusieurs fronts en quelques ms."],
  wire: [["Taster zwischen Eingangsknoten und GND, 10 kΩ Pull-up nach +V", "Bouton entre le nœud et GND, pull-up 10 kΩ"], ["Von dort R in Reihe zu Pin 1 (74HC14), C von Pin 1 nach GND", "R en série vers la broche 1, C de 1 vers GND"], ["Pin 2 (Ausgang, invertiert) → CLK des Zählers (74HC160 Pin 2)", "Broche 2 → CLK du compteur"], ["74HC14: Pin 14 → +V, Pin 7 → GND; unbenutzte Eingänge → GND", "74HC14 : 14 → +V, 7 → GND"]],
  notes: [["Faustregel: RC-Zeit ≥ 5 ms (z. B. 10 kΩ · 1 µF = 10 ms) filtert fast jeden Taster.", "Règle : RC ≥ 5 ms."], ["In Software geht es auch (Wartezeit ~20 ms) – Hardware spart dem Mikrocontroller die Arbeit und funktioniert mit Interrupts.", "En logiciel aussi."]] };

PROJ.k_sirene = { t: ["Sirene: zwei 555 (LFO moduliert VCO)", "Sirène : deux 555 (LFO module VCO)"], flow: ["555 #1 (langsam)", "Pin 5 (CTRL)", "555 #2 (Ton)", "Lautsprecher"], ics: ["ne555"], custom: "siren",
  d: ["Der erste 555 schwingt langsam und verschiebt über Pin 5 die Schwellen des zweiten. So wandert die Tonhöhe auf und ab: eine Sirene. Drücke „Ton hören“ – die Frequenz folgt genau dieser Rechnung.", "Le premier 555 module via la broche 5 les seuils du second."],
  wire: [["555 #1: als langsamer Blinker (z. B. R1 = 10 kΩ, R2 = 100 kΩ, C = 4,7 µF ≈ 1,4 Hz)", "555 n°1 : clignotant lent"], ["Spannung an C1 (Pin 6/2) über 10 kΩ an Pin 5 von 555 #2", "Tension de C1 via 10 kΩ à la broche 5 du n°2"], ["555 #2: R1 = 1 kΩ, R2 = 10 kΩ, C = 10 nF (ca. 5 kHz)", "555 n°2 : R1 = 1 kΩ, R2 = 10 kΩ, C = 10 nF"], ["Pin 3 von 555 #2 → 100 µF → 8-Ω-Lautsprecher → GND (oder Piezo)", "Broche 3 → 100 µF → haut-parleur 8 Ω"], ["Beide 555: Pin 1 → GND, Pin 4 und 8 → +V", "Les deux : 1 → GND, 4 et 8 → +V"]],
  notes: [["Mit offenem Pin 5 sind die Schwellen 1/3 und 2/3. Legst du eine Spannung Vc an Pin 5, werden sie Vc/2 und Vc – die Frequenz ändert sich.", "Avec la broche 5 libre : 1/3 et 2/3."]] };

/* ---- Projekte, die erst hier ihre Rechnung bekommen ---- */
PROJ.k_daemm.params = [{ k: "t", l: ["Uhrzeit (zum Scrubben)", "Heure"], min: 0, max: 24, def: 19, u: "h" }, { k: "ref", l: ["Schwelle Vref (Poti)", "Seuil Vref"], min: .5, max: 4.5, def: 1.6, u: "V" }, { k: "h", l: ["Hysterese Δ", "Hystérésis Δ"], min: 0, max: 1.5, def: .5, u: "V" }, { k: "cl", l: ["Wolken", "Nuages"], min: 0, max: 1, def: .6, u: "" }];
PROJ.k_daemm.build = function(P){
  var N = 960, lux = [], vx = [], lamp = [], on = null, sw = 0, ll = [];
  for (var i = 0; i < N; i++){ var h = i / (N - 1) * 24, day = Math.max(0, Math.sin(Math.PI * (h - 5.5) / 13)), cl = Math.abs(Math.sin(h * 2.1) * Math.sin(h * 5.3 + 1)) * (day > 0 && day < .5 ? 1.6 : 1);
    var lx = .3 + 900 * Math.pow(day, 1.5) * (1 - P.cl * .9 * Math.min(1, cl)); lux.push(lx); ll.push(Math.log10(lx));
    var R = 10e3 * Math.pow(10 / lx, .8), v = 5 * 10e3 / (10e3 + R); vx.push(v);
    if (on === null) on = v < P.ref ? 1 : 0; var n = on; if (v < P.ref - P.h / 2) n = 1; else if (v > P.ref + P.h / 2) n = 0; if (n !== on) sw++; on = n; lamp.push(on * 5); }
  var k = Math.round(P.t / 24 * (N - 1)), hh = Math.floor(P.t), mm = Math.round((P.t - hh) * 60);
  return { span: 24, cur: P.t / 24, tl: function(d){ return d.toFixed(1).replace(".", ",") + " h / DIV"; }, speed: 1, warn: [],
    ch: [{ n: "Helligkeit (lg Lux)", c: C.amber, lo: -1, hi: 3, u: "", a: ll }, { n: "Knoten X (LDR-Teiler)", c: C.cyan, lo: 0, hi: 5, a: vx }, { n: "Vref = " + fmt(P.ref, "V") + "  ± Δ/2", c: C.violet, lo: 0, hi: 5, v: function(t){ return P.ref; } }, { n: "Lampe", c: C.green, lo: 0, hi: 5, a: lamp }],
    info: [[T("Uhrzeit", "Heure"), (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm + (lux[k] > 100 ? "  ☀️" : lux[k] > 8 ? "  ⛅" : "  🌙")], [T("Helligkeit", "Luminosité"), (lux[k] < 10 ? lux[k].toFixed(1) : Math.round(lux[k])) + " lx"], [T("Spannung am Knoten X", "Tension nœud X"), fmt(vx[k], "V")], [T("Lampe", "Lampe"), lamp[k] > 0 ? "💡 AN" : "aus"], [T("Schaltvorgänge pro Tag", "Commutations par jour"), String(sw) + (sw > 4 ? T("  (zu viele – mehr Hysterese!)", "  (trop – plus d’hystérésis)") : "")]],
    live: function(){ return { leds: [lamp[k] > 0], names: ["Lampe"] }; } }; };
delete PROJ.k_daemm.custom;

PROJ.k_prell.params = [{ k: "R", l: ["R", "R"], min: 100, max: 1e6, def: 10e3, log: 1, u: "Ω", e12: 1 }, { k: "C", l: ["C", "C"], min: 1e-9, max: 10e-6, def: 1e-6, log: 1, u: "F", e12: 1 }];
PROJ.k_prell.action = { l: ["▶ Taster drücken (neues Prellen)", "▶ Appuyer (nouveau rebond)"] };
PROJ.k_prell.onAction = function(ctx){ ctx.seed = (ctx.seed || 1) + 1; ctx.presses = (ctx.presses || 0) + 1; ctx.count = true; };
PROJ.k_prell.build = function(P, ctx){
  var seed = ctx.seed || 1, V = 5, Tt = 20e-3, dt = 4e-6, steps = Math.round(Tt / dt), t0 = 1e-3, segs = [], m = 2 + 2 * Math.floor(hash(seed) * 3), t = t0;
  for (var j = 0; j < m; j++){ var d = 50e-6 + hash(seed * 7 + j) * 650e-6; segs.push([t, t + d, j % 2 === 0 ? 0 : 1]); t += d; }
  function raw(x){ if (x < t0) return 1; for (var j = 0; j < segs.length; j++) if (x < segs[j][1]) return segs[j][2]; return 0; }
  var RC = P.R * P.C, a = Math.exp(-dt / RC), v = V, o = 0, rw = [], cv = [], ou = [], rawFalls = 0, rises = 0, pr = 1, po = 0;
  for (var i = 0; i < steps; i++){ var x = i * dt, r = raw(x); v = r * V + (v - r * V) * a; if (v > .55 * V) o = 0; else if (v < .33 * V) o = 1; if (pr === 1 && r === 0) rawFalls++; pr = r; if (po === 0 && o === 1) rises++; po = o;
    if (i % 20 === 0){ rw.push(r * V); cv.push(v); ou.push(o * V); } }
  if (ctx.count){ ctx.tot = ctx.tot || { raw: 0, clean: 0 }; ctx.tot.raw += rawFalls; ctx.tot.clean += rises; ctx.count = false; }
  var tot = ctx.tot || { raw: 0, clean: 0 };
  return { span: Tt, speed: 1, warn: rises > 1 ? [T("RC-Zeit zu kurz: der Schmitt-Trigger sieht noch mehrere Flanken – der Zähler zählt mehrfach.", "RC trop court : plusieurs fronts passent.")] : rises === 0 ? [T("RC-Zeit zu lang: der Kondensator erreicht die Schwelle in diesem Fenster nicht.", "RC trop long.")] : [],
    ch: [{ n: "Taster (roh, prellt)", c: C.red, lo: 0, hi: 5, a: rw }, { n: "C-Spannung (Pin 1)", c: C.amber, lo: 0, hi: 5, a: cv }, { n: "74HC14 Ausgang → Zähler", c: C.green, lo: 0, hi: 5, a: ou }],
    info: [[T("RC-Zeit", "Constante RC"), fmt(RC, "s")], [T("Flanken am Taster (dieser Druck)", "Fronts bouton"), String(rawFalls)], [T("Flanken am Zähler-Eingang", "Fronts vers le compteur"), String(rises)], [T("Drücke bisher", "Appuis"), String(ctx.presses || 0)], [T("Zählt ohne Entprellung", "Compte sans anti-rebond"), String(tot.raw)], [T("Zählt mit Entprellung", "Compte avec anti-rebond"), String(tot.clean)]] }; };
delete PROJ.k_prell.custom;

PROJ.k_sirene.params = [{ k: "lr1", l: ["LFO R1", "LFO R1"], min: 1e3, max: 1e6, def: 10e3, log: 1, u: "Ω", e12: 1 }, { k: "lr2", l: ["LFO R2", "LFO R2"], min: 1e3, max: 2e6, def: 100e3, log: 1, u: "Ω", e12: 1 }, { k: "lc", l: ["LFO C", "LFO C"], min: 1e-7, max: 1e-4, def: 4.7e-6, log: 1, u: "F", e12: 1 }, { k: "vr1", l: ["Ton R1", "Ton R1"], min: 1e3, max: 1e5, def: 1e3, log: 1, u: "Ω", e12: 1 }, { k: "vr2", l: ["Ton R2", "Ton R2"], min: 1e3, max: 1e6, def: 10e3, log: 1, u: "Ω", e12: 1 }, { k: "vc", l: ["Ton C", "Ton C"], min: 1e-9, max: 1e-6, def: 10e-9, log: 1, u: "F", e12: 1 }, { k: "dep", l: ["Hub (Tiefe)", "Profondeur"], min: 0, max: 1, def: .8, u: "" }];
PROJ.k_sirene.action = { l: ["🔊 Ton hören / stoppen", "🔊 Écouter / arrêter"] };
PROJ.k_sirene.build = function(P){
  var V = 9, k = c555(P.lr1, P.lr2, P.lc, V), ph = k.T * .1, span = ph + 2.2 * k.T, N = 900, fa = [], vctl = [], mn = 1e12, mx = 0;
  function ctl(t){ var nrm = (k.vc(t, ph) - V / 3) / (V / 3); return V * (.667 + P.dep * .25 * (nrm * 2 - 1)); }
  function fv(t){ var Vc = ctl(t), tH = (P.vr1 + P.vr2) * P.vc * Math.log((V - Vc / 2) / (V - Vc)), tL = P.vr2 * P.vc * Math.LN2; return 1 / (tH + tL); }
  for (var i = 0; i < N; i++){ var t = i / (N - 1) * span, f = fv(t); fa.push(f); vctl.push(ctl(t)); mn = Math.min(mn, f); mx = Math.max(mx, f); }
  return { span: span, speed: 1, warn: mx > 15000 ? [T("Töne über ca. 15 kHz hörst du kaum noch.", "Au-dessus de 15 kHz on n’entend presque plus.")] : [],
    ch: [{ n: "LFO: C-Spannung", c: C.amber, lo: 0, hi: V, v: function(t){ return k.vc(t, ph); } }, { n: "Pin 5 (Steuerspannung)", c: C.cyan, lo: 0, hi: V, a: vctl }, { n: "Tonfrequenz", c: C.green, lo: Math.max(0, mn * .9), hi: mx * 1.1 + 1, u: "Hz", a: fa }],
    info: [[T("LFO-Frequenz", "Fréquence LFO"), fmt(k.f, "Hz")], [T("Tonhöhe tiefste", "Plus grave"), fmt(mn, "Hz")], [T("Tonhöhe höchste", "Plus aiguë"), fmt(mx, "Hz")], [T("Ein Sirenen-Umlauf", "Un cycle")], ].map(function(r, i){ return i === 3 ? [r[0], fmt(k.T, "s")] : r; }),
    fAt: function(t){ return fv(ph + (t % k.T)); } }; };
delete PROJ.k_sirene.custom;

/* ---- Erweiterung: weitere ICs, Treiber und Kombi-Projekte ---- */
var PRx = function(k, lab, lo, hi, def){ return { k: k, l: [lab, lab], min: lo, max: hi, def: def, log: 1, u: "Ω", e12: 1 }; };
PROJ.cd4093 = { t: ["Tor-Oszillator mit Schmitt-NAND (CD4093)", "Oscillateur commandé (CD4093)"], flow: ["Freigabe", "CD4093 + R, C", "LED"],
  d: ["Ein NAND mit Schmitt-Trigger wird mit R und C zum Oszillator. Der zweite Eingang ist die Freigabe: HIGH lässt ihn schwingen, LOW hält ihn an. So schaltet man einen Ton oder Blinker ein und aus.", "Une porte NAND à trigger de Schmitt devient oscillateur avec R et C. La seconde entrée valide ou bloque l’oscillation."],
  opts: [{ k: "en", l: ["Freigabe (Pin 1)", "Validation (broche 1)"], o: [["1", "HIGH – schwingt"], ["0", "LOW – steht still"]], def: "1" }],
  params: [PRx("R", "R", 1e3, 2e6, 100e3), { k: "C", l: ["C", "C"], min: 1e-9, max: 1e-4, def: 1e-6, log: 1, u: "F", e12: 1 }, PV(9)],
  build: function(P){ var V = P.V, vp = .58 * V, vn = .38 * V, rc = P.R * P.C, tH = rc * Math.log((V - vn) / (V - vp)), tL = rc * Math.log(vp / vn), Tt = tH + tL, on = P.en === "1";
    function ph(t){ return ((t % Tt) + Tt) % Tt; }
    return { span: 3.2 * Tt, fmain: on ? 1 / Tt : 0, warn: on ? [] : [T("Freigabe ist LOW: Der Ausgang bleibt HIGH, der Kondensator lädt sich voll auf.", "Validation à LOW : la sortie reste haute.")],
      ch: [{ n: "Freigabe (Pin 1)", c: C.pink, lo: 0, hi: V, v: function(){ return on ? V : 0; } }, { n: "C (Pin 2)", c: C.amber, lo: 0, hi: V, v: function(t){ if (!on) return V; var x = ph(t); return x < tH ? V - (V - vn) * Math.exp(-x / rc) : vp * Math.exp(-(x - tH) / rc); } }, { n: "OUT (Pin 3)", c: C.green, lo: 0, hi: V, v: function(t){ return !on || ph(t) < tH ? V : 0; } }],
      info: [[T("Frequenz", "Fréquence"), on ? fmt(1 / Tt, "Hz") : "–"], [T("Schwellen (Hysterese)", "Seuils (hystérésis)"), fmt(vn, "V") + " / " + fmt(vp, "V")], [T("Periodendauer ≈ 0,8·R·C", "Période ≈ 0,8·R·C"), fmt(Tt, "s")]],
      live: function(ts){ return { leds: [!on || ph(ts) < tH ? 1 : 0], names: ["OUT"] }; } }; },
  wire: [["Pin 14 → +V, Pin 7 → GND", "Broche 14 → +V, 7 → GND"], ["Pin 1 = Freigabe: Schalter nach +V, 10 kΩ nach GND", "Broche 1 = validation : interrupteur vers +V, 10 kΩ vers GND"], ["R von Pin 3 (Ausgang) zurück an Pin 2", "R de la broche 3 vers la broche 2"], ["C von Pin 2 nach GND", "C de la broche 2 vers GND"], ["Pin 3 → 330 Ω → LED → GND", "Broche 3 → 330 Ω → LED → GND"], ["Unbenutzte Eingänge (Pin 5, 6, 8, 9, 12, 13) an GND", "Entrées libres à GND"]],
  notes: [["Die Schwellen streuen von Chip zu Chip stark – die Frequenz stimmt nur auf etwa ±30 %.", "Les seuils varient d’une puce à l’autre : fréquence à ±30 %."], ["Ohne Schmitt-Trigger (CD4011) schwingt diese Schaltung nicht sauber.", "Sans trigger de Schmitt (CD4011) le montage n’oscille pas proprement."]] };

PROJ.cd4040 = { t: ["Binärzähler mit 12 Stufen (CD4040)", "Compteur binaire 12 étages (CD4040)"], flow: ["Takt", "CD4040", "8 × LED"],
  d: ["Jede Stufe halbiert den Takt der vorigen. An den LEDs zählt der Baustein sichtbar binär hoch – Q1 ist das schnellste Bit.", "Chaque étage divise l’horloge par deux : les LED comptent en binaire."],
  params: [PF(4, .5, 2000)],
  build: function(P){ var f = P.f, ph = .75 / f, chs = [{ n: "CLK", c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, f, .25 / f, .5) * 5; } }];
    for (var i = 1; i <= 4; i++) (function(i){ chs.push({ n: "Q" + i + "  (÷" + Math.pow(2, i) + ")", c: [C.green, C.cyan, C.pink, C.lime][i - 1], lo: 0, hi: 5, v: function(t){ return (Math.floor(cnt(t, f, ph) / Math.pow(2, i - 1)) % 2) * 5; } }); })(i);
    return { span: 17 / f, fmain: f, warn: [], ch: chs, info: [[T("Takt", "Horloge"), fmt(f, "Hz")], ["Q8 (÷256)", fmt(f / 256, "Hz")], ["Q12 (÷4096)", fmt(f / 4096, "Hz")]],
      live: function(ts){ var c = cnt(ts, f, ph), a = []; for (var i = 0; i < 8; i++) a.push(Math.floor(c / Math.pow(2, i)) % 2); return { leds: a, names: a.map(function(x, i){ return "Q" + (i + 1); }) }; } }; },
  wire: [["Pin 16 → +V, Pin 8 → GND", "Broche 16 → +V, 8 → GND"], ["Takt an Pin 10 (CLK) – gezählt wird bei der FALLENDEN Flanke", "Horloge sur la broche 10 – comptage sur front descendant"], ["Pin 11 (RESET) → GND; HIGH setzt alle Ausgänge auf 0", "Broche 11 (RESET) → GND"], ["Q1…Q8 (Pin 9, 7, 6, 5, 3, 2, 4, 13) → 330 Ω → LED → GND", "Q1…Q8 → 330 Ω → LED → GND"]],
  notes: [["Die Stufen schalten nacheinander (Ripple-Zähler): kurze Zwischenwerte sind normal, zum Dekodieren besser einen synchronen Zähler nehmen.", "Compteur asynchrone : des états transitoires sont normaux."]] };

PROJ.hc165 = { t: ["Schalter seriell einlesen (74HC165)", "Lire des interrupteurs en série (74HC165)"], flow: ["8 Eingänge", "74HC165", "1 Datenleitung"],
  d: ["Das Gegenstück zum 74HC595: Acht Eingänge werden mit einem kurzen LOW an SH/LD übernommen und dann Bit für Bit herausgeschoben. So liest ein Mikrocontroller mit 3 Pins beliebig viele Taster.", "L’inverse du 74HC595 : huit entrées sont chargées puis décalées bit par bit."],
  params: [{ k: "b", l: ["Wert an den Eingängen H…A (0…255)", "Valeur aux entrées (0…255)"], min: 0, max: 255, def: 178, int: 1, u: "" }, PF(8, 1, 2000)],
  build: function(P){ var f = P.f, b = Math.round(P.b), per = 10 / f;
    function slot(t){ return Math.floor((((t % per) + per) % per) * f); } function fr1(t){ var x = (((t % per) + per) % per) * f; return x - Math.floor(x); }
    function bit(t){ var s = slot(t); return s < 1 || s > 8 ? 0 : (b >> (8 - s)) & 1; }
    var bin = ("00000000" + b.toString(2)).slice(-8);
    return { span: per * 1.05, fmain: f, warn: [], ch: [{ n: "SH/LD (Pin 1)", c: C.pink, lo: 0, hi: 5, v: function(t){ return slot(t) === 0 ? 0 : 5; } }, { n: "CLK (Pin 2)", c: C.amber, lo: 0, hi: 5, v: function(t){ var s = slot(t); return s >= 2 && s <= 8 && fr1(t) < .5 ? 5 : 0; } }, { n: "QH (Pin 9)", c: C.green, lo: 0, hi: 5, v: function(t){ return bit(t) * 5; } }],
      info: [[T("Wert binär (H…A)", "Valeur binaire (H…A)"), bin], [T("Wert hex", "Valeur hexa"), "0x" + ("0" + b.toString(16).toUpperCase()).slice(-2)], [T("Zeit für 8 Bit", "Durée pour 8 bits"), fmt(8 / f, "s")]],
      live: function(){ var a = []; for (var i = 7; i >= 0; i--) a.push((b >> i) & 1); return { leds: a, names: ["H", "G", "F", "E", "D", "C", "B", "A"] }; } }; },
  wire: [["Pin 16 → +V, Pin 8 → GND, Pin 15 (CLK INH) → GND", "Broche 16 → +V, 8 → GND, 15 → GND"], ["Eingänge A…H (Pin 11, 12, 13, 14, 3, 4, 5, 6): je ein Taster nach +V und 10 kΩ nach GND", "Entrées A…H : bouton vers +V et 10 kΩ vers GND"], ["Pin 1 (SH/LD): kurzer LOW-Impuls übernimmt alle acht Eingänge", "Broche 1 : impulsion LOW = chargement"], ["Pin 2 (CLK): jede steigende Flanke schiebt das nächste Bit an Pin 9 (QH)", "Broche 2 : chaque front montant décale un bit vers QH"], ["Pin 10 (SER) → GND oder an QH des nächsten 74HC165 (Kette)", "Broche 10 → GND ou QH du suivant"]],
  notes: [["Zuerst erscheint Eingang H, zuletzt A – beim Einlesen also höchstes Bit zuerst.", "L’entrée H sort en premier."]] };

PROJ.lm7805 = { t: ["Festspannungsregler 5 V (LM7805)", "Régulateur fixe 5 V (LM7805)"], flow: ["Trafo + Gleichrichter", "LM7805", "5 V"],
  d: ["Der 7805 macht aus einer welligen Eingangsspannung saubere 5 V – solange der Eingang nie unter etwa 7 V fällt. Was zu viel ist, wird Wärme. Erhöhe den Strom und sieh, wie Brumm und Hitze steigen.", "Le 7805 fournit 5 V propres tant que l’entrée reste au-dessus de 7 V. Le surplus devient chaleur."],
  opts: [{ k: "kk", l: ["Kühlung", "Refroidissement"], o: [["65", "ohne Kühlkörper (65 K/W)"], ["15", "mit Kühlkörper (15 K/W)"]], def: "65" }],
  params: [{ k: "Vin", l: ["Eingangsspannung (Spitze)", "Tension d’entrée (crête)"], min: 5, max: 30, def: 10, u: "V" }, { k: "I", l: ["Laststrom", "Courant de charge"], min: .01, max: 1.5, def: .3, log: 1, u: "A" }],
  build: function(P){ var dU = P.I / (2 * 50 * 2200e-6), w = [], Rth = +P.kk;
    function vin(t){ var x = (t * 100) % 1; return Math.max(0, P.Vin - dU * x); } function vout(t){ return clamp(vin(t) - 2, 0, 5); }
    var vmin = Math.max(0, P.Vin - dU), Pv = Math.max(0, (P.Vin - dU / 2 - 5)) * P.I, Tj = 25 + Pv * Rth;
    if (vmin < 7) w.push(T("Der Eingang fällt unter 7 V: Die 5 V brechen ein, der Brumm kommt durch.", "L’entrée passe sous 7 V : les 5 V s’effondrent."));
    if (Tj > 125) w.push(T("Sperrschicht über 125 °C: Der Regler schaltet thermisch ab – Kühlkörper oder weniger Eingangsspannung.", "Jonction au-delà de 125 °C : coupure thermique."));
    return { span: .035, warn: w, ch: [{ n: "Eingang", c: C.amber, lo: 0, hi: 32, v: vin }, { n: "Ausgang", c: C.green, lo: 0, hi: 32, v: vout }],
      info: [[T("Brummspannung am Eingang (2200 µF)", "Ondulation à l’entrée (2200 µF)"), fmt(dU, "V")], [T("Kleinste Eingangsspannung", "Tension d’entrée minimale"), fmt(vmin, "V")], [T("Verlustleistung", "Puissance dissipée"), fmt(Pv, "W")], [T("Sperrschichttemperatur", "Température de jonction"), Math.round(Tj) + " °C"]],
      live: function(){ return { leds: [vmin >= 7 && Tj <= 125 ? 1 : 0], names: ["5 V ok"] }; } }; },
  wire: [["Pin 1 (IN) an die gleichgerichtete, gesiebte Spannung", "Broche 1 (IN) sur la tension redressée et filtrée"], ["Pin 2 (GND) an Masse – auch die Kühlfahne ist Masse", "Broche 2 (GND) à la masse"], ["Pin 3 (OUT) = 5 V", "Broche 3 (OUT) = 5 V"], ["330 nF direkt am Eingang, 100 nF direkt am Ausgang (gegen Schwingen)", "330 nF à l’entrée, 100 nF à la sortie"]],
  notes: [["Faustregel: Über 1 W Verlust braucht der 7805 einen Kühlkörper. Bei großem Spannungsunterschied ist ein Schaltregler sparsamer.", "Au-delà de 1 W de pertes, dissipateur obligatoire."]] };

PROJ.lm386 = { t: ["Kleiner Audio-Verstärker (LM386)", "Petit amplificateur audio (LM386)"], flow: ["Audio-Signal", "LM386", "Lautsprecher"],
  d: ["Ein IC, ein paar Kondensatoren – fertig ist der Verstärker. Ohne Zusatz verstärkt er 20-fach, mit 10 µF zwischen Pin 1 und 8 sogar 200-fach. Dreh das Eingangssignal auf, bis er übersteuert.", "Un CI et quelques condensateurs : gain 20, ou 200 avec 10 µF entre les broches 1 et 8."],
  opts: [{ k: "g", l: ["Verstärkung", "Gain"], o: [["20", "20× (Pin 1 und 8 offen)"], ["200", "200× (10 µF zwischen Pin 1 und 8)"]], def: "20" }],
  params: [{ k: "A", l: ["Eingangsamplitude", "Amplitude d’entrée"], min: .001, max: .5, def: .05, log: 1, u: "V" }, { k: "f", l: ["Frequenz", "Fréquence"], min: 50, max: 10000, def: 440, log: 1, u: "Hz" }, PV(9)],
  build: function(P){ var g = +P.g, V = P.V, mx = V / 2 - 1, pk = Math.min(g * P.A, mx), w = [];
    if (g * P.A > mx) w.push(T("Übersteuert: Die Spitzen werden abgeschnitten, es klingt verzerrt.", "Saturation : les crêtes sont écrêtées."));
    return { span: 3 / P.f, speed: 1, warn: w, ch: [{ n: "Eingang (Pin 3)", c: C.amber, lo: -.5, hi: .5, v: function(t){ return sineAt(t, P.f, P.A); } }, { n: "Ausgang (Pin 5)", c: C.green, lo: 0, hi: V, v: function(t){ return V / 2 + clamp(g * sineAt(t, P.f, P.A), -mx, mx); } }],
      info: [[T("Verstärkung", "Gain"), g + "×  (" + (20 * Math.log10(g)).toFixed(0) + " dB)"], [T("Ruhespannung am Ausgang", "Tension de repos"), fmt(V / 2, "V")], [T("Leistung an 8 Ω", "Puissance sur 8 Ω"), fmt(pk * pk / 16, "W")]] }; },
  wire: [["Pin 6 → +V (4…12 V), Pin 4 → GND", "Broche 6 → +V, 4 → GND"], ["Signal an Pin 3 (IN+), Pin 2 (IN−) → GND", "Signal sur 3, broche 2 → GND"], ["Pin 5 (Ausgang) → 220 µF → Lautsprecher → GND", "Broche 5 → 220 µF → haut-parleur → GND"], ["100 nF + 10 Ω von Pin 5 nach GND (verhindert Schwingen)", "100 nF + 10 Ω de 5 vers GND"], ["Für 200-fach: 10 µF zwischen Pin 1 (+) und Pin 8", "Gain 200 : 10 µF entre 1 (+) et 8"]],
  notes: [["Der Ausgang liegt in Ruhe auf halber Versorgung – deshalb der Koppelkondensator vor dem Lautsprecher.", "La sortie est à Vcc/2 au repos, d’où le condensateur de liaison."]] };

PROJ.npn = { t: ["Transistor als Schalter (BC337)", "Transistor en commutation (BC337)"], flow: ["Mikrocontroller-Pin", "Basiswiderstand", "BC337", "Last"],
  d: ["Ein Pin liefert nur wenige Milliampere. Der Transistor schaltet damit eine viel größere Last. Entscheidend ist der Basiswiderstand: Ist er zu groß, schaltet der Transistor nicht voll durch und wird heiß.", "Une broche fournit peu de courant ; le transistor commute une charge bien plus grande. La résistance de base est décisive."],
  opts: [{ k: "vin", l: ["Pegel am Eingang", "Niveau d’entrée"], o: [["3.3", "3,3 V (Pi, ESP32)"], ["5", "5 V (Arduino)"]], def: "3.3" }],
  params: [PRx("Rb", "Basiswiderstand", 100, 100e3, 1e3), PRx("RL", "Last (an 12 V)", 15, 2e3, 120), PF(2, .5, 2000)],
  build: function(P){ var Vi = +P.vin, Ib = (Vi - .7) / P.Rb, Is = 11.8 / P.RL, Ic = Math.min(100 * Ib, Is), Vce = Math.max(.2, 12 - Ic * P.RL), sat = 100 * Ib >= Is, w = [], f = P.f;
    if (!sat) w.push(T("Nicht voll durchgeschaltet: Am Transistor bleiben " + fmt(Vce, "V") + " stehen, er wird heiß. Basiswiderstand kleiner wählen.", "Pas saturé : le transistor chauffe. Diminuer la résistance de base."));
    if (Ib > .016) w.push(T("Basisstrom über 16 mA – zu viel für einen Pi-Pin.", "Courant de base au-delà de 16 mA – trop pour une broche de Pi."));
    if (Is > .8) w.push(T("Über 800 mA: zu viel für den BC337, nimm einen MOSFET (z. B. IRLZ44N).", "Au-delà de 800 mA : prendre un MOSFET."));
    return { span: 3.2 / f, fmain: f, warn: w, ch: [{ n: "Eingang", c: C.amber, lo: 0, hi: 12, v: function(t){ return sq(t, f, .25 / f, .5) * Vi; } }, { n: "Kollektor", c: C.green, lo: 0, hi: 12, v: function(t){ return sq(t, f, .25 / f, .5) ? Vce : 12; } }],
      info: [[T("Basisstrom", "Courant de base"), fmt(Ib, "A")], [T("Laststrom", "Courant de charge"), fmt(Ic, "A")], [T("Reserve (hFE·Ib / Laststrom)", "Marge (hFE·Ib / charge)"), (100 * Ib / Is).toFixed(1).replace(".", ",") + "×"], [T("Verlust im Transistor (ein)", "Pertes dans le transistor"), fmt(Vce * Ic, "W")]],
      live: function(ts){ return { leds: [sq(ts, f, 0, .5)], names: [T("Last", "Charge")] }; } }; },
  wire: [["Emitter → GND (gemeinsame Masse mit dem Mikrocontroller)", "Émetteur → GND (masse commune)"], ["Pin → Basiswiderstand → Basis", "Broche → résistance de base → base"], ["Last zwischen +12 V und Kollektor", "Charge entre +12 V et collecteur"], ["Bei Relais oder Motor: Freilaufdiode 1N4007 parallel zur Last, Kathode an +12 V", "Relais ou moteur : diode de roue libre 1N4007, cathode au +12 V"]],
  notes: [["Faustregel: Basisstrom = Laststrom / 10 … 20, dann schaltet er sicher durch.", "Règle : courant de base = courant de charge / 10 … 20."]] };

PROJ.uln2003 = { t: ["7 Lasten schalten mit dem ULN2003", "Commuter 7 charges avec l’ULN2003"], flow: ["Logik-Pin", "ULN2003", "Relais / Lampe / Motor"],
  d: ["Sieben Darlington-Schalter in einem Gehäuse, die Freilaufdioden sind schon eingebaut. Ein HIGH am Eingang zieht den Ausgang nach Masse – die Last hängt zwischen Versorgung und Ausgang.", "Sept commutateurs Darlington avec diodes de roue libre intégrées. Un HIGH tire la sortie à la masse."],
  params: [{ k: "Vl", l: ["Last-Versorgung", "Alimentation de la charge"], min: 5, max: 30, def: 12, u: "V", int: 1 }, { k: "I", l: ["Laststrom", "Courant de charge"], min: .01, max: .5, def: .1, log: 1, u: "A" }, PF(1, .5, 200)],
  build: function(P){ var f = P.f, vs = .9 + .6 * P.I, w = [];
    if (P.I > .35) w.push(T("Viel Strom für einen Kanal: Mehrere Kanäle parallel schalten oder kühlen.", "Courant élevé pour un canal."));
    return { span: 3.2 / f, fmain: f, warn: w, ch: [{ n: "Eingang 1B", c: C.amber, lo: 0, hi: 30, v: function(t){ return sq(t, f, .25 / f, .5) * 5; } }, { n: "Ausgang 1C", c: C.green, lo: 0, hi: 30, v: function(t){ return sq(t, f, .25 / f, .5) ? vs : P.Vl; } }],
      info: [[T("Restspannung am Ausgang (ein)", "Tension résiduelle (actif)"), fmt(vs, "V")], [T("Spannung an der Last", "Tension sur la charge"), fmt(P.Vl - vs, "V")], [T("Verlust im Kanal (ein)", "Pertes par canal"), fmt(vs * P.I, "W")]],
      live: function(ts){ return { leds: [sq(ts, f, 0, .5)], names: [T("Last", "Charge")] }; } }; },
  wire: [["Pin 8 → GND (gemeinsame Masse mit der Logik)", "Broche 8 → GND"], ["Pin 9 (COM) → Plus der Last-Versorgung (für die Freilaufdioden)", "Broche 9 (COM) → + de la charge"], ["Eingänge Pin 1…7 direkt an die Logik-Pins (3,3 V oder 5 V)", "Entrées 1…7 directement sur les broches logiques"], ["Last zwischen Plus und Ausgang (Pin 16…10)", "Charge entre + et la sortie (16…10)"]],
  notes: [["Der ULN2003 kann nur nach Masse schalten. Er liefert selbst keinen Strom.", "L’ULN2003 commute uniquement vers la masse."], ["Gesamtstrom aller Kanäle: höchstens etwa 2,5 A, je Kanal 500 mA.", "Total ≈ 2,5 A, 500 mA par canal."]] };

PROJ.l293d = { t: ["Motor vor und zurück (L293D)", "Moteur en avant et en arrière (L293D)"], flow: ["2 Richtungs-Pins + PWM", "L293D", "Motor"],
  d: ["Eine H-Brücke polt den Motor um. Die beiden Eingänge bestimmen die Richtung, das PWM-Signal am Enable-Pin die Drehzahl. Stell Richtung und Tastgrad ein und sieh die beiden Motorklemmen.", "Un pont en H inverse le moteur : deux entrées pour le sens, le PWM sur Enable pour la vitesse."],
  opts: [{ k: "dir", l: ["Richtung", "Sens"], o: [["v", "vorwärts (1A = H, 2A = L)"], ["r", "rückwärts (1A = L, 2A = H)"], ["b", "bremsen (1A = 2A)"], ["f", "frei laufen (EN = LOW)"]], def: "v" }],
  params: [{ k: "d", l: ["Tastgrad (PWM)", "Rapport cyclique (PWM)"], min: 0, max: 100, def: 60, int: 1, u: "%" }, { k: "Vm", l: ["Motor-Versorgung", "Alimentation moteur"], min: 5, max: 24, def: 9, int: 1, u: "V" }],
  build: function(P){ var f = 1000, d = P.d / 100, Vm = P.Vm, hi = Vm - 1.4, lo = 1.2, m = P.dir, w = [];
    function en(t){ return m === "f" ? 0 : sq(t, f, .0002, d); }
    function o(t, a){ if (!en(t)) return Vm / 2; if (m === "b") return lo; return (m === "v") === a ? hi : lo; }
    if (Vm < 6) w.push(T("Im L293D gehen etwa 2,6 V verloren – bei kleiner Versorgung bleibt wenig für den Motor.", "Environ 2,6 V sont perdus dans le L293D."));
    var um = m === "v" || m === "r" ? d * (hi - lo) : 0;
    return { span: .0042, warn: w, ch: [{ n: "EN (PWM)", c: C.amber, lo: 0, hi: 24, v: function(t){ return en(t) * 5; } }, { n: "Klemme 1Y", c: C.green, lo: 0, hi: 24, v: function(t){ return o(t, true); } }, { n: "Klemme 2Y", c: C.cyan, lo: 0, hi: 24, v: function(t){ return o(t, false); } }],
      info: [[T("Mittlere Motorspannung", "Tension moyenne du moteur"), fmt(um, "V")], [T("Drehrichtung", "Sens de rotation"), m === "v" ? T("vorwärts", "avant") : m === "r" ? T("rückwärts", "arrière") : m === "b" ? T("gebremst", "freiné") : T("frei", "libre")], [T("Verlust im IC (bei 0,3 A)", "Pertes dans le CI (0,3 A)"), fmt(2.6 * .3 * (um ? d : 0), "W")]],
      live: function(){ return { leds: [m === "v" && d > 0 ? 1 : 0, m === "r" && d > 0 ? 1 : 0], names: [T("vorwärts", "avant"), T("rückwärts", "arrière")] }; } }; },
  wire: [["Pin 16 → +5 V (Logik), Pin 8 → Motor-Versorgung", "Broche 16 → +5 V, 8 → alimentation moteur"], ["Pin 4, 5, 12, 13 → GND (führen auch die Wärme ab)", "Broches 4, 5, 12, 13 → GND"], ["Pin 1 (EN) = PWM vom Mikrocontroller", "Broche 1 (EN) = PWM"], ["Pin 2 (1A) und Pin 7 (2A) = Richtung", "Broches 2 et 7 = sens"], ["Motor zwischen Pin 3 (1Y) und Pin 6 (2Y), 100 nF direkt am Motor", "Moteur entre 3 et 6, 100 nF sur le moteur"]],
  notes: [["Die Freilaufdioden stecken im L293D schon drin (das „D“). Beim L293 ohne D müssen vier Dioden außen dran.", "Les diodes sont intégrées au L293D."], ["Höchstens 600 mA je Kanal. Für größere Motoren: L298N oder ein MOSFET-Treiber.", "600 mA max. par canal."]] };

PROJ.pc817 = { t: ["Galvanisch trennen mit dem Optokoppler (PC817)", "Isolation galvanique par optocoupleur (PC817)"], flow: ["Signal A", "LED → Fototransistor", "Signal B"],
  d: ["Innen leuchtet eine LED auf einen Fototransistor – es gibt keine elektrische Verbindung zwischen Ein- und Ausgang. So bleiben zwei Stromkreise getrennt. Der Ausgang ist invertiert.", "Une LED éclaire un phototransistor : aucune liaison électrique entre entrée et sortie. La sortie est inversée."],
  opts: [{ k: "vin", l: ["Pegel am Eingang", "Niveau d’entrée"], o: [["3.3", "3,3 V"], ["5", "5 V"], ["12", "12 V"], ["24", "24 V"]], def: "5" }],
  params: [PRx("R", "Vorwiderstand der LED", 100, 22e3, 330), PRx("Rp", "Pull-up am Ausgang", 1e3, 100e3, 10e3), PF(2, .5, 2000)],
  build: function(P){ var Vi = +P.vin, If = Math.max(0, (Vi - 1.2) / P.R), Ic = Math.min(If, 5 / P.Rp), vl = Math.max(.2, 5 - Ic * P.Rp), w = [], f = P.f;
    if (vl > 1.2) w.push(T("Der Ausgang wird nicht sauber LOW (" + fmt(vl, "V") + "): Vorwiderstand kleiner oder Pull-up größer wählen.", "La sortie n’atteint pas un LOW franc."));
    if (If > .05) w.push(T("Über 50 mA durch die LED – Vorwiderstand größer wählen.", "Plus de 50 mA dans la LED."));
    return { span: 3.2 / f, fmain: f, warn: w, ch: [{ n: "Eingang", c: C.amber, lo: 0, hi: Math.max(5, Vi), v: function(t){ return sq(t, f, .25 / f, .5) * Vi; } }, { n: "Ausgang", c: C.green, lo: 0, hi: Math.max(5, Vi), v: function(t){ return sq(t, f, .25 / f, .5) ? vl : 5; } }],
      info: [[T("LED-Strom", "Courant de LED"), fmt(If, "A")], [T("Ausgangsstrom (CTR 100 %)", "Courant de sortie (CTR 100 %)"), fmt(Ic, "A")], [T("LOW-Pegel am Ausgang", "Niveau LOW en sortie"), fmt(vl, "V")]],
      live: function(ts){ return { leds: [sq(ts, f, 0, .5) ? 0 : 1], names: [T("Ausgang", "Sortie")] }; } }; },
  wire: [["Eingang → Vorwiderstand → Pin 1 (Anode); Pin 2 (Kathode) → Masse der Eingangsseite", "Entrée → résistance → broche 1 ; broche 2 → masse côté entrée"], ["Pin 4 (Kollektor) → Pull-up nach +5 V der Ausgangsseite = Ausgang", "Broche 4 → pull-up vers +5 V = sortie"], ["Pin 3 (Emitter) → Masse der Ausgangsseite", "Broche 3 → masse côté sortie"], ["Die beiden Massen NICHT verbinden – sonst ist die Trennung weg", "Ne PAS relier les deux masses"]],
  notes: [["Im Schaltplan sind beide Massen der Einfachheit halber gleich gezeichnet. In echt sind es zwei getrennte Stromkreise.", "Sur le schéma les deux masses sont dessinées identiques ; en réalité elles sont séparées."], ["Der PC817 ist langsam (einige kHz). Für schnelle Signale: 6N137.", "Le PC817 est lent ; pour des signaux rapides : 6N137."]] };

PROJ.k_motor = { t: ["Drehzahl-Steller: 555-PWM → L293D → Motor", "Variateur : PWM 555 → L293D → moteur"], flow: ["NE555 (PWM)", "L293D", "Motor"], ics: ["ne555", "l293d"],
  d: ["Der 555 erzeugt ein Rechteck mit fester Frequenz, das Poti verschiebt nur das Tastverhältnis. Der L293D schaltet damit den Motor – je länger der Impuls, desto schneller dreht er.", "Le 555 produit un signal à fréquence fixe ; le potentiomètre règle le rapport cyclique, le L293D commute le moteur."],
  params: [{ k: "pos", l: ["Poti-Stellung", "Position du potentiomètre"], min: 5, max: 95, def: 50, int: 1, u: "%" }, { k: "Vm", l: ["Motor-Versorgung", "Alimentation moteur"], min: 5, max: 24, def: 9, int: 1, u: "V" }],
  build: function(P){ var f = 1 / (.693 * 101e3 * 10e-9), d = P.pos / 100, Vm = P.Vm, hi = Vm - 1.4, lo = 1.2;
    return { span: 3.2 / f, fmain: f, warn: [], ch: [{ n: "555 OUT = EN", c: C.amber, lo: 0, hi: 24, v: function(t){ return sq(t, f, .1 / f, d) * 5; } }, { n: "Motor 1Y", c: C.green, lo: 0, hi: 24, v: function(t){ return sq(t, f, .1 / f, d) ? hi : Vm / 2; } }, { n: "Motor 2Y", c: C.cyan, lo: 0, hi: 24, v: function(t){ return sq(t, f, .1 / f, d) ? lo : Vm / 2; } }],
      info: [[T("PWM-Frequenz", "Fréquence PWM"), fmt(f, "Hz")], [T("Tastgrad", "Rapport cyclique"), P.pos + " %"], [T("Mittlere Motorspannung", "Tension moyenne du moteur"), fmt(d * (hi - lo), "V")]],
      live: function(){ return { leds: [d > .15 ? 1 : 0], names: [T("Motor dreht", "Moteur tourne")] }; } }; },
  wire: [["NE555: Pin 8 und 4 → +5 V, Pin 1 → GND, Pin 5 → 10 nF → GND", "NE555 : 8 et 4 → +5 V, 1 → GND, 5 → 10 nF → GND"], ["1 kΩ von +5 V an Pin 7; von Pin 7 über zwei Dioden (gegensinnig) an die beiden Enden des 100-kΩ-Potis", "1 kΩ de +5 V à 7 ; de 7 par deux diodes opposées aux extrémités du potentiomètre 100 kΩ"], ["Poti-Schleifer an Pin 2 und 6, von dort 10 nF nach GND", "Curseur sur 2 et 6, puis 10 nF vers GND"], ["555 Pin 3 → L293D Pin 1 (EN)", "555 broche 3 → L293D broche 1 (EN)"], ["L293D: Pin 2 (1A) → +5 V, Pin 7 (2A) → GND, Motor an Pin 3 und 6", "L293D : 2 → +5 V, 7 → GND, moteur sur 3 et 6"]],
  notes: [["Die beiden Dioden trennen Lade- und Entladeweg – deshalb bleibt die Frequenz gleich, wenn du am Poti drehst.", "Les deux diodes séparent charge et décharge : la fréquence reste constante."]] };

PROJ.k_relais = { t: ["Lauflicht mit Last: 555 → CD4017 → ULN2003 → Lampen", "Chenillard de puissance : 555 → CD4017 → ULN2003"], flow: ["NE555", "CD4017", "ULN2003", "4 × Lampe 12 V"], ics: ["ne555", "cd4017", "uln2003"],
  d: ["Der 4017 kann nur LEDs treiben. Mit dem ULN2003 dahinter schaltet dasselbe Lauflicht 12-V-Lampen, Relais oder Magnetventile. Q4 setzt den Zähler zurück – so laufen genau vier Schritte.", "Avec un ULN2003 derrière le 4017, le chenillard commute des lampes 12 V ou des relais."],
  params: [PR1, { k: "R2", l: ["R2 (Tempo)", "R2 (vitesse)"], min: 1e3, max: 2e6, def: 220e3, log: 1, u: "Ω", e12: 1 }, { k: "C", l: ["C", "C"], min: 1e-9, max: 1e-3, def: 1e-6, log: 1, u: "F", e12: 1 }],
  build: function(P){ var k = c555(P.R1, P.R2, P.C, 5), ph = k.T * .25;
    return { span: ph + 5.4 * k.T, fmain: k.f, warn: [], ch: [{ n: "555 OUT = CLK", c: C.amber, lo: 0, hi: 12, v: function(t){ return k.out(t, ph) * 5; } }, { n: "4017 Q0", c: C.green, lo: 0, hi: 12, v: function(t){ return k.n(t, ph) % 4 === 0 ? 5 : 0; } }, { n: "ULN Ausgang 1 (Lampe 1)", c: C.cyan, lo: 0, hi: 12, v: function(t){ return k.n(t, ph) % 4 === 0 ? .9 : 12; } }],
      info: [[T("Takt (555)", "Horloge"), fmt(k.f, "Hz")], [T("Ein Umlauf (4 Schritte)", "Un tour (4 pas)"), fmt(4 * k.T, "s")]],
      live: function(ts){ var s = k.n(ts, ph) % 4, a = []; for (var i = 0; i < 4; i++) a.push(i === s ? 1 : 0); return { leds: a, names: a.map(function(x, i){ return T("Lampe ", "Lampe ") + (i + 1); }) }; } }; },
  wire: [["NE555 wie im Blinker aufbauen, Pin 3 → CD4017 Pin 14 (CLK)", "NE555 comme le clignotant, broche 3 → 4017 broche 14"], ["CD4017: Pin 16 → +5 V, Pin 8 und 13 → GND; Q4 (Pin 10) → RESET (Pin 15)", "4017 : 16 → +5 V, 8 et 13 → GND ; Q4 (10) → RESET (15)"], ["Q0…Q3 (Pin 3, 2, 4, 7) → ULN2003 Eingänge Pin 1…4", "Q0…Q3 → entrées 1…4 de l’ULN2003"], ["ULN2003: Pin 8 → GND, Pin 9 → +12 V", "ULN2003 : 8 → GND, 9 → +12 V"], ["Lampen zwischen +12 V und den Ausgängen Pin 16…13", "Lampes entre +12 V et les sorties 16…13"]],
  notes: [["Logik (5 V) und Last (12 V) haben getrennte Versorgungen, aber eine gemeinsame Masse.", "Logique (5 V) et charge (12 V) : alimentations séparées, masse commune."]] };

/* ---- Erweiterung 2: weitere ICs, Dioden, MOSFET und der Baukasten ---- */
PROJ.lm324 = { t: ["Fensterkomparator (LM324)", "Comparateur à fenêtre (LM324)"], flow: ["Messspannung", "LM324 (2 von 4)", "Alarm-LED"],
  d: ["Zwei der vier Verstärker im LM324 überwachen eine Spannung: Liegt sie unter der unteren oder über der oberen Grenze, leuchtet die LED. So meldet man zum Beispiel eine Akkuspannung außerhalb des erlaubten Bereichs.", "Deux des quatre amplis du LM324 surveillent une tension : hors de la fenêtre, la LED s’allume."],
  params: [{ k: "Ul", l: ["Untere Grenze", "Seuil bas"], min: .5, max: 11, def: 4, u: "V" }, { k: "Uh", l: ["Obere Grenze", "Seuil haut"], min: .5, max: 11, def: 8, u: "V" }],
  build: function(P){ var w = [], f = .5; function vin(t){ var x = (t * f) % 1; return 12 * (x < .5 ? 2 * x : 2 - 2 * x); } function al(t){ var v = vin(t); return v > P.Uh || v < P.Ul ? 1 : 0; }
    if (P.Ul >= P.Uh) w.push(T("Die untere Grenze liegt über der oberen – es gibt kein Fenster mehr.", "Le seuil bas dépasse le seuil haut."));
    return { span: 4, speed: 1, warn: w, ch: [{ n: "Messspannung", c: C.amber, lo: 0, hi: 12, v: vin }, { n: "Alarm", c: C.red, lo: 0, hi: 12, v: function(t){ return al(t) * 10; } }],
      info: [[T("Fenster", "Fenêtre"), fmt(P.Ul, "V") + " … " + fmt(P.Uh, "V")], [T("Breite", "Largeur"), fmt(Math.max(0, P.Uh - P.Ul), "V")]],
      live: function(ts){ return { leds: [al(ts)], names: ["Alarm"] }; } }; },
  wire: [["Pin 4 → +12 V, Pin 11 → GND", "Broche 4 → +12 V, 11 → GND"], ["Messspannung an Pin 3 (IN1+) und Pin 6 (IN2−)", "Tension mesurée sur 3 et 6"], ["Obere Grenze an Pin 2 (IN1−), untere Grenze an Pin 5 (IN2+) – beide aus einem Spannungsteiler", "Seuil haut sur 2, seuil bas sur 5"], ["Pin 1 und Pin 7 je über eine Diode 1N4148 zusammenführen, 10 kΩ nach GND", "Broches 1 et 7 réunies par deux diodes 1N4148, 10 kΩ vers GND"], ["Von dort 1 kΩ → LED → GND", "Puis 1 kΩ → LED → GND"]],
  notes: [["Ein Operationsverstärker als Komparator ist langsam. Für schnelle Signale nimmt man einen echten Komparator wie den LM339.", "Un ampli op en comparateur est lent ; pour des signaux rapides, prendre un LM339."]] };

PROJ.cd4051 = { t: ["8 Sensoren an einem Eingang (CD4051)", "8 capteurs sur une entrée (CD4051)"], flow: ["8 Signale", "CD4051", "1 Ausgang"],
  d: ["Der CD4051 ist ein Drehschalter aus Silizium: Die drei Adressleitungen A, B, C wählen, welcher der acht Kanäle mit dem Ausgang verbunden ist. Hier zählt die Adresse hoch – der Ausgang zeigt nacheinander alle Sensorspannungen.", "Le CD4051 est un commutateur rotatif : A, B, C choisissent lequel des huit canaux est relié à la sortie."],
  params: [PF(2, .5, 500)],
  build: function(P){ var f = P.f, ph = .25 / f; function a(t){ return cnt(t, f, ph) % 8; }
    return { span: 9 / f, fmain: f, warn: [], ch: [{ n: "A", c: C.amber, lo: 0, hi: 5, v: function(t){ return (a(t) & 1) * 5; } }, { n: "B", c: C.cyan, lo: 0, hi: 5, v: function(t){ return ((a(t) >> 1) & 1) * 5; } }, { n: "C", c: C.pink, lo: 0, hi: 5, v: function(t){ return ((a(t) >> 2) & 1) * 5; } }, { n: "Ausgang COM", c: C.green, lo: 0, hi: 5, v: function(t){ return .4 + a(t) * .6; } }],
      info: [[T("Kanäle", "Canaux"), "8"], [T("Zeit je Kanal", "Durée par canal"), fmt(1 / f, "s")], [T("Durchgangswiderstand", "Résistance passante"), "≈ 120 Ω (5 V)"]],
      live: function(ts){ var s = a(ts), l = []; for (var i = 0; i < 8; i++) l.push(i === s ? 1 : 0); return { leds: l, names: l.map(function(x, i){ return "Y" + i; }) }; } }; },
  wire: [["Pin 16 → +V, Pin 8 → GND, Pin 7 (VEE) → GND", "Broche 16 → +V, 8 et 7 → GND"], ["Pin 6 (INH) → GND, sonst sind alle Kanäle getrennt", "Broche 6 (INH) → GND"], ["Adresse: A = Pin 11, B = Pin 10, C = Pin 9", "Adresse : A = 11, B = 10, C = 9"], ["Sensoren an Y0…Y7 (Pin 13, 14, 15, 12, 1, 5, 2, 4)", "Capteurs sur Y0…Y7"], ["Pin 3 (COM) → analoger Eingang des Mikrocontrollers", "Broche 3 (COM) → entrée analogique"]],
  notes: [["Der Schalter arbeitet in beide Richtungen – man kann auch ein Signal auf acht Ausgänge verteilen.", "Le commutateur est bidirectionnel."], ["Die Signale müssen zwischen GND und +V bleiben.", "Les signaux doivent rester entre GND et +V."]] };

PROJ.cd4066 = { t: ["Signal elektronisch schalten (CD4066)", "Commuter un signal (CD4066)"], flow: ["Signal", "CD4066", "Ausgang"],
  d: ["Vier Schalter ohne Mechanik: Ein HIGH am Steuereingang verbindet die beiden Anschlüsse, ein LOW trennt sie. Hier zerhackt das Steuersignal eine Sinusspannung.", "Quatre interrupteurs sans mécanique : un HIGH relie les deux bornes, un LOW les sépare."],
  params: [{ k: "f", l: ["Signalfrequenz", "Fréquence du signal"], min: 20, max: 5000, def: 400, log: 1, u: "Hz" }, { k: "fc", l: ["Schaltfrequenz", "Fréquence de commutation"], min: 5, max: 1000, def: 50, log: 1, u: "Hz" }],
  build: function(P){ function s(t){ return 2.5 + sineAt(t, P.f, 2); } function c(t){ return sq(t, P.fc, 0, .5); }
    return { span: 2.2 / P.fc, speed: 1, warn: [], ch: [{ n: "Signal", c: C.amber, lo: 0, hi: 5, v: s }, { n: "Steuerung", c: C.pink, lo: 0, hi: 5, v: function(t){ return c(t) * 5; } }, { n: "Ausgang", c: C.green, lo: 0, hi: 5, v: function(t){ return c(t) ? s(t) : 0; } }],
      info: [[T("Durchgangswiderstand", "Résistance passante"), "≈ 100…300 Ω"], [T("Schalter im IC", "Interrupteurs"), "4"]] }; },
  wire: [["Pin 14 → +V, Pin 7 → GND", "Broche 14 → +V, 7 → GND"], ["Schalter 1: Signal an Pin 1, Ausgang an Pin 2, Steuerung an Pin 13", "Interrupteur 1 : signal sur 1, sortie sur 2, commande sur 13"], ["100 kΩ vom Ausgang nach GND, damit er getrennt nicht in der Luft hängt", "100 kΩ de la sortie vers GND"], ["Unbenutzte Steuereingänge (Pin 5, 6, 12) → GND", "Commandes libres (5, 6, 12) → GND"]],
  notes: [["Das Signal muss zwischen GND und +V liegen. Für Audio legt man es deshalb auf halbe Versorgung.", "Le signal doit rester entre GND et +V."]] };

PROJ.hc193 = { t: ["Vorwärts-/Rückwärtszähler (74HC193)", "Compteur-décompteur (74HC193)"], flow: ["Takt", "74HC193", "4 × LED"],
  d: ["Dieser Zähler hat zwei Takteingänge: Einer zählt hoch, der andere herunter. So zählt man zum Beispiel Personen, die einen Raum betreten und verlassen.", "Ce compteur a deux entrées d’horloge : l’une compte, l’autre décompte."],
  opts: [{ k: "dir", l: ["Richtung", "Sens"], o: [["u", "vorwärts (Takt an CPU)"], ["d", "rückwärts (Takt an CPD)"]], def: "u" }], params: [PF(3, .5, 2000)],
  build: function(P){ var f = P.f, ph = .25 / f, up = P.dir === "u"; function v(t){ var c = cnt(t, f, ph) % 16; return up ? c : (16 - c) % 16; }
    var chs = [{ n: up ? "CPU (hoch)" : "CPD (runter)", c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, f, ph, .5) * 5; } }];
    for (var i = 0; i < 3; i++) (function(i){ chs.push({ n: "Q" + i, c: [C.green, C.cyan, C.pink][i], lo: 0, hi: 5, v: function(t){ return ((v(t) >> i) & 1) * 5; } }); })(i);
    return { span: 9 / f, fmain: f, warn: [], ch: chs, info: [[T("Zählbereich", "Plage"), "0…15"], [T("Takt", "Horloge"), fmt(f, "Hz")]],
      live: function(ts){ var x = v(ts), a = []; for (var i = 0; i < 4; i++) a.push((x >> i) & 1); return { leds: a, names: ["Q0", "Q1", "Q2", "Q3"] }; } }; },
  wire: [["Pin 16 → +V, Pin 8 → GND", "Broche 16 → +V, 8 → GND"], ["Pin 14 (MR) → GND, Pin 11 (/PL) → +V", "Broche 14 → GND, 11 → +V"], ["Vorwärts: Takt an Pin 5 (CPU), Pin 4 (CPD) → +V", "Comptage : horloge sur 5, broche 4 → +V"], ["Rückwärts: Takt an Pin 4 (CPD), Pin 5 (CPU) → +V", "Décomptage : horloge sur 4, broche 5 → +V"], ["Q0…Q3 (Pin 3, 2, 6, 7) → 330 Ω → LED → GND", "Q0…Q3 → 330 Ω → LED → GND"]],
  notes: [["Der jeweils unbenutzte Takteingang muss auf HIGH liegen, sonst zählt der Baustein nicht.", "L’entrée d’horloge inutilisée doit rester à HIGH."]] };

PROJ.cd4013 = { t: ["Taster als Ein/Aus-Schalter (CD4013)", "Bouton en interrupteur marche/arrêt (CD4013)"], flow: ["Taster", "CD4013", "LED"],
  d: ["Ein Tastendruck schaltet ein, der nächste wieder aus. Das Flip-Flop merkt sich den Zustand, weil sein invertierter Ausgang auf den Dateneingang zurückgeführt ist.", "Un appui allume, le suivant éteint : la bascule mémorise l’état."],
  params: [{ k: "f", l: ["Tastendrücke pro Sekunde", "Appuis par seconde"], min: .2, max: 5, def: 1, log: 1, u: "Hz" }],
  build: function(P){ var f = P.f, ph = .3 / f;
    return { span: 4.4 / f, speed: 1, warn: [], ch: [{ n: "Taster (CLK)", c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, f, ph, .25) * 5; } }, { n: "Q (Pin 1)", c: C.green, lo: 0, hi: 5, v: function(t){ return (cnt(t, f, ph) % 2) * 5; } }],
      info: [[T("Zustände", "États"), "2"], [T("Ein Wechsel alle", "Un changement toutes les"), fmt(1 / f, "s")]],
      live: function(ts){ return { leds: [cnt(ts, f, ph) % 2], names: ["LED"] }; } }; },
  wire: [["Pin 14 → +V, Pin 7 → GND", "Broche 14 → +V, 7 → GND"], ["/Q (Pin 2) → D (Pin 5)", "/Q (2) → D (5)"], ["Taster von +V an CLK (Pin 3); 10 kΩ und 100 nF von Pin 3 nach GND (entprellt)", "Bouton de +V vers CLK (3) ; 10 kΩ et 100 nF de 3 vers GND"], ["SET (Pin 6) und RESET (Pin 4) → GND", "SET (6) et RESET (4) → GND"], ["Q (Pin 1) → 330 Ω → LED → GND", "Q (1) → 330 Ω → LED → GND"]],
  notes: [["Ohne Entprellen schaltet ein einziger Druck oft mehrmals um.", "Sans anti-rebond, un seul appui bascule souvent plusieurs fois."]] };

PROJ.hc164 = { t: ["Lauflicht mit Schieberegister (74HC164)", "Chenillard à registre à décalage (74HC164)"], flow: ["Daten + Takt", "74HC164", "8 × LED"],
  d: ["Mit jedem Takt wandert der Wert am Dateneingang einen Ausgang weiter. Schiebt man eine einzelne 1 hinein, läuft ein Lichtpunkt durch alle acht LEDs.", "À chaque coup d’horloge la donnée avance d’une sortie : un seul 1 fait courir un point lumineux."],
  params: [PF(4, .5, 2000)],
  build: function(P){ var f = P.f, ph = .25 / f; function pos(t){ return (cnt(t, f, ph) + 7) % 8; } function dat(t){ return Math.floor(t * f) % 8 === 0 ? 1 : 0; }
    return { span: 9.2 / f, fmain: f, warn: [], ch: [{ n: "CLK", c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, f, ph, .5) * 5; } }, { n: "Daten A", c: C.pink, lo: 0, hi: 5, v: function(t){ return dat(t) * 5; } }, { n: "QA", c: C.green, lo: 0, hi: 5, v: function(t){ return cnt(t, f, ph) > 0 && pos(t) === 0 ? 5 : 0; } }, { n: "QB", c: C.cyan, lo: 0, hi: 5, v: function(t){ return cnt(t, f, ph) > 1 && pos(t) === 1 ? 5 : 0; } }],
      info: [[T("Takt", "Horloge"), fmt(f, "Hz")], [T("Ein Durchlauf", "Un passage"), fmt(8 / f, "s")]],
      live: function(ts){ var p = pos(ts), a = []; for (var i = 0; i < 8; i++) a.push(cnt(ts, f, ph) > i && i === p ? 1 : 0); return { leds: a, names: ["QA", "QB", "QC", "QD", "QE", "QF", "QG", "QH"] }; } }; },
  wire: [["Pin 14 → +V, Pin 7 → GND, Pin 9 (/CLR) → +V", "Broche 14 → +V, 7 → GND, 9 → +V"], ["Daten an Pin 1 (A), Pin 2 (B) → +V", "Données sur 1 (A), broche 2 (B) → +V"], ["Takt an Pin 8", "Horloge sur 8"], ["QA…QH (Pin 3, 4, 5, 6, 10, 11, 12, 13) → 330 Ω → LED → GND", "QA…QH → 330 Ω → LED → GND"]],
  notes: [["Im Unterschied zum 74HC595 hat der 74HC164 keinen Ausgangsspeicher: Man sieht das Schieben an den LEDs.", "Contrairement au 74HC595, pas de mémoire de sortie : on voit le décalage."]] };

PROJ.max232 = { t: ["Serielle Pegel wandeln (MAX232)", "Convertir les niveaux série (MAX232)"], flow: ["Mikrocontroller (0 / 5 V)", "MAX232", "RS-232 (±9 V)"],
  d: ["Ein Mikrocontroller sendet mit 0 und 5 V, die alte RS-232-Schnittstelle erwartet etwa ±9 V – und umgekehrt gepolt. Der MAX232 erzeugt diese Spannungen selbst mit vier Kondensatoren. Wähle ein Byte und sieh beide Signale.", "Le microcontrôleur émet en 0/5 V, la RS-232 attend environ ±9 V, inversés ; le MAX232 fabrique ces tensions avec quatre condensateurs."],
  params: [{ k: "b", l: ["Gesendetes Byte (0…255)", "Octet envoyé (0…255)"], min: 0, max: 255, def: 85, int: 1, u: "" }, { k: "bd", l: ["Baudrate", "Débit"], min: 300, max: 115200, def: 9600, log: 1, u: "Bd" }],
  build: function(P){ var b = Math.round(P.b), tb = 1 / P.bd; function ttl(t){ var s = Math.floor(t / tb) - 2; if (s < 0 || s > 9) return 1; if (s === 0) return 0; if (s === 9) return 1; return (b >> (s - 1)) & 1; }
    return { span: 14 * tb, speed: 1, warn: [], ch: [{ n: "TTL (Pin 11)", c: C.amber, lo: -12, hi: 12, v: function(t){ return ttl(t) * 5; } }, { n: "RS-232 (Pin 14)", c: C.green, lo: -12, hi: 12, v: function(t){ return ttl(t) ? -9 : 9; } }],
      info: [[T("Byte", "Octet"), "0x" + ("0" + b.toString(16).toUpperCase()).slice(-2) + (b >= 32 && b < 127 ? "  „" + String.fromCharCode(b) + "“" : "")], [T("Dauer eines Bits", "Durée d’un bit"), fmt(tb, "s")], [T("Dauer des ganzen Zeichens (10 Bit)", "Durée du caractère (10 bits)"), fmt(10 * tb, "s")]] }; },
  wire: [["Pin 16 → +5 V, Pin 15 → GND", "Broche 16 → +5 V, 15 → GND"], ["1 µF zwischen Pin 1 und 3, 1 µF zwischen Pin 4 und 5", "1 µF entre 1 et 3, 1 µF entre 4 et 5"], ["1 µF von Pin 2 nach GND, 1 µF von Pin 6 nach GND (Plus an GND)", "1 µF de 2 vers GND, 1 µF de 6 vers GND"], ["TX des Mikrocontrollers → Pin 11, Pin 14 → RS-232-Leitung", "TX du microcontrôleur → 11, broche 14 → ligne RS-232"], ["Empfang: RS-232-Leitung → Pin 13, Pin 12 → RX des Mikrocontrollers", "Réception : ligne → 13, broche 12 → RX"]],
  notes: [["Zuerst kommt das Startbit, dann die acht Datenbits mit dem niedrigsten zuerst, zuletzt das Stoppbit.", "D’abord le bit de start, puis huit bits de données (poids faible en premier), enfin le stop."], ["Für 3,3-V-Systeme gibt es den MAX3232.", "Pour le 3,3 V : MAX3232."]] };

PROJ.mcp3008 = { t: ["Analog messen über SPI (MCP3008)", "Mesure analogique par SPI (MCP3008)"], flow: ["Sensor-Spannung", "MCP3008", "SPI zum Raspberry Pi"],
  d: ["Der Raspberry Pi hat keinen analogen Eingang. Der MCP3008 misst die Spannung und schickt das Ergebnis als 10-Bit-Zahl über SPI. Dreh an der Spannung und sieh, welche Bits auf der Datenleitung erscheinen.", "Le Raspberry Pi n’a pas d’entrée analogique : le MCP3008 mesure et envoie un nombre de 10 bits par SPI."],
  params: [{ k: "U", l: ["Spannung am Kanal 0", "Tension sur le canal 0"], min: 0, max: 3.3, def: 1.65, u: "V" }],
  build: function(P){ var code = Math.min(1023, Math.round(P.U / 3.3 * 1023)), f = 1000; function s(t){ return Math.floor(t * f) - 1; } function fr1(t){ return (t * f) % 1; }
    return { span: 19.5 / f, speed: 1, warn: [], ch: [{ n: "CS", c: C.pink, lo: 0, hi: 3.3, v: function(t){ var x = s(t); return x >= 0 && x < 17 ? 0 : 3.3; } }, { n: "CLK", c: C.amber, lo: 0, hi: 3.3, v: function(t){ var x = s(t); return x >= 0 && x < 17 && fr1(t) > .5 ? 3.3 : 0; } }, { n: "DOUT (MISO)", c: C.green, lo: 0, hi: 3.3, v: function(t){ var x = s(t); return x >= 7 && x < 17 ? ((code >> (16 - x)) & 1) * 3.3 : 0; } }],
      info: [[T("Messwert", "Valeur"), code + " / 1023"], [T("Binär", "Binaire"), ("0000000000" + code.toString(2)).slice(-10)], [T("Auflösung", "Résolution"), "3,2 mV"], [T("Zurückgerechnet", "Reconverti"), fmt(code * 3.3 / 1023, "V")]] }; },
  wire: [["Pin 16 (VDD) und Pin 15 (VREF) → 3,3 V", "Broches 16 et 15 → 3,3 V"], ["Pin 14 (AGND) und Pin 9 (DGND) → GND", "Broches 14 et 9 → GND"], ["Pin 13 (CLK) → SCLK, Pin 12 (DOUT) → MISO, Pin 11 (DIN) → MOSI, Pin 10 (CS) → CE0", "13 → SCLK, 12 → MISO, 11 → MOSI, 10 → CE0"], ["Sensor an Pin 1 (CH0); bis zu acht Sensoren an Pin 1…8", "Capteur sur la broche 1 (CH0)"]],
  notes: [["Die Messspannung darf nie über VREF liegen. Für 5-V-Sensoren einen Spannungsteiler davor setzen.", "La tension mesurée ne doit jamais dépasser VREF."]] };

PROJ.tl431 = { t: ["Einstellbare Referenz (TL431)", "Référence réglable (TL431)"], flow: ["Eingang", "Vorwiderstand + TL431", "stabile Spannung"],
  d: ["Der TL431 verhält sich wie eine einstellbare Z-Diode: Er leitet so viel Strom ab, dass an seinem Referenz-Pin genau 2,5 V liegen. Mit zwei Widerständen stellst du jede Spannung darüber ein.", "Le TL431 se comporte comme une diode Zener réglable : il maintient 2,5 V sur sa broche de référence."],
  params: [PRx("R1", "R1 (oben)", 1e3, 100e3, 10e3), PRx("R2", "R2 (unten)", 1e3, 100e3, 10e3), { k: "Vin", l: ["Eingangsspannung", "Tension d’entrée"], min: 4, max: 30, def: 12, u: "V" }],
  build: function(P){ var vs = 2.495 * (1 + P.R1 / P.R2), w = [], vo = Math.min(vs, P.Vin - .5);
    if (P.Vin < vs + 1) w.push(T("Der Eingang ist zu niedrig: Die Spannung kann nicht mehr geregelt werden.", "Entrée trop basse : la régulation n’est plus possible."));
    if (vs > 36) w.push(T("Über 36 V verträgt der TL431 nicht.", "Le TL431 ne supporte pas plus de 36 V."));
    return { span: .04, warn: w, ch: [{ n: "Eingang", c: C.amber, lo: 0, hi: 32, v: function(t){ return P.Vin + sineAt(t, 100, .8); } }, { n: "Ausgang", c: C.green, lo: 0, hi: 32, v: function(t){ return Math.min(vs, P.Vin + sineAt(t, 100, .8) - .5); } }],
      info: [[T("Ausgang = 2,495 V · (1 + R1/R2)", "Sortie = 2,495 V · (1 + R1/R2)"), fmt(vo, "V")], [T("Strom durch den Vorwiderstand (1 kΩ)", "Courant dans la résistance série (1 kΩ)"), fmt(Math.max(0, (P.Vin - vo) / 1000), "A")]],
      live: function(){ return { leds: [P.Vin >= vs + 1 ? 1 : 0], names: [T("geregelt", "régulé")] }; } }; },
  wire: [["Eingang → Vorwiderstand 1 kΩ → Kathode = Ausgang", "Entrée → 1 kΩ → cathode = sortie"], ["R1 von der Kathode zum Referenz-Pin", "R1 de la cathode à la broche de référence"], ["R2 vom Referenz-Pin nach GND", "R2 de la référence vers GND"], ["Anode → GND", "Anode → GND"]],
  notes: [["Durch den TL431 muss mindestens 1 mA fließen, sonst regelt er nicht.", "Au moins 1 mA doit traverser le TL431."], ["Verbindest du Referenz und Kathode direkt, erhältst du genau 2,5 V.", "Référence reliée à la cathode : exactement 2,5 V."]] };

PROJ.icl7660 = { t: ["Negative Spannung erzeugen (ICL7660)", "Créer une tension négative (ICL7660)"], flow: ["+5 V", "ICL7660 + 2 Kondensatoren", "−5 V"],
  d: ["Aus plus wird minus: Der Baustein lädt einen Kondensator auf und klemmt ihn dann umgekehrt an den Ausgang. So bekommt ein Operationsverstärker seine negative Versorgung, ganz ohne Spule.", "Le composant charge un condensateur puis le retourne sur la sortie : une tension négative sans bobine."],
  params: [{ k: "V", l: ["Eingangsspannung", "Tension d’entrée"], min: 3, max: 10, def: 5, u: "V" }, { k: "I", l: ["Laststrom", "Courant de charge"], min: .0005, max: .04, def: .005, log: 1, u: "A" }],
  build: function(P){ var vo = -(P.V - P.I * 55), rp = P.I / (2 * 10e3 * 10e-6), w = [];
    if (P.I > .02) w.push(T("Viel Last: Die Ausgangsspannung bricht deutlich ein. Der ICL7660 ist nur für wenige Milliampere gedacht.", "Charge élevée : la tension de sortie chute nettement."));
    return { span: .0006, warn: w, ch: [{ n: "Eingang", c: C.amber, lo: -12, hi: 12, v: function(){ return P.V; } }, { n: "Ausgang", c: C.green, lo: -12, hi: 12, v: function(t){ return vo + rp * (((t * 10e3) % 1) - .5) * 20; } }],
      info: [[T("Ausgangsspannung", "Tension de sortie"), fmt(vo, "V")], [T("Innenwiderstand", "Résistance interne"), "≈ 55 Ω"], [T("Taktfrequenz", "Fréquence interne"), "≈ 10 kHz"]] }; },
  wire: [["Pin 8 → +V, Pin 3 → GND", "Broche 8 → +V, 3 → GND"], ["10 µF zwischen Pin 2 (Plus) und Pin 4", "10 µF entre 2 (+) et 4"], ["10 µF von GND (Plus) nach Pin 5 – dort liegt die negative Spannung", "10 µF de GND (+) vers 5 : tension négative"], ["Unter 3,5 V Eingang: Pin 6 (LV) → GND", "Sous 3,5 V : broche 6 → GND"]],
  notes: [["Beim Ausgangskondensator liegt der Pluspol an Masse – der Ausgang ist ja negativer als Masse.", "Le + du condensateur de sortie va à la masse."]] };

PROJ.lm35 = { t: ["Temperatur messen (LM35)", "Mesurer la température (LM35)"], flow: ["LM35", "10 mV pro °C", "Analog-Eingang"],
  d: ["Der LM35 gibt genau 10 mV pro Grad Celsius aus: 25 °C sind 250 mV. Ein Analog-Eingang macht daraus eine Zahl. Je kleiner die Referenzspannung, desto feiner die Auflösung.", "Le LM35 délivre 10 mV par degré : 25 °C donnent 250 mV."],
  opts: [{ k: "ref", l: ["Referenz des Analog-Eingangs", "Référence de l’entrée analogique"], o: [["5", "5 V (Arduino)"], ["3.3", "3,3 V"], ["1.1", "1,1 V (interne Referenz)"]], def: "5" }],
  params: [{ k: "T", l: ["Temperatur", "Température"], min: 0, max: 100, def: 25, u: "°C" }],
  build: function(P){ var u = P.T * .01, ref = +P.ref, code = Math.min(1023, Math.round(u / ref * 1023)), w = [];
    if (u > ref) w.push(T("Die Spannung liegt über der Referenz – der Messwert bleibt bei 1023 stehen.", "La tension dépasse la référence."));
    return { span: 2, speed: 1, warn: w, ch: [{ n: "Ausgang", c: C.green, lo: 0, hi: 1.1, v: function(t){ return u + .002 * Math.sin(t * 40); } }],
      info: [[T("Spannung", "Tension"), fmt(u, "V")], [T("Wert am 10-Bit-Eingang", "Valeur sur 10 bits"), String(code)], [T("Auflösung", "Résolution"), (ref / 1023 / .01).toFixed(2).replace(".", ",") + " °C"]] }; },
  wire: [["Flache Seite zu dir: links +V (4…30 V), Mitte Ausgang, rechts GND", "Face plate vers toi : gauche +V, milieu sortie, droite GND"], ["Ausgang → Analog-Eingang", "Sortie → entrée analogique"], ["100 nF zwischen +V und GND dicht am Sensor", "100 nF entre +V et GND près du capteur"]],
  notes: [["Der TMP36 arbeitet ähnlich, hat aber 500 mV Versatz und misst deshalb auch unter 0 °C.", "Le TMP36 est similaire avec 500 mV de décalage : il mesure aussi sous 0 °C."]] };

PROJ.irlz44n = { t: ["Große Last dimmen mit MOSFET (IRLZ44N)", "Varier une forte charge par MOSFET (IRLZ44N)"], flow: ["PWM-Pin", "IRLZ44N", "LED-Streifen / Motor"],
  d: ["Ein Logic-Level-MOSFET schaltet viele Ampere und braucht dafür fast keinen Steuerstrom. Entscheidend ist die Gate-Spannung: Mit 3,3 V leitet er schlechter und wird wärmer als mit 5 V.", "Un MOSFET logic-level commute de nombreux ampères presque sans courant de commande ; la tension de grille est décisive."],
  opts: [{ k: "vg", l: ["Gate-Spannung", "Tension de grille"], o: [["3.3", "3,3 V"], ["5", "5 V"], ["10", "10 V"]], def: "5" }],
  params: [{ k: "d", l: ["Tastgrad (PWM)", "Rapport cyclique (PWM)"], min: 0, max: 100, def: 50, int: 1, u: "%" }, { k: "I", l: ["Laststrom", "Courant de charge"], min: .1, max: 20, def: 3, log: 1, u: "A" }],
  build: function(P){ var r = P.vg === "3.3" ? .06 : P.vg === "5" ? .028 : .022, d = P.d / 100, Pv = P.I * P.I * r * d, Tj = 25 + Pv * 62, w = [], f = 500;
    if (P.vg === "3.3") w.push(T("Mit 3,3 V am Gate ist der IRLZ44N nicht voll durchgesteuert – für wenige Ampere reicht es, für mehr besser 5 V.", "Avec 3,3 V sur la grille le IRLZ44N n’est pas pleinement passant."));
    if (Tj > 150) w.push(T("Ohne Kühlkörper zu heiß (über 150 °C).", "Trop chaud sans dissipateur (plus de 150 °C)."));
    return { span: 3.2 / f, warn: w, ch: [{ n: "Gate (PWM)", c: C.amber, lo: 0, hi: 12, v: function(t){ return sq(t, f, .0002, d) * +P.vg; } }, { n: "Drain", c: C.green, lo: 0, hi: 12, v: function(t){ return sq(t, f, .0002, d) ? P.I * r : 12; } }],
      info: [[T("Widerstand im eingeschalteten Zustand", "Résistance à l’état passant"), fmt(r, "Ω")], [T("Verlustleistung", "Puissance dissipée"), fmt(Pv, "W")], [T("Temperatur ohne Kühlkörper", "Température sans dissipateur"), Math.round(Tj) + " °C"], [T("Mittlere Leistung an der Last (12 V)", "Puissance moyenne sur la charge (12 V)"), fmt(12 * P.I * d, "W")]],
      live: function(){ return { leds: [d > 0 ? 1 : 0], names: [T("Last", "Charge")] }; } }; },
  wire: [["Source → GND (gemeinsame Masse mit dem Mikrocontroller)", "Source → GND (masse commune)"], ["PWM-Pin → 220 Ω → Gate", "Broche PWM → 220 Ω → grille"], ["10 kΩ vom Gate nach GND (hält den MOSFET beim Einschalten aus)", "10 kΩ de la grille vers GND"], ["Last zwischen +12 V und Drain", "Charge entre +12 V et drain"], ["Bei Motoren: Freilaufdiode parallel zur Last", "Moteurs : diode de roue libre en parallèle"]],
  notes: [["Ein IRF540 ohne „L“ braucht 10 V am Gate und taugt nicht für 3,3- oder 5-V-Pins.", "Un IRF540 sans « L » exige 10 V sur la grille."]] };

PROJ.gleich = { t: ["Brückengleichrichter mit Siebkondensator", "Pont redresseur avec condensateur de filtrage"], flow: ["Trafo (Wechselspannung)", "4 Dioden", "Elko", "Gleichspannung"],
  d: ["Vier Dioden klappen die negative Halbwelle nach oben. Der Kondensator füllt die Lücken dazwischen. Je größer der Strom und je kleiner der Kondensator, desto stärker brummt die Gleichspannung.", "Quatre diodes replient l’alternance négative ; le condensateur comble les creux."],
  params: [{ k: "U", l: ["Trafo-Spannung (effektiv)", "Tension du transfo (efficace)"], min: 6, max: 24, def: 12, u: "V" }, { k: "C", l: ["Siebkondensator", "Condensateur de filtrage"], min: 100e-6, max: 10000e-6, def: 1000e-6, log: 1, u: "F", e12: 1 }, { k: "I", l: ["Laststrom", "Courant de charge"], min: .01, max: 3, def: .5, log: 1, u: "A" }],
  build: function(P){ var pk = P.U * Math.SQRT2, top = pk - 1.4, dU = Math.min(top, P.I / (100 * P.C));
    function ac(t){ return sineAt(t, 50, pk); } function dc(t){ var x = ((t * 100 - .5) % 1 + 1) % 1; return Math.max(Math.abs(ac(t)) - 1.4, top - dU * x); }
    return { span: .045, warn: dU > top * .3 ? [T("Starker Brumm: Der Kondensator ist für diesen Strom zu klein.", "Forte ondulation : condensateur trop petit pour ce courant.")] : [], ch: [{ n: "Wechselspannung", c: C.amber, lo: -36, hi: 36, v: ac }, { n: "Gleichspannung", c: C.green, lo: -36, hi: 36, v: dc }],
      info: [[T("Spitzenspannung am Elko", "Tension crête"), fmt(top, "V")], [T("Brummspannung", "Ondulation"), fmt(dU, "V")], [T("Mittlere Gleichspannung", "Tension continue moyenne"), fmt(top - dU / 2, "V")], [T("Verlust in den Dioden", "Pertes dans les diodes"), fmt(1.4 * P.I, "W")]] }; },
  wire: [["Die beiden Trafo-Anschlüsse an die zwei Wechselspannungs-Punkte der Brücke", "Les deux fils du transfo sur les deux points alternatifs du pont"], ["Plus: dort, wo zwei Kathoden (Ringe) zusammenkommen", "Plus : là où deux cathodes se rejoignent"], ["Minus: dort, wo zwei Anoden zusammenkommen", "Moins : là où deux anodes se rejoignent"], ["Elko zwischen Plus und Minus – Polung beachten", "Condensateur entre + et − : attention à la polarité"]],
  notes: [["Faustregel: etwa 1000 µF je Ampere Laststrom.", "Règle : environ 1000 µF par ampère."], ["Die Leerlaufspannung liegt beim 1,41-Fachen der Trafo-Spannung – der Elko muss das aushalten.", "À vide la tension atteint 1,41 fois celle du transfo."]] };

PROJ.zdiode = { t: ["Spannung stabilisieren mit Z-Diode", "Stabiliser une tension par diode Zener"], flow: ["Eingang", "Vorwiderstand", "Z-Diode", "Last"],
  d: ["Die Z-Diode leitet ab ihrer Z-Spannung und hält sie fest. Der Vorwiderstand nimmt den Rest auf. Zieht die Last zu viel Strom, bleibt für die Diode nichts übrig und die Spannung bricht ein.", "La diode Zener conduit dès sa tension et la maintient ; si la charge tire trop, la tension s’effondre."],
  opts: [{ k: "uz", l: ["Z-Spannung", "Tension Zener"], o: [["3.3", "3,3 V"], ["5.1", "5,1 V"], ["9.1", "9,1 V"], ["12", "12 V"]], def: "5.1" }],
  params: [{ k: "Vin", l: ["Eingangsspannung", "Tension d’entrée"], min: 5, max: 24, def: 12, u: "V" }, PRx("R", "Vorwiderstand", 47, 10e3, 470), { k: "IL", l: ["Laststrom", "Courant de charge"], min: .0005, max: .05, def: .005, log: 1, u: "A" }],
  build: function(P){ var uz = +P.uz, w = []; function vo(vi){ return Math.max(0, Math.min(uz, vi - P.R * P.IL)); }
    var iz = (P.Vin - uz) / P.R - P.IL, pz = Math.max(0, iz) * uz;
    if (iz < .001) w.push(T("Für die Z-Diode bleibt kein Strom übrig: Die Spannung bricht ein. Vorwiderstand kleiner wählen.", "Plus de courant pour la Zener : la tension s’effondre."));
    if (pz > .5) w.push(T("Über 0,5 W an der Z-Diode – zu viel für eine kleine Bauform.", "Plus de 0,5 W dans la Zener."));
    return { span: .04, warn: w, ch: [{ n: "Eingang", c: C.amber, lo: 0, hi: 26, v: function(t){ return P.Vin + sineAt(t, 100, 1); } }, { n: "Ausgang", c: C.green, lo: 0, hi: 26, v: function(t){ return vo(P.Vin + sineAt(t, 100, 1)); } }],
      info: [[T("Ausgangsspannung", "Tension de sortie"), fmt(vo(P.Vin), "V")], [T("Strom durch die Z-Diode", "Courant dans la Zener"), fmt(Math.max(0, iz), "A")], [T("Verlust in der Z-Diode", "Pertes dans la Zener"), fmt(pz, "W")], [T("Verlust im Vorwiderstand", "Pertes dans la résistance"), fmt(Math.pow(P.Vin - vo(P.Vin), 2) / P.R, "W")]] }; },
  wire: [["Eingang → Vorwiderstand → Ausgang", "Entrée → résistance → sortie"], ["Z-Diode vom Ausgang nach GND, Kathode (Ring) am Ausgang", "Zener de la sortie vers GND, cathode côté sortie"], ["Last parallel zur Z-Diode", "Charge en parallèle sur la Zener"]],
  notes: [["Die Z-Diode wird in Sperrrichtung betrieben – deshalb zeigt der Ring nach Plus.", "La Zener travaille en inverse."], ["Für mehr als ein paar Milliampere ist ein Spannungsregler die bessere Wahl.", "Au-delà de quelques milliampères, préférer un régulateur."]] };

/* ---- Erweiterung 3: weitere Logik- und Analog-ICs ---- */
PROJ.hc245 = { t: ["Datenbus in beide Richtungen (74HC245)", "Bus de données bidirectionnel (74HC245)"], flow: ["Seite A", "74HC245", "Seite B"],
  d: ["Acht Treiber, die in beide Richtungen arbeiten: DIR bestimmt, ob A nach B oder B nach A geht. Mit /OE auf HIGH ist der Baustein abgekoppelt – beide Seiten sind dann frei.", "Huit tampons bidirectionnels : DIR choisit A→B ou B→A ; /OE à HIGH déconnecte tout."],
  opts: [{ k: "dir", l: ["Richtung (DIR)", "Sens (DIR)"], o: [["ab", "A → B (DIR = HIGH)"], ["ba", "B → A (DIR = LOW)"]], def: "ab" }, { k: "oe", l: ["Freigabe (/OE)", "Validation (/OE)"], o: [["0", "LOW – aktiv"], ["1", "HIGH – abgekoppelt"]], def: "0" }],
  params: [PF(2, .5, 2000)],
  build: function(P){ var f = P.f, on = P.oe === "0", ab = P.dir === "ab";
    function inp(t){ return sq(t, f, .25 / f, .5) * 5; }
    return { span: 3.2 / f, fmain: f, warn: on ? [] : [T("/OE ist HIGH: Die Ausgänge sind hochohmig, das Signal kommt nicht durch.", "/OE à HIGH : sorties en haute impédance.")],
      ch: [{ n: ab ? "A1 (Eingang)" : "B1 (Eingang)", c: C.amber, lo: 0, hi: 5, v: inp }, { n: ab ? "B1 (Ausgang)" : "A1 (Ausgang)", c: C.green, lo: 0, hi: 5, v: function(t){ return on ? inp(t) : 2.5 + .15 * Math.sin(t * 900); } }],
      info: [[T("Richtung", "Sens"), ab ? "A → B" : "B → A"], [T("Ausgänge", "Sorties"), on ? T("aktiv", "actives") : T("hochohmig (Z)", "haute impédance (Z)")], [T("Strom je Ausgang", "Courant par sortie"), "± 6 mA (HC)"]],
      live: function(ts){ return { leds: [on && sq(ts, f, 0, .5) ? 1 : 0], names: [ab ? "B1" : "A1"] }; } }; },
  wire: [["Pin 20 → +V, Pin 10 → GND", "Broche 20 → +V, 10 → GND"], ["Pin 1 (DIR): HIGH = A → B, LOW = B → A", "Broche 1 (DIR) : HIGH = A → B, LOW = B → A"], ["Pin 19 (/OE) → GND zum Einschalten", "Broche 19 (/OE) → GND pour activer"], ["A1…A8 = Pin 2…9, B1…B8 = Pin 18…11", "A1…A8 = 2…9, B1…B8 = 18…11"]],
  notes: [["Mit einem 74HCT245 an 5 V lassen sich 3,3-V-Signale sicher auf 5-V-Pegel heben.", "Un 74HCT245 sous 5 V élève proprement des signaux 3,3 V."], ["DIR nie umschalten, während beide Seiten treiben – sonst kämpfen zwei Ausgänge gegeneinander.", "Ne jamais changer DIR pendant que les deux côtés pilotent."]] };

PROJ.hc573 = { t: ["Daten festhalten mit dem Latch (74HC573)", "Mémoriser des données avec un latch (74HC573)"], flow: ["8 Datenleitungen", "74HC573", "8 Ausgänge"],
  d: ["Solange LE (Latch Enable) HIGH ist, laufen die Eingänge direkt durch. Fällt LE auf LOW, frieren die Ausgänge den letzten Wert ein – egal, was danach an den Eingängen passiert.", "Tant que LE est à HIGH, les entrées passent ; quand LE tombe à LOW, les sorties gardent la dernière valeur."],
  params: [PF(4, .5, 2000), { k: "le", l: ["Anteil LE = HIGH", "Part LE = HIGH"], min: 10, max: 90, def: 40, int: 1, u: "%" }],
  build: function(P){ var f = P.f, per = 2 / (f * .5), d = P.le / 100;
    function D(t){ return sq(t, f, .13 / f, .5); } function LE(t){ return ((t / per) % 1) < d ? 1 : 0; }
    function Q(t){ if (LE(t)) return D(t); var t0 = Math.floor(t / per) * per + d * per - 1e-6; return D(t0); }
    return { span: 2.2 * per, speed: 1, warn: [], ch: [{ n: "D0", c: C.amber, lo: 0, hi: 5, v: function(t){ return D(t) * 5; } }, { n: "LE (Pin 11)", c: C.pink, lo: 0, hi: 5, v: function(t){ return LE(t) * 5; } }, { n: "Q0", c: C.green, lo: 0, hi: 5, v: function(t){ return Q(t) * 5; } }],
      info: [[T("LE = HIGH", "LE = HIGH"), T("durchlässig", "transparent")], [T("LE = LOW", "LE = LOW"), T("gespeichert", "mémorisé")]],
      live: function(ts){ return { leds: [Q(ts), LE(ts)], names: ["Q0", "LE"] }; } }; },
  wire: [["Pin 20 → +V, Pin 10 → GND", "Broche 20 → +V, 10 → GND"], ["Pin 1 (/OE) → GND", "Broche 1 (/OE) → GND"], ["D0…D7 = Pin 2…9, Q0…Q7 = Pin 19…12", "D0…D7 = 2…9, Q0…Q7 = 19…12"], ["Pin 11 (LE) = Speichersignal", "Broche 11 (LE) = signal de mémorisation"]],
  notes: [["Eingänge auf der einen, Ausgänge auf der anderen Seite – deshalb ist der 573 auf Platinen beliebter als der ältere 373.", "Entrées d’un côté, sorties de l’autre : d’où la préférence pour le 573."], ["Ein Latch reagiert auf den Pegel, ein Flip-Flop auf die Flanke.", "Un latch réagit au niveau, une bascule au front."]] };

PROJ.cd4094 = { t: ["Schieberegister mit Übernahme (CD4094)", "Registre à décalage avec validation (CD4094)"], flow: ["Daten + Takt + Strobe", "CD4094", "8 × LED"],
  d: ["Wie beim 74HC595 werden acht Bits nacheinander hineingeschoben. Erst ein Impuls an STROBE übergibt sie gleichzeitig an die Ausgänge – so flackert beim Schieben nichts. Der CD4094 läuft bis 15 V.", "Comme le 74HC595 : huit bits entrent l’un après l’autre, puis STROBE les présente ensemble. Jusqu’à 15 V."],
  params: [{ k: "b", l: ["Wert (0…255)", "Valeur (0…255)"], min: 0, max: 255, def: 165, int: 1, u: "" }, PF(8, 1, 2000)],
  build: function(P){ var f = P.f, b = Math.round(P.b), per = 10 / f;
    function slot(t){ return Math.floor((((t % per) + per) % per) * f); } function fr1(t){ var x = (((t % per) + per) % per) * f; return x - Math.floor(x); }
    return { span: per * 1.05, fmain: f, warn: [], ch: [{ n: "DATA (Pin 2)", c: C.pink, lo: 0, hi: 5, v: function(t){ var s = slot(t); return s >= 0 && s < 8 ? ((b >> (7 - s)) & 1) * 5 : 0; } }, { n: "CLK (Pin 3)", c: C.amber, lo: 0, hi: 5, v: function(t){ var s = slot(t); return s < 8 && fr1(t) > .5 ? 5 : 0; } }, { n: "STROBE (Pin 1)", c: C.green, lo: 0, hi: 5, v: function(t){ return slot(t) === 8 ? 5 : 0; } }],
      info: [[T("Wert binär", "Valeur binaire"), ("00000000" + b.toString(2)).slice(-8)], [T("Versorgung", "Alimentation"), "3…15 V"]],
      live: function(){ var a = []; for (var i = 7; i >= 0; i--) a.push((b >> i) & 1); return { leds: a, names: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"] }; } }; },
  wire: [["Pin 16 → +V, Pin 8 → GND, Pin 15 (OE) → +V", "Broche 16 → +V, 8 → GND, 15 → +V"], ["Pin 2 = DATA, Pin 3 = CLK, Pin 1 = STROBE", "Broche 2 = DATA, 3 = CLK, 1 = STROBE"], ["Q1…Q8 (Pin 4, 5, 6, 7, 14, 13, 12, 11) → 1 kΩ → LED → GND", "Q1…Q8 → 1 kΩ → LED → GND"], ["Zum Verketten: Pin 9 (QS) an DATA des nächsten CD4094", "En cascade : broche 9 (QS) vers DATA du suivant"]],
  notes: [["Mit OE = LOW sind alle Ausgänge abgeschaltet – praktisch, um beim Einschalten nichts zufällig anzusteuern.", "OE à LOW coupe toutes les sorties."]] };

PROJ.cd4020 = { t: ["Lange Zeiten mit dem 14-Stufen-Teiler (CD4020)", "Longues durées avec le diviseur 14 étages (CD4020)"], flow: ["Takt", "CD4020", "Q14 = ÷16384"],
  d: ["Vierzehn Teilerstufen hintereinander. Aus einem schnellen Takt werden sehr langsame Signale – mit 16 384 Hz am Eingang blinkt Q14 genau einmal pro Sekunde. Die Ausgänge Q2 und Q3 fehlen bei diesem Typ.", "Quatorze étages de division : avec 16 384 Hz en entrée, Q14 change une fois par seconde. Q2 et Q3 ne sont pas sortis."],
  params: [PF(4, .5, 2000)],
  build: function(P){ var f = P.f, ph = .75 / f, st = [1, 4, 5, 6, 7, 8, 9, 10], chs = [{ n: "CLK", c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, f, .25 / f, .5) * 5; } }];
    [1, 4].forEach(function(n, i){ chs.push({ n: "Q" + n + "  (÷" + Math.pow(2, n) + ")", c: [C.green, C.cyan][i], lo: 0, hi: 5, v: function(t){ return (Math.floor(cnt(t, f, ph) / Math.pow(2, n - 1)) % 2) * 5; } }); });
    return { span: 34 / f, fmain: f, warn: [], ch: chs, info: [[T("Takt", "Horloge"), fmt(f, "Hz")], ["Q10 (÷1024)", fmt(f / 1024, "Hz")], ["Q14 (÷16384)", fmt(f / 16384, "Hz")]],
      live: function(ts){ var c = cnt(ts, f, ph), a = st.map(function(n){ return Math.floor(c / Math.pow(2, n - 1)) % 2; }); return { leds: a, names: st.map(function(n){ return "Q" + n; }) }; } }; },
  wire: [["Pin 16 → +V, Pin 8 → GND", "Broche 16 → +V, 8 → GND"], ["Takt an Pin 10 – gezählt wird bei der FALLENDEN Flanke", "Horloge sur 10 – front descendant"], ["Pin 11 (RESET) → GND", "Broche 11 (RESET) → GND"], ["Q1 = Pin 9, Q4…Q7 = Pin 7, 5, 4, 6, Q8…Q14 = Pin 13, 12, 14, 15, 1, 2, 3", "Q1 = 9, Q4…Q7 = 7, 5, 4, 6, Q8…Q14 = 13, 12, 14, 15, 1, 2, 3"]],
  notes: [["Braucht man auch Q2 und Q3, nimmt man den CD4040 (12 Stufen, alle Ausgänge).", "Pour Q2 et Q3, prendre le CD4040."]] };

PROJ.cd4046 = { t: ["Spannung steuert Frequenz (CD4046 als VCO)", "La tension commande la fréquence (CD4046 en VCO)"], flow: ["Steuerspannung", "CD4046 (VCO)", "Rechteck"],
  d: ["Im CD4046 steckt ein spannungsgesteuerter Oszillator: Je höher die Spannung an Pin 9, desto höher die Frequenz an Pin 4. R1 und C1 legen die höchste Frequenz fest. Mit dem eingebauten Phasenvergleicher wird daraus eine PLL.", "Le CD4046 contient un VCO : plus la tension sur 9 est haute, plus la fréquence sur 4 l’est. R1 et C1 fixent la fréquence maximale."],
  params: [{ k: "U", l: ["Steuerspannung (Pin 9)", "Tension de commande (broche 9)"], min: .5, max: 9, def: 4.5, u: "V" }, PRx("R1", "R1", 10e3, 1e6, 100e3), { k: "C", l: ["C1", "C1"], min: 100e-12, max: 100e-9, def: 1e-9, log: 1, u: "F", e12: 1 }],
  build: function(P){ var V = 9, fmax = 1 / (P.R1 * (P.C + 32e-12)), f = Math.max(.01, fmax * clamp(P.U / V, 0, 1)), w = [];
    if (fmax > 1.2e6) w.push(T("Über etwa 1 MHz schafft der CD4046 bei 9 V nicht mehr.", "Au-delà de 1 MHz environ, le CD4046 ne suit plus."));
    return { span: 3.2 / f, speed: 1, warn: w, ch: [{ n: "Steuerspannung", c: C.amber, lo: 0, hi: V, v: function(){ return P.U; } }, { n: "VCO-Ausgang (Pin 4)", c: C.green, lo: 0, hi: V, v: function(t){ return sq(t, f, 0, .5) * V; } }],
      info: [[T("Frequenz (Näherung)", "Fréquence (approx.)"), fmt(f, "Hz")], [T("Höchste Frequenz ≈ 1 / (R1 · C1)", "Fréquence max ≈ 1 / (R1 · C1)"), fmt(fmax, "Hz")]] }; },
  wire: [["Pin 16 → +9 V, Pin 8 → GND, Pin 5 (INH) → GND", "Broche 16 → +9 V, 8 → GND, 5 → GND"], ["C1 zwischen Pin 6 und Pin 7", "C1 entre 6 et 7"], ["R1 von Pin 11 nach GND, Pin 12 offen (kein Frequenz-Versatz)", "R1 de 11 vers GND, 12 en l’air"], ["Steuerspannung an Pin 9, Ausgang an Pin 4", "Commande sur 9, sortie sur 4"]],
  notes: [["Die Formel ist eine grobe Näherung – die echte Kennlinie steht im Datenblatt als Diagramm.", "La formule est approximative ; la vraie courbe figure dans la fiche technique."], ["Verbindet man Pin 4 mit Pin 3 und führt Pin 2 über ein RC-Glied an Pin 9, rastet der Oszillator auf ein Eingangssignal an Pin 14 ein (PLL).", "En reliant 4 à 3 et 2 via un RC vers 9, l’oscillateur se cale sur le signal de la broche 14."]] };

PROJ.lm339 = { t: ["LED-Balkenanzeige mit 4 Komparatoren (LM339)", "Bargraphe LED à 4 comparateurs (LM339)"], flow: ["Messspannung", "LM339 + Teilerkette", "4 × LED"],
  d: ["Eine Widerstandskette teilt die Versorgung in vier Schwellen. Jeder Komparator vergleicht die Messspannung mit einer davon. Je höher die Spannung, desto mehr LEDs leuchten – ein einfaches Pegelmeter.", "Une chaîne de résistances crée quatre seuils ; plus la tension est haute, plus de LED s’allument."],
  params: [{ k: "U", l: ["Messspannung (Höchstwert)", "Tension mesurée (max)"], min: .5, max: 5, def: 5, u: "V" }, PF(.5, .1, 50)],
  build: function(P){ var f = P.f, th = [1, 2, 3, 4]; function vin(t){ var x = (t * f) % 1; return P.U * (x < .5 ? 2 * x : 2 - 2 * x); } function n(t){ var v = vin(t), k = 0; th.forEach(function(s){ if (v > s) k++; }); return k; }
    return { span: 2 / f, speed: 1, warn: [], ch: [{ n: "Messspannung", c: C.amber, lo: 0, hi: 5, v: vin }, { n: "LED 1 (> 1 V)", c: C.green, lo: 0, hi: 5, v: function(t){ return vin(t) > 1 ? 5 : 0; } }, { n: "LED 4 (> 4 V)", c: C.red, lo: 0, hi: 5, v: function(t){ return vin(t) > 4 ? 5 : 0; } }],
      info: [[T("Schwellen", "Seuils"), "1 V · 2 V · 3 V · 4 V"], [T("Teilerkette", "Chaîne"), "5 × 1 kΩ an 5 V"]],
      live: function(ts){ var k = n(ts); return { leds: [k > 0 ? 1 : 0, k > 1 ? 1 : 0, k > 2 ? 1 : 0, k > 3 ? 1 : 0], names: ["1 V", "2 V", "3 V", "4 V"] }; } }; },
  wire: [["Pin 3 → +5 V, Pin 12 → GND", "Broche 3 → +5 V, 12 → GND"], ["Fünf gleiche Widerstände (1 kΩ) von +5 V nach GND – die vier Abgriffe an die Plus-Eingänge Pin 5, 7, 9, 11", "Cinq résistances de 1 kΩ en série ; les quatre prises vers les entrées + (5, 7, 9, 11)"], ["Messspannung an alle Minus-Eingänge Pin 4, 6, 8, 10", "Tension mesurée sur les entrées − (4, 6, 8, 10)"], ["Je Ausgang (Pin 2, 1, 14, 13): +5 V → 330 Ω → LED → Ausgang", "Par sortie : +5 V → 330 Ω → LED → sortie"]],
  notes: [["Die Ausgänge sind offene Kollektoren: Sie ziehen nach Masse. Deshalb hängt die LED zwischen Plus und Ausgang – sie leuchtet, wenn der Ausgang LOW ist. Deshalb liegt die Messspannung am Minus-Eingang: Steigt sie über die Schwelle am Plus-Eingang, geht der Ausgang auf LOW und die LED leuchtet.", "Sorties à collecteur ouvert : la LED va du + vers la sortie."], ["Der LM3914 macht dasselbe mit zehn Stufen in einem Gehäuse.", "Le LM3914 fait de même avec dix niveaux."]] };

PROJ.tl072 = { t: ["Rauscharmer Vorverstärker (TL072)", "Préamplificateur à faible bruit (TL072)"], flow: ["Mikrofon / Gitarre", "TL072", "Line-Pegel"],
  d: ["Der TL072 hat JFET-Eingänge: Er belastet die Quelle kaum, rauscht wenig und ist zehnmal schneller als der LM358. Darum steckt er in vielen Audio-Geräten. Dreh die Verstärkung hoch und sieh, wann er an die Versorgung stößt.", "Le TL072 a des entrées JFET : peu de charge, peu de bruit, dix fois plus rapide que le LM358."],
  params: [PRx("R1", "R1 (nach GND)", 1e3, 100e3, 10e3), PRx("R2", "R2 (Rückkopplung)", 1e3, 1e6, 100e3), { k: "A", l: ["Eingangsamplitude", "Amplitude d’entrée"], min: .001, max: 2, def: .05, log: 1, u: "V" }, { k: "f", l: ["Frequenz", "Fréquence"], min: 20, max: 100e3, def: 1000, log: 1, u: "Hz" }],
  build: function(P){ var g = 1 + P.R2 / P.R1, fc = 3e6 / g, ge = g / Math.sqrt(1 + Math.pow(P.f / fc, 2)), vmax = 10.5, w = [];
    if (ge * P.A > vmax) w.push(T("Übersteuert: Der TL072 kommt nur bis etwa 1,5 V an die Versorgung heran.", "Saturation : le TL072 s’arrête à 1,5 V des rails."));
    return { span: 3 / P.f, speed: 1, warn: w, ch: [{ n: "Eingang", c: C.amber, lo: -12, hi: 12, v: function(t){ return sineAt(t, P.f, P.A); } }, { n: "Ausgang", c: C.green, lo: -12, hi: 12, v: function(t){ return clamp(ge * sineAt(t, P.f, P.A), -vmax, vmax); } }],
      info: [[T("Verstärkung 1 + R2/R1", "Gain 1 + R2/R1"), g.toFixed(1).replace(".", ",") + "×  (" + (20 * Math.log10(g)).toFixed(1).replace(".", ",") + " dB)"], [T("Grenzfrequenz ≈ 3 MHz / Verstärkung", "Fréquence de coupure"), fmt(fc, "Hz")], [T("Versorgung", "Alimentation"), "± 12 V"]] }; },
  wire: [["Pin 8 → +12 V, Pin 4 → −12 V", "Broche 8 → +12 V, 4 → −12 V"], ["Signal über 1 µF an Pin 3, 1 MΩ von Pin 3 nach GND", "Signal via 1 µF sur 3, 1 MΩ de 3 vers GND"], ["R2 von Pin 1 an Pin 2, R1 von Pin 2 nach GND", "R2 de 1 vers 2, R1 de 2 vers GND"], ["100 nF direkt an Pin 8 und Pin 4 nach GND", "100 nF sur 8 et 4 vers GND"]],
  notes: [["Der TL072 braucht eine symmetrische Versorgung (mindestens ±5 V). An 5 V allein läuft er schlecht – dann den LM358 oder einen Rail-to-Rail-Typ nehmen.", "Le TL072 exige une alimentation symétrique (au moins ±5 V)."], ["Ohne die 1 MΩ nach GND schwimmt der Eingang und der Ausgang läuft weg.", "Sans 1 MΩ vers la masse, l’entrée dérive."]] };

PROJ.ne556 = { t: ["Piepser im Takt: zwei Timer in einem (NE556)", "Bip rythmé : deux timers en un (NE556)"], flow: ["Timer 1 (langsam)", "RESET von Timer 2", "Timer 2 (Ton)"],
  d: ["Im NE556 stecken zwei NE555. Der erste blinkt langsam und schaltet über den RESET-Eingang den zweiten ein und aus. Der zweite erzeugt einen Ton – heraus kommt ein Piepen im Takt.", "Le NE556 contient deux NE555 : le premier, lent, commande le RESET du second, qui produit un son."],
  params: [{ k: "C1", l: ["C Timer 1 (Takt)", "C timer 1 (rythme)"], min: 1e-6, max: 100e-6, def: 10e-6, log: 1, u: "F", e12: 1 }, { k: "C2", l: ["C Timer 2 (Ton)", "C timer 2 (son)"], min: 1e-9, max: 100e-9, def: 10e-9, log: 1, u: "F", e12: 1 }],
  build: function(P){ var a = c555(10e3, 47e3, P.C1, 9), b = c555(1e3, 68e3, P.C2, 9), ph = a.T * .2;
    function on(t){ return a.out(t, ph); }
    return { span: ph + 2.2 * a.T, speed: 1, warn: b.f > 20e3 ? [T("Über 20 kHz hört man den Ton nicht mehr.", "Au-delà de 20 kHz le son n’est plus audible.")] : [], ch: [{ n: "OUT 1 (Pin 5) = RESET 2", c: C.amber, lo: 0, hi: 9, v: function(t){ return on(t) * 7.5; } }, { n: "OUT 2 (Pin 9) – Ton", c: C.green, lo: 0, hi: 9, v: function(t){ return on(t) ? (Math.sin(2 * Math.PI * Math.min(b.f, 60) * t * 3) > 0 ? 7.5 : 0) : 0; } }],
      info: [[T("Takt (Timer 1)", "Rythme (timer 1)"), fmt(a.f, "Hz")], [T("Tonhöhe (Timer 2)", "Hauteur (timer 2)"), fmt(b.f, "Hz")], [T("Ton an / aus", "Son marche / arrêt"), fmt(a.tH, "s") + " / " + fmt(a.tL, "s")]],
      live: function(ts){ return { leds: [on(ts)], names: [T("Piep", "Bip")] }; } }; },
  wire: [["Pin 14 → +9 V, Pin 7 → GND", "Broche 14 → +9 V, 7 → GND"], ["Timer 1: R1 (10 kΩ) von +V an Pin 1, R2 (47 kΩ) von Pin 1 an Pin 2 und 6, C von Pin 2/6 nach GND, Pin 4 → +V", "Timer 1 : 10 kΩ de +V vers 1, 47 kΩ de 1 vers 2 et 6, C de 2/6 vers GND, 4 → +V"], ["Timer 2: R1 (1 kΩ) an Pin 13, R2 (68 kΩ) von Pin 13 an Pin 12 und 8, C von Pin 8/12 nach GND", "Timer 2 : 1 kΩ vers 13, 68 kΩ de 13 vers 12 et 8, C de 8/12 vers GND"], ["Pin 5 (OUT 1) → Pin 10 (RESET 2)", "Broche 5 (OUT 1) → broche 10 (RESET 2)"], ["Pin 9 (OUT 2) → 10 µF → Piezo oder Lautsprecher (mit 100 Ω) → GND", "Broche 9 → 10 µF → piezo ou haut-parleur (avec 100 Ω) → GND"]],
  notes: [["Die Tonkurve im Oszilloskop ist verlangsamt gezeichnet, damit man die einzelnen Schwingungen sieht.", "La forme du son est ralentie à l’oscilloscope pour être lisible."], ["Ein NE556 ist günstiger und kleiner als zwei NE555 – sonst identisch.", "Un NE556 remplace deux NE555, en plus compact."]] };

PROJ.lm337 = { t: ["Einstellbare negative Spannung (LM337)", "Tension négative réglable (LM337)"], flow: ["−Vin", "LM337", "−Vout"],
  d: ["Der LM337 ist das Spiegelbild des LM317: Er regelt negative Spannungen. Zusammen bauen beide ein symmetrisches Netzteil für Operationsverstärker, zum Beispiel ±12 V.", "Le LM337 est le miroir du LM317 : il régule des tensions négatives. Ensemble, ils forment une alimentation symétrique."],
  params: [PRx("R2", "R2", 100, 5e3, 2e3), { k: "Vin", l: ["Eingang (Betrag)", "Entrée (valeur absolue)"], min: 5, max: 35, def: 18, u: "V" }],
  build: function(P){ var v = 1.25 * (1 + P.R2 / 240), vo = Math.min(v, P.Vin - 3), w = [];
    if (P.Vin < v + 3) w.push(T("Zu wenig Abstand: Der Eingang muss etwa 3 V negativer sein als der Ausgang.", "Écart insuffisant : l’entrée doit être 3 V plus négative."));
    return { span: .04, warn: w, ch: [{ n: "Eingang", c: C.amber, lo: -36, hi: 0, v: function(t){ return -(P.Vin + sineAt(t, 100, .8)); } }, { n: "Ausgang", c: C.green, lo: -36, hi: 0, v: function(t){ return -Math.min(v, P.Vin + sineAt(t, 100, .8) - 3); } }],
      info: [[T("Ausgang = −1,25 V · (1 + R2/R1)", "Sortie = −1,25 V · (1 + R2/R1)"), "−" + fmt(vo, "V")], ["R1", "240 Ω"]] }; },
  wire: [["Achtung, andere Pinfolge als der LM317: Pin 1 = ADJ, Pin 2 = IN, Pin 3 = OUT", "Attention, brochage différent du LM317 : 1 = ADJ, 2 = IN, 3 = OUT"], ["R1 (240 Ω) zwischen OUT und ADJ, R2 zwischen ADJ und GND", "R1 (240 Ω) entre OUT et ADJ, R2 entre ADJ et GND"], ["1 µF Tantal am Eingang, 10 µF am Ausgang – Pluspol jeweils an GND", "1 µF au tantale à l’entrée, 10 µF en sortie, + à la masse"]],
  notes: [["Die Kühlfahne liegt beim LM337 auf dem Eingang (negativ) – beim Kühlkörper isolieren.", "La patte de refroidissement est reliée à l’entrée : isoler le dissipateur."]] };

PROJ.lm1117 = { t: ["3,3 V aus 5 V (LM1117 / AMS1117)", "3,3 V à partir de 5 V (LM1117 / AMS1117)"], flow: ["5 V (USB)", "LM1117-3.3", "3,3 V für ESP32 / Sensoren"],
  d: ["Ein Low-Drop-Regler: Er braucht nur etwa 1,1 V Abstand zwischen Ein- und Ausgang. Deshalb macht er aus 5 V vom USB saubere 3,3 V. Bei viel Strom wird er aber heiß.", "Régulateur low-drop : 1,1 V d’écart suffit, d’où 3,3 V propres à partir de 5 V. Il chauffe à fort courant."],
  params: [{ k: "Vin", l: ["Eingangsspannung", "Tension d’entrée"], min: 3.5, max: 12, def: 5, u: "V" }, { k: "I", l: ["Laststrom", "Courant de charge"], min: .01, max: .8, def: .25, log: 1, u: "A" }],
  build: function(P){ var vo = Math.min(3.3, P.Vin - 1.1), Pv = Math.max(0, P.Vin - vo) * P.I, Tj = 25 + Pv * 90, w = [];
    if (P.Vin < 4.4) w.push(T("Unter 4,4 V Eingang fällt der Ausgang unter 3,3 V.", "Sous 4,4 V d’entrée, la sortie descend sous 3,3 V."));
    if (Tj > 125) w.push(T("Zu heiß: Der SOT-223 auf einer kleinen Platine schafft das nicht – weniger Strom oder ein Schaltregler.", "Trop chaud : moins de courant ou un régulateur à découpage."));
    if (P.I > .35) w.push(T("Ein ESP32 zieht beim WLAN-Senden kurz über 300 mA – plane Reserve ein.", "Un ESP32 tire plus de 300 mA en émission Wi-Fi."));
    return { span: .02, warn: w, ch: [{ n: "Eingang", c: C.amber, lo: 0, hi: 12, v: function(t){ return P.Vin + sineAt(t, 200, .1); } }, { n: "Ausgang", c: C.green, lo: 0, hi: 12, v: function(){ return vo; } }],
      info: [[T("Ausgang", "Sortie"), fmt(vo, "V")], [T("Verlustleistung", "Puissance dissipée"), fmt(Pv, "W")], [T("Sperrschicht (SOT-223, 90 K/W)", "Jonction (SOT-223, 90 K/W)"), Math.round(Tj) + " °C"]],
      live: function(){ return { leds: [vo >= 3.2 && Tj <= 125 ? 1 : 0], names: ["3,3 V ok"] }; } }; },
  wire: [["Pin 1 → GND, Pin 3 → Eingang (5 V), Pin 2 → Ausgang (3,3 V); die Kühlfahne ist ebenfalls der Ausgang", "Broche 1 → GND, 3 → entrée, 2 → sortie ; la patte est la sortie"], ["10 µF am Eingang, 22 µF am Ausgang – er braucht den Ausgangskondensator, sonst schwingt er", "10 µF à l’entrée, 22 µF en sortie, sinon il oscille"]],
  notes: [["Der AMS1117 ist der günstige Nachbau und auf fast jedem ESP32-Board verbaut.", "L’AMS1117 est la copie bon marché présente sur presque toutes les cartes ESP32."]] };

/* ---- Erweiterung 4: PNP, P-MOSFET, LED, Instrumentenverstärker, Wandler, Speicher, Uhr, Bus, Triac, IR, Schrittmotor ---- */
PROJ.pnp = { t: ["PNP-Transistor als Schalter nach Plus (BC557)", "Transistor PNP en commutation côté + (BC557)"], flow: ["Pin LOW", "BC557", "Last nach GND"],
  d: ["Der PNP-Transistor sitzt zwischen Plus und Last. Er schaltet ein, wenn seine Basis LOW wird – also genau umgekehrt wie der NPN. So schaltet man eine Last, deren Minus fest an Masse hängt.", "Le PNP se place entre + et charge ; il conduit quand sa base est à LOW."],
  params: [PRx("Rb", "Basiswiderstand", 470, 47e3, 2.2e3), PRx("RL", "Last (an 5 V)", 22, 2e3, 100), PF(2, .5, 2000)],
  build: function(P){ var Ib = 4.3 / P.Rb, Is = 4.8 / P.RL, sat = 100 * Ib >= Is, Vce = sat ? .2 : Math.max(.2, 5 - 100 * Ib * P.RL), f = P.f, w = [];
    if (!sat) w.push(T("Nicht voll durchgeschaltet – Basiswiderstand kleiner wählen.", "Pas saturé – diminuer la résistance de base."));
    w.push(T("Wichtig: Die Last-Versorgung darf nicht höher sein als die Logik-Spannung, sonst schaltet ein 3,3- oder 5-V-Pin den PNP nie ganz aus. Für höhere Spannungen einen NPN davor setzen.", "La tension de charge ne doit pas dépasser celle de la logique."));
    return { span: 3.2 / f, fmain: f, warn: w, ch: [{ n: T("Pin (LOW = ein)", "Broche (LOW = marche)"), c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, f, .25 / f, .5) ? 0 : 5; } }, { n: T("Spannung an der Last", "Tension sur la charge"), c: C.green, lo: 0, hi: 5, v: function(t){ return sq(t, f, .25 / f, .5) ? 5 - Vce : 0; } }],
      info: [[T("Basisstrom", "Courant de base"), fmt(Ib, "A")], [T("Laststrom", "Courant de charge"), fmt(sat ? Is : 100 * Ib, "A")]],
      live: function(ts){ return { leds: [sq(ts, f, 0, .5)], names: [T("Last", "Charge")] }; } }; },
  wire: [["Emitter → +5 V", "Émetteur → +5 V"], ["Pin → Basiswiderstand → Basis; 10 kΩ von Basis nach +5 V (hält ihn aus)", "Broche → résistance → base ; 10 kΩ base → +5 V"], ["Kollektor → Last → GND", "Collecteur → charge → GND"]],
  notes: [["Ähnliche PNP-Typen: BC327 (800 mA), BC640, 2N3906, S8550, BD140, TIP127 (Darlington, 5 A).", "PNP similaires : BC327, BC640, 2N3906, S8550, BD140, TIP127."]] };

PROJ.pmos = { t: ["P-MOSFET schaltet nach Plus (IRF9540)", "MOSFET P côté + (IRF9540)"], flow: ["NPN-Treiber", "P-MOSFET", "Last nach GND"],
  d: ["Ein P-Kanal-MOSFET leitet, wenn sein Gate deutlich unter der Source liegt. Weil die Source an 12 V hängt, zieht ein kleiner NPN das Gate nach unten. So schaltet ein 3,3-V-Pin eine 12-V-Last auf der Plus-Seite.", "Un MOSFET P conduit quand sa grille est bien sous la source ; un petit NPN tire la grille vers le bas."],
  params: [{ k: "I", l: ["Laststrom", "Courant de charge"], min: .1, max: 10, def: 2, log: 1, u: "A" }, PF(2, .5, 2000)],
  build: function(P){ var r = .2, f = P.f, Pv = P.I * P.I * r, w = [];
    if (Pv > 1.5) w.push(T("Mehr als 1,5 W Verlust – Kühlkörper oder ein MOSFET mit kleinerem Widerstand.", "Plus de 1,5 W de pertes – dissipateur nécessaire."));
    return { span: 3.2 / f, fmain: f, warn: w, ch: [{ n: T("Pin (3,3 V)", "Broche (3,3 V)"), c: C.amber, lo: 0, hi: 12, v: function(t){ return sq(t, f, .25 / f, .5) * 3.3; } }, { n: "Gate", c: C.pink, lo: 0, hi: 12, v: function(t){ return sq(t, f, .25 / f, .5) ? .2 : 12; } }, { n: T("Last", "Charge"), c: C.green, lo: 0, hi: 12, v: function(t){ return sq(t, f, .25 / f, .5) ? 12 - P.I * r : 0; } }],
      info: [[T("Widerstand eingeschaltet", "Résistance passante"), fmt(r, "Ω")], [T("Verlustleistung", "Puissance dissipée"), fmt(Pv, "W")], [T("Gate–Source eingeschaltet", "Grille–source passant"), "−11,8 V"]],
      live: function(ts){ return { leds: [sq(ts, f, 0, .5)], names: [T("Last", "Charge")] }; } }; },
  wire: [["Source → +12 V, Drain → Last → GND", "Source → +12 V, drain → charge → GND"], ["10 kΩ von Gate nach +12 V (Ruhe: aus)", "10 kΩ grille → +12 V"], ["Gate → Kollektor eines NPN (BC547), Emitter → GND", "Grille → collecteur d’un NPN, émetteur → GND"], ["Pin → 1 kΩ → Basis des NPN", "Broche → 1 kΩ → base du NPN"]],
  notes: [["Gate–Source darf höchstens ±20 V sehen. Bei über 20 V Versorgung eine Z-Diode zwischen Gate und Source setzen.", "Grille–source limitée à ±20 V."], ["Ähnlich: IRLML6402 (SMD, kleine Lasten). Für Low-Side-Schalter immer N-Kanal nehmen – die sind besser und billiger.", "Similaire : IRLML6402. En côté masse, préférer un canal N."]] };

PROJ.led = { t: ["LED mit Vorwiderstand", "LED avec résistance série"], flow: ["Versorgung", "Vorwiderstand", "LED"],
  d: ["Eine LED braucht immer einen Widerstand, der den Strom begrenzt. Wähle Farbe und Widerstand und sieh, wie viel Strom fließt – und ab wann es zu viel wird.", "Une LED a toujours besoin d’une résistance qui limite le courant."],
  opts: [{ k: "col", l: ["Farbe", "Couleur"], o: [["1.9", "rot (1,9 V)"], ["2.1", "gelb / orange (2,1 V)"], ["2.2", "grün klassisch (2,2 V)"], ["3.0", "blau / weiß / grün hell (3,0 V)"]], def: "1.9" }],
  params: [{ k: "V", l: ["Versorgung", "Alimentation"], min: 3.3, max: 24, def: 5, u: "V" }, PRx("R", "Vorwiderstand", 33, 10e3, 330)],
  build: function(P){ var uf = +P.col, I = Math.max(0, (P.V - uf) / P.R), w = [], Rid = (P.V - uf) / .01;
    if (P.V <= uf) w.push(T("Die Versorgung ist kleiner als die Flussspannung – die LED bleibt dunkel.", "Alimentation inférieure à la tension de seuil."));
    if (I > .02) w.push(T("Über 20 mA – Standard-LEDs halten das nicht lange.", "Plus de 20 mA : trop pour une LED standard."));
    return { span: 1, speed: 1, warn: w, ch: [{ n: T("Strom", "Courant"), c: C.green, lo: 0, hi: .03, v: function(){ return Math.min(I, .03); } }],
      info: [[T("Strom", "Courant"), fmt(I, "A")], [T("Leistung im Widerstand", "Puissance dans la résistance"), fmt(I * I * P.R, "W")], [T("Widerstand für 10 mA", "Résistance pour 10 mA"), fmt(e12(Rid), "Ω") + " (E12)"]],
      live: function(){ return { leds: [I > .0005 ? 1 : 0], names: ["LED"] }; } }; },
  wire: [["Plus → Widerstand → Anode (langes Bein)", "Plus → résistance → anode (patte longue)"], ["Kathode (kurzes Bein, flache Seite) → GND", "Cathode (patte courte, méplat) → GND"]],
  notes: [["Den genauen Wert rechnet der Elektronik-Rechner (LED-Vorwiderstand) – mit Normreihe und mehreren LEDs in Reihe.", "Le calculateur (résistance de LED) donne la valeur exacte."], ["Siebensegment-Anzeigen sind acht LEDs in einem Gehäuse – jedes Segment braucht seinen eigenen Widerstand.", "Un afficheur 7 segments = huit LED, chacune avec sa résistance."]] };

PROJ.ad620 = { t: ["Instrumentenverstärker für kleine Signale (AD620)", "Amplificateur d’instrumentation (AD620)"], flow: ["Messbrücke / Sensor", "AD620 + RG", "verstärktes Signal"],
  d: ["Ein Instrumentenverstärker verstärkt nur die Differenz zwischen zwei Eingängen – Störungen, die auf beiden gleich ankommen, fallen heraus. Ein einziger Widerstand RG legt die Verstärkung fest. Ideal für Wägezellen, Dehnungsmessstreifen und Thermoelemente.", "Il amplifie seulement la différence entre deux entrées ; un seul RG fixe le gain."],
  params: [PRx("RG", "RG (Verstärkung)", 50, 50e3, 499), { k: "Ud", l: ["Differenzsignal (Spitze)", "Signal différentiel (crête)"], min: .0001, max: .2, def: .005, log: 1, u: "V" }, { k: "Ucm", l: ["Störung auf beiden Leitungen", "Perturbation commune"], min: 0, max: 2, def: 1, u: "V" }],
  build: function(P){ var G = 1 + 49400 / P.RG, f = 10, w = [];
    function cm(t){ return P.Ucm * Math.sin(2 * Math.PI * 50 * t); } function d(t){ return P.Ud * Math.sin(2 * Math.PI * f * t); }
    if (G * P.Ud > 13) w.push(T("Übersteuert: Der Ausgang kommt nur bis etwa ±13,5 V.", "Saturation à ±13,5 V."));
    return { span: .2, speed: 1, warn: w, ch: [{ n: "+IN", c: C.amber, lo: -3, hi: 3, v: function(t){ return cm(t) + d(t) / 2; } }, { n: "−IN", c: C.pink, lo: -3, hi: 3, v: function(t){ return cm(t) - d(t) / 2; } }, { n: T("Ausgang", "Sortie"), c: C.green, lo: -15, hi: 15, v: function(t){ return clamp(G * d(t) + cm(t) * G / 1e5, -13.5, 13.5); } }],
      info: [[T("Verstärkung G = 1 + 49,4 kΩ / RG", "Gain G = 1 + 49,4 kΩ / RG"), G.toFixed(1).replace(".", ",") + "×"], [T("Ausgang (Spitze)", "Sortie (crête)"), fmt(Math.min(13.5, G * P.Ud), "V")], [T("Gleichtaktunterdrückung", "Réjection de mode commun"), "≈ 100 dB"]] }; },
  wire: [["Pin 7 → +12 V, Pin 4 → −12 V, Pin 5 (REF) → GND", "Broche 7 → +12 V, 4 → −12 V, 5 (REF) → GND"], ["RG zwischen Pin 1 und Pin 8", "RG entre 1 et 8"], ["Sensor-Plus an Pin 3 (+IN), Sensor-Minus an Pin 2 (−IN)", "+ du capteur sur 3, − sur 2"], ["Ausgang an Pin 6", "Sortie sur 6"]],
  notes: [["Die 50-Hz-Störung (Netzbrumm) ist auf beiden Eingängen gleich groß und verschwindet deshalb am Ausgang fast vollständig.", "La perturbation à 50 Hz, identique sur les deux entrées, disparaît presque en sortie."], ["Für Wägezellen mit Mikrocontroller ist das HX711-Modul die einfachere Lösung (Verstärker und Wandler in einem).", "Pour les capteurs de poids, le module HX711 est plus simple."]] };

PROJ.dac0808 = { t: ["Digital wird analog: Treppenspannung (DAC0808)", "Le numérique devient analogique (DAC0808)"], flow: ["Zähler (8 Bit)", "DAC0808 + Opamp", "Treppen- / Sägezahnspannung"],
  d: ["Acht Bits gehen hinein, eine Spannung kommt heraus: jede Stufe ist 1/256 der Referenz. Zählt ein Binärzähler hoch, entsteht eine Treppe, die mit vielen Stufen fast wie eine Rampe aussieht.", "Huit bits en entrée, une tension en sortie : chaque pas vaut 1/256 de la référence."],
  opts: [{ k: "bits", l: ["Benutzte Bits", "Bits utilisés"], o: [["3", "3 Bit (8 Stufen)"], ["4", "4 Bit (16 Stufen)"], ["8", "8 Bit (256 Stufen)"]], def: "4" }],
  params: [{ k: "f", l: ["Zählerfrequenz", "Fréquence du compteur"], min: 1, max: 5000, def: 50, log: 1, u: "Hz" }, { k: "Vr", l: ["Referenzspannung", "Tension de référence"], min: 1, max: 10, def: 5, u: "V" }],
  build: function(P){ var n = +P.bits, N = 1 << n, f = P.f;
    function code(t){ return cnt(t, f, 0) % N; }
    return { span: 2.2 * N / f, speed: 1, warn: [], ch: [{ n: "Bit 0 (LSB)", c: C.amber, lo: 0, hi: 5, v: function(t){ return (code(t) & 1) * 5; } }, { n: T("Analog-Ausgang", "Sortie analogique"), c: C.green, lo: 0, hi: 10, v: function(t){ return P.Vr * code(t) / N; } }],
      info: [[T("Stufen", "Pas"), String(N)], [T("Spannung je Stufe", "Tension par pas"), fmt(P.Vr / N, "V")], [T("Periode der Rampe", "Période de la rampe"), fmt(N / f, "s")]] }; },
  wire: [["Pin 13 → +5 V, Pin 3 → −12 V, Pin 2 → GND", "Broche 13 → +5 V, 3 → −12 V, 2 → GND"], ["Referenz: +Vref → 5 kΩ → Pin 14, Pin 15 → 5 kΩ → GND", "Référence : +Vref → 5 kΩ → 14, 15 → 5 kΩ → GND"], ["Pin 16 → 100 nF → −12 V", "Broche 16 → 100 nF → −12 V"], ["Daten A1 (MSB) … A8 (LSB) = Pin 5 … 12", "Données A1 (MSB) … A8 (LSB) = 5 … 12"], ["Pin 4 (Strom-Ausgang) an den Minus-Eingang eines Opamps, 5 kΩ Rückkopplung – der Opamp macht daraus die Spannung", "Broche 4 vers l’entrée − d’un ampli op, 5 kΩ de contre-réaction"]],
  notes: [["Achtung: Beim DAC0808 ist A1 das höchste Bit (MSB), nicht das niedrigste.", "Attention : A1 est le bit de poids fort."], ["Ohne Bauteile geht es mit einem R-2R-Widerstandsnetz – oder mit PWM und einem RC-Tiefpass.", "Sans CI : réseau R-2R ou PWM avec filtre RC."]] };

PROJ.adder = { t: ["Binär addieren (74HC283)", "Additionner en binaire (74HC283)"], flow: ["A (4 Bit) + B (4 Bit)", "74HC283", "Summe (5 Bit)"],
  d: ["Ein Volladdierer für zwei 4-Bit-Zahlen: Er rechnet A + B und gibt die Summe aus – der Übertrag C4 ist das fünfte Bit. Zwei Bausteine hintereinander addieren 8-Bit-Zahlen.", "Additionneur complet 4 bits : la retenue C4 est le cinquième bit."],
  params: [{ k: "a", l: ["A (0…15)", "A (0…15)"], min: 0, max: 15, def: 9, int: 1, u: "" }, { k: "b", l: ["B (0…15)", "B (0…15)"], min: 0, max: 15, def: 5, int: 1, u: "" }],
  build: function(P){ var a = Math.round(P.a), b = Math.round(P.b), s = a + b, bin = function(x, n){ return ("00000" + x.toString(2)).slice(-n); };
    return { span: 1, speed: 1, warn: [], ch: [{ n: "S1", c: C.green, lo: 0, hi: 5, v: function(){ return (s & 1) * 5; } }, { n: "C4", c: C.pink, lo: 0, hi: 5, v: function(){ return (s >> 4) * 5; } }],
      info: [["A", a + "  (" + bin(a, 4) + ")"], ["B", b + "  (" + bin(b, 4) + ")"], [T("Summe", "Somme"), s + "  (" + bin(s, 5) + ")"], [T("Übertrag C4", "Retenue C4"), String(s >> 4)]],
      live: function(){ var l = []; for (var i = 4; i >= 0; i--) l.push((s >> i) & 1); return { leds: l, names: ["C4", "S4", "S3", "S2", "S1"] }; } }; },
  wire: [["Pin 16 → +V, Pin 8 → GND, Pin 7 (C0) → GND", "Broche 16 → +V, 8 → GND, 7 → GND"], ["A1…A4 = Pin 5, 3, 14, 12; B1…B4 = Pin 6, 2, 15, 11", "A1…A4 = 5, 3, 14, 12 ; B1…B4 = 6, 2, 15, 11"], ["Summe S1…S4 = Pin 4, 1, 13, 10, Übertrag C4 = Pin 9", "Somme S1…S4 = 4, 1, 13, 10 ; retenue = 9"], ["Jeder Ausgang → 330 Ω → LED → GND", "Chaque sortie → 330 Ω → LED → GND"]],
  notes: [["Der alte 7483 rechnet genauso, hat aber eine ungewöhnliche Pinbelegung (Versorgung an Pin 5 und 12).", "Le 7483 calcule pareil avec un brochage inhabituel."], ["Zum Vergleichen zweier Zahlen gibt es den 7485 (A > B, A = B, A < B).", "Pour comparer : 7485."]] };

PROJ.ds1307 = { t: ["Echtzeituhr am I²C-Bus (DS1307)", "Horloge temps réel I²C (DS1307)"], flow: ["Uhrenquarz 32,768 kHz", "DS1307", "I²C zum Mikrocontroller"],
  d: ["Die Uhr läuft mit einem eigenen Quarz und einer Knopfzelle weiter, auch wenn der Mikrocontroller aus ist. Über I²C liest man Sekunden, Minuten und Stunden als BCD-Zahlen. Pin 7 gibt auf Wunsch einen Sekundentakt aus.", "L’horloge continue sur pile ; on lit secondes, minutes et heures en BCD par I²C."],
  params: [{ k: "s", l: ["Sekunden", "Secondes"], min: 0, max: 59, def: 37, int: 1, u: "" }],
  build: function(P){ var s = Math.round(P.s), bcd = ((s / 10) | 0) * 16 + s % 10, byte = [0xD0, 0x00, 0xD1, bcd], f = 10000;
    function slot(t){ return Math.floor(t * f); }
    function bit(t){ var x = slot(t) - 2, k = Math.floor(x / 9), i = x % 9; if (x < 0 || k >= 4) return 1; return i === 8 ? 0 : (byte[k] >> (7 - i)) & 1; }
    return { span: 40 / f, speed: 1, warn: [], ch: [{ n: "SCL", c: C.amber, lo: 0, hi: 5, v: function(t){ var x = slot(t); return x < 2 || x > 37 ? 5 : ((t * f) % 1 > .5 ? 5 : 0); } }, { n: "SDA", c: C.green, lo: 0, hi: 5, v: function(t){ return bit(t) * 5; } }, { n: "SQW (1 Hz)", c: C.cyan, lo: 0, hi: 5, v: function(){ return 5; } }],
      info: [[T("Sekundenregister (BCD)", "Registre secondes (BCD)"), "0x" + ("0" + bcd.toString(16).toUpperCase()).slice(-2)], [T("I²C-Adresse", "Adresse I²C"), "0x68"], [T("Gezeigte Bytes", "Octets montrés"), "D0 00 D1 " + ("0" + bcd.toString(16).toUpperCase()).slice(-2)]] }; },
  wire: [["Pin 8 → +5 V, Pin 4 → GND", "Broche 8 → +5 V, 4 → GND"], ["Quarz 32,768 kHz zwischen Pin 1 und Pin 2 – ohne Kondensatoren, kurz und direkt", "Quartz 32,768 kHz entre 1 et 2, sans condensateurs"], ["Knopfzelle CR2032: Plus an Pin 3, Minus an GND", "Pile CR2032 : + sur 3, − à GND"], ["Pin 5 (SDA) und Pin 6 (SCL) an den Bus, je 4,7 kΩ nach +5 V", "5 (SDA) et 6 (SCL) sur le bus, 4,7 kΩ vers +5 V"], ["Pin 7 (SQW): 4,7 kΩ nach +5 V, gibt 1 Hz aus, wenn eingeschaltet", "Broche 7 : 4,7 kΩ vers +5 V, sort 1 Hz"]],
  notes: [["Der DS1307 läuft nur mit 5 V. Für 3,3 V und viel genauer: DS3231 (Quarz eingebaut, temperaturkompensiert).", "Le DS1307 exige 5 V ; le DS3231 est plus précis et fonctionne en 3,3 V."], ["Auf dem Oszilloskop: Adresse schreiben (0xD0), Register 0 wählen, Adresse lesen (0xD1), Sekunden-Byte.", "À l’oscilloscope : adresse en écriture, registre 0, adresse en lecture, octet des secondes."]] };

PROJ.eeprom = { t: ["Daten dauerhaft speichern (24LC256)", "Mémoriser durablement (24LC256)"], flow: ["Mikrocontroller", "I²C", "24LC256 (32 KB)"],
  d: ["Ein EEPROM behält seine Daten ohne Strom. Der Mikrocontroller schickt die Adresse des Chips, zwei Bytes Speicheradresse und dann den Wert. Danach braucht der Chip etwa 5 ms zum Schreiben.", "Une EEPROM garde ses données sans alimentation ; écriture en environ 5 ms."],
  params: [{ k: "v", l: ["Zu schreibender Wert (0…255)", "Valeur à écrire (0…255)"], min: 0, max: 255, def: 42, int: 1, u: "" }, { k: "adr", l: ["Speicheradresse (0…32767)", "Adresse mémoire"], min: 0, max: 32767, def: 256, int: 1, u: "" }],
  build: function(P){ var v = Math.round(P.v), a = Math.round(P.adr), byte = [0xA0, a >> 8, a & 255, v], f = 10000;
    function slot(t){ return Math.floor(t * f); }
    function bit(t){ var x = slot(t) - 2, k = Math.floor(x / 9), i = x % 9; if (x < 0 || k >= 4) return 1; return i === 8 ? 0 : (byte[k] >> (7 - i)) & 1; }
    return { span: 40 / f, speed: 1, warn: [], ch: [{ n: "SCL", c: C.amber, lo: 0, hi: 5, v: function(t){ var x = slot(t); return x < 2 || x > 37 ? 5 : ((t * f) % 1 > .5 ? 5 : 0); } }, { n: "SDA", c: C.green, lo: 0, hi: 5, v: function(t){ return bit(t) * 5; } }],
      info: [[T("Bytes auf dem Bus", "Octets sur le bus"), byte.map(function(b){ return ("0" + b.toString(16).toUpperCase()).slice(-2); }).join(" ")], [T("I²C-Adresse (A0…A2 = GND)", "Adresse I²C"), "0x50"], [T("Schreibzeit", "Durée d’écriture"), "≤ 5 ms"], [T("Haltbarkeit", "Endurance"), T("ca. 1 Mio. Schreibvorgänge", "env. 1 million d’écritures")]] }; },
  wire: [["Pin 8 → +V (1,8…5,5 V), Pin 4 → GND", "Broche 8 → +V, 4 → GND"], ["A0, A1, A2 (Pin 1, 2, 3) → GND – mit anderen Kombinationen bis zu 8 Chips am Bus", "A0…A2 → GND (jusqu’à 8 puces)"], ["Pin 7 (WP) → GND = schreiben erlaubt", "Broche 7 (WP) → GND = écriture autorisée"], ["Pin 5 (SDA) und Pin 6 (SCL) an den Bus, je 4,7 kΩ nach +V", "5 (SDA) et 6 (SCL) sur le bus avec 4,7 kΩ"]],
  notes: [["Bis zu 64 Byte lassen sich auf einmal schreiben (Page Write) – aber nur innerhalb einer 64-Byte-Seite.", "Écriture par page de 64 octets au maximum."], ["Größere Datenmengen: W25Q-Flash am SPI-Bus (4…16 MB). Schneller, aber ohne Strom: 62256 (SRAM).", "Pour plus de données : flash W25Q en SPI."]] };

PROJ.max485 = { t: ["Lange Leitungen mit RS-485 (MAX485)", "Longues lignes en RS-485 (MAX485)"], flow: ["UART (TX)", "MAX485", "verdrillte Leitung A/B"],
  d: ["RS-485 überträgt Daten als Differenz zwischen zwei Leitungen A und B. Störungen wirken auf beide gleich und heben sich auf – deshalb gehen bis zu 1200 m. Mit DE schaltet man zwischen Senden und Empfangen um.", "RS-485 transmet la différence entre A et B ; les perturbations s’annulent, jusqu’à 1200 m."],
  params: [{ k: "b", l: ["Gesendetes Byte", "Octet envoyé"], min: 0, max: 255, def: 77, int: 1, u: "" }, { k: "st", l: ["Störung auf der Leitung", "Perturbation sur la ligne"], min: 0, max: 3, def: 1.5, u: "V" }],
  build: function(P){ var b = Math.round(P.b), tb = 1 / 9600;
    function ttl(t){ var s = Math.floor(t / tb) - 2; if (s < 0 || s > 9) return 1; if (s === 0) return 0; if (s === 9) return 1; return (b >> (s - 1)) & 1; }
    function noi(t){ return P.st * Math.sin(2 * Math.PI * 1500 * t); }
    return { span: 14 * tb, speed: 1, warn: [], ch: [{ n: "DI (TX)", c: C.amber, lo: -2, hi: 8, v: function(t){ return ttl(t) * 5; } }, { n: "A", c: C.green, lo: -2, hi: 8, v: function(t){ return 2.5 + (ttl(t) ? 1.5 : -1.5) + noi(t); } }, { n: "B", c: C.cyan, lo: -2, hi: 8, v: function(t){ return 2.5 + (ttl(t) ? -1.5 : 1.5) + noi(t); } }, { n: T("RO (empfangen)", "RO (reçu)"), c: C.pink, lo: -2, hi: 8, v: function(t){ return ttl(t) * 5; } }],
      info: [[T("Differenz A − B", "Différence A − B"), "± 3 V"], [T("Reichweite", "Portée"), T("bis 1200 m", "jusqu’à 1200 m")], [T("Teilnehmer", "Participants"), T("bis 32 am Bus", "jusqu’à 32")]] }; },
  wire: [["Pin 8 → +5 V, Pin 5 → GND", "Broche 8 → +5 V, 5 → GND"], ["Pin 4 (DI) ← TX, Pin 1 (RO) → RX", "Broche 4 (DI) ← TX, 1 (RO) → RX"], ["Pin 2 (/RE) und Pin 3 (DE) zusammen an einen Pin: HIGH = senden, LOW = empfangen", "/RE et DE reliés : HIGH = émission, LOW = réception"], ["Pin 6 = A, Pin 7 = B an die verdrillte Leitung; an beiden Enden 120 Ω zwischen A und B", "6 = A, 7 = B ; 120 Ω aux deux extrémités"]],
  notes: [["Die Störung auf dem Oszilloskop wirkt auf A und B gleich – der Empfänger sieht nur die Differenz und liefert trotzdem saubere Daten.", "La perturbation, identique sur A et B, est ignorée par le récepteur."], ["Modbus RTU in der Industrie läuft fast immer über RS-485.", "Le Modbus RTU utilise presque toujours le RS-485."]] };

PROJ.triac = { t: ["Netzlast schalten mit Optotriac und Triac (MOC3021 + BT136)", "Commuter le secteur (MOC3021 + BT136)"], flow: ["Mikrocontroller", "MOC3021", "BT136", "Lampe 230 V"],
  d: ["Ein Triac schaltet Wechselspannung. Der Optotriac MOC3021 zündet ihn und trennt dabei den Mikrocontroller sicher vom Netz. Mit Phasenanschnitt wird nur ein Teil jeder Halbwelle durchgelassen – so dimmt man Glühlampen.", "Le triac commute l’alternatif ; le MOC3021 l’amorce en isolant le microcontrôleur."],
  params: [{ k: "w", l: ["Zündwinkel", "Angle d’amorçage"], min: 0, max: 170, def: 60, int: 1, u: "°" }],
  build: function(P){ var a = P.w / 180, pk = 325;
    function net(t){ return sineAt(t, 50, pk); } function on(t){ var ph = ((t * 100) % 1); return ph >= a ? 1 : 0; }
    var rms = Math.sqrt(1 - a + Math.sin(2 * Math.PI * a) / (2 * Math.PI));
    return { span: .04, speed: 1, warn: [T("Lebensgefahr: 230 V nur mit Fachkenntnis, im geschlossenen Gehäuse und mit Sicherung aufbauen. Die Netzseite nie anfassen und nie mit dem Oszilloskop gegen Erde messen.", "Danger de mort : 230 V uniquement avec compétence, en boîtier fermé et avec fusible.")],
      ch: [{ n: T("Netz", "Secteur"), c: C.amber, lo: -340, hi: 340, v: net }, { n: T("Zündimpuls", "Impulsion"), c: C.pink, lo: -340, hi: 340, v: function(t){ var ph = (t * 100) % 1; return ph >= a && ph < a + .03 ? 200 : 0; } }, { n: T("Lampe", "Lampe"), c: C.green, lo: -340, hi: 340, v: function(t){ return on(t) ? net(t) : 0; } }],
      info: [[T("Zündwinkel", "Angle"), P.w + "°"], [T("Helligkeit (Leistung)", "Luminosité (puissance)"), Math.round(rms * rms * 100) + " %"]] }; },
  wire: [["Mikrocontroller-Pin → 330 Ω → MOC3021 Pin 1, Pin 2 → GND", "Broche → 330 Ω → MOC3021 broche 1, broche 2 → GND"], ["MOC3021 Pin 6 → 360 Ω → Netz-Phase (über die Lampe), Pin 4 → Gate des BT136", "MOC3021 broche 6 → 360 Ω → phase, broche 4 → gâchette"], ["BT136: MT2 an die Lampe, MT1 an den Neutralleiter", "BT136 : MT2 vers la lampe, MT1 au neutre"], ["Für Dimmen braucht der Mikrocontroller einen Nulldurchgangs-Detektor (z. B. H11AA1)", "Pour varier : détecteur de passage par zéro"]],
  notes: [["Der MOC3021 hat keinen eingebauten Nulldurchgangsschalter – daher kann er dimmen. Der MOC3041 schaltet nur im Nulldurchgang (kein Dimmen, aber weniger Störungen).", "Le MOC3041 commute au zéro : pas de variation, moins de parasites."], ["LED-Lampen lassen sich so oft nicht dimmen – nur Glühlampen und ‚dimmbare‘ LEDs.", "Les lampes LED ne se varient souvent pas ainsi."]] };

PROJ.tsop = { t: ["Infrarot-Fernbedienung empfangen (TSOP4838)", "Recevoir une télécommande IR (TSOP4838)"], flow: ["Fernbedienung (38 kHz)", "TSOP4838", "Datenpin"],
  d: ["Die Fernbedienung blinkt mit 38 kHz. Der Empfänger filtert genau diese Frequenz heraus und gibt nur die Pakete aus: LOW, solange Licht kommt. Andere Lichtquellen stören deshalb kaum.", "La télécommande clignote à 38 kHz ; le récepteur ne sort que les paquets."],
  params: [{ k: "c", l: ["Gesendeter Code (Befehl 0…255)", "Code envoyé (0…255)"], min: 0, max: 255, def: 69, int: 1, u: "" }],
  build: function(P){ var c = Math.round(P.c), seq = [[9, 1], [4.5, 0]];
    for (var i = 0; i < 8; i++){ seq.push([.5625, 1]); seq.push([((c >> i) & 1) ? 1.6875 : .5625, 0]); } seq.push([.5625, 1]);
    var tot = seq.reduce(function(s, x){ return s + x[0]; }, 0) / 1000;
    function burst(t){ var x = t * 1000 - 1, s = 0; if (x < 0) return 0; for (var i = 0; i < seq.length; i++){ if (x < s + seq[i][0]) return seq[i][1]; s += seq[i][0]; } return 0; }
    return { span: tot + .003, speed: 1, warn: [], ch: [{ n: T("IR-Licht (38 kHz)", "Lumière IR (38 kHz)"), c: C.pink, lo: 0, hi: 5, v: function(t){ return burst(t) ? (Math.sin(2 * Math.PI * 38000 * t * .02) > 0 ? 5 : 0) : 0; } }, { n: T("Ausgang (Pin 1)", "Sortie (broche 1)"), c: C.green, lo: 0, hi: 5, v: function(t){ return burst(t) ? 0 : 5; } }],
      info: [[T("Befehl", "Commande"), c + "  (0x" + ("0" + c.toString(16).toUpperCase()).slice(-2) + ")"], [T("Protokoll", "Protocole"), T("NEC (vereinfacht, nur 8 Befehlsbits)", "NEC (simplifié)")], [T("Bit 0 / Bit 1", "Bit 0 / bit 1"), "0,56 ms / 1,69 ms Pause"]] }; },
  wire: [["Kuppel zu dir: Pin 1 = OUT, Pin 2 = GND, Pin 3 = VS", "Dôme vers toi : 1 = OUT, 2 = GND, 3 = VS"], ["VS über 100 Ω an +5 V oder 3,3 V, 4,7 µF von VS nach GND", "VS via 100 Ω, 4,7 µF vers GND"], ["OUT direkt an einen Eingangspin", "OUT directement sur une entrée"]],
  notes: [["Die Trägerschwingung (38 kHz) ist im Bild stark verlangsamt gezeichnet.", "La porteuse est dessinée très ralentie."], ["Die Pinbelegung anderer Typen (VS1838, KY-022) weicht teils ab – immer im Datenblatt nachsehen.", "Le brochage du VS1838 peut différer."]] };

PROJ.a4988 = { t: ["Schrittmotor treiben (A4988 / DRV8825)", "Piloter un moteur pas à pas (A4988)"], flow: ["STEP + DIR", "A4988", "Schrittmotor"],
  d: ["Jeder Impuls an STEP dreht den Motor einen Schritt weiter, DIR bestimmt die Richtung. Mit Mikroschritten teilt der Treiber jeden Schritt in bis zu 16 kleine – der Motor läuft ruhiger.", "Chaque impulsion sur STEP avance d’un pas ; DIR fixe le sens. Les micropas adoucissent la rotation."],
  opts: [{ k: "ms", l: ["Mikroschritte", "Micropas"], o: [["1", "Vollschritt"], ["2", "1/2"], ["4", "1/4"], ["8", "1/8"], ["16", "1/16"]], def: "16" }, { k: "dir", l: ["Richtung (DIR)", "Sens (DIR)"], o: [["1", "HIGH"], ["0", "LOW"]], def: "1" }],
  params: [{ k: "f", l: ["Schrittfrequenz", "Fréquence de pas"], min: 10, max: 10000, def: 1600, log: 1, u: "Hz" }],
  build: function(P){ var ms = +P.ms, f = P.f, spr = 200 * ms, rpm = f / spr * 60, w = [];
    if (rpm > 600) w.push(T("Über etwa 600 U/min verlieren die meisten Schrittmotoren Schritte.", "Au-delà de 600 tr/min environ, le moteur perd des pas."));
    return { span: 6 / f, speed: 1, warn: w, ch: [{ n: "STEP", c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, f, 0, .5) * 5; } }, { n: "DIR", c: C.pink, lo: 0, hi: 5, v: function(){ return +P.dir * 5; } }, { n: T("Spulenstrom A", "Courant bobine A"), c: C.green, lo: -1.2, hi: 1.2, v: function(t){ return Math.cos(Math.PI / 2 * Math.floor(cnt(t, f, 0)) / ms * (P.dir === "1" ? 1 : -1)); } }],
      info: [[T("Schritte pro Umdrehung", "Pas par tour"), String(spr)], [T("Drehzahl", "Vitesse"), rpm.toFixed(1).replace(".", ",") + " U/min"], [T("Winkel je Impuls", "Angle par impulsion"), (1.8 / ms).toFixed(3).replace(".", ",") + "°"]] }; },
  wire: [["VMOT → 12 V mit 100 µF direkt am Modul, GND daneben", "VMOT → 12 V avec 100 µF sur le module"], ["VDD → 3,3 oder 5 V, GND", "VDD → 3,3 ou 5 V, GND"], ["STEP und DIR an zwei Pins; RST und SLP verbinden; EN → GND", "STEP et DIR sur deux broches ; relier RST et SLP ; EN → GND"], ["MS1, MS2, MS3 wählen die Mikroschritte (alle HIGH = 1/16)", "MS1…MS3 choisissent les micropas"], ["Motor: eine Spule an 1A/1B, die andere an 2A/2B", "Moteur : une bobine sur 1A/1B, l’autre sur 2A/2B"]],
  notes: [["Vor dem Einschalten den Strom am Poti einstellen (Vref). Nie den Motor bei eingeschalteter Spannung abziehen – das zerstört den Treiber.", "Régler le courant (Vref) avant ; ne jamais débrancher le moteur sous tension."], ["Der DRV8825 kann bis 1/32 Schritt und mehr Strom – Pinbelegung fast gleich.", "Le DRV8825 va jusqu’à 1/32 de pas."]] };

/* ---- Projekte mit mehreren Bauteilen ---- */
PROJ.k_ampel = { t: ["Verkehrsampel: 555 → CD4017 → Dioden → 3 LEDs", "Feu tricolore : 555 → CD4017 → diodes → 3 LED"], flow: ["NE555 (Takt)", "CD4017 (8 Schritte)", "Dioden-ODER", "Rot · Gelb · Grün"], ics: ["ne555", "cd4017"],
  d: ["Der 555 gibt den Takt, der 4017 zählt acht Schritte. Dioden fassen mehrere Ausgänge zu einer Lampe zusammen: Rot leuchtet in den Schritten 0–3, Gelb in Schritt 3 und 7, Grün in 4–6. So entsteht der echte Ampelablauf Rot → Rot-Gelb → Grün → Gelb, ganz ohne Mikrocontroller.", "Le 555 donne l’horloge, le 4017 compte huit pas ; des diodes regroupent les sorties pour chaque lampe."],
  params: [{ k: "f", l: ["Tempo (Schritte pro Sekunde)", "Vitesse (pas par seconde)"], min: .2, max: 5, def: 1, log: 1, u: "Hz" }],
  build: function(P){ var f = P.f, ph = .1 / f; function st(t){ return cnt(t, f, ph) % 8; } function L(t){ var s = st(t); return [s <= 3 ? 1 : 0, s === 3 || s === 7 ? 1 : 0, s >= 4 && s <= 6 ? 1 : 0]; }
    return { span: 9 / f, speed: 1, warn: [], ch: [{ n: T("Takt (555)", "Horloge (555)"), c: C.amber, lo: 0, hi: 5, v: function(t){ return sq(t, f, ph, .5) * 5; } }, { n: T("Rot", "Rouge"), c: C.red, lo: 0, hi: 5, v: function(t){ return L(t)[0] * 5; } }, { n: T("Gelb", "Jaune"), c: C.amber, lo: 0, hi: 5, v: function(t){ return L(t)[1] * 5; } }, { n: T("Grün", "Vert"), c: C.green, lo: 0, hi: 5, v: function(t){ return L(t)[2] * 5; } }],
      info: [[T("Ein Umlauf", "Un cycle"), fmt(8 / f, "s")], [T("Ablauf", "Séquence"), T("Rot (3) → Rot-Gelb (1) → Grün (3) → Gelb (1)", "Rouge (3) → rouge-jaune (1) → vert (3) → jaune (1)")]],
      live: function(ts){ return { leds: L(ts), names: [T("Rot", "Rouge"), T("Gelb", "Jaune"), T("Grün", "Vert")] }; } }; },
  wire: [["NE555 als Blinker: R1 = 10 kΩ, R2 = 68 kΩ, C = 10 µF ergibt etwa 1 Schritt pro Sekunde", "NE555 en clignotant : 10 kΩ, 68 kΩ, 10 µF ≈ 1 pas par seconde"], ["555 Pin 3 → CD4017 Pin 14 (CLK); CD4017 Pin 13 (CE) → GND", "555 broche 3 → 4017 broche 14 ; broche 13 → GND"], ["Q8 (Pin 9) → RESET (Pin 15): nach acht Schritten beginnt es von vorn", "Q8 (9) → RESET (15) : huit pas puis retour"], ["Rot: Dioden 1N4148 von Q0, Q1, Q2, Q3 (Pin 3, 2, 4, 7) auf einen Punkt → 330 Ω → rote LED → GND", "Rouge : diodes depuis Q0…Q3 → 330 Ω → LED rouge"], ["Gelb: Dioden von Q3 und Q7 (Pin 7, 6) → 330 Ω → gelbe LED", "Jaune : diodes depuis Q3 et Q7"], ["Grün: Dioden von Q4, Q5, Q6 (Pin 10, 1, 5) → 330 Ω → grüne LED", "Vert : diodes depuis Q4, Q5, Q6"]],
  notes: [["Die Dioden verhindern, dass ein HIGH-Ausgang direkt gegen einen LOW-Ausgang arbeitet – das wäre ein Kurzschluss zwischen zwei Pins.", "Les diodes évitent qu’une sortie haute court-circuite une sortie basse."], ["Mit einem zweiten Satz LEDs (vertauscht) wird daraus eine Kreuzung mit Fußgängerampel.", "Avec un second jeu de LED inversé : un carrefour."]] };

PROJ.k_thermo = { t: ["Thermostat: LM35 → LM393 → BC337 → Relais", "Thermostat : LM35 → LM393 → BC337 → relais"], flow: ["LM35 (10 mV/°C)", "LM393 vergleicht mit Sollwert", "BC337", "Relais schaltet Heizung"], ics: ["lm35", "lm393", "bc337"],
  d: ["Der LM35 misst die Temperatur, ein Poti stellt den Sollwert ein. Der Komparator vergleicht beides: Ist es zu kalt, schaltet der Transistor das Relais und damit die Heizung ein. Ein großer Widerstand vom Ausgang zurück (Hysterese) verhindert, dass das Relais am Sollwert ständig klappert.", "Le LM35 mesure, un potentiomètre fixe la consigne ; le comparateur enclenche le relais quand il fait trop froid."],
  params: [{ k: "Ts", l: ["Sollwert", "Consigne"], min: 15, max: 30, def: 21, u: "°C" }, { k: "H", l: ["Hysterese", "Hystérésis"], min: .1, max: 2, def: .5, u: "°C" }],
  build: function(P){ var per = 40; function temp(t){ return 21 + 4 * Math.sin(2 * Math.PI * t / per); }
    function rel(t){ var on = temp(0) < P.Ts, step = per / 400; for (var x = 0; x <= t; x += step){ var v = temp(x); if (on && v > P.Ts + P.H / 2) on = false; else if (!on && v < P.Ts - P.H / 2) on = true; } return on ? 1 : 0; }
    return { span: per * 1.5, speed: 4, warn: [], ch: [{ n: T("Temperatur", "Température"), c: C.amber, lo: 15, hi: 27, u: "°C", v: temp }, { n: T("Sollwert", "Consigne"), c: C.pink, lo: 15, hi: 27, u: "°C", v: function(){ return P.Ts; } }, { n: T("Relais (Heizung)", "Relais (chauffage)"), c: C.green, lo: 0, hi: 1.2, u: "", v: rel }],
      info: [[T("Spannung am LM35 beim Sollwert", "Tension du LM35 à la consigne"), fmt(P.Ts * .01, "V")], [T("Heizung ein unter", "Chauffage en dessous de"), (P.Ts - P.H / 2).toFixed(2).replace(".", ",") + " °C"], [T("Heizung aus über", "Arrêt au-dessus de"), (P.Ts + P.H / 2).toFixed(2).replace(".", ",") + " °C"]],
      live: function(ts){ return { leds: [rel(ts % (per * 1.5))], names: [T("Relais", "Relais")] }; } }; },
  wire: [["LM35: +5 V, Ausgang an LM393 Pin 2 (−IN)", "LM35 : +5 V, sortie vers LM393 broche 2"], ["Sollwert: Poti 10 kΩ mit 47 kΩ in Reihe zwischen +5 V und GND, Schleifer an Pin 3 (+IN) – etwa 0…0,9 V entspricht 0…90 °C", "Consigne : potentiomètre 10 kΩ + 47 kΩ, curseur sur la broche 3"], ["Hysterese: 1 MΩ von Pin 1 (Ausgang) an Pin 3", "Hystérésis : 1 MΩ de la broche 1 vers 3"], ["Pin 1: 4,7 kΩ nach +5 V (offener Kollektor), dann 1 kΩ an die Basis des BC337", "Broche 1 : 4,7 kΩ vers +5 V, puis 1 kΩ vers la base du BC337"], ["Relais-Spule zwischen +5 V und Kollektor, Freilaufdiode 1N4007 parallel (Ring an +5 V); Emitter → GND", "Bobine du relais entre +5 V et collecteur, diode de roue libre ; émetteur → GND"]],
  notes: [["Ist die Temperatur kleiner als der Sollwert, liegt −IN unter +IN – der Ausgang bleibt offen, der Pull-up schaltet den Transistor ein: Heizung an.", "Plus froid que la consigne : sortie ouverte, le pull-up active le transistor."], ["Für eine Kühlung statt Heizung tauscht man einfach die beiden Eingänge.", "Pour refroidir : inverser les deux entrées."], ["Netzspannung nur über ein geprüftes Relaismodul schalten.", "Ne commuter le secteur qu’avec un module relais certifié."]] };

PROJ.k_netz = { t: ["Labornetzteil: Trafo → Gleichrichter → Elko → LM317", "Alimentation de labo : transfo → pont → condensateur → LM317"], flow: ["Trafo 12 V~", "Brückengleichrichter", "2200 µF", "LM317 + Poti", "1,25…15 V"], ics: ["d1n4007", "lm317"],
  d: ["Das klassische regelbare Netzteil: Der Trafo setzt die Spannung herab, vier Dioden richten sie gleich, der Elko glättet und der LM317 regelt sauber auf den Wert, den du am Poti einstellst. Erhöhe den Strom und sieh, ab wann der Brumm zum Ausgang durchkommt.", "L’alimentation réglable classique : transfo, pont de diodes, condensateur et LM317."],
  params: [{ k: "pos", l: ["Poti-Stellung", "Position du potentiomètre"], min: 0, max: 100, def: 40, int: 1, u: "%" }, { k: "I", l: ["Laststrom", "Courant de charge"], min: .01, max: 1.5, def: .3, log: 1, u: "A" }],
  build: function(P){ var pk = 12 * Math.SQRT2 - 1.4, dU = Math.min(pk, P.I / (100 * 2200e-6)), R2 = P.pos / 100 * 5000, vs = 1.25 * (1 + R2 / 240), w = [];
    function vc(t){ var x = ((t * 100 - .5) % 1 + 1) % 1; return Math.max(Math.abs(sineAt(t, 50, 12 * Math.SQRT2)) - 1.4, pk - dU * x); }
    function vo(t){ return Math.max(0, Math.min(vs, vc(t) - 2.5)); }
    if (pk - dU < vs + 2.5) w.push(T("Der Elko fällt zwischen den Halbwellen zu weit ab – am Ausgang kommt Brumm durch. Weniger Strom, größerer Elko oder kleinere Ausgangsspannung.", "Le condensateur descend trop : l’ondulation passe en sortie."));
    var Pv = Math.max(0, (pk - dU / 2 - vs)) * P.I; if (Pv > 1.5) w.push(T("Über 1,5 W Verlust im LM317 – Kühlkörper nötig.", "Plus de 1,5 W dans le LM317 : dissipateur obligatoire."));
    return { span: .04, speed: 1, warn: w, ch: [{ n: T("Trafo (Wechselspannung)", "Transfo (alternatif)"), c: C.amber, lo: -18, hi: 18, v: function(t){ return sineAt(t, 50, 12 * Math.SQRT2); } }, { n: T("Am Elko", "Au condensateur"), c: C.pink, lo: 0, hi: 18, v: vc }, { n: T("Ausgang", "Sortie"), c: C.green, lo: 0, hi: 18, v: vo }],
      info: [[T("Eingestellte Spannung", "Tension réglée"), fmt(vs, "V")], [T("Brumm am Elko", "Ondulation au condensateur"), fmt(dU, "V")], [T("Verlust im LM317", "Pertes dans le LM317"), fmt(Pv, "W")]],
      live: function(){ return { leds: [pk - dU >= vs + 2.5 ? 1 : 0], names: [T("geregelt", "régulé")] }; } }; },
  wire: [["Trafo-Sekundärseite an die beiden ~-Anschlüsse des Brückengleichrichters", "Secondaire du transfo sur les bornes ~ du pont"], ["Plus der Brücke → 2200 µF (Plus) → LM317 IN, Minus → GND", "+ du pont → 2200 µF → IN du LM317, − → GND"], ["LM317: 240 Ω zwischen OUT und ADJ, Poti 5 kΩ zwischen ADJ und GND", "LM317 : 240 Ω entre OUT et ADJ, potentiomètre 5 kΩ entre ADJ et GND"], ["100 nF am Eingang, 10 µF am Ausgang; Diode 1N4007 von OUT nach IN (Schutz)", "100 nF à l’entrée, 10 µF en sortie, 1N4007 de OUT vers IN"]],
  notes: [["Die Netzseite (230 V) gehört in ein geschlossenes Gehäuse mit Sicherung – oder du nimmst ein fertiges Steckernetzteil mit 15…18 V Gleichspannung und lässt Trafo und Gleichrichter weg.", "Côté secteur : boîtier fermé et fusible, ou bloc secteur 15…18 V tout prêt."]] };
/* ---------- Operationsverstärker: alle Grundschaltungen im Labor-Stil (Schaltplan + Oszilloskop wie bei allen ICs) ---------- */
var OPT = [
  { id: "inv", ic: "−", n: ["Invertierend", "Inverseur"], f: "Uout = −R2/R1 · Uin",
    d: ["Das Signal wird um R2/R1 verstärkt und gedreht (Phase 180°). Der −Eingang liegt durch die Gegenkopplung auf 0 V („virtuelle Masse“); der Eingangswiderstand ist R1.", "Le signal est amplifié de R2/R1 et inversé (180°). L’entrée − est à 0 V (masse virtuelle) ; l’impédance d’entrée vaut R1."],
    p: { Ra: ["R1 (Eingang)", 10e3], Rb: ["R2 (Rückkopplung)", 47e3] },
    sim: function(q, u){ return -q.Rb / q.Ra * u; }, G: function(q){ return -q.Rb / q.Ra; }, zin: function(q){ return q.Ra; }, note: ["Phase um 180° gedreht", "phase inversée de 180°"],
    notes: [["Der Eingangswiderstand ist R1 – die Signalquelle wird also belastet.", "L’impédance d’entrée est R1 : la source est chargée."], ["Der Ausgang kann nur bis kurz vor die Versorgung gehen; bei zu großer Verstärkung wird das Signal abgeschnitten.", "La sortie ne peut aller que presque jusqu’à l’alimentation ; sinon le signal est écrêté."]] },
  { id: "nin", ic: "+", n: ["Nicht-invertierend", "Non-inverseur"], f: "Uout = (1 + R2/R1) · Uin",
    d: ["Das Signal liegt direkt am +Eingang und bleibt in Phase. Der Teiler R1/R2 vom Ausgang zum −Eingang legt die Verstärkung fest – sie ist immer mindestens 1. Der Eingangswiderstand ist sehr hoch.", "Le signal est sur l’entrée + et reste en phase. Le diviseur R1/R2 fixe le gain, toujours ≥ 1. Impédance d’entrée très élevée."],
    p: { Ra: ["R1 (gegen Masse)", 10e3], Rb: ["R2 (Rückkopplung)", 47e3] },
    sim: function(q, u){ return (1 + q.Rb / q.Ra) * u; }, G: function(q){ return 1 + q.Rb / q.Ra; }, zin: function(){ return Infinity; }, note: ["gleiche Phase", "même phase"],
    notes: [["Für Verstärkung 1 genügt der Spannungsfolger (R2 = 0, R1 weglassen).", "Pour un gain de 1, le suiveur suffit."]] },
  { id: "fol", ic: "1", n: ["Spannungsfolger", "Suiveur"], f: "Uout = Uin",
    d: ["Der Ausgang ist direkt mit dem −Eingang verbunden: Verstärkung genau 1, aber sehr hoher Eingangs- und kleiner Ausgangswiderstand. Ein Impedanzwandler, der eine schwache Quelle puffert (Sensor, Poti, Filter).", "La sortie est reliée à l’entrée − : gain 1, impédance d’entrée très élevée, sortie faible. Un adaptateur d’impédance."],
    p: {}, sim: function(q, u){ return u; }, G: function(){ return 1; }, zin: function(){ return Infinity; }, note: ["Impedanzwandler", "adaptateur d’impédance"],
    notes: [["Typisch: Sensor mit hochohmigem Ausgang vor einen ADC schalten.", "Typique : capteur à sortie haute impédance devant un CAN."]] },
  { id: "sum", ic: "Σ", n: ["Addierer", "Sommateur"], f: "Uout = −R4 · (U1/R1 + U2/R2 + U3/R3)",
    d: ["Jede Eingangsspannung geht über einen eigenen Widerstand an den −Eingang; dort addieren sich die Ströme. Der Ausgang ist die negative, gewichtete Summe – die Grundlage von Mischpult und DA-Wandler.", "Chaque entrée passe par sa résistance vers l’entrée − : les courants s’additionnent. Base du mélangeur et du CNA."],
    p: { Ra: ["R1", 10e3], Rb: ["R2", 10e3], Rc: ["R3", 10e3], Rd: ["R4 (Rückkopplung)", 10e3], Ua: ["U2 (fest)", .5], Ub: ["U3 (fest)", -.2] },
    sim: function(q, u){ return -q.Rd * (u / q.Ra + q.Ua / q.Rb + q.Ub / q.Rc); }, G: function(q){ return -q.Rd / q.Ra; }, zin: function(q){ return q.Ra; }, note: ["Verstärkung gilt für U1; U2 und U3 haben −R4/R2 bzw. −R4/R3", "le gain vaut pour U1 ; U2, U3 : −R4/R2, −R4/R3"],
    notes: [["Bei R1 = R2 = R3 = R4 ist Uout = −(U1 + U2 + U3).", "Avec R1 = R2 = R3 = R4 : Uout = −(U1 + U2 + U3)."]] },
  { id: "sub", ic: "Δ", n: ["Subtrahierer", "Soustracteur"], f: "Uout = R2/R1 · (U2 − U1)",
    d: ["Der Differenzverstärker bildet die Differenz zweier Spannungen und unterdrückt, was beiden gemeinsam ist (Gleichtakt). Dazu müssen die Widerstandspaare R1 = R3 und R2 = R4 genau passen.", "L’amplificateur différentiel forme la différence de deux tensions et rejette le mode commun. Il faut R1 = R3 et R2 = R4."],
    p: { Ra: ["R1 = R3", 10e3], Rb: ["R2 = R4", 10e3], Ua: ["U2 (fest)", 1] },
    sim: function(q, u){ return q.Rb / q.Ra * (q.Ua - u); }, G: function(q){ return q.Rb / q.Ra; }, zin: function(q){ return q.Ra; }, note: ["Verstärkung der Differenz (U2 − U1)", "gain de la différence (U2 − U1)"],
    notes: [["Wichtig, um kleine Signale vor großem Gleichtaktrauschen zu messen. Die Widerstände sollten 0,1 % genau sein.", "Utile pour mesurer de petits signaux malgré un grand bruit commun ; résistances à 0,1 %."]] },
  { id: "int", ic: "∫", n: ["Integrierer", "Intégrateur"], f: "Uout(t) = −1/(R1·C1) · ∫ Uin dt", dyn: 1, cs: 1,
    d: ["Der Kondensator in der Rückkopplung summiert den Eingangsstrom auf: Die Ausgangsspannung ist das Zeitintegral der Eingangsspannung. Ein Rechteck wird zum Dreieck, eine Gleichspannung zur Rampe – bis der Ausgang an die Versorgung stößt.", "Le condensateur intègre le courant d’entrée : un carré devient un triangle, un continu une rampe."],
    p: { Ra: ["R1", 10e3], Cx: ["C1", 10e-9] },
    sim: function(q, u, st, dt){ st.v = (st.v || 0) - u / (q.Ra * q.Cx) * dt; return st.v; }, tau: function(q){ return q.Ra * q.Cx; }, zin: function(q){ return q.Ra; }, note: ["Steigung = −Uin/(R1·C1)", "pente = −Uin/(R1·C1)"],
    notes: [["Ohne Gegenwiderstand parallel zu C1 driftet der Ausgang bei kleinen Offsets langsam an die Grenze.", "Sans résistance parallèle à C1, la sortie dérive vers la limite."]] },
  { id: "dif", ic: "d/dt", n: ["Differenzierer", "Dérivateur"], f: "Uout(t) = −R1·C1 · dUin/dt", dyn: 1,
    d: ["Der Kondensator am Eingang lässt nur Änderungen durch: Der Ausgang zeigt die Steilheit des Eingangssignals. Ein Dreieck wird zum Rechteck, ein Rechteck zu Nadelimpulsen.", "Le condensateur d’entrée ne laisse passer que les variations : la sortie reflète la pente."],
    p: { Ra: ["R1", 10e3], Cx: ["C1", 10e-9] },
    sim: function(q, u, st, dt){ var d = st.u0 === undefined ? 0 : (u - st.u0) / dt; st.u0 = u; return -q.Ra * q.Cx * d; }, tau: function(q){ return q.Ra * q.Cx; }, zin: function(){ return null; }, note: ["Verstärkung steigt mit der Frequenz: |G| = 2π·f·R1·C1", "gain croissant avec la fréquence"],
    notes: [["Rauschempfindlich; in der Praxis kommt ein kleiner Widerstand in Reihe zu C1.", "Sensible au bruit ; en pratique une petite résistance en série avec C1."]] },
  { id: "lp", ic: "〰", n: ["Aktiver Tiefpass", "Passe-bas actif"], f: "G = −R2/R1 ; fg = 1/(2π·R2·C1)", dyn: 1, cs: 1,
    d: ["Ein invertierender Verstärker mit Kondensator parallel zu R2: Tiefe Frequenzen werden mit R2/R1 verstärkt, hohe fallen oberhalb der Grenzfrequenz mit 20 dB je Dekade ab.", "Un inverseur avec un condensateur en parallèle de R2 : passe-bas actif du 1er ordre."],
    p: { Ra: ["R1", 10e3], Rb: ["R2", 47e3], Cx: ["C1", 1e-9] },
    sim: function(q, u, st, dt){ var tau = q.Rb * q.Cx, n = Math.max(1, Math.ceil(dt / (tau / 20))), h = dt / n, y = st.y || 0; for (var k = 0; k < n; k++) y += (-q.Rb / q.Ra * u - y) / tau * h; st.y = y; return y; },
    tau: function(q){ return q.Rb * q.Cx; }, G: function(q){ return -q.Rb / q.Ra; }, zin: function(q){ return q.Ra; }, note: function(q){ return [fmt(1 / (2 * Math.PI * q.Rb * q.Cx), "Hz") + " Grenzfrequenz", fmt(1 / (2 * Math.PI * q.Rb * q.Cx), "Hz") + " fréquence de coupure"]; },
    notes: [["Erhöhe die Frequenz über fg: Die Amplitude am Ausgang sinkt und die Kurve verschleift.", "Monte la fréquence au-delà de fg : l’amplitude baisse."]] },
  { id: "cmp", ic: "⏚", n: ["Komparator", "Comparateur"], f: "Uout = +Usat wenn Uin > Uref, sonst −Usat",
    d: ["Ohne Rückkopplung vergleicht der Opamp nur: Ist Uin größer als Uref, springt der Ausgang an die positive Versorgung, sonst an die negative. Kein Verstärker, sondern ein Schalter.", "Sans contre-réaction l’ampli compare : la sortie bascule vers l’alimentation positive ou négative."],
    p: { Ur: ["Uref", 0] },
    sim: function(q, u, st, dt, lim){ return u > q.Ur ? lim : -lim; }, zin: function(){ return Infinity; }, note: ["Ausgang springt an die Versorgungsgrenzen", "la sortie bascule aux limites"],
    notes: [["Rauschen am Eingang lässt den Ausgang flattern – dagegen hilft der Schmitt-Trigger.", "Le bruit fait vibrer la sortie – le trigger de Schmitt y remédie."]] },
  { id: "sch", ic: "⎍", n: ["Schmitt-Trigger", "Trigger de Schmitt"], f: "U_H/U_L = Uref·(1 + R1/R2) ∓ Usat·R1/R2",
    d: ["Mitkopplung über R2 erzeugt zwei Schaltschwellen (Hysterese): Das Signal muss erst über die obere Schwelle steigen und dann unter die untere fallen, bevor der Ausgang kippt. Rauschen und Prellen stören nicht mehr.", "La réaction positive crée deux seuils (hystérésis) : le bruit ne fait plus basculer la sortie."],
    p: { Ra: ["R1", 10e3], Rb: ["R2", 47e3], Ur: ["Uref", 0] },
    sim: function(q, u, st, dt, lim){ var k = q.Ra / q.Rb, hi = q.Ur * (1 + k) + lim * k, lo = q.Ur * (1 + k) - lim * k; if (st.s === undefined) st.s = -1; if (u > hi) st.s = 1; else if (u < lo) st.s = -1; return st.s * lim; },
    zin: function(q){ return q.Ra + q.Rb; }, note: function(q, lim){ var k = q.Ra / q.Rb, a = fmt(q.Ur * (1 + k) - lim * k, "V"), b = fmt(q.Ur * (1 + k) + lim * k, "V"); return ["Schwellen " + a + " / " + b + " (Hysterese " + fmt(2 * lim * k, "V") + ")", "seuils " + a + " / " + b + " (hystérésis " + fmt(2 * lim * k, "V") + ")"]; },
    notes: [["Größeres R1/R2 = breitere Hysterese = unempfindlicher gegen Rauschen, aber ungenauere Schaltschwelle.", "R1/R2 plus grand = hystérésis plus large."]] },
  { id: "tia", ic: "I→U", n: ["Transimpedanz", "Transimpédance"], f: "Uout = −Iin · R1",
    d: ["Wandelt einen kleinen Strom (z. B. einer Fotodiode) in eine Spannung. Die Quelle sieht eine virtuelle Masse, Uout = −Iin · R1. Für schnelle Fotodioden kommt ein kleiner Kondensator parallel zu R1.", "Convertit un courant (photodiode) en tension : Uout = −Iin · R1."],
    p: { Rb: ["R1 (Rückkopplung)", 100e3] }, cur: 1,
    sim: function(q, u){ return -q.Rb * u; }, zin: function(){ return 0; }, note: function(q){ return ["Transimpedanz = −R1 = " + fmt(q.Rb, "V/A"), "transimpédance = −R1 = " + fmt(q.Rb, "V/A")]; },
    notes: [["Fotodioden liefern nur Mikroampere – darum der große Rückkopplungswiderstand.", "Une photodiode ne donne que des microampères."]] }
];
var OPD = { lm358: [1e6, .3, "LM358"], lm324: [1e6, .5, "LM324"], tl072: [3e6, 13, "TL072"], tl071: [3e6, 13, "TL071"], tl074: [3e6, 13, "TL074"], ne5532: [10e6, 9, "NE5532"], mcp6002: [1e6, .6, "MCP6002"], lm741: [1e6, .5, "LM741"] };
function bodeAn(cv, B){
  var dpr = Math.min(2, window.devicePixelRatio || 1), W = cv.parentNode.clientWidth || 600, H = 300; cv.style.width = W + "px"; cv.style.height = H + "px"; cv.width = W * dpr; cv.height = H * dpr;
  var c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.fillStyle = "#050a0a"; c.fillRect(0, 0, W, H);
  var L = 46, R = 10, t1 = 22, b1 = 150, t2 = 172, b2 = H - 22, lo = Math.log10(10), hi = Math.log10(10e6), N = 140, g = [], ph = [], i, f;
  for (i = 0; i <= N; i++){ f = Math.pow(10, lo + (hi - lo) * i / N); var h = B.h(f); g.push(h[0]); ph.push(h[1]); }
  var gmax = Math.max.apply(null, g), gmin = Math.min.apply(null, g), top = Math.ceil((gmax + 3) / 20) * 20, bot = Math.min(top - 40, Math.floor((Math.max(gmin, top - 100)) / 20) * 20);
  function X(f){ return L + (Math.log10(f) - lo) / (hi - lo) * (W - L - R); } function Yg(v){ return t1 + (top - v) / (top - bot) * (b1 - t1); } function Yp(v){ return t2 + (180 - v) / 360 * (b2 - t2); }
  c.font = "10px Inter,system-ui,sans-serif"; c.textBaseline = "alphabetic";
  for (var d = 1; d <= 7; d++){ for (var m = 1; m < 10; m++){ f = m * Math.pow(10, d); if (f < 10 || f > 10e6) continue; c.strokeStyle = m === 1 ? "rgba(109,255,176,.28)" : "rgba(109,255,176,.08)"; c.beginPath(); c.moveTo(X(f), t1); c.lineTo(X(f), b2); c.stroke(); if (m === 1){ c.fillStyle = "rgba(160,255,200,.75)"; c.textAlign = f >= 1e7 ? "right" : "center"; c.fillText(fmt(f, "Hz", 2), X(f), H - 7); } } }
  c.textAlign = "right"; c.fillStyle = "rgba(160,255,200,.75)"; for (var v = bot; v <= top; v += 20){ c.strokeStyle = "rgba(109,255,176,.14)"; c.beginPath(); c.moveTo(L, Yg(v)); c.lineTo(W - R, Yg(v)); c.stroke(); c.fillText(v + " dB", L - 4, Yg(v) + 3); }
  [-180, -90, 0, 90, 180].forEach(function(pp){ c.strokeStyle = "rgba(109,255,176,.14)"; c.beginPath(); c.moveTo(L, Yp(pp)); c.lineTo(W - R, Yp(pp)); c.stroke(); c.fillText(pp + "°", L - 4, Yp(pp) + 3); });
  function line(a, Y, col){ c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); a.forEach(function(v, j){ var x = X(Math.pow(10, lo + (hi - lo) * j / N)), y = Math.max(t1 - 2, Math.min(b2 + 2, Y(v))); j ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); c.lineWidth = 1; }
  line(g, Yg, "#ffb000"); line(ph, Yp, "#3de6ff");
  c.textAlign = "left"; c.font = "bold 11px Inter,system-ui,sans-serif"; c.fillStyle = "#ffb000"; c.fillText(T("Verstärkung", "Gain"), L + 4, t1 - 8); c.fillStyle = "#3de6ff"; c.fillText("Phase", L + 4, t2 - 6);
  function mark(f0, col, txt, y){ if (!(f0 >= 10 && f0 <= 10e6)) return; c.strokeStyle = col; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(X(f0), t1); c.lineTo(X(f0), b2); c.stroke(); c.setLineDash([]); c.fillStyle = col; c.textAlign = X(f0) > W - 90 ? "right" : "left"; c.fillText(txt, X(f0) + (c.textAlign === "left" ? 4 : -4), y); }
  mark(B.f, "#ffb000", T("Signal ", "Signal ") + fmt(B.f, "Hz", 2), b1 - 4); mark(B.fb, "#3de6ff", "−3 dB " + fmt(B.fb, "Hz", 3), t1 + 12);
}
function shn(n){ n = String(n || ""); var a = n.split(" / "); if (a.length > 1 && /^\d{2}$/.test(a[1].trim()) && /\d{2}$/.test(a[0])) return a[0].replace(/\d{2}$/, "xx"); return a[0].split(" (")[0]; }
function opType(id){ for (var i = 0; i < OPT.length; i++) if (OPT[i].id === id) return OPT[i]; return OPT[0]; }
function niceMax(x){ if (!(x > 0)) return 1; var e = Math.pow(10, Math.floor(Math.log(x) / Math.LN10)), m = x / e; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e; }
PROJ.opamp = { t: ["Operationsverstärker – alle Grundschaltungen", "Ampli op – tous les montages de base"], flow: ["Beschaltung wählen", "Werte einstellen", "Schaltplan und Oszilloskop"], ics: ["lm358"],
  d: ["Ein Operationsverstärker wird erst durch seine Beschaltung zu einem Verstärker, Addierer, Integrator oder Komparator. Wähle die Beschaltung, stelle die Bauteilwerte ein und sieh Schaltplan und Verlauf am Oszilloskop. Das gilt für alle Opamps: LM358, LM324, TL071/072/074, NE5532, LM741, MCP6002 – der Schaltplan zeigt den Chip, von dem du gekommen bist.", "Un ampli op devient amplificateur, sommateur, intégrateur ou comparateur selon son montage. Choisis le montage, règle les valeurs et observe."],
  opts: [{ k: "m", l: ["Beschaltung", "Montage"], o: OPT.map(function(t){ return [t.id, [t.ic + "  " + t.n[0], t.ic + "  " + t.n[1]]]; }), def: "inv" }, { k: "w", l: ["Signal", "Signal"], o: [["sin", ["Sinus", "Sinus"]], ["rect", ["Rechteck", "Carré"]], ["dc", ["Gleichspannung", "Continu"]]], def: "sin" }],
  params: [
    { k: "Ra", l: ["R1", "R1"], min: 1e3, max: 1e6, def: 10e3, log: 1, u: "Ω", e12: 1 }, { k: "Rb", l: ["R2", "R2"], min: 1e3, max: 1e6, def: 47e3, log: 1, u: "Ω", e12: 1 },
    { k: "Rc", l: ["R3", "R3"], min: 1e3, max: 1e6, def: 10e3, log: 1, u: "Ω", e12: 1 }, { k: "Rd", l: ["R4", "R4"], min: 1e3, max: 1e6, def: 10e3, log: 1, u: "Ω", e12: 1 },
    { k: "Cx", l: ["C1", "C1"], min: 1e-10, max: 1e-6, def: 10e-9, log: 1, u: "F", e12: 1 },
    { k: "Ua", l: ["U2", "U2"], min: -5, max: 5, def: .5, u: "V" }, { k: "Ub", l: ["U3", "U3"], min: -5, max: 5, def: -.2, u: "V" }, { k: "Ur", l: ["Uref", "Uref"], min: -5, max: 5, def: 0, u: "V" },
    { k: "A", l: ["Eingangsamplitude", "Amplitude d’entrée"], min: .01, max: 10, def: .5, log: 1, u: "V" }, { k: "Ai", l: ["Eingangsstrom", "Courant d’entrée"], min: 1e-6, max: 1e-3, def: 20e-6, log: 1, u: "A" },
    { k: "Uo", l: ["Offset", "Offset"], min: -5, max: 5, def: 0, u: "V" }, { k: "f", l: ["Frequenz", "Fréquence"], min: 10, max: 100e3, def: 1000, log: 1, u: "Hz" },
    { k: "Vs", l: ["Versorgung ±Vs", "Alimentation ±Vs"], min: 5, max: 15, def: 12, u: "V" }],
  dyn: ["Ra", "Rb", "Rc", "Rd", "Cx", "Ua", "Ub", "Ur", "A", "Ai", "Uo"],
  init: function(P){ var h = (location.hash.split("/")[2] || ""); if (/^(inv|nin|fol|sum|sub|int|dif|lp|cmp|sch|tia)$/.test(h) && h !== P.m){ P.m = h; opDefaults(P); } if (!OPT.some(function(t){ return t.id === P.m; })) P.m = "inv"; },
  onOpt: function(P, k){ if (k === "m") opDefaults(P); },
  ui: function(P){ var t = opType(P.m), u = {}; Object.keys(t.p).forEach(function(k){ u[k] = t.p[k][0]; }); if (t.cur){ u.Ai = T("Eingangsstrom Iin", "Courant Iin"); } else { u.A = T("Eingangsamplitude", "Amplitude d’entrée"); u.Uo = T("Offset", "Offset"); } return u; },
  notes: [["Komparator-ICs wie LM393 und LM339 sind Opamps, die nur für den Vergleich gebaut sind: schneller beim Umschalten, mit offenem Kollektor am Ausgang. Für Verstärker-Beschaltungen taugen sie nicht.", "Les comparateurs LM393/LM339 sont des amplis op spécialisés dans la comparaison, à collecteur ouvert."]],
  build: function(P){ return opBuild(P); } };
function opDefaults(P){ var t = opType(P.m); Object.keys(t.p).forEach(function(k){ P[k] = t.p[k][1]; }); }
function opBuild(P){
  var t = opType(P.m), q = P, tia = !!t.cur, Vs = P.Vs, lim = Math.max(.5, Vs - 1.5), N = 480, st = {}, tau = t.tau ? t.tau(q) : 0, f = P.f, amp = tia ? P.Ai : P.A, off = tia ? 0 : P.Uo;
  var D = OPD[opIC()] || OPD.lm358, GBW = D[0], SR = D[1] * 1e6, G0 = t.G ? t.G(q) : null, real = G0 != null && t.id !== "cmp" && t.id !== "sch" && !t.tau, NG = real ? (t.id === "fol" ? 1 : t.id === "nin" ? Math.abs(G0) : Math.abs(G0) + 1) : 1, fb = GBW / NG, tauB = 1 / (2 * Math.PI * fb), yl = 0, yp = 0, slewHit = false;
  var win = P.w === "dc" && t.dyn ? Math.max(5 * tau, 1e-6) : 3 / f, dt = win / N, U = [], Y = [], uMax = 0, yMax = 0, clip = false;
  for (var i = 0; i < N; i++){ var tt = i * dt, ph = (tt * f) % 1, u = P.w === "dc" ? amp : P.w === "sin" ? amp * Math.sin(2 * Math.PI * tt * f) : (ph < .5 ? amp : -amp); u += off; U.push(u);
    var y = t.sim(q, u, st, dt, lim); if (y > lim){ y = lim; clip = true; } if (y < -lim){ y = -lim; clip = true; }
    if (real){ if (!i){ yl = y; } else { yl += (y - yl) * dt / (tauB + dt); var mx = SR * dt, dy = yl - yp; if (Math.abs(dy) > mx){ yl = yp + (dy > 0 ? mx : -mx); slewHit = true; } } y = yl; yp = y; }
    if (t.cs){ st.v = y; st.y = y; } Y.push(y); uMax = Math.max(uMax, Math.abs(u)); yMax = Math.max(yMax, Math.abs(y)); }
  var m1 = niceMax(uMax * 1.15 || 1), m2 = niceMax(yMax * 1.15 || 1), nt = typeof t.note === "function" ? t.note(q, lim) : t.note, G = t.G ? t.G(q) : null, zin = t.zin ? t.zin(q) : null, info = [];
  info.push([T("Beschaltung", "Montage"), T(t.n[0], t.n[1])]); info.push([T("Formel", "Formule"), t.f]);
  if (G != null){ info.push([T("Verstärkung", "Gain"), (+G.toPrecision(4)).toString().replace(".", ",") + " ×  (" + (+(20 * Math.log10(Math.abs(G))).toPrecision(3)).toString().replace(".", ",") + " dB)"]); }
  if (zin != null) info.push([T("Eingangswiderstand", "Impédance d’entrée"), zin === Infinity ? "≈ ∞" : fmt(zin, "Ω")]);
  info.push([T("Ausgang max.", "Sortie max."), fmt(yMax, "V")]); if (tau) info.push(["τ", fmt(tau, "s")]); if (nt) info.push([T("Hinweis", "Remarque"), T(nt[0], nt[1])]);
  if (real){ info.push([T("Bandbreite (−3 dB)", "Bande passante (−3 dB)"), fmt(fb, "Hz", 3) + " · " + D[2]]); info.push([T("Slew-Rate", "Slew rate"), +(D[1]).toPrecision(2) + " V/µs"]); }
  var w = []; if (real && slewHit) w.push(T("Slew-Rate-Grenze: Der Ausgang kann nicht schnell genug folgen – das Signal wird zum Dreieck verzerrt. Frequenz oder Amplitude verkleinern.", "Limite de slew rate : la sortie ne peut pas suivre assez vite.")); if (clip && t.id !== "cmp" && t.id !== "sch") w.push(T("Der Ausgang stößt an die Versorgungsgrenze (etwa ±" + (+lim.toPrecision(3)) + " V): das Signal wird abgeschnitten. Verstärkung verkleinern oder Versorgung erhöhen.", "La sortie atteint la limite d’alimentation : le signal est écrêté."));
  var bode = real ? { f: f, fb: fb, h: function(ff){ var x = ff / fb, re = 1, im = -x, dn = re * re + im * im, gm = Math.abs(G0) / Math.sqrt(dn), pp = Math.atan2(im, re) * 180 / Math.PI + (G0 < 0 ? 180 : 0); while (pp > 180) pp -= 360; return [20 * Math.log10(Math.max(gm, 1e-6)), pp]; } } : null;
  return { span: win, speed: 1, warn: w, info: info, bode: bode, more: { d: t.d, f: t.f, notes: t.notes },
    ch: [{ n: tia ? T("Eingang Iin", "Entrée Iin") : T("Eingang Uin", "Entrée Uin"), c: C.amber, lo: -m1, hi: m1, a: U, u: tia ? "A" : "V" }, { n: T("Ausgang Uout", "Sortie Uout"), c: C.green, lo: -m2, hi: m2, a: Y }] };
}
/* ---------- Bausteine der individuellen Projekte ---------- */
var CUST = {};
CUST.gates = function(box){
  function all(a){ return a.every(function(x){ return x; }); } function any(a){ return a.some(function(x){ return x; }); }
  var G = [["NAND", "7400 · 74HC00 · CD4011 · 74LVC1G00", function(a){ return !all(a); }, 2], ["NOR", "7402 · 74HC02 · CD4001", function(a){ return !any(a); }, 2], ["AND", "7408 · 74HC08 · CD4081 · 74LVC1G08", all, 2], ["OR", "7432 · 74HC32 · CD4071", any, 2], ["XOR", "7486 · 74HC86 · CD4070", function(a){ return a[0] !== a[1]; }, 2], ["XNOR", "74266 · CD4077", function(a){ return a[0] === a[1]; }, 2],
    ["NOT", "7404 · 74HC04 · CD4069 · 74LVC1G04", function(a){ return !a[0]; }, 1], ["NOT Schmitt", "7414 · 74HC14 · 74LVC1G14", function(a){ return !a[0]; }, 1, T("Schmitt-Trigger-Eingang: zwei Schaltschwellen, saubere Flanken aus langsamen Signalen.", "Entrée à trigger de Schmitt : deux seuils.")],
    ["Puffer", "7407 · 74LVC1G17 · 74125", function(a){ return a[0]; }, 1, T("Puffer: Der Ausgang folgt dem Eingang, liefert aber mehr Strom. 7407 mit offenem Kollektor bis 30 V, 74125 mit abschaltbarem Ausgang (Tri-State).", "Tampon : la sortie suit l’entrée avec plus de courant.")],
    ["NAND 3", "7410 · CD4023 · 7412 (OK)", function(a){ return !all(a); }, 3], ["AND 3", "7411 · CD4073", all, 3], ["NOR 3", "7427 · CD4025", function(a){ return !any(a); }, 3],
    ["NAND 4", "7420 · CD4012 · 7440 (Leistung)", function(a){ return !all(a); }, 4], ["AND 4", "7421 · CD4082", all, 4], ["NOR 4", "CD4002", function(a){ return !any(a); }, 4],
    ["NAND 8", "7430", function(a){ return !all(a); }, 4, T("Der 7430 hat acht Eingänge. Hier sind vier gezeigt – die anderen vier liegen auf HIGH.", "Le 7430 a huit entrées ; quatre sont montrées, les autres à HIGH.")],
    ["NAND (OK)", "7403 · 74132 (Schmitt) · 7437 · 7438", function(a){ return !all(a); }, 2, T("Varianten: 7403 mit offenem Kollektor (Pull-up nötig), 74132 mit Schmitt-Trigger, 7437 als Leistungs-NAND.", "Variantes : 7403 à collecteur ouvert, 74132 à trigger de Schmitt, 7437 de puissance.")],
    ["AND (OK)", "7409", all, 2, T("Offener Kollektor: Der Ausgang zieht nur nach Masse – ein Pull-up-Widerstand macht das HIGH.", "Collecteur ouvert : résistance de tirage nécessaire.")],
    ["NOR (OK)", "7433 · 7428 (Leistung)", function(a){ return !any(a); }, 2, T("7433 mit offenem Kollektor, 7428 als Leistungs-NOR.", "7433 à collecteur ouvert, 7428 de puissance.")],
    ["NOT (OK)", "7405 · 7406 (30 V)", function(a){ return !a[0]; }, 1, T("Offener Kollektor: 7405 bis 5,5 V, 7406 bis 30 V und 40 mA – gut für Relais und Lampen.", "Collecteur ouvert : 7406 jusqu’à 30 V et 40 mA.")]];
  var pick = (location.hash.split("/")[2] || "").toLowerCase(), sel = 0;
  if (pick) G.forEach(function(g, i){ if (!sel && g[1].toLowerCase().replace(/\s/g, "").split("·").some(function(x){ return x.replace(/\(.*\)/, "") === pick; })) sel = i; });
  var IN = [false, false, false, false], w = el("div", "ic-cust"); box.appendChild(w);
  var cr = el("div", "ic-chips"); w.appendChild(cr); var ctl = el("div", "ic-chips"); w.appendChild(ctl);
  var tg = ["A", "B", "C", "D"].map(function(n, i){ return toggleBtn(ctl, n, false, function(v){ IN[i] = v; upd(); }); });
  var out = el("div", "ic-out"); ctl.appendChild(out); var chip = el("p", "ic-pd"); w.appendChild(chip); var tab = el("div", "ic-tt"); w.appendChild(tab); var nd = el("div", "ic-nand"); w.appendChild(nd);
  G.forEach(function(g, i){ var b = el("button", "ic-ch" + (i === sel ? " on" : ""), g[0]); b.type = "button"; b.onclick = function(){ sel = i; cr.querySelectorAll("button").forEach(function(x, j){ x.classList.toggle("on", j === i); }); upd(); }; cr.appendChild(b); });
  function b01(x){ return x ? 1 : 0; }
  function nand(a, b){ return !(a && b); }
  function upd(){ var g = G[sel], n = g[3]; tg.forEach(function(t, i){ t.hidden = i >= n; }); var y = g[2](IN.slice(0, n));
    out.innerHTML = '<span class="ic-big ' + (y ? "hi" : "lo") + '">Y = ' + b01(y) + "</span>";
    chip.innerHTML = "<b>" + esc(T("Bausteine", "Composants")) + ":</b> " + esc(g[1]) + (g[4] ? "<br>" + esc(g[4]) : "");
    var h = "<table><tr>" + ["A", "B", "C", "D"].slice(0, n).map(function(x){ return "<th>" + x + "</th>"; }).join("") + "<th>Y</th></tr>";
    for (var r = 0; r < (1 << n); r++){ var v = []; for (var k = 0; k < n; k++) v.push(!!((r >> (n - 1 - k)) & 1)); var cur = v.every(function(x, k){ return x === IN[k]; });
      h += "<tr" + (cur ? ' class="cur"' : "") + ">" + v.map(function(x){ return "<td>" + b01(x) + "</td>"; }).join("") + "<td>" + b01(g[2](v)) + "</td></tr>"; }
    tab.innerHTML = h + "</table>";
    var A = IN[0], B = IN[1], nt = nand(A, A), an = nand(nand(A, B), nand(A, B)), or = nand(nand(A, A), nand(B, B));
    nd.innerHTML = "<h4>" + T("Alles aus NAND (das „Universal-Gatter“)", "Tout avec des NAND") + "</h4><ul><li>NOT = 1 × NAND <span>(A an beide Eingänge)</span> → <b>" + b01(nt) + "</b></li><li>AND = 2 × NAND <span>(NAND, dann als NOT)</span> → <b>" + b01(an) + "</b></li><li>OR = 3 × NAND <span>(erst A und B negieren, dann NAND)</span> → <b>" + b01(or) + "</b></li></ul>"; }
  upd(); return {};
};
CUST.shift = function(box){
  var byte = 0xB2, step = 0, w = el("div", "ic-cust"); box.appendChild(w);
  var rb = el("div", "ic-chips"); w.appendChild(rb); rb.appendChild(el("span", "ic-lb", T("Byte (MSB zuerst gesendet):", "Octet (MSB d’abord) :")));
  var tgs = []; for (var i = 7; i >= 0; i--) (function(i){ tgs.push(toggleBtn(rb, "D" + i, (byte >> i) & 1, function(v){ byte = v ? byte | (1 << i) : byte & ~(1 << i); upd(); })); })(i);
  var val = el("div", "ic-lb"); w.appendChild(val);
  var sr = el("div", "ic-chips"); w.appendChild(sr); var sl = el("input"); sl.type = "range"; sl.min = 0; sl.max = 9; sl.value = 0; sl.className = "ic-range"; sr.appendChild(el("span", "ic-lb", T("Takt:", "Coup :"))); sr.appendChild(sl); var sv2 = el("b", "ic-lb"); sr.appendChild(sv2);
  w.appendChild(el("div", "ic-lb", T("Schieberegister (intern)", "Registre à décalage (interne)"))); var r1 = ledRow(w, 8, ["QA", "QB", "QC", "QD", "QE", "QF", "QG", "QH"], C.cyan);
  w.appendChild(el("div", "ic-lb", T("Ausgänge nach RCLK-Impuls", "Sorties après RCLK"))); var r2 = ledRow(w, 8, ["QA", "QB", "QC", "QD", "QE", "QF", "QG", "QH"], C.red);
  var cv = el("div", "ic-scopebox"), cnv = el("canvas"); cv.appendChild(cnv); w.appendChild(cv);
  function upd(){ step = +sl.value; var bits = []; for (var k = 0; k < 8; k++) bits.push((byte >> (7 - k)) & 1);
    var j = Math.min(step, 8), reg = []; for (var i = 0; i < 8; i++) reg.push(j - 1 - i >= 0 ? bits[j - 1 - i] : 0);
    r1.set(reg); r2.set(step === 9 ? reg : [0, 0, 0, 0, 0, 0, 0, 0]);
    val.textContent = T("Wert: ", "Valeur : ") + byte + "  =  0b" + ("00000000" + byte.toString(2)).slice(-8) + "  =  0x" + ("0" + byte.toString(16)).slice(-2).toUpperCase();
    sv2.textContent = step === 0 ? T("Start", "Départ") : step < 9 ? T("Bit ", "Bit ") + step + "/8 " + T("eingetaktet", "décalé") : "RCLK ✓";
    var U = 1e-6, span = 20 * U;
    scope(cnv, [{ n: "SER (Pin 14)", c: C.amber, lo: 0, hi: 5, v: function(t){ var u = t / U, k = Math.floor(u / 2); return (k < 8 ? bits[k] : bits[7]) * 5; } }, { n: "SRCLK (Pin 11)", c: C.cyan, lo: 0, hi: 5, v: function(t){ var u = t / U; return u < 16 && (u % 2) >= 1 ? 5 : 0; } }, { n: "RCLK (Pin 12)", c: C.pink, lo: 0, hi: 5, v: function(t){ var u = t / U; return u >= 17 && u < 18 ? 5 : 0; } }, { n: "QH (erstes Bit)", c: C.green, lo: 0, hi: 5, v: function(t){ var u = t / U; return u >= 18 ? bits[0] * 5 : 0; } }, { n: "QA (letztes Bit)", c: C.lime, lo: 0, hi: 5, v: function(t){ var u = t / U; return u >= 18 ? bits[7] * 5 : 0; } }], span); }
  sl.oninput = upd; upd(); return { after: upd };
};
CUST.dec138 = function(box){
  var w = el("div", "ic-cust"); box.appendChild(w); var s = { a0: 0, a1: 0, a2: 0, e1: 0, e2: 0, e3: 1 }, tb = el("div", "ic-chips"); w.appendChild(tb);
  [["A0", "a0"], ["A1", "a1"], ["A2", "a2"], ["/E1", "e1"], ["/E2", "e2"], ["E3", "e3"]].forEach(function(x){ toggleBtn(tb, x[0], s[x[1]], function(v){ s[x[1]] = v ? 1 : 0; upd(); }); });
  var txt = el("div", "ic-lb"); w.appendChild(txt); var names = []; for (var i = 0; i < 8; i++) names.push("Y" + i); var lr = ledRow(w, 8, names, C.red); var lv = el("div", "ic-lb"); w.appendChild(lv);
  function upd(){ var en = !s.e1 && !s.e2 && s.e3, idx = s.a2 * 4 + s.a1 * 2 + s.a0, a = [], p = []; for (var i = 0; i < 8; i++){ a.push(en && i === idx ? 1 : 0); p.push(en && i === idx ? 0 : 1); }
    txt.textContent = T("Adresse = ", "Adresse = ") + idx + (en ? "  →  Y" + idx + " = LOW" : T("   (Chip gesperrt: alle Ausgänge HIGH)", "   (puce inactive : toutes les sorties à 1)")); lr.set(a); lv.textContent = T("Pegel Y0…Y7: ", "Niveaux Y0…Y7 : ") + p.join(" ") + T("   – LED leuchtet, wenn der Ausgang LOW ist (LED an +V).", "   – la LED s’allume à l’état bas."); }
  upd(); return {};
};
CUST.bcd7 = function(box){
  var w = el("div", "ic-cust"); box.appendChild(w); var s = { A: 1, B: 0, C: 1, D: 0, lt: 1, bi: 1 }, tb = el("div", "ic-chips"); w.appendChild(tb);
  [["D", "D"], ["C", "C"], ["B", "B"], ["A", "A"], ["/LT", "lt"], ["/BI", "bi"]].forEach(function(x){ toggleBtn(tb, x[0], s[x[1]], function(v){ s[x[1]] = v ? 1 : 0; upd(); }); });
  var row = el("div", "ic-row2"); w.appendChild(row); var sg = seg7(row), tx = el("div", "ic-lb"); row.appendChild(tx);
  function upd(){ var d = s.D * 8 + s.C * 4 + s.B * 2 + s.A, bits = d <= 9 ? DIG[d] : 0; if (!s.bi) bits = 0; if (!s.lt) bits = 0x7F; sg.setBits(bits);
    tx.innerHTML = T("Eingang", "Entrée") + " DCBA = <b>" + ("0000" + d.toString(2)).slice(-4) + "</b> (" + d + ")<br>" + T("Segmente a…g:", "Segments a…g :") + " <b>" + "abcdefg".split("").map(function(l, i){ return (bits >> i) & 1 ? l : "·"; }).join(" ") + "</b>" + (!s.lt ? "<br>" + T("Lampentest: /LT = 0 schaltet alle Segmente ein", "Test : /LT = 0 allume tout") : !s.bi ? "<br>" + T("Dunkeltastung: /BI = 0", "Extinction : /BI = 0") : d > 9 ? "<br>" + T("Werte 10…15 zeigt der CD4511 dunkel", "10…15 : afficheur éteint") : ""); }
  upd(); return {};
};
CUST.reg317 = function(box, P, ctx, redraw){
  var w = el("div", "ic-cust"); box.appendChild(w); w.appendChild(el("div", "ic-lb", T("Vorgaben für R2 (mit dem gewählten R1):", "Préréglages R2 :")));
  var pr = el("div", "ic-chips"); w.appendChild(pr);
  [3.3, 5, 9, 12, 15].forEach(function(v){ var b = el("button", "ic-ch", v + " V"); b.type = "button"; b.onclick = function(){ var r2 = (v / 1.25 - 1) * P.R1; if (P.Vin < v + 3.5) ctx.setP("Vin", Math.min(35, Math.ceil(v + 4))); ctx.setP("R2", clamp(r2, 10, 5000)); }; pr.appendChild(b); });
  var g = el("div", "ic-gauge"); g.innerHTML = '<div class="ic-gv"></div><span></span>'; w.appendChild(g);
  return { after: function(res){ var gv = g.firstChild; gv.style.width = Math.min(100, res.vout / res.vin * 100) + "%"; gv.className = "ic-gv" + (res.vin - res.vout < 3 ? " bad" : ""); g.lastChild.textContent = fmt(res.vout, "V") + " / " + fmt(res.vin, "V"); } };
};
PROJ.lm317.opts = [{ k: "R1", l: ["R1", "R1"], o: [[120, "120 Ω"], [240, "240 Ω"], [330, "330 Ω"]], def: 240 }];
PROJ.lm317.params = [{ k: "Vin", l: ["Eingangsspannung", "Tension d’entrée"], min: 5, max: 35, def: 12, u: "V" }, { k: "R2", l: ["R2", "R2"], min: 10, max: 5000, def: 720, log: 1, u: "Ω" }, { k: "I", l: ["Laststrom", "Courant de charge"], min: .01, max: 1.5, def: .3, log: 1, u: "A" }];
PROJ.lm317.build = function(P){ var vout = 1.25 * (1 + P.R2 / P.R1) + 50e-6 * P.R2, pd = Math.max(0, (P.Vin - vout) * P.I), dT = pd * 50, w = [];
  if (P.Vin - vout < 3) w.push(T("Zu wenig Spannungsreserve: der LM317 braucht Vin ≥ Vout + ca. 3 V, sonst bricht die Ausgangsspannung ein.", "Marge insuffisante : il faut Vin ≥ Vout + 3 V."));
  if (pd > 2) w.push(T("Verlustleistung über 2 W – ohne Kühlkörper wird der Regler zu heiß.", "Plus de 2 W : radiateur nécessaire."));
  if (P.I < .01) w.push(T("Mindestlast ca. 10 mA beachten.", "Charge minimale ≈ 10 mA."));
  return { vout: vout, vin: P.Vin, warn: w, info: [[T("Ausgangsspannung = 1,25·(1 + R2/R1)", "Tension de sortie"), fmt(vout, "V")], [T("Spannung über dem Regler", "Chute dans le régulateur"), fmt(P.Vin - vout, "V")], [T("Verlustleistung", "Puissance dissipée"), fmt(pd, "W")], [T("Erwärmung ohne Kühlkörper (≈ 50 K/W)", "Échauffement sans radiateur"), "≈ " + Math.round(dT) + " K"], [T("Ausgangsleistung", "Puissance utile"), fmt(vout * P.I, "W")]] }; };
/* ---------- Verbindungslisten (Netlisten) + Schaltplan ---------- */
var PARTIC = {
  seg7: { id: "seg7", name: "7-Segment (gem. Kathode)", pkg: "DIP-10", pins: ["e:o", "d:o", "K:g", "c:o", "DP:o", "b:o", "a:o", "K:g", "f:o", "g:o"] },
  bc337: { id: "bc337", name: "BC337", pkg: "TO-92", pins: ["C:o", "B:i", "E:g"], sip: 1, sym: "npn" },
  lm317t: { id: "lm317t", name: "LM317", pkg: "TO-220", pins: ["ADJ:i", "OUT:o", "IN:v"], sip: 1 }
};
var NL = {};
function ledsOn(nl, pins, rv, col, pre, hi){
  pins.forEach(function(p, i){ var r = pre + "R" + (i + 1), d = pre + "D" + (i + 1); nl.parts[r] = ["R", rv]; nl.parts[d] = ["LED", col];
    if (hi){ nl.nets[pre + "Q" + (i + 1)] = [r + ".1"]; (nl.nets.VCC = nl.nets.VCC || []).push(r + ".1"); delete nl.nets[pre + "Q" + (i + 1)]; nl.nets[pre + "L" + (i + 1)] = [r + ".2", d + ".1"]; nl.nets[pre + "Y" + (i + 1)] = [d + ".2", p]; }
    else { nl.nets[pre + "Q" + (i + 1)] = [p, r + ".1"]; nl.nets[pre + "L" + (i + 1)] = [r + ".2", d + ".1"]; (nl.nets.GND = nl.nets.GND || []).push(d + ".2"); } });
}
function nmk(parts, nets){ return { parts: parts, nets: nets }; }
NL.ne555a = nmk({ U1: "ne555", R1: ["R", "$R1"], R2: ["R", "$R2"], C1: ["C", "$C"], C2: ["C", 10e-9], R3: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.8", "U1.4", "R1.1"], GND: ["U1.1", "C1.2", "C2.2", "D1.2"], ENTLADEN: ["R1.2", "U1.7", "R2.1"], KONDENSATOR: ["R2.2", "U1.6", "U1.2", "C1.1"], CTRL: ["U1.5", "C2.1"], OUT: ["U1.3", "R3.1"], LED: ["R3.2", "D1.1"] });
NL.ne555m = nmk({ U1: "ne555", R1: ["R", "$R"], C1: ["C", "$C"], R2: ["R", 10e3], SW1: ["SW", "Taster"], C2: ["C", 10e-9], R3: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.8", "U1.4", "R1.1", "R2.1"], GND: ["U1.1", "C1.2", "SW1.2", "C2.2", "D1.2"], ZEIT: ["R1.2", "U1.7", "U1.6", "C1.1"], TRIG: ["U1.2", "R2.2", "SW1.1"], CTRL: ["U1.5", "C2.1"], OUT: ["U1.3", "R3.1"], LED: ["R3.2", "D1.1"] });
NL.hc14 = nmk({ U1: "hc14", R1: ["R", "$R"], C1: ["C", "$C"], C2: ["C", 100e-9], R2: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.14", "C2.1"], GND: ["U1.7", "C2.2", "C1.2", "D1.2", "U1.3", "U1.5", "U1.9", "U1.11", "U1.13"], OUT: ["U1.2", "R1.1", "R2.1"], IN: ["R1.2", "U1.1", "C1.1"], LED: ["R2.2", "D1.1"] });
NL.hc00 = nmk({ U1: "hc00", SW1: ["SW", "A"], SW2: ["SW", "B"], R1: ["R", 10e3], R2: ["R", 10e3], R3: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.14", "SW1.1", "SW2.1"], GND: ["U1.7", "R1.2", "R2.2", "D1.2", "U1.4", "U1.5", "U1.9", "U1.10", "U1.12", "U1.13"], A: ["SW1.2", "R1.1", "U1.1"], B: ["SW2.2", "R2.1", "U1.2"], Y: ["U1.3", "R3.1"], LED: ["R3.2", "D1.1"] });
NL.hc74 = nmk({ U1: "hc74", G1: ["G", "Takt"], R1: ["R", 330], D1: ["LED", "#6dffb0"], R2: ["R", 330], D2: ["LED", "#ffb000"] },
  { VCC: ["U1.14", "U1.4", "U1.1", "U1.10", "U1.13"], GND: ["U1.7", "D1.2", "D2.2"], RUECK1: ["U1.6", "U1.2"], TAKT: ["G1.1", "U1.3"], Q1: ["U1.5", "U1.11", "R1.1"], RUECK2: ["U1.8", "U1.12"], Q2: ["U1.9", "R2.1"], L1: ["R1.2", "D1.1"], L2: ["R2.2", "D2.1"] });
(function(){ var n = nmk({ U1: "cd4017", G1: ["G", "Takt"] }, { VCC: ["U1.16"], GND: ["U1.8", "U1.13", "U1.15"], TAKT: ["G1.1", "U1.14"] }); ledsOn(n, ["U1.3", "U1.2", "U1.4", "U1.7", "U1.10", "U1.1", "U1.5", "U1.6", "U1.9", "U1.11"], 1000, "#ff4d4d", "", 0); NL.cd4017 = n; })();
NL.cd4060 = nmk({ U1: "cd4060", X1: ["XTAL", "32,768 kHz"], C1: ["C", 22e-12], C2: ["C", 22e-12], R1: ["R", 10e6], R2: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.16"], GND: ["U1.8", "U1.12", "C1.2", "C2.2", "D1.2"], XEIN: ["U1.11", "X1.1", "C1.1", "R1.1"], XAUS: ["U1.10", "X1.2", "C2.1"], RF: ["U1.9", "R1.2"], Q14: ["U1.3", "R2.1"], LED: ["R2.2", "D1.1"] });
(function(){ var n = nmk({ U1: "hc160", G1: ["G", "Takt"] }, { VCC: ["U1.16", "U1.1", "U1.7", "U1.9", "U1.10"], GND: ["U1.8", "U1.3", "U1.4", "U1.5", "U1.6"], TAKT: ["G1.1", "U1.2"] }); ledsOn(n, ["U1.14", "U1.13", "U1.12", "U1.11"], 330, "#6dffb0", "", 0); NL.hc160 = n; })();
(function(){ var n = nmk({ U1: "hc595", G1: ["G", "Daten"], G2: ["G", "Schiebetakt"], G3: ["G", "Übernahme"] }, { VCC: ["U1.16", "U1.10"], GND: ["U1.8", "U1.13"], SER: ["G1.1", "U1.14"], SRCLK: ["G2.1", "U1.11"], RCLK: ["G3.1", "U1.12"] }); ledsOn(n, ["U1.15", "U1.1", "U1.2", "U1.3", "U1.4", "U1.5", "U1.6", "U1.7"], 330, "#ffb000", "", 0); NL.hc595 = n; })();
(function(){ var n = nmk({ U1: "hc138", G1: ["G", "A0"], G2: ["G", "A1"], G3: ["G", "A2"] }, { VCC: ["U1.16", "U1.6"], GND: ["U1.8", "U1.4", "U1.5"], A0: ["G1.1", "U1.1"], A1: ["G2.1", "U1.2"], A2: ["G3.1", "U1.3"] }); ledsOn(n, ["U1.15", "U1.14", "U1.13", "U1.12", "U1.11", "U1.10", "U1.9", "U1.7"], 330, "#ff4d4d", "", 1); NL.hc138 = n; })();
(function(){ var n = nmk({ U1: "cd4511", G1: ["G", "A"], G2: ["G", "B"], G3: ["G", "C"], G4: ["G", "D"], S1: "seg7" }, { VCC: ["U1.16", "U1.3", "U1.4"], GND: ["U1.8", "U1.5", "S1.3", "S1.8"], A: ["G1.1", "U1.7"], B: ["G2.1", "U1.1"], C: ["G3.1", "U1.2"], D: ["G4.1", "U1.6"] });
  [[13, 7], [12, 6], [11, 4], [10, 2], [9, 1], [15, 9], [14, 10]].forEach(function(x, i){ var r = "R" + (i + 1); n.parts[r] = ["R", 330]; n.nets["seg" + "abcdefg".charAt(i)] = ["U1." + x[0], r + ".1"]; n.nets["S" + "abcdefg".charAt(i)] = [r + ".2", "S1." + x[1]]; }); NL.cd4511 = n; })();
NL.lm358 = function(P){ var d = P.s === "d12", parts = { U1: "lm358", G1: ["G", "Uin"], R1: ["R", "$R1"], R2: ["R", "$R2"], P1: ["G", "Uout"] }, nets = { VCC: ["U1.8"] };
  if (d){ parts.GN = ["G", "−12 V"]; nets.VNEG = ["GN.1", "U1.4"]; } else nets.GND = ["U1.4"];
  var ref = d ? "GND" : "BIAS"; if (!d){ parts.GB = ["G", P.s === "s5" ? "Bias 2,5 V" : "Bias 6 V"]; nets.BIAS = ["GB.1"]; }
  if (P.m === "inv"){ nets.EIN = ["G1.1", "R1.1"]; nets.MINUS = ["R1.2", "U1.2", "R2.2"]; nets[ref] = (nets[ref] || []).concat(["U1.3"]); }
  else { nets.EIN = ["G1.1", "U1.3"]; nets.MINUS = ["U1.2", "R1.1", "R2.2"]; nets[ref] = (nets[ref] || []).concat(["R1.2"]); }
  nets.OUT = ["U1.1", "R2.1", "P1.1"]; return nmk(parts, nets); };
NL.lm393 = nmk({ U1: "lm393", G1: ["G", "Uin"], R1: ["R", 10e3], Rh: ["R", 1e6], R2: ["R", 10e3], R3: ["R", 10e3], Rp: ["R", 10e3], R4: ["R", 330], D1: ["LED", "#ff4d4d"] },
  { VCC: ["U1.8", "R2.1", "Rp.1", "R4.1"], GND: ["U1.4", "R3.2"], REF: ["R2.2", "R3.1", "U1.2"], SIG: ["G1.1", "R1.1"], PLUS: ["R1.2", "U1.3", "Rh.1"], OUT: ["U1.1", "Rp.2", "Rh.2", "D1.2"], LED: ["R4.2", "D1.1"] });
NL.lm317 = nmk({ U1: "lm317t", C1: ["C", 330e-9], C2: ["C", 1e-6], R1: ["R", 240], R2: ["R", 2e3], D1: ["D", "1N4007"], G1: ["G", "Vin"], P1: ["G", "Vout"] },
  { IN: ["G1.1", "U1.IN", "C1.1", "D1.2"], OUT: ["U1.OUT", "C2.1", "R1.1", "D1.1", "P1.1"], ADJ: ["U1.ADJ", "R1.2", "R2.1"], GND: ["C1.2", "C2.2", "R2.2"] });
(function(){ var n = nmk({ U1: "ne555", U2: "cd4017", R1: ["R", "$R1"], R2: ["R", "$R2"], C1: ["C", "$C"], C2: ["C", 10e-9] },
  { VCC: ["U1.8", "U1.4", "R1.1", "U2.16"], GND: ["U1.1", "C1.2", "C2.2", "U2.8", "U2.13", "U2.15"], ENTLADEN: ["R1.2", "U1.7", "R2.1"], KONDENSATOR: ["R2.2", "U1.6", "U1.2", "C1.1"], CTRL: ["U1.5", "C2.1"], TAKT: ["U1.3", "U2.14"] });
  ledsOn(n, ["U2.3", "U2.2", "U2.4", "U2.7", "U2.10", "U2.1", "U2.5", "U2.6", "U2.9", "U2.11"], 1000, "#ff4d4d", "L", 0); NL.k_lauf = n; })();
NL.k_uhr = nmk({ U1: "cd4060", U2: "hc74", X1: ["XTAL", "32,768 kHz"], C1: ["C", 22e-12], C2: ["C", 22e-12], R1: ["R", 10e6], R2: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.16", "U2.14", "U2.4", "U2.1"], GND: ["U1.8", "U1.12", "C1.2", "C2.2", "U2.7", "D1.2"], XEIN: ["U1.11", "X1.1", "C1.1", "R1.1"], XAUS: ["U1.10", "X1.2", "C2.1"], RF: ["U1.9", "R1.2"], TAKT: ["U1.3", "U2.3"], RUECK: ["U2.6", "U2.2"], Q: ["U2.5", "R2.1"], LED: ["R2.2", "D1.1"] });
(function(){ var n = nmk({ U1: "ne555", U2: "hc160", U3: "cd4511", S1: "seg7", R1: ["R", "$R1"], R2: ["R", "$R2"], C1: ["C", "$C"], C2: ["C", 10e-9] },
  { VCC: ["U1.8", "U1.4", "R1.1", "U2.16", "U2.1", "U2.7", "U2.9", "U2.10", "U3.16", "U3.3", "U3.4"], GND: ["U1.1", "C1.2", "C2.2", "U2.8", "U2.3", "U2.4", "U2.5", "U2.6", "U3.8", "U3.5", "S1.3", "S1.8"], ENTLADEN: ["R1.2", "U1.7", "R2.1"], KONDENSATOR: ["R2.2", "U1.6", "U1.2", "C1.1"], CTRL: ["U1.5", "C2.1"], TAKT: ["U1.3", "U2.2"], A: ["U2.14", "U3.7"], B: ["U2.13", "U3.1"], C: ["U2.12", "U3.2"], D: ["U2.11", "U3.6"] });
  [[13, 7], [12, 6], [11, 4], [10, 2], [9, 1], [15, 9], [14, 10]].forEach(function(x, i){ var r = "R" + (i + 3); n.parts[r] = ["R", 330]; n.nets["seg" + "abcdefg".charAt(i)] = ["U3." + x[0], r + ".1"]; n.nets["S" + "abcdefg".charAt(i)] = [r + ".2", "S1." + x[1]]; }); NL.k_zaehl = n; })();
NL.k_daemm = nmk({ LDR1: ["LDR", "LDR"], R1: ["R", 10e3], U1: "lm393", R2: ["R", 10e3], R3: ["R", 10e3], Rp: ["R", 10e3], Rh: ["R", 1e6], Rb: ["R", 1e3], Q1: "bc337", LP1: ["LAMP", "Lampe"] },
  { VCC: ["LDR1.1", "R2.1", "Rp.1", "LP1.1", "U1.8"], GND: ["R1.2", "R3.2", "U1.4", "Q1.E"], X: ["LDR1.2", "R1.1", "U1.2"], REF: ["R2.2", "R3.1", "U1.3", "Rh.1"], OUT: ["U1.1", "Rp.2", "Rh.2", "Rb.1"], BASIS: ["Rb.2", "Q1.B"], LAMPE: ["LP1.2", "Q1.C"] });
(function(){ var n = nmk({ SW1: ["SW", "Taster"], Rp: ["R", 10e3], R1: ["R", 10e3], C1: ["C", 100e-9], U1: "hc14", U2: "hc160" },
  { VCC: ["Rp.1", "U1.14", "U2.16", "U2.1", "U2.7", "U2.9", "U2.10"], GND: ["SW1.2", "C1.2", "U1.7", "U2.8", "U2.3", "U2.4", "U2.5", "U2.6", "U1.3", "U1.5", "U1.9", "U1.11", "U1.13"], TASTER: ["SW1.1", "Rp.2", "R1.1"], GLATT: ["R1.2", "U1.1", "C1.1"], TAKT: ["U1.2", "U2.2"] });
  ledsOn(n, ["U2.14", "U2.13", "U2.12", "U2.11"], 330, "#6dffb0", "L", 0); NL.k_prell = n; })();
NL.k_sirene = nmk({ U1: "ne555", U2: "ne555", R1: ["R", 10e3], R2: ["R", 100e3], C1: ["C", 4.7e-6], C2: ["C", 10e-9], R3: ["R", 1e3], R4: ["R", 10e3], C3: ["C", 10e-9], R5: ["R", 10e3], C4: ["C", 100e-6, "pol"], SP1: ["SPK", "Lautsprecher 8 Ω"] },
  { VCC: ["U1.8", "U1.4", "R1.1", "U2.8", "U2.4", "R3.1"], GND: ["U1.1", "C1.2", "C2.2", "U2.1", "C3.2", "SP1.2"], ENTL1: ["R1.2", "U1.7", "R2.1"], LFO: ["R2.2", "U1.6", "U1.2", "C1.1", "R5.1"], CTRL1: ["U1.5", "C2.1"], MOD: ["R5.2", "U2.5"], ENTL2: ["R3.2", "U2.7", "R4.1"], VCO: ["R4.2", "U2.6", "U2.2", "C3.1"], AUDIO: ["U2.3", "C4.1"], LS: ["C4.2", "SP1.1"] });

/* --- Netzlisten der Erweiterung --- */
PARTIC.lm7805t = { id: "lm7805t", name: "LM7805", pkg: "TO-220", pins: ["IN:v", "GND:g", "OUT:o"], sip: 1 };
NL.cd4093 = nmk({ U1: "cd4093", SW1: ["SW", "Freigabe"], Rp: ["R", 10e3], R1: ["R", "$R"], C1: ["C", "$C"], R2: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.14", "SW1.1"], GND: ["U1.7", "Rp.2", "C1.2", "D1.2", "U1.5", "U1.6", "U1.8", "U1.9", "U1.12", "U1.13"], FREIGABE: ["SW1.2", "Rp.1", "U1.1"], RC: ["U1.2", "R1.2", "C1.1"], OUT: ["U1.3", "R1.1", "R2.1"], LED: ["R2.2", "D1.1"] });
(function(){ var n = nmk({ U1: "cd4040", G1: ["G", "Takt"] }, { VCC: ["U1.16"], GND: ["U1.8", "U1.11"], TAKT: ["G1.1", "U1.10"] }); ledsOn(n, ["U1.9", "U1.7", "U1.6", "U1.5", "U1.3", "U1.2", "U1.4", "U1.13"], 330, "#6dffb0", "", 0); NL.cd4040 = n; })();
NL.hc165 = nmk({ U1: "hc165", G1: ["G", "Laden"], G2: ["G", "Takt"], P1: ["G", "Daten"], SW1: ["SW", "Taster A"], R1: ["R", 10e3] },
  { VCC: ["U1.16", "SW1.1"], GND: ["U1.8", "U1.15", "U1.10", "R1.2"], LADEN: ["G1.1", "U1.1"], TAKT: ["G2.1", "U1.2"], DATEN: ["U1.9", "P1.1"], A: ["SW1.2", "R1.1", "U1.11"] });
NL.lm7805 = nmk({ U1: "lm7805t", G1: ["G", "Vin"], C1: ["C", 330e-9], C2: ["C", 100e-9], P1: ["G", "5 V"] },
  { IN: ["G1.1", "U1.IN", "C1.1"], OUT: ["U1.OUT", "C2.1", "P1.1"], GND: ["U1.GND", "C1.2", "C2.2"] });
NL.lm386 = nmk({ U1: "lm386", G1: ["G", "Audio"], C1: ["C", 220e-6, "pol"], C2: ["C", 100e-9], R1: ["R", 10], SP1: ["SPK", "Lautsprecher 8 Ω"] },
  { VCC: ["U1.6"], GND: ["U1.2", "U1.4", "R1.2", "SP1.2"], IN: ["G1.1", "U1.3"], OUT: ["U1.5", "C1.1", "C2.1"], ZOBEL: ["C2.2", "R1.1"], LS: ["C1.2", "SP1.1"] });
NL.npn = nmk({ G1: ["G", "Pin"], Rb: ["R", "$Rb"], Q1: "bc337", LP1: ["LAMP", "Last"], D1: ["D", "1N4007"] },
  { VCC: ["LP1.1", "D1.2"], GND: ["Q1.E"], EIN: ["G1.1", "Rb.1"], BASIS: ["Rb.2", "Q1.B"], KOLLEKTOR: ["LP1.2", "Q1.C", "D1.1"] });
NL.uln2003 = nmk({ U1: "uln2003", G1: ["G", "Pin"], LP1: ["LAMP", "Last"] },
  { VCC: ["U1.9", "LP1.1"], GND: ["U1.8"], EIN: ["G1.1", "U1.1"], AUS: ["U1.16", "LP1.2"] });
NL.l293d = nmk({ U1: "l293d", G1: ["G", "PWM"], G2: ["G", "1A"], G3: ["G", "2A"], G4: ["G", "Motor +V"], C1: ["C", 100e-9], LP1: ["LAMP", "Motor"] },
  { VCC: ["U1.16"], GND: ["U1.4", "U1.5", "U1.12", "U1.13"], VMOTOR: ["G4.1", "U1.8"], EN: ["G1.1", "U1.1"], A1: ["G2.1", "U1.2"], A2: ["G3.1", "U1.7"], M1: ["U1.3", "LP1.1", "C1.1"], M2: ["U1.6", "LP1.2", "C1.2"] });
NL.pc817 = nmk({ G1: ["G", "Eingang"], R1: ["R", "$R"], U1: "pc817", Rp: ["R", "$Rp"], P1: ["G", "Ausgang"] },
  { VCC: ["Rp.1"], GND: ["U1.2", "U1.3"], EIN: ["G1.1", "R1.1"], LED: ["R1.2", "U1.1"], AUS: ["Rp.2", "U1.4", "P1.1"] });
NL.k_motor = nmk({ U1: "ne555", U2: "l293d", R1: ["R", 1e3], Ra: ["R", "Poti-Hälfte A"], Rb: ["R", "Poti-Hälfte B"], D1: ["D", "1N4148"], D2: ["D", "1N4148"], C1: ["C", 10e-9], C2: ["C", 10e-9], G1: ["G", "Motor +V"], LP1: ["LAMP", "Motor"] },
  { VCC: ["U1.8", "U1.4", "R1.1", "U2.16", "U2.2"], GND: ["U1.1", "C1.2", "C2.2", "U2.4", "U2.5", "U2.12", "U2.13", "U2.7"], ENTLADEN: ["R1.2", "U1.7", "D1.1", "D2.2"], LADEN: ["D1.2", "Ra.1"], ZURUECK: ["D2.1", "Rb.1"], KONDENSATOR: ["Ra.2", "Rb.2", "U1.6", "U1.2", "C1.1"], CTRL: ["U1.5", "C2.1"], PWM: ["U1.3", "U2.1"], VMOTOR: ["G1.1", "U2.8"], M1: ["U2.3", "LP1.1"], M2: ["U2.6", "LP1.2"] });
NL.k_relais = nmk({ U1: "ne555", U2: "cd4017", U3: "uln2003", R1: ["R", "$R1"], R2: ["R", "$R2"], C1: ["C", "$C"], C2: ["C", 10e-9], G1: ["G", "+12 V"], LP1: ["LAMP", "Lampe 1"], LP2: ["LAMP", "Lampe 2"], LP3: ["LAMP", "Lampe 3"], LP4: ["LAMP", "Lampe 4"] },
  { VCC: ["U1.8", "U1.4", "R1.1", "U2.16"], GND: ["U1.1", "C1.2", "C2.2", "U2.8", "U2.13", "U3.8"], ENTLADEN: ["R1.2", "U1.7", "R2.1"], KONDENSATOR: ["R2.2", "U1.6", "U1.2", "C1.1"], CTRL: ["U1.5", "C2.1"], TAKT: ["U1.3", "U2.14"], Q0: ["U2.3", "U3.1"], Q1: ["U2.2", "U3.2"], Q2: ["U2.4", "U3.3"], Q3: ["U2.7", "U3.4"], RESET: ["U2.10", "U2.15"], LAST12V: ["G1.1", "U3.9", "LP1.1", "LP2.1", "LP3.1", "LP4.1"], L1: ["U3.16", "LP1.2"], L2: ["U3.15", "LP2.2"], L3: ["U3.14", "LP3.2"], L4: ["U3.13", "LP4.2"] });
/* --- Netzlisten der Erweiterung 2 --- */
PARTIC.tl431p = { id: "tl431p", name: "TL431", pkg: "TO-92", pins: ["REF:i", "A:g", "K:o"], sip: 1 };
PARTIC.lm35p = { id: "lm35p", name: "LM35", pkg: "TO-92", pins: ["VS:v", "VOUT:o", "GND:g"], sip: 1 };
PARTIC.irlz44p = { id: "irlz44p", name: "IRLZ44N", pkg: "TO-220", pins: ["G:i", "D:o", "S:g"], sip: 1, sym: "nmos" };
NL.lm324 = nmk({ U1: "lm324", G1: ["G", "Messspannung"], G2: ["G", "obere Grenze"], G3: ["G", "untere Grenze"], D1: ["D", "1N4148"], D2: ["D", "1N4148"], R1: ["R", 10e3], R2: ["R", 1e3], D3: ["LED", "#ff4d4d"] },
  { VCC: ["U1.4"], GND: ["U1.11", "R1.2", "D3.2"], MESS: ["G1.1", "U1.3", "U1.6"], OBEN: ["G2.1", "U1.2"], UNTEN: ["G3.1", "U1.5"], ZUHOCH: ["U1.1", "D1.1"], ZUTIEF: ["U1.7", "D2.1"], ALARM: ["D1.2", "D2.2", "R1.1", "R2.1"], LED: ["R2.2", "D3.1"] });
NL.cd4051 = nmk({ U1: "cd4051", G1: ["G", "A"], G2: ["G", "B"], G3: ["G", "C"], G4: ["G", "Sensor 0"], P1: ["G", "zum ADC"] },
  { VCC: ["U1.16"], GND: ["U1.8", "U1.7", "U1.6"], A: ["G1.1", "U1.11"], B: ["G2.1", "U1.10"], C: ["G3.1", "U1.9"], Y0: ["G4.1", "U1.13"], COM: ["U1.3", "P1.1"] });
NL.cd4066 = nmk({ U1: "cd4066", G1: ["G", "Signal"], G2: ["G", "Steuerung"], R1: ["R", 100e3], P1: ["G", "Ausgang"] },
  { VCC: ["U1.14"], GND: ["U1.7", "R1.2", "U1.5", "U1.6", "U1.12"], SIGNAL: ["G1.1", "U1.1"], STEUER: ["G2.1", "U1.13"], AUS: ["U1.2", "R1.1", "P1.1"] });
(function(){ var n = nmk({ U1: "hc193", G1: ["G", "Takt"] }, { VCC: ["U1.16", "U1.11", "U1.4"], GND: ["U1.8", "U1.14"], TAKT: ["G1.1", "U1.5"] }); ledsOn(n, ["U1.3", "U1.2", "U1.6", "U1.7"], 330, "#6dffb0", "", 0); NL.hc193 = n; })();
NL.cd4013 = nmk({ U1: "cd4013", SW1: ["SW", "Taster"], R1: ["R", 10e3], C1: ["C", 100e-9], R2: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.14", "SW1.1"], GND: ["U1.7", "U1.4", "U1.6", "R1.2", "C1.2", "D1.2", "U1.8", "U1.9", "U1.10", "U1.11"], TAKT: ["SW1.2", "R1.1", "C1.1", "U1.3"], RUECK: ["U1.2", "U1.5"], Q: ["U1.1", "R2.1"], LED: ["R2.2", "D1.1"] });
(function(){ var n = nmk({ U1: "hc164", G1: ["G", "Daten"], G2: ["G", "Takt"] }, { VCC: ["U1.14", "U1.9", "U1.2"], GND: ["U1.7"], DATEN: ["G1.1", "U1.1"], TAKT: ["G2.1", "U1.8"] }); ledsOn(n, ["U1.3", "U1.4", "U1.5", "U1.6", "U1.10", "U1.11", "U1.12", "U1.13"], 330, "#ffb000", "", 0); NL.hc164 = n; })();
NL.max232 = nmk({ U1: "max232", C1: ["C", 1e-6, "pol"], C2: ["C", 1e-6, "pol"], C3: ["C", 1e-6, "pol"], C4: ["C", 1e-6, "pol"], G1: ["G", "TX (µC)"], P1: ["G", "RS-232"] },
  { VCC: ["U1.16"], GND: ["U1.15", "C3.2", "C4.1"], CP1: ["U1.1", "C1.1"], CM1: ["U1.3", "C1.2"], CP2: ["U1.4", "C2.1"], CM2: ["U1.5", "C2.2"], VPLUS: ["U1.2", "C3.1"], VMINUS: ["U1.6", "C4.2"], TTL: ["G1.1", "U1.11"], RS232: ["U1.14", "P1.1"] });
NL.mcp3008 = nmk({ U1: "mcp3008", G1: ["G", "Sensor"], G2: ["G", "CS"], G3: ["G", "CLK"], G4: ["G", "MOSI"], P1: ["G", "MISO"] },
  { VCC: ["U1.16", "U1.15"], GND: ["U1.9", "U1.14"], CH0: ["G1.1", "U1.1"], CS: ["G2.1", "U1.10"], MOSI: ["G4.1", "U1.11"], MISO: ["U1.12", "P1.1"], CLK: ["G3.1", "U1.13"] });
NL.tl431 = nmk({ G1: ["G", "Eingang"], Rv: ["R", 1e3], U1: "tl431p", R1: ["R", "$R1"], R2: ["R", "$R2"], P1: ["G", "Ausgang"] },
  { EIN: ["G1.1", "Rv.1"], AUS: ["Rv.2", "U1.K", "R1.1", "P1.1"], REF: ["R1.2", "R2.1", "U1.REF"], GND: ["U1.A", "R2.2"] });
NL.icl7660 = nmk({ U1: "icl7660", C1: ["C", 10e-6, "pol"], C2: ["C", 10e-6, "pol"], P1: ["G", "−V"] },
  { VCC: ["U1.8"], GND: ["U1.3", "C2.1"], CAPP: ["U1.2", "C1.1"], CAPM: ["U1.4", "C1.2"], NEG: ["U1.5", "C2.2", "P1.1"] });
NL.lm35 = nmk({ U1: "lm35p", C1: ["C", 100e-9], P1: ["G", "zum ADC"] }, { VCC: ["U1.VS", "C1.1"], GND: ["U1.GND", "C1.2"], AUS: ["U1.VOUT", "P1.1"] });
NL.irlz44n = nmk({ G1: ["G", "PWM"], R1: ["R", 220], R2: ["R", 10e3], Q1: "irlz44p", LP1: ["LAMP", "Last"] },
  { VCC: ["LP1.1"], GND: ["Q1.S", "R2.2"], EIN: ["G1.1", "R1.1"], GATE: ["R1.2", "R2.1", "Q1.G"], DRAIN: ["LP1.2", "Q1.D"] });
NL.gleich = nmk({ G1: ["G", "Trafo ~"], G2: ["G", "Trafo ~"], D1: ["D", "1N4007"], D2: ["D", "1N4007"], D3: ["D", "1N4007"], D4: ["D", "1N4007"], C1: ["C", "$C", "pol"], P1: ["G", "+"] },
  { AC1: ["G1.1", "D1.1", "D3.2"], AC2: ["G2.1", "D2.1", "D4.2"], PLUS: ["D1.2", "D2.2", "C1.1", "P1.1"], GND: ["D3.1", "D4.1", "C1.2"] });
NL.zdiode = nmk({ G1: ["G", "Eingang"], R1: ["R", "$R"], D1: ["D", "Z-Diode"], P1: ["G", "Ausgang"] },
  { EIN: ["G1.1", "R1.1"], AUS: ["R1.2", "D1.2", "P1.1"], GND: ["D1.1"] });
/* --- Netzlisten der Erweiterung 3 --- */
PARTIC.lm337t = { id: "lm337t", name: "LM337", pkg: "TO-220", pins: ["ADJ:i", "IN:v", "OUT:o"], sip: 1 };
PARTIC.lm1117t = { id: "lm1117t", name: "LM1117-3.3", pkg: "SOT-223", pins: ["GND:g", "OUT:o", "IN:v"], sip: 1 };
NL.hc245 = nmk({ U1: "hc245", G1: ["G", "A1"], SW1: ["SW", "DIR"], R1: ["R", 10e3], R2: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.20", "SW1.1"], GND: ["U1.10", "U1.19", "R1.2", "D1.2"], DIR: ["SW1.2", "R1.1", "U1.1"], A1: ["G1.1", "U1.2"], B1: ["U1.18", "R2.1"], LED: ["R2.2", "D1.1"] });
NL.hc573 = nmk({ U1: "hc573", G1: ["G", "D0"], G2: ["G", "LE"], R1: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.20"], GND: ["U1.10", "U1.1", "D1.2"], D0: ["G1.1", "U1.2"], LE: ["G2.1", "U1.11"], Q0: ["U1.19", "R1.1"], LED: ["R1.2", "D1.1"] });
(function(){ var n = nmk({ U1: "cd4094", G1: ["G", "Daten"], G2: ["G", "Takt"], G3: ["G", "Strobe"] }, { VCC: ["U1.16", "U1.15"], GND: ["U1.8"], DATA: ["G1.1", "U1.2"], CLK: ["G2.1", "U1.3"], STROBE: ["G3.1", "U1.1"] }); ledsOn(n, ["U1.4", "U1.5", "U1.6", "U1.7", "U1.14", "U1.13", "U1.12", "U1.11"], 1000, "#ffb000", "", 0); NL.cd4094 = n; })();
(function(){ var n = nmk({ U1: "cd4020", G1: ["G", "Takt"] }, { VCC: ["U1.16"], GND: ["U1.8", "U1.11"], TAKT: ["G1.1", "U1.10"] }); ledsOn(n, ["U1.9", "U1.7", "U1.5", "U1.4", "U1.6", "U1.13", "U1.12", "U1.14"], 330, "#6dffb0", "", 0); NL.cd4020 = n; })();
NL.cd4046 = nmk({ U1: "cd4046", G1: ["G", "Steuerspannung"], C1: ["C", "$C"], R1: ["R", "$R1"], P1: ["G", "Ausgang"] },
  { VCC: ["U1.16"], GND: ["U1.8", "U1.5", "R1.2"], CA: ["U1.6", "C1.1"], CB: ["U1.7", "C1.2"], RSET: ["U1.11", "R1.1"], VCOIN: ["G1.1", "U1.9"], VCOOUT: ["U1.4", "P1.1"] });
(function(){ var p = { U1: "lm339", G1: ["G", "Messspannung"], Ra: ["R", 1e3], Rb: ["R", 1e3], Rc: ["R", 1e3], Rd: ["R", 1e3], Re: ["R", 1e3] }, nt = { VCC: ["U1.3", "Ra.1"], GND: ["U1.12", "Re.2"], S4: ["Ra.2", "Rb.1", "U1.11"], S3: ["Rb.2", "Rc.1", "U1.9"], S2: ["Rc.2", "Rd.1", "U1.7"], S1: ["Rd.2", "Re.1", "U1.5"], MESS: ["G1.1", "U1.4", "U1.6", "U1.8", "U1.10"] };
  [2, 1, 14, 13].forEach(function(pin, i){ var r = "R" + (i + 1), d = "D" + (i + 1); p[r] = ["R", 330]; p[d] = ["LED", ["#6dffb0", "#b6ff3d", "#ffb000", "#ff4d4d"][i]]; nt.VCC.push(r + ".1"); nt["L" + (i + 1)] = [r + ".2", d + ".1"]; nt["O" + (i + 1)] = [d + ".2", "U1." + pin]; });
  NL.lm339 = nmk(p, nt); })();
NL.tl072 = nmk({ U1: "tl072", G1: ["G", "Signal"], Ck: ["C", 1e-6], Rin: ["R", 1e6], R1: ["R", "$R1"], R2: ["R", "$R2"], G2: ["G", "−12 V"], P1: ["G", "Ausgang"] },
  { VCC: ["U1.8"], VNEG: ["G2.1", "U1.4"], GND: ["Rin.2", "R1.2"], SIG: ["G1.1", "Ck.1"], IN: ["Ck.2", "Rin.1", "U1.3"], FB: ["U1.2", "R1.1", "R2.2"], OUT: ["U1.1", "R2.1", "P1.1"] });
NL.ne556 = nmk({ U1: "ne556", R1: ["R", 10e3], R2: ["R", 47e3], C1: ["C", "$C1"], R3: ["R", 1e3], R4: ["R", 68e3], C2: ["C", "$C2"], C3: ["C", 10e-6, "pol"], SP1: ["SPK", "Piezo"] },
  { VCC: ["U1.14", "U1.4", "R1.1", "R3.1"], GND: ["U1.7", "C1.2", "C2.2", "SP1.2"], DIS1: ["R1.2", "U1.1", "R2.1"], KOND1: ["R2.2", "U1.2", "U1.6", "C1.1"], TAKT: ["U1.5", "U1.10"], DIS2: ["R3.2", "U1.13", "R4.1"], KOND2: ["R4.2", "U1.12", "U1.8", "C2.1"], TON: ["U1.9", "C3.1"], LS: ["C3.2", "SP1.1"] });
NL.lm337 = nmk({ U1: "lm337t", G1: ["G", "−Vin"], C1: ["C", 1e-6, "pol"], C2: ["C", 10e-6, "pol"], R1: ["R", 240], R2: ["R", "$R2"], P1: ["G", "−Vout"] },
  { IN: ["G1.1", "U1.IN", "C1.2"], OUT: ["U1.OUT", "C2.2", "R1.1", "P1.1"], ADJ: ["U1.ADJ", "R1.2", "R2.1"], GND: ["C1.1", "C2.1", "R2.2"] });
NL.lm1117 = nmk({ U1: "lm1117t", G1: ["G", "5 V"], C1: ["C", 10e-6, "pol"], C2: ["C", 22e-6, "pol"], P1: ["G", "3,3 V"] },
  { IN: ["G1.1", "U1.IN", "C1.1"], OUT: ["U1.OUT", "C2.1", "P1.1"], GND: ["U1.GND", "C1.2", "C2.2"] });
/* --- Netzlisten der Erweiterung 4 --- */
PARTIC.bc557 = { id: "bc557", name: "BC557", pkg: "TO-92", pins: ["C:o", "B:i", "E:v"], sip: 1, sym: "pnp" };
PARTIC.bc547 = { id: "bc547", name: "BC547", pkg: "TO-92", pins: ["C:o", "B:i", "E:g"], sip: 1, sym: "npn" };
PARTIC.irf9540 = { id: "irf9540", name: "IRF9540", pkg: "TO-220", pins: ["G:i", "D:o", "S:v"], sip: 1, sym: "pmos" };
PARTIC.bt136 = { id: "bt136", name: "BT136", pkg: "TO-220", pins: ["MT1:g", "MT2:o", "G:i"], sip: 1, sym: "triac" };
PARTIC.tsop = { id: "tsop", name: "TSOP4838", pkg: "TO-92", pins: ["OUT:o", "GND:g", "VS:v"], sip: 1 };
NL.pnp = nmk({ G1: ["G", "Pin"], Rb: ["R", "$Rb"], Rp: ["R", 10e3], Q1: "bc557", LP1: ["LAMP", "Last"] },
  { VCC: ["Q1.E", "Rp.1"], GND: ["LP1.2"], EIN: ["G1.1", "Rb.1"], BASIS: ["Rb.2", "Rp.2", "Q1.B"], KOLLEKTOR: ["Q1.C", "LP1.1"] });
NL.pmos = nmk({ G1: ["G", "Pin"], R1: ["R", 1e3], Q1: "bc547", R2: ["R", 10e3], M1: "irf9540", G2: ["G", "+12 V"], LP1: ["LAMP", "Last"] },
  { V12: ["G2.1", "M1.S", "R2.1"], GND: ["Q1.E", "LP1.2"], EIN: ["G1.1", "R1.1"], BASIS: ["R1.2", "Q1.B"], GATE: ["Q1.C", "R2.2", "M1.G"], DRAIN: ["M1.D", "LP1.1"] });
NL.led = nmk({ G1: ["G", "+V"], R1: ["R", "$R"], D1: ["LED", "#ff4d4d"] }, { PLUS: ["G1.1", "R1.1"], A: ["R1.2", "D1.1"], GND: ["D1.2"] });
NL.ad620 = nmk({ U1: "ad620", G1: ["G", "+IN"], G2: ["G", "−IN"], RG: ["R", "$RG"], G3: ["G", "−12 V"], P1: ["G", "Ausgang"] },
  { VCC: ["U1.7"], VNEG: ["G3.1", "U1.4"], GND: ["U1.5"], PLUS: ["G1.1", "U1.3"], MINUS: ["G2.1", "U1.2"], RG1: ["U1.1", "RG.1"], RG2: ["U1.8", "RG.2"], OUT: ["U1.6", "P1.1"] });
(function(){ var p = { U1: "dac0808", U2: "lm358", R1: ["R", 5e3], R2: ["R", 5e3], R3: ["R", 5e3], C1: ["C", 100e-9], G1: ["G", "+Vref"], G2: ["G", "−12 V"], P1: ["G", "Ausgang"] }, nt = { VCC: ["U1.13", "U2.8"], VNEG: ["G2.1", "U1.3", "C1.2", "U2.4"], GND: ["U1.2", "R2.2", "U2.3"], REF: ["G1.1", "R1.1"], REFP: ["R1.2", "U1.14"], REFM: ["U1.15", "R2.1"], COMP: ["U1.16", "C1.1"], IOUT: ["U1.4", "U2.2", "R3.1"], OUT: ["U2.1", "R3.2", "P1.1"] };
  for (var i = 0; i < 4; i++){ p["G" + (i + 4)] = ["G", "Bit " + (3 - i)]; nt["D" + i] = ["G" + (i + 4) + ".1", "U1." + (9 + i)]; } nt.GND.push("U1.5", "U1.6", "U1.7", "U1.8"); NL.dac0808 = nmk(p, nt); })();
(function(){ var p = { U1: "hc283" }, nt = { VCC: ["U1.16"], GND: ["U1.8", "U1.7"] }; [["A1", 5], ["A2", 3], ["A3", 14], ["A4", 12], ["B1", 6], ["B2", 2], ["B3", 15], ["B4", 11]].forEach(function(x, i){ p["G" + (i + 1)] = ["G", x[0]]; nt[x[0]] = ["G" + (i + 1) + ".1", "U1." + x[1]]; });
  var n = nmk(p, nt); ledsOn(n, ["U1.4", "U1.1", "U1.13", "U1.10", "U1.9"], 330, "#6dffb0", "", 0); NL.adder = n; })();
NL.ds1307 = nmk({ U1: "ds1307", X1: ["XTAL", "32,768 kHz"], B1: ["G", "CR2032 +"], R1: ["R", 4.7e3], R2: ["R", 4.7e3], R3: ["R", 4.7e3], G1: ["G", "SDA"], G2: ["G", "SCL"], P1: ["G", "SQW"] },
  { VCC: ["U1.8", "R1.1", "R2.1", "R3.1"], GND: ["U1.4"], X1: ["U1.1", "X1.1"], X2: ["U1.2", "X1.2"], VBAT: ["B1.1", "U1.3"], SDA: ["U1.5", "R1.2", "G1.1"], SCL: ["U1.6", "R2.2", "G2.1"], SQW: ["U1.7", "R3.2", "P1.1"] });
NL.eeprom = nmk({ U1: "eeprom24", R1: ["R", 4.7e3], R2: ["R", 4.7e3], G1: ["G", "SDA"], G2: ["G", "SCL"] },
  { VCC: ["U1.8", "R1.1", "R2.1"], GND: ["U1.4", "U1.1", "U1.2", "U1.3", "U1.7"], SDA: ["U1.5", "R1.2", "G1.1"], SCL: ["U1.6", "R2.2", "G2.1"] });
NL.max485 = nmk({ U1: "max485", G1: ["G", "TX"], G2: ["G", "Richtung"], P1: ["G", "RX"], R1: ["R", 120], G3: ["G", "Leitung A"], G4: ["G", "Leitung B"] },
  { VCC: ["U1.8"], GND: ["U1.5"], RO: ["U1.1", "P1.1"], DIR: ["G2.1", "U1.2", "U1.3"], DI: ["G1.1", "U1.4"], A: ["U1.6", "R1.1", "G3.1"], B: ["U1.7", "R1.2", "G4.1"] });
NL.triac = nmk({ G1: ["G", "Pin"], R1: ["R", 330], U1: "moc3021", R2: ["R", 360], Q1: "bt136", G2: ["G", "Phase L"], LP1: ["LAMP", "Lampe 230 V"], G3: ["G", "Neutral N"] },
  { EIN: ["G1.1", "R1.1"], LED: ["R1.2", "U1.1"], GND: ["U1.2"], PHASE: ["G2.1", "LP1.1"], MT2: ["LP1.2", "Q1.MT2", "R2.1"], OPTO: ["R2.2", "U1.6"], GATE: ["U1.4", "Q1.G"], NEUTRAL: ["Q1.MT1", "G3.1"] });
NL.tsop = nmk({ U1: "tsop", R1: ["R", 100], C1: ["C", 4.7e-6, "pol"], P1: ["G", "zum Pin"] },
  { VCC: ["R1.1"], VS: ["R1.2", "U1.VS", "C1.1"], GND: ["U1.GND", "C1.2"], OUT: ["U1.OUT", "P1.1"] });
NL.a4988 = nmk({ U1: "a4988", G1: ["G", "STEP"], G2: ["G", "DIR"], G3: ["G", "+12 V"], C1: ["C", 100e-6, "pol"], M1: ["LAMP", "Spule A"], M2: ["LAMP", "Spule B"] },
  { VCC: ["U1.VDD", "U1.MS1", "U1.MS2", "U1.MS3"], GND: ["U1.GND", "U1.GND2", "U1.EN", "C1.2"], RS: ["U1.RST", "U1.SLP"], STEP: ["G1.1", "U1.STEP"], DIR: ["G2.1", "U1.DIR"], VMOT: ["G3.1", "U1.VMOT", "C1.1"], A1: ["U1.12", "M1.1"], A2: ["U1.11", "M1.2"], B1: ["U1.13", "M2.1"], B2: ["U1.14", "M2.2"] });
(function(){ var p = { U1: "ne555", U2: "cd4017", R1: ["R", 10e3], R2: ["R", 68e3], C1: ["C", 10e-6, "pol"], C2: ["C", 10e-9], Rr: ["R", 330], Ry: ["R", 330], Rg: ["R", 330], LR: ["LED", "#ff4d4d"], LY: ["LED", "#ffb000"], LG: ["LED", "#6dffb0"] },
  n = { VCC: ["U1.8", "U1.4", "R1.1", "U2.16"], GND: ["U1.1", "C1.2", "C2.2", "U2.8", "U2.13", "LR.2", "LY.2", "LG.2"], ENTLADEN: ["R1.2", "U1.7", "R2.1"], KONDENSATOR: ["R2.2", "U1.6", "U1.2", "C1.1"], CTRL: ["U1.5", "C2.1"], TAKT: ["U1.3", "U2.14"], RESET: ["U2.9", "U2.15"], ROT: ["Rr.1"], GELB: ["Ry.1"], GRUEN: ["Rg.1"], LR: ["Rr.2", "LR.1"], LYn: ["Ry.2", "LY.1"], LGn: ["Rg.2", "LG.1"] }, k = 1;
  function d(pin, net){ var id = "D" + (k++); p[id] = ["D", "1N4148"]; n["Q" + id] = ["U2." + pin, id + ".1"]; n[net].push(id + ".2"); }
  [3, 2, 4, 7].forEach(function(x){ d(x, "ROT"); }); [7, 6].forEach(function(x){ d(x, "GELB"); }); [10, 1, 5].forEach(function(x){ d(x, "GRUEN"); });
  var m = {}; Object.keys(n).forEach(function(key){ if (/^QD/.test(key)){ var pin = n[key][0]; m[pin] = m[pin] || []; m[pin].push(key); } });
  Object.keys(m).forEach(function(pin){ if (m[pin].length > 1){ var keep = m[pin][0]; m[pin].slice(1).forEach(function(key){ n[keep].push(n[key][1]); delete n[key]; }); } });
  NL.k_ampel = nmk(p, n); })();
NL.k_thermo = nmk({ U1: "lm35p", U2: "lm393", Ra: ["R", 47e3], Rp: ["R", "Poti 10 kΩ"], Rh: ["R", 1e6], Ru: ["R", 4.7e3], Rb: ["R", 1e3], Q1: "bc337", K1: ["LAMP", "Relais"], D1: ["D", "1N4007"] },
  { VCC: ["U1.VS", "U2.8", "Ra.1", "Ru.1", "K1.1", "D1.2"], GND: ["U1.GND", "U2.4", "Rp.2", "Q1.E"], TEMP: ["U1.VOUT", "U2.2"], SOLL: ["Ra.2", "Rp.1", "U2.3", "Rh.1"], OUT: ["U2.1", "Ru.2", "Rh.2", "Rb.1"], BASIS: ["Rb.2", "Q1.B"], SPULE: ["K1.2", "Q1.C", "D1.1"] });
NL.k_netz = nmk({ G1: ["G", "Trafo ~"], G2: ["G", "Trafo ~"], D1: ["D", "1N4007"], D2: ["D", "1N4007"], D3: ["D", "1N4007"], D4: ["D", "1N4007"], C1: ["C", 2200e-6, "pol"], U1: "lm317t", R1: ["R", 240], R2: ["R", "Poti 5 kΩ"], C2: ["C", 10e-6, "pol"], P1: ["G", "Ausgang"] },
  { AC1: ["G1.1", "D1.1", "D3.2"], AC2: ["G2.1", "D2.1", "D4.2"], ROH: ["D1.2", "D2.2", "C1.1", "U1.IN"], GND: ["D3.1", "D4.1", "C1.2", "R2.2", "C2.2"], OUT: ["U1.OUT", "R1.1", "C2.1", "P1.1"], ADJ: ["U1.ADJ", "R1.2", "R2.1"] });
(function(){ var p = { U1: "ne555", U2: "cd4017", R1: ["R", 1e3], R2: ["R", 4.7e3], C1: ["C", 1e-6, "pol"], C2: ["C", 10e-9], R3: ["R", 10e3], SW1: ["SW", "Würfeln"] },
  n = { VCC: ["U1.8", "R1.1", "SW1.1", "U2.16"], GND: ["U1.1", "C1.2", "C2.2", "R3.2", "U2.8", "U2.13"], ENTLADEN: ["R1.2", "U1.7", "R2.1"], KONDENSATOR: ["R2.2", "U1.6", "U1.2", "C1.1"], CTRL: ["U1.5", "C2.1"], RST: ["U1.4", "SW1.2", "R3.1"], TAKT: ["U1.3", "U2.14"], RESET: ["U2.5", "U2.15"] };
  var nl = nmk(p, n); ledsOn(nl, ["U2.3", "U2.2", "U2.4", "U2.7", "U2.10", "U2.1"], 330, "#ffb000", "L", 0); NL.k_wuerfel = nl; })();
NL.k_alarm = nmk({ LDR1: ["LDR", "LDR"], R1: ["R", 10e3], R2: ["R", 10e3], R3: ["R", 10e3], U1: "lm393", R4: ["R", 10e3], U2: "ne555", R5: ["R", 470e3], C1: ["C", 10e-6, "pol"], C2: ["C", 10e-9], SW1: ["SW", "Scharf"], R6: ["R", 10e3], SP1: ["SPK", "Summer"], R7: ["R", 330], D1: ["LED", "#ff4d4d"] },
  { VCC: ["LDR1.1", "R2.1", "R4.1", "U1.8", "U2.8", "R5.1", "SW1.1"], GND: ["R1.2", "R3.2", "U1.4", "U2.1", "C1.2", "C2.2", "R6.2", "SP1.2", "D1.2"], X: ["LDR1.2", "R1.1", "U1.3"], REF: ["R2.2", "R3.1", "U1.2"], TRIG: ["U1.1", "R4.2", "U2.2"], ZEIT: ["R5.2", "U2.7", "U2.6", "C1.1"], CTRL: ["U2.5", "C2.1"], SCHARF: ["U2.4", "SW1.2", "R6.1"], OUT: ["U2.3", "SP1.1", "R7.1"], LED: ["R7.2", "D1.1"] });
NL.k_wechsel = nmk({ R1: ["R", 470], D1: ["LED", "#ff4d4d"], R2: ["R", 47e3], R3: ["R", 47e3], R4: ["R", 470], D2: ["LED", "#6dffb0"], C1: ["C", 10e-6, "pol"], C2: ["C", 10e-6, "pol"], Q1: "bc547", Q2: "bc547" },
  { VCC: ["R1.1", "R2.1", "R3.1", "R4.1"], GND: ["Q1.E", "Q2.E"], A1: ["R1.2", "D1.1"], K1: ["D1.2", "Q1.C", "C1.1"], B2: ["C1.2", "R2.2", "Q2.B"], A2: ["R4.2", "D2.1"], K2: ["D2.2", "Q2.C", "C2.1"], B1: ["C2.2", "R3.2", "Q1.B"] });
NL.k_verz = nmk({ R1: ["R", 1e6], C1: ["C", 10e-6, "pol"], R2: ["R", 470], D1: ["LED", "#6dffb0"], Q1: "bc547" },
  { VCC: ["R1.1", "R2.1"], GND: ["C1.2", "Q1.E"], B1: ["R1.2", "C1.1", "Q1.B"], A1: ["R2.2", "D1.1"], K1: ["D1.2", "Q1.C"] });
NL.k_touch = nmk({ SW1: ["SW", "Finger"], R1: ["R", 100e3], R2: ["R", 470], D1: ["LED", "#ffb000"], Q1: "bc547", Q2: "bc547" },
  { VCC: ["SW1.1", "R2.1"], FINGER: ["SW1.2", "R1.1"], B1: ["R1.2", "Q1.B"], MITTE: ["Q1.E", "Q2.B"], GND: ["Q2.E"], A1: ["R2.2", "D1.1"], K1: ["D1.2", "Q1.C", "Q2.C"] });
NL.k_strom = nmk({ R1: ["R", 1e3], Rs: ["R", 33], D1: ["LED", "#6dffb0"], Q1: "bc547", Q2: "bc547" },
  { VCC: ["R1.1", "D1.1"], K1: ["D1.2", "Q1.C"], B1: ["R1.2", "Q1.B", "Q2.C"], S: ["Q1.E", "Q2.B", "Rs.1"], GND: ["Rs.2", "Q2.E"] });
NL.k_zreg = nmk({ G1: ["G", "Uein 6…15 V"], R1: ["R", 220], D1: ["D", "Z-Diode 5,1 V"], R2: ["R", 1e3], P1: ["G", "Uaus"] },
  { EIN: ["G1.1", "R1.1"], AUS: ["R1.2", "D1.2", "R2.1", "P1.1"], GND: ["D1.1", "R2.2"] });
NL.k_bistabil = nmk({ U1: "ne555", R1: ["R", 10e3], R2: ["R", 10e3], SW1: ["SW", "Set"], SW2: ["SW", "Reset"], C2: ["C", 10e-9], R3: ["R", 330], D1: ["LED", "#6dffb0"] },
  { VCC: ["U1.8", "R1.1", "R2.1"], GND: ["U1.1", "U1.6", "SW1.2", "SW2.2", "C2.2", "D1.2"], SETN: ["R1.2", "U1.2", "SW1.1"], RESN: ["R2.2", "U1.4", "SW2.1"], CTRL: ["U1.5", "C2.1"], OUT: ["U1.3", "R3.1"], LED: ["R3.2", "D1.1"] });
NL.k_schmitt = nmk({ U1: "ne555", G1: ["G", "Uin (langsam)"], C2: ["C", 10e-9], R3: ["R", 330], D1: ["LED", "#ff4d4d"] },
  { VCC: ["U1.8", "U1.4"], GND: ["U1.1", "C2.2", "D1.2"], EIN: ["G1.1", "U1.2", "U1.6"], CTRL: ["U1.5", "C2.1"], OUT: ["U1.3", "R3.1"], LED: ["R3.2", "D1.1"] });
/* --- Netz-Auswertung --- */
function icDef(spec){ return PARTIC[spec] || icById(spec); }
function netAnalyse(pid, P){
  var nl = NL[pid]; if (!nl) return null; if (typeof nl === "function") nl = nl(P);
  var parts = {}, order = Object.keys(nl.parts);
  order.forEach(function(id){ var s = nl.parts[id], p = { id: id };
    if (typeof s === "string"){ p.kind = "ic"; p.def = icDef(s); p.n = p.def.pins.length; p.names = p.def.pins.map(function(x){ return x.split(":")[0]; }); }
    else { p.kind = s[0]; p.val = s[1]; p.extra = s[2]; p.n = p.kind === "G" ? 1 : 2;
      if (typeof p.val === "string" && p.val.charAt(0) === "$") p.val = P[p.val.slice(1)]; }
    parts[id] = p; });
  function term(ref){ var a = ref.split("."), p = parts[a[0]], t = a[1]; if (!p) throw new Error("Bauteil " + a[0] + " fehlt"); var n = parseInt(t, 10);
    if (isNaN(n)){ n = p.names ? p.names.indexOf(t) + 1 : 0; if (n < 1) throw new Error(ref + "?"); } return a[0] + "." + n; }
  var nets = [], by = {}, k = 0;
  Object.keys(nl.nets).forEach(function(name){ var m = nl.nets[name].map(term), rail = name === "VCC" ? "vcc" : name === "GND" ? "gnd" : null; var n = { name: name, members: [], rail: rail, id: k++ }; m.forEach(function(t){ if (!by[t]){ by[t] = n; n.members.push(t); } }); nets.push(n); });
  // alle Anschlüsse ohne Netz bekommen ein eigenes
  order.forEach(function(id){ var p = parts[id]; for (var i = 1; i <= p.n; i++){ var t = id + "." + i; if (!by[t]){ var n = { name: "N" + k, members: [t], rail: null, id: k++, anon: 1 }; by[t] = n; nets.push(n); } } });
  return { parts: parts, order: order, nets: nets, by: by, P: P };
}
function pv(p){ if (p.val == null || typeof p.val === "string") return p.val || ""; return p.kind === "C" ? fmt(p.val, "F") : p.kind === "R" ? fmt(p.val, "Ω") : p.kind === "POT" ? fmt(p.val, "Ω") : String(p.val); }

/* --- Schaltplan --- */
function renderSchem(A){
  var NS = "http://www.w3.org/2000/svg", out = [], drawn = {}, S = 46;
  function esc2(s){ return esc(String(s)); }
  function two(p){ return p.kind === "R" || p.kind === "C" || p.kind === "LED" || p.kind === "D" || p.kind === "SW" || p.kind === "XTAL" || p.kind === "LAMP" || p.kind === "SPK" || p.kind === "LDR"; }
  function symb(p, dx, entry){ // horizontales Bauteil von (0,0) nach (dx*46,0)
    var L = 46, s = "", big = (p.kind === "LAMP" || p.kind === "SPK" || p.kind === "SW" || p.kind === "LDR" || p.kind === "XTAL") && p.val, lab = (big ? "" : '<text class="sl" x="' + (dx * L / 2) + '" y="' + (p.kind === "LED" ? -21 : p.kind === "D" ? -14 : -12) + '" text-anchor="middle">' + esc2(p.id) + '</text>') + '<text class="sv" x="' + (dx * L / 2) + '" y="' + (big ? 24 : 21) + '" text-anchor="middle">' + esc2(p.kind === "LED" ? "" : p.kind === "D" ? (p.val || "") : (p.kind === "SW" || p.kind === "LDR" || p.kind === "LAMP" || p.kind === "SPK" || p.kind === "XTAL" ? p.val : pv(p))) + "</text>";
    function X(v){ return dx * v; }
    if (p.kind === "R") s = '<path d="M0 0H' + X(8) + 'M' + X(38) + ' 0H' + X(46) + '"/><rect x="' + Math.min(X(8), X(38)) + '" y="-6" width="30" height="12"/>';
    else if (p.kind === "C") s = '<path d="M0 0H' + X(20) + 'M' + X(26) + ' 0H' + X(46) + 'M' + X(20) + ' -11V11M' + X(26) + ' -11V11"/>' + (p.extra === "pol" ? '<text class="sl" x="' + X(14) + '" y="-12" text-anchor="middle">+</text>' : "");
    else if (p.kind === "LED" || p.kind === "D"){ var fw = (entry === 1) ? dx : -dx; // Richtung Anode→Kathode
      s = '<path d="M0 0H' + X(14) + 'M' + X(32) + ' 0H' + X(46) + '"/><path d="M' + (fw > 0 ? X(14) : X(32)) + ' -9V9L' + (fw > 0 ? X(32) : X(14)) + ' 0Z"/><path d="M' + (fw > 0 ? X(32) : X(14)) + ' -9V9"/>' + (p.kind === "LED" ? '<path d="M' + X(22) + ' -11l6 -6M' + X(28) + ' -9l6 -6" stroke-width="1.4"/>' : ""); }
    else if (p.kind === "SW") s = '<path d="M0 0H' + X(14) + 'M' + X(32) + ' 0H' + X(46) + 'M' + X(14) + ' 0L' + X(30) + ' -11"/><circle cx="' + X(14) + '" cy="0" r="2.3"/><circle cx="' + X(32) + '" cy="0" r="2.3"/>';
    else if (p.kind === "XTAL") s = '<path d="M0 0H' + X(14) + 'M' + X(32) + ' 0H' + X(46) + 'M' + X(14) + ' -10V10M' + X(32) + ' -10V10"/><rect x="' + Math.min(X(19), X(27)) + '" y="-7" width="8" height="14"/>';
    else if (p.kind === "LAMP") s = '<path d="M0 0H' + X(12) + 'M' + X(34) + ' 0H' + X(46) + '"/><circle cx="' + X(23) + '" cy="0" r="11"/><path d="M' + X(15) + ' -8L' + X(31) + ' 8M' + X(15) + ' 8L' + X(31) + ' -8"/>';
    else if (p.kind === "SPK") s = '<path d="M0 0H' + X(14) + 'M' + X(36) + ' 0H' + X(46) + '"/><rect x="' + Math.min(X(14), X(24)) + '" y="-7" width="10" height="14"/><path d="M' + X(24) + ' -7L' + X(36) + ' -13V13L' + X(24) + ' 7"/>';
    else if (p.kind === "LDR") s = '<path d="M0 0H' + X(8) + 'M' + X(38) + ' 0H' + X(46) + '"/><rect x="' + Math.min(X(8), X(38)) + '" y="-6" width="30" height="12"/><path d="M' + X(12) + ' -17l7 6M' + X(20) + ' -19l7 6" stroke-width="1.4"/>';
    return '<g>' + s + lab + "</g>";
  }
  function rail(kind, dx){ var s = '<path d="M0 0H' + (dx * 12) + '"/><g transform="translate(' + (dx * 12) + ',0)">'; if (kind === "gnd") s += '<path d="M0 0V10M-9 10H9M-6 14H6M-3 18H3"/>'; else s += '<path d="M0 0V-10M-8 -10H8"/><text class="sl" x="0" y="-14" text-anchor="middle">+V</text>'; return s + "</g>"; }
  function flag(net, dx, hl){ var w = 14 + 7.4 * net.name.length; return '<path d="M0 0H' + (dx * 8) + '"/><g transform="translate(' + (dx * 8) + ',0)" class="fl" data-net="' + net.id + '"><path d="M0 0L' + (dx * 6) + ' -9H' + (dx * w) + 'V9H' + (dx * 6) + 'Z"/><text class="sf" x="' + (dx * (w / 2 + 3)) + '" y="4" text-anchor="middle">' + esc2(net.name) + "</text></g>"; }
  // Kette von einem Anschluss aus; liefert {svg, len}
  function chain(ref, dx, depth){
    var cur = ref, x = 0, s = "", len = 0;
    for (var guard = 0; guard < 5; guard++){
      var net = A.by[cur], others = net.members.filter(function(m){ return m !== cur; });
      if (net.rail){ s += '<g transform="translate(' + x + ',0)" class="nt" data-net="' + net.id + '">' + rail(net.rail, dx) + "</g>"; len = Math.abs(x) + 28; break; }
      if (!others.length){ s += '<g transform="translate(' + x + ',0)"><path d="M0 0H' + (dx * 8) + '"/><path d="M8 -4l8 8M16 -4l-8 8" transform="scale(' + dx + ',1)"/></g>'; len = Math.abs(x) + 20; break; }
      var o = others[0], po = A.parts[o.split(".")[0]], ti = +o.split(".")[1];
      if (others.length === 1 && po.kind === "G"){ drawn[po.id] = 1; s += '<g transform="translate(' + x + ',0)"><path d="M0 0H' + (dx * 12) + '"/><g transform="translate(' + (dx * 12) + ',0)"><circle cx="' + (dx * 11) + '" cy="0" r="11" class="src"/><path d="M' + (dx * 11 - 6) + ' 0q3 -7 6 0t6 0" fill="none"/><text class="sl" x="' + (dx * 11) + '" y="-16" text-anchor="middle">' + esc2(po.val) + "</text></g></g>"; len = Math.abs(x) + 38; break; }
      if (others.length === 1 && two(po) && !drawn[po.id]){ drawn[po.id] = 1; s += '<g transform="translate(' + x + ',0)" class="pt"><path d="M0 0H' + (dx * 10) + '"/><g transform="translate(' + (dx * 10) + ',0)">' + symb(po, dx, ti) + "</g></g>"; x += dx * 56; cur = po.id + "." + (ti === 1 ? 2 : 1); continue; }
      s += '<g transform="translate(' + x + ',0)">' + flag(net, dx) + "</g>"; len = Math.abs(x) + 18 + 7.4 * net.name.length + 8; break;
    }
    return { svg: s, len: len };
  }
  var boxes = A.order.filter(function(id){ return A.parts[id].kind === "ic"; }), W = 1180, curX = 20, curY = 20, rowH = 0, items = [];
  function symPos(p, nm){ var s = p.def.sym, top = { npn: "C", nmos: "D", pnp: "E", pmos: "S", triac: "MT2" }[s], bot = { npn: "E", nmos: "S", pnp: "C", pmos: "D", triac: "MT1" }[s]; return nm === top ? [1, 0] : nm === bot ? [1, 2] : [0, 1]; }
  boxes.forEach(function(id){
    var p = A.parts[id];
    if (p.def.sym){ var L2 = [], R2 = []; for (var k = 1; k <= p.n; k++){ var sp = symPos(p, p.names[k - 1]), c2 = chain(id + "." + k, sp[0] ? 1 : -1); (sp[0] ? R2 : L2).push({ i: k, idx: sp[1], c: c2 }); }
      var lw2 = Math.max.apply(null, [0].concat(L2.map(function(z){ return z.c.len; }))), rw2 = Math.max.apply(null, [0].concat(R2.map(function(z){ return z.c.len; })));
      items.push({ id: id, p: p, L: L2, R: R2, bh: 92, bw: 74, lw: lw2 + 36, rw: rw2 + 36, sym: p.def.sym }); return; }
    var n = p.n, half = p.def.sip ? n : n / 2, rows = half, bh = rows * S + 40, bw = 116, L = [], Rr = [];
    for (var i = 1; i <= n; i++){ var left = p.def.sip ? true : i <= half, idx = p.def.sip ? i - 1 : (left ? i - 1 : n - i), c = chain(id + "." + i, left ? -1 : 1); (left ? L : Rr).push({ i: i, idx: idx, c: c }); }
    var lw = Math.max.apply(null, [0].concat(L.map(function(z){ return z.c.len; }))), rw = Math.max.apply(null, [0].concat(Rr.map(function(z){ return z.c.len; })));
    items.push({ id: id, p: p, L: L, R: Rr, bh: bh, bw: bw, lw: lw + 36, rw: rw + 36 });
  });
  // Platzieren
  var svg = "", maxX = 0;
  items.forEach(function(it){
    var tot = it.lw + it.bw + it.rw + 24;
    if (curX + tot > W && curX > 20){ curX = 20; curY += rowH + 30; rowH = 0; }
    maxX = Math.max(maxX, curX + it.lw + it.bw + it.rw); var bx = curX + it.lw, by = curY + 26, p = it.p; rowH = Math.max(rowH, it.bh + 26);
    if (it.sym){ var sx0 = bx, sy0 = by, cx = sx0 + 40, cy = sy0 + 46, s = it.sym, tp = sy0 + 14, bt2 = sy0 + 78, g = "";
      if (s === "npn" || s === "pnp"){ g = '<circle cx="' + cx + '" cy="' + cy + '" r="27"/><path d="M' + sx0 + ' ' + cy + 'H' + (cx - 10) + 'M' + (cx - 10) + ' ' + (cy - 15) + 'V' + (cy + 15) + 'M' + (cx - 10) + ' ' + (cy - 7) + 'L' + (cx + 12) + ' ' + (tp + 10) + 'V' + tp + 'H' + (sx0 + it.bw) + 'M' + (cx - 10) + ' ' + (cy + 7) + 'L' + (cx + 12) + ' ' + (bt2 - 10) + 'V' + bt2 + 'H' + (sx0 + it.bw) + '"/>';
        g += s === "npn" ? '<path class="ar" d="M' + (cx + 12) + ' ' + (bt2 - 10) + 'l-9 -1l5 -7z"/>' : '<path class="ar" d="M' + (cx - 8) + ' ' + (cy - 8) + 'l9 -1l-4 7z"/>'; }
      else if (s === "nmos" || s === "pmos"){ g = '<circle cx="' + cx + '" cy="' + cy + '" r="27"/><path d="M' + sx0 + ' ' + cy + 'H' + (cx - 14) + 'V' + (cy - 14) + 'M' + (cx - 8) + ' ' + (cy - 16) + 'V' + (cy - 7) + 'M' + (cx - 8) + ' ' + (cy - 4) + 'V' + (cy + 4) + 'M' + (cx - 8) + ' ' + (cy + 7) + 'V' + (cy + 16) + 'M' + (cx - 8) + ' ' + (cy - 12) + 'H' + (cx + 12) + 'V' + tp + 'H' + (sx0 + it.bw) + 'M' + (cx - 8) + ' ' + (cy + 12) + 'H' + (cx + 12) + 'V' + bt2 + 'H' + (sx0 + it.bw) + 'M' + (cx - 8) + ' ' + cy + 'H' + (cx + 12) + 'V' + (cy + 12) + '"/>';
        g += s === "nmos" ? '<path class="ar" d="M' + (cx - 7) + ' ' + cy + 'l8 -4v8z"/>' : '<path class="ar" d="M' + (cx + 3) + ' ' + cy + 'l-8 -4v8z"/>'; }
      else { g = '<path d="M' + (cx + 4) + ' ' + tp + 'H' + (sx0 + it.bw) + 'M' + (cx + 4) + ' ' + tp + 'V' + (cy - 12) + 'M' + (cx + 4) + ' ' + bt2 + 'H' + (sx0 + it.bw) + 'M' + (cx + 4) + ' ' + bt2 + 'V' + (cy + 12) + 'M' + (cx - 14) + ' ' + (cy - 12) + 'H' + (cx + 22) + 'M' + (cx - 14) + ' ' + (cy + 12) + 'H' + (cx + 22) + '"/><path class="ar" d="M' + (cx - 12) + ' ' + (cy - 12) + 'l8 24l8 -24z"/><path class="ar" d="M' + (cx + 4) + ' ' + (cy + 12) + 'l8 -24l8 24z"/><path d="M' + sx0 + ' ' + bt2 + 'H' + (cx - 14) + 'L' + (cx - 4) + ' ' + (cy + 12) + '"/>'; }
      svg += '<g class="ic sym" data-part="' + it.id + '"><text class="tt" x="' + (cx + 34) + '" y="' + (cy - 2) + '">' + esc2(it.id) + '</text><text class="tn" x="' + (cx + 34) + '" y="' + (cy + 13) + '">' + esc2(shn(p.def.name)) + '</text>' + g;
      it.L.concat(it.R).forEach(function(z){ var left = it.L.indexOf(z) >= 0, y = s === "triac" && !left ? (z.idx === 0 ? tp : bt2) : s === "triac" ? bt2 : z.idx === 0 ? tp : z.idx === 2 ? bt2 : cy, x0 = left ? sx0 : sx0 + it.bw, dx = left ? -1 : 1, net = A.by[it.id + "." + z.i];
        svg += '<g transform="translate(' + x0 + ',' + y + ')" data-net="' + net.id + '" class="pn"><path d="M0 0H' + (dx * 14) + '"/><g transform="translate(' + (dx * 14) + ',0)">' + z.c.svg + '</g><text class="pi" x="' + (dx * 7) + '" y="-5" text-anchor="middle">' + esc2(p.names[z.i - 1]) + '</text></g>'; });
      svg += "</g>"; curX += tot + 20; return; }
    svg += '<g class="ic" data-part="' + it.id + '"><rect class="box" x="' + bx + '" y="' + by + '" width="' + it.bw + '" height="' + it.bh + '" rx="6"/><text class="tt" x="' + (bx + it.bw / 2) + '" y="' + (by + 18) + '" text-anchor="middle">' + esc2(it.id) + '</text><text class="tn" x="' + (bx + it.bw / 2) + '" y="' + (by - 7) + '" text-anchor="middle">' + esc2(shn(p.def.name)) + "</text>";
    it.L.concat(it.R).forEach(function(z){ var left = it.L.indexOf(z) >= 0, y = by + 32 + z.idx * S, x0 = left ? bx : bx + it.bw, nm = p.names[z.i - 1], dx = left ? -1 : 1, net = A.by[it.id + "." + z.i];
      svg += '<g transform="translate(' + x0 + ',' + y + ')" data-net="' + net.id + '" class="pn"><path d="M0 0H' + (dx * 14) + '"/><g transform="translate(' + (dx * 14) + ',0)">' + z.c.svg + '</g><text class="pi" x="' + (dx * 7) + '" y="-5" text-anchor="middle">' + z.i + '</text></g><text class="pnm" x="' + (left ? bx + 6 : bx + it.bw - 6) + '" y="' + (y + 4) + '" text-anchor="' + (left ? "start" : "end") + '">' + esc2(nm) + "</text>"; });
    svg += "</g>"; curX += tot + 20;
  });
  var bottom = curY + rowH + 40;
  // Satelliten
  var sats = A.order.filter(function(id){ return two(A.parts[id]) && !drawn[id]; }), sy = bottom + 10, sx = 30, sh = 0;
  if (sats.length) { svg += '<text class="sec" x="20" y="' + (sy) + '">' + T("Weitere Bauteile (über die Netzfähnchen mit dem Rest verbunden)", "Autres composants (reliés par les repères de réseau)") + "</text>"; sy += 40; }
  sats.forEach(function(id){
    if (drawn[id]) return; var p = A.parts[id]; drawn[id] = 1;
    var l = chain(id + ".1", -1), r = chain(id + ".2", 1), wdt = l.len + 56 + r.len + 20;
    if (sx + wdt > W && sx > 30){ sx = 30; sy += 66; }
    svg += '<g transform="translate(' + (sx + l.len) + ',' + sy + ')"><g class="pt">' + '<g transform="translate(0,0)">' + symb(p, 1, 1) + "</g></g><g>" + l.svg + '</g><g transform="translate(46,0)">' + r.svg + "</g></g>"; maxX = Math.max(maxX, sx + wdt); sx += wdt + 24;
  });
  var H = (sats.length ? sy + 50 : bottom + 10), W2 = Math.max(400, Math.min(W, maxX + 30)); W = W2;
  return '<svg class="ic-sch" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + T("Schaltplan", "Schéma") + '" style="min-width:' + Math.min(W, 760) + 'px;max-width:' + W + 'px">' + svg + "</svg>";
}
/* --- Handgezeichnete Schaltpläne: jedes Bauteil direkt verdrahtet (keine Netzfähnchen) --- */
var LAY = {};
function schem2(A, L0){
  var L = typeof L0 === "function" ? L0(A.P || {}, A) : L0, TP = {}, W1 = [], PT = [], TX = [], BX = [], SEG = [], bb = [1e9, 1e9, -1e9, -1e9], miss = [];
  function ext(x, y){ if (x < bb[0]) bb[0] = x; if (y < bb[1]) bb[1] = y; if (x > bb[2]) bb[2] = x; if (y > bb[3]) bb[3] = y; }
  function e(s){ return esc(String(s)); }
  function tx(x, y, s, cls, anc){ s = String(s == null ? "" : s); if (!s) return ""; var w = s.length * 6.6; ext(anc === "end" ? x - w : anc === "middle" ? x - w / 2 : x, y - 11); ext(anc === "end" ? x : anc === "middle" ? x + w / 2 : x + w, y + 4);
    return '<text class="' + cls + '" x="' + x + '" y="' + y + '"' + (anc && anc !== "start" ? ' text-anchor="' + anc + '"' : "") + ">" + e(s) + "</text>"; }
  function term(ref, x, y, dx, dy){ TP[ref] = { x: x, y: y, dx: dx, dy: dy, ref: ref }; ext(x, y); }
  function box(x1, y1, x2, y2){ BX.push([Math.min(x1, x2), Math.min(y1, y2), Math.max(x1, x2), Math.max(y1, y2)]); ext(x1, y1); ext(x2, y2); }
  var twoK = { R: 1, C: 1, LED: 1, D: 1, SW: 1, XTAL: 1, LAMP: 1, SPK: 1, LDR: 1 };
  /* --- Zweipole --- */
  function two(p, x, y, o){
    o = o || "h"; var v = o.charAt(0) === "v", f = o.indexOf("-") >= 0 ? -1 : 1, side = o.indexOf("<") >= 0 ? -1 : o.indexOf(">") >= 0 ? 1 : 0, b = "", k = p.kind, val = p.val;
    var lead = function(a){ return '<path d="M-30 0H' + (-a) + "M" + a + ' 0H30"/>'; };
    if (k === "R" || k === "LDR"){ b = lead(15) + '<rect class="bd" x="-15" y="-6" width="30" height="12"/>' + (k === "LDR" ? '<path d="M-10 -20l7 7M-2 -22l7 7" stroke-width="1.3"/><path class="ar" d="M-3 -13l-1 -5 -4 1z M5 -15l-1 -5 -4 1z"/>' : ""); }
    else if (k === "C") b = lead(3.5) + '<path d="M-3.5 -11V11M3.5 -11V11" stroke-width="2.4"/>' + (p.extra === "pol" ? '<path d="M-13 -11h6M-10 -14v6" stroke-width="1.3"/>' : "");
    else if (k === "LED" || k === "D"){ var z = typeof val === "string" && /^Z/.test(val); b = lead(9) + '<path class="bd" d="M-9 -9V9L9 0Z"' + (k === "LED" && /^#/.test(val) ? ' style="fill:' + val + ';fill-opacity:.6"' : "") + '/><path d="' + (z ? "M5 -12L9 -9V9L13 12" : "M9 -9V9") + '"/>' + (k === "LED" ? '<path d="M-1 -13l6 -7M5 -11l6 -7" stroke-width="1.3"/><path class="ar" d="M5 -20l-4.5 1.5 3 2.5z M11 -18l-4.5 1.5 3 2.5z"/>' : ""); }
    else if (k === "SW") b = lead(14) + '<circle class="bd" cx="-14" cy="0" r="2.6"/><circle class="bd" cx="14" cy="0" r="2.6"/><path d="M-17 -9H17M0 -9V-17M-6 -17H6"/>';
    else if (k === "XTAL") b = lead(10) + '<path d="M-10 -10V10M10 -10V10"/><rect class="bd" x="-5.5" y="-8" width="11" height="16"/>';
    else if (k === "SPK") b = lead(10) + '<path d="M-10 0V-6H-2V6H-10V0M-2 -6L9 -14V14L-2 6M9 0H10"/>';
    else if (k === "LAMP"){ var mo = /Motor/i.test(val), re = /Relais/i.test(val), sp = /Spule/i.test(val);
      if (re) b = lead(9) + '<rect class="bd" x="-9" y="-12" width="18" height="24"/><path d="M-9 12L9 -12"/>';
      else if (sp) b = lead(16) + '<path d="M-16 0a4 4 0 0 1 8 0a4 4 0 0 1 8 0a4 4 0 0 1 8 0a4 4 0 0 1 8 0"/>';
      else b = lead(12) + '<circle class="bd" cx="0" cy="0" r="12"/>' + (mo ? "" : '<path d="M-8.5 -8.5L8.5 8.5M-8.5 8.5L8.5 -8.5"/>'); }
    var tr = "translate(" + x + "," + y + ")" + (v ? " rotate(90)" : "") + (f < 0 ? " scale(-1,1)" : "");
    var s = '<g class="pt" data-part="' + p.id + '"><g transform="' + tr + '">' + b + "</g>";
    if (k === "LAMP" && /Motor/i.test(val)) s += '<text class="tm" x="' + x + '" y="' + (y + 5) + '" text-anchor="middle">M</text>';
    var t1 = v ? [x, y - 30 * f] : [x - 30 * f, y], t2 = v ? [x, y + 30 * f] : [x + 30 * f, y];
    term(p.id + ".1", t1[0], t1[1], v ? 0 : -f, v ? -f : 0); term(p.id + ".2", t2[0], t2[1], v ? 0 : f, v ? f : 0);
    if (v) box(x - 11, y - 15, x + 11, y + 15); else box(x - 15, y - 11, x + 15, y + 11);
    var showV = k === "LED" ? "" : k === "R" || k === "C" ? pv(p) : (val == null ? "" : String(val)), id = p.id;
    if (k === "LAMP" || k === "SPK" || k === "SW" || k === "XTAL" || k === "LDR"){ if (val) { showV = String(val); } }
    if (k === "LDR" && /^LDR$/i.test(String(val))) showV = "";
    var nol = o.indexOf("!") >= 0, eq = o.indexOf("=") >= 0, hi = o.indexOf("^") >= 0, up = (k === "C" && p.extra === "pol") ? 9 : 0;
    if (nol){}
    else if (eq){ var lx = v ? x + (side < 0 ? -14 : 14) : x, ly = v ? y + 4 : y - up - (k === "LED" ? 22 : k === "LAMP" || k === "C" || k === "SPK" ? 17 : 12), an2 = v ? (side < 0 ? "end" : "start") : "middle", str = id + (showV ? "  " + showV : "");
      s += tx(lx, ly, str, "sl", an2).replace(/>([^<]*)<\/text>$/, function(m0){ return ">" + e(id) + (showV ? '  <tspan class="sv">' + e(showV) + "</tspan>" : "") + "</text>"; }); }
    else if (!v){
      if (k === "LED") s += tx(x, y + 24, id, "sl", "middle");
      else if (hi){ s += tx(x, y - 30 - up, id, "sl", "middle") + tx(x, y - 16 - up, showV, "sv", "middle"); }
      else if (o.indexOf(">") >= 0){ s += tx(x + 36, y - 3, id, "sl", "start") + tx(x + 36, y + 11, showV, "sv", "start"); }
      else { s += tx(x, y - up - (k === "SW" ? 24 : k === "C" || k === "LAMP" || k === "SPK" ? 17 : 13), id, "sl", "middle"); s += tx(x, y + (k === "C" || k === "LAMP" || k === "SPK" ? 26 : k === "SW" ? 18 : 22), showV, "sv", "middle"); } }
    else { var lr = side ? side : 1, xx = x + lr * (k === "SPK" ? 25 : (k === "SW" || k === "LDR" || k === "LED") && lr > 0 ? 28 : k === "C" || k === "LAMP" ? 21 : 17), an = lr < 0 ? "end" : "start";
      s += tx(xx, showV ? y - 2 : y + 4, id, "sl", an); if (showV) s += tx(xx, y + 12, showV, "sv", an); }
    return s + "</g>";
  }
  /* --- Transistor-Symbole --- */
  function sym(p, x, y, o){
    var s0 = p.def.sym, f = o && o.indexOf("m") >= 0 ? -1 : 1, g = "", nm = p.names, T = {};
    if (s0 === "npn" || s0 === "pnp"){
      g = '<circle class="bd" cx="2" cy="0" r="24"/><path d="M-40 0H-10M-10 -14V14M-10 -7L10 -18V-40M-10 7L10 18V40"/>' + (s0 === "npn" ? '<path class="ar" d="M10 18l-9.5 -1 4 -6.5z"/>' : '<path class="ar" d="M-10 -7l9.5 -1 -4 6.5z"/>');
      T[s0 === "npn" ? "C" : "E"] = [10, -40, 0, -1]; T[s0 === "npn" ? "E" : "C"] = [10, 40, 0, 1]; T.B = [-40, 0, -1, 0]; }
    else if (s0 === "nmos" || s0 === "pmos"){
      g = '<circle class="bd" cx="2" cy="0" r="24"/><path d="M-40 0H-15M-15 -13V13M-9 -15V-7M-9 -4V4M-9 7V15M-9 -11H10V-40M-9 11H10V40M-9 0H10V11"/>' + (s0 === "nmos" ? '<path class="ar" d="M-8 0l8 -4v8z"/>' : '<path class="ar" d="M4 0l-8 -4v8z"/>');
      T[s0 === "nmos" ? "D" : "S"] = [10, -40, 0, -1]; T[s0 === "nmos" ? "S" : "D"] = [10, 40, 0, 1]; T.G = [-40, 0, -1, 0]; }
    else if (s0 === "triac"){
      g = '<path d="M0 -40V-12M0 12V40M-16 -12H16M-16 12H16M-8 12L-16 22H-40"/><path class="bd" d="M-14 -12L-2 12L10 -12Z"/><path class="bd" d="M-10 12L2 -12L14 12Z"/>';
      T.MT2 = [0, -40, 0, -1]; T.MT1 = [0, 40, 0, 1]; T.G = [-40, 22, -1, 0]; }
    var s = '<g class="pt" data-part="' + p.id + '"><g transform="translate(' + x + "," + y + ")" + (f < 0 ? " scale(-1,1)" : "") + '">' + g + "</g>";
    nm.forEach(function(n, i){ var t = T[n]; if (t) term(p.id + "." + (i + 1), x + f * t[0], y + t[1], f * t[2], t[3]); });
    box(x - 14 * f, y - 26, x + 26 * f, y + 26);
    var lx = x + f * 32, an = f < 0 ? "end" : "start";
    s += tx(lx, y - 2, p.id, "tt", an) + tx(lx, y + 13, shn(p.def.name), "tn", an);
    return s + "</g>";
  }
  /* --- IC-Kasten --- */
  function ic(p, x, y, o){
    var S = (o && o.s) || 40, sd = o || {}, n = p.n;
    if (!sd.L && !sd.R && !sd.T && !sd.B){ sd = { L: [], R: [] }; if (p.def.sip) for (var i = 1; i <= n; i++) sd.L.push(i); else { for (var j = 1; j <= n / 2; j++) sd.L.push(j); for (var k2 = n; k2 > n / 2; k2--) sd.R.push(k2); } for (var q in o) if (o.hasOwnProperty(q)) sd[q] = o[q]; }
    var LL = sd.L || [], RR = sd.R || [], TT = sd.T || [], BB = sd.B || [];
    var h = sd.h || Math.max(LL.length, RR.length, 1) * S + 24, needH = 38 + (TT.length ? 22 : 0) + (BB.length ? 22 : 0); if (h < needH) h = needH; var w = sd.w || Math.max(Math.max(TT.length, BB.length) * S + 24, 120);
    var s = '<g class="ic" data-part="' + p.id + '"><rect class="box" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5"/>';
    box(x, y, x + w, y + h);
    function side(list, kind){ var cnt = list.length, len = (kind === "L" || kind === "R") ? h : w, off = (len - cnt * S) / 2;
      list.forEach(function(pin, i){ if (pin == null) return; var nm = p.names[pin - 1] || "", c = off + S / 2 + i * S, px, py, dx = 0, dy = 0, ln;
        if (kind === "L"){ px = x - 22; py = y + c; dx = -1; ln = "M" + x + " " + py + "H" + px; s += tx(x + 6, py + 4, nm, "pnm", "start") + tx(x - 10, py - 5, pin, "pi", "middle"); }
        else if (kind === "R"){ px = x + w + 22; py = y + c; dx = 1; ln = "M" + (x + w) + " " + py + "H" + px; s += tx(x + w - 6, py + 4, nm, "pnm", "end") + tx(x + w + 10, py - 5, pin, "pi", "middle"); }
        else if (kind === "T"){ px = x + c; py = y - 22; dy = -1; ln = "M" + px + " " + y + "V" + py; s += tx(px, y + 15, nm, "pnm", "middle") + tx(px + 4, y - 9, pin, "pi", "start"); }
        else { px = x + c; py = y + h + 22; dy = 1; ln = "M" + px + " " + (y + h) + "V" + py; s += tx(px, y + h - 7, nm, "pnm", "middle") + tx(px + 4, y + h + 15, pin, "pi", "start"); }
        s += '<path d="' + ln + '"/>'; term(p.id + "." + pin, px, py, dx, dy); }); }
    side(LL, "L"); side(RR, "R"); side(TT, "T"); side(BB, "B");
    var cx = x + w / 2, cy = y + h / 2, nmx = shn(p.def.name);
    var ty = sd.ty != null ? y + sd.ty : cy;
    s += tx(cx, ty - 6, p.id, "tt", "middle") + tx(cx, ty + 9, nmx, "tn", "middle");
    return s + "</g>";
  }
  function src(p, x, y, o){ // Anschlussklemme (offener Kreis) mit Beschriftung
    o = o || "r"; var dx = o === "r" ? 1 : o === "l" ? -1 : 0, dy = o === "d" ? 1 : o === "u" ? -1 : 0, s = '<g class="tp">';
    term(p.id + ".1", x, y, dx, dy); var lb = String(p.val || p.id);
    if (o === "r") s += tx(x - 9, y + 4, lb, "sl", "end"); else if (o === "l") s += tx(x + 9, y + 4, lb, "sl", "start"); else if (o === "d") s += tx(x, y - 10, lb, "sl", "middle"); else s += tx(x, y + 19, lb, "sl", "middle");
    return s + '<circle class="src" cx="' + x + '" cy="' + y + '" r="4.5"/></g>';
  }
  /* Bauteile platzieren */
  var partsSvg = "", srcSvg = "";
  function place(id){ var p = A.parts[id], a = L[id];
    if (typeof a[0] === "string"){ var t = TP[a[0]]; if (!t) return false; var dx = a[3] || 0, dy = a[4] || 0, ax = t.x + dx, ay = t.y + dy;
      if (p.kind === "G"){ if (a.length < 4){ ax = t.x + t.dx * 34; ay = t.y + t.dy * 34; } srcSvg += src(p, ax, ay, a[2]); return true; }
      var o = a[2] || "h", v = o.charAt(0) === "v", f = o.indexOf("-") >= 0 ? -1 : 1, sg = a[1] === 2 ? -1 : 1, ox = v ? 0 : -30 * f * sg, oy = v ? -30 * f * sg : 0;
      partsSvg += two(p, ax - ox, ay - oy, o); return true; }
    if (p.kind === "ic"){ if (p.def.sym) partsSvg += sym(p, a[0], a[1], a[2]); else partsSvg += ic(p, a[0], a[1], a[2]); }
    else if (p.kind === "G") srcSvg += src(p, a[0], a[1], a[2]);
    else if (twoK[p.kind]) partsSvg += two(p, a[0], a[1], a[2]);
    return true; }
  var todo = A.order.filter(function(id){ if (!L[id]){ miss.push(id); return false; } return true; });
  todo.sort(function(a, b){ return (A.parts[a].kind === "ic" ? 0 : 1) - (A.parts[b].kind === "ic" ? 0 : 1); });
  for (var guard = 0; guard < 12 && todo.length; guard++) todo = todo.filter(function(id){ return !place(id); });
  todo.forEach(function(id){ miss.push(id + "@"); });
  if (L.txt) L.txt.forEach(function(t){ partsSvg += tx(t[0], t[1], t[2], t[3] || "sl", t[4] || "start"); });
  /* Verdrahtung */
  function inBox(x1, y1, x2, y2){ var hits = 0; BX.forEach(function(b){ var ax = Math.min(x1, x2), bx2 = Math.max(x1, x2), ay = Math.min(y1, y2), by2 = Math.max(y1, y2); if (bx2 > b[0] + 1 && ax < b[2] - 1 && by2 > b[1] + 1 && ay < b[3] - 1) hits++; }); return hits; }
  function overl(x1, y1, x2, y2, net){ var c = 0; SEG.forEach(function(sg){ if (sg[4] === net) return; if (y1 === y2 && sg[1] === sg[3] && sg[1] === y1){ if (Math.min(Math.max(x1, x2), Math.max(sg[0], sg[2])) - Math.max(Math.min(x1, x2), Math.min(sg[0], sg[2])) > 0.5) c++; } else if (x1 === x2 && sg[0] === sg[2] && sg[0] === x1){ if (Math.min(Math.max(y1, y2), Math.max(sg[1], sg[3])) - Math.max(Math.min(y1, y2), Math.min(sg[1], sg[3])) > 0.5) c++; } }); return c; }
  function onTerm(x1, y1, x2, y2, net){ var c = 0; Object.keys(TP).forEach(function(r){ var t = TP[r]; if (A.by[r] && A.by[r].id === net) return; if (x1 === x2 && t.x === x1 && t.y > Math.min(y1, y2) && t.y < Math.max(y1, y2)) c++; if (y1 === y2 && t.y === y1 && t.x > Math.min(x1, x2) && t.x < Math.max(x1, x2)) c++; }); return c; }
  function segCost(x1, y1, x2, y2, net){ if (x1 === x2 && y1 === y2) return 0; return Math.abs(x1 - x2) + Math.abs(y1 - y2) + 900 * inBox(x1, y1, x2, y2) + 600 * overl(x1, y1, x2, y2, net) + 700 * onTerm(x1, y1, x2, y2, net); }
  function dirPen(t, x2, y2){ if (!t) return 0; var vx = x2 - t.x, vy = y2 - t.y; if (!vx && !vy) return 0; if (t.dx && (vx * t.dx < 0 || (vx === 0))) return t.dx * vx < 0 ? 250 : 120; if (t.dy && (vy * t.dy < 0 || (vy === 0))) return t.dy * vy < 0 ? 250 : 120; return 0; }
  var wiresByNet = {}, railSvg = "";
  function addSeg(x1, y1, x2, y2, net){ if (x1 === x2 && y1 === y2) return; SEG.push([x1, y1, x2, y2, net]); (wiresByNet[net] = wiresByNet[net] || []).push([x1, y1, x2, y2]); ext(x1, y1); ext(x2, y2); }
  function rail(t, kind){ var x = t.x, y = t.y, s = "", g;
    if (kind === "gnd"){ if (t.dy === 1){ s = "M" + x + " " + y + "V" + (y + 12); g = [x, y + 12]; } else if (t.dx){ s = "M" + x + " " + y + "H" + (x + 12 * t.dx) + "V" + (y + 10); g = [x + 12 * t.dx, y + 10]; } else { s = "M" + x + " " + y + "V" + (y - 10) + "H" + (x + 14) + "V" + (y + 2); g = [x + 14, y + 2]; }
      s += "M" + (g[0] - 9) + " " + g[1] + "H" + (g[0] + 9) + "M" + (g[0] - 6) + " " + (g[1] + 4) + "H" + (g[0] + 6) + "M" + (g[0] - 3) + " " + (g[1] + 8) + "H" + (g[0] + 3); ext(g[0] - 9, g[1] + 9); }
    else { if (t.dy === -1){ s = "M" + x + " " + y + "V" + (y - 12); g = [x, y - 12]; } else if (t.dx){ s = "M" + x + " " + y + "H" + (x + 12 * t.dx) + "V" + (y - 10); g = [x + 12 * t.dx, y - 10]; } else { s = "M" + x + " " + y + "V" + (y + 10) + "H" + (x + 14) + "V" + (y - 2); g = [x + 14, y - 2]; }
      s += "M" + (g[0] - 8) + " " + g[1] + "H" + (g[0] + 8); railSvg += tx(g[0], g[1] - 5, "+V", "sl", "middle"); ext(g[0] - 9, g[1] - 16); }
    return '<path d="' + s + '"/>'; }
  var manual = L.w || {}, rsym = L.sym || [];
  A.nets.forEach(function(net){
    var mem = net.members.filter(function(r){ return TP[r]; });
    if (!net.anon && net.members.length !== mem.length) net.members.forEach(function(r){ if (!TP[r] && L[r.split(".")[0]]) miss.push(r); });
    if (manual[net.name]){ manual[net.name].forEach(function(pl){ for (var i = 1; i < pl.length; i++) addSeg(pl[i - 1][0], pl[i - 1][1], pl[i][0], pl[i][1], net.id); }); return; }
    var railW = false;
    if (net.rail && mem.length === 2 && L.wirerail){ var ta = TP[mem[0]], tb = TP[mem[1]], bc = 1e9;
      [[ta.x, tb.y], [tb.x, ta.y]].forEach(function(k){ var c0 = segCost(tb.x, tb.y, k[0], k[1], net.id) + segCost(k[0], k[1], ta.x, ta.y, net.id) + dirPen(tb, k[0] === tb.x && k[1] === tb.y ? ta.x : k[0], k[0] === tb.x && k[1] === tb.y ? ta.y : k[1]) + dirPen(ta, k[0] === ta.x && k[1] === ta.y ? tb.x : k[0], k[0] === ta.x && k[1] === ta.y ? tb.y : k[1]); if (c0 < bc) bc = c0; });
      railW = bc < 520 && Math.abs(ta.x - tb.x) + Math.abs(ta.y - tb.y) < 330; }
    if (net.rail && !railW){ var rs = ""; mem.forEach(function(r){ rs += rail(TP[r], net.rail); }); if (rs) (wiresByNet[net.id] = wiresByNet[net.id] || []).rs = rs, railSvg += '<g class="pn" data-net="' + net.id + '">' + rs + "</g>"; return; }
    if (mem.length < 2) return;
    var tree = [mem[0]], pts = [TP[mem[0]]], rest = mem.slice(1), mySeg = [];
    while (rest.length){
      var best = null;
      rest.forEach(function(r){ var t = TP[r];
        var cands = pts.map(function(q){ return { x: q.x, y: q.y, t: q.ref ? q : null }; });
        mySeg.forEach(function(sg){ var cx = sg[0] === sg[2] ? sg[0] : Math.max(Math.min(t.x, Math.max(sg[0], sg[2])), Math.min(sg[0], sg[2])), cy = sg[1] === sg[3] ? sg[1] : Math.max(Math.min(t.y, Math.max(sg[1], sg[3])), Math.min(sg[1], sg[3])); cands.push({ x: cx, y: cy, t: null }); });
        cands.forEach(function(c){ [[c.x, t.y], [t.x, c.y]].forEach(function(k){ var cost = segCost(t.x, t.y, k[0], k[1], net.id) + segCost(k[0], k[1], c.x, c.y, net.id) + dirPen(t, (k[0] === t.x && k[1] === t.y) ? c.x : k[0], (k[0] === t.x && k[1] === t.y) ? c.y : k[1]) + (c.t ? dirPen(c.t, (k[0] === c.x && k[1] === c.y) ? t.x : k[0], (k[0] === c.x && k[1] === c.y) ? t.y : k[1]) : 0);
          if (!best || cost < best.cost) best = { cost: cost, r: r, k: k, c: c }; }); }); });
      var t2 = TP[best.r]; [[t2.x, t2.y, best.k[0], best.k[1]], [best.k[0], best.k[1], best.c.x, best.c.y]].forEach(function(sg){ if (sg[0] !== sg[2] || sg[1] !== sg[3]){ addSeg(sg[0], sg[1], sg[2], sg[3], net.id); mySeg.push(sg); } });
      pts.push(t2); rest.splice(rest.indexOf(best.r), 1);
    }
    if (railW && mySeg.length){ var lg = mySeg.slice().sort(function(a, b){ return (Math.abs(b[0] - b[2]) + Math.abs(b[1] - b[3])) - (Math.abs(a[0] - a[2]) + Math.abs(a[1] - a[3])); })[0], hz = lg[1] === lg[3], rx = hz ? Math.round((lg[0] + lg[2]) / 2 / 10) * 10 : lg[0], ry = hz ? lg[1] : Math.round((lg[1] + lg[3]) / 2 / 10) * 10;
      var rp = rail(hz ? { x: rx, y: ry, dx: 0, dy: net.rail === "gnd" ? 1 : -1 } : { x: rx, y: ry, dx: 1, dy: 0 }, net.rail);
      railSvg += '<g class="pn rw" data-net="' + net.id + '">' + rp + '<circle class="dot" cx="' + rx + '" cy="' + ry + '" r="3.2"/></g>'; }
  });
  rsym.forEach(function(r){ railSvg += rail({ x: r[1], y: r[2], dx: r[3] || 0, dy: r[4] == null ? (r[0] === "gnd" ? 1 : -1) : r[4] }, r[0]); });
  /* Verbindungspunkte */
  var wireSvg = "";
  Object.keys(wiresByNet).forEach(function(nid){ var sg = wiresByNet[nid], d = "", cnt = {}, net = A.nets.filter(function(n){ return String(n.id) === String(nid); })[0];
    sg.forEach(function(a){ d += "M" + a[0] + " " + a[1] + "L" + a[2] + " " + a[3]; });
    function key(x, y){ return x + "," + y; }
    var cand = {}; sg.forEach(function(a){ cand[key(a[0], a[1])] = [a[0], a[1]]; cand[key(a[2], a[3])] = [a[2], a[3]]; });
    var dots = "";
    Object.keys(cand).forEach(function(k){ var x = cand[k][0], y = cand[k][1], n = 0;
      sg.forEach(function(a){ if ((a[0] === x && a[1] === y) || (a[2] === x && a[3] === y)) n++; else if ((a[0] === a[2] && a[0] === x && y > Math.min(a[1], a[3]) && y < Math.max(a[1], a[3])) || (a[1] === a[3] && a[1] === y && x > Math.min(a[0], a[2]) && x < Math.max(a[0], a[2]))) n += 2; });
      if (net) net.members.forEach(function(r){ if (TP[r] && TP[r].x === x && TP[r].y === y) n++; });
      if (n >= 3) dots += '<circle class="dot" cx="' + x + '" cy="' + y + '" r="3.2"/>'; });
    wireSvg += '<g class="pn" data-net="' + nid + '">' + (d ? '<path d="' + d + '"/>' : "") + dots + "</g>"; });
  if (miss.length && window.console) console.warn("schem2 fehlt:", miss.join(" "));
  var m = 18, X0 = bb[0] - m, Y0 = bb[1] - m, Wd = bb[2] - bb[0] + 2 * m, Hd = bb[3] - bb[1] + 2 * m;
  return '<svg class="ic-sch s2" viewBox="' + X0 + " " + Y0 + " " + Wd + " " + Hd + '" data-miss="' + e(miss.join(" ")) + '" role="img" aria-label="' + T("Schaltplan", "Schéma") + '" style="min-width:' + Math.min(Wd, 560) + "px;max-width:" + Math.round(Wd * 1.3) + 'px;margin:0 auto">' + wireSvg + railSvg + partsSvg + srcSvg + "</svg>";
}

/*LAYOUTS*/
/* Kette aus Zweipolen ab einem Anschluss in eine Richtung (r, l, d, u) */
function chainL(A, o, ref, dir, fl){ var cur = ref, n = 0;
  while (n++ < 6){ var net = A.by[cur]; if (!net || net.rail) return o; var oth = net.members.filter(function(m){ return m !== cur; }); if (oth.length !== 1) return o;
    var a = oth[0].split("."), p = A.parts[a[0]]; if (!p || o[a[0]] || p.kind === "ic" || p.kind === "G") return o; var t = +a[1];
    var ori = (dir === "r" || dir === "l") ? "h" : "v", rev = (dir === "l" || dir === "u") ? t === 1 : t === 2;
    o[a[0]] = [cur, t, ori + (rev ? "-" : "") + (p.kind === "LED" && fl ? "!" : (fl || ""))]; cur = a[0] + "." + (t === 1 ? 2 : 1); }
  return o; }
function chains(A, o, ic, pins, dir, fl){ pins.forEach(function(p){ chainL(A, o, ic + "." + p, dir, fl); }); return o; }
LAY.ne555a = { U1: [300, 120, { L: [7, 6, 2], R: [3], T: [8, 4], B: [1, 5], w: 140 }], R1: [220, 122, "v"], R2: [220, 182, "v"], C1: [220, 282, "v"], C2: [390, 316, "v"], R3: [492, 192], D1: [522, 222, "v"] };
LAY.ne555m = { U1: [300, 120, { L: [2, 7, 6], R: [3], T: [8, 4], B: [1, 5] }], R1: ["U1.7", 2, "h", -40, 0], C1: ["U1.6", 1, "v", -40, 0], R2: ["U1.2", 2, "v<", -168, 0], SW1: ["U1.2", 1, "v<", -168, 0], C2: ["U1.5", 1, "v"], R3: ["U1.3", 1, "h"], D1: ["R3.2", 1, "v"] };
LAY.hc14 = { U1: [300, 140, { L: [1], R: [2], T: [14], B: [7, 3, 5, 9, 11, 13] }], C2: [640, 80, "v"], R1: [430, 60, "h-"], C1: ["U1.1", 1, "v", -40, 0], R2: ["U1.2", 1, "h", 40, 0], D1: ["R2.2", 1, "v"] };
LAY.hc00 = { U1: [300, 120, { L: [1, null, null, 2], R: [3], T: [14], B: [7, 4, 5, 9, 10, 12, 13] }], SW1: ["U1.1", 2, "h", -58, 0], R1: ["U1.1", 1, "v", -58, 0], SW2: ["U1.2", 2, "h", -58, 0], R2: ["U1.2", 1, "v", -58, 0], R3: ["U1.3", 1, "h"], D1: ["R3.2", 1, "v"] };
LAY.hc74 = { U1: [300, 120, { L: [3], R: [5, 6, 2], T: [14, 4, 1, 10, 13], B: [7, 9, 8, 12, 11] }], G1: ["U1.3", 1, "r"], R1: ["U1.5", 1, "h", 40, 0], D1: ["R1.2", 1, "v"], R2: ["U1.9", 1, "v<"], D2: ["R2.2", 1, "v"],
  w: { Q1: [[[546, 152], [586, 152]], [[566, 152], [566, 316], [492, 316], [492, 286]]], RUECK1: [[[546, 192], [546, 232]]], RUECK2: [[[412, 286], [452, 286]]] } };
LAY.cd4060 = { U1: [300, 120, { T: [16], R: [3], B: [9, 11, 10, 12, 8], s: 60 }], R1: ["U1.9", 2, "h-", 0, 30], X1: ["U1.11", 1, "h>", 0, 70], C1: ["X1.1", 1, "v<", 0, 20], C2: ["X1.2", 1, "v", 0, 20], R2: ["U1.3", 1, "h"], D1: ["R2.2", 1, "v"] };
LAY.lm358 = function(P){ var d = P.s === "d12", inv = P.m === "inv", o = { U1: [300, 140, { L: [2, null, 3], R: [1], T: [8], B: [4] }], R2: [360, 56, "h-"], P1: ["U1.1", 1, "l", 70, 0] };
  if (inv){ o.R1 = ["U1.2", 2, "h", -40, 0]; o.G1 = ["R1.1", 1, "r"]; if (!d) o.GB = ["U1.3", 1, "r", -60, 0]; }
  else { o.R1 = ["U1.2", 1, "h-", -40, 0]; o.G1 = ["U1.3", 1, "r", -100, 0]; if (!d) o.GB = ["R1.2", 1, "r"]; }
  if (d) o.GN = ["U1.4", 1, "u"]; return o; };
/* --- Operationsverstärker: Netzliste und Schaltplan je Beschaltung --- */
var OPK = { analog_lm358: "lm358", analog_tl072: "tl072", analog_ne5532: "ne5532", analog_mcp6002: "mcp6002", analog_lm741: "lm741", analog_tl071: "tl071", analog_tl074: "tl074", analog_lm324: "lm324" };
function opIC(){ var k = (location.hash.split("/")[2] || ""); return OPK[k] || "lm358"; }
function opPins(id){ if (id === "lm741" || id === "tl071") return { o: 6, m: 2, p: 3, vp: 7, vn: 4 }; if (id === "lm324" || id === "tl074") return { o: 1, m: 2, p: 3, vp: 4, vn: 11 }; return { o: 1, m: 2, p: 3, vp: 8, vn: 4 }; }
NL.opamp = function(P){
  var id = opIC(), pn = opPins(id), U = function(n){ return "U1." + n; }, t = P.m, parts = { U1: id, P1: ["G", "Uout"], GN: ["G", "−" + fmt(P.Vs, "V")] }, nets = { VCC: [U(pn.vp)], VNEG: ["GN.1", U(pn.vn)] }, M = U(pn.m), Pl = U(pn.p), O = U(pn.o);
  function R(i, v){ parts["R" + i] = ["R", v]; }
  if (t === "inv"){ parts.G1 = ["G", "Uin"]; R(1, "$Ra"); R(2, "$Rb"); nets.EIN = ["G1.1", "R1.1"]; nets.MINUS = ["R1.2", M, "R2.2"]; nets.GND = [Pl]; nets.OUT = [O, "R2.1", "P1.1"]; }
  else if (t === "nin"){ parts.G1 = ["G", "Uin"]; R(1, "$Ra"); R(2, "$Rb"); nets.EIN = ["G1.1", Pl]; nets.MINUS = [M, "R1.1", "R2.2"]; nets.GND = ["R1.2"]; nets.OUT = [O, "R2.1", "P1.1"]; }
  else if (t === "fol"){ parts.G1 = ["G", "Uin"]; nets.EIN = ["G1.1", Pl]; nets.OUT = [O, M, "P1.1"]; }
  else if (t === "sum"){ parts.G1 = ["G", "U1"]; parts.G2 = ["G", "U2 " + fmt(P.Ua, "V")]; parts.G3 = ["G", "U3 " + fmt(P.Ub, "V")]; R(1, "$Ra"); R(2, "$Rb"); R(3, "$Rc"); R(4, "$Rd");
    nets.E1 = ["G1.1", "R1.1"]; nets.E2 = ["G2.1", "R2.1"]; nets.E3 = ["G3.1", "R3.1"]; nets.MINUS = ["R1.2", "R2.2", "R3.2", M, "R4.2"]; nets.GND = [Pl]; nets.OUT = [O, "R4.1", "P1.1"]; }
  else if (t === "sub"){ parts.G1 = ["G", "U1"]; parts.G2 = ["G", "U2 " + fmt(P.Ua, "V")]; R(1, "$Ra"); R(2, "$Rb"); R(3, "$Ra"); R(4, "$Rb");
    nets.E1 = ["G1.1", "R1.1"]; nets.E2 = ["G2.1", "R3.1"]; nets.MINUS = ["R1.2", M, "R2.2"]; nets.PLUS = ["R3.2", Pl, "R4.1"]; nets.GND = ["R4.2"]; nets.OUT = [O, "R2.1", "P1.1"]; }
  else if (t === "int"){ parts.G1 = ["G", "Uin"]; R(1, "$Ra"); parts.C1 = ["C", "$Cx"]; nets.EIN = ["G1.1", "R1.1"]; nets.MINUS = ["R1.2", M, "C1.2"]; nets.GND = [Pl]; nets.OUT = [O, "C1.1", "P1.1"]; }
  else if (t === "dif"){ parts.G1 = ["G", "Uin"]; R(1, "$Ra"); parts.C1 = ["C", "$Cx"]; nets.EIN = ["G1.1", "C1.1"]; nets.MINUS = ["C1.2", M, "R1.2"]; nets.GND = [Pl]; nets.OUT = [O, "R1.1", "P1.1"]; }
  else if (t === "lp"){ parts.G1 = ["G", "Uin"]; R(1, "$Ra"); R(2, "$Rb"); parts.C1 = ["C", "$Cx"]; nets.EIN = ["G1.1", "R1.1"]; nets.MINUS = ["R1.2", M, "R2.2", "C1.2"]; nets.GND = [Pl]; nets.OUT = [O, "R2.1", "C1.1", "P1.1"]; }
  else if (t === "cmp"){ parts.G1 = ["G", "Uin"]; parts.G2 = ["G", "Uref " + fmt(P.Ur, "V")]; nets.EIN = ["G1.1", Pl]; nets.REF = ["G2.1", M]; nets.OUT = [O, "P1.1"]; }
  else if (t === "sch"){ parts.G1 = ["G", "Uin"]; parts.G2 = ["G", "Uref " + fmt(P.Ur, "V")]; R(1, "$Ra"); R(2, "$Rb"); nets.EIN = ["G1.1", "R1.1"]; nets.PLUS = ["R1.2", Pl, "R2.2"]; nets.REF = ["G2.1", M]; nets.OUT = [O, "R2.1", "P1.1"]; }
  else if (t === "tia"){ parts.G1 = ["G", "Iin"]; R(1, "$Rb"); nets.MINUS = ["G1.1", M, "R1.2"]; nets.GND = [Pl]; nets.OUT = [O, "R1.1", "P1.1"]; }
  return nmk(parts, nets);
};
LAY.opamp = function(P){
  var pn = opPins(opIC()), U = function(n){ return "U1." + n; }, t = P.m, M = U(pn.m), Pl = U(pn.p), O = U(pn.o), sw = t === "sch" || t === "cmp",
    o = { U1: [300, 160, { L: sw ? [pn.p, null, pn.m] : [pn.m, null, pn.p], R: [pn.o], T: [pn.vp], B: [pn.vn] }], P1: [O, 1, "l", 80, 0], GN: [U(pn.vn), 1, "u"] };
  if (t === "inv"){ o.R2 = [360, 70, "h-"]; o.R1 = [M, 2, "h", -40, 0]; o.G1 = ["R1.1", 1, "r"]; }
  else if (t === "nin"){ o.R2 = [360, 70, "h-"]; o.R1 = [M, 1, "h-", -40, 0]; o.G1 = [Pl, 1, "r", -100, 0]; }
  else if (t === "fol"){ o.G1 = [Pl, 1, "r", -100, 0]; o.w = { OUT: [[[522, 232], [442, 232], [442, 96], [250, 96], [250, 192], [278, 192]]] }; }
  else if (t === "sum"){ o.R4 = [360, 30, "h-"]; o.R3 = [M, 2, "h", -40, 0]; o.R2 = [M, 2, "h", -40, -50]; o.R1 = [M, 2, "h", -40, -100]; o.G1 = ["R1.1", 1, "r"]; o.G2 = ["R2.1", 1, "r"]; o.G3 = ["R3.1", 1, "r"]; }
  else if (t === "sub"){ o.R2 = [360, 70, "h-"]; o.R1 = [M, 2, "h", -40, 0]; o.G1 = ["R1.1", 1, "r"]; o.R3 = [Pl, 2, "h", -40, 0]; o.G2 = ["R3.1", 1, "r"]; o.R4 = [Pl, 1, "v", -40, 0]; }
  else if (t === "int" || t === "dif" || t === "lp"){ var fb = t === "int" ? "C1" : t === "dif" ? "R1" : "R2"; o[fb] = [360, t === "lp" ? 80 : 70, "h-"]; if (t === "lp") o.C1 = [360, 6, "h-"];
    var inp = t === "dif" ? "C1" : "R1"; if (t === "dif") o.C1 = [M, 2, "h", -40, 0]; else o.R1 = [M, 2, "h", -40, 0]; o.G1 = [inp + ".1", 1, "r"]; }
  else if (t === "cmp"){ o.G1 = [Pl, 1, "r", -100, 0]; o.G2 = [M, 1, "r", -100, 0]; }
  else if (t === "sch"){ o.R2 = [360, 70, "h-"]; o.R1 = [Pl, 2, "h", -40, 0]; o.G1 = ["R1.1", 1, "r"]; o.G2 = [M, 1, "r", -100, 0]; }
  else if (t === "tia"){ o.R1 = [360, 70, "h-"]; o.G1 = [M, 1, "r", -80, 0]; }
  if (t === "inv" || t === "int" || t === "lp" || t === "dif" || t === "sum" || t === "tia" || t === "nin"){}
  return o;
};
LAY.lm393 = { U1: [300, 140, { L: [2, null, 3], R: [1], T: [8], B: [4] }], R2: ["U1.2", 2, "v", -40, 0], R3: ["U1.2", 1, "h-", -40, 0], R1: ["U1.3", 2, "h", -40, 0], G1: ["R1.1", 1, "r"], Rh: [360, 370, "h"],
  Rp: ["U1.1", 2, "v<", 40, 0], D1: ["U1.1", 2, "v<", 110, 0], R4: ["D1.1", 2, "v"] };
LAY.lm317 = { U1: [300, 120, { L: [3], R: [2], B: [1], h: 80 }], G1: ["U1.3", 1, "r", -120, 0], C1: ["U1.3", 1, "v", -60, 0], D1: [360, 70, "h-"], R1: ["U1.2", 1, "v", 60, 0], R2: ["R1.2", 1, "v"], C2: ["U1.2", 1, "v", 150, 0], P1: ["U1.2", 1, "l", 215, 0] };
LAY.cd4093 = { U1: [300, 140, { L: [1], R: [3], T: [2, null, null, 14], B: [7, 5, 6, 8, 9, 12, 13] }], R1: [480, 60, "h-"], C1: ["U1.2", 1, "h-", 0, -20], SW1: ["U1.1", 2, "h", -100, 0], Rp: ["U1.1", 1, "v", -40, 0], R2: ["U1.3", 1, "h", 40, 0], D1: ["R2.2", 1, "v"] };
LAY.hc165 = { U1: [300, 120, { L: [1, 2, 11], R: [9], T: [16], B: [8, 15, 10] }], G1: ["U1.1", 1, "r"], G2: ["U1.2", 1, "r"], SW1: ["U1.11", 2, "h", -58, 0], R1: ["U1.11", 1, "v", -58, 0], P1: ["U1.9", 1, "l"] };
LAY.lm7805 = { U1: [300, 120, { L: [1], R: [3], B: [2], h: 80 }], G1: ["U1.1", 1, "r", -110, 0], C1: ["U1.1", 1, "v", -50, 0], C2: ["U1.3", 1, "v", 50, 0], P1: ["U1.3", 1, "l", 110, 0] };
LAY.lm1117 = { U1: [300, 120, { L: [3], R: [2], B: [1], h: 80, w: 160 }], G1: ["U1.3", 1, "r", -110, 0], C1: ["U1.3", 1, "v", -50, 0], C2: ["U1.2", 1, "v", 50, 0], P1: ["U1.2", 1, "l", 110, 0] };
LAY.lm337 = { U1: [300, 120, { L: [2], R: [3], B: [1], h: 80 }], G1: ["U1.2", 1, "r", -120, 0], C1: ["U1.2", 2, "v-", -60, 0], R1: ["U1.3", 1, "v", 60, 0], R2: ["R1.2", 1, "v"], C2: ["U1.3", 2, "v-", 150, 0], P1: ["U1.3", 1, "l", 215, 0] };
LAY.lm386 = { U1: [300, 140, { L: [3, 2], R: [5], T: [6], B: [4] }], G1: ["U1.3", 1, "r", -70, 0], C2: ["U1.5", 1, "v", 40, 0], R1: ["C2.2", 1, "v"], C1: ["U1.5", 1, "h^", 90, 0], SP1: ["C1.2", 1, "v"] };
LAY.npn = { Q1: [320, 200], Rb: ["Q1.2", 2, "h", -30, 0], G1: ["Rb.1", 1, "r"], LP1: ["Q1.1", 2, "v<", 0, -20], D1: ["Q1.1", 1, "v-", 60, -20] };
LAY.pnp = { Q1: [330, 200], Rp: ["Q1.2", 2, "v", -50, 0], Rb: ["Rp.2", 2, "h"], G1: ["Rb.1", 1, "r"], LP1: ["Q1.1", 1, "v", 0, 20] };
LAY.pmos = { M1: [420, 160], G2: ["M1.3", 1, "d", 0, -40], R2: ["M1.1", 2, "v<", -30, 0], Q1: [340, 240], R1: ["Q1.2", 2, "h", -20, 0], G1: ["R1.1", 1, "r"], LP1: ["M1.2", 1, "v"] };
LAY.irlz44n = { Q1: [370, 200], R2: ["Q1.1", 1, "v", -60, 0], R1: ["R2.1", 2, "h"], G1: ["R1.1", 1, "r"], LP1: ["Q1.2", 2, "v<"] };
LAY.triac = { U1: [300, 160, { L: [1, 2], R: [6, 4] }], R1: ["U1.1", 2, "h", -30, 0], G1: ["R1.1", 1, "r"], Q1: [580, 210], R2: ["U1.6", 2, "h-"], LP1: ["Q1.2", 2, "v", 0, -20], G2: ["LP1.1", 1, "d", 0, -30], G3: ["Q1.1", 1, "u", 0, 30] };
LAY.zdiode = { R1: [200, 150, "h"], G1: ["R1.1", 1, "r"], D1: ["R1.2", 2, "v-", 40, 0], P1: ["R1.2", 1, "l", 100, 0] };
LAY.led = { R1: [200, 150, "h"], G1: ["R1.1", 1, "r"], D1: ["R1.2", 1, "v", 30, 0] };
LAY.gleich = { D1: [200, 170, "v-"], D3: [200, 230, "v-"], D2: [300, 170, "v-"], D4: [300, 230, "v-"], G1: [140, 200, "r"], G2: [360, 200, "l"], C1: [470, 170, "v"], P1: [540, 140, "l"] };
LAY.pc817 = { U1: [300, 140, { L: [1, 2], R: [4, 3] }], R1: ["U1.1", 2, "h", -30, 0], G1: ["R1.1", 1, "r"], Rp: ["U1.4", 2, "v", 40, 0], P1: ["U1.4", 1, "l", 110, 0] };
LAY.lm324 = { U1: [300, 120, { L: [2, 3, 6, 5], R: [1, null, 7], T: [4], B: [11] }], G2: ["U1.2", 1, "r", -110, 0], G1: ["U1.3", 1, "r", -110, 0], G3: ["U1.5", 1, "r", -110, 0], D1: ["U1.1", 1, "h", 20, 0], D2: ["U1.7", 1, "h", 20, 0], R1: [580, 242, "v"], R2: [650, 212, "h"], D3: ["R2.2", 1, "v"] };
LAY.cd4066 = { U1: [300, 120, { L: [1, 13], R: [2, null], T: [14], B: [7, 5, 6, 12] }], G1: ["U1.1", 1, "r"], G2: ["U1.13", 1, "r"], R1: ["U1.2", 1, "v", 40, 0], P1: ["U1.2", 1, "l", 100, 0] };
LAY.cd4013 = { U1: [300, 120, { L: [3], R: [1, 2, 5], T: [14], B: [7, 4, 6, 8, 9, 10, 11] }], SW1: ["U1.3", 2, "v<", -90, 0], R1: ["U1.3", 1, "v<", -90, 0], C1: ["U1.3", 1, "v", -40, 0], R2: ["U1.1", 1, "h", 40, 0], D1: ["R2.2", 1, "v"] };
LAY.max232 = { U1: [300, 120, { L: [1, 3, 4, 5, 11], R: [2, 6, null, null, 14], T: [16], B: [15], s: 60 }], C1: ["U1.1", 1, "v", -40, 0], C2: ["U1.4", 1, "v", -40, 0], C3: ["U1.2", 1, "v", 100, 0], C4: ["U1.6", 2, "v-", 40, 0], G1: ["U1.11", 1, "r"], P1: ["U1.14", 1, "l"] };
LAY.tl431 = { U1: [300, 200, { T: [3], B: [2], R: [1], h: 96 }], Rv: [300, 140, "h"], G1: ["Rv.1", 1, "r"], R1: [480, 218, "v"], R2: ["R1.2", 1, "v"], P1: [560, 140, "l"] };
LAY.icl7660 = { U1: [300, 120, { L: [2, 4], R: [5], T: [8], B: [3], s: 60, w: 150 }], C1: ["U1.2", 1, "v", -40, 0], C2: ["U1.5", 2, "v-", 40, 0], P1: ["U1.5", 1, "l", 100, 0] };
LAY.lm35 = { U1: [300, 120, { T: [1], B: [3], R: [2], h: 96, w: 130 }], C1: [220, 150, "v"], P1: ["U1.2", 1, "l"] };
LAY.tsop = { U1: [300, 140, { L: [3], B: [2], R: [1], h: 96, w: 160 }], R1: ["U1.3", 2, "v", -40, 0], C1: ["U1.3", 1, "v", -40, 0], P1: ["U1.1", 1, "l"] };
LAY.hc245 = { U1: [300, 120, { L: [1, null, null, 2], R: [null, null, null, 18], T: [20], B: [10, 19] }], SW1: ["U1.1", 2, "h", -58, 0], R1: ["U1.1", 1, "v", -58, 0], G1: ["U1.2", 1, "r"], R2: ["U1.18", 1, "h"], D1: ["R2.2", 1, "v"] };
LAY.hc573 = { U1: [300, 120, { L: [2, 11], R: [19, null], T: [20], B: [10, 1] }], G1: ["U1.2", 1, "r"], G2: ["U1.11", 1, "r"], R1: ["U1.19", 1, "h"], D1: ["R1.2", 1, "v"] };
LAY.cd4046 = { U1: [300, 120, { L: [9, 6, 7], R: [4], T: [16], B: [8, 5, 11], s: 60 }], G1: ["U1.9", 1, "r"], C1: ["U1.6", 1, "v", -40, 0], R1: ["U1.11", 1, "v"], P1: ["U1.4", 1, "l"] };
LAY.ad620 = { U1: [300, 120, { L: [2, 1, 8, 3], R: [6], T: [7], B: [4, 5], s: 60 }], G2: ["U1.2", 1, "r"], RG: ["U1.1", 1, "v<", -40, 0], G1: ["U1.3", 1, "r"], G3: ["U1.4", 1, "u"], P1: ["U1.6", 1, "l"] };
LAY.ds1307 = { U1: [300, 120, { L: [1, 2, 3], R: [5, 6, 7], T: [8], B: [4], s: 60 }], X1: ["U1.1", 1, "v<", -40, 0], B1: ["U1.3", 1, "r"], R1: ["U1.5", 2, "v", 30, 0], G1: ["U1.5", 1, "l", 70, 0], R2: ["U1.6", 2, "v", 130, 0], G2: ["U1.6", 1, "l", 170, 0], R3: ["U1.7", 2, "v", 230, 0], P1: ["U1.7", 1, "l", 270, 0] };
LAY.eeprom = { U1: [300, 120, { L: [1, 2, 3, 7], R: [null, 5, 6, null], T: [8], B: [4], s: 60 }], R1: ["U1.5", 2, "v", 30, 0], G1: ["U1.5", 1, "l", 70, 0], R2: ["U1.6", 2, "v", 130, 0], G2: ["U1.6", 1, "l", 170, 0] };
LAY.max485 = { U1: [300, 120, { L: [1, 2, 3, 4], R: [null, 6, 7, null], T: [8], B: [5], s: 60 }], P1: ["U1.1", 1, "r"], G2: ["U1.2", 1, "r", -60, 0], G1: ["U1.4", 1, "r"], R1: ["U1.6", 1, "v", 40, 0], G3: ["U1.6", 1, "l", 110, 0], G4: ["U1.7", 1, "l", 110, 0] };
LAY.a4988 = { U1: [300, 120, { L: [7, 8, 5, 6], R: [16, 15, 12, 11, 13, 14], T: [10, 2, 3, 4], B: [9, 1], s: 60 }], G1: ["U1.7", 1, "r"], G2: ["U1.8", 1, "r"], C1: ["U1.16", 1, "v", 100, 0], G3: ["U1.16", 1, "l", 170, 0], M1: ["U1.12", 1, "v", 40, 0], M2: ["U1.13", 1, "v", 40, 0] };
LAY.tl072 = { U1: [300, 140, { L: [2, null, 3], R: [1], T: [8], B: [4] }], Ck: ["U1.3", 2, "h", -60, 0], G1: ["Ck.1", 1, "r"], Rin: ["U1.3", 1, "v", -40, 0], R1: ["U1.2", 1, "h-", -40, 0], R2: [360, 56, "h-"], P1: ["U1.1", 1, "l", 70, 0], G2: ["U1.4", 1, "u"] };
LAY.ne556 = { U1: [300, 120, { L: [1, 2, 6], R: [13, 12, 8], T: [14, 4], B: [7, 5, 10, 9] }], R1: [220, 122, "v"], R2: [220, 182, "v"], C1: [220, 282, "v"], R3: [588, 122, "v"], R4: [588, 182, "v"], C2: [588, 282, "v"], C3: ["U1.9", 1, "v"], SP1: ["C3.2", 1, "v"] };
LAY.lm339 = function(P, A){ var o = { U1: [300, 120, { L: [11, 9, 7, 5], R: [2, 1, 14, 13], T: [3], B: [10, 8, 6, 4, 12], s: 60 }], Ra: ["U1.11", 2, "v", -60, 0], Rb: ["U1.11", 1, "v", -60, 0], Rc: ["U1.9", 1, "v", -60, 0], Rd: ["U1.7", 1, "v", -60, 0], Re: ["U1.5", 1, "v", -60, 0], G1: ["U1.10", 1, "u", 0, 40] };
  return chains(A, o, "U1", [2, 1, 14, 13], "r", "="); };
LAY.cd4511 = function(P, A){ var o = { U1: [300, 120, { L: [7, 1, 2, 6, 3, 4, 5], R: [13, 12, 11, 10, 9, 15, 14], T: [16], B: [8] }], S1: [640, 120, { L: [7, 6, 4, 2, 1, 9, 10], B: [3, 8] }], G1: ["U1.7", 1, "r"], G2: ["U1.1", 1, "r"], G3: ["U1.2", 1, "r"], G4: ["U1.6", 1, "r"] };
  return chains(A, o, "U1", [13, 12, 11, 10, 9, 15, 14], "r", "="); };
function rowsL(A, ic, side, pins, extra){ return function(P, A2){ var o = { U1: [300, 120, side] }; for (var k in extra) o[k] = extra[k]; return chains(A2, o, "U1", pins, "r", "="); }; }
LAY.cd4017 = rowsL(null, "U1", { L: [14, 13, 15, 8], R: [3, 2, 4, 7, 10, 1, 5, 6, 9, 11], T: [16] }, [3, 2, 4, 7, 10, 1, 5, 6, 9, 11], { G1: ["U1.14", 1, "r"] });
LAY.hc160 = rowsL(null, "U1", { L: [2], R: [14, 13, 12, 11], T: [16, 1, 7, 9, 10], B: [8, 3, 4, 5, 6] }, [14, 13, 12, 11], { G1: ["U1.2", 1, "r"] });
LAY.hc595 = rowsL(null, "U1", { L: [14, 11, 12, 10, 13, 8], R: [15, 1, 2, 3, 4, 5, 6, 7], T: [16] }, [15, 1, 2, 3, 4, 5, 6, 7], { G1: ["U1.14", 1, "r"], G2: ["U1.11", 1, "r"], G3: ["U1.12", 1, "r"] });
LAY.hc138 = rowsL(null, "U1", { L: [1, 2, 3, 6, 4, 5, 8], R: [15, 14, 13, 12, 11, 10, 9, 7], T: [16] }, [15, 14, 13, 12, 11, 10, 9, 7], { G1: ["U1.1", 1, "r"], G2: ["U1.2", 1, "r"], G3: ["U1.3", 1, "r"] });
LAY.cd4040 = rowsL(null, "U1", { L: [10, 11, 8], R: [9, 7, 6, 5, 3, 2, 4, 13], T: [16], w: 160 }, [9, 7, 6, 5, 3, 2, 4, 13], { G1: ["U1.10", 1, "r"] });
LAY.cd4020 = rowsL(null, "U1", { L: [10, 11, 8], R: [9, 7, 5, 4, 6, 13, 12, 14], T: [16], w: 160 }, [9, 7, 5, 4, 6, 13, 12, 14], { G1: ["U1.10", 1, "r"] });
LAY.hc193 = rowsL(null, "U1", { L: [5], R: [3, 2, 6, 7], T: [16, 11, 4], B: [8, 14] }, [3, 2, 6, 7], { G1: ["U1.5", 1, "r"] });
LAY.hc164 = rowsL(null, "U1", { L: [1, 8], R: [3, 4, 5, 6, 10, 11, 12, 13], T: [14, 9, 2], B: [7] }, [3, 4, 5, 6, 10, 11, 12, 13], { G1: ["U1.1", 1, "r"], G2: ["U1.8", 1, "r"] });
LAY.cd4094 = rowsL(null, "U1", { L: [2, 3, 1], R: [4, 5, 6, 7, 14, 13, 12, 11], T: [16, 15], B: [8] }, [4, 5, 6, 7, 14, 13, 12, 11], { G1: ["U1.2", 1, "r"], G2: ["U1.3", 1, "r"], G3: ["U1.1", 1, "r"] });
LAY.adder = rowsL(null, "U1", { L: [5, 3, 14, 12, 6, 2, 15, 11], R: [4, 1, 13, 10, 9], T: [16], B: [8, 7] }, [4, 1, 13, 10, 9], { G1: ["U1.5", 1, "r"], G2: ["U1.3", 1, "r"], G3: ["U1.14", 1, "r"], G4: ["U1.12", 1, "r"], G5: ["U1.6", 1, "r"], G6: ["U1.2", 1, "r"], G7: ["U1.15", 1, "r"], G8: ["U1.11", 1, "r"] });
LAY.uln2003 = { U1: [300, 120, { L: [1], R: [16], T: [9], B: [8] }], G1: ["U1.1", 1, "r"], LP1: ["U1.16", 2, "v", 40, 0] };
LAY.mcp3008 = { U1: [300, 120, { L: [1], R: [13, 12, 11, 10], T: [16, 15], B: [9, 14] }], G1: ["U1.1", 1, "r"], G3: ["U1.13", 1, "l"], P1: ["U1.12", 1, "l"], G4: ["U1.11", 1, "l"], G2: ["U1.10", 1, "l"] };
LAY.cd4051 = { U1: [300, 120, { L: [11, 10, 9, 13], R: [null, null, null, 3], T: [16], B: [8, 7, 6] }], G1: ["U1.11", 1, "r"], G2: ["U1.10", 1, "r"], G3: ["U1.9", 1, "r"], G4: ["U1.13", 1, "r"], P1: ["U1.3", 1, "l"] };
LAY.l293d = { U1: [300, 120, { L: [1, 2, 7], R: [3, 6, null], T: [16, 8], B: [4, 5, 12, 13], s: 60 }], G1: ["U1.1", 1, "r"], G2: ["U1.2", 1, "r"], G3: ["U1.7", 1, "r"], G4: ["U1.8", 1, "d"], LP1: ["U1.3", 1, "v", 40, 0], C1: ["U1.3", 1, "v", 110, 0] };
LAY.dac0808 = { U1: [300, 120, { L: [12, 11, 10, 9, 5, 6, 7, 8], R: [14, 15, 16, null, 4], T: [13], B: [2, 3], w: 160 }], R1: ["U1.14", 2, "h-="], G1: ["R1.1", 1, "l"], R2: ["U1.15", 1, "h="], C1: ["U1.16", 1, "h="],
  U2: [620, 340, { L: [2, 3], R: [1], T: [8], B: [4] }], R3: [680, 250, "h"], P1: ["U2.1", 1, "l", 60, 0], G2: ["U1.3", 1, "u"], G4: ["U1.9", 1, "r"], G5: ["U1.10", 1, "r"], G6: ["U1.11", 1, "r"], G7: ["U1.12", 1, "r"],
  w: { VNEG: [[[542, 292], [560, 292], [560, 500]], [[400, 486], [400, 520]], [[400, 500], [680, 500]], [[680, 466], [680, 500]]] } };
var L555 = { L: [7, 6, 2], R: [3], T: [8, 4], B: [1, 5], w: 140 };
LAY.k_lauf = function(P, A){ return chains(A, { U1: [300, 120, L555], R1: [220, 122, "v"], R2: [220, 182, "v"], C1: [220, 282, "v"], C2: [390, 316, "v"], U2: [560, 40, { L: [14, 13, 15, 8], R: [3, 2, 4, 7, 10, 1, 5, 6, 9, 11], T: [16] }] }, "U2", [3, 2, 4, 7, 10, 1, 5, 6, 9, 11], "r", "="); };
LAY.k_uhr = { U1: [300, 120, { T: [16], R: [3], B: [9, 11, 10, 12, 8], s: 60 }], R1: ["U1.9", 2, "h-", 0, 30], X1: ["U1.11", 1, "h>", 0, 70], C1: ["X1.1", 1, "v<", 0, 20], C2: ["X1.2", 1, "v", 0, 20],
  U2: [720, 90, { L: [3], R: [5, 6, 2], T: [14, 4, 1], B: [7] }], R2: ["U2.5", 1, "h", 40, 0], D1: ["R2.2", 1, "v"] };
LAY.k_zaehl = function(P, A){ return chains(A, { U1: [300, 120, L555], R1: [220, 122, "v"], R2: [220, 182, "v"], C1: [220, 282, "v"], C2: [390, 316, "v"],
  U2: [540, 100, { L: [2], R: [14, 13, 12, 11], T: [16, 1, 7, 9, 10], B: [8, 3, 4, 5, 6] }], U3: [880, 100, { L: [7, 1, 2, 6, 3, 4, 5], R: [13, 12, 11, 10, 9, 15, 14], T: [16], B: [8] }], S1: [1180, 100, { L: [7, 6, 4, 2, 1, 9, 10], B: [3, 8] }] }, "U3", [13, 12, 11, 10, 9, 15, 14], "r", "="); };
LAY.k_daemm = { U1: [300, 140, { L: [2, null, 3], R: [1], T: [8], B: [4] }], LDR1: ["U1.2", 2, "v<", -40, 0], R1: ["U1.2", 1, "h-", -40, 0], R3: ["U1.3", 1, "v", -60, 0], R2: ["U1.3", 2, "h", -60, 0], Rh: [360, 370, "h"],
  Rp: ["U1.1", 2, "v", 40, 0], Rb: ["U1.1", 1, "h", 100, 0], Q1: [642, 212], LP1: ["Q1.1", 2, "v<", 0, -20] };
LAY.k_prell = function(P, A){ return chains(A, { U1: [300, 140, { L: [1], R: [2], T: [14], B: [7, 3, 5, 9, 11, 13] }], U2: [680, 80, { L: [2], R: [14, 13, 12, 11], T: [16, 1, 7, 9, 10], B: [8, 3, 4, 5, 6] }],
  C1: ["U1.1", 1, "v", -40, 0], R1: ["U1.1", 2, "h", -80, 0], Rp: ["R1.1", 2, "v<", -30, 0], SW1: ["R1.1", 1, "v<", -30, 0] }, "U2", [14, 13, 12, 11], "r", "="); };
LAY.k_sirene = { U1: [300, 120, L555], R1: [220, 122, "v<"], R2: [220, 182, "v<"], C1: [220, 282, "v<"], C2: [390, 316, "v"], R5: [520, 400, "h"],
  U2: [700, 120, L555], R3: [620, 122, "v"], R4: [620, 182, "v"], C3: [620, 282, "v"], C4: ["U2.3", 1, "h^", 20, 0], SP1: ["C4.2", 1, "v"],
  w: { LFO: [[[220, 212], [220, 252]], [[220, 232], [278, 232]], [[258, 232], [258, 192], [278, 192]], [[258, 232], [258, 400], [490, 400]]] } };
LAY.k_motor = { U1: [420, 120, L555], R1: ["U1.7", 2, "v<", -60, 0], D1: [110, 182, "v<"], Ra: [110, 242, "v<"], D2: [260, 182, "v-<"], Rb: [260, 242, "v<"], C1: [338, 302, "v"], C2: [510, 316, "v"],
  U2: [700, 150, { L: [1, 2, 7], R: [3, 6], T: [16, 8], B: [4, 5, 12, 13], s: 60 }], G1: ["U2.8", 1, "d"], LP1: ["U2.3", 1, "v", 40, 0],
  w: { KONDENSATOR: [[[110, 272], [358, 272], [358, 192], [398, 192]], [[358, 232], [398, 232]]] } };
LAY.k_relais = { U1: [300, 120, L555], R1: [220, 122, "v"], R2: [220, 182, "v"], C1: [220, 282, "v"], C2: [390, 316, "v"],
  U2: [560, 140, { L: [14, 13, 8, 15], R: [3, 2, 4, 7, 10], T: [16] }], U3: [800, 140, { L: [1, 2, 3, 4], R: [16, 15, 14, 13], T: [9], B: [8] }],
  LP1: ["U3.16", 2, "h-="], LP2: ["U3.15", 2, "h-="], LP3: ["U3.14", 2, "h-="], LP4: ["U3.13", 2, "h-="], G1: [1120, 90, "l"],
  w: { RESET: [[[538, 312], [518, 312], [518, 400], [722, 400], [722, 332], [702, 332]]], LAST12V: [[[1002, 172], [1080, 172]], [[1002, 212], [1080, 212]], [[1002, 252], [1080, 252]], [[1002, 292], [1080, 292]], [[1080, 292], [1080, 90], [860, 90], [860, 118]], [[1080, 90], [1120, 90]]] } };
LAY.k_ampel = { U1: [300, 120, L555], R1: [220, 122, "v"], R2: [220, 182, "v"], C1: [220, 282, "v"], C2: [390, 316, "v"],
  U2: [560, 20, { L: [14, 13, 15, 8], R: [3, 2, 4, 7, null, 6, null, 10, 1, 5, 9], T: [16] }],
  D1: ["U2.3", 1, "h=", 20, 0], D2: ["U2.2", 1, "h=", 20, 0], D3: ["U2.4", 1, "h=", 20, 0], D4: ["U2.7", 1, "h=", 20, 0], D5: ["U2.7", 1, "h=", 20, 40], D6: ["U2.6", 1, "h=", 20, 0], D7: ["U2.10", 1, "h=", 20, 0], D8: ["U2.1", 1, "h=", 20, 0], D9: ["U2.5", 1, "h=", 20, 0],
  Rr: ["D1.2", 1, "h=", 30, 0], LR: ["Rr.2", 1, "v"], Ry: ["D5.2", 1, "h=", 30, 0], LY: ["Ry.2", 1, "v"], Rg: ["D7.2", 1, "h=", 30, 0], LG: ["Rg.2", 1, "v"],
  w: { RESET: [[[702, 452], [722, 452], [722, 500], [500, 500], [500, 272], [538, 272]]] } };
LAY.k_thermo = { U2: [300, 140, { L: [2, null, 3], R: [1], T: [8], B: [4] }], U1: [120, 84, { T: [1], B: [3], R: [2], h: 96 }], Ra: ["U2.3", 2, "h", -100, 0], Rp: ["U2.3", 1, "v<", -40, 0], Rh: [360, 370, "h"],
  Ru: ["U2.1", 2, "v", 40, 0], Rb: ["U2.1", 1, "h", 100, 0], Q1: [642, 212], K1: ["Q1.1", 2, "v<", 0, -20], D1: ["Q1.1", 1, "v-", 60, -20] };
LAY.k_netz = { D1: [200, 170, "v-"], D3: [200, 230, "v-"], D2: [300, 170, "v-"], D4: [300, 230, "v-"], G1: [140, 200, "r"], G2: [360, 200, "l"], C1: [440, 170, "v"],
  U1: [520, 102, { L: [3], R: [2], B: [1], h: 76 }], R1: ["U1.2", 1, "v", 60, 0], R2: ["R1.2", 1, "v"], C2: ["U1.2", 1, "v", 150, 0], P1: ["U1.2", 1, "l", 215, 0] };
LAY.k_wuerfel = function(P, A){ return chains(A, { U1: [300, 120, { L: [7, 6, 2], R: [3], T: [8, 4], B: [1, 5], w: 140 }], R1: [220, 122, "v"], R2: [220, 182, "v"], C1: [220, 282, "v"], C2: [390, 316, "v"], SW1: ["U1.4", 2, "v"], R3: ["U1.4", 1, "h", 60, 0],
  U2: [560, 40, { L: [14, 13, 15, 8], R: [3, 2, 4, 7, 10, 1, 5], T: [16] }], w: { RESET: [[[702, 312], [722, 312], [722, 380], [510, 380], [510, 212], [538, 212]]] } }, "U2", [3, 2, 4, 7, 10, 1], "r", "="); };
LAY.k_alarm = { U1: [300, 140, { L: [3, null, 2], R: [1], T: [8], B: [4] }], LDR1: ["U1.3", 2, "v", -40, 0], R1: ["U1.3", 1, "h-", -40, 0], R2: ["U1.2", 2, "h", -100, 0], R3: ["U1.2", 1, "v<", -40, 0], R4: ["U1.1", 2, "v<", 40, 0],
  U2: [600, 100, { L: [7, 6], B: [2, 1, 5], R: [3], T: [8, 4], w: 160 }], R5: ["U2.7", 2, "v<", -40, 0], C1: ["U2.6", 1, "v", -40, 0], C2: ["U2.5", 1, "v"], SW1: ["U2.4", 2, "v"], R6: ["U2.4", 1, "h", 60, 0], SP1: ["U2.3", 1, "v", 40, 0], R7: ["U2.3", 1, "h", 110, 0], D1: ["R7.2", 1, "v"] };
LAY.k_wechsel = { Q1: [300, 320], Q2: [620, 320, "m"], D1: ["Q1.1", 2, "v<", 0, -30], R1: ["D1.1", 2, "v<"], D2: ["Q2.1", 2, "v", 0, -30], R4: ["D2.1", 2, "v"], R3: [400, 170, "v"], R2: [520, 170, "v"], C1: [460, 244, "h="], C2: [460, 316, "h-="] };
LAY.k_verz = { Q1: [420, 300], D1: ["Q1.1", 2, "v<", 0, -30], R2: ["D1.1", 2, "v<"], R1: [250, 190, "v"], C1: [250, 330, "v"] };
LAY.k_touch = { Q2: [520, 360], Q1: [340, 300], D1: ["Q2.1", 2, "v<", 0, -90], R2: ["D1.1", 2, "v<"], R1: [200, 280, "h"], SW1: [120, 180, "v"] };
LAY.k_strom = { Q1: [440, 280], Q2: [300, 340, "m"], D1: ["Q1.1", 2, "v<", 0, -30], R1: [200, 200, "v"], Rs: [440, 420, "v"] };
LAY.k_zreg = { G1: [100, 140, "r"], R1: [220, 140, "h"], D1: [360, 240, "v-<"], R2: [480, 240, "v"], P1: [560, 140, "l"] };
LAY.k_bistabil = { U1: [360, 140, { L: [6, 7, 2], R: [3], T: [8, 4], B: [1, 5], w: 140 }], R1: ["U1.2", 2, "v", -60, 0], SW1: ["U1.2", 1, "v", -60, 0], R2: ["U1.4", 2, "v", 0, 0], SW2: ["U1.4", 1, "h", 50, 0], C2: ["U1.5", 1, "v", 0, 0], R3: ["U1.3", 1, "h", 40, 0], D1: ["R3.2", 1, "h", 0, 0] };
LAY.k_schmitt = { U1: [360, 140, { L: [2, 7, 6], R: [3], T: [8, 4], B: [1, 5], w: 140 }], G1: [120, 212, "r"], C2: ["U1.5", 1, "v", 0, 0], R3: ["U1.3", 1, "h", 40, 0], D1: ["R3.2", 1, "h", 0, 0] };
/*END LAYOUTS*/
function wireHL(root){ var svgs = root.querySelectorAll("svg"); function clr(){ root.querySelectorAll(".hl").forEach(function(e){ e.classList.remove("hl"); }); } root.addEventListener("mouseover", function(ev){ var t = ev.target.closest ? ev.target.closest("[data-net]") : null; clr(); if (t){ var id = t.getAttribute("data-net"); root.querySelectorAll('[data-net="' + id + '"]').forEach(function(e){ e.classList.add("hl"); }); } }); root.addEventListener("mouseleave", clr); }

function netText(A){ var h = '<table class="ic-nt"><tr><th>' + T("Netz", "Réseau") + "</th><th>" + T("verbindet", "relie") + "</th></tr>"; A.nets.filter(function(n){ return n.members.length > 1; }).forEach(function(n){ h += "<tr><th>" + esc(n.name) + "</th><td>" + n.members.map(function(m){ var a = m.split("."), p = A.parts[a[0]]; return esc(a[0] + (p.names ? " " + a[1] + " (" + p.names[a[1] - 1] + ")" : p.kind === "G" ? "" : " ." + a[1])); }).join(" · ") + "</td></tr>"; }); return h + "</table>"; }

/* ---------- IC-Katalog ---------- */
var CATS = [["timer", T("Timer & Oszillator", "Timer & oscillateur"), "#ffb000"], ["logic", T("Logik-Gatter", "Portes logiques"), "#3de6ff"], ["count", T("Zähler, Teiler & Register", "Compteurs & registres"), "#6dffb0"], ["dec", T("Dekoder & Anzeige", "Décodeurs & affichage"), "#b6ff3d"], ["analog", T("Analog & Spannung", "Analogique & tension"), "#ff3d9a"], ["drive", T("Schalten & Treiben", "Commuter & piloter"), "#b58cff"]];
var ICS = [
  { id: "ne555", name: "NE555", pkg: "DIP-8", cat: "timer", k: ["Der Timer-Klassiker: Blinker, Impulse, Zeitrelais, Sirenen", "Le timer classique"], pins: ["GND:g", "TRIG:i", "OUT:o", "RESET:i", "CTRL:i", "THR:i", "DISCH:o", "VCC:v"], facts: [["Versorgung", "Alimentation", "4,5…16 V (NE555), 2…15 V (CMOS-Typen)"], ["Ausgangsstrom", "Courant de sortie", "bis ca. 200 mA (ziehen und liefern)"], ["Innen", "Intérieur", "2 Komparatoren, Flip-Flop, Entladetransistor, Spannungsteiler 3 × 5 kΩ (daher der Name)"], ["Verwandt", "Voisins", "NE556 = 2 × 555, TLC555/LMC555 = CMOS"]], proj: ["ne555a", "ne555m"] },
  { id: "hc14", name: "74HC14", pkg: "DIP-14", cat: "timer", k: ["6 × Inverter mit Schmitt-Trigger-Eingang", "6 inverseurs à trigger de Schmitt"], pins: ["1A:i", "1Y:o", "2A:i", "2Y:o", "3A:i", "3Y:o", "GND:g", "4Y:o", "4A:i", "5Y:o", "5A:i", "6Y:o", "6A:i", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…6 V"], ["Besonderheit", "Particularité", "zwei Schwellen (Hysterese) – aus langsamen oder verrauschten Signalen werden saubere Flanken"], ["Typische Jobs", "Usages", "Taster entprellen, RC-Oszillator, Signale aufbereiten"]], proj: ["hc14"] },
  { id: "cd4060", name: "CD4060", pkg: "DIP-16", cat: "count", k: ["14-stufiger Teiler mit Oszillator – Quarzuhr-Baustein", "Diviseur à 14 étages avec oscillateur"], pins: ["Q12:o", "Q13:o", "Q14:o", "Q6:o", "Q5:o", "Q7:o", "Q4:o", "VSS:g", "/Φ0:o", "Φ0:o", "Φ1:i", "RESET:i", "Q9:o", "Q8:o", "Q10:o", "VDD:v"], facts: [["Versorgung", "Alimentation", "3…15 V (CMOS)"], ["Teilerstufen", "Étages", "÷16 (Q4) bis ÷16384 (Q14)"], ["Quarzuhr", "Horloge à quartz", "32,768 kHz ÷ 2¹⁴ = 2 Hz"]], proj: ["cd4060"] },
  { id: "hc00", name: "74HC00 / 02 / 04 / 08 / 32 / 86", pkg: "DIP-14", cat: "logic", k: ["Die Grund-Gatter: NAND, NOR, NOT, AND, OR, XOR", "Les portes de base"], pins: ["1A:i", "1B:i", "1Y:o", "2A:i", "2B:i", "2Y:o", "GND:g", "3Y:o", "3A:i", "3B:i", "4Y:o", "4A:i", "4B:i", "VCC:v"], facts: [["Familien", "Familles", "74LS (5 V, TTL), 74HC (2…6 V, CMOS), 74HCT (CMOS mit TTL-Pegeln)"], ["Pinbelegung", "Brochage", "7400, 7408, 7432, 7486 gleich (hier gezeigt); 7402 (NOR) und 7404 (NOT) weichen ab"], ["Regel", "Règle", "Unbenutzte Eingänge nie offen lassen"]], proj: ["hc00"] },
  { id: "hc74", name: "74HC74", pkg: "DIP-14", cat: "count", k: ["2 × D-Flip-Flop mit Set und Reset", "2 bascules D"], pins: ["1/CLR:i", "1D:i", "1CLK:i", "1/PR:i", "1Q:o", "1/Q:o", "GND:g", "2/Q:o", "2Q:o", "2/PR:i", "2CLK:i", "2D:i", "2/CLR:i", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…6 V"], ["Flanke", "Front", "übernimmt D bei der STEIGENDEN Taktflanke"], ["Typische Jobs", "Usages", "Frequenz halbieren (÷2), Speicher für 1 Bit, Toggle-Schalter"]], proj: ["hc74"] },
  { id: "cd4017", name: "CD4017", pkg: "DIP-16", cat: "count", k: ["Dekadenzähler mit 10 Ausgängen – Lauflicht", "Compteur décimal à 10 sorties"], pins: ["Q5:o", "Q1:o", "Q0:o", "Q2:o", "Q6:o", "Q7:o", "Q3:o", "VSS:g", "Q8:o", "Q4:o", "Q9:o", "CO:o", "CE:i", "CLK:i", "RESET:i", "VDD:v"], facts: [["Versorgung", "Alimentation", "3…15 V"], ["Ausgänge", "Sorties", "immer genau EIN Ausgang HIGH (1-aus-10-Code)"], ["Kaskadieren", "Cascade", "CO (Pin 12) → CLK des nächsten"]], proj: ["cd4017"] },
  { id: "hc160", name: "74HC160", pkg: "DIP-16", cat: "count", k: ["Synchroner Dekadenzähler (BCD) 0…9", "Compteur décimal synchrone"], pins: ["/MR:i", "CLK:i", "P0:i", "P1:i", "P2:i", "P3:i", "CEP:i", "GND:g", "/PE:i", "CET:i", "Q3:o", "Q2:o", "Q1:o", "Q0:o", "TC:o", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…6 V"], ["Varianten", "Variantes", "160 = dezimal, 161 = binär (0…15), 162/163 synchron löschbar"], ["Laden", "Chargement", "/PE = LOW übernimmt P0…P3 beim nächsten Takt"]], proj: ["hc160"] },
  { id: "hc595", name: "74HC595", pkg: "DIP-16", cat: "count", k: ["8-Bit-Schieberegister mit Ausgangsspeicher", "Registre à décalage 8 bits"], pins: ["QB:o", "QC:o", "QD:o", "QE:o", "QF:o", "QG:o", "QH:o", "GND:g", "QH':o", "/SRCLR:i", "SRCLK:i", "RCLK:i", "/OE:i", "SER:i", "QA:o", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…6 V"], ["Idee", "Idée", "3 Mikrocontroller-Pins → beliebig viele Ausgänge (kaskadierbar)"], ["Strom", "Courant", "ca. 6 mA je Ausgang, max. 70 mA gesamt"]], proj: ["hc595"] },
  { id: "hc138", name: "74HC138", pkg: "DIP-16", cat: "dec", k: ["3-zu-8-Dekoder / Demultiplexer", "Décodeur 3 vers 8"], pins: ["A0:i", "A1:i", "A2:i", "/E1:i", "/E2:i", "E3:i", "/Y7:o", "GND:g", "/Y6:o", "/Y5:o", "/Y4:o", "/Y3:o", "/Y2:o", "/Y1:o", "/Y0:o", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…6 V"], ["Ausgänge", "Sorties", "active-low: der gewählte geht auf LOW"], ["Typische Jobs", "Usages", "Adressdekodierung, Chip-Select, Multiplexing"]], proj: ["hc138"] },
  { id: "cd4511", name: "CD4511", pkg: "DIP-16", cat: "dec", k: ["BCD → 7-Segment-Dekoder (gemeinsame Kathode)", "Décodeur BCD → 7 segments"], pins: ["B:i", "C:i", "/LT:i", "/BI:i", "LE:i", "D:i", "A:i", "VSS:g", "e:o", "d:o", "c:o", "b:o", "a:o", "g:o", "f:o", "VDD:v"], facts: [["Versorgung", "Alimentation", "3…18 V"], ["Ausgangsstrom", "Courant", "bis ca. 25 mA je Segment (Vorwiderstand nötig)"], ["Gegenstück", "Équivalent", "7447 für Anzeigen mit gemeinsamer Anode"]], proj: ["cd4511"] },
  { id: "lm358", name: "LM358", pkg: "DIP-8", cat: "analog", k: ["Doppel-Operationsverstärker für einfache Versorgung", "Double amplificateur opérationnel"], pins: ["OUT1:o", "IN1−:i", "IN1+:i", "V−/GND:g", "IN2+:i", "IN2−:i", "OUT2:o", "V+:v"], facts: [["Versorgung", "Alimentation", "3…32 V, einfach oder ±1,5…±16 V"], ["Bandbreite", "Bande passante", "ca. 1 MHz (GBW), Slew-Rate 0,3 V/µs"], ["Ausgang", "Sortie", "bis nahe GND, nach oben +V − 1,5 V"]], proj: ["lm358"] },
  { id: "lm393", name: "LM393", pkg: "DIP-8", cat: "analog", k: ["Doppel-Komparator mit offenem Kollektor", "Double comparateur à collecteur ouvert"], pins: ["OUT1:o", "IN1−:i", "IN1+:i", "GND:g", "IN2+:i", "IN2−:i", "OUT2:o", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…36 V"], ["Ausgang", "Sortie", "open collector – Pull-up nötig"], ["Typische Jobs", "Usages", "Schwellenschalter, Dämmerung, Nulldurchgang, Spannungswächter"]], proj: ["lm393"] },
  { id: "lm317", name: "LM317", pkg: "TO-220", cat: "analog", k: ["Einstellbarer Spannungsregler 1,25…37 V, 1,5 A", "Régulateur réglable 1,25…37 V, 1,5 A"], pins: ["ADJ:i", "OUT:o", "IN:v"], facts: [["Referenz", "Référence", "1,25 V zwischen OUT und ADJ"], ["Reserve", "Marge", "Vin ≥ Vout + ca. 3 V"], ["Strom", "Courant", "bis 1,5 A, mit Kühlkörper"]], proj: ["lm317"] },
  { id: "cd4093", name: "CD4093", pkg: "DIP-14", cat: "timer", k: ["4 × NAND mit Schmitt-Trigger – Oszillator mit Freigabe", "4 NAND à trigger de Schmitt"], pins: ["1A:i", "1B:i", "1Y:o", "2Y:o", "2A:i", "2B:i", "VSS:g", "3A:i", "3B:i", "3Y:o", "4Y:o", "4A:i", "4B:i", "VDD:v"], facts: [["Versorgung", "Alimentation", "3…15 V (CMOS)"], ["Besonderheit", "Particularité", "jeder Eingang hat Hysterese – ideal für R-C-Oszillatoren und Entprellen"], ["Typische Jobs", "Usages", "Tor-Oszillator, Tongeber, Einschaltverzögerung"]], proj: ["cd4093"] },
  { id: "cd4040", name: "CD4040", pkg: "DIP-16", cat: "count", k: ["12-stufiger Binärzähler", "Compteur binaire 12 étages"], pins: ["Q12:o", "Q6:o", "Q5:o", "Q7:o", "Q4:o", "Q3:o", "Q2:o", "VSS:g", "Q1:o", "CLK:i", "RESET:i", "Q9:o", "Q8:o", "Q10:o", "Q11:o", "VDD:v"], facts: [["Versorgung", "Alimentation", "3…15 V (CMOS)"], ["Teiler", "Division", "÷2 (Q1) bis ÷4096 (Q12)"], ["Flanke", "Front", "zählt bei der FALLENDEN Flanke"]], proj: ["cd4040"] },
  { id: "hc165", name: "74HC165", pkg: "DIP-16", cat: "count", k: ["8-Bit-Schieberegister: parallel rein, seriell raus", "Registre 8 bits : entrée parallèle, sortie série"], pins: ["SH/LD:i", "CLK:i", "E:i", "F:i", "G:i", "H:i", "/QH:o", "GND:g", "QH:o", "SER:i", "A:i", "B:i", "C:i", "D:i", "CLK INH:i", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…6 V"], ["Idee", "Idée", "viele Taster mit 3 Mikrocontroller-Pins lesen (kaskadierbar)"], ["Gegenstück", "Pendant", "74HC595 für Ausgänge"]], proj: ["hc165"] },
  { id: "lm7805", name: "LM7805", pkg: "TO-220", cat: "analog", k: ["Festspannungsregler 5 V, 1 A", "Régulateur fixe 5 V, 1 A"], pins: ["IN:v", "GND:g", "OUT:o"], facts: [["Eingang", "Entrée", "7…35 V (mindestens 2 V über dem Ausgang)"], ["Strom", "Courant", "bis 1 A, mit Kühlkörper"], ["Familie", "Famille", "7809, 7812, 7815 für andere Spannungen; 79xx für negative"]], proj: ["lm7805"] },
  { id: "lm386", name: "LM386", pkg: "DIP-8", cat: "analog", k: ["Kleiner Audio-Verstärker bis ca. 0,5 W", "Petit ampli audio jusqu’à 0,5 W"], pins: ["GAIN:i", "IN−:i", "IN+:i", "GND:g", "OUT:o", "VS:v", "BYPASS:i", "GAIN:i"], facts: [["Versorgung", "Alimentation", "4…12 V"], ["Verstärkung", "Gain", "20-fach, mit 10 µF an Pin 1/8 bis 200-fach"], ["Ausgang", "Sortie", "liegt in Ruhe auf halber Versorgung"]], proj: ["lm386"] },
  { id: "bc337", name: "BC337", pkg: "TO-92", cat: "drive", k: ["NPN-Transistor als Schalter bis 800 mA", "Transistor NPN en commutation jusqu’à 800 mA"], pins: ["C:o", "B:i", "E:g"], facts: [["Grenzwerte", "Limites", "45 V, 800 mA, 625 mW"], ["Stromverstärkung", "Gain en courant", "100…600, als Schalter mit 10…20 rechnen"], ["Ähnlich", "Similaires", "BC547 (100 mA), 2N2222 (600 mA)"]], proj: ["npn"] },
  { id: "uln2003", name: "ULN2003A", pkg: "DIP-16", cat: "drive", k: ["7 × Darlington-Treiber mit Freilaufdioden", "7 drivers Darlington avec diodes"], pins: ["1B:i", "2B:i", "3B:i", "4B:i", "5B:i", "6B:i", "7B:i", "GND:g", "COM:v", "7C:o", "6C:o", "5C:o", "4C:o", "3C:o", "2C:o", "1C:o"], facts: [["Last", "Charge", "bis 50 V, 500 mA je Kanal"], ["Eingang", "Entrée", "direkt an 3,3-V- oder 5-V-Logik"], ["Typische Jobs", "Usages", "Relais, Lampen, Schrittmotor 28BYJ-48"]], proj: ["uln2003"] },
  { id: "l293d", name: "L293D", pkg: "DIP-16", cat: "drive", k: ["Doppelte H-Brücke für zwei Motoren", "Double pont en H pour deux moteurs"], pins: ["EN1,2:i", "1A:i", "1Y:o", "GND:g", "GND:g", "2Y:o", "2A:i", "VCC2:v", "EN3,4:i", "3A:i", "3Y:o", "GND:g", "GND:g", "4Y:o", "4A:i", "VCC1:v"], facts: [["Motor-Versorgung", "Alimentation moteur", "4,5…36 V an Pin 8"], ["Strom", "Courant", "600 mA je Kanal, Spitze 1,2 A"], ["Verlust", "Pertes", "etwa 2,6 V bleiben im IC"]], proj: ["l293d"] },
  { id: "pc817", name: "PC817", pkg: "DIP-4", cat: "drive", k: ["Optokoppler: trennt zwei Stromkreise", "Optocoupleur : sépare deux circuits"], pins: ["Anode:i", "Kathode:g", "Emitter:g", "Kollektor:o"], facts: [["Isolation", "Isolation", "5000 V zwischen Ein- und Ausgang"], ["LED", "LED", "ca. 1,2 V, 5…20 mA"], ["CTR", "CTR", "50…600 % (Ausgangsstrom / LED-Strom)"]], proj: ["pc817"] },
  { id: "lm324", name: "LM324", pkg: "DIP-14", cat: "analog", k: ["4 × Operationsverstärker für einfache Versorgung", "4 amplis op à alimentation simple"], pins: ["OUT1:o", "IN1−:i", "IN1+:i", "V+:v", "IN2+:i", "IN2−:i", "OUT2:o", "OUT3:o", "IN3−:i", "IN3+:i", "GND:g", "IN4+:i", "IN4−:i", "OUT4:o"], facts: [["Versorgung", "Alimentation", "3…32 V"], ["Verwandt", "Parent", "LM358 = dieselben Verstärker, nur zwei davon"], ["Ausgang", "Sortie", "bis nahe GND, nach oben +V − 1,5 V"]], proj: ["lm324"] },
  { id: "cd4051", name: "CD4051", pkg: "DIP-16", cat: "logic", k: ["Analog-Umschalter 1 aus 8", "Multiplexeur analogique 1 parmi 8"], pins: ["Y4:i", "Y6:i", "COM:o", "Y7:i", "Y5:i", "INH:i", "VEE:g", "VSS:g", "C:i", "B:i", "A:i", "Y3:i", "Y0:i", "Y1:i", "Y2:i", "VDD:v"], facts: [["Versorgung", "Alimentation", "3…15 V"], ["Richtung", "Sens", "arbeitet in beide Richtungen"], ["Verwandt", "Parents", "CD4052 (2 × 1 aus 4), CD4053 (3 × Umschalter)"]], proj: ["cd4051"] },
  { id: "cd4066", name: "CD4066", pkg: "DIP-14", cat: "logic", k: ["4 × elektronischer Schalter", "4 interrupteurs électroniques"], pins: ["1A:i", "1B:o", "2B:o", "2A:i", "2C:i", "3C:i", "VSS:g", "3A:i", "3B:o", "4B:o", "4A:i", "4C:i", "1C:i", "VDD:v"], facts: [["Versorgung", "Alimentation", "3…15 V"], ["Widerstand", "Résistance", "eingeschaltet etwa 100…300 Ω"], ["Typische Jobs", "Usages", "Audio umschalten, Abtasten, Verstärkung umschalten"]], proj: ["cd4066"] },
  { id: "hc193", name: "74HC193", pkg: "DIP-16", cat: "count", k: ["4-Bit-Zähler vorwärts und rückwärts", "Compteur-décompteur 4 bits"], pins: ["P1:i", "Q1:o", "Q0:o", "CPD:i", "CPU:i", "Q2:o", "Q3:o", "GND:g", "P3:i", "P2:i", "/PL:i", "/TCU:o", "/TCD:o", "MR:i", "P0:i", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…6 V"], ["Zählbereich", "Plage", "0…15, ladbar über P0…P3"], ["Kaskadieren", "Cascade", "/TCU und /TCD an die Takte der nächsten Stufe"]], proj: ["hc193"] },
  { id: "cd4013", name: "CD4013", pkg: "DIP-14", cat: "count", k: ["2 × D-Flip-Flop (CMOS)", "2 bascules D (CMOS)"], pins: ["Q1:o", "/Q1:o", "CLK1:i", "RESET1:i", "D1:i", "SET1:i", "VSS:g", "SET2:i", "D2:i", "RESET2:i", "CLK2:i", "/Q2:o", "Q2:o", "VDD:v"], facts: [["Versorgung", "Alimentation", "3…15 V"], ["Set/Reset", "Set/Reset", "aktiv HIGH (beim 74HC74 aktiv LOW)"], ["Typische Jobs", "Usages", "Taster-Umschalter, Teiler, 1-Bit-Speicher"]], proj: ["cd4013"] },
  { id: "hc164", name: "74HC164", pkg: "DIP-14", cat: "count", k: ["8-Bit-Schieberegister: seriell rein, parallel raus", "Registre 8 bits : entrée série, sorties parallèles"], pins: ["A:i", "B:i", "QA:o", "QB:o", "QC:o", "QD:o", "GND:g", "CLK:i", "/CLR:i", "QE:o", "QF:o", "QG:o", "QH:o", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…6 V"], ["Eingänge", "Entrées", "A und B sind UND-verknüpft"], ["Unterschied", "Différence", "kein Ausgangsspeicher wie beim 74HC595"]], proj: ["hc164"] },
  { id: "max232", name: "MAX232", pkg: "DIP-16", cat: "logic", k: ["Pegelwandler TTL ↔ RS-232", "Convertisseur TTL ↔ RS-232"], pins: ["C1+:i", "V+:o", "C1−:i", "C2+:i", "C2−:i", "V−:o", "T2OUT:o", "R2IN:i", "R2OUT:o", "T2IN:i", "T1IN:i", "R1OUT:o", "R1IN:i", "T1OUT:o", "GND:g", "VCC:v"], facts: [["Versorgung", "Alimentation", "5 V"], ["Kanäle", "Canaux", "2 Sender, 2 Empfänger"], ["Pegel", "Niveaux", "etwa ±9 V aus 5 V, über Ladungspumpe"]], proj: ["max232"] },
  { id: "mcp3008", name: "MCP3008", pkg: "DIP-16", cat: "analog", k: ["8-Kanal-AD-Wandler mit 10 Bit, SPI", "CAN 8 canaux 10 bits, SPI"], pins: ["CH0:i", "CH1:i", "CH2:i", "CH3:i", "CH4:i", "CH5:i", "CH6:i", "CH7:i", "DGND:g", "CS:i", "DIN:i", "DOUT:o", "CLK:i", "AGND:g", "VREF:v", "VDD:v"], facts: [["Versorgung", "Alimentation", "2,7…5,5 V"], ["Auflösung", "Résolution", "1024 Stufen"], ["Tempo", "Vitesse", "bis 200 000 Messungen pro Sekunde (5 V)"]], proj: ["mcp3008"] },
  { id: "tl431", name: "TL431", pkg: "TO-92", cat: "analog", k: ["Einstellbare Referenz 2,5…36 V", "Référence réglable 2,5…36 V"], pins: ["REF:i", "A:g", "K:o"], facts: [["Referenz", "Référence", "2,495 V"], ["Strom", "Courant", "1…100 mA"], ["Typische Jobs", "Usages", "Referenz, Regelung in Schaltnetzteilen, Spannungswächter"]], proj: ["tl431"] },
  { id: "icl7660", name: "ICL7660", pkg: "DIP-8", cat: "analog", k: ["Spannungsinverter: aus +5 V wird −5 V", "Inverseur de tension : +5 V devient −5 V"], pins: ["NC:i", "CAP+:i", "GND:g", "CAP−:i", "VOUT:o", "LV:i", "OSC:i", "V+:v"], facts: [["Eingang", "Entrée", "1,5…10 V"], ["Strom", "Courant", "etwa 20 mA"], ["Prinzip", "Principe", "Ladungspumpe – ohne Spule"]], proj: ["icl7660"] },
  { id: "lm35", name: "LM35", pkg: "TO-92", cat: "analog", k: ["Temperatursensor, 10 mV pro °C", "Capteur de température, 10 mV par °C"], pins: ["+VS:v", "VOUT:o", "GND:g"], facts: [["Versorgung", "Alimentation", "4…30 V"], ["Bereich", "Plage", "2…150 °C (einfache Beschaltung)"], ["Genauigkeit", "Précision", "etwa ±0,5 °C bei 25 °C"]], proj: ["lm35"] },
  { id: "irlz44n", name: "IRLZ44N", pkg: "TO-220", cat: "drive", k: ["Logic-Level-MOSFET bis 47 A", "MOSFET logic-level jusqu’à 47 A"], pins: ["G:i", "D:o", "S:g"], facts: [["Grenzwerte", "Limites", "55 V, 47 A"], ["Widerstand", "Résistance", "22 mΩ bei 10 V, 28 mΩ bei 5 V am Gate"], ["Ansteuerung", "Commande", "direkt mit 5 V, mit 3,3 V nur eingeschränkt"]], proj: ["irlz44n"] },
  { id: "d1n4007", name: "1N4007", pkg: "DO-41", cat: "drive", k: ["Gleichrichterdiode 1000 V, 1 A", "Diode de redressement 1000 V, 1 A"], pins: ["A:i", "K:o"], facts: [["Durchlassspannung", "Tension directe", "etwa 0,7…1 V"], ["Kennzeichen", "Repère", "der Ring markiert die Kathode"], ["Typische Jobs", "Usages", "Gleichrichter, Freilaufdiode, Verpolschutz"]], proj: ["gleich"] },
  { id: "zd", name: "Z-Diode", pkg: "DO-35", cat: "drive", k: ["Hält eine feste Spannung", "Maintient une tension fixe"], pins: ["A:g", "K:o"], facts: [["Betrieb", "Fonctionnement", "in Sperrrichtung"], ["Reihen", "Séries", "BZX55 (0,5 W), BZX85 (1,3 W)"], ["Werte", "Valeurs", "2,4…200 V"]], proj: ["zdiode"] },
  { id: "hc245", name: "74HC245", pkg: "DIP-20", cat: "logic", k: ["8-Bit-Bustreiber in beide Richtungen", "Tampon de bus 8 bits bidirectionnel"], pins: ["DIR:i", "A1:i", "A2:i", "A3:i", "A4:i", "A5:i", "A6:i", "A7:i", "A8:i", "GND:g", "B8:o", "B7:o", "B6:o", "B5:o", "B4:o", "B3:o", "B2:o", "B1:o", "/OE:i", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…6 V"], ["Typische Jobs", "Usages", "Bus verstärken, Pegel 3,3 V → 5 V (als HCT)"], ["Strom", "Courant", "± 6 mA je Ausgang"]], proj: ["hc245"] },
  { id: "hc573", name: "74HC573", pkg: "DIP-20", cat: "count", k: ["8-Bit-Latch (Zwischenspeicher)", "Latch 8 bits"], pins: ["/OE:i", "D0:i", "D1:i", "D2:i", "D3:i", "D4:i", "D5:i", "D6:i", "D7:i", "GND:g", "LE:i", "Q7:o", "Q6:o", "Q5:o", "Q4:o", "Q3:o", "Q2:o", "Q1:o", "Q0:o", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…6 V"], ["Prinzip", "Principe", "LE HIGH = durchlässig, LE LOW = speichern"], ["Verwandt", "Parent", "74HC574 (Flip-Flops, flankengesteuert)"]], proj: ["hc573"] },
  { id: "cd4094", name: "CD4094", pkg: "DIP-16", cat: "count", k: ["8-Bit-Schieberegister mit Strobe", "Registre à décalage 8 bits avec strobe"], pins: ["STROBE:i", "DATA:i", "CLK:i", "Q1:o", "Q2:o", "Q3:o", "Q4:o", "VSS:g", "QS:o", "Q'S:o", "Q8:o", "Q7:o", "Q6:o", "Q5:o", "OE:i", "VDD:v"], facts: [["Versorgung", "Alimentation", "3…15 V"], ["Verwandt", "Parent", "74HC595 (2…6 V)"], ["Kette", "Cascade", "QS an DATA des nächsten"]], proj: ["cd4094"] },
  { id: "cd4020", name: "CD4020", pkg: "DIP-16", cat: "count", k: ["14-stufiger Binärteiler", "Diviseur binaire 14 étages"], pins: ["Q12:o", "Q13:o", "Q14:o", "Q6:o", "Q5:o", "Q7:o", "Q4:o", "VSS:g", "Q1:o", "CLK:i", "RESET:i", "Q9:o", "Q8:o", "Q10:o", "Q11:o", "VDD:v"], facts: [["Versorgung", "Alimentation", "3…15 V"], ["Teiler", "Division", "÷2 bis ÷16384"], ["Besonderheit", "Particularité", "Q2 und Q3 sind nicht herausgeführt"]], proj: ["cd4020"] },
  { id: "cd4046", name: "CD4046", pkg: "DIP-16", cat: "timer", k: ["PLL mit spannungsgesteuertem Oszillator", "PLL avec oscillateur commandé en tension"], pins: ["PCP:o", "PC1:o", "COMP:i", "VCO:o", "INH:i", "C1A:i", "C1B:i", "VSS:g", "VCOIN:i", "SF:o", "R1:i", "R2:i", "PC2:o", "SIG:i", "Z:o", "VDD:v"], facts: [["Versorgung", "Alimentation", "3…18 V"], ["VCO", "VCO", "bis ca. 1 MHz"], ["Typische Jobs", "Usages", "Frequenz vervielfachen, FM-Demodulation, Tonerkennung"]], proj: ["cd4046"] },
  { id: "lm339", name: "LM339", pkg: "DIP-14", cat: "analog", k: ["4 × Komparator mit offenem Kollektor", "4 comparateurs à collecteur ouvert"], pins: ["OUT2:o", "OUT1:o", "VCC:v", "IN1−:i", "IN1+:i", "IN2−:i", "IN2+:i", "IN3−:i", "IN3+:i", "IN4−:i", "IN4+:i", "GND:g", "OUT4:o", "OUT3:o"], facts: [["Versorgung", "Alimentation", "2…36 V"], ["Verwandt", "Parent", "LM393 = zwei davon"], ["Ausgang", "Sortie", "zieht nur nach Masse – Pull-up nötig"]], proj: ["lm339"] },
  { id: "tl072", name: "TL072", pkg: "DIP-8", cat: "analog", k: ["2 × rauscharmer JFET-Operationsverstärker", "2 amplis op JFET à faible bruit"], pins: ["OUT1:o", "IN1−:i", "IN1+:i", "V−:g", "IN2+:i", "IN2−:i", "OUT2:o", "V+:v"], facts: [["Versorgung", "Alimentation", "±5…±18 V"], ["Bandbreite", "Bande passante", "3 MHz, Slew-Rate 13 V/µs"], ["Verwandt", "Parents", "TL071 (einfach), TL074 (vierfach)"]], proj: ["tl072"] },
  { id: "ne5532", name: "NE5532", pkg: "DIP-8", cat: "analog", k: ["2 × rauscharmer Audio-Operationsverstärker", "2 amplis op audio à faible bruit"], pins: ["OUT1:o", "IN1−:i", "IN1+:i", "V−:g", "IN2+:i", "IN2−:i", "OUT2:o", "V+:v"], facts: [["Pinbelegung", "Brochage", "gleich wie LM358 und TL072 (Standard-Doppel-Opamp)"], ["Versorgung", "Alimentation", "±3…±20 V"], ["Bandbreite", "Bande passante", "10 MHz, Slew-Rate 9 V/µs"]], proj: ["opamp"] },
  { id: "mcp6002", name: "MCP6002", pkg: "DIP-8", cat: "analog", k: ["2 × Rail-to-Rail-Operationsverstärker (1,8–6 V)", "2 amplis op rail-to-rail"], pins: ["OUT1:o", "IN1−:i", "IN1+:i", "VSS:g", "IN2+:i", "IN2−:i", "OUT2:o", "VDD:v"], facts: [["Pinbelegung", "Brochage", "gleich wie LM358 (Standard-Doppel-Opamp)"], ["Versorgung", "Alimentation", "1,8…6 V – ideal für 3,3-V-Mikrocontroller"], ["Ausgang", "Sortie", "Rail-to-Rail: bis ganz an GND und +V"]], proj: ["opamp"] },
  { id: "lm741", name: "LM741", pkg: "DIP-8", cat: "analog", k: ["1 × Operationsverstärker (Klassiker)", "1 ampli op (classique)"], pins: ["OFFSET N1:i", "IN−:i", "IN+:i", "V−:g", "OFFSET N2:i", "OUT:o", "V+:v", "NC:i"], facts: [["Pinbelegung", "Brochage", "EINFACH-Opamp: OUT an Pin 6, V+ an Pin 7 – anders als beim LM358!"], ["Versorgung", "Alimentation", "±5…±18 V (nicht für 5 V einfach geeignet)"], ["Offset", "Offset", "Pin 1 und 5 mit 10-kΩ-Poti zum Nullabgleich, sonst offen lassen"]], proj: ["opamp"] },
  { id: "tl071", name: "TL071", pkg: "DIP-8", cat: "analog", k: ["1 × Operationsverstärker, JFET-Eingang", "1 ampli op JFET"], pins: ["OFFSET N1:i", "IN−:i", "IN+:i", "V−:g", "OFFSET N2:i", "OUT:o", "V+:v", "NC:i"], facts: [["Pinbelegung", "Brochage", "wie LM741 (Einfach-Opamp): OUT Pin 6, V+ Pin 7"], ["Versorgung", "Alimentation", "±5…±18 V"], ["Verwandt", "Parents", "TL072 (doppelt), TL074 (vierfach)"]], proj: ["opamp"] },
  { id: "tl074", name: "TL074", pkg: "DIP-14", cat: "analog", k: ["4 × Operationsverstärker, JFET-Eingang", "4 amplis op JFET"], pins: ["OUT1:o", "IN1−:i", "IN1+:i", "V+:v", "IN2+:i", "IN2−:i", "OUT2:o", "OUT3:o", "IN3−:i", "IN3+:i", "V−:g", "IN4+:i", "IN4−:i", "OUT4:o"], facts: [["Pinbelegung", "Brochage", "gleich wie LM324 (Standard-Vierfach-Opamp): V+ Pin 4, V− Pin 11"], ["Versorgung", "Alimentation", "±5…±18 V"], ["Bandbreite", "Bande passante", "3 MHz, Slew-Rate 13 V/µs"]], proj: ["opamp"] },
  { id: "ne556", name: "NE556", pkg: "DIP-14", cat: "timer", k: ["Zwei NE555 in einem Gehäuse", "Deux NE555 dans un boîtier"], pins: ["DIS1:o", "THR1:i", "CTRL1:i", "RESET1:i", "OUT1:o", "TRIG1:i", "GND:g", "TRIG2:i", "OUT2:o", "RESET2:i", "CTRL2:i", "THR2:i", "DIS2:o", "VCC:v"], facts: [["Versorgung", "Alimentation", "4,5…16 V"], ["Innen", "Intérieur", "zwei unabhängige Timer, gemeinsame Versorgung"], ["Typische Jobs", "Usages", "Tongeber im Takt, Blinker mit Verzögerung"]], proj: ["ne556"] },
  { id: "lm337", name: "LM337", pkg: "TO-220", cat: "analog", k: ["Einstellbarer negativer Spannungsregler", "Régulateur négatif réglable"], pins: ["ADJ:i", "IN:v", "OUT:o"], facts: [["Bereich", "Plage", "−1,25…−37 V, 1,5 A"], ["Gegenstück", "Pendant", "LM317 für positive Spannungen"], ["Achtung", "Attention", "andere Pinfolge als der LM317"]], proj: ["lm337"] },
  { id: "lm1117", name: "LM1117-3.3", pkg: "SOT-223", cat: "analog", k: ["Low-Drop-Regler 3,3 V, 800 mA", "Régulateur low-drop 3,3 V, 800 mA"], pins: ["GND:g", "OUT:o", "IN:v"], facts: [["Abstand", "Écart", "etwa 1,1 V zwischen Ein- und Ausgang"], ["Strom", "Courant", "bis 800 mA"], ["Nachbau", "Clone", "AMS1117 (auf vielen ESP32-Boards)"]], proj: ["lm1117"] },
  { id: "bc557", name: "BC557", pkg: "TO-92", cat: "drive", k: ["PNP-Transistor: schaltet nach Plus", "Transistor PNP : commute côté +"], pins: ["C:o", "B:i", "E:v"], facts: [["Grenzwerte", "Limites", "45 V, 100 mA"], ["Schaltet ein", "Conduit", "wenn die Basis LOW ist"], ["Gegenstück", "Pendant", "BC547 (NPN)"]], proj: ["pnp"] },
  { id: "irf9540", name: "IRF9540", pkg: "TO-220", cat: "drive", k: ["P-Kanal-MOSFET für die Plus-Seite", "MOSFET canal P côté +"], pins: ["G:i", "D:o", "S:v"], facts: [["Grenzwerte", "Limites", "−100 V, −23 A"], ["Widerstand", "Résistance", "0,2 Ω bei −10 V am Gate"], ["Gate", "Grille", "höchstens ±20 V gegen Source"]], proj: ["pmos"] },
  { id: "led5", name: "LED 5 mm", pkg: "THT", cat: "drive", k: ["Leuchtdiode mit Vorwiderstand", "Diode électroluminescente"], pins: ["A:v", "K:g"], facts: [["Strom", "Courant", "5…20 mA"], ["Flussspannung", "Tension directe", "rot 1,9 V … blau/weiß 3,0 V"], ["Polung", "Polarité", "langes Bein = Anode"]], proj: ["led"] },
  { id: "ad620", name: "AD620", pkg: "DIP-8", cat: "analog", k: ["Instrumentenverstärker, Verstärkung mit einem Widerstand", "Ampli d’instrumentation, gain par une résistance"], pins: ["RG:i", "−IN:i", "+IN:i", "−VS:g", "REF:i", "OUT:o", "+VS:v", "RG2:i"], facts: [["Versorgung", "Alimentation", "±2,3…±18 V"], ["Verstärkung", "Gain", "1…10 000, G = 1 + 49,4 kΩ / RG"], ["Gleichtaktunterdrückung", "Réjection", "über 100 dB (G ≥ 10)"]], proj: ["ad620"] },
  { id: "dac0808", name: "DAC0808", pkg: "DIP-16", cat: "analog", k: ["8-Bit-Digital-Analog-Wandler", "Convertisseur numérique-analogique 8 bits"], pins: ["NC:i", "GND:g", "VEE:g", "IOUT:o", "A1:i", "A2:i", "A3:i", "A4:i", "A5:i", "A6:i", "A7:i", "A8:i", "VCC:v", "VREF+:i", "VREF−:i", "COMP:i"], facts: [["Versorgung", "Alimentation", "+5 V und −12 V"], ["Auflösung", "Résolution", "256 Stufen, A1 = MSB"], ["Ausgang", "Sortie", "Strom – ein Opamp macht daraus Spannung"]], proj: ["dac0808"] },
  { id: "hc283", name: "74HC283", pkg: "DIP-16", cat: "logic", k: ["4-Bit-Volladdierer", "Additionneur complet 4 bits"], pins: ["S2:o", "B2:i", "A2:i", "S1:o", "A1:i", "B1:i", "C0:i", "GND:g", "C4:o", "S4:o", "B4:i", "A4:i", "S3:o", "A3:i", "B3:i", "VCC:v"], facts: [["Versorgung", "Alimentation", "2…6 V"], ["Ergebnis", "Résultat", "0…31 (5 Bit mit Übertrag)"], ["Verwandt", "Parents", "7483 (alte Pinbelegung), 7485 (Vergleicher)"]], proj: ["adder"] },
  { id: "ds1307", name: "DS1307", pkg: "DIP-8", cat: "count", k: ["Echtzeituhr mit I²C und Batterie", "Horloge temps réel I²C avec pile"], pins: ["X1:i", "X2:i", "VBAT:v", "GND:g", "SDA:o", "SCL:i", "SQW:o", "VCC:v"], facts: [["Versorgung", "Alimentation", "5 V, Batterie 3 V"], ["Adresse", "Adresse", "0x68"], ["Besser", "Mieux", "DS3231: genauer, 3,3 V, Quarz eingebaut"]], proj: ["ds1307"] },
  { id: "eeprom24", name: "24LC256", pkg: "DIP-8", cat: "count", k: ["32-KB-EEPROM am I²C-Bus", "EEPROM 32 Ko en I²C"], pins: ["A0:i", "A1:i", "A2:i", "VSS:g", "SDA:o", "SCL:i", "WP:i", "VCC:v"], facts: [["Versorgung", "Alimentation", "1,8…5,5 V"], ["Adresse", "Adresse", "0x50…0x57"], ["Haltbarkeit", "Endurance", "1 Mio. Schreibvorgänge, 200 Jahre"]], proj: ["eeprom"] },
  { id: "max485", name: "MAX485", pkg: "DIP-8", cat: "logic", k: ["RS-485-Treiber für lange Leitungen", "Émetteur-récepteur RS-485"], pins: ["RO:o", "/RE:i", "DE:i", "DI:i", "GND:g", "A:o", "B:o", "VCC:v"], facts: [["Versorgung", "Alimentation", "5 V (3,3 V: MAX3485)"], ["Reichweite", "Portée", "bis 1200 m"], ["Betrieb", "Mode", "Halbduplex: senden oder empfangen"]], proj: ["max485"] },
  { id: "moc3021", name: "MOC3021", pkg: "DIP-6", cat: "drive", k: ["Optotriac: zündet einen Triac galvanisch getrennt", "Optotriac : amorce un triac isolé"], pins: ["Anode:i", "Kathode:g", "NC:i", "MT1:o", "NC2:i", "MT2:o"], facts: [["LED-Strom", "Courant LED", "15 mA"], ["Isolation", "Isolation", "7500 V"], ["Variante", "Variante", "MOC3041 schaltet im Nulldurchgang"]], proj: ["triac"] },
  { id: "tsop", name: "TSOP4838", pkg: "TO-92", cat: "drive", k: ["Infrarot-Empfänger für 38 kHz", "Récepteur infrarouge 38 kHz"], pins: ["OUT:o", "GND:g", "VS:v"], facts: [["Versorgung", "Alimentation", "2,5…5,5 V"], ["Ausgang", "Sortie", "LOW, solange 38-kHz-Licht ankommt"], ["Ähnlich", "Similaires", "VS1838, KY-022 (andere Pinfolge möglich)"]], proj: ["tsop"] },
  { id: "a4988", name: "A4988-Modul", pkg: "Modul 16", cat: "drive", k: ["Schrittmotortreiber mit Mikroschritten", "Driver pas à pas avec micropas"], pins: ["EN:i", "MS1:i", "MS2:i", "MS3:i", "RST:i", "SLP:i", "STEP:i", "DIR:i", "GND:g", "VDD:v", "1B:o", "1A:o", "2A:o", "2B:o", "GND2:g", "VMOT:v"], facts: [["Motor", "Moteur", "8…35 V, bis 2 A je Spule (mit Kühlung)"], ["Mikroschritte", "Micropas", "bis 1/16"], ["Verwandt", "Parent", "DRV8825 (bis 1/32)"]], proj: ["a4988"] }
];
var RECH = { ne555a: "timer555", ne555m: "timer555", ne556: "timer555", cd4060: "timer555", k_lauf: "timer555", k_relais: "timer555", k_ampel: "timer555", k_thermo: "opamp/cmp", k_netz: "regler", k_sirene: "timer555", k_motor: "timer555", lm358: "opamp/nin", lm324: "opamp/cmp", tl072: "opamp/nin", ad620: "opamp/sub", lm393: "opamp/cmp", lm339: "opamp/cmp", k_daemm: "opamp/cmp", op_inv: "opamp/inv", op_non: "opamp/nin", op_fol: "opamp/fol", op_add: "opamp/sum", op_sub: "opamp/sub", op_int: "opamp/int", op_dif: "opamp/dif", op_komp: "opamp/cmp", op_tia: "opamp/tia", op_sk: "opamp/lp", hc14: "opamp/sch", cd4093: "opamp/sch", lm317: "regler", lm337: "regler", lm7805: "regler", lm1117: "regler", led: "led", rc_hp: "filter", rc_bp: "filter", hc00: "logik", adder: "logik", hc283: "logik", tl431: "teiler", lm35: "teiler", lm339b: "teiler" };
var KOMBI = ["k_lauf", "k_uhr", "k_zaehl", "k_daemm", "k_prell", "k_sirene", "k_motor", "k_relais", "k_ampel", "k_thermo", "k_netz", "k_wuerfel", "k_alarm", "k_wechsel", "k_verz", "k_touch", "k_strom", "k_zreg"];

/* ---- Weitere Projekte ---- */
PROJ.k_wuerfel = { t: ["Elektronischer Würfel: 555 → CD4017 (÷6) → 6 LEDs", "Dé électronique : 555 → CD4017 (÷6) → 6 LED"], flow: ["Taster", "NE555 (schnell)", "CD4017 zählt 0…5", "LED 1…6"], ics: ["ne555", "cd4017"],
  d: ["Solange du den Taster drückst, schwingt der 555 mit über 100 Hz und der 4017 zählt rasend schnell 0…5 (Q6 setzt ihn zurück). Lässt du los, bleibt er stehen – auf einer Zahl, die du nicht vorhersagen kannst. Genau das macht den Würfel fair.", "Tant que le bouton est appuyé, le 555 oscille vite et le 4017 compte 0…5. Au relâchement, il s’arrête sur un chiffre imprévisible."],
  action: { l: ["🎲 Würfeln (Taster drücken)", "🎲 Lancer (appuyer)"] },
  build: function(P, ctx){ var k = c555(1e3, 4.7e3, 1e-6, 5), roll = 1.2, fire = ctx && ctx.fire != null ? ctx.fire : null, res = fire == null ? null : 1 + Math.floor(hash(Math.round(fire * 997) + 7) * 6), t0 = .4, fv = 12;
    return { span: 3, speed: 1, warn: [], ch: [{ n: T("Taster (Pin 4 RESET)", "Bouton (RESET)"), c: C.amber, lo: 0, hi: 5, v: function(t){ return t >= t0 && t < t0 + roll ? 5 : 0; } },
      { n: T("555 OUT = Takt (hier verlangsamt)", "Horloge (ralentie)"), c: C.cyan, lo: 0, hi: 5, v: function(t){ return t >= t0 && t < t0 + roll ? sq(t, fv, t0) * 5 : 0; } },
      { n: T("Würfelzahl (Q0…Q5)", "Chiffre"), c: C.green, lo: 0, hi: 6, u: "", v: function(t){ return 1 + cnt(Math.min(t, t0 + roll), fv, t0) % 6; } }],
      info: [[T("Takt beim Würfeln (555)", "Horloge"), fmt(k.f, "Hz")], [T("Gewürfelt", "Résultat"), res ? "🎲 " + res : T("– drücke „Würfeln“", "– appuie sur « Lancer »")], [T("Warum fair?", "Pourquoi équitable ?"), T("in 1 s Drücken zählt der 4017 über 100 Schritte", "plus de 100 pas en 1 s")]],
      live: function(ts){ var n = -1; if (fire != null && ts - fire < roll) n = Math.floor((ts - fire) * 14) % 6; else if (res) n = res - 1; var a = []; for (var i = 0; i < 6; i++) a.push(i === n ? 1 : 0); return { leds: a, names: ["1", "2", "3", "4", "5", "6"], cols: a.map(function(){ return C.amber; }), seg: n >= 0 ? n + 1 : -1 }; } }; },
  wire: [["NE555 als schneller Blinker: R1 = 1 kΩ, R2 = 4,7 kΩ, C = 1 µF (ca. 140 Hz)", "NE555 rapide : 1 kΩ, 4,7 kΩ, 1 µF"], ["Pin 4 (RESET) über 10 kΩ nach GND, Taster von Pin 4 nach +V – der 555 schwingt nur, solange gedrückt", "Broche 4 : 10 kΩ vers GND, bouton vers +V"], ["555 Pin 3 → CD4017 Pin 14 (CLK); Pin 13 (CE) → GND", "555 broche 3 → 4017 broche 14"], ["Q6 (Pin 5) → RESET (Pin 15): der Zähler läuft nur 0…5", "Q6 (broche 5) → RESET (15)"], ["Q0…Q5 → 330 Ω → LED → GND", "Q0…Q5 → 330 Ω → LED"]],
  notes: [["Für echte Würfelaugen fasst man Ausgänge mit Dioden zusammen (wie bei der Ampel): die mittlere LED leuchtet bei 1, 3 und 5.", "Pour de vrais points de dé, on combine les sorties par diodes."], ["Tipp: Ein Kondensator (10 µF) parallel zum 10-kΩ-Widerstand an Pin 4 lässt den Würfel nach dem Loslassen noch kurz „ausrollen“.", "Astuce : 10 µF sur la broche 4 pour un effet de roulement."]] };
PROJ.k_alarm = { t: ["Lichtschranken-Alarm: LDR → LM393 → 555-Monoflop → Summer", "Alarme barrière lumineuse : LDR → LM393 → 555"], flow: ["Lichtstrahl auf LDR", "LM393 vergleicht", "555 Monoflop (5 s)", "Summer + LED"], ics: ["lm393", "ne555"],
  opts: [{ k: "arm", l: ["Schalter „Scharf“", "Interrupteur « armé »"], o: [["1", "Ein – Alarm scharf"], ["0", "Aus – Alarm ausgeschaltet"]], def: "1" }],
  d: ["Ein Lichtstrahl fällt auf den LDR. Läuft jemand hindurch, wird es am LDR dunkel, die Spannung am Knoten X fällt unter die Referenz und der Komparator zieht seinen Ausgang auf LOW. Diese fallende Flanke startet den 555 als Monoflop: Summer und LED laufen 5 Sekunden – auch wenn der Strahl längst wieder frei ist. Mit dem Schalter „Scharf“ (RESET des 555) schaltest du die Anlage ein und aus.", "Quand le faisceau est coupé, le comparateur déclenche le 555 monostable : 5 s d’alarme. L’interrupteur « armé » coupe l’alarme."],
  action: { l: ["✋ Lichtstrahl unterbrechen", "✋ Couper le faisceau"] },
  build: function(P, ctx){ var Tm = 1.1 * 470e3 * 10e-6, arm = P.arm === "1", fire = ctx && ctx.fire != null ? ctx.fire : null, b0 = 1.5, b1 = 2.1;
    return { span: 10, speed: 1, warn: arm ? [] : [T("Schalter „Scharf“ ist aus: RESET liegt auf LOW – der 555 reagiert nicht.", "Interrupteur sur arrêt : le 555 ne réagit pas.")],
      ch: [{ n: T("Knoten X (LDR-Teiler)", "Nœud X"), c: C.amber, lo: 0, hi: 5, v: function(t){ return t >= b0 && t < b1 ? .8 : 3.9; } }, { n: T("Referenz (IN−)", "Référence"), c: C.violet, lo: 0, hi: 5, v: function(){ return 2.5; } },
        { n: T("LM393 OUT → 555 TRIG", "Sortie LM393 → TRIG"), c: C.cyan, lo: 0, hi: 5, v: function(t){ return t >= b0 && t < b1 ? 0 : 5; } }, { n: T("555 OUT = Alarm", "Alarme"), c: C.red, lo: 0, hi: 5, v: function(t){ return arm && t >= b0 && t < b0 + Tm ? 5 : 0; } }],
      info: [[T("Alarmdauer T = 1,1 · R · C", "Durée T = 1,1·R·C"), fmt(Tm, "s") + "  (470 kΩ · 10 µF)"], [T("Anlage", "Système"), arm ? T("🔴 scharf", "🔴 armé") : T("⚪ aus", "⚪ arrêt")]],
      live: function(ts){ var blk = fire != null && ts - fire < .6, al = arm && fire != null && ts - fire < Tm; return { leds: [al ? 1 : 0, blk ? 0 : 1, arm ? 1 : 0], names: [T("Rot: Alarm", "Rouge : alarme"), T("Grün: Strahl frei", "Vert : faisceau libre"), T("Gelb: scharf", "Jaune : armé")] }; } }; },
  wire: [["LDR von +5 V nach Knoten X, 10 kΩ von X nach GND; X → LM393 Pin 3 (IN+)", "LDR de +5 V à X, 10 kΩ vers GND ; X → broche 3"], ["Referenz 2,5 V: zwei 10 kΩ als Teiler → Pin 2 (IN−)", "Référence 2,5 V → broche 2"], ["LM393 Pin 1 mit 10 kΩ Pull-up → 555 Pin 2 (TRIG)", "Broche 1 avec pull-up → TRIG du 555"], ["555 als Monoflop: 470 kΩ von +V an Pin 7/6, 10 µF von Pin 6 nach GND", "555 monostable : 470 kΩ, 10 µF"], ["Schalter „Scharf“ von +V an Pin 4, 10 kΩ von Pin 4 nach GND", "Interrupteur sur la broche 4"], ["Pin 3 → Piezo-Summer → GND und 330 Ω → LED → GND", "Broche 3 → buzzer et LED"]],
  notes: [["Mit einem Laserpointer oder einer hellen LED als Sender reicht die Schranke über mehrere Meter.", "Avec un laser, plusieurs mètres."], ["Ein Poti statt der festen Referenz macht die Schwelle einstellbar – je nach Umgebungslicht.", "Un potentiomètre rend le seuil réglable."]] };
PROJ.k_wechsel = { t: ["Wechselblinker: zwei Transistoren (astabile Kippstufe)", "Clignotant alterné : deux transistors (multivibrateur)"], flow: ["Transistor Q1", "Kondensatoren über Kreuz", "Transistor Q2", "LEDs abwechselnd"], ics: ["bc337"],
  d: ["Die klassische Kippstufe ganz ohne IC: Immer wenn ein Transistor einschaltet, drückt sein Kondensator die Basis des anderen kurz unter 0 V – der schaltet aus, bis sich der Kondensator über den Basiswiderstand wieder aufgeladen hat. Dann kippt alles zur anderen Seite. f ≈ 1 / (1,38 · R · C).", "Le multivibrateur classique sans CI. f ≈ 1 / (1,38·R·C)."],
  build: function(){ var R = 47e3, Cc = 10e-6, th = .69 * R * Cc, f = 1 / (2 * th);
    function ph(t){ return ((t % (2 * th)) + 2 * th) % (2 * th); }
    return { span: 3 * 2 * th, speed: 1, fmain: f, warn: [], ch: [{ n: T("Kollektor Q1 (D1)", "Collecteur Q1"), c: C.red, lo: 0, hi: 5, v: function(t){ return ph(t) < th ? .2 : 5; } }, { n: T("Kollektor Q2 (D2)", "Collecteur Q2"), c: C.green, lo: 0, hi: 5, v: function(t){ return ph(t) < th ? 5 : .2; } },
      { n: T("Basis Q1 (lädt über R3)", "Base Q1"), c: C.amber, lo: -5, hi: 5, v: function(t){ var x = ph(t); if (x < th) return .65; var u = 5 - 9.4 * Math.exp(-(x - th) / (R * Cc)); return Math.min(.65, u); } }],
      info: [[T("Frequenz f ≈ 1 / (1,38·R·C)", "Fréquence"), fmt(f, "Hz") + "  (47 kΩ · 10 µF)"], [T("Jede LED leuchtet", "Chaque LED"), fmt(th, "s")]],
      live: function(ts){ var a = ph(ts) < th; return { leds: [a ? 1 : 0, a ? 0 : 1], names: [T("Rot: D1", "Rouge : D1"), T("Grün: D2", "Vert : D2")] }; } }; },
  wire: [["Q1 und Q2: BC337/BC547, Emitter an GND", "Q1, Q2 : émetteur à GND"], ["+V → 470 Ω → LED → Kollektor (je Transistor)", "+V → 470 Ω → LED → collecteur"], ["+V → 47 kΩ → Basis (je Transistor)", "+V → 47 kΩ → base"], ["Kollektor Q1 → 10 µF (+) → Basis Q2 und Kollektor Q2 → 10 µF (+) → Basis Q1", "Condensateurs croisés"]],
  notes: [["Ungleiche Kondensatoren ergeben ungleiche Leuchtzeiten – so baut man einen Blitz (kurz an, lange aus).", "Condensateurs différents = durées différentes."], ["Die negative Basisspannung (bis −4,4 V) ist der Grund, warum die Schaltung über ca. 6 V nicht mehr sicher läuft: Die Basis-Emitter-Strecke bricht dann durch.", "La tension de base négative limite la tension d’alimentation."]] };
PROJ.k_verz = { t: ["Einschaltverzögerung: RC-Glied + Transistor", "Temporisation à la mise sous tension : RC + transistor"], flow: ["Spannung an", "Kondensator lädt über 1 MΩ", "Basis erreicht 0,65 V", "Transistor schaltet LED ein"], ics: ["bc337"],
  d: ["Beim Einschalten ist der Kondensator leer, die Basis liegt bei 0 V und der Transistor sperrt – die LED bleibt dunkel. Über den 1-MΩ-Widerstand lädt sich der 10-µF-Kondensator langsam auf. Sobald seine Spannung etwa 0,65 V erreicht, beginnt der Transistor zu leiten und die LED geht an. Die Verzögerung ist t ≈ R · C · ln(U / (U − 0,65 V)).", "À la mise sous tension le condensateur est vide, le transistor est bloqué. Il se charge via 1 MΩ ; à 0,65 V environ le transistor conduit et la LED s’allume. t ≈ R·C·ln(U/(U−0,65 V))."],
  build: function(){ var R = 1e6, Cc = 10e-6, U = 5, tau = R * Cc, td = -tau * Math.log(1 - .65 / U);
    return { span: 6, speed: 1, warn: [], ch: [{ n: T("Spannung an C1 = Basis Q1", "Tension sur C1 = base Q1"), c: C.amber, lo: 0, hi: 1, v: function(t){ return Math.min(.7, U * (1 - Math.exp(-t / tau))); } },
      { n: T("LED-Strom", "Courant LED"), c: C.green, lo: 0, hi: 10, u: "mA", v: function(t){ return t < td ? 0 : Math.min(8.7, (t - td) * 30); } }],
      info: [[T("Verzögerung t ≈ R·C·ln(U/(U−0,65 V))", "Délai"), fmt(td, "s") + "  (1 MΩ · 10 µF, 5 V)"], [T("Zeitkonstante τ = R·C", "Constante τ = R·C"), fmt(tau, "s")]],
      live: function(ts){ var x = ts % 8; return { leds: [x > td && x < 7 ? 1 : 0], names: [T("LED (nach der Verzögerung)", "LED (après le délai)")] }; } }; },
  wire: [["+V → 1 MΩ → Basis von Q1 (BC547); 10 µF (+ zur Basis) von der Basis nach GND", "+V → 1 MΩ → base ; 10 µF base → GND"], ["Emitter an GND", "Émetteur à GND"], ["+V → 470 Ω → LED → Kollektor", "+V → 470 Ω → LED → collecteur"]],
  notes: [["Größere Werte = längere Verzögerung: 2,2 MΩ und 100 µF ergeben schon über 30 Sekunden. Für wirklich lange Zeiten nimmt man ein Darlington-Paar (zwei Transistoren), weil dann der Basisstrom viel kleiner sein darf.", "Valeurs plus grandes = délai plus long ; un Darlington permet des délais très longs."], ["Der Elko hat Toleranzen von bis zu ±20 % – die Zeit ist also nur ungefähr. Für genaue Zeiten braucht man einen 555 (siehe Monoflop).", "Le condensateur a ±20 % de tolérance : pour un délai précis, utiliser un 555."]] };
PROJ.k_touch = { t: ["Touch-Schalter: Darlington-Paar schaltet LED beim Berühren", "Capteur tactile : paire Darlington"], flow: ["Finger berührt Kontakte", "Hautstrom (µA)", "Darlington verstärkt ×40 000", "LED leuchtet"], ics: ["bc337"],
  action: { l: ["☝️ Kontakte berühren", "☝️ Toucher les contacts"] },
  d: ["Deine Haut leitet ein winziges bisschen: Zwischen den beiden Kontakten (+V und Basis) fließen nur wenige Mikroampere. Zwei Transistoren hintereinander (Darlington) verstärken diesen Strom ca. 200 · 200 = 40 000-fach – genug, um die LED zu betreiben. Der 100-kΩ-Widerstand schützt die Basis, falls die Kontakte direkt verbunden werden.", "La peau conduit un peu : quelques µA entre les deux contacts. Deux transistors (Darlington) amplifient ce courant ≈ 40 000 fois et allument la LED."],
  build: function(P, ctx){ var fire = ctx && ctx.fire != null ? ctx.fire : null, t0 = .8, t1 = 3.2, Rs = 500e3, Ib = (5 - 1.3) / (100e3 + Rs);
    return { span: 5, speed: 1, warn: [], ch: [{ n: T("Finger berührt (1 = ja)", "Doigt (1 = oui)"), c: C.amber, lo: 0, hi: 1, u: "", v: function(t){ return t >= t0 && t < t1 ? 1 : 0; } },
      { n: T("Basisstrom Q1", "Courant de base"), c: C.cyan, lo: 0, hi: 10, u: "µA", v: function(t){ return t >= t0 && t < t1 ? Ib * 1e6 : 0; } },
      { n: T("LED-Strom", "Courant LED"), c: C.green, lo: 0, hi: 10, u: "mA", v: function(t){ return t >= t0 && t < t1 ? 8.5 : 0; } }],
      info: [[T("Hautwiderstand (typ.)", "Résistance de la peau"), "≈ 500 kΩ"], [T("Basisstrom", "Courant de base"), "≈ " + (Ib * 1e6).toFixed(1) + " µA"], [T("Gesamtverstärkung", "Gain total"), "≈ 40 000 ×"]],
      live: function(ts){ var on = fire != null && ts - fire < 2.5; return { leds: [on ? 1 : 0], names: [T("LED (leuchtet beim Berühren)", "LED (touchée)")] }; } }; },
  wire: [["Zwei blanke Drahtenden als Kontakte: eins an +V, das andere über 100 kΩ an die Basis von Q1", "Deux fils nus : un à +V, l’autre via 100 kΩ à la base de Q1"], ["Emitter Q1 → Basis Q2; Emitter Q2 → GND", "Émetteur Q1 → base Q2 ; émetteur Q2 → GND"], ["Kollektoren von Q1 und Q2 zusammen → LED → 470 Ω → +V", "Collecteurs ensemble → LED → 470 Ω → +V"]],
  notes: [["Mit Wasser zwischen den Kontakten funktioniert es auch: so wird daraus ein Wasserstandsmelder oder Regenmelder.", "Avec de l’eau entre les contacts : détecteur de niveau ou de pluie."], ["Ein einzelner Transistor würde nicht reichen – der Strom durch die Haut ist zu klein. Darum der Darlington.", "Un seul transistor ne suffirait pas."]] };
PROJ.k_strom = { t: ["Konstantstromquelle: zwei Transistoren halten den LED-Strom fest", "Source de courant constant : deux transistors"], flow: ["Versorgung schwankt", "R1 gibt Basisstrom an Q1", "Rs misst den Strom", "Q2 regelt gegen"], ics: ["bc337"],
  opts: [{ k: "u", l: ["Versorgungsspannung", "Tension d’alimentation"], o: [["5", "5 V"], ["9", "9 V"], ["12", "12 V"]], def: "9" }],
  d: ["Dieser Strombegrenzer ist ein kleiner Regelkreis. Fließt durch Rs mehr als etwa 20 mA, fällt an Rs mehr als 0,65 V ab – Q2 beginnt zu leiten und zieht Basisstrom von Q1 ab. So bleibt der Strom bei I = 0,65 V / Rs ≈ 20 mA, egal ob die Versorgung 5 V oder 12 V hat. Ein einfacher Vorwiderstand würde bei 12 V die LED mit viel zu viel Strom braten.", "Si le courant dépasse ≈ 20 mA, 0,65 V apparaît sur Rs : Q2 conduit et prive Q1 de courant de base. I = 0,65 V / Rs, quelle que soit la tension."],
  build: function(P){ var U = parseFloat(P.u) || 9, Rs = 33, I0 = .65 / Rs * 1000, Vf = 2.1;
    function ic(V){ return V < Vf + .85 ? Math.max(0, (V - Vf) / (Rs + 60) * 1000) : I0; }
    function rv(V){ return Math.max(0, (V - Vf) / 330 * 1000); }
    return { span: 10, speed: 1, warn: U === 5 ? [T("Bei 5 V bleibt wenig Spannung für die Regelung – der Strom ist nur ungefähr konstant.", "À 5 V la régulation est limitée.")] : [],
      ch: [{ n: T("Versorgung (läuft von 3 V bis " + U + " V)", "Alimentation"), c: C.amber, lo: 0, hi: 14, v: function(t){ return 3 + (U - 3) * Math.min(1, t / 8); } },
        { n: T("LED-Strom mit Stromquelle", "Courant LED (source)"), c: C.green, lo: 0, hi: 40, u: "mA", v: function(t){ return ic(3 + (U - 3) * Math.min(1, t / 8)); } },
        { n: T("LED-Strom nur mit 330-Ω-Widerstand", "Courant LED (330 Ω seul)"), c: C.red, lo: 0, hi: 40, u: "mA", v: function(t){ return rv(3 + (U - 3) * Math.min(1, t / 8)); } }],
      info: [[T("Strom I = 0,65 V / Rs", "Courant I = 0,65 V / Rs"), fmt(I0 / 1000, "A") + "  (Rs = 33 Ω)"], [T("Mit nur 330 Ω bei " + U + " V", "Avec 330 Ω seul"), fmt(rv(U) / 1000, "A")], [T("Verlust in Q1", "Perte dans Q1"), fmt(Math.max(0, U - Vf - .65) * I0 / 1000, "W")]],
      live: function(){ return { leds: [1], names: [T("LED (immer gleich hell)", "LED (toujours pareil)")] }; } }; },
  wire: [["LED von +V an den Kollektor von Q1", "LED de +V au collecteur de Q1"], ["Emitter Q1 → Rs 33 Ω → GND", "Émetteur Q1 → 33 Ω → GND"], ["Basis Q1 über 1 kΩ an +V und an den Kollektor von Q2", "Base Q1 via 1 kΩ à +V et au collecteur de Q2"], ["Basis Q2 an den Emitter Q1 (oben an Rs); Emitter Q2 an GND", "Base Q2 sur le haut de Rs ; émetteur Q2 à GND"]],
  notes: [["Rs bestimmt den Strom: 0,65 V / 22 Ω ≈ 30 mA, 0,65 V / 68 Ω ≈ 10 mA.", "Rs fixe le courant."], ["Dieselbe Idee steckt in jedem Labornetzteil als Strombegrenzung.", "Même principe pour la limitation de courant d’une alimentation."]] };
PROJ.k_zreg = { t: ["Spannungsregler mit Z-Diode (5,1 V)", "Régulateur à diode Zener (5,1 V)"], flow: ["Eingang 6…15 V", "Vorwiderstand 220 Ω", "Z-Diode klemmt bei 5,1 V", "Last bekommt feste Spannung"], ics: ["tl431"],
  opts: [{ k: "rl", l: ["Last", "Charge"], o: [["1000", "1 kΩ (5 mA)"], ["470", "470 Ω (11 mA)"], ["10000", "10 kΩ (0,5 mA)"]], def: "1000" }],
  d: ["Die Z-Diode sperrt in Gegenrichtung, bricht aber bei 5,1 V durch und hält dort die Spannung fest. Der Vorwiderstand 220 Ω nimmt den Rest: Steigt die Eingangsspannung, fließt mehr Strom durch die Z-Diode, die Ausgangsspannung bleibt fast gleich. Unter etwa 6 V reicht der Strom nicht mehr – dann folgt der Ausgang dem Eingang.", "La diode Zener claque à 5,1 V et fixe la tension. La résistance série absorbe le reste. En dessous de ≈ 6 V la régulation cesse."],
  build: function(P){ var RL = parseFloat(P.rl) || 1000, Rv = 220, Vz = 5.1;
    function vin(t){ return 6 + 9 * (.5 - .5 * Math.cos(t / 10 * 2 * Math.PI)); }
    function vo(t){ var u = vin(t), vo0 = u * RL / (Rv + RL); return vo0 < Vz ? vo0 : Vz + (u - 6.5) * 0.01; }
    function iz(t){ var u = vin(t); return Math.max(0, (u - vo(t)) / Rv - vo(t) / RL) * 1000; }
    return { span: 10, speed: 1, warn: [], ch: [{ n: T("Eingang (schwankt 6…15 V)", "Entrée (6…15 V)"), c: C.amber, lo: 0, hi: 16, v: vin }, { n: T("Ausgang", "Sortie"), c: C.green, lo: 0, hi: 16, v: vo }, { n: T("Strom durch die Z-Diode", "Courant Zener"), c: C.violet, lo: 0, hi: 50, u: "mA", v: iz }],
      info: [[T("Ausgangsspannung", "Tension de sortie"), "≈ 5,1 V"], [T("Z-Strom bei 15 V", "Courant Zener à 15 V"), fmt(iz(5) / 1000, "A")], [T("Verlustleistung R1 bei 15 V", "Puissance dans R1"), fmt(Math.pow(15 - Vz, 2) / Rv, "W")]],
      live: function(){ return { leds: [1], names: [T("Ausgang stabil", "Sortie stable")] }; } }; },
  wire: [["Eingang → 220 Ω → Ausgangsknoten", "Entrée → 220 Ω → nœud de sortie"], ["Z-Diode vom Ausgangsknoten nach GND – Kathode (Strich) zeigt zum Ausgang", "Zener : cathode (trait) vers la sortie"], ["Last (1 kΩ) parallel zur Z-Diode", "Charge en parallèle de la Zener"]],
  notes: [["Die Z-Diode braucht immer etwas Mindeststrom (ca. 5 mA) – sonst bricht sie nicht sauber durch.", "La Zener doit toujours avoir un courant minimal."], ["Für stärkere Lasten setzt man einen Transistor als Emitterfolger dahinter oder nimmt gleich einen LM7805.", "Pour plus de courant : transistor suiveur ou LM7805."], ["Bei 15 V wird der 220-Ω-Widerstand mit ca. 0,45 W belastet – nimm dafür einen 1-W-Typ, sonst wird er heiß.", "À 15 V la résistance dissipe ≈ 0,45 W : prendre 1 W."]] };
PROJ.k_bistabil = { t: ["Bistabiler Speicher: 555 als Flip-Flop (Set / Reset)", "Bascule : 555 en flip-flop (Set / Reset)"], flow: ["Taster Set", "555 merkt sich: Ausgang HIGH", "Taster Reset", "Ausgang LOW"], ics: ["ne555"],
  d: ["Der 555 kann auch als Ein-Bit-Speicher arbeiten: Pin 6 liegt fest auf GND, Pin 2 (Trigger) und Pin 4 (Reset) hängen über 10 kΩ an +V. Ein kurzer Druck auf „Set“ zieht Pin 2 nach unten – der Ausgang geht auf HIGH und BLEIBT dort, auch wenn du loslässt. Erst „Reset“ (Pin 4 nach GND) setzt ihn zurück. So baut man eine Tipp-Schaltung mit Selbsthaltung ganz ohne weiteres IC.", "Le 555 peut mémoriser un bit : Set (broche 2 à GND) met la sortie à HAUT, Reset (broche 4 à GND) la remet à BAS."],
  build: function(){ var ev = [[1, 1.4, "s"], [3, 3.4, "r"], [5, 5.4, "s"], [6.6, 7, "r"]]; function out(t){ var o = 0; ev.forEach(function(e){ if (t >= e[0]) o = e[2] === "s" ? 1 : 0; }); return o; }
    function pr(kind){ return function(t){ for (var i = 0; i < ev.length; i++) if (ev[i][2] === kind && t >= ev[i][0] && t < ev[i][1]) return 0; return 5; }; }
    return { span: 8, speed: 1, warn: [], ch: [{ n: T("Pin 2 (TRIG) – Taster Set", "Broche 2 – Set"), c: C.amber, lo: 0, hi: 5, v: pr("s") }, { n: T("Pin 4 (RESET) – Taster Reset", "Broche 4 – Reset"), c: C.violet, lo: 0, hi: 5, v: pr("r") }, { n: T("Ausgang Pin 3 (gespeichert)", "Sortie (mémorisée)"), c: C.green, lo: 0, hi: 5, v: function(t){ return out(t) * 5; } }],
      info: [[T("Speicher", "Mémoire"), T("1 Bit (Selbsthaltung)", "1 bit")], [T("Ruhezustand", "Repos"), T("beide Eingänge HIGH – Ausgang bleibt, wie er war", "sortie inchangée")]],
      live: function(ts){ return { leds: [out(ts % 8)], names: [T("LED (Zustand)", "LED (état)")] }; } }; },
  wire: [["Pin 8 → +V; Pin 1 und Pin 6 → GND; Pin 7 bleibt frei", "Broche 8 → +V ; 1 et 6 → GND ; 7 libre"], ["Pin 2 über 10 kΩ an +V und über Taster „Set“ nach GND", "Broche 2 : 10 kΩ vers +V, bouton Set vers GND"], ["Pin 4 über 10 kΩ an +V und über Taster „Reset“ nach GND", "Broche 4 : 10 kΩ vers +V, bouton Reset vers GND"], ["Pin 5 → 10 nF → GND; Pin 3 → 330 Ω → LED → GND", "Broche 5 → 10 nF ; sortie → 330 Ω → LED"]],
  notes: [["Das ist dieselbe Idee wie bei einer Alarmanlage mit Selbsthaltung: einmal ausgelöst, bleibt sie an, bis jemand Reset drückt.", "Même principe qu’une alarme à verrouillage."], ["Entprellte Taster sind hier nicht nötig – der 555 reagiert nur auf die erste Flanke.", "Pas besoin d’anti-rebond."]] };
PROJ.k_schmitt = { t: ["Schmitt-Trigger mit dem 555 (Hysterese)", "Trigger de Schmitt avec le 555 (hystérésis)"], flow: ["Langsame Eingangsspannung", "Pin 2 + 6 zusammen", "Schwellen 1/3 und 2/3", "Sauberer Ausgang"], ics: ["ne555"],
  opts: [{ k: "u", l: ["Versorgung", "Alimentation"], o: [["5", "5 V"], ["9", "9 V"], ["12", "12 V"]], def: "9" }],
  d: ["Verbindet man die Eingänge Trigger (Pin 2) und Threshold (Pin 6), wird der 555 zum Schmitt-Trigger: Der Ausgang schaltet auf LOW, sobald die Eingangsspannung 2/3 der Versorgung übersteigt, und erst wieder auf HIGH, wenn sie unter 1/3 fällt. Dazwischen (Hysterese!) ändert sich nichts – langsames, verrauschtes Eingangssignal wird so zu einem sauberen Rechteck.", "Pins 2 et 6 reliées : le 555 devient un trigger de Schmitt. Sortie BAS au-dessus de 2/3 U, HAUT sous 1/3 U."],
  build: function(P){ var U = parseFloat(P.u) || 9, per = 10;
    function ui(t){ var x = (t % per) / (per / 2); return U * (x < 1 ? x : 2 - x); }
    function out(t){ var x = t % per; return x < per / 3 ? 1 : x < per * 5 / 6 ? 0 : 1; }
    return { span: 20, speed: 1, warn: [], ch: [{ n: T("Eingang (langsames Dreieck)", "Entrée (triangle lent)"), c: C.amber, lo: 0, hi: 13, v: ui }, { n: T("Schwelle oben = 2/3 U", "Seuil haut"), c: C.violet, lo: 0, hi: 13, v: function(){ return U * 2 / 3; } }, { n: T("Schwelle unten = 1/3 U", "Seuil bas"), c: C.cyan, lo: 0, hi: 13, v: function(){ return U / 3; } },
      { n: T("Ausgang (invertiert)", "Sortie (inversée)"), c: C.green, lo: 0, hi: 13, v: function(t){ return out(t) * U; } }],
      info: [[T("Obere Schwelle", "Seuil haut"), fmt(U * 2 / 3, "V")], [T("Untere Schwelle", "Seuil bas"), fmt(U / 3, "V")], [T("Hysterese", "Hystérésis"), fmt(U / 3, "V")]],
      live: function(ts){ return { leds: [out(ts)], names: [T("LED (Ausgang)", "LED (sortie)")] }; } }; },
  wire: [["Eingangssignal → Pin 2 UND Pin 6 (beide zusammen)", "Signal → broches 2 ET 6"], ["Pin 8 und Pin 4 → +V; Pin 1 → GND; Pin 5 → 10 nF → GND", "Broches 8 et 4 → +V ; 1 → GND ; 5 → 10 nF"], ["Pin 3 → 330 Ω → LED → GND", "Sortie → 330 Ω → LED"]],
  notes: [["Der Ausgang ist invertiert: Eingang niedrig = Ausgang HIGH. Mit einem Poti am Eingang wird daraus ein einfacher Dämmerungsschalter.", "Sortie inversée ; avec LDR : interrupteur crépusculaire."], ["Den Eingang nicht über +V oder unter GND treiben – der 555 hat keinen Überspannungsschutz.", "Ne pas dépasser +V ni GND."]] };
var KICON = { k_lauf: "💡", k_uhr: "🕒", k_zaehl: "🔢", k_daemm: "🌗", k_prell: "🔘", k_sirene: "🚨", k_motor: "⚙️", k_relais: "🔌", k_bau: "🧱", k_ampel: "🚦", k_thermo: "🌡️", k_netz: "🔋", k_wuerfel: "🎲", k_alarm: "🔦", k_wechsel: "🔁", k_verz: "⏳", k_touch: "☝️", k_strom: "🎚️", k_zreg: "🔰", k_bistabil: "🧠", k_schmitt: "📐" };
function icById(id){ for (var i = 0; i < ICS.length; i++) if (ICS[i].id === id) return ICS[i]; return null; }
function icOfProj(pid){ for (var i = 0; i < ICS.length; i++) if (ICS[i].proj.indexOf(pid) >= 0) return ICS[i]; return null; }

/* ---------- Projekt anzeigen ---------- */
var LIVE = { tok: 0, raf: 0 }, AUD = null;
function stopAudio(){ if (AUD){ try { AUD.o.stop(); AUD.ac.close(); } catch(e){} AUD = null; } }
function stopLive(){ LIVE.tok++; cancelAnimationFrame(LIVE.raf); stopAudio(); }
function sliderRow(p, P, onchg){
  var row = el("label", "ic-sl"), nm = el("span", "ic-sn", T(p.l[0], p.l[1])), inp = el("input"), out = el("output", "ic-so"); inp.type = "range"; inp.min = 0; inp.max = 1000; inp.step = 1;
  function toX(v){ var t = p.log ? Math.log(v / p.min) / Math.log(p.max / p.min) : (v - p.min) / (p.max - p.min); return Math.round(clamp(t, 0, 1) * 1000); }
  function toV(x){ var t = x / 1000, v = p.log ? p.min * Math.pow(p.max / p.min, t) : p.min + (p.max - p.min) * t; if (p.e12) v = e12(v); if (p.int) v = Math.round(v); return v; }
  function show(){ out.textContent = p.u ? fmt(P[p.k], p.u) : (+P[p.k].toFixed(2)).toString().replace(".", ","); }
  inp.value = toX(P[p.k]); show(); inp.oninput = function(){ P[p.k] = toV(+inp.value); show(); onchg(); };
  row.sync = function(){ inp.value = toX(P[p.k]); show(); }; row.setL = function(s){ nm.textContent = s; }; row.appendChild(nm); row.appendChild(inp); row.appendChild(out); row.setV = function(v){ P[p.k] = v; inp.value = toX(v); show(); onchg(); }; return row;
}
function renderProject(host, pid, icsO){
  stopLive(); host.innerHTML = "";
  var pr = PROJ[pid], P = {}, saved = sv("p_" + pid) || {}, ctx = { ts: 0, fire: null, res: null, pid: pid }, rows = {};
  (pr.params || []).forEach(function(p){ P[p.k] = saved[p.k] != null ? clamp(saved[p.k], p.min, p.max) : p.def; });
  (pr.opts || []).forEach(function(o){ var sv0 = saved[o.k]; P[o.k] = sv0 != null && o.o.some(function(x){ return x[0] === sv0; }) ? sv0 : o.def; });
  if (pr.init) pr.init(P);
  ctx.setP = function(k, v){ if (rows[k]) rows[k].setV(v); };
  host.appendChild(el("h2", "ic-pt", esc(T(pr.t[0], pr.t[1]))));
  host.appendChild(el("p", "ic-pd", esc(T(pr.d[0], pr.d[1]))));
  var fl = el("div", "ic-flow"); pr.flow.forEach(function(x, i){ if (i) fl.appendChild(el("span", "ic-ar", "→")); fl.appendChild(el("span", "ic-fb", esc(x))); }); host.appendChild(fl);
  if (pr.ics){ var lk = el("div", "ic-chips"); lk.appendChild(el("span", "ic-lb", T("Daten zu den ICs:", "Données des CI :"))); (icsO || pr.ics).forEach(function(i){ var a = el("a", "ic-ch", esc(icById(i).name)); a.href = "index.html#/s/" + LINK[i]; lk.appendChild(a); }); host.appendChild(lk); }
  if (RECH[pid] && KOMBI.indexOf(pid) < 0){ var rk = el("div", "ic-chips ic-rk"); var ra = el("a", "ic-ch ic-rch", "🧮 " + esc(T("Mehr dazu im Elektronik-Rechner", "Plus dans le calculateur"))); ra.href = "elektro.html#" + RECH[pid]; rk.appendChild(ra); host.appendChild(rk); }
  var lab = el("div", "ic-lab"), colL = el("div", "ic-labL"), colR = el("div", "ic-labR"); host.appendChild(lab); lab.appendChild(colL); lab.appendChild(colR);
  var ctl = el("div", "ic-ctl");
  var vwBox = null, vwMode = sv("vw") === "t" ? "t" : "s", vwTabs = null;
  if (NL[pid]){ vwTabs = el("div", "ic-chips ic-vt"); vwBox = el("div", "ic-vw");
    [["s", T("Schaltplan", "Schéma")], ["t", T("Anschlüsse", "Connexions")]].forEach(function(x){ var b = el("button", "ic-ch" + (vwMode === x[0] ? " on" : ""), esc(x[1])); b.type = "button"; b.onclick = function(){ vwMode = x[0]; st("vw", vwMode); vwTabs.querySelectorAll("button").forEach(function(y){ y.classList.remove("on"); }); b.classList.add("on"); drawView(); }; vwTabs.appendChild(b); });
    var zg = el("span", "ic-zm"), zb = function(l, tt, fn){ var b = el("button", "ic-ch ic-zb", l); b.type = "button"; b.title = tt; b.setAttribute("aria-label", tt); b.onclick = fn; zg.appendChild(b); return b; };
    zb("−", T("Verkleinern", "Réduire"), function(){ zoomStep(-1); }); zb("⤢", T("Ganzen Schaltplan anzeigen", "Tout le schéma"), function(){ st("zm", "fit"); applyZoom(); }); zb("+", T("Vergrößern", "Agrandir"), function(){ zoomStep(1); }); vwTabs.appendChild(zg);
    colL.appendChild(vwTabs); colL.appendChild(vwBox); }
  var ZL = [.45, .6, .75, .9, 1, 1.25, 1.6, 2.1];
  function zoomMode(){ var z = sv("zm"); return z === "fit" || typeof z === "number" ? z : (window.innerWidth <= 900 ? "fit" : 1); }
  function applyZoom(){ if (!vwBox || vwMode !== "s") return; var s = vwBox.querySelector("svg.ic-sch"); if (!s) return; var W = s.viewBox.baseVal.width, z = zoomMode();
    if (z === "fit"){ s.style.minWidth = "0"; s.style.width = "100%"; s.style.maxWidth = Math.round(W * 1.35) + "px"; }
    else if (z === 1){ s.style.minWidth = Math.min(W, 760) + "px"; s.style.width = "100%"; s.style.maxWidth = W + "px"; }
    else { s.style.minWidth = Math.round(W * z) + "px"; s.style.width = Math.round(W * z) + "px"; s.style.maxWidth = "none"; }
    s.style.margin = "0 auto"; }
  function zoomStep(d){ var s = vwBox && vwBox.querySelector("svg.ic-sch"); if (!s) return; var W = s.viewBox.baseVal.width, cur = s.getBoundingClientRect().width / W, n = cur, i;
    if (d > 0){ for (i = 0; i < ZL.length; i++) if (ZL[i] > cur * 1.04){ n = ZL[i]; break; } if (n === cur) n = ZL[ZL.length - 1]; }
    else { for (i = ZL.length - 1; i >= 0; i--) if (ZL[i] < cur * .96){ n = ZL[i]; break; } if (n === cur) n = ZL[0]; }
    st("zm", n); applyZoom(); }
  colL.appendChild(ctl);
  function drawView(){ if (!vwBox) return; var A; try { A = netAnalyse(pid, P); vwBox.innerHTML = vwMode === "s" ? '<div class="ic-sw">' + (LAY[pid] ? schem2(A, LAY[pid]) : renderSchem(A)) + "</div>" : netText(A); wireHL(vwBox); applyZoom(); } catch(e){ vwBox.innerHTML = '<p class="ic-warn">' + esc(String(e && e.message || e)) + "</p>"; if (window.console) console.error(e); } }
  var moreBox = el("div", "ic-more"), cust = null, area = el("div"), scBox = el("div", "ic-scopebox"), cnv = el("canvas"), liveBox = el("div", "ic-live"), warnBox = el("div"), infoBox = el("div", "ic-info");
  var view = "t", bcv = el("canvas"), vbar = el("div", "ic-chips"), vbs = [el("button", "ic-ch on", "⏱ " + T("Zeit", "Temps")), el("button", "ic-ch", "📉 " + T("Frequenzgang", "Réponse en fréquence"))];
  vbs.forEach(function(b, i){ b.type = "button"; b.onclick = function(){ view = i ? "f" : "t"; redraw(); }; vbar.appendChild(b); }); vbar.hidden = true;
  function save(){ st("p_" + pid, P); }
  function redraw(){
    if (pr.ui){ var uu = pr.ui(P); (pr.dyn || []).forEach(function(k){ var r = rows[k]; if (r){ r.hidden = uu[k] == null; if (uu[k] != null) r.setL(uu[k]); } }); }
    Object.keys(rows).forEach(function(k){ if (rows[k].sync) rows[k].sync(); });
    save();
    var res = pr.build ? pr.build(P, ctx) : {}; ctx.res = res;
    vbar.hidden = !res.bode; if (!res.bode) view = "t"; var fv = view === "f" && res.bode; cnv.hidden = !!fv; bcv.hidden = !fv; vbs[0].classList.toggle("on", !fv); vbs[1].classList.toggle("on", !!fv);
    if (res.ch){ scBox.hidden = false; if (fv) bodeAn(bcv, res.bode); else scope(cnv, res.ch, res.span, res.cur, res.tl); } else scBox.hidden = true;
    var solo = !res.ch && !res.live; lab.classList.toggle("solo", solo); if (pb) pb.hidden = solo; if (oszH) oszH.hidden = !res.ch;
    warnBox.innerHTML = (res.warn || []).map(function(w){ return '<p class="ic-warn">⚠️ ' + esc(w) + "</p>"; }).join("");
    infoBox.innerHTML = res.info ? "<table>" + res.info.map(function(r){ return "<tr><th>" + esc(r[0]) + "</th><td>" + esc(r[1] || "") + "</td></tr>"; }).join("") + "</table>" : "";
    liveBox.innerHTML = ""; ctx.led = null; ctx.seg = null; ctx.sig = null; ctx.note = null;
    if (res.live) liveBox.hidden = false; else liveBox.hidden = true;
    if (cust && cust.after) cust.after(res);
    moreBox.innerHTML = ""; if (res.more){ var mo = res.more, mh = "<details class=\"ic-mo\" open><summary>📖 " + esc(T("Erklärung, Formel und Hinweise", "Explication, formule et conseils")) + "</summary><p>" + esc(T(mo.d[0], mo.d[1])) + "</p><p><code>" + esc(mo.f) + "</code></p>" + (mo.notes && mo.notes.length ? "<ul>" + mo.notes.map(function(n){ return "<li>" + esc(T(n[0], n[1])) + "</li>"; }).join("") + "</ul>" : "") + "</details>"; moreBox.innerHTML = mh; }
    drawView();
  }
  (pr.params || []).forEach(function(p){ if (KOMBI.indexOf(pid) >= 0 && (p.u === "Ω" || p.u === "F")) return; var r = sliderRow(p, P, redraw); rows[p.k] = r; ctl.appendChild(r); });
  (pr.opts || []).forEach(function(o){ var w = el("div", "ic-chips"); w.appendChild(el("span", "ic-lb", esc(T(o.l[0], o.l[1])))); o.o.forEach(function(x){ var b = el("button", "ic-ch" + (P[o.k] === x[0] ? " on" : ""), esc(typeof x[1] === "string" ? x[1] : T(x[1][0], x[1][1]))); b.type = "button"; b.onclick = function(){ P[o.k] = x[0]; if (pr.onOpt) pr.onOpt(P, o.k); w.querySelectorAll("button").forEach(function(y){ y.classList.remove("on"); }); b.classList.add("on"); redraw(); }; w.appendChild(b); }); ctl.appendChild(w); });
  if (pr.action){ var ab = el("button", "ic-act", esc(T(pr.action.l[0], pr.action.l[1]))); ab.type = "button";
    ab.onclick = function(){ ctx.fire = ctx.ts; if (pr.onAction) pr.onAction(ctx);
      if (pid === "k_sirene"){ if (AUD) stopAudio(); else { try { var ac = new (window.AudioContext || window.webkitAudioContext)(), o = ac.createOscillator(), g = ac.createGain(); o.type = "square"; g.gain.value = .05; o.connect(g); g.connect(ac.destination); o.start(); AUD = { ac: ac, o: o }; } catch(e){} } ab.classList.toggle("on", !!AUD); }
      redraw(); }; colL.appendChild(ab); }
  colL.appendChild(area);
  if (pr.custom) cust = CUST[pr.custom](area, P, ctx, redraw);
  var pb = el("div", "ic-play"), bPause = el("button", "ic-ch", "⏸ " + T("Pause", "Pause")), bPow = el("button", "ic-ch on", "⏻ " + T("Ein", "Marche")), bRst = el("button", "ic-ch", "↺ " + T("Neustart", "Redémarrer"));
  [bPause, bPow, bRst].forEach(function(b){ b.type = "button"; pb.appendChild(b); });
  bPause.onclick = function(){ ctx.pause = !ctx.pause; bPause.innerHTML = ctx.pause ? "▶ " + T("Weiter", "Reprendre") : "⏸ " + T("Pause", "Pause"); bPause.classList.toggle("on", !!ctx.pause); };
  bPow.onclick = function(){ ctx.off = !ctx.off; bPow.innerHTML = "⏻ " + (ctx.off ? T("Aus", "Arrêt") : T("Ein", "Marche")); bPow.classList.toggle("on", !ctx.off); scBox.classList.toggle("off", !!ctx.off); liveBox.classList.toggle("off", !!ctx.off); if (ctx.off) stopAudio(); };
  bRst.onclick = function(){ ctx.ts = 0; ctx.fire = null; };
  var oszH = el("div", "ic-h3 ic-osz", "📈 " + T("Oszilloskop", "Oscilloscope")); colR.appendChild(oszH); colR.appendChild(vbar); colR.appendChild(scBox); scBox.appendChild(cnv); scBox.appendChild(bcv); bcv.hidden = true; scBox.appendChild(el("div", "ic-offl", T("Versorgung aus", "Alimentation coupée"))); colR.appendChild(pb); colR.appendChild(liveBox); colR.appendChild(warnBox); colR.appendChild(infoBox);
  host.appendChild(moreBox);
  redraw();
  if (pr.forms && pr.forms.length){ host.appendChild(el("h3", "ic-h3", "📐 " + T("Formeln", "Formules"))); var uf = el("ul", "ic-wire ic-forms"); pr.forms.forEach(function(f){ uf.appendChild(el("li", "", "<code>" + esc(f) + "</code>")); }); host.appendChild(uf); }
  if (pr.wire){ host.appendChild(el("h3", "ic-h3", "🔌 " + T("Verdrahtung", "Câblage"))); var ul = el("ol", "ic-wire"); pr.wire.forEach(function(w){ ul.appendChild(el("li", "", esc(T(w[0], w[1])))); }); host.appendChild(ul); }
  if (pr.notes){ host.appendChild(el("h3", "ic-h3", "💡 " + T("Gut zu wissen", "Bon à savoir"))); var u2 = el("ul", "ic-wire"); pr.notes.forEach(function(w){ u2.appendChild(el("li", "", esc(T(w[0], w[1])))); }); host.appendChild(u2); }
  // Live-Schleife
  var tok = ++LIVE.tok, last = performance.now(), noteEl = null;
  function frame(now){
    if (tok !== LIVE.tok) return;
    var dt = Math.min(.1, (now - last) / 1000); last = now; var res = ctx.res;
    if (res && res.live){
      var sp = res.speed != null ? res.speed : res.fmain > 3 ? 2 / res.fmain : res.fmain < .3 ? .5 / res.fmain : 1;
      if (!ctx.pause && !ctx.off) ctx.ts += dt * sp; var o = res.live(ctx.ts, ctx); if (ctx.off){ o = { leds: o.leds.map(function(){ return 0; }), names: o.names, cols: o.cols, seg: o.seg != null ? -1 : null }; }
      if (!ctx.sig || ctx.sig !== (o.leds.length + "|" + (o.seg != null))){ liveBox.innerHTML = ""; ctx.sig = o.leds.length + "|" + (o.seg != null); var rw = el("div", "ic-row2"); liveBox.appendChild(rw); ctx.seg = o.seg != null ? seg7(rw) : null; var lw = el("div"); rw.appendChild(lw); ctx.led = o.leds.length ? ledRow(lw, o.leds.length, o.names, o.cols || C.red) : null; ctx.note = el("div", "ic-note"); liveBox.appendChild(ctx.note); }
      if (ctx.led) ctx.led.set(o.leds); if (ctx.seg) ctx.seg.set(o.seg);
      ctx.note.textContent = Math.abs(sp - 1) < .05 ? T("⏱ echte Zeit", "⏱ temps réel") : sp < 1 ? T("⏱ Zeitlupe ×", "⏱ ralenti ×") + (+sp.toPrecision(2)).toString() : T("⏱ Zeitraffer ×", "⏱ accéléré ×") + Math.round(sp);
    }
    if (AUD && res && res.fAt && !ctx.off && !ctx.pause){ try { AUD.o.frequency.setTargetAtTime(clamp(res.fAt(ctx.ts), 60, 12000), AUD.ac.currentTime, .012); } catch(e){} }
    LIVE.raf = requestAnimationFrame(frame);
  }
  LIVE.raf = requestAnimationFrame(frame);
  if (window.ResizeObserver){ var ro = new ResizeObserver(function(){ if (tok === LIVE.tok && ctx.res && ctx.res.ch && !bcv.hidden){ bodeAn(bcv, ctx.res.bode); } else if (tok === LIVE.tok && ctx.res && ctx.res.ch){ var w0 = cnv.parentNode.clientWidth; if (w0 && Math.abs(w0 - (parseFloat(cnv.style.width) || 0)) > 2) scope(cnv, ctx.res.ch, ctx.res.span, ctx.res.cur, ctx.res.tl); } }); ro.observe(scBox); }
}

/* ---------- Seiten: eine Sammlung aller Schaltungen ---------- */
var ALLB = [["Analog-ICs","CI analogiques","Operationsverstärker & Komparatoren","Amplis op & comparateurs","Operationsverstärker","Grundschaltungen, Verstärkung, Typen","opamp","opamp","bt_analog/opamp"],["Analog-ICs","CI analogiques","Operationsverstärker & Komparatoren","Amplis op & comparateurs","LM358","2 × Operationsverstärker (Single-Supply)","opamp","analog_lm358","bt_analog/analog_lm358"],["Analog-ICs","CI analogiques","Operationsverstärker & Komparatoren","Amplis op & comparateurs","LM324","4 × Operationsverstärker (Single-Supply)","opamp","analog_lm324","bt_analog/analog_lm324"],["Analog-ICs","CI analogiques","Operationsverstärker & Komparatoren","Amplis op & comparateurs","TL072","2 × Operationsverstärker mit JFET-Eingang, rauscharm","opamp","analog_tl072","bt_analog/analog_tl072"],["Analog-ICs","CI analogiques","Operationsverstärker & Komparatoren","Amplis op & comparateurs","NE5532","2 × rauscharmer Audio-Operationsverstärker","opamp","analog_ne5532","bt_analog/analog_ne5532"],["Analog-ICs","CI analogiques","Operationsverstärker & Komparatoren","Amplis op & comparateurs","LM741","Operationsverstärker (Klassiker)","opamp","analog_lm741","bt_analog/analog_lm741"],["Analog-ICs","CI analogiques","Operationsverstärker & Komparatoren","Amplis op & comparateurs","LM393","2 × Komparator (Open-Collector-Ausgang)","lm393","analog_lm393","bt_analog/analog_lm393"],["Analog-ICs","CI analogiques","Operationsverstärker & Komparatoren","Amplis op & comparateurs","TL071","1 × Operationsverstärker, JFET-Eingang","opamp","analog_tl071","bt_analog/analog_tl071"],["Analog-ICs","CI analogiques","Operationsverstärker & Komparatoren","Amplis op & comparateurs","TL074","4 × Operationsverstärker, JFET-Eingang","opamp","analog_tl074","bt_analog/analog_tl074"],["Analog-ICs","CI analogiques","Operationsverstärker & Komparatoren","Amplis op & comparateurs","MCP6002","2 × Rail-to-Rail-Operationsverstärker (1,8–6 V)","opamp","analog_mcp6002","bt_analog/analog_mcp6002"],["Analog-ICs","CI analogiques","Operationsverstärker & Komparatoren","Amplis op & comparateurs","LM339","4 × Komparator","lm339","analog_lm339","bt_analog/analog_lm339"],["Analog-ICs","CI analogiques","Operationsverstärker & Komparatoren","Amplis op & comparateurs","AD620","Instrumentenverstärker","ad620","analog_ad620","bt_analog/analog_ad620"],["Analog-ICs","CI analogiques","Operationsverstärker & Komparatoren","Amplis op & comparateurs","Opamp ↔ Komparator","Wann Opamp, wann Komparator?","opamp","analog_lm393-vergleich","bt_analog/analog_lm393-vergleich"],["Analog-ICs","CI analogiques","Operationsverstärker & Komparatoren","Amplis op & comparateurs","Opamp-Verzeichnis","Gängige Operationsverstärker im Vergleich","opamp","analog_vopamp","bt_analog/analog_vopamp"],["Analog-ICs","CI analogiques","Operationsverstärker & Komparatoren","Amplis op & comparateurs","Komparatoren und Referenzen","Wichtige Komparatoren, Timer und Spannungsreferenzen","lm393","analog_vkomp","bt_analog/analog_vkomp"],["Analog-ICs","CI analogiques","Timer, Audio & Sensor-ICs","Timers, audio et CI capteurs","LM386","Niederspannungs-Audio-Leistungsverstärker","lm386","analog_lm386","bt_analog/analog_lm386"],["Analog-ICs","CI analogiques","Timer, Audio & Sensor-ICs","Timers, audio et CI capteurs","NE555","Timer (Oszillator, Monoflop)","ne555a","analog_ne555","bt_analog/analog_ne555"],["Analog-ICs","CI analogiques","Timer, Audio & Sensor-ICs","Timers, audio et CI capteurs","NE556","2 × 555 in einem Gehäuse","ne556","analog_ne556","bt_analog/analog_ne556"],["Analog-ICs","CI analogiques","Timer, Audio & Sensor-ICs","Timers, audio et CI capteurs","TDA2030","Audio-Endstufe, ca. 14 W","lm386","analog_tda2030","bt_analog/analog_tda2030"],["Analog-ICs","CI analogiques","Timer, Audio & Sensor-ICs","Timers, audio et CI capteurs","LM35","Temperatursensor, analog (10 mV/°C)","lm35","analog_lm35","bt_analog/analog_lm35"],["Analog-ICs","CI analogiques","Timer, Audio & Sensor-ICs","Timers, audio et CI capteurs","TMP36","Temperatursensor, analog (10 mV/°C, 750 mV bei 25 °C)","lm35","analog_tmp36","bt_analog/analog_tmp36"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7400","4 × NAND-Gatter (je 2 Eingänge)","hc00","7400","bt_ic/logik_7400"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7402","4 × NOR-Gatter (je 2 Eingänge)","hc00","7402","bt_ic/logik_7402"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7404","6 × Inverter (NICHT)","hc00","7404","bt_ic/logik_7404"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7408","4 × AND-Gatter (je 2 Eingänge)","hc00","7408","bt_ic/logik_7408"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7432","4 × OR-Gatter (je 2 Eingänge)","hc00","7432","bt_ic/logik_7432"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7486","4 × XOR-Gatter (je 2 Eingänge)","hc00","7486","bt_ic/logik_7486"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7410","3 × NAND-Gatter (je 3 Eingänge)","hc00","7410","bt_ic/logik_7410"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7411","3 × AND-Gatter (je 3 Eingänge)","hc00","7411","bt_ic/logik_7411"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7427","3 × NOR-Gatter (je 3 Eingänge)","hc00","7427","bt_ic/logik_7427"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7420","2 × NAND-Gatter (je 4 Eingänge)","hc00","7420","bt_ic/logik_7420"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7430","1 × NAND-Gatter mit 8 Eingängen","hc00","7430","bt_ic/logik_7430"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7414","6 × Inverter mit Schmitt-Trigger","hc00","7414","bt_ic/logik_7414"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74132","4 × NAND mit Schmitt-Trigger (je 2 Eingänge)","hc00","74132","bt_ic/logik_74132"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7406","6 × Inverter, Open-Collector","hc00","7406","bt_ic/logik_7406"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7407","6 × Puffer, Open-Collector","hc00","7407","bt_ic/logik_7407"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74125","4 × Puffer mit Tri-State-Ausgang","hc00","74125","bt_ic/logik_74125"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7403","4 × NAND-Gatter, Open-Collector","hc00","7403","bt_ic/logik_7403"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7409","4 × AND-Gatter, Open-Collector","hc00","7409","bt_ic/logik_7409"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7437","4 × NAND-Gatter mit Leistungsausgang (Buffer)","hc00","7437","bt_ic/logik_7437"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7428","4 × NOR-Gatter mit Leistungsausgang (Buffer)","hc00","7428","bt_ic/logik_7428"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7433","4 × NOR-Gatter, Open-Collector","hc00","7433","bt_ic/logik_7433"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7405","6 × Inverter, Open-Collector","hc00","7405","bt_ic/logik_7405"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC04","6 × Inverter (HC-Variante)","hc00","74hc04","bt_ic/logik_74HC04"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7412","3 × NAND-Gatter, 3 Eingänge, Open-Collector","hc00","7412","bt_ic/logik_7412"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7421","2 × AND-Gatter mit 4 Eingängen","hc00","7421","bt_ic/logik_7421"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7440","2 × NAND-Gatter, 4 Eingänge, Leistungsausgang","hc00","7440","bt_ic/logik_7440"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC02","4 × NOR-Gatter (HC-Variante)","hc00","74hc02","bt_ic/logik_74HC02"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC14","6 × Schmitt-Trigger-Inverter (HC)","hc14","logik_74hc14","bt_ic/logik_74hc14"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC08","4 × AND-Gatter (HC)","hc00","74hc08","bt_ic/logik_74hc08"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC32","4 × OR-Gatter (HC)","hc00","74hc32","bt_ic/logik_74hc32"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC86","4 × XOR-Gatter (HC)","hc00","74hc86","bt_ic/logik_74hc86"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74LVC1G00","1 × NAND-Gatter (SOT-23-5)","hc00","74lvc1g00","bt_ic/logik_74lvc1g00"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74LVC1G04","1 × Inverter (SOT-23-5)","hc00","74lvc1g04","bt_ic/logik_74lvc1g04"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74LVC1G08","1 × AND-Gatter (SOT-23-5)","hc00","74lvc1g08","bt_ic/logik_74lvc1g08"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74LVC1G14","1 × Schmitt-Trigger-Inverter (SOT-23-5)","hc00","74lvc1g14","bt_ic/logik_74lvc1g14"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74LVC1G17","1 × Schmitt-Trigger-Puffer (SOT-23-5)","hc00","74lvc1g17","bt_ic/logik_74lvc1g17"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74LVC1G125","1 × Puffer mit Tri-State (SOT-23-5)","hc00","74lvc1g17","bt_ic/logik_74lvc1g125"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7474","2 × D-Flip-Flop mit Preset und Clear","hc74","speicher_7474","bt_ic/speicher_7474"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7476","2 × JK-Flip-Flop (Master-Slave) mit Preset und Clear","hc74","speicher_7476","bt_ic/speicher_7476"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74112","2 × JK-Flip-Flop, fallende Flanke, Preset und Clear","hc74","speicher_74112","bt_ic/speicher_74112"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC161","4-Bit-Binärzähler, synchron, Parallel-Laden","hc160","speicher_74161","bt_ic/speicher_74161"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC193","4-Bit-Zähler vorwärts/rückwärts (UP/DOWN)","hc193","speicher_74193","bt_ic/speicher_74193"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7490","Dekadenzähler (÷2 und ÷5)","hc160","speicher_7490","bt_ic/speicher_7490"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC164","8-Bit-Schieberegister, seriell ein, parallel aus","hc164","speicher_74164","bt_ic/speicher_74164"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC165","8-Bit-Schieberegister, parallel ein, seriell aus","hc165","speicher_74165","bt_ic/speicher_74165"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC595","8-Bit-Schieberegister mit Speicher (seriell ein, parallel aus)","hc595","speicher_74595","bt_ic/speicher_74595"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC573","8-fach Latch (transparent) mit Tri-State-Ausgängen","hc573","speicher_74573","bt_ic/speicher_74573"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC574","8-fach D-Flip-Flop mit Tri-State-Ausgängen","hc573","speicher_74574","bt_ic/speicher_74574"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74163 / 74HC163","4-Bit-Binärzähler, synchron (Clear synchron)","hc160","speicher_74163","bt_ic/speicher_74163"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74160 / 74HC160","Dezimalzähler 0…9, synchron","hc160","speicher_74160","bt_ic/speicher_74160"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7493","4-Bit-Binärzähler (asynchron)","cd4040","speicher_7493","bt_ic/speicher_7493"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74175 / 74HC175","4 × D-Flip-Flop mit gemeinsamem Takt und Clear","hc74","speicher_74175","bt_ic/speicher_74175"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74373 / 74HC373","8-Bit-Latch (transparent) mit Tri-State","hc573","speicher_74373","bt_ic/speicher_74373"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74374 / 74HC374","8-Bit-D-Flip-Flop (taktgesteuert) mit Tri-State","hc573","speicher_74374","bt_ic/speicher_74374"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74194 / 74HC194","4-Bit-Schieberegister (universal, 2 Richtungen)","hc164","speicher_74194","bt_ic/speicher_74194"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC138","3-zu-8-Dekoder / Demultiplexer","hc138","decoder_74138","bt_ic/decoder_74138"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC139","2 × 2-zu-4-Dekoder","hc138","decoder_74139","bt_ic/decoder_74139"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC151","8-zu-1-Multiplexer","cd4051","decoder_74151","bt_ic/decoder_74151"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC157","4 × 2-zu-1-Multiplexer","cd4051","decoder_74157","bt_ic/decoder_74157"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7447","BCD-zu-7-Segment-Dekoder/Treiber (gemeinsame Anode)","cd4511","decoder_7447","bt_ic/decoder_7447"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC245","8-Bit-Bus-Transceiver (3-State)","hc245","decoder_74245","bt_ic/decoder_74245"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74HC541","8-fach Puffer/Treiber (3-State), nicht invertierend","hc245","decoder_74541","bt_ic/decoder_74541"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7485 / 74HC85","4-Bit-Größenvergleicher (Komparator)","adder","decoder_7485","bt_ic/decoder_7485"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7483","4-Bit-Volladdierer","adder","decoder_7483","bt_ic/decoder_7483"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74283 / 74HC283","4-Bit-Volladdierer (Standard-Pinbelegung)","adder","decoder_74283","bt_ic/decoder_74283"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7442 / 74HC42","BCD-zu-Dezimal-Dekoder (1-aus-10)","hc138","decoder_7442","bt_ic/decoder_7442"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74154","4-zu-16-Dekoder","hc138","decoder_74154","bt_ic/decoder_74154"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74153 / 74HC153","2 × 4-zu-1-Multiplexer","cd4051","decoder_74153","bt_ic/decoder_74153"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74251 / 74HC251","8-zu-1-Multiplexer mit Tri-State-Ausgang","cd4051","decoder_74251","bt_ic/decoder_74251"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74244 / 74HC244","8-Bit-Bus-Treiber (nicht invertierend, Tri-State)","hc245","decoder_74244","bt_ic/decoder_74244"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","74240 / 74HC240","8-Bit-Bus-Treiber (invertierend, Tri-State)","hc245","decoder_74240","bt_ic/decoder_74240"],["Logik-ICs","CI logiques","Logik-ICs 74xx","CI logiques 74xx","7448","BCD-zu-7-Segment-Dekoder (für Common-Kathode)","cd4511","decoder_7448","bt_ic/decoder_7448"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4011","4 × NAND-Gatter (je 2 Eingänge), CMOS","hc00","cd4011","bt_ic/logik_4011"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4001","4 × NOR-Gatter (je 2 Eingänge), CMOS","hc00","cd4001","bt_ic/logik_4001"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4081","4 × AND-Gatter (je 2 Eingänge), CMOS","hc00","cd4081","bt_ic/logik_4081"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4071","4 × OR-Gatter (je 2 Eingänge), CMOS","hc00","cd4071","bt_ic/logik_4071"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4070","4 × XOR-Gatter (je 2 Eingänge), CMOS","hc00","cd4070","bt_ic/logik_4070"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4069","6 × Inverter, CMOS","hc00","cd4069","bt_ic/logik_4069"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4093","4 × NAND mit Schmitt-Trigger (je 2 Eingänge), CMOS","cd4093","logik_4093","bt_ic/logik_4093"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4077","4 × XNOR-Gatter (CMOS)","hc00","cd4077","bt_ic/logik_4077"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4002","2 × NOR-Gatter mit 4 Eingängen (CMOS)","hc00","cd4002","bt_ic/logik_4002"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4012","2 × NAND-Gatter mit 4 Eingängen (CMOS)","hc00","cd4012","bt_ic/logik_4012"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4013","2 × D-Flip-Flop mit Set und Reset, CMOS","cd4013","speicher_4013","bt_ic/speicher_4013"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4017","Dekadenzähler mit 10 Ausgängen (Lauflicht)","cd4017","speicher_4017","bt_ic/speicher_4017"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4094 / 74HC4094","8-Bit-Schieberegister mit Ausgangsspeicher (Strobe)","cd4094","speicher_4094","bt_ic/speicher_4094"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4020","14-Stufen-Binärzähler","cd4020","speicher_4020","bt_ic/speicher_4020"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4040","12-Stufen-Binärzähler","cd4040","speicher_4040","bt_ic/speicher_4040"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4060","14-Stufen-Zähler mit eingebautem Oszillator","cd4060","speicher_4060","bt_ic/speicher_4060"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4511","BCD-zu-7-Segment-Dekoder/Treiber (gemeinsame Kathode)","cd4511","decoder_4511","bt_ic/decoder_4511"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4051","8-Kanal-Analog-Multiplexer / Demultiplexer","cd4051","decoder_4051","bt_ic/decoder_4051"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4066","4 × analoger Schalter (bilateral)","cd4066","decoder_4066","bt_ic/decoder_4066"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4052","2 × 4-Kanal-Analog-Multiplexer","cd4051","decoder_4052","bt_ic/decoder_4052"],["Logik-ICs","CI logiques","Logik-ICs CMOS 4000","CI logiques CMOS 4000","CD4046 / 74HC4046","PLL (Phasenregelschleife) mit VCO","cd4046","decoder_4046","bt_ic/decoder_4046"],["Logik-ICs","CI logiques","Wandler, Speicher & Schnittstellen-ICs","Convertisseurs, mémoires et CI d’interface","MCP3008","8-Kanal-10-Bit-AD-Wandler mit SPI","mcp3008","decoder_mcp3008","bt_ic/decoder_mcp3008"],["Logik-ICs","CI logiques","Wandler, Speicher & Schnittstellen-ICs","Convertisseurs, mémoires et CI d’interface","ADC0804","8-Bit-AD-Wandler, paralleler Ausgang","mcp3008","decoder_adc0804","bt_ic/decoder_adc0804"],["Logik-ICs","CI logiques","Wandler, Speicher & Schnittstellen-ICs","Convertisseurs, mémoires et CI d’interface","DAC0808","8-Bit-DA-Wandler (Stromausgang)","dac0808","decoder_dac0808","bt_ic/decoder_dac0808"],["Logik-ICs","CI logiques","Wandler, Speicher & Schnittstellen-ICs","Convertisseurs, mémoires et CI d’interface","MAX232","RS-232-Pegelwandler (TTL ↔ ±10 V)","max232","decoder_max232","bt_ic/decoder_max232"],["Logik-ICs","CI logiques","Wandler, Speicher & Schnittstellen-ICs","Convertisseurs, mémoires et CI d’interface","PCF8591","8-Bit-AD/DA-Wandler (I²C)","mcp3008","decoder_pcf8591","bt_ic/decoder_pcf8591"],["Logik-ICs","CI logiques","Wandler, Speicher & Schnittstellen-ICs","Convertisseurs, mémoires et CI d’interface","MCP3208","12-Bit-ADC, 8 Kanäle (SPI)","mcp3008","decoder_mcp3208","bt_ic/decoder_mcp3208"],["Logik-ICs","CI logiques","Wandler, Speicher & Schnittstellen-ICs","Convertisseurs, mémoires et CI d’interface","24LC256 (24Cxx)","I²C-EEPROM, 256 kbit","eeprom","module_24lc256","bt_ic/module_24lc256"],["Logik-ICs","CI logiques","Wandler, Speicher & Schnittstellen-ICs","Convertisseurs, mémoires et CI d’interface","W25Q32 / W25Q64","SPI-Flash-Speicher","eeprom","module_w25q","bt_ic/module_w25q"],["Logik-ICs","CI logiques","Wandler, Speicher & Schnittstellen-ICs","Convertisseurs, mémoires et CI d’interface","62256 (32 K × 8 SRAM)","Statischer RAM, 256 kbit","eeprom","module_62256","bt_ic/module_62256"],["Logik-ICs","CI logiques","Wandler, Speicher & Schnittstellen-ICs","Convertisseurs, mémoires et CI d’interface","27C256","EPROM 32 K × 8 (UV-löschbar)","eeprom","module_27c256","bt_ic/module_27c256"],["Logik-ICs","CI logiques","Wandler, Speicher & Schnittstellen-ICs","Convertisseurs, mémoires et CI d’interface","MCP23017","16-Bit-I/O-Erweiterung (I²C)","hc595","module_mcp23017","bt_ic/module_mcp23017"],["Logik-ICs","CI logiques","Wandler, Speicher & Schnittstellen-ICs","Convertisseurs, mémoires et CI d’interface","DS1307","Echtzeituhr (RTC) mit I²C","ds1307","module_ds1307","bt_ic/module_ds1307"],["Logik-ICs","CI logiques","Wandler, Speicher & Schnittstellen-ICs","Convertisseurs, mémoires et CI d’interface","DS3231 (Modul)","Hochgenaue Echtzeituhr mit Temperaturkompensation","ds1307","module_ds3231","bt_ic/module_ds3231"],["Logik-ICs","CI logiques","Wandler, Speicher & Schnittstellen-ICs","Convertisseurs, mémoires et CI d’interface","MAX485","RS-485-Transceiver","max485","module_max485","bt_ic/module_max485"],["Halbleiter","Semi-conducteurs","Dioden, LEDs & Fotobauteile","Diodes, LED et photocomposants","Dioden im Überblick","Si, Schottky, Z, Gleichrichter – Daten und Einsatz","gleich","diode","halbleiter/diode"],["Halbleiter","Semi-conducteurs","Dioden, LEDs & Fotobauteile","Diodes, LED et photocomposants","LEDs & Vorwiderstand","Farben, Flussspannung, Strom, Vorwiderstand berechnen","led","led","halbleiter/led"],["Halbleiter","Semi-conducteurs","Dioden, LEDs & Fotobauteile","Diodes, LED et photocomposants","Z-Diode & Spannungsreferenz","Stabilisieren, begrenzen, Schutz","zdiode","zdiode","halbleiter/zdiode"],["Halbleiter","Semi-conducteurs","Dioden, LEDs & Fotobauteile","Diodes, LED et photocomposants","1N4148","Schnelle Signaldiode","gleich","bauteile_1n4148","halbleiter/bauteile_1n4148"],["Halbleiter","Semi-conducteurs","Dioden, LEDs & Fotobauteile","Diodes, LED et photocomposants","1N4007","Gleichrichterdiode 1 A / 1000 V","gleich","bauteile_1n4007","halbleiter/bauteile_1n4007"],["Halbleiter","Semi-conducteurs","Dioden, LEDs & Fotobauteile","Diodes, LED et photocomposants","1N5819","Schottky-Diode 1 A / 40 V","gleich","bauteile_1n5819","halbleiter/bauteile_1n5819"],["Halbleiter","Semi-conducteurs","Dioden, LEDs & Fotobauteile","Diodes, LED et photocomposants","LED (Standard 5 mm)","Leuchtdiode","led","bauteile_led","halbleiter/bauteile_led"],["Halbleiter","Semi-conducteurs","Dioden, LEDs & Fotobauteile","Diodes, LED et photocomposants","1N5822","Schottky-Diode 40 V, 3 A","gleich","bauteile_1n5822","halbleiter/bauteile_1n5822"],["Halbleiter","Semi-conducteurs","Dioden, LEDs & Fotobauteile","Diodes, LED et photocomposants","SS14 / SS34","Schottky-Diode SMD, 40 V, 1 A / 3 A","gleich","bauteile_ss14","halbleiter/bauteile_ss14"],["Halbleiter","Semi-conducteurs","Dioden, LEDs & Fotobauteile","Diodes, LED et photocomposants","BAT54","Schottky-Kleinsignaldiode, SOT-23","gleich","bauteile_bat54","halbleiter/bauteile_bat54"],["Halbleiter","Semi-conducteurs","Dioden, LEDs & Fotobauteile","Diodes, LED et photocomposants","Z-Dioden","Zener-Dioden: wichtige Werte (BZX55 / 1N47xx)","zdiode","bauteile_zener","halbleiter/bauteile_zener"],["Halbleiter","Semi-conducteurs","Dioden, LEDs & Fotobauteile","Diodes, LED et photocomposants","Brückengleichrichter","Vier Dioden in einem Gehäuse","gleich","bauteile_brueckengl","halbleiter/bauteile_brueckengl"],["Halbleiter","Semi-conducteurs","Dioden, LEDs & Fotobauteile","Diodes, LED et photocomposants","LED-Farben","Flussspannung von LEDs nach Farbe","led","bauteile_led-farben","halbleiter/bauteile_led-farben"],["Halbleiter","Semi-conducteurs","Dioden, LEDs & Fotobauteile","Diodes, LED et photocomposants","Foto-Bauteile","Fotodiode, Fototransistor, LDR","k_daemm","bauteile_fotodiode","halbleiter/bauteile_fotodiode"],["Halbleiter","Semi-conducteurs","Dioden, LEDs & Fotobauteile","Diodes, LED et photocomposants","TSOP4838 / VS1838","Infrarot-Empfänger (38 kHz) für Fernbedienungen","tsop","bauteile_tsop4838","halbleiter/bauteile_tsop4838"],["Halbleiter","Semi-conducteurs","Dioden, LEDs & Fotobauteile","Diodes, LED et photocomposants","7-Segment-Anzeige","Einzelne Ziffernanzeige (10 Pins)","cd4511","bauteile_siebensegment","halbleiter/bauteile_siebensegment"],["Halbleiter","Semi-conducteurs","Dioden, LEDs & Fotobauteile","Diodes, LED et photocomposants","Dioden-Verzeichnis","Gleichrichter-, Schottky- und Signaldioden","gleich","bauteile_vdiode","halbleiter/bauteile_vdiode"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","Bipolartransistor (BJT)","NPN/PNP, Schalter, Basiswiderstand, Typen","npn","transistor","halbleiter/transistor"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","MOSFET","N/P-Kanal, Logic-Level, R_DS(on), Schalten","irlz44n","mosfet","halbleiter/mosfet"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","Thyristor, Triac, Diac","Phasenanschnitt, Dimmer, Zündung","triac","thyristor","halbleiter/thyristor"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","BC547","NPN-Kleinsignaltransistor","npn","bauteile_bc547","halbleiter/bauteile_bc547"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","BC557","PNP-Kleinsignaltransistor","pnp","bauteile_bc557","halbleiter/bauteile_bc557"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","2N2222 / PN2222","NPN-Transistor für mittlere Ströme","npn","bauteile_2n2222","halbleiter/bauteile_2n2222"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","2N3904","NPN-Universaltransistor","npn","bauteile_2n3904","halbleiter/bauteile_2n3904"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","IRLZ44N","Logic-Level-N-Kanal-MOSFET","irlz44n","bauteile_irlz44n","halbleiter/bauteile_irlz44n"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","IRF540N","N-Kanal-Leistungs-MOSFET (Standard-Gate)","irlz44n","bauteile_irf540n","halbleiter/bauteile_irf540n"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","BC337","NPN-Kleinleistungstransistor, 45 V, 800 mA","npn","bauteile_bc337","halbleiter/bauteile_bc337"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","BC327","PNP-Kleinleistungstransistor, 45 V, 800 mA","pnp","bauteile_bc327","halbleiter/bauteile_bc327"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","BC639","NPN-Transistor, 80 V, 1 A","npn","bauteile_bc639","halbleiter/bauteile_bc639"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","BC640","PNP-Transistor, 80 V, 1 A","pnp","bauteile_bc640","halbleiter/bauteile_bc640"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","2N3906","PNP-Universaltransistor","pnp","bauteile_2n3906","halbleiter/bauteile_2n3906"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","S8050","NPN-Transistor, 25 V, 500 mA","npn","bauteile_s8050","halbleiter/bauteile_s8050"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","S8550","PNP-Transistor, 25 V, 500 mA","pnp","bauteile_s8550","halbleiter/bauteile_s8550"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","2SC1815","NPN-Universaltransistor (Toshiba)","npn","bauteile_2sc1815","halbleiter/bauteile_2sc1815"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","BD139","NPN-Leistungstransistor, 80 V, 1,5 A (TO-126)","npn","bauteile_bd139","halbleiter/bauteile_bd139"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","BD140","PNP-Leistungstransistor, 80 V, 1,5 A (TO-126)","pnp","bauteile_bd140","halbleiter/bauteile_bd140"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","TIP120","Darlington NPN, 60 V, 5 A","npn","bauteile_tip120","halbleiter/bauteile_tip120"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","TIP122","Darlington NPN, 100 V, 5 A","npn","bauteile_tip122","halbleiter/bauteile_tip122"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","TIP127","Darlington PNP, 100 V, 5 A","pnp","bauteile_tip127","halbleiter/bauteile_tip127"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","TIP31C","NPN-Leistungstransistor, 100 V, 3 A","npn","bauteile_tip31c","halbleiter/bauteile_tip31c"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","2N7000","N-Kanal-MOSFET, 60 V, 200 mA (Kleinsignal)","irlz44n","bauteile_2n7000","halbleiter/bauteile_2n7000"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","BS170","N-Kanal-MOSFET, 60 V, 500 mA (Kleinsignal)","irlz44n","bauteile_bs170","halbleiter/bauteile_bs170"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","IRF9540","P-Kanal-Leistungs-MOSFET, −100 V, −23 A","pmos","bauteile_irf9540","halbleiter/bauteile_irf9540"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","IRF520","N-Kanal-Leistungs-MOSFET, 100 V, 9 A","irlz44n","bauteile_irf520","halbleiter/bauteile_irf520"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","AO3400","N-Kanal-MOSFET im SOT-23, 30 V, 5 A","irlz44n","bauteile_ao3400","halbleiter/bauteile_ao3400"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","IRLML6402","P-Kanal-MOSFET im SOT-23, −20 V, −3,7 A","pmos","bauteile_irlml6402","halbleiter/bauteile_irlml6402"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","BSS138","N-Kanal-MOSFET im SOT-23, 50 V, 220 mA","irlz44n","bauteile_bss138","halbleiter/bauteile_bss138"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","BC847","NPN-Transistor im SOT-23 (SMD)","npn","bauteile_bc847","halbleiter/bauteile_bc847"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","BT136","Triac, 600 V, 4 A","triac","bauteile_bt136","halbleiter/bauteile_bt136"],["Halbleiter","Semi-conducteurs","Transistoren, MOSFETs & Thyristoren","Transistors, MOSFET et thyristors","MOSFET-Verzeichnis","N- und P-Kanal-MOSFETs im Überblick","irlz44n","bauteile_vmos","halbleiter/bauteile_vmos"],["Halbleiter","Semi-conducteurs","Spannungsregler & Referenzen","Régulateurs et références","Spannungsregler","78xx, LDO, Buck, Boost – welcher wofür","lm7805","regler","halbleiter/regler"],["Halbleiter","Semi-conducteurs","Spannungsregler & Referenzen","Régulateurs et références","L7805 / LM7805","Festspannungsregler +5 V","lm7805","bauteile_lm7805","halbleiter/bauteile_lm7805"],["Halbleiter","Semi-conducteurs","Spannungsregler & Referenzen","Régulateurs et références","LM317","Einstellbarer Spannungsregler 1,25–37 V","lm317","bauteile_lm317","halbleiter/bauteile_lm317"],["Halbleiter","Semi-conducteurs","Spannungsregler & Referenzen","Régulateurs et références","7812 / 7912","Festspannungsregler +12 V / −12 V","lm7805","bauteile_lm7812","halbleiter/bauteile_lm7812"],["Halbleiter","Semi-conducteurs","Spannungsregler & Referenzen","Régulateurs et références","LM337","Einstellbarer Regler, negativ (−1,25 … −37 V)","lm337","bauteile_lm337","halbleiter/bauteile_lm337"],["Halbleiter","Semi-conducteurs","Spannungsregler & Referenzen","Régulateurs et références","LM1117-3.3 / AMS1117","LDO-Regler 3,3 V, 800 mA (SOT-223)","lm1117","bauteile_lm1117","halbleiter/bauteile_lm1117"],["Halbleiter","Semi-conducteurs","Spannungsregler & Referenzen","Régulateurs et références","MCP1700","LDO-Regler 3,3 V, 250 mA, sehr sparsam","lm1117","bauteile_mcp1700","halbleiter/bauteile_mcp1700"],["Halbleiter","Semi-conducteurs","Spannungsregler & Referenzen","Régulateurs et références","TL431","Einstellbare Referenzdiode (2,5 … 36 V)","tl431","bauteile_tl431","halbleiter/bauteile_tl431"],["Halbleiter","Semi-conducteurs","Spannungsregler & Referenzen","Régulateurs et références","Spannungsregler-Verzeichnis","Linear-, LDO- und Schaltregler","lm7805","bauteile_vregler","halbleiter/bauteile_vregler"],["Halbleiter","Semi-conducteurs","Spannungsregler & Referenzen","Régulateurs et références","ICL7660","Ladungspumpe: Spannung invertieren","icl7660","analog_icl7660","halbleiter/analog_icl7660"],["Halbleiter","Semi-conducteurs","Treiber & Optokoppler","Pilotes et optocoupleurs","Optokoppler & Trennung","PC817, 6N137, galvanische Trennung","pc817","optokoppler","halbleiter/optokoppler"],["Halbleiter","Semi-conducteurs","Treiber & Optokoppler","Pilotes et optocoupleurs","PC817","Optokoppler (Transistorausgang)","pc817","bauteile_pc817","halbleiter/bauteile_pc817"],["Halbleiter","Semi-conducteurs","Treiber & Optokoppler","Pilotes et optocoupleurs","L293D","Doppel-H-Brücke für Motoren (0,6 A)","l293d","bauteile_l293d","halbleiter/bauteile_l293d"],["Halbleiter","Semi-conducteurs","Treiber & Optokoppler","Pilotes et optocoupleurs","ULN2003A","7-fach Darlington-Treiber (500 mA)","uln2003","bauteile_uln2003","halbleiter/bauteile_uln2003"],["Halbleiter","Semi-conducteurs","Treiber & Optokoppler","Pilotes et optocoupleurs","4N25 / 4N35","Optokoppler mit Fototransistor (DIP-6)","pc817","bauteile_4n35","halbleiter/bauteile_4n35"],["Halbleiter","Semi-conducteurs","Treiber & Optokoppler","Pilotes et optocoupleurs","6N137","Schneller Optokoppler (10 MBit/s)","pc817","bauteile_6n137","halbleiter/bauteile_6n137"],["Halbleiter","Semi-conducteurs","Treiber & Optokoppler","Pilotes et optocoupleurs","MOC3021","Optokoppler mit Triac-Treiber (Netz)","triac","bauteile_moc3021","halbleiter/bauteile_moc3021"],["Halbleiter","Semi-conducteurs","Treiber & Optokoppler","Pilotes et optocoupleurs","ULN2803","8 × Darlington-Treiber (DIP-18)","uln2003","bauteile_uln2803","halbleiter/bauteile_uln2803"],["Halbleiter","Semi-conducteurs","Treiber & Optokoppler","Pilotes et optocoupleurs","A4988 / DRV8825","Schrittmotor-Treiber (Modul)","a4988","bauteile_a4988","halbleiter/bauteile_a4988"],["Halbleiter","Semi-conducteurs","Treiber & Optokoppler","Pilotes et optocoupleurs","Optokoppler und Treiber","Optokoppler, Relais- und Motortreiber im Vergleich","pc817","bauteile_vopto","halbleiter/bauteile_vopto"],["Sensoren & Module","Capteurs et modules","Motoren, Aktoren & Strom","Moteurs, actionneurs et alimentation","28BYJ-48 + ULN2003","Unipolarer Schrittmotor mit Treiberplatine","uln2003","module_28byj48","bt_module/module_28byj48"]];

var root, FILTER = "alle", QUERY = "";
var GRP = [["takt", T("Takt & Zeit", "Horloge & temps"), "#ffb000", ["k_ampel", "ne555a", "ne555m", "ne556", "hc14", "cd4093", "cd4046", "cd4060", "k_uhr", "k_sirene"]], ["zaehl", T("Zählen & Lauflicht", "Compter & chenillard"), "#6dffb0", ["hc74", "cd4013", "hc573", "cd4017", "cd4040", "cd4020", "hc160", "hc193", "hc164", "cd4094", "k_lauf", "k_zaehl"]], ["logik", T("Logik & Daten", "Logique & données"), "#3de6ff", ["hc00", "adder", "hc245", "hc595", "hc165", "hc138", "cd4511", "cd4051", "cd4066", "max232", "max485", "mcp3008", "dac0808", "eeprom", "ds1307", "k_prell"]], ["analog", T("Verstärken, Messen & Versorgen", "Amplifier, mesurer & alimenter"), "#ff3d9a", ["lm358", "lm324", "tl072", "ad620", "lm393", "lm339", "lm386", "lm35", "lm317", "lm337", "lm7805", "lm1117", "tl431", "zdiode", "gleich", "icl7660", "k_daemm", "k_thermo", "k_netz"]], ["treiber", T("Schalten, Treiben & Motor", "Commuter, piloter & moteur"), "#b58cff", ["led", "npn", "pnp", "irlz44n", "pmos", "uln2003", "l293d", "a4988", "pc817", "triac", "tsop", "k_motor", "k_relais"]]];
function icsOf(pid){ var pr = PROJ[pid]; if (pr.ics) return pr.ics.slice(); var ic = icOfProj(pid); return ic ? [ic.id] : []; }
function shortT(pid){ var t = T(PROJ[pid].t[0], PROJ[pid].t[1]); return t.split(/ – |: /)[0]; }
function subT(pid){ var t = T(PROJ[pid].t[0], PROJ[pid].t[1]), m = t.split(/ – |: /); return m.slice(1).join(" – "); }
function cardP(pid, col){
  var a = el("a", "ic-card" + (icsOf(pid).length > 1 ? " kb" : ""), ""), ics = icsOf(pid).map(function(i){ return icById(i).name.split(" / ")[0]; });
  a.href = "#p/" + pid; a.style.setProperty("--c", col);
  a.innerHTML = '<span class="ic-pkg">' + ics.map(esc).join(" + ") + '</span><b>' + (KICON[pid] ? KICON[pid] + " " : "") + esc(shortT(pid)) + "</b><p>" + esc(subT(pid) || T(PROJ[pid].d[0], PROJ[pid].d[1]).slice(0, 90) + "…") + "</p><i>" + (ics.length > 1 ? ics.length + " ICs" : T("1 IC", "1 CI")) + "</i>";
  a.dataset.s = (PROJ[pid].t[0] + " " + PROJ[pid].t[1] + " " + PROJ[pid].d[0] + " " + ics.join(" ")).toLowerCase(); return a;
}
var VIEW = sv("view") || "bt";
function listPage(){
  stopLive(); document.title = T("Schaltungen", "Circuits") + " – Oratio Tech Studio"; root.innerHTML = "";
  root.appendChild(el("div", "crumb", '<a href="index.html">Oratio Place</a> › <a href="index.html#/studio">Oratio Tech Studio</a> › ' + T("Schaltungen", "Circuits")));
  root.appendChild(el("div", "ic-hero", '<div class="ic-k">' + T("LIVE-LABOR", "LABO EN DIRECT") + "</div><h1>" + T("Jedes Bauteil in einer echten Schaltung", "Chaque composant dans un vrai circuit") + "</h1><p>" + T("Wähle ein Bauteil oder eine Schaltung: Schaltplan, Erklärung, Werte zum Drehen und das Oszilloskop zeigen, was passiert. Wo es etwas zu rechnen gibt, führt ein Knopf direkt zum Elektronik-Rechner.", "Choisis un composant ou un circuit : schéma, explication, réglages et oscilloscope. Un bouton mène au calculateur quand il y a des valeurs à calculer.") + "</p>"));
  var s = el("input", "ic-search"); s.type = "search"; s.placeholder = T("Bauteil oder Schaltung suchen, z. B. 555, BC547, 4017, Filter …", "Chercher un composant ou un circuit …"); s.value = QUERY; var tools = el("div", "ic-chips"); tools.appendChild(s); root.appendChild(tools);
  var self = el("a", "ic-self", '<span class="ic-self-i">🛠️</span><span><b>' + T("Selbst bauen", "Construire soi-même") + "</b>" + T("ICs aus der Liste holen, frei platzieren, Pins mit der Maus verdrahten – die Simulation zeigt, ob alles richtig angeschlossen ist.", "Place des CI, relie les broches à la souris – la simulation vérifie le câblage.") + "</span><i>›</i>"); self.href = "#bau"; root.appendChild(self);
  var vw = el("div", "ic-chips ic-vt"); root.appendChild(vw);
  [["bt", T("Grundschaltungen (jedes Bauteil)", "Montages de base (chaque composant)")], ["pr", T("Projekte", "Projets")]].forEach(function(v){ var b = el("button", "ic-ch" + (VIEW === v[0] ? " on" : ""), esc(v[1])); b.type = "button"; b.onclick = function(){ VIEW = v[0]; st("view", VIEW); listPage(); }; vw.appendChild(b); });
  var secs = [];
  function projekte(){ var top = el("div", "ic-grid"); KOMBI.forEach(function(p){ if (PROJ[p]) top.appendChild(cardP(p, "#ffd43b")); });
    var th = el("h2", "ic-h2 ic-hw", esc(T("Projekte: mehrere Bauteile arbeiten zusammen", "Projets : plusieurs composants ensemble"))); th.id = "sec-proj"; root.appendChild(th); root.appendChild(top); secs.push([th, top]); }
  if (VIEW === "bt"){
    var lastW = "", lastG = "", h, gr, cnt0 = {}, jw = el("div", "ic-chips ic-jump"), wi = 0; root.appendChild(jw);
    ALLB.forEach(function(b){ if (!cnt0[b[0]]){ var ja = el("a", "ic-ch", esc(T(b[0], b[1]))); ja.href = "javascript:void(0)"; (function(n){ ja.onclick = function(){ var t = document.getElementById("sec-w" + n); if (t) t.scrollIntoView({ behavior: "smooth" }); }; })(wi++); jw.appendChild(ja); } cnt0[b[0]] = (cnt0[b[0]] || 0) + 1; });
    var wn = 0;
    ALLB.forEach(function(b){
      if (b[0] !== lastW){ lastW = b[0]; lastG = null; var hw = el("h2", "ic-h2 ic-hw", esc(T(b[0], b[1])) + ' <small style="font-weight:500;color:var(--muted)">' + cnt0[b[0]] + "</small>"); hw.id = "sec-w" + (wn++); root.appendChild(hw); }
      if (b[2] !== lastG){ lastG = b[2]; h = el("h3", "ic-h3 ic-hg", esc(T(b[2], b[3]) || T(b[0], b[1]))); gr = el("div", "ic-bgrid"); root.appendChild(h); root.appendChild(gr); secs.push([h, gr]); }
      var a = el("a", "ic-bt"); a.href = "#p/" + b[6] + "/" + b[7];
      a.innerHTML = "<b>" + esc(b[4]) + "</b><span>" + esc(shortT(b[6])) + "</span>"; a.dataset.s = (b[4] + " " + b[5] + " " + PROJ[b[6]].t[0] + " " + b[2]).toLowerCase(); gr.appendChild(a); });
  } else { root.appendChild(el("p", "ic-pd", esc(T("In Projekten arbeiten mehrere Bauteile zusammen. Hier wird nichts gerechnet – jedes Projekt zeigt die fertige Schaltung, erklärt, was sie macht, und das Oszilloskop zeigt den Ablauf.", "Dans les projets, plusieurs composants travaillent ensemble ; pas de calcul, le circuit est expliqué et l’oscilloscope montre le déroulement.")))); projekte();
  }
  var hitH = el("h2", "ic-h2 ic-hx"), hitG = el("div", "ic-grid"); hitH.hidden = hitG.hidden = true; root.insertBefore(hitG, jw0()); root.insertBefore(hitH, hitG);
  function jw0(){ return root.querySelector(".ic-jump") || root.querySelector(".ic-hw") || null; }
  function hay(pid){ var pr = PROJ[pid], h = pr.t[0] + " " + pr.t[1] + " " + (pr.flow || []).join(" ") + " " + pid; icsOf(pid).forEach(function(i){ var d = icById(i); if (d) h += " " + d.id + " " + d.name; }); var nl0 = NL[pid]; if (nl0 && typeof nl0 !== "function") Object.keys(nl0.parts).forEach(function(k){ if (typeof nl0.parts[k] === "string") h += " " + nl0.parts[k]; }); return h.toLowerCase().replace(/[\s\-_]/g, ""); }
  var emp = el("p", "ic-lb", T("Nichts gefunden – versuche z. B. 555 oder Zähler.", "Rien trouvé.")); emp.hidden = true; root.appendChild(emp);
  function filt(){ var q = s.value.trim().toLowerCase(), tot = 0; QUERY = s.value;
    var qn = q.replace(/[\s\-_]/g, ""), hp = qn.length >= 2 ? Object.keys(PROJ).filter(function(pid){ return hay(pid).indexOf(qn) >= 0; }) : []; hitG.innerHTML = ""; hp.forEach(function(pid){ hitG.appendChild(cardP(pid, KOMBI.indexOf(pid) >= 0 ? "#ffd43b" : "#3de6ff")); }); hitH.hidden = hitG.hidden = !hp.length; hitH.textContent = "🔎 " + T("Alle Schaltungen mit „", "Tous les circuits avec « ") + s.value.trim() + T("“", " »") + " (" + hp.length + ")"; tot += hp.length;
    secs.forEach(function(x){ var n = 0; x[1].childNodes.forEach(function(a){ var ok = !q || a.dataset.s.indexOf(q) >= 0; a.hidden = !ok; if (ok) n++; }); x[0].hidden = x[1].hidden = !n; tot += n; });
    root.querySelectorAll(".ic-hw").forEach(function(hw){ var n = hw.nextElementSibling, any = false; while (n && !n.classList.contains("ic-hw") && n.tagName !== "P"){ if (n.classList.contains("ic-bgrid") && !n.hidden) any = true; n = n.nextElementSibling; } hw.hidden = !any; });
    emp.hidden = !!tot; }
  s.oninput = filt; filt();
}
function circuitPage(pid){
  var pr = PROJ[pid]; if (!pr) return listPage(); var ics = icsOf(pid).map(icById).filter(Boolean);
  var okey = (location.hash.split("/")[2] || "");
  if (pid === "opamp" && OPK[okey]) ics = [icById(OPK[okey])];
  document.title = shortT(pid) + " – Schaltungen"; root.innerHTML = "";
  root.appendChild(el("div", "crumb", '<a href="index.html">Oratio Place</a> › <a href="index.html#/studio">Oratio Tech Studio</a> › <a href="#">' + T("Schaltungen", "Circuits") + "</a> › " + esc(shortT(pid))));
  var wrap = el("div", "ic-two"); root.appendChild(wrap);
  var side = el("aside", "ic-side"); wrap.appendChild(side); var main = el("section", "ic-main"); wrap.appendChild(main);
  side.appendChild(el("h1", "ic-h1", T("Verdrahtung", "Câblage")));
  ics.forEach(function(ic){ side.appendChild(el("p", "ic-lb", "<b>" + esc(ic.name) + "</b> – " + esc(T(ic.k[0], ic.k[1])))); var pn = el("div", "ic-pin"); pn.innerHTML = dip(ic); side.appendChild(pn); var dl = el("a", "ic-act2", "📖 " + T("Alle Daten zu ", "Toutes les données : ") + esc(ic.name.split(" / ")[0])); dl.href = "index.html#/s/" + LINK[ic.id]; side.appendChild(dl); });
  side.appendChild(el("div", "ic-leg", '<span style="--c:#ff6b6b">+V</span><span style="--c:#8aa0b8">GND</span><span style="--c:#ffb000">' + T("Eingang", "Entrée") + '</span><span style="--c:#3de6ff">' + T("Ausgang", "Sortie") + "</span>"));
  var sipT = ics.length && ics.every(function(i){ return i.pkg === "TO-220" || /TO-92/.test(i.pkg || ""); });
  side.appendChild(el("p", "ic-lb", sipT ? T("Ansicht auf die beschriftete Vorderseite, Beine nach unten: Pin 1 links.", "Vue de face (côté inscrit), broches vers le bas : broche 1 à gauche.") : T("Ansicht von oben, Kerbe oben: Pin 1 links oben, dann gegen den Uhrzeigersinn.", "Vue de dessus, encoche en haut : broche 1 en haut à gauche.")));
  var key = (location.hash.split("/")[2] || ""), bb = null; ALLB.forEach(function(b){ if (!bb && b[6] === pid && (b[7] === key || b[8].split("/")[1] === key)) bb = b; });
  if (bb && ics.every(function(i){ return i.name.split(" / ")[0] !== bb[4]; })){ var bn = el("div", "ic-bnr", "🔎 " + esc(T("Du kommst von", "Tu viens de")) + " <b>" + esc(bb[4]) + "</b> – " + esc(T("diese Schaltung gilt für die ganze Bauteil-Familie. ", "ce circuit vaut pour toute la famille. ")) + '<a href="index.html#/s/' + esc(bb[8]) + '">' + esc(T("Steckbrief von ", "Fiche de ")) + esc(bb[4]) + "</a>"); main.appendChild(bn); }
  if (pid === "opamp" && ics[0]){ var oi = ics[0], pn = function(n){ for (var q = 0; q < oi.pins.length; q++) if (oi.pins[q].split(":")[0] === n) return q + 1; return "?"; }, n8 = oi.pins.length, txt;
    if (pn("OUT") !== "?") txt = T("Einfach-Opamp: IN− = Pin " + pn("IN−") + ", IN+ = Pin " + pn("IN+") + ", OUT = Pin " + pn("OUT") + ", V+ = Pin " + pn("V+") + ", V− = Pin " + pn("V−") + " (Pin 1 und 5 = Offset-Abgleich, Pin 8 frei). ⚠️ Anders als beim LM358 – dort ist Pin 6 ein Eingang!", "Ampli simple : IN− " + pn("IN−") + ", IN+ " + pn("IN+") + ", OUT " + pn("OUT") + ", V+ " + pn("V+") + ", V− " + pn("V−") + ". ⚠️ Différent du LM358 !");
    else if (n8 === 8) txt = T("Doppel-Opamp (Standard-Belegung wie LM358): Verstärker 1 = OUT Pin 1, IN− Pin 2, IN+ Pin 3 · Verstärker 2 = IN+ Pin 5, IN− Pin 6, OUT Pin 7 · V+ = Pin 8, V− bzw. GND = Pin 4.", "Double ampli (brochage standard) : 1/2/3 et 7/6/5, V+ 8, V− 4.");
    else txt = T("Vierfach-Opamp (Standard-Belegung wie LM324): Verstärker 1 = Pin 1/2/3, 2 = 7/6/5, 3 = 8/9/10, 4 = 14/13/12 (OUT/IN−/IN+) · V+ = Pin 4, V− bzw. GND = Pin 11.", "Quadruple ampli : V+ 4, V− 11.");
    main.appendChild(el("div", "ic-bnr", "📌 <b>" + esc(oi.name) + "</b> – " + esc(txt) + " " + esc(T("Die Beschaltungen unten (Widerstände, Formeln) gelten für jeden Operationsverstärker.", "Les montages ci-dessous valent pour tout ampli op.")))); }
  var G555 = [["ne555a", T("Astabil (Blinker)", "Astable (clignotant)")], ["ne555m", T("Monostabil (Zeitglied)", "Monostable (temporisation)")], ["k_bistabil", T("Bistabil (Speicher)", "Bistable (mémoire)")], ["k_schmitt", T("Schmitt-Trigger", "Trigger de Schmitt")]], isG = G555.some(function(g){ return g[0] === pid; });
  if (isG){ var gb = el("div", "ic-more2"); gb.appendChild(el("h3", "ic-h3", "🔧 " + T("Grundschaltungen des NE555", "Montages de base du NE555"))); var gc = el("div", "ic-chips"); G555.forEach(function(g){ var a = el("a", "ic-ch" + (g[0] === pid ? " on" : ""), esc(g[1])); a.href = "#p/" + g[0]; gc.appendChild(a); }); gb.appendChild(gc); main.appendChild(gb); }
  var ids = {}; ics.forEach(function(i){ ids[i.id] = 1; }); var more = []; Object.keys(PROJ).forEach(function(p){ if (p !== pid && icsOf(p).some(function(i){ return ids[i]; }) && !(isG && G555.some(function(g){ return g[0] === p; }))) more.push(p); });
  var mb = null; if (more.length){ mb = el("div", "ic-more2"); mb.appendChild(el("h3", "ic-h3", "➕ " + (isG ? T("Projekte mit ", "Projets avec ") : T("Weitere Schaltungen mit ", "Autres circuits avec ")) + esc(ics.map(function(i){ return i.name.split(" / ")[0]; }).join(" + ")) + " (" + more.length + ")")); var mc = el("div", "ic-chips"); more.forEach(function(p){ var a = el("a", "ic-ch", esc(shortT(p))); a.href = "#p/" + p; mc.appendChild(a); }); mb.appendChild(mc); if (!isG) main.appendChild(mb); }
  var host = el("div"); main.appendChild(host); renderProject(host, pid, ics.map(function(i){ return i.id; })); if (isG && mb) main.appendChild(mb);
}
/* ================= Werkstatt: eigene Schaltung bauen (Editor + Logik-Simulation) ================= */
var BAU = (function(){
  var G = 10, NOTE = {};
  function fhz(f){ return String(f).replace(".", ",") + " Hz"; }
  function nv(a){ return a == null ? null : 1 - a; }
  function nand(a, b){ return (a === 0 || b === 0) ? 1 : (a === 1 && b === 1) ? 0 : null; }
  function bits(io, names){ var v = 0; for (var i = 0; i < names.length; i++){ var x = io.g(names[i]); if (x == null) return null; v |= x << i; } return v; }
  function outBits(io, names, v){ names.forEach(function(n, i){ io.s(n, v == null ? null : (v >> i) & 1); }); }
  function rng(p, a, b, q){ var r = []; for (var i = a; i <= b; i++) r.push((p || "") + i + (q || "")); return r; }
  var SEG = [0x7e, 0x30, 0x6d, 0x79, 0x33, 0x5b, 0x1f, 0x70, 0x7f, 0x73]; // abcdefg (a = Bit 6)
  /* --- Verhaltensmodelle der ICs (Pins über ihre Namen) --- */
  var MOD = {};
  MOD.hc00 = { note: ["simuliert als 74HC00 (4 × NAND)", "simulé comme 74HC00 (4 × NON-ET)"], out: function(io){ for (var k = 1; k <= 4; k++) io.s(k + "Y", nand(io.g(k + "A"), io.g(k + "B"))); } };
  MOD.cd4093 = { out: MOD.hc00.out };
  MOD.hc14 = { out: function(io){ for (var k = 1; k <= 6; k++) io.s(k + "Y", nv(io.g(k + "A"))); } };
  MOD.hc74 = { out: function(io){ [1, 2].forEach(function(k){ var c = io.g(k + "/CLR"), p = io.g(k + "/PR"), q = c === 0 ? 0 : p === 0 ? 1 : io.st["q" + k] || 0; io.s(k + "Q", q); io.s(k + "/Q", c === 0 && p === 0 ? 1 : 1 - q); }); },
    upd: function(io){ [1, 2].forEach(function(k){ if (io.g(k + "/CLR") === 0) io.st["q" + k] = 0; else if (io.g(k + "/PR") === 0) io.st["q" + k] = 1; else if (io.e(k + "CLK") === "r") io.st["q" + k] = io.g(k + "D") || 0; }); } };
  MOD.cd4013 = { out: function(io){ [1, 2].forEach(function(k){ var r = io.g("RESET" + k), s = io.g("SET" + k), q = r === 1 ? 0 : s === 1 ? 1 : io.st["q" + k] || 0; io.s("Q" + k, q); io.s("/Q" + k, r === 1 && s === 1 ? 1 : 1 - q); }); },
    upd: function(io){ [1, 2].forEach(function(k){ if (io.g("RESET" + k) === 1) io.st["q" + k] = 0; else if (io.g("SET" + k) === 1) io.st["q" + k] = 1; else if (io.e("CLK" + k) === "r") io.st["q" + k] = io.g("D" + k) || 0; }); } };
  MOD.cd4017 = { out: function(io){ var c = io.g("RESET") === 1 ? 0 : io.st.c || 0; for (var i = 0; i < 10; i++) io.s("Q" + i, c === i ? 1 : 0); io.s("CO", c < 5 ? 1 : 0); },
    upd: function(io){ if (io.g("RESET") === 1) io.st.c = 0; else if (io.e("CLK") === "r" && io.g("CE") !== 1) io.st.c = ((io.st.c || 0) + 1) % 10; } };
  MOD.hc160 = { out: function(io){ var c = io.g("/MR") === 0 ? 0 : io.st.c || 0; outBits(io, ["Q0", "Q1", "Q2", "Q3"], c); io.s("TC", c === 9 && io.g("CET") === 1 ? 1 : 0); },
    upd: function(io){ if (io.g("/MR") === 0){ io.st.c = 0; return; } if (io.e("CLK") !== "r") return; if (io.g("/PE") === 0) io.st.c = (bits(io, ["P0", "P1", "P2", "P3"]) || 0) % 16; else if (io.g("CEP") === 1 && io.g("CET") === 1) io.st.c = ((io.st.c || 0) + 1) % 10; } };
  MOD.hc193 = { out: function(io){ var c = io.st.c || 0; outBits(io, ["Q0", "Q1", "Q2", "Q3"], c); io.s("/TCU", c === 15 && io.g("CPU") === 0 ? 0 : 1); io.s("/TCD", c === 0 && io.g("CPD") === 0 ? 0 : 1); },
    upd: function(io){ if (io.g("MR") === 1){ io.st.c = 0; return; } if (io.g("/PL") === 0){ io.st.c = bits(io, ["P0", "P1", "P2", "P3"]) || 0; return; }
      if (io.e("CPU") === "r" && io.g("CPD") === 1) io.st.c = ((io.st.c || 0) + 1) & 15; if (io.e("CPD") === "r" && io.g("CPU") === 1) io.st.c = ((io.st.c || 0) + 15) & 15; } };
  function ripple(n, names){ return { out: function(io){ var c = io.g("RESET") === 1 ? 0 : io.st.c || 0; names.forEach(function(q){ var b = +q.slice(1) - 1; io.s(q, (c >> b) & 1); }); },
    upd: function(io){ if (io.g("RESET") === 1) io.st.c = 0; else if (io.e("CLK") === "f") io.st.c = ((io.st.c || 0) + 1) % Math.pow(2, n); } }; }
  MOD.cd4040 = ripple(12, rng("Q", 1, 12));
  MOD.cd4020 = ripple(14, ["Q1"].concat(rng("Q", 4, 14)));
  MOD.cd4060 = { ex: ["Φ1"], note: ["Oszillator verlangsamt: Q4 blinkt hier mit ca. 1 Hz", "oscillateur ralenti : Q4 ≈ 1 Hz"],
    out: function(io){ var c = io.g("RESET") === 1 ? 0 : io.st.c || 0; rng("Q", 4, 10).concat(["Q12", "Q13", "Q14"]).forEach(function(q){ var b = +q.slice(1) - 1; io.s(q, (c >> b) & 1); });
      if (!io.osc("Φ1")){ io.s("Φ0", nv(io.g("Φ1"))); io.s("/Φ0", io.g("Φ1")); } },
    upd: function(io){ if (io.g("RESET") === 1){ io.st.c = 0; io.st.a = 0; return; } if (io.osc("Φ1")){ io.st.a = (io.st.a || 0) + io.dt * 16; while (io.st.a >= 0.5){ io.st.a -= 0.5; io.st.c = ((io.st.c || 0) + 1) & 16383; } } else if (io.e("Φ1") === "f") io.st.c = ((io.st.c || 0) + 1) & 16383; } };
  var QAH = ["QA", "QB", "QC", "QD", "QE", "QF", "QG", "QH"];
  MOD.hc595 = { out: function(io){ var l = io.st.l || 0; QAH.forEach(function(q, i){ io.s(q, io.g("/OE") === 1 ? null : (l >> i) & 1); }); io.s("QH'", ((io.st.r || 0) >> 7) & 1); },
    upd: function(io){ if (io.g("/SRCLR") === 0) io.st.r = 0; else if (io.e("SRCLK") === "r") io.st.r = (((io.st.r || 0) << 1) | (io.g("SER") || 0)) & 255; if (io.e("RCLK") === "r") io.st.l = io.st.r || 0; } };
  MOD.hc164 = { out: function(io){ var r = io.g("/CLR") === 0 ? 0 : io.st.r || 0; QAH.forEach(function(q, i){ io.s(q, (r >> i) & 1); }); },
    upd: function(io){ if (io.g("/CLR") === 0) io.st.r = 0; else if (io.e("CLK") === "r") io.st.r = (((io.st.r || 0) << 1) | (io.g("A") === 1 && io.g("B") === 1 ? 1 : 0)) & 255; } };
  MOD.hc165 = { out: function(io){ var b = ((io.st.r || 0) >> 7) & 1; io.s("QH", b); io.s("/QH", 1 - b); },
    upd: function(io){ if (io.g("SH/LD") === 0) io.st.r = bits(io, ["A", "B", "C", "D", "E", "F", "G", "H"]) || 0; else if (io.e("CLK") === "r" && io.g("CLK INH") !== 1) io.st.r = (((io.st.r || 0) << 1) | (io.g("SER") || 0)) & 255; } };
  MOD.hc138 = { out: function(io){ var en = io.g("E3") === 1 && io.g("/E1") === 0 && io.g("/E2") === 0, a = bits(io, ["A0", "A1", "A2"]); for (var i = 0; i < 8; i++) io.s("/Y" + i, !en ? 1 : a == null ? null : a === i ? 0 : 1); } };
  MOD.cd4511 = { out: function(io){ var lt = io.g("/LT"), bi = io.g("/BI"), d = io.g("LE") === 0 ? bits(io, ["A", "B", "C", "D"]) : io.st.d, m = lt === 0 ? 127 : bi === 0 ? 0 : (d != null && d < 10 ? SEG[d] : 0);
      "abcdefg".split("").forEach(function(s, i){ io.s(s, (m >> (6 - i)) & 1); }); },
    upd: function(io){ if (io.g("LE") === 0) io.st.d = bits(io, ["A", "B", "C", "D"]); } };
  MOD.hc283 = { out: function(io){ var a = bits(io, ["A1", "A2", "A3", "A4"]), b = bits(io, ["B1", "B2", "B3", "B4"]), c = io.g("C0"); if (a == null || b == null || c == null){ outBits(io, ["S1", "S2", "S3", "S4", "C4"], null); return; } outBits(io, ["S1", "S2", "S3", "S4", "C4"], a + b + c); } };
  MOD.hc245 = { ex: rng("B", 1, 8).concat(rng("A", 1, 8)), out: function(io){ var oe = io.g("/OE"), d = io.g("DIR"); for (var i = 1; i <= 8; i++){ if (oe !== 0 || d == null) continue; if (d === 1) io.s("B" + i, io.g("A" + i)); else io.s("A" + i, io.g("B" + i)); } } };
  MOD.hc573 = { out: function(io){ for (var i = 0; i < 8; i++) io.s("Q" + i, io.g("/OE") === 1 ? null : io.g("LE") === 1 ? io.g("D" + i) : (io.st["d" + i] || 0)); },
    upd: function(io){ if (io.g("LE") === 1) for (var i = 0; i < 8; i++) io.st["d" + i] = io.g("D" + i) || 0; } };
  MOD.cd4094 = { out: function(io){ var l = io.st.l || 0; for (var i = 1; i <= 8; i++) io.s("Q" + i, io.g("OE") === 1 ? (l >> (i - 1)) & 1 : null); io.s("QS", ((io.st.r || 0) >> 7) & 1); io.s("Q'S", io.st.qs || 0); },
    upd: function(io){ if (io.e("CLK") === "r") io.st.r = (((io.st.r || 0) << 1) | (io.g("DATA") || 0)) & 255; if (io.e("CLK") === "f") io.st.qs = ((io.st.r || 0) >> 7) & 1; if (io.g("STROBE") === 1) io.st.l = io.st.r || 0; } };
  MOD.uln2003 = { ex: rng("", 1, 7, "B"), out: function(io){ for (var k = 1; k <= 7; k++) io.s(k + "C", io.g(k + "B") === 1 ? 0 : null); } };
  MOD.cd4066 = { pas: 1, out: function(io){ [1, 2, 3, 4].forEach(function(k){ if (io.g(k + "C") === 1) io.j(k + "A", k + "B"); }); } };
  MOD.cd4051 = { pas: 1, ex: ["COM"].concat(rng("Y", 0, 7)), out: function(io){ var s = bits(io, ["A", "B", "C"]); if (io.g("INH") === 0 && s != null) io.j("COM", "Y" + s); } };
  MOD.pc817 = { pas: 1, pw: [], ex: ["Anode"], out: function(io){ if (io.led("Anode", "Kathode")) io.j("Kollektor", "Emitter"); } };
  function timer(sx){ var N = function(n){ return n === "DIS" && !sx ? "DISCH" : n + sx; };
    return { ex: [N("THR"), N("CTRL"), N("TRIG")],
      out: function(io){ var on = io.g(N("RESET")) !== 0 && io.st["o" + sx] ? 1 : 0; io.s(N("OUT"), on); io.s(N("DIS"), on ? null : 0); },
      upd: function(io){ var k = "o" + sx, cn = io.capOn(N("THR")), same = io.same(N("THR"), N("TRIG"));
        if (io.g(N("RESET")) === 0){ io.st[k] = 0; return; }
        if (!cn){ io.warn(T("Am THR-Pin" + (sx ? " " + sx : "") + " fehlt der Kondensator – der Timer kann nicht laufen.", "Il manque le condensateur sur THR.")); io.st[k] = 0; return; }
        if (same){ var ra = io.rBetween(N("DIS"), "+"), rb = io.rBetween(N("DIS"), N("THR")); if (!ra || !rb){ io.warn(T("Astabil: R zwischen +V und DIS und R zwischen DIS und THR nötig.", "Astable : il faut R entre +V et DIS et R entre DIS et THR.")); io.st[k] = 0; return; }
          var f = 1.44 / ((ra + 2 * rb) * cn), d = (ra + rb) / (ra + 2 * rb), fs = Math.min(f, 8); io.info(T("schwingt mit ", "oscille à ") + fmt(f, "Hz") + (f > 8 ? T(" (hier verlangsamt)", " (ralenti ici)") : ""));
          io.st["p" + sx] = ((io.st["p" + sx] || 0) + io.dt * fs) % 1; io.st[k] = io.st["p" + sx] < d ? 1 : 0; }
        else { var r = io.rBetween(N("THR"), "+"), t = 1.1 * (r || 0) * cn; if (!r){ io.warn(T("Monoflop: R zwischen +V und THR/DIS fehlt.", "Monostable : R entre +V et THR manquante.")); return; }
          if (io.e(N("TRIG")) === "f" || (io.g(N("TRIG")) === 0 && !io.st[k])){ io.st[k] = 1; io.st["t" + sx] = Math.min(t, 15); io.info(T("Impuls ", "impulsion ") + fmt(t, "s")); }
          if (io.st[k]){ io.st["t" + sx] -= io.dt; if (io.st["t" + sx] <= 0 && io.g(N("TRIG")) !== 0) io.st[k] = 0; } } } }; }
  function cmp(n, oc){ return { note: oc ? null : ["simuliert als Komparator (ohne Gegenkopplung): OUT = HIGH, wenn IN+ > IN−", "simulé comme comparateur"], out: function(io){
      for (var k = 1; k <= n; k++){ var sx = n === 1 ? "" : String(k), ap = io.a("IN" + sx + "+"), am = io.a("IN" + sx + "−"); if (ap == null || am == null){ io.s("OUT" + sx, null); continue; } io.s("OUT" + sx, ap > am ? (oc ? null : 1) : 0); } } }; }
  MOD.lm393 = cmp(2, 1); MOD.lm339 = cmp(4, 1); MOD.lm358 = cmp(2); MOD.tl072 = cmp(2); MOD.ne5532 = cmp(2); MOD.mcp6002 = cmp(2); MOD.lm324 = cmp(4); MOD.tl074 = cmp(4); MOD.lm741 = cmp(1); MOD.tl071 = cmp(1);
  MOD.lm393.note = MOD.lm339.note = ["Komparator mit Open-Collector-Ausgang: braucht einen Pull-up (oder LED mit Vorwiderstand nach +V)", "sortie collecteur ouvert : pull-up nécessaire"];
  MOD.ne555 = timer(""); MOD.ne556 = (function(){ var a = timer("1"), b = timer("2"); return { ex: a.ex.concat(b.ex), out: function(io){ a.out(io); b.out(io); }, upd: function(io){ a.upd(io); b.upd(io); } }; })();

  /* --- Bauteil-Palette --- */
  var BASIC = [
    ["V", "+5 V", "+5 V", "Versorgung (fester HIGH-Pegel)"], ["GND", "GND", "GND", "Masse (fester LOW-Pegel)"], ["TG", "Taktgeber", "Horloge", "Rechteck 0/1, Frequenz einstellbar"],
    ["TA", "Taster", "Bouton", "verbindet, solange du drückst"], ["SW", "Schalter", "Interrupteur", "klick = ein/aus"], ["R", "Widerstand", "Résistance", "Vorwiderstand, Pull-up, Pull-down"],
    ["LED", "LED", "LED", "leuchtet bei richtiger Polung mit Vorwiderstand"], ["D", "Diode", "Diode", "lässt HIGH nur in Pfeilrichtung durch"], ["C", "Kondensator", "Condensateur", "für den 555-Timer"],
    ["LP", "Lampe / Motor", "Lampe / moteur", "an Transistor oder ULN2003"], ["Q", "Transistor NPN (BC337)", "Transistor NPN", "Basis HIGH = C–E leitet"], ["QP", "Transistor PNP (BC557)", "Transistor PNP", "Basis LOW = E–C leitet"],
    ["M", "MOSFET (IRLZ44N)", "MOSFET", "Gate HIGH = D–S leitet"], ["AZ", "7-Segment-Anzeige", "Afficheur 7 segments", "gemeinsame Kathode"], ["K", "Knoten", "Nœud", "Verzweigung für mehrere Drähte"],
    ["VS", "Spannungsquelle 0–5 V", "Source de tension", "Spannung mit Regler einstellen – z. B. als Sensor"], ["PT", "Poti (Spannungsteiler)", "Potentiomètre", "Schleifer mit Regler verstellen"],
    ["SU", "Summer (Piezo)", "Buzzer", "piept, wenn Strom fließt"], ["TK", "Tastkopf (Oszilloskop)", "Sonde", "zeigt die Leitung im Oszilloskop"],
    ["SIN", "Funktionsgenerator", "Générateur de fonctions", "Sinus / Rechteck / Dreieck – für Analog-Schaltungen"], ["VN", "−5 V", "−5 V", "negative Versorgung, z. B. für Opamps"], ["OP", "Operationsverstärker", "Ampli op", "Dreieck mit −/+-Eingang, Ausgang und Versorgung"], ["PD", "Fotodiode", "Photodiode", "Licht erzeugt Sperrstrom – Lichtsensor"], ["RL", "Relais", "Relais", "Spule + Schließer, schaltet ab ca. 3,5 V"]];
  var PFX = { VS: "VS", PT: "P", SU: "BZ", V: "V", GND: "GND", TG: "TG", TA: "S", SW: "S", R: "R", LED: "D", D: "D", C: "C", LP: "M", Q: "Q", QP: "Q", M: "Q", AZ: "AZ", K: "K", TK: "TK", SIN: "G", VN: "VN", OP: "U", PD: "D", RL: "RL", ic: "U" };
  var RV = [100, 220, 330, 470, 1e3, 4.7e3, 10e3, 22e3, 47e3, 100e3, 1e6], CV = [10e-9, 100e-9, 1e-6, 4.7e-6, 10e-6, 47e-6, 100e-6], LC = [["#ff4d4d", T("rot", "rouge")], ["#6dffb0", T("grün", "vert")], ["#ffd43b", T("gelb", "jaune")], ["#4dabf7", T("blau", "bleu")]];
  var FQ = [0.5, 1, 2, 4], CH = [["#e8590c", "CH1"], ["#1c7ed6", "CH2"], ["#2f9e44", "CH3"], ["#ae3ec9", "CH4"]];
  var SEGP = [["a", 7], ["b", 6], ["c", 4], ["d", 2], ["e", 1], ["f", 9], ["g", 10], ["DP", 5]];

  /* --- Geometrie --- */
  var FUNC = { ne555: { L: [7, 6, 2], R: [3], T: [8, 4], B: [1, 5] }, cd4017: { L: [14, 13, 15], R: [3, 2, 4, 7, 10, 1, 5, 6, 9, 11, 12], T: [16], B: [8] }, hc193: { L: [11, 4, 5, 14, 15, 1, 10, 9], R: [3, 2, 6, 7, 12, 13], T: [16], B: [8] },
    cd4511: { L: [3, 4, 7, 1, 2, 6, 5], R: [13, 12, 11, 10, 9, 15, 14], T: [16], B: [8] }, hc160: { L: [2, 1, 9, 7, 10, 3, 4, 5, 6], R: [14, 13, 12, 11, 15], T: [16], B: [8] }, cd4060: { L: [11, 12], R: [7, 5, 4, 6, 14, 13, 15, 1, 2, 3, 9, 10], T: [16], B: [8] },
    ne556: { L: [1, 2, 6, 13, 12, 8], R: [5, 9], T: [14, 4, 10], B: [7, 3, 11] } };
  function icGeo(p){ var d = icById(p.ic), n = d.pins.length, sip = n < 4 || /TO-|SOT|DO-|THT/.test(d.pkg), info = d.pins.map(function(s, i){ var a = s.split(":"); return { k: i + 1, n: a[0], ty: a[1] }; });
    if (!sip && !p.dip){ var f = FUNC[d.id], Ls, Rs, Ts, Bs;
      if (f){ Ls = f.L; Rs = f.R; Ts = f.T; Bs = f.B; } else { var by = function(t){ return info.filter(function(x){ return x.ty === t; }).sort(function(a, b){ return a.n.localeCompare(b.n, "de", { numeric: true }); }).map(function(x){ return x.k; }); }; Ls = by("i"); Rs = by("o"); Ts = by("v"); Bs = by("g"); }
      var used = {}; [Ls, Rs, Ts, Bs].forEach(function(l){ l.forEach(function(k){ used[k] = 1; }); }); info.forEach(function(x){ if (!used[x.k]) (x.ty === "o" ? Rs : Ls).push(x.k); });
      var W = Math.max(120, Math.max(Ts.length, Bs.length) * 40 + 20), H = Math.max(Ls.length, Rs.length, 1) * 20 + 20, t = [];
      function put(list, side){ list.forEach(function(k, j){ var x0 = info[k - 1], o = { k: p.id + "." + k, n: x0.n, ty: x0.ty, dx: 0, dy: 0 };
        if (side === "L"){ o.x = p.x - 20; o.y = p.y + 20 + 20 * j; o.dx = -1; } else if (side === "R"){ o.x = p.x + W + 20; o.y = p.y + 20 + 20 * j; o.dx = 1; }
        else { o.x = p.x + W / 2 - (list.length - 1) * 20 + 40 * j; o.y = side === "T" ? p.y - 20 : p.y + H + 20; o.dy = side === "T" ? -1 : 1; } t.push(o); }); }
      put(Ls, "L"); put(Rs, "R"); put(Ts, "T"); put(Bs, "B"); return { W: W, H: H, sip: false, fn: true, t: t, d: d }; }
    var h = sip ? 1 : n / 2, W = sip ? Math.max(80, n * 30 + 20) : 120, H = sip ? 60 : h * 20 + 20;
    var t = d.pins.map(function(s, i){ var a = s.split(":"), k = i + 1, x, y, dx = 0, dy = 0;
      if (sip){ x = p.x + 20 + i * 30; y = p.y + H + 20; dy = 1; } else if (k <= h){ x = p.x - 20; y = p.y + 20 + i * 20; dx = -1; } else { x = p.x + W + 20; y = p.y + 20 + (n - k) * 20; dx = 1; }
      return { k: p.id + "." + k, n: a[0], ty: a[1], x: x, y: y, dx: dx, dy: dy }; });
    return { W: W, H: H, sip: sip, t: t, d: d }; }
  function terms(p){
    if (p.t === "ic") return icGeo(p).t;
    var x = p.x, y = p.y, v = p.r === 1;
    if (p.t === "RL") return [{ k: p.id + ".1", n: "A1", x: x - 40, y: y - 20, dx: -1, dy: 0 }, { k: p.id + ".2", n: "A2", x: x - 40, y: y + 20, dx: -1, dy: 0 }, { k: p.id + ".3", n: "COM", x: x + 40, y: y - 20, dx: 1, dy: 0 }, { k: p.id + ".4", n: "NO", x: x + 40, y: y + 20, dx: 1, dy: 0 }];
    if (/^(R|LED|D|PD|C|TA|SW|LP|SU)$/.test(p.t)){ var rr = (p.r || 0) % 4, ux = [-1, 0, 1, 0][rr], uy = [0, -1, 0, 1][rr]; return [{ k: p.id + ".1", n: p.t === "LED" || p.t === "D" || p.t === "PD" ? "A" : "1", x: x + 30 * ux, y: y + 30 * uy, dx: ux, dy: uy }, { k: p.id + ".2", n: p.t === "LED" || p.t === "D" || p.t === "PD" ? "K" : "2", x: x - 30 * ux, y: y - 30 * uy, dx: -ux, dy: -uy }]; }
    if (p.t === "V") return [{ k: p.id + ".1", n: "+5 V", x: x, y: y + 20, dx: 0, dy: 1 }];
    if (p.t === "GND") return [{ k: p.id + ".1", n: "GND", x: x, y: y - 20, dx: 0, dy: -1 }];
    if (p.t === "TG") return [{ k: p.id + ".1", n: "OUT", x: x + 40, y: y, dx: 1, dy: 0 }];
    if (p.t === "VS") return [{ k: p.id + ".1", n: "+", x: x + 40, y: y, dx: 1, dy: 0 }];
    if (p.t === "PT") return [{ k: p.id + ".1", n: "1", x: x - 30, y: y, dx: -1, dy: 0 }, { k: p.id + ".2", n: "2", x: x + 30, y: y, dx: 1, dy: 0 }, { k: p.id + ".S", n: T("Schleifer", "curseur"), x: x, y: y + 30, dx: 0, dy: 1 }];
    if (p.t === "TK") return [{ k: p.id + ".1", n: "IN", x: x - 30, y: y, dx: -1, dy: 0 }];
    if (p.t === "SIN") return [{ k: p.id + ".1", n: "OUT", x: x + 40, y: y, dx: 1, dy: 0 }];
    if (p.t === "VN") return [{ k: p.id + ".1", n: "−5 V", x: x, y: y - 20, dx: 0, dy: -1 }];
    if (p.t === "OP") return [{ k: p.id + ".N", n: "−", ty: "i", x: x - 50, y: y - 20, dx: -1, dy: 0 }, { k: p.id + ".P", n: "+", ty: "i", x: x - 50, y: y + 20, dx: -1, dy: 0 }, { k: p.id + ".O", n: "OUT", ty: "o", x: x + 60, y: y, dx: 1, dy: 0 }, { k: p.id + ".VP", n: "V+", ty: "v", x: x - 10, y: y - 50, dx: 0, dy: -1 }, { k: p.id + ".VN", n: "V−", ty: "g", x: x - 10, y: y + 50, dx: 0, dy: 1 }];
    if (p.t === "K") return [{ k: p.id + ".1", n: "", x: x, y: y }];
    if (p.t === "Q" || p.t === "QP" || p.t === "M"){ var nm = p.t === "M" ? ["G", "D", "S"] : p.t === "Q" ? ["B", "C", "E"] : ["B", "E", "C"]; return [{ k: p.id + "." + nm[0], n: nm[0], x: x - 40, y: y, dx: -1, dy: 0 }, { k: p.id + "." + nm[1], n: nm[1], x: x + 10, y: y - 40, dx: 0, dy: -1 }, { k: p.id + "." + nm[2], n: nm[2], x: x + 10, y: y + 40, dx: 0, dy: 1 }]; }
    if (p.t === "AZ") return SEGP.map(function(s, i){ return { k: p.id + "." + s[1], n: s[0], x: x - 20, y: y + 20 + i * 20, dx: -1, dy: 0 }; }).concat([{ k: p.id + ".3", n: "K", x: x + 40, y: y + 190, dx: 0, dy: 1 }]);
    return []; }

  /* --- Seite --- */
  var S = null, sel = null, wiring = null, sim = null, undo = [], svg, wrap, msgBox, propBox, scopeCv, simBtn, zoom = window.innerWidth < 760 ? 0.7 : 1.25;
  var curEx = null, resBtn = null;
  function save(){ try { localStorage.setItem("iclab_bau", JSON.stringify(S)); if (curEx) localStorage.setItem("iclab_bau_ex", curEx); else localStorage.removeItem("iclab_bau_ex"); } catch(e){} if (resBtn) resBtn.hidden = !curEx; }
  function snap(v){ return Math.round(v / G) * G; }
  function nid(t){ var p = PFX[t] || t, n = 1; while (S.parts.some(function(q){ return q.id === p + n; })) n++; return p + n; }
  function push(){ undo.push(JSON.stringify(S)); if (undo.length > 60) undo.shift(); }
  function part(id){ for (var i = 0; i < S.parts.length; i++) if (S.parts[i].id === id) return S.parts[i]; return null; }
  function allTerms(){ var m = {}; S.parts.forEach(function(p){ terms(p).forEach(function(t){ m[t.k] = t; }); }); return m; }
  function addPart(t, ic, x, y){ push(); var p = { id: nid(t === "ic" ? "ic" : t), t: t, x: snap(x), y: snap(y), r: 0 };
    if (ic) p.ic = ic; if (t === "R") p.v = 330; if (t === "C") p.v = 10e-6; if (t === "LED") p.c = "#ff4d4d"; if (t === "TG") p.f = 1; if (t === "VS") p.u = 2.5; if (t === "PT"){ p.v = 10e3; p.pos = 50; } if (t === "SIN"){ p.w = "sin"; p.a = 1; p.f = 1000; p.o = 0; } if (t === "OP") p.typ = "lm358"; if (t === "PD") p.l = .5; if (t === "TK") p.ch = Math.min(3, S.parts.filter(function(q){ return q.t === "TK"; }).length);
    S.parts.push(p); sel = { p: p.id }; save(); render(); return p; }

  function body(p){
    var x = p.x, y = p.y, s = "", lab = "", v = (p.r || 0) % 2 === 1, tr = "translate(" + x + "," + y + ")" + (p.r ? " rotate(" + (90 * p.r) + ")" : "");
    function L(a){ return '<path d="M-30 0H' + (-a) + "M" + a + ' 0H30"/>'; }
    if (p.t === "ic"){ var g = icGeo(p), d = g.d;
      s = '<rect class="bx" x="' + x + '" y="' + y + '" width="' + g.W + '" height="' + g.H + '" rx="5"/>' + (g.sip || g.fn ? "" : '<path class="nt" d="M' + (x + g.W / 2 - 8) + " " + y + "a8 8 0 0 0 16 0\"/>");
      g.t.forEach(function(t){ var ex2 = t.dx ? (t.dx < 0 ? x : x + g.W) : t.x, ey = t.dy ? (t.dy < 0 ? y : y + g.H) : t.y; s += '<path d="M' + ex2 + " " + ey + "L" + t.x + " " + t.y + '"/>';
        var nx = t.dy ? t.x : t.dx < 0 ? x + 5 : x + g.W - 5, ny = t.dy ? (t.dy < 0 ? y + 11 : y + g.H - 5) : t.y + 3.5; s += '<text class="pn" x="' + nx + '" y="' + ny + '" text-anchor="' + (t.dy ? "middle" : t.dx < 0 ? "start" : "end") + '">' + esc(t.n) + "</text>";
        s += '<text class="pi" x="' + (t.dx ? t.x + t.dx * -10 : t.x + 7) + '" y="' + (t.dx ? t.y - 4 : t.dy < 0 ? t.y + 9 : t.y - 4) + '" text-anchor="' + (t.dx ? "middle" : "start") + '">' + t.k.split(".")[1] + "</text>"; });
      var cx = x + g.W / 2, cy = g.sip ? y + 24 : y + g.H / 2; s += '<text class="id" x="' + cx + '" y="' + (cy - 3) + '" text-anchor="middle">' + p.id + '</text><text class="nm" x="' + cx + '" y="' + (cy + 12) + '" text-anchor="middle">' + esc(d.name.split(" / ")[0]) + "</text>";
      if (!MOD[d.id] && !AOP[d.id]) s += '<text class="ns" x="' + cx + '" y="' + (cy + 25) + '" text-anchor="middle">' + T("ohne Simulation", "sans simulation") + "</text>";
      return s; }
    if (p.t === "R") s = L(15) + '<rect class="bd" x="-15" y="-6" width="30" height="12"/>';
    else if (p.t === "C") s = L(4) + '<path d="M-4 -11V11M4 -11V11" stroke-width="2.6"/>';
    else if (p.t === "PD") s = L(9) + '<path class="bd lf" d="M-9 -9V9L9 0Z"/><path d="M9 -9V9"/><path d="M-12 -22l6 6M-4 -24l6 6" stroke-width="1.3"/><path d="M-6 -16l-3 0.5M-6 -16l0.5 -3M2 -18l-3 0.5M2 -18l0.5 -3" stroke-width="1.1"/>';
    else if (p.t === "LED" || p.t === "D") s = L(9) + '<path class="bd lf" d="M-9 -9V9L9 0Z"/><path d="' + (p.t === "D" && p.z ? "M5 -9H9V9H13" : "M9 -9V9") + '"/>' + (p.t === "LED" ? '<path d="M-1 -13l6 -7M5 -11l6 -7" stroke-width="1.3"/>' : "");
    else if (p.t === "TA") s = L(14) + '<circle class="bd" cx="-14" cy="0" r="2.6"/><circle class="bd" cx="14" cy="0" r="2.6"/><path class="kn" d="M-16 -9H16M0 -9V-17M-7 -17H7"/>';
    else if (p.t === "SW") s = L(14) + '<circle class="bd" cx="-14" cy="0" r="2.6"/><circle class="bd" cx="14" cy="0" r="2.6"/><path class="kn" d="M-14 0L12 -12"/>';
    else if (p.t === "SU") s = L(10) + '<rect class="bd lf" x="-10" y="-8" width="20" height="16" rx="3"/><path d="M-4 -3v6M0 -5v10M4 -3v6" stroke-width="1.3"/>';
    else if (p.t === "LP") s = L(12) + '<circle class="bd lf" cx="0" cy="0" r="12"/><path d="M-8.5 -8.5L8.5 8.5M-8.5 8.5L8.5 -8.5"/>';
    if (s) s = '<rect class="hit" x="-26" y="-22" width="52" height="36"/>' + s;
    if (s && p.lb === 0) return '<g transform="' + tr + '">' + s + "</g>";
    if (s){ var top = p.t === "TA" || p.t === "SW" || p.t === "LED" ? 29 : p.t === "LP" || p.t === "C" ? 19 : 15, lft = v && p.t === "LED" && p.r === 1, lx = v ? (lft ? x - 18 : x + (p.t === "LP" ? 20 : 16)) : x, ly = v ? y + 4 : y - top, an = v ? (lft ? "end" : "start") : "middle", val = p.t === "R" ? fmt(p.v, "Ω") : p.t === "C" ? fmt(p.v, "F") : p.t === "D" && p.z ? "Z " + p.z + " V" : "";
      return '<g transform="' + tr + '">' + s + '</g><text class="id" x="' + lx + '" y="' + (v ? y - 3 : ly) + '" text-anchor="' + an + '">' + p.id + "</text>" + (val ? '<text class="vl" x="' + lx + '" y="' + (v ? y + 11 : y + (p.t === "C" || p.t === "LP" ? 28 : 24)) + '" text-anchor="' + an + '">' + val + "</text>" : ""); }
    if (p.t === "RL"){ var ry = p, cl = sim && sim.ana && sim.ana.E ? (sim.ana.E.filter(function(q){ return q.ry === ry; })[0] || {}).cl : 0; return '<rect class="hit" x="' + (x - 40) + '" y="' + (y - 36) + '" width="80" height="72"/><path d="M' + (x - 40) + " " + (y - 20) + "H" + (x - 14) + "V" + (y - 14) + "M" + (x - 40) + " " + (y + 20) + "H" + (x - 14) + "V" + (y + 14) + "M" + (x + 40) + " " + (y - 20) + "H" + (x + 14) + "M" + (x + 40) + " " + (y + 20) + "H" + (x + 14) + '"/><rect class="bd lf" x="' + (x - 22) + '" y="' + (y - 14) + '" width="16" height="28"/><path class="ry-o" d="M' + (x + 14) + " " + (y - 20) + "L" + (x + 6) + " " + (y + 12) + '" stroke-width="1.8"/><path class="ry-c" d="M' + (x + 14) + " " + (y - 20) + "L" + (x + 14) + " " + (y + 18) + '" stroke-width="1.8"/><circle class="bd" cx="' + (x + 14) + '" cy="' + (y - 20) + '" r="2.4"/><circle class="bd" cx="' + (x + 14) + '" cy="' + (y + 20) + '" r="2.4"/><path d="M' + (x - 6) + " " + y + "H" + (x + 4) + '" stroke-dasharray="3 2" stroke-width="1.1"/><text class="id" x="' + x + '" y="' + (y - 40) + '" text-anchor="middle">' + p.id + '</text>'; }
    if (p.t === "VS") return '<rect class="hit" x="' + (x - 20) + '" y="' + (y - 20) + '" width="40" height="40"/><path d="M' + (x + 18) + " " + y + "H" + (x + 40) + '"/><circle class="bd" cx="' + x + '" cy="' + y + '" r="18"/><path d="M' + (x - 6) + " " + (y - 5) + "h12M" + x + " " + (y - 11) + "v12M" + (x - 6) + " " + (y + 9) + 'h12" stroke-width="1.6"/><text class="id" x="' + x + '" y="' + (y - 23) + '" text-anchor="middle">' + p.id + '</text><text class="vl" x="' + x + '" y="' + (y + 32) + '" text-anchor="middle" data-lv="1">' + fmt(p.u, "V") + "</text>";
    if (p.t === "PT") return '<rect class="hit" x="' + (x - 26) + '" y="' + (y - 14) + '" width="52" height="40"/><path d="M' + (x - 30) + " " + y + "H" + (x - 15) + "M" + (x + 15) + " " + y + "H" + (x + 30) + "M" + x + " " + (y + 30) + "V" + (y + 10) + '"/><rect class="bd" x="' + (x - 15) + '" y="' + (y - 6) + '" width="30" height="12"/><path class="ar" d="M' + x + " " + (y + 7) + "l-4 7h8z" + '"/><text class="id" x="' + x + '" y="' + (y - 13) + '" text-anchor="middle">' + p.id + " · " + fmt(p.v, "Ω") + ' · <tspan class="vl" data-lv="1">' + Math.round(p.pos) + " %</tspan></text>";
    if (p.t === "V") return '<rect class="hit" x="' + (x - 14) + '" y="' + (y - 16) + '" width="28" height="34"/><path d="M' + x + " " + (y + 20) + "V" + y + "M" + (x - 10) + " " + y + "H" + (x + 10) + '"/><text class="id" x="' + x + '" y="' + (y - 5) + '" text-anchor="middle">+5 V</text>';
    if (p.t === "GND") return '<rect class="hit" x="' + (x - 14) + '" y="' + (y - 16) + '" width="28" height="30"/><path d="M' + x + " " + (y - 20) + "V" + y + "M" + (x - 11) + " " + y + "H" + (x + 11) + "M" + (x - 7) + " " + (y + 5) + "H" + (x + 7) + "M" + (x - 3) + " " + (y + 10) + "H" + (x + 3) + '"/>';
    if (p.t === "TG") return '<path d="M' + (x + 18) + " " + y + "H" + (x + 40) + '"/><circle class="bd" cx="' + x + '" cy="' + y + '" r="18"/><path d="M' + (x - 10) + " " + (y + 5) + "h5v-10h10v10h5" + '" stroke-width="1.6"/><text class="id" x="' + x + '" y="' + (y - 23) + '" text-anchor="middle">' + p.id + " · " + fhz(p.f) + "</text>";
    if (p.t === "TK"){ var c = CH[p.ch || 0]; return '<path d="M' + (x - 30) + " " + y + "H" + (x - 12) + '"/><path class="bd" d="M' + (x - 12) + " " + (y - 8) + "H" + (x + 14) + "L" + (x + 22) + " " + y + "L" + (x + 14) + " " + (y + 8) + "H" + (x - 12) + 'Z" style="stroke:' + c[0] + '"/><text class="id" x="' + (x + 4) + '" y="' + (y + 3.5) + '" text-anchor="middle" style="fill:' + c[0] + ';font-size:9px">' + c[1] + "</text>"; }
    if (p.t === "SIN") return '<rect class="hit" x="' + (x - 20) + '" y="' + (y - 20) + '" width="60" height="40"/><path d="M' + (x + 18) + " " + y + "H" + (x + 40) + '"/><circle class="bd" cx="' + x + '" cy="' + y + '" r="18"/><path d="' + (p.w === "rect" ? "M" + (x - 10) + " " + (y + 5) + "v-10h10v10h10v-10" : p.w === "tri" ? "M" + (x - 11) + " " + (y + 6) + "L" + (x - 4) + " " + (y - 6) + "L" + (x + 4) + " " + (y + 6) + "L" + (x + 11) + " " + (y - 6) : p.w === "dc" ? "M" + (x - 10) + " " + y + "h20" : "M" + (x - 11) + " " + y + "q5.5 -13 11 0t11 0") + '" stroke-width="1.6"/><text class="id" x="' + x + '" y="' + (y - 32) + '" text-anchor="middle">' + p.id + '</text><text class="vl" x="' + x + '" y="' + (y - 21) + '" text-anchor="middle">' + (p.w === "dc" ? fmt(p.o || 0, "V") : fmt(p.f, "Hz") + " · " + fmt(p.a, "V")) + "</text>";
    if (p.t === "VN") return '<rect class="hit" x="' + (x - 14) + '" y="' + (y - 20) + '" width="28" height="38"/><path d="M' + x + " " + (y - 20) + "V" + y + "M" + (x - 10) + " " + y + "H" + (x + 10) + '"/><text class="id" x="' + x + '" y="' + (y + 14) + '" text-anchor="middle">−5 V</text>';
    if (p.t === "OP"){ var pr0 = (OPTY.filter(function(o){ return o[0] === (p.typ || "lm358"); })[0] || OPTY[0])[1]; return '<rect class="hit" x="' + (x - 40) + '" y="' + (y - 44) + '" width="96" height="88"/><path class="bd" d="M' + (x - 30) + " " + (y - 40) + "V" + (y + 40) + "L" + (x + 40) + " " + y + 'Z"/><path d="M' + (x - 50) + " " + (y - 20) + "H" + (x - 30) + "M" + (x - 50) + " " + (y + 20) + "H" + (x - 30) + "M" + (x + 40) + " " + y + "H" + (x + 60) + "M" + (x - 10) + " " + (y - 50) + "V" + (y - 29) + "M" + (x - 10) + " " + (y + 50) + "V" + (y + 29) + '"/><text class="nm" x="' + (x - 25) + '" y="' + (y - 16) + '" style="font-size:14px">−</text><text class="nm" x="' + (x - 26) + '" y="' + (y + 25) + '" style="font-size:14px">+</text><text class="id" x="' + (x - 14) + '" y="' + (y - 2) + '" text-anchor="middle">' + p.id + '</text><text class="vl" x="' + (x - 14) + '" y="' + (y + 12) + '" text-anchor="middle">' + pr0 + "</text>"; }
    if (p.t === "K") return '<circle class="dot" cx="' + x + '" cy="' + y + '" r="4"/>';
    if (p.t === "Q" || p.t === "QP" || p.t === "M"){ var g2 = p.t === "M" ? '<path d="M-40 0H-15M-15 -13V13M-9 -15V-7M-9 -4V4M-9 7V15M-9 -11H10V-40M-9 11H10V40M-9 0H10V11"/><path class="ar" d="M-8 0l8 -4v8z"/>' :
        '<path d="M-40 0H-10M-10 -14V14M-10 -7L10 -18V-40M-10 7L10 18V40"/>' + (p.t === "Q" ? '<path class="ar" d="M10 18l-9.5 -1 4 -6.5z"/>' : '<path class="ar" d="M-10 -7l9.5 -1 -4 6.5z"/>');
      return '<g transform="translate(' + x + "," + y + ')"><circle class="bd" cx="2" cy="0" r="24"/>' + g2 + '</g><text class="id" x="' + (x + 30) + '" y="' + (y - 2) + '">' + p.id + '</text><text class="vl" x="' + (x + 30) + '" y="' + (y + 12) + '">' + (p.t === "Q" ? "BC337" : p.t === "QP" ? "BC557" : "IRLZ44N") + "</text>"; }
    if (p.t === "AZ"){ var o = '<rect class="bx" x="' + x + '" y="' + y + '" width="80" height="180" rx="6"/>', sx = x + 22, sy = y + 40, sg = { a: [sx + 4, sy, sx + 34, sy], b: [sx + 38, sy + 4, sx + 38, sy + 44], c: [sx + 38, sy + 52, sx + 38, sy + 92], d: [sx + 4, sy + 96, sx + 34, sy + 96], e: [sx, sy + 52, sx, sy + 92], f: [sx, sy + 4, sx, sy + 44], g: [sx + 4, sy + 48, sx + 34, sy + 48] };
      Object.keys(sg).forEach(function(k){ var q = sg[k]; o += '<path class="sg" data-s="' + k + '" d="M' + q[0] + " " + q[1] + "L" + q[2] + " " + q[3] + '"/>'; }); o += '<circle class="sg" data-s="DP" cx="' + (sx + 46) + '" cy="' + (sy + 98) + '" r="3"/>';
      SEGP.forEach(function(s, i){ o += '<path d="M' + x + " " + (y + 20 + i * 20) + "H" + (x - 20) + '"/><text class="pi" x="' + (x - 10) + '" y="' + (y + 16 + i * 20) + '" text-anchor="middle">' + s[0] + "</text>"; });
      return o + '<path d="M' + (x + 40) + " " + (y + 180) + "V" + (y + 190) + '"/><text class="pi" x="' + (x + 48) + '" y="' + (y + 190) + '">K</text><text class="id" x="' + (x + 40) + '" y="' + (y - 6) + '" text-anchor="middle">' + p.id + "</text>"; }
    return ""; }
  function wpath(w, T2, extra){ var a = T2[w.a], b = T2[w.b]; if (!a) return "";
    if (!extra && b && !(w.pts && w.pts.length) && ((a.dx || a.dy) || (b.dx || b.dy))){ var ax = a.x + (a.dx || 0) * 10, ay = a.y + (a.dy || 0) * 10, bx = b.x + (b.dx || 0) * 10, by = b.y + (b.dy || 0) * 10, d0 = "M" + a.x + " " + a.y + "L" + ax + " " + ay, ha = !!a.dx, hb = !!b.dx, va = !!a.dy, vb = !!b.dy;
      if ((ha || !va) && (hb || !vb) && (ha || hb)){ var xm = (a.dx && a.dx === b.dx) ? (a.dx < 0 ? Math.min(ax, bx) : Math.max(ax, bx)) : (ha && hb ? snap((ax + bx) / 2) : ha ? bx : ax); d0 += "H" + xm + "V" + by + "H" + bx; }
      else if (va && vb){ var ym = (a.dy === b.dy) ? (a.dy < 0 ? Math.min(ay, by) : Math.max(ay, by)) : snap((ay + by) / 2); d0 += "V" + ym + "H" + bx + "V" + by; }
      else if (ha){ d0 += "H" + bx + "V" + by; } else { d0 += "V" + by + "H" + bx; }
      return d0 + "L" + b.x + " " + b.y; } var pts = [[a.x, a.y]].concat(w.pts || []); if (extra) pts.push(extra); else if (b) pts.push([b.x, b.y]); else return "";
    var d = "M" + pts[0][0] + " " + pts[0][1]; for (var i = 1; i < pts.length; i++){ var p0 = pts[i - 1], p1 = pts[i]; if (p0[0] !== p1[0] && p0[1] !== p1[1]) d += "H" + p1[0]; d += (p0[0] !== p1[0] || p0[1] !== p1[1]) ? "V" + p1[1] + "H" + p1[0] : ""; } return d; }
  function render(){
    if (anaBtn) anaBtn.classList.toggle("on", forceAna || hasAna());
    if (!svg) return; var T2 = allTerms(), s = '<defs><pattern id="bgr" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="0" cy="0" r="1" fill="#d6d0bd"/></pattern></defs><rect x="-2000" y="-2000" width="6000" height="6000" fill="url(#bgr)" class="bgr"/>';
    S.wires.forEach(function(w, i){ var d = wpath(w, T2); if (d) s += '<path class="wr' + (sel && sel.w === i ? " sel" : "") + '" data-w="' + i + '" d="' + d + '"/><path class="wh" data-w="' + i + '" d="' + d + '"/>'; });
    S.parts.forEach(function(p){ s += '<g class="pt pt-' + p.t + (sel && sel.p === p.id ? " sel" : "") + '" data-p="' + p.id + '">' + body(p) + "</g>"; });
    var cnt = {}; S.wires.forEach(function(w){ cnt[w.a] = (cnt[w.a] || 0) + 1; cnt[w.b] = (cnt[w.b] || 0) + 1; });
    Object.keys(T2).forEach(function(k){ var t = T2[k], c = t.ty === "v" ? "#e03131" : t.ty === "g" ? "#495057" : t.ty === "i" ? "#f08c00" : t.ty === "o" ? "#1098ad" : "#22324a";
      s += '<circle class="tm' + (cnt[k] ? " on" : "") + '" data-t="' + k + '" cx="' + t.x + '" cy="' + t.y + '" r="' + (cnt[k] > 1 ? 4 : 3.6) + '" style="--c:' + c + '"><title>' + esc(k + (t.n ? " – " + t.n : "")) + "</title></circle>"; });
    if (wiring) s += '<path class="wp" d=""/>';
    svg.innerHTML = s; paintSim(); props(); }
  /* --- Eigenschaften der Auswahl --- */
  function props(){ if (!propBox) return; var h = "";
    if (sel && sel.p){ var p = part(sel.p); if (!p){ propBox.innerHTML = ""; return; } h = "<b>" + esc(p.id) + "</b> ";
      if (p.t === "ic"){ var d = icById(p.ic); h += esc(d.name) + " – " + esc(T(d.k[0], d.k[1])) + (MOD[p.ic] ? (MOD[p.ic].note ? " <i>(" + esc(T(MOD[p.ic].note[0], MOD[p.ic].note[1])) + ")</i>" : "") : AOP[p.ic] ? " <i>(" + T("Analog-Modell: Verstärkung, Bandbreite, Slew-Rate, Versorgungsgrenzen", "modèle analogique") + ")</i>" : " <i>(" + T("wird nicht simuliert – zum Aufbauen und Üben", "non simulé") + ")</i>") + ' <a class="ic-ch" href="index.html#/s/' + (LINK[p.ic] || "") + '">📖 ' + T("Datenblatt-Seite", "Fiche") + "</a>"; }
      function selc(k, list, cur, f){ var o = '<select data-k="' + k + '">'; list.forEach(function(v){ var val = Array.isArray(v) ? v[0] : v; o += '<option value="' + val + '"' + (String(val) === String(cur) ? " selected" : "") + ">" + esc(Array.isArray(v) ? v[1] : f(v)) + "</option>"; }); return o + "</select>"; }
      if (p.t === "R") h += selc("v", RV, p.v, function(v){ return fmt(v, "Ω"); }); if (p.t === "C") h += selc("v", CV, p.v, function(v){ return fmt(v, "F"); });
      if (p.t === "LED") h += selc("c", LC, p.c); if (p.t === "PD") h += selc("l", [[0, T("dunkel", "obscurité")], [.1, T("schwaches Licht", "faible")], [.5, T("Raumlicht", "ambiante")], [1, T("helles Licht", "forte")]], p.l == null ? .5 : p.l); if (p.t === "D") h += selc("z", [[0, T("Diode (1N4148)", "Diode (1N4148)")], [2.7, T("Z-Diode 2,7 V", "Zener 2,7 V")], [3.3, T("Z-Diode 3,3 V", "Zener 3,3 V")], [4.7, T("Z-Diode 4,7 V", "Zener 4,7 V")], [5.1, T("Z-Diode 5,1 V", "Zener 5,1 V")], [6.2, T("Z-Diode 6,2 V", "Zener 6,2 V")], [9.1, T("Z-Diode 9,1 V", "Zener 9,1 V")], [12, T("Z-Diode 12 V", "Zener 12 V")]], p.z || 0); if (p.t === "TG") h += selc("f", FQ, p.f, fhz); if (p.t === "TK") h += selc("ch", CH.map(function(c, i){ return [i, c[1]]; }), p.ch || 0);
      if (p.t === "ic" && !icGeo({ x: 0, y: 0, id: "x", ic: p.ic }).sip) h += ' <button type="button" class="ic-ch" data-a="dip">' + (p.dip ? T("🔀 Pins wie im Schaltplan", "🔀 broches comme le schéma") : T("🔀 Pins wie am Chip (DIP)", "🔀 broches comme la puce")) + "</button>";
      if (p.t === "SIN") h += selc("w", [["sin", T("Sinus", "Sinus")], ["rect", T("Rechteck", "Carré")], ["tri", T("Dreieck", "Triangle")], ["dc", T("Gleichspannung", "Continu")]], p.w) + " " + selc("a", [.05, .1, .2, .5, 1, 2, 3, 5], p.a, function(v){ return "± " + fmt(v, "V"); }) + " " + selc("f", [10, 50, 100, 200, 500, 1e3, 2e3, 5e3, 1e4, 2e4, 5e4, 1e5, 2e5, 5e5], p.f, function(v){ return fmt(v, "Hz"); }) + " " + selc("o", [-2.5, -1, -.5, 0, .5, 1, 2.5], p.o || 0, function(v){ return T("Offset ", "Offset ") + fmt(v, "V"); });
      if (p.t === "OP") h += selc("typ", OPTY, p.typ || "lm358");
      if (p.t === "VS") h += ' <input type="range" min="0" max="5" step="0.05" value="' + p.u + '" data-k="u"> <output>' + fmt(p.u, "V") + "</output>";
      if (p.t === "PT") h += ' <input type="range" min="0" max="100" step="1" value="' + p.pos + '" data-k="pos"> <output>' + Math.round(p.pos) + " %</output> " + selc("v", [1e3, 10e3, 100e3], p.v, function(v){ return fmt(v, "Ω"); });
      if (/^(R|LED|D|PD|C|TA|SW|LP|SU|OP|SIN)$/.test(p.t) && p.t !== "SIN" && p.t !== "OP") h += ' <button type="button" class="ic-ch" data-a="rot">⟳ ' + T("drehen", "pivoter") + "</button>";
      h += ' <button type="button" class="ic-ch" data-a="del">🗑 ' + T("löschen", "supprimer") + "</button>"; }
    else if (sel && sel.w != null) h = "<b>" + T("Draht", "Fil") + "</b> " + esc(S.wires[sel.w].a + " → " + S.wires[sel.w].b) + ' <button type="button" class="ic-ch" data-a="del">🗑 ' + T("löschen", "supprimer") + "</button>";
    else h = wiring ? "🔌 " + T("Draht läuft: klicke auf den Ziel-Pin. Klick auf freie Fläche = Knick. Rechtsklick oder Esc = abbrechen.", "Fil en cours : clique sur la broche cible.") : T("Tipp: Bauteil in der Liste anklicken, auf der Fläche verschieben, dann Pin anklicken → Pin anklicken = Draht.", "Astuce : ajoute un composant, puis clique broche → broche pour un fil.");
    propBox.innerHTML = h;
    propBox.querySelectorAll("select").forEach(function(se){ se.onchange = function(){ var p = part(sel.p); push(); var k = se.dataset.k, v = se.value; p[k] = (k === "c" || k === "w" || k === "typ") ? v : +v; save(); render(); }; });
    propBox.querySelectorAll('input[type="range"]').forEach(function(ri){ ri.oninput = function(){ var p = part(sel.p), k = ri.dataset.k; p[k] = +ri.value; save(); var txt = k === "u" ? fmt(p.u, "V") : Math.round(p.pos) + " %"; ri.nextElementSibling.textContent = txt; var lv = svg.querySelector('[data-p="' + p.id + '"] [data-lv]'); if (lv) lv.textContent = txt; }; });
    propBox.querySelectorAll("button").forEach(function(b){ b.onclick = function(){ if (b.dataset.a === "del") del(); else { var p = part(sel.p); push(); if (b.dataset.a === "dip") p.dip = !p.dip; else p.r = ((p.r || 0) + 1) % 4; save(); render(); } }; }); }
  function del(){ if (!sel) return; push(); if (sel.p){ var id = sel.p; S.parts = S.parts.filter(function(q){ return q.id !== id; }); S.wires = S.wires.filter(function(w){ return w.a.split(".")[0] !== id && w.b.split(".")[0] !== id; }); }
    else if (sel.w != null) S.wires.splice(sel.w, 1); sel = null; save(); render(); }

  /* --- Simulation --- */
  function uf(){ var par = {}; function f(x){ while (par[x] && par[x] !== x) x = par[x] = par[par[x]] || par[x]; return x; } function u(a, b){ a = f(a); b = f(b); if (a !== b) par[a] = b; } return { f: f, u: u }; }
  function solve(dt){
    var T2 = allTerms(), joins = sim.joins || [], res;
    for (var it = 0; it < 10; it++){
      var U = uf(); Object.keys(T2).forEach(function(k){ U.f(k); }); S.wires.forEach(function(w){ if (T2[w.a] && T2[w.b]) U.u(w.a, w.b); });
      S.parts.forEach(function(p){ if ((p.t === "TA" && sim.press[p.id]) || (p.t === "SW" && p.on)) U.u(p.id + ".1", p.id + ".2"); if (p.t === "AZ") U.u(p.id + ".3", p.id + ".8"); });
      joins.forEach(function(j){ if (T2[j[0]] && T2[j[1]]) U.u(j[0], j[1]); });
      var N = {}; function net(k){ var r = U.f(k); return N[r] = N[r] || { s1: 0, s0: 0, w: null, v: null, st: null, id: r }; }
      Object.keys(T2).forEach(net);
      S.parts.forEach(function(p){ if (p.t === "VS"){ var nv0 = net(p.id + ".1"); nv0.sa = p.u; if (p.u >= 2.5) nv0.s1++; else nv0.s0++; } });
      S.parts.forEach(function(p){ if (p.t === "V") net(p.id + ".1").s1++; if (p.t === "GND") net(p.id + ".1").s0++; if (p.t === "TG") net(p.id + ".1")[sim.clk[p.id] ? "s1" : "s0"]++; });
      S.parts.forEach(function(p){ var o = sim.out[p.id]; if (o) Object.keys(o).forEach(function(k){ if (o[k] === 1) net(k).s1++; else if (o[k] === 0) net(k).s0++; }); });
      Object.keys(N).forEach(function(r){ var n = N[r]; if (n.sa != null && n.s1 + n.s0 === 1){ n.v = n.s1 ? 1 : 0; n.st = "s"; n.a = n.sa; } else if (n.s1 && n.s0){ n.v = "S"; n.st = "s"; } else if (n.s1){ n.v = 1; n.st = "s"; n.a = 5; } else if (n.s0){ n.v = 0; n.st = "s"; n.a = 0; } });
      var edges = []; S.parts.forEach(function(p){ if (p.t === "R") edges.push([net(p.id + ".1"), net(p.id + ".2"), Math.max(1, p.v)]); if (p.t === "PT"){ var q = Math.max(0.005, Math.min(0.995, p.pos / 100)); edges.push([net(p.id + ".1"), net(p.id + ".S"), p.v * q], [net(p.id + ".S"), net(p.id + ".2"), p.v * (1 - q)]); } });
      for (var gs = 0; gs < 40; gs++){ var chg = 0; Object.keys(N).forEach(function(r){ var n = N[r]; if (n.st === "s") return; var G0 = 0, I0 = 0; edges.forEach(function(e){ var o = e[0] === n ? e[1] : e[1] === n ? e[0] : null; if (o && o !== n && o.a != null){ G0 += 1 / e[2]; I0 += o.a / e[2]; } }); if (G0){ var na = I0 / G0; if (n.a == null || Math.abs(n.a - na) > 1e-4){ n.a = na; chg = 1; } } }); if (!chg) break; }
      Object.keys(N).forEach(function(r){ var n = N[r]; if (n.st !== "s" && n.a != null){ n.v = n.a >= 2.5 ? 1 : 0; n.st = "w"; } });
      for (var k2 = 0; k2 < 12; k2++){ var ch = 0; S.parts.forEach(function(p){
        if (p.t === "D"){ var an = net(p.id + ".1"), ka = net(p.id + ".2"); if (an.v === 1 && ka.v == null){ ka.v = 1; ka.a = Math.max(0, (an.a || 5) - .7); ka.st = an.st === "s" ? "d" : "w"; ch = 1; } } }); if (!ch) break; }
      var val = function(k){ var n = net(k); return n.v === "S" ? null : n.v; };
      var nj = [], nout = {}; sim.warn = [];
      S.parts.forEach(function(p){
        if (p.t === "Q" && val(p.id + ".B") === 1) nj.push([p.id + ".C", p.id + ".E"]);
        if (p.t === "QP" && val(p.id + ".B") === 0) nj.push([p.id + ".E", p.id + ".C"]);
        if (p.t === "M" && val(p.id + ".G") === 1) nj.push([p.id + ".D", p.id + ".S"]);
        if (p.t !== "ic") return; var md = MOD[p.ic]; if (!md) return; var g = icGeo(p), byN = {}; g.t.forEach(function(t){ byN[t.n] = t; });
        var pw = md.pw || g.t.filter(function(t){ return /^(VCC|VDD|V\+|GND|VSS)$/.test(t.n); }).map(function(t){ return t.n; }), ok = true;
        pw.forEach(function(n){ var t = byN[n]; if (!t) return; var v = val(t.k); if ((t.ty === "v" || /VCC|VDD/.test(n)) ? v !== 1 : v !== 0) ok = false; });
        if (!ok){ sim.warn.push(p.id + ": " + T("keine Versorgung – " + pw.join(" und ") + " verbinden (+5 V / GND).", "pas d’alimentation – relier " + pw.join(" et ") + ".")); return; }
        var st = sim.st[p.id] = sim.st[p.id] || {}, o = {};
        var io = { st: st, dt: dt, g: function(n){ var t = byN[n]; return t ? val(t.k) : null; }, a: function(n){ var t = byN[n]; if (!t) return null; var q = net(t.k); return q.v === "S" ? null : q.a != null ? q.a : null; }, s: function(n, v){ var t = byN[n]; if (t) o[t.k] = v; }, j: function(a, b){ if (byN[a] && byN[b]) nj.push([byN[a].k, byN[b].k]); },
          e: function(n){ var t = byN[n]; if (!t) return null; var a = sim.prev[t.k], b = val(t.k); return a === 0 && b === 1 ? "r" : a === 1 && b === 0 ? "f" : null; },
          led: function(a, k){ if (!byN[a] || !byN[k]) return false; return val(byN[a].k) === 1 && val(byN[k].k) === 0; },
          same: function(a, b){ return !!(byN[a] && byN[b]) && U.f(byN[a].k) === U.f(byN[b].k); },
          capOn: function(n){ if (!byN[n]) return 0; var r = U.f(byN[n].k), c = 0; S.parts.forEach(function(q){ if (q.t === "C" && (U.f(q.id + ".1") === r || U.f(q.id + ".2") === r)) c += q.v; }); return c; },
          osc: function(n){ if (!byN[n]) return false; var r = U.f(byN[n].k); return S.parts.some(function(q){ return q.t === "C" && (U.f(q.id + ".1") === r || U.f(q.id + ".2") === r); }); },
          rBetween: function(a, b){ if (!byN[a] || (b !== "+" && !byN[b])) return 0; var ra = U.f(byN[a].k), rb = b === "+" ? null : U.f(byN[b].k), sum = 0;
            S.parts.forEach(function(q){ if (q.t !== "R") return; var x = U.f(q.id + ".1"), y = U.f(q.id + ".2"), hit = function(r){ return b === "+" ? net(r === x ? q.id + ".1" : q.id + ".2").v === 1 && net(r === x ? q.id + ".1" : q.id + ".2").st === "s" : r === rb; };
              if (x === ra && hit(y)) sum = q.v; else if (y === ra && hit(x)) sum = q.v; }); return sum; },
          warn: function(m){ if (sim.upd) sim.uw.push(p.id + ": " + m); }, info: function(m){ sim.info[p.id] = m; } };
        if (sim.upd && md.upd) md.upd(io); md.out(io); nout[p.id] = o;
        g.t.forEach(function(t){ if (t.ty === "i" && !(md.ex && md.ex.indexOf(t.n) >= 0) && !(md.ex && md.ex.indexOf("Φ1") >= 0 && t.n === "Φ1" && io.osc("Φ1")) && net(t.k).v == null) sim.warn.push(p.id + " " + T("Pin", "broche") + " " + t.k.split(".")[1] + " (" + t.n + ") " + T("hängt offen – an +5 V, GND oder ein Signal legen.", "en l’air – relier à +5 V, GND ou un signal.")); }); });
      sim.upd = false;
      var same = JSON.stringify(nout) === JSON.stringify(sim.out) && JSON.stringify(nj) === JSON.stringify(joins); sim.out = nout; joins = sim.joins = nj; res = { N: N, net: net, val: val, U: U };
      if (same) break; }
    return res; }
  function tick(){ if (!sim) return; var now = performance.now(), dt = Math.min(0.1, (now - sim.t) / 1000); sim.t = now; sim.time += dt; if (sim.ana){ anaTick(dt); paintSim(); drawScope(); return; }
    S.parts.forEach(function(p){ if (p.t === "TG") sim.clk[p.id] = ((sim.time * p.f) % 1) < 0.5 ? 1 : 0; });
    sim.upd = true; sim.uw = []; sim.info = {}; var r = solve(dt); sim.r = r; var T2 = allTerms(); sim.prev = {}; Object.keys(T2).forEach(function(k){ sim.prev[k] = r.val(k); });
    S.parts.forEach(function(p){ if (p.t === "TK"){ var v = r.val(p.id + ".1"); (sim.tr[p.ch || 0] = sim.tr[p.ch || 0] || []).push([sim.time, v]); } });
    sim.tr.forEach(function(a){ while (a && a.length && a[0][0] < sim.time - 8) a.shift(); });
    paintSim(); drawScope(); }
  function paintSim(){
    if (!svg) return; var on = !!(sim && (sim.r || sim.ana)); svg.classList.toggle("run", on); if (!on){ msgs(); return; } if (sim.ana){ paintAna(); return; }
    var r = sim.r, warn = (sim.uw || []).concat(sim.warn), seen = {}, buzz = false;
    svg.querySelectorAll("path.wr").forEach(function(e){ var w = S.wires[+e.dataset.w]; if (!w) return; var n = r.net(w.a); e.setAttribute("data-v", n.v === "S" ? "s" : n.v == null ? "x" : n.v); if (n.v === "S" && !seen[n.id]){ seen[n.id] = 1; warn.push(T("Kurzschluss: HIGH und LOW direkt verbunden (bei ", "Court-circuit (") + w.a + ")."); } });
    function led(a, k, id){ var A = r.net(a), K = r.net(k); if (A.v === 1 && K.v === 0){ if (A.st === "s" && K.st === "s"){ warn.push(id + ": " + T("kein Vorwiderstand – die LED würde durchbrennen!", "pas de résistance – la LED grillerait !")); return "b"; } return "1"; } return "0"; }
    S.parts.forEach(function(p){ var g = svg.querySelector('[data-p="' + p.id + '"]'); if (!g) return;
      if (p.t === "LED"){ var s = led(p.id + ".1", p.id + ".2", p.id); g.setAttribute("data-on", s); g.style.setProperty("--lc", p.c); }
      if (p.t === "LP"){ var a = r.val(p.id + ".1"), b = r.val(p.id + ".2"); g.setAttribute("data-on", (a === 1 && b === 0) || (a === 0 && b === 1) ? "1" : "0"); }
      if (p.t === "SU"){ var a2 = r.val(p.id + ".1"), b2 = r.val(p.id + ".2"), on2 = (a2 === 1 && b2 === 0) || (a2 === 0 && b2 === 1); g.setAttribute("data-on", on2 ? "1" : "0"); if (on2) buzz = true; }
      if (p.t === "TA") g.setAttribute("data-on", sim.press[p.id] ? "1" : "0"); if (p.t === "SW") g.setAttribute("data-on", p.on ? "1" : "0");
      if (p.t === "Q" || p.t === "QP" || p.t === "M"){ var bn = r.net(p.id + "." + (p.t === "M" ? "G" : "B")); if (p.t !== "M" && bn.st === "s" && bn.v != null) warn.push(p.id + ": " + T("Basis hängt direkt am Signal – Basiswiderstand (z. B. 1 kΩ) fehlt.", "il manque la résistance de base.")); }
      if (p.t === "AZ"){ var any = 0; SEGP.forEach(function(sg){ var st = led(p.id + "." + sg[1], p.id + ".3", p.id + " " + sg[0]), e = g.querySelector('[data-s="' + sg[0] + '"]'); if (e) e.setAttribute("data-on", st); }); } });
    if (sim.meas){ var mt = allTerms()[sim.meas]; if (mt){ var mv = r.val(sim.meas), mtx = mv === 1 ? "HIGH ≈ 5 V" : mv === 0 ? "LOW ≈ 0 V" : mv === "S" ? "Kurzschluss" : T("offen / unbestimmt", "indéfini"); svg.insertAdjacentHTML("beforeend", '<g class="mb"><circle cx="' + mt.x + '" cy="' + mt.y + '" r="8" fill="none" stroke="#e8590c" stroke-width="2"/><rect x="' + (mt.x + 10) + '" y="' + (mt.y - 24) + '" width="' + (mtx.length * 6.6 + 14) + '" height="20" rx="5" fill="#fff8e6" stroke="#e8590c"/><text x="' + (mt.x + 17) + '" y="' + (mt.y - 10) + '" style="fill:#c2410c;font-weight:800;font-size:12px">' + esc(mtx) + "</text></g>"); } }
    S.parts.forEach(function(p){ if (p.t === "TG"){ var g2 = svg.querySelector('[data-p="' + p.id + '"]'); if (g2) g2.setAttribute("data-on", sim.clk[p.id] ? "1" : "0"); } });
    beep(buzz); msgs(warn); }
  var AU = null; function beep(on){ try { if (on && !AU){ var ac = new (window.AudioContext || window.webkitAudioContext)(), o = ac.createOscillator(), g = ac.createGain(); o.type = "square"; o.frequency.value = 2300; g.gain.value = .03; o.connect(g); g.connect(ac.destination); o.start(); AU = { ac: ac }; } else if (!on && AU){ AU.ac.close(); AU = null; } } catch(e){ AU = null; } }
  /* Offene Anschlüsse: jedes Bauteil (außer ICs – die prüft die Simulation selbst) braucht an jedem Pin einen Draht, sonst wird nichts Falsches als „richtig" gemeldet */
  function loose(){ var used = {}, out = []; S.wires.forEach(function(w){ used[w.a] = 1; used[w.b] = 1; });
    S.parts.forEach(function(p){ if (p.t === "ic") return; terms(p).forEach(function(t){ if (!used[t.k]) out.push(p.id + ": " + T("Anschluss " + t.k.split(".")[1] + " ist mit nichts verbunden – so kann die Schaltung nicht vollständig arbeiten.", "la borne " + t.k.split(".")[1] + " n’est reliée à rien – le circuit ne peut pas fonctionner complètement.")); }); });
    return out; }
  function msgs(warn){ if (!msgBox) return; if (!sim){ msgBox.innerHTML = '<p class="ic-lb">' + T("▶ Starte die Simulation, um zu sehen, ob alles richtig verdrahtet ist.", "▶ Lance la simulation pour vérifier le câblage.") + "</p>"; return; }
    var u = []; loose().concat(warn || []).forEach(function(w){ if (u.indexOf(w) < 0) u.push(w); }); var h = "";
    if (!S.parts.length) h = "<p>" + T("Noch leer – füge links Bauteile hinzu.", "Vide – ajoute des composants.") + "</p>";
    else if (u.length) h = '<ul class="bw">' + u.slice(0, 12).map(function(w){ return "<li>⚠️ " + esc(w) + "</li>"; }).join("") + "</ul>";
    else h = '<p class="bok">✅ ' + (sim.ana ? T("Die Schaltung läuft. Klicke auf einen Pin, um die Spannung dort zu messen.", "Le circuit fonctionne. Clique une broche pour mesurer.") : T("Alles richtig verdrahtet – die Schaltung läuft.", "Câblage correct – le circuit fonctionne.")) + "</p>";
    Object.keys(sim.info || {}).forEach(function(k){ h += '<p class="ic-lb">⏱ ' + esc(k + ": " + sim.info[k]) + "</p>"; });
    S.parts.forEach(function(p){ if (p.t === "ic" && !MOD[p.ic] && !AOP[p.ic]) h += '<p class="ic-lb">ℹ️ ' + esc(p.id + " (" + icById(p.ic).name.split(" / ")[0] + ") ") + T("wird nicht simuliert (analog) – Aufbau und Pins kannst du trotzdem üben.", "n’est pas simulé (analogique).") + "</p>"; });
    msgBox.innerHTML = h; }
  function drawScope(){ if (!scopeCv) return; scopeCv.style.height = ""; if (sim && sim.ana && !sim.ana.err){ drawAna(); return; } var c = scopeCv, x = c.getContext("2d"), W = c.width = c.clientWidth * (window.devicePixelRatio || 1), H = c.height = 150 * (window.devicePixelRatio || 1), k = W / c.clientWidth;
    x.fillStyle = "#06120f"; x.fillRect(0, 0, W, H); x.strokeStyle = "rgba(109,255,176,.12)"; x.lineWidth = 1; for (var i = 1; i < 8; i++){ x.beginPath(); x.moveTo(i * W / 8, 0); x.lineTo(i * W / 8, H); x.stroke(); }
    var used = []; S.parts.forEach(function(p){ if (p.t === "TK" && used.indexOf(p.ch || 0) < 0) used.push(p.ch || 0); }); used.sort();
    if (!used.length){ x.fillStyle = "#8fe3b9"; x.font = 12 * k + "px Inter,system-ui,sans-serif"; var msg = T("Setze einen Tastkopf (links in der Liste) an eine Leitung – dann erscheint hier ihr Verlauf.", "Place une sonde sur un fil pour voir son signal.").split(" "), line = "", ly = 24 * k; msg.forEach(function(wd){ var tl = line ? line + " " + wd : wd; if (x.measureText(tl).width > W - 24 * k && line){ x.fillText(line, 12 * k, ly); ly += 17 * k; line = wd; } else line = tl; }); x.fillText(line, 12 * k, ly); return; }
    var lh = H / used.length; used.forEach(function(ch, i){ var a = (sim && sim.tr[ch]) || [], y0 = i * lh, hi = y0 + lh * 0.25, lo = y0 + lh * 0.78; x.fillStyle = CH[ch][0]; x.font = "bold " + 11 * k + "px Inter,system-ui,sans-serif"; x.fillText(CH[ch][1], 6 * k, y0 + 14 * k);
      x.strokeStyle = CH[ch][0]; x.lineWidth = 2 * k; x.beginPath(); var t1 = sim ? sim.time : 0, first = true, py = null;
      a.forEach(function(s){ var px = 40 * k + (W - 46 * k) * (1 - (t1 - s[0]) / 8), yy = s[1] === 1 ? hi : s[1] === 0 ? lo : (hi + lo) / 2; if (first){ x.moveTo(px, yy); first = false; } else { if (py !== yy) x.lineTo(px, py); x.lineTo(px, yy); } py = yy; }); x.stroke(); }); }
  function startSim(){ sim = { t: performance.now(), time: 0, clk: {}, press: {}, out: {}, st: {}, prev: {}, warn: [], info: {}, tr: [], joins: [] }; sim.iv = setInterval(tick, 30); simBtn.textContent = "■ " + T("Simulation stoppen", "Arrêter"); simBtn.classList.add("on"); wiring = null; if (forceAna || hasAna()) startAna(); tick(); }
  function stopSim(){ if (sim && sim.iv) clearInterval(sim.iv); sim = null; beep(false); if (simBtn){ simBtn.textContent = "▶ " + T("Simulation starten", "Lancer la simulation"); simBtn.classList.remove("on"); } render(); drawScope(); }
  /* ====================================================================
     Analog-Engine: echte Spannungen und Ströme (Knotenanalyse, Newton, Zeitschritte)
     Bauteile: R, Poti, C, Quellen, Diode/LED, BJT, MOSFET, Opamp (mit Bandbreite, Slew-Rate, Versorgungsgrenzen)
     ==================================================================== */
  var AOP = { lm358: { g: 1e6, sr: .3, ht: 1.5, hb: .05 }, lm324: { g: 1e6, sr: .5, ht: 1.5, hb: .05 }, tl072: { g: 3e6, sr: 13, ht: 1.5, hb: 1.5 }, tl071: { g: 3e6, sr: 13, ht: 1.5, hb: 1.5 }, tl074: { g: 3e6, sr: 13, ht: 1.5, hb: 1.5 },
    ne5532: { g: 10e6, sr: 9, ht: 1.5, hb: 1.5 }, mcp6002: { g: 1e6, sr: .6, ht: .05, hb: .05 }, lm741: { g: 1e6, sr: .5, ht: 2, hb: 2 } };
  var OPTY = [["lm358", "LM358"], ["tl072", "TL072"], ["ne5532", "NE5532"], ["mcp6002", "MCP6002"], ["lm741", "LM741"]];
  function opAmps(p){
    if (p.t === "OP"){ var q = function(s){ return p.id + "." + s; }; return [{ n: q("N"), p: q("P"), o: q("O"), vp: q("VP"), vn: q("VN"), pre: p.typ || "lm358" }]; }
    var id = p.ic, q2 = function(a){ return p.id + "." + a; };
    if (id === "lm741" || id === "tl071") return [{ n: q2(2), p: q2(3), o: q2(6), vp: q2(7), vn: q2(4), pre: id }];
    if (id === "lm324" || id === "tl074") return [[1, 2, 3], [7, 6, 5], [8, 9, 10], [14, 13, 12]].map(function(a){ return { o: q2(a[0]), n: q2(a[1]), p: q2(a[2]), vp: q2(4), vn: q2(11), pre: id }; });
    return [[1, 2, 3], [7, 6, 5]].map(function(a){ return { o: q2(a[0]), n: q2(a[1]), p: q2(a[2]), vp: q2(8), vn: q2(4), pre: id }; });
  }
  function isAnaPart(p){ return p.t === "PD" || p.t === "RL" || (p.t === "D" && p.z > 0) || p.t === "SIN" || p.t === "VN" || p.t === "OP" || (p.t === "ic" && AOP[p.ic]); }
  function hasAna(){ return S.parts.some(isAnaPart); }
  var LEDI = { "#ff4d4d": [1e-18, 2], "#6dffb0": [1e-20, 2], "#ffd43b": [1e-19, 2], "#4dabf7": [1e-30, 2] };
  function wave(p, t, fo){ var f = fo || p.f || 1000, a = p.a == null ? 1 : p.a, o = p.o || 0, ph = 2 * Math.PI * f * t, w = p.w || "sin";
    return w === "dc" ? o : w === "rect" ? o + (Math.sin(ph) >= 0 ? a : -a) : w === "tri" ? o + a * 2 / Math.PI * Math.asin(Math.sin(ph)) : o + a * Math.sin(ph); }
  function pnj(vn, vo, vt, vc){ if (vn > vc && Math.abs(vn - vo) > 2 * vt){ if (vo > 0){ var arg = (vn - vo) / vt; vn = arg > 2 ? vo + vt * (2 + Math.log(arg - 2)) : vn; } else vn = vt * Math.log(vn / vt); } return vn; }
  function expl(x){ return Math.exp(Math.min(x, 60)); }
  function gauss(A, b, n){ // A: Array von Float64Array (n×n), b: Float64Array -> Lösung
    for (var c = 0; c < n; c++){ var pv = c, mx = Math.abs(A[c][c]); for (var r = c + 1; r < n; r++){ var q = Math.abs(A[r][c]); if (q > mx){ mx = q; pv = r; } }
      if (mx < 1e-30) { A[c][c] = 1e-12; mx = 1e-12; } if (pv !== c){ var t = A[c]; A[c] = A[pv]; A[pv] = t; var tb = b[c]; b[c] = b[pv]; b[pv] = tb; }
      var d = A[c][c]; for (var r2 = c + 1; r2 < n; r2++){ var f = A[r2][c] / d; if (f){ var Ar = A[r2], Ac = A[c]; for (var k = c; k < n; k++) Ar[k] -= f * Ac[k]; b[r2] -= f * b[c]; } } }
    var x = new Float64Array(n); for (var i = n - 1; i >= 0; i--){ var s = b[i]; for (var j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; } return x; }
  function softc(u, lo, hi){ var k = Math.min(.4, (hi - lo) / 4), a = hi - k, b = lo + k, th; if (u > a){ th = Math.tanh((u - a) / k); return [a + k * th, 1 - th * th]; } if (u < b){ th = Math.tanh((b - u) / k); return [b - k * th, 1 - th * th]; } return [u, 1]; }
  /* Modell aus der Zeichnung aufbauen */
  function anaBuild(){
    var T2 = allTerms(), U = uf(), M = { E: [], warn: [], keys: T2, fo: null }; Object.keys(T2).forEach(function(k){ U.f(k); }); S.wires.forEach(function(w){ if (T2[w.a] && T2[w.b]) U.u(w.a, w.b); });
    var g0 = null; S.parts.forEach(function(p){ if (p.t === "GND"){ if (g0 === null) g0 = p.id + ".1"; else U.u(g0, p.id + ".1"); } });
    if (g0 === null){ M.err = T("Kein GND-Symbol – ohne Masse gibt es keine Spannungen. Ein GND links aus der Liste setzen und anschließen.", "Pas de GND : place une masse."); return M; }
    var gr = U.f(g0), idx = {}, n = 0, cnt = {}; Object.keys(T2).forEach(function(k){ var r = U.f(k); cnt[r] = (cnt[r] || 0) + 1; });
    function nd(k){ var r = U.f(k); if (r === gr) return -1; if (idx[r] == null) idx[r] = n++; return idx[r]; }
    M.nd = nd; M.cnt = function(k){ return cnt[U.f(k)] || 0; };
    function R(a, b, r, part){ M.E.push({ t: "R", a: nd(a), b: nd(b), g: 1 / Math.max(r, 1e-6), part: part }); }
    S.parts.forEach(function(p){ var k = function(s){ return p.id + "." + s; };
      if (p.t === "R") R(k(1), k(2), p.v, p); else if (p.t === "PT"){ var q = Math.max(.005, Math.min(.995, p.pos / 100)); R(k(1), k("S"), p.v * q, p); R(k("S"), k(2), p.v * (1 - q), p); }
      else if (p.t === "LP") R(k(1), k(2), 50, p); else if (p.t === "SU") R(k(1), k(2), 100, p);
      else if (p.t === "TA" || p.t === "SW") M.E.push({ t: "R", a: nd(k(1)), b: nd(k(2)), g: 0, sw: p, part: p });
      else if (p.t === "C") M.E.push({ t: "C", a: nd(k(1)), b: nd(k(2)), c: p.v, vp: 0, part: p });
      else if (p.t === "V") M.E.push({ t: "S", a: nd(k(1)), f: function(){ return 5; }, part: p });
      else if (p.t === "VN") M.E.push({ t: "S", a: nd(k(1)), f: function(){ return -5; }, part: p });
      else if (p.t === "VS") M.E.push({ t: "S", a: nd(k(1)), f: function(){ return p.u; }, part: p });
      else if (p.t === "TG") M.E.push({ t: "S", a: nd(k(1)), f: function(t){ return ((t * p.f) % 1) < .5 ? 5 : 0; }, part: p });
      else if (p.t === "SIN") M.E.push({ t: "S", a: nd(k(1)), f: function(t){ return wave(p, t, M.fo); }, part: p, gen: 1 });
      else if (p.t === "RL"){ M.E.push({ t: "R", a: nd(k(1)), b: nd(k(2)), g: 1 / 70, part: p }); M.E.push({ t: "R", a: nd(k(3)), b: nd(k(4)), g: 0, ry: p, cl: 0, ca: nd(k(1)), cb: nd(k(2)), part: null }); }
      else if (p.t === "LED" || p.t === "D" || p.t === "PD"){ var pr = p.t === "LED" ? (LEDI[p.c] || LEDI["#ff4d4d"]) : [1e-14, 1], nv = pr[1] * .02585; M.E.push({ t: "D", a: nd(k(1)), b: nd(k(2)), is: pr[0], nvt: nv, vc: nv * Math.log(nv / (Math.SQRT2 * pr[0])), jv: 0, part: p }); if (p.t === "PD") M.E.push({ t: "IS", a: nd(k(1)), b: nd(k(2)), i: (p.l == null ? .5 : p.l) * 200e-6 }); if (p.t === "D" && p.z > 0){ var zv = .03; M.E.push({ t: "DZ", a: nd(k(1)), b: nd(k(2)), vz: p.z, isz: 5e-3, nvt: zv, vc: zv * Math.log(zv / (Math.SQRT2 * 5e-3)), jv: -1, par: M.E[M.E.length - 1] }); } }
      else if (p.t === "Q" || p.t === "QP"){ var nm = p.t === "Q" ? ["B", "C", "E"] : ["B", "E", "C"]; M.E.push({ t: "Q", s: p.t === "Q" ? 1 : -1, b: nd(k(nm[0])), c: nd(k(p.t === "Q" ? "C" : "C")), e: nd(k("E")), is: 1e-14, bf: 200, br: 5, vt: .02585, vc: .02585 * Math.log(.02585 / (Math.SQRT2 * 1e-14)), jbe: 0, jbc: 0, part: p }); }
      else if (p.t === "M") M.E.push({ t: "M", g: nd(k("G")), d: nd(k("D")), s: nd(k("S")), vth: 1.7, kp: 12, part: p });
      else if (p.t === "OP" || (p.t === "ic" && AOP[p.ic])){ opAmps(p).forEach(function(o, i){ var pr = AOP[o.pre] || AOP.lm358; M.E.push({ t: "O", n: nd(o.n), p: nd(o.p), o: nd(o.o), vp: nd(o.vp), vn: nd(o.vn), A: 1e5, gbw: pr.g, sr: pr.sr * 1e6, ht: pr.ht, hb: pr.hb, x: 0, out: 0, part: p, keys: o, on: true }); }); }
      else if (p.t === "ic" && !isAnaPart(p)) M.warn.push(p.id + " (" + icById(p.ic).name.split(" / ")[0] + ") " + T("ist ein Digital-IC und wird im Analog-Modus nicht berechnet.", "est numérique : non calculé en mode analogique."));
      else if (p.t === "AZ") M.warn.push(p.id + ": " + T("7-Segment wird im Analog-Modus nicht berechnet.", "7 segments non calculé."));
    });
    M.n = n; M.v = new Float64Array(n); M.t = 0; return M; }
  function vof(M, i){ return i < 0 ? 0 : M.v[i]; }
  /* eine Newton-Lösung: dt = 0 → Gleichstrom */
  function anaSolve(M, dt, t, scale, Ascale){
    var n = M.n; if (!n) return true; var ok = false;
    for (var it = 0; it < 80; it++){
      var A = []; for (var i = 0; i < n; i++) A.push(new Float64Array(n)); var b = new Float64Array(n), lim = false;
      for (i = 0; i < n; i++){ A[i][i] += 1e-10; }
      var add = function(r, c, g){ if (r >= 0 && c >= 0) A[r][c] += g; }, rhs = function(r, x){ if (r >= 0) b[r] += x; };
      var cond = function(a, c, g){ add(a, a, g); add(c, c, g); add(a, c, -g); add(c, a, -g); };
      M.E.forEach(function(e){
        if (e.t === "R") cond(e.a, e.b, e.sw ? ((e.sw.t === "TA" ? !!(sim && sim.press && sim.press[e.sw.id]) : !!e.sw.on) ? 100 : 0) : e.ry ? (e.cl ? 100 : 0) : e.g);
        else if (e.t === "C"){ if (dt > 0){ var g = e.c / dt; cond(e.a, e.b, g); rhs(e.a, g * e.vp); rhs(e.b, -g * e.vp); } else cond(e.a, e.b, 1e-12); }
        else if (e.t === "S"){ var gs = 100; add(e.a, e.a, gs); rhs(e.a, gs * e.f(t) * scale); }
        else if (e.t === "D"){ var vd = vof(M, e.a) - vof(M, e.b), vl = pnj(vd, e.jv, e.nvt, e.vc); if (Math.abs(vl - vd) > 1e-9) lim = true; e.jv = vl;
          var ex = expl(vl / e.nvt), id = e.is * (ex - 1) + 1e-12 * vl, gd = e.is / e.nvt * ex + 1e-12; e.i = id; cond(e.a, e.b, gd); var ieq = id - gd * vl; rhs(e.a, -ieq); rhs(e.b, ieq); }
        else if (e.t === "IS"){ rhs(e.a, e.i); rhs(e.b, -e.i); }
        else if (e.t === "DZ"){ var vb = -(vof(M, e.a) - vof(M, e.b)) - e.vz, zl = pnj(vb, e.jv, e.nvt, e.vc); if (Math.abs(zl - vb) > 1e-9) lim = true; e.jv = zl;
          var zx = expl(zl / e.nvt), zi = e.isz * (zx - 1), zg = e.isz / e.nvt * zx, vd0 = -(zl + e.vz), iab = -zi, ieq2 = iab - zg * vd0; cond(e.a, e.b, zg); rhs(e.a, -ieq2); rhs(e.b, ieq2); e.i = iab; if (e.par) e.par.i = (e.par.i || 0) + iab; }
        else if (e.t === "Q"){ var s = e.s, vbe = s * (vof(M, e.b) - vof(M, e.e)), vbc = s * (vof(M, e.b) - vof(M, e.c)), lbe = pnj(vbe, e.jbe, e.vt, e.vc), lbc = pnj(vbc, e.jbc, e.vt, e.vc); if (Math.abs(lbe - vbe) > 1e-9 || Math.abs(lbc - vbc) > 1e-9) lim = true; e.jbe = lbe; e.jbc = lbc;
          var eb = expl(lbe / e.vt), ec = expl(lbc / e.vt), If = e.is * (eb - 1), Ir = e.is * (ec - 1), gf = e.is / e.vt * eb, gr = e.is / e.vt * ec,
            Ic = If - Ir * (1 + 1 / e.br), Ib = If / e.bf + Ir / e.br, dIc_be = gf, dIc_bc = -gr * (1 + 1 / e.br), dIb_be = gf / e.bf, dIb_bc = gr / e.br; e.ic = s * Ic; e.ib = s * Ib;
          var cb = [dIb_be, dIb_bc, s * Ib - s * (dIb_be * lbe + dIb_bc * lbc)], cc = [dIc_be, dIc_bc, s * Ic - s * (dIc_be * lbe + dIc_bc * lbc)];
          // Ströme in b und c (hinein), e = -(b+c)
          var rowB = e.b, rowC = e.c, rowE = e.e;
          [[rowB, cb], [rowC, cc]].forEach(function(q){ var r = q[0], c3 = q[1]; add(r, e.b, c3[0] + c3[1]); add(r, e.e, -c3[0]); add(r, e.c, -c3[1]); rhs(r, -c3[2]); add(rowE, e.b, -(c3[0] + c3[1])); add(rowE, e.e, c3[0]); add(rowE, e.c, c3[1]); rhs(rowE, c3[2]); }); cond(e.b, e.c, 1e-12); cond(e.b, e.e, 1e-12); }
        else if (e.t === "M"){ var D = e.d, Sx = e.s, vd0 = vof(M, D), vs0 = vof(M, Sx), sw = vd0 < vs0; if (sw){ D = e.s; Sx = e.d; var tmp = vd0; vd0 = vs0; vs0 = tmp; }
          var vgs = vof(M, e.g) - vs0, vds = vd0 - vs0, vov = vgs - e.vth, Id = 0, gm = 0, gds = 0; if (vov > 0){ if (vds < vov){ Id = e.kp * (vov * vds - vds * vds / 2); gm = e.kp * vds; gds = e.kp * (vov - vds); } else { Id = e.kp / 2 * vov * vov * (1 + .02 * vds); gm = e.kp * vov * (1 + .02 * vds); gds = e.kp / 2 * vov * vov * .02; } } gds += 1e-9; e.id = sw ? -Id : Id;
          // Strom von D nach S: Id + gm*(vgs-vgs0) + gds*(vds-vds0)
          var ie = Id - gm * vgs - gds * vds; add(D, e.g, gm); add(D, Sx, -gm - gds); add(D, D, gds); rhs(D, -ie); add(Sx, e.g, -gm); add(Sx, Sx, gm + gds); add(Sx, D, -gds); rhs(Sx, ie); }
        else if (e.t === "O"){ var Vd = vof(M, e.p) - vof(M, e.n), vP = vof(M, e.vp), vN = vof(M, e.vn), sup = vP - vN; e.on = sup > 2; if (!e.on){ add(e.o, e.o, 1e-9); return; }
          var hi = vP - e.ht, lo = vN + e.hb, A0 = e.A * (Ascale || 1), al = 1, be = 0; if (dt > 0){ var tau = e.A / (2 * Math.PI * e.gbw), r = dt / tau; al = r / (1 + r); be = 1 / (1 + r); }
          var u = al * A0 * Vd + be * e.x, sc = softc(u, lo, hi), Vt = sc[0], Dd = sc[1];
          if (dt > 0){ var sm = e.sr * dt, up = e.out + sm, dn = e.out - sm; e.slew = false; if (Vt > up){ Vt = up; Dd = 0; e.slew = true; } else if (Vt < dn){ Vt = dn; Dd = 0; e.slew = true; } }
          var Kk = Dd * al * A0, Go = 1 / 75; e.vt = Vt; e.u = u; add(e.o, e.o, Go); add(e.o, e.p, -Go * Kk); add(e.o, e.n, Go * Kk); rhs(e.o, Go * (Vt - Kk * Vd)); add(e.p, e.p, 1e-12); add(e.n, e.n, 1e-12); }
      });
      var x = gauss(A, b, n), mx = 0, conv = true; for (i = 0; i < n; i++){ var dv = x[i] - M.v[i]; if (dv > 3) dv = 3; if (dv < -3) dv = -3; if (Math.abs(dv) > 1e-6 + 1e-5 * Math.abs(x[i])) conv = false; M.v[i] += dv; }
      if (conv && !lim){ ok = true; break; } }
    return ok; }
  function ryUpd(M){ var ch = false; M.E.forEach(function(e){ if (e.ry){ var vc = vof(M, e.ca) - vof(M, e.cb), n = vc > 3.5 ? 1 : vc < 1.5 ? 0 : e.cl; if (n !== e.cl){ e.cl = n; ch = true; } } }); return ch; }
  function anaCommit(M, dt){ ryUpd(M); M.E.forEach(function(e){ if (e.t === "C") e.vp = vof(M, e.a) - vof(M, e.b); else if (e.t === "O" && e.on){ var vP = vof(M, e.vp), vN = vof(M, e.vn); e.x = e.slew ? e.vt : Math.max(vN - 3, Math.min(vP + 3, e.u)); e.out = vof(M, e.o); } }); }
  /* Gleichstrom-Arbeitspunkt: Quellen hochfahren, Opamp-Verstärkung schrittweise */
  function anaDC(M, t){ for (var i = 0; i < M.n; i++) M.v[i] = 0; var ok = true;
    [.2, .5, 1].forEach(function(sc){ ok = anaSolve(M, 0, t, sc, .001) && ok; }); [.01, .1, 1].forEach(function(as){ ok = anaSolve(M, 0, t, 1, as) && ok; });
    M.E.forEach(function(e){ if (e.t === "C") e.vp = vof(M, e.a) - vof(M, e.b); if (e.t === "O"){ e.x = e.u || 0; e.out = vof(M, e.o); } }); M.t = t; for (var ri = 0; ri < 3 && ryUpd(M); ri++) ok = anaSolve(M, 0, t, 1, 1) && ok; return ok; }
  function anaStep(M, dt){ M.t += dt; var ok = anaSolve(M, dt, M.t, 1, 1); anaCommit(M, dt); return ok; }

  /* ---- Ablauf: Zeitschritte, Messung, Anzeige ---- */
  var TBS = [["auto", "Auto"], [2e-5, "20 µs"], [5e-5, "50 µs"], [1e-4, "0,1 ms"], [2e-4, "0,2 ms"], [5e-4, "0,5 ms"], [1e-3, "1 ms"], [2e-3, "2 ms"], [5e-3, "5 ms"], [1e-2, "10 ms"], [2e-2, "20 ms"], [5e-2, "50 ms"], [.1, "0,1 s"], [.2, "0,2 s"], [.5, "0,5 s"], [1, "1 s"]];
  var tbSel = "auto", forceAna = false, anaBtn = null, tbBox = null, bodeCv = null, bodeInfo = null;
  function anaAuto(){ var f = 0; S.parts.forEach(function(p){ if (p.t === "SIN" && p.w !== "dc" && (!f || p.f < f)) f = p.f; }); return f ? 3 / (8 * f) : 5e-3; }
  function anaTb(){ return tbSel === "auto" ? anaAuto() : +tbSel; }
  function startAna(){ var M = anaBuild(); sim.ana = M; sim.atr = [[], [], [], []]; sim.mark = null;
    if (M.err){ sim.aerr = M.err; return; }
    M.dt = 1; var ok = anaDC(M, 0); sim.aok = ok; sim.sig = anaSig(); }
  function anaSig(){ return S.parts.map(function(p){ return [p.id, p.t, p.v, p.c, p.f, p.u, p.pos, p.a, p.w, p.o, p.typ, p.ic].join("|"); }).join(";") + "#" + S.wires.map(function(w){ return w.a + "~" + w.b; }).join(";"); }
  function anaTick(dtReal){ var M = sim.ana; if (!M) return; var sg = anaSig(); if (sg !== sim.sig){ var tOld = M.t || 0; sim.sig = sg; M = sim.ana = anaBuild(); if (M.err) return; M.dt = 1; anaDC(M, tOld); } if (M.err) return; var win = anaTb() * 8, dt = win / 600, adv = Math.min(win * dtReal, win * .2), nst = Math.max(1, Math.min(600, Math.round(adv / dt))), ok = true;
    for (var i = 0; i < nst; i++){ ok = anaStep(M, dt) && ok;
      S.parts.forEach(function(p){ if (p.t === "TK"){ var a = sim.atr[p.ch || 0]; a.push([M.t, vof(M, M.nd(p.id + ".1"))]); } }); }
    sim.aok = ok; sim.atr.forEach(function(a){ while (a.length && a[0][0] < M.t - win * 1.05) a.shift(); }); sim.time = M.t; }
  function nice(x){ if (!(x > 0)) return 1; var e = Math.pow(10, Math.floor(Math.log(x) / Math.LN10)), m = x / e; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e; }
  function drawAna(){ var c = scopeCv, x = c.getContext("2d"), dpr = window.devicePixelRatio || 1, W = c.width = c.clientWidth * dpr, H = c.height = 210 * dpr, k = dpr, M = sim.ana, win = anaTb() * 8; c.style.height = "210px";
    x.fillStyle = "#06120f"; x.fillRect(0, 0, W, H); x.strokeStyle = "rgba(109,255,176,.12)"; x.lineWidth = 1; var L = 42 * k, Rr = 52 * k;
    for (var i = 0; i <= 8; i++){ x.beginPath(); x.moveTo(L + i * (W - L - Rr) / 8, 0); x.lineTo(L + i * (W - L - Rr) / 8, H - 16 * k); x.stroke(); }
    var used = []; S.parts.forEach(function(p){ if (p.t === "TK" && used.indexOf(p.ch || 0) < 0) used.push(p.ch || 0); }); used.sort();
    x.font = 11 * k + "px Inter,system-ui,sans-serif"; x.fillStyle = "rgba(200,255,225,.75)"; x.textAlign = "right"; x.fillText(fmt(anaTb(), "s", 2) + " / DIV", W - 4 * k, H - 4 * k); x.textAlign = "left";
    if (!used.length){ x.fillStyle = "#8fe3b9"; x.fillText(T("Setze einen Tastkopf an eine Leitung – dann erscheint hier die Spannung.", "Place une sonde sur un fil."), 10 * k, 30 * k); return; }
    var lh = (H - 16 * k) / used.length, t1 = M ? M.t : 0;
    used.forEach(function(ch, ci){ var a = sim.atr[ch] || [], y0 = ci * lh, vmin = 0, vmax = 0; a.forEach(function(s){ if (s[1] < vmin) vmin = s[1]; if (s[1] > vmax) vmax = s[1]; });
      var span = Math.max(vmax - vmin, .2), step = nice(span / 2.2), hi = Math.ceil(vmax / step - 1e-9) * step, lo = Math.floor(vmin / step + 1e-9) * step; if (hi === lo) hi = lo + step; var top = y0 + 18 * k, bot = y0 + lh - 6 * k, Y = function(v){ return bot - (v - lo) / (hi - lo) * (bot - top); };
      x.strokeStyle = "rgba(109,255,176,.28)"; x.setLineDash([3 * k, 3 * k]); x.beginPath(); x.moveTo(L, Y(0)); x.lineTo(W - Rr, Y(0)); x.stroke(); x.setLineDash([]);
      x.fillStyle = CH[ch][0]; x.font = "bold " + 11 * k + "px Inter,system-ui,sans-serif"; x.fillText(CH[ch][1], 6 * k, y0 + 14 * k);
      x.strokeStyle = CH[ch][0]; x.lineWidth = 2 * k; x.lineJoin = "round"; x.beginPath(); var first = true;
      a.forEach(function(s){ var px = L + (W - L - Rr) * (1 - (t1 - s[0]) / win); if (px < L - 1) return; var py = Y(Math.max(lo, Math.min(hi, s[1]))); if (first){ x.moveTo(px, py); first = false; } else x.lineTo(px, py); }); x.stroke(); x.lineWidth = 1;
      x.fillStyle = "rgba(200,255,225,.7)"; x.font = 10.5 * k + "px Inter,system-ui,sans-serif"; x.textAlign = "left"; x.fillText(fmt(hi, "V", 2), W - Rr + 6 * k, top + 8 * k); x.fillText(fmt(lo, "V", 2), W - Rr + 6 * k, bot); if (lo < 0 && hi > 0) x.fillText("0", W - Rr + 6 * k, Y(0) + 4 * k);
      var last = a.length ? a[a.length - 1][1] : 0; x.fillStyle = CH[ch][0]; x.fillText(fmt(last, "V", 3), 40 * k, y0 + 14 * k);
      var ms = anaStat(a, t1 - win); if (ms){ var tx = T("Vpp ", "Vcc ") + fmt(ms.vpp, "V", 3) + "  Ø " + fmt(ms.avg, "V", 3) + "  " + T("eff ", "eff ") + fmt(ms.rms, "V", 3) + (ms.f ? "  f " + fmt(ms.f, "Hz", 3) : ""); x.font = "600 " + 10.5 * k + "px Inter,system-ui,sans-serif"; x.textAlign = "right"; x.fillStyle = "rgba(200,255,225,.85)"; x.fillText(tx, W - Rr - 4 * k, y0 + 14 * k); x.textAlign = "left"; } }); }
  function anaStat(a, tmin){ var v = [], t = []; for (var i = 0; i < a.length; i++) if (a[i][0] >= tmin){ t.push(a[i][0]); v.push(a[i][1]); } if (v.length < 6) return null;
    var mn = 1e99, mx = -1e99, sm = 0, sq2 = 0; v.forEach(function(q){ if (q < mn) mn = q; if (q > mx) mx = q; sm += q; sq2 += q * q; });
    var r = { vpp: mx - mn, avg: sm / v.length, rms: Math.sqrt(sq2 / v.length), f: 0 }, mid = (mn + mx) / 2, ed = [];
    if (r.vpp > 0.02) for (var j = 1; j < v.length; j++) if (v[j - 1] < mid && v[j] >= mid) ed.push(t[j - 1] + (mid - v[j - 1]) / (v[j] - v[j - 1]) * (t[j] - t[j - 1]));
    if (ed.length >= 3) r.f = (ed.length - 1) / (ed[ed.length - 1] - ed[0]); return r; }
  function vcol(v){ var t = Math.max(-1, Math.min(1, v / 5)); if (t >= 0){ var a = Math.round(40 + 190 * t); return "rgb(" + (60 + Math.round(170 * t)) + "," + (90 - Math.round(40 * t)) + "," + (170 - Math.round(130 * t)) + ")"; } return "rgb(" + (60 + Math.round(40 * -t)) + "," + (90 + Math.round(10 * -t)) + "," + (170 + Math.round(60 * -t)) + ")"; }
  function paintAna(){ var M = sim.ana, warn = []; if (!M) return; if (M.err){ msgs([M.err]); return; }
    var vk = function(k){ return vof(M, M.nd(k)); };
    svg.querySelectorAll("path.wr").forEach(function(e){ var w = S.wires[+e.dataset.w]; if (!w) return; e.setAttribute("data-v", "a"); e.style.stroke = vcol(vk(w.a)); });
    svg.querySelectorAll(".mb").forEach(function(e){ e.remove(); });
    S.parts.forEach(function(p){ var g = svg.querySelector('[data-p="' + p.id + '"]'), id = null;
      if (p.t === "LED" || p.t === "D"){ var e = M.E.find(function(q){ return q.part === p; }); id = e && e.i != null ? e.i : 0; var on = id > .0005 ? "1" : "0"; if (p.t === "LED"){ if (id > .03){ on = "b"; warn.push(p.id + ": " + T("LED bekommt " + fmt(id, "A") + " – viel zu viel, sie brennt durch! Vorwiderstand einbauen.", "LED : " + fmt(id, "A") + " – trop de courant !")); } if (g){ g.setAttribute("data-on", on); g.style.setProperty("--lc", p.c); g.style.opacity = on === "1" ? Math.max(.45, Math.min(1, .4 + id / .012)) : 1; } } sim.cur = sim.cur || {}; sim.cur[p.id] = id; }
      if (p.t === "R" || p.t === "PT"){ var ee = M.E.find(function(q){ return q.part === p && q.t === "R"; }); if (ee){ var vv = (vof(M, ee.a) - vof(M, ee.b)), ii = vv * ee.g; if (p.t === "R" && vv * ii > .25) warn.push(p.id + ": " + T("wird mit " + fmt(vv * ii, "W") + " belastet – ein 0,25-W-Widerstand würde heiß/durchbrennen.", "dissipe " + fmt(vv * ii, "W") + " – trop chaud.")); } }
      if (p.t === "RL" && g){ var e4 = M.E.find(function(q){ return q.ry === p; }); g.setAttribute("data-on", e4 && e4.cl ? "1" : "0"); }
      if (p.t === "SW" && g) g.setAttribute("data-on", p.on ? "1" : "0");
      if (p.t === "LP" && g){ var e3 = M.E.find(function(q){ return q.part === p; }); var cur = e3 ? Math.abs(vof(M, e3.a) - vof(M, e3.b)) * e3.g : 0; g.setAttribute("data-on", cur > .02 ? "1" : "0"); } });
    M.E.forEach(function(e){ if (e.t === "O" && !e.on) warn.push(e.part.id + ": " + T("keine Versorgung am Opamp – V+ und V− brauchen mindestens 2 V Differenz (z. B. +5 V und −5 V oder +5 V und GND).", "ampli sans alimentation.")); });
    S.parts.forEach(function(p){ if (p.t === "OP" || (p.t === "ic" && AOP[p.ic])) opAmps(p).forEach(function(o, i){ if (M.cnt(o.n) < 2 || M.cnt(o.p) < 2) warn.push(p.id + (i ? " (" + (i + 1) + ")" : "") + ": " + T("ein Eingang hängt offen – der Opamp kippt zufällig an eine Versorgungsgrenze.", "une entrée est en l’air.")); }); });
    if (sim.meas){ var t = M.keys[sim.meas]; if (t){ var vm = vk(sim.meas), tx = ""; tx = '<g class="mb"><circle cx="' + t.x + '" cy="' + t.y + '" r="8" fill="none" stroke="#e8590c" stroke-width="2"/><rect x="' + (t.x + 10) + '" y="' + (t.y - 24) + '" width="' + (fmt(vm, "V", 3).length * 7.2 + 14) + '" height="20" rx="5" fill="#fff8e6" stroke="#e8590c"/><text x="' + (t.x + 17) + '" y="' + (t.y - 10) + '" style="fill:#c2410c;font-weight:800;font-size:12px">' + esc(fmt(vm, "V", 3)) + "</text></g>"; svg.insertAdjacentHTML("beforeend", tx); } }
    if (!sim.aok) warn.push(T("Die Rechnung konvergiert nicht sauber – die Schaltung ist vermutlich falsch beschaltet (z. B. Rückkopplung an der falschen Stelle).", "Le calcul ne converge pas."));
    (M.warn || []).forEach(function(w){ warn.push(w); }); msgs(warn); }

  /* ---- Frequenzgang (Bode) per Zeitsimulation ---- */
  function bodeRun(){
    if (!bodeInfo) return; var sinP = S.parts.filter(function(p){ return p.t === "SIN"; })[0], tks = S.parts.filter(function(p){ return p.t === "TK"; });
    if (!sinP){ bodeInfo.textContent = T("Für den Frequenzgang braucht die Schaltung einen Funktionsgenerator (Eingang) und einen Tastkopf am Ausgang.", "Il faut un générateur et une sonde de sortie."); return; }
    var M = anaBuild(); if (M.err){ bodeInfo.textContent = M.err; return; } var nin = M.nd(sinP.id + ".1"), outs = tks.filter(function(p){ return M.nd(p.id + ".1") !== nin; }); if (!outs.length){ bodeInfo.textContent = T("Setze einen Tastkopf an den Ausgang (nicht an den Generator).", "Place une sonde à la sortie."); return; }
    var nout = M.nd(outs[0].id + ".1"), pts = [], F = [], i; for (i = 0; i <= 60; i++) F.push(10 * Math.pow(1e5, i / 60)); var idx = 0, NS = 120, WARM = 8, MEAS = 3; bodeInfo.textContent = T("Messe Frequenzgang … ", "Mesure … ") + "0 %";
    function one(){ var f = F[idx]; M.fo = f; anaDC(M, 0); var dt = 1 / (f * NS), si = 0, sc = 0, so = 0, co = 0, N = (WARM + MEAS) * NS;
      for (var s = 0; s < N; s++){ anaStep(M, dt); if (s >= WARM * NS){ var ph = 2 * Math.PI * f * M.t, vi = vof(M, nin), vo = vof(M, nout), cs = Math.cos(ph), sn = Math.sin(ph); sc += vi * cs; si += vi * sn; co += vo * cs; so += vo * sn; } }
      var mi = Math.hypot(sc, si), mo = Math.hypot(co, so), g = mi > 1e-12 ? mo / mi : 0, pd = (Math.atan2(si, sc) - Math.atan2(so, co)) * 180 / Math.PI; while (pd > 180) pd -= 360; while (pd < -180) pd += 360; pts.push([f, 20 * Math.log10(Math.max(g, 1e-6)), pd]); }
    function loop(){ var t0 = performance.now(); while (idx < F.length && performance.now() - t0 < 25){ one(); idx++; } bodeInfo.textContent = T("Messe Frequenzgang … ", "Mesure … ") + Math.round(idx / F.length * 100) + " %"; if (idx < F.length){ setTimeout(loop, 0); return; } drawBode(pts); }
    setTimeout(loop, 0); }
  function drawBode(pts){ var c = bodeCv; c.hidden = false; var dpr = window.devicePixelRatio || 1, W = c.width = c.clientWidth * dpr, H = c.height = 300 * dpr, x = c.getContext("2d"), k = dpr; c.style.height = "300px";
    x.fillStyle = "#06120f"; x.fillRect(0, 0, W, H); var L = 46 * k, R = 12 * k, X = function(f){ return L + (W - L - R) * Math.log(f / 10) / Math.log(1e5); };
    var gm = pts.map(function(p){ return p[1]; }), gmax = Math.max.apply(null, gm), gmin = Math.min.apply(null, gm), step = nice(Math.max(gmax - gmin, 6) / 4), ghi = Math.ceil(gmax / step) * step + step, glo = Math.min(Math.floor(gmin / step) * step, ghi - 4 * step); if (glo < ghi - 8 * step) glo = ghi - 8 * step;
    var top1 = 22 * k, bot1 = 150 * k, top2 = 172 * k, bot2 = 272 * k, Yg = function(v){ return bot1 - (v - glo) / (ghi - glo) * (bot1 - top1); }, Yp = function(v){ return bot2 - (v + 180) / 360 * (bot2 - top2); };
    x.strokeStyle = "rgba(109,255,176,.14)"; x.fillStyle = "rgba(200,255,225,.75)"; x.font = 10.5 * k + "px Inter,system-ui,sans-serif"; x.textAlign = "center";
    for (var d = 1; d <= 6; d++){ for (var m = 1; m < 10; m++){ var f = m * Math.pow(10, d); if (f < 10 || f > 1e6) continue; x.strokeStyle = m === 1 ? "rgba(109,255,176,.28)" : "rgba(109,255,176,.08)"; x.beginPath(); x.moveTo(X(f), top1); x.lineTo(X(f), bot2); x.stroke(); if (m === 1){ x.textAlign = f >= 1e6 ? "right" : "center"; x.fillText(fmt(f, "Hz", 2), X(f), H - 4 * k); } } }
    x.textAlign = "right"; for (var g = Math.ceil(glo / step) * step; g <= ghi; g += step){ x.strokeStyle = "rgba(109,255,176,.14)"; x.beginPath(); x.moveTo(L, Yg(g)); x.lineTo(W - R, Yg(g)); x.stroke(); x.fillText(+g.toFixed(1) + " dB", L - 4 * k, Yg(g) + 4 * k); }
    [-180, -90, 0, 90, 180].forEach(function(pp){ x.strokeStyle = "rgba(109,255,176,.14)"; x.beginPath(); x.moveTo(L, Yp(pp)); x.lineTo(W - R, Yp(pp)); x.stroke(); x.fillText(pp + "°", L - 4 * k, Yp(pp) + 4 * k); });
    x.textAlign = "left"; x.fillStyle = "#ffb000"; x.font = "bold " + 11 * k + "px Inter,system-ui,sans-serif"; x.fillText(T("Verstärkung", "Gain"), L + 4 * k, 14 * k); x.fillStyle = "#3de6ff"; x.fillText(T("Phase", "Phase"), L + 4 * k, top2 - 4 * k);
    function line(col, fy, idx2){ x.strokeStyle = col; x.lineWidth = 2 * k; x.lineJoin = "round"; x.beginPath(); pts.forEach(function(p, i){ var px = X(p[0]), py = fy(p[idx2]); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); x.lineWidth = 1; }
    line("#ffb000", Yg, 1); line("#3de6ff", Yp, 2);
    var ref = pts[0][1], fc = null, ref2 = Math.max.apply(null, gm); for (var i = 1; i < pts.length; i++){ var a = pts[i - 1], b = pts[i]; if ((a[1] - ref >= -3 && b[1] - ref < -3) || (a[1] - ref2 < -3 && b[1] - ref2 >= -3)){ var tt = (-3 - (a[1] - (a[1] - ref >= -3 ? ref : ref2))) / (b[1] - a[1]); fc = a[0] * Math.pow(b[0] / a[0], Math.max(0, Math.min(1, tt))); break; } }
    var gmx = Math.max.apply(null, gm); bodeInfo.innerHTML = T("Gemessen mit dem Generator ", "Mesuré avec le générateur ") + "<b>" + esc((Math.abs(gmx) < 0.05 ? "0" : gmx.toFixed(1)) + " dB") + "</b> " + T("maximal", "maximum") + (fc ? " · " + T("Grenzfrequenz (−3 dB): ", "fréquence de coupure (−3 dB) : ") + "<b>" + esc(fmt(fc, "Hz", 3)) + "</b>" : "") + ". " + T("Kleine Signale benutzen, sonst clippt der Ausgang.", "Utilise un petit signal."); }
  /* ---- Fehlersuche ---- */
  var tolBox = null, shBox = null;
  function tolRun(){ if (tolBox.hidden === false){ tolBox.hidden = true; return; } tolBox.hidden = false; tolBox.innerHTML = "";
    var tks = S.parts.filter(function(p){ return p.t === "TK"; }), rs = S.parts.filter(function(p){ return p.t === "R" && p.v; });
    if (!tks.length || !rs.length){ tolBox.textContent = T("Für die Toleranzrechnung brauchst du Widerstände und mindestens einen Tastkopf.", "Il faut des résistances et une sonde."); return; }
    var sl = el("select"); [1, 2, 5, 10, 20].forEach(function(t){ var o = el("option", "", "± " + t + " %"); o.value = t; if (t === 5) o.selected = true; sl.appendChild(o); });
    var out = el("div"), N = 60;
    function go(){ var tol = +sl.value / 100, orig = rs.map(function(r){ return r.v; }), res = tks.map(function(){ return []; }), bad = 0, i;
      for (i = 0; i < N; i++){ rs.forEach(function(r, j){ r.v = orig[j] * (1 + tol * (2 * Math.random() - 1)); }); var M = anaBuild(); if (M.err){ bad = N; break; } if (!anaDC(M, 0)){ bad++; continue; } tks.forEach(function(k, j){ res[j].push(vof(M, M.nd(k.id + ".1"))); }); }
      rs.forEach(function(r, j){ r.v = orig[j]; }); var M0 = anaBuild(), nom = null; if (!M0.err){ anaDC(M0, 0); nom = tks.map(function(k){ return vof(M0, M0.nd(k.id + ".1")); }); }
      var h = "<table class=\"bau-bt\"><tr><th>" + esc(T("Messpunkt", "Point")) + "</th><th>" + esc(T("Nennwert", "Nominal")) + "</th><th>" + esc(T("Streuung", "Plage")) + "</th><th>" + esc(T("Abweichung", "Écart")) + "</th></tr>";
      tks.forEach(function(k, j){ var a = res[j]; if (!a.length || !nom) return; var mn = Math.min.apply(null, a), mx = Math.max.apply(null, a), nv = nom[j], dv = Math.max(Math.abs(mn - nv), Math.abs(mx - nv));
        h += "<tr><td>" + esc(CH[k.ch || 0][1] + " (" + k.id + ")") + "</td><td>" + esc(fmt(nv, "V", 3)) + "</td><td>" + esc(fmt(mn, "V", 3) + " … " + fmt(mx, "V", 3)) + "</td><td>" + (Math.abs(nv) > 1e-6 ? "± " + (dv / Math.abs(nv) * 100).toFixed(1) + " %" : "–") + "</td></tr>"; });
      out.innerHTML = h + "</table><p class=\"ic-lb\">" + esc(T(N + " zufällige Läufe, Gleichspannungs-Arbeitspunkt, nur Widerstände streuen." + (bad ? " (" + bad + " nicht konvergiert)" : ""), N + " tirages aléatoires, point de repos, seules les résistances varient.")) + "</p>"; }
    var hd = el("div"); hd.innerHTML = "<b>🎲 " + esc(T("Toleranz-Test", "Test de tolérance")) + "</b> "; hd.appendChild(sl); var bg = el("button", "ic-ch", T("Neu würfeln", "Relancer")); bg.type = "button"; bg.onclick = go; sl.onchange = go; hd.appendChild(bg);
    var bx = el("button", "ic-ch", "✖"); bx.type = "button"; bx.onclick = function(){ tolBox.hidden = true; }; hd.appendChild(bx); tolBox.appendChild(hd); tolBox.appendChild(out); go(); }
  function shareShow(){ if (shBox.hidden === false){ shBox.hidden = true; return; } shBox.hidden = false; shBox.innerHTML = "";
    var ta = el("textarea"); ta.rows = 5; ta.value = JSON.stringify(S); ta.style.cssText = "width:100%;font:12px monospace;box-sizing:border-box";
    var hd = el("div"); hd.innerHTML = "<b>🔗 " + esc(T("Schaltung teilen / laden", "Partager / charger")) + "</b><p class=\"ic-lb\">" + esc(T("Den Text kopieren und weitergeben – oder einen erhaltenen Text hier einfügen und auf „Laden“ drücken.", "Copie le texte ou colle un texte reçu puis « Charger ».")) + "</p>"; shBox.appendChild(hd); shBox.appendChild(ta);
    var b1 = el("button", "ic-ch", "⧉ " + T("Kopieren", "Copier")); b1.type = "button"; b1.onclick = function(){ ta.select(); try { navigator.clipboard.writeText(ta.value).then(function(){ b1.textContent = "✔ " + T("Kopiert", "Copié"); }, function(){ document.execCommand && document.execCommand("copy"); }); } catch (e) { try { document.execCommand("copy"); } catch (e2) {} } };
    var b2 = el("button", "ic-ch", "📥 " + T("Laden", "Charger")); b2.type = "button"; b2.onclick = function(){ try { var n = JSON.parse(ta.value); if (!n || !Array.isArray(n.parts) || !Array.isArray(n.wires)) throw 0; push(); stopSim(); S = n; forceAna = false; sel = null; save(); render(); shBox.hidden = true; } catch (e) { b2.textContent = "⚠ " + T("Kein gültiger Schaltungstext", "Texte invalide"); } };
    var b3 = el("button", "ic-ch", "✖"); b3.type = "button"; b3.onclick = function(){ shBox.hidden = true; }; [b1, b2, b3].forEach(function(b){ shBox.appendChild(b); }); }
  var bomBox = null;
  function bomRows(){ var NM = { Q: "Transistor NPN", QP: "Transistor PNP", M: "MOSFET", PT: "Potentiometer", TA: "Taster", SW: "Schalter", LP: "Lampe / Motor", SU: "Summer", SIN: "Funktionsgenerator", TG: "Taktgeber", VS: "Spannungsquelle", AZ: "Anzeige", PD: "Fotodiode", RL: "Relais (Spule 70 Ω)" }, m = {}, order = [];
    S.parts.forEach(function(p){ if (/^(GND|V|VN|TK)$/.test(p.t)) return; var n, v = "";
      if (p.t === "R"){ n = "Widerstand"; v = fmt(p.v, "Ω"); } else if (p.t === "C"){ n = "Kondensator"; v = fmt(p.v, "F"); } else if (p.t === "LED"){ n = "LED"; v = ""; } else if (p.t === "D"){ n = p.z ? "Z-Diode" : "Diode"; v = p.z ? p.z + " V" : "1N4148"; }
      else if (p.t === "ic"){ n = "IC"; v = String(p.ic || "").toUpperCase(); } else if (p.t === "OP"){ n = "Operationsverstärker"; v = String(p.typ || "lm358").toUpperCase(); } else { n = NM[p.t] || p.t; }
      var key = n + "|" + v; if (!m[key]){ m[key] = { n: n, v: v, ids: [] }; order.push(key); } m[key].ids.push(p.id); });
    return order.map(function(k){ return m[k]; }); }
  function bomShow(){ var rows = bomRows(); if (bomBox.hidden === false){ bomBox.hidden = true; return; } bomBox.hidden = false; bomBox.innerHTML = "";
    if (!rows.length){ bomBox.textContent = T("Noch keine Bauteile auf der Fläche.", "Aucun composant."); return; }
    var h = "<b>📋 " + esc(T("Stückliste", "Nomenclature")) + "</b><table class=\"bau-bt\"><tr><th>" + esc(T("Anz.", "Qté")) + "</th><th>" + esc(T("Bauteil", "Composant")) + "</th><th>" + esc(T("Wert / Typ", "Valeur / type")) + "</th><th>" + esc(T("Bezeichner", "Repères")) + "</th></tr>";
    rows.forEach(function(r){ h += "<tr><td>" + r.ids.length + "</td><td>" + esc(r.n) + "</td><td>" + esc(r.v) + "</td><td>" + esc(r.ids.join(", ")) + "</td></tr>"; });
    var d = el("div"); d.innerHTML = h + "</table>"; bomBox.appendChild(d);
    var csv = "Anzahl;Bauteil;Wert;Bezeichner\n" + rows.map(function(r){ return [r.ids.length, r.n, r.v, r.ids.join(" ")].join(";"); }).join("\n");
    var b1 = el("button", "ic-ch", "⧉ " + T("Kopieren", "Copier")); b1.type = "button"; b1.onclick = function(){ try { navigator.clipboard.writeText(csv).then(function(){ b1.textContent = "✔ " + T("Kopiert", "Copié"); }, function(){ b1.textContent = T("Nicht möglich", "Impossible"); }); } catch (e) { b1.textContent = T("Nicht möglich", "Impossible"); } };
    var b2 = el("button", "ic-ch", "⬇ CSV"); b2.type = "button"; b2.onclick = function(){ try { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" })); a.download = "stueckliste.csv"; a.click(); } catch (e) {} };
    var b3 = el("button", "ic-ch", "✖"); b3.type = "button"; b3.onclick = function(){ bomBox.hidden = true; };
    bomBox.appendChild(b1); bomBox.appendChild(b2); bomBox.appendChild(b3); }
  var fault = null, faultBox = null;
  function fsig(X){ var P = X.parts.map(function(p){ return [p.id, p.t, p.v, p.c, p.f, p.u, p.pos, p.a, p.w, p.o, p.typ, p.ic, p.on, p.r].join("|"); }).sort().join(";"), W = X.wires.map(function(w){ return [w.a, w.b].sort().join("~"); }).sort().join(";"); return P + "#" + W; }
  function faultShow(msg, extra){ if (!faultBox) return; if (!fault){ faultBox.hidden = true; return; } faultBox.hidden = false;
    faultBox.innerHTML = "<b>🔧 " + T("Fehlersuche", "Dépannage") + "</b> – " + (msg || T("In dieser Schaltung steckt genau ein Fehler. Starte die Simulation, miss mit den Pins (anklicken) und repariere ihn.", "Il y a une panne dans ce circuit : mesure et répare.")) + " "; 
    [["✔ " + T("Prüfen", "Vérifier"), function(){ if (fsig(S) === fsig(fault.orig)){ var d = fault.desc; fault = null; faultShow("✅ " + T("Repariert – die Schaltung ist wieder wie sie sein soll!", "Réparé !")); setTimeout(function(){ if (!fault && faultBox) faultBox.hidden = true; }, 6000); } else faultShow(T("Noch nicht – der Fehler steckt noch drin.", "Pas encore.")); }], ["👁 " + T("Lösung zeigen", "Solution"), function(){ faultShow("💡 " + fault.desc); if (fault.pid){ sel = { p: fault.pid }; render(); } }], ["✖ " + T("Beenden", "Terminer"), function(){ fault = null; faultShow(); }]].forEach(function(b){ var x = el("button", "ic-ch", b[0]); x.type = "button"; x.onclick = b[1]; faultBox.appendChild(x); }); }
  function injectFault(){ if (!S.parts.length){ if (faultBox){ faultBox.hidden = false; faultBox.textContent = T("Erst eine Schaltung bauen oder ein Beispiel laden.", "Construis d’abord un circuit."); } return; }
    if (fault && fsig(S) !== fsig(fault.orig)) { S = JSON.parse(JSON.stringify(fault.orig)); } var orig = JSON.parse(JSON.stringify(S)), c = [], i;
    S.parts.forEach(function(p){ if (p.t === "R" && p.v) c.push({ k: "R", p: p }); if ((p.t === "LED" || p.t === "D")) c.push({ k: "L", p: p }); if (p.t === "C") c.push({ k: "C", p: p }); });
    S.wires.forEach(function(w, i2){ var a = w.a.split(".")[0], b = w.b.split(".")[0], pa = part(a), pb = part(b); if ((pa && pa.t === "GND") || (pb && pb.t === "GND") || (pa && pa.t === "V") || (pb && pb.t === "V") || (pa && pa.t === "TK") || (pb && pb.t === "TK")) return; c.push({ k: "W", i: i2, w: w }); });
    if (!c.length) return; var f = c[Math.floor(Math.random() * c.length)], desc = "";
    if (f.k === "R"){ var old = f.p.v, nv2 = old >= 1e4 ? old / 10 : old * 10; f.p.v = nv2; desc = T(f.p.id + " hat einen falschen Wert: " + fmt(nv2, "Ω") + " statt " + fmt(old, "Ω") + ".", f.p.id + " a une mauvaise valeur : " + fmt(nv2, "Ω") + " au lieu de " + fmt(old, "Ω") + "."); fault = { orig: orig, desc: desc, pid: f.p.id }; }
    else if (f.k === "C"){ var oc = f.p.v; f.p.v = oc >= 1e-6 ? oc / 100 : oc * 100; desc = T(f.p.id + " hat einen falschen Wert: " + fmt(f.p.v, "F") + " statt " + fmt(oc, "F") + ".", f.p.id + " a une mauvaise valeur."); fault = { orig: orig, desc: desc, pid: f.p.id }; }
    else if (f.k === "L"){ f.p.r = ((f.p.r || 0) + 2) % 4; desc = T(f.p.id + " ist verkehrt herum eingebaut (Polung).", f.p.id + " est montée à l’envers."); fault = { orig: orig, desc: desc, pid: f.p.id }; }
    else { S.wires.splice(f.i, 1); desc = T("Die Leitung zwischen " + f.w.a + " und " + f.w.b + " ist unterbrochen.", "Le fil entre " + f.w.a + " et " + f.w.b + " est coupé."); fault = { orig: orig, desc: desc, pid: null }; }
    sel = null; save(); render(); faultShow(); }
  /* ---- Beispiele für Analog ---- */
  function ex3(name){ var P = [], W2 = [], c = {}; function a(t, x, y, o){ var pf = PFX[t === "ic" ? "ic" : t]; c[pf] = (c[pf] || 0) + 1; var p = { id: pf + c[pf], t: t, x: x, y: y, r: 0 }; for (var k in o) p[k] = o[k]; P.push(p); return p.id; } function w(x, y, pts){ W2.push({ a: x, b: y, pts: pts || [] }); }
    if (name === "opinv"){ var g = a("SIN", 120, 180, { w: "sin", a: .5, f: 1000, o: 0 }), r1 = a("R", 250, 180, { v: 10e3 }), r2 = a("R", 400, 50, { v: 47e3 }), op = a("OP", 400, 200, { typ: "lm358" }), gp = a("GND", 340, 270), vp = a("V", 390, 100), vn = a("VN", 390, 330), t1 = a("TK", 200, 110, { ch: 0 }), t2 = a("TK", 560, 200, { ch: 1 });
      w(g + ".1", r1 + ".1"); w(r1 + ".2", op + ".N"); w(op + ".N", r2 + ".1"); w(r2 + ".2", op + ".O"); w(op + ".P", gp + ".1"); w(vp + ".1", op + ".VP"); w(vn + ".1", op + ".VN"); w(t1 + ".1", g + ".1"); w(t2 + ".1", op + ".O"); }
    if (name === "rc"){ var g2 = a("SIN", 120, 200, { w: "sin", a: .5, f: 1000, o: 0 }), r = a("R", 260, 200, { v: 10e3 }), cc = a("C", 360, 250, { r: 1, v: 10e-9 }), gr = a("GND", 360, 330), k1 = a("TK", 190, 120, { ch: 0 }), k2 = a("TK", 440, 150, { ch: 1 });
      w(g2 + ".1", r + ".1"); w(r + ".2", cc + ".1"); w(cc + ".2", gr + ".1"); w(k1 + ".1", g2 + ".1"); w(k2 + ".1", cc + ".1"); }
    if (name === "foto"){ var vf = a("V", 200, 90), pdd = a("PD", 200, 180, { r: 1, l: .5 }), rf = a("R", 200, 270, { r: 1, v: 10e3 }), gf = a("GND", 200, 340), tf = a("TK", 330, 225, { ch: 0 });
      w(vf + ".1", pdd + ".2"); w(pdd + ".1", rf + ".1"); w(rf + ".2", gf + ".1"); w(tf + ".1", pdd + ".1"); }
    if (name === "relais"){ var v1 = a("V", 100, 80), sw1 = a("SW", 100, 180, { r: 1 }), rl = a("RL", 260, 250), g1 = a("GND", 160, 340), v2 = a("V", 420, 80), r1 = a("R", 420, 180, { r: 1, v: 330 }), d1 = a("LED", 420, 270, { r: 1, c: "#6dffb0" }), g2 = a("GND", 420, 350);
      w(v1 + ".1", sw1 + ".1"); w(sw1 + ".2", rl + ".1"); w(rl + ".2", g1 + ".1"); w(v2 + ".1", rl + ".3"); w(rl + ".4", r1 + ".1"); w(r1 + ".2", d1 + ".1"); w(d1 + ".2", g2 + ".1"); }
    if (name === "zener"){ var vz = a("V", 200, 90), rz = a("R", 200, 170, { r: 1, v: 470 }), dz = a("D", 200, 260, { r: 1, z: 5.1 }), gz = a("GND", 200, 330), tz = a("TK", 330, 215, { ch: 0 });
      w(vz + ".1", rz + ".1"); w(rz + ".2", dz + ".2"); w(dz + ".1", gz + ".1"); w(tz + ".1", rz + ".2"); }
    if (name === "teiler"){ var v = a("V", 200, 90), ra = a("R", 200, 170, { r: 1, v: 4.7e3 }), rb = a("R", 200, 260, { r: 1, v: 10e3 }), gn = a("GND", 200, 330), tk = a("TK", 330, 215, { ch: 0 });
      w(v + ".1", ra + ".1"); w(ra + ".2", rb + ".1"); w(rb + ".2", gn + ".1"); w(tk + ".1", ra + ".2"); }
    if (name === "emitter"){ var gs = a("SIN", 60, 240, { w: "sin", a: .5, f: 1000, o: 0 }), ci = a("C", 150, 240, { v: 10e-6 }), v1 = a("V", 230, 60), r1b = a("R", 230, 140, { r: 1, v: 22e3 }), r2b = a("R", 230, 260, { r: 1, v: 10e3 }), g1 = a("GND", 230, 330), v2 = a("V", 400, 60), rc = a("R", 400, 140, { r: 1, v: 1e3 }), q = a("Q", 400, 240), re = a("R", 410, 330, { r: 1, v: 470 }), g2b = a("GND", 410, 400), k1b = a("TK", 130, 160, { ch: 0 }), k2b = a("TK", 520, 200, { ch: 1 });
      w(gs + ".1", ci + ".1"); w(ci + ".2", r2b + ".1"); w(r1b + ".2", r2b + ".1"); w(q + ".B", r2b + ".1"); w(v1 + ".1", r1b + ".1"); w(r2b + ".2", g1 + ".1"); w(v2 + ".1", rc + ".1"); w(rc + ".2", q + ".C"); w(q + ".E", re + ".1"); w(re + ".2", g2b + ".1"); w(k1b + ".1", gs + ".1"); w(k2b + ".1", q + ".C"); }
    return { parts: P, wires: W2 }; }

  /* --- Beispiele --- */
  function ex(name){ var P = [], W2 = [], c = {}; function a(t, x, y, o){ var pf = PFX[t === "ic" ? "ic" : t]; c[pf] = (c[pf] || 0) + 1; var p = { id: pf + c[pf], t: t, x: x, y: y, r: 0 }; for (var k in o) p[k] = o[k]; P.push(p); return p.id; }
    function w(x, y, pts){ W2.push({ a: x, b: y, pts: pts || [] }); }
    function pin(u, X, Y, n, k){ var h = n / 2; return k <= h ? [X - 20, Y + 20 * k] : [X + 140, Y + 20 * (n - k + 1)]; }
    function gnd(id, X, Y){ var g = a("GND", X, Y + 40); w(g + ".1", id); } function vcc(id, X, Y){ var v = a("V", X, Y - 40); w(v + ".1", id); }
    if (name === "led"){ var v = a("V", 100, 80), s = a("TA", 200, 120), r = a("R", 320, 120, { v: 330 }), d = a("LED", 440, 120, { c: "#ff4d4d" }), g = a("GND", 520, 180); w(v + ".1", s + ".1"); w(s + ".2", r + ".1"); w(r + ".2", d + ".1"); w(d + ".2", g + ".1"); }
    function chainR(id, y, x0, col){ var rr = a("R", x0 + 30, y, { v: 330 }), dd = a("LED", x0 + 130, y, { c: col }), g2 = a("GND", x0 + 180, y + 30); w(rr + ".2", dd + ".1"); w(dd + ".2", g2 + ".1"); return rr; }
    if (name === "nand"){ var u = a("ic", 400, 100, { ic: "hc00" });
      var vn = a("V", 460, 40); w(vn + ".1", u + ".14"); var gn = a("GND", 460, 340); w(u + ".7", gn + ".1");
      [4, 5, 9, 10, 12, 13].reduce(function(pv, k){ w(u + "." + pv, u + "." + k); return k; }); var gu = a("GND", 370, 310); w(gu + ".1", u + ".13");
      var t1 = a("TG", 320, 120, { f: 1 }), t2 = a("TG", 240, 140, { f: 0.5 }); w(t1 + ".1", u + ".1"); w(t2 + ".1", u + ".2");
      var r3 = a("R", 590, 120, { v: 330 }), d1 = a("LED", 620, 170, { r: 1, c: "#6dffb0" }), g3 = a("GND", 620, 240); w(u + ".3", r3 + ".1"); w(r3 + ".2", d1 + ".1"); w(d1 + ".2", g3 + ".1");
      var k1 = a("TK", 600, 70, { ch: 0 }); w(k1 + ".1", u + ".3"); }
    if (name === "blink"){ var t5 = a("ic", 400, 100, { ic: "ne555" });
      var R1 = a("R", 300, 90, { r: 1, v: 1e3 }), R2 = a("R", 300, 150, { r: 1, v: 47e3 }), C1 = a("C", 300, 230, { r: 1, v: 10e-6 }), Vr = a("V", 300, 20), Gc = a("GND", 300, 300);
      w(Vr + ".1", R1 + ".1"); w(R1 + ".2", t5 + ".7"); w(R1 + ".2", R2 + ".1"); w(R2 + ".2", C1 + ".1"); w(t5 + ".6", t5 + ".2"); w(t5 + ".2", C1 + ".1", [[360, 160], [360, 190], [300, 190]]); w(C1 + ".2", Gc + ".1");
      var Vc = a("V", 460, 20); w(Vc + ".1", t5 + ".8"); w(t5 + ".4", t5 + ".8"); var G1 = a("GND", 450, 240); w(t5 + ".1", G1 + ".1"); var C2 = a("C", 500, 250, { r: 1, v: 10e-9 }), G2 = a("GND", 500, 320); w(t5 + ".5", C2 + ".1"); w(C2 + ".2", G2 + ".1");
      var R3 = a("R", 590, 120, { v: 330 }), D1 = a("LED", 620, 170, { r: 1, c: "#ff4d4d" }), G3 = a("GND", 620, 240); w(t5 + ".3", R3 + ".1"); w(R3 + ".2", D1 + ".1"); w(D1 + ".2", G3 + ".1");
      var TK = a("TK", 600, 70, { ch: 0 }); w(TK + ".1", t5 + ".3"); }
    if (name === "lauf"){ var u2 = a("ic", 400, 80, { ic: "cd4017" }), tg = a("TG", 300, 100, { f: 2 });
      var vv = a("V", 460, 20); w(vv + ".1", u2 + ".16"); var gg = a("GND", 460, 360); w(u2 + ".8", gg + ".1"); w(u2 + ".13", u2 + ".15"); var gr = a("GND", 370, 190); w(gr + ".1", u2 + ".15"); w(tg + ".1", u2 + ".14");
      [3, 2, 4, 7, 10].forEach(function(pin, i){ var yp = 100 + 20 * i, yr = 100 + 60 * i, xm = 600 - 10 * i, rr = chainR(null, yr, 590, ["#ff4d4d", "#ffd43b", "#6dffb0", "#4dabf7", "#ff4d4d"][i]); w(u2 + "." + pin, rr + ".1", i ? [[xm, yp], [xm, yr]] : []); });
      var tk1 = a("TK", 330, 160, { ch: 0 }); w(tk1 + ".1", tg + ".1", [[270, 160], [270, 130], [350, 130], [350, 100]]); var tk2 = a("TK", 680, 40, { ch: 1 }); w(tk2 + ".1", u2 + ".3", [[560, 40], [560, 100]]); }
    if (name === "zaehl"){ var z = a("ic", 300, 140, { ic: "hc193" }), dc = a("ic", 560, 100, { ic: "cd4511" }), az = a("AZ", 860, 100);
      var vz = a("V", 360, 80); w(vz + ".1", z + ".16"); var gz = a("GND", 360, 380); w(z + ".8", gz + ".1");
      var vp = a("V", 270, 100); w(vp + ".1", z + ".11"); w(z + ".11", z + ".4"); [14, 15, 1, 10].forEach(function(k, i, arr){ w(z + "." + k, z + "." + (arr[i + 1] || 9)); }); var gb = a("GND", 270, 350); w(gb + ".1", z + ".9");
      var tz = a("TA", 170, 200), vt = a("V", 100, 160), rp = a("R", 210, 250, { r: 1, v: 10e3 }); w(vt + ".1", tz + ".1"); w(tz + ".2", z + ".5"); w(rp + ".1", tz + ".2"); w(rp + ".2", z + ".9");
      [[3, 7], [2, 1], [6, 2], [7, 6]].forEach(function(q){ w(z + "." + q[0], dc + "." + q[1]); });
      var vd = a("V", 530, 40); w(vd + ".1", dc + ".3"); w(dc + ".3", dc + ".4"); var gl = a("GND", 530, 290); w(gl + ".1", dc + ".5"); var vdd = a("V", 620, 20); w(vdd + ".1", dc + ".16"); var gs = a("GND", 620, 320); w(dc + ".8", gs + ".1");
      [[13, 7], [12, 6], [11, 4], [10, 2], [9, 1], [15, 9], [14, 10]].forEach(function(q, i){ var rr = a("R", 770, 120 + 20 * i, { v: 330, lb: 0 }); w(dc + "." + q[0], rr + ".1"); w(rr + ".2", az + "." + q[1]); });
      var ga2 = a("GND", 900, 330); w(az + ".3", ga2 + ".1"); var tkz = a("TK", 230, 120, { ch: 0 }); w(tkz + ".1", tz + ".2", [[190, 120], [190, 160], [230, 160]]); }
    return { parts: P, wires: W2 }; }
  function ex2(name){ var P = [], W2 = [], c = {}; function a(t, x, y, o){ var pf = PFX[t === "ic" ? "ic" : t]; c[pf] = (c[pf] || 0) + 1; var p = { id: pf + c[pf], t: t, x: x, y: y, r: 0 }; for (var k in o) p[k] = o[k]; P.push(p); return p.id; } function w(x, y, pts){ W2.push({ a: x, b: y, pts: pts || [] }); }
    if (name === "daemm"){ var u = a("ic", 400, 100, { ic: "lm393" }), vs = a("VS", 300, 80, { u: 3.5 }), pt = a("PT", 300, 170, { v: 10e3, pos: 50 }), v1 = a("V", 240, 120), g1 = a("GND", 340, 210);
      w(vs + ".1", u + ".3"); w(pt + ".S", u + ".2", [[300, 240], [360, 240], [360, 140]]); w(v1 + ".1", pt + ".1"); w(pt + ".2", g1 + ".1"); w(u + ".5", u + ".6"); var g2 = a("GND", 370, 210); w(g2 + ".1", u + ".6");
      var vc = a("V", 460, 40); w(vc + ".1", u + ".8"); var gc = a("GND", 460, 260); w(u + ".4", gc + ".1");
      var rr = a("R", 640, 90, { r: 1, v: 330 }), dd = a("LED", 610, 120, { r: 2, c: "#ffd43b" }), vr = a("V", 640, 20); w(vr + ".1", rr + ".1"); w(rr + ".2", dd + ".1"); w(dd + ".2", u + ".1"); var tk = a("TK", 600, 180, { ch: 0 }); w(tk + ".1", u + ".1"); }
    if (name === "ff2"){ var f = a("ic", 400, 100, { ic: "hc74" }), vv = a("V", 320, 90), gg = a("GND", 370, 320), tg = a("TG", 300, 160, { f: 1 });
      w(vv + ".1", f + ".1"); w(f + ".1", f + ".4"); w(tg + ".1", f + ".3"); [13, 10, 11, 12].reduce(function(pv, k){ w(f + "." + pv, f + "." + k); return k; }); w(f + ".12", gg + ".1");
      var vc2 = a("V", 460, 40); w(vc2 + ".1", f + ".14"); var gc2 = a("GND", 460, 340); w(f + ".7", gc2 + ".1"); w(f + ".6", f + ".2", [[560, 120], [560, 370], [350, 370], [350, 180]]);
      var r2 = a("R", 620, 140, { v: 330 }), d2 = a("LED", 720, 140, { c: "#6dffb0" }), g3 = a("GND", 770, 190); w(f + ".5", r2 + ".1"); w(r2 + ".2", d2 + ".1"); w(d2 + ".2", g3 + ".1"); var tk2 = a("TK", 640, 90, { ch: 1 }); w(tk2 + ".1", f + ".5"); }
    if (name === "npn"){ var tg2 = a("TG", 240, 200, { f: 1 }), rb = a("R", 320, 200, { v: 1e3 }), q = a("Q", 400, 200), lp = a("LP", 410, 110, { r: 1 }), vq = a("V", 410, 40), gq = a("GND", 410, 290), bz = a("SU", 490, 110, { r: 1 }), vb = a("V", 490, 40);
      w(tg2 + ".1", rb + ".1"); w(rb + ".2", q + ".B"); w(vq + ".1", lp + ".1"); w(lp + ".2", q + ".C"); w(q + ".E", gq + ".1"); w(vb + ".1", bz + ".1"); w(bz + ".2", q + ".C", [[490, 150], [410, 150]]); }
    return { parts: P, wires: W2 }; }
  var EXS = [["led", T("LED mit Taster und Vorwiderstand", "LED avec bouton")], ["nand", T("NAND-Gatter 74HC00 mit zwei Schaltern", "Porte NON-ET 74HC00")], ["blink", T("Blinker mit NE555", "Clignotant NE555")], ["lauf", T("Lauflicht: Taktgeber + CD4017", "Chenillard CD4017")], ["zaehl", T("Zähler mit Anzeige: 74HC193 + CD4511", "Compteur avec afficheur")], ["daemm", T("Dämmerungsschalter: Spannungsquelle + Poti + LM393", "Interrupteur crépusculaire : LM393")], ["ff2", T("Flip-Flop teilt durch 2 (74HC74)", "Bascule ÷2 (74HC74)")], ["npn", T("Transistor schaltet Lampe und Summer", "Transistor : lampe et buzzer")],
    ["opinv", T("⚡ Opamp: invertierender Verstärker (LM358, ±5 V)", "⚡ Ampli op inverseur")], ["rc", T("⚡ RC-Tiefpass – Frequenzgang messen", "⚡ Passe-bas RC – réponse en fréquence")], ["foto", T("⚡ Fotodiode: Licht wird Spannung", "⚡ Photodiode : lumière en tension")], ["relais", T("⚡ Relais schaltet LED (Schalter anklicken)", "⚡ Relais commande une LED")], ["zener", T("⚡ Z-Diode stabilisiert 5,1 V", "⚡ Diode Zener : stabilisation 5,1 V")], ["teiler", T("⚡ Spannungsteiler mit Messpunkt", "⚡ Diviseur de tension")], ["emitter", T("⚡ Transistor-Verstärker (Emitterschaltung)", "⚡ Amplificateur à émetteur commun")]];

  /* --- Seite aufbauen --- */
  function page(root){
    root.innerHTML = ""; document.title = T("Werkstatt – eigene Schaltung bauen", "Atelier – construire son circuit") + " – Oratio Tech Studio";
    root.appendChild(el("div", "crumb", '<a href="index.html">Oratio Place</a> › <a href="index.html#/studio">Oratio Tech Studio</a> › <a href="#">' + T("Schaltungen", "Circuits") + "</a> › " + T("Werkstatt", "Atelier")));
    root.appendChild(el("div", "ic-hero", '<div class="ic-k">' + T("WERKSTATT", "ATELIER") + "</div><h1>" + T("Eigene Schaltung bauen und simulieren", "Construis et simule ton circuit") + "</h1><p>" + T("Wie in LTspice, nur einfacher: ICs und Bauteile aus der Liste holen, frei verschieben, Pins mit Drähten verbinden. Die Simulation läuft nur, wenn alles richtig verdrahtet ist – sonst sagt sie dir, was fehlt.", "Comme LTspice, en plus simple : place, relie, simule. La simulation indique ce qui manque.") + "</p>"));
    try { S = JSON.parse(localStorage.getItem("iclab_bau")); curEx = localStorage.getItem("iclab_bau_ex") || null; } catch(e){ S = null; } if (!S || !S.parts){ S = ex("led"); curEx = "led"; } var hx = (decodeURIComponent(location.hash.replace(/^#/, "")).split("/")[1] || ""); if (/^(opinv|rc|zener|foto|relais|teiler|emitter)$/.test(hx)){ S = ex3(hx); forceAna = true; curEx = hx; save(); }
    var bar = el("div", "bau-bar"); root.appendChild(bar);
    simBtn = el("button", "ic-ch bau-run"); simBtn.type = "button"; simBtn.onclick = function(){ if (sim) stopSim(); else startSim(); }; bar.appendChild(simBtn);
    function btn(lbl, f){ var b = el("button", "ic-ch", lbl); b.type = "button"; b.onclick = f; bar.appendChild(b); return b; }
    btn("↶ " + T("Zurück", "Annuler"), function(){ if (!undo.length) return; S = JSON.parse(undo.pop()); sel = null; save(); render(); });
    btn("🗑 " + T("Auswahl löschen", "Supprimer"), del);
    btn("➖", function(){ zoom = Math.max(0.25, zoom - 0.15); fit(); }); btn("⤢ " + T("Alles zeigen", "Tout voir"), function(){ if (!sim){ render(); centerView(true); } else { render(); centerView(false); } }); btn("➕", function(){ zoom = Math.min(2, zoom + 0.15); fit(); });
    var exs = el("select", "bau-ex"); exs.innerHTML = '<option value="">📂 ' + T("Beispiel laden …", "Charger un exemple …") + "</option>" + EXS.map(function(e){ return '<option value="' + e[0] + '">' + esc(e[1]) + "</option>"; }).join(""); bar.appendChild(exs);
    function ladeBsp(n){ push(); stopSim(); S = /^(opinv|rc|zener|foto|relais|teiler|emitter)$/.test(n) ? ex3(n) : /^(daemm|ff2|npn)$/.test(n) ? ex2(n) : ex(n); forceAna = /^(teiler|zener|foto|relais)$/.test(n); curEx = n; sel = null; wiring = null; fault = null; if (faultBox) faultBox.hidden = true; save(); render(); centerView(true); }
    exs.onchange = function(){ var n = exs.value; if (!n) return; exs.value = ""; ladeBsp(n); };
    resBtn = btn("↺ " + T("Zurücksetzen", "Réinitialiser"), function(){ if (curEx) ladeBsp(curEx); }); resBtn.title = T("Das geladene Beispiel wieder so herstellen, wie es war", "Remettre l’exemple chargé dans son état d’origine"); resBtn.hidden = !curEx;
    btn("🧹 " + T("Neu (leer)", "Nouveau"), function(){ push(); stopSim(); S = { parts: [], wires: [] }; forceAna = false; curEx = null; sel = null; save(); render(); });
    anaBtn = btn("⚡ " + T("Analog-Modus", "Mode analogique"), function(){ forceAna = !forceAna; anaBtn.classList.toggle("on", forceAna || hasAna()); if (sim){ stopSim(); startSim(); } });
    btn("🔧 " + T("Fehler einbauen", "Insérer une panne"), injectFault);
    btn("📋 " + T("Stückliste", "Nomenclature"), bomShow);
    btn("🎲 " + T("Toleranz-Test", "Tolérances"), tolRun); btn("🔗 " + T("Teilen", "Partager"), shareShow);
    tolBox = el("div", "bau-fault bau-bom"); tolBox.hidden = true; root.appendChild(tolBox); shBox = el("div", "bau-fault bau-bom"); shBox.hidden = true; root.appendChild(shBox);
    bomBox = el("div", "bau-fault bau-bom"); bomBox.hidden = true; root.appendChild(bomBox);
    faultBox = el("div", "bau-fault"); faultBox.hidden = true; root.appendChild(faultBox);
    var grid = el("div", "bau-grid"); root.appendChild(grid);
    var pal = el("aside", "bau-pal"); grid.appendChild(pal);
    pal.appendChild(el("h3", "", T("Bauteile", "Composants")));
    BASIC.forEach(function(b){ var x = el("button", "bau-it", "<b>" + esc(T(b[1], b[2])) + "</b><span>" + esc(b[3]) + "</span>"); x.type = "button"; x.onclick = function(){ place(b[0]); }; pal.appendChild(x); });
    pal.appendChild(el("h3", "", "ICs"));
    var q = el("input", "ic-search"); q.type = "search"; q.placeholder = T("IC suchen …", "Chercher un CI …"); pal.appendChild(q); var il = el("div", "bau-ics"); pal.appendChild(il);
    ICS.filter(function(d){ return /DIP|Modul/.test(d.pkg); }).sort(function(a, b){ return (MOD[b.id] || AOP[b.id] ? 1 : 0) - (MOD[a.id] || AOP[a.id] ? 1 : 0); }).forEach(function(d){ var x = el("button", "bau-it", "<b>" + esc(d.name.split(" / ")[0]) + (MOD[d.id] || AOP[d.id] ? ' <em class="sim">' + T("simuliert", "simulé") + "</em>" : "") + "</b><span>" + esc(T(d.k[0], d.k[1])) + "</span>"); x.type = "button"; x.dataset.s = (d.name + " " + d.k[0]).toLowerCase(); x.onclick = function(){ place("ic", d.id); }; il.appendChild(x); });
    q.oninput = function(){ var v = q.value.toLowerCase(); il.childNodes.forEach(function(x){ x.hidden = v && x.dataset.s.indexOf(v) < 0; }); };
    var mid = el("section", "bau-mid"); grid.appendChild(mid);
    propBox = el("div", "bau-prop"); mid.appendChild(propBox);
    wrap = el("div", "bau-cv"); mid.appendChild(wrap); wrap.innerHTML = '<svg class="bau-svg" xmlns="http://www.w3.org/2000/svg"></svg>'; svg = wrap.firstChild;
    var rc = el("aside", "bau-right"); grid.appendChild(rc);
    rc.appendChild(el("h3", "ic-h3", "📈 " + T("Oszilloskop", "Oscilloscope"))); scopeCv = el("canvas", "bau-scope"); rc.appendChild(scopeCv);
    var tr = el("div", "bau-tb"); rc.appendChild(tr); tr.appendChild(el("span", "ic-lb", T("Zeit pro Kästchen:", "Temps par division :")));
    tbBox = el("select", "bau-ex"); tbBox.innerHTML = TBS.map(function(o){ return '<option value="' + o[0] + '">' + o[1] + "</option>"; }).join(""); tbBox.value = tbSel; tbBox.onchange = function(){ tbSel = tbBox.value; if (sim && sim.ana){ sim.atr = [[], [], [], []]; } }; tr.appendChild(tbBox);
    var bb = el("button", "ic-ch", "📉 " + T("Frequenzgang messen", "Réponse en fréquence")); bb.type = "button"; bb.onclick = bodeRun; tr.appendChild(bb);
    bodeCv = el("canvas", "bau-scope"); bodeCv.hidden = true; bodeCv.style.height = "300px"; rc.appendChild(bodeCv); bodeInfo = el("p", "ic-lb"); rc.appendChild(bodeInfo);
    rc.appendChild(el("h3", "ic-h3", T("Meldungen", "Messages"))); msgBox = el("div", "bau-msg"); rc.appendChild(msgBox);
    rc.appendChild(el("p", "ic-lb", T("Farben der Drähte während der Simulation: rot = HIGH, blau = LOW, grau = offen/unbestimmt, orange blinkend = Kurzschluss. Pin-Punkte: rot = Versorgung, grau = GND, orange = Eingang, türkis = Ausgang.", "Couleurs : rouge = HAUT, bleu = BAS, gris = indéfini, orange = court-circuit.") + " " + T("Im Analog-Modus zeigt die Farbe der Drähte die Spannung: rot = positiv, blau = null oder negativ – und ein Klick auf einen Pin zeigt den genauen Wert.", "En mode analogique la couleur indique la tension : un clic sur une broche donne la valeur.")));
    fit(); stopSim(); events(); render(); centerView(true); }
  var VW = 1200, VH = 760;
  function fit(){ VW = Math.max(1200, Math.ceil((wrap.clientWidth - 4) / zoom)); VH = Math.max(760, Math.ceil((wrap.clientHeight - 4) / zoom)); svg.setAttribute("viewBox", "0 0 " + VW + " " + VH); svg.style.width = Math.round(VW * zoom) + "px"; svg.style.height = Math.round(VH * zoom) + "px"; }
  /* Schaltung mittig und möglichst ganz sichtbar anzeigen */
  function centerView(shift){ if (!svg || !wrap || !S || !S.parts.length) return; var bx1 = 1e9, by1 = 1e9, bx2 = -1e9, by2 = -1e9;
    svg.querySelectorAll(".pt").forEach(function(g){ try { var b = g.getBBox(); bx1 = Math.min(bx1, b.x); by1 = Math.min(by1, b.y); bx2 = Math.max(bx2, b.x + b.width); by2 = Math.max(by2, b.y + b.height); } catch(e){} });
    if (bx1 > bx2) return; var bw = bx2 - bx1 + 70, bh = by2 - by1 + 70;
    zoom = Math.max(.3, Math.min(window.innerWidth < 760 ? 1 : 1.5, Math.min((wrap.clientWidth - 4) / bw, (wrap.clientHeight - 4) / bh))); fit();
    if (shift){ var dx = Math.round((VW / 2 - (bx1 + bx2) / 2) / G) * G, dy = Math.round((VH / 2 - (by1 + by2) / 2) / G) * G;
      if (dx || dy){ S.parts.forEach(function(p){ p.x += dx; p.y += dy; }); S.wires.forEach(function(w){ (w.pts || []).forEach(function(q){ q[0] += dx; q[1] += dy; }); }); save(); render(); } }
    wrap.scrollLeft = Math.max(0, (VW * zoom - wrap.clientWidth) / 2); wrap.scrollTop = Math.max(0, (VH * zoom - wrap.clientHeight) / 2); }
  function place(t, ic){ var x = (wrap.scrollLeft + wrap.clientWidth / 2) / zoom - 40 + (S.parts.length % 5) * 20, y = (wrap.scrollTop + wrap.clientHeight / 2) / zoom - 60 + (S.parts.length % 5) * 20; addPart(t, ic, Math.max(60, x), Math.max(60, y)); }
  function pt(ev){ var m = svg.getScreenCTM(); if (!m) return [0, 0]; var p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; p = p.matrixTransform(m.inverse()); return [p.x, p.y]; }
  function events(){
    var drag = null;
    svg.addEventListener("pointerdown", function(ev){ if (ev.button === 2) return; var t = ev.target, tm = t.closest("[data-t]"), pg = t.closest("[data-p]"), wr = t.closest("[data-w]"), xy = pt(ev);
      if (sim && tm){ sim.meas = tm.dataset.t; svg.querySelectorAll(".mb").forEach(function(e){ e.remove(); }); paintSim(); ev.preventDefault(); return; }
      if (sim){ if (!pg && tm){ pg = svg.querySelector('[data-p="' + tm.dataset.t.split(".")[0] + '"]'); } if (pg){ var p = part(pg.dataset.p); if (p.t === "TA"){ sim.press[p.id] = 1; svg.setPointerCapture(ev.pointerId); drag = { press: p.id }; } else if (p.t === "SW"){ p.on = !p.on; save(); } else { sel = { p: p.id }; props(); } } return; }
      if (tm){ var k = tm.dataset.t; if (wiring){ if (k !== wiring.a){ push(); S.wires.push({ a: wiring.a, b: k, pts: wiring.pts }); save(); } wiring = null; render(); } else { wiring = { a: k, pts: [] }; sel = null; render(); } ev.preventDefault(); return; }
      if (wiring){ var last = wiring.pts.length ? wiring.pts[wiring.pts.length - 1] : null; wiring.pts.push([snap(xy[0]), snap(xy[1])]); render(); return; }
      if (pg){ var p2 = part(pg.dataset.p); sel = { p: p2.id }; push(); drag = { id: p2.id, dx: xy[0] - p2.x, dy: xy[1] - p2.y, moved: false }; svg.setPointerCapture(ev.pointerId); render(); ev.preventDefault(); return; }
      if (wr){ sel = { w: +wr.dataset.w }; render(); return; }
      sel = null; render(); });
    svg.addEventListener("pointermove", function(ev){ var xy = pt(ev);
      if (wiring){ var e = svg.querySelector(".wp"); if (e){ var T2 = allTerms(); e.setAttribute("d", wpath({ a: wiring.a, pts: wiring.pts }, T2, [snap(xy[0]), snap(xy[1])])); } }
      if (drag && drag.id){ var p = part(drag.id), nx = snap(xy[0] - drag.dx), ny = snap(xy[1] - drag.dy); if (nx !== p.x || ny !== p.y){ p.x = nx; p.y = ny; drag.moved = true; render(); } } });
    svg.addEventListener("pointerup", function(){ if (drag && drag.press && sim) sim.press[drag.press] = 0; if (drag && drag.id){ if (!drag.moved) undo.pop(); save(); } drag = null; });
    svg.addEventListener("contextmenu", function(ev){ if (wiring){ ev.preventDefault(); wiring = null; render(); } });
    document.addEventListener("keydown", KEY); }
  function KEY(ev){ if (!svg || !document.body.contains(svg)){ document.removeEventListener("keydown", KEY); return; } if (/INPUT|SELECT|TEXTAREA/.test((ev.target || {}).tagName || "")) return;
    if (ev.key === "Escape"){ wiring = null; render(); } if ((ev.key === "Delete" || ev.key === "Backspace") && sel){ ev.preventDefault(); del(); } if (ev.key === "r" && sel && sel.p){ var p = part(sel.p); if (/^(R|LED|D|C|TA|SW|LP|SU)$/.test(p.t)){ push(); p.r = ((p.r || 0) + 1) % 4; save(); render(); } } }
  window.addEventListener("resize", function(){ if (svg && document.body.contains(svg)) drawScope(); });
  return { page: page, stop: function(){ if (sim) stopSim(); svg = null; }, sims: function(){ return Object.keys(MOD).length; }, _s: function(){ return { sim: sim, S: S }; }, _a: function(){ return { anaBuild: anaBuild, anaDC: anaDC, anaStep: anaStep, vof: vof }; } };
})();

/* Scroll-Position merken: zurück = wieder dort, wo man war */
var SCR = {}, FRESH = false; try { SCR = JSON.parse(sessionStorage.getItem("scr") || "{}"); } catch(e){}
function skey(){ return location.pathname + (location.hash || "#"); }
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
document.addEventListener("click", function(e){ var a = e.target.closest && e.target.closest("a[href]"); if (a) FRESH = true; }, true);
var scrT = 0; window.addEventListener("scroll", function(){ SCR[skey()] = window.scrollY; clearTimeout(scrT); scrT = setTimeout(function(){ try { sessionStorage.setItem("scr", JSON.stringify(SCR)); } catch(e){} }, 200); }, { passive: true });
window.addEventListener("pagehide", function(){ try { sessionStorage.setItem("scr", JSON.stringify(SCR)); } catch(e){} });
function scrollBack(){ var y = FRESH ? 0 : (SCR[skey()] || 0); FRESH = false; window.scrollTo(0, y); if (y) setTimeout(function(){ window.scrollTo(0, y); }, 120); }
function route(){
  var h = decodeURIComponent(location.hash.replace(/^#/, "")), p = h.split("/");
  BAU.stop(); if (p[0] === "bau"){ stopLive(); BAU.page(root); scrollBack(); return; }
  if (!h) listPage(); else if (p[0] === "p" || p[0] === "k") circuitPage(p[1]); else if (icById(p[0])) circuitPage(p[1] && PROJ[p[1]] ? p[1] : icById(p[0]).proj[0]); else listPage();
  scrollBack();
}
function start(){ root = $("#iclab"); window.addEventListener("hashchange", route); route(); }
return { start: start, bau: BAU, _d: function(){ return { LAY: LAY, schem2: schem2, NL: NL, PROJ: PROJ, A: netAnalyse, KOMBI: KOMBI, icDef: icDef }; } };
})();
