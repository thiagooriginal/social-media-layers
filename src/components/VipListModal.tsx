import React, { useState } from "react";
import { X, CheckCircle, Ticket, Sparkles, Send, ShieldCheck, User, Phone, Users } from "lucide-react";
import { Venue } from "../data/venues";
import { submitVipListLead } from "../services/venueService";

interface VipListModalProps {
  venue: Venue | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VipListModal({ venue, isOpen, onClose }: VipListModalProps) {
  const [userName, setUserName] = useState("");
  const [userWhatsapp, setUserWhatsapp] = useState("");
  const [guestsCount, setGuestsCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !venue) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userWhatsapp.trim()) {
      alert("Por favor, preencha seu nome e WhatsApp.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitVipListLead({
        venueId: venue.id,
        venueName: venue.name,
        userName,
        userWhatsapp,
        guestsCount,
      });

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsAppConfirm = () => {
    const text = encodeURIComponent(
      `Olá! Acabei de me cadastrar na Lista VIP do *${venue.name}* pelo BaladaON!\n\n` +
        `👤 *Nome:* ${userName}\n` +
        `📱 *WhatsApp:* ${userWhatsapp}\n` +
        `👥 *Quantidade:* ${guestsCount} ${guestsCount === 1 ? "pessoa" : "pessoas"}\n` +
        `🎟️ *Vantagem:* ${venue.entryPrice}\n\n` +
        `Poderiam confirmar a entrada do meu grupo? Obrigado!`
    );
    window.open(`https://api.whatsapp.com/send?phone=${venue.whatsapp}&text=${text}`, "_blank");
    handleResetAndClose();
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setUserName("");
    setUserWhatsapp("");
    setGuestsCount(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all">
      <div className="absolute inset-0" onClick={handleResetAndClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-purple-500/30 bg-[#0c101c] p-6 text-slate-100 shadow-[0_0_50px_-10px_rgba(168,85,247,0.4)] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {!isSuccess ? (
          /* Form View */
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-xl">
                🎟️
              </span>
              <div>
                <h3 className="text-lg font-black text-white">Garantir Lista VIP</h3>
                <p className="text-xs text-purple-300 font-semibold">{venue.name}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 text-xs text-purple-200">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                Vantagem da Lista VIP:
              </p>
              <p className="mt-1 text-slate-300">{venue.entryPrice}</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Nome Completo
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Seu nome como no RG"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  WhatsApp (com DDD)
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={userWhatsapp}
                    onChange={(e) => setUserWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Number of People */}
              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Quantas pessoas com você?
                </label>
                <div className="mt-1 flex items-center gap-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setGuestsCount(num)}
                      className={`flex h-9 flex-1 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                        guestsCount === num
                          ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                          : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 py-3 text-sm font-black text-white shadow-[0_0_25px_-5px_rgba(168,85,247,0.7)] transition-all hover:brightness-110 active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Confirmando no banco de dados...</span>
                  ) : (
                    <>
                      <span>Confirmar Entrada na Lista VIP</span>
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Seus dados ficam 100% seguros com criptografia e RLS.</span>
              </div>
            </form>
          </div>
        ) : (
          /* Success Ticket View */
          <div className="py-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)]">
              <CheckCircle className="h-8 w-8" />
            </div>

            <h3 className="mt-4 text-xl font-black text-white">
              Nome na Lista Confirmado! 🎉
            </h3>
            <p className="mt-1 text-xs text-slate-300">
              Seu nome e seu grupo foram cadastrados com sucesso para o evento no{" "}
              <strong className="text-purple-300">{venue.name}</strong>.
            </p>

            {/* Virtual VIP Pass */}
            <div className="mt-5 rounded-2xl border border-dashed border-purple-500/50 bg-purple-950/20 p-4 text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Passe VIP Digital • BaladaON
                </span>
                <span className="text-[10px] font-extrabold text-emerald-400">ATIVO</span>
              </div>
              <div className="mt-2.5 space-y-1 text-xs">
                <p>
                  <span className="text-slate-400">Titular:</span>{" "}
                  <strong className="text-white">{userName}</strong>
                </p>
                <p>
                  <span className="text-slate-400">Grupo:</span>{" "}
                  <strong className="text-white">
                    {guestsCount} {guestsCount === 1 ? "pessoa" : "pessoas"}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-400">Horário sugerido:</span>{" "}
                  <strong className="text-white">{venue.openHours}</strong>
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={handleOpenWhatsAppConfirm}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-black text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all hover:bg-emerald-500 active:scale-98"
              >
                <span>Enviar Confirmação no WhatsApp da Balada</span>
                <Send className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={handleResetAndClose}
                className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
              >
                Voltar para o App
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
