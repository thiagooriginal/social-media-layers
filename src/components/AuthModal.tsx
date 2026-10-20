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
  TrendingUp,
  Store,
  Fingerprint,
  Check,
  Eye,
  EyeOff,
  CreditCard,
  Smartphone,
  RefreshCw,
  ExternalLink,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import {
  loginUser,
  registerUser,
  UserProfile,
  getSavedCredentials,
  saveCredentials,
  clearSavedCredentials,
  SavedCredentials,
  formatCPF,
  validateCPF,
} from "../services/authService";
import {
  authenticateWithBiometrics,
  registerDeviceBiometrics,
  getStoredBiometrics,
  isBiometricsSupported,
} from "../services/biometricService";
import {
  generateOtpCode,
  sendPhoneVerificationCode,
} from "../services/phoneVerificationService";
import { NEIGHBORHOODS } from "../data/venues";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  defaultTab?: "login" | "register";
  defaultPersona?: "client" | "partner";
  isGateMode?: boolean;
}

// Utilitário para máscara de WhatsApp: (11) 98765-4321
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
  isGateMode = false,
}: AuthModalProps) {
  const [persona, setPersona] = useState<"client" | "partner">(defaultPersona);
  const [tab, setTab] = useState<"login" | "register">(defaultTab);

  // Common Registration Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Partner Specific Fields
  const [businessName, setBusinessName] = useState("");
  const [venueCategory, setVenueCategory] = useState<"baladas" | "restaurantes" | "moteis">("baladas");
  const [neighborhood, setNeighborhood] = useState(NEIGHBORHOODS[0].name);

  // Phone Verification OTP State
  const [registerStep, setRegisterStep] = useState<"fill_data" | "verify_phone">("fill_data");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [inputOtp, setInputOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [directWaLink, setDirectWaLink] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Saved credentials & Biometric State
  const [rememberMe, setRememberMe] = useState(true);
  const [enableBiometrics, setEnableBiometrics] = useState(true);
  const [savedCreds, setSavedCreds] = useState<SavedCredentials | null>(() => getSavedCredentials());
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [showManualLogin, setShowManualLogin] = useState(false);

  // Countdown timer para reenvio do código
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (isOpen) {
      const creds = getSavedCredentials();
      setSavedCreds(creds);
      if (creds?.email && !email) {
        setEmail(creds.email);
      }

      const hasRealBio = Boolean(getStoredBiometrics());
      if (tab === "login") {
        setShowManualLogin(!hasRealBio);
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
      setBiometricSuccess(false);
      setErrorMsg(res.error || "Leitura biométrica cancelada ou não reconhecida.");
    }
  };

  if (!isOpen) return null;

  // 1. Etapa 1: Validação dos dados preenchidos e disparo do código SMS/WhatsApp
  const handleStartPhoneVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || name.trim().length < 3) {
      setErrorMsg("Por favor, digite seu nome completo (mínimo 3 letras).");
      return;
    }

    if (persona === "partner" && !businessName.trim()) {
      setErrorMsg("Por favor, digite o nome do seu estabelecimento.");
      return;
    }

    const digitsPhone = whatsapp.replace(/\D/g, "");
    if (digitsPhone.length < 10) {
      setErrorMsg("Por favor, digite um número de celular/WhatsApp válido com DDD.");
      return;
    }

    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setErrorMsg("Por favor, digite um e-mail válido.");
      return;
    }

    const cleanCpf = cpf.replace(/\D/g, "");
    if (!validateCPF(cleanCpf)) {
      setErrorMsg("Por favor, digite um CPF válido. O CPF é obrigatório para sua lista VIP.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("A senha de acesso deve conter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("As senhas digitadas não coincidem. Digite a mesma senha nos dois campos.");
      return;
    }

    // Gerar código de 6 dígitos e disparar mensagem
    setSendingOtp(true);
    const code = generateOtpCode();
    setGeneratedOtp(code);

    const otpRes = await sendPhoneVerificationCode(whatsapp, name, code);
    setSendingOtp(false);

    setDirectWaLink(otpRes.directWaLink);
    setRegisterStep("verify_phone");
    setResendTimer(30);
    setInputOtp("");
  };

  // Reenviar código
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setErrorMsg("");
    setSendingOtp(true);
    const code = generateOtpCode();
    setGeneratedOtp(code);

    const otpRes = await sendPhoneVerificationCode(whatsapp, name, code);
    setSendingOtp(false);

    setDirectWaLink(otpRes.directWaLink);
    setResendTimer(30);
  };

  // 2. Etapa 2: Validar código digitado e efetivar cadastro
  const handleConfirmOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanCode = inputOtp.trim().replace(/\D/g, "");
    if (cleanCode.length !== 6) {
      setErrorMsg("Digite o código completo de 6 dígitos que enviamos para o seu celular.");
      return;
    }

    if (cleanCode !== generatedOtp) {
      setErrorMsg("Código incorreto. Verifique a mensagem no seu celular e tente novamente.");
      return;
    }

    // Código validado com sucesso! Efetuar registro no Supabase
    setLoading(true);
    const res = await registerUser({
      name: name.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      cpf: formatCPF(cpf),
      phoneVerified: true,
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
      setErrorMsg(res.error || "Erro ao criar conta. Tente novamente.");
    }
  };

  // 3. Login Flow
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Por favor, digite seu e-mail cadastrado.");
      return;
    }

    if (!password) {
      setErrorMsg("Por favor, digite sua senha de acesso.");
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

        {/* Gate Mode Warning Pill */}
        {isGateMode && (
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] font-black text-amber-300">
            <Lock className="h-3 w-3 text-amber-400 animate-pulse" />
            <span>Cadastro Obrigatório para Navegar</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center gap-3 pr-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-fuchsia-600 text-2xl shadow-[0_0_25px_-5px_rgba(0,240,255,0.6)]">
            {persona === "client" ? "🪩" : "🏢"}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
              {tab === "register"
                ? registerStep === "verify_phone"
                  ? "Validar Celular"
                  : "Criar Conta Oficial"
                : "Acessar Radar do Rolê"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {tab === "register"
                ? registerStep === "verify_phone"
                  ? "Confirme o código de segurança enviado para seu celular"
                  : "Cadastre-se para liberar listas VIP, descontos e reservas"
                : "Entre com suas credenciais ou biometria cadastrada"}
            </p>
          </div>
        </div>

        {/* 1. SELECT PERSONA (Apenas na etapa de preenchimento) */}
        {registerStep === "fill_data" && (
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
        )}

        {/* 2. SELECT ACTION: Entrar vs Criar Conta (Apenas na etapa de preenchimento) */}
        {registerStep === "fill_data" && (
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-black/40 p-1">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setErrorMsg("");
                setRegisterStep("fill_data");
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
                setRegisterStep("fill_data");
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
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300 animate-in fade-in flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* VIEW 1: LOGIN FLOW */}
        {tab === "login" ? (
          !showManualLogin ? (
            <div className="mt-4 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0c1322] via-[#090d18] to-[#070a12] p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center gap-1.5 mb-3">
                <span className="rounded-full bg-cyan-500/15 border border-cyan-400/30 px-2.5 py-0.5 text-[10px] font-black text-cyan-300 uppercase tracking-wider">
                  {persona === "partner" ? "Acesso de Estabelecimento" : "Acesso de Baladeiro VIP"}
                </span>
              </div>

              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-600 to-fuchsia-600 text-2xl font-black text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] mb-2">
                {savedCreds?.name ? savedCreds.name[0].toUpperCase() : persona === "partner" ? "🏢" : "👤"}
              </div>

              <h3 className="text-lg font-black text-white">
                Olá, {savedCreds?.name || (persona === "partner" ? "Gestor Parceiro" : "Baladeiro VIP")}!
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs mx-auto">
                {savedCreds?.email || email || "Identificação Biométrica Rápida"}
              </p>

              <div className="my-7 flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={biometricLoading}
                  className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-cyan-400/60 bg-cyan-950/40 hover:bg-cyan-900/50 hover:border-cyan-300 active:scale-95 transition-all shadow-[0_0_35px_rgba(6,182,212,0.4)] cursor-pointer group"
                >
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
                    {biometricLoading ? "Toque no sensor do seu celular..." : "Toque na digital para entrar"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowManualLogin(true)}
                className="text-xs text-slate-400 hover:text-cyan-400 transition-colors underline cursor-pointer"
              >
                Entrar digitando e-mail e senha
              </button>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-1 block">Seu E-mail *</label>
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

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Senha de Acesso *</label>
                  {password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span>{showPassword ? "Ocultar" : "Visualizar"}</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:bg-white/10 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1 pb-1">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-500"
                  />
                  <span>Salvar login neste aparelho</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-sm font-black text-white transition-all shadow-lg cursor-pointer bg-gradient-to-r from-cyan-600 via-cyan-500 to-fuchsia-600 hover:brightness-110 active:scale-95 shadow-[0_0_25px_rgba(0,240,255,0.4)]"
              >
                <span>{loading ? "Entrando..." : "Entrar no Radar do Rolê"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {getStoredBiometrics() && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowManualLogin(false)}
                    className="text-xs text-cyan-400 hover:underline cursor-pointer"
                  >
                    ← Voltar para entrada por Digital
                  </button>
                </div>
              )}
            </form>
          )
        ) : registerStep === "fill_data" ? (
          /* VIEW 2: CADASTRO - ETAPA 1 (DADOS PESSOAIS + CPF) */
          <form onSubmit={handleStartPhoneVerification} className="mt-4 space-y-3">
            {persona === "partner" && (
              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                  Nome do Estabelecimento *
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

            {/* Nome Completo */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                {persona === "client" ? "Seu Nome Completo *" : "Nome do Responsável *"}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Thiago Silva Santos"
                  className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:bg-white/10 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Celular / WhatsApp */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>{persona === "client" ? "Celular / WhatsApp com DDD *" : "WhatsApp da Casa *"}</span>
                <span className="text-[10px] text-cyan-400 font-normal">Receberá código de confirmação</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                  placeholder="(11) 98765-4321"
                  className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:bg-white/10 focus:outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* CPF com Máscara e Validação */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>CPF do Titular *</span>
                <span className="text-[10px] text-slate-400 font-normal">Necessário para portaria e lista VIP</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:bg-white/10 focus:outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 mb-1 block">Seu E-mail *</label>
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

            {/* Senha e Confirmação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-1 block">Senha (Mín. 6) *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-9 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-1 block">Confirmar Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className={`w-full rounded-xl border bg-white/5 py-2.5 pl-10 pr-9 text-sm text-white placeholder-slate-500 focus:outline-none ${
                      confirmPassword && confirmPassword === password
                        ? "border-emerald-500/60 focus:border-emerald-400"
                        : "border-white/15 focus:border-cyan-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
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
                <span>Salvar login no aparelho para não precisar digitar novamente</span>
              </label>
            </div>

            {/* Botão de Avançar para Validação */}
            <button
              type="submit"
              disabled={sendingOtp}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-sm font-black text-white transition-all shadow-lg cursor-pointer bg-gradient-to-r from-cyan-600 via-cyan-500 to-fuchsia-600 hover:brightness-110 active:scale-95 shadow-[0_0_30px_rgba(0,240,255,0.4)]"
            >
              <span>{sendingOtp ? "Enviando código para o celular..." : "Avançar e Validar Celular 📲"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          /* VIEW 3: CADASTRO - ETAPA 2 (VALIDAÇÃO DO CELULAR COM CÓDIGO DE 6 DÍGITOS) */
          <form onSubmit={handleConfirmOtpAndRegister} className="mt-4 space-y-4 animate-in fade-in">
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/40 to-transparent p-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] mb-3">
                <Smartphone className="h-7 w-7" />
              </div>
              <h4 className="text-base font-black text-white">Código de Verificação</h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                Enviamos uma mensagem com seu código de 6 dígitos para o número:
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3.5 py-1 text-xs font-black text-cyan-300 font-mono">
                <span>{formatPhone(whatsapp)}</span>
              </div>
            </div>

            {/* Input do Código OTP */}
            <div>
              <label className="text-center text-xs font-bold text-slate-300 mb-2 block">
                Digite o código de 6 dígitos recebido:
              </label>
              <div className="relative max-w-xs mx-auto">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400" />
                <input
                  type="text"
                  autoFocus
                  maxLength={6}
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] text-2xl font-black rounded-2xl border-2 border-cyan-400/50 bg-[#080d1a] py-3.5 pl-10 pr-4 text-cyan-300 placeholder-slate-700 focus:border-cyan-300 focus:bg-black focus:outline-none transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] font-mono"
                />
              </div>
            </div>

            {/* Ações de Reenvio e Contingência */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || sendingOtp}
                className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                  resendTimer > 0
                    ? "text-slate-500 cursor-not-allowed"
                    : "text-cyan-400 hover:text-cyan-300 underline"
                }`}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${sendingOtp ? "animate-spin" : ""}`} />
                <span>
                  {resendTimer > 0 ? `Reenviar código em ${resendTimer}s` : "Reenviar código"}
                </span>
              </button>

              {directWaLink && (
                <a
                  href={directWaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Abrir no WhatsApp</span>
                </a>
              )}
            </div>

            {/* Botão de Finalizar */}
            <button
              type="submit"
              disabled={loading || inputOtp.trim().length !== 6}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-sm font-black text-white transition-all shadow-lg cursor-pointer ${
                inputOtp.trim().length === 6
                  ? "bg-gradient-to-r from-emerald-600 via-cyan-500 to-fuchsia-600 hover:brightness-110 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-60"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{loading ? "Liberando aplicativo..." : "Confirmar Código e Liberar App 🚀"}</span>
            </button>

            {/* Voltar para editar dados */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setRegisterStep("fill_data");
                  setErrorMsg("");
                }}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                ← Corrigir número de celular ou dados
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
