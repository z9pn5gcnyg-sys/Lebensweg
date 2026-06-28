import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg:       "#0C0C14",
  surface:  "#13131F",
  card:     "#1A1A2E",
  border:   "rgba(255,255,255,0.07)",
  accent:   "#7C6FFF",
  accentDim:"rgba(124,111,255,0.15)",
  gold:     "#F5C542",
  goldDim:  "rgba(245,197,66,0.12)",
  red:      "#FF6B6B",
  green:    "#4ECFA6",
  text:     "#E8E8F0",
  muted:    "#6B6B8A",
  subtle:   "#2A2A3F",
};

// ─────────────────────────────────────────────────────────────────────────────
// STAT CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const STATS = {
  glueck:     { label: "Glück",       icon: "✦", color: "#F5C542" },
  gesundheit: { label: "Gesundheit",  icon: "♥", color: "#FF6B6B" },
  reichtum:   { label: "Reichtum",    icon: "◈", color: "#4ECFA6" },
  bildung:    { label: "Bildung",     icon: "◉", color: "#7C6FFF" },
  soziales:   { label: "Soziales",    icon: "◎", color: "#FF9F7C" },
  ruf:        { label: "Ruf",         icon: "★", color: "#A8D8EA" },
};

// ─────────────────────────────────────────────────────────────────────────────
// LIFE PHASES
// ─────────────────────────────────────────────────────────────────────────────
const PHASES = [
  { id: "kind",    label: "Kindheit",   emoji: "🌱", range: [0, 12]  },
  { id: "jugend",  label: "Jugend",     emoji: "⚡", range: [13, 18] },
  { id: "jung",    label: "Aufbruch",   emoji: "🔥", range: [19, 29] },
  { id: "mitte",   label: "Aufstieg",   emoji: "💼", range: [30, 54] },
  { id: "rente",   label: "Reife",      emoji: "🌅", range: [55, 90] },
];

function getPhase(age) {
  return PHASES.find(p => age >= p.range[0] && age <= p.range[1]) || PHASES[4];
}

