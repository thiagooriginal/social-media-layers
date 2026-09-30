import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Share, PlusSquare, Sparkles, Check } from "lucide-react";

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
  const [showBanner, setShowBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Check if already installed in standalone mode
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://");

    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    // 2. Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 3. Check dismissal expiry
    const dismissedUntil = localStorage.getItem("radar_pwa_dismissed_until");
    const isDismissed = dismissedUntil && Date.now() < Number(dismissedUntil);

    // 4. Capture native beforeinstallprompt (Android / Chrome / Desktop)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isDismissed) {
        // Show banner after 3 seconds of navigation
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 5. Detect app installed event
    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // For iOS users who haven't dismissed yet, show banner after 4 seconds
    if (isIosDevice && !isDismissed) {
      const timer = setTimeout(() => setShowBanner(true), 4000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }

    // Custom global trigger so any button can open installation prompt
    const handleManualOpen = () => {
      setShowBanner(true);
      if (isIosDevice) {
        setShowIosGuide(true);
      }
    };
    window.addEventListener("open-pwa-install", handleManualOpen);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("open-pwa-install", handleManualOpen);
    };
  }, []);

  // Handle Install Action Click
  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback for browsers without beforeinstallprompt
      alert("Para instalar, toque no menu do seu navegador (três pontinhos) e selecione 'Adicionar à tela inicial' ou 'Instalar aplicativo'.");
      return;
    }

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
    }
  };

  // Dismiss for 5 days
  const handleDismiss = () => {
    setShowBanner(false);
    const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
    localStorage.setItem("radar_pwa_dismissed_until", String(Date.now() + fiveDaysMs));
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

      {/* Floating PWA Install Banner */}
      {showBanner && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="relative rounded-3xl border border-cyan-500/40 bg-[#090d19]/95 backdrop-blur-xl p-4 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Fechar"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3.5 pr-6">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-500 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                <img
                  src="/logo-official.jpg"
                  alt="Radar do Rolê"
                  className="h-full w-full rounded-[14px] object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black text-white">Instalar Radar do Rolê</h4>
                  <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-black text-cyan-300">
                    APP
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  Adicione à tela de início para abrir em tela cheia com 1 toque e acesso ultrarrápido!
                </p>
              </div>
            </div>

            <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 py-2.5 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Instalar Agora</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Step-by-Step Installation Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setShowIosGuide(false)} />
          <div className="relative w-full max-w-sm rounded-3xl border border-purple-500/30 bg-[#0c101c] p-6 text-slate-100 shadow-[0_0_50px_rgba(168,85,247,0.3)] z-10 animate-in slide-in-from-bottom-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                  <Smartphone className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">Instalar no iPhone / iPad</h3>
                  <p className="text-[11px] text-slate-400">Siga 2 passos rápidos no Safari:</p>
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
                    Localizado na barra inferior do navegador Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 font-black">
                  2
                </div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    Role e toque em "Adicionar à Tela de Início"
                    <PlusSquare className="h-3.5 w-3.5 text-purple-400" />
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    O ícone do Radar do Rolê será adicionado ao lado dos seus outros apps!
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
            >
              Entendi, obrigado!
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
