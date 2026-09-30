// ============================================================================
// SERVIÇO DE ASSINATURAS E FATURAMENTO SAAS B2B - RADAR DO ROLÊ
// Plano Oficial Unificado: R$ 59,00 / mês recorrente
// Vencimentos: Dia 10, Dia 20 ou Dia 30
// Métodos: Cartão de Crédito Recorrente & Pix Recorrente
// ============================================================================

export type DueDay = 10 | 20 | 30;

export type PlanTier = "standard" | "premium";

export const STANDARD_PLAN_PRICE = 59;
export const STANDARD_PLAN_NAME = "Parceiro Standard";
export const PREMIUM_PLAN_PRICE = 89;
export const PREMIUM_PLAN_NAME = "Parceiro Premium";

// Mantém compatibilidade com referências existentes
export const OFFICIAL_PLAN_PRICE = 59;
export const OFFICIAL_PLAN_NAME = STANDARD_PLAN_NAME;
export const OFFICIAL_PIX_KEY = "thiagooriginal2002@gmail.com";

export interface SaasPlan {
  id: "standard" | "premium" | "mensal" | "semestral" | "anual";
  tier: PlanTier;
  name: string;
  pricePerMonth: number;
  totalBilledAmount: number;
  periodText: string;
  billingFrequencyText: string;
  savingsBadge: string | null;
  features: string[];
  canSendPromotions: boolean;
}

export const SAAS_PLANS: Record<"standard" | "premium" | "mensal" | "semestral" | "anual", SaasPlan> = {
  standard: {
    id: "standard",
    tier: "standard",
    name: STANDARD_PLAN_NAME,
    pricePerMonth: STANDARD_PLAN_PRICE,
    totalBilledAmount: STANDARD_PLAN_PRICE,
    periodText: "/mês",
    billingFrequencyText: "Assinatura mensal de R$ 59,00 no Cartão ou Pix Recorrente",
    savingsBadge: "PLANO STANDARD 💼",
    canSendPromotions: false,
    features: [
      "Página e card dedicado com destaque no Radar de SP",
      "Lista VIP digital ilimitada com emissão de vouchers e QR Code",
      "Disparo automático de alertas para o WhatsApp da portaria",
      "Scanner de QR Code por câmera na entrada da balada",
      "Botão oficial direto para o WhatsApp comercial da casa",
      "Estimativa de rotas e corridas por aplicativos de mobilidade (Uber/99)",
      "Selo oficial de Estabelecimento Parceiro Verificado",
      "Painel com contagem de quantas pessoas favoritaram seu local",
      "Métricas e analytics de público em tempo real",
      "❌ Envio de promoções para favoritados (Recurso Premium)",
    ],
  },
  premium: {
    id: "premium",
    tier: "premium",
    name: PREMIUM_PLAN_NAME,
    pricePerMonth: PREMIUM_PLAN_PRICE,
    totalBilledAmount: PREMIUM_PLAN_PRICE,
    periodText: "/mês",
    billingFrequencyText: "Assinatura mensal de R$ 89,00 no Cartão ou Pix Recorrente",
    savingsBadge: "RECOMENDADO • MAIS RESULTADO ⭐",
    canSendPromotions: true,
    features: [
      "Tudo incluído no Plano Standard",
      "🚀 Envio de Promoções para a Lista de Favoritados (Broadcast de Fãs)",
      "Upload de Imagem/Banner (flyers, banner de festas e cardápios)",
      "Envio de Textos com cupons e cortesias diretamente para os fãs",
      "Visualização da lista de contatos com autorização LGPD",
      "Selo Dourado Oficial 'Parceiro Premium' nos cards do Radar",
      "Prioridade máxima no algoritmo do Radar e busca por proximidade",
      "Suporte exclusivo direto com gerente de conta",
    ],
  },
  // Aliases para compatibilidade total
  mensal: {
    id: "standard",
    tier: "standard",
    name: STANDARD_PLAN_NAME,
    pricePerMonth: STANDARD_PLAN_PRICE,
    totalBilledAmount: STANDARD_PLAN_PRICE,
    periodText: "/mês",
    billingFrequencyText: "Assinatura mensal de R$ 59,00 no Cartão ou Pix Recorrente",
    savingsBadge: "PLANO STANDARD 💼",
    canSendPromotions: false,
    features: [
      "Página e card dedicado com destaque no Radar de SP",
      "Lista VIP digital ilimitada com emissão de vouchers e QR Code",
      "Disparo automático de alertas para o WhatsApp da portaria",
      "Painel com contagem de quantas pessoas favoritaram seu local",
      "❌ Envio de promoções para favoritados (Recurso Premium)",
    ],
  },
  semestral: {
    id: "premium",
    tier: "premium",
    name: PREMIUM_PLAN_NAME,
    pricePerMonth: PREMIUM_PLAN_PRICE,
    totalBilledAmount: PREMIUM_PLAN_PRICE,
    periodText: "/mês",
    billingFrequencyText: "Assinatura mensal de R$ 89,00 no Cartão ou Pix Recorrente",
    savingsBadge: "RECOMENDADO • MAIS RESULTADO ⭐",
    canSendPromotions: true,
    features: [
      "Tudo incluído no Plano Standard",
      "🚀 Envio de Promoções para a lista de favoritados (Texto e Imagem)",
      "Selo Dourado Oficial 'Parceiro Premium' no Radar",
    ],
  },
  anual: {
    id: "premium",
    tier: "premium",
    name: PREMIUM_PLAN_NAME,
    pricePerMonth: PREMIUM_PLAN_PRICE,
    totalBilledAmount: PREMIUM_PLAN_PRICE,
    periodText: "/mês",
    billingFrequencyText: "Assinatura mensal de R$ 89,00 no Cartão ou Pix Recorrente",
    savingsBadge: "RECOMENDADO • MAIS RESULTADO ⭐",
    canSendPromotions: true,
    features: [
      "Tudo incluído no Plano Standard",
      "🚀 Envio de Promoções para a lista de favoritados (Texto e Imagem)",
      "Selo Dourado Oficial 'Parceiro Premium' no Radar",
    ],
  },
};

