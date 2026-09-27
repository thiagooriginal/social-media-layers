import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  MapPin,
  Clock,
  Car,
  Heart,
  Share2,
  ExternalLink,
  Check,
  Copy,
  Sparkles,
  Baby,
  ShieldCheck,
  Navigation,
  BarChart3,
  Instagram,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { Venue, calculateDistanceKm, estimateUberPrice, NeighborhoodCoord } from "../data/venues";
import { trackEvent } from "../services/analyticsService";
import { recordEventAttendance } from "../services/venueService";

interface VenueModalProps {
  venue: Venue | null;
  userLocation: NeighborhoodCoord;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
  onOpenVipModal: (venue: Venue) => void;
  onOpenAnalytics?: (venueId: string) => void;
}

export function VenueModal({
  venue,
  userLocation,
  isFavorite,
  onToggleFavorite,
  onClose,
  onOpenVipModal,
  onOpenAnalytics,
}: VenueModalProps) {
  const [copied, setCopied] = useState(false);
  const [hasConfirmedEuVou, setHasConfirmedEuVou] = useState(false);
  const [attendeesCount, setAttendeesCount] = useState(250);

  useEffect(() => {
    if (!venue) return;
    const isGoing = typeof window !== "undefined" && localStorage.getItem(`role_eu_vou_${venue.id}`) === "true";
    setHasConfirmedEuVou(isGoing);
    setAttendeesCount(Math.round((venue.reviewsCount || 100) * 0.22 + 120 + (isGoing ? 1 : 0)));
  }, [venue]);

  const handleToggleEuVou = () => {
    if (!venue) return;
    const key = `role_eu_vou_${venue.id}`;
    if (hasConfirmedEuVou) {
      localStorage.removeItem(key);
      setHasConfirmedEuVou(false);
      setAttendeesCount((c) => Math.max(0, c - 1));
    } else {
      localStorage.setItem(key, "true");
      setHasConfirmedEuVou(true);
      setAttendeesCount((c) => c + 1);
      recordEventAttendance({ venueId: venue.id });
    }
  };

  if (!venue) return null;

  const distanceKm = calculateDistanceKm(
    userLocation.lat,
    userLocation.lng,
    venue.coordinates.lat,
    venue.coordinates.lng
  );

  const uberPrices = estimateUberPrice(distanceKm);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(venue.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    trackEvent(venue.id, "click_share_whatsapp", venue.name);
    const text = encodeURIComponent(
      `Bora colar no *${venue.name}* (${venue.subType}) em ${venue.neighborhood}? Dá uma olhada: ${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleContactWhatsApp = () => {
    trackEvent(venue.id, "click_whatsapp", venue.name);
    const message =
      venue.category === "baladas"
        ? `Olá! Vi o ${venue.name} no Radar do Rolê e gostaria de colocar nome na Lista VIP / saber das atrações de hoje!`
        : venue.category === "moteis"
        ? `Olá! Vi o ${venue.name} no Radar do Rolê e gostaria de informações de suítes, hidro e valores de pernoite para hoje!`
        : `Olá! Vi o ${venue.name} no Radar do Rolê e gostaria de informações para reserva de mesa de hoje!`;
    window.open(
      `https://api.whatsapp.com/send?phone=${venue.whatsapp}&text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleOpenUber = () => {
    trackEvent(venue.id, "click_uber", venue.name);
    const destination = encodeURIComponent(venue.address);
    // Universal Uber link
    window.open(
      `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${destination}`,
      "_blank"
    );
  };

  const handleOpenMaps = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        venue.name + " " + venue.address
      )}`,
      "_blank"
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md transition-opacity sm:items-center p-0 sm:p-4">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2.5rem] sm:rounded-3xl border border-white/15 bg-[#0a0e19] text-slate-100 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Close & Action Header on Image */}
        <div className="relative h-64 sm:h-72 w-full shrink-0 overflow-hidden bg-slate-900">
          <img
            src={venue.image}
            alt={venue.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e19] via-[#0a0e19]/40 to-black/60" />

          {/* Top Floating Buttons */}
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md">
              <span>{venue.subTypeEmoji}</span>
              <span>{venue.subType}</span>
            </span>

            <div className="flex items-center gap-2">
              {venue.instagram && (
                <a
                  href={`https://instagram.com/${venue.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent(venue.id, "instagram_click", venue.name)}
                  title={`Abrir Instagram @${venue.instagram.replace(/^@/, "")}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-pink-500/40 bg-gradient-to-tr from-amber-500/90 via-rose-500/90 to-purple-600/90 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] backdrop-blur-md transition-all hover:scale-110 active:scale-90 cursor-pointer"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}

              <button
                onClick={() => onToggleFavorite(venue.id)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-transform active:scale-90 ${
                  isFavorite
                    ? "border-pink-500 bg-pink-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                    : "border-white/20 bg-black/50 text-white hover:bg-black/80"
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-white" : ""}`} />
              </button>

              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-transform hover:bg-black/80 active:scale-90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Title on bottom of Image */}
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-bold text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                🟢 {venue.openToday ? "Aberto Hoje" : "Fechado"}
              </span>

              {(venue.isAfterHours || venue.openHours?.toLowerCase().includes("24 horas") || venue.openHours?.includes("05:") || venue.openHours?.includes("06:") || venue.openHours?.includes("08:")) && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/25 border border-amber-500/50 px-2.5 py-0.5 font-black text-amber-300 backdrop-blur-md shadow-[0_0_12px_rgba(251,191,36,0.4)]">
                  <span>🌙</span>
                  <span>
                    {venue.openHours?.toLowerCase().includes("24 horas") || venue.closesAt === "24h"
                      ? "Aberto 24 Horas"
                      : venue.closesAt
                      ? `After até as ${venue.closesAt}`
                      : "After Madrugada"}
                  </span>
                </span>
              )}

              <span className="flex items-center gap-1 font-bold text-amber-300 bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10 backdrop-blur-md">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{venue.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({venue.reviewsCount} avaliações)</span>
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              {venue.name}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto px-5 py-5 sm:px-6 space-y-6">
          {/* Tagline */}
          <p className="text-sm font-medium leading-relaxed text-slate-300">
            {venue.tagline}
          </p>

          {/* Address Box & Maps */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">{venue.neighborhood}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{venue.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-white/10"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleOpenMaps}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-purple-300 hover:bg-purple-500/20"
                >
                  <Navigation className="h-3 w-3" />
                  <span>Maps</span>
                </button>
              </div>
            </div>
          </div>

          {/* Instagram Official Card */}
          {venue.instagram && (
            <a
              href={`https://instagram.com/${venue.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent(venue.id, "instagram_click", venue.name)}
              className="flex items-center justify-between rounded-2xl border border-pink-500/30 bg-gradient-to-r from-purple-950/40 via-pink-950/30 to-[#0e1726] p-3.5 shadow-[0_0_20px_-5px_rgba(236,72,153,0.2)] hover:border-pink-500/60 hover:brightness-105 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-lg group-hover:scale-105 transition-transform shrink-0">
                  <Instagram className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-white group-hover:text-pink-300 transition-colors">
                      @{venue.instagram.replace(/^@/, "")}
                    </span>
                    <span className="rounded bg-pink-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-pink-300 border border-pink-500/30">
                      INSTAGRAM OFICIAL
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    Ver stories, fotos do ambiente e avisos do dia
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-pink-300 group-hover:bg-pink-500/20 group-hover:border-pink-400 transition-all shrink-0 ml-2">
                <span>Acessar</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            </a>
          )}

          {/* Confirmação de Presença "Eu Vou" (Baladas) */}
          {venue.category === "baladas" && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-[#0e1726] border border-rose-500/30 shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]">
              <div>
                <div className="flex items-center gap-1.5 text-rose-400 font-extrabold text-xs sm:text-sm">
                  <Flame className="w-4 h-4 fill-rose-500 text-rose-500 animate-bounce" />
                  <span>{attendeesCount} pessoas confirmadas hoje</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {hasConfirmedEuVou ? "Você confirmou presença nesta noite!" : "Confirme sua presença no radar deste rolê"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleEuVou}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 ${
                  hasConfirmedEuVou
                    ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    : "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:brightness-110"
                }`}
              >
                {hasConfirmedEuVou ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirmado!</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>Eu Vou</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Transportation / Uber Card */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-[#0e1726] to-[#0a0e19] p-4 shadow-[0_0_25px_-5px_rgba(16,185,129,0.2)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200">
                    Estimativa de Corrida (Partindo de {userLocation.name})
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Distância aproximada: <strong className="text-emerald-400">{distanceKm} km</strong>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-black text-emerald-400">
                  ~ R$ {uberPrices.uberX}
                </div>
                <div className="text-[10px] text-slate-400">UberX estimado</div>
              </div>
            </div>

            <div className="mt-3.5 flex gap-2">
              <button
                onClick={handleOpenUber}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-extrabold text-white border border-white/20 transition-all hover:bg-zinc-900 active:scale-98"
              >
                <span>Chamar Uber para o Local</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Lineup or Menu Highlights */}
          {venue.lineup && venue.lineup.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-purple-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Lineup & Atrações de Hoje</span>
              </h4>
              <div className="mt-2.5 space-y-2">
                {venue.lineup.map((item, idx) => {
                  const parts = item.split(" - ");
                  const hasTime = parts.length > 1;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-xl border border-purple-500/20 bg-purple-950/20 p-2.5 text-xs text-slate-200 hover:border-purple-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-purple-500/30 text-[10px] font-black text-purple-300">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-100 truncate">
                          {hasTime ? parts[1] : item}
                        </span>
                      </div>
                      {hasTime && (
                        <span className="shrink-0 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                          {parts[0]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {venue.menuHighlights && venue.menuHighlights.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Destaques do Cardápio & Espaço Kids</span>
              </h4>
              <div className="mt-2 space-y-2">
                {venue.menuHighlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-xs font-medium text-slate-200"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-[10px] font-black text-emerald-300">
                      ✨
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details & Amenities Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Horários</span>
              <p className="mt-1 font-semibold text-slate-200">{venue.openHours}</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Valores</span>
              <p className="mt-1 font-semibold text-amber-300">{venue.entryPrice}</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Destaque</span>
              <p className="mt-1 font-medium text-slate-300 line-clamp-2">{venue.highlight}</p>
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div className="sticky bottom-0 border-t border-white/10 bg-[#070a11]/95 px-5 py-4 backdrop-blur-xl">
          <div className="flex gap-2">
            {/* Primary Action Button (Abre Modal de Lista VIP ou Reserva ou WhatsApp de Suítes) */}
            <button
              onClick={() => {
                if (venue.category === "moteis") {
                  handleContactWhatsApp();
                } else {
                  onOpenVipModal(venue);
                }
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black transition-all active:scale-[0.98] ${
                venue.category === "baladas"
                  ? "bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-[0_0_25px_-5px_rgba(168,85,247,0.7)] hover:brightness-110"
                  : venue.category === "moteis"
                  ? "bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white shadow-[0_0_25px_-5px_rgba(244,63,94,0.7)] hover:brightness-110"
                  : venue.hasKidsSpace
                  ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black font-black shadow-[0_0_25px_-5px_rgba(245,158,11,0.7)] hover:brightness-110"
                  : "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-[0_0_25px_-5px_rgba(16,185,129,0.7)] hover:brightness-110"
              }`}
            >
              <span>{venue.category === "moteis" ? "🏩" : "🎟️"}</span>
              <span>
                {venue.category === "baladas"
                  ? "Garantir Lista VIP"
                  : venue.category === "moteis"
                  ? "Consultar Suítes no WhatsApp"
                  : "Reservar Mesa"}
              </span>
            </button>

            {/* Direct WhatsApp button */}
            <button
              onClick={handleContactWhatsApp}
              title="Falar no WhatsApp oficial"
              className="flex h-12 items-center gap-1.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 px-3.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition-colors shrink-0"
            >
              <span>💬</span>
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Direct Instagram button */}
            {venue.instagram && (
              <a
                href={`https://instagram.com/${venue.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent(venue.id, "instagram_click", venue.name)}
                title={`Abrir Instagram @${venue.instagram.replace(/^@/, "")}`}
                className="flex h-12 items-center gap-1.5 rounded-2xl border border-pink-500/40 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-rose-500/20 px-3.5 text-xs font-bold text-pink-300 hover:bg-pink-500/30 transition-all shadow-[0_0_15px_rgba(236,72,153,0.2)] shrink-0 cursor-pointer"
              >
                <Instagram className="h-4 w-4 text-pink-400" />
                <span className="hidden sm:inline">Instagram</span>
              </a>
            )}

            {/* Share on WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              title="Compartilhar no WhatsApp com amigos"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white shrink-0"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {onOpenAnalytics && (
            <button
              onClick={() => onOpenAnalytics(venue.id)}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-purple-300 transition-colors py-1"
            >
              <BarChart3 className="h-3.5 w-3.5 text-purple-400" />
              <span>É o proprietário deste local? Ver Relatório de Cliques</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
