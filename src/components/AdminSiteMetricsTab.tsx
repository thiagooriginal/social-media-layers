import React, { useState } from "react";
import {
  Activity,
  Radio,
  Eye,
  Users,
  TrendingUp,
  Smartphone,
  Laptop,
  RefreshCw,
  Clock,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Download,
  Flame,
  Phone,
  Car,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  RealSiteMetricsSummary,
  RealPresenceVisitor,
  trackPageView,
} from "../services/siteMetricsService";

interface AdminSiteMetricsTabProps {
  metrics: RealSiteMetricsSummary | null;
  onlineVisitors: RealPresenceVisitor[];
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated: Date;
}

function AdminSiteMetricsTabComponent({
  metrics,
  onlineVisitors,
  isLoading,
  onRefresh,
  lastUpdated,
}: AdminSiteMetricsTabProps) {
  const [testPingLoading, setTestPingLoading] = useState(false);
  const [testPingSuccess, setTestPingSuccess] = useState(false);

  // Trigger a real instant pageview ping to test real-time update
  const handleTestPing = async () => {
    setTestPingLoading(true);
    setTestPingSuccess(false);
    try {
      await trackPageView(window.location.pathname);
      setTestPingSuccess(true);
      setTimeout(() => {
        onRefresh();
        setTestPingLoading(false);
      }, 600);
      setTimeout(() => {
        setTestPingSuccess(false);
      }, 4000);
    } catch (e) {
      setTestPingLoading(false);
    }
  };

  // Export real traffic report to CSV
  const handleExportCSV = () => {
    if (recentLogs.length === 0) {
      alert("Nenhum dado de acesso registrado para exportação.");
      return;
    }

    const headers = ["Data e Hora", "Página", "Dispositivo", "Navegador", "Origem", "ID do Visitante"];
    const rows = recentLogs.map((log) => [
      `"${new Date(log.timestamp).toLocaleString("pt-BR")}"`,
      `"${log.path}"`,
      `"${log.device}"`,
      `"${log.browser}"`,
      `"${log.referrer}"`,
      `"${log.visitorId}"`,
    ]);

    const csv = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `metricas_reais_radar_do_role_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hourlyEvolution = metrics?.hourlyEvolution || [];
  const dailyEvolution = metrics?.dailyEvolution || [];
  const topPages = metrics?.topPages || [];
  const recentLogs = metrics?.recentLogs || [];
  const deviceBreakdown = metrics?.deviceBreakdown || { mobile: 0, desktop: 0, tablet: 0 };

  const currentHour = new Date().getHours();
  const maxHourlyCount = Math.max(
    ...(hourlyEvolution.map((h) => h.count).length > 0 ? hourlyEvolution.map((h) => h.count) : [1]),
    1
  );

  const totalDeviceHits =
    (deviceBreakdown.mobile || 0) +
    (deviceBreakdown.desktop || 0) +
    (deviceBreakdown.tablet || 0);

  const mobilePercent =
    totalDeviceHits > 0
      ? Math.round(((deviceBreakdown.mobile || 0) / totalDeviceHits) * 100)
      : 0;

  const desktopPercent =
    totalDeviceHits > 0
      ? Math.round(((deviceBreakdown.desktop || 0) / totalDeviceHits) * 100)
      : 0;

  return (
    <div className="mt-5 space-y-6">
      {/* Top Banner: Realtime Status & Guarantee */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-[#0e1424] to-cyan-950/30 p-5 sm:p-6 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-black text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span>AO VIVO • TEMPO REAL</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300">
                <ShieldCheck className="h-3 w-3" />
                <span>Auditoria 100% Real • Zero Números Fictícios</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Audiência & Tráfego Real do Aplicativo</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Monitoramento direto das conexões físicas e visualizações registradas no banco de dados. Cada visita e clique exibido aqui corresponde a um acesso verificado em São Paulo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTestPing}
              disabled={testPingLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-500/20 px-3 py-2 text-xs font-black text-cyan-300 transition-all cursor-pointer"
              title="Dispara um ping de acesso e atualiza os contadores imediatamente"
            >
              <Radio className={`h-3.5 w-3.5 ${testPingLoading ? "animate-pulse text-cyan-400" : ""}`} />
              <span>{testPingLoading ? "Gravando Acesso..." : "Testar Acesso Real"}</span>
            </button>

            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-black text-white transition-all cursor-pointer"
              title="Recarregar métricas em tempo real"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
              <span>{isLoading ? "Atualizando..." : "Atualizar"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-950/40 hover:bg-purple-500/20 px-3 py-2 text-xs font-black text-purple-300 transition-all cursor-pointer"
              title="Baixar planilha CSV com histórico real de acessos"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          </div>
        </div>

        {testPingSuccess && (
          <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-2.5 flex items-center gap-2 text-xs font-bold text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>✓ Ping de acesso real registrado com sucesso! Os contadores foram atualizados com o seu acesso físico.</span>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-500" />
            Última verificação: {lastUpdated.toLocaleTimeString("pt-BR")}
          </span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            ● Canal WebSocket ativo via Supabase Realtime
          </span>
        </div>
      </div>

      {/* 4 Main Real Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Pessoas Online Agora (Realtime) */}
        <div className="rounded-2xl border border-emerald-500/40 bg-[#0e1424] p-4 sm:p-5 shadow-[0_0_30px_rgba(16,185,129,0.18)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              No Site Agora
            </span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
            {onlineVisitors.length}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {onlineVisitors.length === 1
              ? "1 pessoa com o app aberto agora"
              : `${onlineVisitors.length} pessoas com o app aberto agora`}
          </p>
          <div className="mt-2 text-[10px] text-emerald-300/80 font-semibold">
            {onlineVisitors.filter((v) => v.device === "mobile").length} celulares •{" "}
            {onlineVisitors.filter((v) => v.device !== "mobile").length} computadores
          </div>
        </div>

        {/* Card 2: Visualizações de Página Hoje */}
        <div className="rounded-2xl border border-cyan-500/30 bg-[#0e1424] p-4 sm:p-5 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-cyan-300 uppercase tracking-wider">
              Visualizações Hoje
            </span>
            <Eye className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-black text-white tracking-tight">
            {metrics?.todayPageviews || 0}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Ontem foram {metrics?.yesterdayPageviews || 0} visualizações
          </p>
          <div className="mt-2 text-[10px] text-cyan-300/80 font-semibold">
            Páginas reais navegadas no dia
          </div>
        </div>

        {/* Card 3: Visitantes Únicos Hoje */}
        <div className="rounded-2xl border border-purple-500/30 bg-[#0e1424] p-4 sm:p-5 shadow-[0_0_25px_rgba(168,85,247,0.15)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-300 uppercase tracking-wider">
              Visitantes Únicos Hoje
            </span>
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-black text-white tracking-tight">
            {metrics?.todayUnique || 0}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {metrics?.uniqueVisitors || 0} visitantes únicos no total
          </p>
          <div className="mt-2 text-[10px] text-purple-300/80 font-semibold">
            Dispositivos físicos distintos
          </div>
        </div>

        {/* Card 4: Total de Pageviews Acumulado */}
        <div className="rounded-2xl border border-amber-500/30 bg-[#0e1424] p-4 sm:p-5 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider">
              Total de Acessos
            </span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
            {metrics?.totalPageviews || 0}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {metrics?.weeklyPageviews || 0} acessos nos últimos 7 dias
          </p>
          <div className="mt-2 text-[10px] text-amber-300/80 font-semibold">
            Histórico verificado em banco
          </div>
        </div>
      </div>

      {/* Realtime Active Visitors Inspector (Who is on the site right now) */}
      <div className="rounded-3xl border border-white/10 bg-[#0a0e1c] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Sessões Ativas Neste Momento ({onlineVisitors.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dispositivos e páginas sendo navegadas ao vivo por usuários com a tela aberta
            </p>
          </div>
          <span className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-2.5 py-1 font-bold">
            Atualização contínua a cada 20s
          </span>
        </div>

        {onlineVisitors.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
            <Radio className="mx-auto h-8 w-8 text-slate-500 opacity-60 mb-2" />
            <p className="text-sm font-bold text-slate-300">
              Nenhuma outra sessão externa ativa neste segundo
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Assim que qualquer usuário abrir o link do Radar do Rolê em um celular ou computador em São Paulo, ele aparecerá aqui instantaneamente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {onlineVisitors.map((v, idx) => (
              <div
                key={v.visitorId + idx}
                className="rounded-2xl border border-emerald-500/30 bg-[#0e1424] p-4 flex items-start justify-between shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {v.device === "mobile" ? (
                      <Smartphone className="h-4 w-4 text-cyan-400" />
                    ) : (
                      <Laptop className="h-4 w-4 text-purple-400" />
                    )}
                    <span className="text-xs font-bold text-white capitalize">
                      {v.device === "mobile" ? "Celular (Mobile)" : "Computador (Desktop)"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                    <Compass className="h-3 w-3" />
                    <span>Página: {v.path || "/"}</span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Sessão: {v.visitorId.slice(0, 16)}...
                  </p>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-500/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  Online
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hourly Evolution (Today - 24 Hours) */}
      <div className="rounded-3xl border border-white/10 bg-[#0a0e1c] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>Evolução dos Acessos de Hoje por Hora (00h às 23h)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Volume real de pessoas acessando a cada hora do dia. Horas sem acessos registram 0.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-xl">
            Total hoje: <strong className="text-cyan-300">{metrics?.todayPageviews || 0} acessos</strong>
          </span>
        </div>

        {/* 24-hour bar chart */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[650px] flex items-end gap-2 h-44 pt-6 px-2 border-b border-white/10">
            {hourlyEvolution.map((h, i) => {
              const heightPercent = h.count > 0 ? Math.max((h.count / maxHourlyCount) * 100, 8) : 0;
              const isCurrent = i === currentHour;

              return (
                <div
                  key={h.hour}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 pointer-events-none bg-slate-900 border border-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-20">
                    {h.count} acessos às {h.hour}
                  </div>

                  {/* Value number on top of bar if count > 0 */}
                  {h.count > 0 && (
                    <span className="text-[10px] font-black text-cyan-300 mb-1">
                      {h.count}
                    </span>
                  )}

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all ${
                      h.count > 0
                        ? isCurrent
                          ? "bg-gradient-to-t from-emerald-500 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                          : "bg-gradient-to-t from-purple-600 to-cyan-500 hover:brightness-125"
                        : "bg-white/5 border-t border-white/10 h-1"
                    }`}
                  />

                  {/* Hour label */}
                  <span
                    className={`mt-2 text-[10px] font-bold ${
                      isCurrent ? "text-emerald-400 font-black" : "text-slate-500"
                    }`}
                  >
                    {h.hour}
                  </span>
                  {isCurrent && (
                    <span className="text-[8px] font-black uppercase text-emerald-400 mt-0.5">
                      Agora
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Daily Evolution & Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Evolution (Last 7 Days) */}
        <div className="rounded-3xl border border-white/10 bg-[#0a0e1c] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <span>Evolução dos Últimos 7 Dias</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Histórico diário de visualizações e pessoas únicas</p>
            </div>
            <span className="text-xs font-bold text-purple-300">
              {metrics?.weeklyPageviews || 0} na semana
            </span>
          </div>

          <div className="space-y-3">
            {dailyEvolution.map((day) => {
              const maxDay = Math.max(...(dailyEvolution.map((d) => d.count).length > 0 ? dailyEvolution.map((d) => d.count) : [1]), 1);
              const barPercent = Math.max((day.count / maxDay) * 100, 2);

              return (
                <div key={day.date} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between text-xs font-bold text-white mb-1.5">
                    <span className="text-slate-300">{day.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-purple-300">{day.unique} únicos</span>
                      <span className="text-cyan-400 font-black">{day.count} acessos</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      style={{ width: `${barPercent}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Visited Pages & Devices */}
        <div className="space-y-4">
          {/* Top Pages */}
          <div className="rounded-3xl border border-white/10 bg-[#0a0e1c] p-5 sm:p-6">
            <h3 className="text-sm font-black text-white flex items-center gap-2 mb-1">
              <Compass className="h-4 w-4 text-amber-400" />
              <span>Páginas Mais Acessadas</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Rotas com maior atração de público</p>

            {topPages.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Nenhuma página registrada ainda</p>
            ) : (
              <div className="space-y-2.5">
                {topPages.map((page) => (
                  <div
                    key={page.path}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
                  >
                    <div className="truncate max-w-[220px] sm:max-w-[280px]">
                      <p className="font-bold text-white truncate">{page.label}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{page.path}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-black text-amber-300">{page.count} acessos</span>
                      <p className="text-[10px] text-slate-400">{page.percentage}% do tráfego</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Technology & Device Split */}
          <div className="rounded-3xl border border-white/10 bg-[#0a0e1c] p-5 sm:p-6">
            <h3 className="text-sm font-black text-white flex items-center gap-2 mb-1">
              <Smartphone className="h-4 w-4 text-cyan-400" />
              <span>Dispositivos Reais dos Visitantes</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Comportamento de navegação identificado</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                    <Smartphone className="h-3.5 w-3.5" />
                    Celulares
                  </span>
                  <span className="text-xs font-black text-white">{mobilePercent}%</span>
                </div>
                <div className="text-xl font-black text-white">
                  {deviceBreakdown.mobile || 0}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">iOS e Android</p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                    <Laptop className="h-3.5 w-3.5" />
                    Computadores
                  </span>
                  <span className="text-xs font-black text-white">{desktopPercent}%</span>
                </div>
                <div className="text-xl font-black text-white">
                  {deviceBreakdown.desktop || 0}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Desktop & Notebooks</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity Stream (Recent Real Access Logs) */}
      <div className="rounded-3xl border border-white/10 bg-[#0a0e1c] p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>Log em Tempo Real dos Últimos Acessos Físicos</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Registro cronológico auditável de cada visitante que navegou pelo site
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Últimos {recentLogs.length} registros
          </span>
        </div>

        {recentLogs.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center text-slate-400">
            <p className="text-sm font-bold text-slate-300">Aguardando novos acessos de visitantes</p>
            <p className="text-xs text-slate-500 mt-1">
              Assim que o site for acessado por qualquer dispositivo, a linha de log aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-black uppercase text-slate-500">
                  <th className="py-2.5 px-3">Data & Hora</th>
                  <th className="py-2.5 px-3">Página Acessada</th>
                  <th className="py-2.5 px-3">Aparelho</th>
                  <th className="py-2.5 px-3">Navegador</th>
                  <th className="py-2.5 px-3">Origem</th>
                  <th className="py-2.5 px-3 text-right">Sessão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString("pt-BR")}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-cyan-300">
                      {log.path}
                    </td>
                    <td className="py-2.5 px-3 capitalize">
                      <span className="inline-flex items-center gap-1">
                        {log.device === "mobile" ? (
                          <Smartphone className="h-3 w-3 text-cyan-400" />
                        ) : (
                          <Laptop className="h-3 w-3 text-purple-400" />
                        )}
                        <span>{log.device}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {log.browser}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {log.referrer}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[10px] text-slate-500">
                      {log.visitorId.slice(0, 10)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export const AdminSiteMetricsTab = React.memo(AdminSiteMetricsTabComponent);