export interface SaasSubscription {
  id: string;
  venueId: string;
  venueName: string;
  ownerName: string;
  ownerEmail: string;
  ownerWhatsapp: string;
  planId: "standard" | "premium" | "mensal" | "semestral" | "anual";
  tier?: PlanTier;
  planName: string;
  monthlyValue: number;
  totalCycleValue: number;
  dueDay: DueDay;
  status: "active" | "trialing" | "pending_payment" | "past_due" | "card_failed" | "cancelled";
  paymentMethod: "pix" | "credit_card" | "boleto";
  startDate: string;
  nextBillingDate: string;
  canSendPromotions?: boolean;
  asaasSubscriptionId?: string;
  pixCopiaECola?: string;
  pixQrCodeUrl?: string;
  cardLast4?: string;
  cardBrand?: string;
  cardHolder?: string;
  lastChargeStatus?: "success" | "failed" | "pending";
  lastChargeFailureReason?: string;
  lastChargeDate?: string;
}

export interface SaasMetrics {
  mrr: number;
  arr: number;
  activeSubscriptionsCount: number;
  pendingSubscriptionsCount: number;
  trialSubscriptionsCount: number;
  arpu: number;
  churnRatePercent: number;
  ltv: number;
  planBreakdown: {
    standard: number;
    premium: number;
    mensal: number;
    semestral: number;
    anual: number;
  };
}

export interface SaasProjectionMonth {
  month: string;
  conservativeMRR: number;
  realisticMRR: number;
  aggressiveMRR: number;
  activeVenues: number;
}

export interface GatewayConfig {
  provider: "asaas" | "stripe";
  environment: "sandbox" | "production";
  apiKey: string;
  webhookSecret?: string;
  walletId?: string;
  isEnabled: boolean;
}

const STORAGE_KEY_SUBSCRIPTIONS = "radardorole_saas_subscriptions_v2";
const STORAGE_KEY_GATEWAY = "radardorole_saas_gateway_config_v1";

/**
 * Calcula a próxima data de vencimento baseada no dia escolhido (10, 20 ou 30)
 */
export function calculateNextDueDate(dueDay: DueDay, referenceDate: Date = new Date()): string {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth();
  const currentDay = referenceDate.getDate();

  let targetYear = currentYear;
  let targetMonth = currentMonth;

  // Se o dia de hoje for igual ou posterior ao dia de vencimento, o próximo vencimento é no próximo mês
  if (currentDay >= dueDay) {
    targetMonth += 1;
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }
  }

  // Trava para o último dia caso o mês tenha menos dias (ex: Fev 28/29)
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const actualDay = Math.min(dueDay, daysInMonth);

  const mm = String(targetMonth + 1).padStart(2, "0");
  const dd = String(actualDay).padStart(2, "0");
  return `${targetYear}-${mm}-${dd}`;
}

export function generatePixCopiaECola(amount: number = 59): string {
  return (
    "00020126580014br.gov.bcb.pix0136" +
    OFFICIAL_PIX_KEY +
    "520400005303986540" +
    amount.toFixed(2).replace(".", "") +
    "5802BR5913Radar do Role6009Sao Paulo62070503***6304" +
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );
}

