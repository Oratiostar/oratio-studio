/* Oratio Sprachkurse – Nachsprechen: eigene Stimme aufnehmen und mit dem Vorbild vergleichen.
   Alles bleibt auf dem Gerät. Funktioniert für Deutsch- und Französischkurs (hängt sich an die 🔊-Knöpfe). */
(function(){
"use strict";
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) return;
var fr = !!(window.WZ && WZ.lang === "fr");
function L(d, f){ return fr ? f : d; }
var st = document.createElement("style");
st.textContent = ".micb{border:0;background:transparent;cursor:pointer;font-size:16px;padding:0 4px;border-radius:8px;vertical-align:middle}.micb.rec{background:#d93b3b;color:#fff;animation:micp 1s infinite}@keyframes micp{50%{opacity:.55}}" +
  ".micp{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;margin:4px 6px;padding:4px 8px;border-radius:12px;background:rgba(127,127,127,.14);font-size:13px;vertical-align:middle}.micp button{border:1px solid rgba(127,127,127,.4);background:transparent;color:inherit;border-radius:999px;padding:3px 9px;font:600 13px inherit;font-family:inherit;cursor:pointer}.micp canvas{width:110px;height:26px;border-radius:6px;background:rgba(0,0,0,.25)}.micp small{opacity:.75;flex-basis:100%}";
document.head.appendChild(st);
var rec = null, strm = null, curBtn = null, tm = 0, audio = null;
function stopTracks(){ if (strm) { strm.getTracks().forEach(function(t){ t.stop(); }); strm = null; } }
function draw(cv, blob){
  try {
    var AC = window.AudioContext || window.webkitAudioContext, ac = new AC();
    blob.arrayBuffer().then(function(ab){ return new Promise(function(ok, no){ ac.decodeAudioData(ab, ok, no); }); }).then(function(buf){
      var d = buf.getChannelData(0), W = cv.width = 220, H = cv.height = 52, c = cv.getContext("2d"), n = Math.floor(d.length / W) || 1, mx = 0.05, i, j, arr = [];
      for (i = 0; i < W; i++){ var m = 0; for (j = 0; j < n; j++){ var v = Math.abs(d[i * n + j] || 0); if (v > m) m = v; } arr.push(m); if (m > mx) mx = m; }
      c.clearRect(0, 0, W, H); c.fillStyle = "#6dffb0"; arr.forEach(function(m, k){ var h = Math.max(2, m / mx * (H - 6)); c.fillRect(k, (H - h) / 2, 1, h); });
      try { ac.close(); } catch(e){}
    }).catch(function(){ cv.style.display = "none"; });
  } catch (e) { cv.style.display = "none"; }
}
function panel(btn, blob){
  var old = btn._p; if (old) old.remove();
  var url = URL.createObjectURL(blob), p = document.createElement("span"); p.className = "micp";
  p.innerHTML = '<canvas></canvas><button type="button" data-a="me">▶ ' + L("Du", "Toi") + '</button><button type="button" data-a="model">🔊 ' + L("Vorbild", "Modèle") + '</button><small>' + L("Hör beides nacheinander an – klingt es ähnlich? Die Aufnahme bleibt auf deinem Gerät.", "Écoute les deux – ça se ressemble ? L’enregistrement reste sur ton appareil.") + '</small>';
  btn.insertAdjacentElement("afterend", p); btn._p = p; draw(p.querySelector("canvas"), blob);
  p.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("button"); if (!b) return;
    if (b.dataset.a === "me") { if (audio) audio.pause(); audio = new Audio(url); audio.play().catch(function(){}); }
    else { var s = btn.previousElementSibling; if (s && s.classList.contains("say")) s.click(); }
  });
}
function stop(){ clearTimeout(tm); if (rec && rec.state !== "inactive") rec.stop(); }
function toggle(btn){
  if (rec && rec.state === "recording") { stop(); return; }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function(s){
    strm = s; curBtn = btn; var ch = []; rec = new MediaRecorder(s);
    rec.ondataavailable = function(e){ if (e.data && e.data.size) ch.push(e.data); };
    rec.onstop = function(){ stopTracks(); btn.classList.remove("rec"); btn.textContent = "🎤"; if (ch.length) panel(btn, new Blob(ch, { type: rec.mimeType || "audio/webm" })); };
    rec.start(); btn.classList.add("rec"); btn.textContent = "⏹"; tm = setTimeout(stop, 8000);
  }).catch(function(){ btn.title = L("Mikrofon nicht erlaubt – erlaube es in den Browser-Einstellungen.", "Micro non autorisé – autorise-le dans les réglages du navigateur."); alert(btn.title); });
}
function scan(){
  document.querySelectorAll(".say:not([data-mic])").forEach(function(b){
    b.setAttribute("data-mic", "1");
    var m = document.createElement("button"); m.type = "button"; m.className = "micb"; m.textContent = "🎤"; m.setAttribute("aria-label", L("Nachsprechen und vergleichen", "Répéter et comparer")); m.title = m.getAttribute("aria-label");
    m.onclick = function(){ toggle(m); }; b.insertAdjacentElement("afterend", m);
  });
}
var raf = 0; new MutationObserver(function(){ cancelAnimationFrame(raf); raf = requestAnimationFrame(scan); }).observe(document.body, { childList: true, subtree: true });
scan();
})();
