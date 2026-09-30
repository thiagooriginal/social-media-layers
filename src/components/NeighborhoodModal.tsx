import React, { useState, useMemo } from "react";
import { Search, X, MapPin, Crosshair, Check } from "lucide-react";
import { NEIGHBORHOODS, NeighborhoodCoord } from "../data/venues";

interface NeighborhoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNeighborhood: NeighborhoodCoord;
  onSelectNeighborhood: (coord: NeighborhoodCoord) => void;
  onUseCurrentGps: () => void;
  isGpsLoading?: boolean;
  isGpsActive?: boolean;
}

export function NeighborhoodModal({
  isOpen,
  onClose,
  currentNeighborhood,
  onSelectNeighborhood,
  onUseCurrentGps,
  isGpsLoading = false,
  isGpsActive = false,
}: NeighborhoodModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNeighborhoods = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return NEIGHBORHOODS;
    return NEIGHBORHOODS.filter((n) => n.name.toLowerCase().includes(term));
  }, [searchTerm]);

  if (!isOpen) return null;

  const handleSelectCustom = () => {
    if (!searchTerm.trim()) return;
    const typed = searchTerm.trim();
    // Procura se tem match exato
    const match = NEIGHBORHOODS.find((n) => n.name.toLowerCase() === typed.toLowerCase());
    if (match) {
      onSelectNeighborhood(match);
    } else {
      onSelectNeighborhood({
        name: typed,
        lat: currentNeighborhood.lat,
        lng: currentNeighborhood.lng,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Backdrop tap to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-cyan-500/40 bg-[#0d1322] p-5 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Sua Localização de Partida
              </h3>
              <p className="text-[11px] text-slate-400">
                Para calcular distâncias e estimativa de Uber
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Direct Live GPS Button */}
        <div className="pt-4 pb-2">
          <button
            type="button"
            onClick={() => {
              onUseCurrentGps();
              onClose();
            }}
            disabled={isGpsLoading}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-black transition-all cursor-pointer ${
              isGpsActive
                ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                : "border-cyan-500/50 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-200 hover:border-cyan-300 hover:brightness-110 active:scale-98 shadow-md"
            }`}
          >
            <Crosshair
              className={`h-4 w-4 ${
                isGpsLoading ? "animate-spin text-cyan-300" : isGpsActive ? "text-emerald-400" : "text-cyan-400"
              }`}
            />
            <span>
              {isGpsLoading
                ? "Buscando satélites GPS..."
                : isGpsActive
                ? "📍 GPS Ativo • Puxar Novamente"
                : "🎯 Puxar Meu GPS Atual (Ao Vivo)"}
            </span>
          </button>
        </div>

        {/* Search input for neighborhood */}
        <div className="relative my-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSelectCustom();
            }}
            placeholder="Digite seu bairro em SP (ex: Pinheiros, Itaim)..."
            className="w-full rounded-2xl border border-white/15 bg-[#12192c] py-2.5 pl-10 pr-9 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Neighborhood List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 mt-2 min-h-[160px]">
          {/* Custom typed option if no exact match */}
          {searchTerm.trim() &&
            !NEIGHBORHOODS.some((n) => n.name.toLowerCase() === searchTerm.toLowerCase().trim()) && (
              <button
                type="button"
                onClick={handleSelectCustom}
                className="flex w-full items-center justify-between rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-2.5 text-xs text-left transition-all hover:bg-cyan-900/50 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">📍</span>
                  <span className="font-bold text-cyan-200">
                    Definir como "{searchTerm.trim()}"
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded">
                  Usar este
                </span>
              </button>
            )}

          {filteredNeighborhoods.map((n) => {
            const isSelected = n.name === currentNeighborhood.name;
            return (
              <button
                key={n.name}
                type="button"
                onClick={() => {
                  onSelectNeighborhood(n);
                  onClose();
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-cyan-600 to-fuchsia-600 text-white font-extrabold shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span className="font-semibold">{n.name}</span>
                </div>
                {isSelected && (
                  <span className="flex items-center gap-1 text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    <Check className="h-3 w-3 stroke-[3]" />
                    <span>Atual</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-white/10 text-center">
          <p className="text-[10px] text-slate-500">
            A localização é usada apenas para calcular a distância e rotas até as baladas.
          </p>
        </div>
      </div>
    </div>
  );
}
