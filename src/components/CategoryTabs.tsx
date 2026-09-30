import React from "react";
import { Sparkles, UtensilsCrossed, Baby, Heart, Flame } from "lucide-react";

export type MainCategory = "baladas" | "restaurantes" | "moteis" | "kids" | "favorites";

interface CategoryTabsProps {
  activeTab: MainCategory;
  onTabChange: (tab: MainCategory) => void;
  baladasCount: number;
  restaurantesCount: number;
  moteisCount: number;
  kidsCount: number;
  favoritesCount: number;
}

export function CategoryTabs({
  activeTab,
  onTabChange,
  baladasCount,
  restaurantesCount,
  moteisCount,
  kidsCount,
  favoritesCount,
}: CategoryTabsProps) {
  return (
    <div className="mx-auto max-w-7xl px-3 pt-4 sm:px-6 sm:pt-6 w-full max-w-full overflow-hidden">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 sm:gap-3">
        {/* Baladas */}
        <button
          onClick={() => onTabChange("baladas")}
          className={`group relative flex flex-col items-start rounded-2xl border p-3 text-left transition-all duration-300 sm:p-4 min-w-0 w-full ${
            activeTab === "baladas"
              ? "category-tab-active-baladas border-fuchsia-500/80 bg-gradient-to-br from-fuchsia-950/80 via-[#1a0a26]/70 to-[#0e1422] shadow-[0_0_30px_-5px_rgba(255,0,127,0.4)]"
              : "category-tab-inactive border-white/10 bg-[#0c101c]/70 hover:border-fuchsia-500/40 hover:bg-[#121829]"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-fuchsia-500/20 text-lg sm:text-xl transition-transform group-hover:scale-110">
              🪩
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold ${
                activeTab === "baladas"
                  ? "bg-fuchsia-500 text-white shadow"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {baladasCount} locais
            </span>
          </div>

          <div className="mt-2.5 sm:mt-3 min-w-0 w-full">
            <div className="flex items-center gap-1.5 font-bold text-slate-100 text-xs sm:text-sm truncate">
              <span>Baladas & Festas</span>
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-fuchsia-400 shrink-0" />
            </div>
            <p className="mt-0.5 line-clamp-1 text-[10px] sm:text-[11px] text-slate-400">
              Shows, pistas, pagode & VIP
            </p>
          </div>
        </button>

        {/* Restaurantes */}
        <button
          onClick={() => onTabChange("restaurantes")}
          className={`group relative flex flex-col items-start rounded-2xl border p-3 text-left transition-all duration-300 sm:p-4 min-w-0 w-full ${
            activeTab === "restaurantes"
              ? "category-tab-active-restaurantes border-cyan-500/80 bg-gradient-to-br from-cyan-950/80 via-[#0a1828]/70 to-[#0e1422] shadow-[0_0_30px_-5px_rgba(0,240,255,0.4)]"
              : "category-tab-inactive border-white/10 bg-[#0c101c]/70 hover:border-cyan-500/40 hover:bg-[#121829]"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-lg sm:text-xl transition-transform group-hover:scale-110">
              🍽️
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold ${
                activeTab === "restaurantes"
                  ? "bg-cyan-500 text-black font-extrabold shadow"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {restaurantesCount} opções
            </span>
          </div>

          <div className="mt-2.5 sm:mt-3 min-w-0 w-full">
            <div className="flex items-center gap-1.5 font-bold text-slate-100 text-xs sm:text-sm truncate">
              <span>Restaurantes</span>
              <UtensilsCrossed className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-cyan-400 shrink-0" />
            </div>
            <p className="mt-0.5 line-clamp-1 text-[10px] sm:text-[11px] text-slate-400">
              Japonesa, carnes & massas
            </p>
          </div>
        </button>

        {/* Motéis & Suítes */}
        <button
          onClick={() => onTabChange("moteis")}
          className={`group relative flex flex-col items-start rounded-2xl border p-3 text-left transition-all duration-300 sm:p-4 min-w-0 w-full ${
            activeTab === "moteis"
              ? "category-tab-active-moteis border-fuchsia-500/80 bg-gradient-to-br from-fuchsia-950/80 via-[#180a24]/70 to-[#0e1422] shadow-[0_0_30px_-5px_rgba(255,0,127,0.4)]"
              : "category-tab-inactive border-white/10 bg-[#0c101c]/70 hover:border-fuchsia-500/40 hover:bg-[#121829]"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-fuchsia-500/20 text-lg sm:text-xl transition-transform group-hover:scale-110">
              🏩
            </div>
            <div className="flex items-center gap-1">
              <span className="rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] px-1.5 py-0.5 font-black border border-rose-500/30">
                🔞 +18
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold ${
                  activeTab === "moteis"
                    ? "bg-fuchsia-500 text-white shadow"
                    : "bg-white/10 text-slate-400"
                }`}
              >
                {moteisCount} motéis
              </span>
            </div>
          </div>

          <div className="mt-2.5 sm:mt-3 min-w-0 w-full">
            <div className="flex items-center gap-1.5 font-bold text-slate-100 text-xs sm:text-sm truncate">
              <span>Motéis & Suítes</span>
              <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-fuchsia-400 shrink-0" />
            </div>
            <p className="mt-0.5 line-clamp-1 text-[10px] sm:text-[11px] text-slate-400">
              Hidro, piscina & pernoite
            </p>
          </div>
        </button>

        {/* Com Espaço Kids */}
        <button
          onClick={() => onTabChange("kids")}
          className={`group relative flex flex-col items-start rounded-2xl border p-3 text-left transition-all duration-300 sm:p-4 min-w-0 w-full ${
            activeTab === "kids"
              ? "category-tab-active-kids border-cyan-400/90 bg-gradient-to-br from-cyan-950/80 via-[#0a1824]/70 to-[#0e1422] shadow-[0_0_30px_-5px_rgba(0,240,255,0.4)]"
              : "category-tab-inactive border-cyan-500/25 bg-cyan-500/5 hover:border-cyan-400/50 hover:bg-cyan-500/10"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-lg sm:text-xl transition-transform group-hover:scale-110">
              🧸
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold ${
                activeTab === "kids"
                  ? "bg-cyan-400 text-black shadow"
                  : "bg-cyan-500/20 text-cyan-300"
              }`}
            >
              {kidsCount} com kids
            </span>
          </div>

          <div className="mt-2.5 sm:mt-3 min-w-0 w-full">
            <div className="flex items-center gap-1.5 font-bold text-slate-100 text-xs sm:text-sm truncate">
              <span>Espaço Kids</span>
              <span className="rounded bg-cyan-400/20 px-1 py-0.2 text-[9px] font-bold text-cyan-300 uppercase">
                Família
              </span>
            </div>
            <p className="mt-0.5 line-clamp-1 text-[10px] sm:text-[11px] text-slate-400">
              Brinquedão & monitores
            </p>
          </div>
        </button>

        {/* Favoritos */}
        <button
          onClick={() => onTabChange("favorites")}
          className={`group relative flex flex-col items-start rounded-2xl border p-3 text-left transition-all duration-300 sm:p-4 min-w-0 w-full col-span-2 sm:col-span-1 ${
            activeTab === "favorites"
              ? "category-tab-active-favorites border-fuchsia-500/80 bg-gradient-to-br from-fuchsia-950/80 via-[#180a24]/70 to-[#0e1422] shadow-[0_0_30px_-5px_rgba(255,0,127,0.4)]"
              : "category-tab-inactive border-white/10 bg-[#0c101c]/70 hover:border-fuchsia-500/40 hover:bg-[#121829]"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-fuchsia-500/20 text-lg sm:text-xl transition-transform group-hover:scale-110">
              ❤️
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold ${
                activeTab === "favorites"
                  ? "bg-fuchsia-500 text-white shadow"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {favoritesCount} salvos
            </span>
          </div>

          <div className="mt-2.5 sm:mt-3 min-w-0 w-full">
            <div className="flex items-center gap-1.5 font-bold text-slate-100 text-xs sm:text-sm truncate">
              <span>Meus Salvos</span>
              <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-fuchsia-400 shrink-0" />
            </div>
            <p className="mt-0.5 line-clamp-1 text-[10px] sm:text-[11px] text-slate-400">
              Acesso rápido aos favoritos
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
