// Französischkurs A1 – Teil 2 (Lektionen 8–15).
(function(){
var D = FZ, p = D.p, h = D.h, tip = D.tip, warn = D.warn, ul = D.ul, tb = D.tb, ex = D.ex, voc = D.voc, dlg = D.dlg, mc = D.mc, gap = D.gap, ord = D.ord, mat = D.mat, xg = D.xg;

D.add({ id: "a1-adjektive", lv: "A1", t: ["Adjektive: Stellung und Angleichung", "Les adjectifs"], s: ["Feminin und Plural, Stellung vor/nach dem Nomen, Farben, Steigerung.", "Accord, place, couleurs, comparatif."], k: "adjektive adjectif farben couleurs feminin plural stellung beau nouveau vieux comparatif plus que",
  b: [
    p("Französische Adjektive **richten sich nach dem Nomen**: Sie haben eine männliche und eine weibliche Form, und beide gibt es im Singular und Plural. Die meisten stehen **hinter** dem Nomen."),
    h("Die weibliche Form"),
    tb(["Regel", "männlich → weiblich", "Beispiel"], [
      ["meist: + -e", "grand → grande", "un grand garçon → une grande fille"],
      ["schon auf -e: gleich", "rouge → rouge", "un sac rouge → une robe rouge"],
      ["-er → -ère", "cher → chère", "un ami cher → une amie chère"],
      ["-eux → -euse", "heureux → heureuse", "un homme heureux → une femme heureuse"],
      ["-if → -ive", "actif → active", "un enfant actif → une fille active"],
      ["-on / -en / -el → Doppelkonsonant + e", "bon → bonne · italien → italienne · naturel → naturelle", "une bonne idée"],
      ["unregelmäßig", "blanc → blanche · long → longue · frais → fraîche", "une robe blanche"]
    ]),
    h("Der Plural"),
    p("Wie bei Nomen: **-s** (*petit → petits*). Endet das Adjektiv auf -s oder -x, ändert sich nichts (*gris, heureux*). Endung -al wird zu **-aux** (*national → nationaux*). Auch *beau → beaux* und *nouveau → nouveaux* bekommen ein -x."),
    ex([
      ["Les petites filles sont contentes.", "Die kleinen Mädchen sind zufrieden."],
      ["J'ai deux amis italiens.", "Ich habe zwei italienische Freunde."],
      ["C'est une voiture rapide.", "Das ist ein schnelles Auto."]
    ]),
    h("Die Stellung: meistens hinter dem Nomen"),
    p("Farben, Nationalitäten, Formen und die meisten langen Adjektive stehen **hinter** dem Nomen: *une voiture rouge*, *un ami allemand*. Eine kleine Gruppe kurzer, sehr häufiger Adjektive steht **vor** dem Nomen. Merkhilfe **BAGS** (Beauty, Age, Goodness, Size):"),
    tb(["Gruppe", "Adjektive"], [
      ["Beauty (Schönheit)", "beau, joli"],
      ["Age (Alter)", "jeune, vieux, nouveau, ancien (im Sinn von „ehemalig“)"],
      ["Goodness (Güte)", "bon, mauvais, gentil, meilleur"],
      ["Size (Größe)", "grand, petit, gros, long, court, haut"]
    ]),
    p("Dazu zählen auch *premier, deuxième …, dernier, autre, même*."),
    h("Besondere Formen: beau, nouveau, vieux"),
    tb(["", "m. Sg.", "m. Sg. vor Vokal", "w. Sg.", "m. Pl.", "w. Pl."], [
      ["schön", "beau", "bel", "belle", "beaux", "belles"],
      ["neu", "nouveau", "nouvel", "nouvelle", "nouveaux", "nouvelles"],
      ["alt", "vieux", "vieil", "vieille", "vieux", "vieilles"]
    ], "Beispiele: un bel homme, un nouvel ami, un vieil arbre."),
    h("Die Farben"),
    voc("Les couleurs", [
      ["rouge", "rot"], ["bleu(e)", "blau"], ["vert(e)", "grün"], ["jaune", "gelb"], ["noir(e)", "schwarz"], ["blanc / blanche", "weiß"],
      ["gris(e)", "grau"], ["orange", "orange (unveränderlich)"], ["rose", "rosa"], ["marron", "braun (unveränderlich)"], ["violet(te)", "lila"]
    ]),
    h("Vergleichen"),
    tb(["Vergleich", "Muster", "Beispiel"], [
      ["mehr", "plus + Adjektiv + que", "Paul est plus grand que Marc."],
      ["weniger", "moins + Adjektiv + que", "Elle est moins timide que lui."],
      ["gleich", "aussi + Adjektiv + que", "Ce film est aussi long que l'autre."],
      ["der/die/das Beste", "le/la/les plus/moins + Adj.", "C'est le plus grand musée de la ville."]
    ], "Besonderheit: *bon → meilleur* (nicht plus bon): Ce vin est meilleur. Aber *bien → mieux* (Adverb): Il chante mieux."),
    dlg("Au magasin de vêtements", [
      ["A", "Bonjour, je cherche une robe rouge.", "Guten Tag, ich suche ein rotes Kleid."],
      ["B", "Voici une belle robe rouge. Elle est très jolie.", "Hier ist ein schönes rotes Kleid. Es ist sehr hübsch."],
      ["A", "Elle est trop grande. Avez-vous une taille plus petite ?", "Es ist zu groß. Haben Sie eine kleinere Größe?"],
      ["B", "Oui, voilà. Elle est moins chère aussi.", "Ja, bitte. Es ist auch günstiger."]
    ])
  ],
  x: [
    xg("Übung 1 – Adjektive", "Exercice 1 – Adjectifs", [
      mc("Die weibliche Form von *heureux* ist …", ["heureuxe", "heureuse", "heureuze", "heureuve"], 1, "-eux → -euse."),
      mc("Welcher Satz ist richtig?", ["Une voiture rouge.", "Une rouge voiture.", "Une voiture rougée.", "Un voiture rouge."], 0, "Farben stehen hinter dem Nomen."),
      mc("Der Plural von *un beau cheval* ist …", ["des beaux chevaux", "des beau chevals", "des beaus chevaux", "des beaux chevals"], 0, "beau → beaux, cheval → chevaux."),
      mc("Welche Form passt: ___ hôtel (neu)?", ["nouveau", "nouvel", "nouvelle", "nouveaux"], 1, "Vor Vokal / stummem h: nouvel hôtel."),
      gap("Une ___ maison. (grand, weiblich)", "grande", "grande."),
      gap("Les fleurs sont ___. (blanc, Plural weiblich)", "blanches", "blanches."),
      gap("Paul est ___ grand que Marc. (größer als)", "plus", "plus … que."),
      gap("Ce vin est ___ . (besser)", "meilleur", "bon → meilleur."),
      ord(["Elle", "a", "une", "belle", "voiture", "."], "Elle a une belle voiture .", "belle steht vor dem Nomen (BAGS)."),
      mat([["rouge", "rot"], ["jaune", "gelb"], ["noir", "schwarz"], ["vert", "grün"], ["gris", "grau"]])
    ])
  ]
});

D.add({ id: "a1-modalverben", lv: "A1", t: ["pouvoir, vouloir, devoir, savoir", "pouvoir, vouloir, devoir, savoir"], s: ["Können, wollen, müssen, wissen – mit Infinitiv, Höflichkeitsformen.", "Verbes modaux et politesse."], k: "modalverben pouvoir vouloir devoir savoir koennen wollen muessen wissen je voudrais infinitiv",
  b: [
    p("Diese vier Verben sind unregelmäßig und extrem häufig. Das zweite Verb steht danach im **Infinitiv**: *Je peux venir. Il veut manger. Nous devons partir.*"),
    tb(["", "pouvoir (können)", "vouloir (wollen)", "devoir (müssen)", "savoir (wissen, können)"], [
      ["je", "je peux", "je veux", "je dois", "je sais"],
      ["tu", "tu peux", "tu veux", "tu dois", "tu sais"],
      ["il / elle / on", "il peut", "il veut", "il doit", "il sait"],
      ["nous", "nous pouvons", "nous voulons", "nous devons", "nous savons"],
      ["vous", "vous pouvez", "vous voulez", "vous devez", "vous savez"],
      ["ils / elles", "ils peuvent", "ils veulent", "ils doivent", "ils savent"]
    ]),
    ex([
      ["Je peux ouvrir la fenêtre ?", "Kann ich das Fenster öffnen?"],
      ["Tu veux un café ?", "Willst du einen Kaffee?"],
      ["Nous devons travailler demain.", "Wir müssen morgen arbeiten."],
      ["Elle sait nager.", "Sie kann schwimmen.", "**savoir** = etwas gelernt haben (Fähigkeit), **pouvoir** = Möglichkeit/Erlaubnis."],
      ["Je ne sais pas.", "Ich weiß nicht."],
      ["Vous pouvez répéter, s'il vous plaît ?", "Können Sie das bitte wiederholen?"]
    ]),
    h("Höflich bitten"),
    p("Im Restaurant, im Geschäft und im Gespräch mit Fremden klingt **je voudrais** (ich möchte) viel höflicher als *je veux*:"),
    ex([
      ["Je voudrais un café, s'il vous plaît.", "Ich möchte einen Kaffee, bitte."],
      ["Pourriez-vous m'aider ?", "Könnten Sie mir helfen?"],
      ["Je voudrais réserver une table pour deux.", "Ich möchte einen Tisch für zwei reservieren."]
    ]),
    tip("*Je voudrais* ist die höfliche Form von vouloir (Konditional). Sie gehört zu den wichtigsten Wendungen für Reisen: **Je voudrais …** + Nomen oder Infinitiv."),
    h("Weitere nützliche Wendungen"),
    voc("Mit Infinitiv", [
      ["il faut + Infinitiv", "man muss / es ist nötig"],
      ["aimer + Infinitiv", "gern etwas tun"],
      ["aller + Infinitiv", "etwas tun werden"],
      ["il faut que …", "es ist nötig, dass … (später: Subjonctif)"]
    ])
  ],
  x: [
    xg("Übung 1 – Modalverben", "Exercice 1 – Verbes modaux", [
      gap("Je ___ venir demain. (pouvoir)", "peux", "je peux."),
      gap("Nous ___ partir. (devoir)", "devons", "nous devons."),
      gap("Tu ___ nager ? (savoir)", "sais", "tu sais."),
      gap("Ils ___ un taxi. (vouloir)", "veulent", "ils veulent."),
      mc("Welche Form ist höflicher?", ["Je veux un café.", "Je voudrais un café.", "Donne-moi un café.", "Je prends un café."], 1, "Je voudrais = höflich."),
      mc("Welcher Satz ist richtig?", ["Elle peut parle français.", "Elle peut parler français.", "Elle peut parlé français.", "Elle peut parlez français."], 1, "Nach den Modalverben steht der Infinitiv."),
      mc("*Savoir* bedeutet …", ["dürfen", "wissen / können (erlernt)", "müssen", "wollen"], 1, "savoir = wissen oder etwas gelernt haben."),
      ord(["Je", "voudrais", "un", "thé", "."], "Je voudrais un thé .", "Höfliche Bitte."),
      mat([["je peux", "ich kann"], ["je veux", "ich will"], ["je dois", "ich muss"], ["je sais", "ich weiß"], ["je voudrais", "ich möchte"]])
    ])
  ]
});

D.add({ id: "a1-tagesablauf", lv: "A1", t: ["Tagesablauf und reflexive Verben", "La journée et les verbes pronominaux"], s: ["se lever, se laver, s'habiller – Reflexivpronomen, Uhrzeiten im Alltag.", "Routine quotidienne."], k: "tagesablauf reflexiv pronominal se lever se laver s'habiller se coucher routine journee matin soir",
  b: [
    p("Reflexive Verben (**verbes pronominaux**) werden mit einem Pronomen gebildet, das auf das Subjekt zurückweist: *je me lève* = ich stehe auf (wörtlich: ich hebe mich). Sie sind im Französischen viel häufiger als im Deutschen."),
    tb(["", "se lever (aufstehen)", "se coucher (schlafen gehen)"], [
      ["je", "je me lève", "je me couche"],
      ["tu", "tu te lèves", "tu te couches"],
      ["il / elle / on", "il se lève", "il se couche"],
      ["nous", "nous nous levons", "nous nous couchons"],
      ["vous", "vous vous levez", "vous vous couchez"],
      ["ils / elles", "ils se lèvent", "ils se couchent"]
    ], "Vor Vokal: *je m'habille, tu t'appelles*. Bei *se lever* ändert sich das e zu è: je lève, mais nous levons."),
    voc("Mon quotidien", [
      ["se réveiller", "aufwachen"], ["se lever", "aufstehen"], ["se laver", "sich waschen"], ["se brosser les dents", "Zähne putzen"],
      ["s'habiller", "sich anziehen"], ["prendre le petit-déjeuner", "frühstücken"], ["aller au travail", "zur Arbeit gehen"], ["déjeuner", "zu Mittag essen"],
      ["rentrer", "nach Hause kommen"], ["dîner", "zu Abend essen"], ["se coucher", "schlafen gehen"], ["s'endormir", "einschlafen"]
    ]),
    h("Verneinung und Frage"),
    ex([
      ["Je ne me lève pas tôt le dimanche.", "Sonntags stehe ich nicht früh auf.", "ne steht vor dem Pronomen: ne me … pas."],
      ["À quelle heure tu te lèves ?", "Um wie viel Uhr stehst du auf?"],
      ["Elle s'habille vite.", "Sie zieht sich schnell an."]
    ]),
    h("Zeitangaben im Alltag"),
    tb(["Französisch", "Deutsch"], [
      ["le matin / l'après-midi / le soir", "morgens / nachmittags / abends"],
      ["tous les jours", "jeden Tag"],
      ["d'abord, puis, ensuite, enfin", "zuerst, dann, danach, schließlich"],
      ["souvent, parfois, rarement, jamais", "oft, manchmal, selten, nie"],
      ["toujours", "immer"]
    ]),
    dlg("Une journée normale", [
      ["A", "À quelle heure tu te lèves ?", "Um wie viel Uhr stehst du auf?"],
      ["B", "Je me lève à sept heures, puis je prends une douche.", "Ich stehe um sieben auf, dann dusche ich."],
      ["A", "Et tu prends le petit-déjeuner ?", "Und frühstückst du?"],
      ["B", "Oui, toujours. Après, je vais au travail en métro.", "Ja, immer. Danach fahre ich mit der Metro zur Arbeit."]
    ])
  ],
  x: [
    xg("Übung 1 – Reflexive Verben", "Exercice 1 – Verbes pronominaux", [
      gap("Je ___ lève à sept heures. (me/te)", "me", "je me lève."),
      gap("Tu ___ couches tard ? (te/se)", "te", "tu te couches."),
      gap("Nous ___ habillons. (nous/vous)", "nous", "nous nous habillons."),
      gap("Elle ___ réveille tôt. (s'/se)", "se", "elle se réveille."),
      mc("Wie lautet die Verneinung von *Il se lève.*?", ["Il ne se lève pas.", "Il se ne lève pas.", "Il se lève ne pas.", "Il ne lève se pas."], 0, "ne + Reflexivpronomen + Verb + pas."),
      mc("Was bedeutet *s'endormir*?", ["aufwachen", "einschlafen", "aufstehen", "träumen"], 1, "s'endormir = einschlafen."),
      ord(["Je", "me", "brosse", "les", "dents", "."], "Je me brosse les dents .", "Zähne putzen: se brosser les dents."),
      mat([["se lever", "aufstehen"], ["se coucher", "schlafen gehen"], ["s'habiller", "sich anziehen"], ["se laver", "sich waschen"], ["se réveiller", "aufwachen"]])
    ])
  ]
});

D.add({ id: "a1-imperativ", lv: "A1", t: ["Der Imperativ", "L'impératif"], s: ["Aufforderungen: tu, nous, vous, Verneinung, Pronomen.", "Donner un ordre ou un conseil."], k: "imperativ impératif aufforderung befehl bitte tu nous vous verneinung",
  b: [
    p("Der Imperativ hat drei Formen: **tu**, **nous** (Aufforderung „lasst uns …“) und **vous**. Das Pronomen wird weggelassen. Er entspricht dem Präsens, aber bei -er-Verben fehlt im **tu**-Imperativ das **-s**."),
    tb(["Infinitiv", "tu", "nous", "vous"], [
      ["parler", "Parle !", "Parlons !", "Parlez !"],
      ["finir", "Finis !", "Finissons !", "Finissez !"],
      ["attendre", "Attends !", "Attendons !", "Attendez !"],
      ["aller", "Va !", "Allons !", "Allez !"],
      ["être", "Sois !", "Soyons !", "Soyez !"],
      ["avoir", "Aie !", "Ayons !", "Ayez !"],
      ["faire", "Fais !", "Faisons !", "Faites !"]
    ]),
    ex([
      ["Écoute ! – Écoutez !", "Hör zu! – Hört/Hören Sie zu!"],
      ["Allons au cinéma !", "Gehen wir ins Kino!"],
      ["Sois gentil avec ta sœur.", "Sei nett zu deiner Schwester."],
      ["Ouvrez le livre à la page 10.", "Öffnen Sie das Buch auf Seite 10."]
    ]),
    h("Verneinung"),
    p("Ganz normal: **ne … pas** umschließt das Verb: *Ne parle pas ! Ne mangez pas ici ! N'attendons pas.*"),
    h("Imperativ mit Reflexivverben"),
    tb(["", "bejaht", "verneint"], [
      ["se lever", "Lève-toi ! · Levons-nous ! · Levez-vous !", "Ne te lève pas ! · Ne nous levons pas ! · Ne vous levez pas !"]
    ], "Bejaht: Pronomen **hinter** das Verb mit Bindestrich (te → toi). Verneint: Pronomen bleibt davor."),
    voc("Nützliche Aufforderungen", [
      ["Attention !", "Achtung!"], ["Viens ici !", "Komm her!"], ["Regarde !", "Schau!"], ["Dépêche-toi !", "Beeil dich!"],
      ["Répétez, s'il vous plaît.", "Wiederholen Sie bitte."], ["Parlez plus lentement.", "Sprechen Sie langsamer."], ["Prends ton temps.", "Lass dir Zeit."]
    ])
  ],
  x: [
    xg("Übung 1 – Imperativ", "Exercice 1 – Impératif", [
      gap("___ la porte ! (fermer, tu)", "Ferme", "Ferme la porte !"),
      gap("___ attention ! (faire, vous)", "Faites", "Faites attention !"),
      gap("___ gentil ! (être, tu)", "Sois", "Sois gentil !"),
      gap("___ au restaurant ! (aller, nous)", "Allons", "Allons au restaurant !"),
      mc("Welche Form ist richtig?", ["Tu parles !", "Parle !", "Parles !", "Parlons !"], 1, "Bei -er-Verben fällt im tu-Imperativ das -s weg."),
      mc("Wie verneint man *Mange !*?", ["Ne mange pas !", "Mange ne pas !", "Pas mange !", "Ne pas mange !"], 0, "ne … pas um das Verb."),
      mc("Bejahter Imperativ von *se dépêcher* (tu):", ["Te dépêche !", "Dépêche-toi !", "Dépêche-te !", "Tu dépêche !"], 1, "Pronomen hinter das Verb: Dépêche-toi !"),
      ord(["Ouvrez", "la", "fenêtre", "."], "Ouvrez la fenêtre .", "Imperativ vous."),
      mat([["Écoute !", "Hör zu!"], ["Attendez !", "Wartet!"], ["Allons-y !", "Gehen wir!"], ["Regarde !", "Schau!"], ["Dépêche-toi !", "Beeil dich!"]])
    ])
  ]
});

D.add({ id: "a1-praepositionen", lv: "A1", t: ["Präpositionen, Orte und Wege", "Prépositions, lieux et directions"], s: ["à, de, en, dans, sur, sous, chez – au, du, aux; nach dem Weg fragen.", "Prépositions de lieu, demander son chemin."], k: "praepositionen praeposition à de au du aux en dans sur sous chez wo woher weg richtung lieu direction",
  b: [
    p("Präpositionen verbinden Wörter und geben Ort, Richtung oder Zeit an. Die wichtigsten kurzen sind **à** (zu, in, an) und **de** (von, aus). Mit dem bestimmten Artikel verschmelzen sie."),
    h("Verschmelzung: à + Artikel, de + Artikel"),
    tb(["", "le", "la", "l'", "les"], [
      ["à + …", "au (au marché)", "à la (à la gare)", "à l'(à l'école)", "aux (aux États-Unis)"],
      ["de + …", "du (du livre)", "de la (de la ville)", "de l'(de l'hôtel)", "des (des amis)"]
    ]),
    ex([
      ["Je vais au cinéma, puis à la bibliothèque.", "Ich gehe ins Kino, dann in die Bibliothek."],
      ["Il parle du film de Paul.", "Er spricht über Pauls Film."],
      ["Elle revient de l'école.", "Sie kommt aus der Schule zurück."]
    ]),
    h("Ortsangaben"),
    tb(["Präposition", "Bedeutung", "Beispiel"], [
      ["à", "in / an / zu (bei Städten)", "J'habite à Lyon."],
      ["en", "in (Länder, feminin)", "en France, en Allemagne"],
      ["au / aux", "in (Länder, männlich/Plural)", "au Portugal, aux États-Unis"],
      ["dans", "in (drinnen)", "dans la chambre"],
      ["sur", "auf", "sur la table"],
      ["sous", "unter", "sous le lit"],
      ["devant / derrière", "vor / hinter", "devant la maison"],
      ["à côté de", "neben", "à côté de la banque"],
      ["entre", "zwischen", "entre le café et la poste"],
      ["en face de", "gegenüber", "en face de la gare"],
      ["près de / loin de", "in der Nähe von / weit weg von", "près de chez moi"],
      ["chez", "bei (Person)", "chez le médecin · chez moi"]
    ]),
    h("Woher? Von wo?"),
    p("*Je viens de* + Stadt: *Je viens de Berlin.* Länder weiblich: *de + Land* (*de France*), männlich: *du* (*du Maroc*), Plural: *des* (*des États-Unis*)."),
    h("Nach dem Weg fragen"),
    voc("Le chemin", [
      ["Où est … ?", "Wo ist …?"], ["Pour aller à … ?", "Wie komme ich zu …?"], ["tout droit", "geradeaus"], ["à gauche / à droite", "links / rechts"],
      ["au coin de la rue", "an der Straßenecke"], ["au feu rouge", "an der Ampel"], ["traverser", "überqueren"], ["tourner", "abbiegen"],
      ["la première rue à gauche", "die erste Straße links"], ["C'est loin ? – C'est à cinq minutes.", "Ist es weit? – Fünf Minuten."]
    ]),
    dlg("Pour aller à la gare ?", [
      ["A", "Excusez-moi, pour aller à la gare, s'il vous plaît ?", "Entschuldigung, wie komme ich zum Bahnhof?"],
      ["B", "Allez tout droit, puis prenez la deuxième rue à gauche.", "Gehen Sie geradeaus, dann die zweite Straße links."],
      ["A", "C'est loin ?", "Ist es weit?"],
      ["B", "Non, c'est à cinq minutes à pied, en face de la poste.", "Nein, fünf Minuten zu Fuß, gegenüber der Post."]
    ])
  ],
  x: [
    xg("Übung 1 – Präpositionen", "Exercice 1 – Prépositions", [
      gap("Je vais ___ marché. (à + le)", "au", "à + le = au."),
      gap("Il parle ___ film. (de + le)", "du", "de + le = du."),
      gap("Nous sommes ___ États-Unis. (à + les)", "aux", "aux."),
      gap("J'habite ___ France. (in + Land weiblich)", "en", "en France."),
      mc("*Le livre est ___ la table.* (auf)", ["dans", "sur", "sous", "chez"], 1, "sur = auf."),
      mc("Wie fragt man nach dem Weg?", ["Où est la gare ?", "Quelle heure est-il ?", "Combien ça coûte ?", "Comment tu t'appelles ?"], 0, "Où est … ? / Pour aller à … ?"),
      mc("*Chez le médecin* bedeutet …", ["beim Arzt", "im Arzt", "auf dem Arzt", "wegen des Arztes"], 0, "chez = bei (Person)."),
      ord(["La", "banque", "est", "à", "côté", "de", "la", "poste", "."], "La banque est à côté de la poste .", "à côté de = neben."),
      mat([["tout droit", "geradeaus"], ["à gauche", "links"], ["à droite", "rechts"], ["en face de", "gegenüber"], ["près de", "in der Nähe von"]])
    ])
  ]
});

D.add({ id: "a1-essen", lv: "A1", t: ["Essen, Trinken und Teilungsartikel", "Manger, boire et l'article partitif"], s: ["du, de la, des – Mengenangaben, Restaurant, bestellen.", "Au restaurant, quantités, partitif."], k: "essen trinken teilungsartikel partitif du de la des restaurant bestellen mengen beaucoup peu manger boire",
  b: [
    p("Für Mengen, die man nicht zählt (Wasser, Brot, Zeit), gibt es den **Teilungsartikel**: *du, de la, de l'*. Im Deutschen gibt es dafür keinen Artikel („Ich trinke Wasser“), im Französischen muss er stehen: **Je bois de l'eau.**"),
    tb(["", "männlich", "weiblich", "vor Vokal"], [
      ["Teilungsartikel", "du pain", "de la salade", "de l'eau"],
      ["Zählbar, Plural", "des légumes", "des pommes", ""]
    ]),
    ex([
      ["Je mange du pain et du fromage.", "Ich esse Brot und Käse."],
      ["Elle boit de l'eau.", "Sie trinkt Wasser."],
      ["Nous prenons des pâtes.", "Wir nehmen Nudeln."]
    ]),
    h("Nach Verneinung und Mengenangaben: de"),
    tb(["Situation", "Muster", "Beispiel"], [
      ["Verneinung", "pas de / pas d'", "Je ne mange pas de viande."],
      ["viel, wenig", "beaucoup de, peu de", "beaucoup de sucre · peu de temps"],
      ["Maße", "un verre de, une bouteille de", "un verre de vin · une bouteille d'eau"],
      ["Gewicht", "un kilo de, 200 grammes de", "un kilo de pommes"],
      ["genug, zu viel", "assez de, trop de", "trop de sel"]
    ]),
    voc("Le repas", [
      ["le pain", "Brot"], ["le fromage", "Käse"], ["le beurre", "Butter"], ["le lait", "Milch"], ["l'œuf (m.)", "Ei"], ["la viande", "Fleisch"], ["le poisson", "Fisch"],
      ["le poulet", "Hähnchen"], ["les légumes (m.)", "Gemüse"], ["les fruits (m.)", "Obst"], ["le riz / les pâtes", "Reis / Nudeln"], ["le gâteau", "Kuchen"],
      ["l'eau (f.)", "Wasser"], ["le café / le thé", "Kaffee / Tee"], ["le jus d'orange", "Orangensaft"], ["le vin", "Wein"], ["la bière", "Bier"]
    ]),
    h("Im Restaurant"),
    voc("Au restaurant", [
      ["Une table pour deux, s'il vous plaît.", "Einen Tisch für zwei, bitte."], ["La carte, s'il vous plaît.", "Die Speisekarte, bitte."],
      ["Je voudrais … / Je vais prendre …", "Ich möchte … / Ich nehme …"], ["Comme entrée / plat / dessert", "als Vorspeise / Hauptgericht / Nachtisch"],
      ["L'addition, s'il vous plaît.", "Die Rechnung, bitte."], ["C'est délicieux !", "Das ist köstlich!"], ["Bon appétit !", "Guten Appetit!"], ["Je suis végétarien(ne).", "Ich bin Vegetarier(in)."]
    ]),
    dlg("Au restaurant", [
      ["Serveur", "Bonsoir. Vous avez choisi ?", "Guten Abend. Haben Sie gewählt?"],
      ["Client", "Oui, je voudrais du poulet avec du riz, s'il vous plaît.", "Ja, ich möchte Hähnchen mit Reis, bitte."],
      ["Serveur", "Et comme boisson ?", "Und als Getränk?"],
      ["Client", "Une bouteille d'eau et un café après.", "Eine Flasche Wasser und danach einen Kaffee."]
    ])
  ],
  x: [
    xg("Übung 1 – Teilungsartikel", "Exercice 1 – Le partitif", [
      gap("Je mange ___ pain. (du/de la)", "du", "du pain."),
      gap("Elle boit ___ eau. (de l'/du)", "de l'", "de l'eau."),
      gap("Nous prenons ___ soupe. (de la/du)", "de la", "de la soupe."),
      gap("Je ne mange pas ___ viande. (de/du)", "de", "Nach Verneinung: de."),
      gap("Il y a beaucoup ___ monde. (de/du)", "de", "beaucoup de."),
      mc("Welcher Satz ist richtig?", ["Je bois eau.", "Je bois de l'eau.", "Je bois l'eau.", "Je bois des eau."], 1, "Mengen brauchen den Teilungsartikel."),
      mc("Wie bestellt man höflich?", ["Donnez-moi du café !", "Je voudrais un café, s'il vous plaît.", "Café !", "Je prends café."], 1, "Je voudrais + s'il vous plaît."),
      ord(["Je", "voudrais", "de", "l'eau", ",", "s'il", "vous", "plaît", "."], "Je voudrais de l'eau , s'il vous plaît .", "Höfliche Bestellung."),
      mat([["le pain", "Brot"], ["le fromage", "Käse"], ["la viande", "Fleisch"], ["l'addition", "Rechnung"], ["Bon appétit !", "Guten Appetit!"]])
    ])
  ]
});

D.add({ id: "a1-wohnen", lv: "A1", t: ["Wohnen, Wetter und il y a", "Le logement et la météo"], s: ["Zimmer, Möbel, Wohnung beschreiben, Wetter, Jahreszeiten.", "Pièces, meubles, temps qu'il fait."], k: "wohnen wohnung zimmer moebel wetter jahreszeiten logement meteo il fait chambre cuisine saison pleuvoir",
  b: [
    p("Mit *il y a* (es gibt) und den Verben *avoir* und *être* beschreibt man Wohnung und Umgebung."),
    voc("Le logement", [
      ["l'appartement (m.)", "Wohnung"], ["la maison", "Haus"], ["la chambre", "Schlafzimmer"], ["le salon", "Wohnzimmer"], ["la cuisine", "Küche"],
      ["la salle de bains", "Badezimmer"], ["les toilettes (f.)", "Toilette"], ["le balcon", "Balkon"], ["le jardin", "Garten"], ["le garage", "Garage"],
      ["le lit", "Bett"], ["l'armoire (f.)", "Schrank"], ["le canapé", "Sofa"], ["la table / la chaise", "Tisch / Stuhl"], ["le frigo", "Kühlschrank"]
    ]),
    ex([
      ["J'habite dans un appartement au deuxième étage.", "Ich wohne in einer Wohnung im zweiten Stock.", "Der Erdgeschoss heißt **rez-de-chaussée**; **le premier étage** ist der 1. Stock (in Deutschland: 2. Stock)."],
      ["Il y a trois pièces et un balcon.", "Es gibt drei Zimmer und einen Balkon."],
      ["Le loyer est de 800 euros par mois.", "Die Miete beträgt 800 Euro im Monat."]
    ]),
    h("Das Wetter (la météo)"),
    p("Wetter wird meist mit **il fait** (es macht) gesagt, nicht mit être: *Il fait beau.* Regen und Schnee sind Verben: *Il pleut. Il neige.*"),
    tb(["Französisch", "Deutsch"], [
      ["Il fait beau.", "Es ist schönes Wetter."], ["Il fait mauvais.", "Es ist schlechtes Wetter."], ["Il fait chaud / froid.", "Es ist warm / kalt."],
      ["Il fait 20 degrés.", "Es sind 20 Grad."], ["Il pleut.", "Es regnet."], ["Il neige.", "Es schneit."], ["Il y a du vent / du soleil / des nuages.", "Es ist windig / sonnig / bewölkt."],
      ["Il y a de l'orage.", "Es gewittert."]
    ]),
    voc("Les saisons", [["le printemps", "Frühling"], ["l'été (m.)", "Sommer"], ["l'automne (m.)", "Herbst"], ["l'hiver (m.)", "Winter"]]),
    tip("Jahreszeiten: **en** été, en automne, en hiver – aber **au** printemps."),
    dlg("Quel temps fait-il ?", [
      ["A", "Il fait beau aujourd'hui ?", "Ist heute schönes Wetter?"],
      ["B", "Oui, il y a du soleil, mais il fait un peu froid.", "Ja, es ist sonnig, aber ein bisschen kalt."],
      ["A", "Et demain ?", "Und morgen?"],
      ["B", "Demain, il va pleuvoir.", "Morgen wird es regnen."]
    ])
  ],
  x: [
    xg("Übung 1 – Wohnen und Wetter", "Exercice 1 – Logement et météo", [
      mc("Wie sagt man „Es regnet“?", ["Il est pluie.", "Il pleut.", "Il fait pluie.", "Il y a pluie."], 1, "pleuvoir → il pleut."),
      mc("*Il fait chaud* bedeutet …", ["Es ist warm.", "Es ist nass.", "Es ist dunkel.", "Es schneit."], 0, "chaud = warm/heiß."),
      mc("Welche Jahreszeit steht mit *au*?", ["été", "automne", "printemps", "hiver"], 2, "au printemps; en été/automne/hiver."),
      gap("Dans la ___ , il y a un lit. (Schlafzimmer)", "chambre", "la chambre."),
      gap("Nous mangeons dans la ___ . (Küche)", "cuisine", "la cuisine."),
      gap("Il y ___ un jardin. (a)", "a", "il y a."),
      ord(["Il", "fait", "froid", "en", "hiver", "."], "Il fait froid en hiver .", "Wetter mit il fait."),
      mat([["la cuisine", "Küche"], ["le salon", "Wohnzimmer"], ["le balcon", "Balkon"], ["le lit", "Bett"], ["le loyer", "Miete"]])
    ])
  ]
});

D.add({ id: "a1-zukunft", lv: "A1", t: ["Futur proche und passé récent", "Le futur proche et le passé récent"], s: ["aller + Infinitiv (bald) und venir de + Infinitiv (gerade eben).", "Parler du futur et du passé immédiat."], k: "futur proche aller infinitiv passe recent venir de zukunft gerade eben bald demain",
  b: [
    p("Mit zwei einfachen Konstruktionen sprichst du über Zukunft und jüngste Vergangenheit, ohne neue Zeitformen zu lernen – nur mit **aller** und **venir** + Infinitiv."),
    h("Futur proche: aller + Infinitiv"),
    p("Bedeutung: „etwas werden / gleich tun“. Das ist die Alltags-Zukunft im Französischen."),
    tb(["", "aller (gehen) + manger"], [
      ["je", "je vais manger"], ["tu", "tu vas manger"], ["il / elle / on", "il va manger"],
      ["nous", "nous allons manger"], ["vous", "vous allez manger"], ["ils / elles", "ils vont manger"]
    ]),
    ex([
      ["Demain, je vais travailler à la maison.", "Morgen werde ich zu Hause arbeiten."],
      ["Nous allons partir en vacances en août.", "Wir werden im August in den Urlaub fahren."],
      ["Il ne va pas venir.", "Er wird nicht kommen.", "Verneinung: ne … pas um **aller**."]
    ]),
    h("Passé récent: venir de + Infinitiv"),
    p("Bedeutung: „gerade eben etwas getan haben“."),
    tb(["", "venir (kommen) + de + finir"], [
      ["je", "je viens de finir"], ["tu", "tu viens de finir"], ["il / elle / on", "il vient de finir"],
      ["nous", "nous venons de finir"], ["vous", "vous venez de finir"], ["ils / elles", "ils viennent de finir"]
    ]),
    ex([
      ["Je viens de manger.", "Ich habe gerade gegessen."],
      ["Elle vient d'arriver.", "Sie ist gerade angekommen."],
      ["Nous venons de recevoir ton message.", "Wir haben gerade deine Nachricht bekommen."]
    ]),
    voc("Zeitangaben", [
      ["demain / après-demain", "morgen / übermorgen"], ["bientôt", "bald"], ["tout à l'heure", "gleich / vorhin"], ["la semaine prochaine", "nächste Woche"],
      ["le mois prochain", "nächsten Monat"], ["l'année prochaine", "nächstes Jahr"], ["hier", "gestern"], ["il y a deux jours", "vor zwei Tagen"]
    ]),
    dlg("Projets", [
      ["A", "Qu'est-ce que tu vas faire ce week-end ?", "Was wirst du dieses Wochenende machen?"],
      ["B", "Je vais rendre visite à mes parents. Et toi ?", "Ich werde meine Eltern besuchen. Und du?"],
      ["A", "Moi, je viens de réserver un billet de train pour Paris.", "Ich habe gerade eine Fahrkarte nach Paris gebucht."]
    ])
  ],
  x: [
    xg("Übung 1 – Zukunft und Vergangenheit", "Exercice 1 – Futur proche, passé récent", [
      gap("Demain, je ___ travailler. (aller)", "vais", "je vais travailler."),
      gap("Nous ___ partir. (aller)", "allons", "nous allons."),
      gap("Elle ___ de finir. (venir)", "vient", "elle vient de finir."),
      gap("Ils ___ d'arriver. (venir)", "viennent", "ils viennent d'arriver."),
      mc("*Je viens de manger* bedeutet …", ["Ich werde essen.", "Ich habe gerade gegessen.", "Ich esse nie.", "Ich muss essen."], 1, "venir de = gerade eben."),
      mc("Welcher Satz ist die Zukunft?", ["Je viens de partir.", "Je vais partir.", "Je pars toujours.", "Je suis parti."], 1, "aller + Infinitiv."),
      ord(["Elle", "ne", "va", "pas", "venir", "."], "Elle ne va pas venir .", "ne … pas um aller."),
      mat([["demain", "morgen"], ["hier", "gestern"], ["bientôt", "bald"], ["la semaine prochaine", "nächste Woche"], ["tout à l'heure", "gleich"]])
    ])
  ]
});

D.add({ id: "a1-einkaufen", lv: "A1", t: ["Einkaufen, Preise und Geld", "Faire les courses et les prix"], s: ["Preise nennen, combien, ce / cet / cette, im Geschäft.", "Demander le prix, démonstratifs."], k: "einkaufen preise geld euro combien ca coute ce cet cette ces demonstrativ geschaeft magasin acheter prix",
  b: [
    p("Beim Einkaufen brauchst du Zahlen (Lektion 3), den Satz *Combien ça coûte ?* und die Demonstrativbegleiter „dieser, diese, dieses“."),
    h("Demonstrativbegleiter"),
    tb(["", "Singular", "Plural"], [
      ["männlich", "ce livre · **cet** homme (vor Vokal)", "ces livres"],
      ["weiblich", "cette robe", "ces robes"]
    ]),
    p("Soll „dieser hier / dort“ unterschieden werden, hängt man **-ci** (hier) oder **-là** (dort) an: *ce pull-ci, ce pull-là*."),
    h("Preise"),
    ex([
      ["Combien ça coûte ? – Ça coûte douze euros cinquante.", "Wie viel kostet das? – Es kostet 12,50 €."],
      ["C'est combien ?", "Wie viel ist das?"],
      ["C'est trop cher.", "Das ist zu teuer."],
      ["Vous acceptez les cartes ?", "Akzeptieren Sie Karten?"],
      ["Je paie en espèces / par carte.", "Ich zahle bar / mit Karte."]
    ]),
    voc("Au magasin", [
      ["acheter", "kaufen"], ["vendre", "verkaufen"], ["payer", "bezahlen"], ["le prix", "Preis"], ["moins cher / plus cher", "billiger / teurer"], ["la taille", "Größe (Kleidung)"],
      ["la pointure", "Schuhgröße"], ["essayer", "anprobieren"], ["le sac", "Tüte / Tasche"], ["la caisse", "Kasse"], ["le ticket / le reçu", "Kassenbon"], ["en solde", "im Angebot / Schlussverkauf"],
      ["la boulangerie", "Bäckerei"], ["la pharmacie", "Apotheke"], ["le supermarché", "Supermarkt"], ["le marché", "Markt"]
    ]),
    dlg("À la boulangerie", [
      ["Vendeuse", "Bonjour monsieur, qu'est-ce que je vous sers ?", "Guten Tag, was darf es sein?"],
      ["Client", "Une baguette et deux croissants, s'il vous plaît.", "Ein Baguette und zwei Croissants, bitte."],
      ["Vendeuse", "Voilà. Ça fait trois euros dix.", "Bitte sehr. Das macht 3,10 €."],
      ["Client", "Voici cinq euros.", "Hier sind fünf Euro."],
      ["Vendeuse", "Et voilà votre monnaie. Bonne journée !", "Und hier Ihr Wechselgeld. Schönen Tag!"]
    ])
  ],
  x: [
    xg("Übung 1 – Einkaufen", "Exercice 1 – Les courses", [
      gap("___ robe est belle. (diese)", "Cette", "cette robe."),
      gap("___ homme est grand. (dieser, vor Vokal)", "Cet", "cet homme."),
      gap("___ livres sont chers. (diese, Plural)", "Ces", "ces livres."),
      mc("Wie fragt man nach dem Preis?", ["Combien ça coûte ?", "Comment ça va ?", "Où est-ce que c'est ?", "Quand ça ouvre ?"], 0, "Combien ça coûte ?"),
      mc("*C'est trop cher* bedeutet …", ["Es ist zu billig.", "Es ist zu teuer.", "Es ist zu groß.", "Es ist zu klein."], 1, "trop cher = zu teuer."),
      mc("Wo kauft man Brot?", ["à la pharmacie", "à la boulangerie", "à la poste", "à la banque"], 1, "boulangerie = Bäckerei."),
      ord(["Je", "voudrais", "ce", "pull", "-ci", "."], "Je voudrais ce pull -ci .", "ce pull-ci = dieser Pullover hier."),
      mat([["la caisse", "Kasse"], ["le prix", "Preis"], ["acheter", "kaufen"], ["payer", "bezahlen"], ["la pharmacie", "Apotheke"]])
    ])
  ]
});
})();