// ─────────────────────────────────────────────────────────────────────────────
// DECISION BANK — 80+ Entscheidungen, phasenbasiert
// ─────────────────────────────────────────────────────────────────────────────
const DECISIONS = {
  kind: [
    {
      id: "k1", title: "Das erste Hobby", cat: "hobby",
      story: "Deine Eltern fragen, womit du deine Nachmittagsstunden verbringen möchtest.",
      options: [
        { label: "Fußball spielen", desc: "Jeden Tag mit den Nachbarskindern auf dem Platz.", fx: { glueck:8, gesundheit:10, soziales:7, bildung:-2 }, side: "Du wirst zum Liebling der Mannschaft." },
        { label: "Bücher lesen", desc: "Die Stadtbibliothek wird dein zweites Zuhause.", fx: { bildung:12, glueck:5, soziales:-4, gesundheit:-2 }, side: "Du entwickelst eine lebhafte Fantasie." },
        { label: "Musik lernen", desc: "Klavierstunden jeden Dienstag.", fx: { bildung:8, glueck:6, ruf:5, soziales:3 }, side: "Musik wird dein Leben lang präsent sein." },
      ]
    },
    {
      id: "k2", title: "Schulkonflikt", cat: "soziales",
      story: "Ein Mitschüler wird von anderen gehänselt. Du siehst es auf dem Schulhof.",
      options: [
        { label: "Einschreiten", desc: "Du stellst dich schützend vor den Schwächeren.", fx: { ruf:10, glueck:6, soziales:8, gesundheit:-3 }, side: "Du gewinnst einen treuen Freund." },
        { label: "Lehrer holen", desc: "Du meldest den Vorfall diskret.", fx: { bildung:3, ruf:4, glueck:2, soziales:2 }, side: "Der Täter erhält eine Rüge." },
        { label: "Wegsehen", desc: "Du mischst dich nicht ein.", fx: { glueck:-8, ruf:-5, soziales:-3 }, side: "Das schlechte Gewissen bleibt." },
      ]
    },
    {
      id: "k3", title: "Zeugnis-Überraschung", cat: "bildung",
      story: "Dein Halbjahreszeugnis kommt. Die Noten sind... gemischt.",
      options: [
        { label: "Nachhilfe nehmen", desc: "Samstags extra Unterricht in Mathe und Deutsch.", fx: { bildung:14, glueck:-3, soziales:-4 }, side: "Nächstes Zeugnis deutlich besser." },
        { label: "Eltern um Hilfe bitten", desc: "Gemeinsam lernen am Küchentisch.", fx: { bildung:8, glueck:5, soziales:6 }, side: "Die Familienzeit stärkt euch." },
        { label: "Gar nichts ändern", desc: "Wird schon irgendwie klappen.", fx: { glueck:3, bildung:-6, ruf:-4 }, side: "Die Probleme verschieben sich nur." },
      ]
    },
    {
      id: "k4", title: "Ferienlager", cat: "soziales",
      story: "Deine Schule bietet ein zweiwöchiges Ferienlager in den Bergen an.",
      options: [
        { label: "Begeistert mitfahren", desc: "Abenteuer, neue Freunde, Lagerfeuer.", fx: { glueck:12, soziales:10, gesundheit:5 }, side: "Du schließt Freundschaften fürs Leben." },
        { label: "Zuhause bleiben", desc: "Du magst dein gewohntes Umfeld lieber.", fx: { glueck:-3, soziales:-5, bildung:4 }, side: "Mehr Zeit für deine Hobbys." },
        { label: "Kurztrip: nur 1 Woche", desc: "Kompromiss: halb dabei sein.", fx: { glueck:6, soziales:4, gesundheit:3 }, side: "Genug Abstand, aber auch neue Eindrücke." },
      ]
    },
    {
      id: "k5", title: "Haustier", cat: "hobby",
      story: "Deine Eltern erlauben dir ein Haustier. Du musst dich entscheiden.",
      options: [
        { label: "Einen Hund", desc: "Viel Verantwortung, aber treuer Begleiter.", fx: { glueck:10, gesundheit:8, soziales:5, reichtum:-2 }, side: "Tägliche Spaziergänge bringen dich raus." },
        { label: "Eine Katze", desc: "Unabhängig und gemütlich.", fx: { glueck:8, bildung:2, soziales:2 }, side: "Die Katze wird dein stiller Vertrauter." },
        { label: "Kein Haustier", desc: "Du willst keine Verantwortung übernehmen.", fx: { reichtum:3, bildung:3, glueck:-2 }, side: "Mehr Freizeit für andere Dinge." },
      ]
    },
  ],

  jugend: [
    {
      id: "j1", title: "Die erste Liebe", cat: "soziales",
      story: "In der 9. Klasse verlierst du dein Herz. Die Person deiner Träume ist in deiner Klasse.",
      options: [
        { label: "Gefühle gestehen", desc: "Du fasst dir ein Herz und sprichst es offen aus.", fx: { glueck:12, soziales:8, ruf:5 }, side: "Was auch immer passiert — du bereust es nicht." },
        { label: "Abwarten & beobachten", desc: "Du wartest auf ein Zeichen.", fx: { glueck:-4, soziales:2, bildung:3 }, side: "Die Chance verstreicht langsam." },
        { label: "Fokus aufs Lernen", desc: "Erst der Abschluss, dann das Herz.", fx: { bildung:10, glueck:-3, soziales:-3 }, side: "Noten werden besser, Einsamkeit auch." },
      ]
    },
    {
      id: "j2", title: "Berufspraktikum", cat: "career",
      story: "Das zweiwöchige Schulpraktikum steht an. Wohin gehst du?",
      options: [
        { label: "Arztpraxis", desc: "Medizin hautnah erleben.", fx: { bildung:10, ruf:8, gesundheit:3, reichtum:2 }, side: "Dein Interesse an Medizin wächst." },
        { label: "Tech-Startup", desc: "Computer, Code und Kicker-Tisch.", fx: { bildung:9, reichtum:4, soziales:5 }, side: "Du lernst die Startup-Welt kennen." },
        { label: "Handwerksbetrieb", desc: "Schrauben, Hämmern, echte Arbeit.", fx: { gesundheit:6, reichtum:5, ruf:4, bildung:3 }, side: "Du lernst praktische Fähigkeiten." },
        { label: "Medienagentur", desc: "Kreativität, Fotos, Social Media.", fx: { soziales:8, ruf:6, glueck:7, bildung:4 }, side: "Du entdeckst dein kreatives Talent." },
      ]
    },
    {
      id: "j3", title: "Peer Pressure", cat: "soziales",
      story: "Auf einer Partei bieten dir ältere Schüler Alkohol und Zigaretten an.",
      options: [
        { label: "Ablehnen", desc: "Du bleibst standhaft und klar.", fx: { gesundheit:8, ruf:4, glueck:3, soziales:-3 }, side: "Deine echten Freunde respektieren das." },
        { label: "Einmal probieren", desc: "Du willst dazugehören.", fx: { soziales:6, gesundheit:-8, ruf:2, glueck:2 }, side: "Du wirst in die Gruppe aufgenommen." },
        { label: "Party früh verlassen", desc: "Du gehst einfach nach Hause.", fx: { gesundheit:5, glueck:-2, soziales:-6 }, side: "Du vermeidest unangenehme Situationen." },
      ]
    },
    {
      id: "j4", title: "Schulabschluss-Kurs", cat: "bildung",
      story: "Im letzten Schuljahr: Welchen Schwerpunkt legst du?",
      options: [
        { label: "Naturwissenschaften", desc: "Mathe, Physik, Chemie — Vollgas.", fx: { bildung:14, reichtum:4, glueck:-2, soziales:-3 }, side: "Türen zu technischen Berufen öffnen sich." },
        { label: "Sprachen & Kunst", desc: "Literatur, Fremdsprachen, kreatives Schreiben.", fx: { bildung:10, soziales:8, ruf:6, glueck:5 }, side: "Kommunikation wird deine Stärke." },
        { label: "Wirtschaft", desc: "BWL, Mathe, Recht als Vorbereitung.", fx: { bildung:11, reichtum:7, ruf:4, soziales:2 }, side: "Du denkst früh wirtschaftlich." },
      ]
    },
    {
      id: "j5", title: "Nebenjob", cat: "wealth",
      story: "Du könntest dir etwas dazuverdienen. Was tust du?",
      options: [
        { label: "Supermarkt-Kassierer", desc: "Zuverlässig, langweilig, aber bezahlt.", fx: { reichtum:10, soziales:4, glueck:-3, bildung:-2 }, side: "Du lernst mit Geld umzugehen." },
        { label: "Nachhilfe geben", desc: "Jüngeren Schülern helfen.", fx: { bildung:8, reichtum:7, ruf:6, soziales:5 }, side: "Du vertiefst dein eigenes Wissen." },
        { label: "Kein Job", desc: "Schule ist genug.", fx: { bildung:6, glueck:4, gesundheit:3, reichtum:-3 }, side: "Mehr Zeit für dich selbst." },
      ]
    },
  ],

  jung: [
    {
      id: "jA1", title: "Nach dem Abi: Wohin?", cat: "education",
      story: "Der Abschluss ist in der Tasche. Deine Zukunft liegt offen vor dir.",
      options: [
        { label: "Studium beginnen", desc: "Universität, Semesterbeginn im Oktober.", fx: { bildung:16, reichtum:-5, soziales:8, ruf:6 }, side: "Du öffnest Türen in akademische Berufe." },
        { label: "Ausbildung machen", desc: "Praxisnah, Geld verdienen, schnell fertig.", fx: { reichtum:8, bildung:8, gesundheit:3, soziales:5 }, side: "Du bist früher finanziell unabhängig." },
        { label: "Work & Travel", desc: "Ein Jahr Australien, Neuseeland oder Kanada.", fx: { glueck:14, soziales:10, bildung:4, reichtum:-4 }, side: "Horizont und Weltbild erweitern sich massiv." },
        { label: "Eigenes Projekt", desc: "Du gründest mit 18 dein erstes kleines Business.", fx: { reichtum:6, ruf:8, bildung:5, glueck:8 }, side: "Unternehmergeist erwacht früh in dir." },
      ]
    },
    {
      id: "jA2", title: "Erste eigene Wohnung", cat: "housing",
      story: "Du ziehst zum ersten Mal aus dem Elternhaus aus. Wie?",
      options: [
        { label: "WG in der Innenstadt", desc: "Drei Mitbewohner, kleines Zimmer, viel Leben.", fx: { soziales:12, glueck:8, reichtum:-4, gesundheit:-2 }, side: "Du lernst Menschen aus allen Lebenswelten kennen.", housing: "WG-Zimmer" },
        { label: "Kleine 1-Zimmer-Wohnung", desc: "Dein eigenes Reich, endlich Ruhe.", fx: { glueck:7, bildung:5, reichtum:-6, soziales:-3 }, side: "Du lernst früh Selbstständigkeit.", housing: "1-Zimmer-Wohnung" },
        { label: "Beim Eltern wohnen", desc: "Sparen, sparen, sparen.", fx: { reichtum:10, glueck:-4, soziales:-6, bildung:4 }, side: "Dein Konto wächst schnell.", housing: "Elternhaus" },
      ]
    },
    {
      id: "jA3", title: "Erster ernsthafter Job", cat: "career",
      story: "Du bewirbst dich auf verschiedene Stellen. Drei Angebote liegen vor dir.",
      options: [
        { label: "Großkonzern", desc: "Sicherheit, Struktur, gutes Gehalt.", fx: { reichtum:12, ruf:6, bildung:5, glueck:-4, soziales:3 }, side: "Du wirst Rädchen in einem großen System.", career: "Konzern-Angestellter" },
        { label: "NGO / Soziale Arbeit", desc: "Weniger Geld, mehr Sinn.", fx: { glueck:12, ruf:10, soziales:10, reichtum:-5 }, side: "Du findest Erfüllung in deiner Arbeit.", career: "Sozialarbeiter" },
        { label: "Freelancer", desc: "Eigene Projekte, eigene Zeit.", fx: { glueck:9, reichtum:4, bildung:6, soziales:-2 }, side: "Freiheit hat ihren Preis.", career: "Freelancer" },
      ]
    },
    {
      id: "jA4", title: "Politische Haltung", cat: "politics",
      story: "Die ersten Bundestagswahlen, an denen du teilnimmst. Wie positionierst du dich?",
      options: [
        { label: "Links-progressiv", desc: "Klimaschutz, soziale Gerechtigkeit, Vielfalt.", fx: { soziales:8, ruf:5, glueck:4 }, side: "Du wirst politisch aktiv.", politics: "Links-progressiv" },
        { label: "Liberal-marktwirtschaftlich", desc: "Freiheit, Eigenverantwortung, Wachstum.", fx: { reichtum:6, bildung:4, ruf:4 }, side: "Du denkst wirtschaftlich.", politics: "Liberal" },
        { label: "Konservativ-traditionell", desc: "Stabilität, Familie, Tradition.", fx: { soziales:4, ruf:6, glueck:3 }, side: "Werte und Beständigkeit leiten dich.", politics: "Konservativ" },
        { label: "Politisch desinteressiert", desc: "Du nimmst kaum Anteil am Politikbetrieb.", fx: { glueck:3, soziales:-3, ruf:-4 }, side: "Du konzentrierst dich auf dein Privatleben.", politics: "Unpolitisch" },
      ]
    },
    {
      id: "jA5", title: "Erste große Beziehung", cat: "soziales",
      story: "Du hast jemanden kennengelernt, der dein Herz höher schlagen lässt. Alles fühlt sich anders an.",
      options: [
        { label: "Voll darauf einlassen", desc: "Zusammenziehen, Pläne schmieden.", fx: { glueck:12, soziales:10, reichtum:-3, bildung:-3 }, side: "Erste gemeinsame Wohnung.", partner: "Partner" },
        { label: "Langsam angehen", desc: "Erst kennenlernen, dann Entscheidungen treffen.", fx: { glueck:7, soziales:6, bildung:3 }, side: "Die Basis wird solider." },
        { label: "Single bleiben", desc: "Freiheit über alles — jetzt noch nicht.", fx: { glueck:4, bildung:6, reichtum:4, soziales:-4 }, side: "Du investierst in dich selbst." },
      ]
    },
    {
      id: "jA6", title: "Städte-Entscheidung", cat: "housing",
      story: "Du könntest in eine andere Stadt ziehen. Ein Jobangebot liegt aus München, Hamburg oder Berlin.",
      options: [
        { label: "München", desc: "Wirtschaft, Bayern, hohe Mieten.", fx: { reichtum:8, ruf:6, glueck:4, soziales:3 }, side: "Teuer, aber Karriere macht Sinn.", location: "München" },
        { label: "Hamburg", desc: "Hafen, Kultur, norddeutscher Charme.", fx: { glueck:9, soziales:8, ruf:5, reichtum:3 }, side: "Die Stadt passt zu dir.", location: "Hamburg" },
        { label: "Berlin", desc: "Kreativ, günstig, pulsierend.", fx: { glueck:11, soziales:10, bildung:6, reichtum:-2 }, side: "Niemals langweilig.", location: "Berlin" },
        { label: "Heimatstadt bleiben", desc: "Familie und Vertrautes.", fx: { glueck:6, soziales:8, reichtum:5, bildung:-2 }, side: "Wurzeln halten dich." },
      ]
    },
  ],

  mitte: [
    {
      id: "m1", title: "Karriere-Weichenstellung", cat: "career",
      story: "Dein Chef bietet dir eine Führungsposition an — mehr Verantwortung, mehr Gehalt, weniger Freizeit.",
      options: [
        { label: "Annehmen", desc: "Aufstieg, Prestige, lange Tage.", fx: { reichtum:16, ruf:12, glueck:-4, gesundheit:-5, soziales:-3 }, side: "Du wirst zur Führungspersönlichkeit." },
        { label: "Ablehnen & Experte bleiben", desc: "Lieber Tiefe als Breite.", fx: { bildung:10, glueck:6, gesundheit:5, reichtum:4 }, side: "Du wirst zum unangefochtenen Spezialisten." },
        { label: "Kündigen & neu starten", desc: "Wenn nicht jetzt — wann dann?", fx: { glueck:10, reichtum:-8, ruf:4, soziales:5 }, side: "Ein riskanter, aber ehrlicher Schritt." },
      ]
    },
    {
      id: "m2", title: "Hauskauf", cat: "housing",
      story: "Die Zinsen sind günstig, das Angebot gut. Kaufst du eine Immobilie?",
      options: [
        { label: "Haus kaufen", desc: "Kredit, aber eigene vier Wände.", fx: { ruf:10, reichtum:-6, glueck:9, soziales:4 }, side: "Du investierst in deine Zukunft.", housing: "Eigenheim" },
        { label: "Eigentumswohnung", desc: "Kleiner, aber ebenfalls Eigentum.", fx: { ruf:7, reichtum:-3, glueck:7 }, side: "Vernünftiger Kompromiss.", housing: "Eigentumswohnung" },
        { label: "Weiter mieten", desc: "Flexibel bleiben, Kapital anlegen.", fx: { reichtum:5, glueck:3, soziales:2 }, side: "Freiheit bleibt erhalten." },
      ]
    },
    {
      id: "m3", title: "Kinder?", cat: "soziales",
      story: "Die große Frage steht im Raum: Familie gründen oder nicht?",
      options: [
        { label: "Ja, jetzt ist die Zeit", desc: "Alles andere wird warten müssen.", fx: { glueck:14, soziales:12, reichtum:-8, gesundheit:-4, bildung:-3 }, side: "Dein Leben ändert sich für immer.", kinder: 1 },
        { label: "Noch warten", desc: "Erst noch mehr erreichen.", fx: { bildung:6, reichtum:6, glueck:-3 }, side: "Der richtige Zeitpunkt kommt." },
        { label: "Nein, bewusst kinderfrei", desc: "Eine gültige, überlegte Entscheidung.", fx: { glueck:7, reichtum:8, bildung:5, soziales:-2 }, side: "Du lebst dein Leben nach deinen Bedingungen." },
      ]
    },
    {
      id: "m4", title: "Gesundheitscheck", cat: "health",
      story: "Beim Arzt wird ein erhöhter Blutdruck festgestellt. Du bist 40.",
      options: [
        { label: "Lebensstil ändern", desc: "Sport, Ernährung, weniger Stress.", fx: { gesundheit:14, glueck:6, reichtum:-3, bildung:3 }, side: "Du fühlst dich 10 Jahre jünger." },
        { label: "Tabletten nehmen", desc: "Medikamente lösen das akut.", fx: { gesundheit:7, reichtum:-2, glueck:-2 }, side: "Das Symptom wird behandelt." },
        { label: "Ignorieren", desc: "Wird schon gut gehen.", fx: { gesundheit:-12, glueck:-4, reichtum:-5 }, side: "Ein Risiko mit Folgen." },
      ]
    },
    {
      id: "m5", title: "Seitensprung-Versuchung", cat: "soziales",
      story: "Du bist gebunden, aber es gibt eine Situation, die das auf die Probe stellt.",
      options: [
        { label: "Treu bleiben", desc: "Loyalität über Verlockung.", fx: { glueck:5, ruf:8, soziales:6 }, side: "Das Vertrauen bleibt ungebrochen." },
        { label: "Auf Abstand gehen", desc: "Die Situation meiden, nicht eskalieren lassen.", fx: { glueck:3, ruf:5, soziales:3 }, side: "Du schützt das, was du hast." },
        { label: "Der Versuchung nachgeben", desc: "Ein Fehler, den du nicht rückgängig machen kannst.", fx: { glueck:-10, ruf:-12, soziales:-15 }, side: "Es fliegt auf. Konsequenzen folgen." },
      ]
    },
    {
      id: "m6", title: "Weiterbildung", cat: "education",
      story: "Du könntest nebenberuflich einen MBA oder ein Zertifikat erwerben.",
      options: [
        { label: "MBA berufsbegleitend", desc: "2 Jahre, hart, aber wertvoll.", fx: { bildung:16, reichtum:6, glueck:-4, gesundheit:-4, soziales:-5 }, side: "Karrieresprung von einer Ebene." },
        { label: "Online-Kurse", desc: "Flexibel und günstig.", fx: { bildung:9, reichtum:3, glueck:2, gesundheit:2 }, side: "Du bleibst aktuell." },
        { label: "Abendkurse vor Ort", desc: "Netzwerk & Lernen kombiniert.", fx: { bildung:10, soziales:7, reichtum:4 }, side: "Du lernst interessante Menschen." },
        { label: "Nichts", desc: "Erfahrung ist genug.", fx: { glueck:4, gesundheit:3, reichtum:2 }, side: "Du konzentrierst dich auf das Wesentliche." },
      ]
    },
    {
      id: "m7", title: "Investitionsentscheidung", cat: "wealth",
      story: "Du hast 20.000€ gespart. Was tust du damit?",
      options: [
        { label: "Aktien & ETFs", desc: "Langfristig in den Markt investieren.", fx: { reichtum:12, bildung:4, glueck:2 }, side: "Das Kapital arbeitet für dich." },
        { label: "Immobilie vermieten", desc: "Zweite Wohnung kaufen und vermieten.", fx: { reichtum:10, ruf:6, glueck:3, gesundheit:-2 }, side: "Passives Einkommen entsteht." },
        { label: "Eigenes Business", desc: "Ein kleines Unternehmen gründen.", fx: { reichtum:8, ruf:10, glueck:10, gesundheit:-5 }, side: "Riskant, aber erfüllend." },
        { label: "Auf Tagesgeld lassen", desc: "Sicherheit über Rendite.", fx: { reichtum:4, glueck:3, gesundheit:2 }, side: "Kein Risiko, aber auch wenig Gewinn." },
      ]
    },
    {
      id: "m8", title: "Ehrenamtliches Engagement", cat: "soziales",
      story: "Eine lokale Initiative sucht freiwillige Helfer.",
      options: [
        { label: "Regelmäßig mitmachen", desc: "Jeden zweiten Samstag für andere da sein.", fx: { ruf:12, glueck:10, soziales:10, reichtum:-2 }, side: "Du wirst zum Gesicht der Initiative." },
        { label: "Gelegentlich helfen", desc: "Wenn Zeit ist, springst du ein.", fx: { ruf:5, glueck:5, soziales:5 }, side: "Kleine Beiträge, große Wirkung." },
        { label: "Spenden statt Zeit", desc: "Finanziell unterstützen.", fx: { ruf:4, reichtum:-3, glueck:3 }, side: "Du gibst, was du kannst." },
      ]
    },
  ],

  rente: [
    {
      id: "r1", title: "Ruhestand gestalten", cat: "hobby",
      story: "Der erste Tag der Rente. 40 Jahre Arbeit liegen hinter dir. Was nun?",
      options: [
        { label: "Reisen & entdecken", desc: "Alle Träume endlich leben.", fx: { glueck:14, gesundheit:5, reichtum:-8, soziales:8 }, side: "Die Welt wartet auf dich." },
        { label: "Garten & Enkelpflege", desc: "Das ruhige, erfüllte Leben.", fx: { glueck:12, gesundheit:8, soziales:10 }, side: "Du wirst gebraucht und geliebt." },
        { label: "Weiter arbeiten", desc: "Beratend tätig bleiben.", fx: { reichtum:8, ruf:8, bildung:5, gesundheit:-3 }, side: "Du bleibst geistig aktiv." },
      ]
    },
    {
      id: "r2", title: "Gesundheit im Alter", cat: "health",
      story: "Mit 68 merkt man, was man dem Körper zumuten kann. Der Arzt empfiehlt Veränderungen.",
      options: [
        { label: "Aktiver Lebensstil", desc: "Nordic Walking, Schwimmen, Yoga.", fx: { gesundheit:14, glueck:8, soziales:6 }, side: "Du überraschst alle mit deiner Vitalität." },
        { label: "Gemäßigte Aktivität", desc: "Spaziergänge und gesunde Ernährung.", fx: { gesundheit:8, glueck:6, soziales:4 }, side: "Ein gutes Gleichgewicht." },
        { label: "Es ruhig nehmen", desc: "Couch, TV, entspannen.", fx: { gesundheit:-6, glueck:3, soziales:-3 }, side: "Der Körper dankt es weniger." },
      ]
    },
    {
      id: "r3", title: "Erbschaft & Testament", cat: "wealth",
      story: "Du denkst daran, was nach dir kommt. Zeit, eine Entscheidung zu treffen.",
      options: [
        { label: "Alles den Kindern", desc: "Familie zuerst.", fx: { ruf:10, glueck:8, soziales:8 }, side: "Dein Lebenswerk lebt weiter." },
        { label: "Hälfte spenden", desc: "Ein Teil an eine gute Organisation.", fx: { ruf:14, glueck:10, soziales:10 }, side: "Dein Name wird erinnert." },
        { label: "Auf Reisen ausgeben", desc: "Was man hat, soll man genießen.", fx: { glueck:14, reichtum:-12, soziales:5 }, side: "Du lebst das Leben in vollen Zügen." },
      ]
    },
    {
      id: "r4", title: "Lebensrückblick", cat: "soziales",
      story: "Ein Journalist möchte deine Geschichte aufschreiben. Du reflektierst.",
      options: [
        { label: "Ja, die Geschichte erzählen", desc: "Dein Leben als Inspiration für andere.", fx: { ruf:14, glueck:10, soziales:8 }, side: "Du wirst Teil einer größeren Erzählung." },
        { label: "Privatleben schützen", desc: "Manche Dinge bleiben für sich.", fx: { glueck:6, ruf:4, bildung:3 }, side: "Du bewahrst deine Würde." },
        { label: "Memoiren schreiben", desc: "Selbst die Feder in die Hand nehmen.", fx: { bildung:10, ruf:12, glueck:9 }, side: "Dein Buch erscheint nächstes Jahr." },
      ]
    },
    {
      id: "r5", title: "Umzug im Alter", cat: "housing",
      story: "Das große Haus ist zu groß geworden. Was kommt als Nächstes?",
      options: [
        { label: "Seniorenresidenz", desc: "Komfort, Betreuung, Gemeinschaft.", fx: { gesundheit:8, soziales:10, glueck:6, reichtum:-5 }, side: "Du bist nicht mehr allein.", housing: "Seniorenresidenz" },
        { label: "Zu den Kindern ziehen", desc: "Drei Generationen unter einem Dach.", fx: { glueck:10, soziales:12, ruf:6 }, side: "Familie als Heimat.", housing: "Bei Familie" },
        { label: "Kleinere Wohnung", desc: "Weniger ist mehr.", fx: { glueck:7, reichtum:6, gesundheit:4 }, side: "Du behältst deine Unabhängigkeit.", housing: "Kleine Seniorenwohnung" },
      ]
    },
  ],
};