const SEED_SUBSCRIPTIONS: SaasSubscription[] = [
  {
    id: "sub-001",
    venueId: "balada-vilajk",
    venueName: "Vila JK",
    ownerName: "Carlos Eduardo Mendes",
    ownerEmail: "carlos@vilajk.com.br",
    ownerWhatsapp: "11988881234",
    planId: "standard",
    tier: "standard",
    planName: STANDARD_PLAN_NAME,
    monthlyValue: STANDARD_PLAN_PRICE,
    totalCycleValue: STANDARD_PLAN_PRICE,
    dueDay: 10,
    status: "active",
    paymentMethod: "credit_card",
    startDate: "2026-01-10",
    nextBillingDate: "2026-10-10",
    cardLast4: "4242",
    cardBrand: "Mastercard",
    cardHolder: "CARLOS E MENDES",
    lastChargeStatus: "success",
    lastChargeDate: "2026-09-10",
    canSendPromotions: false,
  },
  {
    id: "sub-002",
    venueId: "balada-seujustino",
    venueName: "Seu Justino",
    ownerName: "Renato Silveira",
    ownerEmail: "renato@seujustino.com.br",
    ownerWhatsapp: "11977774321",
    planId: "standard",
    tier: "standard",
    planName: STANDARD_PLAN_NAME,
    monthlyValue: STANDARD_PLAN_PRICE,
    totalCycleValue: STANDARD_PLAN_PRICE,
    dueDay: 20,
    status: "active",
    paymentMethod: "pix",
    startDate: "2026-05-20",
    nextBillingDate: "2026-10-20",
    pixCopiaECola: generatePixCopiaECola(STANDARD_PLAN_PRICE),
    lastChargeStatus: "success",
    lastChargeDate: "2026-09-20",
    canSendPromotions: false,
  },
  {
    id: "sub-003",
    venueId: "balada-dedge",
    venueName: "D-Edge",
    ownerName: "Renato Ratier",
    ownerEmail: "diretoria@d-edge.com.br",
    ownerWhatsapp: "11999998888",
    planId: "premium",
    tier: "premium",
    planName: PREMIUM_PLAN_NAME,
    monthlyValue: PREMIUM_PLAN_PRICE,
    totalCycleValue: PREMIUM_PLAN_PRICE,
    dueDay: 30,
    status: "active",
    paymentMethod: "credit_card",
    startDate: "2026-02-30",
    nextBillingDate: "2026-10-30",
    cardLast4: "8899",
    cardBrand: "Visa",
    cardHolder: "RENATO RATIER",
    lastChargeStatus: "success",
    lastChargeDate: "2026-09-30",
    canSendPromotions: true,
  },
  {
    id: "sub-004",
    venueId: "motel-lush",
    venueName: "Lush Motel Design",
    ownerName: "Fabiana Toledo",
    ownerEmail: "reservas@lushmotel.com.br",
    ownerWhatsapp: "11982223344",
    planId: "premium",
    tier: "premium",
    planName: PREMIUM_PLAN_NAME,
    monthlyValue: PREMIUM_PLAN_PRICE,
    totalCycleValue: PREMIUM_PLAN_PRICE,
    dueDay: 10,
    status: "active",
    paymentMethod: "pix",
    startDate: "2026-04-10",
    nextBillingDate: "2026-10-10",
    pixCopiaECola: generatePixCopiaECola(PREMIUM_PLAN_PRICE),
    lastChargeStatus: "success",
    lastChargeDate: "2026-09-10",
    canSendPromotions: true,
  },
  {
    id: "sub-005",
    venueId: "motel-apple",
    venueName: "Apple Motel",
    ownerName: "Marcos Paulo Costa",
    ownerEmail: "contato@applemotel.com.br",
    ownerWhatsapp: "11976665544",
    planId: "mensal",
    planName: OFFICIAL_PLAN_NAME,
    monthlyValue: 59,
    totalCycleValue: 59,
    dueDay: 20,
    status: "card_failed",
    paymentMethod: "credit_card",
    startDate: "2026-08-20",
    nextBillingDate: "2026-10-20",
    cardLast4: "1234",
    cardBrand: "Visa",
    cardHolder: "MARCOS P COSTA",
    lastChargeStatus: "failed",
    lastChargeFailureReason: "Saldo ou limite insuficiente no cartão de crédito.",
    lastChargeDate: "2026-09-20",
    pixCopiaECola: generatePixCopiaECola(59),
  },
  {
    id: "sub-006",
    venueId: "balada-highline",
    venueName: "High Line Bar",
    ownerName: "Rodrigo Vasconcelos",
    ownerEmail: "gestao@highlinebar.com.br",
    ownerWhatsapp: "11994443322",
    planId: "mensal",
    planName: OFFICIAL_PLAN_NAME,
    monthlyValue: 59,
    totalCycleValue: 59,
    dueDay: 30,
    status: "active",
    paymentMethod: "pix",
    startDate: "2026-06-30",
    nextBillingDate: "2026-10-30",
    pixCopiaECola: generatePixCopiaECola(59),
    lastChargeStatus: "success",
    lastChargeDate: "2026-09-30",
  },
  {
    id: "sub-007",
    venueId: "balada-tetto",
    venueName: "Tetto Rooftop Lounge",
    ownerName: "Guilherme Siqueira",
    ownerEmail: "vip@tettolounge.com.br",
    ownerWhatsapp: "11991112233",
    planId: "mensal",
    planName: OFFICIAL_PLAN_NAME,
    monthlyValue: 59,
    totalCycleValue: 59,
    dueDay: 10,
    status: "card_failed",
    paymentMethod: "credit_card",
    startDate: "2026-03-10",
    nextBillingDate: "2026-10-10",
    cardLast4: "5521",
    cardBrand: "Elo",
    cardHolder: "GUILHERME SIQUEIRA",
    lastChargeStatus: "failed",
    lastChargeFailureReason: "Cartão cancelado ou bloqueado pelo banco emissor.",
    lastChargeDate: "2026-09-10",
    pixCopiaECola: generatePixCopiaECola(59),
  },
  {
    id: "sub-008",
    venueId: "balada-audio",
    venueName: "Audio Club",
    ownerName: "Marcelo Rossi",
    ownerEmail: "comercial@audiosp.com.br",
    ownerWhatsapp: "11985556677",
    planId: "mensal",
    planName: OFFICIAL_PLAN_NAME,
    monthlyValue: 59,
    totalCycleValue: 59,
    dueDay: 20,
    status: "pending_payment",
    paymentMethod: "pix",
    startDate: "2026-09-20",
    nextBillingDate: "2026-10-20",
    pixCopiaECola: generatePixCopiaECola(59),
    lastChargeStatus: "pending",
  },
];

