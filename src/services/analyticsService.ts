export interface VenueMetrics {
  venueId: string;
  venueName: string;
  impressionsFeed: number; // Quantas pessoas viram na primeira página
  profileClicks: number;   // Quantas clicaram no card para ver detalhes
  whatsappShares: number;  // Quantas compartilharam com amigos no WhatsApp
  whatsappDirectClicks: number; // Quantas clicaram no botão WhatsApp oficial
  vipListLeads: number;    // Quantas emitiram Lista VIP / Reserva
  uberSimulations: number; // Quantas simularam Uber / rota
  conversionRate: number;  // CTR (Profile / Impressions)
  weeklyGrowth: number;    // % de crescimento
}

export interface DayMetric {
  day: string;
  visualizacoes: number;
  cliques: number;
  contatos: number;
}

const STORAGE_KEY_ANALYTICS = "baladaon_analytics_metrics";

// Base realistic seed metrics for established venues
const BASE_SEED: Record<string, Partial<VenueMetrics>> = {
  "balada-vilajk": {
    impressionsFeed: 8420,
    profileClicks: 1650,
    whatsappShares: 412,
    whatsappDirectClicks: 289,
    vipListLeads: 184,
    uberSimulations: 340,
    weeklyGrowth: 24,
  },
  "balada-seujustino": {
    impressionsFeed: 7150,
    profileClicks: 1420,
    whatsappShares: 388,
    whatsappDirectClicks: 215,
    vipListLeads: 142,
    uberSimulations: 290,
    weeklyGrowth: 18,
  },
  "balada-dedge": {
    impressionsFeed: 9200,
    profileClicks: 2100,
    whatsappShares: 530,
    whatsappDirectClicks: 310,
    vipListLeads: 230,
    uberSimulations: 490,
    weeklyGrowth: 31,
  },
  "motel-lush": {
    impressionsFeed: 6800,
    profileClicks: 1540,
    whatsappShares: 395,
    whatsappDirectClicks: 270,
    vipListLeads: 95,
    uberSimulations: 380,
    weeklyGrowth: 28,
  },
  "motel-apple": {
    impressionsFeed: 5400,
    profileClicks: 1120,
    whatsappShares: 290,
    whatsappDirectClicks: 195,
    vipListLeads: 70,
    uberSimulations: 260,
    weeklyGrowth: 15,
  },
};

function getStoredMetrics(): Record<string, VenueMetrics> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ANALYTICS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveStoredMetrics(data: Record<string, VenueMetrics>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(data));
  } catch (e) {}
}

export function getVenueMetrics(venueId: string, venueName: string = "Estabelecimento"): VenueMetrics {
  const stored = getStoredMetrics();

  if (stored[venueId]) {
    return stored[venueId];
  }

  // Generate realistic default for any venue
  const seed = BASE_SEED[venueId] || {};
  const impressions = seed.impressionsFeed || Math.floor(2500 + Math.random() * 3000);
  const clicks = seed.profileClicks || Math.floor(impressions * (0.18 + Math.random() * 0.08));
  const shares = seed.whatsappShares || Math.floor(clicks * (0.2 + Math.random() * 0.1));
  const whatsapp = seed.whatsappDirectClicks || Math.floor(clicks * (0.15 + Math.random() * 0.05));
  const vips = seed.vipListLeads || Math.floor(clicks * (0.09 + Math.random() * 0.05));
  const ubers = seed.uberSimulations || Math.floor(clicks * (0.22 + Math.random() * 0.08));
  const growth = seed.weeklyGrowth || Math.floor(12 + Math.random() * 20);

  const metric: VenueMetrics = {
    venueId,
    venueName,
    impressionsFeed: impressions,
    profileClicks: clicks,
    whatsappShares: shares,
    whatsappDirectClicks: whatsapp,
    vipListLeads: vips,
    uberSimulations: ubers,
    conversionRate: Math.round((clicks / impressions) * 1000) / 10,
    weeklyGrowth: growth,
  };

  stored[venueId] = metric;
  saveStoredMetrics(stored);
  return metric;
}

export type EventType =
  | "view_feed"
  | "open_details"
  | "click_share_whatsapp"
  | "click_whatsapp"
  | "click_vip_list"
  | "click_uber";

export function trackEvent(venueId: string, eventType: EventType, venueName?: string): void {
  const stored = getStoredMetrics();
  const current = stored[venueId] || getVenueMetrics(venueId, venueName);

  if (eventType === "view_feed") {
    current.impressionsFeed += 1;
  } else if (eventType === "open_details") {
    current.profileClicks += 1;
  } else if (eventType === "click_share_whatsapp") {
    current.whatsappShares += 1;
  } else if (eventType === "click_whatsapp") {
    current.whatsappDirectClicks += 1;
  } else if (eventType === "click_vip_list") {
    current.vipListLeads += 1;
  } else if (eventType === "click_uber") {
    current.uberSimulations += 1;
  }

  current.conversionRate =
    Math.round((current.profileClicks / Math.max(1, current.impressionsFeed)) * 1000) / 10;

  stored[venueId] = current;
  saveStoredMetrics(stored);
}

// Generate weekly breakdown for charts
export function getWeeklyChartData(metrics: VenueMetrics): DayMetric[] {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const weights = [0.06, 0.08, 0.11, 0.17, 0.28, 0.22, 0.08]; // Sexta e Sábado com maior pico!

  return days.map((day, idx) => {
    const w = weights[idx];
    return {
      day,
      visualizacoes: Math.round(metrics.impressionsFeed * w),
      cliques: Math.round(metrics.profileClicks * w),
      contatos: Math.round((metrics.whatsappDirectClicks + metrics.whatsappShares) * w),
    };
  });
}