// Zufällige Weltevents
const WORLD_EVENTS = [
  "Wirtschaftskrise erschüttert den Markt.",
  "Technologieboom verändert die Arbeitswelt.",
  "Pandemie legt das öffentliche Leben lahm.",
  "Klimaproteste dominieren die Schlagzeilen.",
  "Wohnungspreise steigen auf Rekordhoch.",
  "Digitalisierung erfasst alle Branchen.",
  "Politische Wahlen polarisieren die Gesellschaft.",
  "KI-Revolution verändert Berufsbilder.",
  "Demografischer Wandel verschärft Pflegenotstand.",
  "Inflation frisst Ersparnisse auf.",
  null, null, null, null, // meistens kein Weltgeschehen
];

// ─────────────────────────────────────────────────────────────────────────────
// HILFSFUNKTIONEN
// ─────────────────────────────────────────────────────────────────────────────
function clamp(v) { return Math.max(0, Math.min(100, Math.round(v))); }
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function getDecisionPool(char) {
  const phase = getPhase(char.age);
  const pool = DECISIONS[phase.id] || [];
  // Filter bereits gezeigte (maximal 2x dieselbe)
  const counts = {};
  char.shownDecisions?.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
  const available = pool.filter(d => (counts[d.id] || 0) < 2);
  return available.length > 0 ? available : pool;
}

