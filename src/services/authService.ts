import { supabase } from "../integrations/supabase/client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
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

function notifyAuthChange(user: UserProfile | null) {
  listeners.forEach((fn) => fn(user));
}

export async function loginUser(
  email: string,
  _password?: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanEmail = email.toLowerCase().trim();
  try {
    // 1. Try to fetch profile from Supabase
    const { data: dbProfiles, error: dbError } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("email", cleanEmail)
      .order("created_at", { ascending: false })
      .limit(1);

    const dbProfile = dbProfiles && dbProfiles.length > 0 ? dbProfiles[0] : null;

    if (dbProfile && !dbError) {
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

    // 2. Fallback to local storage or create mock profile for testing
    let user = getCurrentUser();
    if (!user || user.email.toLowerCase() !== cleanEmail) {
      user = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        name: cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        email: cleanEmail,
        whatsapp: "(11) 98765-4321",
        role: "user",
        createdAt: new Date().toISOString(),
      };
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    }
    notifyAuthChange(user);
    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro ao realizar login" };
  }
}

export async function registerUser(data: {
  name: string;
  email: string;
  whatsapp: string;
  password?: string;
  role?: "user" | "partner" | "admin";
  businessName?: string;
  venueCategory?: "baladas" | "restaurantes" | "moteis";
  neighborhood?: string;
}): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanEmail = data.email.toLowerCase().trim();
  try {
    const userRole = data.role || "user";
    let newUserId = "usr_" + Math.random().toString(36).substring(2, 9);

    // 1. Try to persist into Supabase profiles
    try {
      const { data: dbData, error: dbError } = await (supabase as any)
        .from("profiles")
        .insert([
          {
            name: data.name.trim(),
            email: cleanEmail,
            whatsapp: data.whatsapp.trim(),
            role: userRole,
            business_name: data.businessName?.trim() || null,
            venue_category: data.venueCategory || null,
            neighborhood: data.neighborhood?.trim() || null,
          },
        ])
        .select()
        .single();

      if (dbData && !dbError) {
        newUserId = dbData.id;
      } else if (dbError) {
        console.warn("Supabase profile save notice:", dbError.message);
      }
    } catch (e) {
      console.warn("Could not save to Supabase profiles:", e);
    }

    // 2. Set current active user profile
    const user: UserProfile = {
      id: newUserId,
      name: data.name.trim(),
      email: cleanEmail,
      whatsapp: data.whatsapp.trim(),
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

export function logoutUser(): void {
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
