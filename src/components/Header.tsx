import React from "react";
import { Sparkles, MapPin, Heart, Flame, Share2, Compass, User as UserIcon, BarChart3, Crosshair } from "lucide-react";
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
  onTriggerRadar?: () => void;
  onGoHome?: () => void;
  onOpenCustomRole?: () => void;
  isCustomRoleActive?: boolean;
  onUseCurrentGps?: () => void;
  isGpsLoading?: boolean;
  isGpsActive?: boolean;
  onOpenNeighborhoodModal?: () => void;
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
  currentLogo = "/logo-official.jpg",
  onOpenLogoPicker,
  onTriggerRadar,
  onGoHome,
  onOpenCustomRole,
  isCustomRoleActive,
  onUseCurrentGps,
  isGpsLoading,
  isGpsActive,
  onOpenNeighborhoodModal,
}: HeaderProps) {
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const [isSuperScanning, setIsSuperScanning] = React.useState(false);
  const [showScanToast, setShowScanToast] = React.useState(false);

  const handleLogoClick = () => {
    setIsSuperScanning(true);
    setShowScanToast(true);

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state !== "suspended") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.16);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.28);
        }
      }
    } catch (e) {}

    setTimeout(() => {
      setIsSuperScanning(false);
    }, 2400);

    setTimeout(() => {
      setShowScanToast(false);
    }, 3200);

    if (onGoHome) {
      onGoHome();
    } else {
      onTriggerRadar?.();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Radar do Rolê - O radar da vida noturna em SP",
        text: "Descubra as melhores baladas, bares e afters por perto com o Radar do Rolê!",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070a11]/90 backdrop-blur-xl transition-all">
      <style>{`
        @keyframes headerRadarSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes headerSonarPulse {
          0% { transform: scale(0.9); opacity: 0.85; }
          100% { transform: scale(2.1); opacity: 0; }
        }
        .header-radar-sweep {
          animation: headerRadarSpin 2.2s linear infinite !important;
        }
        .header-radar-sweep-fast {
          animation: headerRadarSpin 1.1s linear infinite !important;
        }
        .header-sonar-wave-1 {
          animation: headerSonarPulse 2.4s cubic-bezier(0.1, 0.4, 0.6, 1) infinite !important;
        }
        .header-sonar-wave-2 {
          animation: headerSonarPulse 2.4s cubic-bezier(0.1, 0.4, 0.6, 1) 1.2s infinite !important;
        }
      `}</style>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3 w-full">
        {/* Brand / Logo */}
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-2 sm:gap-3 shrink-0 cursor-pointer group"
          title="Toque para disparar o Radar SP e ir para o Início!"
        >
          {/* Animated Radar Logo Box */}
          <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl overflow-hidden border-2 border-cyan-400 bg-black shadow-[0_0_20px_-2px_rgba(0,240,255,0.6)] group-hover:border-fuchsia-400 group-hover:shadow-[0_0_25px_rgba(255,0,127,0.7)] group-hover:scale-105 active:scale-95 transition-all">
            {/* Base Logo Image */}
            <img
              src={currentLogo}
              alt="Logo Radar do Rolê"
              className="h-full w-full object-cover"
            />

            {/* Continuous Rotating Radar Beam directly on top of the logo */}
            <div
              className={`absolute inset-0 ${isSuperScanning ? "header-radar-sweep-fast" : "header-radar-sweep"} pointer-events-none`}
              style={{
                background: "conic-gradient(from 0deg, #00F0FF 0deg, rgba(0, 240, 255, 0.55) 25deg, rgba(255, 0, 127, 0.35) 60deg, transparent 95deg, transparent 360deg)",
                mixBlendMode: "screen",
              }}
            >
              {/* Luminous leading laser needle from center to edge */}
              <div
                className="absolute top-1/2 left-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-[#00F0FF] shadow-[0_0_8px_#00F0FF]"
                style={{ transformOrigin: "0% 50%" }}
              />
            </div>

            {/* Glowing Sonar Wave Rings emanating from logo */}
            <div className="absolute inset-0 rounded-2xl border border-cyan-400 header-sonar-wave-1 pointer-events-none" />
            <div className="absolute inset-0 rounded-2xl border border-fuchsia-500 header-sonar-wave-2 pointer-events-none" />

            {/* Central Neon Beacon Dot */}
            <div className="absolute h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00F0FF] pointer-events-none" />

            {/* Live Green Online Beacon */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 sm:h-3 sm:w-3 z-10">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-full w-full rounded-full bg-emerald-500 border border-[#070a11]"></span>
            </span>
          </div>

          <div className="shrink-0">
            <h1 className="text-base sm:text-2xl font-black tracking-tight flex items-center leading-none whitespace-nowrap">
              <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(0,240,255,0.6)]">Radar do</span>
              <span className="ml-1 sm:ml-1.5 text-fuchsia-400 drop-shadow-[0_0_12px_rgba(255,0,127,0.7)]">Rolê</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
              <span className="hidden xs:inline text-[10px] sm:text-[11px] font-medium text-slate-400">
                São Paulo
              </span>
              <span className="hidden xs:inline text-slate-600">•</span>
              <span className={`inline-flex items-center gap-1 rounded ${isSuperScanning ? "bg-fuchsia-500/25 border-fuchsia-400 text-fuchsia-300 shadow-[0_0_12px_rgba(255,0,127,0.6)]" : "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"} border px-1.5 py-0.2 text-[9px] font-black transition-all`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isSuperScanning ? "bg-fuchsia-400 animate-ping" : "bg-cyan-400 animate-pulse"}`}></span>
                <span>{isSuperScanning ? "SUPER SCAN" : "SCAN AO VIVO"}</span>
              </span>
              <span
                className="inline-flex items-center gap-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 px-1.5 py-0.2 text-[9px] font-black shadow-sm"
                title="Acesso e conteúdo estritamente para maiores de 18 anos (Art. 243 ECA)"
              >
                🔞 +18
              </span>
            </div>
          </div>
        </div>

        {/* Center / Location Picker (Desktop) */}
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => {
              if (onOpenNeighborhoodModal) {
                onOpenNeighborhoodModal();
              } else {
                setIsPickerOpen(!isPickerOpen);
              }
            }}
            className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              isGpsActive
                ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-200 hover:border-emerald-400 hover:bg-emerald-900/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "border-cyan-500/30 bg-white/5 text-slate-200 hover:border-cyan-500/50 hover:bg-white/10"
            }`}
            title="Clique para alterar seu bairro ou sintonizar seu GPS"
          >
            <MapPin className={`h-3.5 w-3.5 ${isGpsActive ? "text-emerald-400" : "text-cyan-400"} animate-pulse`} />
            <span className="text-slate-400">Partida:</span>
            <span className={`font-bold underline decoration-dotted underline-offset-4 ${isGpsActive ? "text-emerald-300" : "text-cyan-300"}`}>
              {currentNeighborhood.name}
            </span>
            {isGpsActive && (
              <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-black border border-emerald-500/40">
                GPS
              </span>
            )}
          </button>

          {!onOpenNeighborhoodModal && isPickerOpen && (
            <div className="absolute left-1/2 top-full mt-2 w-64 -translate-x-1/2 rounded-2xl border border-white/15 bg-[#0e1422] p-2 shadow-2xl backdrop-blur-2xl z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Selecione seu Bairro (para Uber & Distância)
              </div>

              {/* Direct GPS Button */}
              {onUseCurrentGps && (
                <div className="p-1 mb-1">
                  <button
                    onClick={() => {
                      onUseCurrentGps();
                      setIsPickerOpen(false);
                    }}
                    disabled={isGpsLoading}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl border p-2 text-xs font-black transition-all cursor-pointer ${
                      isGpsActive
                        ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        : "border-cyan-500/40 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 hover:border-cyan-300 hover:brightness-110 active:scale-95"
                    }`}
                  >
                    <Crosshair className={`h-4 w-4 ${isGpsLoading ? "animate-spin text-cyan-300" : isGpsActive ? "text-emerald-400" : "text-cyan-400"}`} />
                    <span>
                      {isGpsLoading
                        ? "Sintonizando GPS..."
                        : isGpsActive
                        ? "📍 GPS Ativo (Ao Vivo)"
                        : "📍 Usar Meu GPS Atual"}
                    </span>
                  </button>
                </div>
              )}

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
                        ? "bg-gradient-to-r from-cyan-600 to-fuchsia-600 text-white font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]"
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
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Quick neighborhood button for mobile */}
          <button
            type="button"
            onClick={() => {
              if (onOpenNeighborhoodModal) {
                onOpenNeighborhoodModal();
              } else {
                setIsPickerOpen(!isPickerOpen);
              }
            }}
            className={`flex md:hidden items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs transition-all shrink-0 cursor-pointer ${
              isGpsActive
                ? "border-emerald-500/50 bg-emerald-950/50 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                : "border-cyan-500/30 bg-cyan-950/40 text-cyan-200 hover:border-cyan-400"
            }`}
            title="Mudar Bairro ou Usar GPS"
          >
            <MapPin className={`h-3 w-3 ${isGpsActive ? "text-emerald-400" : "text-cyan-400"} shrink-0`} />
            <span className="truncate max-w-[76px] xs:max-w-[100px] text-[11px] font-bold text-slate-200">
              {currentNeighborhood.name}
            </span>
          </button>

          {/* Custom Role / Monte Seu Rolê Matchmaker Button (Desktop Only) */}
          {onOpenCustomRole && (
            <button
              onClick={onOpenCustomRole}
              title="Monte seu Rolê Perfeito (Filtre por Sinuca, Narguilé, Ao Vivo, Karaokê...)"
              className={`hidden md:flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-black transition-all shadow-sm active:scale-95 cursor-pointer ${
                isCustomRoleActive
                  ? "border-cyan-400 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(0,240,255,0.6)]"
                  : "border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:border-cyan-300 hover:bg-cyan-500/20 shadow-[0_0_12px_rgba(0,240,255,0.25)]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-300 shrink-0" />
              <span>Monte Seu Rolê</span>
            </button>
          )}

          {/* Analytics / Insights Report Button */}
          {onOpenAnalytics && (
            <button
              onClick={onOpenAnalytics}
              title="Painel de Relatórios & Desempenho"
              className="hidden sm:flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 sm:px-2.5 sm:py-2 text-xs font-bold text-slate-300 hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-white transition-all shadow-sm"
            >
              <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Relatórios</span>
            </button>
          )}

          {/* Portal de Parceiros (Exclusivo para estabelecimentos parceiros ou admin) */}
          {user && (user.role === "partner" || user.role === "admin") && (
            <a
              href="/parceiro"
              title="Portal de Estabelecimentos e Painel do Parceiro"
              className="flex items-center gap-1 rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/15 px-2 py-1.5 sm:px-3 sm:py-2 text-xs font-bold text-fuchsia-200 transition-all hover:border-fuchsia-400 hover:bg-fuchsia-500/25 active:scale-95 shadow-[0_0_15px_-3px_rgba(255,0,127,0.4)] shrink-0"
            >
              <span className="text-fuchsia-400 font-extrabold">+</span>
              <span className="hidden lg:inline">Painel Parceiro</span>
              <span className="lg:hidden text-[11px]">Parceiro</span>
            </a>
          )}

          {/* User Account / Profile */}
          {user ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-2 py-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold text-white transition-all hover:bg-cyan-500/20 shadow-[0_0_15px_rgba(0,240,255,0.3)] active:scale-95 shrink-0"
              title="Meu Perfil"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-fuchsia-500 text-[11px] font-black text-white shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-xs">{user.name.split(" ")[0]}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 sm:gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-slate-200 transition-all hover:border-cyan-400/50 hover:bg-white/10 hover:text-cyan-300 active:scale-95 shrink-0"
              title="Entrar na Conta"
            >
              <UserIcon className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span className="text-[11px] sm:text-xs">Entrar</span>
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
                ? "bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white shadow-[0_0_20px_rgba(255,0,127,0.5)]"
                : "border border-white/10 bg-white/5 text-slate-200 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/10"
            }`}
          >
            <Heart
              className={`h-4 w-4 ${
                favoritesCount > 0 ? "fill-fuchsia-500 text-fuchsia-500" : "text-slate-400"
              } ${isFavoritesActive ? "!text-white !fill-white" : ""}`}
            />
            <span>Salvos</span>
            {favoritesCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(255,0,127,0.6)]">
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
              className="text-xs font-bold text-cyan-400"
            >
              Fechar
            </button>
          </div>

          {/* Direct GPS Button on Mobile */}
          {onUseCurrentGps && (
            <button
              onClick={() => {
                onUseCurrentGps();
                setIsPickerOpen(false);
              }}
              disabled={isGpsLoading}
              className={`mb-3 flex w-full items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-black transition-all cursor-pointer ${
                isGpsActive
                  ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  : "border-cyan-500/40 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 hover:border-cyan-300 active:scale-95"
              }`}
            >
              <Crosshair className={`h-4 w-4 ${isGpsLoading ? "animate-spin text-cyan-300" : isGpsActive ? "text-emerald-400" : "text-cyan-400"}`} />
              <span>
                {isGpsLoading
                  ? "Sintonizando seu GPS..."
                  : isGpsActive
                  ? "📍 GPS Ativo (Sua Posição Real)"
                  : "📍 Usar Meu GPS Atual (Ao Vivo)"}
              </span>
            </button>
          )}

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
                    ? "bg-gradient-to-r from-cyan-600 to-fuchsia-600 text-white font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {n.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toast Feedback when user taps the Radar Logo */}
      {showScanToast && (
        <div className="mx-auto max-w-7xl px-3 sm:px-6 pb-2">
          <div className="flex items-center justify-between rounded-xl border border-cyan-400/50 bg-[#060c1c]/95 px-3.5 py-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-cyan-400 animate-spin">📡</span>
              <span className="font-black text-cyan-300">Radar Disparado:</span>
              <span className="text-slate-200">{totalVenuesCount} locais verificados ao vivo em São Paulo!</span>
            </div>
            <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
              100% ONLINE
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
