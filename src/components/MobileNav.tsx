import React from "react";
import { Sparkles, UtensilsCrossed, Baby, Heart, User, Flame } from "lucide-react";
import { MainCategory } from "./CategoryTabs";
import { UserProfile } from "../services/authService";

interface MobileNavProps {
  activeTab: MainCategory;
  onTabChange: (tab: MainCategory) => void;
  favoritesCount: number;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export function MobileNav({
  activeTab,
  onTabChange,
  favoritesCount,
  user,
  onOpenAuth,
  onOpenProfile,
}: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t border-white/10 bg-[#070a11]/95 px-1.5 py-1.5 backdrop-blur-xl">
      <div className="grid grid-cols-5 gap-1">
        {/* Baladas */}
        <button
          onClick={() => onTabChange("baladas")}
          className={`flex flex-col items-center justify-center rounded-xl py-1 text-[10px] font-bold transition-all ${
            activeTab === "baladas"
              ? "text-purple-400 bg-purple-500/15"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="text-base leading-none">🪩</span>
          <span className="mt-1">Baladas</span>
        </button>

        {/* Restaurantes */}
        <button
          onClick={() => onTabChange("restaurantes")}
          className={`flex flex-col items-center justify-center rounded-xl py-1 text-[10px] font-bold transition-all ${
            activeTab === "restaurantes"
              ? "text-emerald-400 bg-emerald-500/15"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="text-base leading-none">🍽️</span>
          <span className="mt-1 text-[9px] sm:text-[10px] truncate max-w-[65px]">Restaurantes</span>
        </button>

        {/* Motéis & Suítes */}
        <button
          onClick={() => onTabChange("moteis")}
          className={`flex flex-col items-center justify-center rounded-xl py-1 text-[10px] font-bold transition-all ${
            activeTab === "moteis"
              ? "text-rose-400 bg-rose-500/15"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="text-base leading-none">🏩</span>
          <span className="mt-1">Motéis</span>
        </button>

        {/* Salvos */}
        <button
          onClick={() => onTabChange("favorites")}
          className={`relative flex flex-col items-center justify-center rounded-xl py-1 text-[10px] font-bold transition-all ${
            activeTab === "favorites"
              ? "text-pink-400 bg-pink-500/15"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <span className="text-base leading-none">❤️</span>
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-pink-500 px-0.5 text-[8px] font-extrabold text-white">
                {favoritesCount}
              </span>
            )}
          </div>
          <span className="mt-1">Salvos</span>
        </button>

        {/* User Account */}
        <button
          onClick={user ? onOpenProfile : onOpenAuth}
          className="flex flex-col items-center justify-center rounded-xl py-1 text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-all"
        >
          {user ? (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-[9px] font-black text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <span className="text-base leading-none">👤</span>
          )}
          <span className="mt-1">{user ? "Perfil" : "Entrar"}</span>
        </button>
      </div>
    </nav>
  );
}
