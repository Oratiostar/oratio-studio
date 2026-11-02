// Französischkurs A1 – Teil 1 (Lektionen 1–7). Erklärungen auf Deutsch, Beispiele auf Französisch.
(function(){
var D = FZ, p = D.p, h = D.h, tip = D.tip, warn = D.warn, ul = D.ul, tb = D.tb, ex = D.ex, voc = D.voc, dlg = D.dlg, mc = D.mc, gap = D.gap, ord = D.ord, mat = D.mat, xg = D.xg;

D.add({ id: "a1-aussprache", lv: "A1", t: ["Alphabet, Akzente und Aussprache", "Alphabet, accents et prononciation"], s: ["Buchstaben, Akzente, Nasale, stumme Endungen, Bindung – so klingt Französisch.", "Lettres, accents, nasales, lettres muettes, liaison."], k: "alphabet buchstabe akzent aussprache nasal liaison bindung stumm lautschrift accent prononciation",
  b: [
    p("Französisch wird anders gesprochen, als es geschrieben wird – aber nach festen Regeln. Wer die Regeln kennt, kann jedes Wort richtig lesen. Das Schriftbild ist vor allem deshalb „unehrlich“, weil viele Buchstaben am Wortende **nicht** gesprochen werden."),
    h("Das Alphabet"),
    p("Das französische Alphabet hat dieselben 26 Buchstaben wie das deutsche, aber die Buchstabennamen klingen anders. Drück auf 🔊, um sie zu hören."),
    tb(["A a", "B b", "C c", "D d", "E e", "F f", "G g"], [["[a]", "[be]", "[se]", "[de]", "[eu]", "[èf]", "[sche]"]]),
    tb(["H h", "I i", "J j", "K k", "L l", "M m", "N n"], [["[asch]", "[i]", "[schi]", "[ka]", "[èl]", "[èm]", "[èn]"]]),
    tb(["O o", "P p", "Q q", "R r", "S s", "T t", "U u"], [["[o]", "[pe]", "[kü]", "[èr]", "[ès]", "[te]", "[ü]"]]),
    tb(["V v", "W w", "X x", "Y y", "Z z"], [["[we]", "[dubl'we]", "[iks]", "[i grèk]", "[zèd]"]]),
    ex([["Comment ça s'écrit ? – B-O-N-J-O-U-R.", "Wie schreibt man das? – B-O-N-J-O-U-R."], ["Mon nom est Dupont : D-U-P-O-N-T.", "Mein Name ist Dupont: D-U-P-O-N-T."]]),
    h("Die Akzente und das ç"),
    p("Akzente ändern die Aussprache oder unterscheiden Wörter. Sie gehören fest zur Schreibweise: ohne Akzent ist ein Wort falsch geschrieben."),
    tb(["Zeichen", "Klang", "Beispiel"], [
      ["é (accent aigu)", "geschlossenes e, wie in „Tee“", "été [ete] – Sommer"],
      ["è, ê (accent grave / circonflexe)", "offenes e, wie in „Bär“", "père [pär] – Vater · fête – Fest"],
      ["ë, ï (tréma)", "beide Vokale werden getrennt gesprochen", "Noël – Weihnachten"],
      ["à, ù", "ändern den Klang nicht; sie unterscheiden Wörter", "à (zu, in) ≠ a (hat) · où (wo) ≠ ou (oder)"],
      ["â, î, ô, û", "meist nur Schreibung (früher stand dort ein s)", "hôtel, île, âge"],
      ["ç (cédille)", "c wird vor a, o, u wie s gesprochen", "français [fransä], garçon"],
      ["œ", "Zusammenschreibung von o + e, klingt wie „eu“", "sœur – Schwester, œuf – Ei"]
    ], "Tipp: Auf dem Handy hältst du den Buchstaben lange gedrückt, um é, è, ç usw. zu wählen. Bei den Lückentexten dieses Kurses werden fehlende Akzente nicht als Fehler gezählt."),
    h("Stumme Endbuchstaben"),
    p("Die meisten Konsonanten am Wortende werden **nicht** gesprochen: *petit* [pti], *grand* [gran], *vous* [wu], *trop* [tro], *beaucoup* [boku], *nuit* [nüi], *chez* [sche]. Das Plural-s und die Verbendungen **-e, -es, -ent** sind ebenfalls stumm."),
    tip("Eselsbrücke **CaReFuL**: Die Konsonanten **C, R, F, L** am Wortende werden meistens gesprochen: *avec, hiver, neuf, bel*. Ausnahmen gibt es (*parler* – das r ist stumm)."),
    h("Die Nasalvokale"),
    p("Französisch hat vier Nasalvokale. Der Vokal klingt durch die Nase, das n/m wird **nicht** hinterher gesprochen."),
    tb(["Schreibung", "Klang", "Beispiel"], [
      ["an, am, en, em", "[ã] wie nasales „a“", "dans, enfant, chambre"],
      ["on, om", "[õ] wie nasales „o“", "bon, nom, maison"],
      ["in, im, ain, ein, un", "[ẽ] wie nasales „ä“", "vin, pain, plein, un"],
      ["oin", "[wẽ]", "coin, loin, moins"]
    ]),
    p("Kein Nasal, wenn nach dem n/m ein Vokal oder ein zweites n/m folgt: *bonne* [bon], *année* [ane], *ami* [ami]."),
    h("Wichtige Lautgruppen"),
    tb(["Schreibung", "Klang", "Beispiel"], [
      ["ou", "[u] wie „Uhr“", "vous, bonjour, rouge"],
      ["u", "[ü] wie „Tür“ – Lippen rund, Zunge vorn", "tu, rue, sur"],
      ["eu, œu", "[ö] wie „schön“ oder „öffnen“", "peu, heure, sœur"],
      ["oi", "[oa] wie „Boa“", "moi, voiture, noir"],
      ["ai, ei", "[ä]", "mais, j'aime, neige"],
      ["au, eau", "[o] geschlossen", "chaud, beau, eau"],
      ["ch", "[sch]", "chat, chambre, chercher"],
      ["j, g vor e/i/y", "[sch] weich wie in „Garage“", "je, jour, manger, gîte"],
      ["g vor a/o/u", "[g] hart", "garçon, gare, goût"],
      ["gn", "[nj] wie in „Champagner“", "montagne, ligne"],
      ["qu", "[k]", "quand, qui, que"],
      ["ill, il nach Vokal", "[j] wie „Jahr“", "fille, travail, soleil"],
      ["h", "stumm", "homme, hôtel, heure"],
      ["r", "im Rachen gesprochen, weiches Reibe-r", "rouge, merci, très"]
    ]),
    h("Liaison, Enchaînement und Élision"),
    ul(["**Liaison** (Bindung): Ein stummer Konsonant am Wortende wird vor einem Vokal gesprochen: *les amis* [lèzami], *vous avez* [wuzave], *un homme* [önom]. Aus s und x wird ein [z].", "**Enchaînement**: Der gesprochene Endkonsonant wird zum nächsten Wort hinübergezogen: *il a* [ila], *elle est* [èlè].", "**Élision**: Vor einem Vokal oder stummen h fällt das e/a weg und es kommt ein Apostroph: *je + aime = j'aime*, *le + ami = l'ami*, *la + école = l'école*, *ne + est = n'est*."]),
    warn("Zwischen Wörtern gibt es im Französischen keine Pause und keinen starken Akzent. Der Satz fließt, und nur die **letzte Silbe** einer Wortgruppe wird leicht betont.")
  ],
  x: [
    xg("Übung 1 – Aussprache erkennen", "Exercice 1 – Reconnaître les sons", [
      mc("Wie klingt **ou** in *bonjour*?", ["wie „ü“", "wie „u“ (Uhr)", "wie „o“", "wie „au“"], 1, "ou = [u]: bonjour [bonschur]."),
      mc("Welches Wort enthält einen **Nasalvokal**?", ["bonne", "année", "bon", "ami"], 2, "In bon wird das n nicht gesprochen: [bõ]. In bonne, année und ami folgt auf n/m ein Vokal oder ein zweites n."),
      mc("Wie spricht man **ç** in *français*?", ["wie k", "wie s", "wie sch", "gar nicht"], 1, "ç = [s]. Das Häkchen macht aus dem c vor a/o/u ein weiches s."),
      mc("Was passiert bei **je + aime**?", ["je aime", "j'aime", "jaime", "je-aime"], 1, "Vor einem Vokal fällt das e weg: j'aime (Élision)."),
      mc("Welches Wort enthält ein gesprochenes **Endkonsonant**-Muster nach CaReFuL?", ["petit", "vous", "avec", "grand"], 2, "avec endet auf c, das gesprochen wird: [awèk]. Bei petit, vous und grand sind t, s, d stumm.")
    ]),
    xg("Übung 2 – Schreiben und Hören", "Exercice 2 – Écrire et écouter", [
      gap("Mit Akzent: *C'est la f___te de la musique.* (ê)", "ê", "fête mit accent circonflexe."),
      gap("Das Wort für „Sommer“ (mit zwei Akzenten, ohne Artikel): ___", "été", "été [ete]."),
      gap("Vor einem Vokal: *l'___mi* (le/la + ami)", "l'", "Élision: l'ami."),
      gap("Mit Liaison gesprochen als [lèzami]: Les ___ (Freunde)", "amis", "les amis [lèzami] – das s von les wird vor Vokal zu [z]."),
      mat([["ou", "[u] wie in vous"], ["u", "[ü] wie in tu"], ["eu", "[ö] wie in peu"], ["oi", "[oa] wie in moi"], ["ch", "[sch] wie in chat"]])
    ])
  ]
});

D.add({ id: "a1-vorstellen", lv: "A1", t: ["Bonjour ! Begrüßen und sich vorstellen", "Bonjour ! Saluer et se présenter"], s: ["Begrüßen, verabschieden, tu und vous, Name, Herkunft, Beruf, Alter.", "Saluer, tu et vous, nom, origine, métier, âge."], k: "bonjour begruessen vorstellen tu vous name herkunft beruf alter etre s'appeler habiter salut se presenter",
  b: [
    p("In diesem Kapitel lernst du, wie man sich grüßt, wie man sich vorstellt und wie man höflich ein erstes Gespräch führt."),
    h("Begrüßen und Verabschieden"),
    voc("Wichtige Wörter", [
      ["Bonjour", "Guten Tag / Guten Morgen (bis ca. 18 Uhr)"],
      ["Bonsoir", "Guten Abend"],
      ["Bonne nuit", "Gute Nacht (beim Schlafengehen)"],
      ["Salut", "Hallo / Tschüss (unter Freunden)"],
      ["Au revoir", "Auf Wiedersehen"],
      ["À bientôt / À demain", "Bis bald / Bis morgen"],
      ["Merci (beaucoup)", "Danke (vielmals)"],
      ["S'il vous plaît / s'il te plaît", "bitte (Bitte um etwas)"],
      ["De rien / Je vous en prie", "Bitte (Antwort auf Danke)"],
      ["Excusez-moi / Pardon", "Entschuldigung"],
      ["Comment allez-vous ? / Ça va ?", "Wie geht es Ihnen? / Wie geht's?"],
      ["Très bien, merci. Et vous ?", "Sehr gut, danke. Und Ihnen?"]
    ]),
    h("tu oder vous?"),
    p("Französisch kennt wie das Deutsche eine Du- und eine Sie-Form. **tu** benutzt man bei Familie, Freunden, Kindern und Gleichaltrigen in lockerer Umgebung. **vous** benutzt man bei Fremden, bei Älteren, im Beruf und im Geschäft – und **vous** ist außerdem der Plural von tu („ihr“)."),
    warn("Im Zweifel: **vous**. Das Duzen bietet meist die ältere oder ranghöhere Person an: *On peut se tutoyer ?*"),
    h("Sich vorstellen: être und s'appeler"),
    tb(["Person", "être (sein)", "s'appeler (heißen)"], [
      ["je", "je suis", "je m'appelle"],
      ["tu", "tu es", "tu t'appelles"],
      ["il / elle / on", "il est", "il s'appelle"],
      ["nous", "nous sommes", "nous nous appelons"],
      ["vous", "vous êtes", "vous vous appelez"],
      ["ils / elles", "ils sont", "ils s'appellent"]
    ]),
    ex([
      ["Je m'appelle Koffi.", "Ich heiße Koffi."],
      ["Comment tu t'appelles ? – Comment vous appelez-vous ?", "Wie heißt du? – Wie heißen Sie?"],
      ["Je suis allemand. / Je suis allemande.", "Ich bin Deutscher. / Ich bin Deutsche.", "Bei Nationalität und Beruf wird die weibliche Form meist mit -e gebildet."],
      ["J'habite à Berlin.", "Ich wohne in Berlin."],
      ["Je viens d'Allemagne.", "Ich komme aus Deutschland."],
      ["Je suis électricien.", "Ich bin Elektriker.", "Nach être steht der Beruf ohne Artikel."],
      ["J'ai trente ans.", "Ich bin dreißig Jahre alt.", "Das Alter wird mit **avoir** gesagt, nicht mit être!"],
      ["Enchanté(e) !", "Freut mich!"]
    ]),
    h("Länder und Nationalitäten"),
    tb(["Land", "männlich", "weiblich"], [
      ["l'Allemagne", "allemand", "allemande"],
      ["la France", "français", "française"],
      ["l'Autriche", "autrichien", "autrichienne"],
      ["la Suisse", "suisse", "suisse"],
      ["l'Italie", "italien", "italienne"],
      ["l'Espagne", "espagnol", "espagnole"],
      ["les États-Unis", "américain", "américaine"]
    ], "Nationalitäten werden im Französischen kleingeschrieben (je suis allemand), das Land mit Großbuchstaben."),
    dlg("Premier contact – Erstes Kennenlernen", [
      ["A", "Bonjour ! Je m'appelle Marie. Et vous ?", "Guten Tag! Ich heiße Marie. Und Sie?"],
      ["B", "Bonjour, Marie. Je m'appelle Lukas. Je suis allemand.", "Guten Tag, Marie. Ich heiße Lukas. Ich bin Deutscher."],
      ["A", "Enchantée, Lukas. Vous habitez où ?", "Freut mich, Lukas. Wo wohnen Sie?"],
      ["B", "J'habite à Munich. Et vous ?", "Ich wohne in München. Und Sie?"],
      ["A", "J'habite à Lyon. Je suis professeure.", "Ich wohne in Lyon. Ich bin Lehrerin."]
    ])
  ],
  x: [
    xg("Übung 1 – Sich vorstellen", "Exercice 1 – Se présenter", [
      mc("Wie sagt man „Ich bin 25 Jahre alt“?", ["Je suis 25 ans.", "J'ai 25 ans.", "Je fais 25 ans.", "Je suis de 25 ans."], 1, "Das Alter wird mit avoir ausgedrückt: j'ai … ans."),
      mc("Welche Anrede passt zu einer **fremden Verkäuferin**?", ["Salut, ça va ?", "Tu es gentille.", "Bonjour, madame. Vous allez bien ?", "Comment tu t'appelles ?"], 2, "Fremde und Kunden siezt man: vous."),
      mc("Was bedeutet *De rien*?", ["Danke", "Bitte (nach einem Dank)", "Entschuldigung", "Auf Wiedersehen"], 1, "De rien = keine Ursache."),
      gap("Je ___ allemand. (être)", "suis", "je suis."),
      gap("Vous ___ où ? – J'habite à Paris. (habiter)", "habitez", "vous habitez."),
      gap("Elle ___ Camille. (s'appeler)", "s'appelle", "elle s'appelle – die Reflexivform behält das s'."),
      gap("Nous ___ français. (être)", "sommes", "nous sommes."),
      ord(["Je", "m'appelle", "Anna", "."], "Je m'appelle Anna .", "Subjekt – Verb – Name."),
      mat([["Bonsoir", "Guten Abend"], ["Merci", "Danke"], ["À demain", "Bis morgen"], ["Pardon", "Entschuldigung"], ["S'il vous plaît", "Bitte (Bitte um etwas)"]])
    ])
  ]
});

D.add({ id: "a1-zahlen", lv: "A1", t: ["Zahlen, Uhrzeit und Datum", "Nombres, heure et date"], s: ["0 bis 1000, Wochentage, Monate, Uhrzeit sagen, Daten und Telefonnummern.", "0 à 1000, jours, mois, dire l'heure, dates."], k: "zahlen uhrzeit datum wochentage monate nombres heure date jour mois soixante-dix quatre-vingts",
  b: [
    p("Zahlen sind im Französischen logisch aufgebaut, bis auf eine Besonderheit: Ab 70 wird in Zwanzigern gezählt (Vigesimalsystem). Das üben wir zuerst."),
    h("0 bis 20"),
    tb(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], [["zéro", "un / une", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix"]]),
    tb(["11", "12", "13", "14", "15", "16", "17", "18", "19", "20"], [["onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf", "vingt"]]),
    h("20 bis 100"),
    tb(["20", "30", "40", "50", "60"], [["vingt", "trente", "quarante", "cinquante", "soixante"]]),
    ul(["21 = **vingt et un**, 22 = vingt-deux, 31 = **trente et un** – bei 21, 31, 41, 51, 61 steht ein **et**.", "**70** = soixante-dix (60 + 10), **71** = soixante et onze, 72 = soixante-douze …", "**80** = **quatre-vingts** (4 × 20) – ohne weitere Zahl mit -s, **81** = quatre-vingt-un, 82 = quatre-vingt-deux.", "**90** = quatre-vingt-dix (4 × 20 + 10), 91 = quatre-vingt-onze.", "**100** = cent, 200 = deux cents, 201 = deux cent un, **1000** = mille (ohne s: deux mille)."]),
    tip("In Belgien und der Schweiz sagt man oft **septante** (70), **huitante/octante** (80, nur Schweiz teils) und **nonante** (90). Das ist einfacher – und in Frankreich trotzdem verständlich."),
    h("Wochentage und Monate"),
    tb(["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"], [["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]]),
    tb(["janvier", "février", "mars", "avril", "mai", "juin"], [["Januar", "Februar", "März", "April", "Mai", "Juni"]]),
    tb(["juillet", "août", "septembre", "octobre", "novembre", "décembre"], [["Juli", "August", "September", "Oktober", "November", "Dezember"]]),
    p("Wochentage und Monate schreibt man **klein**. *le lundi* heißt „montags / jeden Montag“, *lundi* (ohne le) heißt „am (kommenden) Montag“."),
    h("Das Datum"),
    ex([
      ["Quelle est la date aujourd'hui ? – C'est le 3 mai.", "Welches Datum ist heute? – Der 3. Mai."],
      ["Aujourd'hui, nous sommes le premier juin.", "Heute ist der 1. Juni.", "Nur der Erste heißt **le premier**, sonst gilt die normale Zahl: le deux, le trois …"],
      ["Mon anniversaire, c'est le 14 juillet.", "Mein Geburtstag ist am 14. Juli."],
      ["Je suis né(e) en 1990 (mille neuf cent quatre-vingt-dix).", "Ich bin 1990 geboren."]
    ]),
    h("Die Uhrzeit"),
    tb(["Uhrzeit", "Französisch"], [
      ["8:00", "Il est huit heures."],
      ["8:05", "Il est huit heures cinq."],
      ["8:15", "Il est huit heures et quart."],
      ["8:30", "Il est huit heures et demie."],
      ["8:45", "Il est neuf heures moins le quart."],
      ["8:50", "Il est neuf heures moins dix."],
      ["12:00", "Il est midi."],
      ["24:00", "Il est minuit."],
      ["14:30 (offiziell)", "Il est quatorze heures trente."]
    ], "Im Alltag sagt man 1–12 Uhr plus „du matin / de l'après-midi / du soir“. Fahrpläne, Ämter und Arbeitszeiten nutzen die 24-Stunden-Zählung."),
    ex([
      ["Quelle heure est-il ? – Il est dix heures.", "Wie spät ist es? – Es ist zehn Uhr."],
      ["Le train part à 7 h 45.", "Der Zug fährt um 7:45 Uhr ab."],
      ["À quelle heure tu travailles ? – À huit heures.", "Um wie viel Uhr arbeitest du? – Um acht Uhr."]
    ]),
    voc("Telefonnummern", [
      ["Mon numéro, c'est le 06 12 34 56 78.", "Meine Nummer ist die 06 12 34 56 78 (in Zweiergruppen gesprochen: zéro six, douze, trente-quatre …)."]
    ])
  ],
  x: [
    xg("Übung 1 – Zahlen und Zeit", "Exercice 1 – Nombres et heure", [
      mc("Wie heißt **80**?", ["huitante-dix", "quatre-vingts", "soixante-vingt", "octante-un"], 1, "80 = quatre-vingts (4 × 20). In der Schweiz auch huitante."),
      mc("Welche Zahl ist **71**?", ["soixante-onze", "soixante et onze", "septante-un", "soixante-dix-un"], 1, "71 = soixante et onze (60 + 11)."),
      mc("Wie spät ist es um **9:15**?", ["Il est neuf heures et demie.", "Il est neuf heures et quart.", "Il est neuf heures moins le quart.", "Il est dix heures et quart."], 1, "et quart = Viertel nach."),
      mc("Was bedeutet *le lundi*?", ["am kommenden Montag", "jeden Montag", "nie am Montag", "Montag, der 1."], 1, "Mit Artikel le = regelmäßig (montags)."),
      gap("Écris en lettres : 15 → ___", "quinze", "15 = quinze."),
      gap("Écris en lettres : 90 → quatre-vingt-___", "dix", "90 = quatre-vingt-dix."),
      gap("Il est midi et ___ . (12:30)", "demi", "Nach midi/minuit steht demi ohne e (männlich): midi et demi. Nach heures: et demie."),
      gap("Aujourd'hui, nous sommes le ___ janvier. (1.)", "premier", "Der erste Tag des Monats heißt le premier."),
      ord(["Il", "est", "huit", "heures", "et", "quart", "."], "Il est huit heures et quart .", "Satzmuster: Il est + Stunde + heures + et quart."),
      mat([["lundi", "Montag"], ["mercredi", "Mittwoch"], ["samedi", "Samstag"], ["janvier", "Januar"], ["août", "August"]])
    ])
  ]
});

D.add({ id: "a1-artikel", lv: "A1", t: ["Nomen, Artikel und Plural", "Noms, articles et pluriel"], s: ["le/la/les, un/une/des, Genus erkennen, Plural bilden.", "Genre, articles définis et indéfinis, pluriel."], k: "artikel nomen plural genus maennlich weiblich le la les un une des article nom pluriel genre elision",
  b: [
    p("Jedes französische Nomen ist **männlich (masculin)** oder **weiblich (féminin)**. Ein „sächliches“ Geschlecht gibt es nicht. Der Artikel verrät das Geschlecht – deshalb lernt man Nomen immer **mit Artikel**."),
    h("Die Artikel"),
    tb(["", "männlich", "weiblich", "Plural"], [
      ["bestimmt (der, die, das)", "le garçon · l'homme", "la fille · l'école", "les garçons · les filles"],
      ["unbestimmt (ein, eine)", "un garçon", "une fille", "des garçons / filles"]
    ], "Vor Vokal und stummem h wird le/la zu l' (Élision): l'ami, l'école, l'hôtel."),
    ex([
      ["Le livre est sur la table.", "Das Buch liegt auf dem Tisch."],
      ["J'ai un frère et une sœur.", "Ich habe einen Bruder und eine Schwester."],
      ["Les enfants jouent dans le jardin.", "Die Kinder spielen im Garten."],
      ["Tu as des questions ?", "Hast du Fragen?", "Der Plural des unbestimmten Artikels heißt **des** (im Deutschen gibt es dafür keinen Artikel)."]
    ]),
    h("Männlich oder weiblich? Hinweise an der Endung"),
    p("Ein sicheres Gefühl wie im Deutschen gibt es nicht, aber viele Endungen verraten das Geschlecht:"),
    tb(["Meist männlich", "Meist weiblich"], [
      ["-ment: le gouvernement, le logement", "-tion / -sion: la nation, la télévision"],
      ["-age: le voyage, le garage (Ausnahme: la page, la plage)", "-té: la liberté, la beauté (Ausnahme: l'été)"],
      ["-eau: le bureau, le château (Ausnahme: l'eau)", "-ure: la voiture, la culture"],
      ["-isme: le tourisme", "-ette, -esse, -ance, -ence: la dette, la tendresse"],
      ["Tage, Monate, Sprachen, Jahreszeiten: le lundi, le français", "viele Wörter auf -e: la table, la porte, la maison"]
    ]),
    warn("Vorsicht, Wörter mit anderem Geschlecht als im Deutschen: *le soleil* (die Sonne), *la lune* (der Mond), *le lait* (die Milch), *la mer* (das Meer), *le sang* (das Blut), *la montagne*."),
    h("Der Plural"),
    ul(["Normalfall: **-s** anhängen – *la fille → les filles*. Das s ist stumm; man hört den Plural am **Artikel** (le/les, un/des).", "Endet das Wort schon auf **-s, -x, -z**: keine Änderung – *le fils → les fils*, *la voix → les voix*.", "Endung **-eau, -eu**: **-x** – *le bateau → les bateaux*, *le jeu → les jeux*.", "Endung **-al**: **-aux** – *le cheval → les chevaux*, *l'animal → les animaux* (Ausnahme: *le festival → les festivals*).", "Endung **-ail**: meist -s (*le détail*), selten -aux (*le travail → les travaux*).", "Ausnahmen (Auswendig lernen!): *l'œil → les yeux*, *le monsieur → les messieurs*, *madame → mesdames*."]),
    ex([
      ["un ami → des amis", "ein Freund → Freunde", "Bei der Liaison hörst du das z: [dèzami]."],
      ["un cheval → des chevaux", "ein Pferd → Pferde"],
      ["l'œil → les yeux", "das Auge → die Augen"]
    ]),
    voc("Wortschatz: im Klassenzimmer / zu Hause", [
      ["le livre", "das Buch"], ["le cahier", "das Heft"], ["le stylo", "der Kugelschreiber"], ["la table", "der Tisch"], ["la chaise", "der Stuhl"],
      ["la porte", "die Tür"], ["la fenêtre", "das Fenster"], ["le téléphone", "das Telefon"], ["l'ordinateur (m.)", "der Computer"], ["la clé", "der Schlüssel"]
    ])
  ],
  x: [
    xg("Übung 1 – Artikel und Plural", "Exercice 1 – Articles et pluriel", [
      mc("Welcher Artikel passt: ___ école?", ["le", "la", "l'", "les"], 2, "Vor einem Vokal steht l' (Élision): l'école."),
      mc("Der Plural von *le cheval* ist …", ["les chevals", "les chevaux", "les chevales", "les cheval"], 1, "-al → -aux."),
      mc("Welcher Artikel passt zu *voyage*?", ["la voyage", "le voyage", "une voyage", "les voyage"], 1, "Wörter auf -age sind meist männlich."),
      mc("Was ist der Plural von *un jeu*?", ["des jeus", "des jeux", "des jeu", "des jeuxs"], 1, "-eu bekommt im Plural -x: des jeux."),
      gap("Il y a ___ livre sur la table. (un/une)", "un", "livre ist männlich: un livre."),
      gap("J'aime ___ musique. (le/la)", "la", "musique ist weiblich."),
      gap("Les ___ sont gentils. (enfant → Plural)", "enfants", "enfants (s stumm)."),
      gap("___ hôtel est grand. (le/l')", "l'", "hôtel beginnt mit stummem h → l'hôtel."),
      ord(["Les", "enfants", "mangent", "des", "pommes", "."], "Les enfants mangent des pommes .", "Subjekt – Verb – Objekt."),
      mat([["le livre", "das Buch"], ["la fenêtre", "das Fenster"], ["l'ordinateur", "der Computer"], ["les clés", "die Schlüssel"], ["une porte", "eine Tür"]])
    ])
  ]
});

D.add({ id: "a1-praesens", lv: "A1", t: ["Verben im Präsens (présent)", "Les verbes au présent"], s: ["Regelmäßige Verben auf -er, -ir, -re und die wichtigsten unregelmäßigen: être, avoir, aller, faire.", "Verbes en -er, -ir, -re et verbes irréguliers essentiels."], k: "praesens présent verben konjugation etre avoir aller faire parler finir vendre regelmaessig unregelmaessig conjugaison",
  b: [
    p("Das Präsens (**le présent**) drückt aus, was jetzt geschieht oder gewöhnlich ist. Im Französischen gibt es nur **eine** Präsensform – kein „ich bin am Arbeiten“ wie im Englischen: *je travaille* heißt „ich arbeite“ und „ich arbeite gerade“."),
    h("Die Personalpronomen"),
    tb(["Singular", "Plural"], [["je (j')", "nous"], ["tu", "vous"], ["il / elle / on", "ils / elles"]], "**on** ist „man“ und wird im Alltag auch für „wir“ benutzt: *On va au cinéma ?* = Gehen wir ins Kino? Es steht mit der **3. Person Singular**."),
    h("Die Verben auf -er (die größte Gruppe)"),
    p("Über 90 % aller Verben enden auf **-er** und werden gleich konjugiert. Stamm = Infinitiv ohne -er. In der Aussprache sind **je, tu, il, ils** gleich – nur nous und vous hört man."),
    tb(["", "parler (sprechen)", "habiter (wohnen)", "aimer (mögen)"], [
      ["je", "je parle", "j'habite", "j'aime"],
      ["tu", "tu parles", "tu habites", "tu aimes"],
      ["il / elle / on", "il parle", "il habite", "il aime"],
      ["nous", "nous parlons", "nous habitons", "nous aimons"],
      ["vous", "vous parlez", "vous habitez", "vous aimez"],
      ["ils / elles", "ils parlent", "ils habitent", "ils aiment"]
    ]),
    tip("Endungen der -er-Verben: **-e, -es, -e, -ons, -ez, -ent**. Wer die Endungen von parler kennt, kann hunderte Verben konjugieren: travailler, regarder, manger, jouer, chanter, chercher, écouter, donner …"),
    p("Kleine Besonderheiten bei -er-Verben: *manger → nous mangeons* (e bleibt, damit g weich bleibt), *commencer → nous commençons* (ç), *acheter → j'achète* (è), *appeler → j'appelle* (ll), *payer → je paie/je paye*."),
    h("Die Verben auf -ir und -re"),
    tb(["", "finir (beenden)", "choisir (wählen)", "vendre (verkaufen)", "attendre (warten)"], [
      ["je", "je finis", "je choisis", "je vends", "j'attends"],
      ["tu", "tu finis", "tu choisis", "tu vends", "tu attends"],
      ["il / elle", "il finit", "il choisit", "il vend", "il attend"],
      ["nous", "nous finissons", "nous choisissons", "nous vendons", "nous attendons"],
      ["vous", "vous finissez", "vous choisissez", "vous vendez", "vous attendez"],
      ["ils / elles", "ils finissent", "ils choisissent", "ils vendent", "ils attendent"]
    ]),
    h("Die vier wichtigsten Verben: être, avoir, aller, faire"),
    tb(["", "être (sein)", "avoir (haben)", "aller (gehen)", "faire (machen)"], [
      ["je", "je suis", "j'ai", "je vais", "je fais"],
      ["tu", "tu es", "tu as", "tu vas", "tu fais"],
      ["il / elle / on", "il est", "il a", "il va", "il fait"],
      ["nous", "nous sommes", "nous avons", "nous allons", "nous faisons"],
      ["vous", "vous êtes", "vous avez", "vous allez", "vous faites"],
      ["ils / elles", "ils sont", "ils ont", "ils vont", "ils font"]
    ], "Diese vier Verben auswendig lernen – sie werden in jedem zweiten Satz gebraucht und als Hilfsverben für fast alle weiteren Zeiten."),
    ex([
      ["Je travaille à Paris.", "Ich arbeite in Paris."],
      ["Nous avons deux enfants.", "Wir haben zwei Kinder."],
      ["Ils vont au travail en voiture.", "Sie fahren mit dem Auto zur Arbeit."],
      ["Vous faites du sport ?", "Treiben Sie Sport?"],
      ["Elle est médecin et il est professeur.", "Sie ist Ärztin und er ist Lehrer."]
    ]),
    h("Weitere häufige unregelmäßige Verben"),
    tb(["Infinitiv", "je", "nous", "ils"], [
      ["venir (kommen)", "je viens", "nous venons", "ils viennent"],
      ["prendre (nehmen)", "je prends", "nous prenons", "ils prennent"],
      ["voir (sehen)", "je vois", "nous voyons", "ils voient"],
      ["dire (sagen)", "je dis", "nous disons", "ils disent"],
      ["savoir (wissen)", "je sais", "nous savons", "ils savent"],
      ["pouvoir (können)", "je peux", "nous pouvons", "ils peuvent"],
      ["vouloir (wollen)", "je veux", "nous voulons", "ils veulent"]
    ])
  ],
  x: [
    xg("Übung 1 – Konjugieren", "Exercice 1 – Conjuguer", [
      gap("Je ___ à Berlin. (habiter)", "habite", "j'habite – vor Vokal wird je zu j'."),
      gap("Nous ___ le français. (aimer)", "aimons", "nous aimons."),
      gap("Ils ___ très gentils. (être)", "sont", "ils sont."),
      gap("Tu ___ faim ? (avoir)", "as", "tu as faim = Hast du Hunger?"),
      gap("Vous ___ au cinéma ? (aller)", "allez", "vous allez."),
      gap("Elle ___ ses devoirs. (faire)", "fait", "elle fait."),
      gap("Nous ___ du pain. (vendre)", "vendons", "nous vendons."),
      mc("Welche Form ist **richtig**: nous ___ (manger)", ["mangons", "mangeons", "manges", "mangez"], 1, "Bei -ger bleibt vor -ons das e erhalten, damit das g weich bleibt."),
      mc("Welche Endung hat *ils parl…* ?", ["-es", "-e", "-ent", "-ons"], 2, "ils parlent – die Endung -ent wird nicht gesprochen."),
      mat([["je suis", "ich bin"], ["tu as", "du hast"], ["il va", "er geht"], ["nous faisons", "wir machen"], ["ils ont", "sie haben"]])
    ])
  ]
});

D.add({ id: "a1-satz", lv: "A1", t: ["Der Satz: Fragen und Verneinung", "La phrase : questions et négation"], s: ["Wortstellung, drei Arten zu fragen, Fragewörter, ne … pas, ne … jamais, il y a.", "Ordre des mots, trois façons de poser une question, négation."], k: "satz wortstellung fragen verneinung ne pas est-ce que inversion fragewoerter qui que ou quand comment pourquoi combien jamais plus rien question negation il y a",
  b: [
    p("Der französische Aussagesatz folgt meist der Reihenfolge **Subjekt – Verb – Objekt**. Wie im Deutschen gibt es Fragen und Verneinung – aber die Bildung ist anders."),
    h("Aussagesatz"),
    ex([["Marie mange une pomme.", "Marie isst einen Apfel."], ["Je regarde la télévision le soir.", "Ich schaue abends fern.", "Zeitangaben stehen meist am Ende oder am Anfang des Satzes."]]),
    h("Fragen stellen – drei Möglichkeiten"),
    tb(["Art", "Beispiel", "Wann?"], [
      ["1. Satzmelodie (Aussage + steigende Betonung)", "Tu parles français ?", "Alltag, mündlich"],
      ["2. **est-ce que** vor dem Aussagesatz", "Est-ce que tu parles français ?", "neutral, sehr häufig"],
      ["3. Inversion (Verb vor Subjekt, mit Bindestrich)", "Parles-tu français ? / Parlez-vous français ?", "formell, schriftlich"]
    ]),
    p("Bei Inversion mit **il/elle/on** nach Vokal kommt ein **-t-**: *Parle-t-il ? A-t-elle un frère ?* – damit Vokale nicht zusammenstoßen."),
    h("Die Fragewörter"),
    tb(["Wort", "Bedeutung", "Beispiel"], [
      ["qui", "wer / wen", "Qui est-ce ? – Wer ist das?"],
      ["que / qu'est-ce que", "was", "Qu'est-ce que tu fais ?"],
      ["où", "wo / wohin", "Où habitez-vous ?"],
      ["quand", "wann", "Quand est-ce que tu viens ?"],
      ["comment", "wie", "Comment ça va ?"],
      ["pourquoi", "warum", "Pourquoi tu pleures ?"],
      ["combien (de)", "wie viel / wie viele", "Combien d'enfants avez-vous ?"],
      ["quel / quelle", "welcher / welche", "Quelle heure est-il ?"]
    ]),
    ex([
      ["Où est-ce que tu habites ? – Tu habites où ?", "Wo wohnst du?", "Im Alltag steht das Fragewort oft ganz hinten."],
      ["Pourquoi est-ce que vous apprenez le français ?", "Warum lernen Sie Französisch?"],
      ["Combien ça coûte ?", "Wie viel kostet das?"]
    ]),
    h("Verneinung: ne … pas"),
    p("Die Verneinung besteht aus **zwei Teilen**, die das konjugierte Verb umschließen: **ne** davor, **pas** dahinter. Vor Vokal wird ne zu **n'**."),
    ex([
      ["Je ne parle pas allemand.", "Ich spreche kein Deutsch.", "Im gesprochenen Französisch fällt das ne oft weg: Je parle pas allemand."],
      ["Elle n'habite pas à Paris.", "Sie wohnt nicht in Paris."],
      ["Nous ne sommes pas fatigués.", "Wir sind nicht müde."],
      ["Je n'ai pas de voiture.", "Ich habe kein Auto.", "Nach der Verneinung steht **de** statt un/une/des: pas **de** voiture."]
    ]),
    tb(["Verneinung", "Bedeutung", "Beispiel"], [
      ["ne … pas", "nicht / kein", "Je ne mange pas."],
      ["ne … jamais", "nie", "Il ne boit jamais de café."],
      ["ne … plus", "nicht mehr", "Elle ne travaille plus ici."],
      ["ne … rien", "nichts", "Je ne vois rien."],
      ["ne … personne", "niemand", "Il n'y a personne."],
      ["ne … que", "nur", "Il n'a que deux euros."]
    ]),
    h("Antwort „doch“: si"),
    p("Auf eine **verneinte Frage** antwortet man mit **si**, wenn man widersprechen will: *Tu n'aimes pas le fromage ? – Si, j'adore le fromage !* (Doch!)"),
    h("il y a – es gibt"),
    ex([["Il y a un problème.", "Es gibt ein Problem."], ["Il y a deux chambres dans l'appartement.", "In der Wohnung gibt es zwei Zimmer."], ["Il n'y a pas de pain.", "Es gibt kein Brot."], ["Qu'est-ce qu'il y a ?", "Was ist los?"]])
  ],
  x: [
    xg("Übung 1 – Fragen und Verneinung", "Exercice 1 – Questions et négation", [
      mc("Wie fragt man formell „Sprechen Sie Französisch?“", ["Tu parles français ?", "Parlez-vous français ?", "Est-ce que vous parlez français ?", "Vous parlez français ?"], 1, "Alle vier sind möglich; die Inversion Parlez-vous … ist die formellste. Gesucht war die Inversion."),
      mc("Welches Fragewort passt? ___ habitez-vous ? – À Lyon.", ["Quand", "Où", "Pourquoi", "Comment"], 1, "Où = wo."),
      mc("Wie lautet die Verneinung von *Il a un chien*?", ["Il n'a pas un chien.", "Il n'a pas de chien.", "Il ne pas a de chien.", "Il a pas un chien."], 1, "Nach ne … pas steht de (statt un/une/des)."),
      mc("Welche Antwort passt? – Tu n'aimes pas le thé ? –", ["Oui, je n'aime pas.", "Si, j'aime le thé.", "Non, j'aime.", "Si, je n'aime pas."], 1, "Si widerspricht einer verneinten Frage."),
      gap("Je ___ parle pas anglais. (Verneinung, Teil 1)", "ne", "ne … pas."),
      gap("Il ___ y a pas de lait. (n')", "n'", "il n'y a pas."),
      gap("Je ne travaille ___ . (nicht mehr)", "plus", "ne … plus."),
      gap("___ -ce que tu viens ? (Fragewort für eine Entscheidungsfrage)", "est", "Est-ce que + Aussagesatz."),
      ord(["Où", "est-ce", "que", "tu", "habites", "?"], "Où est-ce que tu habites ?", "Fragewort + est-ce que + Aussagesatz."),
      ord(["Nous", "ne", "mangeons", "pas", "de", "viande", "."], "Nous ne mangeons pas de viande .", "ne + Verb + pas + de + Nomen.")
    ])
  ]
});

D.add({ id: "a1-possessiv", lv: "A1", t: ["Familie und Possessivbegleiter", "La famille et les possessifs"], s: ["mon, ma, mes, ton, son, notre … – Familienwörter, Besitz mit de.", "Adjectifs possessifs, vocabulaire de la famille."], k: "familie possessiv mein dein sein mon ma mes ton ta son sa notre votre leur famille possessifs",
  b: [
    p("Mit Possessivbegleitern sagt man, wem etwas gehört: „mein“, „dein“, „sein“ … Im Französischen richten sie sich nach dem **Besitztum** (männlich/weiblich/Plural), nicht nach dem Besitzer!"),
    tb(["", "m. Sg.", "w. Sg.", "Plural", "Deutsch"], [
      ["ich", "mon", "ma", "mes", "mein"],
      ["du", "ton", "ta", "tes", "dein"],
      ["er / sie / es", "son", "sa", "ses", "sein / ihr"],
      ["wir", "notre", "notre", "nos", "unser"],
      ["ihr / Sie", "votre", "votre", "vos", "euer / Ihr"],
      ["sie (Plural)", "leur", "leur", "leurs", "ihr"]
    ], "Vor weiblichen Nomen, die mit Vokal beginnen, steht **mon/ton/son** statt ma/ta/sa: *mon amie, mon école*."),
    warn("*son père* kann „sein Vater“ oder „ihr Vater“ heißen – es richtet sich nach **père** (männlich). Aus dem Zusammenhang wird klar, wer gemeint ist."),
    ex([
      ["Voici mon frère et ma sœur.", "Das sind mein Bruder und meine Schwester."],
      ["Ton père travaille où ?", "Wo arbeitet dein Vater?"],
      ["Elle aime son métier.", "Sie mag ihren Beruf."],
      ["Nous habitons avec nos parents.", "Wir wohnen bei unseren Eltern."],
      ["Leur maison est grande.", "Ihr Haus ist groß."]
    ]),
    voc("Die Familie (la famille)", [
      ["le père / la mère", "Vater / Mutter"], ["les parents (m.)", "Eltern"], ["le frère / la sœur", "Bruder / Schwester"], ["le fils / la fille", "Sohn / Tochter"],
      ["le grand-père / la grand-mère", "Großvater / Großmutter"], ["l'oncle / la tante", "Onkel / Tante"], ["le cousin / la cousine", "Cousin / Cousine"],
      ["le mari / la femme", "Ehemann / Ehefrau"], ["l'enfant (m./f.)", "Kind"], ["le petit-fils / la petite-fille", "Enkel / Enkelin"]
    ]),
    h("Besitz mit „de“"),
    p("Für „Marias Buch“ gibt es kein ’s. Man sagt **le livre de Marie** – „das Buch von Marie“. Vor Vokal: *la voiture d'Éric*."),
    ex([["C'est la voiture de mon père.", "Das ist das Auto meines Vaters."], ["C'est le chien de Paul.", "Das ist Pauls Hund."]]),
    dlg("Ma famille", [
      ["A", "Tu as des frères et sœurs ?", "Hast du Geschwister?"],
      ["B", "Oui, j'ai un frère et deux sœurs. Mon frère s'appelle Max.", "Ja, ich habe einen Bruder und zwei Schwestern. Mein Bruder heißt Max."],
      ["A", "Et tes parents, ils habitent où ?", "Und deine Eltern, wo wohnen sie?"],
      ["B", "Ils habitent à Hambourg. Leur maison est près du port.", "Sie wohnen in Hamburg. Ihr Haus ist in der Nähe des Hafens."]
    ])
  ],
  x: [
    xg("Übung 1 – Possessiv", "Exercice 1 – Possessifs", [
      mc("___ mère est médecin. (meine)", ["Mon", "Ma", "Mes", "Mère"], 1, "mère ist weiblich: ma mère."),
      mc("___ amie s'appelle Léa. (meine Freundin)", ["Ma", "Mon", "Mes", "Moi"], 1, "Vor Vokal steht mon: mon amie."),
      mc("Wie sagt man „Unsere Kinder“?", ["notre enfants", "nos enfants", "nous enfants", "nos enfant"], 1, "Plural: nos enfants."),
      mc("Was bedeutet *C'est le livre de Marie.*", ["Das ist Maries Buch.", "Das ist mein Buch.", "Marie liest das Buch.", "Das Buch ist von mir."], 0, "de + Name = Besitz."),
      gap("Tu as ___ clés ? (deine)", "tes", "Plural: tes clés."),
      gap("Il parle de ___ père. (sein)", "son", "père = männlich → son."),
      gap("Vous avez ___ passeport ? (Ihren)", "votre", "votre passeport."),
      gap("Ils aiment ___ voiture. (ihr, Plural-Besitzer)", "leur", "leur voiture."),
      ord(["Mon", "frère", "habite", "à", "Berlin", "."], "Mon frère habite à Berlin .", "Possessiv + Nomen + Verb + Ort."),
      mat([["le frère", "Bruder"], ["la tante", "Tante"], ["les parents", "Eltern"], ["le grand-père", "Großvater"], ["la fille", "Tochter"]])
    ])
  ]
});
})();
