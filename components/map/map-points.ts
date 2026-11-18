import type { MaterialIconName } from "@/components/MaterialIcon";
import gtadbPoints from "./gtadb-points.json";

export const pointCategories = {
  city: "Budovy a služby",
  nature: "Příroda",
  landmark: "Zajímavosti",
  uncategorized: "Nezařazené",
} as const;

export type PointCategory = keyof typeof pointCategories;
export const allPointCategories: Record<PointCategory, boolean> = {
  city: true,
  nature: true,
  landmark: true,
  uncategorized: true,
};

export const pointLinkParam = "bod";

export const pointTypes = {
  stadium: { icon: "stadium", label: "Stadion", aliases: ["stadiony", "stadium"] },
  hotel: { icon: "hotel", label: "Hotel", aliases: ["hotely", "ubytování"] },
  warehouse: { icon: "warehouse", label: "Sklad", aliases: ["sklady", "warehouse"] },
  mountain: { icon: "landscape", label: "Hora", aliases: ["hory", "mountain"] },
  hill: { icon: "elevation", label: "Kopec", aliases: ["kopce", "hill"] },
  pawnshop: { icon: "sell", label: "Zastavárna", aliases: ["zastavárny", "pawnshop", "pawn shop"] },
  bar: { icon: "local_bar", label: "Bar", aliases: ["bary", "hospoda", "pub"] },
  shop: { icon: "storefront", label: "Obchod", aliases: ["obchody", "prodejna", "shop", "store"] },
  stripclub: { icon: "favorite", label: "Strip klub", aliases: ["stripclub", "strip club", "stripklub", "striptýz"] },
  museum: { icon: "museum", label: "Muzeum", aliases: ["muzea", "museum"] },
  marina: { icon: "anchor", label: "Přístav", aliases: ["přístavy", "marina", "kotviště"] },
  gasStation: { icon: "local_gas_station", label: "Čerpací stanice", aliases: ["benzinka", "benzínka", "pumpa", "tankování", "gas station"] },
  arena: { icon: "sports_basketball", label: "Aréna", aliases: ["arény", "stadion"] },
  nightclub: { icon: "nightlife", label: "Noční klub", aliases: ["kluby", "diskotéka", "nightclub"] },
  bridge: { icon: "alt_route", label: "Most", aliases: ["mosty", "bridge"] },
  supermarket: { icon: "shopping_cart", label: "Supermarket", aliases: ["potraviny", "obchod", "prodejna"] },
  lake: { icon: "water", label: "Jezero", aliases: ["jezera", "lake"] },
  park: { icon: "park", label: "Park", aliases: ["parky"] },
  lighthouse: { icon: "flare", label: "Maják", aliases: ["majáky", "lighthouse"] },
  tattoo: { icon: "ink_pen", label: "Tetovací studio", aliases: ["tetování", "tattoo", "tatér"] },
  airport: { icon: "flight", label: "Letiště", aliases: ["airport"] },
  hospital: { icon: "local_hospital", label: "Nemocnice", aliases: ["hospital", "špitál"] },
  ridge: { icon: "landscape", label: "Hřeben", aliases: ["hřebeny", "ridge"] },
  restaurant: { icon: "restaurant", label: "Restaurace", aliases: ["restaurace", "bistro", "fast food", "jídlo"] },
  transit: { icon: "directions_bus", label: "Doprava", aliases: ["autobus", "vlak", "metro", "stanice", "zastávka"] },
  busStop: { icon: "directions_bus", label: "Autobusová zastávka", aliases: ["autobus", "autobusové zastávky", "bus stops", "doprava"] },
  publicBuilding: { icon: "account_balance", label: "Veřejná budova", aliases: ["úřad", "radnice", "soud"] },
  police: { icon: "local_police", label: "Policie", aliases: ["policejní stanice", "police"] },
  industrial: { icon: "factory", label: "Průmyslový objekt", aliases: ["průmysl", "továrna", "výroba"] },
  residential: { icon: "apartment", label: "Bydlení", aliases: ["dům", "byt", "rezidence"] },
  office: { icon: "business_center", label: "Kanceláře", aliases: ["kancelář", "office"] },
  service: { icon: "build", label: "Služby", aliases: ["servis", "service"] },
  gunShop: { icon: "storefront", label: "Obchod se zbraněmi", aliases: ["zbraně", "ammu nation", "prodejna"] },
  naturalSite: { icon: "landscape", label: "Přírodní místo", aliases: ["příroda", "natural"] },
  attraction: { icon: "star", label: "Pamětihodnost", aliases: ["zajímavost", "památka", "monument"] },
  leisure: { icon: "sports_esports", label: "Volný čas", aliases: ["sport", "zábava", "rekreace"] },
  event: { icon: "event", label: "Místo události", aliases: ["událost", "event"] },
  unknown: { icon: "location_on", label: "Neurčený typ", aliases: [] },
} satisfies Record<string, { icon: MaterialIconName; label: string; aliases: string[] }>;

