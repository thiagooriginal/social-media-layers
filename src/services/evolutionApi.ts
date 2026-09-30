import { evolutionProxyServerFn } from "./evolutionServer";

export interface EvolutionConnectionStatus {
  connected: boolean;
  state: "open" | "connecting" | "close" | "not_found" | "unauthorized" | "offline" | "error";
  message: string;
  raw?: any;
}

export interface EvolutionQrCodeResult {
  success: boolean;
  qrcodeBase64?: string | null;
  code?: string | null;
  pairingCode?: string | null;
  error?: string;
}

export interface EvolutionSendResult {
  success: boolean;
  error?: string;
  data?: any;
}

function normalizeUrl(url: string): string {
  let clean = (url || "").trim();
  if (!clean) return "";
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = "https://" + clean;
  }
  return clean.replace(/\/+$/, "");
}

function sanitizeBase64Qr(rawBase64?: string | null): string | null {
  if (!rawBase64) return null;
  let str = rawBase64.trim();
  if (!str.startsWith("data:image")) {
    str = `data:image/png;base64,${str}`;
  }
  return str;
}

/**
 * 1. Verifica o status da conexão da instância da Evolution API
 */
export async function checkEvolutionConnection(
  apiUrl: string,
  apiKey: string,
  instanceName: string = "radar-role"
): Promise<EvolutionConnectionStatus> {
  const cleanUrl = normalizeUrl(apiUrl);
  const instance = (instanceName || "radar-role").trim();

  if (!cleanUrl) {
    return {
      connected: false,
      state: "offline",
      message: "URL da Evolution API não informada.",
    };
  }

  // Tenta via Server Function (elimina CORS / Mixed Content)
  try {
    const res = await evolutionProxyServerFn({
      data: {
        action: "check_state",
        apiUrl: cleanUrl,
        apiKey: apiKey || "",
        instanceName: instance,
      },
    });

    if (res && res.success) {
      const isConnected = res.state === "open";
      return {
        connected: isConnected,
        state: res.state as any,
        message: isConnected
          ? "WhatsApp Conectado e Operante! Mensagens serão disparadas em segundo plano."
          : res.state === "connecting"
          ? "Instância conectando ao WhatsApp..."
          : "Instância offline ou aguardando leitura de QR Code.",
        raw: res.raw,
      };
    }

    if (res && res.state === "not_found") {
      return {
        connected: false,
        state: "not_found",
        message: `Instância '${instance}' ainda não existe no servidor Evolution API. Clique em 'Criar Instância' abaixo.`,
        raw: res,
      };
    }

    if (res && res.error) {
      return {
        connected: false,
        state: "error",
        message: res.error,
        raw: res,
      };
    }
  } catch (err: any) {
    console.warn("Server proxy falhou para check_state, tentando direto:", err);
  }

  // Fallback: Tentativa direta pelo navegador
  try {
    const target = `${cleanUrl}/instance/connectionState/${encodeURIComponent(instance)}`;
    const response = await fetch(target, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey || "",
      },
    });

    if (response.status === 404) {
      return {
        connected: false,
        state: "not_found",
        message: `Instância '${instance}' não encontrada no servidor. Clique em 'Criar Instância'.`,
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        connected: false,
        state: "unauthorized",
        message: "Chave de API (Global API Key) incorreta ou não autorizada.",
      };
    }

    if (!response.ok) {
      return {
        connected: false,
        state: "error",
        message: `Servidor retornou erro HTTP ${response.status}.`,
      };
    }

    const data = await response.json();
    const state =
      data?.instance?.state || data?.state || (data?.connected ? "open" : "close");
    const isConnected = state === "open";

    return {
      connected: isConnected,
      state: state || "close",
      message: isConnected
        ? "WhatsApp Conectado e Operante!"
        : "Instância offline ou aguardando leitura de QR Code.",
      raw: data,
    };
  } catch (err: any) {
    return {
      connected: false,
      state: "offline",
      message:
        "Não foi possível conectar à Evolution API. Verifique a URL e garanta que o serviço está online.",
    };
  }
}

/**
 * 2. Cria a instância na Evolution API caso ainda não exista
 */
