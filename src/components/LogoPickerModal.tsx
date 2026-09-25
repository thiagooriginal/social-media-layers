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
      id: "pulse-hologram",
      path: "/logo-pulse-hologram.jpg",
      title: "🌌 Sonar Pulse: Skyline SP & HUD Noturno",
      desc: "Transdutor subwoofer com ondas de choque acústicas, feixe 360° revelando os prédios e baladas de SP, aro de titânio e marca 'RADAR DO ROLÊ'.",
      badge: "NOVO • Skyline SP",
    },
    {
      id: "pulse-equalizer",
      path: "/logo-pulse-equalizer.jpg",
      title: "🎵 Sonar Pulse: Frequências & Equalizer 360°",
      desc: "Anéis concêntricos formados por barras de frequências musicais do beat, feixe ciano de alta precisão e hotspots VIP da noite.",
      badge: "NOVO • Equalizer",
    },
    {
      id: "pulse-app-badge",
      path: "/logo-pulse-app-badge.jpg",
      title: "📱 Sonar Pulse: App Store Icon Squircle",
      desc: "Formato de ícone oficial iOS/Android em vidro 3D e metal escovado, anéis ultravioleta de som e tipografia 'RADAR DO ROLÊ'.",
      badge: "NOVO • App Icon",
    },
    {
      id: "pulse-cyan-magenta",
      path: "/logo-pulse-cyan-magenta.jpg",
      title: "⚡ Sonar Pulse: Ciano & Magenta Neon",
      desc: "Evolução do Audio Pulse calibrada para a paleta oficial neon do app, com lente de cúpula de vidro e anéis sonoros dinâmicos.",
      badge: "NOVO • Neon Oficial",
    },
    {
      id: "sonar-pulse",
      path: "/logo-sonar-pulse.jpg",
      title: "🌊 Sonar Audio Pulse (Base Escolhida)",
      desc: "O modelo escolhido por você: transdutor acústico central, cúpula de vidro, ondas sonoras de pressão e feixe rotativo.",
      badge: "BASE ELEITA",
    },
    {
      id: "sonar-cyan-pink",
      path: "/logo-sonar-cyan-pink.jpg",
      title: "🟣 Sonar Noturno Neon (Ciano & Magenta)",
      desc: "Radar sonar com pino de GPS central, calibração em graus (0° a 360°), raio de 3KM e baladas ativas mapeadas em neon.",
      badge: "Sonar Noturno SP",
    },
    {
      id: "sonar-classic",
      path: "/logo-sonar-classic.jpg",
      title: "🟢 Sonar Tático Clássico (Verde Esmeralda)",
      desc: "Varredura 360° autêntica de sonar militar com anéis métricos de distância (250m a 2km), pontos cardeais e ecos de detecção.",
      badge: "Sonar Clássico",
    },
    {
      id: "sonar-flat",
      path: "/logo-sonar-flat.jpg",
      title: "🔷 Sonar Minimalista 2D (App Icon Clean)",
      desc: "Design plano moderno e arrojado: anéis de sonar em ciano, feixe de varredura cônica em magenta e hotspots limpos.",
      badge: "Sonar Minimalista",
    },
    {
      id: "concept-vortex",
      path: "/logo-concept-vortex.jpg",
      title: "🌀 Conceito A: Vórtex & Radar Scanner",
      desc: "Scanner de alta rotação com anéis circulares em neon ciano e magenta, cruz de mira de radar e batimento musical integrado.",
      badge: "NOVO • Vórtex",
    },
    {
      id: "concept-compass",
      path: "/logo-concept-compass.jpg",
      title: "🧭 Conceito B: Bússola Noturna & Vinil",
      desc: "Rosa dos ventos futurista fundida com ondas de vinil e diafragma de som central, guiando a sua noite em SP.",
      badge: "NOVO • Bússola",
    },
    {
      id: "concept-flame",
      path: "/logo-concept-flame.jpg",
      title: "🔥 Conceito C: Chama & Equalizador",
      desc: "Fogo estilizado em curvas fluidas conectado diretamente a barras de som pulsantes. Calor, energia e batidão.",
      badge: "NOVO • Chama",
    },
    {
      id: "concept-prism",
      path: "/logo-concept-prism.jpg",
      title: "💎 Conceito D: Globo Prisma & Sonar",
      desc: "Globo espelhado geométrico multifacetado com reflexos cintilantes, cercado por anéis concêntricos de sonar/radar.",
      badge: "NOVO • Prisma",
    },
    {
      id: "soundwave-base",
      path: "/logo-radar-neon.svg",
      title: "⭐ Pino GPS + Soundwave (Anterior)",
      desc: "Modelo eleito anteriormente: Pino GPS / Radar neon ciano e magenta com barras de equalizador musical.",
      badge: "Anterior",
    },
    {
      id: "flat-vector",
      path: "/logo-flat-vector.jpg",
      title: "Minimalista Flat Vector (Tech Moderno)",
      desc: "Design 2D moderno, sem vidro 3D e sem tubos de neon. Estética limpa estilo Spotify e Uber.",
      badge: "Minimalista 2D",
    },
    {
      id: "gold-luxury",
      path: "/logo-gold-luxury.svg",
      title: "Dourado Retrô Speakeasy (Jazz & Club)",
      desc: "Acabamento em ouro escovado e latão champanhe sobre carvão. Visual boêmio, refinado e clássico.",
      badge: "Ouro & Retrô",
    },
    {
      id: "clean-duotone",
      path: "/logo-clean-duotone.svg",
      title: "Clean Duotone Tech (Estilo iOS)",
      desc: "Visual de app nativo moderno, contorno em degradê violeta acetinado e interrogação em branco puro.",
      badge: "Apple & iOS",
    },
    {
      id: "minimal-street",
      path: "/logo-minimal-street.svg",
      title: "Monocromático Urbano (Street Club)",
      desc: "Preto, grafite e branco em altíssimo contraste. Linhas arrojadas, estilo Boiler Room e streetwear.",
      badge: "Streetwear & B&W",
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
                4 Novos Estilos (Sem Efeito Neon): <span className="text-purple-400">Radar do Rolê</span>
              </h2>
              <p className="text-xs text-slate-400">
                Mantivemos o Pino GPS + Equalizador + Interrogação, explorando estilos Flat, Dourado, iOS e Street!
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
