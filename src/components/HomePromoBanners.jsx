import React, { useState } from 'react';
import { ArrowRight, X, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';

export default function HomePromoBanners() {
  const { settings, getWhatsAppUrl } = useSettings();
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [financeModalOpen, setFinanceModalOpen] = useState(false);

  // Trade form
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [veiculo, setVeiculo] = useState('');
  const [ano, setAno] = useState('');
  const [km, setKm] = useState('');
  const [preco, setPreco] = useState('');
  const [tradeSuccess, setTradeSuccess] = useState(false);

  // Finance form
  const [cpf, setCpf] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [renda, setRenda] = useState('');
  const [entrada, setEntrada] = useState('');
  const [financeSuccess, setFinanceSuccess] = useState(false);

  const cityUf = `${settings.cidade || 'Wenceslau Braz'} - ${settings.uf || 'PR'}`;

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'avaliacao_troca',
          nome,
          telefone: whatsapp,
          cidade: cityUf,
          mensagem: `Avaliação de Troca: ${veiculo} | Ano: ${ano} | KM: ${km} | Pretendido: R$ ${preco}`
        })
      });
    } catch (err) {}

    setTradeSuccess(true);
    const msg = `Olá ${settings.nomeLoja || 'JAPA Intermediações'}! Gostaria de uma avaliação para troca/venda:\nNome: ${nome}\nWhatsApp: ${whatsapp}\nVeículo: ${veiculo}\nAno: ${ano}\nKM: ${km}\nPreço pretendido: R$ ${preco}`;
    setTimeout(() => {
      window.open(getWhatsAppUrl(msg), '_blank');
    }, 800);
  };

  const handleFinanceSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'financiamento',
          nome,
          telefone: whatsapp,
          cidade: cityUf,
          mensagem: `Simulação de Financiamento: CPF: ${cpf} | Nasc: ${nascimento} | Renda: R$ ${renda} | Entrada: R$ ${entrada}`
        })
      });
    } catch (err) {}

    setFinanceSuccess(true);
    const msg = `Olá ${settings.nomeLoja || 'JAPA Intermediações'}! Gostaria de simular um financiamento:\nNome: ${nome}\nWhatsApp: ${whatsapp}\nCPF: ${cpf}\nNascimento: ${nascimento}\nRenda: R$ ${renda}\nEntrada: R$ ${entrada}`;
    setTimeout(() => {
      window.open(getWhatsAppUrl(msg), '_blank');
    }, 800);
  };

  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Banner 1 (Esquerda): Seu usado vale mais na troca */}
          <div className="relative bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between min-h-[260px] p-6 sm:p-8 group hover:shadow-md transition-shadow">
            {/* Imagem de Fundo (SUV traseira) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src="/banner-venda-veiculo.webp"
                alt="Seu usado vale mais na troca"
                className="w-full h-full object-cover object-left opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/30" />
            </div>

            {/* Conteúdo do Banner */}
            <div className="relative z-10 max-w-sm space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-[#101010] leading-tight">
                Seu usado <br />
                <span className="text-[#E50914]">vale mais</span> na troca.
              </h3>
              <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                Avaliação rápida, segura e sem complicação. A melhor oferta para o seu veículo.
              </p>
            </div>

            <div className="relative z-10 pt-6">
              <button
                type="button"
                onClick={() => setTradeModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B80710] text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-full shadow-sm transition-all duration-200"
              >
                <span>Solicitar avaliação</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Banner 2 (Direita): Realize seu sonho com financiamento */}
          <div className="relative bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between min-h-[260px] p-6 sm:p-8 group hover:shadow-md transition-shadow">
            {/* Imagem de Fundo (Monte Fuji e Pagoda) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src="/banner-financiamento.webp"
                alt="Realize seu sonho com financiamento"
                className="w-full h-full object-cover object-right opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/40" />
            </div>

            {/* Conteúdo do Banner */}
            <div className="relative z-10 max-w-sm space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-[#101010] leading-tight">
                Realize seu sonho <br />
                com <span className="text-[#E50914]">financiamento.</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                As melhores condições e os principais bancos.
              </p>
            </div>

            <div className="relative z-10 pt-6">
              <button
                type="button"
                onClick={() => setFinanceModalOpen(true)}
                className="inline-flex items-center gap-2 bg-white hover:bg-red-50/50 text-[#E50914] border border-[#E50914] font-bold text-xs sm:text-sm py-3 px-6 rounded-full shadow-xs transition-all duration-200"
              >
                <span>Simular financiamento</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Modal Avaliação de Troca */}
      {tradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setTradeModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-black text-[#101010] mb-1">
              Avaliação do seu veículo usado
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Preencha os dados e receba uma proposta justa da JAPA Intermediações.
            </p>

            {tradeSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-[#101010]">Dados Enviados!</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Abrindo WhatsApp da loja para concluir sua avaliação...
                </p>
              </div>
            ) : (
              <form onSubmit={handleTradeSubmit} className="space-y-3 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#E50914]"
                />
                <input
                  type="tel"
                  required
                  placeholder="Seu WhatsApp com DDD"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#E50914]"
                />
                <input
                  type="text"
                  required
                  placeholder="Marca, modelo e versão do seu carro"
                  value={veiculo}
                  onChange={(e) => setVeiculo(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#E50914]"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Ano"
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#E50914]"
                  />
                  <input
                    type="text"
                    placeholder="KM atual"
                    value={km}
                    onChange={(e) => setKm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#E50914]"
                  />
                  <input
                    type="text"
                    placeholder="Preço R$"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#E50914]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#E50914] text-white font-bold py-3.5 rounded-full text-xs shadow-sm mt-3"
                >
                  Enviar para Avaliação
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Simulação de Financiamento */}
      {financeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setFinanceModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-black text-[#101010] mb-1">
              Simulação de Financiamento
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Consulte as menores taxas nos bancos parceiros em Wenceslau Braz e região.
            </p>

            {financeSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-[#101010]">Simulação Solicitada!</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Abrindo WhatsApp da loja com o especialista em crédito...
                </p>
              </div>
            ) : (
              <form onSubmit={handleFinanceSubmit} className="space-y-3 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#E50914]"
                />
                <input
                  type="tel"
                  required
                  placeholder="Seu WhatsApp com DDD"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#E50914]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="CPF (apenas números)"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#E50914]"
                  />
                  <input
                    type="text"
                    placeholder="Data de nascimento"
                    value={nascimento}
                    onChange={(e) => setNascimento(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#E50914]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Renda aproximada R$"
                    value={renda}
                    onChange={(e) => setRenda(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#E50914]"
                  />
                  <input
                    type="text"
                    placeholder="Entrada disponível R$"
                    value={entrada}
                    onChange={(e) => setEntrada(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#E50914]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#E50914] text-white font-bold py-3.5 rounded-full text-xs shadow-sm mt-3"
                >
                  Simular Financiamento
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
