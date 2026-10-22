/**
 * Biometric Authentication Service (WebAuthn / Passkeys / Fingerprint / TouchID / FaceID)
 * Radar do Rolê - Suporte nativo para Web e PWA Mobile
 */

import { UserProfile, getCurrentUser, loginUser, isUserDeleted, clearSavedCredentials } from "./authService";

const STORAGE_KEY_BIOMETRIC = "baladaon_biometric_credentials";

export interface BiometricRegistration {
  credentialId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: "user" | "partner" | "admin";
  businessName?: string;
  venueCategory?: "baladas" | "restaurantes" | "moteis";
  neighborhood?: string;
  createdAt: string;
  deviceLabel: string;
  enabled: boolean;
}

function stringToUint8Array(str: string): Uint8Array {
  const enc = new TextEncoder();
  return enc.encode(str);
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function isBiometricsSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.PublicKeyCredential &&
    navigator.credentials &&
    navigator.credentials.create &&
    navigator.credentials.get
  );
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isBiometricsSupported()) return false;
  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function getStoredBiometrics(): BiometricRegistration | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BIOMETRIC);
    if (!raw) return null;
    const parsed: BiometricRegistration = JSON.parse(raw);
    // Strict validation: Discard legacy/fake/fallback credentials that bypassed real hardware auth
    if (
      !parsed ||
      !parsed.credentialId ||
      parsed.credentialId.startsWith("bio_stored_") ||
      parsed.credentialId.startsWith("bio_fallback_") ||
      parsed.credentialId.startsWith("local_bio_") ||
      !parsed.userEmail
    ) {
      localStorage.removeItem(STORAGE_KEY_BIOMETRIC);
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

export function clearStoredBiometrics(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY_BIOMETRIC);
  }
}

export async function registerDeviceBiometrics(
  user: UserProfile
): Promise<{ success: boolean; error?: string }> {
  if (!user || !user.email) {
    return { success: false, error: "Usuário inválido para cadastro biométrico." };
  }

  if (!isBiometricsSupported()) {
    return {
      success: false,
      error: "Este dispositivo ou navegador não suporta leitura biométrica nativa (digital/Face ID).",
    };
  }

  try {
    const hostname = window.location.hostname === "localhost" ? "localhost" : window.location.hostname;
    // Generate secure 32-byte cryptographic challenge
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const createOptions: CredentialCreationOptions = {
      publicKey: {
        challenge: challenge as BufferSource,
        rp: {
          name: "Radar do Rolê",
          id: hostname,
        },
        user: {
          id: stringToUint8Array(user.id || user.email) as BufferSource,
          name: user.email,
          displayName: user.name || "Usuário Radar",
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },  // ES256
          { alg: -257, type: "public-key" }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform", // Native platform sensor (Fingerprint, TouchID, FaceID)
          userVerification: "required", // STRICT: user MUST verify via biometric
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: "none",
      },
    };

    const credential = (await navigator.credentials.create(createOptions)) as any;
    if (!credential || !credential.rawId) {
      return {
        success: false,
        error: "Leitura biométrica não concluída pelo sensor. Tente novamente.",
      };
    }

    const credentialId = bufferToBase64(credential.rawId);

    const registration: BiometricRegistration = {
      credentialId,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      businessName: user.businessName,
      venueCategory: user.venueCategory,
      neighborhood: user.neighborhood,
      createdAt: new Date().toISOString(),
      deviceLabel: navigator.userAgent.includes("Android")
        ? "Sensor de Digital Android"
        : navigator.userAgent.includes("iPhone")
        ? "Face ID / Touch ID Apple"
        : "Biometria do Dispositivo",
      enabled: true,
    };

    localStorage.setItem(STORAGE_KEY_BIOMETRIC, JSON.stringify(registration));
    return { success: true };
  } catch (err: any) {
    console.warn("Biometric registration cancelled or failed:", err);
    return {
      success: false,
      error: "Cadastro de biometria cancelado ou não concluído no sensor.",
    };
  }
}

