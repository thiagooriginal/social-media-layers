import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldAlert,
  Crown,
  Building2,
  Users,
  Ticket,
  TrendingUp,
  Search,
  ExternalLink,
  Plus,
  LogOut,
  Sparkles,
  CheckCircle2,
  Phone,
  Flame,
  Filter,
  DollarSign,
  ArrowLeft,
  Calendar,
  Layers,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { getCurrentUser, loginUser, logoutUser, UserProfile } from "../services/authService";
import { Venue, VENUES_DATA } from "../data/venues";
import { supabase } from "../integrations/supabase/client";
import { RegisterVenueModal } from "../components/RegisterVenueModal";

export const Route = createFileRoute("/admin")({
  component: AdminDashboardPage,
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

interface ConfirmationRow {
  id: string;
  venue_id: string;
  user_name?: string;
  created_at: string;
}

function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [adminEmail, setAdminEmail] = useState("thiagooriginal2002@gmail.com");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard Data State
  const [venues, setVenues] = useState<Venue[]>(VENUES_DATA);
  const [leads, setLeads] = useState<VipLeadRow[]>([]);
  const [confirmations, setConfirmations] = useState<ConfirmationRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<"venues" | "leads" | "confirmations">("venues");

  // Venue filters inside admin
  const [venueSearch, setVenueSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal for new venue
  const [isNewVenueModalOpen, setIsNewVenueModalOpen] = useState(false);

  const isAdmin = currentUser?.role === "admin";

  // Load Admin Data from Supabase
  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      // 1. Fetch Venues
      const { data: venuesData } = await (supabase as any)
        .from("venues")
        .select("*")
        .order("name", { ascending: true });
      if (venuesData && venuesData.length > 0) {
        setVenues(venuesData);
      }

      // 2. Fetch VIP Leads
      const { data: leadsData } = await (supabase as any)
        .from("vip_list_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (leadsData) {
        setLeads(leadsData);
      }

      // 3. Fetch Confirmations
      const { data: confData } = await (supabase as any)
        .from("event_confirmations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (confData) {
        setConfirmations(confData);
      }
    } catch (err) {
      console.warn("Could not load full admin data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  // Admin Login Handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    const res = await loginUser(adminEmail, adminPassword);
    setAuthLoading(false);

    if (res.success && res.user) {
      if (res.user.role === "admin") {
        setCurrentUser(res.user);
      } else {
        setAuthError("Esta conta não possui permissão de Super Administrador.");
      }
    } else {
      setAuthError(res.error || "Credenciais inválidas.");
    }
  };

  // Quick 1-Click Master Access for Thiago
  const handleQuickMasterLogin = async () => {
    setAuthLoading(true);
    const res = await loginUser("thiagooriginal2002@gmail.com");
    setAuthLoading(false);
    if (res.success && res.user) {
      setCurrentUser({
        ...res.user,
        role: "admin",
      });
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  // Filtered Venues
  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      const matchSearch =
        v.name.toLowerCase().includes(venueSearch.toLowerCase()) ||
        v.neighborhood.toLowerCase().includes(venueSearch.toLowerCase()) ||
        v.subType?.toLowerCase().includes(venueSearch.toLowerCase());
      const matchCategory = selectedCategory === "all" || v.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [venues, venueSearch, selectedCategory]);

  // Financial Metrics Calculation
  const estimatedMRR = useMemo(() => {
    return venues.reduce((acc, v) => acc + (v.planPrice || 59), 0);
  }, [venues]);

  // =========================================================================
  // VIEW 1: ADMIN LOGIN SCREEN (If not authenticated as admin)
  // =========================================================================
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#06080f] text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-amber-600/20 via-purple-600/20 to-cyan-500/20 blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md rounded-3xl border border-amber-500/30 bg-[#0c101c] p-7 shadow-[0_0_60px_-15px_rgba(245,158,11,0.3)] z-10 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-purple-600 to-cyan-500 shadow-[0_0_30px_rgba(245,158,11,0.5)] text-3xl">
              👑
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span>Painel Master</span>
              <span className="text-amber-400">Admin</span>
            </h1>
            <p className="mt-1 text-xs text-slate-400 font-medium">
              Radar do Rolê • Acesso Restrito aos Donos da Plataforma
            </p>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
              {authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                E-mail do Administrador
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@radardorole.com.br"
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:bg-white/10 focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                Senha Master
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:bg-white/10 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-500 py-3 text-sm font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer"
            >
              <span>{authLoading ? "Validando Acesso..." : "Acessar Portal Master"}</span>
              <Crown className="h-4 w-4" />
            </button>
          </form>

          {/* 1-Click Fast Pass for Thiago */}
          <div className="mt-6 border-t border-white/10 pt-4 text-center">
            <button
              type="button"
              onClick={handleQuickMasterLogin}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 py-2.5 px-3 text-xs font-black text-amber-300 hover:bg-amber-500/20 hover:border-amber-300 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              <span>⚡ Acesso Rápido Master (Thiago Admin)</span>
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar ao App Público</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED SUPER ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-[#0a0e1c]/95 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-purple-600 text-xl shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white">Radar do Rolê</h1>
                <span className="rounded-full bg-amber-500/20 border border-amber-500/50 px-2 py-0.5 text-[10px] font-black text-amber-300 uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Portal de Gestão & Inteligência Master</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              disabled={isLoadingData}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              title="Atualizar dados em tempo real"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingData ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-2.5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all shadow-sm"
              title="Ver aplicativo no ar"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Abrir App</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 px-2.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all"
              title="Sair do painel de administração"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Estabelecimentos */}
          <div className="rounded-2xl border border-purple-500/30 bg-[#0e1424] p-4 shadow-[0_0_25px_rgba(168,85,247,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                Locais Ativos
              </span>
              <Building2 className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-white">{venues.length}</div>
            <p className="mt-1 text-[11px] text-slate-400">Baladas, Bares e Motéis de SP</p>
          </div>

          {/* Card 2: Leads VIP */}
          <div className="rounded-2xl border border-cyan-500/30 bg-[#0e1424] p-4 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                Leads Lista VIP
              </span>
              <Ticket className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-white">{leads.length}</div>
            <p className="mt-1 text-[11px] text-slate-400">Contatos captados para portarias</p>
          </div>

          {/* Card 3: Presenças ("Eu Vou") */}
          <div className="rounded-2xl border border-rose-500/30 bg-[#0e1424] p-4 shadow-[0_0_25px_rgba(244,63,94,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
                Presenças ("Eu Vou")
              </span>
              <Flame className="h-4 w-4 text-rose-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-white">{confirmations.length}</div>
            <p className="mt-1 text-[11px] text-slate-400">Cliques com presença confirmada</p>
          </div>

          {/* Card 4: Faturamento Estimado (MRR) */}
          <div className="rounded-2xl border border-amber-500/30 bg-[#0e1424] p-4 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                MRR Projetado
              </span>
              <DollarSign className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-400">
              R$ {estimatedMRR.toLocaleString("pt-BR")},00
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Potencial de mensalidades ativas</p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="mt-8 flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("venues")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all ${
                activeTab === "venues"
                  ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Gestão de Estabelecimentos ({venues.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("leads")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all ${
                activeTab === "leads"
                  ? "bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Ticket className="h-4 w-4" />
              <span>Mural de Leads VIP ({leads.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("confirmations")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all ${
                activeTab === "confirmations"
                  ? "bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>Confirmados no Rolê ({confirmations.length})</span>
            </button>
          </div>

          {/* Action Button: Add Venue */}
          <button
            onClick={() => setIsNewVenueModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Cadastrar Estabelecimento</span>
          </button>
        </div>

        {/* TAB 1: VENUES MANAGEMENT */}
        {activeTab === "venues" && (
          <div className="mt-5 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={venueSearch}
                  onChange={(e) => setVenueSearch(e.target.value)}
                  placeholder="Buscar por nome, bairro..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedCategory === "all" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Todos ({venues.length})
                </button>
                <button
                  onClick={() => setSelectedCategory("baladas")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedCategory === "baladas" ? "bg-fuchsia-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Baladas ({venues.filter((v) => v.category === "baladas").length})
                </button>
                <button
                  onClick={() => setSelectedCategory("restaurantes")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedCategory === "restaurantes" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Bares ({venues.filter((v) => v.category === "restaurantes").length})
                </button>
                <button
                  onClick={() => setSelectedCategory("moteis")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedCategory === "moteis" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Motéis ({venues.filter((v) => v.category === "moteis").length})
                </button>
              </div>
            </div>

            {/* Venues Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0b101e]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Local</th>
                    <th className="py-3 px-3">Categoria</th>
                    <th className="py-3 px-3">Bairro</th>
                    <th className="py-3 px-3">Plano</th>
                    <th className="py-3 px-3">Nota & Reviews</th>
                    <th className="py-3 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredVenues.map((v) => (
                    <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={v.image}
                            alt={v.name}
                            className="h-10 w-10 rounded-xl object-cover border border-white/10"
                          />
                          <div>
                            <div className="font-black text-white text-sm flex items-center gap-1.5">
                              <span>{v.name}</span>
                              {v.hasVipList && (
                                <span className="rounded bg-amber-500/20 text-amber-300 text-[9px] px-1 py-0.5 font-bold">
                                  VIP
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">{v.tagline}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold capitalize text-slate-200">
                          {v.subTypeEmoji} {v.category}
                        </span>
                      </td>

                      {/* Neighborhood */}
                      <td className="py-3 px-3">
                        <span className="flex items-center gap-1 text-slate-300 font-medium">
                          <MapPin className="h-3 w-3 text-cyan-400" />
                          <span>{v.neighborhood}</span>
                        </span>
                      </td>

                      {/* Plan */}
                      <td className="py-3 px-3">
                        <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                          {v.plan || "Semestral"} (R$ {v.planPrice || 59}/mês)
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <span>★ {v.rating}</span>
                          <span className="text-slate-500 text-[10px]">({v.reviewsCount})</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <a
                          href={`https://wa.me/${v.whatsapp}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                        >
                          <Phone className="h-3 w-3" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: VIP LEADS MURALL */}
        {activeTab === "leads" && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">Leads Captados para Portarias VIP</h3>
              <span className="text-xs text-slate-400">Total: {leads.length} cadastros</span>
            </div>

            {leads.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#0e1424] p-8 text-center text-slate-400">
                <Ticket className="mx-auto h-8 w-8 text-slate-500 mb-2 opacity-50" />
                <p className="text-sm font-bold text-slate-300">Nenhum lead de portaria registrado ainda hoje</p>
                <p className="text-xs text-slate-500 mt-1">
                  Assim que os usuários clicarem em "Lista VIP" no app, seus nomes e WhatsApps aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0b101e]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Nome do Usuário</th>
                      <th className="py-3 px-3">Estabelecimento</th>
                      <th className="py-3 px-3">WhatsApp</th>
                      <th className="py-3 px-3">Acompanhantes</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Ação Rápida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-bold text-white">{lead.user_name}</td>
                        <td className="py-3 px-3 text-cyan-300 font-semibold">{lead.venue_name}</td>
                        <td className="py-3 px-3 text-slate-300">{lead.user_whatsapp}</td>
                        <td className="py-3 px-3 text-slate-300">+{lead.guests_count} pessoas</td>
                        <td className="py-3 px-3">
                          <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <a
                            href={`https://wa.me/55${lead.user_whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20"
                          >
                            <Phone className="h-3 w-3" />
                            <span>Mensagem</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONFIRMATIONS */}
        {activeTab === "confirmations" && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">Presenças Confirmadas ("🔥 Eu Vou")</h3>
              <span className="text-xs text-slate-400">Total: {confirmations.length} confirmados</span>
            </div>

            {confirmations.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#0e1424] p-8 text-center text-slate-400">
                <Flame className="mx-auto h-8 w-8 text-rose-500 mb-2 opacity-50" />
                <p className="text-sm font-bold text-slate-300">Nenhuma confirmação de presença registrada ainda</p>
                <p className="text-xs text-slate-500 mt-1">
                  Os cliques no botão "🔥 Eu Vou" são gravados em tempo real no banco.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {confirmations.map((conf) => (
                  <div
                    key={conf.id}
                    className="rounded-2xl border border-rose-500/30 bg-[#0e1424] p-4 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-white">
                        {conf.user_name || "Baladeiro Anônimo"}
                      </span>
                      <p className="text-[11px] text-rose-300 mt-0.5">
                        Local ID: {conf.venue_id}
                      </p>
                    </div>
                    <Flame className="h-5 w-5 text-rose-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Register Venue Modal */}
      <RegisterVenueModal
        isOpen={isNewVenueModalOpen}
        onClose={() => setIsNewVenueModalOpen(false)}
        onVenueCreated={(newV) => {
          setVenues((prev) => [newV, ...prev]);
        }}
      />
    </div>
  );
}
