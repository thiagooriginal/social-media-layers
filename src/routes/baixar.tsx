import React, { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  MoreVertical,
  Sparkles,
  Check,
  ArrowRight,
  ExternalLink,
  Globe,
  Flame,
  ShieldCheck,
  RotateCcw,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/baixar")({
  component: BaixarAppPage,
});

export function BaixarAppPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isChromeIos, setIsChromeIos] = useState(false);
  const [iosBrowserTab, setIosBrowserTab] = useState<"chrome" | "safari">("safari");
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect standalone PWA
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");
    setIsStandalone(standalone);

    // Detect OS & Webview
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const chromeIos = ios && /crios/.test(ua);
    const android = /android/.test(ua);
    const inApp = /instagram|fbav|fban|tiktok|micromessenger|threads|wv/i.test(ua);

    setIsIos(ios);
    setIsChromeIos(chromeIos);
    if (chromeIos) {
      setIosBrowserTab("chrome");
    } else {
      setIosBrowserTab("safari");
    }
    setIsAndroid(android);
    setIsInAppBrowser(inApp);

    // Capture beforeinstallprompt if available
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).__pwaDeferredPrompt = e;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // App installed event
    const handleInstalled = () => {
      setInstalledSuccess(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  // Launch external Chrome via Android Intent (critical for Instagram breakout)
  const openExternalChrome = () => {
    try {
      const host = window.location.host;
      const chromeIntent = `intent://${host}/baixar#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = chromeIntent;

      setTimeout(() => {
        window.open(`https://${host}/baixar`, "_system");
      }, 800);
    } catch (e) {
      window.open(window.location.href, "_blank");
    }
  };

  // Trigger Installation Action
  const handleInstallClick = async () => {
    if (isIos) {
      setShowGuide(true);
      return;
    }

    if (isInAppBrowser) {
      openExternalChrome();
      return;
    }

    const activePrompt = deferredPrompt || (typeof window !== "undefined" ? (window as any).__pwaDeferredPrompt : null);

    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstalledSuccess(true);
        }
        setDeferredPrompt(null);
        if (typeof window !== "undefined") {
          (window as any).__pwaDeferredPrompt = null;
        }
        return;
      } catch (err) {
        console.warn("Install prompt error:", err);
      }
    }

    // If native prompt is not ready/consumed, show guide modal
    setShowGuide(true);
  };

  const [showBottomPointer, setShowBottomPointer] = useState(false);

  const handleTriggerShare = () => {
    setShowGuide(false);
    setShowBottomPointer(true);
    toast.info("Olhe no rodapé do seu iPhone e toque no ícone ⬆️. Depois role a listinha para baixo!", {
      duration: 6000,
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://radardorole.com.br/baixar");
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (e) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col justify-between p-4 sm:p-6 selection:bg-purple-600 selection:text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

      {/* Top Bar Header */}
      <header className="relative z-10 mx-auto max-w-md w-full flex items-center justify-between pt-2">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-xs font-black text-white hover:text-cyan-300 transition-colors"
        >
          <img
            src="/logo-official.jpg"
            alt="Radar do Rolê"
            className="h-8 w-8 rounded-xl object-cover border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          />
          <span className="text-sm font-black tracking-tight">Radar do Rolê</span>
        </Link>

        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[10px] font-black text-emerald-300">
          <ShieldCheck className="h-3 w-3" />
          <span>APP OFICIAL</span>
        </span>
      </header>

      {/* Main Download Card */}
      <main className="relative z-10 mx-auto max-w-md w-full my-auto py-8">
        <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-[#0e1424]/90 via-[#0a0e1c]/95 to-[#120a1f]/90 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.25)] text-center">
          
          {/* Logo with Animated Ambient Halo */}
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 p-[3px] shadow-[0_0_40px_rgba(6,182,212,0.6)]">
            <img
              src="/logo-official.jpg"
              alt="Radar do Rolê Ícone"
              className="h-full w-full rounded-[22px] object-cover"
            />
            <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-pink-500 text-sm text-white shadow-lg border-2 border-[#0e1424]">
              📲
            </span>
          </div>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[11px] font-bold text-emerald-300">
            <span>✓ O Radar funciona 100% no seu navegador!</span>
          </div>

          <h1 className="mt-3 text-2xl sm:text-3xl font-black text-white tracking-tight">
            Instalar App (Opcional)
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300">
            A versão web atende tudo perfeitamente. Se quiser um atalho na tela inicial do celular, você pode instalar abaixo:
          </p>

          {/* Key Advantages Grid */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-left">
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-2.5">
              <span className="text-base">⚡</span>
              <p className="text-[11px] font-black text-white mt-1">Super Rápido</p>
              <p className="text-[9px] text-slate-400">Abre em 1 segundo</p>
            </div>
            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-2.5">
              <span className="text-base">📱</span>
              <p className="text-[11px] font-black text-white mt-1">Tela Cheia</p>
              <p className="text-[9px] text-slate-400">Sem barra de site</p>
            </div>
            <div className="rounded-2xl border border-pink-500/30 bg-pink-950/20 p-2.5">
              <span className="text-base">🎟️</span>
              <p className="text-[11px] font-black text-white mt-1">Lista VIP</p>
              <p className="text-[9px] text-slate-400">Benefícios nas casas</p>
            </div>
          </div>

          {/* Success Banner if Installed */}
          {installedSuccess && (
            <div className="mt-5 rounded-2xl border border-emerald-500/50 bg-emerald-500/15 p-4 text-xs font-bold text-emerald-300 flex items-center gap-2">
              <Check className="h-5 w-5 shrink-0 text-emerald-400" />
              <span>✓ Aplicativo instalado com sucesso! O ícone oficial já está na tela inicial do seu celular.</span>
            </div>
          )}

          {/* In-App Browser Warning (Instagram/TikTok) */}
          {isInAppBrowser && !installedSuccess && (
            <div className="mt-5 rounded-2xl border border-pink-500/40 bg-pink-950/30 p-3.5 text-left text-xs text-pink-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-pink-400 animate-ping"></span>
                <span>{isIos ? "Navegador do Instagram no iPhone" : "Navegador do Instagram Detectado"}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isIos ? (
                  <>
                    No iPhone, toque nos <strong>3 pontinhos (...)</strong> no topo do Instagram e escolha <strong>"Abrir no Safari"</strong>. Depois toque em <strong>Compartilhar ⬆️</strong> e em <strong>"Adicionar à Tela de Início"</strong>!
                  </>
                ) : (
                  <>
                    O Instagram não permite instalar apps por dentro dele. Toque no botão abaixo para abrir no <strong>Google Chrome</strong> e baixar com 1 toque!
                  </>
                )}
              </p>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="mt-6 space-y-3">
            {isInAppBrowser ? (
              isIos ? (
                <button
                  type="button"
                  onClick={() => setShowGuide(true)}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 py-4 px-6 text-sm font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(168,85,247,0.6)] cursor-pointer"
                >
                  <Share className="h-5 w-5" />
                  <span>Ver Como Instalar no iPhone</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openExternalChrome}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 py-4 px-6 text-sm font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(6,182,212,0.6)] cursor-pointer"
                >
                  <Globe className="h-5 w-5" />
                  <span>Abrir no Google Chrome para Baixar</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 py-4 px-6 text-sm font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(6,182,212,0.6)] cursor-pointer"
              >
                <Download className="h-5 w-5 animate-bounce" />
                <span>{isIos ? "ADICIONAR À TELA DE INÍCIO (IPHONE)" : "BAIXAR / INSTALAR AGORA"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">Link Direto Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-slate-400" />
                  <span>Copiar Link Direto para Compartilhar</span>
                </>
              )}
            </button>
          </div>

          {/* Fallback to Web Version */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 py-3.5 text-xs font-black text-cyan-300 transition-all cursor-pointer shadow-sm"
            >
              <span>Navegar no Radar do Rolê Agora (Versão Web)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mx-auto max-w-md w-full text-center pb-2 text-[11px] text-slate-500">
        Radar do Rolê © {new Date().getFullYear()} • Baladas, Bares e Motéis em SP
      </footer>

      {/* Guide Modal when prompted or clicked */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setShowGuide(false)} />
          <div className="relative w-full max-w-sm rounded-3xl border border-cyan-500/40 bg-[#0c101c] p-6 text-slate-100 shadow-[0_0_50px_rgba(6,182,212,0.35)] z-10 animate-in slide-in-from-bottom-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Smartphone className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {isIos ? "Instalar no iPhone" : "Instalar no Android"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isIos ? "Adicione à Tela de Início em segundos" : "Pelo Google Chrome ou Samsung"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {isIos ? (
              <div className="mt-4 space-y-3">
                {/* Browser Selector Tabs for iOS */}
                <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setIosBrowserTab("chrome")}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                      iosBrowserTab === "chrome"
                        ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-sm font-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    No Google Chrome (...)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIosBrowserTab("safari")}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                      iosBrowserTab === "safari"
                        ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-sm font-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    No Safari (⬆️)
                  </button>
                </div>

                {iosBrowserTab === "chrome" ? (
                  <div className="space-y-2.5 text-xs text-slate-300">
                    {/* Visual Bar Simulation for Chrome */}
                    <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-2.5 text-center">
                      <p className="text-[10px] text-purple-300 font-bold mb-1.5 flex items-center justify-center gap-1">
                        <span>🌐</span> Barra no rodapé do Google Chrome:
                      </p>
                      <div className="flex items-center justify-between text-slate-500 py-1.5 px-3 bg-[#080d1a] rounded-xl border border-white/10">
                        <span className="text-sm font-bold text-slate-400">‹</span>
                        <span className="text-[10px] text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                          radardorole.com.br
                        </span>
                        <button
                          type="button"
                          onClick={handleTriggerShare}
                          className="relative flex flex-col items-center group cursor-pointer active:scale-90 transition-transform"
                        >
                          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-pulse">
                            <MoreVertical className="h-4 w-4" />
                          </div>
                          <span className="text-[8px] font-black text-purple-300 mt-0.5 tracking-tighter">3 PONTINHOS</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleTriggerShare}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-3.5 px-4 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(168,85,247,0.45)] cursor-pointer"
                    >
                      <Share className="h-4 w-4" />
                      <span>ABRIR MENU DO IPHONE AGORA</span>
                    </button>

                    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 text-[11px] text-amber-200 flex items-start gap-2">
                      <span className="text-base shrink-0">👇</span>
                      <span>
                        <strong>Dica:</strong> Toque nos <strong>3 pontinhos (...)</strong> na barra cinza do próprio Google Chrome, bem no rodapé da sua tela (fora deste aviso).
                      </span>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 font-black">1</span>
                      <div>
                        <p className="font-bold text-white flex items-center gap-1.5">
                          Toque nos 3 Pontinhos [ ... ]
                          <MoreVertical className="h-3.5 w-3.5 text-purple-400" />
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          No canto inferior direito da barra do seu Google Chrome.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-pink-300 font-black">2</span>
                      <div>
                        <p className="font-bold text-white flex items-center gap-1.5">
                          "Adicionar à tela de início"
                          <PlusSquare className="h-3.5 w-3.5 text-pink-400" />
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Role o menu para baixo e selecione <strong>"Adicionar à tela de início"</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 font-black">3</span>
                      <div>
                        <p className="font-bold text-white flex items-center gap-1.5">
                          Confirme em "Adicionar"
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Toque em "Adicionar" no topo direito. O app é criado na tela inicial!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs text-slate-300">
                    {/* Visual Bar Simulation for Safari */}
                    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-2.5 text-center">
                      <p className="text-[10px] text-cyan-300 font-bold mb-1.5 flex items-center justify-center gap-1">
                        <span>🧭</span> Barra no rodapé do Safari:
                      </p>
                      <div className="flex items-center justify-around text-slate-500 py-1.5 px-3 bg-[#080d1a] rounded-xl border border-white/10">
                        <span className="text-sm font-bold text-slate-400">‹</span>
                        <span className="text-sm font-bold text-slate-400">›</span>
                        <button
                          type="button"
                          onClick={handleTriggerShare}
                          className="relative flex flex-col items-center group cursor-pointer active:scale-90 transition-transform"
                        >
                          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-cyan-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse">
                            <Share className="h-4 w-4" />
                          </div>
                          <span className="text-[8px] font-black text-cyan-300 mt-0.5 tracking-tighter">COMPARTILHAR</span>
                        </button>
                        <span className="text-sm text-slate-400">📖</span>
                        <span className="text-sm text-slate-400">⧉</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleTriggerShare}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 py-3.5 px-4 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(6,182,212,0.45)] cursor-pointer"
                    >
                      <span>ENTENDI, VOU TOCAR NO BOTÃO DO SAFARI ⬇️</span>
                    </button>

                    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 text-[11px] text-amber-200 flex items-start gap-2">
                      <span className="text-base shrink-0">⚠️</span>
                      <span>
                        <strong>Importante:</strong> Na tela que subir, <strong>arraste a listinha para cima (role para baixo)</strong>! O botão <strong>"Adicionar à Tela de Início"</strong> fica logo abaixo de "Copiar"!
                      </span>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-black">1</span>
                      <div>
                        <p className="font-bold text-white flex items-center gap-1.5">
                          1. Toque no botão Compartilhar <Share className="h-3.5 w-3.5 text-cyan-400" />
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Fica bem no centro da barra inferior do Safari (o ícone de quadrado com a seta para cima, no rodapé do celular).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border-2 border-pink-500/40 bg-pink-950/20 p-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-pink-300 font-black">2</span>
                      <div>
                        <p className="font-bold text-white flex items-center gap-1.5">
                          2. Role a lista para baixo! <PlusSquare className="h-3.5 w-3.5 text-pink-400" />
                        </p>
                        <p className="text-[10px] text-pink-200 mt-0.5 font-semibold">
                          Na gaveta que abrir, deslize o dedo para cima para rolar. A opção com o sinal de <strong>[+] "Adicionar à Tela de Início"</strong> está um pouco mais para baixo!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 font-black">3</span>
                      <div>
                        <p className="font-bold text-white flex items-center gap-1.5">
                          3. Confirme em "Adicionar" <Check className="h-3.5 w-3.5 text-emerald-400" />
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          No canto superior direito da tela, toque em <strong>"Adicionar"</strong> e pronto! O ícone oficial do Radar do Rolê já estará na sua tela inicial!
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5 text-[11px] text-emerald-300 leading-snug">
                      ✨ <strong>Vantagem:</strong> O app abre em tela inteira, super rápido, e não ocupa o espaço de memória do seu iPhone!
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-black">1</span>
                  <div>
                    <p className="font-bold text-white flex items-center gap-1.5">
                      Toque nos 3 Pontinhos [ ⋮ ] do Chrome <MoreVertical className="h-3.5 w-3.5 text-cyan-400" />
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">No topo direito da tela do Google Chrome.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-purple-500/30 bg-purple-950/30 p-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 font-black">2</span>
                  <div>
                    <p className="font-bold text-white flex items-center gap-1.5">
                      "Instalar aplicativo" ou "Adicionar à tela inicial" <PlusSquare className="h-3.5 w-3.5 text-purple-400" />
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">O ícone oficial do Radar do Rolê será adicionado ao celular!</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 py-3 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Recarregar Página e Tentar de Novo</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                Entendi, fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Pointer on iPhone */}
      {showBottomPointer && (
        <div className="fixed bottom-3 left-3 right-3 z-50 rounded-2xl border-2 border-cyan-400 bg-[#0c1020]/95 backdrop-blur-xl p-4 text-center text-white shadow-[0_0_50px_rgba(6,182,212,0.8)] animate-bounce">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
              <span>⬇️</span>
              <span>TOQUE NO BOTÃO ⬆️ DA BARRA DO SAFARI LOGO ABAIXO</span>
            </span>
            <button
              onClick={() => setShowBottomPointer(false)}
              className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded-lg bg-white/10 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-slate-200 mt-2 font-semibold leading-relaxed">
            Na gaveta que subir, <strong>arraste a lista para cima (role para baixo)</strong> até achar o botão <strong>"Adicionar à Tela de Início" [+]</strong>!
          </p>
        </div>
      )}
    </div>
  );
}

export default BaixarAppPage;
