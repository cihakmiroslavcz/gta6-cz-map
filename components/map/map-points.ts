import type { MaterialIconName } from "@/components/MaterialIcon";
import gtadbPoints from "./gtadb-points.json";

export const pointCategories = {
  vehicles: { label: "Vozidla", icon: "directions_car" },
  shop: { label: "Obchody", icon: "storefront" },
  style: { label: "Vzhled", icon: "apparel" },
  foodDrink: { label: "Jídlo a pití", icon: "restaurant" },
  activities: { label: "Aktivity", icon: "sports_esports" },
  collectibles: { label: "Sběratelské předměty", icon: "inventory_2" },
  robberies: { label: "Loupeže", icon: "lock" },
  properties: { label: "Nemovitosti", icon: "home" },
  localPlaces: { label: "Místa a služby", icon: "map" },
  nature: { label: "Příroda", icon: "landscape" },
  uncategorized: { label: "Nezařazené", icon: "location_on" },
} as const satisfies Record<string, { label: string; icon: MaterialIconName }>;

export type PointCategory = keyof typeof pointCategories;
export type PublishedPointCategory = Exclude<PointCategory, "uncategorized">;

export const pointLinkParam = "bod";

export const pointTypes = {
  stadium: { category: "activities", icon: "stadium", label: "Stadion", aliases: ["stadiony", "stadium"] },
  hotel: { category: "localPlaces", icon: "hotel", label: "Hotel", aliases: ["hotely", "ubytování"] },
  warehouse: { category: "localPlaces", icon: "warehouse", label: "Sklad", aliases: ["sklady", "warehouse"] },
  mountain: { category: "nature", icon: "landscape", label: "Hora", aliases: ["hory", "mountain"] },
  hill: { category: "nature", icon: "elevation", label: "Kopec", aliases: ["kopce", "hill"] },
  pawnshop: { category: "shop", icon: "sell", label: "Zastavárna", aliases: ["zastavárny", "pawnshop", "pawn shop"] },
  bar: { category: "foodDrink", icon: "local_bar", label: "Bar", aliases: ["bary", "hospoda", "pub"] },
  shop: { category: "shop", icon: "storefront", label: "Obchod", aliases: ["obchody", "prodejna", "shop", "store"] },
  jewelryStore: { category: "shop", icon: "diamond", label: "Klenotnictví", aliases: ["zlatnictví", "šperky", "jewelry", "jewellery"] },
  clothingStore: { category: "style", icon: "apparel", label: "Obchod s oblečením", aliases: ["oděvy", "móda", "triko", "clothes", "fashion"] },
  shoeStore: { category: "style", icon: "steps", label: "Obuv", aliases: ["obchod s obuví", "boty", "shoe shop"] },
  electronicsStore: { category: "style", icon: "devices", label: "Prodejna elektroniky", aliases: ["elektronika", "electronics"] },
  liquorStore: { category: "foodDrink", icon: "liquor", label: "Prodejna alkoholu", aliases: ["alkohol", "liquor store"] },
  motorcycleShop: { category: "vehicles", icon: "two_wheeler", label: "Obchod s motocykly", aliases: ["motorky", "motorcycle shop"] },
  stripclub: { category: "localPlaces", icon: "favorite", label: "Strip klub", aliases: ["stripclub", "strip club", "stripklub", "striptýz"] },
  museum: { category: "localPlaces", icon: "museum", label: "Muzeum", aliases: ["muzea", "museum"] },
  marina: { category: "localPlaces", icon: "anchor", label: "Přístav", aliases: ["přístavy", "marina", "kotviště"] },
  gasStation: { category: "vehicles", icon: "local_gas_station", label: "Čerpací stanice", aliases: ["benzinka", "benzínka", "pumpa", "tankování", "gas station"] },
  arena: { category: "activities", icon: "sports_basketball", label: "Aréna", aliases: ["arény", "stadion"] },
  nightclub: { category: "localPlaces", icon: "nightlife", label: "Noční klub", aliases: ["kluby", "diskotéka", "nightclub"] },
  bridge: { category: "vehicles", icon: "alt_route", label: "Most", aliases: ["mosty", "bridge"] },
  supermarket: { category: "shop", icon: "shopping_cart", label: "Supermarket", aliases: ["potraviny", "obchod", "prodejna"] },
  lake: { category: "nature", icon: "water", label: "Jezero", aliases: ["jezera", "lake"] },
  waterway: { category: "nature", icon: "water", label: "Řeka nebo kanál", aliases: ["řeky", "vodní tok", "river", "canal"] },
  park: { category: "nature", icon: "park", label: "Park", aliases: ["parky"] },
  lighthouse: { category: "localPlaces", icon: "flare", label: "Maják", aliases: ["majáky", "lighthouse"] },
  tattoo: { category: "style", icon: "ink_pen", label: "Tetovací studio", aliases: ["tetování", "tattoo", "tatér"] },
  airport: { category: "vehicles", icon: "flight", label: "Letiště", aliases: ["airport"] },
  hospital: { category: "localPlaces", icon: "local_hospital", label: "Nemocnice", aliases: ["hospital", "špitál"] },
  ridge: { category: "nature", icon: "landscape", label: "Hřeben", aliases: ["hřebeny", "ridge"] },
  restaurant: { category: "foodDrink", icon: "restaurant", label: "Restaurace", aliases: ["restaurace", "bistro", "jídlo"] },
  transit: { category: "vehicles", icon: "directions_transit", label: "Doprava", aliases: ["autobus", "vlak", "metro", "stanice", "zastávka"] },
  busStop: { category: "vehicles", icon: "directions_bus", label: "Autobusová zastávka", aliases: ["autobus", "autobusové zastávky", "bus stops", "doprava"] },
  trainStation: { category: "vehicles", icon: "train", label: "Železniční stanice", aliases: ["vlak", "nádraží", "train station"] },
  metroStation: { category: "vehicles", icon: "subway", label: "Stanice metra", aliases: ["metro", "metromover", "subway"] },
  parking: { category: "vehicles", icon: "local_parking", label: "Parkoviště", aliases: ["parkování", "parking", "car park"] },
  tunnel: { category: "vehicles", icon: "road", label: "Tunel", aliases: ["tunely", "tunnel"] },
  publicBuilding: { category: "localPlaces", icon: "account_balance", label: "Veřejná budova", aliases: ["úřad", "radnice", "soud"] },
  police: { category: "localPlaces", icon: "local_police", label: "Policie", aliases: ["policejní stanice", "police"] },
  industrial: { category: "localPlaces", icon: "factory", label: "Průmyslový objekt", aliases: ["průmysl", "továrna", "výroba"] },
  residential: { category: "properties", icon: "apartment", label: "Bydlení", aliases: ["dům", "byt", "rezidence"] },
  office: { category: "localPlaces", icon: "business_center", label: "Kanceláře", aliases: ["kancelář", "office"] },
  service: { category: "localPlaces", icon: "build", label: "Služby", aliases: ["servis", "service"] },
  carWash: { category: "vehicles", icon: "local_car_wash", label: "Automyčka", aliases: ["myčka", "car wash"] },
  autoShop: { category: "vehicles", icon: "car_repair", label: "Autoservis a autodíly", aliases: ["servis", "tuning", "autodíly", "auto shop"] },
  pharmacy: { category: "shop", icon: "local_pharmacy", label: "Lékárna", aliases: ["lékárny", "pharmacy"] },
  hairSalon: { category: "style", icon: "content_cut", label: "Kadeřnický salon", aliases: ["kadeřnictví", "kadeřnice", "kadeřník", "hairdresser", "hair salon"] },
  barberShop: { category: "style", icon: "content_cut", label: "Barbershop", aliases: ["barber shop", "barber", "holič", "holičství", "pánské kadeřnictví"] },
  gunShop: { category: "shop", icon: "pistol", label: "Obchod se zbraněmi", aliases: ["zbraně", "ammu nation", "prodejna"] },
  naturalSite: { category: "nature", icon: "landscape", label: "Přírodní místo", aliases: ["příroda", "natural"] },
  attraction: { category: "localPlaces", icon: "star", label: "Pamětihodnost", aliases: ["zajímavost", "památka", "monument"] },
  treasure: { category: "collectibles", icon: "sell", label: "Poklad", aliases: ["poklady", "peníze", "hotovost", "skrýš", "money", "cash", "treasure"] },
  leisure: { category: "activities", icon: "sports_esports", label: "Volný čas", aliases: ["sport", "zábava", "rekreace"] },
  gym: { category: "activities", icon: "fitness_center", label: "Posilovna", aliases: ["fitness", "gym"] },
  golfCourse: { category: "activities", icon: "golf_course", label: "Golfové hřiště", aliases: ["golf", "golf club"] },
  racetrack: { category: "activities", icon: "sports_score", label: "Závodní okruh", aliases: ["závody", "závodní dráha", "racetrack", "raceway"] },
  tennis: { category: "activities", icon: "sports_tennis", label: "Tenisový areál", aliases: ["tenis", "tenisový kurt", "tennis"] },
  volleyball: { category: "activities", icon: "sports_volleyball", label: "Volejbalové hřiště", aliases: ["volejbal", "volleyball"] },
  cinema: { category: "localPlaces", icon: "theaters", label: "Kino", aliases: ["kina", "cinema"] },
  ferrisWheel: { category: "activities", icon: "attractions", label: "Vyhlídkové kolo", aliases: ["ruské kolo", "ferris wheel"] },
  casino: { category: "activities", icon: "casino", label: "Kasino", aliases: ["kasina", "casino"] },
  waterTower: { category: "localPlaces", icon: "water_drop", label: "Vodárenská věž", aliases: ["vodojem", "water tower"] },
  transmitter: { category: "localPlaces", icon: "cell_tower", label: "Vysílač", aliases: ["rádiový stožár", "cell tower", "radio tower"] },
  church: { category: "localPlaces", icon: "church", label: "Kostel", aliases: ["kostely", "church"] },
  event: { category: "activities", icon: "event", label: "Místo události", aliases: ["událost", "event"] },
  evCharger: { category: "vehicles", icon: "ev_station", label: "Nabíjecí stanice", aliases: ["nabíječka", "EV charger"] },
  modShop: { category: "vehicles", icon: "car_repair", label: "Tuningová dílna", aliases: ["mod shop", "tuning"] },
  payNSpray: { category: "vehicles", icon: "format_paint", label: "Pay ’n’ Spray", aliases: ["lakovna", "pay n spray"] },
  specialVehicle: { category: "vehicles", icon: "stars", label: "Výjimečné vozidlo", aliases: ["standout vehicle"] },
  vehicleRental: { category: "vehicles", icon: "car_rental", label: "Půjčovna vozidel", aliases: ["vehicle rental"] },
  vehicleRequest: { category: "vehicles", icon: "assignment", label: "Poptávka po vozidle", aliases: ["vehicle request"] },
  vehicleSpawn: { category: "vehicles", icon: "directions_car", label: "Výskyt vozidla", aliases: ["vehicle spawn"] },
  cafeTakeout: { category: "foodDrink", icon: "coffee", label: "Kavárna a jídlo s sebou", aliases: ["cafe", "takeout", "coffee shop"] },
  convenienceStore: { category: "foodDrink", icon: "store", label: "Večerka", aliases: ["convenience store", "minimarket"] },
  fastFood: { category: "foodDrink", icon: "fastfood", label: "Rychlé občerstvení", aliases: ["fast food", "fastfood", "burger"] },
  streetFood: { category: "foodDrink", icon: "local_shipping", label: "Pouliční občerstvení", aliases: ["street food", "food truck"] },
  arcadeMachine: { category: "activities", icon: "sports_esports", label: "Herní automat", aliases: ["arcade machine"] },
  basketball: { category: "activities", icon: "sports_basketball", label: "Basketbal", aliases: ["basketball"] },
  droneRace: { category: "activities", icon: "toys", label: "Závod dronů", aliases: ["drone race"] },
  fishing: { category: "activities", icon: "set_meal", label: "Rybaření", aliases: ["fishing"] },
  gangCompound: { category: "activities", icon: "groups", label: "Areál gangu", aliases: ["gang compound"] },
  miniGolf: { category: "activities", icon: "golf_course", label: "Minigolf", aliases: ["mini golf"] },
  parachuting: { category: "activities", icon: "paragliding", label: "Parašutismus", aliases: ["parachuting"] },
  billiards: { category: "activities", icon: "sports", label: "Kulečník", aliases: ["billiards", "pool"] },
  race: { category: "activities", icon: "sports_score", label: "Závod", aliases: ["race"] },
  randomEvent: { category: "activities", icon: "event", label: "Náhodná událost", aliases: ["random event"] },
  shootingRange: { category: "activities", icon: "target", label: "Střelnice", aliases: ["shooting range"] },
  mural: { category: "collectibles", icon: "palette", label: "Nástěnná malba 1010", aliases: ["1010 mural", "graffiti"] },
  baseJump: { category: "collectibles", icon: "paragliding", label: "BASE skok", aliases: ["base jump"] },
  bookSwap: { category: "collectibles", icon: "menu_book", label: "Výměna knih", aliases: ["book swap"] },
  hiddenPackage: { category: "collectibles", icon: "inventory_2", label: "Skrytý balíček", aliases: ["hidden package"] },
  knifeFlight: { category: "collectibles", icon: "flight", label: "Let na boku", aliases: ["knife flight"] },
  magazine: { category: "collectibles", icon: "auto_stories", label: "Časopis", aliases: ["magazine"] },
  messageInBottle: { category: "collectibles", icon: "mail", label: "Vzkaz v lahvi", aliases: ["message in a bottle"] },
  meteorite: { category: "collectibles", icon: "brightness_5", label: "Meteorit", aliases: ["meteorite"] },
  stuntJump: { category: "collectibles", icon: "sports_score", label: "Kaskadérský skok", aliases: ["stunt jump"] },
  underBridge: { category: "collectibles", icon: "alt_route", label: "Průlet pod mostem", aliases: ["under the bridge"] },
  playlist: { category: "collectibles", icon: "music_note", label: "Unikátní playlist", aliases: ["unique playlist"] },
  photoCuriosity: { category: "collectibles", icon: "search", label: "Kuriozita k vyfocení", aliases: ["Waink", "curiosity"] },
  photoLandmark: { category: "collectibles", icon: "photo_camera", label: "Pamětihodnost k vyfocení", aliases: ["Waink", "photo landmark"] },
  photoSculpture: { category: "collectibles", icon: "palette", label: "Socha k vyfocení", aliases: ["Waink", "sculpture"] },
  bank: { category: "robberies", icon: "account_balance", label: "Banka", aliases: ["bank"] },
  bigBank: { category: "robberies", icon: "account_balance", label: "Velká banka", aliases: ["big bank"] },
  lowEndJewelryStore: { category: "robberies", icon: "diamond", label: "Levné klenotnictví", aliases: ["low-end jewelry store", "low-end jewellery store"] },
  highEndJewelryStore: { category: "robberies", icon: "diamond", label: "Luxusní klenotnictví", aliases: ["high-end jewelry store", "high-end jewellery store"] },
  pawnshopRobbery: { category: "robberies", icon: "sell", label: "Zastavárna", aliases: ["pawn shop", "pawnshop"] },
  convenienceStoreRobbery: { category: "robberies", icon: "store", label: "Večerka", aliases: ["convenience store", "minimarket"] },
  fastFoodRobbery: { category: "robberies", icon: "fastfood", label: "Rychlé občerstvení", aliases: ["fast food", "fastfood"] },
  liquorStoreRobbery: { category: "robberies", icon: "liquor", label: "Prodejna alkoholu", aliases: ["liquor store"] },
  robberyContact: { category: "robberies", icon: "groups", label: "Kontakt", aliases: ["contact"] },
  fence: { category: "robberies", icon: "currency_exchange", label: "Překupník", aliases: ["fence"] },
  illegalOperation: { category: "robberies", icon: "lock", label: "Nelegální provoz", aliases: ["illegal operation"] },
  paydayLoan: { category: "robberies", icon: "payments", label: "Krátkodobé půjčky", aliases: ["payday loans"] },
  safe: { category: "robberies", icon: "lock", label: "Trezor", aliases: ["safe"] },
  smashAndGrab: { category: "robberies", icon: "diamond", label: "Krádež z výlohy", aliases: ["smash and grab"] },
  towableAtm: { category: "robberies", icon: "rv_hookup", label: "Odtahovatelný bankomat", aliases: ["towable ATM"] },
  garage: { category: "properties", icon: "garage", label: "Garáž", aliases: ["garage"] },
  safehouse: { category: "properties", icon: "home", label: "Úkryt", aliases: ["safehouse", "safe house"] },
  atm: { category: "localPlaces", icon: "atm", label: "Bankomat", aliases: ["ATM"] },
  town: { category: "localPlaces", icon: "location_city", label: "Město nebo obec", aliases: ["city", "town"] },
  fireStation: { category: "localPlaces", icon: "local_fire_department", label: "Hasičská stanice", aliases: ["hasiči", "fire station"] },
  unknown: { category: "uncategorized", icon: "location_on", label: "Neurčený typ", aliases: [] },
} as const satisfies Record<string, { category: PointCategory; icon: MaterialIconName; label: string; aliases: readonly string[] }>;

