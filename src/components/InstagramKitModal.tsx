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
  category: string;
  format: "Feed (1:1)" | "Story (9:16)" | "Carrossel (1:1)";
  badge: string;
  imageSrc: string;
  description: string;
  articleSummary: string;
  caption: string;
  hashtags: string[];
}

export const CREATIVE_ASSETS: CreativeAsset[] = [
  // ==================== LINHA EDITORIAL 10 POSTS FEED INSTAGRAM ====================
  {
    id: "feed-1-perrengue",
    title: "Post 01: O Fim do Perrengue Noturno em SP",
    category: "Manifesto & Solução",
    format: "Feed (1:1)",
    badge: "01 • O Fim do Perrengue",
    imageSrc: "/marketing/feed-arte-1-perrengue.jpg",
    description: "Estilo papel rasgado urbano sobre cenário noturno de São Paulo: o basta definitivo para a perda de tempo antes de sair.",
    articleSummary: "Manifesto impactante sobre o problema crônico de perder horas procurando onde sair e a virada de chave.",
    caption: `📰 MANIFESTO: O FIM DO PERRENGUE NOTURNO EM SÃO PAULO 📡🔥

Quantas horas da sua sexta-feira você já perdeu tentando decidir onde ir?
- 15 abas abertas no navegador sem chegar a lugar nenhum;
- Grupos de WhatsApp onde ninguém se decide e o rolê esfria;
- Mandar direct para promoter e esperar horas por resposta;
- Chegar na porta da balada e dar de cara com fila quilométrica ou entrada com preço abusivo;
- Ou o pior de todos: chegar no local e encontrar a casa totalmente deserta.

A busca por diversão em São Paulo virou um perrengue crônico. Mas isso acaba agora.

Nasceu o RADAR DO ROLÊ: a primeira plataforma inteligente desenvolvida para conectar você ao lugar perfeito em tempo real. O rolê que você quer, a distância exata de você, a estimativa do Uber e a sua Lista VIP garantida com um toque.

Bem-vindo à nova era da noite paulistana. 🪩✨

👉 Siga o nosso perfil @radardorolesp e ative as notificações para ser um dos primeiros a ter acesso!`,
    hashtags: [
      "#radardorole",
      "#noitesp",
      "#baladasp",
      "#fimdoperrengue",
      "#spnightlife",
      "#ondeiremsp",
      "#roleperfeito",
      "#saopaulonight",
      "#lifestylepaulistano",
    ],
  },
  {
    id: "feed-2-radar",
    title: "Post 02: O Radar Inteligente em Tempo Real",
    category: "Tecnologia & Geolocalização",
    format: "Feed (1:1)",
    badge: "02 • Radar Inteligente",
    imageSrc: "/marketing/feed-arte-2-radar.jpg",
    description: "Sonar de radar tecnológico 3D mapeando festas, bares e lounges por raio de proximidade com estimativa de Uber ao vivo.",
    articleSummary: "Apresentação da tecnologia do Radar: raio dinâmico, lotação ao vivo e estimativa de trajeto.",
    caption: `E SE VOCÊ PUDESSE VER O QUE ESTÁ BOMBAR NA CIDADE AGORA? 📡📍

Chega de dar tiro no escuro no fim de semana. Com o Radar do Rolê, a noite de São Paulo é mapeada em tempo real na palma da sua mão:

🛰️ RAIO DINÂMICO (2km, 5km, 10km):
Saiba quais são as pistas, bares e rooftops mais quentes pertinho de você, sem precisar cruzar a cidade à toa.

🚗 ESTIMATIVA DE UBER EM TEMPO REAL:
Descubra o valor e tempo da corrida até a porta antes mesmo de começar a se arrumar. Economia de tempo e planejamento sem dor de cabeça.

🔥 STATUS DE LOTAÇÃO & VIBE AO VIVO:
Veja se a casa está com fila, lotação ideal ou clima intimista antes de sair de casa.

Tecnologia a favor de quem não tem tempo a perder.

Salva esse post para consultar no fim de semana e manda pro grupo dos amigos indecisos! 💾📲`,
    hashtags: [
      "#radardorole",
      "#tecnologianoturna",
      "#geolocalizacao",
      "#baladasp",
      "#baresdesp",
      "#ubersp",
      "#spnoite",
      "#guianoturno",
      "#roleinteligente",
    ],
  },
  {
    id: "feed-3-match",
    title: "Post 03: O Verdadeiro Match Usuário & Balada",
    category: "Conexão & Match",
    format: "Feed (1:1)",
    badge: "03 • O Match Perfeito",
    imageSrc: "/marketing/feed-arte-3-match.jpg",
    description: "Polaroids sobrepostos com carimbo neon '100% MATCH' entre o gosto musical da pessoa e a vibe do estabelecimento.",
    articleSummary: "Como o algoritmo da plataforma conecta pessoas aos seus lugares dos sonhos sem frustrações.",
    caption: `VOCÊ NÃO PRECISA DE MAIS UM APP DE INDICAÇÕES. VOCÊ PRECISA DE MATCH! 💘⚡

Quantas vezes você saiu com os amigos e foi parar num lugar que:
❌ A música não tinha nada a ver com a sua vibe;
❌ O público parecia de outro planeta;
❌ A cerveja era cara demais e a playlist parecia de rádio antiga?

Isso acontece porque as recomendações comuns são genéricas. No Radar do Rolê, você encontra o VERDADEIRO MATCH entre o seu estilo e os estabelecimentos:

🎧 Seu gênero musical indispensável (Techno, Trap, Funk, House, MPB, Indie, Sertanejo);
🍹 Sua atmosfera ideal (Rooftop aberto, porão underground, coquetelaria intimista);
💵 O ticket médio que cabe no seu planejamento;

O resultado? Quando você abre o app, a resposta é imediata: 100% de sinergia com a sua noite.

Comenta aqui embaixo: qual estilo musical NUNCA pode faltar no seu rolê? 👇`,
    hashtags: [
      "#matchdorole",
      "#conexaonoturna",
      "#baladasp",
      "#tribosurbanas",
      "#musicaaovivo",
      "#eletronicasp",
      "#noitepaulistana",
      "#rolenamedida",
    ],
  },
  {
    id: "feed-4-secret-spots",
    title: "Post 04: Bares Secretos & Speakeasys Ocultos",
    category: "Descobertas Exclusivas",
    format: "Feed (1:1)",
    badge: "04 • Lugares Secretos",
    imageSrc: "/marketing/feed-arte-4-secret-spots.jpg",
    description: "Balcão vintage de madeira à meia-luz com coquetel artesanal fumegante e selo neon 'SECRET SPOTS' em papel rasgado.",
    articleSummary: "O guia dos speakeasys e bares sem placa de SP que não aparecem nas pesquisas convencionais.",
    caption: `PORTAS FALSAS, SUBSOLOS E BARES SECRETOS: O QUE O GOOGLE NÃO TE MOSTRA 🍸🤫

Você sabia que alguns dos melhores bares de São Paulo ficam escondidos atrás de geladeiras antigas de açougue, fundos de barbearias ou portas sem qualquer placa na calçada?

Esses são os speakeasys: experiências exclusivas de coquetelaria autoral, luz âmbar intimista e trilha sonora impecável que pouca gente conhece.

Nós passamos meses mapeando esses tesouros ocultos pela cidade:
🥃 Drinks autorais assinados por mixologistas premiados;
🕯️ Ambientes perfeitos para encontros ou conversas sem barulho ensurdecedor;
🔑 Senhas de entrada e horários secretos revelados diretamente na plataforma.

Quer receber a nossa seleção secreta dos 5 bares mais misteriosos de SP?
Comente "SECRETO" aqui nos comentários que mandamos o acesso no seu direct! 📩🔐`,
    hashtags: [
      "#baressecretos",
      "#speakeasysp",
      "#coquetelariasp",
      "#hiddenbars",
      "#spdesconhecida",
      "#drinkssp",
      "#radardorole",
      "#lugaressecretos",
    ],
  },
  {
    id: "feed-5-vip-access",
    title: "Post 05: Passe VIP Digital & Fim da Humilhação no Direct",
    category: "Benefícios & VIP",
    format: "Feed (1:1)",
    badge: "05 • Passe VIP Digital",
    imageSrc: "/marketing/feed-arte-5-vip-access.jpg",
    description: "Pulseira holográfica futurista com QR Code e código neon sobre papel preto amassado e silver tape.",
    articleSummary: "Como o passe digital elimina a burocracia de pedir nome na lista para promoters desconhecidos.",
    caption: `CHEGA DE HUMILHAÇÃO NO DIRECT: CONHEÇA O PASSE VIP DIGITAL 🎟️✨

"Oi promoter, boa tarde! Tem como colocar meu nome e mais 3 amigas na Lista VIP de hoje?"
... e a resposta só chega às 22:30, quando você já desanimou de sair. 🤦‍♀️

Essa era a realidade do jovem paulistano. Até agora.

Com o Passe VIP Digital do Radar do Rolê:
⚡ 1 TOQUE: Seu nome entra na Lista VIP oficial credenciada pelo clube parceiro;
📲 QR CODE OFICIAL: Apresente o código na portaria e entre sem burocracia ou constrangimento;
🍹 WELCOME DRINK: Resgate benefícios exclusivos como drinks de boas-vindas e descontos no consumo;
🛡️ CREDENCIAMENTO SEGURO: Apenas eventos e casas verificadas com garantia de entrada.

A noite foi feita para ser celebrada com respeito e praticidade.

Marque aqui aquele amigo que é viciado em pedir lista VIP no direct! 👇🎫`,
    hashtags: [
      "#listavip",
      "#passevip",
      "#filazero",
      "#baladasp",
      "#welcomedrink",
      "#clubbers",
      "#noitesp",
      "#radardorole",
      "#vipaccess",
    ],
  },
  {
    id: "feed-6-vibe-check",
    title: "Post 06: Vibe Check: Qual Desses 4 Rolês Define a Sua Sexta?",
    category: "Engajamento & Enquete",
    format: "Feed (1:1)",
    badge: "06 • Vibe Check & Enquete",
    imageSrc: "/marketing/feed-arte-6-vibe-check.jpg",
    description: "Colagem urbana de 4 quadrantes divididos por papel rasgado: Rooftop, Neon Club, Speakeasy e Pista Fervendo com stickers.",
    articleSummary: "Enquete interativa para aquecer a comunidade e demonstrar a amplitude de opções do Radar.",
    caption: `SEXTOU COM 'S' DE: QUAL É A SUA VIBE DE HOJE? 🔥👀

São Paulo tem um rolê perfeito para cada estado de espírito. Se você pudesse escolher agora, para onde iria?

1️⃣ ROOFTOP DRINKS: Visual panorâmico da cidade iluminada, brisa fresca, drinks autorais e clima descontraído;
2️⃣ NEON CLUB: Iluminação psicodélica, lasers cortantes, batidas eletrônicas imersivas e dançar até o sol raiar;
3️⃣ COZY SPEAKEASY: Luz baixa, sofás de veludo, alta coquetelaria e aquele papo que rende a noite inteira;
4️⃣ PARTY CROWD: Pista lotada, confete no ar, todo mundo cantando junto com a mão pro alto e energia no teto!

A melhor parte? No Radar do Rolê você filtra exatamente por essas vibes em segundos.

Digite nos comentários o número da sua vibe de hoje: 1, 2, 3 ou 4?
Vamos ver qual tribo domina São Paulo hoje! 👇`,
    hashtags: [
      "#vibecheck",
      "#sextou",
      "#enquetedanoite",
      "#qualoseurole",
      "#rooftopsp",
      "#technosp",
      "#baladasp",
      "#radardorole",
      "#tribosdesp",
    ],
  },
  {
    id: "feed-7-lotado-fds",
    title: "Post 07: Casa Cheia Todo FDS (Para Donos de Baladas & Bares)",
    category: "Parceiros & B2B",
    format: "Feed (1:1)",
    badge: "07 • Para Estabelecimentos",
    imageSrc: "/marketing/feed-arte-7-lotado-fds.jpg",
    description: "Lounge moderno requintado com linhas curvas de neon e faixa de papel rasgado com tipografia 'LOTADO TODO FDS'.",
    articleSummary: "A ponte definitiva entre os donos de estabelecimentos e o público certo que busca exatamente o seu conceito.",
    caption: `ATENÇÃO DONOS DE BALADAS, BARES E LOUNGES DE SP: 🍸📈

Quantas pessoas estão agora a menos de 3km da sua porta procurando um lugar para sair, mas acabam indo no seu concorrente porque não souberam da sua atração de hoje?

A forma como o público descobre lugares mudou radicalmente. Panfletos físicos e posts impulsionados sem segmentação têm retorno cada vez menor.

O Radar do Rolê é a conexão inteligente que faltava no setor noturno:
🎯 PÚBLICO ULTRA-QUALIFICADO: Seja descoberto por quem está fisicamente perto e buscando exatamente a sua música e ticket médio;
📊 GESTÃO DE LISTA VIP SEM PLANILHAS: Check-in instantâneo via QR Code com dados reais de comparecimento;
📈 OCIOSIDADE ZERO: Aumente o movimento em noites estratégicas como quintas-feiras e domingos.

Estamos abrindo as inscrições para o primeiro grupo de estabelecimentos credenciados da capital.

Quer sua casa em destaque no mapa oficial da noite de SP?
Envie uma mensagem direta com a palavra 'PARCEIRO' ou acesse o link na bio! 🤝🏢`,
    hashtags: [
      "#gestaodenightlife",
      "#donosdebalada",
      "#baresesp",
      "#empreendedorismonoturno",
      "#marketingnoturno",
      "#eventossp",
      "#radardorolesp",
      "#casacheia",
    ],
  },
  {
    id: "feed-8-ticket-medio",
    title: "Post 08: Sem Susto na Conta: Transparência & Ticket Médio",
    category: "Transparência & Consumo",
    format: "Feed (1:1)",
    badge: "08 • Sem Susto na Conta",
    imageSrc: "/marketing/feed-arte-8-ticket-medio.jpg",
    description: "Recorte editorial com comanda de bar grifada em marca-texto neon amarelo 'SEM SUSTO NA CONTA' e drink refinado.",
    articleSummary: "Solução para a insegurança de sair sem saber o preço médio do consumo, entrada ou pegadinhas.",
    caption: `NADA ESTRAGA MAIS UMA NOITE DO QUE O SUSTO NA HORA DA CONTA 💸🥶

Você conhece a história:
A noite foi incrível, a música estava ótima, mas na hora que o garçom entrega a comanda...
❌ Água mineral a R$ 25;
❌ Taxas extras não comunicadas na entrada;
❌ Drinks que custavam o dobro do esperado.

No Radar do Rolê a transparência é inegociável. Você sai de casa sabendo exatamente o que vai encontrar:

🏷️ TICKET MÉDIO REAL:
Estimativa de consumo médio por pessoa calculada com base nos preços reais da casa.

💵 CARDÁPIOS & PREÇOS VISÍVEIS:
Consulte o valor médio de cervejas, coquetéis e petiscos antes de chamar o Uber.

🆓 REGRAS DE ENTRADA CLARAS:
Saiba até que horas a lista é gratuita, quando vira consumação e quais são os horários promocionais.

Lazer com inteligência e liberdade financeira.

Você já levou um susto memorável com comanda em SP? Conta pra gente nos comentários! 👇😅`,
    hashtags: [
      "#transparencia",
      "#ticketmedio",
      "#lazersemculpa",
      "#financasdanoite",
      "#sempegadinha",
      "#baresdesp",
      "#radardorole",
      "#previsibilidade",
    ],
  },
  {
    id: "feed-9-modo-after",
    title: "Post 09: Deu 05:14 AM? Ative o Modo After 5h+",
    category: "After Hours & 24h",
    format: "Feed (1:1)",
    badge: "09 • Modo After 5h+",
    imageSrc: "/marketing/feed-arte-9-modo-after.jpg",
    description: "Display digital luminoso 05:14 AM, warehouse rave sob fumaça roxa e lasers afiados com stencil urbano 'MODO AFTER'.",
    articleSummary: "O guia seguro para os inimigos do fim: onde continuar quando os clubes tradicionais fecham as portas.",
    caption: `DEU 05:14 AM: A NOITE ACABOU OU ESTÁ SÓ COMEÇANDO? ⏰🔊🔥

As luzes do clube acenderam, a música foi cortada e os seguranças estão pedindo para esvaziar a pista.
Mas você e seu bonde ainda estão na frequência máxima e ninguém quer voltar pra casa.

Para os verdadeiros "inimigos do fim", ativamos o MODO AFTER no Radar do Rolê:

🌙 MAPA DOS AFTERS CREDENCIADOS:
Baladas e pistas underground que abrem das 05:00 da manhã e seguem fervendo até o meio-dia;

🛡️ SEGURANÇA & VERIFICAÇÃO:
Apenas locais estruturados, com segurança na portaria e credenciamento oficial;

📍 LOCALIZAÇÃO ATIVA:
Descubra a rota mais rápida sem ficar rodando a cidade na madrugada sem rumo.

A cidade que nunca dorme tem um roteiro para quem tem energia de sobra.

Marque o amigo que SEMPRE puxa todo mundo pro after! 🚀🖤`,
    hashtags: [
      "#aftersp",
      "#inimigosdofim",
      "#afterhours",
      "#technosp",
      "#madrugadasp",
      "#balada24h",
      "#radardorole",
      "#mododeafter",
    ],
  },
  {
    id: "feed-10-siga-perfil",
    title: "Post 10: A Noite é Viva Demais Para Rolê Ruim (Siga o Perfil)",
    category: "Comunidade & Manifesto",
    format: "Feed (1:1)",
    badge: "10 • Manifesto & Siga o Radar",
    imageSrc: "/marketing/feed-arte-10-siga-perfil.jpg",
    description: "Brinde de amigos em rooftop ao pôr do sol com a silhueta dos prédios de SP, carimbo vintage 'SIGA O PERFIL' e neon 'VIVA A NOITE'.",
    articleSummary: "O manifesto conclusivo convidando o público a seguir o perfil oficial para nunca mais errar o rolê.",
    caption: `A NOITE DE SÃO PAULO É VIVA DEMAIS PARA VOCÊ PERDER TEMPO COM ROLÊ RUIM! 🥂🌆✨

São Paulo é uma das capitais mundiais do entretenimento noturno.
São milhares de esquinas, segredos bem guardados, encontros que viram histórias de vida e memórias que duram para sempre.

A sua semana inteira de trabalho e estudo merece um fim de semana extraordinário. Chega de tédio, indecisão e perrengue.

O Radar do Rolê está chegando para devolver a emoção de viver a noite sem estresse.

Siga a nossa página @radardorole para:
✨ Descobrir os segredos mais quentes da capital toda semana;
🎟️ Garantir cortesias e Listas VIP exclusivas antes do público geral;
📲 Ser avisado em primeira mão no dia do lançamento oficial do app!

Toque no botão SEGUIR e faça parte do movimento.
A noite te espera! 🖤🍾`,
    hashtags: [
      "#radardorole",
      "#noitesp",
      "#vivaanoite",
      "#sigaoperfil",
      "#comunidadenoturna",
      "#ondeiremsp",
      "#roleperfeito",
      "#lifestylepaulistano",
    ],
  },
];

