import { createServerFn } from "@tanstack/react-start";

/**
 * Proxy Server-Side para Evolution API.
 * Executa requisições HTTP a partir do servidor Nitro/Node,
 * eliminando completamente problemas de CORS e restrições de Mixed Content (HTTPS -> HTTP).
 */

interface EvolutionRequestPayload {
  action: "check_state" | "get_qrcode" | "create_instance" | "restart_instance" | "send_text";
  apiUrl: string;
  apiKey: string;
  instanceName: string;
  phone?: string;
  text?: string;
}

function normalizeUrl(url: string): string {
  let clean = (url || "").trim();
  if (!clean) return "";
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = "https://" + clean;
  }
  return clean.replace(/\/+$/, "");
}

export const evolutionProxyServerFn = createServerFn()
  .validator((data: EvolutionRequestPayload) => data)
  .handler(async ({ data }) => {
    const { action, apiUrl, apiKey, instanceName, phone, text } = data;
    const base = normalizeUrl(apiUrl);
    const instance = (instanceName || "radar-role").trim();

    if (!base) {
      return { success: false, error: "URL da Evolution API não informada." };
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      apikey: apiKey || "",
    };

    try {
      if (action === "check_state") {
        const url = `${base}/instance/connectionState/${encodeURIComponent(instance)}`;
        const res = await fetch(url, { method: "GET", headers });
        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          return {
            success: false,
            status: res.status,
            state: res.status === 404 ? "not_found" : "error",
            error: res.status === 404 ? "Instância não encontrada." : `Erro HTTP ${res.status}: ${errText.substring(0, 100)}`,
          };
        }
        const json = await res.json().catch(() => ({}));
        const state =
          json?.instance?.state ||
          json?.state ||
          (json?.connected ? "open" : "close");

        return {
          success: true,
          status: res.status,
          state: state || "close",
          connected: state === "open",
          raw: json,
        };
      }

      if (action === "create_instance") {
        const url = `${base}/instance/create`;
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            instanceName: instance,
            qrcode: true,
            integration: "WHATSAPP-BAILEYS",
          }),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok && res.status !== 403 && res.status !== 409) {
          return {
            success: false,
            status: res.status,
            error: json?.message || `Erro ao criar instância (HTTP ${res.status})`,
          };
        }

        const qrcodeBase64 =
          json?.qrcode?.base64 ||
          json?.base64 ||
          json?.instance?.qrcode;

        return {
          success: true,
          status: res.status,
          qrcodeBase64: qrcodeBase64 || null,
          raw: json,
        };
      }

      if (action === "get_qrcode") {
        const url = `${base}/instance/connect/${encodeURIComponent(instance)}`;
        const res = await fetch(url, { method: "GET", headers });
        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          return {
            success: false,
            status: res.status,
            error: `Falha ao obter QR Code (HTTP ${res.status}): ${errText.substring(0, 100)}`,
          };
        }
        const json = await res.json().catch(() => ({}));
        const qrcodeBase64 =
          json?.base64 ||
          json?.qrcode?.base64 ||
          json?.instance?.qrcode?.base64 ||
          json?.qrcode;

        return {
          success: true,
          status: res.status,
          qrcodeBase64: qrcodeBase64 || null,
          code: json?.code || null,
          pairingCode: json?.pairingCode || null,
          raw: json,
        };
      }

      if (action === "restart_instance") {
        const url = `${base}/instance/restart/${encodeURIComponent(instance)}`;
        const res = await fetch(url, { method: "POST", headers });
        const json = await res.json().catch(() => ({}));
        let qrcodeBase64 =
          json?.base64 ||
          json?.qrcode?.base64 ||
          json?.instance?.qrcode?.base64 ||
          json?.qrcode;

        let code = json?.code || null;

        if (!qrcodeBase64) {
          const connectRes = await fetch(`${base}/instance/connect/${encodeURIComponent(instance)}`, { method: "GET", headers });
          if (connectRes.ok) {
            const connectJson = await connectRes.json().catch(() => ({}));
            qrcodeBase64 = connectJson?.base64 || connectJson?.qrcode?.base64;
            code = connectJson?.code || null;
          }
        }

        return {
          success: !!qrcodeBase64 || res.ok,
          status: res.status,
          qrcodeBase64: qrcodeBase64 || null,
          code: code,
          raw: json,
        };
      }

      if (action === "send_text") {
        if (!phone || !text) {
          return { success: false, error: "Telefone ou mensagem vazios." };
        }

        const url = `${base}/message/sendText/${encodeURIComponent(instance)}`;
        const body = {
          number: phone,
          text: text,
          delay: 1200,
          linkPreview: true,
        };

        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const errorMsg =
            json?.response?.message?.[0] ||
            json?.message ||
            `HTTP ${res.status} ao disparar mensagem.`;
          return { success: false, status: res.status, error: errorMsg, raw: json };
        }

        return { success: true, status: res.status, data: json };
      }

      return { success: false, error: "Ação não suportada." };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Erro de conexão com o servidor Evolution API.",
      };
    }
  });