export async function createEvolutionInstance(
  apiUrl: string,
  apiKey: string,
  instanceName: string = "radar-role"
): Promise<{ success: boolean; message: string; qrcodeBase64?: string | null }> {
  const cleanUrl = normalizeUrl(apiUrl);
  const instance = (instanceName || "radar-role").trim();

  // Tenta via Server Proxy
  try {
    const res = await evolutionProxyServerFn({
      data: {
        action: "create_instance",
        apiUrl: cleanUrl,
        apiKey: apiKey || "",
        instanceName: instance,
      },
    });

    if (res && res.success) {
      return {
        success: true,
        message: `Instância '${instance}' criada com sucesso!`,
        qrcodeBase64: sanitizeBase64Qr(res.qrcodeBase64),
      };
    }

    if (res && res.error) {
      return {
        success: false,
        message: res.error,
      };
    }
  } catch (err: any) {
    console.warn("Server proxy falhou para create_instance, tentando direto:", err);
  }

  // Fallback: Tentativa direta
  try {
    const response = await fetch(`${cleanUrl}/instance/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey || "",
      },
      body: JSON.stringify({
        instanceName: instance,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok || response.status === 409) {
      const qr = data?.qrcode?.base64 || data?.base64 || data?.instance?.qrcode;
      return {
        success: true,
        message: `Instância '${instance}' pronta para uso!`,
        qrcodeBase64: sanitizeBase64Qr(qr),
      };
    }

    return {
      success: false,
      message: data?.message || `Erro ao criar instância (HTTP ${response.status}).`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Falha de rede ao criar instância.",
    };
  }
}

/**
 * 3. Obtém o QR Code atualizado para pareamento do WhatsApp
 */
export async function getEvolutionQrCode(
  apiUrl: string,
  apiKey: string,
  instanceName: string = "radar-role"
): Promise<EvolutionQrCodeResult> {
  const cleanUrl = normalizeUrl(apiUrl);
  const instance = (instanceName || "radar-role").trim();

  // Tenta via Server Proxy
  try {
    const res = await evolutionProxyServerFn({
      data: {
        action: "get_qrcode",
        apiUrl: cleanUrl,
        apiKey: apiKey || "",
        instanceName: instance,
      },
    });

    if (res && res.success && res.qrcodeBase64) {
      return {
        success: true,
        qrcodeBase64: sanitizeBase64Qr(res.qrcodeBase64),
        code: res.code,
        pairingCode: res.pairingCode,
      };
    }

    if (res && res.error) {
      return {
        success: false,
        error: res.error,
      };
    }
  } catch (err: any) {
    console.warn("Server proxy falhou para get_qrcode, tentando direto:", err);
  }

  // Fallback: Tentativa direta
  try {
    const response = await fetch(`${cleanUrl}/instance/connect/${encodeURIComponent(instance)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey || "",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Servidor retornou erro HTTP ${response.status} ao gerar QR Code.`,
      };
    }

    const data = await response.json();
    const qr =
      data?.base64 ||
      data?.qrcode?.base64 ||
      data?.instance?.qrcode?.base64 ||
      data?.qrcode;

    if (!qr) {
      return {
        success: false,
        error: "Nenhum QR Code retornado. A instância pode já estar conectada ou em reinicialização.",
      };
    }

    return {
      success: true,
      qrcodeBase64: sanitizeBase64Qr(qr),
      code: data?.code,
      pairingCode: data?.pairingCode,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Não foi possível conectar ao servidor para obter o QR Code.",
    };
  }
}

/**
 * 3.1 Reinicia a instância na Evolution API (limpa estado travado e gera novo QR Code)
 */
export async function restartEvolutionInstance(
  apiUrl: string,
  apiKey: string,
  instanceName: string = "radar-role"
): Promise<EvolutionQrCodeResult> {
  const cleanUrl = normalizeUrl(apiUrl);
  const instance = (instanceName || "radar-role").trim();

  try {
    const res = await evolutionProxyServerFn({
      data: {
        action: "restart_instance",
        apiUrl: cleanUrl,
        apiKey: apiKey || "",
        instanceName: instance,
      },
    });

    if (res && res.success) {
      return {
        success: true,
        qrcodeBase64: sanitizeBase64Qr(res.qrcodeBase64),
        code: res.code,
      };
    }
  } catch (err: any) {
    console.warn("Server proxy falhou para restart_instance:", err);
  }

  try {
    const response = await fetch(`${cleanUrl}/instance/restart/${encodeURIComponent(instance)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey || "",
      },
    });
    const data = await response.json().catch(() => ({}));
    const qr = data?.base64 || data?.qrcode?.base64 || data?.instance?.qrcode?.base64;
    return {
      success: response.ok,
      qrcodeBase64: sanitizeBase64Qr(qr),
      code: data?.code,
      error: response.ok ? undefined : data?.message || "Erro ao reiniciar instância.",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Falha ao reiniciar instância.",
    };
  }
}

/**
 * 4. Dispara mensagem de texto em segundo plano diretamente pela Evolution API
 */
export async function sendEvolutionMessage(
  apiUrl: string,
  apiKey: string,
  instanceName: string = "radar-role",
  phone: string,
  message: string
): Promise<EvolutionSendResult> {
  const cleanUrl = normalizeUrl(apiUrl);
  const instance = (instanceName || "radar-role").trim();

  // Tenta via Server Proxy
  try {
    const res = await evolutionProxyServerFn({
      data: {
        action: "send_text",
        apiUrl: cleanUrl,
        apiKey: apiKey || "",
        instanceName: instance,
        phone,
        text: message,
      },
    });

    if (res && res.success) {
      return { success: true, data: res.data };
    }

    if (res && res.error) {
      return { success: false, error: res.error };
    }
  } catch (err: any) {
    console.warn("Server proxy falhou para send_text, tentando direto:", err);
  }

  // Fallback: Tentativa direta pelo navegador
  try {
    const target = `${cleanUrl}/message/sendText/${encodeURIComponent(instance)}`;
    const response = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey || "",
      },
      body: JSON.stringify({
        number: phone,
        text: message,
        delay: 1200,
        linkPreview: true,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      return { success: true, data };
    }

    const errMsg =
      data?.response?.message?.[0] ||
      data?.message ||
      `Falha HTTP ${response.status} ao disparar mensagem.`;

    return { success: false, error: errMsg };
  } catch (err: any) {
    return {
      success: false,
      error:
        err?.message ||
        "Falha de conexão com a Evolution API. Verifique se o servidor está online e a URL está correta.",
    };
  }
}
