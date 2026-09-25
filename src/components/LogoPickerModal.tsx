import React from "react";
import { X, Check, Sparkles } from "lucide-react";

interface LogoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLogo: string;
  onSelectLogo: (logoPath: string) => void;
}

export function LogoPickerModal({
  isOpen,
  onClose,
  selectedLogo,
  onSelectLogo,
}: LogoPickerModalProps) {
  if (!isOpen) return null;

  const options = [
    {
      id: "wave-bars",
      path: "/logo-wave-bars.jpg",
      title: "Estilo A: Equalizador Digital LED em Barras",
      desc: "Barras verticais digitais de LED contornando o ponto de interrogação com letreiro 'Qual o Rolê?'.",
      badge: "Tech & DJ",
    },
    {
      id: "wave-disc",
      path: "/logo-wave-disc.jpg",
      title: "Estilo B: Anel de Frequência DJ Circular",
      desc: "Ondas circulares e graves pulsantes ao redor da interrogação com tipografia 'QUAL O ROLÊ?'.",
      badge: "Festivais & Baladas",
    },
    {
      id: "wave-fluid",
      path: "/logo-wave-fluid.jpg",
      title: "Estilo C: Fita de Frequência Fluida (Sine Wave)",
      desc: "Onda sonora orgânica e fluida como uma fita líquida de neon formando a interrogação.",
      badge: "Minimalista & Elegante",
    },
    {
      id: "wave-radial",
      path: "/logo-wave-radial.jpg",
      title: "Estilo D: Ondas Radiais / Sonar Acústico",
      desc: "Ondas sonoras concêntricas propagando pela cidade com ripples no chão e letreiro neon.",
      badge: "Sonar Noturno",
    },
    {
      id: "soundwave-base",
      path: "/logo-soundwave.jpg",
      title: "Modelo Base: Equalizador Noturno",
      desc: "A versão que você curtiu: pino de GPS com barras de som e interrogação central.",
      badge: "Favorito Anterior",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-purple-500/30 bg-[#0b0f19] p-5 sm:p-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white sm:text-xl">
                Linha Ondas Sonoras & Equalizador: <span className="text-purple-400">Qual o Rolê?</span>
              </h2>
              <p className="text-xs text-slate-400">
                Explore os 4 novos estilos visuais criados a partir do modelo que você gostou!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {options.map((opt) => {
            const isSelected = selectedLogo === opt.path;
            return (
              <div
                key={opt.id}
                onClick={() => onSelectLogo(opt.path)}
                className={`group relative flex flex-col rounded-2xl border p-3 cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "border-purple-500 bg-purple-950/40 shadow-[0_0_25px_rgba(168,85,247,0.4)] ring-2 ring-purple-500/50"
                    : "border-white/10 bg-white/[0.03] hover:border-purple-500/40 hover:bg-white/[0.06]"
                }`}
              >
                {/* Image */}
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black border border-white/10">
                  <img
                    src={opt.path}
                    alt={opt.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-extrabold text-purple-300 border border-purple-500/30">
                    {opt.badge}
                  </span>
                </div>

                {/* Info */}
                <div className="mt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white leading-tight">
                      {opt.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-400 leading-snug">
                      {opt.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLogo(opt.path);
                    }}
                    className={`mt-3 w-full rounded-xl py-2 text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/40"
                        : "border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {isSelected ? "✓ Selecionado no Topo" : "Usar este Logo"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            💡 Ao clicar em <strong>"Usar este Logo"</strong>, ele é aplicado imediatamente no topo do app para você ver como fica!
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-purple-600 px-5 py-2 font-bold text-white hover:bg-purple-500 text-xs shrink-0"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
