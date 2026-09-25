import React, { useState } from "react";
import { X, Sparkles, CheckCircle2, QrCode, Copy, Check, Share2, ShieldCheck, MapPin, Calendar, Users, Moon } from "lucide-react";
import { UserVipPass } from "../services/authService";

interface DigitalPassModalProps {
  pass: UserVipPass | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DigitalPassModal({ pass, isOpen, onClose }: DigitalPassModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !pass) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pass.passCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSharePassWhatsApp = () => {
    const text = encodeURIComponent(
      `🎟️ *MEU PASSE VIP - RADAR DO ROLÊ*\n\n` +
      `🏢 *Local:* ${pass.venueName}\n` +
      `🔑 *Código:* ${pass.passCode}\n` +
      `👤 *Titular:* ${pass.userName}\n` +
      `👥 *Acompanhantes:* ${pass.guestsCount} ${pass.guestsCount === 1 ? "pessoa" : "pessoas"}\n` +
      `✨ *Vantagem:* ${pass.entryBenefit}\n` +
      `📅 *Emitido em:* ${pass.createdAt}\n\n` +
      `Apresente este voucher na portaria da casa!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-3 sm:p-4 transition-all animate-in fade-in duration-200 select-none">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl border border-cyan-500/40 bg-[#070b14] text-slate-100 shadow-[0_0_60px_-10px_rgba(6,182,212,0.4)] z-10 animate-in zoom-in-95 duration-200">
        
        {/* Glow radar accent at top */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-300 hover:text-white transition-all active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Pass Top Banner */}
        <div className="border-b border-white/10 bg-gradient-to-r from-cyan-950/60 via-purple-950/40 to-slate-900/60 p-5 text-center relative">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/50 bg-[#060810] shadow-[0_0_20px_rgba(6,182,212,0.6)] overflow-hidden mb-2.5">
            <img src="/logo-official.jpg" alt="Radar do Rolê" className="h-full w-full object-cover" />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>PASSE VIP DIGITAL • OFICIAL</span>
          </div>

          <h3 className="mt-1 text-lg sm:text-xl font-black text-white tracking-tight">
            {pass.venueName}
          </h3>

          <p className="mt-0.5 text-xs text-purple-300 font-semibold">
            {pass.entryBenefit}
          </p>
        </div>

        {/* Ticket Body / Cutout Notch */}
        <div className="relative p-5">
          {/* Left & Right Notch Visuals */}
          <div className="absolute -left-3 top-0 h-6 w-6 rounded-full bg-black/90 border-r border-cyan-500/40" />
          <div className="absolute -right-3 top-0 h-6 w-6 rounded-full bg-black/90 border-l border-cyan-500/40" />

          {/* QR Code Container */}
          <div className="mx-auto flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-500/40 bg-white p-4 text-slate-900 shadow-[0_0_25px_rgba(6,182,212,0.3)] max-w-[210px]">
            {/* Visual Simulated QR Grid with Radar Reticle */}
            <div className="relative h-36 w-36 bg-black flex flex-col justify-between p-2 rounded-xl overflow-hidden">
              {/* Corner Targets */}
              <div className="flex justify-between w-full">
                <div className="h-8 w-8 border-4 border-cyan-400 bg-white p-1">
                  <div className="h-full w-full bg-black" />
                </div>
                <div className="h-8 w-8 border-4 border-cyan-400 bg-white p-1">
                  <div className="h-full w-full bg-black" />
                </div>
              </div>

              {/* Center Radar Scanner Laser Beam */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent animate-pulse pointer-events-none" />

              <div className="flex items-center justify-center flex-col text-center">
                <span className="text-[10px] font-mono font-black text-cyan-400 tracking-wider">
                  RADAR VIP
                </span>
                <span className="text-xs font-mono font-extrabold text-white">
                  {pass.passCode}
                </span>
              </div>

              <div className="flex justify-between w-full">
                <div className="h-8 w-8 border-4 border-cyan-400 bg-white p-1">
                  <div className="h-full w-full bg-black" />
                </div>
                {/* Micro logo center */}
                <div className="h-6 w-6 rounded-full bg-cyan-400/20 flex items-center justify-center text-[10px] font-bold text-cyan-300">
                  📡
                </div>
              </div>
            </div>

            <span className="mt-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Apresente na Portaria / Hostess
            </span>
          </div>

          {/* Pass Details Card */}
          <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Código de Validação:</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-xs font-mono font-black text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>{pass.passCode}</span>
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Titular da Lista:</span>
              <span className="font-bold text-white">{pass.userName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Grupo / Acompanhantes:</span>
              <span className="font-bold text-fuchsia-300 flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {pass.guestsCount} {pass.guestsCount === 1 ? "pessoa" : "pessoas"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                CONFIRMADO
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSharePassWhatsApp}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Enviar no WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
