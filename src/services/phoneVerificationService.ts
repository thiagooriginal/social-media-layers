import { getWhatsAppConfig, formatWhatsAppPhone } from "./whatsappService";
import { sendEvolutionMessage } from "./evolutionApi";

export interface SendOtpResult {
  success: boolean;
  code: string;
  phoneFormatted: string;
  directWaLink: string;
  error?: string;
}

/**
 * Gera um código OTP aleatório de 6 dígitos numéricos
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Dispara o código de validação para o celular via WhatsApp
 */
export async function sendPhoneVerificationCode(
  rawPhone: string,
  userName: string,
  code: string
): Promise<SendOtpResult> {
  const digits = rawPhone.replace(/\D/g, "");
  const ddiPhone = digits.startsWith("55") ? digits : "55" + digits;
  const firstName = (userName || "").trim().split(" ")[0] || "Baladeiro";

  const messageText = `Olá, ${firstName}! 🪩\n\nSeu código de confirmação no *Radar do Rolê* é:\n👉 *${code}* 👈\n\nDigite este código no aplicativo para ativar sua conta e desbloquear suas listas VIP e descontos exclusivos em São Paulo! 🚀`;

  const directWaLink = `https://api.whatsapp.com/send?phone=${ddiPhone}&text=${encodeURIComponent(
    `Olá, meu código de validação no Radar do Rolê é: ${code}`
  )}`;

  const config = getWhatsAppConfig();

  try {
    const res = await sendEvolutionMessage(
      config.apiUrl || "",
      config.apiKey || "",
      config.instanceName || "radar-role",
      ddiPhone,
      messageText
    );

    if (res.success) {
      return {
        success: true,
        code,
        phoneFormatted: formatWhatsAppPhone(rawPhone),
        directWaLink,
      };
    }

    // Mesmo se a Evolution API retornar erro de conexão, retornamos com o link direto para o usuário nunca ficar travado
    return {
      success: true, // Permitimos que o fluxo avance com fallback
      code,
      phoneFormatted: formatWhatsAppPhone(rawPhone),
      directWaLink,
      error: res.error,
    };
  } catch (err: any) {
    return {
      success: true,
      code,
      phoneFormatted: formatWhatsAppPhone(rawPhone),
      directWaLink,
      error: err?.message,
    };
  }
}
