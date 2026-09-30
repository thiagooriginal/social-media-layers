import React, { useState } from "react";
import { Moon, Sun, Check, Sparkles, X } from "lucide-react";
import { AppTheme, useTheme, markThemePrompted } from "../services/themeService";
import { toast } from "sonner";

interface InitialThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InitialThemeModal({ isOpen, onClose }: InitialThemeModalProps) {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(theme);

  if (!isOpen) return null;

  const handleSelect = (choice: AppTheme) => {
    setSelectedTheme(choice);
    setTheme(choice);
  };

  const handleConfirm = () => {
    setTheme(selectedTheme);
    markThemePrompted();
    onClose();

    if (selectedTheme === "dark") {
      toast.success("🌙 Tema Escuro Original Mantido!", {
        description: "Visual neon da noite paulistana ativo. Você pode trocar a qualquer momento no topo da tela.",
        duration: 3500,
      });
    } else {
      toast.success("☀️ Tema Claro Ativado!", {
        description: "Interface com alta visibilidade para o dia. Você pode voltar ao escuro a qualquer momento.",
        duration: 3500,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-3xl border p-5 sm:p-7 shadow-2xl transition-all duration-300 ${
          selectedTheme === "light"
            ? "border-slate-300 bg-white text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
            : "border-cyan-500/40 bg-[#0c101c] text-white shadow-[0_0_50px_rgba(0,240,255,0.2)]"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            markThemePrompted();
            onClose();
          }}
          className={`absolute top-4 right-4 rounded-full p-2 transition-colors cursor-pointer ${
            selectedTheme === "light"
              ? "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              : "text-slate-400 hover:bg-white/10 hover:text-white"
          }`}
          title="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Header */}
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-black text-fuchsia-400 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>OPÇÃO DE TEMA DO APLICATIVO</span>
          </div>
          <h2
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              selectedTheme === "light" ? "text-slate-900" : "text-white"
            }`}
          >
            Como você prefere ver o Radar do Rolê?
          </h2>
          <p
            className={`mt-1.5 text-xs sm:text-sm leading-relaxed ${
              selectedTheme === "light" ? "text-slate-600" : "text-slate-300"
            }`}
          >
            Escolha sua preferência inicial. Você pode alternar entre os temas a qualquer momento no topo do app.
          </p>
        </div>

        {/* Dual Cards: Escuro Original vs Claro */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Option 1: Tema Escuro Original */}
          <button
            type="button"
            onClick={() => handleSelect("dark")}
            className={`group relative flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all cursor-pointer ${
              selectedTheme === "dark"
                ? "border-cyan-400 bg-gradient-to-b from-[#111827] to-[#070a11] shadow-[0_0_25px_rgba(0,240,255,0.4)] ring-2 ring-cyan-400/30"
                : "border-white/10 bg-[#0f172a]/60 hover:border-cyan-400/50 hover:bg-[#111827]"
            }`}
          >
            {/* Top Selection Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300">
                <Moon className="h-5 w-5" />
              </div>
              {selectedTheme === "dark" ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-black shadow-sm">
                  <Check className="h-4 w-4 stroke-[3]" />
                </span>
              ) : (
                <span className="h-6 w-6 rounded-full border border-white/20" />
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white">Escuro Original</span>
                <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-black text-cyan-300 uppercase border border-cyan-500/30">
                  Padrão
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-300 leading-snug">
                Visual noturno com neon vibrante, iluminação de balada e imersão total.
              </p>
            </div>

            <div className="mt-3.5 flex items-center gap-1.5 text-[10px] font-bold text-cyan-400">
              <span>● Recomendado p/ Baladas</span>
            </div>
          </button>

          {/* Option 2: Tema Claro */}
          <button
            type="button"
            onClick={() => handleSelect("light")}
            className={`group relative flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all cursor-pointer ${
              selectedTheme === "light"
                ? "border-amber-500 bg-gradient-to-b from-white to-amber-50/60 shadow-[0_0_25px_rgba(245,158,11,0.3)] ring-2 ring-amber-500/30"
                : "border-white/10 bg-[#0f172a]/60 hover:border-amber-400/50 hover:bg-[#111827]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-500">
                <Sun className="h-5 w-5" />
              </div>
              {selectedTheme === "light" ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
                  <Check className="h-4 w-4 stroke-[3]" />
                </span>
              ) : (
                <span className="h-6 w-6 rounded-full border border-white/20" />
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-black text-sm ${
                    selectedTheme === "light" ? "text-slate-900" : "text-white"
                  }`}
                >
                  Tema Claro
                </span>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-600 uppercase border border-amber-500/30">
                  Daylight
                </span>
              </div>
              <p
                className={`mt-1 text-[11px] leading-snug ${
                  selectedTheme === "light" ? "text-slate-600" : "text-slate-300"
                }`}
              >
                Interface iluminada, fundo clean e excelente contraste para o dia e restaurantes.
              </p>
            </div>

            <div className="mt-3.5 flex items-center gap-1.5 text-[10px] font-bold text-amber-600">
              <span>● Ideal p/ Dia & Alta Leitura</span>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => {
              handleSelect("dark");
              markThemePrompted();
              onClose();
              toast.info("Tema Escuro Original mantido");
            }}
            className={`w-full sm:w-auto text-xs font-semibold py-2 px-3 rounded-xl transition-colors cursor-pointer text-center ${
              selectedTheme === "light"
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Pular e manter escuro
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-600 to-cyan-500 hover:brightness-110 active:scale-95 px-6 py-3 text-xs sm:text-sm font-black text-white shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>
              {selectedTheme === "dark"
                ? "Manter Tema Escuro Original"
                : "Confirmar Tema Claro"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
