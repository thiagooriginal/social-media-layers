import React, { useState, useEffect } from "react";
import { Event } from "../../types/event";
import { calculateDistanceKm } from "../../data/venues";
import {
  X,
  MapPin,
  Clock,
  Flame,
  Ticket,
  Instagram,
  Car,
  CheckCircle2,
  Calendar,
  Share2,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

interface EventDetailsModalV2Props {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
  onOpenVipList?: (venueId: string, eventTitle?: string) => void;
}

export const EventDetailsModalV2: React.FC<EventDetailsModalV2Props> = ({
  event,
  isOpen,
  onClose,
  userLocation,
  onOpenVipList,
}) => {
  if (!isOpen || !event) return null;

  // Estado do botão "Eu Vou" com persistência local
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [interestCount, setInterestCount] = useState(event.interestedCount);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!event) return;
    const key = `role_eu_vou_${event.id}`;
    const stored = localStorage.getItem(key);
    if (stored === "true") {
      setHasConfirmed(true);
    } else {
      setHasConfirmed(false);
    }
    setInterestCount(event.interestedCount);
  }, [event]);

  const handleToggleEuVou = () => {
    if (!event) return;
    const key = `role_eu_vou_${event.id}`;
    if (hasConfirmed) {
      localStorage.removeItem(key);
      setHasConfirmed(false);
      setInterestCount((prev) => Math.max(0, prev - 1));
    } else {
      localStorage.setItem(key, "true");
      setHasConfirmed(true);
      setInterestCount((prev) => prev + 1);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${event.title} • Qual o Rolê?`,
        text: `Bora nesse rolê hoje? ${event.title} no ${event.venueName}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Cálculo de distância e estimativa de Uber
  const distanceKm = userLocation
    ? calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        event.coordinates.lat,
        event.coordinates.lng
      )
    : null;

  const uberEstimate = distanceKm !== null
    ? Math.max(16, Math.round(14 + distanceKm * 2.85))
    : null;

  const uberDeepLink = `https://m.uber.com/ul/?action=setPickup&client_id=&pickup=my_location&dropoff[latitude]=${event.coordinates.lat}&dropoff[longitude]=${event.coordinates.lng}&dropoff[nickname]=${encodeURIComponent(event.venueName)}&dropoff[formatted_address]=${encodeURIComponent(event.address)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card / Bottom Sheet */}
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#090d16] border border-slate-800 shadow-2xl text-slate-100 flex flex-col">
        {/* Hero Image & Floating Controls */}
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-slate-950">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/30 to-black/60" />

          {/* Top Actions */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <button
              onClick={onClose}
              className="rounded-full bg-black/60 p-2.5 text-white backdrop-blur-md hover:bg-black/80 transition-all border border-white/10"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="rounded-full bg-black/60 p-2.5 text-white backdrop-blur-md hover:bg-black/80 transition-all border border-white/10"
                title="Compartilhar"
              >
                <Share2 className="w-5 h-5" />
              </button>

              {event.instagram && (
                <a
                  href={`https://instagram.com/${event.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-600/80 to-purple-600/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white shadow-lg hover:from-pink-500 hover:to-purple-500 border border-pink-400/30 transition-all"
                >
                  <Instagram className="w-4 h-4" />
                  <span>@{event.instagram.replace("@", "")}</span>
                </a>
              )}
            </div>
          </div>

          {/* Badges no pé da foto */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 z-20">
            <span className="rounded-lg bg-cyan-500/20 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/40">
              {event.genreLabel}
            </span>
            {event.isTrending && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-rose-500/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white shadow-md animate-pulse">
                <Flame className="w-3.5 h-3.5" />
                Bombando Hoje
              </span>
            )}
            {event.isFree && (
              <span className="rounded-lg bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white shadow-md">
                🎟 Entrada Franca
              </span>
            )}
            {event.isAfterHours && (
              <span className="rounded-lg bg-purple-600/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-purple-100 shadow-md">
                🌙 Modo After
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Header do Evento */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {event.title}
            </h2>
            <p className="mt-1 text-sm text-slate-300 font-medium">
              {event.tagline}
            </p>
          </div>

          {/* Informações Rápidas de Localização e Horário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-white">{event.venueName}</p>
                <p className="text-slate-400 mt-0.5">{event.address}</p>
                {distanceKm !== null && (
                  <span className="mt-1 inline-block font-semibold text-cyan-300">
                    📍 {distanceKm.toFixed(1)} km de você
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-white">{event.dateLabel}</p>
                <p className="text-slate-400 mt-0.5">Horário: {event.startTime} às {event.endTime}</p>
                <p className="text-emerald-400 font-bold mt-1">{event.priceLabel}</p>
              </div>
            </div>
          </div>

          {/* Botão "🔥 EU VOU" Interativo */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900/60 border border-rose-500/30">
            <div>
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-sm">
                <Flame className="w-4 h-4 fill-rose-500 text-rose-500 animate-bounce" />
                <span>{interestCount} pessoas confirmadas</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {hasConfirmed ? "Sua presença está confirmada!" : "Confirme sua presença e receba benefícios"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleEuVou}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center gap-2 ${
                hasConfirmed
                  ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  : "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:brightness-110"
              }`}
            >
              {hasConfirmed ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Você vai!</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 fill-white" />
                  <span>Eu Vou</span>
                </>
              )}
            </button>
          </div>

          {/* Estimativa de Uber se distância conhecida */}
          {distanceKm !== null && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-black border border-white/10 text-white">
                  <Car className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">UberX estimado</span>
                    <span className="text-xs font-extrabold text-emerald-400">~R$ {uberEstimate}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Trajeto de ~{Math.round(distanceKm * 2.2 + 8)} min a partir do seu GPS
                  </p>
                </div>
              </div>

              <a
                href={uberDeepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 transition-all shrink-0"
              >
                Pedir Uber
              </a>
            </div>
          )}

          {/* Lineup & Horários dos DJs */}
          {event.lineup.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Lineup & Programação da Noite
              </h3>

              <div className="space-y-2">
                {event.lineup.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                      item.highlight
                        ? "bg-cyan-950/20 border-cyan-500/40 text-cyan-200"
                        : "bg-slate-900/50 border-slate-800 text-slate-300"
                    }`}
                  >
                    <div>
                      <p className={`font-bold ${item.highlight ? "text-cyan-300 text-sm" : "text-white"}`}>
                        {item.artist}
                      </p>
                      {item.role && <p className="text-[11px] text-slate-400">{item.role}</p>}
                    </div>

                    {item.time && (
                      <span className="font-semibold text-slate-300 bg-black/40 px-2 py-1 rounded border border-white/5 shrink-0">
                        {item.time}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benefícios & Destaques */}
          {event.benefits && event.benefits.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Vantagens & Estrutura
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {event.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Links e Botões de Ação Final */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Botão de Lista VIP / Voucher */}
              {event.hasVipList && onOpenVipList && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenVipList(event.venueId, event.title);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-950/40 hover:brightness-110 active:scale-95 transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Entrar na Lista VIP</span>
                </button>
              )}

              {/* Botão de Ingresso Antecipado */}
              {event.ticketUrl && (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-sm shadow-lg shadow-cyan-950/40 hover:brightness-110 active:scale-95 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Comprar Ingresso ({event.ticketPartner || "Sympla"})</span>
                </a>
              )}
            </div>

            {/* WhatsApp do parceiro para reservas */}
            {event.whatsapp && (
              <a
                href={`https://wa.me/${event.whatsapp}?text=${encodeURIComponent(`Olá! Vi o evento "${event.title}" no Qual o Rolê? e gostaria de reservar camarote/mesa!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Reservar Mesa ou Camarote via WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