export function getStoredSubscriptions(): SaasSubscription[] {
  if (typeof window === "undefined") return SEED_SUBSCRIPTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBSCRIPTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SUBSCRIPTIONS, JSON.stringify(SEED_SUBSCRIPTIONS));
      return SEED_SUBSCRIPTIONS;
    }
    const parsed: SaasSubscription[] = JSON.parse(raw);
    return parsed.map((s) => {
      const isPremium = s.monthlyValue === 89 || s.planId === "premium" || s.tier === "premium";
      const monthly = isPremium ? PREMIUM_PLAN_PRICE : STANDARD_PLAN_PRICE;
      const tier: PlanTier = isPremium ? "premium" : "standard";
      return {
        ...s,
        planName: isPremium ? PREMIUM_PLAN_NAME : STANDARD_PLAN_NAME,
        monthlyValue: monthly,
        totalCycleValue: monthly,
        tier,
        planId: isPremium ? "premium" : "standard",
        dueDay: (s.dueDay === 10 || s.dueDay === 20 || s.dueDay === 30 ? s.dueDay : 10) as DueDay,
        paymentMethod: s.paymentMethod === "boleto" ? "pix" : s.paymentMethod || "pix",
        pixCopiaECola: s.pixCopiaECola || generatePixCopiaECola(monthly),
        canSendPromotions: isPremium,
      };
    });
  } catch (e) {
    return SEED_SUBSCRIPTIONS;
  }
}

export function saveSubscriptions(subs: SaasSubscription[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SUBSCRIPTIONS, JSON.stringify(subs));
  } catch (e) {}
}

export function getSubscriptionByVenue(venueId?: string, venueName?: string): SaasSubscription {
  const subs = getStoredSubscriptions();
  const safeId = (venueId || "").toLowerCase().trim();
  const safeName = (venueName || "").toLowerCase().trim();

  const found = subs.find((s) => {
    if (!s) return false;
    const sId = (s.venueId || "").toLowerCase().trim();
    const sName = (s.venueName || "").toLowerCase().trim();
    if (safeId && sId === safeId) return true;
    if (safeName && sName === safeName) return true;
    return false;
  });
  if (found) return found;

  const displayName = venueName || "Meu Estabelecimento";
  const cleanId = venueId || "partner-" + Date.now();
  const defaultDueDay: DueDay = 10;

  const newSub: SaasSubscription = {
    id: "sub-" + cleanId,
    venueId: cleanId,
    venueName: displayName,
    ownerName: "Responsável pelo Estabelecimento",
    ownerEmail: "contato@" + displayName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com.br",
    ownerWhatsapp: "11999990000",
    planId: "standard",
    tier: "standard",
    planName: STANDARD_PLAN_NAME,
    monthlyValue: STANDARD_PLAN_PRICE,
    totalCycleValue: STANDARD_PLAN_PRICE,
    dueDay: defaultDueDay,
    status: "active",
    paymentMethod: "pix",
    startDate: new Date().toISOString().split("T")[0],
    nextBillingDate: calculateNextDueDate(defaultDueDay),
    pixCopiaECola: generatePixCopiaECola(STANDARD_PLAN_PRICE),
    canSendPromotions: false,
  };

  const updated = [...subs, newSub];
  saveSubscriptions(updated);
  return newSub;
}

