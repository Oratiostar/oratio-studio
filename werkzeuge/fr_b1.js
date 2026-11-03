// Französischkurs B1 – Lektionen.
(function(){
var D = FZ, p = D.p, h = D.h, tip = D.tip, warn = D.warn, ul = D.ul, tb = D.tb, ex = D.ex, voc = D.voc, dlg = D.dlg, mc = D.mc, gap = D.gap, ord = D.ord, mat = D.mat, xg = D.xg;

D.add({ id: "b1-subjonctif", lv: "B1", t: ["Der subjonctif présent", "Le subjonctif présent"], s: ["Bildung und Auslöser: Wunsch, Pflicht, Gefühl, Zweifel.", "Formes et emplois."], k: "subjonctif konjunktiv il faut que je veux que bien que pour que avant que",
  b: [
    p("Der **subjonctif** steht nach bestimmten Ausdrücken in einem Nebensatz mit **que**. Er drückt aus, dass etwas **gewünscht, nötig, gefühlt oder bezweifelt** wird – nicht einfach eine Tatsache."),
    h("Bildung"),
    p("Stamm der **ils**-Form im Präsens + **-e, -es, -e, -ions, -iez, -ent**. Für nous und vous entspricht er bei regelmäßigen Verben dem imparfait."),
    tb(["", "parler", "finir", "prendre"], [
      ["que je", "parle", "finisse", "prenne"], ["que tu", "parles", "finisses", "prennes"], ["qu'il", "parle", "finisse", "prenne"],
      ["que nous", "parlions", "finissions", "prenions"], ["que vous", "parliez", "finissiez", "preniez"], ["qu'ils", "parlent", "finissent", "prennent"]
    ]),
    h("Unregelmäßige Verben"),
    tb(["Infinitiv", "que je …", "que nous …"], [
      ["être", "sois", "soyons"], ["avoir", "aie", "ayons"], ["aller", "aille", "allions"], ["faire", "fasse", "fassions"],
      ["pouvoir", "puisse", "puissions"], ["savoir", "sache", "sachions"], ["vouloir", "veuille", "voulions"]
    ]),
    h("Wann steht der subjonctif?"),
    tb(["Auslöser", "Beispiel"], [
      ["Notwendigkeit: il faut que, il est important que", "Il faut que tu partes."],
      ["Wunsch, Wille: vouloir que, souhaiter que", "Je veux que tu viennes."],
      ["Gefühl: être content que, regretter que, avoir peur que", "Je suis content que tu sois là."],
      ["Zweifel: douter que, il est possible que", "Je doute qu'il vienne."],
      ["Konjunktionen: pour que, avant que, bien que, à condition que, jusqu'à ce que", "Je t'explique pour que tu comprennes."]
    ]),
    warn("Gleiches Subjekt in beiden Teilen → **Infinitiv** statt subjonctif: *Je veux partir.* (nicht: je veux que je parte). Bei verschiedenen Subjekten: *Je veux que tu partes.*"),
    tip("Bei **penser que / croire que / il est sûr que** (Sicherheit) steht der **indicatif**. In der Verneinung oder Frage dagegen oft der subjonctif: *Je ne pense pas qu'il soit prêt.*"),
    dlg("Avant le départ", [
      ["A", "Il faut que nous partions avant huit heures.", "Wir müssen vor acht Uhr losfahren."],
      ["B", "Bien que je sois fatigué, je suis prêt.", "Obwohl ich müde bin, bin ich bereit."],
      ["A", "Je veux que tu prennes ton passeport.", "Ich möchte, dass du deinen Pass mitnimmst."]
    ])
  ],
  x: [xg("Übung 1 – Subjonctif", "Exercice 1 – Subjonctif", [
    gap("Il faut que tu ___ . (partir)", "partes", "que tu partes."),
    gap("Je veux que vous ___ ici. (être)", "soyez", "soyez."),
    gap("Bien qu'il ___ malade, il travaille. (être)", "soit", "soit."),
    gap("Il faut que je ___ mes devoirs. (faire)", "fasse", "fasse."),
    gap("Je suis content que tu ___ là. (être)", "sois", "sois."),
    mc("Welcher Satz braucht den subjonctif?", ["Je pense qu'il vient.", "Il faut qu'il vienne.", "Je sais qu'il vient.", "Il dit qu'il vient."], 1, "il faut que → subjonctif."),
    mc("Gleiches Subjekt: Je veux ___ .", ["que je parte", "partir", "que partir", "je partir"], 1, "Infinitiv."),
    ord(["Il", "faut", "que", "nous", "partions", "."], "Il faut que nous partions .", "il faut que + subjonctif."),
    mat([["que je sois", "dass ich sei"], ["que j'aie", "dass ich habe"], ["que j'aille", "dass ich gehe"], ["que je fasse", "dass ich mache"], ["que je puisse", "dass ich könne"]])
  ])]
});

D.add({ id: "b1-plusqueparfait", lv: "B1", t: ["Plus-que-parfait und Zeitenfolge", "Le plus-que-parfait"], s: ["Vorvergangenheit: etwas war schon passiert.", "Antériorité dans le passé."], k: "plus-que-parfait vorvergangenheit j'avais mange j'etais alle zeitenfolge",
  b: [
    p("Das **plus-que-parfait** (Plusquamperfekt) beschreibt etwas, das **vor** einem anderen Ereignis in der Vergangenheit schon passiert war. Bildung: **imparfait von avoir/être + Partizip**."),
    tb(["avoir", "être"], [["j'avais mangé", "j'étais allé(e)"], ["tu avais fini", "tu étais arrivé(e)"], ["il avait fait", "il était parti"], ["nous avions vu", "nous étions restés"], ["vous aviez dit", "vous étiez venus"], ["ils avaient pris", "elles s'étaient levées"]]),
    ex([
      ["Quand je suis arrivé, le film avait déjà commencé.", "Als ich ankam, hatte der Film schon begonnen."],
      ["Elle m'a dit qu'elle avait perdu ses clés.", "Sie sagte mir, sie habe ihre Schlüssel verloren."],
      ["Nous étions déjà partis quand il a appelé.", "Wir waren schon gegangen, als er anrief."],
      ["Si j'avais su, je serais venu.", "Wenn ich es gewusst hätte, wäre ich gekommen.", "si + plus-que-parfait → conditionnel passé (irreale Vergangenheit)."]
    ]),
    h("Conditionnel passé"),
    p("**conditionnel von avoir/être + Partizip**: *j'aurais mangé, je serais parti.* Er drückt Unwirkliches in der Vergangenheit, Bedauern oder Vorwürfe aus."),
    ex([["J'aurais dû t'écouter.", "Ich hätte auf dich hören sollen."], ["Tu aurais pu m'aider !", "Du hättest mir helfen können!"]]),
    voc("Signalwörter", [["déjà", "schon"], ["pas encore", "noch nicht"], ["auparavant", "zuvor"], ["avant que / avant de", "bevor"], ["après avoir + Partizip", "nachdem"]])
  ],
  x: [xg("Übung 1 – Plus-que-parfait", "Exercice 1 – Plus-que-parfait", [
    gap("Quand je suis arrivé, il ___ déjà parti. (avoir/être, imp.)", "était", "il était parti."),
    gap("Elle avait ___ ses clés. (perdre)", "perdu", "perdu."),
    gap("Nous ___ déjà mangé. (avoir, imp.)", "avions", "nous avions."),
    gap("Si j'avais su, je ___ venu. (être, cond.)", "serais", "je serais venu."),
    mc("*J'avais fini* ist …", ["passé composé", "plus-que-parfait", "imparfait", "futur"], 1, "avais + Partizip."),
    mc("Irreale Vergangenheit: Si j'avais su, je …", ["viendrais", "serais venu", "suis venu", "venais"], 1, "conditionnel passé."),
    ord(["Il", "avait", "déjà", "fini", "quand", "je", "suis", "arrivé", "."], "Il avait déjà fini quand je suis arrivé .", "Vorvergangenheit."),
    mat([["j'avais vu", "ich hatte gesehen"], ["j'étais parti", "ich war gegangen"], ["j'aurais dû", "ich hätte sollen"], ["tu aurais pu", "du hättest können"]])
  ])]
});

D.add({ id: "b1-indirekt", lv: "B1", t: ["Indirekte Rede", "Le discours rapporté"], s: ["Aussagen, Fragen und Befehle wiedergeben; Zeitverschiebung.", "Rapporter ce qu'on a dit."], k: "indirekte rede discours rapporte il a dit que demande si zeitverschiebung",
  b: [
    p("Im Französischen wird die indirekte Rede mit dem **Indikativ** gebildet (nicht dem Konjunktiv wie im Deutschen). Steht das einleitende Verb in der Vergangenheit, **verschieben** sich Zeiten und Zeitangaben."),
    tb(["Direkt", "Indirekt (einleitendes Verb im Präsens)", "Indirekt (einleitendes Verb in der Vergangenheit)"], [
      ["« Je suis fatigué. »", "Il dit qu'il est fatigué.", "Il a dit qu'il **était** fatigué."],
      ["« J'ai fini. »", "Il dit qu'il a fini.", "Il a dit qu'il **avait fini**."],
      ["« Je partirai. »", "Il dit qu'il partira.", "Il a dit qu'il **partirait**."],
      ["« Je viens. »", "Il dit qu'il vient.", "Il a dit qu'il **venait**."]
    ]),
    h("Zeitangaben ändern sich"),
    tb(["direkt", "indirekt (Vergangenheit)"], [["aujourd'hui", "ce jour-là"], ["demain", "le lendemain"], ["hier", "la veille"], ["ici", "là"], ["maintenant", "alors"], ["la semaine prochaine", "la semaine suivante"]]),
    h("Fragen und Befehle"),
    ex([
      ["« Tu viens ? » → Il m'a demandé si je venais.", "Er fragte mich, ob ich komme."],
      ["« Que fais-tu ? » → Il m'a demandé ce que je faisais.", "Er fragte, was ich mache."],
      ["« Ferme la porte ! » → Il m'a dit de fermer la porte.", "Er sagte mir, ich solle die Tür schließen."]
    ]),
    tip("Fragewörter: **est-ce que / Ja-Nein** → *si*; **qu'est-ce que / que** → *ce que*; **qui est-ce qui** → *qui*; **qu'est-ce qui** → *ce qui*. Wortstellung wie im Aussagesatz, keine Inversion.")
  ],
  x: [xg("Übung 1 – Indirekte Rede", "Exercice 1 – Discours rapporté", [
    gap("Il a dit qu'il ___ fatigué. (être, imp.)", "était", "était."),
    gap("Elle a dit qu'elle ___ le lendemain. (partir, cond.)", "partirait", "partirait."),
    gap("Il m'a demandé ___ je venais. (ob)", "si", "si."),
    gap("Il m'a dit ___ fermer la porte. (zu)", "de", "dire de + Inf."),
    mc("« Demain » wird zu …", ["hier", "le lendemain", "aujourd'hui", "demain"], 1, "le lendemain."),
    mc("« Je pars. » → Il a dit qu'il …", ["part", "partait", "partira", "est parti"], 1, "partait."),
    ord(["Il", "a", "dit", "qu'", "il", "viendrait", "."], "Il a dit qu' il viendrait .", "Konditional als Futur der Vergangenheit."),
    mat([["la veille", "am Vortag"], ["le lendemain", "am Folgetag"], ["ce jour-là", "an jenem Tag"], ["alors", "damals/dann"]])
  ])]
});

D.add({ id: "b1-pronomen2", lv: "B1", t: ["Doppelte Pronomen und betonte Pronomen", "Pronoms combinés et toniques"], s: ["Reihenfolge: me le, le lui, y en; moi, toi, lui …", "Ordre des pronoms."], k: "doppelte pronomen reihenfolge je le lui donne betonte pronomen moi toi lui eux c'est moi",
  b: [
    p("Mehrere Pronomen stehen in einer festen Reihenfolge vor dem Verb."),
    tb(["1", "2", "3", "4", "5"], [["me, te, se, nous, vous", "le, la, les", "lui, leur", "y", "en"]], "Merke: *me/te/nous/vous* vor *le/la/les*, aber *le/la/les* vor *lui/leur*."),
    ex([
      ["Il me le donne.", "Er gibt es mir."],
      ["Je le lui ai dit.", "Ich habe es ihm gesagt."],
      ["Je les leur envoie.", "Ich schicke sie ihnen."],
      ["Il y en a trois.", "Es gibt drei davon."],
      ["Donne-le-moi !", "Gib es mir!", "Im bejahten Imperativ: Verb-le-moi (me → moi)."]
    ]),
    h("Betonte Pronomen"),
    tb(["Person", "Form", "Gebrauch"], [
      ["ich / du", "moi / toi", "C'est moi. · Toi, tu viens ? · avec moi"],
      ["er / sie", "lui / elle", "Je pense à lui. · chez elle"],
      ["wir / ihr", "nous / vous", "Nous, nous restons."],
      ["sie (Pl.)", "eux / elles", "Je parle d'eux."]
    ]),
    ul(["nach Präpositionen: *avec toi, pour eux, chez moi*", "zur Betonung: *Moi, je préfère le thé.*", "nach c'est: *C'est lui.*", "bei Vergleichen: *Il est plus grand que moi.*", "*moi aussi, moi non plus*", "*moi-même, toi-même* (selbst)"]),
    warn("Bei **penser à, songer à, s'intéresser à + Person** nimmt man **à + betontes Pronomen**: *Je pense à lui.* (nicht: je lui pense).")
  ],
  x: [xg("Übung 1 – Pronomen", "Exercice 1 – Pronoms", [
    gap("Il me ___ donne. (es)", "le", "me le."),
    gap("Je ___ ___ ai dit. (es ihm)", "le lui", "le lui."),
    gap("Viens avec ___ ! (mir)", "moi", "avec moi."),
    gap("C'est ___ . (er)", "lui", "C'est lui."),
    gap("Je pense à ___ . (ihn)", "lui", "penser à lui."),
    mc("Gib es mir!", ["Donne-moi-le !", "Donne-le-moi !", "Me le donne !", "Donne-me-le !"], 1, "Donne-le-moi."),
    mc("Richtige Reihenfolge:", ["Je lui le donne.", "Je le lui donne.", "Je donne le lui.", "Je le donne lui."], 1, "le vor lui."),
    ord(["Je", "le", "leur", "ai", "dit", "."], "Je le leur ai dit .", "Reihenfolge."),
    mat([["moi", "ich (betont)"], ["toi", "du (betont)"], ["lui", "er (betont)"], ["eux", "sie m. (betont)"], ["elles", "sie f. (betont)"]])
  ])]
});

D.add({ id: "b1-relativ2", lv: "B1", t: ["Zusammengesetzte Relativpronomen", "lequel, auquel, duquel"], s: ["Präposition + Relativpronomen: avec lequel, pour qui, ce qui, ce que, ce dont.", "Relatifs composés."], k: "relativpronomen lequel laquelle auquel duquel ce qui ce que ce dont ce a quoi",
  b: [
    p("Nach Präpositionen (avec, pour, dans, sur, sans …) benutzt man bei **Sachen** *lequel* (angeglichen), bei **Personen** meist *qui*."),
    tb(["", "m. Sg.", "f. Sg.", "m. Pl.", "f. Pl."], [["lequel", "lequel", "laquelle", "lesquels", "lesquelles"], ["à + lequel", "auquel", "à laquelle", "auxquels", "auxquelles"], ["de + lequel", "duquel", "de laquelle", "desquels", "desquelles"]]),
    ex([
      ["Le stylo avec lequel j'écris est cassé.", "Der Stift, mit dem ich schreibe, ist kaputt."],
      ["La personne avec qui je travaille est gentille.", "Die Person, mit der ich arbeite, ist nett."],
      ["Le projet auquel je pense est difficile.", "Das Projekt, an das ich denke, ist schwierig."],
      ["La maison près de laquelle j'habite est vieille.", "Das Haus, in dessen Nähe ich wohne, ist alt."]
    ]),
    h("Ohne Bezugswort: ce qui, ce que, ce dont, ce à quoi"),
    tb(["Pronomen", "Funktion", "Beispiel"], [
      ["ce qui", "Subjekt", "Je sais ce qui se passe."],
      ["ce que", "Objekt", "Dis-moi ce que tu veux."],
      ["ce dont", "de", "Voilà ce dont j'ai besoin."],
      ["ce à quoi", "à", "Je ne comprends pas ce à quoi il pense."]
    ]),
    tip("*dont* (de + Nomen) ist die kürzere Variante von *de + lequel* bei Personen und Sachen: *le livre dont je parle.* Bei **Besitz** heißt es **dont**: *l'homme dont la fille est médecin.*")
  ],
  x: [xg("Übung 1 – Relativpronomen", "Exercice 1 – Pronoms relatifs", [
    gap("Le stylo avec ___ j'écris… (Sache, m.)", "lequel", "lequel."),
    gap("La personne avec ___ je travaille… (Person)", "qui", "qui."),
    gap("Le projet ___ je pense… (à + lequel)", "auquel", "auquel."),
    gap("Je sais ___ se passe. (Subjekt)", "ce qui", "ce qui."),
    gap("Dis-moi ___ tu veux. (Objekt)", "ce que", "ce que."),
    mc("Voilà ___ j'ai besoin.", ["ce que", "ce qui", "ce dont", "ce à quoi"], 2, "avoir besoin de → ce dont."),
    mc("L'homme ___ la fille est médecin…", ["que", "dont", "qui", "où"], 1, "Besitz → dont."),
    ord(["La", "maison", "dans", "laquelle", "j'", "habite", "."], "La maison dans laquelle j' habite .", "Präposition + laquelle."),
    mat([["lequel", "welcher (m.)"], ["auxquelles", "denen (f. Pl.)"], ["duquel", "von dem"], ["ce dont", "wovon"]])
  ])]
});

D.add({ id: "b1-gerondif", lv: "B1", t: ["Gérondif und Partizip Präsens", "Le gérondif et le participe présent"], s: ["en + -ant: gleichzeitig, Art und Weise, Bedingung.", "Exprimer la simultanéité."], k: "gerondif participe present en parlant en marchant ant gleichzeitigkeit",
  b: [
    p("Das **gérondif** (**en + Verb-ant**) drückt aus, dass zwei Handlungen **gleichzeitig** passieren oder wie etwas geschieht. Das Subjekt ist in beiden Teilen dasselbe."),
    p("Bildung: Stamm der **nous**-Form + **-ant**: nous parlons → *en parlant*, nous finissons → *en finissant*, nous prenons → *en prenant*."),
    tb(["Ausnahmen", "gérondif"], [["être", "en étant"], ["avoir", "en ayant"], ["savoir", "en sachant"]]),
    ex([
      ["Il mange en regardant la télé.", "Er isst und sieht dabei fern."],
      ["Elle est tombée en courant.", "Sie ist beim Laufen gestürzt."],
      ["En travaillant bien, tu réussiras.", "Wenn du gut arbeitest, wirst du Erfolg haben.", "Bedingung."],
      ["Il a appris le français en écoutant des chansons.", "Er hat Französisch gelernt, indem er Lieder hörte.", "Mittel / Art und Weise."]
    ]),
    h("Partizip Präsens (ohne en)"),
    p("Ohne *en* ersetzt es oft einen Relativsatz, vor allem in der Schriftsprache: *Les élèves étudiant le français …* (= qui étudient). Das Adjektivparticip wird angeglichen: *une histoire amusante*."),
    warn("Nach **en** steht das Verb **nie** in einer anderen Form. Achtung: *Je l'ai vu en sortant* kann bedeuten, dass **ich** oder **er** ausging – bei Unklarheit lieber ein Relativsatz."),
    voc("Nützlich", [["tout en + -ant", "und dabei, obwohl"], ["en passant", "im Vorbeigehen"], ["en attendant", "in der Zwischenzeit"], ["chemin faisant", "unterwegs"]])
  ],
  x: [xg("Übung 1 – Gérondif", "Exercice 1 – Gérondif", [
    gap("Il mange en ___ la télé. (regarder)", "regardant", "regardant."),
    gap("Elle chante en ___ . (marcher)", "marchant", "marchant."),
    gap("En ___ bien, tu réussiras. (travailler)", "travaillant", "travaillant."),
    gap("En ___ à la maison, j'ai vu Paul. (rentrer)", "rentrant", "rentrant."),
    mc("Der gérondif von *finir*:", ["en finant", "en finissant", "en finisant", "en finissent"], 1, "nous finissons."),
    mc("Der gérondif von *être*:", ["en étant", "en être", "en sant", "en étais"], 0, "en étant."),
    ord(["Il", "apprend", "en", "écoutant", "des", "chansons", "."], "Il apprend en écoutant des chansons .", "Mittel."),
    mat([["en mangeant", "beim Essen"], ["en partant", "beim Weggehen"], ["en lisant", "beim Lesen"], ["en dormant", "beim Schlafen"]])
  ])]
});

D.add({ id: "b1-passiv", lv: "B1", t: ["Das Passiv und Alternativen", "La voix passive"], s: ["être + Partizip, par/de, on und reflexive Ersatzformen.", "Passif et équivalents."], k: "passiv voix passive etre participe par on se vend",
  b: [
    p("Das Passiv wird mit **être + Partizip** gebildet; das Partizip richtet sich nach dem Subjekt. Der Handelnde wird mit **par** (selten **de**) angeschlossen."),
    ex([
      ["Le livre est écrit par un auteur célèbre.", "Das Buch wird von einem berühmten Autor geschrieben."],
      ["La maison a été construite en 1990.", "Das Haus wurde 1990 gebaut."],
      ["Les clés seront trouvées demain.", "Die Schlüssel werden morgen gefunden."],
      ["Il est respecté de tous.", "Er wird von allen geachtet.", "de bei Gefühlen/Zuständen."]
    ]),
    tb(["Zeit", "Beispiel"], [["Präsens", "est fait"], ["passé composé", "a été fait"], ["imparfait", "était fait"], ["futur", "sera fait"], ["conditionnel", "serait fait"]]),
    h("Alternativen im Alltag"),
    p("Das Französische vermeidet das Passiv gern:"),
    ul(["**on** + aktiv: *On parle français ici.* (statt: Französisch wird hier gesprochen)", "**reflexiv**: *Ça se dit. Ça se vend bien. Le vin se boit frais.*", "**Aktiv** mit Subjektwechsel: *Un chien l'a mordu.* (statt: Er wurde von einem Hund gebissen)"]),
    warn("Nur **direkte Objekte** können Subjekt eines Passivsatzes werden: *Il donne un livre à Marie* → *Un livre est donné à Marie* (nicht: Marie est donnée…).")
  ],
  x: [xg("Übung 1 – Passiv", "Exercice 1 – Passif", [
    gap("La maison ___ construite en 1990. (a été / est)", "a été", "a été construite."),
    gap("Le livre est écrit ___ un auteur. (von)", "par", "par."),
    gap("Les clés ___ trouvées demain. (futur)", "seront", "seront."),
    gap("On ___ français ici. (parler)", "parle", "on parle."),
    mc("Reflexiver Ersatz: Das verkauft sich gut →", ["Ça vend bien.", "Ça se vend bien.", "Ça est vendu bien.", "Il vend bien."], 1, "se vendre."),
    mc("Wie steht das Partizip?", ["La porte est ouvert.", "La porte est ouverte.", "La porte est ouvrir.", "La porte a ouverte."], 1, "Angleichung."),
    ord(["La", "ville", "a", "été", "détruite", "."], "La ville a été détruite .", "passé composé passif."),
    mat([["est fait", "wird gemacht"], ["a été fait", "wurde gemacht"], ["sera fait", "wird gemacht werden"], ["serait fait", "würde gemacht"]])
  ])]
});

D.add({ id: "b1-konnektoren", lv: "B1", t: ["Verbinder und Meinung äußern", "Connecteurs et opinion"], s: ["Gegensatz, Grund, Folge, Zweck; seine Meinung höflich sagen.", "Argumenter simplement."], k: "konnektoren verbinder connecteurs cependant pourtant donc parce que car mais meinung a mon avis selon moi",
  b: [
    tb(["Funktion", "Verbinder"], [
      ["Grund", "parce que, car, puisque, comme, à cause de, grâce à"],
      ["Folge", "donc, alors, c'est pourquoi, par conséquent"],
      ["Gegensatz", "mais, pourtant, cependant, en revanche, alors que"],
      ["Zugeständnis", "bien que (+ subjonctif), même si, malgré"],
      ["Zweck", "pour (+ Inf.), pour que (+ subjonctif), afin de"],
      ["Reihenfolge", "d'abord, ensuite, puis, enfin, finalement"],
      ["Ergänzung", "de plus, en outre, par ailleurs, aussi"]
    ]),
    ex([
      ["Je reste à la maison parce qu'il pleut.", "Ich bleibe zu Hause, weil es regnet."],
      ["Il pleut, donc je prends mon parapluie.", "Es regnet, also nehme ich meinen Regenschirm."],
      ["Il est riche, pourtant il n'est pas heureux.", "Er ist reich, trotzdem ist er nicht glücklich."],
      ["Paul aime le sport, en revanche Marie préfère lire.", "Paul mag Sport, dagegen liest Marie lieber."],
      ["Grâce à toi, j'ai réussi.", "Dank dir habe ich es geschafft."]
    ]),
    h("Meinung äußern"),
    voc("Formules", [
      ["À mon avis, …", "Meiner Meinung nach, …"], ["Selon moi, …", "Meiner Ansicht nach, …"], ["Je pense que … / Je trouve que …", "Ich denke / finde, dass …"],
      ["Je suis d'accord (avec toi).", "Ich stimme (dir) zu."], ["Je ne suis pas d'accord.", "Ich bin nicht einverstanden."], ["Il me semble que …", "Mir scheint, dass …"], ["D'un côté … de l'autre …", "Einerseits … andererseits …"]
    ]),
    tip("Bei *parce que* steht eine Begründung auf die Frage „Warum?“. *Car* ist schriftlich und steht nie am Satzanfang. *Puisque* nennt einen Grund, der dem Gegenüber bekannt ist.")
  ],
  x: [xg("Übung 1 – Verbinder", "Exercice 1 – Connecteurs", [
    gap("Je reste ici ___ qu'il pleut. (weil)", "parce", "parce que."),
    gap("Il pleut, ___ je prends un parapluie. (also)", "donc", "donc."),
    gap("Il est riche, ___ il est malheureux. (trotzdem)", "pourtant", "pourtant."),
    gap("___ à toi, j'ai réussi. (Dank)", "Grâce", "grâce à."),
    mc("*Bien que* verlangt …", ["indicatif", "subjonctif", "futur", "Infinitiv"], 1, "bien que + subjonctif."),
    mc("„Dagegen“ heißt …", ["en revanche", "donc", "puisque", "enfin"], 0, "en revanche."),
    ord(["À", "mon", "avis", ",", "c'", "est", "une", "bonne", "idée", "."], "À mon avis , c' est une bonne idée .", "Meinung."),
    mat([["cependant", "jedoch"], ["de plus", "außerdem"], ["donc", "also"], ["finalement", "schließlich"], ["selon moi", "meiner Ansicht nach"]])
  ])]
});

D.add({ id: "b1-gesundheit", lv: "B1", t: ["Gesundheit und Arzt", "La santé et chez le médecin"], s: ["Körperteile, Symptome, Apotheke, Termin beim Arzt.", "Parler de sa santé."], k: "gesundheit arzt apotheke krank schmerzen fieber medicament sante corps tete mal",
  b: [
    voc("Le corps", [["la tête", "Kopf"], ["le dos", "Rücken"], ["le ventre", "Bauch"], ["la gorge", "Hals/Rachen"], ["la main / le bras", "Hand / Arm"], ["la jambe / le pied", "Bein / Fuß"], ["l'œil / les yeux", "Auge / Augen"], ["la dent", "Zahn"]]),
    h("Schmerzen ausdrücken"),
    ex([
      ["J'ai mal à la tête.", "Ich habe Kopfschmerzen.", "avoir mal à + Körperteil: à la, au, aux, à l'."],
      ["Il a mal au dos.", "Er hat Rückenschmerzen."],
      ["Elle a mal aux dents.", "Sie hat Zahnschmerzen."],
      ["Je me suis fait mal à la main.", "Ich habe mir die Hand wehgetan."]
    ]),
    voc("Symptômes", [["la fièvre", "Fieber"], ["la toux", "Husten"], ["le rhume", "Schnupfen"], ["la grippe", "Grippe"], ["fatigué(e)", "müde"], ["avoir des vertiges", "Schwindel haben"], ["allergique à", "allergisch gegen"]]),
    voc("Chez le médecin / à la pharmacie", [
      ["une ordonnance", "ein Rezept"], ["un médicament", "ein Medikament"], ["un comprimé", "eine Tablette"], ["prendre trois fois par jour", "dreimal täglich nehmen"],
      ["Qu'est-ce qui ne va pas ?", "Was fehlt Ihnen?"], ["Depuis quand avez-vous mal ?", "Seit wann haben Sie Schmerzen?"], ["Respirez profondément.", "Atmen Sie tief."]
    ]),
    warn("**Notfall in Frankreich:** 15 = SAMU (Rettungsdienst), 18 = Feuerwehr, 112 = europäischer Notruf."),
    dlg("Chez le médecin", [
      ["Médecin", "Qu'est-ce qui ne va pas ?", "Was fehlt Ihnen?"],
      ["Patient", "J'ai mal à la gorge et j'ai de la fièvre depuis deux jours.", "Ich habe Halsschmerzen und seit zwei Tagen Fieber."],
      ["Médecin", "Je vais vous examiner. Voici une ordonnance : un comprimé trois fois par jour.", "Ich untersuche Sie. Hier ein Rezept: eine Tablette dreimal täglich."]
    ])
  ],
  x: [xg("Übung 1 – Gesundheit", "Exercice 1 – Santé", [
    gap("J'ai mal ___ la tête. (à + la)", "à", "à la tête."),
    gap("Il a mal ___ dos. (à + le)", "au", "au dos."),
    gap("Elle a mal ___ dents. (à + les)", "aux", "aux dents."),
    gap("Le médecin donne une ___ . (Rezept)", "ordonnance", "ordonnance."),
    mc("*La toux* ist …", ["Fieber", "Husten", "Schnupfen", "Grippe"], 1, "toux = Husten."),
    mc("Die Rettung in Frankreich:", ["15", "17", "25", "99"], 0, "15 = SAMU."),
    ord(["J'", "ai", "mal", "à", "la", "gorge", "."], "J' ai mal à la gorge .", "mal à."),
    mat([["le dos", "Rücken"], ["la fièvre", "Fieber"], ["le rhume", "Schnupfen"], ["un comprimé", "Tablette"], ["la pharmacie", "Apotheke"]])
  ])]
});

D.add({ id: "b1-alltag", lv: "B1", t: ["Wohnung, Bank und Behörden", "Logement, banque, administration"], s: ["Miete, Reparaturen, Konto, Formulare, Beschwerden.", "Se débrouiller au quotidien."], k: "wohnung miete bank behoerde konto formular reparatur beschwerde loyer appartement mairie caf",
  b: [
    voc("Le logement", [["le loyer", "Miete"], ["les charges (f.)", "Nebenkosten"], ["le propriétaire", "Vermieter"], ["le locataire", "Mieter"], ["le bail", "Mietvertrag"], ["la caution", "Kaution"], ["déménager", "umziehen"], ["la panne", "Defekt, Panne"]]),
    voc("La banque et l'administration", [["ouvrir un compte", "ein Konto eröffnen"], ["le virement", "Überweisung"], ["la carte bancaire", "Bankkarte"], ["la mairie", "Rathaus"], ["la préfecture", "Präfektur"], ["un justificatif de domicile", "Wohnsitznachweis"], ["remplir un formulaire", "ein Formular ausfüllen"], ["un dossier", "Antragsmappe"]]),
    h("Ein Problem melden"),
    ex([
      ["Bonjour, le chauffage ne marche plus depuis hier.", "Guten Tag, die Heizung funktioniert seit gestern nicht mehr."],
      ["Pourriez-vous envoyer quelqu'un pour le réparer ?", "Könnten Sie jemanden schicken, um sie zu reparieren?"],
      ["Je voudrais faire une réclamation.", "Ich möchte mich beschweren."],
      ["Je souhaite résilier mon contrat.", "Ich möchte meinen Vertrag kündigen."]
    ]),
    dlg("À la banque", [
      ["Client", "Bonjour, je voudrais ouvrir un compte.", "Guten Tag, ich möchte ein Konto eröffnen."],
      ["Conseiller", "Très bien. Avez-vous une pièce d'identité et un justificatif de domicile ?", "Gut. Haben Sie einen Ausweis und einen Wohnsitznachweis?"],
      ["Client", "Oui, voici mon passeport et une facture d'électricité.", "Ja, hier ist mein Pass und eine Stromrechnung."]
    ]),
    tip("In französischen Behörden zählt Höflichkeit: immer mit *Bonjour Madame/Monsieur* beginnen und siezen (*vous*).")
  ],
  x: [xg("Übung 1 – Alltag", "Exercice 1 – Quotidien", [
    gap("Le ___ est de 600 euros par mois. (Miete)", "loyer", "le loyer."),
    gap("Je voudrais ouvrir un ___ . (Konto)", "compte", "compte."),
    gap("Je voudrais faire une ___ . (Beschwerde)", "réclamation", "réclamation."),
    gap("Je souhaite ___ mon contrat. (kündigen)", "résilier", "résilier."),
    mc("*Le justificatif de domicile* ist …", ["Reisepass", "Wohnsitznachweis", "Mietvertrag", "Kontoauszug"], 1, "justificatif de domicile."),
    mc("*Le propriétaire* ist …", ["Mieter", "Vermieter", "Nachbar", "Hausmeister"], 1, "propriétaire = Vermieter/Eigentümer."),
    ord(["Le", "chauffage", "ne", "marche", "plus", "."], "Le chauffage ne marche plus .", "ne … plus."),
    mat([["le virement", "Überweisung"], ["la caution", "Kaution"], ["déménager", "umziehen"], ["la mairie", "Rathaus"], ["le bail", "Mietvertrag"]])
  ])]
});
})();
