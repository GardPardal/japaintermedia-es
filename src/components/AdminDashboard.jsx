import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Plus, Edit3, Trash2, Check, RefreshCw, DollarSign, 
  Car, Users, Link2, Copy, ExternalLink, CheckCircle2, 
  AlertCircle, ShieldCheck, Search, Filter, Save, Info, Radio, LogOut,
  UploadCloud, Image, ArrowUp, Star, Loader2
} from 'lucide-react';

export default function AdminDashboard({ onClose, onVehicleUpdated, onLogout }) {
  const [adminTab, setAdminTab] = useState('estoque'); // 'estoque' | 'leads' | 'integracoes'
  const [vehicles, setVehicles] = useState([]);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');

  // Quick edit price state
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editPriceValue, setEditPriceValue] = useState('');
  const [editIsDemo, setEditIsDemo] = useState(false);

  // Edit / Add vehicle modal
  const [modalVehicleOpen, setModalVehicleOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);

  // Copy feedback
  const [copiedKey, setCopiedKey] = useState('');

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [vRes, lRes, sRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/leads'),
        fetch('/api/stats')
      ]);
      const vData = await vRes.json();
      const lData = await lRes.json();
      const sData = await sRes.json();

      setVehicles(vData.vehicles || []);
      setLeads(lData.leads || []);
      setStats(sData);
    } catch (err) {
      console.error('Erro ao carregar dados do admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Quick price save
  const handleQuickPriceSave = async (id) => {
    try {
      const res = await fetch(`/api/vehicles/${id}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preco: Number(editPriceValue),
          isDemoPrice: editIsDemo
        })
      });
      if (res.ok) {
        setEditingPriceId(null);
        await fetchAllData();
        if (onVehicleUpdated) onVehicleUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick remove demo flag and confirm real price
  const handleConfirmRealPrice = async (vehicle) => {
    const newPrice = prompt(`Informe o valor real para o ${vehicle.marca} ${vehicle.modelo} (atualmente R$ ${vehicle.preco}):`, vehicle.preco);
    if (newPrice && !isNaN(Number(newPrice))) {
      try {
        await fetch(`/api/vehicles/${vehicle.id}/price`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preco: Number(newPrice),
            isDemoPrice: false
          })
        });
        await fetchAllData();
        if (onVehicleUpdated) onVehicleUpdated();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Delete vehicle
  const handleDeleteVehicle = async (id, name) => {
    if (confirm(`Tem certeza que deseja excluir o veículo ${name} do estoque?`)) {
      try {
        const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
        if (res.ok) {
          await fetchAllData();
          if (onVehicleUpdated) onVehicleUpdated();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Status toggle
  const handleStatusChange = async (vehicle, newStatus) => {
    try {
      await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vehicle, status: newStatus })
      });
      await fetchAllData();
      if (onVehicleUpdated) onVehicleUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  // Webmotors toggle
  const handleWebmotorsToggle = async (vehicle) => {
    try {
      await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vehicle, webmotorsSync: !vehicle.webmotorsSync })
      });
      await fetchAllData();
      if (onVehicleUpdated) onVehicleUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  // Lead status toggle
  const handleLeadStatusChange = async (id, newStatus) => {
    try {
      await fetch(`/api/leads/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Copy to clipboard
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  // Format currency
  const formatBRL = (val) => {
    return Number(val || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    });
  };

  // Filtered vehicles
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'todos' || v.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#0B0F13] border-b border-brenza-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10 bg-black p-0.5">
            <img src="/logo.jpg" alt="Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white uppercase tracking-wider">
                Painel de Gestão e Integrações
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brenza-red text-white uppercase">
                Administrador
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Japa Intermediações • Estoque, Preços e Feeds Webmotors
            </p>
          </div>
        </div>

        {/* Tab Switcher & Close */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex bg-[#161D26] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setAdminTab('estoque')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                adminTab === 'estoque' ? 'bg-brenza-red text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Estoque de Veículos
            </button>
            <button
              onClick={() => setAdminTab('leads')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                adminTab === 'leads' ? 'bg-brenza-red text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Propostas e Leads</span>
              {stats?.leadsNovos > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-black text-[10px] font-black">
                  {stats.leadsNovos}
                </span>
              )}
            </button>
            <button
              onClick={() => setAdminTab('integracoes')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                adminTab === 'integracoes' ? 'bg-brenza-red text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Conexão Webmotors & APIs</span>
            </button>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-950/70 text-slate-400 hover:text-rose-300 text-xs font-medium transition-colors border border-white/5 hover:border-rose-500/30"
            title="Sair da conta administrativa"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Fechar Painel"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Mobile Tab Switcher */}
        <div className="sm:hidden flex bg-[#161D26] p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setAdminTab('estoque')}
            className={`flex-1 py-2 rounded-lg font-bold text-center ${adminTab === 'estoque' ? 'bg-brenza-red text-white' : 'text-slate-400'}`}
          >
            Estoque
          </button>
          <button
            onClick={() => setAdminTab('leads')}
            className={`flex-1 py-2 rounded-lg font-bold text-center ${adminTab === 'leads' ? 'bg-brenza-red text-white' : 'text-slate-400'}`}
          >
            Propostas ({stats?.leadsNovos || 0})
          </button>
          <button
            onClick={() => setAdminTab('integracoes')}
            className={`flex-1 py-2 rounded-lg font-bold text-center ${adminTab === 'integracoes' ? 'bg-brenza-red text-white' : 'text-slate-400'}`}
          >
            Integrações
          </button>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#121820] border border-white/5 p-4 rounded-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Veículos em Estoque</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-white">{stats.totalEstoque}</span>
                <span className="text-xs text-emerald-400 font-semibold">({stats.disponiveis} ativos)</span>
              </div>
            </div>

            <div className="bg-[#121820] border border-white/5 p-4 rounded-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Valor Total do Estoque</span>
              <div className="mt-1">
                <span className="text-xl font-black text-emerald-400">{formatBRL(stats.valorTotalEstoque)}</span>
              </div>
            </div>

            <div className="bg-[#121820] border border-white/5 p-4 rounded-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Preço Médio de Venda</span>
              <div className="mt-1">
                <span className="text-xl font-black text-white">{formatBRL(stats.precoMedio)}</span>
              </div>
            </div>

            <div className="bg-[#121820] border border-white/5 p-4 rounded-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Valores Demonstrativos</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-400">{stats.demoPrices}</span>
                <span className="text-xs text-slate-400">para ajustar</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: ESTOQUE */}
        {adminTab === 'estoque' && (
          <div className="space-y-4">
            {/* Filter and Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#121820] p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Filtrar por modelo, marca ou código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#18202A] border border-white/10 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-brenza-red"
                  />
                </div>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-[#18202A] border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brenza-red"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="Disponível">Disponível</option>
                  <option value="Reservado">Reservado</option>
                  <option value="Vendido">Vendido</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={fetchAllData}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10"
                  title="Atualizar lista"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setCurrentVehicle(null);
                    setModalVehicleOpen(true);
                  }}
                  className="bg-brenza-red hover:bg-brenza-redHover text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Veículo</span>
                </button>
              </div>
            </div>

            {/* Notice about Demo Prices */}
            {stats?.demoPrices > 0 && (
              <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between text-xs text-amber-200">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    Existem <strong>{stats.demoPrices} veículos</strong> marcados com valor de demonstração. Você pode clicar no botão <strong>"Definir Preço Real"</strong> na tabela para ajustar o preço definitivo.
                  </span>
                </div>
              </div>
            )}

            {/* Vehicles Table */}
            <div className="bg-[#121820] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#18202A] text-slate-400 font-bold uppercase tracking-wider border-b border-white/5">
                    <tr>
                      <th className="py-3.5 px-4">Veículo</th>
                      <th className="py-3.5 px-4">Ano/KM</th>
                      <th className="py-3.5 px-4">Preço (Editar no Backend)</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Webmotors</th>
                      <th className="py-3.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {filteredVehicles.map((vehicle) => {
                      const isEditingThis = editingPriceId === vehicle.id;

                      return (
                        <tr key={vehicle.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Col 1: Photo & Names */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={vehicle.fotos && vehicle.fotos[0] ? vehicle.fotos[0] : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'}
                                alt=""
                                className="w-12 h-9 object-cover rounded-lg bg-black flex-shrink-0 border border-white/10"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <strong className="text-white font-bold text-sm">
                                    {vehicle.marca} {vehicle.modelo}
                                  </strong>
                                  <span className="text-[10px] text-slate-500 font-mono">#{vehicle.id}</span>
                                </div>
                                <span className="text-slate-400 text-[11px] block">{vehicle.versao}</span>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Ano / KM */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="text-white font-medium">{vehicle.anoFabricacao}/{vehicle.anoModelo}</span>
                            <span className="text-slate-400 block text-[11px]">{Number(vehicle.km || 0).toLocaleString('pt-BR')} km</span>
                          </td>

                          {/* Col 3: Price & Instant Price Change */}
                          <td className="py-3.5 px-4">
                            {isEditingThis ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={editPriceValue}
                                  onChange={(e) => setEditPriceValue(e.target.value)}
                                  className="w-28 bg-[#18202A] border border-brenza-red text-white text-xs rounded px-2 py-1 focus:outline-none"
                                />
                                <label className="flex items-center gap-1 text-[11px] text-slate-400">
                                  <input
                                    type="checkbox"
                                    checked={editIsDemo}
                                    onChange={(e) => setEditIsDemo(e.target.checked)}
                                    className="accent-brenza-red"
                                  />
                                  Demo
                                </label>
                                <button
                                  onClick={() => handleQuickPriceSave(vehicle.id)}
                                  className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                                  title="Salvar preço"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingPriceId(null)}
                                  className="p-1.5 rounded bg-white/10 text-slate-400 hover:text-white"
                                  title="Cancelar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div>
                                  <span className="text-sm font-black text-white block">
                                    {formatBRL(vehicle.preco)}
                                  </span>
                                  {vehicle.isDemoPrice && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                                      <Info className="w-2.5 h-2.5" />
                                      Demonstração
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setEditingPriceId(vehicle.id);
                                    setEditPriceValue(vehicle.preco);
                                    setEditIsDemo(Boolean(vehicle.isDemoPrice));
                                  }}
                                  className="p-1 text-slate-400 hover:text-brenza-red transition-colors"
                                  title="Editar Preço"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {vehicle.isDemoPrice && (
                                  <button
                                    onClick={() => handleConfirmRealPrice(vehicle)}
                                    className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold tracking-wider transition-all"
                                    title="Tirar de demonstração e fixar valor real"
                                  >
                                    Definir Preço Real
                                  </button>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Col 4: Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <select
                              value={vehicle.status}
                              onChange={(e) => handleStatusChange(vehicle, e.target.value)}
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                                vehicle.status === 'Disponível'
                                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                                  : vehicle.status === 'Reservado'
                                  ? 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                                  : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              <option value="Disponível">Disponível</option>
                              <option value="Reservado">Reservado</option>
                              <option value="Vendido">Vendido</option>
                            </select>
                          </td>

                          {/* Col 5: Webmotors */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleWebmotorsToggle(vehicle)}
                              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                                vehicle.webmotorsSync !== false
                                  ? 'bg-blue-950/80 text-blue-300 border border-blue-500/30 hover:bg-blue-900/80'
                                  : 'bg-white/5 text-slate-500 border border-white/5 hover:text-slate-300'
                              }`}
                              title="Alternar sincronização no feed da Webmotors"
                            >
                              {vehicle.webmotorsSync !== false ? 'Sincronizado' : 'Pausado'}
                            </button>
                          </td>

                          {/* Col 6: Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setCurrentVehicle(vehicle);
                                  setModalVehicleOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                                title="Editar dados completos"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteVehicle(vehicle.id, `${vehicle.marca} ${vehicle.modelo}`)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                                title="Excluir do estoque"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEADS E PROPOSTAS */}
        {adminTab === 'leads' && (
          <div className="space-y-4">
            <div className="bg-[#121820] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Caixa de Entrada de Propostas e Simulações
                </h3>
                <p className="text-xs text-slate-400">
                  Leads gerados pelos formulários do site e calculadora de financiamento.
                </p>
              </div>
              <button
                onClick={fetchAllData}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {leads.length === 0 ? (
                <div className="bg-[#121820] p-12 text-center rounded-2xl border border-white/5 text-slate-400 text-xs">
                  Nenhuma proposta recebida até o momento.
                </div>
              ) : (
                leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-[#121820] p-5 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          lead.tipo === 'financiamento' ? 'bg-blue-950 text-blue-400 border border-blue-500/30' :
                          lead.tipo === 'avaliacao_troca' ? 'bg-amber-950 text-amber-400 border border-amber-500/30' :
                          'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {lead.tipo === 'financiamento' ? 'Financiamento' : lead.tipo === 'avaliacao_troca' ? 'Troca de Carro' : 'Proposta Direta'}
                        </span>
                        <strong className="text-sm font-bold text-white">{lead.nome}</strong>
                        <span className="text-slate-500 text-xs">• {new Date(lead.data).toLocaleString('pt-BR')}</span>
                      </div>

                      <div className="text-xs text-slate-300">
                        <span className="font-semibold text-brenza-red">{lead.veiculoNome || 'Geral'}</span>
                        {lead.mensagem && <p className="text-slate-400 mt-0.5 italic">"{lead.mensagem}"</p>}
                      </div>

                      {lead.veiculoTroca && (
                        <div className="text-[11px] text-amber-300 bg-amber-950/40 px-2 py-1 rounded inline-block">
                          Carro na troca: {lead.veiculoTroca.modelo} ({lead.veiculoTroca.ano}) - {lead.veiculoTroca.km} km
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={lead.status}
                        onChange={(e) => handleLeadStatusChange(lead.id, e.target.value)}
                        className="bg-[#18202A] border border-white/10 text-xs text-slate-200 rounded-lg px-2.5 py-1.5"
                      >
                        <option value="Novo">Novo</option>
                        <option value="Em Atendimento">Em Atendimento</option>
                        <option value="Concluído">Concluído</option>
                      </select>

                      <a
                        href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(lead.nome)},%20recebemos%20sua%20proposta%20na%20Japa%20Intermediações%20sobre%20o%20${encodeURIComponent(lead.veiculoNome || 'veículo')}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: INTEGRAÇÕES WEBMOTORS E APIS */}
        {adminTab === 'integracoes' && (
          <div className="space-y-6">
            <div className="bg-[#121820] p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-base uppercase tracking-wider">
                <Link2 className="w-5 h-5 text-brenza-red" />
                <span>Central de Conexão com Portais Automotivos</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                A Japa Intermediações possui endpoints prontos para fornecer estoque automaticamente para a <strong>Webmotors (Cockpit / Integra Fácil)</strong>, <strong>iCarros</strong>, <strong>Mobiauto</strong>, <strong>OLX</strong> e integradores de estoque multimarcas. Copie as URLs abaixo e insira no painel do seu integrador parceiro.
              </p>
            </div>

            {/* Endpoints Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Webmotors XML */}
              <div className="bg-[#121820] p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Feed Webmotors (Padrão XML)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                    Ativo
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Exporta estoque ativo com especificações completas exigidas pela Webmotors (marca, modelo, versão, opcionais e fotos).
                </p>
                <div className="bg-[#18202A] p-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                  <code className="text-xs text-slate-300 font-mono truncate">
                    {window.location.origin}/api/integrations/webmotors/feed.xml
                  </code>
                  <button
                    onClick={() => handleCopy(`${window.location.origin}/api/integrations/webmotors/feed.xml`, 'wm-xml')}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors flex-shrink-0"
                    title="Copiar URL"
                  >
                    {copiedKey === 'wm-xml' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="pt-1">
                  <a
                    href="/api/integrations/webmotors/feed.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brenza-red hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Visualizar XML no navegador</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Webmotors JSON */}
              <div className="bg-[#121820] p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    API REST Webmotors (JSON Feed)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 text-[10px] font-bold">
                    REST API
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Estrutura JSON veloz para sincronização com CRMs automotivos modernos e plataformas mobile.
                </p>
                <div className="bg-[#18202A] p-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                  <code className="text-xs text-slate-300 font-mono truncate">
                    {window.location.origin}/api/integrations/webmotors/feed.json
                  </code>
                  <button
                    onClick={() => handleCopy(`${window.location.origin}/api/integrations/webmotors/feed.json`, 'wm-json')}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors flex-shrink-0"
                    title="Copiar URL"
                  >
                    {copiedKey === 'wm-json' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="pt-1">
                  <a
                    href="/api/integrations/webmotors/feed.json"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Abrir JSON no navegador</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* iCarros Feed */}
              <div className="bg-[#121820] p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Feed iCarros (Carga XML)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                    Compatível
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Compatível com o layout de carga do iCarros e integradores multi-portal.
                </p>
                <div className="bg-[#18202A] p-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                  <code className="text-xs text-slate-300 font-mono truncate">
                    {window.location.origin}/api/integrations/icarros/feed.xml
                  </code>
                  <button
                    onClick={() => handleCopy(`${window.location.origin}/api/integrations/icarros/feed.xml`, 'ic-xml')}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors flex-shrink-0"
                  >
                    {copiedKey === 'ic-xml' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* CSV Export */}
              <div className="bg-[#121820] p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Planilha CSV para OLX e Anúncios
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[10px] font-bold">
                    Download
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Baixe todo o estoque em planilha formatada para importação em lote na OLX, Chaves na Mão ou Excel.
                </p>
                <div className="pt-2">
                  <a
                    href="/api/integrations/export/csv"
                    download
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/10"
                  >
                    <span>Baixar Planilha CSV do Estoque</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Webhook Sync documentation */}
            <div className="bg-[#121820] p-6 rounded-2xl border border-white/5 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Webhook de Sincronização Bidirecional
              </h4>
              <p className="text-xs text-slate-300">
                Se você utiliza um sistema de gestão de loja automotiva (ex: Mobiauto, AutoCon, BomControle), utilize o webhook abaixo para enviar atualizações de estoque automaticamente para este site:
              </p>
              <div className="bg-[#0B0F13] p-4 rounded-xl border border-white/10 font-mono text-xs text-slate-300 space-y-2">
                <div><span className="text-emerald-400">POST</span> {window.location.origin}/api/integrations/webhook/sync</div>
                <div><span className="text-slate-500">Header:</span> Authorization: Bearer brenza-key-2026</div>
                <div><span className="text-slate-500">Content-Type:</span> application/json</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT VEHICLE */}
      {modalVehicleOpen && (
        <VehicleFormModal
          vehicle={currentVehicle}
          onClose={() => setModalVehicleOpen(false)}
          onSave={async () => {
            setModalVehicleOpen(false);
            await fetchAllData();
            if (onVehicleUpdated) onVehicleUpdated();
          }}
        />
      )}
    </div>
  );
}

// Vehicle Form Modal Component
function VehicleFormModal({ vehicle, onClose, onSave }) {
  const isEditing = Boolean(vehicle);

  const [formData, setFormData] = useState({
    marca: vehicle?.marca || '',
    modelo: vehicle?.modelo || '',
    versao: vehicle?.versao || '',
    anoFabricacao: vehicle?.anoFabricacao || new Date().getFullYear(),
    anoModelo: vehicle?.anoModelo || new Date().getFullYear(),
    km: vehicle?.km || 0,
    preco: vehicle?.preco || 80000,
    isDemoPrice: vehicle?.isDemoPrice || false,
    cambio: vehicle?.cambio || 'Automático',
    combustivel: vehicle?.combustivel || 'Flex',
    cor: vehicle?.cor || 'Branco',
    portas: vehicle?.portas || 4,
    carroceria: vehicle?.carroceria || 'Sedan',
    finalPlaca: vehicle?.finalPlaca || 0,
    cidade: vehicle?.cidade || 'Wenceslau Braz',
    uf: vehicle?.uf || 'PR',
    status: vehicle?.status || 'Disponível',
    destaque: vehicle?.destaque || false,
    webmotorsSync: vehicle?.webmotorsSync !== undefined ? vehicle.webmotorsSync : true,
    descricao: vehicle?.descricao || '',
    fotosText: (vehicle?.fotos || []).join('\n'),
    opcionaisText: (vehicle?.opcionais || []).join('\n')
  });

  const [fotosList, setFotosList] = useState(vehicle?.fotos || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const fileArray = Array.from(files);
    const newUrls = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgress(`Enviando foto ${i + 1} de ${fileArray.length}...`);
      const bodyFormData = new FormData();
      bodyFormData.append('image', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: bodyFormData
        });
        const data = await res.json();
        if (data.success && (data.url || data.urls)) {
          const added = data.urls || [data.url];
          newUrls.push(...added);
        }
      } catch (err) {
        console.error('Erro no upload da foto:', err);
      }
    }

    if (newUrls.length > 0) {
      setFotosList(prev => [...prev, ...newUrls]);
    }
    setIsUploading(false);
    setUploadProgress('');
  };

  const handleRemovePhoto = (index) => {
    setFotosList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetCoverPhoto = (index) => {
    setFotosList(prev => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
  };

  const handleAddManualUrl = () => {
    if (!manualUrlInput.trim()) return;
    const urls = manualUrlInput.split('\n').map(s => s.trim()).filter(Boolean);
    setFotosList(prev => [...prev, ...urls]);
    setManualUrlInput('');
  };

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalFotos = [...fotosList];
      if (manualUrlInput.trim()) {
        const extra = manualUrlInput.split('\n').map(s => s.trim()).filter(Boolean);
        finalFotos = [...finalFotos, ...extra];
      }

      const payload = {
        ...formData,
        fotos: finalFotos,
        opcionais: formData.opcionaisText.split('\n').map(s => s.trim()).filter(Boolean)
      };

      const url = isEditing ? `/api/vehicles/${vehicle.id}` : '/api/vehicles';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSave();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#141B24] border border-brenza-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-[#1A232E] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            {isEditing ? `Editar Veículo #${vehicle.id}` : 'Cadastrar Novo Veículo no Estoque'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Marca</label>
              <input
                type="text"
                required
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                className="w-full bg-[#1F2937] border border-white/10 text-white rounded-lg p-2 focus:outline-none focus:border-brenza-red"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Modelo</label>
              <input
                type="text"
                required
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                className="w-full bg-[#1F2937] border border-white/10 text-white rounded-lg p-2 focus:outline-none focus:border-brenza-red"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Carroceria</label>
              <select
                value={formData.carroceria}
                onChange={(e) => setFormData({ ...formData, carroceria: e.target.value })}
                className="w-full bg-[#1F2937] border border-white/10 text-white rounded-lg p-2 focus:outline-none focus:border-brenza-red"
              >
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Picape">Picape</option>
                <option value="Hatch">Hatch</option>
                <option value="Cupê">Cupê</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Versão Completa</label>
            <input
              type="text"
              required
              value={formData.versao}
              onChange={(e) => setFormData({ ...formData, versao: e.target.value })}
              className="w-full bg-[#1F2937] border border-white/10 text-white rounded-lg p-2 focus:outline-none focus:border-brenza-red"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Ano Fab.</label>
              <input
                type="number"
                value={formData.anoFabricacao}
                onChange={(e) => setFormData({ ...formData, anoFabricacao: Number(e.target.value) })}
                className="w-full bg-[#1F2937] border border-white/10 text-white rounded-lg p-2 focus:outline-none focus:border-brenza-red"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Ano Mod.</label>
              <input
                type="number"
                value={formData.anoModelo}
                onChange={(e) => setFormData({ ...formData, anoModelo: Number(e.target.value) })}
                className="w-full bg-[#1F2937] border border-white/10 text-white rounded-lg p-2 focus:outline-none focus:border-brenza-red"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">KM Atual</label>
              <input
                type="number"
                value={formData.km}
                onChange={(e) => setFormData({ ...formData, km: Number(e.target.value) })}
                className="w-full bg-[#1F2937] border border-white/10 text-white rounded-lg p-2 focus:outline-none focus:border-brenza-red"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Final da Placa</label>
              <input
                type="number"
                min={0}
                max={9}
                value={formData.finalPlaca}
                onChange={(e) => setFormData({ ...formData, finalPlaca: Number(e.target.value) })}
                className="w-full bg-[#1F2937] border border-white/10 text-white rounded-lg p-2 focus:outline-none focus:border-brenza-red"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Preço de Venda (R$)</label>
              <input
                type="number"
                required
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: Number(e.target.value) })}
                className="w-full bg-[#1F2937] border border-white/10 text-white rounded-lg p-2 focus:outline-none focus:border-brenza-red font-bold text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Câmbio</label>
              <select
                value={formData.cambio}
                onChange={(e) => setFormData({ ...formData, cambio: e.target.value })}
                className="w-full bg-[#1F2937] border border-white/10 text-white rounded-lg p-2 focus:outline-none focus:border-brenza-red"
              >
                <option value="Automático">Automático</option>
                <option value="Manual">Manual</option>
                <option value="CVT">CVT</option>
                <option value="Automatizado">Automatizado</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Combustível</label>
              <select
                value={formData.combustivel}
                onChange={(e) => setFormData({ ...formData, combustivel: e.target.value })}
                className="w-full bg-[#1F2937] border border-white/10 text-white rounded-lg p-2 focus:outline-none focus:border-brenza-red"
              >
                <option value="Flex">Flex</option>
                <option value="Diesel">Diesel</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Elétrico">Elétrico</option>
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4 py-2 border-y border-white/10">
            <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDemoPrice}
                onChange={(e) => setFormData({ ...formData, isDemoPrice: e.target.checked })}
                className="accent-amber-500 w-4 h-4"
              />
              <span>É Valor de Demonstração (Editar depois)</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.destaque}
                onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
                className="accent-brenza-red w-4 h-4"
              />
              <span>Exibir em Destaque no Topo</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.webmotorsSync}
                onChange={(e) => setFormData({ ...formData, webmotorsSync: e.target.checked })}
                className="accent-blue-500 w-4 h-4"
              />
              <span>Sincronizar no Feed da Webmotors</span>
            </label>
          </div>

          {/* Drag and Drop Photos Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-slate-200 font-bold text-xs uppercase tracking-wider">
                  Fotos do Veículo ({fotosList.length})
                </label>
                <span className="text-[11px] text-slate-400">
                  Arraste as fotos para a caixa abaixo. A primeira imagem é a foto de capa do anúncio.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowManualUrl(!showManualUrl)}
                className="text-[11px] text-brenza-red hover:underline font-semibold"
              >
                {showManualUrl ? 'Ocultar Link Manual' : '+ Adicionar Link Manual'}
              </button>
            </div>

            {/* Drag and Drop Box */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2.5 ${
                isDragging 
                  ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]' 
                  : 'border-white/15 bg-[#17202B]/80 hover:bg-[#1A2533] hover:border-brenza-red/50'
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />

              {isUploading ? (
                <div className="py-3 flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-brenza-red animate-spin" />
                  <span className="text-xs font-bold text-white">{uploadProgress || 'Enviando fotos...'}</span>
                  <span className="text-[11px] text-slate-400">Salvando diretamente na sua hospedagem Hostoo</span>
                </div>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-brenza-red group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Arraste e solte as fotos do veículo aqui
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      ou clique para selecionar do seu computador ou celular (PNG, JPG, WebP)
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                    Hospedado direto na sua Hostoo • Sem links externos
                  </span>
                </>
              )}
            </div>

            {/* Manual URL Input (Collapsible) */}
            {showManualUrl && (
              <div className="bg-[#18212D] p-3 rounded-xl border border-white/10 space-y-2">
                <label className="block text-[11px] text-slate-300 font-semibold">
                  Colar URLs externas (uma por linha)
                </label>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={manualUrlInput}
                    onChange={(e) => setManualUrlInput(e.target.value)}
                    placeholder="https://exemplo.com/carro1.jpg"
                    className="flex-1 bg-[#1F2937] border border-white/10 text-white rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-brenza-red"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualUrl}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-xs font-bold h-fit self-end"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            )}

            {/* Photos Grid Thumbnails */}
            {fotosList.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {fotosList.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden bg-black border border-white/10 aspect-video shadow-md"
                  >
                    <img
                      src={photoUrl}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/logo.jpg'; }}
                    />

                    {/* Cover badge */}
                    {idx === 0 ? (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow">
                        Foto de Capa
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCoverPhoto(idx)}
                        title="Definir como foto de capa"
                        className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded bg-black/80 hover:bg-emerald-600 text-white text-[9px] font-bold"
                      >
                        Tornar Capa
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      title="Excluir foto"
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optionals textarea */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Opcionais e Itens de Série (um por linha)</label>
            <textarea
              rows={3}
              value={formData.opcionaisText}
              onChange={(e) => setFormData({ ...formData, opcionaisText: e.target.value })}
              className="w-full bg-[#1F2937] border border-white/10 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-brenza-red"
              placeholder="Ar-condicionado digital&#10;Central multimídia com Apple CarPlay&#10;Bancos em couro"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Descrição e Observações</label>
            <textarea
              rows={3}
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full bg-[#1F2937] border border-white/10 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-brenza-red"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-brenza-red hover:bg-brenza-redHover text-white font-bold"
            >
              {saving ? 'Salvando...' : isEditing ? 'Atualizar Veículo' : 'Cadastrar Veículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
