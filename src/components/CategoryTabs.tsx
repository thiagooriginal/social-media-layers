import React from "react";
import { Sparkles, UtensilsCrossed, Beer, Wind, CircleDot, Flame, Heart } from "lucide-react";

export type MainCategory =
  | "baladas"
  | "bares"
  | "tabacarias"
  | "sinucas"
  | "restaurantes"
  | "moteis"
  | "kids"
  | "favorites";

interface CategoryTabsProps {
  activeTab: MainCategory;
  onTabChange: (tab: MainCategory) => void;
  baladasCount: number;
  baresCount?: number;
  tabacariasCount?: number;
  sinucasCount?: number;
  restaurantesCount: number;
  moteisCount: number;
  kidsCount: number;
  favoritesCount: number;
}

export function CategoryTabs({
  activeTab,
  onTabChange,
  baladasCount,
  baresCount = 0,
  tabacariasCount = 0,
  sinucasCount = 0,
  restaurantesCount,
  moteisCount,
  kidsCount,
  favoritesCount,
}: CategoryTabsProps) {
  return (
    <div className="mx-auto max-w-7xl px-3 pt-4 sm:px-6 sm:pt-6 w-full max-w-full overflow-hidden">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8 sm:gap-2.5">
        
        {/* 1. Baladas */}
        <button
          onClick={() => onTabChange("baladas")}
          className={`group relative flex flex-col items-start rounded-2xl border p-2.5 sm:p-3 text-left transition-all duration-300 min-w-0 w-full ${
            activeTab === "baladas"
              ? "category-tab-active-baladas border-fuchsia-500/80 bg-gradient-to-br from-fuchsia-950/80 via-[#1a0a26]/70 to-[#0e1422] shadow-[0_0_25px_-5px_rgba(255,0,127,0.4)]"
              : "category-tab-inactive border-white/10 bg-[#0c101c]/70 hover:border-fuchsia-500/40 hover:bg-[#121829]"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-fuchsia-500/20 text-base sm:text-lg transition-transform group-hover:scale-110">
              🪩
            </div>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold ${
                activeTab === "baladas"
                  ? "bg-fuchsia-500 text-white shadow"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {baladasCount}
            </span>
          </div>
          <div className="mt-2 min-w-0 w-full">
            <div className="flex items-center gap-1 font-bold text-slate-100 text-xs truncate">
              <span>Baladas</span>
              <Sparkles className="h-3 w-3 text-fuchsia-400 shrink-0" />
            </div>
            <p className="mt-0.5 line-clamp-1 text-[9px] sm:text-[10px] text-slate-400">
              Shows & clubs
            </p>
          </div>
        </button>

        {/* 2. Bares & Botecos */}
        <button
          onClick={() => onTabChange("bares")}
          className={`group relative flex flex-col items-start rounded-2xl border p-2.5 sm:p-3 text-left transition-all duration-300 min-w-0 w-full ${
            activeTab === "bares"
              ? "border-amber-400/80 bg-gradient-to-br from-amber-950/80 via-[#1e1308]/70 to-[#0e1422] shadow-[0_0_25px_-5px_rgba(245,158,11,0.4)]"
              : "border-white/10 bg-[#0c101c]/70 hover:border-amber-400/40 hover:bg-[#121829]"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-500/20 text-base sm:text-lg transition-transform group-hover:scale-110">
              🍻
            </div>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold ${
                activeTab === "bares"
                  ? "bg-amber-400 text-black font-extrabold shadow"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {baresCount}
            </span>
          </div>
          <div className="mt-2 min-w-0 w-full">
            <div className="flex items-center gap-1 font-bold text-slate-100 text-xs truncate">
              <span>Barzinhos</span>
              <Beer className="h-3 w-3 text-amber-400 shrink-0" />
            </div>
            <p className="mt-0.5 line-clamp-1 text-[9px] sm:text-[10px] text-slate-400">
              Botecos & pubs
            </p>
          </div>
        </button>

        {/* 3. Tabacarias & Lounge */}
        <button
          onClick={() => onTabChange("tabacarias")}
          className={`group relative flex flex-col items-start rounded-2xl border p-2.5 sm:p-3 text-left transition-all duration-300 min-w-0 w-full ${
            activeTab === "tabacarias"
              ? "border-purple-400/80 bg-gradient-to-br from-purple-950/80 via-[#180824]/70 to-[#0e1422] shadow-[0_0_25px_-5px_rgba(168,85,247,0.4)]"
              : "border-white/10 bg-[#0c101c]/70 hover:border-purple-400/40 hover:bg-[#121829]"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-purple-500/20 text-base sm:text-lg transition-transform group-hover:scale-110">
              💨
            </div>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold ${
                activeTab === "tabacarias"
                  ? "bg-purple-400 text-black font-extrabold shadow"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {tabacariasCount}
            </span>
          </div>
          <div className="mt-2 min-w-0 w-full">
            <div className="flex items-center gap-1 font-bold text-slate-100 text-xs truncate">
              <span>Tabacarias</span>
              <Wind className="h-3 w-3 text-purple-400 shrink-0" />
            </div>
            <p className="mt-0.5 line-clamp-1 text-[9px] sm:text-[10px] text-slate-400">
              Hookah & lounge
            </p>
          </div>
        </button>

        {/* 4. Casas de Sinuca */}
        <button
          onClick={() => onTabChange("sinucas")}
          className={`group relative flex flex-col items-start rounded-2xl border p-2.5 sm:p-3 text-left transition-all duration-300 min-w-0 w-full ${
            activeTab === "sinucas"
              ? "border-emerald-400/80 bg-gradient-to-br from-emerald-950/80 via-[#061e12]/70 to-[#0e1422] shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)]"
              : "border-white/10 bg-[#0c101c]/70 hover:border-emerald-400/40 hover:bg-[#121829]"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-base sm:text-lg transition-transform group-hover:scale-110">
              🎱
            </div>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold ${
                activeTab === "sinucas"
                  ? "bg-emerald-400 text-black font-extrabold shadow"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {sinucasCount}
            </span>
          </div>
          <div className="mt-2 min-w-0 w-full">
            <div className="flex items-center gap-1 font-bold text-slate-100 text-xs truncate">
              <span>Sinucas</span>
              <CircleDot className="h-3 w-3 text-emerald-400 shrink-0" />
            </div>
            <p className="mt-0.5 line-clamp-1 text-[9px] sm:text-[10px] text-slate-400">
              Snooker & bilhar
            </p>
          </div>
        </button>

        {/* 5. Restaurantes */}
        <button
          onClick={() => onTabChange("restaurantes")}
          className={`group relative flex flex-col items-start rounded-2xl border p-2.5 sm:p-3 text-left transition-all duration-300 min-w-0 w-full ${
            activeTab === "restaurantes"
              ? "category-tab-active-restaurantes border-cyan-500/80 bg-gradient-to-br from-cyan-950/80 via-[#0a1828]/70 to-[#0e1422] shadow-[0_0_25px_-5px_rgba(0,240,255,0.4)]"
              : "category-tab-inactive border-white/10 bg-[#0c101c]/70 hover:border-cyan-500/40 hover:bg-[#121829]"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-base sm:text-lg transition-transform group-hover:scale-110">
              🍽️
            </div>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold ${
                activeTab === "restaurantes"
                  ? "bg-cyan-500 text-black font-extrabold shadow"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {restaurantesCount}
            </span>
          </div>
          <div className="mt-2 min-w-0 w-full">
            <div className="flex items-center gap-1 font-bold text-slate-100 text-xs truncate">
              <span>Restaurantes</span>
              <UtensilsCrossed className="h-3 w-3 text-cyan-400 shrink-0" />
            </div>
            <p className="mt-0.5 line-clamp-1 text-[9px] sm:text-[10px] text-slate-400">
              Gastronomia
            </p>
          </div>
        </button>

        {/* 6. Motéis & Drive-ins */}
        <button
          onClick={() => onTabChange("moteis")}
          className={`group relative flex flex-col items-start rounded-2xl border p-2.5 sm:p-3 text-left transition-all duration-300 min-w-0 w-full ${
            activeTab === "moteis"
              ? "category-tab-active-moteis border-fuchsia-500/80 bg-gradient-to-br from-fuchsia-950/80 via-[#180a24]/70 to-[#0e1422] shadow-[0_0_25px_-5px_rgba(255,0,127,0.4)]"
              : "category-tab-inactive border-white/10 bg-[#0c101c]/70 hover:border-fuchsia-500/40 hover:bg-[#121829]"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-fuchsia-500/20 text-base sm:text-lg transition-transform group-hover:scale-110">
              🏩
            </div>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold ${
                activeTab === "moteis"
                  ? "bg-fuchsia-500 text-white shadow"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {moteisCount}
            </span>
          </div>
          <div className="mt-2 min-w-0 w-full">
            <div className="flex items-center gap-1 font-bold text-slate-100 text-xs truncate">
              <span>Motéis & Drive</span>
              <Flame className="h-3 w-3 text-fuchsia-400 shrink-0" />
            </div>
            <p className="mt-0.5 line-clamp-1 text-[9px] sm:text-[10px] text-slate-400">
              Suítes & 24h
            </p>
          </div>
        </button>

        {/* 7. Com Espaço Kids */}
        <button
          onClick={() => onTabChange("kids")}
          className={`group relative flex flex-col items-start rounded-2xl border p-2.5 sm:p-3 text-left transition-all duration-300 min-w-0 w-full ${
            activeTab === "kids"
              ? "category-tab-active-kids border-cyan-400/90 bg-gradient-to-br from-cyan-950/80 via-[#0a1824]/70 to-[#0e1422] shadow-[0_0_25px_-5px_rgba(0,240,255,0.4)]"
              : "category-tab-inactive border-cyan-500/25 bg-cyan-500/5 hover:border-cyan-400/50 hover:bg-cyan-500/10"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-base sm:text-lg transition-transform group-hover:scale-110">
              🧸
            </div>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold ${
                activeTab === "kids"
                  ? "bg-cyan-400 text-black shadow"
                  : "bg-cyan-500/20 text-cyan-300"
              }`}
            >
              {kidsCount}
            </span>
          </div>
          <div className="mt-2 min-w-0 w-full">
            <div className="flex items-center gap-1 font-bold text-slate-100 text-xs truncate">
              <span>Espaço Kids</span>
            </div>
            <p className="mt-0.5 line-clamp-1 text-[9px] sm:text-[10px] text-slate-400">
              Família
            </p>
          </div>
        </button>

        {/* 8. Favoritos */}
        <button
          onClick={() => onTabChange("favorites")}
          className={`group relative flex flex-col items-start rounded-2xl border p-2.5 sm:p-3 text-left transition-all duration-300 min-w-0 w-full ${
            activeTab === "favorites"
              ? "category-tab-active-favorites border-fuchsia-500/80 bg-gradient-to-br from-fuchsia-950/80 via-[#180a24]/70 to-[#0e1422] shadow-[0_0_25px_-5px_rgba(255,0,127,0.4)]"
              : "category-tab-inactive border-white/10 bg-[#0c101c]/70 hover:border-fuchsia-500/40 hover:bg-[#121829]"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-fuchsia-500/20 text-base sm:text-lg transition-transform group-hover:scale-110">
              ❤️
            </div>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold ${
                activeTab === "favorites"
                  ? "bg-fuchsia-500 text-white shadow"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {favoritesCount}
            </span>
          </div>
          <div className="mt-2 min-w-0 w-full">
            <div className="flex items-center gap-1 font-bold text-slate-100 text-xs truncate">
              <span>Salvos</span>
              <Heart className="h-3 w-3 text-fuchsia-400 shrink-0" />
            </div>
            <p className="mt-0.5 line-clamp-1 text-[9px] sm:text-[10px] text-slate-400">
              Favoritos
            </p>
          </div>
        </button>

      </div>
    </div>
  );
}
