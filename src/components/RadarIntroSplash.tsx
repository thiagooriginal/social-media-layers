import React, { useState, useEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../services/themeService";

interface RadarIntroSplashProps {
  onFinish: () => void;
}

interface RadarTarget {
  id: string;
  name: string;
  genre: string;
  distance: string;
  colorType: "cyan" | "fuchsia" | "emerald" | "purple";
  topOffset: string;
  leftOffset?: string;
  rightOffset?: string;
  isRightAligned?: boolean;
  discoveredAtMs: number;
}

const RADAR_TARGETS: RadarTarget[] = [
  {
    id: "dedge",
    name: "D-Edge",
    genre: "Techno",
    distance: "1.2km",
    colorType: "cyan",
    topOffset: "calc(50% - 126px)",
    leftOffset: "calc(50% + 36px)",
    isRightAligned: false,
    discoveredAtMs: 600,
  },
  {
    id: "vilamada",
    name: "Vila Madá",
    genre: "Pagode",
    distance: "2.5km",
    colorType: "fuchsia",
    topOffset: "calc(50% + 94px)",
    leftOffset: "calc(50% + 32px)",
    isRightAligned: false,
    discoveredAtMs: 1200,
  },
  {
    id: "villacountry",
    name: "Villa Country",
    genre: "Sertanejo",
    distance: "3.8km",
    colorType: "emerald",
    topOffset: "calc(50% + 102px)",
    rightOffset: "calc(50% + 40px)",
    isRightAligned: true,
    discoveredAtMs: 1800,
  },
  {
    id: "komplexo",
    name: "Komplexo TEMPO",
    genre: "After",
    distance: "4.5km",
    colorType: "purple",
    topOffset: "calc(50% - 118px)",
    rightOffset: "calc(50% + 38px)",
    isRightAligned: true,
    discoveredAtMs: 2400,
  },
  {
    id: "laroc",
    name: "Laroc Club",
    genre: "Eletrônica",
    distance: "7.2km",
    colorType: "cyan",
    topOffset: "calc(50% - 10px)",
    leftOffset: "calc(50% + 78px)",
    isRightAligned: false,
    discoveredAtMs: 3000,
  },
];

export function RadarIntroSplash({ onFinish }: RadarIntroSplashProps) {
  const { theme, toggleTheme } = useTheme();
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [discoveredCount, setDiscoveredCount] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("Sincronizando satélite...");
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const splashRef = useRef<HTMLDivElement>(null);
  const hasFinishedRef = useRef<boolean>(false);

  const handleComplete = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsClosing(true);

    if (typeof window !== "undefined") {
      (window as unknown as { __radarSessionDismissed?: boolean }).__radarSessionDismissed = true;
    }

    setTimeout(() => {
      if (splashRef.current) {
        splashRef.current.style.setProperty("display", "none", "important");
      }
      onFinish();
    }, 350);
  };

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Progresso suave da barra de telemetria
    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(100, prev + 2);
      });
    }, 70);

    // Momento 1: Inicialização do Radar
    const timerInit = setTimeout(() => {
      setStatusMessage("Varrendo raio local (10 km)...");
    }, 300);
    timers.push(timerInit);

    // Momento 2: Descoberta sequencial das baladas sincronizada com o feixe do radar
    RADAR_TARGETS.forEach((target, index) => {
      const timer = setTimeout(() => {
        setDiscoveredCount((prev) => Math.max(prev, index + 1));
        if (index === 0) {
          setStatusMessage("📍 D-Edge localizado (1.2 km)");
        } else if (index === 1) {
          setStatusMessage("📍 Vila Madá localizado (2.5 km)");
        } else if (index === 2) {
          setStatusMessage("📍 Villa Country localizado (3.8 km)");
        } else if (index === 3) {
          setStatusMessage("📍 Komplexo TEMPO localizado (4.5 km)");
        } else if (index === 4) {
          setStatusMessage("🔥 5 baladas confirmadas hoje!");
        }
      }, target.discoveredAtMs);
      timers.push(timer);
    });

    // Confirmação final e transição obrigatória para a tela inicial
    const readyTimer = setTimeout(() => {
      setStatusMessage("✅ Radar calibrado! Abrindo rolês...");
      setProgressPercent(100);
    }, 3500);
    timers.push(readyTimer);

    const finishTimer = setTimeout(() => {
      handleComplete();
    }, 4000);
    timers.push(finishTimer);

    return () => {
      clearInterval(progressInterval);
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <div
      ref={splashRef}
      id="radar-intro-splash"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between py-6 px-4 bg-black select-none pointer-events-auto cursor-default transition-opacity duration-300 overflow-hidden ${
        isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <style>{`
        @keyframes fullLogoRadarSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fullLogoSonarWave {
          0% {
            transform: scale(0.95);
            opacity: 0.9;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        @keyframes radarPingRing {
          0% {
            transform: scale(0.6);
            opacity: 1;
          }
          100% {
            transform: scale(2.8);
            opacity: 0;
          }
        }
        @keyframes radarTargetPop {
          0% {
            transform: scale(0.35);
            opacity: 0;
            filter: blur(4px);
          }
          70% {
            transform: scale(1.08);
            opacity: 1;
            filter: blur(0px);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .sonar-full-spin {
          animation: fullLogoRadarSpin 2.4s linear infinite !important;
        }
        .sonar-full-wave-1 {
          animation: fullLogoSonarWave 2.4s cubic-bezier(0.1, 0.4, 0.6, 1) infinite !important;
        }
        .sonar-full-wave-2 {
          animation: fullLogoSonarWave 2.4s cubic-bezier(0.1, 0.4, 0.6, 1) 0.8s infinite !important;
        }
        .sonar-full-wave-3 {
          animation: fullLogoSonarWave 2.4s cubic-bezier(0.1, 0.4, 0.6, 1) 1.6s infinite !important;
        }
        .radar-ping {
          animation: radarPingRing 1.8s ease-out infinite !important;
        }
        .radar-pop {
          animation: radarTargetPop 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
        }
      `}</style>

      {/* Top Floating Theme Switcher right on the opening radar splash */}
      <div className="absolute top-3 right-3 z-30">
        <button
          type="button"
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black backdrop-blur-md transition-all cursor-pointer shadow-lg active:scale-95 ${
            theme === "dark"
              ? "border-cyan-500/40 bg-black/60 text-cyan-300 hover:border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              : "border-amber-400/80 bg-white/90 text-amber-800 hover:bg-white shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          }`}
          title="Alternar Tema do App (Escuro Original / Claro)"
        >
          {theme === "dark" ? (
            <>
              <Moon className="h-3 w-3 text-cyan-400" />
              <span>🌙 Escuro</span>
            </>
          ) : (
            <>
              <Sun className="h-3 w-3 text-amber-500" />
              <span>☀️ Claro</span>
            </>
          )}
        </button>
      </div>

      {/* TOP STATUS HUD: Radar Telemetry */}
      <div className="relative z-20 flex flex-col items-center gap-1.5 pt-2 xs:pt-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F0FF]"></span>
          </span>
          <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-300">
            {statusMessage}
          </span>
        </div>
        <div className="text-[11px] xs:text-[12px] font-medium text-slate-400">
          {discoveredCount === 0
            ? "Buscando baladas no raio..."
            : discoveredCount < 5
            ? `${discoveredCount} ${discoveredCount === 1 ? "balada encontrada" : "baladas encontradas"} no radar`
            : "🔥 5 baladas confirmadas hoje!"}
        </div>
      </div>

      {/* CENTER RADAR STAGE: Circular Logo with Radar Beam & Surrounding Baladas */}
      <div className="relative w-full max-w-[380px] flex-1 flex items-center justify-center my-auto">
        
        {/* Futuristic Faint Radar Scope Rings */}
        <div className="absolute w-[330px] h-[330px] xs:w-[350px] xs:h-[350px] rounded-full border border-cyan-500/10 pointer-events-none flex items-start justify-center">
          <span className="text-[8px] font-mono text-cyan-500/40 mt-1 tracking-wider">10 KM</span>
        </div>
        <div className="absolute w-[250px] h-[250px] xs:w-[270px] xs:h-[270px] rounded-full border border-cyan-500/15 border-dashed pointer-events-none flex items-start justify-center">
          <span className="text-[8px] font-mono text-cyan-500/50 mt-1 tracking-wider">5 KM</span>
        </div>
        <div className="absolute w-[180px] h-[180px] xs:w-[195px] xs:h-[195px] rounded-full border border-cyan-500/20 pointer-events-none flex items-start justify-center">
          <span className="text-[8px] font-mono text-cyan-500/60 mt-1 tracking-wider">2 KM</span>
        </div>

        {/* Pulsing Sonar Ripple Shockwaves emanating from the circular logo */}
        <div className="absolute h-44 w-44 xs:h-52 xs:w-52 rounded-full border-2 border-cyan-400/80 sonar-full-wave-1 pointer-events-none" />
        <div className="absolute h-44 w-44 xs:h-52 xs:w-52 rounded-full border-2 border-fuchsia-500/80 sonar-full-wave-2 pointer-events-none" />
        <div className="absolute h-44 w-44 xs:h-52 xs:w-52 rounded-full border border-cyan-300/50 sonar-full-wave-3 pointer-events-none" />

        {/* Main Official Circular Logo */}
        <div className="relative z-10 flex h-44 w-44 xs:h-52 xs:w-52 items-center justify-center rounded-full overflow-hidden border-2 border-cyan-400 bg-black shadow-[0_0_50px_rgba(0,240,255,0.5)]">
          <img
            src="/logo-official.jpg"
            alt="Radar do Rolê"
            className="h-full w-full object-cover"
          />

          {/* THE SONAR RADAR BEAM SWEEPING OVER THE ENTIRE CIRCULAR LOGO */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none sonar-full-spin"
            style={{
              background:
                "conic-gradient(from 0deg, #00F0FF 0deg, rgba(0, 240, 255, 0.65) 25deg, rgba(255, 0, 127, 0.35) 60deg, transparent 95deg, transparent 360deg)",
              mixBlendMode: "screen",
            }}
          >
            {/* Bright Cyan Laser Needle from Center to the Outer Edge of Logo */}
            <div
              className="absolute top-1/2 left-1/2 w-1/2 h-[2.5px] bg-gradient-to-r from-transparent via-cyan-300 to-[#00F0FF] shadow-[0_0_12px_#00F0FF]"
              style={{ transformOrigin: "0% 50%" }}
            />
          </div>

          {/* Central glowing neon beacon dot */}
          <div className="absolute h-3 w-3 rounded-full bg-cyan-300 border border-[#04060d] shadow-[0_0_15px_#00F0FF] pointer-events-none" />
        </div>

        {/* Extended Radar Laser Beam scanning outward across the discovery field in perfect sync */}
        <div
          className="absolute w-[330px] h-[330px] xs:w-[350px] xs:h-[350px] rounded-full pointer-events-none sonar-full-spin z-10"
          style={{ transformOrigin: "center center" }}
        >
          <div
            className="absolute top-1/2 left-1/2 w-1/2 h-[1.5px] bg-gradient-to-r from-[#00F0FF]/90 via-cyan-400/50 to-transparent shadow-[0_0_8px_#00F0FF]"
            style={{ transformOrigin: "0% 50%" }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#00F0FF]" />
          </div>
        </div>

        {/* DISCOVERED BALADAS (Targets revealed by the sweep) */}
        {RADAR_TARGETS.map((target, idx) => {
          const isDiscovered = discoveredCount > idx;
          if (!isDiscovered) return null;

          const isFuchsia = target.colorType === "fuchsia";
          const isEmerald = target.colorType === "emerald";
          const isPurple = target.colorType === "purple";

          const pingBorder = isFuchsia
            ? "border-fuchsia-400"
            : isEmerald
            ? "border-emerald-400"
            : isPurple
            ? "border-purple-400"
            : "border-cyan-400";

          const dotBg = isFuchsia
            ? "bg-fuchsia-400 shadow-[0_0_12px_#FF007F]"
            : isEmerald
            ? "bg-emerald-400 shadow-[0_0_12px_#10b981]"
            : isPurple
            ? "bg-purple-400 shadow-[0_0_12px_#a855f7]"
            : "bg-cyan-400 shadow-[0_0_12px_#00F0FF]";

          const badgeBorder = isFuchsia
            ? "border-fuchsia-400/70 shadow-[0_0_15px_rgba(255,0,127,0.35)]"
            : isEmerald
            ? "border-emerald-400/70 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
            : isPurple
            ? "border-purple-400/70 shadow-[0_0_15px_rgba(168,85,247,0.35)]"
            : "border-cyan-400/70 shadow-[0_0_15px_rgba(0,240,255,0.35)]";

          const genrePill = isFuchsia
            ? "bg-fuchsia-500/20 text-fuchsia-200"
            : isEmerald
            ? "bg-emerald-500/20 text-emerald-200"
            : isPurple
            ? "bg-purple-500/20 text-purple-200"
            : "bg-cyan-500/20 text-cyan-200";

          const distanceColor = isFuchsia
            ? "text-fuchsia-300"
            : isEmerald
            ? "text-emerald-300"
            : isPurple
            ? "text-purple-300"
            : "text-cyan-300";

          return (
            <div
              key={target.id}
              className="absolute z-20"
              style={{
                top: target.topOffset,
                left: target.leftOffset,
                right: target.rightOffset,
              }}
            >
              <div
                className={`relative flex items-center radar-pop ${
                  target.isRightAligned ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Ping Shockwave Ring */}
                <div
                  className={`absolute -left-1.5 -top-1.5 w-6 h-6 rounded-full border ${pingBorder} radar-ping pointer-events-none`}
                />
                
                {/* Central Target Dot */}
                <div
                  className={`w-3 h-3 rounded-full ${dotBg} border border-black z-10`}
                />

                {/* Cyberpunk Glass Badge with Venue Info */}
                <div
                  className={`px-2 py-0.5 rounded-full bg-black/90 backdrop-blur-md border ${badgeBorder} flex items-center gap-1.5 whitespace-nowrap ${
                    target.isRightAligned ? "mr-1.5" : "ml-1.5"
                  }`}
                >
                  {target.isRightAligned && (
                    <span className={`text-[8px] xs:text-[9px] px-1 rounded ${genrePill}`}>
                      {target.genre}
                    </span>
                  )}
                  <span className="text-[10px] xs:text-[11px] font-bold text-white tracking-wide">
                    {target.name}
                  </span>
                  <span className={`text-[8px] xs:text-[9px] font-mono ${distanceColor}`}>
                    {target.distance}
                  </span>
                  {!target.isRightAligned && (
                    <span className={`text-[8px] xs:text-[9px] px-1 rounded ${genrePill}`}>
                      {target.genre}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

      </div>

      {/* BOTTOM HUD: Telemetry & Radar Progress (Sem botão de pular - Passagem obrigatória pelo radar) */}
      <div className="relative z-20 w-full max-w-sm flex flex-col items-center gap-2.5 pb-4 px-2">
        {/* Futuristic glowing progress bar */}
        <div className="w-full bg-slate-900/90 rounded-full h-2.5 p-0.5 border border-cyan-500/30 overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.25)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-[#00F0FF] to-fuchsia-500 transition-all duration-300 ease-out shadow-[0_0_12px_#00F0FF]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Telemetry metadata footer */}
        <div className="w-full flex items-center justify-between text-[10px] font-mono text-cyan-400/80 tracking-wider">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
            RADAR: SÃO PAULO
          </span>
          <span className="font-bold text-white tracking-widest">
            {progressPercent < 100 ? `${progressPercent}% SINTONIZADO` : "100% CALIBRADO"}
          </span>
          <span>RAIO: 10 KM</span>
        </div>

        <p className="text-[11px] text-slate-400 font-medium tracking-wide animate-pulse text-center">
          {progressPercent < 100 ? "Varrendo rolês e baladas abertas..." : "🔥 Conexão estabelecida! Abrindo tela inicial..."}
        </p>
      </div>
    </div>
  );
}
