import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  VENUES_DATA,
  NEIGHBORHOODS,
  Venue,
  NeighborhoodCoord,
  calculateDistanceKm,
} from "../data/venues";
import { Header } from "../components/Header";
import { CategoryTabs, MainCategory } from "../components/CategoryTabs";
import { FilterBar } from "../components/FilterBar";
import { VenueCard } from "../components/VenueCard";
import { VenueModal } from "../components/VenueModal";
import { MobileNav } from "../components/MobileNav";
import { VipListModal } from "../components/VipListModal";
import { RegisterVenueModal } from "../components/RegisterVenueModal";
import { AuthModal } from "../components/AuthModal";
import { UserProfileModal } from "../components/UserProfileModal";
import { PartnerAnalyticsModal } from "../components/PartnerAnalyticsModal";
import { LogoPickerModal } from "../components/LogoPickerModal";
import { RadarIntroSplash } from "../components/RadarIntroSplash";
import { getVenues } from "../services/venueService";
import { getCurrentUser, subscribeToAuth, UserProfile } from "../services/authService";
import { Sparkles, Compass, AlertCircle, RotateCcw, Heart } from "lucide-react";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  // Radar Intro Splash Animation (Executa na abertura e pode ser reaberto pelo botão no topo)
  const [showRadarIntro, setShowRadarIntro] = useState(true);

  // Dynamic Venues State (Supabase + Local fallback)
  const [venues, setVenues] = useState<Venue[]>(VENUES_DATA);

  // Logo Picker State
  const [isLogoPickerOpen, setIsLogoPickerOpen] = useState(false);
  const [currentLogo, setCurrentLogo] = useState("/logo-soundwave.jpg");

  // User Auth State
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Analytics & Insights Modal State
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [analyticsVenueId, setAnalyticsVenueId] = useState<string | undefined>(undefined);

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [vipModalVenue, setVipModalVenue] = useState<Venue | null>(null);

  // Navigation & Category Tab state
  const [activeTab, setActiveTab] = useState<MainCategory>("baladas");

  // User starting point for distance & Uber calculation
  const [userLocation, setUserLocation] = useState<NeighborhoodCoord>(
    NEIGHBORHOODS[0] // Default: Vila Madalena
  );

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const [selectedMotelStyle, setSelectedMotelStyle] = useState("all");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("all");
  const [onlyOpenToday, setOnlyOpenToday] = useState(false);
  const [onlyVipOrFree, setOnlyVipOrFree] = useState(false);
  const [onlyWithParking, setOnlyWithParking] = useState(false);
  const [onlyWithHydro, setOnlyWithHydro] = useState(false);
  const [onlyWithPool, setOnlyWithPool] = useState(false);
  const [onlyAfterHours, setOnlyAfterHours] = useState(false);

  // Smart late-night detector: between 02:00 and 06:00 AM
  const isLateNightTime = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 2 && hour < 6;
  }, []);

  // Modal Detail state
  const [activeVenue, setActiveVenue] = useState<Venue | null>(null);

  // Load from Supabase on mount
  useEffect(() => {
    getVenues().then((data) => {
      if (data && data.length > 0) {
        setVenues(data);
      }
    });

    const unsubscribe = subscribeToAuth((newUser) => {
      setUser(newUser);
    });
    return () => unsubscribe();
  }, []);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("baladaon_favorites");
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("baladaon_favorites", JSON.stringify(favorites));
    } catch (e) {}
  }, [favorites]);

  const handleToggleFavorite = (venueId: string) => {
    setFavorites((prev) =>
      prev.includes(venueId)
        ? prev.filter((id) => id !== venueId)
        : [...prev, venueId]
    );
  };

  const handleVenueCreated = (newVenue: Venue) => {
    setVenues((prev) => [newVenue, ...prev]);
  };

  const handleOpenVipModal = (venue: Venue) => {
    setVipModalVenue(venue);
    setIsVipModalOpen(true);
  };

  // Reset sub-filters on tab change
  const handleTabChange = (tab: MainCategory) => {
    setActiveTab(tab);
    if (tab === "kids") {
      setSelectedCuisine("kids");
    } else {
      setSelectedCuisine("all");
    }
    setSelectedMotelStyle("all");
    setOnlyWithHydro(false);
    setOnlyWithPool(false);
  };

  // Counts for tabs
  const baladasCount = useMemo(
    () => venues.filter((v) => v.category === "baladas").length,
    [venues]
  );
  const restaurantesCount = useMemo(
    () => venues.filter((v) => v.category === "restaurantes").length,
    [venues]
  );
  const moteisCount = useMemo(
    () => venues.filter((v) => v.category === "moteis").length,
    [venues]
  );
  const kidsCount = useMemo(
    () => venues.filter((v) => v.hasKidsSpace).length,
    [venues]
  );

  // Filtered & Distance-Sorted venues
  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      // 1. Tab category filter
      if (activeTab === "favorites") {
        if (!favorites.includes(venue.id)) return false;
      } else if (activeTab === "kids") {
        if (!venue.hasKidsSpace) return false;
      } else if (activeTab === "baladas") {
        if (venue.category !== "baladas") return false;
      } else if (activeTab === "restaurantes") {
        if (venue.category !== "restaurantes") return false;
      } else if (activeTab === "moteis") {
        if (venue.category !== "moteis") return false;
      }

      // 2. Genre filter (Baladas)
      if (
        activeTab === "baladas" &&
        selectedGenre !== "all" &&
        venue.genre !== selectedGenre
      ) {
        return false;
      }

      // 3. Cuisine filter (Restaurantes)
      if (
        (activeTab === "restaurantes" || activeTab === "kids") &&
        selectedCuisine !== "all"
      ) {
        if (selectedCuisine === "kids") {
          if (!venue.hasKidsSpace) return false;
        } else if (venue.cuisine !== selectedCuisine) {
          return false;
        }
      }

      // 4. Motel Style filter (Motéis)
      if (activeTab === "moteis" && selectedMotelStyle !== "all") {
        if (selectedMotelStyle === "hidro" && !venue.hasHydro) return false;
        else if (selectedMotelStyle === "piscina" && !venue.hasPool) return false;
        else if (venue.motelStyle && venue.motelStyle !== selectedMotelStyle) return false;
      }

      // 5. Hydro toggle (Motéis)
      if (onlyWithHydro && !venue.hasHydro) {
        return false;
      }

      // 6. Pool toggle (Motéis)
      if (onlyWithPool && !venue.hasPool) {
        return false;
      }

      // 7. Neighborhood filter
      if (
        selectedNeighborhood !== "all" &&
        venue.neighborhood !== selectedNeighborhood
      ) {
        return false;
      }

      // 8. Open today toggle
      if (onlyOpenToday && !venue.openToday) {
        return false;
      }

      // 9. VIP / Free entry toggle
      if (onlyVipOrFree && !venue.isWomenFree && !venue.hasVipList) {
        return false;
      }

      // 10. Parking toggle
      if (onlyWithParking && !venue.hasParking) {
        return false;
      }

      // 11. After Hours toggle (Até as 5h+ da manhã ou 24 Horas)
      if (onlyAfterHours) {
        const isLate =
          venue.isAfterHours ||
          venue.openHours?.toLowerCase().includes("24 horas") ||
          venue.openHours?.includes("05:") ||
          venue.openHours?.includes("06:") ||
          venue.openHours?.includes("07:") ||
          venue.openHours?.includes("08:");
        if (!isLate) {
          return false;
        }
      }

      // 12. Search query matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = venue.name.toLowerCase().includes(q);
        const matchNeighborhood = venue.neighborhood.toLowerCase().includes(q);
        const matchTagline = venue.tagline.toLowerCase().includes(q);
        const matchSubType = venue.subType.toLowerCase().includes(q);
        const matchTags = venue.tags.some((t) => t.toLowerCase().includes(q));
        if (
          !matchName &&
          !matchNeighborhood &&
          !matchTagline &&
          !matchSubType &&
          !matchTags
        ) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort by closest distance to userLocation
      const distA = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        a.coordinates.lat,
        a.coordinates.lng
      );
      const distB = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        b.coordinates.lat,
        b.coordinates.lng
      );
      return distA - distB;
    });
  }, [
    venues,
    activeTab,
    favorites,
    selectedGenre,
    selectedCuisine,
    selectedMotelStyle,
    selectedNeighborhood,
    onlyOpenToday,
    onlyVipOrFree,
    onlyWithParking,
    onlyWithHydro,
    onlyWithPool,
    onlyAfterHours,
    searchQuery,
    userLocation,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedGenre("all");
    setSelectedCuisine("all");
    setSelectedMotelStyle("all");
    setSelectedNeighborhood("all");
    setOnlyOpenToday(false);
    setOnlyVipOrFree(false);
    setOnlyWithParking(false);
    setOnlyWithHydro(false);
    setOnlyWithPool(false);
    setOnlyAfterHours(false);
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 pb-24 sm:pb-16 selection:bg-purple-600 selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Radar Intro Splash Animation (Abertura estilo scanner de satélite) */}
      {showRadarIntro && (
        <RadarIntroSplash onFinish={() => setShowRadarIntro(false)} />
      )}

      {/* Header */}
      <Header
        currentNeighborhood={userLocation}
        onSelectNeighborhood={setUserLocation}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setActiveTab("favorites")}
        isFavoritesActive={activeTab === "favorites"}
        totalVenuesCount={venues.length}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAnalytics={() => {
          setAnalyticsVenueId(undefined);
          setIsAnalyticsOpen(true);
        }}
        currentLogo={currentLogo}
        onOpenLogoPicker={() => setIsLogoPickerOpen(true)}
        onTriggerRadar={() => setShowRadarIntro(true)}
      />

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-purple-950/20 via-[#0a0f1d] to-[#070a11] py-8 sm:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-600/10 via-fuchsia-600/5 to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <button
              onClick={() => setShowRadarIntro(true)}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/40 px-4 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 hover:scale-105 active:scale-95 transition-all backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.35)] cursor-pointer"
              title="Clique para ver o Radar Noturno escaneando São Paulo!"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400"></span>
              </span>
              <span>Radar do Rolê SP • Ativar Scanner Noturno</span>
            </button>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Sua noite ideal em{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
              São Paulo
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-base text-slate-400 leading-relaxed">
            O radar oficial da vida noturna: baladas com lista VIP, restaurantes, motéis e modo after (5h+ / 24h) com cálculo de Uber em tempo real!
          </p>
        </div>
      </section>

      {/* Main Categories (Tabs) */}
      <CategoryTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        baladasCount={baladasCount}
        restaurantesCount={restaurantesCount}
        moteisCount={moteisCount}
        kidsCount={kidsCount}
        favoritesCount={favorites.length}
      />

      {/* Search & Filters */}
      <FilterBar
        category={activeTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGenre={selectedGenre}
        onSelectGenre={setSelectedGenre}
        selectedCuisine={selectedCuisine}
        onSelectCuisine={setSelectedCuisine}
        selectedMotelStyle={selectedMotelStyle}
        onSelectMotelStyle={setSelectedMotelStyle}
        selectedNeighborhood={selectedNeighborhood}
        onSelectNeighborhood={setSelectedNeighborhood}
        onlyOpenToday={onlyOpenToday}
        onToggleOpenToday={() => setOnlyOpenToday(!onlyOpenToday)}
        onlyVipOrFree={onlyVipOrFree}
        onToggleVipOrFree={() => setOnlyVipOrFree(!onlyVipOrFree)}
        onlyWithParking={onlyWithParking}
        onToggleWithParking={() => setOnlyWithParking(!onlyWithParking)}
        onlyWithHydro={onlyWithHydro}
        onToggleWithHydro={() => setOnlyWithHydro(!onlyWithHydro)}
        onlyWithPool={onlyWithPool}
        onToggleWithPool={() => setOnlyWithPool(!onlyWithPool)}
        onlyAfterHours={onlyAfterHours}
        onToggleAfterHours={() => setOnlyAfterHours(!onlyAfterHours)}
      />

      {/* Modo After Active Banner */}
      {onlyAfterHours && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-[#181104]/80 to-amber-950/40 p-4 backdrop-blur-md shadow-[0_0_30px_rgba(251,191,36,0.25)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-2xl border border-amber-500/40 shadow-inner">
                🌙
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <span>Modo After Ativo (Até as 5h+ da manhã / 24 Horas)</span>
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-black text-amber-200 border border-amber-400/30">
                    {filteredVenues.length} {filteredVenues.length === 1 ? "local" : "locais"}
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Mostrando apenas baladas que vão até o amanhecer (5h a 8h), lanches da madrugada 24h e motéis para esticar a noite.
                </p>
              </div>
            </div>
            <button
              onClick={() => setOnlyAfterHours(false)}
              className="self-end sm:self-center shrink-0 rounded-xl border border-amber-500/30 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-amber-200 hover:bg-white/20 transition-all active:scale-95"
            >
              ✕ Desativar Modo After
            </button>
          </div>
        </div>
      )}

      {/* Smart Late Night Invitation Toast */}
      {isLateNightTime && !onlyAfterHours && (
        <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 rounded-2xl border border-purple-500/30 bg-purple-950/40 px-4 py-2.5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-base animate-pulse">🌙</span>
              <span className="text-slate-200 font-medium">
                Passou das 2h da madrugada em SP! Procurando onde esticar a noite agora?
              </span>
            </div>
            <button
              onClick={() => setOnlyAfterHours(true)}
              className="rounded-xl border border-amber-400/50 bg-amber-500/20 px-3.5 py-1 text-xs font-black text-amber-300 hover:bg-amber-500/30 transition-all shrink-0 active:scale-95"
            >
              Ativar Modo After (5h+)
            </button>
          </div>
        </div>
      )}

      {/* Venues Grid Section */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* Results Counter and Location Notice */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div>
            Mostrando{" "}
            <span className="font-bold text-white">{filteredVenues.length}</span>{" "}
            {filteredVenues.length === 1 ? "local encontrado" : "locais encontrados"}{" "}
            ordenados pelo mais próximo de{" "}
            <span className="font-bold text-purple-300">{userLocation.name}</span>
          </div>

          {(searchQuery ||
            selectedGenre !== "all" ||
            selectedCuisine !== "all" ||
            selectedNeighborhood !== "all" ||
            onlyOpenToday ||
            onlyVipOrFree ||
            onlyWithParking ||
            onlyAfterHours) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 font-bold text-purple-400 hover:text-purple-300"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>

        {/* Venues Grid */}
        {filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVenues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                userLocation={userLocation}
                isFavorite={favorites.includes(venue.id)}
                onToggleFavorite={handleToggleFavorite}
                onOpenDetails={setActiveVenue}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#0c101c] px-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
              {activeTab === "favorites" ? "💔" : "🔍"}
            </div>

            <h3 className="mt-4 text-lg font-bold text-white">
              {activeTab === "favorites"
                ? "Nenhum local salvo ainda"
                : "Nenhum local encontrado com esses filtros"}
            </h3>

            <p className="mt-1 max-w-sm text-xs text-slate-400">
              {activeTab === "favorites"
                ? "Clique no ícone de coração nos cards de baladas e restaurantes para salvar e acessá-los rapidamente aqui!"
                : "Tente remover alguns filtros ou buscar por outro termo para encontrar opções."}
            </p>

            <button
              onClick={
                activeTab === "favorites"
                  ? () => setActiveTab("baladas")
                  : handleResetFilters
              }
              className="mt-5 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all hover:bg-purple-500"
            >
              {activeTab === "favorites"
                ? "Explorar Baladas"
                : "Limpar todos os filtros"}
            </button>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <VenueModal
        venue={activeVenue}
        userLocation={userLocation}
        isFavorite={activeVenue ? favorites.includes(activeVenue.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onClose={() => setActiveVenue(null)}
        onOpenVipModal={(v) => {
          setActiveVenue(null);
          handleOpenVipModal(v);
        }}
        onOpenAnalytics={(id) => {
          setActiveVenue(null);
          setAnalyticsVenueId(id);
          setIsAnalyticsOpen(true);
        }}
      />

      {/* VIP List Lead Capture Modal */}
      <VipListModal
        venue={vipModalVenue}
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
      />

      {/* Partner / Admin Register Venue Modal */}
      <RegisterVenueModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onVenueCreated={handleVenueCreated}
      />

      {/* Auth / Login / Signup Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />

      {/* User Profile & Saved VIP Passes Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onLogout={() => setUser(null)}
      />

      {/* Partner Performance & Insights Modal (Instagram style metrics) */}
      <PartnerAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        venues={venues}
        initialVenueId={analyticsVenueId}
      />

      {/* Logo Picker Modal */}
      <LogoPickerModal
        isOpen={isLogoPickerOpen}
        onClose={() => setIsLogoPickerOpen(false)}
        selectedLogo={currentLogo}
        onSelectLogo={(logo) => setCurrentLogo(logo)}
      />

      {/* Floating Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        favoritesCount={favorites.length}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Footer */}
      <footer className="mt-20 border-t border-white/10 bg-[#05070d] py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-300">
            <img src={currentLogo} alt="Logo Radar do Rolê" className="h-6 w-6 rounded-lg object-cover border border-purple-500/30" />
            <span>Radar do Rolê</span>
            <span className="text-purple-400">•</span>
            <span>São Paulo</span>
          </div>
          <p className="mt-2">
            O radar oficial da vida noturna em São Paulo com lista VIP, modo after e estimativa de corrida.
          </p>

          <div className="mt-3 flex items-center justify-center gap-4 text-xs font-medium">
            <button
              onClick={() => {
                setAnalyticsVenueId(undefined);
                setIsAnalyticsOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <span>📊</span>
              <span>Painel de Desempenho & Relatórios</span>
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span>✨</span>
              <span>Cadastrar meu local</span>
            </button>
          </div>

          <p className="mt-3 text-[11px] text-slate-600">
            © {new Date().getFullYear()} Radar do Rolê • Onde a noite acontece em São Paulo. Feito com ❤️.
          </p>
        </div>
      </footer>
    </div>
  );
}
