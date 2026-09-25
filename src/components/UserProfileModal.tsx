import React from "react";
import { X, User, Phone, Mail, Ticket, Sparkles, LogOut, CheckCircle, Calendar, Users, QrCode } from "lucide-react";
import { UserProfile, getUserVipPasses, logoutUser, UserVipPass } from "../services/authService";
import { DigitalPassModal } from "./DigitalPassModal";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  onOpenVenueVip?: (venueId: string) => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  user,
  onLogout,
}: UserProfileModalProps) {
  if (!isOpen || !user) return null;

  const vipPasses: UserVipPass[] = getUserVipPasses();
  const [selectedPass, setSelectedPass] = React.useState<UserVipPass | null>(null);

  const handleLogoutClick = () => {
    logoutUser();
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-purple-500/30 bg-[#0c101c] p-6 text-slate-100 shadow-[0_0_50px_-10px_rgba(168,85,247,0.4)] z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* User Profile Card */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 text-2xl font-black text-white shadow-[0_0_25px_rgba(168,85,247,0.5)]">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white truncate">{user.name}</h3>
              <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[10px] font-extrabold text-purple-300">
                VIP
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3 w-3 text-slate-500" />
              <span>{user.email}</span>
            </p>
            {user.whatsapp && (
              <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                <Phone className="h-3 w-3 text-slate-500" />
                <span>{user.whatsapp}</span>
              </p>
            )}
          </div>
        </div>

        {/* Passes Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Ticket className="h-4 w-4 text-purple-400" />
              <span>Minhas Listas VIPs & Passes ({vipPasses.length})</span>
            </h4>
            <span className="text-[11px] text-slate-400">Salvos no seu app</span>
          </div>

          {vipPasses.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <Ticket className="mx-auto h-8 w-8 text-slate-500 mb-2 opacity-50" />
              <p className="text-xs font-bold text-slate-300">Nenhum passe emitido ainda hoje</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Ao clicar em "Lista VIP" em qualquer balada, seu voucher digital ficará guardado aqui para você mostrar na portaria!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {vipPasses.map((pass) => (
                <div
                  key={pass.id}
                  className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 transition-all hover:border-purple-500/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block rounded-md bg-purple-600/30 px-2 py-0.5 text-[10px] font-black text-purple-300 mb-1">
                        {pass.passCode}
                      </span>
                      <h5 className="text-sm font-bold text-white">{pass.venueName}</h5>
                      <p className="text-[11px] text-purple-200 mt-0.5">
                        {pass.entryBenefit}
                      </p>
                    </div>

                    <div className="flex flex-col items-end text-right">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Ativo
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        {pass.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-purple-500/20 pt-2 text-[11px] text-slate-300">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-purple-400" />
                      {pass.guestsCount} {pass.guestsCount === 1 ? "pessoa" : "pessoas"}
                    </span>
                    
                    <button
                      onClick={() => setSelectedPass(pass)}
                      className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-black text-cyan-300 hover:bg-cyan-500/25 active:scale-95 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Ver QR Code</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Logout */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair da conta</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/15 transition-all"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Digital Pass with QR Code Full View */}
      <DigitalPassModal
        pass={selectedPass}
        isOpen={!!selectedPass}
        onClose={() => setSelectedPass(null)}
      />
    </div>
  );
}
