// Französischkurs B2 – Lektionen.
(function(){
var D = FZ, p = D.p, h = D.h, tip = D.tip, warn = D.warn, ul = D.ul, tb = D.tb, ex = D.ex, voc = D.voc, dlg = D.dlg, mc = D.mc, gap = D.gap, ord = D.ord, mat = D.mat, xg = D.xg;

D.add({ id: "b2-subj2", lv: "B2", t: ["Subjonctif passé und Feinheiten", "Le subjonctif passé et les nuances"], s: ["Vorzeitigkeit im subjonctif; Indikativ oder subjonctif?", "Indicatif ou subjonctif ?"], k: "subjonctif passe que j'aie fini que je sois parti indikativ oder subjonctif apres que",
  b: [
    p("Der **subjonctif passé** (avoir/être im subjonctif + Partizip) drückt aus, dass die Handlung **vor** der Haupthandlung abgeschlossen ist."),
    ex([
      ["Je suis content que tu aies réussi.", "Ich freue mich, dass du bestanden hast."],
      ["Bien qu'il soit parti tôt, il est arrivé en retard.", "Obwohl er früh losgefahren ist, kam er zu spät."],
      ["Il faut que tu aies fini avant midi.", "Du musst bis Mittag fertig sein."],
      ["J'ai peur qu'elle ne soit tombée.", "Ich fürchte, sie ist gestürzt."]
    ]),
    h("Indikativ oder subjonctif?"),
    tb(["Ausdruck", "Modus", "Beispiel"], [
      ["après que", "Indikativ", "Après qu'il est parti, j'ai ri."],
      ["avant que", "subjonctif", "Avant qu'il parte, parle-lui."],
      ["parce que, puisque", "Indikativ", "Je reste parce qu'il pleut."],
      ["pour que, afin que", "subjonctif", "Je parle fort pour que tu entendes."],
      ["je pense que", "Indikativ", "Je pense qu'il viendra."],
      ["je ne pense pas que", "subjonctif", "Je ne pense pas qu'il vienne."],
      ["il semble que / il me semble que", "subjonctif / Indikativ", "Il semble qu'il soit tard. · Il me semble qu'il est tard."],
      ["le seul / le premier / le meilleur que", "subjonctif", "C'est le meilleur film que j'aie vu."]
    ]),
    warn("**après que** steht – trotz häufiger Fehler auch bei Franzosen – korrekt mit dem **Indikativ**."),
    tip("Der subjonctif imparfait (qu'il fût) existiert nur noch in sehr gehobener Schrift. Im Alltag und in Prüfungen genügen subjonctif présent und passé.")
  ],
  x: [xg("Übung 1 – Subjonctif", "Exercice 1 – Subjonctif", [
    gap("Je suis content que tu ___ réussi. (avoir, subj.)", "aies", "aies réussi."),
    gap("Bien qu'il ___ parti tôt… (être, subj.)", "soit", "soit parti."),
    gap("Je ne pense pas qu'il ___ . (venir)", "vienne", "vienne."),
    gap("Après qu'il ___ parti, j'ai ri. (est/soit)", "est", "après que + Indikativ."),
    mc("*Avant que* + …", ["Indikativ", "subjonctif", "futur", "Infinitiv"], 1, "subjonctif."),
    mc("*Après que* + …", ["subjonctif", "Indikativ", "Imperativ", "conditionnel"], 1, "Indikativ."),
    ord(["C'", "est", "le", "meilleur", "film", "que", "j'", "aie", "vu", "."], "C' est le meilleur film que j' aie vu .", "Superlativ + subjonctif."),
    mat([["que j'aie fait", "dass ich gemacht habe"], ["que je sois venu", "dass ich gekommen bin"], ["pour que", "damit"], ["bien que", "obwohl"]])
  ])]
});

D.add({ id: "b2-hypothese", lv: "B2", t: ["Hypothesen und Bedingungen", "L'hypothèse et la condition"], s: ["Alle si-Typen, au cas où, à condition que, sauf si, même si.", "Exprimer la condition."], k: "hypothese bedingung si conditionnel passe au cas ou a condition que sauf si meme si pourvu que",
  b: [
    tb(["Typ", "si-Satz", "Hauptsatz", "Beispiel"], [
      ["real", "si + présent", "présent / futur / impératif", "Si tu veux, viens."],
      ["irreal Gegenwart", "si + imparfait", "conditionnel présent", "Si j'avais le temps, je viendrais."],
      ["irreal Vergangenheit", "si + plus-que-parfait", "conditionnel passé", "Si j'avais su, je serais venu."]
    ]),
    h("Weitere Bedingungsausdrücke"),
    tb(["Ausdruck", "Konstruktion", "Beispiel"], [
      ["à condition que / pourvu que", "+ subjonctif", "Je viens, à condition que tu conduises."],
      ["à condition de", "+ Infinitiv", "Tu réussiras à condition de travailler."],
      ["au cas où", "+ conditionnel", "Prends un parapluie au cas où il pleuvrait."],
      ["sauf si / à moins que", "+ Indikativ / + subjonctif", "Nous irons, sauf s'il pleut. · … à moins qu'il ne pleuve."],
      ["même si", "+ Indikativ", "Même s'il pleut, je sors."],
      ["en cas de", "+ Nomen", "En cas de problème, appelez-moi."],
      ["selon que … ou que", "+ Indikativ", "Selon qu'il pleut ou qu'il fait beau …"]
    ]),
    ex([
      ["J'aurais accepté si on me l'avait proposé.", "Ich hätte angenommen, wenn man es mir angeboten hätte."],
      ["Au cas où tu serais en retard, préviens-moi.", "Falls du dich verspätest, sag mir Bescheid."],
      ["Si j'avais étudié, je serais médecin aujourd'hui.", "Wenn ich studiert hätte, wäre ich heute Arzt.", "Gemischter Fall: Vergangenheit → Gegenwart."]
    ]),
    warn("Nach **si** steht nie futur oder conditionnel. Aber: *Je me demande si tu viendras.* (indirekte Frage = „ob“) darf das futur haben.")
  ],
  x: [xg("Übung 1 – Hypothese", "Exercice 1 – Hypothèse", [
    gap("Si j'avais su, je ___ venu. (être, cond.)", "serais", "je serais venu."),
    gap("Au cas où il ___ , prends un parapluie. (pleuvoir, cond.)", "pleuvrait", "pleuvrait."),
    gap("Je viens, à ___ que tu conduises.", "condition", "à condition que."),
    gap("Je me demande si tu ___ . (venir, futur)", "viendras", "indirekte Frage."),
    mc("Nach *à condition que* steht …", ["Indikativ", "subjonctif", "futur", "conditionnel"], 1, "subjonctif."),
    mc("*Sauf si* + …", ["subjonctif", "Indikativ", "Infinitiv", "Partizip"], 1, "Indikativ."),
    ord(["Même", "s'", "il", "pleut", ",", "je", "sors", "."], "Même s' il pleut , je sors .", "même si + Indikativ."),
    mat([["au cas où", "falls"], ["à moins que", "es sei denn"], ["en cas de", "im Falle von"], ["pourvu que", "vorausgesetzt dass"]])
  ])]
});

D.add({ id: "b2-konzession", lv: "B2", t: ["Gegensatz, Folge, Zweck, Grund", "Concession, conséquence, but, cause"], s: ["Fortgeschrittene Verbinder für Texte und Diskussionen.", "Connecteurs avancés."], k: "gegensatz folge zweck grund concession consequence but cause malgre bien que si bien que de sorte que tellement que",
  b: [
    tb(["Funktion", "Ausdruck", "Beispiel"], [
      ["Zugeständnis", "bien que, quoique + subj.", "Bien qu'il soit jeune, il est compétent."],
      ["Zugeständnis", "malgré, en dépit de + Nomen", "Malgré la pluie, nous sommes sortis."],
      ["Zugeständnis", "quand même, tout de même", "Il pleut, mais je sors quand même."],
      ["Folge", "si bien que, de sorte que + Ind.", "Il a plu, si bien que le match est annulé."],
      ["Folge", "tellement … que, si … que", "Il est tellement fatigué qu'il dort."],
      ["Folge", "donc, par conséquent, c'est pourquoi", "…, par conséquent nous partons."],
      ["Zweck", "pour que, afin que + subj.", "Je répète pour que tu comprennes."],
      ["Zweck", "afin de, de peur de + Inf.", "Il se tait de peur de se tromper."],
      ["Grund", "étant donné que, vu que, du fait que", "Vu que tu es là, restons."],
      ["Grund", "grâce à (positiv), à cause de (negativ)", "Grâce à lui, j'ai réussi."]
    ]),
    ex([
      ["Il travaille beaucoup, de sorte qu'il réussit toujours.", "Er arbeitet viel, sodass er immer Erfolg hat."],
      ["Quoiqu'il fasse froid, elle sort sans manteau.", "Obwohl es kalt ist, geht sie ohne Mantel hinaus."],
      ["En raison de la grève, les trains sont annulés.", "Aufgrund des Streiks fallen die Züge aus."]
    ]),
    tip("Faustregel: **Folge → Indikativ** (Tatsache: si bien que, tellement que), **Zweck → subjonctif** (Absicht: pour que, de sorte que bei Absicht).")
  ],
  x: [xg("Übung 1 – Verbinder", "Exercice 1 – Connecteurs", [
    gap("___ la pluie, nous sommes sortis. (trotz)", "Malgré", "malgré."),
    gap("Il est ___ fatigué qu'il dort. (so)", "tellement", "tellement … que."),
    gap("___ à lui, j'ai réussi. (Dank)", "Grâce", "grâce à."),
    gap("Je répète pour que tu ___ . (comprendre)", "comprennes", "subjonctif."),
    mc("Folge, Tatsache →", ["pour que", "si bien que", "bien que", "afin de"], 1, "si bien que + Indikativ."),
    mc("*Quoique* + …", ["Indikativ", "subjonctif", "futur", "Gerund"], 1, "subjonctif."),
    ord(["Vu", "que", "tu", "es", "là", ",", "restons", "."], "Vu que tu es là , restons .", "Grund."),
    mat([["à cause de", "wegen (negativ)"], ["en dépit de", "trotz"], ["afin de", "um zu"], ["par conséquent", "folglich"]])
  ])]
});

D.add({ id: "b2-partizip", lv: "B2", t: ["Partizipialkonstruktionen und Nominalisierung", "Participe, infinitif, nominalisation"], s: ["Kürzer schreiben: Partizip Perfekt, après avoir, en ayant, Nomen statt Verb.", "Style plus dense."], k: "partizip perfekt apres avoir infinitif passe nominalisation participe passe construction absolue etant donne",
  b: [
    p("Im Schriftlichen und in formellen Texten ersetzt man Nebensätze durch kompaktere Strukturen."),
    tb(["Struktur", "Beispiel", "Entspricht"], [
      ["après avoir / être + Partizip", "Après avoir fini, il est parti.", "Après qu'il a fini, il est parti."],
      ["Partizip Perfekt allein", "Arrivé à Paris, il a appelé.", "Quand il est arrivé…"],
      ["Partizip Präsens", "Ayant faim, il a mangé.", "Comme il avait faim…"],
      ["en ayant + Partizip", "En ayant lu le livre, j'ai compris.", "Parce que j'ai lu…"],
      ["avant de + Infinitiv", "Avant de partir, ferme la porte.", "Avant que tu partes…"],
      ["sans + Infinitiv", "Il est parti sans dire au revoir.", "Il est parti et n'a pas dit…"],
      ["pour + Infinitiv passé", "Il est puni pour avoir menti.", "…parce qu'il a menti."]
    ]),
    h("Nominalisierung"),
    ex([
      ["Quand il est arrivé → À son arrivée", "Bei seiner Ankunft"],
      ["Parce qu'il a échoué → En raison de son échec", "Aufgrund seines Scheiterns"],
      ["Si tu changes → En cas de changement", "Im Falle einer Änderung"]
    ]),
    warn("Bei diesen Strukturen muss das **Subjekt** von Haupt- und Nebensatz gleich sein: *Après avoir mangé, il est parti* (er aß und ging). Sonst Fehler."),
    tip("In Aufsätzen wirkt ein Wechsel zwischen Nebensätzen und diesen Strukturen elegant – gleich viele Nebensätze wirken schwerfällig.")
  ],
  x: [xg("Übung 1 – Verdichten", "Exercice 1 – Condenser", [
    gap("___ avoir fini, il est parti. (Nachdem)", "Après", "après avoir."),
    gap("___ de partir, ferme la porte. (Bevor)", "Avant", "avant de."),
    gap("Il est parti ___ dire au revoir. (ohne)", "sans", "sans."),
    gap("Il est puni ___ avoir menti. (weil er)", "pour", "pour avoir."),
    mc("„Bei seiner Ankunft“ →", ["à son arrivée", "dans son arrivée", "en arrivant le", "pour arriver"], 0, "à son arrivée."),
    mc("Nach *avant de* steht …", ["Infinitiv", "subjonctif", "Partizip", "futur"], 0, "Infinitiv."),
    ord(["Arrivé", "à", "Paris", ",", "il", "a", "appelé", "."], "Arrivé à Paris , il a appelé .", "Partizip."),
    mat([["après avoir", "nachdem"], ["avant de", "bevor"], ["sans", "ohne"], ["en raison de", "aufgrund"]])
  ])]
});

D.add({ id: "b2-vergleich", lv: "B2", t: ["Vergleiche, Verhältnis und Mengen", "Comparaison, proportion, quantité"], s: ["plus … plus, autant que, de moins en moins, Mengenangaben.", "Nuancer les comparaisons."], k: "vergleich steigerung plus plus de plus en plus autant que d'autant plus que de moins en moins",
  b: [
    tb(["Ausdruck", "Beispiel"], [
      ["plus / moins … que", "Il est plus grand que moi."],
      ["aussi / autant … que", "Elle est aussi grande que lui. · Il travaille autant que moi."],
      ["plus de / moins de / autant de + Nomen", "Elle a plus d'amis que moi."],
      ["de plus en plus / de moins en moins", "Il fait de plus en plus froid."],
      ["plus … plus / moins … moins", "Plus on lit, plus on apprend."],
      ["d'autant plus que", "Je suis d'autant plus content que tu sois là."],
      ["de même que / ainsi que", "Lui ainsi que sa sœur sont venus."],
      ["le plus / le moins / le mieux", "C'est le plus beau jour de ma vie."]
    ]),
    ex([
      ["Plus il travaille, plus il réussit.", "Je mehr er arbeitet, desto mehr Erfolg hat er."],
      ["Il parle de mieux en mieux.", "Er spricht immer besser."],
      ["Cette voiture est bien plus chère que l'autre.", "Dieses Auto ist viel teurer als das andere."]
    ]),
    warn("*bon → meilleur*, *bien → mieux*. Aber *plus mauvais / pire* und *plus mal*: *Il joue mieux que moi.* (bien) – *C'est meilleur.* (bon)."),
    voc("Quantités", [["beaucoup de", "viel"], ["peu de", "wenig"], ["la plupart de", "die meisten"], ["la moitié de", "die Hälfte"], ["un tiers / un quart", "ein Drittel / ein Viertel"], ["environ", "ungefähr"], ["au moins / au plus", "mindestens / höchstens"]])
  ],
  x: [xg("Übung 1 – Vergleiche", "Exercice 1 – Comparaisons", [
    gap("Il fait de ___ en plus froid. (mehr)", "plus", "de plus en plus."),
    gap("___ on lit, plus on apprend.", "Plus", "plus … plus."),
    gap("Il joue ___ que moi. (besser, bien)", "mieux", "mieux."),
    gap("C'est ___ que l'autre. (besser, bon)", "meilleur", "meilleur."),
    mc("*De moins en moins* =", ["immer weniger", "immer mehr", "nie mehr", "weniger als"], 0, "immer weniger."),
    mc("*La plupart de* =", ["die wenigsten", "die meisten", "die Hälfte", "alle"], 1, "die meisten."),
    ord(["Elle", "a", "plus", "d'", "amis", "que", "moi", "."], "Elle a plus d' amis que moi .", "plus de."),
    mat([["au moins", "mindestens"], ["environ", "ungefähr"], ["la moitié", "Hälfte"], ["de mieux en mieux", "immer besser"]])
  ])]
});

D.add({ id: "b2-argument", lv: "B2", t: ["Argumentieren und Diskutieren", "Argumenter et débattre"], s: ["These, Argument, Beispiel, Gegenargument, Schluss; Redemittel.", "Structurer un point de vue."], k: "argumentieren diskutieren erorterung dissertation these antithese conclusion debat zustimmen widersprechen",
  b: [
    p("Eine gute Argumentation hat eine klare Struktur: **Einleitung → These → Argumente mit Beispielen → Gegenargument → Schluss**."),
    voc("Redemittel", [
      ["Il s'agit de savoir si …", "Es geht um die Frage, ob …"], ["Tout d'abord, … Ensuite, … Enfin, …", "Zuerst … Dann … Schließlich …"], ["Prenons l'exemple de …", "Nehmen wir das Beispiel …"],
      ["Certes, … mais …", "Zwar … aber …"], ["On pourrait objecter que …", "Man könnte einwenden, dass …"], ["Il faut nuancer ce propos.", "Das muss man differenzieren."],
      ["En ce qui concerne …", "Was … betrifft"], ["En conclusion, … / Pour conclure, …", "Abschließend …"], ["Je partage votre avis. / Je ne partage pas votre avis.", "Ich teile (nicht) Ihre Meinung."],
      ["Dans l'ensemble, …", "Insgesamt …"], ["Il va de soi que …", "Es versteht sich, dass …"]
    ]),
    h("Beispielstruktur"),
    ul(["**Einleitung:** *De nos jours, le télétravail est de plus en plus répandu. Est-ce vraiment un progrès ?*", "**These:** *À mon avis, il présente plus d'avantages que d'inconvénients.*", "**Argument 1:** *D'abord, il permet de gagner du temps.* **Beispiel:** *Prenons l'exemple d'un salarié qui …*", "**Gegenargument:** *Certes, l'isolement peut poser problème, mais …*", "**Schluss:** *En conclusion, à condition de bien s'organiser, le télétravail est bénéfique.*"]),
    tip("Im Französischen schätzt man den **klaren Aufbau**. Kurze Sätze, ein Gedanke pro Absatz und gute Übergänge machen mehr Eindruck als schwierige Wörter.")
  ],
  x: [xg("Übung 1 – Argumentieren", "Exercice 1 – Argumenter", [
    gap("___ , l'isolement est un problème, mais… (Zwar)", "Certes", "certes."),
    gap("___ conclure, je dirais… (Um)", "Pour", "pour conclure."),
    gap("___ l'exemple de Paris. (Nehmen wir)", "Prenons", "prenons."),
    gap("Je ne ___ pas votre avis. (teilen)", "partage", "partager."),
    mc("Schluss einleiten:", ["Tout d'abord", "En conclusion", "Certes", "Par exemple"], 1, "en conclusion."),
    mc("Gegenargument:", ["On pourrait objecter que …", "Voilà !", "Par conséquent", "Enfin"], 0, "objecter."),
    ord(["Il", "s'", "agit", "de", "savoir", "si", "c'", "est", "utile", "."], "Il s' agit de savoir si c' est utile .", "Fragestellung."),
    mat([["certes", "zwar"], ["en ce qui concerne", "was … betrifft"], ["nuancer", "differenzieren"], ["objecter", "einwenden"]])
  ])]
});

D.add({ id: "b2-register", lv: "B2", t: ["Umgangssprache, Verlan und Register", "Registres de langue"], s: ["Formell, neutral, familiär; typische Alltagswörter und Abkürzungen.", "Français familier et soutenu."], k: "umgangssprache verlan register familier argot bouquin fric boulot mec nana ouf registre",
  b: [
    tb(["Standard", "familier", "soutenu"], [
      ["le livre", "le bouquin", "l'ouvrage"], ["la voiture", "la bagnole", "l'automobile"], ["le travail", "le boulot", "l'emploi"],
      ["l'argent", "le fric", "les fonds"], ["manger", "bouffer", "se restaurer"], ["très fatigué", "crevé", "épuisé"],
      ["l'ami", "le pote / le copain", "l'ami"], ["un enfant", "un gamin", "un enfant"], ["partir", "se barrer", "s'en aller"], ["beaucoup", "plein de / un tas de", "énormément"]
    ]),
    h("Typische Merkmale des gesprochenen Französisch"),
    ul(["**ne** fällt oft weg: *Je sais pas. Il y a pas de problème → Y a pas de problème.*", "**tu** statt Inversion in Fragen: *Tu viens ?* statt *Viens-tu ?*", "**on** statt nous: *On y va ?*", "Abkürzungen: *ado, resto, ordi, appart, sympa, télé*", "**Verlan** (Silben vertauscht): *meuf* (femme), *ouf* (fou), *chelou* (louche), *relou* (lourd)"]),
    h("Formelle Höflichkeit"),
    ex([
      ["Je vous prie de bien vouloir m'excuser.", "Ich bitte Sie, mich zu entschuldigen."],
      ["Auriez-vous l'amabilité de me renseigner ?", "Wären Sie so freundlich, mir Auskunft zu geben?"],
      ["Je vous remercie de votre compréhension.", "Ich danke Ihnen für Ihr Verständnis."]
    ]),
    warn("Umgangssprache ist in Prüfungen, Bewerbungen und gegenüber Fremden tabu. Als Lerner lieber **neutral** bleiben und Umgangssprache erst verstehen, dann sparsam nutzen.")
  ],
  x: [xg("Übung 1 – Register", "Exercice 1 – Registres", [
    mc("*Le boulot* =", ["Buch", "Arbeit (familiär)", "Brot", "Auto"], 1, "boulot = Arbeit."),
    mc("*Le fric* =", ["Kühlschrank", "Geld (familiär)", "Freund", "Frisch"], 1, "fric = Geld."),
    mc("*Chelou* ist Verlan von …", ["louche", "lourd", "fou", "femme"], 0, "louche."),
    mc("Höflich in einer E-Mail:", ["Salut !", "Je vous prie de bien vouloir m'excuser.", "Désolé !", "Pardon mec !"], 1, "formell."),
    gap("Tu viens ___ ? (Frage mit Intonation)", "?", "Intonation."),
    gap("___ y va ? (wir, familiär)", "On", "on."),
    ord(["Je", "vous", "prie", "de", "m'", "excuser", "."], "Je vous prie de m' excuser .", "formell."),
    mat([["le pote", "Kumpel"], ["la bagnole", "Karre"], ["bouffer", "futtern"], ["crevé", "kaputt"], ["sympa", "nett"]])
  ])]
});

D.add({ id: "b2-medien", lv: "B2", t: ["Medien, Gesellschaft und Umwelt", "Médias, société et environnement"], s: ["Wortschatz für Texte, Nachrichten und Debatten.", "Vocabulaire pour débattre."], k: "medien gesellschaft umwelt nachrichten zeitung klima technologie politik medias societe environnement",
  b: [
    voc("Les médias", [["les actualités / l'info", "Nachrichten"], ["un journal / un quotidien", "Zeitung / Tageszeitung"], ["un article", "Artikel"], ["un journaliste", "Journalist"], ["les réseaux sociaux", "soziale Netzwerke"], ["une fausse information", "Falschmeldung"], ["la presse", "Presse"], ["un reportage", "Reportage"]]),
    voc("La société", [["l'inégalité (f.)", "Ungleichheit"], ["le chômage", "Arbeitslosigkeit"], ["le logement", "Wohnraum"], ["l'éducation (f.)", "Bildung"], ["la santé publique", "öffentliche Gesundheit"], ["un citoyen", "Bürger"], ["le vote", "Wahl"], ["la grève", "Streik"]]),
    voc("L'environnement", [["le réchauffement climatique", "Klimaerwärmung"], ["les énergies renouvelables", "erneuerbare Energien"], ["la pollution", "Verschmutzung"], ["le recyclage", "Recycling"], ["les déchets", "Müll"], ["durable", "nachhaltig"], ["les émissions de CO₂", "CO₂-Ausstoß"], ["protéger", "schützen"]]),
    ex([
      ["Les réseaux sociaux influencent l'opinion publique.", "Soziale Netzwerke beeinflussen die öffentliche Meinung."],
      ["Il faut réduire nos émissions de CO₂.", "Wir müssen unseren CO₂-Ausstoß senken."],
      ["Cette information est fausse : elle a été démentie.", "Diese Information ist falsch: sie wurde dementiert."]
    ]),
    dlg("Un débat", [
      ["A", "Penses-tu que les réseaux sociaux soient dangereux ?", "Hältst du soziale Netzwerke für gefährlich?"],
      ["B", "Certes, il y a des risques, mais ils permettent aussi de s'informer rapidement.", "Zwar gibt es Risiken, aber sie erlauben auch, sich schnell zu informieren."],
      ["A", "À condition de vérifier les sources !", "Vorausgesetzt, man prüft die Quellen!"]
    ])
  ],
  x: [xg("Übung 1 – Wortschatz", "Exercice 1 – Vocabulaire", [
    mc("*Le réchauffement climatique* =", ["Klimaerwärmung", "Wetterbericht", "Heizung", "Recycling"], 0, "Klimaerwärmung."),
    mc("*Une fausse information* =", ["Nachricht", "Falschmeldung", "Artikel", "Quelle"], 1, "Falschmeldung."),
    mc("*Durable* =", ["haltbar/nachhaltig", "dunkel", "hart", "teuer"], 0, "nachhaltig."),
    gap("Il faut ___ la nature. (schützen)", "protéger", "protéger."),
    gap("Les ___ renouvelables. (Energien)", "énergies", "énergies."),
    gap("La ___ des enseignants. (Streik)", "grève", "grève."),
    ord(["Il", "faut", "réduire", "la", "pollution", "."], "Il faut réduire la pollution .", "il faut + Inf."),
    mat([["les déchets", "Müll"], ["le citoyen", "Bürger"], ["le vote", "Wahl"], ["l'inégalité", "Ungleichheit"], ["le reportage", "Reportage"]])
  ])]
});
})();
