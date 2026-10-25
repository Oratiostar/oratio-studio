// Weihnachtswelt – gezeichnete Gerichte (SVG), je Rezept ein Bild. XM.dish(rezept, uid) -> SVG-String
(function(){
var W = 400, H = 240;
function plate(cx, cy, rx, ry, col){ ry = ry || rx * .32; return '<ellipse cx="' + cx + '" cy="' + (cy + 6) + '" rx="' + (rx + 6) + '" ry="' + ry + '" fill="rgba(0,0,0,.28)"/><ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + (col || "#fbf6ec") + '"/><ellipse cx="' + cx + '" cy="' + (cy - 1) + '" rx="' + (rx * .78) + '" ry="' + (ry * .72) + '" fill="rgba(0,0,0,.06)"/>'; }
function steam(x, y){ return '<g class="xs-smoke" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="3" stroke-linecap="round"><path d="M' + x + ' ' + y + 'c-8-10 8-16 0-26"/><path d="M' + (x + 14) + ' ' + (y + 4) + 'c-8-10 8-16 0-26"/></g>'; }
function dot(x, y, r, c){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c + '"/>'; }
function star5(cx, cy, R, c){ var p = []; for (var i = 0; i < 10; i++){ var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * .45 : R; p.push((cx + Math.cos(a) * r).toFixed(1) + "," + (cy + Math.sin(a) * r).toFixed(1)); } return '<polygon points="' + p.join(" ") + '" fill="' + c + '"/>'; }
function sprig(x, y, s){ return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')"><path d="M0 0l-9 9M0 0l9 9M0 0v-10M0 0l-13 -2M0 0l13 -2" stroke="#2f7a3a" stroke-width="3" stroke-linecap="round"/>' + dot(0, 4, 2.4, "#c8202a") + dot(4, 2, 2.4, "#c8202a") + '</g>'; }
function cookie(x, y, r, c, rot){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c + '"/><circle cx="' + x + '" cy="' + y + '" r="' + (r * .8) + '" fill="rgba(255,255,255,.14)"/>'; }
var K = {
  mug: function(r){
    var d = r.c.drink, rim = r.c.rim, o = "";
    o += '<ellipse cx="200" cy="205" rx="105" ry="16" fill="rgba(0,0,0,.28)"/>';
    o += '<path d="M280 112c34-6 40 40 4 52" fill="none" stroke="' + rim + '" stroke-width="12" stroke-linecap="round"/>';
    o += '<path d="M118 84h164l-14 104q-4 22-26 22h-84q-22 0-26-22z" fill="' + rim + '"/>';
    o += '<path d="M126 100h148l-11 86q-3 16-20 16h-86q-17 0-20-16z" fill="' + d + '"/>';
    o += '<ellipse cx="200" cy="86" rx="82" ry="12" fill="' + rim + '"/><ellipse cx="200" cy="88" rx="74" ry="9" fill="' + d + '"/>';
    o += '<path d="M130 120h140" stroke="rgba(255,255,255,.18)" stroke-width="6"/>';
    if (r.deko === "sahne") o += '<path d="M150 84q10-26 28-14q8-24 30-6q22-14 30 10q10 8-4 14h-84z" fill="#fff"/>' + star5(200, 66, 8, "#c8202a");
    if (r.deko === "orange") o += '<circle cx="168" cy="82" r="17" fill="#f2951c"/><circle cx="168" cy="82" r="12" fill="#ffd27a"/><path d="M168 70v24M156 82h24" stroke="#f2951c" stroke-width="2"/><path d="M232 90l30-46" stroke="#7a4a1a" stroke-width="5" stroke-linecap="round"/>';
    if (r.deko === "zitrone") o += '<circle cx="172" cy="82" r="17" fill="#f4dc3a"/><circle cx="172" cy="82" r="12" fill="#fff2a0"/><path d="M172 70v24M160 82h24" stroke="#f4dc3a" stroke-width="2"/><path d="M232 90l30-46" stroke="#7a4a1a" stroke-width="5" stroke-linecap="round"/>';
    if (r.deko === "apfel") o += '<path d="M168 70q14-10 28 0q6 22-14 22q-20 0-14-22z" fill="#d6402a"/><path d="M182 68q0-8 4-10" stroke="#5a3a1a" stroke-width="2.5" fill="none"/><path d="M232 90l30-46" stroke="#7a4a1a" stroke-width="5" stroke-linecap="round"/>';
    o += star5(200, 160, 12, "rgba(255,255,255,.55)") + steam(176, 60) + steam(232, 58);
    return o;
  },
  crescent: function(r){
    var o = plate(200, 170, 138), a = r.c.a;
    [[150, 150, -20], [250, 150, 20], [200, 180, 0]].forEach(function(p){ o += '<g transform="translate(' + p[0] + ' ' + p[1] + ') rotate(' + p[2] + ')"><path d="M-46 8q46-62 92 0q-14-6-22 4q-24-34-48 0q-8-10-22-4z" fill="' + a + '"/><path d="M-40 6q40-50 80 0" fill="none" stroke="#c89a4a" stroke-width="3"/></g>'; });
    for (var i = 0; i < 40; i++) o += dot(100 + ((i * 53) % 200), 110 + ((i * 37) % 80), 2.2, "#fff");
    return o + sprig(200, 120, 1);
  },
  bakedapple: function(r){
    var o = plate(200, 190, 130);
    o += '<path d="M135 130q0-52 65-52q65 0 65 52q0 58-65 58q-65 0-65-58z" fill="#c4361e"/><path d="M150 120q4-30 36-34" stroke="rgba(255,255,255,.35)" stroke-width="7" fill="none" stroke-linecap="round"/>';
    o += '<ellipse cx="200" cy="96" rx="30" ry="12" fill="#7a2a14"/><ellipse cx="200" cy="94" rx="24" ry="8" fill="#e2a050"/>';
    o += '<path d="M200 80q2-22 14-26" stroke="#5a3a1a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M214 56q22-14 30 4q-18 10-30-4z" fill="#3a8a3a"/>';
    o += '<path d="M170 180q-30-4-50 6M232 180q30-4 50 6" stroke="#f4f0e0" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M110 150q16-20 34-4M290 150q-16-20-34-4" stroke="#7a4a1a" stroke-width="4" fill="none" stroke-linecap="round"/>';
    return o + steam(200, 70);
  },
  cabbage: function(r){
    var o = plate(200, 185, 135);
    o += '<path d="M120 160q0-70 80-70q80 0 80 70q0 26-80 26q-80 0-80-26z" fill="' + r.c.a + '"/>';
    for (var i = 0; i < 14; i++) o += '<path d="M' + (130 + i * 10) + ' ' + (150 - (i % 3) * 14) + 'q10-12 20 0" stroke="#c46ab0" stroke-width="3" fill="none"/>';
    o += dot(160, 118, 11, "#d6402a") + dot(240, 126, 11, "#d6402a") + '<path d="M200 98l-8-14M200 98l8-14" stroke="#7a4a1a" stroke-width="3"/>';
    o += '<path d="M160 118m-6 0h12M240 126m-6 0h12" stroke="rgba(255,255,255,.4)" stroke-width="2"/>';
    return o + steam(180, 86);
  },
  potatosalad: function(r){
    var o = plate(200, 185, 135);
    o += '<path d="M118 160q0-66 82-66q82 0 82 66q0 26-82 26q-82 0-82-26z" fill="#efd788"/>';
    for (var i = 0; i < 18; i++){ var x = 140 + (i * 47) % 120, y = 118 + (i * 31) % 50; o += '<rect x="' + x + '" y="' + y + '" width="18" height="14" rx="4" fill="#f8e8a4" transform="rotate(' + (i * 25 % 60) + ' ' + x + ' ' + y + ')"/>'; }
    for (var j = 0; j < 14; j++) o += dot(130 + (j * 37) % 140, 110 + (j * 23) % 56, 2.6, "#3a8a3a");
    o += '<path d="M150 118h16M236 146h18" stroke="#c46a3a" stroke-width="5" stroke-linecap="round"/>';
    return o + sprig(200, 96, 1.3);
  },
  log: function(r){
    var o = '<ellipse cx="200" cy="196" rx="150" ry="18" fill="rgba(0,0,0,.28)"/><rect x="40" y="186" width="320" height="10" rx="5" fill="#fbf6ec"/>';
    o += '<path d="M62 142q0-48 50-48h176q50 0 50 48v20q0 22-50 22H112q-50 0-50-22z" fill="' + r.c.a + '"/>';
    for (var i = 0; i < 9; i++) o += '<path d="M' + (92 + i * 28) + ' 110q8 8 0 16M' + (100 + i * 28) + ' 150q-8 8 0 14" stroke="#3a2012" stroke-width="3" fill="none"/>';
    o += '<ellipse cx="338" cy="140" rx="20" ry="42" fill="#e8cf9a"/><path d="M338 112a14 14 0 1 1 0 28a8 8 0 1 1 0 -16a4 4 0 1 1 0 8" fill="none" stroke="#b8803a" stroke-width="3"/>';
    o += '<path d="M120 94q0-12 12-12M250 92q2-14 14-10" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M96 98q8-10 18 0M270 98q8-10 18 0" stroke="#fff" stroke-width="5" fill="none"/>';
    o += sprig(170, 92, 1.1) + sprig(240, 90, 1) + '<g><ellipse cx="205" cy="82" rx="9" ry="6" fill="#ded"/><circle cx="205" cy="76" r="3" fill="#a02a2a"/></g>';
    return o;
  },
  fondue: function(r){
    var choc = r.c.choc, o = '<ellipse cx="200" cy="205" rx="110" ry="14" fill="rgba(0,0,0,.28)"/>';
    o += '<path d="M130 195h140l-8-30h-124z" fill="#7a3a1a"/><rect x="190" y="178" width="20" height="14" rx="3" fill="#f6d6a0"/><path d="M200 164q-6-8 0-14q6 6 0 14" fill="#f2a020" class="xs-bulb"/>';
    o += '<path d="M112 108h176q-2 44-30 56h-116q-28-12-30-56z" fill="#c8202a"/><path d="M104 108h192" stroke="#8a1018" stroke-width="10" stroke-linecap="round"/>';
    o += '<ellipse cx="200" cy="108" rx="96" ry="14" fill="' + r.c.a + '"/><ellipse cx="200" cy="106" rx="80" ry="9" fill="rgba(255,255,255,.18)"/>';
    o += '<path d="M280 70l-70 40M318 80l-96 34" stroke="#8a5a2a" stroke-width="4" stroke-linecap="round"/>';
    if (choc){ o += '<circle cx="288" cy="68" r="14" fill="#d6304a"/><path d="M288 54q4-10 10-10" stroke="#3a8a3a" stroke-width="3" fill="none"/><rect x="316" y="72" width="20" height="14" rx="4" fill="#f6d46a" transform="rotate(-12 316 72)"/>'; }
    else { o += '<rect x="274" y="56" width="22" height="22" rx="4" fill="#e8c27a" transform="rotate(-24 274 56)"/><rect x="308" y="68" width="20" height="20" rx="4" fill="#e8c27a" transform="rotate(10 308 68)"/>'; }
    return o + steam(170, 76);
  },
  star: function(r){
    var o = plate(200, 178, 140);
    [[200, 138, 44], [138, 168, 30], [262, 166, 30], [200, 190, 24]].forEach(function(p, i){ o += '<g transform="rotate(' + (i * 14) + ' ' + p[0] + ' ' + p[1] + ')">' + star5(p[0], p[1], p[2], r.c.a) + star5(p[0], p[1], p[2] * .75, "#fff") .replace('fill="#fff"', 'fill="rgba(255,255,255,.75)"') + '</g>'; });
    return o + sprig(98, 150, 1.2);
  },
  gingerbread: function(r){
    var o = plate(200, 180, 140), c = r.c.a, ic = r.c.icing;
    function man(x, y, s){ return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><circle cx="0" cy="-34" r="16" fill="' + c + '"/><path d="M-12-22h24l30 6a8 8 0 0 1-3 16l-24-4l8 40l-8 4l-10-26l-10 26l-8-4l8-40l-24 4a8 8 0 0 1-3-16z" fill="' + c + '"/><path d="M-6-36q6 6 12 0" stroke="' + ic + '" stroke-width="2.4" fill="none"/>' + dot(-5, -40, 2, ic) + dot(5, -40, 2, ic) + dot(0, -10, 3, "#c8202a") + dot(0, 4, 3, "#c8202a") + '</g>'; }
    o += man(150, 150, 1.2) + man(250, 152, 1.2) + '<g transform="translate(200 160)"><rect x="-34" y="-30" width="68" height="46" rx="6" fill="' + c + '"/><path d="M-30-30l30-24l30 24z" fill="#a14a2a"/><rect x="-8" y="-6" width="16" height="22" rx="3" fill="#5a2a14"/><path d="M-30-30l30-24l30 24" stroke="' + ic + '" stroke-width="4" fill="none"/></g>';
    return o;
  },
  wreath: function(r){
    var o = plate(200, 180, 140);
    for (var k = 0; k < 3; k++){ var cx = 112 + k * 88, cy = 156 + (k % 2) * 10; o += '<circle cx="' + cx + '" cy="' + cy + '" r="36" fill="' + r.c.a + '"/><circle cx="' + cx + '" cy="' + cy + '" r="14" fill="#fbf6ec"/>'; for (var i = 0; i < 12; i++){ var a = i * Math.PI / 6; o += dot((cx + Math.cos(a) * 25).toFixed(1), (cy + Math.sin(a) * 25).toFixed(1), 5.4, "#e6b860"); } o += dot(cx, cy - 36, 4, "#c8202a"); }
    return o;
  },
  cutouts: function(r){
    var o = plate(200, 178, 142), a = r.c.a;
    o += '<g transform="translate(130 150)"><path d="M0-40l22 30h-14l20 26h-16l16 22h-56l16-22h-16l20-26h-14z" fill="#3a9a4a"/><rect x="-5" y="22" width="10" height="10" fill="#7a4a1a"/>' + dot(-3, -6, 3, "#c8202a") + dot(6, 10, 3, "#f2c43a") + '</g>';
    o += star5(220, 150, 40, a) + '<g transform="translate(300 160)"><path d="M0-30c20-30 52 0 0 38c-52-38-20-68 0-38z" fill="#d84a4a"/></g>';
    o += '<path d="M190 128l6 8l10 2l-8 6l2 10l-10-4l-8 6l2-10l-8-6l10-2z" fill="rgba(255,255,255,.7)"/>';
    return o + dot(168, 190, 6, "#fff") + dot(250, 196, 5, "#fff");
  },
  loaf: function(r){
    var o = plate(200, 188, 150);
    o += '<path d="M70 168q0-72 130-72q130 0 130 72q0 18-130 18q-130 0-130-18z" fill="' + r.c.a + '"/>';
    o += '<path d="M70 156q0-52 130-52q130 0 130 52q0 12-130 12q-130 0-130-12z" fill="#f8f2e6"/>';
    for (var i = 0; i < 26; i++) o += dot(100 + (i * 47) % 200, 118 + (i * 29) % 38, 3, "rgba(255,255,255,.9)");
    o += '<path d="M130 126q70-24 140 0" stroke="#e0d0b0" stroke-width="3" fill="none"/>' + sprig(200, 94, 1.3);
    o += dot(150, 140, 4, "#a02a4a") + dot(226, 134, 4, "#a02a4a") + dot(270, 148, 4, "#a02a4a");
    return o;
  },
  roast: function(r){
    var o = plate(200, 180, 148), m = r.c.meat;
    o += '<path d="M120 154q-10-48 38-62q44-12 80 6q42 18 28 56q-20 24-74 24q-58 0-72-24z" fill="' + m + '"/><path d="M144 112q40-26 86-6" stroke="rgba(255,255,255,.3)" stroke-width="9" stroke-linecap="round" fill="none"/>';
    o += '<path d="M246 150l40-6l6 10l-10 6l8 10l-10 6z" fill="#f4eede"/>';
    o += dot(110, 176, 18, r.c.side) + dot(132, 188, 14, r.c.side) + dot(300, 178, 16, "#e8b04a") + dot(282, 192, 14, "#e8b04a") + dot(318, 194, 13, "#e8b04a");
    o += sprig(180, 100, 1.2) + steam(160, 84);
    return o;
  },
  fish: function(r){
    var o = plate(200, 180, 148, 48);
    o += '<path d="M104 160q0-44 56-50l104 6q40 8 30 36q-6 20-70 26q-120 8-120-18z" fill="' + r.c.a + '"/>';
    o += '<path d="M130 142q70-26 140-4M126 158q80-22 150-4" stroke="#fbb090" stroke-width="5" fill="none"/>';
    o += '<path d="M150 124q60-18 112 0q-30 22-112 12z" fill="#e8c45a"/><path d="M170 128l18 4M210 126l16 6M248 128l-2 8" stroke="#3a8a3a" stroke-width="3.4" stroke-linecap="round"/>';
    o += '<circle cx="308" cy="172" r="22" fill="#f4dc3a"/><circle cx="308" cy="172" r="15" fill="#fff2a0"/><path d="M308 157v30M293 172h30" stroke="#f4dc3a" stroke-width="2.4"/>';
    return o + sprig(98, 150, 1);
  },
  dumplings: function(r){
    var o = plate(200, 182, 148);
    [[150, 150], [230, 146], [190, 178], [270, 178]].forEach(function(p){ o += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="34" fill="' + r.c.a + '"/><circle cx="' + (p[0] - 8) + '" cy="' + (p[1] - 10) + '" r="14" fill="rgba(255,255,255,.4)"/>'; });
    o += '<path d="M96 190q30-30 60-6" stroke="#7a3a1a" stroke-width="12" stroke-linecap="round" fill="none"/>' + sprig(200, 110, 1.2);
    return o + steam(200, 88);
  },
  sprouts: function(r){
    var o = plate(200, 184, 148);
    [[140, 150], [200, 140], [260, 152], [170, 176], [236, 178], [200, 165]].forEach(function(p, i){ o += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="26" fill="' + (i % 2 ? "#6aaa3a" : r.c.a) + '"/><path d="M' + (p[0] - 18) + ' ' + p[1] + 'q18-14 36 0M' + (p[0] - 12) + ' ' + (p[1] + 10) + 'q12-10 24 0M' + p[0] + ' ' + (p[1] - 24) + 'v18" stroke="rgba(255,255,255,.35)" stroke-width="3" fill="none"/>'; });
    o += dot(110, 168, 11, "#a26a3a") + dot(298, 170, 11, "#a26a3a") + dot(286, 190, 9, "#a26a3a");
    return o + steam(200, 108);
  },
  gratin: function(r){
    var o = '<ellipse cx="200" cy="204" rx="140" ry="14" fill="rgba(0,0,0,.28)"/>';
    o += '<path d="M60 128h280l-12 56q-4 14-20 14H92q-16 0-20-14z" fill="#e8e2d6"/><rect x="52" y="116" width="296" height="16" rx="8" fill="#f8f4ea"/>';
    o += '<path d="M70 118q130-34 260 0v12h-260z" fill="' + r.c.a + '"/>';
    for (var i = 0; i < 12; i++) o += '<path d="M' + (90 + i * 20) + ' 120q8 6 14 0" stroke="#b8802a" stroke-width="3" fill="none"/>';
    o += dot(140, 116, 5, "#8a5a1a") + dot(230, 112, 6, "#8a5a1a") + dot(290, 118, 5, "#8a5a1a") + sprig(200, 108, 1.1);
    return o + steam(160, 94) + steam(250, 92);
  },
  soup: function(r){
    var o = '<ellipse cx="200" cy="206" rx="130" ry="14" fill="rgba(0,0,0,.28)"/>';
    o += '<path d="M78 120h244q0 76-122 76q-122 0-122-76z" fill="#fbf6ec"/><ellipse cx="200" cy="120" rx="122" ry="20" fill="#fbf6ec"/><ellipse cx="200" cy="122" rx="108" ry="15" fill="' + r.c.a + '"/>';
    o += '<path d="M150 122q50-14 100 0" stroke="' + r.c.top + '" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M175 118q25 12 50 0" stroke="' + r.c.top + '" stroke-width="5" stroke-linecap="round" fill="none"/>';
    o += dot(160, 126, 4, "#5a7a2a") + dot(246, 126, 4, "#5a7a2a") + dot(204, 130, 3.4, "#7a3a1a");
    o += '<rect x="302" y="150" width="46" height="26" rx="4" fill="#d8a45a" transform="rotate(14 302 150)"/>';
    return o + steam(170, 84) + steam(228, 82);
  },
  salad: function(r){
    var o = plate(200, 184, 150);
    for (var i = 0; i < 16; i++){ var a = i * .6, x = 200 + Math.cos(a) * (30 + (i % 4) * 22), y = 150 + Math.sin(a) * (14 + (i % 4) * 8); o += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="20" ry="11" fill="' + (i % 2 ? r.c.a : "#6ab05a") + '" transform="rotate(' + (i * 31 % 180) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>'; }
    for (var j = 0; j < 12; j++) o += dot(150 + (j * 41) % 110, 138 + (j * 17) % 34, 4.4, r.c.b);
    o += '<path d="M180 150q10-12 20 0q-10 8-20 0zM230 160q10-12 20 0q-10 8-20 0z" fill="#a26a3a"/>';
    return o;
  },
  brulee: function(r){
    var o = plate(200, 186, 150);
    o += '<path d="M104 150q0-34 96-34q96 0 96 34q0 24-96 24q-96 0-96-24z" fill="#fff"/><ellipse cx="200" cy="146" rx="84" ry="24" fill="' + r.c.a + '"/><ellipse cx="200" cy="142" rx="70" ry="17" fill="#f2c460"/>';
    o += '<path d="M150 140q20-8 30 2M214 138q20-8 36 2" stroke="#b8700a" stroke-width="4" fill="none"/><path d="M180 134q10 6 22 0" stroke="rgba(255,255,255,.6)" stroke-width="4" fill="none"/>';
    o += '<circle cx="320" cy="170" r="12" fill="#c8202a"/><circle cx="342" cy="178" r="10" fill="#c8202a"/><path d="M314 156q8-6 14 0" stroke="#3a8a3a" stroke-width="3" fill="none"/>';
    return o + sprig(96, 160, 1);
  },
  strudel: function(r){
    var o = plate(200, 188, 152);
    o += '<g transform="rotate(-8 200 150)"><path d="M84 150q0-34 22-34h188q22 0 22 34q0 30-22 30h-188q-22 0-22-30z" fill="' + r.c.a + '"/>';
    for (var i = 0; i < 8; i++) o += '<path d="M' + (112 + i * 28) + ' 124l10 52" stroke="#a8702a" stroke-width="3"/>';
    o += '<path d="M104 128q96-14 192 0" stroke="rgba(255,255,255,.4)" stroke-width="6" fill="none"/></g>';
    for (var j = 0; j < 40; j++) o += dot(110 + (j * 53) % 190, 122 + (j * 31) % 40, 2, "rgba(255,255,255,.85)");
    o += '<ellipse cx="200" cy="118" rx="26" ry="14" fill="#fff"/><path d="M200 108l-4 8l4 -2l4 2z" fill="#c8202a"/>' + dot(330, 180, 9, "#d6402a");
    return o + steam(190, 92);
  },
  stuffedsquash: function(r){
    var o = plate(200, 190, 152), a = r.c.a;
    [[148, 150], [252, 156]].forEach(function(p){ o += '<path d="M' + (p[0] - 58) + ' ' + p[1] + 'q58 -70 116 0q-6 38 -58 38q-52 0 -58 -38z" fill="' + a + '"/><path d="M' + (p[0] - 46) + ' ' + p[1] + 'q46 -26 92 0q-46 26 -92 0z" fill="' + r.c.fill + '"/>'; for (var i = 0; i < 6; i++) o += dot(p[0] - 30 + i * 12, p[1] - 2 + (i % 2) * 5, 4, i % 3 ? "#e8e0c8" : "#c8202a"); });
    return o + sprig(200, 120, 1.2) + steam(148, 100);
  },
  sauce: function(r){
    var o = '<ellipse cx="200" cy="206" rx="110" ry="12" fill="rgba(0,0,0,.28)"/>';
    o += '<path d="M120 120h160q-4 66-80 66q-76 0-80-66z" fill="#fbf6ec"/><ellipse cx="200" cy="120" rx="80" ry="14" fill="#fbf6ec"/><ellipse cx="200" cy="122" rx="70" ry="10" fill="' + r.c.a + '"/>';
    for (var i = 0; i < 9; i++) o += dot(150 + i * 12, 120 + (i % 3) * 2, 5, "#e0304a");
    o += '<path d="M290 140l30-20M300 150l40 6" stroke="#7a4a1a" stroke-width="5" stroke-linecap="round"/><circle cx="330" cy="168" r="18" fill="#f2951c"/><circle cx="330" cy="168" r="12" fill="#ffd27a"/>';
    return o + sprig(120, 108, 1);
  },
  scallop: function(r){
    var o = plate(200, 186, 150);
    [[150, 152], [250, 156]].forEach(function(p){ o += '<g transform="translate(' + p[0] + ' ' + p[1] + ')"><path d="M-48 10q-4-56 48-56q52 0 48 56q-48 20-96 0z" fill="#f4e4c8"/>'; for (var i = -3; i <= 3; i++) o += '<path d="M' + i * 13 + ' 12L' + i * 9 + ' -40" stroke="#d8bc8c" stroke-width="3"/>'; o += '<ellipse cx="0" cy="-2" rx="32" ry="16" fill="' + r.c.a + '"/><ellipse cx="0" cy="-6" rx="24" ry="10" fill="#e8b04a"/>' + dot(-8, -8, 3, "#3a8a3a") + dot(10, -4, 3, "#3a8a3a") + '</g>'; });
    o += '<circle cx="200" cy="190" r="14" fill="#f4dc3a"/><circle cx="200" cy="190" r="9" fill="#fff2a0"/>';
    return o;
  }
};
XM.dish = function(r, uid){
  var g = r.bg || ["#2a5a3a", "#8ad08a"], fn = K[r.kind] || K.soup, id = "dg" + uid, o = "";
  o += '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (r.name ? r.name[XM.I] : "") + '" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:100%">';
  o += '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + g[0] + '"/><stop offset="1" stop-color="' + g[1] + '"/></linearGradient><radialGradient id="' + id + 'v" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="rgba(0,0,0,0)"/><stop offset="1" stop-color="rgba(0,0,0,.28)"/></radialGradient></defs>';
  o += '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + ')"/>';
  // Lichterkette + Schneeflocken
  o += '<path d="M0 14q50 18 100 0t100 0t100 0t100 0" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="2"/>';
  var cs = ["#ffd24a", "#ff5a5a", "#6ad0ff", "#8aff8a"];
  for (var i = 0; i < 9; i++){ var x = 25 + i * 44; o += '<circle class="xs-bulb" style="animation-delay:' + (i * .3) + 's" cx="' + x + '" cy="' + (i % 2 ? 24 : 15) + '" r="4.2" fill="' + cs[i % 4] + '"/>'; }
  for (var j = 0; j < 22; j++) o += '<circle cx="' + ((j * 97) % 400) + '" cy="' + (30 + (j * 61) % 190) + '" r="' + (1 + j % 3 * .7) + '" fill="rgba(255,255,255,.55)"/>';
  o += fn(r);
  o += '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'v)"/></svg>';
  return o;
};
})();
