import { VENUES_CATALOG_300 } from "./venuesCatalog300";
import { VENUES_EXPANDED } from "./venuesExpanded";
import { VENUES_MEGA_CATALOG } from "./venuesMegaCatalog";
import { CURATED_BARS } from "./curatedBars";
import { VENUES_POOL_HOUSES_250 } from "./venuesPoolHouses";

export interface Venue {
  id: string;
  category: "baladas" | "bares" | "tabacarias" | "sinucas" | "restaurantes" | "moteis" | "casas_com_piscina";
  name: string;
  tagline: string;
  genre?: "pagode" | "sertanejo" | "funk" | "forro" | "rock" | "eletronica" | undefined;
  cuisine?: "kids" | "japonesa" | "churrascaria" | "italiano" | "hamburgueria" | undefined;
  motelStyle?: "hidro" | "piscina" | "design" | "tematica" | "economica" | "drive-in" | undefined;
  subType: string;
  subTypeEmoji: string;
  neighborhood: string;
  address: string;
  coordinates: { lat: number; lng: number };
  image: string;
  gallery: string[];
  rating: number;
  reviewsCount: number;
  openToday: boolean;
  openHours: string;
  priceCategory: "free" | "low" | "medium" | "high";
  entryPrice: string;
  priceDescription: string;
  hasVipList: boolean;
  allowsReservation: boolean;
  hasKidsSpace?: boolean | undefined;
  isOpenBar?: boolean | undefined;
  isWomenFree?: boolean | undefined;
  hasParking?: boolean | undefined;
  hasHydro?: boolean | undefined;
  hasPool?: boolean | undefined;
  hasBbq?: boolean | undefined;
  hasHeatedPool?: boolean | undefined;
  maxGuests?: number | undefined;
  dailyRate?: number | undefined;
  hasPrivateGarage?: boolean | undefined;
  periodHours?: string | undefined;
  isAfterHours?: boolean | undefined;
  closesAt?: string | undefined;
  whatsapp: string;
  instagram: string;
  highlight: string;
  tags: string[];
  lineup?: string[] | undefined;
  menuHighlights?: string[] | undefined;
  amenities?: RoleAmenityId[] | undefined;
  plan?: "mensal" | "semestral" | "anual" | undefined;
  planPrice?: number | undefined;
}

export type RoleAmenityId =
  | "sinuca"
  | "narguile"
  | "karaoke"
  | "musica_ao_vivo"
  | "pista_danca"
  | "drinks"
  | "chopp"
  | "petiscos"
  | "rooftop"
  | "vip_free"
  | "after_madrugada";

export interface RoleAmenity {
  id: RoleAmenityId;
  name: string;
  emoji: string;
  desc: string;
}

export const ROLE_AMENITIES: RoleAmenity[] = [
  { id: "sinuca", name: "Mesa de Sinuca", emoji: "🎱", desc: "Mesas de bilhar & snooker oficial" },
  { id: "narguile", name: "Narguilé / Lounge", emoji: "💨", desc: "Sessões e espaço hookah lounge" },
  { id: "karaoke", name: "Karaokê", emoji: "🎤", desc: "Palco com microfone ou salas box" },
  { id: "musica_ao_vivo", name: "Música ao Vivo", emoji: "🎸", desc: "Bandas de rock, sertanejo ou samba" },
  { id: "pista_danca", name: "Pista de Dança & DJ", emoji: "🪩", desc: "Pista para dançar e curtir o som" },
  { id: "drinks", name: "Drinques Especiais", emoji: "🍹", desc: "Coquetelaria artesanal, gin & drinks" },
  { id: "chopp", name: "Chopp Gelado", emoji: "🍺", desc: "Chopp na caneca trincando & cervejas" },
  { id: "petiscos", name: "Porções & Petiscos", emoji: "🍟", desc: "Comida de boteco, fritas e tábuas" },
  { id: "rooftop", name: "Rooftop / Ar Livre", emoji: "🌇", desc: "Terraço aberto com vista da cidade" },
  { id: "vip_free", name: "Lista VIP / Entrada Free", emoji: "🎟️", desc: "Entrada gratuita ou desconto na porta" },
  { id: "after_madrugada", name: "Madrugada (5h+ / 24h)", emoji: "🌙", desc: "Aberto até o sol raiar ou 24h" },
];

export interface NeighborhoodCoord {
  name: string;
  lat: number;
  lng: number;
}

