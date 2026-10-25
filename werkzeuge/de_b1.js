// Deutschkurs B1 – Teil 1
(function(){
var D = DE, p = D.p, h = D.h, tip = D.tip, warn = D.warn, ul = D.ul, tb = D.tb, ex = D.ex, voc = D.voc, dlg = D.dlg, mc = D.mc, gap = D.gap, ord = D.ord, mat = D.mat, xg = D.xg;

D.add({ id: "b1-praeteritum", lv: "B1", t: ["Das Präteritum", "Le prétérit"], s: ["Regelmäßige und starke Verben – die Zeit der Erzählung.", "Verbes faibles et forts – le temps du récit."], k: "präteritum imperfekt erzählen starke verben schwache verben ging kam sah imparfait prétérit récit",
  b: [
    p("Das **Präteritum** (auch Imperfekt) benutzt man vor allem **schriftlich**: in Romanen, Zeitungen, Berichten, Märchen. Im Gespräch benutzt man das **Perfekt** – außer bei sein, haben und Modalverben (A2). In Norddeutschland spricht man auch mehr im Präteritum, im Süden fast nur im Perfekt.", "Le **prétérit** s'emploie surtout **à l'écrit** : romans, journaux, rapports, contes. À l'oral on utilise le **parfait** – sauf pour sein, haben et les modaux. Dans le nord de l'Allemagne on utilise un peu plus le prétérit à l'oral, dans le sud presque jamais."),
    h("Regelmäßige (schwache) Verben", "Verbes faibles"),
    p("Stamm + **-te** + Personalendung: ich mach**te**, du mach**test**, er mach**te**, wir mach**ten**, ihr mach**tet**, sie mach**ten**. Bei Stamm auf -t/-d: **-ete**: arbeit**ete**, red**ete**.", "Radical + **-te** + terminaison : ich mach**te**, du mach**test**, er mach**te**, wir mach**ten** … Radical en -t/-d : **-ete** : arbeit**ete**, red**ete**."),
    h("Unregelmäßige (starke) Verben", "Verbes forts"),
    p("Der Stamm ändert den **Vokal**, **keine -te-Endung**, und **ich** und **er/sie/es** haben **keine Endung**: ich ging, du gingst, er ging, wir gingen, ihr gingt, sie gingen.", "Le radical change de **voyelle**, **pas de -te**, et **ich** et **er/sie/es** n'ont **pas de terminaison** : ich ging, du gingst, er ging …"),
    tb(["Infinitiv", "Präteritum (er)", "Partizip II", "Bedeutung"], [["gehen", "ging", "gegangen", "aller"], ["kommen", "kam", "gekommen", "venir"], ["sehen", "sah", "gesehen", "voir"], ["geben", "gab", "gegeben", "donner"], ["nehmen", "nahm", "genommen", "prendre"], ["schreiben", "schrieb", "geschrieben", "écrire"], ["lesen", "las", "gelesen", "lire"], ["sprechen", "sprach", "gesprochen", "parler"], ["fahren", "fuhr", "gefahren", "aller (véhicule)"], ["essen", "aß", "gegessen", "manger"], ["trinken", "trank", "getrunken", "boire"], ["finden", "fand", "gefunden", "trouver"], ["bleiben", "blieb", "geblieben", "rester"], ["denken", "dachte", "gedacht", "penser (mixte)"], ["bringen", "brachte", "gebracht", "apporter (mixte)"], ["wissen", "wusste", "gewusst", "savoir (mixte)"], ["kennen", "kannte", "gekannt", "connaître (mixte)"], ["nennen", "nannte", "genannt", "nommer (mixte)"]]),
    tip("**Gemischte Verben** (denken, bringen, wissen, kennen, nennen, rennen, senden, wenden) haben einen **Vokalwechsel** UND die **Endung -te**: er dachte, er brachte, er wusste. Eine vollständige Liste findest du im Nachschlage-Bereich.", "Les **verbes mixtes** (denken, bringen, wissen, kennen, nennen, rennen, senden, wenden) changent de **voyelle** ET prennent **-te** : er dachte, er brachte, er wusste. Liste complète dans la section Référence."),
    ex([["Gestern ging ich ins Kino. Der Film begann um acht Uhr, und ich kam spät nach Hause.", "Hier je suis allé au cinéma. Le film a commencé à huit heures et je suis rentré tard."], ["Er stand auf, nahm seine Tasche und verließ das Haus.", "Il se leva, prit son sac et quitta la maison."], ["Es war einmal ein König, der hatte drei Töchter.", "Il était une fois un roi qui avait trois filles."]]),
    p("**Trennbare Verben**: Das Präfix geht ans **Satzende**: „Er **stand** um sieben Uhr **auf**.“ Im **Nebensatz** bleibt alles zusammen: „…, als er **aufstand**.“", "**Verbes séparables** : le préfixe va à la **fin** : « Er **stand** um sieben Uhr **auf**. » Dans la **subordonnée** tout reste ensemble : « …, als er **aufstand**. »"),
    warn("Nicht „ich gehte“ oder „ich sahte“! Starke Verben bilden das Präteritum **ohne -te**. Und: **Perfekt ≠ Präteritum in der Bedeutung**: Beide bedeuten „Vergangenheit“. Es gibt keinen Unterschied zwischen *passé simple* und *imparfait* wie im Französischen.", "Pas « ich gehte » ! Les verbes forts forment le prétérit **sans -te**. Et : en allemand **parfait ≈ prétérit** pour le sens. Il n'y a pas de distinction *passé simple / imparfait / passé composé* comme en français.")
  ],
  x: [
    xg("Präteritum bilden", "Former le prétérit", [
      gap("Ich ___ (machen) meine Hausaufgaben.", ["machte"]), gap("Er ___ (gehen) nach Hause.", ["ging"]), gap("Wir ___ (sehen) einen Film.", ["sahen"]), gap("Sie ___ (kommen) spät.", ["kam"]), gap("Du ___ (arbeiten) viel.", ["arbeitetest"]), gap("Ich ___ (wissen) die Antwort nicht.", ["wusste"]), gap("Er ___ (bringen) Blumen mit.", ["brachte"]), gap("Sie ___ (essen) Pizza.", ["aßen|assen"]), gap("Der Zug ___ (abfahren) um 8 Uhr ___.", ["fuhr", "ab"])
    ]),
    xg("Verständnis", "Compréhension", [
      mc(["Welche Form ist falsch?", "Quelle forme est fausse ?"], ["er ging", "er kam", "er gehte", "er sah"], 2),
      mc(["Wo benutzt man das Präteritum vor allem?", "Où utilise-t-on surtout le prétérit ?"], ["im Alltagsgespräch", "in Romanen und Zeitungen", "in SMS", "am Telefon"], 1),
      mat([["gehen", "ging"], ["sehen", "sah"], ["nehmen", "nahm"], ["sprechen", "sprach"], ["bleiben", "blieb"]])
    ])
  ] });

D.add({ id: "b1-zeiten", lv: "B1", t: ["Plusquamperfekt und Zeitenfolge", "Plus-que-parfait et concordance des temps"], s: ["hatte gemacht, war gegangen – und Nebensätze mit als, nachdem, bevor, seit, bis.", "hatte gemacht, war gegangen – et subordonnées avec als, nachdem, bevor, seit, bis."], k: "plusquamperfekt nachdem bevor als seit bis während zeitenfolge temporalsatz plus-que-parfait nachdem",
  b: [
    p("Das **Plusquamperfekt** drückt aus, dass etwas **vor** einem anderen Moment in der Vergangenheit passiert ist. Bildung: **hatte / war + Partizip II**.", "Le **plus-que-parfait** exprime qu'une action s'est passée **avant** un autre moment du passé. Formation : **hatte / war + participe II**."),
    tb(["", "mit haben", "mit sein"], [["ich", "hatte gemacht", "war gegangen"], ["du", "hattest gemacht", "warst gegangen"], ["er/sie/es", "hatte gemacht", "war gegangen"], ["wir", "hatten gemacht", "waren gegangen"], ["ihr", "hattet gemacht", "wart gegangen"], ["sie/Sie", "hatten gemacht", "waren gegangen"]]),
    ex([["Als ich ankam, war der Zug schon abgefahren.", "Quand je suis arrivé, le train était déjà parti."], ["Nachdem er gegessen hatte, ging er spazieren.", "Après avoir mangé, il est allé se promener."], ["Ich wusste nicht, dass sie umgezogen war.", "Je ne savais pas qu'elle avait déménagé."]]),
    h("nachdem – bevor – während – als – seit – bis", "nachdem – bevor – während – als – seit – bis"),
    tb(["Konjunktion", "Bedeutung", "Zeitenfolge", "Beispiel"], [["**nachdem**", "après que", "Nebensatz: Plusquamperfekt (Perfekt), Hauptsatz: Präteritum (Perfekt)", "Nachdem ich gegessen **hatte**, **ging** ich ins Bett."], ["**bevor / ehe**", "avant que", "gleiche Zeit", "Bevor ich **gehe**, **rufe** ich an."], ["**während**", "pendant que", "gleichzeitig", "Während ich **koche**, **hörst** du Musik."], ["**als**", "quand (einmalig, Vergangenheit)", "Präteritum", "Als ich Kind **war**, **wohnte** ich in Köln."], ["**wenn**", "si, quand (Wiederholung/Zukunft)", "Präsens / Präteritum", "Wenn es regnet, bleibe ich zu Hause."], ["**seit / seitdem**", "depuis que", "Präsens / Perfekt", "Seit ich hier **wohne**, **habe** ich viele Freunde."], ["**bis**", "jusqu'à ce que", "gleiche Zeit", "Ich warte, bis du **kommst**."], ["**sobald**", "dès que", "gleiche Zeit", "Sobald ich Zeit habe, rufe ich an."]]),
    warn("Anders als im Französischen steht nach **nachdem** **kein** Infinitiv („après avoir mangé“) – man braucht einen vollständigen Nebensatz mit Subjekt. Oder man benutzt die Präposition: „**Nach dem Essen** ging er spazieren.“", "À la différence du français, après **nachdem** on n'utilise **pas** l'infinitif (« après avoir mangé ») – il faut une subordonnée complète avec sujet. Ou la préposition : « **Nach dem Essen** ging er spazieren. »"),
    tip("**Zeitenfolge in der Praxis**: Erzähle in einer Zeit (Perfekt **oder** Präteritum). Das Plusquamperfekt benutzt du nur für **Vorzeitigkeit** – etwas, das schon vorbei war. Vorher: Plusquamperfekt → danach: Präteritum/Perfekt.", "**Concordance en pratique** : raconte dans un seul temps (parfait **ou** prétérit). Le plus-que-parfait sert à marquer l'**antériorité**. Avant : plus-que-parfait → après : prétérit/parfait.")
  ],
  x: [
    xg("Plusquamperfekt", "Plus-que-parfait", [
      gap("Als ich ankam, ___ der Zug schon abgefahren. (sein)", ["war"]), gap("Nachdem er gegessen ___, ging er schlafen. (haben)", ["hatte"]), gap("Ich wusste, dass sie schon ___ (gehen: Partizip).", ["gegangen"]), gap("Wir ___ schon gegessen, als er kam. (haben)", ["hatten"])
    ]),
    xg("Konjunktion", "Conjonction", [
      gap("___ ich ein Kind war, spielte ich viel. (als/wenn)", ["Als"]), gap("___ es regnet, bleiben wir zu Hause. (Wenn/Als)", ["Wenn"]), gap("Ich warte, ___ du kommst. (bis/seit)", ["bis"]), gap("___ ich in Berlin wohne, habe ich mehr Freunde. (Seit/Bis)", ["Seit"]),
      ord(["Nachdem", "er", "gegessen", "hatte,", "ging", "er", "spazieren."], "Nachdem er gegessen hatte, ging er spazieren.")
    ])
  ] });

D.add({ id: "b1-relativ", lv: "B1", t: ["Relativsätze", "Les propositions relatives"], s: ["der, die, das, den, dem, deren … – Relativpronomen und Satzbau.", "der, die, das, den, dem, deren … – pronoms relatifs et construction."], k: "relativsatz relativpronomen der die das dem den deren dessen wo was proposition relative pronom relatif qui que dont",
  b: [
    p("Ein Relativsatz gibt **zusätzliche Information** zu einem Nomen. Er beginnt mit einem **Relativpronomen** (= qui, que, dont, où) und das **Verb steht am Ende**. Der Relativsatz wird **durch Kommas** abgetrennt.", "Une relative donne une **information supplémentaire** sur un nom. Elle commence par un **pronom relatif** (qui, que, dont, où) et le **verbe est à la fin**. Elle est **encadrée de virgules**."),
    p("**Genus und Numerus** des Relativpronomens richten sich nach dem **Bezugswort**, der **Kasus** nach seiner **Funktion im Relativsatz**.", "Le **genre et le nombre** du pronom suivent le **mot auquel il renvoie**, le **cas** dépend de sa **fonction dans la relative**."),
    tb(["", "maskulin", "feminin", "neutral", "Plural"], [["Nominativ", "{{der}}", "{{die}}", "{{das}}", "{{die}}"], ["Akkusativ", "{{den}}", "{{die}}", "{{das}}", "{{die}}"], ["Dativ", "{{dem}}", "{{der}}", "{{dem}}", "{{denen}}"], ["Genitiv", "{{dessen}}", "{{deren}}", "{{dessen}}", "{{deren}}"]]),
    p("Fast alle Formen sind gleich wie der bestimmte Artikel – **Ausnahmen**: Dativ Plural **denen**, Genitiv **dessen / deren**.", "Presque toutes les formes sont identiques à l'article défini – **exceptions** : datif pluriel **denen**, génitif **dessen / deren**."),
    ex([["Der Mann, **der** dort steht, ist mein Lehrer.", "L'homme qui est là-bas est mon professeur."], ["Das Buch, **das** ich lese, ist spannend.", "Le livre que je lis est passionnant."], ["Die Frau, **der** ich geholfen habe, hat sich bedankt.", "La femme que j'ai aidée m'a remercié.", "helfen + Dativ → der"], ["Das ist der Freund, **dessen** Auto kaputt ist.", "C'est l'ami dont la voiture est en panne."], ["Die Kollegen, **mit denen** ich arbeite, sind nett.", "Les collègues avec qui je travaille sont gentils."]]),
    h("Mit Präposition", "Avec une préposition"),
    p("Die Präposition steht **vor** dem Relativpronomen und bestimmt den Kasus: „Die Stadt, **in der** ich wohne“ – „Der Mann, **mit dem** ich spreche“ – „Das Thema, **über das** wir sprechen“.", "La préposition est **avant** le pronom et détermine le cas : « Die Stadt, **in der** ich wohne » – « Der Mann, **mit dem** ich spreche »."),
    h("wo, was, wer", "wo, was, wer"),
    ul([["**wo** bei Orten/Zeit: „Das Haus, **wo** ich wohne“ (auch: in dem) / „Die Stadt, **wo** er geboren wurde.“", "**wo** pour les lieux/le temps."], ["**was** nach **alles, nichts, etwas, vieles, das** und nach einem ganzen Satz: „Alles, **was** du sagst, ist richtig.“ – „Er hat gewonnen, **was** mich freut.“", "**was** après **alles, nichts, etwas, das** et après toute une phrase."], ["**wer** = celui qui: „**Wer** zu spät kommt, muss draußen warten.“", "**wer** = celui qui."]]),
    warn("Falsche Freunde in der Grammatik: Im Französischen sagt man „**dont**“ – im Deutschen musst du je nach Funktion wählen: **dessen/deren** (Besitz: der Mann, **dessen** Frau), **von dem** (der Film, **von dem** ich erzählte), **über den** (das Thema, **über das** …). Es gibt kein einzelnes Wort für „dont“.", "Faux amis grammaticaux : « **dont** » n'a pas d'équivalent unique : **dessen/deren** (possession), **von dem** (le film **dont** je parlais), **über das** (le sujet **dont** nous parlons) …")
  ],
  x: [
    xg("Relativpronomen", "Pronom relatif", [
      gap("Der Mann, ___ dort steht, ist mein Chef. (Nom.)", ["der"]), gap("Die Frau, ___ ich liebe, heißt Anna. (Akk.)", ["die"]), gap("Das Kind, ___ ich helfe, ist klein. (Dat.)", ["dem"]), gap("Die Kinder, mit ___ ich spiele, sind nett. (Dat. Pl.)", ["denen"]), gap("Das ist der Mann, ___ Auto kaputt ist. (Gen.)", ["dessen"]), gap("Die Stadt, in ___ ich wohne, ist groß. (Dat.)", ["der"]), gap("Alles, ___ du sagst, ist richtig.", ["was"])
    ]),
    xg("Satz bilden", "Former des phrases", [
      ord(["Das", "ist", "der", "Mann,", "der", "hier", "wohnt."], "Das ist der Mann, der hier wohnt."), ord(["Die", "Frau,", "die", "ich", "kenne,", "ist", "nett."], "Die Frau, die ich kenne, ist nett.")
    ])
  ] });

D.add({ id: "b1-passiv", lv: "B1", t: ["Das Passiv", "La voix passive"], s: ["Das Haus wird gebaut – Passiv in allen Zeiten, mit Modalverben und von/durch.", "Das Haus wird gebaut – passif à tous les temps, avec modaux et von/durch."], k: "passiv werden partizip von durch vorgangspassiv zustandspassiv man passif voix passive agent",
  b: [
    p("Im **Aktiv** steht die Person/Sache, die handelt, im Vordergrund („Der Bäcker **backt** das Brot.“). Im **Passiv** steht das, was **passiert**, im Vordergrund („Das Brot **wird** (vom Bäcker) **gebacken**.“). Bildung: **werden + Partizip II**.", "À l'**actif** c'est celui qui agit qui est au premier plan. Au **passif** c'est ce qui **se passe** (« Das Brot **wird** (vom Bäcker) **gebacken**. »). Formation : **werden + participe II**."),
    tb(["Zeit", "Form", "Beispiel"], [["Präsens", "wird / werden + Partizip II", "Das Haus **wird gebaut**."], ["Präteritum", "wurde / wurden + Partizip II", "Das Haus **wurde gebaut**."], ["Perfekt", "ist / sind + Partizip II + **worden**", "Das Haus **ist gebaut worden**."], ["Plusquamperfekt", "war + Partizip II + worden", "Das Haus **war gebaut worden**."], ["Futur", "wird + Partizip II + werden", "Das Haus **wird gebaut werden**."], ["mit Modalverb", "Modal + Partizip II + werden", "Das Haus **muss gebaut werden**."]]),
    warn("Im **Perfekt Passiv** heißt das Partizip von werden **worden** (nicht „geworden“!): „Es **ist gebaut worden**.“ „geworden“ benutzt man nur für „devenir“: „Er ist Arzt **geworden**.“", "Au **parfait passif** le participe de werden est **worden** (pas « geworden ») : « Es **ist gebaut worden**. » « geworden » = devenir : « Er ist Arzt **geworden**. »"),
    h("von und durch", "von et durch"),
    p("Der **Handelnde** (Agens) steht mit **von + Dativ**: „Das Buch wurde **von einem berühmten Autor** geschrieben.“ **Durch + Akkusativ** nennt das **Mittel/die Ursache**: „Das Haus wurde **durch einen Sturm** zerstört.“ Wenn der Handelnde unwichtig oder unbekannt ist, lässt man ihn weg.", "L'**agent** est introduit par **von + datif**. **durch + accusatif** indique le **moyen/la cause**. Si l'agent est sans importance ou inconnu, on l'omet."),
    ex([["In Deutschland wird viel Bier getrunken.", "En Allemagne on boit beaucoup de bière."], ["Das Auto wurde gestern repariert.", "La voiture a été réparée hier."], ["Die Rechnung muss bis Freitag bezahlt werden.", "La facture doit être payée d'ici vendredi."], ["Hier wird nicht geraucht.", "Ici on ne fume pas."], ["Mir wurde ein Job angeboten.", "On m'a proposé un emploi.", "Dativobjekt bleibt Dativ"]]),
    h("Aktiv → Passiv", "Actif → passif"),
    tb(["Aktiv", "Passiv"], [["Der Lehrer korrigiert die Tests.", "Die Tests **werden** (vom Lehrer) korrigiert."], ["Man baut ein neues Rathaus.", "Ein neues Rathaus wird gebaut."], ["Sie hat den Brief geschrieben.", "Der Brief ist von ihr geschrieben worden."]]),
    tip("Das Passiv entspricht oft dem französischen „**on**“ oder einer reflexiven Konstruktion: „Das **sagt man** nicht“ = „Das **wird** nicht **gesagt**“ = « Cela ne se dit pas ». Auch **Passiv-Ersatzformen**: „Das **lässt sich** machen“, „Das ist **machbar**“, „Das **kann** gemacht **werden**“.", "Le passif correspond souvent au français « **on** » ou à une construction pronominale : « Cela ne se dit pas ». Formes de remplacement : « Das **lässt sich** machen », « Das ist **machbar** »."),
    h("Zustandspassiv", "Passif d'état"),
    p("Das **Zustandspassiv** (sein + Partizip II) beschreibt das **Ergebnis**: „Die Tür **ist geöffnet**.“ (= sie ist offen). Das **Vorgangspassiv** (werden + Partizip II) beschreibt den **Vorgang**: „Die Tür **wird geöffnet**.“", "Le **passif d'état** (sein + participe II) décrit le **résultat** : « Die Tür **ist geöffnet**. » Le **passif d'action** (werden + participe II) décrit le **processus** : « Die Tür **wird geöffnet**. »")
  ],
  x: [
    xg("Passiv bilden", "Former le passif", [
      gap("Das Haus ___ gebaut. (werden, Präsens)", ["wird"]), gap("Die Häuser ___ gebaut. (werden, Plural)", ["werden"]), gap("Das Buch ___ von Goethe geschrieben. (werden, Prät.)", ["wurde"]), gap("Der Brief ist geschrieben ___. (Perfekt Passiv)", ["worden"]), gap("Die Tür ___ geschlossen. (werden, Präs.)", ["wird"]), gap("Das muss gemacht ___. (werden)", ["werden"]),
      ord(["Das", "Haus", "wurde", "im", "Jahr", "1990", "gebaut."], "Das Haus wurde im Jahr 1990 gebaut."), ord(["Hier", "wird", "nicht", "geraucht."], "Hier wird nicht geraucht.")
    ]),
    xg("Verständnis", "Compréhension", [
      mc(["Welche Form ist richtig? „Das Auto ___.“", "Quelle forme est correcte ? « Das Auto ___. »"], ["ist repariert geworden", "ist repariert worden", "wird reparierte", "hat repariert worden"], 1),
      mc(["„Die Tür ist geöffnet.“ beschreibt …", "« Die Tür ist geöffnet. » décrit …"], ["einen Vorgang", "einen Zustand", "die Zukunft", "einen Befehl"], 1)
    ])
  ] });

D.add({ id: "b1-zu", lv: "B1", t: ["Infinitiv mit zu und um … zu", "Infinitif avec zu et um … zu"], s: ["zu + Infinitiv, um … zu, ohne … zu, (an)statt … zu, damit.", "zu + infinitif, um … zu, ohne … zu, (an)statt … zu, damit."], k: "infinitiv zu um zu damit ohne zu statt zu infinitivsatz scheinen versuchen pour infinitif complément",
  b: [
    p("Viele Verben, Nomen und Adjektive verlangen einen **Infinitiv mit zu**. Das **zu** steht **direkt vor dem Infinitiv**; bei trennbaren Verben **zwischen** Präfix und Verb: **auf**zu**stehen**, **an**zu**rufen**.", "Beaucoup de verbes, noms et adjectifs exigent un **infinitif avec zu**. Le **zu** est **juste avant l'infinitif** ; pour les verbes séparables **entre** le préfixe et le verbe : **auf**zu**stehen**."),
    ex([["Ich habe vergessen, dich **anzurufen**.", "J'ai oublié de t'appeler."], ["Es ist schön, hier **zu wohnen**.", "C'est agréable d'habiter ici."], ["Er hat keine Lust, **zu arbeiten**.", "Il n'a pas envie de travailler."], ["Ich versuche, jeden Tag **zu lernen**.", "J'essaie d'apprendre tous les jours."]]),
    tb(["Verben mit zu + Infinitiv", "Verben ohne zu (+ reiner Infinitiv)"], [["versuchen, vergessen, anfangen, aufhören, beginnen, vorhaben, beschließen, hoffen, empfehlen, vorschlagen, scheinen", "Modalverben (können, müssen, …), lassen, sehen, hören, gehen (spazieren gehen), bleiben (sitzen bleiben), werden"], ["Ich habe vor, nach Wien **zu** fahren.", "Ich kann gut schwimmen. – Wir gehen schwimmen."]]),
    h("um … zu, damit, ohne … zu, (an)statt … zu", "um … zu, damit, ohne … zu, (an)statt … zu"),
    tb(["Struktur", "Bedeutung", "Beispiel"], [["**um … zu** + Infinitiv", "pour (but)", "Ich lerne Deutsch, **um** in Berlin **zu** arbeiten."], ["**damit** + Nebensatz", "pour que (anderes Subjekt)", "Ich erkläre es, **damit** du es verstehst."], ["**ohne … zu**", "sans (faire)", "Er ging, **ohne** sich **zu** verabschieden."], ["**ohne dass** + Nebensatz", "sans que", "Er ging, **ohne dass** ich es merkte."], ["**(an)statt … zu**", "au lieu de", "**Anstatt** zu arbeiten, schläft er."], ["**(an)statt dass** + Nebensatz", "au lieu que", "Anstatt dass er hilft, sitzt er herum."]]),
    p("**um … zu** nur bei **gleichem Subjekt**, **damit** bei **verschiedenen Subjekten** (oder gleichen, wenn man betonen will).", "**um … zu** seulement quand le **sujet est le même** ; **damit** quand les **sujets diffèrent**."),
    warn("Falle: „Ich gehe zum Bäcker, **um Brot zu kaufen**“ (um … zu). „Ich gebe dir Geld, **damit du Brot kaufen kannst**“ (damit). Nie „pour acheter“ → „für kaufen“!", "Piège : « pour acheter » = **um … zu kaufen**, jamais « für kaufen » !"),
    ex([["Ich habe keine Zeit, ins Kino zu gehen.", "Je n'ai pas le temps d'aller au cinéma."], ["Es ist wichtig, pünktlich zu sein.", "Il est important d'être ponctuel."], ["Ich bin müde, aber ich muss noch arbeiten.", "Je suis fatigué mais je dois encore travailler.", "Modalverb: ohne zu"]])
  ],
  x: [
    xg("zu oder nicht?", "zu ou non ?", [
      gap("Ich habe keine Lust, heute ___ arbeiten.", ["zu"]), gap("Ich versuche, früh ___. (aufstehen)", ["aufzustehen"]), mc(["Ich kann gut ___ schwimmen.", "Ich kann gut ___ schwimmen."], ["zu", "– (kein zu)"], 1, ["Nach Modalverben steht kein zu.", "Après un modal, pas de zu."]), gap("Er hat vergessen, mich ___ rufen. (anrufen)", ["anzurufen"])
    ]),
    xg("um … zu / damit", "um … zu / damit", [
      gap("Ich lerne Deutsch, ___ in Berlin zu arbeiten.", ["um"]), gap("Ich erkläre es dir, ___ du es verstehst.", ["damit"]), gap("Er ging, ___ sich zu verabschieden.", ["ohne"]), gap("___ zu lernen, spielt er Fußball. (statt)", ["Statt|Anstatt"])
    ])
  ] });
})();
