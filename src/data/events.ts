import { Event, FilterPill } from "../types/event";
import { calculateDistanceKm } from "./venues";

export const FILTER_PILLS: FilterPill[] = [
  { id: "all", label: "Todos", emoji: "✨", activeColor: "border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]" },
  { id: "bombando", label: "Bombando agora", emoji: "🔥", activeColor: "border-rose-500 bg-rose-500/20 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]" },
  { id: "perto", label: "Perto de você", emoji: "📍", activeColor: "border-cyan-400 bg-cyan-400/20 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)]" },
  { id: "gratis", label: "Entrada grátis", emoji: "🎟", activeColor: "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]" },
  { id: "vip", label: "Lista VIP", emoji: "💃", activeColor: "border-amber-500 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]" },
  { id: "after", label: "After (Madrugada)", emoji: "🌙", activeColor: "border-purple-500 bg-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]" },
  { id: "eletronica", label: "Eletrônica", emoji: "⚡", activeColor: "border-blue-500 bg-blue-500/20 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.4)]" },
  { id: "pagode", label: "Pagode", emoji: "🪘", activeColor: "border-orange-500 bg-orange-500/20 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.4)]" },
  { id: "sertanejo", label: "Sertanejo", emoji: "🤠", activeColor: "border-emerald-400 bg-emerald-400/20 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.4)]" },
  { id: "rock", label: "Rock", emoji: "🎸", activeColor: "border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.4)]" },
  { id: "bares", label: "Sinuca & Bares", emoji: "🎱", activeColor: "border-teal-500 bg-teal-500/20 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.4)]" },
];

