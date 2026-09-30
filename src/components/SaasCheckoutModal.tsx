import React, { useState } from "react";
import {
  X,
  CreditCard,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Lock,
  Building2,
  ShieldCheck,
  ArrowRight,
  Zap,
  Calendar,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  SAAS_PLANS,
  createSubscription,
  SaasSubscription,
  DueDay,
  OFFICIAL_PLAN_PRICE,
  OFFICIAL_PIX_KEY,
  generatePixCopiaECola,
} from "../services/saasBillingService";

interface SaasCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueId: string;
  venueName: string;
  ownerName: string;
  ownerEmail: string;
  ownerWhatsapp: string;
  initialPlanId?: "mensal" | "semestral" | "anual";
  onSuccess: (sub: SaasSubscription) => void;
}

export function SaasCheckoutModal({
  isOpen,
  onClose,
  venueId,
  venueName,
  ownerName,
  ownerEmail,
  ownerWhatsapp,
  initialPlanId,
  onSuccess,
}: SaasCheckoutModalProps) {
  const [selectedTier, setSelectedTier] = useState<"standard" | "premium">(
    initialPlanId === "premium" || initialPlanId === "semestral" || initialPlanId === "anual"
      ? "premium"
      : "standard"
  );
  const [dueDay, setDueDay] = useState<DueDay>(10);
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "pix">("credit_card");

  // Credit card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Card validation simulation state (para comprovar a resposta ao usuário)
  const [cardSimulation, setCardSimulation] = useState<"approve" | "decline_funds" | "decline_cancelled">("approve");
  const [cardFailureAlert, setCardFailureAlert] = useState<{ reason: string; detail: string } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  if (!isOpen) return null;

  const currentPlan = selectedTier === "premium" ? SAAS_PLANS.premium : SAAS_PLANS.standard;
  const currentPrice = currentPlan.pricePerMonth;
  const pixKey = OFFICIAL_PIX_KEY;
  const pixCopyPasteCode = generatePixCopiaECola(currentPrice);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCopyPasteCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleConfirmPayment = () => {
    setCardFailureAlert(null);
    setIsProcessing(true);

    setTimeout(() => {
      // Se for Cartão de Crédito e estiver em modo de simulação de falha
      if (paymentMethod === "credit_card" && cardSimulation !== "approve") {
        setIsProcessing(false);
        const reason =
          cardSimulation === "decline_funds"
            ? "Saldo ou limite insuficiente no cartão"
            : "Cartão cancelado ou bloqueado pelo banco";

        const detail =
          cardSimulation === "decline_funds"
            ? `A operadora do seu cartão recusou a cobrança recorrente de R$ ${currentPrice},00 por falta de saldo/limite disponível.`
            : `A tentativa de cobrança de R$ ${currentPrice},00 foi recusada porque este cartão consta como cancelado ou inativo.`;

        setCardFailureAlert({ reason, detail });

        // Registra a assinatura com status de falha no cartão para controle administrativo
        createSubscription({
          venueId,
          venueName,
          ownerName: ownerName || "Responsável",
          ownerEmail: ownerEmail || "contato@baladaon.com.br",
          ownerWhatsapp: ownerWhatsapp || "11999990000",
          planId: selectedTier,
          tier: selectedTier,
          monthlyValue: currentPrice,
          paymentMethod: "credit_card",
          dueDay,
          cardLast4: cardNumber.replace(/\D/g, "").slice(-4) || "1234",
          cardHolder: cardName || ownerName || "TITULAR",
        });

        return;
      }

      // Pagamento Aprovado (Cartão normal ou Pix)
      const cleanLast4 = cardNumber.replace(/\D/g, "").slice(-4) || "4242";
      const newSub = createSubscription({
        venueId,
        venueName,
        ownerName: ownerName || "Responsável",
        ownerEmail: ownerEmail || "contato@baladaon.com.br",
        ownerWhatsapp: ownerWhatsapp || "11999990000",
        planId: selectedTier,
        tier: selectedTier,
        monthlyValue: currentPrice,
        paymentMethod,
        dueDay,
        cardLast4: paymentMethod === "credit_card" ? cleanLast4 : undefined,
        cardHolder: paymentMethod === "credit_card" ? (cardName || ownerName) : undefined,
      });

      setIsProcessing(false);
      setIsSuccess(true);
      onSuccess(newSub);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 transition-all animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-purple-500/30 bg-[#0a0e19] p-5 sm:p-7 text-slate-100 shadow-[0_0_50px_-10px_rgba(168,85,247,0.4)] z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 text-2xl shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            💳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white">Assinatura de Parceiro SaaS</h3>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                RECORRENTE • R$ 59,00/MÊS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ative ou renove o plano oficial de <span className="text-purple-300 font-bold">{venueName}</span> no Radar do Rolê
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-3xl mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
            <h4 className="text-2xl font-black text-white">Assinatura Confirmada & Ativa!</h4>
            <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
              {currentPlan.name} ativado com cobrança recorrente para todo <strong className="text-emerald-300">dia {dueDay}</strong> de cada mês no valor de <strong>R$ {currentPrice},00</strong>.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-2 text-xs font-bold text-emerald-300">
              <span>{paymentMethod === "credit_card" ? "💳 Cartão de Crédito Recorrente Validado" : "⚡ Chave Pix Registrada"}</span>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-6">
            {/* Step 1: Choose Plan Tier (Standard 59 vs Premium 89) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                  1. Escolha a Categoria do seu Plano
                </label>
                <span className="text-[10px] font-extrabold text-amber-300 uppercase bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                  Sem Fidelidade • Troque Quando Quiser
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Standard (R$ 59) */}
                <button
                  type="button"
                  onClick={() => setSelectedTier("standard")}
                  className={`relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    selectedTier === "standard"
                      ? "border-cyan-400 bg-gradient-to-br from-cyan-950/60 to-black/80 shadow-[0_0_25px_rgba(0,240,255,0.25)] ring-2 ring-cyan-400/50"
                      : "border-white/10 bg-white/5 hover:bg-white/10 opacity-80"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-white">Parceiro Standard</span>
                      <span className="text-xs font-extrabold text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                        R$ 59/mês
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Página oficial, lista VIP digital ilimitada com QR Code e alertas na portaria.
                    </p>
                    <div className="mt-3 space-y-1 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span>Card e perfil no Radar de SP</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span>Contador de quem favoritou</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span className="text-xs">✕</span>
                        <span>Envio de promoções (Bloqueado)</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Total Mensal:</span>
                    <span className="text-base font-black text-white">R$ 59,00</span>
                  </div>
                </button>

                {/* Option 2: Premium (R$ 89) */}
                <button
                  type="button"
                  onClick={() => setSelectedTier("premium")}
                  className={`relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    selectedTier === "premium"
                      ? "border-amber-400 bg-gradient-to-br from-amber-950/60 via-purple-950/40 to-black/80 shadow-[0_0_30px_rgba(245,158,11,0.3)] ring-2 ring-amber-400/60"
                      : "border-white/10 bg-white/5 hover:bg-white/10 opacity-80"
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 rounded-full bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 px-2.5 py-0.5 text-[9px] font-black text-white shadow-md">
                    RECOMENDADO ⭐
                  </span>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-amber-300 flex items-center gap-1">
                        <span>Parceiro Premium</span>
                        <span>👑</span>
                      </span>
                      <span className="text-xs font-black text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full">
                        R$ 89/mês
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-200/80 mt-1 font-medium">
                      🚀 <strong>Envio de Promoções para Favoritados</strong> (Upload de Flyer + Mensagens).
                    </p>
                    <div className="mt-3 space-y-1 text-[11px] text-slate-200">
                      <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                        <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span>Disparo com foto para os favoritados</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Selo Dourado VIP & Topo no Radar</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Tudo incluso do Plano Standard</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Total Mensal:</span>
                    <span className="text-base font-black text-amber-300">R$ 89,00</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Choose Due Day (Dia 10, 20 ou 30) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-cyan-400" />
                  <span>2. Escolha a Data de Pagamento Mensal</span>
                </label>
                <span className="text-[11px] text-cyan-300 font-bold">
                  Cobrança todo mês neste dia
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {([10, 20, 30] as DueDay[]).map((day) => {
                  const isSelected = dueDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setDueDay(day)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-950/40 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-xl font-black">{day}</span>
                      <span className="text-[11px] font-bold text-slate-400 mt-0.5">Todo Dia {day}</span>
                      {isSelected && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-black text-cyan-300">
                          <Check className="h-3 w-3 stroke-[3]" />
                          <span>Selecionado</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                💡 O sistema realiza o processamento recorrente automaticamente todo <strong>dia {dueDay}</strong> de cada mês.
              </p>
            </div>

            {/* Step 3: Payment Method (Only Credit Card or Pix) */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-3">
                3. Selecione a Forma de Pagamento Recorrente
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("credit_card");
                    setCardFailureAlert(null);
                  }}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    paymentMethod === "credit_card"
                      ? "border-purple-400 bg-purple-950/40 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-400"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">Cartão de Crédito</span>
                    <span className="text-[11px] text-purple-300 block">Cobrança recorrente todo dia {dueDay} (R$ 59/mês)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("pix");
                    setCardFailureAlert(null);
                  }}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    paymentMethod === "pix"
                      ? "border-emerald-400 bg-emerald-950/40 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">Pix Recorrente</span>
                    <span className="text-[11px] text-emerald-300 block">Aviso automático no WhatsApp todo dia {dueDay}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 4: Payment Details */}
            {paymentMethod === "pix" && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-black text-emerald-300 uppercase flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-emerald-400" />
                      Pagamento & Renovação via Pix Recorrente
                    </span>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Valor: <strong className="text-white text-sm">R$ 59,00</strong> • Vencimento: <strong className="text-emerald-300">Todo dia {dueDay}</strong>
                    </p>
                  </div>
                </div>

                {/* Visual Pix QR Code & Copy-Paste Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-black/50 p-4 rounded-2xl border border-white/10">
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white text-black shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                    <div className="relative h-28 w-28 flex flex-col justify-between p-1.5 bg-black rounded-lg overflow-hidden">
                      <div className="flex justify-between w-full">
                        <div className="h-6 w-6 border-2 border-emerald-400 bg-white p-0.5"><div className="h-full w-full bg-black" /></div>
                        <div className="h-6 w-6 border-2 border-emerald-400 bg-white p-0.5"><div className="h-full w-full bg-black" /></div>
                      </div>
                      <div className="flex items-center justify-center flex-col">
                        <span className="text-[8px] font-mono font-black text-emerald-400">PIX RECORRENTE</span>
                        <span className="text-[10px] font-mono font-extrabold text-white">R$ 59,00</span>
                      </div>
                      <div className="flex justify-between w-full">
                        <div className="h-6 w-6 border-2 border-emerald-400 bg-white p-0.5"><div className="h-full w-full bg-black" /></div>
                        <div className="h-4 w-4 bg-emerald-400 rounded-sm" />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 mt-1">Escaneie no App do Banco</span>
                  </div>

                  <div className="sm:col-span-2 space-y-2.5">
                    <div>
                      <span className="text-slate-400 font-mono text-[11px] block">Chave Pix Oficial (E-mail):</span>
                      <strong className="text-emerald-300 font-mono text-xs">{pixKey}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 font-mono text-[11px] block mb-1">Código Pix Copia e Cola:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={pixCopyPasteCode}
                          className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-[10px] font-mono text-slate-300 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition-all shrink-0 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95"
                        >
                          {copiedPix ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedPix ? "Copiado!" : "Copiar"}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      📲 O sistema enviará automaticamente um aviso com a chave Pix no seu WhatsApp todo <strong>dia {dueDay}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "credit_card" && (
              <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-300 uppercase block">
                    Dados do Cartão de Crédito Recorrente
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Cobrança mensal todo dia {dueDay}
                  </span>
                </div>

                {/* Card Inputs */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Número do Cartão</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Nome Impresso no Cartão</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="NOME COMO NO CARTAO"
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Validade</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        maxLength={5}
                        className="w-full rounded-xl border border-white/15 bg-white/5 py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        className="w-full rounded-xl border border-white/15 bg-white/5 py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Validation Test Selector (Allows simulating success vs failure to prove system response) */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Simulador de Validação da Cobrança:</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Teste do Gateway</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCardSimulation("approve");
                        setCardFailureAlert(null);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center ${
                        cardSimulation === "approve"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                          : "bg-white/5 text-slate-400 hover:text-white border border-transparent"
                      }`}
                    >
                      ✓ Aprovação Normal
                    </button>

                    <button
                      type="button"
                      onClick={() => setCardSimulation("decline_funds")}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center ${
                        cardSimulation === "decline_funds"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                          : "bg-white/5 text-slate-400 hover:text-white border border-transparent"
                      }`}
                    >
                      ⚠️ Recusa por Saldo
                    </button>

                    <button
                      type="button"
                      onClick={() => setCardSimulation("decline_cancelled")}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center ${
                        cardSimulation === "decline_cancelled"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/50"
                          : "bg-white/5 text-slate-400 hover:text-white border border-transparent"
                      }`}
                    >
                      ❌ Cartão Cancelado
                    </button>
                  </div>
                </div>

                {/* Card Failure Response Alert */}
                {cardFailureAlert && (
                  <div className="rounded-xl border border-rose-500/50 bg-rose-950/30 p-4 space-y-3 animate-in shake duration-300">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-black text-rose-300 uppercase">
                          Cobrança Recusada pelo Emissor: {cardFailureAlert.reason}
                        </h5>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {cardFailureAlert.detail}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-black/60 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-300">
                          💡 Alternativa Instantânea via Pix:
                        </span>
                        <span className="text-[10px] text-slate-400">Sem interrupção</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Para ativar seu local agora sem esperar a regularização do cartão, transfira via Pix para:
                      </p>
                      <div className="flex items-center justify-between gap-2 bg-white/5 p-2 rounded-lg">
                        <span className="text-xs font-mono font-bold text-emerald-300 truncate">
                          {OFFICIAL_PIX_KEY}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(OFFICIAL_PIX_KEY);
                            alert("Chave Pix copiada!");
                          }}
                          className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 rounded cursor-pointer"
                        >
                          Copiar Chave
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod("pix");
                          setCardFailureAlert(null);
                        }}
                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-bold text-white transition-all cursor-pointer text-center"
                      >
                        Pagar via Pix Agora (R$ 59)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardFailureAlert(null)}
                        className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/5 transition-all cursor-pointer"
                      >
                        Tentar Outro Cartão
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <span>Cobrança Recorrente Segura</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-2.5 text-xs font-black text-black hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  <Zap className="h-4 w-4" />
                  <span>
                    {isProcessing
                      ? "Processando..."
                      : paymentMethod === "pix"
                      ? `Confirmar Pix Recorrente (Dia ${dueDay})`
                      : `Ativar Cartão Recorrente (Dia ${dueDay})`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}