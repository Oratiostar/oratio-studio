/* Oratio Glas: der Glanz folgt dem Finger / der Maus (setzt --mx/--my auf .glass und .gbtn) */
(function(){
  document.addEventListener("pointermove",function(ev){
    var t = ev.target && ev.target.closest && ev.target.closest(".glass,.gbtn");
    if (!t) return;
    var r = t.getBoundingClientRect();
    t.style.setProperty("--mx", (ev.clientX - r.left) + "px");
    t.style.setProperty("--my", (ev.clientY - r.top) + "px");
  }, {passive:true});
})();
