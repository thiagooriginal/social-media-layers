import React, { useState } from "react";
import {
  X,
  Instagram,
  Download,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Share2,
  Smartphone,
  Flame,
  CheckCircle2,
  Compass,
} from "lucide-react";
import { toast } from "sonner";

interface InstagramKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreativeAsset {
  id: string;
  title: string;
  format: "Feed (1:1)" | "Story (9:16)" | "Carrossel (1:1)";
  badge: string;
  imageSrc: string;
  description: string;
  caption: string;
  hashtags: string[];
}

const CREATIVE_ASSETS: CreativeAsset[] = [
  {
    id: "feed-launch",
    title: "Post Oficial de Lançamento",
    format: "Feed (1:1)",
    badge: "Oficial • Lançamento",
    imageSrc: "/marketing/insta-feed-1.jpg",
    description: "Capa cinematográfica de lançamento para o Feed do Instagram com multidão, luzes neon e o radar do app.",
    caption: `📡 SEXTOU EM SÃO PAULO? Chegou o RADAR DO ROLÊ! 🔥

Esquece ter que abrir 10 abas no Instagram para descobrir onde tem festa boa hoje. O Radar do Rolê reúne o melhor da vida noturna paulistana em tempo real na palma da sua mão!

✨ O que você encontra no Radar do Rolê:
🎟️ Entrar na Lista VIP com 1 toque
🚗 Estimativa de corrida por app até a porta
🌙 Modo After 5h+ e baladas 24 Horas
📍 Radar de proximidade (saiba o que está bombando a 2km de você)
🏩 Motéis e suítes para fechar a noite com chave de ouro

👉 Toque no link da bio e descubra seu rolê de hoje agora mesmo!`,
    hashtags: [
      "#radardorole",
      "#baladasp",
      "#noitesp",
      "#spnightlife",
      "#listavip",
      "#baladasp2026",
      "#aftersp",
      "#baladaeletronica",
      "#funksp",
      "#ondeiremsp",
    ],
  },
  {
    id: "story-launch",
    title: "Story & Reels Vertical",
    format: "Story (9:16)",
    badge: "Story • 9:16 • Alta Conversão",
    imageSrc: "/marketing/insta-story-1.jpg",
    description: "Criativo vertical de alto impacto feito sob medida para Instagram Stories com stickers de 'Arrasta pra cima' e Lista VIP.",
    caption: `Sabe onde vai dar bom hoje? 🚀
Não passe perrengue na porta da balada.
Garante seu nome na Lista VIP no link do story! 🎟️✨`,
    hashtags: ["#radardorolesp", "#storydodia", "#sextou", "#noitesp"],
  },
  {
    id: "feed-features",
    title: "Post de Recursos & Guia da Noite",
    format: "Carrossel (1:1)",
    badge: "Funcionalidades • VIP & Uber",
    imageSrc: "/marketing/insta-feed-2-features.jpg",
    description: "Mockup 3D com duas telas: Mapa Radar com estimativa de corrida e Convite VIP com QR Code e Welcome Drink.",
    caption: `O SEU GUIA DEFINITIVO DA NOITE PAULISTANA 🍸📲

Você sabia que no Radar do Rolê você não só descobre as festas mais quentes, mas também:
1️⃣ Confere a estimativa do Uber em tempo real antes de sair de casa;
2️⃣ Resgata seu convite VIP digital com Welcome Drink incluso;
3️⃣ Acha os melhores afters que amanhecem abertos até o meio-dia!

Salva esse post para nunca mais ficar sem saber onde ir no fim de semana! 💾🚀`,
    hashtags: [
      "#dicasp",
      "#guianoturnosp",
      "#spnightlife",
      "#listavipsaopaulo",
      "#baladasp",
      "#afterhoursp",
    ],
  },
];

const BIO_PROFILE_TEMPLATE = `📡 O Radar Oficial da Vida Noturna de São Paulo
🎟️ Listas VIP e Welcome Drinks exclusivos
🚗 Estimativa de corrida & Modo After 5h+
📍 Baladas, Bares, Afters e Motéis em SP
👇 Encontre onde o rolê está bombando agora:`;

