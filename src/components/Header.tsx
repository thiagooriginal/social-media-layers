import React from "react";
import { Sparkles, MapPin, Heart, Flame, Share2, Compass, User as UserIcon, BarChart3 } from "lucide-react";
import { NEIGHBORHOODS, NeighborhoodCoord } from "../data/venues";
import { UserProfile } from "../services/authService";

interface HeaderProps {
  currentNeighborhood: NeighborhoodCoord;
  onSelectNeighborhood: (n: NeighborhoodCoord) => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  isFavoritesActive: boolean;
  totalVenuesCount: number;
  onOpenRegisterModal: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenAnalytics?: () => void;
  currentLogo?: string;
  onOpenLogoPicker?: () => void;
}

export function Header({
  currentNeighborhood,
  onSelectNeighborhood,
  favoritesCount,
  onOpenFavorites,
  isFavoritesActive,
  totalVenuesCount,
  onOpenRegisterModal,
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenAnalytics,
  currentLogo = "/logo-soundwave.jpg",
  onOpenLogoPicker,
}: HeaderProps) {
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Qual o Rolê? - Encontre sua balada, restaurante ou motel ideal em SP",
        text: "Descubra as melhores baladas, restaurantes e motéis por perto com lista VIP e estimativa de Uber!",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070a11]/90 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3 w-full">
        {/* Brand / Logo */}
        <div
          onClick={onOpenLogoPicker}
          className="flex items-center gap-2 sm:gap-3 min-w-0 cursor-pointer group"
          title="Clique para ver a Identidade Visual Oficial!"
        >
          <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl overflow-hidden border border-purple-500/50 bg-[#060810] shadow-[0_0_22px_-2px_rgba(168,85,247,0.7)] group-hover:border-cyan-400 group-hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] group-hover:scale-105 transition-all">
            <img
              src={currentLogo}
              alt="Logo Qual o Rolê"
              className="h-full w-full object-cover"
            />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border border-[#070a11]"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center leading-none">
                <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(0,240,255,0.6)]">Qual o</span>
                <span className="ml-1 text-fuchsia-400 drop-shadow-[0_0_12px_rgba(255,0,127,0.7)]">Rolê?</span>
              </h1>
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-purple-300">
                SP LIVE
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate max-w-[170px] xs:max-w-[220px] sm:max-w-none">
              Baladas, Restaurantes & Motéis por perto
            </p>
          </div>
        </div>

        {/* Center / Location Picker */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:border-purple-500/50 hover:bg-white/10"
          >
            <MapPin className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
            <span>Partida:</span>
            <span className="text-purple-300 font-bold underline decoration-dotted underline-offset-4">
              {currentNeighborhood.name}
            </span>
          </button>

          {isPickerOpen && (
            <div className="absolute left-1/2 top-full mt-2 w-64 -translate-x-1/2 rounded-2xl border border-white/15 bg-[#0e1422] p-2 shadow-2xl backdrop-blur-2xl z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Selecione seu Bairro (para Uber & Distância)
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {NEIGHBORHOODS.map((n) => (
                  <button
                    key={n.name}
                    onClick={() => {
                      onSelectNeighborhood(n);
                      setIsPickerOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                      n.name === currentNeighborhood.name
                        ? "bg-purple-600 text-white font-bold"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{n.name}</span>
                    {n.name === currentNeighborhood.name && (
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Ativo</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick neighborhood button for mobile */}
          <button
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="flex md:hidden items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-slate-300"
          >
            <MapPin className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            <span className="truncate max-w-[70px] xs:max-w-[85px] text-[10px] xs:text-[11px] font-semibold text-purple-300">
              {currentNeighborhood.name}
            </span>
          </button>

          {/* Analytics / Insights Report Button */}
          {onOpenAnalytics && (
            <button
              onClick={onOpenAnalytics}
              title="Painel de Relatórios & Desempenho"
              className="flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 h-8 w-8 sm:h-auto sm:w-auto sm:px-2.5 sm:py-2 text-xs font-bold text-slate-300 hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white transition-all shadow-sm"
            >
              <BarChart3 className="h-3.5 w-3.5 text-purple-400" />
              <span className="hidden sm:inline">Relatórios</span>
            </button>
          )}

          {/* Register Venue / Anuncie Button */}
          <button
            onClick={onOpenRegisterModal}
            className="flex items-center gap-1 rounded-xl border border-purple-500/40 bg-purple-500/15 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold text-purple-200 transition-all hover:border-purple-400 hover:bg-purple-500/25 active:scale-95 shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)]"
          >
            <span className="text-purple-400 font-extrabold">+</span>
            <span className="hidden lg:inline">Cadastrar Local</span>
            <span className="lg:hidden text-[11px]">Anuncie</span>
          </button>

          {/* User Account / Profile - Hidden on mobile because it's already in MobileNav */}
          {user ? (
            <button
              onClick={onOpenProfile}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-500/10 px-2.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-[11px] font-black text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden xl:inline text-xs">{user.name.split(" ")[0]}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:border-purple-400/50 hover:bg-white/10 hover:text-white"
            >
              <UserIcon className="h-3.5 w-3.5 text-purple-400" />
              <span>Entrar</span>
            </button>
          )}

          {/* Share - Desktop only */}
          <button
            onClick={handleShare}
            title="Compartilhar app"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <Share2 className="h-4 w-4" />
          </button>

          {/* Favorites Button - Desktop only (mobile has bottom bar) */}
          <button
            onClick={onOpenFavorites}
            className={`relative hidden sm:flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isFavoritesActive
                ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)]"
                : "border border-white/10 bg-white/5 text-slate-200 hover:border-pink-500/40 hover:bg-pink-500/10"
            }`}
          >
            <Heart
              className={`h-4 w-4 ${
                favoritesCount > 0 ? "fill-pink-500 text-pink-500" : "text-slate-400"
              } ${isFavoritesActive ? "!text-white !fill-white" : ""}`}
            />
            <span>Salvos</span>
            {favoritesCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white shadow">
                {favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Location Dropdown overlay */}
      {isPickerOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0a0e1a] px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>Selecione onde você está para calcular a distância e Uber:</span>
            <button
              onClick={() => setIsPickerOpen(false)}
              className="text-xs font-bold text-purple-400"
            >
              Fechar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
            {NEIGHBORHOODS.map((n) => (
              <button
                key={n.name}
                onClick={() => {
                  onSelectNeighborhood(n);
                  setIsPickerOpen(false);
                }}
                className={`rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                  n.name === currentNeighborhood.name
                    ? "bg-purple-600 text-white font-bold"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {n.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
