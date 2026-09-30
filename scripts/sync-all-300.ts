import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { BALADAS_110, VenueRawItem } from "./data-baladas";
import { RESTAURANTES_110 } from "./data-restaurantes";
import { MOTEIS_80 } from "./data-moteis";

const SUPABASE_URL = "https://oacupgyopcjnrjncjcra.supabase.co";
const SUPABASE_KEY = "sb_publishable_mR7yeFZpND770NV8SAdnAA_YpQ3HM13";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("=== COMPILANDO BASE DE 300 ESTABELECIMENTOS REAIS DE SÃO PAULO ===");

  const baladas = BALADAS_110.slice(0, 110);
  const restaurantes = RESTAURANTES_110.slice(0, 110);
  const moteis = MOTEIS_80.slice(0, 80);

  const all300Raw: VenueRawItem[] = [...baladas, ...restaurantes, ...moteis];
  console.log(`Total compilado: ${all300Raw.length} estabelecimentos:`);
  console.log(`- Baladas: ${baladas.length}`);
  console.log(`- Restaurantes & Bares: ${restaurantes.length}`);
  console.log(`- Motéis: ${moteis.length}`);

  // Formata para o modelo TypeScript `Venue`
  const formattedVenues = all300Raw.map((v) => ({
    id: v.id,
    category: v.category,
    name: v.name,
    tagline: v.tagline,
    genre: v.genre,
    cuisine: v.cuisine,
    motelStyle: v.motelStyle,
    subType: v.subType,
    subTypeEmoji: v.subTypeEmoji,
    neighborhood: v.neighborhood,
    address: v.address,
    coordinates: { lat: v.lat, lng: v.lng },
    image: v.image,
    gallery: v.gallery,
    rating: v.rating,
    reviewsCount: v.reviewsCount,
    openToday: v.openToday,
    openHours: v.openHours,
    priceCategory: v.priceCategory,
    entryPrice: v.entryPrice,
    priceDescription: v.priceDescription,
    hasVipList: v.hasVipList,
    allowsReservation: v.allowsReservation,
    hasKidsSpace: Boolean(v.hasKidsSpace),
    isOpenBar: Boolean(v.isOpenBar),
    isWomenFree: Boolean(v.isWomenFree),
    hasParking: Boolean(v.hasParking),
    hasHydro: Boolean(v.hasHydro),
    hasPool: Boolean(v.hasPool),
    hasPrivateGarage: Boolean(v.hasPrivateGarage),
    periodHours: v.periodHours,
    isAfterHours: Boolean(v.isAfterHours),
    closesAt: v.closesAt,
    whatsapp: v.whatsapp,
    instagram: v.instagram,
    highlight: v.highlight,
    tags: v.tags,
    lineup: v.lineup || [],
    menuHighlights: v.menuHighlights || [],
    amenities: v.amenities,
    plan: "anual" as const,
    planPrice: 199.9,
  }));

  // 1. Gera src/data/venuesCatalog300.ts
  const catalogTsContent = `// Catálogo Oficial com 300 Estabelecimentos Reais de São Paulo
import { Venue } from "./venues";

export const VENUES_CATALOG_300: Venue[] = ${JSON.stringify(formattedVenues, null, 2)};
`;

  const catalogPath = path.resolve(process.cwd(), "src/data/venuesCatalog300.ts");
  fs.writeFileSync(catalogPath, catalogTsContent, "utf-8");
  console.log(`✅ Arquivo salvo: ${catalogPath} (${formattedVenues.length} estabelecimentos)`);

  // 2. Prepara inserção no Supabase (mapeando snake_case)
  console.log("\nIniciando sincronização em lotes com o banco de dados Supabase...");
  const dbRows = all300Raw.map((v) => ({
    id: v.id,
    category: v.category,
    name: v.name,
    tagline: v.tagline,
    genre: v.genre || null,
    cuisine: v.cuisine || null,
    motel_style: v.motelStyle || null,
    sub_type: v.subType,
    sub_type_emoji: v.subTypeEmoji,
    neighborhood: v.neighborhood,
    address: v.address,
    latitude: v.lat,
    longitude: v.lng,
    image: v.image,
    gallery: v.gallery,
    rating: v.rating,
    reviews_count: v.reviewsCount,
    open_today: v.openToday,
    open_hours: v.openHours,
    price_category: v.priceCategory,
    entry_price: v.entryPrice,
    price_description: v.priceDescription,
    has_vip_list: v.hasVipList,
    allows_reservation: v.allowsReservation,
    has_kids_space: Boolean(v.hasKidsSpace),
    is_open_bar: Boolean(v.isOpenBar),
    is_women_free: Boolean(v.isWomenFree),
    has_parking: Boolean(v.hasParking),
    has_hydro: Boolean(v.hasHydro),
    has_pool: Boolean(v.hasPool),
    has_private_garage: Boolean(v.hasPrivateGarage),
    period_hours: v.periodHours || null,
    is_after_hours: Boolean(v.isAfterHours),
    closes_at: v.closesAt || null,
    whatsapp: v.whatsapp,
    instagram: v.instagram,
    highlight: v.highlight,
    tags: v.tags,
    lineup: v.lineup || [],
    menu_highlights: v.menuHighlights || [],
    amenities: v.amenities,
    plan: "anual",
    plan_price: 199.9,
    is_verified: true,
    is_featured: false,
  }));

  const BATCH_SIZE = 25;
  let insertedTotal = 0;

  for (let i = 0; i < dbRows.length; i += BATCH_SIZE) {
    const batch = dbRows.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.from("venues").upsert(batch, { onConflict: "id" }).select("id");

    if (error) {
      console.warn(`⚠️ Aviso no lote ${i} a ${i + batch.length}:`, error.message);
    } else {
      insertedTotal += data ? data.length : batch.length;
      console.log(`  -> Lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(dbRows.length / BATCH_SIZE)} sincronizado com sucesso (${insertedTotal}/${dbRows.length})`);
    }
  }

  console.log(`\n🎉 SINCRONIZAÇÃO COMPLETA: ${insertedTotal} estabelecimentos registrados no Supabase!`);
}

run().catch((err) => {
  console.error("Erro fatal ao sincronizar 300 locais:", err);
  process.exit(1);
});
