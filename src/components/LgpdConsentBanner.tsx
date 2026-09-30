import React, { useState, useEffect } from "react";
import { ShieldCheck, Cookie, ChevronRight, X } from "lucide-react";

interface LgpdConsentBannerProps {
  onOpenPrivacyPolicy: () => void;
}

const STORAGE_KEY_LGPD = "radardorole_lgpd_accepted_v1";

export function LgpdConsentBanner({ onOpenPrivacyPolicy }: LgpdConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const accepted = localStorage.getItem(STORAGE_KEY_LGPD);
      if (!accepted) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_LGPD, "true");
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Consentimento de Privacidade e Cookies"
      className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 pointer-events-none animate-in slide-in-from-bottom duration-300"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-purple-500/30 bg-[#0a0e1c]/95 backdrop-blur-xl p-4 sm:p-5 text-slate-100 shadow-[0_0_40px_rgba(0,0,0,0.8)] pointer-events-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0 text-purple-400 mt-0.5">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="text-xs space-y-1">
            <p className="font-extrabold text-white flex items-center gap-2">
              <span>Sua Privacidade & LGPD (Lei nº 13.709/2018)</span>
              <span className="rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] px-1.5 py-0.5 font-bold uppercase">
                Dados Protegidos
              </span>
            </p>
            <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">
              Utilizamos cookies estritamente necessários e sua localização aproximada apenas para calcular a proximidade dos rolês em São Paulo e permitir a inclusão de nomes em listas VIP. <strong>Não vendemos seus dados para terceiros.</strong>
            </p>
            <div className="pt-0.5">
              <button
                type="button"
                onClick={onOpenPrivacyPolicy}
                className="text-purple-400 hover:text-purple-300 underline font-semibold text-[11px] cursor-pointer"
              >
                Ler nossa Política de Privacidade & Termos de Uso
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <button
            type="button"
            onClick={handleAccept}
            className="w-full md:w-auto rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 px-5 py-2.5 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer text-center"
          >
            Aceitar e Continuar
          </button>
        </div>
      </div>
    </aside>
  );
}
