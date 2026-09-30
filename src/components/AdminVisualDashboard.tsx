import React, { useState, useMemo, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Ticket,
  Flame,
  DollarSign,
  Eye,
  MousePointerClick,
  Phone,
  Calendar,
  CreditCard,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Car,
  Layers,
  Zap,
  MapPin,
  Crown,
  ChevronRight,
  Clock,
  Plus,
  ExternalLink,
  Filter,
  BarChart3,
  Award,
  RefreshCw,
  Users,
} from "lucide-react";
import { Venue } from "../data/venues";
import { SaasSubscription, OFFICIAL_PLAN_PRICE } from "../services/saasBillingService";
import { getVenueMetrics } from "../services/analyticsService";

interface AdminVisualDashboardProps {
  venues: Venue[];
  leads: any[];
  confirmations: any[];
  subscriptions: SaasSubscription[];
  onNavigateTab: (tab: "venues" | "leads" | "confirmations" | "analytics" | "saas" | "whatsapp") => void;
  onOpenNewVenueModal: () => void;
  onSelectVenueForInspection?: (venueId: string) => void;
}

export function AdminVisualDashboard({
  venues,
  leads,
  confirmations,
  subscriptions,
  onNavigateTab,
  onOpenNewVenueModal,
  onSelectVenueForInspection,
}: AdminVisualDashboardProps) {
  const [period, setPeriod] = useState<"7d" | "30d" | "hoje">("7d");
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // 1. Métricas Globais Agregadas
  const globalStats = useMemo(() => {
    let views = 0;
    let clicks = 0;
    let waClicks = 0;
    let ubers = 0;
    let calculatedLeads = 0;

    venues.forEach((v) => {
      const m = getVenueMetrics(v.id, v.name);
      views += m.impressionsFeed;
      clicks += m.profileClicks;
      waClicks += m.whatsappDirectClicks;
      ubers += m.uberSimulations;
      calculatedLeads += m.vipListLeads;
    });

    const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
    const mrr = subscriptions.length > 0
      ? subscriptions.reduce((acc, s) => acc + (s.status === "active" ? s.monthlyValue || (s.tier === "premium" ? 89 : 59) : 0), 0)
      : venues.length * 59;

    const standardSubsCount = activeSubscriptions.filter((s) => s.tier !== "premium" && s.monthlyValue !== 89).length;
    const premiumSubsCount = activeSubscriptions.filter((s) => s.tier === "premium" || s.monthlyValue === 89).length;

    const arr = mrr * 12;
    const leadsTotal = leads.length > 0 ? leads.length : calculatedLeads;
    const ctr = views > 0 ? Math.round((clicks / views) * 1000) / 10 : 18.5;

    return {
      views,
      clicks,
      waClicks,
      ubers,
      leadsTotal,
      mrr,
      arr,
      ctr,
      activeSubsCount: activeSubscriptions.length || subscriptions.length || venues.length,
      standardSubsCount: standardSubsCount || 2,
      premiumSubsCount: premiumSubsCount || 2,
    };
  }, [venues, subscriptions, leads]);

  // 2. Distribuição por Categoria
  const categoryStats = useMemo(() => {
    const baladas = venues.filter((v) => v.category === "baladas").length;
    const bares = venues.filter((v) => v.category === "bares" || v.category === "restaurantes").length;
    const moteis = venues.filter((v) => v.category === "moteis").length;
    const total = Math.max(1, venues.length);

    return [
      { name: "Baladas & Clubs", value: baladas, color: "#a855f7", percent: Math.round((baladas / total) * 100) },
      { name: "Bares & Lounges", value: bares, color: "#06b6d4", percent: Math.round((bares / total) * 100) },
      { name: "Motéis Design", value: moteis, color: "#f43f5e", percent: Math.round((moteis / total) * 100) },
    ];
  }, [venues]);

  // 3. Distribuição de Faturamento por Vencimento (Dia 10, Dia 20, Dia 30)
  const dueDayStats = useMemo(() => {
    const count10 = subscriptions.filter((s) => s.dueDay === 10).length || Math.round(subscriptions.length * 0.38) || 3;
    const count20 = subscriptions.filter((s) => s.dueDay === 20).length || Math.round(subscriptions.length * 0.35) || 3;
    const count30 = subscriptions.filter((s) => s.dueDay === 30).length || Math.round(subscriptions.length * 0.27) || 2;

    const val10 = count10 * OFFICIAL_PLAN_PRICE;
    const val20 = count20 * OFFICIAL_PLAN_PRICE;
    const val30 = count30 * OFFICIAL_PLAN_PRICE;

    return [
      { dayLabel: "Dia 10", day: "Dia 10 (Início do Mês)", assinantes: count10, valor: val10, cor: "#10b981" },
      { dayLabel: "Dia 20", day: "Dia 20 (Meio do Mês)", assinantes: count20, valor: val20, cor: "#06b6d4" },
      { dayLabel: "Dia 30", day: "Dia 30 (Fim do Mês)", assinantes: count30, valor: val30, cor: "#a855f7" },
    ];
  }, [subscriptions]);

  // Status de Métodos de Pagamento e Falhas de Cartão
  const paymentMethodSummary = useMemo(() => {
    const cardSubs = subscriptions.filter((s) => s.paymentMethod === "credit_card");
    const pixSubs = subscriptions.filter((s) => s.paymentMethod === "pix");
    const failedCardSubs = subscriptions.filter((s) => s.status === "card_failed");

    return {
      cardCount: cardSubs.length || Math.round(subscriptions.length * 0.6) || 5,
      pixCount: pixSubs.length || Math.round(subscriptions.length * 0.4) || 3,
      failedCardCount: failedCardSubs.length,
      failedCardList: failedCardSubs,
    };
  }, [subscriptions]);

  // 4. Gráfico Temporal Dinâmico conforme período
  const timeSeriesData = useMemo(() => {
    const totalViews = globalStats.views;
    const totalClicks = globalStats.clicks;
    const totalWa = globalStats.waClicks;

    if (period === "7d") {
      const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
      // Pesos com picos realistas nas noites de Sexta e Sábado
      const weights = [0.06, 0.08, 0.11, 0.16, 0.28, 0.23, 0.08];
      return days.map((day, i) => ({
        label: day,
        visualizacoes: Math.round(totalViews * weights[i]),
        cliques: Math.round(totalClicks * weights[i]),
        conversoes: Math.round(totalWa * weights[i]),
        isPeak: day === "Sex" || day === "Sáb",
      }));
    } else if (period === "30d") {
      const weeks = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];
      const weights = [0.22, 0.24, 0.26, 0.28];
      return weeks.map((w, i) => ({
        label: w,
        visualizacoes: Math.round(totalViews * weights[i]),
        cliques: Math.round(totalClicks * weights[i]),
        conversoes: Math.round(totalWa * weights[i]),
        isPeak: i === 3,
      }));
    } else {
      // Hoje por faixas horárias
      const hours = ["18h", "20h", "22h", "00h", "02h", "04h"];
      const weights = [0.08, 0.15, 0.29, 0.31, 0.12, 0.05];
      return hours.map((h, i) => ({
        label: h,
        visualizacoes: Math.round((totalViews / 7) * weights[i]),
        cliques: Math.round((totalClicks / 7) * weights[i]),
        conversoes: Math.round((totalWa / 7) * weights[i]),
        isPeak: h === "22h" || h === "00h",
      }));
    }
  }, [period, globalStats]);

  // 5. Top 5 Bairros da Noite de SP
  const topNeighborhoods = useMemo(() => {
    const map: Record<string, { count: number; views: number }> = {};
    venues.forEach((v) => {
      const b = v.neighborhood || "Outros";
      if (!map[b]) map[b] = { count: 0, views: 0 };
      map[b].count += 1;
      map[b].views += getVenueMetrics(v.id, v.name).impressionsFeed;
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        locais: data.count,
        visualizacoes: data.views,
      }))
      .sort((a, b) => b.visualizacoes - a.visualizacoes)
      .slice(0, 5);
  }, [venues]);

  // 6. Ranking Top 5 Estabelecimentos da Semana
  const topVenues = useMemo(() => {
    return [...venues]
      .map((v) => {
        const m = getVenueMetrics(v.id, v.name);
        return {
          ...v,
          metrics: m,
          score: m.impressionsFeed + m.profileClicks * 3 + m.whatsappDirectClicks * 5,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [venues]);

  // Funil de Conversão
  const funnelSteps = useMemo(() => {
    const views = Math.max(100, globalStats.views);
    const clicks = Math.max(20, globalStats.clicks);
    const ubers = Math.max(10, globalStats.ubers);
    const wa = Math.max(5, globalStats.waClicks);
    const leads = Math.max(2, globalStats.leadsTotal);

    return [
      {
        step: "1. Impressões no Radar",
        desc: "Baladeiros que viram no feed de SP",
        value: views,
        pct: 100,
        color: "from-purple-500 to-indigo-500",
        icon: Eye,
      },
      {
        step: "2. Visualizações de Perfil",
        desc: "Abriram fotos, horários e detalhes",
        value: clicks,
        pct: Math.min(100, Math.round((clicks / views) * 100)),
        color: "from-cyan-500 to-blue-500",
        icon: MousePointerClick,
      },
      {
        step: "3. Rotas & Uber Simulados",
        desc: "Pessoas a caminho presencial",
        value: ubers,
        pct: Math.min(100, Math.round((ubers / views) * 100)),
        color: "from-amber-500 to-orange-500",
        icon: Car,
      },
      {
        step: "4. Contato WhatsApp Oficial",
        desc: "Conversas diretas abertas com a casa",
        value: wa,
        pct: Math.min(100, Math.round((wa / views) * 100)),
        color: "from-emerald-500 to-teal-500",
        icon: Phone,
      },
      {
        step: "5. Listas VIP & Ingressos",
        desc: "Vouchers emitidos e presença garantida",
        value: leads,
        pct: Math.min(100, Math.round((leads / views) * 100)),
        color: "from-rose-500 to-pink-500",
        icon: Ticket,
      },
    ];
  }, [globalStats]);

  // Custom Dark Tooltip para Gráficos
  const CustomTrafficTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl border border-white/15 bg-[#090d18]/95 backdrop-blur-xl p-3.5 shadow-2xl text-xs space-y-1.5 z-50 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-extrabold text-white text-sm">{label}</span>
            <span className="rounded bg-purple-500/20 text-purple-300 text-[10px] font-black px-1.5 py-0.5">
              Noite SP
            </span>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-black text-white font-mono">{entry.value.toLocaleString("pt-BR")}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomSaasTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="rounded-2xl border border-emerald-500/30 bg-[#090d18]/95 backdrop-blur-xl p-3.5 shadow-2xl text-xs space-y-1.5 z-50 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-extrabold text-emerald-400 text-sm">{data?.day || label}</span>
            <span className="rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-1.5 py-0.5">
              R$ 59,00/mês
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Assinaturas Ativas:</span>
            <span className="font-black text-white font-mono">{data?.assinantes} casas</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Receita Recorrente:</span>
            <span className="font-black text-emerald-400 font-mono text-sm">
              R$ {data?.valor?.toLocaleString("pt-BR")},00
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-4 space-y-6">
      {/* 1. Header do Dashboard com Filtros e Controles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-[#0e1424] to-cyan-950/30 p-5 shadow-[0_0_35px_rgba(168,85,247,0.12)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-black text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Painel Executivo Ao Vivo</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">
              São Paulo & Grande SP
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
            <span>Cockpit Master & Indicadores Visuais</span>
            <Sparkles className="h-5 w-5 text-amber-400" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Acompanhe o faturamento recorrente, tração dos estabelecimentos e comportamento dos baladeiros em tempo real.
          </p>
        </div>

        {/* Controles de Período e Ações */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1 text-xs">
            <button
              type="button"
              onClick={() => setPeriod("7d")}
              className={`rounded-xl px-3 py-1.5 font-bold transition-all cursor-pointer ${
                period === "7d"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              7 Dias
            </button>
            <button
              type="button"
              onClick={() => setPeriod("30d")}
              className={`rounded-xl px-3 py-1.5 font-bold transition-all cursor-pointer ${
                period === "30d"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              30 Dias
            </button>
            <button
              type="button"
              onClick={() => setPeriod("hoje")}
              className={`rounded-xl px-3 py-1.5 font-bold transition-all cursor-pointer ${
                period === "hoje"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Hoje (Ao Vivo)
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenNewVenueModal}
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Novo Local</span>
          </button>
        </div>
      </div>

      {/* 2. Alerta de Falha de Cartão Inteligente (Se houver recusas para ação imediata) */}
      {paymentMethodSummary.failedCardCount > 0 && (
        <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/60 via-[#160b13] to-rose-950/30 p-4 shadow-[0_0_30px_rgba(244,63,94,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span>Atenção: {paymentMethodSummary.failedCardCount} Cartão(ões) Recusado(s) na Cobrança</span>
                <span className="rounded bg-rose-500/20 text-rose-300 text-[10px] font-black px-1.5 py-0.5 uppercase">
                  Ação Recomendada
                </span>
              </h4>
              <p className="text-xs text-rose-200/80 mt-0.5">
                Estabelecimentos com cartão sem saldo ou cancelado. Envie a chave Pix oficial no WhatsApp para manter a casa no ar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("saas")}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-3.5 py-2 text-xs font-black text-white transition-all shadow-md shrink-0 cursor-pointer"
          >
            <span>Ver Recusas & Cobrar Pix</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 3. Cards de Alto Impacto Visual (KPIs Executivos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: MRR SaaS */}
        <div className="group rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-[#0c1420] via-[#09101c] to-[#070d18] p-5 shadow-[0_0_30px_rgba(16,185,129,0.12)] hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              <span>MRR Faturamento Mensal</span>
            </span>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5">
              R$ 59 e R$ 89
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-emerald-400 tracking-tight">
            R$ {globalStats.mrr.toLocaleString("pt-BR")},00
          </div>
          <div className="mt-2 flex items-center justify-between text-xs border-t border-white/5 pt-2">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <span className="text-cyan-400 font-bold">{globalStats.standardSubsCount} Std</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{globalStats.premiumSubsCount} Prem ⭐</span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              ARR: R$ {globalStats.arr.toLocaleString("pt-BR")},00
            </span>
          </div>
        </div>

        {/* Card 2: Estabelecimentos Conectados */}
        <div className="group rounded-3xl border border-purple-500/30 bg-gradient-to-br from-[#120d20] via-[#0b0c1c] to-[#070914] p-5 shadow-[0_0_30px_rgba(168,85,247,0.12)] hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              <span>Casas Conectadas</span>
            </span>
            <span className="rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold px-2 py-0.5">
              São Paulo
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-white tracking-tight">
            {venues.length}
            <span className="text-xs text-purple-300 font-normal ml-1.5">locais</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs border-t border-white/5 pt-2 text-slate-400">
            <span>🪩 {categoryStats[0].value} Baladas</span>
            <span>🍸 {categoryStats[1].value} Bares</span>
            <span>🔥 {categoryStats[2].value} Motéis</span>
          </div>
        </div>

        {/* Card 3: Visualizações Totais no App */}
        <div className="group rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0c1622] via-[#08101a] to-[#060c14] p-5 shadow-[0_0_30px_rgba(6,182,212,0.12)] hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              <span>Visualizações no Radar</span>
            </span>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold px-2 py-0.5">
              Público SP
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-cyan-300 tracking-tight">
            {globalStats.views.toLocaleString("pt-BR")}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs border-t border-white/5 pt-2 text-slate-400">
            <span className="text-cyan-400 font-bold">CTR Médio: {globalStats.ctr}%</span>
            <span>{globalStats.clicks.toLocaleString("pt-BR")} cliques perfil</span>
          </div>
        </div>

        {/* Card 4: Conversões Diretas (WhatsApp + Leads) */}
        <div className="group rounded-3xl border border-rose-500/30 bg-gradient-to-br from-[#1a0c16] via-[#120810] to-[#0a0509] p-5 shadow-[0_0_30px_rgba(244,63,94,0.12)] hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5" />
              <span>Conversões no Rolê</span>
            </span>
            <span className="rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-bold px-2 py-0.5">
              Leads & Portaria
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-white tracking-tight">
            {(globalStats.waClicks + globalStats.leadsTotal).toLocaleString("pt-BR")}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs border-t border-white/5 pt-2 text-slate-400">
            <span>🎟️ {globalStats.leadsTotal} Vouchers VIP</span>
            <span className="text-emerald-400 font-bold">💬 {globalStats.waClicks} WhatsApps</span>
          </div>
        </div>
      </div>

      {/* 4. Gráficos Principais Lado a Lado (Evolução Temporal + Distribuição de Vencimentos SaaS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico 1: Área de Evolução de Tráfego e Cliques (7 Colunas) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#090d18] p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400">
                  <BarChart3 className="h-4 w-4" />
                </span>
                <h3 className="text-base font-black text-white">
                  Curva de Procura da Noite Paulistana
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Visualizações no feed, cliques em detalhes e contatos de WhatsApp ao longo da semana.
              </p>
            </div>

            {/* Legenda visual customizada */}
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Visualizações</span>
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Cliques</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Conversões</span>
              </span>
            </div>
          </div>

          {/* Gráfico Recharts Responsive Container */}
          <div className="w-full h-72 sm:h-80 pt-2">
            {hasMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradientClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradientConv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#ffffff15" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#ffffff15" }}
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                  />
                  <Tooltip content={<CustomTrafficTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="visualizacoes"
                    name="Visualizações no Feed"
                    stroke="#a855f7"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#gradientViews)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cliques"
                    name="Cliques no Perfil"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradientClicks)"
                  />
                  <Area
                    type="monotone"
                    dataKey="conversoes"
                    name="Conversões WhatsApp"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradientConv)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Carregando gráfico interativo...
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-3">
            <span className="flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">🔥 Destaque Sazonal:</span> Sextas e Sábados concentram 51% de toda a intenção de rolê em São Paulo.
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab("analytics")}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Relatório Completo</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Gráfico 2: Faturamento SaaS e Vencimentos (Dia 10, 20 e 30) (5 Colunas) */}
        <div className="lg:col-span-5 rounded-3xl border border-emerald-500/20 bg-[#090d18] p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CreditCard className="h-4 w-4" />
                </span>
                <h3 className="text-base font-black text-white">
                  Cobranças & Vencimentos SaaS
                </h3>
              </div>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-black px-2 py-0.5">
                R$ 59,00
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Distribuição de faturamento das casas pelos 3 dias de vencimento configurados no sistema.
            </p>

            {/* Gráfico de Barras por Dia de Vencimento */}
            <div className="w-full h-48 pt-4">
              {hasMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dueDayStats} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                      dataKey="dayLabel"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "#ffffff15" }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "#ffffff15" }}
                      tickFormatter={(v) => `R$${v}`}
                    />
                    <Tooltip content={<CustomSaasTooltip />} />
                    <Bar dataKey="valor" name="Valor Faturado" radius={[8, 8, 0, 0]}>
                      {dueDayStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  Carregando métricas financeiras...
                </div>
              )}
            </div>
          </div>

          {/* Cards Rápidos de Vencimento & Formas de Pagamento */}
          <div className="mt-4 pt-3 border-t border-white/5 space-y-2.5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">💳 Cartão Recorrente</span>
                <span className="text-sm font-black text-white mt-0.5 block">
                  {paymentMethodSummary.cardCount} estabelecimentos
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">Cobrança automática ativa</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">⚡ Pix Recorrente</span>
                <span className="text-sm font-black text-cyan-300 mt-0.5 block">
                  {paymentMethodSummary.pixCount} estabelecimentos
                </span>
                <span className="text-[10px] text-cyan-400 font-medium">Avisos automáticos de chave</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400 text-[11px]">
                🔑 Chave Pix: <code className="text-amber-300 font-mono">thiagooriginal2002@gmail.com</code>
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab("saas")}
                className="text-emerald-400 hover:text-emerald-300 font-black text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Gerenciar Assinaturas</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Segunda Linha de Gráficos: Categorias (Donut) + Funil de Conversão + Top Bairros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gráfico 3: Distribuição por Categoria (Donut PieChart) */}
        <div className="rounded-3xl border border-white/10 bg-[#090d18] p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400">
                  <Layers className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-black text-white">Segmentação por Categoria</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">{venues.length} locais</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Fatia do catálogo dividida entre Baladas, Bares e Motéis da capital.
            </p>

            <div className="w-full h-44 relative flex items-center justify-center">
              {hasMounted ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#090d18" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any) => [`${val} estabelecimentos`, name]}
                        contentStyle={{
                          backgroundColor: "#090d18",
                          borderColor: "#ffffff20",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Centro do Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-black text-white">{venues.length}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Locais</span>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Legenda com percentuais */}
          <div className="space-y-1.5 border-t border-white/5 pt-3">
            {categoryStats.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-300 font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{cat.value}</span>
                  <span className="text-[11px] text-slate-400 font-mono">({cat.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico 4: Funil de Conversão do Rolê (Passo a Passo) */}
        <div className="rounded-3xl border border-white/10 bg-[#090d18] p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-black text-white">Funil de Conversão do Rolê</h3>
              </div>
              <span className="text-[10px] text-cyan-300 font-black rounded bg-cyan-500/20 px-2 py-0.5">
                Alta Retenção
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Jornada do usuário paulistano desde a descoberta até a entrada na portaria.
            </p>

            <div className="space-y-3">
              {funnelSteps.map((step) => {
                const IconComponent = step.icon;
                return (
                  <div key={step.step} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <IconComponent className="h-3.5 w-3.5 text-slate-400" />
                        <span>{step.step}</span>
                      </span>
                      <span className="font-mono text-white font-extrabold text-[11px]">
                        {step.value.toLocaleString("pt-BR")}
                        <span className="text-slate-400 font-normal ml-1">({step.pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${step.color} transition-all duration-500`}
                        style={{ width: `${Math.max(5, step.pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Conversão Geral: <strong className="text-emerald-400">6.8%</strong></span>
            <button
              type="button"
              onClick={() => onNavigateTab("leads")}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Lista VIP</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Gráfico 5: Top 5 Bairros Mais Badalados de SP */}
        <div className="rounded-3xl border border-white/10 bg-[#090d18] p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-black text-white">Top 5 Bairros Mais Badalados</h3>
              </div>
              <span className="text-[10px] text-amber-300 font-black rounded bg-amber-500/20 px-2 py-0.5">
                Picos SP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Regiões com maior concentração de buscas e corridas de Uber na noite.
            </p>

            <div className="space-y-3">
              {topNeighborhoods.map((b, idx) => {
                const maxViews = Math.max(1, topNeighborhoods[0]?.visualizacoes || 1);
                const pct = Math.round((b.visualizacoes / maxViews) * 100);
                const medals = ["🥇", "🥈", "🥉", "4º", "5º"];

                return (
                  <div key={b.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="text-xs">{medals[idx]}</span>
                        <span>{b.name}</span>
                        <span className="text-[10px] text-slate-500 font-normal">({b.locais} casas)</span>
                      </span>
                      <span className="font-mono text-cyan-300 font-extrabold text-[11px]">
                        {b.visualizacoes.toLocaleString("pt-BR")} views
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Zona Oeste e Sul lideram em SP</span>
            <button
              type="button"
              onClick={() => onNavigateTab("venues")}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Explorar Locais</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Ranking Top 5 Estabelecimentos da Semana + Ações Diretas */}
      <div className="rounded-3xl border border-white/10 bg-[#090d18] p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              <span>Ranking dos Estabelecimentos Mais Fortes da Semana</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Casas com maior tração orgânica, disparos de WhatsApp e emissão de vouchers na plataforma.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("venues")}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <span>Ver Todas as {venues.length} Casas</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Posição & Local</th>
                <th className="py-2.5 px-3">Bairro / Região</th>
                <th className="py-2.5 px-3 text-center">Visualizações</th>
                <th className="py-2.5 px-3 text-center">Cliques Perfil</th>
                <th className="py-2.5 px-3 text-center">WhatsApp Direto</th>
                <th className="py-2.5 px-3 text-center">Plano SaaS</th>
                <th className="py-2.5 px-3 text-right">Ação Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topVenues.map((v, idx) => {
                const medals = ["🥇", "🥈", "🥉", "4º", "5º"];
                return (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base shrink-0">{medals[idx]}</span>
                        <div>
                          <span className="font-extrabold text-white text-sm block">{v.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {v.subType || v.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded-full bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 text-[11px] font-medium">
                        📍 {v.neighborhood}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-white font-mono">
                      {v.metrics.impressionsFeed.toLocaleString("pt-BR")}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-cyan-300 font-mono">
                      {v.metrics.profileClicks.toLocaleString("pt-BR")}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-400 font-mono">
                      {v.metrics.whatsappDirectClicks.toLocaleString("pt-BR")}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black px-2 py-0.5 text-[10px]">
                        R$ {OFFICIAL_PLAN_PRICE},00/mês
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {onSelectVenueForInspection ? (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectVenueForInspection(v.id);
                            onNavigateTab("analytics");
                          }}
                          className="inline-flex items-center gap-1 rounded-xl bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer"
                        >
                          <BarChart3 className="h-3 w-3" />
                          <span>Inspecionar</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Destaque 🔥</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
