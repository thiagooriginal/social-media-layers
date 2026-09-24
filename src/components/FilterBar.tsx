import React from "react";
import { Search, X, SlidersHorizontal, MapPin, Check } from "lucide-react";
import { GENRES, CUISINES, NEIGHBORHOODS } from "../data/venues";
import { MainCategory } from "./CategoryTabs";

interface FilterBarProps {
  category: MainCategory;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedGenre: string;
  onSelectGenre: (g: string) => void;
  selectedCuisine: string;
  onSelectCuisine: (c: string) => void;
  selectedNeighborhood: string;
  onSelectNeighborhood: (n: string) => void;
  onlyOpenToday: boolean;
  onToggleOpenToday: () => void;
  onlyVipOrFree: boolean;
  onToggleVipOrFree: () => void;
  onlyWithParking: boolean;
  onToggleWithParking: () => void;
}

export function FilterBar({
  category,
  searchQuery,
  onSearchChange,
  selectedGenre,
  onSelectGenre,
  selectedCuisine,
  onSelectCuisine,
  selectedNeighborhood,
  onSelectNeighborhood,
  onlyOpenToday,
  onToggleOpenToday,
  onlyVipOrFree,
  onToggleVipOrFree,
  onlyWithParking,
  onToggleWithParking,
}: FilterBarProps) {
  const isBaladas = category === "baladas";
  const isRestaurantes = category === "restaurantes" || category === "kids";

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
      {/* Search Input & Neighborhood selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              isBaladas
                ? "Buscar por nome, bairro, gênero (ex: pagode, Vila Madalena)..."
                : "Buscar por restaurante, culinária, espaço kids..."
            }
            className="w-full rounded-2xl border border-white/10 bg-[#0e1422]/90 py-3 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-400 backdrop-blur-md transition-all focus:border-purple-500/80 focus:bg-[#141b2d] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Neighborhood Filter Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedNeighborhood}
              onChange={(e) => onSelectNeighborhood(e.target.value)}
              className="w-full sm:w-48 appearance-none rounded-2xl border border-white/10 bg-[#0e1422] px-4 py-3 text-xs font-semibold text-slate-200 transition-colors focus:border-purple-500 focus:outline-none cursor-pointer"
            >
              <option value="all">📍 Todos os Bairros</option>
              {NEIGHBORHOODS.map((n) => (
                <option key={n.name} value={n.name}>
                  {n.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Sub-category / Genre Chips */}
      {category !== "favorites" && (
        <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {isBaladas &&
            GENRES.map((g) => {
              const active = selectedGenre === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => onSelectGenre(g.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                    active
                      ? g.activeClass
                      : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-white/20 hover:bg-[#121829]"
                  }`}
                >
                  <span>{g.emoji}</span>
                  <span>{g.name}</span>
                </button>
              );
            })}

          {isRestaurantes &&
            CUISINES.map((c) => {
              const active = selectedCuisine === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCuisine(c.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                    active
                      ? c.activeClass
                      : "border-white/10 bg-[#0c101c] text-slate-300 hover:border-white/20 hover:bg-[#121829]"
                  }`}
                >
                  <span>{c.emoji}</span>
                  <span>{c.name}</span>
                </button>
              );
            })}
        </div>
      )}

      {/* Secondary Quick Toggles */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        {/* Aberto Hoje */}
        <button
          onClick={onToggleOpenToday}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 transition-all ${
            onlyOpenToday
              ? "border-emerald-500 bg-emerald-500/15 text-emerald-300 font-bold"
              : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Aberto Hoje</span>
        </button>

        {/* Mulher VIP / Entrada Franca */}
        {isBaladas && (
          <button
            onClick={onToggleVipOrFree}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 transition-all ${
              onlyVipOrFree
                ? "border-pink-500 bg-pink-500/15 text-pink-300 font-bold"
                : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
            }`}
          >
            <span>💃</span>
            <span>Mulher VIP / Entrada Franca</span>
          </button>
        )}

        {/* Estacionamento */}
        <button
          onClick={onToggleWithParking}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 transition-all ${
            onlyWithParking
              ? "border-cyan-500 bg-cyan-500/15 text-cyan-300 font-bold"
              : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
          }`}
        >
          <span>🚗</span>
          <span>Estacionamento / Valet</span>
        </button>
      </div>
    </div>
  );
}
