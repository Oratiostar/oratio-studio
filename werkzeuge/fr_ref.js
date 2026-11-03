// Französischkurs – Grammatik komplett (G) und Nachschlagen (R).
(function(){
var D = FZ, p = D.p, h = D.h, tip = D.tip, warn = D.warn, ul = D.ul, tb = D.tb, ex = D.ex, voc = D.voc;

// ---------- G: Grammatik komplett ----------
D.add({ id: "g-nomen", lv: "G", t: ["Nomen, Artikel, Genus", "Noms, articles, genre"], s: ["Geschlecht, Plural, bestimmte/unbestimmte/Teilungsartikel.", "Genre, nombre, articles."], k: "nomen artikel genus plural le la les un une des du de la teilungsartikel",
  b: [
    tb(["", "männlich", "weiblich", "Plural"], [["bestimmt", "le / l'", "la / l'", "les"], ["unbestimmt", "un", "une", "des"], ["Teilungsartikel", "du / de l'", "de la / de l'", "des"]]),
    h("Genus erkennen"),
    ul(["meist **männlich:** -age (le voyage), -ment (le moment), -eau (le bateau), -isme, -eur (le moteur)", "meist **weiblich:** -tion (la nation), -té (la liberté), -ure (la voiture), -ette, -ance/-ence (la chance)", "Ausnahmen: *le musée, la page, la plage, le lycée, la mer*"]),
    h("Plural"),
    tb(["Regel", "Beispiel"], [["+ s", "le livre → les livres"], ["-al → -aux", "le journal → les journaux"], ["-eau, -eu → +x", "le bateau → les bateaux · le jeu → les jeux"], ["-s, -x, -z bleiben", "le fils → les fils"], ["unregelmäßig", "l'œil → les yeux · madame → mesdames"]]),
    h("Gebrauch"),
    ex([["Je mange du pain, de la viande et des fruits.", "Ich esse Brot, Fleisch und Obst."], ["Je ne mange pas de viande.", "Ich esse kein Fleisch.", "Nach Verneinung: de/d'."], ["J'aime le café.", "Ich mag Kaffee.", "Allgemein: bestimmter Artikel."]])
  ]
});

D.add({ id: "g-verb", lv: "G", t: ["Verben: Zeiten im Überblick", "Les temps verbaux"], s: ["Alle Zeiten und Modi mit Bildung und Gebrauch.", "Tous les temps."], k: "zeiten verben uebersicht present passe compose imparfait futur conditionnel subjonctif plus-que-parfait imperativ",
  b: [
    tb(["Zeit", "Bildung", "Beispiel", "Gebrauch"], [
      ["présent", "Stamm + Endung", "je parle", "Gegenwart, Gewohnheit"],
      ["passé composé", "avoir/être + Partizip", "j'ai parlé", "abgeschlossene Handlung"],
      ["imparfait", "nous-Stamm + -ais", "je parlais", "Beschreibung, Gewohnheit"],
      ["plus-que-parfait", "imparfait von avoir/être + Partizip", "j'avais parlé", "Vorvergangenheit"],
      ["futur proche", "aller + Infinitiv", "je vais parler", "nahe Zukunft"],
      ["futur simple", "Infinitiv + -ai", "je parlerai", "Zukunft, Versprechen"],
      ["futur antérieur", "futur von avoir/être + Partizip", "j'aurai parlé", "Vorzukunft"],
      ["conditionnel présent", "Futurstamm + -ais", "je parlerais", "Höflichkeit, irreal"],
      ["conditionnel passé", "conditionnel von avoir/être + Partizip", "j'aurais parlé", "irreal Vergangenheit"],
      ["subjonctif présent", "ils-Stamm + -e", "que je parle", "nach Wunsch, Pflicht, Gefühl"],
      ["subjonctif passé", "subjonctif von avoir/être + Partizip", "que j'aie parlé", "Vorzeitigkeit"],
      ["impératif", "tu/nous/vous-Form", "parle ! parlons ! parlez !", "Befehl, Bitte"],
      ["passé simple", "Stamm + -a/-it/-ut", "il parla", "Literatur"],
      ["gérondif", "en + -ant", "en parlant", "Gleichzeitigkeit"]
    ]),
    tip("Die Zeiten **présent, passé composé, imparfait, futur proche** reichen im Alltag. Alles andere brauchst du für Schrift, Literatur und feinere Aussagen.")
  ]
});

D.add({ id: "g-satz", lv: "G", t: ["Satzbau, Verneinung, Fragen", "Phrase, négation, questions"], s: ["Wortstellung, Verneinungsformen, Fragearten.", "Structure de la phrase."], k: "satzbau wortstellung verneinung fragen ne pas jamais rien personne plus inversion est-ce que",
  b: [
    p("Grundstruktur: **Subjekt – (ne) – Pronomen – Verb – (pas) – Objekt – Ort – Zeit**."),
    tb(["Verneinung", "Bedeutung", "Beispiel"], [["ne … pas", "nicht", "Je ne mange pas."], ["ne … jamais", "nie", "Je ne mange jamais."], ["ne … plus", "nicht mehr", "Je ne mange plus."], ["ne … rien", "nichts", "Je ne vois rien."], ["ne … personne", "niemand", "Je ne vois personne."], ["ne … que", "nur", "Je ne mange que du pain."], ["ne … ni … ni …", "weder … noch", "Je n'aime ni le thé ni le café."], ["ne … aucun(e)", "kein", "Je n'ai aucune idée."]]),
    h("Fragen"),
    tb(["Art", "Beispiel"], [["Intonation", "Tu viens ?"], ["est-ce que", "Est-ce que tu viens ?"], ["Inversion", "Viens-tu ? · Va-t-il partir ?"], ["Fragewort + est-ce que", "Où est-ce que tu habites ?"], ["Fragewort + Inversion", "Où habites-tu ?"], ["Fragewort am Ende (familiär)", "Tu habites où ?"]]),
    voc("Fragewörter", [["qui", "wer"], ["que / quoi", "was"], ["où", "wo/wohin"], ["quand", "wann"], ["pourquoi", "warum"], ["comment", "wie"], ["combien", "wie viel"], ["quel / quelle", "welcher/welche"], ["lequel", "welcher (von mehreren)"]])
  ]
});

D.add({ id: "g-pronomen", lv: "G", t: ["Pronomen im Überblick", "Les pronoms"], s: ["Subjekt, Objekt, betonte, reflexive, Demonstrativ- und Possessivpronomen.", "Tous les pronoms."], k: "pronomen subjekt objekt betont reflexiv demonstrativ possessiv ce cela celui le mien",
  b: [
    tb(["Person", "Subjekt", "COD", "COI", "betont", "reflexiv"], [["1. Sg.", "je", "me", "me", "moi", "me"], ["2. Sg.", "tu", "te", "te", "toi", "te"], ["3. Sg. m.", "il", "le", "lui", "lui", "se"], ["3. Sg. f.", "elle", "la", "lui", "elle", "se"], ["1. Pl.", "nous", "nous", "nous", "nous", "nous"], ["2. Pl.", "vous", "vous", "vous", "vous", "vous"], ["3. Pl. m.", "ils", "les", "leur", "eux", "se"], ["3. Pl. f.", "elles", "les", "leur", "elles", "se"]]),
    h("Possessiv"),
    tb(["", "m.", "f.", "Plural"], [["mein", "mon", "ma (mon)", "mes"], ["dein", "ton", "ta (ton)", "tes"], ["sein/ihr", "son", "sa (son)", "ses"], ["unser", "notre", "notre", "nos"], ["euer", "votre", "votre", "vos"], ["ihr", "leur", "leur", "leurs"]]),
    h("Demonstrativ"),
    tb(["", "m.", "f.", "Plural"], [["dieser (Adj.)", "ce / cet", "cette", "ces"], ["derjenige", "celui", "celle", "ceux / celles"], ["das (neutral)", "ce, ça, cela, ceci", "", ""]]),
    tip("*mon* steht auch vor weiblichem Nomen mit Vokal: *mon amie*, *son école*.")
  ]
});

D.add({ id: "g-adj", lv: "G", t: ["Adjektive, Adverbien, Zahlen", "Adjectifs, adverbes, nombres"], s: ["Angleichung, Stellung, Steigerung, Adverbbildung, Zahlen.", "Accord et degré."], k: "adjektive adverbien zahlen steigerung stellung angleichung ment comparatif superlatif",
  b: [
    tb(["Regel", "Beispiel"], [["f. + e", "petit → petite"], ["-eux → -euse", "heureux → heureuse"], ["-if → -ive", "actif → active"], ["-er → -ère", "premier → première"], ["Verdopplung", "bon → bonne · gros → grosse"], ["Plural + s", "petits, petites"]]),
    h("Stellung"),
    p("Meist nach dem Nomen (*une voiture rouge*). Vor dem Nomen (BAGS): **B**eauté (beau, joli), **A**ge (jeune, vieux, nouveau), **G**röße (grand, petit, gros), **S**ubjektiv-gut/schlecht (bon, mauvais). Vorstellung: *un beau livre*, *une petite ville*."),
    h("Adverbien"),
    ex([["lent → lentement", "langsam"], ["heureux → heureusement", "glücklicherweise"], ["évident → évidemment", "offensichtlich"], ["constant → constamment", "ständig"]]),
    h("Steigerung"),
    tb(["", "Beispiel"], [["plus … que", "plus grand que"], ["aussi … que", "aussi grand que"], ["moins … que", "moins grand que"], ["Superlativ", "le plus grand, la moins chère"], ["unregelmäßig", "bon → meilleur · bien → mieux"]]),
    h("Zahlen"),
    tb(["", ""], [["70", "soixante-dix (CH/BE: septante)"], ["80", "quatre-vingts"], ["90", "quatre-vingt-dix (BE/CH: nonante)"], ["91", "quatre-vingt-onze"], ["100", "cent"], ["1000", "mille"], ["1 000 000", "un million"]])
  ]
});

D.add({ id: "g-praep", lv: "G", t: ["Präpositionen und Ortsangaben", "Prépositions et lieux"], s: ["à, de, en, dans, chez, sur, sous; Länder und Städte.", "Choisir la bonne préposition."], k: "praepositionen ortsangaben a de en dans chez sur sous laender staedte au aux",
  b: [
    tb(["Wohin / Wo", "Regel", "Beispiel"], [["Stadt", "à", "à Paris, à Berlin"], ["weibliches Land / Land mit Vokal", "en", "en France, en Allemagne, en Iran"], ["männliches Land", "au", "au Canada, au Maroc"], ["Plural-Land", "aux", "aux États-Unis"], ["bei einer Person", "chez", "chez le médecin, chez moi"], ["in einem Raum", "dans", "dans la cuisine"], ["Verkehrsmittel", "en / à", "en train, en voiture, à pied, à vélo"]]),
    h("Woher"),
    tb(["", "Beispiel"], [["Stadt", "de Paris"], ["Land f.", "de France"], ["Land m.", "du Canada"], ["Länder Pl.", "des États-Unis"]]),
    h("Zeit"),
    tb(["Präposition", "Bedeutung", "Beispiel"], [["depuis", "seit (Dauer, dauert an)", "J'habite ici depuis 2020."], ["il y a", "vor", "Il y a trois jours."], ["pendant", "während (Dauer)", "Pendant deux heures."], ["dans", "in (Zukunft)", "Dans une semaine."], ["en", "innerhalb von", "En une heure."], ["pour", "für (geplante Dauer)", "Je pars pour un mois."]]),
    warn("*depuis* + Präsens: Handlung dauert noch an → *J'apprends le français depuis un an.* (nicht passé composé!).")
  ]
});

// ---------- R: Nachschlagen ----------
D.add({ id: "r-avoir-etre", lv: "R", t: ["avoir, être, aller, faire", "avoir, être, aller, faire"], s: ["Die vier wichtigsten Verben in allen Zeiten.", "Les quatre verbes essentiels."], k: "conjugaison avoir etre aller faire konjugation tabelle",
  b: [
    tb(["", "avoir", "être", "aller", "faire"], [
      ["je", "ai", "suis", "vais", "fais"], ["tu", "as", "es", "vas", "fais"], ["il/elle", "a", "est", "va", "fait"], ["nous", "avons", "sommes", "allons", "faisons"], ["vous", "avez", "êtes", "allez", "faites"], ["ils/elles", "ont", "sont", "vont", "font"]
    ]),
    tb(["Zeit", "avoir", "être", "aller", "faire"], [
      ["imparfait", "j'avais", "j'étais", "j'allais", "je faisais"], ["Partizip", "eu", "été", "allé", "fait"], ["futur", "j'aurai", "je serai", "j'irai", "je ferai"], ["conditionnel", "j'aurais", "je serais", "j'irais", "je ferais"], ["subjonctif", "que j'aie", "que je sois", "que j'aille", "que je fasse"], ["impératif (tu)", "aie", "sois", "va", "fais"]
    ])
  ]
});

D.add({ id: "r-regelmaessig", lv: "R", t: ["Regelmäßige Verben", "Verbes réguliers"], s: ["-er, -ir, -re im Präsens, Partizip und Futur.", "Conjugaisons régulières."], k: "regelmaessige verben konjugation parler finir vendre er ir re endungen",
  b: [
    tb(["", "parler (-er)", "finir (-ir)", "vendre (-re)"], [["je", "parle", "finis", "vends"], ["tu", "parles", "finis", "vends"], ["il/elle", "parle", "finit", "vend"], ["nous", "parlons", "finissons", "vendons"], ["vous", "parlez", "finissez", "vendez"], ["ils/elles", "parlent", "finissent", "vendent"], ["Partizip", "parlé", "fini", "vendu"], ["futur", "parlerai", "finirai", "vendrai"], ["imparfait", "parlais", "finissais", "vendais"]]),
    h("Besonderheiten bei -er"),
    ul(["**manger:** nous mangeons (e bleibt)", "**commencer:** nous commençons (ç)", "**appeler:** j'appelle, nous appelons", "**acheter:** j'achète, nous achetons", "**payer:** je paie / je paye", "**préférer:** je préfère, nous préférons"])
  ]
});

D.add({ id: "r-unregelmaessig", lv: "R", t: ["Unregelmäßige Verben (Auswahl)", "Verbes irréguliers"], s: ["pouvoir, vouloir, devoir, savoir, prendre, venir, voir, dire.", "Présent et participe passé."], k: "unregelmaessige verben pouvoir vouloir devoir savoir prendre venir voir dire boire lire ecrire partir",
  b: [
    tb(["", "pouvoir", "vouloir", "devoir", "savoir"], [["je", "peux", "veux", "dois", "sais"], ["tu", "peux", "veux", "dois", "sais"], ["il", "peut", "veut", "doit", "sait"], ["nous", "pouvons", "voulons", "devons", "savons"], ["vous", "pouvez", "voulez", "devez", "savez"], ["ils", "peuvent", "veulent", "doivent", "savent"], ["Partizip", "pu", "voulu", "dû", "su"]]),
    tb(["", "prendre", "venir", "voir", "dire"], [["je", "prends", "viens", "vois", "dis"], ["nous", "prenons", "venons", "voyons", "disons"], ["vous", "prenez", "venez", "voyez", "dites"], ["ils", "prennent", "viennent", "voient", "disent"], ["Partizip", "pris", "venu", "vu", "dit"]]),
    tb(["Infinitiv", "je", "nous", "Partizip"], [["boire", "bois", "buvons", "bu"], ["lire", "lis", "lisons", "lu"], ["écrire", "écris", "écrivons", "écrit"], ["mettre", "mets", "mettons", "mis"], ["partir", "pars", "partons", "parti (être)"], ["sortir", "sors", "sortons", "sorti (être)"], ["ouvrir", "ouvre", "ouvrons", "ouvert"], ["connaître", "connais", "connaissons", "connu"], ["croire", "crois", "croyons", "cru"], ["recevoir", "reçois", "recevons", "reçu"]])
  ]
});

D.add({ id: "r-listen", lv: "R", t: ["Listen: Zahlen, Zeit, Farben, Wochentage", "Listes utiles"], s: ["Zahlen, Uhrzeit, Datum, Farben, Familie.", "Nombres, heure, dates."], k: "zahlen uhrzeit datum farben wochentage monate familie liste nombres couleurs",
  b: [
    voc("Zahlen 0–20", [["0 zéro", "null"], ["1 un", "eins"], ["2 deux", "zwei"], ["3 trois", "drei"], ["4 quatre", "vier"], ["5 cinq", "fünf"], ["6 six", "sechs"], ["7 sept", "sieben"], ["8 huit", "acht"], ["9 neuf", "neun"], ["10 dix", "zehn"], ["11 onze", "elf"], ["12 douze", "zwölf"], ["13 treize", "dreizehn"], ["14 quatorze", "vierzehn"], ["15 quinze", "fünfzehn"], ["16 seize", "sechzehn"], ["17 dix-sept", "siebzehn"], ["18 dix-huit", "achtzehn"], ["19 dix-neuf", "neunzehn"], ["20 vingt", "zwanzig"]]),
    voc("Jours et mois", [["lundi", "Montag"], ["mardi", "Dienstag"], ["mercredi", "Mittwoch"], ["jeudi", "Donnerstag"], ["vendredi", "Freitag"], ["samedi", "Samstag"], ["dimanche", "Sonntag"], ["janvier", "Januar"], ["février", "Februar"], ["mars", "März"], ["avril", "April"], ["mai", "Mai"], ["juin", "Juni"], ["juillet", "Juli"], ["août", "August"], ["septembre", "September"], ["octobre", "Oktober"], ["novembre", "November"], ["décembre", "Dezember"]]),
    voc("Couleurs", [["rouge", "rot"], ["bleu", "blau"], ["vert", "grün"], ["jaune", "gelb"], ["noir", "schwarz"], ["blanc / blanche", "weiß"], ["gris", "grau"], ["orange", "orange"], ["rose", "rosa"], ["violet", "violett"], ["marron", "braun"]]),
    voc("La famille", [["le père / la mère", "Vater / Mutter"], ["le frère / la sœur", "Bruder / Schwester"], ["le fils / la fille", "Sohn / Tochter"], ["le grand-père / la grand-mère", "Opa / Oma"], ["l'oncle / la tante", "Onkel / Tante"], ["le cousin / la cousine", "Cousin / Cousine"], ["le mari / la femme", "Ehemann / Ehefrau"]]),
    tb(["Uhrzeit", "Französisch"], [["8:00", "huit heures"], ["8:15", "huit heures et quart"], ["8:30", "huit heures et demie"], ["8:45", "neuf heures moins le quart"], ["12:00", "midi"], ["0:00", "minuit"]])
  ]
});

D.add({ id: "r-fehler", lv: "R", t: ["Typische Fehler für Deutschsprachige", "Erreurs fréquentes"], s: ["Falsche Freunde und typische Stolperfallen.", "Pièges classiques."], k: "fehler falsche freunde faux amis stolperfallen deutsche typische fehler",
  b: [
    tb(["Falsch (Deutsch gedacht)", "Richtig", "Hinweis"], [
      ["Je suis 30 ans.", "J'ai 30 ans.", "Alter mit avoir"],
      ["Je gehe in die Schule → Je vais dans l'école", "Je vais à l'école.", "à, nicht dans"],
      ["Ich habe Hunger → Je suis faim", "J'ai faim.", "avoir faim/soif/chaud/froid"],
      ["Ich mache ein Foto → Je fais un foto", "Je prends une photo.", "prendre"],
      ["Ich lerne Französisch seit einem Jahr → J'ai appris depuis", "J'apprends le français depuis un an.", "depuis + Präsens"],
      ["Je vais chez la maison.", "Je vais à la maison / chez moi.", "chez + Person"],
      ["Je préfère le fromage que le pain.", "… le fromage au pain.", "préférer … à"]
    ]),
    h("Falsche Freunde"),
    tb(["Französisch", "Bedeutet", "NICHT"], [["actuellement", "gegenwärtig", "tatsächlich (= en fait)"], ["la chance", "Glück", "Chance (= l'occasion)"], ["le car", "Reisebus", "Auto (= la voiture)"], ["demander", "fragen, bitten", "verlangen/dem Mann"], ["rester", "bleiben", "rasten"], ["la veste", "Sakko", "Weste (= le gilet)"], ["la lecture", "Lektüre", "Lektion (= la leçon)"], ["éventuellement", "gegebenenfalls", "eventuell (= peut-être)"], ["sensible", "empfindlich, spürbar", "vernünftig (= raisonnable)"]])
  ]
});
})();
