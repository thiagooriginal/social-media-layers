import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldAlert,
  Crown,
  Building2,
  Users,
  Ticket,
  TrendingUp,
  Search,
  ExternalLink,
  Plus,
  LogOut,
  Sparkles,
  CheckCircle2,
  Phone,
  Flame,
  Filter,
  DollarSign,
  ArrowLeft,
  Calendar,
  Layers,
  MapPin,
  RefreshCw,
  BarChart3,
  Edit3,
  Trash2,
  CreditCard,
  Wallet,
  Send,
  Check,
  Copy,
  Sliders,
  Download,
  Key,
  Lock,
  Fingerprint,
  MessageSquare,
  Bot,
  Radio,
  Printer,
  FileSpreadsheet,
  FileText,
  QrCode,
  Wifi,
  WifiOff,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  UserProfile,
  getSavedCredentials,
  saveCredentials,
} from "../services/authService";
import {
  authenticateWithBiometrics,
  registerDeviceBiometrics,
} from "../services/biometricService";
import {
  getWhatsAppConfig,
  saveWhatsAppConfig,
  WhatsAppConfig,
  getWhatsAppNotificationLogs,
  WhatsAppNotificationLog,
  buildClientVipPassMessage,
  buildVenueNewLeadAlertMessage,
  buildPortariaCheckInMessage,
  buildBulkReminderMessage,
  buildSaasBillingMessage,
  dispatchWhatsAppNotification,
  openWhatsAppDirect,
} from "../services/whatsappService";
import {
  checkEvolutionConnection,
  createEvolutionInstance,
  getEvolutionQrCode,
  restartEvolutionInstance,
  EvolutionConnectionStatus,
} from "../services/evolutionApi";
import { Venue, VENUES_DATA } from "../data/venues";
import { supabase } from "../integrations/supabase/client";
import { RegisterVenueModal } from "../components/RegisterVenueModal";
import { PartnerAnalyticsModal } from "../components/PartnerAnalyticsModal";
import { getVenueMetrics } from "../services/analyticsService";
import { EditVenueModal } from "../components/EditVenueModal";
import { AdminVisualDashboard } from "../components/AdminVisualDashboard";
import { deleteVenue } from "../services/venueService";
import {
  calculateSaasMetrics,
  getSaasProjections,
  getStoredSubscriptions,
  getGatewayConfig,
  saveGatewayConfig,
  generatePartnerBillingWhatsAppLink,
  SaasSubscription,
  GatewayConfig,
  SAAS_PLANS,
  buildSaasPixDueNoticeMessage,
  buildSaasCardChargeSuccessMessage,
  buildSaasCardChargeFailedMessage,
  processCardRecurringCharge,
  DueDay,
  OFFICIAL_PLAN_NAME,
  OFFICIAL_PLAN_PRICE,
  OFFICIAL_PIX_KEY,
  switchSubscriptionTier,
  isSubscriptionPremium,
  PlanTier,
  STANDARD_PLAN_PRICE,
  PREMIUM_PLAN_PRICE,
} from "../services/saasBillingService";
import { getVenueFavoritesStats } from "../services/favoritesPermissionService";