const BIO_PROFILE_TEMPLATE = `📡 O Radar Oficial da Vida Noturna | Radar do Rolê
🎟️ Listas VIP & Welcome Drinks exclusivos
🚗 Estimativa de Uber & Modo After 5h+
📍 Baladas, Bares, Afters e Motéis
👇 Encontre onde o rolê está bombando agora:
https://radardorole.com.br`;

export function InstagramKitModal({ isOpen, onClose }: InstagramKitModalProps) {
  const [activeTab, setActiveTab] = useState<"grid-preview" | "assets-list">("grid-preview");
  const [selectedAssetId, setSelectedAssetId] = useState<string>("feed-1-perrengue");
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
      description: "Pronta para colar na descrição do seu perfil @radardorole.",
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
                  @radardorole
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
                          src="/logo-official.jpg"
                          alt="Radar do Rolê Logo Oficial"
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
                          <h4 className="text-base sm:text-lg font-black text-white">radardorole</h4>
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-black text-black">
                            ✓
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">Radar do Rolê • O Radar da Vida Noturna</p>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={handleCopyBio}
                          className="rounded-xl border border-pink-500/40 bg-pink-500/15 px-3 py-1.5 text-xs font-bold text-pink-200 hover:bg-pink-500/25 transition-all"
                        >
                          Copiar Texto da Bio
                        </button>
                        <a
                          href="https://www.instagram.com/radardorole"
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
                      Grade Harmônica do Feed (10 Artes Sequenciais • Estilo Papel Rasgado)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Toque em qualquer post para abrir a arte em alta resolução, o artigo e a legenda com hashtags.
                    </p>
                  </div>
                  <span className="text-xs text-pink-400 font-bold">10 Posts Sequenciais</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
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
