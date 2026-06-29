// Placeholder-content voor de Home-pagina zolang de database nog (bijna) leeg is.
// Zodra er echte songs/playlists/recent zijn, gebruiken de pagina's die; deze
// data is alleen de fallback zodat de Home er niet kaal uitziet.

// Vaste gradient-set voor covers zonder afbeelding (zelfde sfeer als het ontwerp).
export const GRADIENTS = [
  "linear-gradient(135deg,#3d348b,#7678ed)",
  "linear-gradient(135deg,#0a4d68,#37b3a4)",
  "linear-gradient(135deg,#b9375e,#e8836c)",
  "linear-gradient(135deg,#704264,#bb8493)",
  "linear-gradient(135deg,#1b3a4b,#3a7563)",
  "linear-gradient(135deg,#264653,#2a9d8f)",
];

// Kies deterministisch een gradient op basis van een string (titel/naam),
// zodat dezelfde titel altijd dezelfde kleur krijgt.
export function gradientFor(str) {
  let hash = 0;
  for (const ch of String(str || "")) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

// Snel-toegang tegels bovenaan de Home (vaste namen, zoals in het ontwerp).
export const MOOD_TILES = [
  { name: "Focus Flow", gradient: "linear-gradient(135deg,#3d348b,#7678ed)" },
  { name: "Avond Chill", gradient: "linear-gradient(135deg,#1b3a4b,#3a7563)" },
  { name: "Workout Boost", gradient: "linear-gradient(135deg,#b9375e,#e8836c)" },
  { name: "Throwbacks", gradient: "linear-gradient(135deg,#704264,#bb8493)" },
  { name: "Nieuw voor jou", gradient: "linear-gradient(135deg,#0a4d68,#37b3a4)" },
  { name: "Regenachtige Dag", gradient: "linear-gradient(135deg,#264653,#2a9d8f)" },
];

// Random nummers als vulling. src wijst naar de test-mp3 zodat ze ook echt
// (kort) afspelen — handig om de speler te testen zonder backend-downloads.
export const PLACEHOLDER_TRACKS = [
  { id: "ph-1", title: "Nachtlucht", artist: "Lune" },
  { id: "ph-2", title: "Zonsopgang", artist: "Wolk Negen" },
  { id: "ph-3", title: "Verleden", artist: "Kasper Mol" },
  { id: "ph-4", title: "Stilte", artist: "Maan" },
  { id: "ph-5", title: "Echo", artist: "Velda" },
  { id: "ph-6", title: "Drift", artist: "Noor" },
  { id: "ph-7", title: "Zomerregen", artist: "Bing" },
  { id: "ph-8", title: "Horizon", artist: "Faas" },
  { id: "ph-9", title: "Vuurvliegjes", artist: "Indra" },
  { id: "ph-10", title: "Avondrood", artist: "Sterre" },
].map((t) => ({
  ...t,
  src: "/music/test.mp3",
  cover: "", // geen afbeelding → de UI valt terug op een gradient
  gradient: gradientFor(t.title),
}));
