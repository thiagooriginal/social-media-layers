import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  MapPin,
  Phone,
  Instagram,
  DollarSign,
  Clock,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { Venue, NEIGHBORHOODS } from "../data/venues";
import { updateVenue } from "../services/venueService";

interface EditVenueModalProps {
  venue: Venue | null;
  isOpen: boolean;
  onClose: () => void;
  onVenueUpdated: (updatedVenue: Venue) => void;
}

export function EditVenueModal({
  venue,
  isOpen,
  onClose,
  onVenueUpdated,
}: EditVenueModalProps) {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState<"baladas" | "restaurantes" | "moteis">("baladas");
  const [subType, setSubType] = useState("");
  const [subTypeEmoji, setSubTypeEmoji] = useState("✨");
  const [neighborhood, setNeighborhood] = useState(NEIGHBORHOODS[0].name);
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [image, setImage] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [openHours, setOpenHours] = useState("");
  const [hasVipList, setHasVipList] = useState(true);
  const [plan, setPlan] = useState<"mensal" | "semestral" | "anual">("semestral");
  const [planPrice, setPlanPrice] = useState(59);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Pre-fill form when modal opens
  useEffect(() => {
    if (venue) {
      setName(venue.name || "");
      setTagline(venue.tagline || "");
      setCategory(venue.category || "baladas");
      setSubType(venue.subType || "");
      setSubTypeEmoji(venue.subTypeEmoji || "✨");
      setNeighborhood(venue.neighborhood || NEIGHBORHOODS[0].name);
      setAddress(venue.address || "");
      setWhatsapp(venue.whatsapp || "");
      setInstagram(venue.instagram || "");
      setImage(venue.image || "");
      setEntryPrice(venue.entryPrice || "");
      setOpenHours(venue.openHours || "");
      setHasVipList(Boolean(venue.hasVipList));
      setPlan((venue.plan as any) || "semestral");
      setPlanPrice(venue.planPrice || 59);
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [venue, isOpen]);

  if (!isOpen || !venue) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("O nome do estabelecimento é obrigatório.");
      return;
    }

    setIsLoading(true);

    const updates: Partial<Venue> = {
      name: name.trim(),
      tagline: tagline.trim(),
      category,
      subType: subType.trim() || (category === "baladas" ? "Balada & Shows" : category === "moteis" ? "Motel Design" : "Bar & Gastronomia"),
      subTypeEmoji: subTypeEmoji || (category === "baladas" ? "🪩" : category === "moteis" ? "🔥" : "🍸"),
      neighborhood,
      address: address.trim() || `${neighborhood}, São Paulo - SP`,
      whatsapp: whatsapp.replace(/\D/g, ""),
      instagram: instagram.trim().replace(/^@/, ""),
      image: image.trim() || venue.image,
      entryPrice: entryPrice.trim() || "Consulte valores",
      openHours: openHours.trim() || "18:00 às 04:00",
      hasVipList,
      plan,
      planPrice: Number(planPrice),
    };

    const res = await updateVenue(venue.id, updates);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg("Estabelecimento atualizado com sucesso!");
      const updated: Venue = { ...venue, ...updates };
      onVenueUpdated(updated);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMsg(res.error || "Erro ao salvar alterações.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 transition-all animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/15 bg-[#0a0e19] p-5 sm:p-7 text-slate-100 shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)] z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 text-xl shadow-lg">
            ✏️
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Editar Estabelecimento</h3>
            <p className="text-xs text-slate-400">
              Atualize as informações, fotos, horários e plano de {venue.name}
            </p>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Nome do Local *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
              />
            </div>

            {/* Categoria */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-xl border border-white/15 bg-[#121829] py-2.5 px-3 text-xs text-white focus:border-purple-400 focus:outline-none"
              >
                <option value="baladas">🪩 Baladas & Casas Noturnas</option>
                <option value="restaurantes">🍸 Bares & Gastronomia</option>
                <option value="moteis">🔥 Motéis & Suítes Design</option>
              </select>
            </div>
          </div>

          {/* Tagline / Chamada */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Chamada / Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ex: Sertanejo e pagode até de manhã • Camarote VIP"
              className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Subtipo */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300">Gênero / Estilo</label>
              <input
                type="text"
                value={subType}
                onChange={(e) => setSubType(e.target.value)}
                placeholder="Ex: Sertanejo & Funk"
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
              />
            </div>

            {/* Emoji */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Emoji</label>
              <input
                type="text"
                value={subTypeEmoji}
                onChange={(e) => setSubTypeEmoji(e.target.value)}
                maxLength={4}
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3 text-xs text-center text-white focus:border-purple-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bairro */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Bairro em São Paulo</label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#121829] py-2.5 px-3 text-xs text-white focus:border-purple-400 focus:outline-none"
              >
                {NEIGHBORHOODS.map((n) => (
                  <option key={n.name} value={n.name}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Endereço */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Endereço Completo</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número - Bairro, São Paulo"
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">WhatsApp Comercial</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="11988887777"
                  className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Instagram */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Instagram (@)</label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="vilajkoficial"
                  className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Imagem Oficial (URL) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>URL da Imagem / Foto de Capa</span>
              {image && (
                <span className="text-[10px] text-cyan-400 hover:underline cursor-pointer" onClick={() => window.open(image, "_blank")}>
                  Ver Foto
                </span>
              )}
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Horário de Funcionamento */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Horário</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={openHours}
                  onChange={(e) => setOpenHours(e.target.value)}
                  placeholder="Sex e Sáb: 22h às 06h"
                  className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Preço de Entrada */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Valores de Entrada</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder="R$ 50 masc / R$ 30 fem"
                  className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Plano B2B SaaS */}
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4">
            <span className="text-xs font-black text-purple-300 uppercase tracking-wider block mb-2">
              Plano de Assinatura B2B
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className={`flex items-center gap-2 rounded-xl border p-2.5 cursor-pointer transition-all ${plan === "mensal" ? "border-purple-400 bg-purple-500/20 text-white" : "border-white/10 text-slate-400"}`}>
                <input type="radio" name="plan" checked={plan === "mensal"} onChange={() => { setPlan("mensal"); setPlanPrice(79); }} className="accent-purple-500" />
                <div>
                  <div className="font-bold">Mensal</div>
                  <div className="text-[10px] text-slate-400">R$ 79/mês</div>
                </div>
              </label>

              <label className={`flex items-center gap-2 rounded-xl border p-2.5 cursor-pointer transition-all ${plan === "semestral" ? "border-purple-400 bg-purple-500/20 text-white" : "border-white/10 text-slate-400"}`}>
                <input type="radio" name="plan" checked={plan === "semestral"} onChange={() => { setPlan("semestral"); setPlanPrice(59); }} className="accent-purple-500" />
                <div>
                  <div className="font-bold">Semestral 🔥</div>
                  <div className="text-[10px] text-slate-400">R$ 59/mês</div>
                </div>
              </label>

              <label className={`flex items-center gap-2 rounded-xl border p-2.5 cursor-pointer transition-all ${plan === "anual" ? "border-purple-400 bg-purple-500/20 text-white" : "border-white/10 text-slate-400"}`}>
                <input type="radio" name="plan" checked={plan === "anual"} onChange={() => { setPlan("anual"); setPlanPrice(39); }} className="accent-purple-500" />
                <div>
                  <div className="font-bold">Anual VIP 👑</div>
                  <div className="text-[10px] text-slate-400">R$ 39/mês</div>
                </div>
              </label>
            </div>
          </div>

          {/* Toggle Lista VIP */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
            <div>
              <span className="text-xs font-bold text-white block">Habilitar Emissão de Lista VIP</span>
              <span className="text-[11px] text-slate-400">Permite que baladeiros coloquem nomes na lista digital do seu card</span>
            </div>
            <button
              type="button"
              onClick={() => setHasVipList(!hasVipList)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${hasVipList ? "bg-purple-600" : "bg-white/20"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasVipList ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 px-5 py-2.5 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? "Salvando..." : "Salvar Alterações"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}