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

export const Route = createFileRoute("/baixar")({
  component: BaixarAppPage,
});

export function BaixarAppPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
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
    const ios = /iphone|ipad|ipod/.test(ua);
    const android = /android/.test(ua);
    const inApp = /instagram|fbav|fban|tiktok|micromessenger|threads|wv/i.test(ua);

    setIsIos(ios);
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

          <h1 className="mt-5 text-2xl sm:text-3xl font-black text-white tracking-tight">
            Baixar Radar do Rolê
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300">
            O radar oficial da vida noturna de São Paulo direto na sua tela inicial!
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
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <span>Acessar a versão Web sem baixar agora</span>
              <ArrowRight className="h-3.5 w-3.5" />
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
                    {isIos ? "Pelo navegador Safari" : "Pelo Google Chrome ou Samsung"}
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
              <div className="mt-4 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 font-black">1</span>
                  <div>
                    <p className="font-bold text-white flex items-center gap-1.5">
                      Toque no botão Compartilhar <Share className="h-3.5 w-3.5 text-cyan-400" />
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Na barra inferior do Safari (ícone quadrado com seta pra cima).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500/20 text-pink-300 font-black">2</span>
                  <div>
                    <p className="font-bold text-white flex items-center gap-1.5">
                      "Adicionar à Tela de Início" <PlusSquare className="h-3.5 w-3.5 text-pink-400" />
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Toque em "Adicionar" no topo direito e pronto!</p>
                  </div>
                </div>
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
    </div>
  );
}

export default BaixarAppPage;
