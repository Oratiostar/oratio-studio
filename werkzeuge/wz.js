// Gemeinsam fuer alle Werkzeug-Seiten: Kopf, Fuss, Hell/Dunkel, kleine Helfer. Keine fremden Server, kein Tracking.
(function(){
  var t = null; try { t = localStorage.getItem("wz-theme"); } catch(e){}
  if (t === "dark" || t === "light") document.documentElement.setAttribute("data-theme", t);
})();
(function(){
  /* Farben nur fuer die Icon-Werkstatt; die Datei-Werkstatt bleibt blau. [acc, rgb, rand, Schrift auf Farbe] */
  var P = {blau:["#27a3df","39,163,223","#1b86be","#fff"], gruen:["#55b52e","85,181,46","#3f9320","#fff"], gelb:["#f2b705","242,183,5","#c99700","#3a2c00"], rot:["#e0364a","224,54,74","#b82437","#fff"],
    schwarz:["light-dark(#30343f,#e6ecf6)","64,68,82","light-dark(#12141a,#ffffff)","light-dark(#fff,#12161f)"],
    lila:["#8a5ad8","138,90,216","#6d43b8","#fff"], orange:["#e0703a","224,112,58","#c05a28","#fff"], rosa:["#e0527a","224,82,122","#c13a60","#fff"], tuerkis:["#19b8a8","25,184,168","#10968a","#fff"]};
  var ICON = /icon-werkstatt/.test(location.pathname), XMAS = /weihnachten/.test(location.pathname);
  window.WZ_FARBEN = P;
  window.WZ_farbe = function(n, speichern){
    if (XMAS) n = "rot"; else if (!P[n] || !ICON) n = "blau"; var c = P[n], r = document.documentElement.style;
    r.setProperty("--acc", c[0]); r.setProperty("--accrgb", c[1]); r.setProperty("--go", c[0]); r.setProperty("--gob", c[2]); r.setProperty("--gofg", c[3]); r.setProperty("--onacc", c[3]);
    if (speichern) { try { localStorage.setItem("wz-farbe-icon", n); } catch(e){} }
    document.querySelectorAll(".farben button").forEach(function(b){ b.classList.toggle("on", b.dataset.f === n); });
    window.WZ_farbname = n;
  };
  var n = null; try { n = localStorage.getItem("wz-farbe-icon"); } catch(e){}
  window.WZ_farbe(n || "blau");
})();
window.WZ_FLAGGE = function(l){
  var s = l === "fr"
    ? '<rect width="10" height="20" fill="#0055a4"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ef4135"/>'
    : '<rect width="30" height="7" fill="#000"/><rect y="7" width="30" height="6" fill="#dd0000"/><rect y="13" width="30" height="7" fill="#ffce00"/>';
  return '<svg class="flag" viewBox="0 0 30 20" width="21" height="14" aria-hidden="true">' + s + '</svg>';
};
window.WZ = {
  lang: (function(){ var l = null; try { l = localStorage.getItem("lang"); } catch(e){} return l || ((navigator.language||"").indexOf("fr")===0 ? "fr" : "de"); })(),
  _re: null,
  t: function(s){
    if (WZ.lang !== "fr" || !window.WZ_FR || typeof s !== "string" || !/[A-Za-zÄÖÜäöü]/.test(s)) return s;
    if (!WZ._re) {
      var ks = Object.keys(WZ_FR).sort(function(a,b){ return b.length - a.length; });
      var esc = function(k){ var e = k.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&"); return (/^[A-Za-zÄÖÜäöüß]/.test(k) ? "(?<![A-Za-zÄÖÜäöüß])" : "") + e + (/[A-Za-zÄÖÜäöüß]$/.test(k) ? "(?![A-Za-zÄÖÜäöüß])" : ""); };
      WZ._re = new RegExp(ks.map(esc).join("|"), "g");
    }
    return s.replace(WZ._re, function(m){ return WZ_FR[m]; });
  },
  selects: function(){
    function bau(s){
      if (s._sel || s.hasAttribute("data-nsel")) return;
      var w = document.createElement("div"); w.className = "sel";
      var b = document.createElement("button"); b.type = "button"; b.className = "selbtn";
      var p = document.createElement("div"); p.className = "pop";
      w.appendChild(b); w.appendChild(p); s.parentNode.insertBefore(w, s); s.style.display = "none"; s._sel = w;
      function label(){ var o = s.options[s.selectedIndex]; var t = o ? o.textContent : ""; if (b.textContent !== t) b.textContent = t; }
      function zu(){ w.classList.remove("open"); }
      function fuelle(){
        p.innerHTML = "";
        Array.prototype.forEach.call(s.options, function(o, i){
          var x = document.createElement("button"); x.type = "button"; x.className = "opt" + (i === s.selectedIndex ? " cur" : ""); x.textContent = o.textContent; x.disabled = o.disabled;
          x.onclick = function(){ s.selectedIndex = i; s.dispatchEvent(new Event("input", {bubbles:true})); s.dispatchEvent(new Event("change", {bubbles:true})); label(); zu(); b.focus(); };
          p.appendChild(x);
        });
      }
      b.onclick = function(e){
        e.stopPropagation();
        var offen = w.classList.contains("open");
        document.querySelectorAll(".sel.open").forEach(function(o){ o.classList.remove("open"); });
        if (offen) return;
        fuelle(); w.classList.remove("up");
        w.classList.add("open");
        var r = w.getBoundingClientRect(), h = Math.min(300, p.scrollHeight + 14);
        if (r.bottom + h + 10 > innerHeight && r.top > h + 10) w.classList.add("up");
        var c = p.querySelector(".cur"); if (c) p.scrollTop = Math.max(0, c.offsetTop - 60);
      };
      b.onkeydown = function(e){
        if (e.key === "Escape") zu();
        else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); var n = s.selectedIndex + (e.key === "ArrowDown" ? 1 : -1); if (n >= 0 && n < s.options.length && !s.options[n].disabled) { s.selectedIndex = n; s.dispatchEvent(new Event("input", {bubbles:true})); s.dispatchEvent(new Event("change", {bubbles:true})); label(); } }
      };
      s.addEventListener("change", label);
      s._label = label; label();
    }
    function alle(){ document.querySelectorAll("select").forEach(bau); document.querySelectorAll("select").forEach(function(s){ if (s._label) s._label(); }); }
    document.addEventListener("click", function(e){ if (!e.target.closest(".sel")) document.querySelectorAll(".sel.open").forEach(function(o){ o.classList.remove("open"); }); });
    new MutationObserver(alle).observe(document.body, {childList:true, subtree:true});
    setInterval(function(){ document.querySelectorAll("select").forEach(function(s){ if (s._label) s._label(); }); }, 400);
    alle();
  },
  farbfelder: function(){
    var pop = null, cur = null, st = {h:0,s:1,v:1}, orig = "#ffffff";
    function hex2rgb(h){ h = h.replace("#",""); if (h.length === 3) h = h.replace(/./g, "$&$&"); var n = parseInt(h, 16); return [(n>>16)&255, (n>>8)&255, n&255]; }
    function rgb2hex(r,g,b){ return "#" + [r,g,b].map(function(x){ return ("0" + Math.round(x).toString(16)).slice(-2); }).join(""); }
    function hsv2rgb(h,s,v){ var f = function(n){ var k = (n + h/60) % 6; return v - v*s*Math.max(Math.min(k, 4-k, 1), 0); }; return [f(5)*255, f(3)*255, f(1)*255]; }
    function rgb2hsv(r,g,b){ r/=255; g/=255; b/=255; var mx = Math.max(r,g,b), mn = Math.min(r,g,b), d = mx-mn, h = 0; if (d) { if (mx===r) h = ((g-b)/d)%6; else if (mx===g) h = (b-r)/d+2; else h = (r-g)/d+4; h *= 60; if (h<0) h += 360; } return {h:h, s: mx ? d/mx : 0, v: mx}; }
    var PRE = ["#ffffff","#d9d9d9","#8c93a8","#2a2f3a","#000000","#ff4d5e","#e0364a","#ff8c1a","#e0703a","#ffd23f","#f2b705","#b8f04a","#55b52e","#3ddc84","#19c9b8","#7fd6ff","#27a3df","#2e86ff","#1b4fd0","#9b5de5","#8a5ad8","#ff7ac8","#e0527a","#a8683c"];
    function bauePop(){
      pop = document.createElement("div"); pop.className = "cpop"; pop.hidden = true;
      pop.innerHTML = '<div class="ch"><b>Farbe wählen</b><button type="button" class="cx" aria-label="Schließen">✕</button></div>' +
        '<canvas class="csv" width="240" height="160"></canvas>' +
        '<input class="chue" type="range" min="0" max="360" value="0">' +
        '<div class="crow"><span class="cprev"></span><input class="chex in" maxlength="7" spellcheck="false" data-nt></div>' +
        '<div class="cpre">' + PRE.map(function(c){ return '<button type="button" data-c="' + c + '" style="background:' + c + '" aria-label="' + c + '" data-nt></button>'; }).join("") + '</div>' +
        '<div class="cbt"><button type="button" class="btn sm ca">Abbrechen</button><button type="button" class="btn sm on cok">Übernehmen</button></div>';
      document.body.appendChild(pop);
      var cv = pop.querySelector(".csv"), cx = cv.getContext("2d");
      function zeichne(){
        var g = cx.createLinearGradient(0,0,cv.width,0); g.addColorStop(0,"#fff"); var hc = hsv2rgb(st.h,1,1); g.addColorStop(1, rgb2hex(hc[0],hc[1],hc[2]));
        cx.fillStyle = g; cx.fillRect(0,0,cv.width,cv.height);
        var g2 = cx.createLinearGradient(0,0,0,cv.height); g2.addColorStop(0,"rgba(0,0,0,0)"); g2.addColorStop(1,"#000"); cx.fillStyle = g2; cx.fillRect(0,0,cv.width,cv.height);
        var x = st.s*cv.width, y = (1-st.v)*cv.height; cx.beginPath(); cx.arc(x,y,8,0,7); cx.lineWidth = 3; cx.strokeStyle = "#fff"; cx.stroke(); cx.beginPath(); cx.arc(x,y,9.5,0,7); cx.lineWidth = 1.5; cx.strokeStyle = "#000"; cx.stroke();
      }
      function anwenden(live){
        var c = hsv2rgb(st.h,st.s,st.v), h = rgb2hex(c[0],c[1],c[2]);
        pop.querySelector(".cprev").style.background = h; pop.querySelector(".chex").value = h; zeichne();
        if (cur) { cur.value = h; cur._swatch.style.background = h; if (live) cur.dispatchEvent(new Event("input", {bubbles:true})); }
      }
      pop._an = anwenden;
      function sv(e){ var r = cv.getBoundingClientRect(); st.s = Math.min(1, Math.max(0, (e.clientX-r.left)/r.width)); st.v = 1 - Math.min(1, Math.max(0, (e.clientY-r.top)/r.height)); anwenden(true); }
      var down = false; cv.addEventListener("pointerdown", function(e){ down = true; cv.setPointerCapture(e.pointerId); sv(e); });
      cv.addEventListener("pointermove", function(e){ if (down) sv(e); }); cv.addEventListener("pointerup", function(){ down = false; });
      pop.querySelector(".chue").oninput = function(){ st.h = +this.value; anwenden(true); };
      pop.querySelector(".chex").oninput = function(){ if (/^#[0-9a-f]{6}$/i.test(this.value)) { var c = hex2rgb(this.value); st = rgb2hsv(c[0],c[1],c[2]); pop.querySelector(".chue").value = st.h; anwenden(true); } };
      pop.querySelectorAll(".cpre button").forEach(function(b){ b.onclick = function(){ var c = hex2rgb(b.dataset.c); st = rgb2hsv(c[0],c[1],c[2]); pop.querySelector(".chue").value = st.h; anwenden(true); }; });
      var kopf = pop.querySelector(".ch"), dr = null;
      kopf.addEventListener("pointerdown", function(e){ if (e.target.closest(".cx")) return; var r = pop.getBoundingClientRect(); dr = {x:e.clientX-r.left, y:e.clientY-r.top}; kopf.setPointerCapture(e.pointerId); e.preventDefault(); });
      kopf.addEventListener("pointermove", function(e){ if (!dr) return; pop.style.left = Math.max(4, Math.min(innerWidth - pop.offsetWidth - 4, e.clientX-dr.x)) + "px"; pop.style.top = Math.max(4, Math.min(innerHeight - 40, e.clientY-dr.y)) + "px"; });
      kopf.addEventListener("pointerup", function(){ dr = null; }); kopf.addEventListener("pointercancel", function(){ dr = null; });
      function zu(){ pop.hidden = true; cur = null; }
      pop.querySelector(".cx").onclick = pop.querySelector(".ca").onclick = function(){ if (cur) { cur.value = orig; cur._swatch.style.background = orig; cur.dispatchEvent(new Event("input", {bubbles:true})); cur.dispatchEvent(new Event("change", {bubbles:true})); } zu(); };
      pop.querySelector(".cok").onclick = function(){ if (cur) cur.dispatchEvent(new Event("change", {bubbles:true})); zu(); };
      document.addEventListener("keydown", function(e){ if (e.key === "Escape" && !pop.hidden) pop.querySelector(".ca").onclick(); });
      document.addEventListener("pointerdown", function(e){ if (!pop.hidden && !pop.contains(e.target) && !(e.target.closest && e.target.closest(".cbtn"))) pop.querySelector(".cok").onclick(); });
    }
    function bau(inp){
      if (inp._swatch) return;
      var b = document.createElement("button"); b.type = "button"; b.className = "cbtn"; b.title = "Farbe wählen";
      inp.parentNode.insertBefore(b, inp); inp.style.display = "none"; inp._swatch = b; b.style.background = inp.value;
      b.onclick = function(e){
        e.stopPropagation(); if (!pop) bauePop();
        if (!pop.hidden && cur === inp) { pop.querySelector(".cok").onclick(); return; }
        cur = inp; orig = inp.value; var c = hex2rgb(inp.value || "#ffffff"); st = rgb2hsv(c[0],c[1],c[2]);
        pop.querySelector(".chue").value = st.h; pop._an(false); pop.hidden = false;
        var r = b.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
        var x = Math.max(8, Math.min(innerWidth - w - 8, r.left)), y = r.bottom + 8; if (y + h > innerHeight - 8) y = Math.max(8, r.top - h - 8);
        pop.style.left = x + "px"; pop.style.top = y + "px";
      };
      new MutationObserver(function(){ b.style.background = inp.value; }).observe(inp, {attributes:true, attributeFilter:["value"]});
      setInterval(function(){ if (b.style.background !== inp.value && !(cur === inp)) b.style.background = inp.value; }, 500);
    }
    function alle(){ document.querySelectorAll("input[type=color]").forEach(bau); }
    new MutationObserver(alle).observe(document.body, {childList:true, subtree:true}); alle();
  },
  uebersetze: function(){
    if (WZ.lang !== "fr" || !window.WZ_FR) return;
    document.documentElement.lang = "fr";
    var skip = {SCRIPT:1, STYLE:1, TEXTAREA:1, CODE:1};
    function knoten(n){
      var el0 = n.nodeType === 1 ? n : n.parentNode; if (el0 && el0.closest && el0.closest("[data-nt]")) return;
      if (n.nodeType === 3) {
        var p = n.parentNode; if (p && (skip[p.nodeName] || (p.classList && p.classList.contains("fn")))) return;
        var v = n.nodeValue, w = WZ.t(v); if (w !== v) n.nodeValue = w;
      } else if (n.nodeType === 1) {
        if (skip[n.nodeName] || n.hasAttribute("data-nt")) return;
        ["placeholder","title","aria-label","alt"].forEach(function(a){ if (n.hasAttribute(a)) { var v = n.getAttribute(a), w = WZ.t(v); if (w !== v) n.setAttribute(a, w); } });
        for (var c = n.firstChild; c; c = c.nextSibling) knoten(c);
      }
    }
    var busy = false;
    var mo = new MutationObserver(function(list){
      if (busy) return; busy = true;
      list.forEach(function(m){
        if (m.type === "childList") m.addedNodes.forEach(knoten);
        else if (m.type === "characterData") knoten(m.target);
        else if (m.type === "attributes") { var v = m.target.getAttribute(m.attributeName), w = WZ.t(v); if (w !== v) m.target.setAttribute(m.attributeName, w); }
      });
      mo.takeRecords(); busy = false;
    });
    document.title = WZ.t(document.title);
    knoten(document.body);
    mo.observe(document.body, {childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:["placeholder","title","aria-label","alt"]});
  },
  kopf: function(aktiv){
    var h = document.createElement("header");
    h.innerHTML = '<div class="bar"><a class="logo" href="index.html"><span class="lg"><svg class="lgO" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="14.5" fill="none" stroke="#ffc21a" stroke-width="6.5" stroke-dasharray="21 91.1" transform="rotate(11 20 20)"/><circle cx="20" cy="20" r="14.5" fill="none" stroke="#ff5fa8" stroke-width="6.5" stroke-dasharray="21 91.1" transform="rotate(96 20 20)"/><circle cx="20" cy="20" r="14.5" fill="none" stroke="#2e86ff" stroke-width="6.5" stroke-dasharray="21 91.1" transform="rotate(181 20 20)"/><circle cx="20" cy="20" r="14.5" fill="none" stroke="#ff4b3a" stroke-width="6.5" stroke-dasharray="21 91.1" transform="rotate(266 20 20)"/></svg><b>ratio</b><i>Place</i></span></a>' +
      '<span class="sp"></span><div class="seg" id="wzLang" role="group" aria-label="Sprache / Langue"></div> <div class="seg" id="wzTheme" role="group" aria-label="Hell / Dunkel"></div></div>';
    document.body.insertBefore(h, document.body.firstChild);
    if (aktiv === "xmas" || aktiv === "deutsch") {
      var sc = aktiv === "xmas" ? "xm" : "de", fr = WZ.lang === "fr", wb = document.createElement("div"), inp;
      wb.className = "wbar";
      wb.innerHTML = '<span class="sp"></span><input type="search" class="wzs" autocomplete="off" enterkeyhint="search" data-nt>';
      inp = wb.querySelector("input");
      inp.placeholder = sc === "xm" ? (fr ? "Rechercher dans le monde de Noël …" : "In der Weihnachtswelt suchen …") : (fr ? "Rechercher dans le cours …" : "Im Deutschkurs suchen …");
      inp.addEventListener("keydown", function(e){ if (e.key === "Enter" && inp.value.trim()) location.href = "index.html#/qs/" + sc + "/" + encodeURIComponent(inp.value.trim()); });
      h.parentNode.insertBefore(wb, h.nextSibling);
    }
    var nm = aktiv === "icon" ? "Icon-Werkstatt" : aktiv === "datei" ? "Datei-Werkstatt" : aktiv === "alltag" ? (WZ.lang === "fr" ? "Assistants du quotidien" : "Alltags-Helfer") : aktiv === "elektro" ? (WZ.lang === "fr" ? "Labo d’électronique" : "Elektronik-Labor") : aktiv === "desk" ? "Oratio Desk" : null, m = document.querySelector("main");
    if (nm && m) { var c = document.createElement("div"); c.className = "crumb"; c.innerHTML = aktiv === "elektro" ? '<a href="index.html">Oratio Place</a> › <a href="index.html#/studio">Oratio Tech Studio</a> › ' + nm : '<a href="index.html">Oratio Place</a> › <a href="index.html#/werkzeuge">' + (WZ.lang === "fr" ? "Outils" : "Werkzeuge") + '</a> › ' + nm; m.insertBefore(c, m.firstChild); }
    if ((aktiv === "elektro" || aktiv === "pccheck") && m) { document.body.classList.add("sl"); var fr2 = WZ.lang === "fr", ti = aktiv === "elektro" ? (fr2 ? "Labo d’électronique" : "Elektronik-Labor") : "PC-Check", fa = aktiv === "elektro" ? "#12b8a6" : "#3b6fd6", em = aktiv === "elektro" ? "🔌" : "🖥️";
      var cr = m.querySelector(".crumb"); if (!cr) { cr = document.createElement("div"); cr.className = "crumb"; cr.innerHTML = '<a href="index.html">Oratio Place</a> › <a href="index.html#/studio">Oratio Tech Studio</a> › ' + ti; m.insertBefore(cr, m.firstChild); }
      var rb = document.createElement("div"); rb.className = "wzrib"; rb.innerHTML = '<a class="ribbon s" href="index.html#/studio">Oratio Tech Studio</a>'; m.insertBefore(rb, m.firstChild);
      var ph = document.createElement("div"); ph.className = "ph"; ph.style.setProperty("--wc", fa); ph.innerHTML = '<div class="phbad"><span class="emo">' + em + '</span></div><h1>' + ti + '</h1>'; cr.insertAdjacentElement("afterend", ph);
      var h1 = m.querySelector(":scope > h1"); if (h1) h1.remove(); }
    if (aktiv === "icon") {
      var p = document.querySelector(".panel"), fb = document.createElement("div"); fb.className = "farbbox";
      fb.innerHTML = '<span>Farbe</span><span class="farben">' + Object.keys(WZ_FARBEN).map(function(k){ return '<button type="button" data-f="' + k + '" style="background:' + (k === "schwarz" ? "#30343f" : WZ_FARBEN[k][0]) + '" title="' + k.charAt(0).toUpperCase() + k.slice(1) + '" aria-label="' + k + '" data-nt></button>'; }).join("") + '</span>';
      if (p) p.insertAdjacentElement("afterend", fb); else document.querySelector("main").appendChild(fb);
      fb.querySelectorAll(".farben button").forEach(function(x){ x.onclick = function(){ WZ_farbe(x.dataset.f, true); }; });
      WZ_farbe(WZ_farbname);
    }

    if (aktiv === "deutsch" || aktiv === "sprachkurse") {
      var st = document.createElement("style"); st.textContent = "@font-face{font-family:\"Poppins\";font-weight:700;font-display:swap;src:url(fonts/Poppins-Bold.woff) format(\"woff\")}\nbody.lstil{background-color:#a5e12e!important;background-image:linear-gradient(115deg,rgba(255,255,255,.16) 0 18%,transparent 18% 100%),url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='520' height='520'%3E%3Cg fill='%23ffffff'%3E%3Cpath opacity='.13' d='M40 30 L260 70 L150 270Z'/%3E%3Cpath opacity='.10' d='M300 20 L500 120 L330 240Z'/%3E%3Cpath opacity='.09' d='M20 330 L190 300 L120 500Z'/%3E%3Cpath opacity='.14' d='M260 330 L480 380 L330 510Z'/%3E%3C/g%3E%3Cg fill='%23000000'%3E%3Cpath opacity='.05' d='M220 140 L330 300 L130 340Z'/%3E%3Cpath opacity='.05' d='M400 260 L510 440 L360 430Z'/%3E%3C/g%3E%3C/svg%3E\")!important;background-attachment:fixed!important}\nbody.lstil header{background:color-mix(in srgb,#fbfff3 94%,transparent)!important;box-shadow:0 2px 12px rgba(0,40,0,.18)}\n/* helles Fenster hinter dem Inhalt \u2013 ohne die Gr\u00f6\u00dfe des Inhalts zu \u00e4ndern */\nbody.lstil main{position:relative;isolation:isolate;--fg:#14214f;--card:#fff;--line:#d3e8b8;--soft:#eef8dc;--muted:#4a5a7a;color:#14214f}\nbody.lstil main::before{content:\"\";position:absolute;z-index:-1;inset:6px 4px 14px;background:#fbfff3;border-radius:28px;box-shadow:0 10px 40px -12px rgba(0,50,0,.45)}\nbody.lstil main>h1{display:inline-block;max-width:100%;margin:10px 0 14px -14px;padding:14px 56px 14px 34px;color:#fff;background:linear-gradient(90deg,#1d62e0,#2aa1e0);clip-path:polygon(0 0,100% 0,calc(100% - 26px) 100%,0 100%);font:700 clamp(19px,2.6vw,29px)/1.2 Poppins,Inter,system-ui,sans-serif;text-transform:uppercase;text-shadow:0 2px 3px rgba(0,30,90,.45)}\nbody.lstil .crumb{color:#4a5a7a;padding-left:6px}\n/* \u00dcberschriften wie im PDF: farbiges K\u00e4stchen, farbiger Titel, Linie */\nbody.lstil .les{--lc:#1f9a4d}\nbody.lstil .les h3{display:flex;gap:12px;align-items:center;font:700 clamp(18px,2vw,22px)/1.25 Poppins,Inter,system-ui,sans-serif;color:color-mix(in srgb,var(--lc) 85%,#000);border-bottom:2px solid var(--lc);padding-bottom:7px;margin:26px 0 10px}\nbody.lstil .les h3::before{content:\"\";flex:none;width:22px;height:22px;border-radius:7px;background:var(--lc);box-shadow:inset 0 0 0 3px rgba(255,255,255,.4),0 0 0 2px color-mix(in srgb,var(--lc) 70%,#fff)}\nbody.lstil .les h4,body.lstil .xgp h4{font-family:Poppins,Inter,system-ui,sans-serif;color:color-mix(in srgb,var(--lc,#1f9a4d) 85%,#000)}\n/* Tabellen wie im PDF */\nbody.lstil .tw{border:2px solid var(--lc,#1f9a4d);border-radius:6px;background:#fff}\nbody.lstil .dt th{background:var(--lc,#1f9a4d);color:#fff;text-transform:uppercase;font-size:12px;letter-spacing:.05em}\nbody.lstil .dt td{border-top:1px solid color-mix(in srgb,var(--lc,#1f9a4d) 22%,transparent)}\nbody.lstil .dt tr:nth-child(even) td{background:color-mix(in srgb,var(--lc,#1f9a4d) 9%,#fff)}\nbody.lstil .les code{background:#e3f2cf;color:#1d4a8a;border-radius:6px}\n/* Karten und K\u00f6pfe */\nbody.lstil .lvcard{background:#fff;border:2px solid color-mix(in srgb,var(--lc) 55%,#fff)}\nbody.lstil .lvhead{background:linear-gradient(120deg,var(--lc),color-mix(in srgb,var(--lc) 60%,#fff));border:0;color:#fff}\nbody.lstil .lvhead h1,body.lstil .lvhead p{color:#fff;font-family:Poppins,Inter,system-ui,sans-serif}\nbody.lstil .lvcard h2{font-family:Poppins,Inter,system-ui,sans-serif}\nbody.lstil .les.card{background:#fff;border-color:#d3e8b8}\nbody.lstil .exl li{background:#eef8dc;border-left-color:var(--lc,#1f9a4d)}\nbody.lstil .btn.go{background:#1d62e0;border-color:#1550b8;color:#fff}\nbody.lstil .dhero{background:linear-gradient(120deg,#1d62e0,#2aa1e0)}\n@media (prefers-color-scheme:dark){:root:not([data-theme=\"light\"]) body.lstil{background-color:#2b4f14!important}:root:not([data-theme=\"light\"]) body.lstil main{--fg:#e9f0df;--card:#1d261d;--line:#3d5a35;--soft:#243322;--muted:#b9c9a8;color:#e9f0df}:root:not([data-theme=\"light\"]) body.lstil main::before{background:#141b14}:root:not([data-theme=\"light\"]) body.lstil header{background:#141b14!important}:root:not([data-theme=\"light\"]) body.lstil .dt tr:nth-child(even) td{background:rgba(255,255,255,.06)}:root:not([data-theme=\"light\"]) body.lstil .lvcard,:root:not([data-theme=\"light\"]) body.lstil .tw,:root:not([data-theme=\"light\"]) body.lstil .les.card{background:#1d261d}}\n:root[data-theme=\"dark\"] body.lstil{background-color:#2b4f14!important}\n:root[data-theme=\"dark\"] body.lstil main{--fg:#e9f0df;--card:#1d261d;--line:#3d5a35;--soft:#243322;--muted:#b9c9a8;color:#e9f0df}\n:root[data-theme=\"dark\"] body.lstil main::before{background:#141b14}\n:root[data-theme=\"dark\"] body.lstil header{background:#141b14!important}\n:root[data-theme=\"dark\"] body.lstil .dt tr:nth-child(even) td{background:rgba(255,255,255,.06)}\n:root[data-theme=\"dark\"] body.lstil .lvcard,:root[data-theme=\"dark\"] body.lstil .tw,:root[data-theme=\"dark\"] body.lstil .les.card{background:#1d261d}\n:root[data-theme=\"light\"] body.lstil .les{color:#14214f}\n#lStil{margin-left:4px}#lStil button{padding:5px 8px!important;font-size:0}\n#lStil .ksw{display:block;width:16px;height:16px;border-radius:5px;border:2px solid rgba(0,0,0,.35)}\n#lStil .a{background:#fff}#lStil .b{background:#a5e12e}\n@media (max-width:700px){#lStil button{padding:3px 6px!important}#lStil .ksw{width:13px;height:13px;border-radius:4px;border-width:1.5px}}"; document.head.appendChild(st);
      var lt = "aus"; try { lt = localStorage.getItem("kurs-lstil") || "aus"; } catch(e){}
      var sw = document.createElement("div"); sw.className = "seg"; sw.id = "lStil"; sw.setAttribute("role", "group");
      var fr0 = WZ.lang === "fr";
      sw.innerHTML = '<button type="button" data-v="aus" aria-label="Normal" title="' + (fr0 ? "Style normal" : "Normaler Stil") + '"><i class="ksw a"></i></button><button type="button" data-v="an" aria-label="Kursland" title="' + (fr0 ? "Vert : tout en vert comme dans le Kursland" : "Grün: alles grün wie im Kursland") + '"><i class="ksw b"></i></button>';
      function setL(v){ document.body.classList.toggle("lstil", v === "an"); try { localStorage.setItem("kurs-lstil", v); } catch(e){} sw.querySelectorAll("button").forEach(function(b){ b.classList.toggle("on", b.dataset.v === v); b.setAttribute("aria-pressed", b.dataset.v === v); }); }
      sw.querySelectorAll("button").forEach(function(b){ b.onclick = function(){ setL(b.dataset.v); }; });
      h.querySelector(".bar").appendChild(sw); setL(lt);
      /* lvhead-lc */ function lc(){ var a = document.querySelector(".lvhead"), l = document.querySelector(".les"); if (a && l) { var v = a.style.getPropertyValue("--lc"); if (v) l.style.setProperty("--lc", v); } } new MutationObserver(lc).observe(document.body, {childList:true, subtree:true}); lc();
    }
    var b = h.querySelector("#wzTheme"), bl = h.querySelector("#wzLang");
    function zeigeL(){ bl.innerHTML = ["de","fr"].map(function(l){ return '<button type="button" data-l="' + l + '" class="' + (WZ.lang === l ? "on" : "") + '" aria-pressed="' + (WZ.lang === l) + '">' + WZ_FLAGGE(l) + ' ' + l.toUpperCase() + '</button>'; }).join(""); bl.querySelectorAll("button").forEach(function(x){ x.onclick = function(){ if (WZ.lang === x.dataset.l) return; try { localStorage.setItem("lang", x.dataset.l); } catch(e){} location.reload(); }; }); }
    function zeige(){ var a = document.documentElement.getAttribute("data-theme") || "auto"; b.innerHTML = [["auto", "🖥️", "Auto"], ["light", "☀️", "Hell"], ["dark", "🌙", "Dunkel"]].map(function(x){ return '<button type="button" data-t="' + x[0] + '" class="' + (a === x[0] ? "on" : "") + '" aria-pressed="' + (a === x[0]) + '" title="' + x[2] + '" aria-label="' + x[2] + '" data-nt>' + x[1] + '</button>'; }).join(""); b.querySelectorAll("button").forEach(function(x){ x.onclick = function(){ var n = x.dataset.t; if (n === "auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", n); try { if (n === "auto") { localStorage.removeItem("wz-theme"); localStorage.setItem("theme", "auto"); } else { localStorage.setItem("wz-theme", n); localStorage.setItem("theme", n); } } catch(e){} zeige(); }; }); }
    zeigeL(); zeige();
    var f = document.createElement("footer");
    f.innerHTML = 'Alles läuft in deinem Browser – deine Dateien werden nicht hochgeladen. · Hobbyprojekt, ohne Gewähr. · <a href="impressum.html">Impressum &amp; Datenschutz</a>';
    document.body.appendChild(f);
    WZ.uebersetze();
    WZ.selects();
    WZ.farbfelder();
  },
  groesse: function(n){ return n < 1024 ? n + " B" : n < 1048576 ? (n/1024).toFixed(0) + " KB" : (n/1048576).toFixed(2) + " MB"; },
  speichern: function(blob, name){
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  },
  sauber: function(name){ return (name || "datei").replace(/\.[^.]+$/, "").replace(/[^\w\-äöüÄÖÜß ]+/g, "_").trim() || "datei"; },
  warte: function(){ return new Promise(function(r){ setTimeout(r, 0); }); },
  skript: function(src){ return new Promise(function(ok, err){ var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = function(){ err(new Error("Konnte " + src + " nicht laden")); }; document.head.appendChild(s); }); }
};
