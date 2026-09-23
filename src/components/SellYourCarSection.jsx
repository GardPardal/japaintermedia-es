import React, { useState } from 'react';
import { Car, DollarSign, CheckCircle, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';

export default function SellYourCarSection() {
  const { settings, getWhatsAppUrl } = useSettings();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [veiculo, setVeiculo] = useState('');
  const [ano, setAno] = useState('');
  const [km, setKm] = useState('');
  const [precoPretendido, setPrecoPretendido] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'venda_consignacao',
          nome,
          telefone,
          mensagem: `Venda/Troca: ${veiculo} | Ano: ${ano} | KM: ${km} | Pretendido: R$ ${precoPretendido}`
        })
      });
    } catch (err) {}

    setSucesso(true);
    const msg = `Olá ${settings.nomeLoja || 'Japa Intermediações'}! Gostaria de uma avaliação para vender/consignar/trocar meu carro:\nNome: ${nome}\nWhatsApp: ${telefone}\nVeículo: ${veiculo}\nAno: ${ano}\nKM: ${km}\nValor pretendido: R$ ${precoPretendido}`;
    setTimeout(() => {
      window.open(getWhatsAppUrl(msg), '_blank');
    }, 800);
  };

  return (
    <section id="venda" className="py-20 bg-[#0B0F13] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Form First or on Left/Right */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="bg-[#131922] border border-brenza-border rounded-2xl p-6 sm:p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-1">
                Formulário de Avaliação Rápida
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Receba uma proposta justa e transparente pelo seu carro em poucos minutos.
              </p>

              {sucesso ? (
                <div className="bg-emerald-950/60 border border-emerald-500/40 p-6 rounded-xl text-center space-y-3">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Dados Recebidos!</h4>
                  <p className="text-xs text-slate-300">
                    Nossa equipe de avaliação está abrindo a conversa no WhatsApp para analisar fotos e detalhes do seu veículo.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Seu Nome
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nome completo"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="w-full bg-[#1A232E] border border-white/10 text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-brenza-red"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="(43) 99999-9999"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        className="w-full bg-[#1A232E] border border-white/10 text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-brenza-red"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Marca, Modelo e Versão
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Fiat Strada 1.4 Freedom Cabine Dupla"
                      value={veiculo}
                      onChange={(e) => setVeiculo(e.target.value)}
                      className="w-full bg-[#1A232E] border border-white/10 text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-brenza-red"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Ano
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 2020"
                        value={ano}
                        onChange={(e) => setAno(e.target.value)}
                        className="w-full bg-[#1A232E] border border-white/10 text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-brenza-red"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        KM Atual
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 45.000"
                        value={km}
                        onChange={(e) => setKm(e.target.value)}
                        className="w-full bg-[#1A232E] border border-white/10 text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-brenza-red"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Valor Pretendido
                      </label>
                      <input
                        type="text"
                        placeholder="R$ (opcional)"
                        value={precoPretendido}
                        onChange={(e) => setPrecoPretendido(e.target.value)}
                        className="w-full bg-[#1A232E] border border-white/10 text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-brenza-red"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-lg font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 mt-4"
                  >
                    <span>Solicitar Avaliação Gratuita</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Text & Value Proposition */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brenza-red/10 border border-brenza-red/30 text-brenza-red text-xs font-semibold uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Avaliação Transparente</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              VENDA OU TROQUE SEU CARRO COM
              <span className="text-brenza-red block">PAGAMENTO IMEDIATO</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Na Japa Intermediações você não perde tempo com anúncios desgastantes ou intermediários duvidosos. Avaliamos seu automóvel com base no mercado real e realizamos a quitação e transferência com total segurança jurídica e transparência.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[#18202A] text-emerald-400 border border-white/5">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Pagamento à Vista via PIX</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Após a vistoria e validação da documentação, o valor é creditado imediatamente na sua conta bancária.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[#18202A] text-brenza-red border border-white/5">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Troca com Troco</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Deseja trocar por um veículo de menor valor? Pagamos a diferença em dinheiro na hora.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[#18202A] text-blue-400 border border-white/5">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Despachante e Quitação de Débitos</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Se o seu carro ainda estiver financiado ou com pendências de IPVA, resolvemos a quitação diretamente.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
