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
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 sm:gap-3">
        {/* Baladas */}
        <button
          onClick={() => onTabChange("baladas")}
          className={`group relative flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all duration-300 sm:p-4 ${
            activeTab === "baladas"
              ? "border-purple-500/80 bg-gradient-to-br from-purple-950/80 via-purple-900/40 to-[#0e1422] shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]"
              : "border-white/10 bg-[#0c101c]/70 hover:border-purple-500/40 hover:bg-[#121829]"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-xl transition-transform group-hover:scale-110">
              🪩
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                activeTab === "baladas"
                  ? "bg-purple-500 text-white shadow"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {baladasCount} locais
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-100">
              <span>Baladas & Festas</span>
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
              Shows, pistas, pagode & VIP
            </p>
          </div>
        </button>

        {/* Restaurantes */}
        <button
          onClick={() => onTabChange("restaurantes")}
          className={`group relative flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all duration-300 sm:p-4 ${
            activeTab === "restaurantes"
              ? "border-emerald-500/80 bg-gradient-to-br from-emerald-950/80 via-teal-900/40 to-[#0e1422] shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]"
              : "border-white/10 bg-[#0c101c]/70 hover:border-emerald-500/40 hover:bg-[#121829]"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-xl transition-transform group-hover:scale-110">
              🍽️
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                activeTab === "restaurantes"
                  ? "bg-emerald-500 text-white shadow"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {restaurantesCount} opções
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-100">
              <span>Restaurantes</span>
              <UtensilsCrossed className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
              Japonesa, carnes, massas & pubs
            </p>
          </div>
        </button>

        {/* Motéis & Suítes */}
        <button
          onClick={() => onTabChange("moteis")}
          className={`group relative flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all duration-300 sm:p-4 ${
            activeTab === "moteis"
              ? "border-rose-500/80 bg-gradient-to-br from-rose-950/80 via-pink-900/40 to-[#0e1422] shadow-[0_0_30px_-5px_rgba(244,63,94,0.4)]"
              : "border-white/10 bg-[#0c101c]/70 hover:border-rose-500/40 hover:bg-[#121829]"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-xl transition-transform group-hover:scale-110">
              🏩
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                activeTab === "moteis"
                  ? "bg-rose-500 text-white shadow"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {moteisCount} motéis
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-100">
              <span>Motéis & Suítes</span>
              <Flame className="h-3.5 w-3.5 text-rose-400" />
            </div>
            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
              Hidro, piscina, design & pernoite
            </p>
          </div>
        </button>

        {/* Com Espaço Kids */}
        <button
          onClick={() => onTabChange("kids")}
          className={`group relative flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all duration-300 sm:p-4 ${
            activeTab === "kids"
              ? "border-amber-400/90 bg-gradient-to-br from-amber-950/80 via-yellow-900/40 to-[#0e1422] shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)]"
              : "border-amber-500/25 bg-amber-500/5 hover:border-amber-400/50 hover:bg-amber-500/10"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-xl transition-transform group-hover:scale-110">
              🧸
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                activeTab === "kids"
                  ? "bg-amber-400 text-black shadow"
                  : "bg-amber-500/20 text-amber-300"
              }`}
            >
              {kidsCount} com kids
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-100">
              <span>Espaço Kids</span>
              <span className="rounded bg-amber-400/20 px-1 py-0.2 text-[9px] font-bold text-amber-300 uppercase">
                Família
              </span>
            </div>
            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
              Brinquedão, monitores & lazer
            </p>
          </div>
        </button>

        {/* Favoritos */}
        <button
          onClick={() => onTabChange("favorites")}
          className={`group relative flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all duration-300 sm:p-4 ${
            activeTab === "favorites"
              ? "border-pink-500/80 bg-gradient-to-br from-pink-950/80 via-rose-900/40 to-[#0e1422] shadow-[0_0_30px_-5px_rgba(244,63,94,0.4)]"
              : "border-white/10 bg-[#0c101c]/70 hover:border-pink-500/40 hover:bg-[#121829]"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-xl transition-transform group-hover:scale-110">
              ❤️
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                activeTab === "favorites"
                  ? "bg-pink-500 text-white shadow"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {favoritesCount} salvos
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-100">
              <span>Meus Salvos</span>
              <Heart className="h-3.5 w-3.5 text-pink-400" />
            </div>
            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
              Acesso rápido aos favoritos
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
