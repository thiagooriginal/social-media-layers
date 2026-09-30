/**
 * Serviço de Integração, Notificações e Automações via WhatsApp
 * Suporta modo Direto (links nativos wa.me / api.whatsapp.com) e
 * conexão com APIs externas (Evolution API, Z-API, Baileys ou Webhook HTTP).
 */

import { sendEvolutionMessage } from "./evolutionApi";

export interface WhatsAppConfig {
  mode: "direct" | "api";
  provider: "evolution" | "z-api" | "custom_webhook" | "direct";
  apiUrl?: string;
  apiKey?: string;
  instanceName?: string;
  autoNotifyPortaria: boolean;
  autoNotifyClient: boolean;
  autoNotifyBilling: boolean;
}

export interface WhatsAppNotificationLog {
  id: string;
  recipientType: "client" | "venue_portaria" | "partner_billing" | "admin_alert";
  recipientPhone: string;
  recipientName: string;
  venueName?: string;
  messagePreview: string;
  status: "sent" | "opened_url" | "failed";
  timestamp: string;
}

const DEFAULT_CONFIG: WhatsAppConfig = {
  mode: "api",
  provider: "evolution",
  apiUrl: "https://evolution-api-production-fd72.up.railway.app",
  apiKey: "c4b6e6af8a12071774a4b267b5844f3b20308bbe472f873040e6ce7a40bace65",
  instanceName: "radar-role",
  autoNotifyPortaria: true,
  autoNotifyClient: true,
  autoNotifyBilling: true,
};

const STORAGE_KEY_CONFIG = "radar_whatsapp_config";
const STORAGE_KEY_LOGS = "radar_whatsapp_logs";

export function getWhatsAppConfig(): WhatsAppConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      apiUrl: parsed.apiUrl || DEFAULT_CONFIG.apiUrl,
      apiKey: parsed.apiKey || DEFAULT_CONFIG.apiKey,
      instanceName: parsed.instanceName || DEFAULT_CONFIG.instanceName,
    };
  } catch (e) {
    return DEFAULT_CONFIG;
  }
}

export function saveWhatsAppConfig(config: WhatsAppConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
}

export function getWhatsAppNotificationLogs(): WhatsAppNotificationLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function addWhatsAppNotificationLog(
  log: Omit<WhatsAppNotificationLog, "id" | "timestamp">
): void {
  if (typeof window === "undefined") return;
  try {
    const logs = getWhatsAppNotificationLogs();
    const newLog: WhatsAppNotificationLog = {
      ...log,
      id: "walog_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toLocaleString("pt-BR"),
    };
    const updated = [newLog, ...logs].slice(0, 50); // Keep last 50 logs
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  } catch (e) {}
}

/**
 * Normaliza e limpa o número de telefone brasileiro para o padrão internacional (DDI 55)
 */
export function formatWhatsAppPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  // Se começou com 0, remove
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }
  // Se não tem DDI 55 (ex: 11999998888 -> 11 dígitos), adiciona 55
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = "55" + cleaned;
  }
  return cleaned;
}

/**
 * Gera URL direta e segura do WhatsApp
 */
export function buildWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = formatWhatsAppPhone(phone);
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

/**
 * Abre o WhatsApp nativo / Web com a mensagem preenchida
 */
export function openWhatsAppDirect(phone: string, text: string): void {
  if (typeof window === "undefined") return;
  const cleanPhone = formatWhatsAppPhone(phone);
  if (!cleanPhone || cleanPhone.length < 10) {
    alert("Por favor, digite um número de WhatsApp válido com DDD.");
    return;
  }

  const url = buildWhatsAppUrl(phone, text);

  // Em navegadores mobile (Android Chrome / iOS Safari), window.location.href
  // aciona o aplicativo nativo do WhatsApp instantaneamente sem ser bloqueado pelo popup blocker!
  const isMobile = typeof navigator !== "undefined" && /android|iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = url;
    return;
  }

  // No desktop, abre em nova aba através de clique simulado
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    try {
      document.body.removeChild(link);
    } catch (e) {}
  }, 100);
}

