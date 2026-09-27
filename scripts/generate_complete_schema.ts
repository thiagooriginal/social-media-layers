import { VENUES_DATA } from "../src/data/venues";
import { EVENTS_DATA } from "../src/data/events";
import * as fs from "fs";
import * as path from "path";

function escapeSql(str: string | undefined | null): string {
  if (str === undefined || str === null) return "NULL";
  return "'" + str.replace(/'/g, "''") + "'";
}

function arrayToSql(arr: string[] | undefined | null): string {
  if (!arr || arr.length === 0) return "'{}'::text[]";
  return `ARRAY[${arr.map((item) => escapeSql(item)).join(", ")}]::text[]`;
}

function jsonToSql(obj: any): string {
  if (!obj) return "'[]'::jsonb";
  return escapeSql(JSON.stringify(obj)) + "::jsonb";
}

let sql = `-- ==============================================================================
-- BALADA ON / RADAR DO ROLÊ - COMPLETE PRODUCTION SUPABASE SCHEMA
-- Generated automatically with 26 São Paulo Venues & 9 Events
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. VENUES TABLE (Baladas, Restaurantes & Motéis)
CREATE TABLE IF NOT EXISTS public.venues (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('baladas', 'restaurantes', 'moteis')),
  name TEXT NOT NULL,
  tagline TEXT,
  genre TEXT,
  cuisine TEXT,
  motel_style TEXT,
  sub_type TEXT NOT NULL,
  sub_type_emoji TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  image TEXT NOT NULL,
  gallery TEXT[] DEFAULT '{}'::text[],
  rating NUMERIC(3, 2) DEFAULT 4.8 NOT NULL,
  reviews_count INTEGER DEFAULT 100 NOT NULL,
  open_today BOOLEAN DEFAULT true NOT NULL,
  open_hours TEXT NOT NULL,
  price_category TEXT DEFAULT 'medium' CHECK (price_category IN ('free', 'low', 'medium', 'high')),
  entry_price TEXT NOT NULL,
  price_description TEXT,
  has_vip_list BOOLEAN DEFAULT false NOT NULL,
  allows_reservation BOOLEAN DEFAULT false NOT NULL,
  has_kids_space BOOLEAN DEFAULT false NOT NULL,
  is_open_bar BOOLEAN DEFAULT false NOT NULL,
  is_women_free BOOLEAN DEFAULT false NOT NULL,
  has_parking BOOLEAN DEFAULT false NOT NULL,
  has_hydro BOOLEAN DEFAULT false NOT NULL,
  has_pool BOOLEAN DEFAULT false NOT NULL,
  has_private_garage BOOLEAN DEFAULT false NOT NULL,
  period_hours TEXT,
  is_after_hours BOOLEAN DEFAULT false NOT NULL,
  closes_at TEXT,
  whatsapp TEXT NOT NULL,
  instagram TEXT,
  highlight TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  lineup TEXT[] DEFAULT '{}'::text[],
  menu_highlights TEXT[] DEFAULT '{}'::text[],
  amenities TEXT[] DEFAULT '{}'::text[],
  plan TEXT DEFAULT 'semestral',
  plan_price NUMERIC DEFAULT 59,
  is_verified BOOLEAN DEFAULT true NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL
);

-- Indexes for lightning fast queries & filters
CREATE INDEX IF NOT EXISTS idx_venues_category ON public.venues(category);
CREATE INDEX IF NOT EXISTS idx_venues_neighborhood ON public.venues(neighborhood);
CREATE INDEX IF NOT EXISTS idx_venues_genre ON public.venues(genre);
CREATE INDEX IF NOT EXISTS idx_venues_cuisine ON public.venues(cuisine);
CREATE INDEX IF NOT EXISTS idx_venues_rating ON public.venues(rating DESC);

-- 3. EVENTS TABLE (Agenda de Eventos, Superafters & Festas)
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  venue_id TEXT REFERENCES public.venues(id) ON DELETE CASCADE,
  venue_name TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  genre TEXT NOT NULL,
  genre_label TEXT NOT NULL,
  date DATE NOT NULL,
  date_label TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration_label TEXT NOT NULL,
  lineup JSONB DEFAULT '[]'::jsonb,
  min_price NUMERIC DEFAULT 0 NOT NULL,
  max_price NUMERIC DEFAULT 0 NOT NULL,
  price_label TEXT NOT NULL,
  is_free BOOLEAN DEFAULT false NOT NULL,
  has_vip_list BOOLEAN DEFAULT false NOT NULL,
  is_trending BOOLEAN DEFAULT false NOT NULL,
  is_after_hours BOOLEAN DEFAULT false NOT NULL,
  interested_count INTEGER DEFAULT 0 NOT NULL,
  image_url TEXT NOT NULL,
  gallery TEXT[] DEFAULT '{}'::text[],
  ticket_url TEXT,
  ticket_partner TEXT,
  instagram TEXT,
  whatsapp TEXT,
  benefits TEXT[] DEFAULT '{}'::text[],
  dress_code TEXT,
  min_age INTEGER DEFAULT 18
);

CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_venue ON public.events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_trending ON public.events(is_trending);

-- 4. VIP LIST LEADS TABLE (Cadastros de Lista VIP & Conversão)
CREATE TABLE IF NOT EXISTS public.vip_list_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  venue_id TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_whatsapp TEXT NOT NULL,
  user_rg TEXT,
  guests_count INTEGER DEFAULT 1 NOT NULL,
  event_date DATE DEFAULT CURRENT_DATE NOT NULL,
  pass_code TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'cancelled')),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_vip_leads_venue ON public.vip_list_leads(venue_id);
CREATE INDEX IF NOT EXISTS idx_vip_leads_date ON public.vip_list_leads(event_date);

-- 5. RESERVATIONS TABLE (Reservas de Restaurantes & Lounges)
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  venue_id TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_whatsapp TEXT NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TEXT NOT NULL,
  party_size INTEGER DEFAULT 2 NOT NULL,
  has_kids BOOLEAN DEFAULT false NOT NULL,
  special_requests TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_reservations_venue ON public.reservations(venue_id);

-- 6. EVENT ATTENDANCE / CONFIRMATIONS ("🔥 Eu Vou")
CREATE TABLE IF NOT EXISTS public.event_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  venue_id TEXT REFERENCES public.venues(id) ON DELETE CASCADE,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  user_name TEXT,
  user_whatsapp TEXT,
  user_id UUID
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_list_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_confirmations ENABLE ROW LEVEL SECURITY;

-- Venues Policies:
DROP POLICY IF EXISTS "Public can view venues" ON public.venues;
CREATE POLICY "Public can view venues" ON public.venues FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert venues" ON public.venues;
CREATE POLICY "Public can insert venues" ON public.venues FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update venues" ON public.venues;
CREATE POLICY "Public can update venues" ON public.venues FOR UPDATE USING (true);

-- Events Policies:
DROP POLICY IF EXISTS "Public can view events" ON public.events;
CREATE POLICY "Public can view events" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert events" ON public.events;
CREATE POLICY "Public can insert events" ON public.events FOR INSERT WITH CHECK (true);

-- VIP Leads Policies:
DROP POLICY IF EXISTS "Visitors can submit VIP list" ON public.vip_list_leads;
CREATE POLICY "Visitors can submit VIP list" ON public.vip_list_leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view VIP leads" ON public.vip_list_leads;
CREATE POLICY "Public can view VIP leads" ON public.vip_list_leads FOR SELECT USING (true);

-- Reservations Policies:
DROP POLICY IF EXISTS "Visitors can submit reservations" ON public.reservations;
CREATE POLICY "Visitors can submit reservations" ON public.reservations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view reservations" ON public.reservations;
CREATE POLICY "Public can view reservations" ON public.reservations FOR SELECT USING (true);

-- Event Confirmations Policies:
DROP POLICY IF EXISTS "Visitors can confirm attendance" ON public.event_confirmations;
CREATE POLICY "Visitors can confirm attendance" ON public.event_confirmations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view confirmations" ON public.event_confirmations;
CREATE POLICY "Public can view confirmations" ON public.event_confirmations FOR SELECT USING (true);

-- ==============================================================================
-- SEED DATA: 26 VENUES (SÃO PAULO)
-- ==============================================================================
`;

for (const v of VENUES_DATA) {
  sql += `
INSERT INTO public.venues (
  id, category, name, tagline, genre, cuisine, motel_style, sub_type, sub_type_emoji,
  neighborhood, address, latitude, longitude, image, gallery, rating, reviews_count,
  open_today, open_hours, price_category, entry_price, price_description, has_vip_list,
  allows_reservation, has_kids_space, is_open_bar, is_women_free, has_parking,
  has_hydro, has_pool, has_private_garage, period_hours, is_after_hours, closes_at,
  whatsapp, instagram, highlight, tags, lineup, menu_highlights, amenities, plan, plan_price
) VALUES (
  ${escapeSql(v.id)},
  ${escapeSql(v.category)},
  ${escapeSql(v.name)},
  ${escapeSql(v.tagline)},
  ${escapeSql(v.genre)},
  ${escapeSql(v.cuisine)},
  ${escapeSql(v.motelStyle)},
  ${escapeSql(v.subType)},
  ${escapeSql(v.subTypeEmoji)},
  ${escapeSql(v.neighborhood)},
  ${escapeSql(v.address)},
  ${v.coordinates.lat},
  ${v.coordinates.lng},
  ${escapeSql(v.image)},
  ${arrayToSql(v.gallery)},
  ${v.rating},
  ${v.reviewsCount},
  ${v.openToday ? "true" : "false"},
  ${escapeSql(v.openHours)},
  ${escapeSql(v.priceCategory)},
  ${escapeSql(v.entryPrice)},
  ${escapeSql(v.priceDescription)},
  ${v.hasVipList ? "true" : "false"},
  ${v.allowsReservation ? "true" : "false"},
  ${v.hasKidsSpace ? "true" : "false"},
  ${v.isOpenBar ? "true" : "false"},
  ${v.isWomenFree ? "true" : "false"},
  ${v.hasParking ? "true" : "false"},
  ${v.hasHydro ? "true" : "false"},
  ${v.hasPool ? "true" : "false"},
  ${v.hasPrivateGarage ? "true" : "false"},
  ${escapeSql(v.periodHours)},
  ${v.isAfterHours ? "true" : "false"},
  ${escapeSql(v.closesAt)},
  ${escapeSql(v.whatsapp)},
  ${escapeSql(v.instagram)},
  ${escapeSql(v.highlight)},
  ${arrayToSql(v.tags)},
  ${arrayToSql(v.lineup)},
  ${arrayToSql(v.menuHighlights)},
  ${arrayToSql(v.amenities)},
  ${escapeSql(v.plan || "semestral")},
  ${v.planPrice || 59}
) ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  genre = EXCLUDED.genre,
  cuisine = EXCLUDED.cuisine,
  motel_style = EXCLUDED.motel_style,
  sub_type = EXCLUDED.sub_type,
  sub_type_emoji = EXCLUDED.sub_type_emoji,
  neighborhood = EXCLUDED.neighborhood,
  address = EXCLUDED.address,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  image = EXCLUDED.image,
  gallery = EXCLUDED.gallery,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  open_today = EXCLUDED.open_today,
  open_hours = EXCLUDED.open_hours,
  price_category = EXCLUDED.price_category,
  entry_price = EXCLUDED.entry_price,
  price_description = EXCLUDED.price_description,
  has_vip_list = EXCLUDED.has_vip_list,
  allows_reservation = EXCLUDED.allows_reservation,
  has_kids_space = EXCLUDED.has_kids_space,
  is_open_bar = EXCLUDED.is_open_bar,
  is_women_free = EXCLUDED.is_women_free,
  has_parking = EXCLUDED.has_parking,
  has_hydro = EXCLUDED.has_hydro,
  has_pool = EXCLUDED.has_pool,
  has_private_garage = EXCLUDED.has_private_garage,
  period_hours = EXCLUDED.period_hours,
  is_after_hours = EXCLUDED.is_after_hours,
  closes_at = EXCLUDED.closes_at,
  whatsapp = EXCLUDED.whatsapp,
  instagram = EXCLUDED.instagram,
  highlight = EXCLUDED.highlight,
  tags = EXCLUDED.tags,
  lineup = EXCLUDED.lineup,
  menu_highlights = EXCLUDED.menu_highlights,
  amenities = EXCLUDED.amenities,
  updated_at = now();
`;
}

sql += `
-- ==============================================================================
-- SEED DATA: 9 EVENTS (SÃO PAULO AGENDA & SUPERAFTES)
-- ==============================================================================
`;

for (const e of EVENTS_DATA) {
  sql += `
INSERT INTO public.events (
  id, venue_id, venue_name, neighborhood, address, latitude, longitude,
  title, tagline, genre, genre_label, date, date_label, start_time, end_time,
  duration_label, lineup, min_price, max_price, price_label, is_free,
  has_vip_list, is_trending, is_after_hours, interested_count, image_url,
  gallery, ticket_url, ticket_partner, instagram, whatsapp, benefits, dress_code, min_age
) VALUES (
  ${escapeSql(e.id)},
  ${escapeSql(e.venueId)},
  ${escapeSql(e.venueName)},
  ${escapeSql(e.neighborhood)},
  ${escapeSql(e.address)},
  ${e.coordinates.lat},
  ${e.coordinates.lng},
  ${escapeSql(e.title)},
  ${escapeSql(e.tagline)},
  ${escapeSql(e.genre)},
  ${escapeSql(e.genreLabel)},
  ${escapeSql(e.date)},
  ${escapeSql(e.dateLabel)},
  ${escapeSql(e.startTime)},
  ${escapeSql(e.endTime)},
  ${escapeSql(e.durationLabel)},
  ${jsonToSql(e.lineup)},
  ${e.minPrice},
  ${e.maxPrice},
  ${escapeSql(e.priceLabel)},
  ${e.isFree ? "true" : "false"},
  ${e.hasVipList ? "true" : "false"},
  ${e.isTrending ? "true" : "false"},
  ${e.isAfterHours ? "true" : "false"},
  ${e.interestedCount},
  ${escapeSql(e.imageUrl)},
  ${arrayToSql(e.gallery)},
  ${escapeSql(e.ticketUrl)},
  ${escapeSql(e.ticketPartner)},
  ${escapeSql(e.instagram)},
  ${escapeSql(e.whatsapp)},
  ${arrayToSql(e.benefits)},
  ${escapeSql(e.dressCode)},
  ${e.minAge || 18}
) ON CONFLICT (id) DO UPDATE SET
  venue_id = EXCLUDED.venue_id,
  venue_name = EXCLUDED.venue_name,
  neighborhood = EXCLUDED.neighborhood,
  address = EXCLUDED.address,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  genre = EXCLUDED.genre,
  genre_label = EXCLUDED.genre_label,
  date = EXCLUDED.date,
  date_label = EXCLUDED.date_label,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  duration_label = EXCLUDED.duration_label,
  lineup = EXCLUDED.lineup,
  min_price = EXCLUDED.min_price,
  max_price = EXCLUDED.max_price,
  price_label = EXCLUDED.price_label,
  is_free = EXCLUDED.is_free,
  has_vip_list = EXCLUDED.has_vip_list,
  is_trending = EXCLUDED.is_trending,
  is_after_hours = EXCLUDED.is_after_hours,
  interested_count = EXCLUDED.interested_count,
  image_url = EXCLUDED.image_url,
  gallery = EXCLUDED.gallery,
  ticket_url = EXCLUDED.ticket_url,
  ticket_partner = EXCLUDED.ticket_partner,
  instagram = EXCLUDED.instagram,
  whatsapp = EXCLUDED.whatsapp,
  benefits = EXCLUDED.benefits,
  dress_code = EXCLUDED.dress_code,
  min_age = EXCLUDED.min_age,
  updated_at = now();
`;
}

const rootPath = path.resolve(process.cwd(), "supabase_schema.sql");
const migPath = path.resolve(process.cwd(), "supabase/migrations/20260927_full_production_schema.sql");

fs.writeFileSync(rootPath, sql, "utf-8");
fs.writeFileSync(migPath, sql, "utf-8");

console.log("SUCCESS: Schema and seed written to:");
console.log(" ->", rootPath);
console.log(" ->", migPath);
console.log(`Generated ${VENUES_DATA.length} venues and ${EVENTS_DATA.length} events seed SQL.`);
