import { MainCategory, PriceFilterType } from "../components/FilterBar";
import { AppScreen } from "../routes/index";

export interface PersistedNavState {
  screen: AppScreen;
  activeTab: MainCategory;
  venueId: string | null;
  vipVenueId: string | null;
  selectedGenre: string;
  selectedCuisine: string;
  selectedMotelStyle: string;
  selectedNeighborhood: string;
  entryPriceFilter: PriceFilterType;
  maxDistanceKm: number | null;
  onlyOpenToday: boolean;
  onlyWithParking: boolean;
  onlyWithHydro: boolean;
  onlyWithPool: boolean;
  onlyAfterHours: boolean;
  onlySnookerHookah: boolean;
  searchQuery: string;
}

const STORAGE_KEY = "radar_nav_state";

// Limpa qualquer chave legada que bloqueava a entrada do radar
if (typeof window !== "undefined") {
  try {
    sessionStorage.removeItem("radar_session_entered");
    localStorage.removeItem("radar_session_entered");
  } catch (e) {}
}

/**
 * Lê o estado de navegação salvo em sessionStorage / localStorage
 */
export function loadPersistedNavState(): Partial<PersistedNavState> {
  if (typeof window === "undefined") return {};

  try {
    let stored: Partial<PersistedNavState> = {};
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (raw) {
      stored = JSON.parse(raw);
    }

    const resolvedScreen: AppScreen = stored.screen || "home";

    const resolvedTab: MainCategory =
      stored.activeTab ||
      (resolvedScreen && ["baladas", "restaurantes", "moteis", "favorites"].includes(resolvedScreen)
        ? (resolvedScreen as MainCategory)
        : "baladas");

    return {
      ...stored,
      screen: resolvedScreen,
      activeTab: resolvedTab,
      venueId: null,
      vipVenueId: null,
    };
  } catch (err) {
    console.warn("Falha ao recuperar estado de navegação persistente:", err);
    return {};
  }
}

/**
 * Salva o estado atual de navegação em sessionStorage e localStorage
 */
export function savePersistedNavState(state: Partial<PersistedNavState>) {
  if (typeof window === "undefined") return;

  try {
    // Mescla com estado existente
    const current = loadPersistedNavState();
    const merged: PersistedNavState = {
      screen: state.screen ?? current.screen ?? "home",
      activeTab: state.activeTab ?? current.activeTab ?? "baladas",
      venueId: state.venueId !== undefined ? state.venueId : null,
      vipVenueId: state.vipVenueId !== undefined ? state.vipVenueId : null,
      selectedGenre: state.selectedGenre ?? current.selectedGenre ?? "all",
      selectedCuisine: state.selectedCuisine ?? current.selectedCuisine ?? "all",
      selectedMotelStyle: state.selectedMotelStyle ?? current.selectedMotelStyle ?? "all",
      selectedNeighborhood: state.selectedNeighborhood ?? current.selectedNeighborhood ?? "all",
      entryPriceFilter: state.entryPriceFilter ?? current.entryPriceFilter ?? "all",
      maxDistanceKm: state.maxDistanceKm !== undefined ? state.maxDistanceKm : current.maxDistanceKm ?? null,
      onlyOpenToday: state.onlyOpenToday ?? current.onlyOpenToday ?? false,
      onlyWithParking: state.onlyWithParking ?? current.onlyWithParking ?? false,
      onlyWithHydro: state.onlyWithHydro ?? current.onlyWithHydro ?? false,
      onlyWithPool: state.onlyWithPool ?? current.onlyWithPool ?? false,
      onlyAfterHours: state.onlyAfterHours ?? current.onlyAfterHours ?? false,
      onlySnookerHookah: state.onlySnookerHookah ?? current.onlySnookerHookah ?? false,
      searchQuery: state.searchQuery ?? current.searchQuery ?? "",
    };

    const serialized = JSON.stringify(merged);
    sessionStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.warn("Erro ao salvar estado persistente de navegação:", err);
  }
}

/**
 * Registra guardiões de evento de visibilidade (quando aba troca/sai e volta)
 */
export function setupVisibilityPersistence(
  getCurrentState: () => Partial<PersistedNavState>,
  onRestore?: (saved: Partial<PersistedNavState>) => void
) {
  if (typeof window === "undefined") return () => {};

  const handleSave = () => {
    savePersistedNavState(getCurrentState());
  };

  const handleRestore = () => {
    if (onRestore) {
      const saved = loadPersistedNavState();
      onRestore(saved);
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      handleSave();
    } else if (document.visibilityState === "visible") {
      handleRestore();
    }
  };

  window.addEventListener("pagehide", handleSave);
  window.addEventListener("beforeunload", handleSave);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pageshow", handleRestore);
  window.addEventListener("focus", handleRestore);

  return () => {
    window.removeEventListener("pagehide", handleSave);
    window.removeEventListener("beforeunload", handleSave);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("pageshow", handleRestore);
    window.removeEventListener("focus", handleRestore);
  };
}
