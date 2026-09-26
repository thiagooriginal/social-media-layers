import React from "react";
import { Event } from "../../types/event";
import { calculateDistanceKm } from "../../data/venues";
import { Clock, MapPin, Flame, Ticket, ChevronRight, Heart, Sparkles, ExternalLink } from "lucide-react";

interface EventCardV2Props {
  event: Event;
  userLocation: { lat: number; lng: number } | null;
  onOpenDetails: (event: Event) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (eventId: string) => void;
}

export const EventCardV2: React.FC<EventCardV2Props> = ({
  event,
  userLocation,
  onOpenDetails,
  isFavorite = false,
  onToggleFavorite,
}) => {
  // Distância calculada caso usuário tenha GPS ativo
  const distanceKm = userLocation
    ? calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        event.coordinates.lat,
        event.coordinates.lng
      )
    : null;

  return (
    <div
      onClick={() => onOpenDetails(event)}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#0c121e]/90 border border-slate-800/80 shadow-lg hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all duration-300 cursor-pointer"
    >
      {/* Container da Foto Principal */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-900">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradiente de proteção para textos */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c121e] via-[#0c121e]/40 to-transparent" />

        {/* Badges do Topo */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <div className="flex flex-wrap items-center gap-1.5">
            {event.isTrending && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg shadow-rose-950/50 animate-pulse">
                <Flame className="w-3 h-3 text-amber-200 fill-amber-200" />
                Bombando
              </span>
            )}
            {event.isFree && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                <Ticket className="w-3 h-3" />
                Entrada Grátis
              </span>
            )}
            {event.isAfterHours && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-600/90 backdrop-blur-md px-2 py-1 text-[11px] font-semibold text-purple-100 shadow-md">
                🌙 After
              </span>
            )}
          </div>

          {/* Botão de Favoritar */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(event.id);
              }}
              className={`rounded-full p-2 backdrop-blur-md transition-all ${
                isFavorite
                  ? "bg-rose-500/30 text-rose-400 border border-rose-500/60"
                  : "bg-slate-950/60 text-slate-300 hover:text-white border border-white/10"
              }`}
              title="Salvar rolê"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
          )}
        </div>

        {/* Local & Distância sobre a foto */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/70 backdrop-blur-md px-2 py-0.5 rounded border border-cyan-500/30">
              {event.genreLabel}
            </span>
            <p className="mt-1 text-xs font-semibold text-slate-200 drop-shadow-md">
              📍 {event.venueName} • {event.neighborhood}
            </p>
          </div>

          {distanceKm !== null && (
            <div className="flex items-center gap-1 rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-cyan-300 border border-cyan-500/30">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`}</span>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {/* Título da Festa */}
        <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
          {event.title}
        </h3>

        {/* Tagline curta */}
        <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {event.tagline}
        </p>

        {/* Lineup resumido se houver */}
        {event.lineup.length > 0 && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-900/60 rounded-lg px-2.5 py-1.5 border border-slate-800/80">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              <span className="font-semibold text-slate-200">Lineup:</span>{" "}
              {event.lineup.map((l) => l.artist).join(" • ")}
            </span>
          </div>
        )}

        {/* Linha de Horário e Preço */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-medium">{event.durationLabel}</span>
          </div>

          <div className="text-right">
            <span className="font-bold text-emerald-400">{event.priceLabel}</span>
          </div>
        </div>

        {/* Rodapé com Eu Vou + Botão de Ação */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
            <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>{event.interestedCount} confirmados</span>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-950/40 hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition-all"
          >
            <span>Ver o Rolê</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