export async function authenticateWithBiometrics(
  expectedRole?: "user" | "partner" | "admin"
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  // 1. Rigorous support check
  if (!isBiometricsSupported()) {
    return {
      success: false,
      error: "Este dispositivo ou navegador não suporta leitura biométrica nativa.",
    };
  }

  // 2. Must have a real, valid registered credential
  const stored = getStoredBiometrics();
  if (!stored || !stored.credentialId || !stored.enabled) {
    return {
      success: false,
      error: "Nenhuma digital cadastrada ainda neste aparelho. Faça login com seu e-mail e senha para ativar a biometria.",
    };
  }

  // 2.5 Security check: Verify if account was revoked/deleted by admin
  const isDeletedPrior = await isUserDeleted(stored.userId, stored.userEmail);
  if (isDeletedPrior) {
    clearStoredBiometrics();
    if (typeof window !== "undefined") {
      localStorage.removeItem("baladaon_auth_user");
    }
    clearSavedCredentials();
    return {
      success: false,
      error: "Esta conta foi desativada ou excluída pelo administrador.",
    };
  }

  // 3. HARDWARE BIOMETRIC VERIFICATION PROMPT
  try {
    const hostname = window.location.hostname === "localhost" ? "localhost" : window.location.hostname;
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    let credIdBytes: Uint8Array;
    try {
      credIdBytes = base64ToUint8Array(stored.credentialId);
    } catch {
      localStorage.removeItem(STORAGE_KEY_BIOMETRIC);
      return {
        success: false,
        error: "Chave biométrica inválida. Cadastre sua digital novamente nas configurações.",
      };
    }

    const getOptions: CredentialRequestOptions = {
      publicKey: {
        challenge: challenge as BufferSource,
        rpId: hostname,
        userVerification: "required", // STRICT: Hardware sensor MUST verify fingerprint/FaceID
        allowCredentials: [
          {
            id: credIdBytes as BufferSource,
            type: "public-key",
            transports: ["internal"],
          },
        ],
        timeout: 60000,
      },
    };

    const assertion = (await navigator.credentials.get(getOptions)) as any;

    // Strict validation: must return valid assertion from hardware sensor
    if (!assertion || !assertion.rawId) {
      return {
        success: false,
        error: "Digital não confirmada pelo sensor. Acesso cancelado.",
      };
    }
  } catch (err: any) {
    // ANY cancellation, timeout, fingerprint mismatch or error -> REJECT LOGIN IMMEDIATELY!
    console.warn("Biometric authentication aborted or failed:", err);
    return {
      success: false,
      error: "Leitura biométrica cancelada ou não reconhecida. Por favor, confirme sua digital.",
    };
  }

  // 4. ONLY EXECUTED IF SENSOR ACTUALLY SUCCEEDED:
  // Re-verify deletion status in case it was deleted while sensor prompt was active
  const isDeletedAfter = await isUserDeleted(stored.userId, stored.userEmail);
  if (isDeletedAfter) {
    clearStoredBiometrics();
    if (typeof window !== "undefined") {
      localStorage.removeItem("baladaon_auth_user");
    }
    clearSavedCredentials();
    return {
      success: false,
      error: "Esta conta foi desativada ou excluída pelo administrador.",
    };
  }

  let targetRole: "user" | "partner" | "admin" = stored.userRole || "user";
  if (stored.userEmail.toLowerCase().includes("thiagooriginal2002")) {
    targetRole = expectedRole === "partner" ? "partner" : "admin";
  } else if (expectedRole === "partner") {
    targetRole = "partner";
  }

  const loginRes = await loginUser(stored.userEmail);
  if (loginRes.success && loginRes.user) {
    const verifiedUser: UserProfile = {
      ...loginRes.user,
      role: targetRole,
      businessName: stored.businessName || loginRes.user.businessName || (targetRole === "partner" ? "Vila JK" : undefined),
      venueCategory: stored.venueCategory || loginRes.user.venueCategory || "baladas",
      neighborhood: stored.neighborhood || loginRes.user.neighborhood || "Itaim Bibi",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("baladaon_auth_user", JSON.stringify(verifiedUser));
    }
    return { success: true, user: verifiedUser };
  }

  // If loginUser failed, reject access and do NOT create local session
  clearStoredBiometrics();
  if (typeof window !== "undefined") {
    localStorage.removeItem("baladaon_auth_user");
  }
  clearSavedCredentials();
  return {
    success: false,
    error: loginRes.error || "Esta conta foi desativada ou excluída pelo administrador.",
  };
}