/* ========================================================================= */
/* TEMPLATES DE MENSAGENS OFICIAIS DO RADAR DO ROLÊ                         */
/* ========================================================================= */

/**
 * 1. Mensagem de Comprovante VIP para o Próprio Cliente
 */
export function buildClientVipPassMessage(params: {
  userName: string;
  venueName: string;
  passCode: string;
  guestsCount: number;
  entryBenefit: string;
  eventDate?: string;
  openHours?: string;
}): string {
  return (
    `🎟️ *SEU PASSE VIP OFICIAL • RADAR DO ROLÊ* 🚀\n\n` +
    `Olá, *${params.userName}*! Tudo pronto para a sua noite.\n\n` +
    `🏢 *Local:* ${params.venueName}\n` +
    `🔑 *Código do Passe VIP:* ${params.passCode}\n` +
    `👥 *Acompanhantes:* ${params.guestsCount} ${params.guestsCount === 1 ? "pessoa" : "pessoas"}\n` +
    `✨ *Benefício:* ${params.entryBenefit}\n` +
    (params.openHours ? `⏰ *Horário sugerido:* ${params.openHours}\n\n` : `\n`) +
    `📲 *Apresente este voucher na portaria da casa.*\n` +
    `Seja pontual para garantir as vantagens da lista VIP!\n\n` +
    `Tenha um excelente rolê! 🔥\n` +
    `_Radar do Rolê SP • O mapa das noites paulistanas_`
  );
}

/**
 * 2. Alerta Instantâneo para a Portaria / Balada Parceira (Enxuto e direto)
 */
export function buildVenueNewLeadAlertMessage(params: {
  userName: string;
  userWhatsapp: string;
  venueName: string;
  passCode: string;
  guestsCount: number;
  entryBenefit?: string;
}): string {
  return (
    `🔔 *NOVO VIP CONFIRMADO* • *${params.venueName.toUpperCase()}*\n\n` +
    `👤 *Cliente:* ${params.userName}\n` +
    `👥 *Total:* ${params.guestsCount} ${params.guestsCount === 1 ? "pessoa" : "pessoas"}\n` +
    `🎟️ *Código:* ${params.passCode}\n` +
    (params.entryBenefit ? `✨ *Entrada:* ${params.entryBenefit}\n` : "") +
    `📱 *WhatsApp:* ${params.userWhatsapp}`
  );
}

/**
 * 3. Confirmação de Entrada Realizada na Portaria
 */
export function buildPortariaCheckInMessage(params: {
  userName: string;
  venueName: string;
  passCode: string;
}): string {
  return (
    `✅ *ENTRADA VIP CONFIRMADA!* 🎉\n\n` +
    `Olá, *${params.userName}*!\n` +
    `Sua entrada no *${params.venueName}* (Passe *${params.passCode}*) foi confirmada com sucesso pela portaria.\n\n` +
    `Aproveite muito a noite e volte sempre pelo Radar do Rolê! 🍸🔥`
  );
}

/**
 * 4. Lembrete Pré-Rolê enviado pela Casa aos Clientes da Lista
 */
export function buildBulkReminderMessage(params: {
  venueName: string;
  clientName?: string;
  specialNotice?: string;
}): string {
  return (
    `🔥 *HOJE TEM ROLÊ NO ${params.venueName.toUpperCase()}!* 🎧\n\n` +
    `Passando para lembrar que o seu nome está confirmado na nossa Lista VIP de hoje pelo Radar do Rolê!\n\n` +
    (params.specialNotice
      ? `📢 *Aviso da Casa:* ${params.specialNotice}\n\n`
      : `⏰ *Dica:* Chegue cedo para garantir a entrada VIP com fila rápida!\n\n`) +
    `Te esperamos na pista! 🚀`
  );
}

/**
 * 5. Lembrete de Cobrança / Renovação SaaS do Parceiro
 */