export function InstagramKitModal({ isOpen, onClose }: InstagramKitModalProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string>("feed-launch");
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentAsset =
    CREATIVE_ASSETS.find((a) => a.id === selectedAssetId) || CREATIVE_ASSETS[0];

  const handleCopyCaption = () => {
    const fullText = `${currentAsset.caption}\n\n${currentAsset.hashtags.join(" ")}`;
    navigator.clipboard.writeText(fullText);
    setCopiedCaption(true);
    toast.success("Legenda copiada para o Instagram!", {
      description: "Agora é só colar no seu post ou story com as hashtags inclusas.",
    });
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const handleCopyBio = () => {
    navigator.clipboard.writeText(BIO_PROFILE_TEMPLATE);
    setCopiedBio(true);
    toast.success("Bio do Instagram copiada!", {
      description: "Pronta para colar na descrição do perfil do Instagram @radardorolesp.",
    });
    setTimeout(() => setCopiedBio(false), 2500);
  };

  const handleCopyAppLink = () => {
    const link = window.location.origin;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success("Link do aplicativo copiado!", {
      description: "Cole na bio ou na figurinha de Link dos Stories.",
    });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadAsset = (asset: CreativeAsset) => {
    const a = document.createElement("a");
    a.href = asset.imageSrc;
    a.download = `radar-do-role-${asset.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Download de ${asset.title} iniciado!`, {
      description: "Arquivo JPG em alta qualidade salvo no seu dispositivo.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-3xl border border-pink-500/30 bg-[#0a0d18] text-white shadow-[0_0_60px_-15px_rgba(236,72,153,0.4)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-gradient-to-r from-purple-950/60 via-[#0a0d18] to-pink-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-[0_0_20px_rgba(244,63,94,0.5)]">
              <Instagram className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Kit Visual Instagram • Radar do Rolê
                </h3>
                <span className="rounded-full bg-pink-500/20 px-2.5 py-0.5 text-[10px] font-black text-pink-300 border border-pink-500/30">
                  @radardorolesp
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Artes prontas em alta definição, legendas magnéticas e templates para feed e stories.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top Banner: Perfil Oficial & Ações Rápidas */}
          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-r from-pink-950/30 via-purple-950/30 to-cyan-950/30 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                  <div className="h-full w-full rounded-[14px] bg-[#070a11] flex items-center justify-center overflow-hidden">
                    <img
                      src="/marketing/insta-feed-1.jpg"
                      alt="Avatar Radar do Rolê"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white shadow">
                  ✨
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-black text-white">Radar do Rolê São Paulo</h4>
                  <span className="text-xs text-cyan-400 font-bold">@radardorolesp</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Pronto para bombar no Instagram! Copie a Bio oficial ou baixe as fotos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={handleCopyBio}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-pink-500/40 bg-pink-500/15 px-3 py-2 text-xs font-bold text-pink-200 hover:bg-pink-500/25 transition-all shadow-sm active:scale-95"
              >
                {copiedBio ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedBio ? "Bio Copiada!" : "Copiar Bio do Insta"}</span>
              </button>

              <button
                onClick={handleCopyAppLink}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-500/25 transition-all shadow-sm active:scale-95"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
                <span>{copiedLink ? "Link Copiado!" : "Copiar Link do App"}</span>
              </button>
            </div>
          </div>

          {/* Asset Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Escolha o Criativo para Visualizar & Baixar:
              </h4>
              <span className="text-xs text-pink-400 font-bold">3 Artes Disponíveis</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {CREATIVE_ASSETS.map((asset) => {
                const isSelected = asset.id === selectedAssetId;
                return (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "border-pink-500 bg-pink-500/15 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                    }`}
                  >
                    <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-black">
                      <img
                        src={asset.imageSrc}
                        alt={asset.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="inline-block text-[10px] font-black uppercase text-pink-400 mb-0.5">
                        {asset.format}
                      </span>
                      <p className="text-xs font-bold text-white truncate">{asset.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{asset.badge}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Creative Showcase & Copy Station */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
            {/* Visual Preview */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <div
                className={`relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black ${
                  currentAsset.format.includes("9:16")
                    ? "max-h-[460px] aspect-[9/16]"
                    : "w-full max-w-[380px] aspect-square"
                }`}
              >
                <img
                  src={currentAsset.imageSrc}
                  alt={currentAsset.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-white border border-white/20">
                  {currentAsset.badge}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 w-full max-w-[380px]">
                <button
                  onClick={() => handleDownloadAsset(currentAsset)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 px-4 py-3 text-xs font-black text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:brightness-110 active:scale-95 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Baixar Imagem em Alta Resolução</span>
                </button>
              </div>
            </div>

            {/* Caption & Copy Text Station */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400">
                    Legenda Pronta para o Post
                  </span>
                  <button
                    onClick={handleCopyCaption}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-colors bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-lg"
                  >
                    {copiedCaption ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copiar Legenda Completa</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="mt-1 text-xs text-slate-400">{currentAsset.description}</p>

                {/* Preformatted Caption Box */}
                <div className="mt-3 rounded-xl border border-white/10 bg-[#070a11] p-3.5 text-xs text-slate-200 font-sans whitespace-pre-line leading-relaxed max-h-[220px] overflow-y-auto">
                  {currentAsset.caption}
                </div>

                {/* Hashtags Pills */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                    Hashtags Estratégicas para Algoritmo de SP:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentAsset.hashtags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[11px] font-mono text-cyan-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tips for Posting */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                <span className="font-bold flex items-center gap-1.5">
                  <span>💡</span> Dica de Postagem:
                </span>
                <p className="text-[11px] text-amber-300/90 mt-1">
                  Poste nas quintas e sextas-feiras entre <strong>18:00 e 21:00</strong> para atingir o público no momento exato em que estão decidindo para onde vão sair em São Paulo!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 bg-[#070a11] px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="h-4 w-4 text-pink-400" />
            <span>Imagens geradas exclusivamente para a campanha oficial do Radar do Rolê</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                CREATIVE_ASSETS.forEach((asset) => handleDownloadAsset(asset));
                toast.success("Download de todas as 3 artes iniciado!");
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition-all active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Baixar Pacote Completo (3 Artes)</span>
            </button>

            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl bg-pink-600 hover:bg-pink-500 px-4 py-2 text-xs font-black text-white transition-colors active:scale-95"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
