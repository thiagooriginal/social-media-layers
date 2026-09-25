import React, { useState, useEffect } from "react";
import { Sparkles, MapPin, Volume2, VolumeX, ArrowRight, Zap } from "lucide-react";

interface RadarIntroSplashProps {
  onFinish: () => void;
}

// Síntese de áudio realista de sonar sci-fi usando Web Audio API
function playSonarPing(frequency: number = 880) {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.6, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Autoplay silenciado pelo navegador
  }
}

interface DetectedItem {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  x: number; // percentage
  y: number; // percentage
  distance: string;
  color: string;
  borderColor: string;
  shadowColor: string;
  icon: string;
}

const DETECTED_ITEMS: DetectedItem[] = [
  {
    id: "balada",
    name: "D-Edge & Villa JK",
    category: "balada",
    categoryLabel: "Baladas & Festas",
    x: 68,
    y: 32,
    distance: "1.2 km",
    color: "#d946ef", // fuchsia
    borderColor: "border-fuchsia-400",
    shadowColor: "shadow-[0_0_20px_rgba(217,70,239,0.9)]",
    icon: "🪩",
  },
  {
    id: "restaurante",
    name: "Bar Brahma & Skye Rooftop",
    category: "restaurante",
    categoryLabel: "Bares & Gastronomia",
    x: 26,
    y: 62,
    distance: "2.4 km",
    color: "#f59e0b", // amber
    borderColor: "border-amber-400",
    shadowColor: "shadow-[0_0_20px_rgba(245,158,11,0.9)]",
    icon: "🍸",
  },
  {
    id: "after",
    name: "Bella Paulista 24h & Lush",
    category: "after",
    categoryLabel: "Modo After & Motéis",
    x: 74,
    y: 68,
    distance: "850 m",
    color: "#a855f7", // purple
    borderColor: "border-purple-400",
    shadowColor: "shadow-[0_0_20px_rgba(168,85,247,0.9)]",
    icon: "🔥",
  },
];

