import React from "react";
import { Home, Sparkles, UtensilsCrossed, Moon, Heart } from "lucide-react";
import { UserProfile } from "../services/authService";

export type AppScreen = "home" | "custom-role" | "baladas" | "restaurantes" | "moteis" | "after" | "favorites";

interface MobileNavProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  favoritesCount: number;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export function MobileNav({
  currentScreen,
  onNavigate,
  favoritesCount,
  user,
  onOpenAuth,
  onOpenProfile,
}: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t border-white/10 bg-[#070a11]/95 px-2 py-2 backdrop-blur-2xl">
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        {/* Início (Home) */}
        <button
          onClick={() => onNavigate("home")}
          className={`flex flex-col items-center justify-center rounded-2xl py-1 text-[10px] font-bold transition-all ${
            currentScreen === "home"
              ? "text-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Home className="h-4 w-4" />
          <span className="mt-1">Início</span>
        </button>

        {/* Baladas */}
        <button
          onClick={() => onNavigate("baladas")}
          className={`flex flex-col items-center justify-center rounded-2xl py-1 text-[10px] font-bold transition-all ${
            currentScreen === "baladas"
              ? "text-fuchsia-400 bg-fuchsia-950/40 shadow-[0_0_15px_rgba(217,70,239,0.3)]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="text-base leading-none">🪩</span>
          <span className="mt-1">Baladas</span>
        </button>

        {/* Bares / Drinks */}
        <button
          onClick={() => onNavigate("restaurantes")}
          className={`flex flex-col items-center justify-center rounded-2xl py-1 text-[10px] font-bold transition-all ${
            currentScreen === "restaurantes"
              ? "text-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="text-base leading-none">🍸</span>
          <span className="mt-1">Bares</span>
        </button>

        {/* Modo After */}
        <button
          onClick={() => onNavigate("after")}
          className={`flex flex-col items-center justify-center rounded-2xl py-1 text-[10px] font-bold transition-all ${
            currentScreen === "after"
              ? "text-fuchsia-400 bg-fuchsia-950/40 shadow-[0_0_15px_rgba(255,0,127,0.3)]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="text-base leading-none">🌙</span>
          <span className="mt-1">After 24h</span>
        </button>

        {/* Salvos / Favoritos */}
        <button
          onClick={() => onNavigate("favorites")}
          className={`relative flex flex-col items-center justify-center rounded-2xl py-1 text-[10px] font-bold transition-all ${
            currentScreen === "favorites"
              ? "text-fuchsia-400 bg-fuchsia-950/40 shadow-[0_0_15px_rgba(255,0,127,0.3)]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Heart className="h-4 w-4" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-fuchsia-500 px-0.5 text-[8px] font-extrabold text-white shadow-[0_0_8px_rgba(255,0,127,0.6)]">
                {favoritesCount}
              </span>
            )}
          </div>
          <span className="mt-1">Salvos</span>
        </button>
      </div>
    </nav>
  );
}
