// Deutschkurs A1 – Teil 2 (Lektionen 8–14)
(function(){
var D = DE, p = D.p, h = D.h, tip = D.tip, warn = D.warn, ul = D.ul, tb = D.tb, ex = D.ex, voc = D.voc, dlg = D.dlg, mc = D.mc, gap = D.gap, ord = D.ord, mat = D.mat, xg = D.xg;

D.add({ id: "a1-possessiv", lv: "A1", t: ["Familie und Possessivartikel", "La famille et les possessifs"], s: ["mein, dein, sein, ihr … und das Vokabular zur Familie.", "mein, dein, sein, ihr … et le vocabulaire de la famille."], k: "possessiv mein dein sein ihr unser euer familie possessifs mon ton son leur famille",
  b: [
    p("Possessivartikel zeigen, **wem** etwas gehört. Sie richten sich nach dem **Besitzer** (ich → mein) und bekommen die Endung des **Besitzten** (wie bei „ein / kein“).", "Les articles possessifs montrent **à qui** appartient quelque chose. Ils dépendent du **possesseur** (ich → mein) et prennent la terminaison de la **chose possédée** (comme « ein / kein »)."),
    tb(["Person", "Possessivartikel", "Beispiel"], [["ich", "mein", "mein Vater, meine Mutter, mein Kind"], ["du", "dein", "dein Bruder, deine Schwester"], ["er", "sein", "sein Hund, seine Katze"], ["sie", "ihr", "ihr Mann, ihre Tochter"], ["es", "sein", "sein Spielzeug"], ["wir", "unser", "unser Haus, unsere Lehrerin"], ["ihr", "euer", "euer Auto, eure Kinder"], ["sie (Pl.)", "ihr", "ihr Garten, ihre Eltern"], ["Sie (höflich)", "Ihr", "Ihr Name, Ihre Adresse"]]),
    tb(["Endungen wie ein/kein", "maskulin", "feminin", "neutral", "Plural"], [["Nominativ", "mein Bruder", "mein**e** Schwester", "mein Kind", "mein**e** Kinder"], ["Akkusativ", "mein**en** Bruder", "mein**e** Schwester", "mein Kind", "mein**e** Kinder"]]),
    warn("**Sein** (sein Vater) = *son père à lui*, **ihr** (ihr Vater) = *son père à elle*. Im Französischen sagt man „son père“ für beide – im Deutschen richtet sich das Possessivum nach dem **Besitzer**: Anna und **ihr** Vater, Paul und **sein** Vater. Und **euer** verliert das zweite e: eu**r**e (eure Kinder), nicht „euere“.", "**sein** (sein Vater) = son père à lui, **ihr** (ihr Vater) = son père à elle. En allemand le possessif suit le **possesseur** : Anna und **ihr** Vater, Paul und **sein** Vater. Et **euer** perd son 2ᵉ e : eu**r**e Kinder, pas « euere »."),
    voc("Die Familie", [["die Familie", "famille"], ["die Eltern", "parents"], ["der Vater / die Mutter", "père / mère"], ["der Sohn / die Tochter", "fils / fille"], ["der Bruder / die Schwester", "frère / sœur"], ["die Geschwister", "frères et sœurs"], ["der Großvater / die Großmutter", "grand-père / grand-mère"], ["die Großeltern", "grands-parents"], ["der Onkel / die Tante", "oncle / tante"], ["der Cousin / die Cousine", "cousin / cousine"], ["der Mann / die Frau", "mari, homme / femme"], ["das Kind, die Kinder", "enfant(s)"], ["verheiratet / ledig / geschieden", "marié / célibataire / divorcé"], ["der Freund / die Freundin", "ami(e) / copain, copine"]]),
    ex([["Das ist meine Familie. Mein Vater heißt Peter, meine Mutter heißt Anna.", "Voici ma famille. Mon père s'appelle Peter, ma mère s'appelle Anna."], ["Hast du Geschwister? – Ja, ich habe einen Bruder und zwei Schwestern.", "As-tu des frères et sœurs ? – Oui, j'ai un frère et deux sœurs."], ["Wie heißt deine Schwester? – Sie heißt Lea. Ihr Mann heißt Tom.", "Comment s'appelle ta sœur ? – Elle s'appelle Lea. Son mari s'appelle Tom."]]),
    h("Ein Stammbaum beschreiben", "Décrire un arbre généalogique"),
    dlg("Dialog: Mein Foto", [["A", "Wer ist das auf dem Foto?", "Qui est-ce sur la photo ?"], ["B", "Das ist mein Opa. Er ist 80 und wohnt bei uns.", "C'est mon papi. Il a 80 ans et habite chez nous."], ["A", "Und die Frau neben ihm?", "Et la femme à côté de lui ?"], ["B", "Das ist meine Oma. Ihre Katze heißt Mimi.", "C'est ma mamie. Son chat s'appelle Mimi."]])
  ],
  x: [
    xg("Possessivartikel", "Articles possessifs", [
      gap("Das ist ___ Buch. (ich)", ["mein"]), gap("Wo ist ___ Schwester? (du)", ["deine"]), gap("Paul liebt ___ Frau. (er)", ["seine"]), gap("Anna und ___ Mann wohnen hier. (sie)", ["ihr"]), gap("Wir lieben ___ Haus. (wir)", ["unser"]), gap("Habt ihr ___ Kinder dabei? (ihr)", ["eure"]), gap("Wie ist ___ Name? (Sie, höflich)", ["Ihr"]), gap("Ich besuche ___ Bruder. (ich, Akk.)", ["meinen"])
    ]),
    xg("Verständnis", "Compréhension", [
      mc(["Maria und ___ Bruder: Wessen Bruder?", "Maria et ___ frère : le frère de qui ?"], ["sein", "ihr", "ihre", "unser"], 1, ["Maria ist weiblich → ihr.", "Maria est une femme → ihr."]),
      mc(["Welche Form ist richtig?", "Quelle forme est correcte ?"], ["euere Kinder", "eure Kinder", "euer Kinder", "euren Kinder"], 1),
      mat([["der Onkel", "oncle"], ["die Tante", "tante"], ["die Großmutter", "grand-mère"], ["der Sohn", "fils"], ["die Geschwister", "frères et sœurs"]])
    ])
  ] });

D.add({ id: "a1-modal", lv: "A1", t: ["Modalverben: können, müssen, wollen …", "Les verbes modaux : können, müssen, wollen …"], s: ["Können, müssen, dürfen, wollen, möchten, sollen – und die Satzklammer.", "Können, müssen, dürfen, wollen, möchten, sollen – et la parenthèse verbale."], k: "modalverben können müssen dürfen wollen möchten sollen satzklammer verbes modaux pouvoir devoir vouloir",
  b: [
    p("Modalverben drücken Fähigkeit, Pflicht, Erlaubnis oder Wunsch aus. Sie stehen auf **Position 2**, das **zweite Verb** steht als **Infinitiv am Satzende**. Das ist die **Satzklammer**.", "Les verbes modaux expriment la capacité, l'obligation, la permission ou le souhait. Ils sont en **position 2**, le **second verbe** est à l'**infinitif en fin de phrase**. C'est la **parenthèse verbale**."),
    ex([["Ich **kann** gut Deutsch **sprechen**.", "Je sais bien parler allemand."], ["Du **musst** heute **arbeiten**.", "Tu dois travailler aujourd'hui."], ["Wir **wollen** morgen ins Kino **gehen**.", "Nous voulons aller au cinéma demain."]]),
    tb(["", "können", "müssen", "dürfen", "wollen", "sollen", "möchten"], [["ich", "kann", "muss", "darf", "will", "soll", "möchte"], ["du", "kannst", "musst", "darfst", "willst", "sollst", "möchtest"], ["er/sie/es", "kann", "muss", "darf", "will", "soll", "möchte"], ["wir", "können", "müssen", "dürfen", "wollen", "sollen", "möchten"], ["ihr", "könnt", "müsst", "dürft", "wollt", "sollt", "möchtet"], ["sie/Sie", "können", "müssen", "dürfen", "wollen", "sollen", "möchten"]]),
    warn("**ich** und **er/sie/es** haben die **gleiche Form** und **keine** Endung (ich kann, er kann). Und: **dürfen** ≠ „devoir“ (müssen)! Und **müssen** in der Verneinung: „Du **musst nicht** kommen“ = tu n'es pas **obligé** (nicht: verboten!). Verboten = „Du **darfst nicht** kommen.“", "**ich** et **er/sie/es** ont la **même forme**, sans terminaison. **müssen nicht** = « tu n'es pas obligé » ; interdit = **darf nicht**."),
    tb(["Verb", "Bedeutung", "Beispiel"], [["können", "pouvoir, savoir faire", "Ich kann schwimmen."], ["müssen", "devoir (obligation)", "Ich muss arbeiten."], ["dürfen", "avoir le droit", "Hier darf man nicht rauchen."], ["wollen", "vouloir (fort)", "Ich will nach Hause."], ["möchten", "vouloir / aimerais (poli)", "Ich möchte einen Kaffee."], ["sollen", "devoir (conseil / ordre d'un tiers)", "Du sollst mehr schlafen."]]),
    p("Wenn der Sinn klar ist, kann man den Infinitiv weglassen: „Ich muss **nach Hause**.“ (= nach Hause gehen). **Möchten** ist keine eigene Verbart, sondern eine Form von „mögen“, die man wie ein Modalverb benutzt.", "Quand le sens est clair, on peut omettre l'infinitif : « Ich muss **nach Hause**. » **Möchten** est une forme de « mögen » utilisée comme un modal."),
    ex([["Kannst du mir helfen? – Ja, gern.", "Peux-tu m'aider ? – Oui, volontiers."], ["Darf ich hier sitzen? – Ja, bitte.", "Puis-je m'asseoir ici ? – Oui, je vous en prie."], ["Wir müssen um acht Uhr aufstehen.", "Nous devons nous lever à huit heures."], ["Möchtest du einen Tee trinken?", "Voudrais-tu boire un thé ?"], ["Er will Arzt werden.", "Il veut devenir médecin."]])
  ],
  x: [
    xg("Konjugieren", "Conjuguer", [
      gap("Ich ___ gut kochen. (können)", ["kann"]), gap("Du ___ heute lernen. (müssen)", ["musst"]), gap("Er ___ nach Hause gehen. (wollen)", ["will"]), gap("Wir ___ hier nicht parken. (dürfen)", ["dürfen"]), gap("Ihr ___ pünktlich sein. (sollen)", ["sollt"]), gap("Ich ___ einen Kaffee. (möchten)", ["möchte"]), gap("___ du Klavier spielen? (können)", ["Kannst"])
    ]),
    xg("Satz bilden", "Former des phrases", [
      ord(["Ich", "kann", "gut", "schwimmen."], "Ich kann gut schwimmen."), ord(["Wir", "müssen", "heute", "arbeiten."], "Wir müssen heute arbeiten."), ord(["Darf", "ich", "hier", "sitzen?"], "Darf ich hier sitzen?"), ord(["Morgen", "will", "ich", "ins", "Kino", "gehen."], "Morgen will ich ins Kino gehen.")
    ]),
    xg("Bedeutung", "Sens", [
      mc(["„Du musst nicht kommen“ bedeutet:", "« Du musst nicht kommen » signifie :"], ["Du darfst nicht kommen.", "Du musst nicht kommen (= es ist nicht nötig).", "Du kannst nicht kommen.", "Du willst nicht kommen."], 1),
      mc(["Wie sagst du „Je voudrais un café“ höflich?", "Comment dire poliment « Je voudrais un café » ?"], ["Ich will einen Kaffee.", "Ich möchte einen Kaffee.", "Ich muss einen Kaffee.", "Ich soll einen Kaffee."], 1)
    ])
  ] });

D.add({ id: "a1-trennbar", lv: "A1", t: ["Trennbare Verben und Alltag", "Verbes séparables et vie quotidienne"], s: ["aufstehen, anrufen, einkaufen … – Präfix am Satzende. Tagesablauf.", "aufstehen, anrufen, einkaufen … – préfixe à la fin. Journée type."], k: "trennbare verben aufstehen anrufen einkaufen tagesablauf präfix verbes séparables routine quotidien",
  b: [
    p("Viele Verben haben eine **betonte Vorsilbe** (Präfix): **auf**stehen, **an**rufen, **ein**kaufen. Im Hauptsatz **trennt** sich das Präfix: das Verb steht auf Position 2, das Präfix am **Satzende**. Im Infinitiv und bei Modalverben bleibt das Verb zusammen.", "Beaucoup de verbes ont un **préfixe accentué** : **auf**stehen, **an**rufen, **ein**kaufen. Dans la principale le préfixe **se sépare** : le verbe en position 2, le préfixe à la **fin**. À l'infinitif et avec les modaux le verbe reste uni."),
    tb(["Infinitiv", "Hauptsatz", "mit Modalverb"], [["aufstehen", "Ich **stehe** um 7 Uhr **auf**.", "Ich muss um 7 Uhr **aufstehen**."], ["anrufen", "Er **ruft** mich **an**.", "Kannst du mich **anrufen**?"], ["einkaufen", "Wir **kaufen** heute **ein**.", "Ich will heute **einkaufen**."], ["fernsehen", "Sie **sieht** abends **fern**.", "Du darfst **fernsehen**."], ["mitkommen", "Kommst du **mit**?", "Willst du **mitkommen**?"], ["abfahren", "Der Zug **fährt** um 8 Uhr **ab**.", "Er soll um 8 Uhr **abfahren**."]]),
    p("Es gibt auch **untrennbare** Verben mit unbetonten Präfixen: **be-, ent-, er-, ge-, ver-, zer-, miss-**. Sie trennen sich nie: „Ich **verstehe** dich.“ „Er **bekommt** ein Geschenk.“", "Il y a aussi des verbes **inséparables** à préfixes non accentués : **be-, ent-, er-, ge-, ver-, zer-, miss-**. Ils ne se séparent jamais : « Ich **verstehe** dich. »"),
    warn("Bei der Frage „Ich **verstehe** nicht“ – **ver-** ist untrennbar! Aber „Ich **stehe** um 7 **auf**“ – **auf-** ist trennbar.", "« Ich **verstehe** nicht » – **ver-** est inséparable ! Mais « Ich **stehe** um 7 **auf** » – **auf-** est séparable."),
    voc("Trennbare Verben (A1)", [["aufstehen", "se lever"], ["anfangen / beginnen", "commencer"], ["einkaufen", "faire des courses"], ["anrufen", "téléphoner"], ["fernsehen", "regarder la télé"], ["mitkommen", "venir avec"], ["abfahren / ankommen", "partir / arriver"], ["aufräumen", "ranger"], ["einladen", "inviter"], ["zurückkommen", "revenir"], ["ausgehen", "sortir"], ["einsteigen / aussteigen", "monter / descendre"]]),
    h("Mein Tag", "Ma journée"),
    ex([["Ich stehe um sechs Uhr auf und frühstücke um sieben.", "Je me lève à six heures et prends mon petit-déjeuner à sept."], ["Um acht Uhr fahre ich zur Arbeit und komme um neun an.", "À huit heures je vais au travail et arrive à neuf."], ["Nach der Arbeit kaufe ich ein und koche das Abendessen.", "Après le travail je fais les courses et prépare le dîner."], ["Abends sehe ich fern oder lese ein Buch.", "Le soir je regarde la télé ou lis un livre."], ["Um 23 Uhr gehe ich ins Bett.", "À 23 h je vais au lit."]]),
    voc("Alltag", [["frühstücken", "prendre le petit-déjeuner"], ["zu Mittag essen", "déjeuner"], ["zu Abend essen", "dîner"], ["duschen", "prendre une douche"], ["arbeiten", "travailler"], ["Pause machen", "faire une pause"], ["ins Bett gehen", "aller au lit"], ["jeden Tag / oft / manchmal / nie", "chaque jour / souvent / parfois / jamais"]])
  ],
  x: [
    xg("Trennbare Verben", "Verbes séparables", [
      gap("Ich ___ um 7 Uhr ___. (aufstehen)", ["stehe", "auf"]), gap("Er ___ mich jeden Tag ___. (anrufen)", ["ruft", "an"]), gap("Wir ___ heute Abend ___. (einkaufen)", ["kaufen", "ein"]), gap("Der Bus ___ um 8 Uhr ___. (abfahren)", ["fährt", "ab"]), gap("___ du morgen ___? (mitkommen)", ["Kommst", "mit"]), gap("Ich muss früh ___. (aufstehen)", ["aufstehen"])
    ]),
    xg("Reihenfolge", "Ordre", [
      ord(["Ich", "stehe", "um", "sechs", "Uhr", "auf."], "Ich stehe um sechs Uhr auf."), ord(["Wann", "kommst", "du", "an?"], "Wann kommst du an?"), ord(["Wir", "kaufen", "heute", "ein."], "Wir kaufen heute ein."),
      mc(["Welches Verb ist untrennbar?", "Quel verbe est inséparable ?"], ["anfangen", "verstehen", "einkaufen", "aufstehen"], 1)
    ])
  ] });

D.add({ id: "a1-imperativ", lv: "A1", t: ["Imperativ und höfliche Bitten", "Impératif et demandes polies"], s: ["Befehle, Bitten, Tipps – du, ihr, Sie – und höfliche Redewendungen.", "Ordres, demandes, conseils – du, ihr, Sie – et formules de politesse."], k: "imperativ befehl bitte höflich kommen sie impératif ordre demande politesse",
  b: [
    p("Der Imperativ hat drei Formen: **du**, **ihr**, **Sie**. Bei **du** nimmst du den Stamm (ohne „-st“), bei **ihr** die ihr-Form, bei **Sie** die Sie-Form mit „Sie“ **nach** dem Verb.", "L'impératif a trois formes : **du**, **ihr**, **Sie**. Pour **du** on prend le radical (sans « -st »), pour **ihr** la forme de « ihr », pour **Sie** la forme de « Sie » avec « Sie » **après** le verbe."),
    tb(["Infinitiv", "du", "ihr", "Sie"], [["kommen", "Komm!", "Kommt!", "Kommen Sie!"], ["warten", "Warte!", "Wartet!", "Warten Sie!"], ["lesen", "**Lies!**", "Lest!", "Lesen Sie!"], ["fahren", "Fahr!", "Fahrt!", "Fahren Sie!"], ["sprechen", "**Sprich!**", "Sprecht!", "Sprechen Sie!"], ["nehmen", "**Nimm!**", "Nehmt!", "Nehmen Sie!"], ["sein", "**Sei** ruhig!", "**Seid** ruhig!", "**Seien Sie** ruhig!"], ["aufstehen", "Steh auf!", "Steht auf!", "Stehen Sie auf!"]]),
    warn("Verben mit **e → i / ie** (lesen, sprechen, nehmen) behalten den Vokalwechsel im Imperativ du (Lies! Sprich!). **a → ä** fällt weg: Fahr! (nicht „Fähr“).", "Les verbes en **e → i / ie** gardent le changement à l'impératif (Lies ! Sprich !). **a → ä** disparaît : Fahr ! (pas « Fähr »)."),
    ex([["Entschuldigung, können Sie mir helfen?", "Excusez-moi, pouvez-vous m'aider ?"], ["Sprechen Sie bitte langsamer.", "Parlez plus lentement, s'il vous plaît."], ["Komm schnell! Wir sind spät dran.", "Viens vite ! Nous sommes en retard."], ["Macht bitte die Tür zu!", "Fermez la porte, s'il vous plaît !"], ["Setzen Sie sich bitte.", "Asseyez-vous, je vous prie."]]),
    h("Höflich sein", "Être poli"),
    voc("Nützliche Sätze", [["Bitte. / Bitte schön. / Gern geschehen.", "S'il vous plaît / Voilà / Avec plaisir"], ["Danke schön! / Vielen Dank!", "Merci beaucoup !"], ["Entschuldigung! / Verzeihung!", "Excusez-moi !"], ["Es tut mir leid.", "Je suis désolé(e)."], ["Wie bitte?", "Comment ? / Pardon ?"], ["Können Sie das wiederholen?", "Pouvez-vous répéter ?"], ["Ich verstehe nicht.", "Je ne comprends pas."], ["Sprechen Sie Englisch / Französisch?", "Parlez-vous anglais / français ?"], ["Was bedeutet das?", "Qu'est-ce que ça signifie ?"], ["Wie sagt man … auf Deutsch?", "Comment dit-on … en allemand ?"], ["Kein Problem! / Macht nichts.", "Pas de problème ! / Ce n'est pas grave."]]),
    dlg("Dialog: Nach dem Weg fragen", [["Tourist", "Entschuldigung, wo ist der Bahnhof?", "Excusez-moi, où est la gare ?"], ["Passant", "Gehen Sie geradeaus, dann nehmen Sie die zweite Straße rechts.", "Allez tout droit, puis prenez la deuxième rue à droite."], ["Tourist", "Ist es weit?", "Est-ce loin ?"], ["Passant", "Nein, nur fünf Minuten zu Fuß.", "Non, seulement cinq minutes à pied."]]),
    voc("Richtungen", [["geradeaus", "tout droit"], ["links / rechts", "à gauche / à droite"], ["an der Ampel", "au feu"], ["die erste / zweite Straße", "la première / deuxième rue"], ["die Kreuzung", "le carrefour"], ["neben / gegenüber / hinter", "à côté de / en face de / derrière"]])
  ],
  x: [
    xg("Imperativ bilden", "Former l'impératif", [
      gap("___ (kommen, du) bitte her!", ["Komm"]), gap("___ (warten, du) hier!", ["Warte"]), gap("___ (lesen, du) den Text!", ["Lies"]), gap("___ (nehmen, du) den Bus!", ["Nimm"]), gap("___ (sein, du) bitte leise!", ["Sei"]), gap("___ (kommen, Sie) bitte herein!", ["Kommen Sie"]), gap("___ (machen, ihr) die Tür zu!", ["Macht"]), gap("___ (fahren, du) vorsichtig!", ["Fahr"])
    ]),
    xg("Situationen", "Situations", [
      mc(["Du willst einen Fremden höflich ansprechen:", "Tu abordes poliment un inconnu :"], ["Hilf mir!", "Entschuldigung, können Sie mir helfen?", "Du musst mir helfen!", "Hilfe mir!"], 1),
      mc(["Du hast etwas nicht verstanden:", "Tu n'as pas compris :"], ["Wie bitte?", "Danke schön.", "Auf Wiedersehen.", "Gern geschehen."], 0)
    ])
  ] });

D.add({ id: "a1-praep", lv: "A1", t: ["Wichtige Präpositionen: Ort, Zeit, Richtung", "Prépositions importantes : lieu, temps, direction"], s: ["in, an, auf, um, nach, zu, aus, bei, von, mit – die ersten Präpositionen.", "in, an, auf, um, nach, zu, aus, bei, von, mit – premières prépositions."], k: "präpositionen in an auf um nach zu aus bei von mit zeit ort richtung prépositions lieu temps direction",
  b: [
    p("Präpositionen verlangen einen **Kasus**. Am Anfang lernst du sie am besten **in festen Wendungen**. Hier die wichtigsten für A1:", "Les prépositions exigent un **cas**. Au début, apprends-les surtout dans des **expressions toutes faites**. Voici les plus importantes pour A1 :"),
    h("Zeit", "Temps"),
    tb(["Präposition", "Gebrauch", "Beispiel"], [["**um**", "genaue Uhrzeit", "um 8 Uhr, um halb zehn"], ["**am**", "Tage, Tageszeiten, Datum", "am Montag, am Morgen, am 3. Mai"], ["**im**", "Monate, Jahreszeiten, Jahre", "im Mai, im Sommer, im Jahr 2025"], ["**von … bis**", "Zeitraum", "von 9 bis 17 Uhr"], ["**ab**", "ab dem Anfang", "ab Montag"], ["**vor / nach**", "avant / après", "vor dem Essen, nach der Arbeit"], ["**seit**", "depuis (+ Dativ)", "seit einem Jahr"]]),
    h("Ort: wo? – woher? – wohin?", "Lieu : où ? – d'où ? – vers où ?"),
    tb(["wo? (Ort)", "woher? (Herkunft)", "wohin? (Richtung)"], [["in der Stadt, in Berlin", "aus der Stadt, aus Berlin", "in die Stadt, nach Berlin"], ["bei dem Arzt (beim Arzt)", "vom Arzt", "zum Arzt"], ["bei Anna / zu Hause", "von Anna", "zu Anna / nach Hause"], ["auf dem Markt", "vom Markt", "auf den Markt"], ["an der Bushaltestelle", "von der Bushaltestelle", "an die Bushaltestelle"]]),
    p("Faustregeln: **Städte und Länder ohne Artikel**: „in Paris“ → „aus Paris“ → „nach Paris“. Länder **mit** Artikel (die Schweiz, die USA): „in der Schweiz“ → „aus der Schweiz“ → „in die Schweiz“. **Zu Hause** (wo?) – **nach Hause** (wohin?). **zu** + Person/Institution (zum Arzt, zur Schule, zu Anna). **bei** + Person: „bei Anna“ (chez Anna).", "Règles pratiques : **villes et pays sans article** : « in Paris » → « aus Paris » → « nach Paris ». Pays **avec** article : « in der Schweiz » → « aus der Schweiz » → « in die Schweiz ». **Zu Hause** (où ?) – **nach Hause** (vers où ?). **zu** + personne/institution. **bei** + personne : « chez »."),
    tb(["Präposition", "Kasus", "Gebrauch", "Beispiel"], [["**aus**", "Dativ", "d'où, matière", "aus Frankreich, aus Holz"], ["**bei**", "Dativ", "chez, auprès de", "beim Arzt, bei Anna"], ["**mit**", "Dativ", "avec, moyen de transport", "mit dem Bus, mit dir"], ["**nach**", "Dativ", "après, vers (ville/pays)", "nach Paris, nach dem Essen"], ["**seit**", "Dativ", "depuis", "seit einem Monat"], ["**von**", "Dativ", "de, par", "von Anna, vom Bahnhof"], ["**zu**", "Dativ", "à, chez (direction)", "zur Schule, zum Arzt"], ["**für**", "Akkusativ", "pour", "für dich"], ["**ohne**", "Akkusativ", "sans", "ohne Zucker"], ["**durch**", "Akkusativ", "par, à travers", "durch den Park"], ["**gegen**", "Akkusativ", "contre, vers (temps)", "gegen die Wand, gegen 8 Uhr"], ["**um**", "Akkusativ", "autour de", "um die Ecke"]]),
    tip("Merke dir: **aus, bei, mit, nach, seit, von, zu** → immer **Dativ**. **für, ohne, durch, gegen, um** → immer **Akkusativ**. Mit dem Dativ beschäftigen wir uns in A2 ausführlich.", "Retiens : **aus, bei, mit, nach, seit, von, zu** → toujours le **datif**. **für, ohne, durch, gegen, um** → toujours l'**accusatif**. Nous étudions le datif en détail en A2."),
    ex([["Ich fahre mit dem Bus zur Arbeit.", "Je vais au travail en bus."], ["Wir gehen nach dem Essen spazieren.", "Nous allons nous promener après le repas."], ["Das Geschenk ist für dich.", "Le cadeau est pour toi."], ["Er kommt aus Spanien und wohnt seit zwei Jahren in Berlin.", "Il vient d'Espagne et habite à Berlin depuis deux ans."], ["Ich trinke Kaffee ohne Zucker.", "Je bois mon café sans sucre."]]),
    h("Verkehrsmittel", "Moyens de transport"),
    voc("Mit dem … / Mit der …", [["mit dem Auto / Bus / Zug / Fahrrad", "en voiture / bus / train / vélo"], ["mit der Bahn / U-Bahn / Straßenbahn", "en train / métro / tram"], ["zu Fuß gehen", "aller à pied"], ["mit dem Flugzeug fliegen", "prendre l'avion"]])
  ],
  x: [
    xg("Zeit", "Temps", [
      gap("Der Film beginnt ___ 20 Uhr.", ["um"]), gap("Wir treffen uns ___ Samstag.", ["am"]), gap("___ August fahren wir ans Meer.", ["Im"]), gap("Ich arbeite ___ 8 ___ 16 Uhr.", ["von", "bis"]), gap("Ich lerne Deutsch ___ einem Jahr.", ["seit"])
    ]),
    xg("Ort und Richtung", "Lieu et direction", [
      gap("Ich komme ___ Italien. (aus/nach)", ["aus"]), gap("Wir fahren ___ Berlin. (aus/nach)", ["nach"]), gap("Ich gehe ___ Arzt. (zu/bei)", ["zum"], ["zu + dem = zum", "zu + dem = zum"]), gap("Ich bin ___ Anna. (bei/zu)", ["bei"]), gap("Ich fahre ___ dem Zug. (mit/bei)", ["mit"]), gap("Das ist ___ dich. (für/ohne)", ["für"]), gap("Ich gehe ___ Hause. (nach/zu)", ["nach"]), gap("Ich bin ___ Hause. (zu/nach)", ["zu"])
    ]),
    xg("Kasus-Regel", "Règle des cas", [
      mc(["Welche Präposition steht immer mit Dativ?", "Quelle préposition est toujours suivie du datif ?"], ["für", "ohne", "mit", "durch"], 2),
      mc(["Welche Präposition steht immer mit Akkusativ?", "Quelle préposition est toujours suivie de l'accusatif ?"], ["bei", "von", "zu", "für"], 3)
    ])
  ] });

D.add({ id: "a1-essen", lv: "A1", t: ["Essen, Einkaufen und Restaurant", "Manger, faire les courses et restaurant"], s: ["Lebensmittel, Mengen, Preise, im Geschäft und im Restaurant bestellen.", "Aliments, quantités, prix, commander au magasin et au restaurant."], k: "essen trinken einkaufen restaurant lebensmittel preise mengen bestellen nourriture courses repas boisson",
  b: [
    voc("Lebensmittel", [["das Brot / das Brötchen", "pain / petit pain"], ["die Butter", "beurre"], ["der Käse", "fromage"], ["die Wurst", "charcuterie / saucisse"], ["das Ei, die Eier", "œuf(s)"], ["die Milch", "lait"], ["das Wasser", "eau"], ["der Saft", "jus"], ["der Kaffee / der Tee", "café / thé"], ["das Fleisch", "viande"], ["der Fisch", "poisson"], ["das Gemüse", "légumes"], ["das Obst", "fruits"], ["der Apfel / die Banane / die Orange", "pomme / banane / orange"], ["die Kartoffel", "pomme de terre"], ["der Reis / die Nudeln", "riz / pâtes"], ["der Zucker / das Salz", "sucre / sel"], ["die Suppe / der Salat", "soupe / salade"], ["der Kuchen / die Torte", "gâteau / tarte"], ["das Bier / der Wein", "bière / vin"]]),
    voc("Mahlzeiten", [["das Frühstück", "petit-déjeuner"], ["das Mittagessen", "déjeuner"], ["das Abendessen / das Abendbrot", "dîner"], ["die Vorspeise / die Hauptspeise / der Nachtisch", "entrée / plat / dessert"]]),
    h("Mengen und Preise", "Quantités et prix"),
    tb(["Menge", "Beispiel"], [["ein Kilo (kg) / ein Pfund / 500 Gramm", "ein Kilo Äpfel"], ["ein Liter / eine Flasche", "eine Flasche Wasser"], ["eine Packung / eine Dose", "eine Packung Nudeln"], ["ein Stück / eine Scheibe / ein Glas / eine Tasse", "ein Stück Kuchen, eine Tasse Tee"], ["ein bisschen / viel / wenig / etwas", "etwas Zucker"]]),
    warn("Nach Mengenangaben steht **kein Artikel** und **kein „de“**: „ein Kilo Äpfel“ (un kilo **de** pommes), „eine Tasse Kaffee“ (une tasse **de** café).", "Après une indication de quantité : **pas d'article** et **pas de « de »** : « ein Kilo Äpfel », « eine Tasse Kaffee »."),
    p("Preise: **1,50 €** = „ein Euro fünfzig“. Das Komma ist ein Dezimalkomma. **2,99 €** = zwei Euro neunundneunzig. Man sagt oft „macht zwölf fünfzig“ für 12,50 €.", "Prix : **1,50 €** = « ein Euro fünfzig ». **2,99 €** = « zwei Euro neunundneunzig ». On dit souvent « zwölf fünfzig » pour 12,50 €."),
    dlg("Im Supermarkt", [["Verkäuferin", "Guten Tag! Was darf es sein?", "Bonjour ! Que désirez-vous ?"], ["Kunde", "Ich hätte gern ein Kilo Äpfel und ein Brot, bitte.", "Je voudrais un kilo de pommes et un pain, s'il vous plaît."], ["Verkäuferin", "Sonst noch etwas?", "Avec ceci ?"], ["Kunde", "Nein, danke. Das ist alles. Was kostet das?", "Non merci. C'est tout. Combien ça coûte ?"], ["Verkäuferin", "Das macht vier Euro achtzig.", "Cela fait quatre euros quatre-vingts."]]),
    dlg("Im Restaurant", [["Kellner", "Guten Abend. Haben Sie reserviert?", "Bonsoir. Avez-vous réservé ?"], ["Gast", "Ja, auf den Namen Müller, für zwei Personen.", "Oui, au nom de Müller, pour deux personnes."], ["Kellner", "Hier ist die Speisekarte. Was möchten Sie trinken?", "Voici la carte. Que voulez-vous boire ?"], ["Gast", "Eine Cola und ein Mineralwasser, bitte.", "Un coca et une eau minérale, s'il vous plaît."], ["Gast", "Ich nehme das Schnitzel mit Pommes. – Ich nehme die Gemüsesuppe.", "Je prends l'escalope avec des frites. – Je prends la soupe de légumes."], ["Gast", "Zahlen, bitte! – Zusammen oder getrennt?", "L'addition, s'il vous plaît ! – Ensemble ou séparément ?"]]),
    tip("Trinkgeld: In Deutschland rundet man auf (5–10 %). Man sagt beim Bezahlen: „**Stimmt so.**“ (garder la monnaie).", "Pourboire : en Allemagne on arrondit (5–10 %). En payant on dit « **Stimmt so.** » (gardez la monnaie)."),
    voc("Nützliche Sätze", [["Ich hätte gern …", "Je voudrais …"], ["Ich nehme …", "Je prends …"], ["Was kostet das?", "Combien ça coûte ?"], ["Die Rechnung, bitte.", "L'addition, s'il vous plaît."], ["Guten Appetit!", "Bon appétit !"], ["Das schmeckt gut.", "C'est bon."], ["Ich bin Vegetarier / Vegetarierin.", "Je suis végétarien(ne)."], ["Ich bin allergisch gegen …", "Je suis allergique à …"]])
  ],
  x: [
    xg("Vokabeln", "Vocabulaire", [
      mat([["das Brot", "pain"], ["die Milch", "lait"], ["der Käse", "fromage"], ["das Obst", "fruits"], ["die Kartoffel", "pomme de terre"], ["der Nachtisch", "dessert"]]),
      gap("Ich hätte gern ein Kilo ___. (Äpfel)", ["Äpfel"]), gap("Eine ___ Kaffee, bitte. (Tasse)", ["Tasse"])
    ]),
    xg("Situationen", "Situations", [
      mc(["Du willst bezahlen:", "Tu veux payer :"], ["Die Rechnung, bitte.", "Guten Appetit.", "Was kostet das?", "Ich hätte gern."], 0),
      mc(["Wie sagt man 3,50 €?", "Comment dit-on 3,50 € ?"], ["drei Euro fünfzig", "dreißig Euro fünf", "drei Euro fünf", "fünfunddreißig Euro"], 0),
      mc(["„Guten Appetit!“ sagt man …", "On dit « Guten Appetit ! » …"], ["vor dem Essen", "nach dem Essen", "beim Bezahlen", "beim Bestellen"], 0),
      ord(["Ich", "hätte", "gern", "ein", "Brot."], "Ich hätte gern ein Brot.")
    ])
  ] });

D.add({ id: "a1-wohnen", lv: "A1", t: ["Wohnen, Wetter und Farben", "Logement, météo et couleurs"], s: ["Zimmer, Möbel, Adjektive, Wetter und Farben im Alltag.", "Pièces, meubles, adjectifs, météo et couleurs du quotidien."], k: "wohnen zimmer möbel wetter farben adjektiv logement météo couleurs maison",
  b: [
    voc("Haus und Zimmer", [["das Haus / die Wohnung", "maison / appartement"], ["das Zimmer", "pièce"], ["das Wohnzimmer / das Schlafzimmer", "salon / chambre"], ["die Küche / das Bad", "cuisine / salle de bains"], ["der Flur / der Balkon / der Garten", "couloir / balcon / jardin"], ["das Erdgeschoss / der erste Stock", "rez-de-chaussée / premier étage"], ["die Miete", "loyer"]]),
    voc("Möbel", [["das Bett", "lit"], ["der Tisch / der Stuhl", "table / chaise"], ["das Sofa / der Sessel", "canapé / fauteuil"], ["der Schrank", "armoire"], ["das Regal", "étagère"], ["die Lampe", "lampe"], ["der Herd / der Kühlschrank", "cuisinière / réfrigérateur"], ["die Waschmaschine", "lave-linge"]]),
    ex([["Wir haben eine Wohnung mit drei Zimmern, Küche und Bad.", "Nous avons un appartement de trois pièces, cuisine et salle de bains."], ["Im Wohnzimmer steht ein Sofa. An der Wand hängt ein Bild.", "Dans le salon il y a un canapé. Au mur est accroché un tableau."], ["Die Miete beträgt 750 Euro im Monat.", "Le loyer est de 750 euros par mois."]]),
    h("Adjektive als Prädikat", "Adjectifs attributs"),
    p("Steht das Adjektiv **nach „sein“**, bekommt es **keine Endung**: „Das Haus ist **groß**.“ „Die Wohnung ist **schön**.“ (Das ist anders als vor dem Nomen – das lernst du in A2.)", "Quand l'adjectif est **après « sein »**, il **ne prend pas de terminaison** : « Das Haus ist **groß**. » (Avant le nom il en prend – voir A2.)"),
    voc("Wichtige Adjektive und ihre Gegenteile", [["groß ↔ klein", "grand ↔ petit"], ["neu ↔ alt", "nouveau/neuf ↔ vieux"], ["schön ↔ hässlich", "beau ↔ laid"], ["billig ↔ teuer", "bon marché ↔ cher"], ["gut ↔ schlecht", "bon ↔ mauvais"], ["schnell ↔ langsam", "rapide ↔ lent"], ["warm ↔ kalt", "chaud ↔ froid"], ["leicht ↔ schwer", "facile/léger ↔ difficile/lourd"], ["hell ↔ dunkel", "clair ↔ sombre"], ["laut ↔ leise", "bruyant ↔ silencieux"], ["jung ↔ alt", "jeune ↔ âgé"], ["lang ↔ kurz", "long ↔ court"]]),
    h("Farben", "Couleurs"),
    tb(["rot", "blau", "grün", "gelb", "schwarz", "weiß", "grau", "braun", "orange", "rosa", "lila"], [["rouge", "bleu", "vert", "jaune", "noir", "blanc", "gris", "marron", "orange", "rose", "violet"]]),
    h("Das Wetter", "La météo"),
    voc("Wetter", [["Die Sonne scheint.", "Le soleil brille."], ["Es regnet.", "Il pleut."], ["Es schneit.", "Il neige."], ["Es ist windig / neblig / bewölkt.", "Il y a du vent / du brouillard / des nuages."], ["Es ist heiß / warm / kühl / kalt.", "Il fait chaud / doux / frais / froid."], ["Wie ist das Wetter? – Es sind 20 Grad.", "Quel temps fait-il ? – Il fait 20 degrés."], ["das Gewitter", "orage"], ["der Regenschirm", "parapluie"]]),
    tip("Das **„es“** beim Wetter ist ein leeres Subjekt (wie im Französischen „il pleut“): **Es regnet.** Nie „Regnet.“ allein – das Subjekt muss immer da sein.", "Le **« es »** de la météo est un sujet vide (comme « il pleut ») : **Es regnet.** Le sujet est toujours obligatoire.")
  ],
  x: [
    xg("Vokabeln", "Vocabulaire", [
      mat([["rot", "rouge"], ["grün", "vert"], ["gelb", "jaune"], ["schwarz", "noir"], ["grau", "gris"]]),
      mat([["groß", "klein"], ["warm", "kalt"], ["neu", "alt"], ["schnell", "langsam"]]),
      gap("Im Winter ___ es oft. (schneien)", ["schneit"]), gap("Die Küche ist ___ (groß/gross), aber das Bad ist klein.", ["groß|gross"])
    ]),
    xg("Verständnis", "Compréhension", [
      mc(["Wo schläft man?", "Où dort-on ?"], ["in der Küche", "im Schlafzimmer", "im Bad", "im Flur"], 1),
      mc(["Welche Form ist richtig?", "Quelle forme est correcte ?"], ["Das Haus ist groß.", "Das Haus ist großes.", "Das Haus ist großer.", "Das Haus ist große."], 0)
    ])
  ] });
})();