export type PublishedPointType = Exclude<keyof typeof pointTypes, "unknown">;
export type PointClassification = { category: PublishedPointCategory; type: PublishedPointType };

export type MapPoint = {
  id: string;
  name: string;
  sourceName?: string;
  description?: string;
  location?: string;
  unconfirmed?: boolean;
  verificationSource?: string;
  robbery?: {
    security?: string;
    take?: { min: number; max: number };
  };
  category: PointCategory;
  type: keyof typeof pointTypes;
  x: number;
  y: number;
};

export function isPublishedPointCategory(value: unknown): value is PublishedPointCategory {
  return typeof value === "string" && value !== "uncategorized" && Object.hasOwn(pointCategories, value);
}

export function isPublishedPointType(value: unknown): value is PublishedPointType {
  return typeof value === "string" && value !== "unknown" && Object.hasOwn(pointTypes, value);
}

export const publishedPointCategories = Object.keys(pointCategories).filter(isPublishedPointCategory);

const publishedPointTypes = Object.keys(pointTypes)
  .filter(isPublishedPointType)
  .sort((a, b) => pointTypes[a].label.localeCompare(pointTypes[b].label, "cs"));

export function getPointTypes(category: PublishedPointCategory) {
  return publishedPointTypes.filter((type) => pointTypes[type].category === category);
}