export type MapPoint = {
  id: string;
  name: string;
  sourceName?: string;
  description?: string;
  location?: string;
  unconfirmed?: boolean;
  category: PointCategory;
  type: keyof typeof pointTypes;
  x: number;
  y: number;
};

// GTADB landmark IDs and game coordinates. Values are rounded to tenths of a meter.
const curatedPoints: MapPoint[] = [
  {
    id: "L196",
    name: "Stadion Fleeca Field",
    description: "Stadion ve čtvrti Rockridge ve Vice City.",
    category: "city",
    type: "stadium",
    x: -1605.6,
    y: 1038.3,
  },
  {
    id: "L51",
    name: "Hotel Cordelia",
    description: "Hotel na Shore Drive ve Vice Beach.",
    category: "city",
    type: "hotel",
    x: 1918,
    y: 354.5,
  },
  {
    id: "L1050",
    name: "Sklad Allied Crystal",
    description: "Sklad v průmyslovém areálu Allied Crystal v Ambrosii.",
    category: "city",
    type: "warehouse",
    x: -2799.8,
    y: 3498.1,
  },
  {
    id: "L530",
    name: "Hora Kalaga",
    description: "Hora v okrese Lummox.",
    category: "nature",
    type: "mountain",
    x: -3430.5,
    y: 6370.6,
  },
  {
    id: "L1852",
    name: "Kopec Thrillbilly Hill",
    description: "Kopec v okrese Kelly. Název používá mapovací komunita.",
    category: "nature",
    type: "hill",
    x: -3644,
    y: 4661.2,
  },
  {
    id: "L298",
    name: "Pawn & Gun",
    description: "Zastavárna v Port Gellhornu.",
    category: "landmark",
    type: "pawnshop",
    x: -6350,
    y: 3367,
  },
  {
    id: "L325",
    name: "Bar The Rusty Anchor",
    description: "Bar na Key Lento.",
    category: "landmark",
    type: "bar",
    x: -2271.6,
    y: -5256.9,
  },
  {
    id: "L364",
    name: "Vinylism",
    description: "Obchod v městečku Hamlet.",
    category: "city",
    type: "shop",
    x: -2549.7,
    y: -3365.4,
  },
  {
    id: "L172",
    name: "Jack of Hearts",
    description: "Strip klub na Miramar Drive ve čtvrti Crosstown ve Vice City.",
    category: "landmark",
    type: "stripclub",
    x: -685.9,
    y: 1194.9,
  },
  {
    id: "L85",
    name: "Vice Museum of Art",
    description: "Muzeum umění ve čtvrti Ocean Beach ve Vice Beach.",
    category: "city",
    type: "museum",
    x: 1792,
    y: 1474,
  },
  {
    id: "L120",
    name: "Vice Beach Marina",
    description: "Přístav pro rekreační lodě ve čtvrti Ocean Beach.",
    category: "landmark",
    type: "marina",
    x: 1356.7,
    y: -111.9,
  },
  {
    id: "L161",
    name: "Arrow ve Waning Sands",
    description: "Čerpací stanice Arrow ve Waning Sands.",
    category: "city",
    type: "gasStation",
    x: -303.9,
    y: 4201.5,
  },
  {
    id: "L187",
    name: "Sahara Arena",
    description: "Aréna na Catalan Boulevard ve čtvrti Shoreline ve Vice City.",
    category: "landmark",
    type: "arena",
    x: -303,
    y: 429.9,
  },
  {
    id: "L190",
    name: "NINE1NINE",
    description: "Noční klub v centru Vice City.",
    category: "landmark",
    type: "nightclub",
    x: -671.1,
    y: 467.6,
  },
  {
    id: "L317",
    name: "Most Bocamar",
    description: "Most v oblasti Port Gellhorn.",
    category: "landmark",
    type: "bridge",
    x: -6729.4,
    y: 4563.3,
  },
  {
    id: "L326",
    name: "Brian’s Boat Works & Marina",
    description: "Lodní dílna a přístav na ostrově Key Lento.",
    category: "landmark",
    type: "marina",
    x: -2554.7,
    y: -5859.5,
  },
  {
    id: "L332",
    name: "Wonder Whale",
    description: "Obchod na ostrově Key Lento.",
    category: "city",
    type: "shop",
    x: -2935.6,
    y: -6420.5,
  },
  {
    id: "L341",
    name: "Supermarket 24/7",
    description: "Obchod s potravinami na ostrově Key Lento.",
    category: "city",
    type: "supermarket",
    x: -1979.3,
    y: -5334.7,
  },
  {
    id: "L346",
    name: "Jezero západně od Vice City",
    description: "Jezero na západním okraji oblasti Vice City.",
    category: "nature",
    type: "lake",
    x: -3935.8,
    y: -360.5,
  },
  {
    id: "L406",
    name: "Xero v Ambrosii",
    description: "Čerpací stanice Xero v Ambrosii.",
    category: "city",
    type: "gasStation",
    x: -2698.4,
    y: 4179.4,
  },
  {
    id: "L422",
    name: "Most Rivo",
    description: "Most na souostroví Rialto Islands.",
    category: "landmark",
    type: "bridge",
    x: -106.5,
    y: 1067.1,
  },
  {
    id: "L630",
    name: "Tequesta Retreat Park",
    description: "Park ve čtvrti Tequesta Retreat ve Vice City.",
    category: "nature",
    type: "park",
    x: -352.3,
    y: -1302.5,
  },
  {
    id: "L1000",
    name: "Jezero Leonida",
    description: "Jezero v okrese Leonard.",
    category: "nature",
    type: "lake",
    x: -1975.2,
    y: 4731.9,
  },
  {
    id: "L1362",
    name: "Maják na Catalan Key",
    description: "Maják na ostrově Catalan Key.",
    category: "landmark",
    type: "lighthouse",
    x: -398.4,
    y: -2851.2,
  },
  {
    id: "L1482",
    name: "Electric Fang Tattoo",
    description: "Tetovací studio ve čtvrti Stockyard ve Vice City.",
    category: "city",
    type: "tattoo",
    x: -378.6,
    y: 1839.6,
  },
  {
    id: "L1561",
    name: "Letiště Watson Bay",
    description: "Letiště v oblasti Watson Bay.",
    category: "landmark",
    type: "airport",
    x: -5911.3,
    y: -2471.6,
  },
  {
    id: "L1587",
    name: "Nemocnice v Southside",
    description: "Nemocnice ve čtvrti Southside ve Vice City.",
    category: "city",
    type: "hospital",
    x: -1716.5,
    y: -2289.4,
  },
  {
    id: "L1851",
    name: "Hřeben Lollipop Ridge",
    description: "Hřeben v okrese Kelly. Název používá mapovací komunita.",
    category: "nature",
    type: "ridge",
    x: -4315.8,
    y: 3220.5,
  },
  {
    id: "L2245",
    name: "Čerpací stanice v Buckskinu",
    description: "Čerpací stanice v oblasti Buckskin.",
    category: "city",
    type: "gasStation",
    x: -3956.9,
    y: 883.7,
  },
];

