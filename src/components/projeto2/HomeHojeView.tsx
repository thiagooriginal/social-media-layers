import React, { useState, useMemo } from "react";
import { Event, EventFilterType } from "../../types/event";
import { FILTER_PILLS, filterEvents } from "../../data/events";
import { EventCardV2 } from "./EventCardV2";
import { EventDetailsModalV2 } from "./EventDetailsModalV2";
import { MobileNavV2, Projeto2Screen } from "./MobileNavV2";
import { calculateDistanceKm, NEIGHBORHOODS, NeighborhoodCoord } from "../../data/venues";
import { VipListModal } from "../VipListModal";
import { AuthModal } from "../AuthModal";
import { UserProfileModal } from "../UserProfileModal";
import { UserProfile } from "../../services/authService";
import {
  Search,
  Crosshair,
  Flame,
  Clock,
  Sparkles,
  MapPin,
  Heart,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Radio,
} from "lucide-react";

interface HomeHojeViewProps {
  events: Event[];
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onSwitchToProjeto1: () => void;
}

export const HomeHojeView: React.FC<HomeHojeViewProps> = ({
  events,
  user,
  onOpenAuth,
  onOpenProfile,
  onSwitchToProjeto1,
}) => {
  // Estado de navegação de telas
  const [currentTab, setCurrentTab] = useState<Projeto2Screen>("inicio");

  // Filtros ativos
  const [selectedFilter, setSelectedFilter] = useState<EventFilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Evento selecionado para detalhes
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Modal de Lista VIP integrado
  const [vipModalVenueId, setVipModalVenueId] = useState<string | null>(null);
  const [vipModalEventTitle, setVipModalEventTitle] = useState<string | undefined>(undefined);

  // Localização do Usuário (GPS)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Eventos Salvos (IDs no localStorage)
  const [savedEventIds, setSavedEventIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("role_saved_events");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (eventId: string) => {
    setSavedEventIds((prev) => {
      const exists = prev.includes(eventId);
      const updated = exists ? prev.filter((id) => id !== eventId) : [...prev, eventId];
      try {
        localStorage.setItem("role_saved_events", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Função para solicitar GPS do navegador
  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocalização não suportada no seu navegador.");
      return;
    }
    setIsGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGpsLoading(false);
      },
      (error) => {
        setIsGpsLoading(false);
        setGpsError("Não foi possível obter sua localização exata.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Lista de eventos filtrados
  const filteredEvents = useMemo(() => {
    let list = filterEvents(events, {
      category: selectedFilter,
      searchQuery,
      userLocation,
    });

    if (currentTab === "salvos") {
      list = list.filter((e) => savedEventIds.includes(e.id));
    }

    return list;
  }, [events, selectedFilter, searchQuery, userLocation, currentTab, savedEventIds]);

  // Eventos em destaque para carrossel
  const trendingEvents = useMemo(() => {
    return events.filter((e) => e.isTrending).slice(0, 4);
  }, [events]);

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col pb-24 sm:pb-12 selection:bg-cyan-500 selection:text-black">
      {/* 🚀 Top Bar: Logo, Seletor de Versão e GPS */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#070a11]/90 backdrop-blur-xl px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-fuchsia-600 p-[1.5px] shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <div className="h-full w-full rounded-[10px] bg-[#070a11] flex items-center justify-center overflow-hidden">
                <img
                  src="/logo-official.jpg"
                  alt="Qual o Rolê?"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback visual se a imagem não carregar
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse absolute" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  QUAL O ROLÊ?
                </span>
                <span className="rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-black">
                  PROJETO 2
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Descobrir • Decidir • Ir
              </p>
            </div>
          </div>

          {/* Controles do Topo: Alternador de Projeto + GPS */}
          <div className="flex items-center gap-2">
            {/* Alternador Projeto 1 / Projeto 2 */}
            <button
              type="button"
              onClick={onSwitchToProjeto1}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 border border-slate-700/80 transition-all hover:border-cyan-500/50 shadow-sm"
              title="Voltar ao Projeto 1 (Radar Original)"
            >
              <span>📡</span>
              <span className="hidden sm:inline">Projeto 1</span>
              <span className="text-[10px] text-slate-400">(Radar)</span>
            </button>

            {/* Botão de GPS 1-Touch */}
            <button
              type="button"
              onClick={handleRequestGps}
              disabled={isGpsLoading}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                userLocation
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
              }`}
              title="Obter localização atual via GPS"
            >
              <Crosshair
                className={`w-3.5 h-3.5 ${
                  isGpsLoading ? "animate-spin text-cyan-400" : userLocation ? "text-cyan-400" : "text-slate-400"
                }`}
              />
              <span className="text-[11px]">
                {isGpsLoading ? "Localizando..." : userLocation ? "GPS Ativo" : "Perto de Mim"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 🔍 Hero Search & Sub-header */}
      <section className="px-4 pt-5 pb-3 max-w-6xl mx-auto w-full">
        <div className="text-center sm:text-left mb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Qual o rolê de hoje em São Paulo?
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Eventos confirmados, horários dos DJs, lista VIP e estimativa de Uber em tempo real.
          </p>
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por festa, DJ, estilo musical (ex: Techno, Pagode) ou local..."
            className="w-full rounded-2xl bg-slate-900/80 border border-slate-800 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>

        {/* ⚡ Barra de Atalhos Rápidos (1 Toque) */}
        <div className="mt-3.5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTER_PILLS.map((pill) => {
            const isActive = selectedFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => {
                  setSelectedFilter(pill.id);
                  if (pill.id === "perto" && !userLocation) {
                    handleRequestGps();
                  }
                }}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border ${
                  isActive
                    ? pill.activeColor
                    : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white"
                }`}
              >
                <span>{pill.emoji}</span>
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 🔥 Seção Bombando Agora (Carrossel Horizontal no Topo) */}
      {currentTab === "inicio" && !searchQuery && selectedFilter === "all" && (
        <section className="px-4 py-4 max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-rose-400">
                Bombando Agora em SP
              </h2>
            </div>
            <span className="text-xs text-slate-400">Mais procurados da noite</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingEvents.map((event) => (
              <EventCardV2
                key={event.id}
                event={event}
                userLocation={userLocation}
                onOpenDetails={setSelectedEvent}
                isFavorite={savedEventIds.includes(event.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* 📍 Feed Principal de Eventos */}
      <main className="px-4 py-3 max-w-6xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300">
              {currentTab === "salvos"
                ? "Meus Rolês Salvos"
                : currentTab === "hoje"
                ? "Rolês de Hoje à Noite"
                : "Todos os Rolês Disponíveis"}
            </h2>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
              {filteredEvents.length}
            </span>
          </div>

          {(selectedFilter !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedFilter("all");
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>

        {/* Grid de Cards */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => (
              <EventCardV2
                key={event.id}
                event={event}
                userLocation={userLocation}
                onOpenDetails={setSelectedEvent}
                isFavorite={savedEventIds.includes(event.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80">
            <p className="text-3xl">🔍</p>
            <h3 className="mt-3 text-base font-bold text-white">Nenhum rolê encontrado</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              Tente alterar os filtros ou o termo de busca para encontrar mais opções para hoje.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedFilter("all");
                setSearchQuery("");
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-400 transition-all"
            >
              Ver todos os rolês
            </button>
          </div>
        )}
      </main>

      {/* 📱 Barra de Navegação Inferior Mobile */}
      <MobileNavV2
        currentScreen={currentTab}
        onNavigate={setCurrentTab}
        savedCount={savedEventIds.length}
        user={user}
        onOpenAuth={onOpenAuth}
        onOpenProfile={onOpenProfile}
      />

      {/* 🪩 Modal de Detalhes do Evento */}
      <EventDetailsModalV2
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        userLocation={userLocation}
        onOpenVipList={(venueId, eventTitle) => {
          setVipModalVenueId(venueId);
          setVipModalEventTitle(eventTitle);
        }}
      />

      {/* 🎟 Modal de Lista VIP Reutilizado do Projeto 1 */}
      {vipModalVenueId && (
        <VipListModal
          venueId={vipModalVenueId}
          isOpen={Boolean(vipModalVenueId)}
          onClose={() => {
            setVipModalVenueId(null);
            setVipModalEventTitle(undefined);
          }}
          user={user}
          onOpenAuth={onOpenAuth}
        />
      )}
    </div>
  );
};
