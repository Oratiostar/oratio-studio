// Gemeinsam fuer alle Werkzeug-Seiten: Kopf, Fuss, Hell/Dunkel, kleine Helfer. Keine fremden Server, kein Tracking.
(function(){
  var t = null; try { t = localStorage.getItem("wz-theme"); } catch(e){}
  if (t === "dark" || t === "light") document.documentElement.setAttribute("data-theme", t);
})();
window.WZ = {
  kopf: function(aktiv){
    var h = document.createElement("header");
    h.innerHTML = '<div class="bar"><a class="logo" href="index.html"><img src="icon.png" alt=""><span>Oratio Studio</span></a>' +
      '<nav class="nav"><a href="werkzeuge.html"' + (aktiv==="hub"?' class="on"':'') + '>Werkzeuge</a>' +
      '<a href="icon-werkstatt.html"' + (aktiv==="icon"?' class="on"':'') + '>Icon-Werkstatt</a>' +
      '<a href="datei-werkstatt.html"' + (aktiv==="datei"?' class="on"':'') + '>Datei-Werkstatt</a></nav>' +
      '<span class="sp"></span><button class="btn sm" id="wzTheme" aria-label="Hell/Dunkel"></button></div>';
    document.body.insertBefore(h, document.body.firstChild);
    var b = h.querySelector("#wzTheme");
    function zeige(){ var a = document.documentElement.getAttribute("data-theme"); b.textContent = a==="dark" ? "☀ Hell" : a==="light" ? "☾ Dunkel" : "◐ Auto"; }
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
