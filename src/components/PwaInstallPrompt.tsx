import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Share, PlusSquare, MoreVertical, Sparkles, Check, ArrowRight } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Detect if running standalone (already installed as PWA)
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://");

    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    // 2. Detect mobile device & OS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    const isMobileDevice = isIosDevice || isAndroidDevice || window.innerWidth < 768;

    setIsIos(isIosDevice);
    setIsMobile(isMobileDevice);

    // 3. Check dismissal expiry (12 hours instead of 5 days so users on mobile actually see it)
    const dismissedUntil = localStorage.getItem("radar_pwa_dismissed_until");
    const isDismissed = dismissedUntil && Date.now() < Number(dismissedUntil);

    // 4. Capture native beforeinstallprompt (Android / Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isDismissed) {
        setTimeout(() => setShowBanner(true), 1200);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 5. Always trigger the banner on mobile after 1.5 seconds if not dismissed
    if (isMobileDevice && !isDismissed) {
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }

    // 6. Detect successful app installation
    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // 7. Global listener for manual trigger (e.g. from Header or buttons)
    const handleManualOpen = () => {
      setShowBanner(true);
      if (isIosDevice) {
        setShowIosGuide(true);
      } else if (!deferredPrompt && isAndroidDevice) {
        setShowAndroidGuide(true);
      }
    };
    window.addEventListener("open-pwa-install", handleManualOpen);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("open-pwa-install", handleManualOpen);
    };
  }, [deferredPrompt]);

  // Handle Install Action Click
  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstalledSuccess(true);
          setShowBanner(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn("PWA install error:", err);
        setShowAndroidGuide(true);
      }
    } else {
      // Fallback for Android/Chrome/Samsung when native prompt is delayed or in webview
      setShowAndroidGuide(true);
    }
  };

  // Dismiss for 12 hours
  const handleDismiss = () => {
    setShowBanner(false);
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
      {showBanner && (
        <div className="fixed bottom-20 left-3 right-3 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-[#0c1020]/95 via-[#080d1a]/95 to-[#160924]/95 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_0_50px_rgba(6,182,212,0.35)]">
            {/* Ambient Glow */}
            <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-pink-500/20 blur-2xl pointer-events-none" />

            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-slate-400 hover:text-white hover:bg-white/20 transition-colors"
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
                  Adicione à sua tela inicial para navegar sem navegador, mais rápido e com modo tela cheia!
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
                className="rounded-2xl border border-white/15 bg-white/5 px-3.5 py-3 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                Depois
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Step-by-Step Installation Modal */}
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
                  <h3 className="text-sm font-black text-white">Instalar no iPhone / Safari</h3>
                  <p className="text-[11px] text-slate-400">2 passos rápidos para adicionar à tela:</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 font-black">
                  1
                </div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    Toque no botão Compartilhar
                    <Share className="h-3.5 w-3.5 text-cyan-400" />
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Fica na barra inferior do Safari (o quadrado com uma seta para cima).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 font-black">
                  2
                </div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    Toque em "Adicionar à Tela de Início"
                    <PlusSquare className="h-3.5 w-3.5 text-purple-400" />
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Depois confirme em "Adicionar" no canto superior direito!
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
            >
              Entendi, vou adicionar!
            </button>
          </div>
        </div>
      )}

      {/* Android Step-by-Step Installation Modal (quando o prompt nativo não abre sozinho) */}
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
                  <h3 className="text-sm font-black text-white">Instalar no Android</h3>
                  <p className="text-[11px] text-slate-400">Pelo Chrome ou Samsung Internet:</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAndroidGuide(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 font-black">
                  1
                </div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    Toque nos 3 Pontinhos do Navegador
                    <MoreVertical className="h-3.5 w-3.5 text-cyan-400" />
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Geralmente no canto superior direito da tela do Chrome.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 font-black">
                  2
                </div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    Toque em "Instalar aplicativo" ou "Adicionar à tela inicial"
                    <PlusSquare className="h-3.5 w-3.5 text-purple-400" />
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    O aplicativo será baixado com ícone oficial na sua tela inicial!
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAndroidGuide(false)}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 py-3 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              Entendi, vou instalar!
            </button>
          </div>
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
