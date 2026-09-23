import React, { useState } from 'react';
import { Landmark, ArrowRight, CheckCircle2, ShieldCheck, Calculator, X, AlertCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';

export default function FinancingBannerSection() {
  const { settings, getWhatsAppUrl } = useSettings();
  const [modalOpen, setModalOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidade, setCidade] = useState('');
  const [renda, setRenda] = useState('');
  const [entrada, setEntrada] = useState('');
  const [veiculoInteresse, setVeiculoInteresse] = useState('');
  const [lgpd, setLgpd] = useState(true);

  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  // Máscara de CPF simples
  const handleCpfChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 9) {
      val = val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (val.length > 6) {
      val = val.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (val.length > 3) {
      val = val.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    setCpf(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lgpd) {
      setErro('Por favor, confirme a autorização de análise cadastral para prosseguir.');
      return;
    }
    setErro('');

    try {
      await fetch('/api/index.php?endpoint=leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'financiamento',
          nome,
          telefone: whatsapp,
          cidade,
          mensagem: `Simulação de Financiamento | CPF: ${cpf} | Nasc: ${nascimento} | Renda: R$ ${renda} | Entrada: R$ ${entrada} | Veículo de interesse: ${veiculoInteresse || 'Não especificado'}`
        })
      });
    } catch (err) {
      console.warn('Fallback ao registrar lead de financiamento:', err);
    }

    setSucesso(true);

    const msg = `Olá ${settings.nomeLoja || 'Japa Intermediações'}! Gostaria de simular um financiamento de veículo:\n\n*Nome:* ${nome}\n*CPF:* ${cpf}\n*Nascimento:* ${nascimento}\n*WhatsApp:* ${whatsapp}\n*Cidade:* ${cidade || `${settings.cidade || 'Wenceslau Braz'} - ${settings.uf || 'PR'}`}\n*Renda mensal aproximada:* R$ ${renda}\n*Entrada disponível:* R$ ${entrada}\n*Veículo pretendido:* ${veiculoInteresse || 'Quero ver as opções disponíveis'}`;

    setTimeout(() => {
      window.open(getWhatsAppUrl(msg), '_blank');
    }, 800);
  };

  return (
    <section id="financiamento" className="py-20 bg-[#F7F7F7] border-b border-[#E5E7EB] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Coluna Esquerda: Texto persuasivo e ação */}
          <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 text-[#E50914] text-xs font-bold uppercase tracking-wider">
              <Landmark className="w-4 h-4" />
              <span>Financiamento Bancário Facilitado</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[#101010] tracking-tight leading-tight">
              Realize seu sonho com as <span className="text-[#E50914]">melhores taxas</span> do mercado.
            </h2>

            <p className="text-[#5F6368] text-base leading-relaxed">
              Trabalhamos com os principais bancos e financeiras do Brasil (Santander, BV, Bradesco, Itaú, Banco Pan) para garantir aprovação rápida, parcelas que cabem no seu bolso e condições exclusivas.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E50914] flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101010]">Até 60x para Pagar</h4>
                  <p className="text-xs text-[#5F6368] mt-0.5">Planos flexíveis com ou sem entrada conforme seu score.</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E50914] flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101010]">Primeira Parcela em até 60 dias</h4>
                  <p className="text-xs text-[#5F6368] mt-0.5">Carência especial para você curtir seu carro novo com tranquilidade.</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E50914] flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101010]">Aprovação 100% Digital</h4>
                  <p className="text-xs text-[#5F6368] mt-0.5">Sem precisar se deslocar até agências bancárias.</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E50914] flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  4
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101010]">Seu Usado como Entrada</h4>
                  <p className="text-xs text-[#5F6368] mt-0.5">Usamos o valor do seu seminovo para diminuir as parcelas.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-bold text-sm sm:text-base transition-colors shadow-md hover:shadow-lg"
              >
                <Calculator className="w-5 h-5" />
                <span>Simular financiamento agora</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Coluna Direita: Imagem oficial banner-financiamento.webp */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[#E5E7EB] bg-slate-100 group">
              <img
                src="/banner-financiamento.webp"
                alt="Financiamento Facilitado JAPA Intermediações"
                className="w-full h-[380px] sm:h-[450px] object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
                <span className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#E50914] mb-2 shadow-md">
                  Aprovação Rápida & Segura
                </span>
                <p className="text-base font-semibold drop-shadow-sm">
                  Simule agora sem compromisso e encontre a parcela ideal para o seu orçamento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Simulação de Financiamento */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E5E7EB] my-8 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#101010] p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E50914] block">Simulador Online</span>
              <h3 className="text-xl sm:text-2xl font-black text-[#101010] mt-0.5">
                Simulação de Financiamento Automotivo
              </h3>
              <p className="text-xs sm:text-sm text-[#5F6368] mt-1">
                Preencha seus dados de forma segura. Nossos especialistas consultarão as taxas vigentes nos melhores bancos para você.
              </p>
            </div>

            {sucesso ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-[#101010]">Simulação solicitada com sucesso!</h4>
                <p className="text-sm text-[#5F6368]">
                  Estamos abrindo seu atendimento no WhatsApp para apresentar os resultados da análise.
                </p>
                <button
                  type="button"
                  onClick={() => { setSucesso(false); setModalOpen(false); }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-[#E50914] text-white font-bold text-sm"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {erro && (
                  <div className="p-3 bg-red-50 border border-red-200 text-[#E50914] text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{erro}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Seu nome completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                      WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(43) 99999-9999"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                      CPF (para consulta bancária) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={handleCpfChange}
                      className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914]"
                    />
                    <span className="text-[10px] text-[#5F6368] mt-0.5 block">
                      Ambiente seguro e protegido pela LGPD.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                      Data de Nascimento *
                    </label>
                    <input
                      type="date"
                      required
                      value={nascimento}
                      onChange={(e) => setNascimento(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                      Cidade / UF
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Londrina - PR"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                      Renda Mensal (R$)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 5.500"
                      value={renda}
                      onChange={(e) => setRenda(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                      Entrada Disponível (R$)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 20.000 ou 0"
                      value={entrada}
                      onChange={(e) => setEntrada(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                    Veículo de Interesse (ou faixa de valor)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Corolla, Hilux, SUV até 120 mil..."
                    value={veiculoInteresse}
                    onChange={(e) => setVeiculoInteresse(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                {/* Consentimento LGPD */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lgpd}
                      onChange={(e) => setLgpd(e.target.checked)}
                      className="mt-1 rounded text-[#E50914] focus:ring-[#E50914]"
                    />
                    <span className="text-xs text-[#5F6368] leading-normal">
                      Autorizo a JAPA Intermediações a consultar e encaminhar meus dados cadastrais aos bancos parceiros estritamente para fins de análise e pré-aprovação de crédito veicular.
                    </span>
                  </label>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full bg-[#E50914] hover:bg-[#B80710] text-white py-3.5 rounded-xl font-bold text-sm tracking-wide transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Simular Financiamento com Especialista</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
