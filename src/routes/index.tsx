import React, { useState, useEffect, useMemo, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  VENUES_DATA,
  NEIGHBORHOODS,
  Venue,
  NeighborhoodCoord,
  calculateDistanceKm,
  extractVenuePrice,
  ROLE_AMENITIES,
  RoleAmenityId,
  RoleAmenity,
} from "../data/venues";
import { Header } from "../components/Header";
import { CategoryTabs, MainCategory } from "../components/CategoryTabs";
import { FilterBar, PriceFilterType } from "../components/FilterBar";
import { VenueCard } from "../components/VenueCard";
import { VenueModal } from "../components/VenueModal";
import { MobileNav, AppScreen } from "../components/MobileNav";
import { VipListModal } from "../components/VipListModal";
import { RegisterVenueModal } from "../components/RegisterVenueModal";
import { AuthModal } from "../components/AuthModal";
import { UserProfileModal } from "../components/UserProfileModal";
import { LogoPickerModal } from "../components/LogoPickerModal";
import { RadarIntroSplash } from "../components/RadarIntroSplash";
import { CustomRoleMatchmaker } from "../components/CustomRoleMatchmaker";
import { NeighborhoodModal } from "../components/NeighborhoodModal";
import { AgeGateModal } from "../components/AgeGateModal";
import { LgpdConsentBanner } from "../components/LgpdConsentBanner";
import { LegalTermsModal } from "../components/LegalTermsModal";
import {
  loadPersistedNavState,
  savePersistedNavState,
  setupVisibilityPersistence,
} from "../lib/navPersistence";
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

