import React, { useState, useEffect, useRef } from "react";
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
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const [persona, setPersona] = useState<"client" | "partner">(defaultPersona);
  const [tab, setTab] = useState<"login" | "register">(defaultTab);

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => {
      modalScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

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
  const [showManualLogin, setShowManualLogin] = useState(true);

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
      setShowManualLogin(true);
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
  const handleStartPhoneVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || name.trim().length < 3) {
      showError("Por favor, digite seu nome completo (mínimo 3 letras).");
      return;
    }

    if (persona === "partner" && !businessName.trim()) {
      showError("Por favor, digite o nome do seu estabelecimento.");
      return;
    }

    const digitsPhone = whatsapp.replace(/\D/g, "");
    if (digitsPhone.length < 10) {
      showError("Por favor, digite seu número de WhatsApp completo com DDD (ex: 11 98765-4321).");
      return;
    }

    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      showError("Por favor, digite um e-mail válido (ex: seuemail@exemplo.com).");
      return;
    }

    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length === 0) {
      showError("Por favor, informe seu CPF. Ele é obrigatório para as listas VIP e benefícios.");
      return;
    }
    if (cleanCpf.length !== 11) {
      showError("O CPF deve conter todos os 11 dígitos numéricos.");
      return;
    }

    if (!password || password.length < 6) {
      showError("A senha de acesso deve conter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      showError("As senhas digitadas não coincidem. Digite a mesma senha nos dois campos.");
      return;
    }

    // Gerar código de 6 dígitos e link de contingência
    const code = generateOtpCode();
    setGeneratedOtp(code);

    const ddiPhone = digitsPhone.startsWith("55") ? digitsPhone : "55" + digitsPhone;
    const directLink = `https://api.whatsapp.com/send?phone=${ddiPhone}&text=${encodeURIComponent(
      `Olá, meu código de validação no Radar do Rolê é: ${code}`
    )}`;
    setDirectWaLink(directLink);

    // Avança imediatamente para a tela de validação sem travar a interface
    setRegisterStep("verify_phone");
    setResendTimer(30);
    setInputOtp("");

    // Dispara envio do código via WhatsApp em segundo plano
    setSendingOtp(true);
    sendPhoneVerificationCode(whatsapp, name, code)
      .then((otpRes) => {
        if (otpRes?.directWaLink) setDirectWaLink(otpRes.directWaLink);
      })
      .catch((err) => console.warn("Erro ao disparar WhatsApp OTP:", err))
      .finally(() => setSendingOtp(false));
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
    <div
      role="dialog"
      aria-modal="true"
      className="auth-modal-container auth-gate-allow fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 transition-all animate-in fade-in duration-200"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div
        ref={modalScrollRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-cyan-500/30 bg-[#0c101c] p-5 sm:p-6 text-slate-100 shadow-[0_0_50px_-10px_rgba(0,240,255,0.4)] z-10 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          type="button"
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer z-30"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pr-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-fuchsia-600 text-2xl shadow-[0_0_25px_-5px_rgba(0,240,255,0.6)]">
            {tab === "login" ? "🔑" : persona === "client" ? "🪩" : "🏢"}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
              {tab === "register"
                ? registerStep === "verify_phone"
                  ? "Validar Celular"
                  : persona === "partner"
                  ? "Cadastrar Estabelecimento"
                  : "Criar Conta de Baladeiro"
                : "Acessar Radar do Rolê"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {tab === "register"
                ? registerStep === "verify_phone"
                  ? "Confirme o código de segurança enviado para seu celular"
                  : persona === "partner"
                  ? "Cadastre sua casa noturna, bar ou restaurante parceiro"
                  : "Cadastre-se para liberar listas VIP, descontos e reservas"
                : "Entre com seu e-mail e senha cadastrados"}
            </p>
          </div>
        </div>

        {/* 1. MAIN ACTION TABS: Entrar vs Criar Conta */}
        {registerStep === "fill_data" && (
          <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-black/60 p-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setErrorMsg("");
                setRegisterStep("fill_data");
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition-all cursor-pointer ${
                tab === "login"
                  ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(0,240,255,0.4)] border border-cyan-400/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <span>🔑 Já tenho conta (Entrar)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setErrorMsg("");
                setRegisterStep("fill_data");
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition-all cursor-pointer ${
                tab === "register"
                  ? "bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 text-white shadow-[0_0_20px_rgba(255,0,127,0.4)] border border-fuchsia-400/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <span>✨ Criar nova conta</span>
            </button>
          </div>
        )}

        {/* 2. SELECT PERSONA (Apenas na etapa de cadastro 'register') */}
        {tab === "register" && registerStep === "fill_data" && (
          <div className="mt-3.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Selecione seu perfil de cadastro:
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5">
              <button
                type="button"
                onClick={() => {
                  setPersona("client");
                  setErrorMsg("");
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-black transition-all cursor-pointer ${
                  persona === "client"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <PartyPopper className="h-4 w-4 shrink-0 text-cyan-400" />
                <span>Sou Baladeiro</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPersona("partner");
                  setErrorMsg("");
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-black transition-all cursor-pointer ${
                  persona === "partner"
                    ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/50 shadow-[0_0_15px_rgba(255,0,127,0.3)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Building2 className="h-4 w-4 shrink-0 text-fuchsia-400" />
                <span>Estabelecimento</span>
              </button>
            </div>
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
          <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3.5 animate-in fade-in">
            {getStoredBiometrics() && (
              <button
                type="button"
                onClick={handleBiometricLogin}
                disabled={biometricLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-cyan-950/40 py-2.5 px-4 text-xs font-bold text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-300 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.2)] mb-1"
              >
                <Fingerprint className="h-4 w-4 text-cyan-400" />
                <span>{biometricLoading ? "Lendo biometria..." : "Entrar com Digital / Face ID"}</span>
              </button>
            )}

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
              <label className="text-[11px] font-bold text-slate-300 mb-1 block">Senha de Acesso *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-11 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:bg-white/10 focus:outline-none transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 text-slate-400 hover:text-cyan-400 focus:outline-none cursor-pointer flex items-center justify-center transition-colors"
                  title={showPassword ? "Ocultar senha" : "Ver senha"}
                  aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
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

            {/* Mensagem de Erro destacada acima do botão */}
            {errorMsg && (
              <div className="rounded-xl border border-rose-500/50 bg-rose-500/20 p-3 text-xs font-bold text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-sm font-black text-white transition-all shadow-lg cursor-pointer bg-gradient-to-r from-cyan-600 via-cyan-500 to-fuchsia-600 hover:brightness-110 active:scale-95 shadow-[0_0_25px_rgba(0,240,255,0.4)]"
            >
              <span>{loading ? "Entrando..." : "Entrar no Radar do Rolê"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : registerStep === "fill_data" ? (
          /* VIEW 2: CADASTRO - ETAPA 1 (DADOS PESSOAIS + CPF) */
          <form onSubmit={handleStartPhoneVerification} className="mt-4 space-y-3">
            {persona === "partner" && (
              <>
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

                {/* Categoria do Local */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                    Categoria da Casa / Local *
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setVenueCategory("baladas")}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex flex-col items-center gap-1 ${
                        venueCategory === "baladas"
                          ? "bg-fuchsia-500/25 border-fuchsia-400 text-white shadow-[0_0_15px_rgba(255,0,127,0.3)]"
                          : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="text-sm">🪩</span>
                      <span>Balada</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVenueCategory("restaurantes")}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex flex-col items-center gap-1 ${
                        venueCategory === "restaurantes"
                          ? "bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                          : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="text-sm">🍸</span>
                      <span>Bar / Rest.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVenueCategory("moteis")}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex flex-col items-center gap-1 ${
                        venueCategory === "moteis"
                          ? "bg-purple-500/25 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                          : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="text-sm">🏩</span>
                      <span>Motel</span>
                    </button>
                  </div>
                </div>

                {/* Bairro em SP */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                    Bairro em São Paulo *
                  </label>
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#121829] py-2.5 px-3 text-sm text-white focus:border-fuchsia-400 focus:outline-none transition-all cursor-pointer"
                  >
                    {NEIGHBORHOODS.map((n) => (
                      <option key={n.name} value={n.name} className="bg-[#0c101c] text-white">
                        📍 {n.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
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
              {cpf.replace(/\D/g, "").length === 11 && (
                <div className="mt-1 text-[11px] font-bold">
                  {validateCPF(cpf) ? (
                    <span className="text-emerald-400">✓ CPF válido</span>
                  ) : (
                    <span className="text-rose-400">⚠️ CPF inválido. Verifique os dígitos digitados.</span>
                  )}
                </div>
              )}
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
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-11 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 text-slate-400 hover:text-cyan-400 focus:outline-none cursor-pointer flex items-center justify-center transition-colors"
                    title={showPassword ? "Ocultar senha" : "Ver senha"}
                    aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                    className={`w-full rounded-xl border bg-white/5 py-2.5 pl-10 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${
                      confirmPassword && confirmPassword === password
                        ? "border-emerald-500/60 focus:border-emerald-400"
                        : "border-white/15 focus:border-cyan-400"
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 text-slate-400 hover:text-cyan-400 focus:outline-none cursor-pointer flex items-center justify-center transition-colors"
                    title={showConfirmPassword ? "Ocultar confirmação de senha" : "Ver senha"}
                    aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Ver senha"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {confirmPassword && (
              <div className="text-[11px] font-bold">
                {password === confirmPassword ? (
                  <span className="text-emerald-400">✓ Senhas conferem</span>
                ) : (
                  <span className="text-rose-400">⚠️ As senhas não coincidem</span>
                )}
              </div>
            )}

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

            {/* Mensagem de Erro destacada acima do botão para nunca ficar oculta no scroll */}
            {errorMsg && (
              <div className="rounded-xl border border-rose-500/50 bg-rose-500/20 p-3 text-xs font-bold text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

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
