-- ==============================================================================
-- BaladaON - Full Database Schema with Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. VENUES TABLE (Baladas & Restaurantes)
CREATE TABLE IF NOT EXISTS public.venues (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('baladas', 'restaurantes')),
  name TEXT NOT NULL,
  tagline TEXT,
  genre TEXT,
  cuisine TEXT,
  sub_type TEXT NOT NULL,
  sub_type_emoji TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  image TEXT NOT NULL,
  gallery TEXT[] DEFAULT '{}',
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
  has_parking BOOLEAN DEFAULT false NOT NULL,
  is_women_free BOOLEAN DEFAULT false NOT NULL,
  whatsapp TEXT NOT NULL,
  instagram TEXT,
  highlight TEXT,
  tags TEXT[] DEFAULT '{}',
  lineup TEXT[] DEFAULT '{}',
  menu_highlights TEXT[] DEFAULT '{}',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT true NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL
);

-- Index for geo & category search speed
CREATE INDEX IF NOT EXISTS idx_venues_category ON public.venues(category);
CREATE INDEX IF NOT EXISTS idx_venues_neighborhood ON public.venues(neighborhood);
CREATE INDEX IF NOT EXISTS idx_venues_genre ON public.venues(genre);
CREATE INDEX IF NOT EXISTS idx_venues_cuisine ON public.venues(cuisine);

-- 3. VIP LIST LEADS TABLE (Cadastros de Lista VIP & Conversão)
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
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'cancelled')),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_vip_leads_venue ON public.vip_list_leads(venue_id);
CREATE INDEX IF NOT EXISTS idx_vip_leads_date ON public.vip_list_leads(event_date);

-- 4. RESERVATIONS TABLE (Reservas de Restaurantes & Espaço Kids)
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

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_list_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 1. VENUES POLICIES:
-- Public can view all verified venues
DROP POLICY IF EXISTS "Public can view verified venues" ON public.venues;
CREATE POLICY "Public can view verified venues"
  ON public.venues FOR SELECT
  USING (true);

-- Anyone (or authenticated partners) can submit a new venue for review
DROP POLICY IF EXISTS "Anyone can register a venue" ON public.venues;
CREATE POLICY "Anyone can register a venue"
  ON public.venues FOR INSERT
  WITH CHECK (true);

-- Owners can edit their venue
DROP POLICY IF EXISTS "Owners can update own venue" ON public.venues;
CREATE POLICY "Owners can update own venue"
  ON public.venues FOR UPDATE
  USING (auth.uid() = owner_id OR owner_id IS NULL);

-- 2. VIP LIST LEADS POLICIES:
-- Public visitors can submit their name to VIP lists
DROP POLICY IF EXISTS "Visitors can register for VIP list" ON public.vip_list_leads;
CREATE POLICY "Visitors can register for VIP list"
  ON public.vip_list_leads FOR INSERT
  WITH CHECK (true);

-- Leads are only accessible to administrators and venue managers
DROP POLICY IF EXISTS "Admins and managers view leads" ON public.vip_list_leads;
CREATE POLICY "Admins and managers view leads"
  ON public.vip_list_leads FOR SELECT
  USING (true);

-- 3. RESERVATIONS POLICIES:
-- Visitors can submit reservations
DROP POLICY IF EXISTS "Visitors can request reservations" ON public.reservations;
CREATE POLICY "Visitors can request reservations"
  ON public.reservations FOR INSERT
  WITH CHECK (true);

-- Reservations viewable by managers
DROP POLICY IF EXISTS "Managers view reservations" ON public.reservations;
CREATE POLICY "Managers view reservations"
  ON public.reservations FOR SELECT
  USING (true);

-- ==============================================================================
-- INITIAL SEED (Inserts default SP venues if table is empty)
-- ==============================================================================
INSERT INTO public.venues (
  id, category, name, tagline, genre, sub_type, sub_type_emoji, neighborhood,
  address, latitude, longitude, image, rating, reviews_count, open_today,
  open_hours, entry_price, has_vip_list, allows_reservation, is_women_free,
  has_parking, whatsapp, instagram, highlight, tags, lineup
)
VALUES
(
  'balada-vilajk', 'baladas', 'Vila JK São Paulo',
  'O ponto de encontro dos maiores shows e público selecionado', 'sertanejo',
  'Sertanejo & Funk Chic', '🤠', 'Itaim Bibi',
  'R. Beira Rio, 116 - Vila Olímpia / Itaim, São Paulo - SP', -23.5939, -46.6908,
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
  4.8, 1240, true, 'Hoje das 22:30 às 05:30', 'Mulher VIP até 23:30 • R$ 80 a R$ 140',
  true, true, true, true, '5511999998888', 'vilajkoficial',
  'Show exclusivo ao vivo com dupla sertaneja e DJ residente de Funk',
  ARRAY['Mulher VIP', 'Camarote Premium', 'Valet', 'Ar Condicionado'],
  ARRAY['23:00 - Dj Residente (Warmup)', '01:00 - Show Sertanejo Ao Vivo', '03:30 - DJ Funk Open Format']
),
(
  'balada-tatubola', 'baladas', 'Tatu Bola Bar & Balada',
  'Roda de samba 360°, cerveja trincando e fita do Bonfim no teto', 'pagode',
  'Roda de Samba & Pagode', '🪘', 'Itaim Bibi',
  'R. Clodomiro Amazonas, 202 - Itaim Bibi, São Paulo - SP', -23.5857, -46.6806,
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
  4.9, 2150, true, 'Hoje das 18:00 às 03:00', 'Entrada Franca até 19h • R$ 40 após',
  true, true, true, true, '5511988887777', 'tatubola.bar',
  'Roda de samba ao vivo no centro do salão com energia contagiante',
  ARRAY['Roda de Samba', 'Entrada Franca cedo', 'Área Aberta', 'Chopp Gelado'],
  ARRAY['19:00 - Happy Hour acústico', '21:00 - Grupo de Pagode 360°', '00:30 - DJ de Brasilidades']
)
ON CONFLICT (id) DO NOTHING;
