/* Oratio Glas: (1) der Glanz folgt dem Finger/der Maus, (2) Design-Schalter Glas · Schwarz · Weiß für das ganze System.
   Schalter einbauen: ein Element mit  data-design-switch  anlegen (z. B. <div class="seg" data-design-switch></div>) – es füllt sich selbst. */
(function(){
  var MODI = ["glas", "schwarz", "weiss"], EMO = { glas: "🫧", schwarz: "⬛", weiss: "⬜" };
  var NAME = { de: { glas: "Glas", schwarz: "Schwarz", weiss: "Weiß", t: "Design" }, fr: { glas: "Verre", schwarz: "Noir", weiss: "Blanc", t: "Style" } };
  var DS = "glas"; try { DS = localStorage.getItem("ds") || "glas"; } catch (e) {}
  if (MODI.indexOf(DS) < 0) DS = "glas";
  function lang(){ var l = null; try { l = localStorage.getItem("lang"); } catch (e) {} return l || ((navigator.language || "").indexOf("fr") === 0 ? "fr" : "de"); }
  function anwenden(){ [document.documentElement, document.body].forEach(function(el){ if (!el) return; MODI.forEach(function(m){ el.classList.remove("ds-" + m); }); el.classList.add("ds-" + DS); }); }
  function fuellen(){
    var N = NAME[lang() === "fr" ? "fr" : "de"];
    document.querySelectorAll("[data-design-switch]").forEach(function(box){
      box.classList.add("dsg"); box.setAttribute("role", "group"); box.setAttribute("aria-label", N.t);
      box.innerHTML = MODI.map(function(m){ return '<button type="button" data-d="' + m + '" class="' + (DS === m ? "on" : "") + '" aria-pressed="' + (DS === m) + '" title="' + N.t + ": " + N[m] + '" aria-label="' + N[m] + '" data-nt>' + EMO[m] + ' <span>' + N[m] + "</span></button>"; }).join("");
      box.querySelectorAll("button").forEach(function(b){ b.onclick = function(){ setze(b.dataset.d); }; });
    });
  }
  function setze(d){ if (MODI.indexOf(d) < 0) return; DS = d; try { localStorage.setItem("ds", d); } catch (e) {} anwenden();
    document.querySelectorAll("[data-design-switch] button").forEach(function(b){ var an = b.dataset.d === d; b.classList.toggle("on", an); b.setAttribute("aria-pressed", an); }); }
  window.OratioGlas = { setze: setze, fuellen: fuellen, get: function(){ return DS; } };
  document.documentElement.classList.add("ds-" + DS);
  function start(){ anwenden(); fuellen(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  document.addEventListener("pointermove", function(ev){
    var t = ev.target && ev.target.closest && ev.target.closest(".glass,.gbtn"); if (!t) return;
    var r = t.getBoundingClientRect(); t.style.setProperty("--mx", (ev.clientX - r.left) + "px"); t.style.setProperty("--my", (ev.clientY - r.top) + "px");
  }, { passive: true });
})();