export const NEIGHBORHOODS: NeighborhoodCoord[] = [
  { name: "Vila Madalena", lat: -23.5539, lng: -46.6917 },
  { name: "Itaim Bibi", lat: -23.5857, lng: -46.6806 },
  { name: "Pinheiros", lat: -23.5615, lng: -46.7027 },
  { name: "Vila Olímpia", lat: -23.5950, lng: -46.6850 },
  { name: "Moema", lat: -23.6035, lng: -46.6612 },
  { name: "Barra Funda", lat: -23.5268, lng: -46.6672 },
  { name: "Perdizes", lat: -23.5350, lng: -46.6730 },
  { name: "Pompeia", lat: -23.5290, lng: -46.6850 },
  { name: "Lapa", lat: -23.5200, lng: -46.7050 },
  { name: "Butantã", lat: -23.5710, lng: -46.7090 },
  { name: "Morumbi", lat: -23.6000, lng: -46.7200 },
  { name: "Tatuapé", lat: -23.5407, lng: -46.5768 },
  { name: "Mooca", lat: -23.5552, lng: -46.5986 },
  { name: "Anália Franco", lat: -23.5520, lng: -46.5610 },
  { name: "Penha", lat: -23.5250, lng: -46.5490 },
  { name: "Vila Prudente", lat: -23.5820, lng: -46.5820 },
  { name: "Itaquera", lat: -23.5350, lng: -46.4560 },
  { name: "Jardins", lat: -23.5663, lng: -46.6675 },
  { name: "Bela Vista", lat: -23.5618, lng: -46.6488 },
  { name: "República", lat: -23.5430, lng: -46.6430 },
  { name: "Santa Cecília", lat: -23.5380, lng: -46.6540 },
  { name: "Liberdade", lat: -23.5580, lng: -46.6340 },
  { name: "Santana", lat: -23.5019, lng: -46.6253 },
  { name: "Casa Verde", lat: -23.5090, lng: -46.6560 },
  { name: "Tucuruvi", lat: -23.4790, lng: -46.6020 },
  { name: "Freguesia do Ó", lat: -23.4990, lng: -46.6970 },
  { name: "Ipiranga", lat: -23.5855, lng: -46.6080 },
  { name: "Vila Mariana", lat: -23.5890, lng: -46.6350 },
  { name: "Campo Belo", lat: -23.6210, lng: -46.6710 },
  { name: "Brooklin", lat: -23.6120, lng: -46.6900 },
  { name: "Saúde", lat: -23.6150, lng: -46.6390 },
  { name: "Santo André", lat: -23.6639, lng: -46.5383 },
  { name: "São Bernardo", lat: -23.6944, lng: -46.5654 },
  { name: "São Caetano", lat: -23.6229, lng: -46.5547 },
  { name: "Diadema", lat: -23.6865, lng: -46.6228 },
  { name: "Mauá", lat: -23.6680, lng: -46.4614 },
  { name: "Osasco", lat: -23.5329, lng: -46.7920 },
  { name: "Guarulhos", lat: -23.4542, lng: -46.5333 },
  { name: "Alphaville", lat: -23.4996, lng: -46.8529 },
  { name: "Cotia", lat: -23.6030, lng: -46.9190 },
  { name: "Taboão da Serra", lat: -23.6260, lng: -46.7580 },
  { name: "Carapicuíba", lat: -23.5220, lng: -46.8350 },
  { name: "Mogi das Cruzes", lat: -23.5220, lng: -46.1880 },
  { name: "Suzano", lat: -23.5420, lng: -46.3110 },
];