export function getPointClassification(type: unknown): PointClassification | null {
  return isPublishedPointType(type) ? { category: pointTypes[type].category, type } : null;
}

export function readPointClassification(category: unknown, type: unknown): PointClassification | null {
  const classification = getPointClassification(type);
  return classification?.category === category ? classification : null;
}

// GTADB landmark IDs and game coordinates. Values are rounded to tenths of a meter.
const curatedPoints: Omit<MapPoint, "category">[] = [
  {
    id: "L196",
    name: "Stadion Fleeca Field",
    description: "Stadion ve čtvrti Rockridge ve Vice City.",
    type: "stadium",
    x: -1605.6,
    y: 1038.3,
  },
  {
    id: "L51",
    name: "Hotel Cordelia",
    description: "Hotel na Shore Drive ve Vice Beach.",
    type: "hotel",
    x: 1918,
    y: 354.5,
  },
  {
    id: "L1050",
    name: "Sklad Allied Crystal",
    description: "Sklad v průmyslovém areálu Allied Crystal v Ambrosii.",
    type: "warehouse",
    x: -2799.8,
    y: 3498.1,
  },
  {
    id: "L530",
    name: "Hora Kalaga",
    description: "Hora v okrese Lummox.",
    type: "mountain",
    x: -3430.5,
    y: 6370.6,
  },
  {
    id: "L1852",
    name: "Kopec Thrillbilly Hill",
    description: "Kopec v okrese Kelly. Název používá mapovací komunita.",
    type: "hill",
    x: -3644,
    y: 4661.2,
  },
  {
    id: "L298",
    name: "Pawn & Gun",
    description: "Zastavárna a obchod se zbraněmi v Port Gellhornu.",
    type: "gunShop",
    x: -6350,
    y: 3367,
  },
  {
    id: "L325",
    name: "Bar The Rusty Anchor",
    description: "Bar na Key Lento.",
    type: "bar",
    x: -2271.6,
    y: -5256.9,
  },
  {
    id: "L364",
    name: "Vinylism",
    description: "Obchod v městečku Hamlet.",
    type: "shop",
    x: -2549.7,
    y: -3365.4,
  },
  {
    id: "L172",
    name: "Jack of Hearts",
    description: "Strip klub na Miramar Drive ve čtvrti Crosstown ve Vice City.",
    type: "stripclub",
    x: -685.9,
    y: 1194.9,
  },
  {
    id: "L85",
    name: "Vice Museum of Art",
    description: "Muzeum umění ve čtvrti Ocean Beach ve Vice Beach.",
    type: "museum",
    x: 1792,
    y: 1474,
  },
  {
    id: "L120",
    name: "Vice Beach Marina",
    description: "Přístav pro rekreační lodě ve čtvrti Ocean Beach.",
    type: "marina",
    x: 1356.7,
    y: -111.9,
  },
  {
    id: "L161",
    name: "Arrow ve Waning Sands",
    description: "Čerpací stanice Arrow ve Waning Sands.",
    type: "gasStation",
    x: -303.9,
    y: 4201.5,
  },
  {
    id: "L187",
    name: "Sahara Arena",
    description: "Aréna na Catalan Boulevard ve čtvrti Shoreline ve Vice City.",
    type: "arena",
    x: -303,
    y: 429.9,
  },
  {
    id: "L190",
    name: "NINE1NINE",
    description: "Noční klub v centru Vice City.",
    type: "nightclub",
    x: -671.1,
    y: 467.6,
  },
  {
    id: "L317",
    name: "Most Bocamar",
    description: "Most v oblasti Port Gellhorn.",
    type: "bridge",
    x: -6729.4,
    y: 4563.3,
  },
  {
    id: "L326",
    name: "Brian’s Boat Works & Marina",
    description: "Lodní dílna a přístav na ostrově Key Lento.",
    type: "marina",
    x: -2554.7,
    y: -5859.5,
  },
  {
    id: "L332",
    name: "Wonder Whale",
    description: "Obchod na ostrově Key Lento.",
    type: "shop",
    x: -2935.6,
    y: -6420.5,
  },
  {
    id: "L341",
    name: "Supermarket 24/7",
    description: "Obchod s potravinami na ostrově Key Lento.",
    type: "supermarket",
    x: -1979.3,
    y: -5334.7,
  },
  {
    id: "L346",
    name: "Three Toe Lake",
    description: "Jezero na západním okraji oblasti Vice City.",
    type: "lake",
    x: -3935.8,
    y: -360.5,
  },
  {
    id: "L406",
    name: "Xero v Ambrosii",
    description: "Čerpací stanice Xero v Ambrosii.",
    type: "gasStation",
    x: -2698.4,
    y: 4179.4,
  },
  {
    id: "L422",
    name: "Most Rivo",
    description: "Most na souostroví Rialto Islands.",
    type: "bridge",
    x: -106.5,
    y: 1067.1,
  },
  {
    id: "L630",
    name: "Tequesta Retreat Park",
    description: "Park ve čtvrti Tequesta Retreat ve Vice City.",
    type: "park",
    x: -352.3,
    y: -1302.5,
  },
  {
    id: "L1000",
    name: "Jezero Leonida",
    description: "Jezero v okrese Leonard.",
    type: "lake",
    x: -1975.2,
    y: 4731.9,
  },
  {
    id: "L1362",
    name: "Maják na Catalan Key",
    description: "Maják na ostrově Catalan Key.",
    type: "lighthouse",
    x: -398.4,
    y: -2851.2,
  },
  {
    id: "L1482",
    name: "Electric Fang Tattoo",
    description: "Tetovací studio ve čtvrti Stockyard ve Vice City.",
    type: "tattoo",
    x: -378.6,
    y: 1839.6,
  },
  {
    id: "L1561",
    name: "Letiště Watson Bay",
    description: "Letiště v oblasti Watson Bay.",
    type: "airport",
    x: -5911.3,
    y: -2471.6,
  },
  {
    id: "L1587",
    name: "Nemocnice v Southside",
    description: "Nemocnice ve čtvrti Southside ve Vice City.",
    type: "hospital",
    x: -1716.5,
    y: -2289.4,
  },
  {
    id: "L1851",
    name: "Hřeben Lollipop Ridge",
    description: "Hřeben v okrese Kelly. Název používá mapovací komunita.",
    type: "ridge",
    x: -4315.8,
    y: 3220.5,
  },
  {
    id: "L2245",
    name: "Čerpací stanice v okrese Kelly",
    type: "gasStation",
    x: -5311.2,
    y: 1093,
  },
];

