import React, { useState } from 'react';
import { Car, DollarSign, CheckCircle2, ArrowRight, ShieldCheck, Upload, X, AlertCircle } from 'lucide-react';

export default function TradeInSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  const [marcaModelo, setMarcaModelo] = useState('');
  const [ano, setAno] = useState('');
  const [km, setKm] = useState('');
  const [precoPretendido, setPrecoPretendido] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [lgpd, setLgpd] = useState(true);
  
  const [fotos, setFotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (fotos.length + files.length > 8) {
      alert('Você pode enviar até 8 fotos no total.');
      return;
    }

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('foto', file);

        const res = await fetch('/api/index.php?endpoint=upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success && data.url) {
          setFotos((prev) => [...prev, data.url]);
        }
      }
    } catch (err) {
      console.error('Erro no upload de fotos:', err);
    } finally {
      setUploading(false);
    }
  };

  const removeFoto = (idx) => {
    setFotos(fotos.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lgpd) {
      setErro('Por favor, aceite os termos de privacidade para continuar.');
      return;
    }
    setErro('');

    // Salvar Lead na API
    try {
      await fetch('/api/index.php?endpoint=leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'avaliacao_troca',
          nome,
          telefone,
          cidade,
          mensagem: `Veículo: ${marcaModelo} | Ano: ${ano} | KM: ${km} | Pretensão: R$ ${precoPretendido} | Obs: ${observacoes} | Fotos: ${fotos.join(', ')}`
        })
      });
    } catch (err) {
      console.warn('Fallback ao registrar lead no banco:', err);
    }

    setSucesso(true);

    const whatsappMsg = encodeURIComponent(
      `Olá Japa Intermediações! Gostaria de uma avaliação para troca/venda do meu veículo:\n\n*Nome:* ${nome}\n*WhatsApp:* ${telefone}\n*Cidade:* ${cidade || 'Não informada'}\n*Veículo:* ${marcaModelo}\n*Ano:* ${ano}\n*KM:* ${km}\n*Preço pretendido:* R$ ${precoPretendido || 'A combinar'}\n*Observações:* ${observacoes || 'Sem observações'}\n\n${fotos.length > 0 ? `*Fotos anexadas (${fotos.length}):*\n` + fotos.map(f => window.location.origin + f).join('\n') : ''}`
    );

    setTimeout(() => {
      window.open(`https://wa.me/5543996437966?text=${whatsappMsg}`, '_blank');
    }, 800);
  };

  return (
    <section id="venda-seu-veiculo" className="py-20 bg-white border-b border-[#E5E7EB] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Coluna Esquerda: Imagem oficial banner-venda-veiculo.webp */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[#E5E7EB] bg-slate-100 group">
              <img
                src="/banner-venda-veiculo.webp"
                alt="Seu usado vale mais na troca - JAPA Intermediações"
                className="w-full h-[380px] sm:h-[450px] object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
                <span className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#E50914] mb-2 shadow-md">
                  Troca com Troco & Compra Direta
                </span>
                <p className="text-base font-semibold drop-shadow-sm">
                  Pagamento à vista via PIX ou avaliação acima da média para seu usado entrar na troca.
                </p>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Texto e Ação */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 text-[#E50914] text-xs font-bold uppercase tracking-wider">
              <Car className="w-4 h-4" />
              <span>Avaliação Transparente</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[#101010] tracking-tight leading-tight">
              Seu usado vale mais na <span className="text-[#E50914]">troca</span>.
            </h2>

            <p className="text-[#5F6368] text-base leading-relaxed">
              Na JAPA Intermediações garantimos uma avaliação justa do seu seminovo, sem burocracia, sem intermediários duvidosos e com a segurança jurídica que você merece.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101010]">Pagamento Imediato via PIX</h4>
                  <p className="text-xs text-[#5F6368] mt-0.5">Validação de laudo rápida e transferência sem enrolação.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101010]">Troca com Troco</h4>
                  <p className="text-xs text-[#5F6368] mt-0.5">Troque por um veículo de menor valor e saia com dinheiro na mão.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101010]">Quitação de Financiamento</h4>
                  <p className="text-xs text-[#5F6368] mt-0.5">Se o seu carro ainda estiver financiado, nós cuidamos da quitação diretamente com o banco.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-bold text-sm sm:text-base transition-colors shadow-md hover:shadow-lg"
              >
                <span>Solicitar avaliação agora</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Completo de Avaliação */}
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
              <span className="text-xs font-bold uppercase tracking-wider text-[#E50914] block">Avaliação Online</span>
              <h3 className="text-xl sm:text-2xl font-black text-[#101010] mt-0.5">
                Venda ou troque seu veículo com a JAPA
              </h3>
              <p className="text-xs sm:text-sm text-[#5F6368] mt-1">
                Preencha os dados abaixo e anexe fotos. Nossa equipe entrará em contato com a melhor proposta do mercado.
              </p>
            </div>

            {sucesso ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-[#101010]">Proposta enviada com sucesso!</h4>
                <p className="text-sm text-[#5F6368]">
                  Estamos abrindo a conversa no WhatsApp para finalizar a sua avaliação. Caso não abra automaticamente, aguarde alguns instantes.
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
                      Seu Nome *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nome completo"
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
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                      Marca, Modelo e Versão *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Corolla XEi 2.0 ou HB20 1.0"
                      value={marcaModelo}
                      onChange={(e) => setMarcaModelo(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                      Sua Cidade
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Londrina - PR"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                      Ano
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 2021/2022"
                      value={ano}
                      onChange={(e) => setAno(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                      KM Atual
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 48.000"
                      value={km}
                      onChange={(e) => setKm(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                      Valor Pretendido
                    </label>
                    <input
                      type="text"
                      placeholder="R$ (opcional)"
                      value={precoPretendido}
                      onChange={(e) => setPrecoPretendido(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                    Observações adicionais (opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Único dono, todas revisões na concessionária, possui arranhão no parachoque..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                {/* Upload de até 8 fotos */}
                <div>
                  <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1.5">
                    Fotos do Veículo (Até 8 fotos)
                  </label>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-2">
                    {fotos.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[#E5E7EB] group">
                        <img src={url} alt="Foto veículo" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFoto(idx)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-[#E50914]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {fotos.length < 8 && (
                      <label className="border-2 border-dashed border-[#E5E7EB] hover:border-[#E50914] rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer bg-[#F7F7F7] hover:bg-red-50 transition-colors">
                        <Upload className="w-5 h-5 text-[#5F6368] mb-1" />
                        <span className="text-[10px] font-bold text-[#5F6368]">Adicionar</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {uploading && <p className="text-xs text-[#E50914] font-medium">Enviando fotos...</p>}
                </div>

                {/* LGPD Consent */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lgpd}
                      onChange={(e) => setLgpd(e.target.checked)}
                      className="mt-1 rounded text-[#E50914] focus:ring-[#E50914]"
                    />
                    <span className="text-xs text-[#5F6368] leading-normal">
                      Concordo com o tratamento dos meus dados para fins de recebimento de contato e proposta de avaliação pela JAPA Intermediações, conforme a LGPD.
                    </span>
                  </label>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full bg-[#E50914] hover:bg-[#B80710] text-white py-3.5 rounded-xl font-bold text-sm tracking-wide transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Enviar para Avaliação</span>
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
