import React, { useState } from "react";
import { X, Plus, Sparkles, Building2, MapPin, Image, Check, AlertCircle } from "lucide-react";
import { NEIGHBORHOODS, GENRES, CUISINES, Venue } from "../data/venues";
import { registerVenue, NewVenueInput } from "../services/venueService";

interface RegisterVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVenueCreated: (newVenue: Venue) => void;
}

export function RegisterVenueModal({
  isOpen,
  onClose,
  onVenueCreated,
}: RegisterVenueModalProps) {
  const [category, setCategory] = useState<"baladas" | "restaurantes">("baladas");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [neighborhood, setNeighborhood] = useState(NEIGHBORHOODS[0].name);
  const [address, setAddress] = useState("");
  const [genre, setGenre] = useState("pagode");
  const [cuisine, setCuisine] = useState("japonesa");
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80"
  );
  const [openHours, setOpenHours] = useState("Hoje das 22:00 às 05:00");
  const [entryPrice, setEntryPrice] = useState("R$ 40 a R$ 80 • Nome na Lista");
  const [whatsapp, setWhatsapp] = useState("5511999990000");
  const [instagram, setInstagram] = useState("");
  const [hasKidsSpace, setHasKidsSpace] = useState(false);
  const [hasVipList, setHasVipList] = useState(true);
  const [isWomenFree, setIsWomenFree] = useState(false);
  const [hasParking, setHasParking] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      setErrorMsg("Preencha o nome do local e o endereço completo.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    // Find neighborhood coordinates
    const foundCoord = NEIGHBORHOODS.find((n) => n.name === neighborhood);
    const lat = foundCoord ? foundCoord.lat : -23.5505;
    const lng = foundCoord ? foundCoord.lng : -46.6333;

    const subTypeEmoji =
      category === "baladas"
        ? GENRES.find((g) => g.id === genre)?.emoji || "🪩"
        : hasKidsSpace
        ? "🧸"
        : CUISINES.find((c) => c.id === cuisine)?.emoji || "🍽️";

    const subTypeName =
      category === "baladas"
        ? GENRES.find((g) => g.id === genre)?.name || "Balada"
        : hasKidsSpace
        ? "Espaço Kids & Gastronomia"
        : CUISINES.find((c) => c.id === cuisine)?.name || "Restaurante";

    const payload: NewVenueInput = {
      category,
      name,
      tagline: tagline || "O melhor ambiente de São Paulo para aproveitar a noite.",
      genre: category === "baladas" ? (genre as any) : undefined,
      cuisine: category === "restaurantes" ? (cuisine as any) : undefined,
      subType: subTypeName,
      subTypeEmoji,
      neighborhood,
      address,
      latitude: lat,
      longitude: lng,
      image: imageUrl,
      openHours,
      entryPrice,
      whatsapp: whatsapp.replace(/\D/g, ""),
      instagram: instagram.replace("@", ""),
      hasKidsSpace,
      hasVipList,
      isWomenFree,
      hasParking,
      tags: [subTypeName, neighborhood, hasVipList ? "Lista VIP" : "Reserva"],
    };

    const res = await registerVenue(payload);
    setIsSubmitting(false);

    if (res.success && res.venue) {
      onVenueCreated(res.venue);
      alert(`Parabéns! "${name}" foi cadastrado e já está visível no BaladaON!`);
      onClose();
    } else {
      setErrorMsg(res.error || "Erro ao cadastrar local.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/15 bg-[#0a0e19] p-6 text-slate-100 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-xl shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            🏢
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Cadastrar Estabelecimento</h3>
            <p className="text-xs text-slate-400">
              Anuncie sua balada ou restaurante no BaladaON
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
          {/* Category Toggle */}
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">
              Tipo de Estabelecimento
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategory("baladas")}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold transition-all ${
                  category === "baladas"
                    ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                    : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                <span>🪩</span>
                <span>Balada & Lounge</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory("restaurantes")}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold transition-all ${
                  category === "restaurantes"
                    ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                    : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                <span>🍽️</span>
                <span>Restaurante & Bar</span>
              </button>
            </div>
          </div>

          {/* Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300">
                Nome do Estabelecimento *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Villa Music Hall"
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300">
                Bairro de São Paulo *
              </label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e1422] py-2.5 px-3 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                {NEIGHBORHOODS.map((n) => (
                  <option key={n.name} value={n.name}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block font-semibold text-slate-300">
              Endereço Completo com Número *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: R. Augusta, 1200 - Cerqueira César, São Paulo - SP"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Genre or Cuisine */}
          {category === "baladas" ? (
            <div>
              <label className="block font-semibold text-slate-300">
                Estilo Musical Principal
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e1422] py-2.5 px-3 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="pagode">🪘 Pagode & Roda de Samba</option>
                <option value="sertanejo">🤠 Sertanejo Universitário</option>
                <option value="funk">🔊 Funk & Open Format</option>
                <option value="forro">🪗 Forró Pé de Serra</option>
                <option value="rock">🎸 Rock & Covers</option>
                <option value="eletronica">⚡ Eletrônica & Techno</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-slate-300">
                Tipo de Gastronomia
              </label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e1422] py-2.5 px-3 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="japonesa">🍣 Comida Japonesa & Rodízio</option>
                <option value="churrascaria">🥩 Churrascaria & Cortes Nobres</option>
                <option value="italiano">🍝 Massas Italianas & Cantina</option>
                <option value="hamburgueria">🍔 Hamburgueria & Chopp Artesanal</option>
              </select>
            </div>
          )}

          {/* Horários & Valores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300">
                Horário de Abertura
              </label>
              <input
                type="text"
                value={openHours}
                onChange={(e) => setOpenHours(e.target.value)}
                placeholder="Ex: Hoje das 21:00 às 05:00"
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300">
                Entrada / Valores
              </label>
              <input
                type="text"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="Ex: R$ 30 a R$ 60 • Mulher VIP"
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* WhatsApp & Instagram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300">
                WhatsApp Oficial com DDD *
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="11999998888"
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300">
                Instagram (sem @)
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="nomedabalada"
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block font-semibold text-slate-300">
              Link da Foto de Capa (URL)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Comodidades Checkboxes */}
          <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
            {category === "restaurantes" && (
              <label className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasKidsSpace}
                  onChange={(e) => setHasKidsSpace(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span className="font-bold">🧸 Tem Espaço Kids</span>
              </label>
            )}

            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasVipList}
                onChange={(e) => setHasVipList(e.target.checked)}
                className="rounded text-purple-500"
              />
              <span>🎟️ Aceita Lista VIP</span>
            </label>

            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isWomenFree}
                onChange={(e) => setIsWomenFree(e.target.checked)}
                className="rounded text-pink-500"
              />
              <span>💃 Mulher VIP</span>
            </label>

            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasParking}
                onChange={(e) => setHasParking(e.target.checked)}
                className="rounded text-cyan-500"
              />
              <span>🚗 Estacionamento / Valet</span>
            </label>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 py-3.5 text-sm font-black text-white shadow-[0_0_30px_-5px_rgba(168,85,247,0.7)] hover:brightness-110 active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Salvando no banco de dados...</span>
              ) : (
                <>
                  <span>Publicar Estabelecimento Agora</span>
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
