import React from "react";
import { Star, MapPin, Heart, Clock, Car, Sparkles, ArrowRight, Baby, Instagram, Flame } from "lucide-react";
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

  const handleOpenDetails = () => {
    trackEvent(venue.id, "open_details", venue.name);
    onOpenDetails(venue);
  };

  return (
    <div className="venue-card group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0d121f] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-[0_10px_35px_-10px_rgba(0,240,255,0.3)]">
      {/* Media / Image Container (Clickable to enter/open venue) */}
      <div
        onClick={handleOpenDetails}
        className="relative h-52 w-full overflow-hidden bg-slate-900 cursor-pointer group/image"
        title={`Clique para ver fotos e detalhes de ${venue.name}`}
      >
        <img
          src={venue.image}
          alt={venue.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient Overlays */}
        <div className="venue-card-img-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

        {/* Hover / Tap Hint Indicator */}
        <div className="absolute inset-0 bg-cyan-950/20 opacity-0 group-hover/image:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
          <span className="rounded-full bg-black/80 border border-cyan-400/60 px-3.5 py-1.5 text-xs font-extrabold text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.6)] backdrop-blur-md flex items-center gap-1.5">
            <span>✨</span>
            <span>Ver espaço</span>
          </span>
        </div>

        {/* Top Badges */}
        <div className="absolute left-3.5 right-3.5 top-3.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 pointer-events-none">
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
              <span>{venue.subTypeEmoji}</span>
              <span>{venue.subType}</span>
            </span>
            {(venue.category === "moteis" || venue.category === "baladas" || venue.isAfterHours) && (
              <span className="rounded-full bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 text-[10px] font-black text-rose-300 backdrop-blur-md shadow-sm">
                🔞 +18
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 z-10">
            {/* Direct Instagram Link */}
            {venue.instagram ? (
              <a
                href={`https://www.instagram.com/${venue.instagram.replace(/^@/, "").replace(/\/+$/, "")}/`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  trackEvent(venue.id, "instagram_click", venue.name);
                }}
                title={`Abrir Instagram @${venue.instagram.replace(/^@/, "")}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-fuchsia-500/40 bg-gradient-to-tr from-fuchsia-600 via-pink-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(255,0,127,0.4)] backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
              >
                <Instagram className="h-4 w-4" />
              </a>
            ) : null}

            {/* Favorite Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(venue.id);
              }}
              aria-label="Salvar favorito"
              className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all active:scale-90 cursor-pointer ${
                isFavorite
                  ? "border-fuchsia-500 bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(255,0,127,0.6)]"
                  : "border-white/20 bg-black/50 text-white hover:border-fuchsia-400 hover:text-fuchsia-400"
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-white" : ""}`} />
            </button>
          </div>
        </div>

        {/* Bottom Image Overlay Badges */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs pointer-events-none">
          {/* Status & After Hours Badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-bold backdrop-blur-md text-cyan-300 border border-cyan-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{venue.openToday ? "Aberto Hoje!" : "Fechado"}</span>
            </span>

            {(venue.isAfterHours || venue.openHours?.toLowerCase().includes("24 horas") || venue.openHours?.includes("05:") || venue.openHours?.includes("06:") || venue.openHours?.includes("08:")) && (
              <span className="flex items-center gap-1 rounded-full bg-black/80 px-2 py-1 text-[10px] font-black text-cyan-300 backdrop-blur-md border border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                <span>🌙</span>
                <span>
                  {venue.openHours?.toLowerCase().includes("24 horas") || venue.closesAt === "24h"
                    ? "24 Horas"
                    : venue.closesAt
                    ? `Até as ${venue.closesAt}`
                    : venue.openHours?.includes("08:")
                    ? "After até 08h"
                    : "Até 05h+"}
                </span>
              </span>
            )}
          </div>

          {/* Rating */}
          <span className="flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-extrabold text-cyan-300 backdrop-blur-md border border-cyan-500/30 shrink-0">
            <Star className="h-3 w-3 fill-cyan-400 text-cyan-400" />
            <span>{venue.rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400 font-normal">({venue.reviewsCount})</span>
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Title & Neighborhood (Clickable) */}
        <div
          onClick={handleOpenDetails}
          className="cursor-pointer group/title"
          title={`Clique para ver detalhes de ${venue.name}`}
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-extrabold text-white transition-colors group-hover/title:text-cyan-300 sm:text-lg">
              {venue.name}
            </h3>
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
            {venue.tagline}
          </p>
        </div>

        {/* Distance & Uber Estimate Box */}
        <div className="distance-box mt-3.5 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-200">{venue.neighborhood}</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-300 font-bold">{distanceKm} km</span>
          </div>

          <a
            href={`https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(venue.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              trackEvent(venue.id, "click_uber", venue.name);
            }}
            title="Estimativa de corrida por aplicativo (Uber/99). Valores aproximados sujeitos a tarifa dinâmica no app de destino."
            className="uber-btn flex items-center gap-1 font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 px-2 py-0.5 rounded-lg border border-cyan-500/30 transition-all cursor-pointer"
          >
            <Car className="h-3.5 w-3.5 text-cyan-400" />
            <span>App ~R$ {uberEstimate.uberX}</span>
          </a>
        </div>

        {/* Attendance Counter & Eu Vou Badge (Baladas) */}
        {venue.category === "baladas" && (
          <div className="mt-2.5 flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-fuchsia-400">
              <Flame className="w-3.5 h-3.5 fill-fuchsia-500 text-fuchsia-500 animate-pulse" />
              <span>{Math.round(venue.reviewsCount * 0.22 + 120)} confirmados hoje</span>
            </div>
            <span className="text-[10px] text-fuchsia-300/90 font-semibold bg-fuchsia-500/10 px-1.5 py-0.5 rounded border border-fuchsia-500/20">
              🔥 Bombando
            </span>
          </div>
        )}

        {/* Price & Instagram Row */}
        <div className="mt-3 flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 text-slate-300 min-w-0">
            <span className="font-bold text-cyan-300 truncate">{venue.entryPrice}</span>
          </div>

          {venue.instagram && (
            <a
              href={`https://instagram.com/${venue.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                trackEvent(venue.id, "instagram_click", venue.name);
              }}
              title={`Abrir perfil do Instagram @${venue.instagram.replace(/^@/, "")}`}
              className="flex items-center gap-1 text-[11px] font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors shrink-0 bg-fuchsia-500/10 px-2 py-0.5 rounded-lg border border-fuchsia-500/20"
            >
              <Instagram className="h-3 w-3 text-fuchsia-400 shrink-0" />
              <span>@{venue.instagram.replace(/^@/, "")}</span>
            </a>
          )}
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {venue.hasHydro && (
            <span className="rounded-md border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-extrabold text-cyan-300">
              🛁 Hidro
            </span>
          )}
          {venue.hasPool && (
            <span className="rounded-md border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-extrabold text-cyan-300">
              🏊 Piscina
            </span>
          )}
          {venue.hasKidsSpace && venue.category !== "moteis" && (
            <span className="rounded-md border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-extrabold text-cyan-300">
              🧸 Espaço Kids
            </span>
          )}
          {venue.hasVipList && (
            <span className="rounded-md border border-fuchsia-500/40 bg-fuchsia-500/15 px-2 py-0.5 text-[10px] font-extrabold text-fuchsia-300">
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
            type="button"
            onClick={handleOpenDetails}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-bold text-white transition-all active:scale-[0.98] cursor-pointer ${
              venue.category === "baladas"
                ? "bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 shadow-[0_0_20px_-5px_rgba(255,0,127,0.5)] hover:brightness-110"
                : venue.category === "moteis"
                ? "bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 shadow-[0_0_20px_-5px_rgba(255,0,127,0.5)] hover:brightness-110"
                : "bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-600 shadow-[0_0_20px_-5px_rgba(0,240,255,0.4)] hover:brightness-110 text-white font-extrabold"
            }`}
          >
            <span>
              {venue.category === "baladas"
                ? "Ver Balada & Lista VIP"
                : venue.category === "moteis"
                ? "Ver Suítes & Valores"
                : venue.hasKidsSpace && venue.category !== "moteis"
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
