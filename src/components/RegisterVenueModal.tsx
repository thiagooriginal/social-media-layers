import React, { useState } from "react";
import {
  X,
  Plus,
  Sparkles,
  Building2,
  MapPin,
  Image,
  Check,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  Crown,
  Calendar,
  CreditCard,
  QrCode,
  Zap,
} from "lucide-react";
import { NEIGHBORHOODS, GENRES, CUISINES, Venue } from "../data/venues";
import { registerVenue, NewVenueInput } from "../services/venueService";
import {
  createSubscription,
  DueDay,
  OFFICIAL_PLAN_NAME,
  OFFICIAL_PLAN_PRICE,
  OFFICIAL_PIX_KEY,
  SAAS_PLANS,
} from "../services/saasBillingService";

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
  const [category, setCategory] = useState<"baladas" | "restaurantes" | "moteis">("baladas");
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
  const [hasHydro, setHasHydro] = useState(true);
  const [hasPool, setHasPool] = useState(false);
  const [hasPrivateGarage, setHasPrivateGarage] = useState(true);

  // SaaS Recurring Billing State (R$ 59,00/mês, Dia 10/20/30, Cartão/Pix)
  const [dueDay, setDueDay] = useState<DueDay>(10);
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "pix">("credit_card");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdVenue, setCreatedVenue] = useState<Venue | null>(null);

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
        : category === "moteis"
        ? "🏩"
        : hasKidsSpace
        ? "🧸"
        : CUISINES.find((c) => c.id === cuisine)?.emoji || "🍽️";

    const subTypeName =
      category === "baladas"
        ? GENRES.find((g) => g.id === genre)?.name || "Balada"
        : category === "moteis"
        ? "Motel & Suítes"
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
      hasKidsSpace: category === "restaurantes" ? hasKidsSpace : false,
      hasVipList: category === "baladas" ? hasVipList : false,
      isWomenFree: category === "baladas" ? isWomenFree : false,
      hasParking,
      hasHydro: category === "moteis" ? hasHydro : false,
      hasPool: category === "moteis" ? hasPool : false,
      hasPrivateGarage: category === "moteis" ? hasPrivateGarage : false,
      tags: [subTypeName, neighborhood, category === "moteis" ? "Suítes" : hasVipList ? "Lista VIP" : "Reserva"],
      plan: "mensal",
      planPrice: OFFICIAL_PLAN_PRICE,
    };

    const res = await registerVenue(payload);
    setIsSubmitting(false);

    if (res.success && res.venue) {
      // Registra automaticamente a assinatura recorrente com o dia de vencimento escolhido
      createSubscription({
        venueId: res.venue.id,
        venueName: res.venue.name,
        ownerName: name + " (Gestão)",
        ownerEmail: "gestao@" + res.venue.id + ".com.br",
        ownerWhatsapp: whatsapp.replace(/\D/g, ""),
        planId: "mensal",
        paymentMethod,
        dueDay,
      });

      onVenueCreated(res.venue);
      setCreatedVenue(res.venue);
    } else {
      setErrorMsg(res.error || "Erro ao cadastrar local.");
    }
  };

  const handleOpenWhatsAppActivation = () => {
    if (!createdVenue) return;
    const paymentLabel = paymentMethod === "credit_card" ? "Cartão de Crédito Recorrente" : "Pix Recorrente";
    const msg = encodeURIComponent(
      `Olá equipe Radar do Rolê! 👋\n\n` +
      `Acabei de cadastrar o estabelecimento *${createdVenue.name}* no app Radar do Rolê!\n\n` +
      `📍 *Bairro:* ${createdVenue.neighborhood}\n` +
      `💎 *Plano:* ${OFFICIAL_PLAN_NAME} (R$ ${OFFICIAL_PLAN_PRICE},00/mês)\n` +
      `📅 *Dia de Vencimento:* Todo dia ${dueDay}\n` +
      `💳 *Forma de Pagamento:* ${paymentLabel}\n` +
      `📱 *WhatsApp da Casa:* ${createdVenue.whatsapp}\n\n` +
      `Gostaria de confirmar a ativação do meu destaque e da Lista VIP!`
    );
    window.open(`https://api.whatsapp.com/send?phone=5511999990000&text=${msg}`, "_blank");
    handleResetAndClose();
  };

  const handleResetAndClose = () => {
    setCreatedVenue(null);
    setName("");
    setTagline("");
    setAddress("");
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all">
      <div className="absolute inset-0" onClick={handleResetAndClose} />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/15 bg-[#0a0e19] p-6 text-slate-100 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          onClick={handleResetAndClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* If successfully created, show confirmation & activation screen */}
        {createdVenue ? (
          <div className="py-4 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              🎉
            </div>

            <h3 className="mt-4 text-2xl font-black text-white">
              Local Cadastrado com Sucesso!
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              <strong className="text-purple-300">{createdVenue.name}</strong> foi registrado e sua assinatura já está configurada.
            </p>

            {/* Plan chosen card */}
            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-purple-500/40 bg-purple-500/10 p-5 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                <span className="text-xs uppercase font-extrabold tracking-wider text-purple-300">
                  Assinatura Recorrente Ativa
                </span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-black text-emerald-300">
                  R$ {OFFICIAL_PLAN_PRICE},00/MÊS
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Plano Oficial:</span>
                  <span className="text-base font-black text-white">{OFFICIAL_PLAN_NAME}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Dia de Vencimento:</span>
                  <span className="text-sm font-black text-cyan-300">Todo dia {dueDay}</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Forma de Pagamento:</span>
                  <strong className="text-white">
                    {paymentMethod === "credit_card" ? "💳 Cartão de Crédito Recorrente" : "⚡ Pix Recorrente"}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Chave Pix da Plataforma:</span>
                  <strong className="text-emerald-300 font-mono text-[11px]">{OFFICIAL_PIX_KEY}</strong>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Destaque e card garantido no app do Radar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Lista VIP digital ilimitada com emissão de QR Code</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Avisos automáticos de vencimento e confirmação no WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Activation via WhatsApp button */}
            <div className="mt-6 flex flex-col gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleOpenWhatsAppActivation}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black py-3.5 text-sm font-black shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-98 cursor-pointer"
              >
                <MessageCircle className="h-5 w-5 fill-black" />
                <span>Confirmar Ativação no WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-semibold text-slate-300 hover:bg-white/10 cursor-pointer"
              >
                Ver Estabelecimento no Radar do Rolê
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <>
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-xl shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                🏢
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Cadastrar Estabelecimento</h3>
                <p className="text-xs text-slate-400">
                  Anuncie sua balada ou restaurante no Radar do Rolê e atraia novos clientes
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5 text-xs">
              {/* Category Toggle */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  1. Tipo de Estabelecimento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory("baladas")}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-bold transition-all ${
                      category === "baladas"
                        ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                        : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    <span>🪩</span>
                    <span className="truncate">Balada</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory("restaurantes")}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-bold transition-all ${
                      category === "restaurantes"
                        ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                        : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    <span>🍽️</span>
                    <span className="truncate">Restaurante</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory("moteis")}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-bold transition-all ${
                      category === "moteis"
                        ? "bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)]"
                        : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    <span>🏩</span>
                    <span className="truncate">Motel</span>
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300">
                    Nome do Local *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Seu Justino, D-Edge, etc."
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

              {/* Tagline */}
              <div>
                <label className="block font-semibold text-slate-300">
                  Frase de Destaque / Descrição curta
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Ex: Quintal arborizado, clima de paquera e samba no pé..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
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
                  placeholder="Rua Harmonia, 77 - Vila Madalena, São Paulo - SP"
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
                    {GENRES.filter((g) => g.id !== "all").map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.emoji} {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-300">
                    Tipo de Cozinha / Gastronomia
                  </label>
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e1422] py-2.5 px-3 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    {CUISINES.filter((c) => c.id !== "all").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Horários & Entrada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300">
                    Horário de Funcionamento
                  </label>
                  <input
                    type="text"
                    value={openHours}
                    onChange={(e) => setOpenHours(e.target.value)}
                    placeholder="Hoje das 21:00 às 05:00"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300">
                    Valor de Entrada / Consumação
                  </label>
                  <input
                    type="text"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    placeholder="R$ 40 a R$ 80 • Nome na Lista"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Contatos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300">
                    WhatsApp Comercial (com DDD) *
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="11999990000"
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

              {/* Comodidades Checkboxes */}
              <div className="pt-1 grid grid-cols-2 gap-2 text-xs">
                {category === "moteis" ? (
                  <>
                    <label className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2 text-cyan-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasHydro}
                        onChange={(e) => setHasHydro(e.target.checked)}
                        className="rounded text-cyan-500"
                      />
                      <span className="font-bold">🛁 Banheira de Hidro</span>
                    </label>

                    <label className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 p-2 text-blue-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasPool}
                        onChange={(e) => setHasPool(e.target.checked)}
                        className="rounded text-blue-500"
                      />
                      <span className="font-bold">🏊 Piscina Privativa</span>
                    </label>

                    <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasPrivateGarage}
                        onChange={(e) => setHasPrivateGarage(e.target.checked)}
                        className="rounded text-purple-500"
                      />
                      <span>🚗 Garagem Privativa</span>
                    </label>

                    <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasParking}
                        onChange={(e) => setHasParking(e.target.checked)}
                        className="rounded text-emerald-500"
                      />
                      <span>🌙 Atendimento 24 Horas</span>
                    </label>
                  </>
                ) : (
                  <>
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

                    {category === "baladas" && (
                      <>
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
                      </>
                    )}

                    <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasParking}
                        onChange={(e) => setHasParking(e.target.checked)}
                        className="rounded text-cyan-500"
                      />
                      <span>🚗 Estacionamento / Valet</span>
                    </label>
                  </>
                )}
              </div>

              {/* PLANO DE ASSINATURA UNIFICADO & CONFIGURAÇÃO RECORRENTE */}
              <div className="pt-2 border-t border-white/10 space-y-4">
                {/* 1. Card do Plano Oficial */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-black text-white text-sm flex items-center gap-1.5">
                      <Crown className="h-4 w-4 text-amber-400" />
                      <span>Plano de Parceria Oficial</span>
                    </label>
                    <span className="text-[10px] font-black text-emerald-300 uppercase bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                      Plano Ativo • R$ 59/mês
                    </span>
                  </div>

                  <div className="rounded-2xl border border-purple-500/40 bg-purple-500/10 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
                      <div>
                        <h4 className="text-sm font-black text-white">{OFFICIAL_PLAN_NAME}</h4>
                        <p className="text-[11px] text-purple-300">
                          Assinatura mensal recorrente com cancelamento flexível a qualquer momento
                        </p>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-emerald-400">R$ {OFFICIAL_PLAN_PRICE},00</span>
                        <span className="text-xs text-slate-400">/mês</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-300 pt-3">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Destaque exclusivo no mapa de SP</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Lista VIP com voucher e QR Code</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Botão direto pro WhatsApp da casa</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Scanner de portaria por câmera</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Seleção da Data de Pagamento (Dia 10, Dia 20 ou Dia 30) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Data de Pagamento Mensal</span>
                    </label>
                    <span className="text-[11px] text-cyan-300 font-bold">
                      Vencimento todo mês
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {([10, 20, 30] as DueDay[]).map((day) => {
                      const isSelected = dueDay === day;
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setDueDay(day)}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-cyan-400 bg-cyan-950/40 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400"
                              : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                          }`}
                        >
                          <span className="text-lg font-black">{day}</span>
                          <span className="text-[10px] font-bold text-slate-400 mt-0.5">Todo Dia {day}</span>
                          {isSelected && (
                            <div className="mt-1 flex items-center gap-1 text-[9px] font-black text-cyan-300">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                              <span>Ativo</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Forma de Pagamento Recorrente */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-2">
                    Forma de Cobrança Recorrente
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("credit_card")}
                      className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                        paymentMethod === "credit_card"
                          ? "border-purple-400 bg-purple-950/40 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-400"
                          : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-white block">Cartão de Crédito Recorrente</span>
                        <span className="text-[10px] text-purple-300 block">Cobrança automática todo dia {dueDay}</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("pix")}
                      className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                        paymentMethod === "pix"
                          ? "border-emerald-400 bg-emerald-950/40 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400"
                          : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                        <QrCode className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-white block">Pix Recorrente</span>
                        <span className="text-[10px] text-emerald-300 block">Aviso automático no WhatsApp todo dia {dueDay}</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Termos de Parceria & Responsabilidade Civil e Consumerista */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-[11px] text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Termos de Parceria Comercial (SaaS)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    O estabelecimento cadastrado declara e assume integral responsabilidade civil, administrativa e consumerista pela veracidade dos dados, eventos, preços de entrada e cumprimento de benefícios de Lista VIP aos usuários da plataforma.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 py-3.5 text-sm font-black text-white shadow-[0_0_30px_-5px_rgba(168,85,247,0.7)] hover:brightness-110 active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Salvando estabelecimento...</span>
                  ) : (
                    <>
                      <span>
                        Cadastrar no {OFFICIAL_PLAN_NAME} • R$ {OFFICIAL_PLAN_PRICE},00/mês (Dia {dueDay})
                      </span>
                      <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
