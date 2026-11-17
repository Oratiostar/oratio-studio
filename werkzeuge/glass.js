/* Oratio Glas: (1) der Glanz folgt dem Finger/der Maus, (2) Glas/Matt-Schalter für das ganze System (Tag/Nacht kommt vom Hell/Dunkel-Schalter).
   Schalter einbauen: ein Element mit  data-design-switch  anlegen (z. B. <div class="seg" data-design-switch></div>) – es füllt sich selbst. */
(function(){
  var MODI = ["glas", "matt"], EMO = { glas: "🫧", matt: "◼" };
  var NAME = { de: { glas: "Glas", matt: "Matt", t: "Oberfläche" }, fr: { glas: "Verre", matt: "Mat", t: "Surface" } };
  var DS = "glas"; try { DS = localStorage.getItem("ds") || "glas"; } catch (e) {}
  if (DS === "schwarz" || DS === "weiss") DS = "matt"; /* alte Werte */
  if (MODI.indexOf(DS) < 0) DS = "glas";
  function lang(){ var l = null; try { l = localStorage.getItem("lang"); } catch (e) {} return l || ((navigator.language || "").indexOf("fr") === 0 ? "fr" : "de"); }
  function anwenden(){ if (document.body && !document.body.classList.contains("noaur")) document.body.classList.add("aurora"); [document.documentElement, document.body].forEach(function(el){ if (!el) return; MODI.forEach(function(m){ el.classList.remove("ds-" + m); }); el.classList.add("ds-" + DS); }); }

  /* ---------- Farbe für das ganze System (Hintergrund aller Welten) ---------- */
  var PAL = [["std", null, "#27a3df"], ["blau", 215, "#2d7fd6"], ["indigo", 240, "#4b4fd6"], ["viol", 262, "#7a4fd6"], ["lila", 285, "#a447d6"], ["magenta", 305, "#d63fc0"], ["pink", 330, "#d6407f"], ["rot", 355, "#d0343e"], ["koralle", 12, "#e8573f"], ["orange", 28, "#e8731a"], ["gold", 45, "#d9a406"], ["limette", 85, "#7fb81c"], ["gruen", 120, "#2fa043"], ["mint", 150, "#1fb67a"], ["tuerkis", 175, "#12a8a0"], ["himmel", 195, "#1aa3d6"], ["grau", 215, "#5d6b7c", 0.14]];
  var PN = { de: { t: "Farbe", std: "Standard", blau: "Blau", indigo: "Indigo", lila: "Lila", magenta: "Magenta", koralle: "Koralle", limette: "Limette", mint: "Mint", himmel: "Himmelblau", grau: "Grau", viol: "Violett", pink: "Pink", rot: "Rot", orange: "Orange", gold: "Gold", gruen: "Grün", tuerkis: "Türkis" }, fr: { t: "Couleur", std: "Standard", blau: "Bleu", indigo: "Indigo", lila: "Lilas", magenta: "Magenta", koralle: "Corail", limette: "Citron vert", mint: "Menthe", himmel: "Bleu ciel", grau: "Gris", viol: "Violet", pink: "Rose", rot: "Rouge", orange: "Orange", gold: "Or", gruen: "Vert", tuerkis: "Turquoise" } };
  var OC = "std"; try { OC = localStorage.getItem("oc") || "std"; } catch (e) {}
  function palOf(k){ for (var i = 0; i < PAL.length; i++) if (PAL[i][0] === k) return PAL[i]; return PAL[0]; }
  var SF = 1;
  function hsl(h, s, l, a){ return "hsla(" + ((h % 360) + 360) % 360 + "," + Math.round(s * SF) + "%," + l + "%," + (a == null ? 1 : a) + ")"; }
  function farbCss(){
    var pl = palOf(OC), H = pl[1]; SF = pl[3] == null ? 1 : pl[3]; var st = document.getElementById("ocFarbe");
    if (H == null){ if (st) st.remove(); return; }
    if (!st){ st = document.createElement("style"); st.id = "ocFarbe"; document.head.appendChild(st); }
    var day = ":root body", nt = ':root[data-theme="dark"] body', au = ':root:not([data-theme="light"]) body';
    function aur(n){ return n ? "--au1:" + hsl(H, 100, 46, .85) + ";--au2:" + hsl(H + 25, 95, 40, .75) + ";--au3:" + hsl(H - 25, 100, 34, .7) + ";--au4:" + hsl(H + 50, 95, 48, .6) + ";--au-base:" + hsl(H, 60, 5) + ";"
      : "--au1:" + hsl(H, 100, 52, .95) + ";--au2:" + hsl(H + 25, 100, 60, .85) + ";--au3:" + hsl(H - 25, 100, 46, .85) + ";--au4:" + hsl(H + 50, 100, 62, .75) + ";--au-base:" + hsl(H, 85, 80) + ";"; }
    function stu(n){ return n ? "--sg1:" + hsl(H, 55, 28) + "!important;--sg2:" + hsl(H, 60, 17) + "!important;--sb1:" + hsl(H, 75, 36, .8) + ";--sb2:" + hsl(H, 75, 30, .7) + ";--sb3:" + hsl(H, 75, 26, .7) + ";--sb4:" + hsl(H, 75, 32, .7) + ";--sbb:" + hsl(H, 65, 9) + ";"
      : "--sg1:" + hsl(H, 75, 62) + "!important;--sg2:" + hsl(H, 70, 40) + "!important;--sb1:" + hsl(H, 90, 62, .95) + ";--sb2:" + hsl(H, 90, 54, .9) + ";--sb3:" + hsl(H, 90, 48, .9) + ";--sb4:" + hsl(H, 90, 58, .9) + ";--sbb:" + hsl(H, 80, 40) + ";"; }
    var acc = "--oc1:" + hsl(H, 85, 52) + ";--oc2:" + hsl(H + 40, 80, 48) + ";";
    var A = pl[2];
    st.textContent = "body.aurora,body.sl{" + acc + "}" + day + ".aurora{" + aur(false) + "}" + day + ".sl{" + stu(false) + "}"
      + "@media (prefers-color-scheme:dark){" + au + ".aurora{" + aur(true) + "}" + au + ".sl{" + stu(true) + "}}"
      + nt + ".aurora{" + aur(true) + "}" + nt + ".sl{" + stu(true) + "}"
      + "body.aurora.ds-matt:not(.sl){background:color-mix(in srgb," + A + " 10%,var(--bg))!important}"
      + ".seg button.on{background:linear-gradient(135deg,var(--oc1),var(--oc2))!important}";
  }
  function setzeFarbe(k){ OC = k; try { localStorage.setItem("oc", k); } catch (e) {} farbCss();
    document.querySelectorAll(".ocpop .ocsw").forEach(function(b){ b.classList.toggle("on", b.dataset.k === k); }); }
  function oeffneFarbe(btn){
    var old = document.querySelector(".ocpop"); if (old){ old.remove(); return; }
    var N = PN[lang() === "fr" ? "fr" : "de"], pop = document.createElement("div"); pop.className = "ocpop glass"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", N.t);
    pop.innerHTML = '<b>' + N.t + '</b><div class="ocg">' + PAL.map(function(p){ return '<button type="button" class="ocsw' + (OC === p[0] ? " on" : "") + '" data-k="' + p[0] + '" title="' + N[p[0]] + '" aria-label="' + N[p[0]] + '" style="--sw:' + (p[1] == null ? "conic-gradient(#ff4f9a,#ffc42a,#22d3a6,#4a7cff,#a24bff,#ff4f9a)" : hsl(p[1], 85 * (p[3] || 1), 55)) + '"></button>'; }).join("") + "</div>";
    document.body.appendChild(pop);
    var r = btn.getBoundingClientRect(); pop.style.top = (r.bottom + 8) + "px"; pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - pop.offsetWidth - 8)) + "px";
    pop.querySelectorAll(".ocsw").forEach(function(b){ b.onclick = function(){ setzeFarbe(b.dataset.k); }; });
    setTimeout(function(){ function zu(ev){ if (!pop.contains(ev.target) && ev.target !== btn){ pop.remove(); document.removeEventListener("pointerdown", zu, true); } } document.addEventListener("pointerdown", zu, true); }, 0);
  }
  function fuellen(){
    var N = NAME[lang() === "fr" ? "fr" : "de"];
    document.querySelectorAll("[data-design-switch]").forEach(function(box){
      box.classList.add("dsg"); box.setAttribute("role", "group"); box.setAttribute("aria-label", N.t);
      box.innerHTML = MODI.map(function(m){ return '<button type="button" data-d="' + m + '" class="' + (DS === m ? "on" : "") + '" aria-pressed="' + (DS === m) + '" title="' + N.t + ": " + N[m] + '" aria-label="' + N[m] + '" data-nt>' + EMO[m] + ' <span>' + N[m] + "</span></button>"; }).join("");
      box.insertAdjacentHTML("beforeend", '<button type="button" class="ocbtn" title="' + PN[lang() === "fr" ? "fr" : "de"].t + '" aria-label="' + PN[lang() === "fr" ? "fr" : "de"].t + '">🎨</button>');
      box.querySelectorAll("button[data-d]").forEach(function(b){ b.onclick = function(){ setze(b.dataset.d); }; });
      box.querySelector(".ocbtn").onclick = function(){ oeffneFarbe(this); };
    });
  }
  function setze(d){ if (MODI.indexOf(d) < 0) return; DS = d; try { localStorage.setItem("ds", d); } catch (e) {} anwenden();
    document.querySelectorAll("[data-design-switch] button[data-d]").forEach(function(b){ var an = b.dataset.d === d; b.classList.toggle("on", an); b.setAttribute("aria-pressed", an); }); }
  window.OratioGlas = { farbe: setzeFarbe, setze: setze, fuellen: fuellen, get: function(){ return DS; } };
  document.documentElement.classList.add("ds-" + DS); try { farbCss(); } catch (e) {}
  function start(){ anwenden(); fuellen(); farbCss(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  document.addEventListener("pointermove", function(ev){
    var t = ev.target && ev.target.closest && ev.target.closest(".glass,.gbtn"); if (!t) return;
    var r = t.getBoundingClientRect(); t.style.setProperty("--mx", (ev.clientX - r.left) + "px"); t.style.setProperty("--my", (ev.clientY - r.top) + "px");
  }, { passive: true });
})();