export function updateSubscription(subId: string, updates: Partial<SaasSubscription>): SaasSubscription | null {
  const subs = getStoredSubscriptions();
  const index = subs.findIndex((s) => s.id === subId);
  if (index === -1) return null;

  subs[index] = { ...subs[index], ...updates };
  saveSubscriptions(subs);
  return subs[index];
}

export function createSubscription(input: {
  venueId: string;
  venueName: string;
  ownerName: string;
  ownerEmail: string;
  ownerWhatsapp: string;
  planId?: "standard" | "premium" | "mensal" | "semestral" | "anual";
  tier?: PlanTier;
  monthlyValue?: number;
  paymentMethod: "pix" | "credit_card" | "boleto";
  dueDay?: DueDay;
  cardLast4?: string;
  cardBrand?: string;
  cardHolder?: string;
}): SaasSubscription {
  const subs = getStoredSubscriptions();
  const chosenDueDay: DueDay = input.dueDay === 10 || input.dueDay === 20 || input.dueDay === 30 ? input.dueDay : 10;
  const isPremium = input.planId === "premium" || input.tier === "premium" || input.monthlyValue === 89;
  const monthly = isPremium ? PREMIUM_PLAN_PRICE : STANDARD_PLAN_PRICE;
  const planName = isPremium ? PREMIUM_PLAN_NAME : STANDARD_PLAN_NAME;
  const pixKey = generatePixCopiaECola(monthly);

  const newSub: SaasSubscription = {
    id: "sub-" + Date.now(),
    venueId: input.venueId,
    venueName: input.venueName,
    ownerName: input.ownerName,
    ownerEmail: input.ownerEmail,
    ownerWhatsapp: input.ownerWhatsapp,
    planId: isPremium ? "premium" : "standard",
    tier: isPremium ? "premium" : "standard",
    planName,
    monthlyValue: monthly,
    totalCycleValue: monthly,
    dueDay: chosenDueDay,
    status: "active",
    paymentMethod: input.paymentMethod === "boleto" ? "pix" : input.paymentMethod,
    startDate: new Date().toISOString().split("T")[0],
    nextBillingDate: calculateNextDueDate(chosenDueDay),
    pixCopiaECola: pixKey,
    cardLast4: input.cardLast4,
    cardBrand: input.cardBrand || "Mastercard",
    cardHolder: input.cardHolder,
    lastChargeStatus: "success",
    lastChargeDate: new Date().toISOString().split("T")[0],
    canSendPromotions: isPremium,
  };

  const filtered = subs.filter((s) => s.venueId !== input.venueId);
  const updated = [newSub, ...filtered];
  saveSubscriptions(updated);
  return newSub;
}

export function isSubscriptionPremium(sub?: SaasSubscription | null): boolean {
  if (!sub) return false;
  return sub.planId === "premium" || sub.tier === "premium" || (Boolean(sub.monthlyValue) && sub.monthlyValue >= 89) || sub.canSendPromotions === true;
}

export function switchSubscriptionTier(subIdOrVenueId: string, targetTier: PlanTier): SaasSubscription | null {
  const subs = getStoredSubscriptions();
  const index = subs.findIndex((s) => s.id === subIdOrVenueId || s.venueId === subIdOrVenueId);
  if (index === -1) return null;
  const isPrem = targetTier === "premium";
  const updatedSub: SaasSubscription = {
    ...subs[index],
    planId: isPrem ? "premium" : "standard",
    tier: targetTier,
    planName: isPrem ? PREMIUM_PLAN_NAME : STANDARD_PLAN_NAME,
    monthlyValue: isPrem ? PREMIUM_PLAN_PRICE : STANDARD_PLAN_PRICE,
    totalCycleValue: isPrem ? PREMIUM_PLAN_PRICE : STANDARD_PLAN_PRICE,
    canSendPromotions: isPrem,
    pixCopiaECola: generatePixCopiaECola(isPrem ? PREMIUM_PLAN_PRICE : STANDARD_PLAN_PRICE),
  };
  subs[index] = updatedSub;
  saveSubscriptions(subs);
  return updatedSub;
}

