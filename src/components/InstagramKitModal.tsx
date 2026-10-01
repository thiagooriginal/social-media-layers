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
  LayoutGrid,
  FileText,
  Heart,
  MessageCircle,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";

interface InstagramKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CreativeAsset {
  id: string;
  title: string;
  category: "Papel Rasgado & Manifesto" | "Benefícios & Artigos" | "Lançamento 3D";
  format: "Feed (1:1)" | "Story (9:16)" | "Carrossel (1:1)";
  badge: string;
  imageSrc: string;
  description: string;
  articleSummary: string;
  caption: string;
  hashtags: string[];
}

export const CREATIVE_ASSETS: CreativeAsset[] = [
  // ==================== COLEÇÃO ESTILO PAPEL RASGADO & MANIFESTO ====================
  {
    id: "paper-revolution",
    title: "A Revolução do Rolê em SP: O Fim do Perrengue",
    category: "Papel Rasgado & Manifesto",
    format: "Feed (1:1)",
    badge: "Estilo Papel Rasgado • Manifesto",
    imageSrc: "/marketing/insta-paper-1-revolucao.jpg",
    description: "Arte estilo papel rasgado urbano sobre cenário noturno de São Paulo, proclamando a nova era da noite paulistana.",
    articleSummary: "Artigo manifesto sobre o fim da frustração de pesquisar onde sair e a chegada de uma solução definitiva em tempo real.",
    caption: `📰 MANIFESTO: O FIM DO PERRENGUE NOTURNO EM SÃO PAULO 📡🔥

Quantas noites você já perdeu tentando decidir onde ir?
- Abrindo 15 abas no navegador;
- Mandando direct para promoter que não responde;
- Chegando na porta da balada e dando de cara com fila quilométrica ou preço abusivo;
- Ou pior: chegar e a casa estar completamente deserta.

Isso acaba hoje. Nasceu o RADAR DO ROLÊ: a primeira plataforma inteligente que mapeia a noite paulistana em tempo real por raio de proximidade.

O rolê que você quer, a distância exata de você, a estimativa do Uber e a sua Lista VIP garantida com um clique.

Bem-vindo à nova era da noite de SP. 🪩✨

👉 Toque no link da bio e ative o seu Radar hoje!`,
    hashtags: [
      "#radardorole",
      "#revolucaodorole",
      "#baladasp",
      "#noitesp",
      "#spnightlife",
      "#fimdoperrengue",
      "#ondeiremsp",
      "#listavipsp",
      "#saopaulonight",
    ],
  },
  {
    id: "paper-benefits",
    title: "Por Que o Radar Muda o Seu Fim de Semana (4 Benefícios)",
    category: "Benefícios & Artigos",
    format: "Feed (1:1)",
    badge: "Artigo Educativo • 4 Benefícios",
    imageSrc: "/marketing/insta-paper-2-beneficios.jpg",
    description: "Post com recortes de papel rasgado detalhando os 4 grandes benefícios que transformam a experiência do usuário.",
    articleSummary: "Guia prático com os 4 superpoderes do app: Lista VIP, Uber ao vivo, Radar geográfico e After 5h+.",
    caption: `POR QUE O RADAR DO ROLÊ MUDA COMPLETAMENTE O SEU FIM DE SEMANA? 🍸📲

Se liga nos 4 benefícios que você só encontra aqui:

1️⃣ LISTA VIP GARANTIDA:
Chega de humilhação pedindo nome na lista. Entre direto na Lista VIP oficial das melhores casas com benefícios como Welcome Drink e desconto real na entrada.

2️⃣ ESTIMATIVA DE UBER EM TEMPO REAL:
Descubra quanto vai dar a corrida até a porta da balada antes mesmo de começar a se arrumar. Economia de tempo e de dinheiro.

3️⃣ RADAR POR PROXIMIDADE (2km, 5km, 10km):
Acabou o rolê numa balada e quer continuar? O radar detecta o que está fervendo perto de onde você está agora.

4️⃣ MODO AFTER 5H+ & 24 HORAS:
A noite não precisa acabar às 05:00. Mapeamos os afters mais lendários e baladas 24h com segurança e credenciamento oficial.

Salva esse post para consultar toda sexta-feira! 💾✨`,
    hashtags: [
      "#beneficiosdanoite",
      "#listavip",
      "#dicasp",
      "#guianoturno",
      "#aftersp",
      "#uberbalada",
      "#radardorole",
      "#noitepaulistana",
    ],
  },
  {
    id: "paper-filters-quiz",
    title: "Qual é o seu Estilo de Rolê Hoje? (Enquete / Filtros)",
    category: "Benefícios & Artigos",
    format: "Feed (1:1)",
    badge: "Enquete Interativa • Filtros",
    imageSrc: "/marketing/insta-paper-3-filtros-quiz.jpg",
    description: "Post de alto engajamento em papel rasgado apresentando os 4 principais filtros inteligentes da plataforma.",
    articleSummary: "Post dinâmico estimulando a audiência a comentar nos comentários qual categoria mais representa a noite deles.",
    caption: `SEXTA-FEIRA CHEGOU: QUAL É O SEU ESTILO DE ROLÊ HOJE? 👇🔥

No Radar do Rolê você não perde tempo procurando o que não tem nada a ver com você. Você filtra pela vibe exata da noite:

1. 💥 Balada & Pista: De techno a funk, as pistas mais quentes da capital.
2. 🍹 Bares & Coquetelaria: Drinks autorais, petiscos premium e ambiente para trocar ideia.
3. 🌙 Modo After 5h+: Pra quem tem fôlego e só volta pra casa quando o sol tiver alto.
4. ✨ Motéis & Suítes: Para fechar a noite com hidromassagem, privacidade e conforto vip.

Comenta aqui embaixo: 1, 2, 3 ou 4?
Marque aquele amigo que nunca sabe onde ir! 👇`,
    hashtags: [
      "#sextou",
      "#qualoseurole",
      "#enquetedanoite",
      "#baladasp",
      "#baresdesp",
      "#afterhoursp",
      "#moteissp",
      "#radardorole",
    ],
  },
  {
    id: "paper-lifestyle",
    title: "Seu Rolê, Sua Vibe, Sem Perder Tempo",
    category: "Papel Rasgado & Manifesto",
    format: "Feed (1:1)",
    badge: "Lifestyle • Conexão & Amigos",
    imageSrc: "/marketing/insta-paper-4-lifestyle-vibe.jpg",
    description: "Foto Polaroid com recorte de papel rasgado mostrando amigos celebrando na balada, partículas neon e a promessa de curtir sem estresse.",
    articleSummary: "Mensagem emocional sobre a experiência de celebrar com amigos e a garantia de nunca mais perder tempo na noite.",
    caption: `SEU ROLÊ. SUA VIBE. SEM PERDER TEMPO. 🥂🖤

A melhor parte da noite é aquela em que todo mundo se olha na pista e pensa: "Caramba, que lugar incrível!".

O Radar do Rolê nasceu para que você passe menos tempo em telas e mais tempo brindando com quem você gosta.

Nós cuidamos da lista, do trajeto e do horário para você só se preocupar em viver a história.

Abra o Radar, chame o bonde e aproveite a noite paulistana do jeito que ela deve ser vivida! 🚀🍾

Link do app disponível na nossa bio! 🔗`,
    hashtags: [
      "#vibeunica",
      "#amigos",
      "#comemoracao",
      "#noitesp",
      "#lifestylepaulistano",
      "#baladasp",
      "#radardorole",
    ],
  },

  // ==================== COLEÇÃO LANÇAMENTO & TECH ====================
  {
    id: "feed-launch",
    title: "Post Oficial de Lançamento (Visual Cyberpunk)",
    category: "Lançamento 3D",
    format: "Feed (1:1)",
    badge: "Oficial • Lançamento 3D",
    imageSrc: "/marketing/insta-feed-1.jpg",
    description: "Capa cinematográfica de lançamento para o Feed do Instagram com multidão, luzes neon e o radar do app em smartphone 3D.",
    articleSummary: "Apresentação visual completa da interface e do conceito da plataforma.",
    caption: `📡 SEXTOU EM SÃO PAULO? Chegou o RADAR DO ROLÊ! 🔥

Esquece ter que abrir 10 abas no Instagram para descobrir onde tem festa boa hoje. O Radar do Rolê reúne o melhor da vida noturna paulistana em tempo real na palma da sua mão!

✨ O que você encontra no Radar do Rolê:
🎟️ Entrar na Lista VIP com 1 toque
🚗 Estimativa de corrida por app até a porta
🌙 Modo After 5h+ e baladas 24 Horas
📍 Radar de proximidade (saiba o que está bombando a 2km de você)
🏩 Motéis e suítes para fechar a noite com chave de ouro

👉 Toque no link da bio e descubra seu rolê de hoje agora mesmo!`,
    hashtags: ["#radardorole", "#baladasp", "#noitesp", "#spnightlife", "#listavip", "#aftersp"],
  },
  {
    id: "story-launch",
    title: "Story & Reels Vertical (9:16)",
    category: "Lançamento 3D",
    format: "Story (9:16)",
    badge: "Story • 9:16 • Alta Conversão",
    imageSrc: "/marketing/insta-story-1.jpg",
    description: "Criativo vertical de alto impacto feito sob medida para Instagram Stories com stickers de 'Arrasta pra cima' e Lista VIP.",
    articleSummary: "Template dinâmico para Stories diários com chamada para link na bio.",
    caption: `Sabe onde vai dar bom hoje? 🚀
Não passe perrengue na porta da balada.
Garante seu nome na Lista VIP no link do story! 🎟️✨`,
    hashtags: ["#radardorolesp", "#storydodia", "#sextou", "#noitesp"],
  },
  {
    id: "feed-features",
    title: "Post de Recursos & Guia da Noite (Carrossel)",
    category: "Lançamento 3D",
    format: "Carrossel (1:1)",
    badge: "Funcionalidades • VIP & Uber",
    imageSrc: "/marketing/insta-feed-2-features.jpg",
    description: "Mockup 3D com duas telas: Mapa Radar com estimativa de corrida e Convite VIP com QR Code e Welcome Drink.",
    articleSummary: "Demonstração técnica da estimativa de transporte e do passe digital VIP.",
    caption: `O SEU GUIA DEFINITIVO DA NOITE PAULISTANA 🍸📲

Você sabia que no Radar do Rolê você não só descobre as festas mais quentes, mas também:
1️⃣ Confere a estimativa do Uber em tempo real antes de sair de casa;
2️⃣ Resgata seu convite VIP digital com Welcome Drink incluso;
3️⃣ Acha os melhores afters que amanhecem abertos até o meio-dia!

Salva esse post para nunca mais ficar sem saber onde ir no fim de semana! 💾🚀`,
    hashtags: ["#dicasp", "#guianoturnosp", "#spnightlife", "#listavipsaopaulo", "#baladasp"],
  },
];