export const GENRES = [
  {
    id: "all",
    name: "Todos os Estilos",
    emoji: "✨",
    tagline: "Ver todas as baladas e noites disponíveis hoje",
    gradient: "from-cyan-500/20 to-fuchsia-600/30",
    border: "hover:border-cyan-500/60",
    activeClass: "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_18px_rgba(0,240,255,0.45)]",
  },
  {
    id: "pagode",
    name: "Pagode",
    emoji: "🪘",
    tagline: "Roda de samba 360°, cerveja trincando e alegria pura",
    gradient: "from-fuchsia-500/20 to-cyan-600/30",
    border: "hover:border-fuchsia-500/60",
    activeClass: "border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-200 shadow-[0_0_18px_rgba(255,0,127,0.45)]",
  },
  {
    id: "sertanejo",
    name: "Sertanejo",
    emoji: "🤠",
    tagline: "Do modão raiz ao sertanejo universitário mais animado",
    gradient: "from-cyan-500/20 to-fuchsia-600/30",
    border: "hover:border-cyan-500/60",
    activeClass: "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_18px_rgba(0,240,255,0.45)]",
  },
  {
    id: "funk",
    name: "Funk",
    emoji: "🔊",
    tagline: "Graves pesados, paredão de som e os maiores DJs de SP",
    gradient: "from-fuchsia-500/20 to-cyan-600/30",
    border: "hover:border-fuchsia-500/60",
    activeClass: "border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-200 shadow-[0_0_18px_rgba(255,0,127,0.45)]",
  },
  {
    id: "forro",
    name: "Forró",
    emoji: "🪗",
    tagline: "Pé de serra tradicional, xote agarradinho e piseiro",
    gradient: "from-cyan-500/20 to-fuchsia-600/30",
    border: "hover:border-cyan-500/60",
    activeClass: "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_18px_rgba(0,240,255,0.45)]",
  },
  {
    id: "rock",
    name: "Rock",
    emoji: "🎸",
    tagline: "Classic Rock, Indie 2000, tributos épicos e chopp artesanal",
    gradient: "from-fuchsia-500/20 to-cyan-600/30",
    border: "hover:border-fuchsia-500/60",
    activeClass: "border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-200 shadow-[0_0_18px_rgba(255,0,127,0.45)]",
  },
  {
    id: "eletronica",
    name: "Eletrônica",
    emoji: "⚡",
    tagline: "House, Techno melódico e pista com iluminação de ponta",
    gradient: "from-cyan-500/20 to-fuchsia-600/30",
    border: "hover:border-cyan-500/60",
    activeClass: "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_18px_rgba(0,240,255,0.45)]",
  },
];

export const CUISINES = [
  {
    id: "all",
    name: "Todas as Culinárias",
    emoji: "✨",
    desc: "Ver todos os restaurantes e experiências gastronômicas",
    gradient: "from-cyan-500/20 to-fuchsia-600/30",
    activeClass: "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_18px_rgba(0,240,255,0.45)]",
  },
  {
    id: "kids",
    name: "Com Espaço Kids",
    emoji: "🧸",
    desc: "Brinquedão, monitores infantis e lazer para curtir em família",
    gradient: "from-cyan-500/30 to-fuchsia-500/30",
    activeClass: "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_20px_rgba(0,240,255,0.45)]",
    badge: "Super Destaque",
  },
  {
    id: "japonesa",
    name: "Japonesa",
    emoji: "🍣",
    desc: "Rodízios premium, sushis trufados, temakis e peixes frescos",
    gradient: "from-fuchsia-500/20 to-cyan-600/30",
    activeClass: "border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-200 shadow-[0_0_18px_rgba(255,0,127,0.45)]",
  },
  {
    id: "churrascaria",
    name: "Churrascaria & Carnes",
    emoji: "🥩",
    desc: "Cortes nobres na brasa, picanha fatiada e rodízio completo",
    gradient: "from-cyan-500/20 to-fuchsia-600/30",
    activeClass: "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_18px_rgba(0,240,255,0.45)]",
  },
  {
    id: "italiano",
    name: "Italiano & Pizzas",
    emoji: "🍝",
    desc: "Massas artesanais, fornos a lenha e cantinas acolhedoras",
    gradient: "from-fuchsia-500/20 to-cyan-600/30",
    activeClass: "border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-200 shadow-[0_0_18px_rgba(255,0,127,0.45)]",
  },
  {
    id: "hamburgueria",
    name: "Hamburguerias & Pubs",
    emoji: "🍔",
    desc: "Smash burgers, chopp artesanal e petiscos especiais",
    gradient: "from-cyan-500/20 to-fuchsia-600/30",
    activeClass: "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_18px_rgba(0,240,255,0.45)]",
  },
];

