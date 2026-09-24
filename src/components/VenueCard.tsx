import React from "react";
import { Star, MapPin, Heart, Clock, Car, Sparkles, ArrowRight, Baby } from "lucide-react";
import { Venue, calculateDistanceKm, estimateUberPrice, NeighborhoodCoord } from "../data/venues";
import { trackEvent } from "../services/analyticsService";

interface VenueCardProps {
  venue: Venue;
  userLocation: NeighborhoodCoord;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenDetails: (venue: Venue) => void;
}

export function VenueCard({
  venue,
  userLocation,
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
}: VenueCardProps) {
  const distanceKm = calculateDistanceKm(
    userLocation.lat,
    userLocation.lng,
    venue.coordinates.lat,
    venue.coordinates.lng
  );

  const uberEstimate = estimateUberPrice(distanceKm);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0d121f] transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-[0_10px_35px_-10px_rgba(168,85,247,0.3)]">
      {/* Media / Image Container */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-900">
        <img
          src={venue.image}
          alt={venue.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d121f] via-transparent to-black/60" />

        {/* Top Badges */}
        <div className="absolute left-3.5 right-3.5 top-3.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
            <span>{venue.subTypeEmoji}</span>
            <span>{venue.subType}</span>
          </span>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(venue.id);
            }}
            aria-label="Salvar favorito"
            className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all active:scale-90 ${
              isFavorite
                ? "border-pink-500 bg-pink-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)]"
                : "border-white/20 bg-black/50 text-white hover:border-pink-400 hover:text-pink-400"
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-white" : ""}`} />
          </button>
        </div>

        {/* Bottom Image Overlay Badges */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs">
          {/* Status */}
          <span className="flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold backdrop-blur-md text-emerald-300 border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{venue.openToday ? "Aberto Hoje!" : "Fechado"}</span>
          </span>

          {/* Rating */}
          <span className="flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-extrabold text-amber-300 backdrop-blur-md border border-amber-500/30">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{venue.rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400 font-normal">({venue.reviewsCount})</span>
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Title & Neighborhood */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-extrabold text-white transition-colors group-hover:text-purple-300 sm:text-lg">
              {venue.name}
            </h3>
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
            {venue.tagline}
          </p>
        </div>

        {/* Distance & Uber Estimate Box */}
        <div className="mt-3.5 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            <span className="font-semibold text-slate-200">{venue.neighborhood}</span>
            <span className="text-slate-500">•</span>
            <span className="text-purple-300 font-bold">{distanceKm} km</span>
          </div>

          <div className="flex items-center gap-1 font-bold text-emerald-400">
            <Car className="h-3.5 w-3.5 text-emerald-400" />
            <span>~ R$ {uberEstimate.uberX}</span>
          </div>
        </div>

        {/* Price & Highlight */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="font-bold text-amber-300">{venue.entryPrice}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {venue.hasHydro && (
            <span className="rounded-md border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-extrabold text-cyan-300">
              🛁 Hidro
            </span>
          )}
          {venue.hasPool && (
            <span className="rounded-md border border-blue-500/40 bg-blue-500/15 px-2 py-0.5 text-[10px] font-extrabold text-blue-300">
              🏊 Piscina
            </span>
          )}
          {venue.hasKidsSpace && (
            <span className="rounded-md border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-extrabold text-amber-300">
              🧸 Espaço Kids
            </span>
          )}
          {venue.hasVipList && (
            <span className="rounded-md border border-pink-500/40 bg-pink-500/15 px-2 py-0.5 text-[10px] font-extrabold text-pink-300">
              💃 Lista VIP
            </span>
          )}
          {venue.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions Button */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <button
            onClick={() => {
              trackEvent(venue.id, "open_details", venue.name);
              onOpenDetails(venue);
            }}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-bold text-white transition-all active:scale-[0.98] ${
              venue.category === "baladas"
                ? "bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)] hover:brightness-110"
                : venue.category === "moteis"
                ? "bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 shadow-[0_0_20px_-5px_rgba(244,63,94,0.5)] hover:brightness-110"
                : venue.hasKidsSpace
                ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black font-extrabold shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)] hover:brightness-110"
                : "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] hover:brightness-110"
            }`}
          >
            <span>
              {venue.category === "baladas"
                ? "Ver Balada & Lista VIP"
                : venue.category === "moteis"
                ? "Ver Suítes & Valores"
                : venue.hasKidsSpace
                ? "Ver Espaço Kids & Reservar"
                : "Ver Restaurante & Reservar"}
            </span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
