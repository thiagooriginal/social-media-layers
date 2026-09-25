import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  VENUES_DATA,
  NEIGHBORHOODS,
  Venue,
  NeighborhoodCoord,
  calculateDistanceKm,
  ROLE_AMENITIES,
  RoleAmenityId,
  RoleAmenity,
} from "../data/venues";
import { Header } from "../components/Header";
import { CategoryTabs, MainCategory } from "../components/CategoryTabs";
import { FilterBar } from "../components/FilterBar";
import { VenueCard } from "../components/VenueCard";
import { VenueModal } from "../components/VenueModal";
import { MobileNav, AppScreen } from "../components/MobileNav";
import { VipListModal } from "../components/VipListModal";
import { RegisterVenueModal } from "../components/RegisterVenueModal";
import { AuthModal } from "../components/AuthModal";
import { UserProfileModal } from "../components/UserProfileModal";
import { PartnerAnalyticsModal } from "../components/PartnerAnalyticsModal";
import { LogoPickerModal } from "../components/LogoPickerModal";
import { RadarIntroSplash } from "../components/RadarIntroSplash";
import { CustomRoleMatchmaker } from "../components/CustomRoleMatchmaker";
import { getVenues } from "../services/venueService";
import { getCurrentUser, subscribeToAuth, UserProfile } from "../services/authService";
import {
  Sparkles,
  Compass,
  AlertCircle,
  RotateCcw,
  Heart,
  Search,
  ArrowLeft,
  Flame,
  MapPin,
  Ticket,
  ChevronRight,
  Clock,
  Moon,
  X,
  TrendingUp,
  Check,
  CheckCircle2,
} from "lucide-react";

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
  const [currentLogo, setCurrentLogo] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("preferred_logo") || "/logo-official.jpg";
    }
    return "/logo-official.jpg";
  });

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
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [isGpsActive, setIsGpsActive] = useState(false);

  const handleUseCurrentGps = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Geolocalização não é suportada neste navegador.");
      return;
    }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLoading(false);
        setIsGpsActive(true);
        const newCoord: NeighborhoodCoord = {
          name: "📍 Meu GPS Atual (Ao Vivo)",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(newCoord);
      },
      (err) => {
        setIsGpsLoading(false);
        console.warn("GPS error:", err);
        alert("Não foi possível acessar seu GPS. Verifique a permissão de localização do seu navegador.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

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

  // Multi-Screen Navigation State (Home Hub vs Dedicated Category Screens)
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("home");

  // Monte Seu Rolê Perfeito (Matchmaker) State
  const [selectedAmenities, setSelectedAmenities] = useState<RoleAmenityId[]>([]);

  const handleToggleAmenity = (amenityId: RoleAmenityId) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleClearAmenities = () => {
    setSelectedAmenities([]);
  };

  const handleSelectCombo = (combo: RoleAmenityId[]) => {
    setSelectedAmenities(combo);
  };

  // Strict 100% Match Filter: local precisa ter TODOS os requisitos escolhidos simultaneamente
  const customRoleMatches = useMemo(() => {
    if (selectedAmenities.length === 0) return [];
    return venues.filter((venue) =>
      selectedAmenities.every((amenity) => venue.amenities?.includes(amenity))
    );
  }, [venues, selectedAmenities]);

  // Matches parciais (atendem a maioria dos requisitos) para sugestões caso 0 resultados
  const customRolePartialMatches = useMemo(() => {
    if (selectedAmenities.length <= 1) return [];
    return venues
      .map((venue) => {
        const matchCount = selectedAmenities.filter((a) =>
          venue.amenities?.includes(a)
        ).length;
        return { venue, matchCount };
      })
      .filter(
        (item) => item.matchCount > 0 && item.matchCount < selectedAmenities.length
      )
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 4)
      .map((item) => item.venue);
  }, [venues, selectedAmenities]);

  // Screen Switcher Handler
  const handleNavigate = (screen: AppScreen) => {
    setCurrentScreen(screen);
    if (screen === "baladas") {
      setActiveTab("baladas");
      setOnlyAfterHours(false);
    } else if (screen === "restaurantes") {
      setActiveTab("restaurantes");
      setOnlyAfterHours(false);
    } else if (screen === "moteis") {
      setActiveTab("moteis");
      setOnlyAfterHours(false);
    } else if (screen === "after") {
      setOnlyAfterHours(true);
    } else if (screen === "favorites") {
      setActiveTab("favorites");
      setOnlyAfterHours(false);
    } else if (screen === "custom-role") {
      setOnlyAfterHours(false);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset sub-filters on tab change
  const handleTabChange = (tab: MainCategory) => {
    setActiveTab(tab);
    if (tab === "kids") {
      setSelectedCuisine("kids");
      setCurrentScreen("restaurantes");
    } else if (tab === "baladas") {
      setCurrentScreen("baladas");
      setSelectedCuisine("all");
    } else if (tab === "restaurantes") {
      setCurrentScreen("restaurantes");
      setSelectedCuisine("all");
    } else if (tab === "moteis") {
      setCurrentScreen("moteis");
      setSelectedCuisine("all");
    } else if (tab === "favorites") {
      setCurrentScreen("favorites");
    }
    setSelectedMotelStyle("all");
    setOnlyWithHydro(false);
    setOnlyWithPool(false);
  };

  // Counts for tabs & menus
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
  const afterVenuesCount = useMemo(() => {
    return venues.filter(
      (v) =>
        v.isAfterHours ||
        v.openHours?.toLowerCase().includes("24 horas") ||
        v.openHours?.includes("05:") ||
        v.openHours?.includes("06:") ||
        v.openHours?.includes("07:") ||
        v.openHours?.includes("08:")
    ).length;
  }, [venues]);

  // Home Screen Carousels Data
  // 1. Trending venues (Highest rating & review count)
  const trendingVenues = useMemo(() => {
    return [...venues]
      .sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount)
      .slice(0, 8);
  }, [venues]);

  // 2. Nearby venues (Closest to userLocation)
  const nearbyVenues = useMemo(() => {
    return [...venues]
      .sort((a, b) => {
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
      })
      .slice(0, 8);
  }, [venues, userLocation]);

  // 3. Venues with VIP List or Free Entry
  const vipVenues = useMemo(() => {
    return venues.filter((v) => v.hasVipList || v.isWomenFree).slice(0, 8);
  }, [venues]);

  // 4. After-hours venues (5h+ or 24h)
  const afterVenuesList = useMemo(() => {
    return venues
      .filter(
        (v) =>
          v.isAfterHours ||
          v.openHours?.toLowerCase().includes("24 horas") ||
          v.openHours?.includes("05:") ||
          v.openHours?.includes("06:") ||
          v.openHours?.includes("07:") ||
          v.openHours?.includes("08:")
      )
      .slice(0, 8);
  }, [venues]);

  // Instant Search Results on Home Screen
  const homeSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return venues
      .filter((venue) => {
        const matchName = venue.name.toLowerCase().includes(q);
        const matchNeighborhood = venue.neighborhood.toLowerCase().includes(q);
        const matchTagline = venue.tagline.toLowerCase().includes(q);
        const matchSubType = venue.subType.toLowerCase().includes(q);
        const matchTags = venue.tags.some((t) => t.toLowerCase().includes(q));
        const matchCategory = venue.category.toLowerCase().includes(q);
        return (
          matchName ||
          matchNeighborhood ||
          matchTagline ||
          matchSubType ||
          matchTags ||
          matchCategory
        );
      })
      .sort((a, b) => {
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
  }, [venues, searchQuery, userLocation]);

  // Filtered & Distance-Sorted venues
  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      // 1. Tab / Screen category filter
      if (currentScreen === "after" || onlyAfterHours) {
        const isLate =
          venue.isAfterHours ||
          venue.openHours?.toLowerCase().includes("24 horas") ||
          venue.openHours?.includes("05:") ||
          venue.openHours?.includes("06:") ||
          venue.openHours?.includes("07:") ||
          venue.openHours?.includes("08:");
        if (!isLate) return false;
      } else if (currentScreen === "favorites" || activeTab === "favorites") {
        if (!favorites.includes(venue.id)) return false;
      } else if (activeTab === "kids") {
        if (!venue.hasKidsSpace) return false;
      } else if (currentScreen === "baladas" || activeTab === "baladas") {
        if (venue.category !== "baladas") return false;
      } else if (currentScreen === "restaurantes" || activeTab === "restaurantes") {
        if (venue.category !== "restaurantes") return false;
      } else if (currentScreen === "moteis" || activeTab === "moteis") {
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
    currentScreen,
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
        onOpenFavorites={() => handleNavigate("favorites")}
        isFavoritesActive={currentScreen === "favorites"}
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
        onGoHome={() => handleNavigate("home")}
        onOpenCustomRole={() => handleNavigate("custom-role")}
        isCustomRoleActive={currentScreen === "custom-role"}
        onUseCurrentGps={handleUseCurrentGps}
        isGpsLoading={isGpsLoading}
        isGpsActive={isGpsActive}
      />

      {/* ========================================================================= */}
      {/* TELA 1: HOME HUB (TELA INICIAL COM MENUS VISUAIS E CARROSSÉIS DESLIZÁVEIS) */}
      {/* ========================================================================= */}
      {currentScreen === "home" ? (
        <div className="w-full">
          {/* Hero Banner Section */}
          <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-purple-950/20 via-[#0a0f1d] to-[#070a11] py-8 sm:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-600/10 via-fuchsia-600/5 to-transparent pointer-events-none" />

            <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
              {/* Trigger Radar Pill */}
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

              {/* Direct Search Input on Home */}
              <div className="relative mx-auto mt-6 max-w-2xl">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Search className="h-5 w-5 text-cyan-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar balada, bar, motel, estilo musical, bairro..."
                    className="w-full rounded-2xl border border-white/15 bg-[#0e1422]/90 py-3.5 pl-12 pr-10 text-sm text-slate-100 placeholder-slate-400 backdrop-blur-md transition-all focus:border-cyan-400 focus:bg-[#141b2d] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* If Search is Active on Home Hub -> Show Live Search Results */}
          {searchQuery.trim().length > 0 ? (
            <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Resultados para "{searchQuery}"
                  </h3>
                  <p className="text-xs text-slate-400">
                    {homeSearchResults.length} {homeSearchResults.length === 1 ? "local encontrado" : "locais encontrados"}
                  </p>
                </div>
                <button
                  onClick={() => setSearchQuery("")}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10"
                >
                  ✕ Limpar busca
                </button>
              </div>

              {homeSearchResults.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {homeSearchResults.map((venue) => (
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
                <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#0c101c] px-4 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
                    🔍
                  </div>
                  <h4 className="mt-4 text-lg font-bold text-white">Nenhum resultado encontrado</h4>
                  <p className="mt-1 text-xs text-slate-400">Tente buscar por outro termo, gênero musical ou bairro.</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500"
                  >
                    Limpar busca
                  </button>
                </div>
              )}
            </section>
          ) : (
            <>
              {/* Navigation Cards (Menus Principais do App) */}
              <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
                {/* Destaque Principal: ✨ Monte Seu Rolê Perfeito */}
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={() => handleNavigate("custom-role")}
                    className="group relative w-full overflow-hidden rounded-3xl border-2 border-fuchsia-500/60 bg-gradient-to-r from-purple-950 via-[#180a2a] to-cyan-950/90 p-5 sm:p-6 text-left transition-all duration-300 hover:scale-[1.01] active:scale-95 hover:border-cyan-400 hover:shadow-[0_12px_45px_rgba(217,70,239,0.4)] cursor-pointer shadow-xl"
                  >
                    <div className="absolute top-0 right-0 -mr-12 -mt-12 h-44 w-44 rounded-full bg-gradient-to-br from-fuchsia-600/30 to-cyan-500/20 blur-2xl pointer-events-none" />

                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500/30 to-cyan-500/20 text-3xl border border-fuchsia-400/50 shadow-[0_0_25px_rgba(217,70,239,0.4)] group-hover:scale-105 group-hover:rotate-3 transition-transform">
                          ✨
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="rounded-full bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/30 px-2.5 py-0.5 text-[10px] font-extrabold text-cyan-300 border border-cyan-400/40 uppercase tracking-wider">
                              Filtro Exclusivo • 100% Match
                            </span>
                            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-300 border border-amber-500/30">
                              NOVO
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-black text-white mt-1 group-hover:text-cyan-300 transition-colors">
                            Monte Seu Rolê Perfeito
                          </h3>
                          <p className="mt-1 text-xs text-slate-300 max-w-xl leading-relaxed">
                            Combine suas preferências (ex: 🎱 Sinuca + 💨 Narguilé + 🎸 Ao Vivo + 🎤 Karaokê) e veja apenas os locais que têm <strong className="text-cyan-300">TUDO</strong> junto!
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 px-5 py-3 text-xs sm:text-sm font-black text-white shadow-lg shadow-fuchsia-600/40 group-hover:from-fuchsia-500 group-hover:to-cyan-500 transition-all">
                        <span>Montar Agora</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mb-4 text-center sm:text-left">
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center justify-center sm:justify-start gap-2">
                    <Compass className="h-5 w-5 text-cyan-400" />
                    <span>Menu Principal • Escolha onde ir hoje</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Toque no menu abaixo para abrir a página completa
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {/* Card 1: Baladas */}
                  <button
                    type="button"
                    onClick={() => handleNavigate("baladas")}
                    className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-fuchsia-500/40 bg-gradient-to-r from-fuchsia-950/70 via-purple-950/50 to-[#0c101c] p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:border-fuchsia-400 hover:shadow-[0_10px_30px_-5px_rgba(217,70,239,0.5)] cursor-pointer w-full shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-500/20 text-3xl border border-fuchsia-500/40 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(217,70,239,0.3)]">
                        🪩
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-white group-hover:text-fuchsia-300 transition-colors">
                            Baladas & Festas
                          </h3>
                          <span className="rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-[10px] font-extrabold text-fuchsia-300 border border-fuchsia-500/30">
                            {baladasCount} locais
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          Pistas, DJs, Funk, Eletrônica, Sertanejo & VIP
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 rounded-xl bg-fuchsia-600 px-3 py-2 text-xs font-bold text-white shadow-md group-hover:bg-fuchsia-500 transition-colors">
                      <span>Abrir</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>

                  {/* Card 2: Bares & Gastronomia */}
                  <button
                    type="button"
                    onClick={() => handleNavigate("restaurantes")}
                    className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/70 via-orange-950/50 to-[#0c101c] p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:border-amber-400 hover:shadow-[0_10px_30px_-5px_rgba(245,158,11,0.5)] cursor-pointer w-full shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-3xl border border-amber-500/40 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                        🍸
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                            Bares & Gastronomia
                          </h3>
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-300 border border-amber-500/30">
                            {restaurantesCount} opções
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          Rooftops, Drinks autorais, Botecos & Família
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white shadow-md group-hover:bg-amber-500 transition-colors">
                      <span>Abrir</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>

                  {/* Card 3: Motéis & Suítes */}
                  <button
                    type="button"
                    onClick={() => handleNavigate("moteis")}
                    className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-rose-500/40 bg-gradient-to-r from-rose-950/70 via-pink-950/50 to-[#0c101c] p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:border-rose-400 hover:shadow-[0_10px_30px_-5px_rgba(244,63,94,0.5)] cursor-pointer w-full shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-3xl border border-rose-500/40 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                        🏩
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-white group-hover:text-rose-300 transition-colors">
                            Motéis & Suítes
                          </h3>
                          <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-extrabold text-rose-300 border border-rose-500/30">
                            {moteisCount} suítes
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          Hidro, Piscinas Privativas, Pernoite & Luxo
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-md group-hover:bg-rose-500 transition-colors">
                      <span>Abrir</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>

                  {/* Card 4: Modo After */}
                  <button
                    type="button"
                    onClick={() => handleNavigate("after")}
                    className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/70 via-indigo-950/50 to-[#0c101c] p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:border-cyan-400 hover:shadow-[0_10px_30px_-5px_rgba(6,182,212,0.5)] cursor-pointer w-full shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 text-3xl border border-cyan-500/40 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                        🌙
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-300 transition-colors">
                            Modo After (5h+ / 24h)
                          </h3>
                          <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-extrabold text-cyan-300 border border-cyan-500/30">
                            {afterVenuesCount} abertos
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          Baladas que viram até 8h & Lanches/Padarias 24h
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 rounded-xl bg-cyan-600 px-3 py-2 text-xs font-bold text-white shadow-md group-hover:bg-cyan-500 transition-colors">
                      <span>Abrir</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* TELAS DEDICADAS (BALADAS, BARES, MOTÉIS, AFTER, FAVORITOS)                 */
        /* ========================================================================= */
        <div className="w-full">
          {/* Top Navigation Bar: Back to Home + Page Title */}
          <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleNavigate("home")}
                  className="flex items-center gap-2 rounded-2xl bg-purple-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-purple-600/40 hover:bg-purple-500 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>← Voltar aos Menus</span>
                </button>

                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    {currentScreen === "baladas" && (
                      <>
                        <span className="text-2xl">🪩</span>
                        <span>Baladas & Festas</span>
                      </>
                    )}
                    {currentScreen === "restaurantes" && (
                      <>
                        <span className="text-2xl">🍸</span>
                        <span>Bares & Gastronomia</span>
                      </>
                    )}
                    {currentScreen === "moteis" && (
                      <>
                        <span className="text-2xl">🏩</span>
                        <span>Motéis & Suítes</span>
                      </>
                    )}
                    {currentScreen === "after" && (
                      <>
                        <span className="text-2xl">🌙</span>
                        <span>Modo After (5h+ / 24h)</span>
                      </>
                    )}
                    {currentScreen === "favorites" && (
                      <>
                        <span className="text-2xl">❤️</span>
                        <span>Meus Locais Salvos</span>
                      </>
                    )}
                    {currentScreen === "custom-role" && (
                      <>
                        <span className="text-2xl">✨</span>
                        <span>Monte Seu Rolê Perfeito</span>
                      </>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentScreen === "baladas" &&
                      "As pistas mais disputadas, DJs convidados e listas VIP de São Paulo"}
                    {currentScreen === "restaurantes" &&
                      "Drinks autorais, rooftops, botecos e alta gastronomia em SP"}
                    {currentScreen === "moteis" &&
                      "Privacidade, hidromassagem, piscinas privativas e suítes com pernoite"}
                    {currentScreen === "after" &&
                      "Locais abertos para virar a noite até as 8h da manhã ou lanches 24h"}
                    {currentScreen === "favorites" &&
                      `${favorites.length} ${favorites.length === 1 ? "local salvo" : "locais salvos"} na sua lista`}
                    {currentScreen === "custom-role" &&
                      "Filtro 100% estrito: mostramos apenas os locais que reúnem todas as opções escolhidas"}
                  </p>
                </div>
              </div>

              {/* Location Reference Badge */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                <span>Distâncias calculadas de:</span>
                <span className="font-bold text-slate-200">{userLocation.name}</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TELA DEDICADA: ✨ MONTE SEU ROLÊ PERFEITO (MATCHMAKER PERSONALIZADO)      */}
          {/* ========================================================================= */}
          {currentScreen === "custom-role" ? (
            <CustomRoleMatchmaker
              venues={venues}
              userLocation={userLocation}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onOpenDetails={setActiveVenue}
              selectedAmenities={selectedAmenities}
              onToggleAmenity={handleToggleAmenity}
              onClearAmenities={handleClearAmenities}
              onSelectCombo={handleSelectCombo}
              customRoleMatches={customRoleMatches}
              customRolePartialMatches={customRolePartialMatches}
            />
          ) : (
            <>
              {/* Category FilterBar */}
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
            onlyAfterHours={onlyAfterHours || currentScreen === "after"}
            onToggleAfterHours={() => setOnlyAfterHours(!onlyAfterHours)}
          />

          {/* Modo After Active Banner */}
          {(onlyAfterHours || currentScreen === "after") && (
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
                {currentScreen === "after" ? (
                  <button
                    onClick={() => handleNavigate("home")}
                    className="self-end sm:self-center shrink-0 rounded-xl border border-amber-500/30 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-amber-200 hover:bg-white/20 transition-all active:scale-95"
                  >
                    Voltar ao Início
                  </button>
                ) : (
                  <button
                    onClick={() => setOnlyAfterHours(false)}
                    className="self-end sm:self-center shrink-0 rounded-xl border border-amber-500/30 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-amber-200 hover:bg-white/20 transition-all active:scale-95"
                  >
                    ✕ Desativar Modo After
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Smart Late Night Invitation Toast */}
          {isLateNightTime && !onlyAfterHours && currentScreen !== "after" && (
            <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 rounded-2xl border border-purple-500/30 bg-purple-950/40 px-4 py-2.5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-base animate-pulse">🌙</span>
                  <span className="text-slate-200 font-medium">
                    Passou das 2h da madrugada em SP! Procurando onde esticar a noite agora?
                  </span>
                </div>
                <button
                  onClick={() => handleNavigate("after")}
                  className="rounded-xl border border-amber-400/50 bg-amber-500/20 px-3.5 py-1 text-xs font-black text-amber-300 hover:bg-amber-500/30 transition-all shrink-0 active:scale-95"
                >
                  Ativar Modo After (5h+)
                </button>
              </div>
            </div>
          )}

          {/* Dedicated Category Venues Grid Section */}
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
                  {currentScreen === "favorites" ? "💔" : "🔍"}
                </div>

                <h3 className="mt-4 text-lg font-bold text-white">
                  {currentScreen === "favorites"
                    ? "Nenhum local salvo ainda"
                    : "Nenhum local encontrado com esses filtros"}
                </h3>

                <p className="mt-1 max-w-sm text-xs text-slate-400">
                  {currentScreen === "favorites"
                    ? "Clique no ícone de coração nos cards de baladas e restaurantes para salvar e acessá-los rapidamente aqui!"
                    : "Tente remover alguns filtros ou buscar por outro termo para encontrar opções."}
                </p>

                <button
                  onClick={
                    currentScreen === "favorites"
                      ? () => handleNavigate("baladas")
                      : handleResetFilters
                  }
                  className="mt-5 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all hover:bg-purple-500"
                >
                  {currentScreen === "favorites"
                    ? "Explorar Baladas"
                    : "Limpar todos os filtros"}
                </button>
              </div>
            )}
          </main>
            </>
          )}
        </div>
      )}

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
        onSelectLogo={(logo) => {
          setCurrentLogo(logo);
          if (typeof window !== "undefined") {
            localStorage.setItem("preferred_logo", logo);
          }
        }}
      />

      {/* Floating Mobile Bottom Navigation */}
      <MobileNav
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
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
