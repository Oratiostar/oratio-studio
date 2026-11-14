// Board-Pinouts: Raspberry Pi (40 Pin), Pico, Arduino Uno, Nano, ESP32, D1 mini.
// Alles läuft im Browser. Es wird nichts hochgeladen, gesendet oder gespeichert.
(function(){
"use strict";
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const FR = () => WZ.lang === "fr";
const T = (de, fr) => FR() ? fr : de;
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

/* ---------- Pin-Bausteine ---------- */
// p(Knopftext, Beschriftung, Zusatzfunktionen, Hinweis [de,fr], GPIO-Nummer für das Code-Beispiel)
const p = (b, l, f, n, g) => ({ b: String(b), l, f: f || "", n: n || null, g: g === undefined ? null : g });
const kindOf = x => /^(GND|AGND|G)$/.test(x.l) ? "gnd" : /^(3V3|3\.3V|5V|VIN|VSYS|VBUS|3V3_EN|3V3\(OUT\)|IOREF|ADC_VREF|AREF)$/.test(x.l) ? "strom" : /^(RST|RESET|RUN|EN)$/.test(x.l) ? "reset" : (x.l === "NC" ? "nc" : "gpio");
const tagsOf = x => { const f = (x.f + " " + x.l).toLowerCase(), t = [], k = kindOf(x);
  if (/i²c|\bi2c\b/.test(f)) t.push("i2c"); if (/spi/.test(f)) t.push("spi"); if (/uart|\btx|\brx/.test(f)) t.push("uart");
  if (/pwm/.test(f)) t.push("pwm"); if (/adc|analog/.test(f) || /^a\d/.test(x.l.toLowerCase())) t.push("adc");
  if (/touch/.test(f)) t.push("touch"); if (/dac/.test(f)) t.push("dac"); if (/pcm|i²s/.test(f)) t.push("pcm");
  if (k !== "gpio") t.push(k); return t; };

/* ---------- Boards ---------- */
const PI = (() => { const D = {1:["3V3",""],2:["5V",""],3:["GPIO2","I²C1 SDA"],4:["5V",""],5:["GPIO3","I²C1 SCL"],6:["GND",""],7:["GPIO4","GPCLK0"],8:["GPIO14","UART TXD"],9:["GND",""],10:["GPIO15","UART RXD"],11:["GPIO17",""],12:["GPIO18","PWM0 · PCM CLK · SPI1 CE0"],13:["GPIO27",""],14:["GND",""],15:["GPIO22",""],16:["GPIO23",""],17:["3V3",""],18:["GPIO24",""],19:["GPIO10","SPI0 MOSI"],20:["GND",""],21:["GPIO9","SPI0 MISO"],22:["GPIO25",""],23:["GPIO11","SPI0 SCLK"],24:["GPIO8","SPI0 CE0"],25:["GND",""],26:["GPIO7","SPI0 CE1"],27:["GPIO0","ID_SD (I²C0)"],28:["GPIO1","ID_SC (I²C0)"],29:["GPIO5",""],30:["GND",""],31:["GPIO6",""],32:["GPIO12","PWM0"],33:["GPIO13","PWM1"],34:["GND",""],35:["GPIO19","PWM1 · PCM FS · SPI1 MISO"],36:["GPIO16","SPI1 CE2"],37:["GPIO26",""],38:["GPIO20","PCM DIN · SPI1 MOSI"],39:["GND",""],40:["GPIO21","PCM DOUT · SPI1 SCLK"]};
  const mk = n => { const [l, f] = D[n], m = /^GPIO(\d+)$/.exec(l); return p(n, l, f, null, m ? +m[1] : null); };
  const rows = []; for (let i = 0; i < 20; i++) rows.push([mk(2 * i + 1), mk(2 * i + 2)]);
  return { id: "pi", ic: "🍓", name: T("Raspberry Pi (40 Pin)", "Raspberry Pi (40 broches)"), sub: T("Pi 2, 3, 4, 5, Zero (W / 2 W), 400, 500", "Pi 2, 3, 4, 5, Zero (W / 2 W), 400, 500"),
    groups: [{ t: "", rows }], first: 3, hint: T("So hältst du den Pi: USB-Anschlüsse unten, Header oben rechts. Pin 1 ist oben links (Viereck-Pad).", "Position : ports USB en bas, connecteur en haut à droite. La broche 1 est en haut à gauche (pastille carrée)."),
    code: g => 'from gpiozero import LED; LED(' + g + ').on()', gnum: T("BCM", "BCM"),
    fakten: [[T("Logikpegel", "Niveau logique"), "3,3 V (nicht 5-V-tolerant)"], [T("Strom pro Pin", "Courant par broche"), T("max. ca. 16 mA (empfohlen ≤ 8 mA)", "max. env. 16 mA (conseillé ≤ 8 mA)")], [T("Strom gesamt (alle GPIO)", "Courant total (tous GPIO)"), T("ca. 50 mA", "env. 50 mA")], [T("3V3-Pins", "Broches 3V3"), T("zusammen ca. 0,5 A", "ensemble env. 0,5 A")], [T("Interner Pull-up/-down", "Pull-up/down interne"), "ca. 50 kΩ"], [T("Analog", "Analogique"), T("keine Analogeingänge – ADC-Modul (ADS1115, MCP3008) nötig", "pas d’entrée analogique – module ADC (ADS1115, MCP3008)")]],
    tipps: [T("Pi 5: `RPi.GPIO` funktioniert nicht (neuer Chip RP1). Nutze `gpiozero` oder `lgpio`.", "Pi 5 : `RPi.GPIO` ne fonctionne pas (puce RP1). Utilise `gpiozero` ou `lgpio`."), T("5-V-Pin und 3V3-Pin sind Versorgungen, keine Signale. Nie 5 V an einen GPIO legen.", "Les broches 5V et 3V3 sont des alimentations, pas des signaux. Jamais 5 V sur un GPIO.")] }; })();

const PICO = (() => { const D = {1:["GP0","UART0 TX · I²C0 SDA · SPI0 RX"],2:["GP1","UART0 RX · I²C0 SCL · SPI0 CSn"],3:["GND",""],4:["GP2","I²C1 SDA · SPI0 SCK"],5:["GP3","I²C1 SCL · SPI0 TX"],6:["GP4","UART1 TX · I²C0 SDA · SPI0 RX"],7:["GP5","UART1 RX · I²C0 SCL · SPI0 CSn"],8:["GND",""],9:["GP6","I²C1 SDA · SPI0 SCK"],10:["GP7","I²C1 SCL · SPI0 TX"],11:["GP8","UART1 TX · I²C0 SDA · SPI1 RX"],12:["GP9","UART1 RX · I²C0 SCL · SPI1 CSn"],13:["GND",""],14:["GP10","I²C1 SDA · SPI1 SCK"],15:["GP11","I²C1 SCL · SPI1 TX"],16:["GP12","UART0 TX · I²C0 SDA · SPI1 RX"],17:["GP13","UART0 RX · I²C0 SCL · SPI1 CSn"],18:["GND",""],19:["GP14","I²C1 SDA · SPI1 SCK"],20:["GP15","I²C1 SCL · SPI1 TX"],21:["GP16","UART0 TX · I²C0 SDA · SPI0 RX"],22:["GP17","UART0 RX · I²C0 SCL · SPI0 CSn"],23:["GND",""],24:["GP18","I²C1 SDA · SPI0 SCK"],25:["GP19","I²C1 SCL · SPI0 TX"],26:["GP20","UART1 TX · I²C0 SDA · SPI0 RX"],27:["GP21","UART1 RX · I²C0 SCL · SPI0 CSn"],28:["GND",""],29:["GP22","I²C1 SDA · SPI0 SCK"],30:["RUN",""],31:["GP26","ADC0 · I²C1 SDA · SPI1 SCK"],32:["GP27","ADC1 · I²C1 SCL · SPI1 TX"],33:["AGND",""],34:["GP28","ADC2"],35:["ADC_VREF",""],36:["3V3",""],37:["3V3_EN",""],38:["GND",""],39:["VSYS",""],40:["VBUS",""]};
  const mk = n => { const [l, f] = D[n], m = /^GP(\d+)$/.exec(l); const x = p(n, l, f, null, m ? +m[1] : null); if (m) x.f = (x.f ? x.f + " · " : "") + "PWM"; return x; };
  const rows = []; for (let i = 0; i < 20; i++) rows.push([mk(i + 1), mk(40 - i)]);
  const P = rows.flat(); P.find(x => x.l === "3V3_EN").n = [T("", ""), ""];
  P.find(x => x.l === "3V3_EN").n = ["Zieht man diesen Pin auf GND, schaltet der 3,3-V-Regler ab (Pico aus).", "Mis à GND, il coupe le régulateur 3,3 V (Pico éteint)."];
  P.find(x => x.l === "RUN").n = ["Reset: kurz auf GND ziehen startet den Pico neu.", "Reset : le relier brièvement à GND redémarre le Pico."];
  P.find(x => x.l === "VSYS").n = ["Systemspannung 1,8–5,5 V (z. B. Akku). Über VBUS/USB wird sie per Diode gespeist.", "Tension système 1,8–5,5 V (p. ex. accu). Alimentée par VBUS/USB via une diode."];
  P.find(x => x.l === "VBUS").n = ["5 V direkt vom USB-Anschluss.", "5 V directement du port USB."];
  P.find(x => x.l === "GP25") ;
  return { id: "pico", ic: "🥧", name: "Raspberry Pi Pico", sub: T("Pico, Pico W, Pico 2 (RP2040 / RP2350)", "Pico, Pico W, Pico 2 (RP2040 / RP2350)"),
    groups: [{ t: "", rows }], first: 1, hint: T("USB-Buchse oben. Links Pin 1–20 (von oben nach unten), rechts Pin 21–40 (von unten nach oben). Jeder GPIO kann PWM.", "Prise USB en haut. À gauche broches 1–20 (de haut en bas), à droite 21–40 (de bas en haut). Chaque GPIO peut faire du PWM."),
    code: g => 'from machine import Pin; Pin(' + g + ', Pin.OUT).on()', gnum: "GP",
    fakten: [[T("Logikpegel", "Niveau logique"), "3,3 V (nicht 5-V-tolerant)"], [T("Strom pro Pin", "Courant par broche"), T("2–12 mA einstellbar (Standard 4 mA)", "2–12 mA réglable (défaut 4 mA)")], [T("Analog", "Analogique"), T("3 ADC-Eingänge (GP26–28) + interner Temperatursensor, 12 Bit", "3 entrées ADC (GP26–28) + capteur de température, 12 bits")], [T("Besonderheit", "Particularité"), T("PIO-Zustandsmaschinen für eigene Protokolle (WS2812, VGA …)", "machines à états PIO pour protocoles personnalisés (WS2812, VGA …)")]],
    tipps: [T("Auf dem Pico W läuft die LED und das WLAN-Modul über den Funkchip (nicht über GP25).", "Sur le Pico W, la LED et le Wi-Fi passent par la puce radio (pas par GP25)."), T("Programmiert wird in MicroPython oder C/C++. Das Pico-Beispiel hier ist MicroPython.", "Programmation en MicroPython ou C/C++. L’exemple ici est en MicroPython.")] }; })();

const UNO = (() => {
  const A = n => p("A" + n, "A" + n, T("Analogeingang (10 Bit)", "entrée analogique (10 bits)") + (n === 4 ? " · I²C SDA" : n === 5 ? " · I²C SCL" : ""), null, "A" + n);
  const Dg = (n, f, nt) => p("D" + n, "D" + n, f || "", nt, n);
  const pw = "PWM";
  return { id: "uno", ic: "🔵", name: "Arduino Uno", sub: T("Uno R3 und Uno R4 (Minima / WiFi)", "Uno R3 et Uno R4 (Minima / WiFi)"),
    groups: [
      { t: T("Versorgung", "Alimentation"), rows: [[p("—", "NC", "", ["Nicht belegt.", "Non connectée."])], [p("IOREF", "IOREF", "", ["Meldet Shields die Logikspannung des Boards (5 V).", "Indique aux shields la tension logique de la carte (5 V)."])], [p("RST", "RESET", "", ["Auf GND ziehen = Neustart.", "À GND = redémarrage."])], [p("3V3", "3V3", "", ["Max. ca. 50 mA vom Spannungsregler.", "Max. env. 50 mA du régulateur."])], [p("5V", "5V")], [p("GND", "GND")], [p("GND", "GND")], [p("VIN", "VIN", "", ["Eingang 7–12 V (Netzteil) – oder Ausgang, wenn über die Buchse gespeist.", "Entrée 7–12 V (bloc secteur) – ou sortie si alimenté par la prise."])]] },
      { t: T("Analog-Eingänge", "Entrées analogiques"), rows: [0, 1, 2, 3, 4, 5].map(n => [A(n)]) },
      { t: T("Digital D8–D13 + I²C", "Numérique D8–D13 + I²C"), rows: [[p("SCL", "SCL", "I²C SCL", ["Gleicher Anschluss wie A5 (R3 hat sie zusätzlich oben herausgeführt).", "Même broche que A5."])], [p("SDA", "SDA", "I²C SDA", ["Gleicher Anschluss wie A4.", "Même broche que A4."])], [p("AREF", "AREF", "", ["Referenzspannung für analogRead (Standard: 5 V).", "Tension de référence pour analogRead (défaut 5 V)."])], [p("GND", "GND")], [Dg(13, "SPI SCK · eingebaute LED")], [Dg(12, "SPI MISO")], [Dg(11, pw + " · SPI MOSI")], [Dg(10, pw + " · SPI SS")], [Dg(9, pw)], [Dg(8)]] },
      { t: T("Digital D0–D7", "Numérique D0–D7"), rows: [[Dg(7)], [Dg(6, pw)], [Dg(5, pw)], [Dg(4)], [Dg(3, pw + " · Interrupt INT1")], [Dg(2, "Interrupt INT0")], [Dg(1, "UART TX", ["Gemeinsam mit USB-Seriell. Beim Hochladen nicht belegen.", "Partagée avec l’USB-série. Ne pas utiliser pendant le téléversement."])], [Dg(0, "UART RX", ["Gemeinsam mit USB-Seriell. Beim Hochladen nicht belegen.", "Partagée avec l’USB-série. Ne pas utiliser pendant le téléversement."])]] }],
    first: "D13", hint: T("Vier Buchsenleisten: Versorgung, Analog, Digital hoch (D8–D13 mit I²C) und Digital niedrig (D0–D7). Ansicht von oben, USB-Buchse links.", "Quatre connecteurs : alimentation, analogique, numérique haut (D8–D13 avec I²C) et bas (D0–D7). Vue de dessus, prise USB à gauche."),
    code: g => typeof g === "string" ? 'int v = analogRead(' + g + ');' : 'pinMode(' + g + ', OUTPUT); digitalWrite(' + g + ', HIGH);', gnum: "Pin",
    fakten: [[T("Logikpegel", "Niveau logique"), "5 V"], [T("Strom pro Pin", "Courant par broche"), T("20 mA empfohlen, 40 mA absolutes Maximum", "20 mA conseillés, 40 mA maximum absolu")], [T("Strom gesamt", "Courant total"), T("ca. 200 mA über alle Pins", "env. 200 mA pour toutes les broches")], [T("PWM", "PWM"), "D3, D5, D6, D9, D10, D11 (~490/980 Hz)"], [T("Analog", "Analogique"), T("6 Eingänge, R3: 10 Bit, R4: bis 14 Bit; R4 hat zusätzlich einen DAC an A0 (12 Bit)", "6 entrées, R3 : 10 bits, R4 : jusqu’à 14 bits ; le R4 a en plus un DAC sur A0 (12 bits)")], [T("Interrupts", "Interruptions"), "D2, D3 (R3); R4: alle digitalen Pins"]],
    tipps: [T("Ein 5-V-Board an einen 3,3-V-Pi/ESP32: Pegelwandler oder Spannungsteiler nutzen.", "Une carte 5 V vers un Pi/ESP32 en 3,3 V : utiliser un convertisseur de niveau ou un diviseur."), T("Uno R4: Pinbelegung wie R3, USB-C, zusätzlich CAN auf D4/D5 (mit Transceiver) und RA4M1-Chip.", "Uno R4 : même brochage que le R3, USB-C, CAN sur D4/D5 (avec transceiver) et puce RA4M1.")] }; })();

const NANO = (() => {
  const D = n => p("D" + n, "D" + n, ({3:"PWM · INT1",5:"PWM",6:"PWM",9:"PWM",10:"PWM · SPI SS",11:"PWM · SPI MOSI",12:"SPI MISO",13:"SPI SCK · eingebaute LED",2:"INT0"})[n] || "", null, n);
  const A = n => p("A" + n, "A" + n, (n < 6 ? "" : T("nur analog (kein digitaler Pin)", "analogique seulement")) + (n === 4 ? "I²C SDA" : n === 5 ? "I²C SCL" : "") + (n < 6 ? (n >= 4 ? " · " : "") + T("Analogeingang", "entrée analogique") : ""), null, "A" + n);
  const e1 = [p("TX1", "TX1", "UART TX · D1", ["Gemeinsam mit USB-Seriell.", "Partagée avec l’USB-série."], 1), p("RX0", "RX0", "UART RX · D0", ["Gemeinsam mit USB-Seriell.", "Partagée avec l’USB-série."], 0), p("RST", "RST"), p("GND", "GND"), D(2), D(3), D(4), D(5), D(6), D(7), D(8), D(9), D(10), D(11), D(12)];
  const e2 = [p("VIN", "VIN", "", ["Eingang 7–12 V.", "Entrée 7–12 V."]), p("GND", "GND"), p("RST", "RST"), p("5V", "5V"), A(7), A(6), A(5), A(4), A(3), A(2), A(1), A(0), p("REF", "AREF"), p("3V3", "3V3", "", ["Vom USB-Chip, max. ca. 50 mA.", "Du circuit USB, max. env. 50 mA."]), D(13)];
  const rows = e1.map((x, i) => [x, e2[i]]);
  return { id: "nano", ic: "🔹", name: "Arduino Nano", sub: T("Nano (ATmega328P) – Klone und Every ähnlich", "Nano (ATmega328P) – clones et Every similaires"),
    groups: [{ t: "", rows, cols: [T("Kante D0–D12", "Bord D0–D12"), T("Kante A0–A7", "Bord A0–A7")] }], first: "D13", hint: T("USB-Buchse oben. Beide Reihen beginnen am USB-Ende. Eine Kante trägt D0–D12, die andere VIN, 5V, A7–A0 und D13.", "Prise USB en haut. Les deux rangées commencent côté USB. Un bord porte D0–D12, l’autre VIN, 5V, A7–A0 et D13."),
    code: UNO.code, gnum: "Pin",
    fakten: [[T("Logikpegel", "Niveau logique"), "5 V"], [T("Strom pro Pin", "Courant par broche"), T("20 mA empfohlen, 40 mA Maximum", "20 mA conseillés, 40 mA maximum")], [T("PWM", "PWM"), "D3, D5, D6, D9, D10, D11"], [T("Analog", "Analogique"), T("8 Eingänge (A6, A7 nur analog), 10 Bit", "8 entrées (A6, A7 analogiques seulement), 10 bits")], [T("Versorgung", "Alimentation"), T("USB 5 V oder VIN 7–12 V", "USB 5 V ou VIN 7–12 V")]],
    tipps: [T("A6 und A7 lassen sich nicht als digitale Pins nutzen (kein `digitalWrite`).", "A6 et A7 ne peuvent pas servir de broches numériques (pas de `digitalWrite`)."), T("Nano Every / Nano 33 / Nano ESP32 haben ähnliche Pins, aber 3,3-V-Logik (außer Every). Datenblatt prüfen.", "Nano Every / 33 / ESP32 : brochage proche, mais logique 3,3 V (sauf Every). Vérifier la fiche technique.")] }; })();

const ESP = (() => {
  const G = (l, f, n) => { const m = /(\d+)$/.exec(l); return p(l, l, f, n, m ? +m[1] : null); };
  const g = (n, f, nt) => p(n, "GPIO" + n, f, nt, n);
  const fl = ["Flash-Anschluss – nicht benutzen.", "Relié à la flash – ne pas utiliser."], st = ["Strapping-Pin: beim Start entscheidet sein Pegel über den Bootmodus.", "Broche de strapping : son niveau au démarrage décide du mode de boot."], io = ["Nur Eingang (kein Ausgang, kein interner Pull-up).", "Entrée seulement (pas de sortie, pas de pull-up interne)."];
  const L = [p("3V3", "3V3"), p("EN", "EN", "", ["Enable/Reset. Auf GND ziehen = Neustart.", "Enable/Reset. À GND = redémarrage."]), p("VP", "GPIO36", "ADC1_0 · nur Eingang", io, 36), p("VN", "GPIO39", "ADC1_3 · nur Eingang", io, 39), g(34, "ADC1_6 · nur Eingang", io), g(35, "ADC1_7 · nur Eingang", io), g(32, "ADC1_4 · Touch9"), g(33, "ADC1_5 · Touch8"), g(25, "DAC1 · ADC2_8"), g(26, "DAC2 · ADC2_9"), g(27, "Touch7 · ADC2_7"), g(14, "Touch6 · HSPI SCK · ADC2_6"), g(12, "Touch5 · HSPI MISO · ADC2_5", st), p("GND", "GND"), g(13, "Touch4 · HSPI MOSI · ADC2_4"), p("SD2", "GPIO9", "Flash", fl, 9), p("SD3", "GPIO10", "Flash", fl, 10), p("CMD", "GPIO11", "Flash", fl, 11), p("5V", "5V", "", ["VIN: 5 V vom USB oder extern (4,5–12 V je nach Board).", "VIN : 5 V de l’USB ou externe."])];
  const R = [p("GND", "GND"), g(23, "VSPI MOSI"), g(22, "I²C SCL"), p("TX0", "GPIO1", "UART0 TX", ["Mit der USB-Konsole geteilt.", "Partagée avec la console USB."], 1), p("RX0", "GPIO3", "UART0 RX", ["Mit der USB-Konsole geteilt.", "Partagée avec la console USB."], 3), g(21, "I²C SDA"), p("GND", "GND"), g(19, "VSPI MISO"), g(18, "VSPI SCK"), g(5, "VSPI CS", st), g(17, "UART2 TX"), g(16, "UART2 RX"), g(4, "Touch0 · ADC2_0"), g(0, "Touch1 · ADC2_1 · Boot-Taste", st), g(2, "Touch2 · ADC2_2 · interne LED", st), g(15, "Touch3 · HSPI CS · ADC2_3", st), p("SD1", "GPIO8", "Flash", fl, 8), p("SD0", "GPIO7", "Flash", fl, 7), p("CLK", "GPIO6", "Flash", fl, 6)];
  return { id: "esp32", ic: "📶", name: "ESP32 DevKitC", sub: T("ESP32-DevKitC V4 (38 Pins) – ähnlich: DevKit V1", "ESP32-DevKitC V4 (38 broches) – semblable : DevKit V1"),
    groups: [{ t: "", rows: L.map((x, i) => [x, R[i]]) }], first: 21, hint: T("Antenne oben, USB unten. Die Beschriftung auf der Platine nennt die Pins wie hier (Knopf = Platinenaufdruck).", "Antenne en haut, USB en bas. Le texte du bouton correspond à la sérigraphie de la carte."),
    code: g => 'pinMode(' + g + ', OUTPUT); digitalWrite(' + g + ', HIGH);', gnum: "GPIO",
    fakten: [[T("Logikpegel", "Niveau logique"), "3,3 V (nicht 5-V-tolerant)"], [T("Strom pro Pin", "Courant par broche"), T("ca. 20 mA empfohlen, 40 mA absolutes Maximum", "env. 20 mA conseillés, 40 mA maximum absolu")], [T("Nur Eingang", "Entrée seule"), "GPIO34, 35, 36, 39"], [T("Nicht benutzen", "À éviter"), "GPIO6–11 (Flash)"], [T("Analog", "Analogique"), T("ADC1 (GPIO32–39) immer nutzbar; ADC2 geht nicht, solange WLAN läuft", "ADC1 (GPIO32–39) toujours utilisable ; ADC2 inutilisable quand le Wi-Fi est actif")], [T("PWM", "PWM"), T("fast alle Ausgangspins über LEDC", "presque toutes les sorties via LEDC")], [T("Touch / DAC", "Touch / DAC"), T("10 Touch-Pins; DAC auf GPIO25 und GPIO26 (8 Bit)", "10 broches tactiles ; DAC sur GPIO25 et GPIO26 (8 bits)")]],
    tipps: [T("I²C-Standard: SDA = GPIO21, SCL = GPIO22. SPI (VSPI): MOSI 23, MISO 19, SCK 18, CS 5. Alles lässt sich auf andere Pins legen.", "I²C par défaut : SDA = GPIO21, SCL = GPIO22. SPI (VSPI) : MOSI 23, MISO 19, SCK 18, CS 5. Tout est reconfigurable."), T("Strapping-Pins (0, 2, 5, 12, 15) beim Start nicht mit Hardware belasten, sonst bootet der ESP32 nicht.", "Broches de strapping (0, 2, 5, 12, 15) : ne pas les charger au démarrage, sinon l’ESP32 ne démarre pas.")] }; })();

const D1 = (() => {
  const d = (b, l, f, n, g) => p(b, l, f, n, g);
  const L = [p("RST", "RST"), p("A0", "A0", "ADC (0–1 V, auf dem Board bis 3,3 V geteilt)", ["Nur ein Analogeingang, max. 1 V am Chip (auf D1 mini: Teiler bis 3,3 V).", "Une seule entrée analogique, max. 1 V sur la puce (D1 mini : diviseur jusqu’à 3,3 V)."], "A0"), d("D0", "GPIO16", "Wake (Deep-Sleep) · kein PWM/I²C", null, 16), d("D5", "GPIO14", "SPI SCK · PWM", null, 14), d("D6", "GPIO12", "SPI MISO · PWM", null, 12), d("D7", "GPIO13", "SPI MOSI · PWM", null, 13), d("D8", "GPIO15", "SPI CS · PWM", ["Muss beim Start LOW sein (Strapping).", "Doit être à LOW au démarrage (strapping)."], 15), p("3V3", "3V3")];
  const R = [d("TX", "GPIO1", "UART TX", ["Mit der USB-Konsole geteilt.", "Partagée avec la console USB."], 1), d("RX", "GPIO3", "UART RX", ["Mit der USB-Konsole geteilt.", "Partagée avec la console USB."], 3), d("D1", "GPIO5", "I²C SCL · PWM", null, 5), d("D2", "GPIO4", "I²C SDA · PWM", null, 4), d("D3", "GPIO0", "PWM · Flash-Taste", ["Strapping: beim Start HIGH, sonst Flash-Modus.", "Strapping : HIGH au démarrage, sinon mode flash."], 0), d("D4", "GPIO2", "PWM · eingebaute LED (LOW = an)", ["Strapping: beim Start HIGH.", "Strapping : HIGH au démarrage."], 2), p("G", "GND"), p("5V", "5V")];
  return { id: "d1mini", ic: "📡", name: "ESP8266 D1 mini", sub: T("Wemos D1 mini (NodeMCU ähnlich)", "Wemos D1 mini (NodeMCU similaire)"),
    groups: [{ t: "", rows: L.map((x, i) => [x, R[i]]) }], first: "D2", hint: T("Antenne oben, USB unten. Knopftext = Aufdruck (D0–D8), darunter die GPIO-Nummer.", "Antenne en haut, USB en bas. Texte du bouton = sérigraphie (D0–D8), dessous le numéro GPIO."),
    code: g => 'pinMode(' + g + ', OUTPUT); digitalWrite(' + g + ', HIGH);', gnum: "GPIO",
    fakten: [[T("Logikpegel", "Niveau logique"), "3,3 V (nicht 5-V-tolerant)"], [T("Strom pro Pin", "Courant par broche"), T("ca. 12 mA empfohlen, 20 mA Maximum", "env. 12 mA conseillés, 20 mA maximum")], [T("Analog", "Analogique"), T("1 Eingang (A0), 10 Bit", "1 entrée (A0), 10 bits")], [T("PWM", "PWM"), T("Software-PWM auf allen GPIO", "PWM logiciel sur tous les GPIO")]],
    tipps: [T("In der Arduino-IDE kannst du `D2`, `D1` … direkt als Pinnamen verwenden.", "Dans l’IDE Arduino, tu peux utiliser `D2`, `D1` … directement comme noms de broches."), T("Nur ein Analogeingang und wenig GPIO – für mehr Pins ist der ESP32 besser.", "Une seule entrée analogique et peu de GPIO – pour plus de broches, l’ESP32 est plus adapté.")] }; })();

const BOARDS = [PI, PICO, UNO, NANO, ESP, D1];
BOARDS.forEach(b => b.groups.forEach(g => g.rows.forEach(r => r.forEach(x => { if (x) { x.k = kindOf(x); x.tags = tagsOf(x); } }))));

/* ---------- Oberfläche ---------- */
const FILT = { alle: [T("Alle", "Toutes")], strom: [T("Strom", "Alim.")], gnd: ["GND"], i2c: ["I²C"], spi: ["SPI"], uart: ["UART"], pwm: ["PWM"], adc: [T("Analog", "Analog.")], touch: ["Touch"], dac: ["DAC"], pcm: ["PCM/I²S"] };
const COL = x => x.k === "strom" ? (x.l === "5V" || x.l === "VIN" || x.l === "VBUS" || x.l === "VSYS" ? "#e63946" : "#ff9f1a") : x.k === "gnd" ? "#4b5160" : x.k === "reset" ? "#9c36b5" : x.k === "nc" ? "#868e96" : (x.f && /flash/i.test(x.f)) ? "#868e96" : x.f ? "#2e86ff" : "#2a9d3f";

function start(host, hashId){
  const st = document.createElement("style");
  st.textContent = ".bchips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px}.bchips .btn.on{outline:2px solid var(--acc,#2e86ff)}.bsub{margin:0 0 8px;font-size:13px;opacity:.8}.pgrid{display:grid;grid-template-columns:1fr 38px 38px 1fr;gap:5px 6px;align-items:center;max-width:430px;margin:0 auto;padding:10px;border-radius:14px;background:#1c5a3a;color:#fff}.pgrid.one{grid-template-columns:1fr 46px;max-width:300px}.pgrid .pl{font:600 12.5px/1.2 ui-monospace,Menlo,monospace;padding:0 2px;min-width:0;overflow-wrap:anywhere}.pgrid .pl.l{text-align:right}.pgrid .pl.r{text-align:left}.pgrid .gh{grid-column:1/-1;font:700 12px/1.2 system-ui,sans-serif;opacity:.85;margin:6px 0 0;text-transform:uppercase;letter-spacing:.04em}.pgrid .gc{font:700 11px system-ui;opacity:.8;text-align:center;grid-column:span 2}.pg{min-width:36px;height:30px;border-radius:15px;border:2px solid #fff3;color:#fff;font:700 11px ui-monospace,Menlo,monospace;cursor:pointer;padding:0 4px}.pg.sq{border-radius:6px}.pg.dim{opacity:.18}.pg.on{outline:3px solid #fff;transform:scale(1.08)}.pgrid .fs{color:#fff;opacity:.72;font-weight:500;display:block}.pbad{display:inline-block;font:700 11px system-ui;border-radius:8px;padding:2px 7px;margin:0 4px 4px 0;background:var(--soft,#e7eefc);color:inherit}.pfk td,.pfk th{padding:5px 8px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line,#0002)}.pfk{width:100%;border-collapse:collapse;font-size:14px}";
  host.appendChild(st);
  let cur = BOARDS.find(b => b.id === hashId) || BOARDS[0], sel = null, fl = "alle";
  const box = document.createElement("div"); host.appendChild(box);
  function pinsOf(b){ return b.groups.flatMap(g => g.rows.flat()).filter(Boolean); }
  function zeichne(){
    if (sel === null || !pinsOf(cur).some(x => x.b === sel)) sel = String(cur.first);
    const tagSet = new Set(pinsOf(cur).flatMap(x => x.tags)), filters = ["alle", "strom", "gnd", "i2c", "spi", "uart", "pwm", "adc", "touch", "dac", "pcm"].filter(f => f === "alle" || tagSet.has(f));
    if (!filters.includes(fl)) fl = "alle";
    let h = '<div class="bchips" id="bc">' + BOARDS.map(b => '<button class="btn sm' + (b === cur ? " on" : "") + '" data-b="' + b.id + '">' + b.ic + " " + esc(b.name) + '</button>').join("") + '</div>';
    h += '<p class="bsub">' + esc(cur.sub) + '</p><div class="tabs" id="pF">' + filters.map(f => '<button class="btn sm' + (f === fl ? " on" : "") + '" data-f="' + f + '">' + FILT[f][0] + '</button>').join("") + '</div>';
    h += '<div class="cols2"><div>' + grid() + '<p class="hint">' + esc(cur.hint) + '</p></div><div id="pInfo"></div></div>';
    box.innerHTML = h;
    $$("#bc button", box).forEach(b => b.onclick = () => { cur = BOARDS.find(x => x.id === b.dataset.b); sel = null; fl = "alle"; history.replaceState(null, "", "#" + cur.id); zeichne(); });
    $$("#pF button", box).forEach(b => b.onclick = () => { fl = b.dataset.f; zeichne(); });
    $$(".pg", box).forEach(b => b.onclick = () => { sel = b.dataset.p; zeichne(); });
    info();
  }
  function grid(){
    return cur.groups.map(g => {
      const one = g.rows.every(r => r.length === 1);
      let h = '<div class="pgrid' + (one ? " one" : "") + '" style="margin-bottom:10px">';
      if (g.t) h += '<div class="gh">' + esc(g.t) + '</div>';
      if (g.cols) h += '<div class="gc">' + esc(g.cols[0]) + '</div><div class="gc">' + esc(g.cols[1]) + '</div>';
      const cell = x => { const dim = fl !== "alle" && !x.tags.includes(fl); return '<button type="button" class="pg' + (x.b === "1" && cur.id === "pi" ? " sq" : "") + (dim ? " dim" : "") + (x.b === sel ? " on" : "") + '" data-p="' + esc(x.b) + '" style="background:' + COL(x) + '" aria-label="' + esc(x.b + " " + x.l) + '">' + esc(x.b) + '</button>'; };
      const lab = (x, side) => '<div class="pl ' + side + '">' + esc(x.l) + (x.f && !/^(3V3|5V|GND)$/.test(x.f) ? '<span class="fs">' + esc(x.f.split(" · ")[0]) + '</span>' : '') + '</div>';
      g.rows.forEach(r => { if (one) h += lab(r[0], "l") + cell(r[0]); else h += lab(r[0], "l") + cell(r[0]) + cell(r[1]) + lab(r[1], "r"); });
      return h + '</div>';
    }).join("");
  }
  function info(){
    const x = pinsOf(cur).find(y => y.b === sel), k = x.k;
    const L = { "3V3": T("3,3-V-Versorgung.", "Alimentation 3,3 V."), "5V": T("5 V direkt vom USB bzw. Netzteil. Niemals an einen 3,3-V-Pin anschließen!", "5 V directement de l’USB ou du bloc. Jamais sur une broche 3,3 V !"), GND: T("Masse (0 V). Alle GND-Pins sind miteinander verbunden.", "Masse (0 V). Toutes les broches GND sont reliées.") };
    const noteT = n => n ? (FR() ? n[1] : n[0]) : "";
    let h = '<div class="card" style="margin:0"><h3 style="margin-top:0"><span class="ts" style="background:' + COL(x) + ';min-width:34px;height:34px;font-size:13px">' + esc(x.b) + '</span> ' + esc(x.l) + '</h3>';
    const tg = x.f ? x.f.split(" · ") : [];
    if (k === "gpio"){
      h += '<div class="stats"><div><b>' + esc(cur.gnum === "Pin" || cur.gnum === "GPIO" || cur.gnum === "GP" || cur.gnum === "BCM" ? cur.gnum + " " + (x.g === null ? "–" : x.g) : "–") + '</b><small>' + T("Nummer im Programm", "numéro dans le programme") + '</small></div><div><b>' + esc(x.b) + '</b><small>' + T("Aufdruck / Position", "sérigraphie / position") + '</small></div></div>';
      h += '<p>' + (tg.length ? T("Funktionen: ", "Fonctions : ") + tg.map(t => '<span class="pbad">' + esc(t) + '</span>').join("") : T("Normaler Ein-/Ausgang ohne feste Zusatzfunktion.", "Entrée/sortie simple, sans fonction fixe.")) + '</p>';
      if (x.n) h += '<p class="hint">' + esc(noteT(x.n)) + '</p>';
      if (x.g !== null && !/flash/i.test(x.f)) h += '<p class="hint">' + T("Test: ", "Test : ") + '<code>' + esc(cur.code(x.g)) + '</code></p>';
    } else {
      h += '<p>' + esc(x.n ? noteT(x.n) : (L[x.l] || (k === "gnd" ? L.GND : k === "reset" ? T("Reset/Enable: kurz auf GND ziehen startet das Board neu.", "Reset/Enable : le relier brièvement à GND redémarre la carte.") : k === "strom" ? T("Spannungs- bzw. Referenzanschluss.", "Broche d’alimentation ou de référence.") : "") )) + '</p>';
    }
    h += '</div><h3>' + esc(cur.name) + ' – ' + T("Kennwerte", "caractéristiques") + '</h3><table class="pfk">' + cur.fakten.map(r => '<tr><th>' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>').join("") + '</table>';
    h += '<ul class="hint">' + cur.tipps.map(t => '<li>' + esc(t) + '</li>').join("") + '</ul>';
    $("#pInfo", box).innerHTML = h;
  }
  zeichne();
}
window.Pinout = { start: function(){
  const host = $("#pohost"); if (!host) return;
  start(host, (location.hash || "").slice(1));
} };
})();