function pickDecision(char) {
  const pool = getDecisionPool(char);
  const d = rand(pool);
  const worldEvent = rand(WORLD_EVENTS);
  return { ...d, worldEvent };
}

function initChar(name, gender) {
  return {
    name, gender,
    age: 6,
    worldYear: new Date().getFullYear() - 14,
    stats: { glueck: 65, gesundheit: 75, reichtum: 20, bildung: 15, soziales: 50, ruf: 30 },
    career: null, education: null, location: "Heimatstadt",
    housing: "Elternhaus", politics: null, partner: null, children: 0,
    events: [], shownDecisions: [], alive: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// KOMPONENTEN
// ─────────────────────────────────────────────────────────────────────────────

function StatPill({ statKey, value, prevValue }) {
  const cfg = STATS[statKey];
  const diff = prevValue !== undefined ? value - prevValue : 0;
  return (
    <div style={{ flex: "1 1 30%", minWidth: 90 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: 0.5 }}>
          <span style={{ color: cfg.color, marginRight: 4 }}>{cfg.icon}</span>
          {cfg.label.toUpperCase()}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
          {value}
          {diff !== 0 && (
            <span style={{ fontSize: 10, color: diff > 0 ? T.green : T.red, marginLeft: 3 }}>
              {diff > 0 ? `+${diff}` : diff}
            </span>
          )}
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: T.subtle, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 2, width: `${value}%`,
          background: cfg.color, transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
        }} />
      </div>
    </div>
  );
}