export const EVENTS_DATA: Event[] = [
  {
    id: "event-dedge-superafter",
    venueId: "balada-dedge",
    venueName: "D-Edge Electronic Music",
    neighborhood: "Barra Funda",
    address: "Av. Mário de Andrade, 141 - Barra Funda, São Paulo - SP",
    coordinates: { lat: -23.5255, lng: -46.6631 },
    title: "SUPERAFTER SESSIONS • TECHNO & MINIMAL 360°",
    tagline: "A pista com tiras de LED mais famosa do mundo em 8 horas ininterruptas de imersão sonora",
    genre: "eletronica",
    genreLabel: "Techno & House Melodic",
    date: "2026-09-26",
    dateLabel: "Hoje • Sábado",
    startTime: "23:00",
    endTime: "08:00",
    durationLabel: "Hoje 23h - 08h",
    lineup: [
      { time: "23:00 - 01:30", artist: "Warmup Deep & Minimal", role: "Abertura Pista 1" },
      { time: "01:30 - 04:30", artist: "Renato Ratier & Convidado Internacional", role: "Set Principal", highlight: true },
      { time: "04:30 - 08:00", artist: "Superafter Terraço Sunrise", role: "Amanhecer no Rooftop", highlight: true },
    ],
    minPrice: 60,
    maxPrice: 120,
    priceLabel: "A partir de R$ 60",
    isFree: false,
    hasVipList: true,
    isTrending: true,
    isAfterHours: true,
    interestedCount: 524,
    imageUrl: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    ],
    ticketUrl: "https://www.sympla.com.br",
    ticketPartner: "Sympla",
    instagram: "dedgesp",
    whatsapp: "5511944443333",
    benefits: [
      "Pista imersiva premiada mundialmente pela DJ Mag",
      "Welcome Drink cortesia até 00h30 para quem confirmar presença",
      "Terraço aberto para ver o nascer do sol de São Paulo",
      "Sistema de som Funktion-One de alta fidelidade",
    ],
    dressCode: "Casual / All Black / Streetwear",
    minAge: 18,
  },
  {
    id: "event-vilajk-sertanejo-vip",
    venueId: "balada-vilajk",
    venueName: "Vila JK São Paulo",
    neighborhood: "Itaim Bibi",
    address: "R. Beira Rio, 116 - Vila Olímpia / Itaim, São Paulo - SP",
    coordinates: { lat: -23.5939, lng: -46.6908 },
    title: "VILA JK PREMIUM • NOITE SERTANEJA & FUNK CHIC",
    tagline: "O ponto de encontro dos maiores shows ao vivo e do público mais seleto de São Paulo",
    genre: "sertanejo",
    genreLabel: "Sertanejo Premium & Funk Chic",
    date: "2026-09-26",
    dateLabel: "Hoje • Sábado",
    startTime: "22:30",
    endTime: "05:30",
    durationLabel: "Hoje 22h30 - 05h30",
    lineup: [
      { time: "22:30 - 00:30", artist: "DJ Warmup & Acústico VIP", role: "Recepção Lounge" },
      { time: "00:30 - 03:00", artist: "Dupla Sertaneja Consagrada", role: "Show Principal", highlight: true },
      { time: "03:00 - 05:30", artist: "DJ Funk Open Format & Black Music", role: "After das Estrelas", highlight: true },
    ],
    minPrice: 80,
    maxPrice: 150,
    priceLabel: "Mulher VIP até 23h30 • R$ 80 a R$ 140",
    isFree: false,
    hasVipList: true,
    isTrending: true,
    isAfterHours: true,
    interestedCount: 689,
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    ],
    ticketUrl: "https://www.ingresse.com",
    ticketPartner: "Ingresse",
    instagram: "vilajkoficial",
    whatsapp: "5511999998888",
    benefits: [
      "Mulheres com passe digital entram VIP até 23h30",
      "Garçom dedicado nos camarotes e bistrôs",
      "Combo de Gin com preço promocional até 00h",
      "Serviço de Valet exclusivo na porta",
    ],
    dressCode: "Esporte Fino / Noite Chic",
    minAge: 18,
  },
  {
    id: "event-tokyo-rooftop-disco",
    venueId: "balada-tokyo",
    venueName: "Tokyo Rooftop & Karaokê",
    neighborhood: "Bela Vista",
    address: "R. Maj. Sertório, 110 - Vila Buarque / Centro, São Paulo - SP",
    coordinates: { lat: -23.5468, lng: -46.6472 },
    title: "TOKYO DISCO LIGHTS • ROOFTOP & KARAOKÊ BOX",
    tagline: "Prédio modernista de 9 andares com pista panorâmica a céu aberto, pop, funk e karaokê",
    genre: "funk",
    genreLabel: "Pop, Funk & Disco Rooftop",
    date: "2026-09-26",
    dateLabel: "Hoje • Sábado",
    startTime: "18:00",
    endTime: "05:00",
    durationLabel: "Hoje 18h - 05h",
    lineup: [
      { time: "18:00 - 21:30", artist: "Sunset Karaokê & Coletivo Acústico", role: "Andar 8 / Lounge" },
      { time: "21:30 - 01:30", artist: "DJ Pop 2000 & Hits Brasil", role: "Pista Terraço", highlight: true },
      { time: "01:30 - 05:00", artist: "Pancadão Funk Chic nas Alturas", role: "Pista Open Air", highlight: true },
    ],
    minPrice: 45,
    maxPrice: 80,
    priceLabel: "A partir de R$ 45",
    isFree: false,
    hasVipList: true,
    isTrending: true,
    isAfterHours: true,
    interestedCount: 420,
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80",
    ],
    ticketUrl: "https://www.sympla.com.br",
    ticketPartner: "Sympla",
    instagram: "tokyo.sp",
    whatsapp: "5511955554444",
    benefits: [
      "Vista 360° do Skyline de São Paulo e Edifício Copan",
      "Salas de karaokê box privativas com catálogo atualizado",
      "Restaurante oriental autoral no andar intermediário",
      "Pista a céu aberto sob as estrelas",
    ],
    dressCode: "Livre / Casual Fashion",
    minAge: 18,
  },
  {
    id: "event-tatubola-samba360",
    venueId: "balada-tatubola",
    venueName: "Tatu Bola Bar & Balada",
    neighborhood: "Itaim Bibi",
    address: "R. Clodomiro Amazonas, 202 - Itaim Bibi, São Paulo - SP",
    coordinates: { lat: -23.5857, lng: -46.6806 },
    title: "RODA DE SAMBA 360° & CHOPP TRINCANDO",
    tagline: "A maior roda de pagode do Itaim com chopp gelado, paquera e fita do Bonfim no teto",
    genre: "pagode",
    genreLabel: "Roda de Samba & Pagode",
    date: "2026-09-26",
    dateLabel: "Hoje • Sábado",
    startTime: "17:00",
    endTime: "03:00",
    durationLabel: "Hoje 17h - 03h",
    lineup: [
      { time: "17:00 - 19:30", artist: "Happy Hour com Chopp em Dobro", role: "Entrada Franca" },
      { time: "19:30 - 23:30", artist: "Roda de Pagode 360° no Meio do Salão", role: "Show Ao Vivo", highlight: true },
      { time: "23:30 - 03:00", artist: "DJ Brasilidades & Funk Retrô", role: "Pista Livre" },
    ],
    minPrice: 0,
    maxPrice: 40,
    priceLabel: "🎟 Entrada Grátis até 19h • R$ 40 após",
    isFree: true,
    hasVipList: true,
    isTrending: true,
    isAfterHours: false,
    interestedCount: 512,
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    ],
    ticketPartner: "Portaria",
    instagram: "tatubola.bar",
    whatsapp: "5511988887777",
    benefits: [
      "Entrada 100% gratuita para quem chegar até as 19h",
      "Caipirinhas originais servidas no pote de vidro",
      "Ambiente animado e propício para paquera",
      "Mesas ao ar livre no deque",
    ],
    dressCode: "Descontraído / Casual",
    minAge: 18,
  },
  {
    id: "event-vilamada-snooker-party",
    venueId: "balada-vilamada-snooker",
    venueName: "Vila Madá Lounge, Snooker & Karaokê",
    neighborhood: "Vila Madalena",
    address: "R. Aspicuelta, 420 - Vila Madalena, São Paulo - SP",
    coordinates: { lat: -23.5552, lng: -46.6905 },
    title: "VILA MADÁ SESSIONS • SNOOKER, HOOKAH & SERTANEJO",
    tagline: "O combo mais procurado da Vila: jogue sinuca com narguilé, cante no karaokê e curta banda ao vivo",
    genre: "barzinho",
    genreLabel: "Sinuca, Narguilé & Barzinho",
    date: "2026-09-26",
    dateLabel: "Hoje • Sábado",
    startTime: "18:00",
    endTime: "05:00",
    durationLabel: "Hoje 18h - 05h",
    lineup: [
      { time: "18:00 - 21:00", artist: "Torneio Relâmpago de Sinuca & Happy Hour", role: "Mesas Oficiais" },
      { time: "21:00 - 00:30", artist: "Acústico Sertanejo & Pop Rock Ao Vivo", role: "Palco Central", highlight: true },
      { time: "00:30 - 05:00", artist: "Karaokê com Telão & DJ Open Format", role: "Até o Amanhecer", highlight: true },
    ],
    minPrice: 30,
    maxPrice: 50,
    priceLabel: "Mulher VIP até 22h • R$ 30 a R$ 50 após",
    isFree: false,
    hasVipList: true,
    isTrending: false,
    isAfterHours: true,
    interestedCount: 310,
    imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80",
    ],
    ticketPartner: "Portaria",
    instagram: "vilamada.snooker",
    whatsapp: "5511977112233",
    benefits: [
      "Mesas de sinuca com giz e tacos profissionais",
      "Espaço narguilé climatizado com essências importadas",
      "Torre de Chopp 2.5L trincando com colarinho cremoso",
      "Passe VIP digital aceito direto na catraca",
    ],
    dressCode: "Casual",
    minAge: 18,
  },
  {
    id: "event-hookah-snooker-tatuape",
    venueId: "balada-hookah-snooker-tatuape",
    venueName: "Hookah Snooker & Karaokê Club",
    neighborhood: "Tatuapé",
    address: "R. Serra de Japi, 780 - Tatuapé, São Paulo - SP",
    coordinates: { lat: -23.5412, lng: -46.5721 },
    title: "SNOW NIGHT SNOOKER & SAMBA NA ZONA LESTE",
    tagline: "8 mesas de snooker oficiais, narguilé premium, karaokê box e roda de samba ao vivo",
    genre: "barzinho",
    genreLabel: "Sinuca Club & Pagode",
    date: "2026-09-26",
    dateLabel: "Hoje • Sábado",
    startTime: "17:00",
    endTime: "05:00",
    durationLabel: "Hoje 17h - 05h",
    lineup: [
      { time: "17:00 - 20:00", artist: "Entrada Franca • Mesa de Sinuca Free", role: "Warmup da Tarde" },
      { time: "20:00 - 23:30", artist: "Roda de Samba & Pagode com Amigos", role: "Show Ao Vivo", highlight: true },
      { time: "23:30 - 05:00", artist: "DJ Baile Funk & Eletrônica até 05h", role: "Pista Noturna", highlight: true },
    ],
    minPrice: 0,
    maxPrice: 35,
    priceLabel: "🎟 Entrada Franca até 20h • R$ 35 após",
    isFree: true,
    hasVipList: true,
    isTrending: false,
    isAfterHours: true,
    interestedCount: 295,
    imageUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80",
    ticketPartner: "Portaria",
    instagram: "hookahsnooker.tatuape",
    whatsapp: "5511988223344",
    benefits: [
      "Entrada gratuita até 20h com QR code no app",
      "8 mesas de bilhar profissionais com pano veludo verde",
      "Balde de cerveja long neck com desconto especial",
      "Cabines acústicas de karaokê",
    ],
    dressCode: "Casual",
    minAge: 18,
  },
  {
    id: "event-cantodaema-forro",
    venueId: "balada-cantodaema",
    venueName: "Canto da Ema Forró",
    neighborhood: "Pinheiros",
    address: "Av. Brg. Faria Lima, 364 - Pinheiros, São Paulo - SP",
    coordinates: { lat: -23.5684, lng: -46.6978 },
    title: "FORRÓ DE SÁBADO NO CANTO • TRIO PÉ DE SERRA",
    tagline: "A casa mais tradicional de forró pé de serra de SP com aula cortesia de dança às 21h",
    genre: "pagode",
    genreLabel: "Forró Tradicional & Baião",
    date: "2026-09-26",
    dateLabel: "Hoje • Sábado",
    startTime: "20:30",
    endTime: "04:00",
    durationLabel: "Hoje 20h30 - 04h",
    lineup: [
      { time: "20:30 - 21:30", artist: "Aula Aberta e Cortesia de Forró", role: "Para Todos os Níveis" },
      { time: "21:30 - 00:30", artist: "Trio Nordestino Ao Vivo", role: "Show Pé de Serra", highlight: true },
      { time: "00:30 - 04:00", artist: "Grupo Convidado de Xote & Rastapé", role: "Madrugada Dançante", highlight: true },
    ],
    minPrice: 35,
    maxPrice: 50,
    priceLabel: "R$ 35 até 21h30 • R$ 50 após",
    isFree: false,
    hasVipList: true,
    isTrending: false,
    isAfterHours: false,
    interestedCount: 240,
    imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80",
    ticketPartner: "Sympla",
    ticketUrl: "https://www.sympla.com.br",
    instagram: "cantodaema",
    whatsapp: "5511922221111",
    benefits: [
      "Aula de dança cortesia inclusa no valor da entrada",
      "Pista de madeira encerada especial para dançarinos",
      "Ambiente super acolhedor e seguro",
      "Petiscos típicos do nordeste e cachaças artesanais",
    ],
    dressCode: "Livre e Confortável para Dançar",
    minAge: 18,
  },
  {
    id: "event-morrison-rock-night",
    venueId: "balada-morrison",
    venueName: "Morrison Rock Bar",
    neighborhood: "Pinheiros",
    address: "R. Inácio Pereira da Rocha, 363 - Pinheiros, São Paulo - SP",
    coordinates: { lat: -23.5578, lng: -46.6948 },
    title: "TRIBUTO QUEEN & PEARL JAM • NOITE DO ROCK",
    tagline: "Dois palcos simultâneos com os maiores clássicos do rock n' roll, sinuca e chopp artesanal",
    genre: "rock",
    genreLabel: "Classic Rock & Tributos",
    date: "2026-09-26",
    dateLabel: "Hoje • Sábado",
    startTime: "20:00",
    endTime: "04:30",
    durationLabel: "Hoje 20h - 04h30",
    lineup: [
      { time: "20:00 - 22:30", artist: "Voz & Violão Grunge no Lounge", role: "Palco Mezanino" },
      { time: "22:30 - 01:00", artist: "Especial Queen Tribute Brasil", role: "Palco Principal", highlight: true },
      { time: "01:00 - 04:30", artist: "Tributo Pearl Jam & Nirvana", role: "Madrugada Rock", highlight: true },
    ],
    minPrice: 30,
    maxPrice: 45,
    priceLabel: "R$ 30 até 22h • R$ 45 após",
    isFree: false,
    hasVipList: true,
    isTrending: false,
    isAfterHours: false,
    interestedCount: 265,
    imageUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
    ticketPartner: "Portaria",
    instagram: "morrisonrockbar",
    whatsapp: "5511933332222",
    benefits: [
      "Chopp IPA artesanal trincando",
      "Dois palcos com bandas covers premiadas",
      "Mesa de sinuca no piso superior",
      "Desconto com nome na lista VIP até 22h",
    ],
    dressCode: "Rock / Casual",
    minAge: 18,
  },
  {
    id: "event-lush-after-lounge",
    venueId: "motel-lush",
    venueName: "Lush Motel Design",
    neighborhood: "Ipiranga",
    address: "Av. do Estado, 6600 - Ipiranga, São Paulo - SP",
    coordinates: { lat: -23.5855, lng: -46.608 },
    title: "MODO AFTER 24H • SUÍTE SPA COM PISCINA PRIVATIVA",
    tagline: "Termine a balada em grande estilo com piscina aquecida privativa, cascata, teto solar e alta gastronomia",
    genre: "barzinho",
    genreLabel: "Modo After & Suítes de Luxo",
    date: "2026-09-26",
    dateLabel: "Hoje • Madrugada 24h",
    startTime: "04:00",
    endTime: "16:00",
    durationLabel: "Aberto 24h • Modo After",
    lineup: [
      { time: "04:00 - 07:00", artist: "Check-in Madrugada After Hours", role: "Garagem Privativa" },
      { time: "07:00 - 11:00", artist: "Piscina Aquecida & Som Bluetooth", role: "Lazer Privativo", highlight: true },
      { time: "11:00 - 14:00", artist: "Café da Manhã & Relax SPA", role: "Cardápio 24h", highlight: true },
    ],
    minPrice: 180,
    maxPrice: 350,
    priceLabel: "Período 4h a partir de R$ 180",
    isFree: false,
    hasVipList: false,
    isTrending: true,
    isAfterHours: true,
    interestedCount: 188,
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    ticketPartner: "Sympla",
    instagram: "lushmotel",
    whatsapp: "5511988881111",
    benefits: [
      "Suíte SPA com piscina aquecida privativa e teto solar retrátil",
      "Garagem automática privativa para 2 carros",
      "Automação total via tablet com som bluetooth",
      "Cardápio com pratos quentes e espumante 24h",
    ],
    dressCode: "Livre",
    minAge: 18,
  },
];

