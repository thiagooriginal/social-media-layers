import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  Sparkles,
  TrendingUp,
  Users,
  Ticket,
  ArrowRight,
  Check,
  CheckCircle2,
  Phone,
  Mail,
  Lock,
  Store,
  MapPin,
  Flame,
  Crown,
  ChevronRight,
  LogOut,
  BarChart3,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { getCurrentUser, loginUser, logoutUser, registerUser, UserProfile } from "../services/authService";
import { NEIGHBORHOODS, Venue } from "../data/venues";
import { registerVenue, NewVenueInput } from "../services/venueService";
import { supabase } from "../integrations/supabase/client";

export const Route = createFileRoute("/parceiro")({
  component: PartnerPortalPage,
});

interface VipLeadRow {
  id: string;
  venue_name: string;
  user_name: string;
  user_whatsapp: string;
  guests_count: number;
  event_date: string;
  status: string;
  created_at: string;
}

function PartnerPortalPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [authMode, setAuthMode] = useState<"login" | "register">("register");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register form state
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState<"baladas" | "restaurantes" | "moteis">("baladas");
  const [neighborhood, setNeighborhood] = useState(NEIGHBORHOODS[0].name);
  const [selectedPlan, setSelectedPlan] = useState<"mensal" | "semestral" | "anual">("semestral");

  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Partner dashboard data (when logged in as partner)
  const [partnerLeads, setPartnerLeads] = useState<VipLeadRow[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  const isPartner = currentUser?.role === "partner" || currentUser?.role === "admin";

  // Phone mask utility
  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  // Fetch venue leads if logged in
  useEffect(() => {
    if (isPartner && currentUser) {
      setIsLoadingLeads(true);
      (supabase as any)
        .from("vip_list_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)
        .then(({ data }: any) => {
          if (data) setPartnerLeads(data);
          setIsLoadingLeads(false);
        });
    }
  }, [isPartner, currentUser]);

  // Handle Partner Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail.trim() || !loginEmail.includes("@")) {
      setLoginError("Por favor, digite seu e-mail cadastrado.");
      return;
    }

    setLoginLoading(true);
    const res = await loginUser(loginEmail, loginPassword);
    setLoginLoading(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
    } else {
      setLoginError(res.error || "E-mail ou senha incorretos.");
    }
  };

  // Handle Partner Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    if (!businessName.trim()) {
      setRegisterError("Por favor, digite o nome do seu estabelecimento.");
      return;
    }
    if (!ownerName.trim()) {
      setRegisterError("Por favor, digite o nome do responsável.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setRegisterError("Por favor, digite um e-mail válido.");
      return;
    }
    if (whatsapp.replace(/\D/g, "").length < 10) {
      setRegisterError("Por favor, digite um WhatsApp comercial válido com DDD.");
      return;
    }

    setRegisterLoading(true);

    // 1. Create Partner User in auth & profiles
    const userRes = await registerUser({
      name: ownerName,
      email,
      whatsapp,
      password,
      role: "partner",
      businessName,
      venueCategory: category,
      neighborhood,
    });

    if (!userRes.success || !userRes.user) {
      setRegisterLoading(false);
      setRegisterError(userRes.error || "Erro ao criar conta de parceiro.");
      return;
    }

    // 2. Register Venue in venues table
    const planPrices = { mensal: 79, semestral: 59, anual: 39 };
    const defaultCoords = NEIGHBORHOODS.find((n) => n.name === neighborhood) || NEIGHBORHOODS[0];

    await registerVenue({
      category,
      name: businessName,
      tagline: `O melhor de ${neighborhood} • Faça sua reserva e lista VIP`,
      subType: category === "baladas" ? "Balada & Shows" : category === "moteis" ? "Motel Design" : "Bar & Gastronomia",
      subTypeEmoji: category === "baladas" ? "🪩" : category === "moteis" ? "🔥" : "🍸",
      neighborhood,
      address: `${neighborhood}, São Paulo - SP`,
      latitude: defaultCoords.lat,
      longitude: defaultCoords.lng,
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
      openHours: "Consulte horários no WhatsApp",
      entryPrice: "Consulte valores • Lista VIP",
      whatsapp: "55" + whatsapp.replace(/\D/g, ""),
      hasVipList: true,
      hasParking: true,
      plan: selectedPlan,
      planPrice: planPrices[selectedPlan],
    });

    setRegisterLoading(false);
    setRegisterSuccess(true);
    setCurrentUser(userRes.user);
  };

  // Demo 1-Click login for testing
  const handleDemoPartnerLogin = async () => {
    setLoginLoading(true);
    const res = await loginUser("thiago@radardorole.com.br");
    setLoginLoading(false);
    if (res.success && res.user) {
      setCurrentUser(res.user);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const PLANS = [
    {
      id: "mensal" as const,
      name: "Mensal",
      price: "79",
      period: "/mês",
      billingText: "Sem fidelidade, cancele quando quiser",
      badge: null,
      highlight: false,
      features: [
        "Página dedicada no app",
        "Botão oficial pro seu WhatsApp",
        "Cálculo de corrida de Uber até o local",
        "Localização por GPS em São Paulo",
      ],
    },
    {
      id: "semestral" as const,
      name: "Semestral",
      price: "59",
      period: "/mês",
      billingText: "Cobrança semestral (Economize R$ 120)",
      badge: "MAIS ESCOLHIDO 🔥",
      highlight: true,
      features: [
        "Tudo do Plano Mensal",
        "Emissão de Lista VIP digital",
        "Painel de controle de nomes na portaria",
        "Selo de Estabelecimento Verificado",
        "Destaque nas buscas por bairro",
      ],
    },
    {
      id: "anual" as const,
      name: "Anual",
      price: "39",
      period: "/mês",
      billingText: "Cobrança anual (Economize 50% no ano)",
      badge: "MELHOR VALOR 👑",
      highlight: false,
      features: [
        "Tudo do Plano Semestral",
        "Posicionamento prioritário no topo",
        "Banner rotativo na Home",
        "Consultor VIP via WhatsApp dedicado",
        "Relatórios semanais de público e visualizações",
      ],
    },
  ];

  // =========================================================================
  // VIEW: PARTNER LOGGED IN DASHBOARD
  // =========================================================================
  if (isPartner && currentUser) {
    return (
      <div className="min-h-screen bg-[#070a11] text-slate-100 pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-purple-500/20 bg-[#0a0f1d]/95 backdrop-blur-xl px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-cyan-500 text-xl shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                🏢
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-white">
                    {currentUser.businessName || "Meu Estabelecimento"}
                  </h1>
                  <span className="rounded-full bg-purple-500/20 border border-purple-500/50 px-2 py-0.5 text-[10px] font-black text-purple-300">
                    Parceiro Oficial
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Portal de Gestão & Portaria</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ver no App</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 px-2.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
          {/* Welcome Banner */}
          <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-[#0e1424] to-cyan-950/30 p-5 sm:p-6 shadow-[0_0_35px_rgba(168,85,247,0.15)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-300 mb-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Perfil Ativo no Radar Noturno de SP
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Bem-vindo, {currentUser.name}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Sua casa está sendo recomendada em tempo real para os baladeiros que estão buscando rolê em São Paulo.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/55${currentUser.whatsapp?.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  <Phone className="h-4 w-4" />
                  <span>Testar Botão WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-white/10 bg-[#0e1424] p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Visualizações do Card</span>
              <div className="mt-1 text-2xl font-black text-cyan-300">1.840</div>
              <p className="text-[10px] text-slate-500 mt-0.5">+24% esta semana</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0e1424] p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Cliques para WhatsApp</span>
              <div className="mt-1 text-2xl font-black text-emerald-400">312</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Contatos diretos gerados</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0e1424] p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Nomes na Lista VIP</span>
              <div className="mt-1 text-2xl font-black text-purple-300">{partnerLeads.length}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Captados para a portaria</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0e1424] p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Simulações de Uber</span>
              <div className="mt-1 text-2xl font-black text-amber-300">420</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Público calculando rota</p>
            </div>
          </div>

          {/* Leads Table for Portaria */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#0c101c] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-purple-400" />
                  <span>Nomes Confirmados na Lista VIP (Portaria)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Use esta lista para conferir os nomes na entrada da casa
                </p>
              </div>
              <span className="text-xs font-bold text-cyan-300">
                Total: {partnerLeads.length} confirmados
              </span>
            </div>

            {partnerLeads.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center text-slate-400">
                <Ticket className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-300">Nenhum nome cadastrado na lista para hoje ainda</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Assim que os usuários clicarem em "Lista VIP" no seu card, os dados aparecerão aqui em tempo real.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px] font-black">
                    <tr>
                      <th className="py-2.5 px-3">Nome do Cliente</th>
                      <th className="py-2.5 px-3">WhatsApp</th>
                      <th className="py-2.5 px-3">Acompanhantes</th>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {partnerLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 font-bold text-white">{lead.user_name}</td>
                        <td className="py-2.5 px-3 text-slate-300">{lead.user_whatsapp}</td>
                        <td className="py-2.5 px-3 text-cyan-300">+{lead.guests_count} pessoas</td>
                        <td className="py-2.5 px-3 text-slate-400">{lead.event_date}</td>
                        <td className="py-2.5 px-3">
                          <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW: B2B COMMERCIAL LANDING PAGE & REGISTRATION PORTAL
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 selection:bg-purple-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070a11]/90 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-fuchsia-600 to-purple-600 text-lg shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              🏢
            </div>
            <div>
              <span className="text-base font-black text-white">Radar do Rolê</span>
              <span className="ml-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[9px] font-black text-purple-300 uppercase">
                Parceiros
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              ← Voltar ao App do Rolê
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 text-center border-b border-white/5 bg-gradient-to-b from-purple-950/20 via-[#0a0f1d] to-[#070a11]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-950/40 px-3.5 py-1 text-xs font-black text-purple-300 mb-4 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Portal Oficial para Donos & Promoters de São Paulo</span>
          </span>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Divulgue sua Casa Noturna, Bar ou Motel para quem está{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-400">
              decidindo o rolê agora
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Mais de **10.000 jovens e casais** pesquisam pelo celular onde curtir a noite paulistana no Radar do Rolê.
            Coloque sua casa no topo, receba contatos diretos no WhatsApp e lote sua pista com lista VIP digital.
          </p>

          {/* Quick Metrics Badges */}
          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xl sm:text-2xl font-black text-cyan-400">+10k</div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Baladeiros/mês</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xl sm:text-2xl font-black text-fuchsia-400">84%</div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Decidem no mesmo dia</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">Direto</div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">No seu WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-xl">
          {/* Switcher: Já sou Parceiro (Login) vs Quero Divulgar (Cadastro) */}
          <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1.5">
            <button
              onClick={() => setAuthMode("register")}
              className={`rounded-xl py-3 text-xs font-black transition-all ${
                authMode === "register"
                  ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Quero Divulgar Meu Local
            </button>
            <button
              onClick={() => setAuthMode("login")}
              className={`rounded-xl py-3 text-xs font-black transition-all ${
                authMode === "login"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Já sou Parceiro (Entrar)
            </button>
          </div>

          {/* FORM 1: LOGIN */}
          {authMode === "login" && (
            <div className="mt-6 rounded-3xl border border-cyan-500/30 bg-[#0c101c] p-6 shadow-2xl">
              <div className="text-center mb-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-2xl mb-2">
                  🔐
                </div>
                <h3 className="text-lg font-black text-white">Acessar Painel do Estabelecimento</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Digite suas credenciais de parceiro cadastrado
                </p>
              </div>

              {loginError && (
                <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                    E-mail do Estabelecimento
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="gestao@seuestabelecimento.com.br"
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-sm font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  <span>{loginLoading ? "Entrando..." : "Acessar Meu Painel"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Demo 1-Click for Partner */}
              <div className="mt-6 border-t border-white/10 pt-4 text-center">
                <button
                  type="button"
                  onClick={handleDemoPartnerLogin}
                  className="w-full py-2.5 px-3 rounded-xl border border-cyan-500/30 bg-cyan-950/30 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
                >
                  ⚡ Acesso Rápido de Teste (Parceiro Demo)
                </button>
              </div>
            </div>
          )}

          {/* FORM 2: REGISTER */}
          {authMode === "register" && (
            <div className="mt-6 rounded-3xl border border-purple-500/30 bg-[#0c101c] p-6 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-xl font-black text-white">Cadastre seu Estabelecimento</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Preencha os dados da sua casa para começar a receber clientes
                </p>
              </div>

              {registerError && (
                <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
                  {registerError}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Nome do Estabelecimento */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                    Nome da Casa Noturna, Bar ou Motel *
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Ex: Villa Madá Club"
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Nome do Responsável */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                    Nome do Responsável / Promoter *
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                    required
                  />
                </div>

                {/* Categoria e Bairro */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                      Tipo de Local *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-white/15 bg-[#121829] py-2.5 px-3 text-xs text-white focus:border-purple-400 focus:outline-none"
                    >
                      <option value="baladas">🪩 Balada / Casa Noturna</option>
                      <option value="restaurantes">🍸 Bar / Gastronomia</option>
                      <option value="moteis">🔥 Motel Design</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                      Bairro em SP *
                    </label>
                    <select
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-[#121829] py-2.5 px-3 text-xs text-white focus:border-purple-400 focus:outline-none"
                    >
                      {NEIGHBORHOODS.map((n) => (
                        <option key={n.name} value={n.name}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* WhatsApp Comercial */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                    WhatsApp Comercial / Portaria *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                      placeholder="(11) 99999-8888"
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* E-mail e Senha */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                      E-mail de Contato *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="gestao@suacasa.com"
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                      Senha de Acesso *
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Plan Selection */}
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-300 mb-2 block">
                    Escolha seu Plano de Divulgação:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLANS.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlan(p.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all text-center ${
                          selectedPlan === p.id
                            ? "border-purple-500 bg-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        {p.badge && (
                          <span className="block text-[8px] font-black text-amber-300 mb-1 truncate">
                            {p.badge}
                          </span>
                        )}
                        <div className="text-xs font-black text-white">{p.name}</div>
                        <div className="text-sm font-black text-purple-300 mt-1">R$ {p.price}</div>
                        <div className="text-[9px] text-slate-400">/mês</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 py-3.5 text-sm font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(168,85,247,0.5)] cursor-pointer mt-4"
                >
                  <span>
                    {registerLoading ? "Cadastrando Local..." : "Publicar Meu Estabelecimento no Radar"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Plan Details & Features Table */}
      <section className="py-12 px-4 sm:px-6 border-t border-white/5 bg-[#0a0e1c]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Planos Transparentes para Impulsionar sua Casa
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Sem taxas escondidas. Cancele ou altere seu plano quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl border p-6 flex flex-col justify-between ${
                  plan.highlight
                    ? "border-purple-500 bg-gradient-to-b from-purple-950/30 to-[#0e1424] shadow-[0_0_35px_rgba(168,85,247,0.2)]"
                    : "border-white/10 bg-[#0c101c]"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-0.5 text-[10px] font-black text-white shadow-md">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-black text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{plan.billingText}</p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-400">R$</span>
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400">{plan.period}</span>
                  </div>

                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    setAuthMode("register");
                    window.scrollTo({ top: 500, behavior: "smooth" });
                  }}
                  className={`mt-6 w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                    plan.highlight
                      ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:bg-purple-500"
                      : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  Escolher Plano {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Radar do Rolê • Portal de Parceiros de São Paulo.</p>
      </footer>
    </div>
  );
}