// Specific GTADB tags take precedence over general classifications.
const tagTypes: ReadonlyArray<[MapPoint["type"], PointCategory, string[]]> = [
  ["gasStation", "city", ["#gas"]],
  ["supermarket", "city", ["#supermarket", "supermarket"]],
  ["marina", "landmark", ["#marina"]],
  ["airport", "city", ["#airport", "#airbase", "#blimp"]],
  ["hospital", "city", ["#hospital"]],
  ["police", "city", ["#police"]],
  ["tattoo", "city", ["#tattoos"]],
  ["gunShop", "city", ["#guns"]],
  ["stripclub", "landmark", ["#stripclub"]],
  ["nightclub", "landmark", ["#nightclub"]],
  ["bar", "landmark", ["#bar", "#drinks"]],
  ["restaurant", "city", ["#food", "#fastfood", "fastfood", "restaurant"]],
  ["transit", "city", ["#train", "#metro", "#metromover"]],
  ["service", "city", ["#carwash", "#hair", "#modshop", "#pay'n'spray", "#pharmacy", "service"]],
  ["leisure", "landmark", ["#cinema", "#ferriswheel", "#gym", "#racetrack", "#tennis", "#golf", "#volleyball"]],
  ["naturalSite", "nature", ["natural"]],
  ["hotel", "city", ["hotel"]],
  ["residential", "city", ["residential", "#safehouse"]],
  ["office", "city", ["office"]],
  ["industrial", "city", ["industrial", "agriculture", "utilities"]],
  ["publicBuilding", "city", ["government", "public", "#jail"]],
  ["shop", "city", ["retail", "#bikeshop", "#clothes", "#electronics", "#liquor", "#shoes", "#vendor"]],
  ["transit", "city", ["transportation"]],
  ["attraction", "landmark", ["landmark", "point-of-interest"]],
  ["event", "landmark", ["events"]],
  ["leisure", "landmark", ["leisure", "recreation"]],
];

