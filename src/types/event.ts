export type EventGenre =
  | "eletronica"
  | "pagode"
  | "sertanejo"
  | "funk"
  | "rock"
  | "barzinho";

export type EventFilterType =
  | "all"
  | "bombando"
  | "perto"
  | "gratis"
  | "vip"
  | "after"
  | "eletronica"
  | "pagode"
  | "sertanejo"
  | "funk"
  | "rock"
  | "bares";

export interface EventLineupItem {
  time?: string;
  artist: string;
  role?: string;
  highlight?: boolean;
}

export interface Event {
  id: string;
  venueId: string;
  venueName: string;
  neighborhood: string;
  address: string;
  coordinates: { lat: number; lng: number };
  title: string;
  tagline: string;
  genre: EventGenre;
  genreLabel: string;
  date: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  durationLabel: string;
  lineup: EventLineupItem[];
  minPrice: number;
  maxPrice?: number;
  priceLabel: string;
  isFree: boolean;
  hasVipList: boolean;
  isTrending: boolean;
  isAfterHours: boolean;
  interestedCount: number;
  imageUrl: string;
  gallery?: string[];
  ticketUrl?: string;
  ticketPartner?: "Sympla" | "Ingresse" | "Blacktag" | "Portaria";
  instagram: string;
  whatsapp?: string;
  benefits?: string[];
  dressCode?: string;
  minAge?: number;
}

export interface FilterPill {
  id: EventFilterType;
  label: string;
  emoji: string;
  activeColor: string;
}