// Specific GTADB tags take precedence over general classifications.
const tagTypes: ReadonlyArray<[PublishedPointType, string[]]> = [
  ["hairSalon", ["#hair"]],
  ["gasStation", ["#gas"]],
  ["supermarket", ["#supermarket", "supermarket"]],
  ["marina", ["#marina"]],
  ["airport", ["#airport", "#airbase", "#blimp"]],
  ["hospital", ["#hospital"]],
  ["police", ["#police"]],
  ["tattoo", ["#tattoos"]],
  ["fence", ["#fence"]],
  ["gunShop", ["#guns"]],
  ["stripclub", ["#stripclub"]],
  ["nightclub", ["#nightclub"]],
  ["bar", ["#bar", "#drinks"]],
  ["fastFood", ["#fastfood", "fastfood"]],
  ["restaurant", ["#food", "restaurant"]],
  ["trainStation", ["#train"]],
  ["metroStation", ["#metro", "#metromover"]],
  ["carWash", ["#carwash"]],
  ["modShop", ["#modshop"]],
  ["payNSpray", ["#pay'n'spray"]],
  ["pharmacy", ["#pharmacy"]],
  ["clothingStore", ["#clothes"]],
  ["shoeStore", ["#shoes"]],
  ["electronicsStore", ["#electronics"]],
  ["liquorStore", ["#liquor"]],
  ["motorcycleShop", ["#bikeshop"]],
  ["cinema", ["#cinema"]],
  ["ferrisWheel", ["#ferriswheel"]],
  ["gym", ["#gym"]],
  ["racetrack", ["#racetrack"]],
  ["tennis", ["#tennis"]],
  ["golfCourse", ["#golf"]],
  ["volleyball", ["#volleyball"]],
  ["safehouse", ["#safehouse"]],
  ["service", ["service"]],
  ["naturalSite", ["natural"]],
  ["hotel", ["hotel"]],
  ["residential", ["residential"]],
  ["office", ["office"]],
  ["industrial", ["industrial", "agriculture", "utilities"]],
  ["publicBuilding", ["government", "public", "#jail"]],
  ["shop", ["retail", "#vendor"]],
  ["transit", ["transportation"]],
  ["attraction", ["landmark", "point-of-interest"]],
  ["event", ["events"]],
  ["leisure", ["leisure", "recreation"]],
];

