import React, { useState } from "react";
import { X, ShieldCheck, FileText, AlertTriangle, Scale, Lock, Building2, ExternalLink, Mail } from "lucide-react";

interface LegalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "termos" | "privacidade" | "listavip" | "parceiros";
}

export function LegalTermsModal({ isOpen, onClose, initialTab = "termos" }: LegalTermsModalProps) {
  const [activeTab, setActiveTab] = useState<"termos" | "privacidade" | "listavip" | "parceiros">(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-white/15 bg-[#0a0e1a] text-slate-100 shadow-[0_0_60px_-10px_rgba(0,0,0,0.9)] z-10 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Central Jurídica & Compliance</h2>
              <p className="text-[11px] text-slate-400">Termos de Uso, Privacidade (LGPD) e Regras da Plataforma</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-white/10 bg-[#070a13] px-3 overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("termos")}
            className={`flex items-center gap-1.5 px-3 py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "termos"
                ? "border-purple-400 text-purple-300 bg-purple-500/10"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>1. Termos de Uso & Isenção</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("privacidade")}
            className={`flex items-center gap-1.5 px-3 py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "privacidade"
                ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>2. Política de Privacidade (LGPD)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("listavip")}
            className={`flex items-center gap-1.5 px-3 py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "listavip"
                ? "border-rose-400 text-rose-300 bg-rose-500/10"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>3. Regras de Lista VIP & Portaria</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("parceiros")}
            className={`flex items-center gap-1.5 px-3 py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "parceiros"
                ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>4. Contrato de Parceiros (SaaS)</span>
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[65vh] space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* TAB 1: TERMOS DE USO GERAIS */}
          {activeTab === "termos" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3.5 text-purple-200">
                <p className="font-bold text-sm text-white mb-1">Visão Geral dos Termos</p>
                <p className="text-[11px] leading-relaxed">
                  O <strong>Radar do Rolê</strong> é uma plataforma de curadoria digital, catálogo de lazer noturno e facilitador tecnológico de relacionamento entre frequentadores e estabelecimentos comerciais autônomos em São Paulo.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm">1. Natureza Informativa e Não Intermediação</h4>
                <p className="mt-1">
                  1.1. O Radar do Rolê disponibiliza informações públicas, endereços, programações e ferramentas digitais de agendamento de lista VIP. O aplicativo <strong>não é organizador, realizador, proprietário ou promotor</strong> de nenhum dos eventos ou estabelecimentos catalogados.
                </p>
                <p className="mt-1">
                  1.2. Cada estabelecimento (balada, bar, casa noturna ou motel) é uma pessoa jurídica autônoma e independente, sendo a <strong>única e exclusiva responsável</strong> pela organização, segurança, qualidade do atendimento, alvarás de funcionamento, controle de acesso e cumprimento das normas sanitárias e de proteção contra incêndio.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm">2. Propriedade Intelectual, Marcas e Fair Use</h4>
                <p className="mt-1">
                  2.1. Todas as marcas nominativas, logotipos, nomes empresariais e marcas registradas citadas nesta plataforma (incluindo, exemplificativamente, marcas de aplicativos de transporte como <em>Uber</em> ou <em>99</em>, bem como nomes de casas noturnas parceiras ou referenciadas) pertencem aos seus respectivos titulares legais.
                </p>
                <p className="mt-1">
                  2.2. A menção a tais marcas ocorre estritamente para fins de identificação, localização geográfica e referência descritiva de boa-fé (<em>fair use</em> e identificação de destino), não implicando endosso, patrocínio ou afiliação oficial direta, salvo expressamente indicado.
                </p>
                <p className="mt-1">
                  2.3. As estimativas de corrida apresentadas são meros cálculos aproximados baseados em distância média. A contratação, tarifas dinâmicas, cobrança e execução do transporte são contratadas direta e exclusivamente pelo usuário no aplicativo de mobilidade de sua escolha.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm">3. Canal de Notificação e Retirada de Conteúdo (DMCA / Notificação Extrajudicial)</h4>
                <p className="mt-1">
                  3.1. Caso você seja proprietário de estabelecimento, titular de marca ou detentor de direitos autorais de alguma imagem veiculada e deseje solicitar a reivindicação de posse do perfil, atualização cadastral ou remoção imediata do conteúdo, disponibilizamos nosso canal direto de compliance:
                </p>
                <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200 font-mono text-xs">
                    <Mail className="h-4 w-4 text-purple-400" />
                    <span>juridico@radardorole.com.br</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">Atendimento em até 48h úteis</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POLÍTICA DE PRIVACIDADE (LGPD) */}
          {activeTab === "privacidade" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3.5 text-cyan-200">
                <p className="font-bold text-sm text-white mb-1">Compromisso com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</p>
                <p className="text-[11px] leading-relaxed">
                  O Radar do Rolê preza pela transparência total e privacidade de seus usuários, coletando apenas os dados estritamente necessários para a operação dos serviços solicitados.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm">1. Dados Pessoais Coletados e Finalidades</h4>
                <ul className="mt-1 list-disc pl-5 space-y-1">
                  <li><strong>Nome Completo e WhatsApp:</strong> Coletados no ato de inscrição na Lista VIP com a finalidade exclusiva de inclusão do seu nome na relação oficial de convidados da portaria do estabelecimento escolhido.</li>
                  <li><strong>Localização Geográfica Aproximada:</strong> Utilizada em tempo de execução via navegador/dispositivo para ordenar os estabelecimentos por proximidade e calcular distâncias quilométricas. Não armazenamos histórico contínuo de rastreamento do seu trajeto.</li>
                  <li><strong>Cookies e Dados de Sessão:</strong> Utilizados exclusivamente para manter sua sessão conectada, preferências de bairro e verificação de maioridade civil (+18).</li>
                </ul>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm">2. Não Comercialização de Dados</h4>
                <p className="mt-1">
                  O Radar do Rolê <strong>jamais vende, aluga ou cede</strong> bancos de dados de usuários, telefones ou listas de leads para agências de publicidade, telemarketing ou quaisquer terceiros desvinculados do estabelecimento escolhido por você.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm">3. Direitos do Titular de Dados (Art. 18 da LGPD)</h4>
                <p className="mt-1">
                  Você pode a qualquer momento exercer seus direitos previstos na LGPD, incluindo: confirmação da existência de tratamento, acesso aos dados, correção de dados incompletos ou inexatos, anonimização, bloqueio ou eliminação definitiva dos seus dados de nossos servidores.
                </p>
                <p className="mt-1">
                  Para exercer seus direitos, envie uma mensagem ao nosso Encarregado de Dados (DPO): <strong className="text-cyan-400 font-mono">privacidade@radardorole.com.br</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: REGRAS DE LISTA VIP & PORTARIA (CDC) */}
          {activeTab === "listavip" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 text-rose-200">
                <p className="font-bold text-sm text-white mb-1">Avisos Cruciais sobre Listas VIP e Entrada (CDC)</p>
                <p className="text-[11px] leading-relaxed">
                  Para sua segurança jurídica e alinhamento de expectativas antes de sair de casa, leia com atenção as regras de acesso das casas noturnas parceiras.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm">1. Lotação Máxima e Limites de Segurança dos Bombeiros</h4>
                <p className="mt-1">
                  1.1. A emissão de voucher ou inclusão de nome em Lista VIP <strong>não garante o direito irrestrito de entrada</strong> caso o estabelecimento tenha atingido a sua capacidade máxima autorizada pelo Corpo de Bombeiros e órgãos fiscalizadores no momento da sua chegada.
                </p>
                <p className="mt-1">
                  1.2. As casas operam sob o regime de ordem de chegada (fila) até o limite da lotação. Recomendamos sempre chegar com antecedência ao horário indicado no voucher.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm">2. Critérios de Portaria, Idade e Dress Code</h4>
                <p className="mt-1">
                  2.1. O acesso a casas noturnas e motéis é restrito a maiores de 18 anos, sendo <strong>indispensável a apresentação de documento oficial físico com foto</strong> (RG, CNH, Passaporte ou documento digital oficial em aplicativo governamental validado).
                </p>
                <p className="mt-1">
                  2.2. Cada casa noturna possui regras próprias de vestimenta (<em>dress code</em>, por exemplo, restrições a chinelos, regatas ou bermudas) e poder discricionário de portaria (<em>door policy</em>) por razões de segurança e ordem pública. O Radar do Rolê não interfere na triagem presencial da casa.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm">3. Preços e Promoções Informadas</h4>
                <p className="mt-1">
                  3.1. Os valores de entrada, consumação mínima e horários de vigência de benefícios de Lista VIP são informados e mantidos diretamente pelas casas noturnas. Eventuais alterações operacionais no local são de responsabilidade direta do estabelecimento.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: TERMOS PARA PARCEIROS SAAS B2B */}
          {activeTab === "parceiros" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-emerald-200">
                <p className="font-bold text-sm text-white mb-1">Cláusulas Contratuais do Estabelecimento Parceiro</p>
                <p className="text-[11px] leading-relaxed">
                  Ao cadastrar seu estabelecimento no Radar do Rolê ou assinar o Plano Oficial (R$ 59,00/mês), o parceiro comercial declara ciência e concorda com as seguintes condições.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm">1. Responsabilidade Exclusiva sobre Operação e Segurança</h4>
                <p className="mt-1">
                  1.1. O Estabelecimento Parceiro declara ser o único e integral responsável civil, administrativo, consumerista e criminal por todos os atos, serviços, produtos, eventos, recepção e integridade física de frequentadores em suas dependências.
                </p>
                <p className="mt-1">
                  1.2. O Parceiro compromete-se a cumprir integralmente os benefícios de Lista VIP e promoções veiculadas em seu perfil na plataforma, sob pena de descredenciamento e suspensão imediata da conta.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm">2. Veracidade das Informações e Direitos de Imagem</h4>
                <p className="mt-1">
                  2.1. O Parceiro garante possuir todos os direitos de uso e autorizações necessárias para a veiculação de fotos, marcas, vídeos e materiais publicitários inseridos em seu perfil.
                </p>
                <p className="mt-1">
                  2.2. A plataforma Radar do Rolê não se responsabiliza por eventuais conflitos de direitos autorais resultantes de uploads realizados pelos administradores do local.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm">3. Mensalidade SaaS e Cobrança Recorrente</h4>
                <p className="mt-1">
                  A assinatura do plano de destaque comercial (R$ 59,00/mês) é pré-paga e recorrente, processada na data de vencimento escolhida pelo parceiro (todo dia 10, dia 20 ou dia 30), via Cartão de Crédito ou Pix Recorrente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-white/10 p-4 bg-[#070a13] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Documento em vigor para a comarca de São Paulo - SP</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 font-bold text-white hover:brightness-110 active:scale-95 transition-all cursor-pointer text-center"
          >
            Entendido e Concordo
          </button>
        </div>
      </div>
    </div>
  );
}