export const BAR_VIBES = [
  {
    id: "all",
    name: "Todos os Bares",
    emoji: "🍻",
    desc: "Ver todos os bares, botecos, pubs e lounges de SP",
    activeClass: "border-amber-400 bg-amber-500/20 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.45)]",
  },
  {
    id: "narguile",
    name: "Com Narguilé",
    emoji: "💨",
    desc: "Bares e lounges com sessão de narguilé, essências e área hookah",
    activeClass: "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_18px_rgba(0,240,255,0.45)]",
    badge: "Narguilé",
  },
  {
    id: "musica_ao_vivo",
    name: "Música ao Vivo",
    emoji: "🎸",
    desc: "Voz e violão, bandas de rock, sertanejo ao vivo e rodas de samba",
    activeClass: "border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-200 shadow-[0_0_18px_rgba(255,0,127,0.45)]",
    badge: "Ao Vivo",
  },
  {
    id: "espaco_aberto",
    name: "Espaço Aberto / Rooftop",
    emoji: "🌇",
    desc: "Terraços abertos, rooftops, varandas, mesas ao ar livre e calçada",
    activeClass: "border-emerald-400 bg-emerald-500/20 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.45)]",
    badge: "Ar Livre",
  },
  {
    id: "espaco_fechado",
    name: "Espaço Fechado",
    emoji: "🏛️",
    desc: "Ambiente fechado, acústico e climatizado com ar-condicionado",
    activeClass: "border-purple-400 bg-purple-500/20 text-purple-200 shadow-[0_0_18px_rgba(168,85,247,0.45)]",
    badge: "Climatizado",
  },
  {
    id: "sinuca",
    name: "Mesa de Sinuca",
    emoji: "🎱",
    desc: "Bares com mesas de sinuca e snooker oficial",
    activeClass: "border-blue-400 bg-blue-500/20 text-blue-200 shadow-[0_0_18px_rgba(59,130,246,0.45)]",
  },
];

export const MOTEL_STYLES = [
  {
    id: "all",
    name: "Todas as Suítes",
    emoji: "✨",
    desc: "Todos os motéis e suítes disponíveis na região",
    activeClass: "border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-200 shadow-[0_0_18px_rgba(255,0,127,0.45)]",
  },
  {
    id: "hidro",
    name: "Com Hidro",
    emoji: "🛁",
    desc: "Banheira de hidromassagem com cromoterapia e espuma",
    activeClass: "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_18px_rgba(0,240,255,0.45)]",
  },
  {
    id: "piscina",
    name: "Com Piscina",
    emoji: "🏊",
    desc: "Piscina aquecida privativa, cascata e teto solar retrátil",
    activeClass: "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_18px_rgba(0,240,255,0.45)]",
  },
  {
    id: "design",
    name: "Design & Luxo",
    emoji: "💎",
    desc: "Arquitetura premiada, automação por tablet e alta gastronomia",
    activeClass: "border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-200 shadow-[0_0_18px_rgba(255,0,127,0.45)]",
  },
  {
    id: "tematica",
    name: "Temáticas & Pole Dance",
    emoji: "🔥",
    desc: "Pole dance, xadrez, pista de dança privativa e fantasias",
    activeClass: "border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-200 shadow-[0_0_18px_rgba(255,0,127,0.45)]",
  },
  {
    id: "economica",
    name: "Econômicas & Conforto",
    emoji: "🏷️",
    desc: "Ótimo custo-benefício, ar-condicionado split e suíte privativa",
    activeClass: "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_18px_rgba(0,240,255,0.45)]",
  },
  {
    id: "drive-in",
    name: "Drive-In & Garagem",
    emoji: "🚗",
    desc: "Box privativo com garagem automatizada e discrição total",
    activeClass: "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_18px_rgba(0,240,255,0.45)]",
  },
];

export const VENUES_DATA: Venue[] = [
  ...CURATED_BARS,
  ...VENUES_CATALOG_300,
  ...VENUES_EXPANDED,
  ...VENUES_MEGA_CATALOG,
  ...VENUES_POOL_HOUSES_250,
];

// Carregamento assíncrono dos 4.000 estabelecimentos estendidos (Lazy / Não bloqueia o celular nem o bundle inicial)
let _cachedCatalog4000: Venue[] | null = null;
export async function loadCatalog4000(): Promise<Venue[]> {
  if (_cachedCatalog4000) return _cachedCatalog4000;
  try {
    const mod = await import("./venuesCatalog4000");
    _cachedCatalog4000 = mod.VENUES_CATALOG_4000 || [];
    return _cachedCatalog4000;
  } catch (err) {
    console.warn("Aviso: Falha ao carregar catálogo estendido:", err);
    return [];
  }
}

// Utility: Calculate distance in KM using Haversine formula
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

// Utility: Estimate Uber price based on KM
export function estimateUberPrice(distanceKm: number): {
  uberX: number;
  black: number;
} {
  const baseRate = 8.5;
  const perKmRate = 2.4;
  const uberX = Math.round(baseRate + distanceKm * perKmRate);
  const black = Math.round(uberX * 1.65);
  return {
    uberX: Math.max(12, uberX),
    black: Math.max(22, black),
  };
}

// Utility: Extract numeric price from entryPrice string
export function extractVenuePrice(entryPrice?: string): number {
  if (!entryPrice) return 0;
  const match = entryPrice.match(/R\$\s*(\d+)/i) || entryPrice.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 0;
}
