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
import { getVenues } from "../services/venueService";
import { getCurrentUser, subscribeToAuth, UserProfile } from "../services/authService";
import { Sparkles, Compass, AlertCircle, RotateCcw, Heart } from "lucide-react";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  // Dynamic Venues State (Supabase + Local fallback)
  const [venues, setVenues] = useState<Venue[]>(VENUES_DATA);

  // User Auth State
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

      // 11. Search query matching
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
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 pb-24 sm:pb-16 selection:bg-purple-600 selection:text-white">
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
      />

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-purple-950/20 via-[#0a0f1d] to-[#070a11] py-8 sm:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-600/10 via-pink-600/5 to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold text-purple-300 backdrop-blur-md mb-4 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>São Paulo Hoje • Onde a noite acontece</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Sua noite ideal em{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              São Paulo
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-base text-slate-400 leading-relaxed">
            Descubra as melhores baladas, shows ao vivo, restaurantes, espaço kids e motéis com suítes exclusivas por perto. Veja a estimativa de Uber e planeje sua noite!
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
      />

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
            onlyWithParking) && (
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
            <span>BaladaON</span>
            <span className="text-purple-400">🪩</span>
            <span>São Paulo</span>
          </div>
          <p className="mt-2">
            Encontre sua balada ou restaurante ideal com lista VIP e estimativa de corrida.
          </p>
          <p className="mt-1 text-[11px] text-slate-600">
            © {new Date().getFullYear()} BaladaON • Feito com ❤️ para a noite paulistana.
          </p>
        </div>
      </footer>
    </div>
  );
}
