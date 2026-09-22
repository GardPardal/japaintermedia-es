import React, { useState, useMemo } from 'react';
import {
  CircleDollarSign, Plus, Search, Filter, Trash2, Printer, CheckCircle2,
  Calendar, CreditCard, User, Phone, Car, FileText, X, Loader2, ArrowUpRight,
  TrendingUp, ExternalLink
} from 'lucide-react';

const money = (value) => Number(value || 0).toLocaleString('pt-BR', {
  style: 'currency', currency: 'BRL', maximumFractionDigits: 0
});

export default function SalesView({ sales, vehicles, onRefresh, onSaveSale, onDeleteSale }) {
  const [query, setQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [receiptSale, setReceiptSale] = useState(null);
  const [saving, setSaving] = useState(false);

  // Formulário de Nova Venda
  const [form, setForm] = useState({
    veiculoId: '',
    veiculoNome: '',
    veiculoFoto: '',
    clienteNome: '',
    clienteCpf: '',
    clienteTelefone: '',
    valorVenda: '',
    entrada: '',
    formaPagamento: 'Financiamento Bancário',
    vendedor: 'Matheus Japa',
    dataVenda: new Date().toISOString().split('T')[0],
    lucroEstimado: '',
    observacoes: ''
  });

  const availableVehicles = useMemo(() => {
    return vehicles.filter(v => v.status === 'Disponível');
  }, [vehicles]);

  const handleSelectVehicle = (vehicleId) => {
    if (!vehicleId) {
      setForm(prev => ({ ...prev, veiculoId: '', veiculoNome: '', veiculoFoto: '', valorVenda: '' }));
      return;
    }
    const found = vehicles.find(v => String(v.id) === String(vehicleId));
    if (found) {
      setForm(prev => ({
        ...prev,
        veiculoId: found.id,
        veiculoNome: `${found.marca} ${found.modelo} ${found.versao || ''}`.trim(),
        veiculoFoto: found.fotos?.[0] || '/veiculo-sedan.webp',
        valorVenda: found.preco || '',
        lucroEstimado: Math.round(Number(found.preco || 0) * 0.08) // sugestão padrão 8% de margem
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clienteNome || !form.valorVenda) {
      alert('Por favor, informe ao menos o nome do cliente e o valor da venda.');
      return;
    }
    setSaving(true);
    try {
      await onSaveSale({
        ...form,
        valorVenda: Number(form.valorVenda),
        lucroEstimado: Number(form.lucroEstimado || 0)
      });
      setModalOpen(false);
      setForm({
        veiculoId: '',
        veiculoNome: '',
        veiculoFoto: '',
        clienteNome: '',
        clienteCpf: '',
        clienteTelefone: '',
        valorVenda: '',
        entrada: '',
        formaPagamento: 'Financiamento Bancário',
        vendedor: 'Matheus Japa',
        dataVenda: new Date().toISOString().split('T')[0],
        lucroEstimado: '',
        observacoes: ''
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const text = `${s.veiculoNome || ''} ${s.clienteNome || ''} ${s.clienteCpf || ''} ${s.vendedor || ''}`.toLowerCase();
      const matchesQuery = text.includes(query.toLowerCase());
      const matchesPayment = filterPayment === 'todos' || String(s.formaPagamento).toLowerCase().includes(filterPayment.toLowerCase());
      return matchesQuery && matchesPayment;
    });
  }, [sales, query, filterPayment]);

  const totalFaturado = useMemo(() => sales.reduce((acc, s) => acc + (Number(s.valorVenda) || 0), 0), [sales]);
  const totalLucro = useMemo(() => sales.reduce((acc, s) => acc + (Number(s.lucroEstimado) || 0), 0), [sales]);
  const ticketMedio = sales.length > 0 ? Math.round(totalFaturado / sales.length) : 0;

  return (
    <div className="space-y-6">
      {/* MÉTRICAS DE VENDAS */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CircleDollarSign className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Total Faturado</p>
          <p className="mt-0.5 text-2xl font-black text-emerald-700">{money(totalFaturado)}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Car className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Veículos Vendidos</p>
          <p className="mt-0.5 text-2xl font-black text-slate-900">{sales.length} unidades</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <TrendingUp className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Ticket Médio</p>
          <p className="mt-0.5 text-2xl font-black text-slate-900">{money(ticketMedio)}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Lucro Estimado</p>
          <p className="mt-0.5 text-2xl font-black text-purple-700">{money(totalLucro)}</p>
        </div>
      </section>

      {/* BARRA DE AÇÕES E FILTROS */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por cliente, veículo, CPF ou vendedor..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-[#e50914]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <select
              value={filterPayment}
              onChange={e => setFilterPayment(e.target.value)}
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm font-semibold outline-none"
            >
              <option value="todos">Todas formas</option>
              <option value="Financiamento">Financiamento</option>
              <option value="À Vista">À Vista / Pix</option>
              <option value="Troca">Troca + Financiamento</option>
              <option value="Cartão">Cartão de Crédito</option>
            </select>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#e50914] px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-[#bd0710] transition"
          >
            <Plus className="h-4 w-4" />
            Registrar Venda
          </button>
        </div>
      </div>

      {/* LISTA DE VENDAS */}
      {filteredSales.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <CircleDollarSign className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <h3 className="font-black">Nenhuma venda encontrada</h3>
          <p className="mt-1 text-sm text-slate-500">Registre sua primeira venda clicando no botão acima.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredSales.map((sale) => {
            const rawPhone = String(sale.clienteTelefone || '').replace(/\D/g, '');
            const waLink = rawPhone ? `https://wa.me/55${rawPhone}` : null;
            const dataFmt = sale.dataVenda ? new Date(sale.dataVenda).toLocaleDateString('pt-BR') : 'Data não informada';

            return (
              <article
                key={sale.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between transition hover:shadow-md"
              >
                {/* Lado Esquerdo: Veículo e Foto */}
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={sale.veiculoFoto || '/veiculo-sedan.webp'}
                    alt=""
                    className="h-14 w-20 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-black text-base text-slate-900">{sale.veiculoNome}</h3>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700">
                        Vendido
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Cliente: <strong className="text-slate-800">{sale.clienteNome}</strong>
                      {sale.clienteCpf && ` • CPF: ${sale.clienteCpf}`}
                      {` • Vendedor: ${sale.vendedor || 'JAPA'}`}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Data da venda: {dataFmt} • Pagamento: <span className="font-semibold text-slate-700">{sale.formaPagamento}</span>
                    </p>
                  </div>
                </div>

                {/* Lado Direito: Valores e Ações */}
                <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:justify-end">
                  <div className="text-left sm:text-right">
                    <p className="text-base font-black text-slate-900">{money(sale.valorVenda)}</p>
                    {sale.lucroEstimado > 0 && (
                      <p className="text-[11px] font-bold text-emerald-600">Lucro: +{money(sale.lucroEstimado)}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition"
                        title="Conversar com o comprador no WhatsApp"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}

                    <button
                      onClick={() => setReceiptSale(sale)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-100 transition"
                      title="Gerar e imprimir recibo / termo de entrega"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Recibo
                    </button>

                    <button
                      onClick={() => onDeleteSale(sale)}
                      className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-600 hover:text-white transition"
                      title="Cancelar ou estornar registro de venda"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* MODAL REGISTRAR NOVA VENDA */}
      {modalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#e50914]">Concretização</p>
                <h2 className="text-xl font-black">Registrar Nova Venda</h2>
                <p className="text-xs text-slate-500 mt-0.5">O veículo selecionado terá seu status alterado para 'Vendido'.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-200 p-2">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Seleção do Veículo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Veículo do Estoque
                </label>
                <select
                  value={form.veiculoId}
                  onChange={e => handleSelectVehicle(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#e50914]"
                >
                  <option value="">-- Selecionar veículo do estoque disponível --</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.marca} {v.modelo} {v.versao} ({v.anoModelo}) • {money(v.preco)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Se for veículo avulso / digitado */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nome do Veículo
                  </label>
                  <input
                    required
                    value={form.veiculoNome}
                    onChange={e => setForm(prev => ({ ...prev, veiculoNome: e.target.value }))}
                    placeholder="Ex: Toyota Corolla 2.0 XEi"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#e50914]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Valor Final Negociado (R$)
                  </label>
                  <input
                    required
                    type="number"
                    value={form.valorVenda}
                    onChange={e => setForm(prev => ({ ...prev, valorVenda: e.target.value }))}
                    placeholder="Ex: 89900"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold text-emerald-700 outline-none focus:border-[#e50914]"
                  />
                </div>
              </div>

              {/* Dados do Comprador */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">Dados do Comprador</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <span className="block text-xs font-semibold text-slate-600 mb-1">Nome Completo</span>
                    <input
                      required
                      value={form.clienteNome}
                      onChange={e => setForm(prev => ({ ...prev, clienteNome: e.target.value }))}
                      placeholder="Ex: João da Silva"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e50914]"
                    />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-600 mb-1">CPF / Documento</span>
                    <input
                      value={form.clienteCpf}
                      onChange={e => setForm(prev => ({ ...prev, clienteCpf: e.target.value }))}
                      placeholder="000.000.000-00"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e50914]"
                    />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-600 mb-1">Telefone / WhatsApp</span>
                    <input
                      value={form.clienteTelefone}
                      onChange={e => setForm(prev => ({ ...prev, clienteTelefone: e.target.value }))}
                      placeholder="(43) 99999-9999"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e50914]"
                    />
                  </div>
                </div>
              </div>

              {/* Condições de Pagamento */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Forma de Pagamento
                  </label>
                  <select
                    value={form.formaPagamento}
                    onChange={e => setForm(prev => ({ ...prev, formaPagamento: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                  >
                    <option value="Financiamento Bancário">Financiamento Bancário</option>
                    <option value="À Vista (Pix / TED)">À Vista (Pix / TED)</option>
                    <option value="Troca + Financiamento">Troca + Financiamento</option>
                    <option value="Troca com Troco">Troca com Troco</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Vendedor Responsável
                  </label>
                  <input
                    value={form.vendedor}
                    onChange={e => setForm(prev => ({ ...prev, vendedor: e.target.value }))}
                    placeholder="Ex: Matheus Japa"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lucro Estimado (R$)
                  </label>
                  <input
                    type="number"
                    value={form.lucroEstimado}
                    onChange={e => setForm(prev => ({ ...prev, lucroEstimado: e.target.value }))}
                    placeholder="Ex: 6500"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none font-semibold text-purple-700"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Observações e Condições do Negócio
                </label>
                <textarea
                  rows={2}
                  value={form.observacoes}
                  onChange={e => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Ex: Entrada de R$ 20.000 via Pix + restante em 48x. Laudo cautelar entregue."
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#e50914]"
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e50914] px-6 py-2.5 text-xs font-black text-white hover:bg-[#bd0710] shadow-md shadow-red-200"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Concluir Registro de Venda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE RECIBO / COMPROVANTE */}
      {receiptSale && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:p-0 print:bg-white">
          <div className="max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl print:max-h-none print:shadow-none print:border-none print:p-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <img src="/logo-japa.png" alt="JAPA Intermediações" className="h-10 object-contain" />
                <div>
                  <h3 className="font-black text-base text-slate-900">JAPA INTERMEDIAÇÕES</h3>
                  <p className="text-[11px] text-slate-500">CNPJ: 48.650.390/0001-71 • Wenceslau Braz - PR</p>
                </div>
              </div>
              <button
                onClick={() => setReceiptSale(null)}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 print:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-center mb-6">
              <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700">
                Comprovante de Venda & Entrega
              </span>
              <p className="text-xs text-slate-400 mt-1">Identificador: #{receiptSale.id}</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                <p className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Dados do Comprador</p>
                <p><strong>Nome:</strong> {receiptSale.clienteNome}</p>
                {receiptSale.clienteCpf && <p><strong>CPF:</strong> {receiptSale.clienteCpf}</p>}
                {receiptSale.clienteTelefone && <p><strong>Telefone:</strong> {receiptSale.clienteTelefone}</p>}
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                <p className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Veículo Negociado</p>
                <p><strong>Modelo:</strong> {receiptSale.veiculoNome}</p>
                <p><strong>Valor Total da Venda:</strong> <span className="font-black text-sm text-slate-900">{money(receiptSale.valorVenda)}</span></p>
                <p><strong>Forma de Pagamento:</strong> {receiptSale.formaPagamento}</p>
                <p><strong>Data:</strong> {new Date(receiptSale.dataVenda).toLocaleDateString('pt-BR')}</p>
                {receiptSale.observacoes && <p><strong>Observações:</strong> {receiptSale.observacoes}</p>}
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-900 text-[11px] leading-relaxed">
                <strong>Termo de Garantia:</strong> Veículo entregue revisado com garantia legal de 90 dias para motor e câmbio nos termos do art. 26 do Código de Defesa do Consumidor.
              </div>

              <div className="grid grid-cols-2 gap-6 pt-8 mt-8 border-t border-slate-200 text-center">
                <div>
                  <div className="border-b border-slate-300 mb-1 pb-4"></div>
                  <p className="font-bold text-slate-700">JAPA Intermediações</p>
                  <p className="text-[10px] text-slate-400">Vendedor: {receiptSale.vendedor || 'Diretoria'}</p>
                </div>
                <div>
                  <div className="border-b border-slate-300 mb-1 pb-4"></div>
                  <p className="font-bold text-slate-700">{receiptSale.clienteNome}</p>
                  <p className="text-[10px] text-slate-400">Comprador</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-2 border-t border-slate-100 pt-4 print:hidden">
              <button
                onClick={() => setReceiptSale(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-700"
              >
                Fechar
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-black text-white hover:bg-black"
              >
                <Printer className="h-4 w-4" />
                Imprimir Recibo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
