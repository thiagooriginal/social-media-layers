import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oacupgyopcjnrjncjcra.supabase.co";
const SUPABASE_KEY = "sb_publishable_mR7yeFZpND770NV8SAdnAA_YpQ3HM13";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface RawVenue {
  id: string;
  category: "baladas" | "restaurantes" | "moteis";
  name: string;
  tagline: string;
  genre?: "pagode" | "sertanejo" | "funk" | "forro" | "rock" | "eletronica";
  cuisine?: "kids" | "japonesa" | "churrascaria" | "italiano" | "hamburgueria";
  motelStyle?: "hidro" | "piscina" | "design" | "tematica" | "economica";
  subType: string;
  subTypeEmoji: string;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
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
  hasKidsSpace?: boolean;
  isOpenBar?: boolean;
  isWomenFree?: boolean;
  hasParking?: boolean;
  hasHydro?: boolean;
  hasPool?: boolean;
  hasPrivateGarage?: boolean;
  periodHours?: string;
  isAfterHours?: boolean;
  closesAt?: string;
  whatsapp: string;
  instagram: string;
  highlight: string;
  tags: string[];
  lineup?: string[];
  menuHighlights?: string[];
  amenities: string[];
}

// Imagens temáticas autênticas em alta resolução via CDN Unsplash
const IMG_CLUBS = [
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1000&q=80"
];

const IMG_RESTAURANTS = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80"
];

const IMG_MOTEIS = [
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1000&q=80"
];

console.log("Assets loaded. Preparing 300 real venues...");
