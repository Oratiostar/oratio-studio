// Deutschkurs A2 – Teil 1
(function(){
var D = DE, p = D.p, h = D.h, tip = D.tip, warn = D.warn, ul = D.ul, tb = D.tb, ex = D.ex, voc = D.voc, dlg = D.dlg, mc = D.mc, gap = D.gap, ord = D.ord, mat = D.mat, xg = D.xg;

D.add({ id: "a2-dativ", lv: "A2", t: ["Der Dativ", "Le datif"], s: ["Dativ-Artikel, Pronomen, Verben mit Dativ, Dativ + Akkusativ.", "Articles au datif, pronoms, verbes avec datif, datif + accusatif."], k: "dativ indirektes objekt helfen gehören gefallen geben schenken dem der den datif complément indirect",
  b: [
    p("Der **Dativ** ist der Fall für das **indirekte Objekt** („wem?“): „Ich gebe **dem Kind** einen Apfel.“ = je donne une pomme **à l'enfant**. Außerdem folgen ihm bestimmte Präpositionen und Verben.", "Le **datif** est le cas du **complément d'objet indirect** (« à qui ? ») : « Ich gebe **dem Kind** einen Apfel. » De plus, certaines prépositions et certains verbes l'exigent."),
    tb(["", "maskulin", "feminin", "neutral", "Plural"], [["Nominativ", "der Mann", "die Frau", "das Kind", "die Kinder"], ["Akkusativ", "den Mann", "die Frau", "das Kind", "die Kinder"], ["**Dativ**", "{{dem}} Mann", "{{der}} Frau", "{{dem}} Kind", "{{den}} Kinder**n**"], ["Nominativ (unbestimmt)", "ein Mann", "eine Frau", "ein Kind", "– Kinder"], ["**Dativ (unbestimmt)**", "{{einem}} Mann", "{{einer}} Frau", "{{einem}} Kind", "– Kinder**n**"], ["**Dativ (kein/mein …)**", "{{keinem}} / {{meinem}}", "{{keiner}} / {{meiner}}", "{{keinem}} / {{meinem}}", "{{keinen}} / {{meinen}} + n"]]),
    p("Im **Dativ Plural** bekommt das Nomen ein **-n** (den Kinder**n**, den Freunde**n**), außer es endet schon auf -n oder -s (den Frauen, den Autos).", "Au **datif pluriel** le nom prend un **-n** (den Kinder**n**), sauf s'il finit déjà par -n ou -s (den Frauen, den Autos)."),
    h("Personalpronomen", "Pronoms personnels"),
    tb(["Nominativ", "ich", "du", "er", "sie", "es", "wir", "ihr", "sie / Sie"], [["Akkusativ", "mich", "dich", "ihn", "sie", "es", "uns", "euch", "sie / Sie"], ["**Dativ**", "{{mir}}", "{{dir}}", "{{ihm}}", "{{ihr}}", "{{ihm}}", "{{uns}}", "{{euch}}", "{{ihnen}} / {{Ihnen}}"]]),
    h("Präpositionen mit Dativ", "Prépositions avec le datif"),
    p("**aus, bei, mit, nach, seit, von, zu, gegenüber, ab** – immer Dativ. Zusammenzüge: **zu dem = zum**, **zu der = zur**, **bei dem = beim**, **von dem = vom**.", "**aus, bei, mit, nach, seit, von, zu, gegenüber, ab** – toujours le datif. Contractions : **zu dem = zum**, **zu der = zur**, **bei dem = beim**, **von dem = vom**."),
    ex([["Ich fahre mit dem Zug zur Arbeit.", "Je vais au travail en train."], ["Nach dem Essen gehen wir zu meiner Tante.", "Après le repas nous allons chez ma tante."], ["Seit einem Jahr wohne ich bei meinen Eltern.", "Depuis un an j'habite chez mes parents."]]),
    h("Verben mit Dativ", "Verbes avec le datif"),
    voc("Nur Dativ", [["helfen", "aider", "Ich helfe dir."], ["gefallen", "plaire", "Das Bild gefällt mir."], ["gehören", "appartenir", "Das Buch gehört mir."], ["danken", "remercier", "Ich danke Ihnen."], ["schmecken", "avoir bon goût", "Die Suppe schmeckt mir."], ["passen", "aller (taille)", "Die Hose passt mir."], ["antworten", "répondre", "Er antwortet dem Lehrer."], ["gratulieren", "féliciter", "Ich gratuliere dir."], ["fehlen", "manquer", "Du fehlst mir."], ["weh tun", "faire mal", "Mir tut der Kopf weh."]]),
    warn("Vorsicht, Falle: „Ich vermisse dich“ (Akk.) – aber „Du fehlst **mir**“ (Dat.). Und: „**Mir** ist kalt“, „**Mir** geht es gut“ – Dativ bei Befinden! Im Französischen entspricht das oft einem anderen Konstruktionstyp („j'ai froid“).", "Piège : « Ich vermisse dich » (Akk.) – mais « Du fehlst **mir** » (Dat.). Et : « **Mir** ist kalt », « **Mir** geht es gut » – datif pour l'état ! En français : « j'ai froid »."),
    h("Dativ + Akkusativ im Satz", "Datif + accusatif dans la phrase"),
    p("Verben wie **geben, schenken, zeigen, schicken, bringen, erklären** haben beide Objekte. **Reihenfolge**: Nomen: **Dativ vor Akkusativ**; Pronomen: **Akkusativ vor Dativ**; bei zwei Pronomen: **Akkusativ vor Dativ**.", "Des verbes comme **geben, schenken, zeigen, schicken, bringen, erklären** ont deux compléments. **Ordre** : deux noms : **datif avant accusatif** ; nom + pronom : **le pronom d'abord** ; deux pronoms : **accusatif avant datif**."),
    tb(["", "Beispiel"], [["Nomen + Nomen", "Ich schenke **meiner Mutter** **einen Kuchen**."], ["Nomen + Pronomen", "Ich schenke **ihn** meiner Mutter."], ["Pronomen + Nomen", "Ich schenke **ihr** einen Kuchen."], ["Pronomen + Pronomen", "Ich schenke **ihn ihr**."]]),
    ex([["Der Lehrer erklärt den Schülern die Regel.", "Le professeur explique la règle aux élèves."], ["Kannst du mir das Salz geben?", "Peux-tu me passer le sel ?"], ["Ich zeige dir die Stadt.", "Je te montre la ville."]])
  ],
  x: [
    xg("Artikel im Dativ", "Articles au datif", [
      gap("Ich helfe ___ Mann. (der)", ["dem"]), gap("Er gibt ___ Frau ein Buch. (die)", ["der"]), gap("Wir schenken ___ Kind einen Ball. (das)", ["dem"]), gap("Ich spreche mit ___ Kindern. (die)", ["den"]), gap("Sie wohnt bei ___ Eltern. (ihre)", ["ihren"]), gap("Wir fahren mit ___ Auto. (ein)", ["einem"])
    ]),
    xg("Pronomen im Dativ", "Pronoms au datif", [
      gap("Ich helfe ___. (du)", ["dir"]), gap("Das Buch gehört ___. (ich)", ["mir"]), gap("Der Film gefällt ___. (wir)", ["uns"]), gap("Ich danke ___. (Sie, höflich)", ["Ihnen"]), gap("Er schenkt ___ Blumen. (sie, Sg.)", ["ihr"]), gap("Ich erkläre ___ die Regel. (sie, Pl.)", ["ihnen"])
    ]),
    xg("Verständnis", "Compréhension", [
      mc(["Welcher Satz ist richtig?", "Quelle phrase est correcte ?"], ["Ich helfe dich.", "Ich helfe dir.", "Ich helfe du.", "Ich helfe dein."], 1),
      mc(["Welche Präposition verlangt den Akkusativ?", "Quelle préposition exige l'accusatif ?"], ["mit", "für", "bei", "von"], 1),
      ord(["Ich", "gebe", "dem", "Kind", "einen", "Apfel."], "Ich gebe dem Kind einen Apfel."), ord(["Ich", "schenke", "ihn", "meiner", "Mutter."], "Ich schenke ihn meiner Mutter.")
    ])
  ] });

D.add({ id: "a2-wechsel", lv: "A2", t: ["Wechselpräpositionen: wo? oder wohin?", "Prépositions mixtes : wo ? ou wohin ?"], s: ["in, an, auf, über, unter, vor, hinter, neben, zwischen – Dativ oder Akkusativ.", "in, an, auf, über, unter, vor, hinter, neben, zwischen – datif ou accusatif."], k: "wechselpräpositionen in an auf über unter vor hinter neben zwischen stellen stehen legen liegen hängen prépositions mixtes lieu direction",
  b: [
    p("Neun Präpositionen können Dativ **oder** Akkusativ verlangen: **in, an, auf, über, unter, vor, hinter, neben, zwischen**. Die Frage entscheidet:", "Neuf prépositions peuvent exiger le datif **ou** l'accusatif : **in, an, auf, über, unter, vor, hinter, neben, zwischen**. La question décide :"),
    tb(["Frage", "Kasus", "Situation", "Beispiel"], [["**Wo?**", "Dativ", "Position, kein Ortswechsel", "Das Buch liegt **auf dem** Tisch."], ["**Wohin?**", "Akkusativ", "Bewegung, Richtung", "Ich lege das Buch **auf den** Tisch."]]),
    tb(["Präposition", "Bedeutung", "Wo? (Dativ)", "Wohin? (Akkusativ)"], [["in", "dans", "Ich bin **im** Park (in dem)", "Ich gehe **in den** Park."], ["an", "à, contre, au bord de", "Das Bild hängt **an der** Wand.", "Ich hänge das Bild **an die** Wand."], ["auf", "sur", "Die Katze sitzt **auf dem** Sofa.", "Die Katze springt **auf das** Sofa."], ["über", "au-dessus de", "Die Lampe hängt **über dem** Tisch.", "Er hängt die Lampe **über den** Tisch."], ["unter", "sous", "Der Hund liegt **unter dem** Tisch.", "Er kriecht **unter den** Tisch."], ["vor", "devant", "Das Auto steht **vor dem** Haus.", "Er fährt **vor das** Haus."], ["hinter", "derrière", "Der Garten ist **hinter dem** Haus.", "Er geht **hinter das** Haus."], ["neben", "à côté de", "Ich sitze **neben dir**.", "Setz dich **neben mich**."], ["zwischen", "entre", "Das Café liegt **zwischen der** Bank und **dem** Park.", "Ich stelle den Tisch **zwischen die** Stühle."]]),
    p("Zusammenzüge: in dem = **im**, in das = **ins**, an dem = **am**, an das = **ans**, auf das = **aufs**.", "Contractions : in dem = **im**, in das = **ins**, an dem = **am**, an das = **ans**, auf das = **aufs**."),
    h("Verben der Position und der Bewegung", "Verbes de position et de mouvement"),
    tb(["Position (Wo? + Dativ)", "Bewegung (Wohin? + Akkusativ)"], [["stehen – Die Flasche **steht** auf dem Tisch.", "stellen – Ich **stelle** die Flasche auf den Tisch."], ["liegen – Das Buch **liegt** im Regal.", "legen – Ich **lege** das Buch ins Regal."], ["hängen – Das Bild **hängt** an der Wand.", "hängen – Ich **hänge** das Bild an die Wand."], ["sitzen – Ich **sitze** auf dem Stuhl.", "(sich) setzen – Ich **setze** mich auf den Stuhl."], ["stecken – Der Schlüssel **steckt** in der Tür.", "stecken – Ich **stecke** den Schlüssel in die Tasche."]]),
    warn("Beachte: **stehen/liegen/sitzen** sind **starke** Verben (stand, lag, saß), **stellen/legen/setzen** sind **schwache** Verben mit einem Objekt. Im Französischen sagt man oft einfach „mettre“ – im Deutschen musst du zwischen stellen, legen, setzen und stecken wählen!", "**stehen/liegen/sitzen** sont des verbes **forts**, **stellen/legen/setzen** des verbes **faibles** avec un objet. En français on dit « mettre » – en allemand il faut choisir entre stellen, legen, setzen et stecken !"),
    ex([["Wo ist mein Handy? – Es liegt auf dem Sofa.", "Où est mon portable ? – Il est sur le canapé."], ["Wohin gehst du? – Ich gehe in die Stadt.", "Où vas-tu ? – Je vais en ville."], ["Die Kinder spielen im Garten.", "Les enfants jouent dans le jardin."], ["Stell die Tasche bitte neben die Tür.", "Pose le sac à côté de la porte, s'il te plaît."]]),
    tip("**Wohin?** + Bewegung = Akkusativ: „Ich gehe **in die** Schule.“ **Wo?** + Zustand = Dativ: „Ich bin **in der** Schule.“ Bei Städten und Ländern ohne Artikel: **in Paris** (wo), **nach Paris** (wohin).", "**Wohin ?** + mouvement = accusatif : « Ich gehe **in die** Schule. » **Wo ?** + état = datif : « Ich bin **in der** Schule. » Pour les villes sans article : **in Paris** (où), **nach Paris** (vers où).")
  ],
  x: [
    xg("Wo oder wohin?", "Wo ou wohin ?", [
      gap("Ich lege das Buch auf ___ Tisch. (der)", ["den"]), gap("Das Buch liegt auf ___ Tisch. (der)", ["dem"]), gap("Wir gehen in ___ Kino. (das)", ["das|ins"]), gap("Wir sind in ___ Kino. (das)", ["dem|im"]), gap("Das Bild hängt an ___ Wand. (die)", ["der"]), gap("Ich hänge das Bild an ___ Wand. (die)", ["die"]), gap("Der Hund liegt unter ___ Stuhl. (der)", ["dem"]), gap("Er stellt die Lampe neben ___ Sofa. (das)", ["das"])
    ]),
    xg("Stehen oder stellen?", "stehen ou stellen ?", [
      gap("Die Vase ___ auf dem Tisch. (stehen)", ["steht"]), gap("Ich ___ die Vase auf den Tisch. (stellen)", ["stelle"]), gap("Das Handy ___ auf dem Bett. (liegen)", ["liegt"]), gap("Ich ___ das Handy auf das Bett. (legen)", ["lege"]),
      mc(["„Wohin?“ verlangt …", "« Wohin ? » exige …"], ["Dativ", "Akkusativ", "Genitiv", "Nominativ"], 1)
    ])
  ] });

D.add({ id: "a2-perfekt", lv: "A2", t: ["Das Perfekt", "Le parfait (passé composé)"], s: ["Vergangenheit im Gespräch: haben/sein + Partizip II.", "Le passé à l'oral : haben/sein + participe II."], k: "perfekt partizip vergangenheit haben sein gegessen gegangen ge- passé composé participe passé",
  b: [
    p("Das **Perfekt** ist die wichtigste Vergangenheit **im Gespräch** und in privaten Nachrichten. Es besteht aus **haben** oder **sein** (Position 2) + **Partizip II** (Satzende).", "Le **parfait** est le passé principal **à l'oral** et dans les messages privés. Il se forme avec **haben** ou **sein** (position 2) + **participe II** (fin de phrase)."),
    ex([["Ich **habe** gestern einen Film **gesehen**.", "J'ai vu un film hier."], ["Wir **sind** nach Berlin **gefahren**.", "Nous sommes allés à Berlin."], ["Hast du schon **gegessen**?", "As-tu déjà mangé ?"]]),
    h("Das Partizip II", "Le participe II"),
    tb(["Typ", "Bildung", "Beispiel"], [["regelmäßig (schwach)", "**ge-** + Stamm + **-t**", "machen → **ge**mach**t**, lernen → **ge**lern**t**"], ["unregelmäßig (stark)", "**ge-** + (veränderter) Stamm + **-en**", "sehen → **ge**seh**en**, trinken → **ge**trunk**en**, gehen → **ge**gang**en**"], ["trennbar", "Präfix + **ge** + Stamm", "auf**ge**standen, an**ge**rufen, ein**ge**kauft"], ["untrennbar (be-, ent-, er-, ge-, ver-, zer-)", "**kein ge-**", "besucht, verstanden, erzählt, vergessen"], ["Verben auf **-ieren**", "**kein ge-**, Endung -t", "studiert, telefoniert, passiert"], ["Stamm auf -t, -d", "+ -et", "gearbeitet, gebadet, gewartet"]]),
    warn("Das Partizip II hat **kein Suffix wie „-é“**: Es gibt **starke** Verben mit Vokalwechsel – du musst sie lernen (siehe Liste im Nachschlage-Bereich): sehen – sah – **gesehen**, nehmen – nahm – **genommen**.", "Le participe II n'a pas de suffixe unique comme « -é » : les verbes **forts** changent de voyelle et s'apprennent par cœur (voir la liste de référence) : sehen – sah – **gesehen**."),
    h("haben oder sein?", "haben ou sein ?"),
    p("**sein** benutzt man bei Verben der **Bewegung** (gehen, fahren, kommen, fliegen, laufen) und der **Zustandsänderung** (aufstehen, einschlafen, werden, sterben, wachsen) sowie bei **sein, bleiben, passieren, geschehen**. **haben** benutzt man bei allen anderen – auch bei **transitiven** Verben (mit Akkusativobjekt).", "**sein** s'emploie avec les verbes de **mouvement** (gehen, fahren, kommen, fliegen, laufen) et de **changement d'état** (aufstehen, einschlafen, werden, sterben, wachsen), ainsi que **sein, bleiben, passieren, geschehen**. **haben** pour tous les autres – y compris les verbes **transitifs**."),
    tb(["mit sein", "mit haben"], [["gehen → ist gegangen", "machen → hat gemacht"], ["fahren → ist gefahren (ohne Objekt)", "fahren → hat das Auto gefahren (mit Objekt)"], ["kommen → ist gekommen", "essen → hat gegessen"], ["bleiben → ist geblieben", "schlafen → hat geschlafen"], ["aufstehen → ist aufgestanden", "arbeiten → hat gearbeitet"], ["sein → ist gewesen", "haben → hat gehabt"], ["werden → ist geworden", "lesen → hat gelesen"]]),
    tip("Im Süden Deutschlands, in Österreich und in der Schweiz sagt man auch „**Ich bin gesessen / gestanden / gelegen**“ statt „ich habe gesessen“ – beides ist je nach Region richtig.", "Dans le sud de l'Allemagne, en Autriche et en Suisse on dit aussi « **Ich bin gesessen / gestanden / gelegen** » – les deux sont corrects selon la région."),
    ex([["Gestern bin ich um 6 Uhr aufgestanden und habe gefrühstückt.", "Hier je me suis levé à 6 h et j'ai pris le petit-déjeuner."], ["Am Wochenende haben wir Freunde besucht und sind spazieren gegangen.", "Le week-end nous avons rendu visite à des amis et sommes allés nous promener."], ["Was hast du im Urlaub gemacht? – Ich bin viel gewandert und habe viele Fotos gemacht.", "Qu'as-tu fait en vacances ? – J'ai beaucoup randonné et pris beaucoup de photos."]]),
    h("Satzstellung im Perfekt", "Ordre des mots au parfait"),
    p("Das Hilfsverb steht auf **Position 2**, das **Partizip II ganz am Ende**: „Ich habe **heute Morgen** einen Brief **geschrieben**.“ Im Nebensatz steht das Hilfsverb **nach** dem Partizip: „…, weil ich einen Brief **geschrieben habe**.“", "L'auxiliaire est en **position 2**, le **participe II tout à la fin** : « Ich habe **heute Morgen** einen Brief **geschrieben**. » Dans la subordonnée l'auxiliaire est **après** le participe : « …, weil ich einen Brief **geschrieben habe**. »")
  ],
  x: [
    xg("Partizip II", "Participe II", [
      gap("machen → ge___", ["macht"]), gap("lernen → ge___", ["lernt"]), gap("sehen → ge___", ["sehen"]), gap("trinken → ge___", ["trunken"]), gap("aufstehen → ___", ["aufgestanden"]), gap("besuchen → ___", ["besucht"]), gap("studieren → ___", ["studiert"]), gap("arbeiten → ge___", ["arbeitet"])
    ]),
    xg("haben oder sein?", "haben ou sein ?", [
      gap("Ich ___ nach Hause gegangen.", ["bin"]), gap("Wir ___ Pizza gegessen.", ["haben"]), gap("Er ___ gestern gekommen.", ["ist"]), gap("Sie ___ gut geschlafen.", ["hat"]), gap("Ihr ___ lange geblieben.", ["seid"]), gap("Ich ___ einen Brief geschrieben.", ["habe"])
    ]),
    xg("Sätze", "Phrases", [
      ord(["Ich", "habe", "gestern", "einen", "Film", "gesehen."], "Ich habe gestern einen Film gesehen."), ord(["Wir", "sind", "nach", "Berlin", "gefahren."], "Wir sind nach Berlin gefahren."), ord(["Hast", "du", "schon", "gegessen?"], "Hast du schon gegessen?")
    ])
  ] });

D.add({ id: "a2-praeteritum", lv: "A2", t: ["Präteritum von sein, haben und Modalverben", "Prétérit de sein, haben et des modaux"], s: ["war, hatte, konnte, musste, wollte – die wichtigsten Formen.", "war, hatte, konnte, musste, wollte – les formes essentielles."], k: "präteritum war hatte konnte musste wollte sein haben modalverben imparfait prétérit",
  b: [
    p("Für **sein, haben** und die **Modalverben** benutzt man im Gespräch meistens das **Präteritum** (nicht das Perfekt): „Ich **war** gestern krank.“ – „Ich **hatte** keine Zeit.“ – „Ich **musste** arbeiten.“", "Pour **sein, haben** et les **modaux** on utilise surtout le **prétérit** à l'oral (pas le parfait) : « Ich **war** gestern krank. » – « Ich **hatte** keine Zeit. »"),
    tb(["", "sein", "haben", "können", "müssen", "wollen", "dürfen", "sollen", "werden"], [["ich", "war", "hatte", "konnte", "musste", "wollte", "durfte", "sollte", "wurde"], ["du", "warst", "hattest", "konntest", "musstest", "wolltest", "durftest", "solltest", "wurdest"], ["er/sie/es", "war", "hatte", "konnte", "musste", "wollte", "durfte", "sollte", "wurde"], ["wir", "waren", "hatten", "konnten", "mussten", "wollten", "durften", "sollten", "wurden"], ["ihr", "wart", "hattet", "konntet", "musstet", "wolltet", "durftet", "solltet", "wurdet"], ["sie/Sie", "waren", "hatten", "konnten", "mussten", "wollten", "durften", "sollten", "wurden"]]),
    tip("Bei den Modalverben **fällt der Umlaut weg**: können → konnte, müssen → musste, dürfen → durfte. Im Präteritum haben **ich** und **er/sie/es** die **gleiche Form**.", "Pour les modaux, **l'inflexion disparaît** : können → konnte, müssen → musste, dürfen → durfte. Au prétérit **ich** et **er/sie/es** ont la **même forme**."),
    ex([["Gestern war ich im Kino. Der Film war toll.", "Hier j'étais au cinéma. Le film était super."], ["Wir hatten keinen Hunger, deshalb sind wir nicht ins Restaurant gegangen.", "Nous n'avions pas faim, c'est pourquoi nous ne sommes pas allés au restaurant."], ["Er konnte nicht kommen, weil er arbeiten musste.", "Il n'a pas pu venir parce qu'il devait travailler."], ["Als Kind wollte ich Pilot werden.", "Enfant, je voulais devenir pilote."]]),
    p("Für andere Verben benutzt man im Gespräch das **Perfekt** (siehe vorherige Lektion). Das **Präteritum** aller Verben lernst du in B1 – es ist die Zeit der **Erzählung** (Zeitung, Roman).", "Pour les autres verbes on utilise le **parfait** à l'oral (voir la leçon précédente). Le **prétérit** de tous les verbes s'étudie en B1 – c'est le temps du **récit** (journal, roman).")
  ],
  x: [
    xg("Präteritum", "Prétérit", [
      gap("Gestern ___ ich müde. (sein)", ["war"]), gap("Wir ___ keine Zeit. (haben)", ["hatten"]), gap("Er ___ nicht kommen. (können)", ["konnte"]), gap("Du ___ arbeiten. (müssen)", ["musstest"]), gap("Ihr ___ im Urlaub. (sein)", ["wart"]), gap("Ich ___ nach Hause gehen. (wollen)", ["wollte"]), gap("Sie ___ nicht schwimmen. (dürfen, Pl.)", ["durften"]), gap("Du ___ gestern krank. (sein)", ["warst"])
    ]),
    xg("Zuordnen", "Associer", [
      mat([["ich kann", "ich konnte"], ["ich muss", "ich musste"], ["ich habe", "ich hatte"], ["ich bin", "ich war"], ["ich will", "ich wollte"]])
    ])
  ] });

D.add({ id: "a2-reflexiv", lv: "A2", t: ["Reflexive Verben", "Les verbes pronominaux"], s: ["sich freuen, sich waschen, sich interessieren – mit mich, dich, sich …", "sich freuen, sich waschen, sich interessieren – avec mich, dich, sich …"], k: "reflexiv reflexive verben sich mich dich sich freuen interessieren treffen verbes pronominaux",
  b: [
    p("Reflexive Verben benutzen ein **Reflexivpronomen**, das sich auf das Subjekt bezieht. Sie sind im Französischen ähnlich wie die **verbes pronominaux** (se laver, se lever).", "Les verbes réfléchis utilisent un **pronom réfléchi** qui renvoie au sujet. Ils ressemblent aux **verbes pronominaux** français (se laver, se lever)."),
    tb(["Person", "Akkusativ", "Dativ (mit Akk.-Objekt)"], [["ich", "mich", "mir"], ["du", "dich", "dir"], ["er/sie/es", "sich", "sich"], ["wir", "uns", "uns"], ["ihr", "euch", "euch"], ["sie/Sie", "sich", "sich"]]),
    ex([["Ich freue mich auf das Wochenende.", "Je me réjouis du week-end."], ["Er wäscht sich. – Er wäscht sich die Hände.", "Il se lave. – Il se lave les mains.", "mit Akkusativobjekt → Dativ-Pronomen"], ["Wir treffen uns um acht Uhr.", "Nous nous retrouvons à huit heures."], ["Interessierst du dich für Musik?", "T'intéresses-tu à la musique ?"]]),
    voc("Wichtige reflexive Verben", [["sich waschen / duschen / anziehen", "se laver / se doucher / s'habiller"], ["sich setzen", "s'asseoir"], ["sich treffen", "se retrouver"], ["sich freuen (auf + Akk. / über + Akk.)", "se réjouir de (à venir / de qc de présent)"], ["sich interessieren (für + Akk.)", "s'intéresser à"], ["sich erinnern (an + Akk.)", "se souvenir de"], ["sich beschweren (über + Akk.)", "se plaindre de"], ["sich entschuldigen", "s'excuser"], ["sich fühlen", "se sentir"], ["sich erholen", "se reposer"], ["sich ärgern (über + Akk.)", "se fâcher de"], ["sich verabschieden", "dire au revoir"]]),
    warn("Nicht jedes französische „se“-Verb ist im Deutschen reflexiv und umgekehrt: „sich **befinden**“ = se trouver; „**aufwachen**“ = se réveiller (nicht reflexiv!); „**sich** ausruhen“ ✓, aber „**aufstehen**“ = se lever (nicht reflexiv). Und: „Ich **freue mich**“ ist reflexiv, „Ich **gratuliere dir**“ nicht.", "Tous les verbes pronominaux français ne sont pas réfléchis en allemand : « **aufwachen** » = se réveiller (pas réfléchi !), « **aufstehen** » = se lever (pas réfléchi). « Ich **freue mich** » est réfléchi, « Ich **gratuliere dir** » non."),
    p("Im **Perfekt** gehört das Reflexivpronomen hinter das Hilfsverb: „Ich **habe mich** sehr **gefreut**.“ Im **Nebensatz**: „…, weil ich **mich** sehr **gefreut habe**.“", "Au **parfait** le pronom suit l'auxiliaire : « Ich **habe mich** sehr **gefreut**. » Dans la **subordonnée** : « …, weil ich **mich** sehr **gefreut habe**. »")
  ],
  x: [
    xg("Reflexivpronomen", "Pronoms réfléchis", [
      gap("Ich freue ___ auf den Urlaub.", ["mich"]), gap("Du interessierst ___ für Sport.", ["dich"]), gap("Er wäscht ___ die Hände. (Dativ)", ["sich"]), gap("Wir treffen ___ um acht.", ["uns"]), gap("Ihr müsst ___ beeilen.", ["euch"]), gap("Ich wasche ___ die Haare. (Dativ)", ["mir"]), gap("Sie entschuldigt ___ für die Verspätung.", ["sich"])
    ]),
    xg("Satz", "Phrase", [
      ord(["Ich", "habe", "mich", "sehr", "gefreut."], "Ich habe mich sehr gefreut."), ord(["Wir", "treffen", "uns", "um", "acht", "Uhr."], "Wir treffen uns um acht Uhr."),
      mc(["Welches Verb ist im Deutschen NICHT reflexiv?", "Quel verbe n'est PAS réfléchi en allemand ?"], ["sich waschen", "sich freuen", "aufstehen", "sich treffen"], 2)
    ])
  ] });

D.add({ id: "a2-adjektiv", lv: "A2", t: ["Adjektivendungen", "Les terminaisons des adjectifs"], s: ["der große Tisch, ein großer Tisch – Endungen nach bestimmtem und unbestimmtem Artikel.", "der große Tisch, ein großer Tisch – terminaisons après article défini et indéfini."], k: "adjektiv deklination endungen groß schön neue alte adjectif déclinaison terminaison e en",
  b: [
    p("Steht das Adjektiv **vor dem Nomen**, bekommt es eine **Endung**. Welche Endung, hängt von **Genus, Kasus** und vom **Artikel** ab. Es gibt nur **zwei** Endungen: **-e** und **-en** – mit wenigen Ausnahmen.", "Quand l'adjectif est **devant le nom**, il prend une **terminaison**, qui dépend du **genre**, du **cas** et de l'**article**. Il n'y a que **deux** terminaisons : **-e** et **-en** – avec quelques exceptions."),
    h("Nach dem bestimmten Artikel (der, die, das)", "Après l'article défini (der, die, das)"),
    tb(["", "maskulin", "feminin", "neutral", "Plural"], [["Nominativ", "der groß**e** Tisch", "die groß**e** Lampe", "das groß**e** Haus", "die groß**en** Häuser"], ["Akkusativ", "den groß**en** Tisch", "die groß**e** Lampe", "das groß**e** Haus", "die groß**en** Häuser"], ["Dativ", "dem groß**en** Tisch", "der groß**en** Lampe", "dem groß**en** Haus", "den groß**en** Häusern"]]),
    p("Eselsbrücke: Nach „der/die/das“ ist die Endung **-e** (Nominativ Singular alle Genera, Akkusativ feminin und neutral). **Überall sonst -en.**", "Astuce : après « der/die/das » la terminaison est **-e** (nominatif singulier, accusatif fém. et neutre). **Partout ailleurs -en.**"),
    h("Nach dem unbestimmten Artikel (ein, kein, mein …)", "Après l'article indéfini (ein, kein, mein …)"),
    tb(["", "maskulin", "feminin", "neutral", "Plural"], [["Nominativ", "ein groß**er** Tisch", "eine groß**e** Lampe", "ein groß**es** Haus", "keine groß**en** Häuser"], ["Akkusativ", "einen groß**en** Tisch", "eine groß**e** Lampe", "ein groß**es** Haus", "keine groß**en** Häuser"], ["Dativ", "einem groß**en** Tisch", "einer groß**en** Lampe", "einem groß**en** Haus", "keinen groß**en** Häusern"]]),
    p("Hier hat das Adjektiv die Endung, die der **Artikel nicht zeigt**: Wo der unbestimmte Artikel keine Endung hat (**ein** Tisch, **ein** Haus), übernimmt das Adjektiv sie: **-er** (der), **-es** (das).", "Ici l'adjectif prend la terminaison que **l'article ne montre pas** : là où l'article indéfini n'a pas de terminaison (**ein** Tisch, **ein** Haus), l'adjectif la prend : **-er** (masc.), **-es** (neutre)."),
    ex([["Ich kaufe einen neuen Mantel und eine warme Mütze.", "J'achète un nouveau manteau et un bonnet chaud."], ["Das ist ein sehr gutes Buch.", "C'est un très bon livre."], ["Mit meinem alten Auto fahre ich zur Arbeit.", "Je vais au travail avec ma vieille voiture."], ["Die kleinen Kinder spielen im großen Garten.", "Les petits enfants jouent dans le grand jardin."]]),
    warn("Besonderheiten: **hoch** → hoh- (ein hoher Berg); **teuer** → teur- (ein teures Auto); **dunkel** → dunkl- (eine dunkle Nacht). Farben wie **lila, rosa, orange** bekommen **keine** Endung: eine lila Jacke. Adjektive nach **sein/werden/bleiben** bekommen **nie** eine Endung.", "Particularités : **hoch** → hoh- (ein hoher Berg) ; **teuer** → teur- ; **dunkel** → dunkl-. Les couleurs **lila, rosa, orange** ne prennent **pas** de terminaison. Après **sein/werden/bleiben** : **jamais** de terminaison."),
    tip("Wenn mehrere Adjektive hintereinander stehen, bekommen **alle die gleiche Endung**: ein klein**er**, rot**er** Wagen; die klein**en**, rot**en** Wagen.", "Quand plusieurs adjectifs se suivent, ils prennent **tous la même terminaison** : ein kleiner, roter Wagen ; die kleinen, roten Wagen.")
  ],
  x: [
    xg("Nach bestimmtem Artikel", "Après l'article défini", [
      gap("Der alt___ Mann ist nett.", ["e"]), gap("Ich sehe den alt___ Mann.", ["en"]), gap("Das neu___ Haus ist groß.", ["e"]), gap("Ich wohne in dem neu___ Haus.", ["en"]), gap("Die klein___ Kinder spielen.", ["en"]), gap("Sie hilft der alt___ Frau.", ["en"])
    ]),
    xg("Nach unbestimmtem Artikel", "Après l'article indéfini", [
      gap("Das ist ein gut___ Buch.", ["es"]), gap("Ich habe einen neu___ Computer.", ["en"]), gap("Das ist ein schön___ Tag.", ["er"]), gap("Sie hat eine rot___ Tasche.", ["e"]), gap("Wir haben keine alt___ Autos.", ["en"]), gap("Er wohnt in einem klein___ Haus.", ["en"])
    ]),
    xg("Verständnis", "Compréhension", [
      mc(["Das Wetter ist ___ . (nach sein)", "Le temps est ___ . (après sein)"], ["schön", "schöne", "schönes", "schönen"], 0),
      mc(["Eine ___ Jacke. (lila)", "Une veste ___ . (lila)"], ["lila", "lilae", "lilane", "lilaes"], 0)
    ])
  ] });

D.add({ id: "a2-vergleich", lv: "A2", t: ["Komparativ und Superlativ", "Comparatif et superlatif"], s: ["größer, am größten, so … wie, als – Vergleiche bilden.", "größer, am größten, so … wie, als – former des comparaisons."], k: "komparativ superlativ vergleichen als wie größer am größten gern lieber am liebsten comparatif superlatif plus moins aussi",
  b: [
    tb(["Grundform", "Komparativ (+ -er)", "Superlativ (am … -sten)"], [["schnell", "schneller", "am schnellsten"], ["klein", "kleiner", "am kleinsten"], ["alt", "älter", "am ältesten"], ["jung", "jünger", "am jüngsten"], ["groß", "größer", "am größten"], ["kurz", "kürzer", "am kürzesten"], ["lang", "länger", "am längsten"], ["warm", "wärmer", "am wärmsten"], ["kalt", "kälter", "am kältesten"], ["gesund", "gesünder", "am gesündesten"]]),
    p("Viele einsilbige Adjektive mit **a, o, u** bekommen einen **Umlaut** (alt → älter). Bei Wörtern auf **-d, -t, -s, -ß, -z, -sch** steht im Superlativ **-esten** (am ältesten, am heißesten).", "Beaucoup d'adjectifs monosyllabiques avec **a, o, u** prennent un **tréma** (alt → älter). Pour les mots en **-d, -t, -s, -ß, -z, -sch**, le superlatif prend **-esten** (am ältesten, am heißesten)."),
    h("Unregelmäßige Formen", "Formes irrégulières"),
    tb(["Grundform", "Komparativ", "Superlativ"], [["gut", "**besser**", "am **besten**"], ["viel", "**mehr**", "am **meisten**"], ["gern", "**lieber**", "am **liebsten**"], ["hoch", "**höher**", "am **höchsten**"], ["nah", "näher", "am **nächsten**"], ["groß", "größer", "am größten"]]),
    h("Vergleichen", "Comparer"),
    tb(["Gleichheit", "Ungleichheit (mehr)", "Ungleichheit (weniger)"], [["Er ist **so** groß **wie** ich.", "Er ist größer **als** ich.", "Er ist **nicht so** groß **wie** ich."]]),
    warn("**als** nach dem Komparativ, **wie** bei Gleichheit: „größer **als**“, „so groß **wie**“. Das ist ein häufiger Fehler (auch bei Deutschen!): *„größer wie“* ist umgangssprachlich falsch.", "**als** après le comparatif, **wie** pour l'égalité : « größer **als** », « so groß **wie** ». Erreur fréquente (même chez les Allemands !) : *« größer wie »* est faux."),
    ex([["Berlin ist größer als Köln, aber München ist am teuersten.", "Berlin est plus grande que Cologne, mais Munich est la plus chère."], ["Ich trinke gern Tee, lieber Kaffee, am liebsten Kakao.", "J'aime le thé, je préfère le café, j'aime surtout le chocolat chaud."], ["Der Zug ist schneller als der Bus.", "Le train est plus rapide que le bus."], ["Sie ist die jüngste in der Klasse.", "Elle est la plus jeune de la classe."]]),
    p("Vor dem Nomen bekommt der Komparativ/Superlativ Adjektivendungen: „ein **schnellerer** Zug“, „der **schnellste** Zug“, „die **größten** Städte“. Mit **am** (am schnellsten) steht der Superlativ ohne Nomen.", "Devant un nom le comparatif/superlatif prend les terminaisons des adjectifs : « ein **schnellerer** Zug », « der **schnellste** Zug ». Avec **am** (am schnellsten) le superlatif est sans nom.")
  ],
  x: [
    xg("Komparativ und Superlativ", "Comparatif et superlatif", [
      gap("klein – ___ – am kleinsten", ["kleiner"]), gap("alt – ___ – am ältesten", ["älter"]), gap("gut – ___ – am besten", ["besser"]), gap("gern – ___ – am liebsten", ["lieber"]), gap("viel – ___ – am meisten", ["mehr"]), gap("hoch – ___ – am höchsten", ["höher"]), gap("groß – größer – am ___", ["größten"])
    ]),
    xg("als oder wie?", "als ou wie ?", [
      gap("Mein Bruder ist älter ___ ich.", ["als"]), gap("Sie ist so groß ___ ihr Vater.", ["wie"]), gap("Der Zug ist schneller ___ das Auto.", ["als"]), gap("Heute ist es genauso kalt ___ gestern.", ["wie"])
    ]),
    xg("Satz", "Phrase", [ord(["Berlin", "ist", "größer", "als", "Köln."], "Berlin ist größer als Köln.")])
  ] });
})();