const BIO_PROFILE_TEMPLATE = `📡 O Radar Oficial da Vida Noturna de São Paulo
🎟️ Listas VIP & Welcome Drinks exclusivos
🚗 Estimativa de Uber & Modo After 5h+
📍 Baladas, Bares, Afters e Motéis em SP
👇 Encontre onde o rolê está bombando agora:
https://radardorole.com.br`;

export function InstagramKitModal({ isOpen, onClose }: InstagramKitModalProps) {
  const [activeTab, setActiveTab] = useState<"grid-preview" | "assets-list">("grid-preview");
  const [selectedAssetId, setSelectedAssetId] = useState<string>("paper-revolution");
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentAsset =
    CREATIVE_ASSETS.find((a) => a.id === selectedAssetId) || CREATIVE_ASSETS[0];

  const handleCopyCaption = (asset: CreativeAsset) => {
    const fullText = `${asset.caption}\n\n${asset.hashtags.join(" ")}`;
    navigator.clipboard.writeText(fullText);
    setCopiedCaption(true);
    toast.success("Artigo e legenda copiados para o Instagram!", {
      description: "Texto pronto com chamada para ação e hashtags de SP.",
    });
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const handleCopyBio = () => {
    navigator.clipboard.writeText(BIO_PROFILE_TEMPLATE);
    setCopiedBio(true);
    toast.success("Bio do Instagram copiada!", {
      description: "Pronta para colar na descrição do seu perfil @radardorolesp.",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[94vh] rounded-3xl border border-pink-500/30 bg-[#0a0d18] text-white shadow-[0_0_70px_-15px_rgba(236,72,153,0.4)] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-3.5 bg-gradient-to-r from-purple-950/70 via-[#0a0d18] to-pink-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-[0_0_20px_rgba(244,63,94,0.5)]">
              <Instagram className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  Kit Visual Instagram • Estilo Papel Rasgado & Benefícios
                </h3>
                <span className="hidden sm:inline-block rounded-full bg-pink-500/20 px-2.5 py-0.5 text-[10px] font-black text-pink-300 border border-pink-500/30">
                  @radardorolesp
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Texturas de papel rasgado, fitas adesivas, filtros retrô e artigos estratégicos sobre a revolução da noite.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-2.5 bg-black/40 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("grid-preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "grid-preview"
                  ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Simulador de Grade 3x3 (Feed)</span>
            </button>

            <button
              onClick={() => setActiveTab("assets-list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "assets-list"
                  ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Artes Individuais & Artigos ({CREATIVE_ASSETS.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handleCopyBio}
              className="inline-flex items-center gap-1 rounded-lg border border-pink-500/30 bg-pink-500/10 px-2.5 py-1 text-[11px] font-bold text-pink-300 hover:bg-pink-500/20 transition-all cursor-pointer"
            >
              {copiedBio ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedBio ? "Bio Copiada!" : "Copiar Bio"}</span>
            </button>
            <button
              onClick={handleCopyAppLink}
              className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="h-3 w-3 text-emerald-400" /> : <Share2 className="h-3 w-3" />}
              <span>{copiedLink ? "Link Copiado!" : "Link na Bio"}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: SIMULADOR DE GRADE DO FEED 3X3 */}
          {activeTab === "grid-preview" && (
            <div className="space-y-6">
              {/* Instagram Profile Header Simulation */}
              <div className="rounded-2xl border border-white/10 bg-[#070913] p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  {/* Avatar with Rainbow Story Ring */}
                  <div className="relative">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-[0_0_25px_rgba(244,63,94,0.4)]">
                      <div className="h-full w-full rounded-full bg-[#070a11] flex items-center justify-center overflow-hidden border-2 border-[#070a11]">
                        <img
                          src="/marketing/insta-paper-1-revolucao.jpg"
                          alt="Radar do Rolê Avatar"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profile Meta & Bio */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 justify-between">
                      <div>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <h4 className="text-base sm:text-lg font-black text-white">radardorolesp</h4>
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-black text-black">
                            ✓
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">Radar do Rolê • São Paulo</p>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={handleCopyBio}
                          className="rounded-xl border border-pink-500/40 bg-pink-500/15 px-3 py-1.5 text-xs font-bold text-pink-200 hover:bg-pink-500/25 transition-all"
                        >
                          Copiar Texto da Bio
                        </button>
                        <a
                          href="https://www.instagram.com/radardorolesp"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-all"
                        >
                          Ver no Insta ↗
                        </a>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-200 whitespace-pre-line leading-relaxed border-t border-white/5 pt-2 text-left">
                      {BIO_PROFILE_TEMPLATE}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3x3 Grid Display */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                      Grade Harmônica do Feed (Estilo Papel Rasgado & Benefícios)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Toque em qualquer post para abrir o artigo correspondente e copiar a legenda.
                    </p>
                  </div>
                  <span className="text-xs text-pink-400 font-bold">Grade 3x3 Ativa</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                  {CREATIVE_ASSETS.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => {
                        setSelectedAssetId(asset.id);
                        setActiveTab("assets-list");
                      }}
                      className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black cursor-pointer shadow-lg hover:border-pink-500/50 hover:shadow-[0_0_25px_rgba(236,72,153,0.3)] transition-all"
                    >
                      <img
                        src={asset.imageSrc}
                        alt={asset.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Top Badge */}
                      <div className="absolute top-2 left-2 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[9px] font-black text-white border border-white/20 max-w-[85%] truncate">
                        {asset.badge}
                      </div>

                      {/* Hover Overlay with Caption Preview */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                        <p className="text-xs font-black text-white leading-tight line-clamp-2">
                          {asset.title}
                        </p>
                        <p className="text-[10px] text-pink-300 font-bold mt-1">
                          Ver artigo e copiar legenda →
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETALHES DAS ARTES INDIVIDUAIS & ARTIGOS */}
          {activeTab === "assets-list" && (
            <div className="space-y-6">
              {/* Asset Selector Carousel / Pills */}
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">
                  Selecione o post para ver a arte em tamanho real e o artigo completo:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {CREATIVE_ASSETS.map((asset) => {
                    const isSelected = asset.id === selectedAssetId;
                    return (
                      <button
                        key={asset.id}
                        onClick={() => setSelectedAssetId(asset.id)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-pink-500 bg-pink-500/15 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                        }`}
                      >
                        <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black">
                          <img
                            src={asset.imageSrc}
                            alt={asset.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-black uppercase text-pink-400 block truncate">
                            {asset.badge}
                          </span>
                          <p className="text-[11px] font-bold text-white truncate">{asset.title}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Inspector Box */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                {/* Visual Preview */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center">
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
                    <div className="absolute top-2.5 left-2.5 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-white border border-white/20">
                      {currentAsset.badge}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 w-full max-w-[380px]">
                    <button
                      onClick={() => handleDownloadAsset(currentAsset)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 px-4 py-3 text-xs font-black text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Baixar Esta Imagem (JPG Alta Resolução)</span>
                    </button>
                  </div>
                </div>

                {/* Article & Caption Text */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400">
                        Artigo & Legenda para o Instagram
                      </span>
                      <button
                        onClick={() => handleCopyCaption(currentAsset)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-colors bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        {copiedCaption ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Artigo Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copiar Artigo Completo</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h3 className="mt-1 text-base font-black text-white">{currentAsset.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{currentAsset.description}</p>

                    {/* Preformatted Caption Box */}
                    <div className="mt-3 rounded-xl border border-white/10 bg-[#070a11] p-4 text-xs text-slate-200 font-sans whitespace-pre-line leading-relaxed max-h-[250px] overflow-y-auto">
                      {currentAsset.caption}
                    </div>

                    {/* Hashtags Pills */}
                    <div className="mt-3">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                        Hashtags Estratégicas para o Algoritmo de SP:
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

                  {/* Strategic Tips Box */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                    <span className="font-bold flex items-center gap-1.5">
                      <span>💡</span> Por que este estilo funciona no Instagram?
                    </span>
                    <p className="text-[11px] text-amber-300/90 mt-1">
                      O estilo <strong>papel rasgado com fita adesiva</strong> quebra a monotonia do feed e transmite autenticidade urbana ("street art"). Combinado com luzes neon e tipografia editorial, gera alta taxa de salvamentos e cliques para o link na bio!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 bg-[#070a11] px-4 sm:px-6 py-3.5 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="h-4 w-4 text-pink-400" />
            <span>Coleção completa: Estilo Papel Rasgado, Benefícios, Enquetes & Lifestyle</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                CREATIVE_ASSETS.forEach((asset) => handleDownloadAsset(asset));
                toast.success(`Download de todas as ${CREATIVE_ASSETS.length} artes iniciado!`);
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Baixar Todas as {CREATIVE_ASSETS.length} Artes (ZIP/JPG)</span>
            </button>

            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl bg-pink-600 hover:bg-pink-500 px-4 py-2 text-xs font-black text-white transition-colors active:scale-95 cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
