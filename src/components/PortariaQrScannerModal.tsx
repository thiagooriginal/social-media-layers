import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  Scan,
  Sparkles,
  Phone,
  Users,
  Ticket,
  Search,
} from "lucide-react";

export interface ScannedLeadInfo {
  id: string;
  userName: string;
  userWhatsapp: string;
  guestsCount: number;
  status: string;
}

interface PortariaQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueName: string;
  leads: Array<{
    id: string;
    user_name: string;
    user_whatsapp: string;
    guests_count: number;
    status: string;
  }>;
  onCheckInLead: (leadId: string) => void;
}

export function PortariaQrScannerModal({
  isOpen,
  onClose,
  venueName,
  leads,
  onCheckInLead,
}: PortariaQrScannerModalProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [scannedLead, setScannedLead] = useState<ScannedLeadInfo | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Play a pleasant synthesizer chime on successful scan (Web Audio API)
  const playSuccessChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  // Start Camera Stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScannedLead(null);
      setFeedbackSuccess(false);
      setManualCode("");
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Acesso à câmera não suportado neste navegador.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }, // Rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: unknown) {
      console.warn("Câmera bloqueada ou indisponível:", err);
      setCameraError("Câmera não permitida ou indisponível. Use a validação por código abaixo.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Manual or scanned code lookup
  const handleVerifyCode = (code: string) => {
    const clean = code.trim().toLowerCase();
    if (!clean) return;

    // Match by ID, name, or phone
    const found = leads.find((l) => {
      const matchId = l.id.toLowerCase().includes(clean);
      const matchName = l.user_name.toLowerCase().includes(clean);
      const matchPhone = l.user_whatsapp.replace(/\D/g, "").includes(clean.replace(/\D/g, ""));
      return matchId || matchName || matchPhone;
    });

    if (found) {
      setScannedLead({
        id: found.id,
        userName: found.user_name,
        userWhatsapp: found.user_whatsapp,
        guestsCount: found.guests_count,
        status: found.status,
      });
      playSuccessChime();
    } else {
      alert("Nenhum cadastro VIP encontrado com este código ou nome.");
    }
  };

  const handleConfirmEntry = () => {
    if (!scannedLead) return;
    onCheckInLead(scannedLead.id);
    playSuccessChime();
    setFeedbackSuccess(true);

    setTimeout(() => {
      setFeedbackSuccess(false);
      setScannedLead(null);
      setManualCode("");
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-3 sm:p-4 animate-in fade-in select-none">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-cyan-500/40 bg-[#070b14] text-slate-100 shadow-[0_0_60px_-10px_rgba(6,182,212,0.4)] z-10 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-5 bg-gradient-to-r from-cyan-950/40 to-slate-900">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Camera className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                <span>Scanner de Portaria VIP</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-cyan-300 font-semibold">{venueName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Camera Viewport / Reticle */}
        <div className="p-4 space-y-4">
          <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-black border border-cyan-500/30 flex items-center justify-center shadow-inner">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center p-6 text-slate-400 space-y-2">
                <Camera className="h-10 w-10 text-slate-600 mx-auto animate-pulse" />
                <p className="text-xs">{cameraError || "Iniciando câmera traseira..."}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-900/50"
                >
                  Tentar Câmera Novamente
                </button>
              </div>
            )}

            {/* Glowing Cyberpunk Scanner HUD Overlay */}
            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
                <div className="w-full flex justify-between">
                  <div className="h-8 w-8 border-t-2 border-l-2 border-[#00F0FF]" />
                  <div className="h-8 w-8 border-t-2 border-r-2 border-[#00F0FF]" />
                </div>

                {/* Laser Sweep Beam */}
                <div className="relative w-48 h-48 border border-cyan-500/20 rounded-2xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent shadow-[0_0_15px_#00F0FF] animate-pulse" />
                  <span className="text-[9px] font-mono tracking-widest uppercase text-cyan-400/80 bg-black/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    Aponte para o QR Code
                  </span>
                </div>

                <div className="w-full flex justify-between">
                  <div className="h-8 w-8 border-b-2 border-l-2 border-[#00F0FF]" />
                  <div className="h-8 w-8 border-b-2 border-r-2 border-[#00F0FF]" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Match Simulation / Manual Code Search */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ou Busque por Código / Nome / Telefone:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyCode(manualCode)}
                  placeholder="Ex: Lucas, 98765, ou ID do passe"
                  className="w-full rounded-xl border border-white/15 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none font-medium"
                />
              </div>
              <button
                type="button"
                onClick={() => handleVerifyCode(manualCode)}
                className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-black text-white transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Scanned Result Card */}
          {scannedLead && (
            <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/20 p-4 space-y-3 animate-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                    PASSE VIP LOCALIZADO
                  </span>
                  <h4 className="text-base font-black text-white">{scannedLead.userName}</h4>
                  <span className="text-xs text-emerald-300 font-mono">{scannedLead.userWhatsapp}</span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-2.5 py-1 text-xs font-black">
                    <Users className="h-3.5 w-3.5" />
                    +{scannedLead.guestsCount} pessoas
                  </span>
                </div>
              </div>

              {feedbackSuccess ? (
                <div className="rounded-xl bg-emerald-500/30 border border-emerald-500/60 p-3 text-center text-xs font-black text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-in fade-in">
                  ✓ ENTRADA VIP LIBERADA! BEM-VINDO(A)! 🎉
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmEntry}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-3 text-xs font-black text-black shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>CONFIRMAR ENTRADA DO GRUPO (CHECK-IN)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