// ── Charakter-Erstellung ──────────────────────────────────────────────────────
function CreateScreen({ onCreate }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("männlich");
  const [err, setErr] = useState("");

  return (
    <div style={{
      minHeight: "100dvh", background: T.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px 20px", boxSizing: "border-box",
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22, margin: "0 auto 16px",
          background: `linear-gradient(135deg, ${T.accent}, #A78BFF)`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34,
          boxShadow: `0 20px 60px rgba(124,111,255,0.35)`,
        }}>🌍</div>
        <h1 style={{
          fontSize: 34, fontWeight: 800, color: T.text, margin: "0 0 8px",
          letterSpacing: -1.5, lineHeight: 1.1,
        }}>Lebensweg</h1>
        <p style={{ color: T.muted, fontSize: 15, margin: 0, lineHeight: 1.6 }}>
          Forme ein ganzes Leben durch<br />deine Entscheidungen.
        </p>
      </div>

      {/* Form */}
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: T.muted, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            Name des Charakters
          </label>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setErr(""); }}
            onKeyDown={e => e.key === "Enter" && name.trim() && onCreate(name.trim(), gender)}
            placeholder="z. B. Lisa Meier"
            style={{
              width: "100%", padding: "15px 16px", borderRadius: 14,
              background: T.surface, border: `1px solid ${T.border}`,
              color: T.text, fontSize: 16, outline: "none", boxSizing: "border-box",
              WebkitAppearance: "none",
            }}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ display: "block", color: T.muted, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            Geschlecht
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[["männlich","♂"],["weiblich","♀"],["divers","⚧"]].map(([g, ico]) => (
              <button key={g} onClick={() => setGender(g)} style={{
                padding: "12px 4px", borderRadius: 12, cursor: "pointer", border: "none",
                background: gender === g ? T.accent : T.surface,
                color: gender === g ? "#fff" : T.muted,
                fontSize: 13, fontWeight: gender === g ? 700 : 500,
                transition: "all 0.2s",
              }}>
                {ico} {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {err && <p style={{ color: T.red, fontSize: 13, marginBottom: 12, textAlign: "center" }}>{err}</p>}

        <button
          onClick={() => name.trim() ? onCreate(name.trim(), gender) : setErr("Bitte einen Namen eingeben.")}
          style={{
            width: "100%", padding: "17px", borderRadius: 16, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${T.accent}, #A78BFF)`,
            color: "#fff", fontSize: 17, fontWeight: 700,
            boxShadow: `0 12px 40px rgba(124,111,255,0.4)`,
            transition: "transform 0.15s, box-shadow 0.15s",
            letterSpacing: 0.3,
          }}
          onTouchStart={e => e.currentTarget.style.transform = "scale(0.97)"}
          onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
        >
          Leben beginnen →
        </button>
      </div>

      <p style={{ color: T.muted, fontSize: 12, marginTop: 32, opacity: 0.5, textAlign: "center" }}>
        Kein API-Key · Läuft vollständig offline
      </p>
    </div>
  );
}

// ── Entscheidungs-Karte ───────────────────────────────────────────────────────
function DecisionCard({ decision, char, onChoose, animating }) {
  const [chosen, setChosen] = useState(null);
  const [pressed, setPressed] = useState(null);

  useEffect(() => { setChosen(null); }, [decision?.id]);

  if (!decision) return null;

  const catColors = {
    career: T.gold, education: T.accent, housing: "#4ECFA6",
    politics: "#FF9F7C", soziales: "#EC8FD0", health: T.red,
    wealth: "#4ECFA6", hobby: "#A8D8EA",
  };
  const catColor = catColors[decision.category] || T.accent;

  return (
    <div style={{
      opacity: animating ? 0 : 1, transform: animating ? "translateY(10px)" : "translateY(0)",
      transition: "opacity 0.35s, transform 0.35s",
    }}>
      {/* Kategorie + Weltgeschehen */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase",
          color: catColor, background: `${catColor}18`,
          padding: "4px 10px", borderRadius: 20, border: `1px solid ${catColor}30`,
        }}>
          {decision.category}
        </span>
        {decision.worldEvent && (
          <span style={{
            fontSize: 11, color: T.gold, background: T.goldDim,
            padding: "4px 10px", borderRadius: 20, border: `1px solid ${T.gold}30`,
          }}>
            🌐 {decision.worldEvent}
          </span>
        )}
      </div>

      {/* Titel & Story */}
      <h2 style={{ color: T.text, fontSize: 20, fontWeight: 700, margin: "0 0 10px", lineHeight: 1.3, letterSpacing: -0.5 }}>
        {decision.title}
      </h2>
      <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, margin: "0 0 20px" }}>
        {decision.story}
      </p>

      {/* Optionen */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {decision.options.map((opt, i) => {
          const isChosen = chosen === i;
          const isDimmed = chosen !== null && !isChosen;
          return (
            <button key={i}
              disabled={chosen !== null}
              onClick={() => { setChosen(i); setTimeout(() => onChoose(opt), 500); }}
              onTouchStart={() => setPressed(i)}
              onTouchEnd={() => setPressed(null)}
              style={{
                textAlign: "left", padding: "14px 16px", borderRadius: 14,
                border: `1.5px solid ${isChosen ? catColor : pressed === i ? `${catColor}50` : T.border}`,
                background: isChosen ? `${catColor}12` : pressed === i ? T.subtle : T.surface,
                opacity: isDimmed ? 0.35 : 1,
                transition: "all 0.18s", cursor: chosen === null ? "pointer" : "default",
                outline: "none",
              }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{
                  flexShrink: 0, width: 26, height: 26, borderRadius: "50%",
                  background: isChosen ? catColor : T.subtle,
                  color: isChosen ? "#fff" : T.muted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, marginTop: 1,
                }}>
                  {isChosen ? "✓" : i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                    {opt.label}
                  </div>
                  <div style={{ color: T.muted, fontSize: 12, lineHeight: 1.5 }}>
                    {opt.desc}
                  </div>
                  {opt.side && (
                    <div style={{ color: T.gold, fontSize: 11, marginTop: 6, fontStyle: "italic" }}>
                      ⚡ {opt.side}
                    </div>
                  )}
                  {/* Effekte */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                    {Object.entries(opt.fx || {}).filter(([,v]) => v !== 0).map(([k, v]) => (
                      <span key={k} style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 8,
                        color: v > 0 ? T.green : T.red,
                        background: v > 0 ? "rgba(78,207,166,0.1)" : "rgba(255,107,107,0.1)",
                      }}>
                        {v > 0 ? "+" : ""}{v} {STATS[k]?.label || k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Tod-Screen ────────────────────────────────────────────────────────────────
function DeathScreen({ char, onRestart }) {
  return (
    <div style={{
      minHeight: "100dvh", background: T.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "32px 20px", boxSizing: "border-box",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🕊️</div>
          <h1 style={{ color: T.text, fontSize: 28, fontWeight: 800, marginBottom: 6, letterSpacing: -1 }}>
            {char.name}
          </h1>
          <p style={{ color: T.muted, fontSize: 15, margin: 0 }}>
            {char.worldYear - char.age + 6} – {char.worldYear} · {char.age} Jahre
          </p>
        </div>

        {/* Stats */}
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 18, padding: 20, marginBottom: 16,
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {Object.entries(char.stats).map(([k, v]) => (
              <StatPill key={k} statKey={k} value={v} />
            ))}
          </div>
        </div>

        {/* Profil */}
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 18, padding: 20, marginBottom: 24,
        }}>
          {[
            ["Beruf", char.career || "—"],
            ["Wohnort", char.location],
            ["Unterkunft", char.housing],
            ["Politik", char.politics || "—"],
            ["Partner", char.partner || "—"],
            ["Kinder", char.children],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: "flex", justifyContent: "space-between",
              padding: "9px 0", borderBottom: `1px solid ${T.border}`,
            }}>
              <span style={{ color: T.muted, fontSize: 13 }}>{k}</span>
              <span style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{String(v)}</span>
            </div>
          ))}
        </div>

        <button onClick={onRestart} style={{
          width: "100%", padding: "17px", borderRadius: 16, border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${T.accent}, #A78BFF)`,
          color: "#fff", fontSize: 17, fontWeight: 700,
          boxShadow: `0 12px 40px rgba(124,111,255,0.4)`,
        }}>
          Neues Leben starten
        </button>
      </div>
    </div>
  );
}

// ── Hauptspiel ────────────────────────────────────────────────────────────────
function GameScreen({ char, setChar, onDeath }) {
  const [decision, setDecision] = useState(null);
  const [prevStats, setPrevStats] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [tab, setTab] = useState("play"); // play | stats | log

  useEffect(() => {
    if (!decision) setDecision(pickDecision(char));
  }, []);

  const handleChoose = useCallback((opt) => {
    setAnimating(true);
    setTimeout(() => {
      const ageDelta = randInt(2, 5);
      const newAge = char.age + ageDelta;
      const newYear = char.worldYear + ageDelta;

      // Stats
      const newStats = {};
      for (const k of Object.keys(char.stats)) {
        newStats[k] = clamp((char.stats[k] || 0) + (opt.fx?.[k] || 0));
      }

      // Zusatz-Updates aus Option
      const updates = {};
      if (opt.career)   updates.career   = opt.career;
      if (opt.housing)  updates.housing  = opt.housing;
      if (opt.location) updates.location = opt.location;
      if (opt.politics) updates.politics = opt.politics;
      if (opt.partner)  updates.partner  = opt.partner;
      if (opt.kinder)   updates.children = (char.children || 0) + opt.kinder;

      const eventText = `${char.age}–${newAge}: ${opt.label}`;
      const newShown = [...(char.shownDecisions || []), decision.id];

      const newChar = {
        ...char, ...updates,
        age: newAge, worldYear: newYear,
        stats: newStats,
        events: [...char.events, eventText],
        shownDecisions: newShown,
      };

      // Tod-Check
      const deathProb = newAge > 75 ? (newAge - 70) * 3 : newStats.gesundheit < 8 ? 50 : 0;
      if (newAge >= 92 || (deathProb > 0 && randInt(0, 99) < deathProb)) {
        newChar.alive = false;
        setChar(newChar);
        onDeath();
        return;
      }

      setPrevStats(char.stats);
      setChar(newChar);
      const next = pickDecision(newChar);
      setDecision(next);
      setAnimating(false);
    }, 350);
  }, [char, decision]);

  const phase = getPhase(char.age);

  return (
    <div style={{
      minHeight: "100dvh", background: T.bg, display: "flex", flexDirection: "column",
      fontFamily: "'Inter', system-ui, sans-serif", maxWidth: 480, margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: T.bg, borderBottom: `1px solid ${T.border}`,
        padding: "12px 16px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: `linear-gradient(135deg, ${T.accent}, #A78BFF)`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>
              {char.gender === "weiblich" ? "👩" : char.gender === "divers" ? "🧑" : "👨"}
            </div>
            <div>
              <div style={{ color: T.text, fontSize: 15, fontWeight: 700 }}>{char.name}</div>
              <div style={{ color: T.muted, fontSize: 12 }}>
                {phase.emoji} {char.age} J. · {phase.label} · {char.location}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: T.accent, fontSize: 18, fontWeight: 800 }}>{char.worldYear}</div>
            <div style={{ color: T.muted, fontSize: 10 }}>JAHR</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            {PHASES.map(p => (
              <span key={p.id} style={{
                fontSize: 16, opacity: p.id === phase.id ? 1 : char.age > p.range[1] ? 0.4 : 0.15,
                transition: "opacity 0.3s",
              }}>{p.emoji}</span>
            ))}
          </div>
          <div style={{ height: 3, borderRadius: 2, background: T.subtle }}>
            <div style={{
              height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${T.accent}, #A78BFF)`,
              width: `${Math.min((char.age / 90) * 100, 100)}%`, transition: "width 0.6s ease",
            }} />
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{
        display: "flex", borderBottom: `1px solid ${T.border}`,
        background: T.bg,
      }}>
        {[["play","▶ Spielen"],["stats","◈ Werte"],["log","📜 Chronik"]].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "11px 4px", border: "none", cursor: "pointer",
            background: "transparent",
            color: tab === t ? T.accent : T.muted,
            fontSize: 12, fontWeight: tab === t ? 700 : 500,
            borderBottom: tab === t ? `2px solid ${T.accent}` : "2px solid transparent",
            transition: "all 0.2s",
          }}>{label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 32px" }}>

        {tab === "play" && (
          <DecisionCard
            decision={decision}
            char={char}
            onChoose={handleChoose}
            animating={animating}
          />
        )}

        {tab === "stats" && (
          <div>
            <h3 style={{ color: T.muted, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
              Lebenswerte
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
              {Object.entries(STATS).map(([k]) => (
                <div key={k} style={{ flex: "1 1 45%", minWidth: 140 }}>
                  <StatPill statKey={k} value={char.stats[k]} prevValue={prevStats?.[k]} />
                </div>
              ))}
            </div>

            <h3 style={{ color: T.muted, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>
              Profil
            </h3>
            <div style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden" }}>
              {[
                ["💼", "Beruf", char.career || "—"],
                ["🏠", "Unterkunft", char.housing],
                ["📍", "Wohnort", char.location],
                ["🗳️", "Politik", char.politics || "—"],
                ["💑", "Partner", char.partner || "—"],
                ["👶", "Kinder", char.children],
              ].map(([ico, k, v]) => (
                <div key={k} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "13px 16px",
                  borderBottom: `1px solid ${T.border}`,
                }}>
                  <span style={{ fontSize: 16 }}>{ico}</span>
                  <span style={{ color: T.muted, fontSize: 13, flex: 1 }}>{k}</span>
                  <span style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "log" && (
          <div>
            <h3 style={{ color: T.muted, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
              Lebenschronik
            </h3>
            {char.events.length === 0 ? (
              <p style={{ color: T.muted, fontSize: 14, textAlign: "center", marginTop: 40 }}>
                Noch keine Ereignisse…
              </p>
            ) : (
              [...char.events].reverse().map((e, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, padding: "12px 0",
                  borderBottom: `1px solid ${T.border}`,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", background: T.accent,
                    flexShrink: 0, marginTop: 6,
                  }} />
                  <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{e}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("create");
  const [char, setChar] = useState(null);

  if (screen === "create") return (
    <CreateScreen onCreate={(name, gender) => {
      setChar(initChar(name, gender));
      setScreen("game");
    }} />
  );

  if (screen === "death") return (
    <DeathScreen char={char} onRestart={() => { setChar(null); setScreen("create"); }} />
  );

  return (
    <GameScreen
      char={char}
      setChar={setChar}
      onDeath={() => setScreen("death")}
    />
  );
}
