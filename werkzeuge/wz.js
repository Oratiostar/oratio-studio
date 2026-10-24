// Gemeinsam fuer alle Werkzeug-Seiten: Kopf, Fuss, Hell/Dunkel, kleine Helfer. Keine fremden Server, kein Tracking.
(function(){
  var t = null; try { t = localStorage.getItem("wz-theme"); } catch(e){}
  if (t === "dark" || t === "light") document.documentElement.setAttribute("data-theme", t);
})();
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
  uebersetze: function(){
    if (WZ.lang !== "fr" || !window.WZ_FR) return;
    document.documentElement.lang = "fr";
    var skip = {SCRIPT:1, STYLE:1, TEXTAREA:1, CODE:1};
    function knoten(n){
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
    h.innerHTML = '<div class="bar"><a class="logo" href="index.html"><img src="logo-place.png" alt=""><span>Oratio Place</span></a>' +
      '<span class="sp"></span><button class="btn sm" id="wzLang" aria-label="Sprache / Langue"></button> <button class="btn sm" id="wzTheme" aria-label="Hell/Dunkel"></button></div>';
    document.body.insertBefore(h, document.body.firstChild);
    var nm = aktiv === "icon" ? "Icon-Werkstatt" : aktiv === "datei" ? "Datei-Werkstatt" : null, m = document.querySelector("main");
    if (nm && m) { var c = document.createElement("div"); c.className = "crumb"; c.innerHTML = '<a href="index.html">Oratio Place</a> › <a href="index.html#/studio">Oratio Studio</a> › ' + nm; m.insertBefore(c, m.firstChild); }
    var b = h.querySelector("#wzTheme"), bl = h.querySelector("#wzLang");
    bl.textContent = WZ.lang === "fr" ? "🇩🇪 DE" : "🇫🇷 FR";
    bl.onclick = function(){ try { localStorage.setItem("lang", WZ.lang === "fr" ? "de" : "fr"); } catch(e){} location.reload(); };
    function zeige(){ var a = document.documentElement.getAttribute("data-theme"); b.textContent = a==="dark" ? "🌙 Dunkel" : a==="light" ? "☀️ Hell" : "🖥️ Auto"; }
    b.onclick = function(){
      var a = document.documentElement.getAttribute("data-theme");
      var n = a==="dark" ? "light" : a==="light" ? null : "dark";
      if (n) document.documentElement.setAttribute("data-theme", n); else document.documentElement.removeAttribute("data-theme");
      try { n ? localStorage.setItem("wz-theme", n) : localStorage.removeItem("wz-theme"); } catch(e){}
      zeige();
    };
    zeige();
    var f = document.createElement("footer");
    f.innerHTML = 'Alles läuft in deinem Browser – deine Dateien werden nicht hochgeladen. · Hobbyprojekt, ohne Gewähr. · <a href="impressum.html">Impressum &amp; Datenschutz</a>';
    document.body.appendChild(f);
    WZ.uebersetze();
    WZ.selects();
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