export function buildSaasBillingMessage(params: {
  ownerName: string;
  venueName: string;
  planName: string;
  amount: number;
  periodText: string;
  dueDate: string;
  pixKey?: string;
}): string {
  const pix = params.pixKey || "thiagooriginal2002@gmail.com";
  return (
    `🏢 *RADAR DO ROLÊ • GESTÃO DE ASSINATURA SAAS*\n\n` +
    `Olá, *${params.ownerName}*! Tudo bem?\n\n` +
    `Segue o resumo da assinatura do seu estabelecimento *${params.venueName}*:\n` +
    `• *Plano:* ${params.planName}\n` +
    `• *Valor:* R$ ${params.amount},00 ${params.periodText}\n` +
    `• *Vencimento/Renovação:* ${params.dueDate}\n\n` +
    `🔑 *Chave Pix para Pagamento/Renovação Imediata:*\n` +
    `\`${pix}\`\n\n` +
    `Após a transferência, envie o comprovante por aqui para mantermos seus destaques e lista VIP 100% ativos!\n` +
    `Obrigado pela parceria!`
  );
}

/* ========================================================================= */
/* MOTOR DE DISPARO DE NOTIFICAÇÃO (HÍBRIDO: API OU WA.ME)                   */
/* ========================================================================= */

export interface DispatchNotificationOptions {
  recipientType: "client" | "venue_portaria" | "partner_billing" | "admin_alert";
  recipientPhone: string;
  recipientName: string;
  venueName?: string;
  message: string;
  fallbackDirect?: boolean;
}

export async function dispatchWhatsAppNotification(
  opts: DispatchNotificationOptions
): Promise<{ success: boolean; mode: "api" | "direct"; error?: string }> {
  const config = getWhatsAppConfig();

  // 1. MODO API EXTERNA (Evolution API / Disparo Silencioso em 2º Plano)
  if (config.mode === "api") {
    if (!config.apiUrl || !config.apiUrl.trim()) {
      const errMsg = "URL da Evolution API não está configurada no Painel Admin. Informe o endpoint da sua Evolution API para envio 100% automático.";
      addWhatsAppNotificationLog({
        recipientType: opts.recipientType,
        recipientPhone: opts.recipientPhone,
        recipientName: opts.recipientName,
        venueName: opts.venueName,
        messagePreview: opts.message.substring(0, 80) + "...",
        status: "failed",
      });
      return { success: false, mode: "api", error: errMsg };
    }

    const cleanPhone = formatWhatsAppPhone(opts.recipientPhone);
    const instance = config.instanceName?.trim() || "radar-role";

    const res = await sendEvolutionMessage(
      config.apiUrl,
      config.apiKey || "",
      instance,
      cleanPhone,
      opts.message
    );

    if (res.success) {
      addWhatsAppNotificationLog({
        recipientType: opts.recipientType,
        recipientPhone: opts.recipientPhone,
        recipientName: opts.recipientName,
        venueName: opts.venueName,
        messagePreview: opts.message.substring(0, 80) + "...",
        status: "sent",
      });
      return { success: true, mode: "api" };
    }

    // Se falhou no envio via API, NÃO abre o whatsapp pessoal quando o modo for API!
    const failError = res.error || "Servidor Evolution API não conseguiu disparar a mensagem.";
    addWhatsAppNotificationLog({
      recipientType: opts.recipientType,
      recipientPhone: opts.recipientPhone,
      recipientName: opts.recipientName,
      venueName: opts.venueName,
      messagePreview: opts.message.substring(0, 80) + "...",
      status: "failed",
    });

    return {
      success: false,
      mode: "api",
      error: failError,
    };
  }

  // 2. MODO DIRETO (Apenas se o usuário configurou explicitamente para abrir no wa.me)
  if (opts.fallbackDirect !== false) {
    openWhatsAppDirect(opts.recipientPhone, opts.message);
    addWhatsAppNotificationLog({
      recipientType: opts.recipientType,
      recipientPhone: opts.recipientPhone,
      recipientName: opts.recipientName,
      venueName: opts.venueName,
      messagePreview: opts.message.substring(0, 80) + "...",
      status: "opened_url",
    });
    return { success: true, mode: "direct" };
  }

  return { success: false, mode: "direct", error: "Modo direto desativado e API não configurada." };
}
