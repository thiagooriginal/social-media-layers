import React from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Ticket,
  Sparkles,
  LogOut,
  CheckCircle,
  Calendar,
  Users,
  QrCode,
  BarChart3,
  Plus,
  Building2,
  Fingerprint,
  Trash2,
  Edit3,
  Save,
  MapPin,
  Loader2,
  AlertCircle,
  Moon,
  Sun,
} from "lucide-react";
import {
  UserProfile,
  getUserVipPasses,
  logoutUser,
  UserVipPass,
  clearSavedCredentials,
  updateUserProfile,
} from "../services/authService";
import {
  getStoredBiometrics,
  registerDeviceBiometrics,
  clearStoredBiometrics,
  BiometricRegistration,
} from "../services/biometricService";
import { DigitalPassModal } from "./DigitalPassModal";
import { useTheme } from "../services/themeService";
import { toast } from "sonner";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  onOpenVenueVip?: (venueId: string) => void;
  onOpenRegisterModal?: () => void;
  onUserUpdated?: (user: UserProfile) => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  user,
  onLogout,
  onOpenRegisterModal,
  onUserUpdated,
}: UserProfileModalProps) {
  if (!isOpen || !user) return null;

  const { theme, setTheme } = useTheme();
  const vipPasses: UserVipPass[] = getUserVipPasses();
  const [selectedPass, setSelectedPass] = React.useState<UserVipPass | null>(null);
  const [biometricData, setBiometricData] = React.useState<BiometricRegistration | null>(() => getStoredBiometrics());
  const [bioMsg, setBioMsg] = React.useState("");
  const [bioLoading, setBioLoading] = React.useState(false);

  // Profile Edit State
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(user.name);
  const [editWhatsapp, setEditWhatsapp] = React.useState(user.whatsapp || "");
  const [editEmail, setEditEmail] = React.useState(user.email || "");
  const [editBusinessName, setEditBusinessName] = React.useState(user.businessName || "");
  const [editNeighborhood, setEditNeighborhood] = React.useState(user.neighborhood || "");
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedbackMsg, setFeedbackMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditWhatsapp(user.whatsapp || "");
      setEditEmail(user.email || "");
      setEditBusinessName(user.businessName || "");
      setEditNeighborhood(user.neighborhood || "");
    }
  }, [user, isOpen]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMsg(null);

    const res = await updateUserProfile({
      name: editName,
      whatsapp: editWhatsapp,
      email: editEmail,
      businessName: user.role === "partner" ? editBusinessName : undefined,
      neighborhood: user.role === "partner" ? editNeighborhood : undefined,
    });

    setIsSaving(false);
    if (res.success && res.user) {
      setFeedbackMsg({ type: "success", text: "Cadastro atualizado com sucesso!" });
      if (onUserUpdated) onUserUpdated(res.user);
      setTimeout(() => {
        setIsEditing(false);
        setFeedbackMsg(null);
      }, 1200);
    } else {
      setFeedbackMsg({ type: "error", text: res.error || "Não foi possível salvar as alterações." });
    }
  };

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
        <div className="border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 text-2xl font-black text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] shrink-0">
              {user.role === "partner" ? "🏢" : user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-white truncate">{user.name}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold border ${
                    user.role === "partner"
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                      : "bg-purple-500/20 border-purple-500/40 text-purple-300"
                  }`}
                >
                  {user.role === "partner" ? "🏢 Parceiro / Estabelecimento" : "VIP"}
                </span>
              </div>

              {user.businessName && (
                <p className="text-xs font-bold text-cyan-300 truncate mt-0.5">
                  🏛️ {user.businessName} {user.neighborhood ? `• ${user.neighborhood}` : ""}
                </p>
              )}

              <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3 w-3 text-slate-500 shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
              {user.whatsapp && (
                <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                  <Phone className="h-3 w-3 text-slate-500 shrink-0" />
                  <span>{user.whatsapp}</span>
                </p>
              )}
            </div>
          </div>

          {!isEditing ? (
            <div className="mt-3.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setEditName(user.name);
                  setEditWhatsapp(user.whatsapp || "");
                  setEditEmail(user.email || "");
                  setEditBusinessName(user.businessName || "");
                  setEditNeighborhood(user.neighborhood || "");
                  setFeedbackMsg(null);
                }}
                className="flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/15 px-3.5 py-1.5 text-xs font-black text-purple-300 hover:bg-purple-500/25 active:scale-95 transition-all shadow-[0_0_12px_rgba(168,85,247,0.25)] cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Atualizar Meu Cadastro</span>
              </button>
              <span className="text-[11px] text-slate-400">
                Altere seu WhatsApp, nome ou e-mail
              </span>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="mt-4 rounded-2xl border border-purple-500/40 bg-purple-950/20 p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-purple-200">
                    Atualizar Dados do Cadastro
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Salva imediatamente</span>
              </div>

              {feedbackMsg && (
                <div
                  className={`rounded-xl p-2.5 text-xs flex items-center gap-2 ${
                    feedbackMsg.type === "success"
                      ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                      : "border border-rose-500/40 bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {feedbackMsg.type === "success" ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  )}
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              {/* Nome Completo */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    WhatsApp (com DDD)
                  </label>
                  <span className="text-[10px] text-emerald-300 font-semibold">
                    📲 Recebe seus vouchers VIP
                  </span>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Campos de Parceiro */}
              {user.role === "partner" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nome do Estabelecimento / Casa Noturna
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={editBusinessName}
                        onChange={(e) => setEditBusinessName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        placeholder="Ex: Villa Mix, Audio Club..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Bairro / Região
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={editNeighborhood}
                        onChange={(e) => setEditNeighborhood(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        placeholder="Ex: Vila Madalena, Itaim Bibi..."
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Botões do Formulário */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 py-2.5 text-xs font-black text-white hover:brightness-110 active:scale-98 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Salvar Alterações</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFeedbackMsg(null);
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Partner Management Tools (Only for Established Partners) */}
        {user.role === "partner" && (
          <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-purple-950/20 to-black/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                Painel do Estabelecimento Parceiro
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href="/parceiro"
                className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/15 p-2.5 text-xs font-black text-cyan-300 hover:bg-cyan-500/25 active:scale-95 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Painel & Relatórios da Minha Casa</span>
              </a>

              {onOpenRegisterModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRegisterModal();
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/15 p-2.5 text-xs font-black text-purple-300 hover:bg-purple-500/25 active:scale-95 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Cadastrar Local / Evento</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Theme Settings Section (Aparência do App) */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-4 w-4 text-cyan-400" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Aparência do Aplicativo
              </h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400">
              {theme === "dark" ? "🌙 Escuro Original" : "☀️ Tema Claro"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setTheme("dark");
                toast.success("🌙 Tema Escuro Original Ativado!", {
                  description: "Visual noturno padrão de balada ativo.",
                });
              }}
              className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                theme === "dark"
                  ? "border-cyan-400 bg-cyan-950/50 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)] font-black"
                  : "border-white/10 bg-black/20 text-slate-400 hover:text-white"
              }`}
            >
              <Moon className="h-4 w-4 text-cyan-400" />
              <span>Escuro Original</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme("light");
                toast.success("☀️ Tema Claro Ativado!", {
                  description: "Interface com alta visibilidade para o dia.",
                });
              }}
              className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                theme === "light"
                  ? "border-amber-500 bg-amber-50 text-amber-800 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-black"
                  : "border-white/10 bg-black/20 text-slate-400 hover:text-white"
              }`}
            >
              <Sun className="h-4 w-4 text-amber-500" />
              <span>Tema Claro</span>
            </button>
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

        {/* Segurança & Entrada por Digital */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Segurança & Entrada por Digital
              </h4>
            </div>
            {biometricData ? (
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                Ativada
              </span>
            ) : (
              <span className="rounded-full bg-slate-500/20 border border-slate-500/40 px-2 py-0.5 text-[10px] font-black text-slate-400">
                Não configurada
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300">
            {biometricData
              ? `Sua digital está vinculada neste dispositivo (${biometricData.deviceLabel}). Você pode entrar com apenas 1 toque.`
              : "Cadastre sua digital para acessar seus passes VIP e painel com rapidez no celular."}
          </p>

          {bioMsg && (
            <div className="mt-2 text-xs font-semibold text-cyan-300">
              {bioMsg}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            {biometricData ? (
              <button
                onClick={() => {
                  clearStoredBiometrics();
                  clearSavedCredentials();
                  setBiometricData(null);
                  setBioMsg("Digital desvinculada deste dispositivo.");
                  setTimeout(() => setBioMsg(""), 3000);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remover Digital deste Aparelho</span>
              </button>
            ) : (
              <button
                onClick={async () => {
                  setBioLoading(true);
                  setBioMsg("");
                  const res = await registerDeviceBiometrics(user);
                  setBioLoading(false);
                  if (res.success) {
                    setBiometricData(getStoredBiometrics());
                    setBioMsg("Digital cadastrada com sucesso!");
                  } else {
                    setBioMsg(res.error || "Não foi possível cadastrar a digital.");
                  }
                  setTimeout(() => setBioMsg(""), 4000);
                }}
                disabled={bioLoading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-3.5 py-2 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
              >
                <Fingerprint className="h-4 w-4" />
                <span>{bioLoading ? "Lendo sensor..." : "Cadastrar Minha Digital Agora"}</span>
              </button>
            )}
          </div>
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
