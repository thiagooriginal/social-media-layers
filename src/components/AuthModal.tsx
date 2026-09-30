import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  PartyPopper,
  MapPin,
  TrendingUp,
  Tag,
  Store,
  Fingerprint,
  Check,
} from "lucide-react";
import {
  loginUser,
  registerUser,
  UserProfile,
  getSavedCredentials,
  saveCredentials,
  clearSavedCredentials,
  SavedCredentials,
} from "../services/authService";
import {
  authenticateWithBiometrics,
  registerDeviceBiometrics,
  getStoredBiometrics,
  isBiometricsSupported,
} from "../services/biometricService";
import { NEIGHBORHOODS } from "../data/venues";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  defaultTab?: "login" | "register";
  defaultPersona?: "client" | "partner";
}

// Utility to mask WhatsApp numbers: (11) 98765-4321
function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = "register",
  defaultPersona = "client",
}: AuthModalProps) {
  const [persona, setPersona] = useState<"client" | "partner">(defaultPersona);
  const [tab, setTab] = useState<"login" | "register">(defaultTab);

  // Common Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");

  // Partner Specific Fields
  const [businessName, setBusinessName] = useState("");
  const [venueCategory, setVenueCategory] = useState<"baladas" | "restaurantes" | "moteis">("baladas");
  const [neighborhood, setNeighborhood] = useState(NEIGHBORHOODS[0].name);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Saved credentials & Biometric State
  const [rememberMe, setRememberMe] = useState(true);
  const [enableBiometrics, setEnableBiometrics] = useState(true);
  const [savedCreds, setSavedCreds] = useState<SavedCredentials | null>(() => getSavedCredentials());
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [showManualLogin, setShowManualLogin] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSavedCredentials();
      setSavedCreds(creds);
      if (creds?.email && !email) {
        setEmail(creds.email);
      }

      // Auto-trigger biometric prompt like a bank app when login tab is opened
      if (tab === "login") {
        setShowManualLogin(false);
        const timer = setTimeout(() => {
          handleBiometricLogin();
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, tab]);

  const handleBiometricLogin = async () => {
    setErrorMsg("");
    setBiometricLoading(true);
    const res = await authenticateWithBiometrics(persona === "partner" ? "partner" : undefined);
    setBiometricLoading(false);

    if (res.success && res.user) {
      setBiometricSuccess(true);
      setTimeout(() => {
        onSuccess(res.user!);
        onClose();
      }, 400);
    } else {
      if (res.error && !res.error.toLowerCase().includes("cancelada")) {
        setErrorMsg(res.error);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (tab === "register") {
      if (!name.trim()) {
        setErrorMsg(
          persona === "client"
            ? "Por favor, digite seu nome completo."
            : "Por favor, digite o nome do responsável."
        );
        return;
      }

      if (persona === "partner" && !businessName.trim()) {
        setErrorMsg("Por favor, digite o nome do seu estabelecimento.");
        return;
      }

      if (!email.trim() || !email.includes("@")) {
        setErrorMsg("Por favor, digite um e-mail válido.");
        return;
      }

      const digits = whatsapp.replace(/\D/g, "");
      if (digits.length < 10) {
        setErrorMsg("Por favor, digite um WhatsApp válido com DDD.");
        return;
      }

      setLoading(true);
      const res = await registerUser({
        name,
        email,
        whatsapp,
        password,
        role: persona === "partner" ? "partner" : "user",
        businessName: persona === "partner" ? businessName : undefined,
        venueCategory: persona === "partner" ? venueCategory : undefined,
        neighborhood: persona === "partner" ? neighborhood : undefined,
      });
      setLoading(false);

      if (res.success && res.user) {
        if (rememberMe) {
          saveCredentials({
            email: res.user.email,
            name: res.user.name,
            role: res.user.role,
            businessName: res.user.businessName,
            rememberMe: true,
            biometricsEnabled: enableBiometrics,
          });
          if (enableBiometrics) {
            registerDeviceBiometrics(res.user);
          }
        }
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || "Erro ao criar conta.");
      }
    } else {
      // Login Flow
      if (!email.trim() || !email.includes("@")) {
        setErrorMsg("Por favor, digite seu e-mail cadastrado.");
        return;
      }

      setLoading(true);
      const res = await loginUser(email, password);
      setLoading(false);

      if (res.success && res.user) {
        if (rememberMe) {
          saveCredentials({
            email: res.user.email,
            name: res.user.name,
            role: res.user.role,
            businessName: res.user.businessName,
            rememberMe: true,
            biometricsEnabled: enableBiometrics,
          });
          if (enableBiometrics) {
            registerDeviceBiometrics(res.user);
          }
        }
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || "Erro ao entrar na conta.");
      }
    }
  };

  // 1-Click Quick Demo accounts for testing
  const handleQuickDemo = async (roleToUse: "client" | "partner") => {
    setLoading(true);
    if (roleToUse === "partner") {
      const res = await registerUser({
        name: "Gerente Vila JK",
        email: "gestao.vilajk@baladaon.com.br",
        whatsapp: "(11) 99999-8888",
        role: "partner",
        businessName: "Vila JK São Paulo",
        venueCategory: "baladas",
        neighborhood: "Itaim Bibi",
      });
      setLoading(false);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      }
    } else {
      const res = await registerUser({
        name: "Baladeiro VIP",
        email: "vip@radardorole.com.br",
        whatsapp: "(11) 98765-4321",
        role: "user",
      });
      setLoading(false);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 transition-all animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-cyan-500/30 bg-[#0c101c] p-5 sm:p-6 text-slate-100 shadow-[0_0_50px_-10px_rgba(0,240,255,0.4)] z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pr-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-fuchsia-600 text-2xl shadow-[0_0_25px_-5px_rgba(0,240,255,0.6)]">
            {persona === "client" ? "🪩" : "🏢"}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
              {tab === "register" ? "Criar Conta Oficial" : "Acessar Radar do Rolê"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {persona === "client"
                ? "Entre para emitir listas VIPs e salvar favoritos"
                : "Portal exclusivo para donos e gestores de locais"}
            </p>
          </div>
        </div>

        {/* 1. SELECT PERSONA: Baladeiro (Cliente) vs Estabelecimento (Parceiro) */}
        <div className="mt-5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
            Selecione o seu perfil de acesso:
          </label>
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5">
            <button
              type="button"
              onClick={() => {
                setPersona("client");
                setErrorMsg("");
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-black transition-all ${
                persona === "client"
                  ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(0,240,255,0.5)] border border-cyan-400/40"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <PartyPopper className="h-4 w-4 shrink-0" />
              <span>Sou Baladeiro</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPersona("partner");
                setErrorMsg("");
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-black transition-all ${
                persona === "partner"
                  ? "bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 text-white shadow-[0_0_20px_rgba(255,0,127,0.5)] border border-fuchsia-400/40"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Building2 className="h-4 w-4 shrink-0" />
              <span>Estabelecimento</span>
            </button>
          </div>
        </div>

        {/* 2. SELECT ACTION: Entrar vs Criar Conta */}
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-black/40 p-1">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErrorMsg("");
            }}
            className={`rounded-lg py-2 text-xs font-bold transition-all ${
              tab === "login"
                ? "bg-white/15 text-white shadow-sm font-black"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Já tenho conta (Entrar)
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setErrorMsg("");
            }}
            className={`rounded-lg py-2 text-xs font-bold transition-all ${
              tab === "register"
                ? "bg-white/15 text-white shadow-sm font-black"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Criar nova conta
          </button>
        </div>

        {/* Benefits Highlight Banner */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent p-3 text-xs">
          {persona === "client" ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>Confirme presença ("Eu Vou") e entre na Lista VIP com 1 clique</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-fuchsia-400 shrink-0" />
                <span>Histórico de passes e favoritos sincronizados no celular</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-fuchsia-300 font-bold">
                <TrendingUp className="h-3.5 w-3.5 text-fuchsia-400 shrink-0" />
                <span>Painel de métricas e leads da Lista VIP em tempo real</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>Página verificada para receber reservas e clientes do WhatsApp</span>
              </div>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300 animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {/* VIEW 1: BANK-STYLE BIOMETRIC SCREEN (When in login tab & !showManualLogin) */}
        {tab === "login" && !showManualLogin ? (
          <div className="mt-4 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0c1322] via-[#090d18] to-[#070a12] p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header Persona Badge */}
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <span className="rounded-full bg-cyan-500/15 border border-cyan-400/30 px-2.5 py-0.5 text-[10px] font-black text-cyan-300 uppercase tracking-wider">
                {persona === "partner" ? "Acesso de Estabelecimento" : "Acesso de Baladeiro VIP"}
              </span>
            </div>

            {/* Avatar / Account identification */}
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-600 to-fuchsia-600 text-2xl font-black text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] mb-2">
              {savedCreds?.name ? savedCreds.name[0].toUpperCase() : persona === "partner" ? "🏢" : "👤"}
              {savedCreds && (
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-[#0c1322]" />
              )}
            </div>

            <h3 className="text-lg font-black text-white">
              Olá, {savedCreds?.name || (persona === "partner" ? "Gestor Parceiro" : "Baladeiro VIP")}!
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs mx-auto">
              {savedCreds?.email || email || "Identificação Biométrica Rápida"}
            </p>

            {/* Pulsing Bank Scanner Fingerprint Sensor */}
            <div className="my-7 flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={handleBiometricLogin}
                disabled={biometricLoading}
                className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-cyan-400/60 bg-cyan-950/40 hover:bg-cyan-900/50 hover:border-cyan-300 active:scale-95 transition-all shadow-[0_0_35px_rgba(6,182,212,0.4)] cursor-pointer group"
                title="Toque para validar a digital"
              >
                {/* Glowing Radar Sonar Rings */}
                <span className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-60" />
                <span className="absolute -inset-2.5 rounded-full border border-purple-500/30 animate-pulse" />

                {biometricSuccess ? (
                  <div className="flex flex-col items-center justify-center text-emerald-400">
                    <Check className="h-12 w-12 stroke-[3]" />
                  </div>
                ) : (
                  <Fingerprint
                    className={`h-12 w-12 text-cyan-400 group-hover:scale-110 transition-transform ${
                      biometricLoading ? "animate-pulse text-cyan-200 scale-110" : ""
                    }`}
                  />
                )}
              </button>

              <div className="mt-4">
                <span className="text-xs font-black text-cyan-300 block">
                  {biometricLoading
                    ? "Toque no sensor do seu celular..."
                    : biometricSuccess
                    ? "Digital validada! Entrando..."
                    : "Toque na digital para entrar"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Igual ao seu banco: impressão digital ou Face ID
                </span>
              </div>
            </div>

            {/* Alternative Actions */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                type="button"
                onClick={() => setShowManualLogin(true)}
                className="w-full py-2.5 px-3 rounded-xl border border-white/15 bg-white/5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                Entrar com e-mail e senha
              </button>

              <button
                type="button"
                onClick={() => {
                  clearSavedCredentials();
                  setSavedCreds(null);
                  setEmail("");
                  setShowManualLogin(true);
                }}
                className="text-[11px] text-slate-400 hover:text-rose-400 underline block mx-auto cursor-pointer"
              >
                Entrar com outra conta
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: MANUAL FORM (Register or Manual Password Login) */
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {tab === "login" && showManualLogin && (
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">Acesso manual com senha</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowManualLogin(false);
                    handleBiometricLogin();
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
                >
                  <Fingerprint className="h-3.5 w-3.5" />
                  <span>Voltar para a Digital</span>
                </button>
              </div>
            )}

          {tab === "register" && (
            <>
              {/* If Partner: Business Name */}
              {persona === "partner" && (
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                    Nome do Estabelecimento / Casa Noturna *
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fuchsia-400" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Ex: Vila JK, D-Edge, Tatu Bola..."
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-fuchsia-400 focus:bg-white/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                  {persona === "client" ? "Seu Nome Completo *" : "Nome do Responsável / Promoter *"}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Thiago Silva"
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:bg-white/10 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                  {persona === "client" ? "Seu WhatsApp com DDD *" : "WhatsApp Comercial / Portaria *"}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                    placeholder="(11) 98765-4321"
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:bg-white/10 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* If Partner: Category & Neighborhood */}
              {persona === "partner" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                      Categoria *
                    </label>
                    <select
                      value={venueCategory}
                      onChange={(e) => setVenueCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-white/15 bg-[#121829] py-2.5 px-3 text-xs text-white focus:border-fuchsia-400 focus:outline-none"
                    >
                      <option value="baladas">🪩 Balada / Casa Noturna</option>
                      <option value="restaurantes">🍸 Bar / Restaurante</option>
                      <option value="moteis">🔥 Motel / Design</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                      Bairro em SP *
                    </label>
                    <select
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-[#121829] py-2.5 px-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    >
                      {NEIGHBORHOODS.map((n) => (
                        <option key={n.name} value={n.name}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 mb-1 block">
              {persona === "client" ? "Seu E-mail *" : "E-mail Corporativo *"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:bg-white/10 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 mb-1 block">
              Senha de Acesso {tab === "register" ? "(Mínimo 6 caracteres)" : ""} *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:bg-white/10 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Checkboxes: Salvar Login & Biometria */}
          <div className="space-y-2 pt-1 pb-1">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-500"
              />
              <span>Salvar meu login neste aparelho</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enableBiometrics}
                onChange={(e) => setEnableBiometrics(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-500"
              />
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Fingerprint className="h-3.5 w-3.5" />
                Habilitar entrada com digital (Biometria)
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-sm font-black text-white transition-all shadow-lg cursor-pointer ${
              persona === "client"
                ? "bg-gradient-to-r from-cyan-600 via-cyan-500 to-fuchsia-600 hover:brightness-110 active:scale-95 shadow-[0_0_25px_rgba(0,240,255,0.4)]"
                : "bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:brightness-110 active:scale-95 shadow-[0_0_25px_rgba(255,0,127,0.4)]"
            } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <span>
              {loading
                ? "Processando..."
                : tab === "register"
                ? persona === "client"
                  ? "Cadastrar e Liberar Listas VIP"
                  : "Cadastrar Estabelecimento"
                : "Entrar no Radar do Rolê"}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
        )}

        {/* Quick Demo Access (1-Click Test) */}
        <div className="mt-5 border-t border-white/10 pt-4">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ⚡ Acesso Rápido para Demonstração (1 Toque)
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("client")}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/30 py-2 px-2.5 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all cursor-pointer"
            >
              <span>🪩 Demo Baladeiro VIP</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("partner")}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/30 py-2 px-2.5 text-[11px] font-bold text-fuchsia-300 hover:bg-fuchsia-500/20 hover:border-fuchsia-400 transition-all cursor-pointer"
            >
              <span>🏢 Demo Estabelecimento</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
