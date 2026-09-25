import React, { useState } from "react";
import { X, Sparkles, User, Mail, Phone, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { loginUser, registerUser, UserProfile } from "../services/authService";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  defaultTab?: "login" | "register";
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = "register",
}: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (tab === "register") {
      if (!name.trim()) {
        setErrorMsg("Por favor, digite seu nome completo.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setErrorMsg("Por favor, digite um e-mail válido.");
        return;
      }
      if (!whatsapp.trim() || whatsapp.length < 9) {
        setErrorMsg("Por favor, digite um número de WhatsApp válido.");
        return;
      }

      setLoading(true);
      const res = await registerUser({ name, email, whatsapp, password });
      setLoading(false);

      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || "Erro ao criar conta.");
      }
    } else {
      if (!email.trim() || !email.includes("@")) {
        setErrorMsg("Por favor, digite um e-mail válido.");
        return;
      }

      setLoading(true);
      const res = await loginUser(email, password);
      setLoading(false);

      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || "Erro ao entrar.");
      }
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    const res = await registerUser({
      name: "Convidado VIP",
      email: "vip@baladaon.com.br",
      whatsapp: "(11) 99876-5432",
    });
    setLoading(false);
    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-purple-500/30 bg-[#0c101c] p-6 text-slate-100 shadow-[0_0_50px_-10px_rgba(168,85,247,0.4)] z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 text-2xl shadow-[0_0_25px_-5px_rgba(168,85,247,0.6)]">
            🪩
          </div>
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-1.5">
              <span>{tab === "register" ? "Criar Conta VIP" : "Acessar o Radar do Rolê"}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {tab === "register"
                ? "Tenha acesso exclusivo a listas VIPs e cortesias"
                : "Entre para ver seus vouchers e favoritos"}
            </p>
          </div>
        </div>

        {/* Tabs switcher */}
        <div className="mt-5 grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setErrorMsg("");
            }}
            className={`rounded-xl py-2 text-xs font-bold transition-all ${
              tab === "register"
                ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Criar Conta Grátis
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErrorMsg("");
            }}
            className={`rounded-xl py-2 text-xs font-bold transition-all ${
              tab === "login"
                ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Já tenho conta
          </button>
        </div>

        {/* Vantagens bullet points for register */}
        {tab === "register" && (
          <div className="mt-4 space-y-1.5 rounded-2xl border border-purple-500/20 bg-purple-500/10 p-3 text-[11px] text-purple-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              <span>Emita passes da <strong>Lista VIP</strong> em 1 clique</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              <span>Sincronize seus <strong>favoritos</strong> no celular e PC</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              <span>Avisos de <strong>shows exclusivos</strong> e open bar</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/15 p-2.5 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {tab === "register" && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Nome Completo (como no RG para a Lista VIP)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Amanda Silva"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {tab === "register" && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                WhatsApp / Celular com DDD
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === "register" ? "Crie uma senha de acesso" : "Sua senha"}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 py-3 text-xs font-black text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:brightness-110 active:scale-98 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span>Processando...</span>
            ) : (
              <>
                <span>{tab === "register" ? "Concluir Cadastro VIP" : "Entrar no Radar do Rolê"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick test demo account */}
        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 underline underline-offset-4"
          >
            ⚡ Testar entrada rápida como Convidado VIP
          </button>
        </div>
      </div>
    </div>
  );
}
