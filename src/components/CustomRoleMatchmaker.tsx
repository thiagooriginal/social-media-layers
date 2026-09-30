import React from "react";
import { Sparkles, AlertCircle, Compass, Check } from "lucide-react";
import { Venue, NeighborhoodCoord, ROLE_AMENITIES, RoleAmenityId } from "../data/venues";
import { VenueCard } from "./VenueCard";

interface CustomRoleMatchmakerProps {
  venues: Venue[];
  userLocation: NeighborhoodCoord;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onOpenDetails: (venue: Venue) => void;
  selectedAmenities: RoleAmenityId[];
  onToggleAmenity: (id: RoleAmenityId) => void;
  onClearAmenities: () => void;
  onSelectCombo: (combo: RoleAmenityId[]) => void;
  customRoleMatches: Venue[];
  customRolePartialMatches: Venue[];
}

export function CustomRoleMatchmaker({
  venues,
  userLocation,
  favorites,
  onToggleFavorite,
  onOpenDetails,
  selectedAmenities,
  onToggleAmenity,
  onClearAmenities,
  onSelectCombo,
  customRoleMatches,
  customRolePartialMatches,
}: CustomRoleMatchmakerProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Intro Box & Description */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-fuchsia-950/80 via-[#0e1424] to-cyan-950/80 p-5 sm:p-6 shadow-[0_0_35px_rgba(0,240,255,0.15)] mb-6">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-gradient-to-br from-fuchsia-600/20 to-cyan-500/20 blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-[11px] font-black text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
              🎯 Matchmaker Exclusivo
            </span>
            <span className="rounded-full bg-fuchsia-500/20 px-3 py-1 text-[11px] font-black text-fuchsia-300 border border-fuchsia-500/40">
              Filtro Estrito (100% de Match)
            </span>
          </div>

          <h3 className="text-xl sm:text-3xl font-black text-white">
            Como você quer curtir seu rolê hoje?
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Marque as opções que não podem faltar na sua noite. Nós filtramos para você encontrar <strong className="text-cyan-300">apenas os lugares que oferecem todas as opções escolhidas juntas</strong>!
          </p>

          {/* Combos Rápidos Prontos (Presets) */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Sugestões Populares (Clique para aplicar):</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onSelectCombo(["sinuca", "narguile", "musica_ao_vivo", "karaoke"])}
                className="rounded-full border border-fuchsia-500/40 bg-fuchsia-950/40 hover:bg-fuchsia-900/60 px-3.5 py-1.5 text-xs font-extrabold text-fuchsia-200 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              >
                🎱 Sinuca + 💨 Narguilé + 🎸 Ao Vivo + 🎤 Karaokê
              </button>
              <button
                type="button"
                onClick={() => onSelectCombo(["sinuca", "musica_ao_vivo", "chopp"])}
                className="rounded-full border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 px-3.5 py-1.5 text-xs font-extrabold text-cyan-200 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              >
                🎱 Sinuca + 🎸 Ao Vivo + 🍺 Chopp Gelado
              </button>
              <button
                type="button"
                onClick={() => onSelectCombo(["karaoke", "rooftop", "drinks"])}
                className="rounded-full border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 px-3.5 py-1.5 text-xs font-extrabold text-cyan-200 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              >
                🎤 Karaokê + 🌇 Rooftop + 🍹 Drinques
              </button>
              <button
                type="button"
                onClick={() => onSelectCombo(["pista_danca", "drinks", "after_madrugada"])}
                className="rounded-full border border-fuchsia-500/40 bg-fuchsia-950/40 hover:bg-fuchsia-900/60 px-3.5 py-1.5 text-xs font-extrabold text-fuchsia-200 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              >
                🪩 Pista & DJ + 🍹 Drinques + 🌙 Madrugada 5h+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Amenity Selector Cards (11 items) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-black text-white flex items-center gap-2">
            <span>Escolha suas preferências:</span>
            {selectedAmenities.length > 0 && (
              <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs font-black text-cyan-300 border border-cyan-500/40">
                {selectedAmenities.length} selecionadas
              </span>
            )}
          </h4>

          {selectedAmenities.length > 0 && (
            <button
              type="button"
              onClick={onClearAmenities}
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors underline cursor-pointer"
            >
              ✕ Limpar seleção
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {ROLE_AMENITIES.map((amenity) => {
            const isSelected = selectedAmenities.includes(amenity.id);
            return (
              <button
                key={amenity.id}
                type="button"
                onClick={() => onToggleAmenity(amenity.id)}
                className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-cyan-400 bg-gradient-to-br from-cyan-950/70 via-[#10192e] to-fuchsia-950/70 shadow-[0_0_20px_rgba(0,240,255,0.35)] scale-[1.02]"
                    : "border-white/10 bg-[#0d121f]/90 hover:border-white/25 hover:bg-[#121827]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {amenity.emoji}
                  </span>
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-400 text-black shadow-[0_0_10px_rgba(0,240,255,0.8)]"
                        : "border-white/20 bg-white/5"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </div>

                <div className="mt-2.5">
                  <h5
                    className={`text-xs sm:text-sm font-bold transition-colors ${
                      isSelected ? "text-cyan-200 font-black" : "text-white"
                    }`}
                  >
                    {amenity.name}
                  </h5>
                  <p className="mt-0.5 text-[10px] text-slate-400 leading-tight">
                    {amenity.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Results Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            {selectedAmenities.length === 0 ? (
              <>
                <Compass className="h-5 w-5 text-cyan-400" />
                <span>Locais completos para explorar</span>
              </>
            ) : customRoleMatches.length > 0 ? (
              <>
                <span className="text-xl">🎯</span>
                <span>
                  {customRoleMatches.length}{" "}
                  {customRoleMatches.length === 1
                    ? "lugar encontrado com 100% de match!"
                    : "lugares encontrados com 100% de match!"}
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-cyan-400" />
                <span>Nenhum local com 100% de todas as opções juntas</span>
              </>
            )}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedAmenities.length === 0
              ? "Toque nos cartões acima para filtrar seu rolê sob medida"
              : customRoleMatches.length > 0
              ? `Cada um dos locais abaixo possui todos os ${selectedAmenities.length} itens escolhidos simultaneamente!`
              : "Tente desmarcar um dos itens para ampliar as opções"}
          </p>
        </div>

        {selectedAmenities.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">Requisitos:</span>
            {selectedAmenities.map((amenityId) => {
              const item = ROLE_AMENITIES.find((a) => a.id === amenityId);
              return (
                <span
                  key={amenityId}
                  className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-extrabold text-cyan-300"
                >
                  <span>{item?.emoji}</span>
                  <span>{item?.name}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Content */}
      {selectedAmenities.length === 0 ? (
        <div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {venues
              .filter((v) => v.amenities && v.amenities.length >= 3)
              .map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  userLocation={userLocation}
                  isFavorite={favorites.includes(venue.id)}
                  onToggleFavorite={onToggleFavorite}
                  onOpenDetails={onOpenDetails}
                />
              ))}
          </div>
        </div>
      ) : customRoleMatches.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {customRoleMatches.map((venue) => (
            <div key={venue.id} className="relative">
              <div className="mb-2 flex items-center justify-between rounded-xl border border-cyan-400/50 bg-gradient-to-r from-cyan-950/80 via-[#081826] to-fuchsia-950/80 px-3 py-1.5 text-xs font-black text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>🎯 100% Match! Tem tudo o que você pediu</span>
                </span>
                <span className="text-[10px] text-cyan-200/80 font-bold">
                  {selectedAmenities.length}/{selectedAmenities.length}
                </span>
              </div>

              <VenueCard
                venue={venue}
                userLocation={userLocation}
                isFavorite={favorites.includes(venue.id)}
                onToggleFavorite={onToggleFavorite}
                onOpenDetails={onOpenDetails}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center rounded-3xl border border-cyan-500/30 bg-[#0d121f] px-6 py-12 text-center shadow-lg">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/15 text-3xl border border-cyan-500/30">
              🤔
            </div>
            <h4 className="mt-4 text-lg font-black text-white">
              Nenhum local encontrado com todos os {selectedAmenities.length} itens juntos
            </h4>
            <p className="mt-1.5 max-w-md text-xs sm:text-sm text-slate-300 leading-relaxed">
              Algumas combinações muito específicas podem não existir em um único lugar ao mesmo tempo.
              Desmarque uma opção acima ou confira os locais que quase chegam lá abaixo!
            </p>

            <div className="mt-5 flex flex-wrap gap-2 justify-center">
              {selectedAmenities.length > 0 && selectedAmenities[selectedAmenities.length - 1] && (
                <button
                  type="button"
                  onClick={() => {
                    const last = selectedAmenities[selectedAmenities.length - 1];
                    if (last) onToggleAmenity(last);
                  }}
                  className="rounded-xl border border-cyan-500/40 bg-cyan-500/20 px-4 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30 transition-all active:scale-95 cursor-pointer"
                >
                  ✕ Remover "{ROLE_AMENITIES.find((a) => a.id === selectedAmenities[selectedAmenities.length - 1])?.name}"
                </button>
              )}
              <button
                type="button"
                onClick={onClearAmenities}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
              >
                Limpar todas as opções
              </button>
            </div>
          </div>

          {customRolePartialMatches.length > 0 && (
            <div>
              <div className="mb-4">
                <h5 className="text-sm font-black text-slate-200 flex items-center gap-2">
                  <span>⚡ Quase lá! Locais que têm a maioria dos seus requisitos:</span>
                </h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  Estes lugares atendem grande parte do que você quer hoje à noite:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {customRolePartialMatches.map((venue) => {
                  const matchCount = selectedAmenities.filter((a) =>
                    venue.amenities?.includes(a)
                  ).length;
                  return (
                    <div key={venue.id} className="relative">
                      <div className="mb-2 flex items-center justify-between rounded-xl border border-fuchsia-500/40 bg-fuchsia-950/60 px-3 py-1.5 text-xs font-black text-fuchsia-300 shadow-[0_0_15px_rgba(255,0,127,0.3)]">
                        <span>⚡ {matchCount} de {selectedAmenities.length} requisitos atendidos</span>
                      </div>
                      <VenueCard
                        venue={venue}
                        userLocation={userLocation}
                        isFavorite={favorites.includes(venue.id)}
                        onToggleFavorite={onToggleFavorite}
                        onOpenDetails={onOpenDetails}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
