export interface UserProfile {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  avatarUrl?: string;
  role: "user" | "partner" | "admin";
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

export async function loginUser(email: string, _password?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    // Check if we have a locally stored user or create one
    let user = getCurrentUser();
    if (!user || user.email.toLowerCase() !== email.toLowerCase()) {
      user = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        whatsapp: "(11) 98765-4321",
        role: "user",
        createdAt: new Date().toISOString(),
      };
    }

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
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
}): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const user: UserProfile = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: data.name,
      email: data.email,
      whatsapp: data.whatsapp,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
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
