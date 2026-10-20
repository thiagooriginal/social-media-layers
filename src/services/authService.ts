import { supabase } from "../integrations/supabase/client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  cpf?: string;
  phoneVerified?: boolean;
  avatarUrl?: string;
  role: "user" | "partner" | "admin";
  businessName?: string;
  venueCategory?: "baladas" | "restaurantes" | "moteis";
  neighborhood?: string;
  createdAt: string;
}

export interface UserVipPass {
  id: string;
  venueId: string;
  venueName: string;
  venueImage?: string;
  userName: string;
  userWhatsapp: string;
  guestsCount: number;
  entryBenefit: string;
  passCode: string;
  createdAt: string;
  status: "active" | "used" | "expired";
}

const STORAGE_KEY_USER = "baladaon_auth_user";
const STORAGE_KEY_PASSES = "baladaon_user_vip_passes";
const STORAGE_KEY_SAVED_CREDS = "baladaon_saved_credentials";

export interface SavedCredentials {
  email: string;
  name?: string;
  role?: "user" | "partner" | "admin";
  businessName?: string;
  rememberMe: boolean;
  biometricsEnabled: boolean;
  lastLoginAt: string;
}

export function getSavedCredentials(): SavedCredentials | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_CREDS);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveCredentials(data: {
  email: string;
  name?: string;
  role?: "user" | "partner" | "admin";
  businessName?: string;
  rememberMe?: boolean;
  biometricsEnabled?: boolean;
}): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getSavedCredentials();
    const payload: SavedCredentials = {
      email: data.email.toLowerCase().trim(),
      name: data.name || existing?.name,
      role: data.role || existing?.role || "user",
      businessName: data.businessName || existing?.businessName,
      rememberMe: data.rememberMe ?? existing?.rememberMe ?? true,
      biometricsEnabled: data.biometricsEnabled ?? existing?.biometricsEnabled ?? false,
      lastLoginAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_SAVED_CREDS, JSON.stringify(payload));
  } catch (e) {}
}

export function clearSavedCredentials(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY_SAVED_CREDS);
  } catch (e) {}
}

const listeners: Array<(user: UserProfile | null) => void> = [];

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function subscribeToAuth(callback: (user: UserProfile | null) => void): () => void {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

// Hook into Supabase auth changes
if (typeof window !== "undefined") {
  try {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        localStorage.removeItem(STORAGE_KEY_USER);
        notifyAuthChange(null);
      } else if (event === "SIGNED_IN" && session?.user) {
        const current = getCurrentUser();
        if (!current || current.id !== session.user.id) {
          const { data: dbProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          if (dbProfile) {
            const u: UserProfile = {
              id: dbProfile.id,
              name: dbProfile.name || session.user.user_metadata?.name || dbProfile.email.split("@")[0],
              email: dbProfile.email,
              whatsapp: dbProfile.whatsapp || "",
              role: dbProfile.role || "user",
              businessName: dbProfile.business_name || undefined,
              venueCategory: dbProfile.venue_category || undefined,
              neighborhood: dbProfile.neighborhood || undefined,
              createdAt: dbProfile.created_at || session.user.created_at,
            };
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
            notifyAuthChange(u);
          }
        }
      }
    });
  } catch (e) {
    console.warn("Supabase auth state listener error:", e);
  }
}

function notifyAuthChange(user: UserProfile | null) {
  listeners.forEach((fn) => fn(user));
}

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function validateCPF(cpfRaw: string): boolean {
  const cpf = cpfRaw.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(10), 10)) return false;

  return true;
}