// Explicit names identify points which have a broad or missing GTADB tag.
const namedTypes: ReadonlyArray<[PublishedPointType, RegExp]> = [
  ["busStop", /^bus stop$/],
  ["barberShop", /\bbarber\s*shop$/],
  ["clothingStore", /\bclothing(?: store| shop)?$/],
  ["jewelryStore", /\bjewel(?:ry|lery)(?: (?:store|shop))?$/],
  ["gasStation", /\bgas (?:station|stop)$/],
  ["evCharger", /\b(?:ev charg(?:er|ing station)|charging station)$/],
  ["convenienceStore", /\b(?:convenience store|minimarket)$/],
  ["cafeTakeout", /(?:^caf[eé]\b|\b(?:caf[eé]|coffee shop)$)/],
  ["streetFood", /\b(?:food truck|street food)$/],
  ["fireStation", /\bfire station$/],
  ["bank", /\bbank$/],
  ["atm", /^atm$/],
  ["trainStation", /\btrain station$/],
  ["metroStation", /\bmetro(?: mover)? station$/],
  ["bridge", /(?:\bbridge|\bfootbridge)$/],
  ["tunnel", /\btunnel(?: entrance)?$/],
  ["parking", /^(?:car park|parking (?:lot|garage))$/],
  ["lake", /(?:^lake\b|\blake$)/],
  ["waterway", /\b(?:river|canal)"?$/],
  ["park", /^park$/],
  ["hill", /\bhill"?$/],
  ["mountain", /\bmountain"?$/],
  ["marina", /\bmarina$/],
  ["lighthouse", /\blighthouse$/],
  ["casino", /\bcasino$/],
  ["tennis", /^tennis (?:courts?|stadium)$/],
  ["waterTower", /\bwater tower$/],
  ["warehouse", /\bwarehouse$/],
  ["transmitter", /^(?:cell tower|radio tower|radio mast|broadcast tower)$/],
  ["church", /\bchurch$/],
];

// Some named points do not yet have a GTADB tag that describes their type.
const pointClassifications = new Map<string, PublishedPointType>([
  ["L1563", "attraction"], // Dawson Dam
  ["L2489", "naturalSite"], // Kalaga Reservoir
  ["L2518", "attraction"], // Infinity Tower
  ["L3240", "attraction"], // August Hill Farm
  ["L3658", "cinema"], // Gellhorn Drive-In Theatre
  ["L3744", "attraction"], // Effete
  ["L3749", "naturalSite"], // Sharktooth Island
]);

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
  ["hair salon", "Kadeřnictví"],
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
  const type = tags.includes("#bus")
    ? "busStop"
    : pointClassifications.get(id)
      ?? namedTypes.find(([, pattern]) => pattern.test(genericName))?.[0]
      ?? tagTypes.find(([, keys]) => keys.some((key) => tags.includes(key)))?.[0]
      ?? "unknown";

  return {
    id,
    name: translatedName && uncertainName ? `${translatedName}?` : translatedName ?? name,
    sourceName: translatedName ? name : undefined,
    x,
    y,
    location,
    type,
    category: pointTypes[type].category,
    unconfirmed: uncertainName || tags.includes("unconfirmed") || tags.includes("//may-not-exist")
      || tags.includes("//doesnt_exist") || tags.includes("//doesnt-exist?"),
  };
}

const curatedIds = new Set(curatedPoints.map(({ id }) => id));
export const mapPoints = [
  ...curatedPoints.map((point) => ({ ...point, category: pointTypes[point.type].category })),
  ...gtadbPoints.filter(({ id }) => !curatedIds.has(id)).map(importPoint),
].filter(({ category }) => category !== "uncategorized");

export function countPointCategories(points: MapPoint[]) {
  return points.reduce((counts, { category }) => {
    counts[category] += 1;
    return counts;
  }, {
    vehicles: 0, shop: 0, style: 0, foodDrink: 0, activities: 0, collectibles: 0,
    robberies: 0, properties: 0, localPlaces: 0, nature: 0, uncategorized: 0,
  });
}

export const pointCategoryCounts = countPointCategories(mapPoints);

export const visiblePointCategories = publishedPointCategories
  .filter((category) => pointCategoryCounts[category] > 0);