export const Route = createFileRoute("/admin")({
  component: AdminDashboardPage,
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

interface ConfirmationRow {
  id: string;
  venue_id: string;
  user_name?: string;
  created_at: string;
}

function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [adminEmail, setAdminEmail] = useState("thiagooriginal2002@gmail.com");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Biometrics & Saved credentials for Super Admin
  const [adminRememberMe, setAdminRememberMe] = useState(true);
  const [adminEnableBio, setAdminEnableBio] = useState(true);
  const [adminBioLoading, setAdminBioLoading] = useState(false);
  const [adminBioSuccess, setAdminBioSuccess] = useState(false);

  // Dashboard Data State
  const [venues, setVenues] = useState<Venue[]>(VENUES_DATA);
  const [leads, setLeads] = useState<VipLeadRow[]>([]);
  const [confirmations, setConfirmations] = useState<ConfirmationRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "venues" | "leads" | "confirmations" | "analytics" | "saas" | "whatsapp">("dashboard");

  // Edit Venue state
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [isEditVenueModalOpen, setIsEditVenueModalOpen] = useState(false);

  // SaaS Subscriptions & Gateway state
  const [subscriptions, setSubscriptions] = useState<SaasSubscription[]>(() => getStoredSubscriptions());
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfig>(() => getGatewayConfig());
  const [gatewaySaveToast, setGatewaySaveToast] = useState(false);
  const [subStatusFilter, setSubStatusFilter] = useState<string>("all");
  const [copiedSubId, setCopiedSubId] = useState<string | null>(null);

  // WhatsApp Hub State
  const [waConfig, setWaConfig] = useState<WhatsAppConfig>(() => getWhatsAppConfig());
  const [waSaveToast, setWaSaveToast] = useState(false);
  const [waTestPhone, setWaTestPhone] = useState("11999998888");
  const [waTestType, setWaTestType] = useState<
    "pass" | "new_lead" | "checkin" | "reminder" | "billing" | "billing_pix" | "billing_card_ok" | "billing_card_fail"
  >("pass");
  const [waTestSending, setWaTestSending] = useState(false);
  const [waTestFeedback, setWaTestFeedback] = useState<string | null>(null);
  const [waLogs, setWaLogs] = useState<WhatsAppNotificationLog[]>(() => getWhatsAppNotificationLogs());

  // Evolution API Live Integration State
  const [waConnectionStatus, setWaConnectionStatus] = useState<EvolutionConnectionStatus | null>(null);
  const [waCheckingConnection, setWaCheckingConnection] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [waQrCode, setWaQrCode] = useState<string | null>(null);
  const [waQrLoading, setWaQrLoading] = useState(false);
  const [waQrError, setWaQrError] = useState<string | null>(null);
  const [waCreatingInstance, setWaCreatingInstance] = useState(false);
  const [waInstanceFeedback, setWaInstanceFeedback] = useState<string | null>(null);
  const [waQrCountdown, setWaQrCountdown] = useState<number>(20);
  const [waResettingInstance, setWaResettingInstance] = useState(false);
  const [isEvolutionGuideOpen, setIsEvolutionGuideOpen] = useState(false);

  // Analytics tab state (Super Admin global audit)
  const [isAdminAnalyticsModalOpen, setIsAdminAnalyticsModalOpen] = useState(false);
  const [selectedAnalyticsVenueId, setSelectedAnalyticsVenueId] = useState<string>(() => VENUES_DATA[0]?.id || "");

  // Venue filters inside admin
  const [venueSearch, setVenueSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal for new venue
  const [isNewVenueModalOpen, setIsNewVenueModalOpen] = useState(false);

  const isAdmin = currentUser?.role === "admin";

  // Selected venue details for admin inspection
  const selectedVenueDetails = useMemo(() => {
    return venues.find((v) => v.id === selectedAnalyticsVenueId) || venues[0];
  }, [venues, selectedAnalyticsVenueId]);

  // Selected venue metrics
  const selectedVenueMetrics = useMemo(() => {
    if (!selectedVenueDetails) {
      return {
        venueId: "",
        venueName: "",
        impressionsFeed: 0,
        profileClicks: 0,
        whatsappShares: 0,
        whatsappDirectClicks: 0,
        vipListLeads: 0,
        uberSimulations: 0,
        conversionRate: 0,
        weeklyGrowth: 0,
      };
    }
    return getVenueMetrics(selectedVenueDetails.id, selectedVenueDetails.name);
  }, [selectedVenueDetails]);

  // Global aggregate metrics computed across all active venues
  const { totalGlobalViews, totalGlobalWhatsapp, totalGlobalLeads, totalGlobalUber } = useMemo(() => {
    let views = 0;
    let whatsapp = 0;
    let vip = 0;
    let uber = 0;

    venues.forEach((v) => {
      const m = getVenueMetrics(v.id, v.name);
      views += m.impressionsFeed;
      whatsapp += m.whatsappDirectClicks;
      vip += m.vipListLeads;
      uber += m.uberSimulations;
    });

    return {
      totalGlobalViews: views,
      totalGlobalWhatsapp: whatsapp,
      totalGlobalLeads: vip,
      totalGlobalUber: uber,
    };
  }, [venues]);

  // Load Admin Data from Supabase
  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      // 1. Fetch Venues
      const { data: venuesData } = await (supabase as any)
        .from("venues")
        .select("*")
        .order("name", { ascending: true });
      if (venuesData && venuesData.length > 0) {
        setVenues(venuesData);
      }

      // 2. Fetch VIP Leads
      const { data: leadsData } = await (supabase as any)
        .from("vip_list_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (leadsData) {
        setLeads(leadsData);
      }

      // 3. Fetch Confirmations
      const { data: confData } = await (supabase as any)
        .from("event_confirmations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (confData) {
        setConfirmations(confData);
      }
    } catch (err) {
      console.warn("Could not load full admin data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  // Biometric Login for Super Admin
  const handleAdminBiometricLogin = async () => {
    setAuthError("");
    setAdminBioLoading(true);
    const res = await authenticateWithBiometrics("admin");
    setAdminBioLoading(false);

    if (res.success && res.user) {
      setAdminBioSuccess(true);
      setTimeout(() => {
        setCurrentUser({
          ...res.user!,
          role: "admin",
        });
      }, 400);
    } else {
      setAuthError(res.error || "Não foi possível validar a digital de Administrador.");
    }
  };

  // Admin Login Handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    const res = await loginUser(adminEmail, adminPassword);
    setAuthLoading(false);

    if (res.success && res.user) {
      if (res.user.role === "admin" || adminEmail.includes("thiagooriginal2002")) {
        const adminUser: UserProfile = {
          ...res.user,
          role: "admin",
        };
        if (adminRememberMe) {
          saveCredentials({
            email: adminUser.email,
            name: adminUser.name,
            role: "admin",
            rememberMe: true,
            biometricsEnabled: adminEnableBio,
          });
          if (adminEnableBio) {
            registerDeviceBiometrics(adminUser);
          }
        }
        setCurrentUser(adminUser);
      } else {
        setAuthError("Esta conta não possui permissão de Super Administrador.");
      }
    } else {
      setAuthError(res.error || "Credenciais inválidas.");
    }
  };

  // Quick 1-Click Master Access for Thiago
  const handleQuickMasterLogin = async () => {
    setAuthLoading(true);
    const res = await loginUser("thiagooriginal2002@gmail.com");
    setAuthLoading(false);
    if (res.success && res.user) {
      setCurrentUser({
        ...res.user,
        role: "admin",
      });
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  // Filtered Venues
  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      const matchSearch =
        v.name.toLowerCase().includes(venueSearch.toLowerCase()) ||
        v.neighborhood.toLowerCase().includes(venueSearch.toLowerCase()) ||
        v.subType?.toLowerCase().includes(venueSearch.toLowerCase());
      const matchCategory = selectedCategory === "all" || v.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [venues, venueSearch, selectedCategory]);

  // Financial Metrics Calculation
  const estimatedMRR = useMemo(() => {
    return venues.reduce((acc, v) => acc + (v.planPrice || 59), 0);
  }, [venues]);

  // Executive SaaS Metrics & Projections
  const saasMetrics = useMemo(() => {
    return calculateSaasMetrics(venues.length);
  }, [venues.length, subscriptions]);

  const saasProjections = useMemo(() => {
    return getSaasProjections();
  }, []);

  // Delete Venue Handler
  const handleDeleteVenue = async (venueId: string, venueName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${venueName}" do catálogo? Esta ação removerá o local do aplicativo imediatamente.`)) {
      const res = await deleteVenue(venueId);
      if (res.success) {
        setVenues((prev) => prev.filter((v) => v.id !== venueId));
      } else {
        alert("Erro ao excluir local: " + (res.error || "Tente novamente"));
      }
    }
  };

  // Gateway Config Save Handler
  const handleSaveGateway = (e: React.FormEvent) => {
    e.preventDefault();
    saveGatewayConfig(gatewayConfig);
    setGatewaySaveToast(true);
    setTimeout(() => setGatewaySaveToast(false), 3000);
  };

  // WhatsApp Config Save Handler
  const handleSaveWaConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveWhatsAppConfig(waConfig);
    setWaSaveToast(true);
    setTimeout(() => setWaSaveToast(false), 3000);
  };

  // Evolution API Connection Checker
  const handleCheckEvolutionConnection = async () => {
    if (!waConfig.apiUrl || !waConfig.apiUrl.trim()) {
      alert("Por favor, preencha a URL da Evolution API antes de testar a conexão.");
      return;
    }
    setWaCheckingConnection(true);
    const status = await checkEvolutionConnection(
      waConfig.apiUrl,
      waConfig.apiKey || "",
      waConfig.instanceName || "radar-role"
    );
    setWaCheckingConnection(false);
    setWaConnectionStatus(status);
  };

  // Evolution API Create Instance
  const handleCreateEvolutionInstance = async () => {
    if (!waConfig.apiUrl || !waConfig.apiUrl.trim()) {
      alert("Por favor, informe a URL da Evolution API antes de criar a instância.");
      return;
    }
    setWaCreatingInstance(true);
    setWaInstanceFeedback(null);
    const res = await createEvolutionInstance(
      waConfig.apiUrl,
      waConfig.apiKey || "",
      waConfig.instanceName || "radar-role"
    );
    setWaCreatingInstance(false);
    setWaInstanceFeedback(res.message);
    if (res.qrcodeBase64) {
      setWaQrCode(res.qrcodeBase64);
      setIsQrModalOpen(true);
    }
    handleCheckEvolutionConnection();
  };

  // Evolution API Open QR Code Modal
  const handleOpenEvolutionQrModal = async () => {
    if (!waConfig.apiUrl || !waConfig.apiUrl.trim()) {
      alert("Por favor, informe a URL da sua Evolution API primeiro.");
      return;
    }
    setIsQrModalOpen(true);
    setWaQrLoading(true);
    setWaQrError(null);
    setWaQrCode(null);
    setWaQrCountdown(20);

    const res = await getEvolutionQrCode(
      waConfig.apiUrl,
      waConfig.apiKey || "",
      waConfig.instanceName || "radar-role"
    );

    setWaQrLoading(false);
    if (res.success && res.qrcodeBase64) {
      setWaQrCode(res.qrcodeBase64);
      setWaQrCountdown(20);
    } else {
      setWaQrError(
        res.error ||
          "Não foi possível obter o QR Code. Se a instância ainda não foi criada, clique em 'Criar Instância'."
      );
    }
  };

  // Evolution API Manual Refresh QR Code
  const handleRefreshEvolutionQr = async () => {
    if (!waConfig.apiUrl) return;
    try {
      const res = await getEvolutionQrCode(
        waConfig.apiUrl,
        waConfig.apiKey || "",
        waConfig.instanceName || "radar-role"
      );
      if (res.success && res.qrcodeBase64) {
        setWaQrCode(res.qrcodeBase64);
        setWaQrError(null);
        setWaQrCountdown(20);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Evolution API Reset Session (restart Baileys socket to reset stale counters)
  const handleResetEvolutionSession = async () => {
    if (!waConfig.apiUrl) return;
    setWaResettingInstance(true);
    setWaQrError(null);
    try {
      const res = await restartEvolutionInstance(
        waConfig.apiUrl,
        waConfig.apiKey || "",
        waConfig.instanceName || "radar-role"
      );
      if (res.success && res.qrcodeBase64) {
        setWaQrCode(res.qrcodeBase64);
        setWaQrCountdown(20);
      } else {
        // Fallback: re-fetch QR code
        await handleRefreshEvolutionQr();
      }
    } catch (err: any) {
      setWaQrError(err?.message || "Falha ao reiniciar sessão.");
    } finally {
      setWaResettingInstance(false);
    }
  };

  // QR Code Polling & Automatic Refresh Loop
  useEffect(() => {
    if (!isQrModalOpen || !waConfig.apiUrl) return;

    let counter = 20;
    const interval = setInterval(async () => {
      // 1. Connection check every 3s
      if (counter % 3 === 0) {
        const st = await checkEvolutionConnection(
          waConfig.apiUrl!,
          waConfig.apiKey || "",
          waConfig.instanceName || "radar-role"
        );
        if (st.connected) {
          setWaConnectionStatus(st);
          setTimeout(() => {
            setIsQrModalOpen(false);
          }, 2200);
          return;
        }
      }

      // 2. Decrement countdown
      counter -= 1;
      setWaQrCountdown(counter > 0 ? counter : 20);

      // 3. Auto-fetch fresh QR code when countdown reaches 0
      if (counter <= 0) {
        counter = 20;
        const res = await getEvolutionQrCode(
          waConfig.apiUrl!,
          waConfig.apiKey || "",
          waConfig.instanceName || "radar-role"
        );
        if (res.success && res.qrcodeBase64) {
          setWaQrCode(res.qrcodeBase64);
          setWaQrError(null);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isQrModalOpen, waConfig.apiUrl, waConfig.apiKey, waConfig.instanceName]);

  // WhatsApp Test Message Dispatcher
  const handleTestWhatsAppDispatch = async () => {
    setWaTestSending(true);
    setWaTestFeedback(null);

    let sampleMsg = "";
    if (waTestType === "pass") {
      sampleMsg = buildClientVipPassMessage({
        userName: "Thiago Silva (Teste)",
        venueName: "D-Edge",
        passCode: "RADAR-VIP-99",
        guestsCount: 2,
        entryBenefit: "Entrada VIP até 00h30",
        openHours: "23h00 às 06h00",
      });
    } else if (waTestType === "new_lead") {
      sampleMsg = buildVenueNewLeadAlertMessage({
        userName: "Thiago Silva",
        userWhatsapp: waTestPhone,
        venueName: "Laroc Club",
        passCode: "RADAR-VIP-123",
        guestsCount: 4,
        entryBenefit: "Vip até 00h",
      });
    } else if (waTestType === "checkin") {
      sampleMsg = buildPortariaCheckInMessage({
        userName: "Thiago Silva",
        venueName: "Komplexo TEMPO",
        passCode: "RADAR-VIP-123",
      });
    } else if (waTestType === "reminder") {
      sampleMsg = buildBulkReminderMessage({
        venueName: "Villa Country",
        clientName: "Thiago",
        specialNotice: "Show principal começa às 01h00. Chegue antes das 23h30!",
      });
    } else if (waTestType === "billing" || waTestType === "billing_pix") {
      sampleMsg = buildSaasPixDueNoticeMessage({
        ownerName: "Gerente do Estabelecimento",
        venueName: "Vila Madá Club",
        dueDay: 10,
        dueDate: "10/10/2026",
        amount: 59,
        pixKey: OFFICIAL_PIX_KEY,
        pixCode: "00020126580014br.gov.bcb.pix0136" + OFFICIAL_PIX_KEY + "52040000530398654059.005802BR5913Radar do Role6009Sao Paulo62070503***6304ABCD",
      });
    } else if (waTestType === "billing_card_ok") {
      sampleMsg = buildSaasCardChargeSuccessMessage({
        ownerName: "Gerente do Estabelecimento",
        venueName: "Vila Madá Club",
        dueDay: 10,
        amount: 59,
        cardLast4: "4242",
        nextBillingDate: "10/11/2026",
      });
    } else if (waTestType === "billing_card_fail") {
      sampleMsg = buildSaasCardChargeFailedMessage({
        ownerName: "Gerente do Estabelecimento",
        venueName: "Vila Madá Club",
        dueDay: 10,
        amount: 59,
        failureReason: "Saldo ou limite insuficiente no cartão de crédito.",
        cardLast4: "1234",
        pixKey: OFFICIAL_PIX_KEY,
        pixCode: "00020126580014br.gov.bcb.pix0136" + OFFICIAL_PIX_KEY + "52040000530398654059.005802BR5913Radar do Role6009Sao Paulo62070503***6304ABCD",
      });
    }

    const res = await dispatchWhatsAppNotification({
      recipientType: "admin_alert",
      recipientPhone: waTestPhone,
      recipientName: "Teste Admin",
      venueName: "Radar SP",
      message: sampleMsg,
    });

    setWaTestSending(false);
    if (res.success) {
      setWaTestFeedback(
        `✓ Disparado com sucesso via ${
          res.mode === "api"
            ? "Evolution API (em 2º plano, sem abrir o WhatsApp no seu aparelho)!"
            : "WhatsApp Direto (wa.me)"
        } para o número ${waTestPhone}`
      );
      setWaLogs(getWhatsAppNotificationLogs());
    } else {
      setWaTestFeedback(`Erro: ${res.error || "Não foi possível disparar."}`);
      setWaLogs(getWhatsAppNotificationLogs());
    }
  };

  // Disparo de Aviso de Vencimento Pix com Chave Oficial (Todo dia 10, 20 ou 30)
  const handleDispatchPixNotice = async (sub: SaasSubscription) => {
    const msg = buildSaasPixDueNoticeMessage({
      ownerName: sub.ownerName,
      venueName: sub.venueName,
      dueDay: sub.dueDay || 10,
      dueDate: sub.nextBillingDate,
      amount: sub.monthlyValue || 59,
      pixKey: OFFICIAL_PIX_KEY,
      pixCode: sub.pixCopiaECola,
    });

    if (waConfig.mode === "api") {
      const res = await dispatchWhatsAppNotification({
        recipientType: "partner_billing",
        recipientPhone: sub.ownerWhatsapp,
        recipientName: sub.ownerName,
        venueName: sub.venueName,
        message: msg,
      });
      if (res.success) {
        alert(
          `✓ Aviso Pix enviado com sucesso para ${sub.ownerName} (${sub.ownerWhatsapp})! Chave Pix: ${OFFICIAL_PIX_KEY}`
        );
      } else {
        alert(`Erro no disparo via Evolution API: ${res.error || "Falha na comunicação."}`);
      }
    } else {
      openWhatsAppDirect(sub.ownerWhatsapp, msg);
    }
    setWaLogs(getWhatsAppNotificationLogs());
  };

  // Processamento e Validação da Cobrança de Cartão Recorrente (Aprovação ou Simulação de Falha)
  const handleProcessCardChargeAction = async (
    sub: SaasSubscription,
    simulation: "approve" | "decline_funds" | "decline_cancelled"
  ) => {
    const result = processCardRecurringCharge(sub.id, simulation);
    setSubscriptions(getStoredSubscriptions());

    if (waConfig.mode === "api") {
      const res = await dispatchWhatsAppNotification({
        recipientType: "partner_billing",
        recipientPhone: sub.ownerWhatsapp,
        recipientName: sub.ownerName,
        venueName: sub.venueName,
        message: result.message,
      });
      if (res.success) {
        if (simulation === "approve") {
          alert(`✅ Cobrança de R$ 59,00 Aprovada no cartão de ${sub.venueName}! Comprovante enviado via WhatsApp.`);
        } else {
          alert(
            `⚠️ Falha registrada: "${result.reason}". Alerta com chave Pix oficial para regularização imediata enviado no WhatsApp de ${sub.ownerName}.`
          );
        }
      } else {
        alert(`Status atualizado no sistema, mas erro ao enviar WhatsApp: ${res.error}`);
      }
    } else {
      openWhatsAppDirect(sub.ownerWhatsapp, result.message);
    }
    setWaLogs(getWhatsAppNotificationLogs());
  };

  // Quick WhatsApp Billing Action for any Partner (Legado mantido para compatibilidade)
  const handleQuickBillingWhatsApp = async (sub: SaasSubscription) => {
    if (sub.paymentMethod === "credit_card" && sub.lastChargeStatus === "failed") {
      await handleProcessCardChargeAction(sub, "decline_funds");
    } else if (sub.paymentMethod === "credit_card") {
      await handleProcessCardChargeAction(sub, "approve");
    } else {
      await handleDispatchPixNotice(sub);
    }
  };

  // Toggle Subscription Status Handler
  const handleToggleSubStatus = (subId: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === subId) {
          const nextStatus: SaasSubscription["status"] =
            s.status === "active" ? "pending_payment" : "active";
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  // Toggle Subscription Tier Handler (Standard R$ 59 vs Premium R$ 89)
  const handleToggleSubscriptionTier = (subId: string) => {
    const targetSub = subscriptions.find((s) => s.id === subId);
    if (!targetSub) return;
    const nextTier: PlanTier = targetSub.tier === "premium" ? "standard" : "premium";
    const updated = switchSubscriptionTier(subId, nextTier);
    if (updated) {
      setSubscriptions(getStoredSubscriptions());
    }
  };

  // Switch tab with smooth auto-scroll to section
  const handleSwitchTab = (tab: "dashboard" | "venues" | "leads" | "confirmations" | "analytics" | "saas" | "whatsapp") => {
    setActiveTab(tab);
    setTimeout(() => {
      const el = document.getElementById("admin-tab-content");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  // Export Complete Executive Report to CSV (Excel compatible)
  const handleExportMasterCSV = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR");
    const timeStr = now.toLocaleTimeString("pt-BR");

    let csv = "\uFEFF"; // UTF-8 BOM for Microsoft Excel
    csv += "========================================================\n";
    csv += "RADAR DO ROLÊ - RELATÓRIO MASTER EXECUTIVO OFICIAL\n";
    csv += `Data de Emissão: ${dateStr} às ${timeStr}\n`;
    csv += `Super Administrador: ${currentUser?.email || "thiagooriginal2002@gmail.com"}\n`;
    csv += "========================================================\n\n";

    csv += "--- RESUMO GERAL DAS MÉTRICAS EM SÃO PAULO ---\n";
    csv += `Total de Locais Cadastrados;${venues.length}\n`;
    csv += `Total Visualizações no Feed;${totalGlobalViews}\n`;
    csv += `Total Cliques Diretos WhatsApp;${totalGlobalWhatsapp}\n`;
    csv += `Total Nomes em Listas VIP;${leads.length > 0 ? leads.length : totalGlobalLeads}\n`;
    csv += `Total Rotas Uber Simuladas;${totalGlobalUber}\n`;
    csv += `MRR Mensal Recorrente Projetado;R$ ${saasMetrics.mrr},00\n`;
    csv += `ARR Anual Projetado;R$ ${saasMetrics.arr},00\n`;
    csv += `Parceiros Ativos com Assinatura;${saasMetrics.activeSubscriptionsCount}\n\n`;

    csv += "--- TABELA DE ESTABELECIMENTOS & DESEMPENHO ---\n";
    csv += "ID;Nome;Categoria;Bairro;Plano;Valor Mensal (R$);Nota;Avaliações;Visualizações;Cliques WhatsApp;Leads VIP;Rotas Uber;Crescimento Semanal;WhatsApp Oficial\n";
    venues.forEach((v) => {
      const m = getVenueMetrics(v.id, v.name);
      csv += `"${v.id}";"${v.name}";"${v.category}";"${v.neighborhood}";"${v.plan || "Semestral"}";"${v.planPrice || 59}";"${v.rating}";"${v.reviewsCount}";"${m.impressionsFeed}";"${m.whatsappDirectClicks}";"${m.vipListLeads}";"${m.uberSimulations}";"+${m.weeklyGrowth}%";"${v.whatsapp || ""}"\n`;
    });

    csv += "\n--- TABELA DE LEADS DE LISTAS VIP CAPTADOS ---\n";
    csv += "ID Lead;Nome do Cliente;WhatsApp;Estabelecimento;Acompanhantes;Data Evento;Status;Data Cadastro\n";
    leads.forEach((l) => {
      csv += `"${l.id}";"${l.user_name}";"${l.user_whatsapp}";"${l.venue_name}";"+${l.guests_count}";"${l.event_date}";"${l.status}";"${new Date(l.created_at).toLocaleDateString("pt-BR")}"\n`;
    });

    csv += "\n--- PROJEÇÃO FINANCEIRA SAAS (12 MESES) ---\n";
    csv += "Mês;Parceiros Estimados;Conservador (8%);Realista (15%);Agressivo (22%)\n";
    saasProjections.forEach((p) => {
      csv += `"${p.month}";"${p.activeVenues}";"R$ ${p.conservativeMRR}";"R$ ${p.realisticMRR}";"R$ ${p.aggressiveMRR}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `radar_do_role_relatorio_executivo_${now.toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Executive Report via Browser Native Dialog
  const handlePrintExecutiveReport = () => {
    window.print();
  };

  // =========================================================================
  // VIEW 1: ADMIN LOGIN SCREEN (If not authenticated as admin)
  // =========================================================================
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#06080f] text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-amber-600/20 via-purple-600/20 to-cyan-500/20 blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md rounded-3xl border border-amber-500/30 bg-[#0c101c] p-7 shadow-[0_0_60px_-15px_rgba(245,158,11,0.3)] z-10 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-purple-600 to-cyan-500 shadow-[0_0_30px_rgba(245,158,11,0.5)] text-3xl">
              👑
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span>Painel Master</span>
              <span className="text-amber-400">Admin</span>
            </h1>
            <p className="mt-1 text-xs text-slate-400 font-medium">
              Radar do Rolê • Acesso Restrito aos Donos da Plataforma
            </p>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
              {authError}
            </div>
          )}

          {/* Biometric Quick Login for Master Admin */}
          <div className="mt-5 space-y-2.5">
            <button
              type="button"
              onClick={handleAdminBiometricLogin}
              disabled={adminBioLoading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-950/60 via-purple-950/40 to-amber-950/60 py-3 px-4 text-sm font-black text-amber-300 hover:text-white hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-95 transition-all cursor-pointer group"
            >
              <div className="relative flex items-center justify-center">
                <Fingerprint
                  className={`h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform ${
                    adminBioLoading ? "animate-pulse" : ""
                  }`}
                />
                {adminBioSuccess && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <span>
                {adminBioLoading
                  ? "Posicione o dedo no sensor..."
                  : adminBioSuccess
                  ? "Digital Master Reconhecida!"
                  : "Entrar com Digital Master (Biometria)"}
              </span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500">
                ou digite as credenciais
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="mt-4 space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                E-mail do Administrador
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@radardorole.com.br"
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:bg-white/10 focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                Senha Master
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:bg-white/10 focus:outline-none transition-all"
              />
            </div>

            {/* Checkboxes: Salvar Login & Biometria */}
            <div className="space-y-2 pt-1 pb-1">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={adminRememberMe}
                  onChange={(e) => setAdminRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-500"
                />
                <span>Salvar credenciais Master neste dispositivo</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={adminEnableBio}
                  onChange={(e) => setAdminEnableBio(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-500"
                />
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Fingerprint className="h-3.5 w-3.5" />
                  Habilitar entrada com digital Master
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-500 py-3 text-sm font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer"
            >
              <span>{authLoading ? "Validando Acesso..." : "Acessar Portal Master"}</span>
              <Crown className="h-4 w-4" />
            </button>
          </form>

          {/* 1-Click Fast Pass for Thiago */}
          <div className="mt-6 border-t border-white/10 pt-4 text-center">
            <button
              type="button"
              onClick={handleQuickMasterLogin}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 py-2.5 px-3 text-xs font-black text-amber-300 hover:bg-amber-500/20 hover:border-amber-300 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              <span>⚡ Acesso Rápido Master (Thiago Admin)</span>
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar ao App Público</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED SUPER ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-[#0a0e1c]/95 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-purple-600 text-xl shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white">Radar do Rolê</h1>
                <span className="rounded-full bg-amber-500/20 border border-amber-500/50 px-2 py-0.5 text-[10px] font-black text-amber-300 uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Portal de Gestão & Inteligência Master</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              disabled={isLoadingData}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              title="Atualizar dados em tempo real"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingData ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-2.5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all shadow-sm"
              title="Ver aplicativo no ar"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Abrir App</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 px-2.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all"
              title="Sair do painel de administração"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Estabelecimentos */}
          <div className="rounded-2xl border border-purple-500/30 bg-[#0e1424] p-4 shadow-[0_0_25px_rgba(168,85,247,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                Locais Ativos
              </span>
              <Building2 className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-white">{venues.length}</div>
            <p className="mt-1 text-[11px] text-slate-400">Baladas, Bares e Motéis de SP</p>
          </div>

          {/* Card 2: Leads VIP */}
          <div className="rounded-2xl border border-cyan-500/30 bg-[#0e1424] p-4 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                Leads Lista VIP
              </span>
              <Ticket className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-white">{leads.length}</div>
            <p className="mt-1 text-[11px] text-slate-400">Contatos captados para portarias</p>
          </div>

          {/* Card 3: Presenças ("Eu Vou") */}
          <div className="rounded-2xl border border-rose-500/30 bg-[#0e1424] p-4 shadow-[0_0_25px_rgba(244,63,94,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
                Presenças ("Eu Vou")
              </span>
              <Flame className="h-4 w-4 text-rose-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-white">{confirmations.length}</div>
            <p className="mt-1 text-[11px] text-slate-400">Cliques com presença confirmada</p>
          </div>

          {/* Card 4: Faturamento Estimado (MRR) */}
          <div className="rounded-2xl border border-amber-500/30 bg-[#0e1424] p-4 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                MRR Projetado
              </span>
              <DollarSign className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-400">
              R$ {estimatedMRR.toLocaleString("pt-BR")},00
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Potencial de mensalidades ativas</p>
          </div>
        </div>

        {/* Quick Access Top Bar (Crucial for mobile and desktop) */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0e1424] to-cyan-950/40 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-black text-white">Módulos & Ferramentas Master</p>
              <p className="text-[10px] text-slate-400">Acesse em 1 toque as automações e relatórios:</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSwitchTab("dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                  : "bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>📊 Dashboard Master</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("whatsapp")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "whatsapp"
                  ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              <span>📲 WhatsApp Hub</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("saas")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "saas"
                  ? "bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>💼 SaaS & Cobranças</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("venues")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "venues"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.6)]"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>🏢 Locais ({venues.length})</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs: Mobile Grid (< sm) */}
        <div className="mt-5 block sm:hidden">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSwitchTab("dashboard")}
              className={`col-span-2 flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-black transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-400"
                  : "bg-purple-950/40 text-purple-300 border border-purple-500/40"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>📊 Dashboard & Gráficos Master</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("venues")}
              className={`flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-black transition-all ${
                activeTab === "venues"
                  ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-400"
                  : "bg-white/5 text-slate-300 border border-white/10"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Locais ({venues.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("leads")}
              className={`flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-black transition-all ${
                activeTab === "leads"
                  ? "bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-cyan-400"
                  : "bg-white/5 text-slate-300 border border-white/10"
              }`}
            >
              <Ticket className="h-4 w-4" />
              <span>Leads ({leads.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("confirmations")}
              className={`flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-black transition-all ${
                activeTab === "confirmations"
                  ? "bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] border border-rose-400"
                  : "bg-white/5 text-slate-300 border border-white/10"
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>Presenças ({confirmations.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("saas")}
              className={`flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-black transition-all ${
                activeTab === "saas"
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-300"
                  : "bg-white/5 text-slate-300 border border-white/10"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>💼 SaaS & Pix</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("whatsapp")}
              className={`col-span-2 flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-black transition-all ${
                activeTab === "whatsapp"
                  ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.7)] border border-emerald-300 animate-pulse"
                  : "bg-emerald-950/40 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              <Phone className="h-4 w-4 text-emerald-400" />
              <span>📲 WhatsApp Hub</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsNewVenueModalOpen(true)}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 p-2.5 text-xs font-black text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Cadastrar Estabelecimento</span>
          </button>
        </div>

        {/* Section Navigation Tabs: Desktop / Tablet Scrollable Bar (>= sm) */}
        <div className="mt-8 hidden sm:flex items-center justify-between border-b border-white/10 pb-3 gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full max-w-full">
            <button
              type="button"
              onClick={() => handleSwitchTab("dashboard")}
              className={`flex shrink-0 whitespace-nowrap items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-400"
                  : "text-purple-300 hover:text-white hover:bg-purple-950/30 border border-purple-500/30"
              }`}
            >
              <BarChart3 className="h-4 w-4 text-purple-400" />
              <span>📊 Dashboard Geral & Gráficos</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("venues")}
              className={`flex shrink-0 whitespace-nowrap items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all ${
                activeTab === "venues"
                  ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Gestão de Estabelecimentos ({venues.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("leads")}
              className={`flex shrink-0 whitespace-nowrap items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all ${
                activeTab === "leads"
                  ? "bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Ticket className="h-4 w-4" />
              <span>Mural de Leads VIP ({leads.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("confirmations")}
              className={`flex shrink-0 whitespace-nowrap items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all ${
                activeTab === "confirmations"
                  ? "bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>Confirmados no Rolê ({confirmations.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("analytics")}
              className={`flex shrink-0 whitespace-nowrap items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] font-black"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>📊 Relatórios ({venues.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("saas")}
              className={`flex shrink-0 whitespace-nowrap items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeTab === "saas"
                  ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)] font-black"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>💼 SaaS & Projeções ({subscriptions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("whatsapp")}
              className={`flex shrink-0 whitespace-nowrap items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeTab === "whatsapp"
                  ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.6)] font-black"
                  : "text-emerald-400 hover:text-white hover:bg-emerald-950/30 border border-emerald-500/20"
              }`}
            >
              <Phone className="h-4 w-4" />
              <span>📲 WhatsApp Hub & Automações</span>
            </button>
          </div>

          {/* Action Button: Add Venue */}
          <button
            type="button"
            onClick={() => setIsNewVenueModalOpen(true)}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Cadastrar Estabelecimento</span>
          </button>
        </div>

        {/* Anchor and Container for Active Tab Content */}
        <div id="admin-tab-content" className="scroll-mt-24">
          {/* TAB 0: EXECUTIVE VISUAL DASHBOARD */}
          {activeTab === "dashboard" && (
            <AdminVisualDashboard
              venues={venues}
              leads={leads}
              confirmations={confirmations}
              subscriptions={subscriptions}
              onNavigateTab={handleSwitchTab}
              onOpenNewVenueModal={() => setIsNewVenueModalOpen(true)}
              onSelectVenueForInspection={(venueId) => {
                setSelectedAnalyticsVenueId(venueId);
                setIsAdminAnalyticsModalOpen(true);
              }}
            />
          )}
          {/* TAB 1: VENUES MANAGEMENT */}
          {activeTab === "venues" && (
          <div className="mt-5 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={venueSearch}
                  onChange={(e) => setVenueSearch(e.target.value)}
                  placeholder="Buscar por nome, bairro..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedCategory === "all" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Todos ({venues.length})
                </button>
                <button
                  onClick={() => setSelectedCategory("baladas")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedCategory === "baladas" ? "bg-fuchsia-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Baladas ({venues.filter((v) => v.category === "baladas").length})
                </button>
                <button
                  onClick={() => setSelectedCategory("restaurantes")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedCategory === "restaurantes" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Bares ({venues.filter((v) => v.category === "restaurantes").length})
                </button>
                <button
                  onClick={() => setSelectedCategory("moteis")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedCategory === "moteis" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Motéis ({venues.filter((v) => v.category === "moteis").length})
                </button>
              </div>
            </div>

            {/* Venues Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0b101e]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Local</th>
                    <th className="py-3 px-3">Categoria</th>
                    <th className="py-3 px-3">Bairro</th>
                    <th className="py-3 px-3">Plano</th>
                    <th className="py-3 px-3">Nota & Reviews</th>
                    <th className="py-3 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredVenues.map((v) => (
                    <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={v.image}
                            alt={v.name}
                            className="h-10 w-10 rounded-xl object-cover border border-white/10"
                          />
                          <div>
                            <div className="font-black text-white text-sm flex items-center gap-1.5">
                              <span>{v.name}</span>
                              {v.hasVipList && (
                                <span className="rounded bg-amber-500/20 text-amber-300 text-[9px] px-1 py-0.5 font-bold">
                                  VIP
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">{v.tagline}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold capitalize text-slate-200">
                          {v.subTypeEmoji} {v.category}
                        </span>
                      </td>

                      {/* Neighborhood */}
                      <td className="py-3 px-3">
                        <span className="flex items-center gap-1 text-slate-300 font-medium">
                          <MapPin className="h-3 w-3 text-cyan-400" />
                          <span>{v.neighborhood}</span>
                        </span>
                      </td>

                      {/* Plan */}
                      <td className="py-3 px-3">
                        <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                          {v.plan || "Semestral"} (R$ {v.planPrice || 59}/mês)
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <span>★ {v.rating}</span>
                          <span className="text-slate-500 text-[10px]">({v.reviewsCount})</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedAnalyticsVenueId(v.id);
                              setIsAdminAnalyticsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-purple-500/40 bg-purple-500/15 px-2.5 py-1 text-[11px] font-bold text-purple-300 hover:bg-purple-500/25 transition-colors cursor-pointer"
                            title="Ver relatório de desempenho deste local"
                          >
                            <BarChart3 className="h-3 w-3" />
                            <span>Relatório</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingVenue(v);
                              setIsEditVenueModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/25 transition-colors cursor-pointer"
                            title="Editar informações e fotos do estabelecimento"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Editar</span>
                          </button>

                          <a
                            href={`https://wa.me/${v.whatsapp}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                          >
                            <Phone className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            onClick={() => handleDeleteVenue(v.id, v.name)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[11px] font-bold text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
                            title="Excluir estabelecimento do aplicativo"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: VIP LEADS MURALL */}
        {activeTab === "leads" && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">Leads Captados para Portarias VIP</h3>
              <span className="text-xs text-slate-400">Total: {leads.length} cadastros</span>
            </div>

            {leads.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#0e1424] p-8 text-center text-slate-400">
                <Ticket className="mx-auto h-8 w-8 text-slate-500 mb-2 opacity-50" />
                <p className="text-sm font-bold text-slate-300">Nenhum lead de portaria registrado ainda hoje</p>
                <p className="text-xs text-slate-500 mt-1">
                  Assim que os usuários clicarem em "Lista VIP" no app, seus nomes e WhatsApps aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0b101e]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Nome do Usuário</th>
                      <th className="py-3 px-3">Estabelecimento</th>
                      <th className="py-3 px-3">WhatsApp</th>
                      <th className="py-3 px-3">Acompanhantes</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Ação Rápida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-bold text-white">{lead.user_name}</td>
                        <td className="py-3 px-3 text-cyan-300 font-semibold">{lead.venue_name}</td>
                        <td className="py-3 px-3 text-slate-300">{lead.user_whatsapp}</td>
                        <td className="py-3 px-3 text-slate-300">+{lead.guests_count} pessoas</td>
                        <td className="py-3 px-3">
                          <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <a
                            href={`https://wa.me/55${lead.user_whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20"
                          >
                            <Phone className="h-3 w-3" />
                            <span>Mensagem</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONFIRMATIONS */}
        {activeTab === "confirmations" && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">Presenças Confirmadas ("🔥 Eu Vou")</h3>
              <span className="text-xs text-slate-400">Total: {confirmations.length} confirmados</span>
            </div>

            {confirmations.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#0e1424] p-8 text-center text-slate-400">
                <Flame className="mx-auto h-8 w-8 text-rose-500 mb-2 opacity-50" />
                <p className="text-sm font-bold text-slate-300">Nenhuma confirmação de presença registrada ainda</p>
                <p className="text-xs text-slate-500 mt-1">
                  Os cliques no botão "🔥 Eu Vou" são gravados em tempo real no banco.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {confirmations.map((conf) => (
                  <div
                    key={conf.id}
                    className="rounded-2xl border border-rose-500/30 bg-[#0e1424] p-4 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-white">
                        {conf.user_name || "Baladeiro Anônimo"}
                      </span>
                      <p className="text-[11px] text-rose-300 mt-0.5">
                        Local ID: {conf.venue_id}
                      </p>
                    </div>
                    <Flame className="h-5 w-5 text-rose-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GLOBAL ANALYTICS & VENUE INSPECTION */}
        {activeTab === "analytics" && (
          <div className="mt-5 space-y-6">
            {/* Global Aggregated Metrics Card */}
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-[#0e1424] to-purple-950/30 p-5 sm:p-6 shadow-[0_0_35px_rgba(245,158,11,0.15)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-300 mb-2">
                    👑 Inteligência Master • Visão Consolidada de SP
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Relatório Geral de Todos os Estabelecimentos
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                    Painel exclusivo de Super Administrador com acesso irrestrito às métricas de tráfego, conversão e engajamento de todas as {venues.length} casas parceiras em São Paulo.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleExportMasterCSV}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/50 px-3.5 py-2 text-xs font-black text-emerald-300 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
                    title="Baixar planilha compatível com Microsoft Excel e Google Sheets"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Exportar Excel / CSV</span>
                  </button>

                  <button
                    onClick={handlePrintExecutiveReport}
                    className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/50 px-3.5 py-2 text-xs font-black text-cyan-300 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer"
                    title="Imprimir ou Salvar Relatório Executivo em PDF"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Salvar em PDF</span>
                  </button>

                  <button
                    onClick={() => setIsAdminAnalyticsModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2 text-xs font-black text-black hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Explorar Modal Completo</span>
                  </button>
                </div>
              </div>

              {/* Aggregated Totals Grid */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Visualizações SP
                  </span>
                  <div className="mt-1 text-2xl font-black text-amber-300">
                    {totalGlobalViews.toLocaleString("pt-BR")}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Estimativa em 30 dias</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Cliques WhatsApp Geral
                  </span>
                  <div className="mt-1 text-2xl font-black text-emerald-400">
                    {totalGlobalWhatsapp.toLocaleString("pt-BR")}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Contatos diretos gerados</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Listas VIP Captadas
                  </span>
                  <div className="mt-1 text-2xl font-black text-cyan-300">
                    {leads.length > 0 ? leads.length : totalGlobalLeads.toLocaleString("pt-BR")}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Nomes em portarias</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Rotas Uber Calculadas
                  </span>
                  <div className="mt-1 text-2xl font-black text-purple-300">
                    {totalGlobalUber.toLocaleString("pt-BR")}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Deslocamentos simulados</p>
                </div>
              </div>
            </div>

            {/* Individual Venue Inspection */}
            <div className="rounded-3xl border border-white/10 bg-[#0e1424] p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-400" />
                    <span>Inspecionar Estabelecimento Individual</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Selecione qualquer casa para auditar o relatório detalhado
                  </p>
                </div>

                <div className="w-full sm:w-72">
                  <select
                    value={selectedAnalyticsVenueId}
                    onChange={(e) => setSelectedAnalyticsVenueId(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#121829] py-2 px-3 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                  >
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.subTypeEmoji} {v.name} ({v.neighborhood})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedVenueDetails && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedVenueDetails.image}
                        alt={selectedVenueDetails.name}
                        className="h-14 w-14 rounded-2xl object-cover border border-white/10 shadow"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-white">
                            {selectedVenueDetails.subTypeEmoji} {selectedVenueDetails.name}
                          </h4>
                          <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                            {selectedVenueDetails.neighborhood}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{selectedVenueDetails.tagline}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsAdminAnalyticsModalOpen(true)}
                      className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-black text-white hover:bg-purple-500 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0 cursor-pointer"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Abrir Relatório Completo & Operações</span>
                    </button>
                  </div>

                  {/* Selected Venue Key Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Visualizações</span>
                      <div className="text-lg font-black text-cyan-300 mt-0.5">
                        {selectedVenueMetrics.impressionsFeed.toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Cliques Perfil</span>
                      <div className="text-lg font-black text-white mt-0.5">
                        {selectedVenueMetrics.profileClicks.toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">WhatsApp</span>
                      <div className="text-lg font-black text-emerald-400 mt-0.5">
                        {selectedVenueMetrics.whatsappDirectClicks.toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Leads VIP</span>
                      <div className="text-lg font-black text-purple-300 mt-0.5">
                        {selectedVenueMetrics.vipListLeads.toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Rotas Uber</span>
                      <div className="text-lg font-black text-amber-300 mt-0.5">
                        {selectedVenueMetrics.uberSimulations.toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Crescimento</span>
                      <div className="text-lg font-black text-emerald-300 mt-0.5">
                        +{selectedVenueMetrics.weeklyGrowth}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: EXECUTIVE SAAS DASHBOARD & PROJECTIONS */}
        {activeTab === "saas" && (
          <div className="mt-5 space-y-6">
            {/* Header with Export Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-[#0e1424] to-cyan-950/30 p-4">
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Painel Executivo B2B • Assinaturas & Escala</span>
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  Faturamento Recorrente dos Estabelecimentos Parceiros
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportMasterCSV}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/50 px-3.5 py-2 text-xs font-black text-emerald-300 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
                  title="Baixar planilha compatível com Microsoft Excel e Google Sheets"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Exportar Excel / CSV</span>
                </button>
                <button
                  onClick={handlePrintExecutiveReport}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/50 px-3.5 py-2 text-xs font-black text-cyan-300 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer"
                  title="Imprimir ou Salvar Relatório Executivo em PDF"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Salvar em PDF</span>
                </button>
              </div>
            </div>

            {/* Top SaaS Executive Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* MRR */}
              <div className="rounded-2xl border border-emerald-500/30 bg-[#0e1424] p-4 sm:p-5 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                    MRR (Mensal Recorrente)
                  </span>
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-400">
                  R$ {saasMetrics.mrr.toLocaleString("pt-BR")},00
                </div>
                <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="text-emerald-400 font-bold">▲ +18.4%</span> vs mês anterior
                </p>
              </div>

              {/* ARR */}
              <div className="rounded-2xl border border-cyan-500/30 bg-[#0e1424] p-4 sm:p-5 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                    ARR (Anual Projetado)
                  </span>
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-black text-white">
                  R$ {saasMetrics.arr.toLocaleString("pt-BR")},00
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Contratos anuais e semestrais</p>
              </div>

              {/* ARPU */}
              <div className="rounded-2xl border border-purple-500/30 bg-[#0e1424] p-4 sm:p-5 shadow-[0_0_25px_rgba(168,85,247,0.15)]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                    ARPU (Ticket Médio)
                  </span>
                  <Building2 className="h-4 w-4 text-purple-400" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-black text-purple-300">
                  R$ {saasMetrics.arpu},00
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Média por parceiro ativo</p>
              </div>

              {/* LTV & Churn */}
              <div className="rounded-2xl border border-amber-500/30 bg-[#0e1424] p-4 sm:p-5 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                    LTV Estimado
                  </span>
                  <Crown className="h-4 w-4 text-amber-400" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-300">
                  R$ {saasMetrics.ltv.toLocaleString("pt-BR")},00
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Churn mensal: {saasMetrics.churnRatePercent}%</p>
              </div>
            </div>

            {/* Plans Distribution & Growth Status Banner */}
            <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-emerald-400" />
                    <span>Distribuição de Assinaturas por Plano</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Total de parceiros integrados com cobrança: <strong>{saasMetrics.activeSubscriptionsCount} estabelecimentos</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="h-3 w-3 rounded-full bg-cyan-500" />
                    <span className="text-cyan-300 font-bold">Standard R$ 59 ({saasMetrics.planBreakdown.standard || subscriptions.filter(s => s.tier !== "premium").length}) 💼</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="text-amber-300 font-black">Premium R$ 89 ({saasMetrics.planBreakdown.premium || subscriptions.filter(s => s.tier === "premium").length}) ⭐ Promoções</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 12-Month Financial Projections (With Nightlife Seasonality) */}
            <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-cyan-400" />
                    <span>Projeção de Faturamento Recorrente (Próximos 12 Meses)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Cálculo preditivo com base na taxa de conversão atual de casas noturnas e sazonalidade de São Paulo (Réveillon, Carnaval e Festas Juninas).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black px-2 py-1">
                    Boost Sazonal Ativo
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px] font-black">
                    <tr>
                      <th className="py-2.5 px-3">Mês / Período</th>
                      <th className="py-2.5 px-3">Parceiros Estimados</th>
                      <th className="py-2.5 px-3">Conservador (8% a.m.)</th>
                      <th className="py-2.5 px-3">Realista (15% a.m.)</th>
                      <th className="py-2.5 px-3">Agressivo (22% a.m.)</th>
                      <th className="py-2.5 px-3 text-right">Comparativo Visual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {saasProjections.map((p, idx) => {
                      const isHighlighted = idx === 2 || idx === 4 || idx === 8;
                      const progressPct = Math.min(100, Math.round((p.realisticMRR / 25000) * 100));
                      return (
                        <tr
                          key={p.month}
                          className={`hover:bg-white/[0.02] transition-colors ${
                            isHighlighted ? "bg-purple-950/20" : ""
                          }`}
                        >
                          <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                            {isHighlighted && <span className="text-amber-400">🔥</span>}
                            <span>{p.month}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 font-semibold">
                            {p.activeVenues} casas
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 font-medium">
                            R$ {p.conservativeMRR.toLocaleString("pt-BR")},00
                          </td>
                          <td className="py-2.5 px-3 font-black text-cyan-300">
                            R$ {p.realisticMRR.toLocaleString("pt-BR")},00
                          </td>
                          <td className="py-2.5 px-3 font-black text-emerald-400">
                            R$ {p.aggressiveMRR.toLocaleString("pt-BR")},00
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="inline-flex items-center gap-2 w-32 justify-end">
                              <div className="w-20 bg-white/10 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-500 font-bold">{progressPct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subscriptions Management & Billing Table */}
            <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-emerald-400" />
                    <span>Gestão de Assinaturas dos Estabelecimentos ({subscriptions.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Envie lembretes de renovação diretamente no WhatsApp do proprietário com a chave Pix preenchida.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Filtrar:</span>
                  <select
                    value={subStatusFilter}
                    onChange={(e) => setSubStatusFilter(e.target.value)}
                    className="rounded-xl border border-white/10 bg-[#121829] py-1.5 px-3 text-xs text-white focus:outline-none"
                  >
                    <option value="all">Todas ({subscriptions.length})</option>
                    <option value="active">Ativas / Em Dia</option>
                    <option value="pending_payment">Pendentes / Atrasadas</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px] font-black">
                    <tr>
                      <th className="py-2.5 px-3">Estabelecimento</th>
                      <th className="py-2.5 px-3">Responsável & Contato</th>
                      <th className="py-2.5 px-3">Plano Oficial</th>
                      <th className="py-2.5 px-3">Vencimento Mensal</th>
                      <th className="py-2.5 px-3">Forma & Validação</th>
                      <th className="py-2.5 px-3 text-right">Ações Inteligentes de Cobrança</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subscriptions
                      .filter((s) => (subStatusFilter === "all" ? true : s.status === subStatusFilter))
                      .map((sub) => {
                        return (
                          <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-3">
                              <span className="font-black text-white text-sm block">{sub.venueName}</span>
                              <span className="text-[10px] text-slate-500 font-mono">ID: {sub.venueId}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-200 block">{sub.ownerName}</span>
                              <span className="text-emerald-400 font-mono text-[11px] block">{sub.ownerWhatsapp}</span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase border ${
                                    sub.tier === "premium"
                                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                      : "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                                  }`}
                                >
                                  {sub.tier === "premium" ? "👑 Premium" : "💼 Standard"}
                                </span>
                              </div>
                              <span className="text-white font-black text-xs mt-1 block">
                                R$ {sub.monthlyValue || (sub.tier === "premium" ? 89 : 59)},00/mês
                              </span>
                              {(() => {
                                const favStats = getVenueFavoritesStats(sub.venueId);
                                return (
                                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                                    <span className="inline-flex items-center gap-1 text-[10px] text-pink-300 font-bold bg-pink-500/10 border border-pink-500/20 rounded px-1.5 py-0.5" title="Total de usuários que favoritaram este local">
                                      ❤️ {favStats.totalFavoritedCount} fãs ({favStats.authorizedSubscribersCount} zap)
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSubscriptionTier(sub.id)}
                                      className="text-[9px] font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                                    >
                                      {sub.tier === "premium" ? "Mudar p/ Standard (59)" : "Mudar p/ Premium (89)"}
                                    </button>
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="py-3 px-3">
                              <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-black px-2 py-0.5 text-[10px] inline-block">
                                📅 Todo Dia {sub.dueDay || 10}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                                Próx: {sub.nextBillingDate}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="space-y-1">
                                <span className="text-[11px] font-bold text-slate-300 block">
                                  {sub.paymentMethod === "credit_card"
                                    ? `💳 Cartão (final ${sub.cardLast4 || "••••"})`
                                    : "⚡ Pix Recorrente"}
                                </span>
                                <div>
                                  {sub.status === "active" ? (
                                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 text-[9px] font-black uppercase">
                                      ● Aprovado / Ativo
                                    </span>
                                  ) : sub.status === "card_failed" ? (
                                    <span
                                      className="rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 px-2 py-0.5 text-[9px] font-black uppercase"
                                      title={sub.lastChargeFailureReason || "Falha na cobrança"}
                                    >
                                      ❌ Recusado: {sub.lastChargeFailureReason || "Saldo/Cancelado"}
                                    </span>
                                  ) : (
                                    <span className="rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 text-[9px] font-black uppercase">
                                      ⏳ Aguardando Pagamento
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex flex-col items-end gap-1.5">
                                {sub.paymentMethod === "pix" ? (
                                  <button
                                    type="button"
                                    onClick={() => handleDispatchPixNotice(sub)}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-black text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer"
                                    title="Dispara aviso no WhatsApp com a chave Pix e Copia e Cola"
                                  >
                                    <Send className="h-3.5 w-3.5" />
                                    <span>Aviso Pix (Dia {sub.dueDay || 10})</span>
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleProcessCardChargeAction(sub, "approve")}
                                      className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 px-2.5 py-1.5 text-[11px] font-black text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer"
                                      title="Simula validação com sucesso do cartão e envia comprovante no WhatsApp"
                                    >
                                      <Check className="h-3 w-3 stroke-[3]" />
                                      <span>Validar / Cobrar Cartão</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleProcessCardChargeAction(sub, "decline_funds")}
                                      className="inline-flex items-center gap-1 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/40 px-2 py-1.5 text-[10px] font-bold text-amber-300 transition-all cursor-pointer"
                                      title="Simula recusa por saldo insuficiente e envia alerta com Pix no WhatsApp"
                                    >
                                      <span>Sem Saldo</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleProcessCardChargeAction(sub, "decline_cancelled")}
                                      className="inline-flex items-center gap-1 rounded-xl border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/40 px-2 py-1.5 text-[10px] font-bold text-rose-300 transition-all cursor-pointer"
                                      title="Simula recusa por cartão cancelado/bloqueado e envia alerta com Pix no WhatsApp"
                                    >
                                      <span>Cancelado</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gateway Configuration Settings Card (Asaas / Stripe) */}
            <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Key className="h-5 w-5 text-amber-400" />
                    <span>Configuração do Gateway de Pagamento SaaS</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Integração com Asaas e Stripe para liquidação automática via Pix Copia e Cola, Boleto e Cartão de Crédito.
                  </p>
                </div>
                {gatewaySaveToast && (
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/50 px-3 py-1 text-xs font-black text-emerald-300 animate-bounce">
                    ✅ Configurações Salvas!
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveGateway} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                      Provedor de Pagamento
                    </label>
                    <select
                      value={gatewayConfig.provider}
                      onChange={(e) =>
                        setGatewayConfig({ ...gatewayConfig, provider: e.target.value as any })
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#121829] py-2 px-3 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                    >
                      <option value="asaas">Asaas (Pix Automático + Cartão + Boleto)</option>
                      <option value="stripe">Stripe (Cartão Global)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                      Ambiente
                    </label>
                    <select
                      value={gatewayConfig.environment}
                      onChange={(e) =>
                        setGatewayConfig({ ...gatewayConfig, environment: e.target.value as any })
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#121829] py-2 px-3 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                    >
                      <option value="sandbox">Sandbox / Homologação (Testes)</option>
                      <option value="production">Produção (Live Real)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                      Chave Pix Oficial da Plataforma
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="thiagooriginal2002@gmail.com"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-xs text-emerald-300 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                      API Key / Access Token
                    </label>
                    <input
                      type="text"
                      value={gatewayConfig.apiKey}
                      onChange={(e) => setGatewayConfig({ ...gatewayConfig, apiKey: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-[#121829] py-2 px-3 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                      URL do Webhook para Confirmação Instantânea
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="https://thiagooriginal-social-media-layers.workers.dev/api/webhooks/asaas"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-xs text-slate-400 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-300 font-bold">
                      Gateway ativo e operando com suporte a Pix Instantâneo
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-xs font-black text-black hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Salvar Configuração do Gateway</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: WHATSAPP HUB & AUTOMAÇÕES                                          */}
        {/* ========================================================================= */}
        {activeTab === "whatsapp" && (
          <div className="mt-5 space-y-6">
            {/* Header Banner */}
            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#0d1624] to-[#070b14] p-6 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                      <Phone className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <span>Central de Notificações & Automações WhatsApp</span>
                        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                          {waConfig.mode === "api" ? "MODO API" : "MODO DIRETO"}
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        Disparo automático de vouchers VIP aos clientes, alertas às portarias dos estabelecimentos e cobrança de planos SaaS.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Notificações</span>
                    <span className="text-base font-black text-emerald-400">{waLogs.length} disparos</span>
                  </div>
                  <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Status Motor</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Pronto para envio
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-[#0e1424] p-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Clientes VIP Alcançáveis</span>
                <div className="mt-1 text-2xl font-black text-cyan-300">{leads.length} contatos</div>
                <p className="text-[10px] text-slate-500 mt-0.5">Comprovantes e lembretes de rolê</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0e1424] p-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Portarias & Baladas Conectadas</span>
                <div className="mt-1 text-2xl font-black text-purple-300">{venues.length} casas</div>
                <p className="text-[10px] text-slate-500 mt-0.5">Alertas de novos leads e grupos VIP</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0e1424] p-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Chave Pix de Cobrança</span>
                <div className="mt-1 text-sm font-mono font-bold text-amber-300 truncate">
                  thiagooriginal2002@gmail.com
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Inclusa nos lembretes de SaaS</p>
              </div>
            </div>

            {/* Section 1: Configuração do Motor de Envio */}
            <div className="rounded-3xl border border-white/10 bg-[#0e1424] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-emerald-400" />
                    <span>Configuração do Motor de Disparo</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Escolha entre links diretos nativos (wa.me) ou conexão via API externa (Evolution API, Z-API ou Webhook).
                  </p>
                </div>
                {waSaveToast && (
                  <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/50 px-3 py-1 text-xs font-bold text-emerald-300 animate-in fade-in">
                    ✓ Configurações salvas!
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveWaConfig} className="space-y-4">
                {/* Mode Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWaConfig({ ...waConfig, mode: "direct", provider: "direct" })}
                    className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                      waConfig.mode === "direct"
                        ? "border-emerald-500 bg-emerald-950/30 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                        : "border-white/10 bg-white/5 hover:bg-white/10 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-white">📱 Modo Direto (Nativo wa.me)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        GRÁTIS & UNIVERSAL
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Abre o WhatsApp oficial (Web ou App do celular) com a mensagem formatada pronta para enviar em 1 toque. Sem risco de ban e sem custo de servidor.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWaConfig({ ...waConfig, mode: "api", provider: "evolution" })}
                    className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                      waConfig.mode === "api"
                        ? "border-cyan-500 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                        : "border-white/10 bg-white/5 hover:bg-white/10 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-white">⚡ Modo API Automática (Nuvem)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                        AUTOMAÇÃO EM 2º PLANO
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Envia as mensagens silenciosamente em segundo plano conectando com Evolution API, Z-API ou Webhook HTTP.
                    </p>
                  </button>
                </div>

                {/* API Fields (if API mode) */}
                {waConfig.mode === "api" && (
                  <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 space-y-4 animate-in fade-in">
                    {/* Live Connection Status Banner */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-white/10 bg-[#0c101c]">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                            waConnectionStatus?.connected
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : waConnectionStatus?.state === "not_found"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : waConnectionStatus?.state === "close"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          }`}
                        >
                          {waConnectionStatus?.connected ? (
                            <Wifi className="h-5 w-5" />
                          ) : (
                            <WifiOff className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white">Status da Conexão:</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                waConnectionStatus?.connected
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : waConnectionStatus?.state === "not_found"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : waConnectionStatus?.state === "close"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : waConfig.apiUrl
                                  ? "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              }`}
                            >
                              {waConnectionStatus?.connected
                                ? "🟢 Conectado & Operante"
                                : waConnectionStatus?.state === "not_found"
                                ? "🟡 Instância não criada"
                                : waConnectionStatus?.state === "close"
                                ? "🟡 Aguardando QR Code"
                                : waConfig.apiUrl
                                ? "⚪ Não testado"
                                : "🔴 Não configurado"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {waConnectionStatus?.message ||
                              (waConfig.apiUrl
                                ? "Clique em 'Testar Conexão' para verificar a comunicação com o servidor."
                                : "Preencha a URL da sua Evolution API abaixo.")}
                          </p>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={handleCheckEvolutionConnection}
                          disabled={waCheckingConnection || !waConfig.apiUrl}
                          className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/40 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-all disabled:opacity-40 cursor-pointer"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${waCheckingConnection ? "animate-spin" : ""}`} />
                          <span>{waCheckingConnection ? "Testando..." : "Testar Conexão"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleOpenEvolutionQrModal}
                          disabled={!waConfig.apiUrl}
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 px-3.5 py-1.5 text-xs font-black text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all disabled:opacity-40 cursor-pointer"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          <span>Conectar WhatsApp (QR Code)</span>
                        </button>
                      </div>
                    </div>

                    {waInstanceFeedback && (
                      <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-2.5 text-xs text-cyan-300 font-medium">
                        {waInstanceFeedback}
                      </div>
                    )}

                    {/* Endpoint, Key & Instance Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                          Provedor
                        </label>
                        <select
                          value={waConfig.provider}
                          onChange={(e) => setWaConfig({ ...waConfig, provider: e.target.value as any })}
                          className="w-full rounded-xl border border-white/10 bg-[#121829] py-2 px-3 text-xs text-white focus:outline-none"
                        >
                          <option value="evolution">Evolution API (Recomendado)</option>
                          <option value="z-api">Z-API</option>
                          <option value="custom_webhook">Webhook Personalizado</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                          URL da Evolution API
                        </label>
                        <input
                          type="text"
                          value={waConfig.apiUrl || ""}
                          onChange={(e) => setWaConfig({ ...waConfig, apiUrl: e.target.value })}
                          placeholder="https://meu-evolution.up.railway.app"
                          className="w-full rounded-xl border border-white/10 bg-[#121829] py-2 px-3 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                          API Key Global (Token)
                        </label>
                        <input
                          type="password"
                          value={waConfig.apiKey || ""}
                          onChange={(e) => setWaConfig({ ...waConfig, apiKey: e.target.value })}
                          placeholder="••••••••••••••••"
                          className="w-full rounded-xl border border-white/10 bg-[#121829] py-2 px-3 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                          Nome da Instância
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={waConfig.instanceName || "radar-role"}
                            onChange={(e) => setWaConfig({ ...waConfig, instanceName: e.target.value })}
                            placeholder="radar-role"
                            className="w-full rounded-xl border border-white/10 bg-[#121829] py-2 px-3 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleCreateEvolutionInstance}
                            disabled={waCreatingInstance || !waConfig.apiUrl}
                            title="Criar Instância na Evolution API"
                            className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Free Evolution API Guide Accordion */}
                    <div className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setIsEvolutionGuideOpen(!isEvolutionGuideOpen)}
                        className="w-full flex items-center justify-between p-3.5 text-left hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 text-xs font-black text-slate-200">
                          <HelpCircle className="h-4 w-4 text-cyan-400" />
                          <span>Como subir sua Evolution API 100% Grátis em 3 Minutos</span>
                        </div>
                        <span className="text-xs text-cyan-400 font-bold">
                          {isEvolutionGuideOpen ? "Fechar Guia ▲" : "Ver Instruções ▼"}
                        </span>
                      </button>

                      {isEvolutionGuideOpen && (
                        <div className="p-4 border-t border-white/10 text-xs text-slate-300 space-y-3 bg-[#0a0e1a] animate-in fade-in">
                          <div>
                            <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                              <span>🚀 Opção 1: Railway (Recomendado • Nuvem Grátis em 1 Clique)</span>
                            </p>
                            <p className="text-slate-400">
                              O Railway permite rodar a Evolution API sem precisar de cartão nem instalar nada no computador:
                            </p>
                            <ol className="list-decimal list-inside space-y-1 mt-1 text-slate-300 pl-1">
                              <li>Acesse <strong>railway.app</strong> e faça login com seu GitHub.</li>
                              <li>Clique em <strong>+ New Project</strong> &gt; <strong>Deploy from Template</strong> &gt; busque por <code>Evolution API v2</code>.</li>
                              <li>Defina a variável <code>AUTHENTICATION_API_KEY</code> com uma senha forte da sua escolha (Ex: <code>radar_role_secret_2026</code>).</li>
                              <li>Após o deploy (leva ~1 minuto), copie o domínio público gerado (Ex: <code>https://evolution-production-xxxx.up.railway.app</code>).</li>
                              <li>Cole a URL e a chave nos campos acima, clique em <strong>Salvar</strong> e depois em <strong>Conectar WhatsApp (QR Code)</strong>!</li>
                            </ol>
                          </div>

                          <div className="border-t border-white/10 pt-2.5">
                            <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                              <span>🐳 Opção 2: Docker Local ou VPS (1 linha de comando)</span>
                            </p>
                            <p className="text-slate-400 mb-1">
                              Se você já possui Docker na sua máquina ou VPS, rode apenas este comando no terminal:
                            </p>
                            <div className="rounded-xl bg-black/60 p-3 font-mono text-[11px] text-cyan-300 border border-white/10 select-all overflow-x-auto">
                              docker run -d --name evolution-api -p 8080:8080 -e AUTHENTICATION_API_KEY=radar_role_2026 -e CORS_ORIGIN="*" atendai/evolution-api:v2.2.2
                            </div>
                            <p className="text-slate-400 mt-1">
                              Nesse caso, a URL será <code>http://localhost:8080</code> e a chave será <code>radar_role_2026</code>.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Automation Toggles */}
                <div className="border-t border-white/10 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={waConfig.autoNotifyClient}
                      onChange={(e) => setWaConfig({ ...waConfig, autoNotifyClient: e.target.checked })}
                      className="h-4 w-4 rounded border-white/20 bg-white/10 text-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                    <span>Envio de voucher VIP ao cliente</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={waConfig.autoNotifyPortaria}
                      onChange={(e) => setWaConfig({ ...waConfig, autoNotifyPortaria: e.target.checked })}
                      className="h-4 w-4 rounded border-white/20 bg-white/10 text-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                    <span>Alerta de novo lead para a portaria</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={waConfig.autoNotifyBilling}
                      onChange={(e) => setWaConfig({ ...waConfig, autoNotifyBilling: e.target.checked })}
                      className="h-4 w-4 rounded border-white/20 bg-white/10 text-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                    <span>Cobrança de mensalidade SaaS com Pix</span>
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Salvar Configuração do WhatsApp</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Section 2: Disparo de Cobrança SaaS para Parceiros */}
            <div className="rounded-3xl border border-white/10 bg-[#0e1424] p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-400" />
                    <span>Cobrança & Lembrete de Mensalidade SaaS via WhatsApp</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dispare o resumo de assinatura com a chave Pix diretamente no WhatsApp do dono da casa em 1 clique.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px] font-black">
                    <tr>
                      <th className="py-2.5 px-3">Estabelecimento</th>
                      <th className="py-2.5 px-3">Responsável & Contato</th>
                      <th className="py-2.5 px-3">Vencimento Mensal</th>
                      <th className="py-2.5 px-3">Forma & Validação</th>
                      <th className="py-2.5 px-3 text-right">Ação WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subscriptions.map((sub) => {
                      return (
                        <tr key={sub.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white">{sub.venueName}</span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase border ${
                                  sub.tier === "premium"
                                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                    : "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                                }`}
                              >
                                {sub.tier === "premium" ? "👑 Premium R$89" : "Standard R$59"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-500 font-mono">ID: {sub.venueId}</span>
                              {(() => {
                                const favStats = getVenueFavoritesStats(sub.venueId);
                                return (
                                  <span className="text-[9px] text-pink-300 font-bold bg-pink-500/10 border border-pink-500/20 rounded px-1">
                                    ❤️ {favStats.totalFavoritedCount} fãs
                                  </span>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-200 block">{sub.ownerName}</span>
                            <span className="font-mono text-emerald-400 text-[11px] block">{sub.ownerWhatsapp}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-black px-2 py-0.5 text-[10px] inline-block">
                              📅 Todo Dia {sub.dueDay || 10}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                              Próx: {sub.nextBillingDate}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[11px] font-bold text-slate-300 block">
                              {sub.paymentMethod === "credit_card"
                                ? `💳 Cartão (final ${sub.cardLast4 || "••••"})`
                                : "⚡ Pix Recorrente"}
                            </span>
                            <div>
                              {sub.status === "active" ? (
                                <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[9px] font-black uppercase">
                                  ● Aprovado
                                </span>
                              ) : sub.status === "card_failed" ? (
                                <span className="rounded-full bg-rose-500/20 text-rose-300 px-2 py-0.5 text-[9px] font-black uppercase">
                                  ❌ Recusado
                                </span>
                              ) : (
                                <span className="rounded-full bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[9px] font-black uppercase">
                                  ⏳ Pendente
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex flex-col items-end gap-1">
                              {sub.paymentMethod === "pix" ? (
                                <button
                                  type="button"
                                  onClick={() => handleDispatchPixNotice(sub)}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-black text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer"
                                  title="Dispara aviso no WhatsApp com a chave Pix e Copia e Cola"
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                  <span>Cobrar Pix (Dia {sub.dueDay || 10})</span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleProcessCardChargeAction(sub, "approve")}
                                    className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 px-2.5 py-1.5 text-[11px] font-black text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer"
                                    title="Aprova e envia comprovante no WhatsApp"
                                  >
                                    <Check className="h-3 w-3 stroke-[3]" />
                                    <span>Cobrar Cartão</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleProcessCardChargeAction(sub, "decline_funds")}
                                    className="inline-flex items-center gap-1 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/40 px-2 py-1.5 text-[10px] font-bold text-amber-300 transition-all cursor-pointer"
                                    title="Simula falha de saldo e envia alerta com Pix no WhatsApp"
                                  >
                                    <span>Recusa Saldo</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleProcessCardChargeAction(sub, "decline_cancelled")}
                                    className="inline-flex items-center gap-1 rounded-xl border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/40 px-2 py-1.5 text-[10px] font-bold text-rose-300 transition-all cursor-pointer"
                                    title="Simula cartão cancelado e envia alerta com Pix no WhatsApp"
                                  >
                                    <span>Cancelado</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Testador de Mensagens em Tempo Real */}
            <div className="rounded-3xl border border-white/10 bg-[#0e1424] p-6">
              <div className="mb-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Send className="h-5 w-5 text-cyan-400" />
                  <span>Simulador & Testador de Mensagens em Tempo Real</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Teste como as notificações chegam no celular antes de disparar para clientes ou parceiros reais.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                    Número do WhatsApp para Teste
                  </label>
                  <input
                    type="tel"
                    value={waTestPhone}
                    onChange={(e) => setWaTestPhone(e.target.value)}
                    placeholder="11999998888"
                    className="w-full rounded-xl border border-white/10 bg-[#121829] py-2 px-3 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                    Modelo de Notificação
                  </label>
                  <select
                    value={waTestType}
                    onChange={(e) => setWaTestType(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-[#121829] py-2 px-3 text-xs text-white focus:outline-none"
                  >
                    <option value="pass">🎟️ Comprovante VIP do Cliente</option>
                    <option value="new_lead">🔔 Alerta de Novo Lead para a Portaria</option>
                    <option value="checkin">✅ Entrada VIP Confirmada na Portaria</option>
                    <option value="reminder">🔥 Lembrete Pré-Rolê</option>
                    <option value="billing_pix">⚡ Cobrança Pix Recorrente (Vencimento Dia 10/20/30)</option>
                    <option value="billing_card_ok">💳 Confirmação Cartão Recorrente Aprovado (R$ 59)</option>
                    <option value="billing_card_fail">🚨 Alerta Falha Cartão (Saldo Insuficiente / Cancelado)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleTestWhatsAppDispatch}
                    disabled={waTestSending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>{waTestSending ? "Disparando..." : "Disparar Mensagem de Teste"}</span>
                  </button>
                </div>
              </div>

              {waTestFeedback && (
                <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs font-bold text-emerald-300 animate-in fade-in">
                  {waTestFeedback}
                </div>
              )}
            </div>

            {/* Section 4: Histórico de Disparos Recentes */}
            <div className="rounded-3xl border border-white/10 bg-[#0e1424] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-400" />
                  <span>Histórico de Notificações Disparadas ({waLogs.length})</span>
                </h3>
              </div>

              {waLogs.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center text-slate-400 text-xs">
                  Nenhum envio registrado nesta sessão ainda. Realize um disparo de teste acima para ver os logs.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px] font-black">
                      <tr>
                        <th className="py-2 px-3">Data/Hora</th>
                        <th className="py-2 px-3">Tipo</th>
                        <th className="py-2 px-3">Destinatário</th>
                        <th className="py-2 px-3">Telefone</th>
                        <th className="py-2 px-3">Mensagem</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {waLogs.slice(0, 10).map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                            {log.timestamp}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-purple-300">
                              {log.recipientType === "client"
                                ? "Cliente VIP"
                                : log.recipientType === "venue_portaria"
                                ? "Portaria"
                                : log.recipientType === "partner_billing"
                                ? "Cobrança SaaS"
                                : "Admin Teste"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-white">
                            {log.recipientName}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-emerald-400">
                            {log.recipientPhone}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                            {log.messagePreview}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                              {log.status === "sent" ? "Enviado (API)" : "Link Aberto"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Register Venue Modal */}
      <RegisterVenueModal
        isOpen={isNewVenueModalOpen}
        onClose={() => setIsNewVenueModalOpen(false)}
        onVenueCreated={(newV) => {
          setVenues((prev) => [newV, ...prev]);
        }}
      />

      {/* Edit Venue Modal */}
      <EditVenueModal
        venue={editingVenue}
        isOpen={isEditVenueModalOpen}
        onClose={() => {
          setIsEditVenueModalOpen(false);
          setEditingVenue(null);
        }}
        onVenueUpdated={(updated) => {
          setVenues((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
          setIsEditVenueModalOpen(false);
          setEditingVenue(null);
        }}
      />

      {/* Admin Analytics Modal (Visualização de Todos os Estabelecimentos) */}
      <PartnerAnalyticsModal
        isOpen={isAdminAnalyticsModalOpen}
        onClose={() => setIsAdminAnalyticsModalOpen(false)}
        venues={venues}
        initialVenueId={selectedAnalyticsVenueId}
        isPartnerOnly={false}
      />

      {/* Modal Conectar WhatsApp via QR Code (Evolution API) */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all">
          <div className="absolute inset-0" onClick={() => setIsQrModalOpen(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-cyan-500/40 bg-[#0c101c] p-6 text-slate-100 shadow-[0_0_60px_-10px_rgba(6,182,212,0.4)] z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-xl">
                  📲
                </span>
                <div>
                  <h3 className="text-base font-black text-white">Conectar WhatsApp</h3>
                  <p className="text-[11px] text-slate-400">
                    Instância: <span className="font-mono text-cyan-300 font-bold">{waConfig.instanceName || "radar-role"}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* QR Code Container */}
            <div className="py-6 text-center">
              {waConnectionStatus?.connected ? (
                <div className="py-8 space-y-3 animate-in zoom-in">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 text-3xl">
                    ✓
                  </div>
                  <h4 className="text-lg font-black text-emerald-300">WhatsApp Conectado com Sucesso!</h4>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto">
                    A sua Evolution API já está conectada e operante. Todos os disparos agora serão feitos automaticamente em 2º plano!
                  </p>
                </div>
              ) : waQrLoading ? (
                <div className="py-12 space-y-3">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                  <p className="text-xs text-slate-400">Gerando QR Code no servidor Evolution API...</p>
                </div>
              ) : waQrError ? (
                <div className="py-6 space-y-3">
                  <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-300">
                    <p className="font-bold">Não foi possível carregar o QR Code:</p>
                    <p className="mt-1 font-mono text-[11px]">{waQrError}</p>
                  </div>
                  <div className="flex gap-2 justify-center pt-2">
                    <button
                      type="button"
                      onClick={handleCreateEvolutionInstance}
                      disabled={waCreatingInstance}
                      className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      {waCreatingInstance ? "Criando..." : "Criar Instância Primeiro"}
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenEvolutionQrModal}
                      className="rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                </div>
              ) : waQrCode ? (
                <div className="space-y-4">
                  {/* Countdown Progress Bar */}
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span>Código QR ativo — renova em: <strong className="font-mono text-white text-sm">{waQrCountdown}s</strong></span>
                      </div>
                      <span className="text-[10px] text-slate-400">Auto-refresh ativo</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-1000 ease-linear rounded-full"
                        style={{ width: `${Math.max(5, (waQrCountdown / 20) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* QR Code Container */}
                  <div className="relative inline-block rounded-2xl bg-white p-3 shadow-2xl">
                    <img
                      src={waQrCode}
                      alt="WhatsApp QR Code"
                      className="h-60 w-60 object-contain rounded-xl"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Aguardando leitura do QR Code pelo WhatsApp...</span>
                  </div>

                  {/* Step by step Instructions */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-xs text-slate-300 space-y-1.5">
                    <p className="font-bold text-white mb-1">Como conectar no seu celular:</p>
                    <p>1. Abra o WhatsApp no aparelho que enviará os vouchers.</p>
                    <p>2. Toque nos <strong>três pontinhos</strong> (Android) ou <strong>Configurações</strong> (iPhone).</p>
                    <p>3. Toque em <strong>Aparelhos Conectados</strong> &gt; <strong>Conectar um aparelho</strong>.</p>
                    <p>4. Aponte a câmera para o QR Code acima <em>imediatamente</em>.</p>
                  </div>

                  {/* Troubleshooting notes */}
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-3 text-left text-[11px] text-amber-200/90 space-y-1">
                    <p className="font-bold text-amber-300 flex items-center gap-1">
                      ⚠️ O WhatsApp deu erro ao escanear?
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      <li>
                        <strong>QR Code expirado:</strong> O WhatsApp cancela o código a cada 20s. Mantenha a câmera apontada na tela enquanto o contador corre.
                      </li>
                      <li>
                        <strong>Limite de 4 aparelhos:</strong> Se o seu WhatsApp já estiver conectado em 4 computadores/navegadores, remova um deles no celular antes de escanear.
                      </li>
                    </ul>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex flex-wrap gap-2 justify-center pt-1">
                    <button
                      type="button"
                      onClick={handleRefreshEvolutionQr}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white cursor-pointer transition-all"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Atualizar QR Agora</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetEvolutionSession}
                      disabled={waResettingInstance}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 hover:bg-rose-900/40 px-3.5 py-2 text-xs font-bold text-rose-300 hover:text-rose-100 cursor-pointer transition-all"
                    >
                      <RotateCcw className={`h-3.5 w-3.5 ${waResettingInstance ? "animate-spin" : ""}`} />
                      <span>{waResettingInstance ? "Reiniciando..." : "Reiniciar Sessão (Novo QR)"}</span>
                    </button>

                    {waConfig.apiUrl && (
                      <a
                        href={`${waConfig.apiUrl.replace(/\/+$/, "")}/manager`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/40 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:text-cyan-100 cursor-pointer transition-all"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Painel Web Evolution ↗</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* PRINT-ONLY EXECUTIVE AUDIT REPORT (CLEAN WHITE PDF FORMAT) */}
      {/* =================================================================== */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          }
          header, nav, button, .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
            background: #ffffff !important;
            color: #0f172a !important;
          }
          .print-break {
            page-break-after: always;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #cbd5e1 !important;
            padding: 6px 10px !important;
            font-size: 11px !important;
          }
          th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            font-weight: 800 !important;
          }
        }
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>

      <div className="print-only p-8 bg-white text-slate-900 max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
              Radar do Rolê • Relatório Master Executivo
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Plataforma de Inteligência de Entretenimento Noturno & B2B SaaS • São Paulo - SP
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-bold text-slate-900">Emissão Oficial</p>
            <p>{new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}</p>
            <p className="text-[10px] text-slate-500">Super Admin: thiagooriginal2002@gmail.com</p>
          </div>
        </div>

        {/* Executive KPIs Box */}
        <div className="my-6 grid grid-cols-4 gap-4">
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Locais Ativos</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">{venues.length}</div>
            <p className="text-[10px] text-slate-500">Baladas, Bares, Motéis</p>
          </div>
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Visualizações Feed</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">{totalGlobalViews.toLocaleString("pt-BR")}</div>
            <p className="text-[10px] text-slate-500">Tráfego total em SP</p>
          </div>
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Leads Lista VIP</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">{leads.length > 0 ? leads.length : totalGlobalLeads}</div>
            <p className="text-[10px] text-slate-500">Contatos em portaria</p>
          </div>
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
            <span className="text-[10px] font-bold text-slate-500 uppercase">MRR Recorrente</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">R$ {saasMetrics.mrr.toLocaleString("pt-BR")},00</div>
            <p className="text-[10px] text-slate-500">ARR: R$ {saasMetrics.arr.toLocaleString("pt-BR")},00</p>
          </div>
        </div>

        {/* Venues Table */}
        <div className="my-6">
          <h2 className="text-sm font-black uppercase text-slate-900 mb-2">
            Desempenho Geral por Estabelecimento Cadastrado
          </h2>
          <table>
            <thead>
              <tr>
                <th>Nome do Estabelecimento</th>
                <th>Categoria</th>
                <th>Bairro</th>
                <th>Plano</th>
                <th>Valor/Mês</th>
                <th>Views</th>
                <th>WhatsApp</th>
                <th>Leads VIP</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((v) => {
                const m = getVenueMetrics(v.id, v.name);
                return (
                  <tr key={v.id}>
                    <td className="font-bold">{v.name}</td>
                    <td className="capitalize">{v.category}</td>
                    <td>{v.neighborhood}</td>
                    <td>{v.plan || "Semestral"}</td>
                    <td>R$ {v.planPrice || 59},00</td>
                    <td>{m.impressionsFeed.toLocaleString("pt-BR")}</td>
                    <td>{m.whatsappDirectClicks.toLocaleString("pt-BR")}</td>
                    <td>{m.vipListLeads}</td>
                    <td>★ {v.rating}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 12-Month Projections */}
        <div className="my-6">
          <h2 className="text-sm font-black uppercase text-slate-900 mb-2">
            Projeção Financeira de Assinaturas SaaS (Próximos 12 Meses)
          </h2>
          <table>
            <thead>
              <tr>
                <th>Mês / Período</th>
                <th>Casas Ativas</th>
                <th>Cenário Conservador (8%)</th>
                <th>Cenário Realista (15%)</th>
                <th>Cenário Agressivo (22%)</th>
              </tr>
            </thead>
            <tbody>
              {saasProjections.slice(0, 6).map((p) => (
                <tr key={p.month}>
                  <td className="font-bold">{p.month}</td>
                  <td>{p.activeVenues} parceiros</td>
                  <td>R$ {p.conservativeMRR.toLocaleString("pt-BR")},00</td>
                  <td className="font-bold">R$ {p.realisticMRR.toLocaleString("pt-BR")},00</td>
                  <td>R$ {p.aggressiveMRR.toLocaleString("pt-BR")},00</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Stamp & Sign */}
        <div className="mt-12 pt-6 border-t border-slate-300 flex items-center justify-between text-xs text-slate-500">
          <div>
            <p className="font-bold text-slate-900">RADAR DO ROLÊ TECNOLOGIA LTDA.</p>
            <p>Chave Pix Oficial: thiagooriginal2002@gmail.com</p>
          </div>
          <div className="text-right">
            <div className="inline-block border-t border-slate-900 pt-1 px-8 font-bold text-slate-900">
              Thiago (Diretoria Executiva & Super Admin)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