/**
 * Processamento e Validação da Cobrança Recorrente de Cartão
 * Simula aprovação ou falha (saldo insuficiente, cartão cancelado, bloqueio bancário)
 */
export function processCardRecurringCharge(
  subId: string,
  simulationResult: "approve" | "decline_funds" | "decline_cancelled" | "decline_blocked" = "approve"
): { success: boolean; sub: SaasSubscription; reason?: string; message: string } {
  const subs = getStoredSubscriptions();
  const index = subs.findIndex((s) => s.id === subId);
  if (index === -1) {
    throw new Error("Assinatura não encontrada");
  }

  const sub = { ...subs[index] };
  const today = new Date().toISOString().split("T")[0];

  if (simulationResult === "approve") {
    sub.status = "active";
    sub.lastChargeStatus = "success";
    sub.lastChargeFailureReason = undefined;
    sub.lastChargeDate = today;
    // Próxima data de cobrança no próximo mês
    sub.nextBillingDate = calculateNextDueDate(sub.dueDay || 10, new Date(Date.now() + 86400000));

    const message = buildSaasCardChargeSuccessMessage({
      ownerName: sub.ownerName,
      venueName: sub.venueName,
      dueDay: sub.dueDay || 10,
      amount: sub.monthlyValue || 59,
      cardLast4: sub.cardLast4 || "••••",
      nextBillingDate: sub.nextBillingDate,
    });

    subs[index] = sub;
    saveSubscriptions(subs);
    return { success: true, sub, message };
  } else {
    let failureReason = "Transação não autorizada pelo banco emissor.";
    if (simulationResult === "decline_funds") {
      failureReason = "Saldo ou limite insuficiente no cartão de crédito.";
    } else if (simulationResult === "decline_cancelled") {
      failureReason = "Cartão de crédito cancelado ou expirado.";
    } else if (simulationResult === "decline_blocked") {
      failureReason = "Transação bloqueada por política de segurança do banco emissor.";
    }

    sub.status = "card_failed";
    sub.lastChargeStatus = "failed";
    sub.lastChargeFailureReason = failureReason;
    sub.lastChargeDate = today;

    const message = buildSaasCardChargeFailedMessage({
      ownerName: sub.ownerName,
      venueName: sub.venueName,
      dueDay: sub.dueDay || 10,
      amount: sub.monthlyValue || 59,
      failureReason,
      cardLast4: sub.cardLast4 || "••••",
      pixKey: OFFICIAL_PIX_KEY,
      pixCode: sub.pixCopiaECola,
    });

    subs[index] = sub;
    saveSubscriptions(subs);
    return { success: false, sub, reason: failureReason, message };
  }
}

/* ========================================================================= */
/* MENSAGENS INTELIGENTES DE WHATSAPP PARA ASSINATURA SAAS                   */
/* ========================================================================= */

/**
 * Notificação para Cobrança via Pix Recorrente (Lembrete de Vencimento Dia 10, 20 ou 30)
 */
export function buildSaasPixDueNoticeMessage(params: {
  ownerName: string;
  venueName: string;
  dueDay: DueDay;
  dueDate: string;
  amount?: number;
  pixKey?: string;
  pixCode?: string;
}): string {
  const amount = params.amount || 59;
  const pixKey = params.pixKey || OFFICIAL_PIX_KEY;
  return (
    `🏢 *RADAR DO ROLÊ • AVISO DE VENCIMENTO SAAS* ⚡\n\n` +
    `Olá, *${params.ownerName}*! Tudo bem?\n\n` +
    `Lembramos que o vencimento da assinatura do seu estabelecimento *${params.venueName}* no Radar do Rolê é todo *dia ${params.dueDay}* (Próximo vencimento: *${params.dueDate}*).\n\n` +
    `📋 *Resumo da Mensalidade:*\n` +
    `• Estabelecimento: *${params.venueName}*\n` +
    `• Plano: *Plano Parceiro VIP Pro*\n` +
    `• Valor Mensal: *R$ ${amount},00*\n` +
    `• Modalidade: *Pix Recorrente (Vencimento todo dia ${params.dueDay})*\n\n` +
    `🔑 *Chave Pix Oficial para Pagamento:*\n` +
    `\`${pixKey}\`\n\n` +
    (params.pixCode ? `📲 *Código Pix Copia e Cola:*\n\`${params.pixCode}\`\n\n` : "") +
    `Após realizar o pagamento, seu estabelecimento continuará com destaque nas buscas por bairro, lista VIP e scanner de portaria 100% ativos!\n\n` +
    `_Radar do Rolê SP • O mapa das noites paulistanas_`
  );
}

