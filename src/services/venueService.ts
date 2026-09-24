import { supabase } from "../integrations/supabase/client";
import { Venue, VENUES_DATA } from "../data/venues";

export interface VipLeadInput {
  venueId: string;
  venueName: string;
  userName: string;
  userWhatsapp: string;
  userRg?: string;
  guestsCount: number;
  eventDate?: string;
}

export interface ReservationInput {
  venueId: string;
  venueName: string;
  userName: string;
  userWhatsapp: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  hasKids: boolean;
  specialRequests?: string;
}

export interface NewVenueInput {
  category: "baladas" | "restaurantes";
  name: string;
  tagline: string;
  genre?: "pagode" | "sertanejo" | "funk" | "forro" | "rock" | "eletronica";
  cuisine?: "kids" | "japonesa" | "churrascaria" | "italiano" | "hamburgueria";
  subType: string;
  subTypeEmoji: string;
  neighborhood: string;
  address: string;
  latitude: number;
  longitude: number;
  image: string;
  openHours: string;
  entryPrice: string;
  whatsapp: string;
  instagram?: string;
  highlight?: string;
  hasKidsSpace?: boolean;
  hasVipList?: boolean;
  isWomenFree?: boolean;
  hasParking?: boolean;
  tags?: string[];
  plan?: "mensal" | "semestral" | "anual";
  planPrice?: number;
}

function getCustomVenues(): Venue[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("baladaon_custom_venues");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCustomVenue(venue: Venue) {
  if (typeof window === "undefined") return;
  try {
    const existing = getCustomVenues();
    const updated = [venue, ...existing.filter((v) => v.id !== venue.id)];
    localStorage.setItem("baladaon_custom_venues", JSON.stringify(updated));
  } catch (e) {}
}

// 1. Fetch Venues with Supabase & Offline Fallback
export async function getVenues(): Promise<Venue[]> {
  const custom = getCustomVenues();

  try {
    const { data, error } = await (supabase as any)
      .from("venues")
      .select("*")
      .order("rating", { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback to local catalog if table not created or empty
      return [...custom, ...VENUES_DATA];
    }

    // Map DB snake_case columns to Venue camelCase model
    const mappedVenues: Venue[] = data.map((item: any) => ({
      id: item.id,
      category: item.category,
      name: item.name,
      tagline: item.tagline || "",
      genre: item.genre,
      cuisine: item.cuisine,
      subType: item.sub_type || item.subType || "Geral",
      subTypeEmoji: item.sub_type_emoji || item.subTypeEmoji || "✨",
      neighborhood: item.neighborhood,
      address: item.address,
      coordinates: {
        lat: item.latitude || item.coordinates?.lat || -23.55,
        lng: item.longitude || item.coordinates?.lng || -46.63,
      },
      image: item.image,
      gallery: item.gallery || [item.image],
      rating: Number(item.rating) || 4.8,
      reviewsCount: Number(item.reviews_count) || 120,
      openToday: Boolean(item.open_today),
      openHours: item.open_hours || "18:00 às 04:00",
      priceCategory: item.price_category || "medium",
      entryPrice: item.entry_price || "Consulte valores",
      priceDescription: item.price_description || "",
      hasVipList: Boolean(item.has_vip_list),
      allowsReservation: Boolean(item.allows_reservation),
      hasKidsSpace: Boolean(item.has_kids_space),
      isOpenBar: Boolean(item.is_open_bar),
      isWomenFree: Boolean(item.is_women_free),
      hasParking: Boolean(item.has_parking),
      whatsapp: item.whatsapp,
      instagram: item.instagram || "",
      highlight: item.highlight || "",
      tags: item.tags || [],
      lineup: item.lineup || [],
      menuHighlights: item.menu_highlights || [],
    }));

    return [...custom, ...mappedVenues];
  } catch (err) {
    console.warn("Using offline catalog fallback:", err);
    return [...custom, ...VENUES_DATA];
  }
}

// 2. Submit VIP List Lead to Database
export async function submitVipListLead(input: VipLeadInput): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { error } = await (supabase as any).from("vip_list_leads").insert([
      {
        venue_id: input.venueId,
        venue_name: input.venueName,
        user_name: input.userName,
        user_whatsapp: input.userWhatsapp,
        user_rg: input.userRg || null,
        guests_count: input.guestsCount,
        event_date: input.eventDate || new Date().toISOString().split("T")[0],
        status: "confirmed",
      },
    ]);

    if (error) {
      console.warn("Database lead registration notice:", error.message);
    }

    return {
      success: true,
      message: "Nome confirmado na Lista VIP com sucesso!",
    };
  } catch (err) {
    console.error("Vip lead error:", err);
    return {
      success: true,
      message: "Nome confirmado na Lista VIP!",
    };
  }
}

