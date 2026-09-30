import React, { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle2, XCircle, FileText, AlertTriangle } from "lucide-react";

interface AgeGateModalProps {
  onOpenTerms?: () => void;
}

const STORAGE_KEY_AGE = "radardorole_age_verified_v1";

export function AgeGateModal({ onOpenTerms }: AgeGateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUnderage, setIsUnderage] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const verified = localStorage.getItem(STORAGE_KEY_AGE);
      if (!verified) {
        setIsOpen(true);
      }
    }
  }, []);

  const handleConfirmAge = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_AGE, "true");
    }
    setIsOpen(false);
  };

  const handleRejectAge = () => {
    setIsUnderage(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/40 bg-[#0c101c] p-6 text-slate-100 shadow-[0_0_60px_-10px_rgba(244,63,94,0.4)] animate-in zoom-in-95 duration-200">
        {!isUnderage ? (
          <div className="text-center space-y-4">
            {/* Header Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 via-purple-600 to-amber-500 shadow-[0_0_30px_rgba(244,63,94,0.5)] text-3xl">
              🔞
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 text-[10px] font-black text-rose-300 uppercase tracking-wider">
                Verificação Obrigatória • ECA & Lei Federal
              </span>
              <h2 className="text-xl font-black text-white mt-2">
                Você tem 18 anos ou mais?
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                O <strong>Radar do Rolê</strong> cataloga casas noturnas, eventos com comercialização de bebidas alcoólicas e motéis em São Paulo.
              </p>
            </div>

            {/* Legal Alert Box */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-left text-xs text-rose-200/90 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-rose-300 text-[11px] uppercase">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>Aviso Legal de Acesso Restrito</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                O acesso a esses estabelecimentos e a compra de bebidas alcoólicas são <strong>estritamente proibidos para menores de 18 anos</strong> (Art. 243 da Lei nº 8.069/1990 - ECA).
              </p>
              <p className="text-[10px] text-slate-400 border-t border-rose-500/20 pt-1.5">
                🪪 A apresentação de documento oficial físico com foto (RG, CNH ou Passaporte) é obrigatória na entrada de todos os locais cadastrados.
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleConfirmAge}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-3 text-sm font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Sim, sou maior de 18 anos</span>
              </button>

              <button
                type="button"
                onClick={handleRejectAge}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <span>Não, tenho menos de 18 anos</span>
              </button>
            </div>

            {onOpenTerms && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="text-[11px] text-purple-400 hover:text-purple-300 underline font-medium cursor-pointer"
                >
                  Consultar Termos de Uso e Política de Privacidade
                </button>
              </div>
            )}
          </div>
        ) : (
          /* View if Underage */
          <div className="text-center space-y-4 py-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 text-2xl">
              <XCircle className="h-8 w-8 text-rose-400" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Acesso Restrito a Maiores de 18 Anos</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Em cumprimento ao Estatuto da Criança e do Adolescente e à legislação brasileira sobre venda e consumo de bebidas alcoólicas e acesso a motéis, o catálogo da vida noturna não está disponível para menores de idade.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
              Agradecemos a compreensão. Você poderá retornar à plataforma ao atingir a maioridade civil.
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.href = "https://www.google.com.br";
              }}
              className="w-full rounded-xl bg-white/10 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/20 transition-all"
            >
              Sair para a página inicial do Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