/**
 * Notificação para Cobrança no Cartão de Crédito - Aprovada com Sucesso
 */
export function buildSaasCardChargeSuccessMessage(params: {
  ownerName: string;
  venueName: string;
  dueDay: DueDay;
  amount?: number;
  cardLast4?: string;
  nextBillingDate: string;
}): string {
  const amount = params.amount || 59;
  const last4 = params.cardLast4 || "••••";
  return (
    `✅ *COBRANÇA CONFIRMADA COM SUCESSO! • RADAR DO ROLÊ* 💳\n\n` +
    `Olá, *${params.ownerName}*!\n\n` +
    `Informamos que a cobrança recorrente da assinatura do estabelecimento *${params.venueName}* foi processada com sucesso no seu Cartão de Crédito (final *${last4}*).\n\n` +
    `📋 *Detalhes da Transação:*\n` +
    `• Plano: *Plano Parceiro VIP Pro*\n` +
    `• Valor Cobrado: *R$ ${amount},00*\n` +
    `• Data de Cobrança: *Todo dia ${params.dueDay}*\n` +
    `• Status: *Aprovado & Ativo* ✅\n` +
    `• Próxima Renovação: *${params.nextBillingDate}*\n\n` +
    `Sua casa continua com destaque máximo, lista VIP ilimitada e portaria digital operando normalmente!\n\n` +
    `Obrigado pela parceria contínua! 🔥\n` +
    `_Radar do Rolê SP_`
  );
}

/**
 * Notificação para Cobrança no Cartão de Crédito - Falha / Recusa (Saldo, Cancelado, etc)
 */
export function buildSaasCardChargeFailedMessage(params: {
  ownerName: string;
  venueName: string;
  dueDay: DueDay;
  amount?: number;
  failureReason: string;
  cardLast4?: string;
  pixKey?: string;
  pixCode?: string;
}): string {
  const amount = params.amount || 59;
  const pixKey = params.pixKey || OFFICIAL_PIX_KEY;
  const last4 = params.cardLast4 || "••••";
  return (
    `⚠️ *ATENÇÃO: FALHA NA COBRANÇA RECORRENTE • RADAR DO ROLÊ* 🚨\n\n` +
    `Olá, *${params.ownerName}*!\n\n` +
    `Tentamos realizar a cobrança da mensalidade do seu estabelecimento *${params.venueName}* no Cartão de Crédito cadastrado (final *${last4}*), porém a transação não foi aprovada pelo emissor do cartão.\n\n` +
    `❌ *Motivo da Não Aprovação:*\n` +
    `*${params.failureReason}*\n` +
    `(Pode ter ocorrido por saldo insuficiente, cartão cancelado/bloqueado ou política do seu banco).\n\n` +
    `💡 *Para evitar a suspensão temporária da sua Lista VIP e dos destaques da casa, você pode regularizar agora mesmo via Pix:*\n\n` +
    `💵 *Valor:* R$ ${amount},00\n` +
    `🔑 *Chave Pix Oficial:*\n` +
    `\`${pixKey}\`\n\n` +
    (params.pixCode ? `📲 *Código Pix Copia e Cola:*\n\`${params.pixCode}\`\n\n` : "") +
    `Assim que transferir, responda a esta mensagem com o comprovante para revalidarmos o seu perfil imediatamente.\n\n` +
    `Equipe Radar do Rolê SP`
  );
}

export function generatePartnerBillingWhatsAppLink(sub: SaasSubscription): string {
  let text = "";
  if (sub.paymentMethod === "credit_card" && sub.lastChargeStatus === "failed") {
    text = encodeURIComponent(
      buildSaasCardChargeFailedMessage({
        ownerName: sub.ownerName,
        venueName: sub.venueName,
        dueDay: sub.dueDay || 10,
        amount: sub.monthlyValue || 59,
        failureReason: sub.lastChargeFailureReason || "Transação não autorizada no cartão",
        cardLast4: sub.cardLast4 || "••••",
        pixKey: OFFICIAL_PIX_KEY,
        pixCode: sub.pixCopiaECola,
      })
    );
  } else if (sub.paymentMethod === "credit_card" && sub.lastChargeStatus === "success") {
    text = encodeURIComponent(
      buildSaasCardChargeSuccessMessage({
        ownerName: sub.ownerName,
        venueName: sub.venueName,
        dueDay: sub.dueDay || 10,
        amount: sub.monthlyValue || 59,
        cardLast4: sub.cardLast4 || "••••",
        nextBillingDate: sub.nextBillingDate,
      })
    );
  } else {
    text = encodeURIComponent(
      buildSaasPixDueNoticeMessage({
        ownerName: sub.ownerName,
        venueName: sub.venueName,
        dueDay: sub.dueDay || 10,
        dueDate: sub.nextBillingDate,
        amount: sub.monthlyValue || 59,
        pixKey: OFFICIAL_PIX_KEY,
        pixCode: sub.pixCopiaECola,
      })
    );
  }
  return `https://wa.me/55${sub.ownerWhatsapp.replace(/\D/g, "")}?text=${text}`;
}