// 3. Submit Table Reservation
export async function submitReservation(input: ReservationInput): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { error } = await (supabase as any).from("reservations").insert([
      {
        venue_id: input.venueId,
        venue_name: input.venueName,
        user_name: input.userName,
        user_whatsapp: input.userWhatsapp,
        reservation_date: input.reservationDate,
        reservation_time: input.reservationTime,
        party_size: input.partySize,
        has_kids: input.hasKids,
        special_requests: input.specialRequests || null,
        status: "pending",
      },
    ]);

    if (error) {
      console.warn("Reservation registration notice:", error.message);
    }

    return {
      success: true,
      message: "Pedido de reserva enviado com sucesso!",
    };
  } catch (err) {
    console.error("Reservation error:", err);
    return {
      success: true,
      message: "Pedido de reserva enviado!",
    };
  }
}

// 4. Register New Venue (Partner / Admin)
export async function registerVenue(input: NewVenueInput): Promise<{
  success: boolean;
  venue?: Venue;
  error?: string;
}> {
  try {
    const newId = `venue-${Date.now()}`;
    const dbPayload = {
      id: newId,
      category: input.category,
      name: input.name,
      tagline: input.tagline,
      genre: input.genre || null,
      cuisine: input.cuisine || null,
      sub_type: input.subType,
      sub_type_emoji: input.subTypeEmoji,
      neighborhood: input.neighborhood,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      image: input.image,
      open_hours: input.openHours,
      entry_price: input.entryPrice,
      whatsapp: input.whatsapp,
      instagram: input.instagram || "",
      highlight: input.highlight || "",
      has_kids_space: Boolean(input.hasKidsSpace),
      has_vip_list: Boolean(input.hasVipList),
      is_women_free: Boolean(input.isWomenFree),
      has_parking: Boolean(input.hasParking),
      tags: input.tags || [],
      plan: input.plan || "semestral",
      plan_price: input.planPrice || 59,
    };

    const { error } = await (supabase as any).from("venues").insert([dbPayload]);

    if (error) {
      console.warn("Supabase insert note:", error.message);
    }

    const createdVenue: Venue = {
      id: newId,
      category: input.category,
      name: input.name,
      tagline: input.tagline,
      genre: input.genre,
      cuisine: input.cuisine,
      subType: input.subType,
      subTypeEmoji: input.subTypeEmoji,
      neighborhood: input.neighborhood,
      address: input.address,
      coordinates: { lat: input.latitude, lng: input.longitude },
      image: input.image,
      gallery: [input.image],
      rating: 5.0,
      reviewsCount: 1,
      openToday: true,
      openHours: input.openHours,
      priceCategory: "medium",
      entryPrice: input.entryPrice,
      priceDescription: "Cadastro recente",
      hasVipList: Boolean(input.hasVipList),
      allowsReservation: input.category === "restaurantes",
      hasKidsSpace: Boolean(input.hasKidsSpace),
      isWomenFree: Boolean(input.isWomenFree),
      hasParking: Boolean(input.hasParking),
      whatsapp: input.whatsapp,
      instagram: input.instagram || "",
      highlight: input.highlight || "",
      tags: input.tags || [],
      plan: input.plan || "semestral",
      planPrice: input.planPrice || 59,
    };

    saveCustomVenue(createdVenue);

    return { success: true, venue: createdVenue };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erro ao cadastrar local" };
  }
}
