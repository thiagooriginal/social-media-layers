import React from "react";
import { Search, X, MapPin, Sparkles, SlidersHorizontal, Check } from "lucide-react";
import { GENRES, CUISINES, MOTEL_STYLES, NEIGHBORHOODS } from "../data/venues";
import { MainCategory } from "./CategoryTabs";

export type PriceFilterType =
  | "all"
  | "vip_free"
  | "low"
  | "open_bar"
  | "price_asc"
  | "price_desc"
  | "motel_under_120"
  | "motel_120_160"
  | "motel_above_160";

export interface FilterBarProps {
  category: MainCategory;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  // 1. Por Estilo Musical / Culinária / Suíte
  selectedGenre: string;
  onSelectGenre: (g: string) => void;
  selectedCuisine: string;
  onSelectCuisine: (c: string) => void;
  selectedMotelStyle: string;
  onSelectMotelStyle: (s: string) => void;
  // 2. Por Distância
  maxDistanceKm: number | null;
  onSelectMaxDistanceKm: (km: number | null) => void;
  selectedNeighborhood: string;
  onSelectNeighborhood: (n: string) => void;
  onUseCurrentGps?: () => void;
  isGpsActive?: boolean;
  userLocationName?: string;
  onOpenNeighborhoodModal?: () => void;
  // 3. Por Valores de Entrada & Benefícios
  entryPriceFilter: PriceFilterType;
  onSelectPriceFilter: (p: PriceFilterType) => void;
  onlyOpenToday: boolean;
  onToggleOpenToday: () => void;
  onlyAfterHours?: boolean;
  onToggleAfterHours?: () => void;
  onlyWithParking?: boolean;
  onToggleWithParking?: () => void;
  onlyWithHydro?: boolean;
  onToggleWithHydro?: () => void;
  onlyWithPool?: boolean;
  onToggleWithPool?: () => void;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function FilterBar({
  category,
  searchQuery,
  onSearchChange,
  selectedGenre,
  onSelectGenre,
  selectedCuisine,
  onSelectCuisine,
  selectedMotelStyle,
  onSelectMotelStyle,
  maxDistanceKm,
  onSelectMaxDistanceKm,
  selectedNeighborhood,
  onSelectNeighborhood,
  onUseCurrentGps,
  isGpsActive = false,
  userLocationName = "Vila Madalena",
  onOpenNeighborhoodModal,
  entryPriceFilter,
  onSelectPriceFilter,
  onlyOpenToday,
  onToggleOpenToday,
  onlyAfterHours = false,
  onToggleAfterHours,
  onlyWithParking = false,
  onToggleWithParking,
  onlyWithHydro,
  onToggleWithHydro,
  onlyWithPool,
  onToggleWithPool,
  onResetFilters,
  hasActiveFilters = false,
}: FilterBarProps) {
  const isBaladas = category === "baladas";
  const isMoteis = category === "moteis";
  const isRestaurantes = category === "restaurantes" || category === "kids";

  const getPlaceholder = () => {
    if (isBaladas) return "Buscar por balada, DJ, funk, pagode, sertanejo...";
    if (isMoteis) return "Buscar por motel, suíte, hidro, piscina, pernoite...";
    return "Buscar por restaurante, culinária, drinks, boteco...";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
      {/* 🔍 BARRA DE PESQUISA PRINCIPAL */}
      <div className="relative mb-3.5">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-4 w-4 text-cyan-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={getPlaceholder()}
          className="w-full rounded-2xl border border-white/15 bg-[#0e1422]/90 py-3.5 pl-11 pr-11 text-sm text-slate-100 placeholder-slate-400 backdrop-blur-md transition-all focus:border-cyan-400 focus:bg-[#141b2d] focus:outline-none focus:ring-2 focus:ring-cyan-500/25 shadow-lg"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 🎯 PAINEL ESTRUTURADO: AS 3 FORMAS DE BUSCA */}
      <div className="filter-panel-container rounded-3xl border border-white/10 bg-gradient-to-b from-[#0e1424] to-[#080d19] p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-4">
        
        {/* CABEÇALHO DO PAINEL */}
        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-200">
              Filtrar por:
            </span>
          </div>

          {hasActiveFilters && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors underline cursor-pointer"
            >
              ✕ Limpar filtros
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 1. POR ESTILO MUSICAL (ou Culinária / Suíte)                              */}
        {/* ========================================================================= */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <span>{isBaladas ? "🎵" : isRestaurantes ? "🍽️" : "🏩"}</span>
              <span>
                {isBaladas
                  ? "1. Por Estilo Musical"
                  : isRestaurantes
                  ? "1. Por Culinária / Experiência"
                  : "1. Por Tipo de Suíte"}
              </span>
            </span>
            {selectedGenre !== "all" && isBaladas && (
              <button
                type="button"
                onClick={() => onSelectGenre("all")}
                className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Ver todos
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {/* Baladas: Gêneros Musicais */}
            {isBaladas &&
              GENRES.map((g) => {
                const active = selectedGenre === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => onSelectGenre(g.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                      active
                        ? "border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-[1.03]"
                        : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-white/20 hover:bg-[#121829]"
                    }`}
                  >
                    <span>{g.emoji}</span>
                    <span>{g.name}</span>
                    {active && <Check className="h-3 w-3 text-cyan-300 stroke-[3]" />}
                  </button>
                );
              })}

            {/* Restaurantes: Culinárias */}
            {isRestaurantes &&
              CUISINES.map((c) => {
                const active = selectedCuisine === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectCuisine(c.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                      active
                        ? "border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-[1.03]"
                        : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-white/20 hover:bg-[#121829]"
                    }`}
                  >
                    <span>{c.emoji}</span>
                    <span>{c.name}</span>
                    {active && <Check className="h-3 w-3 text-cyan-300 stroke-[3]" />}
                  </button>
                );
              })}

            {/* Motéis: Estilos */}
            {isMoteis &&
              MOTEL_STYLES.map((m) => {
                const active = selectedMotelStyle === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectMotelStyle(m.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                      active
                        ? "border-fuchsia-400 bg-fuchsia-500/25 text-fuchsia-200 shadow-[0_0_15px_rgba(255,0,127,0.4)] scale-[1.03]"
                        : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-white/20 hover:bg-[#121829]"
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.name}</span>
                    {active && <Check className="h-3 w-3 text-fuchsia-300 stroke-[3]" />}
                  </button>
                );
              })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. POR DISTÂNCIA & LOCALIZAÇÃO                                            */}
        {/* ========================================================================= */}
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <span>📍</span>
              <span>2. Por Distância</span>
            </span>
            {onOpenNeighborhoodModal ? (
              <button
                type="button"
                onClick={onOpenNeighborhoodModal}
                className="text-[10px] text-cyan-300 font-mono hover:text-cyan-200 hover:underline flex items-center gap-1 cursor-pointer bg-white/5 px-2 py-0.5 rounded-md border border-white/10"
                title="Clique para mudar o ponto de partida ou puxar GPS"
              >
                <span>Ref: {userLocationName}</span>
                <span className="text-[9px] text-slate-400">✏️</span>
              </button>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">
                Ref: {userLocationName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {/* GPS Ao Vivo */}
            {onUseCurrentGps && (
              <button
                type="button"
                onClick={onUseCurrentGps}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isGpsActive
                    ? "border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                    : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-cyan-500/40"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  {isGpsActive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  )}
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                </span>
                <span>{isGpsActive ? "GPS Ao Vivo" : "Usar GPS"}</span>
              </button>
            )}

            {/* Raio: Qualquer distância */}
            <button
              type="button"
              onClick={() => onSelectMaxDistanceKm(null)}
              className={`flex shrink-0 items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                maxDistanceKm === null
                  ? "border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.35)]"
                  : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-white/20"
              }`}
            >
              <span>Qualquer Raio</span>
            </button>

            {/* Raio: Até 5 km */}
            <button
              type="button"
              onClick={() => onSelectMaxDistanceKm(5)}
              className={`flex shrink-0 items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                maxDistanceKm === 5
                  ? "border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.35)]"
                  : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-white/20"
              }`}
            >
              <span>⚡ Até 5 km</span>
            </button>

            {/* Raio: Até 10 km */}
            <button
              type="button"
              onClick={() => onSelectMaxDistanceKm(10)}
              className={`flex shrink-0 items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                maxDistanceKm === 10
                  ? "border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.35)]"
                  : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-white/20"
              }`}
            >
              <span>🚗 Até 10 km</span>
            </button>

            {/* Raio: Até 20 km */}
            <button
              type="button"
              onClick={() => onSelectMaxDistanceKm(20)}
              className={`flex shrink-0 items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                maxDistanceKm === 20
                  ? "border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.35)]"
                  : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-white/20"
              }`}
            >
              <span>Até 20 km</span>
            </button>

            {/* Seletor de Bairro */}
            <div className="relative shrink-0">
              <select
                value={selectedNeighborhood}
                onChange={(e) => onSelectNeighborhood(e.target.value)}
                className={`appearance-none rounded-xl border px-3.5 py-1.5 pr-7 text-xs font-bold transition-all cursor-pointer ${
                  selectedNeighborhood !== "all"
                    ? "border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.35)]"
                    : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-white/20"
                }`}
              >
                <option value="all">📍 Todos os Bairros</option>
                {NEIGHBORHOODS.map((n) => (
                  <option key={n.name} value={n.name}>
                    {n.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 text-[10px]">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. POR VALORES DE ENTRADA & BENEFÍCIOS (OU VALORES DAS SUÍTES NO MOTEL)   */}
        {/* ========================================================================= */}
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-fuchsia-300 flex items-center gap-1.5">
              <span>💵</span>
              <span>{isMoteis ? "3. Por Valores das Suítes & Ordenação" : "3. Por Valores de Entrada"}</span>
            </span>
            {entryPriceFilter !== "all" && (
              <button
                type="button"
                onClick={() => onSelectPriceFilter("all")}
                className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Ver todos
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {/* Todos os valores */}
            <button
              type="button"
              onClick={() => onSelectPriceFilter("all")}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                entryPriceFilter === "all"
                  ? "border-fuchsia-400 bg-fuchsia-500/25 text-fuchsia-200 shadow-[0_0_12px_rgba(255,0,127,0.35)]"
                  : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-white/20"
              }`}
            >
              <span>{isMoteis ? "🏩 Todos os Valores" : "🎟️ Todos os Valores"}</span>
            </button>

            {/* SE FOR MOTEL: ORDENAÇÃO DECRESCENTE / CRESCENTE (MAIS BARATO / MAIS CARO) */}
            {isMoteis ? (
              <>
                {/* Mais Barato Primeiro (Crescente) */}
                <button
                  type="button"
                  onClick={() => onSelectPriceFilter(entryPriceFilter === "price_asc" ? "all" : "price_asc")}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    entryPriceFilter === "price_asc"
                      ? "border-emerald-400 bg-emerald-500/25 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-[1.03]"
                      : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-emerald-500/40 hover:text-white"
                  }`}
                  title="Ordenar pelo menor valor primeiro (Crescente)"
                >
                  <span>📉</span>
                  <span>Mais Barato (Crescente ⬆️)</span>
                  {entryPriceFilter === "price_asc" && (
                    <Check className="h-3 w-3 text-emerald-300 stroke-[3]" />
                  )}
                </button>

                {/* Mais Caro / Luxuoso Primeiro (Decrescente) */}
                <button
                  type="button"
                  onClick={() => onSelectPriceFilter(entryPriceFilter === "price_desc" ? "all" : "price_desc")}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    entryPriceFilter === "price_desc"
                      ? "border-fuchsia-400 bg-fuchsia-500/25 text-fuchsia-200 shadow-[0_0_15px_rgba(255,0,127,0.4)] scale-[1.03]"
                      : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-fuchsia-500/40 hover:text-white"
                  }`}
                  title="Ordenar pelas suítes mais luxuosas primeiro (Decrescente)"
                >
                  <span>💎</span>
                  <span>Mais Caro / Luxo (Decrescente ⬇️)</span>
                  {entryPriceFilter === "price_desc" && (
                    <Check className="h-3 w-3 text-fuchsia-300 stroke-[3]" />
                  )}
                </button>

                {/* Faixa Econômica (Até R$ 120) */}
                <button
                  type="button"
                  onClick={() => onSelectPriceFilter(entryPriceFilter === "motel_under_120" ? "all" : "motel_under_120")}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    entryPriceFilter === "motel_under_120"
                      ? "border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-[1.02]"
                      : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-cyan-500/40 hover:text-white"
                  }`}
                >
                  <span>🏷️</span>
                  <span>Até R$ 120</span>
                  {entryPriceFilter === "motel_under_120" && (
                    <Check className="h-3 w-3 text-cyan-300 stroke-[3]" />
                  )}
                </button>

                {/* Faixa Intermediária (R$ 120 a R$ 160) */}
                <button
                  type="button"
                  onClick={() => onSelectPriceFilter(entryPriceFilter === "motel_120_160" ? "all" : "motel_120_160")}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    entryPriceFilter === "motel_120_160"
                      ? "border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-[1.02]"
                      : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-cyan-500/40 hover:text-white"
                  }`}
                >
                  <span>✨</span>
                  <span>R$ 120 a R$ 160</span>
                  {entryPriceFilter === "motel_120_160" && (
                    <Check className="h-3 w-3 text-cyan-300 stroke-[3]" />
                  )}
                </button>

                {/* Faixa Premium (Acima de R$ 160) */}
                <button
                  type="button"
                  onClick={() => onSelectPriceFilter(entryPriceFilter === "motel_above_160" ? "all" : "motel_above_160")}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    entryPriceFilter === "motel_above_160"
                      ? "border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-[1.02]"
                      : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-cyan-500/40 hover:text-white"
                  }`}
                >
                  <span>👑</span>
                  <span>Acima de R$ 160</span>
                  {entryPriceFilter === "motel_above_160" && (
                    <Check className="h-3 w-3 text-cyan-300 stroke-[3]" />
                  )}
                </button>
              </>
            ) : (
              <>
                {/* VIP / Entrada Free (Baladas / Bares) */}
                <button
                  type="button"
                  onClick={() => onSelectPriceFilter("vip_free")}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    entryPriceFilter === "vip_free"
                      ? "border-fuchsia-400 bg-fuchsia-500/25 text-fuchsia-200 shadow-[0_0_15px_rgba(255,0,127,0.4)] scale-[1.02]"
                      : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-fuchsia-500/40 hover:text-white"
                  }`}
                >
                  <span>💃</span>
                  <span>Lista VIP / Entrada Free</span>
                  {entryPriceFilter === "vip_free" && (
                    <Check className="h-3 w-3 text-fuchsia-300 stroke-[3]" />
                  )}
                </button>

                {/* Econômico (Até R$ 40) */}
                <button
                  type="button"
                  onClick={() => onSelectPriceFilter("low")}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    entryPriceFilter === "low"
                      ? "border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-[1.02]"
                      : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-cyan-500/40 hover:text-white"
                  }`}
                >
                  <span>🏷️</span>
                  <span>Econômico (Até R$ 40)</span>
                  {entryPriceFilter === "low" && (
                    <Check className="h-3 w-3 text-cyan-300 stroke-[3]" />
                  )}
                </button>

                {/* Open Bar */}
                {isBaladas && (
                  <button
                    type="button"
                    onClick={() => onSelectPriceFilter("open_bar")}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      entryPriceFilter === "open_bar"
                        ? "border-fuchsia-400 bg-fuchsia-500/25 text-fuchsia-200 shadow-[0_0_15px_rgba(255,0,127,0.4)] scale-[1.02]"
                        : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-fuchsia-500/40 hover:text-white"
                    }`}
                  >
                    <span>🍹</span>
                    <span>Open Bar</span>
                    {entryPriceFilter === "open_bar" && (
                      <Check className="h-3 w-3 text-fuchsia-300 stroke-[3]" />
                    )}
                  </button>
                )}
              </>
            )}

            {/* Modo After (5h+ / Madrugada) */}
            {onToggleAfterHours && (
              <button
                type="button"
                onClick={onToggleAfterHours}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  onlyAfterHours
                    ? "border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                    : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-cyan-500/40"
                }`}
              >
                <span>🌙</span>
                <span>After (5h+)</span>
              </button>
            )}

            {/* Aberto Hoje */}
            <button
              type="button"
              onClick={onToggleOpenToday}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                onlyOpenToday
                  ? "border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.35)]"
                  : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-white/20"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Aberto Hoje</span>
            </button>

            {/* Estacionamento */}
            {onToggleWithParking && (
              <button
                type="button"
                onClick={onToggleWithParking}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  onlyWithParking
                    ? "border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.35)]"
                    : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-white/20"
                }`}
              >
                <span>🚗</span>
                <span>Estacionamento</span>
              </button>
            )}

            {/* Motéis: Hidro */}
            {isMoteis && onToggleWithHydro && (
              <button
                type="button"
                onClick={onToggleWithHydro}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  onlyWithHydro
                    ? "border-fuchsia-400 bg-fuchsia-500/25 text-fuchsia-200 shadow-[0_0_12px_rgba(255,0,127,0.35)]"
                    : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-white/20"
                }`}
              >
                <span>🛁</span>
                <span>Com Hidro</span>
              </button>
            )}

            {/* Motéis: Piscina */}
            {isMoteis && onToggleWithPool && (
              <button
                type="button"
                onClick={onToggleWithPool}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  onlyWithPool
                    ? "border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.35)]"
                    : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-white/20"
                }`}
              >
                <span>🏊</span>
                <span>Com Piscina</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
