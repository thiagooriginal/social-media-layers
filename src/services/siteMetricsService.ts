import { supabase } from "../integrations/supabase/client";

export interface RealPageview {
  id: string;
  visitorId: string;
  path: string;
  referrer: string;
  device: "mobile" | "desktop" | "tablet";
  browser: string;
  timestamp: string;
}

export interface RealEvent {
  id: string;
  visitorId: string;
  type: "whatsapp" | "uber" | "vip_list" | "venue_click" | "register" | "search";
  target: string;
  path: string;
  timestamp: string;
}

export interface RealPresenceVisitor {
  visitorId: string;
  path: string;
  device: "mobile" | "desktop" | "tablet";
  enteredAt: string;
  lastPing: string;
}

export interface RealSiteMetricsSummary {
  onlineCount: number;
  totalPageviews: number;
  uniqueVisitors: number;
  todayPageviews: number;
  todayUnique: number;
  yesterdayPageviews: number;
  weeklyPageviews: number;
  hourlyEvolution: { hour: string; count: number }[];
  dailyEvolution: { date: string; label: string; count: number; unique: number }[];
  topPages: { path: string; label: string; count: number; percentage: number }[];
  deviceBreakdown: { mobile: number; desktop: number; tablet: number };
  eventsCount: {
    whatsapp: number;
    uber: number;
    vip_list: number;
    venue_clicks: number;
    total: number;
  };
  recentLogs: RealPageview[];
}

const STORAGE_KEY_VISITOR = "radar_visitor_id";
const STORAGE_KEY_LOCAL_PVS = "radar_local_pageviews";
const STORAGE_KEY_LOCAL_EVENTS = "radar_local_events";

// Get or generate permanent anonymous visitor ID
export function getVisitorId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = localStorage.getItem(STORAGE_KEY_VISITOR);
    if (!id) {
      id = "v_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
      localStorage.setItem(STORAGE_KEY_VISITOR, id);
    }
    return id;
  } catch (e) {
    return "anon_" + Date.now();
  }
}

