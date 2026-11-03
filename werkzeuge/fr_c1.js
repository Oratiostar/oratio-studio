// Französischkurs C1 – Lektionen.
(function(){
var D = FZ, p = D.p, h = D.h, tip = D.tip, warn = D.warn, ul = D.ul, tb = D.tb, ex = D.ex, voc = D.voc, dlg = D.dlg, mc = D.mc, gap = D.gap, ord = D.ord, mat = D.mat, xg = D.xg;

D.add({ id: "c1-passe-simple", lv: "C1", t: ["Passé simple und literarische Zeiten", "Le passé simple"], s: ["Lesen können: Formen, Gebrauch, Erzählzeiten in Romanen.", "Reconnaître le passé simple."], k: "passe simple literatur roman il parla il fut il eut il vint ils firent imparfait du subjonctif",
  b: [
    p("Das **passé simple** ist die Erzählzeit der Literatur und der Geschichtsschreibung. Gesprochen wird es nicht, aber du musst es **sofort erkennen**. Aktiv nutzt man fast nur die 3. Person."),
    tb(["Gruppe", "Endungen (il / ils)", "Beispiel"], [
      ["-er", "-a / -èrent", "il parla · ils parlèrent"],
      ["-ir, -re (regelmäßig)", "-it / -irent", "il finit · il vendit"],
      ["viele andere", "-ut / -urent", "il eut · il fut · il put · il voulut · il crut · il lut"],
      ["venir, tenir", "-int / -inrent", "il vint · il tint · ils vinrent"]
    ]),
    tb(["Infinitiv", "il / elle", "ils / elles"], [["être", "fut", "furent"], ["avoir", "eut", "eurent"], ["faire", "fit", "firent"], ["dire", "dit", "dirent"], ["voir", "vit", "virent"], ["prendre", "prit", "prirent"], ["aller", "alla", "allèrent"]]),
    ex([
      ["Il ouvrit la porte et entra.", "Er öffnete die Tür und trat ein."],
      ["Napoléon naquit en 1769.", "Napoleon wurde 1769 geboren."],
      ["Elle comprit alors qu'il était trop tard.", "Da begriff sie, dass es zu spät war."]
    ]),
    tip("Im Roman: **passé simple** = Handlung, **imparfait** = Hintergrund. Genau wie passé composé / imparfait im Gespräch."),
    p("Der **subjonctif imparfait** (*qu'il fût, qu'elle eût, qu'il vînt*) erscheint nur noch in gehobener Schrift. Als Leser reicht Erkennen.")
  ],
  x: [xg("Übung 1 – Passé simple", "Exercice 1 – Passé simple", [
    gap("Il ___ la porte. (ouvrir, passé simple)", "ouvrit", "ouvrit."),
    gap("Elle ___ alors la vérité. (comprendre)", "comprit", "comprit."),
    gap("Ils ___ au village. (aller)", "allèrent", "allèrent."),
    gap("Il ___ roi en 1500. (être)", "fut", "fut."),
    mc("*Il fit* =", ["er macht", "er machte (lit.)", "er wird machen", "er hätte gemacht"], 1, "faire → fit."),
    mc("*Ils vinrent* =", ["sie kamen", "sie kommen", "sie wären gekommen", "sie sind gekommen"], 0, "venir → vinrent."),
    ord(["Il", "prit", "son", "manteau", "et", "sortit", "."], "Il prit son manteau et sortit .", "Handlungen."),
    mat([["il eut", "er hatte"], ["il dit", "er sagte"], ["il vit", "er sah"], ["il put", "er konnte"], ["il tint", "er hielt"]])
  ])]
});

D.add({ id: "c1-redewendungen", lv: "C1", t: ["Redewendungen und Sprichwörter", "Expressions idiomatiques"], s: ["Bildhafte Sprache, die man nicht wörtlich übersetzen darf.", "Les expressions imagées."], k: "redewendungen sprichworter idiome expressions avoir le cafard poser un lapin tomber dans les pommes coup de foudre",
  b: [
    p("Redewendungen sind der Unterschied zwischen „gut“ und „natürlich“. Lerne sie als **feste Blöcke**."),
    tb(["Französisch", "Wörtlich", "Bedeutung"], [
      ["avoir le cafard", "die Küchenschabe haben", "niedergeschlagen sein"],
      ["poser un lapin à quelqu'un", "jmdm. ein Kaninchen setzen", "jmdn. versetzen"],
      ["tomber dans les pommes", "in die Äpfel fallen", "in Ohnmacht fallen"],
      ["avoir un coup de foudre", "einen Blitzschlag haben", "sich Hals über Kopf verlieben"],
      ["coûter les yeux de la tête", "die Augen des Kopfes kosten", "sehr teuer sein"],
      ["se casser la tête", "sich den Kopf zerbrechen", "sich den Kopf zerbrechen"],
      ["il pleut des cordes", "es regnet Seile", "es gießt in Strömen"],
      ["c'est la fin des haricots", "das ist das Ende der Bohnen", "jetzt ist alles aus"],
      ["donner sa langue au chat", "seine Zunge der Katze geben", "aufgeben (beim Raten)"],
      ["avoir la main verte", "grüne Hand haben", "einen grünen Daumen haben"],
      ["ce n'est pas la mer à boire", "das ist nicht das Meer zum Trinken", "so schwer ist es nicht"],
      ["mettre son grain de sel", "sein Salzkorn dazugeben", "seinen Senf dazugeben"]
    ]),
    h("Sprichwörter"),
    ex([
      ["Petit à petit, l'oiseau fait son nid.", "Kleine Schritte führen zum Ziel.", "Wörtlich: Nach und nach baut der Vogel sein Nest."],
      ["Qui s'y frotte s'y pique.", "Wer sich daran reibt, sticht sich.", "Wer sich anlegt, zahlt."],
      ["L'habit ne fait pas le moine.", "Das Kleid macht nicht den Mönch.", "Der Schein trügt."],
      ["Chacun son métier, les vaches seront bien gardées.", "Jeder sein Handwerk.", "Jeder soll bei seinem Fach bleiben."]
    ]),
    warn("Redewendungen **nie wörtlich** übersetzen! *Il pleut des cordes* ist französisch – „es regnet Katzen und Hunde“ gibt es dort nicht.")
  ],
  x: [xg("Übung 1 – Redewendungen", "Exercice 1 – Expressions", [
    mc("*Poser un lapin* =", ["jmdn. versetzen", "jagen", "essen", "begrüßen"], 0, "versetzen."),
    mc("*Il pleut des cordes* =", ["es nieselt", "es gießt", "es schneit", "es ist neblig"], 1, "es gießt."),
    mc("*Avoir le cafard* =", ["traurig sein", "krank sein", "hungrig sein", "reich sein"], 0, "niedergeschlagen."),
    mc("*Coûter les yeux de la tête* =", ["billig", "sehr teuer", "unsichtbar", "gefährlich"], 1, "sehr teuer."),
    gap("Donner sa langue au ___ (aufgeben)", "chat", "chat."),
    gap("Avoir la main ___ (grüner Daumen)", "verte", "verte."),
    ord(["L'", "habit", "ne", "fait", "pas", "le", "moine", "."], "L' habit ne fait pas le moine .", "Sprichwort."),
    mat([["un coup de foudre", "Liebe auf den ersten Blick"], ["tomber dans les pommes", "ohnmächtig werden"], ["se casser la tête", "grübeln"], ["mettre son grain de sel", "seinen Senf dazugeben"]])
  ])]
});

D.add({ id: "c1-nuancen", lv: "C1", t: ["Nuancen: Modalpartikeln, Betonung, Stil", "Nuances et style"], s: ["Wortstellung für Betonung, Hervorhebung, Auslassung, Satzmelodie.", "Mise en relief."], k: "nuancen hervorhebung c'est qui c'est que mise en relief dislokation stil wortstellung inversion stilistisch",
  b: [
    h("Hervorheben mit c'est … qui / que"),
    ex([
      ["C'est Paul qui a gagné.", "Paul hat gewonnen (und kein anderer)."],
      ["C'est demain que je pars.", "Gerade morgen fahre ich ab."],
      ["Ce qui m'intéresse, c'est la musique.", "Was mich interessiert, ist die Musik."]
    ]),
    h("Dislokation (typisch gesprochen)"),
    ex([
      ["Moi, je n'aime pas ça.", "Ich mag das nicht."],
      ["Ce livre, je l'ai déjà lu.", "Dieses Buch, das habe ich schon gelesen."],
      ["Il est sympa, ton frère.", "Er ist nett, dein Bruder."]
    ]),
    h("Stilistische Inversion (Schrift)"),
    ul(["nach *peut-être, sans doute, aussi (=deshalb), à peine*: *Peut-être viendra-t-il.* · *À peine était-il arrivé que …*", "nach direkter Rede: *« Venez », dit-il.*", "nach Relativsatz: *Voici le livre qu'a écrit mon père.*"]),
    h("Satzakzente"),
    tb(["Kurz / neutral", "Betont / stilistisch"], [
      ["Je ne sais pas.", "Je n'en sais rien. / Je ne saurais le dire."],
      ["Il est parti.", "Le voilà parti."],
      ["Très bien.", "Fort bien. / On ne peut mieux."],
      ["Je veux bien.", "Volontiers. / Avec plaisir."]
    ]),
    tip("Franzosen sprechen oft mit **Rhythmus**: Das Wichtigste kommt ans Satzende oder wird vorangestellt und mit einem Pronomen wieder aufgenommen (Dislokation).")
  ],
  x: [xg("Übung 1 – Hervorhebung", "Exercice 1 – Mise en relief", [
    gap("C'est Paul ___ a gagné.", "qui", "c'est … qui."),
    gap("C'est demain ___ je pars.", "que", "c'est … que."),
    gap("Ce livre, je ___ ai lu. (ihn)", "l'", "l'ai lu."),
    gap("Ce ___ m'intéresse, c'est la musique.", "qui", "ce qui."),
    mc("*Peut-être* am Satzanfang kann …", ["Inversion auslösen", "nie stehen", "futur", "Imperativ"], 0, "Peut-être viendra-t-il."),
    mc("*À peine … que* =", ["kaum … da", "obwohl", "weil", "damit"], 0, "kaum … da."),
    ord(["Il", "est", "sympa", ",", "ton", "frère", "."], "Il est sympa , ton frère .", "Dislokation."),
    mat([["c'est … qui", "Subjekt hervorheben"], ["c'est … que", "Objekt/Zeit hervorheben"], ["à peine", "kaum"], ["sans doute", "wahrscheinlich"]])
  ])]
});

D.add({ id: "c1-schreiben", lv: "C1", t: ["Formelle Texte schreiben", "Rédiger des textes formels"], s: ["Beschwerde, Motivationsschreiben, Leserbrief, Zusammenfassung.", "Lettres, synthèses, résumés."], k: "schreiben brief beschwerde motivationsschreiben bewerbung leserbrief zusammenfassung synthese lettre de motivation",
  b: [
    h("Formelle Briefe und E-Mails"),
    tb(["Teil", "Formel"], [
      ["Absender, Datum, Ort", "Paris, le 3 novembre 2026"],
      ["Betreff", "Objet : réclamation concernant la commande n° 4521"],
      ["Anrede", "Madame, Monsieur, (wenn Name unbekannt)"],
      ["Einleitung", "Je me permets de vous écrire au sujet de … · Suite à notre entretien du …"],
      ["Hauptteil", "Je constate que … · Je vous serais reconnaissant(e) de bien vouloir …"],
      ["Schluss", "Dans l'attente de votre réponse, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées."]
    ]),
    h("Motivationsschreiben (lettre de motivation)"),
    ul(["**Bezug:** *Votre annonce parue sur … a retenu toute mon attention.*", "**Profil:** *Titulaire d'un diplôme de …, j'ai acquis une expérience de … ans dans …*", "**Motivation:** *Votre entreprise, reconnue pour …, correspond à mon projet professionnel.*", "**Schluss:** *Je me tiens à votre disposition pour un entretien.*"]),
    h("Zusammenfassung (synthèse / résumé)"),
    ul(["Eigene Worte, **keine Zitate**, keine eigene Meinung", "Gleiche Reihenfolge der Ideen, Länge ca. ein Drittel", "Präsens, Konnektoren: *l'auteur affirme que, il en résulte que, en revanche*"]),
    warn("Im Französischen schließt ein Brief **nicht** mit „Mit freundlichen Grüßen“ wörtlich, sondern mit einer langen Höflichkeitsformel. Je höher der Rang des Adressaten, desto länger die Formel."),
    voc("Nützliche Verben", [["constater", "feststellen"], ["déplorer", "bedauern"], ["exiger", "verlangen"], ["solliciter", "ersuchen"], ["joindre", "beifügen"], ["certifier", "bescheinigen"], ["se prévaloir de", "sich berufen auf"], ["donner suite à", "weiterverfolgen"]])
  ],
  x: [xg("Übung 1 – Formelle Texte", "Exercice 1 – Textes formels", [
    gap("Dans l'___ de votre réponse… (Erwartung)", "attente", "attente."),
    gap("Je me ___ de vous écrire. (erlaube mir)", "permets", "je me permets."),
    gap("Je me ___ à votre disposition. (halte mich bereit)", "tiens", "je me tiens."),
    gap("Je vous serais ___ de bien vouloir… (dankbar)", "reconnaissant", "reconnaissant."),
    mc("Anrede ohne bekannten Namen:", ["Salut,", "Madame, Monsieur,", "Chers amis,", "Hé,"], 1, "Madame, Monsieur."),
    mc("In einer Zusammenfassung vermeidet man …", ["Konnektoren", "eigene Meinung", "Präsens", "Absätze"], 1, "keine eigene Meinung."),
    ord(["Je", "vous", "prie", "d'", "agréer", "mes", "salutations", "distinguées", "."], "Je vous prie d' agréer mes salutations distinguées .", "Schluss."),
    mat([["déplorer", "bedauern"], ["exiger", "verlangen"], ["joindre", "beifügen"], ["constater", "feststellen"]])
  ])]
});

D.add({ id: "c1-kultur", lv: "C1", t: ["Kultur, Geschichte und Francophonie", "Culture et francophonie"], s: ["Frankreich, Belgien, Schweiz, Kanada, Afrika – Sprache und Unterschiede.", "Le monde francophone."], k: "kultur geschichte francophonie belgien schweiz kanada quebec afrika septante nonante akzent regionalismen",
  b: [
    p("Französisch ist Amtssprache in über **25 Ländern**. Der Wortschatz weicht regional ab – das gehört zu C1."),
    tb(["Region", "Besonderheit", "Beispiel"], [
      ["Belgien, Schweiz", "septante (70), nonante (90); Schweiz: huitante (80)", "septante-cinq = 75"],
      ["Belgien", "„Wallonisch“: une fois = „mal“", "Tu viens une fois ?"],
      ["Schweiz", "déjeuner (Frühstück), dîner (Mittag), souper (Abend)", "On soupe à sept heures."],
      ["Québec", "magasiner (einkaufen), char (Auto), dépanneur (Kiosk), fin de semaine", "Je magasine en fin de semaine."],
      ["Québec", "« tu » sehr verbreitet; Anglizismen werden vermieden", "courriel (E-Mail), fin de semaine (Wochenende)"],
      ["Afrika (Westafrika)", "Lokale Wörter, oft mit « là »", "On se voit demain, là."]
    ]),
    h("Die Académie française und die Sprache"),
    p("Die **Académie française** (gegründet 1635) wacht über die Sprache, setzt aber nur Empfehlungen. Im Alltag gelten andere Regeln: *le week-end*, *le mail*, *un job* sind weit verbreitet, offiziell empfohlen werden *fin de semaine*, *courriel*, *emploi*."),
    h("Kulturelle Bezüge"),
    ul(["**Feste:** 14 juillet (Nationalfeiertag), la Chandeleur (Crêpes im Februar), le Beaujolais nouveau (November)", "**Essen:** drei Gänge, Käse vor dem Dessert; le déjeuner dauert oft lange", "**Höflichkeit:** *Bonjour* ist Pflicht beim Betreten eines Geschäfts", "**Literatur:** Hugo, Camus, Sartre, Proust, de Beauvoir, Leïla Slimani", "**Kino & Chanson:** Nouvelle Vague, Édith Piaf, Jacques Brel, Stromae"]),
    tip("Zum Üben von C1: hören (RFI, France Inter), lesen (Le Monde, TV5 Monde), schreiben (kurze Zusammenfassungen) und über Podcasts sprechen.")
  ],
  x: [xg("Übung 1 – Francophonie", "Exercice 1 – Francophonie", [
    mc("In Belgien sagt man für 70 …", ["soixante-dix", "septante", "huitante", "nonante"], 1, "septante."),
    mc("*Magasiner* in Québec =", ["einkaufen", "Magazin lesen", "lagern", "Shopping verbieten"], 0, "einkaufen."),
    mc("*Courriel* =", ["Kurier", "E-Mail", "Brief", "SMS"], 1, "E-Mail."),
    mc("In der Schweiz bedeutet *souper* …", ["Frühstück", "Mittagessen", "Abendessen", "Suppe"], 2, "Abendessen."),
    gap("Der Nationalfeiertag ist am 14 ___ .", "juillet", "juillet."),
    gap("Die ___ française wacht über die Sprache.", "Académie", "Académie."),
    ord(["Je", "magasine", "en", "fin", "de", "semaine", "."], "Je magasine en fin de semaine .", "Québécois."),
    mat([["nonante", "90 (Belgien/Schweiz)"], ["le courriel", "E-Mail (Québec)"], ["le char", "Auto (Québec)"], ["huitante", "80 (Schweiz)"]])
  ])]
});

D.add({ id: "c1-hoeren", lv: "C1", t: ["Hören und Sprechen: Strategien", "Comprendre et parler"], s: ["Schnelle Sprache verstehen, Liaison, Verschlucken, freies Sprechen.", "Écouter le français réel."], k: "hoeren sprechen strategien liaison elision verschlucken schnelle sprache chute du e podcast aussprache",
  b: [
    p("Gesprochenes Französisch klingt anders als geschriebenes. Diese Muster begegnen dir ständig:"),
    tb(["Geschrieben", "Gesprochen", "Hinweis"], [
      ["je ne sais pas", "[ʃɛpa] / « chais pas »", "je + s → ch"],
      ["il y a", "[ja]", "« y a pas de souci »"],
      ["tu es", "[tɛ] / « t'es »", "Elision"],
      ["je suis", "[ʃɥi] / « j'suis »", "Verschmelzung"],
      ["ce n'est pas", "« c'est pas »", "ne fällt weg"],
      ["petit", "[pti]", "e muet fällt weg"],
      ["quelque chose", "« quèque chose »", "Verkürzung"]
    ]),
    h("Strategien zum Hörverstehen"),
    ul(["**Vorab** Thema und Schlüsselwörter erraten", "**Kerninhalte** zuerst, nicht jedes Wort verstehen wollen", "**Wiederholen** mit Untertiteln (Französisch!) und Schattensprechen (Shadowing)", "**Podcasts** mit Transkript: *Journal en français facile*, *InnerFrench*, *Radio France*", "**Notizen** machen: Schlüsselwörter, Zahlen, Namen"]),
    h("Frei sprechen"),
    voc("Zeit gewinnen", [["Alors…", "Also…"], ["Comment dire…", "Wie soll ich sagen…"], ["Euh, voyons…", "Mal sehen…"], ["Si je comprends bien…", "Wenn ich richtig verstehe…"], ["En d'autres termes…", "Mit anderen Worten…"], ["Ce que je veux dire, c'est que…", "Was ich sagen will, ist, dass…"], ["Autrement dit…", "Anders gesagt…"]]),
    tip("Wenn dir ein Wort fehlt: **umschreiben** (*c'est un truc qui sert à … · c'est le contraire de …*). Das zeigt C1-Niveau mehr als Schweigen.")
  ],
  x: [xg("Übung 1 – Hören", "Exercice 1 – Écouter", [
    mc("Wie klingt *je ne sais pas* oft?", ["chais pas", "jénésapa", "je sais pas bien", "sé"], 0, "chais pas."),
    mc("*Autrement dit* =", ["anders gesagt", "nie wieder", "sonst nichts", "wie auch immer"], 0, "anders gesagt."),
    mc("Zeit gewinnen:", ["Comment dire…", "Au revoir", "Bonne nuit", "Voilà"], 0, "comment dire."),
    gap("Si je ___ bien… (verstehe)", "comprends", "comprends."),
    gap("En d'autres ___ … (Worten)", "termes", "termes."),
    gap("Ce que je veux ___ , c'est que… (sagen)", "dire", "dire."),
    ord(["Autrement", "dit", ",", "il", "faut", "recommencer", "."], "Autrement dit , il faut recommencer .", "Umformulieren."),
    mat([["chais pas", "weiß nicht"], ["y a", "es gibt"], ["t'es", "du bist"], ["j'suis", "ich bin"]])
  ])]
});
})();