export function getAllEvents(): Event[] {
  return EVENTS_DATA;
}

export function getEventById(id: string): Event | undefined {
  return EVENTS_DATA.find((e) => e.id === id);
}

export function filterEvents(
  events: Event[],
  filter: {
    category: string;
    searchQuery?: string;
    userLocation?: { lat: number; lng: number } | null;
  }
): Event[] {
  let list = [...events];

  // Filtro por busca de texto
  if (filter.searchQuery && filter.searchQuery.trim().length > 0) {
    const q = filter.searchQuery.toLowerCase().trim();
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.venueName.toLowerCase().includes(q) ||
        e.neighborhood.toLowerCase().includes(q) ||
        e.genreLabel.toLowerCase().includes(q) ||
        e.tagline.toLowerCase().includes(q) ||
        e.lineup.some((l) => l.artist.toLowerCase().includes(q))
    );
  }

  // Filtro por pílula
  switch (filter.category) {
    case "bombando":
      list = list.filter((e) => e.isTrending);
      break;
    case "gratis":
      list = list.filter((e) => e.isFree);
      break;
    case "vip":
      list = list.filter((e) => e.hasVipList);
      break;
    case "after":
      list = list.filter((e) => e.isAfterHours);
      break;
    case "eletronica":
      list = list.filter((e) => e.genre === "eletronica");
      break;
    case "pagode":
      list = list.filter((e) => e.genre === "pagode");
      break;
    case "sertanejo":
      list = list.filter((e) => e.genre === "sertanejo");
      break;
    case "rock":
      list = list.filter((e) => e.genre === "rock");
      break;
    case "bares":
      list = list.filter((e) => e.genre === "barzinho");
      break;
    case "perto":
      if (filter.userLocation) {
        list.sort((a, b) => {
          const distA = calculateDistanceKm(
            filter.userLocation!.lat,
            filter.userLocation!.lng,
            a.coordinates.lat,
            a.coordinates.lng
          );
          const distB = calculateDistanceKm(
            filter.userLocation!.lat,
            filter.userLocation!.lng,
            b.coordinates.lat,
            b.coordinates.lng
          );
          return distA - distB;
        });
      }
      break;
    default:
      break;
  }

  return list;
}
