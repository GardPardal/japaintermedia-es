import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, ArrowRight, Clock, Percent } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';

export default function FinancingSection() {
  const { settings, getWhatsAppUrl } = useSettings();
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [veiculoPretendido, setVeiculoPretendido] = useState('');
  const [entrada, setEntrada] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const bancos = [
    { nome: 'Santander Financiamentos' },
    { nome: 'BV Financeira' },
    { nome: 'Itaú Auto' },
    { nome: 'Bradesco Financiamentos' },
    { nome: 'Banco PAN' },
    { nome: 'Safra Financeira' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'financiamento',
          nome,
          telefone,
          mensagem: `Simulação de Financiamento: CPF: ${cpf} | Veículo pretendido: ${veiculoPretendido} | Entrada prevista: R$ ${entrada}`
        })
      });
    } catch (err) {}

    setSucesso(true);
    const msg = `Olá ${settings.nomeLoja || 'Japa Intermediações'}! Gostaria de simular um financiamento.\nNome: ${nome}\nTelefone: ${telefone}\nVeículo: ${veiculoPretendido}\nEntrada prevista: R$ ${entrada}`;
    setTimeout(() => {
      window.open(getWhatsAppUrl(msg), '_blank');
    }, 800);
  };

  return (
    <section id="financiamento" className="py-20 bg-[#0E131A] border-y border-brenza-border/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text & Features */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Percent className="w-3.5 h-3.5" />
              <span>Condições Especiais de Crédito</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              FINANCIAMENTO AUTOMOTIVO COM AS
              <span className="text-brenza-red block">MENORES TAXAS DO MERCADO</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Trabalhamos com os maiores bancos e operadoras financeiras do Brasil para garantir aprovação ágil, planos personalizados em até 60 parcelas fixas e possibilidade de financiamento com ou sem entrada.
            </p>

            {/* Advantages List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#141B24] p-4 rounded-xl border border-white/5 flex items-start gap-3">
                <Clock className="w-5 h-5 text-brenza-red flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Aprovação Imediata</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Resposta de crédito em poucos minutos diretamente no sistema bancário.</p>
                </div>
              </div>

              <div className="bg-[#141B24] p-4 rounded-xl border border-white/5 flex items-start gap-3">
                <Percent className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Taxas Diferenciadas</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Condições exclusivas de revenda credenciada com as principais instituições.</p>
                </div>
              </div>

              <div className="bg-[#141B24] p-4 rounded-xl border border-white/5 flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Em até 60 Vezes</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Prazos de 12 a 60 parcelas fixas pelo carnê ou débito automático.</p>
                </div>
              </div>

              <div className="bg-[#141B24] p-4 rounded-xl border border-white/5 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sem Burocracia</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Processo digital sem necessidade de comprovações complexas para clientes com bom score.</p>
                </div>
              </div>
            </div>

            {/* Banking Partners */}
            <div className="pt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Instituições Financeiras Parceiras
              </span>
              <div className="flex flex-wrap gap-2">
                {bancos.map((banco, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-[#141B24] border border-white/5 text-xs font-medium text-slate-300"
                  >
                    {banco.nome}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Pre-approval Simulation Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#141B24] border border-brenza-border rounded-2xl p-6 sm:p-8 shadow-2xl relative">
              <h3 className="text-xl font-bold text-white">
                Simule seu Financiamento
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-6">
                Preencha os dados básicos para consulta de crédito personalizada com nossa equipe.
              </p>

              {sucesso ? (
                <div className="bg-emerald-950/60 border border-emerald-500/40 p-6 rounded-xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Solicitação Encaminhada!</h4>
                  <p className="text-xs text-slate-300">
                    Nossa equipe de crédito está abrindo seu atendimento no WhatsApp para apresentar as melhores propostas de parcelamento.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Seu nome completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full bg-[#1A232E] border border-white/10 text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-brenza-red"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      WhatsApp para Contato
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

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Veículo de Interesse
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Corolla, Hilux, Polo, Compass..."
                      value={veiculoPretendido}
                      onChange={(e) => setVeiculoPretendido(e.target.value)}
                      className="w-full bg-[#1A232E] border border-white/10 text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-brenza-red"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Valor de Entrada Disponível (R$)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 20.000 (ou deixe em branco para 100% financiado)"
                      value={entrada}
                      onChange={(e) => setEntrada(e.target.value)}
                      className="w-full bg-[#1A232E] border border-white/10 text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-brenza-red"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brenza-red hover:bg-brenza-redHover text-white py-3.5 rounded-lg font-bold text-sm tracking-wide transition-all shadow-lg shadow-brenza-red/20 flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Consultar Condições no WhatsApp</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                    Seus dados estão protegidos sob sigilo comercial e serão utilizados exclusivamente para análise cadastral pela Japa Intermediações.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