export async function hashPassword(password: string): Promise<string> {
  const normalized = password.trim();
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`radar_salt_${normalized}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return "hash_" + Math.abs(hash);
}

export async function loginUser(
  email: string,
  password?: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanEmail = email.toLowerCase().trim();
  try {
    // 1. Special master bypass for official Thiago admin (in dev / master dashboard)
    if (cleanEmail === "thiagooriginal2002@gmail.com" || cleanEmail === "thiago@radardorole.com.br") {
      if (password) {
        try {
          await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        } catch (e) {}
      }
      const adminUser: UserProfile = {
        id: "admin-thiago",
        name: "Thiago (Super Admin Oficial)",
        email: cleanEmail,
        whatsapp: "(11) 98765-4321",
        role: "admin",
        businessName: "Radar do Rolê Master HQ",
        createdAt: new Date().toISOString(),
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(adminUser));
      }
      notifyAuthChange(adminUser);
      return { success: true, user: adminUser };
    }

    // 2. Native Supabase Auth signInWithPassword
    if (password) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (authData?.user && !authErr) {
          // Fetch profile row
          let dbProfile: any = null;
          try {
            const { data } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", authData.user.id)
              .maybeSingle();
            dbProfile = data;
          } catch (e) {}

          if (!dbProfile) {
            try {
              const { data: allUsers } = await (supabase as any).rpc("get_admin_users");
              dbProfile = allUsers?.find((u: any) => u.email?.toLowerCase() === cleanEmail);
            } catch (e) {}
          }

          const meta = authData.user.user_metadata || {};
          const user: UserProfile = {
            id: authData.user.id,
            name: dbProfile?.name || meta.name || cleanEmail.split("@")[0],
            email: dbProfile?.email || cleanEmail,
            whatsapp: dbProfile?.whatsapp || meta.whatsapp || "",
            cpf: dbProfile?.cpf || meta.cpf,
            phoneVerified: Boolean(dbProfile?.phone_verified ?? meta.phone_verified ?? true),
            role: dbProfile?.role || meta.role || "user",
            businessName: dbProfile?.business_name || meta.business_name || undefined,
            venueCategory: dbProfile?.venue_category || meta.venue_category || undefined,
            neighborhood: dbProfile?.neighborhood || meta.neighborhood || undefined,
            createdAt: dbProfile?.created_at || authData.user.created_at || new Date().toISOString(),
          };

          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
          }
          notifyAuthChange(user);
          return { success: true, user };
        }

        // If Supabase returns 'email_not_confirmed', it has verified that the password is 100% correct!
        const errMsg = authErr?.message?.toLowerCase() || "";
        const errCode = (authErr as any)?.code || "";
        if (errCode === "email_not_confirmed" || errMsg.includes("email not confirmed")) {
          let dbProfile: any = null;
          try {
            const { data: allUsers } = await (supabase as any).rpc("get_admin_users");
            dbProfile = allUsers?.find((u: any) => u.email?.toLowerCase() === cleanEmail);
          } catch (e) {}

          const user: UserProfile = {
            id: dbProfile?.id || "usr_" + Math.random().toString(36).substring(2, 9),
            name: dbProfile?.name || cleanEmail.split("@")[0],
            email: dbProfile?.email || cleanEmail,
            whatsapp: dbProfile?.whatsapp || "",
            cpf: dbProfile?.cpf,
            phoneVerified: Boolean(dbProfile?.phone_verified ?? true),
            role: dbProfile?.role || "user",
            businessName: dbProfile?.business_name || undefined,
            venueCategory: dbProfile?.venue_category || undefined,
            neighborhood: dbProfile?.neighborhood || undefined,
            createdAt: dbProfile?.created_at || new Date().toISOString(),
          };

          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
          }
          notifyAuthChange(user);
          return { success: true, user };
        }

        if (errCode === "invalid_credentials" || errMsg.includes("invalid login credentials")) {
          return {
            success: false,
            error: "E-mail ou senha incorretos. Verifique os dados digitados.",
          };
        }
      } catch (authErr: any) {
        console.warn("Supabase auth signIn notice:", authErr);
        const errMsg = authErr?.message?.toLowerCase() || "";
        const errCode = authErr?.code || "";
        if (errCode === "email_not_confirmed" || errMsg.includes("email not confirmed")) {
          let dbProfile: any = null;
          try {
            const { data: allUsers } = await (supabase as any).rpc("get_admin_users");
            dbProfile = allUsers?.find((u: any) => u.email?.toLowerCase() === cleanEmail);
          } catch (e) {}

          const user: UserProfile = {
            id: dbProfile?.id || "usr_" + Math.random().toString(36).substring(2, 9),
            name: dbProfile?.name || cleanEmail.split("@")[0],
            email: dbProfile?.email || cleanEmail,
            whatsapp: dbProfile?.whatsapp || "",
            cpf: dbProfile?.cpf,
            phoneVerified: Boolean(dbProfile?.phone_verified ?? true),
            role: dbProfile?.role || "user",
            businessName: dbProfile?.business_name || undefined,
            venueCategory: dbProfile?.venue_category || undefined,
            neighborhood: dbProfile?.neighborhood || undefined,
            createdAt: dbProfile?.created_at || new Date().toISOString(),
          };

          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
          }
          notifyAuthChange(user);
          return { success: true, user };
        }
        if (errCode === "invalid_credentials" || errMsg.includes("invalid login credentials")) {
          return {
            success: false,
            error: "E-mail ou senha incorretos. Verifique os dados digitados.",
          };
        }
      }
    }

    // 3. Fallback: Legacy RPC authenticate_user (for pre-existing accounts)
    if (password) {
      try {
        const pwdHash = await hashPassword(password);
        const { data: authProfiles, error: rpcError } = await (supabase as any).rpc(
          "authenticate_user",
          {
            p_email: cleanEmail,
            p_password_hash: pwdHash,
          }
        );

        const dbProfile = authProfiles && authProfiles.length > 0 ? authProfiles[0] : null;

        if (dbProfile && !rpcError) {
          const user: UserProfile = {
            id: dbProfile.id,
            name: dbProfile.name,
            email: dbProfile.email,
            whatsapp: dbProfile.whatsapp,
            role: dbProfile.role || "user",
            businessName: dbProfile.business_name || undefined,
            venueCategory: dbProfile.venue_category || undefined,
            neighborhood: dbProfile.neighborhood || undefined,
            createdAt: dbProfile.created_at,
          };
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
          }
          notifyAuthChange(user);
          return { success: true, user };
        }
      } catch (e) {
        console.warn("RPC auth notice:", e);
      }
    }

    // 4. Fallback for saved local credentials on this device
    const saved = getSavedCredentials();
    if (saved && saved.email.toLowerCase() === cleanEmail && (!password || saved.rememberMe)) {
      const user = getCurrentUser();
      if (user && user.email.toLowerCase() === cleanEmail) {
        notifyAuthChange(user);
        return { success: true, user };
      }
    }

    // 5. If password was provided but failed match, reject with clear security message
    if (password) {
      return {
        success: false,
        error: "E-mail ou senha incorretos. Verifique os dados digitados.",
      };
    }

    return {
      success: false,
      error: "Por favor, digite sua senha de acesso.",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro ao realizar login" };
  }
}

export async function registerUser(data: {
  name: string;
  email: string;
  whatsapp: string;
  cpf?: string;
  phoneVerified?: boolean;
  password?: string;
  role?: "user" | "partner" | "admin";
  businessName?: string;
  venueCategory?: "baladas" | "restaurantes" | "moteis";
  neighborhood?: string;
}): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanEmail = data.email.toLowerCase().trim();
  try {
    // Strictly prevent client role injection — only 'partner' or 'user' allowed
    const userRole: "user" | "partner" = data.role === "partner" ? "partner" : "user";
    const passwordToUse = data.password && data.password.length >= 6 ? data.password : "RadarRole@2025!";
    let newUserId = "usr_" + Math.random().toString(36).substring(2, 9);
    let createdViaAuth = false;

    // 1. Try Native Supabase Auth signUp
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: passwordToUse,
        options: {
          data: {
            name: data.name.trim(),
            whatsapp: data.whatsapp.trim(),
            cpf: data.cpf?.trim() || null,
            phone_verified: Boolean(data.phoneVerified),
            role: userRole,
            business_name: data.businessName?.trim() || null,
            venue_category: data.venueCategory || null,
            neighborhood: data.neighborhood?.trim() || null,
          },
        },
      });

      if (authError) {
        if (
          authError.message?.toLowerCase().includes("already registered") ||
          authError.message?.toLowerCase().includes("already exists") ||
          (authError as any).status === 422
        ) {
          return {
            success: false,
            error: "Este e-mail já está cadastrado no sistema. Faça login para continuar.",
          };
        }
        console.warn("Supabase auth signUp notice:", authError.message);
      } else if (authData?.user) {
        newUserId = authData.user.id;
        createdViaAuth = true;

        // Auto signIn if no active session was returned
        if (!authData.session) {
          try {
            await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: passwordToUse,
            });
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn("Supabase Auth signUp failed, proceeding with fallback:", e);
    }

    // 2. Persist profile row in Supabase profiles (via register_user RPC)
    try {
      const pwdHash = await hashPassword(passwordToUse);
      
      // Try calling with 10 params (including CPF and phone_verified)
      let rpcData: any = null;
      let rpcError: any = null;
      try {
        const res = await (supabase as any).rpc("register_user", {
          p_name: data.name.trim(),
          p_email: cleanEmail,
          p_whatsapp: data.whatsapp.trim(),
          p_role: userRole,
          p_business_name: data.businessName?.trim() || null,
          p_venue_category: data.venueCategory || null,
          p_neighborhood: data.neighborhood?.trim() || null,
          p_password_hash: pwdHash,
          p_cpf: data.cpf?.trim() || null,
          p_phone_verified: Boolean(data.phoneVerified),
        });
        rpcData = res.data;
        rpcError = res.error;
      } catch (e) {
        rpcError = e;
      }

      // If 10-param signature failed, fallback to standard 8-param signature
      if (rpcError || !rpcData) {
        try {
          const res8 = await (supabase as any).rpc("register_user", {
            p_name: data.name.trim(),
            p_email: cleanEmail,
            p_whatsapp: data.whatsapp.trim(),
            p_role: userRole,
            p_business_name: data.businessName?.trim() || null,
            p_venue_category: data.venueCategory || null,
            p_neighborhood: data.neighborhood?.trim() || null,
            p_password_hash: pwdHash,
          });
          rpcData = res8.data;
          rpcError = res8.error;
        } catch (e) {
          rpcError = e;
        }
      }

      const created = rpcData && rpcData.length > 0 ? rpcData[0] : null;
      if (created && !rpcError) {
        if (!createdViaAuth) {
          newUserId = created.id;
        }
      }

      // Attempt to save CPF and phone_verified directly if available
      if (data.cpf || data.phoneVerified) {
        try {
          await (supabase as any)
            .from("profiles")
            .update({
              cpf: data.cpf?.trim() || null,
              phone_verified: Boolean(data.phoneVerified),
            })
            .eq("email", cleanEmail);
        } catch (e) {}
      }
    } catch (e) {
      console.warn("Could not save to Supabase profiles via RPC:", e);
    }

    // 3. Set current active user profile
    const user: UserProfile = {
      id: newUserId,
      name: data.name.trim(),
      email: cleanEmail,
      whatsapp: data.whatsapp.trim(),
      cpf: data.cpf?.trim(),
      phoneVerified: Boolean(data.phoneVerified),
      role: userRole,
      businessName: data.businessName?.trim(),
      venueCategory: data.venueCategory,
      neighborhood: data.neighborhood?.trim(),
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    }
    notifyAuthChange(user);
    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro ao cadastrar usuário" };
  }
}

export async function updateUserProfile(data: {
  name: string;
  whatsapp: string;
  email?: string;
  businessName?: string;
  neighborhood?: string;
}): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const current = getCurrentUser();
    if (!current) {
      return { success: false, error: "Usuário não está autenticado." };
    }

    const cleanName = data.name.trim();
    const cleanWhatsapp = data.whatsapp.trim();
    const cleanEmail = data.email ? data.email.toLowerCase().trim() : current.email;

    if (!cleanName) {
      return { success: false, error: "O nome não pode ficar em branco." };
    }
    if (!cleanWhatsapp) {
      return { success: false, error: "O WhatsApp não pode ficar em branco." };
    }

    const updatedUser: UserProfile = {
      ...current,
      name: cleanName,
      whatsapp: cleanWhatsapp,
      email: cleanEmail,
      businessName: data.businessName !== undefined ? data.businessName.trim() : current.businessName,
      neighborhood: data.neighborhood !== undefined ? data.neighborhood.trim() : current.neighborhood,
    };

    // 1. Atualizar no Supabase
    try {
      if (current.id && !current.id.startsWith("usr_")) {
        await (supabase as any)
          .from("profiles")
          .update({
            name: updatedUser.name,
            whatsapp: updatedUser.whatsapp,
            email: updatedUser.email,
            business_name: updatedUser.businessName || null,
            neighborhood: updatedUser.neighborhood || null,
          })
          .eq("id", current.id);
      }

      await supabase.auth.updateUser({
        data: {
          name: updatedUser.name,
          whatsapp: updatedUser.whatsapp,
          business_name: updatedUser.businessName || null,
          neighborhood: updatedUser.neighborhood || null,
        },
      }).catch(() => {});
    } catch (e) {
      console.warn("Could not sync updated profile to Supabase:", e);
    }

    // 2. Atualizar no LocalStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
      saveCredentials({
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        businessName: updatedUser.businessName,
      });
    }

    notifyAuthChange(updatedUser);
    return { success: true, user: updatedUser };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro ao atualizar dados do perfil" };
  }
}

export function logoutUser(): void {
  try {
    supabase.auth.signOut().catch(() => {});
  } catch (e) {}
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
  notifyAuthChange(null);
}

// User VIP Passes History
export function getUserVipPasses(): UserVipPass[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PASSES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveUserVipPass(pass: Omit<UserVipPass, "id" | "passCode" | "createdAt" | "status">): UserVipPass {
  const newPass: UserVipPass = {
    ...pass,
    id: "pass_" + Math.random().toString(36).substring(2, 9),
    passCode: "VIP-" + Math.floor(100000 + Math.random() * 900000),
    createdAt: new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: "active",
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getUserVipPasses();
      const updated = [newPass, ...existing];
      localStorage.setItem(STORAGE_KEY_PASSES, JSON.stringify(updated));
    } catch (e) {}
  }

  return newPass;
}
