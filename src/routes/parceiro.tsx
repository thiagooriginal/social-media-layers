import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  Sparkles,
  TrendingUp,
  Users,
  Ticket,
  ArrowRight,
  Check,
  CheckCircle2,
  Phone,
  Mail,
  Lock,
  Store,
  MapPin,
  Flame,
  Crown,
  ChevronRight,
  LogOut,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  Edit3,
  Clock,
  Share2,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  QrCode,
  Zap,
  Copy,
  Sliders,
  Fingerprint,
  X,
} from "lucide-react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  UserProfile,
  getSavedCredentials,
  saveCredentials,
  clearSavedCredentials,
  SavedCredentials,
} from "../services/authService";
import {
  authenticateWithBiometrics,
  registerDeviceBiometrics,
  getStoredBiometrics,
} from "../services/biometricService";
import { NEIGHBORHOODS, Venue, VENUES_DATA } from "../data/venues";
import { registerVenue, NewVenueInput, updateLeadStatus, updateVenue } from "../services/venueService";
import { supabase } from "../integrations/supabase/client";
import { PartnerAnalyticsModal } from "../components/PartnerAnalyticsModal";
import { getVenueMetrics } from "../services/analyticsService";
import { EditVenueModal } from "../components/EditVenueModal";
import { SaasCheckoutModal } from "../components/SaasCheckoutModal";
import { PortariaQrScannerModal } from "../components/PortariaQrScannerModal";
import {
  getSubscriptionByVenue,
  SAAS_PLANS,
  SaasSubscription,
  getStoredSubscriptions,
  createSubscription,
  DueDay,
  OFFICIAL_PLAN_NAME,
  OFFICIAL_PLAN_PRICE,
  OFFICIAL_PIX_KEY,
} from "../services/saasBillingService";
import {
  buildPortariaCheckInMessage,
  buildBulkReminderMessage,
  dispatchWhatsAppNotification,
  openWhatsAppDirect,
} from "../services/whatsappService";

export const Route = createFileRoute("/parceiro")({
  component: PartnerPortalPage,
});

interface VipLeadRow {
  id: string;
  venue_name: string;
  user_name: string;
  user_whatsapp: string;
  guests_count: number;
  event_date: string;
  status: string;
  created_at: string;
}

function PartnerPortalPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [authMode, setAuthMode] = useState<"login" | "register">("register");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Biometric & Saved Credentials for Partner
  const [partnerRememberMe, setPartnerRememberMe] = useState(true);
  const [partnerEnableBio, setPartnerEnableBio] = useState(true);
  const [partnerSavedCreds, setPartnerSavedCreds] = useState<SavedCredentials | null>(() => getSavedCredentials());
  const [partnerBioLoading, setPartnerBioLoading] = useState(false);
  const [partnerBioSuccess, setPartnerBioSuccess] = useState(false);
  const [showPartnerManual, setShowPartnerManual] = useState(false);

  useEffect(() => {
    const creds = getSavedCredentials();
    setPartnerSavedCreds(creds);
    if (creds?.email && !loginEmail) {
      setLoginEmail(creds.email);
    }

    if (authMode === "login") {
      setShowPartnerManual(false);
      const timer = setTimeout(() => {
        handlePartnerBiometricLogin();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [authMode]);

  // Register form state
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState<"baladas" | "restaurantes" | "moteis">("baladas");
  const [neighborhood, setNeighborhood] = useState(NEIGHBORHOODS[0].name);
  const [selectedPlan, setSelectedPlan] = useState<"mensal" | "semestral" | "anual">("mensal");
  const [partnerDueDay, setPartnerDueDay] = useState<DueDay>(10);
  const [partnerPaymentMethod, setPartnerPaymentMethod] = useState<"credit_card" | "pix">("credit_card");

  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Partner dashboard data (when logged in as partner)
  const [partnerLeads, setPartnerLeads] = useState<VipLeadRow[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Sub-tabs in Partner Portal: "portaria" (Check-in VIP) | "live" (Lotação / Fila) | "subscription" (Minha Assinatura SaaS)
  const [partnerSubTab, setPartnerSubTab] = useState<"portaria" | "live" | "subscription">("portaria");
  const [leadStatusFilter, setLeadStatusFilter] = useState<"all" | "confirmed" | "checked_in">("all");

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Live status state
  const [liveQueueStatus, setLiveQueueStatus] = useState<"fluida" | "moderada" | "lotada">("fluida");
  const [liveVipStatus, setLiveVipStatus] = useState<"aberta" | "ultimos" | "encerrada">("aberta");
  const [liveNotice, setLiveNotice] = useState("Entrada com nome na lista VIP até 00h30. Chegue cedo!");
  const [liveSavedAlert, setLiveSavedAlert] = useState(false);

  // Subscription state
  const [subscription, setSubscription] = useState<SaasSubscription | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedPortariaList, setCopiedPortariaList] = useState(false);
  const [overriddenVenue, setOverriddenVenue] = useState<Venue | null>(null);

  // Bulk WhatsApp Reminder State for Portaria
  const [isBulkReminderModalOpen, setIsBulkReminderModalOpen] = useState(false);
  const [bulkReminderNotice, setBulkReminderNotice] = useState("Lembrando que o seu nome está na lista VIP até 00h30. Chegue cedo para garantir fila rápida!");
  const [bulkReminderSuccess, setBulkReminderSuccess] = useState(false);

  // QR Scanner Modal State for Camera Check-in
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  const isPartner = currentUser?.role === "partner" || currentUser?.role === "admin";

  // Resolve partner's own establishment (strictly isolated)
  const partnerVenue = useMemo<Venue>(() => {
    if (!currentUser?.businessName) return VENUES_DATA[0];
    const search = currentUser.businessName.trim().toLowerCase();
    const exact = VENUES_DATA.find((v) => v.name.toLowerCase() === search);
    if (exact) return exact;
    const partial = VENUES_DATA.find((v) => v.name.toLowerCase().includes(search));
    if (partial) return partial;

    return {
      id: "partner-" + (currentUser.id || "mine"),
      name: currentUser.businessName,
      category: currentUser.venueCategory || "baladas",
      subType: currentUser.venueCategory === "moteis" ? "Motel Design" : currentUser.venueCategory === "restaurantes" ? "Bar & Gastronomia" : "Balada & Shows",
      subTypeEmoji: currentUser.venueCategory === "moteis" ? "🔥" : currentUser.venueCategory === "restaurantes" ? "🍸" : "🪩",
      tagline: `O melhor de ${currentUser.neighborhood || "São Paulo"} • Faça sua reserva e lista VIP`,
      neighborhood: currentUser.neighborhood || "São Paulo",
      address: `${currentUser.neighborhood || "São Paulo"}, SP`,
      latitude: -23.5505,
      longitude: -46.6333,
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
      rating: 4.9,
      reviewsCount: 145,
      priceLevel: "$$$",
      openHours: "Consulte horários no WhatsApp",
      entryPrice: "Consulte valores • Lista VIP",
      whatsapp: "55" + (currentUser.whatsapp || "").replace(/\D/g, ""),
      hasVipList: true,
      hasParking: true,
      plan: "semestral",
      planPrice: 59,
    };
  }, [currentUser]);

  const activeVenue = overriddenVenue || partnerVenue || VENUES_DATA[0];

  const partnerMetrics = useMemo(() => {
    return getVenueMetrics(activeVenue.id, activeVenue.name);
  }, [activeVenue]);

  // Load partner SaaS subscription
  useEffect(() => {
    if (activeVenue) {
      try {
        const sub = getSubscriptionByVenue(activeVenue.id, activeVenue.name);
        if (sub) {
          setSubscription(sub);
        } else {
          setSubscription({
            id: "sub-" + activeVenue.id,
            venueId: activeVenue.id,
            venueName: activeVenue.name,
            ownerName: currentUser?.name || "Administrador",
            ownerEmail: currentUser?.email || "contato@" + activeVenue.id + ".com.br",
            ownerWhatsapp: activeVenue.whatsapp || "11999998888",
            planId: (activeVenue.plan as any) || "semestral",
            planName: activeVenue.plan === "anual" ? "Plano Anual Master VIP" : activeVenue.plan === "mensal" ? "Plano Mensal Start" : "Plano Semestral Pro",
            monthlyValue: activeVenue.planPrice || 59,
            totalCycleValue: (activeVenue.planPrice || 59) * (activeVenue.plan === "anual" ? 12 : activeVenue.plan === "semestral" ? 6 : 1),
            status: "active",
            paymentMethod: "pix",
            startDate: "2026-06-01",
            nextBillingDate: "2026-12-01",
            pixCopiaECola: "00020126580014BR.GOV.BCB.PIX0136thiagooriginal2002@gmail.com520400005303986540559.005802BR5920RADAR DO ROLE SAAS6009SAO PAULO62070503***6304ABCD",
          });
        }
      } catch (err) {
        console.warn("Could not load subscription:", err);
      }
    }
  }, [activeVenue, currentUser]);

  // Phone mask utility
  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  // Fetch venue leads if logged in (or provide realistic portaria leads for testing)
  useEffect(() => {
    if (isPartner && currentUser) {
      setIsLoadingLeads(true);
      (supabase as any)
        .from("vip_list_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)
        .then(({ data }: any) => {
          if (data && data.length > 0) {
            setPartnerLeads(data);
          } else {
            // Seed leads for this venue so the partner can test the live portaria check-in
            setPartnerLeads([
              {
                id: "lead-001",
                venue_name: activeVenue.name,
                user_name: "Lucas Almeida",
                user_whatsapp: "(11) 98765-4321",
                guests_count: 3,
                event_date: "Hoje (Sexta-feira)",
                status: "confirmed",
                created_at: new Date(Date.now() - 3600000).toISOString(),
              },
              {
                id: "lead-002",
                venue_name: activeVenue.name,
                user_name: "Mariana Rios",
                user_whatsapp: "(11) 97654-3210",
                guests_count: 2,
                event_date: "Hoje (Sexta-feira)",
                status: "checked_in",
                created_at: new Date(Date.now() - 7200000).toISOString(),
              },
              {
                id: "lead-003",
                venue_name: activeVenue.name,
                user_name: "Thiago Henrique Silva",
                user_whatsapp: "(11) 99123-4567",
                guests_count: 4,
                event_date: "Hoje (Sexta-feira)",
                status: "confirmed",
                created_at: new Date(Date.now() - 10800000).toISOString(),
              },
              {
                id: "lead-004",
                venue_name: activeVenue.name,
                user_name: "Camila Fernandes Martins",
                user_whatsapp: "(11) 98234-5678",
                guests_count: 1,
                event_date: "Hoje (Sexta-feira)",
                status: "confirmed",
                created_at: new Date(Date.now() - 14400000).toISOString(),
              },
              {
                id: "lead-005",
                venue_name: activeVenue.name,
                user_name: "Gabriel Santos Costa",
                user_whatsapp: "(11) 97345-6789",
                guests_count: 2,
                event_date: "Hoje (Sexta-feira)",
                status: "confirmed",
                created_at: new Date(Date.now() - 18000000).toISOString(),
              },
            ]);
          }
          setIsLoadingLeads(false);
        });
    }
  }, [isPartner, currentUser, activeVenue.name]);

  // Check-in toggle handler
  const handleToggleCheckin = async (leadId: string, currentStatus: string, forceCheckIn?: boolean) => {
    const newStatus = forceCheckIn ? "checked_in" : (currentStatus === "checked_in" ? "confirmed" : "checked_in");
    setPartnerLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    await updateLeadStatus(leadId, newStatus as any);
  };

  // Export portaria list via WhatsApp
  const handleExportPortariaWhatsApp = () => {
    const total = partnerLeads.length;
    const checkedIn = partnerLeads.filter((l) => l.status === "checked_in").length;
    const waiting = total - checkedIn;

    let text = `📋 *LISTA VIP DA PORTARIA - ${activeVenue.name.toUpperCase()}*\n`;
    text += `📅 Data: ${new Date().toLocaleDateString("pt-BR")}\n`;
    text += `👥 Total: ${total} reservas | ✅ Entraram: ${checkedIn} | ⏳ Aguardando: ${waiting}\n\n`;
    text += `*NOMES CONFIRMADOS:*\n`;

    partnerLeads.forEach((lead, idx) => {
      const statusIcon = lead.status === "checked_in" ? "✅ [ENTROU NA CASA]" : "⏳ [AGUARDANDO]";
      text += `${idx + 1}. *${lead.user_name}* (+${lead.guests_count} pessoas) - ${statusIcon}\n   Tel: ${lead.user_whatsapp}\n`;
    });

    text += `\n⚡ Gerado via Radar do Rolê - Portaria Digital`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Copy portaria list formatted text
  const handleCopyPortariaText = () => {
    const total = partnerLeads.length;
    const checkedIn = partnerLeads.filter((l) => l.status === "checked_in").length;
    const waiting = total - checkedIn;

    let text = `📋 LISTA VIP DA PORTARIA - ${activeVenue.name.toUpperCase()}\n`;
    text += `Data: ${new Date().toLocaleDateString("pt-BR")}\n`;
    text += `Total: ${total} grupos | Entraram: ${checkedIn} | Aguardando: ${waiting}\n\n`;
    text += `NOMES CONFIRMADOS:\n`;

    partnerLeads.forEach((lead, idx) => {
      const statusIcon = lead.status === "checked_in" ? "[ENTROU]" : "[AGUARDANDO]";
      text += `${idx + 1}. ${lead.user_name} (+${lead.guests_count} pessoas) - ${statusIcon} | Tel: ${lead.user_whatsapp}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedPortariaList(true);
    setTimeout(() => setCopiedPortariaList(false), 2500);
  };

  // Save live queue & lotação status
  const handleSaveLiveStatus = async () => {
    setLiveSavedAlert(true);
    setTimeout(() => setLiveSavedAlert(false), 3000);
    await updateVenue(activeVenue.id, {
      highlight: liveNotice,
    });
  };

  // WhatsApp Single Lead Reminder
  const handleSendSingleLeadReminder = async (lead: VipLeadRow) => {
    const text = buildBulkReminderMessage({
      venueName: activeVenue.name,
      clientName: lead.user_name,
      specialNotice: liveNotice || bulkReminderNotice,
    });
    await dispatchWhatsAppNotification({
      recipientType: "client",
      recipientPhone: lead.user_whatsapp,
      recipientName: lead.user_name,
      venueName: activeVenue.name,
      message: text,
    });
  };

  // WhatsApp Entry Confirmation Notice
  const handleSendCheckInNotice = async (lead: VipLeadRow) => {
    const text = buildPortariaCheckInMessage({
      userName: lead.user_name,
      venueName: activeVenue.name,
      passCode: lead.id,
    });
    await dispatchWhatsAppNotification({
      recipientType: "client",
      recipientPhone: lead.user_whatsapp,
      recipientName: lead.user_name,
      venueName: activeVenue.name,
      message: text,
    });
  };

  // WhatsApp Broadcast Reminder to All Pending VIP Leads
  const handleDispatchBulkReminder = async () => {
    const pendingLeads = partnerLeads.filter((l) => l.status !== "checked_in");
    if (pendingLeads.length === 0) {
      alert("Todos os clientes cadastrados já realizaram o check-in na casa!");
      return;
    }

    setBulkReminderSuccess(true);
    setTimeout(() => {
      setBulkReminderSuccess(false);
      setIsBulkReminderModalOpen(false);
    }, 2500);

    const first = pendingLeads[0];
    const text = buildBulkReminderMessage({
      venueName: activeVenue.name,
      clientName: first.user_name,
      specialNotice: bulkReminderNotice,
    });
    await dispatchWhatsAppNotification({
      recipientType: "client",
      recipientPhone: first.user_whatsapp,
      recipientName: first.user_name,
      venueName: activeVenue.name,
      message: text,
    });
  };

  // Biometric Login for Partner
  const handlePartnerBiometricLogin = async () => {
    setLoginError("");
    setPartnerBioLoading(true);
    const res = await authenticateWithBiometrics("partner");
    setPartnerBioLoading(false);

    if (res.success && res.user) {
      setPartnerBioSuccess(true);
      const partnerUser: UserProfile = {
        ...res.user,
        role: res.user.role === "admin" ? "admin" : "partner",
        businessName: res.user.businessName || "Vila JK",
        venueCategory: res.user.venueCategory || "baladas",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("baladaon_auth_user", JSON.stringify(partnerUser));
      }
      setTimeout(() => {
        setCurrentUser(partnerUser);
      }, 400);
    } else {
      setLoginError(res.error || "Não foi possível validar a digital do parceiro.");
    }
  };

  // Handle Partner Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail.trim() || !loginEmail.includes("@")) {
      setLoginError("Por favor, digite seu e-mail cadastrado.");
      return;
    }

    setLoginLoading(true);
    const res = await loginUser(loginEmail, loginPassword);
    setLoginLoading(false);

    if (res.success && res.user) {
      // Ensure partner role & businessName are present when logging in through /parceiro
      const partnerUser: UserProfile = {
        ...res.user,
        role: res.user.role === "admin" ? "admin" : "partner",
        businessName: res.user.businessName || "Vila JK",
        venueCategory: res.user.venueCategory || "baladas",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("baladaon_auth_user", JSON.stringify(partnerUser));
      }
      if (partnerRememberMe) {
        saveCredentials({
          email: partnerUser.email,
          name: partnerUser.name,
          role: "partner",
          businessName: partnerUser.businessName,
          rememberMe: true,
          biometricsEnabled: partnerEnableBio,
        });
        if (partnerEnableBio) {
          registerDeviceBiometrics(partnerUser);
        }
      }
      setCurrentUser(partnerUser);
    } else {
      setLoginError(res.error || "E-mail ou senha incorretos.");
    }
  };

  // Handle Partner Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    if (!businessName.trim()) {
      setRegisterError("Por favor, digite o nome do seu estabelecimento.");
      return;
    }
    if (!ownerName.trim()) {
      setRegisterError("Por favor, digite o nome do responsável.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setRegisterError("Por favor, digite um e-mail válido.");
      return;
    }
    if (whatsapp.replace(/\D/g, "").length < 10) {
      setRegisterError("Por favor, digite um WhatsApp comercial válido com DDD.");
      return;
    }

    setRegisterLoading(true);

    // 1. Create Partner User in auth & profiles
    const userRes = await registerUser({
      name: ownerName,
      email,
      whatsapp,
      password,
      role: "partner",
      businessName,
      venueCategory: category,
      neighborhood,
    });

    if (!userRes.success || !userRes.user) {
      setRegisterLoading(false);
      setRegisterError(userRes.error || "Erro ao criar conta de parceiro.");
      return;
    }

    // 2. Register Venue in venues table
    const defaultCoords = NEIGHBORHOODS.find((n) => n.name === neighborhood) || NEIGHBORHOODS[0];

    const venueRes = await registerVenue({
      category,
      name: businessName,
      tagline: `O melhor de ${neighborhood} • Faça sua reserva e lista VIP`,
      subType: category === "baladas" ? "Balada & Shows" : category === "moteis" ? "Motel Design" : "Bar & Gastronomia",
      subTypeEmoji: category === "baladas" ? "🪩" : category === "moteis" ? "🔥" : "🍸",
      neighborhood,
      address: `${neighborhood}, São Paulo - SP`,
      latitude: defaultCoords.lat,
      longitude: defaultCoords.lng,
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
      openHours: "Consulte horários no WhatsApp",
      entryPrice: "Consulte valores • Lista VIP",
      whatsapp: "55" + whatsapp.replace(/\D/g, ""),
      hasVipList: true,
      hasParking: true,
      plan: "mensal",
      planPrice: OFFICIAL_PLAN_PRICE,
    });

    // 3. Register SaaS Subscription in Billing Service
    createSubscription({
      venueId: venueRes.venue?.id || "partner-" + userRes.user.id,
      venueName: businessName,
      ownerName: ownerName,
      ownerEmail: email,
      ownerWhatsapp: whatsapp.replace(/\D/g, ""),
      planId: "mensal",
      paymentMethod: partnerPaymentMethod,
      dueDay: partnerDueDay,
    });

    setRegisterLoading(false);
    setRegisterSuccess(true);
    if (partnerRememberMe && userRes.user) {
      saveCredentials({
        email: userRes.user.email,
        name: userRes.user.name,
        role: "partner",
        businessName: userRes.user.businessName,
        rememberMe: true,
        biometricsEnabled: partnerEnableBio,
      });
      if (partnerEnableBio) {
        registerDeviceBiometrics(userRes.user);
      }
    }
    setCurrentUser(userRes.user);
  };

  // Demo 1-Click login for testing
  const handleDemoPartnerLogin = async () => {
    setLoginLoading(true);
    const demoPartner: UserProfile = {
      id: "partner-vilajk",
      name: "Carlos Mendes",
      email: "gestao@vilajk.com.br",
      whatsapp: "(11) 98888-1234",
      role: "partner",
      businessName: "Vila JK",
      venueCategory: "baladas",
      neighborhood: "Vila Olímpia",
      createdAt: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("baladaon_auth_user", JSON.stringify(demoPartner));
    }
    setCurrentUser(demoPartner);
    setLoginLoading(false);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setAuthMode("login");
  };

  const PLANS = [
    {
      id: "mensal" as const,
      name: "Mensal",
      price: "79",
      period: "/mês",
      billingText: "Sem fidelidade, cancele quando quiser",
      badge: null,
      highlight: false,
      features: [
        "Página dedicada no app",
        "Botão oficial pro seu WhatsApp",
        "Cálculo de corrida de Uber até o local",
        "Localização por GPS em São Paulo",
      ],
    },
    {
      id: "semestral" as const,
      name: "Semestral",
      price: "59",
      period: "/mês",
      billingText: "Cobrança semestral (Economize R$ 120)",
      badge: "MAIS ESCOLHIDO 🔥",
      highlight: true,
      features: [
        "Tudo do Plano Mensal",
        "Emissão de Lista VIP digital",
        "Painel de controle de nomes na portaria",
        "Selo de Estabelecimento Verificado",
        "Destaque nas buscas por bairro",
      ],
    },
    {
      id: "anual" as const,
      name: "Anual",
      price: "39",
      period: "/mês",
      billingText: "Cobrança anual (Economize 50% no ano)",
      badge: "MELHOR VALOR 👑",
      highlight: false,
      features: [
        "Tudo do Plano Semestral",
        "Posicionamento prioritário no topo",
        "Banner rotativo na Home",
        "Consultor VIP via WhatsApp dedicado",
        "Relatórios semanais de público e visualizações",
      ],
    },
  ];

  // =========================================================================
  // VIEW: PARTNER LOGGED IN DASHBOARD
  // =========================================================================
  if (isPartner && currentUser) {
    const checkedInCount = partnerLeads.filter((l) => l.status === "checked_in").length;
    const waitingCount = partnerLeads.length - checkedInCount;

    const displayedLeads = partnerLeads.filter((lead) => {
      if (leadStatusFilter === "all") return true;
      if (leadStatusFilter === "confirmed") return lead.status !== "checked_in";
      if (leadStatusFilter === "checked_in") return lead.status === "checked_in";
      return true;
    });

    return (
      <div className="min-h-screen bg-[#070a11] text-slate-100 pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-purple-500/20 bg-[#0a0f1d]/95 backdrop-blur-xl px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-cyan-500 text-xl shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                🏢
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-white">
                    {activeVenue.name}
                  </h1>
                  <span className="rounded-full bg-purple-500/20 border border-purple-500/50 px-2 py-0.5 text-[10px] font-black text-purple-300">
                    Parceiro Oficial
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Portal de Gestão, Portaria & Faturamento</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                title="Editar fotos, contatos e detalhes da casa"
              >
                <Edit3 className="h-3.5 w-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Editar Minha Casa</span>
              </button>

              <button
                onClick={() => setIsAnalyticsOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-600/25 px-2.5 py-1.5 text-xs font-bold text-purple-200 hover:bg-purple-600/40 hover:text-white transition-all cursor-pointer shadow-sm"
              >
                <BarChart3 className="h-3.5 w-3.5 text-purple-400" />
                <span className="hidden sm:inline">Métricas da Minha Casa</span>
              </button>

              <Link
                to="/"
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ver no App</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 px-2.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
          {/* Welcome Banner */}
          <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-[#0e1424] to-cyan-950/30 p-5 sm:p-6 shadow-[0_0_35px_rgba(168,85,247,0.15)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Perfil Ativo no Radar Noturno de SP
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-300">
                    <Crown className="h-3 w-3" />
                    {subscription?.planName || "Plano Semestral Pro"} (Em dia)
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Bem-vindo, {currentUser.name}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  {activeVenue.name} está sendo recomendada com destaque no mapa e feeds para milhares de pessoas em São Paulo.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-purple-600/30 border border-purple-500/50 px-3.5 py-2.5 text-xs font-black text-purple-200 hover:bg-purple-600/50 hover:text-white transition-all cursor-pointer"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Editar Meu Card</span>
                </button>

                <button
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2.5 text-xs font-black text-black hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer"
                >
                  <Crown className="h-4 w-4" />
                  <span>Minha Assinatura / Upgrade</span>
                </button>

                <a
                  href={`https://wa.me/${(activeVenue?.whatsapp || "").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-black text-white hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  <Phone className="h-4 w-4" />
                  <span>Testar Botão WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Subtabs Switcher */}
          <div className="mt-6 flex items-center gap-2 border-b border-white/10 pb-3 flex-wrap">
            <button
              onClick={() => setPartnerSubTab("portaria")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                partnerSubTab === "portaria"
                  ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Ticket className="h-4 w-4" />
              <span>Portaria & Check-in VIP ({partnerLeads.length})</span>
            </button>

            <button
              onClick={() => setPartnerSubTab("live")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                partnerSubTab === "live"
                  ? "bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>Fila & Lotação em Tempo Real</span>
            </button>

            <button
              onClick={() => setPartnerSubTab("subscription")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                partnerSubTab === "subscription"
                  ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>💼 Minha Assinatura SaaS</span>
            </button>
          </div>

          {/* =============================================================== */}
          {/* TAB 1: PORTARIA & CHECK-IN DIGITAL */}
          {/* =============================================================== */}
          {partnerSubTab === "portaria" && (
            <div className="mt-6 space-y-6">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-white/10 bg-[#0e1424] p-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Visualizações do Card</span>
                  <div className="mt-1 text-2xl font-black text-cyan-300">
                    {(partnerMetrics?.impressionsFeed || 0).toLocaleString("pt-BR")}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">+{(partnerMetrics?.weeklyGrowth || 0)}% esta semana</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0e1424] p-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Cliques para WhatsApp</span>
                  <div className="mt-1 text-2xl font-black text-emerald-400">
                    {(partnerMetrics?.whatsappDirectClicks || 0).toLocaleString("pt-BR")}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Contatos diretos gerados</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0e1424] p-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Check-ins na Casa</span>
                  <div className="mt-1 text-2xl font-black text-purple-300">
                    {checkedInCount} / {partnerLeads.length}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{waitingCount} aguardando entrada</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0e1424] p-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Simulações de Uber</span>
                  <div className="mt-1 text-2xl font-black text-amber-300">
                    {(partnerMetrics?.uberSimulations || 0).toLocaleString("pt-BR")}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Público calculando rota</p>
                </div>
              </div>

              {/* Leads Table for Portaria */}
              <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Ticket className="h-5 w-5 text-purple-400" />
                      <span>Check-in Digital da Portaria ao Vivo</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Controle a entrada dos baladeiros em tempo real. Marque check-in conforme chegarem à casa.
                    </p>
                  </div>

                  {/* Actions for Portaria */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsQrScannerOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 px-3.5 py-2 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
                    >
                      <QrCode className="h-3.5 w-3.5 animate-pulse" />
                      <span>📷 Câmera Scanner QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsBulkReminderModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/50 px-3 py-2 text-xs font-bold text-emerald-300 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>⚡ Lembrete WhatsApp ({waitingCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyPortariaText}
                      className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    >
                      {copiedPortariaList ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedPortariaList ? "Lista Copiada!" : "Copiar Texto"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportPortariaWhatsApp}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black text-white hover:bg-emerald-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Lista p/ Seguranças</span>
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase mr-2">Filtrar:</span>
                  <button
                    onClick={() => setLeadStatusFilter("all")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                      leadStatusFilter === "all"
                        ? "bg-purple-600/30 text-purple-300 border border-purple-500/50"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Todos ({partnerLeads.length})
                  </button>
                  <button
                    onClick={() => setLeadStatusFilter("confirmed")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                      leadStatusFilter === "confirmed"
                        ? "bg-amber-600/30 text-amber-300 border border-amber-500/50"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Aguardando Entrada ({waitingCount})
                  </button>
                  <button
                    onClick={() => setLeadStatusFilter("checked_in")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                      leadStatusFilter === "checked_in"
                        ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Check-in Realizado ({checkedInCount})
                  </button>
                </div>

                {partnerLeads.length === 0 ? (
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center text-slate-400">
                    <Ticket className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                    <p className="text-xs font-bold text-slate-300">Nenhum nome cadastrado na lista para hoje ainda</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Assim que os usuários clicarem em "Lista VIP" no seu card, os dados aparecerão aqui em tempo real.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px] font-black">
                        <tr>
                          <th className="py-2.5 px-3">Nome do Cliente</th>
                          <th className="py-2.5 px-3">WhatsApp</th>
                          <th className="py-2.5 px-3">Acompanhantes</th>
                          <th className="py-2.5 px-3">Data Prevista</th>
                          <th className="py-2.5 px-3">Status Portaria</th>
                          <th className="py-2.5 px-3 text-right">Ação de Entrada</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {displayedLeads.map((lead) => {
                          const isCheckedIn = lead.status === "checked_in";
                          return (
                            <tr key={lead.id} className="hover:bg-white/[0.02]">
                              <td className="py-3 px-3">
                                <span className="font-black text-white text-sm block">{lead.user_name}</span>
                                <span className="text-[10px] text-slate-500">ID: {lead.id}</span>
                              </td>
                              <td className="py-3 px-3">
                                <a
                                  href={`https://wa.me/55${lead.user_whatsapp.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-400 hover:underline font-bold"
                                >
                                  {lead.user_whatsapp}
                                </a>
                              </td>
                              <td className="py-3 px-3 font-bold text-cyan-300">
                                +{lead.guests_count} pessoas
                              </td>
                              <td className="py-3 px-3 text-slate-300 font-medium">
                                {lead.event_date}
                              </td>
                              <td className="py-3 px-3">
                                {isCheckedIn ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 text-[11px] font-black">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Entrou na Casa
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-1 text-[11px] font-black">
                                    <Clock className="h-3.5 w-3.5" />
                                    Aguardando Entrada
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Direct WhatsApp Contact / Reminder */}
                                  <button
                                    type="button"
                                    onClick={() => handleSendSingleLeadReminder(lead)}
                                    className="p-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-400 hover:text-white transition-all cursor-pointer"
                                    title="Avisar cliente no WhatsApp"
                                  >
                                    <Phone className="h-3.5 w-3.5" />
                                  </button>

                                  {isCheckedIn ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleSendCheckInNotice(lead)}
                                        className="p-1.5 rounded-xl border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/50 text-purple-300 hover:text-white transition-all cursor-pointer"
                                        title="Enviar comprovante de entrada no WhatsApp"
                                      >
                                        <Send className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleCheckin(lead.id, lead.status)}
                                        className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 px-2.5 py-1.5 text-xs font-bold text-slate-300 transition-all cursor-pointer"
                                        title="Desfazer check-in"
                                      >
                                        <span>Desfazer</span>
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleCheckin(lead.id, lead.status)}
                                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 px-3 py-1.5 text-xs font-black text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                      <span>Check-in</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 2: FILA & LOTAÇÃO AO VIVO */}
          {/* =============================================================== */}
          {partnerSubTab === "live" && (
            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border border-cyan-500/30 bg-[#0c101c] p-6 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Zap className="h-5 w-5 text-cyan-400" />
                      <span>Controle de Fila e Lotação em Tempo Real</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Essas informações aparecem instantaneamente para os usuários no Radar noturno do aplicativo.
                    </p>
                  </div>
                  {liveSavedAlert && (
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/50 px-3 py-1 text-xs font-black text-emerald-300 animate-bounce">
                      ✅ Atualizado no App!
                    </span>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Queue Status Picker */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                      Status da Entrada & Fila
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setLiveQueueStatus("fluida")}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          liveQueueStatus === "fluida"
                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span className="text-xl block mb-1">🟢</span>
                        <span className="text-xs font-black block">Entrada Fluida</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Sem fila</span>
                      </button>

                      <button
                        onClick={() => setLiveQueueStatus("moderada")}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          liveQueueStatus === "moderada"
                            ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                            : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span className="text-xl block mb-1">🟡</span>
                        <span className="text-xs font-black block">Fila Média</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">15 a 30 min</span>
                      </button>

                      <button
                        onClick={() => setLiveQueueStatus("lotada")}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          liveQueueStatus === "lotada"
                            ? "bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                            : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span className="text-xl block mb-1">🔴</span>
                        <span className="text-xs font-black block">Casa Lotada</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Fila intensa</span>
                      </button>
                    </div>
                  </div>

                  {/* VIP List Availability */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                      Disponibilidade da Lista VIP
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setLiveVipStatus("aberta")}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          liveVipStatus === "aberta"
                            ? "bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                            : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span className="text-xl block mb-1">🎟️</span>
                        <span className="text-xs font-black block">Lista Aberta</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Recebendo nomes</span>
                      </button>

                      <button
                        onClick={() => setLiveVipStatus("ultimos")}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          liveVipStatus === "ultimos"
                            ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                            : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span className="text-xl block mb-1">⏳</span>
                        <span className="text-xs font-black block">Últimas Vagas</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Poucos nomes</span>
                      </button>

                      <button
                        onClick={() => setLiveVipStatus("encerrada")}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          liveVipStatus === "encerrada"
                            ? "bg-slate-500/20 border-slate-400 text-slate-300 shadow-[0_0_15px_rgba(148,163,184,0.3)]"
                            : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span className="text-xl block mb-1">🔒</span>
                        <span className="text-xs font-black block">Encerrada</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Apenas na porta</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Custom Notice Input */}
                <div className="mt-5 space-y-2">
                  <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                    Aviso em Destaque no Card do Estabelecimento (Ao Vivo)
                  </label>
                  <input
                    type="text"
                    value={liveNotice}
                    onChange={(e) => setLiveNotice(e.target.value)}
                    placeholder="Ex: Nomes na lista válidos até 00h30. Open bar de caipirinha na primeira hora!"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="mt-5 flex items-center justify-end">
                  <button
                    onClick={handleSaveLiveStatus}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Publicar Status em Tempo Real no App</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: MINHA ASSINATURA SAAS */}
          {/* =============================================================== */}
          {partnerSubTab === "subscription" && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Active Plan Card */}
                <div className="lg:col-span-2 rounded-2xl border border-purple-500/30 bg-[#0c101c] p-6 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase border ${
                          subscription?.status === "card_failed"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                        }`}
                      >
                        {subscription?.status === "card_failed" ? "⚠️ Falha na Cobrança do Cartão" : "● Assinatura Ativa & Em Dia"}
                      </span>
                      <h3 className="mt-2 text-xl font-black text-white">
                        {subscription?.planName || OFFICIAL_PLAN_NAME}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Vinculado ao estabelecimento: <strong className="text-white">{activeVenue.name}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Mensalidade</span>
                      <span className="text-2xl font-black text-white">
                        R$ {subscription?.monthlyValue || OFFICIAL_PLAN_PRICE},00
                      </span>
                      <span className="text-xs text-slate-400"> /mês</span>
                    </div>
                  </div>

                  {/* Card Failure Warning Banner if card failed */}
                  {subscription?.status === "card_failed" && (
                    <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-rose-300 text-xs font-black">
                        <AlertCircle className="h-4 w-4 text-rose-400" />
                        <span>Atenção: A última tentativa de cobrança no seu cartão de crédito foi recusada.</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Motivo: <strong>{subscription.lastChargeFailureReason || "Saldo insuficiente ou cartão cancelado"}</strong>.
                        Para manter a lista VIP e destaques ativos, regularize agora via Pix pela chave oficial abaixo.
                      </p>
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 border-y border-white/5 py-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Data de Vencimento</span>
                      <span className="text-xs font-black text-cyan-300 mt-0.5 block">
                        Todo dia {subscription?.dueDay || 10}
                      </span>
                      <span className="text-[10px] text-slate-400">Próx: {subscription?.nextBillingDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Ciclo de Cobrança</span>
                      <span className="text-xs font-black text-slate-200 mt-0.5 block">
                        R$ {subscription?.monthlyValue || OFFICIAL_PLAN_PRICE},00 /mês
                      </span>
                      <span className="text-[10px] text-slate-400">Recorrente mensal</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Forma de Pagamento</span>
                      <span className="text-xs font-black text-emerald-400 mt-0.5 block">
                        {subscription?.paymentMethod === "credit_card"
                          ? `Cartão Recorrente (final ${subscription?.cardLast4 || "••••"})`
                          : "Pix Recorrente"}
                      </span>
                    </div>
                  </div>

                  {/* Included features */}
                  <div className="mt-5">
                    <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3">
                      Recursos inclusos no seu plano:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span>Página e card oficial no aplicativo</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span>Botão direto para o seu WhatsApp comercial</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span>Emissão de Lista VIP digital e portaria ao vivo</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span>Simulação de corrida Uber pelos clientes</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span>Selo de Estabelecimento Verificado Oficial</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span>Relatório de visualizações e leads em tempo real</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setIsCheckoutModalOpen(true)}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 px-5 py-2.5 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
                    >
                      <Crown className="h-4 w-4" />
                      <span>Fazer Upgrade de Plano ou Renovar</span>
                    </button>

                    <a
                      href="https://wa.me/5511999998888?text=Ol%C3%A1!%20Gostaria%20de%20falar%20sobre%20minha%20assinatura%20SaaS%20no%20Radar%20do%20Rol%C3%AA"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Phone className="h-4 w-4 text-emerald-400" />
                      <span>Falar com Gerente de Conta</span>
                    </a>
                  </div>
                </div>

                {/* Instant Pix & Invoice Box */}
                <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <QrCode className="h-5 w-5" />
                      <span className="text-xs font-black uppercase tracking-wider">Pix Direto de Ativação</span>
                    </div>
                    <h4 className="text-base font-black text-white">Chave Pix da Plataforma</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Pague ou renove sua mensalidade de forma instantânea sem taxa de intermediação.
                    </p>

                    <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
                      <span className="text-[10px] text-emerald-300 font-bold block uppercase">Chave Pix Oficial:</span>
                      <code className="text-xs font-black text-emerald-200 block mt-1 select-all break-all">
                        thiagooriginal2002@gmail.com
                      </code>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("thiagooriginal2002@gmail.com");
                        setCopiedPix(true);
                        setTimeout(() => setCopiedPix(false), 2500);
                      }}
                      className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-black text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                    >
                      {copiedPix ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{copiedPix ? "Chave Copiada com Sucesso!" : "Copiar Chave Pix"}</span>
                    </button>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5">
                    <span className="text-[11px] text-slate-500 block">
                      Após o pagamento via Pix, seu comprovante é validado automaticamente e o status do plano é atualizado instantaneamente.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Partner Isolated Performance & Insights Modal (Exclusivo do Estabelecimento) */}
          <PartnerAnalyticsModal
            isOpen={isAnalyticsOpen}
            onClose={() => setIsAnalyticsOpen(false)}
            venues={[activeVenue]}
            initialVenueId={activeVenue.id}
            isPartnerOnly={true}
          />

          {/* Modal to Edit Venue Data */}
          <EditVenueModal
            venue={activeVenue}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onVenueUpdated={(updated) => {
              setOverriddenVenue(updated);
            }}
          />

          {/* Modal for SaaS Upgrade / Subscription */}
          <SaasCheckoutModal
            isOpen={isCheckoutModalOpen}
            onClose={() => setIsCheckoutModalOpen(false)}
            venueId={activeVenue.id}
            venueName={activeVenue.name}
            ownerName={currentUser.name}
            ownerEmail={currentUser.email}
            ownerWhatsapp={currentUser.whatsapp || activeVenue.whatsapp}
            initialPlanId={(subscription?.planId as any) || "semestral"}
            onSuccess={(newSub) => {
              setSubscription(newSub);
              setIsCheckoutModalOpen(false);
            }}
          />

          {/* Modal for Bulk WhatsApp Reminder */}
          {isBulkReminderModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
              <div className="absolute inset-0" onClick={() => setIsBulkReminderModalOpen(false)} />
              <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#0c101c] p-6 text-slate-100 shadow-[0_0_50px_rgba(16,185,129,0.3)] z-10">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                      <Phone className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-white">Disparar Lembrete WhatsApp</h3>
                      <p className="text-xs text-emerald-300 font-bold">{activeVenue.name}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBulkReminderModalOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                    <span className="text-slate-400 block mb-0.5">Destinatários:</span>
                    <strong className="text-white text-sm">
                      {waitingCount} clientes aguardando entrada na Lista VIP
                    </strong>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Aviso Especial da Casa (opcional):
                    </label>
                    <textarea
                      rows={3}
                      value={bulkReminderNotice}
                      onChange={(e) => setBulkReminderNotice(e.target.value)}
                      placeholder="Ex: Chegue cedo para garantir o benefício da lista até 00h30!"
                      className="w-full rounded-xl border border-white/10 bg-[#121829] p-3 text-xs text-white focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-[11px] text-emerald-300">
                    <p className="font-bold">Prévia da Mensagem:</p>
                    <p className="mt-1 text-slate-300 italic">
                      "🔥 HOJE TEM ROLÊ NO {activeVenue.name.toUpperCase()}! Lembrando que o seu nome está na lista VIP..."
                    </p>
                  </div>

                  {bulkReminderSuccess && (
                    <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/50 p-2.5 text-center text-xs font-bold text-emerald-300 animate-in fade-in">
                      ✓ Lembrete disparado com sucesso via WhatsApp!
                    </div>
                  )}

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleDispatchBulkReminder}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-black text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-98 cursor-pointer"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Enviar Lembrete para Clientes Aguardando</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBulkReminderModalOpen(false)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal for Portaria QR Code Camera Scanner */}
          <PortariaQrScannerModal
            isOpen={isQrScannerOpen}
            onClose={() => setIsQrScannerOpen(false)}
            venueName={activeVenue.name}
            leads={partnerLeads}
            onCheckInLead={(leadId) => {
              handleToggleCheckin(leadId, "confirmed", true);
            }}
          />
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW: B2B COMMERCIAL LANDING PAGE & REGISTRATION PORTAL
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 selection:bg-purple-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070a11]/90 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-fuchsia-600 to-purple-600 text-lg shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              🏢
            </div>
            <div>
              <span className="text-base font-black text-white">Radar do Rolê</span>
              <span className="ml-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[9px] font-black text-purple-300 uppercase">
                Parceiros
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              ← Voltar ao App do Rolê
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 text-center border-b border-white/5 bg-gradient-to-b from-purple-950/20 via-[#0a0f1d] to-[#070a11]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-950/40 px-3.5 py-1 text-xs font-black text-purple-300 mb-4 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Portal Oficial para Donos & Promoters de São Paulo</span>
          </span>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Divulgue sua Casa Noturna, Bar ou Motel para quem está{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-400">
              decidindo o rolê agora
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Mais de **10.000 jovens e casais** pesquisam pelo celular onde curtir a noite paulistana no Radar do Rolê.
            Coloque sua casa no topo, receba contatos diretos no WhatsApp e lote sua pista com lista VIP digital.
          </p>

          {/* Quick Metrics Badges */}
          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xl sm:text-2xl font-black text-cyan-400">+10k</div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Baladeiros/mês</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xl sm:text-2xl font-black text-fuchsia-400">84%</div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Decidem no mesmo dia</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">Direto</div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">No seu WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-xl">
          {/* Switcher: Já sou Parceiro (Login) vs Quero Divulgar (Cadastro) */}
          <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1.5">
            <button
              onClick={() => setAuthMode("register")}
              className={`rounded-xl py-3 text-xs font-black transition-all ${
                authMode === "register"
                  ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Quero Divulgar Meu Local
            </button>
            <button
              onClick={() => setAuthMode("login")}
              className={`rounded-xl py-3 text-xs font-black transition-all ${
                authMode === "login"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Já sou Parceiro (Entrar)
            </button>
          </div>

          {/* FORM 1: LOGIN */}
          {authMode === "login" && (
            !showPartnerManual ? (
                <div className="mt-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0c1322] via-[#090d18] to-[#070a12] p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-600 to-fuchsia-600 text-3xl font-black text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] mb-3">
                    🏢
                  </div>

                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="rounded-full bg-cyan-500/15 border border-cyan-400/30 px-2.5 py-0.5 text-[10px] font-black text-cyan-300 uppercase tracking-wider">
                      Portaria & Gestão
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white">
                    Olá, {partnerSavedCreds?.businessName || partnerSavedCreds?.name || "Parceiro Oficial"}!
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs mx-auto">
                    {partnerSavedCreds?.email || "Autenticação rápida para liberação da casa"}
                  </p>

                  {/* Big Pulsing Biometric Scanner */}
                  <div className="my-7 flex flex-col items-center justify-center">
                    <button
                      type="button"
                      onClick={handlePartnerBiometricLogin}
                      disabled={partnerBioLoading}
                      className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-cyan-400/60 bg-cyan-950/40 hover:bg-cyan-900/50 hover:border-cyan-300 active:scale-95 transition-all shadow-[0_0_35px_rgba(6,182,212,0.4)] cursor-pointer group"
                      title="Toque para validar a digital"
                    >
                      <span className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-60" />
                      <span className="absolute -inset-2.5 rounded-full border border-purple-500/30 animate-pulse" />

                      {partnerBioSuccess ? (
                        <div className="flex flex-col items-center justify-center text-emerald-400">
                          <Check className="h-12 w-12 stroke-[3]" />
                        </div>
                      ) : (
                        <Fingerprint
                          className={`h-12 w-12 text-cyan-400 group-hover:scale-110 transition-transform ${
                            partnerBioLoading ? "animate-pulse text-cyan-200 scale-110" : ""
                          }`}
                        />
                      )}
                    </button>

                    <div className="mt-4">
                      <span className="text-xs font-black text-cyan-300 block">
                        {partnerBioLoading
                          ? "Toque no sensor do seu celular..."
                          : partnerBioSuccess
                          ? "Digital validada! Abrindo Portaria..."
                          : "Toque na digital para entrar"}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Igual ao seu banco: impressão digital ou Face ID
                      </span>
                    </div>
                  </div>

                  {/* Alternative actions */}
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowPartnerManual(true)}
                      className="w-full py-2.5 px-3 rounded-xl border border-white/15 bg-white/5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    >
                      Entrar com e-mail e senha
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        clearSavedCredentials();
                        setPartnerSavedCreds(null);
                        setLoginEmail("");
                        setShowPartnerManual(true);
                      }}
                      className="text-[11px] text-slate-400 hover:text-rose-400 underline block mx-auto cursor-pointer"
                    >
                      Entrar com outra conta
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW 2: MANUAL FORM */
                <div className="mt-6 rounded-3xl border border-cyan-500/30 bg-[#0c101c] p-6 shadow-2xl">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-black text-white">Acesso com e-mail e senha</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPartnerManual(false);
                        handlePartnerBiometricLogin();
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
                    >
                      <Fingerprint className="h-3.5 w-3.5" />
                      <span>Voltar para a Digital</span>
                    </button>
                  </div>

                  {loginError && (
                    <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
                      {loginError}
                    </div>
                  )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                    E-mail do Estabelecimento
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="gestao@seuestabelecimento.com.br"
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Checkboxes: Salvar Login & Biometria */}
                <div className="space-y-2 pt-1 pb-1">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={partnerRememberMe}
                      onChange={(e) => setPartnerRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-500"
                    />
                    <span>Salvar login da casa neste aparelho</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={partnerEnableBio}
                      onChange={(e) => setPartnerEnableBio(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-500"
                    />
                    <span className="flex items-center gap-1.5 text-cyan-300">
                      <Fingerprint className="h-3.5 w-3.5" />
                      Habilitar entrada com digital (Biometria)
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-sm font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  <span>{loginLoading ? "Entrando..." : "Acessar Meu Painel"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Demo 1-Click for Partner */}
              <div className="mt-6 border-t border-white/10 pt-4 text-center">
                <button
                  type="button"
                  onClick={handleDemoPartnerLogin}
                  className="w-full py-2.5 px-3 rounded-xl border border-cyan-500/30 bg-cyan-950/30 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
                >
                  ⚡ Acesso Rápido de Teste (Parceiro Demo)
                </button>
              </div>
            </div>
            )
          )}

          {/* FORM 2: REGISTER */}
          {authMode === "register" && (
            <div className="mt-6 rounded-3xl border border-purple-500/30 bg-[#0c101c] p-6 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-xl font-black text-white">Cadastre seu Estabelecimento</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Preencha os dados da sua casa para começar a receber clientes
                </p>
              </div>

              {registerError && (
                <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
                  {registerError}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Nome do Estabelecimento */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                    Nome da Casa Noturna, Bar ou Motel *
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Ex: Villa Madá Club"
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Nome do Responsável */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                    Nome do Responsável / Promoter *
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                    required
                  />
                </div>

                {/* Categoria e Bairro */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                      Tipo de Local *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-white/15 bg-[#121829] py-2.5 px-3 text-xs text-white focus:border-purple-400 focus:outline-none"
                    >
                      <option value="baladas">🪩 Balada / Casa Noturna</option>
                      <option value="restaurantes">🍸 Bar / Gastronomia</option>
                      <option value="moteis">🔥 Motel Design</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                      Bairro em SP *
                    </label>
                    <select
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-[#121829] py-2.5 px-3 text-xs text-white focus:border-purple-400 focus:outline-none"
                    >
                      {NEIGHBORHOODS.map((n) => (
                        <option key={n.name} value={n.name}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* WhatsApp Comercial */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                    WhatsApp Comercial / Portaria *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                      placeholder="(11) 99999-8888"
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* E-mail e Senha */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                      E-mail de Contato *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="gestao@suacasa.com"
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                      Senha de Acesso *
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Plano de Parceria & Cobrança Recorrente */}
                <div className="pt-2 border-t border-white/10 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-300">
                        Plano de Parceria Oficial
                      </label>
                      <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
                        R$ 59,00/MÊS RECORRENTE
                      </span>
                    </div>

                    <div className="rounded-2xl border border-purple-500/40 bg-purple-500/10 p-3.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-black text-white">{OFFICIAL_PLAN_NAME}</div>
                          <div className="text-[10px] text-purple-300">Destaque garantido, Lista VIP ilimitada e scanner na portaria</div>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-emerald-400">R$ {OFFICIAL_PLAN_PRICE}</span>
                          <span className="text-[10px] text-slate-400">/mês</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seleção do Dia de Pagamento Mensal */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1.5 block">
                      Data de Pagamento Mensal (Vencimento todo mês):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {([10, 20, 30] as DueDay[]).map((day) => {
                        const isSelected = partnerDueDay === day;
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => setPartnerDueDay(day)}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? "border-cyan-400 bg-cyan-950/40 text-white ring-1 ring-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                                : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                            }`}
                          >
                            <span className="text-sm font-black block">Dia {day}</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">Vencimento</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Forma de Pagamento */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1.5 block">
                      Forma de Cobrança:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPartnerPaymentMethod("credit_card")}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          partnerPaymentMethod === "credit_card"
                            ? "border-purple-400 bg-purple-950/40 text-white ring-1 ring-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                            : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span className="text-xs font-black block">💳 Cartão Recorrente</span>
                        <span className="text-[9px] text-purple-300 block">Cobrança no dia {partnerDueDay}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPartnerPaymentMethod("pix")}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          partnerPaymentMethod === "pix"
                            ? "border-emerald-400 bg-emerald-950/40 text-white ring-1 ring-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span className="text-xs font-black block">⚡ Pix Recorrente</span>
                        <span className="text-[9px] text-emerald-300 block">Aviso no dia {partnerDueDay}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Termos de Parceria & Responsabilidade Civil e Consumerista */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-[11px] text-slate-300 space-y-2 mt-4">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-purple-600 shrink-0"
                    />
                    <span className="leading-tight text-slate-300 text-[11px]">
                      Declaro que sou o titular ou representante legal da casa e concordo com os{" "}
                      <strong className="text-purple-400">Termos de Parceria & Contrato SaaS</strong>. O estabelecimento assume inteira e exclusiva responsabilidade civil, sanitária e consumerista pela veracidade dos dados, recepção dos clientes e cumprimento dos benefícios de Lista VIP prometidos.
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 py-3.5 text-sm font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(168,85,247,0.5)] cursor-pointer mt-4"
                >
                  <span>
                    {registerLoading
                      ? "Cadastrando Local..."
                      : `Publicar Meu Estabelecimento (R$ 59/mês • Dia ${partnerDueDay})`}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Plan Details & Features Table */}
      <section className="py-12 px-4 sm:px-6 border-t border-white/5 bg-[#0a0e1c]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Planos Transparentes para Impulsionar sua Casa
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Sem taxas escondidas. Cancele ou altere seu plano quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl border p-6 flex flex-col justify-between ${
                  plan.highlight
                    ? "border-purple-500 bg-gradient-to-b from-purple-950/30 to-[#0e1424] shadow-[0_0_35px_rgba(168,85,247,0.2)]"
                    : "border-white/10 bg-[#0c101c]"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-0.5 text-[10px] font-black text-white shadow-md">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-black text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{plan.billingText}</p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-400">R$</span>
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400">{plan.period}</span>
                  </div>

                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    setAuthMode("register");
                    window.scrollTo({ top: 500, behavior: "smooth" });
                  }}
                  className={`mt-6 w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                    plan.highlight
                      ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:bg-purple-500"
                      : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  Escolher Plano {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Radar do Rolê • Portal de Parceiros de São Paulo.</p>
      </footer>
    </div>
  );
}
