import React, { useState, useEffect } from 'react';
import { 
  X, Check, Calendar, Gauge, Fuel, Cog, ShieldCheck, 
  MessageCircle, Calculator, ArrowRight, Car, CheckCircle2, Info, Share2
} from 'lucide-react';

export default function VehicleDetailModal({ vehicle, onClose }) {
  if (!vehicle) return null;

  // Fechar com tecla ESC e travar rolagem da página de fundo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalStyle;
    };
  }, [onClose]);

  const [activePhoto, setActivePhoto] = useState(0);
  const [activeTab, setActiveTab] = useState('detalhes'); // 'detalhes' | 'simulador' | 'troca'
  
  // Financing simulator state
  const preco = Number(vehicle.preco) || 100000;
  const [downPayment, setDownPayment] = useState(Math.round(preco * 0.3));
  const [installmentsCount, setInstallmentsCount] = useState(48);
  
  // Lead form state
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadMsg, setLeadMsg] = useState(`Tenho interesse no ${vehicle.marca} ${vehicle.modelo} ${vehicle.versao} (${vehicle.anoModelo}).`);
  const [tradeModel, setTradeModel] = useState('');
  const [tradeYear, setTradeYear] = useState('');
  const [tradeKm, setTradeKm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Financial calculations
  const financedAmount = Math.max(0, preco - downPayment);
  const monthlyRate = 0.0159; // 1.59% a.m.
  const monthlyInstallment = financedAmount > 0 
    ? Math.round((financedAmount * (monthlyRate * Math.pow(1 + monthlyRate, installmentsCount))) / (Math.pow(1 + monthlyRate, installmentsCount) - 1))
    : 0;

  const formatBRL = (val) => {
    return Number(val || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    });
  };

  const mileage = vehicle.quilometragem !== undefined ? vehicle.quilometragem : (vehicle.km || 0);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/index.php?endpoint=leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: activeTab === 'troca' ? 'avaliacao_troca' : activeTab === 'simulador' ? 'financiamento' : 'proposta',
          nome: leadName,
          telefone: leadPhone,
          veiculoId: vehicle.id,
          veiculoNome: `${vehicle.marca} ${vehicle.modelo} ${vehicle.versao}`,
          mensagem: leadMsg,
          entrada: downPayment,
          parcelas: installmentsCount,
          trocaModelo: tradeModel,
          trocaAno: tradeYear,
          trocaKm: tradeKm
        })
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        const whatsappMsg = encodeURIComponent(
          `Olá Japa Intermediações! Meu nome é ${leadName} (${leadPhone}). Enviei uma proposta pelo site para o ${vehicle.marca} ${vehicle.modelo} (${vehicle.id}): "${leadMsg}"`
        );
        window.open(`https://wa.me/5543996437966?text=${whatsappMsg}`, '_blank');
      }, 800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const directWhatsapp = () => {
    const msg = encodeURIComponent(
      `Olá Japa Intermediações! Gostaria de atendimento exclusivo para o ${vehicle.marca} ${vehicle.modelo} ${vehicle.versao}, ano ${vehicle.anoModelo}, código ${vehicle.id}.`
    );
    window.open(`https://wa.me/5543996437966?text=${msg}`, '_blank');
  };

  const shareVehicle = () => {
    const shareText = `🚗 Olha este ${vehicle.marca} ${vehicle.modelo} ${vehicle.versao || ''} (${vehicle.anoModelo}) na JAPA Intermediações por ${formatBRL(vehicle.preco)} em Wenceslau Braz - PR!\n\nConfira as fotos e detalhes no site:\nhttps://japainter.site/`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const primaryPhotos = vehicle.fotos && vehicle.fotos.length > 0 ? vehicle.fotos : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-2 sm:p-4 md:p-6 flex items-start justify-center"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col border border-[#E5E7EB] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="sticky top-0 z-30 bg-white px-4 sm:px-6 py-3.5 border-b border-[#E5E7EB] flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider">
                {vehicle.marca}
              </span>
              <span className="text-slate-400 text-xs font-mono">#{vehicle.id}</span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-[#101010] truncate">
              {vehicle.modelo} <span className="text-[#5F6368] font-normal text-xs sm:text-base">{vehicle.versao}</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:block text-right">
              <span className="text-[10px] text-[#5F6368] uppercase tracking-wider block">
                {vehicle.isDemoPrice ? 'Sob Consulta' : 'Preço à Vista'}
              </span>
              <span className="text-xl font-black text-[#E50914]">
                {formatBRL(vehicle.preco)}
              </span>
            </div>

            <button
              onClick={shareVehicle}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Compartilhar"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black transition-colors"
              aria-label="Fechar"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 bg-[#F7F7F7]">
          {/* Left Column: Gallery & Description (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Active Photo */}
            <div className="relative aspect-[16/10] bg-slate-100 rounded-xl overflow-hidden border border-[#E5E7EB] shadow-sm">
              <img
                src={primaryPhotos[activePhoto] || primaryPhotos[0]}
                alt={vehicle.modelo}
                className="w-full h-full object-cover"
              />
              {vehicle.isDemoPrice && (
                <div className="absolute top-3 left-3 bg-amber-500 text-black px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <Info className="w-3.5 h-3.5" />
                  Sob Consulta
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm px-3 py-1 rounded-md text-xs text-white">
                Foto {activePhoto + 1} de {primaryPhotos.length}
              </div>
            </div>

            {/* Thumbnails */}
            {primaryPhotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {primaryPhotos.map((foto, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhoto(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activePhoto === idx ? 'border-[#E50914] scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={foto} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Ficha Técnica */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#101010] mb-4 border-l-2 border-[#E50914] pl-2">
                Ficha Técnica do Veículo
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                <div>
                  <span className="text-[#5F6368] block">Ano Fab./Modelo</span>
                  <strong className="text-[#101010] text-sm font-semibold">{vehicle.anoFabricacao || vehicle.anoModelo}/{vehicle.anoModelo}</strong>
                </div>
                <div>
                  <span className="text-[#5F6368] block">Quilometragem</span>
                  <strong className="text-[#101010] text-sm font-semibold">{Number(mileage).toLocaleString('pt-BR')} km</strong>
                </div>
                <div>
                  <span className="text-[#5F6368] block">Câmbio</span>
                  <strong className="text-[#101010] text-sm font-semibold capitalize">{vehicle.cambio || 'Automático'}</strong>
                </div>
                <div>
                  <span className="text-[#5F6368] block">Combustível</span>
                  <strong className="text-[#101010] text-sm font-semibold capitalize">{vehicle.combustivel || 'Flex'}</strong>
                </div>
                <div>
                  <span className="text-[#5F6368] block">Carroceria</span>
                  <strong className="text-[#101010] text-sm font-semibold capitalize">{vehicle.carroceria || 'Sedan'}</strong>
                </div>
                <div>
                  <span className="text-[#5F6368] block">Cor</span>
                  <strong className="text-[#101010] text-sm font-semibold capitalize">{vehicle.cor || 'Preto'}</strong>
                </div>
                <div>
                  <span className="text-[#5F6368] block">Portas</span>
                  <strong className="text-[#101010] text-sm font-semibold">{vehicle.portas || 4} portas</strong>
                </div>
                <div>
                  <span className="text-[#5F6368] block">Final de Placa</span>
                  <strong className="text-[#101010] text-sm font-semibold">{vehicle.finalPlaca || '1'}</strong>
                </div>
                <div>
                  <span className="text-[#5F6368] block">Localização</span>
                  <strong className="text-[#101010] text-sm font-semibold">{vehicle.cidade || 'Wenceslau Braz'} - {vehicle.uf || 'PR'}</strong>
                </div>
              </div>
            </div>

            {/* Opcionais */}
            {vehicle.opcionais && vehicle.opcionais.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#101010] mb-3 border-l-2 border-[#E50914] pl-2">
                  Itens e Opcionais
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {vehicle.opcionais.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Descrição */}
            {vehicle.descricao && (
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#101010] mb-2 border-l-2 border-[#E50914] pl-2">
                  Observações do Vendedor
                </h4>
                <p className="text-xs text-[#5F6368] leading-relaxed whitespace-pre-line">
                  {vehicle.descricao}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Price & Action (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Price Box */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <span className="text-xs font-semibold text-[#5F6368] uppercase tracking-wider block">
                {vehicle.isDemoPrice ? 'Valor sob Consulta' : 'Preço à Vista'}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#E50914]">
                  {formatBRL(vehicle.preco)}
                </span>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  onClick={directWhatsapp}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Negociar pelo WhatsApp</span>
                </button>

                <button
                  onClick={shareVehicle}
                  type="button"
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-200"
                >
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Compartilhar Veículo no WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#E5E7EB] text-xs font-semibold">
              <button
                onClick={() => setActiveTab('detalhes')}
                className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                  activeTab === 'detalhes' ? 'border-[#E50914] text-[#E50914]' : 'border-transparent text-[#5F6368] hover:text-[#101010]'
                }`}
              >
                Proposta Rápida
              </button>
              <button
                onClick={() => setActiveTab('simulador')}
                className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                  activeTab === 'simulador' ? 'border-[#E50914] text-[#E50914]' : 'border-transparent text-[#5F6368] hover:text-[#101010]'
                }`}
              >
                Simulador
              </button>
              <button
                onClick={() => setActiveTab('troca')}
                className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                  activeTab === 'troca' ? 'border-[#E50914] text-[#E50914]' : 'border-transparent text-[#5F6368] hover:text-[#101010]'
                }`}
              >
                Avaliar Troca
              </button>
            </div>

            {/* Tab: Simulador */}
            {activeTab === 'simulador' && (
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#101010]">
                  <Calculator className="w-4 h-4 text-[#E50914]" />
                  <span>Calculadora de Parcelas</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[#5F6368] mb-1">
                    <span>Valor de Entrada:</span>
                    <strong className="text-[#101010] font-bold">{formatBRL(downPayment)}</strong>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={preco * 0.8}
                    step={1000}
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full accent-[#E50914] cursor-pointer"
                  />
                </div>

                <div>
                  <span className="text-xs text-[#5F6368] block mb-1.5">Prazo de Pagamento:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[24, 36, 48, 60].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setInstallmentsCount(term)}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${
                          installmentsCount === term
                            ? 'bg-[#E50914] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {term}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-[#E5E7EB] text-center">
                  <span className="text-[11px] text-[#5F6368] block">Estimativa de Parcela Mensal:</span>
                  <span className="text-2xl font-black text-emerald-600 block mt-0.5">
                    {installmentsCount}x de {formatBRL(monthlyInstallment)}
                  </span>
                  <span className="text-[10px] text-[#5F6368] block mt-1">
                    Simulação estimada com taxas a partir de 1,59% a.m. Sujeito à análise de crédito.
                  </span>
                </div>
              </div>
            )}

            {/* Tab: Avaliar Troca */}
            {activeTab === 'troca' && (
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#101010]">
                  <Car className="w-4 h-4 text-[#E50914]" />
                  <span>Dados do seu Seminovo</span>
                </div>
                <input
                  type="text"
                  placeholder="Modelo e versão (ex: Onix 1.0 LT)"
                  value={tradeModel}
                  onChange={(e) => setTradeModel(e.target.value)}
                  className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E50914]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Ano (ex: 2020)"
                    value={tradeYear}
                    onChange={(e) => setTradeYear(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E50914]"
                  />
                  <input
                    type="text"
                    placeholder="KM (ex: 55.000)"
                    value={tradeKm}
                    onChange={(e) => setTradeKm(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>
            )}

            {/* Form de envio */}
            <form onSubmit={handleLeadSubmit} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#101010]">
                {activeTab === 'troca' ? 'Enviar Dados para Avaliação' : activeTab === 'simulador' ? 'Solicitar Aprovação Bancária' : 'Tenho Interesse neste Veículo'}
              </h4>

              {submitSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#101010]">Proposta Enviada com Sucesso!</p>
                  <p className="text-xs text-[#5F6368] mt-1">
                    Abrindo o WhatsApp da consultoria JAPA Intermediações...
                  </p>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E50914]"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Seu WhatsApp (ex: 43 99999-9999)"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E50914]"
                  />
                  <textarea
                    rows={2}
                    placeholder="Mensagem ou dúvidas adicionais"
                    value={leadMsg}
                    onChange={(e) => setLeadMsg(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#E50914]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#E50914] hover:bg-[#B80710] text-white py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isSubmitting ? 'Enviando proposta...' : 'Enviar e Abrir no WhatsApp'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