export function calculateSaasMetrics(totalCatalogVenuesCount: number = 300): SaasMetrics {
  const subs = getStoredSubscriptions();
  const activeSubs = subs.filter((s) => s.status === "active");

  const standardCount = activeSubs.filter((s) => s.tier !== "premium" && s.monthlyValue !== 89).length;
  const premiumCount = activeSubs.filter((s) => s.tier === "premium" || s.monthlyValue === 89).length;

  const planBreakdown = {
    standard: standardCount,
    premium: premiumCount,
    mensal: standardCount,
    semestral: premiumCount,
    anual: 0,
  };

  const directMrr = activeSubs.reduce((acc, curr) => acc + (curr.monthlyValue || 59), 0);
  const estimatedActivePartners = Math.max(activeSubs.length, Math.round(totalCatalogVenuesCount * 0.28));
  const estimatedAveragePlan = 59;
  const mrr = Math.round(directMrr + (estimatedActivePartners - activeSubs.length) * estimatedAveragePlan);
  const arr = mrr * 12;
  const arpu = 59;
  const churnRatePercent = 2.1;
  const ltv = Math.round(arpu / (churnRatePercent / 100));

  return {
    mrr,
    arr,
    activeSubscriptionsCount: estimatedActivePartners,
    pendingSubscriptionsCount: subs.filter((s) => s.status === "pending_payment" || s.status === "card_failed").length,
    trialSubscriptionsCount: Math.round(totalCatalogVenuesCount * 0.15),
    arpu,
    churnRatePercent,
    ltv,
    planBreakdown,
  };
}

export function getSaasProjections(): SaasProjectionMonth[] {
  const months = [
    "Out/26",
    "Nov/26",
    "Dez/26 (Festas Fim de Ano)",
    "Jan/27 (Férias SP)",
    "Fev/27 (Carnaval)",
    "Mar/27",
    "Abr/27",
    "Mai/27",
    "Jun/27 (Festas Juninas)",
    "Jul/27",
    "Ago/27",
    "Set/27",
  ];

  const baseMRR = 4956; // 84 * 59

  return months.map((month, idx) => {
    const seasonalBoost = idx === 2 ? 1.25 : idx === 4 ? 1.35 : idx === 8 ? 1.15 : 1.0;
    const monthIndex = idx + 1;

    const conservativeGrowth = Math.pow(1.08, monthIndex);
    const realisticGrowth = Math.pow(1.15, monthIndex);
    const aggressiveGrowth = Math.pow(1.22, monthIndex);

    const conservativeMRR = Math.round(baseMRR * conservativeGrowth * seasonalBoost);
    const realisticMRR = Math.round(baseMRR * realisticGrowth * seasonalBoost);
    const aggressiveMRR = Math.round(baseMRR * aggressiveGrowth * seasonalBoost);
    const activeVenues = Math.round(84 + idx * 18 * seasonalBoost);

    return {
      month,
      conservativeMRR,
      realisticMRR,
      aggressiveMRR,
      activeVenues,
    };
  });
}

export function getGatewayConfig(): GatewayConfig {
  if (typeof window === "undefined") {
    return {
      provider: "asaas",
      environment: "sandbox",
      apiKey: "asaas_sandbox_live_key_baladaon_98f48e3a2b1c",
      isEnabled: true,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GATEWAY);
    if (!raw) {
      const def: GatewayConfig = {
        provider: "asaas",
        environment: "sandbox",
        apiKey: "asaas_sandbox_live_key_baladaon_98f48e3a2b1c",
        isEnabled: true,
      };
      localStorage.setItem(STORAGE_KEY_GATEWAY, JSON.stringify(def));
      return def;
    }
    return JSON.parse(raw);
  } catch (e) {
    return {
      provider: "asaas",
      environment: "sandbox",
      apiKey: "asaas_sandbox_live_key_baladaon_98f48e3a2b1c",
      isEnabled: true,
    };
  }
}

export function saveGatewayConfig(config: GatewayConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_GATEWAY, JSON.stringify(config));
  } catch (e) {}
}