// Detect Device category
export function detectDevice(): "mobile" | "desktop" | "tablet" {
  if (typeof window === "undefined" || !navigator) return "desktop";
  const ua = (navigator.userAgent || "").toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

// Detect simple browser label
export function detectBrowser(): string {
  if (typeof window === "undefined" || !navigator) return "Navegador";
  const ua = navigator.userAgent;
  if (/Instagram/i.test(ua)) return "Instagram App";
  if (/WhatsApp/i.test(ua)) return "WhatsApp App";
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return "Chrome";
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  if (/Edg/i.test(ua)) return "Edge";
  if (/Firefox/i.test(ua)) return "Firefox";
  return "Outro";
}

// Local storage buffer helpers
function getLocalPageviews(): RealPageview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_PVS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalPageviews(list: RealPageview[]) {
  if (typeof window === "undefined") return;
  try {
    // Keep max 200 items locally
    const sliced = list.slice(-200);
    localStorage.setItem(STORAGE_KEY_LOCAL_PVS, JSON.stringify(sliced));
  } catch (e) {}
}

function getLocalEvents(): RealEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_EVENTS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalEvents(list: RealEvent[]) {
  if (typeof window === "undefined") return;
  try {
    const sliced = list.slice(-200);
    localStorage.setItem(STORAGE_KEY_LOCAL_EVENTS, JSON.stringify(sliced));
  } catch (e) {}
}

let lastTrackedPath = "";
let lastTrackedTime = 0;

// Track a Real Pageview
export async function trackPageView(pathOverride?: string): Promise<void> {
  if (typeof window === "undefined") return;

  const currentPath = pathOverride || window.location.pathname || "/";
  const now = Date.now();

  // Deduplicate exact same path within 3 seconds (avoid duplicate mount triggers)
  if (currentPath === lastTrackedPath && now - lastTrackedTime < 3000) {
    return;
  }

  lastTrackedPath = currentPath;
  lastTrackedTime = now;

  const pageview: RealPageview = {
    id: "pv_" + now + "_" + Math.random().toString(36).substring(2, 6),
    visitorId: getVisitorId(),
    path: currentPath,
    referrer: document.referrer ? new URL(document.referrer, window.location.origin).hostname : "Acesso Direto",
    device: detectDevice(),
    browser: detectBrowser(),
    timestamp: new Date().toISOString(),
  };

  // 1. Save in local buffer immediately
  const localList = getLocalPageviews();
  localList.push(pageview);
  saveLocalPageviews(localList);

  // 2. Persist to Supabase in background
  try {
    await (supabase as any).from("event_confirmations").insert({
      venue_id: "balada-vilajk", // guaranteed valid venue foreign key
      user_name: `[SITE_PAGEVIEW]:${JSON.stringify(pageview)}`,
    });
  } catch (err) {
    // Silent fail if network is flaky; local buffer preserved
  }
}

// Track a Real Event (click WhatsApp, Uber, VIP list, etc.)
export async function trackRealSiteEvent(
  type: RealEvent["type"],
  target: string,
  pathOverride?: string
): Promise<void> {
  if (typeof window === "undefined") return;

  const event: RealEvent = {
    id: "evt_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    visitorId: getVisitorId(),
    type,
    target,
    path: pathOverride || window.location.pathname || "/",
    timestamp: new Date().toISOString(),
  };

  // 1. Local buffer
  const local = getLocalEvents();
  local.push(event);
  saveLocalEvents(local);

  // 2. Supabase persistence
  try {
    await (supabase as any).from("event_confirmations").insert({
      venue_id: "balada-vilajk",
      user_name: `[SITE_EVENT]:${JSON.stringify(event)}`,
    });
  } catch (e) {}
}

// Supabase Realtime Presence Client for Live Visitors
let liveChannel: any = null;

export function subscribeToRealtimePresence(
  onSync: (activePresences: RealPresenceVisitor[]) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const visitorId = getVisitorId();
  const device = detectDevice();
  const currentPath = window.location.pathname || "/";

  liveChannel = supabase.channel("site_realtime_presence", {
    config: {
      presence: {
        key: visitorId,
      },
    },
  });

  const extractPresences = (): RealPresenceVisitor[] => {
    if (!liveChannel) return [];
    const state = liveChannel.presenceState();
    const result: RealPresenceVisitor[] = [];
    Object.keys(state).forEach((key) => {
      const items = state[key] as any[];
      if (Array.isArray(items) && items.length > 0) {
        const p = items[items.length - 1];
        result.push({
          visitorId: key,
          path: p.path || "/",
          device: p.device || "desktop",
          enteredAt: p.enteredAt || new Date().toISOString(),
          lastPing: p.lastPing || new Date().toISOString(),
        });
      }
    });
    return result;
  };

  liveChannel
    .on("presence", { event: "sync" }, () => {
      onSync(extractPresences());
    })
    .on("presence", { event: "join" }, () => {
      onSync(extractPresences());
    })
    .on("presence", { event: "leave" }, () => {
      onSync(extractPresences());
    })
    .subscribe(async (status: string) => {
      if (status === "SUBSCRIBED") {
        await liveChannel.track({
          visitorId,
          path: currentPath,
          device,
          enteredAt: new Date().toISOString(),
          lastPing: new Date().toISOString(),
        });
        onSync(extractPresences());
      }
    });

  // Keep presence alive with heartbeat every 20 seconds
  const heartbeatTimer = setInterval(async () => {
    if (liveChannel && liveChannel.state === "joined") {
      await liveChannel.track({
        visitorId,
        path: window.location.pathname || "/",
        device,
        lastPing: new Date().toISOString(),
      });
    }
  }, 20000);

  return () => {
    clearInterval(heartbeatTimer);
    if (liveChannel) {
      try {
        liveChannel.unsubscribe();
      } catch (e) {}
    }
  };
}

// Fetch all REAL metrics without any simulated or fictitious numbers
export async function fetchRealSiteMetrics(): Promise<RealSiteMetricsSummary> {
  const pageviewsMap = new Map<string, RealPageview>();
  const eventsList: RealEvent[] = [];

  // 1. Load from local buffer first (for instant display)
  getLocalPageviews().forEach((pv) => {
    pageviewsMap.set(pv.id, pv);
  });
  getLocalEvents().forEach((evt) => {
    eventsList.push(evt);
  });

  // 2. Fetch all real cloud records from Supabase
  try {
    const { data: cloudRows, error } = await (supabase as any)
      .from("event_confirmations")
      .select("id, user_name, created_at")
      .or("user_name.like.[SITE_PAGEVIEW]:%,user_name.like.[SITE_EVENT]:%")
      .order("created_at", { ascending: false })
      .limit(2000);

    if (cloudRows && !error) {
      cloudRows.forEach((row: any) => {
        try {
          if (row.user_name.startsWith("[SITE_PAGEVIEW]:")) {
            const rawJson = row.user_name.replace("[SITE_PAGEVIEW]:", "");
            const parsed = JSON.parse(rawJson) as RealPageview;
            if (parsed.path) {
              const pv: RealPageview = {
                ...parsed,
                timestamp: parsed.timestamp || row.created_at,
              };
              pageviewsMap.set(parsed.id || row.id, pv);
            }
          } else if (row.user_name.startsWith("[SITE_EVENT]:")) {
            const rawJson = row.user_name.replace("[SITE_EVENT]:", "");
            const parsed = JSON.parse(rawJson) as RealEvent;
            if (parsed.type) {
              eventsList.push({
                ...parsed,
                timestamp: parsed.timestamp || row.created_at,
              });
            }
          }
        } catch (e) {}
      });
    }
  } catch (err) {
    console.warn("Could not fetch remote analytics:", err);
  }

  const allPageviews = Array.from(pageviewsMap.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Time calculations
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOf7Days = startOfToday - 6 * 24 * 60 * 60 * 1000;

  let todayCount = 0;
  let yesterdayCount = 0;
  let weekCount = 0;
  const uniqueAll = new Set<string>();
  const uniqueToday = new Set<string>();

  // Hourly evolution for today (00h to 23h)
  const hourlyBuckets: Record<number, number> = {};
  for (let h = 0; h < 24; h++) hourlyBuckets[h] = 0;

  // Daily evolution for the last 7 days
  const dailyMap = new Map<string, { label: string; count: number; uniqueSet: Set<string> }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateKey = d.toISOString().split("T")[0];
    const weekday = d.toLocaleDateString("pt-BR", { weekday: "short" });
    const dayMonth = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    dailyMap.set(dateKey, {
      label: `${weekday.toUpperCase()} (${dayMonth})`,
      count: 0,
      uniqueSet: new Set<string>(),
    });
  }

  // Top Pages
  const pageHits: Record<string, number> = {};
  // Device Breakdown
  const devices = { mobile: 0, desktop: 0, tablet: 0 };

  allPageviews.forEach((pv) => {
    uniqueAll.add(pv.visitorId);
    const pvTime = new Date(pv.timestamp).getTime();

    // Devices
    if (pv.device === "mobile") devices.mobile++;
    else if (pv.device === "tablet") devices.tablet++;
    else devices.desktop++;

    // Pages
    const p = pv.path || "/";
    pageHits[p] = (pageHits[p] || 0) + 1;

    // Today vs Yesterday
    if (pvTime >= startOfToday) {
      todayCount++;
      uniqueToday.add(pv.visitorId);
      const hour = new Date(pv.timestamp).getHours();
      hourlyBuckets[hour] = (hourlyBuckets[hour] || 0) + 1;
    } else if (pvTime >= startOfYesterday && pvTime < startOfToday) {
      yesterdayCount++;
    }

    if (pvTime >= startOf7Days) {
      weekCount++;
      const dateKey = pv.timestamp.split("T")[0];
      if (dailyMap.has(dateKey)) {
        const item = dailyMap.get(dateKey)!;
        item.count++;
        item.uniqueSet.add(pv.visitorId);
      }
    }
  });

  const totalPageviews = allPageviews.length;

  // Format Top Pages
  const pathLabels: Record<string, string> = {
    "/": "Home • Guia de Baladas & Bares",
    "/admin": "Painel Master Super Admin",
    "/parceiro": "Portal do Parceiro Estabelecimento",
  };

  const topPages = Object.keys(pageHits)
    .map((path) => ({
      path,
      label: pathLabels[path] || (path.startsWith("/admin") ? "Portal Admin" : path),
      count: pageHits[path],
      percentage: totalPageviews > 0 ? Math.round((pageHits[path] / totalPageviews) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Format Daily Evolution
  const dailyEvolution = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    label: data.label,
    count: data.count,
    unique: data.uniqueSet.size,
  }));

  // Format Hourly Evolution (24h)
  const hourlyEvolution = Object.keys(hourlyBuckets).map((hStr) => {
    const h = parseInt(hStr, 10);
    return {
      hour: `${h.toString().padStart(2, "0")}h`,
      count: hourlyBuckets[h],
    };
  });

  // Event Counters
  let waClicks = 0;
  let uberClicks = 0;
  let vipClicks = 0;
  let venueClicks = 0;

  eventsList.forEach((e) => {
    if (e.type === "whatsapp") waClicks++;
    else if (e.type === "uber") uberClicks++;
    else if (e.type === "vip_list") vipClicks++;
    else if (e.type === "venue_click") venueClicks++;
  });

  return {
    onlineCount: 0, // Filled live by presence
    totalPageviews,
    uniqueVisitors: uniqueAll.size,
    todayPageviews: todayCount,
    todayUnique: uniqueToday.size,
    yesterdayPageviews: yesterdayCount,
    weeklyPageviews: weekCount,
    hourlyEvolution,
    dailyEvolution,
    topPages,
    deviceBreakdown: devices,
    eventsCount: {
      whatsapp: waClicks,
      uber: uberClicks,
      vip_list: vipClicks,
      venue_clicks: venueClicks,
      total: eventsList.length,
    },
    recentLogs: allPageviews.slice(0, 30),
  };
}
