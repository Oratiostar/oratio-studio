// Französischkurs A2 – Lektionen 1–11.
(function(){
var D = FZ, p = D.p, h = D.h, tip = D.tip, warn = D.warn, ul = D.ul, tb = D.tb, ex = D.ex, voc = D.voc, dlg = D.dlg, mc = D.mc, gap = D.gap, ord = D.ord, mat = D.mat, xg = D.xg;

D.add({ id: "a2-pc-avoir", lv: "A2", t: ["Passé composé mit avoir", "Le passé composé avec avoir"], s: ["Die wichtigste Vergangenheit: avoir + Partizip, unregelmäßige Partizipien, Verneinung.", "Formation et emploi du passé composé."], k: "passe compose vergangenheit avoir partizip participe passe j'ai mange fini fait pris",
  b: [
    p("Das **passé composé** ist die Vergangenheit der Alltagssprache für abgeschlossene Handlungen. Es besteht aus dem Präsens von **avoir** (oder être) plus dem **Partizip Perfekt** (participe passé)."),
    h("Das Partizip bilden"),
    tb(["Infinitiv", "Endung", "Partizip", "Beispiel"], [
      ["-er (parler)", "-é", "parlé", "j'ai parlé"],
      ["-ir (finir)", "-i", "fini", "tu as fini"],
      ["-re (vendre)", "-u", "vendu", "il a vendu"]
    ]),
    ex([
      ["Hier, j'ai travaillé jusqu'à six heures.", "Gestern habe ich bis sechs Uhr gearbeitet."],
      ["Nous avons mangé au restaurant.", "Wir haben im Restaurant gegessen."],
      ["Elle a fini son projet.", "Sie hat ihr Projekt beendet."],
      ["Ils ont vendu leur voiture.", "Sie haben ihr Auto verkauft."]
    ]),
    h("Wichtige unregelmäßige Partizipien"),
    tb(["Infinitiv", "Partizip", "Infinitiv", "Partizip"], [
      ["avoir", "eu", "être", "été"],
      ["faire", "fait", "dire", "dit"],
      ["prendre", "pris", "mettre", "mis"],
      ["voir", "vu", "pouvoir", "pu"],
      ["vouloir", "voulu", "devoir", "dû"],
      ["savoir", "su", "boire", "bu"],
      ["lire", "lu", "écrire", "écrit"],
      ["ouvrir", "ouvert", "recevoir", "reçu"]
    ]),
    h("Verneinung und Frage"),
    p("Bei der Verneinung umschließen **ne … pas** das Hilfsverb: *Je n'ai pas mangé.* Bei der Frage mit Inversion wird das Hilfsverb umgestellt: *As-tu fini ?* Mit est-ce que: *Est-ce que tu as fini ?*"),
    ex([
      ["Je n'ai pas compris.", "Ich habe nicht verstanden."],
      ["Tu as vu ce film ?", "Hast du diesen Film gesehen?"],
      ["Elle n'a jamais pris l'avion.", "Sie ist nie geflogen.", "Bei ne … jamais / rien / plus steht das Partizip nach dem zweiten Teil."]
    ]),
    h("Zeitangaben"),
    voc("Typische Signalwörter", [
      ["hier", "gestern"], ["avant-hier", "vorgestern"], ["la semaine dernière", "letzte Woche"], ["le mois dernier", "letzten Monat"], ["l'année dernière", "letztes Jahr"],
      ["il y a trois jours", "vor drei Tagen"], ["ce matin", "heute Morgen"], ["tout à l'heure", "vorhin"], ["déjà / pas encore", "schon / noch nicht"]
    ]),
    tip("Im Gesprochenen wird das passé composé für fast alle abgeschlossenen Handlungen genutzt. Das passé simple (il parla) findet man nur in der Literatur – du musst es zuerst nur erkennen."),
    dlg("Ce week-end", [
      ["A", "Qu'est-ce que tu as fait ce week-end ?", "Was hast du dieses Wochenende gemacht?"],
      ["B", "Samedi, j'ai visité un musée, puis j'ai mangé avec des amis.", "Samstag habe ich ein Museum besucht, dann habe ich mit Freunden gegessen."],
      ["A", "Et dimanche ?", "Und Sonntag?"],
      ["B", "J'ai dormi jusqu'à midi et j'ai regardé un film.", "Ich habe bis Mittag geschlafen und einen Film angeschaut."]
    ])
  ],
  x: [
    xg("Übung 1 – Passé composé", "Exercice 1 – Passé composé", [
      gap("Hier, j'___ travaillé. (avoir)", "ai", "j'ai travaillé."),
      gap("Nous avons ___ au restaurant. (manger)", "mangé", "mangé."),
      gap("Elle a ___ son devoir. (finir)", "fini", "fini."),
      gap("Tu as ___ ce film ? (voir)", "vu", "vu."),
      gap("Ils ont ___ un gâteau. (faire)", "fait", "fait."),
      mc("Welches Partizip gehört zu *prendre*?", ["prendu", "pris", "prit", "pri"], 1, "prendre → pris."),
      mc("Welcher Satz ist richtig verneint?", ["Je ne pas ai mangé.", "Je n'ai pas mangé.", "Je ai pas mangé.", "Je n'ai mangé pas."], 1, "ne + avoir + pas + Partizip."),
      ord(["Nous", "avons", "visité", "Paris", "l'été", "dernier", "."], "Nous avons visité Paris l'été dernier .", "Subjekt – avoir – Partizip – Objekt – Zeit."),
      mat([["j'ai fait", "ich habe gemacht"], ["j'ai dit", "ich habe gesagt"], ["j'ai bu", "ich habe getrunken"], ["j'ai écrit", "ich habe geschrieben"], ["j'ai lu", "ich habe gelesen"]])
    ])
  ]
});

D.add({ id: "a2-pc-etre", lv: "A2", t: ["Passé composé mit être und Angleichung", "Le passé composé avec être"], s: ["Bewegungsverben, Reflexivverben, Angleichung des Partizips.", "Verbes de mouvement, accord du participe."], k: "passe compose etre aller venir partir arriver naitre mourir reflexiv angleichung accord participe vandertrampe",
  b: [
    p("Etwa **15 Verben** (meist Bewegung oder Zustandsänderung) und alle **reflexiven Verben** bilden das passé composé mit **être**. Dann wird das Partizip wie ein Adjektiv an das **Subjekt** angeglichen."),
    h("Die Verben mit être (DR & MRS VANDERTRAMP)"),
    tb(["Infinitiv", "Partizip", "Bedeutung"], [
      ["aller", "allé", "gehen, fahren"], ["venir", "venu", "kommen"], ["arriver", "arrivé", "ankommen"], ["partir", "parti", "weggehen, abreisen"],
      ["entrer", "entré", "hineingehen"], ["sortir", "sorti", "hinausgehen"], ["monter", "monté", "hinaufgehen"], ["descendre", "descendu", "hinuntergehen"],
      ["rester", "resté", "bleiben"], ["tomber", "tombé", "fallen"], ["naître", "né", "geboren werden"], ["mourir", "mort", "sterben"],
      ["retourner", "retourné", "zurückkehren"], ["devenir", "devenu", "werden"], ["passer", "passé", "vorbeigehen"]
    ]),
    h("Angleichung (accord)"),
    tb(["Subjekt", "Beispiel"], [
      ["männlich Singular", "Il est allé au cinéma."],
      ["weiblich Singular (+ e)", "Elle est allée au cinéma."],
      ["männlich Plural (+ s)", "Ils sont allés au cinéma."],
      ["weiblich Plural (+ es)", "Elles sont allées au cinéma."]
    ], "Bei *nous* und *vous* richtet sich die Endung nach den Personen: Nous sommes allées (nur Frauen)."),
    ex([
      ["Je suis arrivé(e) à huit heures.", "Ich bin um acht Uhr angekommen."],
      ["Marie est partie hier soir.", "Marie ist gestern Abend abgereist."],
      ["Ils sont restés à la maison.", "Sie sind zu Hause geblieben."]
    ]),
    h("Reflexive Verben"),
    ex([
      ["Elle s'est levée à sept heures.", "Sie ist um sieben Uhr aufgestanden."],
      ["Nous nous sommes couchés tard.", "Wir sind spät schlafen gegangen."],
      ["Je ne me suis pas dépêché.", "Ich habe mich nicht beeilt."]
    ]),
    warn("Bei einigen Verben (monter, descendre, sortir, passer, retourner) gilt avoir, wenn ein direktes Objekt folgt: *Il a sorti la voiture.* (Er hat das Auto herausgefahren) aber *Il est sorti.* (Er ist hinausgegangen)."),
    h("Angleichung bei avoir"),
    p("Bei avoir gleicht man das Partizip **nur** an, wenn das direkte Objekt **davor** steht: *Les pommes que j'ai achetées.* (aber: *J'ai acheté des pommes.*)."),
    dlg("Hier soir", [
      ["A", "À quelle heure es-tu rentré hier ?", "Um wie viel Uhr bist du gestern zurückgekommen?"],
      ["B", "Je suis rentré vers minuit. Et toi, tu es sortie avec Léa ?", "Ich bin gegen Mitternacht zurückgekommen. Und du, bist du mit Léa ausgegangen?"],
      ["A", "Oui, nous sommes allées au cinéma.", "Ja, wir sind ins Kino gegangen."]
    ])
  ],
  x: [
    xg("Übung 1 – être oder avoir?", "Exercice 1 – être ou avoir ?", [
      gap("Elle est ___ à Paris. (aller, weiblich)", "allée", "allée."),
      gap("Ils sont ___ hier. (partir)", "partis", "partis."),
      gap("Nous sommes ___ à la maison. (rester, Frauen)", "restées", "restées."),
      gap("Je me suis ___ à sept heures. (lever, Mann)", "levé", "levé."),
      mc("Welches Hilfsverb: Il ___ arrivé.", ["a", "est", "ont", "sont"], 1, "arriver + être."),
      mc("Welches Hilfsverb: J'___ mangé.", ["suis", "ai", "es", "ont"], 1, "manger + avoir."),
      mc("Welche Form ist richtig? Elles sont …", ["arrivé", "arrivés", "arrivées", "arrivée"], 2, "weiblich Plural: arrivées."),
      ord(["Marie", "est", "née", "en", "1990", "."], "Marie est née en 1990 .", "naître + être, Angleichung."),
      mat([["je suis allé", "ich bin gegangen"], ["elle est venue", "sie ist gekommen"], ["ils sont partis", "sie sind abgereist"], ["on est resté", "man ist geblieben"], ["je suis né", "ich bin geboren"]])
    ])
  ]
});

D.add({ id: "a2-imparfait", lv: "A2", t: ["Das imparfait", "L'imparfait"], s: ["Beschreibende Vergangenheit: Gewohnheiten, Zustände, Hintergrund.", "Habitudes et descriptions dans le passé."], k: "imparfait vergangenheit gewohnheit beschreibung etais avais j'habitais nous parlions c'etait",
  b: [
    p("Das **imparfait** beschreibt, **wie es war**: Zustände, Gewohnheiten, Hintergrund. Es hat keinen klaren Anfang oder Ende. Die Endungen sind für alle Verben gleich."),
    h("Bildung"),
    p("Stamm der **nous**-Form im Präsens (ohne -ons) + **-ais, -ais, -ait, -ions, -iez, -aient**."),
    tb(["", "parler (nous parlons)", "finir (nous finissons)", "avoir (nous avons)"], [
      ["je", "je parlais", "je finissais", "j'avais"], ["tu", "tu parlais", "tu finissais", "tu avais"], ["il / elle", "il parlait", "il finissait", "il avait"],
      ["nous", "nous parlions", "nous finissions", "nous avions"], ["vous", "vous parliez", "vous finissiez", "vous aviez"], ["ils / elles", "ils parlaient", "ils finissaient", "ils avaient"]
    ], "Einzige Ausnahme beim Stamm: **être** → j'**ét**ais, tu étais, il était, nous étions, vous étiez, ils étaient."),
    h("Wann benutzt man das imparfait?"),
    ul([
      "**Gewohnheit:** *Quand j'étais enfant, je jouais au football tous les jours.* – Als Kind spielte ich jeden Tag Fußball.",
      "**Beschreibung / Zustand:** *Il faisait beau, le ciel était bleu.* – Es war schön, der Himmel war blau.",
      "**Gleichzeitigkeit im Hintergrund:** *Pendant que je cuisinais, il regardait la télé.*",
      "**Alter und Gefühle:** *J'avais dix ans. J'étais triste.*"
    ]),
    ex([
      ["Avant, nous habitions à Lyon.", "Früher wohnten wir in Lyon."],
      ["Il pleuvait quand je suis sorti.", "Es regnete, als ich hinausging."],
      ["C'était une belle journée.", "Es war ein schöner Tag."]
    ]),
    voc("Signalwörter für das imparfait", [
      ["souvent", "oft"], ["toujours", "immer"], ["tous les jours", "jeden Tag"], ["autrefois / avant", "früher"], ["pendant que", "während"], ["d'habitude", "gewöhnlich"], ["chaque été", "jeden Sommer"]
    ]),
    dlg("Quand j'étais petit", [
      ["A", "Tu habitais où quand tu étais petit ?", "Wo hast du gewohnt, als du klein warst?"],
      ["B", "J'habitais dans un petit village. Nous avions un grand jardin.", "Ich wohnte in einem kleinen Dorf. Wir hatten einen großen Garten."],
      ["A", "Et qu'est-ce que tu faisais le week-end ?", "Und was hast du am Wochenende gemacht?"],
      ["B", "Je jouais dehors avec mes frères.", "Ich habe draußen mit meinen Brüdern gespielt."]
    ])
  ],
  x: [
    xg("Übung 1 – Imparfait", "Exercice 1 – Imparfait", [
      gap("Quand j'___ petit, je jouais. (être)", "étais", "j'étais."),
      gap("Nous ___ à Paris. (habiter)", "habitions", "nous habitions."),
      gap("Il ___ beau. (faire)", "faisait", "il faisait."),
      gap("Ils ___ des vélos. (avoir)", "avaient", "ils avaient."),
      gap("Tu ___ souvent au cinéma. (aller)", "allais", "tu allais."),
      mc("Welcher Satz beschreibt eine Gewohnheit?", ["Hier, j'ai mangé.", "Chaque été, nous allions à la mer.", "Il est parti.", "J'ai fini."], 1, "chaque été → imparfait."),
      mc("Der Stamm von *finir* im imparfait:", ["fin-", "finiss-", "finis-", "fini-"], 1, "nous finissons → finiss-."),
      ord(["Quand", "j'", "étais", "enfant", ",", "je", "jouais", "dehors", "."], "Quand j' étais enfant , je jouais dehors .", "imparfait für Gewohnheit."),
      mat([["j'étais", "ich war"], ["il avait", "er hatte"], ["nous allions", "wir gingen"], ["ils faisaient", "sie machten"], ["tu disais", "du sagtest"]])
    ])
  ]
});

D.add({ id: "a2-pc-imp", lv: "A2", t: ["Passé composé oder imparfait?", "Passé composé ou imparfait ?"], s: ["Handlung gegen Hintergrund; Regeln, Beispiele, Erzählung.", "Raconter au passé."], k: "passe compose imparfait unterschied erzaehlung hintergrund handlung quand pendant soudain",
  b: [
    p("In einer Erzählung wechseln beide Zeiten. Merke dir das Bild einer Bühne: Das **imparfait** ist die **Kulisse** (wie es war), das **passé composé** sind die **Ereignisse** (was geschah)."),
    tb(["", "passé composé", "imparfait"], [
      ["Funktion", "abgeschlossene Handlung", "Zustand, Beschreibung, Gewohnheit"],
      ["Dauer", "einmalig, zeitlich begrenzt", "ohne Anfang und Ende"],
      ["Signalwörter", "hier, soudain, un jour, tout à coup", "souvent, toujours, d'habitude, pendant que"],
      ["Frage", "Was ist passiert?", "Wie war es?"]
    ]),
    ex([
      ["Il pleuvait quand je suis sorti.", "Es regnete, als ich hinausging.", "Hintergrund: Regen (imparfait); Ereignis: hinausgehen (passé composé)."],
      ["Je lisais quand le téléphone a sonné.", "Ich las, als das Telefon klingelte."],
      ["Pendant que nous mangions, il est arrivé.", "Während wir aßen, kam er an."]
    ]),
    h("Verben, die den Sinn ändern"),
    tb(["Verb", "imparfait", "passé composé"], [
      ["savoir", "Je savais la réponse. (ich wusste)", "J'ai su la réponse. (ich erfuhr)"],
      ["pouvoir", "Je pouvais venir. (ich hätte können)", "J'ai pu venir. (es gelang mir)"],
      ["vouloir", "Je voulais partir. (ich wollte)", "J'ai voulu partir. (ich versuchte)"]
    ]),
    dlg("Une histoire", [
      ["A", "Pourquoi tu es arrivé en retard ?", "Warum bist du zu spät gekommen?"],
      ["B", "Il y avait beaucoup de circulation, et j'ai raté mon bus.", "Es gab viel Verkehr, und ich habe meinen Bus verpasst."],
      ["A", "Il faisait mauvais aussi ?", "War das Wetter auch schlecht?"],
      ["B", "Oui, il pleuvait, donc j'ai pris un taxi.", "Ja, es regnete, also habe ich ein Taxi genommen."]
    ])
  ],
  x: [
    xg("Übung 1 – Erzählen", "Exercice 1 – Raconter", [
      gap("Il ___ (pleuvoir, imp.) quand je suis sorti.", "pleuvait", "Hintergrund → imparfait."),
      gap("Je lisais quand le téléphone a ___ . (sonner)", "sonné", "Ereignis → passé composé."),
      gap("Hier, j'___ vu un film. (avoir)", "ai", "j'ai vu."),
      gap("Quand j'étais jeune, je ___ au foot. (jouer)", "jouais", "Gewohnheit."),
      mc("Welche Zeit für „plötzlich“?", ["imparfait", "passé composé", "présent", "futur"], 1, "soudain + Ereignis → passé composé."),
      mc("*Elle était fatiguée* ist …", ["ein Ereignis", "eine Beschreibung", "eine Zukunft", "ein Imperativ"], 1, "Zustand → imparfait."),
      ord(["Il", "faisait", "froid", "et", "il", "neigeait", "."], "Il faisait froid et il neigeait .", "Beschreibung: zwei imparfait."),
      mat([["hier", "gestern"], ["soudain", "plötzlich"], ["d'habitude", "gewöhnlich"], ["pendant que", "während"], ["tout à coup", "auf einmal"]])
    ])
  ]
});

D.add({ id: "a2-pronomen", lv: "A2", t: ["Objektpronomen: le, la, les, lui, leur", "Les pronoms compléments"], s: ["Wiederholungen vermeiden: direktes und indirektes Objekt, Stellung.", "COD et COI."], k: "pronomen objektpronomen le la les lui leur me te nous vous cod coi stellung pronoms complements",
  b: [
    p("Pronomen ersetzen ein Nomen, das schon genannt wurde. Sie stehen im Französischen **vor dem Verb** (anders als im Deutschen)."),
    h("Direktes Objekt (COD): me, te, le/la, nous, vous, les"),
    tb(["Person", "Pronomen", "Beispiel"], [
      ["mich / dich", "me, te", "Il me voit. · Je te comprends."],
      ["ihn / sie / es", "le, la (l')", "Je le prends. · Je la connais. · Je l'aime."],
      ["uns / euch", "nous, vous", "Elle nous invite."],
      ["sie (Plural)", "les", "Je les achète."]
    ]),
    h("Indirektes Objekt (COI, mit à): me, te, lui, nous, vous, leur"),
    tb(["Person", "Pronomen", "Beispiel"], [
      ["mir / dir", "me, te", "Il me parle."],
      ["ihm / ihr", "lui", "Je lui téléphone."],
      ["uns / euch", "nous, vous", "Elle nous écrit."],
      ["ihnen", "leur", "Je leur donne un cadeau."]
    ]),
    ex([
      ["Tu connais Paul ? – Oui, je le connais.", "Kennst du Paul? – Ja, ich kenne ihn."],
      ["Tu as vu Marie ? – Oui, je l'ai vue.", "Hast du Marie gesehen? – Ja, ich habe sie gesehen.", "Im passé composé gleicht man das Partizip an das davorstehende Objekt an: vue."],
      ["Tu parles à ton frère ? – Oui, je lui parle.", "Sprichst du mit deinem Bruder? – Ja, ich spreche mit ihm."],
      ["Je ne le vois pas.", "Ich sehe ihn nicht.", "Verneinung: ne + Pronomen + Verb + pas."]
    ]),
    h("Stellung mit Infinitiv und Imperativ"),
    ul(["Mit Infinitiv: Pronomen **vor dem Infinitiv**: *Je veux le voir.*", "Bejahter Imperativ: **hinter** dem Verb mit Bindestrich: *Regarde-le !* · *Donne-lui le livre !* · me → moi: *Aide-moi !*", "Verneinter Imperativ: wie normal davor: *Ne le regarde pas !*"]),
    warn("**Verben mit à + Person** haben das indirekte Pronomen lui/leur: parler à, téléphoner à, donner à, écrire à, répondre à, dire à. Ausnahme: *penser à* + Person → *penser à lui* (betontes Pronomen)."),
    dlg("Au bureau", [
      ["A", "Tu as envoyé le rapport à Marc ?", "Hast du den Bericht an Marc geschickt?"],
      ["B", "Oui, je le lui ai envoyé ce matin.", "Ja, ich habe ihn ihm heute Morgen geschickt."],
      ["A", "Et tu as appelé les clients ?", "Und hast du die Kunden angerufen?"],
      ["B", "Je les appelle cet après-midi.", "Ich rufe sie heute Nachmittag an."]
    ])
  ],
  x: [
    xg("Übung 1 – Pronomen", "Exercice 1 – Pronoms", [
      gap("Tu vois Paul ? – Oui, je ___ vois. (ihn)", "le", "le."),
      gap("Tu aimes Marie ? – Oui, je ___ aime. (sie)", "l'", "l'aime."),
      gap("Tu parles à Léa ? – Oui, je ___ parle. (ihr)", "lui", "lui."),
      gap("Tu donnes le livre aux enfants ? – Je ___ le donne. (ihnen)", "leur", "leur."),
      gap("Il ___ voit. (uns)", "nous", "nous."),
      mc("Wie lautet der bejahte Imperativ: „Hilf mir!“", ["Aide-me !", "Aide-moi !", "Me aide !", "Aide me !"], 1, "Aide-moi !"),
      mc("Stellung im Satz: *Je veux ___ voir.* (ihn)", ["le voir", "voir le", "le veux voir", "voir-le"], 0, "Vor dem Infinitiv: le voir."),
      ord(["Je", "ne", "la", "connais", "pas", "."], "Je ne la connais pas .", "ne + Pronomen + Verb + pas."),
      mat([["le", "ihn / es"], ["la", "sie (Sg.)"], ["les", "sie (Pl.)"], ["lui", "ihm / ihr"], ["leur", "ihnen"]])
    ])
  ]
});

D.add({ id: "a2-y-en", lv: "A2", t: ["Die Pronomen y und en", "Les pronoms y et en"], s: ["Ortspronomen y, Mengenpronomen en – Stellung und Beispiele.", "Remplacer un lieu ou une quantité."], k: "pronomen y en ort menge ersetzen il y en a j'y vais j'en veux",
  b: [
    p("**y** und **en** sind kleine, aber sehr häufige Pronomen. Sie stehen wie die anderen Objektpronomen vor dem Verb."),
    h("Das Pronomen y"),
    p("**y** ersetzt eine **Ortsangabe mit à, dans, sur, chez …** oder eine **Sache nach à**."),
    ex([
      ["Tu vas à Paris ? – Oui, j'y vais demain.", "Fährst du nach Paris? – Ja, ich fahre morgen dorthin."],
      ["Il est chez le médecin ? – Oui, il y est.", "Ist er beim Arzt? – Ja, er ist dort."],
      ["Tu penses à ton examen ? – Oui, j'y pense.", "Denkst du an deine Prüfung? – Ja, ich denke daran."],
      ["Allons-y !", "Gehen wir!"]
    ]),
    h("Das Pronomen en"),
    p("**en** ersetzt **de + Nomen**, einen Teilungsartikel oder eine **Menge** (einschließlich Zahlen)."),
    ex([
      ["Tu veux du café ? – Oui, j'en veux.", "Möchtest du Kaffee? – Ja, ich möchte welchen."],
      ["Tu as des frères ? – J'en ai deux.", "Hast du Brüder? – Ich habe zwei (davon)."],
      ["Tu viens de Lyon ? – Oui, j'en viens.", "Kommst du aus Lyon? – Ja, ich komme von dort."],
      ["Il y en a beaucoup.", "Es gibt viele davon."],
      ["Tu as besoin de cette clé ? – Oui, j'en ai besoin.", "Brauchst du diesen Schlüssel? – Ja, ich brauche ihn."]
    ]),
    tb(["Situation", "Pronomen", "Beispiel"], [
      ["Ort (wohin)", "y", "J'y vais."],
      ["Ort (woher)", "en", "J'en viens."],
      ["Menge / Teilungsartikel", "en", "J'en mange. · Il y en a trois."],
      ["à + Sache", "y", "Je m'y intéresse."],
      ["de + Sache", "en", "Je m'en souviens."]
    ]),
    warn("Bei einer **Zahl oder Menge** muss sie bleiben: *J'ai trois sœurs → J'en ai trois.* (nicht: J'en ai.)"),
    dlg("Au supermarché", [
      ["A", "Tu as acheté du pain ?", "Hast du Brot gekauft?"],
      ["B", "Oui, j'en ai acheté deux baguettes.", "Ja, ich habe zwei Baguettes gekauft."],
      ["A", "Et tu vas à la pharmacie ?", "Und gehst du zur Apotheke?"],
      ["B", "Oui, j'y vais après.", "Ja, ich gehe danach hin."]
    ])
  ],
  x: [
    xg("Übung 1 – y und en", "Exercice 1 – y et en", [
      gap("Tu vas à Berlin ? – Oui, j'___ vais. (y/en)", "y", "Ort → y."),
      gap("Tu veux du thé ? – Oui, j'___ veux. (y/en)", "en", "Teilungsartikel → en."),
      gap("Tu as des enfants ? – J'___ ai deux.", "en", "Menge → en."),
      gap("Il pense à son travail ? – Oui, il ___ pense.", "y", "penser à → y."),
      mc("*Allons-y* bedeutet …", ["Wir gehen nicht.", "Gehen wir!", "Er geht.", "Wir waren dort."], 1, "Allons-y = Los geht's."),
      mc("Welches Pronomen: Je viens de Paris → Je ___ viens.", ["y", "en", "le", "lui"], 1, "de + Ort → en."),
      ord(["Il", "y", "en", "a", "trois", "."], "Il y en a trois .", "il y en a + Zahl."),
      mat([["j'y vais", "ich gehe dorthin"], ["j'en veux", "ich möchte davon"], ["j'en viens", "ich komme von dort"], ["il y en a", "es gibt davon"], ["allons-y", "los geht's"]])
    ])
  ]
});

D.add({ id: "a2-futur", lv: "A2", t: ["Das futur simple", "Le futur simple"], s: ["Bildung, unregelmäßige Stämme, Gebrauch mit quand und si.", "Parler de l'avenir."], k: "futur simple zukunft je parlerai serai aurai irai ferai viendrai verrai pourrai voudrai",
  b: [
    p("Das **futur simple** ist die „echte“ Zukunftsform. Man benutzt es für Pläne, Vorhersagen und Versprechen. Es wird aus dem **Infinitiv** plus den Endungen von **avoir** gebildet."),
    tb(["", "parler", "finir", "prendre (e fällt weg)"], [
      ["je", "je parlerai", "je finirai", "je prendrai"], ["tu", "tu parleras", "tu finiras", "tu prendras"], ["il / elle", "il parlera", "il finira", "il prendra"],
      ["nous", "nous parlerons", "nous finirons", "nous prendrons"], ["vous", "vous parlerez", "vous finirez", "vous prendrez"], ["ils / elles", "ils parleront", "ils finiront", "ils prendront"]
    ], "Endungen: **-ai, -as, -a, -ons, -ez, -ont**."),
    h("Unregelmäßige Stämme"),
    tb(["Infinitiv", "Futurstamm", "Beispiel"], [
      ["être", "ser-", "je serai"], ["avoir", "aur-", "j'aurai"], ["aller", "ir-", "j'irai"], ["faire", "fer-", "je ferai"],
      ["venir", "viendr-", "je viendrai"], ["voir", "verr-", "je verrai"], ["pouvoir", "pourr-", "je pourrai"], ["vouloir", "voudr-", "je voudrai"],
      ["savoir", "saur-", "je saurai"], ["devoir", "devr-", "je devrai"], ["envoyer", "enverr-", "j'enverrai"], ["falloir", "faudr-", "il faudra"]
    ]),
    ex([
      ["Demain, il fera beau.", "Morgen wird es schön sein."],
      ["Nous irons en Espagne l'été prochain.", "Wir werden nächsten Sommer nach Spanien fahren."],
      ["Je t'appellerai ce soir.", "Ich rufe dich heute Abend an."],
      ["Quand tu seras là, nous mangerons.", "Wenn du da bist, essen wir.", "Nach **quand** und **dès que** steht im Französischen das futur, wo das Deutsche das Präsens benutzt."]
    ]),
    tip("Alltag: Meist reicht das **futur proche** (je vais partir). Das **futur simple** klingt formeller oder sicherer, z. B. bei Versprechen: *Je serai là à huit heures.*"),
    dlg("Projets de vacances", [
      ["A", "Où est-ce que vous irez cet été ?", "Wohin werdet ihr diesen Sommer fahren?"],
      ["B", "Nous irons en Bretagne. Nous louerons une maison.", "Wir fahren in die Bretagne. Wir mieten ein Haus."],
      ["A", "Vous resterez combien de temps ?", "Wie lange bleibt ihr?"],
      ["B", "Deux semaines. Je me reposerai enfin !", "Zwei Wochen. Ich werde mich endlich ausruhen!"]
    ])
  ],
  x: [
    xg("Übung 1 – Futur simple", "Exercice 1 – Futur simple", [
      gap("Demain, je ___ à Paris. (aller)", "irai", "j'irai."),
      gap("Il ___ beau. (faire)", "fera", "il fera."),
      gap("Nous ___ le train. (prendre)", "prendrons", "nous prendrons."),
      gap("Vous ___ à huit heures. (être)", "serez", "vous serez."),
      gap("Ils ___ demain. (venir)", "viendront", "ils viendront."),
      mc("Der Stamm von *avoir* im futur:", ["av-", "aur-", "avoir-", "ai-"], 1, "aur-."),
      mc("Nach *quand* steht …", ["das Präsens", "das futur", "das imparfait", "der Imperativ"], 1, "Quand tu seras là…"),
      ord(["Je", "t'", "appellerai", "ce", "soir", "."], "Je t' appellerai ce soir .", "futur simple."),
      mat([["je serai", "ich werde sein"], ["j'aurai", "ich werde haben"], ["j'irai", "ich werde gehen"], ["je ferai", "ich werde machen"], ["je pourrai", "ich werde können"]])
    ])
  ]
});

D.add({ id: "a2-relativ", lv: "A2", t: ["Relativsätze: qui, que, où, dont", "Les pronoms relatifs"], s: ["Sätze verbinden und genauer beschreiben.", "Relier et préciser avec qui, que, où, dont."], k: "relativsaetze relativpronomen qui que ou dont pronoms relatifs verbinden",
  b: [
    p("Relativsätze erklären ein Nomen näher. Im Französischen hängt das Pronomen davon ab, **welche Funktion** es im Nebensatz hat."),
    tb(["Pronomen", "Funktion", "Beispiel"], [
      ["**qui**", "Subjekt (wer macht etwas?)", "L'homme **qui** parle est mon père."],
      ["**que (qu')**", "direktes Objekt", "Le livre **que** je lis est intéressant."],
      ["**où**", "Ort oder Zeit", "La ville **où** j'habite est petite. · Le jour **où** il est venu …"],
      ["**dont**", "de + Nomen", "Le film **dont** je parle est nouveau."]
    ]),
    ex([
      ["J'ai un ami qui habite à Paris.", "Ich habe einen Freund, der in Paris wohnt."],
      ["La voiture que tu vois est à moi.", "Das Auto, das du siehst, gehört mir."],
      ["C'est le restaurant où nous avons dîné.", "Das ist das Restaurant, in dem wir gegessen haben."],
      ["Voilà la femme dont je t'ai parlé.", "Das ist die Frau, von der ich dir erzählt habe."]
    ]),
    tip("Erkennungstest: Folgt auf das Pronomen **direkt ein Verb**, steht **qui**. Folgt ein **Subjekt** (je, tu, il, ein Nomen), steht **que**."),
    warn("Vor einem Vokal wird *que* zu *qu'*, *qui* bleibt immer *qui*: *l'homme qu'elle aime*."),
    h("Angleichung im passé composé"),
    p("Bei *que* gleicht man das Partizip an das Bezugswort an: *Les photos que j'ai prises* (prises = weiblich Plural)."),
    dlg("Une description", [
      ["A", "C'est qui, la fille qui parle avec Paul ?", "Wer ist das Mädchen, das mit Paul spricht?"],
      ["B", "C'est Léa, la cousine dont il parle toujours.", "Das ist Léa, die Cousine, von der er immer spricht."],
      ["A", "Elle habite dans la ville où il est né ?", "Wohnt sie in der Stadt, in der er geboren wurde?"],
      ["B", "Oui, c'est la ville que nous visiterons cet été.", "Ja, das ist die Stadt, die wir diesen Sommer besuchen."]
    ])
  ],
  x: [
    xg("Übung 1 – Relativpronomen", "Exercice 1 – Pronoms relatifs", [
      gap("L'homme ___ parle est mon père. (qui/que)", "qui", "Subjekt → qui."),
      gap("Le livre ___ je lis est bon. (qui/que)", "que", "Objekt → que."),
      gap("La ville ___ j'habite est petite. (où/dont)", "où", "Ort → où."),
      gap("Le film ___ je parle est nouveau. (dont/que)", "dont", "parler de → dont."),
      mc("Vor Vokal: Le garçon ___ elle aime.", ["que", "qu'", "qui", "qu"], 1, "que → qu' vor Vokal."),
      mc("Welcher Satz ist richtig?", ["La femme que parle.", "La femme qui parle.", "La femme dont parle.", "La femme où parle."], 1, "Subjekt → qui."),
      ord(["C'est", "le", "livre", "que", "j'", "ai", "acheté", "."], "C'est le livre que j' ai acheté .", "que + Subjekt + Verb."),
      mat([["qui", "Subjekt"], ["que", "Objekt"], ["où", "Ort/Zeit"], ["dont", "von dem/der"]])
    ])
  ]
});

D.add({ id: "a2-konditional", lv: "A2", t: ["Conditionnel und Bedingungssätze mit si", "Le conditionnel et les phrases avec si"], s: ["Höfliche Bitten, Wünsche, realer und irrealer Fall.", "Politesse, souhaits, hypothèses."], k: "conditionnel si bedingung hoeflich je voudrais ich wuerde si j'avais irais saurais bedingungssatz",
  b: [
    p("Das **conditionnel présent** drückt Höflichkeit, Wünsche und irreale Annahmen aus – dem deutschen „ich würde / ich hätte“ entsprechend. Es wird mit dem **Futurstamm + Endungen des imparfait** gebildet."),
    tb(["", "parler", "aller", "avoir", "être"], [
      ["je", "je parlerais", "j'irais", "j'aurais", "je serais"], ["tu", "tu parlerais", "tu irais", "tu aurais", "tu serais"], ["il / elle", "il parlerait", "il irait", "il aurait", "il serait"],
      ["nous", "nous parlerions", "nous irions", "nous aurions", "nous serions"], ["vous", "vous parleriez", "vous iriez", "vous auriez", "vous seriez"], ["ils / elles", "ils parleraient", "ils iraient", "ils auraient", "ils seraient"]
    ]),
    h("Höfliche Bitten"),
    ex([
      ["Je voudrais un café.", "Ich möchte einen Kaffee."],
      ["Pourriez-vous m'aider ?", "Könnten Sie mir helfen?"],
      ["Tu pourrais fermer la fenêtre ?", "Könntest du das Fenster schließen?"],
      ["Il faudrait partir.", "Man müsste gehen."]
    ]),
    h("Bedingungssätze mit si"),
    tb(["Fall", "si-Satz", "Hauptsatz", "Beispiel"], [
      ["real (möglich)", "si + présent", "présent / futur", "Si tu viens, nous mangerons ensemble."],
      ["irreal (unwahrscheinlich)", "si + imparfait", "conditionnel", "Si j'avais de l'argent, j'achèterais une maison."]
    ]),
    warn("**Nach si steht nie das futur oder das conditionnel!** Falsch: *Si j'aurais …* · Richtig: *Si j'avais …, j'aurais …*"),
    ex([
      ["S'il pleut, nous resterons à la maison.", "Wenn es regnet, bleiben wir zu Hause."],
      ["Si j'étais toi, je partirais.", "An deiner Stelle würde ich gehen."],
      ["Que ferais-tu si tu gagnais au loto ?", "Was würdest du tun, wenn du im Lotto gewinnen würdest?"]
    ]),
    dlg("Rêver un peu", [
      ["A", "Si tu avais un million d'euros, qu'est-ce que tu ferais ?", "Wenn du eine Million Euro hättest, was würdest du tun?"],
      ["B", "Je voyagerais autour du monde et j'achèterais une maison au bord de la mer.", "Ich würde um die Welt reisen und ein Haus am Meer kaufen."],
      ["A", "Moi, je ne travaillerais plus !", "Ich würde nicht mehr arbeiten!"]
    ])
  ],
  x: [
    xg("Übung 1 – Conditionnel und si", "Exercice 1 – Conditionnel et si", [
      gap("Je ___ un café. (vouloir, höflich)", "voudrais", "je voudrais."),
      gap("Tu ___ m'aider ? (pouvoir, höflich)", "pourrais", "tu pourrais."),
      gap("Si j'avais du temps, je ___ . (voyager)", "voyagerais", "voyagerais."),
      gap("Si tu viens, nous ___ ensemble. (manger, futur)", "mangerons", "si + présent → futur."),
      mc("Welcher Satz ist richtig?", ["Si j'aurais de l'argent, j'achèterais.", "Si j'avais de l'argent, j'achèterais.", "Si j'ai de l'argent, j'achèterais.", "Si j'avais de l'argent, j'achète."], 1, "si + imparfait → conditionnel."),
      mc("*Je serais* ist …", ["futur", "conditionnel", "imparfait", "passé composé"], 1, "serais = conditionnel."),
      ord(["Si", "j'", "étais", "riche", ",", "je", "voyagerais", "."], "Si j' étais riche , je voyagerais .", "irreale Bedingung."),
      mat([["je voudrais", "ich möchte"], ["il faudrait", "man müsste"], ["je pourrais", "ich könnte"], ["j'aimerais", "ich würde gern"], ["ils iraient", "sie würden gehen"]])
    ])
  ]
});

D.add({ id: "a2-reisen", lv: "A2", t: ["Reisen, Verkehr und Hotel", "Voyager : transports et hôtel"], s: ["Fahrkarten, Flughafen, Hotelzimmer reservieren, Probleme melden.", "Voyager, réserver, se débrouiller."], k: "reisen verkehr hotel bahn flug fahrkarte billet train gare aeroport reservation chambre voyage valise",
  b: [
    p("Reisevokabular braucht man früh: Fahrkarten kaufen, Zimmer buchen, Verbindungen erfragen."),
    voc("Les transports", [
      ["le train / la gare", "Zug / Bahnhof"], ["l'avion (m.) / l'aéroport (m.)", "Flugzeug / Flughafen"], ["le bus / l'arrêt (m.)", "Bus / Haltestelle"], ["le métro / la station", "U-Bahn / Station"],
      ["le billet / le ticket", "Fahrkarte / Ticket"], ["un aller simple", "einfache Fahrt"], ["un aller-retour", "Hin- und Rückfahrt"], ["le quai / la voie", "Bahnsteig / Gleis"],
      ["le retard", "Verspätung"], ["la correspondance", "Anschluss / Umsteigen"], ["la valise / le sac", "Koffer / Tasche"], ["le passeport", "Reisepass"]
    ]),
    voc("À l'hôtel", [
      ["une chambre simple / double", "Einzel- / Doppelzimmer"], ["avec salle de bains", "mit Bad"], ["le petit-déjeuner est compris", "Frühstück ist inbegriffen"], ["la clé / la carte", "Schlüssel / Karte"],
      ["réserver", "reservieren"], ["annuler", "stornieren"], ["la réception", "Rezeption"], ["la nuit", "Nacht"]
    ]),
    ex([
      ["Un aller-retour pour Lyon, s'il vous plaît.", "Eine Hin- und Rückfahrt nach Lyon, bitte."],
      ["À quelle heure part le prochain train pour Paris ?", "Wann fährt der nächste Zug nach Paris?"],
      ["Le train a vingt minutes de retard.", "Der Zug hat zwanzig Minuten Verspätung."],
      ["J'ai réservé une chambre au nom de Koevi.", "Ich habe ein Zimmer auf den Namen Koevi reserviert."],
      ["Y a-t-il le wifi dans la chambre ?", "Gibt es WLAN im Zimmer?"]
    ]),
    dlg("À la gare", [
      ["Voyageur", "Bonjour, je voudrais un billet pour Marseille, demain matin.", "Guten Tag, ich möchte eine Fahrkarte nach Marseille, morgen früh."],
      ["Employé", "Aller simple ou aller-retour ?", "Einfache Fahrt oder Hin- und Rückfahrt?"],
      ["Voyageur", "Aller-retour, en deuxième classe. Quel est le prix ?", "Hin und zurück, in der zweiten Klasse. Wie viel kostet es?"],
      ["Employé", "Quatre-vingt-quatre euros. Le train part à 8 h 12, voie 5.", "84 Euro. Der Zug fährt um 8:12 Uhr von Gleis 5."]
    ]),
    dlg("À l'hôtel", [
      ["Client", "Bonsoir, j'ai réservé une chambre double pour trois nuits.", "Guten Abend, ich habe ein Doppelzimmer für drei Nächte reserviert."],
      ["Réceptionniste", "Quel est votre nom, s'il vous plaît ?", "Wie ist Ihr Name, bitte?"],
      ["Client", "Koevi. Le petit-déjeuner est compris ?", "Koevi. Ist das Frühstück inbegriffen?"],
      ["Réceptionniste", "Oui, de sept à dix heures. Voici votre clé, chambre 204.", "Ja, von sieben bis zehn Uhr. Hier ist Ihr Schlüssel, Zimmer 204."]
    ])
  ],
  x: [
    xg("Übung 1 – Reisen", "Exercice 1 – Voyager", [
      mc("Eine Hin- und Rückfahrt heißt …", ["un aller simple", "un aller-retour", "un billet double", "un retour"], 1, "aller-retour."),
      mc("*La correspondance* bedeutet …", ["Briefwechsel", "Anschluss/Umsteigen", "Verspätung", "Fahrkarte"], 1, "correspondance = Anschluss."),
      mc("Wie fragt man nach der Abfahrt?", ["À quelle heure part le train ?", "Où est la gare ?", "Combien coûte le café ?", "Quel temps fait-il ?"], 0, "À quelle heure part …"),
      gap("J'ai ___ une chambre. (réserver, passé composé)", "réservé", "réservé."),
      gap("Le petit-déjeuner est ___ . (inbegriffen)", "compris", "compris."),
      gap("Le train a du ___ . (Verspätung)", "retard", "le retard."),
      ord(["Je", "voudrais", "un", "billet", "pour", "Lyon", "."], "Je voudrais un billet pour Lyon .", "Höfliche Bitte."),
      mat([["la gare", "Bahnhof"], ["la valise", "Koffer"], ["le quai", "Bahnsteig"], ["annuler", "stornieren"], ["la chambre", "Zimmer"]])
    ])
  ]
});

D.add({ id: "a2-arbeit", lv: "A2", t: ["Arbeit, Beruf und Telefon", "Le travail et le téléphone"], s: ["Berufe, Bewerbung, Termine, am Telefon, E-Mails schreiben.", "Métiers, rendez-vous, téléphone, e-mails."], k: "arbeit beruf telefon email termin bewerbung travail metier rendez-vous appeler message collegue patron",
  b: [
    voc("Les métiers", [
      ["l'électricien / l'électricienne", "Elektriker(in)"], ["l'ingénieur(e)", "Ingenieur(in)"], ["le médecin", "Arzt / Ärztin"], ["l'infirmier / l'infirmière", "Krankenpfleger(in)"],
      ["le professeur", "Lehrer(in)"], ["le vendeur / la vendeuse", "Verkäufer(in)"], ["le cuisinier / la cuisinière", "Koch / Köchin"], ["le chauffeur", "Fahrer"],
      ["le directeur / la directrice", "Direktor(in)"], ["le collègue / la collègue", "Kollege / Kollegin"], ["le patron / la patronne", "Chef(in)"]
    ]),
    voc("Au travail", [
      ["travailler", "arbeiten"], ["le bureau", "Büro"], ["la réunion", "Besprechung"], ["le rendez-vous", "Termin"], ["le salaire", "Gehalt"], ["le contrat", "Vertrag"],
      ["le CV", "Lebenslauf"], ["postuler", "sich bewerben"], ["le chômage", "Arbeitslosigkeit"], ["les congés (m.)", "Urlaub"], ["l'horaire (m.)", "Arbeitszeit"]
    ]),
    h("Am Telefon"),
    voc("Phrases utiles", [
      ["Allô ? Bonjour, ici Koffi Koevi.", "Hallo? Guten Tag, hier ist Koffi Koevi."],
      ["Je voudrais parler à Madame Martin.", "Ich möchte mit Frau Martin sprechen."],
      ["Ne quittez pas, je vous la passe.", "Bleiben Sie dran, ich verbinde Sie."],
      ["Elle n'est pas là. Voulez-vous laisser un message ?", "Sie ist nicht da. Möchten Sie eine Nachricht hinterlassen?"],
      ["Pouvez-vous répéter, s'il vous plaît ?", "Können Sie das bitte wiederholen?"],
      ["Je vous rappelle plus tard.", "Ich rufe Sie später zurück."]
    ]),
    h("Eine E-Mail schreiben"),
    tb(["Teil", "Formel"], [
      ["Anrede (formell)", "Madame, Monsieur, · Bonjour Madame Martin,"],
      ["Anrede (Kollege)", "Bonjour Paul, · Salut Paul,"],
      ["Anlass", "Je vous écris au sujet de … · Suite à notre conversation …"],
      ["Bitte", "Pourriez-vous m'envoyer … ? · Je vous serais reconnaissant de …"],
      ["Schluss (formell)", "Cordialement, · Bien cordialement, · Veuillez agréer, Madame, mes salutations distinguées."],
      ["Schluss (locker)", "À bientôt, · Bonne journée, · Amicalement,"]
    ]),
    dlg("Prendre un rendez-vous", [
      ["Secrétaire", "Cabinet Dupont, bonjour.", "Praxis Dupont, guten Tag."],
      ["Client", "Bonjour, je voudrais prendre un rendez-vous avec le docteur, s'il vous plaît.", "Guten Tag, ich möchte einen Termin beim Arzt vereinbaren."],
      ["Secrétaire", "Mardi à 14 heures, ça vous convient ?", "Dienstag um 14 Uhr, passt Ihnen das?"],
      ["Client", "Oui, parfait. Merci beaucoup. Au revoir.", "Ja, perfekt. Vielen Dank. Auf Wiedersehen."]
    ])
  ],
  x: [
    xg("Übung 1 – Arbeit und Telefon", "Exercice 1 – Travail et téléphone", [
      mc("Wie beendet man eine formelle E-Mail?", ["Salut !", "Cordialement,", "Ciao,", "Bisous,"], 1, "Cordialement = mit freundlichen Grüßen."),
      mc("*Ne quittez pas* bedeutet am Telefon …", ["Gehen Sie nicht weg.", "Bleiben Sie dran.", "Rufen Sie nicht an.", "Legen Sie auf."], 1, "Ne quittez pas = bleiben Sie dran."),
      mc("*Un rendez-vous* ist …", ["ein Vertrag", "ein Termin", "ein Gehalt", "ein Lebenslauf"], 1, "rendez-vous = Termin."),
      gap("Je voudrais ___ à Madame Martin. (sprechen)", "parler", "parler à."),
      gap("Je vous ___ plus tard. (zurückrufen)", "rappelle", "je vous rappelle."),
      gap("Voulez-vous laisser un ___ ? (Nachricht)", "message", "message."),
      ord(["Je", "voudrais", "prendre", "un", "rendez-vous", "."], "Je voudrais prendre un rendez-vous .", "Termin vereinbaren."),
      mat([["le bureau", "Büro"], ["le collègue", "Kollege"], ["le salaire", "Gehalt"], ["la réunion", "Besprechung"], ["postuler", "sich bewerben"]])
    ])
  ]
});
})();