// Translate whole generic labels only. A label containing a proper name keeps its original wording.
const genericPointNames = new Map([
  ["airfield", "Letiště"],
  ["boat ramp", "Rampa pro spouštění lodí"],
  ["bridge", "Most"],
  ["bus parking lot", "Parkoviště pro autobusy"],
  ["bus station", "Autobusové nádraží"],
  ["bus stop", pointTypes.busStop.label],
  ["canal", "Kanál"],
  ["car park", "Parkoviště"],
  ["car wash", "Automyčka"],
  ["cell tower", "Vysílač mobilní sítě"],
  ["church", "Kostel"],
  ["construction site", "Staveniště"],
  ["dam", "Přehrada"],
  ["docks", "Doky"],
  ["electric substation", "Elektrická rozvodna"],
  ["factory", "Továrna"],
  ["fire station", "Hasičská stanice"],
  ["footbridge", "Lávka"],
  ["gas station", "Čerpací stanice"],
  ["grandstands", "Tribuny"],
  ["guard booth", "Strážní budka"],
  ["hospital", "Nemocnice"],
  ["interchange", "Mimoúrovňová křižovatka"],
  ["lake", "Jezero"],
  ["lifeguard tower", "Věž plavčíků"],
  ["lighthouse", "Maják"],
  ["lock", "Plavební komora"],
  ["marina", "Přístav"],
  ["metro mover station", "Stanice Metromoveru"],
  ["metro station", "Stanice metra"],
  ["office building", "Kancelářská budova"],
  ["park", "Park"],
  ["parking garage", "Parkovací dům"],
  ["parking lot", "Parkoviště"],
  ["pier", "Molo"],
  ["pool", "Bazén"],
  ["prison building", "Vězeňská budova"],
  ["public restrooms", "Veřejné toalety"],
  ["radio mast", "Vysílací stožár"],
  ["radio tower", "Vysílací věž"],
  ["railyard", "Kolejiště"],
  ["river", "Řeka"],
  ["runway", "Vzletová a přistávací dráha"],
  ["tennis court", "Tenisový kurt"],
  ["tennis courts", "Tenisové kurty"],
  ["tennis stadium", "Tenisový stadion"],
  ["train bridge", "Železniční most"],
  ["train station", "Železniční stanice"],
  ["train tunnel", "Železniční tunel"],
  ["tunnel", "Tunel"],
  ["tunnel entrance", "Vjezd do tunelu"],
  ["warehouse", "Sklad"],
  ["water tank", "Nádrž na vodu"],
  ["water tower", "Vodárenská věž"],
]);

function importPoint({ id, name, x, y, location, tags = [] }: typeof gtadbPoints[number]): MapPoint {
  const uncertainName = name.endsWith("?");
  const genericName = name.replace(/\s*\?$/, "").toLowerCase();
  const translatedName = genericPointNames.get(genericName);
  const genericBusStopName = genericName === "bus stop";
  const [type, category] = genericBusStopName || tags.includes("#bus")
    ? (["busStop", "city"] as const)
    : tagTypes.find(([, , keys]) => keys.some((key) => tags.includes(key))) ?? ["unknown", "uncategorized"];

  return {
    id,
    name: translatedName && uncertainName ? `${translatedName}?` : translatedName ?? name,
    sourceName: translatedName ? name : undefined,
    x,
    y,
    location,
    type,
    category,
    unconfirmed: uncertainName || tags.includes("unconfirmed") || tags.includes("//may-not-exist")
      || tags.includes("//doesnt_exist") || tags.includes("//doesnt-exist?"),
  };
}

const curatedIds = new Set(curatedPoints.map(({ id }) => id));
export const mapPoints = [
  ...curatedPoints,
  ...gtadbPoints.filter(({ id }) => !curatedIds.has(id)).map(importPoint),
].filter(({ category }) => category !== "uncategorized");

export const pointCategoryCounts = mapPoints.reduce((counts, { category }) => {
  counts[category] += 1;
  return counts;
}, { city: 0, nature: 0, landmark: 0, uncategorized: 0 });

export const visiblePointCategories = (Object.keys(pointCategories) as PointCategory[])
  .filter((category) => pointCategoryCounts[category] > 0);
