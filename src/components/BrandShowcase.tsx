import React, { useState } from "react";
import { Sparkles, Smartphone, Layout, Eye, Layers, Copy, Check } from "lucide-react";

interface BrandShowcaseProps {
  currentLogo?: string;
  onOpenLogoPicker?: () => void;
}

export function BrandShowcase({
  currentLogo = "/logo-soundwave.jpg",
  onOpenLogoPicker,
}: BrandShowcaseProps) {
  const [activeView, setActiveView] = useState<"horizontal" | "badge" | "mobile">("horizontal");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const colors = [
    { name: "Ciano Neon", hex: "#00F0FF", tailwind: "text-cyan-400", bg: "bg-[#00F0FF]" },
    { name: "Magenta Neon", hex: "#FF007F", tailwind: "text-fuchsia-400", bg: "bg-[#FF007F]" },
    { name: "Violeta Elétrico", hex: "#A855F7", tailwind: "text-purple-500", bg: "bg-[#A855F7]" },
    { name: "Obsidian Black", hex: "#070A11", tailwind: "text-slate-400", bg: "bg-[#070A11]" },
  ];

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/40 via-[#0a0f1e]/90 to-[#070a11] p-5 sm:p-8 shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)]">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-fuchsia-500 p-0.5 shadow-lg shadow-purple-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#070a11]">
              <Sparkles className="h-5 w-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Identidade Oficial
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-500/30">
                VARIAÇÃO 2 ATIVA
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Radar do Rolê • Logo + Nome Integrados
            </h2>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-black/40 p-1 backdrop-blur-md">
          <button
            onClick={() => setActiveView("horizontal")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeView === "horizontal"
                ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/30 text-white border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layout className="h-3.5 w-3.5" />
            <span>Horizontal (Topo)</span>
          </button>

          <button
            onClick={() => setActiveView("badge")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeView === "badge"
                ? "bg-gradient-to-r from-purple-500/30 to-fuchsia-500/20 text-white border border-purple-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Badge de App</span>
          </button>

          <button
            onClick={() => setActiveView("mobile")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeView === "mobile"
                ? "bg-gradient-to-r from-fuchsia-500/30 to-pink-500/20 text-white border border-fuchsia-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Mockup Celular</span>
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="relative mt-6 min-h-[260px] sm:min-h-[300px] flex items-center justify-center rounded-2xl border border-white/10 bg-[#05070d]/80 p-6 backdrop-blur-xl">
        {/* VIEW 1: HORIZONTAL LOCKUP (NAVBAR / HEADER) */}
        {activeView === "horizontal" && (
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 w-full max-w-2xl py-4 animate-in fade-in zoom-in-95 duration-200">
            {/* The Logo Symbol */}
            <div className="relative group cursor-pointer" onClick={onOpenLogoPicker}>
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-3xl overflow-hidden border-2 border-purple-500/60 bg-black shadow-[0_0_35px_rgba(168,85,247,0.6)] group-hover:scale-105 group-hover:border-cyan-400 transition-all duration-300">
                <img
                  src={currentLogo}
                  alt="Variação 2 Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/30 to-fuchsia-500/30 blur-lg -z-10 group-hover:opacity-100 transition-opacity opacity-70" />
            </div>

            {/* The Typography and Tagline */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-[11px] font-bold text-purple-300 mb-2">
                <span>📍 SP LIVE</span>
                <span>•</span>
                <span>DESCOBERTA NOTURNA</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none">
                <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(0,240,255,0.7)]">
                  Qual o
                </span>{" "}
                <span className="text-fuchsia-400 drop-shadow-[0_0_18px_rgba(255,0,127,0.7)]">
                  Rolê?
                </span>
              </h1>

              <p className="mt-2 text-xs sm:text-sm font-semibold tracking-wide text-slate-300">
                Baladas • Restaurantes & Espaço Kids • Motéis
              </p>

              <div className="mt-3 flex items-center justify-center md:justify-start gap-2">
                <span className="text-[11px] font-bold text-slate-400">
                  Equalizador Musical + Pino GPS + Interrogação
                </span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: BADGE DE APP (SQUARE ICON / SPLASH) */}
        {activeView === "badge" && (
          <div className="flex flex-col items-center justify-center gap-4 py-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative group">
              <div className="relative h-44 w-44 sm:h-52 sm:w-52 rounded-[36px] overflow-hidden border-2 border-purple-500/50 bg-black shadow-[0_0_50px_rgba(168,85,247,0.7)] group-hover:scale-105 transition-all duration-300">
                <img
                  src={currentLogo}
                  alt="Variação 2 Completo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -inset-2 rounded-[40px] bg-gradient-to-r from-cyan-500/40 via-purple-600/40 to-fuchsia-500/40 blur-xl -z-10 animate-pulse" />
            </div>

            <div className="text-center mt-2">
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                Ícone Oficial de Aplicativo (iOS / Android / PWA)
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Visual com o nome "RADAR DO ROLÊ" gravado em neon diretamente na base do ícone.
              </p>
            </div>
          </div>
        )}

        {/* VIEW 3: MOCKUP CELULAR */}
        {activeView === "mobile" && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Screen 1: App Store / Home Screen */}
            <div className="relative w-48 rounded-[32px] border-4 border-slate-700 bg-[#090d16] p-4 shadow-2xl flex flex-col items-center">
              <div className="h-4 w-20 rounded-full bg-slate-800 mb-6" />
              <div className="relative h-16 w-16 rounded-2xl overflow-hidden border border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.7)]">
                <img src={currentLogo} alt="App Icon" className="h-full w-full object-cover" />
              </div>
              <p className="mt-2 text-[11px] font-black text-white tracking-tight">Radar do Rolê</p>
              <div className="mt-4 flex gap-1 text-[9px] text-amber-400">
                {"★★★★★"} <span className="text-slate-400">(4.9)</span>
              </div>
              <div className="mt-3 w-full rounded-xl bg-purple-600/80 py-1.5 text-center text-[10px] font-bold text-white">
                OBTER
              </div>
              <div className="h-1 w-16 rounded-full bg-slate-700 mt-6" />
            </div>

            {/* Screen 2: Splash Screen */}
            <div className="relative w-48 rounded-[32px] border-4 border-slate-700 bg-gradient-to-b from-[#070a11] via-[#0d1222] to-[#070a11] p-4 shadow-2xl flex flex-col items-center justify-between h-72">
              <div className="h-4 w-20 rounded-full bg-slate-800" />
              <div className="flex flex-col items-center text-center">
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.8)]">
                  <img src={currentLogo} alt="App Icon Splash" className="h-full w-full object-cover" />
                </div>
                <h3 className="mt-3 text-sm font-black">
                  <span className="text-cyan-400">Qual o</span>{" "}
                  <span className="text-fuchsia-400">Rolê?</span>
                </h3>
                <p className="text-[8px] text-slate-400">São Paulo Nightlife</p>
              </div>
              <div className="flex flex-col items-center gap-1 mb-2">
                <div className="h-1 w-16 rounded-full bg-purple-500/50 animate-pulse" />
                <div className="h-1 w-16 rounded-full bg-slate-700" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Palette & Controls Footer */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Paleta Oficial da Marca:</span>
          <div className="flex items-center gap-1.5">
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => handleCopyColor(c.hex)}
                className="group relative flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-bold text-slate-300 hover:border-white/30 transition-all"
                title={`Clique para copiar ${c.hex}`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${c.bg} shadow-[0_0_8px_currentColor]`} />
                <span>{c.hex}</span>
                {copiedColor === c.hex ? (
                  <Check className="h-2.5 w-2.5 text-emerald-400" />
                ) : (
                  <span className="opacity-40 group-hover:opacity-100">📋</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onOpenLogoPicker}
          className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/20 px-3.5 py-1.5 text-xs font-bold text-purple-200 hover:bg-purple-500/30 transition-all"
        >
          <span>🎨</span>
          <span>Ver todas as variações e estilos</span>
        </button>
      </div>
    </div>
  );
}
