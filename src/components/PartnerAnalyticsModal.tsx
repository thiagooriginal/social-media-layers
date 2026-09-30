import React, { useState, useMemo } from "react";
import {
  X,
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  Share2,
  MessageCircle,
  Ticket,
  Car,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Download,
  Building2,
  Instagram,
  Users,
  CheckCircle2,
  Flame,
  Zap,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { Venue } from "../data/venues";
import {
  getVenueMetrics,
  getWeeklyChartData,
  VenueMetrics,
} from "../services/analyticsService";

interface PartnerAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  venues: Venue[];
  initialVenueId?: string;
  isPartnerOnly?: boolean;
}

export function PartnerAnalyticsModal({
  isOpen,
  onClose,
  venues,
  initialVenueId,
  isPartnerOnly = false,
}: PartnerAnalyticsModalProps) {
  const [selectedVenueId, setSelectedVenueId] = useState<string>(() => {
    return initialVenueId || (venues[0] ? venues[0].id : "");
  });

  const [period, setPeriod] = useState<"7d" | "30d" | "hoje">("7d");
  const [activeTab, setActiveTab] = useState<"metrics" | "operations">("metrics");
  const [liveStatus, setLiveStatus] = useState<string>("Entrada Fluida / Sem Fila");
  const [isStatusSaved, setIsStatusSaved] = useState<boolean>(false);
  const [copiedInsta, setCopiedInsta] = useState<boolean>(false);

  // Keep selected venue in sync if initialVenueId changes or in partner mode
  React.useEffect(() => {
    if (initialVenueId) {
      setSelectedVenueId(initialVenueId);
    }
  }, [initialVenueId]);

  if (!isOpen) return null;

  const currentVenue = (isPartnerOnly && initialVenueId
    ? venues.find((v) => v.id === initialVenueId)
    : venues.find((v) => v.id === selectedVenueId)) || venues[0];

  const metrics: VenueMetrics = currentVenue
    ? getVenueMetrics(currentVenue.id, currentVenue.name)
    : {
        venueId: "",
        venueName: "",
        impressionsFeed: 0,
        profileClicks: 0,
        whatsappShares: 0,
        whatsappDirectClicks: 0,
        vipListLeads: 0,
        uberSimulations: 0,
        conversionRate: 0,
        weeklyGrowth: 0,
      };

  const weeklyData = getWeeklyChartData(metrics);

  const handleShareSummaryWhatsApp = () => {
    const text = encodeURIComponent(
      `📊 *Relatório de Desempenho - Radar do Rolê Insights*\n` +
      `🏢 *Estabelecimento:* ${currentVenue?.name}\n\n` +
      `👁️ *Visualizações no Feed:* ${metrics.impressionsFeed.toLocaleString("pt-BR")}\n` +
      `👆 *Cliques no Perfil:* ${metrics.profileClicks.toLocaleString("pt-BR")}\n` +
      `📲 *Compartilhamentos no WhatsApp:* ${metrics.whatsappShares.toLocaleString("pt-BR")}\n` +
      `💬 *Cliques no WhatsApp Oficial:* ${metrics.whatsappDirectClicks.toLocaleString("pt-BR")}\n` +
      `🎟️ *Listas VIP / Reservas:* ${metrics.vipListLeads.toLocaleString("pt-BR")}\n` +
      `🚗 *Rotas Uber Calculadas:* ${metrics.uberSimulations.toLocaleString("pt-BR")}\n` +
      `📈 *Crescimento Semanal:* +${metrics.weeklyGrowth}%\n\n` +
      `Acesse: https://baladaon-app.netlify.app`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 transition-all animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-purple-500/30 bg-[#0a0e19] p-5 sm:p-6 text-slate-100 shadow-[0_0_50px_-10px_rgba(168,85,247,0.4)] z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with Venue Selector or Locked Partner Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 text-2xl shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">
                  {isPartnerOnly ? "Relatório do Meu Estabelecimento" : "Relatório do Estabelecimento"}
                </h3>
                <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[10px] font-extrabold text-purple-300">
                  {isPartnerOnly ? "EXCLUSIVO" : "INSIGHTS"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isPartnerOnly
                  ? `Métricas exclusivas e em tempo real de ${currentVenue?.name || "seu local"}`
                  : "Métricas de alcance, cliques e conversão no Radar do Rolê"}
              </p>
            </div>
          </div>

          {/* Venue Picker Dropdown or Locked Partner Badge */}
          {isPartnerOnly ? (
            <div className="flex items-center gap-2.5 rounded-2xl border border-purple-500/40 bg-purple-950/40 px-3.5 py-2 text-xs font-bold text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Building2 className="h-4 w-4 text-purple-400 shrink-0" />
              <div className="text-left">
                <div className="text-white font-black truncate max-w-[200px] sm:max-w-xs">
                  {currentVenue?.subTypeEmoji} {currentVenue?.name}
                </div>
                <div className="text-[10px] text-purple-300">
                  {currentVenue?.neighborhood} • Estabelecimento Verificado
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <select
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#121829] py-2.5 px-3 pr-8 text-xs font-bold text-white focus:border-purple-500 focus:outline-none"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.subTypeEmoji} {v.name} ({v.neighborhood})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tab Switcher: Metrics vs Live Operations */}
        <div className="mt-4 flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-black transition-all cursor-pointer ${
              activeTab === "metrics"
                ? "border-purple-500 text-purple-300 bg-purple-500/10"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Métricas & Insights</span>
          </button>

          <button
            onClick={() => setActiveTab("operations")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-black transition-all cursor-pointer ${
              activeTab === "operations"
                ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Flame className="h-4 w-4 text-cyan-400" />
            <span>Gestão da Casa Ao Vivo</span>
          </button>
        </div>

        {activeTab === "metrics" ? (
          <>
            {/* Period Selector & Quick Share */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
            <button
              onClick={() => setPeriod("7d")}
              className={`rounded-lg px-3 py-1 font-bold transition-all ${
                period === "7d"
                  ? "bg-purple-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Últimos 7 dias
            </button>
            <button
              onClick={() => setPeriod("30d")}
              className={`rounded-lg px-3 py-1 font-bold transition-all ${
                period === "30d"
                  ? "bg-purple-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Últimos 30 dias
            </button>
            <button
              onClick={() => setPeriod("hoje")}
              className={`rounded-lg px-3 py-1 font-bold transition-all ${
                period === "hoje"
                  ? "bg-purple-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Hoje (Em tempo real)
            </button>
          </div>

          <button
            onClick={handleShareSummaryWhatsApp}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition-all"
          >
            <MessageCircle className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" />
            <span>Compartilhar no WhatsApp</span>
          </button>
        </div>

        {/* 6 Key Metric Cards (Instagram Insights style) */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* 1. Visualizações na Primeira Página */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Viram na 1ª Página</span>
              <Eye className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {metrics.impressionsFeed.toLocaleString("pt-BR")}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
              <ArrowUpRight className="h-3 w-3" />
              <span>+{metrics.weeklyGrowth}% essa semana</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Impressões no feed do bairro</p>
          </div>

          {/* 2. Clicaram para Abrir o Local */}
          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 relative overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            <div className="flex items-center justify-between text-purple-300">
              <span className="text-[11px] font-semibold">Cliques no Perfil</span>
              <MousePointerClick className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {metrics.profileClicks.toLocaleString("pt-BR")}
            </div>
            <div className="mt-1 text-[11px] text-purple-300 font-bold">
              CTR: {metrics.conversionRate}% de conversão
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Pessoas que abriram as fotos/detalhes</p>
          </div>

          {/* 3. Compartilhamentos no WhatsApp */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-emerald-300">
              <span className="text-[11px] font-semibold">Compartilharam no Zap</span>
              <Share2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {metrics.whatsappShares.toLocaleString("pt-BR")}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-300 font-bold">
              <span>🔥 Viralização nos grupos</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Enviaram para amigos irem juntos</p>
          </div>

          {/* 4. Contatos no WhatsApp Oficial */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Cliques no WhatsApp</span>
              <MessageCircle className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {metrics.whatsappDirectClicks.toLocaleString("pt-BR")}
            </div>
            <div className="mt-1 text-[11px] text-emerald-400 font-bold">
              Interesse de reserva imediata
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Conversas iniciadas diretamente</p>
          </div>

          {/* 5. Listas VIP / Vouchers Emitidos */}
          <div className="rounded-2xl border border-pink-500/30 bg-pink-500/10 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-pink-300">
              <span className="text-[11px] font-semibold">Listas VIP & Vouchers</span>
              <Ticket className="h-4 w-4 text-pink-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {metrics.vipListLeads.toLocaleString("pt-BR")}
            </div>
            <div className="mt-1 text-[11px] text-pink-300 font-bold">
              Nomes confirmados na portaria
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Leads qualificados gerados</p>
          </div>

          {/* 6. Simulações de Corrida Uber */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Rotas de Uber</span>
              <Car className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {metrics.uberSimulations.toLocaleString("pt-BR")}
            </div>
            <div className="mt-1 text-[11px] text-cyan-300 font-bold">
              Pessoas a caminho do local
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Intenção de visita presencial</p>
          </div>
        </div>

        {/* Weekly Chart Visualizer */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-400" />
                <span>Evolução Diária de Visualizações e Cliques</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Picos de procura na noite de São Paulo ao longo da semana
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                <span className="text-slate-300 text-[11px]">Visualizações</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-pink-500" />
                <span className="text-slate-300 text-[11px]">Cliques no Perfil</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="grid grid-cols-7 gap-2 pt-6 items-end h-44">
            {weeklyData.map((item, idx) => {
              const maxView = Math.max(...weeklyData.map((d) => d.visualizacoes));
              const heightPercent = Math.max(15, Math.round((item.visualizacoes / maxView) * 100));
              const isWeekendPeak = item.day === "Sex" || item.day === "Sáb";

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-bold">
                    {item.visualizacoes}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[36px] rounded-xl transition-all duration-300 group-hover:brightness-125 ${
                      isWeekendPeak
                        ? "bg-gradient-to-t from-purple-600 via-pink-600 to-amber-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                        : "bg-white/15 hover:bg-white/25"
                    }`}
                  />
                  <span
                    className={`mt-2 text-[11px] font-bold ${
                      isWeekendPeak ? "text-purple-300" : "text-slate-400"
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insight & Recommendation Banner */}
        <div className="mt-5 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-pink-950/20 to-transparent p-4 text-xs">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-base">
              💡
            </span>
            <div>
              <p className="font-extrabold text-white">Insight Inteligente do Radar do Rolê:</p>
              <p className="mt-0.5 text-slate-300 leading-relaxed">
                Seu maior pico de acessos acontece entre as <strong>20h30 e 23h45</strong> de Sexta e Sábado. Estabelecimentos com <strong>Lista VIP e botões de WhatsApp ativos</strong> convertem até <strong>3.2x mais clientes</strong> para a noite.
              </p>
            </div>
          </div>
        </div>
      </>
    ) : (
      /* Live Operations Tab */
      <div className="mt-5 space-y-5">
        {/* Status da Fila e Pista */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-cyan-400" />
              <h4 className="text-sm font-extrabold text-white">Status da Casa & Fila Ao Vivo</h4>
            </div>
            {isStatusSaved && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 animate-in fade-in">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Atualizado no Radar!
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Defina o status de movimento atual para atrair público em tempo real:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: "🟢 Entrada Fluida / Sem Fila", desc: "Acesso rápido sem espera" },
              { label: "🟡 Fila Moderada (15-20 min)", desc: "Fluxo padrão de balada" },
              { label: "🔴 Pista Cheia / Apenas Fila VIP", desc: "Casa com alta procura hoje" },
              { label: "🍹 Open Bar / Promoção Ativa", desc: "Destaque de benefício no feed" },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  setLiveStatus(s.label);
                  setIsStatusSaved(true);
                  setTimeout(() => setIsStatusSaved(false), 2500);
                }}
                className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  liveStatus === s.label
                    ? "border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <span className="text-xs font-bold text-white">{s.label}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Instagram Oficial do Parceiro */}
        <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-r from-purple-950/30 via-pink-950/20 to-slate-900/50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-md">
                <Instagram className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Instagram Oficial Vinculado</h4>
                <span className="text-xs font-bold text-pink-400">
                  @{currentVenue?.instagram ? currentVenue.instagram.replace(/^@/, "") : "não cadastrado"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentVenue?.instagram && (
                <a
                  href={`https://instagram.com/${currentVenue.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-pink-500/40 bg-pink-500/20 px-3 py-1.5 text-xs font-bold text-pink-300 hover:bg-pink-500/30 transition-all shadow-[0_0_12px_rgba(236,72,153,0.3)] cursor-pointer"
                >
                  <span>Testar Link</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <button
                onClick={() => {
                  if (currentVenue?.instagram) {
                    navigator.clipboard.writeText(`https://instagram.com/${currentVenue.instagram.replace(/^@/, "")}`);
                    setCopiedInsta(true);
                    setTimeout(() => setCopiedInsta(false), 2000);
                  }
                }}
                className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
              >
                {copiedInsta ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedInsta ? "Copiado!" : "Copiar"}</span>
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Os usuários do Radar do Rolê que clicarem no botão do Instagram no seu card ou modal são direcionados diretamente para o seu perfil oficial.
          </p>
        </div>

        {/* Gestão da Lista VIP & Portaria */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              <h4 className="text-sm font-extrabold text-white">Nomes na Lista VIP Hoje</h4>
            </div>
            <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 text-xs font-black text-purple-300">
              {metrics.vipListLeads} Pessoas Inscritas
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Conferência rápida dos convidados que geraram o voucher digital VIP do Radar:
          </p>
          <div className="rounded-xl border border-white/5 bg-black/40 p-3 text-xs font-mono text-slate-300 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-white/5">
              <span>CÓDIGO / TITULAR</span>
              <span>STATUS DA ENTRADA</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-cyan-300 font-bold">VIP-498213 • Lucas Mendes (+3 convidados)</span>
              <span className="text-emerald-400 font-bold">VALIDADO</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-cyan-300 font-bold">VIP-812049 • Camila Rocha (+1 convidado)</span>
              <span className="text-emerald-400 font-bold">AGUARDANDO CHEGADA</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-cyan-300 font-bold">VIP-309184 • Felipe Santana (+2 convidados)</span>
              <span className="text-emerald-400 font-bold">AGUARDANDO CHEGADA</span>
            </div>
          </div>
        </div>
      </div>
    )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Relatório gerado em tempo real com base no engajamento dos usuários.
          </p>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/15 transition-all"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
}
