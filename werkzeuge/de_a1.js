// Deutschkurs A1 – Teil 1 (Lektionen 1–7)
(function(){
var D = DE, p = D.p, h = D.h, tip = D.tip, warn = D.warn, ul = D.ul, tb = D.tb, ex = D.ex, voc = D.voc, dlg = D.dlg, mc = D.mc, gap = D.gap, ord = D.ord, mat = D.mat, xg = D.xg;

D.add({ id: "a1-aussprache", lv: "A1", t: ["Alphabet und Aussprache", "Alphabet et prononciation"], s: ["Buchstaben, Umlaute, ch, sch, sp/st, ei/ie – so klingt Deutsch.", "Lettres, trémas, ch, sch, sp/st, ei/ie – les sons de l'allemand."], k: "buchstabe alphabet umlaut ß ch sch aussprache lautschrift lettre prononciation son",
  b: [
    p("Deutsch wird fast so gesprochen, wie es geschrieben wird. Wenn du die Regeln kennst, kannst du jedes Wort lesen.", "L'allemand se prononce presque comme il s'écrit. Si tu connais les règles, tu peux lire chaque mot."),
    h("Das Alphabet", "L'alphabet"),
    p("Das deutsche Alphabet hat 26 Buchstaben, dazu kommen **ä, ö, ü** und **ß**. Drück auf 🔊, um den Namen jedes Buchstabens zu hören.", "L'alphabet allemand compte 26 lettres, plus **ä, ö, ü** et **ß**. Appuie sur 🔊 pour entendre le nom de chaque lettre."),
    tb(["A a", "B b", "C c", "D d", "E e", "F f", "G g"], [["[a]", "[be]", "[tsé]", "[dé]", "[é]", "[èf]", "[gé]"]]),
    tb(["H h", "I i", "J j", "K k", "L l", "M m", "N n"], [["[ha]", "[i]", "[yot]", "[ka]", "[èl]", "[èm]", "[èn]"]]),
    tb(["O o", "P p", "Q q", "R r", "S s", "T t", "U u"], [["[o]", "[pé]", "[kou]", "[èr]", "[ès]", "[té]", "[ou]"]]),
    tb(["V v", "W w", "X x", "Y y", "Z z", "ß", "ä ö ü"], [["[fao]", "[vé]", "[iks]", "[üpsilon]", "[tsèt]", "[èss-tsèt]", "[è] [eu] [u]"]]),
    ex([["Wie schreibt man das? – A-U-S-S-P-R-A-C-H-E.", "Comment ça s'écrit ? – A-U-S-S-P-R-A-C-H-E."], ["Mein Name ist Müller: M-Ü-L-L-E-R.", "Mon nom est Müller : M-Ü-L-L-E-R."]]),
    h("Die Vokale", "Les voyelles"),
    p("Jeder Vokal kann **lang** oder **kurz** sein. Vor zwei Konsonanten ist er meist kurz (Mitte, Bett), vor einem Konsonanten oder bei **h** nach dem Vokal oft lang (Name, Bahn). Doppelte Vokale (aa, ee, oo) sind immer lang.", "Chaque voyelle peut être **longue** ou **brève**. Devant deux consonnes elle est en général brève (Mitte, Bett) ; devant une seule consonne ou avec un **h** après la voyelle elle est souvent longue (Name, Bahn). Les voyelles doubles (aa, ee, oo) sont toujours longues."),
    tb(["Buchstabe", "Klang", "Beispiele"], [["ä", "wie französisch **è** (lang oder kurz)", "Bär, Käse, Mädchen"], ["ö", "wie in **peu / heure** – Lippen rund, Zunge bei „é“", "schön, können, Öl"], ["ü", "wie französisch **u** (rue)", "für, Tür, müde"], ["ei", "wie **aï** (ail)", "nein, mein, Eis"], ["ie", "langes **i**, nie „i-é“", "Liebe, Bier, Film"], ["eu / äu", "wie **oï**", "neu, Freund, Häuser"], ["au", "wie **aou**", "Haus, Auto, laufen"], ["Vokal + h", "das h wird nicht gesprochen, der Vokal ist lang", "Bahn, sehr, Uhr"]]),
    warn("Achtung: **ie** ist ein langes „i“ (Bier = [bir]), **ei** ist „aï“ (nein = [naïn]). Viele Anfänger verwechseln das!", "Attention : **ie** est un « i » long (Bier = [bir]), **ei** se dit « aï » (nein = [naïn]). Beaucoup de débutants confondent !"),
    h("Die Konsonanten", "Les consonnes"),
    tb(["Schreibung", "Klang", "Beispiele"], [["**ch** nach a, o, u, au", "hart, im Hals wie spanisch **j** (Bach)", "Buch, acht, Nacht, auch"], ["**ch** nach anderen Lauten", "weich, wie ein Zischen, Zunge am Gaumen", "ich, Milch, Mädchen, Küche"], ["**-ig** am Wortende", "wie „ich“", "richtig, fertig, König"], ["**sch**", "wie französisch **ch**", "Schule, schön, Fisch"], ["**sp / st** am Silbenanfang", "**schp / scht**", "Sport, spielen, Stein, Straße"], ["**s** vor Vokal", "stimmhaft wie französisch **z**", "Sonne, sagen, lesen"], ["**s** am Ende, **ss**, **ß**", "stimmlos wie französisch **ss**", "Haus, Wasser, Straße"], ["**z, tz**", "**ts**", "Zeit, Katze, Platz"], ["**w**", "wie französisch **v**", "Wasser, wir, Wein"], ["**v**", "meist wie **f**", "Vater, viel, von"], ["**j**", "wie französisch **y** (yeux)", "ja, Jahr, jung"], ["**qu**", "**kv**", "Qualität, Quelle"], ["**r**", "hinten im Hals, weicher als im Französischen; am Silbenende fast wie „a“", "rot, Bruder, Lehrer"], ["**pf**", "p+f zusammen", "Pferd, Apfel"], ["**th, ph**", "wie t, f", "Theater, Physik"]]),
    warn("**Auslautverhärtung**: Am Wortende klingen **b, d, g** wie **p, t, k**: Hund = [hunt], Tag = [tak], Korb = [korp].", "**Durcissement final** : à la fin d'un mot, **b, d, g** sonnent comme **p, t, k** : Hund = [hunt], Tag = [tak], Korb = [korp]."),
    h("Betonung und Rhythmus", "Accent et rythme"),
    p("Im Deutschen liegt die Betonung meistens auf der **ersten Silbe**: **AR**beit, **FRE**und, **BAL**kon. Bei trennbaren Verben ist die Vorsilbe betont: **AN**kommen. Im Französischen ist es anders – dort ist die letzte Silbe betont.", "En allemand l'accent tombe le plus souvent sur la **première syllabe** : **AR**beit, **FRE**und, **BAL**kon. Avec les verbes séparables le préfixe est accentué : **AN**kommen. En français, c'est l'inverse – la dernière syllabe est accentuée."),
    p("Außerdem: Alle Nomen schreibt man **groß**. Der Satz beginnt groß. Ein Wort wie „ss“ oder „ß“: nach langem Vokal oder Diphthong schreibt man **ß** (Straße, heißen), nach kurzem Vokal **ss** (Wasser, muss). In der Schweiz schreibt man immer „ss“.", "De plus : tous les noms prennent une **majuscule**. Pour « ss » ou « ß » : après une voyelle longue ou une diphtongue on écrit **ß** (Straße, heißen), après une voyelle brève **ss** (Wasser, muss). En Suisse on écrit toujours « ss »."),
    voc("Hör- und Sprechtraining", [["Schule", "école"], ["Schmetterling", "papillon"], ["Straße", "rue"], ["Zeitung", "journal"], ["Mädchen", "fille"], ["Milch", "lait"], ["Bücher", "livres"], ["fünf", "cinq"], ["Entschuldigung", "pardon / excusez-moi"], ["Eichhörnchen", "écureuil"]])
  ],
  x: [
    xg("Aussprache", "Prononciation", [
      mc(["Wie spricht man „ie“ in „Bier“?", "Comment prononce-t-on « ie » dans « Bier » ?"], ["[aï]", "[i] lang", "[ié]", "[oï]"], 1, ["„ie“ ist ein langes i. „ei“ wäre [aï].", "« ie » est un i long. « ei » serait [aï]."]),
      mc(["Welches Wort klingt wie „aï“?", "Quel mot sonne comme « aï » ?"], ["Bier", "mein", "Mäuse", "Hund"], 1, ["„ei“ = [aï]: mein.", "« ei » = [aï] : mein."]),
      mc(["Wie spricht man „sch“?", "Comment prononce-t-on « sch » ?"], ["wie s", "wie k", "wie französisch ch", "wie z"], 2, ["Schule = [choule].", "Schule = [choule]."]),
      mc(["Wie spricht man „Stein“?", "Comment prononce-t-on « Stein » ?"], ["[stein]", "[schtain]", "[sain]", "[tsain]"], 1, ["Am Silbenanfang wird „st“ zu „scht“.", "Au début d'une syllabe, « st » devient « scht »."]),
      mc(["Welcher Buchstabe klingt wie „ts“?", "Quelle lettre sonne comme « ts » ?"], ["s", "z", "w", "v"], 1, ["Zeit = [tsaït].", "Zeit = [tsaït]."]),
      mc(["Wie spricht man „Wasser“ am Anfang?", "Comment prononce-t-on le début de « Wasser » ?"], ["wie französisch w (oui)", "wie französisch v", "wie f", "wie gu"], 1, ["Das deutsche w ist ein v.", "Le w allemand se prononce v."]),
      mc(["Wie klingt „Tag“ am Ende?", "Comment sonne la fin de « Tag » ?"], ["[tag]", "[tak]", "[tash]", "[taj]"], 1, ["Auslautverhärtung: g → k.", "Durcissement final : g → k."])
    ]),
    xg("Rechtschreibung", "Orthographe", [
      gap("Die Stra___e ist lang. (ß oder ss?)", ["ß"], ["Nach langem Vokal (Straße) schreibt man ß.", "Après voyelle longue on écrit ß."]),
      gap("Das Wa___er ist kalt. (ß oder ss?)", ["ss"], ["Nach kurzem Vokal: ss.", "Après voyelle brève : ss."]),
      gap("Ich hei___e Anna. (ß oder ss?)", ["ß"], ["Nach Diphthong (ei): ß.", "Après diphtongue (ei) : ß."]),
      mc(["Welche Schreibung ist richtig?", "Quelle graphie est correcte ?"], ["Das buch ist neu.", "Das Buch ist neu.", "das Buch ist neu.", "Das buch Ist neu."], 1, ["Nomen und Satzanfang schreibt man groß.", "Les noms et le début de phrase prennent une majuscule."])
    ]),
    xg("Zuordnen", "Associer", [
      mat([["Ö", "[eu]"], ["Ü", "[u] français"], ["Ä", "[è]"], ["ß", "ss"], ["W", "[v]"], ["J", "[y]"]])
    ])
  ] });

D.add({ id: "a1-vorstellen", lv: "A1", t: ["Hallo! Sich vorstellen", "Salut ! Se présenter"], s: ["Begrüßen, Namen, Herkunft, Wohnort – mit sein, heißen, kommen, wohnen.", "Saluer, nom, origine, lieu d'habitation – avec sein, heißen, kommen, wohnen."], k: "begrüßen vorstellen sein heißen kommen wohnen pronomen ich du sie sie salut se présenter pronoms personnels",
  b: [
    p("In dieser Lektion lernst du, dich vorzustellen und einfache Fragen zu beantworten.", "Dans cette leçon tu apprends à te présenter et à répondre à des questions simples."),
    dlg("Dialog: Im Deutschkurs", [["A", "Guten Tag! Ich heiße Marie. Und wie heißen Sie?", "Bonjour ! Je m'appelle Marie. Et vous, comment vous appelez-vous ?"], ["B", "Ich heiße Paul Schmidt. Woher kommen Sie?", "Je m'appelle Paul Schmidt. D'où venez-vous ?"], ["A", "Ich komme aus Frankreich, aus Lyon. Und Sie?", "Je viens de France, de Lyon. Et vous ?"], ["B", "Ich komme aus Deutschland, aus Köln. Ich wohne jetzt in Berlin.", "Je viens d'Allemagne, de Cologne. J'habite maintenant à Berlin."], ["A", "Freut mich!", "Enchantée !"], ["B", "Freut mich auch!", "Enchanté aussi !"]]),
    h("Begrüßen und verabschieden", "Saluer et prendre congé"),
    voc("Grüße", [["Hallo! / Hi!", "Salut !", "informell"], ["Guten Morgen!", "Bonjour ! (le matin)"], ["Guten Tag!", "Bonjour ! (la journée)"], ["Guten Abend!", "Bonsoir !"], ["Gute Nacht!", "Bonne nuit !"], ["Servus! / Grüß Gott! / Moin!", "Salut ! / Bonjour !", "Süd / Süd / Nord"], ["Grüezi!", "Bonjour !", "Schweiz"], ["Auf Wiedersehen!", "Au revoir !"], ["Tschüss! / Bis bald! / Bis morgen!", "Salut ! / À bientôt ! / À demain !"], ["Wie geht's? – Gut, danke. Und dir?", "Comment ça va ? – Bien, merci. Et toi ?"], ["Bitte / Danke / Entschuldigung", "S'il vous plaît, de rien / Merci / Pardon"]]),
    h("Die Personalpronomen", "Les pronoms personnels"),
    tb(["Person", "Deutsch", "Französisch"], [["1. Sg.", "ich", "je"], ["2. Sg. (vertraut)", "du", "tu"], ["3. Sg.", "er / sie / es", "il / elle / (ce)"], ["1. Pl.", "wir", "nous"], ["2. Pl. (vertraut)", "ihr", "vous (pl.)"], ["3. Pl.", "sie", "ils / elles"], ["Höflichkeitsform", "**Sie** (immer groß)", "vous (de politesse)"]]),
    tip("**du / Sie**: „du“ sagt man zu Familie, Freunden, Kindern und oft unter jungen Leuten. „Sie“ ist die höfliche Form für Fremde, im Beruf und bei Älteren – das Verb steht dann wie bei „sie“ (Plural): „Wie heißen **Sie**?“", "**du / Sie** : « du » = tutoiement (famille, amis, enfants, souvent entre jeunes). « Sie » = vouvoiement (inconnus, travail, personnes âgées) – le verbe se conjugue comme pour « sie » (pluriel) : « Wie heißen **Sie**? »"),
    h("Die wichtigen Verben im Präsens", "Les verbes importants au présent"),
    p("Im Deutschen besteht das Verb aus **Stamm + Endung**. Die Endung zeigt die Person: -e, -st, -t, -en, -t, -en. Das Verb **sein** (être) ist unregelmäßig und muss gelernt werden.", "En allemand le verbe = **radical + terminaison**. La terminaison indique la personne : -e, -st, -t, -en, -t, -en. Le verbe **sein** (être) est irrégulier et doit être appris par cœur."),
    tb(["", "sein (être)", "heißen (s'appeler)", "kommen (venir)", "wohnen (habiter)"], [["ich", "{{bin}}", "heiß**e**", "komm**e**", "wohn**e**"], ["du", "{{bist}}", "heiß**t**", "komm**st**", "wohn**st**"], ["er/sie/es", "{{ist}}", "heiß**t**", "komm**t**", "wohn**t**"], ["wir", "{{sind}}", "heiß**en**", "komm**en**", "wohn**en**"], ["ihr", "{{seid}}", "heiß**t**", "komm**t**", "wohn**t**"], ["sie/Sie", "{{sind}}", "heiß**en**", "komm**en**", "wohn**en**"]]),
    ex([["Ich bin Marie. Ich komme aus Frankreich.", "Je suis Marie. Je viens de France."], ["Wie heißt du? – Ich heiße Tom.", "Comment t'appelles-tu ? – Je m'appelle Tom."], ["Woher kommen Sie? – Aus Spanien.", "D'où venez-vous ? – D'Espagne."], ["Wo wohnst du? – In Paris.", "Où habites-tu ? – À Paris."], ["Er ist Lehrer. Sie ist Ärztin.", "Il est professeur. Elle est médecin.", "Beruf ohne Artikel!"]]),
    warn("Falsche Freunde: „**heißen**“ = s'appeler (nicht „chauffer“), „**sein**“ = être. Im Deutschen sagt man **kein** Verb „sich nennen“ für den Namen: „Ich heiße Anna“ (nicht „Ich nenne mich Anna“).", "Faux amis : « **heißen** » = s'appeler. Pour le nom on dit « Ich heiße Anna », pas « Ich nenne mich Anna »."),
    h("W-Fragen und Präpositionen", "Mots interrogatifs et prépositions"),
    tb(["Frage", "Bedeutung", "Antwort"], [["Wie heißt du?", "Comment t'appelles-tu ?", "Ich heiße …"], ["Woher kommst du?", "D'où viens-tu ?", "Ich komme **aus** + Land/Stadt"], ["Wo wohnst du?", "Où habites-tu ?", "Ich wohne **in** + Stadt"], ["Wie alt bist du?", "Quel âge as-tu ?", "Ich bin 25 (Jahre alt)."], ["Was bist du von Beruf?", "Quel est ton métier ?", "Ich bin Lehrer."], ["Welche Sprachen sprichst du?", "Quelles langues parles-tu ?", "Ich spreche Französisch und Deutsch."]]),
    voc("Länder und Sprachen", [["Deutschland – Deutsch", "Allemagne – allemand"], ["Frankreich – Französisch", "France – français"], ["Österreich – Deutsch", "Autriche – allemand"], ["die Schweiz – Deutsch, Französisch, Italienisch", "Suisse – allemand, français, italien"], ["Italien – Italienisch", "Italie – italien"], ["Spanien – Spanisch", "Espagne – espagnol"], ["England – Englisch", "Angleterre – anglais"], ["Belgien – Niederländisch, Französisch, Deutsch", "Belgique – néerlandais, français, allemand"]])
  ],
  x: [
    xg("Verb im Präsens", "Verbe au présent", [
      gap("Ich ___ Anna.", ["heiße"]), gap("Du ___ aus Spanien.", ["kommst"]), gap("Er ___ in Berlin.", ["wohnt"]), gap("Wir ___ Studenten.", ["sind"]), gap("___ du müde? – Ja, ich ___ müde.", ["Bist", "bin"]), gap("Ihr ___ aus Frankreich.", ["kommt"]), gap("Sie (Höflichkeit) ___ Lehrer?", ["Sind"], ["Bei „Sie“ (höflich) benutzt man „sind“.", "Avec « Sie » de politesse on utilise « sind »."])
    ]),
    xg("Pronomen und Fragen", "Pronoms et questions", [
      mc(["Zu einer fremden Person sagst du:", "À une personne inconnue tu dis :"], ["Wie heißt du?", "Wie heißen Sie?", "Wie heißt ihr?", "Wie heiße ich?"], 1, ["Höflich: Sie + Verb im Plural.", "Poli : Sie + verbe au pluriel."]),
      mc(["„Woher kommst du?“ fragt nach …", "« Woher kommst du ? » demande …"], ["dem Wohnort", "dem Beruf", "der Herkunft", "dem Alter"], 2),
      mc(["Welches Pronomen passt? „___ bin Marie.“", "Quel pronom convient ? « ___ bin Marie. »"], ["Ich", "Du", "Er", "Wir"], 0),
      mc(["Was ist richtig?", "Qu'est-ce qui est correct ?"], ["Ich bist Student.", "Ich bin Student.", "Ich ist Student.", "Ich sind Student."], 1)
    ]),
    xg("Satz bilden", "Former des phrases", [
      ord(["Ich", "komme", "aus", "Frankreich."], "Ich komme aus Frankreich."),
      ord(["Wo", "wohnst", "du?"], "Wo wohnst du?"),
      ord(["Wie", "heißen", "Sie?"], "Wie heißen Sie?")
    ])
  ] });

D.add({ id: "a1-zahlen", lv: "A1", t: ["Zahlen, Uhrzeit und Datum", "Nombres, heure et date"], s: ["0–1000, Uhrzeit, Wochentage, Monate, Datum.", "0 à 1000, l'heure, jours, mois, date."], k: "zahlen uhrzeit datum wochentage monate nombres heure jours mois calendrier",
  b: [
    h("Die Zahlen 0–20", "Les nombres de 0 à 20"),
    tb(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], [["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn"]]),
    tb(["11", "12", "13", "14", "15", "16", "17", "18", "19", "20"], [["elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn", "zwanzig"]]),
    h("Die Zehner und Hunderter", "Les dizaines et centaines"),
    tb(["20", "30", "40", "50", "60", "70", "80", "90", "100", "1000"], [["zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig", "hundert", "tausend"]]),
    p("Die Zahlen von 21 bis 99 liest man **umgekehrt**: erst die Einer, dann „und“, dann der Zehner: 21 = **ein**undzwanzig, 34 = **vier**unddreißig, 99 = **neun**undneunzig. „quatre-vingt“ gibt es im Deutschen nicht: 80 = achtzig, 90 = neunzig. Eins wird in der Zahl zu **ein** (einundzwanzig).", "Les nombres de 21 à 99 se lisent **à l'envers** : d'abord l'unité, puis « und », puis la dizaine : 21 = **ein**undzwanzig, 34 = **vier**unddreißig, 99 = **neun**undneunzig. En allemand, pas de « quatre-vingt » : 80 = achtzig, 90 = neunzig. « eins » devient **ein** dans le nombre (einundzwanzig)."),
    ex([["Ich bin achtundzwanzig Jahre alt.", "J'ai vingt-huit ans."], ["Das kostet neunzehn Euro fünfzig.", "Ça coûte dix-neuf euros cinquante."], ["Meine Telefonnummer ist null-eins-sieben-sechs …", "Mon numéro de téléphone est le zéro-un-sept-six …"], ["Das Hotel hat zweihundertdreißig Zimmer.", "L'hôtel a deux cent trente chambres."], ["Das Jahr 2025: zweitausendfünfundzwanzig.", "L'année 2025 : deux mille vingt-cinq."]]),
    warn("**Zwei** und **drei** klingen am Telefon ähnlich. Deshalb sagt man manchmal „**zwo**“ für 2. Und: **sechs** – **sieben** nicht verwechseln: sechzehn / siebzehn, **sechzig / siebzig**: die Silben fallen weg!", "**zwei** et **drei** se confondent au téléphone, on dit parfois « **zwo** ». Attention : sechs → **sech**zehn / **sech**zig ; sieben → **sieb**zehn / **sieb**zig : des lettres tombent !"),
    h("Die Uhrzeit", "L'heure"),
    p("Es gibt zwei Arten: die **offizielle** (Fahrplan, Radio, Termin) und die **umgangssprachliche** (im Alltag).", "Il y a deux manières : l'heure **officielle** (horaires, radio, rendez-vous) et l'heure **courante** (dans la vie de tous les jours)."),
    tb(["Uhrzeit", "Offiziell", "Alltag"], [["8:00", "acht Uhr", "acht (Uhr)"], ["8:05", "acht Uhr fünf", "fünf nach acht"], ["8:15", "acht Uhr fünfzehn", "**Viertel nach acht**"], ["8:30", "acht Uhr dreißig", "**halb neun**"], ["8:45", "acht Uhr fünfundvierzig", "**Viertel vor neun**"], ["8:50", "acht Uhr fünfzig", "zehn vor neun"], ["12:00", "zwölf Uhr", "Mittag"], ["0:00", "null Uhr", "Mitternacht"], ["14:20", "vierzehn Uhr zwanzig", "zwanzig nach zwei"]]),
    warn("**halb neun = 8:30**, nicht 9:30! „Halb“ bedeutet: „die halbe Stunde **bis** neun“. Das ist der häufigste Fehler von Französischsprachigen.", "**halb neun = 8 h 30**, pas 9 h 30 ! « halb » = « la demi-heure **avant** neuf heures ». C'est l'erreur la plus fréquente chez les francophones."),
    ex([["Wie spät ist es? – Es ist Viertel nach drei.", "Quelle heure est-il ? – Il est trois heures et quart."], ["Wann beginnt der Film? – Um halb acht.", "Quand commence le film ? – À sept heures et demie."], ["Der Zug fährt um 17:42 ab.", "Le train part à 17 h 42."], ["Von neun bis fünf Uhr.", "De neuf heures à cinq heures."]]),
    h("Wochentage, Monate, Jahreszeiten", "Jours, mois, saisons"),
    tb(["Wochentage (der)", "Monate (der)", "Jahreszeiten (der)"], [["Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag / Sonnabend, Sonntag", "Januar, Februar, März, April, Mai, Juni, Juli, August, September, Oktober, November, Dezember", "Frühling, Sommer, Herbst, Winter"]]),
    p("Alle drei Gruppen sind **maskulin** (der Montag, der Mai, der Sommer). Man sagt **am** Montag, **im** Mai, **im** Sommer, **um** 8 Uhr, **am** Wochenende, **am** Morgen / Abend, aber **in der** Nacht.", "Ces trois groupes sont **masculins** (der Montag, der Mai, der Sommer). On dit **am** Montag, **im** Mai, **im** Sommer, **um** 8 Uhr, **am** Wochenende, **am** Morgen / Abend, mais **in der** Nacht."),
    h("Das Datum", "La date"),
    p("Man benutzt **Ordnungszahlen**: der erste, der zweite, der dritte, der vierte … bis 19 mit **-te**: der siebte, der zwölfte; ab 20 mit **-ste**: der zwanzigste, der einunddreißigste. Ausnahmen: erste, dritte, siebte, achte (nur ein t).", "On utilise les **nombres ordinaux** : der erste, der zweite, der dritte, der vierte … jusqu'à 19 avec **-te** ; à partir de 20 avec **-ste**. Exceptions : erste, dritte, siebte, achte."),
    ex([["Heute ist der 25. Oktober 2026. (der fünfundzwanzigste Oktober)", "Aujourd'hui nous sommes le 25 octobre 2026."], ["Wann hast du Geburtstag? – Am 3. März. (am dritten März)", "Quand est ton anniversaire ? – Le 3 mars."], ["Ich bin am 12.04.1990 geboren.", "Je suis né le 12.04.1990."], ["Im Sommer fahren wir ans Meer.", "En été nous allons à la mer."]])
  ],
  x: [
    xg("Zahlen", "Nombres", [
      mc(["Was ist 34?", "Que vaut 34 ?"], ["vierunddreißig", "dreiundvierzig", "dreißigvier", "viertausend"], 0),
      mc(["Wie schreibt man 70?", "Comment écrit-on 70 ?"], ["sechzig", "siebzig", "siebenzig", "siebenzehn"], 1),
      gap("26 = ___undzwanzig", ["sechs"]), gap("15 = fünf___", ["zehn"]), gap("99 = ___undneunzig", ["neun"]), gap("21 = ___undzwanzig", ["ein"], ["Eins wird zu „ein“ in zusammengesetzten Zahlen.", "« eins » devient « ein » dans les nombres composés."]),
      mat([["13", "dreizehn"], ["40", "vierzig"], ["60", "sechzig"], ["200", "zweihundert"], ["1000", "tausend"], ["17", "siebzehn"]])
    ]),
    xg("Uhrzeit", "Heure", [
      mc(["Wie spät ist es? 7:30 Uhr", "Quelle heure ? 7 h 30"], ["halb sieben", "halb acht", "sieben halb", "Viertel acht"], 0, ["halb acht wäre 7:30 – nein! halb sieben = 6:30.", "Attention : 7:30 = halb acht."]),
      mc(["„halb neun“ ist …", "« halb neun » c'est …"], ["8:30", "9:30", "9:00", "8:45"], 0),
      mc(["„Viertel vor drei“ ist …", "« Viertel vor drei » c'est …"], ["2:45", "3:15", "2:15", "3:45"], 0),
      mc(["„Viertel nach vier“ ist …", "« Viertel nach vier » c'est …"], ["3:45", "4:15", "4:45", "5:15"], 1)
    ]),
    xg("Datum", "Date", [
      gap("Ich habe ___ Mai Geburtstag. (am / im)", ["im"]), gap("Wir treffen uns ___ Montag. (am / im)", ["am"]), gap("Der Kurs beginnt ___ 9 Uhr. (um / am)", ["um"]), gap("Der ___ (3.) Januar", ["dritte"])
    ])
  ] });

D.add({ id: "a1-artikel", lv: "A1", t: ["Nomen, Artikel und Plural", "Noms, articles et pluriel"], s: ["der, die, das – ein, eine, kein – und wie man den Plural bildet.", "der, die, das – ein, eine, kein – et comment former le pluriel."], k: "artikel genus der die das nomen plural substantiv ein eine kein article genre pluriel nom neutre",
  b: [
    p("Jedes deutsche Nomen hat ein **Genus** (grammatisches Geschlecht): **maskulin** (der), **feminin** (die) oder **neutral** (das). Es gibt nur zwei Genera im Französischen – im Deutschen kommt das Neutrum dazu. Das Genus ist oft nicht logisch (das Mädchen, die Sonne, der Mond) – lerne deshalb **jedes Nomen mit Artikel**.", "Chaque nom allemand a un **genre** : **masculin** (der), **féminin** (die) ou **neutre** (das). Le français n'a que deux genres – l'allemand ajoute le neutre. Le genre est souvent illogique (das Mädchen, die Sonne, der Mond) – apprends donc **chaque nom avec son article**."),
    tb(["", "maskulin", "feminin", "neutral", "Plural"], [["bestimmt (le/la/les)", "**der** Tisch", "**die** Lampe", "**das** Buch", "**die** Tische"], ["unbestimmt (un/une)", "**ein** Tisch", "**eine** Lampe", "**ein** Buch", "– (Tische)"], ["Verneinung", "**kein** Tisch", "**keine** Lampe", "**kein** Buch", "**keine** Tische"]]),
    p("Im **Plural** gibt es nur **die** (alle Genera). Der unbestimmte Artikel hat im Plural keine Form – man sagt einfach „Tische“ (nicht „ein“).", "Au **pluriel** il n'y a que **die** (pour tous les genres). L'article indéfini n'a pas de pluriel – on dit simplement « Tische »."),
    h("Genus-Regeln (Tendenzen)", "Règles de genre (tendances)"),
    tb(["der", "die", "das"], [["Wochentage, Monate, Jahreszeiten, Himmelsrichtungen (der Montag, der Mai, der Norden)", "Wörter auf **-ung, -heit, -keit, -schaft, -ion, -tät, -ei, -ik** (die Zeitung, die Freiheit, die Nation)", "Verkleinerungen auf **-chen, -lein** (das Mädchen, das Brötchen)"], ["Wörter auf **-er** bei Personen/Geräten, **-ling, -ismus, -ist** (der Lehrer, der Frühling)", "die meisten Wörter auf **-e** (die Lampe, die Blume)", "Wörter auf **-um, -ment, -tum** (das Zentrum, das Dokument)"], ["Autos, Berge, Regen: der Mercedes, der Berg, der Regen", "Zahlen als Nomen, Schiffe, Blumen: die Rose, die Eins", "Infinitive als Nomen (das Essen, das Lesen), Farben (das Rot), Metalle (das Gold)"]]),
    warn("Ausnahmen gibt es viele (der Käse, die Mutter, das Auto). Verlasse dich nur auf die Regeln als **Hilfe**, nicht als Garantie.", "Il y a beaucoup d'exceptions (der Käse, die Mutter, das Auto). Les règles sont une **aide**, pas une garantie."),
    h("Der Plural", "Le pluriel"),
    tb(["Typ", "Beispiel (Singular → Plural)", "Tendenz"], [["-e (+ Umlaut)", "der Tag → die Tage · die Stadt → die Städte", "viele maskuline, einige neutrale"], ["-er (+ Umlaut)", "das Kind → die Kinder · das Haus → die Häuser", "viele neutrale"], ["-(e)n", "die Lampe → die Lampen · die Frau → die Frauen", "fast alle femininen"], ["-s", "das Auto → die Autos · das Hotel → die Hotels", "Fremdwörter"], ["– (Umlaut)", "der Lehrer → die Lehrer · der Bruder → die Brüder", "Wörter auf -er, -el, -en"]]),
    voc("Wichtige Nomen mit Artikel und Plural", [["der Tisch, die Tische", "table"], ["der Stuhl, die Stühle", "chaise"], ["die Tür, die Türen", "porte"], ["das Fenster, die Fenster", "fenêtre"], ["das Buch, die Bücher", "livre"], ["das Kind, die Kinder", "enfant"], ["der Mann, die Männer", "homme"], ["die Frau, die Frauen", "femme"], ["das Haus, die Häuser", "maison"], ["der Apfel, die Äpfel", "pomme"], ["die Stadt, die Städte", "ville"], ["das Auto, die Autos", "voiture"]]),
    tip("Lerne ein Nomen immer als „der Tisch, die Tische“ – dann hast du Genus **und** Plural gleich mit im Kopf. Im Wörterbuch steht das als „Tisch, der; -e“.", "Apprends toujours « der Tisch, die Tische » – tu mémorises genre **et** pluriel. Dans le dictionnaire : « Tisch, der ; -e »."),
    ex([["Der Mann hat einen Hund. – Die Frau hat eine Katze.", "L'homme a un chien. – La femme a un chat."], ["Das Kind hat keine Schuhe.", "L'enfant n'a pas de chaussures."], ["Ich brauche ein Buch und eine Lampe.", "J'ai besoin d'un livre et d'une lampe."]])
  ],
  x: [
    xg("Artikel", "Articles", [
      gap("___ Mädchen ist klein.", ["Das"]), gap("___ Zeitung ist neu.", ["Die"]), gap("___ Lehrer ist nett.", ["Der"]), gap("___ Montag ist ein Tag.", ["Der"]), gap("Das ist ___ Brötchen.", ["ein"]), gap("Das ist ___ Lampe. (ein/eine)", ["eine"]),
      mc(["Welcher Artikel passt zu -ung?", "Quel article va avec -ung ?"], ["der", "die", "das", "den"], 1),
      mc(["Welcher Artikel passt zu Verkleinerungen auf -chen?", "Quel article va avec les diminutifs en -chen ?"], ["der", "die", "das", "kein"], 2)
    ]),
    xg("Plural", "Pluriel", [
      gap("das Kind – die ___", ["Kinder"]), gap("der Tag – die ___", ["Tage"]), gap("die Frau – die ___", ["Frauen"]), gap("das Auto – die ___", ["Autos"]), gap("das Haus – die ___", ["Häuser"]), gap("der Bruder – die ___", ["Brüder"]),
      mat([["der Tisch", "die Tische"], ["die Stadt", "die Städte"], ["das Buch", "die Bücher"], ["der Lehrer", "die Lehrer"]])
    ])
  ] });

D.add({ id: "a1-praesens", lv: "A1", t: ["Verben im Präsens", "Les verbes au présent"], s: ["Regelmäßige und unregelmäßige Verben, haben, Vokalwechsel e→i, a→ä.", "Verbes réguliers et irréguliers, haben, changement de voyelle e→i, a→ä."], k: "präsens verb konjugation haben vokalwechsel regelmäßig unregelmäßig présent conjugaison verbe",
  b: [
    p("Das Präsens benutzt man für Gegenwart, Gewohnheiten und oft auch für die **Zukunft** („Morgen fahre ich nach Paris“). Es gibt **keine** Verlaufsform: „Ich lerne“ heißt „j'apprends“ **und** „je suis en train d'apprendre“.", "Le présent s'emploie pour le présent, les habitudes et souvent pour le **futur** (« Morgen fahre ich nach Paris »). Il n'y a **pas** de forme progressive : « Ich lerne » = « j'apprends » **et** « je suis en train d'apprendre »."),
    h("Regelmäßige Verben", "Verbes réguliers"),
    p("Infinitiv auf **-en**: lern**en**. Du nimmst den Stamm (lern-) und hängst die Endungen an. Endet der Stamm auf **-d, -t** oder Konsonant + m/n (arbeit-, find-, öffn-), steht ein **-e-** davor: du arbeit**e**st, er arbeit**e**t.", "Infinitif en **-en** : lern**en**. Tu prends le radical (lern-) et ajoutes les terminaisons. Si le radical finit par **-d, -t** ou consonne + m/n (arbeit-, find-, öffn-), on ajoute un **-e-** : du arbeit**e**st, er arbeit**e**t."),
    tb(["", "lernen", "arbeiten", "heißen / tanzen (Stamm auf s, ß, z)"], [["ich", "lern**e**", "arbeit**e**", "heiß**e**"], ["du", "lern**st**", "arbeit**e**st", "heiß**t**"], ["er/sie/es", "lern**t**", "arbeit**e**t", "heiß**t**"], ["wir", "lern**en**", "arbeit**en**", "heiß**en**"], ["ihr", "lern**t**", "arbeit**e**t", "heiß**t**"], ["sie/Sie", "lern**en**", "arbeit**en**", "heiß**en**"]]),
    h("sein und haben", "sein et haben"),
    tb(["", "sein", "haben"], [["ich", "bin", "habe"], ["du", "bist", "hast"], ["er/sie/es", "ist", "hat"], ["wir", "sind", "haben"], ["ihr", "seid", "habt"], ["sie/Sie", "sind", "haben"]]),
    h("Vokalwechsel bei du und er/sie/es", "Changement de voyelle (du, er/sie/es)"),
    p("Bei einigen häufigen Verben ändert sich der Vokal **nur** in der 2. und 3. Person Singular. Ich, wir, ihr, sie bleiben normal.", "Chez certains verbes fréquents, la voyelle change **seulement** à la 2ᵉ et 3ᵉ personne du singulier. ich, wir, ihr, sie restent normaux."),
    tb(["Wechsel", "Infinitiv", "ich", "du", "er/sie/es"], [["**e → i**", "sprechen", "spreche", "sprichst", "spricht"], ["**e → i**", "essen", "esse", "isst", "isst"], ["**e → i**", "geben", "gebe", "gibst", "gibt"], ["**e → ie**", "sehen", "sehe", "siehst", "sieht"], ["**e → ie**", "lesen", "lese", "liest", "liest"], ["**a → ä**", "fahren", "fahre", "fährst", "fährt"], ["**a → ä**", "schlafen", "schlafe", "schläfst", "schläft"], ["**a → ä**", "tragen", "trage", "trägst", "trägt"], ["**au → äu**", "laufen", "laufe", "läufst", "läuft"], ["**o → ö**", "stoßen", "stoße", "stößt", "stößt"], ["unregelmäßig", "wissen", "weiß", "weißt", "weiß"], ["unregelmäßig", "nehmen", "nehme", "nimmst", "nimmt"], ["unregelmäßig", "werden", "werde", "wirst", "wird"]]),
    ex([["Ich spreche Deutsch, und du sprichst Französisch.", "Je parle allemand, et toi tu parles français."], ["Er isst gern Pizza und liest viel.", "Il aime manger de la pizza et lit beaucoup."], ["Sie fährt jeden Tag mit dem Bus.", "Elle prend le bus tous les jours."], ["Wir haben heute Zeit. Habt ihr auch Zeit?", "Nous avons du temps aujourd'hui. Vous aussi ?"]]),
    voc("Wichtige Verben (A1)", [["machen", "faire"], ["gehen", "aller (à pied)"], ["kommen", "venir"], ["lernen", "apprendre"], ["arbeiten", "travailler"], ["trinken", "boire"], ["essen", "manger"], ["lesen", "lire"], ["schreiben", "écrire"], ["sprechen", "parler"], ["sehen", "voir"], ["hören", "écouter / entendre"], ["kaufen", "acheter"], ["fahren", "aller (en véhicule), conduire"], ["schlafen", "dormir"], ["spielen", "jouer"], ["kochen", "cuisiner"], ["wohnen", "habiter"]])
  ],
  x: [
    xg("Konjugieren", "Conjuguer", [
      gap("Ich ___ (lernen) Deutsch.", ["lerne"]), gap("Du ___ (arbeiten) viel.", ["arbeitest"]), gap("Er ___ (sprechen) Französisch.", ["spricht"]), gap("Sie ___ (fahren) mit dem Zug. (Sg.)", ["fährt"]), gap("Wir ___ (essen) Brot.", ["essen"]), gap("Du ___ (lesen) ein Buch.", ["liest"]), gap("Ich ___ (haben) einen Hund.", ["habe"]), gap("Er ___ (schlafen) lange.", ["schläft"]), gap("Du ___ (sehen) den Film.", ["siehst"]), gap("Ihr ___ (haben) Hunger.", ["habt"]), gap("Du ___ (nehmen) den Bus.", ["nimmst"])
    ]),
    xg("Richtig oder falsch?", "Vrai ou faux ?", [
      mc(["Was ist richtig?", "Qu'est-ce qui est correct ?"], ["Du fahrst.", "Du fährst.", "Du fahrt.", "Du fahren."], 1),
      mc(["Was ist richtig?", "Qu'est-ce qui est correct ?"], ["Er esst.", "Er isst.", "Er esse.", "Er ist."], 1, ["essen → er isst.", "essen → er isst."]),
      mc(["Was ist richtig?", "Qu'est-ce qui est correct ?"], ["Er arbeitet.", "Er arbeitt.", "Er arbeit.", "Er arbeiten."], 0)
    ])
  ] });

D.add({ id: "a1-satz", lv: "A1", t: ["Der Satz: Wortstellung, Fragen, Verneinung", "La phrase : ordre des mots, questions, négation"], s: ["Verb auf Position 2, W-Fragen, Ja/Nein-Fragen, nicht und kein.", "Verbe en position 2, questions, oui/non, nicht et kein."], k: "satzbau wortstellung position verb frage verneinung nicht kein w-frage ordre des mots négation question",
  b: [
    p("Die wichtigste Regel im deutschen Hauptsatz: Das **konjugierte Verb steht an Position 2**. Was auf Position 1 steht, kann wechseln.", "La règle la plus importante de la proposition principale : le **verbe conjugué est en position 2**. Ce qui occupe la position 1 peut varier."),
    tb(["Position 1", "Position 2 (Verb)", "Mittelfeld", "Ende"], [["Ich", "gehe", "heute", "ins Kino."], ["Heute", "gehe", "ich", "ins Kino."], ["Ins Kino", "gehe", "ich", "heute."], ["Morgen", "lerne", "ich", "Deutsch."]]),
    warn("Wenn ein anderes Satzglied (z. B. „heute“) am Satzanfang steht, wird das **Subjekt hinter das Verb** gestellt: „Heute **gehe ich** …“ – **nicht** „Heute ich gehe“ (Inversion – im Deutschen ist sie obligatorisch!).", "Si un autre élément (p. ex. « heute ») ouvre la phrase, le **sujet passe après le verbe** : « Heute **gehe ich** … » – **pas** « Heute ich gehe » (inversion obligatoire en allemand !)."),
    h("Fragen", "Les questions"),
    p("**W-Fragen** beginnen mit einem Fragewort, danach das Verb (Position 2). **Ja/Nein-Fragen** beginnen mit dem Verb (Position 1).", "Les **questions ouvertes** commencent par un mot interrogatif, puis le verbe (position 2). Les **questions fermées** commencent par le verbe (position 1)."),
    tb(["Fragewort", "Bedeutung", "Beispiel"], [["wer", "qui", "Wer ist das?"], ["was", "quoi / que", "Was machst du?"], ["wo", "où (lieu)", "Wo wohnst du?"], ["woher", "d'où", "Woher kommst du?"], ["wohin", "où (direction)", "Wohin gehst du?"], ["wann", "quand", "Wann kommst du?"], ["wie", "comment", "Wie geht's?"], ["warum", "pourquoi", "Warum lernst du Deutsch?"], ["wie viel(e)", "combien", "Wie viele Kinder hast du?"], ["welch-", "quel", "Welches Buch liest du?"]]),
    ex([["Wann kommst du? – Um sechs.", "Quand viens-tu ? – À six heures."], ["Kommst du heute? – Ja, ich komme. / Nein, ich komme nicht.", "Viens-tu aujourd'hui ? – Oui. / Non."], ["Hast du Zeit? – Doch! (nach negativer Frage)", "As-tu du temps ? – Si !"]]),
    tip("Auf eine **negative** Frage („Hast du **kein** Auto?“) antwortet man mit **Doch** (= si), wenn die Antwort positiv ist: „Doch, ich habe eins.“", "À une question **négative** (« Hast du **kein** Auto ? ») on répond **Doch** (= si) pour contredire : « Doch, ich habe eins. »"),
    h("Verneinung: nicht und kein", "La négation : nicht et kein"),
    ul([["**kein** verneint ein **Nomen** mit unbestimmtem Artikel oder ohne Artikel: „Ich habe **kein** Auto. / **keine** Zeit.“", "**kein** nie un **nom** avec article indéfini ou sans article : « Ich habe **kein** Auto. / **keine** Zeit. »"], ["**nicht** verneint alles andere (Verb, Adjektiv, bestimmter Artikel, Possessiv): „Ich komme **nicht**. Das ist **nicht** schön. Ich kenne **nicht** den Mann.“", "**nicht** nie tout le reste (verbe, adjectif, article défini, possessif) : « Ich komme **nicht**. Das ist **nicht** schön. »"]]),
    p("Stellung von **nicht**: Es steht meist **vor** dem Teil, den man verneint; bei Verneinung des ganzen Satzes am **Ende** (vor trennbarem Präfix/Infinitiv/Partizip): „Ich arbeite **nicht**.“ – „Ich kann **nicht** kommen.“ – „Ich gehe heute **nicht** ins Kino.“", "Place de **nicht** : en général **avant** l'élément nié ; pour nier toute la phrase, à la **fin** (avant préfixe séparé/infinitif/participe) : « Ich arbeite **nicht**. » – « Ich kann **nicht** kommen. »"),
    tb(["Tabelle", "maskulin", "feminin", "neutral", "Plural"], [["kein (Nominativ)", "kein Tisch", "keine Lampe", "kein Buch", "keine Bücher"]]),
    h("Sätze verbinden: und, aber, oder, denn", "Relier les phrases : und, aber, oder, denn"),
    p("Diese Konjunktionen stehen auf **Position 0** – danach folgt normale Satzstellung: „Ich lerne Deutsch, **denn** ich **wohne** in Berlin.“", "Ces conjonctions sont en **position 0** – ordre normal ensuite : « Ich lerne Deutsch, **denn** ich **wohne** in Berlin. »"),
    ex([["Ich bin müde, aber ich arbeite weiter.", "Je suis fatigué, mais je continue à travailler."], ["Möchtest du Tee oder Kaffee?", "Veux-tu du thé ou du café ?"], ["Er kommt nicht, denn er ist krank.", "Il ne vient pas, car il est malade."]])
  ],
  x: [
    xg("Satzstellung", "Ordre des mots", [
      ord(["Heute", "gehe", "ich", "ins", "Kino."], "Heute gehe ich ins Kino."), ord(["Ich", "gehe", "heute", "ins", "Kino."], "Ich gehe heute ins Kino."), ord(["Wann", "kommst", "du", "nach", "Hause?"], "Wann kommst du nach Hause?"), ord(["Hast", "du", "heute", "Zeit?"], "Hast du heute Zeit?"), ord(["Ich", "lerne", "Deutsch,", "denn", "ich", "wohne", "in", "Berlin."], "Ich lerne Deutsch, denn ich wohne in Berlin.")
    ]),
    xg("nicht oder kein?", "nicht ou kein ?", [
      gap("Ich habe ___ Auto.", ["kein"]), gap("Ich habe ___ Zeit.", ["keine"]), gap("Er arbeitet heute ___.", ["nicht"]), gap("Das ist ___ mein Buch.", ["nicht"]), gap("Wir haben ___ Kinder.", ["keine"]), gap("Sie kommt ___.", ["nicht"]),
      mc(["„Hast du kein Auto?“ – Antwort „Ja, ich habe eins“:", "« Hast du kein Auto ? » – Réponse « J'en ai un » :"], ["Ja!", "Doch!", "Nein!", "Nicht!"], 1)
    ]),
    xg("Fragewort", "Mot interrogatif", [
      gap("___ wohnst du? – In Wien.", ["Wo"]), gap("___ kommst du? – Aus Spanien.", ["Woher"]), gap("___ ist das? – Das ist mein Bruder.", ["Wer"]), gap("___ gehst du? – Nach Hause.", ["Wohin"]), gap("___ lernst du Deutsch? – Weil ich in Berlin arbeite.", ["Warum"])
    ])
  ] });

D.add({ id: "a1-akkusativ", lv: "A1", t: ["Der Akkusativ", "L'accusatif"], s: ["Das direkte Objekt: den, einen, keinen – und wichtige Verben.", "Le complément d'objet direct : den, einen, keinen – et les verbes importants."], k: "akkusativ objekt kasus cas accusatif complément direct haben brauchen möchten",
  b: [
    p("Im Deutschen ändert sich der Artikel je nach **Kasus** (Fall). Im Französischen gibt es das nicht. Der **Nominativ** ist das Subjekt („Wer / Was?“), der **Akkusativ** ist das **direkte Objekt** („Wen / Was?“).", "En allemand l'article change selon le **cas**. Le français n'a pas cela. Le **nominatif** est le sujet (« qui / quoi ? »), l'**accusatif** est le **complément d'objet direct** (« qui / quoi ? »)."),
    ex([["**Der** Mann kauft **den** Tisch.", "L'homme achète la table.", "Subjekt = Nominativ · Objekt = Akkusativ"], ["Ich sehe **einen** Hund.", "Je vois un chien."], ["Sie hat **eine** Katze und **kein** Auto.", "Elle a un chat et pas de voiture."]]),
    p("**Nur das Maskulinum ändert sich!** Feminin, Neutrum und Plural bleiben wie im Nominativ.", "**Seul le masculin change !** Féminin, neutre et pluriel restent comme au nominatif."),
    tb(["", "maskulin", "feminin", "neutral", "Plural"], [["Nominativ (bestimmt)", "der Tisch", "die Lampe", "das Buch", "die Bücher"], ["**Akkusativ (bestimmt)**", "{{den}} Tisch", "die Lampe", "das Buch", "die Bücher"], ["Nominativ (unbestimmt)", "ein Tisch", "eine Lampe", "ein Buch", "– Bücher"], ["**Akkusativ (unbestimmt)**", "{{einen}} Tisch", "eine Lampe", "ein Buch", "– Bücher"], ["**Akkusativ (Verneinung)**", "{{keinen}} Tisch", "keine Lampe", "kein Buch", "keine Bücher"]]),
    h("Personalpronomen im Akkusativ", "Pronoms personnels à l'accusatif"),
    tb(["Nominativ", "ich", "du", "er", "sie", "es", "wir", "ihr", "sie / Sie"], [["Akkusativ", "**mich**", "**dich**", "**ihn**", "sie", "es", "**uns**", "**euch**", "sie / Sie"]]),
    ex([["Ich liebe dich. – Ich sehe ihn jeden Tag.", "Je t'aime. – Je le vois tous les jours."], ["Kennst du den Film? – Ja, ich kenne ihn.", "Connais-tu le film ? – Oui, je le connais."], ["Sie ruft uns an.", "Elle nous appelle."]]),
    h("Typische Verben mit Akkusativ", "Verbes typiques avec l'accusatif"),
    voc("Verben mit Akkusativ", [["haben", "avoir", "Ich habe einen Bruder."], ["brauchen", "avoir besoin de", "Ich brauche einen Stift."], ["kaufen", "acheter", "Wir kaufen das Brot."], ["essen / trinken", "manger / boire"], ["sehen / hören", "voir / entendre"], ["kennen", "connaître", "Ich kenne den Mann."], ["suchen / finden", "chercher / trouver"], ["möchten / wollen", "vouloir"], ["lieben / mögen", "aimer"], ["lesen / schreiben", "lire / écrire"], ["nehmen", "prendre"], ["bestellen", "commander"]]),
    p("**Wichtig:** Nach **sein** und **werden** steht der **Nominativ**: „Das **ist der** Tisch.“ – nicht „Das ist den Tisch.“", "**Important :** après **sein** et **werden** on met le **nominatif** : « Das **ist der** Tisch. » – pas « Das ist den Tisch. »"),
    h("Im Restaurant: möchten", "Au restaurant : möchten"),
    tb(["", "möchten"], [["ich", "möchte"], ["du", "möchtest"], ["er/sie/es", "möchte"], ["wir", "möchten"], ["ihr", "möchtet"], ["sie/Sie", "möchten"]]),
    dlg("Dialog im Café", [["Kellner", "Guten Tag! Was möchten Sie trinken?", "Bonjour ! Que désirez-vous boire ?"], ["Gast", "Ich möchte einen Kaffee und ein Wasser, bitte.", "Je voudrais un café et une eau, s'il vous plaît."], ["Kellner", "Möchten Sie auch ein Stück Kuchen?", "Voulez-vous aussi une part de gâteau ?"], ["Gast", "Ja, den Apfelkuchen. Und die Rechnung, bitte.", "Oui, la tarte aux pommes. Et l'addition, s'il vous plaît."]])
  ],
  x: [
    xg("Akkusativ ergänzen", "Compléter à l'accusatif", [
      gap("Ich kaufe ___ Tisch. (der)", ["den"]), gap("Er hat ___ Hund. (ein)", ["einen"]), gap("Wir sehen ___ Film. (der)", ["den"]), gap("Sie liest ___ Buch. (das)", ["das"]), gap("Ich habe ___ Auto. (kein)", ["kein"]), gap("Er hat ___ Bruder. (kein)", ["keinen"]), gap("Kennst du ___? (er)", ["ihn"]), gap("Ich liebe ___. (du)", ["dich"]), gap("Sie ruft ___ an. (wir)", ["uns"])
    ]),
    xg("Fragen", "Questions", [
      mc(["„Ich sehe ___ Mann.“", "« Ich sehe ___ Mann. »"], ["der", "den", "dem", "dein"], 1),
      mc(["„Das ist ___ Tisch.“ (sein → ?)", "« Das ist ___ Tisch. » (après sein)"], ["der", "den", "einen", "keinen"], 0, ["Nach „sein“ steht der Nominativ.", "Après « sein » : nominatif."]),
      mc(["Welches Genus ändert sich im Akkusativ?", "Quel genre change à l'accusatif ?"], ["feminin", "neutral", "maskulin", "Plural"], 2)
    ])
  ] });
})();