interface AppHistoryState {
  __radarApp: boolean;
  screen: AppScreen;
  modal: "venue" | "vip" | "auth" | "profile" | "register" | "analytics" | "logo" | null;
  venueId?: string;
  depth: number;
}

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const initialNav = useMemo(() => loadPersistedNavState(), []);

  // Radar Intro Splash - Abertura cinematográfica com radar ativo diretamente no Logo Oficial (Sempre na entrada/refresh)
  const [showRadarIntro, setShowRadarIntro] = useState(() => {
    if (typeof window !== "undefined" && (window as unknown as { __radarSessionDismissed?: boolean }).__radarSessionDismissed) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { __triggerSkipRadar?: () => void }).__triggerSkipRadar = () => {
        (window as unknown as { __radarSessionDismissed?: boolean }).__radarSessionDismissed = true;
        setShowRadarIntro(false);
      };
    }
  }, []);

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

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [vipModalVenue, setVipModalVenue] = useState<Venue | null>(null);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<"termos" | "privacidade" | "listavip" | "parceiros">("termos");
  const [isAgeGateForceOpen, setIsAgeGateForceOpen] = useState(false);

  // Navigation & Category Tab state (Persistido entre abas)
  const [activeTab, setActiveTab] = useState<MainCategory>(() => initialNav.activeTab || "baladas");

  // User starting point for distance & Uber calculation (Auto-pulls GPS on entry)
  const [userLocation, setUserLocation] = useState<NeighborhoodCoord>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("radar_user_location");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return NEIGHBORHOODS[0]; // Default: Vila Madalena
  });
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [isGpsActive, setIsGpsActive] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("radar_gps_active") === "true";
    }
    return false;
  });
  const [isNeighborhoodModalOpen, setIsNeighborhoodModalOpen] = useState(false);

  const syncWithGps = (isSilent = false) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      if (!isSilent) alert("Geolocalização não é suportada neste navegador.");
      return;
    }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLoading(false);
        setIsGpsActive(true);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Procura o bairro mais próximo da base de dados
        let closest = NEIGHBORHOODS[0];
        let minDistance = Infinity;
        NEIGHBORHOODS.forEach((n) => {
          const d = calculateDistanceKm(lat, lng, n.lat, n.lng);
          if (d < minDistance) {
            minDistance = d;
            closest = n;
          }
        });

        // Se estiver num raio razoável de algum bairro, exibe o nome com badge GPS
        const neighborhoodName = minDistance <= 8 ? `${closest.name} (GPS)` : "📍 Minha Localização (GPS)";

        const newCoord: NeighborhoodCoord = {
          name: neighborhoodName,
          lat,
          lng,
        };

        setUserLocation(newCoord);
        try {
          localStorage.setItem("radar_user_location", JSON.stringify(newCoord));
          localStorage.setItem("radar_gps_active", "true");
        } catch (e) {}
      },
      (err) => {
        setIsGpsLoading(false);
        if (!isSilent) {
          console.warn("GPS error:", err);
          alert("Não foi possível acessar seu GPS. Verifique a permissão de localização do seu navegador.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSelectNeighborhood = (coord: NeighborhoodCoord) => {
    setUserLocation(coord);
    setIsGpsActive(false);
    try {
      localStorage.setItem("radar_user_location", JSON.stringify(coord));
      localStorage.setItem("radar_gps_active", "false");
    } catch (e) {}
  };

  // Puxa automaticamente a localização GPS do usuário logo ao entrar na plataforma
  useEffect(() => {
    syncWithGps(true);
  }, []);

  // Search & Filters (Persistidos entre abas)
  const [searchQuery, setSearchQuery] = useState(() => initialNav.searchQuery || "");
  const [selectedGenre, setSelectedGenre] = useState(() => initialNav.selectedGenre || "all");
  const [selectedCuisine, setSelectedCuisine] = useState(() => initialNav.selectedCuisine || "all");
  const [selectedMotelStyle, setSelectedMotelStyle] = useState(() => initialNav.selectedMotelStyle || "all");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(() => initialNav.selectedNeighborhood || "all");
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | null>(() => (initialNav.maxDistanceKm !== undefined ? initialNav.maxDistanceKm : null));
  const [entryPriceFilter, setEntryPriceFilter] = useState<PriceFilterType>(() => initialNav.entryPriceFilter || "all");
  const [onlyOpenToday, setOnlyOpenToday] = useState(() => initialNav.onlyOpenToday || false);
  const [onlyVipOrFree, setOnlyVipOrFree] = useState(false);
  const [onlyWithParking, setOnlyWithParking] = useState(() => initialNav.onlyWithParking || false);
  const [onlyWithHydro, setOnlyWithHydro] = useState(() => initialNav.onlyWithHydro || false);
  const [onlyWithPool, setOnlyWithPool] = useState(() => initialNav.onlyWithPool || false);
  const [onlyAfterHours, setOnlyAfterHours] = useState(() => initialNav.onlyAfterHours || (initialNav.screen === "after"));
  const [onlyTrending, setOnlyTrending] = useState(false);
  const [onlySnookerHookah, setOnlySnookerHookah] = useState(() => initialNav.onlySnookerHookah || false);

  // Monte Seu Rolê (Matchmaker Personalizado)
  const [selectedAmenities, setSelectedAmenities] = useState<RoleAmenityId[]>([]);

  const handleToggleAmenity = (id: RoleAmenityId) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearAmenities = () => {
    setSelectedAmenities([]);
  };

  const handleSelectCombo = (combo: RoleAmenityId[]) => {
    setSelectedAmenities(combo);
  };

  // Matchmaker Custom Role Results (Exact 100% matches & Partial matches)
  const { customRoleMatches, customRolePartialMatches } = useMemo(() => {
    if (selectedAmenities.length === 0) {
      return { customRoleMatches: [], customRolePartialMatches: [] };
    }

    const exact: Venue[] = [];
    const partial: Venue[] = [];

    venues.forEach((v) => {
      // Motéis são estritamente excluídos do matchmaker de rolê
      if (v.category === "moteis") return;

      const vAmenities = v.amenities || [];
      const hasAll = selectedAmenities.every((amenity) =>
        vAmenities.includes(amenity)
      );
      if (hasAll) {
        exact.push(v);
        return;
      }

      const matchCount = selectedAmenities.filter((amenity) =>
        vAmenities.includes(amenity)
      ).length;
      if (matchCount >= Math.ceil(selectedAmenities.length / 2)) {
        partial.push(v);
      }
    });

    const sortByDist = (a: Venue, b: Venue) => {
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
    };

    return {
      customRoleMatches: exact.sort(sortByDist),
      customRolePartialMatches: partial.sort(sortByDist),
    };
  }, [venues, selectedAmenities, userLocation]);

  // Smart late-night detector: between 02:00 and 06:00 AM
  const isLateNightTime = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 2 && hour < 6;
  }, []);

  // Modal Detail state (Persistido entre abas e reloads)
  const [activeVenue, setActiveVenue] = useState<Venue | null>(() => {
    if (initialNav.venueId) {
      return VENUES_DATA.find((item) => item.id === initialNav.venueId) || null;
    }
    return null;
  });

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

  // Multi-Screen Navigation State (Persistido entre abas)
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(
    () => initialNav.screen || "home"
  );

  // History stack depth reference to manage mobile back button & browser stack
  const hasRestoredInitialNavRef = useRef(false);
  const isHydratedRef = useRef(false);

  // Restauração inicial à prova de falhas: resgata o estado do storage sem ser sobrescrito pelo boot
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasRestoredInitialNavRef.current) return;
    hasRestoredInitialNavRef.current = true;

    const saved = loadPersistedNavState();

    if (saved.screen && saved.screen !== "home") {
      applyScreenTransition(saved.screen);
    } else if (saved.screen === "home") {
      setCurrentScreen("home");
    }

    if (saved.activeTab) {
      setActiveTab(saved.activeTab);
    }

    // Libera a gravação de estado contínua APÓS restaurar o estado persistido com segurança
    isHydratedRef.current = true;
  }, []);

  // Persistência contínua do estado da plataforma (Tela ativa, Filtros, Modal e Busca)
  useEffect(() => {
    // BLINDAGEM: Não sobrescreve o storage enquanto a hidratação não foi concluída
    if (!isHydratedRef.current) return;

    savePersistedNavState({
      screen: currentScreen,
      activeTab,
      venueId: activeVenue?.id || null,
      vipVenueId: vipModalVenue?.id || null,
      selectedGenre,
      selectedCuisine,
      selectedMotelStyle,
      selectedNeighborhood,
      entryPriceFilter,
      maxDistanceKm,
      onlyOpenToday,
      onlyWithParking,
      onlyWithHydro,
      onlyWithPool,
      onlyAfterHours,
      onlySnookerHookah,
      searchQuery,
    });
  }, [
    currentScreen,
    activeTab,
    activeVenue,
    vipModalVenue,
    selectedGenre,
    selectedCuisine,
    selectedMotelStyle,
    selectedNeighborhood,
    entryPriceFilter,
    maxDistanceKm,
    onlyOpenToday,
    onlyWithParking,
    onlyWithHydro,
    onlyWithPool,
    onlyAfterHours,
    onlySnookerHookah,
    searchQuery,
  ]);

  // Guardião de Visibilidade: salva ao trocar de aba e restaura fielmente ao voltar
  useEffect(() => {
    return setupVisibilityPersistence(
      () => ({
        screen: currentScreen,
        activeTab,
        venueId: activeVenue?.id || null,
        vipVenueId: vipModalVenue?.id || null,
        selectedGenre,
        selectedCuisine,
        selectedMotelStyle,
        selectedNeighborhood,
        entryPriceFilter,
        maxDistanceKm,
        onlyOpenToday,
        onlyWithParking,
        onlyWithHydro,
        onlyWithPool,
        onlyAfterHours,
        onlySnookerHookah,
        searchQuery,
      }),
      (saved) => {
        if (!isHydratedRef.current) return;
        if (saved.screen && saved.screen !== currentScreen) {
          applyScreenTransition(saved.screen);
        }
        if (saved.venueId && (!activeVenue || activeVenue.id !== saved.venueId)) {
          const v =
            venues.find((item) => item.id === saved.venueId) ||
            VENUES_DATA.find((item) => item.id === saved.venueId);
          if (v) setActiveVenue(v);
        }
      }
    );
  }, [
    currentScreen,
    activeTab,
    activeVenue,
    vipModalVenue,
    selectedGenre,
    selectedCuisine,
    selectedMotelStyle,
    selectedNeighborhood,
    entryPriceFilter,
    maxDistanceKm,
    onlyOpenToday,
    onlyWithParking,
    onlyWithHydro,
    onlyWithPool,
    onlyAfterHours,
    onlySnookerHookah,
    searchQuery,
    venues,
  ]);

  // Helper to close all modals directly
  const closeAllModalsDirect = () => {
    setActiveVenue(null);
    setIsVipModalOpen(false);
    setVipModalVenue(null);
    setIsRegisterModalOpen(false);
    setIsAuthModalOpen(false);
    setIsProfileModalOpen(false);
    setIsLogoPickerOpen(false);
    setIsNeighborhoodModalOpen(false);
  };

  // Helper to apply category tab & filters corresponding to screen
  const applyScreenTransition = (screen: AppScreen) => {
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
  };

  // Browser History & Mobile Back Button Listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onPopState = () => {
      // 1. Se qualquer modal estiver aberto quando o usuário apertar o botão Voltar do celular:
      // Fecha o modal imediatamente, sem sair do aplicativo e mantendo o usuário na lista atual
      if (activeVenue || isVipModalOpen || isRegisterModalOpen || isAuthModalOpen || isProfileModalOpen || isLogoPickerOpen) {
        closeAllModalsDirect();
        savePersistedNavState({
          screen: currentScreen,
          activeTab,
          venueId: null,
          vipVenueId: null,
        });
        return;
      }

      // 2. Se estiver navegando em uma tela que não seja a Home, volta para Home
      if (currentScreen !== "home") {
        closeAllModalsDirect();
        applyScreenTransition("home");
        savePersistedNavState({ screen: "home", venueId: null });
        return;
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [venues, activeVenue, isVipModalOpen, isRegisterModalOpen, isAuthModalOpen, isProfileModalOpen, isLogoPickerOpen, currentScreen]);

  // Screen Switcher Handler with History Push
  const handleNavigate = (screen: AppScreen) => {
    closeAllModalsDirect();

    if (screen === currentScreen) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      window.history.pushState({ __radarScreen: screen }, "");
    } catch (e) {}

    applyScreenTransition(screen);
    savePersistedNavState({
      screen,
      venueId: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Back Button ("← Voltar aos Menus")
  const handleGoBack = () => {
    closeAllModalsDirect();
    try {
      window.history.pushState({ __radarScreen: "home" }, "");
    } catch (e) {}
    applyScreenTransition("home");
    savePersistedNavState({ screen: "home", venueId: null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Close Any Modal (Fecha o modal de forma imediata e limpa o storage)
  const handleCloseModal = () => {
    closeAllModalsDirect();
    savePersistedNavState({
      screen: currentScreen,
      activeTab,
      venueId: null,
      vipVenueId: null,
    });
  };

  // Modal Openers with History Tracking:
  const handleOpenVenueModal = (venue: Venue) => {
    closeAllModalsDirect();
    setActiveVenue(venue);
    try {
      window.history.pushState({ __modal: "venue", venueId: venue.id }, "");
    } catch (e) {}
    savePersistedNavState({
      screen: currentScreen,
      activeTab,
      venueId: venue.id,
    });
  };

  const handleOpenVipModalWithHistory = (venue: Venue) => {
    closeAllModalsDirect();
    setVipModalVenue(venue);
    setIsVipModalOpen(true);
    try {
      window.history.pushState({ __modal: "vip", venueId: venue.id }, "");
    } catch (e) {}
  };

  const handleOpenAuthModal = () => {
    closeAllModalsDirect();
    setIsAuthModalOpen(true);
    try {
      window.history.pushState({ __modal: "auth" }, "");
    } catch (e) {}
  };

  const handleOpenProfileModal = () => {
    closeAllModalsDirect();
    setIsProfileModalOpen(true);
    try {
      window.history.pushState({ __modal: "profile" }, "");
    } catch (e) {}
  };

  const handleOpenRegisterModal = () => {
    closeAllModalsDirect();
    setIsRegisterModalOpen(true);
    try {
      window.history.pushState({ __modal: "register" }, "");
    } catch (e) {}
  };

  const handleOpenLogoPickerModal = () => {
    closeAllModalsDirect();
    setIsLogoPickerOpen(true);
    try {
      window.history.pushState({ __modal: "logo" }, "");
    } catch (e) {}
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
        if (!venue.hasKidsSpace || venue.category === "moteis") return false;
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
          if (!venue.hasKidsSpace || venue.category === "moteis") return false;
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

      // 13. Trending filter (Bombando hoje)
      if (onlyTrending) {
        const isTrending = venue.rating >= 4.8 || venue.reviewsCount >= 1800;
        if (!isTrending) return false;
      }

      // 14. Snooker / Hookah filter
      if (onlySnookerHookah) {
        const hasSnookerOrHookah =
          venue.amenities?.includes("sinuca") ||
          venue.amenities?.includes("narguile") ||
          venue.tags.some((t) => t.toLowerCase().includes("sinuca") || t.toLowerCase().includes("narguilé"));
        if (!hasSnookerOrHookah) return false;
      }

      // 15. Filter by Max Distance (Raio em Km)
      if (maxDistanceKm !== null) {
        const dist = calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          venue.coordinates.lat,
          venue.coordinates.lng
        );
        if (dist > maxDistanceKm) {
          return false;
        }
      }

      // 16. Filter by Entry Price (Valores de Entrada)
      if (entryPriceFilter === "vip_free") {
        if (!venue.hasVipList && !venue.isWomenFree && venue.priceCategory !== "free") {
          return false;
        }
      } else if (entryPriceFilter === "low") {
        if (venue.priceCategory !== "low" && venue.priceCategory !== "free") {
          return false;
        }
      } else if (entryPriceFilter === "open_bar") {
        const isOpenBar = venue.isOpenBar || venue.tags.some((t) => t.toLowerCase().includes("open bar"));
        if (!isOpenBar) {
          return false;
        }
      } else if (entryPriceFilter === "motel_under_120") {
        const price = extractVenuePrice(venue.entryPrice);
        if (price > 120) return false;
      } else if (entryPriceFilter === "motel_120_160") {
        const price = extractVenuePrice(venue.entryPrice);
        if (price < 120 || price > 160) return false;
      } else if (entryPriceFilter === "motel_above_160") {
        const price = extractVenuePrice(venue.entryPrice);
        if (price <= 160) return false;
      }

      return true;
    }).sort((a, b) => {
      // Ordenação por valor / preço (Mais Barato ou Mais Caro)
      if (entryPriceFilter === "price_asc") {
        const priceA = extractVenuePrice(a.entryPrice);
        const priceB = extractVenuePrice(b.entryPrice);
        if (priceA !== priceB) {
          return priceA - priceB;
        }
      } else if (entryPriceFilter === "price_desc") {
        const priceA = extractVenuePrice(a.entryPrice);
        const priceB = extractVenuePrice(b.entryPrice);
        if (priceA !== priceB) {
          return priceB - priceA;
        }
      }

      // Default: Sort by closest distance to userLocation
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
    maxDistanceKm,
    entryPriceFilter,
    onlyOpenToday,
    onlyVipOrFree,
    onlyWithParking,
    onlyWithHydro,
    onlyWithPool,
    onlyAfterHours,
    onlyTrending,
    onlySnookerHookah,
    searchQuery,
    userLocation,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedGenre("all");
    setSelectedCuisine("all");
    setSelectedMotelStyle("all");
    setSelectedNeighborhood("all");
    setMaxDistanceKm(null);
    setEntryPriceFilter("all");
    setOnlyOpenToday(false);
    setOnlyVipOrFree(false);
    setOnlyWithParking(false);
    setOnlyWithHydro(false);
    setOnlyWithPool(false);
    setOnlyAfterHours(false);
    setOnlyTrending(false);
    setOnlySnookerHookah(false);
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedGenre !== "all" ||
    selectedCuisine !== "all" ||
    selectedMotelStyle !== "all" ||
    selectedNeighborhood !== "all" ||
    maxDistanceKm !== null ||
    entryPriceFilter !== "all" ||
    onlyOpenToday ||
    onlyAfterHours ||
    onlyWithParking ||
    onlyWithHydro ||
    onlyWithPool ||
    onlyTrending ||
    onlySnookerHookah;

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 pb-24 sm:pb-16 selection:bg-cyan-500 selection:text-black w-full max-w-full overflow-x-hidden">
      {/* Radar Intro Splash Animation (Abertura estilo scanner de satélite) */}
      {showRadarIntro && (
        <RadarIntroSplash
          onFinish={() => {
            if (typeof window !== "undefined") {
              (window as unknown as { __radarSessionDismissed?: boolean }).__radarSessionDismissed = true;
            }
            setShowRadarIntro(false);
          }}
        />
      )}

      {/* Header */}
      <Header
        currentNeighborhood={userLocation}
        onSelectNeighborhood={handleSelectNeighborhood}
        favoritesCount={favorites.length}
        onOpenFavorites={() => handleNavigate("favorites")}
        isFavoritesActive={currentScreen === "favorites"}
        totalVenuesCount={venues.length}
        onOpenRegisterModal={handleOpenRegisterModal}
        user={user}
        onOpenAuth={handleOpenAuthModal}
        onOpenProfile={handleOpenProfileModal}
        currentLogo={currentLogo}
        onOpenLogoPicker={handleOpenLogoPickerModal}
        onTriggerRadar={() => {
          if (typeof window !== "undefined") {
            (window as unknown as { __radarSkipped?: boolean }).__radarSkipped = false;
          }
          setShowRadarIntro(true);
        }}
        onGoHome={() => handleNavigate("home")}
        onOpenCustomRole={() => handleNavigate("custom-role")}
        isCustomRoleActive={currentScreen === "custom-role"}
        onUseCurrentGps={() => syncWithGps(false)}
        isGpsLoading={isGpsLoading}
        isGpsActive={isGpsActive}
        onOpenNeighborhoodModal={() => setIsNeighborhoodModalOpen(true)}
      />

      {/* ========================================================================= */}
      {/* TELA 1: HOME HUB (TELA INICIAL COM MENUS VISUAIS E CARROSSÉIS DESLIZÁVEIS) */}
      {/* ========================================================================= */}
      {currentScreen === "home" ? (
        <div className="w-full">
          {/* Hero Banner Section */}
          <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-cyan-950/20 via-[#0a0f1d] to-[#070a11] py-8 sm:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-600/10 via-fuchsia-600/5 to-transparent pointer-events-none" />

            <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
              {/* Trigger Radar Pill */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      (window as unknown as { __radarSkipped?: boolean }).__radarSkipped = false;
                    }
                    setShowRadarIntro(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/40 px-4 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 hover:scale-105 active:scale-95 transition-all backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.35)] cursor-pointer"
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
                <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
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
                      onOpenDetails={handleOpenVenueModal}
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
                    className="mt-4 rounded-xl bg-gradient-to-r from-cyan-600 to-fuchsia-600 px-4 py-2 text-xs font-bold text-white hover:from-cyan-500 hover:to-fuchsia-500 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
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
                {/* Botão Compacto: ✨ Monte Seu Rolê Perfeito */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => handleNavigate("custom-role")}
                    className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-fuchsia-500/50 bg-gradient-to-r from-fuchsia-950/80 via-[#120a22]/90 to-cyan-950/80 p-3 sm:p-3.5 text-left transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_6px_25px_rgba(255,0,127,0.35)] active:scale-[0.99] cursor-pointer shadow-lg"
                  >
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-gradient-to-br from-fuchsia-600/20 to-cyan-500/10 blur-xl pointer-events-none" />

                    <div className="relative flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-cyan-500/20 text-xl border border-fuchsia-400/50 shadow-[0_0_15px_rgba(255,0,127,0.3)] group-hover:scale-105 group-hover:rotate-6 transition-transform">
                        ✨
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-black text-white group-hover:text-cyan-300 transition-colors truncate">
                          Monte Seu Rolê Perfeito
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-300 truncate mt-0.5">
                          Sinuca + Narguilé + Ao Vivo + Karaokê e mais
                        </p>
                      </div>
                    </div>

                    <div className="relative shrink-0 flex flex-col items-center justify-center gap-1 ml-2">
                      <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-extrabold text-cyan-300 border border-cyan-400/30 whitespace-nowrap shadow-sm">
                        100% MATCH
                      </span>
                      <div className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 px-3 py-1.5 text-xs font-black text-white shadow-md group-hover:from-fuchsia-500 group-hover:to-cyan-500 transition-all">
                        <span>Montar</span>
                        <ChevronRight className="h-3.5 w-3.5" />
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
                    className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-fuchsia-500/40 bg-gradient-to-r from-fuchsia-950/70 via-[#180824] to-[#080d1a] p-4 sm:p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:border-fuchsia-400 hover:shadow-[0_10px_30px_-5px_rgba(255,0,127,0.5)] cursor-pointer w-full shadow-lg"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-500/20 text-2xl sm:text-3xl border border-fuchsia-500/40 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,0,127,0.3)]">
                        🪩
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-black text-white group-hover:text-fuchsia-300 transition-colors truncate">
                          Baladas & Festas
                        </h3>
                        <p className="mt-0.5 text-[11px] sm:text-xs text-slate-400 line-clamp-1">
                          Pistas, DJs, Funk, Eletrônica, Sertanejo & VIP
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-center justify-center gap-1.5 ml-2.5">
                      <div className="flex items-center gap-1">
                        <span className="rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] px-1.5 py-0.5 font-black border border-rose-500/30">
                          🔞 +18
                        </span>
                        <span className="rounded-full bg-fuchsia-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-fuchsia-300 border border-fuchsia-500/30 whitespace-nowrap shadow-sm">
                          {baladasCount} locais
                        </span>
                      </div>
                      <div className="w-full flex items-center justify-center gap-1 rounded-xl bg-fuchsia-600 px-3 py-1.5 text-xs font-bold text-white shadow-md group-hover:bg-fuchsia-500 transition-colors">
                        <span>Abrir</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </button>

                  {/* Card 2: Bares & Gastronomia (Electric Cyan Oficial) */}
                  <button
                    type="button"
                    onClick={() => handleNavigate("restaurantes")}
                    className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/70 via-[#0a1828]/60 to-[#080d1a] p-4 sm:p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:border-cyan-400 hover:shadow-[0_10px_30px_-5px_rgba(0,240,255,0.4)] cursor-pointer w-full shadow-lg"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 text-2xl sm:text-3xl border border-cyan-500/40 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                        🍸
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-black text-white group-hover:text-cyan-300 transition-colors truncate">
                          Bares & Gastronomia
                        </h3>
                        <p className="mt-0.5 text-[11px] sm:text-xs text-slate-400 line-clamp-1">
                          Rooftops, Drinks autorais, Botecos & Família
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-center justify-center gap-1.5 ml-2.5">
                      <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-cyan-300 border border-cyan-500/30 whitespace-nowrap shadow-sm">
                        {restaurantesCount} opções
                      </span>
                      <div className="w-full flex items-center justify-center gap-1 rounded-xl bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white shadow-md group-hover:bg-cyan-500 transition-colors">
                        <span>Abrir</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </button>

                  {/* Card 3: Motéis & Suítes (Neon Magenta Oficial) */}
                  <button
                    type="button"
                    onClick={() => handleNavigate("moteis")}
                    className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-fuchsia-500/40 bg-gradient-to-r from-fuchsia-950/70 via-[#1e0a24]/60 to-[#080d1a] p-4 sm:p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:border-fuchsia-400 hover:shadow-[0_10px_30px_-5px_rgba(255,0,127,0.4)] cursor-pointer w-full shadow-lg"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-500/20 text-2xl sm:text-3xl border border-fuchsia-500/40 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,0,127,0.3)]">
                        🏩
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-black text-white group-hover:text-fuchsia-300 transition-colors truncate">
                          Motéis & Suítes
                        </h3>
                        <p className="mt-0.5 text-[11px] sm:text-xs text-slate-400 line-clamp-1">
                          Hidro, Piscinas Privativas, Pernoite & Luxo
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-center justify-center gap-1.5 ml-2.5">
                      <div className="flex items-center gap-1">
                        <span className="rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] px-1.5 py-0.5 font-black border border-rose-500/30">
                          🔞 +18
                        </span>
                        <span className="rounded-full bg-fuchsia-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-fuchsia-300 border border-fuchsia-500/30 whitespace-nowrap shadow-sm">
                          {moteisCount} suítes
                        </span>
                      </div>
                      <div className="w-full flex items-center justify-center gap-1 rounded-xl bg-fuchsia-600 px-3 py-1.5 text-xs font-bold text-white shadow-md group-hover:bg-fuchsia-500 transition-colors">
                        <span>Abrir</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </button>

                  {/* Card 4: Modo After (Cyber Duo Cyan + Magenta) */}
                  <button
                    type="button"
                    onClick={() => handleNavigate("after")}
                    className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/70 via-[#0b1326]/60 to-fuchsia-950/50 p-4 sm:p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:border-cyan-400 hover:shadow-[0_10px_30px_-5px_rgba(0,240,255,0.4)] cursor-pointer w-full shadow-lg"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 text-2xl sm:text-3xl border border-cyan-500/40 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                        🌙
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-black text-white group-hover:text-cyan-300 transition-colors truncate">
                          Modo After (5h+ / 24h)
                        </h3>
                        <p className="mt-0.5 text-[11px] sm:text-xs text-slate-400 line-clamp-1">
                          Baladas que viram até 8h & Lanches/Padarias 24h
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-center justify-center gap-1.5 ml-2.5">
                      <div className="flex items-center gap-1">
                        <span className="rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] px-1.5 py-0.5 font-black border border-rose-500/30">
                          🔞 +18
                        </span>
                        <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-cyan-300 border border-cyan-500/30 whitespace-nowrap shadow-sm">
                          {afterVenuesCount} abertos
                        </span>
                      </div>
                      <div className="w-full flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-cyan-600 to-fuchsia-600 px-3 py-1.5 text-xs font-bold text-white shadow-md group-hover:from-cyan-500 group-hover:to-fuchsia-500 transition-all">
                        <span>Abrir</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
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
                  onClick={handleGoBack}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-fuchsia-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-cyan-600/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
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
              <button
                type="button"
                onClick={() => setIsNeighborhoodModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
                title="Clique para mudar o ponto de partida ou puxar GPS"
              >
                <MapPin className={`h-3.5 w-3.5 ${isGpsActive ? "text-emerald-400" : "text-cyan-400"}`} />
                <span>Distâncias calculadas de:</span>
                <span className={`font-bold ${isGpsActive ? "text-emerald-300" : "text-cyan-300"} underline decoration-dotted underline-offset-2`}>{userLocation.name}</span>
                <span className="text-[10px] text-slate-500 ml-1">✏️</span>
              </button>
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
              onOpenDetails={handleOpenVenueModal}
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
                maxDistanceKm={maxDistanceKm}
                onSelectMaxDistanceKm={setMaxDistanceKm}
                selectedNeighborhood={selectedNeighborhood}
                onSelectNeighborhood={setSelectedNeighborhood}
                onUseCurrentGps={() => syncWithGps(false)}
                isGpsActive={isGpsActive}
                userLocationName={userLocation.name}
                onOpenNeighborhoodModal={() => setIsNeighborhoodModalOpen(true)}
                entryPriceFilter={entryPriceFilter}
                onSelectPriceFilter={setEntryPriceFilter}
                onlyOpenToday={onlyOpenToday}
                onToggleOpenToday={() => setOnlyOpenToday(!onlyOpenToday)}
                onlyAfterHours={onlyAfterHours || currentScreen === "after"}
                onToggleAfterHours={() => setOnlyAfterHours(!onlyAfterHours)}
                onlyWithParking={onlyWithParking}
                onToggleWithParking={() => setOnlyWithParking(!onlyWithParking)}
                onlyWithHydro={onlyWithHydro}
                onToggleWithHydro={() => setOnlyWithHydro(!onlyWithHydro)}
                onlyWithPool={onlyWithPool}
                onToggleWithPool={() => setOnlyWithPool(!onlyWithPool)}
                onResetFilters={handleResetFilters}
                hasActiveFilters={hasActiveFilters}
              />

          {/* Modo After Active Banner */}
          {(onlyAfterHours || currentScreen === "after") && (
            <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/50 via-[#0a1220]/90 to-fuchsia-950/40 p-4 backdrop-blur-md shadow-[0_0_30px_rgba(0,240,255,0.25)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 text-2xl border border-cyan-500/40 shadow-inner">
                    🌙
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                      <span>Modo After Ativo (Até as 5h+ da manhã / 24 Horas)</span>
                      <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-black text-cyan-200 border border-cyan-400/30">
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
                    onClick={handleGoBack}
                    className="self-end sm:self-center shrink-0 rounded-xl border border-cyan-500/30 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-cyan-200 hover:bg-white/20 transition-all active:scale-95"
                  >
                    Voltar ao Início
                  </button>
                ) : (
                  <button
                    onClick={() => setOnlyAfterHours(false)}
                    className="self-end sm:self-center shrink-0 rounded-xl border border-cyan-500/30 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-cyan-200 hover:bg-white/20 transition-all active:scale-95"
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 rounded-2xl border border-cyan-500/30 bg-cyan-950/40 px-4 py-2.5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-base animate-pulse">🌙</span>
                  <span className="text-slate-200 font-medium">
                    Passou das 2h da madrugada em SP! Procurando onde esticar a noite agora?
                  </span>
                </div>
                <button
                  onClick={() => handleNavigate("after")}
                  className="rounded-xl border border-cyan-400/50 bg-cyan-500/20 px-3.5 py-1 text-xs font-black text-cyan-300 hover:bg-cyan-500/30 transition-all shrink-0 active:scale-95"
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
                <span className="font-bold text-cyan-300">{userLocation.name}</span>
              </div>

              {(searchQuery ||
                selectedGenre !== "all" ||
                selectedCuisine !== "all" ||
                selectedNeighborhood !== "all" ||
                onlyOpenToday ||
                onlyVipOrFree ||
                onlyWithParking ||
                onlyAfterHours ||
                onlyTrending ||
                onlySnookerHookah) && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 font-bold text-cyan-400 hover:text-cyan-300"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Limpar filtros</span>
                </button>
              )}
            </div>

            {/* ✨ Personalize o Seu Rolê (Matchmaker Direct Banner - Oculto na aba Motéis) */}
            {!searchQuery && currentScreen !== "moteis" && activeTab !== "moteis" && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => handleNavigate("custom-role")}
                  className="group relative w-full overflow-hidden rounded-3xl border-2 border-fuchsia-500/50 bg-gradient-to-r from-fuchsia-950/80 via-[#120a22] to-cyan-950/80 p-4 sm:p-5 text-left transition-all duration-300 hover:scale-[1.01] active:scale-95 hover:border-cyan-400 hover:shadow-[0_12px_40px_rgba(255,0,127,0.35)] cursor-pointer shadow-xl"
                >
                  <div className="absolute top-0 right-0 -mr-10 -mt-10 h-36 w-36 rounded-full bg-gradient-to-br from-fuchsia-600/30 to-cyan-500/20 blur-2xl pointer-events-none" />

                  <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500/30 to-cyan-500/20 text-2xl sm:text-3xl border border-fuchsia-400/50 shadow-[0_0_20px_rgba(255,0,127,0.4)] group-hover:scale-105 group-hover:rotate-6 transition-transform">
                        ✨
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="rounded-full bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/30 px-2 py-0.5 text-[9px] font-extrabold text-cyan-300 border border-cyan-400/40 uppercase tracking-wider">
                            Filtro Exclusivo • 100% Match
                          </span>
                          <span className="rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-[9px] font-black text-fuchsia-300 border border-fuchsia-500/30">
                            PERSONALIZAR
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white mt-1 group-hover:text-cyan-300 transition-colors">
                          Personalize o Seu Rolê
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-300 max-w-xl leading-relaxed">
                          Combine suas preferências (ex: 🎱 Sinuca + 💨 Narguilé + 🎸 Ao Vivo + 🪩 Pista de Dança) e veja apenas quem tem tudo junto!
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 self-end sm:self-center flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-fuchsia-600/40 group-hover:from-fuchsia-500 group-hover:to-cyan-500 transition-all">
                      <span>Personalizar Agora</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </button>
              </div>
            )}

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
                    onOpenDetails={handleOpenVenueModal}
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
                  className="mt-5 rounded-xl bg-gradient-to-r from-cyan-600 to-fuchsia-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 transition-all hover:brightness-110"
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
        onClose={handleCloseModal}
        onOpenVipModal={(v) => {
          handleOpenVipModalWithHistory(v);
        }}
      />

      {/* VIP List Lead Capture Modal */}
      <VipListModal
        venue={vipModalVenue}
        isOpen={isVipModalOpen}
        onClose={handleCloseModal}
      />

      {/* Partner / Admin Register Venue Modal */}
      <RegisterVenueModal
        isOpen={isRegisterModalOpen}
        onClose={handleCloseModal}
        onVenueCreated={handleVenueCreated}
      />

      {/* Auth / Login / Signup Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("has_seen_login_prompt", "true");
          }
          handleCloseModal();
        }}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />

      {/* User Profile & Saved VIP Passes Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseModal}
        user={user}
        onLogout={() => {
          setUser(null);
          handleCloseModal();
        }}
        onOpenRegisterModal={handleOpenRegisterModal}
        onUserUpdated={(updated) => setUser(updated)}
      />

      {/* Logo Picker Modal */}
      <LogoPickerModal
        isOpen={isLogoPickerOpen}
        onClose={handleCloseModal}
        selectedLogo={currentLogo}
        onSelectLogo={(logo) => {
          setCurrentLogo(logo);
          if (typeof window !== "undefined") {
            localStorage.setItem("preferred_logo", logo);
          }
        }}
      />

      {/* Neighborhood & GPS Selector Modal (Mobile bottom sheet & Desktop dialog) */}
      <NeighborhoodModal
        isOpen={isNeighborhoodModalOpen}
        onClose={() => setIsNeighborhoodModalOpen(false)}
        currentNeighborhood={userLocation}
        onSelectNeighborhood={handleSelectNeighborhood}
        onUseCurrentGps={() => syncWithGps(false)}
        isGpsLoading={isGpsLoading}
        isGpsActive={isGpsActive}
      />

      {/* Floating Mobile Bottom Navigation */}
      <MobileNav
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        favoritesCount={favorites.length}
        user={user}
        onOpenAuth={handleOpenAuthModal}
        onOpenProfile={handleOpenProfileModal}
      />

      {/* Footer */}
      <footer className="mt-20 border-t border-white/10 bg-[#05070d] py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-300">
            <img src={currentLogo} alt="Logo Radar do Rolê" className="h-6 w-6 rounded-lg object-cover border border-cyan-500/30" />
            <span>Radar do Rolê</span>
            <span className="text-cyan-400">•</span>
            <span>São Paulo</span>
          </div>
          <p className="mt-2">
            O radar oficial da vida noturna em São Paulo com lista VIP, modo after e estimativa de corrida.
          </p>

          <div className="mt-3 flex items-center justify-center gap-4 text-xs font-medium">
            <a
              href="/parceiro"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-purple-300 transition-colors"
              title="Acesso exclusivo para parceiros"
            >
              <span>🏢</span>
              <span>Portal do Parceiro</span>
            </a>
            <span className="text-slate-700">•</span>
            <button
              onClick={handleOpenRegisterModal}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span>✨</span>
              <span>Cadastrar meu local</span>
            </button>
            <span className="text-slate-700">•</span>
            <a
              href="/admin"
              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
              title="Acesso exclusivo para administradores"
            >
              <span>👑</span>
              <span>Acesso Master</span>
            </a>
          </div>

          {/* Legal Navigation Links */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={() => setIsAgeGateForceOpen(true)}
              className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-2.5 py-0.5 text-[11px] font-black transition-colors cursor-pointer"
              title="Abrir tela de verificação de maioridade (+18 ECA)"
            >
              <span>🔞</span>
              <span>Verificação +18 (ECA)</span>
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={() => {
                setLegalModalTab("termos");
                setIsLegalModalOpen(true);
              }}
              className="hover:text-purple-300 transition-colors underline cursor-pointer"
            >
              Termos de Uso & Isenção
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={() => {
                setLegalModalTab("privacidade");
                setIsLegalModalOpen(true);
              }}
              className="hover:text-cyan-300 transition-colors underline cursor-pointer"
            >
              Política de Privacidade (LGPD)
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={() => {
                setLegalModalTab("listavip");
                setIsLegalModalOpen(true);
              }}
              className="hover:text-rose-300 transition-colors underline cursor-pointer"
            >
              Regras de Lista VIP (CDC)
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={() => {
                setLegalModalTab("parceiros");
                setIsLegalModalOpen(true);
              }}
              className="hover:text-emerald-300 transition-colors underline cursor-pointer"
            >
              Contrato de Parceiros (SaaS)
            </button>
            <span className="text-slate-700">•</span>
            <a
              href="mailto:juridico@radardorole.com.br"
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              Canal Jurídico & DMCA
            </a>
          </div>

          {/* Statutory Disclaimers */}
          <div className="mt-4 space-y-1.5 text-[10px] text-slate-500 max-w-3xl mx-auto leading-relaxed border-t border-white/5 pt-3">
            <p>
              🔞 <strong>Conteúdo para Maiores de 18 Anos:</strong> Acesso a baladas e motéis restrito a maiores de 18 anos (Art. 243 da Lei nº 8.069/1990 - ECA). É obrigatória a apresentação de documento oficial físico com foto na portaria de todos os estabelecimentos.
            </p>
            <p>
              🚗 <strong>Estimativas de Transporte:</strong> Os valores de corrida indicados são meras estimativas aproximadas calculadas com base na distância média. A contratação, tarifas dinâmicas e o pagamento ocorrem exclusivamente nos aplicativos de mobilidade de sua escolha (como Uber ou 99). O Radar do Rolê não cobra nem intermedia corridas.
            </p>
            <p>
              ⚖️ <strong>Propriedade Intelectual & Marcas:</strong> Todas as marcas, logotipos e nomes comerciais citados pertencem aos seus respectivos titulares e são utilizados exclusivamente sob a égide do fair use para fins de identificação geográfica e informativa de lazer. Notificações de direitos autorais: <span className="font-mono text-slate-400">juridico@radardorole.com.br</span>.
            </p>
          </div>

          <p className="mt-4 text-[11px] text-slate-600">
            © {new Date().getFullYear()} Radar do Rolê • Onde a noite acontece em São Paulo. Feito com ❤️ e respeito à legislação.
          </p>
        </div>
      </footer>

      {/* Age Gate Modal (+18 Verification) */}
      <AgeGateModal
        forceOpen={isAgeGateForceOpen}
        onCloseManual={() => setIsAgeGateForceOpen(false)}
        onOpenTerms={() => {
          setIsAgeGateForceOpen(false);
          setLegalModalTab("termos");
          setIsLegalModalOpen(true);
        }}
      />

      {/* LGPD & Cookie Consent Banner */}
      <LgpdConsentBanner
        onOpenPrivacyPolicy={() => {
          setLegalModalTab("privacidade");
          setIsLegalModalOpen(true);
        }}
      />

      {/* Comprehensive Legal Terms Modal */}
      <LegalTermsModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
      />
    </div>
  );
}