export function RadarIntroSplash({ onFinish }: RadarIntroSplashProps) {
  const [step, setStep] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(10);

  // Sequência cinematográfica da leitura do radar
  useEffect(() => {
    // Fase 0: Inicializando radar
    const t0 = setTimeout(() => {
      setProgress(25);
    }, 400);

    // Volta 1: Detectando Baladas (0.9s)
    const t1 = setTimeout(() => {
      setStep(1);
      setProgress(50);
      if (soundEnabled) playSonarPing(650);
    }, 900);

    // Volta 2: Detectando Bares & Restaurantes (1.9s)
    const t2 = setTimeout(() => {
      setStep(2);
      setProgress(75);
      if (soundEnabled) playSonarPing(800);
    }, 1900);

    // Volta 3: Detectando Motéis & After (2.9s)
    const t3 = setTimeout(() => {
      setStep(3);
      setProgress(95);
      if (soundEnabled) playSonarPing(980);
    }, 2900);

    // Finalização e Sincronização Total (3.8s)
    const t4 = setTimeout(() => {
      setStep(4);
      setProgress(100);
      if (soundEnabled) playSonarPing(1200);
    }, 3800);

    // Transição suave para o app (6.5s)
    const t5 = setTimeout(() => {
      handleComplete();
    }, 6500);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [soundEnabled]);

  const handleComplete = () => {
    setIsClosing(true);
    setTimeout(() => {
      onFinish();
    }, 450);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between overflow-hidden bg-[#04060d] text-white select-none transition-all duration-500 ${
        isClosing ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background Cyber Grid & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a15_1px,transparent_1px),linear-gradient(to_bottom,#0f172a15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Bar: Controls */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between px-6 pt-6 sm:pt-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/50 bg-[#060810] shadow-[0_0_18px_rgba(6,182,212,0.6)] overflow-hidden">
            <img src="/logo-official.jpg" alt="Radar do Rolê" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">
                RADAR DO ROLÊ
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AO VIVO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">São Paulo • GPS Noturno</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all"
            title={soundEnabled ? "Silenciar áudio do radar" : "Ativar som do radar"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
          </button>

          <button
            onClick={handleComplete}
            className="group flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:text-white transition-all shadow-lg active:scale-95"
          >
            <span>Pular</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Center: The Futuristic Radar Display */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center px-4 w-full">
        {/* Radar Viewport Circle */}
        <div className="relative h-[290px] w-[290px] xs:h-[330px] xs:w-[330px] sm:h-[400px] sm:w-[400px] rounded-full border border-cyan-500/40 bg-[#060a17]/90 shadow-[0_0_60px_-10px_rgba(6,182,212,0.35)] backdrop-blur-md flex items-center justify-center overflow-hidden">
          
          {/* Outer Compass Degree Markings */}
          <div className="absolute inset-2 rounded-full border border-cyan-500/20 pointer-events-none" />
          <div className="absolute top-2 text-[10px] font-mono font-bold text-cyan-400">N (Z. Norte)</div>
          <div className="absolute bottom-2 text-[10px] font-mono font-bold text-cyan-400">S (Z. Sul)</div>
          <div className="absolute left-2.5 text-[10px] font-mono font-bold text-cyan-400">O (Z. Oeste)</div>
          <div className="absolute right-2.5 text-[10px] font-mono font-bold text-cyan-400">L (Z. Leste)</div>

          {/* Concentric Distance Rings */}
          <div className="absolute h-3/4 w-3/4 rounded-full border border-dashed border-cyan-500/20" />
          <div className="absolute h-1/2 w-1/2 rounded-full border border-cyan-500/30" />
          <div className="absolute h-1/4 w-1/4 rounded-full border border-cyan-500/25" />

          {/* Crosshairs */}
          <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

          {/* Center Coordinates Indicator */}
          <div className="absolute text-[9px] font-mono text-cyan-400/50 top-1/2 left-1/2 translate-x-3 -translate-y-4 pointer-events-none">
            23.5505° S, 46.6333° W
          </div>

          {/* Central Pulsing Beacon */}
          <div className="relative z-20 flex h-6 w-6 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
            <div className="h-3 w-3 rounded-full bg-cyan-400 border-2 border-[#04060d] shadow-[0_0_15px_#22d3ee]"></div>
          </div>

          {/* Spinning Radar Conical Sweep Beam */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              animation: "spinRadar 2.4s linear infinite",
            }}
          >
            {/* Conical gradient sweep sector */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg at 50% 50%, rgba(6, 182, 212, 0.45) 0deg, rgba(6, 182, 212, 0.08) 45deg, transparent 90deg, transparent 360deg)",
              }}
            />
            {/* Bright leading sweep line */}
            <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-gradient-to-t from-cyan-300 to-transparent shadow-[0_0_12px_#22d3ee]" />
          </div>

          {/* Detected Pins appearing progressively on each sweep */}
          {DETECTED_ITEMS.map((item, index) => {
            const isVisible = step >= index + 1;
            if (!isVisible) return null;

            return (
              <div
                key={item.id}
                className="absolute z-20 transition-all duration-300 animate-in zoom-in-50 fade-in"
                style={{
                  top: `${item.y}%`,
                  left: `${item.x}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Rippling Ring Ping */}
                <div
                  className="absolute -inset-3 rounded-full animate-ping opacity-60 pointer-events-none"
                  style={{ backgroundColor: item.color }}
                />

                {/* GPS Pin Badge */}
                <div
                  className={`relative flex items-center gap-1.5 rounded-full border-2 ${item.borderColor} bg-[#0b0f1d] px-2.5 py-1 text-xs font-black shadow-lg ${item.shadowColor} cursor-default`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[10px] text-white font-extrabold">{item.name}</span>
                    <span className="text-[8px] font-mono text-slate-300">{item.distance}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Status / Narrative below the Radar */}
        <div className="mt-7 flex flex-col items-center text-center max-w-md px-2">
          {step === 0 && (
            <div className="animate-in fade-in duration-300">
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">
                [ ETAPA 1/3 ] CALIBRANDO SENSORES NOTURNOS...
              </span>
              <h3 className="mt-1 text-base sm:text-lg font-black text-white">
                Sintonizando frequência dos rolês de São Paulo...
              </h3>
            </div>
          )}

          {step === 1 && (
            <div className="animate-in zoom-in-95 fade-in duration-300">
              <span className="text-xs font-mono font-bold text-fuchsia-400 tracking-wider">
                [ ETAPA 1/3 • ALVOS ENCONTRADOS ]
              </span>
              <h3 className="mt-1 text-base sm:text-lg font-black text-white flex items-center justify-center gap-1.5">
                <span>🪩 Baladas & Pistas Mapeadas!</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Vila JK, D-Edge, Selva, Tokyo e line-ups de DJs da noite.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in zoom-in-95 fade-in duration-300">
              <span className="text-xs font-mono font-bold text-amber-400 tracking-wider">
                [ ETAPA 2/3 • GASTRONOMIA & DRINKS ]
              </span>
              <h3 className="mt-1 text-base sm:text-lg font-black text-white flex items-center justify-center gap-1.5">
                <span>🍸 Bares & Rooftops Detectados!</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Bar Brahma, Skye, Vila 567 e picos da Vila Madalena por perto.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in zoom-in-95 fade-in duration-300">
              <span className="text-xs font-mono font-bold text-purple-400 tracking-wider">
                [ ETAPA 3/3 • MADRUGADA & AFTER ]
              </span>
              <h3 className="mt-1 text-base sm:text-lg font-black text-white flex items-center justify-center gap-1.5">
                <span>🔥 Motéis & Modo After 24h Localizados!</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Padaria Bella Paulista 24h, Estadão e motéis com suítes abertas.
              </p>
            </div>
          )}

          {step >= 4 && (
            <div className="animate-in zoom-in-95 fade-in duration-300 flex flex-col items-center">
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider flex items-center justify-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                RADAR 100% SINCRONIZADO!
              </span>
              <h3 className="mt-1 text-lg sm:text-xl font-black text-white">
                48 Rolês Prontos para Você Curtir!
              </h3>
              <p className="text-xs text-cyan-300 mt-0.5 font-medium">
                Abrindo o feed com cálculo de rotas e Uber...
              </p>
              <button
                onClick={handleComplete}
                className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-emerald-400 px-6 py-2.5 text-xs font-black text-white shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>ENTRAR NO APP AGORA</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Progress Bar & Telemetry */}
      <div className="relative z-10 w-full max-w-xl px-6 pb-6 sm:pb-8">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
          <span className="flex items-center gap-1 text-cyan-400">
            <MapPin className="h-3 w-3" />
            Geolocalização Ativa: SP Capital
          </span>
          <span className="font-bold text-white">{progress}%</span>
        </div>

        {/* Progress track */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10 border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(6,182,212,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-2 text-center text-[10px] text-slate-500 font-mono">
          Radar do Rolê • Encontrando baladas, restaurantes e motéis por perto
        </p>
      </div>

      {/* Global CSS for the radar spin animation */}
      <style>{`
        @keyframes spinRadar {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
