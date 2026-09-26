import React from "react";
import { Home, Flame, MapPin, Heart, User } from "lucide-react";
import { UserProfile } from "../../services/authService";

export type Projeto2Screen = "inicio" | "hoje" | "mapa" | "salvos" | "perfil";

interface MobileNavV2Props {
  currentScreen: Projeto2Screen;
  onNavigate: (screen: Projeto2Screen) => void;
  savedCount: number;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const MobileNavV2: React.FC<MobileNavV2Props> = ({
  currentScreen,
  onNavigate,
  savedCount,
  user,
  onOpenAuth,
  onOpenProfile,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t border-slate-800/90 bg-[#070a11]/95 px-3 py-2 backdrop-blur-2xl safe-area-pb">
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto items-center">
        {/* 1. Início */}
        <button
          type="button"
          onClick={() => onNavigate("inicio")}
          className={`flex flex-col items-center justify-center rounded-2xl py-1 text-[11px] font-bold transition-all ${
            currentScreen === "inicio"
              ? "text-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Home className="h-4 w-4" />
          <span className="mt-1">Início</span>
        </button>

        {/* 2. Hoje */}
        <button
          type="button"
          onClick={() => onNavigate("hoje")}
          className={`relative flex flex-col items-center justify-center rounded-2xl py-1 text-[11px] font-bold transition-all ${
            currentScreen === "hoje"
              ? "text-rose-400 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="relative">
            <Flame className="h-4 w-4" />
            <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </span>
          <span className="mt-1">Hoje</span>
        </button>

        {/* 3. Mapa */}
        <button
          type="button"
          onClick={() => onNavigate("mapa")}
          className={`flex flex-col items-center justify-center rounded-2xl py-1 text-[11px] font-bold transition-all ${
            currentScreen === "mapa"
              ? "text-emerald-400 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span className="mt-1">Mapa</span>
        </button>

        {/* 4. Salvos */}
        <button
          type="button"
          onClick={() => onNavigate("salvos")}
          className={`relative flex flex-col items-center justify-center rounded-2xl py-1 text-[11px] font-bold transition-all ${
            currentScreen === "salvos"
              ? "text-pink-400 bg-pink-950/40 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Heart className="h-4 w-4" />
          {savedCount > 0 && (
            <span className="absolute -top-0.5 right-2 rounded-full bg-pink-600 px-1 text-[9px] font-extrabold text-white">
              {savedCount}
            </span>
          )}
          <span className="mt-1">Salvos</span>
        </button>

        {/* 5. Perfil */}
        <button
          type="button"
          onClick={() => {
            if (user) {
              onOpenProfile();
            } else {
              onOpenAuth();
            }
          }}
          className={`flex flex-col items-center justify-center rounded-2xl py-1 text-[11px] font-bold transition-all ${
            currentScreen === "perfil"
              ? "text-purple-400 bg-purple-950/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <User className="h-4 w-4" />
          <span className="mt-1">{user ? "Perfil" : "Entrar"}</span>
        </button>
      </div>
    </nav>
  );
};
