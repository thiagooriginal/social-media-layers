import React, { useState, useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import {
  Download,
  X,
  Smartphone,
  Share,
  PlusSquare,
  MoreVertical,
  Sparkles,
  Check,
  ArrowRight,
  ExternalLink,
  Copy,
  Globe,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const location = useLocation();

  // Never show the floating popup on /baixar (which has its own full dedicated page) or /admin
  if (location.pathname.startsWith("/baixar") || location.pathname.startsWith("/admin")) {
    return null;
  }

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== "undefined") {
      return (window as any).__pwaDeferredPrompt || null;
    }
    return null;
  });
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isChromeIos, setIsChromeIos] = useState(false);
  const [iosBrowserTab, setIosBrowserTab] = useState<"chrome" | "safari">("safari");
  const [isAndroid, setIsAndroid] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  const [showBanner, setShowBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [showInAppGuide, setShowInAppGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Detect if running standalone (already installed as PWA)
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://");

    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    // 2. Detect mobile device, OS & In-App Webviews (Instagram, Facebook, TikTok, WhatsApp)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const chromeIos = isIosDevice && /crios/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    const isMobileDevice = isIosDevice || isAndroidDevice || window.innerWidth < 768;
    const inApp = /instagram|fbav|fban|tiktok|micromessenger|threads|wv/i.test(userAgent);

    setIsIos(isIosDevice);
    setIsChromeIos(chromeIos);
    if (chromeIos) {
      setIosBrowserTab("chrome");
    } else {
      setIosBrowserTab("safari");
    }
    setIsAndroid(isAndroidDevice);
    setIsMobile(isMobileDevice);
    setIsInAppBrowser(inApp);

    // 3. Check dismissal expiry (12 hours)
    const dismissedUntil = localStorage.getItem("radar_pwa_dismissed_until");
    const isDismissed = dismissedUntil && Date.now() < Number(dismissedUntil);

    // 4. Capture native beforeinstallprompt (Android / Chrome / Edge) for optional manual install
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      (window as any).__pwaDeferredPrompt = promptEvent;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 5. Web-first policy: DO NOT show automatic popups/banners.
    // Installation is 100% optional and only triggered if the user clicks a button.

    // 6. Detect successful app installation
    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setShowBanner(false);
      setShowAndroidGuide(false);
      setShowIosGuide(false);
      setShowInAppGuide(false);
      setDeferredPrompt(null);
      (window as any).__pwaDeferredPrompt = null;
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // 7. Global listener for manual trigger (Header 3-dots, feed banner, buttons)
    const handleManualOpen = async () => {
      const activePrompt = (window as any).__pwaDeferredPrompt || deferredPrompt;

      // If in-app browser (Instagram / TikTok), show breakout guide immediately
      if (inApp) {
        setShowBanner(false);
        setShowInAppGuide(true);
        return;
      }

      // If native deferred prompt is ready, trigger browser prompt directly!
      if (activePrompt) {
        try {
          await activePrompt.prompt();
          const choice = await activePrompt.userChoice;
          if (choice.outcome === "accepted") {
            setInstalledSuccess(true);
            setShowBanner(false);
          }
          setDeferredPrompt(null);
          (window as any).__pwaDeferredPrompt = null;
          return;
        } catch (err) {
          console.warn("Manual PWA install prompt failed:", err);
        }
      }

      // Otherwise show device-specific guide
      setShowBanner(false);
      if (isIosDevice) {
        setShowIosGuide(true);
      } else {
        setShowAndroidGuide(true);
      }
    };

    window.addEventListener("open-pwa-install", handleManualOpen);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("open-pwa-install", handleManualOpen);
    };
  }, []); // Run once on mount!

  // Handle Install Action Click from Banner
  const handleInstallClick = async () => {
    const activePrompt = (window as any).__pwaDeferredPrompt || deferredPrompt;

    if (isInAppBrowser) {
      setShowBanner(false);
      setShowInAppGuide(true);
      return;
    }

    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstalledSuccess(true);
          setShowBanner(false);
        }
        setDeferredPrompt(null);
        (window as any).__pwaDeferredPrompt = null;
        return;
      } catch (err) {
        console.warn("PWA install error:", err);
      }
    }

    setShowBanner(false);
    if (isIos) {
      setShowIosGuide(true);
    } else {
      setShowAndroidGuide(true);
    }
  };

  // Launch external Chrome via Android Intent (breaks out of Instagram webview)
  const openInExternalChrome = () => {
    try {
      const host = window.location.host;
      const path = window.location.pathname || "/";
      const search = window.location.search || "";
      const chromeIntent = `intent://${host}${path}${search}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = chromeIntent;

      // Fallback after 1 second if intent doesn't trigger
      setTimeout(() => {
        window.open(window.location.href, "_system");
      }, 1000);
    } catch (e) {
      window.open(window.location.href, "_blank");
    }
  };

  // Copy app link with visual feedback
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://radardorole.com.br");
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (e) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const [showBottomPointer, setShowBottomPointer] = useState(false);

  const handleTriggerShare = () => {
    setShowIosGuide(false);
    setShowBottomPointer(true);
    toast.info("Olhe no rodapé do seu iPhone e toque no ícone ⬆️. Depois role a listinha para baixo!", {
      duration: 6000,
    });
  };

  // Dismiss banner and avoid re-prompting on this session
  const handleDismiss = () => {
    setShowBanner(false);
    setShowAndroidGuide(false);
    setShowIosGuide(false);
    setShowInAppGuide(false);
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    localStorage.setItem("radar_pwa_dismissed_until", String(Date.now() + twelveHoursMs));
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Success Notification */}
      {installedSuccess && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-emerald-500/50 bg-[#0c101c]/95 backdrop-blur-md px-5 py-3 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Check className="h-5 w-5 text-emerald-400" />
          <span className="text-xs font-black text-white">
            🎉 Radar do Rolê instalado com sucesso na sua tela de início!
          </span>
        </div>
      )}

      {/* Floating PWA Install Banner (positioned safely above mobile bottom nav) */}
      {showBanner && !showAndroidGuide && !showIosGuide && !showInAppGuide && (
        <div className="fixed bottom-20 left-3 right-3 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-[#0c1020]/95 via-[#080d1a]/95 to-[#160924]/95 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_0_50px_rgba(6,182,212,0.35)]">
            {/* Ambient Glow */}
            <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-pink-500/20 blur-2xl pointer-events-none" />

            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-slate-400 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative z-10 flex items-center gap-3.5 pr-6">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 p-[2px] shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                <img
                  src="/logo-official.jpg"
                  alt="Radar do Rolê"
                  className="h-full w-full rounded-[14px] object-cover"
                />
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] text-white shadow">
                  📲
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white">Baixar o App Radar do Rolê</h4>
                  <span className="rounded-full bg-cyan-500/20 border border-cyan-400/40 px-2 py-0.5 text-[9px] font-black text-cyan-300">
                    GRÁTIS
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  Adicione à sua tela inicial para navegar sem navegador, mais rápido e em tela cheia!
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-3.5 flex items-center gap-2 pt-2.5 border-t border-white/10">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 py-3 text-xs sm:text-sm font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(6,182,212,0.45)] cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Baixar / Instalar App</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-2xl border border-white/15 bg-white/5 px-3.5 py-3 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Depois
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: INSTAGRAM / TIKTOK IN-APP BROWSER (CRUCIAL BREAKOUT) */}
      {showInAppGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setShowInAppGuide(false)} />
          <div className="relative w-full max-w-sm rounded-3xl border border-pink-500/40 bg-gradient-to-b from-[#140b20] via-[#0c101c] to-[#080d18] p-6 text-slate-100 shadow-[0_0_50px_rgba(236,72,153,0.35)] z-10 animate-in slide-in-from-bottom-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-500/30 text-pink-400 border border-pink-500/40">
                  <Smartphone className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">Instalar o App no Celular</h3>
                  <p className="text-[11px] text-pink-300 font-semibold">Navegador do Instagram Detectado</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInAppGuide(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-200 font-medium leading-relaxed flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                {isIos ? (
                  <>
                    No iPhone, o Instagram não permite salvar na tela diretamente. Toque nos <strong>3 pontinhos (...)</strong> no topo do Instagram e escolha <strong>"Abrir no Safari"</strong>!
                  </>
                ) : (
                  <>
                    O Instagram não permite instalar aplicativos diretamente dentro dele. Toque no botão abaixo para abrir no <strong>Google Chrome</strong> e baixar!
                  </>
                )}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2.5">
              {isIos ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowInAppGuide(false);
                    setShowIosGuide(true);
                  }}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 py-3.5 px-4 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(168,85,247,0.5)] cursor-pointer"
                >
                  <Share className="h-4 w-4" />
                  <span>Ver Passo a Passo para iPhone</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openInExternalChrome}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 py-3.5 px-4 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(6,182,212,0.5)] cursor-pointer"
                >
                  <Globe className="h-4 w-4" />
                  <span>Abrir no Google Chrome Agora</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 px-3 text-xs font-bold text-slate-200 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-300">Link Copiado! Cole no Chrome</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-slate-400" />
                    <span>Copiar Link do Aplicativo</span>
                  </>
                )}
              </button>
            </div>

            {/* Visual fallback steps */}
            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 space-y-2">
              <p className="font-bold text-slate-300">Ou faça manualmente pelo Instagram:</p>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 font-black text-white shrink-0">1</span>
                <span>Toque nos <strong>3 pontinhos [ ⋮ ]</strong> no topo direito da tela do Instagram.</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 font-black text-white shrink-0">2</span>
                <span>Escolha <strong>"Abrir no navegador externo"</strong> ou <strong>"Abrir no Chrome"</strong>.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInAppGuide(false)}
              className="mt-4 w-full text-center text-[11px] font-bold text-slate-400 hover:text-white py-1 cursor-pointer"
            >
              Continuar navegando no Instagram
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: ANDROID CHROME STEP-BY-STEP INSTALLATION */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setShowAndroidGuide(false)} />
          <div className="relative w-full max-w-sm rounded-3xl border border-cyan-500/40 bg-[#0c101c] p-6 text-slate-100 shadow-[0_0_50px_rgba(6,182,212,0.35)] z-10 animate-in slide-in-from-bottom-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Smartphone className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">Como Baixar no Android</h3>
                  <p className="text-[11px] text-slate-400">Direto pelo seu navegador:</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAndroidGuide(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 font-black">
                  1
                </div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    Toque nos 3 Pontinhos do Navegador
                    <MoreVertical className="h-3.5 w-3.5 text-cyan-400" />
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    No canto superior direito da tela do Google Chrome (ao lado do endereço do site).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-purple-500/30 bg-purple-950/30 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 font-black">
                  2
                </div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"
                    <PlusSquare className="h-3.5 w-3.5 text-purple-400" />
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    O app será baixado automaticamente com ícone oficial na tela inicial do seu celular!
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <a
                href="/baixar"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 py-3 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Ir para Página de Download Oficial</span>
              </a>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <span>🔄 Recarregar e Tentar Novamente</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAndroidGuide(false)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                Fechar Instruções
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: IOS SAFARI STEP-BY-STEP INSTALLATION */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setShowIosGuide(false)} />
          <div className="relative w-full max-w-sm rounded-3xl border border-purple-500/40 bg-[#0c101c] p-6 text-slate-100 shadow-[0_0_50px_rgba(168,85,247,0.35)] z-10 animate-in slide-in-from-bottom-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                  <Smartphone className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">Instalar no iPhone</h3>
                  <p className="text-[11px] text-slate-400">Adicione à Tela de Início em segundos:</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

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
                        Toque em "Adicionar" no topo direito. O app vai para a tela de início!
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
                    ✨ <strong>Vantagem:</strong> O app abre em tela inteira, super rápido, e não ocupa a memória do seu iPhone!
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">Link Copiado! Cole no Safari</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-slate-400" />
                    <span>Copiar Link para Abrir no Safari</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
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
    </>
  );
}

// Global utility helper to trigger PWA install modal from anywhere in the app
export function triggerPwaInstall() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-pwa-install"));
  }
}
